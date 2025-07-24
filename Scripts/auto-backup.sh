#!/bin/bash

[ $# -lt 1 ] && echo "Usage: $0 <directory_path>" && exit 1

TARGET_DIR="${1/#\~/$HOME}"

[ ! -d "$TARGET_DIR" ] && echo "Error: Directory '$TARGET_DIR' does not exist" && exit 1

cd "$TARGET_DIR"
[ ! -d ".git" ] && echo "Error: '$TARGET_DIR' is not a git repository" && exit 1

git status --porcelain | grep -E '\.(md|json|js|sh|py)("?)$' | while IFS= read -r status_line; do
    [ -z "$status_line" ] && continue
    status_code="${status_line:0:2}"
    file_path="${status_line:3}"
    # Remove surrounding quotes if present
    file_path="${file_path%\"}"
    file_path="${file_path#\"}"
    
    [ ! -f "$file_path" ] && continue
    # Handle Obsidian configuration files separately
    [[ "$file_path" =~ ^\.obsidian(-mobile)?/ ]] && continue
    # Handle Deep Work Machine files separately
    [[ "$file_path" =~ ^Number\ of\ (Flows|Words)/ ]] && continue
    
    git add "$file_path"
    [[ "$status_code" =~ ^(\?\?|A) ]] && git commit -m "Add: $(basename "$file_path")" || git commit -m "Update: $(basename "$file_path")"
    # Ensure the staging area is clean after each commit
    git reset > /dev/null 2>&1
done

git status --porcelain | grep -qE "\.obsidian(-mobile)?/" && {
    [ -d ".obsidian" ] && git add .obsidian/
    [ -d ".obsidian-mobile" ] && git add .obsidian-mobile/
    git commit -m "Update Obsidian configuration"
}

git status --porcelain | grep -qE "Number of (Flows|Words)/" && {
    [ -d "Number of Flows" ] && git add "Number of Flows/"
    [ -d "Number of Words" ] && git add "Number of Words/"
    filepath=$(git status --porcelain | grep -E "Number of (Flows|Words)/" | head -1 | cut -c4-)
    year=$(echo "$filepath" | cut -d'/' -f3)
    month=$(echo "$filepath" | cut -d'/' -f4 | cut -d'-' -f2)
    git commit -m "Add stats for $year $month"
}

git add -A
git commit -m "Backup"

git push origin main