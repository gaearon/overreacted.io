---
title: 賦予它一個名字，人們將會跟來 Name It, and They Will Come
date: '2019-03-25'
spoiler: 改變從一個故事開始。A change starts with a story.
---

你發現了某些新事物。

You haven’t seen solutions *quite like this* before. You try to keep your ego in check and be skeptical. But the butterflies in your stomach won’t listen.
你還沒有看過*跟這個很像*的解法。你嘗試著保持你謙卑的心和懷疑的態度。但你肚子裡的蝴蝶不願聽從。

You don’t want to get carried away, but deep down you already know it:
你並不想得意忘形，但在心裡深處你已經知曉：

**You’re onto something.**
**你知道你正在發掘某件重要的東西。**

This idea turns into a project. The first commit is just 500 lines. But in a few days, you build it up just enough to start using it in real code. A few like-minded people join you in improving it. You learn something new about it every day.
這個想法變成了一個專案。第一個 commit 只有 500 行。但幾天過後，你把他建構成一個足夠用在真實世界的程式碼裡面的東西。幾個擁有共同想法的人加入你來精進他。你每天都學習了一些關於他的新東西。

You’re still skeptical but you can’t pretend to ignore it:
你仍然感到懷疑但你不能假裝忽視他：

**This idea has wings.**
**這個想法有翅膀。**

You encounter many obstacles. They require you to make changes. Peculiarly, these changes only make the original idea stronger. Usually, you feel like you’re *creating* something. But this time, it feels like you are *discovering* something as if it already existed. You’ve chosen a principle and followed it to the conclusion.
你遇到了很多阻礙。他們要求你做些改變。奇怪的，這些改變只會讓原有的想法更堅固。通常，你感到你正在*創造*什麼。但這是，你感覺到你正在*發現*什麼好像已經存在的東西。你選擇了一個原則並且得出結論。

By now, you’re convinced:
目前為止，你確信：

**This idea deserves to be heard.**
**這個想法值得被聽見。**

---

If you work at a bureaucratic company, maybe you fight the legal department to open source it. If you are a freelancer, maybe you keep polishing it late at night after the client work is done. Perhaps you wish you were paid for it. But nobody knows about your project just yet. You’re hoping that they will. Someday.
如果你在一個官僚主義的公司工作，也許你會為了將它開源與法務組對抗。如果你是個自由工作者，也許你夜深時刻在完成客戶的工作後持續的改進他。也許你希望你是能夠藉由他獲得薪水的。但還沒有人知道你的專案。你希望他們有天會知曉。

You pull yourself together to get it ready for the first release. You write more tests, set up the CI, create extensive documentation. You design a beautiful landing page. You’re ready to share your idea with the whole wide world.
你整理自己的情緒並準備好他第一次的發布。你寫了更多測試、建立持續整合 (CI)、編寫豐富的文件。你設計了一個漂亮的到達頁面。你已經準備好要分享給全世界你的想法。

Finally, it’s the launch day. You publish the project on GitHub. You tweet about it and submit the landing page to the popular open source news aggregators.
最後，到了推出日期。你在 GitHub 出版了這個專案。你為他發了推文且把他的到達頁面送到各個知名的開源新聞聚集網站。

```bash
git push origin master
npm publish
```

**You’re anxious to hear the world’s take on your idea.**
**你對於這個世界對於你的想法有什麼意見感到焦慮。**

Maybe they’ll love it. Maybe they’ll hate it.
也許他們愛他。也許他們討厭他。

All you know is it deserves to be heard.
你唯一知道的事情就是它值得被聽見。

---

Congratulations!
恭喜！

Your project hit the front page of a popular news aggregator. Somebody visible in the community tweeted about it too. What are they saying?
你的專案上了某個以名的新聞聚集網站的首頁熱門。社群裡某個有名的人發了與他相關的推文。他們說了什麼？

Your heart sinks.
你的心沈了。

It’s not that people *didn’t like* the project. You know it has tradeoffs and expected people to talk about them. But that’s not what happened.
並不是人們*不喜歡*這個專案，你知道他有些權衡妥協並期待人們討論他。但這不是現在發生的事。

**Instead, the comments are largely *irrelevant* to your idea.**
**相反的，大部分的評論都跟你的想法*無關*。**
****

The top comment thread picks on the coding style in a README example. It turns into an argument about indentation with over a hundred replies and a brief history of how different programming languages approached formatting. There are obligatory mentions of gofmt and Python. Have you tried Prettier?
最熱門的留言串挑剔 README 裡範例程式碼的風格。它轉變為關於縮排的幾百條回覆的爭論和關於如何格式化程式語言的簡易歷史。那裡有關於 gofmt 和 Python 的強制性。你試過 Prettier 嗎？

Somebody mentions that open source projects shouldn’t have beautiful landing pages because it’s misleading marketing. What if a junior developer falls for it without fully understanding the fundamentals?
某些人提到開源專案不應該有漂亮的到達頁面因為他會造成誤導性的行銷。萬一有個資淺的開發者在還沒完全理解基礎以前深信於他怎麼辦？

In a response, somebody argues the landing page design is boring. Additionally, it’s broken in Firefox. Clearly, this means the project author doesn’t care about the open web. Is the web as we know it dying? It’s time for some game theory...
在某個回覆裡，有人爭論到達頁面的設計很無聊。另外，他在 Firefox 是壞的。明顯的，這代表專案的作者不在乎開源網路。我們所熟知的網路死了嗎？現在是時候來了解一些賽局理論...

The next comment is a generic observation about the nature of abstractions, and how they can lead to too much “boilerplate” (or, alternatively, “magic”). The top reply explains that one shouldn’t confuse “simple” with “easy”. Actually, Rich Hickey gave a very good talk about this. Have you watched it?
下一個回覆是一個關於抽象化的自然的通用觀察以及他們能導致多少「樣板」（或換句話說：「奇蹟」）。最熱門的回覆解釋了一個人不應該把「簡單」和「容易」搞混。事實上，Rich Hickey 給了一個關於此非常好的演講。你看過了嗎？

Finally, why do we need libraries at all? Some languages do well with a built-in standard library. Is npm a mistake? The leftpad accident could happen again. Should we build npm right into the browser? What about the standards?
最後，為什麼我們需要套件？某些語言在標準函式庫裡做得很好。 npm 是個錯誤嗎？leftpad 意外可能會再度發生。我們應該把 npm 建置在瀏覽器裡嗎？那那些標準呢？

**Confused, you close the tab.**
**困惑，你關起了分頁。**

---

What happened?
發生了什麼事？

---

It might be that your idea is simply not as interesting as you thought. That happens. It might also be that you poorly explained it for a casual visitor.

However, there might be another reason why you didn’t get relevant feedback.

**We tend to discuss things that are easy to talk about.**

Universal shared experiences are easy to talk about. That includes topics like code formatting, verbosity vs magic, configuration vs convention, differences in the community cultures, scandals, tech interviews, industry gossip, macro trends and design opinions. We have a shared vocabulary for all of those things.

We are also constantly pattern-matching. If some pattern triggers an emotional response (whether relevant or irrelevant to the presented idea), we’ll likely base the first impression on it. Learning by association is a tremendously valuable mental shortcut. However, familiar style may obscure the novel substance.

**If your idea really _is_ new, there might be no shared vocabulary to discuss it yet.**

The problem it’s solving might be so ingrained that we don’t even notice it. It’s the elephant in the room. **And we can’t discuss what we never named.**

---

How do you give a name to a problem?
你如何為一個問題命名？

The same way humans always did.
就跟人們自古以來的一樣。

**By telling a story.**
**藉由說故事。**

Name it, and they will come.
賦予它一個名字，人們將會跟來。
