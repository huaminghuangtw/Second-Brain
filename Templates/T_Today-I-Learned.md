<%*
let title = await tp.system.prompt("👨‍💻 TIL title?");
let year = tp.date.now('YYYY');
let month = tp.date.now('MM');
let day = tp.date.now('DD');
let folder = `Today-I-Learned/${year}/${month}/${day}/`;
await tp.file.rename(title);
await tp.file.move(folder + title);
-%>
---
draft: true
date: <% tp.date.now("YYYY-MM-DD") %>
tags: []
---

> ****

<% tp.file.cursor() %>
