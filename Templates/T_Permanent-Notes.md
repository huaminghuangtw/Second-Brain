<%*
const result = await tp.user.createBlogPost(tp);
if (!result) return;
const { title } = result;
-%>
---
title: <% title %>
---

<% tp.file.cursor() %>
