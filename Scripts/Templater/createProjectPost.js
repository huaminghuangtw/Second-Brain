async function createProjectPost(tp, projectName, emoji) {
    const title = await tp.system.prompt(`${emoji} ${projectName} Title?`);
    
    if (!title) return null;
    
    const folder = `${projectName}/posts/`;
    const slugifiedTitle = tp.user.slugify(title);
    
    await tp.file.rename(slugifiedTitle);
    await tp.file.move(folder + slugifiedTitle);
    
    return {
        title: title,
        project: projectName
    };
}

module.exports = createProjectPost;
