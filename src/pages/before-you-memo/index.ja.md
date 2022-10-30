---
title: 'memo() する前に'
date: '2021-02-23'
spoiler: "自然にできるレンダリング最適化"
---

React のパフォーマンス最適化について書かれた記事はたくさんあります。一般的には、何らかのステート更新が遅いときには以下のようなことを行います。

1. プロダクションビルドを実行していることを確認する。 (開発用のビルドは意図的に遅くなっているので、極端な場合だと桁違いに遅くなります。)
2. ツリーの中で必要以上に高い位置にステートを置いていないことを確認する。 (たとえば、input 要素のステートを一つの場所で管理するのは、最善の方法とは言えない可能性があります。)
3. React DevTools Profiler を利用して何が再レンダリングされているのかを確認し、最もコストのかかるサブツリーを `memo()` によってラップする。 (必要であれば `useMemo()` も使う。)

最後のステップは、特にツリーの中間にあるコンポーネントに対して行うのは煩わしいもので、コンパイラが代わりにやってくれるのが理想です。 もしかしたら、将来的にはそうなるかもしれませんね。

**この記事では、2つのテクニックを紹介しようと思います。** これらは驚くほど基本的なやり方なので、レンダリングのパフォーマンスを改善する効果があることに気づく人は少ないのではないでしょうか。

**これらのテクニックは、あなたが既に知っていることを補完するものです！** `memo` や `useMemo` の代わりにはなりませんが、 最初に試してみるにはしばしば適しているやり方です。

## （わざと）遅くしたコンポーネント

レンダリングパフォーマンスが非常に悪いコンポーネントを用意します。

```jsx
import { useState } from 'react';

export default function App() {
  let [color, setColor] = useState('red');
  return (
    <div>
      <input value={color} onChange={(e) => setColor(e.target.value)} />
      <p style={{ color }}>Hello, world!</p>
      <ExpensiveTree />
    </div>
  );
}

function ExpensiveTree() {
  let now = performance.now();
  while (performance.now() - now < 100) {
    // 100ms の間何もしない
  }
  return <p>I am a very slow component tree.</p>;
}
```

*([試してみる](https://codesandbox.io/s/frosty-glade-m33km?file=/src/App.js:23-513))*

問題は、わざと delay を入れてとても遅くなるようにした `<ExpensiveTree />` が、 `App` の内部の `color` が変更されるたびに再レンダリングされてしまうことです。

これに [`memo()` をつけて](https://codesandbox.io/s/amazing-shtern-61tu4?file=/src/App.js)終わりにすることもできますが、それについては既存の記事がたくさんあるので時間を割くのはやめにします。代わりに、2つの異なる解決策を紹介したいと思います。

## 解決策1: ステートを下に移動させる

レンダリングされる部分のコードをよく見てみると、現在の `color` の値を必要としているのは return されているツリーのうち、その一部であることがわかります。

```jsx{2,5-6}
export default function App() {
  let [color, setColor] = useState('red');
  return (
    <div>
      <input value={color} onChange={(e) => setColor(e.target.value)} />
      <p style={{ color }}>Hello, world!</p>
      <ExpensiveTree />
    </div>
  );
}
```

そこで、その部分を `Form` コンポーネントに切り出して、ステートをその内部へ _下ろして_ みましょう。

```jsx{4,11,14,15}
export default function App() {
  return (
    <>
      <Form />
      <ExpensiveTree />
    </>
  );
}

function Form() {
  let [color, setColor] = useState('red');
  return (
    <>
      <input value={color} onChange={(e) => setColor(e.target.value)} />
      <p style={{ color }}>Hello, world!</p>
    </>
  );
}
```

*([試してみる](https://codesandbox.io/s/billowing-wood-1tq2u?file=/src/App.js:64-380))*

`color` が変化しても、`Form` だけが再レンダリングされます。問題解決です。

## 解決策2: コンテンツをリフトアップする

先ほど紹介した解決策は、ステートの一部がコストの高いツリーの*上の*どこかで使われていた場合には使えません。例として、`color` を *親の* `<div>` に配置してみましょう。

```jsx{2,4}
export default function App() {
  let [color, setColor] = useState('red');
  return (
    <div style={{ color }}>
      <input value={color} onChange={(e) => setColor(e.target.value)} />
      <p>Hello, world!</p>
      <ExpensiveTree />
    </div>
  );
}
```

*([試してみる](https://codesandbox.io/s/bold-dust-0jbg7?file=/src/App.js:58-313))*

この場合では、`color` を使わない部分を他のコンポーネントに "切り出す" ことはできないようです。そうすると、コンポーネントには親の `<div>` が含まれて、その中には `<ExpensiveTree />` を含むことになってしまうからです。今回は `memo` を避けることはできないようですね。

それとも、できるんでしょうか？

できるかどうか、sandbox で試してみてください。
...

...

...

答えは、驚くほど簡単です。

```jsx{4,5,10,15}
export default function App() {
  return (
    <ColorPicker>
      <p>Hello, world!</p>
      <ExpensiveTree />
    </ColorPicker>
  );
}

function ColorPicker({ children }) {
  let [color, setColor] = useState("red");
  return (
    <div style={{ color }}>
      <input value={color} onChange={(e) => setColor(e.target.value)} />
      {children}
    </div>
  );
}
```

*([試してみる](https://codesandbox.io/s/wonderful-banach-tyfr1?file=/src/App.js:58-423))*

`App` コンポーネントを2つに分け、 `color` に依存する部分は、`color` のステート変数と一緒に `ColorPicker` に移動しました。

`color` を必要としない部分は `App` コンポーネントに残り、`children` props として `ColorPicker` に渡されています。 

`color` が変化したとき、 `ColorPicker` が再レンダリングされます。しかし、`App` から渡された prop は前と同じなので、 React がサブツリーを参照することはありません。

そしてその結果、 `<ExpensiveTree />` は再レンダリングされません。

## この話の教訓は何でしょうか？

`memo` や `useMemo` といった最適化を施すまえに、変更される部分と変更されない部分を分けられるかどうか見てみるといいかもしれません。

これらの方法の興味深い点は、**それ自体はパフォーマンスとは関係がないところです**。 コンポーネントを分割するために `children` prop を使うと、たいていはアプリケーションのデータフローが容易になり、ツリーを通してバケツリレーされる prop の数を減らすことができます。このような場合に得られるパフォーマンス向上は、決して最終目標ではなく、あくまでもおまけです。

不思議なことに、このパターンは将来的に _さらなる_ パフォーマンスの向上も期待できるのです。 

たとえば、[Server Components](https://reactjs.org/blog/2020/12/21/data-fetching-with-react-server-components.html) が stable になり利用可能になれば、 `ColorPicker` コンポーネントは `children` を[サーバから](https://youtu.be/TQQPAU21ZUw?t=1314)受け取ることができるようになります。 `<ExpensiveTree />` の全体または一部がサーバ上で実行され、Reactのトップレベルのステート更新さえも、クライアント側でその部分を "スキップ" することができます

これは `memo` ではできなかったことです。しかし、繰り返しになりますが、これらのアプローチはどちらも補完的なものです。ステートを下に移動させること（そして、コンテンツをリフトアップすること）を怠ってはいけません！

そして、それでも足りないところには Profiler を使って memo を配置していけばよいのです。

## これって前に読んだことがあるような？

[ええ、そうかもしれませんね。](https://kentcdodds.com/blog/optimize-react-re-renders)

これは新しいアイデアではありません。これは React のコンポジションモデルの当然の帰結です。シンプルであるがゆえに過小評価されていて、もう少しだけ愛されるべきものです。
