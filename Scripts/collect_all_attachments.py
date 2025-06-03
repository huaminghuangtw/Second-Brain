import os
import shutil
import argparse

image_extensions = ("png", "jpg", "jpeg", "gif", "svg", "webp", "avif", "heic")

def move_attachments(parent_folder):
    attachments_folder = os.path.join(parent_folder, "_attachments")
    os.makedirs(attachments_folder, exist_ok=True)

    for root, _, files in os.walk(parent_folder, followlinks=True):
        if root == attachments_folder:
            continue
        for file in files:
            if file.lower().endswith(image_extensions):
                file_path = os.path.join(root, file)
                target_path = os.path.join(attachments_folder, file)
                try:
                    shutil.move(file_path, target_path)
                except Exception as e:
                    print(f"Error moving {file_path} to {target_path}: {e}")

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('parent_folders', nargs='+')
    args = parser.parse_args()
    
    for folder in args.parent_folders:
        move_attachments(folder)

if __name__ == "__main__":
    main()