---
title: 我々向けの Algebraic Effects 入門
date: '2019-07-21'
spoiler: ブリトーとは違うんですよ
---

Algebraic Effects について聞いたことはあるでしょうか？

最初に私がこの概念が何なのか、なぜ気にする必要があるのかを理解しようと試みたときは全然ダメでした。[いくつか](https://www.eff-lang.org/handlers-tutorial.pdf)の[PDF](https://www.microsoft.com/en-us/research/wp-content/uploads/2016/08/algeff-tr-2016-v2.pdf) を見つけましたが、余計にわからなくなりました（リンク先は学術的な PDF で、読んでで眠くなりました）。

しかし同僚の Sebastian は[ずっと](https://mobile.twitter.com/sebmarkbage/status/763792452289343490)この[概念](https://mobile.twitter.com/sebmarkbage/status/776883429400915968)について[言及](https://mobile.twitter.com/sebmarkbage/status/776840575207116800)を[し続けていました](https://mobile.twitter.com/sebmarkbage/status/969279885276454912)。これが私たちが React の中でやってることのメンタルモデルなんですよと（Sebastian は React チームで働いていて、これまで相当な数のアイデアを思いついています。それには hooks や Suspense といったものも含まれます）。気づいたら React チームではお決まりのジョークとして、しばしば会話の最後をこんな感じで締めるようになりました。

!["Algebraic Effects" caption on the "Ancient Aliens" guy meme](./effects.jpg)

次第に、Algebraic Effects というのはなかなかイカした概念で、例の PDF から感じるような怖いものではないことがわかりました。**もしあなたが単に React を使っているだけなら、知らないといけないことはありません — でも私がそうだったように、興味が湧いてきたならこのまま読み続けましょう。**

*（免責事項: 私はプログラミング言語の研究者ではなく、そのため一部めちゃくちゃな説明があるかもしれません。この分野は素人なので、指摘は歓迎します！）*

### まだプロダクションでは使えませんからね

*Algebraic Effects* というのは研究用プログラミング言語が持っている機能のひとつです。ということはつまり、**この機能は `if` 文 とか関数とか `async / await` などとは違い、実際のプロダクションコードで使ってることはおそらくないということです**。一部の[ごく少数](https://www.eff-lang.org/)の[言語](https://www.microsoft.com/en-us/research/project/koka/)がそれをサポートしており、当の言語自体この概念の探求のために作られたものだったりします。プロダクションに取り入れようという動きは OCaml には見られるようですが……まだまだ[進行中](https://github.com/ocaml-multicore/ocaml-multicore/wiki)といった具合です。要はまだまだ[Can't Touch This](https://www.youtube.com/watch?v=otCpCn0l4Wo)という訳です。

>追記: 何人かの方から、LISP では[似たような仕組みがある](#もっと詳しく学びたい人は)と聞きました。なので LISP を使っていればプロダクションで使えるようです。

### なら何故気にするのか？

もしあなたが `goto` を使ったコードを書いていて、他の誰かが `if` 文や `for` 文を見せてくれたとしましょう。あるいはコールバック地獄の奥にいる時に誰かが `async / await` を見せてくれたら……最高だと思いませんか？

まだ主流になるには数年かかるであろうプログラミング上の概念について学ぶのが好きなタイプの人にとっては、Algebraic Effects はそろそろ気になるもののはずです。*知っとかないとダメ*ってものではないですよ。いってみれば 1999 年に `async / await` について考えるようなものですから。

### よし、じゃあ Algebraic Effects って何なんだい？

名前は仰々しいですが、概念はシンプルです。あなたが `try / catch` 構文に慣れ親しんでいるなら、すぐに分かるでしょう。

まず `try / catch` についてまとめてみましょう。何かしら `throw` する関数があるとします。そして当の関数と `catch` 節の間にはいくつもの関数が挟まってるとしましょう。

```jsx{4,19}
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

`getName` の中で `throw` していますが、そこから `makeFriends` を介して最寄りの `catch` 節に「伝播」していきます。これが `try / catch` の重要な特徴です。**途中にいるものたちはエラーハンドリングのことは気にしなくてよいということです**。

C 言語のようなエラーコードとは違い、`try / catch` があれば、エラーをわざわざすべての中間層で手で渡してて途中でどっか行った……みたいな心配は不要になります。自動で伝播していくからです。

### これが Algebraic Effects と何の関係があるのか？

上の例ではひとたびエラーにぶつかると、もう続行できません。一度 `catch` 節に来てしまったら、元のコードをそこから再開というわけには行きません。

終わりです、もう遅いです。ここでできるのはせいぜい失敗からの復帰を行うことと、よくてリトライを行うかもしれないですが、元いたところに「戻って」違うことをやる魔法のような方法はありません。**しかし、Algebraic Effects があるとそれができるのです**。

以下は仮想的な JavaScript の文法（面白いのでこれを ES2025 と呼びましょう）で書いた例です。これを使って `user.name` がないところから*復帰*してみましょう。

```jsx{4,19-21}
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

ここでは `throw` の代わりに仮想的な `perform` というキーワードを、`try / catch` の代わりに仮想的な `try / handle` を使います。**構文自体は大事ではありません、ひとまず概念の表現として必要なものを考えてみただけです。**

一体何が起きているのでしょう？もっと詳しく見てみましょう。

私たちは「エラーを投げる」かわりに *「エフェクトを引き起こして（perform an effect）」*います。ちょうど任意の値が `throw` 可能であるように、`perform` にはどんな値も渡せます。この例では文字列を渡していますが、それはオブジェクトかもしれませんし、他のデータ型でもありうるでしょう。

```jsx{4}
function getName(user) {
  let name = user.name;
  if (name === null) {
  	name = perform 'ask_name';
  }
  return name;
}
```

私たちがエラーを `throw` したとき、エンジンはコールスタック上方の一番近い `try / catch` エラーハンドラを見つけます。同様に、我々がエフェクトを `perform` すれば、エンジンはコールスタック上方の一番近い `try / handle` *エフェクトハンドラ* を見つけに行くでしょう。

```jsx{3}
try {
  makeFriends(arya, gendry);
} handle (effect) {
  if (effect === 'ask_name') {
  	resume with 'Arya Stark';
  }
}
```

このエフェクトによって、私たちは `name` がなかった時にどうするかを決めることができます。ここで（例外のケースと違った）新しいものがあるとすれば、仮想の `resume with` です。

```jsx{5}
try {
  makeFriends(arya, gendry);
} handle (effect) {
  if (effect === 'ask_name') {
  	resume with 'Arya Stark';
  }
}
```

これこそ、`try / catch` ではなし得ない部分です。これのおかげで**エフェクトを引き起こした箇所に戻ることができて、さらにハンドラから何かを渡すことができるのです** 🤯

```jsx{4,6,16,18}
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

しかし、注意して欲しいのは、**Algebraic Effects そのものは `try / catch` よりもずっと柔軟なもので、エラーから復帰できるというのは数あるユースケースの一つにすぎないということです。**この話から始めたのは、私にとってはこれが腑に落ちるのに最も近道だったと理解したからです。

### 関数に色はない

Algebraic Effects を使った場合、非同期処理のコードについて、ある興味深い性質が影響してきます。

`async / await` のある言語では、通常[関数に「色」がつきます](https://journal.stuffwithstuff.com/2015/02/01/what-color-is-your-function/)。たとえば、JavaScript では `getName` を非同期にした場合、`makeFriends` やその呼び出し元も `async` に「感染」します。これは*一部のコードをある時は同期的、ある時は非同期にしたい*というケースで非常に苦しい状況になります。

```jsx
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

JavaScript のジェネレータも[同様です](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function*)。ジェネレータを使うなら、間にいるものたちは皆ジェネレータを考慮に入れなければなりません。

この話に何の関係があるのでしょうって？

一旦 `async / await` のことは忘れてさっきの例に戻りましょう。

```jsx{4,19-21}
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

ここでエフェクトハンドラが「フォールバック先の名前」を同期的には知らなかったらどうなるでしょう？ あるいはデータベースから取りたくなったら？

もうお分かりでしょう。なんと `resume with` はエフェクトハンドラから非同期に呼んでもよく、その際 `getName` や `makeFriends` に何も手を加える必要はないということです。

```jsx{19-23}
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

この例では、`resume with` は一秒経つまで呼ばれません。`resume with` とは一度しか呼べないコールバックのようなものと考えられます（あるいはもっと印象的に「ワンショット限定継続」だよと友達に言ってみるのも良いでしょう）。

これで Algebraic Effects の仕組みがもう少し明確になったはずです。私たちがエラーを `throw` したとき、JavaScript エンジンは「スタックをアンワインドして」、プロセス内のローカル変数は破棄されます。しかし、私たちがエフェクトを `perform` したときは、この仮想のエンジンは関数の残りの部分から*コールバックを作成*し、`resume with` がそれを呼びます。

**もう一度いいますが、具体的な構文や特殊なキーワードはあくまでもこの記事専用のものです。そこが問題ではなく、重要なのは仕組みの方です。**

### 純粋性についての注意書き

Algebraic Effects が関数型プログラミングの研究から出てきたものであることは注目に値するでしょう。Algebraic Effects が解決する問題のいくつかは純粋関数型プログラミングに特有のものです。例えば（Haskell のような）任意の副作用を許さ*ない*ような言語では、モナドのような概念を用いてプログラムと作用（エフェクト）を接続する必要があります。モナドのチュートリアルを読んだことがある人なら、これが考えるのにコツが必要なものであることは知っているでしょう。Algebraic Effects は似たような解決を、より仰々しくない仕方でもたらすものだと言えます。

そのせいか、私にとって Algebraic Effects についての多くの議論はわかりづらく感じました（私は Haskell とその周辺については[よく知りません](/things-i-dont-know-as-of-2018/)）。しかし私の思うところでは、Algebraic Effects は JavaScript のようなちっとも純粋ではない言語にとっても、**非常に強力な形で「何」と「どうやって」を分離する道具になりうるということです。**

おかげでこんな風に、*何をしたいのか*にフォーカスしたコードが書けます。

```jsx{2,3,5,7,12}
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

```jsx{6-7,9-11,13-14}
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

```jsx
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

`async / await` やジェネレータとは異なり、**Algebraic Effects は「間にいる」関数に余分な複雑さを加える必要がありません。**ここでの `enumerateFiles` の呼び出しは、`ourProgram` の中のもっと奥になることもあるでしょう。しかし、perform されるかもしれないエフェクトから見て*どこかしら上の方*にエフェクトハンドラがある限り、このコードはちゃんと動きます。

エフェクトハンドラはプログラムのロジックを、具体的なエフェクトの実装から分離します。しかも過度な仰々しさやボイラープレートのコードなしにです。たとえばテスト中には本物のファイルシステムの代わりにフェイクのものを、コンソールに吐き出す代わりにスナップショットログ吐き出すものに挙動を置き換えたいときは、ちゃんとそうすることができます。

```jsx{19-23}
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

「[関数に色がない](https://journal.stuffwithstuff.com/2015/02/01/what-color-is-your-function/)（つまり間にいるコードはエフェクトのことを知らない）」上に、エフェクトハンドラは組み合わせて利用可能（ネストできる）なので、非常に表現力の豊かな抽象化が作れます。

### 型について

Algebraic Effects は静的型付け言語に由来する概念なので、どういう型として表現できるかが多くの議論で中心になります。この点が重要なことに疑いはありませんが、一方で概念を理解するのが困難になります。ですからこの記事では型の話をずっとしてきませんでした。しかし無視できない事実として、ある関数がエフェクトを perform できるという事実は通常、型シグネチャとしてコード化されます。このおかげで、よく分からないエフェクトが発行されて出どころが分からないという状況が防がれるのです。

厳密には、静的型付け言語における Algebraic Effects は関数に「[色をつける](https://journal.stuffwithstuff.com/2015/02/01/what-color-is-your-function/)」といった議論はありえます。というのも、エフェクトは型シグネチャの一種だからです。それはその通りなのですが、新しくエフェクトを追加するために間の関数の型アノテーションを直したとして、それ自体はセマンティクス上の変化ではないはずです。少なくとも `async` を追加したりジェネレータ関数に変更するような話ではありません。また型の推論によってその変更が連鎖していくのも避けられるはずでしょう。特に大きく違うのはエフェクトに対して、何もしない関数やモック実装（たとえば、非同期のエフェクトに対して同期的な呼び出しをする）を与えることで、エフェクトを「封じ込め」られる点です。これにより、必要に応じて外側のコードへの影響を防ぐこともできますし、違ったエフェクトに変えることもできます。

### JavaScript に Algebraic Effects を加えるべきか？

正直わかりません。非常に強力ではありますが、JavaScript にはちょっと*パワフルすぎる*よね、といった議論も全くありうるでしょう。

私見では Algebraic Effects がぴったりハマるのは、ミュータブルな変更が通常行われない言語であり、かつ標準ライブラリが完全にエフェクトを擁する作りになっているケースでしょう。もし `perform Timeout(1000)` とか `perform Fetch('http://google.com')` とか `perform ReadFile('file.txt')` とかが普通の書き方で、言語機能としてエフェクトに対するパターンマッチや静的型検査があるのなら、それは非常にすばらしいプログラミング環境でしょう。

その言語が JavaScript にコンパイルできるならもっと素晴らしいでしょうね！

### ここまでの話が React にどう関係するのか？

言うほどではありません。こじつけと言われてもしょうがないとすら思います。

もしあなたが[Time Slicing と Suspense についての私の発表](https://reactjs.org/blog/2018/03/01/sneak-peek-beyond-react-16.html)を見ていれば、2つ目の話がコンポーネントがキャッシュからデータを引く話に関わってきます。

```jsx
function MovieDetails({ id }) {
  // What if it's still being fetched?
  const movie = movieCache.read(id);
}
```

*（登壇時はちょっと違うAPIを用いていましたが、そこは重要ではありません）*

これは React の「Suspense」という、データ取得のユースケース向けに鋭意開発中の機能で作られています。ここでの面白い点はもちろん、`movieCache` にはまだデータがないかもしれない — ない場合ここから下の行には行けないので、*どうにか*しないといけないというケースです。技術的には、その場合 `read()` は Promise を投げ（そう、Promise が `throw` されるんです！心で理解してください）ます。これによって実行が「一時停止（＝suspend）」されます。React は Promise をキャッチし、投げられた Promise が resolve され次第忘れずにコンポーネントのレンダリングを再開します。

これは Algebraic Effects それ自体ではありません。この仕掛けはそこから[インスピレーションを得た](https://mobile.twitter.com/sebmarkbage/status/941214259505119232)ものですが、別物です。それでも同じ目的を達成します。つまりコールスタックの下の方にいるコードが、コールスタックの上にいる何か（ここでは React）に後を譲る際、間にいる関数はそのことを知らず、また `async` やジェネレータに「感染」しないようにするということです。もちろん、JavaScript で実行を後から*再開*することなど本当はできないのですが、React から見ると、Promise が解決した時に再レンダリングをするというのはほぼ同じようなものです。プログラミングモデルが[冪等性を前提にしている](/react-as-a-ui-runtime/#purity)からこそできる芸当です！

[Hooks](https://reactjs.org/docs/hooks-intro.html)は Algebraic Effects を思い出させるかもしれないもう一つの事例です。多くの人がまず最初に聞く質問としては次のようなことでしょう — `useState` はどうやって自分が参照しているコンポーネントを知ることができるのか？と。

```jsx
function LikeButton() {
  // How does useState know which component it's in?
  const [isLiked, setIsLiked] = useState(false);
}
```

その答えは[この記事の終わりの方](/how-does-setstate-know-what-to-do/)で既に答えています。React のオブジェクトには「現在のディスパッチャ」とでも呼ぶべき、いま現在使われている実装（たとえば `react-dom`）を指すミュータブルな状態がありますが、それと似たように「現在のコンポーネント」という、ここなら `LikeButton` の内部データ構造を指すプロパティがあるのです。`useState` はそれによってなすべきことを知ります。

慣れるまではみんな、明白な理由からこれを少し「汚く」感じるようです。共有のミュータブルな状態に依存するなんて「ふさわしくない」と。*（ところで、`try / catch` が JavaScript エンジンの中でどう実装されているか考えたことはありますか？）*

概念的には、しかし、`useState()` はコンポーネントの実行時に React がハンドリングするような `perform State()` であると考えることができます。これこそが React（あなたのコンポーネントを呼び出すものです）が、なぜ状態を提供できているのかの「説明」になるでしょう（コールスタックの上にあるおかげで、エフェクトハンドラを提供できるからです）。実際、私の見てきた Algebraic Effects のチュートリアルでは、[状態の実装](https://github.com/ocamllabs/ocaml-effects-tutorial/#2-effectful-computations-in-a-pure-setting) は最もよくある事例として紹介されています。

もちろん改めて言いますが、JavaScript に Algebraic Effects がない以上、これは React の*本当の*挙動ではありません。その代わり、`useState` の実装が現在のディスパッチャを指すフィールドを持っていたのと同様に、現在のコンポーネントを覚えておくような隠れたフィールドが存在するだけです。もっと言えば、パフォーマンス最適化のために `useState` には [マウント用と更新用](https://github.com/facebook/react/blob/2c4d61e1022ae383dd11fe237f6df8451e6f0310/packages/react-reconciler/src/ReactFiberHooks.js#L1260-L1290)の実装が別れてすらいます。それでも、目を細めてみてください。一生懸命コードを眺めてみると、これが本質的にエフェクトハンドラであるように見えてくるかもしれませんよ。

まとめると、JavaScript において `throw` することは IO エフェクトの大雑把な近似となります（コード自体が安全に再実行でき、かつ CPU バウンドでなければの話ですが）。そしてミュータブルな「ディスパッチャ」のフィールドを `try / finally` 内で復元することは、同期的なエフェクトハンドラの大雑把な近似となります。

もっとずっと忠実に、エフェクトの実装を再現しようと思った場合は、[ジェネレータを使えば](https://dev.to/yelouafi/algebraic-effects-in-javascript-part-4---implementing-algebraic-effects-and-handlers-2703)実現できます。しかしこうすると JavaScript の関数が持つ「透明な」性質を諦める必要があり、つまりすべてのものをジェネレータで書かないといけなくなります。それはちょっと……ねぇ。

### もっと詳しく学びたい人は

個人的には、Algebraic Effects がこんなにもすんなり理解できたことに驚きました。私はこれまで、例えばモナドのような抽象概念を理解するのに苦労してきたのですが、Algebraic Effects はただ「カチッと」ハマりました。この記事があなたにとってもカチッとハマる手助けになればと思います。

これがメインストリームで採用されていくのかはわかりません。私としては、2025 年までにこれが流行っていなければがっかりするでしょうから、5 年後を楽しみにしていきたいですね！

Algebraic Effects にできることはまだまだたくさんあると確信しています — しかし本当のパワーは実際にその方法でコードを書かないと、理解するのが難しいでしょう。この記事で興味を持った人は、気になりそうな資料をいくつか置いておきます。

* https://github.com/ocamllabs/ocaml-effects-tutorial

* https://www.janestreet.com/tech-talks/effective-programming/

* https://www.youtube.com/watch?v=hrBq8R_kxI0

また多くの人が指摘していましたが、型付けの側面を無視すれば（この記事でもそうしたように）、Common Lisp の [コンディションシステム](https://en.wikibooks.org/wiki/Common_Lisp/Advanced_topics/Condition_System)を昔からの先行技術として挙げられます。James Long の[継続についての記事](https://jlongster.com/Whats-in-a-Continuation)は、`call/cc` プリミティブがいかにして、ユーザーランドにおいて復帰できる例外を作るための土台になるかを説明しているので読んでみると面白いでしょう。

Algebraic Effects について、JavaScript をバックグラウンドにした人向けの良さそうな資料を見つけた人は、ぜひとも Twitter で知らせてください！
