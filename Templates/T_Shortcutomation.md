<%*
const result = await tp.user.createBlogPost(tp);
const { title, fileName, blog } = result;
-%>
---
canonicalURL: <% `https://shortcutomation.com/${moment().format('YYYY/M/D')}/${fileName}` %>
draft: true
featured: false
title: <% title %>
description:
tags: [<% blog %>/]
---

<% tp.file.cursor() %>
