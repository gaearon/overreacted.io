---
title: 處理反饋
date: '2019-03-02'
spoiler: 有時候我睡不著覺。
---

過去幾週是非常忙碌的。我們終於發佈了一個 [React Hooks](https://reactjs.org/blog/2019/02/06/react-v16.8.0.html) 的穩定版本和第一個 [React 網站翻譯](https://reactjs.org/blog/2019/02/23/is-react-translated-yet.html)。這兩個專案對我來說都很重要，把它們送出讓我感到棒極了。
The last few weeks have been very hectic. We’ve finally released a stable version of [React Hooks](https://reactjs.org/blog/2019/02/06/react-v16.8.0.html) and the first [React website translations](https://reactjs.org/blog/2019/02/23/is-react-translated-yet.html). Both of these projects meant a lot to me, and shipping them felt great.

然而，當你標記某些東西已經穩定的時候，我也對身處於仔細審查的浪頭上感到更多壓力。Hooks 很新，我們仍在找出他對某些比較不常見的模式的「最佳作法」-- 在 Facebook 內部以及 GitHub 討論區都是。但花越久的時間來邊寫文件和強迫他們（例如：利用警告），某個人會沒發現他用了錯誤的模式來開課或寫文章的風險越高。如果這種事發生的話，很難不對他感到需要負部分的責任。
However, I also feel more pressure now to stay on top of the scrutiny that comes when you mark something as stable. Hooks are very new, we are still figuring out “best practices” for some of the less common patterns — both internally at Facebook and in GitHub discussions. But the longer it takes to document and enforce them (e.g. with warnings), the more risk there is that someone will create a course or write an article using a broken pattern without realizing that. It’s hard not to feel at least partially responsible when that happens.

大多數這種情形都是我強加在自己身上的。技術上來說沒有人期待我在乎。但我在乎。
Most of this is self-imposed. No one technically expects me to care. I do though.

在*提供*指導和從大家使用 API 的情形和經驗*學習*之間維持平衡可能會造成某些損失。特別是當你還不知道所有的答案的時候。在過去幾週，我有好幾個晚上因為不停歇的內心獨白，我不記得我到底睡著了沒。
Maintaining a balance between *providing* guidance and *learning* from people using an API and their experiences can take some toll. Especially when you don’t know all the answers yet. Over the past weeks, I had a few nights when I couldn’t remember if I slept at all due to nonstopping internal monologue.

我注意到我有幾個特定的觸發條件導致這個。所以我特別小心來防止他們發生。如果這對任何人有幫助，這裡是一個經驗上來說我嘗試跟隨的看起來有幫助的規則的集合：
I’ve noticed that I have a particular set of triggers that can cause this. So I’m more careful to avoid them. In case it’s helpful to anyone else, here’s a set of rules I’m trying to follow which seem to help empirically:

* **不要喝超過兩杯咖啡。** 咖啡是我的朋友，我嘗試著幾個月放棄咖啡因，然後我的頭痛持續發生超過我能忍受的時間。咖啡*真的有*幫助到我（或許是血壓之類的事？），但適可而止。喝超過兩杯咖啡讓我過度亢奮。
* **Not drinking more than two cups of coffee.** Coffee is my friend. I tried giving up caffeine for a few months and I had headaches spanning for more than the tolerance period. Coffee actually *does* help me (maybe some blood pressure thing?) but in moderation. Drinking more than two cups leaves me too pumped.

* **超過晚上九點後不要跟陌生人爭論。** 我喜歡在推特上辯論事情。我對偶爾的不同意並不陌生。有些可能會轉變為情緒上的枯竭 -- 特別是當人們假設不好的意圖。即便我嘗試著維持友善的語調，這種事情還是讓我受傷並且我會激動到睡不著。所以我試著避免在晚上閱讀任何反饋。
* **Not arguing with strangers after 9pm.** I love debating things on Twitter, and I’m no stranger to occasional disagreements. Some of them can turn pretty draining emotionally — especially when people assume bad intent. Even if I try to maintain a friendly tone, this kind of thing hurts and then I get too agitated to fall asleep. So I’ve been trying to avoid reading any feedback in the evenings.

* **不要不吃三餐或超過晚上八點吃東西。** 這點有點詭異。（別忘了，我只是描述對我來說有用的！）一般而言我對三餐還蠻有彈性的。但最近我注意到每當我早上五點醒來且不能入睡，我的胃感到沈重。我不知道這是嗡嗡的腦袋造成的結果還是原因，但這有些關聯。善待你的腸胃。
* **Not skipping meals or eating after 8pm.** This one is weird. (Don’t forget, I’m just describing what works for me!) Generally I’ve been pretty flexible with meals. But lately I’ve noticed that whenever I wake up at 5am and can’t fall asleep, my stomach feels heavy. I don’t know whether it’s the *reason* or the *consequence* of a buzzing mind, but there is a correlation. Take care of your gut.

* **不要在睡前發布文章。** 每次我分享任何事情，我為反饋感到興奮和緊張。（有任何人注意到他嗎？他會太有爭議性嗎？他會在資訊整合網站排名第幾？大家喜歡閱讀她嗎？）我發現替一開始的反饋預留幾個小時的時間有幫助，這樣緊張就不會再幾個小時後把我叫醒。
* **Not publishing articles right before going to bed.** Whenever I share anything, I get a bit excited and nervous about the feedback. (Will anyone notice it? Is it too controversial? How will it rank on aggregators? Do people like reading it?) I found it useful to leave a buffer of a few hours for the initial feedback so that curiosity and nerves don’t wake me up a few hours later.

* **不要躺在床上試圖睡著。** 有幾次，我會在早上五點醒來然後試圖想要放鬆卻徒勞無功的躺在床上直到早上十點。這個對我來說沒用。然而，我注意到如果我單純做任何我喜歡的事情（寫一些程式碼、讀一些線上的垃圾讀物、吃根香蕉），最終我會想睡。把晚上分成兩半感覺有點怪但這仍比不睡覺來的好。
* **Not lying there trying to fall asleep.** A few times, I would wake up at 5am and then lie in bed until 10am in a vain attempt to relax. This doesn’t work for me. However, I’ve noticed that if I simply do whatever I feel like (write some code, read some online junk, eat a banana), eventually I get sleepy. Splitting the night in two halves feels a bit awkward but it’s still better than not sleeping at all.

更深沈的問題是，當我知道那裡有個問題但我還沒準備好修理他的時候，這讓我沒辦法休息。例如寫文件、修正錯誤或分享一個想法。這種驅動可能有幫助但在某些時候他並不值得。
The deeper problem is that I’m restless when I know there is a problem but I don’t have a fix ready yet. Such as writing documentation, correcting a bug or sharing an idea. This drive can be helpful but at some point it’s not worth it.

上述的技巧幫助我減少焦慮的程度讓那樣的驅動是對我來說是增加生產效率的。但我應該小心。在能夠告訴你你已經偏離軌道了的人們身邊是重要的。我對擁有這些人感到感謝。
The techniques above help me reduce the anxiety to the point where that drive is productive to me. But I should watch out. It’s important to be surrounded by people who can tell when you’re going off the rails. I feel thankful to have them.
