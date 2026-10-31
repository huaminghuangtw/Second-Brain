<%*
const result = await tp.user.createPost(tp);
if (!result) return;
const { filename } = result
-%>
---
title: _<% title %>
---

<% tp.file.cursor() %>
