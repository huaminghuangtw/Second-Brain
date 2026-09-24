function containsChinese(text) {
    return /[\u4e00-\u9fff]/.test(text);
}

module.exports = containsChinese;
