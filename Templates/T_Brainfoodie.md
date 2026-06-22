<%*
const result = await tp.user.createPost(tp);
if (!result) return;
const { title, created } = result;
const categories = [
    "Book",
    "Excerpt",
    "Essay",
    "Poem",
    "Parable",
    "Podcast",
    "Letter",
    "Inspiring Speech",
    "TED Talk",
    "YouTube Video",
    "Movie",
    "Documentary",
    "People"
];
const category = await tp.system.suggester(categories, categories, false, "🤖 Which one? ");
let authorsInput = "";
if (category !== "Parable") {
    authorsInput = (await tp.system.prompt("👤 Author(s)? (comma-separated)")) || "";
}
-%>
---
created: <% created %>
title: ▍<% title %>
category: <% category %>
<%* if (category !== "Parable") { %>
authors: [<% authorsInput %>]
<%* } %>
tags: []
---

<% tp.file.cursor() %>
