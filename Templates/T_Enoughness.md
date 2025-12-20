<%*
await tp.user.show_tag_newsletter();
const result = await tp.user.createWritingPost(tp);
if (!result) return;
const { title, fileName } = result
const issue = app.vault
		.getFiles()
		.filter((f) => f.path.startsWith("Enoughness/posts/") && f.extension === "md")
		.length;
const fridayDate = moment().weekday(5);
const canonicalPath = `${fridayDate.format('YYYY/M/D')}/enoughness-${issue}`;
-%>
---
draft: true
title: ⚖️ <% title %>
canonicalPath: <% canonicalPath %>
slug: enoughness-<% issue %>
description: "<% `Enoughness #${issue}` %>"
issue: <% issue %>
created: <% fridayDate.format('YYYY-MM-DD[T00:00:00]') %>
---

<!-- SELF-INTRO-START -->

_嗨，我是 [黃樺明](https://huami.ng)，我熱愛 [寫作](https://huami.ng/writing)、[戶外運動](https://www.strava.com/athletes/huaminghuang)、[開發提升生活品質的軟體工具](https://github.com/huaminghuangtw)。若有一天必須留下 [墓誌銘](https://huami.ng/2025/7/15/live-each-day-as-if-it-were-your-last)，我希望上面寫著：他致力於 [改善人類的手機使用習慣](https://shortcutomation.com)，也努力 [讓臺灣的學生運動員擁有更好的教育環境和適應環境的能力](https://adaptx.tw)。Enoughness，是我從 2023 年開始每天練習的生活哲學，一種「剛剛好」的生活態度。每週，我會在這份電子報分享幾件觸動我 [好奇心](https://huami.ng/weekly-mindware-update) 的事物、想法與學習。如果這封信是朋友轉寄給你的，歡迎 [點此訂閱](https://huami.ng/newsletter)。想看看過往內容？[歷年電子報](https://huami.ng/enoughness) 都在這裡。_

<!-- SELF-INTRO-END -->

---

# 1

<% tp.file.cursor() %>

# 2

# 3

# 4

# 5

— [樺明](https://huami.ng/<% canonicalPath %>)

---

<p align="center">
<sub>

<br>

</sub>
</p>
