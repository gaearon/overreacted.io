---
title: '在你使用 memo() 之前'
date: '2021-02-23'
spoiler: "自然而然地讓 render 最佳化。"
---

有很多關於 React 效能最佳化的文章。大體而言，如果某些 state 更新得很慢，你需要：

1. 確認你是否正在執行正式的編譯版本。（開發的編譯版本是刻意被設計成比較慢的，在極端的情況下可能會是一個數量級的慢。）
2. 確認你沒有把 state 更新放在 tree 裡比你所需要的還高的地方。（例如，把 input 欄位的 state 放在一個中央的儲存區裡並不是個很好的想法。）
3. 執行 React DevTools Profiler 來看哪些東西被重新 render 了，然後將最需要資源的 subtree 用 `memo()` 包起來。（並且在需要的地方加上 `useMemo()`。）

最後一個步驟尤其對在中間的 component 來說很麻煩，而且理想上編譯器會幫你做掉。或許未來可能會做到。

**在這篇文章，我會分享兩種不同的技巧。**它們出乎意料的基本，這就是為什麼很多人沒有意識到它們增進了 render 的效能。

**這些技巧能夠補充你本來就已經知道的知識！**它們並沒有取代 `memo` 或 `useMemo`，但第一時間嘗試這些做法通常效果不錯。

## 一個（人為的）效能慢的 Component

以下是一個有嚴重 render 效能問題的 component：

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
  return <p>我是一個非常慢的 component tree。</p>;
}
```

*([在這裡試試](https://codesandbox.io/s/frosty-glade-m33km?file=/src/App.js:23-513))*

這裡的問題是，每當 `App` 裡的 `color` 改變時，我們會重新 render `<ExpensiveTree />`，我們故意延遲這個 component ，讓效能變得非常差。

我可以[在這使用 `memo()`](https://codesandbox.io/s/amazing-shtern-61tu4?file=/src/App.js)，然後收工下班，但已經有很多文章解釋了這個用法，所以我不會再花時間在這上面。我想要展示另外兩種不同的解法。

## 解法 1：把 State 往下移

如果你仔細看 render 的程式碼，你會注意到只有一小部分回傳的 tree 真的使用到了當下的 `color`：

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

所以，讓我們把這部分抽出，將它放到 `Form` component 裡，並且把 state 往 _下_ 移進去：

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

現在，如果 `color` 改變了，只有 `Form` 會被重新 render。問題解決了。

## 解法 2：把內容往上移

如果這個 state 已經在這個效能很差的 tree 的*上面*的某處被用到了，前面提到的解法就會變得不可行。例如，假設我們把 `color` 放到 *parent* `<div>` 裡：

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

因為 parent `<div>` 也使用到了 `color`，所以現在看起來我們沒辦法單純把 `color` 抽出到另一個 component，因為這樣會不可避免地會包含到 `<ExpensiveTree />`。這次或許無法避免使用 `memo` 了？

還是我們仍可以避免？

看你是否可以玩一下這個 sandbox 來找出解法。

...

...

...

答案出乎意料的平凡無奇：

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

我們把 `App` component 一分為二，將需要依賴 `color` 的部分，以及 `color` state 的變數本身，移進去 `ColorPicker`。

其他不需要在乎 `color` 的部分則留在 `App` component 裡，並且把它當作 JSX 的內容傳進 `ColorPicker` 裡，亦即當作 `children` prop 來傳進去。

每當 `color` 改變時，`ColorPicker` 會重新 render。但它會跟上次從 `App` 裡拿到的 `children` prop 一樣，所以 React 不會去理那個 subtree。

因此，不會重新 render `<ExpensiveTree />`。

## 這裡的寓意是什麼？

在你使用像是 `memo` 或 `useMemo` 等最佳化的方式之前，你可以試著看看是否可以把需要改變和不需要改變的部分拆開來。

這樣的做法有趣的點在於，**它們本身跟效能問題其實沒什麼關係**。通常使用 `children` prop 來拆開 component 會讓你的應用程式的資料流比較容易被理解，而且這也減少了往 tree 下面傳的 props 的數量。利用這種方式帶來的效能增益，是附加的好處，而不是這個方式本來的目標。

令人驚訝的是，這樣的模式也帶來了 _更多_ 未來可以增進效能的好處。

舉例來說，當 [Server Components](https://reactjs.org/blog/2020/12/21/data-fetching-with-react-server-components.html) 已經穩定且可以被大家採用的時候，我們的 `ColorPicker` component 可以 [從伺服器](https://youtu.be/TQQPAU21ZUw?t=1314) 接收它的 `children`。不論是整個 `<ExpensiveTree />` component 或是它的部份都可以在伺服器上執行，甚至最高層級（top-level）的 React state 更新的那些部份，也會在客戶端被「跳過」。

上面的例子即使用了 `memo` 也沒辦法做到！但，這兩種做法是互補的。不要忽略把 state 往下移（和把內容往上移）的方式。

在那之後，如果效能增進的幅度還不夠的話，試著用 Profiler 並在需要的地方使用 memo。

## 我以前沒有讀過這個概念嗎？

[是的，或許有。](https://kentcdodds.com/blog/optimize-react-re-renders)

這不是什麼全新的想法，這是 React 組成模型自然而然的結果。它簡單到被大家低估了，或許它值得更多的關愛。
