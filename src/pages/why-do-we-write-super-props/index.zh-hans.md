---
title: 为什么我们要添加 super(props) ？
date: '2018-11-30'
spoiler: 在结尾有一个转折。
---


我听说 [Hooks](https://reactjs.org/docs/hooks-intro.html) 成了新的焦点。但是呢，我想通过这篇博客来介绍下class声明的组件{fun facts}。意下如何？

**下面内容无法提高你的React使用技巧。但是，当你深入探究事物是如何运行时，将会发现它们所带来的喜悦之情。**

首先来看看第一个例子。

---

我写`super(props)`的次数比我想象中多得多：

```jsx{3}
class Checkbox extends React.Component {
  constructor(props) {
    super(props);
    this.state = { isOn: true };
  }
  // ...
}
```

当然，[class fields proposal](https://github.com/tc39/proposal-class-fields)(JS提案)使我们跳过这个过程：

```jsx
class Checkbox extends React.Component {
  state = { isOn: true };
  // ...
}
```

这是在2015年，在React0.13版本时添加支持的类语法[planned](https://reactjs.org/blog/2015/01/27/react-v0.13.0-beta-1.html#es7-property-initializers)。在*class fields*这个更合理的替代方案出来之前，声明`constructor`和调用`super(props)`一直被做为一种临时的解决方案。

但在此之前，让我们回到只使用ES2015的例子：

```jsx{3}
class Checkbox extends React.Component {
  constructor(props) {
    super(props);
    this.state = { isOn: true };
  }
  // ...
}
```

**为什么要调用`super`？我们可以*不*调用它吗？如果我们必须调用它，那调用时不传`props`会怎么样呢？会有更多的参数吗？来一起找找答案。**

---

JavaScript中，`super`是父类constructor的引用。（我们例子中，它指向`React.Component`）

很重要的一点，你是无法在父类的constructor调用之前在constructor中使用`this`的，JavaScript不允许你这样做：

```jsx
class Checkbox extends React.Component {
  constructor(props) {
    // 🔴 Can’t use `this` yet
    super(props);
    // ✅ Now it’s okay though
    this.state = { isOn: true };
  }
  // ...
}
```

JavaScript 会强制父类constructor在你碰 this 前被执行是有原因的。想想类的层次结构：

```jsx
class Person {
  constructor(name) {
    this.name = name;
  }
}

class PolitePerson extends Person {
  constructor(name) {
    this.greetColleagues(); // 🔴 This is disallowed, read below why
    super(name);
  }
  greetColleagues() {
    alert('Good morning folks!');
  }
}
```

假设在`super`之前允许调用`this`。一个月之后，我们可能在`greetColleagues`的消息中加入了`name`属性：

```jsx
  greetColleagues() {
    alert('Good morning folks!');
    alert('My name is ' + this.name + ', nice to meet you!');
  }
```

然而我们忘记了声明`this.name`的`super`方法被调用之前，已经调用了`this.greetColleagues()`。以至于`this.name`变成了`undefined`的状态！如你所见，代码会因此变得难以揣测。

为了避免这种陷阱，**JavaScript 强制要求， 如果想在constructor里使用`this`，就*必须*先调用`super`**。让父类做好它的事先！这个限制也适用于定义别的React组件：

```jsx
  constructor(props) {
    super(props);
    // ✅ Okay to use `this` now
    this.state = { isOn: true };
  }
```

还有另外一个问题，为什么要传`props`？

---

你可能会认为，之所以`super`里要传`props`，是为了在`React.Component`的constructor里初始化`this.props`：

```jsx
// Inside React
class Component {
  constructor(props) {
    this.props = props;
    // ...
  }
}
```

实际上也差不多是这个原因，这是[确切原因](https://github.com/facebook/react/blob/1d25aa5787d4e19704c049c3cfa985d3b5190e0d/packages/react/src/ReactBaseClasses.js#L22)。

但在一些时候，即使在调用`super`时不传`props`参数，你仍然可以在`render`和其他方法中获取到`this.props`。(如果你不信，自己试下咯！)

这是如何实现的呢？原因是，在你的组件实例化后，会赋值`props`属性给实例对象。

```jsx
  // Inside React
  const instance = new YourComponent(props);
  instance.props = props;
```

所以即使忘记传`props`给`super`，React仍然会在之后设置它们，这是有原因的。

当React添加对类的支持时，它不仅仅增加了对ES6的支持，目标是尽可能支持广泛的类抽象化。当时我们还[不清楚](https://reactjs.org/blog/2015/01/27/react-v0.13.0-beta-1.html#other-languages)如ClojureScript, CoffeeScript, ES6, Fable, Scala.js, TypeScript或其他解决方案怎样算成功地定义组件，所以React也就不关心是否需要调用`super()`了——即便是ES6。

所以说是可以只用`super()`来替代`super(props)`吗？

**最好不要。因为这样仍然有问题。没错，React可以在你的constructor运行后给`this.props`赋值。但`this.props`在调用`super`和constructor结束前仍然是`undefined`：**

```jsx{14}
// Inside React
class Component {
  constructor(props) {
    this.props = props;
    // ...
  }
}

// Inside your code
class Button extends React.Component {
  constructor(props) {
    super(); // 😬 We forgot to pass props
    console.log(props);      // ✅ {}
    console.log(this.props); // 😬 undefined 
  }
  // ...
}
```

如果在constructor中有某些方法存在这种情况，它将会变得难以调试。**这也是为什么我一直建议添加`super(props)`，即使没有需要：**

```jsx
class Button extends React.Component {
  constructor(props) {
    super(props); // ✅ We passed props
    console.log(props);      // ✅ {}
    console.log(this.props); // ✅ {}
  }
  // ...
}
```

这确保了`this.props`在constructor完成之前就被赋值。

-----

最后还有一点是长期以来React使用者可能会感到好奇的。

你可能会注意到当你在类中使用 Context API(无论是过去的`contextTypes`或是后来在React 16.6中添加的`contextType`API，`context`都会做为constructor的第二个参数用来传递)。

所以我们为什么不用`super(props, context)`来替代呢？其实我们可以，但 context 的使用频率较低，所以遇到的坑没有那么多。

**当有了class fields proposal，大部分的坑都会消失**。在没有标明constructor的情况下，全部参数会被自动传入。这样就允许像`state = {}`的表达式，如果有需要`this.props`或者`this.context`将同样适用。

Hooks中，我们甚至不需要`super`或者`this`。但这要改天再说。