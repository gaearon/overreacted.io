---
title: Imaginary HTML
date: '2025-05-01'
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

---

### Tags

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

To make this work, let's say that whenever the HTML is sent over the network--that is, *serialized*--the server must replace those tags with the output they return:

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

We might want to pass an object to `Greeting` instead:

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

According to the [earlier rule](#tags), *serializing* the HTML above would produce:

```js
<html>
  <body>
    <p style={{ color: 'purple' }}>Hello, Alice</p>
    <p style={{ color: 'pink' }}>Hello, Bob</p>
  </body>
</html>
```

Still, we haven't gotten rid of all objects.

What should we do with those `{ color: '...' }` objects?

---

### Objects

The "real" HTML we know and love has no first-class notion of objects. If we wanted to output some "real" HTML, we'd have to turn `style` into a string:

```js {3,4}
<html>
  <body>
    <p style="color: purple">Hello, Alice</p>
    <p style="color: pink">Hello, Bob</p>
  </body>
</html>
```

But if we're reimagining HTML, we don't have to abide by the same limitations. For example, we could decide that our imaginary HTML *serializes into* JSON:

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

This lets us keep the `style` objects--*or any objects we might want to send*--intact.

This strange JSON representation isn't particularly interesting or useful yet. But going forward, we'll consider this representation as our primary output format. We can always generate "real" HTML *from* this representation, but not vice versa.

---

### Async Tags

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

Actually, this looks a bit repetitive--let's move the `readFile` *into* the `Greeting`:

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

We'll have to slightly amend our specification to allow this. To *send* HTML, we'll have to *wait* for all custom tags to resolve (and to be replaced with their output).

The end result is still the same:

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

(If we wanted, we could then convert this JSON into the "real" HTML:)

```js
<html>
  <body>
    <p style="color: purple">Hello, Alice</p>
    <p style="color: pink">Hello, Bob</p>
  </body>
</html>
```

But note how our original "imaginary HTML" allowed us to *name* this concept:

```js {3-4}
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

It allowed us to create a [self-contained abstraction](/impossible-components/#local-state-local-data) that loads its own data.

Cool beans!

---

### Event Handlers
