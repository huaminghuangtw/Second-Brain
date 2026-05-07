<%*
const result = await tp.user.createPost(tp);
if (!result) return;
const { title, collection, created, canonicalPath } = result;
-%>
---
created: <% created %>
canonicalPath: <% canonicalPath %>
draft: true
featured: false
title: <% title %>
tags: [<% collection %>/]
---

<% tp.file.cursor() %>
