Javascript is confusing and Typescript doubly so because of all the config options it presents. This document has Ben's understanding of how Typescript configuration affects which language features you can use because he was confused and wanted to write it down.

There are three main things that affect what sort of code you can write:

- Typescript version
- `lib` property in tsconfig.json
- `target` property in tsconfig.json

The latter two are related to your runtime - almost always Node version but for websites, it would be the user's browser - so let's call that a secret #4.

## Typescript version

As a general rule, it's impossible for the user of a language to add a language feature themselves. For example, let's say that you wanted to add a factorial operator so something like this would work:

```jsx
console.log(5!) // prints 120
```

No matter how skilled of a programmer you are, you cannot, in any reasonable way make this happen. This is a syntactical feature of the language.

In ECMAScript (the formal name for JavaScript, more or less), language features are added based on the determination of TC39, the overlords of JavaScript. Proposals have to go through several phases to make sure they're not going to break the language and to make sure they're good fit for the language. To take a feature I'm fond of, the nullish coalescing operator (`??`) was [proposed](https://github.com/tc39/proposal-nullish-coalescing/commits/master?before=5b2a58ee3a56c2b5a5eb30a30959e32ae61d4c49+35&branch=master) in August 2017 and was not formalized as part of the specification until January 2020.

The TC39 specification exists as a sort of platonic ideal of the language. They release clear directions for what the language should do but they're not out there actually writing something that can run JavaScript. That work is done by _engine_ maintainers such as the V8 engine (what Chrome, Node and most everything use). These engines take JavaScript code, do a bunch of cool performance optimizations on it and then runs the code.

These engines cannot run native Typescript which is where `tsc`, the TypeScript compiler, comes in. The Typescript compiler translates TypeScript code into runnable JavaScript code. To take a trivial example:

```javascript
// ts file
const x: number = 7;

// emitted js
const x = 7;
```

The first line could not be run by any JavaScript engine; the latter could. Typescript's value is in that pre-emit phase. If I had tried to tell Typescript that 7 was a `string`, it would have called me on my shit, thrown an error and I would have fixed the bug.

<!-- Of course, to go back to the nullish coalescing operator (referred to as NCO from here on out, I'm tired of typing that),  -->

Typescript has zero guarantees that the place you're running the code it emits will work. For example, if you tried to run `const x = 7` on any version of Internet Explorer[^1], it wouldn't work

[^1]: OK, it would have [worked](https://caniuse.com/const) on IE11 but not in for-in or for-of loops.
