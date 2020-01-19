---
title: 이건 왜 Hook으로 만들지 않았죠?
date: '2019-01-26'
spoiler: 해야하기 때문이라기 보다는 할 수 있기 때문입니다.
cta: 'react'
---

[React Hooks](https://reactjs.org/hooks)의 첫 번째 알파버전이 릴리즈 된 이후, 가장 많이 들었던 질문 중 하나는 다음과 같습니다: “*\<some other API\>* 는 왜 Hook으로 만들어지지 않았나요?”

시작하기 전에, "Hooks인 것들"을 간략하게 짚고 넘어가겠습니다:

* [`useState()`](https://reactjs.org/docs/hooks-reference.html#usestate) 는 state를 선언할 수 있도록 해줍니다.
* [`useEffect()`](https://reactjs.org/docs/hooks-reference.html#useeffect) 는 side effect를 다룰 수 있도록 해줍니다.
* [`useContext()`](https://reactjs.org/docs/hooks-reference.html#usecontext) 는 context를 관리할 수 있도록 해줍니다.

하지만 `React.memo()`나 `<Context.Provider>`같은 API들은 여전히 Hook으로는 제공되지 않고 있습니다. 이러한 API들을 Hook으로 제공하기 위한 여러 형태의 proposal이 올라왔었는데 대부분 *합성* 할 수 없거나, *anti-modular* 패턴이었습니다. 이 글에서는 이와 관련된 이야기를 하려고 합니다.

**주의: 이 글은 API discussions에 관심있는 분들을 위한 글입니다. 단순히 React의 생산성만을 고민하시는 분들은 글을 읽지 않으셔도 좋습니다!**

---

React API들이 공동적으로 지켜야(지켰으면) 하는 두 가지 특징이 있습니다.

1. **합성:** 대부분의 사람들이 [커스텀 Hooks](https://reactjs.org/docs/hooks-custom.html)를 Hooks API의 꽃이라고 생각합니다. 저희는 사람들이 커스텀 Hooks를 자주 쓸 것이라고 예상했고, 협업 환경에서 이러한 커스텀 Hooks가 [충돌을 일으키지 않도록](/why-do-hooks-rely-on-call-order/#flaw-4-the-diamond-problem) 해주어야 했습니다. (Aren’t we all spoiled by how components compose cleanly and don’t break each other?)

2. **디버깅:** 우린 프로젝트가 커지더라도 [버그를 쉽게 찾는 것](/the-bug-o-notation/)을 원합니다. React의 가장 큰 장점 중 하나는, 렌더링에 오류가 있을 때, component tree를 타고 가다보면 어떤 컴포넌트가 잘못됐는지 찾아낼 수 있다는 점입니다.

두 가지 모두 만족하는지를 따져본다면, 어떤 것이 Hook이 될 수 있고 어떤 것이 될 수 없는지를 알아낼 수 있습니다. 예제를 통해 살펴보겠습니다.

---

## Hook인 것: `useState()`

### 합성

`useState()`를 호출하는 여러 개의 커스텀 Hooks는 충돌하지 않습니다:

```jsx
function useMyCustomHook1() {
  const [value, setValue] = useState(0);
  // What happens here, stays here.
}

function useMyCustomHook2() {
  const [value, setValue] = useState(0);
  // What happens here, stays here.
}

function MyComponent() {
  useMyCustomHook1();
  useMyCustomHook2();
  // ...
}
```

`useState()`를 통해 새로운 state를 선언하는 것은 언제나 안전합니다. 왜냐하면 새로운 state를 선언할 때, 같은 컴포넌트 내에서 어떤 Hooks가 쓰였는지를 따져볼 필요가 전혀 없기 때문입니다. 또한 여러 개의 state 중 하나가 바뀐다고 하더라도 다른 state들은 영향을 받을 일이 전혀 없습니다.

**판결:** ✅ `useState()`는 커스텀 Hooks에게 영향을 끼치지 않습니다.

### Debugging

Hooks 끼리 값을 전달할 수 있기 때문에 유용합니다.

```jsx{4,12,14}
function useWindowWidth() {
  const [width, setWidth] = useState(window.innerWidth);
  // ...
  return width;
}

function useTheme(isMobile) {
  // ...
}

function Comment() {
  const width = useWindowWidth();
  const isMobile = width < MOBILE_VIEWPORT;
  const theme = useTheme(isMobile);
  return (
    <section className={theme.comment}>
      {/* ... */}
    </section>
  );
}
```

그런데 만약 실수가 있어 버그가 생겼다면, 어떻게 디버깅해야 할까요?

`theme.comment`로부터 받은 CSS 클래스가 잘못됐다고 가정해보겠습니다. 어떻게 알아낼 수 있을까요? 우선 breakpoint를 걸거나, component의 본문에서 로그를 남겨볼 수 있을 것입니다.

만약 `theme` 값에 이상이 있고 `width`나 `isMobile` 값에는 문제가 없다면 `useTheme()` 내부에서 무엇인가 잘못됐을 것이라고 추론할 수 있습니다. 만약 `width` 값에 이상이 있다면 `useWindowWidth()`를 들여다 보면 원인을 알아낼 수 있겠죠.

**내부의 값이 어떤 상태인지 보는 것만으로 어떤 Hooks가 잘못됐는지를 알아낼 수 있습니다.** 모든 것의 내부를 들여달 필요가 전혀 없는 것이죠.

잘못된 커스텀 Hook을 찾고, 해당 Hook을 들여다 본다. 이 과정만 반복하면 됩니다.

이러한 특징은 커스텀 Hook의 깊이가 깊어질수록 더 중요해집니다. 세 개의 커스텀 Hooks가 중첩됐다고 가정해봅시다. 세 부분만 들여다 보는 것과 **(3 + 3×3 + 3×3×3 = )39 가지 경우**를 따져보는 것의 [차이](/the-bug-o-notation/)는 어마어마할 것입니다. 다행히 `useState()`는 다른 Hook이나 component에게 "영향"을 끼칠 수 없습니다. 잘못된 변수가 자취를 남기듯이, 잘못된 값을 반환한 Hook은 그 흔적을 남길 것입니다. 🐛

**판결:** ✅ `useState()`는 코드의 인과관계를 파악하는 데 영향을 끼치지 않습니다.

---

## Hook이 아닌 것: `useBailout()`

최적화를 할 때, Hook을 사용하는 컴포넌트는 여러가지 방법으로 불필요한 re-rendering을 피할 수 있습니다.

대표적인 방법으로 컴포넌트 전체를 감싸는 [`React.memo()`](https://reactjs.org/blog/2018/10/23/react-v-16-6.html#reactmemo)가 있습니다. 이 메서드는 마지막 렌더링의 props와 현재 props를 비교하여 그 결과가 같다면 re-rendering을 하지 않는식으로 동작합니다. (shallow 비교를 합니다). class 컴포넌트에서 `PureComponent`를 이용하는 것과 유사합니다.

`React.memo()`는 컴포넌트를 인자로 받고 컴포넌트를 반환합니다:

```jsx{4}
function Button(props) {
  // ...
}
export default React.memo(Button);
```

**그렇다면 왜 이것은 Hook으로 만들지 않았을까요?**

만약 이런 Hook이 있었다면, `useShouldComponentUpdate()`, `usePure()`, `useSkipRender()`, 혹은 `useBailout()` 같은 이름을 갖고 있었을 것입니다.

아래와 같은 식으로 동작하겠죠.

```jsx
function Button({ color }) {
  // ⚠️ 실제로 쓰이는 API가 아닙니다
  useBailout(prevColor => prevColor !== color, color);

  return (
    <button className={'button-' + color}>  
      OK
    </button>
  )
}
```

이외에도 여러가지 형태가 있습니다 (e.g. `usePure()` 생성자). 하지만 이들 모두에게 공통적인 문제가 있습니다.

### 합성

`useBailout()`을 두 개의 커스텀 Hook에서 사용했다고 가정해봅시다:

```jsx{4,5,19,20}
function useFriendStatus(friendID) {
  const [isOnline, setIsOnline] = useState(null);

  // ⚠️ 실제로 쓰이는 API가 아닙니다
  useBailout(prevIsOnline => prevIsOnline !== isOnline, isOnline);

  useEffect(() => {
    const handleStatusChange = status => setIsOnline(status.isOnline);
    ChatAPI.subscribe(friendID, handleStatusChange);
    return () => ChatAPI.unsubscribe(friendID, handleStatusChange);
  });

  return isOnline;
}

function useWindowWidth() {
  const [width, setWidth] = useState(window.innerWidth);
  
  // ⚠️ 실제로 쓰이는 API가 아닙니다
  useBailout(prevWidth => prevWidth !== width, width);

  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  });

  return width;
}
```

만약 위 두 Hooks를 같은 컴포넌트에서 사용하면 어떻게 될까요?


```jsx{2,3}
function ChatThread({ friendID, isTyping }) {
  const width = useWindowWidth();
  const isOnline = useFriendStatus(friendID);
  return (
    <ChatLayout width={width}>
      <FriendStatus isOnline={isOnline} />
      {isTyping && 'Typing...'}
    </ChatLayout>
  );
}
```

이 컴포넌트는 언제 re-rendereing이 되어야 할까요?

만약 모든 `useBailout()`이 컴포넌트 update를 차단할 수 있다면, `useWindowWidth()`가 유발하는 update는 `useFriendStatus()`에 의해 차단될 것입니다. 그 반대도 마찬가지입니다. **두 개의 Hooks이 서로에게 영향을 끼치게 된거죠.**

`useBailout()`의 조건이 모두 일치하지 않을 때만 렌더링을 차단한다 하더라도 문제는 있습니다. `ChatThread`는 `isTyping` prop이 바꼈을 때 업데이트가 되지 않을 것이기 때문이죠.

더 심각한 문제는, 이 상황에서 `ChatThread`에 **새로운 Hook을 추가하려면 그 Hook에도 `useBailout()`을 넣어줘야 한다는 점입니다.** `useBailout()` 없이는 `useWindowWidth()`와 `useFriendStatus()`을 무시하고 rendering을 할 수 없기 때문입니다.

**판결:** 🔴 `useBailout()`은 합성을 할 수 없게 만듭니다. Hook들 간의 state 업데이트를 곤란하게 만듭니다. 우리는 API가 [변경에 최적화되길](/optimized-for-change/) 원하는데 위와 같은 동작은 이와 완전히 반대라고 할 수 있습니다.

### 디버깅

`useBailout()`같은 Hook이 디버깅에는 어떤 영향을 끼칠까요?

같은 예제를 사용하겠습니다: 

```jsx
function ChatThread({ friendID, isTyping }) {
  const width = useWindowWidth();
  const isOnline = useFriendStatus(friendID);
  return (
    <ChatLayout width={width}>
      <FriendStatus isOnline={isOnline} />
      {isTyping && 'Typing...'}
    </ChatLayout>
  );
}
```

`Typing...` 문구가 제대로 렌더링되지 않은 상황을 가정해봅시다. 문제를 일으키는 컴포넌트와 현재 컴포넌트가 많이 떨어져 있다고 했을 때, 어떻게 디버깅할 수 있을까요? 

**일반적으로, React에서는 그냥 상위 컴포넌트를 따라 올라가기만 하면 됩니다.** 만약 `ChatThread`가 새로운 `isTyping` 값을 전달받지 못했다면, `<ChatThread isTyping={myVar} />` 을 호출하는 컴포넌트를 찾아 `myVar`을 확인해보는 식으로 거슬러 올라가면 됩니다. 보통은 어떤 컴포넌트에서 `shouldComponentUpdate()`를 잘못 사용하고 있거나 잘못된 `isTyping` 값이 전달돼고 있는 것을 찾아낼 수 있습니다. component 체인에 있는 component를 한번씩 확인하는 것만으로 문제가 발생한 부분을 찾을 수 있는 것이죠.

하지만 `useBailout`이란 Hook이 실제로 있어서, 이 Hook을 사용하고 있었다면,`ChatThread`가 사용하는 *모든 커스텀 Hooks*를 일일이 살펴보지 않는한 어떤 부분이 컴포넌트 업데이트를 막고 있는지 알 수 없을 것입니다. 또한 상위 컴포넌트들 또한 커스텀 Hooks를 사용할 수 있기 때문에 디버깅 공수는 [상상할 수 없을 정도로 커질 것입니다.](/the-bug-o-notation/)

이건 마치 서랍장에서 드라이버를 찾는데, 서랍장을 열었더니 그 안에 또 서랍장이 있고, 그걸 열었더니 이번에는 더 작은 서랍장이 있는 상황과 유사합니다. 서랍장이 얼마나 깊은지조차 알 수 없는 상황이죠.

**판결:** 🔴 `useBailout()`은 합성을 깨뜨릴 뿐만 아니라, 디버깅을 어렵게 만듭니다. 심할 때는 디버깅 시간을 지수적으로(exponentially) 증가시킬 수도 있습니다.

---

이 글에선 Hook으로 사용되고 있는 `useState()`와 의도적으로 Hook으로 만들지 않은 `useBailout()`에 대해서 살펴보았습니다. 또한 합성과 디버깅 관점에서 왜 하나는 가능하고, 다른 하나는 불가능한지도 알아보았습니다.

Hook 버전의 `memo()`나 `shouldComponentUpdate()`는 없지만, [`useMemo()`](https://reactjs.org/docs/hooks-reference.html#usememo)라는 Hook을 제공하긴 합니다. 이는 비슷한 용도로 쓰이지만 앞에서 설명한 함정들은 피할 수 있도록 만들어졌습니다.

`useBailout()`은 Hook으로 만들기에 적합하지 않은 것들 중 하나일 뿐입니다. `useProvider()`, `useCatch()`, 혹은 `useSuspense()`도 Hook이 되지 못했습니다.

이제 그 이유를 아시겠나요?

*(저 멀리서 희미한 목소리 들려온다: 합성... 디버깅...)*