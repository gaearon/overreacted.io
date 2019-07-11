---
title: '準備一場技術分享 - 第三篇：內容'
date: '2019-07-10'
spoiler: 將想法轉變成演說。
---

我給過[一些](https://www.youtube.com/watch?v=xsSnOQynTHs)我覺得還不錯的[技術](https://www.youtube.com/watch?v=nLF0n9SACd4)[分享](https://www.youtube.com/watch?v=dpw9EHDh2bM)。

有時候大家問我怎麼準備一場技術分享。這個答案對每個講者來說都是非常個人的。我只是分享一些我認為對我來說有用的技巧。

**這是系列文的第二篇** 我會分享我準備一場技術分享的過程 -- 從構思想法到實際發表的那天：

* **[準備一場技術分享 - 第一篇：動機](/preparing-for-tech-talk-part-1-motivation/)**
* **[準備一場技術分享 - 第二篇： 什麼、為何、怎麼做](/preparing-for-tech-talk-part-2-what-why-and-how/)**
* **準備一場技術分享 - 第三篇：內容 (*本篇*)**
* 待續

<p />

---

**本篇文章裡，我會注重在我準備投影片和我演說的實際內容的過程。**

---

There are two ways to build something.
有兩種產生東西的方法。

You can build **top-down**, where you start with a crude overall outline and then gradually refine each individual part. Or you can build **bottom-up**, starting with a small but polished fragment, and then growing everything else around it. This might remind you of how some image formats always load from top to bottom, while others start blurry at first but then get sharper as more data is loaded.
你可以**由上而下**，先準備一個整體的大綱，然後再逐漸地精煉每個小部分。或是你可以**由下而上**，先準備小而精煉過的片段，再把其他部分補上去。這可能會讓你想到某些圖片的格式會由上而下的載入，而其他的一開始會先模糊再跟著資料的載入而變得清晰。

I usually **combine these approaches** when preparing the talks.
準備演說的時候，我通常**綜合了這些方法**。

---

### 由上而下：大綱 Top-Down Pass: The Outline

在我知道[這場演講是關於什麼](/preparing-for-tech-talk-part-2-what-why-and-how/)之後，**我會寫個粗略的大綱。它會是關於所有我想要包含的東西的條列式項目。**除了我以為，他並不需要被精煉過或是對其他人來說清楚。我只是嘗試看看所有事情，看什麼是可行的。
After I know [what the talk is about](/preparing-for-tech-talk-part-2-what-why-and-how/), **I write a rough outline. It is a bullet point list of every thought I want to include.** It doesn’t need to be polished or clear to anyone other than me. I’m just throwing things at the wall to see what sticks.

大綱通常是由一大堆缺口及未知開始的：
An outline usually starts with a lot of gaps and unknowns:

```
- intro 介紹
  - hi, I'm Dan 嗨，我是 Dan
  - I work on React 我維護 React
- problems 問題
  - wrapper hell 包裝地獄
  - ???
- demo 示範
  - ??? how to avoid people getting stressed thinking it's a breaking change 如何避免讓大家覺得他是破壞性的改變而感到焦慮
  - state 狀態
  - effects 
    - ??? which example to pick 應該挑選怎樣的範例
    - maybe explain dependencies 或許解釋依屬（dependencies）
  - custom Hooks <----- "aha" moment 客製化的 Hooks 「啊哈」的頓悟時刻
- links連結
  - stress there's no breaking changes強調並沒有破壞性的改變
- ???
  - something philosophical and reassuring某些哲學性的東西然後重申
```

很多在大綱裡一開始的想法可能不會進到最後的版本裡。事實上，寫大綱是一種貢獻於演說的[「內容」和「原因」](/preparing-for-tech-talk-part-2-what-why-and-how/)的好方法，他讓我們能夠分割我們的想法來選擇我們應該過濾掉哪些「填充物」。
Many initial thoughts in the outline might not make the final cut. In fact, writing an outline is a great way to separate the ideas that contribute to the ["what" and "why"](/preparing-for-tech-talk-part-2-what-why-and-how/) of the talk from the "filler" that should be removed.

大綱是一個活生生的草稿。他一開始可以是模糊的。我在準備演說的時候會持續的改進大綱。最終，他會變得如同以下的樣子：
The outline is a living draft. It can be vague at first. I continously tweak the outline as I work on the talk. Eventually, it might end up looking more like this:

```
- intro 介紹
  - hi, I'm Dan 嗨，我是 Dan
  - I work on React 我維護 React
- problems 問題
  - wrapper hell 包裝地獄
  - long components 很長的元件（components）
  - fixing one makes the other worse 修正了一個導致其他的東西更糟
  - should we give up 我們應該要放棄嗎
    - lol mixins?
- crossroads 十字路口
  - maybe we can't fix this 或許我們無法修正這個
  - but what if we can? 但如果我們可以的話？
  - we have a proposal 我們有個計畫
    - no breaking changes 沒有破壞性的改變
- demo 示範
  - state Hook 狀態的 Hook
  - more than one state Hook 大於一個狀態 Hook
    - mention rules 提及規則
  - effect Hook effect Hook
  - effect cleanup 清掉 effect
  - custom Hooks <----- "aha" moment 客製化的 Hooks 「啊哈」的頓悟時刻
- recap 概要重述
  - no breaking changes 沒有破壞性的改變
  - you can try now 你可以現在就嘗試
  - link to the rfc RFC 的連結
- outro 結語
  - make it personal 讓他個人化
  - hook : component :: electron : atom hook : 元件 :: 電子 : 原子
  - logo + "hooks have been here all along" logo + 「Hooks 已經在此」的 logo
```

但有時候在投影片完成以前，這些片段難以聚集。
But sometimes pieces don’t fall into place until after all the slides are done.

**大綱幫助我保持演說的結構易於被吸收。**我通常會依循[「英雄的旅程」](http://www.tlu.ee/~rajaleid/montaazh/Hero%27s%20Journey%20Arch.pdf)的模式來做我的演說結構，通常你可以在熱門的文化裡找到，例如哈利波特的書。你由某些衝突開始（「天狼星在後面追趕你」、「食死人會破壞魁地奇盃」、「石內卜採取了陰暗的誓言」等等）。然後會有某些設定（買些書，學些咒語）。最後會有某個我們打敗了邪惡的一方的能量高峰的時刻。然後鄧不利多會說說某些變化和矛盾，最後我們回家。
**The outline helps me keep the structure digestible.**  For my talk structure, I often follow the [“Hero’s Journey”](http://www.tlu.ee/~rajaleid/montaazh/Hero%27s%20Journey%20Arch.pdf) pattern that you’ll find in popular culture everywhere, e.g. in Harry Potter books. You start with some conflict (“Sirius is going after you”, “Death Eaters are crashing the Quidditch Cup”, “Snape takes a shady oath”, etc). Then there’s some setup (buy some books, learn some spells). Eventually there’s an energy peak where we beat the villain. Then Dumbledore says something meta and paradoxical, and we all go back home.

我的演說的心裡樣板會像下面這樣：
My mental template for talks looks something like:

1. Establish some conflict or a problem to get the viewer interested.
1. 建立某些衝突或問題，藉以讓觀看者感興趣
2. Walk them through the main “aha” moment. (The "what" of my talk.)
2. 帶領他們走過主要的「啊哈」頓悟時刻。（我演說的「內容」。）
3. Recap how what we did solves the posed problem.
3. 概要重述我們如何解決之前提到的問題。
4. Finish it off with something that appeals to emotions (The "why" of my talk).
4. 利用某些可以提起情緒的東西來結束它（我演說的「原因」。）
    - This part lands especially well if there's some unexpected layer or symmetry that only becomes clear at the end. If I get [goosebumps](https://en.wikipedia.org/wiki/Frisson), it's good.
    - 如果有某些只在最後才明朗的不可預期的層面或對稱性，這個部分將會完美落地。如果我起[雞皮疙瘩](https://en.wikipedia.org/wiki/Frisson)了，他就很好。

當然，這種結構只是一種形式 - 且是一個被過度使用的形式。所以你真的可以隨你高興地增加更多有吸引力的題材並增加你自己的轉折。如果演說內容本身不是很吸引人，用陳腔濫調來包裝他並不會有幫助。
Of course, a structure like this is just a form — and an overused one. So it’s really up to you to fill it up with engaging material and add your own twist. If the talk content itself isn’t engaging, wrapping it up in a cliche won’t help it.

**大綱也讓我找到不一致性。**舉例來說，或許某個在中間的想法其實需要其他我之後才會引入的觀念。如此一來我就必須要重新調整他們的順序，大綱提供了所有我想要提到的想法的鳥瞰視角，且幫助我保證他們之間的流動是緊密且合理的。
**The outline also helps me find inconsistencies.** For example, maybe an idea in the middle needs some other concept that I only introduce later. Then I need to reorder them. The outline provides a bird’s eye view of all the thoughts I wanted to mention, and helps ensure the flow between them is tight and makes sense.

### Bottom-Up Pass: The High-Energy Section
### 由下而上：高能量的部分

寫大綱是由上而下的過程，但我也會平行的先由下而上的處理某些具體的部分，像是投影片或某個範例。
Writing the outline is a top-down process. But I also start working bottom-up on something concrete like the slides or a demo in parallel.

**特別是我嘗試著想要盡快建立一個我演說裡「高能量」的部分的概念證明（POC）。**例如，他可以是某個關鍵想法被解釋或示範的時刻。我該如何解釋他？我具體來說應該說或做什麼？這些足夠嗎？我需要投影片嗎？示範？或是都要？我需要有圖片嗎？動畫？我的文字或動作的實際順序應該要怎麼安排？我會想要為了這個解釋而觀看這場演講嗎？
**In particular, I try to build up a proof of concept of the “high energy” part of my talk as soon as possible.** For example, it could be a moment when a crucial idea is explained or demoed. How do I go about explaining it? What exactly am I going to say or do, and is it going to be sufficient? Do I need slides? Demos? Both? Do I need to use pictures? Animations? What is the exact sequence of my words and actions? Would I want to watch this talk for this explanation alone?

這個部分對我來說是最難的，因為我通常最後會有好幾種我丟掉的版本。他需要當我可以深層專注時的特別思想框架，讓我能夠嘗試愚蠢的東西，然後自由自在地消滅他們。
This part is the hardest for me because I usually end up making many versions that I throw away. It requires a special frame of mind when I can deeply focus, allow myself to try silly things, and then feel free to destroy it all.

我花了很多時間挑選標題，找出合適的現場示範順序，微調動畫，和搜尋迷因（memes），但這個階段為我定義了這場演講。我的目標是從*不知道*到*知道*之間的概念尋找最近的道路，以至於我可以在之後分享這段旅程給觀眾。
I spend a lot of time picking headers, figuring out the sequencing of a live demo, tweaking the animations, and searching for memes. **Most of this work is throwaway** (e.g. I usually end up deleting all the memes), but this stage really defines the talk for me. My goal is to find the closest route from *not knowing* to *knowing* an idea — so I can share that journey later with the audience.

在我對我演說的高能量部分感覺良好之後，我會檢查我之前寫過的大綱是否仍合理。在這個階段，我常常發現我應該丟掉 60% 的大綱，然後重寫他來專注在更小的概念。
After I feel good about the high-energy part of my talk, I check if the outline I wrote before still makes sense. At this point, I often realize that I should throw away the 60% of my previous outline, and rewrite it to focus on a smaller idea.

### 排練很多次
### Do Many Dry Runs

我持續由上而下（大綱）和由下而上（建立具體的部分），直到整個演說的概念沒有任何空白的地方。當我有了第一個整個演說的草稿版本，我會把自己鎖在一間房間，假裝我真的第一次在*給*一場演說。他會很混亂，我多次步履蹣跚，在句子之間停頓然後嘗試不同的句子之類的，但我會走過整個演說。
I continue both top-down work (outline) and bottom-up work (building out concrete sections) until there are no more blank spaces. When I have the first draft version of the whole talk, I lock myself in a room and pretend to actually *give* the talk for the first time. It’s messy, I stumble a lot, stop sentences midway and try different ones, and so on — but I get through the whole thing.

這幫助了我衡量我應該減少多少東西。第一次嘗試通常最後會超出時間很多，但我也常注意到某些部分很令人分心，所以我會把他們移除，調整投影片來更符合我想說的事情，並再度嘗試演說整個內容一遍。
That helps me measure how much I’ll need to cut. The first attempt often ends up much larger than the time slot, but I also often notice that some sections were distracting. So I cut them out, tweak the slides to better match what I want to say, and try to give the whole talk again.

我重複這個過程好幾天，並持續的精煉我的投影片和演說流程。這是個與他人練習的好時刻。我通常會由一個朋友開始，然後再對小群的觀眾（最多 15 人）做幾次排練。這是個獲得早期回饋的好方法，但更重要的是，他是我習慣這場演說並學習對給這場演說感到舒適的方法。
I repeat this process for several days as I keep polishing the slides and the flow. This is a good time to start practicing with other people. I usually start with a single friend, and later do a few dry runs with a small audience (at most 15 people). This is a good way to get some early feedback, but most importantly it's how I get used to this talk and learn to feel comfortable giving it.

我傾向於不要寫下完整的句子或真的演說筆記。他會讓我感到有壓力，因為我會覺得我必須要遵從他們，然後害怕我漏掉了什麼。取而代之的，我傾向預演演說足夠的次數（3 ~ 20 次），直到我想要在每張投影片說的句子不用想太多就能「走向我」。說一個你已經說過很多遍的故事會比較容易。
I prefer not to write down complete sentences or real speaker notes. That stresses me out because I feel the pressure to actually follow them and freak out if I miss something. Instead, I prefer to rehearse the talk enough times (from 3 to 20) that the sentences I want to say for any given slide "come to me" without thinking too much. It's easier to tell a story you've told many times before.

---

本篇文章，我敘述了我如何準備我演說的內容。在下篇文章，我會分享某些我在演說當天會做的事情的訣竅。
In this post, I described how I prepare the content for my talks. In the next post, I will share some tips about what I do on the day of the talk itself.

**本系列的前一篇文章：**
**Previous in this series: [準備一場技術分享 - 第二篇： 什麼、為何、怎麼做](/preparing-for-tech-talk-part-2-what-why-and-how/)**.
