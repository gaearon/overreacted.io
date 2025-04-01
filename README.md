# Vibe Weekly

Pure JavaScript：

```js
<p className="text-2xl font-sans text-purple-400 dark:text-purple-500">
  Hello, <i>Alice</i>!
</p>
```

JSX：

```js eval
<p className="text-2xl font-sans text-purple-400 dark:text-purple-500">
  Hello, <i>Alice</i>!
</p>
```

Custom JSX：

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

Line Highlight：

```js {5-7}
const originalJSX = <Greeting person={alice} />;
console.log(originalJSX.type);  // Greeting
console.log(originalJSX.props); // { person: { firstName: 'Alice', birthYear: 1970 } }

const browserJSX = translateForBrowser(originalJSX);
console.log(browserJSX.type);  // 'p'
console.log(browserJSX.props); // { className: 'text-2xl font-sans text-purple-400 dark:text-purple-500', children: ['Hello', { type: 'i', props: { children: 'Alice' }, '!'] }
```