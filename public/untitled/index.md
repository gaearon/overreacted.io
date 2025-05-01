---
title: Composable HTML
date: '2030-12-25'
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

Suppose it was the only piece of HTML you've ever seen in your life. If you had complete freedom, which features would you add to HTML, and in what order?

How would you evolve the *HTML itself?*

---

### Custom Tags

Personally, I'd like to start by adding a way to define our own custom HTML tags.

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

We'll *specify* that sending HTML involves unwrapping all of these custom tags:

```js {3}
<html>
  <body>
    <p>Hello, world</p>
  </body>
</html>
```

When there are no functions left to call, the HTML is ready to be sent.

Neat feature, huh?

Good thing we got it in early.

It might influence how we approach everything else.

---

### Props

Functions take parameters.

Let's support passing and receiving them:

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

Of course, there's no reason why those parameters have to be *strings*.

We might want to pass an object to `Greeting`:

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

Suppose we wanted to send this HTML. First, according to what we specified earlier, we'd have to replace all custom tags like `Greeting` with their output:

```js
<html>
  <body>
    <p style={{ color: 'purple' }}>Hello, Alice</p>
    <p style={{ color: 'pink' }}>Hello, Bob</p>
  </body>
</html>
```

But what should we do with the `style={{ color: '...' }}` objects? If we wanted to translate our "imaginary" HTML into "real" HTML, we'd stringify them:

```js {3,4}
<html>
  <body>
    <p style="color: purple">Hello, Alice</p>
    <p style="color: pink">Hello, Bob</p>
  </body>
</html>
```

But we don't *have to* turn our "imaginary" HTML into "real" HTML right away. We can stay in the imaginary land for a bit longer by turning *the entire thing* into JSON. Note how in this case, `style` can remain completely intact as an object within it:

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

We can easily turn this JSON into the "real" HTML later if we want. But it's a *strictly richer* representation because it preserves objects in a way that's easy to parse.

Going forward, we'll co-evolve these two representations.

---

### Async Tags

We're previously hardcoded some objects into our code:

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

Now let's read this stuff from the disk.

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

Actually, this looks a bit repetitive--let's have `Greeting` itself read from the disk.

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
