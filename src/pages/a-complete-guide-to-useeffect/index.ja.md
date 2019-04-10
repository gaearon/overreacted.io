---
title: #TODO
date: "2019-03-09"
spoiler: #TODO
---

あなたは Hooks を使って複数のコンポーネントを書きました。ちょっとしたアプリも作ったことがあるでしょう。満足もしている。API にも慣れて、その過程でコツも掴んできました。しかも重複したロジックを転用できるよう Custom Hooks を作り、同僚に自慢して見たり。

でも useEffect を使う度、いまいちピンときません。class のライフサイクルとは似ているけど、何かが違う。そしていろんな疑問を抱き始めます。

- 🤔 `componentDidMount` を `useEffect` で再現する方法は？
- 🤔 `useEffect` 内で正確に非同期処理を行う方法とは？　`[]`ってなに？
- 🤔 関数をエフェクトの依存関係として記すべき？
- 🤔 非同期処理の無限ループがたまに起こるのはなぜ？
- 🤔 古い state か props がエフェクト内にたまに入るのはなぜ？

私も Hooks を使い始めた時、同じような疑問を抱いてました。ドキュメントを書き始めた時も、まだ完璧に理解していませんでした。今回は、私がその後経験した "aha" モーメントを共有します。**この記事を読むことによって、上記に挙げた質問を当たり前にわかるようになるでしょう。**

答えが見えるようになるには、一歩下がって全体図を俯瞰して理解する必要があります。この記事の目的は箇条書きで答えを教えることではなく、 `useEffect` を完璧に理解していただくことです。習うことはそれほど多くはありません。それどころか、覚えていることを意識的に忘れることに注力していきます。

**`useEffect` Hook を慣れている class のライフサイクルパラダイムと分離して初めて理解できました。**

> “覚えたことを全て忘れるのじゃ.” — Yoda

![空気を嗅ぐヨーダ. キャプション: “ベーコンの匂いがする.”](./yoda.jpg)

---

**この記事は [`useEffect`](https://ja.reactjs.org/docs/hooks-effect.html) API をある程度理解していることが前提です**

**しかも*すごい*長文です。小さな本並みです。私が個人的に好むフォーマットなので、もし急ぎもしくはそこまで興味ない場合は、下に TLDR を書いたのでそちらを読んでください**

**もしこのようなディープダイブがしっくりこない場合は、他で説明されるのを待ったほうがいいかもしれません。React が 2013 年に出た時と同じように、人々が新たなメンタルモデルを理解して教えるのには時間がかかります。**

--

## TLDR（長すぎ、読んでない）

このセクションには全てを読みたくない人向けに簡潔に質問に答えています。理解できない部分があれば、下にスクロールしてその部分に関係あるところを読んでください。

この記事を全て読むのであれば遠慮なくこのセクションは飛ばしてください。最後にリンクを貼ります。

**🤔 `componentDidMount`を`useEffect`で再現する方法は？**

`useEffect(fn, [])` でも再現できますが、全く同じという訳ではありません。 `ComponentDidMount` とは違い、props と state を*キャプチャー*します。なので、callback の中でも初期 props と state を参照できます。一番最新のなにかを参照したい場合は、ref として書けます。ですが大概は ref として書かなくてもいいようコードを構成する方法があります。覚えて欲しいことは、effects と `componentDidMount` や他のライフサイクルメソッドのメンタルモデルは別であることです。なので、それぞれのライフサイクルメソッドの代用を探そうとすると余計に混乱してしまいます。効率的になるためには「エフェクトで考える」必要があり、そのメンタルモデルはライフサイクルイベントに反応することではなく props や state の変化を DOM にシンクロさせる、という方に近いです。

**🤔 `useEffect` 内で正確に非同期処理を行う方法とは？ `[]` ってなに？**

この[記事](https://www.robinwieruch.de/react-hooks-fetch-data/)を参考にしてみると良いでしょう。最後まで読むように！この記事ほど長くはありません。`[]`は、エフェクトは React のデータフローに携わる値をなに一つ使用していないので、一度だけ実行しても良いということを示していてます。ですが値が実際にエフェクト内で*使用*されている場合はバグの根源ともなります。依存関係を解消して正しく値を省くには複数のテクニック（主に `useReducer` と `useCallback` ）を用いる必要があります。

**🤔 関数をエフェクトの依存関係として記すべき？**

推薦される方法としては props や state を必要としない関数は*コンポーネント外*にホイスティングして、エフェクトでしか使われない関数は*エフェクト内*に入れる方法です。しかしそのあとにもエフェクトがレンダースコープ内の関数を使うことがあるのであれば（props からの関数も含む）、 `useCallback` で関数が定義されている場所をラップしてそのプロセスをリピートします。なぜそれが大事かというと、関数は props や state を*見る*ことができるので、React のデータフローに携わるからです。詳しくは[FAQ](https://reactjs.org/docs/hooks-faq.html#is-it-safe-to-omit-functions-from-the-list-of-dependencies)を参照してください。

**🤔 非同期処理の無限ループがたまに起こるのはなぜ？**

エフェクト内で非同期処理を依存関係を表す第二引数を与えないで実行すると起こります。第二引数がない場合、エフェクトは毎 render 時に走り、内部で state をセットしてると再度エフェクトをトリガーするからです。依存関係を表す第二引数に*常に*変わる値が入ってる場合でも無限ループは起きます。どれが問題の原因かは依存配列の中から値を一つ一つ削除していくことによって分かります。ですが、エフェクト内で使用してる値を依存配列から取り出したり（もしくは闇雲に `[]` を指定したり）するのは大概に場合、正しくない直し方です。その代わり、問題の根源から直していきましょう。例えば、関数などがこの問題を起こしがちで、エフェクト内に定義するか、ホイスティングするか `useCallback` でラップすると良いかもしれません。オブジェクトの再生成を阻止するために使われる `useMemo` も同じような用途で使えます。

**🤔 古い state か props がエフェクト内にたまに入るのはなぜ？**

エフェクトは必ず定義された render の props と state を見ることができます。この方法は[バグを阻止するのに有効](/how-are-function-components-different-from-classes/)ですが、厄介と感じるケースもあります。その場合は、明確に値を mutable ref に保存すると良いでしょう（リンクされている記事の最後の方で説明してます）。もし古い render からの props や state を参照していて期待していない場合は、依存配列に何か入れ忘れている可能性があります。この[lint ルール](https://github.com/facebook/react/issues/14920)を使って、入れ忘れないように慣れましょう。使い始めて数日経てば、習慣になるはずです。こちらの[FAQ](https://reactjs.org/docs/hooks-faq.html#why-am-i-seeing-stale-props-or-state-inside-my-function)にも答えてるので参照してみてください。

---

この TLDR が役に立ったなら嬉しいです。そうでなければ、深入りしていきましょう。

---

## それぞれの render は独自の props と state を保持している

エフェクトに関して話す前に、レンダーリングについて話す必要があります。

まず、ここにはカウンターがあります。ハイライトされた行を見てください：

```jsx{6}
function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>You clicked {count} times</p>
      <button onClick={() => setCount(count + 1)}>Click me</button>
    </div>
  );
}
```

どういうことでしょう？ `count` は何とか props と state の変更を検知して自動的にアップデートされているのでしょうか？このメンタルモデルは React を学ぶ時の最初の直感としては役に立ちますが、実は[正しくありません](https://overreacted.io/react-as-a-ui-runtime/).

**このサンプルでは、 `count` はただの数字です。** データバインディングやウォッチャーやプロキシなど手の込んだものではありません。古き良きただの数字です：

```jsx
const count = 42;
// ...
<p>You clicked {count} times</p>;
// ...
```

コンポーネントが一番初めに render する際、`useState()` から出力される `count` 変数は `0` です。`setCount(1)`を呼ぶと、React はコンポーネントは再度呼び出します。その際、 `count` は `1` となります：

```jsx{3,11,19}
// 初期 render 時
function Counter() {
  const count = 0; // useState()の戻り値
  // ...
  <p>You clicked {count} times</p>;
  // ...
}

// クリック後、関数が呼び出される
function Counter() {
  const count = 1; // useState()の戻り値
  // ...
  <p>You clicked {count} times</p>;
  // ...
}

// もう一度クリックすると、再度呼ばれる
function Counter() {
  const count = 2; // useState()の戻り値
  // ...
  <p>You clicked {count} times</p>;
  // ...
}
```

**state をアップデートする度、React はコンポーネント関数を呼び出します。それぞれの render 結果は*定数として定義*された `counter` state を*見る*ことができます**

なので、この行は何も特別なデータバインディングをしてるわけではありません：

```jsx
<p>You clicked {count} times</p>
```

**何をしてるかというと、render 結果に数字を組み込んでいるだけです。** この数字は React が提供しています。 `setCount` すると、React は違った `count` の値を使ってコンポーネントを呼び出しています。そして、render 結果にマッチするよう DOM をアップデートしてるのです。

ここで覚えていて欲しいのは `count` 定数は特定の render で時間の経過と共に変化するのではないということです。何が起こってるかというと、コンポーネント関数が呼び出されているのです - そして各 render はそれぞれその render に隔離された `count`値を `見る` ことができるのです。

_（このプロセスについてもっと深掘りしたい場合は[React as a UI Runtime](https://overreacted.io/react-as-a-ui-runtime/)を参照してください。）_

## それぞれの render は独自のイベントハンドラを保持している

ここまでは順調ですね。ではイベントハンドラはどうでしょう？

この例を見てみてください。3 秒後に `count` の値を alert するイベントです：

```jsx{4-8,16-18}
function Counter() {
  const [count, setCount] = useState(0);

  function handleAlertClick() {
    setTimeout(() => {
      alert("You clicked on: " + count);
    }, 3000);
  }

  return (
    <div>
      <p>You clicked {count} times</p>
      <button onClick={() => setCount(count + 1)}>Click me</button>
      <button onClick={handleAlertClick}>アラートを表示</button>
    </div>
  );
}
```

このような手順を踏んだとしましょう：

- count を 3 まで**増量**
- "アラートを表示"を**押下**
- タイムアウトが発火する前に count を 5 まで**増量**

![カウンターデモ](./counter.gif)

アラートは何を表示するでしょう？アラートが表示される時の count state の 5 を表示するでしょうか？それとも押下した時の count state の 3 を表示するでしょうか？

---

_この先ネタバレ_

---

自分で一度[再現してみてください！](https://codesandbox.io/s/w2wxl3yo0l)

もしこの挙動が意味をなさない場合は、もっと現実的な例を想像してみてください：受取人 ID を state に保持するチャットアプリと、送るボタンなど。[この記事](https://overreacted.io/how-are-function-components-different-from-classes/)が理由を深掘りしていますが正解は 3 です。

アラートは押下時の state をキャプチャーします。

_（5 を表示させるような実装をする方法はありますが、今回はデフォルトケースにフォーカスします。メンタルモデルを構築する際は最も容易な方法と避難ハッチを明確に区別する必要があります）_

---

なぜこのような挙動をするのでしょう？

先ほど、 `count` は定数であり呼び出される関数ごとに保持していると議論しました。**関数は何度も呼ばれる（render 毎に一度）が、その都度 `count`値は定数であり何かの値でセットされている（その render の state）** というのは強調する価値があります。

これは React 特有の挙動ではありません。通常の関数も同じような挙動をします：

```jsx{2}
function sayHi(person) {
  const name = person.name;
  setTimeout(() => {
    alert("こんにちは, " + name);
  }, 3000);
}

let someone = { name: "Dan" };
sayHi(someone);

someone = { name: "Yuzhi" };
sayHi(someone);

someone = { name: "Dominic" };
sayHi(someone);
```

この[例](https://codesandbox.io/s/mm6ww11lk8)では、someone という変数が何度も再代入されてます（React 上のどこかと同じように、*現在*のコンポーネント state も代わり得ます。）**ですが、sayHi 関数の中にはローカル name 定数が存在しており、その定数は特定の呼び出しとその引数で与えられた `person` に紐づいています** name 定数はローカルなので、呼び出しごとに隔離されています！結果、タイムアウトが発火される時、それぞれの alert は 引数で与えられた `name` を*覚えて*います。

上の例がなぜイベントハンドラが押下時の `count` を保持してるか説明してくれてます。同じような再代入の方針を採用した場合、それぞれの render は特定の `count` が*見えて*います：

```jsx{3,15,27}
// 初期 render
function Counter() {
  const count = 0; // Returned by useState()
  // ...
  function handleAlertClick() {
    setTimeout(() => {
      alert("You clicked on: " + count);
    }, 3000);
  }
  // ...
}

// 押下されると、コンポーネント関数が呼び出される
function Counter() {
  const count = 1; // Returned by useState()
  // ...
  function handleAlertClick() {
    setTimeout(() => {
      alert("You clicked on: " + count);
    }, 3000);
  }
  // ...
}

// 再押下後、またコンポーネント関数が呼び出される
function Counter() {
  const count = 2; // Returned by useState()
  // ...
  function handleAlertClick() {
    setTimeout(() => {
      alert("You clicked on: " + count);
    }, 3000);
  }
  // ...
}
```

なので、実質的にはそれぞれの render は独自の `handleAlertClick` のバージョンを返しています。そしてそれぞれのバージョンは 独自の `count` を*覚えて*います：

```jsx{6,10,19,23,32,36}
// 初期 render
function Counter() {
  // ...
  function handleAlertClick() {
    setTimeout(() => {
      alert("You clicked on: " + 0);
    }, 3000);
  }
  // ...
  <button onClick={handleAlertClick} />; // 0 が入ってるバージョン
  // ...
}

// 押下されると、コンポーネント関数が呼び出される
function Counter() {
  // ...
  function handleAlertClick() {
    setTimeout(() => {
      alert("You clicked on: " + 1);
    }, 3000);
  }
  // ...
  <button onClick={handleAlertClick} />; // 1 が入ってるバージョン
  // ...
}

// 再押下後、またコンポーネント関数が呼び出される
function Counter() {
  // ...
  function handleAlertClick() {
    setTimeout(() => {
      alert("You clicked on: " + 2);
    }, 3000);
  }
  // ...
  <button onClick={handleAlertClick} />; // 2 が入ってるバージョン
  // ...
}
```

この理由から、この[デモ](https://codesandbox.io/s/w2wxl3yo0l)の中でイベントハンドラは特定の render に属しており、押下するとその特定 render の中の `counter` state を使っているのが分かります。

**特定の render の中では props と state は一生変わりません。** props と state が特定の render に隔離されていて同じということは、それを使用してる値（イベントハンドラも含む）もそうです。その値も特定の render に属しているのです。なので、イベントハンドラ内の非同期関数さえも同じ `count` の値を参照できます。

_注記：上記の例で私は `count` の値を直指定しました。`count` の値は特定の render 内では変わり得ないので、この代入方法は安全です。定数で定義されていて数字です。オブジェクトなども同じように考えて問題ないと思いますが、それは mutate しないことが前提ならば、です。mutate する代わりに新しく作成されたオブジェクトで`setSomething(newObj)`と呼び出すのは安全で、なぜかというと過去の render に属している state は損なわれていないからです。_

## それぞれの render は独自のエフェクトを保持している

この記事はエフェクトに関する記事のはずだったんですが、まだエフェクトのことについて話してませんでしたね！それでは今からそれを正しましょう。どうやら、エフェクトも他と何も変わりません。

このドキュメントにある[例](https://ja.reactjs.org/docs/hooks-effect.html)に戻ってみましょう：

```jsx{4-6}
function Counter() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    document.title = `You clicked ${count} times`;
  });

  return (
    <div>
      <p>You clicked {count} times</p>
      <button onClick={() => setCount(count + 1)}>Click me</button>
    </div>
  );
}
```

**ここであなた質問です。エフェクトはどのようにして最新の `count` state を読むと思いますか？**

データバインディングやウォッチャーがエフェクト関数内で `count` の値をライブアップデートしてたり、もしくは `count` は mutable な変数であり React がうまい具合に最新の値をセットしてるからエフェクト内でも最新の値を参照できてるのだと思うかもしれない。

でもそれは違う。

`count` は定数であり、特定の render に属しているというのは先ほど説明した。ある render に紐づいているイベントハンドラは同じスコープ内に属している `count` の値を参照することができる。エフェクトも同じである。

**「変化」しないエフェクト内で `count` 変数が変化している訳ではありません。 _エフェクト関数そのもの_ が render ごとに異なっているのです**

それぞれのバージョンは特定の render 内の `count` の値を参照することができます：

```jsx{5-8,17-20,29-32}
// 初期 render
function Counter() {
  // ...
  useEffect(
    // 初期 render のエフェクト関数
    () => {
      document.title = `You clicked ${0} times`;
    }
  );
  // ...
}

// 押下されると、コンポーネント関数が呼び出される
function Counter() {
  // ...
  useEffect(
    // 2回目の render のエフェクト関数
    () => {
      document.title = `You clicked ${1} times`;
    }
  );
  // ...
}

// 再押下後、またコンポーネント関数が呼び出される
function Counter() {
  // ...
  useEffect(
    // 3回目の render のエフェクト関数
    () => {
      document.title = `You clicked ${2} times`;
    }
  );
  // ..
}
```

React はあなたが与えたエフェクト関数を覚えており、DOMに変更が走ってブラウザに描画された後に実行されます。

概念的には一つのエフェクト（ドキュメントのタイトルを変える）なのですが、render されるごとに *別の関数* として表されています - そしてそれぞれのエフェクト関数は特定の render に属する props と state を参照することができます。

**概念的に、エフェクトは *render 結果* の一部であると想像してもらってもいいです。**

---

完全に理解してるか確認するために、初期 render で何が起こるかおさらいしましょう：

* **React：** state が `0` の時のUIをちょうだい。
* **あなたのコンポーネント：**
  * これが render 結果だよ：
  `<p>You clicked 0 times</p>`.
  * それと、終わった後にこのエフェクトを実行するのを忘れないでね： `() => { document.title = 'You clicked 0 times' }`.
* **React：** 了解。UIをアップデート中。ねぇブラウザ、DOMに色々追加してるよ
* **ブラウザ：** いいね。画面に描画したよ。
* **React：** 了解。では今から与えられたエフェクトを実行するよ。
  * `() => { document.title = 'You clicked 0 times' }`を実行中

---

ではボタンをクリックしたらどうなるかもおさらいしておこう：

* **あなたのコンポーネント：** ねぇ React, state を `1` にセットして。
* **React：** state が `1` の時のUIをちょうだい。
* **あなたのコンポーネント：**
  * これが render 結果だよ：
  `<p>You clicked 1 times</p>`.
  * それと、終わった後にこのエフェクトを実行するのを忘れないでね： `() => { document.title = 'You clicked 1 times' }`.
* **React：** 了解。UIをアップデート中。ねぇブラウザ、DOMに色々追加してるよ
* **ブラウザ：** いいね。画面に描画したよ。
* **React：** 了解。では今からこの特定の render に属するエフェクトを実行するよ。
  * `() => { document.title = 'You clicked 1 times' }`を実行中

---

## それぞれの render は全てを保持している

**エフェクトは render の後に実行され、概念的にはコンポーネント出力の一部であり、特定の render 内の state と props を参照できるというのは理解していただけたと思う**

思考実験をしてみましょう。このコードについて考えます：

```jsx{4-8}
function Counter() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    setTimeout(() => {
      console.log(`You clicked ${count} times`);
    }, 3000);
  });

  return (
    <div>
      <p>You clicked {count} times</p>
      <button onClick={() => setCount(count + 1)}>
        Click me
      </button>
    </div>
  );
}
```

少し遅らせて複数回クリックすると、ログはどのような結果になるでしょうか？

---

*この先ネタバレ*

---

この質問はひっかけ問題であり直感的ではないと思われるでしょう。ですが違います！特定の render 内に属する `count` の値が順次出力されます。ご自分で一度[試してみてください](https://codesandbox.io/s/lyx20m1ol)

![1, 2, 3, 4, 5 と順次出力される画面録画](./timeout_counter.gif)

「当たり前じゃん！これ以外どのような挙動するの？」と思われるでしょう。

class コンポーネントの `this.state` は、このような挙動をしませんよ。この[コード](https://codesandbox.io/s/kkymzwjqz3)が同じような挙動をすると思うのはよくある勘違いです：

```jsx
  componentDidUpdate() {
    setTimeout(() => {
      console.log(`You clicked ${this.state.count} times`);
    }, 3000);
  }
```

`this.state.count` は特定の render に属する値ではなく、常に最新の count の値を参照します。なので、代わりに `5` が順番に表示されます：

![5, 5, 5, 5, 5 と順次出力される画面録画](./timeout_counter_class.gif)

Hooks は JavaScript のクロージャに頼りきっているのに、class の実装がクロージャとよく関連づけられる[タイムアウト内に違う値が入る不思議な現象](https://wsvincent.com/javascript-closure-settimeout-for-loop/)に苦しむなんて、皮肉ですね。なぜかというと、混同の元は mutation であり、（React は `this.state` を mutate して最新の値を指すようにしてる）クロージャ自体ではありません。

**クロージャは、クローズする値が変わらない場合にとても役に立ちます。基本的に定数を参照するということなので、何も難しく考える必要がありません** そして先ほどにも述べたように、 props と state は特定の render 内では一生変わりません。ちなみに、class のバージョンは直すことができます... [クロージャを使って。](https://codesandbox.io/s/w7vjo07055)

## 流れに逆らう

この時点で明示的に重要なことが言えます。それは、コンポーネント render 内の**全て**の関数（コンポーネント内で定義されてるイベントハンドラ、エフェクト、タイムアウト、APIの呼び出しなどを含む）は定義されてる特定の render 内の props と state をキャプチャーします。

なので、この二つの例は同様の挙動をします：

```jsx{4}
function Example(props) {
  useEffect(() => {
    setTimeout(() => {
      console.log(props.counter);
    }, 1000);
  });
  // ...
}
```

```jsx{2,5}
function Example(props) {
  const counter = props.counter;
  useEffect(() => {
    setTimeout(() => {
      console.log(counter);
    }, 1000);
  });
  // ...
}
```

**props か state を「早めに」コンポーネント内で呼ぼうが呼ばまいが関係ありません。** なぜなら変わらないからです！一つの render 内のスコープでは、 props と state は変わりません。（分割代入するとさらに分かりやすいです。）

ですが、特定の render 内の値ではなく最新の値をエフェクト内で定義されてる callback内で  *使いたい* 場合もありますよね。これを成し遂げる一番簡単な方法、この[記事](https://overreacted.io/how-are-function-components-different-from-classes/)の最後のセクションにも説明されてるように、 refs を使うことです。

ですが、 *未来の* props や state を読みたいということは React の流れに逆らっているというのを用心してください。間違ってはいません（そして時々必要）が、パラダイムから抜け出すという意味であまり
綺麗には見えないかもしれません。これは意図した仕様で、なぜかというとどのコードが脆く、タイミングに頼っているか洗い出しハイライトしてくれる役割を担っています。classes ではこの現象が起きてもあまり明らかにはされません。

こちらが class の動作と同じような動きをする counter の例です：

```jsx{3,6-7,9-10}
function Example() {
  const [count, setCount] = useState(0);
  const latestCount = useRef(count);

  useEffect(() => {
    // mutable な最新の値をセットする
    latestCount.current = count;
    setTimeout(() => {
      // mutable な最新の値を読む
      console.log(`You clicked ${latestCount.current} times`);
    }, 3000);
  });
  // ...
```

![S5, 5, 5, 5, 5 と順次出力される画面録画](./timeout_counter_refs.gif)

React で何かを mutate するという行為は風変わりに見えるかもしれません。ですが、まさにこの方法で React は classes の `this.state` を reassign しています。特定の render でキャプチャーされた props と state とは違い、 `latestCount.current` は特定の callback の値を変わらずに参照できる、とは限りません。定義上は、いつでも mutate 可能なのです。このような理由からデフォルトではなく、自分から選んで使う必要があります。

## では Cleanup はどうでしょう？

[Doc で説明](https://reactjs.org/docs/hooks-effect.html#effects-with-cleanup)されているように、一部のエフェクトは cleanup phase があるかもしれません。サブスクリプションなど、エフェクトを元に戻す役割を果たします。

このコードを見てください：

```jsx
  useEffect(() => {
    ChatAPI.subscribeToFriendStatus(props.id, handleStatusChange);
    return () => {
      ChatAPI.unsubscribeFromFriendStatus(props.id, handleStatusChange);
    };
  });
```

初期 render 時には `props` は `{id: 10}` として、2回目の render 時は `{id: 20}` になるとしましょう。このようなことが起きると思われるでしょう：

* React が `{id: 10}` のエフェクトを cleanup する。
* React が　`{id: 20}` の UI を render する。
* React が `{id: 20}` のエフェクトを実行する。

（ちょっと違います。）

このメンタルモデルでは、re-render 前に cleanup は実行されるので 古い props が見えていると思われるでしょう。そして、新しいエフェクトは re-render 後に実行されるので最新の props が見えていると。ですがこれは class のライフサイクルのメンタルモデルに基づいていて、ここでは **正確ではありません。** 理由を見ていきましょう。

React は[ブラウザが描画した後](https://medium.com/@dan_abramov/this-benchmark-is-indeed-flawed-c3d6b5b6f97f)に初めてエフェクトを実行します。この方法だとスクリーンアップデートをブロックすることがないので、アプリを早くしてくれます。それと同様で、エフェクトの cleanup も遅れて実行されます。 **前のエフェクトは新しい props で re-render されてから cleanup されます：**

* React が　`{id: 20}` の UI を render する。
* ブラウザが描画する。`{id: 20}` の時の UI が画面に表示される。
* **React が `{id: 10}` のエフェクトを cleanup する。**
* React が `{id: 20}` のエフェクトを実行する。

でもどうやって前のエフェクトの cleanup は props が `{id: 20}` に変わって re-render された*後に*実行されてるのに、古い `{id: 10}` の props が見えてるの？と思われるでしょう。

前にも遭遇した問題ですね... 🤔

![デ・ジャヴ (映画マトリックスでの猫のシーン)](./deja_vu.gif)

前のセクションから引用します：

> コンポーネント render 内の**全て**の関数（コンポーネント内で定義されてるイベントハンドラ、エフェクト、タイムアウト、APIの呼び出しなどを含む）は定義されてる特定の render 内の props と state をキャプチャーします。

これで答えは明確ですね！エフェクトの cleanup はどういう意味であろうと最新の値を読んだりしません。エフェクトが定義されている特定の render 内の props を読んでいるのです：

```jsx{8-11}
// 初期 render 時、 props は {id: 10}
function Example() {
  // ...
  useEffect(
    // 初期 render のエフェクト関数
    () => {
      ChatAPI.subscribeToFriendStatus(10, handleStatusChange);
      // 初期 render のエフェクトを cleanup
      return () => {
        ChatAPI.unsubscribeFromFriendStatus(10, handleStatusChange);
      };
    }
  );
  // ...
}

// 2回目の render 時、props は {id: 20}
function Example() {
  // ...
  useEffect(
    // 2回目の render のエフェクト関数
    () => {
      ChatAPI.subscribeToFriendStatus(20, handleStatusChange);
      // 2回目の render のエフェクトを cleanup
      return () => {
        ChatAPI.unsubscribeFromFriendStatus(20, handleStatusChange);
      };
    }
  );
  // ...
}
```

帝国は滅び遺灰に変わり、太陽の外層は削ぎ落とされ白色矮星に変形し、最後の文明は終わりを迎えます。ですが誰も初期 render の cleanup を定義された特定の render 内の `{id: 10}` 以外のものを cleanup させることはできません。

これらの理由により React は描画後エフェクトを実行するのです - デフォルトであなたのアプリを早くするために。古い props はコードが必要な時のために存在はしています。

## ライフサイクルではなく、シンクロ

React の何が好きかっていうと、初期 render の結果記述とアップデートが統一されているところです。これによりプログラムの均質化を防ぐことができます。

このようなコンポーネントがあるとしましょう：

```jsx
function Greeting({ name }) {
  return (
    <h1 className="Greeting">
      Hello, {name}
    </h1>
  );
}
```

`<Greeting name="Dan" />` を render して後に `<Greeting name="Yuzhi" >` に変えようが、直接 `<Greeting name="Yuzhi" />` を render しようが関係ありません。最終的には、どちらのケースでも "Hello, Yuzhi" と出力されます。

よく人は「すべては過程だ。結果ではない」と言います。ですが、 React の場合は逆です。**全ては結果であり、過程ではありません。** これが jQuery の `$.addClass` と `$.removeClass`（過程）などの呼び出しと React で*あるべき* CSS クラスを定義する行為（結果）の違いです。

**React は現在の props と state に応じて DOM をシンクロします。** render 時は mount や update に区別はありません。

エフェクトを同じように考えるのが正解でしょう。**`useEffect` は、React tree 以外のものを props と state に応じて _シンクロ_ してくれます。** 

```jsx{2-4}
function Greeting({ name }) {
  useEffect(() => {
    document.title = 'Hello, ' + name;
  });
  return (
    <h1 className="Greeting">
      Hello, {name}
    </h1>
  );
}
```

これは、*mount/update/unmount* のメンタルモデルとは微妙に異なります。 これはしっかり理解しましょう。**初期 render か否かで違う挙動をするエフェクトを書こうとしてる場合は、React の流れに逆らっています！** もし、結果が *過程* に頼ってしまっている場合は、シンクロに失敗しています。

props A, B, と C と順に render しようが C でいきなり render しようが関係ないはずです。多少違いはあるかもしれませんが（例えば data を fetch している間など）、最終結果は同じであるはずです。

それでも、全てのエフェクトを render *毎*に実行させるのは効率的ではないかもしれません（そして場合によっては無限ループにも繋がります）。

どうしたら解決できるでしょうか？

## React にエフェクトを比較することを教える

この教訓はもう既に DOM 操作で習っています。React は DOM がアップデートされた箇所だけ認識して、全てを触らずに変更点だけアップデートします。

```jsx
<h1 className="Greeting">
  Hello, Dan
</h1>
```

を

```jsx
<h1 className="Greeting">
  Hello, Yuzhi
</h1>
```

へアップデートするとします。この時、 React は二つのオブジェクトを受け取ります：

```jsx
const oldProps = {className: 'Greeting', children: 'Hello, Dan'};
const newProps = {className: 'Greeting', children: 'Hello, Yuzhi'};
```

それぞれの props を比べて、 `children` は変更しているので DOM アップデートは必要ですが `className` は変わっていないので、このような処理をします：

```jsx
domNode.innerText = 'Hello, Yuzhi';
// domNode.classNameは触る必要なし
```

**このような処理をエフェクトでもできるでしょうか？エフェクトを実行する必要がない場合は実行しない、とかできたらいいですよね。**

例えば、state の変更によりコンポーネントが再 render するかもしれません：

```jsx{11-13}
function Greeting({ name }) {
  const [counter, setCounter] = useState(0);

  useEffect(() => {
    document.title = 'Hello, ' + name;
  });

  return (
    <h1 className="Greeting">
      Hello, {name}
      <button onClick={() => setCounter(count + 1)}>
        Increment
      </button>
    </h1>
  );
}
```

ですが、我々のエフェクトは `counter` の state を使用していません。 **このエフェクトは、`document.title` を `name` prop でシンクロさせています。ですが、 `name` prop は変わりません。** なので、 `document.title` を `counter` が変わるごとにリアサインするのは、効率的とは言えません。

React は単純に DOM の違いを勝手に検知できるようにエフェクトも違いを検知できないの？と思いますよね。

```jsx
let oldEffect = () => { document.title = 'Hello, Dan'; };
let newEffect = () => { document.title = 'Hello, Dan'; };
// React はこの二つの関数が同じことをしているということが分かるのか？
```

実はできません。React は一度関数を呼ばないと、その関数が何をしているか推測することはできません。

なので、もし不必要なエフェクトを再実行したくない場合は、依存配列（deps とも言われる）というものを第 2 引数として `useEffect` に渡します：

```jsx{3}
  useEffect(() => {
    document.title = 'Hello, ' + name;
  }, [name]); // Our deps
```

**「関数の戻り値が分からないのは知ってるけど、render scope 内で `name` しか使ってないことを約束するよ」と React に言ってるみたいなものです。**

もし配列内のそれぞれの値が現在と一つ前のエフェクト実行時と同じであれば、シンクロするものがないので React はエフェクトをスキップします：

```jsx
const oldEffect = () => { document.title = 'Hello, Dan'; };
const oldDeps = ['Dan'];

const newEffect = () => { document.title = 'Hello, Dan'; };
const newDeps = ['Dan'];

// React は関数の戻り値を分かることはできないが、deps を比べることはできる。
// この例では、 deps は同じであるため新しいエフェクトを実行せずに済む。
```

もし一つでも deps の値が render ごとに違ったら、エフェクトはスキップされてはならないというのが分かります。シンクロタイムだ！

## React に依存関係の嘘をついてはならない

React に嘘をつくと、後に悪影響を与えることになる。直感的には理屈に合うのだが、class のメンタルモデルを流用して `useEffect` を使う人たちはたくさん見てきました（そして自分も最初は同じでした！）。

```jsx
function SearchResults() {
  async function fetchData() {
    // ...
  }

  useEffect(() => {
    fetchData();
  }, []); // これは適してるのでしょうか？必ずしもそうであるとは限りません - もっと良い方法があります。

  // ...
}
```

*（Hooks の [FAQ](https://ja.reactjs.org/docs/hooks-faq.html#is-it-safe-to-omit-functions-from-the-list-of-dependencies) に詳しく方法を書いています。この例にはまた後で[戻ってきます](#moving-functions-inside-effects)）*

「でも、 mount 時だけに実行したい！」と思うかもしれません。とりあえず今はこれだけ覚えてください： deps を指定する場合、 **コンポーネント内の値がありエフェクトでも使われてる場合は、全て記述してください。** それはコンポーネント内の props, state, そして関数も含みます。

ですが稀に問題を引き起こす場合もあります。例えば、無限 refetch ループに出くわしたり、ソケットが何度も作られたり。 **これらの解決策は対象 deps を配列内から削除することではありません。** 最善の解決策は後ほどお見せします。

ですが解決策を見る前に、なぜ起こるのか探っていきましょう。

## 依存関係に嘘をつくと何が起こるのか

もしエフェクト内で使われてる全ての値が deps に含まれていると、 React はいつエフェクトを再実行するか分かります：

```jsx{3}
  useEffect(() => {
    document.title = 'Hello, ' + name;
  }, [name]);
```

![エフェクトが入れ替わってる様子](./deps-compare-correct.gif)

*（依存する値が render 後に異なるため、エフェクトを再実行します。）*

ですが依存配列を `[]` とした場合、最新のエフェクトは実行されません：

```jsx{3}
  useEffect(() => {
    document.title = 'Hello, ' + name;
  }, []); // 間違い： name が deps に入ってません
```

![エフェクトが入れ替わってる様子](./deps-compare-wrong.gif)

*（依存する値が render 後も同じなので、エフェクトをスキップします。）*

ぱっと見だとこの問題は当たり前だと思うかもしれません。ですが、直感的に class での解決策が思い浮かんで混乱することもあります。

例えば、毎秒 1 づつ increment していくカウンターコンポーネントを作成してるとしましょう。 class のメンタルモデルでは setInterval を一度だけセットして、それを終わり次第 destroy するのが直感的に思い浮かぶでしょう。こちらが実際に実装した[例](https://codesandbox.io/s/n5mjzjy9kl)です。このコードを `useEffect` のメンタルモデルに置き換えると、直感的に `[]` を deps に与えてしまいます。なぜなら一度だけ実行したいからでしょ？

```jsx{9}
function Counter() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setCount(count + 1);
    }, 1000);
    return () => clearInterval(id);
  }, []);

  return <h1>{count}</h1>;
}
```

ですが、この例だと[一度しか increment しません](https://codesandbox.io/s/91n5z8jo7r) 。*あれ？*

あなたのメンタルモデルが「依存配列は再実行したいタイミングを指定させてくれる」だと、この例であなたは自分の存在意義を問うことになるでしょう。intervalなので一度だけ実行 *したい* のに、何が問題を引き起こしているのでしょうか？










