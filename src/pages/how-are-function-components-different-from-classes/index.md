---
title: How Are Function Components Different from Classes?
date: '2019-03-03'
spoiler: They’re a whole different Pokémon.
cta: 'react'
---

How do React function components differ from React classes?

For a while, the canonical answer has been that classes provide access to more features (like state). With [Hooks](https://reactjs.org/docs/hooks-intro.html), that’s not true anymore.

Maybe you’ve heard one of them is better for performance. Which one? Many of such benchmarks are [flawed](https://medium.com/@dan_abramov/this-benchmark-is-indeed-flawed-c3d6b5b6f97f?source=your_stories_page---------------------------) so I’d be careful [drawing conclusions](https://github.com/ryardley/hooks-perf-issues/pull/2) from them. Performance primarily depends on what the code is doing rather than whether you chose a function or a class. In our observation, the performance differences are negligible, though optimization strategies are a bit [different](https://reactjs.org/docs/hooks-faq.html#are-hooks-slow-because-of-creating-functions-in-render).

In either case we [don’t recommend](https://reactjs.org/docs/hooks-faq.html#should-i-use-hooks-classes-or-a-mix-of-both) rewriting your existing components unless you have other reasons and don’t mind being an early adopter. Hooks are still new (like React was in 2014), and some “best practices” haven’t yet found their way into the tutorials.

So where does that leave us? Are there any fundamental differences between React functions and classes at all? Of course, there are — in the mental model. **In this post, I will look at the biggest difference between them.** It existed ever since function components were [introduced](https://reactjs.org/blog/2015/09/10/react-v0.14-rc1.html#stateless-function-components) in 2015 but it’s often overlooked:

>**Function components capture the rendered values.**

Let’s unpack what this means.

---

**Note: this post isn’t a value judgement of either classes or functions. I’m only describing the difference between these two programming models in React. For questions about adopting functions more widely, refer to the [Hooks FAQ](https://reactjs.org/docs/hooks-faq.html#adoption-strategy).**

---

Consider this component:

```jsx
function ProfilePage(props) {
  const showMessage = () => {
    alert('Followed ' + props.user);
  };

  const handleClick = () => {
    setTimeout(showMessage, 3000);
  };

  return (
    <button onClick={handleClick}>Follow</button>
  );
}
```

It shows a button that simulates a network request with `setTimeout` and then shows a confirmation alert. For example, if `props.user` is `'Dan'`, it will show `'Followed Dan'` after three seconds. Simple enough.

*(Note it doesn’t matter whether I use arrows or function declarations in the above example. `function handleClick()` would work exactly the same way.)*

How do we write it as a class? A naïve translation might look like this:

```jsx
class ProfilePage extends React.Component {
  showMessage = () => {
    alert('Followed ' + this.props.user);
  };

  handleClick = () => {
    setTimeout(this.showMessage, 3000);
  };

  render() {
    return <button onClick={this.handleClick}>Follow</button>;
  }
}
```

It is common to think these two snippets of code are equivalent. People often freely refactor between these patterns without noticing their implications:

![Spot the difference between two versions](./wtf.gif)

**However, these two snippets of code are subtly different.** Take a good look at them. Do you see the difference yet? Personally, it took me a while to see this.

**There are spoilers ahead so here’s a [live demo](https://codesandbox.io/s/pjqnl16lm7) if you wanna figure it out on your own.** The rest of this article explains the difference and why it matters.

---

Before we continue, I’d like to emphasize that the difference I’m describing has nothing to do with React Hooks per se. Examples above don’t even use Hooks!

It’s all about the difference between functions and classes in React. If you plan to use functions more often in a React app, you might want to understand it.

---

**We’ll illustrate the difference with a bug that is common in React applications.**

Open this **[example sandbox](https://codesandbox.io/s/pjqnl16lm7)** with a current profile selector and the two `ProfilePage` implementations from above — each rendering a Follow button.

Try this sequence of actions with both buttons:

1. **Click** one of the Follow buttons.
2. **Change** the selected profile before 3 seconds pass.
3. **Read** the alert text.

You will notice a peculiar difference:

* With the above `ProfilePage` **function**, clicking Follow on Dan’s profile and then navigating to Sophie’s would still alert `'Followed Dan'`.

* With the above `ProfilePage` **class**, it would alert `'Followed Sophie'`:

![Demonstration of the steps](./bug.gif)

---


In this example, the first behavior is the correct one. **If I follow a person and then navigate to another person’s profile, my component shouldn’t get confused about who I followed.** This class implementation is clearly buggy. 

*(You should totally [follow Sophie](https://mobile.twitter.com/sophiebits) though.)*

---

So why does our class example behave this way?

Let’s look closely at the `showMessage` method in our class:

```jsx{3}
class ProfilePage extends React.Component {
  showMessage = () => {
    alert('Followed ' + this.props.user);
  };
```

This class method reads from `this.props.user`. Props are immutable in React so they can never change. **However, `this` *is*, and has always been, mutable.**

Indeed, that’s the whole purpose of `this` in a class. React itself mutates it over time so that you can read the fresh version in the `render` and lifecycle methods.

So if our component re-renders while the request is in flight, `this.props` will change. The `showMessage` method reads the `user` from the “too new” `props`.

This exposes an interesting observation about the nature of user interfaces. If we say that a UI is conceptually a function of current application state, **the event handlers are a part of the render result — just like the visual output**. Our event handlers “belong” to a particular render with particular props and state.

However, scheduling a timeout whose callback reads `this.props` breaks that association. Our `showMessage` callback is not “tied” to any particular render, and so it “loses” the correct props. Reading from `this` severed that connection.

---

**Let’s say function components didn’t exist.** How would we solve this problem?

We’d want to somehow “repair” the connection between the `render` with the correct props and the `showMessage` callback that reads them. Somewhere along the way the `props` get lost.

One way to do it would be to read `this.props` early during the event, and then explicitly pass them through into the timeout completion handler:

```jsx{2,7}
class ProfilePage extends React.Component {
  showMessage = (user) => {
    alert('Followed ' + user);
  };

  handleClick = () => {
    const {user} = this.props;
    setTimeout(() => this.showMessage(user), 3000);
  };

  render() {
    return <button onClick={this.handleClick}>Follow</button>;
  }
}
```

This [works](https://codesandbox.io/s/3q737pw8lq). However, this approach makes the code significantly more verbose and error-prone with time. What if we needed more than a single prop? What if we also needed to access the state? **If `showMessage` calls another method, and that method reads `this.props.something` or `this.state.something`, we’ll have the exact same problem again.** So we would have to pass `this.props` and `this.state` as arguments through every method called from `showMessage`.

Doing so defeats the ergonomics normally afforded by a class. It is also difficult to remember or enforce, which is why people often settle for bugs instead.

Similarly, inlining the `alert` code inside `handleClick` doesn’t answer the bigger problem. We want to structure the code in a way that allows splitting it into more methods *but* also reading the props and state that correspond to the render related to that call. **This problem isn’t even unique to React — you can reproduce it in any UI library that puts data into a mutable object like `this`.**

Perhaps, we could *bind* the methods in the constructor?

```jsx{4-5}
class ProfilePage extends React.Component {
  constructor(props) {
    super(props);
    this.showMessage = this.showMessage.bind(this);
    this.handleClick = this.handleClick.bind(this);
  }

  showMessage() {
    alert('Followed ' + this.props.user);
  }

  handleClick() {
    setTimeout(this.showMessage, 3000);
  }

  render() {
    return <button onClick={this.handleClick}>Follow</button>;
  }
}
```

No, this doesn’t fix anything. Remember, the problem is us reading from `this.props` too late — not with the syntax we’re using! **However, the problem would go away if we fully relied on JavaScript closures.**

Closures are often avoided because it’s [hard](https://wsvincent.com/javascript-closure-settimeout-for-loop/) to think about a value that can be mutated over time. But in React, props and state are immutable! (Or at least, it’s a strong recommendation.) That removes a major footgun of closures.

This means that if you close over props or state from a particular render, you can always count on them staying exactly the same:

```jsx{3,4,9}
class ProfilePage extends React.Component {
  render() {
    // Capture the props!
    const props = this.props;

    // Note: we are *inside render*.
    // These aren't class methods.
    const showMessage = () => {
      alert('Followed ' + props.user);
    };

    const handleClick = () => {
      setTimeout(showMessage, 3000);
    };

    return <button onClick={handleClick}>Follow</button>;
  }
}
```


**You’ve “captured” props at the time of render:**

![Capturing Pokemon](./pokemon.gif)

This way any code inside it (including `showMessage`) is guaranteed to see the props for this particular render. React doesn’t “move our cheese” anymore.

**We could then add as many helper functions inside as we want, and they would all use the captured props and state.** Closures to the rescue!

---

The [example above](https://codesandbox.io/s/oqxy9m7om5) is correct but it looks odd. What’s the point of having a class if you define functions inside `render` instead of using class methods?

Indeed, we can simplify the code by removing the class “shell” around it:

```jsx
function ProfilePage(props) {
  const showMessage = () => {
    alert('Followed ' + props.user);
  };

  const handleClick = () => {
    setTimeout(showMessage, 3000);
  };

  return (
    <button onClick={handleClick}>Follow</button>
  );
}
```

Just like above, the `props` are still being captured — React passes them as an argument. **Unlike `this`, the `props` object itself is never mutated by React.**

It’s a bit more obvious if you destructure `props` in the function definition:

```jsx{1,3}
function ProfilePage({ user }) {
  const showMessage = () => {
    alert('Followed ' + user);
  };

  const handleClick = () => {
    setTimeout(showMessage, 3000);
  };

  return (
    <button onClick={handleClick}>Follow</button>
  );
}
```

When the parent component renders `ProfilePage` with different props, React will call the `ProfilePage` function again. But the event handler we already clicked “belonged” to the previous render with its own `user` value and the `showMessage` callback that reads it. They’re all left intact.

This is why, in the function version of [this demo](https://codesandbox.io/s/pjqnl16lm7), clicking Follow on Sophie’s profile and then changing selection to Sunil would alert `'Followed Sophie'`:

![Demo of correct behavior](./fix.gif)

This behavior is correct. *(Although you might want to [follow Sunil](https://mobile.twitter.com/threepointone) too!)*

---

Now we understand the big difference between functions and classes in React:

>**Function components capture the rendered values.**

**With Hooks, the same principle applies to state as well.** Consider this example:

```jsx
function MessageThread() {
  const [message, setMessage] = useState('');

  const showMessage = () => {
    alert('You said: ' + message);
  };

  const handleSendClick = () => {
    setTimeout(showMessage, 3000);
  };

  const handleMessageChange = (e) => {
    setMessage(e.target.value);
  };

  return (
    <>
      <input value={message} onChange={handleMessageChange} />
      <button onClick={handleSendClick}>Send</button>
    </>
  );
}
```

(Here’s a [live demo](https://codesandbox.io/s/93m5mz9w24).)

While this isn’t a very good message app UI, it illustrates the same point: if I send a particular message, the component shouldn’t get confused about which message actually got sent. This function component’s `message` captures the state that “belongs” to the render which returned the click handler called by the browser. So the `message` is set to what was in the input when I clicked “Send”.

---

So we know functions in React capture props and state by default. **But what if we *want* to read the latest props or state that don’t belong to this particular render?** What if we want to [“read them from the future”](https://dev.to/scastiel/react-hooks-get-the-current-state-back-to-the-future-3op2)?

In classes, you’d do it by reading `this.props` or `this.state` because `this` itself is mutable. React mutates it. In function components, you can also have a mutable value that is shared by all component renders. It’s called a “ref”:

```jsx
function MyComponent() {
  const ref = useRef(null);
  // You can read or write `ref.current`.
  // ...
}
```

However, you’ll have to manage it yourself.

A ref [plays the same role](https://reactjs.org/docs/hooks-faq.html#is-there-something-like-instance-variables) as an instance field. It’s the escape hatch into the mutable imperative world. You may be familiar with “DOM refs” but the concept is much more general. It’s just a box into which you can put something.

Even visually, `this.something` looks like a mirror of `something.current`. They represent the same concept.

By default, React doesn’t create refs for latest props or state in function components. In many cases you don’t need them, and it would be wasted work to assign them. However, you can track the value manually if you’d like:

```jsx{3,6,15}
function MessageThread() {
  const [message, setMessage] = useState('');
  const latestMessage = useRef('');

  const showMessage = () => {
    alert('You said: ' + latestMessage.current);
  };

  const handleSendClick = () => {
    setTimeout(showMessage, 3000);
  };

  const handleMessageChange = (e) => {
    setMessage(e.target.value);
    latestMessage.current = e.target.value;
  };
```

If we read `message` in `showMessage`, we’ll see the message at the time we pressed the Send button. But when we read `latestMessage.current`, we get the latest value — even if we kept typing after the Send button was pressed.

You can compare the [two](https://codesandbox.io/s/93m5mz9w24) [demos](https://codesandbox.io/s/ox200vw8k9) to see the difference yourself. A ref is a way to “opt out” of the rendering consistency, and can be handy in some cases.

Generally, you should avoid reading or setting refs *during* rendering because they’re mutable. We want to keep the rendering predictable. **However, if we want to get the latest value of a particular prop or state, it can be annoying to update the ref manually.** We could automate it by using an effect:

```jsx{4-8,11}
function MessageThread() {
  const [message, setMessage] = useState('');

  // Keep track of the latest value.
  const latestMessage = useRef('');
  useEffect(() => {
    latestMessage.current = message;
  });

  const showMessage = () => {
    alert('You said: ' + latestMessage.current);
  };
```

(Here’s a [demo](https://codesandbox.io/s/yqmnz7xy8x).)

We do the assignment *inside* an effect so that the ref value only changes after the DOM has been updated. This ensures our mutation doesn’t break features like [Time Slicing and Suspense](https://reactjs.org/blog/2018/03/01/sneak-peek-beyond-react-16.html) which rely on interruptible rendering.

Using a ref like this isn’t necessary very often. **Capturing props or state is usually a better default.** However, it can be handy when dealing with [imperative APIs](/making-setinterval-declarative-with-react-hooks/) like intervals and subscriptions. Remember that you can track *any* value like this — a prop, a state variable, the whole props object, or even a function.

This pattern can also be handy for optimizations — such as when `useCallback` identity changes too often. However, [using a reducer](https://reactjs.org/docs/hooks-faq.html#how-to-avoid-passing-callbacks-down) is often a [better solution](https://github.com/ryardley/hooks-perf-issues/pull/3). (A topic for a future blog post!)

---

In this post, we’ve looked at common broken pattern in classes, and how closures help us fix it. However, you might have noticed that when you try to optimize Hooks by specifying a dependency array, you can run into bugs with stale closures. Does it mean that closures are the problem? I don’t think so.

As we’ve seen above, closures actually help us *fix* the subtle problems that are hard to notice. Similarly, they make it much easier to write code that works correctly in the [Concurrent Mode](https://reactjs.org/blog/2018/03/01/sneak-peek-beyond-react-16.html). This is possible because the logic inside the component closes over the correct props and state with which it was rendered.

In all cases I’ve seen so far, **the “stale closures” problems happen due to a mistaken assumption that “functions don’t change” or that “props are always the same”**. This is not the case, as I hope this post has helped to clarify.

Functions close over their props and state — and so their identity is just as important. This is not a bug, but a feature of function components. Functions shouldn’t be excluded from the “dependencies array” for `useEffect` or `useCallback`, for example. (The right fix is usually either `useReducer` or the `useRef` solution above — we will soon document how to choose between them.)

When we write the majority of our React code with functions, we need to adjust our intuition about [optimizing code](https://github.com/ryardley/hooks-perf-issues/pull/3) and [what values can change over time](https://github.com/facebook/react/issues/14920).

As [Fredrik put it](https://mobile.twitter.com/EphemeralCircle/status/1099095063223812096):

>The best mental rule I’ve found so far with hooks is ”code as if any value can change at any time”.

Functions are no exception to this rule. It will take some time for this to be common knowledge in React learning materials. It requires some adjustment from the class mindset. But I hope this article helps you see it with fresh eyes.

React functions always capture their values — and now we know why.

![Smiling Pikachu](./pikachu.gif)

They’re a whole different Pokémon.
