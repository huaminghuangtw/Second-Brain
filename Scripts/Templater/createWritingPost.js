async function createWritingPost(tp) {
    const collection = tp.config.template_file.basename.replace("T_", "");

    const temp = "__temp__" + tp.date.now("YYYY-MM-DD-HH-mm-ss");
    const today = tp.date.now("YYYY-MM-DD");

    let rawTitle;
    if (collection === "Notes-to-Self") {
        rawTitle = today;
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
        rawFileName = tp.user.upcomingFriday().format("YYYY[-week-]ww");
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
        : today;

    return {
        title,
        fileName,
        collection,
        created,
    };
}

module.exports = createWritingPost;
