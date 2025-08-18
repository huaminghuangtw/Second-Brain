<%*
const result = await tp.user.createBlogPost(tp);
if (!result) return;
const { title, blog, tags } = result;
const tagsList = tags && tags.length > 0
  ? tags.map(tag => `  - ${tag}`).join('\n')
  : `  - ${blog}/`;
-%>
---
tags:
<% tagsList %>
prev: "[[<% moment(title, "YYYY-MM-DD").subtract(1, "day").format("YYYY-MM-DD") %>]]"
next: "[[<% moment(title, "YYYY-MM-DD").add(1, "day").format("YYYY-MM-DD") %>]]"
created: <% moment(title, "YYYY-MM-DD").format("YYYY-MM-DDT00:00:00") %>
---

<% tp.file.cursor() %>
