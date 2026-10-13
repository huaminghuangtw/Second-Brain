#!/usr/bin/env python3

"""
Upload images and videos from `_attachments` folders to Cloudflare R2

Images are converted to WebP and stored under the `image/` prefix. Videos are
transcoded to MP4 and stored under the `video/` prefix.

Usage:
  python3 path/to/upload-to-r2.py [<path1> <path2> <path3> ...]

  When run from a directory containing `_attachments` folders, 
  `python3 path/to/upload-to-r2.py` with no arguments uses the current directory.
"""

import argparse
import hashlib
import json
import os
import re
import shutil
import sys
import subprocess
import tempfile
from io import BytesIO
from pathlib import Path
from urllib.parse import quote

import boto3
from botocore.config import Config
from PIL import Image, ImageSequence

BUCKET = "huaming-media"
PUBLIC_URL = "https://media.huam.ing"

VIDEO_EXTS = {
    ".mp4", ".m4v", ".mov", ".webm", ".avi", ".mkv", ".ogv", ".3gp",
}

SKIP_DIRS = {
    "/Users/huaminghuang/Library/Mobile Documents/iCloud~md~obsidian/Documents/Second-Brain",
}

CONFIG_PATH = (
    "/Users/huaminghuang/Library/Mobile Documents/com~apple~CloudDocs/Documents/JSONFiles/config.json"
)


def load_credentials(config_path=CONFIG_PATH):
    try:
        with open(config_path, "r", encoding="utf-8") as f:
            config = json.load(f)
        cloudflare = config["API Credentials"]["Cloudflare"]
        return (
            cloudflare["accountID"],
            cloudflare["accessKey"],
            cloudflare["secretKey"],
        )
    except (OSError, KeyError, json.JSONDecodeError) as e:
        log(f"Failed to load credentials from {config_path}: {e}", "err")
        sys.exit(1)


def build_s3_client(account_id, access_key, secret_key):
    return boto3.client(
        "s3",
        endpoint_url=f"https://{account_id}.r2.cloudflarestorage.com",
        aws_access_key_id=access_key,
        aws_secret_access_key=secret_key,
        config=Config(signature_version="s3v4"),
        region_name="auto",
    )


def content_type(ext):
    ext = ext.lower()
    return {
        ".png": "image/png",
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".gif": "image/gif",
        ".webp": "image/webp",
        ".avif": "image/avif",
        ".svg": "image/svg+xml",
        ".mp4": "video/mp4",
        ".m4v": "video/x-m4v",
        ".mov": "video/quicktime",
        ".webm": "video/webm",
        ".avi": "video/x-msvideo",
    }.get(ext, "application/octet-stream")


def media_prefix(filename):
    """R2 key prefix for an attachment: `video` for videos, `image` otherwise."""
    if os.path.splitext(filename)[1].lower() in VIDEO_EXTS:
        return "video"
    return "image"


def file_md5(path, chunk_size=1024 * 1024):
    """Hash a file on disk without loading it into memory."""
    digest = hashlib.md5()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(chunk_size), b""):
            digest.update(chunk)
    return digest.hexdigest()


def is_md5_name(stem):
    return bool(re.fullmatch(r"[0-9a-f]{32}", stem, re.IGNORECASE))


def log(msg, kind="info"):
    prefix = {
        "ok": "✅",
        "warn": "❗",
        "err": "❌",
        "skip": "⏭️",
        "info": "",
    }.get(kind)
    print(f"{prefix} {msg}")


def prompt_continue_or_quit():
    response = input("👉 Press Enter to continue, or 'q' to quit: ")
    if response.lower() == 'q':
        sys.exit(1)


def trash(path):
    """Move a file or directory to the macOS Trash via Finder"""
    abs_path = os.path.abspath(path)
    escaped = abs_path.replace("\\", "\\\\").replace('"', '\\"')
    script = f'tell application "Finder" to delete POSIX file "{escaped}"'
    subprocess.run(["osascript", "-e", script], capture_output=True)


def to_webp(filepath):
    ext = os.path.splitext(filepath)[1].lower()
    if ext not in {".png", ".jpg", ".jpeg", ".gif", ".tiff", ".tif", ".bmp", ".ico"}:
        return None, None

    stem = os.path.splitext(os.path.basename(filepath))[0]

    try:
        with Image.open(filepath) as img:
            if getattr(img, "n_frames", 1) > 1:
                webp_bytes = _to_animated_webp(img)
            else:
                if img.mode in ("RGBA", "LA", "P"):
                    img = img.convert("RGBA")
                else:
                    img = img.convert("RGB")

                buf = BytesIO()
                img.save(buf, format="WEBP")
                webp_bytes = buf.getvalue()

        return webp_bytes, f"{stem}.webp"
    except Exception:
        return None, None


def _to_animated_webp(img):
    """Encode an animated image (e.g. GIF) as an animated WebP, preserving frames."""
    frames = []
    durations = []
    for frame in ImageSequence.Iterator(img):
        durations.append(
            frame.info.get("duration") or img.info.get("duration") or 100)
        frames.append(frame.convert("RGBA"))

    buf = BytesIO()
    frames[0].save(
        buf,
        format="WEBP",
        save_all=True,
        append_images=frames[1:],
        duration=durations,
        loop=img.info.get("loop", 0),
    )
    return buf.getvalue()


def to_mp4(filepath):
    """Transcode a video to MP4."""
    if shutil.which("ffmpeg") is None:
        log("ffmpeg not found — install it with: brew install ffmpeg", "err")
        return None

    fd, tmp_path = tempfile.mkstemp(prefix="upload-to-r2-", suffix=".mp4")
    os.close(fd)

    result = subprocess.run(
        [
            "ffmpeg", "-y", "-v", "error",
            "-i", filepath,
            "-c:v", "libx264", "-crf", "26", "-preset", "veryfast",
            "-vf", "scale='if(gt(iw,ih),min(1920,iw),min(1080,iw))':-2",
            "-c:a", "aac", "-b:a", "128k",
            "-movflags", "+faststart",
            tmp_path,
        ],
        capture_output=True,
        text=True,
    )

    if result.returncode != 0:
        os.remove(tmp_path)
        detail = result.stderr.strip().splitlines()
        log(f"ffmpeg failed: {detail[-1] if detail else 'unknown error'}", "err")
        return None

    return tmp_path


def find_attachment_dirs(root):
    dirs = []
    for dirpath, dirnames, filenames in os.walk(root):
        # Skip hidden directories
        dirnames[:] = [d for d in dirnames if not d.startswith(".")]
        if Path(dirpath).name == "_attachments":
            dirs.append(dirpath)
    return dirs


def find_markdown_files(root):
    files = []
    for dirpath, dirnames, filenames in os.walk(root):
        dirnames[:] = [d for d in dirnames if not d.startswith(
            ".") and d != "_attachments"]
        for f in filenames:
            if f.endswith(".md"):
                files.append(os.path.join(dirpath, f))
    return files


def rewrite_markdown(content, filename, r2_url):
    escaped = re.escape(filename).replace(r"\ ", r"(?:\ |%20)")
    pattern = re.compile(
        rf'!\[\]\(_attachments/{escaped}(?:\s+"([^"]*)")?\s*\)'
    )

    def replacer(match):
        caption = match.group(1)
        if caption is not None:
            return f'![]({r2_url} "{caption}")'
        return f"![]({r2_url})"

    return pattern.sub(replacer, content)


def r2_dashboard_url(account_id, bucket, r2_key):
    """Build the Cloudflare R2 dashboard URL for an object."""
    encoded_key = quote(r2_key, safe="")
    encoded_prefix = quote(f"{Path(r2_key).parent}/", safe="")
    return (
        f"https://dash.cloudflare.com/{account_id}/r2/default/buckets/{bucket}"
        f"/objects/{encoded_key}/details?prefix={encoded_prefix}"
    )


def process_collection(collection_dir, s3, account_id):
    if not os.path.isdir(collection_dir):
        log(f"Directory not found: {collection_dir}", "err")
        return 0, 0, 0

    attach_dirs = find_attachment_dirs(collection_dir)
    if not attach_dirs:
        return 0, 0, 0

    all_files = []
    for d in attach_dirs:
        for entry in os.scandir(d):
            if entry.is_file() and not entry.name.startswith('.'):
                all_files.append(entry.path)

    uploaded = 0
    errors = 0
    rewritten = 0

    for filepath in all_files:
        name = os.path.basename(filepath)
        prefix = media_prefix(name)

        upload_path = filepath
        temp_video = None

        webp_bytes, webp_name = to_webp(filepath)
        if webp_bytes is not None:
            body = webp_bytes
            uploaded_name = webp_name
            ctype = "image/webp"
        elif prefix == "video":
            temp_video = to_mp4(filepath)
            if temp_video is None:
                prompt_continue_or_quit()
                continue
            body = None
            upload_path = temp_video
            uploaded_name = f"{os.path.splitext(name)[0]}.mp4"
            ctype = "video/mp4"
        else:
            body = None
            uploaded_name = name
            ctype = content_type(os.path.splitext(name)[1])

        stem, ext = os.path.splitext(uploaded_name)
        if is_md5_name(stem):
            r2_name = uploaded_name
        elif body is not None:
            r2_name = hashlib.md5(body).hexdigest() + ext
        else:
            r2_name = file_md5(upload_path) + ext

        r2_key = f"{prefix}/{r2_name}"
        r2_url = f"{PUBLIC_URL}/{r2_key}"

        try:
            s3.head_object(Bucket=BUCKET, Key=r2_key)
            label = name if name == r2_name else f"{name} → {r2_name}"
            log(f"{label} (already exists, skipped)\n🔗 {r2_url}", "skip")
            uploaded += 1
        except Exception:
            try:
                if body is not None:
                    # bytes in memory
                    s3.put_object(
                        Bucket=BUCKET,
                        Key=r2_key,
                        Body=body,
                        ContentType=ctype,
                    )
                else:
                    # bytes on disk
                    s3.upload_file(
                        upload_path,
                        BUCKET,
                        r2_key,
                        ExtraArgs={"ContentType": ctype},
                    )
                label = name if name == r2_name else f"{name} → {r2_name}"
                log(f"{label}\n🔗 {r2_url}", "ok")
                uploaded += 1
            except Exception as e:
                log(f"{name} — upload failed: {e}", "err")
                prompt_continue_or_quit()
        finally:
            if temp_video is not None:
                os.remove(temp_video)

        file_rewritten = False
        md_files = find_markdown_files(collection_dir)
        for md_file in md_files:
            with open(md_file, "r", encoding="utf-8") as f:
                content = f.read()
            updated = rewrite_markdown(content, name, r2_url)
            if updated != content:
                with open(md_file, "w", encoding="utf-8") as f:
                    f.write(updated)
                log(
                    f"  ↳ updated reference in {os.path.relpath(md_file, collection_dir)}")
                file_rewritten = True
                rewritten += 1

        if not file_rewritten:
            log(f"No markdown references found for {name}", "warn")
            subprocess.run(["pbcopy"], input=r2_url, text=True)
            subprocess.run(
                ["open", r2_dashboard_url(account_id, BUCKET, r2_key)])
            subprocess.run(["open", r2_url])
            prompt_continue_or_quit()

        trash(filepath)
        log("  ↳ moved to Trash")
        print()

    # Remove empty _attachments directories
    for d in attach_dirs:
        try:
            remaining = [f for f in os.listdir(d) if not f.startswith('.')]
            if not remaining:
                trash(d)
        except OSError:
            pass

    return uploaded, errors, rewritten


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "paths",
        nargs="*",
        help="Directory (or directories) to process; defaults to current directory",
    )
    args = parser.parse_args()

    account_id, access_key, secret_key = load_credentials()
    s3 = build_s3_client(account_id, access_key, secret_key)

    total_uploaded = 0
    total_errors = 0
    total_rewritten = 0

    dir_paths = args.paths or ["."]

    for dir_path in dir_paths:
        resolved = os.path.abspath(dir_path)
        if resolved in SKIP_DIRS:
            continue
        print(f"\n📁 {resolved}\n")
        u, e, r = process_collection(resolved, s3, account_id)
        total_uploaded += u
        total_errors += e
        total_rewritten += r

    print()

    log("─── Summary ───")
    log(f"Uploaded:  {total_uploaded}", "ok")
    log(f"Errors:    {total_errors}", "err" if total_errors > 0 else "ok")
    log(f"Rewrites:  {total_rewritten}", "ok")


if __name__ == "__main__":
    main()
