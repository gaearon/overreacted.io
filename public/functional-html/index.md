---
title: Functional HTML
date: '2025-05-02'
spoiler: Tags on both sides.
---

Here's a piece of HTML:

```js
<html>
  <body>
    <p>Hello, world</p>
  </body>
</html>
```

Imagine this was the only piece of HTML you've ever seen in your life. If you had complete freedom, which features would you add to HTML, and in what order?

Where would you start?

---

### Server Tags

Personally, I'd like to start by adding a way to define my own HTML tags.

It doesn't need to be complicated. We can just use JavaScript functions:

```js {3,7-9}
<html>
  <body>
    <Greeting />
  </body>
</html>

function Greeting() {
  return <p>Hello, world</p>
}
```

To make this work, let's specify that when the HTML is sent over the network--that is, *serialized*--the server must replace such tags with whatever they return:

```js {3}
<html>
  <body>
    <p>Hello, world</p>
  </body>
</html>
```

When there are no tag functions left to call, the HTML is ready to be sent.

Neat feature, huh?

Good thing we got it in early.

It might influence how we approach everything else.

---

### Attributes

Let's support passing attributes to tags and interpolating values into the markup.

```js {3-4,9}
<html>
  <body>
    <Greeting name="Alice" />
    <Greeting name="Bob" />
  </body>
</html>

function Greeting({ name }) {
  return <p>Hello, {name}</p>
}
```

Of course, there's no reason why those arguments have to be *strings*.

It might be nice to pass an object to `Greeting` instead:

```js {3-4,10-12}
<html>
  <body>
    <Greeting person={{ name: 'Alice', favoriteColor: 'purple' }} />
    <Greeting person={{ name: 'Bob', favoriteColor: 'pink' }} />
  </body>
</html>

function Greeting({ person }) {
  return (
    <p style={{ color: person.favoriteColor }}>
      Hello, {person.name}
    </p>
  );
}
```

Objects let us group related stuff together.

According to [our specification so far](#server-tags), *serializing* the HTML above would produce:

```js
<html>
  <body>
    <p style={{ color: 'purple' }}>Hello, Alice</p>
    <p style={{ color: 'pink' }}>Hello, Bob</p>
  </body>
</html>
```

Still, we haven't fully gotten rid of the objects.

Is sending those `{ color: '...' }` objects okay?

What should we do with the objects?

---

### Objects

The "real" HTML we know and love has no first-class notion of objects. If we wanted to output some "real" HTML, we'd have to format `style` as a string:

```js {3,4}
<html>
  <body>
    <p style="color: purple">Hello, Alice</p>
    <p style="color: pink">Hello, Bob</p>
  </body>
</html>
```

But if we're reimagining HTML, we don't have to abide by the same limitations. In fact, let's specify that a server must *serialize* our imaginary HTML into a JSON tree:

```js {6,10}
["html", {
  children: ["body", {
    children: [
      ["p", {
        children: "Hello, Alice",
        style: { color: "purple" }
      }],
      ["p", {
        children: "Hello, Bob",
        style: { color: "pink" }
      }]
    ]
  }]
}]
```

Wait, what?

This strange JSON representation isn't particularly interesting or useful yet. But going forward, we'll consider this representation to be our primary output format (rather than the "real" HTML). This format is interesting to us because it is *strictly richer and more expressive* than the "real" HTML. It can express HTML *and* objects. This lets us keep the `style` objects--*or any objects we might want to send!*--intact.

Re-read it and convince yourself that we can easily turn it into "real" HTML later.

If we want to.

---

### Async Server Tags

We're previously hardcoded some objects into our HTML:

```js {3-4}
<html>
  <body>
    <Greeting person={{ name: 'Alice', favoriteColor: 'purple' }} />
    <Greeting person={{ name: 'Bob', favoriteColor: 'pink' }} />
  </body>
</html>

function Greeting({ person }) {
  // ...
}
```

But we could grab them from somewhere else.

Let's read the data from the filesystem:

```js {3-4}
<html>
  <body>
    <Greeting person={JSON.parse(await readFile('./alice123.json', 'utf8'))} />
    <Greeting person={JSON.parse(await readFile('./bob456.json', 'utf8'))} />
  </body>
</html>

function Greeting({ person }) {
  // ...
}
```

Note the `await` in there. Reading data tends to be asynchronous!

Actually, this looks a bit repetitive--let's move that `await` *into* the `Greeting`:

```js {3-4,8-10}
<html>
  <body>
    <Greeting username="alice123" />
    <Greeting username="bob456" />
  </body>
</html>

async function Greeting({ username }) {
  const filename = `./${username.replace(/\W/g, '')}.json`;
  const person = JSON.parse(await readFile(filename, 'utf8'));
  return (
    <p style={{ color: person.favoriteColor }}>
      Hello, {person.name}
    </p>
  );
}
```

We'll have to slightly amend our specification. Now, whenever a server serializes our imaginary HTML, it'll have to `await` any `async` function tags it encounters.

The end result is still the same JSON:

```js
["html", {
  children: ["body", {
    children: [
      ["p", {
        children: "Hello, Alice",
        style: { color: "purple" }
      }],
      ["p", {
        children: "Hello, Bob",
        style: { color: "pink" }
      }]
    ]
  }]
}]
```

And we can still then turn that JSON into "real" HTML *if we want to:*

```js
<html>
  <body>
    <p style="color: purple">Hello, Alice</p>
    <p style="color: pink">Hello, Bob</p>
  </body>
</html>
```

Still, notice how our "imaginary HTML" allows us to [speak the user's language](/impossible-components/#in-conclusion):

```js {3-4,8}
<html>
  <body>
    <Greeting username="alice123" />
    <Greeting username="bob456" />
  </body>
</html>

async function Greeting({ username }) {
  // ...
}
```

It's a *greeting for a specific username*--not just a "paragraph".

Where it loads its data or what it outputs is `Greeting`'s implementation detail.

Cool beans!

---

### Events

What do we do when we encounter a function tag?

```js {3}
<html>
  <body>
    <Greeting />
  </body>
</html>

function Greeting() {
  return <p>Hello, world</p>
}
```

We call that function and substitute the tag with the output of the function.

```js {3}
<html>
  <body>
    <p>Hello, world</p>
  </body>
</html>
```

This lets us get rid of all the functions *while sending our HTML* so that we don't have to think about how to transfer them over the network.

But what if we don't want a function to run *now?*

What if we want it to run *later?*

For example, *on click?*

```js
<button>
  Like
</button>
```

We'd need to somehow pass a function *over the network.*

We could pass a piece of code as a string:

```js
<button onClick="addLike()">
  Like
</button>
```

But that's not very maintainable, is it?

Suppose we want to write `onLike` as a proper function:

```js {5-7}
<button onClick={onLike}>
  Like
</button>

function onLike() {
  addLike();
}
```

However, without the string quotes around the code it's getting ambiguous. Does `onLike` execute in the same environment as our HTML--that is, on the server? Can I call `writeFile` there? Or does it execute in the browser? Can I call `alert`?

This ambiguity is also reflected in the fact that `JSON.stringify` will omit it:

```js
['button', {
  children: 'Like'
  // No onClick here :(
}]
```

By default, `JSON.stringify` doesn't know what to do with functions. (In fact, let's amend our specification to throw an error if our server encounters a function in any position other than a tag. That will force us to make an explicit choice.)

So what do we *want* it to do?

---

### Client References

Suppose we want to send the `onClick` code to the client as a `<script>` tag.

For that to work, we'd need to know which `<script>` tag to send and which function inside of that file is the click handler. We could encode it like this:

```js {3}
['button', {
  children: 'Like',
  onClick: '/src/bundle.js#onLike'
}]
```

Let's call `'/src/bundle.js#onLike'` a *Client Reference*--a way to refer to a piece of client code from the server; a client function's "address" that uniquely locates it.

If browsers could understand this format directly, they would simply load the corresponding `<script>` tag and attach the `onClick` handler. But even if they don't, the JSON above has enough information to be turned into "real" HTML:

```js
<button id="btn">Like</button>
<script src="/src/bundle.js"></script>
<script>btn.onclick = onLike;</script>
```

How would we want to *write* this code though?

Clearly, we'd want to write `onLike` as a proper function:

```js {5-7}
<button onClick={onLike}>
  Like
</button>

function onLike() {
  addLike();
}
```

And yet this doesn't make sense; we can't mix server and client code in the same file. It's too confusing. What if we want to `import` something that only works in one environment? How do we know which dependencies get executed where?

Let's split our HTML in half. The first half starts on the server:

<Server>

```js
<button onClick={onLike}>
  Like
</button>
```

</Server>

The second half is the code we want to send to the client:

<Client>

```js
function onLike() {
  addLike();
}
```

</Client>

Now we need some syntax that actually "makes the cut" between the two halves. We need some syntax that says: "when you import this module, you don't get the real thing--you just get a Client Reference to it". Luckily [we've already invented it:](/what-does-use-client-do/#use-client)

<Server>

```js {1,}
import { onLike } from './onLike';

<button onClick={onLike}>
  Like
</button>
```

</Server>

<Client glued>

```js {1,3}
'use client'; // Serialize me as a Client Reference

export function onLike() {
  alert('You liked this.');
}
```

</Client>

The `'use client'` directive says: "when you import me, you don't get the real thing; you only get an address of that thing, something that lets you *refer* to it."

```js {3}
['button', {
  children: 'Like',
  onClick: '/src/bundle.js#onLike'
}]
```

There are different ways this JSON could be interpreted later. We could turn it into a piece of `<button>` HTML with a `<script>` that attaches that logic. Or we could skip generating HTML and do `document.createElement('button')` on the client, attaching the same `onClick` handler to that client-generated button.

The important part is that now we have *first-class syntax* for sending some code to the client. In our imaginary evolution of HTML, the `<script>` tag *is unnecessary.* Instead, `'use client'` expresses `<script>` as a part of the module system.

---

### Server References

Sending a `<script>` tag is one way to serialize a function.

But it's not the only way.

Another common pattern is to keep `onLike` on the server and make it *callable* by the client--for example, via a POST `fetch()` call. We could encode it like this:

```js {3}
['button', {
  children: 'Like',
  onClick: '/api?fn=onLike'
}]
```

Let's call `'/api?fn=onLike'` a *Server Reference*--a way to refer to a piece of server code from the client; a server function's "address" that uniquely locates it.

If we had to translate this to "real" HTML, we'd have a few options. We could attach an `onclick` to our `<button>` that does `fetch('/api?fn=onLike')`. If the Server Reference is passed to a "real" HTML `<form action>` or `<button formAction>` rather than `onClick`, we could go even further and also add `<form action="/api?fn=onLike">` so that it works even before the JavaScript loads. We could also forgo HTML generation entirely and do everything from the client.

Okay, but how would we want to *write* this code?

In this case, there's no *need* to split the code into files.

Both pieces run on the server--there is no ambiguity here:

```js
<button onClick={onLike}>
  Like
</button>

async function onLike() {
  const likes = Number(await readFile('./likes.txt', 'utf8'));
  await writeFile('./likes.txt', likes + 1, 'utf8');
}
```

Still, we want to somehow *opt into* exposing a function as an API endpoint.

Luckily, we've [already invented](/what-does-use-client-do/#use-server) a way to do that as well:

```js {6}
<button onClick={onLike}>
  Like
</button>

async function onLike() {
  'use server'; // Serialize me as a Server Reference
  const likes = Number(await readFile('./likes.txt', 'utf8'));
  await writeFile('./likes.txt', likes + 1, 'utf8');
}
```

The `'use server'` directive says: "when you try to serialize this function, turn it into a Server Reference--an address that the client can use to call this function."

```js {3}
['button', {
  children: 'Like',
  onClick: '/api?fn=onLike'
}]
```

Then it could be either turned into HTML (in some cases, even with progressive enhancement), or it could be interperted by purely client-side JavaScript code.

The important part is we now have a *first-class* way to pass server functions to the client. In other words, we've made API calls themselves *a part of our module system*.

---

### Client Tags

So far, we've extended HTML with a few novel primitives:

- [Server Tags](#server-tags) that run during serialization.
- [Objects](#objects) as first-class values (and a JSON format to carry them).
- [Client References](#client-references) that let the server refer to the client (a [first-class `<script>`](/what-does-use-client-do/#use-client)).
- [Server References](#server-references) that let the client refer to the server (a [first-class `fetch`](/what-does-use-client-do/#use-server)).

There's an interesting consequence that automatically "falls out" of this design.

Suppose you import a Client Reference and use it *as a tag:*

<Server>

```js {3}
import { LikeButton } from './LikeButton';

<LikeButton color="purple" />
```

</Server>

<Client glued>

```js
'use client'; // Serialize me as a Client Reference

export function LikeButton({ color }) {
  function onLike() {
    alert('You liked this.');
  }

  return (
    <button onClick={onLike} style={{ color }}>
      Like
    </button>
  );
}
```

</Client>

By the rules we've established earlier, during serialization, the server must run all functions that it encounters as tags. However, a Client Reference is not a function:

```js {1}
['/src/bundle.js#LikeButton', {
  color: 'purple'
}]
```

Therefore, the server that serializes our JSON does not need to do anything with it. In other words, this lets us defer execution of some tags until some later time.

Let's call such tags Client Tags.

There's a few different ways we could express this JSON as "real" HTML. We could decide to render our application on the client-side *only*, in which case all we'll want is to emit a `<script>` tag for the bundle and another inline `<script>` with data:

```js
<script src="bundle.js"></script>
<script>
  const output = LikeButton({ color: 'purple' });
  render(document.body, output);
</script>
```

Or we *could* prerender the Client Tags to the "real" HTML for a faster first paint:

```js {1-4}
<!-- Optional: Initial HTML -->
<button>
  Like
</button>

<!-- Interactivity -->
<script src="bundle.js"></script>
<script>
  const output = LikeButton({ color: 'purple' });
  render(document.body, output);
</script>
```

We could *also* load their code on the client without doing *any* HTML generation.

No matter which strategy we choose, all the necessary information is in the JSON:

```js
['/src/bundle.js#LikeButton', {
  color: 'purple'
}]
```

---

### Full-Stack Tags

This means that now we have the ability to compose our own tags on both sides:

<Server>

```js
import { LikeButton } from './LikeButton';

<>
  <PersonalizedLikeButton username="alice123" />
  <PersonalizedLikeButton username="bob456" />
</>

async function PersonalizedLikeButton({ username }) {
  const filename = `./${username.replace(/\W/g, '')}.txt`;
  const color = await readFile(filename);
  return <LikeButton color={color} />;
}
```

</Server>

<Client glued>

```js
'use client';

export function LikeButton({ color }) {
  function onLike() {
    alert('You liked this.');
  }

  return (
    <button onClick={onLike} style={{ color }}>
      Like
    </button>
  );
}
```

</Client>

During serialization, the Server Tags like `PersonalizedLikeButton` will run, leaving behind only their output. During deserialization, the Client Tags like `LikeButton` will run, leaving behind HTML, DOM, or whatever else you like.

This lets us create [impossible components](/impossible-components/#a-sortable-list-of-previews)--full-stack abstractions that span both sides of the wire and that fully encapsulate their own state and data loading logic.

It also lets us compose and combine client-side and server-side behaviors. For example, we could move a *part* of the `onLike` logic to the server as `addLike`:

<Server>

```js {5-8}
'use server';

import { readFile, writeFile } from 'fs/promises';

export async function addLike() {
  const likes = Number(await readFile('./likes.txt', 'utf8'));
  await writeFile('./likes.txt', likes + 1, 'utf8');
}
```

</Server>

<Client glued>

```js {7-8}
'use client';

import { addLike } from './actions';

export function LikeButton({ color }) {
  async function onLike() {
    await addLike();
    alert('You liked this.');
  }

  return (
    <button onClick={onLike} style={{ color }}>
      Like
    </button>
  );
}
```

</Client>

Now `LikeButton` has a piece of the backend directly "attached" to it.

We never *mix* client and server code in a single file, but they can *refer to* each other thanks to the [`'use client'`](/what-does-use-client-do/#use-client) and [`'use server'`](/what-does-use-client-do/#use-server) directives. This lets us express the inherent coupling between the server and the client in a typed and modular way instead of relying on [stringly](https://www.hanselman.com/blog/stringly-typed-vs-strongly-typed) conventions like `<script>` tags and API routes.

---

### Refreshing

For the initial render, generating full HTML is beneficial (although not required). This ensures that we can display something to the user while the `<script>` tags for the Client References on the page are being loaded. In fact, prerendering to HTML also lets us eagerly send hints to *start loading* those `<script>` tags early.

But since our primary output format is JSON rather than HTML, we can also write a `<Router>` Client Tag that intercepts navigations, fetches the JSON output for the next screen, and gracefully applies it to the existing DOM. All of the actual data fetching will happen *in a single roundtrip* since all Server Tags execute during the serialization. On the client, we'll have the freedom to "apply" that JSON gracefully and without destroying any client-side state. That JSON will include the fresh attributes for all Client Tags--which can accept any objects and not just strings.

We could later implement more granular refetching by nesting `<Router>` Client Tags and having each of them be responsible for a route segment. Under the hood, the `Router` Client Tags could use Server References to fetch the fresh JSON trees.

---

### Streaming

A significant downside of the proposed approach is that rendering the entire page is blocked until all of the [Async Server Tags](#async-server-tags) resolve. Let's sketch out a fix for this.

Suppose we're rendering multiple asynchronous tags:

```js
function Page() {
  return (
    <Layout>
      <PostContent />
      <PostComments />
    </Layout>
  );
}

function Layout({ children }) {
  return (
    <article>
      <header>Welcome to Overreacted</header>
      {children}
      <footer>Thanks for reading</footer>
    </article>
  );
}

async function PostContent() {
  // ...
}

async function PostComments() {
  // ...
}
```

We can specify that a server should serialize our tags to JSON *outside-in* without blocking--but leave "holes" whenever a part of the content is not yet available:

```js {6,7}
["article", {
  children: [
    ["header", {
      children: 'Welcome to Overreacted'
    }],
    /* HOLE_1 */,
    /* HOLE_2 */,
    ["footer", {
      children: 'Thanks for reading'
    }]
  ]
}]
```

We could then *stream in* the contents of those holes as they resolve on the server:

```js {13,14}
["article", {
  children: [
    ["header", {
      children: 'Welcome to Overreacted'
    }],
    /* HOLE_1 */,
    /* HOLE_2 */,
    ["footer", {
      children: 'Thanks for reading'
    }]
  ]
}]
/* HOLE_1: */["article", { children: [["p", "Here is a piece of HTML:", ...]]}]
/* HOLE_2: */["ul", { className: "comments", children: [["li", { children: "Server rendering sucks, you should only do things on the client" }], ["li", { children: "Client rendering sucks, you should only do things on the server" }]] }]
```

We could even reuse the same mechanism to [serialize Promises.](https://twofoldframework.com/blog/you-can-serialize-a-promise-in-react) (Wait, what?)

One thing we'd like to avoid is "popping" UX. Although it's good to make the *computation* "as streaming as possible", we want each loading state *perceived by the user* to be intentional. In fact, that's a feature that "real" HTML is missing--since there is no primitive for declarative loading states, the page "jumps" as it loads.

We could imagine that our version of HTML has a primitive for this.

Let's call it a `<Placeholder>`:

```js {5,7}
function Page() {
  return (
    <Layout>
      <PostContent />
      <Placeholder fallback={<CommentsGlimmer />}>
        <PostComments />
      </Placeholder>
    </Layout>
  );
}

function CommentsGlimmer() {
  return <div className="glimmer" />;
}
```

It would not directly affect serialization--you'd see it as a Client Tag in the JSON:

```js {7-10}
["article", {
  children: [
    ["header", {
      children: 'Welcome to Overreacted'
    }],
    /* HOLE_1 */,
    ["Placeholder", {
      fallback: ["div", { className: "glimmer" }],
      children: /* HOLE_2 */
    }],
    ["footer", {
      children: 'Thanks for reading'
    }]
  ]
}]
/* HOLE_1: */["article", { children: [["p", "Here is a piece of HTML:", ...]]}]
/* HOLE_2: */["ul", { className: "comments", children: [["li", { children: "Server rendering sucks, you should only do things on the client" }], ["li", { children: "Client rendering sucks, you should only do things on the server" }]] }]
```

But this means that whoever does the deserialization can decide whether to wait for the "hole" to finish loading or to display the `fallback`.

For example, if we're generating 100% static HTML for a blog, it might make sense to wait for all the "holes" to load first. There is no benefit to displaying a fallback.

On the other hand, if we're generating a page on the fly from a server, we can choose to emit the HTML from the `fallback` immediately, and then emit the rest of the HTML in an invisible tag with an inline `<script>` that attaches it in the right place. This would let the user see a sequence of *intentional* loading states:

1. A blank page while initial HTML shell is loading.
2. A shell together with the header, the footer, *and the post content*.
3. The comments.

It's important that we retain the ability to let some pieces, like post content, *block* the screen. For a blog post page, the contents of the post is essential, and displaying a glimmer is worse than displaying nothing at all. But if we *wanted* to show a glimmer for it, we could simply move the `<Placeholder>` outside it:

```js {4-5,7}
function Page() {
  return (
    <Layout>
      <Placeholder fallback={<PostGlimmer />}>
        <PostContent />
        <PostComments />
      </Placeholder>
    </Layout>
  );
}
```

Or we could have nested placeholders:

```js {4,6,8,9}
function Page() {
  return (
    <Layout>
      <Placeholder fallback={<PostGlimmer />}>
        <PostContent />
        <Placeholder fallback={<CommentsGlimmer />}>
          <PostComments />
        </Placeholder>
      </Placeholder>
    </Layout>
  );
}
```

We can think of `<Placeholder>` as a sort of a `try / catch` for loading states. Crucially, it doesn't impose any particular semantics on the serialization so the client can choose to interpret it as it wishes--for example, it could throttle the reveal of nested fallbacks to reduce jumps, or wait for the entire thing to buffer.

(Generating HTML is also a "client" in this architecture even if it physically runs on a server. A "client" is anything that interprets our JSON-like output stream.)

---

### Caching

Unlike "real" HTML, the JSON structure described above is 100% composable. For example, if you want to render a Client `<Counter />` tag three times but pass different data to each of the `<Counter />`s, it is easy to express in JSON:

```js
["div", {
  children: [
    ["/src/chunk123.js#Counter", { initialCount: 0, color: "pink" }],
    ["/src/chunk123.js#Counter", { initialCount: 10, color: "purple" }],
    ["/src/chunk123.js#Counter", { initialCount: 100, color: "blue" }],
  ]
}]
```

If you naïvely took a `<script>` tag that does the same and repeated it three times, it wouldn't exactly make sense--you'd repeat scripts and introduce clashes:

```js
<button id="counter">0</button>
<script src="/src/chunk123.js"></script>
<script>Counter('#counter', { initialCount: 0, color: "pink" })</script>
<button id="counter">10</button>
<script src="/src/chunk123.js"></script>
<script>Counter('#counter', { initialCount: 10, color: "purple" })</script>
<button id="counter">100</button>
<script src="/src/chunk123.js"></script>
<script>Counter('#counter', { initialCount: 100, color: "blue" })</script>
```

It's *possible* to solve, but it's much easier to do that at the very end of the process.

Let's consider another example that needs more complex data--like [a sortable list of posts from my blog](/impossible-components/#final-code). Here is the `<SortablePostList>` Server Tag itself:

```js eval
<SortablePostList />
```

And here is the JSON after all the Server Tags inside have been computed:

```js
["div", {
  className: "mb-8 flex h-72 flex-col gap-2 overflow-scroll font-sans",
  children: ["/chunk123.js#SortableList", {
    items: [
      ["/chunk456.js#ExpandingSection", {
        extraContent: ["p", {children: "I wrote a bit of JSX in my editor: [...]"}],
        children: [
          ["a", { href: "/a-chain-reaction", children: "A Chain Reaction" }],
          ["i", { children: "2,452 words" }]
        ]
      }],
      ["/chunk456.js#ExpandingSection", {
        extraContent: ["p", {children: "You wrote a few components with Hooks [...]"}],
        children: [
          ["a", { href: "/a-complete-guide-to-useeffect", children: "A Complete Guide to useEfffct" }],
          ["i", { children: "9,913 words" }]
        ]
      }],
      /* ... */
    ]
  }]
}]
```

Note that this JSON *does not only describe the initial static output--it describes the whole thing.*
 It says that the client-side code for the interactive `SortableList` and `ExpandingSection` needs to be downloaded, and *where* to download that code.

It can be *turned* into "real" HTML--either as SPA-only `<script>` tags or a as full initial HTML render. But it is a *much more structured* description than "real" HTML.

That makes this format particularly great for server-side caching. In the earlier years of server rendering, it was common to cache HTML "partials" in cases where some parts of the screen can be reused between the requests. In particular, it's nice when you can cache partials with *holes*--static shells with dynamic content. Unfortunately, dynamic HTML with `<script>` tags and data makes this kind of caching very difficult to pull off because you can't "unscramble" data from code.

However, the structure above preserves a clear separation between data and code. It says--"here's are the tags, and here is the rich information that needs to be passed to them". Static and dynamic content is expressed in the same exact way. This means that such pieces of JSON are independently cacheable and can have "holes" in them that allow more often-changing content to be inserted later.

---

### In Conclusion

In this article, we've again reinvented React Server Components from scratch. We're previously seen that they can be thought of as:

- [A componentized API layer](/jsx-over-the-wire/#part-1-json-as-components)
- [An evolution of SDUI pattern from top native apps](/jsx-over-the-wire/#sdui)
- [A way to create full-stack abstractions](/impossible-components/)
- [A language-level `<script>` and `fetch()` ](/what-does-use-client-do/)

In this article, I've tried to show that they can also be thought of a functional, programmable, and composable version of HTML--with tags on both sides.
