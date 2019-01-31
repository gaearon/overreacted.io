---
title: 为什么 X 不是 Hook ?
date: '2019-01-26'
spoiler: 我们可以这样做，但并不意味着我们应该这样做。
---

自从 [React Hooks](https://reactjs.org/hooks) 第一个 alpha 版本发布以来，有一个问题不断出现在讨论中：“为什么其他的一些 API 不是 Hook ?“

首先提醒一下，以下几个 API 才是真正的 Hooks：

* [`useState()`](https://reactjs.org/docs/hooks-reference.html#usestate) 让你声明一个 state 变量。
* [`useEffect()`](https://reactjs.org/docs/hooks-reference.html#useeffect) 让你声明一个副作用函数。
* [`useContext()`](https://reactjs.org/docs/hooks-reference.html#usecontext) 让你读取 context 中的值。

但是还有其他的一些 API，比如 `React.memo()` 和 `<Context.Provider>`，它们并不是 Hooks。如果它们拥有 Hook 版本，只会变得*不可组合*或*反模块化*。本篇文章将会帮助你理解其中的原因。

**注意：对于那些对 API 讨论感兴趣的人，这篇文章将会非常深入。没有必要将本文所讲的内容运用到实际生产的 React 应用中去。**

---

我们希望 React API 保留两个重要的属性：

1. **组合性：** 我们之所以对 Hooks API 感到如此兴奋，很大程度上是因为 [Custom Hooks](https://reactjs.org/docs/hooks-custom.html)。我们希望开发者能够经常构建自己的 Hooks，并且我们需要确保不同的人编写的 Hooks [不发生冲突](/why-do-hooks-rely-on-call-order/#flaw-4-the-diamond-problem)。(毕竟曾经我们都会为组件之间该如何正确组合而互不影响的问题感到头疼不是吗？)

2. **可调试性：** 当我们的应用逐渐变得复杂起来，我们往往希望更容易的找到 bug。而 React 具有的最好特性之一就是单向数据流，这意味着一旦渲染出错，你可以沿着出错的地方往上查找直到发现是哪个组件中的 prop 或者 state 造成的错误。

这两个重要的约束放在一起便可以让我们知道什么才适合成为 Hook。
让我们来举几个例子。

---

##  一个真正的 Hook: `useState()`

### 组合

在多个自定义 Hooks 中调用 `useState()` 并不会发生冲突。

```js
function useMyCustomHook1() {
  const [value, setValue] = useState(0);
  // 此处的 state 并不会被外部的 state 影响。
}

function useMyCustomHook2() {
  const [value, setValue] = useState(0);
  // 此处的 state 并不会被外部的 state 影响。
}

function MyComponent() {
  useMyCustomHook1();
  useMyCustomHook2();
  // ...
}
```

添加一个新的不在条件判断语句中的 `useState()` 调用总是安全的，你不需要了解组件通过其他 Hooks 声明的新 state 变量。你也不能通过更新其中一个来影响其他 state 变量。

**结论：** ✅ `useState()` 不会让自定义 Hooks 变得脆弱。

### 调试

Hooks 之所以有用是因为你可以在它们之间传递值。

```js{4,12,14}
function useWindowWidth() {
  const [width, setWidth] = useState(window.innerWidth);
  // ...
  return width;
}

function useTheme(isMobile) {
  // ...
}

function Comment() {
  const width = useWindowWidth();
  const isMobile = width < MOBILE_VIEWPORT;
  const theme = useTheme(isMobile);
  return (
    <section className={theme.comment}>
      {/* ... */}
    </section>
  );
}
```

要是上面的代码出错了怎么办？我们该如何通过调试找到错误呢？

假设我们从 `theme.comment` 得到的 CSS 类名是错误的。我们该如何调试？我们可以在组件内部设置断点或者打印几条日志。

也许我们会发现 `theme` 是错误的但 `width` 和 `isMobile` 是正确的。这说明问题应该发生在 `useTheme()` 函数内部。又或者我们会看到 `width` 本身是错误的，这会让我们去检查 `useWindowWidth()` 函数中是否有错。

**通过单独查看中间值我们可以知道哪些顶层的 Hooks 中包含错误。** 我们并不需要了解所有的内部实现。

然后我们可以“放大“包含错误的那个，重复上述找寻错误的步骤直到解决问题。

如果自定义 Hook 嵌套的深度增加，这将变得更加重要。想象一下如果现在有一个三层嵌套的自定义 Hook，每一层还包含着三种不同的自定义 Hooks。在三个地方寻找错误与可能检查 **3 + 3×3 + 3×3×3 = 39** 个地方之间的[差异](/the-bug-o-notation/)是巨大的。幸运的是，`useState()` 不能神奇地“影响”其他的 Hooks 或组件。当一个错误的值返回时会留下痕迹，就像其他变量一样。🐛

**结论：** ✅ `useState()` 不会掩盖我们代码中的因果关系，我们可以通过查看中间值往上追溯错误发生的根源。

---

## 不是 Hook: `useBailout()`

作为一种性能优化的手段，在组件中使用 Hooks 可以避免重新渲染。

有一种方法是用 [`React.memo()`](https://reactjs.org/blog/2018/10/23/react-v-16-6.html#reactmemo) 将整个组件包裹在内。如果组件的 props 跟上次渲染时的 props 进行浅比较后相同则可以避免组件的重新渲染。这和在类组件中 `PureComponent` 的功能十分相似。

`React.memo()` 以组件作为传入参数并且会返回一个新的组件：

```js{4}
function Button(props) {
  // ...
}
export default React.memo(Button);
```

**但是为什么它不能作为一个 Hook 使用呢？**

不管你称它为 `useShouldComponentUpdate()`、`usePure()`、`useSkipRender()` 或者 `useBailout()`，最终的形式都会像这样：

```js
function Button({ color }) {
  // ⚠️ 不是真正的 API
  useBailout(prevColor => prevColor !== color, color);

  return (
    <button className={'button-' + color}>  
      OK
    </button>
  )
}
```

在命名上可能稍有不同 (例如还可以称为 `usePure()`) 但是总的来说它们都有相同的缺陷。

### 组合

假设我们尝试着将 `useBailout()` 放入两个自定义 Hooks：

```js{4,5,19,20}
function useFriendStatus(friendID) {
  const [isOnline, setIsOnline] = useState(null);

  // ⚠️ 不是真正的 API
  useBailout(prevIsOnline => prevIsOnline !== isOnline, isOnline);

  useEffect(() => {
    const handleStatusChange = status => setIsOnline(status.isOnline);
    ChatAPI.subscribe(friendID, handleStatusChange);
    return () => ChatAPI.unsubscribe(friendID, handleStatusChange);
  });

  return isOnline;
}

function useWindowWidth() {
  const [width, setWidth] = useState(window.innerWidth);
  
  // ⚠️ 不是真正的 API
  useBailout(prevWidth => prevWidth !== width, width);

  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  });

  return width;
}
```

如果将这两个自定义 Hooks 用在同一个组件中会发生什么呢？

```js{2,3}
function ChatThread({ friendID, isTyping }) {
  const width = useWindowWidth();
  const isOnline = useFriendStatus(friendID);
  return (
    <ChatLayout width={width}>
      <FriendStatus isOnline={isOnline} />
      {isTyping && 'Typing...'}
    </ChatLayout>
  );
}
```

什么时候才应该重新渲染？

如果每次 `useBailout()` 调用都有能力让组件跳过渲染更新，那么 `useWindowWidth()` 中本应有的更新就有可能因为 `useFriendStatus()` 传入的 props 未发生变化而被阻塞，反之亦然。**所以这样的 Hooks 之间会相互造成影响。**

然而，如果组件的渲染更新只依赖于所有 `useBailout()` 调用之后返回的结果，我们的 `ChatThread` 组件就无法响应 `isTyping` 属性的更改进而使组件得到正确的渲染更新。

更糟糕的是，在语义上如果**任何往 `ChatThread` 组件中新添加的 Hooks 不叫做 `useBailout()`**。它们就不能与 `useWindowWidth()` 以及 `useFriendStatus()` 里面的 `useBailout()` 一起来共同决定是否要进行组件的重新渲染，从而失去应有的作用。

**结论：** 🔴 `useBailout()` 破坏了组合性。将它作为 Hook 会影响其他由 Hooks 生成的 state 的更新。我们希望 API 具有[健壮性](/optimized-for-change/)，而这样的行为却恰恰相反。

### 调试

像 `useBailout()` 这样的 Hook 会影响调试吗？

我们用同样的例子来解释：

```js
function ChatThread({ friendID, isTyping }) {
  const width = useWindowWidth();
  const isOnline = useFriendStatus(friendID);
  return (
    <ChatLayout width={width}>
      <FriendStatus isOnline={isOnline} />
      {isTyping && 'Typing...'}
    </ChatLayout>
  );
}
```

假设 `Typing...` 标签没有像我们预期的那样出现在屏幕上，尽管在该组件的 prop 上方很多层的数据正在发生变化。我们该如何正确的找到错误呢？

**通常，在 React 中你会很自信地回答说沿着出错的地方往上查找。** 如果 `ChatThread` 组件没有获得新的 `isTyping` 值，我们可以查看渲染 `<ChatThread isTyping={myVar} />` 的组件进而检查 `myVar`，依此类推。在往上的每一层组件中，我们要么发现是 `shouldComponentUpdate()` 造成了错误的渲染，要么是错误的 `isTyping` 值被传递下来。通常只需看一眼该链上的所有组件就足以找到问题所在。

但是，如果 `useBailout()` Hook 真的存在，在你检查完 `ChatThread` 组件和它所有父组件中含有的组件里面的每个自定义 Hook (十分仔细地)之前，你将永远不会知道组件渲染更新被跳过的原因。与此同时，每一个父组件也能够使用自定义 Hooks，调试难度无疑成倍的[扩张](/the-bug-o-notation/)。

就像你在抽屉里寻找一把螺丝刀一样，每个抽屉里都装着一堆更小的抽屉柜，你永远不知道兔子洞有多深。

**结论：** 🔴 `useBailout()` Hook 不仅仅破坏了组件之间的组合性，而且还大大增加了调试步骤和对在找寻错误中认知难度的数量 — 在某种情况下，呈指数级增长。

---

在这里我们只讨论了一个真正的 Hook `useState()`，以及被建议成为 Hook 却不是真实存在的 Hook — `useBailout()`。我们通过组合和调试两方面的优劣对它们进行了比较，并且讨论了为什么其中一个能够工作而另一个却不能。

虽然我们没有 “Hook“ 版本的 `memo()` 或者 `shouldComponentUpdate()`，但 React 提供了一个 Hook 叫做 [`useMemo()`](https://reactjs.org/docs/hooks-reference.html#usememo)。它有类似的用途，但它的语义不同，因而并不会遇到上面所涉及的问题。

`useBailout()` 只是其中一个当作为 Hook 时并不能正常工作的例子。但是还有其他的一些 — 例如，`useProvider()`、`useCatch()` 或者 `useSuspense()`。

你能明白为什么吗？

*(低语：组合......调试......)*
