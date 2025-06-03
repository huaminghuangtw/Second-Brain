<%*
const inputDate = await tp.system.prompt("📝 Journal date? (YYYY-MM-DD)");
const dateObj = new Date(inputDate);

// Utilities
// Get YYYY-MM-DD ("2025-04-16") from ISO string ("2025-04-16T12:34:56.789Z")
const formatDate = (date) => date.toISOString().slice(0, 10);
const formatFileName = (date) => formatDate(date).replace(/-/g, "_");
const adjustDate = (date, days) => {
  const newDate = new Date(date);
  newDate.setDate(newDate.getDate() + days);
  return newDate;
};
const getISOWeekNumber = (date) => {
  const tempDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const day = tempDate.getUTCDay() || 7;
  tempDate.setUTCDate(tempDate.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(tempDate.getUTCFullYear(), 0, 1));
  return Math.ceil((((tempDate - yearStart) / 86400000) + 1) / 7);
};

const today = formatDate(dateObj);
const prevDate = formatDate(adjustDate(dateObj, -1));
const nextDate = formatDate(adjustDate(dateObj, 1));

const fileName = formatFileName(dateObj);
const prevFile = formatFileName(adjustDate(dateObj, -1));
const nextFile = formatFileName(adjustDate(dateObj, 1));

const dayOfWeek = dateObj.toLocaleDateString("en-US", { weekday: "long" });
const weekNumber = getISOWeekNumber(dateObj);

await tp.file.rename(fileName);
const year = dateObj.getFullYear();
const month = `${(dateObj.getMonth() + 1).toString().padStart(2, "0")}-${dateObj.toLocaleString("en-US", { month: "long" })}`;
const folder = `Daily-Bullet-Journal/${year}/${month}/`;
await tp.file.move(folder + fileName);
-%>
---
date: <% today %>
dayOfWeek: <% dayOfWeek %>
weekNumber: <% weekNumber %>
---

# 📝 <% today %>

| [PREV: <% prevDate %>](<% prevFile %>.md) | [NEXT: <% nextDate %>](<% nextFile %>.md) |
| :---: | :---: |

## Daily Highlights

<% tp.file.cursor() %>

## I Am Grateful for

## Wins I Achieved

## Things I Can Improve