---
title: Why Do React Elements Have a $$typeof Property?
date: '2018-12-03'
spoiler: It has something to do with security.
---

You might think you’re writing JSX:

```jsx
<marquee bgcolor="#ffa7c4">hi</marquee>
```

But really, you’re calling a function:

```jsx
React.createElement(
  /* type */ 'marquee',
  /* props */ { bgcolor: '#ffa7c4' },
  /* children */ 'hi'
)
```

And that function gives you back an object. We call this object a React *element*. It tells React what to render next. Your components return a tree of them.

```jsx{9}
{
  type: 'marquee',
  props: {
    bgcolor: '#ffa7c4',
    children: 'hi',
  },
  key: null,
  ref: null,
  $$typeof: Symbol.for('react.element'), // 🧐 Who dis
}
```

If you used React you might be familiar with `type`, `props`, `key`, and `ref` fields. **But what is `$$typeof`? And why does it have a `Symbol()` as a value?**

That’s another one of those things that you don’t *need* to know to use React, but that will make you feel good when you do. There’s also some tips about security in this post that you might want to know. Maybe one day you’ll write your own UI library and all of this will come in handy. I certainly hope so.

---

Before client-side UI libraries became common and added basic protection, it was common for app code to construct HTML and insert it into the DOM:

```jsx
const messageEl = document.getElementById('message');
messageEl.innerHTML = '<p>' + message.text + '</p>';
```

That works fine, except when your `message.text` is something like `'<img src onerror="stealYourPassword()">'`. **You don’t want things written by strangers to appear verbatim in your app’s rendered HTML.**

(Fun fact: if you only do client-side rendering, a `<script>` tag here wouldn’t let you run JavaScript. But [don’t let this](https://gomakethings.com/preventing-cross-site-scripting-attacks-when-using-innerhtml-in-vanilla-javascript/) lull you into a false sense of security.)

To protect against such attacks, you can use safe APIs like `document.createTextNode()` or `textContent` that only deal with text. You can also preemptively “escape” inputs by replacing potentially dangerous characters like `<`, `>` and others in any user-provided text.

Still, the cost of a mistake is high and it’s a hassle to remember it every time you interpolate a user-written string into your output. **This is why modern libraries like React escape text content for strings by default:**

```jsx
<p>
  {message.text}
</p>
```

If `message.text` is a malicious string with an `<img>` or another tag, it won’t turn into a real `<img>` tag. React will escape the content and *then* insert it into the DOM. So instead of seeing the `<img>` tag you’ll just see its markup.

To render arbitrary HTML inside a React element, you have to write `dangerouslySetInnerHTML={{ __html: message.text }}`. **The fact that it’s clumsy to write is a *feature*.** It’s meant to be highly visible so that you can catch it in code reviews and codebase audits.

---

**Does it mean React is entirely safe from injection attacks? No.** HTML and DOM offer [plenty of attack surface](https://github.com/facebook/react/issues/3473#issuecomment-90594748) that is too difficult or slow for React or other UI libraries to mitigate against. Most of the remaining attack vectors involve attributes. For example, if you render `<a href={user.website}>`, beware of the user whose website is `'javascript: stealYourPassword()'`. Spreading user input like `<div {...userData}>` is rare but also dangerous.

React [could](https://github.com/facebook/react/issues/10506) provide more protection over time but in many cases these are consequences of server issues that [should](https://github.com/facebook/react/issues/3473#issuecomment-91327040) be fixed there anyway.

Still, escaping text content is a reasonable first line of defence that catches a lot of potential attacks. Isn’t it nice to know that code like this is safe?

```jsx
// Escaped automatically
<p>
  {message.text}
</p>
```

**Well, that wasn’t always true either.** And that’s where `$$typeof` comes in.

---

React elements are plain objects by design:

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

While normally you create them with `React.createElement()`, it is not required. There are valid use cases for React to support plain element objects written like I just did above. Of course, you probably wouldn’t *want* to write them like this — but this [can be](https://github.com/facebook/react/pull/3583#issuecomment-90296667) useful for an optimizing compiler, passing UI elements between workers, or for decoupling JSX from the React package.

However, **if your server has a hole that lets the user store an arbitrary JSON object** while the client code expects a string, this could become a problem:

```jsx{2-10,15}
// Server could have a hole that lets user store JSON
let expectedTextButGotJSON = {
  type: 'div',
  props: {
    dangerouslySetInnerHTML: {
      __html: '/* put your exploit here */'
    },
  },
  // ...
};
let message = { text: expectedTextButGotJSON };

// Dangerous in React 0.13
<p>
  {message.text}
</p>
```

In that case, React 0.13 would be [vulnerable](http://danlec.com/blog/xss-via-a-spoofed-react-element) to an XSS attack. To clarify, again, **this attack depends on an existing server hole**. Still, React could do a better job of protecting people against it. And starting with React 0.14, it does.

The fix in React 0.14 was to [tag every React element with a Symbol](https://github.com/facebook/react/pull/4832):

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

This works because you can’t just put `Symbol`s in JSON. **So even if the server has a security hole and returns JSON instead of text, that JSON can’t include `Symbol.for('react.element')`.** React will check `element.$$typeof`, and will refuse to process the element if it’s missing or invalid.

The nice thing about using `Symbol.for()` specifically is that **Symbols are global between environments like iframes and workers.** So this fix doesn’t prevent passing trusted elements between different parts of the app even in more exotic conditions. Similarly, even if there are multiple copies of React on the page, they can still “agree” on the valid `$$typeof` value.

---

What about the browsers that [don’t support](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Symbol#Browser_compatibility) Symbols?

Alas, they don’t get this extra protection. React still includes the `$$typeof` field on the element for consistency, but it’s [set to a number](https://github.com/facebook/react/blob/8482cbe22d1a421b73db602e1f470c632b09f693/packages/shared/ReactSymbols.js#L14-L16) — `0xeac7`.

Why this number specifically? `0xeac7` kinda looks like “React”.
