---
title: “Bug-O” 記法
date: '2019-01-25'
spoiler: あなたのAPIの🐞(<i>n</i>)は何?
---

パフォーマンスに敏感なコードを書く時に,そのアルゴリズムの複雑性を気に留めておくことは良いアイデアです。これはしばしば[Big-O notation（ビッグ・オー記法）](https://rob-bell.net/2009/06/a-beginners-guide-to-big-o-notation/)で表現されます。

Big-O記法は**より多くのデータを渡した時にアルゴリズムがどの程度遅くなるのか**を測る尺度です。例えば,ソートのアルゴリズムが O(<i>n<sup>2</sup></i>) の複雑性を持つ場合,, 50倍のアイテムをソートするにはおよそ50<sup>2</sup> = 2,500 倍遅くなってしまいます。 Big O は正確な数字を示しませんが,アルゴリズムがどの程度*scales（拡大）*できるか理解する助けになります。

例: O(<i>n</i>), O(<i>n</i> log <i>n</i>), O(<i>n<sup>2</sup></i>), O(<i>n!</i>).


しかし,**この記事はアルゴリズムやパフォーマンスについての記事ではありません**。APIとデバッグについての記事です。APIデザインでもとても似たような考慮ができることを明らかにします。

---

私達の時間の中で重要な部分は,コードの中の失敗を見つけて修正する時間です。多くの開発者は早くバグを見つけたいものです。より満足なコードにしようとすると終いには,ロードマップ上の何かを実装できたはずなのに,一つのバグを追うのに丸一日を費やしてしまいます。

デバッグの経験は私達の抽象化やライブラリ,ツールの選択に影響します。APIと言語のデザインにはあらゆるクラスの失敗を起こらなくするものもあります。終わりのない問題を生み出すものもあります。**でも,どちらがどちらなのか分かりますか？**

APIに関するネット上の議論の多くは美学に一番こだわっています。しかしそれは実際にAPIを使うことがどのようなことなのか[十分に語れていません](/optimized-for-change/)。

**これについて考えることを助ける基準があります。私はそれを*Bug-O*notation(バグ・オー記法)と呼んでいます:**

<font size="40">🐞(<i>n</i>)</font>

Big-Oはインプットが増えるにつれてアルゴリズムがどの程度遅くなるのかを記述するものでした。*Bug-O*はコードベースが増えるに連れてAPIが*あなたを*どの程度遅くさせるかを記述するものです。

---

例えば,手動で`node.appendChild()`と`node.removeChild()`のような命令演算で時間と共にDOMを更新し,明確な構造を持たない以下のようなコードを考えてみてください:

```jsx
function trySubmit() {
  // Section 1
  let spinner = createSpinner();
  formStatus.appendChild(spinner);
  submitForm().then(() => {
  	// Section 2
    formStatus.removeChild(spinner);
    let successMessage = createSuccessMessage();
    formStatus.appendChild(successMessage);
  }).catch(error => {
  	// Section 3
    formStatus.removeChild(spinner);
    let errorMessage = createErrorMessage(error);
    let retryButton = createRetryButton();
    formStatus.appendChild(errorMessage);
    formStatus.appendChild(retryButton)
    retryButton.addEventListener('click', function() {
      // Section 4
      formStatus.removeChild(errorMessage);
      formStatus.removeChild(retryButton);
      trySubmit();
    });
  })
}
```

このコードの問題は,これが“醜い”ことではありません。私達は美学については話していないのです。**問題は,もしこのコードの中にバグがあっても,どこから見始めればいいのか分からないことです。**

**コールバックとイベントの発火が行われる順番のせいで,このプログラムが取りうるコードのふるまいの組み合わせ爆発が起こっています。**正しいメッセージが出てくる場合もあります。その他については,二重のスピナーや失敗とエラーメッセージが同時に出てきて,そしておそらくクラッシュします。

この関数は4つの異なるセクションを持っていてこれらの順序に対する保証は何もありません。私の非常に非科学的な計算によるとこれらが引き起こしうる順序は 4×3×2×1 = 24 通りあります。もしさらに4つのコードセグメントを追加したら,8×7×6×5×4×3×2×1 —*4000通り*の組み合わせになります。なんて幸せなデバッグなんだろう。

**言い換えれば,このアプローチのBug-Oは🐞(<i>n!</i>)**で,*n*にはDOMにふれるコードセグメントの数が入ります。そうです,これは*階乗*になっています。もちろん,私はここでとても科学的になっているわけではありません。全ての遷移が実際に起こりうるわけではありません。しかし一方,これらのどのセグメントも一回以上は起こる可能性があります。<span style="word-break: keep-all">🐞(*¯\\_(ツ)_/¯*)</span>がより正確なものになるでしょうが,これでもかなり酷いです。もっといい方法があります。

---

このコードのBug-Oを改善するために,起こりうる状態と結果の数に制限をかけることができます。これをするためにはどんなライブラリも必要としません。これは単に,私達のコードに構造を強制するという問題なのです。ここに,それを可能とする一例を示します:

```jsx
let currentState = {
  step: 'initial', // 'initial' | 'pending' | 'success' | 'error'
};

function trySubmit() {
  if (currentState.step === 'pending') {
    // 二度送信されることを許可しない
    return;
  }
  setState({ step: 'pending' });
  submitForm.then(() => {
    setState({ step: 'success' });
  }).catch(error => {
    setState({ step: 'error', error });
  });
}

function setState(nextState) {
  // 既存の全ての小要素を削除する
  formStatus.innerHTML = '';

  currentState = nextState;
  switch (nextState.step) {
    case 'initial':
      break;
    case 'pending':
      formStatus.appendChild(spinner);
      break;
    case 'success':
      let successMessage = createSuccessMessage();
      formStatus.appendChild(successMessage);
      break;
    case 'error':
      let errorMessage = createErrorMessage(nextState.error);
      let retryButton = createRetryButton();
      formStatus.appendChild(errorMessage);
      formStatus.appendChild(retryButton);
      retryButton.addEventListener('click', trySubmit);
      break;
  }
}
```

そこまで難しくはないでしょう。ほんの少し冗長になります。ですが,この行のおかげでデバッグは*劇的に*シンプルになります:

```jsx{3}
function setState(nextState) {
  // 既存の全ての小要素を削除する
  formStatus.innerHTML = '';

  // ... the code adding stuff to formStatus ...
```

どんな操作の前でもフォームの状態を空にすることで,DOM操作が常に一から始まることを保証します。これが,避けられない[エントロピー](/the-elements-of-ui-engineering/)と戦うための方法です — 失敗が蓄積されることを*許さない*という手段で。これは“スイッチを消して,再びつける”に相当するコーディングで,とてもよく機能します。

**もし出力にバグがあったのなら,*ひとつ*段階をさかのぼるだけでよいのです — 前の`setState` の呼び出しに**。 レンダリングの結果をデバッグするためのBug-Oは🐞(*n*)で,*n*にはレンダリングを行うコード部分の数が入ります。ここでは,たったの4です(なぜなら`switch`文の中で4つのケースがあるから)。

まだ状態(state)を*設定*をする際に競合状態がありますが,これらをデバッグすることは,どの中間の状態もログに出力され検査されているので比較的簡単です。どんな望まない遷移も明示的に禁止することもできます:

```jsx
function trySubmit() {
  if (currentState.step === 'pending') {
    // 二度送信されることを許可しない
    return;
  }
```

もちろん,常にDOMをリセットすることはトレードオフになります。 単純に毎回DOMを消去して生成することは,内部状態を破壊し,フォーカスを失わせ,大きなアプリではひどいパフォーマンスの問題も引き起こすでしょう。

これがReactのようなライブラリが役に立つ理由です。これらを使うことで以下のように行う必要なく,UIを常に一から生成するというパラダイムで考えることが可能になります:

```jsx
function FormStatus() {
  let [state, setState] = useState({
    step: 'initial'
  });

  function handleSubmit(e) {
    e.preventDefault();
    if (state.step === 'pending') {
      // 二度送信されることを許可しない
      return;
    }
    setState({ step: 'pending' });
    submitForm.then(() => {
      setState({ step: 'success' });
    }).catch(error => {
      setState({ step: 'error', error });
    });
  }

  let content;
  switch (state.step) {
    case 'pending':
      content = <Spinner />;
      break;
    case 'success':
      content = <SuccessMessage />;
      break;
    case 'error':
      content = (
        <>
          <ErrorMessage error={state.error} />
          <RetryButton onClick={handleSubmit} />
        </>
      );
      break;
  }

  return (
    <form onSubmit={handleSubmit}>
      {content}
    </form>
  );
}
```

コードが少し違って見えるでしょうが,原則は同じです。コンポーネントの抽象化は,ページ内の*他の*コードがDOMや状態によって干渉していないことが明らかになるよう,境界を強調します。コンポーネント化を行うことはBug-Oを減らす手助けになるのです。

実際に,ReactアプリのDOMの中で値が間違っているように見える*どんな*場合でも,それがどこから来たのかはその値以前のReactツリー中のコンポーネントのコードを一つずつ見ていくだけで追うことができます。アプリのサイズは問題ではなく,レンダリングされた値を追うことは🐞(*Reactツリーの高さ*)なのです。

**次にAPIについての議論を見るときには,このように考えてみて下さい:この中で共通するデバッグのタスクの🐞(*n*)は何だ?** 既存のAPIと普段とても使い慣れている原理についてはどうだろうか? Redux, CSS, 継承 — それらは全て個別のBug-Oを持っているのです。

---