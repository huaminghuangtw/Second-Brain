#!/usr/bin/env python3

"""
Upload images and videos from `_attachments` folders to Cloudflare R2

Images are converted to WebP and stored under the `image/` prefix. Videos are
transcoded to MP4 and stored under the `video/` prefix. An attachment is only
moved to the Trash — and its note references rewritten — after it uploaded.

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
    prefix = {"ok": "✅", "warn": "❗", "err": "❌", "skip": "⏭️"}.get(kind, "")
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
    """Return WebP bytes for a convertible image, or None for anything else."""
    ext = os.path.splitext(filepath)[1].lower()
    if ext not in {".png", ".jpg", ".jpeg", ".gif", ".tiff", ".tif", ".bmp", ".ico"}:
        return None

    try:
        with Image.open(filepath) as img:
            if getattr(img, "n_frames", 1) > 1:
                return _to_animated_webp(img)

            img = img.convert("RGBA" if img.mode in (
                "RGBA", "LA", "P") else "RGB")
            buf = BytesIO()
            img.save(buf, format="WEBP")
            return buf.getvalue()
    except Exception:
        return None


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
    for dirpath, dirnames, _ in os.walk(root):
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
        suffix = f' "{caption}"' if caption is not None else ""
        return f"![]({r2_url}{suffix})"

    return pattern.sub(replacer, content)


def r2_dashboard_url(account_id, bucket, r2_key):
    """Build the Cloudflare R2 dashboard URL for an object."""
    encoded_key = quote(r2_key, safe="")
    encoded_prefix = quote(f"{Path(r2_key).parent}/", safe="")
    return (
        f"https://dash.cloudflare.com/{account_id}/r2/default/buckets/{bucket}"
        f"/objects/{encoded_key}/details?prefix={encoded_prefix}"
    )


def object_exists(s3, r2_key):
    try:
        s3.head_object(Bucket=BUCKET, Key=r2_key)
        return True
    except Exception:
        return False


def upload_attachment(s3, filepath):
    """Upload one attachment to R2; return `(r2_key, r2_url)`, or None on failure."""
    name = os.path.basename(filepath)
    stem, ext = os.path.splitext(name)
    prefix = media_prefix(name)

    body = None
    upload_path = filepath
    upload_name = name
    temp_video = None

    webp_bytes = to_webp(filepath)
    if webp_bytes is not None:
        body = webp_bytes
        upload_name = f"{stem}.webp"
        ctype = "image/webp"
    elif prefix == "video":
        temp_video = to_mp4(filepath)
        if temp_video is None:
            return None
        upload_path = temp_video
        upload_name = f"{stem}.mp4"
        ctype = "video/mp4"
    else:
        ctype = content_type(ext)

    try:
        r2_stem, r2_ext = os.path.splitext(upload_name)
        if is_md5_name(r2_stem):
            r2_name = upload_name
        elif body is not None:
            r2_name = hashlib.md5(body).hexdigest() + r2_ext
        else:
            r2_name = file_md5(upload_path) + r2_ext

        r2_key = f"{prefix}/{r2_name}"
        r2_url = f"{PUBLIC_URL}/{r2_key}"
        label = name if name == r2_name else f"{name} → {r2_name}"

        if object_exists(s3, r2_key):
            log(f"{label} (already exists, skipped)\n🔗 {r2_url}", "skip")
            return r2_key, r2_url

        if body is not None:
            s3.put_object(Bucket=BUCKET, Key=r2_key,
                          Body=body, ContentType=ctype)
        else:
            s3.upload_file(
                upload_path, BUCKET, r2_key, ExtraArgs={"ContentType": ctype}
            )
        log(f"{label}\n🔗 {r2_url}", "ok")
        return r2_key, r2_url
    except Exception as e:
        log(f"{name} — upload failed: {e}", "err")
        return None
    finally:
        if temp_video is not None:
            os.remove(temp_video)


def rewrite_references(md_files, collection_dir, filename, r2_url):
    """
    Point every `![](_attachments/<filename>)` link at `r2_url`.
    Returns how many markdown files were changed.
    """
    changed = 0
    for md_file in md_files:
        with open(md_file, "r", encoding="utf-8") as f:
            content = f.read()
        updated = rewrite_markdown(content, filename, r2_url)
        if updated != content:
            with open(md_file, "w", encoding="utf-8") as f:
                f.write(updated)
            log(f"  ↳ updated reference in {os.path.relpath(md_file, collection_dir)}")
            changed += 1
    return changed


def process_collection(collection_dir, s3, account_id):
    if not os.path.isdir(collection_dir):
        log(f"Directory not found: {collection_dir}", "err")
        return 0, 1, 0

    attach_dirs = find_attachment_dirs(collection_dir)
    if not attach_dirs:
        return 0, 0, 0

    files = [
        entry.path
        for d in attach_dirs
        for entry in os.scandir(d)
        if entry.is_file() and not entry.name.startswith(".")
    ]
    md_files = find_markdown_files(collection_dir)

    uploaded = errors = rewritten = 0

    for filepath in files:
        name = os.path.basename(filepath)

        result = upload_attachment(s3, filepath)
        if result is None:
            errors += 1
            prompt_continue_or_quit()
            continue

        r2_key, r2_url = result
        uploaded += 1

        count = rewrite_references(md_files, collection_dir, name, r2_url)
        rewritten += count

        if not count:
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
            if not [f for f in os.listdir(d) if not f.startswith(".")]:
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
