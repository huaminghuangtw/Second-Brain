async function createPost(tp) {
    const collection = tp.config.template_file.basename.replace("T_", "");

    let rawTitle;
    if (collection === "Enoughness") {
        rawTitle = "__temp__" + tp.date.now("YYYY-MM-DD-HH-mm-ss");
    } else if (collection === "Microblog") {
        rawTitle = '';
    } else {
        const userInput = await tp.system.prompt("✏️ Title?");
        if (!userInput) return;
        rawTitle = userInput;
    }
    let title = tp.user.toTitleCase(rawTitle);

    let rawFileName;
    const containsChinese = /[\u4e00-\u9fff]/.test(title);
    if (containsChinese) {
        if (collection === "Blog") {
            rawFileName = tp.date.now("YYYYMMDD");
        } else {
            const userInput = await tp.system.prompt("📁 Filename?");
            if (!userInput) return;
            rawFileName = userInput;
        }
    } else if (collection === "Enoughness") {
        let issue = app.vault
            .getFiles()
            .filter((f) => f.path.startsWith("Enoughness/posts/") && f.extension === "md")
            .length + 1;
        rawFileName = `enoughness-${issue}`;
    } else if (collection === "Microblog") {
        rawFileName = tp.date.now("YYYY-MM-DD");
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

    const created = collection === "Enoughness"
        ? tp.user.upcomingFriday()
        : tp.date.now();

    const canonicalPath = `${created.format("YYYY/M/D")}/${fileName}`;

    return {
        title,
        fileName,
        collection,
        created: created.format("YYYY-MM-DD"),
        canonicalPath,
    };
}

module.exports = createPost;
