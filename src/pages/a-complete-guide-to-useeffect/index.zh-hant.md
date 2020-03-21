---
title: useEffect 的完整指南
date: '2019-03-09'
spoiler: Effect 是你資料流的一部分。
---

你用 [Hooks](https://reactjs.org/docs/hooks-intro.html) 寫了一些元件。或許也寫了一個小的應用程式。你感到很滿足。你對它的 API 感到滿意而且在過程中學習了一些技巧。你甚至做了一些[客製化的 Hooks](https://reactjs.org/docs/hooks-custom.html) 來抽出重複的邏輯（移除 300 行程式碼！）然後跟你的同事炫耀。他們說「做得好」。

但有時候，當你使用 `useEffect` 時，某些程式碼片段感覺不太契合。你有一種好像你遺漏了什麼的感覺。它看起來像是 class 的生命週期... 但它真的是嗎？你發覺自己總是想著以下幾個問題：

* 🤔 我要怎麼用 `useEffect` 複製 `componentDidMount` 的行為？
* 🤔 我該怎麼正確的在 `useEffect` 裡拿到資料？`[]` 是什麼？
* 🤔 我應該要把用到的函式指定成 effect 的依屬 (dependencies) 嗎？
* 🤔 為什麼我有時候會陷入重複拿取資料的無窮迴圈？
* 🤔 為什麼我有時候會在 effect 裡拿到舊的 state 或 prop 的值？

當我剛開始使用 Hooks 的時候，我也對上述的問題感到困惑。甚至當我在寫初版的文件時，我沒有牢牢掌握一些細微的部分。在重新深入研究 `useEffect` 的過程中我有好幾次的「啊哈」頓悟時刻，我想把它們分享給你。**這樣的深入研究可以使你輕易理解上述問題的答案。**

為了*看到*答案，我們需要先退回一步。這篇文章的目標不是給你一個條列式的清單，而是為了幫助你真的「深入理解」`useEffect`。這裡不會有很多需要學習的事情。事實上，我們會花大部分的時間*忘記*學習過的東西。

**直到我停止透過過往熟悉的 class 生命週期模式去理解 `useEffect` Hook，所有東西才在我眼中匯聚在了一起。**

>「忘記你已經學習的。」 — 尤達

![尤達嗅了嗅空氣。字幕：「我聞到了培根。」](./yoda.jpg)

---

**這篇文章假設你已經有點熟悉 [`useEffect`](https://reactjs.org/docs/hooks-effect.html) 的 API 了。**

**這篇文章*真的*很長。他就像是一本迷你書。這只是我喜歡的形式。但我會在下面寫個摘要給那些匆忙或不那麼在乎的人閱讀。**

**如果你不想要深入研究，你可能會想要等到這些解釋在其他地方出現。就像 React 在 2013 年出現的時候，人們花了一些時間去認識不同的心理模型並教學它。**

---

## 摘要

如果你不想閱讀整篇文章，以下是快速的摘要。如果某些部分看起來不合理，你可以往下捲動直到你找到相關的東西。

如果你打算閱讀整篇文章，歡迎跳過摘要，我會在最後連結它們。

**🤔 問題：我要怎麼用 `useEffect` 複製 `componentDidMount` 的行為？**

你可以使用 `useEffect(fn, [])`，但它並不是完全相等。與 `componentDidMount` 不同，他會*捕捉* props 和 state。所以即使在 callbacks 裡面，你將會看到初始的 props 和 state。如果你想要看到*最新的*的東西，你可以把它寫到一個 ref。但其實通常有更簡單的方法來架構你的程式碼，所以你並不需要這麼做。記住你的 effects 的心理模型跟 `componentDidMount` 和其他的生命週期是不同的。嘗試想要找出它們相等的地方並不會幫助到你，反而只會讓你更困惑。為了能夠更有效率，你必須要「用 effects 的方式去思考」，而且比起回應生命週期事件，它的心理模型更接近於執行同步化(synchronization)。

**🤔 問題：我該怎麼正確的在 `useEffect` 裡拿到資料？`[]` 是什麼？**

[這篇文章](https://www.robinwieruch.de/react-hooks-fetch-data/)是一篇關於使用 `useEffect` 獲取資料的不錯的入門文章，它不像本篇文章一樣長，你最好把它完整讀過一遍！。`[]` 表示 effect 中沒有使用到任何被包含在 React 資料流中的值，所以 effect 可以很安全的只執行一次。而一個常見的 bug 錯誤來源就是我們在 `[]` 的狀況下，effect 中其實有用到被包含在 React 資料流中的值。你將會需要學習幾個策略（主要是 `useReducer` 和 `useCallback`）來移除在 `useEffect` 時加上依屬 (dependencies) 的必要性，而不是錯誤的忽略它。

**🤔 問題：我應該要把用到的函式指定成 effect 的依屬 (dependencies) 嗎？**

建議的做法是把不需要 props 或 state 的函式提升到元件*外面*，同時把只被某個 effect 用到的函式放到 effect *裡面*。如果這樣做後你的 effect 仍需要在渲染的範圍中使用函式（包含了 props 傳進來的函式），在定義它們的地方把它們包進 `useCallback`，並重複這個過程。為什麼這麼做很重要？因為函式可以「看見」props 和 state 中的值 -- 所以實際上函式它們是參與了資料流。這裡的常見問題裡有更[詳細的答案](https://reactjs.org/docs/hooks-faq.html#is-it-safe-to-omit-functions-from-the-list-of-dependencies)。

**🤔 問題：為什麼我有時候會陷入重複拿取資料的無窮迴圈？**

這可能發生在當你想要在 effect 裡獲取資料，卻沒有添加依屬 (dependencies) 參數的時候。沒有它，effects 會在每次渲染的時候發生 -- 並且設定 state 這件事會再度觸發 effects。一個無窮迴圈也有可能會因為你在依屬的陣列裡指定了一個*永遠*都會變化的值而發生。你可以藉由一個一個移除依屬 (dependencies) 來發現到底是哪個值。然而，移除一個依屬（或盲目地使用 `[]`）通常是錯誤的修正方式。相反的，你應該要修正這個問題的根源。例如，函式可能造成這個問題，將它們放到 effects 裡，或抽出他們到上層，或是將他們包在 `useCallback` 裡都可能會有幫助。為了避免重複產生新的物件，`useMemo` 也可以達成類似的目的。

**🤔 為什麼我有時候會在 effect 裡拿到舊的 state 或 prop 的值？**

Effects 永遠會「看見」在它們被定義的該次渲染中的 props 跟 state。這樣的機制能夠[幫助避免錯誤](/how-are-function-components-different-from-classes/)，但某些情況下卻也很惱人。在那些情況下，你可以在一個 易變的（mutable）的 ref 特別維護某些值（連結的文章在最後解釋了它）。試著用 [lint rule](https://github.com/facebook/react/issues/14920) 來訓練如何看它們。一些日子後，它會變得像是第二自然的事情。也在常見問題裡看看[這個答案](https://reactjs.org/docs/hooks-faq.html#why-am-i-seeing-stale-props-or-state-inside-my-function)。

---

我希望這個摘要是有幫助的！如果沒有的話，我們繼續往下看。

---

## 每次渲染都有他自己的 Props 和 State

在我們能夠討論 effects 以前，我們需要聊聊渲染。

以下是一個計數器。仔細看看強調的行數：

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

它代表什麼意思？ `count` 有「觀察」著我們的 state 的變化然後自動更新嗎？這可能是你學 React 有用的第一個直覺，但它並*不是*[精確的心理模型](https://overreacted.io/react-as-a-ui-runtime/)。

**在這個例子裡，`count` 只是一個數字。**它不是神奇的「data binding」、「watcher」、「proxy」或其他東西。它如同以下情形，是個好的舊的數字：

```jsx
const count = 42;
// ...
<p>You clicked {count} times</p>
// ...
```

當我們的元件第一次渲染的時候，我們從 `useState()` 拿到的 `count` 變數是 `0`。當我們呼叫 `setCount(1)` 之後，React 再次呼叫我們的元件。這次，`count` 將變成 `1`。所以：

```jsx{3,11,19}
// 在第一次渲染時
function Counter() {
  const count = 0; // 被 useState() 回傳
  // ...
  <p>You clicked {count} times</p>
  // ...
}

// 經過一次點擊，我們的函式再次被呼叫
function Counter() {
  const count = 1; // 被 useState() 回傳
  // ...
  <p>You clicked {count} times</p>
  // ...
}

// 經過另一次點擊，我們的函式再次被呼叫
function Counter() {
  const count = 2; // 被 useState() 回傳
  // ...
  <p>You clicked {count} times</p>
  // ...
}
```

**每當我們更新 state， React 呼叫我們的元件。每次渲染的結果會「看見」他自己的 `counter` state 的值，而在我們的函式裡它是個*常數*。**

所以這行不會做任何特別的 data binding：

```jsx
<p>You clicked {count} times</p>
```

**它只會將一個數字的值放進我們渲染的輸出結果。**那個數字是由 React 所提供的。當我們 `setCount`，React 帶著不同的 `count` 值再次呼叫我們的元件。然後 React 更新 DOM 來對應我們最新的渲染結果。

關鍵要點是，在任何渲染裡面的 `count` 常數不會經由時間而改變。是我們的元件再次被呼叫 -- 然後每次的渲染「看見」它自己的 `count` 值，這個值是孤立於每次的渲染的。

*(想要更深入了解這個過程，看看我的 [React as a UI Runtime](https://overreacted.io/react-as-a-ui-runtime/) 的文章)*

## 每次渲染都有它自己的 Event Handlers

目前為止還滿好的。那 event handler 呢？

看看以下的例子，它在三秒之後呈現了一個 `count` 的警告（alert）：

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

假設我做了以下幾個步驟：

* **增加** 計數器到 3
* **按下** 「Show alert」
* **增加** 計數器到 5 （在 timeout 發生以前）

![計數器示範](./counter.gif)

你預期 alert 會顯示什麼？它會顯示 5 -- 計數器在 alert 時的狀態？還是它會顯示 3 -- 當我點擊時的狀態？

----

*以下有劇透*

---

去[自己試試看吧！](https://codesandbox.io/s/w2wxl3yo0l)

如果這個行為對你來說不太合理，請想像一個更實際的例子：一個擁有現在接收者 ID 的狀態的聊天應用程式，和一個送出按鈕。[這篇文章](https://overreacted.io/how-are-function-components-different-from-classes/)探索了深入的原因，而正確的答案是 3。

警告會「捕捉」到我按下按鈕時的狀態。

*（有各種方法來實作其他的行為，但現在我會關注在預設的情形。當建構一個心理模型的時候，我們從可選擇的逃生艙口裡來區分「最少阻力路徑」是重要的。）*

---

但它是怎麼運作的？

我們討論了 `count` 值對我們函式的每個特定的呼叫是常數。這個是值得強調的 -- **我們的函式被呼叫了很多次（每次渲染一次），但每次裡面的 `count` 值都是常數，並且被設定到某個特定的值（渲染的 state）**

這並不是針對 React -- 正常的函式也有類似的運作方式：

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

在[這個範例](https://codesandbox.io/s/mm6ww11lk8)裡面，外面的 `someone` 變數被多次重新賦值。（就如同 React 的某些地方，*現在*的 state 可以改變。）**然而，在 `sayHi` 裡面，有個在特定呼叫裡跟本地的 `name` 常數關聯的 `person`。**這個常數是本地的，所以它在每次的呼叫之間都是孤立的！因此，每當 timeout 觸發的時候，每個警告會「記得」它自己的 `name`。

這個解釋了我們的 event handler 捕捉了點選時的 `count`。如果我們應用相同的代換原則，每次的渲染會「看到」它自己的 `count`：

```jsx{3,15,27}
// 在第一次渲染時
function Counter() {
  const count = 0; // 被 useState() 回傳
  // ...
  function handleAlertClick() {
    setTimeout(() => {
      alert('You clicked on: ' + count);
    }, 3000);
  }
  // ...
}

// 經過一次點擊，我們的函式再次被呼叫
function Counter() {
  const count = 1; // 被 useState() 回傳
  // ...
  function handleAlertClick() {
    setTimeout(() => {
      alert('You clicked on: ' + count);
    }, 3000);
  }
  // ...
}

// 經過另一次點擊，我們的函式再次被呼叫
function Counter() {
  const count = 2; // 被 useState() 回傳
  // ...
  function handleAlertClick() {
    setTimeout(() => {
      alert('You clicked on: ' + count);
    }, 3000);
  }
  // ...
}
```

事實上，每次渲染會回傳它自己「版本」的 `handleAlertClick`。每個版本「記得」它自己的 `count`：

```jsx{6,10,19,23,32,36}
// 在第一次渲染時
function Counter() {
  // ...
  function handleAlertClick() {
    setTimeout(() => {
      alert('You clicked on: ' + 0);
    }, 3000);
  }
  // ...
  <button onClick={handleAlertClick} /> // 有 0 在裡面的那一個
  // ...
}

// 經過一次點擊，我們的函式再次被呼叫
function Counter() {
  // ...
  function handleAlertClick() {
    setTimeout(() => {
      alert('You clicked on: ' + 1);
    }, 3000);
  }
  // ...
  <button onClick={handleAlertClick} /> // 有 1 在裡面的那一個
  // ...
}

// 經過另一次點擊，我們的函式再次被呼叫
function Counter() {
  // ...
  function handleAlertClick() {
    setTimeout(() => {
      alert('You clicked on: ' + 2);
    }, 3000);
  }
  // ...
  <button onClick={handleAlertClick} /> // 有 2 在裡面的那一個
  // ...
}
```

這就是為什麼在這個[示範裡面](https://codesandbox.io/s/w2wxl3yo0l)， event handlers 「屬於」一個特定的渲染，當你點擊後，它持續地用那個渲染*裡* `counter` 的狀態。


**在任何特定的渲染裡面，props 和 state 會永遠保持一樣。**但如果 props 和 state 在每次渲染之間都是孤立的，那任何用了它們的值都是這樣（包含 event handlers）。它們也「屬於」一個特定的渲染。所以甚至在 event handler 裡的 async 函式會「看到」一樣的 `count` 值。

*筆記：我將具體的 `count` 值寫在上面的 `handleAlertClick` 函式。這個心理的代換是安全的，因為 `count` 不可能在特定的渲染裡面改變。它被宣告為 `常數` 而且是個數字。安全的想法是將其它的值，如物件，也用相同的方式來思考，但只在我們同意避免變異（mutating）狀態。用新創造的物件呼叫 `setSomething(newObj)` 而不去變異它是可行的，因為屬於前一個渲染的 state 是完好的。*

## 每次的渲染都有它自己的 Effects

本篇文章應該要是討論關於 effects，但我們還沒聊到 effects！現在我們會拉回來。顯然地，effects 並沒什麼不同。

讓我們回到[文件](https://reactjs.org/docs/hooks-effect.html)裡的範例：

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

**這裡有個問題要給你：effect 如何讀取最新的 `count` 狀態呢？**

或許，這裡有某種「data binding」或「觀看」，使得 `count` 即時在 effect 函式裡面更新？或許 `count` 是個  React 能夠設定在我們的元件裡面的 mutable 的變數，所以我們的 effect 永遠都可以看得到最新的值？

不。

我們已經知道 `count` 是個在特定元件渲染裡面的常數。Event handlers 之所以能夠「看見」它們「所屬的」渲染裡的 `count` 的狀態，是因為 `count` 是個在它範圍裡的變數。而 Effects 也是相同的道理！

**並不是 `count` 變數因為某種原因在「不變的」 effect 裡改變了。是因為 _effect 函式本身_ 在每次的渲染都是不同的。**

每個版本「看見」它「所屬的」渲染的 `count` 值：

```jsx{5-8,17-20,29-32}
// 在第一次渲染時
function Counter() {
  // ...
  useEffect(
    // 在第一次渲染時的 Effect 函式
    () => {
      document.title = `You clicked ${0} times`;
    }
  );
  // ...
}

// 經過一次點擊，我們的函式再次被呼叫
function Counter() {
  // ...
  useEffect(
    // 在第二次渲染時的 Effect 函式
    () => {
      document.title = `You clicked ${1} times`;
    }
  );
  // ...
}

// 經過另一次點擊，我們的函式再次被呼叫
function Counter() {
  // ...
  useEffect(
    // 在第三次渲染時的 Effect 函式
    () => {
      document.title = `You clicked ${2} times`;
    }
  );
  // ..
}
```

React 記得你提供的 effect 函式，且在一堆 DOM 的變化後執行它，然後讓瀏覽器將畫面顯示在螢幕上。

所以即使在這裡我們討論了一個單一的 *effect* 概念（更新文件的標題），它是在每次渲染被*不同的函式*所呈現的 -- 每個 effect 函式「看到」專屬於它的 props 和 state。

**概念上來說，你可以想像 effects 是*渲染結果的一部分*。**

嚴謹的來說，它們不是（為了[允許 hooks 的組成](https://overreacted.io/why-do-hooks-rely-on-call-order/)不用麻煩的 syntax 或 runtime 開銷）。但在我們所建造的心理模型下， effect 函式「屬於」一個特定的渲染，就如同 event handlers 所做的事情一樣。

---

為了確保我們有紮實的了解，讓我們來回顧我們第一次的渲染：

* **React：**給我一個當狀態是 `0` 的使用者介面。
* **你的元件：**
  * 這裡是一個渲染的結果：
  `<p>You clicked 0 times</p>`.
  * 另外記得在你完成之後執行這個 effect：`() => { document.title = 'You clicked 0 times' }`。
* **React：** 好的。更新使用者介面。嘿瀏覽器，我要在 DOM 上面增加一些東西。
* **瀏覽器：** 酷，我把它畫在螢幕上了。
* **React：** 好的，現在我要開始執行你給我的 effect。
  * 執行 `() => { document.title = 'You clicked 0 times' }`。

---

現在讓我們來回顧在我們點擊之後發生了什麼事：

* **你的元件：** 嘿 React，把我的狀態設成 `1`。
* **React:** 給我一個當狀態是 `1` 的介面。
* **你的元件：**
  * 這裡是渲染的結果：
  `<p>You clicked 1 times</p>`.
  * 另外記得在你完成之後執行這個 effect： `() => { document.title = 'You clicked 1 times' }`.
* **React:** 好的。更新使用者介面。嘿瀏覽器，我改變了 DOM。
* **瀏覽器：** 酷，我把你的改變畫在螢幕上了。
* **React:** 好的，現在我要開始執行屬於我剛剛渲染的 effect。
  * 執行 `() => { document.title = 'You clicked 1 times' }`。

---

## 每次渲染都有他自己的... 所有東西

**我們現在知道了 effects 會在每次渲染過後執行，是概念上元件輸出的一部分，然後「看見」 那個特定渲染的 props 和 state。**

讓我們來試試一個想像實驗。試著考慮下面的程式碼：

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

如果我在很小的延遲時間內點擊了好幾次，請問 log 會看起來像怎樣？

---

*以下有劇透*

---

你可能會想這個是個 gotcha 且最後的結果不直覺。它不是！我們將會看見一個序列的 logs -- 每個都屬於某個特定的渲染，且因此有它自己的 `count` 值。你可以[自己試試看](https://codesandbox.io/s/lyx20m1ol)：


![螢幕紀錄了 1, 2, 3, 4, 5 照著順序的 log。](./timeout_counter.gif)

你可能會想：「當然這是它所執行的方式！它可能有什麼別的運作方式嗎？」

這個並不是 `this.state` 在 class 裡所運作的方式。很容易會犯下覺得它的[class 實作](https://codesandbox.io/s/kkymzwjqz3)等同於以下程式碼的錯誤：

```jsx
  componentDidUpdate() {
    setTimeout(() => {
      console.log(`You clicked ${this.state.count} times`);
    }, 3000);
  }
```

然而，`this.state.count` 永遠指向*最後的*計數，而不是屬於某個特定渲染的值。所以你會看到每次的 log 都是 `5`：

![螢幕紀錄了 5, 5, 5, 5, 5 照著順序的 log。](./timeout_counter_class.gif)

我想這是諷刺的，Hooks 居然這麼依賴 JavaScript 的 closures，然而它卻是 class 的實作，深陷於通常與 closure 關聯的[典型的 wrong-value-in-a-timeout 困惑](https://wsvincent.com/javascript-closure-settimeout-for-loop/)。這是因為在這個例子中實際造成困惑的源頭是 mutation（React 在 class 裡變異 `this.state` 來指出最新的狀態）而不是 closure 本身。

**你的值不會變化的時候，Closure 很棒。它讓它們能夠更簡單的被思考，因為你最後會參考常數。**而且如同我們討論的，props 和 state 永遠不會在特定的渲染裡面改變。順帶一提，我們可以把 class 的版本修正... 藉由[使用 closure](https://codesandbox.io/s/w7vjo07055)。

## 逆流而行

在這個時間點將它特別說出來是重要的：**每個**在元件裡渲染的函式（包含裡面的 event handler、effects、timeout 或 API 呼叫）捕捉了定義他們的渲染所呼叫的 props 和 state。

所以這裡是兩個相等的例子：

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

**無論你是否「提早」讀取你元件裡的 props 或 state。**它們都不會改變！在單一個渲染的範圍裡，props 和 state 會保持一樣。（解構 props 讓這個更為明顯。）

當然，有時候你*想要*讀取最新的值而不是某個在 effect 的 callback 裡所捕捉到的值。最簡單的方法是使用 refs，如同在[這篇文章](https://overreacted.io/how-are-function-components-different-from-classes/)最後一個小節所敘述的。

請注意，當你想要從*過去*的渲染函式讀取*未來*的 props 或 state 時，你是逆流而行的。它不是*錯誤*（而且在某些時候是必須的）但破壞範例可能會看起來比較不「乾淨」。這是故意的結果，因為它幫助凸顯哪個程式碼是易碎的且依賴於時間點。在 class 裡面，當這發生的時候它比較不明顯。

這裡是一個[我們計數器範例的版本](https://codesandbox.io/s/rm7z22qnlp)，它複製了 class 的行為：

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

![螢幕紀錄了 5, 5, 5, 5, 5 照著順序的 log。](./timeout_counter_refs.gif)

在 React 裡變異某些東西可能看起來有點詭異。然而，這個是實際上 React 本身如何重新賦值給 class 裡的 `this.state` 的方式。不像被捕捉的 props 和 state，你並沒有任何在特定的 callback 裡讀取 `latestCount.current` 會給你相同值的保證。定義上，你可以在任意時間變異它。這就是為何它不是預設值的原因，而且你必須接受它。

## 所以 Cleanup 呢？

如同[文件解釋](https://reactjs.org/docs/hooks-effect.html#effects-with-cleanup)，有些 effects 可能有 cleanup 的面相。最終，它的目的是為了某些情形，例如訂閱，來「取消」effect。

考慮下面的程式碼：

```jsx
  useEffect(() => {
    ChatAPI.subscribeToFriendStatus(props.id, handleStatusChange);
    return () => {
      ChatAPI.unsubscribeFromFriendStatus(props.id, handleStatusChange);
    };
  });
```

假設 `props` 在第一次渲染是 `{id: 10}`，然後在第二次渲染是 `{id: 20}`。你*可能*會想類似以下的事情會發生：

* React 為了 `{id: 10}` 清理 effect。
* React 為了 `{id: 20}` 渲染使用者介面。
* React 為了 `{id: 20}` 執行 effect。

（這其實並不太是真實的情形。）

以這樣的心理模型來看，你可能會想，cleanup 因為在我們重新渲染以前執行所以可以「看見」舊的 props，然後新的 effect  因為在重新渲染之後執行，所以「看見」新的 props。這是直接從 class 的生命週期所推想的心理模型，然而**它在這裡並不是準確的**。我們來看看為什麼。

React 只會在[讓瀏覽器繪圖](https://medium.com/@dan_abramov/this-benchmark-is-indeed-flawed-c3d6b5b6f97f)之後執行 effects。這使得你的應用程式更快，因為大部分的 effect 不會阻擋畫面的更新。Effect 的清理也會被延遲。**前一個 effect 會在用新的 props 渲染 _之後_ 被清掉：**

* **React 為了 `{id: 20}` 渲染使用者介面。**
* 瀏覽器畫出畫面。我們在畫面上看見 `{id: 20}` 的使用者介面。
* **React 為了 `{id: 10}` 清掉 effect。**
* React 為了 `{id: 20}` 執行 effect。

你可能會想：然而，如果它在 props 改變成 `{id: 20}` *之後*執行，前一次的 effect 的清理怎麼仍然能夠「看到」舊的 `{id: 10}` props 呢？

我們曾經在這裡過... 🤔

![既視感（駭客任務裡的貓咪場景）](./deja_vu.gif)

引述前一個章節：

>每個在元件裡渲染的函式（包含 event handlers、effects、timeouts 或裡面呼叫的 API）會捕捉到定義它的渲染裡的 props 和 state。

現在答案很清楚了！Effect 的清理並不是讀到了「最新的」props，無論它代表什麼。它讀取了定義它且所屬的渲染裡的 props：

```jsx{8-11}
// 第一次渲染，props 是 {id: 10}
function Example() {
  // ...
  useEffect(
    // 第一次渲染的 Effect
    () => {
      ChatAPI.subscribeToFriendStatus(10, handleStatusChange);
      // 清理第一次渲染的 effect
      return () => {
        ChatAPI.unsubscribeFromFriendStatus(10, handleStatusChange);
      };
    }
  );
  // ...
}

// 下一次渲染，props 是 {id: 20}
function Example() {
  // ...
  useEffect(
    // 第二次渲染的 Effect
    () => {
      ChatAPI.subscribeToFriendStatus(20, handleStatusChange);
      // 清理第二次渲染的 effect
      return () => {
        ChatAPI.unsubscribeFromFriendStatus(20, handleStatusChange);
      };
    }
  );
  // ...
}
```

王國會興盛然後轉變為塵埃，太陽會殆盡外層變成白矮星，最後的文明會結束。但沒有任何一個東西可以使得 props 除了 `{id: 10}` 以外的東西被第一個渲染的 effect 的清理所「看見」。

這就是 React 利用來處理繪圖之後的 effects -- 而且讓你的應用程式預設很快。如果我們需要，舊的 props 仍在那。

## 同步化，而非生命週期

React 裡其中一個讓我最喜歡的事情是它統一了敘述最初的渲染結果和之後的更新。這個讓你的程式[減少了亂度](https://overreacted.io/the-bug-o-notation/)。

假設我的元件看起來像這樣：

```jsx
function Greeting({ name }) {
  return (
    <h1 className="Greeting">
      Hello, {name}
    </h1>
  );
}
```

無論我渲染了 `<Greeting name="Dan" />` 然後 `<Greeting name="Yuzhi" />`，還是我只是單純的渲染了`<Greeting name="Yuzhi" />`。最終，我們在兩種情況都會看見「Hello, Yuzhi」。

人們說：「重要的是過程，不是目的地」。對 React 來說則是相反的。**重要的是目的地，不是過程。**這是跟在 jQuery 程式碼裡呼叫 `$.addClass` 和 `$.removeClass`（我們的「過程」）和特別標示出哪個 CSS class *應該*在 React 程式碼裡（我們的「目的地」）的不同之處。

**React 根據我們現在的 props 和 state 同步了 DOM。**在渲染時「mount」或「更新」之間並沒有差異。

你應該用相似的想法來思考 effects。**`useEffect` 讓你根據我們的 props 和 state 來 _同步_ 在 React 樹外的東西。**

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

這是有點不同於你所熟悉的 *mount/update/unmount* 心理模型。真的把這件事內化是很重要的。**如果你試著把 effects 寫成與元件是否第一次渲染有關而不同，你是在嘗試逆流而行！**如果我們的結果依賴於「過程」而不是「目的地」，我們會同步化失敗。

它不應該與我們用 props A, B, C 渲染，或是我們直接渲染 C 有關。然而可能有些暫時的差異（例如，當我們獲取資料時），最終結果應該要一樣。

相同的，在*每個*渲染執行所有 effects 可能不是很有效。（而且在某些情況下，它會導致無窮迴圈。）

所以我們要怎麼修正它？

## 教導 React 來區別你的 Effects

我們已經學到了關於 DOM 本身的一課。React 只會更新部分真的改變的 DOM 而不是每次重新渲染時觸碰它。

當你更新

```jsx
<h1 className="Greeting">
  Hello, Dan
</h1>
```

到

```jsx
<h1 className="Greeting">
  Hello, Yuzhi
</h1>
```

React 看見兩個物件：

```jsx
const oldProps = {className: 'Greeting', children: 'Hello, Dan'};
const newProps = {className: 'Greeting', children: 'Hello, Yuzhi'};
```

它跑過它的每個 props 然後決定哪個 `children` 改變了且需要更新 DOM，但 `className` 不是。所以它可以只要這樣做：

```jsx
domNode.innerText = 'Hello, Yuzhi';
// 沒有必要觸碰 domNode.className
```

**我們可以用 effects 做類似的事情嗎？如果能夠避免在非必要執行 effect 的時候重新執行它，這樣會很棒。**

例如，可能我們的元件因為狀態改變而重新渲染：

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

但我們的 effect 並沒有使用到 `counter` 的狀態。**我們的 effect 用 `name` prop 同步了 `document.title`，但 `name` prop 保持一樣。**在每次計數器改變時重新賦予 `document.title` 新的值看起來不太理想。

OK，所以 React 可以單純的... 比較 effects 的差異嗎？


```jsx
let oldEffect = () => { document.title = 'Hello, Dan'; };
let newEffect = () => { document.title = 'Hello, Dan'; };
// React 可以看到這些函式做了一樣的事嗎？
```

不太行。React 不能在沒有呼叫函式以前猜出它在做什麼。（源頭並沒有包含特定的值，它只是關掉了 `name` prop。）

這就是為什麼如果你想要避免非必要的重新執行 effects，你可以提供一個依屬（dependency）的陣列（也叫做「deps」）的參數給 `useEffect`：

```jsx{3}
  useEffect(() => {
    document.title = 'Hello, ' + name;
  }, [name]); // 我們的 deps
```

**這就像如果我們告訴 React：「嘿，我知道你不能看見函式 _裡面_，但我保證他只會用到 `name` 而不會有其他渲染層面的東西。」**

如果在這次和前一次執行 effect 時，這些的每個值都是一樣的，就沒有什麼需要同步的東西，所以 React 可以跳過這個 effect：

```jsx
const oldEffect = () => { document.title = 'Hello, Dan'; };
const oldDeps = ['Dan'];

const newEffect = () => { document.title = 'Hello, Dan'; };
const newDeps = ['Dan'];

// React 不能偷看函式的裡面，但它可以比較 deps。
// 因為所有 deps 都是相同的，它不需要執行新的 effect。
```
如果有任何一個這樣的值在依屬陣列裡在渲染之間有所不同，我們知道我們不能跳過執行 effect。要同步所有的東西！

## 不要對 React 說關於依屬的謊

對 React 說關於依屬的謊會有不好的結果。直覺上，這很合理，但我看過幾乎每個擁有 class 心理模型的人在嘗試使用`useEffect` 時，嘗試著要欺騙規則。（我一開始也這樣做過！）

```jsx
function SearchResults() {
  async function fetchData() {
    // ...
  }

  useEffect(() => {
    fetchData();
  }, []); // 這樣可以嗎？並不是永遠都可以 -- 而且有更好的方式來寫它。

  // ...
}
```

*([Hooks 常見問題](https://reactjs.org/docs/hooks-faq.html#is-it-safe-to-omit-functions-from-the-list-of-dependencies) 解釋了應該怎麼做。 我們會回到[下面的](#moving-functions-inside-effects)例子。)*

你會說「但我只想要在 mount 的時候執行它！」。現在，請記得：如果你特別列出了 deps，**_所有_ 在你元件裡被 effect 用到的值 _一定_ 要在那裡。**包含了 props、state、函式 -- 任何在你元件裡的東西。

有時候當你這樣做，它會導致問題。例如，可能你會看見無窮重新獲取的迴圈，或一個 socket 太常被重新產生。**這個問題的解法並 _不是_ 拿掉依屬。**我們很快會看見解法。

但在我們跳到解法之前，讓我們先再釐清我們的問題。

## 當欺騙依屬的時候會發生什麼事

如果 deps 包含了每個 effect 所用到的值，React 知道什麼時候重新執行它：

```jsx{3}
  useEffect(() => {
    document.title = 'Hello, ' + name;
  }, [name]);
```

![Effect 代換兩個東西的圖](./deps-compare-correct.gif)

*（依屬不同了，所以我們重新執行 effect。）*

但當我們對這個 effect 宣告使用 `[]`，新的函式不會執行：

```jsx{3}
  useEffect(() => {
    document.title = 'Hello, ' + name;
  }, []); // 錯誤：name 不在 deps 裡
```

![Effect 代換兩個東西的圖](./deps-compare-wrong.gif)

*（依屬相同，所以我們跳過 effect。）*

在這個例子下問題可能不太明顯。但當 class 解法「跳出」你的記憶時，直覺會在別的情況下欺騙你。

舉例來說，假設我們寫了一個每秒增加的計數器。用 class，我們的直覺是：「設定一次區間，然後摧毀一次」。這裡是我們可以怎麼做的一個[例子](https://codesandbox.io/s/n5mjzjy9kl)。當我們心理上想要把這段程式碼翻譯到 `useEffect` 時，我們會直覺的把 `[]` 加到 deps。「我想要執行它一次」，對吧？

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

然而，這個例子[只*增加*了一次](https://codesandbox.io/s/91n5z8jo7r)。*Oops*

如果你的心理模型是「依屬可以讓我設定我想要重新觸發 effect 的時候」，這個例子可能會給你災難。因為它是一個區間，所以你*想要*觸發它一次 -- 所以為什麼這個會導致問題？

然而，如果你知道依屬是我們給 React 所提供關於*所有*那個 effect 在渲染範圍所使用的提示的話，這樣很合理。它用了`count`，但我們利用 `[]` 欺騙它沒有用。在它反咬我們一口前只是時間問題！

在第一次渲染，`count` 是 `0`。因此，在第一次渲染的 effect 裡的 `setCount(count + 1)` 代表 `setCount(0 + 1)`。**因為 `[]` deps 所以我們沒有重新執行 effect，它會保持每秒都呼叫 `setCount(0 + 1)`：**

```jsx{8,12,21-22}
// 第一次渲染，state 是 0
function Counter() {
  // ...
  useEffect(
    // 第一次渲染的 Effect
    () => {
      const id = setInterval(() => {
        setCount(0 + 1); // 永遠 setCount(1)
      }, 1000);
      return () => clearInterval(id);
    },
    [] // 永遠不會重新執行
  );
  // ...
}

// 每個下一次的渲染，state 是 1
function Counter() {
  // ...
  useEffect(
    // 這個 effect 會永遠被忽略，因為
    // 我們對 React 說了空 deps 的謊。
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

我們欺騙了 React 告訴它我們的 effect 不依賴任何元件裡的值，但實際上它有！

我們的 effect 使用了 `count` -- 一個在元件裡的值（但在 effect 之外）：

```jsx{1,5}
  const count = // ...

  useEffect(() => {
    const id = setInterval(() => {
      setCount(count + 1);
    }, 1000);
    return () => clearInterval(id);
  }, []);
```

因此，宣告 `[]` 當作依屬會導致錯誤。React 會比較依屬，然後跳過更新這個 effect：

![陳舊的區間 closure 的圖](./interval-wrong.gif)

*（依屬相同，所以我們跳過 effect。）*

這樣的問題是很難想像的。因此，我鼓勵你把它當作一個必須遵守的規則來永遠誠實面對 effect 的依屬，然後宣告全部。（如果你想要在你的組裡強制這件事，我們提供了一個[lint rule](https://github.com/facebook/react/issues/14920)。）

## 兩種對依屬誠實的方法

有兩個誠實對待依屬的策略。你應該從第一個開始，然後必要時再執行第二個。

**第一個策略是修正依屬陣列來包含 _所有_ 在元件裡被 effect 所用到的值。**讓我們把 `count` 當作 dep：

```jsx{3,6}
useEffect(() => {
  const id = setInterval(() => {
    setCount(count + 1);
  }, 1000);
  return () => clearInterval(id);
}, [count]);
```

這使得依屬的陣列正確。它可能不是*理想的*，但它是第一個我們需要修正的問題。現在 `count` 的改變會重新執行 effect，每個下次的區間參考了 `count` 渲染的 `setCount(count + 1)`：

```jsx{8,12,24,28}
// 第一次渲染，state 是 0
function Counter() {
  // ...
  useEffect(
    // 第一次渲染的 Effect
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

// 第二次渲染，state 是 1
function Counter() {
  // ...
  useEffect(
    // 第二次渲染的 Effect
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

這會[修正問題](https://codesandbox.io/s/0x0mnlyq8l)，但每當 `count` 改變時，我們的區間會被清掉再重設。這可能不是我們想要的：

![區間重新訂閱的圖](./interval-rightish.gif)

*（依屬不同了，所以我們重新執行 effect。）*

---

**第二個策略是改變我們的 effect 程式碼，讓它不會*需要*一個超過我們預想的經常改變的值。**我們不想要對依屬說謊 -- 我們只想要改變我們的 effect 使它擁有*少一點*依屬。

讓我們來看看幾個常見的移除依屬的技巧。

---

## 讓 Effect 自給自足

我們想要把 `count` 依屬移出我們的 effect。

```jsx{3,6}
  useEffect(() => {
    const id = setInterval(() => {
      setCount(count + 1);
    }, 1000);
    return () => clearInterval(id);
  }, [count]);
```

為了做到這樣，我們需要問問我們自己：**我們為了什麼使用 `count` 呢？**看起來我們只為了呼叫 `setCount` 而用它。在這樣的情況下，我們並不真的需要 `count`。當我們想要根據前一次的 state 來更新現在的 state，我們可以使用 `setState` 的 [函數形式的更新(functional updater form)](https://reactjs.org/docs/hooks-reference.html#functional-updates)：

```jsx{3}
  useEffect(() => {
    const id = setInterval(() => {
      setCount(c => c + 1);
    }, 1000);
    return () => clearInterval(id);
  }, []);
```

我喜歡把這些情況想成是「錯誤的依屬」。是的，`count` 是必須的依屬，因為我們在 effect 裡寫了 `setCount(count + 1)`。但是，我們只真的需要 `count` 來把它轉換為 `count + 1`，然後「把它送回去」給 React。但 React *已經知道*目前的 `count` 了。**我們只需要告訴 React 增加這個 state -- 無論它現在是什麼。**

這就是 `setCount(c => c + 1)` 所在做的事情。你可以想像它是給 React「送出一個教學」，這個教學是關於狀態該如何改變。這種更新的方式也對其他情況有幫助，像是當你 [批次更新多樣東西](/react-as-a-ui-runtime/#batching)的時候。

**注意我們實際上 _做了工_ 來移除依屬。我們並不是在欺騙。我們的 effect 再也不會從渲染的範圍讀取 `counter` 的值：**

![可行的區間的圖](./interval-right.gif)

*(依屬相同，我們跳過 effect。)*

你可以在[這裡](https://codesandbox.io/s/q3181xz1pj)試試看。

即使這個 effect 只執行了一次，屬於第一次渲染的區間的 callback 是有能力每次在區間觸發的時候送出 `c => c + 1` 這個更新的教學。它再也不需要知道現在的 `counter` 狀態。React 已經知道它了。

## 函式更新和 Google 文件

記得我們討論到同步化是為了 effect 的心理模型嗎？同步化的有趣之處是你常常會想要保持系統之間的「訊息」與它們的狀態分離。舉例來說，編輯一個 Google 文件並不會真的送出*完整*的頁面到伺服器。那會非常沒有效率。相反的，它送出一個使用者想要做的事情的表示。

當我們的使用情境不同時，相似的哲學仍適用於 effect。**它幫助了我們從 effect 裡只送出最小需要的資訊到元件裡。**更新的表單像是 `setCount(c => c + 1)` 傳達了比起 `setCount(count + 1)` 還少的資訊，因為它並沒有被現在的計數給污染。它只表達了動作（「增加」）。想像 React 包含了[找到最少的 state](https://reactjs.org/docs/thinking-in-react.html#step-3-identify-the-minimal-but-complete-representation-of-ui-state)。這是相同的原則，但是為了更新。

將*意圖*編碼（而不是結果）與 Google 文件如何[解決](https://medium.com/@srijancse/how-real-time-collaborative-editing-work-operational-transformation-ac4902d75682)協作編輯是相似的。雖然這是延伸的類比，函式更新在 React 裡代表了相似的角色。它們保證了從多個來源（event handlers、events subscription 等）來的更新可以被正確且以可預期的方式來批次應用。

**然而，即使是 `setCount(c => c + 1)` 也不是那麼棒。**它看起來有點奇怪，而且限制了很多我們能做的東西。例如，如果我們有兩個狀態的變數，它們的值依賴於彼此，或是如果我們想要根據 props 來計算下一個 state，它並不能幫助到我們。幸運的，`setCount(c => c + 1)` 有更強大的姐妹模式。它的名字叫做 `useReducer`。

## 從動作分離更新

讓我們修改一下前面的例子，使得我們有兩個 state 變數：`count` 和 `step`。我們的區間會根據 `step` 輸入的值來增加計數：

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

(這裡是[示範](https://codesandbox.io/s/zxn70rnkx).)

注意**我們並不是在欺騙。**因為我在 effect 裡開始使用 `step`，我把它加進依屬裡。這就是為什麼我們的程式碼能夠正確執行。

這個例子裡，現在的行為是改變 `step` 會重新開始區間 -- 因為它是我們其中一個依屬。在很多情況下，這就是你所想要的！解開一個 effect 並重新設定它並沒有任何錯，而且除非我們有好的理由，否則我們不應該避免這樣。

然而，假設我們不想要區間時鐘在 `step` 改變時重設，我們應該要怎樣在 effect 裡移除我們的 `step` 依屬呢？

**當我們依賴另一個 state 變數的現有值來更新一個 state 變數時，你可能會想要嘗試用 `useReducer` 取代兩者。**

當你發現你開始寫 `setSomething(something => ...)`，這就是個好時機來思考使用 reducer。Reducer 讓你**分離表達了發生在元件裡的「動作 (action)」，以及 state 如何依據這些動作而有的更新。**

讓我們把 effect 裡的依屬從 `step` 改成 `dispatch`：

```jsx{1,6,9}
const [state, dispatch] = useReducer(reducer, initialState);
const { count, step } = state;

useEffect(() => {
  const id = setInterval(() => {
    dispatch({ type: 'tick' }); // 而不是 setCount(c => c + step);
  }, 1000);
  return () => clearInterval(id);
}, [dispatch]);
```

(看看[示範](https://codesandbox.io/s/xzr480k0np)。)

你可能會問：「這個哪裡比較好？」答案是 **React 保證了 `dispatch` 函式在元件的生命週期裡是常數。所以上面的例子不需要重新訂閱區間。**

我們解決了我們的問題！

*(你可以從 deps 裡省略 `dispatch`、`setState` 和 `useRef` 的值，因為 React 保證它們會是靜態的。但列出它們也不會有什麼壞處。)*

取代了在 effect *裡面*讀取狀態，它調度了對於*發生了什麼事*的資訊的編碼的*動作*。這使得我們的 effect 可以保持與 `step` 的狀態分離。我們的 effect 並不在乎我們*如何*更新 state，它只告訴了我們*發生了什麼事*。然後 reducer 將更新的邏輯集中：

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

(如果你之前不小心錯過，這裡是一個[示範](https://codesandbox.io/s/xzr480k0np)。)

## 為什麼 useReducer 是 Hooks 的欺騙模式

我們已經看見該如何在 effect 需要根據前一個 state 或其他 state 變數來設定 state 時移除依屬。**但是如果我們需要 _props_ 來計算下一個 state 的時候該怎麼辦呢？**例如，或許我們的 API 是 `<Counter step={1} />`。當然，在這個狀況下我們不能避免將 `props.step` 設為依屬？

事實上，我們可以！我們可以把 *reducer 本身*放進我們的元件來讀取 props：

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

這個模式讓一些優化變得沒有作用，所以請試著不要在每個地方都使用它，但如果你需要的話你完全可以從 reducer 拿到 props。（這裡是一個[示範](https://codesandbox.io/s/7ypm405o8q)。）

**即使在那個例子裡，`dispatch` 仍然保證會在不同重新的渲染之間保持穩定。**所以如果你想要的話，你可以在 effect 的 deps 裡忽略它。它並不會導致 effect 重新執行。

你可能會想：這個怎麼可能會可行？Reducer 怎麼在被另一個渲染裡的 effect 呼叫的時候「知道」props 是什麼？答案是當你 `dispatch` 時，React 會記住這個動作 -- 但它會在下一次渲染*呼叫*你的 reducer。在那個時間點新的 props 會在範圍裡，你不需要在 effect 之內。

**這就是為什麼我喜歡將 `useReducer` 想成是 Hooks 的「欺騙模式」。它讓我可以分離更新的邏輯以及描述發生了什麼事。這樣一來，幫助我移除了 effect 裡不必要的依屬以及避免在非必要的時候重新執行它們。**

## 把函式移到 Effect 裡

一個常見的錯誤是認為函式不應該出現在依屬裡。例如，這樣看起來是可行的：

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
  }, []); // 這樣 ok 嗎？

  // ...
```

*([這個例子](https://codesandbox.io/s/8j4ykjyv0) 是由 Robin Wieruch 的文章修改而來的 — [看看這個](https://www.robinwieruch.de/react-hooks-fetch-data/)!)*

再更清楚一點，這段程式碼*真的*會正確執行。**但是單純忽略本地的函式的問題是，當元件規模成長時，會變得很難區分我們是否處理了所有的情況！**

想像我們的程式碼被分成像下面的樣子，然後每個函式都是五倍大：

```jsx
function SearchResults() {
  // 想像這個函式很長
  function getFetchUrl() {
    return 'https://hn.algolia.com/api/v1/search?query=react';
  }

  // 想像這個函式也很長
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


現在假設我們之後在其中一個函式裡使用了某些 state 或 prop：

```jsx{6}
function SearchResults() {
  const [query, setQuery] = useState('react');

  // 想像這個函式也很長
  function getFetchUrl() {
    return 'https://hn.algolia.com/api/v1/search?query=' + query;
  }

  // 想像這個函式也很長
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

如果我們忘記要更新任何一個呼叫了這些函式的 effect 的 deps（而且可能透過其他函式！），我們的 effect 會同步失敗改變 props 和 state。這聽起來不好。

幸運的，這個問題有個簡單的解法。**如果你只在一個 effect *裡*使用某些函式，把它們直接放進那個 effect *裡面*：**

```jsx{4-12}
function SearchResults() {
  // ...
  useEffect(() => {
    // 我們把這些函式移到裡面！
    function getFetchUrl() {
      return 'https://hn.algolia.com/api/v1/search?query=react';
    }

    async function fetchData() {
      const result = await axios(getFetchUrl());
      setData(result.data);
    }

    fetchData();
  }, []); // ✅ Deps 是 OK 的
  // ...
}
```

([這裡是一個範例](https://codesandbox.io/s/04kp3jwwql)。)

所以好處是什麼呢？我們不再需要去想「傳遞過的依屬」。我們的依屬陣列不會再說謊了：**我們真的 _沒有_ 在 effect 裡使用任何在元件外面範圍的東西。**

如果我們之後要編輯 `getFetchUrl` 來使用 `query` 的 state，我們更可能注意到我們正在 effect *裡面*編輯它 -- 因此，我們需要把 `query` 加進 effect 的依屬裡：

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
  }, [query]); // ✅ Deps 是 OK 的

  // ...
}
```

(這裡是一個[範例](https://codesandbox.io/s/pwm32zx7z7)。)

藉由增加這個依屬，我們不只「討好了 React」，在 query 改變時去重新獲取資料變得*合理*了。**`useEffect` 的設計強迫你去注意資料流的變化以及選擇讓我們的 effect 如何去同步它 -- 而不是忽略它直到我們的使用者遇到了錯誤。**

幸虧 `eslint-plugin-react-hooks` plugin 有 `exhaustive-deps` 這個 lint rule，你可以[分析你在編輯器裡輸入的 effect](https://github.com/facebook/react/issues/14920)且獲得關於哪個依屬被遺漏的建議。換句話說，一個機器可以告訴你哪個資料流的改變沒有正確被元件所處理。

![Lint rule gif](./exhaustive-deps.gif)

還滿貼心的。

## 但我不想要把這個函式放進 Effect 裡

有時候你可能不想要把某個函式*放進*某個 effect 裡。例如，好幾個在同個元件裡的 effect 可能會呼叫一樣的函式，你不想要複製貼上它的邏輯。或著它可能是一個 prop。

你應該跳過把這個函式放到 effect 的依屬裡嗎？我認為不。再一次的，**effect 不應該對它的依屬說謊。**通常會有更好的解法。一個常見的誤解是「函式不會改變」。但當我們透過這篇文章學習之後，這個完全不是事實。事實上，一個在元件裡定義的函式會在每次渲染改變！

**它本身呈現了一個問題。**假設兩個 effect 呼叫了 `getFetchUrl`：

```jsx
function SearchResults() {
  function getFetchUrl(query) {
    return 'https://hn.algolia.com/api/v1/search?query=' + query;
  }

  useEffect(() => {
    const url = getFetchUrl('react');
    // ... 獲取資料和做一些事 ...
  }, []); // 🔴 遺漏的 dep: getFetchUrl

  useEffect(() => {
    const url = getFetchUrl('redux');
    // ... 獲取資料和做一些事 ...
  }, []); // 🔴 遺漏的 dep: getFetchUrl

  // ...
}
```

在這個情況下你可能不想要把 `getFetchUrl` 移進任何一個 effect，因為你不能共享這個邏輯。

另一方面，如果你「誠實」對待 effect 的依屬，你可能會遇到一個問題。因為兩個 effect 都依賴於 `getFetchUrl` **(它在每次渲染都是不同的)**，我們的依屬陣列是毫無用處的：

```jsx{2-5}
function SearchResults() {
  // 🔴 在每次渲染都重新觸發所有 effect
  function getFetchUrl(query) {
    return 'https://hn.algolia.com/api/v1/search?query=' + query;
  }

  useEffect(() => {
    const url = getFetchUrl('react');
    // ... 獲取資料和做一些事 ...
  }, [getFetchUrl]); // 🚧 Deps 是正確的但它們太常改變了

  useEffect(() => {
    const url = getFetchUrl('redux');
    // ... 獲取資料和做一些事 ...
  }, [getFetchUrl]); // 🚧 Deps 是正確的但它們太常改變了

  // ...
}
```

一個迷人的解法是直接忽略把 `getFetchUrl` 函式放進 deps 的列表裡。然而，我不認為這是個好的解法。這使得我們很難察覺到我們*正在*為資料流新增一個改變，而這個改變*需要*被 effect 所處理。這導致了錯誤，像是我們之前看到的「永遠不會更新區間」。

相反的，有兩個更簡單的解法。

**第一個，如果一個函式不使用任何在元件範圍裡的東西，你可以把它抽到元件外層，然後自由地在 effect 裡使用它：**

```jsx{1-4}
// ✅ 不會被資料流影響
function getFetchUrl(query) {
  return 'https://hn.algolia.com/api/v1/search?query=' + query;
}

function SearchResults() {
  useEffect(() => {
    const url = getFetchUrl('react');
    // ... 獲取資料和做一些事 ...
  }, []); // ✅ Deps are OK

  useEffect(() => {
    const url = getFetchUrl('redux');
    // ... 獲取資料和做一些事 ...
  }, []); // ✅ Deps are OK

  // ...
}
```

我們並不需要把它宣告在 deps 裡，因為它不在渲染的範圍，而且它不會被資料流所影響。它不可能意外的依賴於 props 或 state。

另外，你可以把它包在[`useCallback` Hook](https://reactjs.org/docs/hooks-reference.html#usecallback) 裡面：


```jsx{2-5}
function SearchResults() {
  // ✅ 當他自己的 deps 一樣時，保留了特性
  const getFetchUrl = useCallback((query) => {
    return 'https://hn.algolia.com/api/v1/search?query=' + query;
  }, []);  // ✅ Callback deps are OK

  useEffect(() => {
    const url = getFetchUrl('react');
    // ... 獲取資料和做一些事 ...
  }, [getFetchUrl]); // ✅ Effect deps are OK

  useEffect(() => {
    const url = getFetchUrl('redux');
    // ... 獲取資料和做一些事 ...
  }, [getFetchUrl]); // ✅ Effect deps are OK

  // ...
}
```

`useCallback` 就像增加另一層依屬的檢查。它解決了另一端的問題 -- **不是避免一個函式的依屬，而是我們讓函式本身只在需要時改變。**

讓我們看看為什麼這個途徑是有用的。之前，我們的例子顯示兩個搜尋的結果（ `'react'` 和 `'redux'` 的搜尋 queries）。所以 `getFetchUrl` 會從本地的 state 讀取它而不是把 `query` 當作一個參數。

我們將會很快看到它沒有 `query` 這個依屬：

```jsx{5}
function SearchResults() {
  const [query, setQuery] = useState('react');
  const getFetchUrl = useCallback(() => { // 沒有 query 參數
    return 'https://hn.algolia.com/api/v1/search?query=' + query;
  }, []); // 🔴 遺漏的 dep: query
  // ...
}
```

如果我將我的 `useCallback` 的 deps 修正為包含了 `query`，任何一個擁有 `getFetchUrl` deps 的 effect 會在 `query` 改變時重新執行：

```jsx{4-7}
function SearchResults() {
  const [query, setQuery] = useState('react');

  // ✅ 保留特性直到 query 改變
  const getFetchUrl = useCallback(() => {
    return 'https://hn.algolia.com/api/v1/search?query=' + query;
  }, [query]);  // ✅ Callback deps are OK

  useEffect(() => {
    const url = getFetchUrl();
    // ... 獲取資料和做一些事 ...
  }, [getFetchUrl]); // ✅ Effect deps are OK

  // ...
}
```

由於有了 `useCallback`，如果 `query` 一樣的話，`getFetchUrl` 也會保持一樣，而且我們的 effect 不會重新執行。但如果 `query` 改變了，`getFetchUrl` 也會改變，然後我們會重新獲取資料。這就像是當你改變某些 Excel 表單的欄位，其他用到它的的欄位也會自動重新計算。

這只是擁抱資料流和同步化心態的結果。**一樣的解法也適用於由上一層傳進來的函式 props：**

```jsx{4-8}
function Parent() {
  const [query, setQuery] = useState('react');

  // ✅ 保留特性直到 query 改變
  const fetchData = useCallback(() => {
    const url = 'https://hn.algolia.com/api/v1/search?query=' + query;
    // ... 獲取資料和回傳它 ...
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

因為 `fetchData` 只在它的 `query` state 改變時在 `Parent` 裡面改變，我們的 `Child` 直到在應用程式裡真的需要時才會重新獲取資料。

## 函式是資料流的一部分嗎？

有趣的，這個模式在 class 的情形下是壞掉的，它顯示了 effect 和生命週期範例的不同。試著思考這個翻譯：

```jsx{5-8,18-20}
class Parent extends Component {
  state = {
    query: 'react'
  };
  fetchData = () => {
    const url = 'https://hn.algolia.com/api/v1/search?query=' + this.state.query;
    // ... 獲取資料和做一些事 ...
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

你可能會想：「嘿 Dan，我們都已經知道 `useEffect` 跟 `componentDidMount` 和 `componentDidUpdate` 合在一起很像了，你不能一直提到它！」**但即使有了 `componentDidUpdate`，這個仍不能正確執行：**

```jsx{8-13}
class Child extends Component {
  state = {
    data: null
  };
  componentDidMount() {
    this.props.fetchData();
  }
  componentDidUpdate(prevProps) {
    // 🔴 這個條件式永遠不會是 true
    if (this.props.fetchData !== prevProps.fetchData) {
      this.props.fetchData();
    }
  }
  render() {
    // ...
  }
}
```

當然，`fetchData` 是一個 class 的方法 (method)！（或，是一個 class 的屬性 -- 但它不會改變任何東西。）它不會因為state 改變而有所不同。所以 `this.props.fetchData` 會和 `prevProps.fetchData` 保持一樣，且我們不會重新獲取資料。讓我們移除這個條件試試？

```jsx
  componentDidUpdate(prevProps) {
    this.props.fetchData();
  }
```

噢等一下，這個在*每次*重新渲染的時候都會獲取。（新增一個動畫到樹上是個發現它的有趣方式。）或許我們可以把它綁到某個的特定的 query？

```jsx
  render() {
    return <Child fetchData={this.fetchData.bind(this, this.state.query)} />;
  }
```

但 `this.props.fetchData !== prevProps.fetchData` 會*永遠*是 `true`，即使 `query` 沒有改變！所以我們*永遠會*重新獲取。

這個 class 難題的唯一真正解法是硬著頭皮然後把 `query` 本身傳進 `Child` 元件裡。 `Child` 不會真的*使用* `query`，但當它改變時它會觸發重新獲取：

```jsx{10,22-24}
class Parent extends Component {
  state = {
    query: 'react'
  };
  fetchData = () => {
    const url = 'https://hn.algolia.com/api/v1/search?query=' + this.state.query;
    // ... 獲取資料和做一些事 ...
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

在使用了 React 的 class 這麼多年以來，我已經太習慣於把不必要的 props 傳下去然後破壞上層元件的封裝，我只在一週前發現為什麼我們必須這麼做。
Over the years of working with classes with React, I’ve gotten so used to passing unnecessary props down and breaking encapsulation of parent components that I only realized a week ago why we had to do it.

**有 class，函式的 props 本身不會真的是資料流的一部分。**方法（methods）會關掉 mutable `this` 變數，所以我們不能依靠他們的身份來表示任何東西。因此，即使當我們只想要一個函式，我們必須照順序傳遞一堆其他的資料才能夠來「區分」他。我們不能知道 `this.props.fetchData` 是否根據某些狀態被上層傳遞下來，也不知道狀態是否改變了。
**With classes, function props by themselves aren’t truly a part of the data flow.** Methods close over the mutable `this` variable so we can’t rely on their identity to mean anything. Therefore, even when we only want a function, we have to pass a bunch of other data around in order to be able to “diff” it. We can’t know whether `this.props.fetchData` passed from the parent depends on some state or not, and whether that state has just changed.

**有了 `useCallback`，函式可以完全參與資料流。**我們可以說如果函式的輸入改變的話，函式本身也會改變，但如果沒有，它會保持一樣。幸虧有了 `useCallback` 所提供的顆粒度，像是 `props.fetchData` 之類的 props 的改變可以自動往下傳播。

相似的，[`useMemo`](https://reactjs.org/docs/hooks-reference.html#usememo)讓我們可以在複雜的物件做到相同的事情：

```jsx
function ColorPicker() {
  // 不會破壞 Child 的淺層比較 prop 的檢查
  // 除非 color 真的改變。
  const [color, setColor] = useState('pink');
  const style = useMemo(() => ({ color }), [color]);
  return <Child style={style} />;
}
```

**我想要強調把 `useCallback` 到處放是滿笨重的。**這是個好的逃生艙口，而且在一個函式被同時傳遞下去*且*在某些小孩裡的 effect 裡面被呼叫是有用的。或是你想要試著破壞小孩元件的記憶化。但 Hooks 比較適合[避免把所有 callbacks 往下傳](https://reactjs.org/docs/hooks-faq.html#how-to-avoid-passing-callbacks-down)。

在上面的範例裡面，我會更傾向於 `fetchData` 是在我的 effect 裡面（它可能是從某個客製化的 Hook 抽出的）或是一個最上層的匯入。我想要讓 effect 保持簡單，但裡面的 callbacks 不會幫助這個。（「如果某些 `props.onComplete` callback 在 request 途中改變了怎麼辦？」你可以[模擬 class 的行為](#swimming-against-the-tide) 但它不會解決 競爭條件（race conditions）。）

## 講到競爭條件（Race Conditions）

一個經典的有 class 的資料獲取例子如同下面這樣：

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

如同你可能知道的，這段程式碼是有問題的。它不會處理更新。所以第二種你在線上找得到的經典範例會像這樣：

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

這個一定更好！但它仍然有問題。它會有問題的原因是因為這個 request 可能會不照順序。所以如果我獲取 `{id: 10}`，轉換到 `{id: 20}`，但 `{id: 20}` 的 request 比較早發生，這個比較早發生但比較晚結束的 request 會錯誤的覆蓋掉我的 state。

這叫做競爭條件（race condition），它在擁有 `async` / `await` 的由上而下的資料流（props 或 state 會在某個 async 函式的中間發生）的程式碼裡很常見（假設了某些會等待結果）。

Effect 並不會神奇的解決這個問題，雖然如果你嘗試想要把 `async` 函式直接傳進 effect 裡，它們會警告你。（我們需要改進這個警告讓它能夠更清楚的告訴你可能會遇到什麼問題。）

如果你所使用的 async 方式支援取消，那很棒！你可以在你的 cleanup 函式裡面取消 async request。

另外，最簡單的權宜之計是利用布林值來追蹤它：

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

[這篇文章](https://www.robinwieruch.de/react-hooks-fetch-data/)提供了更多關於你可以怎麼處裡錯誤和裝載狀態，以及從客製化的 hook 裡抽出邏輯的細節。如果你對學習更多關於如何使用 Hook 來獲取資料有興趣，我推薦你看看這篇文章。

## 提高標準

有了 class 的生命週期的心態，副作用（side effect）會與渲染的輸出行為有所不同。渲染使用者介面是被 props 和 state 所驅使的，而且是保證會與它們一致，但副作用不是。這是常見的問題來源。

有了 `useEffect` 的心理模型，事情會預設為同步。副作用會變成 React 資料流的一部分。每個 `useEffect` 的呼叫，只要你用對它，你的元件就會把邊緣情況處理得很好。

然而，要正確使用它的預設成本是更高的。這可能會有點惱人。寫能夠處理好邊緣情況的同步化程式碼，本質上是比觸發一個與渲染不一致的副作用還難。

如果 `useEffect` 是用來當作你最常使用的*那個*工具，這個可能是令人擔憂的。然而，它是低級別的建設基石。現在是 Hook 的早期，所以每個人都使用低級別的方法，尤其是在教學文件裡。但實際上，社群很有可能會開始移往高級別的 Hooks ，因為好的 API 會獲得驅動的力量。

我看過不同的應用程式創造它們自己的 Hooks，像是封裝某些認證邏輯的 `useFetch`，或是使用主題 context 的 `useTheme`。一旦你有了那些東西的工具箱，你不用這麼*常*使用 `useEffect`。但它帶來的彈性使得每個立基於它上面的 hooks 有更多好處。

目前為止，`useEffect` 最常用來獲取資料。但獲取資料並不是一個同步化的問題。這個尤其明顯因為我們的 deps 常常是 `[]`。那我們到底在同步什麼？

長期來看，[獲取資料的暫停（Suspense）](https://reactjs.org/blog/2018/11/27/react-16-roadmap.html#react-16x-mid-2019-the-one-with-suspense-for-data-fetching)將會允許第三方的套件有第一流的方法來告訴 React 直到某些 async （任何東西：程式碼，資料，圖片）好了之後來暫停渲染。

Suspense 逐漸包含了某些資料獲取的使用情形，我預期 `useEffect` 會在你真的想要在副作用裡同步某些 props 或 state 時，當作一個漸入背景的強而有力的工具。不同於獲取資料，它自然的處理了這樣的情況，因為它就是設計來如此的。但直到那時，客製化的 Hooks 像是[這裡所顯示的](https://www.robinwieruch.de/react-hooks-fetch-data/)是個重複使用獲取資料邏輯的好方法。

## 寫在最後

現在你已經知道我所知道關於使用 effect 的所有事情了，回去看一開始的[摘要](#tldr)，它看起來合理嗎？我有忽略掉什麼嗎？（我還沒用光我的紙！）

我會很想在推特上聽聽你們的想法！感謝閱讀。
