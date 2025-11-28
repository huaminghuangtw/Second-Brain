<%*
const result = await tp.user.createWritingPost(tp);
if (!result) return;
const { title, fileName } = result;
const categories = ["Book", "Essay", "Podcast", "Inspiring Speech", "TED Talk", "YouTube Video", "Movie", "Documentary"];
const category = await tp.system.suggester(categories, categories, false, "🤖 Which one? ");
const authorsInput = await tp.system.prompt("👤 Author(s)? (comma-separated for multiple)") || "";
const authors = authorsInput.split(',').map(a => a.trim()).filter(a => a);
const url = await tp.system.prompt("🔗 URL?") || "";
-%>
---
draft: true
title: “▍<% title %>”
category: <% category %>
author: <% authors.length === 1 ? authors[0] : `\n${authors.map(a => ` - ${a}`).join('\n')}` %>
url: <% url %>
---

<% tp.file.cursor() %>
