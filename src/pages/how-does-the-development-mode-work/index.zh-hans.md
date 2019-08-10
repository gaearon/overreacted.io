---
title: 开发模式 "Development Mode" 是如何工作的？
date: '2019-08-10'
spoiler: 死码消除的通常办法
---

如果你的代码库比较的庞杂，**你或许需要采取某种办法，在 development 和 production 模式下，分别打包和运行不同的代码**。

在 development 和 production 模式下，分别打包和运行不同的代码非常的有帮助。在 development 模式下，React 包含了很多的警告 （warnings），以在 bugs 生成之前帮助你发现问题。然而，这些用于检测错误的代码往往会增加程序包的体积、使应用运行更加缓慢。

在  development 模式下这个缓慢我们当然可以接受。实际上，在开发时使应用运行慢一些或许更有好处，因为，它部分地抵消了开发机（往往很快）与用户机（较慢）的性能差异。

在 production 模式，我们不愿意付出这个性能代价。因此，我们在此模式下忽略掉这些检查。这是怎么实现的呢？让我们来看看。

---

在 development 模式下运行不同的代码的具体方式取决于你的脚本构建管道（pipeline）（以及你是否设有）。在 Facebook 它看起来像这样：

```js
if (__DEV__) {
  doSomethingDev();
} else {
  doSomethingProd();
}
```

这里，`__DEV__` 不是一个真实的变量。它是一个常量， 在各个模块（modules）被打包之后被替换。结果就是如下面这样：

```js
// In development:
if (true) {
  doSomethingDev(); // 👈
} else {
  doSomethingProd();
}

// In production:
if (false) {
  doSomethingDev();
} else {
  doSomethingProd(); // 👈
}
```

在 production 模式下，你需要对代码进行压缩。多数的 JavaScript 压缩工具按照 [死码消除（dead code elimination）](https://en.wikipedia.org/wiki/Dead_code_elimination) 那几种有限的方式来对代码进行压缩，比如，去掉 `if (false)` 条件分支。因此在 production 模式下，你应该只能看到：

```js
// In production (after minification):
doSomethingProd();
```

*（注意，使用主流的 JavaScript 压缩工具，在死码消除（dead code elimination）的效率方面，还是存在很多的局限，但这是另一个话题）*

然而，如果你使用流行的 webpack 打包工具，可能就未使用 `__DEV__` 这个魔术常量（magic constant），这时你可以遵循另一些规则。例如，通常可表达相同意思的方式是像这样的：

```js
if (process.env.NODE_ENV !== 'production') {
  doSomethingDev();
} else {
  doSomethingProd();
}
```

**这正是 React 和 Vue 前端库被打包的时候所采用的表达方式。**（单文件 `<script>` 标签构建提供了 development 和 production 两个版本的文件，分别为 `.js` 和 `.min.js`）

这种通常的做法源自 Node.js。在 Node.js 中，有一个全局变量 `process` ，它在属性 `process.env` 暴露了系统的环境变量。然而，当你在前端代码中注意到的这种用法，会发现并没有从哪里真正引入 `process` 这个变量。

实际上，在构建的时候，`process.env.NODE_ENV` 这整个表达式会被一个文本替换，就像神奇的 `__DEV__` 变量 一样：

```js
// In development:
if ('development' !== 'production') { // true
  doSomethingDev(); // 👈
} else {
  doSomethingProd();
}

// In production:
if ('production' !== 'production') { // false
  doSomethingDev();
} else {
  doSomethingProd(); // 👈
}
```

由于这整个表达式是一个常量（`'production' !== 'production'` 一定是 `false`），代码精简工具也会移除另一个分支。

```js
// In production (after minification):
doSomethingProd();
```

Mischief managed.

---

注意，对于复杂的表达式，这种的方式**将不会**奏效：

```js
let mode = 'production';
if (mode !== 'production') {
  // 🔴 not guaranteed to be eliminated
}
```

JavaScript 因为是动态语言，静态分析工具不会很智能。当它看到变量 `mode` ，而不是一个静态的表达式，比如 `false` 的或者 `'production' !== 'production'`，它通常无视之。

类似，JavaScript 中的死码消除在使用 import 进行跨模块访问的时候，不会很好的起作用：

```js
// 🔴 not guaranteed to be eliminated
import {someFunc} from 'some-module';

if (false) {
  someFunc();
}
```

因此，你需要一个机制，以使条件是绝对静态的表达，并且确保条件下的*全部*代码都是你想消除的。

---

为此，你的打包工具需要对 `process.env.NODE_ENV` 进行替换，并且需要明确你要在哪种模式下将其构建到项目中？？？。

几年之前，人们往往忘记配置环境。你可能经常看到一些处于开发模式下项目被部署到生产环境上。

这非常糟糕，因为，它会让网站加载和运行得更慢。

在过去的两年，这种状况得到改善。例如，webpack 添加了一个方便的 `mode` 选项，以替代之前对 `process.env.NODE_ENV` 的手动配置。 React DevTools 现在也会在开发模式下将图标显示为红色，以使更加显眼甚至用于做相关的报告。

![Development mode warning in React DevTools](https://overreacted.io/static/ca1c0db064f73cc5c8e21ad605eaba26/d9514/devmode.png)

直接使用像 Create React App、Next/Nuxt、Vue CLI、Gatsby 等等基础设定，development 与 production 构建分别交由两个命令执行（例如：`npm start` 和 `npm run build`），这使得用户对二模式更加不易混淆。尤其，只能生产构建才能部署，因此开发者不会再犯错误。

总有声音认为 production 模式应该是默认模式，而 development 模式则应为可配置项。个人来说，我不认为这个观点有任何说服力。从 development 模式的 `warnings` 中获益的，往往是那些使用XX库的新手。*他们不知道需要将模式切换到开发环境*，这将导致很多那些 `warnings` 能检测到的 bug 被遗漏。

是的，性能问题很糟糕。但是将问题重重的使用体验抛给终端用户那里同样糟糕。例如，[React key warning](https://reactjs.org/docs/lists-and-keys.html#keys) 帮助我们避免将错误的消息发送给错误的人或者购买错误的产品。关闭这个 warning 对你和你的用户都有极大风险的。倘若它默认为关闭的状态，那么当你开启它的时候，已经积攒了大量的 warnings 以待清理！因此大多数人会将其切换为开启状态。这也就是为什么这种检测当从最初即被开启，而非日后为之！

最后，即使开发模式下的 `warnings` 为可选配置，开发者知道在开发时需要早早地开启他们，我们还是会回到最初的那个问题。有些人将会把开发模式下的版本部署到生产环境。

And we’re back to square one.

我个人比较信赖那些可根据所处阶段是调试或部署，来显示和使用正确模式的工具。几十年来，除 web 浏览器之外的其它的环境（移动、PC或者服务器）都有各自的方式加载和区分开发（development）和生产（production）的构建。

或许，JavaScript 运行环境是时候将**区分 development 和 production 模式**视为一等需求，而不是各个库采用、依赖一些临时规范。

---

对于思想的论述就到此！

让我们来看看这段代码：

```js
if (process.env.NODE_ENV !== 'production') {
  doSomethingDev();
} else {
  doSomethingProd();
}
```

你可能会疑惑，如果在前端代码种不存在 `process` 这个对象，为什么像 React 和 Vue 这样的库在 npm 构建的时候需要依赖它呢？

*（再次澄清一下：你使用 `<script>`加载的 React 和 Vue 的构建包并不不依赖这个。但是，你必须自己来选择是使用development 模式下的构建包 `.js` 还是 production 模式下的构建包 `.min.js`）。下边的内容旨在探讨使用打包工具，基于 ES6 的 import 模块加载规范，加载 React 或 Vue 库时的情况。*

类似编程中的很多事情，**这个**规范（convention）几乎就是一个历史遗留问题。我们都在使用这个，因为现在很多工具在遵循它。换做其它的方式代价不小且无所益处。

那么这背后的历史如何呢？

在 import 和 export 语法得以标准化之前的数年，已经存在了很多完整的方式来表达模块之间的关系。Node.js  极大推广了 `require()` 和 `module.exports`，这就是 [CommonJS](https://en.wikipedia.org/wiki/CommonJS) 规范。

最初，往 npm 仓库发布的代码仅提供为 Node.js  来使用。Express（至今仍然是？）曾是最为流行的基于 NodeJs 的服务端框架，它使用了 [`NODE_ENV`](https://expressjs.com/en/advanced/best-practice-performance.html#set-node_env-to-production) 环境变量来开启 production 模式。其它一些 npm 包也采取了同样的规范。

早期的 JavaScript 打包工具，像 browserify ，想将 npm 仓库中的代码应用到前端项目中。（是的，[那之前](https://blog.npmjs.org/post/101775448305/npm-and-front-end-packaging)，没有人将 npm 包用于前端开发！你能想象吗？）因此，他们把 NodeJs 生态下的这个规范扩展到前端。

原先的 “envify” 变换[发布于2013年](https://github.com/hughsk/envify/commit/ae8aa26b759cd2115eccbed96f70e7bbdceded97)。React 在那个时候做了开源，且 npm 搭配 browserify 看起来是最优秀的前端（基于 CommonJS 加载规范）打包解决方案。

React从一开始就提供了 npm 构建（另加独立文件包构建，`<script>` 标签访问）。随着 React 日益流行，将 CommonJs 模块加载（npm）规范使用到前端的实践方式也跟着流行起来。

React 在生产模式下，需要移除仅用于开发阶段时的代码。Browserify 已经提供解决此类问题的方案，因此 React 也采用了使用 `process.env.NODE_ENV` 的打包（npm）规范。往后，很多其它的工具和库，包括 webpack 和 VUE，都是如此。

截止 2019 年，browserify 已经失去了一些关注度。然而，构建阶段替换 `process.env.NODE_ENV` 以 `'development'` 或 `'production'`，作为一个规范流行起来。 

*（It would be interesting to see how adoption of ES Modules as a distribution format, rather than just the authoring format, changes the equation. Tell me on Twitter?）*

---

有件事可能依然在困扰你。为什么 React 在 GtiHub 上的源代码中，你可看到 `__DEV__` 用于魔术变量。但是在 npm 仓库中 React   使用的是 `process.env.NODE_ENV`。这如何可能？

历史上，我们曾在源码中使用 `__DEV__` 来匹配 Facebook 的源码。很长一段时间，React 直接被拷贝到 Facebook 的代码库中，因此，它需要维持一致的规则。对于 npm 代码库，我们在构建发布之前，会将 `__DEV__` 检查替换为 `process.env.NODE_ENV !== 'production'` 文本表达。

有时这是个问题。这种依赖 Node.js 包规范的代码形式在 npm 上能正常工作，但破坏了 Facebook 的规则，或者相反。

React 16 以来，我们改变了这种方式。我们为每一种环境构建文件包（包括支持 `<script>` 标签引入、npm 和 Facebook 的内部代码库）。因此，甚至 npm 仓库上的 CommonJs 代码也会提前为 development 和 production 模式被分别编译到独立文件中。

这也就是说，当 React 源代码里说 `if (__DEV__)`，我们实际上生成了两个文件。其中一个已经被预编译为 `__DEV__ = true`，另外一个，则被预编译为 `__DEV__ = false`。在入口点判断需要输出哪个文件包。


[例如：](https://unpkg.com/browse/react@16.8.6/index.js)

```js
if (process.env.NODE_ENV === 'production') {
  module.exports = require('./cjs/react.production.min.js');
} else {
  module.exports = require('./cjs/react.development.js');
}
```

也就是能在这里，你的打包工具将 'development' 或 'production' 以字符串形式插入到代码中的用于环境判断的条件语句处，继而，代码压缩工具抛开 development-only 的那些依赖（`require`）。

`react.production.min.js` 和 `react.development.js` 二者都不会再有基于 `process.env.NODE_ENV` 的环境检查了。这非常棒，因为在 NodeJs 环境中运行的时候，访问 process.env 会导致系统变慢。提前为两种模式编译好文件包，也能让我们更加一致地来优化文件大小，而不用考虑使用何种打包和压缩工具。

这就是它的工作原理！

---

我希望，能有一个更加头等的方式来替换对于规范的依赖，也就是我们现在遵循的方式。如果模式（modes）在所有的 JavaScript 环境中都是头等概念，那将会非常不错，并且，and if there was some way for a browser to surface that some code is running in a development mode when it’s not supposed to.

另一方面，一个项目中提到的规范竟然能传播到整个生态，这十足神奇！在 2010 年，`EXPRESS_ENV` [变为 `NODE_DEV`](https://github.com/expressjs/express/commit/03b56d8140dc5c2b574d410bfeb63517a0430451)，继而于 2013 年扩展到前端领域。也许，这个解决方案并不完美，但是，对于每个项目来说，使用它的成本一定比叫每个人搞一套自己的要低！ 这正好给我们上了一节关于 “自上而下推行” 和 “自下而上式采纳”的很有价值的一课。Understanding how this dynamic plays out distinguishes successful standardization attempts from failures.

区分 development 和 production 模式是一种非常重要的技术。我建议在你的开发库、应用的时候使用这样的方式，以进行那些于生产环境不值而在开发环境却非常值得（常常是非常重要）的环境检测。

至于有些强大的特性，你可能某种程度上错用了它们。这将是下一篇的话题！