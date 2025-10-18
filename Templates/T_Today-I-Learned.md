<%*
const result = await tp.user.createWritingPost(tp);
const { title, collection } = result;
-%>
---
draft: true
featured: false
title: <% title %>
description:
tags: [/<% collection %>/]
sources: []
---

Today I learned <% tp.file.cursor() %>
