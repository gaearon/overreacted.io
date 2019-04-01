---
title: setStateはどうやって何をすべきか判断するの？
date: '2018-12-09'
spoiler: 詳細を知る必要がない場合、依存性の注入は有効です。
---

コンポーネントの中で `setState`を呼び出すとき、何が起こると思いますか？

```jsx{11}
import React from 'react';
import ReactDOM from 'react-dom';

class Button extends React.Component {
  constructor(props) {
    super(props);
    this.state = { clicked: false };
    this.handleClick = this.handleClick.bind(this);
  }
  handleClick() {
    this.setState({ clicked: true });
  }
  render() {
    if (this.state.clicked) {
      return <h1>Thanks</h1>;
    }
    return (
      <button onClick={this.handleClick}>
        Click me!
      </button>
    );
  }
}

ReactDOM.render(<Button />, document.getElementById('container'));
```

そう、次の `{clicked：true}`の状態でReactはコンポーネントを再レンダリングし、返された `<h1> Thanks </h1>`要素と一致するようにDOMを更新します。

簡単そうに見えますね。しかし待ってくださいこれは _React_ がしますか？それとも _React DOM_ ？

DOMを更新することは、React DOMの責務のように思えます。しかし、React DOMのものではない、`this.setState()`を呼び出しています。 そして私たちの `React.Component`クラスはReactの内部で定義されています。

ならどうやって `React.Component`内の`setState()`がDOMを更新することができるのでしょうか。

**免責事項：このブログの他のほとんど([これとか](/why-do-react-elements-have-typeof-property/), [これとか](/how-does-react-tell-a-class-from-a-function/), [これ](/why-do-we-write-super-props/))の投稿と同じように、Reactを効率的に使うために知る必要はありません。この記事は、カーテンの裏に何があるのかを知りたい人のためのものです。 完全にオプション！**

---

`React.Component`クラスはDOM更新ロジックを含んでいると思うかもしれません。

しかし、そうであれば、 `this.setState()`は他の環境でどのように機能するのでしょうか？ 例えば、React Nativeアプリケーションのコンポーネントは `React.Component`も継承しています。これらは上記と同じように `this.setState()`を呼び出しますが、React NativeはDOMの代わりにAndroidおよびiOSのネイティブビューで動作します。

React Test RendererまたはShallow Rendererについても知っているかもしれませんが、 どちらのテスト方法でも通常のコンポーネントをレンダリングしてその中で `this.setState()`を呼び出すことができますが、どちらもDOMとは連携できません。

[React ART](https://github.com/facebook/react/tree/master/packages/react-art)のようなレンダラーを使用した場合は、ページ上で複数のレンダラーを使用することが可能です。(たとえば、ARTコンポーネントはReact DOMツリー内で機能します。)これにより、グローバルフラグまたは変数が保持できなくなります。

だからどういうわけか **`React.Component`は状態の更新を扱うことをプラットフォーム固有のコードに委任します。** これがどのように起こるかを理解する前にパッケージがどのように分離されるか、そしてその理由を深く掘り下げましょう。

---

Reactの「エンジン」は `react`パッケージの中にあるという一般的な誤解があります。 これは事実と異なります。

実際、パッケージが[React 0.14](https://reactjs.org/blog/2015/07/03/react-v0.14-beta-1.html#two-packages)で分割されて以来、`react`パッケージは意図的にコンポーネントを定義するためのAPIのみを公開しています。 Reactの実装の大部分は「レンダラー」にあります。

`react-dom`、`react-dom / server`、 `react-native`、`react-test-renderer`、 `react-art`はレンダラーの例です（そして[自分で作ることもできます](https://github.com/facebook/react/blob/master/packages/react-reconciler/README.md#practical-examples)）。

これはあなたがどのプラットフォームをターゲットにしているかに関わらず `react`パッケージが便利だからです。 すべてのエクスポートは以下のとおりです。`React.Component`、`React.createElement`、 `React.Children`そして（最終的には）[Hooks](https://reactjs.org/docs/hooks-intro.html) これらはターゲットプラットフォームから独立しています。React DOM、React DOM Server、React Nativeのいずれを実行しても、コンポーネントはインポートして同じ方法で使用します。

対照的に、レンダラパッケージはReact階層をDOMノードにマウントすることを可能にする `ReactDOM.render()`のようなプラットフォーム特有のAPIを公開します。各レンダラーはこのようなAPIを提供します。
理想的には、ほとんどのコンポーネントはレンダラーから何かをインポートする必要はありません。 これにより、移植性が高まります。

**ほとんどの人がReactの「エンジン」として想像しているのは、個々のレンダラーの内部にあります。** 多くのレンダラーには同じコードのコピーが含まれています - これを["reconciler"](https://github.com/facebook/react/tree/master/packages/react-reconciler)と呼びます。 [ビルドステップ](https://reactjs.org/blog/2017/12/15/improving-the-repository-infrastructure.html#migrating-to-google-closure-compiler) では、reconcilerのコードとレンダラーコードをスムーズにまとめて、パフォーマンスを向上させるための高度に最適化された単一のバンドルにします。
(コードのコピーはバンドルサイズ的には良いものではありませんが、Reactユーザーの大多数は一度に1つのレンダラーしか必要としません（例えば `react-dom`)

ここで重要なのは、 `react`パッケージはReactの機能を使うだけで、実装されている方法については何も知らないということです。
レンダラパッケージ（ `react-dom`、`react-native`など）はReact機能とプラットフォーム固有のロジックの実装を提供します。
そのコードの一部は共有されていますが("reconciler")、個々のレンダラーの実装の詳細です。

---

これで新機能のために `react`と`react-dom`パッケージの両方を更新する必要がある理由がわかりましたね。
例えば、React 16.3がContext APIを追加したとき、 `React.createContext()`がReactパッケージに公開されました。

しかし `React.createContext()`は実際にはコンテキスト機能を実装していません。 たとえば、React DOMとReact DOM Serverでは実装が異なる必要があります。 そのため `createContext()`はいくつかのプレーンなオブジェクトを返します。:

```jsx
// 少し簡略化しています
function createContext(defaultValue) {
  let context = {
    _currentValue: defaultValue,
    Provider: null,
    Consumer: null
  };
  context.Provider = {
    $$typeof: Symbol.for('react.provider'),
    _context: context
  };
  context.Consumer = {
    $$typeof: Symbol.for('react.context'),
    _context: context,
  };
  return context;
}
```

コード内で`<MyContext.Provider>`または`<MyContext.Consumer>`を使用する場合、それらをどのように処理するかを決定するのはレンダラーです。
React DOMはある方法でコンテキスト値を追跡するかもしれませんが、React DOM Serverはそれを別の方法で行うかもしれません。

**したがって、「react」を16.3以降に更新しても、「react-dom」を更新しない場合は、特別な「Provider」型と「Consumer」型をまだ認識していないレンダラーを使用することになります。** これが、古い `react-dom`が[これらの型が無効だと言って失敗](https://stackoverflow.com/a/49677020/458193)する理由です。

同じ警告がReact Nativeにも当てはまります。 ただし、React DOMとは異なり、ReactリリースはすぐにはReact Nativeリリースを「強制」しません。独立したリリーススケジュールを持っています。更新されたレンダラーコードは、数週間に1回、React Nativeリポジトリに[個別に同期](https://github.com/facebook/react-native/commits/master/Libraries/Renderer/oss)されます。
これが、React DOMとは異なるスケジュールでReact Nativeの機能が利用可能になる理由です。

---

さて、これで `react`パッケージにはおもしろいものは何も含まれていないってことがわかりましたね。そして実装は`react-dom`や `react-native`のようなレンダラーにあります。しかし、これでは質問に答えていませんね。 `React.Component`内の`setState()`はどのようにして正しいレンダラーと「対話」しますか？

**答えは、すべてのレンダラーが、作成されたクラスに特別なフィールドを設定することです。** このフィールドは「updater」と呼ばれています。
それはあなたが設定するものではありません - むしろ、それはあなたのクラスのインスタンスを作成した直後にReact React DOM ServerまたはReact Nativeがセットするものです：


```jsx{4,9,14}
// React DOM 内部
const inst = new YourComponent();
inst.props = props;
inst.updater = ReactDOMUpdater;

// React DOM Server 内部
const inst = new YourComponent();
inst.props = props;
inst.updater = ReactDOMServerUpdater;

// React Native 内部
const inst = new YourComponent();
inst.props = props;
inst.updater = ReactNativeUpdater;
```

[`React.Component`の`setState`の実装](https://github.com/facebook/react/blob/ce43a8cd07c355647922480977b46713bd51883e/packages/react/src/ReactBaseClasses.js#L58-L67)を見てください。このコンポーネントインスタンスを作成したレンダラーに作業を委任するだけです。

```jsx
// 少し簡略化しています
setState(partialState, callback) {
  // レンダラーと「対話」するには `updater`フィールドを使って!
  this.updater.enqueueSetState(this, partialState, callback);
}
```

React DOMサーバーは状態の更新を無視して[警告しようとするかもしれません。](https://github.com/facebook/react/blob/ce43a8cd07c355647922480977b46713bd51883e/packages/react-dom/src/server/ReactPartialRenderer.js#L442-L448) 一方、React DOMとReact Nativeはそれらの"reconciler"のコピーにそれを[処理させる](https://github.com/facebook/react/blob/ce43a8cd07c355647922480977b46713bd51883e/packages/react-reconciler/src/ReactFiberClassComponent.js#L190-L207)でしょう。


これが、Reactパッケージで定義されている場合でも、`this.setState()`がDOMを更新する方法です。React DOMによって設定された `this.updater`を読み、React DOMに更新をスケジュールさせ処理させます。

---

クラスについてはわかりましたが、フックについてはどうですか？

初めて[Hooks proposal API](https://reactjs.org/docs/hooks-intro.html)を見たとき、しばしば疑問に思うようです「`useState`はどのようにしたらよいのでしょうか?」仮定として、これが `this.setState()`を使った`React.Component`クラスよりも「魔法的」であることです。
しかし、今日見たように、クラスの`setState()`の実装は初めからずっと「幻想的」です。 現在のレンダラーを呼び出すこと以外は何もしません。

そして `useState`フックは[全く同じことをします。](https://github.com/facebook/react/blob/ce43a8cd07c355647922480977b46713bd51883e/packages/react/src/ReactHooks.js#L55-L56)

**`updater`フィールドの代わりに、フックは"dispatcher"オブジェクトを使います。** `React.useState()`,`React.useEffect()`あるいは他の組み込みHookを呼び出すと、これらの呼び出しは現在のディスパッチャに転送されます。

```jsx
// React内 (少し簡略化しています)
const React = {
  // 本当のプロパティはもう少し深くに隠されています。見つけられたら見てください！
  __currentDispatcher: null,

  useState(initialState) {
    return React.__currentDispatcher.useState(initialState);
  },

  useEffect(initialState) {
    return React.__currentDispatcher.useEffect(initialState);
  },
  // ...
};
```

そして個々のレンダラーはコンポーネントをレンダリングする前にディスパッチャーを設定します：

```jsx{3,8-9}
// React DOM内
const prevDispatcher = React.__currentDispatcher;
React.__currentDispatcher = ReactDOMDispatcher;
let result;
try {
  result = YourComponent(props);
} finally {
  // 元に戻す
  React.__currentDispatcher = prevDispatcher;
}
```

例えば、React DOM Serverの実装は[こちら](https://github.com/facebook/react/blob/ce43a8cd07c355647922480977b46713bd51883e/packages/react-dom/src/server/ReactPartialRendererHooks.js#L340-L354)です。
そしてReact DOMとReact Nativeが共有する"reconciler"の実装は[ここ](https://github.com/facebook/react/blob/ce43a8cd07c355647922480977b46713bd51883e/packages/react-reconciler/src/ReactFiberHooks.js)です。

これが `react-dom`のようなレンダラーがHooksを呼ぶのと同じ`react`パッケージにアクセスする理由です。
そうでなければ、あなたのコンポーネントはディスパッチャーを「見る」ことができません！
同じコンポーネントツリーに[複数のReactのコピー](https://github.com/facebook/react/issues/13991)がある場合、これはうまく機能しない可能性があります。しかし、これは常にあいまいなバグを引き起こすので、Hooksはパッケージの重複を解決することを強制します。

これはお勧めできませんが、高度なツールのユースケースでは、技術的にディスパッチャを上書きすることができます。(`__currentDispatcher`の名前について嘘をつきましたが、本物をReactリポジトリで見つけることができます。)例えばReact DevToolsは[特定のディスパッチャ](https://github.com/facebook/react/blob/ce43a8cd07c355647922480977b46713bd51883e/packages/react-debug-tools/src/ReactDebugHooks.js#L203-L214)を使用してJavaScriptスタックトレースのキャプチャによってHooksツリーを観察します。_良い子は真似しないでください_

これは、フックが本質的にReactと結び付いていないことも意味します。 将来もっと多くのライブラリが同じ原始的なフックを再利用したいならば、
理論的には、ディスパッチャーは別のパッケージに移動し、「怖くない」名前のファーストクラスAPIとして公開される可能性があります。
実際には、それが必要になるまで早期の抽象化は避けますが。

`updater`フィールドと`__currentDispatcher`オブジェクトはどちらも _dependency injection_ と呼ばれる一般的なプログラミング原則の形式です。 どちらの場合も、レンダラーは `setState`のような機能の実装を一般的なReactパッケージに「注入」して、コンポーネントの宣言性を高めます。

Reactを使うときにこれがどのように機能するかを考える必要はありません。
_dependency injection_ のような抽象的な概念よりも、Reactユーザーは自分のアプリケーションのコードについてもっと時間をかけて欲しいと思います。
しかし、`this.setState()`や`useState()`がどうやって何をすべきか判断するのかを疑問に思ったことがあるなら、これが役に立つことを願っています。

---

