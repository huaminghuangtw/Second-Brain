<%*
const result = await tp.user.createBlogPost(tp);
if (!result) return;
const { title, blog, tags } = result;
const tagsList = tags && tags.length > 0
  ? tags.map(tag => `  - ${tag}`).join('\n')
  : `  - ${blog}/`;
-%>
---
draft: true
featured: false
title: <% title %>
description: 
tags:
<% tagsList %>
sources:
  - 
---

Today I learned <% tp.file.cursor() %>
