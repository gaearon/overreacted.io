---
title: UIランタイムとしてのReact
date: '2019-02-02'
spoiler: Reactプログラミングモデルの詳細な説明
cta: 'react'
---

ほとんどのチュートリアルでは、UIライブラリとしてReactを紹介しています。 React **は** UIライブラリであるため、これは理にかなっています。 それは文字通りタグラインが言っていることです！

![Reactホームページのスクリーンショット：「ユーザーインターフェースを構築するためのJavaScriptライブラリ」](./react.png)

以前、 [ユーザーインターフェース](/the-elements-of-ui-engineering/) を作成する際の課題について書きました。しかし、この投稿では、Reactについて別の方法で説明しています。 [プログラミングランタイム](https://en.wikipedia.org/wiki/Runtime_system) としてです。

**この投稿では、ユーザーインターフェースの作成については何も教えていません。** しかし、Reactプログラミングモデルをより深く理解するのに役立つかもしれません。

---

**注：Reactを_学習_している場合は、代わりに [公式ドキュメント](https://reactjs.org/docs/getting-started.html#learn-react) を確認してください。**

<font size="60">⚠️</font>

**この記事は初心者向けではありません。** この投稿では、第一原理からのReactプログラミングモデルのほとんどについて説明します。使い方は説明しません。どのように動作するかだけを説明します。

これは、Reactで選択されたいくつかのトレードオフについて質問した経験豊富なプログラマーや他のUIライブラリに取り組んでいる人々を対象としています。お役に立てば幸いです。

**多くの人々は、これらのトピックのほとんどを考えずに、何年もの間Reactをうまく使用しています。** これは間違いなく、 [デザイナー中心の見解](http://mrmrs.cc/writing/developing-ui/) ではなく、プログラマー中心のReactの見解です。しかし、両方のリソースを持っていても損はないと思います。

では、さっそく行ってみましょう！

---

## ホストツリー

一部のプログラムは数値を出力します。他のプログラムはテキストを出力します。多くの場合、さまざまな言語とそのランタイムが特定のユースケースのセットに合わせて最適化されており、Reactもその例外ではありません。

Reactプログラムは通常、 **時間の経過とともに変化する可能性のあるツリー** を出力します。 それは、 [DOMツリー](https://www.npmjs.com/package/react-dom) 、 [iOS階層](https://developer.apple.com/library/archive/documentation/General/Conceptual/Devpedia-CocoaApp/View%20Hierarchy.html) 、 [PDFプリミティブ](https://react-pdf.org/) のツリー、または [JSONオブジェクト](https://reactjs.org/docs/test-renderer.html) のツリーである可能性があります。ただし、通常は、UIを使用して表現する必要があります。DOMやiOSなど、Reactの外部のホスト環境の一部であるため、これを「ホストツリー」と呼びます。ホストツリーには通常、 [それの](https://developer.mozilla.org/en-US/docs/Web/API/Node/appendChild) [独自の](https://developer.apple.com/documentation/uikit/uiview/1622616-addsubview) 命令型APIがあります。Reactはその上のレイヤーです。

では、Reactは何に役立つのでしょうか？非常に抽象的には、相互作用、ネットワーク応答、タイマーなどの外部イベントに応答して、複雑なホストツリーを予測どおりに操作するプログラムを作成するのに役立ちます。

特化したツールは、特定の制約を課すことで、その恩恵を受けられる場合、汎用的なツールよりも効果的です。Reactは次の2つの原則に賭けています。

* **安定性** ホストツリーは比較的安定しており、ほとんどの更新で全体的な構造が根本的に変わることはありません。 アプリがすべてのインタラクティブ要素を毎秒完全に異なる組み合わせに再配置した場合、使用するのは困難になります。そのボタンはどこに行きましたか？画面がちらつくのはなぜですか？

* **規則性** ホストツリーは、ランダムな形状ではなく、一貫して表示および動作するUIパターン（ボタン、リスト、アバターなど）に分割できます。

**これらの原則は、ほとんどのUIに当てはまります。** ただし、出力に安定した「パターン」がない場合、Reactは不適切です。たとえば、ReactはTwitterクライアントの作成に役立つ場合がありますが、 [3Dパイプスクリーンセーバー](https://www.youtube.com/watch?v=Uzx9ArZ7MUU) にはあまり役立ちません。

## ホストインスタンス

ホストツリーはノードで構成されます。それらを「ホストインスタンス」と呼びます。

DOM環境では、ホストインスタンスは通常のDOMノードです — `document.createElement('div')`を呼び出したときに取得するオブジェクトのように. iOSでは、ホストインスタンスはJavaScriptからネイティブビューを一意に識別する値である可能性があります。

ホストインスタンスには独自のプロパティがあります （例： `domNode.className`または`view.tintColor`）。また、子として他のホストインスタンスが含まれる場合もあります。

（これはReactとは何の関係もありません。ホスト環境について説明しています。）

通常、ホストインスタンスを操作するためのAPIがあります。たとえば、DOMは `appendChild`、` removeChild`、 `setAttribute`などのAPIを提供します。Reactアプリでは、通常、これらのAPIを呼び出しません。それがReactの役目だからです。

## レンダラー

*レンダラー* は、Reactに特定のホスト環境と通信し、そのホストインスタンスを管理するように教えます。React DOM、React Native、さらには [Ink](https://mobile.twitter.com/vadimdemedes/status/1089344289102942211) もReactレンダラーです。 [独自のReactレンダラーを作成すること](https://github.com/facebook/react/tree/master/packages/react-reconciler) もできます。

Reactレンダラーは2つのモードのいずれかで動作できます。

レンダラーの大部分は、「 mutating 」モードを使用するように作成されています。このモードでは、DOMは次のような仕組みで動作します。ノードを作成し、そのプロパティを設定し、後でノードに子を追加または削除します。ホストインスタンスは完全に変更可能です。

Reactは「 [persistent](https://en.wikipedia.org/wiki/Persistent_data_structure) 」モードでも機能します。 このモードは、 `appendChild（）`のようなメソッドを提供せず、代わりに親ツリーのクローンを作成し、常に最上位の子を置き換えるホスト環境向けです。ホストツリーレベルでの不変性により、マルチスレッド化が容易になります。 [React Fabric](https://facebook.github.io/react-native/blog/2018/06/14/state-of-react-native-2018) はそれを利用しています。

Reactユーザーとして、これらのモードについて考える必要はありません。Reactは、あるモードから別のモードへの単なるアダプターではないことを強調したいと思います。その有用性は、ターゲットの低レベルビューAPIパラダイムと直交しています。

## React要素

ホスト環境では、ホストインスタンス（DOMノードなど）が最小の構成要素です。Reactでは、最小の構成要素は *React要素* です。

React要素はプレーンなJavaScriptオブジェクトです。 ホストインスタンスを *記述* できます。

```jsx
// JSXは、これらのオブジェクトのシンタックスシュガーです。
// <button className="blue" />
{
  type: 'button',
  props: { className: 'blue' }
}
```

React要素は軽量で、ホストインスタンスが関連付けられていません。繰り返しますが、これは画面に表示したいものの *説明* にすぎません。

ホストインスタンスと同様に、次のようにReact要素はツリーを形成できます。

```jsx
// JSXは、これらのオブジェクトのシンタックスシュガーです。
// <dialog>
//   <button className="blue" />
//   <button className="red" />
// </dialog>
{
  type: 'dialog',
  props: {
    children: [{
      type: 'button',
      props: { className: 'blue' }
    }, {
      type: 'button',
      props: { className: 'red' }
    }]
  }
}
```

*(注：この説明にとって重要ではない [いくつかのプロパティ](/why-do-react-elements-have-typeof-property/) を省略しました。)*

ただし、 **React要素には独自の永続的なIDがない** ことに注意してください。それらは常に再作成され、破棄されることが意図されて作られています。

React要素はイミュータブルです。たとえば、React要素の子やプロパティを変更することはできません。後で別の何かをレンダリングしたい場合は、一から作成された新しいReact要素ツリーでそれを *記述* します。

私はReact要素を映画のフレームのようなものと考えるのが好きです。これらは、特定の時点でUIがどのように見えるかをキャプチャします。それらは変わりません。

## エントリーポイント

各Reactレンダラーには「エントリーポイント」があります。これは、コンテナホストインスタンス内に特定のReact要素ツリーをレンダリングするよう、Reactに指示するためのAPIです。

たとえば、ReactDOMのエントリポイントは次のような`ReactDOM.render`です。

```jsx
ReactDOM.render(
  // { type: 'button', props: { className: 'blue' } }
  <button className="blue" />,
  document.getElementById('container')
);
```

私たちが`ReactDOM.render(reactElement, domContainer)`と言うとき、私たちは次のことを意味します。 **「React様、`domContainer`ホストツリーを私の`reactElement`と一致させてください」**

Reactは `reactElement.type`（この例では`'button'`）を見て、ReactDOMレンダラーにそのホストインスタンスを作成してプロパティを設定するように次のように依頼します。

```jsx{3,4}
// ReactDOMレンダラーのどこか（簡略化されたもの）
function createHostInstance(reactElement) {
  let domNode = document.createElement(reactElement.type);
  domNode.className = reactElement.props.className;
  return domNode;
}
```

この例では、Reactはこれを効果的に次のように実行します。

```jsx{1,2}
let domNode = document.createElement('button');
domNode.className = 'blue';

domContainer.appendChild(domNode);
```

React要素の `reactElement.props.children`に子要素がある場合、Reactは最初のレンダリングでそれらのホストインスタンスも再帰的に作成します。

## 差分検出処理

同じコンテナで `ReactDOM.render()`を2回呼び出すとどうなりますか？

```jsx{2,11}
ReactDOM.render(
  <button className="blue" />,
  document.getElementById('container')
);

// ... 後方 ...

// ボタンホストインスタンスを *置き換える* べきでしょうか？
// それとも単に既存のもののプロパティを更新するだけでしょうか？
ReactDOM.render(
  <button className="red" />,
  document.getElementById('container')
);
```

繰り返しますが、Reactの仕事は、 *ホストツリーを提供されたReact要素ツリーと一致させる* ことです。新しい情報に応じてホストインスタンスツリーをどうするかを理解するプロセスは、 [差分検出処理](https://reactjs.org/docs/reconciliation.html) と呼ばれることもあります。

それについて、2つの方法があります. Reactの簡略化されたバージョンは、次のように既存のツリーを吹き飛ばし、最初から再作成する可能性があります。

```jsx
let domContainer = document.getElementById('container');
// Clear the tree
domContainer.innerHTML = '';
// Create the new host instance tree
let domNode = document.createElement('button');
domNode.className = 'red';
domContainer.appendChild(domNode);
```

しかし、DOMでは、これは遅く、フォーカス、選択、スクロール状態などの重要な情報を失います。代わりに、Reactに次のようなことをさせたいと思います。

```jsx
let domNode = domContainer.firstChild;
// Update existing host instance
domNode.className = 'red';
```

言い換えると、Reactは、既存のホストインスタンスを _更新_ して新しいReact要素と一致させるタイミングと、 _新しい_ 要素を作成するタイミングを決定する必要があります。

これは *同一性* の問題を提起します。React要素は毎回異なる場合がありますが、概念的に同じホストインスタンスを参照するのはいつですか？

この例では、それは簡単です。以前は `<button>`を最初の（そして唯一の）子としてレンダリングしていましたが、同じ場所に再び `<button>`をレンダリングしたいと思います。すでに `<button>`ホストインスタンスがありますが、なぜそれを再作成するのですか？再利用しましょう。

これは、Reactがそれについてどのように考えているかにかなり近いものです。

**ツリー内の同じ場所にある要素タイプが前のレンダリングと次のレンダリングの間で「一致」する場合、Reactは既存のホストインスタンスを再利用します。**

次に示すのは、Reactが何をするかを大まかに示すコメント付きの例です。

```jsx{9,10,16,26,27}
// let domNode = document.createElement('button');
// domNode.className = 'blue';
// domContainer.appendChild(domNode);
ReactDOM.render(
  <button className="blue" />,
  document.getElementById('container')
);

// ホストインスタンスを再利用できますか？はい！ (button → button)
// domNode.className = 'red';
ReactDOM.render(
  <button className="red" />,
  document.getElementById('container')
);

// ホストインスタンスを再利用できますか？いいえ！ (button → p)
// domContainer.removeChild(domNode);
// domNode = document.createElement('p');
// domNode.textContent = 'Hello';
// domContainer.appendChild(domNode);
ReactDOM.render(
  <p>Hello</p>,
  document.getElementById('container')
);

// ホストインスタンスを再利用できますか？はい！ (p → p)
// domNode.textContent = 'Goodbye';
ReactDOM.render(
  <p>Goodbye</p>,
  document.getElementById('container')
);
```

同じヒューリスティックが子ツリーにも使用されます。たとえば、2つの`<button>`が内部にある`<dialog>`を更新すると、Reactは最初に`<dialog>`を再利用するかどうかを決定し、次にこの決定手順を子ごとに繰り返します。

## 条件

要素タイプが更新間で「一致」した場合にのみReactがホストインスタンスを再利用する場合、条件付きコンテンツをレンダリングするにはどうすればよいですか？

最初に入力のみを表示し、その次に、メッセージと入力をレンダリングする例を示します。

```jsx{12}
// 最初のレンダリング
ReactDOM.render(
  <dialog>
    <input />
  </dialog>,
  domContainer
);

// 次のレンダリング
ReactDOM.render(
  <dialog>
    <p>I was just added here!</p>
    <input />
  </dialog>,
  domContainer
);
```

この例では、`<input>`ホストインスタンスが再作成されます。Reactは要素ツリーをウォークし、次のように以前のバージョンと比較します。

* `dialog → dialog`: ホストインスタンスを再利用できますか？ **はい — タイプが一致します。**
  * `input → p`: ホストインスタンスを再利用できますか？ **いいえ。タイプは変更されました！** 既存の `input`を削除し、新しい` p`ホストインスタンスを作成する必要があります。
  * `(nothing) → input`: 新しい `input`ホストインスタンスを作成する必要があります。

したがって、効率的にReactによって実行される更新コードは次のようになります。

```jsx{1,2,8,9}
let oldInputNode = dialogNode.firstChild;
dialogNode.removeChild(oldInputNode);

let pNode = document.createElement('p');
pNode.textContent = 'I was just added here!';
dialogNode.appendChild(pNode);

let newInputNode = document.createElement('input');
dialogNode.appendChild(newInputNode);
```

*概念的には* `<input>`が `<p>`に *置き換え* られておらず、移動しただけなので、これは素晴らしいことではありません。DOMを再作成したために、選択、フォーカス状態、コンテンツが失われることは望ましくありません。

この問題は簡単に修正できますが（これについては後ほど説明します）、Reactアプリケーションではあまり発生しません。その理由を見るのは興味深いことです。

実際には、 `ReactDOM.render`を直接呼び出すことはめったにありません。代わりに、Reactアプリは次のような機能に分解される傾向があります。

```jsx
function Form({ showMessage }) {
  let message = null;
  if (showMessage) {
    message = <p>I was just added here!</p>;
  }
  return (
    <dialog>
      {message}
      <input />
    </dialog>
  );
}
```

この例では、今説明した問題は発生しません。 JSXの代わりにオブジェクト表記を使用すると、その理由がわかりやすくなる可能性があります。 `dialog`子要素ツリーを見てください。

```jsx{12-15}
function Form({ showMessage }) {
  let message = null;
  if (showMessage) {
    message = {
      type: 'p',
      props: { children: 'I was just added here!' }
    };
  }
  return {
    type: 'dialog',
    props: {
      children: [
        message,
        { type: 'input', props: {} }
      ]
    }
  };
}
```

**`showMessage`が` true`であるか `false`であるかに関係なく、` <input> `は2番目の子であり、レンダリング間でツリーの位置を変更しません。**

`showMessage`が` false`から `true`に変更された場合、Reactは要素ツリーをウォークし、以前のバージョンと比較します。

* `dialog → dialog`: ホストインスタンスを再利用できますか？ **はい — タイプが一致します。**
  * `(null) → p`: 新しい `p`ホストインスタンスを挿入する必要があります。
  * `input → input`: ホストインスタンスを再利用できますか？ **はい — タイプが一致します。**

そして、Reactによって実行されるコードは次のようになります。

```jsx
let inputNode = dialogNode.firstChild;
let pNode = document.createElement('p');
pNode.textContent = 'I was just added here!';
dialogNode.insertBefore(pNode, inputNode);
```

これで、入力状態が失われることはありません。

## Lists

通常、ツリー内の同じ位置にある要素タイプを比較するだけで、対応するホストインスタンスを再利用するか再作成するかを決定できます。

ただし、これは、子の位置が静的であり、並べ替えない場合にのみうまく機能します。上記の例では、 `message`が「穴」になる可能性がありますが、私達は、メッセージの後に入力が続くことと、他に子要素がないことはわかっています。

動的リストでは、順序が同じであるかどうかを確認することはできません。

```jsx
function ShoppingList({ list }) {
  return (
    <form>
      {list.map(item => (
        <p>
          You bought {item.name}
          <br />
          Enter how many do you want: <input />
        </p>
      ))}
    </form>
  )
}
```

ショッピングアイテムの「リスト」が並び替えられた場合、Reactは、内部のすべての「p」要素と「input」要素が同じタイプであると認識し、それらを移動することを認識しません。（Reactの観点からは、 *アイテム自体* が変更されており、順序は変更されていません。）

10個のアイテムを並べ替えるためにReactによって実行されるコードは、次のようになります。

```jsx
for (let i = 0; i < 10; i++) {
  let pNode = formNode.childNodes[i];
  let textNode = pNode.firstChild;
  textNode.textContent = 'You bought ' + items[i].name;
}
```

そのため、Reactはそれらを *並べ直す* のではなく、効果的にそれぞれを *更新* します。これにより、パフォーマンスの問題やバグが発生する可能性があります。たとえば、最初の入力の内容は、ソート *後* も最初の入力に反映されたままになります。これは、概念的にはショッピングリストの異なる商品を参照していても同じです。

**これが、出力に要素の配列を含めるたびに、Reactが `key`と呼ばれる特別なプロパティを指定するように要求する理由です。**

```jsx{5}
function ShoppingList({ list }) {
  return (
    <form>
      {list.map(item => (
        <p key={item.productId}>
          You bought {item.name}
          <br />
          Enter how many do you want: <input />
        </p>
      ))}
    </form>
  )
}
```

`key`は、レンダリング間で親要素内の *位置* が異なっていても、アイテムを *概念的に* 同じであると見なす必要があることをReactに指示します。

Reactが `<form>`内に `<p key ="42">`を検出すると、前のレンダリングにも同じ `<form>`内に `<p key ="42">`が含まれているかどうかがチェックされます。これは、`<form>`の子が順序を変更した場合でも機能します。 Reactは、前のホストインスタンスが存在する場合は同じキーで再利用し、それに応じて兄弟を並べ替えます。

`key`は、`<form>`などの特定の親React要素内でのみ関連することに注意してください。Reactは、異なる親間で同じキーを持つ要素を「一致」させようとはしません。（Reactには、ホストインスタンスを再作成せずに異なる親間で移動するための慣用的なサポートはありません。）

`key`の適切な値は何ですか？これに答える簡単な方法は、次のように尋ねることです。 **順番が変わっても、あるアイテムが「同じ」だと言うのはどんな時ですか？** たとえば、ショッピングリストでは、商品IDが兄弟間で一意に識別されます。

## コンポーネント

ここまでですでに、React要素を返す関数は見てきました。

```jsx
function Form({ showMessage }) {
  let message = null;
  if (showMessage) {
    message = <p>I was just added here!</p>;
  }
  return (
    <dialog>
      {message}
      <input />
    </dialog>
  );
}
```

それらは *コンポーネント* と呼ばれます。ボタン、アバター、コメントなどの独自の「ツールボックス」を作成できます。コンポーネントはReactのパンとバターです。

コンポーネントは、オブジェクトハッシュという1つの引数を取ります。「props」（「properties」の略）が含まれています。ここで、`showMessage`はpropです。それらは名前付き引数のようなものです。

## 純粋

Reactコンポーネントは、propsに関して純粋であると見なされます。

```jsx
function Button(props) {
  // 🔴 動作しません
  props.isActive = true;
}
```

一般に、Reactではミューテーションは慣用的ではありません。 （イベントに応じてUIを更新する慣用的な方法については後で詳しく説明します。）

ただし、 *ローカルミューテーション* は全く問題ありません。

```jsx{2,5}
function FriendList({ friends }) {
  let items = [];
  for (let i = 0; i < friends.length; i++) {
    let friend = friends[i];
    items.push(
      <Friend key={friend.id} friend={friend} />
    );
  }
  return <section>{items}</section>;
}
```

*レンダリング中に* `items`を作成しましたが、他のコンポーネントがそれを「参照する」わけではないので、レンダリング結果の一部として渡す前に、好きなだけ変更できます。ローカルミューテーションを回避するためにコードを歪める必要もありません。

同様に、遅延初期化は完全に「純粋」ではありませんが、問題はありません。

```jsx
function ExpenseForm() {
  // 他のコンポーネントに影響を与えなければ問題なし:
  SuperCalculator.initializeIfNotReady();

  // レンダリングの続き...
}
```

コンポーネントを複数回呼び出すことが安全であり、他のコンポーネントのレンダリングに影響を与えない限り、Reactは、厳密なFPの意味で100％純粋であるかどうかを気にしません。Reactでは純粋性よりも [冪等性](https://stackoverflow.com/questions/1077412/what-is-an-idempotent-operation) が重要です。


とはいえ、Reactコンポーネントでは、ユーザーに直接表示される副作用は許可されていません。つまり、コンポーネント関数を *呼び出す* だけでは、画面に変化が生じることはありません。

## 再帰

他のコンポーネントのコンポーネントをどのように *使用* しますか？コンポーネントは関数であるため、次のように呼び出すことが *できます* 。

```jsx
let reactElement = Form({ showMessage: true });
ReactDOM.render(reactElement, domContainer);
```

ただし、これはReactランタイムでコンポーネントを使用する慣用的な方法では *ありません* 。

代わりに、コンポーネントを使用する慣用的な方法は、これまでに見たのと同じメカニズムであるReact要素を使用することです。 **これは、コンポーネント関数を直接呼び出すのではなく、後でReactに呼び出させることを意味します。**

```jsx
// { type: Form, props: { showMessage: true } }
let reactElement = <Form showMessage={true} />;
ReactDOM.render(reactElement, domContainer);
```

そして、React内のどこかで、コンポーネントは次のように呼び出されます。

```jsx
// React内のどこか
let type = reactElement.type; // Form
let props = reactElement.props; // { showMessage: true }
let result = type(props); // Whatever Form returns
```

コンポーネント関数名は、慣習的に大文字になっています。 JSXトランスフォームが `<form>`ではなく `<Form>`を検出すると、オブジェクトの`type`自体が文字列ではなく識別子になります。

```jsx
console.log(<form />.type); // 'form' string
console.log(<Form />.type); // Form function
```

グローバル登録メカニズムはありません。`<Form>`と入力するときは、文字通り`Form`を名前で参照します。`Form`がローカルスコープに存在しない場合、変数名が正しくない場合と同じようにJavaScriptエラーが表示されます。

**さて、要素タイプが関数の場合、Reactは何をしますか？Reactはコンポーネントを呼び出し、コンポーネントにレンダリングする要素を尋ねます。**

このプロセスは再帰的に続行され、 [ここ](https://reactjs.org/blog/2015/12/18/react-components-elements-and-instances.html) で詳細に説明されています。要するに、それは次ように見えます。

- **You:** `ReactDOM.render(<App />, domContainer)`
- **React:** ねえ`App`、あなたは何にレンダリングしますか？
  - `App`: `<Content>`を中に入れて`<Layout>`をレンダリングします。
- **React:** ねえ`Layout`、あなたは何にレンダリングしますか？
  - `Layout`: 私は子供たちを`<div>`でレンダリングします。私の子供は`<Content>`だったので、それは`<div>`に入ると思います。
- **React:** ねえ`<Content>`、あなたは何にレンダリングしますか？
  - `Content`: テキストと`<Footer>`を含む`<article>`をレンダリングします。
- **React:** ねえ`<Footer>`、あなたは何にレンダリングしますか？
  - `Footer`: 少しテキストを加えた`<footer>`をレンダリングします。
- **React:** はい。それではこちらをどうぞ。

```jsx
// 結果としてのDOM構造
<div>
  <article>
    Some text
    <footer>some more text</footer>
  </article>
</div>
```

これが、調整が再帰的であると言う理由です。 Reactが要素ツリーをwalkするとき、`type`がコンポーネントである要素に出会う可能性があります。それを呼び出し、返されたReact要素のツリーを下っていきます。最終的にはコンポーネントが不足し、Reactはホストツリーで何を変更するかを認識します。

ここでも、すでに説明したのと同じ調整ルールが適用されます。同じ位置にある`type`（インデックスとオプションの`key`によって決定される）が変更された場合、Reactは内部のホストインスタンスを破棄し、それらを再作成します。

## 制御の反転

疑問に思われるかもしれませんが、コンポーネントを直接呼び出さないのはなぜですか？なぜ`Form()`ではなく`<Form>`を書くのですか？

**Reactは、コンポーネントを再帰的に呼び出した後にReactの要素ツリーを見るだけではなく、コンポーネントについて「知っている」方がよりよく機能します。**

```jsx
// 🔴 Reactはレイアウトと記事が存在することを知りません。
// あなたはそれらを呼び出します。
ReactDOM.render(
  Layout({ children: Article() }),
  domContainer
)

// ✅ Reactはレイアウトと記事が存在することを知っています。
// Reactはそれらを呼び出します。
ReactDOM.render(
  <Layout><Article /></Layout>,
  domContainer
)
```

これは、 [制御の反転](https://en.wikipedia.org/wiki/Inversion_of_control) の典型的な例です。 Reactにコンポーネントの呼び出しを制御させることで、いくつかの興味深い特性が得られます。

* **コンポーネントは関数以上のものになります。** Reactは、ツリー内のコンポーネントIDに関連付けられている *ローカルのstate* などの機能でコンポーネントの関数を拡張できます。優れたランタイムは、目前の問題に一致する基本的な抽象化を提供します。すでに述べたように、Reactは、UIツリーをレンダリングし、インタラクションに応答するプログラムを特に対象としています。コンポーネントを直接呼び出す場合は、これらの機能を自分で作成する必要があります。

* **コンポーネントタイプは差分検出の対象になります。** Reactにコンポーネントを呼び出させることで、ツリーの概念構造についても詳しく説明できます。たとえば、`<Feed>`のレンダリングから`<Profile>`ページに移動する場合、Reactは、`<button>`を`<p>`に置き換える場合と同様に、その中のホストインスタンスを再利用しようとはしません。すべての状態がなくなります。これは通常、概念的に異なるビューをレンダリングする場合に適しています。`<PasswordForm>`と`<MessengerChat>`の間に、ツリー内の `<input>` がたまたま「配置された」としても、入力状態を保持したいとは思わないでしょう。

* **Reactは差分検出を遅らせる可能性があります。** Reactがコンポーネントの呼び出しを制御する場合、多くの興味深いことができます。たとえば、大きなコンポーネントツリーを再レンダリングしても [メインスレッドがブロックされない](https://reactjs.org/blog/2018/03/01/sneak-peek-beyond-react-16.html) ように、ブラウザにコンポーネント呼び出しの間に何らかの作業を行わせることができます。 Reactの大部分を再実装せずにこれを手動で調整することは困難です。

* **より良いデバッグの話ができるようになります。** コンポーネントがライブラリが認識している第一級オブジェクトである場合、開発のイントロスペクションのための [リッチな開発者ツール](https://github.com/facebook/react-devtools) を構築できます。

コンポーネント関数を呼び出すReactの最後の利点は、遅延評価です。これが何を意味するのか見てみましょう。

## 遅延評価

JavaScriptで関数を呼び出す場合、引数は呼び出す前に評価されます。

```jsx
// (2) これは2番目に計算されます
eat(
  // (1) これが最初に計算されます
  prepareMeal()
);
```

JavaScript関数には暗黙の副作用がある可能性があるため、これは通常、JavaScript開発者が期待することです。関数を呼び出した場合は驚くべきことですが、その結果がJavaScriptで何らかの形で「使用」されるまで実行されません。

ただし、Reactコンポーネントは [比較的](#purity) 純粋です。結果が画面に表示されないことがわかっている場合は、実行する必要はまったくありません。

このコンポーネントが`<Comments>`を`<Page>`の中に入れていると考えてください。

```jsx{11}
function Story({ currentUser }) {
  // return {
  //   type: Page,
  //   props: {
  //     user: currentUser,
  //     children: { type: Comments, props: {} }
  //   }
  // }
  return (
    <Page user={currentUser}>
      <Comments />
    </Page>
  );
}
```

`Page`コンポーネントは、それに与えられた子をいくつかの`Layout`内にレンダリングできます。

```jsx{4}
function Page({ user, children }) {
  return (
    <Layout>
      {children}
    </Layout>
  );
}
```

*（JSXの`<A><B /><A>`は`<A children={<B />} />`と同じです。）*

しかし、それがearly returnを持っている場合はどうなりますか？

```jsx{2-4}
function Page({ user, children }) {
  if (!user.isLoggedIn) {
    return <h1>Please log in</h1>;
  }
  return (
    <Layout>
      {children}
    </Layout>
  );
}
```

`Comments()`を関数として呼び出すと、`Page`がそれらをレンダリングするかどうかに関係なく、すぐに実行されます。

```jsx{4,8}
// {
//   type: Page,
//   props: {
//     children: Comments() // 常に実行されます！
//   }
// }
<Page>
  {Comments()}
</Page>
```

ただし、React要素を渡した場合、自分で`Comments`を実行することはありません。

```jsx{4,8}
// {
//   type: Page,
//   props: {
//     children: { type: Comments }
//   }
// }
<Page>
  <Comments />
</Page>
```

これにより、Reactはいつ呼び出すかどうかを決定できます。`Page`コンポーネントがその`children`プロパティを無視し、代わりに `<h1>ログインしてください<h1>`をレンダリングする場合、Reactは`Comments`関数を呼び出そうとさえしません。ポイントは何ですか？

これは、破棄される不要なレンダリング作業を回避し、コードの脆弱性を軽減するため、優れています。（ユーザーがログアウトしたときに「コメント」がスローされるかどうかは関係ありません。呼び出されません。）

## State

[先ほど](#reconciliation) 同一性と、ツリー内の要素の概念的な「位置」が、ホストインスタンスを再利用するか新しいインスタンスを作成するかをReactにどのように指示するかについて説明してきました。ホストインスタンスは、フォーカス、選択、入力など、あらゆる種類のローカルstateを持つことができます。概念的に同じUIをレンダリングする更新の間、この状態を保持する必要があります。また、概念的に異なるもの（`<SignupForm>`から`<MessengerChat>`への移動など）をレンダリングするときに、予測どおりにそれを破棄したいと思います。

**ローカルstateは非常に便利なので、Reactでは *独自の* コンポーネントにもそれを持たせることができます。** コンポーネントは引き続き機能ですが、ReactはUIに役立つ機能でコンポーネントを拡張します。ツリー内の位置に関連付けられたローカルstateは、これらの機能の1つです。

これらの機能を *フック* と呼びます。たとえば、 `useState`はフックです。

```jsx{2,6,7}
function Example() {
  const [count, setCount] = useState(0);

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

現在のstateとそれを更新する関数の2つの値を返します。

[配列の分割代入](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment#Array_destructuring) 構文を使用すると、状態変数に任意の名前を付けることができます。たとえば、このペアを「count」と「setCount」と呼びましたが、「banana」と「setBanana」である可能性があります。以下のテキストでは、特定の例での実際の名前に関係なく、`setState`を使用して2番目の値を参照します。

*（Reactが提供する`useState`やその他のフックについて詳しくは [こちら](https://reactjs.org/docs/hooks-intro.html) をご覧ください。）*

## 一貫性

差分検出処理自体を [ノンブロッキング](https://www.youtube.com/watch?v=mDdgfyRB5kg) の処理のかたまりに分割する場合でも、実際のホストツリーの操作は、同期して行う必要があります。このようにして、ユーザーに半分更新されたUIが表示されないようにし、ユーザーに表示されるべきではない中間状態に対してブラウザが不要なレイアウトとスタイルの再計算を実行しないようにすることができます。

これが、Reactがすべての作業を「レンダリングフェーズ」と「コミットフェーズ」に分割する理由です。 *レンダリングフェーズ* は、Reactがコンポーネントを呼び出して差分検出処理を実行するフェーズです。中断しても安全であり、 [将来的には](https://reactjs.org/blog/2018/03/01/sneak-peek-beyond-react-16.html) 非同期になります。 *コミットフェーズ* は、Reactがホストツリーに対して操作するフェーズです。常に同期的になります。

## メモ化

親が`setState`を呼び出して更新をスケジュールすると、デフォルトではReactはその子サブツリー全体の差分検出をします。これは、Reactが親の更新が子に影響を与えるかどうかを知ることができず、デフォルトでは、Reactが一貫性を保つことを選択するためです。これは非常に高くついているように聞こえるかもしれませんが、実際には、中小規模のサブツリーでは問題になりません。

ツリーが深くなったり広くなったりした場合は、次のように、Reactにサブツリーを [メモ化](https://en.wikipedia.org/wiki/Memoization) させて、propの変更時に以前のレンダリング結果を再利用するように指示できます。

```jsx{5}
function Row({ item }) {
  // ...
}

export default React.memo(Row);
```

これで、親の`<Table>`コンポーネントの`setState`は、`item`が前回レンダリングされた`item`と参照的に等しい` Row`の差分検出処理をスキップします。

[`useMemo（）`フック](https://reactjs.org/docs/hooks-reference.html#usememo) を使用すると、個々の表現のレベルで詳細なメモ化を行うことができます。キャッシュはコンポーネントツリーの位置に対してローカルであり、ローカルstateとともに破棄されます。最後のアイテムを1つだけ保持します。

Reactは、デフォルトではコンポーネントを意図的にメモ化することはありません。多くのコンポーネントは常に異なるpropsを受け取るため、それらをメモ化すると純損失になります。

## 生のモデル

皮肉なことに、Reactはきめ細かい更新のために「反応性」があるシステムを使用していません。つまり、上部の更新は、変更の影響を受けるコンポーネントだけを更新するのではなく、差分検出処理をトリガーします。

これは意図的な設計上の決定です。 [インタラクティブまでの時間](https://calibreapp.com/blog/time-to-interactive/) は、コンシューマーWebアプリケーションの重要な指標であり、モデルをトラバースしてきめ細かいリスナーを設定するには、その貴重な時間が費やされます。さらに、多くのアプリでは、インタラクションによって更新が小規模（ボタンホバー）または大規模（ページ遷移）になる傾向があります。この場合、きめ細かいサブスクリプションはメモリリソースの浪費になります。

Reactの基本的な設計方針の1つは、生のデータを扱うことです。ネットワークから受け取ったたくさんのJavaScriptオブジェクトがあれば、前処理なしでコンポーネントに直接取り込むことができます。どのプロパティにアクセスできるかという問題もなければ、構造が少し変わっただけで予期せぬパフォーマンスの低下が起こることもありません。ReactのレンダリングはO(*モデルサイズ*)ではなくO(*ビューサイズ*)であり、 [ウィンドウ](https://react-window.now.sh/#/examples/list/fixed-size) を使用してビューサイズを大幅に削減できます。

細かいサブスクリプションが有効なアプリケーションには、株式相場表示などがあります。これは、「すべてが常に同時に更新される」という稀な例です。命令的なエスケープハッチはこのようなコードの最適化に役立ちますが、Reactはこのユースケースには最適ではないかもしれません。それでも、Reactの上に独自のきめ細かなサブスクリプションシステムを実装することは可能です。

**きめ細かいサブスクリプションや「反応性」があるシステムでも解決できない一般的なパフォーマンスの問題があることに注意してください。** たとえば、ブラウザをブロックせずに、 *新しい* ディープツリー（ページ遷移ごとに発生）をレンダリングします。変更の追跡は高速化されません。サブスクリプションを設定するためにより多くの作業を行う必要があるため、速度が低下します。もう1つの問題は、ビューのレンダリングを開始する前にデータを待機する必要があることです。 Reactでは、 [同時レンダリング](https://reactjs.org/blog/2018/03/01/sneak-peek-beyond-react-16.html) でこれらの問題の両方を解決することを目指しています。

## バッチ処理

複数のコンポーネントが、同じイベントに応答してstateを更新したい場合があります。この例は説明のために作られたものですが、一般的なパターンを示しています。

```jsx{4,14}
function Parent() {
  let [count, setCount] = useState(0);
  return (
    <div onClick={() => setCount(count + 1)}>
      Parent clicked {count} times
      <Child />
    </div>
  );
}

function Child() {
  let [count, setCount] = useState(0);
  return (
    <button onClick={() => setCount(count + 1)}>
      Child clicked {count} times
    </button>
  );
}
```

イベントがディスパッチされると、子の`onClick`が最初に起動します（`setState`がトリガーされます）。次に、親は独自の`onClick`ハンドラーで`setState`を呼び出します。

Reactが`setState`呼び出しに応答してコンポーネントをすぐに再レンダリングした場合、子を2回レンダリングすることになります。

```jsx{4,8}
*** Entering React's browser click event handler ***
Child (onClick)
  - setState
  - re-render Child // 😞 unnecessary
Parent (onClick)
  - setState
  - re-render Parent
  - re-render Child
*** Exiting React's browser click event handler ***
```

最初の「子」のレンダリングは無駄になります。また、「親」が更新された状態に基づいていくつかの異なるデータを渡す可能性があるため、Reactに「子」のレンダリングを2回スキップさせることはできませんでした。

**これが、Reactがイベントハンドラー内で更新をバッチ処理する理由です。**

```jsx
*** Entering React's browser click event handler ***
Child (onClick)
  - setState
Parent (onClick)
  - setState
*** Processing state updates                     ***
  - re-render Parent
  - re-render Child
*** Exiting React's browser click event handler  ***
```

コンポーネントでの`setState`呼び出しは、すぐには再レンダリングを引き起こしません。代わりに、Reactは最初にすべてのイベントハンドラーを実行し、次にそれらのすべての更新をまとめてバッチ処理する単一の再レンダリングをトリガーします。

バッチ処理はパフォーマンスには優れていますが、次のようなコードを書くと驚くことになります。

```jsx
  const [count, setCount] = useState(0);

  function increment() {
    setCount(count + 1);
  }

  function handleClick() {
    increment();
    increment();
    increment();
  }
```

`count`を`0`に設定して開始すると、これらは3つの`setCount(1)`呼び出すことになります。これを修正するために、 `setState`は「アップデータ」関数を受け入れるオーバーロードを提供します。

```jsx
  const [count, setCount] = useState(0);

  function increment() {
    setCount(c => c + 1);
  }

  function handleClick() {
    increment();
    increment();
    increment();
  }
```

Reactはアップデータ関数をキューに入れ、後でそれらを順番に実行し、`count`を`3`に設定して再レンダリングします。

状態ロジックがいくつかの `setState`呼び出しよりも複雑になる場合は、 [`useReducer`フック](https://reactjs.org/docs/hooks-reference.html#usereducer) を使用してローカル状態リデューサーとして表現することをお勧めします。これは、各更新に名前が付けられたこの「アップデータ」パターンの進化のようなものです。

```jsx
  const [counter, dispatch] = useReducer((state, action) => {
    if (action === 'increment') {
      return state + 1;
    } else {
      return state;
    }
  }, 0);

  function handleClick() {
    dispatch('increment');
    dispatch('increment');
    dispatch('increment');
  }
```

`action`引数は何を指定しても構いませんが、オブジェクトを指定するのが一般的です。

## コールツリー

プログラミング言語のランタイムには通常、 [コールスタック](https://medium.freecodecamp.org/understanding-the-javascript-call-stack-861e41ae61d4) があります。関数`a()`が`b()`を呼び出し、それ自体が`c()`を呼び出す場合、JavaScriptエンジンのどこかに、`[a, b, c]`のようなデータ構造があります。とは、次に実行するコードです。`c`を終了すると、そのコールスタックフレームはなくなります。もう必要ありません。`b`に戻ります。`a`を終了するときには、コールスタックは空になっています。

もちろん、React自体はJavaScriptで実行され、JavaScriptのルールに従います。しかし、内部的にReactには、現在レンダリングしているコンポーネントを記憶するための独自の呼び出しスタックがあると想像できます。例えば、`[App, Page, Layout, Article /* we're here */]`。

Reactは、UIツリーのレンダリングを目的としているため、汎用言語ランタイムとは異なります。これらのツリーは、私たちがそれらと相互作用するために「生き続ける」必要があります。最初の`ReactDOM.render()`呼び出しの後、DOMは消えません。

これは比喩を誇張しているかもしれませんが、私はReactコンポーネントを単なる「コールスタック」ではなく「コールツリー」にあると考えたいと思います。 `Article`コンポーネントから「外に出る」とき、そのReactの「コールツリー」フレームは破壊されません。ローカルstateとホストインスタンスへの参照を [どこかに](https://medium.com/react-in-depth/the-how-and-why-on-reacts-usage-of-linked-list-in-fiber-67f1014d0eb7) 保持する必要があります。

これらの「コールツリー」フレームは、ローカルstateとホストインスタンスとともに破棄されますが、 [差分検出処理](#reconciliation) ルールで必要とされた場合に限ります。Reactソースを読んだことがあれば、これらのフレームが [ファイバー](https://en.wikipedia.org/wiki/Fiber_(computer_science)) と呼ばれているのを見たことがあるかもしれません。

ファイバーは、ローカルstateが実際に配置されている場所です。stateが更新されると、Reactは以下のファイバーを差分検出が必要であるとマークし、それらのコンポーネントを呼び出します。

## コンテキスト

Reactでは、物事をpropsとして他のコンポーネントに渡します。場合によっては、コンポーネントの大部分が同じものを必要とします。たとえば、現在選択されているビジュアルテーマなどです。すべてのレベルにそれを渡すのは面倒になります。

Reactでは、これは [コンテキスト](https://reactjs.org/docs/context.html) によって解決されます。これは基本的に、コンポーネントの [動的スコープ](http://wiki.c2.com/?DynamicScoping) のようなものです。これは、何かを上に置き、下にいるすべての子供がそれを参照して、変更されたときに再レンダリングできるようにするワームホールのようなものです。

```jsx
const ThemeContext = React.createContext(
  'light' // フォールバックとしてのデフォルト値
);

function DarkApp() {
  return (
    <ThemeContext.Provider value="dark">
      <MyComponents />
    </ThemeContext.Provider>
  );
}

function SomeDeeplyNestedChild() {
  // 子がレンダリングされる場所によって異なります
  const theme = useContext(ThemeContext);
  // ...
}
```

`SomeDeeplyNestedChild`がレンダリングされると、`useContext(ThemeContext)`はツリー内でその上にある最も近い`<ThemeContext.Provider>`を探し、その`value`を使用します。

（実際には、Reactはレンダリング中にコンテキストスタックを維持します。）

上記に`ThemeContext.Provider`がない場合、`useContext(ThemeContext)`呼び出しの結果は、`createContext()`呼び出しで指定されたデフォルト値になります。この例では、「light」です。

## 副作用

Reactコンポーネントは、レンダリング中に観察可能な副作用があってはならないことを前述しました。しかし、副作用が必要な場合があります。フォーカスの管理、キャンバスへの描画、データソースのサブスクライブなどが必要になる場合があります。

Reactでは、これは副作用を宣言することによって行われます。

```jsx{4-6}
function Example() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    document.title = `You clicked ${count} times`;
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

可能な場合、Reactは、ブラウザーが画面を再描画するまで、副作用の実行を延期します。データソースサブスクリプションのようなコードが [インタラクティブまでの時間](https://calibreapp.com/blog/time-to-interactive/) と [最初のペイントまでの時間](https://developers.google.com/web/tools/lighthouse/audits/first-meaningful-paint) を損なうべきではないので、これは良いことです。（ [めったに使用されない](https://reactjs.org/docs/hooks-reference.html#uselayouteffect) フックがあり、その動作をオプトアウトして同期的に実行できます。避けてください。）

副作用は一度だけ実行されるわけではありません。これらは、コンポーネントがユーザーに初めて表示された後と、コンポーネントが更新された後の両方で実行されます。上記の例の`count`のように、副作用は現在のpropsやstateを含めることができます。

サブスクリプションの場合など、副作用にはクリーンアップが必要な場合があります。それ自体をクリーンアップするために、副作用は次のように関数を返すことができます。

```jsx
  useEffect(() => {
    DataSource.addSubscription(handleChange);
    return () => DataSource.removeSubscription(handleChange);
  });
```

Reactは、この副作用を次に適用する前、およびコンポーネントが破棄される前に、返された関数を実行します。

ときには、すべてのレンダリングで副作用を再実行することが望ましくないことがあります。特定の変数が変更されなかった場合、Reactにエフェクトの適用を [スキップ](https://reactjs.org/docs/hooks-effect.html#tip-optimizing-performance-by-skipping-effects) するように指示できます。

```jsx{3}
  useEffect(() => {
    document.title = `You clicked ${count} times`;
  }, [count]);
```

ただし、これは時期尚早の最適化であることが多く、JavaScriptのクロージャの仕組みに精通していない場合は問題が発生する可能性があります。

たとえば、このコードにはバグがあります。

```jsx
  useEffect(() => {
    DataSource.addSubscription(handleChange);
    return () => DataSource.removeSubscription(handleChange);
  }, []);
```

`[]`は「この副作用を再実行しないでください」ということを示していますが、副作用は、その外部で定義されている`handleChange`で含みます。また、`handleChange`は、任意のpropsまたはstateを参照する場合があります。

```jsx
  function handleChange() {
    console.log(count);
  }
```

副作用を再実行させない場合、`handleChange`は最初のレンダリングからのバージョンをポイントし続け、`count`は常にその中の`0`になります。

これを解決するには、依存関係配列を指定する場合、次のように関数を含め、変更できる **すべて** のものが含まれていることを確認してください。

```jsx{4}
  useEffect(() => {
    DataSource.addSubscription(handleChange);
    return () => DataSource.removeSubscription(handleChange);
  }, [handleChange]);
```

コードによっては、`handleChange`自体がレンダリングごとに異なるため、不要な再サブスクリプションが表示される場合があります。 [`useCallback`](https://reactjs.org/docs/hooks-reference.html#usecallback) フックはそれを助けることができます。または、再サブスクライブさせることもできます。たとえば、ブラウザの `addEventListener` APIは非常に高速であり、これを呼び出さないようにするためにわざわざ苦労することは、かえって問題を引き起こす可能性があります。

*（Reactが提供する `useEffect`やその他のフックについて詳しくは [こちら](https://reactjs.org/docs/hooks-effect.html) をご覧ください。）*

## カスタムフック

`useState`や`useEffect`のようなフックは関数呼び出しであるため、それらを合成して、独自のフックを作成することができます。

```jsx{2,8}
function MyResponsiveComponent() {
  const width = useWindowWidth(); // Our custom Hook
  return (
    <p>Window width is {width}</p>
  );
}

function useWindowWidth() {
  const [width, setWidth] = useState(window.innerWidth);
  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  });
  return width;
}
```

カスタムフックを使用すると、さまざまなコンポーネントで再利用可能なステートフルロジックを共有できます。 *state自体* は共有されないことに注意してください。フックを呼び出すたびに、独自の分離されたstateが宣言されます。

*（独自のフックの作成について詳しくは、 [こちら](https://reactjs.org/docs/hooks-custom.html) をご覧ください。）*

## Static Use Order

`useState`は、「Reactのstate変数」を定義するための構文と考えることができます。もちろん、これは *本当の* 構文ではありません。まだJavaScriptを書いています。しかし、私たちはReactを実行環境として見ていますし、ReactはJavaScriptをUIツリーの記述に合わせて調整しているため、その機能は言語の構文に近くなる場合があります。

`use`が構文 *であった* 場合、それがトップレベルにあることは理にかなっています。

```jsx{3}
// 😉 Note: not a real syntax
component Example(props) {
  const [count, setCount] = use State(0);

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

それを条件やコールバックに入れたり、コンポーネントの外に置いたりすることはどういう意味ですか？

```jsx
// 😉 注：実際の構文ではありません

// これはローカルのstateです...何の？
const [count, setCount] = use State(0);

component Example() {
  if (condition) {
    // 条件が偽の場合はどうなりますか？
    const [count, setCount] = use State(0);
  }

  function handleClick() {
    // 関数を離れるとどうなりますか？
    // これは変数とどう違うのですか？
    const [count, setCount] = use State(0);
  }
```

React状態は、ツリー内のコンポーネントとそのIDに対してローカルです。`use`が実際の構文である場合、コンポーネントのトップレベルにもスコープを設定するのが理にかなっています。


```jsx
// 😉 注：実際の構文ではありません
component Example(props) {
  // ここでのみ有効
  const [count, setCount] = use State(0);

  if (condition) {
    // これは構文エラーになります
    const [count, setCount] = use State(0);
  }
```

これは、`import`がモジュールのトップレベルでのみ機能する方法と似ています。

**もちろん、`use`は実際には構文ではありません。** （それは多くの利益をもたらさず、多くの摩擦を生み出すでしょう。）

ただし、Reactは、フックへのすべての呼び出しがコンポーネントのトップレベルでのみ無条件に発生することを *想定しています* 。これらの [フックのルール](https://reactjs.org/docs/hooks-rules.html) は、 [linterプラグイン](https://www.npmjs.com/package/eslint-plugin-react-hooks) を使用して適用できます。このデザインの選択については激しい議論がありましたが、実際には、人々を混乱させることはありませんでした。また、一般的に提案されている代替案が [機能しない](https://overreacted.io/why-do-hooks-rely-on-call-order/) 理由についても書きました。

内部的には、フックは [連結リスト](https://dev.to/aspittel/thank-u-next-an-introduction-to-linked-lists-4pph) として実装されています。`useState`を呼び出すと、ポインタが次の項目に移動します。コンポーネントの [「コールツリー」フレーム](#call-tree) を終了すると、次のレンダリングまで結果のリストがそこに保存されます。

[この記事](https://medium.com/@ryardley/react-hooks-not-magic-just-arrays-cd4f1857236e) では、フックが内部でどのように機能するかについて簡単に説明しています。配列は、連結リストよりも簡単なメンタルモデルである可能性があります。

```jsx
// 擬似コード
let hooks, i;
function useState() {
  i++;
  if (hooks[i]) {
    // 次のレンダリング
    return hooks[i];
  }
  // 最初のレンダリング
  hooks.push(...);
}

// レンダリングの準備
i = -1;
hooks = fiber.hooks || [];
// コンポーネントを呼び出す
YourComponent();
// フックのstateを保存する
fiber.hooks = hooks;
```

*（興味があれば、実際のコードは [ここ](https://github.com/facebook/react/blob/master/packages/react-reconciler/src/ReactFiberHooks.new.js) です。）*

これは、おおよそ、各`useState()`呼び出しが正しい状態を取得する方法です。 [以前に](#reconciliation) 学んだように、「一致させる」ことはReactにとって目新しいことではありません。差分検出処理は、同様の方法でレンダリング間で一致する要素に依存します。

## 残っていること

Reactの実行環境のほとんどすべての重要な側面に触れました。このページを終了した場合、おそらくユーザーの90％よりも詳細にReactを知っているでしょう。そして、それは何も悪いことではありません！

私が省略した部分がいくつかあります。主な理由は、それらが私たちにも不明確だからです。 Reactには現在、マルチパスレンダリングに適した話がありません。つまり、親のレンダリングで子に関する情報が必要な場合です。また、 [エラー処理API](https://reactjs.org/docs/error-boundaries.html) にはまだフックバージョンがありません。これら2つの問題を一緒に解決できる可能性があります。並行モードはまだ安定しておらず、サスペンスがこの図にどのように適合するかについて興味深い質問があります。たぶん、それら具体化され、サスペンスが [遅延読み込み](https://reactjs.org/blog/2018/10/23/react-v-16-6.html#reactlazy-code-splitting-with-suspense) 以上の準備ができたら、フォローアップを行います。

**これらのトピックのほとんどについて考えることなく、非常に遠くまで到達できることは、ReactのAPIの成功を物語っていると思います。** ほとんどの場合、差分検出のヒューリスティックのような適切なデフォルトは正しいことを行います。`key`警告のような警告は、あなたが自分を撃つ危険性があるときには、あなたに助言を与えてくれます。

あなたがUIライブラリのオタクであるなら、この投稿がいくらか面白くて、Reactがどのように機能するかをより深く明らかにしたことを願っています。あるいは、Reactが複雑すぎて、二度と見ることはないと判断したかもしれません。どちらの場合も、Twitterでご意見をお聞かせください。読んでくれてありがとう。
