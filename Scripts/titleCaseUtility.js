/**
 * Title Case Utility
 * Converts text to proper title case, keeping prepositions, articles, and conjunctions lowercase
 * (except when they are the first or last word)
 */

// Constants for words that should remain lowercase in title case
const LOWERCASE_WORDS = new Set([
    'a', 'an', 'and', 'as', 'at', 'but', 'by', 'for', 'if', 'in', 'nor', 
    'of', 'on', 'or', 'so', 'the', 'to', 'up', 'yet', 'with', 'from',
    'into', 'onto', 'per', 'via', 'amid', 'amid', 'atop', 'below',
    'since', 'until', 'upon', 'within', 'without'
]);

/**
 * Converts a string to proper title case
 * @param {string} text - The text to convert
 * @returns {string} The title-cased text
 */
function toTitleCase(text) {
    if (!text || typeof text !== 'string') {
        return '';
    }

    return text.toLowerCase().replace(/\b\w+/g, (word, index, fullString) => {
        const words = fullString.match(/\b\w+/g);
        const isFirstWord = index === 0;
        const isLastWord = word === words[words.length - 1];
        
        // Always capitalize first and last words, or if not in lowercase set
        if (isFirstWord || isLastWord || !LOWERCASE_WORDS.has(word.toLowerCase())) {
            return word.charAt(0).toUpperCase() + word.slice(1);
        }
        
        return word;
    });
}

/**
 * Interactive title case converter for user input
 * Can be used in browser console or Node.js environment
 */
async function interactiveTitleCase() {
    let input;
    
    // Check if we're in a browser environment
    if (typeof window !== 'undefined' && window.prompt) {
        input = window.prompt('Enter text to convert to title case:');
    } 
    // Check if we're in Node.js with readline available
    else if (typeof require !== 'undefined') {
        try {
            const readline = require('readline');
            const rl = readline.createInterface({
                input: process.stdin,
                output: process.stdout
            });
            
            input = await new Promise((resolve) => {
                rl.question('Enter text to convert to title case: ', (answer) => {
                    rl.close();
                    resolve(answer);
                });
            });
        } catch (error) {
            console.error('Readline not available. Please provide text as parameter.');
            return null;
        }
    } else {
        console.log('Interactive mode not available in this environment.');
        return null;
    }
    
    if (input) {
        const result = toTitleCase(input);
        console.log(`Original: "${input}"`);
        console.log(`Title Case: "${result}"`);
        return result;
    }
    
    return null;
}

/**
 * Batch convert multiple titles
 * @param {string[]} titles - Array of titles to convert
 * @returns {string[]} Array of converted titles
 */
function batchTitleCase(titles) {
    if (!Array.isArray(titles)) {
        throw new Error('Input must be an array of strings');
    }
    
    return titles.map(title => toTitleCase(title));
}

/**
 * Add custom lowercase words to the set
 * @param {string[]} words - Array of words to add
 */
function addLowercaseWords(words) {
    if (!Array.isArray(words)) {
        throw new Error('Words must be provided as an array');
    }
    
    words.forEach(word => {
        if (typeof word === 'string') {
            LOWERCASE_WORDS.add(word.toLowerCase());
        }
    });
}

/**
 * Remove words from the lowercase set
 * @param {string[]} words - Array of words to remove
 */
function removeLowercaseWords(words) {
    if (!Array.isArray(words)) {
        throw new Error('Words must be provided as an array');
    }
    
    words.forEach(word => {
        if (typeof word === 'string') {
            LOWERCASE_WORDS.delete(word.toLowerCase());
        }
    });
}

/**
 * Get current lowercase words
 * @returns {string[]} Array of current lowercase words
 */
function getLowercaseWords() {
    return Array.from(LOWERCASE_WORDS).sort();
}

// Example usage and tests
function runExamples() {
    const examples = [
        "the lord of the rings",
        "a guide to programming", 
        "and then there were none",
        "for whom the bell tolls",
        "to be or not to be",
        "the art of war",
        "in search of lost time"
    ];
    
    console.log('Title Case Examples:');
    console.log('===================');
    
    examples.forEach(example => {
        const result = toTitleCase(example);
        console.log(`"${example}" → "${result}"`);
    });
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        toTitleCase,
        interactiveTitleCase,
        batchTitleCase,
        addLowercaseWords,
        removeLowercaseWords,
        getLowercaseWords,
        runExamples
    };
}

// Make functions available globally in browser
if (typeof window !== 'undefined') {
    window.TitleCaseUtility = {
        toTitleCase,
        interactiveTitleCase,
        batchTitleCase,
        addLowercaseWords,
        removeLowercaseWords,
        getLowercaseWords,
        runExamples
    };
}

// Auto-run examples if script is executed directly
if (typeof require !== 'undefined' && require.main === module) {
    runExamples();
    console.log('\nRun interactiveTitleCase() to try it yourself!');
}
