---
title: Impossible Components
date: '2025-04-22'
spoiler: Composing across the stack.
bluesky: https://bsky.app/profile/danabra.mov/post/3lnftttyxwc2n
---

Suppose I want to greet you in *my* favorite color.

This would require combining information from two different computers. Your name would be coming from *your* computer. The color would be on *my* computer.

You could imagine a component that does this:

```js {5-6}
import { useState } from 'react';
import { readFile } from 'fs/promises';

async function ImpossibleGreeting() {
  const [yourName, setYourName] = useState('Alice');
  const myColor = await readFile('./color.txt', 'utf8');
  return (
    <>
      <input placeholder="What's your name?"
        value={yourName}
        onChange={e => setYourName(e.target.value)}
      />
      <p style={{ color: myColor }}>
        Hello, {yourName}!
      </p>
    </>
  );
}
```

But this component is impossible. The `readFile` function can only execute on *my* computer. The `useState` will only have a useful value on *your* computer. We can't do both at once without giving up the predictable top-down execution flow.

Or can we?

---

### Splitting a Component

Let's split this component in two parts.

The *first* part will read the file, which only makes sense on *my* computer. It is responsible for loading data so we're going to call this part `GreetingBackend`:

<Server>

```js {4}
import { readFile } from 'fs/promises';
import { GreetingFrontend } from './client';

async function GreetingBackend() {
  const myColor = await readFile('./color.txt', 'utf8');
  return <GreetingFrontend color={myColor} />;
}
```

</Server>

It will read my chosen color and pass it as the `color` prop to the second part, which is responsible for interactivity. We're going to call it `GreetingFrontend`:

<Client>

```js {5}
'use client';

import { useState } from 'react';

export function GreetingFrontend({ color }) {
  const [yourName, setYourName] = useState('Alice');
  return (
    <>
      <input placeholder="What's your name?"
        value={yourName}
        onChange={e => setYourName(e.target.value)}
      />
      <p style={{ color }}>
        Hello, {yourName}!
      </p>
    </>
  );
}
```

</Client>

That second part receives that `color`, and returns an interactive form. Edit "Alice" to say your name and notice how the greeting updates as you're typing:

```js eval
<div className="mx-2">
  <GreetingBackend />
</div>
```

(If your name *is* Alice, you may leave it as is.)

**Notice that *the backend runs first.* Our mental model here isn't "frontend loads data from the backend". Rather, it's "the backend passes data *to* the frontend".**

This is React's top-down data flow, but including the backend *into* the flow. The backend is the source of truth for the data--so it [must be](https://react.dev/learn/thinking-in-react#step-4-identify-where-your-state-should-live) the frontend's *parent*.

Have another look at these two parts and see how the data flows *down:*

<Server>

```js
import { readFile } from 'fs/promises';
import { GreetingFrontend } from './client';

async function GreetingBackend() {
  const myColor = await readFile('./color.txt', 'utf8');
  return <GreetingFrontend color={myColor} />;
}
```

</Server>

<Client glued>

```js
'use client';

import { useState } from 'react';

export function GreetingFrontend({ color }) {
  const [yourName, setYourName] = useState('Alice');
  return (
    <>
      <input placeholder="What's your name?"
        value={yourName}
        onChange={e => setYourName(e.target.value)}
      />
      <p style={{ color }}>
        Hello, {yourName}!
      </p>
    </>
  );
}
```

</Client>

From the backend to the frontend. From my computer to yours.

Together, they form a single, *encapsulated* abstraction spanning both worlds:

```js
<GreetingBackend />
```

```js eval
<div className="mx-2">
  <GreetingBackend />
</div>
```


Together, they form an impossible component.

*(Here and below, the `'use client'` syntax hints that we'll be learning React Server Components. You can try them in [Next](https://nextjs.org/)--or in [Parcel](https://parceljs.org/recipes/rsc/) if you don't want a framework.)*

---

### Local State, Local Data

The beautiful thing about this pattern is that I can refer to the *entirety* of this functionality--*its both sides*--by writing a JSX tag just for the "backend" part. Since the backend *renders* the frontend, rendering the backend gives you both.

To demonstrate this, let's render `<GreetingBackend>` multiple times:

```js
<>
  <GreetingBackend />
  <GreetingBackend />
  <GreetingBackend />
</>
```

```js eval
<div className="mx-2">
  <GreetingBackend />
  <GreetingBackend />
  <GreetingBackend />
</div>
```

Verify that you can edit each input independently.

Naturally, the `GreetingFrontend` *state* inside of each `GreetingBackend` is isolated. However, how each `GreetingBackend` *loads its data* is also isolated.

To demonstrate this, let's edit `GreetingBackend` to take a `colorFile` prop:

<Server>

```js {4-5}
import { readFile } from 'fs/promises';
import { GreetingFrontend } from './client';

async function GreetingBackend({ colorFile }) {
  const myColor = await readFile(colorFile, 'utf8');
  return <GreetingFrontend color={myColor} />;
}
```

</Server>

Next, let's add `Welcome` that renders `GreetingBackend` for different color files:

<Server>

```js {4-12}
import { readFile } from 'fs/promises';
import { GreetingFrontend } from './client';

function Welcome() {
  return (
    <>
      <GreetingBackend colorFile="./color1.txt" />
      <GreetingBackend colorFile="./color2.txt" />
      <GreetingBackend colorFile="./color3.txt" />
    </>
  );
}

async function GreetingBackend({ colorFile }) {
  const myColor = await readFile(colorFile, 'utf8');
  return <GreetingFrontend color={myColor} />;
}
```

</Server>

Let's see what happens:

```js
<Welcome />
```

Each greeting will read its own file. And each input will be independently editable.

```js eval
<div className="mx-2">
  <Welcome />
</div>
```

This might remind you of composing "server partials" in Rails or Django, except that instead of HTML you're rendering fully interactive React component trees.

Now you can see the whole deal:

1. **Each `GreetingBackend` *knows* how to load its own data.** That logic is encapsulated in `GreetingBackend`--you didn't need to coordinate them.
2. **Each `GreetingFrontend` *knows* how to manage its own state.** That logic is encapsulated in `GreetingFrontend`--again, no manual coordination.
3. **Each `GreetingBackend` renders a `GreetingFrontend`.** This lets you think of `GreetingBackend` as a self-contained unit that does *both*--an impossible component. It's a piece of the backend *with its own* piece of the frontend.

Of course, you can substitute "reading files" with "querying an ORM", "talking to an LLM with a secret API key", "hitting an internal microservice", or anything that requires backend-only resources. Likewise, an "input" represents any interactivity. The point is that you can compose both sides into self-contained components.

Let's render `Welcome` again:

```js
<Welcome />
```

```js eval
<div className="mx-2">
  <Welcome />
</div>
```

Notice how we didn't need to plumb any data or state into it.

The `<Welcome />` tag is completely self-contained!

And because the backend parts always *run first*, when you load this page, from the frontend's perspective, the data is "already there". There are no flashes of "loading data from the backend"--the backend *has already passed* the data to the frontend.

Local state.

Local data.

Single roundtrip.

*Self-contained.*

---

### It's Not About HTML

Okay, but how is this different from just rendering a bunch of HTML?

Let's tweak the `GreetingFrontend` component to do something different:

<Server>

```js
import { readFile } from 'fs/promises';
import { GreetingFrontend } from './client';

async function GreetingBackend() {
  const myColor = await readFile('./color.txt', 'utf8');
  return <GreetingFrontend color={myColor} />;
}
```

</Server>

<Client glued>

```js {12-17,19}
'use client';

import { useState } from 'react';

export function GreetingFrontend({ color }) {
  const [yourName, setYourName] = useState('Alice');
  return (
    <>
      <input placeholder="What's your name?"
        value={yourName}
        onChange={e => setYourName(e.target.value)}
        onFocus={() => {
          document.body.style.backgroundColor = color;
        }}
        onBlur={() => {
          document.body.style.backgroundColor = '';
        }}
      />
      <p>
        Hello, {yourName}!
      </p>
    </>
  );
}
```

</Client>

Instead of styling `<p>`, we'll set `document.body.style.backgroundColor` to the `color` from the backend--but only for as long as the input is focused.

Try typing into the input:

```js eval
<div className="mx-2">
  <GreetingBackend_2 />
</div>
```

Depending on how you look at it, the fact that this "just works" can seem either completely natural, or a total surprise, or a bit of both. The backend is passing props to the frontend, but *not for the purpose of generating the initial HTML markup.*

The props are being used *later*--in order to "do something" in the event handler.

<Client>

```js {5,12}
'use client';

import { useState } from 'react';

export function GreetingFrontend({ color }) {
  // ...
  return (
    <>
      <input placeholder="What's your name?"
        // ...
        onFocus={() => {
          document.body.style.backgroundColor = color;
        }}
        // ...
      />
      ...
    </>
  );
}
```

</Client>

Of course, we're not limited to passing colors. We could pass strings, numbers, booleans, objects, pieces of JSX--anything that can be sent over the wire.

Now let's try rendering `<Welcome />` again which composes our components:

```js {4-12}
import { readFile } from 'fs/promises';
import { GreetingFrontend } from './client';

function Welcome() {
  return (
    <>
      <GreetingBackend colorFile="./color1.txt" />
      <GreetingBackend colorFile="./color2.txt" />
      <GreetingBackend colorFile="./color3.txt" />
    </>
  );
}

async function GreetingBackend({ colorFile }) {
  const myColor = await readFile(colorFile, 'utf8');
  return <GreetingFrontend color={myColor} />;
}
```

Notice how each greeting now has the new behavior but remains independent:

```js eval
<Welcome_2 />
```

Local data, local state.

Nothing conflicts with each other. No global identifiers, no naming clashes. Any component can be reused anywhere in the tree and will remain self-contained.

*Local, therefore composable.*

Now that you get the idea, let's have some fun with it.

---

### A Sortable List

Imagine another *impossible* component--a sortable file list.

```js
import { useState } from 'react';
import { readdir } from 'fs/promises';

async function SortableFileList({ directory }) {
  const [isReversed, setIsReversed] = useState(false);
  const files = await readdir(directory);
  const sortedFiles = isReversed ? files.toReversed() : files;
  return (
    <>
      <button onClick={() => setIsReversed(!isReversed)}>
        Flip order
      </button>
      <ul>
        {sortedFiles.map(file =>
          <li key={file}>
            {file}
          </li>
        )}
      </ul>
    </>
  );
}
```

Of course, this doesn't make sense. The information `readdir` needs only exists on *my* computer but the sorting order you choose with `useState` lives on *your* computer. (The most I *could* do on mine is to prepare HTML for the initial state.)

How do we fix this component?

By now, you know the drill:

<Server>

```js
import { SortableList } from './client';
import { readdir } from 'fs/promises';

async function SortableFileList({ directory }) {
  const files = await readdir(directory);
  return <SortableList items={files} />;
}
```

</Server>

<Client glued>

```js
'use client';

import { useState } from 'react';

export function SortableList({ items }) {
  const [isReversed, setIsReversed] = useState(false);
  const sortedItems = isReversed ? items.toReversed() : items;
  return (
    <>
      <button onClick={() => setIsReversed(!isReversed)}>
        Flip order
      </button>
      <ul>
        {sortedItems.map(item => (
          <li key={item}>
            {item}
          </li>
        ))}
      </ul>
    </>
  );
}
```

</Client>

Let's try it:

```js
<SortableFileList directory="." />
```

```js eval
<SortableFileList directory="./public/impossible-components" />
```

So far so good. Now notice that the `items` being passed down is an array. We're already using that to conditionally reverse it. What else could we do with an array?

---

### A Filterable List

It would be nice if we could filter the list of files with an input. Filtering must happen on *your* machine (the most I could do on *mine* is to generate HTML for the initial state). Therefore, it makes sense to add the filter logic to the frontend part:

<Server>

```js
import { SortableList } from './client';
import { readdir } from 'fs/promises';

async function SortableFileList({ directory }) {
  const files = await readdir(directory);
  return <SortableList items={files} />;
}
```

</Server>

<Client glued>

```js {7-14,20-24}
'use client';

import { useState } from 'react';

export function SortableList({ items }) {
  const [isReversed, setIsReversed] = useState(false);
  const [filterText, setFilterText] = useState('');
  let filteredItems = items;
  if (filterText !== '') {
    filteredItems = items.filter(item =>
      item.toLowerCase().startsWith(filterText.toLowerCase())
    );
  }
  const sortedItems = isReversed ? filteredItems.toReversed() : filteredItems;
  return (
    <>
      <button onClick={() => setIsReversed(!isReversed)}>
        Flip order
      </button>
      <input
        value={filterText}
        onChange={(e) => setFilterText(e.target.value)}
        placeholder="Search..."
      />
      <ul>
        {sortedItems.map(item => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </>
  );
}
```

</Client>

Notice how the backend part only executes once--since my blog is static, it runs during deployment. But the frontend logic is reactive to your every keystroke:

```js eval
<SortableFileList_2 directory="./public/impossible-components" />
```

And because it's a reusable component, I can point it at some other data source:

```js
<SortableFileList directory="./node_modules/react/" />
```

```js eval
<SortableFileList_2 directory="./node_modules/react/" />
```

What we've got here is, again, a self-contained component that can load its own data on the backend and hand it off to the frontend for client-side interactivity.

Let's see how far we can push this.

---

### An Expanding Preview

Here's a little `PostPreview` component for my blog:

<Server>

```js
import { readFile } from 'fs/promises';
import matter from 'gray-matter';

async function PostPreview({ slug }) {
  const fileContent = await readFile('./public/' + slug + '/index.md', 'utf8');
  const { data, content } = matter(fileContent);
  const wordCount = content.split(' ').filter(Boolean).length;

  return (
    <section className="rounded-md bg-black/5 p-2">
      <h5 className="font-bold">
        <a href={'/' + slug} target="_blank">
          {data.title}
        </a>
      </h5>
      <i>{wordCount.toLocaleString()} words</i>
    </section>
  );
}
```

</Server>

It looks like this:

```js
<PostPreview slug="jsx-over-the-wire" />
```

```js eval
<div className="mb-8">
  <PostPreview slug="jsx-over-the-wire" />
</div>
```

Isn't it neat how it loads its own data? (Or rather, how the data is *already there*?)

Now let's say I want to add a little interaction to it. For example, let's say that I want the card to expand on click so that it displays the first sentence of the post.

Getting the first sentence on the backend is pretty easy:

<Server>

```js {5-6,16}
async function PostPreview({ slug }) {
  const fileContent = await readFile('./public/' + slug + '/index.md', 'utf8');
  const { data, content } = matter(fileContent);
  const wordCount = content.split(' ').filter(Boolean).length;
  const firstSentence = content.split('.')[0];
  const isExpanded = true; // TODO: Somehow connect this to clicking

  return (
    <section className="rounded-md bg-black/5 p-2">
      <h5 className="font-bold">
        <a href={'/' + slug} target="_blank">
          {data.title}
        </a>
      </h5>
      <i>{wordCount.toLocaleString()} words</i>
      {isExpanded && <p>{firstSentence} [...]</p>}
    </section>
  );
}
```

</Server>

```js eval
<div className="mb-8">
  <PostPreview_2 slug="jsx-over-the-wire" />
</div>
```

But how do we expand it *on click?* A *click* is a frontend concept, and so is state in general. Let's extract a frontend component that I'll call an `ExpandingSection`:

<Server>

```js {3,13,21}
import { readFile } from 'fs/promises';
import matter from 'gray-matter';
import { ExpandingSection } from './client';

async function PostPreview({ slug }) {
  const fileContent = await readFile('./public/' + slug + '/index.md', 'utf8');
  const { data, content } = matter(fileContent);
  const wordCount = content.split(' ').filter(Boolean).length;
  const firstSentence = content.split('.')[0];
  const isExpanded = true; // TODO: Somehow connect this to clicking

  return (
    <ExpandingSection>
      <h5 className="font-bold">
        <a href={'/' + slug} target="_blank">
          {data.title}
        </a>
      </h5>
      <i>{wordCount.toLocaleString()} words</i>
      {isExpanded && <p>{firstSentence} [...]</p>}
    </ExpandingSection>
  );
}
```

</Server>

<Client glued>

```js {3-9}
'use client';

export function ExpandingSection({ children }) {
  return (
    <section className="rounded-md bg-black/5 p-2">
      {children}
    </section>
  );
}
```

</Client>

By itself, this doesn't change anything--it just moves the `<section>` from the world of data (the backend) to the world of state and event handlers (the frontend).

But now that we're *on* the frontend, we can start layering the interaction logic:

<Client>

```js {5-6,10,13}
'use client';

import { useState } from 'react';

export function ExpandingSection({ children, extraContent }) {
  const [isExpanded, setIsExpanded] = useState(false);
  return (
    <section
      className="rounded-md bg-black/5 p-2"
      onClick={() => setIsExpanded(!isExpanded)}
    >
      {children}
      {isExpanded && extraContent}
    </section>
  );
}
```

</Client>

*(Note that in a real app, you'd need to make the press target a button and avoid nesting the link inside to stay accessible. I'm skimming over it for clarity but you shouldn't.)*

Let's verify that `ExpandingSection` works as expected. Try clicking "Hello":

```js
<ExpandingSection
  extraContent={<p>World</p>}
>
  <p>Hello</p>
</ExpandingSection>
```

```jsx eval
<div className="mb-8">
  <ExpandingSection_2 extraContent={<p style={{padding: 0}}>World</p>}>
    <p style={{padding: 0}}>Hello</p>
  </ExpandingSection_2>
</div>
```

Now we have an `<ExpandingSection>` that toggles showing its `extraContent` on click. All that's left to do is to pass that `extraContent` *from the backend:*

<Server>

```js {7}
async function PostPreview({ slug }) {
  // ...
  const firstSentence = content.split('.')[0];

  return (
    <ExpandingSection
      extraContent={<p>{firstSentence} [...]</p>}
    >
      ...
    </ExpandingSection>
  );
}
```

</Server>

<Client glued>

```js {13}
'use client';

import { useState } from 'react';

export function ExpandingSection({ children, extraContent }) {
  const [isExpanded, setIsExpanded] = useState(false);
  return (
    <section
      className="rounded-md bg-black/5 p-2"
      onClick={() => setIsExpanded(!isExpanded)}
    >
      {children}
      {isExpanded && extraContent}
    </section>
  );
}
```

</Client>

Let's try this again:

```js
<PostPreview slug="jsx-over-the-wire" />
```

The component's *initial* state looks exactly like before. But try clicking the card:

```js eval
<div className="mb-8 transition-[height]">
  <PostPreview_3 slug="jsx-over-the-wire" />
</div>
```

Now the extra content shows up! Notice there aren't any requests being made as you're toggling the card--the `extraContent` prop was *already there*. Here's the full code so you can trace the props flow down from the backend to the frontend:

<Server>

```js {13,15-20}
import { readFile } from 'fs/promises';
import matter from 'gray-matter';
import { ExpandingSection } from './client';

async function PostPreview({ slug }) {
  const fileContent = await readFile('./public/' + slug + '/index.md', 'utf8');
  const { data, content } = matter(fileContent);
  const wordCount = content.split(' ').filter(Boolean).length;
  const firstSentence = content.split('.')[0];

  return (
    <ExpandingSection
      extraContent={<p>{firstSentence} [...]</p>}
    >
      <h5 className="font-bold">
        <a href={'/' + slug} target="_blank">
          {data.title}
        </a>
      </h5>
      <i>{wordCount.toLocaleString()} words</i>
    </ExpandingSection>
  );
}
```

</Server>

<Client glued>

```js {5,12-13}
'use client';

import { useState } from 'react';

export function ExpandingSection({ children, extraContent }) {
  const [isExpanded, setIsExpanded] = useState(false);
  return (
    <section
      className="rounded-md bg-black/5 p-2"
      onClick={() => setIsExpanded(!isExpanded)}
    >
      {children}
      {isExpanded && extraContent}
    </section>
  );
}
```

</Client>

The props always flow down.

Note it was important to place `ExpandingSection` into the frontend world, i.e. the file with `'use client'`. The backend doesn't have a *concept* of state--it starts fresh on every request--so importing `useState` there would be a build error.

However, you can always take a tag like `<section>...</section>` and replace it with a frontend component like `<ExpandedSection>...</ExpandedSection>` that enriches a plain `<section>` with some stateful logic and event handlers.

This might remind you of weaving. You've left `children` and `extraContent` as "holes" in `<ExpandedSection>...</ExpandedSection>`, and then you've "filled in" those holes with more content *from* the backend. You'll see this a lot because it's the only way to nest more backend stuff *inside* the frontend stuff.

Get used to it!

---

### A List of Previews

Let me add a new `PostList` component that renders an array of `PostPreview`s.

<Server>

```js {4-14}
import { readFile, readdir } from 'fs/promises';
import matter from 'gray-matter';

async function PostList() {
  const entries = await readdir('./public/', { withFileTypes: true });
  const dirs = entries.filter(entry => entry.isDirectory());
  return (
    <div className="mb-8 flex h-72 flex-col gap-2 overflow-scroll font-sans">
      {dirs.map(dir => (
        <PostPreview key={dir.name} slug={dir.name} />
      ))}
    </div>
  );
}

async function PostPreview({ slug }) {
  // ...
}
```

</Server>

It also needs to live on the backend since it uses the filesystem `readdir` API.

Here it is, showing a list of all posts on my blog:

```js
<PostList />
```

```js eval
<PostList />
```

Notice how you can click each card, and it will expand. This is not plain HTML--all of these are interactive React components that got their props from the backend.

---

### A Sortable List of Previews

Now let's make the list of previews filterable and sortable.

Here's what we want to end up with:

```js eval
<SortablePostList />
```

How hard could it be?

First, let's dig up the `SortableList` component from earlier. We're going to take the same exact [code as before](#a-filterable-list) but we'll assume `items` to be an array of objects shaped like `{ id, content, searchText }` rather than an array of strings:

<Client>

```js {11,27-29}
'use client';

import { useState } from 'react';

export function SortableList({ items }) {
  const [isReversed, setIsReversed] = useState(false);
  const [filterText, setFilterText] = useState('');
  let filteredItems = items;
  if (filterText !== '') {
    filteredItems = items.filter(item =>
      item.searchText.toLowerCase().startsWith(filterText.toLowerCase()),
    );
  }
  const sortedItems = isReversed ? filteredItems.toReversed() : filteredItems;
  return (
    <>
      <button onClick={() => setIsReversed(!isReversed)}>
        Flip order
      </button>
      <input
        value={filterText}
        onChange={(e) => setFilterText(e.target.value)}
        placeholder="Search..."
      />
      <ul>
        {sortedItems.map(item => (
          <li key={item.id}>
            {item.content}
          </li>
        ))}
      </ul>
    </>
  );
}
```

</Client>

For `SortableFileList`, we'll keep passing the filename itself as each field:

<Server>

```js {9-13}
import { SortableList } from './client';
import { readdir } from 'fs/promises';

async function SortableFileList({ directory }) {
  const files = await readdir(directory);
  return (
    <SortableList
      items={
        files.map(file => ({
          id: file,
          content: file,
          searchText: file,
        }))
      }
    />
  );
}
```

</Server>

<Client glued>

```js
'use client';

import { useState } from 'react';

export function SortableList({ items }) {
  // ...
}
```

</Client>

You can see that it continues working just fine:

```js
<SortableFileList directory="./public/impossible-components" />
```

```js eval
<SortableFileList_3 directory="./public/impossible-components" />
```

However, now we can reuse `<SortableList>` by passing a list of posts to it:

<Server>

```js {11-15}
import { SortableList } from './client';
import { readdir } from 'fs/promises';

async function SortablePostList() {
  const entries = await readdir('./public/', { withFileTypes: true });
  const dirs = entries.filter((entry) => entry.isDirectory());
  return (
    <div className="mb-8 flex h-72 flex-col gap-2 overflow-scroll font-sans">
      <SortableList
        items={
          dirs.map(dir => ({
            id: dir.name,
            searchText: dir.name.replaceAll('-', ' '),
            content: <PostPreview slug={dir.name} />
          }))
        }
      />
    </div>
  );
}
```

</Server>

<Client glued>

```js
'use client';

import { useState } from 'react';

export function SortableList({ items }) {
  // ...
}
```

</Client>

See for yourself:

```js
<SortablePostList />
```

```js eval
<SortablePostList />
```

Play with the demo above and make sure you understand what's going on.

This is a fully interactive React tree. You can click on individual items, and they will expand and collapse thanks to the local state inside `<ExpandingSection>`. In fact, if you expand a card, click "Flip order" and then "Flip order" again, you'll notice that the card stays expanded--it just moved down and back up in the tree.

You can do the filtering and reordering thanks to `<SortableList>`. Note that the `SortableList` itself is blissfully unaware of *what* it's sorting. You can put a list of any content inside it--and it's fine to pass props to it directly from the backend.

On the backend, the `<PostPreview>` component fully encapsulates reading information for a specific post. It takes care of counting the words and extracting their first sentence, and then passing that down to the `<ExpandingSection>`.

Notice that although there is a single `<PostPreview>` rendered for each of my posts, the data necessary for *this entire page* is being collected in a single run and served as a single roundtrip. When you visit this page, there are no extra requests. Only the data *used by the UI* is sent over the wire--i.e. the props for the frontend.

We're composing self-contained components that each can load their own data or manage their own state. At any point, we can add more encapsulated data loading logic or more encapsulated stateful logic at any point in the tree--as long as we're doing it in the right world. It takes some skill and practice to learn these patterns, but the reward is making components like `<SortablePostList />` possible.

```js eval
<SortablePostList />
```

Local state.

Local data.

Single roundtrip.

*Self-contained.*

---

### In Conclusion

Our users don't care about how any of this stuff works. When people use our websites and apps, they don't think in terms of the "frontend" and the "backend". They see the things on the screen: *a section, a header, a post preview, a sortable list.*

*But maybe our users are right.*

Composable abstractions with self-contained data logic and state logic let us speak the same language as our users. Component APIs like `<PostPreview slug="...">` and `<SortableList items={...}>` map to how we *intuitively* think about those boxes on the screen. The fact that implementing self-contained `<PostPreview>` and `<SortableList>` without compromises requires running them on different "sides" is not a problem if we can compose them together.

The division between the frontend and the backend is physical. We can't escape from the fact that we're writing client/server applications. Some logic is naturally *more suited* to either side. But one side should not dominate the other. And we shouldn't have to change the approach whenever we need to move the boundary.

What we need are the tools that let us *compose across the stack*. Then we can create self-contained LEGO blocks that run where appropriate--and snap them together. Any piece of UI can have its own backend needs *and* frontend needs. It's time that our tools acknowledge that, embrace that, and let us speak our users' language.

---

### Next Steps

We've seen a few composition patterns but we've barely scratched the surface of what's possible. Some ideas if you want to play around with it on your own:

- You can add more backend-only logic to `PostPreview`. For example, it might be nice to parse the first sentence from Markdown (but strip formatting).
- You can highlight the partial search match text in the individual `PostPreview` items. One way to do this would be to provide a `FilterTextContext` with a `filterText` value from the `SortableList`, and then extract `<h5>` from `PostPreview` into a frontend `PostHeader` that reads that Context.
- If you're happy making your project dynamically served per-request (rather than static like my blog), you can move the *filtering logic itself* to the backend by reading the `filterText` from the route query params. The `SortableList` component could be taught to cause a router navigation instead of setting local state, and to display a pending indicator while the screen is being refetched in-place. This is useful if you want to apply filtering to many more rows, e.g. from a database.
- Speaking of refetching, my blog is fully static--but if your app is dynamic, you could add a "Refresh" button that refreshes the list of posts without changing any of these components. Notably, refreshing *would not destroy the existing state*, so if you expanded any cards or edited the filter text, the newly added items matching the filter would gracefully appear in the list. You could even animate them in.
- Of course, if your app is dynamic, you can also add mutations and call the backend *from* the frontend via `'use server'`. This fits neatly into the same paradigm.
- Imagine your own impossible components! Maybe you'd like an `<Image>` that reads from the filesystem and creates a blur gradient placeholder by itself? Think about the last time you were writing a component and needed some information that's only known "on the backend" or "during the build". Now you have it.

The most important thing, in my opinion, is to get a feel for self-contained data loading and stateful logic, and how to compose them together. Then you're good.

---

### A Note on Terminology

As in my other [recent](https://overreacted.io/react-for-two-computers/) [articles](https://overreacted.io/jsx-over-the-wire/), I've tried to avoid using the "Server Components" and "Client Components" terminology in this post because it brings up distracting connotations and knee-jerk reactions. (In particular, people tend to assume the "client loads from the server" rather than the "server renders the client" model.)

The "backend components" in this post are officially called Server Components, and the "frontend components" are officially called Client Components. If I could change the official terminology, I probably still would *not.* However, I find that introducing it when you already understand the model (as I hope you do by this point) works better than starting with the terminology. This may eventually stop being a problem if the Server/Client split as modeled by React Server Components ever becomes the generally accepted model of describing distributed composable user interfaces. I think we may get there at some point within the next ten years.

---

### Final Code

Here's the complete code from the last example.

<Server>

```js
import { SortableList, ExpandingSection } from './client';
import { readdir, readFile } from 'fs/promises';

async function SortablePostList() {
  const entries = await readdir('./public/', { withFileTypes: true });
  const dirs = entries.filter((entry) => entry.isDirectory());
  return (
    <div className="mb-8 flex h-72 flex-col gap-2 overflow-scroll font-sans">
      <SortableList
        items={
          dirs.map(dir => ({
            id: dir.name,
            searchText: dir.name.replaceAll('-', ' '),
            content: <PostPreview slug={dir.name} />
          }))
        }
      />
    </div>
  );
}

async function PostPreview({ slug }) {
  const fileContent = await readFile('./public/' + slug + '/index.md', "utf8");
  const { data, content } = matter(fileContent);
  const wordCount = content.split(' ').filter(Boolean).length;
  const firstSentence = content.split('.')[0];

  return (
    <ExpandingSection
      extraContent={<p>{firstSentence} [...]</p>}
    >
      <h5 className="font-bold">
        <a href={'/' + slug} target="_blank">
          {data.title}
        </a>
      </h5>
      <i>{wordCount.toLocaleString()} words</i>
    </ExpandingSection>
  );
}
```

</Server>

<Client glued>

```js
'use client';

import { useState } from 'react';

export function SortableList({ items }) {
  const [isReversed, setIsReversed] = useState(false);
  const [filterText, setFilterText] = useState('');
  let filteredItems = items;
  if (filterText !== '') {
    filteredItems = items.filter(item =>
      item.searchText.toLowerCase().startsWith(filterText.toLowerCase()),
    );
  }
  const sortedItems = isReversed ? filteredItems.toReversed() : filteredItems;
  return (
    <>
      <button onClick={() => setIsReversed(!isReversed)}>
        Flip order
      </button>
      <input
        value={filterText}
        onChange={(e) => setFilterText(e.target.value)}
        placeholder="Search..."
      />
      <ul>
        {sortedItems.map(item => (
          <li key={item.id}>
            {item.content}
          </li>
        ))}
      </ul>
    </>
  );
}

export function ExpandingSection({ children, extraContent }) {
  const [isExpanded, setIsExpanded] = useState(false);
  return (
    <section
      className="rounded-md bg-black/5 p-2"
      onClick={() => setIsExpanded(!isExpanded)}
    >
      {children}
      {isExpanded && extraContent}
    </section>
  );
}
```

</Client>

```js eval
<SortablePostList />
```

You can try this code in [Next](https://nextjs.org/)--or in [Parcel](https://parceljs.org/recipes/rsc/) if you don't want a framework. If you set up a full project from this code, feel free to send a pull request and I'll link it.

Have fun!
