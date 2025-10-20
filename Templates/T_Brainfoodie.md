<%*
const result = await tp.user.createWritingPost(tp);
const { title, fileName } = result;
const categories = ["Book", "Essay", "YouTube Video"];
const category = await tp.system.suggester(categories, categories, false, "🤖 Which one? ");
const author = await tp.system.prompt("👤 Author?") ? tp.user.toTitleCase(authorInput) : "Unknown";
const url = await tp.system.prompt("🔗 URL?") || "https://";
-%>
---
draft: true
title: "▍<% title %>"
description: by <% author %>
category: <% category %>
url: <% url %>
---

<% tp.file.cursor() %>
