function slugify(text) {
    return text.toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')   // Replace spaces and symbols with "-"
                .replace(/(^-|-$)/g, '');      // Trim leading/trailing hyphens
}

module.exports = slugify;