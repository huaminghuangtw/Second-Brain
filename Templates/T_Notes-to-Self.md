<%*
const result = await tp.user.createWritingPost(tp);
if (!result) return;
const { title, created } = result;
-%>
---
created: <% created %>
canonicalURL: https://adaptx.tw/<% title %>
related: []
---

<% tp.file.cursor() %>
