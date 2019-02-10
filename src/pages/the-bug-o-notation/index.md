---
title: The “Bug-O” Notation
date: '2019-01-25'
spoiler: What is the 🐞(<i>n</i>) of your API?
---

When you write performance-sensitive code, it’s a good idea to keep in mind its algorithmic complexity. It is often expressed with the [Big-O notation](https://rob-bell.net/2009/06/a-beginners-guide-to-big-o-notation/).

Big-O is a measure of **how much slower the code will get as you throw more data at it**. For example, if a sorting algorithm has O(<i>n<sup>2</sup></i>) complexity, sorting ×50 times more items will be roughly 50<sup>2</sup> = 2,500 times slower. Big O doesn’t give you an exact number, but it helps you understand how an algorithm *scales*.

Some examples: O(<i>n</i>), O(<i>n</i> log <i>n</i>), O(<i>n<sup>2</sup></i>), O(<i>n!</i>).


However, **this post isn’t about algorithms or performance**. It’s about APIs and debugging. It turns out, API design involves very similar considerations.

---

A significant part of our time goes into finding and fixing mistakes in our code. Most developers would like to find bugs faster. As satisfactory as it may be in the end, it sucks to spend the whole day chasing a single bug when you could have implemented something from your roadmap.

Debugging experience influences our choice of abstractions, libraries, and tools. Some API and language designs make a whole class of mistakes impossible. Some create endless problems. **But how can you tell which one is which?**

Many online discussions about APIs are primarily concerned with aesthetics. But that [doesn’t say much](/optimized-for-change/) about what it feels like to use an API in practice.

**I have a metric that helps me think about this. I call it the *Bug-O* notation:**

<font size="40">🐞(<i>n</i>)</font>

The Big-O describes how much an algorithm slows down as the inputs grow. The *Bug-O* describes how much an API slows *you* down as your codebase grows.

---

For example, consider this code that manually updates the DOM over time with imperative operations like `node.appendChild()` and `node.removeChild()` and no clear structure:

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

The problem with this code isn’t that it’s “ugly”. We’re not talking about aesthetics. **The problem is that if there is a bug in this code, I don’t know where to start looking.**

**Depending on the order in which the callbacks and events fire, there is a combinatorial explosion of the number of codepaths this program could take.** In some of them, I’ll see the right messages. In others, I’ll see multiple spinners, failure and error messages together, and possibly crashes.

This function has 4 different sections and no guarantees about their ordering. My very non-scientific calculation tells me there are 4×3×2×1 = 24 different orders in which they could run. If I add four more code segments, it’ll be 8×7×6×5×4×3×2×1 — *forty thousand* combinations. Good luck debugging that.

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