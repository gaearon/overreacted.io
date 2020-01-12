---
title: 'Preparing for a Tech Talk, Part 3: Content'
date: '2019-07-10'
spoiler: Turning an idea into a talk.
---

I’ve done a [few](https://www.youtube.com/watch?v=xsSnOQynTHs) [tech](https://www.youtube.com/watch?v=nLF0n9SACd4) [talks](https://www.youtube.com/watch?v=dpw9EHDh2bM) that I think went well.

Sometimes people ask me how I prepare for a talk. For every speaker, the answer is very personal. I’m just sharing what works for me.

**This is the third post in a series** where I explain my process preparing for a tech talk — from conceiving the idea to the actual day of the presentation:

* **[Preparing for a Tech Talk, Part 1: Motivation](/preparing-for-tech-talk-part-1-motivation/)**
* **[Preparing for a Tech Talk, Part 2: What, Why, and How](/preparing-for-tech-talk-part-2-what-why-and-how/)**
* **Preparing for a Tech Talk, Part 3: Content  (*this post*)**
* To be continued

<p />

---

**In this post, I will focus on my process of creating the slides and the actual content of my presentation.**

---

There are two ways to build something.

You can build **top-down**, where you start with a crude overall outline and then gradually refine each individual part. Or you can build **bottom-up**, starting with a small but polished fragment, and then growing everything else around it. This might remind you of how some image formats always load from top to bottom, while others start blurry at first but then get sharper as more data is loaded.

I usually **combine these approaches** when preparing talks.

---

### Top-Down Pass: The Outline

After I know [what the talk is about](/preparing-for-tech-talk-part-2-what-why-and-how/), **I write a rough outline. It is a bullet point list of every thought I want to include.** It doesn’t need to be polished or clear to anyone other than me. I’m just throwing things at the wall to see what sticks.

An outline usually starts with a lot of gaps and unknowns:

```
- intro
  - hi, I'm Dan
  - I work on React
- problems
  - wrapper hell
  - ???
- demo
  - ??? how to avoid people getting stressed thinking it's a breaking change
  - state
  - effects
    - ??? which example to pick
    - maybe explain dependencies
  - custom Hooks <----- "aha" moment
- links
  - stress there's no breaking changes
- ???
  - something philosophical and reassuring
```

Many initial thoughts in the outline might not make the final cut. In fact, writing an outline is a great way to separate the ideas that contribute to the ["what" and "why"](/preparing-for-tech-talk-part-2-what-why-and-how/) of the talk from the "filler" that should be removed.

The outline is a living draft. It can be vague at first. I continously tweak the outline as I work on the talk. Eventually, it might end up looking more like this:

```
- intro
  - hi, I'm Dan
  - I work on React
- problems
  - wrapper hell
  - long components
  - fixing one makes the other worse
  - should we give up
    - lol mixins?
- crossroads
  - maybe we can't fix this
  - but what if we can?
  - we have a proposal
    - no breaking changes
- demo
  - state Hook
  - more than one state Hook
    - mention rules
  - effect Hook
  - effect cleanup
  - custom Hooks <----- "aha" moment
- recap
  - no breaking changes
  - you can try now
  - link to the rfc
- outro
  - make it personal
  - hook : component :: electron : atom
  - logo + "hooks have been here all along"
```

But sometimes pieces don’t fall into place until after all the slides are done.

**The outline helps me keep the structure digestible.**  For my talk structure, I often follow the [“Hero’s Journey”](http://www.tlu.ee/~rajaleid/montaazh/Hero%27s%20Journey%20Arch.pdf) pattern that you’ll find in popular culture everywhere, e.g. in Harry Potter books. You start with some conflict (“Sirius is going after you”, “Death Eaters are crashing the Quidditch Cup”, “Snape takes a shady oath”, etc). Then there’s some setup (buy some books, learn some spells). Eventually there’s an energy peak where we beat the villain. Then Dumbledore says something meta and paradoxical, and we all go back home.

My mental template for talks looks something like:

1. Establish some conflict or a problem to get the viewer interested.
2. Walk them through the main “aha” moment. (The "what" of my talk.)
3. Recap how what we did solves the posed problem.
4. Finish it off with something that appeals to emotions (The "why" of my talk).
    - This part lands especially well if there's some unexpected layer or symmetry that only becomes clear at the end. If I get [goosebumps](https://en.wikipedia.org/wiki/Frisson), it's good.

Of course, a structure like this is just a form — and an overused one. So it’s really up to you to fill it up with engaging material and add your own twist. If the talk content itself isn’t engaging, wrapping it up in a cliche won’t help it.

**The outline also helps me find inconsistencies.** For example, maybe an idea in the middle needs some other concept that I only introduce later. Then I need to reorder them. The outline provides a bird’s eye view of all the thoughts I wanted to mention, and helps ensure the flow between them is tight and makes sense.

### Bottom-Up Pass: The High-Energy Section

Writing the outline is a top-down process. But I also start working bottom-up on something concrete like the slides or a demo in parallel.

**In particular, I try to build up a proof of concept of the “high energy” part of my talk as soon as possible.** For example, it could be a moment when a crucial idea is explained or demoed. How do I go about explaining it? What exactly am I going to say or do, and is it going to be sufficient? Do I need slides? Demos? Both? Do I need to use pictures? Animations? What is the exact sequence of my words and actions? Would I want to watch this talk for this explanation alone?

This part is the hardest for me because I usually end up making many versions that I throw away. It requires a special frame of mind when I can deeply focus, allow myself to try silly things, and then feel free to destroy it all.

I spend a lot of time picking headers, figuring out the sequencing of a live demo, tweaking the animations, and searching for memes. **Most of this work is throwaway** (e.g. I usually end up deleting all the memes), but this stage really defines the talk for me. My goal is to find the closest route from *not knowing* to *knowing* an idea — so I can share that journey later with the audience.

After I feel good about the high-energy part of my talk, I check if the outline I wrote before still makes sense. At this point, I often realize that I should throw away 60% of my previous outline, and rewrite it to focus on a smaller idea.

### Do Many Dry Runs

I continue both top-down work (outline) and bottom-up work (building out concrete sections) until there are no more blank spaces. When I have the first draft version of the whole talk, I lock myself in a room and pretend to actually *give* the talk for the first time. It’s messy, I stumble a lot, stop sentences midway and try different ones, and so on — but I get through the whole thing.

That helps me measure how much I’ll need to cut. The first attempt often ends up much larger than the time slot, but I also often notice that some sections were distracting. So I cut them out, tweak the slides to better match what I want to say, and try to give the whole talk again.

I repeat this process for several days as I keep polishing the slides and the flow. This is a good time to start practicing with other people. I usually start with a single friend, and later do a few dry runs with a small audience (at most 15 people). This is a good way to get some early feedback, but most importantly it's how I get used to this talk and learn to feel comfortable giving it.

I prefer not to write down complete sentences or real speaker notes. That stresses me out because I feel the pressure to actually follow them and freak out if I miss something. Instead, I prefer to rehearse the talk enough times (from 3 to 20) that the sentences I want to say for any given slide "come to me" without thinking too much. It's easier to tell a story you've told many times before.

---

In this post, I described how I prepare the content for my talks. In the next post, I will share some tips about what I do on the day of the talk itself.

**Previous in this series: [Preparing for a Tech Talk, Part 2: What, Why, and How](/preparing-for-tech-talk-part-2-what-why-and-how/)**.
