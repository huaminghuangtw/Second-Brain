<%*
const result = await tp.user.createBlogPost(tp);
if (!result) return;
const { title, project, tags } = result;
const tagsList = tags && tags.length > 0
  ? tags.map(tag => `  - ${tag}`).join('\n')
  : `  - ${project}/`;
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

<% tp.file.cursor() %>
