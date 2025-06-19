<%*
const inputDate = await tp.user.datePicker();
const momentDate = moment(inputDate, "YYYY-MM-DD");

const formatISO8601Date = (m) => m.format("YYYY-MM-DD");
const formatFileName = (m) => m.format("YYYY_MM_DD");
const adjustDate = (m, days) => m.clone().add(days, 'days');
const getISOWeekNumber = (m) => m.isoWeek();

const today = formatISO8601Date(momentDate);
const prevDate = formatISO8601Date(adjustDate(momentDate, -1));
const nextDate = formatISO8601Date(adjustDate(momentDate, 1));

const fileName = formatFileName(momentDate);
const prevFile = formatFileName(adjustDate(momentDate, -1));
const nextFile = formatFileName(adjustDate(momentDate, 1));

const dayOfWeek = momentDate.format("dddd");
const weekNumber = getISOWeekNumber(momentDate);

const file = tp.file.find_tfile(fileName);
if (file) {
    app.workspace.getLeaf("tab").openFile(file);
    return;
} else {
    const year = momentDate.format("YYYY");
    const month = momentDate.format("MM") + "-" + momentDate.format("MMMM");
    const folder = `Daily-Bullet-Journal/${year}/${month}/`;
    await tp.file.rename(fileName);
    await tp.file.move(folder + fileName);
}
-%>
---
date: <% today %>
dayOfWeek: <% dayOfWeek %>
weekNumber: <% weekNumber %>
---

# 📝 <% today %>

◀ [<% prevDate %>](<% prevFile %>.md) | [<% nextDate %>](<% nextFile %>.md) ▶

## Daily Highlights

* <% tp.file.cursor() %>

## I Am Grateful for

## Wins I Achieved

## Things I Can Improve