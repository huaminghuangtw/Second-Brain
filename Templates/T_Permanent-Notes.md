<%*
const result = await tp.user.createWritingPost(tp);
if (!result) return;
const { title } = result;
-%>
---
title: <% title %>
---

<% tp.file.cursor() %>
