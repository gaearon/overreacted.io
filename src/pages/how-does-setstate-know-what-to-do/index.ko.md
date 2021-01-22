---
title: setState는 뭘 해야되는지 어떻게 알까요?
date: '2018-12-09'
spoiler: 종속성 삽입(Dependency injection)은 간단해야 좋습니다.
---

만약에 `setState`를 컴포넌트에서 
쓴다면, 어떤일이 일어날지 아시나요?

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

물론, 리액트는 다음 상태인 `{ clicked: true }`와 함께 다시 컴포넌트를 랜더(render)하고 `<h1>Thanks</h1>` 요소에 맞게 돔을 업데이트합니다.

어렵지않아 보이는 군요. 그런데 말입니다, *리액트*가 하는 걸까요? 아니면*리액트 돔*?

돔을 업데이트하는건 돔의 책임인것 같습니다. 하지만 우리가 `this.setState()`를 부를 때, 리액트 돔(React DOM)으로부터 부르는 것이 아닙니다. 그리고 우리의 `React.Component`의 기본 클라스는 리액트 자체에 정의되어 있습니다.

자 그럼 어떻게 `setState()`는 `React.Component`안에서 돔을 업데이트 할 수 있는걸까요?

**첨부사항: [거의 대부분의](/why-do-react-elements-have-typeof-property/) [다른](/how-does-react-tell-a-class-from-a-function/) [포스트들](/why-do-we-write-super-props/)처럼 이 포스트에서도, 리액트를 이용해 어떤 생산적인 것들을 할 수 있는지에 관한것은 알 *필요*는 없습니다. 이포스트는 그 커튼뒤에 가려진 것들에 대해 궁금해하는 사람들을 위한것이니까요. 절대적으로 선택사항입니다!**

---

아마 우리는 `React.Component` 클라스가 돔을 업데이트하는 논리를 가지고 있다고 생각할 수 있습니다.

하지만 그게 사실이라면, 어떻게 `this.setState()`는 다른 환경에서도 적용될 수 있는걸까요? 예를들어, 리액트 네이티브 앱에 있는 컴포넌트들도 `React.Component`를 확장(extend)할 수 있습니다. 그들도 우리가 위에서 한것처럼 `this.setState()`라고 부릅니다, 그리고 리액트 네이티브는 돔 대신에 안드로이드나 iOS 네이티브 뷰(native views)들과 연동에서 일을 합니다.

당신은 아마도 리액트 테스트 렌더링을 담당하는 소프트웨어인 렌더러나 얕은 렌더러도 익숙 할 겁니다. 두 개 다 테스트하는 방식은 당신이 보통의 컴포넌트들을 랜더 할 수 있게 해주고 `this.setState()`를 그것들 안에서 부를 수 있게 해줍니다. 하지만 둘다 돔과 연결되서 일하지는 않죠.

만약 당신이 렌더러를 [리액트 아트](https://github.com/facebook/react/tree/master/packages/react-art)이용한다면, 아마도 한 개 페이지당 한 개 이상의 렌더러를 사용할 수 있다는걸 알고 있을 겁니다. (예를 들자면, 아트 컴포넌트들은 리액트 돔이란 트리 안에서 일을 하는겁니다.) 이것은 글로벌적인 플래그(global flag)를 만들게 하거나 변수가 계속되지 못하게 합니다.

그렇다면 어떻게 **`React.Component`는 상태를 특정 플랫폼의 코드를 업데이트하고 다루는걸까요?** 이게 어떻게 일어나는지 알아보기 전에, 페키지들이 어떻게 나누어지고 왜 나누어지는지에 대해 좀 더 깊에 알아봅시다.

---

종종 리액트 엔젠이 리액트 페키지 안에 있다는 오해가 종종 발생합니다. 이건 사실이 아니에요.

사실, [페키지가 리액트 0.14으로 나눈](https://reactjs.org/blog/2015/07/03/react-v0.14-beta-1.html#two-packages)이후부터 쭉, 리액트 페키지는 오직 의도적으로 컴포넌트들을 *정의*하기위한 API들만 드러냈습니다. 대부분의 리액트 *실행* 은 “렌더러들”안에 있습니다.

`리액트-돔`, `리액트-돔/서버`, `리액트-네이티브`, `리액트-테스트-렌더러`, `리액트-아트` 이것들은 전부 렌더러들의 예시들입니다(그리고 당신은 [당신 자신만의](https://github.com/facebook/react/blob/master/packages/react-reconciler/README.md#practical-examples)것을 만들수도 있습니다).

이러한 이유에서 `리액트` 페키지가 당신이 어떤 플랫폼을 선택하든간에 유용한 것 입니다. `React.Component`, `React.createElement`, `React.Children`의 유틸리티들 그리고 (더나아가) [후크들](https://reactjs.org/docs/hooks-intro.html)과 같이 보내진것들은, 지정된 플렛폼들의 독립된것들입니다. 당신이 리액트 돔이든, 리액트 돔 서버, 또는 리액트 네이티브를 실행하든, 당신의 컴포넌트들은 임포트할것이고 같은 방법으로 그것들을 사용할 것입니다.

반대로, 렌더러 페키지들은 리액트 체계를 돔 노드 안에 넣을수 있도록 해주는 `ReactDOM.render()`같은 특정-플렛폼 API들을 노출시킵니다. 각각의 렌더러는 API를 이런 식으로 제공합니다. 이상적으로는, 대부분의  *컴포넌트들*은 렌더러로부터 아무것도 임포트 하지 않아도 됩니다. 이것들은 그들을 더욱 이동하기 편하게 만듭니다.

**대부분의 사람들은 리액트 엔진이 각각의 렌더러안에 있다고 상상합니다.** 
많은 렌더러들은 같은 코드의 카피를 가지고있습니다 - 우리는 이것을 [“reconciler”](https://github.com/facebook/react/tree/master/packages/react-reconciler)라고 합니다. [만드는 순서](https://reactjs.org/blog/2017/12/15/improving-the-repository-infrastructure.html#migrating-to-google-closure-compiler)는 reconciler 코드를 렌더러 코드와 함께 더 나은 성과를 내기위한 하나의 최적화된 번들로 만드는겁니다. (코드를 복사하는것은 주로 번들 크기에 좋지는 않지만 방대한 리액트 사용자의 대부분이 `리액트-돔`과 같이 한번에 하나의 렌더러를 사용합니다.)

여기서 배워야할 것은 `리액트` 페키지들은 오직 당신이 리액트 특성들을 *사용*할수 있도록 해주지만 *어떻게* 사용될지에 대해서는 아무것도 모른다는 겁니다. 렌더러 페키지들은(`리액트-돔`, `리액트-네이티브`, 등등) 리액트 특성들의 실행을 제공하고 특정-플렛폼의 논리를 제공합니다. 그 코드들의 일부분은 공유(“reconciler”) 되지만 그것은 각각의 렌더러들의 실행 세부사항입니다.

---

자 이제 우리는 왜 `리액트`와 `리액트-돔` 페키지 *모두* 새로운 특징을 위해서는 업데이트가 되어야 한다는걸 알게 됬습니다. 예를 들어, 리액트 16.3이 Context API를 추가할 때, `React.createContext()`가 리액트 페키지에 노출되게 됩니다.

그러나 `React.createContext()`는 사실 문맥의 특성을 *실행*하지 않습니다. 예를 들자면, 실행은 리액트돔과 리액트 돔 서버는 달라야 합니다. 그래서 `createContext()` 몇가지의 분명한 개체들을 리턴합니다:

```jsx
// A bit simplified
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

`<MyContext.Provider>`나 `<MyContext.Consumer>`을 코드에 사용할때, *렌더러*가 어떻게 그것들을 사용할 것인지 결정합니다. 리액트 돔은 아마 문맥의 값을 하나의 방법으로 추적하지만, 리액트 돔 서버는 아마 다르게 할 것입니다.

**그러므로 만약 `리액트`를 16.3+으로 업데이트 했지만 `리액트-돔`은 업데이트를 하지않았다면, 당신은 특별한  `Provider` 와 `Consumer`를 알고 있지않은 렌더러를 사용하게 될겁니다.** 이러한 이유로 왜 오래된 `리액트-돔`이 [이러한 종류들이 사용가능하지 않다고 보여주지 않는지 알 수 있습니다](https://stackoverflow.com/a/49677020/458193).

같은 문제가 리액트 네이트브에도 적용됩니다. 하지만, 리액트 돔과는 달리, 리액트 버젼은 바로 리액트 네이트브 버젼을 강요하지 않습니다. 그것들은 각각의 독립적인 버젼이 나오는 스케줄을 가지고 있습니다. 업데이트된 렌더러 코드는 리액트 네이티브 리포지터리에 몇주에 한번씩 [다르게 같아집니다](https://github.com/facebook/react-native/commits/master/Libraries/Renderer/oss). 이게 바로 왜 리액트 네이티브에 특징들이 리액트 돔과는 다른 시기에 사용 가능해지는 이유입니다.

---

좋습니다, 그래서 이제 우리는 `리액트` 페키지에 아무 흥미러운것들이 없다는 걸 알게 되었고 실행은 `리액트-돔`, `리액트-네이트브`등등과 같은 렌더러에 있다는걸 알게 되었습니다. 하지만 이것은 우리의 질문에 답변이 되지 않습니다. 어떻게 `setState()`는  `React.Component`안에서 올바른 렌더러와 “이야기”할 수있는 걸까요?

**답은 바로 모든 렌더러는 만들어진 클라스안에 특정 분야를 설정할 수 있기 때문입니다.** 이러한 분야들은 `updater`라고 불립니다. 이것은 *당신*이 설정한다기 보단 — 리액트 돔, 리액트 돔 서버 또는 리액트 네이티브가 당신의 클라스의 사례/경우가 만들어진 즉시 설정되는 겁니다:


```jsx{4,9,14}
// Inside React DOM
const inst = new YourComponent();
inst.props = props;
inst.updater = ReactDOMUpdater;

// Inside React DOM Server
const inst = new YourComponent();
inst.props = props;
inst.updater = ReactDOMServerUpdater;

// Inside React Native
const inst = new YourComponent();
inst.props = props;
inst.updater = ReactNativeUpdater;
```

[`setState` implementation in `React.Component`](https://github.com/facebook/react/blob/ce43a8cd07c355647922480977b46713bd51883e/packages/react/src/ReactBaseClasses.js#L58-L67)을 봐보세요, 이것이 하는건 오로지 이 컴포넌트 사례/경우를 만든 렌더러에게 일을 위임하는 겁니다:

```jsx
// A bit simplified
setState(partialState, callback) {
  // Use the `updater` field to talk back to the renderer!
  this.updater.enqueueSetState(this, partialState, callback);
}
```

리액트 돔 서버는 상태 업데이트를 무시하고 경고하기를 [아마도 원할겁니다](https://github.com/facebook/react/blob/ce43a8cd07c355647922480977b46713bd51883e/packages/react-dom/src/server/ReactPartialRenderer.js#L442-L448) 반면에 리액트 돔과 리액트 네이티브는 reconciler의 복사본들이 [다루도록 할겁니다](https://github.com/facebook/react/blob/ce43a8cd07c355647922480977b46713bd51883e/packages/react-reconciler/src/ReactFiberClassComponent.js#L190-L207).

그리고 이것이 `this.setState()` 가 리액트 페키지 안에 정의 되있어도 돔을 업데이트 할 수 있는 이유입니다. 이것은 돔에 의해 설정된 `this.updater`를 읽고 리액트 돔이 업데이트를 다룰 수 있도록 합니다.

---

이제 우리는 클라스에 대해 알지만 후크들은 어떤가요?

사람들이 처음에 [후크 제안 API](https://reactjs.org/docs/hooks-intro.html)을 봤을때, 그들은 궁금했습니다: 어떻게 `useState` “무엇을 할지 알지”? 추측은 `this.setState()`와 기본 `React.Component` 클라스라기보다 더 “마법” 같았습니다. 

하지만 오늘 보았다시피, 기본 클라스 `setState()`실행은 오해였습니다. 현재 렌더러를 부르는것 외에는 아무것도 하지 않습니다. 그리고 `useState` 후크는 [이것과 똑같은 일을 합니다](https://github.com/facebook/react/blob/ce43a8cd07c355647922480977b46713bd51883e/packages/react/src/ReactHooks.js#L55-L56).

**`updater` 분야 대신에, 후크들은 “dispatcher” 개체를 사용합니다.** 당신이 `React.useState()`, `React.useEffect()`나 다른 이미 갖춰진 후크를 부를 때, 이 콜들은 현재 dispatcher에게 보내집니다.

```jsx
// In React (simplified a bit)
const React = {
  // Real property is hidden a bit deeper, see if you can find it!
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

그리고 각각의 렌더러들은 당신의 컴포넌트를 렌더하기 전에 dispatcher를 설정합니다:

```jsx{3,8-9}
// In React DOM
const prevDispatcher = React.__currentDispatcher;
React.__currentDispatcher = ReactDOMDispatcher;
let result;
try {
  result = YourComponent(props);
} finally {
  // Restore it back
  React.__currentDispatcher = prevDispatcher;
}
```

예를 들어, 리액트 돔 서버 실행은 [여기에 있습니다](https://github.com/facebook/react/blob/ce43a8cd07c355647922480977b46713bd51883e/packages/react-dom/src/server/ReactPartialRendererHooks.js#L340-L354), 그리고 리액트 돔과 리액트 네이티브에 의해 공유된 reconciler실행은 [여기에 있습니다](https://github.com/facebook/react/blob/ce43a8cd07c355647922480977b46713bd51883e/packages/react-reconciler/src/ReactFiberHooks.js).

이게 바로 리액트 돔과 같은 랜더러가 당신이 불러온 후크와 같은 리액트 페키지에 접근해야하는 이유입니다. 그렇지않으면, 당신의 컴포넌트는 dispatcher를 “볼 수” 없습니다! 이것은 당신이 [여러 리액트 복사본을](https://github.com/facebook/react/issues/13991)같은 컴포넌트 트리에 가지고 있지 않다면 아마 쓸 수 없을 겁니다. 그렇지만, 이것은 항상 불특정한 버그로 이끌었고 그래서 후크들은 당신이 더 큰 값을 치르기전에 페키지의 중복을 해결하도록 강요합니다.

우리가 이것을 권장하지 않을때, 엄밀히따지면 cases라는 도구를 사용해서 dispatcher를 당신이 직접 다시 쓸수 있습니다. (`__currentDispatcher` 이름에 대해서 거짓말을 했습니다 하지만 당신은 리액트 리포에서 진짜를 찾을 수 있습니다.) 예를 들어, 리액트 개발자 도구들은 자바스크립트 스택 트레이스에 의해 잡힌 후크트리를 반성하기위해 [특별한 목정을 가지고 만들어진 dispatcher](https://github.com/facebook/react/blob/ce43a8cd07c355647922480977b46713bd51883e/packages/react-debug-tools/src/ReactDebugHooks.js#L203-L214)를 사용할겁니다. *집에서 따라하지 마세요.*

이것은 또한 후크들이 리액트에 의해 본질적으로 묶여있지 않음을 뜻합니다. 만약 앞으로 더 많은 라이브러리들이 같은  제공된 후크들을 다시 사용하고자 한다면, 이론상 dispatcher는 다른 페키지들로 이동할 수 있습니다 그리고 덜 무서운 이름의 첫번째 클라스 API로 노출될 수 있습니다. 실제는, 우리는 필요하지 않은 이상, 너무 이른 포괄화를 피하는 것을 선호합니다.

`updater` 분야와 `__currentDispatcher` 개채 모두 포괄적인 *의존성 주입*이라는 프로그램 원칙의 형상입니다. 이 두가지 모두, 렌더러들이 `setState`와 같은 특징의 실행들을 당신의 컴포넌트들이 선언형(declaritive)일수 있도록 더욱 포괄적인 리액트 페키지안에 “주입합니다”.

리액트를 사용할때 이것이 어떻게 사용되는지는 알 필요는 없습니다. 우리는 그저 리액트 사용자들이 의존성 주입과 같은 추상적인 개념보다는 그들의 응용 코드에 대해 더 생각해보는 데 시간을 더 쏟길 바랍니다. 하지만 만약에 어떻게 `this.setState()` 또는 `useState()`가 무엇을 하는지 궁금해 했었던 사람이라면, 이 글이 도움이 됬길 바랍니다.

---

