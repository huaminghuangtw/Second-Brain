#!/usr/bin/env python3

"""
Upload images from `_attachments` folders to Cloudflare R2,
then rewrite markdown references and clean up local files.

Usage:
  python3 upload-to-r2.py <account-id> <access-key> <secret-key> <path1> [<path2> <path3> ...]

What it does:
  1. Walks each given directory to find all `_attachments` subfolders
  2. Converts to WebP
  3. Uploads each file to R2 at `image/{filename.ext}`
  4. Rewrites markdown references:
     ![](_attachments/xxx.png "caption") → ![](https://media.huam.ing/image/xxx.webp "caption")
  5. Moves local attachment files to Trash
"""

import argparse
import hashlib
import os
import re
import sys
import subprocess
from io import BytesIO
from pathlib import Path

import boto3
from botocore.config import Config
from PIL import Image

BUCKET = "huaming-media"
PUBLIC_URL = "https://media.huam.ing"

SKIP_DIRS = {
    "/Users/huaminghuang/Library/Mobile Documents/iCloud~md~obsidian/Documents/Second-Brain",
}

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
        dirnames[:] = [d for d in dirnames if not d.startswith(".") and d != "_attachments"]
        for f in filenames:
            if f.endswith(".md") or f.endswith(".mdx"):
                files.append(os.path.join(dirpath, f))
    return files


def rewrite_markdown(content, filename, r2_url):
    escaped = re.escape(filename)
    pattern = re.compile(
        rf'!\[\]\(_attachments/{escaped}(?:\s+"([^"]*)")?\s*\)'
    )

    def replacer(match):
        caption = match.group(1)
        if caption is not None:
            return f'![]({r2_url} "{caption}")'
        return f"![]({r2_url})"

    return pattern.sub(replacer, content)


def process_collection(collection_dir, s3):
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
            uploaded_name = hashlib.md5(file_content).hexdigest() + os.path.splitext(uploaded_name)[1]

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
            try:
                with open(md_file, "r", encoding="utf-8") as f:
                    content = f.read()
                updated = rewrite_markdown(content, name, r2_url)
                if updated != content:
                    with open(md_file, "w", encoding="utf-8") as f:
                        f.write(updated)
                    log(f"  ↳ updated reference in {os.path.relpath(md_file, collection_dir)}")
                    file_rewritten = True
                    rewritten += 1
            except Exception as e:
                log(f"  ↳ failed to rewrite {md_file}: {e}", "err")
                prompt_continue_or_quit()

        if not file_rewritten:
            log(f"No markdown references found for {name}", "warn")
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
    parser.add_argument("account_id")
    parser.add_argument("access_key")
    parser.add_argument("secret_key")
    parser.add_argument(
        "paths",
        nargs="+",
    )
    args = parser.parse_args()

    s3 = build_s3_client(args.account_id, args.access_key, args.secret_key)

    total_uploaded = 0
    total_errors = 0
    total_rewritten = 0

    for dir_path in args.paths:
        resolved = os.path.abspath(dir_path)
        if resolved in SKIP_DIRS:
            continue
        print(f"\n\n📁 {resolved}\n\n")
        u, e, r = process_collection(resolved, s3)
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
