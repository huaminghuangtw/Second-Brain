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
let authorsOutput = "";
if (category !== "Parable") {
    authorsInput = (await tp.system.prompt("👤 Author(s)? (comma-separated)")) || "";
    const authorsList = authorsInput.split(",").map(a => a.trim()).filter(a => a);
    authorsList.length > 1 ? authorsOutput = "[" + authorsList.join(", ") + "]" : authorsOutput = authorsList[0];
}
-%>
---
created: <% created %>
title: ▍<% title %>
category: <% category %>
<%* if (category !== "Parable") { %>
authors: <% authorsOutput %>
<%* } %>
tags: []
---

<% tp.file.cursor() %>
