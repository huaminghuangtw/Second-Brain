function toSentenceCase(text) {
    const collapsed = text
        .toString()
        .replace(/\s+/g, " ")
        .replace(/'/g, "’")
        .trim();

    if (!collapsed) return "";

    return (
        collapsed
            // Capitalize the first letter, even if it is preceded by a quote,
            // bracket, or emoji (e.g. `“why now` → `“Why now`). Titles that
            // start with a number (e.g. `100 blocks a day`) are left as typed.
            .replace(
                /^([^\p{L}\p{N}]*)(\p{L})/u,
                (_, lead, char) => lead + char.toUpperCase()
            )
            // The pronoun "I" is always capitalized ("i’m", "i’ve", "i’ll", "i’d")
            .replace(/\bi\b(?!\.)/g, "I")
            .replace(/\bi(’(?:m|ve|ll|d|re))\b/gi, (_, suffix) => "I" + suffix)
    );
}

module.exports = toSentenceCase;
