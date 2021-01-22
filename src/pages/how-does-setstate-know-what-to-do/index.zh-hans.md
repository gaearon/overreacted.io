---
title: setState如何知道该做什么？
date: '2018-12-09'
spoiler: 依赖注入是非常不错的技术，如果你不必考虑的话。
---

当你在组件中调用`setState`的时候，你认为发生了些什么？

```jsx{11}
import React from 'react';
import ReactDOM from 'react-dom';

class Button extends React.Component {
  constructor(props) {
    super(props);
    this.state = { clicked: false };
    this.handleClick = this.handleClick.bind(this);
  }
  handleClick() {
    this.setState({ clicked: true });
  }
  render() {
    if (this.state.clicked) {
      return <h1>Thanks</h1>;
    }
    return (
      <button onClick={this.handleClick}>
        Click me!
      </button>
    );
  }
}

ReactDOM.render(<Button />, document.getElementById('container'));
```

当然是：React根据下一个状态`{clicked：true}`重新渲染组件，同时更新DOM以匹配返回的`<h1>Thanks</ h1>`元素啊。

看起来很直白。但是等等，是 *React*做了这些吗？还是*React DOM*？

更新DOM听起来像是React DOM的职责所在。但是我们调用的是`this.setState()`，而没有调用任何来自React DOM的东西。 而且我们组件的父类`React.Component`也是在React本身定义的。

所以存在于`React.Component`内部的`setState()`是如何更新DOM的呢？

**免责声明: 就像本博客里[绝大多数](/why-do-react-elements-have-typeof-property/) [其他的](/how-does-react-tell-a-class-from-a-function/) [帖子](/why-do-we-write-super-props/)一样， 其实你不*需要*知道其中的任何知识，就可以有效地使用React。本文面向的是那些想要了解React背后原理的人。而这完全是可选的！**

---

我们或许会认为：`React.Component`类包含了DOM更新的逻辑。

但是如果是这样的话，`this.setState()`又如何能在其他环境下使用呢？举个例子，React Native app中的组件也是继承自`React.Component`。他们依然可以像我们在上面做的那样调用`this.setState()`，而且React Native渲染的是安卓和iOS原生的界面而不是DOM。

你或许对React Test Renderer 或是 Shallow Renderer很熟悉。这些测试策略能让你正常渲染组件，也可以在组件内部调用`this.setState()`。但是这两个渲染器并不与DOM相关。

如果你曾使用过一些渲染器像[React ART](https://github.com/facebook/react/tree/master/packages/react-art)，你也许也知道在一个页面中我们是可以使用多个渲染器的。（举个例子，ART 组件在React DOM树的内部起作用。）这使得全局标志或变量无法维持。

因此，**`React.Component`以某种未知的方式将处理状态（state）更新的任务委托给了特定平台的代码。**在我们理解这些是如何发生的之前，让我们深挖一下包（packages）是如何分离的以及为什么这样分离。

---

有一个很常见的误解就是React“引擎”是存在于`react`包里面的。 然而事实并非如此。

实际上从[React 0.14](https://reactjs.org/blog/2015/07/03/react-v0.14-beta-1.html#two-packages)我们将代码拆分成多个包以来，`react`包故意只暴露一些定义组件的API。绝大多数React的*实现*都存在于“渲染器（renderers）”中。

`react-dom`、`react-dom/server`、 `react-native`、 `react-test-renderer`、 `react-art`都是常见的渲染器（当然你也可以[创建属于你的渲染器](https://github.com/facebook/react/blob/master/packages/react-reconciler/README.md#practical-examples)）。

这就是为什么不管你的目标平台是什么，`react`包都是可用的。从`react`包中导出的一切，比如`React.Component`、`React.createElement`、 `React.Children` 和（最终的）[Hooks](https://reactjs.org/docs/hooks-intro.html)，都是独立于目标平台的。无论你是运行React DOM，还是 React DOM Server,或是 React Native，你的组件都可以使用同样的方式导入和使用。

相比之下，渲染器包暴露的都是特定平台的API，比如说：`ReactDOM.render()`，可以让你将React层次结构（hierarchy）挂载进一个DOM节点。每一种渲染器都提供了类似的API。理想状况下，绝大多数*组件*都不应该从渲染器中导入任何东西。只有这样，组件才会更加灵活。

**和大多数人现在想的一样，React “引擎”就是存在于各个渲染器的内部。**很多渲染器包含一份同样代码的复制 —— 我们称为[“协调器”(“reconciler”)](https://github.com/facebook/react/tree/master/packages/react-reconciler)。[构建步骤(build step)](https://reactjs.org/blog/2017/12/15/improving-the-repository-infrastructure.html#migrating-to-google-closure-compiler)将协调器代码和渲染器代码平滑地整合成一个高度优化的捆绑包（bundle）以获得更高的性能。（代码复制通常来说不利于控制捆绑包的大小，但是绝大多数React用户同一时间只会选用一个渲染器，比如说`react-dom`。）

这里要注意的是： `react`包仅仅是让你*使用* React 的特性，但是它完全不知道这些特性是*如何*实现的。而渲染器包(`react-dom`、`react-native`等)提供了React特性的实现以及平台特定的逻辑。这其中的有些代码是共享的(“协调器”)，但是这就涉及到各个渲染器的实现细节了。

---

现在我们知道为什么当我们想使用新特性时，`react` 和 `react-dom`*都*需要被更新。举个例子，当React 16.3添加了Context API，`React.createContext()`API会被React包暴露出来。

但是`React.createContext()` 其实并没有*实现* context。因为在React DOM 和 React DOM Server 中同样一个 API 应当有不同的实现。所以`createContext()`只返回了一些普通对象：

```jsx
// 简化版代码
function createContext(defaultValue) {
  let context = {
    _currentValue: defaultValue,
    Provider: null,
    Consumer: null
  };
  context.Provider = {
    $$typeof: Symbol.for('react.provider'),
    _context: context
  };
  context.Consumer = {
    $$typeof: Symbol.for('react.context'),
    _context: context,
  };
  return context;
}
```
当你在代码中使用 `<MyContext.Provider>` 或 `<MyContext.Consumer>`的时候， 是*渲染器*决定如何处理这些接口。React DOM也许用某种方式追踪context的值，但是React DOM Server用的可能是另一种不同的方式。

**所以，如果你将`react`升级到了16.3+，但是不更新`react-dom`，那么你就使用了一个尚不知道`Provider` 和 `Consumer`类型的渲染器。**这就是为什么一个老版本的`react-dom`会[报错说这些类型是无效的](https://stackoverflow.com/a/49677020/458193)。

同样的警告也会出现在React Native中。然而不同于React DOM的是， 一个React新版本的发布并不立即“强制”发布新的 React Native 版本。他们具有独立的发布日程。 每隔几周，更新后的渲染器代码就会[单独同步到](https://github.com/facebook/react-native/commits/master/Libraries/Renderer/oss)React Native仓库。这就是相比 React DOM，React Native 特性可用时间不同的原因。

---

好吧，所以现在我们知道了`react`包并不包含任何有趣的东西，除此之外，具体的实现也是存在于`react-dom`，`react-native`之类的渲染器中。但是这并没有回答我们的问题。`React.Component`中的`setState()`如何与正确的渲染器“对话”？

**答案是：每个渲染器都在已创建的类上设置了一个特殊的字段。**这个字段叫做`updater`。这并不是*你*要设置的的东西——而是，React DOM、React DOM Server 或 React Native在创建完你的类的实例之后会立即设置的东西：

```jsx{4,9,14}
// React DOM 内部
const inst = new YourComponent();
inst.props = props;
inst.updater = ReactDOMUpdater;

// React DOM Server 内部
const inst = new YourComponent();
inst.props = props;
inst.updater = ReactDOMServerUpdater;

// React Native 内部
const inst = new YourComponent();
inst.props = props;
inst.updater = ReactNativeUpdater;
```
查看[ `React.Component`中`setState`的实现](https://github.com/facebook/react/blob/ce43a8cd07c355647922480977b46713bd51883e/packages/react/src/ReactBaseClasses.js#L58-L67)，
`setState`所做的一切就是委托渲染器创建这个组件的实例：

```jsx
// 适当简化的代码
setState(partialState, callback) {
  // 使用`updater`字段回应渲染器！
  this.updater.enqueueSetState(this, partialState, callback);
}
```

React DOM Server [也许想](https://github.com/facebook/react/blob/ce43a8cd07c355647922480977b46713bd51883e/packages/react-dom/src/server/ReactPartialRenderer.js#L442-L448) 忽略一个状态更新并且警告你，而React DOM 与 React Native却想要让他们协调器（reconciler）的副本[处理它](https://github.com/facebook/react/blob/ce43a8cd07c355647922480977b46713bd51883e/packages/react-reconciler/src/ReactFiberClassComponent.js#L190-L207)。

这就是this.setState()`尽管定义在React包中，却能够更新DOM的原因。它读取由React DOM设置的`this.updater`，让React DOM安排并处理更新。

---

现在关于类的部分我们已经知道了，那关于Hooks的呢？

当人们第一次看见[Hooks proposal API](https://reactjs.org/docs/hooks-intro.html)，他们可能经常会想： `useState是`怎么 “知道要做什么”的？然后假设它比那些包含`this.setState()`的`React.Component`类更“神奇”。

但是正如我们今天所看到的，基类中`setState()`的执行一直以来都是一种错觉。它除了将调用转发给当前的渲染器外，什么也没做。`useState` Hook[也是做了同样的事情](https://github.com/facebook/react/blob/ce43a8cd07c355647922480977b46713bd51883e/packages/react/src/ReactHooks.js#L55-L56)。

**Hooks使用了一个“dispatcher”对象，代替了`updater`字段。**当你调用`React.useState()`、`React.useEffect()`、 或者其他内置的Hook时，这些调用被转发给了当前的dispatcher。

```jsx
// React内部(适当简化)
const React = {
  // 真实属性隐藏的比较深，看你能不能找到它！
  __currentDispatcher: null,

  useState(initialState) {
    return React.__currentDispatcher.useState(initialState);
  },

  useEffect(initialState) {
    return React.__currentDispatcher.useEffect(initialState);
  },
  // ...
};
```

各个渲染器会在渲染你的组件之前设置dispatcher：

```jsx{3,8-9}
// React DOM 内部
const prevDispatcher = React.__currentDispatcher;
React.__currentDispatcher = ReactDOMDispatcher;
let result;
try {
  result = YourComponent(props);
} finally {
  // 恢复原状
  React.__currentDispatcher = prevDispatcher;
}
```

举个例子， React DOM Server的实现是在[这里](https://github.com/facebook/react/blob/ce43a8cd07c355647922480977b46713bd51883e/packages/react-dom/src/server/ReactPartialRendererHooks.js#L340-L354)，还有就是React DOM 和 React Native共享的协调器的实现在[这里](https://github.com/facebook/react/blob/ce43a8cd07c355647922480977b46713bd51883e/packages/react-reconciler/src/ReactFiberHooks.js)。

这就是为什么像`react-dom`这样的渲染器需要访问那个你调用Hooks的`react`包。否则你的组件将不会“看见”dispatcher！如果在一个组件树中存在[React的多个副本](https://github.com/facebook/react/issues/13991)，也许并不会这样。但是，这总是导致了一些模糊的错误，因此Hooks会强迫你在出现问题之前解决包的重复问题。

在高级工具用例中，你可以在技术上覆盖dispatcher，尽管我们不鼓励这种操作。（对于`__currentDispatcher`这个名字我撒谎了，但是你可以在React仓库中找到真实的名字。）比如说， React DevTools将会使用[一个专门定制的dispatcher](https://github.com/facebook/react/blob/ce43a8cd07c355647922480977b46713bd51883e/packages/react-debug-tools/src/ReactDebugHooks.js#L203-L214)通过捕获JavaScript堆栈跟踪来观察Hooks树。*请勿模仿。*

这也意味着Hooks本质上并没有与React绑定在一起。如果未来有更多的库想要重用同样的原生的Hooks, 理论上来说dispatcher可以移动到一个分离的包中，然后暴露成一个一等（first-class）的API，然后给它起一个不那么“吓人”的名字。但是在实践中，我们会尽量避免过早抽象，直到需要它为止。

`updater`字段和`__currentDispatcher`对象都是称为*依赖注入*的通用编程原则的形式。在这两种情况下，渲染器将诸如`setState`之类的功能的实现“注入”到通用的React包中，以使组件更具声明性。

 使用React时，你无需考虑这其中的原理。我们希望React用户花更多时间考虑他们的应用程序代码，而不是像依赖注入这样的抽象概念。但是如果你想知道`this.setState()`或`useState()`是如何知道该做什么的，我希望这篇文章会有所帮助。

---

