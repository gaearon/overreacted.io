---
title: なぜsuper(props) を書くの?
date: '2018-11-30'
spoiler: 最後にひとひねりあります。
---


`Hooks`が最新でアツいって聞いたよ。皮肉なことだけどクラスコンポーネントの楽しい事実について述べてブログをスタートしたい。どうだ！

**これらの潜在的問題はReactを効率的に使うためには重要じゃない。でも、もしどうやって動いているか深く掘り下げることが好きなら面白いかもね**

これが最初のやつ。

---

私は人生で `super(props)` 何度も書いたよ:

```jsx{3}
class Checkbox extends React.Component {
  constructor(props) {
    super(props);
    this.state = { isOn: true };
  }
  // ...
}
```

もちろん、[class fields proposal](https://github.com/tc39/proposal-class-fields) なら儀式(constructor)をスキップできる。:


```jsx
class Checkbox extends React.Component {
  state = { isOn: true };
  // ...
}
```

2015年に`React 0.13`がプレーンクラスのサポートを追加したとき、こんな感じの構文が[計画](https://reactjs.org/blog/2015/01/27/react-v0.13.0-beta-1.html#es7-property-initializers)されていたよ。コンストラクタの定義と`super(props)`の呼び出しは常にクラスフィールドが人間工学に基づいた代替手段を提供するまでの一時的な解決策だった。

でも、ES2015の機能のみを使って例に戻りましょう。:

```jsx{3}
class Checkbox extends React.Component {
  constructor(props) {
    super(props);
    this.state = { isOn: true };
  }
  // ...
}
```

**なぜ私たちはsuperを呼ぶの？呼ばなくてもいいの？もし呼ばないといけないなら、`props`を呼ばなかったらなにが起こるんですか？他に何か議論はありますか？確認してみましょう。**

---

JavaScriptでは`super`は親クラスのコンストラクタを参照します。(この例では、親クラスは`React.Component`実装を指しています。)

重要なのは、JavaScriptはあなたがコンストラクターで親のコンストラクターを呼ぶまで`this`は使わせてくれません。:

```jsx
class Checkbox extends React.Component {
  constructor(props) {
    // 🔴 `this` はまだ使えない
    super(props);
    // ✅ 今なら使える
    this.state = { isOn: true };
  }
  // ...
}
```

あなたが`this`を使う前にJavascriptが親のコンスラクターの実行を強制させるのには理由があります。クラス階層を考えてみてください。:

```jsx
class Person {
  constructor(name) {
    this.name = name;
  }
}

class PolitePerson extends Person {
  constructor(name) {
    this.greetColleagues(); // // 🔴 ここでは許可されていない。 下記をご確認ください
    super(name);
  }
  greetColleagues() {
    alert('Good morning folks!');
  }
}
```

`super`の前に`this`の使用が許可されていた場合のことを想像してみてください。一ヶ月後、`greetColleagues`のメッセージに人の名前を入れるかもしれません。:

```jsx
  greetColleagues() {
    alert('Good morning folks!');
    alert('My name is ' + this.name + ', nice to meet you!');
  }
```

しかし`this.greetColleagues()`は`super()`の前に呼ばれていることを忘れちゃいました。そう、`this.name`はまだ定義されていません!
ご覧のとおり、このようなコードは考えるのが非常に難しいのです。

この落とし穴を避けるために **Javascriptはコンストラクターでthisを使いたい場合に`super`の呼び出しを強制します。**
そして、この制限はクラス定義されたReactのコンポーネントにも適用されます。:

```jsx
  constructor(props) {
    super(props);
    // ✅ ここから`this`が使える
    this.state = { isOn: true };
  }
```

他の疑問が残っています。なぜ`props`を引数に渡すの？


---

`React.Component`でコンストラクターが`this.props`を初期化するために、`props`を`super`に渡すことが必要と思うかもしれません。:

```jsx
// React内部
class Component {
  constructor(props) {
    this.props = props;
    // ...
  }
}
```

真実からそれほど遠くないですよ。[確かにやっています](https://github.com/facebook/react/blob/1d25aa5787d4e19704c049c3cfa985d3b5190e0d/packages/react/src/ReactBaseClasses.js#L22)

しかし、どういうわけか引数(`props`)なしの`super()`で呼び出しても、
`this.props`に`render`や他のメソッド内でアクセスできます。(信じないなら試してみて!)

どうやって動いているんだ？**Reactも`props`をコンストラクターを呼んだ後にインスタンスに割り当てていることがわかる** :

```jsx
  // React内部
  const instance = new YourComponent(props);
  instance.props = props;
```

そう。だからもし`props`を`super()`に渡し忘れても、Reactは`props`を設定します。これには理由があります。

Reactがclassをサポートしたとき、ES6のクラスだけをサポートしたのではありません。ゴールはより広いクラスの抽象概念をサポートすることでした。
コンポーネントを定義するのにClojureScript, CoffeeScript, ES6, Fable, Scala.js, TypeScriptや他の方法がどれほど成功するのかは[不明確](https://reactjs.org/blog/2015/01/27/react-v0.13.0-beta-1.html#other-languages) でした。だからES6のclassで`super()`の呼び出しが必須であるにも関わらず、意図的に固執しませんでした。

これは`super(props)`の代わりに`super()`と書けるということを意味してる？

**多分そうじゃない。まだ紛らわしい。** 確かに、Reactはコンストラクターが実行されたあとに`this.props`を割り当てます。
でも、親とあなたのコンストラクターの実行が終わるまでの間、`this.props`は未定義なのです。:

```jsx{14}
// React内部
class Component {
  constructor(props) {
    this.props = props;
    // ...
  }
}

// あなたのコード
class Button extends React.Component {
  constructor(props) {
    super(); // 😬 props渡すの忘れちゃった
    console.log(props);      // ✅ {}
    console.log(this.props); // 😬 undefined 
  }
  // ...
}
```

コンストラクタから呼び出されるメソッドでこれが発生した場合、デバッグするのはさらに困難になります。**絶対必要というわけではないですが、私は常に`super(props)`で渡すことをオススメしています。** :

```jsx
class Button extends React.Component {
  constructor(props) {
    super(props); // ✅ props渡した
    console.log(props);      // ✅ {}
    console.log(this.props); // ✅ {}
  }
  // ...
}
```

これはコンストラクタが終了する前でも`this.props`は設定されているということを保証します。

-----

長年のReactユーザーは興味があるかもしれないことを最後に少々。

Context APIをclass(古いタイプのcontextTypesもしくはReact 16.6で追加された新しいcontextTypeのどちらでも)内で使用する時、`context`は2つ目の引数としてコンストラクターに渡されることに、気づいているかもしれません。

では、`super(props, context)`と書いてみませんか？できますが、contextはそんなに頻繁に利用されないため、この落とし穴はそれほど頻繁に現れません。

**`class fields proposal` ではこの落とし穴はほとんど消えます。**
明示的なコンストラクタがないと全ての引数は自動的に渡されます。
これは`state = {}`のような式に必要に応じて`this.props`もしくは`this.context`の参照を含めることを許します。

Hooksでは`super`もしくは`this`さえ持っていません。
しかし、これは別の日の話題としましょう。
