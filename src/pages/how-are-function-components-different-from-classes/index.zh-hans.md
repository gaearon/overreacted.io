---
title: 函数组件与类组件有何不同?
date: '2019-03-03'
spoiler: 他们是完全不一样的神奇宝贝.
---

React函数组件和React类组件有什么不同呢?

曾经的标准答案是，类组件提供了更多的特性（比如state）。伴随着[Hooks](https://reactjs.org/docs/hooks-intro.html)的面世，这个答案也变得过时了。

你也许听说过其中一个的性能要好一点。哪一个呢？许多这类基准测试本身存在[缺陷](https://medium.com/@dan_abramov/this-benchmark-is-indeed-flawed-c3d6b5b6f97f?source=your_stories_page---------------------------) ，所以我会谨慎的从中[得出结论](https://github.com/ryardley/hooks-perf-issues/pull/2)。性能的好坏主要取决于代码是怎么写的而不是你用了函数组件还是类组件。据我们观察，这两种组件之间的性能差异几乎可以忽略不计，尽管两者的性能优化方式有一些[区别](https://reactjs.org/docs/hooks-faq.html#are-hooks-slow-because-of-creating-functions-in-render)。

但无论如何我们都[不推荐](https://reactjs.org/docs/hooks-faq.html#should-i-use-hooks-classes-or-a-mix-of-both) 你去重写现有的组件，除非你有什么别的理由且不介意成为吃螃蟹的人。Hooks还很新（就像2014年时的react一样），因此一些“最佳实践”还未成熟到能被纳入教程。

所以说了这么多，在React函数组件和类组件之间到底有没有根本的区别呢？当然有——在心智模型上。**在本文中，我会着眼于两者之间最大的差异。**这其实在2015年函数组件的[介绍](https://reactjs.org/blog/2015/09/10/react-v0.14-rc1.html#stateless-function-components)中就提出了，只是时常被忽视。

>**函数组件会捕获住已渲染的值**

让我们来解读一下这句话的意思。

---

**注意: 本文并不作为函数组件或类组件的价值评判。我只是阐述了React这两种编程模型之间的不同。关于更广泛的使用函数组件的问题，可参见[Hooks FAQ](https://reactjs.org/docs/hooks-faq.html#adoption-strategy)**

---

思考下面这个组件:

```jsx
function ProfilePage(props) {
  const showMessage = () => {
    alert('Followed ' + props.user);
  };

  const handleClick = () => {
    setTimeout(showMessage, 3000);
  };

  return (
    <button onClick={handleClick}>Follow</button>
  );
}
```

组件渲染一个按钮，点击之后用`setTimeout`来模拟一个网络请求并在请求结束后弹出一个 alert 确认框。举个例子，如果 `props.user` 是 `'Dan'`，在三秒后会显示`'Followed Dan'`的 alert 框，很简单吧。

*（注意，在上面的例子中使用箭头函数或函数声明都可以，`function handleClick()`也是一样的。）*

那么如果我们把它写成一个类呢？简单的转换之后会变成下面这样：

```jsx
class ProfilePage extends React.Component {
  showMessage = () => {
    alert('Followed ' + this.props.user);
  };

  handleClick = () => {
    setTimeout(this.showMessage, 3000);
  };

  render() {
    return <button onClick={this.handleClick}>Follow</button>;
  }
}
```

我们会很容易认为这两段代码是等价的。人们经常在这两种模式之间自由重构，却没注意过两者的含义是否相同：

![Spot the difference between two versions](./wtf.gif)

**然而，这两段代码实际上有微妙的差别**。好好看看它们，看出来差异了吗？就我个人而言，也是花了一些时间才发现其中的差异。

**前方剧透高能，如果你想自己搞清楚的话这里有一个[live demo](https://codesandbox.io/s/pjqnl16lm7)。**本文接下来会解释这个差异及其重要性。

---

在继续下去之前，我需要先强调这个差异跟 React Hooks 没有任何关系，前面的例子甚至都没有用到 Hooks!

这是 React 函数组件和类组件之间的差异，如果你想在 React 应用中更多的使用函数组件，你会想理解它。

---

**我们会以一个 React 应用中常见的 bug 为例，来说明这个差异**

打开 **[沙箱实例](https://codesandbox.io/s/pjqnl16lm7)**，里面有一个用户选择器和上面提到的两种 `ProfilePage` 实现——渲染出两个‘点击关注’按钮。

对这两个按钮分别执行下面一系列操作：

1. **点击** 关注按钮.
2. **更改** 当前选中用户（在三秒之内完成更改)。
3. **观察** alert 的文本.

你会发现一个奇怪的差异。

* 在**函数组件** `ProfilePage` 中，在选中 Dan 时点击关注，然后切换到 Sophie，最终仍然提示 `'Followed Dan'`。

* 在**类组件** `ProfilePage` 中，会提示 `'Followed Sophie'`:

![Demonstration of the steps](./bug.gif)

---

在这个例子中，前一种行为是正确的。**如果我关注了一个人，然后切换到另一个人，组件不应该搞混我到底关注了谁。**这里类组件的实现显然是错误的。

*(虽然你完全应该[关注 Sophie ](https://mobile.twitter.com/sophiebits))*

---

所以为什么我们的类组件示例会这样运行呢？

让我们仔细看看类里面的 `showMessage` 方法：

```jsx{3}
class ProfilePage extends React.Component {
  showMessage = () => {
    alert('Followed ' + this.props.user);
  };
```

这个 class 方法读取 `this.props.user` 中的值。在 react 中 props 是 immutable 的，因此它不能被修改。**然而，`this` *是*，且总是 mutable 的.**

事实上，这也是 `this` 在类中的存在目的。React 本身会随着时间的推移更改 this，这样你就能在 `render` 和生命周期函数中读取到新的版本。

所以，如果我们的组件在请求数据还没回来的时候 re-renders，`this.props` 会改变，`showMessage` 方法会从一个“过于新”的 `props` 中读取到 `user`。

这个有趣的观测结果反映了用户界面的本质。如果说一个UI可以概念化为一个拥有应用当前状态的函数，那么**事件处理函数也是 render 结果的一部分 —— 和那些可视的输出没什么两样**。我们的事件处理函数“属于”某个特定 render，具有特定  props 和 state。

然而，调用一个从回调函数里读取 `this.props` 的 timeout 打破了这种联系。我们的 `showMessage` 回调没有绑定任何一个特定的 render，因此它失去了正确的 props。正是 `this` 切断了这种联系。

---

**先说说如果没有函数组件。**我们如何解决这个问题。

我们想从 `props` 丢失的某个地方，以某种方式“修复”带有正确的 props 的 `render` 和 读取 props 的 `showMessage` 回调函数之间的这种联系。

一种办法是在事件中尽早读取 `this.props` 的值，然后将它们显式地传入 timeout 的回调函数中。

```jsx{2,7}
class ProfilePage extends React.Component {
  showMessage = (user) => {
    alert('Followed ' + user);
  };

  handleClick = () => {
    const {user} = this.props;
    setTimeout(() => this.showMessage(user), 3000);
  };

  render() {
    return <button onClick={this.handleClick}>Follow</button>;
  }
}
```

这[起作用了](https://codesandbox.io/s/3q737pw8lq)。但是，这种方法会使代码随着时间的推移变得越来越冗长和容易出错。如果我们需要一个以上的 props 呢？如果我们需要获取 state 呢？**如果在 `showMessage` 中调用了其他方法，而那个方法需要读取 `this.props.something` 或 `this.state.something`，我们就又会遇到同样的问题。**这样我们就不得不将 `this.props` 和 `this.state` 作为参数传入在 `showMessage` 中调用的每一个函数。

这样做会破坏 class 自身的工程结构。同时，这也很难记住或强制施行，这就是为什么人们经常需要解决由此产生的bugs。

同样的，将 `alert` 代码内联写在 `handleClick` 里也是治标不治本。我们希望构建的代码能允许拆分为更多的方法，*同时*也能从与当前调用关联的 render 中读取相对应的 props 和 state。**这不是 React 独有的问题——在任何将数据放在像 `this` 这样可修改（mutable）对象的UI库中，你都可以复现这一问题。**

或许，我们可以在constructor里面*绑定*方法？


```jsx{4-5}
class ProfilePage extends React.Component {
  constructor(props) {
    super(props);
    this.showMessage = this.showMessage.bind(this);
    this.handleClick = this.handleClick.bind(this);
  }

  showMessage() {
    alert('Followed ' + this.props.user);
  }

  handleClick() {
    setTimeout(this.showMessage, 3000);
  }

  render() {
    return <button onClick={this.handleClick}>Follow</button>;
  }
}
```

不，这并没有解决任何问题。请记住，问题在于我们读取 `this.props` 太晚了——而不在于我们使用的语法！**但是，如果我们完全依赖 js 闭包，问题就解决了。**

我们通常会避免使用闭包，因为思考一个随着时间的变化会被修改的值是一件[困难的事](https://wsvincent.com/javascript-closure-settimeout-for-loop/) 。但在React中，props 和 state 是 immutable的！（至少我们是这样强烈推荐的。）这消除了我们使用闭包的一个主要障碍。

这意味着，如果你封闭特定 render 中的 props 或 state，就可以认为它们总是能保持不变：

```jsx{3,4,9}
class ProfilePage extends React.Component {
  render() {
    // 捕获这个props!
    const props = this.props;

    // 注意：我们是在 render 里面
    // 这不是class方法
    const showMessage = () => {
      alert('Followed ' + props.user);
    };

    const handleClick = () => {
      setTimeout(showMessage, 3000);
    };

    return <button onClick={handleClick}>Follow</button>;
  }
}
```

**你已经“捕获”到此刻的 render 中的 props 啦**


![Capturing Pokemon](./pokemon.gif)


这样的话，在里面的任意代码（包括 `showMessage`）都能保证读取到的是这个特定 render 中的 props。React不会再“动我们的奶酪”啦。

**之后我们可以在里面添加任意数量辅助函数，它们也都会使用那些捕获住的 props 和 state。** 闭包救场成功！

---

[上面那个例子](https://codesandbox.io/s/oqxy9m7om5)虽然没有错，但看起来怪怪的。如果你要在 `render` 里面定义函数而不是使用class方法，那么用class的意义何在呢？

实际上，我们可以剥掉class的“外壳”，将上面的代码简化成下面这样：

```jsx
function ProfilePage(props) {
  const showMessage = () => {
    alert('Followed ' + props.user);
  };

  const handleClick = () => {
    setTimeout(showMessage, 3000);
  };

  return (
    <button onClick={handleClick}>Follow</button>
  );
}
```

像之前一样，`props` 仍然是被捕获的——React将它们作为参数传递。**跟 `this` 不同， `props` 对象本身是永远不会被React修改的**。

如果你在函数定义中解构 `props` 的话，会更加明显：

```jsx{1,3}
function ProfilePage({ user }) {
  const showMessage = () => {
    alert('Followed ' + user);
  };

  const handleClick = () => {
    setTimeout(showMessage, 3000);
  };

  return (
    <button onClick={handleClick}>Follow</button>
  );
}
```

当父组件用不同的 props 来渲染 `ProfilePage` 时，React会再次调用 `ProfilePage` 函数。 但这时我们之前点击过的那个事件处理函数“属于”上一个 render ，它有自己的 `user` 值和读取该值得 `showMessage` 回调函数。它们都完好无损的保留了下来。

这也就是为什么，在函数组件版本的[这个 demo ](https://codesandbox.io/s/pjqnl16lm7)中，在当前选中用户为 Sophie 时点击关注，然后切换到 Sunil，最终还是会 alert `'Followed Sophie'`:

![Demo of correct behavior](./fix.gif)

这个行为是符合预期的。*(虽然你可能也想[关注 Sunil](https://mobile.twitter.com/threepointone)！)*

---

现在我们知道在 React 中，函数组件和类组件之间的巨大差别了：

>**函数组件会捕获住 render 过的值**

**在 Hooks 中，同样的原则也适用于 state。** 思考下面这个例子：

```jsx
function MessageThread() {
  const [message, setMessage] = useState('');

  const showMessage = () => {
    alert('You said: ' + message);
  };

  const handleSendClick = () => {
    setTimeout(showMessage, 3000);
  };

  const handleMessageChange = (e) => {
    setMessage(e.target.value);
  };

  return (
    <>
      <input value={message} onChange={handleMessageChange} />
      <button onClick={handleSendClick}>Send</button>
    </>
  );
}
```

（这是一个[live demo](https://codesandbox.io/s/93m5mz9w24)。）

虽然这不是一个很好的消息应用界面，但它阐明了同样的观点：如果我发出去一条特定消息，那么组件不应该搞混我实际上发的是哪一条消息。在上面的例子中，当在浏览器上触发点击事件时，此时此刻特定的 render 返回了事件处理函数，同时这个 render “拥有”的 state也被函数组件中的 `message` 也捕获住了。因此发送出去的消息就是在我点击“发送”时输入框里面的内容。

---

现在我们知道了，在 React 中函数组件默认捕获 props 和 state。**但是如果我们 *想要* 读取最新 props 或 state呢？它们并不属于某个特定的render。** 这时如何 [“读取一个未来的最新值”](https://dev.to/scastiel/react-hooks-get-the-current-state-back-to-the-future-3op2)呢?

在类组件中，你可以读取 `this.props` 或 `this.state`，因为 `this` 是 mutable 的，React 会随着时间的推移更改它。在函数组件中，你也可以拥有一个在组件所有 renders 之间共享的 mutable 值，它叫做 “ref”：

```js
function MyComponent() {
  const ref = useRef(null);
  // 你可以对 `ref.current`进行读写。
  // ...
}
```

但是，你需要自己管理它。

ref 和类的实例变量[扮演着相同的角色](https://reactjs.org/docs/hooks-faq.html#is-there-something-like-instance-variables)。它是一艘前往 mutable 世界的逃生舱。你也许很熟悉 “DOM refs”，但我们这里提到的 ref 的概念要更加广泛一些。它就是一个载体，你可以往里面塞任何你想要的东西。

在视觉上看起来，`this.something` 和 `something.current` 也像是互为镜像，它们在概念上是相同的。

默认情况下，React不会为函数组件中的最新 props 或 state 创建 refs。因为在大部分情况下你都用不到，为它们赋值是一项浪费。但是如果你真的需要用到的话，你也可以手动追踪它们。

```jsx{3,6,15}
function MessageThread() {
  const [message, setMessage] = useState('');
  const latestMessage = useRef('');

  const showMessage = () => {
    alert('You said: ' + latestMessage.current);
  };

  const handleSendClick = () => {
    setTimeout(showMessage, 3000);
  };

  const handleMessageChange = (e) => {
    setMessage(e.target.value);
    latestMessage.current = e.target.value;
  };
```

如果我们读取 `showMessage` 中的 `message`，我们会得到点击发送按钮时的那条消息。但如果我们读取 `latestMessage.current`，我们会得到最新的那个值——如果你在点击发送按钮后继续输入的话就会发现不同。

你可以比较[两个](https://codesandbox.io/s/93m5mz9w24)[demos](https://codesandbox.io/s/ox200vw8k9)来看看其中的差别。ref 是一种“选择退出”一致性渲染的方法，在某些情况下会提供便利。

总的来说，你应该避免在 rendering *中*读写 refs，因为 ref 是 mutable 的，而我们想要保持 rendering 的可预测性。**同时，如果我们想要获取某个特定 prop 或 state的最新值，手动更新 ref 也是一件很烦人的事。**我们可以通过使用一个 effect 来自动化这个更新：

```js{4-8,11}
function MessageThread() {
  const [message, setMessage] = useState('');

  // 保持追踪最新值
  const latestMessage = useRef('');
  useEffect(() => {
    latestMessage.current = message;
  });

  const showMessage = () => {
    alert('You said: ' + latestMessage.current);
  };
```

(这是一个 [demo](https://codesandbox.io/s/yqmnz7xy8x).)

我们在 effect *内部* 进行赋值，这样的话 ref 的值会在DOM完成更新之后才改变。这就保证了我们的修改（mutation）不会破坏[ Time Slicing 和 Suspense ](https://reactjs.org/blog/2018/03/01/sneak-peek-beyond-react-16.html)这类依赖于可打断rendering的特性。

我们并不常需要像这样使用ref。**捕获的 props 或 state 才是一般情况下我们需要的。** 但是在需要处理类似 intervals 和 subscriptions 这样的 [命令式API](/making-setinterval-declarative-with-react-hooks/) 时，ref 是很便利的。记住，你可以追踪*任何*值——单个props，单个state，整个props对象，甚至是函数。

该模式也有利于优化——比如当 `useCallback` 的标识（identity）变化过于频繁的时候。但是，在通常情况下[使用 reducer ](https://reactjs.org/docs/hooks-faq.html#how-to-avoid-passing-callbacks-down)是一个[更好的解决办法](https://github.com/ryardley/hooks-perf-issues/pull/3). (之后会单开一篇博文来展开这个主题!)

---

在本文中，我们看到了在类组件中常见的错误模式，且闭包是如何帮助我们修复这个错误的。
同时，你可能也已经注意到，当你尝试通过指定一个依赖数组来优化Hooks时，不新鲜的闭包可能会导致bug。这意味着闭包是问题吗？我不这么认为。

正如我们在上面所看到的，闭包实际上帮助我们*修复*了很难注意到的细微问题。同样的，它们使得在[并发模式](https://reactjs.org/blog/2018/03/01/sneak-peek-beyond-react-16.html)中编写正确运行的代码变得更加容易。这是很有可能的，因为组件的内部逻辑会在每次 render 后锁定正确的 props 和 state。

在我至今见过的所有案例中，**“不新鲜的闭包”问题会出现的主要原因是开发者错误假设了“函数不会改变”或“props总是保持不变的”**。事实并非如此，因此我希望这篇文章能有助于澄清这个误区。

函数封闭了它们内部的 props 和 state —— 但它们的标识（identity）同样很重要。这不是一个bug，而是函数组件的一个feature。举个例子，对于 `useEffect` 或 `useCallback` 的 “依赖数组（dependencies array）”来说，函数就不应该被排除在外。（正确的修复方法通常使用是上面的 `useReducer` 或 `useRef` 解决方案 —— 我们很快就会说明如何在两种方案之间做出选择）。

当我们用函数组件编写大部分React代码时，需要调整我们对[代码优化](https://github.com/ryardley/hooks-perf-issues/pull/3)以及[哪些值会随时间变化](https://github.com/facebook/react/issues/14920)的直觉.

就像 [Fredrik 说的](https://mobile.twitter.com/EphemeralCircle/status/1099095063223812096):

>目前我能想到最好的 hooks 守则就是“编码时要做好到任何值会在任何时间发生变化的准备”

函数当然也不例外，这需要花一点时间成为React学习中的常识。需要我们的思维从之前class写法中调整过来。我希望这篇文章能帮助你用新的眼光来看待这件事。

React 函数总是捕获住自身的值 —— 现在我们知道为什么了。

![Smiling Pikachu](./pikachu.gif)

他们是完全不一样的神奇宝贝！
