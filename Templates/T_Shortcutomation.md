<%*
let project = "Shortcutomation";
let title = await tp.system.prompt(`📱 ${project} Title?`);
let folder = `${project}/posts/`;
let slugifiedTitle = tp.user.slugify(title);
await tp.file.rename(slugifiedTitle);
await tp.file.move(folder + slugifiedTitle);
-%>
---
draft: true
title: <% title %>
tags:
  - <% project %>/
---

<% tp.file.cursor() %>
