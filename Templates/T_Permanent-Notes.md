<%*
const result = await tp.user.createWritingPost(tp);
const { title } = result;
-%>
---
title: <% title %>
---

<% tp.file.cursor() %>
