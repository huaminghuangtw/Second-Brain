<%*
const result = await tp.user.createWritingPost(tp);
if (!result) return;
const { title, fileName, collection, created } = result;
const canonicalPath = `${moment().format('YYYY/M/D')}/${fileName}`;
-%>
---
created: <% created %>
canonicalUrl: https://adaptx.tw/<% canonicalPath %>
canonicalPath: <% canonicalPath %>
draft: true
featured: false
title: <% title %>
description:
tags: [<% collection %>/]
coverImage: _coverImages/
---

<% tp.file.cursor() %>
