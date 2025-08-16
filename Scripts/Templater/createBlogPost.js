async function createBlogPost(tp) {
    const blog = tp.config.template_file.basename.replace("T_", "");

    let rawTitle;
    if (blog === "Notes-to-Self") {
        rawTitle = tp.date.now("YYYY_MM_DD");
    } else {
        rawTitle = await tp.system.prompt("Title?");
        if (!rawTitle) return null;
    }
    const title = tp.user.toTitleCase(rawTitle);

    let rawFileName;
    if (blog === "AdaptX") {
        rawFileName = await tp.system.prompt("Filename?");
        if (!rawFileName) return null;
    } else {
        rawFileName = title;
    }
    const fileName = tp.user.slugify(rawFileName);

    tp.user.setViewMode("source");

    const folderMap = { "Permanent-Notes": `Evergreen-Notes/Permanent-Notes/` };
    const folder = folderMap[blog] || `${blog}/posts/`;
    await tp.file.move(folder + fileName);

    const allTags = Object.keys(app.metadataCache.getTags());
    const blogTags = allTags
        .filter((tag) => tag.startsWith(`#${blog}/`))
        .map((tag) => tag.substring(1));

    const selectedTags = [];
    if (blogTags.length > 0) {
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
                    ? `[${selectedTags
                          .map((tag) =>
                              tp.user.slugify(tag.replace(`${blog}/`, ""))
                          )
                          .join(", ")}]`
                    : "";
            const selectedChoice = await tp.system.suggester(
                displayChoices,
                valueChoices,
                false,
                `Select tags ${selectedTagsText}:`
            );

            if (!selectedChoice || selectedChoice === "✅ Done") break;

            if (selectedChoice === "🪧 Create new tag") {
                const newTag = await tp.system.prompt(`New tag?`);
                if (newTag?.trim()) {
                    const fullTagName = newTag.trim().startsWith(`${blog}/`)
                        ? newTag.trim()
                        : `${blog}/${newTag.trim()}`;
                    selectedTags.push(fullTagName);
                }
            } else {
                selectedTags.push(selectedChoice);
                availableTags = availableTags.filter(
                    (tag) => tag !== selectedChoice
                );
            }
        }
    }

    return {
        title,
        blog,
        tags:
            selectedTags.length > 0
                ? selectedTags.map((tag) => {
                      const parts = tag.split("/");
                      return `${parts[0]}/${tp.user.slugify(parts[1])}`;
                  })
                : null,
    };
}

module.exports = createBlogPost;
