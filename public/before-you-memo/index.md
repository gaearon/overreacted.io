---
title: 'Before You memo()'
date: '2021-02-23'
spoiler: "Rendering optimizations that come naturally."
---

There are many articles written about React performance optimizations. In general, if some state update is slow, you need to:

1. Verify you're running a production build. (Development builds are intentionally slower, in extreme cases even by an order of magnitude.)
2. Verify that you didn't put the state higher in the tree than necessary. (For example, putting input state in a centralized store might not be the best idea.)
3. Run React DevTools Profiler to see what gets re-rendered, and wrap the most expensive subtrees with `memo()`. (And add `useMemo()` where needed.)

This last step is annoying, especially for components in between, and ideally a compiler would do it for you. In the future, it might.

**In this post, I want to share two different techniques.** They're surprisingly basic, which is why people rarely realize they improve rendering performance.

**These techniques are complementary to what you already know!** They don't replace `memo` or `useMemo`, but they're often good to try first.

## An (Artificially) Slow Component

Here's a component with a severe rendering performance problem:

```jsx
import { useState } from 'react';

export default function App() {
  let [color, setColor] = useState('red');
  return (
    <div>
      <input value={color} onChange={(e) => setColor(e.target.value)} />
      <p style={{ color }}>Hello, world!</p>
      <ExpensiveTree />
    </div>
  );
}

function ExpensiveTree() {
  let now = performance.now();
  while (performance.now() - now < 100) {
    // Artificial delay -- do nothing for 100ms
  }
  return <p>I am a very slow component tree.</p>;
}
```

*([Try it here](https://codesandbox.io/s/frosty-glade-m33km?file=/src/App.js:23-513))*

The problem is that whenever `color` changes inside `App`, we will re-render `<ExpensiveTree />` which we've artificially delayed to be very slow.

I could [put `memo()` on it](https://codesandbox.io/s/amazing-shtern-61tu4?file=/src/App.js) and call it a day, but there are many existing articles about it so I won't spend time on it. I want to show two different solutions.

## Solution 1: Move State Down

If you look at the rendering code closer, you'll notice only a part of the returned tree actually cares about the current `color`:

```jsx{2,5-6}
export default function App() {
  let [color, setColor] = useState('red');
  return (
    <div>
      <input value={color} onChange={(e) => setColor(e.target.value)} />
      <p style={{ color }}>Hello, world!</p>
      <ExpensiveTree />
    </div>
  );
}
```

So let's extract that part into a `Form` component and move state _down_ into it:

```jsx{4,11,14,15}
export default function App() {
  return (
    <>
      <Form />
      <ExpensiveTree />
    </>
  );
}

function Form() {
  let [color, setColor] = useState('red');
  return (
    <>
      <input value={color} onChange={(e) => setColor(e.target.value)} />
      <p style={{ color }}>Hello, world!</p>
    </>
  );
}
```

*([Try it here](https://codesandbox.io/s/billowing-wood-1tq2u?file=/src/App.js:64-380))*

Now if the `color` changes, only the `Form` re-renders. Problem solved.

## Solution 2: Lift Content Up

The above solution doesn't work if the piece of state is used somewhere *above* the expensive tree. For example, let's say we put the `color` on the *parent* `<div>`:

```jsx{2,4}
export default function App() {
  let [color, setColor] = useState('red');
  return (
    <div style={{ color }}>
      <input value={color} onChange={(e) => setColor(e.target.value)} />
      <p>Hello, world!</p>
      <ExpensiveTree />
    </div>
  );
}
```

*([Try it here](https://codesandbox.io/s/bold-dust-0jbg7?file=/src/App.js:58-313))*

Now it seems like we can't just "extract" the parts that don't use `color` into another component, since that would include the parent `<div>`, which would then include `<ExpensiveTree />`. Can't avoid `memo` this time, right?

Or can we?

Play with this sandbox and see if you can figure it out.

...

...

...

The answer is remarkably plain:

```jsx{4,5,10,15}
export default function App() {
  return (
    <ColorPicker>
      <p>Hello, world!</p>
      <ExpensiveTree />
    </ColorPicker>
  );
}

function ColorPicker({ children }) {
  let [color, setColor] = useState("red");
  return (
    <div style={{ color }}>
      <input value={color} onChange={(e) => setColor(e.target.value)} />
      {children}
    </div>
  );
}
```

*([Try it here](https://codesandbox.io/s/wonderful-banach-tyfr1?file=/src/App.js:58-423))*

We split the `App` component in two. The parts that depend on the `color`, together with the `color` state variable itself, have moved into `ColorPicker`.

The parts that don't care about the `color` stayed in the `App` component and are passed to `ColorPicker` as JSX content, also known as the `children` prop.

When the `color` changes, `ColorPicker` re-renders. But it still has the same `children` prop it got from the `App` last time, so React doesn't visit that subtree.

And as a result, `<ExpensiveTree />` doesn't re-render.

## What's the moral?

Before you apply optimizations like `memo` or `useMemo`, it might make sense to look if you can split the parts that change from the parts that don't change.

The interesting part about these approaches is that **they don't really have anything to do with performance, per se**. Using the `children` prop to split up components usually makes the data flow of your application easier to follow and reduces the number of props plumbed down through the tree. Improved performance in cases like this is a cherry on top, not the end goal.

Curiously, this pattern also unlocks _more_ performance benefits in the future.

For example, when [Server Components](https://reactjs.org/blog/2020/12/21/data-fetching-with-react-server-components.html) are stable and ready for adoption, our `ColorPicker` component could receive its `children` [from the server](https://youtu.be/TQQPAU21ZUw?t=1314). Either the whole `<ExpensiveTree />` component or its parts could run on the server, and even a top-level React state update would "skip over" those parts on the client.

That's something even `memo` couldn't do! But again, both approaches are complementary. Don't neglect moving state down (and lifting content up!)

Then, where it's not enough, use the Profiler and sprinkle those memo’s.

## Didn't I read about this before?

[Yes, probably.](https://kentcdodds.com/blog/optimize-react-re-renders)

This is not a new idea. It's a natural consequence of React composition model. It's simple enough that it's underappreciated, and deserves a bit more love.
