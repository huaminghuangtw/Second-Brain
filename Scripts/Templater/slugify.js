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
        $: "dollar",
        "&": "and",
        "@": "at",
        "©": "c",
        "®": "r",
        "™": "tm",
        "€": "euro",
        "£": "pound",
        "%": "percent",
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
                /[àáâãäåæçèéêëìíîïñòóôõöøùúûüýÿßœ&@©®™€£$%]/g,
                (char) => charMap[char] || char
            )
            // Normalize dash-like punctuation (en/em dash, figure dash,
            // non-breaking hyphen, minus sign) to a plain hyphen, so numeric
            // ranges like "0–1000 words" become "0-1000-words"
            .replace(/[\u2010\u2011\u2012\u2013\u2014\u2015\u2212]/g, "-")
            // Replace whitespace and underscores with hyphens
            .replace(/[\s_]+/g, "-")
            // Remove any remaining characters except Unicode letters/numbers
            // (this keeps CJK like "中文書") and hyphens
            .replace(/[^\p{L}\p{N}-]/gu, "")
            // Replace multiple consecutive hyphens with single hyphen
            .replace(/-+/g, "-")
            // Remove leading and trailing hyphens
            .replace(/^-+|-+$/g, "")
    );
}

module.exports = slugify;
