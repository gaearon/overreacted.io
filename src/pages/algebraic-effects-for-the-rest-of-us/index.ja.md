---
title: 我々向けの Algebraic Effects 入門
date: '2019-07-21'
spoiler: ブリトーとは違うんですよ
---

Algebraic effects について聞いたことはあるでしょうか？

最初に私がこの概念が何なのか、なぜ気にする必要があるのかを理解しようと試みたときは全然ダメでした。[いくつかの](https://www.eff-lang.org/handlers-tutorial.pdf) [PDF](https://www.microsoft.com/en-us/research/wp-content/uploads/2016/08/algeff-tr-2016-v2.pdf) を見つけましたが、余計にわからなくなりました（リンク先は学術的な PDF で、読んでで眠くなりました）。

しかし同僚の Sebastian は[ずっと](https://mobile.twitter.com/sebmarkbage/status/763792452289343490) [この概念に](https://mobile.twitter.com/sebmarkbage/status/776883429400915968) [ついて](https://mobile.twitter.com/sebmarkbage/status/776840575207116800) [言及し続けていました](https://mobile.twitter.com/sebmarkbage/status/969279885276454912)。これが私たちが React の中でやってることのメンタルモデルなんですよと（Sebastian は React チームで働いていて、これまで相当な数のアイデアを思いついています。それには hooks や Suspense といったものも含まれます）。気づいたら React チームではお決まりのジョークとして、しばしば会話の最後をこんな感じで締めるようになりました。

!["Algebraic Effects" caption on the "Ancient Aliens" guy meme](./effects.jpg)

次第に、Algebraic Effects というのはなかなかイカした概念で、例の PDF から感じるような怖いものではないことがわかりました。**あなたが単に React を使ってて、その中身について知る必要があると感じるなら（もちろん興味があるならですが、私のように）、このまま読んでください。**

*（免責事項: 私はプログラミング言語の研究者ではなく、そのため説明は一部散らかってるかもしれません。この分野は素人なので、指摘は歓迎します！）*

### まだプロダクションでは使えませんからね

*Algebraic Effects* というのは研究用プログラミング言語が持っている機能のひとつです。ということはつまり、**この機能は `if` 文 とか関数とか `async / await` などとは違い、実際のプロダクションコードで使ってることはおそらくないということです**。一部の[ごく小数](https://www.eff-lang.org/)の[言語](https://www.microsoft.com/en-us/research/project/koka/)がそれをサポートしており、当の言語自体この概念の探求のために作られたものだったりします。プロダクションに取り入れようという動きは OCaml には見られるようですが、まだまだ[進行中](https://github.com/ocaml-multicore/ocaml-multicore/wiki)といった具合です。要はまだまだ[Can't Touch This](https://www.youtube.com/watch?v=otCpCn0l4Wo)という訳です。

### なら何故気にするのさ？

もしあなたが `goto` を使ったコードを書いていて、他の誰かが `if` 文や `for` 文を見せてくれたとしましょう。あるいはコールバック地獄の奥にいる時に誰かが `async / await` を見せてくれたら……最高だと思いませんか？

まだ主流になるには数年かかるであろうプログラミング上の概念について学ぶのが好きなタイプの人にとっては、Algebraic Effects はそろそろ気になるもののはずです。*知っとかないとダメ*ってものではないですよ。いってみれば 1999 年に `async / await` について考えるようなものですから。

### よーし、じゃあ Algebraic Effects って何なんだい？

名前は仰々しい（学術的な概念の名前はだいたいそう）ですが、概念はシンプルです。あなたが `try / catch` 構文に慣れ親しんでいるなら、すぐに分かるでしょう。

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

ここでは `throw` の代わりに仮想的な `perform` というキーワードを、`try / catch` の代わりに仮想的な `try / handle` を使います。**大事なのは構文自体ではなく、概念を描き出すのに必要なものをひとまず考え出したということです。**

一体何が起きているのでしょう？もっと詳しく見てみましょう。

私たちは「エラーを投げる」かわりに *「エフェクトを引き起こして（perform an effect）」*います。ちょうど任意の値が `throw` 可能であるように、`perform` にはどんな値も渡せます。この例では文字列を渡していますが、それはオブジェクトかもしれませんし、他のデータ型でもありうるでしょう。

```js{4}
function getName(user) {
  let name = user.name;
  if (name === null) {
  	name = perform 'ask_name';
  }
  return name;
}
```

私たちがエラーを `throw` したとき、エンジンはコールスタック上方の一番近い `try / catch` エラーハンドラを見つけます。同様に、我々がエフェクトを `perform` すれば、エンジンはコールスタック上方の一番近い `try / handle` *エフェクトハンドラ* を見つけに行くでしょう。

```js{3}
try {
  makeFriends(arya, gendry);
} handle (effect) {
  if (effect === 'ask_name') {
  	resume with 'Arya Stark';
  }
}
```

このエフェクトによって、私たちは name がなかった時にどうするかを決めることができます。ここで（例外のケースと違った）真新しいものがあるとすれば、仮想の `resume with` です。

```js{5}
try {
  makeFriends(arya, gendry);
} handle (effect) {
  if (effect === 'ask_name') {
  	resume with 'Arya Stark';
  }
}
```

これこそ、`try / catch` ではなし得ない部分です。これのおかげで**エフェクトを引き起こした箇所に戻ることができて、さらにハンドラから何かしらを渡すことができるのです** 🤯

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

ちょっと慣れるのに時間がかかるかもしれませんが、概念的には「再開できる `try / catch`」と考えてそんなに違いません。

しかし、注意して欲しいのは、**Algebraic Effects そのものは `try / catch` よりもっと柔軟なもので、エラーから復帰できるというのは数あるユースケースの一つにすぎないということです。**この話から始めたのは、私にとってはこれが腑に落ちるのに最も近道だったと理解したからです。

### 関数に色はない

Algebraic Effects を使った場合、非同期関数について興味深い性質が暗に伴います。

`async / await` のある言語では、通常[関数に「色」がつきます](https://journal.stuffwithstuff.com/2015/02/01/what-color-is-your-function/)。たとえば、JavaScript では `getName` を非同期にした場合、`makeFriends` やその呼び出し元もどうしても `async` に「感染」します。これは*一部のコードをある時は同期的、ある時は非同期にしたい*というケースで非常に苦しい状況になります。

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

JavaScript のジェネレータも[同様です](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function*)。ジェネレータを使うなら、中間にいるものたちも皆ジェネレータを考慮に入れなければなりません。

この話に何の関係があるのでしょうって？

一旦 `async / await` のことは忘れてさっきの例に戻りましょう。

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

ここでエフェクトハンドラが「フォールバック先の名前」を同期的には知らなかったらどうなるでしょう？ それに、データベースから取りたくなったら？

もうお分かりでしょう。`resume with` はエフェクトハンドラから非同期に呼んでもよく、その際 `getName` や `makeFriends` に何も手を加える必要はないということです。

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

この例では、`resume with` は一秒経つまで呼ばれません。`resume with` とは一度しか呼べないコールバックのようなものと考えられます（あるいはもっと印象的に「ワンショット限定継続」だよと友人に言ってみるのも良いでしょう）。

これで Algebraic Effects の仕組みがもう少し明確になったはずです。私たちがエラーを `throw` したとき、JavaScript エンジンは「スタックをほどき」、プロセス内のローカル変数は破棄されます。しかし、私たちがエフェクトを `perform` したときは、この仮想のエンジンは関数の残りの部分から*コールバックを作成*し、`resume with` がそれを呼びます。

**もう一度いいますが、具体的な構文や特殊なキーワードはあくまでもこの記事専用のものです。そこが問題ではなく、重要なのは仕組みの方です。**

### 純粋性についての注意書き

Algebraic Effects が関数型プログラミングの研究から出てきたものであることは注意に値するでしょう。Algebraic Effects が解決する問題のいくつかは純粋関数型プログラミングに特有のものです。例えば（Haskell のような）任意の副作用を許さ*ない*ような言語では、モナドのような概念を用いてプログラムと作用（エフェクト）を接続する必要があります。モナドのチュートリアルを読んだことがある人なら、これが考えるのにコツが必要なものであることは知っているでしょう。Algebraic Effects は似たような解決を、より仰々しくない仕方でもたらすものだと言えます。

そのせいで、私にとって Algebraic Effects についての多くの議論はわかりづらく感じました（私は Haskell とその周辺については[よく知りません](/things-i-dont-know-as-of-2018/)）。しかし私の思うところでは、Algebraic Effects は JavaScript のようなちっとも純粋ではない言語にとっても、**非常に強力な形で「何」と「どうやって」を分離する道具になりうるということです。**

おかげでこんな風に、*何をしたいのか*にフォーカスしたコードが書けます。

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

そして後々、*どうやるか*を指定したものでラップできます。

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

これはつまり、その部分だけを切り取ってライブラリにするのも可能ということです。

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

`async / await` やジェネレータとは異なり、**Algebraic Effects は「間にいる」関数に余分な複雑さを加える必要がありません。**ここでの `enumerateFiles` の呼び出しが `ourProgram` のずっと奥深くになりうるでしょう。しかし、perform されるかもしれないエフェクトから見て*どこかしら上の方*にエフェクトハンドラがある限り、このコードはちゃんと動きます。

エフェクトハンドラはプログラムのロジックを、具体的なエフェクトの実装から分離します。しかも過度な仰々しさやボイラープレートのコードなしにです。たとえばテスト中には本物のファイルシステムの代わりにフェイクのものを、コンソールに吐き出す代わりにスナップショットログ吐き出すものに挙動を置き換えたいときに、完全にそうすることができます。

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

なぜなら「[関数に色がない](https://journal.stuffwithstuff.com/2015/02/01/what-color-is-your-function/)（つまり間にいるコードはエフェクトのことを知らない）」上に、エフェクトハンドラは組み立て可能（ネストできる）ので、非常に表現力の豊かな抽象が作れます。

（厳密には、静的型付け言語における Algebraic Effects は関数に「[色をつける]((https://journal.stuffwithstuff.com/2015/02/01/what-color-is-your-function/)」といった議論はありえます。というのも、エフェクトは型シグネチャの一種だからです。それはその通りなのですが、新しくエフェクトを追加するために間にいる関数の型アノテーションを直したとして、それ自体はセマンティクス上の変化ではないはずです。少なくとも `async` を追加したりジェネレータ関数に変更するような話ではありません。また型の推論によってその変更が連鎖していくのも避けられるはずでしょう。）

### JavaScript に Algebraic Effects は必要か？

正直わかりません。非常に強力ではありますが、JavaScript にはちょっと*パワフルすぎる*よね、といった議論も全くありうるでしょう。

私見では Algebraic Effects がぴったりハマるのは、ミュータブルな変更が通常行われない言語であり、かつ標準ライブラリが完全にエフェクトを擁する作りになっているケースでしょう。もし `perform Timeout(1000)` とか `perform Fetch('http://google.com')` とか `perform ReadFile('file.txt')` とかが普通の書き方で、言語機能としてエフェクトに対するパターンマッチや静的型検査があるのなら、それは非常にすばらしいプログラミング環境でしょう。

その言語が JavaScript にコンパイルできるならもっと素晴らしいでしょうね！

### ここまでの話が React にどう関係するのか？

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
