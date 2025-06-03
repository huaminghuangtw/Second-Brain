import os
import sys

def find_markdown_files(root_folder):
    md_files = []
    for dirpath, _, filenames in os.walk(root_folder):
        for filename in filenames:
            if filename.endswith('.md'):
                md_files.append(os.path.join(dirpath, filename))
    return md_files

def clean_yaml_frontmatter(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    if not lines or lines[0].strip() != '---':
        return

    yaml_end_index = None
    for i in range(1, len(lines)):
        if lines[i].strip() == '---':
            yaml_end_index = i
            break

    if yaml_end_index is None:
        return

    cleaned = []
    for line in lines[1:yaml_end_index]:
        if ':' in line:
            key_part, value_part = line.split(':', 1)
            cleaned.append(f"{key_part}:{value_part.rstrip()}\n")
        else:
            cleaned.append(line.rstrip() + '\n')

    new_content = lines[:1] + cleaned + lines[yaml_end_index:]
    with open(file_path, 'w', encoding='utf-8') as f:
        f.writelines(new_content)
    print(f"Cleaned: {file_path}")

def main():
    folder_paths = sys.argv[1:]

    for folder_path in folder_paths:
        if os.path.exists(folder_path) and os.path.isdir(folder_path):
            markdown_files = find_markdown_files(folder_path)
            for md_file in markdown_files:
                clean_yaml_frontmatter(md_file)
        else:
            print(f"Warning: '{folder_path}' is not a valid directory.")

if __name__ == "__main__":
    main()