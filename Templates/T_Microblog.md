<%*
const result = await tp.user.createPost(tp);
if (!result) return;
const { created } = result;
-%>
---
created: <% created %>
tags: []
---

<% tp.file.cursor() %>
