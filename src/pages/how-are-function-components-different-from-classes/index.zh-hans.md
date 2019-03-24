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

很简单，这个组件仅包含一个按钮。点击这个按钮之后会发送一个网络请求（用 `setTimeout` 模拟），然后展示一个确认弹框。比如：如果 `props.user` 是 `'Dan'`，3秒以后屏幕上会显示 `'Followed Dan'`。

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

* 在使用 `ProfilePage` **function** 时，在 Dan 的 profile 中点击 Follow 然后跳转到 Sophie 的 profile，弹框依旧 alert `'Followed Dan'`。

* 在使用 `ProfilePage` **class** 时，弹框里显示的是 `'Followed Sophie'`:

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

**We could then add as many helper functions inside as we want, and they would all use the captured props and state.** Closures to the rescue!

---

The [example above](https://codesandbox.io/s/oqxy9m7om5) is correct but it looks odd. What’s the point of having a class if you define functions inside `render` instead of using class methods?

Indeed, we can simplify the code by removing the class “shell” around it:

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

Just like above, the `props` are still being captured — React passes them as an argument. **Unlike `this`, the `props` object itself is never mutated by React.**

It’s a bit more obvious if you destructure `props` in the function definition:

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

When the parent component renders `ProfilePage` with different props, React will call the `ProfilePage` function again. But the event handler we already clicked “belonged” to the previous render with its own `user` value and the `showMessage` callback that reads it. They’re all left intact.

This is why, in the function version of [this demo](https://codesandbox.io/s/pjqnl16lm7), clicking Follow on Sophie’s profile and then changing selection to Sunil would alert `'Followed Sophie'`:

![Demo of correct behavior](./fix.gif)

This behavior is correct. *(Although you might want to [follow Sunil](https://mobile.twitter.com/threepointone) too!)*

---

Now we understand the big difference between functions and classes in React:

>**Function components capture the rendered values.**

**With Hooks, the same principle applies to state as well.** Consider this example:

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

While this isn’t a very good message app UI, it illustrates the same point: if I send a particular message, the component shouldn’t get confused about which message actually got sent. This function component’s `message` captures the state that “belongs” to the render which returned the click handler called by the browser. So the `message` is set to what was in the input when I clicked “Send”.

---

So we know functions in React capture props and state by default. **But what if we *want* to read the latest props or state that don’t belong to this particular render?** What if we want to [“read them from the future”](https://dev.to/scastiel/react-hooks-get-the-current-state-back-to-the-future-3op2)?

In classes, you’d do it by reading `this.props` or `this.state` because `this` itself is mutable. React mutates it. In function components, you can also have a mutable value that is shared by all component renders. It’s called a “ref”:

```js
function MyComponent() {
  const ref = useRef(null);
  // You can read or write `ref.current`.
  // ...
}
```

However, you’ll have to manage it yourself.

A ref [plays the same role](https://reactjs.org/docs/hooks-faq.html#is-there-something-like-instance-variables) as an instance field. It’s the escape hatch into the mutable imperative world. You may be familiar with “DOM refs” but the concept is much more general. It’s just a box into which you can put something.

Even visually, `this.something` looks like a mirror of `something.current`. They represent the same concept.

By default, React doesn’t create refs for latest props or state in function components. In many cases you don’t need them, and it would be wasted work to assign them. However, you can track the value manually if you’d like:

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

If we read `message` in `showMessage`, we’ll see the message at the time we pressed the Send button. But when we read `latestMessage.current`, we get the latest value — even if we kept typing after the Send button was pressed.

You can compare the [two](https://codesandbox.io/s/93m5mz9w24) [demos](https://codesandbox.io/s/ox200vw8k9) to see the difference yourself. A ref is a way to “opt out” of the rendering consistency, and can be handy in some cases.

Generally, you should avoid reading or setting refs *during* rendering because they’re mutable. We want to keep the rendering predictable. **However, if we want to get the latest value of a particular prop or state, it can be annoying to update the ref manually.** We could automate it by using an effect:

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

We do the assignment *inside* an effect so that the ref value only changes after the DOM has been updated. This ensures our mutation doesn’t break features like [Time Slicing and Suspense](https://reactjs.org/blog/2018/03/01/sneak-peek-beyond-react-16.html) which rely on interruptible rendering.

Using a ref like this isn’t necessary very often. **Capturing props or state is usually a better default.** However, it can be handy when dealing with [imperative APIs](/making-setinterval-declarative-with-react-hooks/) like intervals and subscriptions. Remember that you can track *any* value like this — a prop, a state variable, the whole props object, or even a function.

This pattern can also be handy for optimizations — such as when `useCallback` identity changes too often. However, [using a reducer](https://reactjs.org/docs/hooks-faq.html#how-to-avoid-passing-callbacks-down) is often a [better solution](https://github.com/ryardley/hooks-perf-issues/pull/3). (A topic for a future blog post!)

---

In this post, we’ve looked at common broken pattern in classes, and how closures help us fix it. However, you might have noticed that when you try to optimize Hooks by specifying a dependency array, you can run into bugs with stale closures. Does it mean that closures are the problem? I don’t think so.

As we’ve seen above, closures actually help us *fix* the subtle problems that are hard to notice. Similarly, they make it much easier to write code that works correctly in the [Concurrent Mode](https://reactjs.org/blog/2018/03/01/sneak-peek-beyond-react-16.html). This is possible because the logic inside the component closes over the correct props and state with which it was rendered.

In all cases I’ve seen so far, **the “stale closures” problems happen due to a mistaken assumption that “functions don’t change” or that “props are always the same”**. This is not the case, as I hope this post has helped to clarify.

Functions close over their props and state — and so their identity is just as important. This is not a bug, but a feature of function components. Functions shouldn’t be excluded from the “dependencies array” for `useEffect` or `useCallback`, for example. (The right fix is usually either `useReducer` or the `useRef` solution above — we will soon document how to choose between them.)

When we write the majority of our React code with functions, we need to adjust our intuition about [optimizing code](https://github.com/ryardley/hooks-perf-issues/pull/3) and [what values can change over time](https://github.com/facebook/react/issues/14920).

As [Fredrik put it](https://mobile.twitter.com/EphemeralCircle/status/1099095063223812096):

>The best mental rule I’ve found so far with hooks is ”code as if any value can change at any time”.

Functions are no exception to this rule. It will take some time for this to be common knowledge in React learning materials. It requires some adjustment from the class mindset. But I hope this article helps you see it with fresh eyes.

React functions always capture their values — and now we know why.

![Smiling Pikachu](./pikachu.gif)

They’re a whole different Pokémon.
