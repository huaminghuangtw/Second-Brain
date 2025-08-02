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
        .toLowerCase()
        .replace(/\b\w+/g, (word, index, fullString) => {
            const words = fullString.match(/\b\w+/g);
            const isFirstWord = index === 0;
            const isLastWord = word === words[words.length - 1];

            // Always capitalize first and last words, or if not in lowercase set
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
