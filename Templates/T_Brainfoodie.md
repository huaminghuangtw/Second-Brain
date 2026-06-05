<%*
const result = await tp.user.createPost(tp);
if (!result) return;
const { title, created } = result;
const categories = [
    "Book",
    "Excerpt",
    "Essay",
    "Poem",
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
const authorsInput = await tp.system.prompt("👤 Author(s)? (comma-separated for multiple)") || "";
const authors = authorsInput.split(',').map(a => a.trim()).filter(a => a);
-%>
---
created: <% created %>
title: ▍<% title %>
category: <% category %>
authors: <% authors.length === 1 ? authors[0] : `\n${authors.map(a => ` - ${a}`).join('\n')}` %>
---

<% tp.file.cursor() %>
