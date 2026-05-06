<%*
const result = await tp.user.createWritingPost(tp);
if (!result) return;
const { title, fileName, collection, created } = result;
const canonicalPath = `${moment().format('YYYY/M/D')}/${fileName}`;
-%>
---
created: <% created %>
canonicalPath: <% canonicalPath %>
draft: true
featured: false
title: <% title %>
tags: [<% collection %>/]
coverImage: _coverImages/
---

<% tp.file.cursor() %>
