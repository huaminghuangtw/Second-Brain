<%*
const result = await tp.user.createWritingPost(tp);
const { title, fileName } = result;
const issue = app.vault
    .getFiles()
    .filter((f) => f.path.startsWith("Enoughness/posts/") && f.extension === "md")
    .length;
-%>
---
draft: true
title: <% title %>
slug: enoughness-<% issue %>
description: "<% `Enoughness #${issue}` %>"
issue: <% issue %>
---

_嗨，我是 [黃樺明](https://huami.ng)，我熱愛 [寫作](https://huami.ng/writing)、[騎公路車](https://www.strava.com/athletes/huaminghuang)、[開發提升生活品質的軟體工具](https://github.com/huaminghuangtw)。我追求的 [墓誌銘](https://huami.ng/2025/7/15/live-each-day-as-if-it-were-your-last)，是 [改善人類的手機使用習慣](https://shortcutomation.com)，以及 [讓臺灣的教育與體育環境變得更好](https://adaptx.tw)。Enoughness，是我從 2023 年開始每天練習的生活哲學，一種「剛剛好」的生活態度。每週，我會在這份電子報分享十件觸動我 [好奇心](https://huami.ng/weekly-mindware-update) 的事物、想法與學習。如果這封信是朋友轉寄給你的，歡迎[點此訂閱](https://huami.ng/newsletter)。想看看過往內容？[歷年電子報](https://huami.ng/enoughness)都在這裡。_

---

<!---QuoteOfTheWeek--->

1. <% tp.file.cursor() %>

— [樺明](https://huami.ng/<% moment().format('YYYY/M/D') %>/enoughness-<% issue %>)