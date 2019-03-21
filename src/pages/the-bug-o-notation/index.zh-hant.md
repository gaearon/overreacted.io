---
title: 「Bug-O」 符號
date: '2019-01-25'
spoiler: 你的 API 的 🐞(<i>n</i>) 是什麼？
---

當你寫對於效能敏感的程式碼時，隨時將它的演算法複雜度銘記在心是件好事。它通常被呈現為[Big-O 標記](https://rob-bell.net/2009/06/a-beginners-guide-to-big-o-notation/)。

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
**Depending on the order in which the callbacks and events fire, there is a combinatorial explosion of the number of codepaths this program could take.** In some of them, I’ll see the right messages. In others, I’ll see multiple spinners, failure and error messages together, and possibly crashes.

這個函式有四個部分而且並不能保證它們的發生順序。我非常不科學嚴謹的計算告訴我，這裡會有 4×3×2×1 = 24 種不同的可能的執行順序。如果我再增加四小段程式碼，它會變成 8×7×6×5×4×3×2×1 - *四萬*種組合。祝你幫它除錯順利。
This function has 4 different sections and no guarantees about their ordering. My very non-scientific calculation tells me there are 4×3×2×1 = 24 different orders in which they could run. If I add four more code segments, it’ll be 8×7×6×5×4×3×2×1 — *forty thousand* combinations. Good luck debugging that.

**換句話說，這個方法的 Bug-O 是 🐞(<i>n!</i>)**，*n* 是碰到 DOM 的程式碼片段的數量。耶，他是個*階層*。當然，我不是非常科學的。實際上並不是所有的程序都會發生。但另一方面，每個小片段可能跑超過一次。<span style="word-break: keep-all">🐞(*¯\\\_(ツ)\_/¯*)</span>可能可以更精確，但它仍然滿糟的，我們可以做得更好。
**In other words, the Bug-O of this approach is 🐞(<i>n!</i>)** where *n* is the number of code segments touching the DOM. Yeah, that’s a *factorial*. Of course, I’m not being very scientific here. Not all transitions are possible in practice. But on the other hand, each of these segments can run more than once. <span style="word-break: keep-all">🐞(*¯\\\_(ツ)\_/¯*)</span> might be more accurate but it’s still pretty bad. We can do better.

---

To improve the Bug-O of this code, we can limit the number of possible states and outcomes. We don't need any library to do this. It’s just a matter of enforcing some structure on our code. Here is one way we could do it:

```jsx
let currentState = {
  step: 'initial', // 'initial' | 'pending' | 'success' | 'error'
};

function trySubmit() {
  if (currentState.step === 'pending') {
    // Don't allow to submit twice
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
  // Clear all existing children
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

This code might not look too different. It’s even a bit more verbose. But it is *dramatically* simpler to debug because of this line:

```jsx{3}
function setState(nextState) {
  // Clear all existing children
  formStatus.innerHTML = '';

  // ... the code adding stuff to formStatus ...
```

By clearing out the form status before doing any manipulations, we ensure that our DOM operations always start from scratch. This is how we can fight the inevitable [entropy](/the-elements-of-ui-engineering/) — by *not* letting the mistakes accumulate. This is the coding equivalent of “turning it off and on again”, and it works amazingly well.

**If there is a bug in the output, we only need to think *one* step back — to the previous `setState` call.** The Bug-O of debugging a rendering result is 🐞(*n*) where *n* is the number of rendering code paths. Here, it’s just four (because we have four cases in a `switch`).

We might still have race conditions in *setting* the state, but debugging those is easier because each intermediate state can be logged and inspected. We can also disallow any undesired transitions explicitly:

```jsx
function trySubmit() {
  if (currentState.step === 'pending') {
    // Don't allow to submit twice
    return;
  }
```

Of course, always resetting the DOM comes with a tradeoff. Naïvely removing and recreating the DOM every time would destroy its internal state, lose focus, and cause terrible performance problems in larger applications.

That’s why libraries like React can be helpful. They let you *think* in the paradigm of always recreating the UI from scratch without necessarily doing it:

```jsx
function FormStatus() {
  let [state, setState] = useState({
    step: 'initial'
  });

  function handleSubmit(e) {
    e.preventDefault();
    if (state.step === 'pending') {
      // Don't allow to submit twice
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

The code may look different, but the principle is the same. The component abstraction enforces boundaries so that you know no *other* code on the page could mess with its DOM or state. Componentization helps reduce the Bug-O.

In fact, if *any* value looks wrong in the DOM of a React app, you can trace where it comes from by looking at the code of components above it in the React tree one by one. No matter the app size, tracing a rendered value is 🐞(*tree height*).

**Next time you see an API discussion, consider: what is the 🐞(*n*) of common debugging tasks in it?** What about existing APIs and principles you’re deeply familiar with? Redux, CSS, inheritance — they all have their own Bug-O.

---