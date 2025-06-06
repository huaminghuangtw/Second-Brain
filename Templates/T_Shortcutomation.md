<%*
let title = await tp.system.prompt("📱 Newsletter title for Shortcutomation?");
let year = tp.date.now('YYYY');
let month = tp.date.now('MM');
let day = tp.date.now('DD');
let folder = `Newsletter/Shortcutomation/${year}/${month}/${day}/`;
await tp.file.rename(title);
await tp.file.move(folder + title);
-%>
---
draft: true
title: <% title %>
publishDate: <% tp.date.now("YYYY-MM-DD") %>
tags: [Shortcutomation/]
---

<% tp.file.cursor() %>
