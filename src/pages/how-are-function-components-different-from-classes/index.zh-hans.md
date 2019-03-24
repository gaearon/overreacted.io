---
title: Function 和 Classes 组件的区别在哪里？
date: '2019-03-03'
spoiler: 它们是完全不同的宝可梦哦.
---

React 中，function 组件和 class 组件的区别在哪里？

在过去很长一段时间内，这个问题的标准答案是 class 提供了更多的功能（比如 state）。但随着 [Hooks](https://reactjs.org/docs/hooks-intro.html) 的出现，这个答案已经过时了。

很多人说其中一个提供了更好的性能，但许多论证的过程都是有[缺陷](https://medium.com/@dan_abramov/this-benchmark-is-indeed-flawed-c3d6b5b6f97f?source=your_stories_page---------------------------)的，所以我会尽量谨慎的从中[得出结论](https://github.com/ryardley/hooks-perf-issues/pull/2)。而在我们的观察中，尽管优化策略略有[不同](https://reactjs.org/docs/hooks-faq.html#are-hooks-slow-because-of-creating-functions-in-render)，但这两者之间的性能差异其实是可以忽略不计的。也就是说 React 组件的性能并非取决于你选择的是 functional 组件还是 class 组件，而是你搭建组件的方式。

因此，在这种情况下，除非你完全不介意去做第一个吃螃蟹的人，我们[并不推荐](https://reactjs.org/docs/hooks-faq.html#should-i-use-hooks-classes-or-a-mix-of-both)你用 Hooks 直接重构你的现有项目。Hooks 还是一个全新的东西（就像2014年的 React 一样），一些“最佳实践”还在等待我们去发掘。

所以我们还能在函数组件和类组件中找到什么区别呢？ **在这篇文章中，我将着重探究他们两者之间最大的区别——思维模型。**它其实在2015年我们[发布](https://reactjs.org/blog/2015/09/10/react-v0.14-rc1.html#stateless-function-components)函数式组件的时候就已经存在了，但我们一直在忽视它：

> **函数式组件捕获 render 的值**

我们看看这句话意味着什么。

---

**注意：这篇文章并不是 class 组件和 function 组件孰优孰劣的判断。我仅仅是在陈述这两种变成模型之间的区别。你也可以查看 [Hooks FAQ](https://reactjs.org/docs/hooks-faq.html#adoption-strategy) 来看看目前大范围使用函数式组件的问题。**

---

来看看这个组件

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

很简单，这个组件仅包含一个按钮。点击这个按钮之后会发送一个网络请求（用 `setTimeout` 模拟），然后展示一个确认弹框。比如：如果 `props.user` 是 `‘Dan’`，3秒以后屏幕上会显示 `‘Followed Dan’`。

*（不要在意这里的函数声明方式。`functioin handleClick()` 会以完全一样的方式运行。）*

那么在 class 组件里面怎么写呢？我们简单转换一下：

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
通常认为这两种代码模式是等价的。我们可以自由的在这两者之间选择，但忽视了他们之间的区别：

![看看这两个版本之间的区别](./wtf.gif)

**实际上，这两者之间的区别是非常微妙的。**就我个人而言，确实要花一阵子才能看出来。

**如果你想自己找出答案，可以去看这个 [live demo](https://codesandbox.io/s/pjqnl16lm7)。**下面我会解释他们的区别到底在哪，以及这些区别意味着什么。

---

在我们继续以前，我想强调一下，我在这里所说明差异与 React Hooks 无关。上面的例子甚至没有用到 Hooks！

虽然只是关于 function 与 class 的差异，但是如果你计划在 React app 中更多地使用 function 组件，你最好有所了解。

---

**我们将用 React app 中经常出现的一个 bug 来进行说明。**

**[这个页面](https://codesandbox.io/s/pjqnl16lm7)**里包含了一个当前 profile 的选择框和两个 Follow 按钮。Follow 按钮的行为由选择框决定。

Bug 复现的步骤是这样的：

1. **点击** 其中一个 Follow 按钮。
2. 在3秒之内**改变**选择框的值。
3. **读出** alert 弹框的值

你注意到他们之间的区别了吗：

* 在使用 `ProfilePage` **function** 时，在 Dan 的 profile 中点击 Follow 然后跳转到 Sophie 的 profile，弹框依旧 alert `‘Followed Dan’`。

* 在使用 `ProfilePage` **class** 时，弹框里显示的是 `‘Followed Sophie’`:

![复现步骤](./bug.gif)

---

在这个例子里，第一种情况才是符合我们预期的。**如果我关注了一个用户，然后跳转到其他用户的页面，我的 component 不应该混淆我到底关注了谁。**很明显 class 的实现中出现了 bug

*（但是你确实应该在 Twitter 上 [follow Sophie](https://mobile.twitter.com/sophiebits)）*

---

所以为什么 class example 会出现这种结果呢？

让我们再仔细看一下 class 组件中的 `showMessage` 方法：

```jsx{3}
class ProfilePage extends React.Component {
  showMessage = () => {
    alert('Followed ' + this.props.user);
  };
```

这个方法从 `this.props.user` 中读取值。Props 在 React 中是 immutable 的，所以它不可能改变。**然而 `this` 是*可变*，而且一直在变的。**

事实上，这就是 `this` 在 class 中的意义。React 本身会随着时间推移改变 this ，然后你就能在 `render` 和 生命周期函数中读取到最新的值。

所以一旦我们在等待请求的过程中重新渲染组件，`this.props` 就会改变。`showMessage` 就会从一个“太新”的 props 中读取 `user`。

这让我们不由得思考用户界面的本质到底是什么。 UI 在概念上可以说成是描述当前应用状态的函数，**event handler 是 render 输出的一部分——就像视觉输出一样**。特定的 event handler “属于” 包含有特定 prop 和 state 的“那个” render。

可是当我们在 timeout 的回调函数中读取 `this.props` 时打破了这个规则。我们的 `showMessage` callback 并没有“绑定”给任何一个特定的 render，因此它“丢失”了正确的 props。从 `this` 里读取 props 切断了这种关联。

---

**假设 function component 不存在，** 我们要如何解决这个问题呢？

我们期望通过某种方式，在 `props` 迷失的路径上修复 `showMessage` callback 和它读取 props 的 `render` 之间的联系。

一种解决方式是在事件触发时就读取 `this.props`，然后显式的把它传递给 timeout 的回调函数：

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

这确实[可行](https://codesandbox.io/s/3q737pw8lq)。然而这种方案使得代码随着时间的推移会变得越来越冗长和容易出错。如果我们需要多个 prop 的话该怎么办呢？如果我们同时还需要获取 state，又该怎么办呢？**甚至如果 `showMessage` 调用了另一个方法，而这个方法里读取了 `this.props.something` 或 `this.state.something`，我们又会面临同样的问题。** 结果就是我们必须将 `this.props` 和 `this.state` 传递给 `showMessage` 调用的每一个函数。

这么做显然是不合适的。它不仅不符合我们对类的认知，同时也极其难以记录并施行，最后代码就会不可避免的出现 bug。

类似的，在 `handleClick` 中内联 `alert` 函数也没办法解决更大的问题。我们想要用一种可以将代码分解成更多方法的方式来构建代码，*同时*还可以读取与该 render 相关的 props 和 state。**甚至，这个问题不是 React 中独有的——你可以在任何其他将 data 放在可变对象（`this`)的 UI 库中重现它。**

也许我们可以在构造函数中 *bind* 这些方法？

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

但是这并没有解决任何问题。注意，这个问题是由于我们过晚地从 `this.props` 中读取数据导致的——并非是因为我们使用的语法！**然而，如果我们完全依赖于 Javascript 闭包，我们就可以解决这个问题。**

通常我们会避免使用闭包，因为要考虑一个值随时间变化的情况很[困难](https://wsvincent.com/javascript-closure-settimeout-for-loop/)。但是在 React 里，props 和 state 是不可变的！（至少是这么推荐的。）这就排除了使用闭包的最大阻碍

这意味着如果你把 特定 render 的 props 或 state 封装起来，你可以期望他们一直保持不变： 

```jsx{3,4,9}
class ProfilePage extends React.Component {
  render() {
    // Capture the props!
    const props = this.props;

    // Note: we are *inside render*.
    // These aren't class methods.
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

**在 render 的同时你“捕获”了 props“”**

![Pokemon get daze](./pokemon.gif)

这样，它里面的任何代码（包括 `showMessage`）都确保从相对应的 render 中引用 props。React 再也不会动我们的奶酪了。

**之后我们可以添加任何我们想要的 helper 函数在这之中，而且他们都将引用被捕获的 props 和 state。**闭包成功！

---

上面的这个[例子](https://codesandbox.io/s/oqxy9m7om5)尽管正确，但是看起来仍然有些奇怪。如果你在 `render` 里定义函数而不是使用 class 的方法，那使用 class 的意义在哪里呢？

显然，我们可以通过移除包裹在它外层的 class “壳” 来简化代码：

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

像这样，我们依旧捕获到了 `props`——React 将它们作为一个参数传递了进来。**不同于 `this`，`props` 这个对象从未被 React 更改过。**

如果你在函数定义中对 `props` 解构赋值，效果会更加明显：

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

当父组件使用不同的 props 渲染 `ProfilePage` 时，React 会重复地调用 `ProfilePage` 函数。但我们点击的事件处理函数却依旧“属于”之前的那个 render，在这个 render 中包含了正确的 `user` 值和 `showMessage` 回调函数。它们都完好无损。 

这也就是为什么 function 版本的 [demo](https://codesandbox.io/s/pjqnl16lm7)中，点击 Follow on Sophie's profile 然后切换选项框到 Sunil 依旧会弹出 `‘Followed Sophie’`：

![正确的 Demo](./fix.gif)

这种表现是符合预期的。*（不过也许你依旧想要 [follow Sunil](https://mobile.twitter.com/threepointone)）*

---

现在我们理解了了在 React 中 function 和 class 的巨大区别 

> **Function 组件捕获被 render 的值。**

**使用 Hooks，同样的原则也适用于 state。** 看看这个例子：

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

(Here’s a [live demo](https://codesandbox.io/s/93m5mz9w24).)

尽管这不是一个很好的 message app UI，但它也说明了同样的一个问题：如果我发送了一条信息，组件应该明确地知道我到底发送的是什么。这个 function component 的 `message` 捕获了“属于”调用 click handler 的*那个* state，因此当我点击“send”时，`message` 被设定成了 input 框里的值。

---

我们知道默认情况下 React 中 function 会捕获 props 和 state。**但是如果我们*想要*捕获不属于当前 render 的最新的 props 和 state，应该怎么办呢？** 如果我们想要[“从未来读取它们”](https://dev.to/scastiel/react-hooks-get-the-current-state-back-to-the-future-3op2)要怎么做？

在 class 里，因为 `this` 本身是可变的，你可以在 `this.props` 或是 `this.state` 中读取到正确的值——React 会改变它。而在 function 组件里，你同样也可以得到一个被所有 render 共享的可变的值，它被称作“ref”。 

```js
function MyComponent() {
  const ref = useRef(null);
  // You can read or write `ref.current`.
  // ...
}
```

然而，你需要自己管理它。

ref 扮演了和实例字段[相同的角色](https://reactjs.org/docs/hooks-faq.html#is-there-something-like-instance-variables)。它是进入可变数据世界的入口。你可能对“DOM refs”很熟悉，可是 ref 的概念要宽泛的多。他仅仅是一个你可以放任何东西的盒子。

即使从视觉上来讲，`this.something` 看起来也和 `something.current`。它们代表了相同的概念。

默认情况下，function component 里，React 并不会为最新的 props 或 state 创建 ref。在很多情况下你并不需要他，这回造成性能的浪费。但如果你有需要的话可以手动追踪它：

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

如果我们在 `showMessage` 中读取 `message`，我们将会在点击 Send 按钮的时候看到 message 的值。但是当我们读取 `latestMessage.current`，我们得到了最新的值——即使我们在点击 Send 按钮之后继续输入。

你可以比较这[两个](https://codesandbox.io/s/93m5mz9w24) [demo](https://codesandbox.io/s/ox200vw8k9) 来看看它们之间的区别。Ref 是 render 一致性的一种“选择性退出”方案，同时在某些情况下会很有用。

通常情况下，你应该尽量避免在 render *过程中*读取或设置 ref，因为它们是可变的，而我们期望让 render 可以预测。**然而，当我们想得到特定的 props 或 state 最新的值的时候，手动更新 ref 显得有些累赘。**我们可以和 effect 结合使用让它变得自动化：

```js{4-8,11}
function MessageThread() {
  const [message, setMessage] = useState('');

  // Keep track of the latest value.
  const latestMessage = useRef('');
  useEffect(() => {
    latestMessage.current = message;
  });

  const showMessage = () => {
    alert('You said: ' + latestMessage.current);
  };
```

(Here’s a [demo](https://codesandbox.io/s/yqmnz7xy8x).)

我们在 effect 内部进行赋值，这样 ref 的值仅仅在 DOM 更新之后才会改变。这确保了我们的变化不会破坏那些依赖于可中断的 rendering 的功能，比如[Time Slicing and Suspense](https://reactjs.org/blog/2018/03/01/sneak-peek-beyond-react-16.html)。

通常你并不需要使用 ref，因为**大多数情况下我们更需要捕获 props 或 state。** 然而在处理诸如 intervals 和 subscriptions 这样的[命令式 API](/making-setinterval-declarative-with-react-hooks/) 的时候，它会非常有效。记住你可以追踪*任何*值——包括 props 和 state 变量，整个 props object，甚至是一个函数。

这个模式对性能优化也很有用——比如当 `useCallback` 标志更改的太频繁的时候。不过通常 [useReducer](https://reactjs.org/docs/hooks-faq.html#how-to-avoid-passing-callbacks-down) 是一个更好的解决方案。（新博文预告！）

---

在本文中，我们探讨了一个 class 组件中常见的 bug，以及如何使用闭包来解决它。不过你会发现，当你尝试通过指定依赖数组来优化 Hooks 的时候，你有可能陷入闭包没有来得及更新导致的 bug 中。这是否意味着闭包存在问题呢？我不这么认为。

就像我们之前看到的那样，闭包确实帮助我们*修复了*一些我们难以察觉的细微问题。类似地，它们使得在[并发模式](https://reactjs.org/blog/2018/03/01/sneak-peek-beyond-react-16.html)下正确工作的代码容易了许多。正是因为组件在 render 的时候封住了正确的 props 和 state 让这一切成为了可能。

目前为止，我见到的所有情况中，**“陈旧闭包”的问题都是由于错误的假设“函数不会改变”或是“props 会保持不变”导致的。** 但事实并非如此，我希望这篇文章澄清了这一点。

Function 关住了它的 props 和 state——因此它们的标志也同样重要。这不是一个 bug，而是 function 组件的一个 feature。函数不应该被排除在 `useEffect` 或 `useCallback` 等的“依赖数组”之外。（正确的解决方案通常是在 `useReducer` 和 `useRef` 之间——我们很快会在文档中写明在这两者之间如何选择。）

当我们编写大多数带有函数的 React 代码时，我们需要调整我们对于[优化代码](https://github.com/ryardley/hooks-perf-issues/pull/3) 和 [哪些值会随着时间改变](https://github.com/facebook/react/issues/14920)的直觉。

就像 [Fredrik 说的](https://mobile.twitter.com/EphemeralCircle/status/1099095063223812096):

> 到目前为止我发现的关于 Hooks 的心理预期就是：“代码中的值仿佛随时都会修改”

Function 并不例外。一段时间以后它才会成为 React 学习材料中的共识。这需要从 class 的心态中做出一些调整。但是我希望这篇文章能够帮助你获得一些新的眼光。

React function 一直会捕获它的值——现在我们知道了原因。

![Smiling Pikachu](./pikachu.gif)

他们是完全不同的宝可梦！
