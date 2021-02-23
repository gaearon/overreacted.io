---
title: 'memo()를 하기 전에'
date: '2021-02-23'
spoiler: "자연스럽게 이끌어내는 렌더링 최적화"
---

React 성능 최적화에 대한 많은 글이 있습니다. 일반적으로 일부 상태 업데이트가 느리다면 다음과 같이 할 수 있습니다.

1. production 빌드를 실행 중인지 확인합니다. (개발 빌드는 극단적인 경우에는 수십 배까지도 의도적으로 더 느립니다.)
2. 상태를 트리에서 불필요하게 높은 곳에 두지 않았는지 확인합니다. (예를 들면 input의 상태를 중앙화된 스토어에 두는 것은 최선이 아닐 수 있습니다.)
3. React DevTools Profiler를 실행하여 리렌더링되는 부분을 확인하고 가장 비싼 하위 트리를 `memo()`로 감쌉니다. (그리고 필요한 곳에 `useMemo()`를 추가합니다.)

이 마지막 단계는 특히 컴포넌트 사이에 있는 경우에 성가시며, 이상적으로는 컴파일러가 이를 수행할 수 있습니다. 미래에는 그럴지도 모릅니다.

**이 글에서는 두 가지 다른 기술을 공유하고자 합니다.** 이러한 기술은 놀라울 정도로 기본적인 것들이라 사람들은 이로 인해 렌더링 성능이 향상된다는 사실을 거의 알아차리지 못합니다.

**이러한 기술들은 여러분이 이미 알고있는 것을 보완합니다!** `memo`나 `useMemo`를 대체하는 것은 아니지만 이러한 방식을 먼저 시도해 보면 좋습니다.

## (인위적으로) 느린 컴포넌트

다음과 심각한 심각한 렌더링 성능 문제가 있는 컴포넌트가 있습니다.

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
    // 인위적인 지연 -- 100ms 동안 아무것도 하지 않음
  }
  return <p>저는 아주 느린 컴포넌트 트리입니다.</p>;
}
```

*([실행 해보기](https://codesandbox.io/s/frosty-glade-m33km?file=/src/App.js:23-513))*

문제는 `App` 내부에서 `color`가 변경 될 때마다 인위적으로 지연시킨 `<ExpensiveTree />`를 다시 렌더링하여 매우 느려진다는 것입니다.

여기서 [`memo()`를 쓰고](https://codesandbox.io/s/amazing-shtern-61tu4?file=/src/App.js) 끝내버려도 되지만, 이에 대해선 흥미로운 글이 이미 많으니 시간을 쓰지 않겠습니다. 두 가지 다른 해결책을 소개하고 싶습니다.

## 해결 방법 1: 상태를 아래로 내리기

렌더링 코드를 자세히 살펴보면 실제로는 반환 된 트리의 일부만 현재의 `color`와 관련이 있음을 알 수 있습니다.

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

그러니 그 부분을 `Form` 컴포넌트로 추출하고 상태를 그 안으로 _내립니다._

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

*([실행 해보기](https://codesandbox.io/s/billowing-wood-1tq2u?file=/src/App.js:64-380))*

이제 `color`가 변경되면 `Form`만 다시 렌더링됩니다. 문제 해결!

## 해결 방법 2: 내용물을 끌어올리기

위의 해결 방법은 상태의 일부가 값 비싼 트리 *위*에서 사용되는 경우에는 소용이 없습니다. 예를 들어 *부모* `<div>`에 `color`를 넘긴다고 가정해 보겠습니다.

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

*([실행 해보기](https://codesandbox.io/s/bold-dust-0jbg7?file=/src/App.js:58-313))*

이제는 `<ExpensiveTree />`를 포함한 div까지 포함해야하니 `color`를 사용하지 않는 부분을 다른 컴포넌로 "추출"할 수 없는 것 같습니다. 이번에는 `memo`를 피할 수 없겠죠?

아니면 가능할까요?

이 샌드박스를 가지고 놀면서 알아낼 수 있는지 확인해보세요.

...

...

...

정답은 매우 간단합니다.

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

*([실행 해보기](https://codesandbox.io/s/wonderful-banach-tyfr1?file=/src/App.js:58-423))*

우리는 `App` 컴포넌트를 두 개로 나누었습니다. `color`에 의존하는 부분은 `color` 상태 변수 자체를 포함해서 `ColorPicker`로 옮겼습니다.

`color`와 상관없는 부분은 `App` 컴포넌트에 남아 있으며 `children` prop이라고 알려진 JSX 콘텐츠로 `ColorPicker`에 전달됩니다.

`color`가 변경되면 `ColorPicker`가 다시 렌더링됩니다. 하지만 이전에 `App`에서 얻은 것과 동일한 `children` prop을 가지고 있으므로 React는 해당 하위 트리를 방문하지 않습니다.

그래서 결과적으로, `<ExpensiveTree />`는 다시 렌더링되지 않습니다.

## 교훈은 무엇일까요?

`memo` 또는`useMemo`와 같은 최적화를 적용하기 전에 변경되지 않는 부분에서 변경되는 부분을 나눌 수 있는지 살펴 보는 것이 좋습니다.

이 접근법의 흥미로운 부분은 **그 자체로 성능과는 전혀 아무런 관련이 없다는 것입니다.** 일반적으로 컴포넌트를 분리하기 위해 `children` prop을 사용하여 하면 애플리케이션의 데이터 흐름을 더 쉽게 따라갈 수 있고 트리를 따라 아래로 내려 오는 prop의 수를 줄일 수 있습니다. 이와 같은 경우에 성능 향상이 최종 목표는 아니었지만 금상첨화입니다.

흥미롭게도 이 패턴은 미래에 더욱 큰 성능 이점을 제공합니다.

예를 들면 [서버 컴포넌트](https://reactjs.org/blog/2020/12/21/data-fetching-with-react-server-components.html)가 안정적이고 채택될 준비가 되면, 위 `ColorPicker` 컴포넌트는 `children`을 [서버로 부터](https://youtu.be/TQQPAU21ZUw?t=1314) 받을 수 있습니다. 전체 `<ExpensiveTree />` 컴포넌트 혹은 일부분이 서버에서 실행될 수 있으며, 최상위의 React 상태 업데이트조차도 클라이언트에서 해당 부분을 "건너 뛸" 것입니다.

그것은 심지어 `memo`로는 할 수없는 일입니다! 그러나 다시 말하지만 이 두 가지 접근 방식은 상호 보완적입니다. 상태를 아래로 내리는 것을 게을리하지 마세요. (그리고 내용물을 끌어올리는 것도!)

그런 다음에도 충분하지 않은 경우 Profiler를 사용하고 memo를 끼얹습니다.

## 전에 이런 글을 읽었던 것 같은데요?

[네. 아마도요.](https://kentcdodds.com/blog/optimize-react-re-renders)

이것은 새로운 아이디어가 아닙니다. React 합성 모델의 자연스러운 결과입니다. 과소평가 될 만큼 아주 간단하지만, 그만큼 더 많은 사랑 받을 자격이 있습니다.