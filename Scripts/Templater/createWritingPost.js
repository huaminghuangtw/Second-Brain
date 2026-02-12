async function createWritingPost(tp) {
    const collection = tp.config.template_file.basename.replace("T_", "");

    const temp = "__temp__" + tp.date.now("YYYY-MM-DD-HH-mm-ss");

    let rawTitle;
    if (collection === "Notes-to-Self") {
        const files = app.vault
            .getFiles()
            .filter((f) => f.path.startsWith("Notes-to-Self/posts/"))
            .map((f) => f.name.replace(/\.md$/, ""))
            .filter((name) => /^\d{4}-\d{2}-\d{2}$/.test(name))
            .sort();
        
        for (let i = 1; i < files.length; i++) {
            const prev = moment(files[i - 1], "YYYY-MM-DD");
            const curr = moment(files[i], "YYYY-MM-DD");
            if (curr.diff(prev, "days") > 1) {
                rawTitle = prev.add(1, "days").format("YYYY-MM-DD");
                break;
            }
        }
        if (!rawTitle) {
            const todayExists = tp.file.find_tfile(
                `Notes-to-Self/posts/${tp.date.now("YYYY-MM-DD")}`
            );
            rawTitle = todayExists
                ? moment(files[0], "YYYY-MM-DD").subtract(1, "days").format("YYYY-MM-DD")
                : tp.date.now("YYYY-MM-DD");
        }
    } else if (collection === "Enoughness") {
        rawTitle = temp;
    } else {
        const userInput = await tp.system.prompt("✏️ Title?");
        rawTitle = userInput || temp;
    }
    let title = tp.user.toTitleCase(rawTitle);

    let rawFileName;
    const isChinese = /[\u4e00-\u9fff]/.test(title);
    if (isChinese) {
        const userInput = await tp.system.prompt("📁 Filename?");
        rawFileName = userInput || temp;
    } else if (collection === "Enoughness") {
        rawFileName = (moment().day() <= 5 ? moment().day(5) : moment().add(1, 'week').day(5)).format("YYYY[-week-]ww");
    } else {
        rawFileName = title;
    }
    let fileName = tp.user.slugify(rawFileName);
    
    const folderMap = {
        "Permanent-Notes": "Evergreen-Notes/Permanent-Notes/",
    };
    const folder = folderMap[collection] || `${collection}/posts/`;
    const file = tp.file.find_tfile(folder + fileName);
    if (file) {
        window.open(
            `obsidian://adv-uri?filepath=${encodeURIComponent(
                file.path
            )}&viewmode=source&openmode=true&line=${await (async () =>
                (await app.vault.read(file)).split("\n").length)()}`
        );
        return;
    } else {
        tp.user.setViewMode("source");
        await tp.file.move(folder + fileName);
    }

    return {
        title,
        fileName,
        collection,
    };
}

module.exports = createWritingPost;
