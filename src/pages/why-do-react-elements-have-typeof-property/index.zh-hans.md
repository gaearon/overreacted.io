---
title: 为什么React元素有一个$$typeof属性？
date: '2018-12-03'
spoiler: 有些部分是关于安全的。
---

你觉得你在写 JSX：

```jsx
<marquee bgcolor="#ffa7c4">hi</marquee>
```

其实，你在调用一个方法：

```jsx
React.createElement(
  /* type */ 'marquee',
  /* props */ { bgcolor: '#ffa7c4' },
  /* children */ 'hi'
)
```

之后方法会返回一个对象给你，我们称此对象为React的 *元素*（element），它告诉 React 下一个要渲染什么。你的组件（component）返回一个它们组成的树（tree）。

```jsx{9}
{
  type: 'marquee',
  props: {
    bgcolor: '#ffa7c4',
    children: 'hi',
  },
  key: null,
  ref: null,
  $$typeof: Symbol.for('react.element'), // 🧐是谁
}
```

如果你用过 React，对 `type`、 `props`、 `key`、 和 `ref` 应该熟悉。 **但 `$$typeof` 是什么？为什么用 `Symbol()` 作为它的值**？

这又是一个与你学习使用 React 不 *相关* 的点，但了解后你会觉得舒坦。这篇文章里也提到了些关于安全的提示，你可能会感兴趣。也许有一天你会有自己的UI库，这些都会派上用场的，我真的希望如此。

---

在客户端 UI 库变得普遍且具有基本保护作用之前，应用程序代码通常是先构建 HTML，然后把它插入 DOM 中：

```jsx
const messageEl = document.getElementById('message');
messageEl.innerHTML = '<p>' + message.text + '</p>';
```

这样看起来没什么问题，但当你 `message.text` 的值类似 `'<img src onerror="stealYourPassword()">'` 时，**你不会希望别人写的内容在你应用的 HTML 中逐字显示的。**

（有趣的是：如果你只是在前端渲染，这里为 `<script>` 标签，JavaScript 代码不会被运行。但[不要因此](https://gomakethings.com/preventing-cross-site-scripting-attacks-when-using-innerhtml-in-vanilla-javascript/)让你陷入已经安全的错觉。）

为什么防止此类攻击，你可以用只处理文本的 `document.createTextNode()` 或者 `textContent`等安全的 API。你也可以事先将用户输入的内容，用转义符把潜在危险字符（`<`、`>`等）替换掉。

尽管如此，这个问题的成本代价很高，且很难做到用户每次输入都记得转换一次。**因此像React等新库会默认进行文本转义：**

```jsx
<p>
  {message.text}
</p>
```

如果 `message.text` 是一个带有 `<img>` 或其他标签的恶意字符串，它不会被当成真的 `<img>` 标签处理，React 会先进行转义 *然后* 插入 DOM 里。所以 `<img>` 标签会以文本的形式展现出来。

要在 React 元素中渲染任意 HTML，你不得不写 `dangerouslySetInnerHTML={{ __html: message.text }}`。**其实这种愚蠢的写法是一个功能**，在 code reviews 和代码库审核时，你可以非常清晰的定位到代码。

---

**这意味着React完全不惧注入攻击了吗？不**，HTML 和 DOM 暴露了[大量攻击点](https://github.com/facebook/react/issues/3473#issuecomment-90594748)，对 React 或者其他 UI 库来说，要减轻伤害太难或进展缓慢。大部分存在的攻击方向涉及到属性，例如，如果你渲染 `<a href={user.website}`，要提防用户的网址是 `'javascript: stealYourPassword()'`。 像 `<div {...userData}>` 写法几乎不受用户输入影响，但也有危险。

React [可以](https://github.com/facebook/react/issues/10506)逐步提供更多保护，但在很多情况下，威胁是服务器产生的，这不管怎样都[应该](https://github.com/facebook/react/issues/3473#issuecomment-91327040)要避免。

不过，转义文本这第一道防线可以拦下许多潜在攻击，知道这样的代码是安全的就够了吗？

```jsx
// 自动转义
<p>
  {message.text}
</p>
```

**好吧，也不总是有效的**。这就是 `$$typeof` 的用武之地了。

---

React 元素（elements）是设计好的 *plain object*：

```jsx
{
  type: 'marquee',
  props: {
    bgcolor: '#ffa7c4',
    children: 'hi',
  },
  key: null,
  ref: null,
  $$typeof: Symbol.for('react.element'),
}
```

虽然通常用 `React.createElement()` 创建它，但这不是必须的。有一些 React 用例来证实像上面这样的 *plain object* 元素是有效的。当然，你不会*想*这样写的，但这[可以用来](https://github.com/facebook/react/pull/3583#issuecomment-90296667)优化编译器，在 workers 之间传递 UI 元素，或者将 JSX 从 React 包解耦出来。

但是，如果你的服务器有允许用户存储任意 JSON 对象的漏洞，而前端需要一个字符串，这可能会发生一个问题：

```jsx{2-10,15}
// 服务端允许用户存储 JSON
let expectedTextButGotJSON = {
  type: 'div',
  props: {
    dangerouslySetInnerHTML: {
      __html: '/* 把你想的搁着 */'
    },
  },
  // ...
};
let message = { text: expectedTextButGotJSON };

// React 0.13 中有风险
<p>
  {message.text}
</p>
```

在这个例子中，React 0.13[很容易](http://danlec.com/blog/xss-via-a-spoofed-react-element)受到 XSS 攻击。再次声明，**这个攻击是服务端存在漏洞导致的**。不过，React 会为了大家的安全做更多工作。从 React 0.14 开始，它做到了。

React 0.14 修复手段是用 Symbol 标记每个 React 元素（element）：

```jsx{9}
{
  type: 'marquee',
  props: {
    bgcolor: '#ffa7c4',
    children: 'hi',
  },
  key: null,
  ref: null,
  $$typeof: Symbol.for('react.element'),
}
```

这是个有效的办法，因为JSON不支持 `Symbol` 类型。**所以即使服务器存在用JSON作为文本返回安全漏洞，JSON 里也不包含 `Symbol.for('react.element')`**。React 会检测 `element.$$typeof`，如果元素丢失或者无效，会拒绝处理该元素。

特意用 `Symbol.for()` 的好处是 **Symbols 通用于 iframes 和 workers 等环境中**。因此无论在多奇怪的条件下，这方案也不会影响到应用不同部分传递可信的元素。同样，即使页面上有很多个 React 副本，它们也 「接受」 有效的 `$$typeof` 值。

---

如果浏览器不支持 [Symbols](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Symbol#Browser_compatibility) 怎么办？

唉，那这种保护方案就无效了。React仍然会加上 `$$typeof` 字段以保证一致性，但只是[设置一个数字](https://github.com/facebook/react/blob/8482cbe22d1a421b73db602e1f470c632b09f693/packages/shared/ReactSymbols.js#L14-L16)而已 —— `0xeac7`。

为什么是这个数字？因为 `0xeac7` 看起来有点像 「React」。
