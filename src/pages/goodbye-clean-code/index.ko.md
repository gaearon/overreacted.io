---
title: '잘가, 클린 코드'
date: '2020-01-11'
spoiler: 클린 코드를 배우되, 얽매이지는 마세요.
---

늦은 밤이었습니다.

팀 동료가 한 주동안 작업한 코드를 올렸습니다 (Check-in). 저희는 그래픽 에디터 툴을 만들고 있는데, 그 중에서도 도형의 가장자리를 드래그하여 크기를 조절할 수 있게 해주는 기능을 만들고 있습니다.

팀원분이 짜신 코드는 잘 동작했습니다.

그런데 중복된 코드가 보였습니다. 각 도형은 드래그 할 수 있는 포인트가 조금씩 다르고, 드래그를 했을 때 사이즈나 비율이 바뀌는 방식도 저마다 다릅니다. 또한 유저가 Shift 버튼을 누르고 있다면 비율은 유지하면서 사이즈를 조절해야 합니다. 이처럼 도형을 다루는 문제는 수학적 계산이 많이 필요한 작업이었습니다.

해당 기능을 구현한 코드는 대략 아래와 같은 모습이었습니다.

```jsx
let Rectangle = {
  resizeTopLeft(position, size, preserveAspect, dx, dy) {
    // 10 repetitive lines of math
  },
  resizeTopRight(position, size, preserveAspect, dx, dy) {
    // 10 repetitive lines of math
  },
  resizeBottomLeft(position, size, preserveAspect, dx, dy) {
    // 10 repetitive lines of math
  },
  resizeBottomRight(position, size, preserveAspect, dx, dy) {
    // 10 repetitive lines of math
  },
};

let Oval = {
  resizeLeft(position, size, preserveAspect, dx, dy) {
    // 10 repetitive lines of math
  },
  resizeRight(position, size, preserveAspect, dx, dy) {
    // 10 repetitive lines of math
  },
  resizeTop(position, size, preserveAspect, dx, dy) {
    // 10 repetitive lines of math
  },
  resizeBottom(position, size, preserveAspect, dx, dy) {
    // 10 repetitive lines of math
  },
};

let Header = {
  resizeLeft(position, size, preserveAspect, dx, dy) {
    // 10 repetitive lines of math
  },
  resizeRight(position, size, preserveAspect, dx, dy) {
    // 10 repetitive lines of math
  },  
}

let TextBlock = {
  resizeTopLeft(position, size, preserveAspect, dx, dy) {
    // 10 repetitive lines of math
  },
  resizeTopRight(position, size, preserveAspect, dx, dy) {
    // 10 repetitive lines of math
  },
  resizeBottomLeft(position, size, preserveAspect, dx, dy) {
    // 10 repetitive lines of math
  },
  resizeBottomRight(position, size, preserveAspect, dx, dy) {
    // 10 repetitive lines of math
  },
};
```

저는 수학적인 계산 로직들이 반복되는 것이 너무 신경쓰였습니다.

이 코드는 *깔끔*하지 않습니다.

대부분의 반복은 동일한 방향의 매서드 사이에서 일어났습니다. 예를 들어, `Oval.resizeLeft()`는 `Header.resizeLeft()` 와 유사한 코드를 갖고 있었습니다. 둘 다 왼쪽으로 드래그를 하는 동작을 다루기 때문이죠.

또다른 중복은 같은 도형 내에서 일어났습니다. 예를 들어, `Oval.resizeLeft()` 메서드는 `Oval`이 갖고 있는 다른 메서드들과 중복이 있었습니다. 모든 메서드가 타원형과 관련된 동작을 다루기 때문입니다. `Rectangle`, `Header`, 그리고 `TextBlock` 사이에도 사각형이라는 공통점 때문에 중복된 코드가 발생했습니다.

저는 아래와 같은 모습으로 메서드를 그룹화하여 *중복된 코드를 없애야* 겠다고 생각했습니다.

```jsx
let Directions = {
  top(...) {
    // 5 unique lines of math
  },
  left(...) {
    // 5 unique lines of math
  },
  bottom(...) {
    // 5 unique lines of math
  },
  right(...) {
    // 5 unique lines of math
  },
};

let Shapes = {
  Oval(...) {
    // 5 unique lines of math
  },
  Rectangle(...) {
    // 5 unique lines of math
  },
}
```

그리고 이 그룹들을 조합하여 사용할 수 있습니다.

```jsx
let {top, bottom, left, right} = Directions;

function createHandle(directions) {
  // 20 lines of code
}

let fourCorners = [
  createHandle([top, left]),
  createHandle([top, right]),
  createHandle([bottom, left]),
  createHandle([bottom, right]),
];
let fourSides = [
  createHandle([top]),
  createHandle([left]),
  createHandle([right]),
  createHandle([bottom]),
];
let twoSides = [
  createHandle([left]),
  createHandle([right]),
];

function createBox(shape, handles) {
  // 20 lines of code
}

let Rectangle = createBox(Shapes.Rectangle, fourCorners);
let Oval = createBox(Shapes.Oval, fourSides);
let Header = createBox(Shapes.Rectangle, twoSides);
let TextBox = createBox(Shapes.Rectangle, fourCorners);
```

코드의 길이는 거의 절반으로 줄었습니다. 또한 중복되는 부분도 사라졌습니다! 매우 *깔끔*합니다. 만약 어떤방향으로 움직이는 동작이나 어떤 도형의 동작을 바꾸고 싶다면 여러 부분을 고칠 필요 없이 해당 도형, 또는 방향의 코드만 변경하면 됩니다. 

후우.. 밤이 깊었네요. 저는 제가 고친 코드를 master 브랜치로 올리고 잠에 들었습니다. 동료의 복잡했던 코드를 깔끔하게 바꾼 제가 너무 자랑스럽네요...

## 다음 날 아침

... 사람들의 반응은 제가 예상했던 것과 달랐습니다.

팀 리더는 저에게 1:1 미팅을 요청했고, 제가 변경한 부분을 되돌려 놓을 것을 정중히 요구했습니다. 저는 매우 당황스러웠습니다. 이전 코드는 매우 지저분했고, 제가 새로 짠 코드가 훨씬 더 *깔끔했습니다*!

당시 저는 못마땅한 마음으로 리더의 의견을 따랐지만, 그들이 옳았다는 것을 깨닫는 데는 몇 년이 걸렸습니다.

## 하나의 단계일 뿐입니다

많은 사람들이 "클린 코드"나 중복 제거에 얽매이는 시기를 겪습니다. 이 시기에는 본인이 짠 코드에 자신이 없을 경우, 측정할 수 있는 무언가를 통해 자신감이나 만족감을 얻고 싶은 욕구를 느끼게 됩니다. 대표적으로 엄격한 lint 규칙, naming 규칙, 폴더 구조, 중복 제거 등이 그렇습니다.

중복 제거를 자동화할 수는 없지만 연습을 통해 능력을 개선시킬 수는 있습니다. 보통 리팩토링 후에 코드의 양이 줄거나 늘었다는 것을 따지기 십상입니다. 결과적으로 중복을 제거한 것은 코드에 대한 객관적인 지표를 개선시킨 것처럼 느끼게 만들어줍니다. 더 심한 경우엔, *"난 코드를 깔끔하게 짜는 훌륭한 개발자야!"* 라는 결론에 이르게 될 수도 있습니다. 이는 자기기만 만큼이나 안 좋은 결과를 가져다 줄 수 있습니다.

우리가 [추상화](https://www.sandimetz.com/blog/2016/1/20/the-wrong-abstraction)라는 것을 갓 배우면, 그 위대하신 능력에 매료되어, 아무것도 아닌 중복되는 코드를 볼 때 마다, 추상화를 모셔오고자 하는 유혹을 받게 됩니다. 그러나 코딩을 몇 년간 해보면, 우리는 어디에서나 중복된 코드를 보게 됩니다. -- 그리고 우리에게는 추상화라는 초능력이 있죠. 만약 누군가가 그러한 추상화는 하나의 미덕일 뿐이라고 이야기하더라도, 우리는 그 말을 귀담아 듣지 않을 것입니다. 그리고 다른 사람들이 "깔끔함"을 숭배하는지, 아닌지로 판단하기 시작할 것입니다.

글 초반에서 나온 "리팩토링"은 두 가지 면에서 재앙이었습니다.

* 첫 번째는, 코드를 작성한 사람과 변경에 대해 논의하지 않았던 것입니다. 저는 코드 작성자들의 의견 없이 변경을 하고 그대로 코드를 올렸습니다. 만약 그것이 정말 *개선*을 이루어냈다 하더라도 (제 코드가 개선을 이루어 냈다고 생각하지는 않습니다^^.), 협업에서 이런식으로 업무를 처리하는 것은 최악이라고 할 수 있습니다. 훌륭한 엔지니어링 팀은 끊임없이 *신뢰를 만들어 나갑니다*. 별다른 상의 없이 동료의 코드를 변경하는 것은 언젠가 후폭풍을 불러 올 것입니다.

* 두 번째는, 완벽한 개선이란 없다는 것입니다. 제 코드는 중복을 줄였지만, 다른 시각에선 좋은 개선이 아니었습니다. 예를 들어, 요구사항이 바뀌어 각각의 도형, 각각의 동작에 대한 예외 케이스가 여럿 생겼다고 가정해보겠습니다. 제가 만든 코드는 더 깊은 추상화를 만들어 내야 하지만, 기존의 "지저분한" 버전의 코드는 매우 쉽게 변경을 반영할 수 있을 것입니다. 

그렇다고 "지저분한" 코드를 작성해야 한다는 뜻은 아닙니다. "깔끔하냐", "지저분하냐"를 따질 때 좀 더 깊은 고민해봐야 한다는 것입니다. 코드에 대해 불편함을 느끼시나요? 더 아름답게 만들고 싶으신가요? 그렇다면 이것들이 멋진 결과를 가져올 수 있다고 자신할 수 있나요?

그렇다면 그 리팩토링이 앞으로 기능을 추가하고 [변경](/optimized-for-change/)하는데 정확히 어떤 변화를 주게 될까요?

저는 위 사항들에 대해 깊이 생각해보지 않았었습니다. 저는 코드가 어때 *보이는지*에 대해서만 생각하고, 다양한 사람들로부터 어떻게 *발전시켜 나갈지*에 대해서는 생각하지 않았던 것입니다.

코딩은 하나의 여정입니다. 처음 Hello World를 작성했을 때부터 지금에 이르기까지 얼마나 긴 여정이었는지를 한번 생각해보세요. 함수나 클래스를 통해 로직을 분리시켜 코드를 심플하게 만드는 것은 처음엔 정말 즐거운 일이었을 것입니다. 자신의 코드가 깔끔하고 멋져보이는 순간, 그 깔끔함에 매료됐을 것입니다. 한동안은 계속 그렇게 하셔도 괜찮습니다.

하지만 거기서 멈추지 마세요. 클린코드충이 되지는 마세요. 클린 코드는 목표가 아닙니다. 단지 프로그램의 복잡성을 줄이고자 하는 시도일 뿐이며, 코드가 어떻게 바뀔지 모르는 상황에서, 피해를 최소한으로 줄이고자 하는 방어 전략 중 하나일 뿐입니다.

클린 코드를 배우되, **얽매이지는 마세요.**
