<%*
const result = await tp.user.createWritingPost(tp);
if (!result) return;
const { title } = result;
-%>
---
canonicalURL: https://adaptx.tw/<% title %>
created: <% moment(title, "YYYY-MM-DD").format("YYYY-MM-DDT00:00:00") %>
related: []
---

<% tp.file.cursor() %>
