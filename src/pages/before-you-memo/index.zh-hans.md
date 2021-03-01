---
title: '在你写memo()之前'
date: '2021-02-23'
spoiler: "自然产生的渲染优化"
---

有很多描写React性能优化的文章。一般而言，如果某些state更新缓慢的话，你需要：

1. 验证是否正在运行一个生产环境的构建。（开发环境构建会刻意地缓慢一些，极端情况下可能会慢一个数量级）
2. 验证是否将树中的状态放在了一个比实际所需更高的位置上。（例如，将输入框的state放到了集中的store里可能不是一个好主意）
3. 运行React开发者工具来检测是什么导致了二次渲染，以及在高开销的子树上包裹`memo()`。（以及在需要的地方使用`useMemo()`）



This last step is annoying, especially for components in between, and ideally a compiler would do it for you. In the future, it might.
最后一步是很烦人的，特别是对于介于两者之间的组件，理想情况下，编译器可以为您完成这一步。未来也许会。
**In this post, I want to share two different techniques.** They're surprisingly basic, which is why people rarely realize they improve rendering performance.
**在这篇文章里，我想分享两种不同的技巧。** 它们十分基础，这也正是为什么人们很少会意识到它们可以提升渲染性能。
**These techniques are complementary to what you already know!** They don't replace `memo` or `useMemo`, but they're often good to try first.
**这些技巧和你已经知道的内容是互补的** 它们并不会替代`memo` 或者 `useMemo`，但是先试一试它们还是不错的

## An (Artificially) Slow Component
## 一个（人工）减缓的组件

Here's a component with a severe rendering performance problem:
这里是一个具有严重渲染性能问题的组件

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


*([在这里试试](https://codesandbox.io/s/frosty-glade-m33km?file=/src/App.js:23-513))*


问题就是当`App`中的`color`变化时，我们会重新渲染一次被我们手动大幅延缓渲染的`<ExpensiveTree />`组件。
我可以直接在它[上面写个memo()](https://codesandbox.io/s/amazing-shtern-61tu4?file=/src/App.js)然后收工大吉，但是现在已经有很多这方面的文章了，所以我不会再花时间讲解如何使用memo()来优化。我只想展示
两种不同的解决方案。


## 解法 1： 向下移动State

如果你仔细看一下渲染代码，你会注意到返回的树中只有一部分真正关心当前的`color`：
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

所以让我们把这一部分提取到`Form`组件中然后将state移动到该组件里：
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

*([在这里试试](https://codesandbox.io/s/billowing-wood-1tq2u?file=/src/App.js:64-380))*

Now if the `color` changes, only the `Form` re-renders. Problem solved.
现在如果`color`变化了，只有`Form`会重新渲染。问题解决了。

## Solution 2: Lift Content Up
## 解法 2：内容提升

The above solution doesn't work if the piece of state is used somewhere *above* the expensive tree. For example, let's say we put the `color` on the *parent* `<div>`:
当一部分state在高开销树的上层代码中使用时上述解法就无法奏效了。举个例子，如果我们将`color`放到父元素`div`中。
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

*([在这里试试](https://codesandbox.io/s/bold-dust-0jbg7?file=/src/App.js:58-313))*

现在看起来我们似乎没办法再将不使用`color`的部分提取到另一个组件中了，因为这部分代码会首先包含父组件的`div`，然后才包含
`<ExpensiveTree />`。这时候无法避免使用`memo`了，对吗？又或者，我们也有办法避免？



在沙盒中玩玩吧，然后看看你是否可以解决。
...

...

...


答案显而易见：
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

*([在这里试试](https://codesandbox.io/s/wonderful-banach-tyfr1?file=/src/App.js:58-423))*


我们将`App`组件分割为两个子组件。依赖`color`的代码就和`color` state变量一起放入`ColorPicker`组件里。
不关心`color`的部分就依然放在`App`组件中，然后以JSX内容的形式传递给`ColorPicker`，也被称为`children`属性。
当`color`变化时，`ColorPicker`会重新渲染。但是它仍然保存着上一次从`App`中拿到的相同的`children`属性，所以React并不会访问那棵子树。
因此，`ExpensiveTree`不会重新渲染。

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
