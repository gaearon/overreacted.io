---
title: 我々のための Algebraic Effects 入門
date: '2019-07-21'
spoiler: ブリトーとは違うんですよ
---

Algebraic effects について聞いたことはあるでしょうか？

最初に私がこの概念が何なのか、なぜ気にする必要があるのかを理解しようと試みたときは全然ダメでした。[「いくつかの」](https://www.eff-lang.org/handlers-tutorial.pdf)[「PDF」](https://www.microsoft.com/en-us/research/wp-content/uploads/2016/08/algeff-tr-2016-v2.pdf) を見つけましたが、余計にわからなくなりました（リンク先は学術的な PDF で、読んでで眠くなりました）。

しかし同僚の Sebastian は[「ずっと」](https://mobile.twitter.com/sebmarkbage/status/763792452289343490) [「この概念に」](https://mobile.twitter.com/sebmarkbage/status/776883429400915968) [「ついて」](https://mobile.twitter.com/sebmarkbage/status/776840575207116800) [「言及し続けていました」](https://mobile.twitter.com/sebmarkbage/status/969279885276454912)。これが私たちが React の中でやってることのメンタルモデルなんですよと（Sebastian は React チームで働いていて、これまで相当な数のアイデアを思いついています。それには hooks や Suspense といったものも含まれます）。気づいたら React チームではお決まりのジョークとして、しばしば会話の最後をこんな感じで締めるようになりました。

!["Algebraic Effects" caption on the "Ancient Aliens" guy meme](./effects.jpg)

次第に、Algebraic effects というのはなかなかイカした概念で、例の PDF から感じるような怖いものではないことがわかりました。**あなたが単に React を使ってて、その中身について知る必要があると感じるなら（もちろん興味があるならですが、私のように）、このまま読んでってください。**

*（免責事項: 私はプログラミング言語の研究者ではなく、そのため説明の一部はとっちらかってるかもしれません。この分野は素人なので、指摘は歓迎します！）*

### まだプロダクションでは使えませんからね

*Algebraic Effects* というのは研究用プログラミング言語が持っている機能のひとつです。ということはつまり、**この機能は `if` 文 とか関数とか `async / await` などとは違い、実際のプロダクションコードで使ってることはおそらくない機能だということです**。一部の[「ごく小数」](https://www.eff-lang.org/)の[「言語」](https://www.microsoft.com/en-us/research/project/koka/)がそれをサポートしており、当の言語自体この概念の探求のために作られたものだったりします。プロダクションに取り入れようという動きは OCaml には見られるようですが、まだまだ[進行中](https://github.com/ocaml-multicore/ocaml-multicore/wiki)といった具合です。要は[触れない](https://www.youtube.com/watch?v=otCpCn0l4Wo)ということです。

### なら何故気にするのさ？

もしあなたが `goto` を使ったコードを書いていて、他の誰かが `if` 文や `for` 文を見せてくれたとしましょう。あるいはコールバック地獄の奥にいる時に誰かが `async / await` を見せてくれたら……最高だと思いませんか？

まだ主流になるには数年かかるであろうプログラミング上の概念について学ぶのが好きなタイプの人にとっては、Algebraic Effects はそろそろ気になるもののはずです。*知っとかないとダメ*ってものではないですよ。いってみれば 1999 年に `async / await` について考えるようなものですから。

### よーし、じゃあ Algebraic Effects って何なんだい？

名前は仰々しい（ 学術的な概念の名前はだいたいそう ）ですが、概念はシンプルです。あなたが `try / catch` 構文に慣れ親しんでいるなら、すぐに分かるでしょう。

まず `try / catch` についてまとめてみましょう。何かしら throw する関数があるとします。そして当の関数と `catch` 節の間にはいくつもの関数が挟まってるとしましょう。

```js{4,19}
function getName(user) {
  let name = user.name;
  if (name === null) {
  	throw new Error('A girl has no name');
  }
  return name;
}

function makeFriends(user1, user2) {
  user1.friendNames.add(getName(user2));
  user2.friendNames.add(getName(user1));
}

const arya = { name: null };
const gendry = { name: 'Gendry' };
try {
  makeFriends(arya, gendry);
} catch (err) {
  console.log("Oops, that didn't work out: ", err);
}
```

`getName` の中で throw していますが、そこから `makeFriends` を介して最寄りの `catch` 節に「伝播」していきます。これが `try / catch` の重要な特徴です。**途中にいるものたちはエラーハンドリングのことは気にしなくてよいということです**。

C 言語のようなエラーコードとは違い、`try / catch` があれば、エラーをわざわざすべての中間層で手で渡してて途中でどっか行った……みたいな心配は不要になります。自動で伝播していくからです。

### これが Algebraic Effects と何の関係があるのか？

上の例ではエラーにぶつかると、もう続行できません。一度 `catch` 節に来てしまったら、元のコードをそこから再開というわけには行きません。

終わりです、もう遅いです。ここでできるのはせいぜい失敗からの復帰を行うことと、よくてリトライを行うかもしれないですが、元いたところに「戻って」違うことをやる魔法のような方法はありません。**しかし、Algebraic Effects があるとそれができるのです**。

以下は仮想的な JavaScript の文法（面白いのでこれを ES2025 と呼びましょう）で書いた例です。これを使って `user.name` がないところから*復帰*してみましょう。

```js{4,19-21}
function getName(user) {
  let name = user.name;
  if (name === null) {
  	name = perform 'ask_name';
  }
  return name;
}

function makeFriends(user1, user2) {
  user1.friendNames.add(getName(user2));
  user2.friendNames.add(getName(user1));
}

const arya = { name: null };
const gendry = { name: 'Gendry' };
try {
  makeFriends(arya, gendry);
} handle (effect) {
  if (effect === 'ask_name') {
  	resume with 'Arya Stark';
  }
}
```

*（もし 2025 年にインターネットで "ES2025" について調べてここにたどり着いた読者がいたらごめんなさい。もしそれまでに Algebraic Effects が JavaScript に取り込まれていたら喜んで更新しますので！）*

Instead of `throw`, we use a hypothetical `perform` keyword. Similarly, instead of `try / catch`, we use a hypothetical `try / handle`. **The exact syntax doesn’t matter here — I just came up with something to illustrate the idea.**

So what’s happening? Let’s take a closer look.

Instead of throwing an error, we *perform an effect*. Just like we can `throw` any value, we can pass any value to `perform`. In this example, I’m passing a string, but it could be an object, or any other data type:

```js{4}
function getName(user) {
  let name = user.name;
  if (name === null) {
  	name = perform 'ask_name';
  }
  return name;
}
```

When we `throw` an error, the engine looks for the closest `try / catch` error handler up the call stack. Similarly, when we `perform` an effect, the engine would search for the closest `try / handle` *effect handler* up the call stack:

```js{3}
try {
  makeFriends(arya, gendry);
} handle (effect) {
  if (effect === 'ask_name') {
  	resume with 'Arya Stark';
  }
}
```

This effect lets us decide how to handle the case where a name is missing. The novel part here (compared to exceptions) is the hypothetical `resume with`:

```js{5}
try {
  makeFriends(arya, gendry);
} handle (effect) {
  if (effect === 'ask_name') {
  	resume with 'Arya Stark';
  }
}
```

This is the part you can’t do with `try / catch`. It lets us **jump back to where we performed the effect, and pass something back to it from the handler**. 🤯

```js{4,6,16,18}
function getName(user) {
  let name = user.name;
  if (name === null) {
  	// 1. We perform an effect here
  	name = perform 'ask_name';
  	// 4. ...and end up back here (name is now 'Arya Stark')
  }
  return name;
}

// ...

try {
  makeFriends(arya, gendry);
} handle (effect) {
  // 2. We jump to the handler (like try/catch)
  if (effect === 'ask_name') {
  	// 3. However, we can resume with a value (unlike try/catch!)
  	resume with 'Arya Stark';
  }
}
```

This takes a bit of time to get comfortable with, but it’s really not much different conceptually from a “resumable `try / catch`”.

Note, however, that **algebraic effects are much more flexible than `try / catch`, and recoverable errors are just one of many possible use cases.** I started with it only because I found it easiest to wrap my mind around it.

### A Function Has No Color

Algebraic effects have interesting implications for asynchronous code.

In languages with an `async / await`, [functions usually have a “color”](https://journal.stuffwithstuff.com/2015/02/01/what-color-is-your-function/). For example, in JavaScript we can’t just make `getName` asynchronous without also “infecting” `makeFriends` and its callers with being `async`. This can be a real pain if *a piece of code sometimes needs to be sync, and sometimes needs to be async*.

```js
// If we want to make this async...
async getName(user) {
  // ...
}

// Then this has to be async too...
async function makeFriends(user1, user2) {
  user1.friendNames.add(await getName(user2));
  user2.friendNames.add(await getName(user1));
}

// And so on...
```

JavaScript generators are [similar](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function*): if you’re working with generators, things in the middle also have to be aware of generators.

So how is that relevant?

For a moment, let’s forget about `async / await` and get back to our example:

```js{4,19-21}
function getName(user) {
  let name = user.name;
  if (name === null) {
  	name = perform 'ask_name';
  }
  return name;
}

function makeFriends(user1, user2) {
  user1.friendNames.add(getName(user2));
  user2.friendNames.add(getName(user1));
}

const arya = { name: null };
const gendry = { name: 'Gendry' };
try {
  makeFriends(arya, gendry);
} handle (effect) {
  if (effect === 'ask_name') {
  	resume with 'Arya Stark';
  }
}
```

What our effect handler didn’t know the “fallback name” synchronously? What if we wanted to fetch it from a database?

It turns out, we can call `resume with` asynchronously from our effect handler without making any changes to `getName` or `makeFriends`:

```js{19-23}
function getName(user) {
  let name = user.name;
  if (name === null) {
  	name = perform 'ask_name';
  }
  return name;
}

function makeFriends(user1, user2) {
  user1.friendNames.add(getName(user2));
  user2.friendNames.add(getName(user1));
}

const arya = { name: null };
const gendry = { name: 'Gendry' };
try {
  makeFriends(arya, gendry);
} handle (effect) {
  if (effect === 'ask_name') {
  	setTimeout(() => {
      resume with 'Arya Stark';
  	}, 1000);
  }
}
```

In this example, we don’t call `resume with` until a second later. You can think of `resume with` as a callback which you may only call once. (You can also impress your friends by calling it a “one-shot delimited continuation.”)

Now the mechanics of algebraic effects should be a bit clearer. When we `throw` an error, the JavaScript engine “unwinds the stack”, destroying local variables in the process. However, when we `perform` an effect, our hypothetical engine would *create a callback* with the rest of our function, and `resume with` calls it.

**Again, a reminder: the concrete syntax and specific keywords are made up for this article. They’re not the point, the point is in the mechanics.**

### A Note on Purity

It’s worth noting that algebraic effects came out of functional programming research. Some of the problems they solve are unique to pure functional programming. For example, in languages that *don’t* allow arbitrary side effects (like Haskell), you have to use concepts like Monads to wire effects through your program. If you ever read a Monad tutorial, you know they’re a bit tricky to think about. Algebraic effects help do something similar with less ceremony.

This is why so much discussion about algebraic effects is incomprehensible to me. (I [don’t know](/things-i-dont-know-as-of-2018/) Haskell and friends.) However, I do think that even in an impure language like JavaScript, **algebraic effects can be a very powerful instrument to separate the *what* from the *how* in the code.**

They let you write code that focuses on *what* you’re doing:

```js{2,3,5,7,12}
function enumerateFiles(dir) {
  const contents = perform OpenDirectory(dir);
  perform Log('Enumerating files in ', dir);
  for (let file of contents.files) {
  	perform HandleFile(file);
  }
  perform Log('Enumerating subdirectories in ', dir);
  for (let directory of contents.dir) {
  	// We can use recursion or call other functions with effects
  	enumerateFiles(directory);
  }
  perform Log('Done');
}
```

And later wrap it with something that specifies *how*:

```js{6-7,9-11,13-14}
let files = [];
try {
  enumerateFiles('C:\\');
} handle (effect) {
  if (effect instanceof Log) {
  	myLoggingLibrary.log(effect.message);
  	resume;
  } else if (effect instanceof OpenDirectory) {
  	myFileSystemImpl.openDir(effect.dirName, (contents) => {
      resume with contents;
  	});
  } else if (effect instanceof HandleFile) {
    files.push(effect.fileName);
    resume;
  }
}
// The `files` array now has all the files
```

Which means that those pieces can even become librarified:

```js
import { withMyLoggingLibrary } from 'my-log';
import { withMyFileSystem } from 'my-fs';

function ourProgram() {
  enumerateFiles('C:\\');
}

withMyLoggingLibrary(() => {
  withMyFileSystem(() => {
    ourProgram();
  });
});
```

Unlike `async / await` or Generators, **algebraic effects don’t require complicating functions “in the middle”**. Our `enumerateFiles` call could be deep within `ourProgram`, but as long as there’s an effect handler *somewhere above* for each of the effects it may perform, our code would still work.

Effect handlers let us decouple the program logic from its concrete effect implementations without too much ceremony or boilerplate code. For example, we could completely override the behavior in tests to use a fake filesystem and to snapshot logs instead of outputting them to the console:

```js{19-23}
import { withFakeFileSystem } from 'fake-fs';

function withLogSnapshot(fn) {
  let logs = [];
  try {
  	fn();
  } handle (effect) {
  	if (effect instanceof Log) {
  	  logs.push(effect.message);
  	  resume;
  	}
  }
  // Snapshot emitted logs.
  expect(logs).toMatchSnapshot();
}

test('my program', () => {
  const fakeFiles = [/* ... */];
  withFakeFileSystem(fakeFiles, () => {
  	withLogSnapshot(() => {
	  ourProgram();
  	});
  });
});
```

Because there is no [“function color”](https://journal.stuffwithstuff.com/2015/02/01/what-color-is-your-function/) (code in the middle doesn’t need to be aware of effects) and effect handlers are *composable* (you can nest them), you can create very expressive abstractions with them.

*(You might argue that algebraic effects technically do [“give color”](https://journal.stuffwithstuff.com/2015/02/01/what-color-is-your-function/) to functions in statically typed languages because effects are a part of the type signature. That’s true. However, fixing a type annotation for an intermediate function to include a new effect is not by itself a semantic change — unlike adding `async` or turning a function into a generator. Inference can also help avoid cascading changes.)*


### Should We Add Algebraic Effects to JavaScript?

Honestly, I don’t know. They are very powerful, and you can make an argument that they might be *too* powerful for a language like JavaScript.

I think they could be a great fit for a language where mutation is uncommon, and where the standard library fully embraced effects. If you primarily do `perform Timeout(1000)`, `perform Fetch('http://google.com')`, and `perform ReadFile('file.txt')`, and your language has pattern matching and static typing for effects, it might be a very nice programming environment.

Maybe that language could even compile to JavaScript!

### How Is All of This Relevant to React?

Not that much. You can even say it’s a stretch.

If you watched [my talk about Time Slicing and Suspense](https://reactjs.org/blog/2018/03/01/sneak-peek-beyond-react-16.html), the second part involves components reading data from a cache:

```js
function MovieDetails({ id }) {
  // What if it's still being fetched?
  const movie = movieCache.read(id);
}
```

*(The talk uses a slightly different API but that’s not the point.)*

This builds on a React feature called “Suspense”, which is in active development for the data fetching use case. The interesting part, of course, is that the data might not yet be in the `movieCache` — in which case we need to do *something* because we can’t proceed below. Technically, in that case the `read()` call throws a Promise (yes, *throws* a Promise — let that sink in). This “suspends” the execution. React catches that Promise, and remembers to retry rendering the component tree after the thrown Promise resolves.

This isn’t an algebraic effect per se, even though this trick was [inspired](https://mobile.twitter.com/sebmarkbage/status/941214259505119232) by them. But it achieves the same goal: some code below in the call stack yields to something above in the call stack (React, in this case) without all the intermediate functions necessarily knowing about it or being “poisoned” by `async` or generators. Of course, we can’t really *resume* execution in JavaScript later, but from React’s point of view, re-rendering a component tree when the Promise resolves is pretty much the same thing. You can cheat when your programming model [assumes idempotence](/react-as-a-ui-runtime/#purity)!

[Hooks](https://reactjs.org/docs/hooks-intro.html) are another example that might remind you of algebraic effects. One of the first questions that people ask is: how can a `useState` call possibly know which component it refers to?

```js
function LikeButton() {
  // How does useState know which component it's in?
  const [isLiked, setIsLiked] = useState(false);
}
```

I already explained the answer [near the end of this article](/how-does-setstate-know-what-to-do/): there is a “current dispatcher” mutable state on the React object which points to the implementation you’re using right now (such as the one in `react-dom`). There is similarly a “current component” property that points to our `LikeButton`’s internal data structure. That’s how `useState` knows what to do.

Before people get used to it, they often think it’s a bit “dirty” for an obvious reason. It doesn’t “feel right” to rely on shared mutable state. *(Side note: how do you think `try / catch` is implemented in a JavaScript engine?)*

However, conceptually you can think of `useState()` as of being a `perform State()` effect which is handled by React when executing your component. That would “explain” why React (the thing calling your component) can provide state to it (it’s above in the call stack, so it can provide the effect handler). Indeed, [implementing state](https://github.com/ocamllabs/ocaml-effects-tutorial/#2-effectful-computations-in-a-pure-setting) is one of the most common examples in the algebraic effect tutorials I’ve encountered.

Again, of course, that’s not how React *actually* works because we don’t have algebraic effects in JavaScript. Instead, there is a hidden field where we keep the current component, as well as a field that points to the current “dispatcher” with the `useState` implementation. As a performance optimization, there are even separate `useState` implementations [for mounts and updates](https://github.com/facebook/react/blob/2c4d61e1022ae383dd11fe237f6df8451e6f0310/packages/react-reconciler/src/ReactFiberHooks.js#L1260-L1290). But if you squint at this code very hard, you might see them as essentially effect handlers.

To sum up, in JavaScript, throwing can serve as a crude approximation for IO effects (as long as it’s safe to re-execute the code later, and as long as it’s not CPU-bound), and having a mutable “dispatcher” field that’s restored in `try / finally` can serve as a crude approximation for synchronous effect handlers.

You can also get a much higher fidelity effect implementation [with generators](https://dev.to/yelouafi/algebraic-effects-in-javascript-part-4---implementing-algebraic-effects-and-handlers-2703) but that means you’ll have to give up on the “transparent” nature of JavaScript functions and you’ll have to make everything a generator. Which is... yeah.

### Learn More

Personally, I was surprised by how much algebraic effects made sense to me. I always struggled understanding abstract concepts like Monads, but Algebraic Effects just “clicked”. I hope this article will help them “click” for you too.

I don’t know if they’re ever going to reach mainstream adoption. I think I’ll be disappointed if they don’t catch on in any mainstream language by 2025. Remind me to check back in five years!

I’m sure there’s so much more you can do with them — but it’s really difficult to get a sense of their power without actually writing code this way. If this post made you curious, here’s a few more resources you might want to check out:

* https://github.com/ocamllabs/ocaml-effects-tutorial

* https://www.janestreet.com/tech-talks/effective-programming/

* https://www.youtube.com/watch?v=hrBq8R_kxI0

If you find other useful resources on algebraic effects for people with JavaScript background, please let me know on Twitter!
