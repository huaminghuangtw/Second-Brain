const SECTIONS = [
    {
        key: "highlights",
        heading: "Daily Highlights",
        match: /^daily highlights?$/i,
    },
    {
        key: "grateful",
        heading: "I Am Grateful For",
        match: /^(i am|i'm) grateful for$/i,
    },
    {
        key: "wins",
        heading: "Wins I Achieved",
        match: /^wins i achieved$/i,
    },
    {
        key: "improve",
        heading: "Things I Can Improve",
        match: /^things i can improve$/i,
    },
];

const FENCE_RE = /^\s*(`{3,}|~{3,})/;

const MONTH_NAMES = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
];

function normalizeHeading(text) {
    return text.replace(/[:：]\s*$/, "").replace(/\s+/g, " ").trim();
}

function stripFrontmatter(text) {
    const match = text.match(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/);
    return match ? text.slice(match[0].length) : text;
}

function extractSections(lines) {
    const blocks = {};
    for (const section of SECTIONS) blocks[section.key] = [];

    let fence = null;
    let current = null;
    let skipDefinition = false;

    for (const line of lines) {
        const fenceMatch = line.match(FENCE_RE);
        if (fenceMatch) {
            const marker = fenceMatch[1];
            if (!fence) {
                fence = { char: marker[0], length: marker.length };
            } else if (
                marker[0] === fence.char &&
                marker.length >= fence.length
            ) {
                fence = null;
            }
            if (current) current.lines.push(line);
            continue;
        }

        if (fence) {
            if (current) current.lines.push(line);
            continue;
        }

        if (skipDefinition) {
            if (/^[ \t]+\S/.test(line)) continue;
            skipDefinition = false;
        }

        if (/^\[\^([^\]\s]+)\]:/.test(line)) {
            skipDefinition = true;
            continue;
        }

        const heading = line.match(/^(#{1,6})[ \t]+(.+?)[ \t]*$/);
        if (heading) {
            const level = heading[1].length;
            const title = normalizeHeading(heading[2]);
            const section = SECTIONS.find((s) => s.match.test(title));

            if (section) {
                current = { level, lines: [] };
                blocks[section.key].push(current);
            } else if (current && level <= current.level) {
                current = null;
            } else if (current) {
                current.lines.push(line);
            }
            continue;
        }

        if (current) current.lines.push(line);
    }

    return blocks;
}

function collectFootnotes(lines) {
    const defs = new Map();
    let fence = null;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const fenceMatch = line.match(FENCE_RE);

        if (fenceMatch) {
            const marker = fenceMatch[1];
            if (!fence) {
                fence = { char: marker[0], length: marker.length };
            } else if (
                marker[0] === fence.char &&
                marker.length >= fence.length
            ) {
                fence = null;
            }
            continue;
        }
        if (fence) continue;

        const def = line.match(/^\[\^([^\]\s]+)\]:[ \t]*(.*)$/);
        if (!def) continue;

        let body = def[2];
        let j = i + 1;
        while (j < lines.length && /^[ \t]+\S/.test(lines[j])) {
            body += "\n" + lines[j];
            j++;
        }

        defs.set(def[1], body);
        i = j - 1;
    }

    return defs;
}

function trimBlankLines(lines) {
    let start = 0;
    let end = lines.length;

    while (start < end && lines[start].trim() === "") start++;
    while (end > start && lines[end - 1].trim() === "") end--;

    return lines.slice(start, end);
}

function relativePath(fromDir, toPath) {
    const from = fromDir.split("/").filter(Boolean);
    const to = toPath.split("/").filter(Boolean);

    let shared = 0;
    while (
        shared < from.length &&
        shared < to.length - 1 &&
        from[shared] === to[shared]
    ) {
        shared++;
    }

    const up = from.slice(shared).map(() => "..");
    return up.concat(to.slice(shared)).join("/");
}

function normalizeVaultPath(path) {
    const parts = [];
    for (const part of path.split("/")) {
        if (!part || part === ".") continue;
        if (part === "..") {
            parts.pop();
            continue;
        }
        parts.push(part);
    }
    return parts.join("/");
}

const LINK_RE = /(!?\[[^\]]*\]\()([^)]+)(\))/g;
const LINKABLE_RE = /\.(md|png|jpe?g|gif|webp|svg|pdf|mp4|mov|m4a|mp3|wav|heic)$/i;

function rewriteRelativeLinks(lines, sourcePath) {
    const sourceDir = sourcePath.split("/").slice(0, -1).join("/");

    return lines.map((line) =>
        line.replace(LINK_RE, (full, open, target, close) => {
            if (/^(?:[a-z][a-z0-9+.-]*:|\/|#)/i.test(target)) return full;

            const titleMatch = target.match(/^(\S+)(\s+["'(].*)?$/);
            if (!titleMatch) return full;

            const targetPath = titleMatch[1];
            const suffix = titleMatch[2] || "";
            const hashIndex = targetPath.indexOf("#");
            const filePart =
                hashIndex === -1 ? targetPath : targetPath.slice(0, hashIndex);
            const anchor = hashIndex === -1 ? "" : targetPath.slice(hashIndex);

            if (!LINKABLE_RE.test(filePart)) return full;

            const absolute = normalizeVaultPath(`${sourceDir}/${filePart}`);
            const newPath = relativePath("Enoughness/posts", absolute);
            return `${open}${newPath}${anchor}${suffix}${close}`;
        })
    );
}

function formatMonthTitle(month) {
    return `${month.year()} 年 ${month.month() + 1} 月`;
}

async function readSelfIntro() {
    const path = "Enoughness/.scripts/self_intro.md";
    const file = app.vault.getAbstractFileByPath(path);

    if (file && file.extension === "md") {
        return await app.vault.read(file);
    }

    try {
        return await app.vault.adapter.read(path);
    } catch {
        return "";
    }
}

function buildDigest({ monthTitle, created, days, selfIntro }) {
    const chunks = [
        [
            "---",
            `created: ${created}`,
            `title: ${monthTitle}`,
            "draft: true",
            "---",
            "",
        ].join("\n"),
    ];

    if (selfIntro && selfIntro.trim()) {
        chunks.push(`${selfIntro.trim()}\n\n---\n`);
    }

    let entryCount = 0;

    for (const section of SECTIONS) {
        const entries = [];

        for (const day of days) {
            const parts = [];

            for (const block of day.sections[section.key] || []) {
                const body = trimBlankLines(block.lines);
                if (!body.length) continue;

                const mapping = new Map();
                const definitions = [];

                const rewritten = rewriteRelativeLinks(body, day.path).map(
                    (line) =>
                        line.replace(/\[\^([^\]\s]+)\]/g, (full, label) => {
                            if (!day.footnotes.has(label)) return full;

                            if (!mapping.has(label)) {
                                const unique = `${day.dayTag}-${label}`;
                                mapping.set(label, unique);

                                if (!day.emitted.has(label)) {
                                    day.emitted.add(label);
                                    const defLines = rewriteRelativeLinks(
                                        day.footnotes.get(label).split("\n"),
                                        day.path
                                    );
                                    definitions.push(
                                        `[^${unique}]: ${defLines.join("\n")}`
                                    );
                                }
                            }

                            return `[^${mapping.get(label)}]`;
                        })
                );

                let content = rewritten.join("\n").trim();
                if (definitions.length) {
                    content += `\n\n${definitions.join("\n")}`;
                }
                parts.push(content);
            }

            if (!parts.length) continue;

            const link = relativePath("Enoughness/posts", day.path);
            entries.push(
                `## [${day.date}](${link})\n\n${parts.join("\n\n")}`
            );
        }

        if (!entries.length) continue;

        entryCount += entries.length;
        chunks.push(`# ${section.heading}\n\n${entries.join("\n\n")}\n`);
    }

    return { content: chunks.join("\n"), entryCount };
}

async function createNewsletter(tp) {
    const previous = moment().subtract(1, "month");
    const input = await tp.system.prompt(
        "📅 Month to aggregate? (YYYY-MM)",
        previous.format("YYYY-MM")
    );
    if (input == null || input.trim() === "") return;

    const month = moment(input.trim(), "YYYY-MM", true);
    if (!month.isValid()) {
        new Notice("❌ Invalid month. Use YYYY-MM, e.g. 2026-09.");
        return;
    }

    const year = month.year();
    const monthNumber = month.month() + 1;
    const mm = String(monthNumber).padStart(2, "0");
    const monthFolder = `Daily-Bullet-Journal/journals/${year}/${mm}-${MONTH_NAMES[monthNumber - 1]}`;
    const days = [];

    for (let day = 1; day <= month.daysInMonth(); day++) {
        const dd = String(day).padStart(2, "0");
        const expectedPath = `${monthFolder}/${year}_${mm}_${dd}.md`;
        let file = app.vault.getAbstractFileByPath(expectedPath);

        if (!file || file.extension !== "md") {
            const basename = `${year}_${mm}_${dd}.md`;
            file = app.vault.getFiles().find((f) => f.name === basename);
        }
        if (!file || file.extension !== "md") continue;

        const raw = await app.vault.cachedRead(file);
        const lines = stripFrontmatter(raw).split(/\r?\n/);

        days.push({
            date: `${year}-${mm}-${dd}`,
            dayTag: `${mm}${dd}`,
            path: file.path,
            sections: extractSections(lines),
            footnotes: collectFootnotes(lines),
            emitted: new Set(),
        });
    }

    if (!days.length) {
        new Notice(`❌ No journals found for ${year}-${mm}.`);
        return;
    }

    const selfIntro = await readSelfIntro();
    if (!selfIntro.trim()) {
        new Notice(
            "⚠️ Self-intro not found at Enoughness/.scripts/self_intro.md."
        );
    }

    const { content, entryCount } = buildDigest({
        monthTitle: formatMonthTitle(month),
        created: month.clone().startOf("month").format("YYYY-MM-DD"),
        days,
        selfIntro,
    });
    const fileName = `${year}m${monthNumber}`;
    const targetPath = `Enoughness/posts/${fileName}.md`;
    const existing = app.vault.getAbstractFileByPath(targetPath);
    const scratch =
        (tp.config && tp.config.target_file) ||
        tp.file.find_tfile(tp.file.path(true)) ||
        app.workspace.getActiveFile();

    if (!scratch) {
        new Notice("❌ Could not resolve the current note.");
        return;
    }

    if (existing) {
        const overwrite = await tp.system.suggester(
            ["Overwrite", "Cancel"],
            [true, false],
            false,
            "⚠️ File already exists. Overwrite?"
        );
        if (!overwrite) {
            await app.workspace.getLeaf("tab").openFile(existing);
            return;
        }

        if (existing.path !== scratch.path) {
            await app.vault.trash(existing, true);
        }
    }

    if (scratch.path !== targetPath) {
        await tp.file.move(`Enoughness/posts/${fileName}`, scratch);
    }

    tp.user.setViewMode("live");
    new Notice(
        `📦 ${fileName}.md created — ${days.length} days scanned, ${entryCount} section entries.`
    );

    return { content };
}

module.exports = createNewsletter;
