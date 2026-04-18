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

_嗨，我是 [黃樺明](https://huam.ing)，我熱愛 [寫作](https://huam.ing/writing)、[耐力運動](https://www.strava.com/athletes/huaminghuang)、[開發提升生活品質的軟體工具](https://github.com/huaminghuangtw)。若有一天必須留下 [墓誌銘](https://huam.ing/2025/7/15/live-each-day-as-if-it-were-your-last)，我希望上面寫著：他致力於 [改善人類的手機使用習慣](https://shortcutomation.com)，也努力 [讓臺灣的學生運動員擁有更好的教育和訓練環境](https://adaptx.tw)。Enoughness，是我從 2023 年開始每天練習的生活哲學，一種「剛剛好」的生活態度。每週，我會在這份電子報分享幾件觸動我 [好奇心](https://huam.ing/weekly-mindware-update) 的事物、想法與學習。如果這封信是朋友轉寄給你的，歡迎 [點此訂閱](https://huam.ing/newsletter)。想看看過往內容？[歷年電子報](https://huam.ing/enoughness) 都在這裡。_

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
