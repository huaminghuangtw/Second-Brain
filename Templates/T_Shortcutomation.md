<%*
const result = await tp.user.createBlogPost(tp);
const { title, blog, tags } = result;
-%>
---
canonicalURL: <% `https://shortcutomation.com/${moment().format('YYYY/M/D')}/${tp.user.slugify(title)}` %>
draft: true
featured: false
title: <% title %>
description:
tags: <% tags %>
---

<% tp.file.cursor() %>
