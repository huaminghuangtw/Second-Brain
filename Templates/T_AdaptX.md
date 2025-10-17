<%*
const result = await tp.user.createBlogPost(tp);
const { title, fileName, blog } = result;
-%>
---
canonicalURL: <% `https://adaptx.tw/${moment().format('YYYY/M/D')}/${fileName}` %>
draft: true
featured: false
title: <% title %>
description:
tags: [<% blog %>/]
ogImage: ../_attachments/
---

<% tp.file.cursor() %>
