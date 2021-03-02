---
title: '在你使用 memo() 之前'
date: '2021-02-23'
spoiler: "自然而然地讓渲染最佳化。"
---

有很多關於 React 效能最佳化的文章。大體而言，如果某些狀態更新得很慢，你需要：
There are many articles written about React performance optimizations. In general, if some state update is slow, you need to:

1. 確認你是否正在執行正式的編譯版本。（開發版的編譯是刻意被設計成比較慢的，在極端的情形上可能會是一個等級的強度的慢。）
1. Verify you're running a production build. (Development builds are intentionally slower, in extreme cases even by an order of magnitude.)
2. 確認你沒有把狀態更新放在渲染樹裡不必要的地方。（例如，把輸入欄位的狀態放在一個中央的儲存區裡並不是個很好的想法。）
2. Verify that you didn't put the state higher in the tree than necessary. (For example, putting input state in a centralized store might not be the best idea.)
3. 執行 React DevTools Profiler 來看哪些東西被重新渲染了，然後將最需要資源的子樹用 `memo()` 包起來。（並且在需要的地方加上 `useMemo()`。）
3. Run React DevTools Profiler to see what gets re-rendered, and wrap the most expensive subtrees with `memo()`. (And add `useMemo()` where needed.)

最後一個步驟很麻煩，尤其是在中間的元件，而且理想上編譯器會幫你做掉。未來，他可以。
This last step is annoying, especially for components in between, and ideally a compiler would do it for you. In the future, it might.

**在這篇文章，我會分享兩種不同的技巧。**他們出乎意料的基本，這就是為什麼很多人沒有意識到他們增進了渲染效能。
**In this post, I want to share two different techniques.** They're surprisingly basic, which is why people rarely realize they improve rendering performance.

**這些技巧能夠補充你本來就已經知道的知識！**他們並沒有取代 `memo` 或 `useMemo`，但第一時間嘗試這些做法通常效果不錯。
**These techniques are complementary to what you already know!** They don't replace `memo` or `useMemo`, but they're often good to try first.

## 一個（人工的）效能慢的元件
## An (Artificially) Slow Component

以下是一個有嚴重渲染效能問題的元件：
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
    // 故意延遲 -- 不做任何事情而等待 100ms
  }
  return <p>I am a very slow component tree.</p>;
}
```

*([在這裡試試](https://codesandbox.io/s/frosty-glade-m33km?file=/src/App.js:23-513))*

這裡的問題是，每當 `App` 裡的 `color` 改變時，我們會重新渲染 `<ExpensiveTree />`，我們故意使這個元件延遲，讓效能變得非常慢。
The problem is that whenever `color` changes inside `App`, we will re-render `<ExpensiveTree />` which we've artificially delayed to be very slow.

我可以使用 [`memo()` 在這個元件上](https://codesandbox.io/s/amazing-shtern-61tu4?file=/src/App.js)，然後收工下班，但已經有很多文章解釋了這個用法，所以我不會再花時間在這上面。我想要展示另外兩種不同的解法。
I could [put `memo()` on it](https://codesandbox.io/s/amazing-shtern-61tu4?file=/src/App.js) and call it a day, but there are many existing articles about it so I won't spend time on it. I want to show two different solutions.

## 解法 1：把狀態往（元件樹）下移
## Solution 1: Move State Down

如果你仔細看渲染的程式碼，你會注意到只有一小部分的回傳元件樹真的使用到當下的 `color`：
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

所以，讓我們把這部分抽出，將它放到 `Form` 元件裡，並且把狀態往 _下_ 移進去：
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

*([在這裡試試](https://codesandbox.io/s/billowing-wood-1tq2u?file=/src/App.js:64-380))*

現在，每當 `color` 改變時，只有 `Form` 會被重新渲染。我們解決了這個問題。Now if the `color` changes, only the `Form` re-renders. Problem solved.

## 解法 2：把內容往上移
## Solution 2: Lift Content Up

如果某部分的狀態已經被使用於這個效能很差的元件之上，上面的解法就會變得不可行。例如，假設我們把 `color` 放到 *parent* `<div>`：
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

*([在這裡試試](https://codesandbox.io/s/bold-dust-0jbg7?file=/src/App.js:58-313))*

因為 parent `<div>` 也使用到了 `color`，所以現在我們沒辦法單純把 `color` 抽出到另一個元件，不可避免地會包含到 `<ExpensiveTree />`。這次或許我們無法避免使用 `memo` 了？
Now it seems like we can't just "extract" the parts that don't use `color` into another component, since that would include the parent `<div>`, which would then include `<ExpensiveTree />`. Can't avoid `memo` this time, right?

或著我們可以避免？Or can we?

看你是否可以玩一下這個 sandbox 來找出解法。Play with this sandbox and see if you can figure it out.

...

...

...

答案出乎意料的平凡無奇：The answer is remarkably plain:

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

*([在這裡試試](https://codesandbox.io/s/wonderful-banach-tyfr1?file=/src/App.js:58-423))*

我們把 `App` 元件一分為二。我們把需要依賴 `color` 的部分，以及 `color` 狀態本身，移進去 `ColorPicker`。
We split the `App` component in two. The parts that depend on the `color`, together with the `color` state variable itself, have moved into `ColorPicker`.

其他不需要在乎 `color` 狀態的部分則留在 `App` 元件裡，並且把它當作 JSX 的內容傳進 `ColorPicker` 裡，這個做法也被稱作當作 `children` prop 來傳進去。
The parts that don't care about the `color` stayed in the `App` component and are passed to `ColorPicker` as JSX content, also known as the `children` prop.

每當 `color` 改變時，`ColorPicker` 會重新渲染。但他還是會跟上次從 `App` 裡拿到的 `children` prop 一樣，所以 React 不會去理子元件樹。
When the `color` changes, `ColorPicker` re-renders. But it still has the same `children` prop it got from the `App` last time, so React doesn't visit that subtree.

因此，`<ExpensiveTree />` 不會被重新渲染。
And as a result, `<ExpensiveTree />` doesn't re-render.

## 這裡的寓意是什麼？
## What's the moral?

在你使用 `memo` 或 `useMemo` 等最佳化的方式之前，你可以試著看看是否可以把需要改變及不需要改變的部分拆開來。
Before you apply optimizations like `memo` or `useMemo`, it might make sense to look if you can split the parts that change from the parts that don't change.

這樣的做法有趣的點在於，**他們本身跟效能問題其實沒什麼關係**。通常使用 `children` prop 來拆開元件會讓你的應用程式的資料流比較容易理解，而且這也減少了往下傳的 props 的數量。利用這種方式來增進效能就像是附帶的優點，並不是本來的最終目標。
The interesting part about these approaches is that **they don't really have anything to do with performance, per se**. Using the `children` prop to split up components usually makes the data flow of your application easier to follow and reduces the number of props plumbed down through the tree. Improved performance in cases like this is a cherry on top, not the end goal.

這樣的行為模式也帶來了 _更多_ 未來可以增進效能的好處。
Curiously, this pattern also unlocks _more_ performance benefits in the future.

舉例來說，當 [伺服器端的元件（Server Components）](https://reactjs.org/blog/2020/12/21/data-fetching-with-react-server-components.html)已經穩地且可以被大家採用的時候，我們的 `ColorPicker` 元件可以 [從伺服器](https://youtu.be/TQQPAU21ZUw?t=1314) 接收他的 `children`。不論是整個 `<ExpensiveTree />` 元件或是他的一部份都可以在伺服器上執行，而且最高層級的 React 狀態更新也會在客戶端「跳過」那些部分。
For example, when [Server Components](https://reactjs.org/blog/2020/12/21/data-fetching-with-react-server-components.html) are stable and ready for adoption, our `ColorPicker` component could receive its `children` [from the server](https://youtu.be/TQQPAU21ZUw?t=1314). Either the whole `<ExpensiveTree />` component or its parts could run on the server, and even a top-level React state update would "skip over" those parts on the client.

上面的做法即使用了 `memo` 也沒辦法做到！但，兩種做法是互補的。不要忽略把狀態往下移（和把內容往上移）的方式。
That's something even `memo` couldn't do! But again, both approaches are complementary. Don't neglect moving state down (and lifting content up!)

接著，如果那還不足以增進效能的話，試著用 Profiler 並在需要的地方使用 memo。
Then, where it's not enough, use the Profiler and sprinkle those memo’s.

## 我以前沒有讀過這個概念嗎？
## Didn't I read about this before?

[是的，或許。](https://kentcdodds.com/blog/optimize-react-re-renders)

這不是什麼全新的想法，這是 React 組成模型自然而然的結果。他簡單到你會低估他，或許它值得更多的關愛。
This is not a new idea. It's a natural consequence of React composition model. It's simple enough that it's underappreciated, and deserves a bit more love.
