<%*
const result = await tp.user.createWritingPost(tp);
if (!result) return;
const { title, fileName, collection } = result;
const canonicalPath = `${moment().format('YYYY/M/D')}/${fileName}`;
-%>
---
draft: true
featured: false
title: <% title %>
description:
canonicalPath: <% canonicalPath %>
tags: [/<% collection %>/]
sources: []
---

Today I learned <% tp.file.cursor() %>
