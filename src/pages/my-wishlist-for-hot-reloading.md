---
title: My Wishlist for Hot Reloading
date: '2018-12-08'
spoiler: I don't want a lot for Christmas. There is just one thing I need.
---

Do you have a project that you approach repeatedly with a mix of success and failure, step aside for a while, and then try again — year after year? For some, it might be a router or a virtual list scroller. For me, it’s hot reloading.

My first exposure to the idea of changing code on the fly was a brief mention in a book about Erlang that I read as a teenager. Much later, like many others, I fell in love with [Bret Victor’s beautiful demos](https://vimeo.com/36579366). I’ve read somewhere Bret was unhappy with people cherry-picking “easy” parts of his demos and screwing up the big vision. (I don’t know if this is true.) **In either case, to me shipping even small incremental improvements that people take for granted later is a success.** Smarter people than me will work on Next Big Ideas.

Now, I want to be clear that none of the *ideas* discussed in this post are mine. I’ve been [inspired](https://redux.js.org/#thanks) by many projects and people. In fact, even people whose projects I’ve never tried occasionally told me I’ve ripped off their stuff.

I’m not an inventor. If I have a “principle”, it is to take a vision that inspires me, and share it with more people — through words, code, and demos.

And hot reloading inspires me.

---

I’ve taken several attempts at implementing hot reloading for React.

In retrospect, [the first demo](https://vimeo.com/100010922) I cobbled together changed my life. It got me my first Twitter followers, first thousand GitHub stars, later first [HN frontpage](https://news.ycombinator.com/item?id=8982620) hit, and even my first [conference talk](https://www.youtube.com/watch?v=xsSnOQynTHs) (bringing Redux into existence, oops). This first iteration worked fairly well. However, soon React moved *away* from `createClass`, making a reliable implementation much more difficult.

Since then I’ve done [a few more attempts](https://medium.com/@dan_abramov/hot-reloading-in-react-1140438583bf?source=user_profile---------6------------------) to fix it, each flawed in a different way. One of them is still being used in React Native (hot reloading functions doesn’t work there because of my mistakes — sorry!)

Frustrated with my inability to work around some issues and the lack of time, I handed React Hot Loader over to a few talented contributors. They have been pushing it forward and found clever workarounds for my design flaws. I am grateful to them for keeping the project in a good state despite the challenges.

---

**To be clear, hot reloading in React is quite usable today.** In fact, this blog uses Gatsby which uses React Hot Loader under the hood. I save this post in my editor and it updates without refreshing. Magic! In some ways, the vision that I worried wouldn’t ever see mainstream usage is already almost boring.

But there are plenty of people who feel it isn’t as good as it could be. Some dismiss it as a gimmick and that breaks my heart a little bit, but I think what they’re really saying is: **the experience is not seamless.** It’s not worth it if you’re never sure whether a hot reload worked, if it breaks in confusing ways, or if it’s easier to just refresh. I agree with this 100%, but to me it means we have more work to do. And I’m excited to start thinking about what official React support for hot reloading could look like in the future.

(If you use a language like Elm, Reason or ClojureScript, maybe those problems are already solved in your ecosystem. I’m happy that you’re happy. This won’t stop me from trying and failing to bring good stuff to JavaScript.)

---

I think I’m ready to take another attempt at implementing it. Here’s why.

Ever since `createClass` stopped being the primary way we define components, **the biggest source of complexity and fragility in hot reloading components was dynamically replacing class methods.** How do you patch existing instances of classes with new “versions” of their methods? The simple answer is “replace them on the prototype” but even with Proxies, in my experience there are too many gnarly edge cases for this to work reliably.

By comparison, hot reloading functions is easy. A Babel plugin could split any function component exported from a module into two functions:

```jsx
// Reassigns the latest version
window.latest_Button = function(props) {
  // Your actual code is moved here by a plugin
  return <button>Hello</button>;
}

// Think of this as a "proxy"
// that other components would use
export default function Button(props) {
  // Always points to latest version
  return window.latest_Button(props);
}
```

Every time this module re-executes after an edit, `window.latest_Button` would point to the latest implementation. Reusing the same `Button` function between module evaluations would let us trick React into not unmounting our component even though we swapped out the implementation.

For a long time, it seemed to me that implementing reliable hot reloading for functions *alone* would encourage people to write convoluted code just to avoid using classes. But with [Hooks](https://reactjs.org/docs/hooks-intro.html), function components are fully featured so this is not a concern anymore. And this approach “just works” with Hooks:

```jsx{4}
// Reassigns the latest version
window.latest_Button = function(props) {
  // Your actual code is moved here by a plugin
  const [name, setName] = useState('Mary');
  const handleChange = e => setName(e.target.value);
  return (
    <>
      <input value={name} onChange={handleChange} />
      <h1>Hello, {name}</h1>
    </>
  );
}

// Think of this as a "proxy"
// that other components would use
export default function Button(props) {
  // Always points to latest version
  return window.latest_Button(props);
}
```

As long as the Hook call order doesn’t change, we can preserve the state even as `window.latest_Button` is replaced between file edits. And replacing event handlers “just works” too — because Hooks rely on closures, and we replace the whole function.

---

This was just a rough sketch of one possible approach. There are more (some are very different). How do we evaluate and compare them?

Before I get too attached to a specific approach that might be flawed in some way, **I decided to write down a few principles that I think are important for judging any hot reloading implementation for component code.**

It would be nice to express some of these principles as tests later. These rules aren’t strict and there might be reasonable compromises. But if we decide to break them, that should be an explicit design decision and not something we accidentally discover later.

Here goes my wish list for hot reloading React components:

### Correctness

* **Hot reloading should be unobservable before the first edit.** Until you save a file, the code should behave exactly as it would if hot reloading was disabled. It’s expected that things like `fn.toString()` don’t match, which is already the case with minification. But it shouldn’t break reasonable application and library logic.

* **Hot reload shouldn’t break React rules.** Components shouldn’t get their lifecycles called in an unexpected way, accidentally swap state between unrelated trees, or do other non-Reacty things.

* **Element type should always match the expected type.** Some approaches wrap component types but this can break `<MyThing />.type === MyThing`. This is a common source of bugs and should not happen.

* **It should be easy to support all React types.** `lazy`, `memo`, `forwardRef` — they should all be supported and it shouldn’t be hard to add support for more. Nested variations like `memo(memo(...))` should also work. We should always remount when the type shape changes.

* **It shouldn’t reimplement a non-trivial chunk of React.** It’s hard to keep up with React. If a solution reimplements React it poses problems in longer term as React adds features like Suspense.

* **Re-exports shouldn’t break.** If a component re-exports components from other modules (whether own or from `node_modules`), that shouldn’t cause issues.

* **Static fields shouldn’t break.** If you define a `ProfilePage.onEnter` method, you’d expect an importing module to be able to read it. Sometimes libraries rely on this so it’s important that it’s possible to read and write static properties, and for component itself to “see” the same values on itself.

* **It is better to lose local state than to behave incorrectly.** If we can’t reliably patch something (for example, a class), it is better to lose its local state than to do a mixed success effort at updating it. The developer will be suspicious anyway and likely force a refresh. We should be intentional about which cases we’re confident we can handle, and discard the rest.

* **It is better to lose local state than use an old version.** This is a more specific variation of the previous principle. For example, if a class couldn’t be hot reloaded, the code should force a remount for those components with the new version rather than keep rendering a zombie.

### Locality

* **Editing a module should re-execute as few modules as possible.** Side effects during component module initialization are generally discouraged. But the more code you execute, the more likely something will cause a mess when called twice. We’re writing JavaScript, and React components are islands of (relative) purity but even there we don’t have strong guarantees. So if I edit a module, my hot reloading solution should re-execute that module and try to stop there if possible.

* **Editing a component shouldn’t destroy the state of its parents or siblings.** Similar to how `setState()` only affects the tree below, editing a component shouldn’t affect anything above it.

* **Edits to non-React code should propagate upwards.** If you edit a file with constants or pure functions that’s imported from several components, those components should update. It is acceptable to lose module state in such files.

* **A runtime error introduced during hot reloading should not propagate.** If you make a mistake in one component, it shouldn’t break your whole app. In React, this is usually solved by error boundaries. However, they are too coarse for the countless typos we make while editing. I should be able to make and fix runtime errors while I work on a component without its siblings or parents unmounting. However, errors that *don’t* happen during hot reload (and are legitimate bugs in my code) should go to the closest error boundary.

* **Preserve own state unless it’s clear the developer doesn’t want to.** If you’re just tweaking styles, it’s frustrating for the state to reset on every edit. On the other hand, if you just changed the state shape or the initial state, you’ll often prefer it to reset. By default we should try our best to preserve state. But if it leads to an error during hot reload, this is often a sign some assumption has changed, so we should should reset state and *retry* rendering in that case. Commenting things out and back in is common so it’s important to handle that gracefully. For example, removing Hooks *at the end* shouldn’t reset state.

* **Discard state when it’s clear the developer wants to.** In some cases we can also proactively detect that the user wants to reset. For example, if the Hook order changed, or if primitive Hooks like `useState` change their initial state type. We can also offer a lightweight annotation that you can use to force a component to reset on every edit. Such as `// !` or some similar convention that’s fast to add and remove while you focus on how component mounts.

* **Support updating “fixed” things.** If a component is wrapped in `memo()`, hot reload should still update it. If an effect is called with `[]`, it should still be replaced. Code is like an invisible variable. Previously, I thought it was important to force deep updates below for things like `renderRow={this.renderRow}`. But in the Hooks world, we rely on closures anyway this seems unnecessary anymore. A different reference should be sufficient.

* **Support multiple components in one file.** It is a common pattern that multiple components are defined in the same file. Even if we only keep the state for function components, we want to make sure putting them in one file doesn’t cause them to lose state. Note these can be mutually recursive.

* **When possible, preserve the state of children.** If you edit a component, it’s always frustrating if its children unintentionally lose state. As long as the element types of children are defined in other files, we expect their state to be preserved. If they’re in the same file, we should do our best effort.

* **Support custom Hooks.** For well-written custom Hooks (some cases like `useInterval()` can be a bit tricky), hot reloading any arguments (including functions) should work. This shouldn’t need extra work and follows from the design of Hooks. Our solution just shouldn’t get in the way.

* **Support render props.** This usually doesn’t pose problems but it’s worth verifying they work and get updated as expected.

* **Support higher-order components.** Wrapping export into a higher-order component like `connect` shouldn’t break hot reloading or state preservation. If you use a component created from a HOC in JSX (such as `styled`), and that component is a class, it’s expected that it loses state when instantiated in the edited file. But a HOC that returns a function component (potentially using Hooks) shouldn’t lose state even if it’s defined in the same file. In fact, even edits to its arguments (e.g. `mapStateToProps`) should be reflected.

### Feedback

* **Both success and failure should provide visual feedback.** You should always be confident whether a hot reload succeeded or failed. In case of a runtime or a syntax error you should see an overlay which should be automatically be dismissed after it is irrelevant. When hot reload is successful, there should be some visual feedback such as flashing updated components or a notification.

* **A syntax error shouldn’t cause a runtime error or a refresh.** When you edit the code and you have a syntax error, it should be shown in a modal overlay (ideally, with a click-through to the editor). If you make another syntax error, the existing overlay is updated. Hot reloading is only attempted *after* you fix your syntax errors. Syntax error shouldn’t make you lose the state.

* **A syntax error after reload should still be visible.** If you see a modal syntax error overlay and refresh, you should still be seeing it. It categorically should not let you run the last successful version (I’ve seen that in some setups).

* **Consider exposing power user tools.** With hot reloading, code itself can be your “terminal”. In addition to the hypothetical `// !` command to force remount, there could be e.g. an `// inspect` command that shows a panel with props values next to the component. Be creative!

* **Minimize the noise.** DevTools and warning messages shouldn’t expose that we’re doing something special. Avoid breaking `displayName`s or adding useless wrappers to the debug output.

* **Debugging in major browsers should show the most recent code.** While this doesn’t exactly depend on us, we should do our best to ensure the browser debugger shows the most recent version of any file and that breakpoints work as expected.

* **Optimize for fast iteration, not long refactoring.** This is JavaScript, not Elm. Any long-running series of edits likely won’t hot reload well due to a bunch of mistakes that need to be fixed one by one. When in doubt, optimize for the use case of tweaking a few components in a tight iteration loop rather than for a big refactor. And be predictable. Keep in mind that if you lose developer’s trust they’ll refresh anyway.

---

This was my wish list for how hot reloading in React — or any component system that offers more than templates — should work. There’s probably more stuff I will add here with time.

I don’t know how many of these goals we can satisfy with JavaScript. But there’s one more reason I’m looking forward to working on hot reloading again. As an engineer I’m more organized than before. In particular, **I’ve finally learned my lesson to write up requirements like this before diving into another implementation.**

Maybe this one will actually work! But if it doesn’t, at least I’ve left some breadcrumbs for the next person who tries it.
