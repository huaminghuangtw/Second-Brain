<%*
const result = await tp.user.createPost(tp);
if (!result) return;
const { title } = result
-%>
---
title: _<% title %>
---

<% tp.file.cursor() %>
