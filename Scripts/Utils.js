class Utils {
    getRandomItem(arr) {
        return arr[Math.floor(Math.random() * arr.length)];
    }

    getRandomFile(folderPath, predicate) {
        const prefix = `${folderPath}/`;
        const matches = app.vault.getFiles().filter(
            (file) =>
                file.path.startsWith(prefix) &&
                predicate(file, file.path.slice(prefix.length))
        );

        return this.getRandomItem(matches);
    }

    renderEditLink(dv, uri) {
        dv.paragraph(`<div align="right"><a href="${uri}"><sub>Edit</sub></a></div>`);
    }

    async buildObsidianOpenFileURI(filePath, lineNumber = null) {
        return (
            `obsidian://adv-uri?` +
            `filepath=${encodeURIComponent(filePath)}&` +
            `viewmode=source&` +
            `openmode=true&` +
            `line=${lineNumber}`
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
}
