<%*
const result = await tp.user.createProjectPost(tp, "Shortcutomation", "📱");
if (!result) return;
const { title, project } = result;
-%>
---
draft: true
title: <% title %>
tags:
  - <% project %>
---

<% tp.file.cursor() %>
