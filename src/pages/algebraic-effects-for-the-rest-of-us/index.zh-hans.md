---
title: 通俗易懂的代数效应
date: '2019-07-21'
spoiler: 它们不是墨西哥卷饼。
---

朋友你听说过**代数效应**吗？

我想知道这是什么以及为什么我需要了解它，于是查阅了[一些](https://www.eff-lang.org/handlers-tutorial.pdf) [pdfs](https://www.microsoft.com/en-us/research/wp-content/uploads/2016/08/algeff-tr-2016-v2.pdf)，越看越一头雾水（里面一些比较学术的 pdfs 看得我昏昏欲睡）。初次入坑失败。


但我的同事 Sebastian [一直](https://mobile.twitter.com/sebmarkbage/status/763792452289343490)[参](https://mobile.twitter.com/sebmarkbage/status/776883429400915968)[考](https://mobile.twitter.com/sebmarkbage/status/776840575207116800)[它们](https://mobile.twitter.com/sebmarkbage/status/969279885276454912)作为我们在React中做的一些东西的心智模型。（Sebastian 工作于 React 团队并且贡献过很多想法，包括 Hooks 和 Suspense。）在某种意义上，这已经变成了 React 团队的一个梗，很多时候我们的谈话都以此结尾：

!["Algebraic Effects" caption on the "Ancient Aliens" guy meme](./effects.jpg)

事实证明，代数效应是一个很酷的概念，也没有我看了一些 pdfs 之后想的那么可怕。**如果你只是用 React， 其实完全没有必要去了解这些概念 —— 但如果你像我一样对此感到好奇，就请继续读下去吧。**

**（免责声明：我并不是一个编程语言的研究人员，在解释的过程中可能会搞混一些东西。在这个话题上我不是权威人士，所以如果发现哪里不对请告诉我！）**

### 尚未投入生产

**代数效应**是一项研究中的编程语言特性。这意味着**不像 `if`，functions，甚至比较新的 `async / await`，你也许还不能在生产中真正的使用它。**只有[少数](https://www.eff-lang.org/)专为研究这些特性而创造的[语言](https://www.microsoft.com/en-us/research/project/koka/)支持它们的使用。OCaml 将这些特性投入生产，虽然取得了一些进展但也……尚在[进行中](https://github.com/ocaml-multicore/ocaml-multicore/wiki)。换句话来说就是，[触不可及](https://www.youtube.com/watch?v=otCpCn0l4Wo)。

> 修正：有人指出 LISP 中[有类似的实现](#learn-more)，所以如果你写 LISP 的话可以在生产中使用这些特性。

### 所以我为什么要关心这个？

想象一下，当你还在写 `goto` 的时候，有人向你展示了 `if` 和 `for`。或者当你深陷回调地狱的时候，有人告诉你有 `async / await`。挺酷的不是吗？

如果你是那种喜欢在某种编程思想成为主流之前几年就早早发掘它们的人，现在就是一个探索代数效应的好时机。这有点像在1999年的时候就开始思考 `async / await`，可以但也不是**必须**的。

### 好吧，那么什么是代数效应？

这个名字可能有点吓人，但思想并不复杂。如果你熟悉 `try / catch` 语法块的话，你也会很快弄清代数效应。

先来总结一下 `try / catch`。假设有一个函数抛出了一个错误，在它和 `catch` 之间可能隔了一堆函数：

```jsx{4,19}
function getName(user) {
  let name = user.name;
  if (name === null) {
  	throw new Error('A girl has no name');
  }
  return name;
}

function makeFriends(user1, user2) {
  user1.friendNames.add(getName(user2));
  user2.friendNames.add(getName(user1));
}

const arya = { name: null };
const gendry = { name: 'Gendry' };
try {
  makeFriends(arya, gendry);
} catch (err) {
  console.log("Oops, that didn't work out: ", err);
}
```

我们在 `getName` 中 `throw` 一个错误，但它穿过 `makeFriends`，“冒泡”到了最近的 `catch` 块。这是 `try / catch` 的一个重要属性。**处于中间的东西不需要关心自身的错误处理。**

与 C 这类语言中的错误码不同，你不用手动层层传递随时担心弄丢它们，有了 `try / catch`，错误会自动传递。

### 这和代数效应有什么关系呢？

在上面的例子中，一旦命中错误，后面的代码就不能继续执行了。当我们进入 `catch` 块，就无法再回到原来的代码继续执行。

结束了。一切都太晚了。这时我们能做的就只有从运行失败中恢复，或许还能以某种方式重试我们正在做的事情，我们就不能奇迹般地“回到”原来的地方然后做一些改变吗？**有了代数效应的话，我们可以。**

这是一个用假定的 JavaScript 语法（为了好玩我们称之为 ES2025）写的例子，让我们从 `user.name` 缺失中**恢复**：

```jsx{4,19-21}
function getName(user) {
  let name = user.name;
  if (name === null) {
  	name = perform 'ask_name';
  }
  return name;
}

function makeFriends(user1, user2) {
  user1.friendNames.add(getName(user2));
  user2.friendNames.add(getName(user1));
}

const arya = { name: null };
const gendry = { name: 'Gendry' };
try {
  makeFriends(arya, gendry);
} handle (effect) {
  if (effect === 'ask_name') {
  	resume with 'Arya Stark';
  }
}
```

**（我向所有在2025年搜索“ES2025”但搜出了这篇文章的读者道歉。如果到时候代数效应已经成了 JavaScript 的一部分，我会很乐于更新这篇文章！）**

我们用一个假定关键字 `perform` 替代 `throw`。相应的，我们用假定的 `try / handle` 替代 `try / catch`。**具体的语法并不重要 —— 我只是想借什么东西来说明这个概念。**

让我们进一步看看发生了什么：

不像之前那样抛出一个错误，这次我们**执行了一个效应**。就像我们可以 `throw` 任何值一样，我们也可以传给 `perform` 任何值。在这个例子中，我传入的是一个字符串，但也可以是一个对象或者任意其他数据类型：

```jsx{4}
function getName(user) {
  let name = user.name;
  if (name === null) {
  	name = perform 'ask_name';
  }
  return name;
}
```

当我们 `throw` 一个错误时，引擎会在调用堆栈中寻找最近的 `try / catch` 错误处理。同样的，当我们`perform` 一个效应时，引擎在调用堆栈中寻找最近的  `try / handle` **效应处理**。

```jsx{3}
try {
  makeFriends(arya, gendry);
} handle (effect) {
  if (effect === 'ask_name') {
  	resume with 'Arya Stark';
  }
}
```

这个效应告诉我们如何处理名字参数缺失的情况。这里新增的部分（与 exception 相对）是一个假定的 `resume with`：

```jsx{5}
try {
  makeFriends(arya, gendry);
} handle (effect) {
  if (effect === 'ask_name') {
  	resume with 'Arya Stark';
  }
}
```

这是 `try / catch` 做不到的。这可以**跳回我们执行效应的地方，并通过这个处理语句传回一些东西。** 🤯

```jsx{4,6,16,18}
function getName(user) {
  let name = user.name;
  if (name === null) {
  	// 1. 我们在这里执行效应
  	name = perform 'ask_name';
  	// 4. ...最后回到这里（现在 name 是 'Arya Stark'）了
  }
  return name;
}

// ...巴拉巴拉

try {
  makeFriends(arya, gendry);
} handle (effect) {
  // 2. 我们进入处理程序（类似 try/catch）
  if (effect === 'ask_name') {
  	// 3. 但是这里我们可以带一个值继续执行（与 try/catch 不同!）
  	resume with 'Arya Stark';
  }
}
```

适应这种写法需要花一点时间，但这在概念上跟“断点续传的 `try / catch`”没什么不同。

但是要注意，**代数效应比 `try / catch` 灵活的多，错误恢复只是众多用例中的一种而已。**我以此开头，也只是因为它最易于用来表述我的想法。

### 没有颜色的函数

代数效应为异步代码提供了一些有趣的启示。

在实现了 `async / await` 的语言中，[函数常常是有“颜色”的](https://journal.stuffwithstuff.com/2015/02/01/what-color-is-your-function/)。举个例子，在 JavaScript 里，我们不能单单将 `getName` 变成异步的而不对 `makeFriends` 以及调用它的地方造成“影响”，它们都要变成 `async` 的。想想如果**一段代码需要时而是同步的时而是异步的**，那真的会挺痛苦的。

```jsx
// 如果我们要把它变成异步的...
async getName(user) {
  // ...
}

// 那么这里也要变成异步的...
async function makeFriends(user1, user2) {
  user1.friendNames.add(await getName(user2));
  user2.friendNames.add(await getName(user1));
}

// 以此类推...
```

JavaScript generators 也是[类似的](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function*)：如果你正在写 generators 的代码就会发现，中间的代码不得不去注意 generators。

所以这和我们的主题有什么关系吗？

接下来的几分钟，让我们先忘掉 `async / await` 然后回到我们刚刚的例子：

```jsx{4,19-21}
function getName(user) {
  let name = user.name;
  if (name === null) {
  	name = perform 'ask_name';
  }
  return name;
}

function makeFriends(user1, user2) {
  user1.friendNames.add(getName(user2));
  user2.friendNames.add(getName(user1));
}

const arya = { name: null };
const gendry = { name: 'Gendry' };
try {
  makeFriends(arya, gendry);
} handle (effect) {
  if (effect === 'ask_name') {
  	resume with 'Arya Stark';
  }
}
```

如果我们的效应处理器并不能同步获取“备用名字”呢？如果我们想从数据库中取得该值呢？

事实证明，通过效应处理器，我们可以异步地调用 `resume with` 而无需修改 `getName` 或 `makeFriends`：

```jsx{19-23}
function getName(user) {
  let name = user.name;
  if (name === null) {
  	name = perform 'ask_name';
  }
  return name;
}

function makeFriends(user1, user2) {
  user1.friendNames.add(getName(user2));
  user2.friendNames.add(getName(user1));
}

const arya = { name: null };
const gendry = { name: 'Gendry' };
try {
  makeFriends(arya, gendry);
} handle (effect) {
  if (effect === 'ask_name') {
  	setTimeout(() => {
      resume with 'Arya Stark';
  	}, 1000);
  }
}
```

在这个例子中，我们会在1秒后调用 `resume with`。你可以认为 `resume with` 是一个只能调用一次的回调。（你也可以叫它“单次限定延续（continuation）”，这样能给你的朋友留下深刻印象。）

现在代数效应的机制应该是更清晰一点了。当我们 `throw` 一个错误，JavaScript 引擎释放堆栈，销毁运行中的局部变量。然而，当我们`perform` 一个效应，我们假定的引擎会用余下的函数创建一个回调，然后用 `resume with` 去调用它。

**再次提醒：具体的语法和关键字是为这篇文章而造的。它们并不是重点，重点是它们阐述的机制。**

### 关于纯净

抛开函数式编程的研究谈代数效应是没有意义的，因为它们解决的一些问题是函数式编程中特有的。举个例子，在**不**允许随意产生副作用的语言（像是 Haskell）中，必须使用像 Monads 这样的概念来将效应引入你的程序。如果你读过 Monad 的教程，就会知道它们理解起来有点诡异。代数效应可以帮助你花更少的仪式实现相似的功能。

这就是为什么我对这么多代数效应的讨论感到费解。（因为我[不懂](/things-i-dont-know-as-of-2018/) Haskell 和 friends。）但是我依然认为，即使是在 JavaScript 这样不纯的语言中，**代数效应可以作为一种强有力的工具，将代码中的 *what* 和 *how* 分开。**

这让你在写代码时可以关注你在做**什么**：

```jsx{2,3,5,7,12}
function enumerateFiles(dir) { // 枚举文件
  const contents = perform OpenDirectory(dir);
  perform Log('Enumerating files in ', dir);
  for (let file of contents.files) {
  	perform HandleFile(file);
  }
  perform Log('Enumerating subdirectories in ', dir);
  for (let directory of contents.dir) {
    // 递归或调用其他函数时，也可使用 effects。
  	enumerateFiles(directory);
  }
  perform Log('Done');
}
```

随后，将它包在实现了**怎么样**的块里：

```jsx{6-7,9-11,13-14}
let files = [];
try {
  enumerateFiles('C:\\');
} handle (effect) {
  if (effect instanceof Log) {
  	myLoggingLibrary.log(effect.message);
  	resume;
  } else if (effect instanceof OpenDirectory) {
  	myFileSystemImpl.openDir(effect.dirName, (contents) => {
      resume with contents;
  	});
  } else if (effect instanceof HandleFile) {
    files.push(effect.fileName);
    resume;
  }
}
// 现在 `files` 数组中有所有的文件啦
```

这意味着这些片段甚至可以打包收录起来：

```jsx
import { withMyLoggingLibrary } from 'my-log';
import { withMyFileSystem } from 'my-fs';

function ourProgram() {
  enumerateFiles('C:\\');
}

withMyLoggingLibrary(() => {
  withMyFileSystem(() => {
    ourProgram();
  });
});
```

不像 `async / await` 或 Generators，**代数效应不会复杂化“中间”的函数**。我们的`enumerateFiles` 可以在 `ourProgram` 的深层嵌套中被调用，对每个可能执行的效应，只要**上面随便哪里**有一个对应的效应处理器，我们的代码就依然有效。

有了效应处理器，我们不用写太多仪式代码或样板代码就能解耦程序逻辑和具体实现。举个例子，在测试中我们可以完全重写行为，用假的文件系统和快照日志来代替将它们输出到控制台：

```jsx{19-23}
import { withFakeFileSystem } from 'fake-fs';

function withLogSnapshot(fn) {
  let logs = [];
  try {
  	fn();
  } handle (effect) {
  	if (effect instanceof Log) {
  	  logs.push(effect.message);
  	  resume;
  	}
  }
  // Snapshot emitted logs.
  expect(logs).toMatchSnapshot();
}

test('my program', () => {
  const fakeFiles = [/* ... */];
  withFakeFileSystem(fakeFiles, () => {
  	withLogSnapshot(() => {
	  ourProgram();
  	});
  });
});
```

因为这里没有[“函数颜色”](https://journal.stuffwithstuff.com/2015/02/01/what-color-is-your-function/)（在其中的代码不必关心效应的影响）且效应处理器是**可组合**的（你可以嵌套它们），你可以用它们创造极具表现力的抽象。

### 关于类型

因为代数效应源于静态类型语言，所以关于它们大部分争论集中在它们类型表达的方式。这无疑是重要的，但同时也让把握概念变得有挑战了。这就是为什么这篇文章通篇不提类型。但需要提醒的是，如果一个函数可以执行效应，通常来说这会被编码进它的类型签名里。所以你不能在一个随机效应正发生的情况下结束，否则你无法追踪它们的来处。

你可能会说了，这样的话在技术上代数效应也为函数[“赋予了颜色”](https://journal.stuffwithstuff.com/2015/02/01/what-color-is-your-function/)，因为在静态类型语言中效应是类型签名的一部分。是这样没错。但是，为了引入新效应而修复中间函数的类型注释（type annotation），这件事本身不是语义更改 —— 这跟引入 `async` 或将函数转为 generator 不同。这个推断还可以帮助避免级联更改。一个重要的区别是，你可以通过实现一个 noop 或 mock 来“封存”一个效应（比如，一个异步效果的同步调用），有必要的话，这可以防止它接触外部的代码 —— 或者转变为一个不同的效应。

### 我们应该将代数效应加入 JavaScript 吗？

老实说，我不知道。它们非常的强大，可以说它们对于像 JavaScript 这样的语言来说有点**过于**强大了。

我认为它们非常适合那些变化（mutation）不常见且标准库完全拥抱 effects 的语言。如果你日常主要做 `perform Timeout(1000)`，`perform Fetch('http://google.com')`，以及 `perform ReadFile('file.txt')`，且你的语言有模式匹配和效应静态类型，那么这会是一个非常棒的编程环境。

也许这种语言甚至可以编译成 JavaScript！

### 这些怎么就和 React 有关系了？

其实没什么关系。甚至可以说这只是一个延伸。

如果你看过我[关于时间切片和 Suspense 的演讲](https://reactjs.org/blog/2018/03/01/sneak-peek-beyond-react-16.html)，第二部分讲到组件从缓存中读取数据：

```jsx
function MovieDetails({ id }) {
  // 如果数据还没被请求回来呢？
  const movie = movieCache.read(id);
}
```

**（演讲中用了一个不太一样的 API 但这并不是重点。）**

这构建于一个名为 “Suspense” 的 React 特性之上，针对获取数据用例，正在积极开发中。当然了，有趣的部分在于数据可能还不在 `movieCache` 里 —— 这种情况我们就无法进行下去了，所以需要做点**什么事情**。从技术的层面来说，在这种情况下  `read()` 调用会抛出一个 Promise（是的，抛出一个 Promise —— 请细细体会）。这“暂停”了执行。React 捕获这个 Promise，并且记得在 Promise 解决后重试组件树的渲染。 

虽说这个技巧的[灵感](https://mobile.twitter.com/sebmarkbage/status/941214259505119232)源于它们，但本身并不是个代数效应。话虽如此，它也实现了相同的目标：在调用栈中，下面的代码服从于上面的什么东西（在这里是 React），中间的函数不必知道它或者被 `async` 、 generators “荼毒”。当然，随后我们并不能真的在 JavaScript 中**恢复**执行，但从 React 的角度来看，在 Promise 解决的时候重渲染组件树跟恢复执行没什么区别。只要你的编程模型[假定幂等](/react-as-a-ui-runtime/#purity)，就可以假装我们可以恢复执行！

[Hooks](https://reactjs.org/docs/hooks-intro.html) 是另一个可能会让你想起代数效应的例子。大家的第一个问题一般是： `useState` 执行的时候怎么知道它指向哪一个组件？

```jsx
function LikeButton() {
  // useState 怎么知道自己在哪一个组件里？
  const [isLiked, setIsLiked] = useState(false);
}
```

我已经在[文章的结尾处](/how-does-setstate-know-what-to-do/)解释了答案：React 对象上有一个叫“当前调度器”的 mutable 状态，指向你正在使用的实现（比如 `react-dom` 里的实现）。类似的，有一个“当前组件”属性，指向我们 `LikeButton` 组件的内部数据结构。这就是 `useState` 如何知道该做什么的答案。

在人们习惯之前，他们会觉得这样做有点“脏”。原因很明显：依赖一个共享的 mutable 状态总是“感觉哪里不对”。**（旁注：你觉得在 JavaScript 引擎里 `try / catch` 是怎么实现的呢？）**

话又说回来，在概念上你可以认为 `useState()` 是一个 `perform State()` 效应，在组件执行时由 React 处理。这可以“解释”为什么 React（调用你组件的东西）可以为它提供状态（在调用栈中 React 在上层，所以可以提供效应处理器）。确实，在我找到的代数效应教程中，[状态的实现](https://github.com/ocamllabs/ocaml-effects-tutorial/#2-effectful-computations-in-a-pure-setting)是最常见的示例之一。

当然，在此重申，因为 JavaScript 里并没有代数效应，所以 React **实际上**不是这样运行的。实际上，有一个隐藏字段用来保留当前组件，在`useState` 的实现中也有一个字段用来指向当前“调度器”。作为性能优化，对[mounts 和 updates](https://github.com/facebook/react/blob/2c4d61e1022ae383dd11fe237f6df8451e6f0310/packages/react-reconciler/src/ReactFiberHooks.js#L1260-L1290)甚至分别实现了 `useState`。但是如果你眯着眼用力看这段代码，就会发现它们实质上就是效应处理器。

总结一下，在 JavaScript 里，抛出行为可以粗略近似于 IO 效应（只要之后重新执行代码是安全的，并且不受 CPU 限制），可在 `try / finally` 中恢复的 mutable “调度器”字段可以粗略近似于同步效应处理器。

[配合generators使用](https://dev.to/yelouafi/algebraic-effects-in-javascript-part-4---implementing-algebraic-effects-and-handlers-2703)你可以得到一个更接近真正效应的实现，但这也意味着你不得不放弃 JavaScript 函数“透明”的性质，你不得不把所有东西都变成 generator。这个……额。

### 了解更多

个人来说，代数效应给我带来的意义多到让我惊讶。我一直在努力理解像 Monads 这样的抽象概念，而代数效应“点”醒了我。我希望这篇文章也能帮它们“点”醒你。

我不知道它们是否会被主流所接纳。我觉得如果到了2025它们都没有流行于任何主流语言，我会很失望。请提醒我五年后再回来检查！

我能确认的是你可以用它们做更多的事 —— 但如果不上手写代码的话真的很难理解它们的强大之处。如果这篇博客激起了你一点好奇心，这里有一些你可能想要查阅的资料：

* https://github.com/ocamllabs/ocaml-effects-tutorial

* https://www.janestreet.com/tech-talks/effective-programming/

* https://www.youtube.com/watch?v=hrBq8R_kxI0

还有很多人指出，如果忽略类型部分（就像我在文中做的那样），你会发现在更早之前 Common Lisp 的[条件系统](https://en.wikibooks.org/wiki/Common_Lisp/Advanced_topics/Condition_System)中就实现相关技术了。你也许还很欣赏 James Long [关于 continuations 的博客](https://jlongster.com/Whats-in-a-Continuation)，博客解释了在用户空间中，`call/cc` 原生怎么也可以作为构建断点续传异常的基础。

如果你有找到其他适用于 JavaScript 背景开发者的代数效应相关有用资料，请在 Twitter 上告诉我！
