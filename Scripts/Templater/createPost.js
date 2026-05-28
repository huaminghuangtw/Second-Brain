async function createPost(tp) {
    const collection = tp.config.template_file.basename.replace("T_", "");

    let title = '';
    if (collection !== "Enoughness" && collection !== "Microblog") {
        const userInput = await tp.system.prompt("✏️ Title?");
        if (!userInput) return;
        title = tp.user.toTitleCase(userInput);
    }

    let fileName = tp.user.slugify(title);
    const containsChinese = /[\u4e00-\u9fff]/.test(title);
    if (containsChinese) {
        if (collection === "Blog") {
            fileName = tp.date.now("YYYYMMDD");
        } else {
            const userInput = await tp.system.prompt("📁 Filename?");
            if (!userInput) return;
            fileName = tp.user.slugify(userInput);
        }
    } else if (collection === "Enoughness") {
        let issue = app.vault
            .getFiles()
            .filter((f) => f.path.startsWith("Enoughness/posts/") && f.extension === "md")
            .length + 1;
        fileName = `enoughness-${issue}`;
    } else if (collection === "Microblog") {
        fileName = tp.date.now("YYYY-MM-DD");
    }

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

    return {
        title,
        fileName,
        created: created.format("YYYY-MM-DD"),
    };
}

module.exports = createPost;
