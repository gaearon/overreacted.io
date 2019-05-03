---
title: useEffect 的完整指南
date: '2019-03-09'
spoiler: Effect 是你資料流的一部分。
---

你用 [Hooks](https://reactjs.org/docs/hooks-intro.html) 寫了一些元件。或許也寫了一個小的應用程式。你感到很滿足。你對它的 API 感到滿意而且在過程中學習了一些技巧。你甚至做了一些[客製化的 Hooks](https://reactjs.org/docs/hooks-custom.html) 來抽出重複的邏輯（移除 300 行程式碼！）然後跟你的同事炫耀。他們說「做得好」。

但有時候，當你使用 `useEffect` 時，那些片段感覺不太契合。你有一種好像你遺漏了什麼的感覺。它看起來像是 class 的生命週期... 但它真的是嗎？你發現你問自己像是以下的某些問題：

* 🤔 我要怎麼用 `useEffect` 複製 `componentDidMount` 的行為？
* 🤔 我該怎麼正確的在 `useEffect` 裡拿到資料？`[]` 是什麼？
* 🤔 我應該要把用到的函示指定成 effect 的依屬 (dependencies) 嗎？
* 🤔 為什麼我有時候會進入重複拿資料的無窮迴圈？
* 🤔 為什麼我有時候會在 effect 裡拿到舊的 state 或 prop 的值？

當我剛開始使用 Hooks 的時候，我也對上述的問題感到困惑。甚至當我在寫初版的文件時，我沒有牢牢掌握一些細微的部分。在過程中我有好幾次的「啊哈」頓悟時刻，我想分享它們給你。**這樣的深入研究會使得這些問題的答案變得明顯。**

為了*看到*答案，我們需要先退回一步。這篇文章的目標不是給你一個條列式的清單，而是為了幫助你真的「深入理解」`useEffect`。這裡不會有很多需要學習的事情。事實上，我們會花大部分的時間*忘記*學習過的東西。

**直到我停止透過 class 生命週期的濾鏡觀看 `useEffect` Hook，所有東西才在我眼中匯聚在一起。**

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

當你可以使用 `useEffect(fn, [])`，它並不是完全相等。與 `componentDidMount` 不同，他會*捕捉* props 和 state。所以即使在 callbacks 裡面，你將會看到初始的 props 和 state。如果你想要看到*最新的*的東西，你可以把它寫到一個 ref。但其實通常有更簡單的方法來架構你的程式碼，所以你並不需要這麼做。記住你的 effects 的心理模型跟 `componentDidMount` 和其他的生命週期是不同的。嘗試想要找出它們相等的地方並不會幫助到你，反而只會讓你更困惑。為了能夠更有效率，你必須要「想著 effects」，他們的心理模型跟回應生命週期的事件比較起來更接近實作同步化。

**🤔 問題：我該怎麼正確的在 `useEffect` 裡拿到資料？`[]` 是什麼？**

[這篇文章](https://www.robinwieruch.de/react-hooks-fetch-data/)是一個關於用 `useEffect` 獲取資料的不錯的入門文章。確定你把它完全讀完！它沒有跟本篇文章一樣長。`[]` 表示 effect 沒有用任何參與 React 資料流的值，並且因此而安全的只使用一次。當那個值*真的*被用到的時候，它也是常見的錯誤來源。你將會需要學習幾個策略（主要是 `useReducer` 和 `useCallback`）來為了依屬 (dependencies) *移除這個必要*，而不是錯誤的忽略它。

**🤔 問題：我應該要把用到的函示指定成 effect 的依屬 (dependencies) 嗎？**

建議的做法是把不需要 props 或 state 的函式提升到元件*外面*，並且把只被某個 effect 用到的函式放到 effect *裡面*。如果在那之後你的 effect 仍需要在渲染的範圍（包含了 props 傳進來的函式）使用函式，在定義它們的地方把它們包進 `useCallback`，並重複這個過程。為什麼這個重要？函式可以從 props 和 state「看見」值 -- 所以它們會參與資料流。這裡的常見問題裡有更[詳細的答案](https://reactjs.org/docs/hooks-faq.html#is-it-safe-to-omit-functions-from-the-list-of-dependencies)。

**🤔 問題：為什麼我有時候會進入重複拿資料的無窮迴圈？**

這可能發生在當你沒有第二個依屬參數卻想要在 effect 裡獲取資料的時候。沒有它，effects 會在每次渲染的時候發生 -- 並且設定 state 這件事會再度觸發 effects。一個無窮迴圈也可能會在你想要在依屬的陣列裡指定一個*永遠*都會變化的值。你可以藉由一個一個移除來發現到底是哪個值。然而，移除一個依屬（或盲目地使用 `[]`）通常是錯誤的修正方式。相反的，你應該要修正這個問題的根源。例如，函式可能造成這個問題，將它們放到 effects 裡，抽出他們到上層，或是將他們包在 `useCallback` 裡可能有幫助。誤了避免重複產生新的物件，`useMemo` 可以達到相同的目的。

**🤔 為什麼我有時候會在 effect 裡拿到舊的 state 或 prop 的值？**

Effects 永遠都會在它們被定義的渲染的時候「看見」 props 跟 state。這樣能夠[幫助避免錯誤](/how-are-function-components-different-from-classes/)，但某些情況下它很惱人。在那些情況下，你可以在一個 易變的（mutable）的 ref 特別維護某些值（連結的文章在最後解釋了它）。試著用 [lint rule](https://github.com/facebook/react/issues/14920) 來訓練如何看它們。一些日子後，它會變得像是第二自然的事情。也在常見問題裡看看[這個答案](https://reactjs.org/docs/hooks-faq.html#why-am-i-seeing-stale-props-or-state-inside-my-function)。

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

這個解釋了我們的 event handler 捕捉了點選時的 `count`。如果我們應用相同的代換原則，每次的選染會「看到」它自己的 `count`：

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
    // 在第二次選染時的 Effect 函式
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

我想這是諷刺的， Hooks 居然這麼依賴 JavaScript 的 closures，然而他卻是 class 的實作，深陷於[the canonical wrong-value-in-a-timeout confusion](https://wsvincent.com/javascript-closure-settimeout-for-loop/)這個通常與 closure 關聯的。這是因為在這個例子中實際造成困惑的源頭是 mutation（React 在 class 裡 mutate `this.state` 來指出最新的狀態）而不是 closure 本身。
I think it’s ironic that Hooks rely so much on JavaScript closures, and yet it’s the class implementation that suffers from [the canonical wrong-value-in-a-timeout confusion](https://wsvincent.com/javascript-closure-settimeout-for-loop/) that’s often associated with closures. This is because the actual source of the confusion in this example is the mutation (React mutates `this.state` in classes to point to the latest state) and not closures themselves.

**Closure 在你的值不會變化的時候很棒。他讓他們能夠更簡單的被思考，因為你最後會 refer 到常數。**而且如同我們討論的，props 和 state 永遠不會在特定的渲染裡面改變。順帶一提，我們可以把 class 的版本修正... 藉由[使用 closure](https://codesandbox.io/s/w7vjo07055)。
**Closures are great when the values you close over never change. That makes them easy to think about because you’re essentially referring to constants.** And as we discussed, props and state never change within a particular render. By the way, we can fix the class version... by [using a closure](https://codesandbox.io/s/w7vjo07055).

## 逆流而上
## Swimming Against the Tide

在這個時間點將它特別說出來是重要的：**每個**在元件裡渲染的函式（包含裡面的 event handler、effects、timeout 或 API 呼叫）捕捉了定義他們的渲染所呼叫的 props 和 state。
At this point it’s important that we call it out explicitly: **every** function inside the component render (including event handlers, effects, timeouts or API calls inside them) captures the props and state of the render call that defined it.

所以這裡是兩個相等的例子：
So these two examples are equivalent:

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

**無論你是否「提早」讀取你元件裡的 props 或 state。**他們都不會改變！在單一個渲染的範圍裡，props 和 state 會保持一樣。（解構 props 讓這個更為明顯。）
**It doesn’t matter whether you read from props or state “early” inside of your component.** They’re not going to change! Inside the scope of a single render, props and state stay the same. (Destructuring props makes this more obvious.)

當然，有時候你*想要*讀取最新的值而不是某個在 effect 的 callback 裡所捕捉到的值。最簡單的方法是使用 refs，如同在[這篇文章](https://overreacted.io/how-are-function-components-different-from-classes/)最後一個小節所敘述的。
Of course, sometimes you *want* to read the latest rather than captured value inside some callback defined in an effect. The easiest way to do it is by using refs, as described in the last section of [this article](https://overreacted.io/how-are-function-components-different-from-classes/).

請注意當你想要從*過去*的渲染函式讀取*未來*的 props 或 state 時，你是逆流而上的。他不是*錯誤*（而且在某些時候是必須的）但破壞 paradigm 可能會看起來比較不「乾淨」。這個是故意的結果因為他幫助凸顯哪個程式碼是易碎的且依賴於時間點。在 class 裡面，當這發生的時候他比較不明顯。
Be aware that when you want to read the *future* props or state from a function in a *past* render, you’re swimming against the tide. It’s not *wrong* (and in some cases necessary) but it might look less “clean” to break out of the paradigm. This is an intentional consequence because it helps highlight which code is fragile and depends on timing. In classes, it’s less obvious when this happens.

這裡是一個[我們計數器範例的版本](https://codesandbox.io/s/rm7z22qnlp)，他複製了 class 的行為：
Here’s a [version of our counter example](https://codesandbox.io/s/rm7z22qnlp) that replicates the class behavior:

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

![Screen recording of 5, 5, 5, 5, 5 logged in order](./timeout_counter_refs.gif)

在 React 裡 mutate 某些東西可能看起來有點詭異。然而，這個是 React 本身實際上重新賦值給 class 裡的 `this.state`。不像被捕捉的 props 和 state，你並沒有任何在特定的 callback 裡讀取 `latestCount.current` 會給妳相同值的保證。定義上，你可以在任意時間 mutate 他。這個就是為何他不是預設值的原因，而且你必須接受它。 
It might seem quirky to mutate something in React. However, this is exactly how React itself reassigns `this.state` in classes. Unlike with captured props and state, you don’t have any guarantees that reading `latestCount.current` would give you the same value in any particular callback. By definition, you can mutate it any time. This is why it’s not a default, and you have to opt into that.

## 所以 Cleanup 呢？
## So What About Cleanup?

如同[文件解釋](https://reactjs.org/docs/hooks-effect.html#effects-with-cleanup)，有些 effects 可能有 cleanup 的面相。最終，他的目的是為了某些情形「取消做」effect，像是訂閱。
As [the docs explain](https://reactjs.org/docs/hooks-effect.html#effects-with-cleanup), some effects might have a cleanup phase. Essentially, its purpose is to “undo” an effect for cases like subscriptions.

考慮下面的程式碼：
Consider this code:

```jsx
  useEffect(() => {
    ChatAPI.subscribeToFriendStatus(props.id, handleStatusChange);
    return () => {
      ChatAPI.unsubscribeFromFriendStatus(props.id, handleStatusChange);
    };
  });
```

假設 `props` 在第一次渲染是 `{id: 10}`，然後在第二次渲染是 `{id: 20}`。你*可能*會想類似以下的事情會發生：
Say `props` is `{id: 10}` on the first render, and `{id: 20}` on the second render. You *might* think that something like this happens:

* React cleans up the effect for `{id: 10}`. React 為了 `{id: 10}` 清理 effect。
* React renders UI for `{id: 20}`. React 為了 `{id: 20}` 渲染使用者介面。
* React runs the effect for `{id: 20}`. React 為了 `{id: 20}` 執行 effect。

（這其實並不太是這樣的情形。）
(This is not quite the case.)

以這樣的心理模型來看，你可能會想 cleanup 因為在我們重新渲染以前執行所以可以 「看見」舊的 props，然後新的 effect  「看見」新的 props 因為他在重新渲染之後執行。這是直接從 class 的生命週期所推想的心裡模型，然後**他在這裡並不是準確的**。我們來看看為什麼。
With this mental model, you might think the cleanup “sees” the old props because it runs before we re-render, and then the new effect “sees” the new props because it runs after the re-render. That’s the mental model lifted directly from the class lifecycles, and **it’s not accurate here**. Let’s see why.

React 只會在[讓瀏覽器繪圖](https://medium.com/@dan_abramov/this-benchmark-is-indeed-flawed-c3d6b5b6f97f)之後執行 effects。這使得你的應用程式更快因為大部分的 effect 不會阻擋畫面的更新。Effect 的清理也會被延遲。**前一個 effect 會在用新的 props 渲染 _之後_ 被清掉：**
React only runs the effects after [letting the browser paint](https://medium.com/@dan_abramov/this-benchmark-is-indeed-flawed-c3d6b5b6f97f). This makes your app faster as most effects don’t need to block screen updates. Effect cleanup is also delayed. **The previous effect is cleaned up _after_ the re-render with new props:**

* **React renders UI for `{id: 20}`.** React 為了 `{id: 20}` 渲染使用者介面。
* The browser paints. We see the UI for `{id: 20}` on the screen. 瀏覽器畫出畫面。我們在畫面上看見 `{id: 20}` 的使用者介面。
* **React cleans up the effect for `{id: 10}`.** React 為了 `{id: 10}` 清掉 effect。
* React runs the effect for `{id: 20}`.React 為了 `{id: 20}` 執行 effect。

你可能會想：然而，如果他在 props 改變成 `{id: 20}` *之後*執行，前一次的 effect 的清理怎麼仍然能夠「看到」舊的 `{id: 10}` props？
You might be wondering: but how can the cleanup of the previous effect still “see” the old `{id: 10}` props if it runs *after* the props change to `{id: 20}`?

我們曾經在這裡過
We’ve been here before... 🤔

![Deja vu (cat scene from the Matrix movie)](./deja_vu.gif)

引述前一個章節：
Quoting the previous section:

>每個在元件裡渲染的函式（包含 event handlers, effects, timeouts 或裡面呼叫的 API）會捕捉到定義他的渲染裡的 props 和 state。
>Every function inside the component render (including event handlers, effects, timeouts or API calls inside them) captures the props and state of the render call that defined it.

現在答案很清楚了！Effect 的清理並不是讀到了「最新的」props，無論他代表什麼。他是讀到了他所屬於的他被定義的渲染裡的 props：
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

王國會興盛然後轉變為塵埃，太陽會殆盡他的外層變成白矮星，最後的文明會結束。但沒有任何一個東西可以使得 props 除了 `{id: 10}` 以外的東西被第一個渲染的 effect 的清理所「看見」
Kingdoms will rise and turn into ashes, the Sun will shed its outer layers to be a white dwarf, and the last civilization will end. But nothing will make the props “seen” by the first render effect’s cleanup anything other than `{id: 10}`.

這就是 React 利用來處理繪圖之後的 effects -- 而且讓你的應用程式預設是快的。如果我們需要，舊的 props 仍在那。
That’s what allows React to deal with effects right after painting — and make your apps faster by default. The old props are still there if our code needs them.

## 同步化，而非生命週期
## Synchronization, Not Lifecycle

React 裡其中一個讓我最喜歡的事情是他統一了敘述最初的渲染結過和之後的更新。這個讓你的程式[漸少了亂度](https://overreacted.io/the-bug-o-notation/)。
One of my favorite things about React is that it unifies describing the initial render result and the updates. This [reduces the entropy](https://overreacted.io/the-bug-o-notation/) of your program.

假設我的元件看起來像這樣：
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

無論我渲染了 `<Greeting name="Dan" />` 然後 `<Greeting name="Yuzhi" />`，還是我只是單純的渲染了`<Greeting name="Yuzhi" />`。最終，我們在兩種情況都會看見「Hello, Yuzhi」。
It doesn’t matter if I render `<Greeting name="Dan" />` and later `<Greeting name="Yuzhi" />`, or if I just render `<Greeting name="Yuzhi" />`. In the end, we will see “Hello, Yuzhi” in both cases.

人們說：「重要的是過程，不是目的地」。對 React 來說則是相反的。**重要的是目的地，不是過程。**這是跟在 jQuery 程式碼裡呼叫 `$.addClass` 和 `$.removeClass`（我們的「過程」）和特別飆出哪個 CSS class *應該*在 React 程式碼裡（我們的「目的地」）的不同之處。
People say: “It’s all about the journey, not the destination”. With React, it’s the opposite. **It’s all about the destination, not the journey.** That’s the difference between `$.addClass` and `$.removeClass` calls in jQuery code (our “journey”) and specifying what the CSS class *should be* in React code (our “destination”).

**React 根據我們現在的 props 和 state 同步了 DOM。**在渲染時「mount」和「更新」之間沒有差異。
**React synchronizes the DOM according to our current props and state.** There is no distinction between a “mount” or an “update” when rendering.

你應該用相似的想法來思考 effects。**`useEffect` 讓你根據我們的 props 和 state 來 _同步_ 在 React 樹外的東西。**
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

這個是有點不同於你熟悉的 *mount/update/unmount* 心理模型。真的把這件事內化是很重要的。**如果你試著把 effects 寫成跟元件是否第一次渲染有關而不同，你是在嘗試逆流而上！**如果我們的結果依賴於「過程」而不是「目的地」，我們會同步失敗。
This is subtly different from the familiar *mount/update/unmount* mental model. It is important really to internalize this. **If you’re trying to write an effect that behaves differently depending on whether the component renders for the first time or not, you’re swimming against the tide!** We’re failing at synchronizing if our result depends on the “journey” rather than the “destination”.

他不應該與我們用 props A, B, C 渲染，或是我們直接渲染 C 有關。然而可能有些暫時的差異（例如，當我們獲取資料時），最終結果應該要一樣。
It shouldn’t matter whether we rendered with props A, B, and C, or if we rendered with C immediately. While there may be some temporary differences (e.g. while we’re fetching data), eventually the end result should be the same.

相同的，在*每個*渲染執行所有 effects 可能不是很有效。（而且在某些情況下，他會導致無窮迴圈。）
Still, of course running all effects on *every* render might not be efficient. (And in some cases, it would lead to infinite loops.)

所以我們要怎麼修正他？
So how can we fix this?

## 教導 React 來區別你的 effects
## Teaching React to Diff Your Effects

我們已經學到了關於 DOM 本身的一課。React 只會更新部分真的改變的 DOM 而不是每次重新渲染時觸碰他。
We’ve already learned that lesson with the DOM itself. Instead of touching it on every re-render, React only updates the parts of the DOM that actually change.

當你更新時
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

React 看見兩個物件：
React sees two objects:

```jsx
const oldProps = {className: 'Greeting', children: 'Hello, Dan'};
const newProps = {className: 'Greeting', children: 'Hello, Yuzhi'};
```

他跑過每個他的 props 然後決定那個 `children` 改變了且需要更新 DOM，但 `className` 不是。所以他可以只要這樣做：
It goes over each of their props and determine that `children` have changed and need a DOM update, but `className` did not. So it can just do:

```jsx
domNode.innerText = 'Hello, Yuzhi';
// No need to touch domNode.className
```

**我們可以用 effects 做類似的事情嗎？如果能夠避免在執行 effect 不是必要的時候重新執行他，這樣會很棒。**
**Could we do something like this with effects too? It would be nice to avoid re-running them when applying the effect is unnecessary.**

例如，可能我們的元件因為狀態改變而重新渲染：
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

但我們的 effect 並沒有使用到 `counter` 的狀態。**我們的 effect 用 `name` prop 同步了`document.title`，但 `name` prop 保持一樣。**在每次 counte改變時重新賦予 `document.title` 值看起來不太理想。
But our effect doesn’t use the `counter` state. **Our effect synchronizes the `document.title` with the `name` prop, but the `name` prop is the same.** Re-assigning `document.title` on every counter change seems non-ideal.

OK，所以 React 可以單純的... 看 effects 的差異嗎？
OK, so can React just... diff effects?


```jsx
let oldEffect = () => { document.title = 'Hello, Dan'; };
let newEffect = () => { document.title = 'Hello, Dan'; };
// Can React see these functions do the same thing?
```

不太行。React 不能在沒有呼叫函式以前猜出他在做什麼。（源頭並沒有包含特定的值，他只是關掉了 `name` prop。）
Not really. React can’t guess what the function does without calling it. (The source doesn’t really contain specific values, it just closes over the `name` prop.)

這就是為什麼如果你想要避免非必要的重新執行 effects，你可以提供一個依賴的陣列（也叫做「deps」）的參數給 `useEffect`：
This is why if you want to avoid re-running effects unnecessarily, you can provide a dependency array (also known as “deps”) argument to `useEffect`:

```jsx{3}
  useEffect(() => {
    document.title = 'Hello, ' + name;
  }, [name]); // Our deps
```

**這就像我們告訴 React：「嘿，我知道你不能看見函式 _裡面_，但我保證他只會用到 `name` 而不會有其他渲染層面的東西。」**
**It’s like if we told React: “Hey, I know you can’t see _inside_ this function, but I promise it only uses `name` and nothing else from the render scope.”**

如果在這次和前一次執行 effect 時，這些的每個值都是一樣的，就沒有什麼需要同步的東西，所以 React 可以跳過這個 effect：
If each of these values is the same between the current and the previous time this effect ran, there’s nothing to synchronize so React can skip the effect:

```jsx
const oldEffect = () => { document.title = 'Hello, Dan'; };
const oldDeps = ['Dan'];

const newEffect = () => { document.title = 'Hello, Dan'; };
const newDeps = ['Dan'];

// React 不能偷看函式的裡面，但他可以比較 deps。
// 因為所有 deps 都是相同的，他不需要執行新的 effect。
// React can't peek inside of functions, but it can compare deps.
// Since all deps are the same, it doesn’t need to run the new effect.
```
如果有任何一個這樣的值在依賴陣列裡在渲染之間有所不同，我們知道我們不能跳過執行 effect。同步所有的東西！
If even one of the values in the dependency array is different between renders, we know running the effect can’t be skipped. Synchronize all the things!

## 不要對 React 說關於依賴的謊
## Don’t Lie to React About Dependencies

對 React 說關於依賴的謊會有不好的結果。直覺上，這很合理，但我看過幾乎每個擁有 class 的心理模型的人嘗試使用`useEffect`的人，嘗試著要欺騙規則。（我一開始也這樣做過！）
Lying to React about dependencies has bad consequences. Intuitively, this makes sense, but I’ve seen pretty much everyone who tries `useEffect` with a mental model from classes try to cheat the rules. (And I did that too at first!)

```jsx
function SearchResults() {
  async function fetchData() {
    // ...
  }

  useEffect(() => {
    fetchData();
  }, []); // 這個可以嗎？並不是永遠都可以 -- 而且有更好的方式來寫他。Is this okay? Not always -- and there's a better way to write it.

  // ...
}
```

*([Hooks 常見問題](https://reactjs.org/docs/hooks-faq.html#is-it-safe-to-omit-functions-from-the-list-of-dependencies) 解釋了應該怎麼做。 我們會回到[下面的](#moving-functions-inside-effects)例子。)*
*(The [Hooks FAQ](https://reactjs.org/docs/hooks-faq.html#is-it-safe-to-omit-functions-from-the-list-of-dependencies) explains what to do instead. We'll come back to this example [below](#moving-functions-inside-effects).)*

你會說「但我只想要在 mount 的時候執行它！」。現在，請記得：如果你特定了 deps，**_所有_ 在你元件裡被 effect 用到的值 _一定_ 要在那裡。**包含了 props、 state、函式 -- 任何在你元件裡的東西。
“But I only want to run it on mount!”, you’ll say. For now, remember: if you specify deps, **_all_ values from inside your component that are used by the effect _must_ be there**. Including props, state, functions — anything in your component.

有時候當你這樣做，他會導致問題。例如，可能你會看見無窮重新獲取的迴圈，或一個 socket 太常被重新產生。**這個問題的解法並 _不是_ 拿掉依賴。**我們很快會看見解法。
Sometimes when you do that, it causes a problem. For example, maybe you see an infinite refetching loop, or a socket is recreated too often. **The solution to that problem is _not_ to remove a dependency.** We’ll look at the solutions soon.

但在我們跳到解法之前，讓我們先更了解我們的問題。
But before we jump to solutions, let’s understand the problem better.

## 當欺騙依賴的時候會發生什麼事
## What Happens When Dependencies Lie

如果 deps 包含了每個 effect 所用到的值，React 知道什麼時候重新執行它：
If deps contain every value used by the effect, React knows when to re-run it:

```jsx{3}
  useEffect(() => {
    document.title = 'Hello, ' + name;
  }, [name]);
```

![Diagram of effects replacing one another](./deps-compare-correct.gif)

*（依賴不同了，所以我們重新執行 effect。）*
*(Dependencies are different, so we re-run the effect.)*

但當我們對這個 effect 宣告使用 `[]`，新的函式不會執行：
But if we specified `[]` for this effect, the new effect function wouldn’t run:

```jsx{3}
  useEffect(() => {
    document.title = 'Hello, ' + name;
  }, []); // Wrong: name is missing in deps
```

![Diagram of effects replacing one another](./deps-compare-wrong.gif)

*（依賴相同，所以我們跳過 effect。）*
*(Dependencies are equal, so we skip the effect.)*

在這個例子下問題可能不太明顯。但直覺會在別的情況下欺騙你，當 class 解法「跳出」你的記憶時。
In this case the problem might seem obvious. But the intuition can fool you in other cases where a class solution “jumps out” from your memory.

舉例來說，假設我們寫了一個每秒增加的計數器。用 class，我們的直覺是：「設定一次區間，然後摧毀一次」。這裡是個我們可以怎麼做的[例子](https://codesandbox.io/s/n5mjzjy9kl)。當我們心理上想要把這段程式碼翻譯到 `useEffect` 時，我們會直覺的把`[]`加到 deps。「我想要執行他一次」，對吧？
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

然而，這個例子[只*增加*了一次](https://codesandbox.io/s/91n5z8jo7r)。*Oops*
However, this example [only *increments* once](https://codesandbox.io/s/91n5z8jo7r). *Oops.*

如果你的心裡模型是「依賴讓我設定我想要重新觸發 effect 的時候」，這個例子可能會給你災難。你*想要*觸發他一次因為他是一個區間 -- 所以為什麼這個會導致問題？
If your mental model is “dependencies let me specify when I want to re-trigger the effect”, this example might give you an existential crisis. You *want* to trigger it once because it’s an interval — so why is it causing issues?

然而，如果你知道依賴是我們給 React 所提供關於*所有*那個 effect 在渲染範圍所使用的提示的話，這樣很合理。他用了`count`但我們利用`[]`欺騙他沒有用。在這個反咬我們一口前只是時間問題。
However, this makes sense if you know that dependencies are our hint to React about *everything* that the effect uses from the render scope. It uses `count` but we lied that it doesn’t with `[]`. It’s only a matter of time before this bites us!

在第一次渲染， `count` 是 `0`。因此，在第一次渲染的 effect 裡的 `setCount(count + 1)`代表`setCount(0 + 1)`。**我們因為 `[]` deps 沒有重新執行 effect，他會保持每秒都呼叫`setCount(0 + 1)`：**
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

我們欺騙了 React 告訴他我們的 effect 不依賴任何元件裡的值，但實際上他有！
We lied to React by saying our effect doesn’t depend on a value from inside our component, when in fact it does!

我們的 effect 使用了 `count` -- 一個在元件裡的值（但在 effect 之外）：
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

因此，宣告`[]`當作依賴會導致錯誤。React 會比較依賴，然後跳過更新這個 effect：
Therefore, specifying `[]` as a dependency will create a bug. React will compare the dependencies, and skip updating this effect:

![Diagram of stale interval closure](./interval-wrong.gif)

*(Dependencies are equal, so we skip the effect.)*

這樣的問題是很難想像的。因此，我鼓勵你把它當作一個必須遵守的規則來永遠誠實面對 effect 的依賴，然後宣告全部。（我們提供了一個[lint rule](https://github.com/facebook/react/issues/14920)如果你想要在你的組裡強制這件事。）
Issues like this are difficult to think about. Therefore, I encourage you to adopt it as a hard rule to always be honest about the effect dependencies, and specify them all. (We provide a [lint rule](https://github.com/facebook/react/issues/14920) if you want to enforce this on your team.)

## 兩種對依賴誠實的方法
## Two Ways to Be Honest About Dependencies

有兩個誠實對待依賴的策略。你應該從第一個開始，然後必要時再執行第二個。
There are two strategies to be honest about dependencies. You should generally start with the first one, and then apply the second one if needed.

**第一個策略是修正依賴陣列來包含 _所有_ 在元件裡被 effect 所用到的值。**讓我們把`count`當作 dep：
**The first strategy is to fix the dependency array to include _all_ the values inside the component that are used inside the effect.** Let’s include `count` as a dep:

```jsx{3,6}
useEffect(() => {
  const id = setInterval(() => {
    setCount(count + 1);
  }, 1000);
  return () => clearInterval(id);
}, [count]);
```

這使得依賴的陣列正確。他可能不是*理想的*，但他是第一個我們需要修正的問題。現在 `count` 的改變會重新執行 effect，每個下次的區間參考了 `count` 渲染的 `setCount(count + 1)`：
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

這會[修正問題](https://codesandbox.io/s/0x0mnlyq8l)，但每當 `count` 改變時，我們的區間會被清掉再重設。這可能不是我們想要的：
That would [fix the problem](https://codesandbox.io/s/0x0mnlyq8l) but our interval would be cleared and set again whenever the `count` changes. That may be undesirable:

![Diagram of interval that re-subscribes](./interval-rightish.gif)

*(Dependencies are different, so we re-run the effect.)*

---

**第二個策略是改變我們的 effect 程式碼，讓他不會*需要*一個超過我們預想的經常改變的值。**我們不想要對依賴說謊 -- 我們只想要改變我們的 effect 使他擁有*少一點*依賴。
**The second strategy is to change our effect code so that it wouldn’t *need* a value that changes more often than we want.** We don’t want to lie about the dependencies — we just want to change our effect to have *fewer* of them.

讓我們來看看幾個常見的移除依賴的技巧。
Let’s look at a few common techniques for removing dependencies.

---

## 讓 Effect 自給自足
## Making Effects Self-Sufficient

我們想要把 `count` 依賴移出我們的 effect。
We want to get rid of the `count` dependency in our effect.

```jsx{3,6}
  useEffect(() => {
    const id = setInterval(() => {
      setCount(count + 1);
    }, 1000);
    return () => clearInterval(id);
  }, [count]);
```

為了做到這樣，我們需要問問我們自己：**我們為了什麼使用 `count` 呢？**看起來我們只為了呼叫 `setCount` 而用它。在這樣的情況下，我們並不真的需要 `count`。當我們想要根據前一次的狀態來更新狀態，我們可以使用 `setState` 的 [函式更新表單](https://reactjs.org/docs/hooks-reference.html#functional-updates)：
To do this, we need to ask ourselves: **what are we using `count` for?** It seems like we only use it for the `setCount` call. In that case, we don’t actually need `count` in the scope at all. When we want to update state based on the previous state, we can use the [functional updater form](https://reactjs.org/docs/hooks-reference.html#functional-updates) of `setState`:

```jsx{3}
  useEffect(() => {
    const id = setInterval(() => {
      setCount(c => c + 1);
    }, 1000);
    return () => clearInterval(id);
  }, []);
```

我喜歡把這些情況想成是「錯誤的依賴」。是的，`count`是必須的依賴，因為我們在 effect 裡寫了 `setCount(count + 1)`。但是，我們只真的需要 `count` 來轉換它為 `count + 1` 然後「把它送回去」給 React。但 React *已經知道*目前的 `count` 了。**我們只需要告訴 React 增加這個狀態 -- 無論他現在是什麼。**
I like to think of these cases as “false dependencies”. Yes, `count` was a necessary dependency because we wrote `setCount(count + 1)` inside the effect. However, we only truly needed `count` to transform it into `count + 1` and “send it back” to React. But React *already knows* the current `count`. **All we needed to tell React is to increment the state — whatever it is right now.**

這就是 `setCount(c => c + 1)` 所在做的事情。你可以想像他是給 React「送出一個教學」，這個教學是關於狀態該如何改變。這個「更新表單」也對其他情況有幫助，像是當你 [批次更新多樣東西](/react-as-a-ui-runtime/#batching)
That’s exactly what `setCount(c => c + 1)` does. You can think of it as “sending an instruction” to React about how the state should change. This “updater form” also helps in other cases, like when you [batch multiple updates](/react-as-a-ui-runtime/#batching).

**注意我們實際上 _做了工_ 來移除依賴。我們並不是在欺騙。我們的 effect 再也不會從渲染的範圍讀取 `counter` 的值：**
**Note that we actually _did the work_ to remove the dependency. We didn’t cheat. Our effect doesn’t read the `counter` value from the render scope anymore:**

![Diagram of interval that works](./interval-right.gif)

*(Dependencies are equal, so we skip the effect.)*

你可以在[這裡](https://codesandbox.io/s/q3181xz1pj)試試看。
You can try it [here](https://codesandbox.io/s/q3181xz1pj).

即使這個 effect 只執行了一次，屬於第一次渲染的區間的 callback 是有能力每次在區間觸發的時候送出 `c => c + 1` 這個更新的教學。他再也不需要知道現在的 `counter` 狀態。React 已經知道他了。
Even though this effect only runs once, the interval callback that belongs to the first render is perfectly capable of sending the `c => c + 1` update instruction every time the interval fires. It doesn’t need to know the current `counter` state anymore. React already knows it.

## 函式更新和 Google 文件
## Functional Updates and Google Docs

記得我們討論到同步化是 effect 的心理模型嗎？同步化的有趣之處是你常常會想要保持系統之間的「訊息」與他們的狀態分離。舉例來說，編輯一個 Google 文件並不會真的送出*完整*的頁面到伺服器。那會非常沒有效率。相反的，他送出一個使用者想要做的事情的表示。
Remember how we talked about synchronization being the mental model for effects? An interesting aspect of synchronization is that you often want to keep the “messages” between the systems untangled from their state. For example, editing a document in Google Docs doesn’t actually send the *whole* page to the server. That would be very inefficient. Instead, it sends a representation of what the user tried to do.

當我們的使用情境不同時，相似的哲學仍適用於 effect。**他幫助了我們從 effect 只送出最小需要的資訊到元件裡。**更新的表單像是 `setCount(c => c + 1)` 傳達了比起 `setCount(count + 1)` 還少的資訊，因為他並不是被現在的計數給污染。他只表達了動作（「增加」）。想像 React 包含了[找到最少的狀態](https://reactjs.org/docs/thinking-in-react.html#step-3-identify-the-minimal-but-complete-representation-of-ui-state)。這是一樣的原則，但是為了更新。
While our use case is different, a similar philosophy applies to effects. **It helps to send only the minimal necessary information from inside the effects into a component.** The updater form like `setCount(c => c + 1)` conveys strictly less information than `setCount(count + 1)` because it isn’t “tainted” by the current count. It only expresses the action (“incrementing”). Thinking in React involves [finding the minimal state](https://reactjs.org/docs/thinking-in-react.html#step-3-identify-the-minimal-but-complete-representation-of-ui-state). This is the same principle, but for updates.

將「意圖」編碼（而不是結果）與 Google 文件如何[解決](https://medium.com/@srijancse/how-real-time-collaborative-editing-work-operational-transformation-ac4902d75682)協作編輯是相似的。雖然這是延伸的類比，函式更新在 React 裡代表了相似的角色。他們保證了從多個來源（event handlers, events subscription 等）來的更新可以被正確且以可預期的方式來批次應用。
Encoding the *intent* (rather than the result) is similar to how Google Docs [solves](https://medium.com/@srijancse/how-real-time-collaborative-editing-work-operational-transformation-ac4902d75682) collaborative editing. While this is stretching the analogy, functional updates serve a similar role in React. They ensure updates from multiple sources (event handlers, effect subscriptions, etc) can be correctly applied in a batch and in a predictable way.

**然而，即使是 `setCount(c => c + 1)` 也不是那麼棒。**他看起來有點奇怪，而且限制了很多我們能做的東西。例如，如果我們有兩個狀態的變數，他們的值依賴於彼此，或是如果我們想要根據 props 來計算下一個狀態，他並不能幫助到我們。幸運的，`setCount(c => c + 1)` 有更強大的姐妹變化。他的名字叫做 `useReducer`。
**However, even `setCount(c => c + 1)` isn’t that great.** It looks a bit weird and it’s very limited in what it can do. For example, if we had two state variables whose values depend on each other, or if we needed to calculate the next state based on a prop, it wouldn’t help us. Luckily, `setCount(c => c + 1)` has a more powerful sister pattern. Its name is `useReducer`.

## 從動作分離更新
## Decoupling Updates from Actions

讓我們修改一下前面的例子使得我們有兩個狀態的變數：`count` 和 `step`。我們的區間會根據 `step` 輸入的值來增加計數：
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

注意**我們並不是在欺騙。**因為我在 effect 裡開始使用 `step`，我把它加進依賴禮。這就是為什麼我們的程式碼正確執行。
Note that **we’re not cheating**. Since I started using `step` inside the effect, I added it to the dependencies. And that’s why the code runs correctly.

這個例子裡現在的行為是改變 `step` 會重新開始區間 -- 因為他是我們其中一個依賴。在很多情況下，這就是你所想要的！解開一個 effect 並重新設定他並沒有任何錯，而且我們不應該避免這樣，除非我們有好的理由。
The current behavior in this example is that changing the `step` restarts the interval — because it’s one of the dependencies. And in many cases, that is exactly what you want! There’s nothing wrong with tearing down an effect and setting it up anew, and we shouldn’t avoid that unless we have a good reason.

然而，假設我們不想要區間時鐘在 `step` 改變時重設，我們應該要怎樣在 effect 裡移除我們的 `step` 依賴呢？
However, let’s say we want the interval clock to not reset on changes to the `step`. How do we remove the `step` dependency from our effect?

**當我們依賴另一個狀態變數的現有值來更新一個狀態變數時，你可能會想要嘗試用 `useReducer` 取代兩者。**
**When setting a state variable depends on the current value of another state variable, you might want to try replacing them both with `useReducer`.**

當你發現你開始寫 `setSomething(something => ...)`，這就是個好時機來思考使用 reducer。Reducer 讓你**分離表達了發生在元件裡的「動作」與狀態如何依據他們而有的更新。**
When you find yourself writing `setSomething(something => ...)`, it’s a good time to consider using a reducer instead. A reducer lets you **decouple expressing the “actions” that happened in your component from how the state updates in response to them**.

讓我們把 effect 裡的依賴從 `step` 改成 `dispatch`：
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

你可能會問：「這個哪裡比較好？」答案是 **React 保證了 `dispatch` 函式在元件的生命週期裡是常數。所以上面的例子不需要重新訂閱區間。**
You might ask me: “How is this any better?” The answer is that **React guarantees the `dispatch` function to be constant throughout the component lifetime. So the example above doesn’t ever need to resubscribe the interval.**

我們解決了我們的問題！
We solved our problem!

*(你可以從 deps 裡省略 `dispatch`, `setState`, 和 `useRef` 的值，因為 React 保證他們會是靜態的。但列出他們也不會有什麼錯誤。)*
*(You may omit `dispatch`, `setState`, and `useRef` container values from the deps because React guarantees them to be static. But it also doesn’t hurt to specify them.)*

取代了在 effect *裡面*讀取狀態，他調度了對於*發生了什麼事*的資訊的編碼的*動作*。這使得我們的 effect 可以保持與 `step` 的狀態分離。我們的 effect 並不在乎我們*如何*更新狀態，他只告訴了我們*發生了什麼事*。然後 reducer 將更新的邏輯集中：
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

## 為什麼 useReducer 是 Hooks 的欺騙模式
## Why useReducer Is the Cheat Mode of Hooks

我們已經看見在 effect 需要根據前一個狀態或其他狀態變數來設定狀態時該如何移除依賴。**但是如果我們需要 _props_ 來計算下一個狀態的時候該怎麼辦呢？**例如，或許我們的 API 是 `<Counter step={1} />`。當然，在這個狀況下我們不能避免將 `props.step` 設為依賴？
We’ve seen how to remove dependencies when an effect needs to set state based on previous state, or on another state variable. **But what if we need _props_ to calculate the next state?** For example, maybe our API is `<Counter step={1} />`. Surely, in this case we can’t avoid specifying `props.step` as a dependency?

事實上，我們可以！我們可以把 *reducer 本身*放進我們的元件來讀取 props：
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

這個模式讓一些優化變得沒有作用，所以試著不要在每個地方都使用他，但如果你需要的話你完全可以從 reducer 拿到 props。（這裡是一個[示範](https://codesandbox.io/s/7ypm405o8q)。）
This pattern disables a few optimizations so try not to use it everywhere, but you can totally access props from a reducer if you need to. (Here’s a [demo](https://codesandbox.io/s/7ypm405o8q).)

**即使在那個例子裡，`dispatch` 仍然保證會在不同重新的渲染之間保持穩定。**所以如果你想要的話，你可以在 effect 的 deps 裡忽略他。他並不會導致 effect 重新執行。
**Even in that case, `dispatch` identity is still guaranteed to be stable between re-renders.** So you may omit it from the effect deps if you want. It’s not going to cause the effect to re-run.

你可能會想：這個怎麼可能會有效？Reducer 怎麼在被另一個渲染裡的 effect 呼叫的時候「知道」props 是什麼？答案是當你 `dispatch`，React 會記住這個動作 -- 但他會在下一次渲染*呼叫*你的 reducer。在那個時間點心得 props 會在範圍裡，你不需要在 effect 之內。
You may be wondering: how can this possibly work? How can the reducer “know” props when called from inside an effect that belongs to another render? The answer is that when you `dispatch`, React just remembers the action — but it will *call* your reducer during the next render. At that point the fresh props will be in scope, and you won’t be inside an effect.

**這就是為什麼我喜歡將 `useReducer` 想成是 Hooks 的「欺騙模式」。他讓我可以分離更新的邏輯以及描述發生了什麼事。這樣一來，幫助我移除了 effect 裡不必要的依賴以及避免在非必要的時候重新執行他們。**
**This is why I like to think of `useReducer` as the “cheat mode” of Hooks. It lets me decouple the update logic from describing what happened. This, in turn, helps me remove unnecessary dependencies from my effects and avoid re-running them more often than necessary.**

## 把函式移到 Effect 裡
## Moving Functions Inside Effects

一個常見的錯誤是認為函式不應該出現在依賴裡。例如，這樣看起來是可行的：
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

*([這個例子](https://codesandbox.io/s/8j4ykjyv0) 是由 Robin Wieruch 的文章修改而來的 — [看看這個](https://www.robinwieruch.de/react-hooks-fetch-data/)!)*
*([This example](https://codesandbox.io/s/8j4ykjyv0) is adapted from a great article by Robin Wieruch — [check it out](https://www.robinwieruch.de/react-hooks-fetch-data/)!)*

在更清楚一點，這段程式碼*真的*會正確執行。**但是單純忽略本地的函式的問題是，當元件規模成長時，會變得很難區分我們是否處理了所有的情況！**
And to be clear, this code *does* work. **But the problem with simply omitting local functions is that it gets pretty hard to tell whether we’re handling all cases as the component grows!**

想像我們的程式碼被分成像下面的樣子，然後每個函式都是五倍大：
Imagine our code was split like this and each function was five times larger:

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


現在假設我們之後使用了某些狀態或 prop 在其中一個函式裡：
Now let’s say we later use some state or prop in one of these functions:

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

如果我們忘記要更新任何一個呼叫了這些函式的 effect 的 deps（可能，透過其他函式！），我們的 effect 會同步失敗改變 props 和狀態。這聽起來不好。
If we forget to update the deps of any effects that call these functions (possibly, through other functions!), our effects will fail to synchronize changes from our props and state. This doesn’t sound great.

幸運的，這個問題有個簡單的解法。**如果你只在一個 effect *裡*使用某些函式，把他們直接放進那個 effect *裡面*：**
Luckily, there is an easy solution to this problem. **If you only use some functions *inside* an effect, move them directly *into* that effect:**

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
  }, []); // ✅ Deps are OK
  // ...
}
```

([這裡是一個範例](https://codesandbox.io/s/04kp3jwwql).)

所以好處是什麼呢？我們不再需要去想「傳遞依賴」。我們的依賴陣列不會在說謊了：**我們真的 _沒有_ 在 effect 裡使用任何在元件外面範圍的東西。**
So what is the benefit? We no longer have to think about the “transitive dependencies”. Our dependencies array isn’t lying anymore: **we truly _aren’t_ using anything from the outer scope of the component in our effect**.

如果我們之後要編輯 `getFetchUrl` 來使用 `query` 狀態，我們更可能注意到我們正在 effect *裡面*編輯他 -- 因此，我們需要把 `query` 加進 effect 的依賴裡：
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

(這裡是一個[範例](https://codesandbox.io/s/pwm32zx7z7).)

藉由增加這個依賴，我們不只「討好 React」，在 query 改變時去重新獲取資料變得*有道理*了。**`useEffect` 的設計嗆莫你去注意資料流的變化以及選擇讓我們的 effect 如何去同步他 -- 而不是忽略他直到我們的使用者遇到了錯誤。**
By adding this dependency, we’re not just “appeasing React”. It *makes sense* to refetch the data when the query changes. **The design of `useEffect` forces you to notice the change in our data flow and choose how our effects should synchronize it — instead of ignoring it until our product users hit a bug.**

幸虧 `eslint-plugin-react-hooks` plugin 有 `exhaustive-deps` 這個 lint rule，你可以[分析你在編輯器裡輸入的 effect](https://github.com/facebook/react/issues/14920)且獲得關於哪個依賴被遺漏的建議。換句話說，一個祭器可以告訴你哪個資料流的改變沒有正確被元件所處理。
Thanks to the `exhaustive-deps` lint rule from the `eslint-plugin-react-hooks` plugin, you can [analyze the effects as you type in your editor](https://github.com/facebook/react/issues/14920) and receive suggestions about which dependencies are missing. In other words, a machine can tell you which data flow changes aren’t handled correctly by a component.

![Lint rule gif](./exhaustive-deps.gif)

還滿貼心的。
Pretty sweet.

## 但我不想要把這個函式放進 Effect 裡
## But I Can’t Put This Function Inside an Effect

有時候你可能不想要把某個函式*放進*某個 effect 裡。例如，好幾個在同個元件裡的 effect 可能會呼叫一樣的函示，你不想要複製貼上他的邏輯。或他可能是一個 prop。
Sometimes you might not want to move a function *inside* an effect. For example, several effects in the same component may call the same function, and you don’t want to copy and paste its logic. Or maybe it’s a prop.

你應該跳過把這個函式放到 effect 的依賴裡嗎？我認為不。再一次的，**effect 不應該對他的依賴說謊。**通常會有更好的解法。一個常見的誤解是「函式不會改變」。但當我們透過這篇文章學習之後，這個完全不是事實。事實上，一個在元件裡定義的函式會在每次渲染改變！
Should you skip a function like this in the effect dependencies? I think not. Again, **effects shouldn’t lie about their dependencies.** There are usually better solutions. A common misconception is that “a function would never change”. But as we learned throughout this article, this couldn’t be further from truth. Indeed, a function defined inside a component changes on every render!

**他本身呈現了一個問題。**假設兩個 effect 呼叫了 `getFetchUrl`：
**That by itself presents a problem.** Say two effects call `getFetchUrl`:

```jsx
function SearchResults() {
  function getFetchUrl(query) {
    return 'https://hn.algolia.com/api/v1/search?query=' + query;
  }

  useEffect(() => {
    const url = getFetchUrl('react');
    // ... 獲取資料和做一些事 ...
  }, []); // 🔴 Missing dep: getFetchUrl

  useEffect(() => {
    const url = getFetchUrl('redux');
    // ... 獲取資料和做一些事 ...
  }, []); // 🔴 Missing dep: getFetchUrl

  // ...
}
```

在這個情況下你可能不想要把 `getFetchUrl` 移進任何一個 effect，因為你不能共享這個邏輯。
In that case you might not want to move `getFetchUrl` inside either of the effects since you wouldn’t be able to share the logic.

另一方面，如果你「誠實」對待 effect 的依賴，你可能會遇到一個問題。因為兩個 effect 都依賴於 `getFetchUrl` **(他在每次渲染都是不同的)**，我們的依賴陣列是毫無用處的：
On the other hand, if you’re “honest” about the effect dependencies, you may run into a problem. Since both our effects depend on `getFetchUrl` **(which is different on every render)**, our dependency arrays are useless:

```jsx{2-5}
function SearchResults() {
  // 🔴 在每次渲染都重新觸發所有 effect
  function getFetchUrl(query) {
    return 'https://hn.algolia.com/api/v1/search?query=' + query;
  }

  useEffect(() => {
    const url = getFetchUrl('react');
    // ... 獲取資料和做一些事 ...
  }, [getFetchUrl]); // 🚧 Deps 是正確的但他們太常改變了

  useEffect(() => {
    const url = getFetchUrl('redux');
    // ... 獲取資料和做一些事 ...
  }, [getFetchUrl]); // 🚧 Deps 是正確的但他們太常改變了

  // ...
}
```

一個迷人的解法是直接忽略把 `getFetchUrl` 函式放進 deps 的列表裡。然而，我不認為這是個好的解法。這使得我們很難察覺到我們*正在*為資料流新增一個改變，而這個改變*需要*被 effect 所處理。這導致了錯誤，像是我們之前看到的「永遠不會更新區間」。
A tempting solution to this is to just skip the `getFetchUrl` function in the deps list. However, I don’t think it’s a good solution. This makes it difficult to notice when we *are* adding a change to the data flow that *needs* to be handled by an effect. This leads to bugs like the “never updating interval” we saw earlier.

相反的，有兩個更簡單的解法。
Instead, there are two other solutions that are simpler.

**第一個，如果一個函式不使用任何在元件範圍裡的東西，你可以把他抽到元件外層，然後自由地在 effect 裡使用它：**
**First of all, if a function doesn’t use anything from the component scope, you can hoist it outside the component and then freely use it inside your effects:**

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

我們並不需要把他宣告在 deps 裡，因為他在渲染的範圍，而且他不會被資料流所影響。他不可能意外的依賴於 props 或狀態。
There’s no need to specify it in deps because it’s not in the render scope and can’t be affected by the data flow. It can’t accidentally depend on props or state.

另外，你可以把他包在[`useCallback` Hook](https://reactjs.org/docs/hooks-reference.html#usecallback) 裡面：
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

`useCallback` 就像增加另一層依賴的檢查。他解決了另一端的問題 -- **不是避免一個函式的依賴，而是我們讓函式本身只在需要時改變。**
`useCallback` is essentially like adding another layer of dependency checks. It’s solving the problem on the other end — **rather than avoid a function dependency, we make the function itself only change when necessary**.

讓我們看看為什麼這個途徑是有用的。之前，我們的例子顯示兩個搜尋的結果（ `'react'` 和 `'redux'` 的搜尋 queries）。所以 `getFetchUrl` 會從本地的狀態讀取他而不是把 `query` 當作一個參數。
Let's see why this approach is useful. Previously, our example showed two search results (for `'react'` and `'redux'` search queries). But let's say we want to add an input so that you can search for an arbitrary `query`. So instead of taking `query` as an argument, `getFetchUrl` will now read it from local state.

我們將會很快看到他沒有 `query` 這個依賴：
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

如果我將我的 `useCallback` 的 deps 修正為包含了 `query`，任何一個擁有 `getFetchUrl` deps 的 effect 會在 `query` 改變時重新執行：
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

由於有了 `useCallback`，如果 `query` 一樣的話，`getFetchUrl` 也會保持一樣，而且我們的 effect 不會重新執行。但如果 `query` 改變了，`getFetchUrl` 也會改變，然後我們會重新獲取資料。這就像是當你改變某些 Excel 表單的欄位，其他用到他的的欄位也會自動重新計算。
Thanks to `useCallback`, if `query` is the same, `getFetchUrl` also stays the same, and our effect doesn't re-run. But if `query` changes, `getFetchUrl` will also change, and we will re-fetch the data. It's a lot like when you change some cell in an Excel spreadsheet, and the other cells using it recalculate automatically.

這只是擁抱資料流和同步化心態的結果。**一樣的解法也適用於由上一層傳進來的函式 props：**
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

因為 `fetchData` 只在他的 `query` 狀態改變時在 `Parent` 裡面改變，我們的 `Child` 直到在應用程式裡真的需要時才會重新獲取資料。
Since `fetchData` only changes inside `Parent` when its `query` state changes, our `Child` won’t refetch the data until it’s actually necessary for the app.

## 函式是資料流的一部分嗎？
## Are Functions Part of the Data Flow?

有趣的，這個模式在 classes 的情形下是壞掉的，它顯示了 effect 和生命週期範例的不同。試著思考這個翻譯：
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

你可能會想：「嘿 Dan，我們都已經知道 `useEffect` 跟 `componentDidMount` 和 `componentDidUpdate` 合在一起很像了，你不能一直提到他！」**但即使有了 `componentDidUpdate`，這個仍不能正確執行：**
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

當然，`fetchData` 是一個 class 的方法！（或，是一個 class 的屬性 -- 但他不會改變任何東西。）他不會因為狀態改變而有所不同。所以 `this.props.fetchData` 會和 `prevProps.fetchData` 保持一樣，且我們不會重新獲取資料。讓我們移除這個條件試試？
Of course, `fetchData` is a class method! (Or, rather, a class property — but that doesn’t change anything.) It’s not going to be different because of a state change. So `this.props.fetchData` will stay equal to `prevProps.fetchData` and we’ll never refetch. Let’s just remove this condition then?

```jsx
  componentDidUpdate(prevProps) {
    this.props.fetchData();
  }
```

噢等一下，這個在*每次*重新渲染的時候都會獲取。（新增一個動畫到樹上是個發現他的有趣的方式。）或許我們可以把他綁到某個的特定的 query？
Oh wait, this fetches on *every* re-render. (Adding an animation above in the tree is a fun way to discover it.) Maybe let’s bind it to a particular query?

```jsx
  render() {
    return <Child fetchData={this.fetchData.bind(this, this.state.query)} />;
  }
```

但 `this.props.fetchData !== prevProps.fetchData` 會*永遠*是 `true`，即使 `query` 沒有改變！所以我們*永遠會*重新獲取。
But then `this.props.fetchData !== prevProps.fetchData` is *always* `true`, even if the `query` didn’t change! So we’ll *always* refetch.

這個 class 的難題的唯一的真的解法是硬著頭皮然後把 `query` 本身傳進 `Child` 元件裡。 `Child` 不會真的*使用* `query`，但當他改變時他會觸發重新獲取：
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

在使用了 React 的 class 這麼多年以來，我已經太習慣於把不必要的 props 傳下去然後破壞上層元件的封裝，我只在一週前發現為什麼我們必須這麼做。
Over the years of working with classes with React, I’ve gotten so used to passing unnecessary props down and breaking encapsulation of parent components that I only realized a week ago why we had to do it.

**有 class，函式的 props 本身不會真的是資料流的一部分。**方法（methods）會關掉 mutable `this` 變數，所以我們不能依靠他們的身份來表示任何東西。因此，即使當我們只想要一個函式，我們必須照順序傳遞一堆其他的資料才能夠來「區分」他。我們不能知道 `this.props.fetchData` 是否根據某些狀態被上層傳遞下來，也不知道狀態是否改變了。
**With classes, function props by themselves aren’t truly a part of the data flow.** Methods close over the mutable `this` variable so we can’t rely on their identity to mean anything. Therefore, even when we only want a function, we have to pass a bunch of other data around in order to be able to “diff” it. We can’t know whether `this.props.fetchData` passed from the parent depends on some state or not, and whether that state has just changed.

**有了 `useCallback`，函式可以完全參與資料流。**我們可以說如果函式的輸入改變的話，函式本身也會改變，但如果沒有，他會保持一樣。幸虧有了 `useCallback` 所提供的顆粒度，像是 `props.fetchData` 之類的 props 的改變可以自動往下傳播。
**With `useCallback`, functions can fully participate in the data flow.** We can say that if the function inputs changed, the function itself has changed, but if not, it stayed the same. Thanks to the granularity provided by `useCallback`, changes to props like `props.fetchData` can propagate down automatically.

相似的，[`useMemo`](https://reactjs.org/docs/hooks-reference.html#usememo)讓我們可以在複雜的物件做到相同的事情：
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

**我想要強調把 `useCallback` 到處放是滿笨重的。**這是個好的逃生艙口，而且在一個函式被同時傳遞下去*且*在某些小孩裡的 effect 裡面被呼叫是有用的。或是你想要試著破壞小孩元件的記憶化。但 Hooks 比較適合[避免把 callbacks 往下傳](https://reactjs.org/docs/hooks-faq.html#how-to-avoid-passing-callbacks-down)。
**I want to emphasize that putting `useCallback` everywhere is pretty clunky.** It’s a nice escape hatch and it’s useful when a function is both passed down *and* called from inside an effect in some children. Or if you’re trying to prevent breaking memoization of a child component. But Hooks lend themselves better to [avoiding passing callbacks down](https://reactjs.org/docs/hooks-faq.html#how-to-avoid-passing-callbacks-down) altogether.

在上面的範例裡面，我會更傾向於 `fetchData` 是在我的 effect 裡面（他可能是從某個客製化的 Hook 抽出的）或是一個最上層的匯入。我想要讓 effect 保持簡單，但裡面的 callbacks 不會幫助這個。（「如果某些 `props.onComplete` callback 在 request 途中改變了怎麼辦？」你可以[模擬 class 的行為](#swimming-against-the-tide) 但他不會解決 race conditions。）
In the above examples, I’d much prefer if `fetchData` was either inside my effect (which itself could be extracted to a custom Hook) or a top-level import. I want to keep the effects simple, and callbacks in them don’t help that. (“What if some `props.onComplete` callback changes while the request was in flight?”) You can [simulate the class behavior](#swimming-against-the-tide) but that doesn’t solve race conditions.

## 講到競爭條件（Race Conditions）
## Speaking of Race Conditions

一個經典的有 class 的資料獲取例子如同下面這樣：
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

如同你可能知道的，這段程式碼是有問題的。他不會處理更新。所以第二種你在線上找得到的經典的範例會像這樣：
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

這個一定更好！但他仍然有問題。他會有問題的原因是因為這個 request 可能會不照順序。所以如果我獲取 `{id: 10}`，轉換到 `{id: 20}`，但 `{id: 20}` 的 request 比較早發生，這個比較早發生但比較晚結束的 request 會錯誤的覆蓋掉我的狀態。
This is definitely better! But it’s still buggy. The reason it’s buggy is that the request may come out of order. So if I’m fetching `{id: 10}`, switch to `{id: 20}`, but the `{id: 20}` request comes first, the request that started earlier but finished later would incorrectly overwrite my state.

這叫做競爭條件（race condition），他在擁有 `async` / `await` 的 top-down 資料流（props 或狀態會在某個 async 函式的中間發生）的程式碼裡很常見（假設了某些會等待結果）。
This is called a race condition, and it’s typical in code that mixes `async` / `await` (which assumes something waits for the result) with top-down data flow (props or state can change while we’re in the middle of an async function).

Effect 並不會神奇的解決這個問題，雖然如果你嘗試想要把 `async` 函式直接傳進 effect 裡，他們會警告你。（我們需要改進這個警告讓他能夠更清楚的告訴你可能會遇到什麼問題。）
Effects don’t magically solve this problem, although they’ll warn you if you try to pass an `async` function to the effect directly. (We’ll need to improve that warning to better explain the problems you might run into.)

如果你所使用的 async 方式支援取消，那很棒！你可以取消 async request 在你的 cleanup 函式裡面。
If the async approach you use supports cancellation, that’s great! You can cancel the async request right in your cleanup function.

另外，最簡單的權宜之計是利用布林值來追蹤他：
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

[這篇文章](https://www.robinwieruch.de/react-hooks-fetch-data/)提供了更多關於你可以怎麼處裡錯誤和裝載狀態，以及從客製化的 hook 裡抽出邏輯的細節。如果你對學習更多關於如何使用 Hook 來獲取資料有興趣，我推薦你看看這篇文章。
[This article](https://www.robinwieruch.de/react-hooks-fetch-data/) goes into more detail about how you can handle errors and loading states, as well as extract that logic into a custom Hook. I recommend you to check it out if you’re interested to learn more about data fetching with Hooks.

## 提高標準
## Raising the Bar

有了 class 的生命週期的心態，副作用會與渲染的輸出行為有所不同。渲染使用者介面是被 props 和狀態所驅使的，而且是保證會與他們一致，但副作用不是。這是常見的問題來源。
With the class lifecycle mindset, side effects behave differently from the render output. Rendering the UI is driven by props and state, and is guaranteed to be consistent with them, but side effects are not. This is a common source of bugs.

有了 `useEffect` 的心理模型，事情會預設為同步。副作用會變成 React 資料流的一部分。每個 `useEffect` 的呼叫，只要你用對他，你的元件就會把邊緣情況處理得很好。
With the mindset of `useEffect`, things are synchronized by default. Side effects become a part of the React data flow. For every `useEffect` call, once you get it right, your component handles edge cases much better.

然而，要正確使用他的預設成本是更高的。這可能會有點惱人。寫能夠處理好邊緣情況的同步化程式碼，本質上是比觸發一個與渲染不一致的副作用還難。
However, the upfront cost of getting it right is higher. This can be annoying. Writing synchronization code that handles edge cases well is inherently more difficult than firing one-off side effects that aren’t consistent with rendering.

如果 `useEffect` 是用來當作你最常使用的*那個*工具，這個可能是令人擔憂的。然而，他是低級別的建設基石。現在是 Hook 的早期，所以每個人都使用低級別的方法，尤其是在教學文件裡。但實際上，社群很有可能會開始移往高級別的 Hooks ，因為好的 API 會獲得驅動的力量。
This could be worrying if `useEffect` was meant to be *the* tool you use most of the time. However, it’s a low-level building block. It’s an early time for Hooks so everybody uses low-level ones all the time, especially in tutorials. But in practice, it’s likely the community will start moving to higher-level Hooks as good APIs gain momentum.

我看過不同的應用程式創造他們自己的 Hooks，像是封裝某些認證邏輯的 `useFetch`，或是使用主題 context 的 `useTheme`。一旦你有了那些東西的工具箱，你不用這麼*常*使用 `useEffect`。但她帶來的彈性使得每個立基於他上面的 hooks 有更多好處。
I’m seeing different apps create their own Hooks like `useFetch` that encapsulates some of their app’s auth logic or `useTheme` which uses theme context. Once you have a toolbox of those, you don’t reach for `useEffect` *that* often. But the resilience it brings benefits every Hook built on top of it.

目前為止，`useEffect` 最常用來獲取資料。但獲取資料並不是一個同步化的問題。這個尤其明顯因為我們的 deps 常常是 `[]`。那我們到底在同步什麼？
So far, `useEffect` is most commonly used for data fetching. But data fetching isn’t exactly a synchronization problem. This is especially obvious because our deps are often `[]`. What are we even synchronizing?

長期來看，[獲取資料的暫停（Suspense）](https://reactjs.org/blog/2018/11/27/react-16-roadmap.html#react-16x-mid-2019-the-one-with-suspense-for-data-fetching)將會允許第三方的套件有第一部的方法來告訴 React 直到某些 async （任何東西：程式碼，資料，圖片）好了之後來暫停渲染。
In the longer term, [Suspense for Data Fetching](https://reactjs.org/blog/2018/11/27/react-16-roadmap.html#react-16x-mid-2019-the-one-with-suspense-for-data-fetching) will allow third-party libraries to have a first-class way to tell React to suspend rendering until something async (anything: code, data, images) is ready.

Suspense 逐漸包含了某些資料獲取的使用情形，我預期 `useEffect` 會在你真的想要在副作用裡同步某些 props 或狀態時，當作一個漸入背景的強而有力的工具。不同於獲取資料，他自然的處理了這樣的情況，因為他就是設計來如此的。但直到那時，客製化的 Hooks 像是[這裡所顯示的](https://www.robinwieruch.de/react-hooks-fetch-data/)是個重複使用獲取資料邏輯的好方法。
As Suspense gradually covers more data fetching use cases, I anticipate that `useEffect` will fade into background as a power user tool for cases when you actually want to synchronize props and state to some side effect. Unlike data fetching, it handles this case naturally because it was designed for it. But until then, custom Hooks like [shown here](https://www.robinwieruch.de/react-hooks-fetch-data/) are a good way to reuse data fetching logic.

## 寫在最後
## In Closing

現在你已經知道我所知道關於使用 effect 的所有事情了，回去看一開始的[摘要](#tldr)，他看起來合理嗎？我有忽略掉什麼嗎？（我還沒用光我的紙！）
Now that you know pretty much everything I know about using effects, check out the [TLDR](#tldr) in the beginning. Does it make sense? Did I miss something? (I haven’t run out of paper yet!)

我會很想在推特上聽聽你們的想法！感謝閱讀。
I’d love to hear from you on Twitter! Thanks for reading.
