---
title: 为什么我们要写 super(props)?
date: '2018-11-30'
spoiler: 在结尾有一个反转.
---


我听说 [Hooks](https://reactjs.org/docs/hooks-intro.html) 是新的热点。但是，我想通过描述关于 *class* 组件的有趣小知识来开启这个博客。怎么样!

**这些知识点对于有效地使用React并*不*重要。 但是如果你喜欢深入研究事物运行的原理，那你会发现当中有趣的东西。**

首先是这一个。

---

我生命中写过 `super(props)` 的次数比我想知道的还多：

```jsx{3}
class Checkbox extends React.Component {
  constructor(props) {
    super(props);
    this.state = { isOn: true };
  }
  // ...
}
```

当然，[类域提案](https://github.com/tc39/proposal-class-fields) (class field proposal) 能让我们跳过这个声明:

```jsx
class Checkbox extends React.Component {
  state = { isOn: true };
  // ...
}
```

类似这样的语法是在 2015 年 React 0.13新增对一般类的支持的时候就[计划](https://reactjs.org/blog/2015/01/27/react-v0.13.0-beta-1.html#es7-property-initializers)了的。直到类域提供更加合适的替代方案之前，定义 `constructor` 以及调用 `super(props)` 一直是作为一个临时的解决方案。

但是让我们只用 ES2015 的特性回到这个例子：

```jsx{3}
class Checkbox extends React.Component {
  constructor(props) {
    super(props);
    this.state = { isOn: true };
  }
  // ...
}
```

**我们为什么要调用 `super`？ 我们能*不*调用它么？ 如果我们必须调用它，那我们不传入`props` 会发生什么？ 还有其它的参数么?** 让我们一起看看。

---

在 JavaScript中， `super` 会参照父类的构造器。（在我们的例子里，它指向 `React.Component` 的实现）。

重要的是，直到你调用了父类的构造器*之后*，你才能在构造器里使用`this`。JavaScript不会让你这么做：

```jsx
class Checkbox extends React.Component {
  constructor(props) {
    // 🔴 还不能用 `this`
    super(props);
    // ✅ 现在可以用了
    this.state = { isOn: true };
  }
  // ...
}
```

JavaScript 强制父类构建器在你触碰 `this`之前运行是有原因的。考虑一下类的层级：

```jsx
class Person {
  constructor(name) {
    this.name = name;
  }
}

class PolitePerson extends Person {
  constructor(name) {
    this.greetColleagues(); // 🔴 这是不被允许的，原因如下
    super(name);
  }
  greetColleagues() {
    alert('Good morning folks!');
  }
}
```

想象一下，如果在 `super` 运行之前使用 `this` *是* 被允许的。一个月之后，我们可能想修改 `greetColleagces` 来把某人的名字放在消息里：

```jsx
  greetColleagues() {
    alert('Good morning folks!');
    alert('My name is ' + this.name + ', nice to meet you!');
  }
```

但是我们忘记了 `this.greetColleagues()` 是在 `super()`能够设置 `this.name` 之前就被调用了。所以`this.name` 甚至都没有被定义！如你所见，这样的代码是很难理解的。

为了避开这样的陷进，**如果你想在构造器里用 `this`, JavaScript 强制要求你 *必须* 先调用 `super`。** 让父类处理好它的事情！这个限制同样适用于被定义为类的 React 组件：

```jsx
  constructor(props) {
    super(props);
    // ✅ 现在可以使用 `this`了
    this.state = { isOn: true };
  }
```

这就给我们留下了另一个问题: 为什么要传入 `props`?

---

你可能会想，将 `props` 传入到 `super` 中是必须的，这样底层的 `React.Component` 构造器才能初始化 `this.props`:

```jsx
// React 内部
class Component {
  constructor(props) {
    this.props = props;
    // ...
  }
}
```

这与事实真相相去不远 — 的确, 它就是 [这么做的](https://github.com/facebook/react/blob/1d25aa5787d4e19704c049c3cfa985d3b5190e0d/packages/react/src/ReactBaseClasses.js#L22).

但是不知为何，即使你在调用 `super()` 的时候没有传入 `props` 参数，你仍然可以在 `render` 和其它方法里获取 `this.props`。（如果你不相信我，自己试一试！）

那*这*是如何工作的？事实上，**React 在调用*你的*构造器之后，也会立刻将`props` 赋值给实例:**

```jsx
  // React 内部
  const instance = new YourComponent(props);
  instance.props = props;
```

所以即使你忘了将 `props` 传给 `super()`，React之后依然会去配置它。而这是有原因的。

当 React 增加对类的支持的时候，它并不仅仅只是对ES6的类加了支持。它的目标是尽可能广地支持类的抽象。我们当时还 [不清楚](https://reactjs.org/blog/2015/01/27/react-v0.13.0-beta-1.html#other-languages) ClojureScript，CoffeeScript，ES6，Fable，Scala.js，TypeScript，或者其它解决方案如何相对成功地定义组件。 所以 React 当时对于是否设计成必须调用 `super()` 保持中立观点 —— 即使ES6的类是必须的。

所以是否意味着你可以只写 `super()` 而不是 `super(props)`呢？

**最好不要，因为这样仍然令人费解。** 当然, React 在你的构造器运行 *之后* 会对 `this.props` 赋值。 但是在 `super` 被调用以及构造器结尾 *之间* 仍然是未定义（undefined）的：

```jsx{14}
// React 内部
class Component {
  constructor(props) {
    this.props = props;
    // ...
  }
}

// 你的代码内部
class Button extends React.Component {
  constructor(props) {
    super(); // 😬 我们忘了传 props
    console.log(props);      // ✅ {}
    console.log(this.props); // 😬 undefined 
  }
  // ...
}
```

如果这发生在某些*从*构造器里调用的方法里，排查起来将更加艰难。 **这就是为什么我推荐总是传入 `super(props)`, 即使这并不是严格要求的。**

```jsx
class Button extends React.Component {
  constructor(props) {
    super(props); // ✅ 我们传入了props
    console.log(props);      // ✅ {}
    console.log(this.props); // ✅ {}
  }
  // ...
}
```

这保证了 `this.props` 在构造器存在之前就被设好了。

-----

最后还有一点是长时间的 React 使用者可能会好奇的。

你可能会注意到当你在Class里使用 Context API 的时候（不管是老的 `contextTypes` 或者是在 React 16.6中加入的新的 `contextType`，`context`都是作为第二个参数传入构造器里的。

那么为什么我们不取而代之写作 `super(props, context)`呢？我们可以这么做，只是 context 更少地被使用，所以这个坑不会出现得那么频繁。

**当有了类域的提案后，整个这些坑大部分都会消失。** 在没有明确声明的构造器里，所有参数都会自动被传入。这就允许了像 `state = {}` 这样的表达式，在有需要的情况下，还是能包含对 `this.props` 或者 `this.context` 的引用。

有了Hooks之后，我们甚至都不需要 `super` 或者 `this`。但这就是改天的一个话题了。
