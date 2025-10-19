<%*
const result = await tp.user.createWritingPost(tp);
const { title, fileName } = result;
const categories = ["Essay", "YouTube Video"];
const category = await tp.system.suggester(categories, categories, false, "🤖 Which one? ");
const url = await tp.system.prompt("🔗 URL?") || "https://";
-%>
---
draft: true
title: ▍<% title %>
description:
category: <% category %>
url: <% url %>
---

<% tp.file.cursor() %>
