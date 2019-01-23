---
title: なぜReact Elementは$$typeofプロパティを持っているの？
date: '2018-12-03'
spoiler: セキュリティと関係があります。
---

あなたはJSXを書いていると思うかもしれません：

```jsx
<marquee bgcolor="#ffa7c4">hi</marquee>
```

しかし実際には関数を呼び出しています。:

```jsx
React.createElement(
  /* type */ 'marquee',
  /* props */ { bgcolor: '#ffa7c4' },
  /* children */ 'hi'
)
```

そしてこの関数はオブジェクトを返します。このオブジェクトをReact _element_ と呼びます。次に何をレンダリングするかReactに指示します。あなたの書いたコンポーネントはそれらのツリーを返します。

```jsx{9}
{
  type: 'marquee',
  props: {
    bgcolor: '#ffa7c4',
    children: 'hi',
  },
  key: null,
  ref: null,
  $$typeof: Symbol.for('react.element'), // 🧐 これ誰
}
```

Reactを使ったことがあれば`type`, `props`, `key`,`ref`フィールドは知っているかもしれませんが、
**`$$typeof`ってなんだ？しかもなぜ値に`Symbol()`が入っているんだ？**

これはReactを使うことにおいては知る必要がないことですが、この記事にはセキュリティについてのいくつかのヒントがあります。 いつかあなたはUIライブラリを書くでしょう、その時これは役に立つかもしれません。
私はそう望んでいます。

---

クライアントサイドのUIライブラリが一般的になる前はアプリケーションコードにHTMLを構築してDOMに挿入するのが一般的でした。:

```jsx
const messageEl = document.getElementById('message');
messageEl.innerHTML = '<p>' + message.text + '</p>';
```

 `message.text`が` '<img src onerror = "stealYourPassword()">'`のようなものである場合を除いて、それは問題なく動作します。 **見知らぬ人によって書かれたものが、アプリケーションのレンダリングされたHTMLにそのまま表示されることを望まないでください。**

(面白い事実：クライアントサイドでのレンダリングだけを行うのであれば、`<script>`タグを使ってもJavaScriptを実行[できません。](https://gomakethings.com/preventing-cross-site-scripting-attacks-when-using-innerhtml-in-vanilla-javascript/))

そのような攻撃から保護するために、テキストだけを扱う `document.createTextNode()`や `textContent`のような安全なAPIを使うことができます。 また、ユーザーが指定したテキスト内の `<`、 `>`などの潜在的に危険な文字を置き換えることによって、入力を率先してにエスケープすることもできます。

それでも、間違いのコストは高く、ユーザーが作成した文字列を出力に挿入するたびに保護しなければいけないのは面倒です。
**これが、Reactのような最新のライブラリがデフォルトで文字列のテキストコンテンツをエスケープする理由です。** :

```jsx
<p>
  {message.text}
</p>
```

`message.text`が `<img>`や他のタグを含む悪意のある文字列である場合、それは本当の`<img>`タグにはなりません。 ReactはコンテンツをエスケープしてDOMに挿入します。 そのため `<img>`タグを見る代わりに、そのマークアップを見るだけです。

React elements内に任意のHTMLを描画するには、 `dangerouslySetInnerHTML = {{__html：message.text}}`と書く必要があります。 **ぎこちない感じに書くというのが特徴です** コードレビューやコードベース監査で確認できるように、見やすくすることを目的としています。

---

**Reactがインジェクション攻撃から完全に安全であるということですか？ 違います。** HTMLとDOMは[たくさんの攻撃対象領域](https://github.com/facebook/react/issues/3473#issuecomment-90594748)を提供しますが、Reactや他のUIライブラリがそれを軽減するには難しすぎるか遅すぎます。他の攻撃手法の大部分は属性を含みます。 たとえば、 `<a href={user.website}>`をレンダリングする場合は、Webサイトが `'javascript：stealYourPassword()'`であるユーザーに注意してください。 `<div {... userData}>`のようにユーザの情報を展開することはまれですが危険です。

Reactは時間をかけてより多くの保護を[提供することができますが](https://github.com/facebook/react/issues/10506)、多くの場合、これらは[修正されるべき](https://github.com/facebook/react/issues/3473#issuecomment-91327040)サーバーの問題の結果です。

それでも、テキストコンテンツのエスケープは、多くの潜在的な攻撃をキャッチする合理的な防御の第一線です。 このようなコードが安全であることを知っておくのはいいことではありませんか？

```jsx
// 自動でエスケープされます
<p>
  {message.text}
</p>
```

**まあ、必ずしも安全ではないですが。** そこで `$$typeof`が登場します。

---

React elementsは、設計上、単純なオブジェクトです。

```jsx
{
  type: 'marquee',
  props: {
    bgcolor: '#ffa7c4',
    children: 'hi',
  },
  key: null,
  ref: null,
  $$typeof: Symbol.for('react.element'),
}
```

通常、それらを `React.createElement()`で作成しますが、必須ではありません。上で行ったように書かれたオブジェクトをサポートするReactための有効な使用例があります。もちろん、このように記述したくないと思うかもしれません - しかし、[これは](https://github.com/facebook/react/pull/3583#issuecomment-90296667)最適化コンパイラ、ワーカー間でのUI要素の受け渡し、またはReactパッケージからのJSXの分離に役立ちます。

しかしながら、**サーバーに任意のJSONオブジェクトを保存するための口がある場合** クライアントコードは文字列を期待します、これは問題になるかもしれません：

```jsx{2-10,15}
// サーバーにユーザー情報のJSONを許可する口がある場合
let expectedTextButGotJSON = {
  type: 'div',
  props: {
    dangerouslySetInnerHTML: {
      __html: '/* ここに悪いコードを置く */'
    },
  },
  // ...
};
let message = { text: expectedTextButGotJSON };

// React 0.13で危険
<p>
  {message.text}
</p>
```

その場合、React 0.13はXSS攻撃に対して[脆弱](http://danlec.com/blog/xss-via-a-spoofed-react-element)になります。
さらに明確にすると、**この攻撃は既存のサーバーホールに依存しています**。
それでも、Reactはその問題に対して人々を保護するためのより良い仕事をすることができました。 React 0.14から始まっています。

React 0.14での修正は、[すべてのReact要素にシンボルを付ける](https://github.com/facebook/react/pull/4832)です。:

```jsx{9}
{
  type: 'marquee',
  props: {
    bgcolor: '#ffa7c4',
    children: 'hi',
  },
  key: null,
  ref: null,
  $$typeof: Symbol.for('react.element'),
}
```

JSONには単に`Symbol`を入れることができないので、これはうまくいきます。 **そのため、サーバーにセキュリティホールがあり、テキストではなくJSONを返す場合でも、そのJSONには `Symbol.for( 'react.element')`を含めることができません。** Reactは`element.$$typeof`をチェックします。そしてそれがない場合もしくは無効な場合に要素の処理を拒否します。

特に`Symbol.for()`を使うことのいいところは、**シンボルはiframeやワーカーのような環境間でグローバルであるということです。**
そのため、この修正によって、よりエキゾチックな状況でも、アプリのさまざまな部分の間で信頼できる要素を渡すことが妨げられることはありません。
同様に、たとえページ上にReactのコピーが複数あっても、それらは有効な `$$typeof`の値に「同意する」ことができます。

---

Symbolsを[サポートしていない](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Symbol#Browser_compatibility)ブラウザーについてはどうですか？

ああ、彼らはこの特別な保護を受けていません。Reactは一貫性のためにまだ要素上に `$$typeof`フィールドを含んでいますが、それは[数値に設定](https://github.com/facebook/react/blob/8482cbe22d1a421b73db602e1f470c632b09f693/packages/shared/ReactSymbols.js#L14-L16)されています — `0xeac7`。

なぜこの数字なの？ `0xeac7`はちょっと“React”のように見えますねぇ。