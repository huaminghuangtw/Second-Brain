<%*
const result = await tp.user.createWritingPost(tp);
if (!result) return;
const { title, fileName, collection } = result;
-%>
---
canonicalURL: <% `https://adaptx.tw/${moment().format('YYYY/M/D')}/${fileName}` %>
draft: true
featured: false
title: <% title %>
description:
tags: [<% collection %>/]
ogImage: ../_attachments/
---

<% tp.file.cursor() %>
