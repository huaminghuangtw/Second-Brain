<%*
const result = await tp.user.createBlogPost(tp);
if (!result) return;
const { blog, tags } = result;
const tagsList = tags && tags.length > 0
  ? tags.map(tag => `  - ${tag}`).join('\n')
  : `  - ${blog}/`;
-%>
---
draft: true
featured: false
tags:
<% tagsList %>
---

<% tp.file.cursor() %>
