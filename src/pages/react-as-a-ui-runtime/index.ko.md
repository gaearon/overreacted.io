---
title: UI 런타임으로서의 React
date: '2019-02-02'
spoiler: React 프로그래밍 모델의 깊이 있는 설명
---

대부분의 튜토리얼들은 React를 UI 라이브러리로 소개합니다. React**는** UI 라이브러리니까요. 홈페이지에도 그대로 적혀 있습니다!

![React 홈페이지 스크린샷: "유저 인터페이스 구축을 위한 자바스크립트 라이브러리"](./react.png)

저는 이전에 [유저 인터페이스](/the-elements-of-ui-engineering/ko)를 만들기 위해 풀어야 하는 문제들에 대해서 작성한 적이 있습니다. 이번 글에선 React에 대해 [프로그래밍 런타임](https://en.wikipedia.org/wiki/Runtime_system) 관점으로 이야기해보려고 합니다.

**이 글은 유저 인터페이스를 만드는 법을 알려주지 않습니다.** 하지만 React 프로그래밍 모델을 깊이 있게 이해하는데 도움을 줄 수는 있을 것 같습니다.

---

**메모: React를 배우고 계시다면 [이 문서](https://reactjs.org/docs/getting-started.html#learn-react)를 먼저 보세요.**

<font size="60">⚠️</font>

**이 글은 심도 있는 주제를 다룹니다. 초보자에게 적합하지 않을 수 있습니다.** 이 글에선 React 프로그래밍 모델을 설명합니다. 사용하는 방법보단 어떻게 동작하는지에 대해서만 서술합니다.

숙련된 프로그래머들과 다른 UI 라이브러리를 사용해서 작업하는 사람들을 대상으로 쓴 글입니다. 이 글이 유용하길 바랍니다!

**많은 사람들은 이 글에서 다루는 대부분의 주제들에 대해 생각하지 않고도 몇 년 동안 React를 잘 써왔습니다.** 이 글은 명백히 프로그래머의 중심적인 관점으로 React를 바라본 것이고 흔히 말하는 [디자이너 중심적인 관점](http://mrmrs.cc/writing/developing-ui/)의 글은 아닙니다. 하지만 저는 두 관점 모두 가질 수 있다고 생각합니다.

주의사항은 제쳐두고 일단 가봅시다!

---

## 호스트 트리

어떤 프로그램은 숫자를 만듭니다. 어떤 프로그램은 시를 만듭니다. 여러 언어와 각각 런타임들은 특정 용도에 최적화되어있고, React도 예외는 아닙니다.

React는 보통 **시간이 지남에 따라 변화할 수 있는 트리**를 출력합니다. [DOM 트리](https://www.npmjs.com/package/react-dom), [iOS 계층구조](https://developer.apple.com/library/archive/documentation/General/Conceptual/Devpedia-CocoaApp/View%20Hierarchy.html), [PDF 요소들의](https://react-pdf.org/) 트리, 심지어 [JSON 객체](https://reactjs.org/docs/test-renderer.html) 가 될 수도 있습니다.
그러나 보통 React는 UI를 표현하는데에 쓰입니다. 이것을 ‘**호스트** 트리’ 라고 합니다. React의 일부가 아니라 DOM이나 iOS와 같이 외부 **호스트 환경**의 일부이기 때문입니다. 호스트 트리는 [자체적으로](https://developer.mozilla.org/en-US/docs/Web/API/Node/appendChild) [소유한](https://developer.apple.com/documentation/uikit/uiview/1622616-addsubview) 명령형 API가 있습니다. React는 그 최상단 계층입니다.

그렇다면 React는 어디에 유용할까요? 추상적으로 말하자면 외부 상호작용, 네트워크 응답, 타이머 등 외부 이벤트에 대한 응답으로 복잡한 호스트 트리를 예측할 수 있게 조작하는 프로그램을 작성하는데 유용합니다.

특정 조건을 만족할 때 범용적인 도구보다 전문 도구가 유용합니다. React는 다음 두 원칙이 있습니다.

** **안정성** 호스트 트리는 비교적 안정적이고 대부분의 갱신은 전체 구조를 뜯어고치지 않습니다. 모든 상호작용 요소들이 매번 다른 조합으로 만들어진다면 매우 사용하기 어려울 것입니다. "버튼은 어디 갔고 내 화면은 왜이래?" 하면서요.

** **규칙성** 호스트 트리는 무작위 형태가 아닌 일관된 모습과 동작을 가진 UI 패턴(버튼, 목록, 아바타)으로 나눌 수 있습니다.

**이 원칙들은 대부분 UI에 적용됩니다.** 그러나 React는 결과에 일정한 '패턴'이 없을 때 적합하지 않습니다. 예를 들어 React는 Twitter 클라이언트를 작성하는 데 도움이 되지만 [3D 파이프 스크린 세이버](https://www.youtube.com/watch?v=Uzx9ArZ7MUU)에는 별로 유용하지 않습니다.

## 호스트 객체

호스트 트리는 노드로 구성됩니다. '호스트 객체'라고 부릅니다.

DOM 환경에서 호스트 객체는 `document.createElement('div')`를 호출할 때 얻을 수 있는 객체와 같은 일반적인 DOM 노드입니다. iOS에서 호스트 객체는 자바스크립트에서 네이티브 뷰를 식별하는 값일 수 있습니다.

호스트 객체는 고유한 속성을 가집니다(예를 들어 DOM의 `domNode.className` 또는 iOS의 `view.tintColor`). 또한 다른 호스트 객체 자식으로 포함 할 수 있습니다.

(이것은 React와 아무런 상관이 없습니다. 호스트 환경을 설명하고 있습니다.)

일반적으로 호스트 객체를 조작하는 API가 있습니다. 예를 들어 DOM은 `appendChild`, `removeChild`, `setAttribute` 등과 같은 API를 제공합니다. React 앱에서는 일반적으로 이런 API를 직접 호출하지 않습니다. React가 처리합니다.

## 렌더러

**렌더러**는 React가 특정 호스트 환경과 통신하고 호스트 객체를 관리합니다. React DOM, React Native, 심지어 [Ink](https://mobile.twitter.com/vadimdemedes/status/1089344289102942211)도 React 렌더러입니다. 또 나만의 [React 렌더러를 만들 수도 있습니다](https://github.com/facebook/react/tree/master/packages/react-reconciler).

React 렌더러는 두 가지 모드가 있습니다.

대다수의 렌더러는 '변경'모드를 사용하도록 작성되었습니다. 이 모드는 DOM 작동 방식입니다. 노드를 만들고 속성을 설정 한 다음 노드를 나중에 추가하거나 제거할 수 있습니다. 호스트 객체는 완전히 변경할 수 있습니다.

React는 '영속'모드에서도 작동할 수 있습니다. 이 모드는 `appendChild()`와 같은 메서드를 제공하지 않고 부모 트리를 복제하고 항상 최상위 하위를 대체하는 호스트 환경을 위한 모드입니다. 호스트 트리 수준의 불변성은 멀티 스레딩을 쉽게 만듭니다. [React Fabric](https://facebook.github.io/react-native/blog/2018/06/14/state-of-react-native-2018)은 이를 활용합니다.

React 사용자는 이러한 모드에 대해 고민할 필요가 없습니다. 전 React가 단순히 한 모드에서 다른 모드로 전환하는 어댑터가 아니라는 것을 강조하고 싶습니다. 이 유용성은 저수준 뷰 API 패러다임과 교차합니다.

## React 엘리먼트

호스트 환경에서 호스트 객체는(DOM Node 같은) 제일 작은 구성 요소입니다. React에서는 제일 작은 빌딩 요소를 **React 엘리먼트**라고 합니다.

React 엘리먼트는 호스트 객체를 그릴 수 있는 일반적인 자바스크립트 객체입니다.

```jsx
// JSX는 아래 오브젝트를 만들기 위한 편의구문입니다.
// <button className="blue" />
{
  type: 'button',
  props: { className: 'blue' }
}
```

React 엘리먼트는 가볍고 호스트 객체에 직접적으로 관여하지 않습니다. 단지 화면에 무엇을 그리고 싶은지에 대한 정보가 들어 있을 뿐입니다.

호스트 객체처럼 React 엘리먼트도 트리로 구성될 수 있습니다.

```jsx
// JSX는 아래 오브젝트를 만들기 위한 편의구문입니다.
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

**(메모: 이 설명에서 크게 중요하지 않은 몇 가지 [속성들](/why-do-react-elements-have-typeof-property/)을 생략했습니다.)**

**React 엘리먼트는 영속성을 가지지 않는다**는 것을 기억하세요. 매번 새로 만들어지고 버려집니다.

React 엘리먼트는 불변합니다. 예를 들어 React 엘리먼트의 자식이나 props를 수정할 수 없습니다. 다른 렌더링을 하고 싶다면 새로운 React 엘리먼트 트리를 생성하세요.

전 React 엘리먼트를 영화의 프레임으로 생각합니다. React 엘리먼트는 매 순간 어떻게 보여야 되는지 파악하고 변하지 않습니다.

## 진입점

React 렌더러는 '진입점'이 있습니다. React가 컨테이너 호스트 객체 내부에 특정 React 엘리먼트 트리를 렌더링 할 수 있게 해주는 API입니다.

예를 들어 React DOM의 진입점은 `ReactDOM.render` 함수입니다.

```jsx
ReactDOM.render(
  // { type: 'button', props: { className: 'blue' } }
  <button className="blue" />,
  document.getElementById('container')
);
```

`ReactDOM.render(reactElement, domContainer)`의 의미는 **“React여, `domContainer` 호스트 트리를 나의 `reactElement`와 같게 만들어주세요.”**입니다.

React는 `reactElement.type`을 보고(이 예제에선 `'button'`) React DOM에 호스트 객체 생성하고 속성을 설정하도록 요청합니다.

```jsx{3,4}
// ReactDOM 렌더러의 어딘가 (간략한 버전)
function createHostInstance(reactElement) {
  let domNode = document.createElement(reactElement.type);
  domNode.className = reactElement.props.className;
  return domNode;
}
```

이 예제에서 React는 효과적으로 동작합니다.

```jsx{1,2}
let domNode = document.createElement('button');
domNode.className = 'blue';

domContainer.appendChild(domNode);
```

React 엘리먼트가 `reactElement.props.children`에 자식을 가지고 있다면 React는 첫 렌더링에 재귀적으로 호스트 객체 생성합니다.

## 재조정

`ReactDOM.render()`가 두번 같은 컨테이너에 호출되면 무슨 일이 일어날까요?

```jsx{2,11}
ReactDOM.render(
  <button className="blue" />,
  document.getElementById('container')
);

// ... 나중에 ...

// 호스트 객체를 교체해야 할까요
// 아니면 기존 객체에 속성만 교체하면 될까요?
ReactDOM.render(
  <button className="red" />,
  document.getElementById('container')
);
```

다시 한번 말하자면 React의 목표는 **주어진 React 엘리먼트 트리와 호스트 트리를 일치시키는 것**입니다. 새로운 정보의 응답으로 호스트 객체 트리에 **어떤** 작업을 해야 할지 파악하는 프로세스를 [재조정](https://reactjs.org/docs/reconciliation.html)이라고 부릅니다.

두 가지 방법이 있습니다. 간단한 React 버전은 기존 트리를 날려버리고 새로운 트리를 만듭니다.

```jsx
let domContainer = document.getElementById('container');
// 트리를 날립니다.
domContainer.innerHTML = '';
// 새로운 객체 트리를 만듭니다.
let domNode = document.createElement('button');
domNode.className = 'red';
domContainer.appendChild(domNode);
```

하지만 위 방법은 DOM에서 이 작업은 느린 데다가 포커스, 선택, 스크롤 상태 등 중요한 정보를 잃게 됩니다. 대신 다음처럼 React가 우리가 원하는 방향으로 작업할 수도 있습니다.

```jsx
let domNode = domContainer.firstChild;
// 기존 호스트 객체를 변경합니다.
domNode.className = 'red';
```

React는 기존 호스트 객체가 React 엘리먼트와 일치하도록 **새로운** 호스트 객체 만들 것인지 변경할 것인지 결정해야 합니다.

위 문제는 **식별 방법**에 대해 의문을 남깁니다. React 엘리먼트는 매번 다르지만 같은 호스트 객체라는 것을 어떻게 알까요?

이 예제에서는 간단합니다. `<button>`을 첫 번째 자식으로(그리고 유일한) 렌더링 했고 같은 위치에 `<button>`을 다시 렌더링 하고 싶습니다. 이미 `<button>` 호스트 객체를 가지고 있는데 다시 만들 필요는 없죠. 다시 사용합시다.

React가 위 문제를 어떻게 처리하는지 살펴봅시다.

**트리의 같은 위치에 있는 엘리먼트 타입이 이전 렌더링과 다음 렌더링 사이에 일치하면 React는 기존 호스트 객체를 다시 사용합니다.**

다음 예제에서 주석과 함께 React가 어떻게 처리하는지 살펴봅시다.

```jsx{9,10,16,26,27}
// let domNode = document.createElement('button');
// domNode.className = 'blue';
// domContainer.appendChild(domNode);
ReactDOM.render(
  <button className="blue" />,
  document.getElementById('container')
);

// 호스트 객체를 다시 사용할 수 있을까요? 네! (button → button)
// domNode.className = 'red';
ReactDOM.render(
  <button className="red" />,
  document.getElementById('container')
);

// 호스트 객체를 다시 사용할 수 있을까요? 아뇨! (button → p)
// domContainer.removeChild(domNode);
// domNode = document.createElement('p');
// domNode.textContent = 'Hello';
// domContainer.appendChild(domNode);
ReactDOM.render(
  <p>Hello</p>,
  document.getElementById('container')
);

// 호스트 객체를 다시 사용할 수 있을까요? 네! (p → p)
// domNode.textContent = 'Goodbye';
ReactDOM.render(
  <p>Goodbye</p>,
  document.getElementById('container')
);
```

같은 휴리스틱 알고리즘이 자식 트리에 적용됩니다. 예를 들어 `<dialog>`를 두 개의 `<button>`으로 갱신하면 React는 먼저 `<dialog>`를 재사용할 것인지를 결정한 다음 각 자식에 대해 이 절차를 반복합니다.

## 조건

갱신마다 엘리먼트 타입이 일치할 때만 React가 호스트 객체를 다시 사용한다면 어떻게 조건부 콘텐츠를 렌더링 할 수 있을까요?

처음에 입력 엘리먼트만 보이고 후에 메시지 엘리먼트를 렌더링 한다고 가정해봅시다.

```jsx{12}
// 첫 렌더링
ReactDOM.render(
  <dialog>
    <input />
  </dialog>,
  domContainer
);

// 두 번째 렌더링
ReactDOM.render(
  <dialog>
    <p>I was just added here!</p>
    <input />
  </dialog>,
  domContainer
);
```

위 예제에서 `<input>` 호스트 객체는 다시 생성될 것입니다. React가 엘리먼트 트리를 이전 버전으로 트리를 비교한다면 다음과 같습니다.

* `dialog → dialog`: 호스트 객체를 다시 사용할 수 있나요? **네, 타입이 일치합니다.**
  * `input → p`: 호스트 객체를 다시 사용할 수 있나요? **아뇨, 타입이 다릅니다.**
  * `input`을 삭제하고 `p`를 추가해야 합니다.
  * `(없음) → input`: 새로운 `input` 호스트 객체를 만들어야 합니다.

따라서 React가 실행하는 코드는 다음과 같습니다.

```jsx{1,2,8,9}
let oldInputNode = dialogNode.firstChild;
dialogNode.removeChild(oldInputNode);

let pNode = document.createElement('p');
pNode.textContent = 'I was just added here!';
dialogNode.appendChild(pNode);

let newInputNode = document.createElement('input');
dialogNode.appendChild(newInputNode);
```

머릿속으론 `<input>`이 `<p>`를 대체하지 않고 그냥 이동하면 될 문제입니다. DOM을 다시 생성하면서 선택, 포커스, 내용을 잃고 싶지 않습니다.

이 문제에는 (곧 살펴볼) 간단한 해결책이 있지만, React 어플리케이션에서 자주 일어나는 문제는 아닙니다. 여기에는 흥미로운 이유가 있습니다.

실전에서 `ReactDOM.render`를 직접 호출할 일은 많지 않습니다. 대신 React 앱은 다음 함수처럼 분리되곤 합니다.

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

위 예제는 우리가 발견한 문제점이 없습니다. JSX대신 객체로 보면 이유를 더 쉽게 알 수 있을 것입니다. 다음 `dialog` 자식 엘리먼트 트리를 살펴보세요.

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

**`showMessage`의 참 거짓 여부와 관계없이 `<input>`은 항상 두 번째 자식이고 렌더링 전후 위치가 변하지 않습니다.**

`showMessage`가 `false`에서 `true`로 바뀌어도 React는 이전 버전처럼 똑같이 엘리먼트 트리를 비교합니다.

* `dialog → dialog`: 호스트 객체를 다시 사용할 수 있을까요? **예, 타입이 일치합니다.**
  * `(null) → p`: 새로운 `p` 호스트 객체를 만들어야 합니다.
  * `input → input`: 호스트 객체를 다시 사용할 수 있을까요? **예, 타입이 일치합니다.**

그리고 React가 실행하는 코드는 다음과 비슷합니다.

```jsx
let inputNode = dialogNode.firstChild;
let pNode = document.createElement('p');
pNode.textContent = 'I was just added here!';
dialogNode.insertBefore(pNode, inputNode);
```

이제 `input`의 상태는 손실되지 않습니다.

## 리스트

트리에서 동일한 위치에서 엘리먼트 타입을 비교하면 일반적으로 해당 호스트 객체를 재사용할지 다시 만들지 결정하기에 충분합니다.

하지만 위 방법은 자식들의 위치가 정적이고 순서를 바꾸지 않는 경우에만 작동합니다. 위 예시에서 `message`가 "구멍"이 될 수 있지만 우리는 여전히 입력 요소가 `message` 뒤에 있고 다른 자식이 없다는 것을 압니다.

동적 리스트에서는 같은 순서인지 알 수 없습니다.

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

쇼핑 장바구니의 `list`가 다시 정렬된다면 React는 `p`와 `input`엘리먼트를 같은 타입을 가지고 있다고 보고 엘리먼트들을 이동시켜야 하는지 모릅니다. (React의 관점으로는 **아이템 자체가** 변화했지 순서가 변경됐다고 알진 못합니다.)

React는 다음 유사 코드를 통해 10개의 아이템을 정렬합니다.

```jsx
for (let i = 0; i < 10; i++) {
  let pNode = formNode.childNodes[i];
  let textNode = pNode.firstChild;
  textNode.textContent = 'You bought ' + items[i].name;
}
```

React는 **순서 변경** 대신 효과적으로 **갱신**했습니다. 성능 이슈와 버그가 발생할 수 있습니다. 예를 들어 정렬이 진행된 다음 첫 번째 인풋은 그대로 첫 번째 인풋으로 반영됩니다. 실제 참조하고 있는 제품은 다른데 말이죠!

**이것이 매번 React가 엘리먼트 배열에 `key` prop을 요구하는 이유입니다.**

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

`key`는 React에 렌더링 할 때마다 아이템이 다른 **위치**에 있다는 것을 알려줍니다.

React가 `<form>` 안쪽의 `<p key="42">`를 볼 때 이전 렌더링에서 `<p key="42">`가 같은 `<form>`에 있었는지 검사합니다. 이 방법은 `<form>`의 자식 순서가 바뀌더라도 작동합니다. React는 같은 `key`를 가지는 이전 호스트 객체를 재사용하고 시블링 순서를 다시 정렬합니다.

`key`는 항상 `<form>` 같은 부모 React 엘리먼트에서만 관련 있습니다. React는 다른 부모 엘리먼트 사이에서 키를 비교하지 않습니다. (React는 호스트 객체를 다시 생성하지 않는 이상 다른 부모로 이동할 수 없습니다.)

어떤 값이 `key`로 좋을까요? 쉬운 방법에 대한 답변은 **아이템의 순서가 바뀌어도 같은 아이템을 파악할 수 있으려면 어떻게 해야 될까요?** 예를 들어 쇼핑 리스트에서는 제품 ID가 아이템들 사이에서 고유한 식별자입니다.

## 컴포넌트

이미 함수들이 React 엘리먼트를 반환하는 것을 알고 있을 겁니다.

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

이것을 **컴포넌트**라고 부릅니다. 우리만의 버튼, 아바타, 댓글 등을 관리하는 도구 상자를 만들 수 있게 해 줍니다. 컴포넌트는 React의 주요 기술입니다.

컴포넌트는 해쉬 객체를 인자로 받습니다. 'props'('properties'의 짧은 표현)을 가집니다. 여기서 `showMessage`는 prop입니다. 이름 있는 인자입니다.

## 순수성

React 컴포넌트는 전달받은 props에 대해 순수하다고 가정합니다.

```jsx
function Button(props) {
  // 🔴 동작하지 않습니다.
  props.isActive = true;
}
```

일반적으로 변이는 React에서 자연스럽지 않습니다. (이벤트들에 대해서 자연스럽게 UI를 갱신하는 방법은 나중에 이야기합시다.)

하지만 **지역 수준 변이**는 괜찮습니다.

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

렌더링 과정에 `items`를 만들지만 참조한 다른 컴포넌트는 없습니다. 그래서 렌더링 결과를 만들기 전까지 처리하는 과정에 얼마든지 변이 시킬 수 있습니다. 지역 수준 변이를 피할 이유는 없습니다.

비슷한 맥락으로 완전히 순수하지 않은 지연 초기화도 괜찮습니다.

```jsx
function ExpenseForm() {
  // 다른 컴포넌트에 영향을 주지 않는다면 괜찮습니다.
  SuperCalculator.initializeIfNotReady();

  // 렌더링을 계속합니다...
}
```

다른 컴포넌트의 렌더링에 영향을 주지 않으면 컴포넌트를 여러 번 호출하는 것은 안전합니다. React는 엄격한 함수형 패러다임으로 100% 순수성을 가지지 못해도 괜찮습니다. [멱등성](https://stackoverflow.com/questions/1077412/what-is-an-idempotent-operation)은 React에서 순수성보다 훨씬 중요합니다.

React 컴포넌트는 사용자가 볼 수 있는 부수 효과는 허용하지 않습니다. 컴포넌트 함수를 호출하더라도 직접적으로 화면에 변화를 만들면 안 됩니다.

## 재귀

어떻게 컴포넌트를 다른 컴포넌트에서 사용할 수 있을까요? 컴포넌트는 함수이기 때문에 **호출할** 수 있습니다.

```jsx
let reactElement = Form({ showMessage: true });
ReactDOM.render(reactElement, domContainer);
```

하지만 위 방법은 React 런타임에서 자연스러운 방법이 아닙니다.

컴포넌트를 사용하는 자연스러운 방법은 우리가 이미 본 React 엘리먼트 메커니즘과 같습니다. **직접 컴포넌트 함수를 호출하지 마세요. 대신 React가 알아서 해줄 겁니다.**

```jsx
// { type: Form, props: { showMessage: true } }
let reactElement = <Form showMessage={true} />;
ReactDOM.render(reactElement, domContainer);
```

그러면 React 내부 어딘가에서 컴포넌트가 호출됩니다.

```jsx
// React 내부 어딘가
let type = reactElement.type; // Form
let props = reactElement.props; // { showMessage: true }
let result = type(props); // Form이 무엇을 반환하든 상관없습니다.
```

컴포넌트 함수 이름은 대문자로 시작합니다. JSX 번역은 `<form>` 가 아닌 `<Form>`을 볼 때 문자열 식별자 타입이 아닌 객체 타입으로 봅니다.

```jsx
console.log(<form />.type); // 'form' 문자열
console.log(<Form />.type); // Form 함수
```

전역 등록 메커니즘은 없습니다. `<Form />`이라고 치면 문자열 그대로 `Form`을 참조합니다. `Form`이 지역 스코프에 존재하지 않으면 자바스크립트 에러를 보게 될 겁니다.

**React 엘리먼트 타입이 함수일 때 React는 뭘 할까요? React는 컴포넌트를 호출해서 어떤 엘리먼트를 렌더링 하고 싶은지 물어봅니다.**

이 과정은 재귀적으로 진행되고 [여기](https://reactjs.org/blog/2015/12/18/react-components-elements-and-instances.html)에 좀 더 자세하게 설명되어 있습니다. 짧게 말하자면 다음과 같습니다.

- **나:** `ReactDOM.render(<App />, domContainer)`
- **React:** 안녕 `App`, 뭘 그리고 싶니?
  - `App`: 나는 `<Layout>`에 `<Content>`를 그려.
- **React:** 안녕 `Layout`, 뭘 그리고 싶니?
  - `Layout`: 나는 내 자식을 `<div>`에 그릴거고. 내 자식은 `<Content>` 이었어. 그게 `<div>`로 들어갈 것 같은데.
- **React:** 안녕 `<Content>`, 뭘 그리고 싶니?
  - `Content`: 나는 텍스트가 적힌 `<article>`에 `<Footer>`를 그려.
- **React:** 안녕 `<Footer>`, 뭘 그리고 싶니?
  - `Footer`: 나는 텍스트가 적힌 `<footer>`를 그려.
- **React:** 좋았어, 해보자.

```jsx
// DOM 구조 결과
<div>
  <article>
    Some text
    <footer>some more text</footer>
  </article>
</div>
```

이것이 재조정이 재귀적인 이유입니다. React가 엘리먼트 트리를 순회할 때 타입이 컴포넌트인 엘리먼트를 방문할 수 있습니다. React는 함수를 호출하고 반환된 React 엘리먼트 트리로 계속 내려갑니다. 결국 모든 컴포넌트를 실행하고 React는 호스트 트리의 변경 내용을 알게 됩니다.

이미 이야기한 재조정 조건이 여기에도 적용이 되어 있습니다. 같은 위치에(색인 및 선택적인 `key`)가 변하면 React는 내부의 호스트 객체를 버리고 다시 만듭니다.

## 제어의 역전

궁금하실 수도 있을 겁니다. 왜 직접 컴포넌트를 호출하지 않는 거지? 왜 `Form()` 대신 `<Form />`이라고 써야 하는 거야? 하고요.

**React는 React가 컴포넌트에 대해 아는 것이 재귀적으로 호출한 React 엘리먼트 트리만 보는 것보다 효율적으로 처리할 수 있습니다.**

```jsx
// 🔴 React는 Layout이나 Article이 존재하는지 모릅니다.
// 컴포넌트를 직접 호출합니다.
ReactDOM.render(
  Layout({ children: Article() }),
  domContainer
)

// ✅ React는 Layout과 Article의 존재를 알게 됩니다.
// React가 컴포넌트를 호출합니다.
ReactDOM.render(
  <Layout><Article /></Layout>,
  domContainer
)
```

위 코드는 [제어의 역전](https://en.wikipedia.org/wiki/Inversion_of_control)의 전형적인 예시입니다. React가 컴포넌트 호출 제어권을 가지게 되어 몇 가지 흥미로운 점이 있습니다.

** **컴포넌트는 함수 이상의 역할을 합니다.** React는 컴포넌트 식별자와 연결된 지역 상태 같은 기능으로 컴포넌트를 강화할 수 있습니다. 좋은 런타임은 직면한 문제와 일치하는 근본적인 추상화를 제공해 줍니다. 앞서 언급했듯이 React는 상호작용에 대한 응답으로 UI 트리를 렌더링 합니다. 컴포넌트를 직접 호출한다면 이 기능들을 직접 구축해야 합니다.

** **컴포넌트 타입으로 재조정을 합니다.** React가 컴포넌트를 호출할 수 있게 되면 트리의 개념 구조를 더 많이 알려줄 수 있습니다. 예를 들어 `<Feed>` 렌더링을 `<Profile>` 페이지로 옮길 때 React는 호스트 객체를 재사용하지 않습니다. `<button>`을 `<p>`로 교체할 때처럼요. 모든 상태는 증발하고 일반적으로 다른 뷰를 렌더링 할 때 좋게 작용합니다. 트리의 `<input>`의 위치가 우연히 일치하더라도 `<PasswordForm>`과 `<MessengerChat>` 사이에서 입력 상태를 유지하고 싶진 않을 겁니다.

** **React가 재조정을 지연할 수 있습니다.** React가 컴포넌트 호출을 제어하면 재밌는 일들을 할 수 있습니다. 예를 들어 브라우저가 컴포넌트 호출 사이에서 일부 작업을 할 수 있게 되어 큰 컴포넌트 트리를 다시 렌더링 하더라도 [메인 스레드를 멈추지 않게 할 수 있습니다](https://reactjs.org/blog/2018/03/01/sneak-peek-beyond-react-16.html). React의 많은 부분을 다시 구현하지 않고서는 수동으로 조율하는 것은 어렵습니다.

** **더 나은 디버깅** 컴포넌트가 라이브러리가 알고 있는 일급 객체라면 [리치 개발 도구](https://github.com/facebook/react-devtools)를 만들 수 있습니다.

React가 컴포넌트를 호출하여 얻는 마지막 이점은 **지연 평가**입니다. 이게 무슨 말인지 알아봅시다.

## 지연 평가

자바스크립트에서 함수를 호출할 때 인자들은 호출 전에 평가됩니다.

```jsx
// (2) 나중에 계산됩니다.
eat(
  // (1) 먼저 계산됩니다.
  prepareMeal()
);
```

자바스크립트 함수가 암묵적인 부수 효과를 가질 수 있기 때문에 일반적으로 자바스크립트 개발자가 선호하는 방식입니다. 함수를 직접 호출했다면 예상 못한 문제로 놀랄 수도 있지만 함수 대신 컴포넌트로 표현하면 자바스크립트 어딘가에서 사용되기 전까지 실행되지 않습니다.

React 컴포넌트는 [비교적 순수하지만](#순수성) 화면에 나타나지 않는다면 실행할 필요가 없습니다.

`<Page>` 컴포넌트에서 `<Comments>` 컴포넌트를 사용한다고 생각해봅시다.

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

`Page` 컴포넌트는 자식들을 특정 `Layout`에 렌더링 할 수도 있습니다.

```jsx{4}
function Page({ user, children }) {
  return (
    <Layout>
      {children}
    </Layout>
  );
}
```

**(JSX에서 `<A><B /></A>`와 `<A children={<B />} />`는 같습니다.)**

그런데 조건에 따라 함수가 일찍 종료되면 어떻게 될까요?

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

`Comments()` 함수로 직접 호출했다면 `Page` 컴포넌트가 그리길 원하지 않더라도 즉시 실행될 겁니다.

```jsx{4,8}
// {
//   type: Page,
//   props: {
//     children: Comments() // 항상 실행됩니다!
//   }
// }
<Page>
  {Comments()}
</Page>
```

하지만 React 엘리먼트로 사용했다면 `Comments`는 실행되지 않습니다.

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

컴포넌트로 작성하면 React가 호출 시점을 결정할 수 있게 해 줍니다. `Page` 컴포넌트가 `children` prop을 무시하고 `<h1>Please log in</h1>`을 렌더링했다면 React는 `Comments` 함수 호출 시도를 하지 않습니다. 요점이 뭘까요?

불필요한 렌더링을 피할 수 있게 하고 코드의 취약성을 줄일 수 있게 해 줍니다. (위 예제에서는 사용자가 로그아웃하면 `Comments`가 전달되도 신경쓸 필요 없으며 호출되지 않습니다.)

## 상태

[이전](#재조정)에 엘리먼트 식별법과 트리 속 엘리먼트의 개념적 위치를 통해 React에 호스트 객체를 새로 만들지 기존 객체를 재사용할지 결정하는 방법을 이야기했습니다. 호스트 객체는 포커스, 선택, 입력 등 모든 종류의 지역 상태를 가질 수 있습니다. 동일한 UI를 렌더링 할 때 이 상태를 유지하려고 합니다. 또한 엘리먼트가 다른 위치로 이동되었을 때 예측대로 파괴되는 것도 원합니다. (예를 들어 `<SignupForm>` 안쪽에서 `<MessengerChat>`으로 이동할 때)

**지역 상태는 유용하고 React는 컴포넌트가 지역 상태를 가질 수 있게 해 줍니다.** 컴포넌트들은 함수일 뿐이지만 React는 UI를 위해 더 유용하게 만드는 유용한 기능으로 강화시킵니다. 트리에 연결된 지역 상태는 이 기능 중 하나입니다.

이것을 **훅**이라고 합니다. `useState` 훅을 살펴봅시다.

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

`useState`는 현재 상태와 상태를 갱신하는 함수 쌍을 반환합니다.

[배열 비구조화](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment#Array_destructuring) 구문으로 상태 변수에 임의의 이름을 부여할 수 있습니다. 예를 들어 `banana`와 `setBanana`가 될 수도 있었지만 저는 `count`와 `setCount`로 이름 지었습니다. 이후 내용부터는 실제 변수 이름과 상관없이 `setState`로 두 번째 값을 참조하겠습니다.

**`useState`와 React의 다른 훅에 대해서 배우고 싶다면 [여기](https://reactjs.org/docs/hooks-intro.html)를 참조하세요**

## 일관성

재조정 과정을 [논블로킹](https://www.youtube.com/watch?v=mDdgfyRB5kg) 작업 청크로 분할하더라도 단일 동기 흐름(swoop)에 실제 호스트 트리 작업을 수행해야 합니다. 이렇게 하면 사용자가 덜 만들어진 UI를 볼 수 없고 브라우저가 사용자가 볼 수 없는 중간 상태에 대해 불필요한 레이아웃 및 스타일 재계산 기능을 수행하지 않도록 할 수 있습니다.

위 이유로 React는 모든 작업을 "렌더링 단계"와 "커밋 단계"로 나눕니다. **렌더링 단계**는 React가 컴포넌트를 호출하고 재조정을 수행하는 단계입니다. 중단해도 안전하며 [앞으로는](https://reactjs.org/blog/2018/03/01/sneak-peek-beyond-react-16.html) 비동기적일 것입니다. **커밋 단계**는 동기적으로 React가 호스트 트리를 손보는 단계입니다.

## 메모이제이션

부모 컴포넌트가 `setState`를 통해 갱신을 예약하면 React는 기본적으로 전체 하위 트리를 재조정합니다. React는 부모의 갱신이 어떤 자식에게 영향을 주는지 알 수 없기 때문에 일관성을 위해 모두 갱신합니다. 굉장히 비용이 클 것 같지만 실제로는 중소형 하위 트리에서는 문제가 되지 않습니다.

트리가 너무 깊게 갱신된다면 React에 하위 트리를 [메모이제이션](https://ko.wikipedia.org/wiki/%EB%A9%94%EB%AA%A8%EC%9D%B4%EC%A0%9C%EC%9D%B4%EC%85%98)해서 얕은 props 비교를 통해 이전 렌더링 결과를 재사용할 수 있습니다.

```jsx{5}
function Row({ item }) {
  // ...
}

export default React.memo(Row);
```

이제 `<Table>` 컴포넌트의 `setState`는 `Row`의 `item`이 이전 렌더링과 같을 때 재조정을 생략합니다.

[`useMemo()` 훅](https://reactjs.org/docs/hooks-reference.html#usememo)을 사용하여 개별 표현식 수준에서 값을 메모할 수 있습니다. 캐시는 컴포넌트 트리 위치에 지역 상태로 저장되고 지역 상태가 파괴될 때 함께 삭제됩니다. 마지막으로 렌더링 된 항목만 저장합니다.

React는 기본적으로 컴포넌트를 메모하지 않습니다. 대부분의 컴포넌트들은 항상 다른 props를 받기 때문에 메모이제이션 비용이 발생할 수 있습니다.

## 가공되지 않은 모델

역설적이게도 React는 세밀한 갱신을 위해 반응형 시스템을 사용하지 않습니다. 최상단에 있는 모든 갱신은 영향을 받은 컴포넌트만 갱신하는 것이 아니라 재조정을 발생시킵니다.

이것은 의도적으로 결정된 설계입니다. [상호작용 가능 시간(Time to Interactive)](https://calibreapp.com/blog/time-to-interactive/)은 소비자 웹 어플리케이션에서 중요한 지표이고 모델을 순회하며 세밀한 수신자를 설정하는 것은 귀중한 시간을 소비합니다. 게다가 많은 앱에서 상호작용은 작은 변화(버튼 호버)나 큰 변화(페이지 이동)로 이어지며 이 경우 작은 단위의 구독은 메모리 낭비입니다.

React의 핵심 설계 원칙 중 하나는 로우 데이터로 동작하는 것입니다. 네트워크로 JS 객체를 수신받았을 때 별다른 처리 없이 컴포넌트에 주입할 수 있습니다. 접근할 수 있는 속성인지 도박해야 되는 상황이나 구조가 변경될 때 의도치 않은 퍼포먼스 저하가 없습니다. React 렌더링은 O(**모델 크기**)가 아닌 O(**뷰 크기**) 복잡도를 가지고 **뷰 크기**는 [windowing](https://react-window.now.sh/#/examples/list/fixed-size)을 통해 크게 줄일 수 있습니다.

주식 어플리케이션처럼 세밀한 구독이 도움이 되는 어플리케이션들이 있습니다. 드물게 볼 수 있는 "모든 것이 한 번에 지속적으로 갱신된다."의 예시입니다. 몇몇 해결책으로 최적화를 할 수 있지만 React가 좋은 사용 사례가 되지 않을 수도 있습니다. React 최상위 시스템에 세밀한 구독 시스템을 만들 수도 있습니다.

**세밀한 구독과 반응형 시스템으로도 풀 수 없는 일반적인 성능 이슈들이 존재합니다.** 예를 들어 브라우저 블로킹 없이 **새로운** 깊은 트리(모든 페이지 이동에서 발생합니다)를 렌더링 하는 것. 변경사항 추적 방법을 바꾸는 것은 성능을 더 빠르게 만들어주진 않습니다. 오히려 구독하기 위해 수행해야 하는 작업이 더 많아서 느려집니다. 또 다른 문제는 뷰를 렌더링 하기 전에 데이터를 기다려야 하는 것입니다. React는 [컨커런트 렌더링](https://reactjs.org/blog/2018/03/01/sneak-peek-beyond-react-16.html)을 통해 이 문제들을 해결하려고 합니다.

## 일괄 작업

여러 컴포넌트가 같은 이벤트에 대한 응답으로 상태를 변경하고 싶을 수 있습니다. 아래 예제는 일반적인 예시입니다.

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

이벤트가 디스패치되었을 때 자식의 `onClick`이 먼저 호출됩니다(자식의 `setState`가 호출됩니다). 부모 역시 `onClick` 핸들러의 `setState`를 호출합니다.

React가 즉시 `setState` 호출에 대한 응답으로 컴포넌트를 다시 렌더링한다면 자식을 두번 렌더링 해야 합니다.


```jsx{4,8}
*** React의 브라우저 클릭 이벤트 진입 ***
Child (onClick)
  - setState
  - re-render Child // 😞 불필요합니다
Parent (onClick)
  - setState
  - re-render Parent
  - re-render Child
*** React의 브라우저 클릭 이벤트 종료 ***
```

첫 번째 `Child` 렌더링은 낭비입니다. 그리고 React가 두 번째 `Parent`의 상태 변경으로 `Child`를 다시 렌더링해야 할 때 생략하도록 만들 수 없습니다.

**이것이 React가 이벤트 핸들러 사이에서 일괄 갱신을 하는 이유입니다.**

```jsx
*** React의 브라우저 클릭 이벤트 진입 ***
Child (onClick)
  - setState
Parent (onClick)
  - setState
*** Processing state updates        ***
  - re-render Parent
  - re-render Child
*** React의 브라우저 클릭 이벤트 종료 ***
```

컴포넌트의 `setState` 호출은 즉시 렌더링을 발생시키지 않습니다. React는 모든 이벤트 핸들러를 실행시킨 다음 모든 변경사항을 한 번에 다시 렌더링 합니다.

일괄 갱신은 성능에 좋지만 아래와 같은 코드를 작성한다면 문제가 될 수 있습니다.

```jsx
  const [count, setCounter] = useState(0);

  function increment() {
    setCounter(count + 1);
  }

  function handleClick() {
    increment();
    increment();
    increment();
  }
```

`count`가 0으로 시작했다면 `increment()`는 세 번의 `setCount(1)`를 호출합니다. 이 문제를 해결하기 위해서 `setState`는 갱신 함수를 인자로도 받습니다.

```jsx
  const [count, setCounter] = useState(0);

  function increment() {
    setCounter(c => c + 1);
  }

  function handleClick() {
    increment();
    increment();
    increment();
  }
```

React는 갱신 함수들을 큐에 쌓아놓고 나중에 순서대로 실행합니다. 위 예제에서 다시 렌더링 된 `count`의 결과는 `3`입니다.

상태 로직이 복잡해진다면 지역 상태를 [`useReducer` 훅](https://reactjs.org/docs/hooks-reference.html#usereducer)으로 사용하길 권장합니다. 각 갱신 이름이 지정되는 갱신 함수 패턴의 진화 버전입니다.


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

`action` 인자는 무엇이든 될 수 있지만 객체 형태가 일반적입니다.

## 호출 트리

프로그래밍 언어 런타임은 일반적으로 [호출 스택](https://medium.freecodecamp.org/understanding-the-javascript-call-stack-861e41ae61d4)을 가지고 있습니다. 어떤 함수 `a()`가 `c()`를 호출하는 `b()` 함수를 호출하면 JavaScript 엔진 어딘가에 `[a, b, c]` 같은 형태의 자료구조가 생깁니다. 이 데이터는 현재 위치와 다음에 실행될 코드를 추적합니다. `c` 함수가 끝날 때 호출 스택 프레임이 사라집니다. 더 이상 쓸모없거든요. `b`로 돌아가고 `a`도 끝나면 호출 스택은 빈 상태가 됩니다.

물론 React는 JavaScript에서 동작하고 자바스크립트의 규칙을 따릅니다. 하지만 React는 내부적으로 현재 렌더링 하고 있는 컴포넌트를 기억하기 위해 자체적인 호출 스택이 있습니다. 예를 들어 `[App, Page, Layout, Article /** 현재 렌더링 하는 부분 **/]` 처럼요.

React는 일반적인 언어 런타임과는 다르게 UI 트리를 렌더링 하기 위해서 좀 다릅니다. 이 트리들은 상호작용하기 위해서 계속 살아 있어야 합니다. DOM은 우리가 첫 번째 `ReactDOM.render()` 호출을 한 다음에도 사라지지 않습니다.

은유적인 표현일 수 있지만 저는 React의 컴포넌트가 호출 스택이 아닌 호출 트리에 있다고 생각합니다. `Article` 컴포넌트 렌더링이 끝나도 React 호출 트리는 파괴되지 않습니다. 지역 상태와 참조를 호스트 객체 참조를 [어딘가에](https://medium.com/react-in-depth/the-how-and-why-on-reacts-usage-of-linked-list-in-fiber-67f1014d0eb7) 유지해야 합니다.

호출 트리 프레임은 재조정 규칙에서 필요할 때만 지역 상태와 호스트 객체가 함께 파괴됩니다. React 소스를 읽어봤다면 프레임이 [파이버](https://en.wikipedia.org/wiki/Fiber_(computer_science))에 의해 참조되고 있는 것을 보셨을 겁니다.

파이버는 지역 상태가 실제로 있는 곳입니다. 지역 상태가 업데이트될 때 React는 해당 파이버의 자식들을 재조정하고 해당 컴포넌트들을 호출합니다.

## 컨텍스트

React에서 props는 컴포넌트에서 자식 컴포넌트로 전달됩니다. 때로는 대부분의 컴포넌트가 현재 선택된 테마 같은 같은 정보가 필요합니다. 모든 컴포넌트와 깊은 자식에 전달하는 것은 번거롭습니다.

React에서는 [컨텍스트](https://reactjs.org/docs/context.html)를 통해 이 문제를 해결합니다. 컴포넌트를 위한 [동적 스코핑](http://wiki.c2.com/?DynamicScoping)의 정수입니다. 마치 웜홀처럼 무언가를 위에 놓으면 그 아래에 있는 모든 자식들이 그것을 읽을 수 있게 되고 변화할 때 다시 렌더링 됩니다.

```jsx
const ThemeContext = React.createContext(
  'light' // 기본값
);

function DarkApp() {
  return (
    <ThemeContext.Provider value="dark">
      <MyComponents />
    </ThemeContext.Provider>
  );
}

function SomeDeeplyNestedChild() {
  // Depends on where the child is rendered
  const theme = useContext(ThemeContext);
  // ...
}
```

`SomeDeeplyNestedChild`가 렌더링 될 때 `useContext(ThemeContext)`은 트리에서 가장 가까운 부모 `<ThemeContext.Provider>`를 찾고 value를 사용합니다.

(실제로는 React가 렌더링 과정에 컨텍스트 스택을 관리합니다.)

트리에서 `ThemeContext.Provider`를 찾지 못했다면 `useContext(ThemeContext)`는 `createContext()` 호출에 명시된 기본값을 사용합니다. 위 예제에서는 `'light'`입니다.

## Effect

앞서 React 컴포넌트는 렌더링 중에 볼 수 있는 부수 효과를 가져선 안된다고 했습니다. 하지만 때때로 부수 효과가 필요합니다. 포커스를 관리하고 싶을 수도 있고, 캔버스를 그리고 싶을 수도 있고, 특정 데이터 소스를 구독하고 싶을 수도 있고 여러 이유가 있으니까요.

React에서는 Effect를 선언해서 해결합니다.

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

가능하다면 React는 브라우저가 화면을 리페인트 할 때까지 실행 효과를 연기합니다. 이는 데이터 소스 구독 같은 코드가 [상호작용 시간](https://calibreapp.com/blog/time-to-interactive/)과 [첫 번째 페인트](https://developers.google.com/web/tools/lighthouse/audits/first-meaningful-paint)를 방해하지 않기 때문에 좋습니다. (흔치 않게 [Layout Effect Hook](https://reactjs.org/docs/hooks-reference.html#uselayouteffect)을 사용하면 해당 동작을 선택 해제하고 동기식으로 작업을 수행할 수 있습니다.)

Effect는 한 번만 실행되지 않습니다. 컴포넌트가 유저에게 처음 노출 됐을 때 그리고 갱신됐을 때 실행됩니다. Effect는 현재 props와 상태(위 예제의 `count` 같은)에 따라 실행되지 않을 수도 있습니다.

Effect는 구독 리스너 정리 같은 작업이 필요할 수도 있습니다. 사용한 다음 스스로 정리하기 위해 Effect는 함수를 반환할 수 있습니다.

```jsx
  useEffect(() => {
    DataSource.addSubscription(handleChange);
    return () => DataSource.removeSubscription(handleChange);
  });
```

React는 반환된 함수를 다음 Effect가 적용되기 전 혹은 컴포넌트가 파괴되기 전에 실행합니다.

때때로 Effect가 의도하지 않아도 매 렌더링마다 실행될 수도 있습니다. React에 특정 변수가 변하지 않았을 때 [생략](https://reactjs.org/docs/hooks-effect.html#tip-optimizing-performance-by-skipping-effects)하도록 할 수 있습니다.

```jsx{3}
  useEffect(() => {
    document.title = `You clicked ${count} times`;
  }, [count]);
```

자바스크립트 클로저에 친숙하지 않다면 성급한 최적화 문제로 이어질 수 있습니다.

예를 들어 아래 코드는 버그 가능성이 높습니다.

```jsx
  useEffect(() => {
    DataSource.addSubscription(handleChange);
    return () => DataSource.removeSubscription(handleChange);
  }, []);
```

`[]`는 "절대로 이 Effect를 갱신하지 마"라는 의미이기 때문에 버그 가능성이 높습니다. Effect는 바깥에 선언된 `handleChange`가 바뀌더라도 다시 실행되지 않습니다. 그리고 `handleChange`는 다른 props나 상태를 참조할 수도 있습니다. 

```jsx
  function handleChange() {
    console.log(count);
  }
```

갱신을 허용하지 않는다면 `handleChange`는 계속 첫 번째 렌더링에 있는 상태를 참조해야 하고 `count`는 내부에서 항상 `0`이어야 합니다.

이 문제를 해결하기 위해서 의존성 배열에 명시하세요. 함수를 포함해서 **모든** 변할 수 있는 것들을요.

```jsx{4}
  useEffect(() => {
    DataSource.addSubscription(handleChange);
    return () => DataSource.removeSubscription(handleChange);
  }, [handleChange]);
```

코드에 따라서 렌더링 할 때마다 필요 없는 `handleChange` 때문에 필요 없는 구독이 발생할 수도 있습니다. [`useCallbak`](https://reactjs.org/docs/hooks-reference.html#usecallback)훅을 통해 해당 문제를 해소할 수 있습니다. 혹은 매번 다시 구독하게 만들 수도 있습니다. 예를 들어 브라우저의 `addEventListener` 이벤트는 굉장히 빠르기 때문에 어설픈 최적화로 더 많은 문제가 발생할 수 있습니다.

**(`useEffect`와 다른 훅들에 대해서 더 자세히 알려면 [여기](https://reactjs.org/docs/hooks-effect.html)를 보세요.)**

## 커스텀 훅

`useState`와 `useEffect` 같은 훅은 함수이기 때문에 직접 커스텀 훅을 구성할 수 있습니다.

```jsx{2,8}
function MyResponsiveComponent() {
  const width = useWindowWidth(); // 커스텀 훅
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

커스텀 훅은 컴포넌트 사이에 유상태 로직을 재사용할 수 있게 해 줍니다. 상태는 컴포넌트별로 **독립적**이라는 걸 기억하세요. 훅을 호출할 때마다 격리된 상태를 선언합니다.

**(커스텀 훅에 대해 더 자세히 알려면 [여기](https://reactjs.org/docs/hooks-custom.html)를 참조하세요.)**

## 훅의 규칙

`useState`를 "React 상태 변수" 선언 구문으로 생각할 수도 있지만 당연하게도 구문이 아닙니다. 자바스크립트에 작성하고 있지만 React는 런타임 환경으로서 JavaScript가 UI 트리를 구축하도록 꾸밉니다. 이런 기능들은 언어 영역에 가까이 있습니다.

`use`가 구문이라면 다음 코드는 좀 더 말이 됩니다.

```jsx{3}
// 😉 실제 구문이 아닙니다.
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

컴포넌트 바깥에 이를 선언하면 어떻게 될까요?

```jsx
// 😉 실제 구문이 아닙니다

// 무엇의... 지역 상태일까요?
const [count, setCount] = use State(0);

component Example() {
  if (condition) {
    // 조건이 거짓이라면 어떻게 될까요?
    const [count, setCount] = use State(0);
  }

  function handleClick() {
    // 함수가 끝난다면 어떻게 될까요?
    // 일반적인 변수와 차이는 무엇일까요?
    const [count, setCount] = use State(0);
  }
```

React 상태는 **컴포넌트** 트리에서 식별된 지역 상태입니다. `use`가 실제 구문이라면 컴포넌트의 최상위 수준으로 한정하는 것이 말이 됩니다.


```jsx
// 😉 실제 구문이 아닙니다.
component Example(props) {
  // 이곳에서만 유효합니다
  const [count, setCount] = use State(0);

  if (condition) {
    // 구문 오류입니다
    const [count, setCount] = use State(0);
  }
```

이것은 `import`가 모듈의 최상위 수준에서만 작동하는 것과 비슷합니다.

**물론 `use`는 구문이 아닙니다.** (이득보단 문제만 만들 것입니다.)

React는 모든 훅 호출이 컴포넌트의 최상위 수준에서 무조건적으로 일어난다고 가정합니다. [훅의 규칙](https://reactjs.org/docs/hooks-rules.html)은 [린터 플러그인](https://www.npmjs.com/package/eslint-plugin-react-hooks)으로 강제할 수 있습니다. 이 설계에 대해서는 뜨거운 논쟁이 있었지만 사람들을 혼란스럽게 하진 않았습니다. 또한 일반적인 대안들이 왜 [작동하지 않는지](https://overreacted.io/why-do-hooks-rely-on-call-order/)에 대해서도 작성했습니다.

내부적으로 훅은 [연결 리스트](https://dev.to/aspittel/thank-u-next-an-introduction-to-linked-lists-4pph)로 구현됩니다. `useState`를 호출할 때 다음 아이템으로 포인터를 옮깁니다. 컴포넌트의 [호출 트리 프레임](#호출-트리)을 나갈 때 리스트 결과를 다음 렌더링까지 저장합니다.

[이 글](https://medium.com/@ryardley/react-hooks-not-magic-just-arrays-cd4f1857236e)은 내부적으로 훅이 어떻게 구현되었는지 좀 더 간단한 설명이 있습니다. 배열이 연결 리스트보다는 이해하기 쉬울 수도 있습니다.

```jsx
// 의사코드
let hooks, i;
function useState() {
  i++;
  if (hooks[i]) {
    // 다음 렌더링
    return hooks[i];
  }
  // 처음 렌더링
  hooks.push(...);
}

// 렌더링 준비
i = -1;
hooks = fiber.hooks || [];
// 컴포넌트 호출
YourComponent();
// 훅 상태 복구
fiber.hooks = hooks;
```

**(궁금하시다면 [여기](https://github.com/facebook/react/blob/master/packages/react-reconciler/src/ReactFiberHooks.js)에서 실제 코드를 볼 수 있습니다.)**

각 `useState()`가 올바른 상태를 얻는 대략적인 방법입니다. [재조정](#reconciliation)에서 배운 것처럼 '일치시키기'는 React에 새로운 개념이 아닙니다. 재조정은 비슷한 방법으로 렌더링마다 일치하는 엘리먼트에 의존합니다.

## 기타 항목

React 런타임 환경의 거의 모든 중요한 측면을 다뤘습니다. 이 페이지를 다 읽었다면 React를 사용자의 90%보다 자세히 알고 있을 것입니다. 그 정도면 문제없어요!

몇 가지 빠트린 부분이 있는데 페이스북팀도 그 부분에 대해서는 불명확하기 때문입니다. 현재로서 React는 부모가 렌더링 할 때 자식 정보가 필요한 멀티패스 렌더링을 지원하지 않습니다. 또 [에러 핸들링 API](https://reactjs.org/docs/error-boundaries.html)는 아직 훅 버전이 없습니다. 두 가지 문제를 한 번에 해결할 수도 있습니다. 컨커런트 모드는 현재 안정적이지 못하고 Suspense가 어떻게 맞춰질 것인지 흥미로운 질문들도 있습니다. 부실한 부분이 채워지고 Suspense가 [지연 로딩](https://reactjs.org/blog/2018/10/23/react-v-16-6.html#reactlazy-code-splitting-with-suspense) 기능 이상으로 준비되면 다시 한번 후속편을 쓸 것 같습니다.

**저는 React API의 성공은 위 주제들을 몰라도 많은 것을 할 수 있기 때문이라고 생각합니다.** 휴리스틱 재조정 같은 훌륭한 기본 기능은 대부분의 상황에서 올바르게 동작합니다. `key` 경고처럼 잠재된 위험을 알려주는 경고도요.

당신이 UI 라이브러리에 관심이 있다면 이 글이 무언가 재밌고 React가 어떻게 작동하는지 명확하게 만들어줬다면 합니다. React가 너무 복잡해서 다신 보고 싶지 않다고 생각했을 수도 있지만 트위터에서 생각을 들어보고 싶어요! 읽어주셔서 감사합니다.
