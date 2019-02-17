---
title: UI 런타임으로서의 React
date: '2019-02-02'
spoiler: React 프로그래밍 모델의 깊이 있는 설명
---

대부분의 튜토리얼들은 React를 UI 라이브러리로 소개합니다. React*는* UI 라이브러리니까요. 그말 그대로 적혀 있습니다!

![React homepage screenshot: "유저 인터페이스 구축을 위한 자바스크립트 라이브러리"](./react.png)

저는 이전에 [유저 인터페이스](/the-elements-of-ui-engineering/ko)를 만들기 위해 풀어야 하는 문제들에 대해서 작성한 적이 있습니다. 이번 글에선 React에 대해 [프로그래밍 런타임](https://en.wikipedia.org/wiki/Runtime_system) 관점으로 이야기 해보려고 합니다.

**이 글은 유저 인터페이스를 만드는 것을 알려주지 않습니다.** 하지만 React 프로그래밍 모델을 깊이 있게 이해하는데 도움을 줄 수는 있을 것 같습니다.

---

**메모: React를 배우고 계시다면, [이 문서](https://reactjs.org/docs/getting-started.html#learn-react)를 먼저 보세요.**

<font size="60">⚠️</font>

**이 글은 심도 있습니다. 초보자에게 적합하지 않을 수 있습니다.** 이 글에서 저는 React 프로그래밍 모델을 설명합니다. 사용하는 방법보단 어떻게 동작하는지에 대해서만 서술합니다.

숙련된 프로그래머들과 다른 UI 라이브러리를 사용해서 작업하는 사람들을 대상으로 쓴 글입니다. 이게 유용했으면 좋겠습니다!

**많은 사람들이 이 글의 몇 가지 주제들에 대해서 생각하지 않고 React를 성공적으로 사용했습니다.** [디자이너의 관점](http://mrmrs.cc/writing/2016/04/21/developing-ui/)이 아닌 React 프로그래머 관점으로요. 저는 두 관점 모두 지킬 수 있다고 생각합니다.

주의사항은 제쳐두고 일단 가봅시다!

---

## 호스트 트리

어떤 프로그램은 숫자를 만듭니다. 어떤 프로그램은 함축된 내용을 만듭니다. 다른 언어와 런타임들은 특정 용도에 최적화되어 있습니다. React도 예외는 아닙니다.

**React 프로그램은 대게 시간이 지나면서 변화하는 트리를 만듭니다.** [DOM 트리](https://www.npmjs.com/package/react-dom), [iOS 계층구조](https://developer.apple.com/library/archive/documentation/General/Conceptual/Devpedia-CocoaApp/View%20Hierarchy.html), [PDF](https://react-pdf.org/) 트리, 심지어 [JSON 객체](https://reactjs.org/docs/test-renderer.html) 가 될 수도 있습니다.
하지만 일반적으로 우리는 React로 UI를 표현합니다. 이것을 "*호스트* 트리" 라고 합니다. DOM 및 iOS 처럼 React 바깥의 호스트 환경을 구성하기 때문입니다. 호스트 트리는 [자체적으로](https://developer.mozilla.org/en-US/docs/Web/API/Node/appendChild) [소유한](https://developer.apple.com/documentation/uikit/uiview/1622616-addsubview) 명령형 API가 있습니다. React는 최상단 레이어입니다.

React는 어디에 유용할까요? 추상적으로 말하자면 외부 인터렉션, 네트워크 응답, 타이머 등 외부 이벤트에 대한 응답으로 복잡한 호스트 트리를 예측 가능한 프로그램을 작성하도록 도와줍니다.

특정 제약 조건 아래에서 일반도구보다 전문도구가 유용합니다. React는 다음 두 원칙이 있습니다.

* **안정성** 호스트 트리는 상대적으로 안정적이고 대부분의 갱신은 전체 구조를 뜯어고치지 않습니다. 만약 모든 상호작용 요소들이 매초 다른 조합으로 만들어진다면 매우 사용하기 어려울 것입니다. 버튼은 어디갔고 내 화면은 왜 춤을 추지?

* **규칙성** 호스트 트리는 무작위 형상이 아닌 일관성있게 보이고 동작하는 UI 패턴(버튼, 목록, 아바타)으로 나눌 수 있습니다.

**이 원칙들은 대부분 UI에 적용됩니다.** 그러나 React는 결과에 일정한 "패턴"이 없을 때 적합하지 않습니다. 예를 들어 React는 Twitter 클라이언트를 작성하는 데 도움이 되지만 [3D 파이프 스크린 세이버](https://www.youtube.com/watch?v=Uzx9ArZ7MUU)에는 별로 유용하지 않습니다.

## 호스트 객체

호스트 트리는 노드로 구성됩니다. "호스트 객체" 라고 부릅니다.

DOM 환경에서 호스트 객체는 `document.createElement('div')`를 호출 할 때 얻을 수 있는 객체와 같은 일반적인 DOM 노드입니다. iOS에서 호스트 객체는 자바스크립트에서 네이티브 뷰를 고유하게 식별하는 값일 수 있습니다.

호스트 객체는 고유 한 속성을 가집니다(예를 들어 DOM의 `domNode.className` 또는 iOS의 `view.tintColor`). 또한 다른 호스트 객체 자식으로 포함 할 수 있습니다.

(이것은 React와 아무런 상관이 없습니다. 호스트 환경을 설명하고 있습니다.)

일반적으로 호스트 객체 조작하는 API가 있습니다. 예를 들어 DOM은 `appendChild`,`removeChild`,`setAttribute` 등과 같은 API를 제공합니다. React 앱에서는 일반적으로 이런 API를 호출하지 않습니다. 그것은 React의 일입니다.

## 렌더러

*렌더러*는 React에게 특정 호스트 환경에 호스트 객체 관리하도록 가르칩니다. React DOM, React Native, 심지어 [Ink](https://mobile.twitter.com/vadimdemedes/status/1089344289102942211)도 React 렌더러입니다. 나만의 [React 렌더러를 만들 수도 있습니다](https://github.com/facebook/react/tree/master/packages/react-reconciler).

React 렌더러는 두 가지 모드가 있습니다.

대다수의 렌더러는 "변경"모드를 사용하도록 작성되었습니다. 이 모드는 DOM 작동 방식입니다. 노드를 만들고 속성을 설정 한 다음 노드를 나중에 추가하거나 제거 할 수 있습니다. 호스트 객체는 완전히 변경할 수 있습니다.

React는 "영속"모드에서도 작동 할 수 있습니다. 이 모드는 `appendChild()`와 같은 메소드를 제공하지 않고 부모 트리를 복제하고 항상 최상위 하위를 대체하는 호스트 환경을 위한 모드입니다. 호스트 트리 수준에서의 불변성으로 인해 멀티 스레딩이 더 쉬워집니다. [React Fabric](https://facebook.github.io/react-native/blog/2018/06/14/state-of-react-native-2018)은 이를 활용합니다.

React 사용자는 이러한 모드에 대해 생각할 필요가 없습니다. 전 React가 단순히 한 모드에서 다른 모드로 전환하는 어댑터가 아니라는 것을 강조하고 싶습니다. 이 유용성은 저수준 뷰 API 패러다임과 교차합니다.

## React 엘리먼트

호스트 환경에서 호스트 객체는(DOM Node 같은) 제일 작은 구성 요소입니다. React에서는 제일 작은 빌딩 요소를 *React 엘리먼트*라고 합니다.

React 엘리먼트는 호스트 객체를 그릴 수 있는 일반적인 자바스크립트 객체입니다.

```jsx
// JSX는 아래 오브젝트를 만들기 위한 편의문법입니다.
// <button className="blue" />
{
  type: 'button',
  props: { className: 'blue' }
}
```

React 엘리먼트는 가볍고 호스트 객체를 직접적으로 관여하지 않습니다. 쉽게 말하자면 화면에 무엇을 그리고 싶은지에 대한 정보가 들어 있습니다.

호스트 객체처럼 React 엘리먼트도 트리로 구성될 수 있습니다.

```jsx
// JSX는 아래 오브젝트를 만들기 위한 편의문법입니다.
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

*(메모: 이 설명에서 크게 중요하지 않은 몇가지 [프로퍼티들](/why-do-react-elements-have-typeof-property/)을 생략했습니다.)*

**React 엘리먼트는 영속성을 가지지 않는다**는 것을 기억하세요. 매번 새로 만들어지고 버려집니다.

React 엘리먼트는 불변합니다. 예를 들어 React 엘리먼트의 자식이나 프로퍼티를 수정할 수 없습니다. 다른 렌더링을 하고 싶다면 새로운 React 엘리먼트 트리를 생성하세요.

전 React 엘리먼트를 영화의 프레임으로 생각합니다. React 엘리먼트는 매 순간 어떻게 보여야 되는지 파악하고 변하지 않습니다.

## 진입점

React 렌더러는 "진입점"이 있습니다. React에게 컨테이너 호스트 객체 내부에 특정 React 요소 트리를 렌더링하도록 알려주는 API입니다.

예를 들어 React DOM의 진입점은 `ReactDOM.render` 함수입니다.

```jsx
ReactDOM.render(
  // { type: 'button', props: { className: 'blue' } }
  <button className="blue" />,
  document.getElementById('container')
);
```

`ReactDOM.render(reactElement, domContainer)`의 의미는 **“오 React여, `domContainer` 호스트 트리를 나의 `reactElement`와 일치시켜주십시오.”** 입니다.

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

React의 목표는 *주어진 React 엘리먼트 트리와 호스트 트리를 일치시키는 것* 입니다. 새로운 정보의 응답으로 호스트 객체 트리에 수행할 *어떤* 프로세스를 [재조정](https://reactjs.org/docs/reconciliation.html)이라고 부릅니다.

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

DOM에서 이 작업은 느리고 포커스, 선택, 스크롤 상태 등 중요한 정보를 잃게 됩니다. React가 다음처럼 우리가 원하는 방향으로 작업할 수도 있습니다.

```jsx
let domNode = domContainer.firstChild;
// 기존 호스트 객체 변경합니다.
domNode.className = 'red';
```

React는 기존 호스트 객체가 React 엘리먼트와 일치하도록 _새로운_ 호스트 객체 만들 것인지 변경할 것인지 결정해야 합니다.

이것은 *정체성*에 대해 의문을 떠올립니다. React 엘리먼트는 매번 다르지만 같은 호스트 객체 참조하는 것을 어떻게 알까요?
This raises a question of *identity*. The React element may be different every time, but when does it refer to the same host instance conceptually?

이 예제에서는 간단합니다. `<button>`을 첫번째 자식으로(그리고 유일한) 렌더링했고 같은 위치에 `<button>`을 다시 렌더링하고 싶습니다. 이미 `<button>` 호스트 객체를 가지고 있는데 다시 만들 필요는 없죠. 다시 사용합시다.

React가 이걸 어떻게 처리하는지 살펴봅시다.

**트리의 같은 위치에 있는 엘리먼트 유형이 이전 렌더링과 다음 렌더링 사이에 일치하면 React는 기존 호스트 객체를 다시 사용합니다.**

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

같은 휴리스틱 알고리즘이 자식 트리에 적용됩니다. 예를 들어 `<dialog>`를 두 개의 `<button>`으로 갱신하면 React는 먼저 `<dialog>`를 재사용 할 것인지를 결정한 다음 각 자식에 대해 이 절차를 반복합니다.

## 조건

Element 유형이 갱신마다 일치할 때 React가 호스트 객체만 다시 사용한다면 어떻게 조건부 콘텐츠를 렌더링할까요?

처음에 입력 엘리먼트만 보여지고 후에 메세지 엘리먼트를 렌더링한다고 가정해봅시다.

```jsx{12}
// 첫 렌더링
ReactDOM.render(
  <dialog>
    <input />
  </dialog>,
  domContainer
);

// 두번째 렌더링
ReactDOM.render(
  <dialog>
    <p>I was just added here!</p>
    <input />
  </dialog>,
  domContainer
);
```

위 예제에서 `<input>` 호스트 객체는 다시 생성될 것입니다. React가 엘리먼트 트리를 이전 버전으로 트리를 비교한다면 다음과 같습니다.

* `dialog → dialog`: 호스트 객체를 다시 사용할 수 있나요? **네, 유형이 일치합니다.**
  * `input → p`: 호스트 객체를 다시 사용할 수 있나요? **아뇨, 타입이 다릅니다.** `input`을 삭제하고 `p`를 추가해야 합니다.
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

머릿속으론 `<input>`이 `<p>`를 대체하지 않고 그냥 이동했습니다. DOM을 다시 생성하면서 선택, 포커스, 내용을 잃고 싶지 않습니다.

이 문제는 곧 쉽게 해결됩니다. 더 이상 React 어플리케이션에서 나타나지 않습니다. 왜 그런지 궁금하네요.

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

**`showMessage`의 참거짓 여부와 관계 없이 `<input>`은 항상 두번째 자식이고 렌더링 전후 위치가 변하지 않습니다.**

`showMessage`가 `false`에서 `true`로 바뀌어도 React는 이전 버전 처럼 똑같이 엘리먼트 트리를 비교합니다.

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

어떤 입력상태도 잃지 않았습니다.

## 리스트

트리에서 동일한 위치에서 엘리먼트 유형을 비교하면 일반적으로 해당 호스트 객체를 재사용할지 다시 만들지를 결정하는 데 충분합니다.

하지만 이것은 자식들의 위치가 정적이고 순서를 바꾸지 않는 경우에만 작동합니다. 위의 예시에서 `message`가 "구멍"이 될 수 있지만 우리는 여전히 그 입력이 메시지 뒤에 있고 다른 자식이 없다는 것을 압니다.

동적 리스트를 사용하면 같은 순서인지 알 수 없습니다.

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

쇼핑 장바구니의 `list`가 재정렬 된다면 React는 `p`와 `input` 엘리먼트들을 같은 타입을 가지고 있다고 보고 엘리먼트들을 이동시켜야 하는지 모릅니다. (React의 관점으로는 *아이템 자체가* 변화했지 순서가 변경됬다고 알진 못합니다.)

React는 다음 유사 코드를 통해 10개의 아이템을 정렬합니다.

```jsx
for (let i = 0; i < 10; i++) {
  let pNode = formNode.childNodes[i];
  let textNode = pNode.firstChild;
  textNode.textContent = 'You bought ' + items[i].name;
}
```

React는 *순서 변경* 대신 효과적으로 *갱신*했습니다. 성능 이슈와 버그가 발생할 수 있습니다. 예를 들어 정렬이 진행된 다음 첫번째 인풋은 그대로 첫번째 인풋으로 반영됩니다. 실제 참조하고 있는 제품은 다른데 말이죠!

**이것이 매번 React가 엘리먼트 배열에 `key` 프로퍼티를 요구하는 이유입니다.**

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

`key`는 React가 렌더링할 때마다 아이템이 다른 *위치*에 있다는 것을 알려줍니다.

React가 `<form>` 안쪽의 `<p key="42">`를 볼때 이전 렌더링에서 `<p key="42">`가 같은 `<form>`에 있었는지 검사합니다. 이 방법은 `<form>`의 자식 순서가 바뀌더라도 작동합니다. React는 같은 `key`를 가지는 이전 호스트 객체를 재사용하고 시블링 순서를 재정렬합니다.

`key`는 항상 `<form>` 같은 부모 React 엘리먼트에서만 관련 있습니다. React는 다른 부모 엘리먼트 사이에서 키를 비교하지 않습니다. (React는 호스트 객체를 다시 생성하지 않는 이상 다른 부모로 이동할 수 없습니다.)

어떤 값이 `key`에 좋을까요? 쉬운 방법에 대한 답변은 **아이템의 순서가 바뀌어도 같은 아이템을 파악할 수 있으려면 어떻게 해야 될까요?** 예를 들어 쇼핑 리스트에서는 제품 ID가 아이템들 사이에서 고유한 식별자입니다.

## 컴포넌트

이미 함수들이 React 엘리먼트를 반환하는 것을 알고 있습니다.

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

이것들을 *컴포넌트*라고 부릅니다. 버튼, 아바타, 댓글을 관리하는 도구상자를 만들 수 있게 해줍니다. 컴포넌트는 React의 주요 기술입니다.

컴포넌트는 해쉬 객체를 인자로 받습니다. 'props'(프로퍼티들의 짧은 버전)을 담고 있습니다. 여기 `showMessage`는 prop입니다. 이름있는 인자들입니다.

## 순수성

React 컴포넌트는 전달받은 프로퍼티들에 대해 순수하다고 가정합니다.

```jsx
function Button(props) {
  // 🔴 동작하지 않습니다.
  props.isActive = true;
}
```

일반적으로 변이는 React에서 자연스러운 생각이 아닙니다. (이벤트들에 대해서 자연스럽게 UI를 갱신하는 방법은 나중에 이야기합시다.)

하지만 *지역수준 변이*는 괜찮습니다.

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

렌더링 과정에 `items`를 만들고 다른 컴포넌트가 가지고 참조하진 않습니다. 그래서 렌더링 결과를 만들기 전까지 처리하는 과정에 얼마든지 변이시킬 수 있습니다. 지역수준 변이를 피할 이유는 없습니다.

비슷하게 완전히 순수하진 않더라도 게으른 초기화도 괜찮습니다.

```jsx
function ExpenseForm() {
  // 다른 컴포넌트에 영향을 주지 않는다면 괜찮습니다.
  SuperCalculator.initializeIfNotReady();

  // 렌더링을 계속합니다...
}
```

다른 컴포넌트의 렌더링에 영향을 주지 않으면 컴포넌트를 여러번 호출하는 것은 안전합니다. React는 엄격한 함수형 패러다임에서 100% 순수성을 가지지 못해도 괜찮습니다. [멱등성](https://stackoverflow.com/questions/1077412/what-is-an-idempotent-operation)은 React에서 순수성보다 중요합니다.

React 컴포넌트에서 사용자가 볼 수 있는 부작용은 허용되지 않습니다. 컴포넌트 함수는 스스로 화면에 변화를 만들어낼 수 없습니다.

## 재귀

어떻게 컴포넌트를 다른 컴포넌트에서 사용할 수 있을까요? 컴포넌트는 함수이기 때문에 *호출할* 수 있습니다.

```jsx
let reactElement = Form({ showMessage: true });
ReactDOM.render(reactElement, domContainer);
```

그러나 이것은 React 런타임에서 자연스러운 방법이 아닙니다.

컴포넌트를 사용하는 자연스러운 방법은 같은 우리가 이미 본 React 엘리먼트 메커니즘과 같습니다. **절대로 컴포넌트 함수를 직접 호출하지마세요. 대신 React가 알아서 해줄겁니다.**

```jsx
// { type: Form, props: { showMessage: true } }
let reactElement = <Form showMessage={true} />;
ReactDOM.render(reactElement, domContainer);
```

그러면 React 내부 어딘가 컴포넌트가 호출됩니다.

```jsx
// React 내부 어딘가
let type = reactElement.type; // Form
let props = reactElement.props; // { showMessage: true }
let result = type(props); // Form이 무엇을 반환하든 상관없습니다.
```

컴포넌트 함수 이름은 캐멀케이스로 컨벤션을 맞춥니다. JSX 번역은 `<form>` 가 아닌 `<Form>`을 볼때 문자열 식별자 유형이 아닌 객체 타입으로 봅니다.

```jsx
console.log(<form />.type); // 'form' 문자열
console.log(<Form />.type); // Form 함수
```

글로벌 등록 메커니즘은 없습니다. `<Form />`이라고 치면 문자열 그대로 `Form`을 참조합니다. Form이 지역 스코프에 존재하지 않으면 자바스크립트 에러를 보게 될겁니다.

**알았어, 그래서 React 엘리먼트 type이 함수일 때 React는 뭘 하는데? React는 컴포넌트를 호출하고 해당 컴포넌트가 어떤 엘리먼트를 렌더링하고 싶은지 물어봅니다.**

이 프로세스는 재귀적이고 [여기](https://reactjs.org/blog/2015/12/18/react-components-elements-and-instances.html)에 좀더 자세하게 설명되어 있습니다. 짧게 말하자면 다음과 같습니다.

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

이것이 재조정이 재귀적인 이유입니다. React가 엘리먼트 트리를 순회할 때 유형이 컴포넌트인 엘리먼트를 방문할 수 있습니다. React는 함수를 호출하고 반환된 React 엘리먼트 트리로 계속 내려갑니다. 결국 모든 컴포넌트를 실행하고 React는 호스트 트리의 변경 내용을 알게 됩니다.

이미 이야기한 재조정 조건이 여기에도 적용이 되어 있습니다. 같은 위치에(색인 및 선택사항 `key`)가 변하면 React는 내부의 호스트 객체를 버리고 다시 만듭니다.

## 제어의 역전

궁금하실 수도 있을 겁니다. 왜 직접 컴포넌트를 호출하지 않는거지? 왜 `Form()` 대신 `<Form />` 이라고 써야 하는거야? 하고요.

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

위 코드는 [제어의 역전](https://en.wikipedia.org/wiki/Inversion_of_control)의 전형적인 예시입니다. React가 컴포넌트 호출 제어권을 가지게 되어 몇가지 흥미로운 점이 있습니다.

* **컴포넌트는 함수 이상의 역할을 합니다.** React can augment component functions with features like *local state* that are tied to the component identity in the tree. A good runtime provides fundamental abstractions that match the problem at hand. As we already mentioned, React is oriented specifically at programs that render UI trees and respond to interactions. If you called components directly, you’d have to build these features yourself.

* **Component types participate in the reconciliation.** By letting React call your components, you also tell it more about the conceptual structure of your tree. For example, when you move from rendering `<Feed>` to the `<Profile>` page, React won’t attempt to re-use host instances inside them — just like when you replace `<button>` with a `<p>`. All state will be gone — which is usually good when you render a conceptually different view. You wouldn't want to preserve input state between `<PasswordForm>` and `<MessengerChat>` even if the `<input>` position in the tree accidentally “lines up” between them.

* **React can delay the reconciliation.** If React takes control over calling our components, it can do many interesting things. For example, it can let the browser do some work between the component calls so that re-rendering a large component tree [doesn’t block the main thread](https://reactjs.org/blog/2018/03/01/sneak-peek-beyond-react-16.html). Orchestrating this manually without reimplementing a large part of React is difficult.

* **A better debugging story.** If components are first-class citizens that the library is aware of, we can build [rich developer tools](https://github.com/facebook/react-devtools) for introspection in development.

The last benefit to React calling your component functions is *lazy evaluation*. Let’s see what this means.

## Lazy Evaluation

When we call functions in JavaScript, arguments are evaluated before the call:

```jsx
// (2) This gets computed second
eat(
  // (1) This gets computed first
  prepareMeal()
);
```

This is usually what JavaScript developers expect because JavaScript functions can have implicit side effects. It would be surprising if we called a function, but it wouldn’t execute until its result gets somehow “used” in JavaScript.

However, React components are [relatively](#purity) pure. There is absolutely no need to execute it if we know its result won’t get rendered on the screen.

Consider this component putting `<Comments>` inside a `<Page>`:

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

The `Page` component can render the children given to it inside some `Layout`:

```jsx{4}
function Page({ user, children }) {
  return (
    <Layout>
      {children}
    </Layout>
  );
}
```

*(`<A><B /></A>` in JSX is the same as `<A children={<B />} />`.)*

But what if it has an early exit condition?

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

If we called `Comments()` as a function, it would execute immediately regardless of whether `Page` wants to render them or not:

```jsx{4,8}
// {
//   type: Page,
//   props: {
//     children: Comments() // Always runs!
//   }
// }
<Page>
  {Comments()}
</Page>
```

But if we pass a React element, we don’t execute `Comments` ourselves at all:

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

This lets React decide when and *whether* to call it. If our `Page` component ignores its `children` prop and renders
`<h1>Please log in</h1>` instead, React won’t even attempt to call the `Comments` function. What’s the point?

This is good because it both lets us avoid unnecessary rendering work that would be thrown away, and makes the code less fragile. (We don’t care if `Comments` throws or not when the user is logged out — it won’t be called.)

## State

We talked [earlier](#reconciliation) about identity and how an element’s conceptual “position” in the tree tells React whether to re-use a host instance or create a new one. Host instances can have all kinds of local state: focus, selection, input, etc. We want to preserve this state between updates that conceptually render the same UI. We also want to predictably destroy it when we render something conceptually different (such as moving from `<SignupForm>` to `<MessengerChat>`).

**Local state is so useful that React lets *your own* components have it too.** Components are still functions but React augments them with features that are useful for UIs. Local state tied to the position in the tree is one of these features.

We call these features *Hooks*. For example, `useState` is a Hook.

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

It returns a pair of values: the current state and a function that updates it.

The [array destructuring](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment#Array_destructuring) syntax lets us give arbitrary names to our state variables. For example, I called this pair `count` and `setCount`, but it could’ve been `banana` and `setBanana`. In the text below, I will use `setState` to refer to the second value regardless of its actual name in the specific examples.

*(You can learn more about `useState` and other Hooks provided by React [here](https://reactjs.org/docs/hooks-intro.html).)*

## Consistency

Even if we want to split the reconciliation process itself into [non-blocking](https://www.youtube.com/watch?v=mDdgfyRB5kg) chunks of work, we should still perform the actual host tree operations in a single synchronous swoop. This way we can ensure that the user doesn’t see a half-updated UI, and that the browser doesn’t perform unnecessary layout and style recalculation for intermediate states that the user shouldn’t see.

This is why React splits all work into the “render phase” and the “commit phase”. *Render phase* is when React calls your components and performs reconciliation. It is safe to interrupt and [in the future](https://reactjs.org/blog/2018/03/01/sneak-peek-beyond-react-16.html) will be asynchronous. *Commit phase* is when React touches the host tree. It is always synchronous.


## Memoization

When a parent schedules an update by calling `setState`, by default React reconciles its whole child subtree. This is because React can’t know whether an update in the parent would affect the child or not, and by default, React opts to be consistent. This may sound very expensive but in practice, it’s not a problem for small and medium-sized subtrees.

When trees get too deep or wide, you can tell React to [memoize](https://en.wikipedia.org/wiki/Memoization) a subtree and reuse previous render results during shallow equal prop changes:

```jsx{5}
function Row({ item }) {
  // ...
}

export default React.memo(Row);
```

Now `setState` in a parent `<Table>` component would skip over reconciling `Row`s whose `item` is referentially equal to the `item` rendered last time.

You can get fine-grained memoization at the level of individual expressions with the [`useMemo()` Hook](https://reactjs.org/docs/hooks-reference.html#usememo). The cache is local to component tree position and will be destroyed together with its local state. It only holds one last item.

React intentionally doesn’t memoize components by default. Many components always receive different props so memoizing them would be a net loss.

## Raw Models

Ironically, React doesn’t use a “reactivity” system for fine-grained updates. In other words, any update at the top triggers reconciliation instead of updating just the components affected by changes.

This is an intentional design decision. [Time to interactive](https://calibreapp.com/blog/time-to-interactive/) is a crucial metric in consumer web applications, and traversing models to set up fine-grained listeners spends that precious time. Additionally, in many apps, interactions tend to result either in small (button hover) or large (page transition) updates, in which case fine-grained subscriptions are a waste of memory resources.

One of the core design principles of React is that it works with raw data. If you have a bunch of JavaScript objects received from the network, you can pump them directly into your components with no preprocessing. There are no gotchas about which properties you can access, or unexpected performance cliffs when a structure slightly changes. React rendering is O(*view size*) rather than O(*model size*), and you can significantly cut the *view size* with [windowing](https://react-window.now.sh/#/examples/list/fixed-size).

There are some kinds of applications where fine-grained subscriptions are beneficial — such as stock tickers. This is a rare example of “everything constantly updating at the same time”. While imperative escape hatches can help optimize such code, React might not be the best fit for this use case. Still, you can implement your own fine-grained subscription system on top of React.

**Note that there are common performance issues that even fine-grained subscriptions and “reactivity” systems can’t solve.** For example, rendering a *new* deep tree (which happens on every page transition) without blocking the browser. Change tracking doesn’t make it faster — it makes it slower because we have to do more work to set up subscriptions. Another problem is that we have to wait for data before we can start rendering the view. In React, we aim to solve both of these problems with [Concurrent Rendering](https://reactjs.org/blog/2018/03/01/sneak-peek-beyond-react-16.html).


## Batching

Several components may want to update state in response to the same event. This example is contrived but it illustrates a common pattern:

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

When an event is dispatched, the child’s `onClick` fires first (triggering its `setState`). Then the parent calls `setState` in its own `onClick` handler.

If React immediately re-rendered components in response to `setState` calls, we’d end up rendering the child twice:

```jsx{4,8}
*** Entering React's browser click event handler ***
Child (onClick)
  - setState
  - re-render Child // 😞 unnecessary
Parent (onClick)
  - setState
  - re-render Parent
  - re-render Child
*** Exiting React's browser click event handler ***
```

The first `Child` render would be wasted. And we couldn’t make React skip rendering `Child` for the second time because the `Parent` might pass some different data to it based on its updated state.

**This is why React batches updates inside event handlers:**

```jsx
*** Entering React's browser click event handler ***
Child (onClick)
  - setState
Parent (onClick)
  - setState
*** Processing state updates                     ***
  - re-render Parent
  - re-render Child
*** Exiting React's browser click event handler  ***
```

The `setState` calls in components wouldn’t immediately cause a re-render. Instead, React would execute all event handlers first, and then trigger a single re-render batching all of those updates together.

Batching is good for performance but can be surprising if you write code like:

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

If we start with `count` set to `0`, these would just be three `setCount(1)` calls. To fix this, `setState` provides an overload that accepts an “updater” function:

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

React would put the updater functions in a queue, and later run them in sequence, resulting in a re-render with `count` set to `3`.

When state logic gets more complex than a few `setState` calls, I recommend expressing it as a local state reducer with the [`useReducer` Hook](https://reactjs.org/docs/hooks-reference.html#usereducer). It’s like an evolution of this “updater” pattern where each update is given a name:

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

The `action` argument can be anything, although an object is a common choice.

## Call Tree

A programming language runtime usually has a [call stack](https://medium.freecodecamp.org/understanding-the-javascript-call-stack-861e41ae61d4). When a function `a()` calls `b()` which itself calls `c()`, somewhere in the JavaScript engine there’s a data structure like `[a, b, c]` that “keeps track” of where you are and what code to execute next. Once you exit out of `c`, its call stack frame is gone — poof! It’s not needed anymore. We jump back into `b`. By the time we exit `a`, the call stack is empty.

Of course, React itself runs in JavaScript and obeys JavaScript rules. But we can imagine that internally React has some kind of its own call stack to remember which component we are currently rendering, e.g. `[App, Page, Layout, Article /* we're here */]`.

React is different from a general purpose language runtime because it’s aimed at rendering UI trees. These trees need to “stay alive” for us to interact with them. The DOM doesn’t disappear after our first `ReactDOM.render()` call.

This may be stretching the metaphor but I like to think of React components as being in a “call tree” rather than just a “call stack”. When we go “out” of the `Article` component, its React “call tree” frame doesn’t get destroyed. We need to keep the local state and references to the host instances [somewhere](https://medium.com/react-in-depth/the-how-and-why-on-reacts-usage-of-linked-list-in-fiber-67f1014d0eb7).

These “call tree” frames *are* destroyed along with their local state and host instances, but only when the [reconciliation](#reconciliation) rules say it’s necessary. If you ever read React source, you might have seen these frames being referred to as [Fibers](https://en.wikipedia.org/wiki/Fiber_(computer_science)).

Fibers are where the local state actually lives. When the state is updated, React marks the Fibers below as needing reconciliation, and calls those components.

## Context

In React, we pass things down to other components as props. Sometimes, the majority of components need the same thing — for example, the currently chosen visual theme. It gets cumbersome to pass it down through every level.

In React, this is solved by [Context](https://reactjs.org/docs/context.html). It is essentially like [dynamic scoping](http://wiki.c2.com/?DynamicScoping) for components. It’s like a wormhole that lets you put something on the top, and have every child at the bottom be able to read it and re-render when it changes.

```jsx
const ThemeContext = React.createContext(
  'light' // Default value as a fallback
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

When `SomeDeeplyNestedChild` renders, `useContext(ThemeContext)` will look for the closest `<ThemeContext.Provider>` above it in the tree, and use its `value`.

(In practice, React maintains a context stack while it renders.)

If there’s no `ThemeContext.Provider` above, the result of `useContext(ThemeContext)` call will be the default value specified in the `createContext()` call. In our example, it is `'light'`.


## Effects

We mentioned earlier that React components shouldn’t have observable side effects during rendering. But side effects are sometimes necessary. We may want to manage focus, draw on a canvas, subscribe to a data source, and so on.

In React, this is done by declaring an effect:

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

When possible, React defers executing effects until after the browser re-paints the screen. This is good because code like data source subscriptions shouldn’t hurt [time to interactive](https://calibreapp.com/blog/time-to-interactive/) and [time to first paint](https://developers.google.com/web/tools/lighthouse/audits/first-meaningful-paint). (There's a [rarely used](https://reactjs.org/docs/hooks-reference.html#uselayouteffect) Hook that lets you opt out of that behavior and do things synchronously. Avoid it.)

Effects don’t just run once. They run both after a component is shown to the user for the first time, and after it updates. Effects can close over current props and state, such as with `count` in the above example.

Effects may require cleanup, such as in case of subscriptions. To clean up after itself, an effect can return a function:

```jsx
  useEffect(() => {
    DataSource.addSubscription(handleChange);
    return () => DataSource.removeSubscription(handleChange);
  });
```

React will execute the returned function before applying this effect the next time, and also before the component is destroyed.

Sometimes, re-running the effect on every render can be undesirable. You can tell React to [skip](https://reactjs.org/docs/hooks-effect.html#tip-optimizing-performance-by-skipping-effects) applying an effect if certain variables didn’t change:

```jsx{3}
  useEffect(() => {
    document.title = `You clicked ${count} times`;
  }, [count]);
```

However, it is often a premature optimization and can lead to problems if you’re not familiar with how JavaScript closures work.

For example, this code is buggy:

```jsx
  useEffect(() => {
    DataSource.addSubscription(handleChange);
    return () => DataSource.removeSubscription(handleChange);
  }, []);
```

It is buggy because `[]` says “don’t ever re-execute this effect”. But the effect closes over `handleChange` which is defined outside of it. And `handleChange` might reference any props or state:

```jsx
  function handleChange() {
    console.log(count);
  }
```

If we never let the effect re-run, `handleChange` will keep pointing at the version from the first render, and `count` will always be `0` inside of it.

To solve this, make sure that if you specify the dependency array, it includes **all** things that can change, including the functions:

```jsx{4}
  useEffect(() => {
    DataSource.addSubscription(handleChange);
    return () => DataSource.removeSubscription(handleChange);
  }, [handleChange]);
```

Depending on your code, you might still see unnecessary resubscriptions because `handleChange` itself is different on every render. The [`useCallback`](https://reactjs.org/docs/hooks-reference.html#usecallback) Hook can help you with that. Alternatively, you can just let it re-subscribe. For example, browser’s `addEventListener` API is extremely fast, and jumping through hoops to avoid calling it might cause more problems than it’s worth.

*(You can learn more about `useEffect` and other Hooks provided by React [here](https://reactjs.org/docs/hooks-effect.html).)*

## Custom Hooks

Since Hooks like `useState` and `useEffect` are function calls, we can compose them into our own Hooks:

```jsx{2,8}
function MyResponsiveComponent() {
  const width = useWindowWidth(); // Our custom Hook
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

Custom Hooks let different components share reusable stateful logic. Note that the *state itself* is not shared. Each call to a Hook declares its own isolated state.

*(You can learn more about writing your own Hooks [here](https://reactjs.org/docs/hooks-custom.html).)*

## Static Use Order

You can think of `useState` as a syntax for defining a “React state variable”. It’s not *really* a syntax, of course. We’re still writing JavaScript. But we are looking at React as a runtime environment, and because React tailors JavaScript to describing UI trees, its features sometimes live closer to the language space.

If `use` *were* a syntax, it would make sense for it to be at the top level:

```jsx{3}
// 😉 Note: not a real syntax
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

What would putting it into a condition or a callback or outside a component even mean?

```jsx
// 😉 Note: not a real syntax

// This is local state... of what?
const [count, setCount] = use State(0);

component Example() {
  if (condition) {
    // What happens to it when condition is false?
    const [count, setCount] = use State(0);
  }

  function handleClick() {
    // What happens to it when we leave a function?
    // How is this different from a variable?
    const [count, setCount] = use State(0);
  }
```

React state is local to the *component* and its identity in the tree. If `use` were a real syntax it would make sense to scope it to the top-level of a component too:


```jsx
// 😉 Note: not a real syntax
component Example(props) {
  // Only valid here
  const [count, setCount] = use State(0);

  if (condition) {
    // This would be a syntax error
    const [count, setCount] = use State(0);
  }
```

This is similar to how `import` only works at the top level of a module.

**Of course, `use` is not actually a syntax.** (It wouldn’t bring much benefit and would create a lot of friction.)

However, React *does* expect that all calls to Hooks happen only at the top level of a component and unconditionally. These [Rules of Hooks](https://reactjs.org/docs/hooks-rules.html) can be enforced with [a linter plugin](https://www.npmjs.com/package/eslint-plugin-react-hooks). There have been heated arguments about this design choice but in practice, I haven’t seen it confusing people. I also wrote about why commonly proposed alternatives [don’t work](https://overreacted.io/why-do-hooks-rely-on-call-order/).

Internally, Hooks are implemented as [linked lists](https://dev.to/aspittel/thank-u-next-an-introduction-to-linked-lists-4pph). When you call `useState`, we move the pointer to the next item. When we exit the component’s [“call tree” frame](#call-tree), we save the resulting list there until the next render.

[This article](https://medium.com/@ryardley/react-hooks-not-magic-just-arrays-cd4f1857236e) provides a simplified explanation for how Hooks work internally. Arrays might be an easier mental model than linked lists:


```jsx
// Pseudocode
let hooks, i;
function useState() {
  i++;
  if (hooks[i]) {
    // Next renders
    return hooks[i];
  }
  // First render
  hooks.push(...);
}

// Prepare to render
i = -1;
hooks = fiber.hooks || [];
// Call the component
YourComponent();
// Remember the state of Hooks
fiber.hooks = hooks;
```

*(If you’re curious, the real code is [here](https://github.com/facebook/react/blob/master/packages/react-reconciler/src/ReactFiberHooks.js).)*

This is roughly how each `useState()` call gets the right state. As we’ve learned [earlier](#reconciliation), “matching things up” isn’t new to React — reconciliation relies on the elements matching up between renders in a similar way.

## What’s Left Out

We’ve touched on pretty much all important aspects of the React runtime environment. If you finished this page, you probably know React in more detail than 90% of its users. And there’s nothing wrong with that!

There are some parts I left out — mostly because they’re unclear even to us. React doesn’t currently have a good story for multipass rendering, i.e. when the parent render needs information about the children. Also, the [error handling API](https://reactjs.org/docs/error-boundaries.html) doesn’t yet have a Hooks version. It’s possible that these two problems can be solved together. Concurrent Mode is not stable yet, and there are interesting questions about how Suspense fits into this picture. Maybe I’ll do a follow-up when they’re fleshed out and Suspense is ready for more than [lazy loading](https://reactjs.org/blog/2018/10/23/react-v-16-6.html#reactlazy-code-splitting-with-suspense).

**I think it speaks to the success of React’s API that you can get very far without ever thinking about most of these topics.** Good defaults like the reconciliation heuristics do the right thing in most cases. Warnings, like the `key` warning, nudge you when you risk shooting yourself in the foot.

If you’re a UI library nerd, I hope this post was somewhat entertaining and clarified how React works in more depth. Or maybe you decided React is too complicated and you’ll never look at it again. In either case, I’d love to hear from you on Twitter! Thank you for reading.
