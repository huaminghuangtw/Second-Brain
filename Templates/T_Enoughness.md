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
language:
---

<% tp.file.cursor() %>
