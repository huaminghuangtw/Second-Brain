<%*
const result = await tp.user.createProjectPost(tp, "Today-I-Learned", "👨‍💻");
if (!result) return;
const { title, project } = result;
-%>
---
draft: true
title: <% title %>
description: 
tags:
  - <% project %>
sources:
  - 
---

<% tp.file.cursor() %>
