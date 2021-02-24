---
title: '在 memo() 之前'
date: '2021-02-23'
spoiler: '自然而然的渲染优化。'
---

有很多关于 React 性能优化的文章。通常，如果 state 更新慢，你需要：

1. 验证你运行的是 production 版本。（development 版本有意降速了，极端情况下可能相差一个数量级。）

2. 验证你没有将 state 放在比所需更高的位置。（例如，将 input state 放在中心存储可不是最好的主意。）

3. 运行 React DevTools Profiler 查看 re-render 的内容，并使用 `memo()` 包装最昂贵的子树。（需要时使用 `useMemo()`。）

最后一步很烦人，尤其是介于其间的组件，理想情况下编译器会帮你完成。将来可能会实现。

**在这篇文章中，我想分享两种不同的技巧**。它们非常基本，这也是为啥人们很少意识到它们可以提高渲染性能。

**这些技巧是对你已经知道的东西的补充**！它们不会取代 `memo` 或 `useMemo`，但通常值得先试试。

## 一个（人为）缓慢的组件

下面是一个存在严重渲染性能问题的组件：

```jsx
import { useState } from 'react';

export default function App() {
  let [color, setColor] = useState('red');
  return (
    <div>
      <input value={color} onChange={e => setColor(e.target.value)} />
      <p style={{ color }}>Hello, world!</p>
      <ExpensiveTree />
    </div>
  );
}

function ExpensiveTree() {
  let now = performance.now();
  while (performance.now() - now < 100) {
    // 人为延迟 - 100ms 不执行任何操作
  }
  return <p>I am a very slow component tree.</p>;
}
```

（[在这里试试](https://codesandbox.io/s/frosty-glade-m33km?file=/src/App.js:23-513)）

问题是每当 `App` 内 `color` 变化，都会重新渲染 `<ExpensiveTree />`，这是我们故意让它非常慢。

我可以 [加上 `memo()`](https://codesandbox.io/s/amazing-shtern-61tu4?file=/src/App.js)，然后今天就到这。但有很多类似文章，我不会花时间在这个。我想展示两种不同的解决方案。

## 方案 1：下移 state

仔细查看渲染代码，会发现返回树中，只有一部分需要当前 `color`：

```jsx{2,5-6}
export default function App() {
  let [color, setColor] = useState('red');
  return (
    <div>
      <input value={color} onChange={e => setColor(e.target.value)} />
      <p style={{ color }}>Hello, world!</p>
      <ExpensiveTree />
    </div>
  );
}
```

我们将该部分提取到一个 `Form` 组件中，并将 state *下移*到其中：

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
      <input value={color} onChange={e => setColor(e.target.value)} />
      <p style={{ color }}>Hello, world!</p>
    </>
  );
}
```

（[在这里试试](https://codesandbox.io/s/billowing-wood-1tq2u?file=/src/App.js:64-380)）

现在如果 `color` 改变，只有 `Form` 重新渲染。问题解决了。

## 方案 2：提升内容

如果 state 用在了昂贵树的更上层，上述方案将不起作用。例如，假设将 `color` 用于父 `<div>` 中：

```jsx
export default function App() {
  let [color, setColor] = useState('red');
  return (
    <div style={{ color }}>
      <input value={color} onChange={e => setColor(e.target.value)} />
      <p>Hello, world!</p>
      <ExpensiveTree />
    </div>
  );
}
```

（[在这里试试](https://codesandbox.io/s/bold-dust-0jbg7?file=/src/App.js:58-313)）

现在似乎不能将 —— 未用到 `color` 部分「提取」到另一个组件中，因为这将包含父级 `<div>`，而父级 `<div>` 又包含 `<ExpensiveTree />`。没法避免使用 `memo`，对吗？

或者也可以？

试试示例代码，看看你能不能弄明白。

...

...

...

答案非常简单：

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
  let [color, setColor] = useState('red');
  return (
    <div style={{ color }}>
      <input value={color} onChange={e => setColor(e.target.value)} />
      {children}
    </div>
  );
}
```

（[在这里试试](https://codesandbox.io/s/wonderful-banach-tyfr1?file=/src/App.js:58-423)）

我们将 `App` 组件一分为二。依赖于 `color` 的部分，连同 `color` state 本身，移动至 `ColorPicker` 中。

不依赖 `color` 的部分，保留在 `App` 组件中，并作为 JSX 内容（即 `children` prop）传递给 `ColorPicker`。

当 `color` 变化时，`ColorPicker` 将重新渲染。但它仍然保有上一次从 `App` 中得到的 `children` prop，所以 React 不会访问该子树。

因此，`<ExpensiveTree />` 不会重新渲染。

## 有什么寓意？

在使用 `memo` 或 `useMemo` 优化之前，最好先看看是否可以将「变化部分」与「未变化部分」分开。

这些方法的有趣之处在于，**它们与性能本身没有任何关系,实际上**。使用 `children` prop 拆分组件通常会使 app 的数据流更易于追溯，并减少向下传递的 props 的数量。在这种情况下，性能提升是锦上添花，而不是最终目标。

意味深长的是，这种模式在未来也会带来更多的性能优势。

例如，当 [Server Components](https://reactjs.org/blog/2020/12/21/data-fetching-with-react-server-components.html) 稳定并可以使用时，我们的 `ColorPicker` 组件可以从 server 接收其 `children`。整个 `<ExpensiveTree />` 组件或其部分，都可以在 server 上运行，甚至顶层的 React state 更新将「跳过」client 上的部分。

这是连 `memo` 都做不到的！但是，这两种方法是互补的。不要忽略下移 state（以及提升内容！）

然后，如果还不够的话，就使用 Profiler 加上一些 memo 吧。

## 我以前看过这个吗？

[是的，有可能。](https://kentcdodds.com/blog/optimize-react-re-renders)

这不是个新想法。这是 React 组合模型的自然结果。它很简单，它被低估了，它值得更多的爱。
