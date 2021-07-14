---
title: 'npm audit: 設計から破綻しています'
date: '2021-07-07'
spoiler: "99 件の脆弱性を発見しました (84 件は中程度に無関係、15 件は高程度に無関係です)"
---

セキュリティは大事です。セキュリティが悪化するようなことをわざわざ擁護したい人は誰もいません。だから今から書くことも、誰も言いたくないことです。しかし、誰かが言わねばなりません。

そういうわけで、私が言います。

**`npm audit` は挙動が破綻しています。デフォルトでは `npm install` の度に出てきますが、大量に押し寄せてくる割には考慮不足の内容で、フロントエンドのツールとして十分な水準にあるとは言えません。**

[オオカミ少年](https://ja.wikipedia.org/wiki/%E5%98%98%E3%82%92%E3%81%A4%E3%81%8F%E5%AD%90%E4%BE%9B)のお話を聞いたことがありますか？ネタバラシをすると羊はみんな狼に食べられてしまうのですが、我々も羊を食べられたくなければもっとマシなツールを持つべきです。

今日では `npm audit` は npm のエコシステム全体の汚点になっています。これがデフォルトの挙動としてリリースされる時に何とかしていれば一番良かったのですが、今からでも遅くはありません。

この記事では `npm audit` の挙動を説明し、なぜこれが壊れているのか、どう変わっているとうれしいのかを概略します。

---

*注意: この記事は批判を含んでおり、また厭味ったらしい文体で書かれています。もちろん Node.js や npm のような巨大なプロジェクトをメンテナンスすることは大変な苦労であると理解してますし、間違いが明らかになるのに時間がかかるのも分かります。私はこの状況に対してフラストレーションを感じているのであって、関わった人々に何かを言うつもりはありません。それでもこういう書き方をしているのは当のフラストレーションが年々悪化しており、この悲惨な状況を実際よりも小さく見せるようなマネはしたくなかったからです。私が特に見ていて辛いと感じるのはこれが初めてのプログラミングの体験になった人々、加えてまったく無関係の警告のせいでせっかくの変更をデプロイできなくなってしまった人々、みんなです。うれしいことに、[この問題について検討してくれる人が現れています](https://twitter.com/bitandbang/status/141280337827975987)。解決策があがった際には私もできるだけ情報提供をしていきたいと思っています 💜*

---

## npm audit の挙動について

*詳しい挙動についてすでにご存知の人は[読み飛ばしてもらって構いません](#なぜ-npm-audit-は破綻しているのか)。*

あなたの Node.js のアプリケーションは依存ツリーを持っています。こんな感じに見えるはずです。

```
your-app
  - view-library@1.0.0
  - design-system@1.0.0
  - model-layer@1.0.0
    - database-layer@1.0.0
      - network-utility@1.0.0
```

大抵の場合、このツリーはもっとずっと深いはずです。

ここで、たとえば `network-utility@1.0.0` に脆弱性が見つかったと考えてみましょう。

```
your-app
  - view-library@1.0.0
  - design-system@1.0.0
  - model-layer@1.0.0
    - database-layer@1.0.0
      - network-utility@1.0.0 (脆弱性あり!)
```

これは特別なレジストリに publish されており、この後 `npm audit` を実行したときに `npm` はそこにアクセスします。npm v6+ 以降では、`npm install` のたびにこのことを教えてくれます。

```
1 vulnerabilities (0 moderate, 1 high)

To address issues that do not require attention, run:
  npm audit fix

To address all issues (including breaking changes), run:
  npm audit fix --force
```

あなたが `npm audit fix` を実行すると、npm は修正の入った最新版の `network-utility@1.0.1` をインストールしに行きます。もし `database-layer` が `network-utility@1.0.0` を*完全一致で*バージョン指定しているとかでない限り、つまり `1.0.1` を含むような幅を持った指定をしている限り、この修正は「そのまま動く」はずです。アプリケーションは壊れません。

```
your-app
  - view-library@1.0.0
  - design-system@1.0.0
  - model-layer@1.0.0
    - database-layer@1.0.0
      - network-utility@1.0.1 (修正済！)
```

万が一、`database-layer@1.0.0` が完全一致で `network-utility@1.0.0` に依存していることがあるかもしれません。そういうときは `database-layer` のメンテナも新しいバージョンを、`network-utility@1.0.1` を許容する形でリリースする必要があります。

```
your-app
  - view-library@1.0.0
  - design-system@1.0.0
  - model-layer@1.0.0
    - database-layer@1.0.1 (修正できるようにこちらもアップデート)
      - network-utility@1.0.1 (修正済!)
```

ツリーをきれいにアップデートする方法がない場合は、最終手段として `npm audit fix --force` を使えます。この方法を採れるのは `database-layer` が新しいバージョンの `network-utility` を許容しておらず、_その上_ 新しいリリースもしてくれてないという状況のときです。これは breaking changes のリスクを承知の上で、自己責任でこの問題を引き受けようという判断に当たります。そういう選択肢自体はあってしかるべきでしょう。

**これが `npm audit` の理論上の挙動です。**

賢い人が言ってた通り、理論上は理論と実践の間に違いはありません。が、実践上はあるわけです。楽しい話はここからです。

## なぜ npm audit は破綻しているのか

では、実践において `npm audit` がどう動くのかを見ていきます。実験には Create React App を使います。

詳しくない人向けに説明すると、これは複数のツールをつなぎ合わせた統合的な窓口です。Babel、webpack、TypeScript、ESLint、PostCSS、Terser…… などを含みます。Create React App はあなたのソースコードから静的な HTML+JS+CSS の入ったフォルダに変換します。**大切なのは、ここでは Node.js のアプリケーションは作られないということです。**

新規のプロジェクトを作ってみましょう！

```
npx create-react-app myapp
```

プロジェクトを作成すると直後にこんなものが見えます。

```
found 5 vulnerabilities (3 moderate, 2 high)
  run `npm audit fix` to fix them, or `npm audit` for details
```

なんと、マズそうなことが起こりました！たった今つくったばかりのアプリケーションがもう脆弱性を含んでいます！

少なくとも npm はそう言ってますし……。

`npm audit` を実行して何が起きているかを見ていきましょう。

### 第一の「脆弱性」

これは `npm audit` が報告してきた1つ目の問題点です。

```
┌───────────────┬──────────────────────────────────────────────────────────────┐
│ Moderate      │ Regular Expression Denial of Service                         │
├───────────────┼──────────────────────────────────────────────────────────────┤
│ Package       │ browserslist                                                 │
├───────────────┼──────────────────────────────────────────────────────────────┤
│ Patched in    │ >=4.16.5                                                     │
├───────────────┼──────────────────────────────────────────────────────────────┤
│ Dependency of │ react-scripts                                                │
├───────────────┼──────────────────────────────────────────────────────────────┤
│ Path          │ react-scripts > react-dev-utils > browserslist               │
├───────────────┼──────────────────────────────────────────────────────────────┤
│ More info     │ https://npmjs.com/advisories/1747                            │
└───────────────┴──────────────────────────────────────────────────────────────┘
```

見ての通り、`browserslist` に脆弱性があります。これはどういうパッケージで、どうやって使われているのでしょう？ Create React App はあなたの対象ブラウザに向けて最適化された CSS を生成します。たとえば、あなたの `package.json` ではモダンブラウザだけを対象にすれば良いとしてみましょう。

```jsx
  "browserslist": {
    "production": [
      ">0.2%",
      "not dead",
      "not op_mini all"
    ],
    "development": [
      "last 1 chrome version",
      "last 1 firefox version",
      "last 1 safari version"
    ]
  }
```

こうすると、最終結果には flexbox で昔必要だったハックが含まれなくなります。対象ブラウザの設定は複数のツールから同じフォーマットで使われるものなので、Create React App はひとつの `browserslist` パッケージを使って設定ファイルをパースしているのです。

さて、ここでいう脆弱性とは何でしょうか？ [“Regular Expression Denial of Service”](https://owasp.org/www-community/attacks/Regular_expression_Denial_of_Service_-_ReDoS) というのは `browserslist` 内で使われている正規表現が、悪意のある入力を受け取った場合に非常に遅くなってしまうという問題です。攻撃者が特殊な設定した正規表現を作り込んで `browserlist` に渡すと、その速度が指数関数的に落ちてしまうということです。なんてひどい……

っていやいや、待ってください？ちょっとこのアプリケーションの動きを思い出してみましょう。あなたは設定ファイルを _自身のマシンに_ 持っていて、あなた自身がプロジェクトを _ビルドしています_。できあがるのは静的な HTML+CSS+JS の入ったフォルダで、これは静的にホスティングされます。アプリケーションのユーザーがあなたの `package.json` に影響を及ぼす方法はシンプルに**存在しません**。 **まったくもって意味がわかりませんよね。** もし攻撃者があなたのマシンにアクセスして設定ファイルをいじれるのだとしたら、正規表現が遅いことなんかより遥かにまずい問題が起こっているはずですよ！

はい、ということでこの「中程度の」「脆弱性」は、中程度でもなければ脆弱性でもなかったわけです。このまま放っておきましょう。

**評決: 本件における「脆弱性」とはまったくばかげたものです。**

### 第二の「脆弱性」

次に見えるのは、`npm audit` が良かれと思って報告してくれたもう一つの問題点です。

```
┌───────────────┬──────────────────────────────────────────────────────────────┐
│ Moderate      │ Regular expression denial of service                         │
├───────────────┼──────────────────────────────────────────────────────────────┤
│ Package       │ glob-parent                                                  │
├───────────────┼──────────────────────────────────────────────────────────────┤
│ Patched in    │ >=5.1.2                                                      │
├───────────────┼──────────────────────────────────────────────────────────────┤
│ Dependency of │ react-scripts                                                │
├───────────────┼──────────────────────────────────────────────────────────────┤
│ Path          │ react-scripts > webpack-dev-server > chokidar > glob-parent  │
├───────────────┼──────────────────────────────────────────────────────────────┤
│ More info     │ https://npmjs.com/advisories/1751                            │
└───────────────┴──────────────────────────────────────────────────────────────┘
```

では `webpack-dev-server > chokidar > glob-parent` という依存関係の流れを見てみましょう。ここに出てくる `webpack-dev-server` とは **開発環境でのみ使用する**サーバーで、あなたのアプリケーションを **ローカル環境で** 素速く表示してくれるものです。このパッケージは `chokidar` という、ファイルシステムの変更（たとえばエディタ上でファイルが保存されたとか）を監視します。この `chokidar` はさらに [`glob-parent`](https://www.npmjs.com/package/glob-parent) を使用して、ファイルシステム監視のパターン指定からどこが監視対象になるかを抽出しています。

残念なことに `glob-parent` には脆弱性がありました！もし攻撃者が特殊なファイルパスを作り込んでいた場合、その実行速度は指数関数的に遅くなってしまい、その結果……

って待ってください。開発用サーバーというのは自分のコンピュータ上にあるものですよ。ファイルだって自分のです。ファイル監視の仕組みも *自分自身で* 書いた設定ファイルを使用しています。ここに出てくるロジックの、どの部分も自分のコンピュータから出ていませんね。もしこの攻撃者が、ローカル環境で開発している最中のあなたのコンピュータにログインできるほどに卓越した相手だとしたら、特殊な長いファイルパス名を作って開発速度を落とすなんて真似はとてもしそうにありません。そうではなく、機密情報を盗みにくるはずです。**この驚異全体がばかげた仮定と言わざるを得ません。**

見る限りこの「中程度の」「脆弱性」は、このプロジェクトの文脈においては中程度でも脆弱性でもありません。

**評決: 本「脆弱性」はこの文脈ではばかげたものです。**

### 第三の「脆弱性」

今度はこっちを見てみましょう。

```
┌───────────────┬──────────────────────────────────────────────────────────────┐
│ Moderate      │ Regular expression denial of service                         │
├───────────────┼──────────────────────────────────────────────────────────────┤
│ Package       │ glob-parent                                                  │
├───────────────┼──────────────────────────────────────────────────────────────┤
│ Patched in    │ >=5.1.2                                                      │
├───────────────┼──────────────────────────────────────────────────────────────┤
│ Dependency of │ react-scripts                                                │
├───────────────┼──────────────────────────────────────────────────────────────┤
│ Path          │ react-scripts > webpack > watchpack > watchpack-chokidar2 >  │
│               │ chokidar > glob-parent                                       │
├───────────────┼──────────────────────────────────────────────────────────────┤
│ More info     │ https://npmjs.com/advisories/1751                            │
└───────────────┴──────────────────────────────────────────────────────────────┘
```

待ってください、上と同じじゃないですか。依存関係の経路が違うというだけで。

Wait, it’s the same thing as above, but through a different dependency path.

**評決: 本「脆弱性」はこの文脈ではばかげたものです。**

### 第四の「脆弱性」

なんてこった、これはひどそうです！ **`npm audit` が真っ赤な文字を出してきやがりましたよ。**

```
┌───────────────┬──────────────────────────────────────────────────────────────┐
│ High          │ Denial of Service                                            │
├───────────────┼──────────────────────────────────────────────────────────────┤
│ Package       │ css-what                                                     │
├───────────────┼──────────────────────────────────────────────────────────────┤
│ Patched in    │ >=5.0.1                                                      │
├───────────────┼──────────────────────────────────────────────────────────────┤
│ Dependency of │ react-scripts                                                │
├───────────────┼──────────────────────────────────────────────────────────────┤
│ Path          │ react-scripts > @svgr/webpack > @svgr/plugin-svgo > svgo >   │
│               │ css-select > css-what                                        │
├───────────────┼──────────────────────────────────────────────────────────────┤
│ More info     │ https://npmjs.com/advisories/1754                            │
└───────────────┴──────────────────────────────────────────────────────────────┘
```

深刻度が「高」とはどんな内容なんでしょう？ 「Denial of service」ですって。自分のサービスに DoS 攻撃なんて勘弁ですよ！そんなのひどすぎます……

件の[issue](https://www.npmjs.com/advisories/1754)を見てみましょう。見ての通り [`css-what`](https://www.npmjs.com/package/css-what) という CSS セレクタのパーサーが、特殊な入力を受け取った際に非常に遅くなることがあるようです。このパーサーは SVG のファイルから React のコンポーネントを生成するプラグインから使われています。

ということは、もし攻撃者が私の開発環境またはソースコードを掌握した場合、攻撃用に作られた CSS のセレクタを含む特殊な SVG ファイルを仕込むことで、私のビルド時間を遅くできるということです。
ここから分かるように……

って待ってください！？ もし攻撃者が私のアプリケーションのソースコードをいじれるのだとしたら、多分仕込んでくるのはビットコインのマイナーとかだと思いますよ。何をどうしたら SVG をアプリ内に入れようなんて思います？ SVG でビットコインとか掘れるんだったら別ですけど。そういうわけで、この話はもう*まったく*意味がわかりませんね。

**評決: 本「脆弱性」はこの文脈ではばかげたものです。**

深刻度「高」ですらこのアリサマですよ！

### 第五の「脆弱性」

```
┌───────────────┬──────────────────────────────────────────────────────────────┐
│ High          │ Denial of Service                                            │
├───────────────┼──────────────────────────────────────────────────────────────┤
│ Package       │ css-what                                                     │
├───────────────┼──────────────────────────────────────────────────────────────┤
│ Patched in    │ >=5.0.1                                                      │
├───────────────┼──────────────────────────────────────────────────────────────┤
│ Dependency of │ react-scripts                                                │
├───────────────┼──────────────────────────────────────────────────────────────┤
│ Path          │ react-scripts > optimize-css-assets-webpack-plugin > cssnano │
│               │ > cssnano-preset-default > postcss-svgo > svgo > css-select  │
│               │ > css-what                                                   │
├───────────────┼──────────────────────────────────────────────────────────────┤
│ More info     │ https://npmjs.com/advisories/1754                            │

└───────────────┴──────────────────────────────────────────────────────────────┘
```

これはさっきのやつと全く同じです。

**評決: 本「脆弱性」はこの文脈ではばかげたものです。**

### この話まだ続けます？

ここまでオオカミ少年が5回も叫びにきました。うち2つは重複しています。残りの3つは、実際の使われ方において問題のないばかげたものでした。

５回程度の誤報ならまぁそんなに悪い話じゃないでしょうね。

**残念ながら、ほんとは数百あるわけです。**

[いくつか](https://github.com/facebook/create-react-app/issues/11053)ここに[典型的な](https://github.com/facebook/create-react-app/issues/11092)スレッドを挙げてみますが、もっとたくさんの事例に[ここからリンクを貼っています](https://github.com/facebook/create-react-app/issues/11174)。

<img src="https://imgur.com/ABDK4Ky.png" alt="Screenshot of many GH threads" />

**私は `npm audit` が問題を報告してくる度に毎回数時間は費やしていて、そんなことがここ数ヶ月は続いていましたが、その全てが Create React App のようなビルドツールの依存としては偽陽性の結果としか思えませんでした。**

もちろん、直すことは出来ます。トップレベルでの依存関係を完全一致で指定しないように緩めるような方法です（ ただしそれをするとパッチバージョンの更新でバグが起きる可能性は高まるでしょう ）。この茶番セキュリティ劇場の前に座っていればもっとたくさんリリースを打てるかもしれませんね。

でも、それだけじゃダメなんです。もしあなたのテストが嘘の理由で ９９% 落ちるなんてことがあったらどうしますか？みんなの時間が無駄な努力に費やされ、惨めな気持ちになるでしょう。

* **初心者はこれによって惨めな気持ちになるでしょう。** 彼らがはじめてのプログラミングを Node.js のエコシステムでやっていると、まずこれにぶつかるわけです。Node.js/npm のインストールはさほど混乱せずに済んだのに（チュートリアルに従ってどこかに `sudo` をつけちゃった場合はせいぜい頑張って欲しいですが）、ネット上の example を試したり自分のプロジェクトを作ってみようとしたらこういうもんだと言わんばかりの歓迎を受けるのです。初心者はそもそも正規表現が*何なのかが*わかりません。RegExp DDoS やプロトタイプ汚染が心配を要することなのか、特に静的な HTML+CSS+JS を作るビルドツールにおいてそれが関係あるのかを区別するノウハウも当然ないでしょう。
* **経験豊富なアプリケーション開発者も惨めな気持ちになるでしょう。**彼らはどうみても無駄な仕事に時間を費やすか、`npm audit` は現実のセキュリティ監査に _設計レベルで_ 向かない不良品であるとセキュリティ担当部署を説得しないといけないわけです。そう、なぜか現状だとデフォルトになってるんだよね。
* **ライブラリのメンテナも惨めな気持ちになるでしょう。**バグ修正や機能追加をするかわりに、プロジェクトには影響のない嘘の脆弱性対応を取り込まないといけないからです。そうしないと利用者がイライラするか、怖いと思うか、その両方になるからです。
* **そして、我々のユーザーもいつか惨めな気持ちになるでしょう。**われわれは開発者人生を通じて教え込まれた結果、大量の警告に埋もれて理解できない人か、どうせ嘘しか書いてないからと _無視する_ 人のいずれかになっていきます。なにせ経験ある先輩がどのケースにもまともな issue は報告されないものだと（正しく）教えてくれてるわけですから。

`npm audit fix` も（ツールが利用を推奨していますが）バグっており役に立ちません。今日私は `npm audit fix --force` を走らせたところメインの依存のバージョンが**下がりました**。結果３年も前のバージョンになり、そっちには現に _本物の_ 脆弱性がありました。ありがとう、npm、よくやったね。

## 今後どうなるか

どうやって解決したら良いのか私はわかりません。私は最初は導入を避けていたのもあり、解決に向いてる人間ではなさそうです。私が知ってるのは、とにかくひどい壊れ方をしているということだけです。

ありうる解決策で私が見たことあるものを挙げておきます。

* **本番環境で動かないものは `devDependencies` に移動する。**この方法を使うとある依存は本番環境のコードでは使われないという指定ができます。なのでそれに関するリスクはないと言えます。しかしこの解決には血管があります。
  - `npm audit` は開発用の依存関係もデフォルトで警告します。開発用の依存に対する警告を表示しないためには `npm audit --production` を実行する必要があることを _知っていないといけません_。しかしこの方法を知ってるような人はそもそも `npm audit` を信用してないんじゃないでしょうか。それに初心者の役には立ちませんし、勤め先のセキュリティ部門がすべてを監査したがっているという場合はどうしようもありません。
  - これでもまだ `npm install` は素の `npm audit` の情報を使います。なので、インストールの度にすべての偽陽性の結果をちゃんと見るということになります。
  - セキュリティのプロならみんな言うように、開発用ツールが攻撃の経路になることは _実際にあります_。むしろこれは発見が難しく、強い信頼のもとにコードが実行される分もっとも危険な経路の一つとさえ言えます。**現状が酷いと思う最大の理由はこれです。`npm audit` のせいでメンテナが無視して良いことになった嘘の問題たちの中に、真に危ない問題が埋もれてしまうのです。**これが起こるのは時間の問題だと思います。


* **Inline all dependencies during publish.** This is what I’m increasingly seeing packages similar to Create React App do. For example, both [Vite](https://unpkg.com/browse/vite@2.4.1/dist/node/) and [Next.js](https://unpkg.com/browse/next@11.0.1/dist/) simply bundle their dependencies directly in the package instead of relying on the npm `node_modules` mechanism. From a maintainer’s point of view, [the upsides are clear](https://github.com/vitejs/vite/blob/main/.github/contributing.md#notes-on-dependencies): you get faster boot time, smaller downloads, and — as a nice bonus — no bogus vulnerability reports from your users. It’s a neat way to game the system but I’m worried about the incentives npm is creating for the ecosystem. Inlining dependencies kind of goes against the whole point of npm.
* **Offer some way to counter-claim vulnerability reports.** The problem is not entirely unknown to Node.js and npm, of course. Different people have worked on different suggestions to fix it. For example, there is a [proposal](https://github.com/npm/rfcs/pull/18) for a way to manually resolve audit warnings so that they don’t display again. However, this still places the burden on app users, which don’t necessarily have context on what vulnerabilities deeper in the tree are real or bogus. I also have a [proposal](https://twitter.com/dan_abramov/status/1412380714012594178): I need a way to mark for my users that a certain vulnerability can’t possibly affect them. If you don’t trust my judgement, why are you running my code on your computer? I’d be happy to discuss other options too.

The root of the issue is that npm added a default behavior that, in many situations, leads to a 99%+ false positive rate, creates an incredibly confusing first programming experience, makes people fight with security departments, makes maintainers never want to deal with Node.js ecosystem ever again, and at some point will lead to actually bad vulnerabilities slipping in unnnoticed.

Something has to be done.

In the meantime, I am planning to close all GitHub issues from `npm audit` that I see going forward that don’t correspond to a _real_ vulnerability that can affect the project. I invite other maintainers to adopt the same policy. This will create frustration for our users, but the core of the issue is with npm. I am done with this security theater. Node.js/npm have all the power to fix the problem. I am in contact with them, and I hope to see this problem prioritized.

Today, `npm audit` is broken by design.

Beginners, experienced developers, maintainers, security departments, and, most importantly — our users — deserve better.
