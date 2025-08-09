<%*
const result = await tp.user.createProjectPost(tp);
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
tags:
<% tagsList %>
---

<% tp.file.cursor() %>
