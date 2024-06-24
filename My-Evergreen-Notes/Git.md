- git grep and  git log -p

# Good Practices
- create/checkout branch → _if not “Nothing to Commit”_ → merge into main branch → delete branch
- `git stash` &rarr; `git pull [origin main]` &rarr; `git stash apply` &rarr; `git add .` &rarr; `git commit`
	- Better than: `git commit` &rarr; `git pull`!
	- `git stash pop` = `git stash apply && git stash drop`
	- Think like this: stash is like merge on the SAME branch