---
title: Bug-O 노테이션
date: '2019-01-25'
spoiler: 여러분의 API 🐞(<i>n</i>)는 얼마인가?
---

성능이 매우 중요한 코드를 작성할 때는 알고리즘 복잡도를 생각하는 것이 좋다. 알고리즘 복잡도는 대개 [Big-O 노테이션](https://rob-bell.net/2009/06/a-beginners-guide-to-big-o-notation/)으로 표현된다.

Big-O는 **데이터가 많아질수록 코드가 얼마나 느려지는가**의 척도가 된다. 예를 들어, 정렬 알고리즘의 복잡도가 O(<i>n<sup>2</sup></i>)이라고 할 때, 50배 많은 개수의 아이템을 정렬하면 대략 50<sup>2</sup> 즉, 2,500배 느려지게 된다. Big-O는 정확한 수치를 나타내지 않는 대신, 알고리즘의 규모를 이해하는 데 도움을 준다.

아래와 같이 Big-O 표현을 보면 얼마나 복잡한 알고리즘인지 알 수 있다.
O(<i>n</i>), O(<i>n</i> log <i>n</i>), O(<i>n<sup>2</sup></i>), O(<i>n!</i>)

하지만, **이 글은 알고리즘이나 성능에 대한 글이 아니다**. API와 디버깅에 관한 얘기다. API 설계 또한 비슷한 것들을 고려해야 하기 때문이다.

---

코드상의 실수를 찾아서 고치기 위해 우리는 매우 많은 시간을 할애하고 있다. 대부분의 개발자는 버그를 빨리 찾고 싶어 한다. 끝내 버그를 찾게 되면 그나마 만족감이 들지만, 온종일 한 개의 버그를 쫓느라 그날 계획한 기능을 구현하지 못한다면 아주 짜증이 날 것이다.

그동안 디버깅했던 기억들은 앞으로 사용할 추상화나 라이브러리, 도구들을 선택하는 데 영향을 끼친다. 어떤 API나 언어의 설계는 처음부터 실수하지 못하게 만든다. 어떤 설계는 끝없는 문제를 만들기도 한다. **과연 어떤 것이 끝없는 문제를 만드는 설계인지, 실수하지 못하게 만드는지 우리가 구분할 수 있을까?**

온라인상에서는 많은 사람이 API는 근본적으로 아름답게 작성되어야 한다는 주제로 토론하고 있다. 하지만 실제로 그런 API를 사용하는 느낌이 어떤지는 [그다지 많이 얘기하지 않는다.](https://overreacted.io/optimized-for-change/)

**나에게 이 문제를 해결할 좋은 법칙이 떠올랐다. *Bug-O* 노테이션이다.**

<font size="40">🐞(<i>n</i>)</font>

Big-O 가 입력의 크기에 대해 알고리즘이 얼마나 느려지는지 나타냈다면, *Bug-O* 는 API에 따라 그걸 사용하는 *여러분* 이 코드를 작성하는 속도를 얼마나 느려지게 하는지 나타낸다.

- - -

예를 들어, 아래의 코드를 이용해서 분명한 구조 없이 `node.appendChild()` 나 `node.removeChild()`를 통해 수동으로 DOM을 업데이트한다고 생각해보자.

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

이 코드의 문제는 코드가 그렇게까지 "못생기지 않았다"라는 것이다. 코드를 사용하는 게 얼마나 아름다운지가 중요한 게 아니다. **문제는 이 코드에 버그가 있다면, 어디서부터 봐야 할지 모르겠다는 것이다.**

**콜백이나 이벤트가 발생한 순서에 의해 이 프로그램이 가질 수 있는 조합(combinatorial)적인 숫자의 경우의 수가 생긴다.** 그중 어떤 경우는 올바른 메시지를 볼 것이고, 나머지의 경우, 여러 개의 로딩 아이콘이나, 실패와 에러 메시지를 보게 거나, 아마도 크래시도 발생할 것이다.

이 함수는 4개의 부분으로 나뉘고, 이들 사이에 순서가 보장되지 않는다. 실행될 수 있는 경우의 수를 대략 계산해보면, 4x3x2x1 = 24일 것이다. 만약 더 많은 부분을 추가한다면 8x7x6x5x4x3x2x1 = *4만* 개의 경우의 수가 된다. 이걸 디버깅하는 개발자의 건투를 빈다.

**Bug-O 접근법은 🐞(<i>n!</i>)로 나타낼 수 있고,** *n* 의 숫자는 DOM을 다루는 코드상의 부분이다. 그렇다. 이건 팩토리얼(Factorial)이다. 물론 매우 과학적이진 않으므로 실무에 적용하기는 적합하지 않다. 하지만 다르게 생각해보면 이런 각각의 코드 부분들은 한 번 이상 실행될 것이다. <span style="word-break: keep-all">🐞(*¯\\\_(ツ)\_/¯*)</span>가 정확할 수도 있지만 그래도 아직은 믿을 수 없다. 조금 더 발전시켜 보자.

---

앞서 본 코드가 가질 수 있는 상태와 실행 결과의 수를 제한하여 이 코드의 Bug-O를 낮출 수 있다. 그러기 위해 어떤 라이브러리도 사용하지 않아도 된다. 그저 이 코드에 어떤 구조를 적용하느냐가 중요하다. 아래 코드는 그런 구조를 적용한 한 가지 방법이다.

```jsx
let currentState = {
  step: 'initial', // 'initial' | 'pending' | 'success' | 'error'
};

function trySubmit() {
  if (currentState.step === 'pending') {
    // 두번 submit 하지 않도록 한다.
    return;
  }
  setState({ step: 'pending' });
  submitForm().then(() => {
    setState({ step: 'success' });
  }).catch(error => {
    setState({ step: 'error', error });
  });
}

function setState(nextState) {
  // 자식 노드들을 초기화한다.
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

위 코드와 그렇게 많이 다른 것 같아 보이진 않는다. 심지어 코드가 더 길어진 것 같기도 하다. 하지만 아래의 코드로 인해 *엄청나게* 디버깅하기 쉬워졌다.

```jsx
function setState(nextState) {
  // 자식 노드들을 초기화한다.
  formStatus.innerHTML = '';

  // ... formStatus를 위한 코드들을 채운다 ...
```

수정이 일어나기 전에 상태를 초기화하면 DOM 조작이 항상 처음부터 순서대로 일어나게 할 수 있다. 이를 통해 실수를 거듭하지 않으면서 피할 수 없는 [엔트로피](https://overreacted.io/the-elements-of-ui-engineering/)를 해결할 수 있다. 이른바 "껐다 켜기" 코딩이라고 볼 수 있지만, 생각보다 잘 동작한다.

**만약 출력에 버그가 있다면 한 단계만 더 거슬러 올라가서 생각해보면 된다. 바로 `setState`를 호출하는 부분이다.** 렌더링 결과를 디버깅하는 Bug-O는 렌더링 패스가 *n* 이라고 할 때 🐞(*n*)이 된다. 이 코드에서는 4가 된다. (`switch`에서 `case`문의 개수다.)

아직까지도 상태를 *설정* 하는 데에 race condition이 있지만, 이런 상태 값을 언제든 로깅하고 검사할 수 있으므로 디버깅이 더 쉬워졌다.

```jsx
function trySubmit() {
  if (currentState.step === 'pending') {
    // 두번 submit 하지 않도록 한다.
    return;
  }
```

물론 여기서는 DOM을 초기화하는 비용이 있다. DOM을 지우고 다시 생성하는 작업이 내부 상태가 파괴될 때마다 일어나게 되어 포커스를 잃게 되고, 더 큰 애플리케이션에서는 심각한 성능 문제를 일으킬 수 있다.

이게 바로 React 같은 라이브러리들이 유용한 이유다. 이런 라이브러리들은 여러분이 항상 UI를 처음부터 새로 만든다는 사고방식을 가지게 해준다.

```jsx
function FormStatus() {
  let [state, setState] = useState({
    step: 'initial'
  });

  function handleSubmit(e) {
    e.preventDefault();
    if (state.step === 'pending') {
      // 두번 submit 하지 않도록 한다.
      return;
    }
    setState({ step: 'pending' });
    submitForm().then(() => {
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

코드가 많이 달라졌지만, 원리는 같다. 이런 컴포넌트는 마치 울타리를 쳐놓은 것처럼 추상화되있어서, 같은 페이지의 그 *어떤* 코드들도 이 컴포넌트의 상태나 DOM을 망치지 않도록 해준다. 컴포넌트화는 Bug-O를 줄이는 데 도움이 된다.

반면에, React 앱의 *어떤* DOM 값이 잘못 노출된다면, React 트리의 컴포넌트들을 하나씩 살펴봐야 할 것이다. Bug-O는 🐞(*트리 높이*)가 된다. 앱의 크기는 관계가 없다.

**다음번에 API를 얘기할 일이 있다면, 일반적으로 디버깅하는 과정의 🐞(n)은 무엇인지 생각해보자.** 여러분이 잘 알고 있는 API와 이론들은 어떤가? Redux, CSS, 상속 모두 각각의 Bug-O가 있을 것이다.

---