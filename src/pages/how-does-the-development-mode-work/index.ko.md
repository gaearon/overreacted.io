---
title: 개발(Development) 모드는 어떻게 작동할까?
date: '2019-08-04'
spoiler: 컨벤션에 의한 죽은 코드 제거하기(Dead code elimination).
---

자바스크립트 코드 베이스가 다소 복잡하더라도, **배포(production) 모드와 개발(development) 모드의 코드를 다르게 번들링하고 실행할 수 있다.**

배포 모드와 개발 모드의 코드를 다르게 번들링하고 실행시키는 것은 매우 강력한 기능이다. React의 개발 모드는 버그로 이어질만한 많은 부분을 미리 경고해주는 검증 코드가 포함되어 있다. 하지만, 이런 코드는 번들 크기를 증가시키고 앱 속도를 느리게 할 수 있다.

개발모드에서의 느린 앱 속도는 문제가 되지 않는다. 개발모드에서 느리게 수행되는 코드는 개발자의 빠른 장비와 일반 기기 사이의 성능 차이를 줄일 수 있어 도움이 될 수도 있다.

하지만 배포 모드에선 유익한 것이 없으니 이런 검증들은 생략해야 한다. 떻게 할 수 있을까? 한 번 확인해보자.

---

개발모드에서만 다른 코드를 실행하는 방법은 자바스크립트 빌드 파이프라인(존재 여부)에 따라 다르다. Facebook의 예를 보자.

```jsx
if (__DEV__) {
  doSomethingDev();
} else {
  doSomethingProd();
}
```

위 예제 코드의  `__DEV__`는 실제 변수가 아니다. 이 값은 모듈들이 번들링(또는 빌드)될 때 대체되는 상수다. 결과를 보자.

```jsx
// 개발 모드일때
if (true) {
  doSomethingDev(); // 👈
} else {
  doSomethingProd();
}

// 배포 모드일 때
if (false) {
  doSomethingDev();
} else {
  doSomethingProd(); // 👈
}
```

배포 모드에서는 코드 경량화(minify)도 해야한다.(예: [teaser](https://github.com/terser/terser)) 대부분의 자바스크립트 경량화 도구(minifier)는 `if (false)`같은 코드를 제거하는 [죽은 코드 제거(Dead Code Elimination)](https://en.wikipedia.org/wiki/Dead_code_elimination)를 한다. 실제 배포 코드에서는 죽은 코드가 제거된 아래와 같은 모습을 볼 수 있다.

```jsx
// 배포 모드일 때 (경량화 이후):
doSomethingProd();
```

**(주요 자바스크립트 도구의 죽은 코드 제거 성능은 아직은 한계가 있지만, 이 내용은 여기서 다루지 않겠다)**

`__DEV__`  상수를 사용하지 않아도 webpack같이 대중적인 번들러를 사용하면, 번들러에서 제공하는 다른 컨벤션이 있을 것이다. 예를 들어보자. 아래 코드는 일반적으로 사용되는 패턴이다.

```jsx
if (process.env.NODE_ENV !== 'production') {
  doSomethingDev();
} else {
  doSomethingProd();
}
```

**이 패턴은 [React](https://reactjs.org/docs/optimizing-performance.html#use-the-production-build)나 [Vue](https://vuejs.org/v2/guide/deployment.html#Turn-on-Production-Mode) 같은 라이브러리들에서 번들러를 사용하여 npm을 통해 import 할 때 사용된다.** (단일 파일 `<script>` 태그 빌드 파일은 `.js`와 `.min.js` 파일을 분리하여 개발 모드와 배포 모드로 제공된다.)

이런 컨벤션은 Node.js에서 왔다. Node.js는 [`process.env`](https://nodejs.org/dist/latest-v8.x/docs/api/process.html#process_process_env) 객체의 속성으로 시스템의 환경 변수를 나타내는 `process` 변수가 존재한다. 그러나 프론트엔드 코드베이스에서 이 패턴을 본다면, 실제 `process`변수는 존재하지 않는다. 🤯

대신, 모든 `process.env.NODE_ENV` 표현식은 `__DEV__` 상수 처럼 빌드 타임에 문자열로 대체된다.

```jsx
// 개발 모드일 떄
if ('development' !== 'production') { // true
  doSomethingDev(); // 👈
} else {
  doSomethingProd();
}

// 배포 모드일 때
if ('production' !== 'production') { // false
  doSomethingDev();
} else {
  doSomethingProd(); // 👈
}
```

이런 모든 표현식은 일정하기 때문에 (`'production' !== 'production'`은 `false`가 보장된다.), 경량화 도구는 이런 분기 또한 제거할 수 있다.

```jsx
// 배포 모드 (경량화 이후)
doSomethingProd();
```

마법의 장난 끝!(Mischief managed).

---

하지만, 이 방식은 아래처럼 더 복잡한 표현식을 사용하는 경우 문제가 있다.

```jsx
let mode = 'production';
if (mode !== 'production') {
  // 🔴 제거된다는 보장은 없다.
}
```

자바스크립트 정적 분석 도구는 언어의 동적 타입 때문에 그다지 똑똑하게 동작하지 않는다. `false`나 `'production' !== 'production'`같은 정적인 표현식 대신  `mode`같은 변수가 포함되어 있다면 최적화를 포기하기 일쑤다.

마찬가지로, 자바스크립트에서 죽은 코드 제거는 최상위에서 `import`를 할 때 모듈 사이에서 잘 작동하지 않는 경우가 많다.

```jsx
// 🔴 제거된다는 보장은 없다.
import {someFunc} from 'some-module';

if (false) {
  someFunc();
}
```

따라서, 코드를 *명확하게 정적*으로 만드는 방법으로 작성해야하며, 제거하고자 하는 모든 코드가 제거 되었는지 확인해야 한다.

---

이 모든 것이 작동하려면, 번들러는 `process.env.NODE_ENV`를 대체해야 하며 프로젝트를 어떤 모드로 *빌드하고 싶은지* 또한 알아야 한다.

몇 년 전에는 환경을 구성하지 않는 것이 일반적이었다. 개발 모드의 프로젝트가 배포되는 것을 종종 볼 수 있었을 것이다.

그것은 웹 사이트를 느리게 로드하고 실행하기 때문에 매우 안 좋은 방식이다.

최근 2년 사이에 상황은 크게 좋아졌다. 예를 들어, 웹팩은 `process.env.NODE_ENV`를 수동으로 구성해 대체하는 대신 `mode` 옵션을 추가했다. React DevTools 또한 사이트에 빨간 아이콘을 나타내 쉽게 개발 모드 상태인 것을 발견하고 [report](https://mobile.twitter.com/BestBuySupport/status/1027195363713736704) 하도록 했다. 

![image1.png](https://overreacted.io/static/ca1c0db064f73cc5c8e21ad605eaba26/d9514/devmode.png)

Create React App나 Next/Nuxt, Vue CLI, Gatsby 같은 프로젝트들 또한 두 개의 커맨드(예를 들어, `npm start`와 `npm run build`같이)를 제공해 개발 모드와 배포 모드의 빌드를 다르게 가져가 더 쉽게 적용할 수 있도록 했다. 일반적으로, 배포 모드의 빌드 결과만 배포될 수 있기 때문에 더는 실수를 저지르기 힘들게 되었다.

배포 모드가 기본 모드가 되어야 하고 개발 모드는 옵트인이 되어야 한다는 주장은 항상 존재한다. 개인적으로, 나는 이 주장이 설득력 있다고 생각하지 않는다. 개발 모드에서 제공하는 경고의 혜택을 가장 많이 보는 사람은 라이브러리를 처음 사용하는 사람일 것이다. 그들은 개발 모드의 활성화 방법을 모를 것이고, 많은 버그를 조기에 발견할 기회를 놓치게 될 것이다.

물론 성능이 좋지 않을 수 있다. 하지만 유저들에게 버그가 가득한 사용성을 제공하는 것이 더 심각한 문제이다. 예를 들어, [React key 경고](https://reactjs.org/docs/lists-and-keys.html#keys)는 잘못된 상품을 구매하거나 잘못된 사람에게 메세지를 보내는 것 같은 버그를 예방해 준다. 이 경고가 꺼진 상태에서의 개발은 사용자, 그리고 당신에게 큰 위험이다. 만약 이 경고들이 기본 설정으로 꺼져 있다면, 토글을 찾아 켰을 때쯤 해결해야 할 경고들이 너무 많이 쌓여 있을 것이다. 이런 점 때문에, 대부분의 사람들은 다시 경고를 끌 것이다. 이런 부분 들이, 초기에 활성화 되어 있어야 하는 이유이다.

마지막으로, 개발 경고가 옵트인이고, 개발자들은 초기에 경고를 활성해야 한다는 것을 안다 하더라도, 원래의 문제로 돌아갈 것이다. 누군가는 실수로 배포 빌드에 설정을 그대로 남겨 둘 것이다.

이야기는 원점으로 돌아왔다.

개인적으로, **난 사용자가 디버깅을 하는지, 배포하는지에 따라 알맞은 모드를 나타내고 사용하는 도구를 신뢰한다**. 웹 브라우저를 제외한 대부분의 환경들(모바일이나 데스크톱, 서버)는 개발 및 배포 빌드를 다르게 로드하고 차별화 하는 방식을 이미 수 십년 동안 갖고 있었다. 

라이브러리가 자바스크립트 개발 환경 구분을 ad-hoc 컨벤션에 의존하는 대신, 일급(first-class, 언어의 구성요소가 되는 개념 )으로 볼 시기가 되었다.

---

철학은 이제 충분하다!

코드를 보자.

```jsx
if (process.env.NODE_ENV !== 'production') {
  doSomethingDev();
} else {
  doSomethingProd();
}
```

프론트엔드 코드에 `process`라는 실제 객체가 없는데, 왜 React나 Vue같은 라이브러리는 npm 빌드에 의존하는지 궁금할 것이다.

*(명확하게 하자. React나 Vue에서 제공하는 브라우저에 로드 할 수 있는 `<script>` 태그는 이 내용에 해당하지 않는다. 이 경우에는 개발 모드에선 `.js` , 배포시에 `.min.js` 파일을 수동으로 선택하도록 해야 한다. 아래 내용은 번들러와 함께 사용되는 React나 Vue가 npm을 통해 `import`하는 내용을 이야기한다.)*

프로그래밍의 많은 것들과 마찬가지로, 특유의 컨벤션은 역사적인 이유를 가진다. 많은 도구에서 채택되었기 떄문에 여전히 우린 사용하고 있다. 다른 것으로 바꾸는 것은 비용이 많이 들지만 이득 또한 크지 않다

그럼, 과거에 어떤 이야기가 있었는지 살펴보자.

`import`와 `export` 구문이 표준화되기 몇년 전, 모듈 간 관계를 나타내는 여러 방법의 경쟁이 있었다. Node.js는 [CommonJS](https://en.wikipedia.org/wiki/CommonJS)로 알려진 `require()`와 `module.exports`를 대중화시켰다.

초기 npm에 배포된 코드들은 Node.js용으로 작성 되었다. [Express](https://expressjs.com/)는(아마 지금도?) 당시 가장 널리 사용되는 Node.js 서버 사이드 프레임워크 였으며, 배포 모드를 활성화하기 위해 [`NODE_ENV` 환경 변수](https://expressjs.com/en/advanced/best-practice-performance.html#set-node_env-to-production)를 사용했다. 다른 npm 패키지들 또한 같은 컨벤션을 채택했다.

browserify 같은 초기 자바스크립트 번들러는 프론트엔드 프로젝트에서 npm 코드를 사용할 수 있기를 원했었다. (그렇다! 당시에는 프론트엔드에 npm을 거의 사용하지 않았다. 상상이 가는가?) 그래서, Node.js 생태계에 이미 존재하는 컨벤션을 그대로 프론트엔드 코드로 확장했다.

"envify" 변환은 2013년에 출시되었다. React는 그 당시 오픈소스였으며, npm과 browserify를 활용하는 것이 그 당시 프론트엔드 코드에서 CommonJS 코드를 번들링 하기 최선이라 보였었다.

React는 매우 초기부터 npm 빌드를 제공해왔다.(`<script>` 태그 빌드와 함께) React가 유명해짐에 따라, CommonJS 모듈로 자바스크립트 모듈을 작성하는 법과 npm을 통한 프론트엔드 코드 모듈 제공 또한 연습했었다.

React는 배포 모드에서 개발에만 사용하는 코드를 제거할 필요가 있었다. Browserify는 이미 해결책을 제공하고 있었고, React는 npm build를 위해 `process.env.NODE_ENV`를 사용하는 컨벤션을 채택했다.

2019년, browserify는 인지도를 많이 잃은 상태이다. 그러나 빌드 단계에서 `process.env.NODE_ENV`를 `'development'`나 `'production'`으로 대체하는 방식은 어느 때보다 인기가 높은 컨벤션이다.

*(authoring format이 아닌 distribution format으로 ES 모듈을 채택하는 것이 어떤 변화를 일으킬지 보는 것은 매우 흥미로울 것이다. 트위터로 이야기할까?)*

---

여전히 혼란스러울 수 있는 한 가지 부분은, Github의 React 코드에 상수로 사용되고 있는 `__DEV__`가 존재하는 것이다. 하지만 npm의 React 코드는 `process.env.NODE_ENV`를 사용할 것이다. 어떻게 동작하는 것일까?

과거에는, `__DEV__`를 사용하여 Facebook 소스 코드와 일치시켰다. 오랫동안 React는 Facebook 코드 베이스에 직접 복사되었고, 같은 규칙을 따를 수 밖에 없었다. npm의 경우, 배포 직전 `__DEV__`를 `process.env.NODE_ENV !== 'production'`로 바꾸는 단계가 존재했다.

이런 방식은 종종 문제가 되었다. Node.js 컨벤션으로 npm에서는 정상 작동했지만, Facebook에서는 정상적으로 작동하지 않았으며, 그 반대의 경우 또한 존재했다.

React 16부터 각 환경에 맞게 [각각 컴파일](https://reactjs.org/blog/2017/12/15/improving-the-repository-infrastructure.html#compiling-flat-bundles)하는 방식으로 접근법을 바꿨다. (`<script>` 태그를 포함한, npm, facebook 내부 코드 베이스에 맞춘 코드까지) 따라서, npm용 CommonJS 코드 또한 개발과 배포 번들을 미리 분리하기 위해 컴파일했다.

즉, React 소스 코드에서 `if(__DEV__)`라 작성되어 있지만, 실제로는 모든 패키지에 대해 두개의 번들을 만드는 것을 의미한다. 한 패키지는 이미 `__DEV__=true`로 미리 컴파일되어있고 다른 코드 또한 `__DEV__=false`로 이미 컴파일되어있다. npm의 각 패키지 진입점(entry point)은 어떤 패키지를 export 할지 "결정"한다.

[예시 코드](https://unpkg.com/browse/react@16.8.6/index.js)

```jsx
if (process.env.NODE_ENV === 'production') {
  module.exports = require('./cjs/react.production.min.js');
} else {
  module.exports = require('./cjs/react.development.js');
}
```

또한, 번들러가 'development' 혹은 'production' 문자열을 삽입하는 부분이며,  경량화 도구가 개발 모드에서만 사용되는 코드를 제거할 수 있는 유일한 부분이다.

`react.production.min.js`와 `react.development.js` 모두 더이상 `process.env.NODE_ENV`를 확인할 필요가 사라졌다. Node.js에서 `process.env`에 접근하는 것은 다소 느리기 때문에 이 개선은 매우 훌륭하다. 미리 두 모드의 번들을 컴파일하면 사용 중인 번들러나 경량화 도구에 상관 없이 파일크기를 훨씬 일관되게 최적화 할 수 있게 된다.

---

난 컨벤션에 의존하지 않고 좀 더 일급 개념으로 해결할 방법을 바랬지만, 아직은 방법이 없다. 모든 자바스크립트 환경에서 모드가 일급 개념이라면, 그리고 브라우저에서 표면적으로 코드가 개발 모드에서 실행되고 있다는 것을 알 수 있었다면 좋을 것이다.

반면, 한 프로젝트의 컨벤션이 생태계에 어떻게 퍼져나갔는지는 매우 흥미로운 부분이었다. `EXPRESS_ENV`는 2010년에 [`NODE_ENV`](https://github.com/expressjs/express/commit/03b56d8140dc5c2b574d410bfeb63517a0430451)가 되었고, 2013년에 [프론트엔드로 퍼지게](https://github.com/hughsk/envify/commit/ae8aa26b759cd2115eccbed96f70e7bbdceded97) 되었다. 해결책은 완벽하지 않았겠지만, 각 프로젝트에서 이 방식을 채택하는 것이 다른 어떤 방법을 찾도록 설득하는 비용보다 저렴했다. 이런 부분은 상향식과 하향식 채택 방식에 대한 귀중한 교훈을 준다. 어떤 과정으로 진행되었는지 이해한다면 성공적인 표준화 시도와 실패를 구별할 수 있다.

개발 모드와 배포 모드를 분리하는 것은 매우 유용한 기술이다. 필자는 배포 모드에서 비용이 많이 드는 체크 사항들을 위해 당신의 라이브러리와 애플리케이션 코드에서 모드를 나누어서 사용하는 것을 권장한다. 그러나 이 체크 사항들은 개발 모드에서 가치가 있을 수 있다.

강력한 기능이지만, 이를 오용할 수 있는 몇 가지 방법이 있을 수 있다. 이 내용은 다음 글의 주제가 될 것이다!
