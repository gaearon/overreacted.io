---
title: 'The Elements of UI Engineering'
date: '2018-12-30'
spoiler: What makes UI engineering difficult?
---

In my [previous post](/things-i-dont-know-as-of-2018/), I talked about admitting our knowledge gaps. You might conclude that I suggest settling for mediocrity. I don’t! This is a broad field.

I strongly believe that you can “begin anywhere” and don’t need to learn technologies in any particular order. But I also place great value in gaining expertise. Personally I’ve mostly been interested in creating user interfaces.

**I’ve been mulling over what it is that I *do* know about and consider valuable.** Sure, I’m familiar with a few technologies (e.g. JavaScript and React). But the more important lessons from experience are elusive. I never tried to put them into words. This is my first attempt to catalog and describe some of them.

---

There are plenty of “learning roadmaps” about technologies and libraries. Which library is going to be in vogue in 2019? What about 2020? Should you learn Vue or React? Angular? What about Redux or Rx? Do you need to learn Apollo? REST or GraphQL? It’s easy to get lost. What if the author is wrong?

**My biggest learning breakthroughs weren’t about a particular technology.** Rather, I learned the most when I struggled to solve a particular UI problem. Sometimes, I would later discover libraries or patterns that helped me. In other cases, I’d come up with my own solutions (both good and bad ones).

It’s this combination of understanding the *problems*, experimenting with the *solutions*, and applying different *strategies* that led to the most rewarding learning experiences in my life. **This post focuses on just the problems.**

---

If you worked a user interface, you’ve likely dealt with at least some of these challenges — either directly or using a library. In either case, I encourage you to create a tiny app with _no_ libraries, and play with reproducing and solving these problems. There’s no one right solution to any of them. Learning comes from exploring the problem space and trying different possible tradeoffs.

---

* **Consistency.** You click on a “Like” button and the text updates: “You and 3 other friends liked this post.” You click it again, and the text flips back. Sounds easy. But maybe a label like this exists in several places on the screen. Maybe there is some other visual indication (such as the button background) that needs to change. The list of “likers” that was previously fetched from the server and is visible on hover should now include your name. If you navigate to another screen and go back, the post shouldn’t “forget” it was liked. Even local consistency *alone* creates a set of challenges. But other users might also modify the data we display (e.g. by liking a post we’re viewing). How do we keep the same data in sync on different parts of the screen? How and when do we make the local data consistent with the server, and the other way around?

* **Responsiveness.** People can only tolerate a lack of visual feedback to their actions for a limited time. For *continuous* actions like gestures and scroll, this limit is low. (Even skipping a single 16ms frame feels “janky”.) For *discrete* actions like clicks, there is research saying users perceive any < 100ms delays as equally fast. If an action takes longer, we need to show a visual indicator. But there are some counter-intuitive challenges. Indicators that cause the page layout to “jump” or that go through several loading “stages” can make the action *feel longer* than it was. Similarly, handling an interaction within 20ms at the cost of dropping an animation frame can *feel slower* than handling it within 30ms and no dropped frames. Brains aren’t benchmarks. How do we keep our apps responsive to different kinds of inputs?

* **Latency.** Both computations and network access take time. *Sometimes* we can ignore the computational cost if it doesn’t hurt the responsiveness on our target devices (make sure to test your app on the low-end device spectrum). But handling network latency is unavoidable — it can take seconds! Our app can’t just freeze waiting for the data or code to load. This means any action that depends on new data, code, or assets is potentially asynchronous and needs to handle the “loading” case. But that can happen for almost every screen. How do we gracefully handle latency without displaying a “cascade” of spinners or empty “holes”? How do we avoid “jumpy” layout? And how do we change async dependencies without “rewiring” our code every time?

* **Navigation.** We expect that the UI remains “stable” as we interact with it. Things shouldn’t disappear from right under our noses. Navigation, whether started within the app (e.g. clicking a link) or due to an external event (e.g. clicking the “back” button), should also respect this principle. For example, switching between `/profile/likes` and `/profile/follows` tabs on a profile screen shouldn’t clear a search input outside the tabbed view. Even navigating to *another* screen is like walking into a room. People expect to go back later and find things as they left them (with, perhaps, some new items). If you’re in the middle of a feed, click on a profile, and go back, it’s frustrating to lose your position in the feed — or wait for it to load again. How do we architect our app to handle arbitrary navigation without losing important context?

* **Staleness.** We can make the “back” button navigation instant by introducing a local cache. In that cache, we can “remember” some data for quick access even if we could theoretically refetch it. But caching brings its own problems. Caches can get stale. If I change an avatar, it should update in the cache too. If I make a new post, it needs to appear in the cache immediately, or the cache needs to be invalidated. This can become difficult and error-prone. What if the posting fails? How long does the cache stay in memory? When we refetch the feed, do we “stitch” the newly fetched feed with the cached one, or throw the cache away? How is pagination or sorting represented in the cache?

* **Entropy.** The second law of thermodynamics says something like “with time, things turn into a mess” (well, not exactly). This applies to user interfaces too. We can’t predict the exact user interactions and their order. At any point in time, our app may be in one of a mind-boggling number of possible states. We do our best to make the result predictable and limited by our design. We don’t want to look at a bug screenshot and wonder “how did _that_ happen”. For *N* possible states, there are *N×(N–1)* possible transitions between them. For example, if a button can be in one of 5 different states (normal, active, hover, danger, disabled), the code updating the button must be correct for 5×4=20 possible transitions — or forbid some of them. How do we tame the combinatorial explosion of possible states and make visual output predictable?

* **Priority.** Some things are more important than others. A dialog might need to appear physically “above” the button that spawned it and “break out” of its container’s clip boundaries. A newly scheduled task (e.g. responding to a click) might be more important than a long-running task that already started (e.g. rendering next posts below the screen fold). As our app grows, parts of its code written by different people and teams compete for limited resources like processor, network, screen estate, and the bundle size budget. Sometimes you can rank the contenders on a shared scale of “importance”, like the CSS `z-index` property. [But it rarely ends well.](https://blogs.msdn.microsoft.com/oldnewthing/20050607-00/?p=35413) Every developer is biased to think _their_ code is important. And if everything is important, then nothing is! How do we get independent widgets to *cooperate* instead of fighting for resources?

* **Accessibility.** Inaccessible websites are *not* a niche problem. For example, in UK disability affects 1 in 5 people. [(Here’s a nice infographic.)](https://www.abrightclearweb.com/web-accessibility-in-the-uk/) I’ve felt this personally too. Though I’m only 26, I struggle to read websites with thin fonts and low contrast. I try to use the trackpad less often, and I dread the day I’ll have to navigate poorly implemented websites by keyboard. We need to make our apps not horrible to people with difficulties — and the good news is that there’s a lot of low-hanging fruit. It starts with education and tooling. But we also need to make it easy for product developers to do the right thing. What can we do to make accessibility a *default* rather than an afterthought?

* **Internationalization.** Our app needs to work all over the world. Not only do people speak different languages, but we also need to support right-to-left layouts with the least amount of effort from product engineers. How do we support different languages without sacrificing latency and responsiveness?

* **Delivery.** We need to get our application code to the user’s computer. What transport and format do we use? This might sound straightforward but there are many tradeoffs here. For example, native apps tend to load all code in advance at the cost of a huge app size. Web apps tend to have smaller initial payload at the cost of more latency during use. How do we choose at which point to introduce latency? How do we optimize our delivery based on the usage patterns? What kind of data would we need for an optimal solution?

* **Resilience.** You might like bugs if you’re an entomologist, but you probably don’t enjoy seeing them in your programs. However, some of your bugs will inevitably get to production. What happens then? Some bugs cause wrong but well-defined behavior. For example, maybe your code displays incorrect visual output under some condition. But what if the rendering code *crashes*? Then we can’t meaningfully continue because the visual output would be inconsistent. A crash rendering a single post shouldn’t “bring down” an entire feed or get it into a semi-broken state that causes further crashes. How do we write code in a way that isolates rendering and fetching failures and keeps the rest of the app running? What does fault tolerance mean for user interfaces?

* **Abstraction.** In a tiny app, we can hardcode a lot of special cases to account for the above problems. But apps tend to grow. We want to be able to [reuse, fork, and join](/optimized-for-change/) parts of our code, and work on it collectively. We want to define clear boundaries between the pieces familiar to different people, and avoid making often-changing logic too rigid. How do we create abstractions that hide implementation details of a particular UI part? How do we avoid re-introducing the same problems that we just solved as our app grows?

---

Of course, there are many problems I haven’t mentioned. This list is by no means exhaustive! For example, I haven’t talked about the designer and engineering collaboration, or debugging and testing. Maybe another time.

It’s tempting to read about these problems with a particular view library or a data fetching library in mind as a solution. But I encourage you to pretend that these libraries don’t exist, and read again from that perspective. How would *you* approach solving these issues? Give them a try on a tiny app! (I’d love to see your experiments on GitHub — feel free to tweet me in response.)

What’s interesting about these problems is that most of them show up at any scale. You can see them both in small widgets like a typeahead or a tooltip, and in huge apps like Twitter and Facebook.

**Think of a non-trivial UI element from an app you enjoy using, and go through this list of problems. Can you describe some of the tradeoffs chosen by its developers? Try to recreate a similar behavior from scratch!**

I learned a lot about UI engineering by experimenting with these problems in small apps without using libraries. I recommend the same to anyone who wants to gain a deeper appreciation for the tradeoffs in UI engineering.
