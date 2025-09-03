<%*
const result = await tp.user.createBlogPost(tp);
const { title, blog } = result;
-%>
---
canonicalURL: <% `https://adaptx.tw/${title}` %>
prev: "[[<% moment(title, "YYYY-MM-DD").subtract(1, "day").format("YYYY-MM-DD") %>]]"
next: "[[<% moment(title, "YYYY-MM-DD").add(1, "day").format("YYYY-MM-DD") %>]]"
created: <% moment(title, "YYYY-MM-DD").format("YYYY-MM-DDT00:00:00") %>
related: []
---

<% tp.file.cursor() %>
