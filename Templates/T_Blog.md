<%*
const result = await tp.user.createPost(tp);
if (!result) return;
const { title, collection, created } = result;
-%>
---
created: <% created %>
draft: true
title: <% title %>
tags: [<% collection %>/]
---

<% tp.file.cursor() %>
