---
title: 'さようなら、クリーンコード'
date: '2020-01-11'
spoiler: クリーンコードに導かれよう。そして、それを手放すのだ。
---

夜遅くのことだった。

ちょうど私の同僚が、彼らが一週間かけて書いたコードをチェックインしたところだった。私たちはグラフィック・エディタのキャンバスを作っていて、彼らは長方形や楕円のような形状の端にある小さなハンドルをドラッグしてサイズを変更する機能を実装していた。

このコードは上手く動いた。

ただし、反復的だった。長方形や楕円形などの図形にはそれぞれ異なるハンドルがあり、それぞれのハンドルを異なる方向にドラッグすることで、図形の位置やサイズを別々に変えるものだった。また、ユーザがShiftキーを押しながら操作すると、比率を維持したままサイズを変更する必要があった。計算することも沢山あった。

コードは次のようなものだった:

```jsx
let Rectangle = {
  resizeTopLeft(position, size, preserveAspect, dx, dy) {
    // 10 repetitive lines of math
  },
  resizeTopRight(position, size, preserveAspect, dx, dy) {
    // 10 repetitive lines of math
  },
  resizeBottomLeft(position, size, preserveAspect, dx, dy) {
    // 10 repetitive lines of math
  },
  resizeBottomRight(position, size, preserveAspect, dx, dy) {
    // 10 repetitive lines of math
  },
};

let Oval = {
  resizeLeft(position, size, preserveAspect, dx, dy) {
    // 10 repetitive lines of math
  },
  resizeRight(position, size, preserveAspect, dx, dy) {
    // 10 repetitive lines of math
  },
  resizeTop(position, size, preserveAspect, dx, dy) {
    // 10 repetitive lines of math
  },
  resizeBottom(position, size, preserveAspect, dx, dy) {
    // 10 repetitive lines of math
  },
};

let Header = {
  resizeLeft(position, size, preserveAspect, dx, dy) {
    // 10 repetitive lines of math
  },
  resizeRight(position, size, preserveAspect, dx, dy) {
    // 10 repetitive lines of math
  },
}

let TextBlock = {
  resizeTopLeft(position, size, preserveAspect, dx, dy) {
    // 10 repetitive lines of math
  },
  resizeTopRight(position, size, preserveAspect, dx, dy) {
    // 10 repetitive lines of math
  },
  resizeBottomLeft(position, size, preserveAspect, dx, dy) {
    // 10 repetitive lines of math
  },
  resizeBottomRight(position, size, preserveAspect, dx, dy) {
    // 10 repetitive lines of math
  },
};
```

私はその計算の繰り返しが本当に気になった。

それは*クリーン*ではなかったのだ。

繰り返しの多くは、方向の類似によるものだった。例えば、`Oval.resizeLeft()` は `Header.resizeLeft()` と似ていた。どちらもハンドルを左側にドラッグすることに関連するからだ。

もう一つの類似点は、同じ形状に対するメソッド同士だ。例えば、`Oval.resizeLeft()` は他の `Oval` メソッドと類似していた。それらが全て楕円を扱うからだ。また、テキストブロックは *もともとは長方形だった* から`Rectangle`と`Header`、`TextBlock`の間にも重複があった。

ここで私は良いことを思いついた。

このようにコードをグループ化することで、*重複をすべて取り除くことができる*:

```jsx
let Directions = {
  top(...) {
    // 5 unique lines of math
  },
  left(...) {
    // 5 unique lines of math
  },
  bottom(...) {
    // 5 unique lines of math
  },
  right(...) {
    // 5 unique lines of math
  },
};

let Shapes = {
  Oval(...) {
    // 5 unique lines of math
  },
  Rectangle(...) {
    // 5 unique lines of math
  },
}
```

そして、それらの振る舞いをコンポジションにする:

```jsx
let {top, bottom, left, right} = Directions;

function createHandle(directions) {
  // 20 lines of code
}

let fourCorners = [
  createHandle([top, left]),
  createHandle([top, right]),
  createHandle([bottom, left]),
  createHandle([bottom, right]),
];
let fourSides = [
  createHandle([top]),
  createHandle([left]),
  createHandle([right]),
  createHandle([bottom]),
];
let twoSides = [
  createHandle([left]),
  createHandle([right]),
];

function createBox(shape, handles) {
  // 20 lines of code
}

let Rectangle = createBox(Shapes.Rectangle, fourCorners);
let Oval = createBox(Shapes.Oval, fourSides);
let Header = createBox(Shapes.Rectangle, twoSides);
let TextBox = createBox(Shapes.Rectangle, fourCorners);
```

コード量は全体の半分になり、重複は完全になくなった！ それはとても*クリーン*だった。特定の方向や形状に対して振る舞いを変えたい場合に、あちこちのメソッドを更新する必要はなくなり、一箇所だけ変更すればよくなった。

夢中になっていて、気づいたらもう深夜だった。私は自分のリファクタリングをmasterにチェックインし、同僚の乱雑なコードを解きほぐしたことを誇りに思いながら眠りについた。

## 翌朝

...予想とは違うことが起きた。

上司に1on1に誘われ、丁寧に「変更を元に戻してほしい」と言われた。私は愕然とした。元のコードはめちゃくちゃで、私のコードは*クリーン*なのに！

私は渋々従ったが、彼らが正しかったと理解するのに何年もかかった。

## それは段階だ

「クリーンコード」にこだわり、重複を排除することは、多くの人が経験する段階だ。自分のコードに自信が持てないとき、自尊心やプロとしての誇りを、測定可能な何かに結びつけたくなる。厳格なlint規則、命名体系、ファイル構造、重複の少なさなどだ。

重複の排除を自動化することはできないが、練習すれば*確実に*より上手くできるようになる。変更するたびに、重複が減ったかどうかはすぐに見分けられる。その結果、重複を排除することで、コードに関する何らかの客観的な指標を改善したように感じられる。さらに悪いことに、それは人々のアイデンティティの感覚を狂わせる。「*私はきれいなコードを書く人間だ*」と。これは、あらゆる種類の自己欺瞞と同じくらい強力なものだ。

一度[抽象化](https://www.sandimetz.com/blog/2016/1/20/the-wrong-abstraction)を作成する方法を学ぶと、その能力に酔いしれて、繰り返しの多いコードを見るたびに、何もないところから抽象化を引き出したくなるものだ。数年間コーディングをしていると、*あらゆるところで*繰り返しを目にするようになり、抽象化は私たちの新しい超能力となる。もし誰かが、抽象化は美徳だと言えば、私たちはそれを信じてしまうだろう。そして、その「美しさ」を崇拝しない人を批判し始めるだろう。

今になって、私の「リファクタリング」は2つの点で大失敗だったことがわかった。

* 第一に、私はそれを書いた人と話をしなかった。彼らの意見を聞かずにコードを書き直してチェックインした。たとえそれが*改善*であったとしても（私はもう信じていないが）、これはひどいやり方だ。健全な開発チームは、常に*信頼関係*を築いている。議論もせずにチームメイトのコードを書き換えてしまうと、コードベースで効果的に共同作業をすることが難しくなる。

* 第二に、タダというものはないのだ。私のコードは、重複を減らす代償として、要件を変更する能力を失った。これは割に合わない取引だ。例えば、異なる形状のハンドルに対して、多くの特殊なケースや振る舞いが必要になったことがある。私の抽象化されたコードは、その変更を受け入れるためには何倍も複雑になってしまうが、元の "乱雑な" バージョンでは、そのような変更は朝飯前だった。

私は、「汚い」コードを書けと言っているわけではない。ただ、「きれい」「汚い」という言葉が何を意味するのか、深く考えてみて欲しい。反発を感じる？それとも正しさ？美しさ？エレガンス？それらの性質に対応する具体的で工学的な成果を挙げることができると、あなたはどれくらい確信しているだろうか？コードの書き方や[変更](/optimized-for-change/)に具体的にどのような影響を与えるだろうか？

私はそのようなことを深く考えてはいなかった。コードがどのように*見えるか*についてはよく考えていたが、それが柔軟で不明瞭な人間のチームによってどのように*進化していくのか*は考えていなかった。

コーディングは旅だ。初めてコードを書いたときから今に至るまで、どれだけの道のりを歩んできたか考えてみて欲しい。関数を抽出したり、クラスをリファクタリングすることで、複雑なコードがシンプルになることを初めて目の当たりにした時は、とても嬉しかっただろう。自分の技術に誇りを持つと、コードの美しさを追求したくなるものだ。しばらくの間はそうすればいい。

ただし、そこで立ち止まってはいけない。クリーンコードの狂信者になってはいけない。クリーンコードはゴールではない。それは、私たちが扱っているシステムの膨大な複雑さから、何らかの意味を見いだそうとする試みなのだ。ある変更がコードベースにどのような影響を与えるかまだ分からないが、でも広大な未知という海の中で何らかの指針が欲しい、そんなときの防御機構なのだ。

クリーンコードに導かれよう。**そして、それを手放すのだ。**
