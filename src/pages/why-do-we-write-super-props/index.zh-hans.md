---
title: 为什么我们要写 super(props) ？
date: '2018-11-30'
spoiler: 结尾处有彩蛋。
---


据说 [Hooks](https://reactjs.org/docs/hooks-intro.html) 势头正盛，不过我还是想略带调侃地从 *class* 的有趣之处开始这篇博客。可还行？

**这些梗对于使用 React 输出产品并*不*重要，但如果你想深入的了解它们的运作原理，它们会非常的有用。**

---

首先，在这一生中，``super(props)`` 出现在我代码里的次数比我知道的还要多：

```jsx{3}
class Checkbox extends React.Component {
  constructor(props) {
    super(props);
    this.state = { isOn: true };
  }
  // ...
}
```

当然了，我们可以通过 [class fields proposal](https://github.com/tc39/proposal-class-fields) 来省略这个声明：

```jsx
class Checkbox extends React.Component {
  state = { isOn: true };
  // ...
}
```

早在 2015 年 React 0.13 已经[计划支持](https://reactjs.org/blog/2015/01/27/react-v0.13.0-beta-1.html#es7-property-initializers) 。在当时，声明 `constructor` 和调用 `super(props)` 一直被视作暂时的解决方案，直到有合适的类字段声明形式。

但在此之前，我们先回到 ES2015 风格的代码：

```jsx{3}
class Checkbox extends React.Component {
  constructor(props) {
    super(props);
    this.state = { isOn: true };
  }
  // ...
}
```

**为什么我们要调用 `super`，我们可以不这么做吗？那么在我们调用它时不传入 `props`，又会发生什么呢？会有其他的缺省参数吗？**接来下我们就解开这一系列谜题。

---

在 JavaScript 中，`super` 指的是父类（即超类）的构造函数。（在我们的例子中，它指向了 `React.Component` 的实现。）

值得注意的是，在调用父类的构造函数之前，你是不能在 constructor 中使用 `this` 关键字的。JavaScript 不允许这个行为。

```jsx
class Checkbox extends React.Component {
  constructor(props) {
    // 🔴  还不能使用 `this`
    super(props);
    // ✅  现在可以了
    this.state = { isOn: true };
  }
  // ...
}
```

JavaScript 有足够合理的动机来强制你在接触 `this` 之前执行父类构造函数。考虑考虑一些类层次结构的东西：

```jsx
class Person {
  constructor(name) {
    this.name = name;
  }
}

class PolitePerson extends Person {
  constructor(name) {
    this.greetColleagues(); // 🔴  这是禁止的，往后见原因
    super(name);
  }
  greetColleagues() {
    alert('Good morning folks!');
  }
}
```

试想一下，在调用 `super` 之前使用 `this` 不被禁止的情况下，一个月后，我们可能在 `greetColleagues` 打印的消息中使用了 person 的 name 属性：

```jsx
  greetColleagues() {
    alert('Good morning folks!');
    alert('My name is ' + this.name + ', nice to meet you!');
  }
```

但是我们并未想起 `this.greetColleagues` 在 `super()` 给 `this.name` 赋值前就已经执行。`this.name` 此时甚至尚未定义。可以看到，这样的代码难以往下推敲。

为了避免落入这个陷阱，**JavaScript 强制你在使用 `this` 之前先行调用 `super`。**让父类来完成这件事情！：

```jsx
  constructor(props) {
    super(props);
    // ✅ 能使用 `this` 了
    this.state = { isOn: true };
  }
```

这里留下了另一个问题：为什么要传入 `props` ？

---

你或许会想到，为了让 React.Component 构造函数能够初始化 `this.props`，将 `props` 传入 `super` 是必须的：


```jsx
// React 內部
class Component {
  constructor(props) {
    this.props = props;
    // ...
  }
}
```

这几乎就是真相了 — 确然，它是 [这样做](https://github.com/facebook/react/blob/1d25aa5787d4e19704c049c3cfa985d3b5190e0d/packages/react/src/ReactBaseClasses.js#L22) 的。

但有些扑朔迷离的是，即便你调用 `super()` 的时候没有传入 `props`，你依然能够在 `render` 函数或其他方法中访问到 `this.props`。（如果你质疑这个机制，尝试一下即可）

那么这是怎么做到的呢？事实证明，React 在调用构造函数后也立即将 `props` 赋值到了实例上：**

```jsx
  // React 内部
  const instance = new YourComponent(props);
  instance.props = props;
```

因此即便你忘记了将 `props` 传给 `super()`，React 也仍然会在之后将它定义到实例上。这么做是有原因的。

当 React 增加了对类的支持时，不仅仅是为了服务于 ES6。其目标是尽可能广泛地支持类抽象。当时我们 [不清楚](https://reactjs.org/blog/2015/01/27/react-v0.13.0-beta-1.html#other-languages)  ClojureScript，CoffeeScript，ES6，Fable，Scala.js，TypeScript 等解決方案是如何成功的实践组件定义的。因而 React 刻意地没有显式要求调用 `super()` —— 即便 ES6 自身就包含这个机制。

这意味着你能够用 `super()` 代替 `super(props)` 吗？

**最好不要，毕竟这样写在逻辑上并不明确**确然，React 会在构造函数执行完毕*之后*给 `this.props` 赋值。但如此为之会使得 `this.props` 在 `super` 调用*一直到构造函数结束期间*值为 undefined。


```jsx{14}
// React 內部
class Component {
  constructor(props) {
    this.props = props;
    // ...
  }
}

// 你的程式碼內部
class Button extends React.Component {
  constructor(props) {
    super(); // 😬 我们忘了传入 props
    console.log(props);      // ✅ {}
    console.log(this.props); // 😬 未定义
  }
  // ...
}
```

如果在构造函数中调用了其他的内部方法，那么一旦出错这会使得调试过程阻力更大。**这就是我建议开发者一定执行 `super(props)` 的原因，即使理论上这并非必要：**

```jsx
class Button extends React.Component {
  constructor(props) {
    super(props); // ✅ 传入 props
    console.log(props);      // ✅ {}
    console.log(this.props); // ✅ {}
  }
  // ...
}
```

确保了 `this.props` 在构造函数执行完毕之前已被赋值。

-----

最后，还有一点是 React 爱好者长期以来的好奇之处。

你会发现当你在类中使用 Context API （无论是旧版的 `contextTypes` 或是在 React 16.6 更新的新版 `contextTypes`）的时候，`context` 是作为第二个参数传入构造函数的。

那么为什么我们不能转而写成 `super(props, context)` 呢？我们当然可以，但 context 的使用频率较低，因而并没有掘这个坑。

**class fields proposal 出台后，这些坑大部分都会自然地消失**在没有显示的定义构造函数的情况下，以上的属性都会被自动地初始化。这使得像 `state = {}` 这类表达式能够在需要的情况下引用 `this.props` 和 `this.context` 的内容。

然而，有了 Hooks 以后，我们几乎就不需要 `super` 和 `this` 了。但那就是另一个下午的茶点了。
