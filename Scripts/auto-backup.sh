#!/bin/bash

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

[ $# -lt 1 ] && echo -e "${YELLOW}Usage: $0 <directory_path_1> [<directory_path_2> <directory_path_3> ...]${NC}" && exit 1

total_dir_num=$#

FAILED_REPOS=()

for ((i=1; i<=total_dir_num; i++)); do
    idx="${!i}"
    TARGET_DIR="${idx/#\~/$HOME}"
    
    echo -e "${YELLOW}🔄 (${i} / ${total_dir_num}) Backup: $(basename "$TARGET_DIR")...${NC}"

    if [ ! -d "$TARGET_DIR" ]; then
        echo -e "${RED}❌ Error: Directory '$TARGET_DIR' does not exist${NC}"
        continue
    fi

    cd "$TARGET_DIR" 2>/dev/null || {
        echo -e "${RED}❌ Error: Cannot cd to '$TARGET_DIR'${NC}"
        continue
    }

    if [ ! -d ".git" ]; then
        echo -e "${RED}❌ Error: '$TARGET_DIR' is not a git repository${NC}"
        cd - > /dev/null 2>&1
        continue
    fi

    git status --porcelain | grep -E '\.(md|json|js|sh|py)("?)$' | while IFS= read -r status_line; do
        [ -z "$status_line" ] && continue

        status_code="${status_line:0:2}"
        
        file_path="${status_line:3}"
        # Remove surrounding quotes if present
        file_path="${file_path%\"}"
        file_path="${file_path#\"}"
        # Convert octal-escaped sequences to actual UTF-8 characters
        file_path=$(printf "%b" "$file_path")

        [ ! -f "$file_path" ] && continue
        
        # Handle Obsidian configuration files separately
        [[ "$file_path" =~ ^\.obsidian(-mobile)?/ ]] && continue
        
        # Handle Deep Work Machine files separately
        [[ "$file_path" =~ ^Number\ of\ (Flows|Words)/ ]] && continue
        
        # Handle README.md separately
        [[ "$file_path" == "README.md" ]] && continue
        
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
        year=$(echo "$filepath" | cut -d'/' -f2)
        month=$(echo "$filepath" | cut -d'/' -f3 | cut -d'-' -f2)
        git commit -m "Add stats for $year $month"
    }

    if git diff --cached --name-only | grep -q 'README.md'; then
        git add README.md
        git commit -m "Update: README.md"
    fi

    [ -f "README.md" ] && git update-index --assume-unchanged README.md
    git add -A
    git commit -m "Backup"
    [ -f "README.md" ] && git update-index --no-assume-unchanged README.md

    git push origin main && {
        echo -e "${GREEN}✅ Backup Completed: $(basename "$TARGET_DIR")${NC}"
    } || {
        echo -e "${RED}❌ Backup Failed: $(basename "$TARGET_DIR")${NC}"
        FAILED_REPOS+=("$(basename "$TARGET_DIR")")
    }

    echo
done

if [ ${#FAILED_REPOS[@]} -ne 0 ]; then
    echo -e "\n${RED}🗒️ Summary of failed repos:${NC}"
    for repo in "${FAILED_REPOS[@]}"; do
        echo "• $repo"
    done
else
    echo -e "${GREEN}🎊 All repos backed up successfully!${NC}"
fi
