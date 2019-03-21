---
title: “Bug-O” 表示法
date: '2019-01-25'
spoiler: 你的 API 的 🐞(<i>n</i>) 是什么？
---

当你在写一些关乎性能的代码时，最好时刻注意它的算法复杂度。算法复杂度通常会用[大 O 表示法](https://rob-bell.net/2009/06/a-beginners-guide-to-big-o-notation/)来体现。

大 O 表示法是一种衡量指标：当传入的数据越来越大时，你的代码会变得多慢。举个例子，如果一个排序算法有 O(<i>n<sup>2</sup></i>) 复杂度，对原来量级 50 倍的元素排序，你的代码大约会慢 50<sup>2</sup> = 2,500 倍。大 O 表示法不会给你一个确切的数值，但它能让你更好地理解你的算法的伸缩性。

一些例子：O(<i>n</i>)、O(<i>n</i> log <i>n</i>)、O(<i>n<sup>2</sup></i>) 和 O(<i>n!</i>)。


然而，**这篇文章不是关于算法和性能的**，而是关于 APIs 和调试的。事实证明，设计 API 时也需要考虑类似的事情。

---

我们绝大多数时间都在为我们的代码找 bug 和修 bug。大多数开发者也希望能更快地找到 bug。即便最后 bug 找到了，舒服了，但它也可能消耗了我们一整天的时间，有这个时间都够你完成几个 roadmap 上的事情了。

调试的体验受我们选择的抽象、库和工具的影响。有的 API 和语言设计就能让我们避免一整类的错误，但有的则会制造无尽的麻烦。**但你怎么区分它们呢？**

网上许多关于 APIs 的讨论都主要集中在审美上，但那真的[对实际使用它时的感受没有太大影响](/optimized-for-change/)。

**关于这件事有一个衡量指标，我称它为 *Bug-O* 表示法:**

<font size="40">🐞(<i>n</i>)</font>

大 O 表示法描述随着数据量增大，你的算法会变得多慢。*Bug-O* 表示法描述随着代码量的增大，这个 API 会让**你**做一件事变得多慢。

---

来看一个例子，假设下面的代码每次都通过像 `node.appendChild()` 和 `node.removeChild()` 这样命令式的操作来手动更新 DOM，并且没有明确的组织结构：

```jsx
function trySubmit() {
  // Section 1
  let spinner = createSpinner();
  formStatus.appendChild(spinner);
  submitForm().then(() => {
  	// Section 2
    formStatus.removeChild(spinner);
    let successMessage = createSuccessMessage();
    formStatus.appendChild(successMessage);
  }).catch(error => {
  	// Section 3
    formStatus.removeChild(spinner);
    let errorMessage = createErrorMessage(error);
    let retryButton = createRetryButton();
    formStatus.appendChild(errorMessage);
    formStatus.appendChild(retryButton)
    retryButton.addEventListener('click', function() {
      // Section 4
      formStatus.removeChild(errorMessage);
      formStatus.removeChild(retryButton);
      trySubmit();
    });
  })
}
```

问题不在于代码丑不丑，我们暂且不谈代码的美观性。**问题是如果现在这个代码里出现了一个 bug，我都不知道从哪查起。**

**取决于回调和事件触发的顺序，整个程序中代码运行的路径组合会非常多，**其中有些能产生正确的结果，有些我可能会看到多个进度条或者什么奇怪的现象，有的时候甚至程序直接就崩溃了。

这个函数有 4 个不同的部分，并且顺序没有保证。根据我粗略的计算，它们的运行顺序大约有 4×3×2×1 = 24 种。如果我们在代码里再添加一些东西，可能会有 8×7×6×5×4×3×2×1 — *四万*多种组合。你就慢慢调试去吧...

**换句话说，它的 Bug-O 是 🐞(<i>n!</i>)**，其中 *n* 是修改 DOM 的代码片段数。是的，它是阶乘级的。当然，我这里可能不是很严谨。实际情况下不是所有的组合都会发生。不过另一方面，这些代码片段可能会执行多次，whatever... 总之这个代码就是不怎么样，我们可以做得更好。

---

为了改进这个代码的 Bug-O，我们可以限制可能的状态和结果数量。我们不需要使用任何库，只要强化一下代码的结构。比如这样：

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

看起来可能差异不大，甚至更啰嗦了，但是它却戏剧性地让调试变得更简单了。因为这几行：

```jsx{3}
function setState(nextState) {
  // Clear all existing children
  formStatus.innerHTML = '';

  // ... the code adding stuff to formStatus ...
```

通过在做任何操作前清空表单状态，我们保证了所有 DOM 操作都从新开始。这就是为什么我们可以战胜必然发生的[墒变](/the-elements-of-ui-engineering/)，通过*不让错误积累*。这个代码的做法有点像“把它关掉然后再打开”，就是这么神奇。

**如果结果有错误，我们只需要往回想一步，看一下上次的 `setState` 调用。** 调试渲染结果的 Bug-O 是 🐞(*n*) 其中 *n* 是渲染相关的代码路径数，在这里即为 4（因为 `switch` 里有 4 种情况）。

我们可能仍然会在*设置*状态的时候遇到竞态，但是调试它会比之前更简单，因为每个中间状态都可以被日志记录和检查。我们也可以显式地阻止一些非预期的状态变化：

```jsx
function trySubmit() {
  if (currentState.step === 'pending') {
    // Don't allow to submit twice
    return;
  }
```

当然，每次都重置 DOM 也有利有弊。简单地移除然后重建 DOM 会销毁它们的内部状态，让它们失去焦点，在更大型的应用里也会造成严重的性能问题。

这也就是为什么像 React 这样的库会很有帮助了，因为它们只需要让你思考如何从零开始搭建 UI，实际上库的内部却并不是这样做的：

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

代码看起来可能不太一样，但是原则是相同的。组件的抽象强化了指责的边界，因此你不知道其他页面上能影响 DOM 和状态的代码。组件化有助于降低 Bug-O。

事实上，如果一个 React 应用里有任何值在 DOM 上看起来不太对，你都可以跟踪它是从哪里来的，通过一个一个地查看在它之上的组件的代码。不论你的应用有多大，跟踪一个渲染出来的值是 🐞(*tree height*) 的。

**下一次你看到一个有关 API 的讨论，首先考虑：它的常规调试任务的 🐞(*n*) 是多少？** 现有你十分熟悉的 APIs 和开发原则怎么样？Redux、CSS、继承... 它们都有自己的 Bug-O。

---