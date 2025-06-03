class Utils {
    getRandomItem(arr) {
        return arr[Math.floor(Math.random() * arr.length)];
    }

    getAllFilesByExtension(folderPath, fileExtension) {
        const files = app.vault.getFiles();

        return (
            files
                .filter(
                    (file) =>
                        file.path.startsWith(folderPath) &&
                        file.extension === fileExtension
                )
                // Sort the filtered files by name in descending order (Z to A)
                .sort((a, b) => {
                    if (a.name > b.name) return -1;
                    if (a.name < b.name) return 1;
                    return 0;
                })
        );
    }

    toTitleCase(str) {
        return str.replace(/\w\S*/g, function (text) {
            return text.charAt(0).toUpperCase() + text.substr(1).toLowerCase();
        });
    }

    async buildObsidianOpenFileURI(filePath, lineNumber = null) {
        return (
            `obsidian://adv-uri?` +
            `filepath=${encodeURIComponent(filePath)}&` +
            `viewmode=${window.innerWidth > 768 ? "source" : "live"}&` +
            `openmode=true&` +
            `line=${
                lineNumber ||
                (await (async () => {
                    try {
                        const fileContent = await app.vault.read(
                            app.vault.getFileByPath(filePath)
                        );
                        return fileContent.split("\n").length;
                    } catch {
                        return 1;
                    }
                })())
            }&` +
            `commandid=${encodeURIComponent("editor:unfold-all")}`
        );
    }

    async getJournalsURLs(dv, dateFilter) {
        const pages = dv
            .pages('"Daily-Bullet-Journal"')
            .where(dateFilter)
            .sort((p) => p.date, "desc");

        return Promise.all(
            pages.map(async (page) => ({
                url: await this.buildObsidianOpenFileURI(page.file.path),
                page,
            }))
        );
    }

    // https://docs.github.com/en/rest/git/trees?apiVersion=2022-11-28#get-a-tree
    async getRepoTree(repoOwner, repoName) {
        const url = `https://api.github.com/repos/${repoOwner}/${repoName}/git/trees/main?recursive=true`;
        const response = await fetch(url, {
            headers: {
                accept: "application/vnd.github+json",
                "X-GitHub-Api-Version": "2022-11-28",
            }
        });
        return response.json().tree;
    }

    async getFileContent(repoOwner, repoName, filePath) {
        let url = `https://raw.githubusercontent.com/${repoOwner}/${repoName}/main/${filePath}`;
        let response = await fetch(url);
        return response.text();
    }
}
