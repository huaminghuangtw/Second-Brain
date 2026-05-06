<%*
const result = await tp.user.createWritingPost(tp);
if (!result) return;
const { title, created } = result;
-%>
---
created: <% created %>
related: []
---

<% tp.file.cursor() %>
