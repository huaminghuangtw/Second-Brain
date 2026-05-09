<%*
const result = await tp.user.createPost(tp);
if (!result) return;
const { title, created } = result;
-%>
---
created: <% created %>
draft: true
title: <% title %>
tags: 
---

<% tp.file.cursor() %>
