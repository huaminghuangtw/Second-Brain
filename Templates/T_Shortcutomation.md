<%*
const result = await tp.user.createWritingPost(tp);
const { title, fileName, collection } = result;
-%>
---
canonicalURL: <% `https://shortcutomation.com/${moment().format('YYYY/M/D')}/${fileName}` %>
draft: true
featured: false
title: <% title %>
description:
tags: [<% collection %>/]
---

<% tp.file.cursor() %>
