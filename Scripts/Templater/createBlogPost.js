async function createProjectPost(tp) {
    const rawTitle = await tp.system.prompt(`Title?`);
    if (!rawTitle) return null;

    const title = tp.user.toTitleCase(rawTitle);

    const folderMap = { "Permanent-Notes": `Evergreen-Notes/Permanent-Notes/` };

    const project = tp.config.template_file.basename.replace("T_", "");

    const folder = folderMap[project] || `${project}/posts/`;

    const hasChinese = /[\u4e00-\u9fff]/.test(title);
    const fileName = hasChinese 
        ? tp.date.now("YYYY_MM_DD")
        : tp.user.slugify(title);

    tp.user.setViewMode("source");
    
    await tp.file.move(folder + fileName);

    const allTags = Object.keys(app.metadataCache.getTags());
    const projectTags = allTags
        .filter((tag) => tag.startsWith(`#${project}/`))
        .map((tag) => tag.substring(1));

    const selectedTags = [];
    if (projectTags.length > 0) {
        let availableTags = [...projectTags];

        while (selectedTags.length < 3) {
            const displayChoices = [
                "✅ Done",
                "🪧 Create new tag",
                ...availableTags.map(
                    (tag) => `🏷️ ${tag.replace(`${project}/`, "")}`
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
                              tp.user.slugify(tag.replace(`${project}/`, ""))
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
                    const fullTagName = newTag.trim().startsWith(`${project}/`)
                        ? newTag.trim()
                        : `${project}/${newTag.trim()}`;
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
        project,
        tags:
            selectedTags.length > 0
                ? selectedTags.map((tag) => {
                      const parts = tag.split("/");
                      return `${parts[0]}/${tp.user.slugify(parts[1])}`;
                  })
                : null,
    };
}

module.exports = createProjectPost;
