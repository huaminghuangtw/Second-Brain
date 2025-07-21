#!/bin/bash

usage() {
    echo "Usage: $0 <directory_path>"
    echo "  directory_path: The full path to the directory to backup"
}

if [ $# -lt 1 ]; then
    usage
    exit 1
fi

TARGET_DIR="${1/#\~/$HOME}"

if [ ! -d "$TARGET_DIR" ]; then
    echo "Error: Directory '$TARGET_DIR' does not exist"
    exit 1
fi

cd "$TARGET_DIR"

if [ ! -d ".git" ]; then
    echo "Error: '$TARGET_DIR' is not a git repository"
    exit 1
fi

while IFS= read -r status_line; do
    if [[ -n "$status_line" ]]; then
        status_code="${status_line:0:2}"
        file_path="${status_line:3}"
        
        # Remove quotes if present
        if [[ "$file_path" =~ ^\".*\"$ ]]; then
            file_path="${file_path:1:${#file_path}-2}"
        fi
        
        if [ -f "$file_path" ]; then
            # Handle Obsidian configuration files separately
            if [[ "$file_path" =~ ^\.obsidian(-mobile)?/ ]]; then
                continue
            fi
            
            # Handle Deep Work Machine files separately
            if [[ "$file_path" =~ ^Number\ of\ (Flows|Words)/ ]]; then
                continue
            fi
            
            git add "$file_path"
            
            if [[ "$status_code" =~ ^(\?\?|A) ]]; then
                git commit -m "Add: $(basename "$file_path")"
            else
                git commit -m "Update: $(basename "$file_path")"
            fi

            # Ensure the staging area is clean after each commit
            git reset > /dev/null 2>&1
        fi
    fi
done < <(git status --porcelain | grep -E '\.(md|json|js|sh|py)("?)$')

if git status --porcelain | grep -qE "\.obsidian(-mobile)?/"; then
    git add .obsidian/ .obsidian-mobile/
    git commit -m "Update Obsidian configuration"
fi

if git status --porcelain | grep -qE "Number of (Flows|Words)/"; then
    git add "Number of Flows/" "Number of Words/"
    filepath=$(git status --porcelain | grep -E "Number of (Flows|Words)/" | head -1 | cut -c4-)
    year=$(echo "$filepath" | cut -d'/' -f3)
    month=$(echo "$filepath" | cut -d'/' -f4 | cut -d'-' -f2)
    git commit -m "Add stats for $year $month"
fi

git add -A
git commit -m "Backup"

git push origin main -f