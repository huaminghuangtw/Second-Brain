function toTitleCase(text) {
    const lowercaseWords = new Set([
        "a",
        "an",
        "and",
        "as",
        "at",
        "but",
        "by",
        "for",
        "if",
        "in",
        "nor",
        "of",
        "on",
        "or",
        "so",
        "the",
        "to",
        "up",
        "yet",
        "with",
        "from",
        "into",
        "onto",
        "per",
        "via",
        "amid",
        "atop",
        "below",
        "since",
        "until",
        "upon",
        "within",
        "without",
    ]);

    return text
        .toString()
        .replace(/'/g, "’")
        .toLowerCase()
        .replace(/\b[\w’]+/g, (word, offset, fullString) => {
            const words = fullString.match(/\b[\w’]+/g);
            const isFirstWord = offset === 0;
            const isLastWord = words && word === words[words.length - 1];
            if (
                isFirstWord ||
                isLastWord ||
                !lowercaseWords.has(word.toLowerCase())
            ) {
                return word.charAt(0).toUpperCase() + word.slice(1);
            }
            return word;
        });
}

module.exports = toTitleCase;
