---
title: 「Bug-O」 符號
date: '2019-01-25'
spoiler: 你的 API 的 🐞(<i>n</i>) 是什麼？
---

當你寫對於效能敏感的程式碼時，隨時將它的演算法複雜度銘記在心是件好事。它通常被呈現為 [Big-O 標記](https://rob-bell.net/2009/06/a-beginners-guide-to-big-o-notation/)。

Big-O 是個測量 **你的程式碼在你的資料量變大的時候會變得多慢** 的標準。舉例來說，如果一個排序的演算法有 O(<i>n<sup>2</sup></i>) 的複雜度，排序 50 倍的東西大概會變成 50<sup>2</sup> = 2,500 倍慢。Big O 不會給你確切的數字，但他能夠幫助你了解演算法如何*擴展* (scales)。

一些例子：O(<i>n</i>), O(<i>n</i> log <i>n</i>), O(<i>n<sup>2</sup></i>), O(<i>n!</i>)。


然而，**本篇文章並不是要講關於演算法或效能的事**。本篇文章要討論的是 APIs 和除錯。看起來，API 的設計有非常類似的考量。

---

我們大部分的時間花在尋找和修理我們程式碼裡面的錯誤。大多數的開發者會想要快點找出錯誤的地方。儘管它最終可能是令人滿意的結果，但本來你可以開發你藍圖裡的某個東西，卻變成花一整天的時間尋找單一一個錯誤，這會令你感覺超爛。

除錯的經驗會影響我們對於抽象化、使用的套件和工具的抉擇。某些 API 和程式語言的設計讓一大部分的錯誤變得不可能發生。有的則造成了無盡的問題。**但你要怎麼知道誰屬於哪一種呢？**

很多線上關於 API 的討論主要都是關注於美感，但那[不能呈現出多少](/optimized-for-change/)關於這個 API 實際上用起來的感覺如何。

**我有一個幫助我衡量這個東西的標準，我叫他 *Bug-O* 符號：**

<font size="40">🐞(<i>n</i>)</font>

Big-O 解釋了你的程式碼在你輸入的資料量變大的時候會變得多慢。 *Bug-O* 解釋了當你的程式碼增長的時候某個 API 會拖慢*你*多少。 

---

舉例來說，以下的程式碼隨著時間急切的利用 `node.appendChild()` 和 `node.removeChild()` 手動更新 DOM ，並且沒有明確的結構：

```jsx
function trySubmit() {
  // 第一部分
  let spinner = createSpinner();
  formStatus.appendChild(spinner);
  submitForm().then(() => {
  	// 第二部分
    formStatus.removeChild(spinner);
    let successMessage = createSuccessMessage();
    formStatus.appendChild(successMessage);
  }).catch(error => {
  	// 第三部分
    formStatus.removeChild(spinner);
    let errorMessage = createErrorMessage(error);
    let retryButton = createRetryButton();
    formStatus.appendChild(errorMessage);
    formStatus.appendChild(retryButton)
    retryButton.addEventListener('click', function() {
      // 第四部分
      formStatus.removeChild(errorMessage);
      formStatus.removeChild(retryButton);
      trySubmit();
    });
  })
}
```

這段程式碼的問題不在它有多「醜」。我們不是在討論美感。 **它的問題在於如果裡面有錯誤，我不知道該從哪裡追起。**

**取決於哪個 callbacks 或事件所觸發的順序，這個程式碼有爆炸性多的可能執行的程式碼的順序。** 在它們之中的某些，我可以看到正確的訊息，其他的，我會看到多個微調、失敗、錯誤訊息出現在一起，而且還可能會整個崩壞。

這個函式有四個部分而且並不能保證它們的發生順序。我非常不科學嚴謹的計算告訴我，這裡會有 4×3×2×1 = 24 種不同的可能的執行順序。如果我再增加四小段程式碼，它會變成 8×7×6×5×4×3×2×1 - *四萬*種組合。祝你幫它除錯順利。

**換句話說，這個方法的 Bug-O 是 🐞(<i>n!</i>)**，*n* 是碰到 DOM 的程式碼片段的數量。耶，他是個*階層*。當然，我不是非常科學嚴謹的。實際上並不是所有的程序都會發生。但另一方面，每個小片段可能跑超過一次。<span style="word-break: keep-all">🐞(*¯\\\_(ツ)\_/¯*)</span>可能可以更精確，但它仍然滿糟的，我們可以做得更好。

---

為了改善這份程式碼的 Bug-O，我們可以限制可能的狀態以及結果的數量。我們不需要任何套件來做這件事，這只是個某種強迫程式碼結構的方法。以下是一種可行的方法：

```jsx
let currentState = {
  step: 'initial', // 'initial' | 'pending' | 'success' | 'error'
};

function trySubmit() {
  if (currentState.step === 'pending') {
    // 不允許送出兩次
    return;
  }
  setState({ step: 'pending' });
  submitForm().then(() => {
    setState({ step: 'success' });
  }).catch(error => {
    setState({ step: 'error', error });
  });
}

function setState(nextState) {
  // 清掉所有已經存在的小孩
  formStatus.innerHTML = '';

  currentState = nextState;
  switch (nextState.step) {
    case 'initial':
      break;
    case 'pending':
      formStatus.appendChild(spinner);
      break;
    case 'success':
      let successMessage = createSuccessMessage();
      formStatus.appendChild(successMessage);
      break;
    case 'error':
      let errorMessage = createErrorMessage(nextState.error);
      let retryButton = createRetryButton();
      formStatus.appendChild(errorMessage);
      formStatus.appendChild(retryButton);
      retryButton.addEventListener('click', trySubmit);
      break;
  }
}
```

這段程式碼可能看起來沒什麼差異，他甚至變得有點冗長，但它*戲劇性的*因為這行程式碼讓除錯變得更簡單：

```jsx{3}
function setState(nextState) {
  // 清掉所有已經存在的小孩
  formStatus.innerHTML = '';

  // ... 增加東西到 formStatus 的程式碼 ...
```

藉由在做任何操作以前清掉表格的狀態，我們可以保證我們在操作 DOM 的時候永遠都是從零開始。這個就是我們如何對抗難以避免的[亂度](/the-elements-of-ui-engineering/) - 藉由*不讓*錯誤累績。這個等同於程式碼的「關掉它再重新打開它」，它運作地令人驚訝的好。

**如果輸出有任何錯誤，我們只需要往回想*一步* - 到前一個呼叫 `setState` 的地方。** 除錯一個渲染的結果的 Bug-O 是 🐞(*n*)，*n* 是可能發生的渲染路徑的數量。在這裡，它就是四（因為我們在 `switch` 裡有四種情況）。

我們在*設定*狀態的時候可能還是有競爭條件 (race conditions)，但因為每個中間的狀態都可以被記錄和檢查，除錯變得更容易。我們也可以明確地不允許任何不想要的過渡：

```jsx
function trySubmit() {
  if (currentState.step === 'pending') {
    // 不允許送出兩次
    return;
  }
```

當然，永遠重設 DOM 會帶來一些代價。每次都移除和重新產生 DOM 會破壞它的內部狀態、失去焦點和導致大型應用程式裡糟糕的效能問題。

這就是為什麼像 React 這樣的套件可以很有幫助。它們讓你擁有總是從頭開始重新創建 UI 的範例中*思考*而不必真的這樣做：

```jsx
function FormStatus() {
  let [state, setState] = useState({
    step: 'initial'
  });

  function handleSubmit(e) {
    e.preventDefault();
    if (state.step === 'pending') {
      // 不允許送出兩次
      return;
    }
    setState({ step: 'pending' });
    submitForm().then(() => {
      setState({ step: 'success' });
    }).catch(error => {
      setState({ step: 'error', error });
    });
  }

  let content;
  switch (state.step) {
    case 'pending':
      content = <Spinner />;
      break;
    case 'success':
      content = <SuccessMessage />;
      break;
    case 'error':
      content = (
        <>
          <ErrorMessage error={state.error} />
          <RetryButton onClick={handleSubmit} />
        </>
      );
      break;
  }

  return (
    <form onSubmit={handleSubmit}>
      {content}
    </form>
  );
}
```

這段程式碼可能看起來不太一樣，但原則是相同的。元件的抽象化強制了邊界，所以你知道在這頁沒有*其他*程式碼可以弄亂它的 DOM 或狀態。元件化幫助減少 Bug-O。

事實上，如果*任何一個*在 React 應用程式裡的 DOM 的值看起來有錯，你可以藉由一個一個觀察在 React 樹裡的元件的程式碼來追蹤到它在哪裡。無論應用程式的大小，追蹤一個渲染的值是 🐞(*樹的高度*)。

**下一次當你看見關於 API 的討論，試著思考：它的一般除錯的 🐞(*n*) 是多少？**那你熟悉的已經存在的 API 和原則的又是多少呢？ Redux、CSS、繼承 - 它們都有自己的 Bug-O。

---