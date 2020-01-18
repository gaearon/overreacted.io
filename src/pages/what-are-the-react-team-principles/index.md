---
title: What Are the React Team Principles?
date: '2019-12-25'
spoiler: UI Before API.
cta: 'react'
---

During my time on the React team, I’ve been lucky to see how [Jordan](https://twitter.com/jordwalke), [Sebastian](https://twitter.com/sebmarkbage), [Sophie](https://twitter.com/sophiebits) and other tenured team members approach problems. In this post, I'm distilling what I learned from them into a few high-level technical principles. These principles aren’t meant to be exhaustive. This is my personal attempt to formalize observations about how the React team operates — other team members may have different perspectives.

## UI Before API

Every abstraction has its own quirks when deployed at scale. How do those quirks manifest themselves in the user interfaces? Can you tell when an app is built with a certain abstraction?

Abstractions have a direct effect on the user experiences — enabling, perpetuating, or even making some of them impossible. This is why when designing APIs, we don’t start with the abstraction itself. Instead, we start with the desired user experience, and work backwards to the abstraction.

Sometimes as we work backwards, we realize we need to change the whole approach to enable the right user experience. We can’t see that if we start with the API. So we put UI before API.

## Absorb the Complexity

Making React internals simple is not a goal. We are willing to make React internals complex if that complexity lets product developers keep their code easier to understand and modify.

We want to allow the product development be decentralized and collaborative. Often, that means that we bear the brunt of centralization. React can’t be split into small simple loosely coupled modules because in order to do its job, something has to act as the coordinator. That’s what React is.

By raising the abstraction level, we make product developers more powerful. They benefit from the system as a whole having certain predictable properties. But this means that every new N+1st feature we introduce has to work well with all of the N existing features. This is why contributing new features to React is so difficult both at the design and the implementation side. This is why we don’t get many “core” open source contributions.

We absorb the complexity to stop its bleeding into the product code.

## Hacks, Then Idioms

Every API creates new restrictions. Sometimes these restrictions prevent people from shipping delightful user experiences. We provide escape hatches so people can work around us where necessary.

Hacks can’t survive for long because they are fragile. Product developers then have to choose whether they prefer to take a maintenance hit by supporting the hack, or to degrade the user experience but remove the hack. Often, the user experience loses — or the hack prevents further improvements to it.

We need to allow hacks using escape hatches, and observe which hacks people put in practice. Our job is to eventually provide an idiomatic solution for hacks that exist in the name of better user experience. Sometimes, a solution might take years. We prefer a flexible hack to entrenching a poor idiom.

## Enable Local Reasoning

There aren’t many things you can do in a code editor. You can add some lines or remove them. Or copy and paste something. And yet many abstractions make these basic operations difficult.

For example, MVC frameworks tend to make it unsafe to delete some part of the rendering output. This is because parents imperatively call methods on their children (which aren’t there after you removed them). By contrast, in React it’s usually safe to just delete lines of code in your render tree. This is a win.

When designing APIs, we assume the person only has local knowledge about the piece of code they’re working on. When the intended effect is local, we want to prevent surprising outcomes. For example, we usually expect adding code to be safe. We expect removing and changing code to clearly point to the whole trail of code that needs to be considered as part of this change. We can’t assume the knowledge of the whole codebase when changing a single file.

When something isn’t safe to do, we want the developer to discover the full effects of their change as early as possible. Warnings, type checks, and developer tooling can help, but they are limited by the API design. If the API is not restrictive enough, local reasoning is impossible. For example, this is why `findDOMNode()` is bad. It requires global knowledge.

## Progressive Complexity

Some frameworks choose to have a fork in the road. They provide two ways to do something: an easy way, and a powerful way. The easy way is nice to learn, but at some point you hit a wall. When that happens, you have to undo your past work, and reimplement it differently.

We prefer that implementing a complex thing isn’t too much different in structure from implementing a simple thing. For example, we don’t offer a separate template DSL “for the simple cases” because it creates a fork in the road. We’re willing to compromise on the barrier to entry if we think you’re going to want the fully featured mechanism soon anyway.

Sometimes, the “easy way” and the “powerful way” are two different frameworks. Then you also have to rewrite. It’s nice when we can avoid that, too. For example, adding server rendering is an optimization that requires some extra effort in React but not a full-on rewrite.

## Contain the Damage

Top-down tools like code budgets are important. However, over the long term, our standards will slip, features will ship under deadlines, and products will be unmaintained. When we can’t rely on everyone playing along, our role as a coordinator is to contain the damage.

If some UI code is slow or over budget, we need to do what we can to reduce its negative effects on loading time and interactions with other parts of the UI. Ideally, the developer should only “pay” for the features they use, and the user should only “pay” for the UI they interact with. Concurrent Mode features including Time Slicing and Selective Hydration are different levers to address that.

Because the library code overhead is relatively stable but the application code is unbounded, we tend to focus on containing the damage in the application code instead of the fixed cost of library code.

## Trust the Theory

Sometimes, we know an approach is a dead end. Maybe it works today, but we are already aware of its limitations, and they fundamentally prevent us from achieving the desirable user experience. We pivot away from investing into such approach as soon as it’s viable to do so.

We want to avoid getting stuck in a local maxima. If another approach makes a lot more sense in theory, we’re willing to invest the effort to get there, even if it takes many years. There will be many obstacles and pragmatic compromises we might have to make to get there. But we trust that if we keep chipping away at them, eventually the theory wins.

## What Are Your Team’s Principles?

These are a few fundamental principles I've observed in how we work, but I've probably missed a bunch of them. I also haven't touched on the less technical principles around how we roll out APIs, communicate changes, and so on. That could be a topic for another day.

Does your team have a set of principles? I’d love to hear about them.

*This article was originally posted [here](https://react.christmas/2019/24).*