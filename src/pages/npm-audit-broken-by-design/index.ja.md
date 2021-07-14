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


So far the boy has cried wolf five times. Two of them are duplicates. The rest are absurd non-issues in the context of how these dependencies are used.

Five false alarms wouldn’t be too bad.

**Unfortunately, there are hundreds.**

Here are a [few](https://github.com/facebook/create-react-app/issues/11053) [typical](https://github.com/facebook/create-react-app/issues/11092) threads, but there are many more [linked from here](https://github.com/facebook/create-react-app/issues/11174):

<img src="https://imgur.com/ABDK4Ky.png" alt="Screenshot of many GH threads" />

**I’ve spent several hours looking through every `npm audit` issue reported to us over the last several months, and they all appear to be false positives in the context of a build tool dependency like Create React App.**

Of course, they are possible to fix. We could relax some of the top-level dependencies to not be exact (leading to bugs in patches slipping in more often). We could make more releases just to stay ahead of this security theater.

But this is inadequate. Imagine if your tests failed 99% of the times for bogus reasons! This wastes person-decades of effort and makes everyone miserable:

* **It makes beginners miserable** because they run into this as their first programming experience in the Node.js ecosystem. As if installing Node.js/npm was not confusing enough (good luck if you added `sudo` somewhere because a tutorial told you), this is what they’re greeted with when they try examples online or even when they create a project. A beginner doesn’t know what a RegExp *is*. Of course they don’t have the know-how to be able to tell whether a RegExp DDoS or prototype pollution is something to worry about when they’re using a build tool to produce a static HTML+CSS+JS site.
* **It makes experienced app developers miserable** because they have to either waste time doing obviously unnecessary work, or fight with their security departments trying to explain how `npm audit` is a broken tool unsuitable for real security audits _by design_. Yeah, somehow it was made a default in this state.
* **It makes maintainers miserable** because instead of working on bugfixes and improvements, they have to pull in bogus vulnerability fixes that can’t possibly affect their project because otherwise their users are frustrated, scared, or both.
* **Someday, it will make our users miserable** because we have trained an entire generation of developers to either not understand the warnings due to being overwhelmed, or to simply _ignore_ them because they always show up but the experienced developers (correctly) tell them there is no real issue in each case.

It doesn’t help that `npm audit fix` (which the tool suggests using) is buggy. I ran `npm audit fix --force` today and it **downgraded** the main dependency to a three-year-old version with actual _real_ vulnerabilities. Thanks, npm, great job.

## What next?

I don’t know how to solve this. But I didn’t add this system in the first place, so I’m probably not the best person to solve it. All I know is it’s horribly broken.

There are a few possible solutions that I have seen.

* **Move dependency to `devDependencies` if it doesn’t run in production.** This offers a way to specify that some dependency isn’t used in production code paths, so there is no risk associated with it. However, this solution is flawed:
  - `npm audit` still warns for development dependencies by default. You have to _know_ to run `npm audit --production` to not see the warnings from development dependencies. People who know to do that probably already don’t trust it anyway. This also doesn’t help beginners or people working at companies whose security departments want to audit everything.
  - `npm install` still uses information from plain `npm audit`, so you will effectively still see all the false positives every time you install something.
  - As any security professional will tell you, development dependencies actually _are_ an attack vector, and perhaps one of the most dangerous ones because it’s so hard to detect and the code runs with high trust assumptions. **This is why the situation is so bad in particular: any real issue gets buried below dozens of non-issues that `npm audit` is training people and maintainers to ignore.** It’s only a matter of time until this happens.
* **Inline all dependencies during publish.** This is what I’m increasingly seeing packages similar to Create React App do. For example, both [Vite](https://unpkg.com/browse/vite@2.4.1/dist/node/) and [Next.js](https://unpkg.com/browse/next@11.0.1/dist/) simply bundle their dependencies directly in the package instead of relying on the npm `node_modules` mechanism. From a maintainer’s point of view, [the upsides are clear](https://github.com/vitejs/vite/blob/main/.github/contributing.md#notes-on-dependencies): you get faster boot time, smaller downloads, and — as a nice bonus — no bogus vulnerability reports from your users. It’s a neat way to game the system but I’m worried about the incentives npm is creating for the ecosystem. Inlining dependencies kind of goes against the whole point of npm.
* **Offer some way to counter-claim vulnerability reports.** The problem is not entirely unknown to Node.js and npm, of course. Different people have worked on different suggestions to fix it. For example, there is a [proposal](https://github.com/npm/rfcs/pull/18) for a way to manually resolve audit warnings so that they don’t display again. However, this still places the burden on app users, which don’t necessarily have context on what vulnerabilities deeper in the tree are real or bogus. I also have a [proposal](https://twitter.com/dan_abramov/status/1412380714012594178): I need a way to mark for my users that a certain vulnerability can’t possibly affect them. If you don’t trust my judgement, why are you running my code on your computer? I’d be happy to discuss other options too.

The root of the issue is that npm added a default behavior that, in many situations, leads to a 99%+ false positive rate, creates an incredibly confusing first programming experience, makes people fight with security departments, makes maintainers never want to deal with Node.js ecosystem ever again, and at some point will lead to actually bad vulnerabilities slipping in unnnoticed.

Something has to be done.

In the meantime, I am planning to close all GitHub issues from `npm audit` that I see going forward that don’t correspond to a _real_ vulnerability that can affect the project. I invite other maintainers to adopt the same policy. This will create frustration for our users, but the core of the issue is with npm. I am done with this security theater. Node.js/npm have all the power to fix the problem. I am in contact with them, and I hope to see this problem prioritized.

Today, `npm audit` is broken by design.

Beginners, experienced developers, maintainers, security departments, and, most importantly — our users — deserve better.
