---
title: 函数组件和类组件的区别?
date: '2019-03-03'
spoiler: 它们是完全不同的两只宝可梦（Pokémon）.
---

React 函数组件和类组件有什么不同?

以前对于这个问题的经典回答是：类组件拥有更多功能（比如 state）。但是有了 [Hooks](https://reactjs.org/docs/hooks-intro.html)，一切都不一样了。

你可能听说过关于性能的比较，但是我对相关结论持谨慎态度，因为得出这个结论的 benchmarks 是有[缺陷的](https://medium.com/@dan_abramov/this-benchmark-is-indeed-flawed-c3d6b5b6f97f?source=your_stories_page---------------------------)。性能首先取决于你的代码做什么，而不是因为选择了函数或者类组件。通过我们的观察，两者的性能差异微乎其微，尽管他们的优化[策略](https://reactjs.org/docs/hooks-faq.html#are-hooks-slow-because-of-creating-functions-in-render)有些不同。

任何情况下我们都[不推荐](https://reactjs.org/docs/hooks-faq.html#should-i-use-hooks-classes-or-a-mix-of-both)你（用 hooks）重写现有组件，除非你有特别的原因，或者想（用 Hooks）尝鲜。就像 2014 年的 React 一样，Hooks 还是一个年轻的东西，最佳实践仍在探索中，你无法通过教程按图索骥。

So where does that leave us? 函数组件和类组件之间没有根本区别吗？当然不是，最大的区别在于你的观念模型（mental model）。**这篇文章将针对他们最重要的区别进行探讨。** 这个区别在函数组件最初发布的时候就已经[存在](https://reactjs.org/blog/2015/09/10/react-v0.14-rc1.html#stateless-function-components)：

>**Function components capture the rendered values.**

>**函数组件可以捕获渲染的值。**

让我们深入看看这句话的含义。

---

**请注意：本文不对类组件或者函数组件做价值判断。它只是介绍这两种 React 编程模型的区别。更多关于函数组件的问题，请参考[Hooks FAQ](https://reactjs.org/docs/hooks-faq.html#adoption-strategy).**

---

有这样一个组件：

```jsx
function ProfilePage(props) {
  const showMessage = () => {
    alert('关注了 ' + props.user);
  };

  const handleClick = () => {
    setTimeout(showMessage, 3000);
  };

  return (
    <button onClick={handleClick}>关注</button>
  );
}
```

它显示一个按钮，（点击按钮）通过 `setTimeout` 模拟网络请求，然后弹出一个确认弹窗。比如，如果你选择的 `props.user` 是 `'Dan'`, 3 秒钟后它会显示 `'关注了 Dan'`。非常简单的一个例子。

*（上面的例子中，你可以使用箭头函数或者函数声明，他们都会一样地工作。）*

如果我们把它写成一个类（class）呢？一个幼稚(naïve)的写法可能是这样的：

```jsx
class ProfilePage extends React.Component {
  showMessage = () => {
    alert('关注了 ' + this.props.user);
  };

  handleClick = () => {
    setTimeout(this.showMessage, 3000);
  };

  render() {
    return <button onClick={this.handleClick}>关注</button>;
  }
}
```
多数人会认为这两段代码是等价的。人们经常在这两种模式（function / class）之间随意地重构代码，而不关心它们的实现：

![Spot the difference between two versions](./wtf.gif)

**然而，这两段代码有细微的差别。**
仔细观察上面的代码，发现差别了吗？反正对我来说花了相当一段时间才发现。

**如果你想自己跑一下看看区别，这里有一个 [live demo](https://codesandbox.io/s/pjqnl16lm7)。** 接下来的内容就是介绍他们的不同，以及为什么这些差异很重要。

---

在继续讨论之前，我需要强调，这里的不同和 React Hooks 无关，甚至上面的例子都没有用到 Hooks！

它们完全是 React 中函数和类的差别。如果你打算在 React 中更多地使用函数，你可能想要了解这些差异。

---

**我们将从一个 React 中常见的 bug 来入手**

看看这个 **[sandbox](https://codesandbox.io/s/pjqnl16lm7)** 上的例子：它有一个账号选择器（profile selector），和两个账号详情页，每个页面包含一个「关注」按钮，他们分别用函数和类实现。

按顺序操作上面的按钮：
1. **点击** 其中一个「关注」按钮；
2. 在 3 秒之内 **修改** 你选择的账号；
3. **查看** 弹出的文字。

你会发现一个独特的区别：

* 在函数组件中，在 Dan 的主页点击关注，然后切换到 Sophie 的主页后，仍然会弹出 `'关注了 Dan'`；

* 在类组件中，同样的操作会弹出 `'关注了 Sophie'`。

![Demonstration of the steps](./bug.gif)

---

在这个例子中，第一个的行为是符合预期的。**如果我关注了一个人，然后去了另一个人的主页，我的组件应该清晰地知道我关注了谁。** 此处的类组件明显是有 bug 的。

*当然，你完全可以[关注 Sophie](https://mobile.twitter.com/sophiebits)。*

---

那么，为什么类组件会有这样的问题呢？

让我们仔细看看类组件中的 `showMessage` 方法：

```jsx{3}
class ProfilePage extends React.Component {
  showMessage = () => {
    alert('关注了 ' + this.props.user);
  };
```

这个方法读取 `this.props.user`。在 React 中 props 是不可变(immutable)的，所以它永远不会改变。**然而，`this` *是且一直是可变的*。**

事实上，这就是 `this` 在类中存在的意义。React 会一直修改它，这样你才能够在 `render` 和生命周期方法中读到它的最新版本，

所以，如果我们在请求过程中重新渲染(re-render)组件，`this.props` 将会改变。`showMessage` 方法从「最新」的 `props` 中读取 `user`，而这个 `props` 有点「过于」新了。

这揭示了一个关于用户界面的有趣观察。如果我们把一个 UI 比喻成反映前应用状态的一个函数，**那么事件处理程序(event handlers)就是渲染结果的一部分 —— 就像你看到的一样。** 我们的事件处理程序「从属于」一次包含特定 `props` 和 `state` 的特定的渲染。

然而，当你通过一个定时器去延迟读取 `this.props` 的时候，这种联系（译注：event handlers 和 props / state 的联系）就被切断了。我们的 `showMessage` 不再「从属」与特定的渲染，也不再和特定的 `props` 和 `state` 产生绑定，所以它「丢失了」正确的 props。正是读取 `this` 切断了这种联系。

---

**我们先假设不存在函数组件。**  上述问题如何解决呢？

应该用正确的 props 「修复」读取它的 `showMessage` 和 `render` 之间的连接。让我们从 `props` 开始出错的地方入手。

一种方法是在事件处理函数中提前读取 `this.props`，然后显式地把它传给定时器的回调函数：

```jsx{2,7}
class ProfilePage extends React.Component {
  showMessage = (user) => {
    alert('关注了 ' + user);
  };

  handleClick = () => {
    const {user} = this.props;
    setTimeout(() => this.showMessage(user), 3000);
  };

  render() {
    return <button onClick={this.handleClick}>关注</button>;
  }
}
```

这样做是[奏效的](https://codesandbox.io/s/3q737pw8lq)。但是这种写法让代码变得冗长，而且随着时间的增长容易发生问题。如果我们需要的不只是单一的 prop 呢？如果我们还需要读取 state 呢？**如果 `showMessage` 调用另一个方法，该方法读取 `this.props.something` 或者 `this.state.something`，问题会再次出现。** 所以对于每个 `showMessage` 调用的方法，我们都需要把`this.props` 和 `this.state` 作为参数传进去。

这样做是反直觉的（Doing so defeats the ergonomics normally afforded by a class.）。而且很难记住、执行，所以人们经常在这种情况下遇到 bug。

同样的，在 `handleClick` 中内联 `alert` 代码并不解决问题。我们希望优化代码结构，使它既可以拆分成更多方法，同时能读取和特定渲染绑定的 state 和 props。**这不是 React 独有的问题，在任何使用可变对象（比如 `this`）存储数据的 UI 库中，你都可能遇到。**

我们是不是可以在构造函数中 *bind* 这些方法？

```jsx{4-5}
class ProfilePage extends React.Component {
  constructor(props) {
    super(props);
    this.showMessage = this.showMessage.bind(this);
    this.handleClick = this.handleClick.bind(this);
  }

  showMessage() {
    alert('关注了 ' + this.props.user);
  }

  handleClick() {
    setTimeout(this.showMessage, 3000);
  }

  render() {
    return <button onClick={this.handleClick}>关注</button>;
  }
}
```

然而这并不起到任何作用。请记住，我们的问题在于过晚地读取 `this.props`，而不是什么语法问题。 **但是通过 JavaScript 闭包，我们可以完全解决这个问题。**

大家通常尽量避免使用闭包，因为对于一个可以随着时间被修改的值来说，闭包会让它变得难以捉摸。但是在 React 中，props 和 state 是不可变的(immutable)！（至少我们强烈推荐使用不可变数据。）这消除了闭包的一个主要负担。

也就是说，如果通过闭包让一次特定的 render 保存了它的 props / state，你就可以放心地使用他们，因为他们不会改变。

```jsx{3,4,9}
class ProfilePage extends React.Component {
  render() {
    // 捕获了 props！
    const props = this.props;

    // 注意：我们在 render *里面*
    // 他们并不是类的方法
    const showMessage = () => {
      alert('关注了 ' + props.user);
    };

    const handleClick = () => {
      setTimeout(showMessage, 3000);
    };

    return <button onClick={handleClick}>关注</button>;
  }
}
```

**你已经「捕获」了渲染那一刻的 props 值：**

![Capturing Pokemon](./pokemon.gif)

这样一来，你可以保证 render 里面的任何代码（包括 `showMessage`）拿到的都是当前渲染的 props。React 不再会「动我们的奶酪」了。

**我们可以在 render 里面任意增加帮助函数，它们同样会捕获正确的 props 和 state。** 闭包万岁！

---

[上面的例子](https://codesandbox.io/s/oqxy9m7om5) 是正确的，但是看起来很奇怪。如果你把所有函数都定义在了 `render` 里面，而不是定义成类的方法，使用类还有什么意义？

事实上，我们可以精简代码，去掉「类」这个壳子：

```jsx
function ProfilePage(props) {
  const showMessage = () => {
    alert('关注了 ' + props.user);
  };

  const handleClick = () => {
    setTimeout(showMessage, 3000);
  };

  return (
    <button onClick={handleClick}>关注</button>
  );
}
```

就像上面一样，`props` 仍然会被捕获 —— React 会把他们作为函数参数传入。**和 `this` 不同，React 永远不会修改 `props` 对象。**

如果你在函数定义中解构 `props`，会更加明显：

```jsx{1,3}
function ProfilePage({ user }) {
  const showMessage = () => {
    alert('关注了 ' + user);
  };

  const handleClick = () => {
    setTimeout(showMessage, 3000);
  };

  return (
    <button onClick={handleClick}>关注</button>
  );
}
```

当父组件用不同的 props 渲染 `ProfilePage` 的时候，React 会再次调用 `ProfilePage` 这个函数。但是我们之前点击所注册的事件处理函数仍然「属于」上一次渲染，`showMessage` 也仍然会读取属于一次渲染的 `user`。他们都是完好的。

这就是为什么在函数版本的 [demo](https://codesandbox.io/s/pjqnl16lm7) 中，点击关注 Sophie’s 后，切换到 Sunil 主页，最后仍然会跳出 `'关注了 Sophie'` 的原因：

![Demo of correct behavior](./fix.gif)

这个行为是正确的。*（尽管你可能也想[关注Sunil](https://mobile.twitter.com/threepointone)！）*

---

现在我们已经理解了在 React 中函数和类的最大不同：

>**Function components capture the rendered values.**

>**函数组件可以捕获渲染的值。**

**在 Hooks 中，对于 state 也是同样的道理。**
看下面的例子：

```jsx
function MessageThread() {
  const [message, setMessage] = useState('');

  const showMessage = () => {
    alert('你说了: ' + message);
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
      <button onClick={handleSendClick}>发送</button>
    </>
  );
}
```

([live demo 看这里](https://codesandbox.io/s/93m5mz9w24)。)

尽管这不是一个好的通信应用 UI，但它体现了一个基本观点：如果我发送一条信息，组件必须准确地知道该被发送的是哪一条。在函数组件中，`message` 捕获到了属于此次渲染的状态，并返回在了点击事件处理函数中。所以 `message` 的值正是我点击「发送」时输入框中的内容。

---

因此，我们知道了 React 中的函数会默认捕获 props 和 state。**但是，如果我们*确实想要*读取最新的 props 和 state（并不属于特定渲染的）呢？** 如果我们想[「从未来读取他们」](https://dev.to/scastiel/react-hooks-get-the-current-state-back-to-the-future-3op2)呢？

在类组件中，你可以直接读取 `this.props` 或者 `this.state`，因为 `this` 本身是可变的。React 会修改它。在函数组件中，你也可以访问一个在所有组件内渲染中共享的值，也就是「ref」：

```jsx
function MyComponent() {
  const ref = useRef(null);
  // 你可以读写 `ref.current`.
  // ...
}
```

但是，这样一来你就必须自己管理它了。

一个 ref 类似于一个[实例变量](https://reactjs.org/docs/hooks-faq.html#is-there-something-like-instance-variables)。它是（你在不可变世界）进入可变世界的救生舱。你可能对「DOM refs」比较熟悉，但是这里说的 ref 是更通用的概念。它就是一个空盒子，你可是往里面放任何东西。

更形象一点，`this.something` 就像 `something.current` 的一面镜子。从概念上它们是一样的。

React 不会在函数组件中默认为最新的 props 和 state 创建 refs。多数情况下你也不太需要它，为它赋值会浪费很多时间（译注：指手动更新 ref.current）。但是如果你愿意，仍然可以手动追踪它们：

```jsx{3,6,15}
function MessageThread() {
  const [message, setMessage] = useState('');
  const latestMessage = useRef('');

  const showMessage = () => {
    alert('你说了: ' + latestMessage.current);
  };

  const handleSendClick = () => {
    setTimeout(showMessage, 3000);
  };

  const handleMessageChange = (e) => {
    setMessage(e.target.value);
    latestMessage.current = e.target.value;
  };
```

如果我们在 `showMessage` 中读取 `message`，看到的是点击「发送」按钮时的消息。但是如果我们读取 `latestMessage.current`，将得到最新的值 —— 即使我们在点击按钮后继续输入。

你可以对比[两个](https://codesandbox.io/s/93m5mz9w24) [demo](https://codesandbox.io/s/ox200vw8k9) 去观察他们的差异。Ref 是一种「跳出」渲染一致性过程的方式，这在某些情况下会很有用。

总的来说，在*渲染过程*中你应你该避免读写 refs，因为它们是可变的。我们希望渲染结果是可预测的。**然而，如果我们确实希望获取特定 prop 或 state 的最新值，手动更新 ref 是很烦人的。** 我们可以通过 effect 让管理过程自动化：

```jsx{4-8,11}
function MessageThread() {
  const [message, setMessage] = useState('');

  // 追踪最近的值
  const latestMessage = useRef('');
  useEffect(() => {
    latestMessage.current = message;
  });

  const showMessage = () => {
    alert('你说了: ' + latestMessage.current);
  };
```

([demo 看这里](https://codesandbox.io/s/yqmnz7xy8x))

我们把赋值动作放在一个 effect *里面*，以保证只有在 DOM 更新之后才修改 ref 的值。这保证了我们的修改不会破坏类似[Time Slicing 或者 Suspense](https://reactjs.org/blog/2018/03/01/sneak-peek-beyond-react-16.html)等功能，这些功能依赖于可以打断的渲染。

这样使用 ref 其实并不常见，**捕获 props 或 state 是一个更好的默认行为。** 但是在处理[命令式 API](/making-setinterval-declarative-with-react-hooks/)的时候很有用，比如 intervals 或者 subscriptions。记住你可以这样追踪*任意*的值 —— 一个 prop，一个 state 变量，整个 props 对象，甚至一个函数。

这种模式也可以用来做某些场景的优化 —— 比如 `useCallback` 过于频繁地识别变化。不过[使用一个 reducer](https://reactjs.org/docs/hooks-faq.html#how-to-avoid-passing-callbacks-down) 可能是[更好的解决方案](https://github.com/ryardley/hooks-perf-issues/pull/3)。（未来会专门有一篇 blog 讨论这个问题！）

---

在这篇文章中，我们分析了在类组件中经常出现的一种问题，并且介绍了如何用闭包解决它。但是你可能注意到了，当你尝试用一个依赖数组优化 Hooks 的时候，状态陈旧的闭包会引起 bug。是不是意味着这是闭包的问题？我觉得不然。

就像前面看到的，闭包实际上帮助我们*解决*了难以察觉的小问题。同样的，它让我们在[并发模式](https://reactjs.org/blog/2018/03/01/sneak-peek-beyond-react-16.html)下更容易写出正确的代码。这是因为组件把每次渲染的 props 和 state 正确地保留了下来。

据我了解，多数情况下 **「过时的闭包状态」问题是因为我们错误地假设「函数不会改变」或者「props 是不变的」**。事实并非如此，希望这篇文章可以帮助你弄清楚这一点。

函数通过闭包持有了它的 props 和 state，因此识别他们非常重要。这是函数组件的一个特性，而不是 bug。比如，函数不应该被 `useEffect` 或者 `useCallback` 的依赖数组排除。（正确的解法通常是使用 `useReducer` 或者 `useRef` —— 我们很快就会有专门的文档帮助你选择他们）。

当我们在 React 中大量使用函数的时候，最好将 [优化代码](https://github.com/ryardley/hooks-perf-issues/pull/3) 和 [什么样的值会随着时间变化](https://github.com/facebook/react/issues/14920) 烂熟于心。

正如 [Fredrik 所说](https://mobile.twitter.com/EphemeralCircle/status/1099095063223812096)：

> 在使用 hooks 的时候，最好的一条法则就是永远记得「值在任何时候都可能变化」。

函数也不例外。在多数 React 教程中，要了解到这一点可能需要花些时间。尤其是当你刚刚从类组件的思维转换过来时。希望这篇文章能帮你用崭新的眼光去看待它。

React 函数总是能捕捉他们的值 —— 现在我们知道了原因。

![Smiling Pikachu](./pikachu.gif)

他们是完全不同的宝可梦。