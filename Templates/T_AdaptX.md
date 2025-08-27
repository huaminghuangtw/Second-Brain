<%*
const result = await tp.user.createBlogPost(tp);
const { title, blog, tags } = result;
---
draft: true
featured: false
title: <% title %>
description: 
tags: <% tags %>
---

<% tp.file.cursor() %>
