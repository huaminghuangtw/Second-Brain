#!/usr/bin/env python3

"""
Upload images from `_attachments` folders to Cloudflare R2

Usage:
  python3 upload-to-r2.py [<path1> <path2> <path3> ...]

  When run from a directory containing `_attachments` folders, 
  `python3 upload-to-r2.py` with no arguments uses the current directory.
"""

import argparse
import hashlib
import json
import os
import re
import sys
import subprocess
from io import BytesIO
from pathlib import Path
from urllib.parse import quote

import boto3
from botocore.config import Config
from PIL import Image, ImageSequence

BUCKET = "huaming-media"
PUBLIC_URL = "https://media.huam.ing"

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
    }.get(ext, "application/octet-stream")


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

        webp_bytes, webp_name = to_webp(filepath)
        if webp_bytes is not None:
            file_content = webp_bytes
            uploaded_name = webp_name
            ctype = "image/webp"
        else:
            ext = os.path.splitext(name)[1]
            ctype = content_type(ext)
            with open(filepath, "rb") as f:
                file_content = f.read()
            uploaded_name = name

        stem = os.path.splitext(uploaded_name)[0]
        if not is_md5_name(stem):
            uploaded_name = hashlib.md5(file_content).hexdigest(
            ) + os.path.splitext(uploaded_name)[1]

        r2_key = f"image/{uploaded_name}"
        r2_url = f"{PUBLIC_URL}/{r2_key}"

        try:
            s3.head_object(Bucket=BUCKET, Key=r2_key)
            label = name if name == uploaded_name else f"{name} → {uploaded_name}"
            log(f"{label} (already exists, skipped)\n🔗 {r2_url}", "skip")
            uploaded += 1
        except Exception:
            try:
                s3.put_object(
                    Bucket=BUCKET,
                    Key=r2_key,
                    Body=file_content,
                    ContentType=ctype,
                )
                label = name if name == uploaded_name else f"{name} → {uploaded_name}"
                log(f"{label}\n🔗 {r2_url}", "ok")
                uploaded += 1
            except Exception as e:
                log(f"{name} — upload failed: {e}", "err")
                prompt_continue_or_quit()

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
            subprocess.run(["open", r2_dashboard_url(account_id, BUCKET, r2_key)])
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
