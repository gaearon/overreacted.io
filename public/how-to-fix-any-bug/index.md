---
title: How to Fix Any Bug
date: '2025-10-21'
spoiler: The joys of vibecoding.
bluesky: https://bsky.app/profile/danabra.mov/post/3m3o3jjzafk2k
---

I've been vibecoding a little app, and a few days ago I ran into a bug.

The bug went something like this. Imagine a route in a webapp. That route shows a sequence of steps--essentially, cards. Each card has a button that scrolls down to the next card. Everything works great. However, as soon as I tried to *also* call the server from that button, scrolling would no longer work. It would jitter and break.

So, adding a remote call somehow broke scrolling.

I wasn't sure what's causing the bug. Clearly, the newly added remote server call (which I was doing via [React Router actions](https://reactrouter.com/start/framework/actions)) was somehow interfering with my [`scrollIntoView`](https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollIntoView) call. But I couldn't tell how. I initially thought the problem was that React Router re-renders my page (an action causes a data refetch), but in principle there's no reason why a refetch would interfere with an ongoing scroll. The server was returning the same items, so it shouldn't have changed anything.

In React, a re-render [should](/writing-resilient-components/#principle-2-always-be-ready-to-render) always be safe to do. Something else was wrong--either in my code, or in React Router, or in React, or even in the browser itself.

How do I fix this bug?

*Can I get Claude to fix it?*

---

## Step 0: Just Fix It

I told Claude to fix the problem.

Claude tried a few things. It rewrote conditions in the `useEffect` that contains the `scrollIntoView` call and said that the bug was fixed. But that didn't help. It then tried changing `smooth` scrolling to `instant`, and a few other things.

Each time, Claude would proudly declare that the problem was solved.

But it was not!

The bug was still there.

This might sound like I'm complaining about Claude, but really the impetus for writing this article is that I see human engineers (including myself) make the same mistakes. So I wanted to document the process I usually follow to fix bugs.

Why was Claude repeatedly wrong?

Claude was repeatedly wrong because **it didn't have a repro**.

---

## Step 1: Find a Repro

A *repro*, or a reproducing case, is a sequence of instructions then, when followed, gives you a reliable way to tell whether the bug is still happening. It's "the test". A repro says what to do, what's *expected* to happen, and what is *actually* happening.

From my perspective, I already had a good repro:

1. Click the button.
2. The *expected* behavior was scrolling down, but the *actual* behavior was scroll jitter.

Even better, the bug happened every time.

If my repro was unreliable (e.g. if it happened just 30% of attempts), I'd either have to gradually remove different sources of uncertainty (e.g. recording the network and mocking it in future attempts), or live with the producitivity hit of having to test every potential fix many more times. But luckily, my repro was reliable.

And yet, to Claude, my repro essentially didn't exist.

The problem is that "scrolling jitters" from my repro didn't mean anything to Claude. Claude doesn't have eyes or other ways to perceive the jitter directly. So Claude was essentially operating *without* a repro--it tried to fix the bug, but didn't do anything specific to verify it. That is too common, even with the best of us.

In this case, Claude *couldn't* have followed my repro exactly since it couldn't "look" at the screen (taking a few screenshots wouldn't capture it). So my first repro was unsuitable if I wanted Claude to fix it. This might seem like a problem with Claude, but it's actually not uncommon when working with other people--sometimes a bug only happens on one machine, or for a specific user, or with specific settings.

Luckily, there is a trick. You can trade a repro for *another* repro as long as you're able to convince yourself that it'll help you make progress on the original problem.

Here's how you can change your repro, and some things to watch out for.

---

## Step 2: Narrow the Repro

Changing the repro you're working with is always a risk. The risk is that the new repro has nothing to do with your original bug, and solving it is a waste of time.

However, sometimes changing a repro is unavoidable (Claude can't look at my screen, so I have to come up with something else). And sometimes it is hugely beneficial for iteration (say, a repro that takes ten seconds is vastly more valuable than a repro that takes ten minutes). So learning to change repros is important.

Ideally, you'd trade a repro for a simpler, narrower, more direct repro.

Here's the idea I suggested to Claude:

1. Measure the document scroll position.
2. Click the button.
3. Measure the document scroll position again.
4. The *expected* behavior is that there is a delta, the *actual* behavior is there's none.

My thinking was that this seems roughly equivalent to the problem I saw with my own eyes. Although this repro doesn't capture the jitter, failing to scroll down is likely related. Even if it's not the *only* problem, it's worth fixing this on its own.

Claude added some `console.log`s, opened the page via Playwright MCP, and clicked around. Indeed, the scroll position was *not* changing despite button click.

Okay, so now Claude *is* able to verify the bug exists!

Are we done with finding the repro?

Actually, we're not!

One common pitfall with narrowing a repro is that you *think* you found a good one, but actually your new repro captures some unrelated problem that presents in a similar way. **This is a very expensive mistake to make** because you can waste hours chasing solutions to a different problem than the one you wanted to solve.

For example, it's possible that Claude simply was reading the scroll position *too early*, and even if the bug *was* fixed, it would still "see" the position unchanging. That would be very misleading--even for the right fix, the test would say it's still buggy, and Claude would miss the right fix! That happens to human engineers too.

**This is why, whenever you narrow a repro, you should also confirm that a *positive* result ("everything works") is still _possible_ to obtain with the new repro.**

This is easier to explain by an example.

I told Claude to comment out the network call (which originally surfaced the bug). If the new repro ("measure scroll, hit the button, measure scroll again") truly captures the bug I wanted to fix ("scroll jitters on click"), we should expect a change I've *already verified* to fix that bug (commenting out the action call) to *also* fix the behavior in the new repro (scroll positions should now be different).

And that's what happened! Indeed, temporarily commenting out the network call *also* fixed the test Claude was performing--the scroll positions *were* now different.

At this point, it's worth trying to change the code a few times in either direction (comment it in, comment it out) to verify that each edit predicts the new repro result. (It's also worth doing other edits to rule out that every second edit works.)

The scrolling measurement still seemed correlated to that network call.

This still doesn't mean that the new repro represents the same problem. It could be something unrelated, or just a part of it. **It's always a risk to change the repro.** However, a network call having something to do with the scroll position is at least *just as suspicious* as the original problem (scroll jitter) and would have been worth solving on its own. This is a good enough reason to continue with the new repro.

---

## Step 3: Remove Everything Else

I created a new branch and asked Claude to follow the following workflow:

1. Run the repro to verify the bug is present.
2. Remove something from the relevant code (remove components, remove event handlers, simplify conditions, remove styles, remove imports, etc).
3. Run the repro again to verify if the bug is still present.
4. If the bug is still there, commit the changes.
5. If the bug is *not* there, write down a theory about what might have "solved it", then **reset to last commit** and try deleting a smaller chunk.

I was about to step out so I told Claude to keep at it and to not rest until it's narrowed down the repro to something that can't be further reduced--a React component with no extra libraries (not even React Router) and minimal logic.

When I came back, Claude created a few reproducing cases for me, but frustratingly, none of them were exhibiting the bug:
```
⏺ I've done extensive investigation and created three progressively more
  accurate minimal reproductions. All of them work correctly, but the real
  page fails. I've tested:

  - Plain React state updates
  - React Router revalidation
  - Component remounting
  - New object references
  - Synchronous loaders
  - Various dependency arrays
  - Multiple renders during scroll

  Everything I can think of has been tested and ruled out. The bug
  consistently reproduces in the real app but not in any repro. This
  suggests there's something very specific about the page
  environment that I haven't captured.

  The workaround (deferring network call with setTimeout) works reliably,
  which confirms that the issue is the timing between the
  mutation/revalidation and the scroll. But I cannot determine WHY React
  Router's revalidation breaks scrollIntoView in the real app when it
  doesn't in the repros.

  I've committed all the repros and investigation notes for future
  reference.
```

Does this mean narrowing down the bug doesn't always work?

No.

It means Claude failed to follow my instructions. But the *way* it failed to follow them is interesting because people (me included) often make the same mistake.

While Claude was simplifying the code, it started forming *theories*. Maybe this effect is buggy. Maybe there's something to do with remounting. Maybe React is doing something weird. And it started *testing* those theories, creating isolated reproduction cases that focused on them--and seeing if they exhibit the bug.

Creating theories and testing them is great! We should definitely do that.

But have a look at my instructions again:

1. Run the repro to verify the bug is present.
2. Remove something from the relevant code (remove components, remove event handlers, simplify conditions, remove styles, remove imports, etc).
3. Run the repro again to verify if the bug is still present.
4. If the bug is still there, commit the changes.
5. If the bug is *not* there, write down a theory about what might have "solved it", then **reset to last commit** and try deleting a smaller chunk.

There's something specific I was trying to get it to do. What we're trying to ensure is that **at every point in time, we have a checkpoint where the bug still *is* happening, and with every step, we're reducing the surface area for that bug.**

Claude got too carried away testing its own theories and ended up with a bunch of test cases that don't actually exhibit the bug. Again, it's not a bad idea to test new theories, but if they fail, the correct thing to do is to come back to the original case (which still exbibits the bug!) and to keep removing things until we find the cause.

This reminds me of the concept of *well-founded recursion*. Consider this attempt to implement a `fib(n)` function that's supposed to calculate [Fibonacci numbers](https://en.wikipedia.org/wiki/Fibonacci_sequence):

```js
function fib(n) {
  if (n <= 1) {
    return n;
  } else {
    return fib(n) + fib(n - 1);
  }
}
```

Actually, this function is buggy--it will hang forever. By mistake, I wrote `fib(n)` instead of `fib(n - 2)`, and so `fib(n)` will call `fib(n)`, which will call `fib(n)`, and so on. It will never get out of recursion because `n` doesn't ever "get smaller".

Languages that understand *well-founded recursion* won't let me do this mistake. For example, in Lean, [this would have been a type error](https://live.lean-lang.org/?from=lean#codez=CYUwZgBGCWBGEAoB2EBcEByBDALgSjU1zQF4AoCCaSFQEyIIBGCHACxCQsog8pABsAziE6UY8FAGoocRCgC0EAEx4yZIA):

```lean
def fib (n : Nat) : Nat := /- error: fail to show termination for fib -/
  if n ≤ 1 then
    n
  else
    fib n + fib (n - 2)
```

Lean knows that `n` "isn't getting smaller" ([see here more precisely](https://lean-lang.org/doc/reference/latest/Definitions/Recursive-Definitions/#well-founded-recursion)) so it knows that this recursion will hang forever. It doesn't "get closer with time".

This is not a Lean tutorial but I hope you'll forgive this frivolous metaphor.

I think it's the same with the process of reducing a reducing the repro case. You want to know that *you're always, **always** making incremental progress* and the repro keeps getting smaller. This means that you must stay disciplined and remove pieces bit by bit, only committing as long as the bug still persists. At some point, you're bound to run out of things to remove, which would either present you with a mistake in your code, or a mistake in pieces you can't further reduce (e.g. React).

Repeat until it works.

---

## Step 4: Find the Root Cause

Claude didn't end up solving this one, but it got me very close.

After I told it to actually follow my instructions, and to only *remove* things, it removed enough code that the problem was contained in a single file. I moved that file outside the router, and suddenly the same code worked. Then I moved it back into the router, and it broke again. Then I made it a *top-level* route and it worked.

Something was breaking when it was nested inside the root layout.

My root layout looked like this:

```js
import { Outlet, ScrollRestoration } from "react-router-dom";

export function RootLayout() {
  return (
    <div>
      <ScrollRestoration />
      <Outlet />
    </div>
  );
}
```

Aha. It turns out, [there used to be a bug](https://github.com/remix-run/react-router/issues/13672) (already fixed in June) that caused React Router's `ScrollRestoration` to activate on every revalidation rather than on every route change. Since my network call (via an action) revalidated the route, it triggered `ScrollRestoration` during `scrollIntoView`, causing the jitter.

**This exact workflow--removing things one by one while ensuring the bug is still present--saved my ass many times.** (I once spent a week deleting half of Facebook's React tree chasing down a bug. The final repro was ~50 lines of code.) I don't know any other method that's so effective after you've run out of theories.

If I was setting up the project myself, I'd use the latest version of React Router and wouldn't have run into this bug. But the project was set up by Claude which for some inexplicable reason decided I should use an old version of a core dependency.

Ah well!

The joys of vibecoding.