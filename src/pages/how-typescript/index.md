Javascript is confusing and Typescript doubly so because of all the config options it presents. This document has Ben's understanding of how Typescript configuration affects which language features you can use because he was confused and wanted to write it down.

There are three main things that affect what sort of code you can write:

- Typescript version
- `lib` property in tsconfig.json
- `target` property in tsconfig.json

The latter two are related to your runtime - almost always Node version but for websites, it would be the user's browser - so let's call that a secret #4.

## target property

Inside the `compilerOptions` of your tsconfig, there's a property called `target`. This property determines what the code that Typescript creates looks like. Let's take a look at the same code but with target set to different values:

Original code:

```typescript
const greetings: (string | null | undefined)[] = ['Hey', undefined, 'Hi', 'Hello', null];

for (const greeting of greetings) {
  console.log(greeting ?? 'Nullo!');
}
```

`target: "ES3"` (the default setting)

```javascript
var greetings = ['Hey', undefined, 'Hi', 'Hello', null];
for (var _i = 0, greetings_1 = greetings; _i < greetings_1.length; _i++) {
  var greeting = greetings_1[_i];
  console.log(greeting !== null && greeting !== void 0 ? greeting : 'Nullo!');
}
```

`target: "ES6"`

```javascript
const greetings = ['Hey', undefined, 'Hi', 'Hello', null];
for (const greeting of greetings) {
  console.log(greeting !== null && greeting !== void 0 ? greeting : 'Nullo!');
}
```

`target: "ES2020"`

```javascript
const greetings = ['Hey', undefined, 'Hi', 'Hello', null];
for (const greeting of greetings) {
  console.log(greeting ?? 'Nullo!');
}
```

The target is you telling the compiler "the place where this JavaScript code will eventually run can support up to these features". If you were a masochist still writing code for IE, TypeScript is absolutely a viable part of your toolchain because it can take all your fancy new language features and down-transpile them to things that IE can understand.

# WARNING: ADD THING ABOUT TC39 HERE INSTEAD OF BELOW

This is possible because TypeScript independently implements features from the TC39 forum. They write code that understands what the NCO does and when it should be used and whether it's appropriate and what it should convert to. They add these language features to TypeScript with every new release. For example, the NCO was added to Typescript in version 3.7. A user could upgrade their Typescript to version 3.7, make zero changes to the rest of the environment and suddenly they can use the NCO.

Contrast that to a user on plain JavaScript who would have to upgrade their runtime (i.e. Node 12 -> 14, in the case of the NCO) to get a new language feature. That's a much larger and much more dangerous upgrade. By implementing new language features in the transpiler, developers can get new features without changing any runtime behavior[^2].

### How should I pick my target?

To start with, let's rule out what `target` _not_ to pick. You definitely don't want to pick a target that's higher than what your runtime supports. For example, if you try using the NCO in Node 12, it won't work because the NCO wasn't added to Node until v14. Unfortunately, figuring out what your runtime supports is trickier than it should be.

To get this out of the way: if you're targeting anything besides the very latest Chrome/Firefox, good luck! There are people whose full time jobs is tracking the idiosyncrasies of different browser versions and writing code that can target them dynamically so it's definitely out of scope for this post. As a starter, I'd suggest looking into Babel with Browserslist.

If you're on Node, it's a lot easier. Typescript maintains a [list](https://github.com/microsoft/TypeScript/wiki/Node-Target-Mapping) of recent Node versions and the latest `target` they support. In general, if you start with Node 10 supporting ES2018, you can follow the rule of thumb that for every 2 you add to Node version, you add 1 to ES version (i.e. Node 12 supports ES2019, Node 14 supports ES2020 etc).

This is one of the most unfortunate parts of TypeScript. There is an explicit _but unenforced_ dependency between the version of your runtime (which could be set in any number of places, from your Heroku Procfile to your Dockerfile's `FROM` command to whatever the fuck was installed on the server-that-everyone-is-too-scared-to-touch 3 years ago). This isn't an unsolvable problem (ensuring your tests/development are on the same runtime as production will go a long way in alleviating it) but it's a giant pain.

This leads to the natural temptation to just not the set the property, let it be ES3 and know you'll be fine because any runtime that supports any recent ES versions will definitely support ES3. This isn't a crazy decision (again, there's a reason it's the default behavior!) and is certainly the simplest. The big reasons to not do it, in my view are:

1. Minor speed impact. When TypeScript converts between modern feature to old feature, it just rewrites the new feature in terms of old features. The new feature probably has a specific handler written for it within the JS engine you're using so it's probably going to be faster than the rewriting the TS transpiler does.
2. Typescript can't map everything. Typescript can map _most_ things but explicitly doesn't guarantee _everything_.
3. Sometimes you have to dive into JavaScript. It's a common enough occurrence to have to look at the actual JavaScript when debugging a thorny problem. The larger the distance is between your code and the JavaScript, the more trouble you'll have with that.

# WARNING: ADD LINKS^

Since we've established that Typescript can transpile most modern language features down to whatever your target is, it's tempting to just pick the default target. Indeed, that's the logic for the lowest target (`ES3`) being the Typescript default.

The result is that you can write code for essentially any runtime[^1] and

Since a recent JavaScript engine can support everything old engines can support (because JavaScript doesn't have a concept of breaking old language features), it's tempting to simply just pick the lowest option and go with it. Developers can use schmancy new

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

Typescript has zero guarantees that the place you're running the code it emits will work. For example, if you tried to run `false ?? true` on Node 12, it wouldn't work. This is where a lot of the complexity of TypeScript comes in. Since it's a new _language_, it has to natively support new features and then also decide to

[^1]: This is mostly true. My understanding is that Typescript doesn't guarantee it can map between every feature and every target but that mostly means going from the most complicated modern features to the simplest runtime.s

idk if needed

<!--
[^1]: OK, it would have [worked](https://caniuse.com/const) on IE11 but not in for-in or for-of loops. -->

[^2]: Some might say that the fact that JavaScript requires this weird separation in order to be remotely safe is a sign of the language being inherently flawed and they'd be deeply correct. Then again, whatever language they prefer isn't the most popular language in the world.
