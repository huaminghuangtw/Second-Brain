<%\*
const momentDate = moment(await tp.user.datePicker(tp), "YYYY-MM-DD");

const today = momentDate.format("YYYY-MM-DD");
const prevDate = moment(momentDate).add(-1, 'days').format("YYYY-MM-DD");
const nextDate = moment(momentDate).add(1, 'days').format("YYYY-MM-DD");

const fileName = momentDate.format("YYYY_MM_DD");
const prevFile = moment(momentDate).add(-1, 'days').format("YYYY_MM_DD");
const nextFile = moment(momentDate).add(1, 'days').format("YYYY_MM_DD");

const dayOfWeek = momentDate.format("dddd");
const weekNumber = momentDate.isoWeek();

const folder = `Daily-Bullet-Journal/journals/${momentDate.format("YYYY")}/${momentDate.format("MM")}-${momentDate.format("MMMM")}/`;
const file = tp.file.find_tfile(folder + fileName);

if (file) {
window.open(
`obsidian://adv-uri?filepath=${encodeURIComponent(
            file.path
        )}&viewmode=source&openmode=true&line=${await (async () =>
            (await app.vault.read(file)).split("\n").length)()}`
);
return;
} else {
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

-   <% tp.file.cursor() %>

## I Am Grateful for

## Wins I Achieved

## Things I Can Improve
