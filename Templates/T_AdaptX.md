<%*
const result = await tp.user.createBlogPost(tp);
const { title, blog, tags } = result;
-%>
---
canonicalURL: <% `https://adaptx.tw/${moment().format('YYYY/M/D')}/${tp.user.slugify(title)}` %>
draft: true
featured: false
title: <% title %>
description:
tags: <% tags %>
ogImage: ../_attachments/
---

<% tp.file.cursor() %>
