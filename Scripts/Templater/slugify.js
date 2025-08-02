function slugify(text) {
    const charMap = {
        à: "a",
        á: "a",
        â: "a",
        ã: "a",
        ä: "a",
        å: "a",
        æ: "ae",
        ç: "c",
        è: "e",
        é: "e",
        ê: "e",
        ë: "e",
        ì: "i",
        í: "i",
        î: "i",
        ï: "i",
        ñ: "n",
        ò: "o",
        ó: "o",
        ô: "o",
        õ: "o",
        ö: "o",
        ø: "o",
        ù: "u",
        ú: "u",
        û: "u",
        ü: "u",
        ý: "y",
        ÿ: "y",
        ß: "ss",
        œ: "oe",
        "&": "and",
        "@": "at",
        "©": "c",
        "®": "r",
        "™": "tm",
        "€": "euro",
        "£": "pound",
        $: "dollar",
    };

    return (
        text
            .toString()
            .toLowerCase()
            .trim()
            // Normalize and remove diacritics
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            // Replace known characters using charMap
            .replace(
                /[àáâãäåæçèéêëìíîïñòóôõöøùúûüýÿßœ&@©®™€£$]/g,
                (char) => charMap[char] || char
            )
            // Replace whitespace and underscores with hyphens
            .replace(/[\s_]+/g, "-")
            // Remove any remaining non-alphanumeric characters (except hyphens)
            .replace(/[^a-z0-9-]/g, "")
            // Replace multiple consecutive hyphens with single hyphen
            .replace(/-+/g, "-")
            // Remove leading and trailing hyphens
            .replace(/^-+|-+$/g, "")
    );
}

module.exports = slugify;
