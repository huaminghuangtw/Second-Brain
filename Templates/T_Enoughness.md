<%*
await tp.user.showTagNewsletter();
const result = await tp.user.createWritingPost(tp);
if (!result) return;
const { title, created } = result
const issue = app.vault
		.getFiles()
		.filter((f) => f.path.startsWith("Enoughness/posts/") && f.extension === "md")
		.length;
const slug = `enoughness-${issue}`;
const canonicalPath = `${created.format('YYYY/M/D')}/${slug}`;
-%>
---
created: <% created.format('YYYY-MM-DD') %>
draft: true
title: ⚖️ <% title %>
canonicalPath: <% canonicalPath %>
slug: <% slug %>
description: "<% `Enoughness #${issue}` %>"
issue: <% issue %>
---

<!-- SELF-INTRO-START -->

_嗨，我是 [黃樺明](https://huam.ing)，我熱愛 [寫作](https://huam.ing/writing)、[耐力運動](https://www.strava.com/athletes/huaminghuang)、[開發提升生活品質的軟體工具](https://github.com/huaminghuangtw)。Enoughness，剛剛好，是我從 2023 年開始每天練習的生活態度。每週，我會在這份電子報分享三件有趣的事。如果這封信是朋友轉寄給你的，歡迎 [點此訂閱](https://huam.ing/newsletter)。想看看過往內容？[歷年電子報](https://huam.ing/enoughness) 都在這裡。_

<!-- SELF-INTRO-END -->

---

# 1

<% tp.file.cursor() %>

# 2

# 3

— [樺明](https://huam.ing/<% canonicalPath %>)

---

<p align="center">
<sub>

<br>

</sub>
</p>
