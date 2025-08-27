<%*
const result = await tp.user.createBlogPost(tp);
const { title } = result;
-%>
---
title: <% title %>
---

<% tp.file.cursor() %>
