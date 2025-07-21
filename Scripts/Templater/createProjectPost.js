async function createProjectPost(tp) {
    const project = tp.config.template_file.basename.replace("T_", "");
    const title = await tp.system.prompt(`Title?`);
    if (!title) return null;

    const allTags = Object.keys(app.metadataCache.getTags());
    const projectTags = allTags
        .filter((tag) => tag.startsWith(`#${project}/`))
        .map((tag) => tag.substring(1));

    let selectedTags = [];
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
                if (newTag && newTag.trim()) {
                    const tagName = newTag.trim();
                    const fullTagName = tagName.startsWith(`${project}/`)
                        ? tagName
                        : `${project}/${tagName}`;
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

    const folderMap = { "Permanent-Notes": `Evergreen-Notes/Permanent-Notes/` };
    const folder = folderMap[project] || `${project}/posts/`;
    const slugifiedFileName = tp.user.slugify(title);

    await tp.file.rename(slugifiedFileName);
    await tp.file.move(folder + slugifiedFileName);

    const file = app.vault.getAbstractFileByPath(
        `${folder}${slugifiedFileName}.md`
    );
    if (file) {
        // Open the file in Obsidian
        await app.workspace.getLeaf(false).openFile(file);
        await tp.user.setViewMode("source");

        // Open the file in VS Code
        await tp.user.openInVSCode({
            filepath: `${app.vault.adapter.basePath}/${file.path}`,
        });
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
