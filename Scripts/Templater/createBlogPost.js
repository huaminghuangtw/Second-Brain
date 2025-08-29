async function createBlogPost(tp) {
    const blog = tp.config.template_file.basename.replace("T_", "");

    let rawTitle = "";
    if (blog === "Notes-to-Self") {
        const files = app.vault
            .getFiles()
            .filter((f) => f.path.startsWith("Notes-to-Self/posts/"))
            .map((f) => f.name.replace(/\.md$/, ""))
            .filter((name) => /^\d{4}-\d{2}-\d{2}$/.test(name))
            .sort();
        let missingDate = null;
        for (let i = 1; i < files.length; i++) {
            const prev = moment(files[i - 1], "YYYY-MM-DD");
            const curr = moment(files[i], "YYYY-MM-DD");
            if (curr.diff(prev, "days") > 1) {
                missingDate = prev.add(1, "days").format("YYYY-MM-DD");
                break;
            }
        }
        if (missingDate) {
            rawTitle = missingDate;
        } else {
            const file = tp.file.find_tfile(
                `Notes-to-Self/posts/${tp.date.now("YYYY-MM-DD")}`
            );
            if (file) {
                rawTitle = moment(files[0], "YYYY-MM-DD")
                    .subtract(1, "days")
                    .format("YYYY-MM-DD");
            } else {
                rawTitle = tp.date.now("YYYY-MM-DD");
            }
        }
    } else {
        rawTitle = await tp.system.prompt("Title?");
        if (!rawTitle) return null;
    }
    let title = tp.user.toTitleCase(rawTitle);

    let rawFileName = "";
    if (blog === "AdaptX") {
        rawFileName = await tp.system.prompt("Filename?");
        if (!rawFileName) return null;
    } else {
        rawFileName = title;
    }
    let fileName = tp.user.slugify(rawFileName);

    const folderMap = {
        "Permanent-Notes": "Evergreen-Notes/Permanent-Notes/",
    };
    const folder = folderMap[blog] || `${blog}/posts/`;
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

    const selectedTags = [];
    if (blog !== "Notes-to-Self") {
        const allTags = Object.keys(app.metadataCache.getTags());
        const blogTags = allTags
            .filter((tag) => tag.startsWith(`#${blog}/`))
            .map((tag) => tag.substring(1));

        let availableTags = [...blogTags];

        while (selectedTags.length < 3) {
            const displayChoices = [
                "✅ Done",
                "🪧 Create new tag",
                ...availableTags.map(
                    (tag) => `🏷️ ${tag.replace(`${blog}/`, "")}`
                ),
            ];
            const valueChoices = [
                "✅ Done",
                "🪧 Create new tag",
                ...availableTags,
            ];
            const selectedTagsText =
                selectedTags.length > 0
                    ? " " +
                      `[${selectedTags
                          .map((tag) =>
                              tp.user.slugify(tag.replace(`${blog}/`, ""))
                          )
                          .join(", ")}]`
                    : "";
            const selectedChoice = await tp.system.suggester(
                displayChoices,
                valueChoices,
                false,
                "🤖 Which one?" + selectedTagsText
            );

            if (!selectedChoice || selectedChoice === "✅ Done") break;

            if (selectedChoice === "🪧 Create new tag") {
                const newTag = await tp.system.prompt("New tag?");
                const fullTagName = newTag.trim().startsWith(`${blog}/`)
                    ? newTag.trim()
                    : `${blog}/${newTag.trim()}`;
                selectedTags.push(fullTagName);
            } else {
                selectedTags.push(selectedChoice);
                availableTags = availableTags.filter(
                    (tag) => tag !== selectedChoice
                );
            }
        }
    }

    const tags =
        selectedTags.length > 0
            ? selectedTags.map((tag) => {
                  const parts = tag.split("/");
                  return `${parts[0]}/${tp.user.slugify(parts[1])}`;
              })
            : [`${blog}/`];

    return {
        title,
        blog,
        tags,
    };
}

module.exports = createBlogPost;
