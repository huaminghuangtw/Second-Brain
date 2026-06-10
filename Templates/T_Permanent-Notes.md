<%*
const result = await tp.user.createPost(tp);
if (!result) return;
const { title } = result;
-%>
---
title: <% title %>
tags: []
---

<% tp.file.cursor() %>
