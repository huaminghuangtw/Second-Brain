---
created: 2024-11-18T10:18:12
modified: 2025-08-12T14:36:38
---

```dataviewjs
let onDesktop = window.innerWidth > 768;
if (onDesktop) {
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
        if (i === currentBlockIndex) {
            blocks.push(CONFIG.block.current);
        } else if (i === Math.floor((CONFIG.totalBlocks) / 4)) {
            blocks.push(CONFIG.block.quarter1);
        } else if (i === Math.floor((CONFIG.totalBlocks) / 2)) {
            blocks.push(CONFIG.block.quarter2);
        } else if (i === Math.floor((3 * (CONFIG.totalBlocks)) / 4)) {
            blocks.push(CONFIG.block.quarter3);
        } else if (i === ((CONFIG.totalBlocks) - 1)) {
            blocks.push(CONFIG.block.quarter4);
        } else {
            blocks.push(CONFIG.block.default);
        }
    }
    const blocksString = blocks.join(" ");

    dv.paragraph(blocksString);
}
```

---

```dataview
CALENDAR date
FROM "Daily-Bullet-Journal"
WHERE date
```

---

<!-- deep-work-machine -->

```dataviewjs
let onDesktop = window.innerWidth > 768;
if (onDesktop) {
    const { Utils } = await cJS();

    const CONFIG = { thresholds: { "Number of Flows": 6, "Number of Words": 1000 } };

    const today = dv.date("today");

    const getAverage = (data, valueLabel, filterFn) => {
        const getValue = valueLabel === "Number of Words" ? s => s.words : f => f.length;
        const values = Object.entries(data).filter(([d]) => filterFn(dv.date(d))).map(([, v]) => getValue(v));
        return values.length ? Math.round(values.reduce((s, v) => s + v, 0) / values.length) : 0;
    };

    const metrics = {
        "Number of Flows": JSON.parse(await app.vault.adapter.read(`Deep-Work-Machine/Number of Flows/data.json`)),
        "Number of Words": JSON.parse(await app.vault.adapter.read(`${app.vault.configDir}/vault-stats.json`)).history
    };

    const periods = [
        ["Last Week", d => d >= today.minus({ weeks: 1 }).startOf("week") && d <= today.minus({ weeks: 1 }).endOf("week")],
        ["This Week", d => d >= today.startOf("week") && d <= today.endOf("week")],
        ["Yesterday", d => d.toISODate() === today.minus({ days: 1 }).toISODate()],
        ["Today", d => d.toISODate() === today.toISODate()]
    ];

    const results = Object.fromEntries(
        Object.entries(metrics).map(([metric, data]) => [
            metric,
            periods.map(([, filter]) => getAverage(data, metric, filter))
        ])
    );

    dv.table(
        ["", "**Last Week Average**", "**This Week Average**", "**Yesterday**", "**Today**"],
        [
            ["**🍅 Flows**", `${results["Number of Flows"][0]}`, ...results["Number of Flows"].slice(1, 3),
             results["Number of Flows"][3] >= CONFIG.thresholds["Number of Flows"] ? `👌 ${results["Number of Flows"][3]}` : `💪 ${results["Number of Flows"][3]}`],
            ["**✍️ Words**", `${results["Number of Words"][0]}`, ...results["Number of Words"].slice(1, 3),
             results["Number of Words"][3] >= CONFIG.thresholds["Number of Words"] ? `👌 ${results["Number of Words"][3]}` : `💪 ${results["Number of Words"][3]}`]
        ]
    );
}
```

# ⚙️ LifeOS

> [!ERROR]- 🫶 Health
>
> ```dataviewjs
> const CONFIG = {
>     thresholds: {
>         sleepTime: { hours: 7, minutes: 0 },
>         screenTime: { hours: 2, minutes: 0 },
>         steps: 3000
>     }
> };
>
> const NO_DATA = "‏‎ ‎ ";
> const today = dv.date("today");
>
> dv.header(3, "Last 7 Days");
>
> function getAverage(data, metric, isTime) {
>     const valid = Array.from(data).filter(r => r[metric] !== NO_DATA);
>     if (!valid.length) return NO_DATA;
>
>     if (isTime) {
>         const totalMinutes = valid.reduce((sum, r) => sum + (r[metric].hours * 60 + r[metric].minutes), 0);
>         const avgMinutes = totalMinutes / valid.length;
>         return `${Math.floor(avgMinutes / 60)}h ${Math.round(avgMinutes % 60)}m`;
>     }
>
>     return Math.round(valid.reduce((sum, r) => sum + r[metric], 0) / valid.length);
> }
>
> function getData(days) {
>     return dv.pages('"Daily-Bullet-Journal"')
>         .where(p => p.date >= today.minus({ days }) && p.date < today.plus({ days: 1 }))
>         .sort(p => p.date, 'desc')
>         .map((entry, i, entries) => {
>             const prev = entries[i + 1];
>             const sleepTime = prev?.bedTime && entry.wakeUpTime
>                 ? { hours: Math.floor((entry.wakeUpTime - prev.bedTime) / 3600000), minutes: Math.round(((entry.wakeUpTime - prev.bedTime) % 3600000) / 60000) }
>                 : NO_DATA;
>             return {
>                 link: entry.file.link,
>                 sleepTime,
>                 screenTime: entry.phoneScreenTime ? dv.duration(entry.phoneScreenTime) : NO_DATA,
>                 steps: entry.steps || NO_DATA
>             };
>         })
>         .slice(0, -1); // Exclude the last entry since it won't have a "yesterday" entry
> }
>
> const [data7, data30, data90, data180] = [7, 30, 90, 180].map(getData);
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
> dv.table(
>     ["‏‎", "**🛌 Sleep Time**", "**📱 Screen Time**", "**🚶 Steps**"],
>     data7.map(r => [
>         `**${r.link}**`,
>         formatThreshold(r.sleepTime, CONFIG.thresholds.sleepTime, true, false),
>         formatThreshold(r.screenTime, CONFIG.thresholds.screenTime, true, true),
>         formatThreshold(r.steps, CONFIG.thresholds.steps, false, false)
>     ])
> );
>
> dv.header(3, "Averages");
>
> const metrics = ["🛌 Sleep Time", "📱 Screen Time", "🚶 Steps"];
> const periods = ["7-Day", "30-Day", "90-Day", "180-Day"];
> const datasets = [data7, data30, data90, data180];
> const keys = ['sleepTime', 'screenTime', 'steps'];
> const isTimeMetric = [true, true, false];
>
> dv.table(
>     ["‏‎", ...periods.map(p => `**${p}**`)],
>     metrics.map((metric, i) => [
>         `**${metric}**`,
>         ...datasets.map((data, j) => {
>             const avg = getAverage(data, keys[i], isTimeMetric[i]);
>             return j === 0 ? `==**${avg}**==` : avg;
>         })
>     ])
> );
> ```

> [!WARNING]- 👨🏽‍🌾 Digital Garden
>
> ```dataviewjs
> let today = dv.date("today");
>
> function findOrphanedImages() {
>     const imageExtensions = [
>         "png",
>         "jpg",
>         "jpeg",
>         "gif",
>         "svg",
>         "webp",
>         "avif",
>         "heic"
>     ];
>
>     const imageFiles = app.vault.getFiles().filter(file =>
>         imageExtensions.includes(file.extension.toLowerCase()) &&
>         file.path.includes("_attachments/")
>     );
>
>     const orphanedImages = imageFiles.filter(image =>
>         !Object.values(app.metadataCache.resolvedLinks)
>                 .some(links => links[image.path])
>     ).map(image => dv.fileLink(image.path));
>
>     return orphanedImages;
> }
>
> function getRandomFilteredPages(filterFn, maxCount = 5) {
>     const excludeFiles = [
>         "Evergreen-Notes/Fleeting-Notes/Fleeting-Notes.md"
>     ];
>
>     const filteredPages = dv.pages('"Evergreen-Notes"')
>                             .filter(page =>
>                                 filterFn(page) &&
>                                 !excludeFiles.includes(page.file.path)
>                             )
>                             .map(p => p.file.link)
>                             .sort(() => Math.random() - 0.5)
>                             .slice(0, maxCount);
>
>     return filteredPages;
> }
>
> //TODO (2025/04/26)
> async function isValidLink(link, sourcePath) {
>     const targetPath = link.link;
>     const resolvedPath = app.metadataCache.getFirstLinkpathDest(targetPath, sourcePath);
>
>     if (resolvedPath) {
>         return true; // It points to an existing file (note or image)
>     }
>
>     // Also check if the file exists physically in the vault
>     const file = app.vault.getAbstractFileByPath(targetPath);
>
>     if (file) {
>         return true;
>     }
>
>     return false; // Neither a note nor a file exists
> }
>
> //TODO
> async function findBadLinksAndEmbeds() {
>     const badLinks = new Map();
>     const badEmbeds = new Map();
>
>     const excludedFolders = [
>         ".trash",
>         ".obsidian",
>     ];
>
>     const notes = app.vault.getMarkdownFiles().filter(note =>
>         !excludedFolders.some(folder => note.path.includes(`${folder}`))
>     );
>
>     const tasks = [];
>
>     for (const note of notes) {
>         const cache = app.metadataCache.getFileCache(note);
>         if (!cache) continue;
>
>         const links = cache.links || [];
>         const embeds = cache.embeds || [];
>
>         for (const link of links) {
>             tasks.push({
>                 type: "link",
>                 notePath: note.path,
>                 link: link
>             });
>         }
>
>         for (const embed of embeds) {
>             tasks.push({
>                 type: "embed",
>                 notePath: note.path,
>                 link: embed
>             });
>         }
>     }
>
>     const results = await Promise.all(
>         tasks.map(async (task) => {
>             const valid = await isValidLink(task.link, task.notePath);
>             return { ...task, valid };
>         })
>     );
>
>     for (const result of results) {
>         if (!result.valid) {
>             if (result.type === "link") {
>                 if (!badLinks.has(result.notePath)) {
>                     badLinks.set(result.notePath, []);
>                 }
>                 badLinks.get(result.notePath).push(result.link.link);
>             } else if (result.type === "embed") {
>                 if (!badEmbeds.has(result.notePath)) {
>                     badEmbeds.set(result.notePath, []);
>                 }
>                 badEmbeds.get(result.notePath).push(result.link.link);
>             }
>         }
>     }
>
>     const linkResults = [...badLinks.entries()].map(([file, links]) => [
>         dv.fileLink(file),
>         links.join("\n")
>     ]);
>
>     const embedResults = [...badEmbeds.entries()].map(([file, embeds]) => [
>         dv.fileLink(file),
>         embeds.join("\n")
>     ]);
>
>     return { linkResults, embedResults };
> }
>
> dv.header(4, "**❥ Forgotten Notes**");
> dv.list(getRandomFilteredPages(
>     p => dv.date(p.file.mtime) < today.minus({ months: 3 })
> ));
>
> dv.header(4, "**❥ Empty Notes**");
> dv.list(getRandomFilteredPages(
>     p => p.file.size >= 0 && p.file.size < 10
> ));
>
> dv.header(4, "**❥ Bad Links**");
> dv.list(await findBadLinksAndEmbeds().linkResults);
>
> dv.header(4, "**❥ Bad Embeds**");
> dv.list(await findBadLinksAndEmbeds().embedResults);
>
> dv.header(4, "**❥ Orphaned Images**");
> dv.list(findOrphanedImages());
>
> dv.header(4, "**❥ Orphaned Notes**");
> dv.list(getRandomFilteredPages(
>     p => p.file.inlinks && p.file.outlinks
> ));
> ```

# [📝 Journaling](https://github.com/huaminghuangtw/Daily-Bullet-Journal)

```dataviewjs
let onDesktop = window.innerWidth > 768;
if (onDesktop) {
    const { Utils } = await cJS();

    let today = dv.date("today");

    dv.paragraph(`
> [!TODO] 🐥 <a href="${await Utils.buildObsidianOpenFileURI("Daily-Bullet-Journal/Journal-Backlog.md")}">**Backlog**</a>
`);

    await dv.view("Scripts/view_callout_journal_retrospection", {
        arr: [
            {
                headerText: "🗓 Journals On This Day",
                pages: await Utils.getJournalsURLs(dv,
                    p => p.date &&
                    p.date.day === today.day &&
                    p.date.month === today.month &&
                    p.date.year !== today.year
                )
            },
            {
                headerText: "🗓 Last Week's Journals",
                pages: await Utils.getJournalsURLs(dv,
                    p => p.date &&
                    p.date >= today.minus({ weeks: 1 }).startOf('week') &&
                    p.date <= today.minus({ weeks: 1 }).endOf('week')
                )
            }
        ]
    });
}
```

# [🦸🏽‍♂️ Deep Work Machine](https://github.com/huaminghuangtw/Deep-Work-Machine)

```dataviewjs
let onDesktop = window.innerWidth > 768;
if (onDesktop) {
    const { Utils } = await cJS();

    const images = ["Number of Flows", "Number of Words"].map(metric =>
        encodeURI(Utils.getAllFilesByExtension(`Deep-Work-Machine/${metric}`, "png")[0].path)
    );

    dv.paragraph(`
> [!EXAMPLE] ‎
> ${images.map(imagePath => `![500](${imagePath})`).join("\n> ")}
`)
}
```

# [💌 Dear Today Me](https://github.com/huaminghuangtw/Dear-Today-Me)

```dataviewjs
let onDesktop = window.innerWidth > 768;
if (onDesktop) {
    const { Utils } = await cJS();

    let fileContentLifePhilosophy;

    try {
        fileContentLifePhilosophy = await Utils.getFileContent(
            "huaminghuangtw",
            "Dear-Today-Me",
            "Dear-Today-Me.md"
        );
    } catch {
        fileContentLifePhilosophy = await dv.io.load("Dear-Today-Me/Dear-Today-Me.md");
    }

    let allParagraphs = fileContentLifePhilosophy.split("\n\n");

    // Skip salutation and closing lines
    let selectedParagraphs = allParagraphs.slice(1, allParagraphs.length - 2);

    let randomParagraph = Utils.getRandomItem(selectedParagraphs);

    let lineNumber = fileContentLifePhilosophy.split("\n")
                                              .findIndex(line => line.includes(randomParagraph))
                                              + 1;

    await dv.view("Scripts/view_callout_with_edit_button",
        {
            callout: `
> [!SUCCESS] ‎
>> _${randomParagraph}_
            `,
            url: await Utils.buildObsidianOpenFileURI(
                "Dear-Today-Me/Dear-Today-Me.md",
                lineNumber
            )
        }
    );
}
```

# [📒 Evergreen Lists](https://github.com/huaminghuangtw/Evergreen-Lists)

```dataviewjs
let onDesktop = window.innerWidth > 768;
if (onDesktop) {
    const { Utils } = await cJS();

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

    let calloutShortcuts = `
> [!TIP] ${randomReminder.list}
> ${randomReminder.name}
>> ${randomSubtask.name}
`;

    if (randomSubtask.notes) {
        calloutShortcuts += `>> ──────────────` +
                            `\n` +
                            `${randomSubtask.notes.split('\n')
                                                .map(line => `> <sub>${line}</sub>`)
                                                .join('\n')}` +
                            `\n`;
    };

    let urlShortcuts = `shortcuts://run-shortcut?` +
                        `name=${encodeURIComponent("Search Reminders")}&` +
                        `input=${encodeURIComponent(randomSubtask.name)}`;

    await dv.view("Scripts/view_callout_with_edit_button",
        {
            callout: calloutShortcuts,
            url: urlShortcuts
        }
    );
}
```

# [🧠 Weekly Mindware Update](https://github.com/huaminghuangtw/Weekly-Mindware-Update)

```dataviewjs
let onDesktop = window.innerWidth > 768;
if (onDesktop) {
    const { Utils } = await cJS();

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

    let sections = [
        {
            calloutType: "QUOTE",
        },
        {
            calloutType: "INFO",
        }
    ];

    for (const section of sections) {
        let sectionContent = fileContent.split("\n")
                                        .filter(line => line.startsWith("*"))
                                        .map(line => line.slice(1).trim());

        sectionContent = (section.calloutType === "QUOTE") ? sectionContent.slice(0, 5) : sectionContent.slice(5, 10);

        let randomBulletPoint = Utils.getRandomItem(sectionContent);

        let lineNumber = fileContent.split("\n")
                                    .findIndex(line => line.includes(randomBulletPoint))
                                    + 1;

        await dv.view("Scripts/view_callout_with_edit_button",
            {
                callout: `
> [!${section.calloutType}] ‎
>> ${randomBulletPoint}
                `,
                url: await Utils.buildObsidianOpenFileURI(
                    filePath,
                    lineNumber
                )
            }
        );
    }
}
```
