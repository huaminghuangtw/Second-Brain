<%*
let project = "Today-I-Learned";
let title = await tp.system.prompt("👨‍💻 ${project} title?");
let folder = `${project}/posts`;
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
