<%*
const result = await tp.user.createBlogPost(tp);
const { title, blog } = result;
-%>
---
draft: true
featured: false
title: <% title %>
description:
tags: [/<% blog %>/]
sources: []
---

Today I learned <% tp.file.cursor() %>
