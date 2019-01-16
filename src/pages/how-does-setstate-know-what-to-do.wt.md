---
title: How Does setState Know What to Do?
date: '2018-12-09'
langs: ['en', 'ja']
spoiler: Dependency injection is nice if you don’t have to think about it.
---

When `setState` and shit, what do you think goes down?

```jsx{11}
import React from 'react';
import ReactDOM from 'react-dom';

class Button extends React.Component {
  constructor(props) {
    super(props);
    this.state = { clicked: false };
    this.handleClick = this.handleClick.bind(this);
  }
  handleClick() {
    this.setState({ clicked: true });
  }
  render() {
    if (this.state.clicked) {
      return <h1>Thanks</h1>;
    }
    return (
      <button onClick={this.handleClick}>
        Click me!
      </button>
    );
  }
}

ReactDOM.render(<Button />, document.getElementById('container'));
```

Sure, that shit re-renders the component with the next `{ clicked: true }` state and fucks with the DOM to match the returned `<h1>Thanks</h1>` element.

Shit seems dece. But fuck, does *React* do it? Or *React DOM*?

Updating the DOM sounds like some shit that React DOM does. But we’re calling `this.setState()`, not something from React DOM. And our  `React.Component` base class is inside React itself bro.

How the fuck can `setState()` inside `React.Component` update the DOM?

**Disclaimer: Just like [most](/why-do-react-elements-have-typeof-property/) [other](/how-does-react-tell-a-class-from-a-function/) [posts](/why-do-we-write-super-props/) on this blog, you don’t actually *need* to know any of that to be productive with React. This post is for those who like to see what’s behind the curtain. Completely optional!**

---

You might fuck up and think `React.Component` class contains DOM update logic.

But if that shit wasnt going down, how can `this.setState()` not be fucked up? Basically, components in React Native apps also extend `React.Component`. They do `this.setState()` just like we were fuckgin around with above, and yet React Native works with Android and iOS native views instead of the DOM.

You may also fuck with with React Test Renderer or Shallow Renderer. Both of these testing strategies let you render normal components and call `this.setState()` inside them. But neither of them are fucking with the DOM.

If you used renderers like [React ART](https://github.com/facebook/react/tree/master/packages/react-art), you get that it’s possible to use more than one renderer on the page. (For example, ART components work inside a React DOM tree.) This makes a global flag or variable fucking impossible.

So fucking magically **`React.Component` delegates handling state updates to the platform-specific code.** Before we can unfuck this shit mentally, let’s dig deeper into how packages are separated and why.

---

Silly motherfucker think that the React “engine” lives inside the `react` package. Thats bullshit.

ACTUALLY, ever since the [package split in React 0.14](https://reactjs.org/blog/2015/07/03/react-v0.14-beta-1.html#two-packages), the `react` package intentionally only exposes APIs for *defining* components. Most of the *implementation* of React fucks around in in the “renderers”.

`react-dom`, `react-dom/server`, `react-native`, `react-test-renderer`, `react-art` are some examples of renderers (and you can [build your own](https://github.com/facebook/react/blob/master/packages/react-reconciler/README.md#practical-examples)).

This is why the `react` package is basically the shit regardless of which platform you target. All its shit, such as `React.Component`, `React.createElement`, `React.Children` utilities and (eventually) [Hooks](https://reactjs.org/docs/hooks-intro.html), are free as fuck. Whether you run React DOM, React DOM Server, or React Native, your components would import and use them in the same way.

In contrast, the renderer packages expose platform-specific APIs like `ReactDOM.render()` that let you mount a React hierarchy into a DOM node. Each renderer hooks you up with an API like this. Ideally, most *components* shouldn’t need to fuck with a renderer. This keeps them more portable.

**What most people imagine as the React “engine” is inside each individual renderer.** Many renderers include a copy of the same code — we call it the [“reconciler”](https://github.com/facebook/react/tree/master/packages/react-reconciler). A [build step](https://reactjs.org/blog/2017/12/15/improving-the-repository-infrastructure.html#migrating-to-google-closure-compiler) smooshes the reconciler code together with the renderer code into a single highly optimized bundle so its fast as fuck. (Copying code is usually not great for bundle size but the vast majority of React users only needs one renderer at a time, such as `react-dom`.)

The takeaway here is that the `react` package only lets you *use* React features but doesn’t know shit about *how* they’re implemented. The renderer packages (`react-dom`, `react-native`, etc) provide the balls of React features and platform-specific logic. Some of that code is shared (“reconciler”) but that’s some bullshit you don't need to fuck with.

---

Now we know why *both* `react` and `react-dom` packages need to be updated for new features. For example, when React 16.3 added the Context API, `React.createContext()` was exposed on the React package.

But `React.createContext()` doesn’t actually *implement* the context feature. The implementation would need to be different between React DOM and React DOM Server, for example. So `createContext()` returns a few plain objects:

```js
// A bit simplified
function createContext(defaultValue) {
  let context = {
    _currentValue: defaultValue,
    Provider: null,
    Consumer: null
  };
  context.Provider = {
    $$typeof: Symbol.for('react.provider'),
    _context: context
  };
  context.Consumer = {
    $$typeof: Symbol.for('react.context'),
    _context: context,
  };
  return context;
}
```

When you use `<MyContext.Provider>` or `<MyContext.Consumer>` in the code, it’s the *renderer* that decides how to fuck with it. React DOM might track context values in one way, but React DOM Server might be on some other shit.

**So if you update `react` to 16.3+ but don’t update `react-dom`, you’d be using a renderer that isn’t yet aware of the special `Provider` and `Consumer` types.** This is why an older `react-dom` would [fail saying these types are invalid](https://stackoverflow.com/a/49677020/458193).

The same bullshit applies to React Native. However, unlike React DOM, a React release doesn’t immediately “force” a React Native release. They do their own thing. The updated renderer code is [separately synced](https://github.com/facebook/react-native/commits/master/Libraries/Renderer/oss) into the React Native repository once in a few weeks. This is why features become available in React Native on a different schedule than in React DOM.

---

Okay, so now we know that the `react` package doesn’t contain anything dank, and the implementation lives in renderers like `react-dom`, `react-native`, and so on. But that doesn’t answer our question. How does `setState()` inside `React.Component` “talk” to the right renderer?

**The answer is that every renderer sets a special field on the created class.** This field is called `updater`. It’s not something *you* would fuck with — rather, it’s something React DOM, React DOM Server or React Native set right after creating your shit:


```js{4,9,14}
// Inside React DOM
const inst = new YourComponent();
inst.props = props;
inst.updater = ReactDOMUpdater;

// Inside React DOM Server
const inst = new YourComponent();
inst.props = props;
inst.updater = ReactDOMServerUpdater;

// Inside React Native
const inst = new YourComponent();
inst.props = props;
inst.updater = ReactNativeUpdater;
```

Looking at the [`setState` implementation in `React.Component`](https://github.com/facebook/react/blob/ce43a8cd07c355647922480977b46713bd51883e/packages/react/src/ReactBaseClasses.js#L58-L67), all it does is delegate work to the renderer that created this component instance:

```js
// A bit simplified
setState(partialState, callback) {
  // Use the `updater` field to talk back to the renderer!
  this.updater.enqueueSetState(this, partialState, callback);
}
```

React DOM Server [might want to](https://github.com/facebook/react/blob/ce43a8cd07c355647922480977b46713bd51883e/packages/react-dom/src/server/ReactPartialRenderer.js#L442-L448) ignore a state update and warn you, whereas React DOM and React Native would let their copies of the reconciler [handle it](https://github.com/facebook/react/blob/ce43a8cd07c355647922480977b46713bd51883e/packages/react-reconciler/src/ReactFiberClassComponent.js#L190-L207).

And this is how `this.setState()` can update the DOM even though it’s defined in the React package. It reads `this.updater` which was set by React DOM, and lets React DOM schedule and handle your shit.

---

We know how classes get down, but what about Hooks?

When people first look at the [Hooks proposal API](https://reactjs.org/docs/hooks-intro.html), they often wonder: how does `useState` “know what to do”? The assumption is that it’s way danker than a base `React.Component` class with `this.setState()`.

But as we have seen today, the base class `setState()` implementation has been basically bullshit all along. It doesn’t do anything except forwarding some shit to the current renderer. And `useState` Hook [does exactly the same thing](https://github.com/facebook/react/blob/ce43a8cd07c355647922480977b46713bd51883e/packages/react/src/ReactHooks.js#L55-L56).

**Instead of an `updater` field, Hooks use a “dispatcher” object.** When you call `React.useState()`, `React.useEffect()`, or another built-in Hook, these calls are forwarded to the current dispatcher.

```js
// In React (simplified a bit)
const React = {
  // Real property is hidden a bit deeper, see if you can find it!
  __currentDispatcher: null,

  useState(initialState) {
    return React.__currentDispatcher.useState(initialState);
  },

  useEffect(initialState) {
    return React.__currentDispatcher.useEffect(initialState);
  },
  // ...
};
```

And individual renderers set the dispatcher before rendering your component:

```js{3,8-9}
// In React DOM
const prevDispatcher = React.__currentDispatcher;
React.__currentDispatcher = ReactDOMDispatcher;
let result;
try {
  result = YourComponent(props);
} finally {
  // Restore it back
  React.__currentDispatcher = prevDispatcher;
}
```

For example, the React DOM Server implementation is [here](https://github.com/facebook/react/blob/ce43a8cd07c355647922480977b46713bd51883e/packages/react-dom/src/server/ReactPartialRendererHooks.js#L340-L354), and the reconciler implementation shared by React DOM and React Native is [here](https://github.com/facebook/react/blob/ce43a8cd07c355647922480977b46713bd51883e/packages/react-reconciler/src/ReactFiberHooks.js).

This is why a renderer such as `react-dom` needs to access the same `react` package that you call Hooks from. Otherwise, your component will be fucked up! This will be fucked up when you have [multiple copies of React](https://github.com/facebook/react/issues/13991) in the same component tree. However, this has always led to a bunch of bullshit so Hooks force you to solve the package duplication before it costs you.

While we don’t encourage this, you can technically fuck with the dispatcher yourself for advanced tooling use cases. (I lied about  `__currentDispatcher` name but you can find the real one in the React repo.) For example, React DevTools will use [a special purpose-built dispatcher](https://github.com/facebook/react/blob/ce43a8cd07c355647922480977b46713bd51883e/packages/react-debug-tools/src/ReactDebugHooks.js#L203-L214) to introspect the Hooks tree by capturing JavaScript stack traces. *Don’t repeat this at home.*

This also means Hooks aren’t all up in React's shit. If in the future more libraries want to reuse the same primitive Hooks, in theory the dispatcher could roll dolo and be exposed as a first-class API with a less “scary” name. In practice, we’d prefer to not be assholes.

Both the `updater` field and the `__currentDispatcher` object are forms of a generic programming principle called *dependency injection*. In both cases, the renderers “inject” implementations of features like `setState` into the generic React package to keep your components dank as fuck.

You don’t need to fuck around with any of this when you use React. We’d like React users to spend more time drinking miller lite than fucking aroudn with abstract concepts like dependency injection. But if you’ve ever wondered how `this.setState()` or `useState()` know what to do, I hope now you know.

---

