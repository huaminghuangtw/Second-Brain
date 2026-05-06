<%*
const result = await tp.user.createWritingPost(tp);
if (!result) return;
const { title, fileName, collection, created } = result;
const canonicalPath = `${moment().format('YYYY/M/D')}/${fileName}`;
-%>
---
created: <% created %>
draft: true
featured: false
title: <% title %>
canonicalPath: <% canonicalPath %>
tags: [/<% collection %>/]
sources: []
---

Today I learned <% tp.file.cursor() %>
