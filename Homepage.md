---
created: 2024-11-18T10:18:12
modified: 2025-06-02T13:59:24
---

<!---
https://help.obsidian.md/Editing+and+formatting/Callouts#Supported+types
--->

```dataviewjs
let onDesktop = window.innerWidth > 768;
if (onDesktop) {
    let now = dv.date("now");
    let startTime = now.startOf("day").plus({ hours: 4 });
    let endTime = now.startOf("day").plus({ hours: 20, minutes: 30 });

    let totalBlocks = 29;

    // 1 minute = 60 seconds = 60000 milliseconds
    let currentMinutes = (now - startTime) / 60000;
    let totalAwakeMinutes = (endTime - startTime) / 60000;

    let blockDuration = totalAwakeMinutes / totalBlocks;

    let currentBlockIndex = Math.floor(currentMinutes / blockDuration);

    let blocks = [];
    for (let i = 0; i < totalBlocks; i++) {
        //blocks.push(i === currentBlockIndex ? "🔲" : "🔳");
        if (i === currentBlockIndex) {
            blocks.push("🔻");
        } else if (i === Math.floor(totalBlocks / 4)) {
            blocks.push("1️⃣");
        } else if (i === Math.floor(totalBlocks / 2)) {
            blocks.push("2️⃣");
        } else if (i === Math.floor((3 * totalBlocks) / 4)) {
            blocks.push("3️⃣");
        } else if (i === totalBlocks - 1) {
            blocks.push("4️⃣");
        } else {
            blocks.push("⬛️");
        }
    }
    const blocksString = blocks.join(" ");

    dv.paragraph(blocksString);
}
```

```dataview
CALENDAR date
FROM "Daily-Bullet-Journal"
WHERE date
```

```dataviewjs
let onDesktop = window.innerWidth > 768;
if (onDesktop) {
    const { Utils } = await cJS();
    let today = dv.date("today");

    // ***********************************************

    let todayDiaryContainer = document.createElement('div');

    todayDiaryContainer.style.marginTop = '15px';
    todayDiaryContainer.style.marginBottom = '15px';

    const todayDiaryButton = document.createElement('button');

    todayDiaryButton.innerText = `✍️ Today's Diary (${today.toISODate()})`;

    todayDiaryButton.classList.add("common", "today-diary-button");

    let monthMM = String(today.month).padStart(2, '0');
    let monthMMMM = today.toFormat("MMMM");
    let daydd = String(today.day).padStart(2, '0');

    todayDiaryButton.onclick = async () => {
        let filePath = `Daily-Bullet-Journal/${today.year}/${monthMM}-${monthMMMM}/${today.year}_${monthMM}_${daydd}.md`;

        let fileExists = await app.vault.adapter.exists(filePath);
        if (!fileExists) {
            window.open(
                `shortcuts://run-shortcut?` +
                    `name=${encodeURIComponent("✏️ Create New Journal")}&` +
                    `input=${encodeURIComponent(`${today.year}-${monthMM}-${daydd}`)}`
            );

            // Wait a few seconds for the shortcut to complete
            await new Promise(resolve => setTimeout(resolve, 10000));
        }

        window.open(await Utils.buildObsidianOpenFileURI(filePath));
    };

    todayDiaryContainer.appendChild(todayDiaryButton);

    dv.container.appendChild(todayDiaryContainer);

    // ***********************************************

    let fleetingNotesContainer = document.createElement('div');

    fleetingNotesContainer.style.marginTop = '15px';
    fleetingNotesContainer.style.marginBottom = '15px';

    const fleetingNotesButton = document.createElement('button');

    let fleetingNotesFilePath = "EvergreenNotes/FleetingNotes/FleetingNotes.md";

    fleetingNotesButton.innerText = `🗒️ Fleeting Notes`;

    fleetingNotesButton.classList.add("common", "fleeting-notes-button");

    fleetingNotesButton.onclick = async () => {
        window.open(
            await Utils.buildObsidianOpenFileURI(fleetingNotesFilePath)
        );
    };

    fleetingNotesContainer.appendChild(fleetingNotesButton);

    dv.container.appendChild(fleetingNotesContainer);

    // ***********************************************

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

> [!ERROR] Monitor Health Dashboard
>
> ```dataviewjs
> let today = dv.date("today");
>
> dv.header(3, "Last 7 Days");
>
> function calculateSumAndAverage(data, metric, isTime = false) {
>     let total = 0, totalHours = 0, totalMinutes = 0, count = 0;
>     for (const row of data) {
>         if (row[metric] !== "N/A") {
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
>                 : "N/A",
>             count
>         };
>     } else {
>         return {
>             average: count > 0 ? Math.round(total / count) : "N/A",
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
>                 if (!startTime || !endTime) return "N/A";
>                 const timeInSeconds = (endTime - startTime) / 1000;
>                 return {
>                     hours: Math.floor(timeInSeconds / 3600),
>                     minutes: Math.round((timeInSeconds % 3600) / 60)
>                 };
>             };
>             const sleepTime = calculateTimeDifference(yesterdayEntry?.bedTime, todayEntry.wakeUpTime);
>             const screenTime = todayEntry.phoneScreenTime ? dv.duration(todayEntry.phoneScreenTime) : "N/A";
>             const steps = todayEntry.steps || "N/A";
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
> const thresholds = {
>     sleepTime: { hours: 7, minutes: 30 },
>     screenTime: { hours: 2, minutes: 0 },
>     steps: 3000
> };
>
> function prependThreshold(value, threshold, isTime = false, isLessBetter = false) {
>     if (value === "N/A") return value;
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
>         prependThreshold(row.sleepTime, thresholds.sleepTime, true),
>         prependThreshold(row.screenTime, thresholds.screenTime, true, true),
>         prependThreshold(row.steps, thresholds.steps, false)
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

```dataviewjs
let onDesktop = window.innerWidth > 768;
if (onDesktop) {
    const { Utils } = await cJS();
    let today = dv.date("today");

    // ***********************************************

    dv.header(1, "👨🏽‍🌾 Water Digital Garden");

    function findOrphanedImages() {
        const imageExtensions = [
            "png",
            "jpg",
            "jpeg",
            "gif",
            "svg",
            "webp",
            "avif",
            "heic"
        ];

        const imageFiles = app.vault.getFiles().filter(file =>
            imageExtensions.includes(file.extension.toLowerCase()) &&
            file.path.includes("_attachments/")
        );

        const orphanedImages = imageFiles.filter(image =>
            !Object.values(app.metadataCache.resolvedLinks)
                   .some(links => links[image.path])
        ).map(image => dv.fileLink(image.path));

        return orphanedImages;
    }

    function getRandomFilteredPages(filterFn, maxCount = 5) {
        const excludeFiles = [
            "EvergreenNotes/FleetingNotes/FleetingNotes.md"
        ];

        const filteredPages = dv.pages('"EvergreenNotes"')
                                .filter(page =>
                                    filterFn(page) &&
                                    !excludeFiles.includes(page.file.path)
                                )
                                .map(p => p.file.link)
                                .sort(() => Math.random() - 0.5)
                                .slice(0, maxCount);

        return filteredPages;
    }

    //TODO (2025/04/26)
    async function isValidLink(link, sourcePath) {
        const targetPath = link.link;
        const resolvedPath = app.metadataCache.getFirstLinkpathDest(targetPath, sourcePath);

        if (resolvedPath) {
            return true; // It points to an existing file (note or image)
        }

        // Also check if the file exists physically in the vault
        const file = app.vault.getAbstractFileByPath(targetPath);

        if (file) {
            return true;
        }

        return false; // Neither a note nor a file exists
    }

    //TODO
    async function findBadLinksAndEmbeds() {
        const badLinks = new Map();
        const badEmbeds = new Map();

        const excludedFolders = [
            ".trash",
            ".obsidian",
        ];

        const notes = app.vault.getMarkdownFiles().filter(note =>
            !excludedFolders.some(folder => note.path.includes(`${folder}`))
        );

        const tasks = [];

        for (const note of notes) {
            const cache = app.metadataCache.getFileCache(note);
            if (!cache) continue;

            const links = cache.links || [];
            const embeds = cache.embeds || [];

            for (const link of links) {
                tasks.push({
                    type: "link",
                    notePath: note.path,
                    link: link
                });
            }

            for (const embed of embeds) {
                tasks.push({
                    type: "embed",
                    notePath: note.path,
                    link: embed
                });
            }
        }

        const results = await Promise.all(
            tasks.map(async (task) => {
                const valid = await isValidLink(task.link, task.notePath);
                return { ...task, valid };
            })
        );

        for (const result of results) {
            if (!result.valid) {
                if (result.type === "link") {
                    if (!badLinks.has(result.notePath)) {
                        badLinks.set(result.notePath, []);
                    }
                    badLinks.get(result.notePath).push(result.link.link);
                } else if (result.type === "embed") {
                    if (!badEmbeds.has(result.notePath)) {
                        badEmbeds.set(result.notePath, []);
                    }
                    badEmbeds.get(result.notePath).push(result.link.link);
                }
            }
        }

        const linkResults = [...badLinks.entries()].map(([file, links]) => [
            dv.fileLink(file),
            links.join("\n")
        ]);

        const embedResults = [...badEmbeds.entries()].map(([file, embeds]) => [
            dv.fileLink(file),
            embeds.join("\n")
        ]);

        return { linkResults, embedResults };
    }

    dv.header(4, "**❥ Forgotten Notes**");
    dv.list(getRandomFilteredPages(
        p => dv.date(p.file.mtime) < today.minus({ months: 3 })
    ));

    dv.header(4, "**❥ Empty Notes**");
    dv.list(getRandomFilteredPages(
        p => p.file.size >= 0 && p.file.size < 10
    ));

    dv.header(4, "**❥ Bad Links**");
    dv.list(await findBadLinksAndEmbeds().linkResults);

    dv.header(4, "**❥ Bad Embeds**");
    dv.list(await findBadLinksAndEmbeds().embedResults);

    dv.header(4, "**❥ Orphaned Images**");
    dv.list(findOrphanedImages());

    dv.header(4, "**❥ Orphaned Notes**");
    dv.list(getRandomFilteredPages(
        p => p.file.inlinks && p.file.outlinks
    ));

    // ***********************************************

    dv.header(1, `<a href="https://github.com/huaminghuangtw/Daily-Bullet-Journal">📝 Journaling</a>`);

    // -----------------------------------------------

    dv.paragraph(`
> [!TODO] 🐥 <a href="${await Utils.buildObsidianOpenFileURI("Daily-Bullet-Journal/JournalBacklog.md")}">Backlog</a>
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

    dv.header(1, `<a href="https://github.com/huaminghuangtw/Weekly-Mindware-Update">🦸🏽‍♂️ Deep Work Machine</a>`);

    const images = ["Number of Flows", "Number of Words"].map(metric =>
        encodeURI(Utils.getAllFilesByExtension(`Deep-Work-Machine/${metric}`, "png")[0].path)
    );

    dv.paragraph(`
> [!EXAMPLE] 📊 ${today.minus({ months: 1 }).toFormat("MMMM yyyy")}
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
                    Utils.getAllFilesByExtension("EvergreenLists", "json")
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

    const latestWMUButton = document.createElement('button');

    latestWMUButton.innerText = `📖 Read Latest WMU`;

    latestWMUButton.classList.add("common", "latest-wmu-button");

    latestWMUButton.onclick = async () => {
        window.open(
            await Utils.buildObsidianOpenFileURI(
                        dv.pages(`"Weekly-Mindware-Update"`)
                        .where(p => !p.file.name.includes("README"))
                        .sort(p => p.file.name, 'desc')[0].file.path
                    )
        );
    };

    dv.container.appendChild(latestWMUButton);

    // -----------------------------------------------

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

    // ***********************************************

    // dv.header(1, "⌨️ Obsidian Hotmetrics");

    // // 🙏 Modified from: https://forum.obsidian.md/t/obsidian-commands-hotmetrics-and-duplicate-hotmetric-assignments/55193

    // const splitIdColumn = false;
    // const nameColumn = true;
    // const showDefaultMetrics = false;
    // const showCustomMetrics = true;
    // const showCommandsWithoutMetrics = false;
    // const showDuplicatedHotmetrics = true;
    // const highlightCustomMetrics = false;
    // const useSymbolsForModifiers = true;

    // /**********************
    // Sorting options:
    // - "id"        // module + cmdname
    // - "cmdname"   // only cmdname
    // - "fullname"  // full descriptive name
    // - "metriccount"  // Metrics defined for this command
    // - "metrics"      // "character + modifiers" for first command
    // **********************/
    // const sort = "fullname";
    // const ascending = true;

    // const showAllModules = true;
    // /*******************************************
    // Some of the default modules in Obsidian:
    // - 'editor',
    // - 'app',
    // - 'workspace',
    // - 'theme',
    // - 'markdown',
    // - 'file-explorer',
    // - 'window',
    // - 'graph',
    // - 'backlink',
    // - 'canvas',
    // - 'starred',
    // - 'open-with-default-app',
    // - 'global-search',
    // - 'switcher',
    // - 'outgoing-links',
    // - 'daily-notes',
    // - 'tag-pane',
    // - 'note-composer',
    // - 'command-palette',
    // - 'outline',
    // - 'file-recovery',
    // *******************************************/

    // let excludeModules = ['exclude-this-plugin'];
    // let includeModules = [];

    // let idColumn = false;
    // idColumn = idColumn && !splitIdColumn;
    // let metricsColumn = true;
    // metricsColumn = metricsColumn && (showDefaultMetrics || showCustomMetrics);

    // let cmds = {}, metrics = {};

    // dv.array(Object.values(app.commands.commands)).forEach(cmd => {
    //     cmds[cmd.id] = {
    //         id: cmd.id,
    //         moduleId: cmd.id.split(":")[0],
    //         moduleCmdName: cmd.id.split(":")[1],
    //         name: cmd.name,
    //         defMetrics: cmd.hotmetrics || [],
    //         custMetrics: app.hotmetricManager.customMetrics[cmd.id] || [],
    //         metricCount: 0
    //     };

    //     if (cmds[cmd.id].custMetrics.length) cmds[cmd.id].defMetrics = [];

    //     [...cmds[cmd.id].defMetrics, ...cmds[cmd.id].custMetrics].forEach(aMetric => {
    //         const metricCombo = joinModifiers(aMetric.modifiers) + aMetric.metric;
    //         if (!metrics[metricCombo]) metrics[metricCombo] = [];
    //         metrics[metricCombo].push(cmd.id);
    //         cmds[cmd.id].metricCount++;
    //     });
    // });

    // let headers = [];

    // if (idColumn) headers.push("Command ID");
    // if (splitIdColumn) headers.push("Module ID", "Module CmdName");
    // if (nameColumn) headers.push("Command");
    // if (metricsColumn) headers.push("Hotmetric");

    // dv.table(headers,
    // dv.array(Object.values(cmds))
    //     .filter(
    //         cmd =>
    //             (showDefaultMetrics && cmd.defMetrics.length) ||
    //             (showCustomMetrics && cmd.custMetrics.length) ||
    //             (showCommandsWithoutMetrics && !cmd.metricCount)
    //     )
    //     .filter(
    //         cmd => showAllModules ? !excludeModules.includes(cmd.moduleId) : includeModules.includes(cmd.moduleId)
    //     )
    //     .sort(
    //         cmd =>
    //             sort == "fullname" ? cmd.name : sort == "cmdname"
    //                 ? cmd.moduleCmdName : sort == "metriccount"
    //                 ? cmd.metricCount : sortmetrics(cmd.defMetrics, cmd.custMetrics), ascending
    //                 ? "asc" : "desc"
    //     )
    //     .map(cmd => {
    //         let columns = [];
    //         if (idColumn) columns.push(cmd.id);
    //         if (splitIdColumn) columns.push(cmd.moduleId, cmd.moduleCmdName);
    //         if (nameColumn) columns.push(cmd.name);
    //         if (metricsColumn) columns.push(hotmetrics(cmd.defMetrics, cmd.custMetrics));
    //         return columns;
    //     })
    // );

    // if (showDuplicatedHotmetrics) {
    //     const excludedCommandIds = [
    //         'app:delete-file',
    //         'global-search:open'
    //     ];
    //     const duplicates = dv.array(Object.entries(metrics))
    //         .filter(
    //             k => k[1].length > 1 &&
    //             !k[1].some(cmdId => excludedCommandIds.includes(cmdId))
    //         );
    //     if (duplicates.length) {
    //         dv.paragraph("");
    //         dv.table(
    //             ["Duplicates", "Hotmetric"],
    //             duplicates.map(k => [k[1].map(i => cmds[i].name), k[0]])
    //         );
    //     }
    // }

    // function joinModifiers(modifiers) {
    //     const symbols = useSymbolsForModifiers;
    //     return modifiers.sort()
    //                     .join(' ')
    //                     .replace('Mod', symbols ? '⌘' : 'CMD')
    //                     .replace('Alt', symbols ? '⌥' : 'OPT')
    //                     .replace('Ctrl', symbols ? '⌃' : 'CTRL')
    //                     .replace('Shift', symbols ? '⇧' : 'SHIFT')
    //                     + (modifiers.length ? ' ' : '');
    // }

    // function hotmetrics(defMetrics, custMetrics) {
    //     let metrics = [];
    //     if (showDefaultMetrics) defMetrics.forEach(aMetric => metrics.push(
    //         joinModifiers(aMetric.modifiers) + (aMetric.metric == ' ' ? 'Space' : aMetric.metric)
    //     ));
    //     if (showCustomMetrics) custMetrics.forEach(
    //         aMetric => metrics.push((highlightCustomMetrics ? "==" : "")
    //                 + joinModifiers(aMetric.modifiers)
    //                 + (aMetric.metric == ' ' ? 'Space' : aMetric.metric)
    //                 + (highlightCustomMetrics ? "==" : "")));
    //     return metrics.join("<br />");
    // }

    // function sortmetrics(defMetrics, custMetrics) {
    //     return [...defMetrics, ...custMetrics].map(
    //         m => m.metric + joinModifiers(m.modifiers)
    //     ).join(":");
    // }
}
```
