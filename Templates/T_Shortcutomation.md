<%*
const result = await tp.user.createPost(tp);
if (!result) return;
const { title, created } = result;
-%>
---
created: <% created %>
draft: true
featured: false
title: <% title %>
tags: []
aliases: []
---

<% tp.file.cursor() %>
