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

**许多人成功使用了 React 多年却从未考虑过下面我将要讲述的主题。** 这肯定是从程序员的角度来看待 React ，而不是以[设计者](http://mrmrs.cc/writing/developing-ui/)的角度。但我并不认为站在两个不同的角度来重新认识 React 会有什么坏处。

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

但 React 也能以“不变”模式工作。这种模式适用于那些并不提供像 `appendChild` 的 API 而是克隆双亲树并始终替换掉顶级子树的宿主环境。在宿主树级别上的不可变性使得多线程变得更加容易。[React Fabric](https://facebook.github.io/react-native/blog/2018/06/14/state-of-react-native-2018) 就利用了这一模式。

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

当我们调用 `ReactDOM.render(reactElement, domContainer)` 时，我们的意思是：**“亲爱的 React ，将我的 `reactElement` 映射到 `domContaienr` 的宿主树上去吧。”** 

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

同样的，React 的工作是将 React 元素树映射到宿主树上去。确定该对宿主实例做什么来响应新的信息有时候叫做[协调](https://reactjs.org/docs/reconciliation.html) 。

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

但是在 DOM 环境下，这样的做法效率低下而且会丢失像 focus、selection、scroll 等许多状态。相反，我们希望 React 这样做：

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

如果 React 在渲染更新前后只重用那些元素类型匹配的宿主实例，那当遇到包含条件语句的内容时又该如何渲染呢？

假设我们只想首先展示一个输入框，但之后要在它之前渲染一条信息：

```jsx{12}
// 第一次渲染
ReactDOM.render(
  <dialog>
    <input />
  </dialog>,
  domContainer
);

// 下一次渲染
ReactDOM.render(
  <dialog>
    <p>I was just added here!</p>
    <input />
  </dialog>,
  domContainer
);
```

在这个例子中，`<input>` 宿主实例会被重新创建。React 会遍历整个元素树，并将其与先前的版本进行比较：

* `dialog → dialog` ：能重用宿主实例吗？**能 — 因为类型是匹配的。**
  * `input → p` ：能重用宿主实例吗？**不能，类型改变了！** 需要删除已有的 `input` 然后重新创建一个 `p` 宿主实例。
  * `(nothing) → input` ：需要重新创建一个 `input` 宿主实例。

因此，React 会像这样执行更新：

```jsx{1,2,8,9}
let oldInputNode = dialogNode.firstChild;
dialogNode.removeChild(oldInputNode);

let pNode = document.createElement('p');
pNode.textContent = 'I was just added here!';
dialogNode.appendChild(pNode);

let newInputNode = document.createElement('input');
dialogNode.appendChild(newInputNode);
```

这样的做法并不科学因为事实上 `<input>` 并没有被 `<p>` 所替代 — 它只是移动了位置而已。我们不希望因为重建 DOM 而丢失了 selection、focus 等状态以及其中的内容。

虽然这个问题很容易解决（在下面我会马上讲到），但这个问题在 React 应用中并不常见。而当我们探讨为什么会这样时却很有意思。

事实上，你很少会直接调用 `ReactDOM.render` 。相反，在 React 应用中程序往往会被拆分成这样的函数：

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

这个例子并不会遇到刚刚我们所描述的问题。让我们用对象注释而不是 JSX 也许可以更好地理解其中的原因。来看一下 `dialog` 中的子元素树：

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

**不管 `showMessage` 是 `true` 还是 `false` ，在渲染的过程中 `<input>` 总是在第二个孩子的位置且不会改变。** 

如果 `showMessage` 从 `false` 改变为 `true` ，React 会遍历整个元素树，并与之前的版本进行比较：

* `dialog → dialog` ：能够重用宿主实例吗？**能 — 因为类型匹配。**
  * `(null) → p` ：需要插入一个新的 `p` 宿主实例。
  * `input → input` ：能够重用宿主实例吗？**能 — 因为类型匹配。**

之后 React 大致会像这样执行代码：

```jsx
let inputNode = dialogNode.firstChild;
let pNode = document.createElement('p');
pNode.textContent = 'I was just added here!';
dialogNode.insertBefore(pNode, inputNode);
```

这样一来输入框中的状态就不会丢失了。

## 列表

比较树中同一位置的元素类型对于是否该重用还是重建相应的宿主实例往往已经足够。

但这只适用于当子元素是静止的并且不会重排序的情况。在上面的例子中，即使 `message` 不存在，我们仍然知道输入框在消息之后，并且再没有其他的子元素。

而当遇到动态列表时，我们不能确定其中的顺序总是一成不变的。

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

如果我们的商品列表被重新排序了，React 只会看到所有的 `p` 以及里面的 `input` 拥有相同的类型，并不知道该如何移动它们。（在 React 看来，虽然这些商品本身改变了，但是它们的顺序并没有改变。）

所以 React 会对这十个商品进行类似如下的重排序：

```jsx
for (let i = 0; i < 10; i++) {
  let pNode = formNode.childNodes[i];
  let textNode = pNode.firstChild;
  textNode.textContent = 'You bought ' + items[i].name;
}
```

React 只会对其中的每个元素进行更新而不是将其重新排序。这样做会造成性能上的问题和潜在的 bug 。例如，当商品列表的顺序改变时，原本在第一个输入框的内容仍然会存在于现在的第一个输入框中 — 尽管事实上在商品列表里它应该代表着其他的商品！

**这就是为什么每次当输出中包含元素数组时，React 都会让你指定一个叫做 `key` 的属性：** 

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

`key` 给予 React 判断子元素是否真正相同的能力，即使在渲染前后它在父元素中的位置不是相同的。

当 React 在 `<form>` 中发现 `<p key="42">` ，它就会检查之前版本中的 `<form>` 是否同样含有 `<p key="42">` 。即使 `<form>` 中的子元素们改变位置后，这个方法同样有效。在渲染前后当 key 仍然相同时，React 会重用先前的宿主实例，然后重新排序其兄弟元素。

需要注意的是 `key` 只与特定的父亲 React 元素相关联，比如 `<form>` 。React 并不会去匹配父元素不同但 key 相同的子元素。（React 并没有惯用的支持对在不重新创建元素的情况下让宿主实例在不同的父元素之间移动。）

给 `key` 赋予什么值最好呢？最好的答案就是：**什么时候你会说一个元素不会改变即使它在父元素中的顺序被改变？** 例如，在我们的商品列表中，商品本身的 ID 是区别于其他商品的唯一标识，那么它就最适合作为 `key` 。

## 组件

我们已经知道函数会返回 React 元素：

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

这些函数被叫做组件。它们让我们可以打造自己的“工具箱”，例如按钮、头像、评论框等等。组件就像 React 的面包和黄油。

组件接受一个参数 — 对象哈希。它包含“props”（“属性”的简称）。在这里 `showMessage` 就是一个 prop 。它们就像是具名参数一样。

## 纯净

React 组件中对于 props 应该是纯净的。

```jsx
function Button(props) {
  // 🔴 没有作用
  props.isActive = true;
}
```

通常来说，突变在 React 中不是惯用的。（我们会在之后讲解如何用更惯用的方式来更新 UI 以响应事件。）

不过，局部的突变是绝对允许的：

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

当我们在函数组件内部创建 `items` 时不管怎样改变它都行，只要这些突变发生在将其作为最后的渲染结果之前。所以并不需要重写你的代码来避免局部突变。

同样地，惰性初始化是被允许的即使它不是完全“纯净”的：

```jsx
function ExpenseForm() {
  // 只要不影响其他组件这是被允许的：
  SuperCalculator.initializeIfNotReady();

  // 继续渲染......
}
```

只要调用组件多次是安全的，并且不会影响其他组件的渲染，React 并不关心你的代码是否像严格的函数式编程一样百分百纯净。在 React 中，[幂等性](https://stackoverflow.com/questions/1077412/what-is-an-idempotent-operation)比纯净性更加重要。

也就是说，在 React 组件中不允许有用户可以直接看到的副作用。换句话说，仅调用函数式组件时不应该在屏幕上产生任何变化。

## 递归

我们该如何在组件中使用组件？组件属于函数因此我们可以直接进行调用：

```jsx
let reactElement = Form({ showMessage: true });
ReactDOM.render(reactElement, domContainer);
```

然而，在 React 运行时中这并不是惯用的使用组件的方式。

相反，使用组件惯用的方式与我们已经了解的机制相同 — 即 React 元素。**这意味着不需要你直接调用组件函数，React 会在之后为你做这件事情：** 

```jsx
// { type: Form, props: { showMessage: true } }
let reactElement = <Form showMessage={true} />;
ReactDOM.render(reactElement, domContainer);
```

然后在 React 内部，你的组件会这样被调用：

```jsx
// React 内部的某个地方
let type = reactElement.type; // Form
let props = reactElement.props; // { showMessage: true }
let result = type(props); // 无论 Form 会返回什么
```

组件函数名称按照规定需要大写。当 JSX 转换时看见 `<Form>` 而不是 `<form>` ，它让对象 `type` 本身成为标识符而不是字符串：

```jsx
console.log(<form />.type); // 'form' 字符串
console.log(<Form />.type); // Form 函数
```

我们并没有全局的注册机制 — 字面上当我们输入 `<Form>` 时代表着 `Form` 。如果 `Form` 在局部作用域中并不存在，你会发现一个 JavaScript 错误，就像平常你使用错误的变量名称一样。

**因此，当元素类型是一个函数的时候 React 会做什么呢？它会调用你的组件，然后询问组件想要渲染什么元素。** 

这个步骤会递归式地执行下去，更详细的描述在[这里](https://reactjs.org/blog/2015/12/18/react-components-elements-and-instances.html) 。总的来说，它会像这样执行：

* **你：** `ReactDOM.render(<App />, domContainer)` 
* **React：** `App` ，你想要渲染什么？
  * `App` ：我要渲染包含 `<Content>` 的 `<Layout>` 。
* **React：** `<Layout>` ，你要渲染什么？
  * `Layout` ：我要在 `<div>` 中渲染我的子元素。我的子元素是 `<Content>` 所以我猜它应该渲染到 `<div>` 中去。
* **React：** `<Content>` ，你要渲染什么？
  * `<Content>` ：我要在 `<article>` 中渲染一些文本和 `<Footer>` 。
* **React：** `<Footer>` ，你要渲染什么？
  * `<Footer>` ：我要渲染含有文本的 `<footer>` 。
* **React：** 好的，让我们开始吧：

```jsx
// 最终的 DOM 结构
<div>
  <article>
    Some text
    <footer>some more text</footer>
  </article>
</div>
```

这就是为什么我们说协调是递归式的。当 React 遍历整个元素树时，可能会遇到元素的 `type` 是一个组件。React 会调用它然后继续沿着返回的 React 元素下行。最终我们会调用完所有的组件，然后 React 就会知道该如何改变宿主树。 

在之前已经讨论过的相同的协调准则，在这一样适用。如果在同一位置的 `type` 改变了（由索引和可选的 `key` 决定），React 会删除其中的宿主实例并将其重建。

## 控制反转

你也许会好奇：为什么我们不直接调用组件？为什么要编写 `<Form />` 而不是 `Form()` ？

**React 能够做的更好如果它“知晓”你的组件而不是在你递归调用它们之后生成的 React 元素树。** 

```jsx
// 🔴 React 并不知道 Layout 和 Article 的存在。
// 因为你在调用它们。
ReactDOM.render(
  Layout({ children: Article() }),
  domContainer
)

// ✅ React知道 Layout 和 Article 的存在。
// React 来调用它们。
ReactDOM.render(
  <Layout><Article /></Layout>,
  domContainer
)
```

这是一个关于[控制反转](https://en.wikipedia.org/wiki/Inversion_of_control)的经典案例。通过让 React 调用我们的组件，我们会获得一些有趣的属性：

* **组件不仅仅只是函数。** React 能够用在树中与组件本身紧密相连的局部状态等特性来增强组件功能。优秀的运行时提供了与当前问题相匹配的基本抽象。就像我们已经提到过的，React 专门针对于那些渲染 UI 树并且能够响应交互的应用。如果你直接调用了组件，你就只能自己来构建这些特性了。
* **组件类型参与协调。** 通过 React 来调用你的组件，能让它了解更多关于元素树的结构。例如，当你从渲染 `<Feed>` 页面转到 `Profile` 页面，React 不会尝试重用其中的宿主实例 — 就像你用 `<p>` 替换掉 `<button>` 一样。所有的状态都会丢失 — 对于渲染完全不同的视图时，通常来说这是一件好事。你不会想要在 `<PasswordForm>` 和  `<MessengerChat>` 之间保留输入框的状态尽管 `<input>` 的位置意外地“排列”在它们之间。 
* **React 能够推迟协调。** 如果让 React 控制调用你的组件，它能做很多有趣的事情。例如，它可以让浏览器在组件调用之间做一些工作，这样重渲染大体量的组件树时就[不会阻塞主线程](https://reactjs.org/blog/2018/03/01/sneak-peek-beyond-react-16.html)。想要手动编排这个过程而不依赖 React 的话将会十分困难。
* **更好的可调试性。** 如果组件是库中所重视的一等公民，我们就可以构建[丰富的开发者工具](https://github.com/facebook/react-devtools)，用于开发中的自省。

让 React 调用你的组件函数还有最后一个好处就是惰性求值。让我们看看它是什么意思。

## 惰性求值

当我们在 JavaScript 中调用函数时，参数往往在函数调用之前被执行。

```jsx
// (2) 它会作为第二个计算
eat(
  // (1) 它会首先计算
  prepareMeal()
);
```

这通常是 JavaScript 开发者所期望的因为 JavaScript 函数可能有隐含的副作用。如果我们调用了一个函数，但直到它的结果不知怎地被“使用”后该函数仍没有执行，这会让我们感到十分诧异。

但是，React 组件是[相对](#纯净)纯净的。如果我们知道它的结果不会在屏幕上出现，则完全没有必要执行它。

考虑下面这个含有 `<Comments>` 的 `<Page>` 组件：

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

`<Page>` 组件能够在 `<Layout>` 中渲染传递给它的子项：

```jsx{4}
function Page({ currentUser, children }) {
  return (
    <Layout>
      {children}
    </Layout>
  );
}
```

*(在 JSX 中 `<A><B /></A>` 和 `<A children={<B />} />`相同。)*

但是要是存在提前返回的情况呢？

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

如果我们像函数一样调用 `Comments()` ，不管 `Page` 是否想渲染它们都会被立即执行：

```jsx{4,8}
// {
//   type: Page,
//   props: {
//     children: Comments() // 总是调用！
//   }
// }
<Page>
  {Comments()}
</Page>
```

但是如果我们传递的是一个 React 元素，我们不需要自己执行 `Comments` ：

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

让 React 来决定何时以及是否调用组件。如果我们的的 `Page` 组件忽略自身的 `children` prop 且相反地渲染了 `<h1>Please login</h1>` ，React 不会尝试去调用 `Comments` 函数。重点是什么？

这很好，因为它既可以让我们避免不必要的渲染也能使我们的代码变得不那么脆弱。（当用户退出登录时，我们并不在乎 `Comments` 是否被丢弃 — 因为它从没有被调用过。）

## 状态

我们先前提到过关于[协调](#协调)和在树中元素概念上的“位置”是如何让 React 知晓是该重用宿主实例还是该重建它。宿主实例能够拥有所有相关的局部状态：focus、selection、input 等等。我们想要在渲染更新概念上相同的 UI 时保留这些状态。我们也想可预测性地摧毁它们，当我们在概念上渲染的是完全不同的东西时（例如从 `<SignupForm>` 转换到 `<MessengerChat>`）。

**局部状态是如此有用，以至于 React 让你的组件也能拥有它。** 组件仍然是函数但是 React 用对构建 UI 有好处的许多特性增强了它。在树中每个组件所绑定的局部状态就是这些特性之一。

我们把这些特性叫做 Hooks 。例如，`useState` 就是一个 Hook 。

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

它返回一对值：当前的状态和更新该状态的函数。

数组的[解构语法](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment#Array_destructuring)让我们可以给状态变量自定义名称。例如，我在这里称它们为 `count` 和 `setCount` ，但是它们也可以被称作 `banana` 和 `setBanana` 。在这些文字之下，我们会用 `setState` 来替代第二个值无论它在具体的例子中被称作什么。

*(你能在 [React 文档](https://reactjs.org/docs/hooks-intro.html) 中学习到更多关于 `useState` 和 其他 Hooks 的知识。)* 

## 一致性

即使我们想将协调过程本身分割成[非阻塞](https://www.youtube.com/watch?v=mDdgfyRB5kg)的工作块，我们仍然需要在同步的循环中对真实的宿主实例进行操作。这样我们才能保证用户不会看见半更新状态的 UI ，浏览器也不会对用户不应看到的中间状态进行不必要的布局和样式的重新计算。

这也是为什么 React 将所有的工作分成了“渲染阶段”和“提交阶段”的原因。*渲染阶段* 是当 React 调用你的组件然后进行协调的时段。在此阶段进行干涉是安全的且在[未来](https://reactjs.org/blog/2018/03/01/sneak-peek-beyond-react-16.html)这个阶段将会变成异步的。*提交阶段* 就是 React 操作宿主树的时候。而这个阶段永远是同步的。


## 缓存

当父组件通过 `setState` 准备更新时，React 默认会协调整个子树。因为 React 并不知道在父组件中的更新是否会影响到其子代，所以 React 默认保持一致性。这听起来会有很大的性能消耗但事实上对于小型和中型的子树来说，这并不是问题。

当树的深度和广度达到一定程度时，你可以让 React 去[缓存](https://en.wikipedia.org/wiki/Memoization)子树并且重用先前的渲染结果当 prop 在浅比较之后是相同时：

```jsx{5}
function Row({ item }) {
  // ...
}

export default React.memo(Row);
```

现在，在父组件 `<Table>` 中调用 `setState` 时如果 `<Row>` 中的 `item` 与先前渲染的结果是相同的，React 就会直接跳过协调的过程。

你可以通过 [`useMemo()` Hook](https://reactjs.org/docs/hooks-reference.html#usememo) 获得单个表达式级别的细粒度缓存。该缓存于其相关的组件紧密联系在一起，并且将与局部状态一起被销毁。它只会保留最后一次计算的结果。

默认情况下，React 不会故意缓存组件。许多组件在更新的过程中总是会接收到不同的 props ，所以对它们进行缓存只会造成净亏损。

## 原始模型

令人讽刺地是，React 并没有使用“反应式”的系统来支持细粒度的更新。换句话说，任何在顶层的更新只会触发协调而不是局部更新那些受影响的组件。

这样的设计是有意而为之的。对于 web 应用来说[交互时间](https://calibreapp.com/blog/time-to-interactive/)是一个关键指标，而通过遍历整个模型去设置细粒度的监听器只会浪费宝贵的时间。此外，在很多应用中交互往往会导致或小（按钮悬停）或大（页面转换）的更新，因此细粒度的订阅只会浪费内存资源。

React 的设计原则之一就是它可以处理原始数据。如果你拥有从网络请求中获得的一组 JavaScript 对象，你可以将其直接交给组件而无需进行预处理。没有关于可以访问哪些属性的问题，或者当结构有所变化时造成的意外的性能缺损。React 渲染是 O(*视图大小*) 而不是 O(*模型大小*) ，并且你可以通过 [windowing](https://react-window.now.sh/#/examples/list/fixed-size) 显著地减少视图大小。

有那么一些应用细粒度订阅对它们来说是有用的 — 例如股票代码。这是一个极少见的例子，因为“所有的东西都需要在同一时间内持续更新”。虽然命令式的方法能够优化此类代码，但 React 并不适用于这种情况。同样的，如果你想要解决该问题，你就得在 React 之上自己实现细粒度的订阅。

**注意，即使细粒度订阅和“反应式”系统也无法解决一些常见的性能问题。** 例如，渲染一棵很深的树（在每次页面转换的时候发生）而不阻塞浏览器。改变跟踪并不会让它变得更快 — 这样只会让其变得更慢因为我们执行了额外的订阅工作。另一个问题是我们需要等待返回的数据在渲染视图之前。在 React 中，我们用[并发渲染](https://reactjs.org/blog/2018/03/01/sneak-peek-beyond-react-16.html)来解决这些问题。


## 批量更新

一些组件也许想要更新状态来响应同一事件。下面这个例子是假设的，但是却说明了一个常见的模式：

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

当事件被触发时，子组件的 `onClick` 首先被触发（同时触发了它的 `setState` ）。然后父组件在它自己的 `onClick` 中调用 `setState` 。

如果 React 立即重渲染组件以响应 `setState` 调用，最终我们会重渲染子组件两次：

```jsx{4,8}
*** 进入 React 浏览器 click 事件处理过程 ***
Child (onClick)
  - setState
  - re-render Child // 😞 不必要的重渲染
Parent (onClick)
  - setState
  - re-render Parent
  - re-render Child
*** 结束 React 浏览器 click 事件处理过程 ***
```

第一次 `Child` 组件渲染是浪费的。并且我们也不会让 React 跳过 `Child` 的第二次渲染因为 `Parent` 可能会传递不同的数据由于其自身的状态更新。

**这就是为什么 React 会在组件内所有事件触发完成后再进行批量更新的原因：** 

```jsx
*** 进入 React 浏览器 click 事件处理过程 ***
Child (onClick)
  - setState
Parent (onClick)
  - setState
*** Processing state updates                     ***
  - re-render Parent
  - re-render Child
*** 结束 React 浏览器 click 事件处理过程  ***
```

组件内调用 `setState` 并不会立即执行重渲染。相反，React 会先触发所有的事件处理器，然后再触发一次重渲染以进行所谓的批量更新。

批量更新虽然有用但可能会让你感到惊讶如果你的代码这样写：

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

如果我们将 `count` 初始值设为 `0` ，上面的代码只会代表三次  `setCount(1)` 调用。为了解决这个问题，我们给 `setState` 提供了一个 “updater” 函数作为参数：

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

React 会将 updater 函数放入队列中，并在之后按顺序执行它们，最终 `count` 会被设置成 `3` 并作为一次重渲染的结果。

当状态逻辑变得更加复杂而不仅仅只是少数的 `setState` 调用时，我建议你使用 [`useReducer` Hook](https://reactjs.org/docs/hooks-reference.html#usereducer) 来描述你的局部状态。它就像 “updater” 的升级模式在这里你可以给每一次更新命名：

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

`action` 字段可以是任意值，尽管对象是常用的选择。

## 调用树

编程语言的运行时往往有[调用栈](https://medium.freecodecamp.org/understanding-the-javascript-call-stack-861e41ae61d4) 。当函数 `a()` 调用 `b()` ，`b()` 又调用 `c()` 时，在 JavaScript 引擎中会有像 `[a, b, c]` 这样的数据结构来“跟踪”当前的位置以及接下来要执行的代码。一旦 `c` 函数执行完毕，它的调用栈帧就消失了！因为它不再被需要了。我们返回到函数 `b` 中。当我们结束函数 `a` 的执行时，调用栈就被清空。

当然，React 以 JavaScript 运行当然也遵循 JavaScript 的规则。但是我们可以想象在 React 内部有自己的调用栈用来记忆我们当前正在渲染的组件，例如 `[App, Page, Layout, Article /* 此刻的位置 */]` 。

React 与通常意义上的编程语言进行时不同因为它针对于渲染 UI 树，这些树需要保持“活性”，这样才能使我们与其进行交互。在第一次 `ReactDOM.render()` 出现之前，DOM 操作并不会执行。

这也许是对隐喻的延伸，但我喜欢把 React 组件当作 “调用树” 而不是 “调用栈” 。当我们调用完 `Article` 组件，它的 React “调用树” 帧并没有被摧毁。我们需要将局部状态保存以便映射到宿主实例的[某个地方](https://medium.com/react-in-depth/the-how-and-why-on-reacts-usage-of-linked-list-in-fiber-67f1014d0eb7)。

这些“调用树”帧会随它们的局部状态和宿主实例一起被摧毁，但是只会在[协调](#协调)规则认为这是必要的时候执行。如果你曾经读过 React 源码，你就会知道这些帧其实就是 [Fibers](https://en.wikipedia.org/wiki/Fiber_(computer_science)) 。

Fibers 是局部状态真正存在的地方。当状态被更新后，React 将其下面的 Fibers 标记为需要进行协调，之后便会调用这些组件。

## 上下文

在 React 中，我们将数据作为 props 传递给其他组件。有些时候，大多数组件需要相同的东西 — 例如，当前选中的可视主题。将它一层层地传递会变得十分麻烦。

在 React 中，我们通过 [Context](https://reactjs.org/docs/context.html) 解决这个问题。它就像组件的[动态范围](http://wiki.c2.com/?DynamicScoping) ，能让你从顶层传递数据，并让每个子组件在底部能够读取该值，当值变化时还能够进行重新渲染：

```jsx
const ThemeContext = React.createContext(
  'light' // 默认值作为后备
);

function DarkApp() {
  return (
    <ThemeContext.Provider value="dark">
      <MyComponents />
    </ThemeContext.Provider>
  );
}

function SomeDeeplyNestedChild() {
  // 取决于其子组件在哪里被渲染
  const theme = useContext(ThemeContext);
  // ...
}
```

当 `SomeDeeplyNestedChild` 渲染时， `useContext(ThemeContext)` 会寻找树中最近的 `<ThemeContext.Provider>` ，并且使用它的 `value` 。

(事实上，React 维护了一个上下文栈当其渲染时。)

如果没有 `ThemeContext.Provider` 存在，`useContext(ThemeContext)` 调用的结果就会被调用 `createContext()` 时传递的默认值所取代。在上面的例子中，这个值为 `'light'` 。


## 副作用

我们在之前提到过 React 组件在渲染过程中不应该有可观察到的副作用。但是有些时候副作用确实必要的。我们也许需要进行管理 focus 状态、用 canvas 画图、订阅数据源等操作。

在 React 中，这些都可以通过声明 effect 来完成：

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

如果可能，React 会推迟执行 effect 直到浏览器重新绘制屏幕。这是有好处的因为像订阅数据源这样的代码并不会影响[交互时间](https://calibreapp.com/blog/time-to-interactive/)和[首次绘制时间](https://developers.google.com/web/tools/lighthouse/audits/first-meaningful-paint) 。

（有一个[极少使用](https://reactjs.org/docs/hooks-reference.html#uselayouteffect)的 Hook 能够让你选择退出这种行为并进行一些同步的工作。请尽量避免使用它。）

effect 不只执行一次。当组件第一次展示给用户以及之后的每次更新时它都会被执行。在 effect 中能触及当前的 props 和 state，例如上文例子中的 `count` 。

effect 可能需要被清理，例如订阅数据源的例子。在订阅之后将其清理，effect 能够返回一个函数：

```jsx
  useEffect(() => {
    DataSource.addSubscription(handleChange);
    return () => DataSource.removeSubscription(handleChange);
  });
```

React 会在下次调用该 effect 之前执行这个返回的函数，当然是在组件被摧毁之前。

有些时候，在每次渲染中都重新调用 effect 是不符合实际需要的。 你可以告诉 React 如果相应的变量不会改变则跳过此次调用：

```jsx{3}
  useEffect(() => {
    document.title = `You clicked ${count} times`;
  }, [count]);
```

但是，这往往会成为过早地优化并会造成一些问题如果你不熟悉 JavaScript 中的闭包是如何工作的话。

例如，下面的这段代码是有 bug 的：

```jsx
  useEffect(() => {
    DataSource.addSubscription(handleChange);
    return () => DataSource.removeSubscription(handleChange);
  }, []);
```

它含有 bug 因为 `[]` 代表着“不再重新执行这个 effect 。”但是这个 effect 中的 `handleChange` 是被定义在外面的。`handleChange` 也许会引用任何的 props 或 state ：

```jsx
  function handleChange() {
    console.log(count);
  }
```

如果我们不再让这个 effect 重新调用，`handleChange` 始终会是第一次渲染时的版本，而其中的 `count` 也永远只会是 `0` 。

为了解决这个问题，请保证你声明了特定的依赖数组，它包含**所有**可以改变的东西，即使是函数也不例外：

```jsx{4}
  useEffect(() => {
    DataSource.addSubscription(handleChange);
    return () => DataSource.removeSubscription(handleChange);
  }, [handleChange]);
```

取决于你的代码，在每次渲染后 `handleChange` 都会不同因此你可能仍然会看到不必要的重订阅。 [`useCallback`](https://reactjs.org/docs/hooks-reference.html#usecallback) 能够帮你解决这个问题。或者，你可以直接让它重订阅。例如浏览器中的 `addEventListener` API 非常快，但为了在组件中避免使用它可能会带来更多的问题而不是其真正的价值。

*(你能在 [React 文档](https://reactjs.org/docs/hooks-effect.html) 中学到更多关于 `useEffect` 和其他 Hooks 的知识。)*  

## 自定义钩子

由于 `useState` 和 `useEffect` 是函数调用，因此我们可以将其组合成自己的 Hooks ：

```jsx{2,8}
function MyResponsiveComponent() {
  const width = useWindowWidth(); // 我们自己的 Hook
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

自定义 Hooks 让不同的组件共享可重用的状态逻辑。注意状态本身是不共享的。每次调用 Hook 都只声明了其自身的独立状态。

*(你能在 [React 文档](https://reactjs.org/docs/hooks-custom.html) 中学习更多关于构建自己的 Hooks 的内容。)* 

## 静态使用顺序

你可以把 `useState` 想象成一个可以定义“React 状态变量”的语法。它并不是真正的语法，当然，我们仍在用 JavaScript 编写应用。但是我们将 React 作为一个运行时环境来看待，因为 React 用 JavaScript 来描绘整个 UI 树，它的特性往往更接近于语言层面。

假设 `use` 是语法，将其使用在组件函数顶层也就说得通了：

```jsx{3}
// 😉 注意：并不是真的语法
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

当它被放在条件语句中或者组件外时又代表什么呢？

```jsx
// 😉 注意：并不是真的语法

// 它是谁的...局部状态？
const [count, setCount] = use State(0);

component Example() {
  if (condition) {
    // 要是 condition 是 false 时会发生什么呢？
    const [count, setCount] = use State(0);
  }

  function handleClick() {
    // 要是离开了组件函数会发生什么？
    // 这和一般的变量又有什么区别呢？
    const [count, setCount] = use State(0);
  }
```

React 状态和在树中与其相关的组件紧密联系在一起。如果 `use` 是真正的语法当它在组件函数的顶层调用时也能说的通：	


```jsx
// 😉 注意：并不是真的语法
component Example(props) {
  // 只在这里有效
  const [count, setCount] = use State(0);

  if (condition) {
    // 这会是一个语法错误
    const [count, setCount] = use State(0);
  }
```

这和 `import` 声明只在模块顶层有用是一样的道理。

**当然，`use` 并不是真正的语法。** （它不会带来很多好处，并且会带来很多摩擦。）

然而，React 的确期望所有的 Hooks 调用只发生在组件的顶部并且不在条件语句中。这些 Hooks 的[规则](https://reactjs.org/docs/hooks-rules.html)能够被 [linter plugin](https://www.npmjs.com/package/eslint-plugin-react-hooks) 所规范。有很多关于这种设计选择的激烈争论，但在实践中我并没有看到它让人困惑。我还写了关于为什么通常提出的替代方案[不起作用](https://overreacted.io/why-do-hooks-rely-on-call-order/)的文章。

Hooks 的内部实现其实是[链表](https://dev.to/aspittel/thank-u-next-an-introduction-to-linked-lists-4pph) 。当你调用 `useState` 的时候，我们将指针移到下一项。当我们退出组件的[“调用树”帧](#调用树)时，会缓存该结果的列表直到下次渲染开始。

[这篇文章](https://medium.com/@ryardley/react-hooks-not-magic-just-arrays-cd4f1857236e)简要介绍了 Hooks 内部是如何工作的。数组也许是比链表更好解释其原理的模型：


```jsx
// 伪代码
let hooks, i;
function useState() {
  i++;
  if (hooks[i]) {
    // 再次渲染时
    return hooks[i];
  }
  // 第一次渲染
  hooks.push(...);
}

// 准备渲染
i = -1;
hooks = fiber.hooks || [];
// 调用组件
YourComponent();
// 缓存 Hooks 的状态
fiber.hooks = hooks;
```

*(如果你对它感兴趣，真正的代码在[这里](https://github.com/facebook/react/blob/master/packages/react-reconciler/src/ReactFiberHooks.js) 。)* 

这大致就是每个 `useState()` 如何获得正确状态的方式。就像我们[之前](#协调)所知道的，“匹配”对 React 来说并不是什么新的知识 — 这与协调依赖于在渲染前后元素是否匹配是同样的道理。

## 未提及的知识

我们已经触及到 React 运行时环境中几乎所有重要的方面。如果你读完了本篇文章，你可能已经比 90% 的开发者更了解 React ！这一点也没有错！

当然有一些地方我并没有提及到 — 主要是因为我们对它们也不太清楚。React 目前对多道渲染并没有太好的支持，即当父组件的渲染需要子组件提供信息时。[错误处理 API](https://reactjs.org/docs/error-boundaries.html) 目前也还没有 Hooks 的版本。这两个问题可能会被一起解决。并发模式在目前看来并不稳定，也有很多关于 Suspense 该如何适应当前版本的有趣问题。也许我会在它们要完成的时候再来讨论，并且 Suspense 已经准备好比 [lazy loading](https://reactjs.org/blog/2018/10/23/react-v-16-6.html#reactlazy-code-splitting-with-suspense) 能够做的更多。

**我认为 React API 的成功之处在于，即使在没有考虑过上面这些大多数主题的情况下，你也能轻松使用它并且可以走的很远。** 在大多数情况下，像协调这样好的默认特性启发式地为我们做了正确的事情。在你忘记添加 `key` 这样的属性时，React 能够好心提醒你。

如果你是痴迷于 UI 库的书呆子，我希望这篇文章对你来说会很有趣并且是深入阐明了 React 是如何工作的。又或许你会觉得 React 太过于复杂为此你不会再去深入理解它。不管怎样，我都很乐意在 Twitter 上收到你的消息！谢谢你的阅读。
