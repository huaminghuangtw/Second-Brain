#!/bin/bash

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

[ $# -lt 1 ] && echo -e "${YELLOW}Usage: $0 <directory_path_1> [<directory_path_2> <directory_path_3> ...]${NC}" && exit 1

push_branch() {
    local branch
    branch=$(git symbolic-ref --quiet --short HEAD || echo main)
    git push origin "$branch" && return 0
    git pull --rebase --autostash origin "$branch" || {
        git rebase --abort > /dev/null 2>&1
        return 1
    }
    git push origin "$branch"
}

fail=0
index=0

for target in "$@"; do
    index=$((index + 1))
    TARGET_DIR="${target/#\~/$HOME}"

    echo -e "${YELLOW}🔄 (${index} / $#) Backup: $(basename "$TARGET_DIR")...${NC}"

    if [ ! -d "$TARGET_DIR" ]; then
        echo -e "${RED}❌ Error: Directory '$TARGET_DIR' does not exist${NC}"
        fail=1
        continue
    fi

    cd "$TARGET_DIR" 2>/dev/null || {
        echo -e "${RED}❌ Error: Cannot cd to '$TARGET_DIR'${NC}"
        fail=1
        continue
    }

    if [ ! -d ".git" ]; then
        echo -e "${RED}❌ Error: '$TARGET_DIR' is not a git repository${NC}"
        fail=1
        continue
    fi

    obsidian=0
    stats=""

    git rev-parse --verify HEAD > /dev/null 2>&1 && git reset -q

    while IFS= read -r -d '' entry; do
        status_code="${entry:0:2}"
        file_path="${entry:3}"
        [[ "$status_code" == *[RC]* ]] && IFS= read -r -d '' _

        # Committed as one block below instead of one commit per file
        case "$file_path" in
            .obsidian/*|.obsidian-mobile/*) obsidian=1; continue ;;
            "Number of Flows/"*|"Number of Words/"*) [ -z "$stats" ] && stats="$file_path"; continue ;;
        esac

        git add -A -- "$file_path"
        git diff --cached --quiet && continue

        case "$status_code" in
            *[RC]*) action="Rename" ;;
            *D*) action="Delete" ;;
            "??"*|A*) action="Add" ;;
            *) action="Update" ;;
        esac

        git commit -m "$action: $file_path"

        # Ensure the staging area is clean after each commit
        git reset > /dev/null 2>&1
    done < <(git status --porcelain -z)

    if [ "$obsidian" = 1 ]; then
        [ -d ".obsidian" ] && git add -A -- .obsidian
        [ -d ".obsidian-mobile" ] && git add -A -- .obsidian-mobile
        git diff --cached --quiet || git commit -m "Update Obsidian configuration"
    fi

    if [ -n "$stats" ]; then
        [ -d "Number of Flows" ] && git add -A -- "Number of Flows"
        [ -d "Number of Words" ] && git add -A -- "Number of Words"
        year=$(echo "$stats" | cut -d'/' -f2)
        month=$(echo "$stats" | cut -d'/' -f3 | cut -d'-' -f2)
        git diff --cached --quiet || git commit -m "Add stats for $year $month"
    fi

    git add -A
    git diff --cached --quiet || git commit -m "Backup"

    if push_branch; then
        echo -e "${GREEN}✅ $(basename "$TARGET_DIR")${NC}"
    else
        echo -e "${RED}❌ $(basename "$TARGET_DIR")${NC}"
        fail=1
    fi

    echo
done

exit $fail
