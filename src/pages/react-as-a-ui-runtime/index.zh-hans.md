---
title: 将 React 作为 UI 运行时
date: '2019-02-02'
spoiler: 深入理解 React 编程模型
---

大多数教程把 React 称作是一个 UI 库。这是有道理的，因为 React 就是一个 UI 库。正如官网上的标语所说的那样。

![React homepage screenshot: "A JavaScript library for building user interfaces"](./react.png)

我曾经写过关于构建[用户界面](/the-elements-of-ui-engineering/)会遇到的难题一文。但是本篇文章将以一种不同的方式来讲述 React — 因为它更像是一种[编程运行时](https://en.wikipedia.org/wiki/Runtime_system)。

**本篇文章不会教你任何有关如何创建用户界面的技巧。** 但是它可能会帮助你更深入地理解 React 编程模型。

---

**注意：如果你还在学习 React ，请移步到[官方文档](https://reactjs.org/docs/getting-started.html#learn-react)进行学习** 

<font size="60">⚠️</font>

**本篇文章将会非常深入 — 所以并不适合初学者阅读。** 在本篇文章中，我会从最佳原则的角度尽可能地阐述 React 编程模型。我不会解释如何使用它 — 而是讲解它的原理。

文章面向有经验的程序员和那些使用过其他 UI 库但在项目中权衡利弊后最终选择了 React 的人，我希望它会对你有所帮助！

**许多人成功使用了 React 多年却从未考虑过下面我将要讲述的主题。** 这肯定是从程序员的角度来看待 React ，而不是以[设计者](http://mrmrs.cc/writing/2016/04/21/developing-ui/)的角度。但我并不认为站在两个不同的角度来重新认识 React 会有什么坏处。

话不多说，让我们开始深入理解 React 吧！

---

## 宿主树

一些程序输出数字。另一些程序输出诗词。不同的语言和它们的运行时通常会对特定的一组用例进行优化，而 React 也不例外。

React 程序通常会输出**一棵会随时间变化的树。** 它有可能是一棵 [DOM 树](https://www.npmjs.com/package/react-dom) ，[iOS 视图层](https://developer.apple.com/library/archive/documentation/General/Conceptual/Devpedia-CocoaApp/View%20Hierarchy.html) ，[PDF 原语](https://react-pdf.org/) ，又或是 [JSON 对象](https://reactjs.org/docs/test-renderer.html) 。然而，通常我们希望用它来展示 UI 。我们称它为“宿主树”，因为它往往是 React 之外宿主环境中的一部分 — 就像 DOM 或 iOS 。宿主树通常有[它](https://developer.mozilla.org/en-US/docs/Web/API/Node/appendChild)[自己](https://developer.apple.com/documentation/uikit/uiview/1622616-addsubview)的命令式 API 。而 React 就是它上面的那一层。

所以到底 React 有什么用呢？非常抽象地，它可以帮助你编写可预测的，并且能够操控复杂的宿主树进而响应像用户交互、网络响应、定时器等外部事件的应用程序。

当专业的工具可以施加特定的约束且能从中获益时，它比一般的工具要好。React 就是这样的典范，并且它坚持两个原则：

* **稳定性。** 宿主树是相对稳定的，大多数情况的更新并不会从根本上改变其整体结构。如果应用程序每秒都会将其所有可交互的元素重新排列为完全不同的组合，那将会变得难以使用。那个按钮去哪了？为什么我的屏幕在跳舞？
* **通用性。** 宿主树可以被拆分为外观和行为一致的 UI 模式（例如按钮、列表和头像）而不是随机的形状。

**这些原则恰好适用于大多数 UI 。** 然而，当输出没有稳定的“模式”时 React 并不适用。例如，React 也许可以帮助你编写一个 Twitter 客户端，但对于一个 [3D 管道屏幕保护程序](https://www.youtube.com/watch?v=Uzx9ArZ7MUU) 并不会起太大作用。

## 宿主实例

宿主树由节点组成，我们称之为“宿主实例”。

在 DOM 环境中，宿主实例就是我们通常所说的 DOM 节点 — 就像当你调用 `document.createElement('div')` 时获得的对象。在 iOS 中，宿主实例可以是从 JavaScript 到原生视图唯一标识的值。

宿主实例有它们自己的属性（例如 `domNode.className` 或者 `view.tintColor` ）。它们也有可能将其他的宿主实例作为子项。

（这和 React 没有任何联系 — 因为我在讲述宿主环境。）

通常会有原生的 API 用于操控这些宿主实例。例如，在 DOM 环境中会提供像 `appendChild`、`removeChild`、`setAttribute` 等一系列的 API 。在 React 应用中，通常你不会调用这些 API ，因为那是 React 的工作。

## 渲染器

渲染器教会 React 如何与特定的宿主环境通信以及如何管理它的宿主实例。React DOM、React Native 甚至 [Ink](https://mobile.twitter.com/vadimdemedes/status/1089344289102942211) 都可以称作 React 渲染器。你也可以[创建自己的 React 渲染器](https://github.com/facebook/react/tree/master/packages/react-reconciler) 。

React 渲染器能以下面两种模式之一进行工作。

绝大多数渲染器都被用作“突变”模式。这种模式正是 DOM 的工作方式：我们可以创建一个节点，设置它的属性，在之后往里面增加或者删除子节点。宿主实例是完全可变的。

但 React 也能以”不变“模式工作。这种模式适用于那些并不提供像 `appendChild` 的 API 而是克隆双亲树并始终替换掉顶级子树的宿主环境。在宿主树级别上的不可变性使得多线程变得更加容易。[React Fabric](https://facebook.github.io/react-native/blog/2018/06/14/state-of-react-native-2018) 就是因此而受益。

作为 React 的使用者，你永远不需要考虑这些模式。我只想强调 React 不仅仅只是从一种模式转换到另一种模式的适配器。它的用处在于以一种更好的方式操控宿主实例而不用在意那些低级视图 API 范例。

## React 元素

在宿主环境中，一个宿主实例（例如 DOM 节点）是最小的构建单元。而在 React 中，最小的构建单元是 React 元素。

React 元素是一个普通的 JavaScript 对象。它用来描述一个宿主实例。

```jsx
// JSX 是用来描述这些对象的语法糖。
// <button className="blue" />
{
  type: 'button',
  props: { className: 'blue' }
}
```

React 元素是轻量级的因为没有宿主实例与它绑定在一起。同样的，它只是对你想要在屏幕上看到的内容的描述。

就像宿主实例一样，React 元素也能形成一棵树：

```jsx
// JSX 是用来描述这些对象的语法糖。
// <dialog>
//   <button className="blue" />
//   <button className="red" />
// </dialog>
{
  type: 'dialog',
  props: {
    children: [{
      type: 'button',
      props: { className: 'blue' }
    }, {
      type: 'button',
      props: { className: 'red' }
    }]
  }
}
```

*(注意：我省略了一些对此解释不重要的[属性](/why-do-react-elements-have-typeof-property/))* 

但是，请记住 **React 元素并不是永远存在的** 。它们总是在重建和删除之间不断循环着。 

React 元素具有不可变性。例如，你不能改变 React 元素中的子元素或者属性。如果你想要在稍后渲染一些不同的东西，你需要从头创建新的 React 元素树来描述它。

我喜欢将 React 元素比作电影中放映的每一帧。它们捕捉 UI 在特定的时间点应该是什么样子。它们永远不会再改变。

## 入口

每一个 React 渲染器都有一个“入口”。正是那个特定的 API 让我们告诉 React ，将特定的 React 元素树渲染到真正的宿主实例中去。

例如，React DOM 的入口就是 `ReactDOM.render` ：

```jsx
ReactDOM.render(
  // { type: 'button', props: { className: 'blue' } }
  <button className="blue" />,
  document.getElementById('container')
);
```

当我们调用 `ReactDOM.render(reactElement, domContainer)` 时，我们的意思是：**“亲爱的 React ，将我的 `reactElement` 映射到 `domContaienr` 的宿主树上去吧。“** 

React 会查看 `reactElement.type` （在我们的例子中是 `button` ）然后告诉 React DOM 渲染器创建对应的宿主实例并设置正确的属性：

```jsx{3,4}
// 在 ReactDOM 渲染器内部（简化版）
function createHostInstance(reactElement) {
  let domNode = document.createElement(reactElement.type);
  domNode.className = reactElement.props.className;
  return domNode;
}
```

在我们的例子中，React 会这样做：

```jsx{1,2}
let domNode = document.createElement('button');
domNode.className = 'blue';

domContainer.appendChild(domNode);
```

如果 React 元素在 `reactElement.props.children` 中含有子元素，React 会在第一次渲染中递归地为它们创建宿主实例。

## 协调

如果我们用同一个 container 调用 `ReactDOM.render()` 两次会发生什么呢？

```jsx{2,11}
ReactDOM.render(
  <button className="blue" />,
  document.getElementById('container')
);

// ... 之后 ...

// 应该替换掉 button 宿主实例吗？
// 还是在已有的 button 上更新属性？
ReactDOM.render(
  <button className="red" />,
  document.getElementById('container')
);
```

同样的，React 的工作是将 React 元素树映射到宿主树上去。确定该对宿主实例做什么来响应新的信息有时候叫做[协调](https://reactjs.org/docs/reconciliation.html) 

有两种方法可以解决它。简化版的 React 会丢弃已经存在的树然后从头开始创建它：

```jsx
let domContainer = document.getElementById('container');
// 清除掉原来的树
domContainer.innerHTML = '';
// 创建新的宿主实例树
let domNode = document.createElement('button');
domNode.className = 'red';
domContainer.appendChild(domNode);
```

但是在 DOM 环境下，这样的做法效率低下而且会丢失像焦点、选中、滚动等许多状态。相反，我们希望 React 这样做：

```jsx
let domNode = domContainer.firstChild;
// 更新已有的宿主实例
domNode.className = 'red';
```

换句话说，React 需要决定何时更新一个已有的宿主实例来匹配新的 React 元素，何时该重新创建新的宿主实例。

这就引出了一个识别问题。React 元素可能每次都不相同，到底什么时候才该从概念上引用同一个宿主实例呢？

在我们的例子中，它很简单。我们之前渲染了 `<button>` 作为第一个（也是唯一）的子元素，接下来我们想要在同一个地方再次渲染 `<button>` 。在宿主实例中我们已经有了一个 `<button>` 为什么还要重新创建呢？让我们重用它。

这与 React 如何思考并解决这类问题已经很接近了。

**如果相同的元素类型在同一个地方先后出现两次，React 会重用已有的宿主实例。** 

这里有一个例子，其中的注释大致解释了 React 是如何工作的：

```jsx{9,10,16,26,27}
// let domNode = document.createElement('button');
// domNode.className = 'blue';
// domContainer.appendChild(domNode);
ReactDOM.render(
  <button className="blue" />,
  document.getElementById('container')
);

// 能重用宿主实例吗？能！(button → button)
// domNode.className = 'red';
ReactDOM.render(
  <button className="red" />,
  document.getElementById('container')
);

// 能重用宿主实例吗？不能！(button → p)
// domContainer.removeChild(domNode);
// domNode = document.createElement('p');
// domNode.textContent = 'Hello';
// domContainer.appendChild(domNode);
ReactDOM.render(
  <p>Hello</p>,
  document.getElementById('container')
);

// 能重用宿主实例吗？能！(p → p)
// domNode.textContent = 'Goodbye';
ReactDOM.render(
  <p>Goodbye</p>,
  document.getElementById('container')
);
```

同样的启发式方法也适用于子树。例如，当我们在 `<dialog>` 中新增两个 `<button>` ，React 会先决定是否要重用 `<dialog>` ，然后为每一个子元素重复这个决定步骤。

## 条件

If React only reuses host instances when the element types “match up” between updates, how can we render conditional content?

Say we want to first show only an input, but later render a message before it:

```jsx{12}
// First render
ReactDOM.render(
  <dialog>
    <input />
  </dialog>,
  domContainer
);

// Next render
ReactDOM.render(
  <dialog>
    <p>I was just added here!</p>
    <input />
  </dialog>,
  domContainer
);
```

In this example, the `<input>` host instance would get re-created. React would walk the element tree, comparing it with the previous version:

* `dialog → dialog`: Can reuse the host instance? **Yes — the type matches.**
  * `input → p`: Can reuse the host instance? **No, the type has changed!** Need to remove the existing `input` and create a new `p` host instance.
  * `(nothing) → input`: Need to create a new `input` host instance.

So effectively the update code executed by React would be like:

```jsx{1,2,8,9}
let oldInputNode = dialogNode.firstChild;
dialogNode.removeChild(oldInputNode);

let pNode = document.createElement('p');
pNode.textContent = 'I was just added here!';
dialogNode.appendChild(pNode);

let newInputNode = document.createElement('input');
dialogNode.appendChild(newInputNode);
```

This is not great because *conceptually* the `<input>` hasn’t been *replaced* with `<p>` — it just moved. We don’t want to lose its selection, focus state, and content due to re-creating the DOM.

While this problem has an easy fix (which we’ll get to in a minute), it doesn’t occur often in the React applications. It’s interesting to see why.

In practice, you would rarely call `ReactDOM.render` directly. Instead, React apps tend to be broken down into functions like this:

```jsx
function Form({ showMessage }) {
  let message = null;
  if (showMessage) {
    message = <p>I was just added here!</p>;
  }
  return (
    <dialog>
      {message}
      <input />
    </dialog>
  );
}
```

This example doesn’t suffer from the problem we just described. It might be easier to see why if we use object notation instead of JSX. Look at the `dialog` child element tree:

```jsx{12-15}
function Form({ showMessage }) {
  let message = null;
  if (showMessage) {
    message = {
      type: 'p',
      props: { children: 'I was just added here!' }
    };
  }
  return {
    type: 'dialog',
    props: {
      children: [
        message,
        { type: 'input', props: {} }
      ]
    }
  };
}
```

**Regardless of whether `showMessage` is `true` or `false`, the `<input>` is the second child and doesn’t change its tree position between renders.**

If `showMessage` changes from `false` to `true`, React would walk the element tree, comparing it with the previous version:

* `dialog → dialog`: Can reuse the host instance? **Yes — the type matches.**
  * `(null) → p`: Need to insert a new `p` host instance.
  * `input → input`: Can reuse the host instance? **Yes — the type matches.**

And the code executed by React would be similar to this:

```jsx
let inputNode = dialogNode.firstChild;
let pNode = document.createElement('p');
pNode.textContent = 'I was just added here!';
dialogNode.insertBefore(pNode, inputNode);
```

No input state is lost now.

## Lists

Comparing the element type at the same position in the tree is usually enough to decide whether reuse or re-create the corresponding host instance.

But this only works well if children positions are static and don’t re-order. In our example above, even though `message` could be a “hole”, we still knew that there the input goes after the message, and there are no other children.

With dynamic lists, we can’t be sure the order is ever the same:

```jsx
function ShoppingList({ list }) {
  return (
    <form>
      {list.map(item => (
        <p>
          You bought {item.name}
          <br />
          Enter how many do you want: <input />
        </p>
      ))}
    </form>
  )
}
```

If the `list` of our shopping items is ever re-ordered, React will see that all `p` and `input` elements inside have the same type, and won’t know to move them. (From React’s point of view, the *items themselves* changed, not their order.)

The code executed by React to re-order 10 items would be something like:

```jsx
for (let i = 0; i < 10; i++) {
  let pNode = formNode.childNodes[i];
  let textNode = pNode.firstChild;
  textNode.textContent = 'You bought ' + items[i].name;
}
```

So instead of *re-ordering* them, React would effectively *update* each of them. This can create performance issues and possible bugs. For example, the content of the first input would stay reflected in first input *after* the sort — even though conceptually they might refer to different products in your shopping list!

**This is why React nags you to specify a special property called `key` every time you include an array of elements in your output:**

```jsx{5}
function ShoppingList({ list }) {
  return (
    <form>
      {list.map(item => (
        <p key={item.productId}>
          You bought {item.name}
          <br />
          Enter how many do you want: <input />
        </p>
      ))}
    </form>
  )
}
```

A `key` tells React that it should consider an item to be *conceptually* the same even if it has different *positions* inside its parent element between renders.

When React sees `<p key="42">` inside a `<form>`, it will check if the previous render also contained `<p key="42">` inside the same `<form>`. This works even if `<form>` children changed their order. React will reuse the previous host instance with the same key if it exists, and re-order the siblings accordingly.

Note that the `key` is only relevant within a particular parent React element, such as a `<form>`. React won’t try to “match up” elements with the same keys between different parents. (React doesn’t have idiomatic support for moving a host instance between different parents without re-creating it.)

What’s a good value for a `key`? An easy way to answer this is to ask: **when would _you_ say an item is the “same” even if the order changed?** For example, in our shopping list, the product ID uniquely identifies it between siblings.

## Components

We’ve already seen functions that return React elements:

```jsx
function Form({ showMessage }) {
  let message = null;
  if (showMessage) {
    message = <p>I was just added here!</p>;
  }
  return (
    <dialog>
      {message}
      <input />
    </dialog>
  );
}
```

They are called *components*. They let us create our own “toolbox” of buttons, avatars, comments, and so on. Components are the bread and butter of React.

Components take one argument — an object hash. It contains “props” (short for “properties”). Here, `showMessage` is a prop. They’re like named arguments.

## Purity

React components are assumed to be pure with respect to their props.

```jsx
function Button(props) {
  // 🔴 Doesn't work
  props.isActive = true;
}
```

In general, mutation is not idiomatic in React. (We’ll talk more about the idiomatic way to update the UI in response to events later.)

However, *local mutation* is absolutely fine:

```jsx{2,5}
function FriendList({ friends }) {
  let items = [];
  for (let i = 0; i < friends.length; i++) {
    let friend = friends[i];
    items.push(
      <Friend key={friend.id} friend={friend} />
    );
  }
  return <section>{items}</section>;
}
```

We created `items` *while rendering* and no other component “saw” it so we can mutate it as much as we like before handing it off as part of the render result. There is no need to contort your code to avoid local mutation.

Similarly, lazy initialization is fine despite not being fully “pure”:

```jsx
function ExpenseForm() {
  // Fine if it doesn't affect other components:
  SuperCalculator.initializeIfNotReady();

  // Continue rendering...
}
```

As long as calling a component multiple times is safe and doesn’t affect rendering of other components, React doesn’t care if it’s 100% pure in the strict FP sense of the word. [Idempotence](https://stackoverflow.com/questions/1077412/what-is-an-idempotent-operation) is more important to React than purity.

That said, side effects that are directly visible to the user are not allowed in React components. In other words, merely *calling* a component function shouldn’t by itself produce a change on the screen.

## Recursion

How do we *use* components from other components? Components are functions so we *could* call them:

```jsx
let reactElement = Form({ showMessage: true });
ReactDOM.render(reactElement, domContainer);
```

However, this is *not* the idiomatic way to use components in the React runtime.

Instead, the idiomatic way to use a component is with the same mechanism we’ve already seen before — React elements. **This means that you don’t directly call the component function, but instead let React later do it for you**:

```jsx
// { type: Form, props: { showMessage: true } }
let reactElement = <Form showMessage={true} />;
ReactDOM.render(reactElement, domContainer);
```

And somewhere inside React, your component will be called:

```jsx
// Somewhere inside React
let type = reactElement.type; // Form
let props = reactElement.props; // { showMessage: true }
let result = type(props); // Whatever Form returns
```

Component function names are by convention capitalized. When the JSX transform sees `<Form>` rather than `<form>`, it makes the object `type` itself an identifier rather than a string:

```jsx
console.log(<form />.type); // 'form' string
console.log(<Form />.type); // Form function
```

There is no global registration mechanism — we literally refer to `Form` by name when typing `<Form />`. If `Form` doesn’t exist in local scope, you’ll see a JavaScript error just like you normally would with a bad variable name.

**Okay, so what does React do when an element type is a function? It calls your component, and asks what element _that_ component wants to render.**

This process continues recursively, and is described in more detail [here](https://reactjs.org/blog/2015/12/18/react-components-elements-and-instances.html). In short, it looks like this:

- **You:** `ReactDOM.render(<App />, domContainer)`
- **React:** Hey `App`, what do you render to?
  - `App`: I render `<Layout>` with `<Content>` inside.
- **React:** Hey `Layout`, what do you render to?
  - `Layout`: I render my children in a `<div>`. My child was `<Content>` so I guess that goes into the `<div>`.
- **React:** Hey `<Content>`, what do you render to?
  - `Content`: I render an `<article>` with some text and a `<Footer>` inside.
- **React:** Hey `<Footer>`, what do you render to?
  - `Footer`: I render a `<footer>` with some more text.
- **React:** Okay, here you go:

```jsx
// Resulting DOM structure
<div>
  <article>
    Some text
    <footer>some more text</footer>
  </article>
</div>
```

This is why we say reconciliation is recursive. When React walks the element tree, it might meet an element whose `type` is a component. It will call it and keep descending down the tree of returned React elements. Eventually we’ll run out of components, and React will know what to change in the host tree.

The same reconciliation rules we already discussed apply here too. If the `type` at the same position (as determined by index and optional `key`) changes, React will throw away the host instances inside, and re-create them.

## Inversion of Control

You might be wondering: why don’t we just call components directly? Why write `<Form />` rather than `Form()`?

**React can do its job better if it “knows” about your components rather than if it only sees the React element tree after recursively calling them.**

```jsx
// 🔴 React has no idea Layout and Article exist.
// You're calling them.
ReactDOM.render(
  Layout({ children: Article() }),
  domContainer
)

// ✅ React knows Layout and Article exist.
// React calls them.
ReactDOM.render(
  <Layout><Article /></Layout>,
  domContainer
)
```

This is a classic example of [inversion of control](https://en.wikipedia.org/wiki/Inversion_of_control). There’s a few interesting properties we get by letting React take control of calling our components:

* **Components become more than functions.** React can augment component functions with features like *local state* that are tied to the component identity in the tree. A good runtime provides fundamental abstractions that match the problem at hand. As we already mentioned, React is oriented specifically at programs that render UI trees and respond to interactions. If you called components directly, you’d have to build these features yourself.

* **Component types participate in the reconciliation.** By letting React call your components, you also tell it more about the conceptual structure of your tree. For example, when you move from rendering `<Feed>` to the `<Profile>` page, React won’t attempt to re-use host instances inside them — just like when you replace `<button>` with a `<p>`. All state will be gone — which is usually good when you render a conceptually different view. You wouldn't want to preserve input state between `<PasswordForm>` and `<MessengerChat>` even if the `<input>` position in the tree accidentally “lines up” between them.

* **React can delay the reconciliation.** If React takes control over calling our components, it can do many interesting things. For example, it can let the browser do some work between the component calls so that re-rendering a large component tree [doesn’t block the main thread](https://reactjs.org/blog/2018/03/01/sneak-peek-beyond-react-16.html). Orchestrating this manually without reimplementing a large part of React is difficult.

* **A better debugging story.** If components are first-class citizens that the library is aware of, we can build [rich developer tools](https://github.com/facebook/react-devtools) for introspection in development.

The last benefit to React calling your component functions is *lazy evaluation*. Let’s see what this means.

## Lazy Evaluation

When we call functions in JavaScript, arguments are evaluated before the call:

```jsx
// (2) This gets computed second
eat(
  // (1) This gets computed first
  prepareMeal()
);
```

This is usually what JavaScript developers expect because JavaScript functions can have implicit side effects. It would be surprising if we called a function, but it wouldn’t execute until its result gets somehow “used” in JavaScript.

However, React components are [relatively](#purity) pure. There is absolutely no need to execute it if we know its result won’t get rendered on the screen.

Consider this component putting `<Comments>` inside a `<Page>`:

```jsx{11}
function Story({ currentUser }) {
  // return {
  //   type: Page,
  //   props: {
  //     user: currentUser,
  //     children: { type: Comments, props: {} }
  //   }
  // }
  return (
    <Page user={currentUser}>
      <Comments />
    </Page>
  );
}
```

The `Page` component can render the children given to it inside some `Layout`:

```jsx{4}
function Page({ currentUser, children }) {
  return (
    <Layout>
      {children}
    </Layout>
  );
}
```

*(`<A><B /></A>` in JSX is the same as `<A children={<B />} />`.)*

But what if it has an early exit condition?

```jsx{2-4}
function Page({ currentUser, children }) {
  if (!currentUser.isLoggedIn) {
    return <h1>Please login</h1>;
  }
  return (
    <Layout>
      {children}
    </Layout>
  );
}
```

If we called `Comments()` as a function, it would execute immediately regardless of whether `Page` wants to render them or not:

```jsx{4,8}
// {
//   type: Page,
//   props: {
//     children: Comments() // Always runs!
//   }
// }
<Page>
  {Comments()}
</Page>
```

But if we pass a React element, we don’t execute `Comments` ourselves at all:

```jsx{4,8}
// {
//   type: Page,
//   props: {
//     children: { type: Comments }
//   }
// }
<Page>
  <Comments />
</Page>
```

This lets React decide when and *whether* to call it. If our `Page` component ignores its `children` prop and renders
`<h1>Please login</h1>` instead, React won’t even attempt to call the `Comments` function. What’s the point?

This is good because it both lets us avoid unnecessary rendering work that would be thrown away, and makes the code less fragile. (We don’t care if `Comments` throws or not when the user is logged out — it won’t be called.)

## State

We’ve talked [earlier](#reconciliation) about identity and how element’s conceptual “position” in the tree tells React whether to re-use a host instance or create a new one. Host instances can have all kinds of local state: focus, selection, input, etc. We want to preserve this state between updates that conceptually render the same UI. We also want to predictably destroy it when we render something conceptually different (such as moving from `<SignupForm>` to `<MessengerChat>`).

**Local state is so useful that React lets *your own* components have it too.** Components are still functions but React augments them with features that are useful for UIs. Local state tied to the position in the tree is one of these features.

We call these features *Hooks*. For example, `useState` is a Hook.

```jsx{2,6,7}
function Example() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>You clicked {count} times</p>
      <button onClick={() => setCount(count + 1)}>
        Click me
      </button>
    </div>
  );
}
```

It returns a pair of values: the current state and a function that updates it.

The [array destructuring](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment#Array_destructuring) syntax lets us give arbitrary names to our state variables. For example, I called this pair `count` and `setCount`, but it could’ve been a `banana` and `setBanana`. In the text below, I will use `setState` to refer to the second value regardless of its actual name in the specific examples.

*(You can learn more about `useState` and other Hooks provided by React [here](https://reactjs.org/docs/hooks-intro.html).)*

## Consistency

Even if we want to split the reconciliation process itself into [non-blocking](https://www.youtube.com/watch?v=mDdgfyRB5kg) chunks of work, we should still perform the actual host tree operations in a single synchronous swoop. This way we can ensure that the user doesn’t see a half-updated UI, and that the browser doesn’t perform unnecessary layout and style recalculation for intermediate states that the user shouldn’t see.

This is why React splits all work into the “render phase” and the “commit phase”. *Render phase* is when React calls your components and performs reconciliation. It is safe to interrupt and [in the future](https://reactjs.org/blog/2018/03/01/sneak-peek-beyond-react-16.html) will be asynchronous. *Commit phase* is when React touches the host tree. It is always synchronous.


## Memoization

When a parent schedules an update by calling `setState`, by default React reconciles its whole child subtree. This is because React can’t know whether an update in the parent would affect the child or not, and by default React opts to be consistent. This may sound very expensive but in practice it’s not a problem for small and medium-sized subtrees.

When trees get too deep or wide, you can tell React to [memoize](https://en.wikipedia.org/wiki/Memoization) a subtree and reuse previous render result during shallowly equal prop changes:

```jsx{5}
function Row({ item }) {
  // ...
}

export default React.memo(Row);
```

Now `setState` in a parent `<Table>` component would skip over reconciling `Row`s whose `item` is referentially equal to the `item` rendered last time.

You can get fine-grained memoization at the level of individual expressions with the [`useMemo()` Hook](https://reactjs.org/docs/hooks-reference.html#usememo). The cache is local to component tree position and will be destroyed together with its local state. It only holds one last item.

React intentionally doesn’t memoize components by default. Many components always receive different props so memoizing them would be a net loss.

## Raw Models

Ironically, React doesn’t use a “reactivity” system for fine-grained updates. In other words, any update at the top triggers reconciliation instead of updating just the components affected by changes.

This is an intentional design decision. [Time to interactive](https://calibreapp.com/blog/time-to-interactive/) is a crucial metric in consumer web applications, and traversing models to set up fine-grained listeners spends that precious time. Additionally, in many apps interactions tend to result either in small (button hover) or large (page transition) updates, in which case fine-grained subscriptions are a waste of memory resources.

One of the core design principles of React is that it works with raw data. If you have a bunch of JavaScript objects received from the network, you can pump them directly into your components with no preprocessing. There are no gotchas about which properties you can access, or unexpected performance cliffs when a structure slightly changes. React rendering is O(*view size*) rather than O(*model size*), and you can significantly cut the *view size* with [windowing](https://react-window.now.sh/#/examples/list/fixed-size).

There are some kinds of applications where fine-grained subscriptions are beneficial — such as stock tickers. This is a rare example of “everything constantly updating at the same time”. While imperative escape hatches can help optimize such code, React might not be the best fit for this use case. Still, you can implement your own fine-grained subscription system on top of React.

**Note that there are common performance issues that even fine-grained subscriptions and “reactivity” systems can’t solve.** For example, rendering a *new* deep tree (which happens on every page transition) without blocking the browser. Change tracking doesn’t make it faster — it makes it slower because we have to do more work to set up subscriptions. Another problem is that we have to wait for data before we can start rendering the view. In React, we aim to solve both of these problems with [Concurrent Rendering](https://reactjs.org/blog/2018/03/01/sneak-peek-beyond-react-16.html).


## Batching

Several components may want to update state in response to the same event. This example is convoluted but it illustrates a common pattern:

```jsx{4,14}
function Parent() {
  let [count, setCount] = useState(0);
  return (
    <div onClick={() => setCount(count + 1)}>
      Parent clicked {count} times
      <Child />
    </div>
  );
}

function Child() {
  let [count, setCount] = useState(0);
  return (
    <button onClick={() => setCount(count + 1)}>
      Child clicked {count} times
    </button>
  );
}
```

When an event is dispatched, the child’s `onClick` fires first (triggering its `setState`). Then the parent calls `setState` in its own `onClick` handler.

If React immediately re-rendered components in response to `setState` calls, we’d end up rendering the child twice:

```jsx{4,8}
*** Entering React's browser click event handler ***
Child (onClick)
  - setState
  - re-render Child // 😞 unnecessary
Parent (onClick)
  - setState
  - re-render Parent
  - re-render Child
*** Exiting React's browser click event handler ***
```

The first `Child` render would be wasted. And we couldn’t make React skip rendering `Child` for the second time because the `Parent` might pass some different data to it based on its updated state.

**This is why React batches updates inside event handlers:**

```jsx
*** Entering React's browser click event handler ***
Child (onClick)
  - setState
Parent (onClick)
  - setState
*** Processing state updates                     ***
  - re-render Parent
  - re-render Child
*** Exiting React's browser click event handler  ***
```

The `setState` calls in components wouldn’t immediately cause a re-render. Instead, React would execute all event handlers first, and then trigger a single re-render batching all of those updates together.

Batching is good for performance but can be surprising if you write code like:

```jsx
  const [count, setCounter] = useState(0);

  function increment() {
    setCounter(count + 1);
  }

  function handleClick() {
    increment();
    increment();
    increment();
  }
```

If we start with `count` set to `0`, these would just be three `setCount(1)` calls. To fix this, `setState` provides an overload that accepts an “updater” function:

```jsx
  const [count, setCounter] = useState(0);

  function increment() {
    setCounter(c => c + 1);
  }

  function handleClick() {
    increment();
    increment();
    increment();
  }
```

React would put the updater functions in a queue, and later run them in sequence, resulting in a re-render with `count` set to `3`.

When state logic gets more complex than a few `setState` calls, I recommend to express it as a local state reducer with the [`useReducer` Hook](https://reactjs.org/docs/hooks-reference.html#usereducer). It’s like an evolution of this “updater” pattern where each update is given a name:

```jsx
  const [counter, dispatch] = useReducer((state, action) => {
    if (action === 'increment') {
      return state + 1;
    } else {
      return state;
    }
  }, 0);

  function handleClick() {
    dispatch('increment');
    dispatch('increment');
    dispatch('increment');
  }
```

The `action` argument can be anything, although an object is a common choice.

## Call Tree

A programming language runtime usually has a [call stack](https://medium.freecodecamp.org/understanding-the-javascript-call-stack-861e41ae61d4). When a function `a()` calls `b()` which itself calls `c()`, somewhere in the JavaScript engine there’s a data structure like `[a, b, c]` that “keeps track” of where you are and what code to execute next. Once you exit out of `c`, its call stack frame is gone — poof! It’s not needed anymore. We jump back into `b`. By the time we exit `a`, the call stack is empty.

Of course, React itself runs in JavaScript and obeys JavaScript rules. But we can imagine that internally React has some kind of its own call stack to remember which component we are currently rendering, e.g. `[App, Page, Layout, Article /* we're here */]`.

React is different from a general purpose language runtime because it’s aimed at rendering UI trees. These trees need to “stay alive” for us to interact with them. The DOM doesn’t disappear after our first `ReactDOM.render()` call.

This may be stretching the metaphor but I like to think of React components as being in a “call tree” rather than just a “call stack”. When we go “out” of the `Article` component, its React “call tree” frame doesn’t get destroyed. We need to keep the local state and references to the host instances [somewhere](https://medium.com/react-in-depth/the-how-and-why-on-reacts-usage-of-linked-list-in-fiber-67f1014d0eb7).

These “call tree” frames *are* destroyed along with their local state and host instances, but only when the [reconciliation](#reconciliation) rules say it’s necessary. If you ever read React source, you might have seen these frames being referred to as [Fibers](https://en.wikipedia.org/wiki/Fiber_(computer_science)).

Fibers are where the local state actually lives. When state is updated, React marks the Fibers below as needing reconciliation, and calls those components.

## Context

In React, we pass things down to other components as props. Sometimes, the majority of components need the same thing — for example, the currently chosen visual theme. It gets cumbersome to pass it down through every level.

In React, this is solved by [Context](https://reactjs.org/docs/context.html). It is essentially like [dynamic scoping](http://wiki.c2.com/?DynamicScoping) for components. It’s like a wormhole that lets you put something on the top, and have every child at the bottom be able to read it and re-render when it changes.

```jsx
const ThemeContext = React.createContext(
  'light' // Default value as a fallback
);

function DarkApp() {
  return (
    <ThemeContext.Provider value="dark">
      <MyComponents />
    </ThemeContext.Provider>
  );
}

function SomeDeeplyNestedChild() {
  // Depends on where the child is rendered
  const theme = useContext(ThemeContext);
  // ...
}
```

When `SomeDeeplyNestedChild` renders, `useContext(ThemeContext)` will look for the closest `<ThemeContext.Provider>` above it in the tree, and use its `value`.

(In practice, React maintains a context stack while it renders.)

If there’s no `ThemeContext.Provider` above, the result of `useContext(ThemeContext)` call will be the default value specified in the `createContext()` call. In our example, it is `'light'`.


## Effects

We mentioned earlier that React components shouldn’t have observable side effects during rendering. But side effects are sometimes necessary. We may want to manage focus, draw on a canvas, subscribe to a data source, and so on.

In React, this is done by declaring an effect:

```jsx{4-6}
function Example() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    document.title = `You clicked ${count} times`;
  });

  return (
    <div>
      <p>You clicked {count} times</p>
      <button onClick={() => setCount(count + 1)}>
        Click me
      </button>
    </div>
  );
}
```

When possible, React defers executing effects until after the browser re-paints the screen. This is good because code like data source subscriptions shouldn’t hurt [time to interactive](https://calibreapp.com/blog/time-to-interactive/) and [time to first paint](https://developers.google.com/web/tools/lighthouse/audits/first-meaningful-paint). (There's a [rarely used](https://reactjs.org/docs/hooks-reference.html#uselayouteffect) Hook that lets you opt out of that behavior and do things synchronously. Avoid it.)

Effects don’t just run once. They run both after component is shown to the user for the first time, and after it updates. Effects can close over current props and state, such as with `count` in the above example.

Effects may require cleanup, such as in case of subscriptions. To clean up after itself, an effect can return a function:

```jsx
  useEffect(() => {
    DataSource.addSubscription(handleChange);
    return () => DataSource.removeSubscription(handleChange);
  });
```

React will execute the returned function before applying this effect the next time, and also before the component is destroyed.

Sometimes, re-running the effect on every render can be undesirable. You can tell React to [skip](https://reactjs.org/docs/hooks-effect.html#tip-optimizing-performance-by-skipping-effects) applying an effect if certain variables didn’t change:

```jsx{3}
  useEffect(() => {
    document.title = `You clicked ${count} times`;
  }, [count]);
```

However, it is often a premature optimization and can lead to problems if you’re not familiar with how JavaScript closures work.

For example, this code is buggy:

```jsx
  useEffect(() => {
    DataSource.addSubscription(handleChange);
    return () => DataSource.removeSubscription(handleChange);
  }, []);
```

It is buggy because `[]` says “don’t ever re-execute this effect”. But the effect closes over `handleChange` which is defined outside of it. And `handleChange` might reference any props or state:

```jsx
  function handleChange() {
    console.log(count);
  }
```

If we never let the effect re-run, `handleChange` will keep pointing at the version from the first render, and `count` will always be `0` inside of it.

To solve this, make sure that if you specify the dependency array, it includes **all** things that can change, including the functions:

```jsx{4}
  useEffect(() => {
    DataSource.addSubscription(handleChange);
    return () => DataSource.removeSubscription(handleChange);
  }, [handleChange]);
```

Depending on your code, you might still see unnecessary resubscriptions because `handleChange` itself is different on every render. The [`useCallback`](https://reactjs.org/docs/hooks-reference.html#usecallback) Hook can help you with that. Alternatively, you can just let it re-subscribe. For example, browser’s `addEventListener` API is extremely fast, and jumping through hoops to avoid calling it might cause more problems than it’s worth.

*(You can learn more about `useEffect` and other Hooks provided by React [here](https://reactjs.org/docs/hooks-effect.html).)*

## Custom Hooks

Since Hooks like `useState` and `useEffect` are function calls, we can compose them into our own Hooks:

```jsx{2,8}
function MyResponsiveComponent() {
  const width = useWindowWidth(); // Our custom Hook
  return (
    <p>Window width is {width}</p>
  );
}

function useWindowWidth() {
  const [width, setWidth] = useState(window.innerWidth);
  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  });
  return width;
}
```

Custom Hooks let different components share reusable stateful logic. Note that the *state itself* is not shared. Each call to a Hook declares its own isolated state.

*(You can learn more about writing your own Hooks [here](https://reactjs.org/docs/hooks-custom.html).)*

## Static Use Order

You can think of `useState` as a syntax for defining a “React state variable”. It’s not *really* a syntax, of course. We’re still writing JavaScript. But we are looking at React as a runtime environment, and because React tailors JavaScript to describing UI trees, its features sometimes live closer to the language space.

If `use` *was* a syntax, it would make sense for it to be at the top level:

```jsx{3}
// 😉 Note: not a real syntax
component Example(props) {
  const [count, setCount] = use State(0);

  return (
    <div>
      <p>You clicked {count} times</p>
      <button onClick={() => setCount(count + 1)}>
        Click me
      </button>
    </div>
  );
}
```

What would putting it into a condition or a callback or outside a component even mean?

```jsx
// 😉 Note: not a real syntax

// This is local state... of what?
const [count, setCount] = use State(0);

component Example() {
  if (condition) {
    // What happens to it when condition is false?
    const [count, setCount] = use State(0);
  }

  function handleClick() {
    // What happens to it when we leave a function?
    // How is this different from a variable?
    const [count, setCount] = use State(0);
  }
```

React state is local to the *component* and its identity in the tree. If `use` was a real syntax it would make sense to scope it to the top-level of a component too:


```jsx
// 😉 Note: not a real syntax
component Example(props) {
  // Only valid here
  const [count, setCount] = use State(0);

  if (condition) {
    // This would be a syntax error
    const [count, setCount] = use State(0);
  }
```

This is similar to how `import` only works at the top level of a module.

**Of course, `use` is not actually a syntax.** (It wouldn’t bring much benefit and would create a lot of friction.)

However, React *does* expect that all calls to Hooks happen only at the top level of a component and unconditionally. These [Rules of Hooks](https://reactjs.org/docs/hooks-rules.html) can be enforced with [a linter plugin](https://www.npmjs.com/package/eslint-plugin-react-hooks). There have been heated arguments about this design choice but in practice I haven’t seen it confusing people. I also wrote about why commonly proposed alternative [don’t work](https://overreacted.io/why-do-hooks-rely-on-call-order/).

Internally, Hooks are implemented as [linked lists](https://dev.to/aspittel/thank-u-next-an-introduction-to-linked-lists-4pph). When you call `useState`, we move the pointer to the next item. When we exit the component’s [“call tree” frame](#call-tree), we save the resulting list there until the next render.

[This article](https://medium.com/@ryardley/react-hooks-not-magic-just-arrays-cd4f1857236e) provides a simplified explanation for how Hooks work internally. Arrays might be an easier mental model than linked lists:


```jsx
// Pseudocode
let hooks, i;
function useState() {
  i++;
  if (hooks[i]) {
    // Next renders
    return hooks[i];
  }
  // First render
  hooks.push(...);
}

// Prepare to render
i = -1;
hooks = fiber.hooks || [];
// Call the component
YourComponent();
// Remember the state of Hooks
fiber.hooks = hooks;
```

*(If you’re curious, the real code is [here](https://github.com/facebook/react/blob/master/packages/react-reconciler/src/ReactFiberHooks.js).)*

This is roughly how each `useState()` call gets the right state. As we’ve learned [earlier](#reconciliation), “matching things up” isn’t new to React — reconciliation relies on the elements matching up between renders in a similar way.

## What’s Left Out

We’ve touched on pretty much all important aspects of the React runtime environment. If you finished this page, you probably know React in more detail than 90% of its users. And there’s nothing wrong with that!

There are some parts I left out — mostly because they’re unclear even to us. React doesn’t currently have a good story for multipass rendering, i.e. when the parent render needs information about the children. Also, the [error handling API](https://reactjs.org/docs/error-boundaries.html) doesn’t yet have a Hooks version. It’s possible that these two problems can be solved together. Concurrent Mode is not stable yet, and there are interesting questions about how Suspense fits into this picture. Maybe I’ll do a follow-up when they’re fleshed out and Suspense is ready for more than [lazy loading](https://reactjs.org/blog/2018/10/23/react-v-16-6.html#reactlazy-code-splitting-with-suspense).

**I think it speaks to the success of React’s API that you can get very far without ever thinking about most of these topics.** Good defaults like the reconciliation heuristics do the right thing in most cases. Warnings like the `key` warning nudge you when you risk shooting yourself in the foot.

If you’re a UI library nerd, I hope this post was somewhat entertaining and clarified how React works in more depth. Or maybe you decided React is too complicated and you’ll never look it again. In either case, I’d love to hear from you on Twitter! Thank you for reading.
