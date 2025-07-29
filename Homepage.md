---
created: 2024-11-18T10:18:12
modified: 2025-07-29T08:14:47
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

```dataviewjs
let onDesktop = window.innerWidth > 768;
if (onDesktop) {
    const { Utils } = await cJS();
    let today = dv.date("today");
    
    function calculateAverage(data, valueLabel, dateFilterFn) {
        const extractors = {
            "Number of Words": (stats) => stats.words,
            "Number of Flows": (flows) => flows.length,
        };

        const getValue = extractors[valueLabel];

        const entries = Object.entries(data).filter(([dateStr, _]) =>
            dateFilterFn(dv.date(dateStr))
        );

        const values = entries.map(([_, value]) => getValue(value));

        return values.length > 0
            ? Math.round(values.reduce((sum, val) => sum + val, 0) / values.length)
            : 0;
    };

    let metrics = {
        "Number of Flows": JSON.parse(
            await app.vault.adapter.read(
                `Deep-Work-Machine/Number of Flows/data.json`
            )
        ),
        "Number of Words": JSON.parse(
            await app.vault.adapter.read(
                `${app.vault.configDir}/vault-stats.json`
            )
        ).history
    };

    let allTimeAverages = {};
    let thisWeekAverages = {};
    let yesterdayData = {};
    let todayData = {};

    for (const [metric, data] of Object.entries(metrics)) {
        let allFiles = Utils.getAllFilesByExtension(`Deep-Work-Machine/${metric}`, "json")
                            .filter(file => !file.path.endsWith("data.json"));
                            
        let allTimeData = (await Promise.all(allFiles.map(file =>
            app.vault.adapter.read(file.path).then(data => JSON.parse(data).data)
        ))).flat();

        allTimeAverages[metric] = Math.round(
            allTimeData.reduce((sum, entry) => sum + entry[metric], 0) / allTimeData.length
        );

        thisWeekAverages[metric] = calculateAverage(
            data,
            metric,
            (date) => date >= today.startOf("week") && date <= today.endOf("week")
        );

        yesterdayData[metric] = calculateAverage(
            data,
            metric,
            (date) => date.toISODate() === today.minus({ days: 1 }).toISODate()
        );

        todayData[metric] = calculateAverage(
            data,
            metric,
            (date) => date.toISODate() === today.toISODate()
        );
    };

    dv.table(
        [
            "",
            "**All-Time Average**",
            "**This Week Average**",
            "**Yesterday**",
            "**Today**"
        ],
        [
            [
                "**🍅 Flows**",
                `==**${allTimeAverages["Number of Flows"]}**==`,
                `${thisWeekAverages["Number of Flows"]}`,
                `${yesterdayData["Number of Flows"]}`,
                todayData["Number of Flows"] >= allTimeAverages["Number of Flows"] ? `👌 ${todayData["Number of Flows"]}` : `💪 ${todayData["Number of Flows"]}`
            ],
            [
                "**✍️ Words**",
                `==**${allTimeAverages["Number of Words"]}**==`,
                `${thisWeekAverages["Number of Words"]}`,
                `${yesterdayData["Number of Words"]}`,
                todayData["Number of Words"] >= allTimeAverages["Number of Words"] ? `👌 ${todayData["Number of Words"]}` : `💪 ${todayData["Number of Words"]}`
            ]
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
> let today = dv.date("today");
> 
> dv.header(3, "Last 7 Days");
> 
> function calculateSumAndAverage(data, metric, isTime = false) {
>     let total = 0, totalHours = 0, totalMinutes = 0, count = 0;
>     for (const row of data) {
>         if (row[metric] !== NO_DATA) {
>             if (isTime) {
>                 const hours = row[metric]?.hours || 0;
>                 const minutes = row[metric]?.minutes || 0;
>                 totalHours += hours;
>                 totalMinutes += minutes;
>             } else {
>                 total += row[metric];
>             }
>             count++;
>         }
>     }
>     if (isTime) {
>         totalHours += Math.floor(totalMinutes / 60);
>         totalMinutes = totalMinutes % 60;
>         return {
>             average: count > 0
>                 ? `${Math.floor(totalHours / count)}h ${Math.round(totalMinutes / count)}m`
>                 : NO_DATA,
>             count
>         };
>     } else {
>         return {
>             average: count > 0 ? Math.round(total / count) : NO_DATA,
>             count
>         };
>     }
> }
> 
> function getDataForPeriod(days) {
>     return dv.pages('"Daily-Bullet-Journal"')
>         .where(p =>
>             p.date >= today.minus({ days }) &&
>             p.date < today.plus({ days: 1 }))
>         .sort(p => p.date, 'desc')
>         .map((todayEntry, i, entries) => {
>             const yesterdayEntry = entries[i + 1];
>             const calculateTimeDifference = (startTime, endTime) => {
>                 if (!startTime || !endTime) return NO_DATA;
>                 const timeInSeconds = (endTime - startTime) / 1000;
>                 return {
>                     hours: Math.floor(timeInSeconds / 3600),
>                     minutes: Math.round((timeInSeconds % 3600) / 60)
>                 };
>             };
>             const sleepTime = calculateTimeDifference(yesterdayEntry?.bedTime, todayEntry.wakeUpTime);
>             const screenTime = todayEntry.phoneScreenTime ? dv.duration(todayEntry.phoneScreenTime) : NO_DATA;
>             const steps = todayEntry.steps || NO_DATA;
>             return {
>                 link: todayEntry.file.link,
>                 sleepTime,
>                 screenTime,
>                 steps
>             };
>         })
>         .slice(0, -1); // Exclude the last entry since it won't have a "yesterday" entry
> }
> 
> const data7Day = getDataForPeriod(7);
> const data30Day = getDataForPeriod(30);
> const data90Day = getDataForPeriod(90);
> const data180Day = getDataForPeriod(180);
> 
> function prependThreshold(value, threshold, isTime = false, isLessBetter = false) {
>     if (value === NO_DATA) return value;
>     if (isTime) {
>         const totalMinutes = value.hours * 60 + value.minutes;
>         const thresholdMinutes = threshold.hours * 60 + threshold.minutes;
>         return isLessBetter
>             ? totalMinutes <= thresholdMinutes ? `✅ ${value.hours}h ${value.minutes}m` : `❌ ${value.hours}h ${value.minutes}m`
>             : totalMinutes >= thresholdMinutes ? `✅ ${value.hours}h ${value.minutes}m` : `❌ ${value.hours}h ${value.minutes}m`;
>     } else {
>         return isLessBetter
>             ? value <= threshold ? `✅ ${value}` : `❌ ${value}`
>             : value >= threshold ? `✅ ${value}` : `❌ ${value}`;
>     }
> }
> 
> dv.table(
>     ["‏‎", "**🛌 Sleep Time**", "**📱 Screen Time**", "**🚶 Steps**"],
>     data7Day.map(row => [
>         `**${row.link}**`,
>         prependThreshold(row.sleepTime, CONFIG.thresholds.sleepTime, true),
>         prependThreshold(row.screenTime, CONFIG.thresholds.screenTime, true, true),
>         prependThreshold(row.steps, CONFIG.thresholds.steps, false)
>     ])
> );
> 
> dv.header(3, "Averages");
> 
> const averages = {
>     "🛌 Sleep Time": {
>         "7-Day": calculateSumAndAverage(data7Day, 'sleepTime', true).average,
>         "30-Day": calculateSumAndAverage(data30Day, 'sleepTime', true).average,
>         "90-Day": calculateSumAndAverage(data90Day, 'sleepTime', true).average,
>         "180-Day": calculateSumAndAverage(data180Day, 'sleepTime', true).average
>     },
>     "📱 Screen Time": {
>         "7-Day": calculateSumAndAverage(data7Day, 'screenTime', true).average,
>         "30-Day": calculateSumAndAverage(data30Day, 'screenTime', true).average,
>         "90-Day": calculateSumAndAverage(data90Day, 'screenTime', true).average,
>         "180-Day": calculateSumAndAverage(data180Day, 'screenTime', true).average
>     },
>     "🚶 Steps": {
>         "7-Day": calculateSumAndAverage(data7Day, 'steps', false).average,
>         "30-Day": calculateSumAndAverage(data30Day, 'steps', false).average,
>         "90-Day": calculateSumAndAverage(data90Day, 'steps', false).average,
>         "180-Day": calculateSumAndAverage(data180Day, 'steps', false).average
>     }
> };
> 
> dv.table(
>     ["‏‎", "**7-Day**", "**30-Day**", "**90-Day**", "**180-Day**"],
>     Object.entries(averages).map(([metric, values]) => [
>         `**${metric}**`,
>         `==**${values["7-Day"]}**==`,
>         `${values["30-Day"]}`,
>         `${values["90-Day"]}`,
>         `${values["180-Day"]}`
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

```dataviewjs
let onDesktop = window.innerWidth > 768;
if (onDesktop) {
    const { Utils } = await cJS();
    let today = dv.date("today");

    // ***********************************************

    dv.header(1, `<a href="https://github.com/huaminghuangtw/Daily-Bullet-Journal">📝 Journaling</a>`);

    // -----------------------------------------------

    dv.paragraph(`
> [!TODO] 🐥 <a href="${await Utils.buildObsidianOpenFileURI("Daily-Bullet-Journal/Journal-Backlog.md")}">**Backlog**</a>
`);

    // -----------------------------------------------

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

    // ***********************************************

    dv.header(1, `<a href="https://github.com/huaminghuangtw/Deep-Work-Machine">🦸🏽‍♂️ Deep Work Machine</a>`);

    const images = ["Number of Flows", "Number of Words"].map(metric =>
        encodeURI(Utils.getAllFilesByExtension(`Deep-Work-Machine/${metric}`, "png")[0].path)
    );
    
    dv.paragraph(`
> [!EXAMPLE] ‎
> ${images.map(imagePath => `![500](${imagePath})`).join("\n> ")}
`)

    // ***********************************************

    dv.header(1, `<a href="https://github.com/huaminghuangtw/Dear-Today-Me">🌟 Life Philosophy</a>`);

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

    // ***********************************************

    dv.header(1, `<a href="https://github.com/huaminghuangtw/Evergreen-Lists">📒 Evergreen Lists</a>`);

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

    // ***********************************************

    dv.header(1, `<a href="https://github.com/huaminghuangtw/Weekly-Mindware-Update">🧠 Weekly Mindware Update</a>`);

    let files;
    let filePath;
    let fileContent;

    try {
        files = (await Utils.getRepoTree("huaminghuangtw", "Weekly-Mindware-Update"))
                    .filter(item => item.path.includes("/"));

        filePath = Utils.getRandomItem(files).path;

        fileContent = await Utils.getFileContent(
            "huaminghuangtw",
            "Weekly-Mindware-Update",
            filePath
        );
    } catch {
        files = Utils.getAllFilesByExtension("Weekly-Mindware-Update", "md")
                        .filter(file => !file.path.includes("README"))
                        .map(file => file.path);

        filePath = Utils.getRandomItem(files);

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
