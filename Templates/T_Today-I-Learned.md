<%*
const result = await tp.user.createPost(tp);
if (!result) return;
const { title, collection, created, canonicalPath } = result;
-%>
---
created: <% created %>
draft: true
title: <% title %>
canonicalPath: <% canonicalPath %>
tags: [/<% collection %>/]
sources: []
---

Today I learned <% tp.file.cursor() %>
