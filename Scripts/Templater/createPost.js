async function createPost(tp) {
    const collection = tp.config.template_file.basename.replace("T_", "");

    const posts = collection === "Enoughness"
        ? app.vault.getFiles().filter(
            (f) => f.path.startsWith("Enoughness/posts/") && f.extension === "md"
        )
        : [];

    let title = '';
    if (collection !== "Enoughness" && collection !== "Microblog") {
        const userInput = await tp.system.prompt(`✏️ Title? (${collection})`);
        if (!userInput) return;

        if (tp.user.containsChinese(userInput)) {
            title = userInput;
        } else {
            const casings = {
                "Title Case": tp.user.toTitleCase,
                "Sentence Case": tp.user.toSentenceCase,
            };
            const casing = await tp.system.suggester((name) => name, Object.keys(casings), false, "🤖  Which one?");
            if (!casing) return;

            title = casings[casing](userInput);
        }
    }

    let fileName = tp.user.slugify(title);
    const containsChinese = tp.user.containsChinese(title);
    if (collection === "Blog") {
        fileName = tp.date.now("YYYYMMDD");
    } else if (collection === "Enoughness") {
        fileName = `enoughness-${posts.length + 1}`;
    } else if (collection === "Microblog") {
        fileName = tp.date.now("YYYY-MM-DD");
    } else if (collection === "Drafts") {
        fileName = `_${fileName}`;
    } else if (containsChinese) {
        const userInput = await tp.system.prompt(`📁 Filename? (${collection})`);
        if (!userInput) return;
        fileName = tp.user.slugify(userInput);
    }

    const folderMap = {
        "Permanent-Notes": "Evergreen-Notes/Permanent-Notes/",
        "Drafts": "Drafts/",
    };
    const folder = folderMap[collection] || `${collection}/posts/`;
    const file = tp.file.find_tfile(folder + fileName);
    let pickedDate = null;
    if (file) {
        window.open(
            `obsidian://adv-uri?filepath=${encodeURIComponent(
                file.path
            )}&viewmode=source&openmode=true&line=${await (async () =>
                (await app.vault.read(file)).split("\n").length)()}`
        );

        if (collection !== "Blog" && collection !== "Microblog") return;

        while (!pickedDate) {
            let chosen;
            try {
                chosen = await tp.user.datePicker(tp);
            } catch {
                return; // User cancelled the date picker
            }
            if (!chosen) return;

            const candidate =
                collection === "Microblog"
                    ? chosen
                    : chosen.replace(/-/g, "");
            if (tp.file.find_tfile(folder + candidate)) {
                new Notice(
                    `${folder}${candidate} already exists. Pick another date.`
                );
                continue;
            }
            pickedDate = chosen;
            fileName = candidate;
        }
    }
    tp.user.setViewMode("source");
    await tp.file.move(folder + fileName);

    let created = pickedDate
        ? moment(pickedDate, "YYYY-MM-DD")
        : tp.date.now();
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
        created: moment(created).format("YYYY-MM-DD"),
    };
}

module.exports = createPost;
