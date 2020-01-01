---
title: 탄력적인 컴포넌트 작성하기
date: '2019-03-16'
spoiler: 4가지 원칙이 올바른 길로 인도합니다.
---

이제 막 React를 배우기 시작한 사람들은 스타일 가이드를 찾고는 합니다. 프로젝트 전체에 일관된 규칙을 적용하는 것은 좋은 생각이지만, 규칙들 중 많은 수가 자의적인 것이고 React는 이들에 대해 별로 구애되지 않습니다.

서로 다른 타입 시스템을 사용할 수도 있고, 함수 선언이나 화살표 함수 중 한 쪽을 선호할 수도 있고, props를 알파벳 순으로 정렬하거나 원하는 대로 정렬할 수도 있습니다.

이러한 유연성은 이미 사용중인 코딩 규칙에 [React 프로젝트를 통합하기](https://reactjs.org/docs/add-react-to-a-website.html) 쉽게 해 줍니다. 하지만 끊임없는 논쟁을 불러일으키기도 하죠.

**모든 컴포넌트가 따라야 하는 디자인 원칙은 _존재합니다_. 하지만 저는 스타일 가이드가 이러한 원칙을 잘 담고 있다고 생각하지 않습니다. 먼저 스타일 가이드에 대해 이야기한 다음, [정말로 유용한 원칙들에 대해 알아봅시다](#%EC%9C%A0%EC%97%B0%ED%95%9C-%EC%BB%B4%ED%8F%AC%EB%84%8C%ED%8A%B8-%EC%9E%91%EC%84%B1%ED%95%98%EA%B8%B0).**

---

## 상상 속의 문제에 신경쓰지 마세요

컴포넌트 디자인 원칙에 대해 이야기하기 전에, 스타일 가이드에 대해 몇 마디 하겠습니다. 일반적인 의견은 아니지만 누군가는 이에 대해 이야기해야 하니까요!

자바스크립트 커뮤니티에는 linter에 의해 강제되는 몇몇 엄격하고 독선적인 스타일 가이드들이 있습니다. 이 가이드들이 일으키는 마찰이 그 이득보다 더 크다는게 제 개인적인 의견입니다. 완벽히 유효한 코드를 들고 와서는 "React가 이 코드에 대해 불평해요"라고 말하지만, 사실 불평하고 있는 것은 그 사람들의 lint 설정인 경우를 저는 수도 없이 봐왔습니다! 이 때문에 세 가지 문제가 생깁니다:

* 사람들이 linter를 유용한 도구가 아니라 **지나치게 시끄러운 문지기** 정도로 여깁니다. 스타일 지적의 홍수 속에 유용한 경고가 묻히고 맙니다. 결과적으로 사람들은 디버깅 중에 linter의 메시지를 훑어보지 않게 되고, 유용한 조언도 놓치게 됩니다. Javascript를 별로 쓰지 않는 사람들(예를 들어 디자이너)은 코딩이 더 힘들어집니다.

* **유효하거나 그렇지 않은 패턴을 구분**하는 법을 배우지 않습니다. 예를 들어, 널리 알려진 규칙으로 `componentDidMount` 안에서 `setState` 호출을 금지하는 것이 있습니다. 하지만 이 방식이 정말로 "나쁜" 것이라면, React에서 그냥 그러지 못하게 막았을겁니다! 툴팁의 위치를 잡기 위해 DOM 노드의 레이아웃을 확인하는 것과 같이, 이 방식이 적당한 경우가 분명히 있습니다. 이 규칙을 "우회"하기 위해 `setTimeout`을 사용하는 사람들을 봤습니다. 완전히 핵심을 놓치고 있는거죠.

* 결국 사람들은 "규칙을 집행하는 사람의 마음가짐"을 가지고 **의미있는 차이를 가져오지는 않지만** 코드에서 쉽게 찾을 수 있는 규칙들을 강요하게 됩니다. "넌 함수 선언을 사용했지만, *우리* 프로젝트는 화살표 함수를 써.". 저는 이런 식의 규칙을 강요하고 싶은 기분이 들 때면, 마음 속 깊은 곳을 들여다보고 이 규칙에 감정이 실려 있음을 깨닫습니다. 그리고 이 규칙을 놓아주기 위해 노력합니다. 이것들은 코드를 개선하지 않으면서도 가짜 성취감을 느끼게 합니다.

제가 lint를 쓰지 말라고 말하는걸까요? 절대 아닙니다!

**좋은 설정과 함께라면 linter는 버그를 미리 발견하게 해주는 훌륭한 도구입니다.** 혼란은 *스타일*에 너무 집중할 때 생깁니다.

---

## Lint 설정, 설레지 않으면 버려라

다음 주 월요일에 할 일을 제안해 보겠습니다. 30분 정도 팀원들을 소집해서 프로젝트 설정 내의 모든 lint 규칙을 확인합시다: *"이 규칙이 우리가 버그를 잡는데 도움이 된 적이 있었나?"* 만약 아니라면, *꺼버리세요.* (아니면 스타일 규칙이 없는 [`eslint-config-react-app`](https://www.npmjs.com/package/eslint-config-react-app)에서 바닥부터 시작할 수도 있습니다.)

적어도 여러분의 팀은 마찰을 일으키는 규칙을 제거하는 절차를 갖추고 있어야 합니다. 당신이나 다른 누군가가 작년에 추가한 lint 설정이 "최선"일거라고 생각하지 마세요. 질문하고 답을 찾으세요. 누구도 당신이 직접 lint 규칙을 고를 만큼 똑똑하지 못하다고 말할 수 없습니다.

**하지만 포맷팅은 어떻게 하죠?** [Prettier](https://prettier.io/)를 사용하고 "스타일"에 대해서는 잊으세요. 당신 대신 수정해주는 도구가 있다면, 공백을 추가로 넣으라고 당신에게 소리지르는 도구는 필요 없습니다. *미학*을 위해서가 아니라 *버그*를 찾기 위해서 linter를 사용하세요.

물론, 포맷팅과 직접적인 연관이 있지는 않지만 프로젝트 전체에 일관성이 없으면 곤란한 코딩 스타일도 있습니다.

하지만 그 중 대부분은 lint 규칙을 통해 잡아내기에는 너무 미묘합니다. 팀원 간에 **신뢰를 쌓고**, 위키 페이지나 짧은 디자인 가이드를 통해 유용한 학습 내용을 공유하는 것이 중요한 이유입니다.

모든 것을 자동화할 필요는 없습니다! 가이드 안의 설명을 *정말로 읽어서* 얻을 수 있는 통찰은 "규칙"을 따르는 것보다 가치있습니다.

**하지만 엄격한 스타일 가이드를 따르는 것이 혼란을 줄 뿐이라면, 정말로 중요한건 뭐죠?**

그것이 이 글의 주제입니다.

---

## 유연한 컴포넌트 작성하기

몇 단계나 들여쓰기를 하는지나 import를 알파벳 순으로 정렬하는 일은 망가진 디자인을 고치는데엔 아무 도움이 안 됩니다. 그러니 코드가 어떻게 *보이는지* 대신, 어떻게 *작동하는지*에 집중하겠습니다. 다음 몇 가지 컴포넌트 디자인 원칙이 제가 매우 유용하다고 여기는 것들입니다:

1. **[데이터 흐름을 중단해서는 안 됩니다](#%EC%9B%90%EC%B9%99-1-%EB%8D%B0%EC%9D%B4%ED%84%B0-%ED%9D%90%EB%A6%84%EC%9D%84-%EC%A4%91%EB%8B%A8%ED%95%B4%EC%84%9C%EB%8A%94-%EC%95%88-%EB%90%A9%EB%8B%88%EB%8B%A4)**
2. **[언제나 렌더링 할 준비가 되어 있어야 합니다](#%EC%9B%90%EC%B9%99-2-%EC%96%B8%EC%A0%9C%EB%82%98-%EB%A0%8C%EB%8D%94%EB%A7%81-%ED%95%A0-%EC%A4%80%EB%B9%84%EA%B0%80-%EB%90%98%EC%96%B4-%EC%9E%88%EC%96%B4%EC%95%BC-%ED%95%A9%EB%8B%88%EB%8B%A4)**
3. **[싱글톤인 컴포넌트는 없습니다](#%EC%9B%90%EC%B9%99-3-%EC%8B%B1%EA%B8%80%ED%86%A4%EC%9D%B8-%EC%BB%B4%ED%8F%AC%EB%84%8C%ED%8A%B8%EB%8A%94-%EC%97%86%EC%8A%B5%EB%8B%88%EB%8B%A4)**
4. **[항상 지역 상태를 격리하세요](#%EC%9B%90%EC%B9%99-4-%ED%95%AD%EC%83%81-%EC%A7%80%EC%97%AD-%EC%83%81%ED%83%9C%EB%A5%BC-%EA%B2%A9%EB%A6%AC%ED%95%98%EC%84%B8%EC%9A%94)**

React를 쓰지 않더라도, 단방향 데이터 흐름을 사용하는 UI 컴포넌트를 사용한다면 시행착오를 통해 같은 원칙에 도달할겁니다.

---

## 원칙 1: 데이터 흐름을 중단해서는 안 됩니다

### 렌더링 내에서 데이터 흐름을 중단하지 마세요

여러분이 만든 컴포넌트를 사용하는 사람들은, 서로 다른 props를 전달할 때마다 컴포넌트가 그 변화를 반영하리라고 기대합니다:

```jsx
// isOk는 state에서 왔고 시간에 따라 변할 수 있습니다
<Button color={isOk ? 'blue' : 'red'} />
```

일반적으로, 이것이 React가 작동하는 기본 방식입니다. `color` prop을 `Button` 컴포넌트 안에서 사용하면, 렌더링 할 때 위에서 전달한 값을 확인할 수 있습니다:

```jsx
function Button({ color, children }) {
  return (
    // ✅ `color`는 언제나 최신값입니다!
    <button className={'Button-' + color}>
      {children}
    </button>
  );
}
```

하지만 React를 배우는 사람들은 props를 state에 복사하는 실수를 종종 저지릅니다:

```jsx{3,6}
class Button extends React.Component {
  state = {
    color: this.props.color
  };
  render() {
    const { color } = this.state; // 🔴 `color`는 최신값이 아닙니다!
    return (
      <button className={'Button-' + color}>
        {this.props.children}
      </button>
    );
  }
}
```

React외의 경우에 클래스를 사용해온 사람에게는 이쪽이 더 직관적으로 보일 수도 있습니다. **하지만, prop을 state에 복사하면 이후의 모든 업데이트를 무시하게 됩니다.**

```jsx
// 🔴 위의 구현에서는 더 이상 작동하지 않습니다
<Button color={isOk ? 'blue' : 'red'} />
```

드물게 이러한 동작이 *의도적인* 경우에는, 변경 사항이 무시되리라는 점을 확실히 하기 위해 `initialColor`이나 `defaultColor` 같은 prop 이름을 사용하세요.

하지만 보통은 **컴포넌트에서 바로 props를 읽도록** 하고, props(또는 props에서 계산된 값)를 state에 복사하는 일은 피해야 합니다:

```jsx
function Button({ color, children }) {
  return (
    // ✅ `color`는 언제나 최신값입니다!
    <button className={'Button-' + color}>
      {children}
    </button>
  );
}
```

----

계산된 값 또한 사람들이 props를 state에 복사하게 만드는 이유 중 하나입니다. 예를 들어, 인수로 받은 배경색 `color`에 따라 고비용의 계산을 통해 *버튼의 텍스트* 색을 정하려는 경우를 생각해 봅시다:

```jsx{3,9}
class Button extends React.Component {
  state = {
    textColor: slowlyCalculateTextColor(this.props.color)
  };
  render() {
    return (
      <button className={
        'Button-' + this.props.color +
        ' Button-text-' + this.state.textColor // 🔴 `color` prop이 바뀌면 최신값이 아니게 됩니다
      }>
        {this.props.children}
      </button>
    );
  }
}
```

`color`의 변화에 따라 `this.state.textColor`를 다시 계산해주지 않기 때문에 이 컴포넌트는 제대로 작동하지 않습니다. 가장 쉬운 해결법은 `textColor`의 계산을 `render` 메서드 안으로 옮기고 `PureComponent`로 만드는 것입니다:

```jsx{1,3}
class Button extends React.PureComponent {
  render() {
    const textColor = slowlyCalculateTextColor(this.props.color);
    return (
      <button className={
        'Button-' + this.props.color +
        ' Button-text-' + textColor // ✅ 언제나 최신입니다
      }>
        {this.props.children}
      </button>
    );
  }
}
```

해결했습니다! 이제 props가 바뀌면, `textColor`를 다시 계산하지만, 같은 props에서 고비용의 계산을 다시 하는 일은 피하게 됩니다.

하지만 여기서 더 최적화하고 싶을 수도 있습니다. `children`이 바뀌면 어떻게 될까요? 이 경우에 `textColor`를 다시 계산하는 것은 좋아 보이지 않습니다. 두 번째 시도로 `componentDidUpdate`에서 계산을 해봅시다:

```jsx{5-12}
class Button extends React.Component {
  state = {
    textColor: slowlyCalculateTextColor(this.props.color)
  };
  componentDidUpdate(prevProps) {
    if (prevProps.color !== this.props.color) {
      // 😔 업데이트가 있을 때마다 추가 렌더링
      this.setState({
        textColor: slowlyCalculateTextColor(this.props.color),
      });
    }
  }
  render() {
    return (
      <button className={
        'Button-' + this.props.color +
        ' Button-text-' + this.state.textColor // ✅ 마지막 렌더링에서는 최신
      }>
        {this.props.children}
      </button>
    );
  }
}
```

하지만 컴포넌트에 변경이 있을 때마다 두 번의 렌더링이 필요하다면 개운치 못한 일입니다. 우리가 하려고 했던 최적화의 관점에서도 이상적이지 못합니다.

레거시 생명주기 메서드인 `componentWillReceiveProps`를 사용할 수도 있습니다. 하지만 사람들이 그 안에 부수효과를 넣어두는 경우가 종종 있습니다. 그러면 앞으로 나올 동시(Concurrent) 렌더링에서 문제가 생깁니다. 좀 더 안전한 `getDerivedStateFromProps` 메서드는 거추장스럽고요.

잠시 뒤로 물러나서 봅시다. 사실 우리가 원하는건 [*메모이제이션*](https://en.wikipedia.org/wiki/Memoization)입니다. 입력이 있고, 입력이 변하기 전에는 출력을 다시 계산하고 싶지 않습니다.

클래스를 사용한다면 메모이제이션을 위한 [핼퍼](https://reactjs.org/blog/2018/06/07/you-probably-dont-need-derived-state.html#what-about-memoization)를 사용할 수 있습니다. 하지만 Hooks는 거기서 더 나아가서 고비용의 계산을 메모이즈해주는 기능을 내장하고 있습니다:

```jsx{2-5}
function Button({ color, children }) {
  const textColor = useMemo(
    () => slowlyCalculateTextColor(color),
    [color] // ✅ `color`가 바뀌기 전에는 다시 계산하지 않습니다
  );
  return (
    <button className={'Button-' + color + ' Button-text-' + textColor}>
      {children}
    </button>
  );
}
```

필요한 코드는 이게 전부입니다!

클래스 컴포넌트에서는 [`memoize-one`](https://github.com/alexreardon/memoize-one) 같은 핼퍼를 사용할 수 있습니다. 함수형 컴포넌트에서는 `useMemo` Hook이 비슷한 기능을 제공해줍니다.

이제 **고비용의 계산을 최적화하기 위해서도 props를 state에 복사할 필요가 없습니다.** 렌더링 결과는 props의 변화를 제대로 반영할 것입니다.

---

### 부수효과 내에서 데이터 흐름을 중단하지 마세요

지금까지 우리는 props 변화에 따라 일관된 렌더링 결과를 유지하는 방법에 대해 이야기했습니다. props를 state에 복사하지 않는 것은 그 중 일부입니다. 하지만 **부수효과(예를 들어 데이터 가져오기) 또한 데이터 흐름의 중요한 부분 중 하나입니다**.

이 React 컴포넌트를 살펴봅시다:

```jsx{5-7}
class SearchResults extends React.Component {
  state = {
    data: null
  };
  componentDidMount() {
    this.fetchResults();
  }
  fetchResults() {
    const url = this.getFetchUrl();
    // 데이터 가져오기 실행...
  }
  getFetchUrl() {
    return 'http://myapi/results?query' + this.props.query;
  }
  render() {
    // ...
  }
}
```

많은 React 컴포넌트가 이런 식입니다 — 하지만 자세히 들여다보면 버그가 있습니다. `fetchResults` 메서드는 데이터 가져오기를 위해 `query` prop을 사용합니다:

```jsx{2}
  getFetchUrl() {
    return 'http://myapi/results?query' + this.props.query;
  }
```

하지만 `query` prop이 바뀌면 어떻게 될까요? 이 컴포넌트에서는 아무 일도 일어나지 않습니다. **우리의 컴포넌트에서 부수효과가 props 변경을 제대로 반영하지 않는다는 뜻입니다.** React 앱에서 버그를 일으키는 굉장히 흔한 원인입니다.

컴포넌트를 수정하기 위해 해야 할 일은:

* `componentDidMount`와 그 안에서 호출하는 모든 메서드들을 확인합니다.
  - 우리 예시에서는 `fetchResults`와 `getFetchUrl`입니다.
* 이들 메서드에서 사용하는 모든 props와 state를 기록해둡니다.
  - 우리 예시에서는 `this.props.query`입니다.
* 이 props들이 바뀔 때마다 부수효과를 다시 실행하도록 합니다.
  - `componentDidUpdate`를 통해 구현할 수 있습니다.

```jsx{8-12,18}
class SearchResults extends React.Component {
  state = {
    data: null
  };
  componentDidMount() {
    this.fetchResults();
  }
  componentDidUpdate(prevProps) {
    if (prevProps.query !== this.props.query) { // ✅ 변경시에 다시 가져오기
      this.fetchResults();
    }
  }
  fetchResults() {
    const url = this.getFetchUrl();
    // 데이터 가져오기 실행...
  }
  getFetchUrl() {
    return 'http://myapi/results?query' + this.props.query; // ✅ 변경사항이 제대로 처리됩니다
  }
  render() {
    // ...
  }
}
```

이제 우리의 코드는 부수효과에서도 props의 변경을 제대로 반영합니다.

하지만 이를 유지하는 것은 쉽지 않습니다. 예를 들어, 지역 상태에 `currentPage`를 추가하고 이를 `getFetchUrl`에서 사용하려 합니다:

```jsx{4,21}
class SearchResults extends React.Component {
  state = {
    data: null,
    currentPage: 0,
  };
  componentDidMount() {
    this.fetchResults();
  }
  componentDidUpdate(prevProps) {
    if (prevProps.query !== this.props.query) {
      this.fetchResults();
    }
  }
  fetchResults() {
    const url = this.getFetchUrl();
    // 데이터 가져오기 실행...
  }
  getFetchUrl() {
    return (
      'http://myapi/results?query' + this.props.query +
      '&page=' + this.state.currentPage // 🔴 변경사항이 무시됩니다
    );
  }
  render() {
    // ...
  }
}
```

아이고, 부수효과가 `currentPage`의 변화를 제대로 따르지 않기 때문에 다시 버그가 생기고 말았습니다.

**props와 state는 React의 데이터 흐름에서 한 부분을 차지합니다. 렌더링과 부수효과 양쪽에서 이 데이터 흐름을 반영해야만 합니다!**

To fix our code, we can repeat the steps above:

* `componentDidMount`와 그 안에서 호출하는 모든 메서드들을 확인합니다.
  - 우리 예시에서는 `fetchResults`와 `getFetchUrl`입니다.
* 이들 메서드에서 사용하는 모든 props와 state를 기록해둡니다.
  - 우리 예시에서는 `this.props.query` **와 `this.state.currentPage`**입니다.
* 이 props들이 바뀔 때마다 부수효과를 다시 실행하도록 합니다.
  - `componentDidUpdate`를 수정해서 구현할 수 있습니다.

우리의 컴포넌트가 `currentPage` state의 변경사항을 처리하게끔 수정해 봅시다:

```jsx{11,24}
class SearchResults extends React.Component {
  state = {
    data: null,
    currentPage: 0,
  };
  componentDidMount() {
    this.fetchResults();
  }
  componentDidUpdate(prevProps, prevState) {
    if (
      prevState.currentPage !== this.state.currentPage || // ✅ 변경시에 다시 가져오기
      prevProps.query !== this.props.query
    ) {
      this.fetchResults();
    }
  }
  fetchResults() {
    const url = this.getFetchUrl();
    // 데이터 가져오기 실행...
  }
  getFetchUrl() {
    return (
      'http://myapi/results?query' + this.props.query +
      '&page=' + this.state.currentPage // ✅ 변경사항이 제대로 처리됩니다
    );
  }
  render() {
    // ...
  }
}
```

**이런 실수를 자동으로 잡아낼 수 있다면 좋지 않을까요?** linter가 도움이 되지 않을까요?

---

불행히도, 클래스 컴포넌트의 일관성을 자동적으로 확인하는 것은 매우 어렵습니다. 어떤 메서드도 다른 메서드를 호출할 수 있습니다. `componentDidMount`와 `componentDidUpdate`에서의 함수 호출을 정적으로 분석해보면 잘못된 탐지 결과 투성이입니다.

하지만 일관성을 정적으로 분석할 수 *있는* API 디자인이 *있습니다*. [React `useEffect` Hook](/a-complete-guide-to-useeffect/)이 그러한 API의 예입니다:

```jsx{13-14,19}
function SearchResults({ query }) {
  const [data, setData] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);

  useEffect(() => {
    function fetchResults() {
      const url = getFetchUrl();
      // 데이터 가져오기 실행...
    }

    function getFetchUrl() {
      return (
        'http://myapi/results?query' + query +
        '&page=' + currentPage
      );
    }

    fetchResults();
  }, [currentPage, query]); // ✅ 변경시에 다시 가져오기

  // ...
}
```

우리는 로직을 부수효과의 *안쪽*에 두었고, 이는 *React 데이터 흐름의 어떤 값에* 의존하는지 알기 쉽게 만들어줍니다. 이러한 값을 "종속성"이라고 하며, 예시에서는 `[currentPage, query]`입니다..

이 "부수효과의 종속성" 배열은 새로운 개념이 아닙니다. 클래스에서는 이 "종속성"들을 전체 메서드 호출에서 찾아야 했습니다. `useEffect` API는 같은 개념을 명시적으로 만들었을 뿐입니다.

이제는 이들을 자동적으로 검증할 수 있습니다:

![exhaustive-deps lint 규칙의 데모](./useeffect.gif)

*(`eslint-plugin-react-hooks`에 포함된 `exhaustive-deps` lint 규칙의 데모입니다. 이 플러그인은 조만간 Create React App에 포함될 예정입니다.)*

**컴포넌트를 클래스로 작성하든지 함수로 작성하든지에 관계 없이, 모든 props와 state 변경을 반영하는 것이 중요합니다.**

클래스 API를 사용한다면, 일관성에 대해 스스로 생각하고 모든 props나 state의 변화가 `componentDidUpdate`에서 적절히 처리되는지 검증해야 합니다. 그렇지 않으면 여러분의 컴포넌트는 props와 state의 변화에 대해 탄력적이라고 할 수 없습니다. 이는 React에만 해당하는 문제는 아닙니다. "생성"과 "변경"을 별개로 처리할 수 있는 모든 UI 라이브러리에 적용 가능합니다.

**`useEffect` API는 일관성을 위해 기존의 것을 뒤엎었습니다.** [처음에는 좀 어색하게 느껴지지만](/a-complete-guide-to-useeffect/), 결과적으로 여러분의 컴포넌트는 변화에 더 탄력적이 됩니다. 그리고 "종속성"이 명시적이기 때문에, lint 규칙을 이용해 부수효과의 일관성을 *검증*할 수 있습니다. 버그를 잡기 위해 linter를 사용할 수 있는거죠!

---

### 최적화 내에서 데이터 흐름을 중단하지 마세요

실수로 props의 변경 사항을 무시할 수 있는 경우가 하나 더 있습니다. 컴포넌트를 직접 최적화하려고 할 때 일으킬 수 있는 실수입니다.

`PureComponent`나 `React.memo`처럼 기본적으로 얕은 비교를 이용하는 최적화 방법은 안전합니다.

**하지만, 비교를 직접 작성해서 컴포넌트를 "최적화"하려 하다가 실수로 함수 props를 비교하는 일을 잊어버릴 수 있습니다:**

```jsx{2-5,7}
class Button extends React.Component {
  shouldComponentUpdate(prevProps) {
    // 🔴 this.props.onClick을 비교하지 않음
    return this.props.color !== prevProps.color;
  }
  render() {
    const onClick = this.props.onClick; // 🔴 변경사항을 반영하지 않습니다
    const textColor = slowlyCalculateTextColor(this.props.color);
    return (
      <button
        onClick={onClick}
        className={'Button-' + this.props.color + ' Button-text-' + textColor}>
        {this.props.children}
      </button>
    );
  }
}
```

처음에는 이 실수를 간과하기 쉽습니다. 클래스를 사용하면 보통은 *메서드*를 전달하다보니, 결과적으로 동일한 함수를 전달하기 때문입니다:

```jsx{2-4,9-11}
class MyForm extends React.Component {
  handleClick = () => { // ✅ 언제나 같은 함수입니다
    // 뭔가 하기
  }
  render() {
    return (
      <>
        <h1>Hello!</h1>
        <Button color='green' onClick={this.handleClick}>
          Press me
        </Button>
      </>
    )
  }
}
```

그래서 우리의 최적화는 *당장은* 아무 문제도 없습니다. 하지만, 다른 props가 바뀌지 않는 동안 `onClick`이 바뀌어도 이 컴포넌트는 계속 예전 값을 "보고" 있을겁니다.

```jsx{6,13-15}
class MyForm extends React.Component {
  state = {
    isEnabled: true
  };
  handleClick = () => {
    this.setState({ isEnabled: false });
    // 뭔가 하기
  }
  render() {
    return (
      <>
        <h1>Hello!</h1>
        <Button color='green' onClick={
          // 🔴 Button은 onClick prop의 변화를 무시합니다
          this.state.isEnabled ? this.handleClick : null
        }>
          Press me
        </Button>
      </>
    )
  }
}
```

이 예시에서는, 버튼을 누르면 그 버튼이 비활성화 되어야 합니다 — 하지만 `Button` 컴포넌트는 `onClick` prop의 변화를 무시하기 때문에 제대로 작동하지 않습니다.

이 예시의 `draft.content`처럼, 함수의 동일성이 시간에 따라 바뀔 수 있는 무언가에 의존하고 있다면 상황은 더 혼란스러워집니다:

```jsx{6-7}
  drafts.map(draft =>
    <Button
      color='blue'
      key={draft.id}
      onClick={
        // 🔴 Button은 onClick prop의 변화를 무시합니다
        this.handlePublish.bind(this, draft.content)
      }>
      Publish
    </Button>
  )
```

`draft.content`이 나중에 바뀔 수 있음에도, `Button` 컴포넌트는 `onClick` prop의 변화를 무시하고 처음의 `draft.content`에 바인딩된 `onClick` 메서드의 "첫 번째 버전"을 보고 있습니다.

**그러면 이 문제를 어떻게 피할 수 있나요?**

저는 `shouldComponentUpdate`를 직접 구현하거나 `React.memo()`에 임의의 비교 함수를 지정하는 일은 피하라고 권하겠습니다. `React.memo`의 기본값인 얕은 비교는 함수 변화를 제대로 반영합니다:

```jsx{11}
function Button({ onClick, color, children }) {
  const textColor = slowlyCalculateTextColor(this.props.color);
  return (
    <button
      onClick={onClick}
      className={'Button-' + color + ' Button-text-' + textColor}>
      {children}
    </button>
  );
}
export default React.memo(Button); // ✅ 얕은 비교를 사용합니다
```

클래스에서는 `PureComponent`가 이렇게 동작합니다.

이렇게 하면 props로 다른 함수를 전달하더라도 항상 제대로 작동합니다.

임의의 비교 함수를 고집하겠다면, **함수들을 빼먹지 않도록 하세요:**

```jsx{5}
  shouldComponentUpdate(prevProps) {
    // ✅ this.props.onClick를 비교하세요
    return (
      this.props.color !== prevProps.color ||
      this.props.onClick !== prevProps.onClick
    );
  }
```

앞에서 언급했듯이, 클래스 컴포넌트에서의 메서드 동일성은 거의 안정적이기 때문에 이 문제를 놓치기 쉽습니다(항상 그런 것은 아닙니다 — 그리고 거기서 일어나는 버그는 수정하기가 더 어렵죠). Hooks와 함께라면, 상황은 좀 달라집니다.

1. 함수는 *매 렌더링마다* 다르기 때문에 이런 문제를 [즉시](https://github.com/facebook/react/issues/14972#issuecomment-468280039) 발견할 수 있습니다.
2. `useCallback`과 `useContext`를 이용해, [함수를 전부 깊숙하게 전달하는 일을 피할 수 있습니다](https://reactjs.org/docs/hooks-faq.html#how-to-avoid-passing-callbacks-down). 이를 통해 함수에 대해 걱정하지 않고 렌더링을 최적화할 수 있습니다.

---

이 절을 요악하자면, **데이터 흐름을 중단하지 마세요!**

props와 state를 사용할 때마다, 이들을 변경하면 어떻게 되는지 생각해보세요. 대부분의 경우 컴포넌트는 최초의 렌더링과 업데이트를 다르게 처리해서는 안됩니다. 이를 통해 컴포넌트를 변화에 탄력적으로 만들 수 있습니다.

클래스를 사용하면, 생명주기 메서드 내에서 props와 state를 사용할 때 변경사항에 대해 잊어버리기 쉽습니다. Hooks는 여러분이 올바른 방법을 사용하게끔 도와주지만, 그러지 않고 있었다면 마음가짐을 좀 다르게 할 필요가 있습니다.

---

## 원칙 2: 언제나 렌더링 할 준비가 되어 있어야 합니다

React 컴포넌트는 여러분이 시간의 흐름에 대해 크게 걱정하지 않고도 렌더링 코드를 작성하도록 해줍니다. 여러분이 특정한 시점에 UI가 어때야 *하는지* 기술하면, React는 그렇게 되도록 해줍니다. 이 모델의 이점을 잘 활용하세요!

불필요한 시간적 가정을 컴포넌트의 행동에 도입하려 하지 마세요. **컴포넌트는 언제든지 다시 렌더링할 준비가 되어 있어야 합니다.**

어떤 경우에 이 원칙을 어기게 될까요? React가 그러기 어렵게 해 주기는 하지만, 레거시 생명주기 메서드인 `componentWillReceiveProps`를 사용하면 가능합니다:

```jsx{5-8}
class TextInput extends React.Component {
  state = {
    value: ''
  };
  // 🔴 부모가 렌더링 될 때마다 지역 상태를 초기화합니다
  componentWillReceiveProps(nextProps) {
    this.setState({ value: nextProps.value });
  }
  handleChange = (e) => {
    this.setState({ value: e.target.value });
  };
  render() {
    return (
      <input
        value={this.state.value}
        onChange={this.handleChange}
      />
    );
  }
}
```

이 예제에서 우리는 `value`를 지역 상태에 유지함과 동시에, `value`를 props에서 전달받습니다. "새 props를 전달받을 때마다", state에서 `value`를 초기화하죠.

**우연한 시점에 전적으로 의존한다는 점이 이 패턴의 문제입니다.**

혹시 오늘은 이 컴포넌트의 부모가 거의 업데이트되지 않아서, `TextInput`이 폼을 저장할 때와 같이 중요한 순간에만 "props를 전달받을" 수도 있습니다.

하지만 내일 당신이 부모에 애니메이션을 좀 추가해서 더 자주 다시 렌더링되게 만들 수도 있습니다. 그러면 그 부모 컴포넌트는 자식의 상태를 계속해서 [“날려버리게”](https://codesandbox.io/s/m3w9zn1z8x) 됩니다! [“You Probably Don’t Need Derived State”](https://reactjs.org/blog/2018/06/07/you-probably-dont-need-derived-state.html)에서 이 문제에 대해 더 알아볼 수 있습니다.

**그러면 이 문제를 어떻게 고치나요?**

무엇보다도 먼저, 우리는 마음 속 모델을 고쳐야 합니다. 우리는 "렌더링"을 "props 전달받기"와는 다른 무언가로 생각하는 것을 그만두어야 합니다. 부모에 의해 다시 렌더링되는 것과 자신의 지역 상태 변화에 의해 다시 렌더링되는 것이 서로 다르게 작동해서는 안 됩니다. **컴포넌트는 렌더링이 가끔 일어나든 자주 일어나든간에 탄력적으로 작동해야 하고, 만약 그러지 못하고 있다면 특정한 부모와 너무 강하게 결합된 것입니다.**

*([이 데모는](https://codesandbox.io/s/m3w9zn1z8x) 다시 렌더링하는 일이 어떻게 취약한 컴포넌트를 망가뜨리는지 보여줍니다.)*

여러분이 *정말로* props에서 state를 만들고 싶다면 몇 가지 [다른](https://reactjs.org/blog/2018/06/07/you-probably-dont-need-derived-state.html#preferred-solutions) [방법](https://reactjs.org/docs/hooks-faq.html#how-do-i-implement-getderivedstatefromprops)이 있긴 하지만, 보통은 완전히 제어된(controlled) 컴포넌트를 사용해야 합니다:

```jsx
// Option 1: 완전히 제어된 컴포넌트.
function TextInput({ value, onChange }) {
  return (
    <input
      value={value}
      onChange={onChange}
    />
  );
}
```

아니면 제어되지 않는 컴포넌트를 초기화 가능한 key와 함께 사용할 수 있습니다:

```jsx
// Option 2: 완전히 제어되지 않는 컴포넌트.
function TextInput() {
  const [value, setValue] = useState('');
  return (
    <input
      value={value}
      onChange={e => setValue(e.target.value)}
    />
  );
}

// 컴포넌트의 내부 상태를 key를 바꿈으로서 초기화 할 수 있습니다:
<TextInput key={formId} />
```

단지 컴포넌트 자신이나 부모가 더 자주 렌더링된다고 해서 그 컴포넌트가 망가져서는 안 된다는게 이 절의 핵심입니다. `componentWillReceiveProps` 생명주기 메서드만 피한다면 React API 디자인이 그러지 않도록 도와줄겁니다.

컴포넌트를 강제로 테스트해보려면 부모에게 이 코드를 잠시 추가해보세요:

```jsx{2}
componentDidMount() {
  // 바로 제거하는 것을 잊지 마세요!
  setInterval(() => this.forceUpdate(), 100);
}
```

**이 코드를 남겨두지 마세요** — 부모가 자주 다시 렌더링 되었을 때 무슨 일이 일어나는지 보기 위한 방법일 뿐입니다. 자식 컴포넌트가 망가지면 안 됩니다!

---

이렇게 생각할수도 있습니다: “props가 바뀔 때마다 state를 초기화하더라도, `PureComponent`를 통해 불필요한 렌더링을 막을 수 있을거야”.

아래 코드처럼 하면 되죠. 맞나요?

```jsx{1-2}
// 🤔 불필요한 렌더링을 막아줍니다... 맞나요?
class TextInput extends React.PureComponent {
  state = {
    value: ''
  };
  // 🔴 부모가 렌더링될때마다 지역 상태를 초기화합니다
  componentWillReceiveProps(nextProps) {
    this.setState({ value: nextProps.value });
  }
  handleChange = (e) => {
    this.setState({ value: e.target.value });
  };
  render() {
    return (
      <input
        value={this.state.value}
        onChange={this.handleChange}
      />
    );
  }
}
```

처음에는 부모가 다시 렌더링될때 상태를 "날려버리는" 문제를 해결한 것처럼 보일수도 있습니다. props가 같으면 업데이트를 건너뛰므로, `componentWillReceiveProps`는 호출되지 않습니다.

하지만 이 방법이 우리에게 주는 안정감은 가짜입니다. **이 컴포넌트는 _실제로_ prop의 변화에 탄력적이지 않습니다.** 예를 들어, 애니메이션 `style`과 같은 계속 변화하는 prop을 더 추가하게 되면, 내부 상태를 "잃게" 됩니다:

```jsx{2}
<TextInput
  style={{opacity: someValueFromState}}
  value={
    // 🔴 TextInput의 componentWillReceiveProps가
    // 모든 애니메이션 틱마다 이 값으로 초기화됩니다.
    value
  }
/>
```

그러므로 이 접근방식은 여전히 취약합니다. `PureComponent`, `shouldComponentUpdate`, `React.memo`와 같은 여러 가지 최적화가 *행동*을 제어하기 위해 사용되어서는 안 된다는 점을 알 수 있습니다. *성능*을 개선하기 위해서만 이들을 사용하세요. 최적화를 제거했는데 컴포넌트가 _망가진_다면, 시작부터 부서지기 쉬운 컴포넌트였던 것입니다.

이에 대한 해결책은 앞에서 설명했던 것과 같습니다. "props를 전달받는"일을 특별한 이벤트로 다루지 마세요. props와 state를 "동기화"하지 마세요. 대부분의 경우, 모든 값은 완전히 (props를 통해) 제어되거나, (지역 상태를 통해) 제어되지 않아야 합니다. [가능한](https://reactjs.org/blog/2018/06/07/you-probably-dont-need-derived-state.html#preferred-solutions) 파생 상태를 피하세요. **그리고 언제나 렌더링 할 준비가 되어 있도록 하세요!**

---

## 원칙 3: 싱글톤인 컴포넌트는 없습니다

가끔 우리는 특정한 컴포넌트가 단 한번만 표시된다고 가정합니다. 네비게이션 바 처럼요. 가끔은 정말 그렇습니다. 하지만 이런 가정은 나중에서야 드러나는 디자인 문제를 일으키곤 합니다.

예를 들어, 당신이 라우팅 변화에 따라 두 `Page` 간에 애니메이션을 구현해야 할 수 있습니다. 애니메이션 중에는 두 컴포넌트가 모두 마운트되어 있어야 합니다. 하지만 이들 컴포넌트가 화면 상의 유일한 `Page`일 것이라고 가정했다는 사실을 깨닿게 됩니다.

이런 문제를 찾아내기는 쉽습니다. 그냥 재미삼아 여러분의 앱을 두 번 렌더링해보세요:

```jsx{3,4}
ReactDOM.render(
  <>
    <MyApp />
    <MyApp />
  </>,
  document.getElementById('root')
);
```

이것저것 눌러보세요. (이 실험을 위해 CSS를 좀 손봐야 할수는 있습니다.)

**여러분의 앱이 여전히 의도한대로 작동하나요?** 아니면 이상한 충돌과 오류가 보이나요? 이러한 테스트를 복잡한 컴포넌트에 가끔 해보고, 그 컴포넌트의 여러 복사본이 서로 충돌하지 않는지 확인해보는 것은 좋은 생각입니다.

저 자신도 몇 번 작성했던 문제가 될만한 패턴으로는 `componentWillUnmount`에서 전역 상태를 "정리"하는 것이 있습니다:

```jsx{2-3}
componentWillUnmount() {
  // Redux 스토어 내의 뭔가를 초기화합니다
  this.props.resetForm();
}
```

이런 컴포넌트가 페이지 내에 두 개 있다면, 하나를 언마운트하면 다른 하나가 망가질겁니다. *마운트* 할 때 전역 상태를 초기화하는 방법도 딱히 나은 것은 아닙니다:

```jsx{2-3}
componentDidMount() {
  // Redux 스토어 내의 뭔가를 초기화합니다
  this.props.resetForm();
}
```

이 경우 두 번째 컴포넌트를 *마운트*하면 처음 것이 망가져 버립니다.

이런 패턴은 우리의 컴포넌트가 깨지기 쉬운지 알아보는 좋은 지표입니다. **트리를 *보여주거나* *숨기는* 일이 트리 바깥의 컴포넌트를 망가뜨려서는 안 됩니다.**

이 컴포넌트를 두 번 렌더링 할 생각이 있건 없건 간에, 이러한 문제를 해결하는 일은 장기적으로 도움이 됩니다. 이를 통해 더 탄력적인 디자인에 도달할 수 있습니다.

---

## 원칙 4: 항상 지역 상태를 격리하세요

소셜 미디어의 `Post` 컴포넌트를 생각해봅시다. 컴포넌트 내에는 (펼칠 수 있는) `Comment` 목록과 `NewComponent` 입력창이 있습니다.

React 컴포넌트는 지역 상태를 가질 수 있습니다. 하지만 어떤 상태가 정말로 지역 상태인가요? 포스팅 내용 자체는 지역 상태인가요 아닌가요? 댓글 목록은 어떤가요? 댓글 목록이 펼쳐저 있는지 아닌지는요? 댓글 입력창의 내용은요?

모든 것을 "상태 관리자"에 넣는 것에 익숙하다면, 이 질문에 대답하기 어려울 수 있습니다. 여기에 간단한 방법이 있습니다.

**어떤 상태가 지역 상태인지 확신할 수 없다면, 자기 자신에게 물어보세요: "이 컴포넌트가 두 번 렌더링된다면, 한 쪽에서 일어난 상호작용이 다른 쪽에서도 반영되어야 할까?" 답이 "아니오"라면, 지역 상태를 찾아낸겁니다.**

예를 들어, 같은 `Post`를 두 번 렌더링했다고 생각해봅시다. 그 안에서 서로 달라질 수 있는 것을 찾아봅시다.

* *포스팅 내용.* 한 쪽 트리에서 포스팅을 수정하면 다른 트리에서 업데이트되기를 바랄겁니다. 그러므로 포스팅 내용은 `Post` 컴포넌트의 지역 상태가 되어서는 **안됩니다**. (대신 그 포스팅 내용이 Apollo나 Relay, Redux 같은 캐시 내에 있으면 됩니다.)

* *댓글 목록.* 포스팅 내용의 경우와 비슷합니다. 어느 한 트리에서 새 댓글을 추가하면 다른 트리에도 반영되기를 원할겁니다. 그러니 이상적으로는 댓글 목록을 위한 캐시를 두고, `Post` 내의 지역 상태에는 **없어야** 합니다.

* *어느 댓글이 펼쳐저 있는지.* 한쪽 트리에서 댓글을 펼쳤는데 다른 쪽에서도 펼쳐진다면 좀 이상할겁니다. 이런 경우에 우리는 코멘트 전체가 아닌 특정한 `Comment` *UI 표현*과 상호작용하고 있는 것입니다. 그러므로, "펼쳐짐" 플래그는 `Comment`의 지역 상태에 **있어야** 합니다.

* *댓글 입력창의 내용.* 한 입력창에서 타이핑하고 있는 댓글이 다른 트리에서도 업데이트되면 이상하겠죠. 입력창들이 명백하게 묶여있지 않은 한, 사람들은 이들이 독립적일거라고 생각합니다. 그러니 입력 내용은 `NewComment` 컴포넌트의 지역 상태에 **있어야** 합니다.

이 규칙에 대해 교조적인 해석을 제안하는 것은 아닙니다. 물론 간단한 앱에서는 이들 "캐시"를 비롯해 모든 것을 지역 상태에 놓을 수도 있습니다. 저는 단지 이상적인 사용자 경험의 [첫번째 원칙](/the-elements-of-ui-engineering/)에 대해 이야기하고 있을 뿐입니다.

**정말로 지역 상태라면 전역에 두지 않도록 하세요.** 이는 "탄력성"에 대한 우리의 주제와 맞닿아 있습니다: 그러면 컴포넌트 간의 예기치 못한 동기화가 줄어들게 됩니다. 거기에 더해서 이를 통해 성능 문제의 큰 부분 *또한* 해결할 수 있습니다. 상태가 적당한 위치에 있으면 "과도한 렌더링"이 문제가 되는 일이 더 줄어듭니다.

---

## 요약

지금까지의 원칙들을 다시 요약해 보겠습니다:

1. **[데이터 흐름을 중단해서는 안 됩니다.](#%EC%9B%90%EC%B9%99-1-%EB%8D%B0%EC%9D%B4%ED%84%B0-%ED%9D%90%EB%A6%84%EC%9D%84-%EC%A4%91%EB%8B%A8%ED%95%B4%EC%84%9C%EB%8A%94-%EC%95%88-%EB%90%A9%EB%8B%88%EB%8B%A4)** props와 state는 변할 수 있으며, 컴포넌트는 항상 이들 변화를 반영해야 합니다.
2. **[언제나 렌더링 할 준비가 되어 있어야 합니다.](#%EC%9B%90%EC%B9%99-2-%EC%96%B8%EC%A0%9C%EB%82%98-%EB%A0%8C%EB%8D%94%EB%A7%81-%ED%95%A0-%EC%A4%80%EB%B9%84%EA%B0%80-%EB%90%98%EC%96%B4-%EC%9E%88%EC%96%B4%EC%95%BC-%ED%95%A9%EB%8B%88%EB%8B%A4)** 컴포넌트는 자주 렌더링되건 그러지 않건간에 망가져서는 안 됩니다.
3. **[싱글톤인 컴포넌트는 없습니다.](#%EC%9B%90%EC%B9%99-3-%EC%8B%B1%EA%B8%80%ED%86%A4%EC%9D%B8-%EC%BB%B4%ED%8F%AC%EB%84%8C%ED%8A%B8%EB%8A%94-%EC%97%86%EC%8A%B5%EB%8B%88%EB%8B%A4)** 컴포넌트가 딱 한 번 렌더링되더라도, 두 번 렌더링되었을 때 망가지지 않도록 하면 더 나은 설계가 됩니다.
4. **[항상 지역 상태를 격리하세요.](#%EC%9B%90%EC%B9%99-4-%ED%95%AD%EC%83%81-%EC%A7%80%EC%97%AD-%EC%83%81%ED%83%9C%EB%A5%BC-%EA%B2%A9%EB%A6%AC%ED%95%98%EC%84%B8%EC%9A%94)** 특정 UI 표현에서 어느 상태가 지역 상태인지 생각해보고, 그 상태를 필요 이상으로 끌어올리지 마세요.

**이들 원칙은 여러분이 [변화에 최적화된](/optimized-for-change/) 컴포넌트를 작성하도록 도와줍니다. 이들 컴포넌트는 추가하고, 바꾸고, 없애기 쉽습니다.**

그리고 무엇보다도, 일단 우리의 컴포넌트가 탄력적이 되고 나면, props를 알파벳 순으로 정리할 것인가 말 것인가 하는 심각한 딜레마를 다시 고민할 수 있게 된다는 점이 중요합니다.
