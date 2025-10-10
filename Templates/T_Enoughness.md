<%*
const result = await tp.user.createBlogPost(tp);
const { title, blog, issueNumber } = result;
-%>
---
canonicalURL: <% `https://adaptx.tw/${moment().format('YYYY/M/D')}/${fileName}` %>
draft: true
featured: false
title: <% title %>
tags: [/<% blog %>/]
issue: <% issueNumber %>
---

嘿朋友們，這週你知足了嗎？

<% tp.file.cursor() %>

新的一週，讓我們一起練習找到那個「剛剛好」的甜蜜點。
