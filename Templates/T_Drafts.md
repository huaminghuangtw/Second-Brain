<%*
const result = await tp.user.createPost(tp);
if (!result) return;
$Use$const { title } = result;
-%>
---
title: _<% title %>
---

<% tp.file.cursor() %>
