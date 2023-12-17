---
title: "A Chain Reaction"
date: '2023-12-11'
spoiler: "The limits of my language mean the limits of my world."
---

I wrote a bit of JSX in my editor:

```js
<p className="text-2xl font-sans text-purple-400 dark:text-purple-500">
  Hello, <i>Alice</i>!
</p>
```

Right now, this information only exists on *my* device. But with a bit of luck, it will travel through time and space to *your* device, and appear on *your* screen.

```js eval
<p className="text-2xl font-sans text-purple-400 dark:text-purple-500">
  Hello, <i>Alice</i>!
</p>
```

The fact that this works is a marvel of engineering.

Deep inside of your browser, there are pieces of code that know how to display a paragraph or draw text in italics. These pieces of code are different between different browsers, and even between different versions of the same browser. Drawing to the screen is also done differently on different operating systems.

However, because these concepts have been given agreed-upon *names* ([`<p>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/p) for a paragraph, [`<i>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/i) for italics), I can refer to them without worrying how they *really* work on your device. I can't directly access their internal logic but I know which information I can pass to them (such as a CSS [`className`](https://developer.mozilla.org/en-US/docs/Web/API/Element/className)). Thanks to the web standards, I can be reasonably sure my greeting will appear as I intended.

Tags like `<p>` and `<i>` let us refer to the built-in browser concepts. However, names don't *have to* refer to something built-in. For example, I'm using CSS classes like [`text-2xl`](https://tailwindcss.com/docs/font-size) and [`font-sans`](https://tailwindcss.com/docs/font-family) to style my greeting. I didn't come up with those names myself--they come from a CSS library called Tailwind. I've included it on this page which lets me use any of the CSS class names it defines.

So why do we like giving names to things?

---

I wrote `<p>` and `<i>`, and my editor recognized those names. So did your browser. If you've done some web development, you probably recognized them too, and maybe even guessed what would appear on the screen by reading the markup. In that sense, names help us start with a bit of a shared understanding.

Fundamentally, computers execute relatively basic kinds of instructions--like adding or multiplying numbers, writing stuff to memory and reading from it, or communicating with external devices like a display. Merely showing a `<p>` on your screen could involve running hundreds of thousands of such instructions.

If you saw all the instructions your computer ran to display a `<p>` on the screen, you could hardly guess what they're doing. It's like trying to figure out which song is playing by analyzing all the atoms bouncing around the room. It would seem incomprehensible! You'd need to "zoom out" to see what's going on.

To describe a complex system, or to instruct a complex system what to do, it helps to separate its behavior into layers that build on each other's concepts.

This way, people working on screen drivers can focus on how to send the right colors to the right pixels. Then people working on text rendering can focus on how each character should turn into a bunch of pixels. And that lets people like me focus on picking just the right color for my "paragraphs" and "italics".

We like names because they let us forget what's behind them.

---

I've used many names that other people came up with. Some are built into the browsers, like `<p>` and `<i>`. Some are built into the tools I'm using, like `text-2xl` and `font-sans`. These may be my building blocks, but what am *I* building?

For example, what is this?

```js
<p className="text-2xl font-sans text-purple-400 dark:text-purple-500">
  Hello, <i>Alice</i>!
</p>
```

```js eval
<p className="text-2xl font-sans text-purple-400 dark:text-purple-500">
  Hello, <i>Alice</i>!
</p>
```

From your browser's perspective, this is a paragraph with certain CSS classes (which make it large and purple) and some text inside (part of it is in italics).

But from *my* perspective, it's *a greeting for Alice.* Although my greeting *happens* to be a paragraph, most of the time I want to think about it this way instead:

```js
<Greeting person={alice} />
```

Giving this concept a name provides me with some newfound flexibility. I can now display multiple `Greeting`s without copying and pasting their markup. I can pass different data to them. If I wanted to change how all greetings look and behave, I could do it in a single place. Turning `Greeting` into its own concept lets me adjust *"which greetings to display"* separately from *"what a greeting is"*.

However, I have also introduced a problem.

Now that I've given this concept a name, the "language" in my mind is different from the "language" that your browser speaks. Your browser knows about `<p>` and `<i>`, but it has never heard of a `<Greeting>`--that's my own concept. If I wanted your browser to understand what I mean, I'd have to "translate" this piece of markup to only use the concepts that your browser already knows.

I'd need to turn this:

```js
<Greeting person={alice} />
```

into this:

```js
<p className="text-2xl font-sans text-purple-400 dark:text-purple-500">
  Hello, <i>Alice</i>!
</p>
```

How would I go about that?

---

To name something, I need to define it.

For example, `alice` does not mean anything until I define `alice`:

```js
const alice = {
  firstName: 'Alice',
  birthYear: 1970
};
```

Now `alice` refers to that JavaScript object.

Similarly, I need to actually *define* what my concept of a `Greeting` means.

I will define a `Greeting` for any `person` as a paragraph showing "Hello, " followed by *that* person's first name in italics, plus an exclamation mark:

```js
function Greeting({ person }) {
  return (
    <p className="text-2xl font-sans text-purple-400 dark:text-purple-500">
      Hello, <i>{person.firstName}</i>!
    </p>
  );
}
```

Unlike `alice`, I defined `Greeting` as a function. This is because *a greeting* would have to be different for every person. `Greeting` is a piece of code--it performs a *transformation* or a *translation*. It *turns* some data into some UI.

That gives me an idea for what to do with this:

```js
<Greeting person={alice} />
```

Your browser wouldn't know what a `Greeting` is--that's my own concept. But now that I wrote a definition for that concept, I can *apply* this definition to "unpack" what I meant. You see, *a greeting for a person is actually a paragraph:*

```js {3-5}
function Greeting({ person }) {
  return (
    <p className="text-2xl font-sans text-purple-400 dark:text-purple-500">
      Hello, <i>{person.firstName}</i>!
    </p>
  );
}
```

Plugging the `alice`'s data into that definition, I end up with this final JSX:

```js
<p className="text-2xl font-sans text-purple-400 dark:text-purple-500">
  Hello, <i>Alice</i>!
</p>
```

At this point I only refer to the browser's own concepts. By substituting the `Greeting` with what I defined it to be, I have "translated" it for your browser.

```js eval
function Greeting({ person }) {
  return (
    <p className="text-2xl font-sans text-purple-400 dark:text-purple-500">
      Hello, <i>{person.firstName}</i>!
    </p>
  );
}

const alice = {
  firstName: 'Alice',
  birthYear: 1970
};

<Greeting person={alice} />
```

Now let's teach a computer to do the same thing.

---

Take a look at what JSX is made of.

```js
const originalJSX = <Greeting person={alice} />;
console.log(originalJSX.type);  // Greeting
console.log(originalJSX.props); // { person: { firstName: 'Alice', birthYear: 1970 } }
```

Under the hood, JSX constructs an object with the `type` property corresponding to the tag, and the `props` property corresponding to the JSX attributes.

You can think of `type` as being the "code" and `props` as being the "data". To get the result, you need to plug that data *into* that code like I've done earlier.

Here is a little function I wrote that does exactly that:

```js
function translateForBrowser(originalJSX) {
  const { type, props } = originalJSX;
  return type(props);
}
```

In this case, `type` will be `Greeting` and `props` will be `{ person: alice }`, so `translateForBrowser(<Greeting person={alice} />)` will return the result of calling `Greeting` with `{ person: alice }` as the argument.

Which, as you might recall from the previous section, would give me this:

```js
<p className="text-2xl font-sans text-purple-400 dark:text-purple-500">
  Hello, <i>Alice</i>!
</p>
```

And that's exactly what I wanted!

You can verify that feeding my original piece of JSX to `translateForBrowser` will produce the "browser JSX" that only refers to concepts like `<p>` and `<i>`.

```js {5-7}
const originalJSX = <Greeting person={alice} />;
console.log(originalJSX.type);  // Greeting
console.log(originalJSX.props); // { person: { firstName: 'Alice', birthYear: 1970 } }

const browserJSX = translateForBrowser(originalJSX);
console.log(browserJSX.type);  // 'p'
console.log(browserJSX.props); // { className: 'text-2xl font-sans text-purple-400 dark:text-purple-500', children: ['Hello', { type: 'i', props: { children: 'Alice' }, '!'] }
```

There are many things I could do with that "browser JSX". For example, I could turn it into an HTML string to be sent to the browser. I could also convert it into a sequence of instructions that update an already existing DOM node. For now, I won't be focusing on the different ways to use it. All that matters right now is that by the time I have the "browser JSX", there is nothing left to "translate".

It's as if my `<Greeting>` has dissolved, and `<p>` and `<i>` are the residue.

---

Let's try something a tiny bit more complex. Suppose I want to wrap my greeting inside a [`<details>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/details) tag so that it appears collapsed by default:

```js {1,3}
<details>
  <Greeting person={alice} />
</details>
```

The browser should display it like this (click "Details" to expand it!)

```js eval
function Greeting({ person }) {
  return (
    <p className="text-2xl font-sans text-purple-400 dark:text-purple-500">
      Hello, <i>{person.firstName}</i>!
    </p>
  );
}

const alice = {
  firstName: 'Alice',
  birthYear: 1970
};

<details className="pb-8">
  <Greeting person={alice} />
</details>
```

So now my task is to figure out how to turn this:

```js
<details>
  <Greeting person={alice} />
</details>
```

into this:

```js
<details>
  <p className="text-2xl font-sans text-purple-400 dark:text-purple-500">
    Hello, <i>Alice</i>!
  </p>
</details>
```

Let's see if `translateForBrowser` can already handle that.

```js {2-4,9}
const originalJSX = (
  <details>
    <Greeting person={alice} />
  </details>
);
console.log(originalJSX.type);  // 'details'
console.log(originalJSX.props); // { children: { type: Greeting, props: { person: alice } } }

const browserJSX = translateForBrowser(originalJSX);
```

You will get an error inside of the `translateForBrowser` call:

```js {3}
function translateForBrowser(originalJSX) {
  const { type, props } = originalJSX;
  return type(props); // 🔴 TypeError: type is not a function
}
```

What happened here? My `translateForBrowser` implementation assumed that `type`--that is, `originalJSX.type`--is always a function like `Greeting`.

However, notice that `originalJSX.type` is actually a *string* this time:

```js {6}
const originalJSX = (
  <details>
    <Greeting person={alice} />
  </details>
);
console.log(originalJSX.type);  // 'details'
console.log(originalJSX.props); // { children: { type: Greeting, props: { person: alice } } }
```

When you start a JSX tag with a lower case (like `<details>`), by convention it's assumed that you *want* a built-in tag rather than some function you defined.

Since built-in tags don't have any code associated with them (that code is somewhere inside your browser!), the `type` will be a string like `'details'`. How `<details>` work is opaque to my code--all I really know is its name.

Let's split the logic in two cases, and skip translating the built-ins for now:

```js {3,5-7}
function translateForBrowser(originalJSX) {
  const { type, props } = originalJSX;
  if (typeof type === 'function') {
    return type(props);
  } else if (typeof type === 'string') {
    return originalJSX;
  }
}
```

After this change, `translateForBrowser` will only attempt to call some function if the original JSX's `type` actually *is* a function like `Greeting`.

So that's the result I wanted, right?...

```js
<details>
  <Greeting person={alice} />
</details>
```

Wait. What I wanted is this:

```js
<details>
  <p className="text-2xl font-sans text-purple-400 dark:text-purple-500">
    Hello, <i>Alice</i>!
  </p>
</details>
```

In my translation process, I want to *skip over* the `<details>` tag because its implementation is opaque to me. I can't do anything useful with it--it is fully up to the browser. However, anything *inside* of it may still need to be translated!

Let's fix `translateForBrowser` to translate any built-in tag's children:

```js {6-12}
function translateForBrowser(originalJSX) {
  const { type, props } = originalJSX;
  if (typeof type === 'function') {
    return type(props);
  } else if (typeof type === 'string') {
    return {
      type,
      props: {
        ...props,
        children: translateForBrowser(props.children)
      }
    };
  }
}
```

With this change, when it meets an element like `<details>...</details>`, it will return another `<details>...</details>` tag, but the stuff *inside* of it would be translated with my function again--so the `Greeting` will be gone:

```js
<details>
  <p className="text-2xl font-sans text-purple-400 dark:text-purple-500">
    Hello, <i>Alice</i>!
  </p>
</details>
```

And *now* I am speaking the browser's "language" again:

```js eval
<details className="pb-8">
  <p className="text-2xl font-sans text-purple-400 dark:text-purple-500">
    Hello, <i>Alice</i>!
  </p>
</details>
```

The `Greeting` has been dissolved.

---

Now suppose that I try to define an `ExpandableGreeting`:

```js
function ExpandableGreeting({ person }) {
  return (
    <details>
      <Greeting person={person} />
    </details>
  );
}
```

Here is my new original JSX:

```js
<ExpandableGreeting person={alice} />
```

If I run it through `translateForBrowser`, I'll get this JSX in return:

```js
<details>
  <Greeting person={alice} />
</details>
```

But that's not what I wanted! It still has a `Greeting` in it, and we don't consider a piece of JSX "browser-ready" until *all* of my own concepts are gone.

This is a bug in my `translateForBrowser` function. When it calls a function like `ExpandableGreeting`, it will return its output, and not do anything else. But we need to keep on going! That returned JSX *also* needs to be translated.

Luckily, there is an easy way I can solve this. When I call a function like `ExpandableGreeting`, I can take the JSX it returned and translate *that* next:

```js {4-5}
function translateForBrowser(originalJSX) {
  const { type, props } = originalJSX;
  if (typeof type === 'function') {
    const returnedJSX = type(props);
    return translateForBrowser(returnedJSX);
  } else if (typeof type === 'string') {
    return {
      type,
      props: {
        ...props,
        children: translateForBrowser(props.children)
      }
    };
  }
}
```

I also need to stop the process when there's nothing left to translate, like if it receives `null` or a string. If it receives an array of things, I need to translate each of them. With these two fixes, `translateForBrowser` is complete:

```js {2-7}
function translateForBrowser(originalJSX) {
  if (originalJSX == null || typeof originalJSX !== 'object') {
    return originalJSX;
  }
  if (Array.isArray(originalJSX)) {
    return originalJSX.map(translateForBrowser);
  }
  const { type, props } = originalJSX;
  if (typeof type === 'function') {
    const returnedJSX = type(props);
    return translateForBrowser(returnedJSX);
  } else if (typeof type === 'string') {
    return {
      type,
      props: {
        ...props,
        children: translateForBrowser(props.children)
      }
    };
  }
}
```

Now, suppose that I start with this:

```js
<ExpandableGreeting person={alice} />
```

It will turn into this:

```js
<details>
  <Greeting person={alice} />
</details>
```

Which will turn into this:

```js
<details>
  <p className="text-2xl font-sans text-purple-400 dark:text-purple-500">
    Hello, <i>Alice</i>!
  </p>
</details>
```

And at that point, the process will stop.

---

Let's see how this works one more time, with a bit of extra depth.

I'll define `WelcomePage` like this:

```js
function WelcomePage() {
  return (
    <section>
      <h1 className="text-3xl font-sans pb-2">Welcome</h1>
      <ExpandableGreeting person={alice} />
      <ExpandableGreeting person={bob} />
      <ExpandableGreeting person={crystal} />
    </section>
  );
}
```

Now let's say I start the process with this original JSX:

```js
<WelcomePage />
```

Can you retrace the sequence of transformations in your head?

Let's do it step by step together.

First, imagine `WelcomePage` dissolving, leaving behind its output:

```js {1-6}
<section>
  <h1 className="text-3xl font-sans pb-2">Welcome</h1>
  <ExpandableGreeting person={alice} />
  <ExpandableGreeting person={bob} />
  <ExpandableGreeting person={crystal} />
</section>
```

Then imagine each `ExpandableGreeting` dissolving, leaving behind *its* output:

```js {3-11}
<section>
  <h1 className="text-3xl font-sans pb-2">Welcome</h1>
  <details>
    <Greeting person={alice} />
  </details>
  <details>
    <Greeting person={bob} />
  </details>
  <details>
    <Greeting person={crystal} />
  </details>
</section>
```

Then imagine each `Greeting` dissolving, leaving behind *its* output:

```js {4-6,9-11,14-16}
<section>
  <h1 className="text-3xl font-sans pb-2">Welcome</h1>
  <details>
    <p className="text-2xl font-sans text-purple-400 dark:text-purple-500">
      Hello, <i>Alice</i>!
    </p>
  </details>
  <details>
    <p className="text-2xl font-sans text-purple-400 dark:text-purple-500">
      Hello, <i>Bob</i>!
    </p>
  </details>
  <details>
    <p className="text-2xl font-sans text-purple-400 dark:text-purple-500">
      Hello, <i>Crystal</i>!
    </p>
  </details>
</section>
```

And now there is nothing left to "translate". All *my* concepts have dissolved.

```js eval
<section className="pb-8">
  <h1 className="text-3xl font-sans pb-2">Welcome</h1>
  <details>
    <p className="text-2xl font-sans text-purple-400 dark:text-purple-500">
      Hello, <i>Alice</i>!
    </p>
  </details>
  <details>
    <p className="text-2xl font-sans text-purple-400 dark:text-purple-500">
      Hello, <i>Bob</i>!
    </p>
  </details>
  <details>
    <p className="text-2xl font-sans text-purple-400 dark:text-purple-500">
      Hello, <i>Crystal</i>!
    </p>
  </details>
</section>
```

This feels like a chain reaction. You mix a bit of data and code, and it keeps transforming until there is no more code to run, and only the residue is left.

It would be nice if there was a library that could do this for us.

But wait, here's a question. These transformations have to happen *somewhere* on the way between your computer and mine. So where *do* they happen?

Do they happen on your computer?

Or do they happen on mine?
