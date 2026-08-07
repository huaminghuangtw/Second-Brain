async function createPost(tp) {
    const collection = tp.config.template_file.basename.replace("T_", "");

    // Enoughness posts back both issue numbering and publish-date staggering.
    const posts = collection === "Enoughness"
        ? app.vault.getFiles().filter(
            (f) => f.path.startsWith("Enoughness/posts/") && f.extension === "md"
        )
        : [];

    let title = '';
    if (collection !== "Enoughness" && collection !== "Microblog") {
        const userInput = await tp.system.prompt(`✏️ Title? (${collection})`);
        if (!userInput) return;
        title = tp.user.toTitleCase(userInput);
    }

    let fileName = tp.user.slugify(title);
    const containsChinese = /[\u4e00-\u9fff]/.test(title);
    if (containsChinese) {
        if (collection === "Blog") {
            fileName = tp.date.now("YYYYMMDD");
        } else {
            const userInput = await tp.system.prompt(`📁 Filename? (${collection})`);
            if (!userInput) return;
            fileName = tp.user.slugify(userInput);
        }
    } else if (collection === "Enoughness") {
        fileName = `enoughness-${posts.length + 1}`;
    } else if (collection === "Microblog") {
        fileName = tp.date.now("YYYY-MM-DD");
    } else if (collection === "Drafts") {
        fileName = `_${fileName}`;
    }

    const folderMap = {
        "Permanent-Notes": "Evergreen-Notes/Permanent-Notes/",
        "Drafts": "Drafts/",
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
    }
    tp.user.setViewMode("source");
    await tp.file.move(folder + fileName);

    let created = tp.date.now();
    if (collection === "Enoughness") {
        const dates = [];
        for (const f of posts) {
            const content = await app.vault.cachedRead(f);
            const m = content.match(/^created:\s*(\d{4}-\d{2}-\d{2})/m);
            if (m) dates.push(moment(m[1], "YYYY-MM-DD"));
        }
        const latest = moment.max(dates);
        const upcomingFriday = tp.user.upcomingFriday();
        created = moment.max(upcomingFriday, latest.add(7, "days"));
    }

    return {
        title,
        fileName,
        created: created.format("YYYY-MM-DD"),
    };
}

module.exports = createPost;
