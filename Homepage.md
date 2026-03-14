<!-- four-quarters-in-a-day -->

```dataviewjs
const CONFIG = {
    startTime: {
        hours: 4,
        minutes: 0
    },
    endTime: {
        hours: 20,
        minutes: 30
    },
    totalBlocks: 29,
    block: {
        default: "⬛️",
        current: "🔻",
        quarter1: "1️⃣",
        quarter2: "2️⃣",
        quarter3: "3️⃣",
        quarter4: "4️⃣"
    }
};

let now = dv.date("now");
let startTime = now.startOf("day").plus({
    hours: CONFIG.startTime.hours
});
let endTime = now.startOf("day").plus({
    hours: CONFIG.endTime.hours,
    minutes: CONFIG.endTime.minutes
});

// 1 minute = 60 seconds = 60000 milliseconds
let currentMinutes = (now - startTime) / 60000;
let totalAwakeMinutes = (endTime - startTime) / 60000;

let blockDuration = totalAwakeMinutes / CONFIG.totalBlocks;

let currentBlockIndex = Math.floor(currentMinutes / blockDuration);

let blocks = [];
for (let i = 0; i < CONFIG.totalBlocks; i++) {
    let blockSymbol;
    if (i === currentBlockIndex) {
        blockSymbol = CONFIG.block.current;
    } else if (i === Math.floor((CONFIG.totalBlocks) / 4)) {
        blockSymbol = CONFIG.block.quarter1;
    } else if (i === Math.floor((CONFIG.totalBlocks) / 2)) {
        blockSymbol = CONFIG.block.quarter2;
    } else if (i === Math.floor((3 * (CONFIG.totalBlocks)) / 4)) {
        blockSymbol = CONFIG.block.quarter3;
    } else if (i === ((CONFIG.totalBlocks) - 1)) {
        blockSymbol = CONFIG.block.quarter4;
    } else {
        blockSymbol = CONFIG.block.default;
    }
    blocks.push(blockSymbol);
}
const blocksString = blocks.join(" ");

dv.paragraph(blocksString);
```

---

```dataview
CALENDAR date
FROM "Daily-Bullet-Journal"
WHERE date
```

---

<!-- https://github.com/huaminghuangtw/Deep-Work-Machine -->

```dataviewjs
const { Utils } = await cJS();

const CONFIG = { thresholds: { "Number of Flows": 6, "Number of Words": 1000 } };

const today = dv.date("today");

const getAverage = (data, valueLabel, filterFn) => {
    const getValue = valueLabel === "Number of Words" ? s => s.words : f => f.length;
    const values = Object.entries(data).filter(([d]) => filterFn(dv.date(d))).map(([, v]) => getValue(v)).filter(v => v > 0);
    return values.length ? Math.round(values.reduce((s, v) => s + v, 0) / values.length) : 0;
};

const METRICS = {
    "Number of Flows": {
        path: `Deep-Work-Machine/Number of Flows/data.json`,
        data: JSON.parse(await app.vault.adapter.read(`Deep-Work-Machine/Number of Flows/data.json`))
    },
    "Number of Words": {
        path: `${app.vault.configDir}/vault-stats.json`,
        data: JSON.parse(await app.vault.adapter.read(`${app.vault.configDir}/vault-stats.json`)).history
    }
};

const periods = [
    ["Last Week", d => d >= today.minus({ weeks: 1 }).startOf("week") && d <= today.minus({ weeks: 1 }).endOf("week")],
    ["This Week", d => d >= today.startOf("week") && d <= today.endOf("week")],
    ["Yesterday", d => d.toISODate() === today.minus({ days: 1 }).toISODate()],
    ["Today", d => d.toISODate() === today.toISODate()]
];

const results = Object.fromEntries(
    Object.entries(METRICS).map(([metric, { data }]) => [
        metric,
        periods.map(([, filter]) => getAverage(data, metric, filter))
    ])
);

const ROW_CONFIG = [
    { metric: "Number of Flows", emoji: "🍅", label: "Flows" },
    { metric: "Number of Words", emoji: "✏️", label: "Words" }
];

dv.table(
    ["", "**Last Week Average**", "**This Week Average**", "**Yesterday**", "**Today**"],
    ROW_CONFIG.map(({ metric, emoji, label }) => {
        const res = results[metric];
        const link = encodeURI(`vscode://file/${app.vault.adapter.basePath}/${METRICS[metric].path}`);
        return [
            `**${emoji} [${label}](${link})**`,
            `${res[0]}`,
            ...res.slice(1, 3),
            res[3] >= CONFIG.thresholds[metric] ? `👌 ${res[3]}` : `💪 ${res[3]}`
        ];
    })
);
```

---

> [! ]- 🫶 Health
>
> ```dataviewjs
> const CONFIG = {
>     thresholds: {
>         sleepTime: { hours: 7, minutes: 0 },
>         screenTime: { hours: 2, minutes: 0 },
>         steps: 10000
>     }
> };
>
> const NO_DATA = "";
> const today = dv.date("today");
>
> function getAverage(data, metric, isTime) {
>     const valid = Array.from(data).filter(r => r[metric] !== NO_DATA);
>     if (!valid.length) return NO_DATA;
>
>     if (isTime) {
>         const totalMinutes = valid.reduce((sum, r) => sum + (r[metric].hours * 60 + r[metric].minutes), 0);
>         const avgMinutes = totalMinutes / valid.length;
>         return { hours: Math.floor(avgMinutes / 60), minutes: Math.round(avgMinutes % 60) };
>     }
>
>     return Math.round(valid.reduce((sum, r) => sum + r[metric], 0) / valid.length);
> }
>
> function formatThreshold(value, threshold, isTime, isLess) {
>     if (value === NO_DATA) return value;
>     const passes = isTime
>         ? (isLess ? (value.hours * 60 + value.minutes) <= (threshold.hours * 60 + threshold.minutes) : (value.hours * 60 + value.minutes) >= (threshold.hours * 60 + threshold.minutes))
>         : (isLess ? value <= threshold : value >= threshold);
>     const icon = passes ? "✅" : "❌";
>     return isTime ? `${icon} ${value.hours}h ${value.minutes}m` : `${icon} ${value}`;
> }
>
> // Fetch one extra day (15 days ago) so the earliest entry’s sleep can be computed from the prior day’s bedTime
> const data = dv.pages('"Daily-Bullet-Journal"')
>     .where(p => p.date >= today.minus({ days: 15 }) && p.date <= today.minus({ days: 1 }))
>     .sort(p => p.date, 'desc')
>     .map((entry, i, entries) => {
>         const prev = entries[i + 1];
>         const sleepTime = prev?.bedTime && entry.wakeUpTime
>             ? { hours: Math.floor((entry.wakeUpTime - prev.bedTime) / 3600000), minutes: Math.round(((entry.wakeUpTime - prev.bedTime) % 3600000) / 60000) }
>             : NO_DATA;
>         return {
>             link: entry.file.link,
>             dayOfWeek: entry.date.weekdayLong,
>             sleepTime,
>             screenTime: entry.phoneScreenTime ? dv.duration(entry.phoneScreenTime) : NO_DATA,
>             steps: entry.steps || NO_DATA
>         };
>     })
>     .slice(0, -1); // Remove the extra day (15 days ago)
>
> const avgSleep  = getAverage(data, 'sleepTime', true);
> const avgScreen = getAverage(data, 'screenTime', true);
> const avgSteps  = getAverage(data, 'steps', false);
>
> dv.table(
>     ["", "**🛌 Sleep Time**", "**📱 Screen Time**", "**🚶 Steps**"],
>     [
>         ...data.map(r => [
>             `${r.link} (${r.dayOfWeek})`,
>             formatThreshold(r.sleepTime, CONFIG.thresholds.sleepTime, true, false),
>             formatThreshold(r.screenTime, CONFIG.thresholds.screenTime, true, true),
>             formatThreshold(r.steps, CONFIG.thresholds.steps, false, false)
>         ]),
>         [
>             "==**📊 14 天平均**==",
>             avgSleep  !== NO_DATA ? `==**${formatThreshold(avgSleep,  CONFIG.thresholds.sleepTime,  true,  false)}**==` : NO_DATA,
>             avgScreen !== NO_DATA ? `==**${formatThreshold(avgScreen, CONFIG.thresholds.screenTime, true,  true)}**==`  : NO_DATA,
>             avgSteps  !== NO_DATA ? `==**${formatThreshold(avgSteps,  CONFIG.thresholds.steps,       false, false)}**==` : NO_DATA
>         ]
>     ]
> );
> ```

> [! ]- 🌸 Retrospection
>
> ```dataviewjs
> const { Utils } = await cJS();
>
> let today = dv.date("today");
>
> let arr = [
>   {
>     headerText: "🗓 Journals On This Day",
>     pages: await Utils.getJournalsURLs(dv,
>       p => p.date &&
>       p.date.day === today.day &&
>       p.date.month === today.month &&
>       p.date.year !== today.year
>     )
>   },
>   {
>     headerText: "🗓 Last Week’s Journals",
>     pages: await Utils.getJournalsURLs(dv,
>       p => p.date &&
>       p.date >= today.minus({ weeks: 1 }).startOf('week') &&
>       p.date <= today.minus({ weeks: 1 }).endOf('week')
>     )
>   }
> ];
>
> for (let element of arr) {
>   dv.header(3, element.headerText);
>
>   dv.list(element.pages.map(({ page }) => `${page.file.link} (${page.dayOfWeek})`));
> }
> ```

> [! ]- 👨🏽‍🌾 Garden
>
> ```dataviewjs
> const { Utils } = await cJS();
>
> function findOrphanedImages() {
>     const linkedPaths = new Set(
>         // https://docs.obsidian.md/Reference/TypeScript+API/MetadataCache/resolvedLinks
>         Object.values(app.metadataCache.resolvedLinks).flatMap(Object.keys)
>     );
>
>     return app.vault.getFiles()
>         .filter(file => file.path.includes("_attachments/") && !linkedPaths.has(file.path))
>         .map(file => dv.fileLink(file.path));
> }
>
> function isValidLink(link, sourcePath) {
>     const targetPath = link.link;
>
>     // Heading anchors in the same file (e.g. [text](#heading)) are always valid
>     if (targetPath.startsWith("#")) return true;
>
>     // https://docs.obsidian.md/Reference/TypeScript+API/MetadataCache/getFirstLinkpathDest
>     return !!app.metadataCache.getFirstLinkpathDest(targetPath, sourcePath);
> }
>
> async function findBadLinksAndEmbeds() {
>     const badLinks = [];
>     const badEmbeds = [];
>
>     for (const file of app.vault.getMarkdownFiles()) {
>         // https://docs.obsidian.md/Reference/TypeScript+API/MetadataCache/getFileCache
>         const cache = app.metadataCache.getFileCache(file);
>         if (!cache) continue;
>
>         // For journals, pre-read lines so we can identify intentional navigation links (◀/▶)
>         let fileContent = null;
>         if (file.path.includes("Daily-Bullet-Journal")) {
>             const content = await app.vault.read(file);
>             fileContent = content.split("\n");
>         }
>
>         const base = { fileName: file.basename, filePath: file.path };
>
>         for (const link of (cache.links || [])) {
>             // Skip links on navigation lines (◀ prev | next ▶) in journals
>             const line = fileContent?.[link.position.start.line] ?? "";
>             if (line.includes("◀") || line.includes("▶")) continue;
>             // e.g. [[Some Page That Doesn’t Exist]]
>             if (!isValidLink(link, file.path)) {
>                 badLinks.push({ ...base, lineNumber: link.position.start.line + 1 });
>             }
>         }
>
>         for (const embed of (cache.embeds || [])) {
>             // e.g. ![[Nonexistent Image.png]]
>             if (!isValidLink(embed, file.path)) {
>                 badEmbeds.push({ ...base, lineNumber: embed.position.start.line + 1 });
>             }
>         }
>     }
>
>     const buildDeepLinks = async (entries) => Promise.all(
>         entries.map(async ({ fileName, filePath, lineNumber }) => {
>             const uri = await Utils.buildObsidianOpenFileURI(filePath, lineNumber);
>             return `[${fileName}](${uri})`;
>         })
>     );
>
>     return {
>         linkResults: await buildDeepLinks(badLinks),
>         embedResults: await buildDeepLinks(badEmbeds)
>     };
> }
>
> const { linkResults, embedResults } = await findBadLinksAndEmbeds();
>
> dv.header(4, "**❥ Bad Links**");
> dv.list(linkResults);
>
> dv.header(4, "**❥ Bad Embeds**");
> dv.list(embedResults);
>
> dv.header(4, "**❥ Orphaned Images**");
> dv.list(findOrphanedImages());
> ```

> [! ]- ✍️ Writing
>
> ```dataviewjs
> const drafts = dv.pages()
>     .where(p => p.draft === true)
>     .sort(p => p.file.mtime, 'desc')
>     .groupBy(p => p.file.folder.split("/")[0]);
>
> for (const { key, rows } of drafts.sort(g => g.key)) {
>     dv.header(4, `**❥ ${key}**`);
>     dv.list(rows.map(p => p.file.link));
> }
> ```

> [! ]- 🗒️ Notes
>
> ```dataviewjs
> const notes = dv.pages('"Evergreen-Notes/Permanent-Notes"');
> const bwc = app.plugins.plugins["better-word-count"].api;
> 
> await Promise.all(notes.map(async (p) => {
>     p._wordCount = await bwc.getWordCountPagePath(p.file.path);
>     const cache  = app.metadataCache.getFileCache(app.vault.getAbstractFileByPath(p.file.path));
>     p._headings  = cache?.headings?.length ?? 0;
>     p._inlinks   = p.file.inlinks.length;
> }));
> 
> const WEIGHTS = { inlinks: 3, words: 1, headings: 2 };
> notes.forEach(p => {
>     p._score = WEIGHTS.inlinks   * p._inlinks
>              + WEIGHTS.words     * Math.log1p(p._wordCount)
>              + WEIGHTS.headings  * p._headings;
> });
> 
> const top3 = (sortFn) => [...notes].sort(sortFn).slice(0, 3);
> 
> dv.header(4, "**❥ Most Words**");
> dv.list(top3((a, b) => b._wordCount - a._wordCount).map(p => `${p.file.link} (${p._wordCount} words)`));
> 
> dv.header(4, "**❥ Most Inlinks**");
> dv.list(top3((a, b) => b._inlinks - a._inlinks).map(p => `${p.file.link} (${p._inlinks} inlinks)`));
> 
> dv.header(4, "**❥ Most Structured**");
> dv.list(top3((a, b) => b._headings - a._headings).map(p => `${p.file.link} (${p._headings} headings)`));
> 
> dv.header(4, "**❥ Composite Score**");
> dv.list(top3((a, b) => b._score - a._score).map(p => `${p.file.link} (${p._score.toFixed(1)})`));
> ```

---

```dataviewjs
const { Utils } = await cJS();

// https://github.com/huaminghuangtw/Dear-Today-Me

let fileContentLifePhilosophy;

try {
    fileContentLifePhilosophy = await Utils.getFileContent(
        "huaminghuangtw",
        "Dear-Today-Me",
        "Dear-Today-Me.md"
    );
} catch {
    fileContentLifePhilosophy = await dv.io.load("Dear-Today-Me/ear-Today-Me.md");
}

let allParagraphs = fileContentLifePhilosophy.split("\n\n");

// Skip salutation and closing lines
let selectedParagraphs = allParagraphs.slice(1, allParagraphs.length - 2);

let randomParagraph = Utils.getRandomItem(selectedParagraphs);

let lineNumber = fileContentLifePhilosophy.split("\n")
                    .findIndex(line => line.includes(randomParagraph)) + 1;

let editURI = await Utils.buildObsidianOpenFileURI(
    "Dear-Today-Me/Dear-Today-Me.md",
    lineNumber
);

dv.header(2, "🧘‍♂️ Life Philosophy");
dv.paragraph(`> ${randomParagraph}`);
Utils.renderEditLink(dv, editURI);

// https://github.com/huaminghuangtw/Evergreen-Lists

let reminders;

try {
    reminders = JSON.parse(
        await Utils.getFileContent(
            "huaminghuangtw",
            "Evergreen-Lists",
            Utils.getRandomItem(
                (await Utils.getRepoTree("huaminghuangtw", "Evergreen-Lists"))
                            .filter(item => item.path.includes("json"))
            ).path
        )
    ).reminders;
} catch {
    reminders = JSON.parse(
        await dv.io.load(
            Utils.getRandomItem(
                Utils.getAllFilesByExtension("Evergreen-Lists", "json")
                    .map(file => file.path)
            )
        )
    ).reminders;
}

let reminderWithSubtasks = reminders.filter(
    r => r.subtasks.length > 0
);

let randomReminder = Utils.getRandomItem(reminderWithSubtasks);

let randomSubtask = Utils.getRandomItem(randomReminder.subtasks);

let editURI2 = `shortcuts://run-shortcut?` +
                `name=${encodeURIComponent("Search Reminders")}&` +
                `input=${encodeURIComponent(randomSubtask.name)}`;

dv.header(2, randomReminder.list);
dv.paragraph(`**${randomReminder.name}**`);
dv.paragraph(`> ${randomSubtask.name}`);

if (randomSubtask.notes) {
    dv.paragraph(randomSubtask.notes);
}

Utils.renderEditLink(dv, editURI2);

// https://github.com/huaminghuangtw/Weekly-Mindware-Update

let files;
let filePath;
let fileContent;

try {
    files = await Utils.getRepoTree("huaminghuangtw", "Weekly-Mindware-Update");

    filePath = Utils.getRandomItem(
        files.filter(
            f => f.path.includes("issues") &&
            f.path.endsWith(".md")
        )
    ).path;

    fileContent = await Utils.getFileContent(
        "huaminghuangtw",
        "Weekly-Mindware-Update",
        filePath
    );
} catch {
    files = Utils.getAllFilesByExtension("Weekly-Mindware-Update", "md");

    filePath = Utils.getRandomItem(
        files.filter(f => f.path.includes("issues"))
    ).path;

    fileContent = await dv.io.load(filePath);
}

let titles = [
    "🧠 Wisdom I Pondered This Week",
    "🧠 Things I Learned This Week"
];

for (const [index, title] of titles.entries()) {
    let sectionContent = fileContent.split("\n")
                            .filter(line => line.startsWith("*"))
                            .map(line => line.slice(1).trim());

    sectionContent = (index === 0) ? sectionContent.slice(0, 5) : sectionContent.slice(5, 10);

    let randomBulletPoint = Utils.getRandomItem(sectionContent);

    let lineNumber = fileContent.split("\n")
                        .findIndex(line => line.includes(randomBulletPoint))
                        + 1;

    let editURI3 = await Utils.buildObsidianOpenFileURI(
        filePath,
        lineNumber
    );

    dv.header(2, `${title}`);
    dv.paragraph(`> ${randomBulletPoint}`);
    Utils.renderEditLink(dv, editURI3);
}
```
