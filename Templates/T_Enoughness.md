<%*
await tp.user.showTagNewsletter();
const result = await tp.user.createPost(tp);
if (!result) return;
const { fileName, created } = result
-%>
---
created: <% created %>
draft: true
title: ⚖️ 、、
issue: <% fileName.split('-').pop() %>
tags: []
---

<!-- SELF-INTRO-START -->

_嗨，我是 [黃樺明](https://huam.ing)，喜歡 [寫作](https://huam.ing/writing)、[耐力運動](https://www.strava.com/athletes/huaminghuang)、[用手機寫程式](https://github.com/huaminghuangtw)。Enoughness，剛剛好，是我從 2023 年開始每天練習的生活哲學。每週，我會分享三件有趣的事。如果這封信是朋友轉寄給你的，歡迎 [點此訂閱](https://huam.ing/newsletter)。想看看過往內容？[歷年電子報](https://huam.ing/enoughness) 都在這裡。_

<!-- SELF-INTRO-END -->

---

# 1

<% tp.file.cursor() %>

# 2

# 3

— 樺明
