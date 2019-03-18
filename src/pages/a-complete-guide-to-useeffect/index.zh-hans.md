---
title: useEffect 完全指南
date: '2019-03-09'
spoiler: Effects是你数据流的一部分.
---

你用[Hooks](https://reactjs.org/docs/hooks-intro.html)写了一些组件，甚或写了一个小型应用。你可能很满意，使用它的API很舒服并且在这个过程中获得了一些小技巧。你甚至可能写了一些 [custom Hooks](https://reactjs.org/docs/hooks-custom.html)去抽离重复的逻辑（精简掉了300行代码），并且得意地展示给你的同事看，“干得漂亮”，他们如是说。

但是有时候当你使用`useEffect`，你总觉得哪儿有点不对劲。你会嘀咕你可能遗漏了什么。它看起来像class的生命周期...但真的是这样吗？你发觉自己在问类似下面的这些问题：

* 🤔 如何用`useEffect`模拟`componentDidMount`生命周期？
* 🤔 如何正确地在`useEffect`里请求数据？`[]`又是什么？
* 🤔 我应该把函数当做effect的依赖吗？
* 🤔 为什么有时候会出现无限重复请求的问题？
* 🤔 为什么有时候在effect里拿到的是旧的state或prop呢？

当我刚开始使用Hooks的时候，我也同样被上面这些问题所困扰。甚至当我写最初的文档时，我也并没有扎实地掌握某些细节。我经历了一些“啊哈”的开窍时刻，我想把这些分享给你。**这篇深入讲解的文章会帮你明白上面问题的答案。**

在看答案之前，我需要先往后退一步。这篇文章的目的不是给你一个要点清单，而是想帮你真正地领会`useEffect`。其实并没有太多需要学习的，事实上，我们会花很多时间试图忘记某些已习得的概念（unlearning）上。 

**恰恰当我不再透过熟悉的class生命周期方法去窥视`useEffect` 这个Hook的时候，我才得以融会贯通。**

>“忘记你已经学到的。” — Yoda

![Yoda sniffing the air. Caption: “I smell bacon.”](./yoda.jpg)

---

**这篇文章会假设你对[`useEffect`](https://reactjs.org/docs/hooks-effect.html) API有了一定程度的了解。**

**这篇文章真的很长。它更像一本mini书，这也是我更喜欢的形式。如果你很匆忙或者并不是太关心本文主题的话你也可以直接看下面的摘要。**

**如果你对于深入研究感觉不是很适应的话，你或许可以等下面这些解释出现在其他地方再去了解。就像2013年React刚出世的时候，大家需要时间去认识理解一种不同的心智模型，知识也需要时间普及。**

---

## 摘要

如果你不想阅读整篇文章，可以快速浏览这份摘要。要是某些部分不容易理解，你可以往下滚动寻找相关的内容去阅读。

如果你打算阅读整篇文章，你完全可以跳过这部分。我会在文章末尾附上摘要的链接。

**🤔 Question: 如何用`useEffect`模拟`componentDidMount`生命周期？**

虽然可以使用`useEffect(fn, [])`，但它们并不完全相等。和`componentDidMount`不一样，`useEffect`会*捕获* props和state。所以即便在回调函数里，你拿到的还是初始的props和state。如果你想得到“最新”的值，你可以使用ref。不过，通常有更简单的实现方式去组织你的代码，所以你并不一定要用ref。记住，effects的心智模型和`componentDidMount`以及其他生命周期是不同的，试图找到它们之间完全一致的表达反而更容易使你混淆。想要更有效，你需要“thin in effects”，它的心智模型更接近于实现状态同步，而不是响应生命周期事件。


**🤔 Question: 如何正确地在`useEffect`里请求数据？`[]`又是什么？**

[这篇文章](https://www.robinwieruch.de/react-hooks-fetch-data/) 是很好的入门，介绍了如何在`useEffect`里做数据请求。请务必读完它！它没有我的这篇这么长。`[]`表示effect没有使用任何React数据流里的值，因此该effect仅被调用一次是安全的。`[]`同样也是一类常见问题的来源，也即你以为没使用数据流里的值但其实使用了。你需要学习一些策略（主要是`useReducer` 和 `useCallback`）来移除这些effect依赖，而不是错误地忽略它们。

**🤔 Question: 我应该把函数当做effect的依赖吗？**

一般建议把不依赖props和state的函数提到你的组件外面，并且把那些仅被effect使用的函数放到effect里面。如果这样做了以后，你的effect还是需要用到组件内的函数（包括通过props传进来的函数），可以在定义它们的地方用`useCallback`包一层。为什么要这样做呢？因为这些函数可以访问到props和state，因此它们会参与到数据流。在我们官网的FAQ有[更详细的答案](https://reactjs.org/docs/hooks-faq.html#is-it-safe-to-omit-functions-from-the-list-of-dependencies)。


**🤔 Question: 为什么有时候会出现无限重复请求的问题？**

这个通常发生于你在effect里做数据请求并且没有设置effect的第二个依赖参数。没有设置依赖，effects会在每次render后执行一次，并且更新状态会引起render并再次触发effects。无限循环的发生也可能是因为你设置的依赖总是会改变。你可以通过一个一个移除的方式排查出哪个依赖导致了问题。但是，移除你使用的依赖（或者盲目地使用`[]`）通常是一种错误的解决方式。你应该做的是解决问题的根源。举个例子，函数可能会导致这个问题，你可以把它们放到effectsli，或者提到组件外面，或者用`useCallback`包一层。为了避免重复生成对象，`useMemo` 可以做类似的事情。


**🤔 为什么有时候在effect里拿到的是旧的state或prop呢？**

Effects拿到的总是定义它的那次render中的props和state。这能够[避免一些bugs](/how-are-function-components-different-from-classes/)，但在一些场景中又会有些讨人嫌。对于这些场景，你可以明确地使用可变的ref保存一些值（上面文章的末尾解释了这一点）。如果你觉得在render中拿到了一些旧的props和state，且不是你想要的，你很可能遗漏了一些依赖。可以尝试使用这个[lint 规则](https://github.com/facebook/react/issues/14920)来训练你发现这些依赖。可能没过几天，这种能力会变得像是你的第二天性一样。同样可以看我们官网FAQ中的[这个回答。](https://reactjs.org/docs/hooks-faq.html#why-am-i-seeing-stale-props-or-state-inside-my-function)

---

我希望这个摘要对你有帮助！要不，我们开始正文。

---

## 每一次渲染都有它自己的 Props and State

在我们讨论effects之前，我们需要先讨论一下渲染（rendering）。

我们来看一个计数器组件Counter，注意高亮的那一行：

```jsx{6}
function Counter() {
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

高亮的代码究竟是什么意思呢？`count` 会“监听”状态的变化并自动更新吗？这么想可能是学习React的时候有用的第一直觉，但它并不是[精确的心智模型](https://overreacted.io/react-as-a-ui-runtime/)。

**上面例子中，`count`仅是一个数字而已。**它不是神奇的“data binding”, “watcher”, “proxy”，或者其他任何东西。它就是一个普通的数字像下面这个一样：

```jsx
const count = 42;
// ...
<p>You clicked {count} times</p>
// ...
```

我们的组件第一次渲染的时候，从`useState()`拿到`count`的初始值`0`。当我们调用`setCount(1)`，React会再次渲染组件，这一次`count`是`1`。如此等等：

```jsx{3,11,19}
// During first render
function Counter() {
  const count = 0; // Returned by useState()
  // ...
  <p>You clicked {count} times</p>
  // ...
}

// After a click, our function is called again
function Counter() {
  const count = 1; // Returned by useState()
  // ...
  <p>You clicked {count} times</p>
  // ...
}

// After another click, our function is called again
function Counter() {
  const count = 2; // Returned by useState()
  // ...
  <p>You clicked {count} times</p>
  // ...
}
```

**当我们更新状态的时候，React会重新渲染组件。每一次渲染都能拿到独立的`counter` 状态，这个状态值是函数中的一个常量。**

所以下面的这行代码没有做任何特殊的数据绑定：

```jsx
<p>You clicked {count} times</p>
```

**它仅仅只是在渲染输出中插入了count这个数字。**这个数字由React提供。当`setCount`的时候，React会带着一个不同的`count`值再次调用组件。然后，React会更新DOM以保持和渲染输出一致。

这里关键的点在于任意一次渲染中的`count`常量都不会随着时间改变。渲染输出会变是因为我们的组件被一次次调用，而每一次调用引起的渲染中，它包含的`count`值独立于其他渲染。

*（关于这个过程更深入的探讨可以查看我的另一篇文章[React as a UI Runtime](https://overreacted.io/react-as-a-ui-runtime/)。）*


## 每一次渲染都有它自己的事件处理函数

到目前为止一切都还好。那么事件处理函数呢？

看下面的这个例子。它在三秒后会alert点击次数`count`：

```jsx{4-8,16-18}
function Counter() {
  const [count, setCount] = useState(0);

  function handleAlertClick() {
    setTimeout(() => {
      alert('You clicked on: ' + count);
    }, 3000);
  }

  return (
    <div>
      <p>You clicked {count} times</p>
      <button onClick={() => setCount(count + 1)}>
        Click me
      </button>
      <button onClick={handleAlertClick}>
        Show alert
      </button>
    </div>
  );
}
```

如果我按照下面的步骤去操作：

* **点击增加**counter到3
* **点击一下** “Show alert”
* **点击增加** counter到5并且在定时器回调触发前完成

![Counter demo](./counter.gif)

你猜alert会弹出什么呢？会是5吗？—这个值是alert的时候counter的实时状态。或者会是3吗？—这个值是我点击时候的状态。

----

*剧透预警*

---

来自己 [试试吧！](https://codesandbox.io/s/w2wxl3yo0l)

如果结果和你预料不一样，你可以想象一个更实际的例子：一个聊天应用在state中保存了当前接收者的ID，以及一个发送按钮。
[这篇文章](https://overreacted.io/how-are-function-components-different-from-classes)深入探索了个中缘由。正确的答案就是3。

alert会“捕获”我点击按钮时候的状态。

*（虽然有其他办法可以实现不同的行为，但现在我会专注于这个默认的场景。当我们在构建一种心智模型的时候，在可选的策略中分辨出“最小阻力路径”是非常重要的。）*

---

但它究竟是如何工作的呢？

我们发现`count`在每一次函数调用中都是一个常量值。值得强调的是—**我们的函数每次渲染都会被调用，但是每一次调用中`count`值都是常量，并且它被赋予了当前渲染中的状态值。**

这并不是React特有的，普通的函数也有类似的行为：

```jsx{2}
function sayHi(person) {
  const name = person.name;
  setTimeout(() => {
    alert('Hello, ' + name);
  }, 3000);
}

let someone = {name: 'Dan'};
sayHi(someone);

someone = {name: 'Yuzhi'};
sayHi(someone);

someone = {name: 'Dominic'};
sayHi(someone);
```


在 [这个例子](https://codesandbox.io/s/mm6ww11lk8)中, 外层的`someone`会被赋值很多次（就像在React中，*当前*的组件状态会改变一样）。**然后，在`sayHi`函数中，局部常量`name`会和某次调用中的`person`关联。**因为这个常量是局部的，所以每一次调用都是相互独立的。结果就是，当定时器回调触发的时候，每一个alert都会弹出它拥有的`name`。

这就解释了我们的事件处理函数如何捕获了点击时候的`count`值。如果我们应用相同的替换原理，每一次渲染“看到”的是它自己的`count`：

```jsx{3,15,27}
// During first render
function Counter() {
  const count = 0; // Returned by useState()
  // ...
  function handleAlertClick() {
    setTimeout(() => {
      alert('You clicked on: ' + count);
    }, 3000);
  }
  // ...
}

// After a click, our function is called again
function Counter() {
  const count = 1; // Returned by useState()
  // ...
  function handleAlertClick() {
    setTimeout(() => {
      alert('You clicked on: ' + count);
    }, 3000);
  }
  // ...
}

// After another click, our function is called again
function Counter() {
  const count = 2; // Returned by useState()
  // ...
  function handleAlertClick() {
    setTimeout(() => {
      alert('You clicked on: ' + count);
    }, 3000);
  }
  // ...
}
```
所以实际上，每一次渲染都有一个“新版本”的`handleAlertClick`。每一个版本的`handleAlertClick`“记住” 了它自己的
`count`：

```jsx{6,10,19,23,32,36}
// During first render
function Counter() {
  // ...
  function handleAlertClick() {
    setTimeout(() => {
      alert('You clicked on: ' + 0);
    }, 3000);
  }
  // ...
  <button onClick={handleAlertClick} /> // The one with 0 inside
  // ...
}

// After a click, our function is called again
function Counter() {
  // ...
  function handleAlertClick() {
    setTimeout(() => {
      alert('You clicked on: ' + 1);
    }, 3000);
  }
  // ...
  <button onClick={handleAlertClick} /> // The one with 1 inside
  // ...
}

// After another click, our function is called again
function Counter() {
  // ...
  function handleAlertClick() {
    setTimeout(() => {
      alert('You clicked on: ' + 2);
    }, 3000);
  }
  // ...
  <button onClick={handleAlertClick} /> // The one with 2 inside
  // ...
}
```

这就是为什么[在这个demo中](https://codesandbox.io/s/w2wxl3yo0l)中，事件处理函数“属于”一次特定的渲染，当你点击的时候，它会使用那次渲染中`counter`的状态值。

**在任意一次渲染中，props和state是始终保持不变的。**如果props和state在不同的渲染中是相互独立的，那么使用它们的任何值也是独立的（包括事件处理函数）。它们都“属于”一次特定的渲染。即便是事件处理中的异步函数调用“看到”的也是这次渲染中的`count`值。

*备注：上面我将具体的`count`值直接内联到了`handleAlertClick`函数中。这种心智上的替换是安全的因为`count` 值在某次特定渲染中不可能被改变。它被声明成了一个常量并且是一个数字。这样去思考其他类型的值比如对象也同样是安全的，当然需要在我们都同意应该避免直接修改state这个前提下。通过调用`setSomething(newObj)`的方式去生成一个新的对象而不是直接修改它是更好的选择，因为这样能保证之前渲染中的state不会被污染。*

## 每次渲染都有它自己的Effects

这篇文章是关于effects的，但目前我们居然还没有讨论effects! 言归正传，由上面分析得出一个结果，effects其实并没有什么两样。

让我们回到[官网文档](https://reactjs.org/docs/hooks-effect.html)中的这个例子：

```jsx{4-6}
function Counter() {
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

**抛一个问题给你：effect是如何读取到最新的`count` 状态值的呢？**

也许，是某种“data binding”或“watching”机制使得`count`能够在effect函数内更新？也或许`count`是一个可变的值，React会在我们组件内部修改它以使我们的effect函数总能拿到最新的值？

都不是。

我们已经知道`count`是某个特定渲染中的常量。事件处理函数“看到”的是属于它那次特定渲染中的`count`状态值。对于effects也同样如此：

**并不是`count`的值在“不变”的effect中发生了改变，而是_effect 函数本身_在每一次渲染中都不相同。**

每一个effect版本“看到”的`count`值都来自于它属于的那次渲染：

```jsx{5-8,17-20,29-32}
// During first render
function Counter() {
  // ...
  useEffect(
    // Effect function from first render
    () => {
      document.title = `You clicked ${0} times`;
    }
  );
  // ...
}

// After a click, our function is called again
function Counter() {
  // ...
  useEffect(
    // Effect function from second render
    () => {
      document.title = `You clicked ${1} times`;
    }
  );
  // ...
}

// After another click, our function is called again
function Counter() {
  // ...
  useEffect(
    // Effect function from third render
    () => {
      document.title = `You clicked ${2} times`;
    }
  );
  // ..
}
```

React会记住你提供的effect函数，并且会在每次更改作用于DOM之后调用它，然后让浏览器去绘制屏幕。

所以虽然我们说的是一个 *effect*（这里指更新document的title），但其实每次渲染都是一个*不同的函数*—并且每个effect函数“看到”的props和state都来自于它属于的那次特定渲染。

**概念上，你可以想象effects是渲染结果的一部分。**

严格地说，它们并不是（为了[允许Hook的组合](https://overreacted.io/why-do-hooks-rely-on-call-order/)并且不引入笨拙的语法或者运行时）。但是在我们构建的心智模型上，effect函数*属于*某个特定的渲染，就像事件处理函数一样。

---

为了确保我们已经有了扎实的理解，我们再回顾一下第一次渲染过程：

* **React:** 给我状态为 `0`时候的UI。
* **你的组件:**
  * 给你需要渲染的内容:
  `<p>You clicked 0 times</p>`。
  * 记得在渲染完了之后调用这个effect: `() => { document.title = 'You clicked 0 times' }`。
* **React:** 没问题。开始更新UI，喂浏览器，我要给DOM添加一些东西。
* **浏览器:** 酷，我已经把它绘制到屏幕上了。
* **React:** 好的, 我现在开始跑给我的effect
  * 运行 `() => { document.title = 'You clicked 0 times' }`。

---

现在我们回顾一下我们点击之后发生了什么：

* **你的组件:** 喂 React, 把我的状态设置为`1`.
* **React:** 给我状态为 `1`时候的UI。
* **Your component:**
  * 给你需要渲染的内容:
  `<p>You clicked 1 times</p>`.
  * 记得在渲染完了之后调用这个effect： `() => { document.title = 'You clicked 1 times' }`。
* **React:** 没问题。开始更新UI，喂浏览器，我修改了DOM。
* **Browser:** 酷，我已经将更改绘制到屏幕上了。
* **React:** 好的, 我现在开始跑属于这次渲染的effect
  * 运行 `() => { document.title = 'You clicked 1 times' }`。

---

## 每一次渲染都有它自己的...所有

**我们现在知道effects会再每次渲染后运行，并且概念上它是组件输出的一部分，可以“看到”属于某次特定渲染的props和state。**

我们来做一个思想实验，思考下面的代码：

```jsx{4-8}
function Counter() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    setTimeout(() => {
      console.log(`You clicked ${count} times`);
    }, 3000);
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

如果我点击了很多次并且在effect里设置了延时，打印出来的结果会是什么呢？

---

*剧透预警*

---

你可能会认为这是一个很绕的题并且结果是反直觉的。完全错了！我们看到的就是顺序的打印输出—每一个都属于某次特定的渲染，因此有它该有的`count`值。你可以[自己试一试](https://codesandbox.io/s/lyx20m1ol)：


![1, 2, 3, 4, 5 顺序打印](./timeout_counter.gif)

你可能会想：“它当然应该是这样的。否则还会怎么样呢？”

不过，class中的`this.state`并不是这样运作的。你可能会想当然以为下面的[class 实现](https://codesandbox.io/s/kkymzwjqz3)和上面是相等的：

```jsx
  componentDidUpdate() {
    setTimeout(() => {
      console.log(`You clicked ${this.state.count} times`);
    }, 3000);
  }
```

然而，`this.state.count`总是指向*最新*的count值，而不是属于某次特定渲染的值。所以你会看到每次打印输出都是`5`：

![5, 5, 5, 5, 5 打印输出](./timeout_counter_class.gif)

我觉得Hooks这么依赖Javascript闭包是挺讽刺的一件事。有时候组件的class实现方式会受到闭包相关的苦[the canonical wrong-value-in-a-timeout confusion](https://wsvincent.com/javascript-closure-settimeout-for-loop/)，但其实这个例子中真正的混乱来源是可变数据（React 修改了class中的`this.state`使其指向最新状态），并不是闭包本身的错。

**当封闭的值始终不会变的情况下闭包是非常棒的。这使它们非常容易思考因为你本质上在引用常量。**正如我们所讨论的，props和state在某个特定渲染中是不会改变的。顺便说一下，我们可以[使用闭包](https://codesandbox.io/s/w7vjo07055)修复上面的class版本...

## 逆潮而动

到目前为止，我们可以明确地喊出下面重要的事实：**每一个**组件内的函数（包括事件处理函数，effects，定时器或者API调用等等）会捕获某次渲染调用中定义的props和state。

所以下面的两个例子是相等的：

```jsx{4}
function Example(props) {
  useEffect(() => {
    setTimeout(() => {
      console.log(props.counter);
    }, 1000);
  });
  // ...
}
```

```jsx{2,5}
function Example(props) {
  const counter = props.counter;
  useEffect(() => {
    setTimeout(() => {
      console.log(counter);
    }, 1000);
  });
  // ...
}
```

**在组件内什么时候去读取props或者state是无关紧要的。**因为它们不会改变。在单次渲染的范围内，props和state始终保持不变。（解构赋值的props使得这一点更明显。）

当然，有时候，你可能*想*在effect的回调函数里读取最新的值而不是捕获的值。最简单的实现方法是使用refs，[这篇文章](https://overreacted.io/how-are-function-components-different-from-classes/)的最后一部分介绍了相关内容。

需要注意的是当你想要从*过去*渲染中的函数里读取*未来*的props和state，你是在逆潮而动。虽然它并没有*错*（有时候可能也需要这样做），但它因为打破了范式会使代码显得不够“干净”。这是我们有意为之的因为它能帮助突出哪些代码是脆弱的，是需要依赖时间次序的。在class中，如果发生这种情况就没那么显而易见了。

下面这个 [计数器版本](https://codesandbox.io/s/rm7z22qnlp) 模拟了class中的行为：

```jsx{3,6-7,9-10}
function Example() {
  const [count, setCount] = useState(0);
  const latestCount = useRef(count);

  useEffect(() => {
    // Set the mutable latest value
    latestCount.current = count;
    setTimeout(() => {
      // Read the mutable latest value
      console.log(`You clicked ${latestCount.current} times`);
    }, 3000);
  });
  // ...
```

![5, 5, 5, 5, 5 打印输出](./timeout_counter_refs.gif)

在React中去直接修改值看上去有点怪异。然而，在class组件中React正是这样去修改`this.state`的。不像捕获的props和state，你没法保证在任意一个回调函数中读取的`latestCount.current`是不变的。根据定义，你可以随时修改它。这就是为什么它不是默认行为，而是需要你主动选择这样做。

## 那Effect中的清理又是怎样的呢？

像 [文档中解释的](https://reactjs.org/docs/hooks-effect.html#effects-with-cleanup), 有些 effects 可能需要有一个清理步骤. 本质上，它的目的是消除副作用（effect)，比如取消订阅。

思考下面的代码:

```jsx
  useEffect(() => {
    ChatAPI.subscribeToFriendStatus(props.id, handleStatusChange);
    return () => {
      ChatAPI.unsubscribeFromFriendStatus(props.id, handleStatusChange);
    };
  });
```

Say `props` is `{id: 10}` on the first render, and `{id: 20}` on the second render. You *might* think that something like this happens:

* React cleans up the effect for `{id: 10}`.
* React renders UI for `{id: 20}`.
* React runs the effect for `{id: 20}`.

(This is not quite the case.)

With this mental model, you might think the cleanup “sees” the old props because it runs before we re-render, and then the new effect “sees” the new props because it runs after the re-render. That’s the mental model lifted directly from the class lifecycles, and **it’s not accurate here**. Let’s see why.

React only runs the effects after [letting the browser paint](https://medium.com/@dan_abramov/this-benchmark-is-indeed-flawed-c3d6b5b6f97f). This makes your app faster as most effects don’t need to block screen updates. Effect cleanup is also delayed. **The previous effect is cleaned up _after_ the re-render with new props:**

* **React renders UI for `{id: 20}`.**
* The browser paints. We see the UI for `{id: 20}` on the screen.
* **React cleans up the effect for `{id: 10}`.**
* React runs the effect for `{id: 20}`.

You might be wondering: but how can the cleanup of the previous effect still “see” the old `{id: 10}` props if it runs *after* the props change to `{id: 20}`?

We’ve been here before... 🤔

![Deja vu (cat scene from the Matrix movie)](./deja_vu.gif)

Quoting the previous section:

>Every function inside the component render (including event handlers, effects, timeouts or API calls inside them) captures the props and state of the render call that defined it.

Now the answer is clear! The effect cleanup doesn’t read the “latest” props, whatever that means. It reads props that belong to the render it’s defined in:

```jsx{8-11}
// First render, props are {id: 10}
function Example() {
  // ...
  useEffect(
    // Effect from first render
    () => {
      ChatAPI.subscribeToFriendStatus(10, handleStatusChange);
      // Cleanup for effect from first render
      return () => {
        ChatAPI.unsubscribeFromFriendStatus(10, handleStatusChange);
      };
    }
  );
  // ...
}

// Next render, props are {id: 20}
function Example() {
  // ...
  useEffect(
    // Effect from second render
    () => {
      ChatAPI.subscribeToFriendStatus(20, handleStatusChange);
      // Cleanup for effect from second render
      return () => {
        ChatAPI.unsubscribeFromFriendStatus(20, handleStatusChange);
      };
    }
  );
  // ...
}
```

Kingdoms will rise and turn into ashes, the Sun will shed its outer layers to be a white dwarf, and the last civilization will end. But nothing will make the props “seen” by the first render effect’s cleanup anything other than `{id: 10}`.

That’s what allows React to deal with effects right after painting — and make your apps faster by default. The old props are still there if our code needs them.

## Synchronization, Not Lifecycle

One of my favorite things about React is that it unifies describing the initial render result and the updates. This [reduces the entropy](https://overreacted.io/the-bug-o-notation/) of your program.

Say my component looks like this:

```jsx
function Greeting({ name }) {
  return (
    <h1 className="Greeting">
      Hello, {name}
    </h1>
  );
}
```

It doesn’t matter if I render `<Greeting name="Dan" />` and later `<Greeting name="Yuzhi" />`, or if I just render `<Greeting name="Yuzhi" />`. In the end, we will see “Hello, Yuzhi” in both cases.

People say: “It’s all about the journey, not the destination”. With React, it’s the opposite. **It’s all about the destination, not the journey.** That’s the difference between `$.addClass` and `$.removeClass` calls in jQuery code (our “journey”) and specifying what the CSS class *should be* in React code (our “destination”).

**React synchronizes the DOM according to our current props and state.** There is no distinction between a “mount” or an “update” when rendering.

You should think of effects in a similar way. **`useEffect` lets you _synchronize_ things outside of the React tree according to our props and state.**

```jsx{2-4}
function Greeting({ name }) {
  useEffect(() => {
    document.title = 'Hello, ' + name;
  });
  return (
    <h1 className="Greeting">
      Hello, {name}
    </h1>
  );
}
```

This is subtly different from the familiar *mount/update/unmount* mental model. It is important really to internalize this. **If you’re trying to write an effect that behaves differently depending on whether the component renders for the first time or not, you’re swimming against the tide!** We’re failing at synchronizing if our result depends on the “journey” rather than the “destination”.

It shouldn’t matter whether we rendered with props A, B, and C, or if we rendered with C immediately. While there may be some temporary differences (e.g. while we’re fetching data), eventually the end result should be the same.

Still, of course running all effects on *every* render might not be efficient. (And in some cases, it would lead to infinite loops.)

So how can we fix this?

## Teaching React to Diff Your Effects

We’ve already learned that lesson with the DOM itself. Instead of touching it on every re-render, React only updates the parts of the DOM that actually change.

When you’re updating

```jsx
<h1 className="Greeting">
  Hello, Dan
</h1>
```

to

```jsx
<h1 className="Greeting">
  Hello, Yuzhi
</h1>
```

React sees two objects:

```jsx
const oldProps = {className: 'Greeting', children: 'Hello, Dan'};
const newProps = {className: 'Greeting', children: 'Hello, Yuzhi'};
```

It goes over each of their props and determine that `children` have changed and need a DOM update, but `className` did not. So it can just do:

```jsx
domNode.innerText = 'Hello, Yuzhi';
// No need to touch domNode.className
```

**Could we do something like this with effects too? It would be nice to avoid re-running them when applying the effect is unnecessary.**

For example, maybe our component re-renders because of a state change:

```jsx{11-13}
function Greeting({ name }) {
  const [counter, setCounter] = useState(0);

  useEffect(() => {
    document.title = 'Hello, ' + name;
  });

  return (
    <h1 className="Greeting">
      Hello, {name}
      <button onClick={() => setCounter(count + 1)}>
        Increment
      </button>
    </h1>
  );
}
```

But our effect doesn’t use the `counter` state. **Our effect synchronizes the `document.title` with the `name` prop, but the `name` prop is the same.** Re-assigning `document.title` on every counter change seems non-ideal.

OK, so can React just... diff effects?


```jsx
let oldEffect = () => { document.title = 'Hello, Dan'; };
let newEffect = () => { document.title = 'Hello, Dan'; };
// Can React see these functions do the same thing?
```

Not really. React can’t guess what the function does without calling it. (The source doesn’t really contain specific values, it just closes over the `name` prop.)

This is why if you want to avoid re-running effects unnecessarily, you can provide a dependency array (also known as “deps”) argument to `useEffect`:

```jsx{3}
  useEffect(() => {
    document.title = 'Hello, ' + name;
  }, [name]); // Our deps
```

**It’s like if we told React: “Hey, I know you can’t see _inside_ this function, but I promise it only uses `name` and nothing else from the render scope.”**

If each of these values is the same between the current and the previous time this effect ran, there’s nothing to synchronize so React can skip the effect:

```jsx
const oldEffect = () => { document.title = 'Hello, Dan'; };
const oldDeps = ['Dan'];

const newEffect = () => { document.title = 'Hello, Dan'; };
const newDeps = ['Dan'];

// React can't peek inside of functions, but it can compare deps.
// Since all deps are the same, it doesn’t need to run the new effect.
```

If even one of the values in the dependency array is different between renders, we know running the effect can’t be skipped. Synchronize all the things!

## Don’t Lie to React About Dependencies

Lying to React about dependencies has bad consequences. Intuitively, this makes sense, but I’ve seen pretty much everyone who tries `useEffect` with a mental model from classes try to cheat the rules. (And I did that too at first!)

```jsx
function SearchResults() {
  async function fetchData() {
    // ...
  }

  useEffect(() => {
    fetchData();
  }, []); // Is this okay? Not always -- and there's a better way to write it.

  // ...
}
```

*(The [Hooks FAQ](https://reactjs.org/docs/hooks-faq.html#is-it-safe-to-omit-functions-from-the-list-of-dependencies) explains what to do instead. We'll come back to this example [below](#moving-functions-inside-effects).)*

“But I only want to run it on mount!”, you’ll say. For now, remember: if you specify deps, **_all_ values from inside your component that are used by the effect _must_ be there**. Including props, state, functions — anything in your component.

Sometimes when you do that, it causes a problem. For example, maybe you see an infinite refetching loop, or a socket is recreated too often. **The solution to that problem is _not_ to remove a dependency.** We’ll look at the solutions soon.

But before we jump to solutions, let’s understand the problem better.

## What Happens When Dependencies Lie

If deps contain every value used by the effect, React knows when to re-run it:

```jsx{3}
  useEffect(() => {
    document.title = 'Hello, ' + name;
  }, [name]);
```

![Diagram of effects replacing one another](./deps-compare-correct.gif)

*(Dependencies are different, so we re-run the effect.)*

But if we specified `[]` for this effect, the new effect function wouldn’t run:

```jsx{3}
  useEffect(() => {
    document.title = 'Hello, ' + name;
  }, []); // Wrong: name is missing in deps
```

![Diagram of effects replacing one another](./deps-compare-wrong.gif)

*(Dependencies are equal, so we skip the effect.)*

In this case the problem might seem obvious. But the intuition can fool you in other cases where a class solution “jumps out” from your memory.

For example, let’s say we’re writing a counter that increments every second. With a class, our intuition is: “Set up the interval once and destroy it once”. Here’s an [example](https://codesandbox.io/s/n5mjzjy9kl) of how we can do it. When we mentally translate this code to `useEffect`, we instinctively add `[]` to the deps. “I want it to run once”, right?

```jsx{9}
function Counter() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setCount(count + 1);
    }, 1000);
    return () => clearInterval(id);
  }, []);

  return <h1>{count}</h1>;
}
```

However, this example [only *increments* once](https://codesandbox.io/s/91n5z8jo7r). *Oops.*

If your mental model is “dependencies let me specify when I want to re-trigger the effect”, this example might give you an existential crisis. You *want* to trigger it once because it’s an interval — so why is it causing issues?

However, this makes sense if you know that dependencies are our hint to React about *everything* that the effect uses from the render scope. It uses `count` but we lied that it doesn’t with `[]`. It’s only a matter of time before this bites us!

In the first render, `count` is `0`. Therefore, `setCount(count + 1)` in the first render’s effect means `setCount(0 + 1)`. **Since we never re-run the effect because of `[]` deps, it will keep calling `setCount(0 + 1)` every second:**

```jsx{8,12,21-22}
// First render, state is 0
function Counter() {
  // ...
  useEffect(
    // Effect from first render
    () => {
      const id = setInterval(() => {
        setCount(0 + 1); // Always setCount(1)
      }, 1000);
      return () => clearInterval(id);
    },
    [] // Never re-runs
  );
  // ...
}

// Every next render, state is 1
function Counter() {
  // ...
  useEffect(
    // This effect is always ignored because
    // we lied to React about empty deps.
    () => {
      const id = setInterval(() => {
        setCount(1 + 1);
      }, 1000);
      return () => clearInterval(id);
    },
    []
  );
  // ...
}
```

We lied to React by saying our effect doesn’t depend on a value from inside our component, when in fact it does!

Our effect uses `count` — a value inside the component (but outside the effect):

```jsx{1,5}
  const count = // ...

  useEffect(() => {
    const id = setInterval(() => {
      setCount(count + 1);
    }, 1000);
    return () => clearInterval(id);
  }, []);
```

Therefore, specifying `[]` as a dependency will create a bug. React will compare the dependencies, and skip updating this effect:

![Diagram of stale interval closure](./interval-wrong.gif)

*(Dependencies are equal, so we skip the effect.)*

Issues like this are difficult to think about. Therefore, I encourage you to adopt it as a hard rule to always be honest about the effect dependencies, and specify them all. (We provide a [lint rule](https://github.com/facebook/react/issues/14920) if you want to enforce this on your team.)

## Two Ways to Be Honest About Dependencies

There are two strategies to be honest about dependencies. You should generally start with the first one, and then apply the second one if needed.

**The first strategy is to fix the dependency array to include _all_ the values inside the component that are used inside the effect.** Let’s include `count` as a dep:

```jsx{3,6}
useEffect(() => {
  const id = setInterval(() => {
    setCount(count + 1);
  }, 1000);
  return () => clearInterval(id);
}, [count]);
```

This makes the dependency array correct. It may not be *ideal* but that’s the first issue we needed to fix. Now a change to `count` will re-run the effect, with each next interval referencing `count` from its render in `setCount(count + 1)`:

```jsx{8,12,24,28}
// First render, state is 0
function Counter() {
  // ...
  useEffect(
    // Effect from first render
    () => {
      const id = setInterval(() => {
        setCount(0 + 1); // setCount(count + 1)
      }, 1000);
      return () => clearInterval(id);
    },
    [0] // [count]
  );
  // ...
}

// Second render, state is 1
function Counter() {
  // ...
  useEffect(
    // Effect from second render
    () => {
      const id = setInterval(() => {
        setCount(1 + 1); // setCount(count + 1)
      }, 1000);
      return () => clearInterval(id);
    },
    [1] // [count]
  );
  // ...
}
```

That would [fix the problem](https://codesandbox.io/s/0x0mnlyq8l) but our interval would be cleared and set again whenever the `count` changes. That may be undesirable:

![Diagram of interval that re-subscribes](./interval-rightish.gif)

*(Dependencies are different, so we re-run the effect.)*

---

**The second strategy is to change our effect code so that it wouldn’t *need* a value that changes more often than we want.** We don’t want to lie about the dependencies — we just want to change our effect to have *fewer* of them.

Let’s look at a few common techniques for removing dependencies.

---

## Making Effects Self-Sufficient

We want to get rid of the `count` dependency in our effect.

```jsx{3,6}
  useEffect(() => {
    const id = setInterval(() => {
      setCount(count + 1);
    }, 1000);
    return () => clearInterval(id);
  }, [count]);
```

To do this, we need to ask ourselves: **what are we using `count` for?** It seems like we only use it for the `setCount` call. In that case, we don’t actually need `count` in the scope at all. When we want to update state based on the previous state, we can use the [functional updater form](https://reactjs.org/docs/hooks-reference.html#functional-updates) of `setState`:

```jsx{3}
  useEffect(() => {
    const id = setInterval(() => {
      setCount(c => c + 1);
    }, 1000);
    return () => clearInterval(id);
  }, []);
```

I like to think of these cases as “false dependencies”. Yes, `count` was a necessary dependency because we wrote `setCount(count + 1)` inside the effect. However, we only truly needed `count` to transform it into `count + 1` and “send it back” to React. But React *already knows* the current `count`. **All we needed to tell React is to increment the state — whatever it is right now.**

That’s exactly what `setCount(c => c + 1)` does. You can think of it as “sending an instruction” to React about how the state should change. This “updater form” also helps in other cases, like when you [batch multiple updates](/react-as-a-ui-runtime/#batching).

**Note that we actually _did the work_ to remove the dependency. We didn’t cheat. Our effect doesn’t read the `counter` value from the render scope anymore:**

![Diagram of interval that works](./interval-right.gif)

*(Dependencies are equal, so we skip the effect.)*

You can try it [here](https://codesandbox.io/s/q3181xz1pj).

Even though this effect only runs once, the interval callback that belongs to the first render is perfectly capable of sending the `c => c + 1` update instruction every time the interval fires. It doesn’t need to know the current `counter` state anymore. React already knows it.

## Functional Updates and Google Docs

Remember how we talked about synchronization being the mental model for effects? An interesting aspect of synchronization is that you often want to keep the “messages” between the systems untangled from their state. For example, editing a document in Google Docs doesn’t actually send the *whole* page to the server. That would be very inefficient. Instead, it sends a representation of what the user tried to do.

While our use case is different, a similar philosophy applies to effects. **It helps to send only the minimal necessary information from inside the effects into a component.** The updater form like `setCount(c => c + 1)` conveys strictly less information than `setCount(count + 1)` because it isn’t “tainted” by the current count. It only expresses the action (“incrementing”). Thinking in React involves [finding the minimal state](https://reactjs.org/docs/thinking-in-react.html#step-3-identify-the-minimal-but-complete-representation-of-ui-state). This is the same principle, but for updates.

Encoding the *intent* (rather than the result) is similar to how Google Docs [solves](https://medium.com/@srijancse/how-real-time-collaborative-editing-work-operational-transformation-ac4902d75682) collaborative editing. While this is stretching the analogy, functional updates serve a similar role in React. They ensure updates from multiple sources (event handlers, effect subscriptions, etc) can be correctly applied in a batch and in a predictable way.

**However, even `setCount(c => c + 1)` isn’t that great.** It looks a bit weird and it’s very limited in what it can do. For example, if we had two state variables whose values depend on each other, or if we needed to calculate the next state based on a prop, it wouldn’t help us. Luckily, `setCount(c => c + 1)` has a more powerful sister pattern. Its name is `useReducer`.

## Decoupling Updates from Actions

Let’s modify the previous example to have two state variables: `count` and `step`. Our interval will increment the count by the value of the `step` input:

```jsx{7,10}
function Counter() {
  const [count, setCount] = useState(0);
  const [step, setStep] = useState(1);

  useEffect(() => {
    const id = setInterval(() => {
      setCount(c => c + step);
    }, 1000);
    return () => clearInterval(id);
  }, [step]);

  return (
    <>
      <h1>{count}</h1>
      <input value={step} onChange={e => setStep(Number(e.target.value))} />
    </>
  );
}
```

(Here’s a [demo](https://codesandbox.io/s/zxn70rnkx).)

Note that **we’re not cheating**. Since I started using `step` inside the effect, I added it to the dependencies. And that’s why the code runs correctly.

The current behavior in this example is that changing the `step` restarts the interval — because it’s one of the dependencies. And in many cases, that is exactly what you want! There’s nothing wrong with tearing down an effect and setting it up anew, and we shouldn’t avoid that unless we have a good reason.

However, let’s say we want the interval clock to not reset on changes to the `step`. How do we remove the `step` dependency from our effect?

**When setting a state variable depends on the current value of another state variable, you might want to try replacing them both with `useReducer`.**

When you find yourself writing `setSomething(something => ...)`, it’s a good time to consider using a reducer instead. A reducer lets you **decouple expressing the “actions” that happened in your component from how the state updates in response to them**.

Let’s trade the `step` dependency for a `dispatch` dependency in our effect:

```jsx{1,6,9}
const [state, dispatch] = useReducer(reducer, initialState);
const { count, step } = state;

useEffect(() => {
  const id = setInterval(() => {
    dispatch({ type: 'tick' }); // Instead of setCount(c => c + step);
  }, 1000);
  return () => clearInterval(id);
}, [dispatch]);
```

(See the [demo](https://codesandbox.io/s/xzr480k0np).)

You might ask me: “How is this any better?” The answer is that **React guarantees the `dispatch` function to be constant throughout the component lifetime. So the example above doesn’t ever need to resubscribe the interval.**

We solved our problem!

*(You may omit `dispatch`, `setState`, and `useRef` container values from the deps because React guarantees them to be static. But it also doesn’t hurt to specify them.)*

Instead of reading the state *inside* an effect, it dispatches an *action* that encodes the information about *what happened*. This allows our effect to stay decoupled from the `step` state. Our effect doesn’t care *how* we update the state, it just tells us about *what happened*. And the reducer centralizes the update logic:

```jsx{8,9}
const initialState = {
  count: 0,
  step: 1,
};

function reducer(state, action) {
  const { count, step } = state;
  if (action.type === 'tick') {
    return { count: count + step, step };
  } else if (action.type === 'step') {
    return { count, step: action.step };
  } else {
    throw new Error();
  }
}
```

(Here’s a [demo](https://codesandbox.io/s/xzr480k0np) if you missed it earlier).

## Why useReducer Is the Cheat Mode of Hooks

We’ve seen how to remove dependencies when an effect needs to set state based on previous state, or on another state variable. **But what if we need _props_ to calculate the next state?** For example, maybe our API is `<Counter step={1} />`. Surely, in this case we can’t avoid specifying `props.step` as a dependency?

In fact, we can! We can put *the reducer itself* inside our component to read props:

```jsx{1,6}
function Counter({ step }) {
  const [count, dispatch] = useReducer(reducer, 0);

  function reducer(state, action) {
    if (action.type === 'tick') {
      return state + step;
    } else {
      throw new Error();
    }
  }

  useEffect(() => {
    const id = setInterval(() => {
      dispatch({ type: 'tick' });
    }, 1000);
    return () => clearInterval(id);
  }, [dispatch]);

  return <h1>{count}</h1>;
}
```

This pattern disables a few optimizations so try not to use it everywhere, but you can totally access props from a reducer if you need to. (Here’s a [demo](https://codesandbox.io/s/7ypm405o8q).)

**Even in that case, `dispatch` identity is still guaranteed to be stable between re-renders.** So you may omit it from the effect deps if you want. It’s not going to cause the effect to re-run.

You may be wondering: how can this possibly work? How can the reducer “know” props when called from inside an effect that belongs to another render? The answer is that when you `dispatch`, React just remembers the action — but it will *call* your reducer during the next render. At that point the fresh props will be in scope, and you won’t be inside an effect.

**This is why I like to think of `useReducer` as the “cheat mode” of Hooks. It lets me decouple the update logic from describing what happened. This, in turn, helps me remove unnecessary dependencies from my effects and avoid re-running them more often than necessary.**

## Moving Functions Inside Effects

A common mistake is to think functions shouldn’t be dependencies. For example, this seems like it could work:

```jsx{13}
function SearchResults() {
  const [data, setData] = useState({ hits: [] });

  async function fetchData() {
    const result = await axios(
      'https://hn.algolia.com/api/v1/search?query=react',
    );
    setData(result.data);
  }

  useEffect(() => {
    fetchData();
  }, []); // Is this okay?

  // ...
```

*([This example](https://codesandbox.io/s/8j4ykjyv0) is adapted from a great article by Robin Wieruch — [check it out](https://www.robinwieruch.de/react-hooks-fetch-data/)!)*

And to be clear, this code *does* work. **But the problem with simply omitting local functions is that it gets pretty hard to tell whether we’re handling all cases as the component grows!**

Imagine our code was split like this and each function was five times larger:

```jsx
function SearchResults() {
  // Imagine this function is long
  function getFetchUrl() {
    return 'https://hn.algolia.com/api/v1/search?query=react';
  }

  // Imagine this function is also long
  async function fetchData() {
    const result = await axios(getFetchUrl());
    setData(result.data);
  }

  useEffect(() => {
    fetchData();
  }, []);

  // ...
}
```


Now let’s say we later use some state or prop in one of these functions:

```jsx{6}
function SearchResults() {
  const [query, setQuery] = useState('react');

  // Imagine this function is also long
  function getFetchUrl() {
    return 'https://hn.algolia.com/api/v1/search?query=' + query;
  }

  // Imagine this function is also long
  async function fetchData() {
    const result = await axios(getFetchUrl());
    setData(result.data);
  }

  useEffect(() => {
    fetchData();
  }, []);

  // ...
}
```

If we forget to update the deps of any effects that call these functions (possibly, through other functions!), our effects will fail to synchronize changes from our props and state. This doesn’t sound great.

Luckily, there is an easy solution to this problem. **If you only use some functions *inside* an effect, move them directly *into* that effect:**

```jsx{4-12}
function SearchResults() {
  // ...
  useEffect(() => {
    // We moved these functions inside!
    function getFetchUrl() {
      return 'https://hn.algolia.com/api/v1/search?query=react';
    }

    async function fetchData() {
      const result = await axios(getFetchUrl());
      setData(result.data);
    }

    fetchData();
  }, []); // ✅ Deps are OK
  // ...
}
```

([Here’s a demo](https://codesandbox.io/s/04kp3jwwql).)

So what is the benefit? We no longer have to think about the “transitive dependencies”. Our dependencies array isn’t lying anymore: **we truly _aren’t_ using anything from the outer scope of the component in our effect**.

If we later edit `getFetchUrl` to use the `query` state, we’re much more likely to notice that we’re editing it *inside* an effect — and therefore, we need to add `query` to the effect dependencies:

```jsx{6,15}
function SearchResults() {
  const [query, setQuery] = useState('react');

  useEffect(() => {
    function getFetchUrl() {
      return 'https://hn.algolia.com/api/v1/search?query=' + query;
    }

    async function fetchData() {
      const result = await axios(getFetchUrl());
      setData(result.data);
    }

    fetchData();
  }, [query]); // ✅ Deps are OK

  // ...
}
```

(Here’s a [demo](https://codesandbox.io/s/pwm32zx7z7).)

By adding this dependency, we’re not just “appeasing React”. It *makes sense* to refetch the data when the query changes. **The design of `useEffect` forces you to notice the change in our data flow and choose how our effects should synchronize it — instead of ignoring it until our product users hit a bug.**

Thanks to the `exhaustive-deps` lint rule from the `eslint-plugin-react-hooks` plugin, you can [analyze the effects as you type in your editor](https://github.com/facebook/react/issues/14920) and receive suggestions about which dependencies are missing. In other words, a machine can tell you which data flow changes aren’t handled correctly by a component.

![Lint rule gif](./exhaustive-deps.gif)

Pretty sweet.

## But I Can’t Put This Function Inside an Effect

Sometimes you might not want to move a function *inside* an effect. For example, several effects in the same component may call the same function, and you don’t want to copy and paste its logic. Or maybe it’s a prop.

Should you skip a function like this in the effect dependencies? I think not. Again, **effects shouldn’t lie about their dependencies.** There are usually better solutions. A common misconception is that “a function would never change”. But as we learned throughout this article, this couldn’t be further from truth. Indeed, a function defined inside a component changes on every render!

**That by itself presents a problem.** Say two effects call `getFetchUrl`:

```jsx
function SearchResults() {
  function getFetchUrl(query) {
    return 'https://hn.algolia.com/api/v1/search?query=' + query;
  }

  useEffect(() => {
    const url = getFetchUrl('react');
    // ... Fetch data and do something ...
  }, []); // 🔴 Missing dep: getFetchUrl

  useEffect(() => {
    const url = getFetchUrl('redux');
    // ... Fetch data and do something ...
  }, []); // 🔴 Missing dep: getFetchUrl

  // ...
}
```

In that case you might not want to move `getFetchUrl` inside either of the effects since you wouldn’t be able to share the logic.

On the other hand, if you’re “honest” about the effect dependencies, you may run into a problem. Since both our effects depend on `getFetchUrl` **(which is different on every render)**, our dependency arrays are useless:

```jsx{2-5}
function SearchResults() {
  // 🔴 Re-triggers all effects on every render
  function getFetchUrl(query) {
    return 'https://hn.algolia.com/api/v1/search?query=' + query;
  }

  useEffect(() => {
    const url = getFetchUrl('react');
    // ... Fetch data and do something ...
  }, [getFetchUrl]); // 🚧 Deps are correct but they change too often

  useEffect(() => {
    const url = getFetchUrl('redux');
    // ... Fetch data and do something ...
  }, [getFetchUrl]); // 🚧 Deps are correct but they change too often

  // ...
}
```

A tempting solution to this is to just skip the `getFetchUrl` function in the deps list. However, I don’t think it’s a good solution. This makes it difficult to notice when we *are* adding a change to the data flow that *needs* to be handled by an effect. This leads to bugs like the “never updating interval” we saw earlier.

Instead, there are two other solutions that are simpler.

**First of all, if a function doesn’t use anything from the component scope, you can hoist it outside the component and then freely use it inside your effects:**

```jsx{1-4}
// ✅ Not affected by the data flow
function getFetchUrl(query) {
  return 'https://hn.algolia.com/api/v1/search?query=' + query;
}

function SearchResults() {
  useEffect(() => {
    const url = getFetchUrl('react');
    // ... Fetch data and do something ...
  }, []); // ✅ Deps are OK

  useEffect(() => {
    const url = getFetchUrl('redux');
    // ... Fetch data and do something ...
  }, []); // ✅ Deps are OK

  // ...
}
```

There’s no need to specify it in deps because it’s not in the render scope and can’t be affected by the data flow. It can’t accidentally depend on props or state.

Alternatively, you can wrap it into the [`useCallback` Hook](https://reactjs.org/docs/hooks-reference.html#usecallback):


```jsx{2-5}
function SearchResults() {
  // ✅ Preserves identity when its own deps are the same
  const getFetchUrl = useCallback((query) => {
    return 'https://hn.algolia.com/api/v1/search?query=' + query;
  }, []);  // ✅ Callback deps are OK

  useEffect(() => {
    const url = getFetchUrl('react');
    // ... Fetch data and do something ...
  }, [getFetchUrl]); // ✅ Effect deps are OK

  useEffect(() => {
    const url = getFetchUrl('redux');
    // ... Fetch data and do something ...
  }, [getFetchUrl]); // ✅ Effect deps are OK

  // ...
}
```

`useCallback` is essentially like adding another layer of dependency checks. It’s solving the problem on the other end — **rather than avoid a function dependency, we make the function itself only change when necessary**.

Let's see why this approach is useful. Previously, our example showed two search results (for `'react'` and `'redux'` search queries). But let's say we want to add an input so that you can search for an arbitrary `query`. So instead of taking `query` as an argument, `getFetchUrl` will now read it from local state.

We'll immediately see that it's missing a `query` dependency:

```jsx{5}
function SearchResults() {
  const [query, setQuery] = useState('react');
  const getFetchUrl = useCallback(() => { // No query argument
    return 'https://hn.algolia.com/api/v1/search?query=' + query;
  }, []); // 🔴 Missing dep: query
  // ...
}
```

If I fix my `useCallback` deps to include `query`, any effect with `getFetchUrl` in deps will re-run whenever the `query` changes:

```jsx{4-7}
function SearchResults() {
  const [query, setQuery] = useState('react');

  // ✅ Preserves identity until query changes
  const getFetchUrl = useCallback(() => {
    return 'https://hn.algolia.com/api/v1/search?query=' + query;
  }, [query]);  // ✅ Callback deps are OK

  useEffect(() => {
    const url = getFetchUrl();
    // ... Fetch data and do something ...
  }, [getFetchUrl]); // ✅ Effect deps are OK

  // ...
}
```

Thanks to `useCallback`, if `query` is the same, `getFetchUrl` also stays the same, and our effect doesn't re-run. But if `query` changes, `getFetchUrl` will also change, and we will re-fetch the data. It's a lot like when you change some cell in an Excel spreadsheet, and the other cells using it recalculate automatically.

This is just a consequence of embracing the data flow and the synchronization mindset. **The same solution works for function props passed from parents:**

```jsx{4-8}
function Parent() {
  const [query, setQuery] = useState('react');

  // ✅ Preserves identity until query changes
  const fetchData = useCallback(() => {
    const url = 'https://hn.algolia.com/api/v1/search?query=' + query;
    // ... Fetch data and return it ...
  }, [query]);  // ✅ Callback deps are OK

  return <Child fetchData={fetchData} />
}

function Child({ fetchData }) {
  let [data, setData] = useState(null);

  useEffect(() => {
    fetchData().then(setData);
  }, [fetchData]); // ✅ Effect deps are OK

  // ...
}
```

Since `fetchData` only changes inside `Parent` when its `query` state changes, our `Child` won’t refetch the data until it’s actually necessary for the app.

## Are Functions Part of the Data Flow?

Interestingly, this pattern is broken with classes in a way that really shows the difference between the effect and lifecycle paradigms. Consider this translation:

```jsx{5-8,18-20}
class Parent extends Component {
  state = {
    query: 'react'
  };
  fetchData = () => {
    const url = 'https://hn.algolia.com/api/v1/search?query=' + this.state.query;
    // ... Fetch data and do something ...
  };
  render() {
    return <Child fetchData={this.fetchData} />;
  }
}

class Child extends Component {
  state = {
    data: null
  };
  componentDidMount() {
    this.props.fetchData();
  }
  render() {
    // ...
  }
}
```

You might be thinking: “Come on Dan, we all know that `useEffect` is like `componentDidMount` and `componentDidUpdate` combined, you can’t keep beating that drum!” **Yet this doesn’t work even with `componentDidUpdate`:**

```jsx{8-13}
class Child extends Component {
  state = {
    data: null
  };
  componentDidMount() {
    this.props.fetchData();
  }
  componentDidUpdate(prevProps) {
    // 🔴 This condition will never be true
    if (this.props.fetchData !== prevProps.fetchData) {
      this.props.fetchData();
    }
  }
  render() {
    // ...
  }
}
```

Of course, `fetchData` is a class method! (Or, rather, a class property — but that doesn’t change anything.) It’s not going to be different because of a state change. So `this.props.fetchData` will stay equal to `prevProps.fetchData` and we’ll never refetch. Let’s just remove this condition then?

```jsx
  componentDidUpdate(prevProps) {
    this.props.fetchData();
  }
```

Oh wait, this fetches on *every* re-render. (Adding an animation above in the tree is a fun way to discover it.) Maybe let’s bind it to a particular query?

```jsx
  render() {
    return <Child fetchData={this.fetchData.bind(this, this.state.query)} />;
  }
```

But then `this.props.fetchData !== prevProps.fetchData` is *always* `true`, even if the `query` didn’t change! So we’ll *always* refetch.

The only real solution to this conundrum with classes is to bite the bullet and pass the `query` itself into the `Child` component. The `Child` doesn’t actually end up *using* the `query`, but it can trigger a refetch when it changes:

```jsx{10,22-24}
class Parent extends Component {
  state = {
    query: 'react'
  };
  fetchData = () => {
    const url = 'https://hn.algolia.com/api/v1/search?query=' + this.state.query;
    // ... Fetch data and do something ...
  };
  render() {
    return <Child fetchData={this.fetchData} query={this.state.query} />;
  }
}

class Child extends Component {
  state = {
    data: null
  };
  componentDidMount() {
    this.props.fetchData();
  }
  componentDidUpdate(prevProps) {
    if (this.props.query !== prevProps.query) {
      this.props.fetchData();
    }
  }
  render() {
    // ...
  }
}
```

Over the years of working with classes with React, I’ve gotten so used to passing unnecessary props down and breaking encapsulation of parent components that I only realized a week ago why we had to do it.

**With classes, function props by themselves aren’t truly a part of the data flow.** Methods close over the mutable `this` variable so we can’t rely on their identity to mean anything. Therefore, even when we only want a function, we have to pass a bunch of other data around in order to be able to “diff” it. We can’t know whether `this.props.fetchData` passed from the parent depends on some state or not, and whether that state has just changed.

**With `useCallback`, functions can fully participate in the data flow.** We can say that if the function inputs changed, the function itself has changed, but if not, it stayed the same. Thanks to the granularity provided by `useCallback`, changes to props like `props.fetchData` can propagate down automatically.

Similarly, [`useMemo`](https://reactjs.org/docs/hooks-reference.html#usememo) lets us do the same for complex objects:

```jsx
function ColorPicker() {
  // Doesn't break Child's shallow equality prop check
  // unless the color actually changes.
  const [color, setColor] = useState('pink');
  const style = useMemo(() => ({ color }), [color]);
  return <Child style={style} />;
}
```

**I want to emphasize that putting `useCallback` everywhere is pretty clunky.** It’s a nice escape hatch and it’s useful when a function is both passed down *and* called from inside an effect in some children. Or if you’re trying to prevent breaking memoization of a child component. But Hooks lend themselves better to [avoiding passing callbacks down](https://reactjs.org/docs/hooks-faq.html#how-to-avoid-passing-callbacks-down) altogether.

In the above examples, I’d much prefer if `fetchData` was either inside my effect (which itself could be extracted to a custom Hook) or a top-level import. I want to keep the effects simple, and callbacks in them don’t help that. (“What if some `props.onComplete` callback changes while the request was in flight?”) You can [simulate the class behavior](#swimming-against-the-tide) but that doesn’t solve race conditions.

## Speaking of Race Conditions

A classic data fetching example with classes might look like this:

```jsx
class Article extends Component {
  state = {
    article: null
  };
  componentDidMount() {
    this.fetchData(this.props.id);
  }
  async fetchData(id) {
    const article = await API.fetchArticle(id);
    this.setState({ article });
  }
  // ...
}
```

As you probably know, this code is buggy. It doesn’t handle updates. So the second classic example you could find online is something like this:

```jsx{8-12}
class Article extends Component {
  state = {
    article: null
  };
  componentDidMount() {
    this.fetchData(this.props.id);
  }
  componentDidUpdate(prevProps) {
    if (prevProps.id !== this.props.id) {
      this.fetchData(this.props.id);
    }
  }
  async fetchData(id) {
    const article = await API.fetchArticle(id);
    this.setState({ article });
  }
  // ...
}
```

This is definitely better! But it’s still buggy. The reason it’s buggy is that the request may come out of order. So if I’m fetching `{id: 10}`, switch to `{id: 20}`, but the `{id: 20}` request comes first, the request that started earlier but finished later would incorrectly overwrite my state.

This is called a race condition, and it’s typical in code that mixes `async` / `await` (which assumes something waits for the result) with top-down data flow (props or state can change while we’re in the middle of an async function).

Effects don’t magically solve this problem, although they’ll warn you if you try to pass an `async` function to the effect directly. (We’ll need to improve that warning to better explain the problems you might run into.)

If the async approach you use supports cancellation, that’s great! You can cancel the async request right in your cleanup function.

Alternatively, the easiest stopgap approach is to track it with a boolean:

```jsx{5,9,16-18}
function Article({ id }) {
  const [article, setArticle] = useState(null);

  useEffect(() => {
    let didCancel = false;

    async function fetchData() {
      const article = await API.fetchArticle(id);
      if (!didCancel) {
        setArticle(article);
      }
    }

    fetchData();

    return () => {
      didCancel = true;
    };
  }, [id]);

  // ...
}
```

[This article](https://www.robinwieruch.de/react-hooks-fetch-data/) goes into more detail about how you can handle errors and loading states, as well as extract that logic into a custom Hook. I recommend you to check it out if you’re interested to learn more about data fetching with Hooks.

## Raising the Bar

With the class lifecycle mindset, side effects behave differently from the render output. Rendering the UI is driven by props and state, and is guaranteed to be consistent with them, but side effects are not. This is a common source of bugs.

With the mindset of `useEffect`, things are synchronized by default. Side effects become a part of the React data flow. For every `useEffect` call, once you get it right, your component handles edge cases much better.

However, the upfront cost of getting it right is higher. This can be annoying. Writing synchronization code that handles edge cases well is inherently more difficult than firing one-off side effects that aren’t consistent with rendering.

This could be worrying if `useEffect` was meant to be *the* tool you use most of the time. However, it’s a low-level building block. It’s an early time for Hooks so everybody uses low-level ones all the time, especially in tutorials. But in practice, it’s likely the community will start moving to higher-level Hooks as good APIs gain momentum.

I’m seeing different apps create their own Hooks like `useFetch` that encapsulates some of their app’s auth logic or `useTheme` which uses theme context. Once you have a toolbox of those, you don’t reach for `useEffect` *that* often. But the resilience it brings benefits every Hook built on top of it.

So far, `useEffect` is most commonly used for data fetching. But data fetching isn’t exactly a synchronization problem. This is especially obvious because our deps are often `[]`. What are we even synchronizing?

In the longer term, [Suspense for Data Fetching](https://reactjs.org/blog/2018/11/27/react-16-roadmap.html#react-16x-mid-2019-the-one-with-suspense-for-data-fetching) will allow third-party libraries to have a first-class way to tell React to suspend rendering until something async (anything: code, data, images) is ready.

As Suspense gradually covers more data fetching use cases, I anticipate that `useEffect` will fade into background as a power user tool for cases when you actually want to synchronize props and state to some side effect. Unlike data fetching, it handles this case naturally because it was designed for it. But until then, custom Hooks like [shown here](https://www.robinwieruch.de/react-hooks-fetch-data/) are a good way to reuse data fetching logic.

## In Closing

Now that you know pretty much everything I know about using effects, check out the [TLDR](#tldr) in the beginning. Does it make sense? Did I miss something? (I haven’t run out of paper yet!)

I’d love to hear from you on Twitter! Thanks for reading.
