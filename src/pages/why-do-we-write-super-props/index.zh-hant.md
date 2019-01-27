---
title: 為什麼我們要寫 super(props) ？
date: '2018-11-30'
spoiler: 在結尾有一個轉折。
---


我聽說 [Hooks](https://reactjs.org/docs/hooks-intro.html) 正夯， 但我想要從談論 *class* 有趣的小知識來開始這個部落格。如何？

**這些解釋對於有效地使用 React 並*不*重要，但對於喜歡深入了解其運作的你，將會發現當中有趣的事情。**

---

首先，我生命中寫過 `super(props)` 的次數比我想要知道的還多：

```jsx{3}
class Checkbox extends React.Component {
  constructor(props) {
    super(props);
    this.state = { isOn: true };
  }
  // ...
}
```

沒錯，[類別欄位提案](https://github.com/tc39/proposal-class-fields) 讓我們能省略宣告：

```jsx
class Checkbox extends React.Component {
  state = { isOn: true };
  // ...
}
```

類似這樣的語法是在 2015 年React 0.13 新增對一般類別的支援時就有的[計劃](https://reactjs.org/blog/2015/01/27/react-v0.13.0-beta-1.html#es7-property-initializers) 。定義 `constructor` 和呼叫 `super(props)` 的語法在當時一直都被當作是暫時的解決方法，直到類別欄位提供合適的替代方案。

但在此之前，讓我們回到只有使用 ES2015 的例子：

```jsx{3}
class Checkbox extends React.Component {
  constructor(props) {
    super(props);
    this.state = { isOn: true };
  }
  // ...
}
```

**為什麼我們要呼叫 `super`？能*不*呼叫嗎？或者是如果我們必須得呼叫，不帶入 `props` 會發生什麽事？還有其他有參數嗎？** 我們來看看。

---

在 JavaScript 中，`super` 會參照父類別的建構子。（在我們的例子當中，它會指向 `React.Component` 的實作。）

重要的是，直到你呼叫父類別的建構子*後*，你才能在建構子中使用 `this`。JavaScript 不會讓你這麼做：

```jsx
class Checkbox extends React.Component {
  constructor(props) {
    // 🔴 還不能用 `this`
    super(props);
    // ✅ 現在沒問題了
    this.state = { isOn: true };
  }
  // ...
}
```

JavaScript 會強制父建構子在你碰 `this` 前被執行是有原因的。想想類別的階層：

```jsx
class Person {
  constructor(name) {
    this.name = name;
  }
}

class PolitePerson extends Person {
  constructor(name) {
    this.greetColleagues(); // 🔴 這不被允許，看下面說明
    super(name);
  }
  greetColleagues() {
    alert('Good morning folks!');
  }
}
```

想像一下如果在 `super` 被呼叫前使用 `this` *是*被允許的會是怎樣的情況。幾個月後，我們可能想讓某人的名字包含在 `greetColleagues` 的訊息中：

```jsx
  greetColleagues() {
    alert('Good morning folks!');
    alert('My name is ' + this.name + ', nice to meet you!');
  }
```

但是我們忘了 `this.greetColleagues()` 是在 `super()` 有機會設置 `this.name` 之前就被呼叫了。所以 `this.name` 根本不曾被定義過！如你所見，這樣的程式碼是很難理解的。

為了避免踩這種雷，**如果你想在建構子中使用 `this`，JavaScript 強制你*必須*先呼叫 `super`**。讓父類別去做它的事！這個限制也適用於定義為類別的 React 元件：

```jsx
  constructor(props) {
    super(props);
    // ✅ 能使用 `this` 了
    this.state = { isOn: true };
  }
```

這裡留下了另一個問題：為什麼要帶入 `props`？

---

你可能會想，帶入 `props` 到 `super` 是必須的，因為底層的 `React.Component` 建構子才能初始化 `this.props`：


```jsx
// React 內部
class Component {
  constructor(props) {
    this.props = props;
    // ...
  }
}
```

這離真實情況相去不遠 — 的確，它是 [這麼做](https://github.com/facebook/react/blob/1d25aa5787d4e19704c049c3cfa985d3b5190e0d/packages/react/src/ReactBaseClasses.js#L22) 的。

但不知為何，即使你呼叫的是沒有帶入 `props` 參數的 `super()`，你仍然可以在 `render` 中或其他函式讀取 `this.props`。（如果你不相信我，自己試試看！）

那*這*是如何運作的？事實上 **在 React 呼叫*你的*建構子後，它也會馬上配置 `props` 到實例中：**

```jsx
  // React 內部
  const instance = new YourComponent(props);
  instance.props = props;
```

這就是為什麼就算你忘記帶入 `props` 到 `super()` 中，React 仍會在之後配置它。這是有原因的。

當 React 增加對類別的支援，它並不是只想增加對 ES6 類別的支援。它的目標是盡可能廣泛地支援抽象的類別。當時我們還 [不清楚](https://reactjs.org/blog/2015/01/27/react-v0.13.0-beta-1.html#other-languages) 如 ClojureScript，CoffeeScript，ES6，Fable，Scala.js，TypeScript 或其他的解決方案如何相對地成功定義元件，所以當時 React 是刻意設計成對是否必須呼叫 `super()` 這點睜一隻眼閉一隻眼的 —— 即使是 ES6 的類別也是如此。

所以意思是說你可以只寫 `super()` 而不用寫 `super(props)` 嗎？

**最好不要，因為這仍然會造成誤解。**沒錯，React 會在你的建構子執行之後自行配置 `this.props`。但是 `this.props` *從*呼叫 `super` 到建構子的結尾仍然會是未定義（undefined）。


```jsx{14}
// React 內部
class Component {
  constructor(props) {
    this.props = props;
    // ...
  }
}

// 你的程式碼內部
class Button extends React.Component {
  constructor(props) {
    super(); // 😬 我們忘了帶入 props
    console.log(props);      // ✅ {}
    console.log(this.props); // 😬 未定義（undefined）
  }
  // ...
}
```

如果某些*從*建構子中被呼叫的函式發生以上這種狀況，除錯將會更加艱難。**這就是為什麽我建議開發者總是要帶入 `super(props)`，即使這並非絕對必要：**

```jsx
class Button extends React.Component {
  constructor(props) {
    super(props); // ✅ 我們帶入 props
    console.log(props);      // ✅ {}
    console.log(this.props); // ✅ {}
  }
  // ...
}
```

這確保了 `this.props` 在建構子終止之前都會被設置。

-----

最後還有一點是長期以來 React 的使用者可能會感到好奇的。

你或許有注意到，當你在類別中使用 Context API（不論是舊有 `contextTypes` 或是從 React 16.6 新增的新式 `contextType` API），`context` 會作為第二個參數傳給建構子。

所以為什麼我們不取而代之寫成 `super(props, context)` 呢？其實我們可以，只是 context 使用的頻率比較低，會踩到的雷並不是那麼多。

**當有了類別欄位提案，整個這種的雷大部份都會消失。**在沒有標明建構子的狀況下，所有的參數都會自動地被帶入。這樣就允許了像 `state = {}` 這樣的表達式，在有需要的狀況下，還是能包含參考（reference） `this.props` 跟 `this.context` 的能力。

而當有了 Hooks 後，我們甚至不需要 `super` 或是 `this`。但這就改天再說了。
