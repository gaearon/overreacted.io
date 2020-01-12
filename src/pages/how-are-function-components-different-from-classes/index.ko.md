---
title: 함수형 컴포넌트와 클래스, 어떤 차이가 존재할까?
date: '2019-03-03'
spoiler: 전혀 다른 '포켓몬'이라고 할 수 있다.
---

리액트의 함수형 컴포넌트와 클래스는 어떻게 다를까?

가장 먼저 '클래스는 함수형 컴포넌트에 비해 더 많은 기능(state와 같은...)을 제공한다'는 고전적인 답변이 있다. 그런데 리액트에서 [Hooks](https://reactjs.org/docs/hooks-intro.html)을 쓸 수 있게 된 지금 이는 올바른 답변이라 보기 힘들어졌다.

많은 사람들이 '둘 중 하나가 성능면에서 조금 더 유리하다'는 말을 하곤 한다. 이에 대한 답을 얻기 위해 여러 벤치마킹 실험들이 이루어졌었다. 하지만 대부분의 결과들이 [신뢰할 수 없는 것](https://medium.com/@dan_abramov/this-benchmark-is-indeed-flawed-c3d6b5b6f97f?source=your_stories_page---------------------------)으로 밝혀졌다. 때문에 나는 이 글에서 벤치마킹과 관련된 것들은 언급하지 않을 생각이다. 사실 성능은 함수냐 클래스냐 보다는 무슨 동작을 하는 코드냐에 더 큰 영향을 받는다. 또한 우리 팀에서 살펴본 바로는 성능의 차이가 나는 경우에도 그 차이는 무시할 수 있을 정도의 작았다. 하지만 성능 최적화 전략에서 조금 [다른 점들을](https://reactjs.org/docs/hooks-faq.html#are-hooks-slow-because-of-creating-functions-in-render)을 보여줬다.

어쨌거나 아주 특별한 이유가 없다면 현재 컴포넌트를 다른 형태의 컴포넌트로 다시 쓰는 것은 [추천하지 않는다](https://reactjs.org/docs/hooks-faq.html#should-i-use-hooks-classes-or-a-mix-of-both). (React가 2014년에 그랬던 것처럼) Hooks는 아직 초창기이기 때문에 정석이라 할만한 것들이 존재하지 않는다.

그래서? 함수형 컴포넌트와 클래스 사이에는 근본적인 차이랄 것이 전혀 없는건가? 물론 아니다. **이 글에서 이 둘 사이의 큰 차이가 무엇인지 보여줄 것이다.** 이 차이는 2015년에 함수형 컴포넌트가 처음 [소개됐던 때](https://reactjs.org/blog/2015/09/10/react-v0.14-rc1.html#stateless-function-components)부터 존재했지만 간과돼왔던 것이다.

>**함수형 컴포넌트는 렌더링된 값들을 고정시킨다.**

이게 무엇을 뜻하는지 알아보자.

---

**주의: 이 글은 함수와 컴포넌트 중 어떤 것이 더 좋은지를 따지는 글은 아니다. 단지 리액트 내에서 이 둘 간의 구조적인 차이를 설명할 뿐이다. 함수형 컴포넌트를 사용하는 것이 좋을까에 대한 질문들은 [Hooks FAQ](https://reactjs.org/docs/hooks-faq.html#adoption-strategy)를 참고해주길 바란다.**

---

아래 컴포넌트를 살펴보자:

```jsx
function ProfilePage(props) {
  const showMessage = () => {
    alert('Followed ' + props.user);
  };

  const handleClick = () => {
    setTimeout(showMessage, 3000);
  };

  return (
    <button onClick={handleClick}>Follow</button>
  );
}
```

위 컴포넌트에 있는 버튼은 `setTimeout`을 이용해 네트워크 요청을 보내고 확인 창을 띄워주는 역할을 한다. 예를들어 `props.user`가 `Dan`이라면, 버튼을 누르고 3초 뒤에 `Followed Dan`이라는 창이 띄워진다. 매우 심플하다.

*(주의: 여기서 화살표 함수를 썼다는 것을 눈여겨 볼 필요는 없다. 일반 함수 선언 `function handleClick()`도 정확히 똑같은 방식으로 동작한다.)*

이 컴포넌트를 클래스로는 어떻게 만들까? 간단하게는 다음과 같이 할 수 있다.

```jsx
class ProfilePage extends React.Component {
  showMessage = () => {
    alert('Followed ' + this.props.user);
  };

  handleClick = () => {
    setTimeout(this.showMessage, 3000);
  };

  render() {
    return <button onClick={this.handleClick}>Follow</button>;
  }
}
```

대부분의 사람들은 위 두 컴포넌트가 동일하다고 생각할 것이다. 때문에 두 가지 패턴 간의 리팩토링을 대수롭지 않게 하곤 한다:

![Spot the difference between two versions](./wtf.gif)

**하지만 두 코드는 미묘하게 다르다.** 코드를 자세히 들여다보자. 혹시 어떤 차이가 보이는가? 나는 둘 사이의 차이를 알아차리는 데 시간이 조금 걸렸다.

**이에 대한 답을 직접 알아내고 싶어하는 사람들을 위해 [live demo](https://codesandbox.io/s/pjqnl16lm7)를 준비했다.** 이 뒤에서 부터는 그 차이에 대한 설명과 왜 이것이 문제가 되는지에 대한 이야기들을 나눠보려고 한다.

---

얘기를 계속 이어나가기 전에, 내가 설명하고자 하는 차이는 Hooks와는 아무 관련이 없다는 것을 강조하고 싶다. (예제는 Hooks를 사용하지도 않는다)

이는 단지 리액트에 존재하는 클래스와 함수형 컴포넌트 간의 차이에 대한 이야기일 뿐이다. 만약 함수형 컴포넌트를 자주 사용하고자 하는 독자가 있다면 이 글이 내용이 꽤나 유용할 것이다.

---

**리액트 애플리케이션에서 흔하게 볼 수 있는 버그를 이용해 그 차이를 설명하고자 한다.**

이 **[예제](https://codesandbox.io/s/pjqnl16lm7)**를 열어보자. 예제 컴포넌트는 위에서 본 두 개의 컴포넌트와 프로필 셀렉터를 가지고 있다. 또한 두 개의 컴포넌트는 각자의 버튼을 갖고있다.

이제 두 버튼에 각각에 대해 다음과 같은 순서로 조작해보자.  

1. Follow버튼을 **누르고,**
2. 3초가 지나기 전에 선택된 프로필을 **바꿔라.**
3. 알림창의 글을 **읽어보자.**

결과를 잘 보면 뭔가 이상하단 것을 눈치챘을 것이다.

* Dan의 프로필에서 **함수형 컴포넌트**의 Follow 버튼을 누른 후 Sophie의 프로필로 이동하면 알림창에는 `'Followed Dan'`라고 쓰여져 있다.
* 그런데 **클래스**의 Follow 버튼을 눌러 똑같이 이동했을 경우엔 알림창에 `'Followed Sophie'`라고 쓰여진걸 볼 수 있다.

![Demonstration of the steps](./bug.gif)

---


이 예제에선 함수형 컴포넌트가 보여주는 패턴이 올바른 케이스다. **내가 어떤 사람을 팔로우하고 다른 사람의 프로필로 이동했다 하더라도 컴포넌트가 이를 헷갈려서는 안된다.** 클래스가 보여준 동작은 명백한 버그다.

*(물론 [Sophie](https://mobile.twitter.com/sophiebits)도 팔로우 하는 것을 추천한다.)*

---

왜 우리 클래스가 이런 식으로 동작할까?

클래스의 `showMessage`메서드를 살펴보자:

```jsx{3}
class ProfilePage extends React.Component {
  showMessage = () => {
    alert('Followed ' + this.props.user);
  };
```

이 메서드는 `this.props.user`로부터 값을 불러온다. Props는 리액트에서 불변(immutable) 값이다. **하지만, `this`는 *변경 가능하며(mutable)*, 조작할 수 있다.**

그것이 `this`가 클래스에서 존재하는 목적이다. 리액트가 시간이 지남에 따라 이를 변경하기 때문에 `render`나 라이프사이클 메서드를 호출할 때 업데이트된 값들을 읽어 올 수 있는 것이다. 

따라서 요청이 진행되고 있는 상황에서 클래스 컴포넌트가 다시 렌더링 된다면 `this.props` 또한 바뀐다. `showMessage` 메서드가 "새로운" `props`의 `user`를 읽는 것이다.

위 사실은 UI의 성질에 대한 흥미로운 사실을 일깨워준다. 만약 UI가 현재 애플리케이션 상태를 보여주는 함수라 한다면, **이벤트 핸들러 또한 시각적 컴포넌트와 같이 렌더링 결과의 한 부분인 것이다**. 즉 이벤트 핸들러가 어떤 props와 state를 가진 render에 종속된다는 것이다. 

하지만 `this.props`를 읽는 콜백을 가진 timeout이 사용되면서 그 종속관계가 깨져버렸다. `showMessage` 콜백은 더이상 어떤 render에도 종속되지 않게 됐고, 올바른 props 또한 잃게 됐다. `this`로 부터 값을 읽어오는 동작이 만들어 낸 결과이다. 

---

**이 상황에서 함수형 컴포넌트라는 개념이 없다고 가정해보자.** 이 문제를 어떻게 해결할 수 있을까?

이를 위해서는 `render`와 올바른 props, 그리고 이들을 읽는 `showMessage` 사이의 관계를 다시 바로 잡아 주어야 한다. props가 길을 잃어버리게 되는 곳을 따라가다 보면 바로 잡아 볼 수 있을 것이다.

한 가지 방법은 `this.props`를 조금 더 일찍 부르고 timeout 함수에게는 미리 저장해놓은 값을 전달하는 것이다. 

```jsx{2,7}
class ProfilePage extends React.Component {
  showMessage = (user) => {
    alert('Followed ' + user);
  };

  handleClick = () => {
    const {user} = this.props;
    setTimeout(() => this.showMessage(user), 3000);
  };

  render() {
    return <button onClick={this.handleClick}>Follow</button>;
  }
}
```

이제 잘 [동작한다.](https://codesandbox.io/s/3q737pw8lq). 하지만 이러한 방법은 코드를 복잡하게 만드며 시간이 지날수록 에러에 노출될 가능성이 높아진다. 만약 여러 개의 prop에 접근해야 하거나 state까지 접근해야 하면 코드의 복잡도가 이에 비례하게 증가할 것이다. **무엇보다 `showMessage`가 다른 메서드를 부르고 그 메서드가 `this.props.something`이나 `this.state.something`과 같은 코드를 포함해야 한다면 또 다시 문제에 부딪힌다.** 우리는 `this.props`와 `this.state`를 `showMessage`가 부르는 모든 메서드에게 일일이 전달 해줘야 한다.

이렇게 하는 것은 클래스의 장점을 무색하게 만든다. 또한 이러한 방법을 기억하거나 컨벤션을 만들어 유지하는 것도 어렵다. 결국 버그가 나기 쉬운 구조가 되는 것이다.

`alert` 코드를 `handleClick` 안에 넣는 것 또한 좋은 해결책이 아니다 (이유는 위와 유사). 우리는 코드를 쉽게 쪼갤 수 있으면서 호출했을 때의 props와 state를 유지할 수 있는 구조를 찾아야 한다. **이 문제는 리액트에만 국한된 것이 아니다. `this`와 같이 변경 가능한 object에 데이터를 저장하는 UI 라이브러리들 또한 적용 가능한 문제다.**

혹시 생성자에서 메서드를 *bind*하면 되지 않을까?

```jsx{4-5}
class ProfilePage extends React.Component {
  constructor(props) {
    super(props);
    this.showMessage = this.showMessage.bind(this);
    this.handleClick = this.handleClick.bind(this);
  }

  showMessage() {
    alert('Followed ' + this.props.user);
  }

  handleClick() {
    setTimeout(this.showMessage, 3000);
  }

  render() {
    return <button onClick={this.handleClick}>Follow</button>;
  }
}
```

답은 No다. 이 방법은 아무것도 해결하지 못한다. `this.props`를 너무 늦게 읽는다는 것이 문제지 문법이 문제는 아니다. **이 문제는 자바스크립트의 클로저로 이를 해결할 수 있다.**

클로저는 시간이 지남에 따라 변할 수 있는 값이라고 생각하기는 [쉽지 않기 때문에](https://wsvincent.com/javascript-closure-settimeout-for-loop/) 이 문제의 해결법으로는 간과되곤 한다. 하지만 리액트에서 props와 state는 불변값(immutable)이다. 이 녀석들이 클로저의 악점을 보완해준다. 

말인즉슨 특정 render에서 props와 state를 클로저로 감싸준다면 우리가 원하는 방식으로 동작하게 할 수 있다는 것이다.

```jsx{3,4,9}
class ProfilePage extends React.Component {
  render() {
    // props의 값을 고정!
    const props = this.props;

    // Note: 여긴 *render 안에* 존재하는 곳이다!
    // 클래스의 메서드가 아닌 render의 메서드
    const showMessage = () => {
      alert('Followed ' + props.user);
    };

    const handleClick = () => {
      setTimeout(showMessage, 3000);
    };

    return <button onClick={handleClick}>Follow</button>;
  }
}
```


**props 값을 render될 때의 값으로 고정해둔 것이다**

![Capturing Pokemon](./pokemon.gif)

(`showMessage`를 포함한) 클로저 안에 있는 코드들은 render될 당시의 props를 그대로 사용할 수 있다. 리액트가 우리가 쓸 변수들을 더이상 뺏어가지 못한다! 

**이제 원하는 함수들을 얼마든지 추가할 수 있다. 또한 이 함수들은 모두 동일한 props와 state를 사용할 것이다.** 클로저가 우리를 구원해주었다.

---

[이 방법](https://codesandbox.io/s/oqxy9m7om5)은 잘 동작하지만 조금 꺼림칙하다. 메서드를 클래스에 선언하지 않고 `render` 내부에 선언할건데 굳이 클래스를 이용할 필요가 있나라는 생각이 든다. 

클래스라는 ”껍데기”를 벗기고 함수형 컴포넌트로 다시 선언해보자.

```jsx
function ProfilePage(props) {
  const showMessage = () => {
    alert('Followed ' + props.user);
  };

  const handleClick = () => {
    setTimeout(showMessage, 3000);
  };

  return (
    <button onClick={handleClick}>Follow</button>
  );
}
```

값이 인자로 전달됐기 때문에 아까와 마찬가지로 `props`는 보존된다. **클래스의 `this`와는 다르게, 함수가 받는 인자는 리액트가 변경할 수 없다.**  

함수선언부에서 `props`를 분해(destructure) 해준다면 조금 더 명확하게 표현할 수 있다. 

```jsx{1,3}
function ProfilePage({ user }) {
  const showMessage = () => {
    alert('Followed ' + user);
  };

  const handleClick = () => {
    setTimeout(showMessage, 3000);
  };

  return (
    <button onClick={handleClick}>Follow</button>
  );
}
```

만약 부모 컴포넌트가 다른 props를 이용해 `ProfilePage`를 또다시 render하게 되면 리액트는 `ProfilePage`를 새로 호출한다. 그래도 이전에 클릭했던 버튼의 이벤트 핸들러는 이전 render에 종속돼있기 때문에 이전의 `user`값들을 사용하게된다. 그 값들은 변경되지 않기 때문이다. 

때문에 Sophie 페이지에서 함수형 컴포넌트 follow버튼을 누르고 Sunil 페이지로 이동해도 알람창의 내용은 Sophie를 팔로우 했다고 알려준다. 

![Demo of correct behavior](./fix.gif)

(당신이 [Sunil을 팔로우](https://mobile.twitter.com/threepointone)하고 싶었다 하더라도) 위와 같이 동작하는 것이 정상이다. 

---

이로써 리액트 클래스와 함수형 컴포넌트 사이의 큰 차이를 이해하게 됐다. 

>**함수형 컴포넌트는 render 될 때의 값들을 유지한다.**

**Hooks의 state에서도 같은 원리가 적용된다.** 아래 예제를 살펴보자:

```jsx
function MessageThread() {
  const [message, setMessage] = useState('');

  const showMessage = () => {
    alert('You said: ' + message);
  };

  const handleSendClick = () => {
    setTimeout(showMessage, 3000);
  };

  const handleMessageChange = (e) => {
    setMessage(e.target.value);
  };

  return (
    <>
      <input value={message} onChange={handleMessageChange} />
      <button onClick={handleSendClick}>Send</button>
    </>
  );
}
```

([여기서](https://codesandbox.io/s/93m5mz9w24) 실행해 볼 수 있다.)

위 컴포넌트는 메세지 앱 UI로 쓰기에는 좋은 구조가 아니지만 우리가 이야기하고 있는 개념을 잘 담고있다. 메세지 전송이 이루어졌을 때 컴포넌트는 어떤 메세지가 전송됐는지를 헷갈려서는 안된다. 이 함수의 `메세지`는 클릭핸들러가 호출됐을 때의 state를 고정시켜둔다. 때문에 내가 ”Send”를 눌렀을 당시의 input `메세지`값을 간직할 수 있게된다. 

---

지금까지 리액트에서 함수가 props와 state 값을 유지한다는 것에 대해 알아보았다. **그런데 만약 특정 render에 종속된 것 말고 가장 최근의 state나 props를 읽고 싶다면 어떻게 해야할까?** 나중에 render될 값을 [“미리 가져와서“](https://dev.to/scastiel/react-hooks-get-the-current-state-back-to-the-future-3op2) 쓰고싶다면?

클래스에서는 `this`가 변할 수 있는(mutable) 값이기 때문에 그냥 `this.props`, `this.state`를 읽어오면 된다. 리액트가 알아서 이를 처리해준다. 그런데 함수형 컴포넌트에서도 this처럼 변할 수 있고 서로 다른 render들끼리 공유할 수 있는 녀석이 하나 있다. 이 친구는 “ref”라고 부른다.

```jsx
function MyComponent() {
  const ref = useRef(null);
  // `ref.current`로 읽고 쓸 수 있다.
  // ...
}
```

하지만 ref는 this와는 다르게 직접 관리해줘야한다. 

ref는 클래스의 인스턴스 영역과 [같은 역할](https://reactjs.org/docs/hooks-faq.html#is-there-something-like-instance-variables)을 수행한다. 이는 함수가 가변적인 성질이 필요할 때 비상구 역할을 해준다. “DOM refs”라는 녀석도 들어봤을 것이다. 하지만 리액트의 ref는 조금 더 포괄적인 기능을 제공한다. 무언가를 넣을 수 있는 박스라고 봐도 좋다. 

얼핏 보기에도 this.something은 something.current와 비슷한 기능을 할 것처럼 보인다. 이들은 같은 개념의 값이다.

리액트의 ref가 자동으로 state나 props를 최신값으로 유지하는 것은 아니다. 일반적으로 이러한 기능을 쓰게 되는 경우는 드물기 때문에 이를 기본동작(default)으로 두는 것은 비효율적이다. 만약 ref를 이용해 최신값을 유지하고 싶다면 다음과 같은 방법을 쓸 수 있다.

```jsx{3,6,15}
function MessageThread() {
  const [message, setMessage] = useState('');
  const latestMessage = useRef('');

  const showMessage = () => {
    alert('You said: ' + latestMessage.current);
  };

  const handleSendClick = () => {
    setTimeout(showMessage, 3000);
  };

  const handleMessageChange = (e) => {
    setMessage(e.target.value);
    latestMessage.current = e.target.value;
  };
```

우리가 `showMessage`로부터 `message`를 읽는다면 우리가 send버튼을 눌렀을 때의 `message`를 볼 수 있다. 하지만 `latestMessage.current`를 읽는다면 우리는 가장 최근에 보내진 메시지 값을 읽어 올 수 있다. (Send버튼을 누른 이후 타이핑을 계속 하는 경우에도 말이다) 

[두 가지](https://codesandbox.io/s/93m5mz9w24) [데모](https://codesandbox.io/s/ox200vw8k9)를 비교해 보면서 차이를 살펴보자. “ref”는 렌더링의 일관성을 ”조절”할 수 있게 해주며 유용하게 쓰일 수 있다. 

ref는 고정된 값이 아니기 때문이 *렌더링 도중에* 읽거나 쓰는 것은 피하는 것이 좋다. 렌더링 내에서는 예측 가능한 일들만 일어나는 것이 권장되기 때문이다. **하지만 특정 prop과 state의 최신값을 불러오고 싶을 때마다 ref를 수동으로 처리하는 것은 내키지 않는다.** 다행히 Hooks의 effect를 이용해 이를 자동화할 수 있다:

```jsx{4-8,11}
function MessageThread() {
  const [message, setMessage] = useState('');

  // 최신값을 쫓아간다
  const latestMessage = useRef('');
  useEffect(() => {
    latestMessage.current = message;
  });

  const showMessage = () => {
    alert('You said: ' + latestMessage.current);
  };
```

([데모](https://codesandbox.io/s/yqmnz7xy8x)를 통해 확인해보자.)

effect 함수 *내부*에 DOM이 업데이트될 때마다 ref 값이 변하도록 설정해줬다. 이렇게 하면 인터럽트 가능한 렌더링에 의존적인 [Time Slicing and Suspense](https://reactjs.org/blog/2018/03/01/sneak-peek-beyond-react-16.html)과 같은 기능들이 값 변경에 의해 피해를 받지 않도록 할 수 있다.

ref를 꼭 사용해야 하는 경우는 많지 않다. **될 수 있으면 props나 state를 고정시키는 것이 좋다.** 하지만 interval이나 subscription 같은 [명령형 API](/making-setinterval-declarative-with-react-hooks/)를 다룰 때는 ref가 유용하게 쓰일 수 있다. prop, state, 심지어 함수까지 *어떤*값이던 고정시켜둘 수 있다는 것을 기억하자.

또한 ref를 이용한 패턴은 최적화에도 적합하다(`useCallback`이 자주 바뀐다던지 할 때). 하지만 이럴 때는 [reducer를 쓰는 것](https://reactjs.org/docs/hooks-faq.html#how-to-avoid-passing-callbacks-down)이 조금 [더 나은 해결책](https://github.com/ryardley/hooks-perf-issues/pull/3)일 수도 있다. (추후 다룰 예정)

---

이번 글에서는 클래스 사용하며 놓칠 수 있는 부분과 클로저로 그것을 해결하는 방법도 다뤘다. 하지만 dependency array로 Hooks를 최적화 하려 했을 때 이전에 쓰던 클로저에 의해 버그가 발생될 수 있다는 것도 눈치챘을 것이다. 이게 클로저의 문제일까? 그렇지 않다고 생각한다.

클로저는 눈치채기 쉽지 않은 문제들을 *해결*하는 것에 도움을 준다. 또한 비슷한 방식으로, [동시성 모드](https://reactjs.org/blog/2018/03/01/sneak-peek-beyond-react-16.html)에서 정확한 동작을 하도록 해줄 수도 있다. 이것들이 가능한 이유는 컴포넌트 안의 로직이 render됐을 당시의 props와 state를 고정시키기 때문이다.

내가 보았던 경우들 중에서 **오래된 클로저가 일으키는 문제들은 대부분 “함수는 변하지 않는다“ 혹은 “props는 항상 같다“라는 잘못된 가정에서 비롯됐다.** 이 포스트가 이를 명확하게 이해하는데 도움을 줬으면 좋겠다. 

함수는 props와 state를 감싸고있다. 그렇기 때문에 함수에서는 identity가 중요하다.(원문: *Functions close over their props and state — and so their identity is just as important.*) 이건 함수형 컴포넌트의 특징이지 버그가 아니다. 함수는 `useEffect` 혹은 `useCallback`와 같은 dependency array에 있어서는 떨어질 수 없는 개념이다.

만약 리액트에서 대부분의 코드를 함수로 쓴다면 [코드 최적화](https://github.com/ryardley/hooks-perf-issues/pull/3)나 [시간에 따라 어떤 값이 변할 수 있는가](https://github.com/facebook/react/issues/14920)에 대해서 다시한번 생각해 볼 필요가 있을 것이다.

[Fredrik이 언급](https://mobile.twitter.com/EphemeralCircle/status/1099095063223812096)했던 것처럼:
>Hooks를 써오며 느낀 것 중 하나는 어떤 값이 언제 변할지 모른다라는 생각을 가지고 코딩해야 한다는 것이다.

함수도 이와 마찬가지다. 이 개념이 보편적으로 널리 알려지기 위해서는 시간이 필요할 것이다. 클래스적 사고방식을 조금 바꿔줄 필요가 있다. 이 글이 새로운 시각을 얻는 데 도움이 됐으면 한다.

리액트의 함수는 언제나 그 값을 보존한다. 

![Smiling Pikachu](./pikachu.gif)

클래스와 함수, 이 둘은 전혀 다른 포켓몬이다!
