---
title: Introducing RSC Explorer
date: '2025-12-19'
spoiler: My new hobby project.
bluesky: https://bsky.app/profile/danabra.mov/post/3mabn2f236s2f
---

In the past few weeks, since the disclosure of the [critical security vulnerability in React Server Components (RSC)](https://react.dev/blog/2025/12/03/critical-security-vulnerability-in-react-server-components), there's been a lot of interest in the RSC protocol.

The RSC protocol is the format in which React trees (and a [superset of JSON](https://github.com/facebook/react/issues/25687)) get serialized and deserialized by React. React provides both a writer and a reader for the RSC protocol, which are versioned and evolved in lockstep with each other.

Because the RSC protocol is an *implementation detail* of React, it is not explicitly documented outside the source code. The benefit of this approach is that React has a lot of leeway to improve the format and add new features and optimizations to it.

However, the downside is that even people who actively build apps with React Server Components often don't have an intuition for how it works under the hood.

A few months ago, I wrote [Progressive JSON](/progressive-json/) to explain some of the ideas used by the RSC protocol. While you don't "need" to know them to use RSC, I think it's one of the cases where looking under the hood is actually quite fun and instructive.

I wish the circumstances around the increased interest now were different, but in any case, **that interest inspired me to make a new little tool** to show how it works.

I'm calling it **RSC Explorer**, and you can find it at [`https://rscexplorer.dev/`](https://rscexplorer.dev/).

Obviously, it's [open](https://tangled.org/danabra.mov/rscexplorer) [source](https://github.com/gaearon/rscexplorer).

---

"Show, don't tell", as they say. Well, there it is as an embed.

Let's start with the Hello World:

<iframe
  style={{ width: "100%", height: 500, border: "1px solid #eee", borderRadius: 8 }}
  src="https://rscexplorer.dev/embed.html?c=eyJzZXJ2ZXIiOiJleHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBBcHAoKSB7XG4gIHJldHVybiA8aDE%2BSGVsbG8gV29ybGQ8L2gxPlxufSIsImNsaWVudCI6Iid1c2UgY2xpZW50JyJ9"
/>

Notice there's a yellow highlighted line that says something cryptic. If you look closely, it's `<h1>Hello</h1>` represented as a piece of JSON. This line is a part of the RSC stream from the server. **That's how React talks to itself over the network.**

**Now press the big yellow "step" button!**

Notice how `<h1>Hello</h1>` now appears on the right. This is the JSX that the *client* reconstructs after reading this line. We've just seen a simple piece of JSX--the `<h1>Hello</h1>` tag--cross the network and get revived on the other side.

Well, not *really* "cross the network".

One cool thing about RSC Explorer is that it's a single-page app, i.e. **it runs entirely in your browser** (more precisely, the Server part runs in a worker). This is why, if you check the Network tab, you'll see no requests. So in a sense it's a simulation.

Nevertheless, RSC Explorer is built using exactly the same packages that React provides to read and write the RSC protocol, so every line of the output is real.

---

## Async Component

Let's try something slightly more interesting to see *streaming* in action.

Take this example and press the big yellow "step" button **exactly two times:**

<iframe
  style={{ width: "100%", height: 800, border: "1px solid #eee", borderRadius: 8 }}
  src="https://rscexplorer.dev/embed.html?c=eyJzZXJ2ZXIiOiJpbXBvcnQgeyBTdXNwZW5zZSB9IGZyb20gJ3JlYWN0J1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBBcHAoKSB7XG4gIHJldHVybiAoXG4gICAgPGRpdj5cbiAgICAgIDxoMT5Bc3luYyBDb21wb25lbnQ8L2gxPlxuICAgICAgPFN1c3BlbnNlIGZhbGxiYWNrPXs8cD5Mb2FkaW5nLi4uPC9wPn0%2BXG4gICAgICAgIDxTbG93Q29tcG9uZW50IC8%2BXG4gICAgICA8L1N1c3BlbnNlPlxuICAgIDwvZGl2PlxuICApXG59XG5cbmFzeW5jIGZ1bmN0aW9uIFNsb3dDb21wb25lbnQoKSB7XG4gIGF3YWl0IG5ldyBQcm9taXNlKHIgPT4gc2V0VGltZW91dChyLCA1MDApKVxuICByZXR1cm4gPHA%2BRGF0YSBsb2FkZWQhPC9wPlxufSIsImNsaWVudCI6Iid1c2UgY2xpZW50JyJ9"
/>

(If you miscounted, press "restart" on the left, and then "step" two times again.)

Have a look at the upper right pane. You can see three chunks in the RSC protocol format (which, again, you don't technically *need* to read--and which changes between versions). On the right, you see what Client React reconstructed *so far*.

**Notice a "hole" in the middle of the streamed tree, visualized as a "Pending" pill.**

By default, React would not show an inconsistent UI with "holes". However, since you've declared a loading state with `<Suspense>`, a partially completed UI now can be displayed (notice how the `<h1>` is already visible but `<Suspense>` shows the fallback content because `<SlowComponent />` has not streamed in yet).

Press the "step" button once again, and the "hole" will be filled.

---

## Counter

So far, we've only sent *data* to the client; now let's also send some *code*.

Let's use a counter as the classic example.

Press the big yellow "step" button twice:

<iframe
  style={{ width: "100%", height: 800, border: "1px solid #eee", borderRadius: 8 }}
  src="https://rscexplorer.dev/embed.html?c=eyJzZXJ2ZXIiOiJpbXBvcnQgeyBDb3VudGVyIH0gZnJvbSAnLi9jbGllbnQnXG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIEFwcCgpIHtcbiAgcmV0dXJuIChcbiAgICA8ZGl2PlxuICAgICAgPGgxPkNvdW50ZXI8L2gxPlxuICAgICAgPENvdW50ZXIgaW5pdGlhbENvdW50PXswfSAvPlxuICAgIDwvZGl2PlxuICApXG59IiwiY2xpZW50IjoiJ3VzZSBjbGllbnQnXG5cbmltcG9ydCB7IHVzZVN0YXRlIH0gZnJvbSAncmVhY3QnXG5cbmV4cG9ydCBmdW5jdGlvbiBDb3VudGVyKHsgaW5pdGlhbENvdW50IH0pIHtcbiAgY29uc3QgW2NvdW50LCBzZXRDb3VudF0gPSB1c2VTdGF0ZShpbml0aWFsQ291bnQpXG5cbiAgcmV0dXJuIChcbiAgICA8ZGl2PlxuICAgICAgPHA%2BQ291bnQ6IHtjb3VudH08L3A%2BXG4gICAgICA8ZGl2IHN0eWxlPXt7IGRpc3BsYXk6ICdmbGV4JywgZ2FwOiA4IH19PlxuICAgICAgICA8YnV0dG9uIG9uQ2xpY2s9eygpID0%2BIHNldENvdW50KGMgPT4gYyAtIDEpfT7iiJI8L2J1dHRvbj5cbiAgICAgICAgPGJ1dHRvbiBvbkNsaWNrPXsoKSA9PiBzZXRDb3VudChjID0%2BIGMgKyAxKX0%2BKzwvYnV0dG9uPlxuICAgICAgPC9kaXY%2BXG4gICAgPC9kaXY%2BXG4gIClcbn0ifQ%3D%3D"
/>

That's just a good old counter, nothing too interesting here.

Or is there?

Have a look at the protocol payload. It's a bit tricky to read, but notice that we're not sending the string `"Count: 0"` or the `<button>`s, or any HTML. We're sending **`<Counter initialCount={0} />` itself--the "virtual DOM".** It can, of course, be turned to HTML later, just like any JSX can, but it doesn't have to be.

It's like we're returning React trees from API routes.

Notice how the `Counter` reference becomes `["client",[],"Counter"]` in the RSC protocol, which says "grab the `Counter` export from the `client` module". In a real framework, this would be done by the bundler, which is why RSC integrates with bundlers. If you're familiar with webpack, this is similar to reading from the webpack require cache. (In fact, [that's how](https://github.com/gaearon/rscexplorer/blob/58cee712d9223675d2c0e2c5b828b499150c2269/src/shared/webpack-shim.ts) RSC Explorer implements that.)

---

## Form Action

We've just seen the server *referring* to a piece of code exposed by the client.

Now let's see the client *referring* to a piece of code exposed by the server.

Here, `greet` is a *Server Action*, exposed with `'use server'` as an endpoint. It's passed as a prop to the Client `Form` component that sees it as an `async` function.

Press the big yellow "step" button three times:

<iframe
  style={{ width: "100%", height: 900, border: "1px solid #eee", borderRadius: 8 }}
  src="https://rscexplorer.dev/embed.html?c=eyJzZXJ2ZXIiOiJpbXBvcnQgeyBGb3JtIH0gZnJvbSAnLi9jbGllbnQnXG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIEFwcCgpIHtcbiAgcmV0dXJuIChcbiAgICA8ZGl2PlxuICAgICAgPGgxPkZvcm0gQWN0aW9uPC9oMT5cbiAgICAgIDxGb3JtIGdyZWV0QWN0aW9uPXtncmVldH0gLz5cbiAgICA8L2Rpdj5cbiAgKVxufVxuXG5hc3luYyBmdW5jdGlvbiBncmVldChwcmV2U3RhdGUsIGZvcm1EYXRhKSB7XG4gICd1c2Ugc2VydmVyJ1xuICBhd2FpdCBuZXcgUHJvbWlzZShyID0%2BIHNldFRpbWVvdXQociwgNTAwKSlcbiAgY29uc3QgbmFtZSA9IGZvcm1EYXRhLmdldCgnbmFtZScpXG4gIGlmICghbmFtZSkgcmV0dXJuIHsgbWVzc2FnZTogbnVsbCwgZXJyb3I6ICdQbGVhc2UgZW50ZXIgYSBuYW1lJyB9XG4gIHJldHVybiB7IG1lc3NhZ2U6IGBIZWxsbywgJHtuYW1lfSFgLCBlcnJvcjogbnVsbCB9XG59IiwiY2xpZW50IjoiJ3VzZSBjbGllbnQnXG5cbmltcG9ydCB7IHVzZUFjdGlvblN0YXRlIH0gZnJvbSAncmVhY3QnXG5cbmV4cG9ydCBmdW5jdGlvbiBGb3JtKHsgZ3JlZXRBY3Rpb24gfSkge1xuICBjb25zdCBbc3RhdGUsIGZvcm1BY3Rpb24sIGlzUGVuZGluZ10gPSB1c2VBY3Rpb25TdGF0ZShncmVldEFjdGlvbiwge1xuICAgIG1lc3NhZ2U6IG51bGwsXG4gICAgZXJyb3I6IG51bGxcbiAgfSlcblxuICByZXR1cm4gKFxuICAgIDxmb3JtIGFjdGlvbj17Zm9ybUFjdGlvbn0%2BXG4gICAgICA8ZGl2IHN0eWxlPXt7IGRpc3BsYXk6ICdmbGV4JywgZ2FwOiA4IH19PlxuICAgICAgICA8aW5wdXRcbiAgICAgICAgICBuYW1lPVwibmFtZVwiXG4gICAgICAgICAgcGxhY2Vob2xkZXI9XCJFbnRlciB5b3VyIG5hbWVcIlxuICAgICAgICAgIHN0eWxlPXt7IHBhZGRpbmc6ICc4cHggMTJweCcsIGJvcmRlclJhZGl1czogNCwgYm9yZGVyOiAnMXB4IHNvbGlkICNjY2MnIH19XG4gICAgICAgIC8%2BXG4gICAgICAgIDxidXR0b24gZGlzYWJsZWQ9e2lzUGVuZGluZ30%2BXG4gICAgICAgICAge2lzUGVuZGluZyA%2FICdTZW5kaW5nLi4uJyA6ICdHcmVldCd9XG4gICAgICAgIDwvYnV0dG9uPlxuICAgICAgPC9kaXY%2BXG4gICAgICB7c3RhdGUuZXJyb3IgJiYgPHAgc3R5bGU9e3sgY29sb3I6ICdyZWQnLCBtYXJnaW5Ub3A6IDggfX0%2Be3N0YXRlLmVycm9yfTwvcD59XG4gICAgICB7c3RhdGUubWVzc2FnZSAmJiA8cCBzdHlsZT17eyBjb2xvcjogJ2dyZWVuJywgbWFyZ2luVG9wOiA4IH19PntzdGF0ZS5tZXNzYWdlfTwvcD59XG4gICAgPC9mb3JtPlxuICApXG59In0%3D"
/>

Now enter your name in the Preview pane and press "Greet". The RSC Explorer debugger will "pause" again, showing we've hit the `greet` Server Action with a request. Press the yellow "step" button to see the response returned to the client.

---

## Router Refresh

RSC is often taught with a framework, but that obscures what's happening. For example, how does a framework refresh server content? How does a router work?

RSC Explorer shows **frameworkless RSC.** There's no `router.refresh`--but you can implement your own `refresh` Server Action and a `Router` Component.

Press the "step" button repeatedly to get the whole initial UI on the screen:

<iframe
  style={{ width: "100%", height: 800, border: "1px solid #eee", borderRadius: 8 }}
  src="https://rscexplorer.dev/embed.html?c=eyJzZXJ2ZXIiOiJpbXBvcnQgeyBTdXNwZW5zZSB9IGZyb20gJ3JlYWN0J1xuaW1wb3J0IHsgVGltZXIsIFJvdXRlciB9IGZyb20gJy4vY2xpZW50J1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBBcHAoKSB7XG4gIHJldHVybiAoXG4gICAgPGRpdj5cbiAgICAgIDxoMT5Sb3V0ZXIgUmVmcmVzaDwvaDE%2BXG4gICAgICA8cCBzdHlsZT17eyBtYXJnaW5Cb3R0b206IDEyLCBjb2xvcjogJyM2NjYnIH19PlxuICAgICAgICBDbGllbnQgc3RhdGUgcGVyc2lzdHMgYWNyb3NzIHNlcnZlciBuYXZpZ2F0aW9uc1xuICAgICAgPC9wPlxuICAgICAgPFN1c3BlbnNlIGZhbGxiYWNrPXs8cD5Mb2FkaW5nLi4uPC9wPn0%2BXG4gICAgICAgIDxSb3V0ZXIgaW5pdGlhbD17cmVuZGVyUGFnZSgpfSByZWZyZXNoQWN0aW9uPXtyZW5kZXJQYWdlfSAvPlxuICAgICAgPC9TdXNwZW5zZT5cbiAgICA8L2Rpdj5cbiAgKVxufVxuXG5hc3luYyBmdW5jdGlvbiByZW5kZXJQYWdlKCkge1xuICAndXNlIHNlcnZlcidcbiAgcmV0dXJuIDxDb2xvclRpbWVyIC8%2BXG59XG5cbmFzeW5jIGZ1bmN0aW9uIENvbG9yVGltZXIoKSB7XG4gIGF3YWl0IG5ldyBQcm9taXNlKHIgPT4gc2V0VGltZW91dChyLCAzMDApKVxuICBjb25zdCBodWUgPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAzNjApXG4gIHJldHVybiA8VGltZXIgY29sb3I9e2Boc2woJHtodWV9LCA3MCUsIDg1JSlgfSAvPlxufSIsImNsaWVudCI6Iid1c2UgY2xpZW50J1xuXG5pbXBvcnQgeyB1c2VTdGF0ZSwgdXNlRWZmZWN0LCB1c2VUcmFuc2l0aW9uLCB1c2UgfSBmcm9tICdyZWFjdCdcblxuZXhwb3J0IGZ1bmN0aW9uIFRpbWVyKHsgY29sb3IgfSkge1xuICBjb25zdCBbc2Vjb25kcywgc2V0U2Vjb25kc10gPSB1c2VTdGF0ZSgwKVxuXG4gIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgY29uc3QgaWQgPSBzZXRJbnRlcnZhbCgoKSA9PiBzZXRTZWNvbmRzKHMgPT4gcyArIDEpLCAxMDAwKVxuICAgIHJldHVybiAoKSA9PiBjbGVhckludGVydmFsKGlkKVxuICB9LCBbXSlcblxuICByZXR1cm4gKFxuICAgIDxkaXYgc3R5bGU9e3tcbiAgICAgIGJhY2tncm91bmQ6IGNvbG9yLFxuICAgICAgcGFkZGluZzogMjQsXG4gICAgICBib3JkZXJSYWRpdXM6IDgsXG4gICAgICB0ZXh0QWxpZ246ICdjZW50ZXInXG4gICAgfX0%2BXG4gICAgICA8cCBzdHlsZT17eyBmb250RmFtaWx5OiAnbW9ub3NwYWNlJywgZm9udFNpemU6IDMyLCBtYXJnaW46IDAgfX0%2BVGltZXI6IHtzZWNvbmRzfXM8L3A%2BXG4gICAgPC9kaXY%2BXG4gIClcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIFJvdXRlcih7IGluaXRpYWwsIHJlZnJlc2hBY3Rpb24gfSkge1xuICBjb25zdCBbY29udGVudFByb21pc2UsIHNldENvbnRlbnRQcm9taXNlXSA9IHVzZVN0YXRlKGluaXRpYWwpXG4gIGNvbnN0IFtpc1BlbmRpbmcsIHN0YXJ0VHJhbnNpdGlvbl0gPSB1c2VUcmFuc2l0aW9uKClcbiAgY29uc3QgY29udGVudCA9IHVzZShjb250ZW50UHJvbWlzZSlcblxuICBjb25zdCByZWZyZXNoID0gKCkgPT4ge1xuICAgIHN0YXJ0VHJhbnNpdGlvbigoKSA9PiB7XG4gICAgICBzZXRDb250ZW50UHJvbWlzZShyZWZyZXNoQWN0aW9uKCkpXG4gICAgfSlcbiAgfVxuXG4gIHJldHVybiAoXG4gICAgPGRpdiBzdHlsZT17eyBvcGFjaXR5OiBpc1BlbmRpbmcgPyAwLjcgOiAxIH19PlxuICAgICAge2NvbnRlbnR9XG4gICAgICA8YnV0dG9uIG9uQ2xpY2s9e3JlZnJlc2h9IGRpc2FibGVkPXtpc1BlbmRpbmd9IHN0eWxlPXt7IG1hcmdpblRvcDogMTIgfX0%2BXG4gICAgICAgIHtpc1BlbmRpbmcgPyAnUmVmZXRjaGluZy4uLicgOiAnUmVmZXRjaCd9XG4gICAgICA8L2J1dHRvbj5cbiAgICA8L2Rpdj5cbiAgKVxufSJ9"
/>

Look at the ticking timer. Notice how the `ColorTimer` component from the Server passed a random color to the `Timer` component on the Client. Again, the Server has *returned* `<Timer color="hsl(96, 70%, 85%)" />` (or such).

**Now press the Refetch button directly below the timer.**

Without digging into the code, "step" through the server response and see what happens. You should see a continously ticking `Timer` *receive new props from the server*. **Its background color will change but its state will be preserved!**

In a sense, it's like refetching HTML using something like htmx, except it's a normal React "virtual DOM" update, so it doesn't destroy state. It's just receiving new props... from the server. Press "Refetch" a few times and step through it.

If you want to look how this works under the hood, scroll down both Server and Client parts. In short, the Client `Router` keeps a Promise to the server JSX, which is returned by `renderPage()`. Initially, `renderPage()` is called on the Server (for the first render output), and later, it is called from the Client (for refetches).

This technique, combined with URL matching and nesting, is pretty much how RSC frameworks handle routing. I think that's a pretty cool example!

---

## What Else?

I've made a few more examples for the curious folks:

- [Pagination](https://rscexplorer.dev/?s=pagination)
- [Error Handling](https://rscexplorer.dev/?s=errors)
- [Client Reference](https://rscexplorer.dev/?s=clientref)
- [Bound Actions](https://rscexplorer.dev/?s=bound)
- [Kitchen Sink](https://rscexplorer.dev/?s=kitchensink)

And, of course, the infamous:

- [CVE-2025-55182](https://rscexplorer.dev/?s=cve)

(As you would expect, this one only works on the vulnerable versions so you'd need to select 19.2.0 in the top right corner to actually get it to work.)

I'd love to see more cool RSC examples created by the community.

RSC Explorer lets you embed snippets on other pages (as I've done in this post) and create sharable links as long as the code itself is not bigger than the URL limit. The tool is entirely client-side and I intend to keep it that way for simplicity.

You're more than welcome to browse its source code on [Tangled](https://tangled.org/danabra.mov/rscexplorer) or [GitHub](https://github.com/gaearon/rscexplorer). This is a hobby project so I don't promise anything specific but I hope it's useful.

Thank you for checking it out!