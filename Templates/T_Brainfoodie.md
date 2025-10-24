<%*
const result = await tp.user.createWritingPost(tp);
if (!result) return;
const { title, fileName } = result;
const categories = ["Book", "Essay", "YouTube Video"];
const category = await tp.system.suggester(categories, categories, false, "🤖 Which one? ");
const author = await tp.system.prompt("👤 Author?") ? tp.user.toTitleCase(authorInput) : "";
const url = await tp.system.prompt("🔗 URL?") || "";
-%>
---
draft: true
title: "▍<% title %>"
category: <% category %>
author: <% author %>
url: <% url %>
---

<% tp.file.cursor() %>
