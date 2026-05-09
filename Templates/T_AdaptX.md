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
tags: 
coverImage: _coverImages/
---

<% tp.file.cursor() %>
