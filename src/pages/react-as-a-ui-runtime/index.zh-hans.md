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

但 React 也能以”不变“模式工作。这种模式适用于那些并不提供像 `appendChild` 的 API 而是克隆双亲树并始终替换掉顶级子树的宿主环境。在宿主树级别上的不可变性使得多线程变得更加容易。[React Fabric](https://facebook.github.io/react-native/blog/2018/06/14/state-of-react-native-2018) 就利用了这一模式。

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
let result = type(props); // Whatever Form returns
```

组件函数名称按照规定需大写。当 JSX 转换时看见 `<Form>` 而不是 `<form>` ，它让对象 `type` 本身成为标识符而不是字符串：

```jsx
console.log(<form />.type); // 'form' 字符串
console.log(<Form />.type); // Form 函数
```

我们并没有全局的注册机制 — 字面上当我们输入 `<Form>` 时代表着 `Form` 。如果 `Form` 在局部作用域中并不存在，你会发现一个 JavaScript 错误，就像平常你使用错误的变量名称一样。

**因此，当元素类型是一个函数的时候 React 会做什么呢？它会调用你的组件，然后询问组件想要渲染什么元素。** 

这个步骤会递归式的执行下去，更详细的描述在[这里](ttps://reactjs.org/blog/2015/12/18/react-components-elements-and-instances.html) 。总的来说，它会像这样执行：

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

你也许会好奇：为什么我们不直接调用组件？为什么要编写 `<Form />` 而不是 `Form()` ?

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

* **组件不仅仅只是函数。** React 能够用在树中与组件本身紧密相连的局部状态等特性来增强组件功能。优秀的运行时提供了与问题相匹配的基本抽象。就像我们已经提到过的，React 专门针对于那些渲染 UI 树并且能够响应交互的应用。如果你直接调用了组件，你就只能自己来构建这些特性了。
* **组件类型参与协调。** 通过 React 来调用你的组件，能让它了解更多关于元素树的结构。例如，当你从渲染 `<Feed>` 页面转到 `Profile` 页面，React 不会尝试重用其中的宿主实例 — 就像你用 `<p>` 替换掉 `<button>` 一样。所有的状态都会丢失 — 对于渲染完全不同的视图时，通常来说这是一件好事。你不会想要在 `<PasswordForm>` 和  `<MessengerChat>` 之间保留输入框的状态尽管 `<input>` 的位置意外地“排列”在它们之间。 
* **React 能够推迟协调。** 如果让 React 控制调用你的组件，它能做很多有趣的事情。例如，它可以让浏览器在组件调用之间做一些工作，这样重渲染大体量的组件树时就[不会阻塞主线程](https://reactjs.org/blog/2018/03/01/sneak-peek-beyond-react-16.html)。想要手动编排这个过程而不依赖 React 的话将会十分困难。
* **更好的可调试性。** 如果组件是库中所重视的一等公民，我们就可以构建[丰富的开发者工具](https://github.com/facebook/react-devtools)，用于开发中的自省。

让 React 调用你的组件函数还有最后一个好处就是惰性求值。让我们看看它是什么意思。

## 惰性求值

当我们在 JavaScript 中调用函数时，参数往往在函数调用之前被执行。

```jsx
// (2) 它会作为第二个计算
eat(
  // (1) 他会首先计算
  prepareMeal()
);
```

这通常是 JavaScript 开发者所期望的因为 JavaScript 函数可能有隐含的副作用。如果我们调用了一个函数，但直到它的结果不知怎地被“使用”后该函数仍没有执行，这会让我们感到十分诧异。

但是，React 组件是[相对](#purity)纯净的。如果我们知道它的结果不会在屏幕上出现，则完全没有必要执行它。

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

如果我们像函数一样调用 `Commonts()` ，不管 `Page` 是否想渲染它们都会被立即执行：

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

我们先前提到过关于[协调](#reconciliation)和在树中元素概念上的“位置”是如何让 React 知晓是该重用宿主实例还是该重建它。宿主实例能够拥有所有相关的局部状态：focus、selection、input 等等。我们想要在渲染更新概念上相同的 UI 时保留这些状态。我们也想可预测性地摧毁它们，当我们在概念上渲染的是完全不同的东西时（例如从 `<SignupForm>` 转换到 `<MessengerChat>`）。

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

*(你能在[React 文档](https://reactjs.org/docs/hooks-intro.html)中学习到更多关于 `useState` 和 其他 Hooks 的知识。)* 

## 一致性

即使我们想将协调过程本身分割成[非阻塞](https://www.youtube.com/watch?v=mDdgfyRB5kg)的工作块，我们仍然需要在同步的循环中对真实的宿主实例进行操作。这样我们才能保证用户不会看见半更新状态的 UI ，浏览器也不会对用户不应看到的中间状态进行不必要的布局和样式的重新计算。

这也是为什么 React 将所有的工作分成了”渲染阶段“和”提交阶段“的原因。*渲染阶段* 是当 React 调用你的组件然后进行协调的时段。在此阶段进行干涉是安全的且在[未来](https://reactjs.org/blog/2018/03/01/sneak-peek-beyond-react-16.html)这个阶段将会变成异步的。*提交阶段* 就是 React 操作宿主树的时候。而这个阶段永远是同步的。


## 缓存

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

## 原始模型

Ironically, React doesn’t use a “reactivity” system for fine-grained updates. In other words, any update at the top triggers reconciliation instead of updating just the components affected by changes.

This is an intentional design decision. [Time to interactive](https://calibreapp.com/blog/time-to-interactive/) is a crucial metric in consumer web applications, and traversing models to set up fine-grained listeners spends that precious time. Additionally, in many apps interactions tend to result either in small (button hover) or large (page transition) updates, in which case fine-grained subscriptions are a waste of memory resources.

One of the core design principles of React is that it works with raw data. If you have a bunch of JavaScript objects received from the network, you can pump them directly into your components with no preprocessing. There are no gotchas about which properties you can access, or unexpected performance cliffs when a structure slightly changes. React rendering is O(*view size*) rather than O(*model size*), and you can significantly cut the *view size* with [windowing](https://react-window.now.sh/#/examples/list/fixed-size).

There are some kinds of applications where fine-grained subscriptions are beneficial — such as stock tickers. This is a rare example of “everything constantly updating at the same time”. While imperative escape hatches can help optimize such code, React might not be the best fit for this use case. Still, you can implement your own fine-grained subscription system on top of React.

**Note that there are common performance issues that even fine-grained subscriptions and “reactivity” systems can’t solve.** For example, rendering a *new* deep tree (which happens on every page transition) without blocking the browser. Change tracking doesn’t make it faster — it makes it slower because we have to do more work to set up subscriptions. Another problem is that we have to wait for data before we can start rendering the view. In React, we aim to solve both of these problems with [Concurrent Rendering](https://reactjs.org/blog/2018/03/01/sneak-peek-beyond-react-16.html).


## 批量更新

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

## 调用树

A programming language runtime usually has a [call stack](https://medium.freecodecamp.org/understanding-the-javascript-call-stack-861e41ae61d4). When a function `a()` calls `b()` which itself calls `c()`, somewhere in the JavaScript engine there’s a data structure like `[a, b, c]` that “keeps track” of where you are and what code to execute next. Once you exit out of `c`, its call stack frame is gone — poof! It’s not needed anymore. We jump back into `b`. By the time we exit `a`, the call stack is empty.

Of course, React itself runs in JavaScript and obeys JavaScript rules. But we can imagine that internally React has some kind of its own call stack to remember which component we are currently rendering, e.g. `[App, Page, Layout, Article /* we're here */]`.

React is different from a general purpose language runtime because it’s aimed at rendering UI trees. These trees need to “stay alive” for us to interact with them. The DOM doesn’t disappear after our first `ReactDOM.render()` call.

This may be stretching the metaphor but I like to think of React components as being in a “call tree” rather than just a “call stack”. When we go “out” of the `Article` component, its React “call tree” frame doesn’t get destroyed. We need to keep the local state and references to the host instances [somewhere](https://medium.com/react-in-depth/the-how-and-why-on-reacts-usage-of-linked-list-in-fiber-67f1014d0eb7).

These “call tree” frames *are* destroyed along with their local state and host instances, but only when the [reconciliation](#reconciliation) rules say it’s necessary. If you ever read React source, you might have seen these frames being referred to as [Fibers](https://en.wikipedia.org/wiki/Fiber_(computer_science)).

Fibers are where the local state actually lives. When state is updated, React marks the Fibers below as needing reconciliation, and calls those components.

## 上下文

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


## 副作用

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

## 自定义钩子

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
