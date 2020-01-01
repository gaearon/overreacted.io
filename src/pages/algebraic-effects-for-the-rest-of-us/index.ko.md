---
title: 모두를 위한 대수적 효과
date: '2019-07-21'
spoiler: 부리또가 아니다.
---

*대수적 효과*에 대해 들어본 적이 있는가?

대수적 효과가 무엇인지, 혹은 왜 관심을 가져야 하는지 알아내기 위한 나의 첫 번째 시도는 성공하지 못했다. [몇 개](https://www.eff-lang.org/handlers-tutorial.pdf)의 [pdf 문서](https://www.microsoft.com/en-us/research/wp-content/uploads/2016/08/algeff-tr-2016-v2.pdf)를 찾아냈지만, 이 문서들은 나를 더 혼란스럽게 만들 뿐이었다.(학문적인 pdf 문서에는 나를 졸리게 만드는 뭔가가 있다.)

하지만 내 동료인 Sebastian은 리액트 내부 구조를 위한 개념 모델(mental model)로써 [대수적](https://mobile.twitter.com/sebmarkbage/status/763792452289343490) [효과를](https://mobile.twitter.com/sebmarkbage/status/776883429400915968) [계속해서](https://mobile.twitter.com/sebmarkbage/status/776840575207116800) [언급해왔다](https://mobile.twitter.com/sebmarkbage/status/969279885276454912). (Sebastian은 리액트 팀의 일원이며, Hooks과 Suspense를 비롯한 몇 가지 아이디어를 생각해냈다.) 나중에는, 대수적 효과가 리액트 팀에서 유행처럼 사용하는 농담이 되었고, 많은 대화가 이런 식으로 끝나게 되었다.

!["Algebraic Effects" caption on the "Ancient Aliens" guy meme](./effects.jpg)

알고보니 대수적 효과는 멋진 개념이었고, 내가 pdf 문서를 보며 생각했던 것처럼 무서운 것이 아니었다. **만약 당신이 단지 리액트의 사용자일 뿐이라면 대수적 효과를 알 필요는 전혀 없다. 하지만 내가 그랬듯이 흥미가 생긴 독자라면, 계속해서 읽어보길 바란다.**

*(면책 조항: 나는 프로그래밍 언어 연구가가 아니며, 설명 중에 잘못된 내용이 있을 수도 있다. 나는 이 주제에 대한 전문가가 아니므로, 잘못된 내용이 있으면 알려주길 바란다.)*

### 아직 실제 제품에 적용할 단계는 아니다

*대수적 효과*는 연구중인 프로그래밍 언어 기능(feature)이다. 즉, **`if`나 함수, 혹은 `async / await`와는 다르게 실제 제품에서는 사용할 수 없다는 의미이다.** 대수적 효과는 이 개념을 연구하기 위한 목적으로 만들어진 [몇 가지](https://www.eff-lang.org/) [언어](https://www.microsoft.com/en-us/research/project/koka/)에서만 사용할 수 있다. OCaml이 대수적 효과를 실제 언어에 적용하려는 시도를 하고 있지만... 아직은 [진행중](https://github.com/ocaml-multicore/ocaml-multicore/wiki)이다. 바꿔 말하면, [건드릴 수 없다(Can't touch this)](https://www.youtube.com/watch?v=otCpCn0l4Wo).

>수정 : 몇몇 사람들에 따르면, 리습(Lisp) 언어에서 [유사한 기능을 제공한다](https://overreacted.io/algebraic-effects-for-the-rest-of-us/#learn-more)고 한다. 즉, 리습을 사용하는 사람은 실제 제품에서 사용할 수 있다.

### 그럼, 왜 관심을 가져야 할까?

만약 당신이 `goto`를 사용해서 코드를 작성하고 있는데, 누군가가 `if`문과 `for`문을 보여줬다고 생각해보자. 혹은 당신이 콜백 지옥에 빠져있는데, 누군가가 `async / await`를 보여줬다고 생각해보자. 멋지지 않은가?

만약 당신이 프로그래밍의 특정 개념이 유행처럼 퍼지기 몇 년 전에 미리 배우고 싶어하는 사람이라면, 지금이 대수적 효과에 관심을 갖기 좋은 시기이다. 하지만 꼭 알아야 한다고 생각하진 않길 바란다. 이건 마치 1999년에 `async / await`를 생각하는 것과 비슷하다. 

### 좋아, 그럼 대수적 효과가 뭐지?

이름을 보면 뭔가 무섭게 느껴지지만, 개념은 아주 간단하다. `try / catch` 블록에 대해 잘 알고 있다면, 대수적 효과를 이해하는 건 매우 쉽다. 

먼저 `try / catch`를 복습해보자. 에러를 던지는(throw) 함수가 하나 있다고 가정해보자. 아마 그 함수와 `catch` 블록 사이에는 많은 함수가 있을 것이다. 

```jsx{4,19}
function getName(user) {
  let name = user.name;
  if (name === null) {
    throw new Error('A girl has no name'); 
  }
  return name;
}

function makeFriends(user1, user2) {
  user1.friendNames.add(getName(user2));
  user2.friendNames.add(getName(user1));
}

const arya = { name: null };
const gendry = { name: 'Gendry' };
try {
  makeFriends(arya, gendry);
} catch (err) {
  console.log("Oops, that didn't work out: ", err);}
}
```

`getName` 함수 내에서 던진 에러는, 호출 스택을 거슬러 올라가서 `makeFriends` 함수를 지나 가장 가까운 `catch` 블록까지 전달된다. 이 동작은 `try / catch` 구문의 중요한 특징이다. 중간에 있는 함수는 에러 핸들링에 대해 전혀 신경쓰지 않아도 된다. 

C언어 등에 있는 에러 코드와는 다르게, `try / catch`문을 사용하면 에러가 누락될까 걱정하면서 중간에 있는 모든 레이어에서 에러를 직접 전달할 필요가 없다. 에러는 자동적으로 전달된다. 

### 이게 대수적 효과랑 무슨 관계가 있는거지?

위의 예제에서는, 에러가 한 번 발생하면 이어서 진행할 수 없다. `catch` 블록에 도달하고 나면, 원래 코드를 이어서 실행할 수 있는 방법이 없는 것이다.

이미 지난 일이고, 너무 늦었다. 우리가 할 수 있는 최선은 그저 오류를 복구하거나, 기존에 하려던 동작을 어떻게든 다시 시도하는 것일 뿐, 마치 마법처럼 원래 있던 곳으로 "돌아가서" 다른 일을 할 수는 없다. 하지만, 대수적 효과를 사용하면 가능하다.

아래 예제는 자바스크립트를 가상으로 변경한 언어(재미삼아 ES2025라고 부르기로 하자)로 작성했으며, 이 언어에서는 누락된 `user.name`을 채워넣을 수 있다. 

```jsx{4,19-21}
function getName(user) {
  let name = user.name;
  if (name === null) {
    name = perform 'ask_name';
  }
  return name;
}

function makeFriends(user1, user2) {
  user1.friendNames.add(getName(user2));
  user2.friendNames.add(getName(user1));
}

const arya = { name: null };
const gendry = { name: 'Gendry' };
try {
  makeFriends(arya, gendry);
} handle (effect) {
  if (effect === 'ask_name') { 
    resume with 'Arya Stark';
  }
}
```

*(2025년에 이 글을 읽고 있는 독자들 중 "ES2025"로 웹페이지를 검색해서 찾아온 분들이 있다면 사과드린다. 만약 그 때 대수적 효과가 자바스크립트에 적용되어 있다면, 기쁜 마음으로 수정하겠다!)*

`throw` 대신에, 가상의 `perform` 키워드를 사용했다. 마찬가지로, `try / catch` 대신에 가상의 `try / handle`를 사용했다. 단지 개념을 설명하기 위해 사용한 것이므로 구체적인 문법은 중요하지 않다.

그럼 무슨 일이 일어날까? 좀 더 자세하게 살펴보자. 

에러를 던지는 대신, 우리는 *효과(effect)* 를 *수행(perform)* 한다. 어떤 값이든 `throw`할 수 있는 것과 마찬가지로, `perform`에도 어떤 값이든 전달할 수 있다. 이 예제에서는 문자열을 넘기고 있지만, 객체나 다른 어떤 데이터 타입도 사용 가능하다.

```jsx{4}
function getName(user) {
  let name = user.name;
  if (name === null) {
    name = perform 'ask_name';  
  }
  return name;
}
```

에러를 `throw`할 때, 엔진은 호출 스택에서 가장 가까운 `try / catch` 에러 핸들러를 찾는다. 마찬가지로, 효과를 `perform`할 때, 엔진은 호출 스택에서 가장 가까운 `try / handle` 효과 핸들러를 찾을 것이다. 

```jsx{3}
try {
  makeFriends(arya, gendry);
} handle (effect) {
  if (effect === 'ask_name') {
    resume with 'Arya Stark';
  }
}
```

이 효과는 이름이 누락된 경우 어떻게 처리해야 할 지를 결정할 수 있게 해 준다. 예외(exception)를 사용할 때와 비교해서 새로 추가된 부분은 가상의 `resume with` 구문이다. 

```jsx{5}
try {
  makeFriends(arya, gendry);
} handle (effect) {
  if (effect === 'ask_name') {
    resume with 'Arya Stark';
  }
}
```

이 구문은 `try / catch`로는 할 수 없는 일을 한다. 이 구문을 사용하면 **효과가 수행(perform)된 곳으로 다시 돌아갈 수 있고, 핸들러를 통해서 뭔가를 다시 전달할 수 있다.** 🤯


```jsx{4,6,16,18}
function getName(user) {
  let name = user.name;
  if (name === null) {
    // 1. 여기서 효과를 수행(perform) 한다.
    name = perform 'ask_name';
    // 4. ... 그리고 결국 여기로 돌아온다. (name값은 이제 'Arya Stark'이다)
  }
  return name;
}

// ...

try {
  makeFriends(arya, gendry);
} handle (effect) {
  // 2. 핸들러로 점프한다 (try/catch 처럼)
  if (effect === 'ask_name') {
    // 3. 하지만, (try/catch와는 다르게!) 값을 전달하면서 기존 코드를 이어서 진행할 수 있다 
    resume with 'Arya Stark';
  }
}
```

이 구문에 익숙해지려면 시간이 좀 걸릴수도 있지만, 사실 개념적으로는 "재시작할 수 있는(resumable) `try / catch`"와 별 다를 것이 없다.

하지만, **대수적 효과는 `try / catch` 보다 훨씬 더 유연하며, 오류를 복구하는 것은 단지 수많은 활용 예 중의 하나일 뿐**이라는 것을 기억하길 바란다. 내가 이 예제부터 시작한 이유는 단지 이해하기 가장 쉬웠기 때문이다.

### 색이 없는 함수

대수적 효과는 비동기 코드를 다룰 때 흥미로운 의미를 갖는다.

`async / await`를 사용하는 언어에서, [함수는 보통 "색"을 갖는다](https://journal.stuffwithstuff.com/2015/02/01/what-color-is-your-function/). 예를 들면, 자바스크립트에서 `makeFriends`와 그 함수의 호출자를 `async`로 만들지 않고 `getName` 함수를 비동기로 만드는 것은 불가능하다. 이런 특징 때문에, 특정 코드 조각이 경우에 따라 동기 혹은 비동기로 동작할 때, 아주 괴로운 상황이 발생할 수 있다.

```jsx
// 만약 이 함수를 async로 만들고 싶다면..
async getName(user) {
  // ...
}

// 이 함수도 async가 되어야 한다.
async function makeFriends(user1, user2) {
  user1.friendNames.add(await getName(user2));
  user2.friendNames.add(await getName(user1));
}

// 이런 식으로 async가 게속 전파된다...
```

자바스크립트의 제러네이터도 [마찬가지다](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function*). 제너레이터를 사용할 때는, 중간에 있는 코드도 제너레이터에 대해 알고 있어야 한다.

이게 무슨 관계가 있는걸까?

`async / await`에 대해서는 잠시 잊어버리고, 다시 원래의 예제로 돌아가보자.

```jsx{4,19-21}
function getName(user) {
  let name = user.name;
  if (name === null) {
    name = perform 'ask_name';  
  }
  return name;
}

function makeFriends(user1, user2) {
  user1.friendNames.add(getName(user2));
  user2.friendNames.add(getName(user1));
}

const arya = { name: null };
const gendry = { name: 'Gendry' };
try {
  makeFriends(arya, gendry);
} handle (effect) {
  if (effect === 'ask_name') {
    resume with 'Arya Stark';
  }
}
```

효과 핸들러가 "대체할 이름(fallback name)"을 동기적으로 알 수 없다면 어떻게 해야 할까? 만약 데이터베이스에서 이름을 가져와야 한다면?

알고 보면, 효과 핸들러에서 `resume with`를 비동기적으로 호출해도  `getName`이나 `makeFriends`를 변경할 필요가 전혀 없다. 

```jsx{19-23}
function getName(user) {
  let name = user.name;
  if (name === null) {
    name = perform 'ask_name';
  }
  return name;
}

function makeFriends(user1, user2) {
  user1.friendNames.add(getName(user2));
  user2.friendNames.add(getName(user1));
}

const arya = { name: null };
const gendry = { name: 'Gendry' };
try {
  makeFriends(arya, gendry);
} handle (effect) {
  if (effect === 'ask_name') {
    setTimeout(() => {
      resume with 'Arya Stark';
    }, 1000);
  }
}
```

위의 예제에서, 1초가 지나기 전까지는 `resume with`를 호출하지 않는다. `resume with`를 한 번만 실행되는 콜백 함수라고 생각해도 된다. (혹은 "one-shot delimited continuation" 라고 불러서 친구들을 감명시킬 수도 있을 것이다.)

이제 대수적 효과의 동작 방식에 대해서는 어느 정도 정리가 됐을 것이다. 우리가 에러를 `throw`할 때, 자바스크립트 엔진은 프로세스에 있는 지역 변수들을 제거하면서 "스택을 해제"한다. 하지만 효과를 `perform`할 때, 가상의 엔진은 함수의 나머지 부분들로 콜백 함수를 만들어낸 다음, `resume with`를 통해 그 함수를 호출한다. 

다시 한 번 강조하지만, 구체적인 문법과 키워드는 이 글을 위해서 만들어낸 것이다. 요점은 문법이나 키워드가 아니라 동작 방식에 있다.

## 순수성(Purity)에 대해 알아둘 점

대수적 효과가 함수형 프로그래밍 연구에서 발생했다는 사실은 주목할 필요가 있다. 대수적 효과가 해결하는 문제들 중 일부는 순수 함수형 프로그래밍을 위한 것이다. 예를 들어, 임의의 부수 효과(side effect)를 허용하지 않는 언어(하스켈 등)에서는, 효과를 다루기 위해 모나드(Monad)와 같은 개념을 사용해야만 한다. 모나드 튜토리얼을 한 번이라도 읽어봤다면, 모나드가 꽤 이해하기 어렵다는 것을 알 것이다. 대수적 효과는 비슷한 일을 좀 더 단순한 형태로 할 수 있게 도와준다.

내가 대수적 효과에 대한 수많은 논의들을 이해할 수 없던 이유는 바로 이 때문이다.(나는 하스켈과 그 친구들을 [모른다](https://overreacted.io/things-i-dont-know-as-of-2018/).) 하지만, 나는 자바스크립트와 같이 순수하지 않은 언어에서도 **대수적 효과가 코드에서 무엇(what)과 어떻게(how)를 분리할 수 있게 도와주는 아주 강력한 도구가 될 수 있다**고 생각한다. 

대수적 효과는 "무엇"을 하는지에만 집중하는 코드를 작성할 수 있게 해 준다.

```jsx{2,3,5,7,12}
function enumerateFiles(dir) {
  const contents = perform OpenDirectory(dir);  
  perform Log('Enumerating files in ', dir);  
  for (let file of contents.files) {
    perform HandleFile(file); 
  }
  perform Log('Enumerating subdirectories in ', dir);  
  for (let directory of contents.dir) {
    // 재귀를 사용하거나 효과를 갖는 다른 함수를 호출할 수도 있다
    enumerateFiles(directory);
  }
  perform Log('Done');}
}
```

그리고, 나중에 "어떻게"를 명시하는 코드로 감싸면 된다.

```jsx{6-7,9-11,13-14}
let files = [];
try {
  enumerateFiles('C:\\');
} handle (effect) {
  if (effect instanceof Log) {
    myLoggingLibrary.log(effect.message);
    resume;
  } else if (effect instanceof OpenDirectory) {
    myFileSystemImpl.openDir(effect.dirName, (contents) => {
      resume with contents;
    });
  } else if (effect instanceof HandleFile) {
    files.push(effect.fileName);
    resume;
  }
}
// 파일 배열은 이제 모든 파일을 갖고 있다.
```

그렇다면, 위의 코드 조각을 라이브러리로 만들 수도 있을 것이다.

```jsx
import { withMyLoggingLibrary } from 'my-log';
import { withMyFileSystem } from 'my-fs';

function ourProgram() {
  enumerateFiles('C:\\');
}

withMyLoggingLibrary(() => {
  withMyFileSystem(() => {
    ourProgram();
  });
});
```

`async / await`나 제너레이터와는 다르게, **대수적 효과는 "중간에 있는" 함수들과 복잡하게 얽힐 필요가 없다**. `enumerateFiles`을 `ourProgram` 내부의 깊은 곳에서 호출하더라도, 내부에서 수행(perform)하는 각 효과에 대한 핸들러가 외부 어딘가에 존재하는 한 코드는 잘 동작할 것이다.

효과 핸들러를 사용하면, 불필요하게 많은 코드르 추가하지 않고도 효과에 대한 구체적인 구현 내용으로부터 프로그램 로직을 분리해낼 수 있다. 예를 들어, 테스트를 작성할 때 구체적인 행위를 완전히 오버라이드해서, 가상의 파일시스템을 사용하거나, 로그를 출력하는 대신 로그에 대한 스냅샷 테스트를 할 수도 있다. 

```jsx{19-23}
import { withFakeFileSystem } from 'fake-fs';

function withLogSnapshot(fn) {
  let logs = [];
  try {
  	fn();
  } handle (effect) {
  	if (effect instanceof Log) {
  	  logs.push(effect.message);
  	  resume;
  	}
  }
  // Snapshot emitted logs.
  expect(logs).toMatchSnapshot();
}

test('my program', () => {
  const fakeFiles = [/* ... */];
  withFakeFileSystem(fakeFiles, () => {
  	withLogSnapshot(() => {
	  ourProgram();
  	});
  });
});
```

["함수의 색"](https://journal.stuffwithstuff.com/2015/02/01/what-color-is-your-function/)이 없고(중간에 있는 코드는 효과에 대해 알 필요가 없음), 효과 핸들러를 조합할 수 있기 때문에(중첩해서 사용 가능), 대수적 효과를 사용하면 표현력 아주 뛰어난 추상화를 만들어낼 수 있다. 

### 타입에 대해 알아둘 점

대수적 효과는 정적 타입 언어에서 나왔기 때문에, 많은 논의들이 타입을 사용한 표현 방법에 초점을 두고 있다. 사실 타입과의 관계가 중요하다는 것은 의심할 여지가 없지만, 반대로 개념을 잡는 데에 어려움을 줄 수도 있다. 이 글에서 타입에 대한 설명을 전혀 하지 않는 이유는 바로 이 때문이다. 하지만, 어떤 함수가 효과를 수행할 수 있다는 사실을 코드로 표현할 때 일반적으로 타입 시그니쳐를 사용한다는 것은 언급해야 할 것 같다. 그러면 어떤 임의의 효과가 발생했을 때, 그 효과가 어디서 왔는지 추적할 수 없는 상황을 방지할 수 있다.

효과가 타입 시그니쳐의 일부라면, 기술적으로 보면 정적 타입 언어의 대수적 효과는 함수에 ["색을 할당한다"](https://journal.stuffwithstuff.com/2015/02/01/what-color-is-your-function/)라고 주장할 수도 있을 것이다. 그건 사실이다. 하지만 중간에 있는 함수에 새로운 효과를 추가하기 위해 타입 선언을 고치는 것은, `async` 키워드를 추가하거나 함수를 제너레이터로 변경하는 것과 같은 문법적인 변경이 아니다. 타입 추론 또한 연쇄적인 변경을 방지할 수 있다. 중요한 차이점은, 빈 함수나 가상 구현체(예를 들어, 비동기 효과를 동기 방식으로 호출하는)를 제공해서 효과를 상쇄시킬 수 있다는 점이다. 이를 통해, 필요에 따라 효과를 사용하는 코드가 외부에 영향을 미치지 않도록 제한할 수 있고, 혹은 다른 효과로 변경할 수도 있다.

### 대수적 효과를 자바스크립트에 포함시켜야 할까?

솔직히 나도 잘 모르겠다. 대수적 효과는 아주 강력하기 때문에, 누군가는 자바스크립트 같은 언어에서 사용하기에 너무 강력하다고 주장할 수도 있다. 

내 생각에 대수적 효과는 변경(mutation)이 일반적이지 않고, 표준 라이브러리에서 효과를 전적으로 지원하는 언어에 잘 어울리는 것 같다. 만약 `perform Timeout(1000)`, `perform Fetch('http://google.com')`, `perform ReadFile('file.txt')`등을 기본 기능으로 사용할 수 있고, 언어적으로 효과에 대한 패턴 매칭과 정적 타이핑을 지원한다면 아주 훌륭한 개발 환경이라 할 수 있을 것이다. 

어쩌면, 이런 언어가 자바스크립트로 컴파일 될 수도 있지 않을까!

### 이 모든 게 리액트와는 무슨 관계가 있을까?

딱히 관련이 있는 건 아니다. 사실 억지로 끼워맞춘다는 느낌이 들 수도 있다.

[시간 분할(Time Slicing)과 보류(Suspense)에 대한 내 발표](https://reactjs.org/blog/2018/03/01/sneak-peek-beyond-react-16.html)에서, 두 번째 부분은 캐쉬로부터 데이터를 읽어오는 컴포넌트에 관한 내용이다.

```jsx
function MovieDetails({ id }) {
  // 아직 데이터를 가져오는 중이라면 어떨게 될까?
  const movie = movieCache.read(id);
}
```

*(실제 발표는 약간 다른 API를 사용하지만, 그게 요점은 아니다.)*

이 코드는 리액트의 "Suspense"라는 기능을 사용하고 있으며, 이 기능은 데이터를 가져오는 용도로 현재 활발하게 개발중이다. 여기서 주의깊게 봐야 할 점은 `movieCache`에 데이터가 아직 없을수도 있다는 점이다. 이 경우 다음으로 진행할 수가 없기 때문에 뭔가를 처리해 줘야 한다. 기술적으로는는 이 경우 `read()`를 호출하면 프라미스를 던진다(throw). (그렇다. 프라미스를 throw한다 - 잘 생각해보자). 그러면 실행이 "보류"된다. 리액트는 그 프라미스를 잡아서, 그 프라미스가 해결되었을 때 컴포넌트 트리를 다시 렌더링하기 위해 기억해둔다.

비록 이 기법이 대수적 효과에서 [착안한](https://mobile.twitter.com/sebmarkbage/status/941214259505119232) 것이긴 하지만, 그 자체로 대수적 효과라고 할 순 없다. 하지만 둘은 동일한 목적을 갖는다. 호출 스택(이 경우, 리액트)의 중간에 있는 함수들을 신경쓸 필요 없이, 혹은 그 함수들을 `async`나 제너레이터 함수로 강제로 변경할 필요 없이, 호출 스택의 아래쪽에 있는 코드가 윗쪽에 있는 코드에게 뭔가를 전달할 수 있다. 물론, 자바스크립트에서는 실제로 나중에 코드를 다시 실행하는 것이 불가능하지만, 리액트의 입장에서 프라미스가 해결되었을 때 컴포넌트 트리를 다시 렌더링하는 것은 사실상 같은 개념이라고 볼 수 있다. 사용하는 프로그래밍 모델이 [멱등성(idempotence)을 보장한다면](https://overreacted.io/react-as-a-ui-runtime/#purity), 대수적 효과를 흉내낼 수 있다!

대수적 효과의 또 다른 예시로 [훅(Hooks)](https://reactjs.org/docs/hooks-intro.html)을 떠올리는 사람도 있을 것이다. 사람들이 가장 먼저 물어보는 것은 `useState`가 어떤 컴포넌트를 참조하고 있는지를 어떻게 알 수 있냐는 것이다. 

```jsx
function LikeButton() {
  // useState가 어떤 컴포넌트 안에 있는지를 어떻게 알 수 있을까?
  const [isLiked, setIsLiked] = useState(false);
}
```

[이 글의 마지막 부분](https://overreacted.io/how-does-setstate-know-what-to-do/)에서 이미 정답을 설명했다. 리액트 객체에는 바로 지금 사용되고 있는 구현체를 가리키는 "현재 디스패처" 라는 변경 가능한 상태가 있다(`react-dom`을 사용하는 경우 `react-dom`의 디스패처를 가리킨다). 이와 유사하게, `LikeButton`의 내부 데이터 구조를 가리키는 "현재 컴포넌트"라는 속성도 있다. 이를 통해 `useState`가 무엇을 할 지를 알 수 있다.

사람들이 훅에 익숙해지기 전에는, 분명히 어딘가 "지저분하다"라고 생각하는 경우가 많다. 공유된 변경 가능한 상태에 의존하는 것은 "잘못됐다는 느낌"을 준다. (그런데, `try / catch`는 자바스크립트 엔진에서 어떻게 구현되어 있을까?)

하지만, 개념적으로는 `useState()`를 컴포넌트가 실행될 때 리액트에 의해 처리되는 `perform State()` 효과라고 볼 수 있다. 그렇게 보면, 왜 리액트(컴포넌트를 호출하는 코드)가 컴포넌트에게 상태를 제공해줄 수 있는지를 설명할 수 있다(리액트는 호출 스택의 윗쪽에 있으므로 효과 핸들러를 제공할 수 있다). 사실, [상태를 구현하는 것](https://github.com/ocamllabs/ocaml-effects-tutorial/#2-effectful-computations-in-a-pure-setting)은 내가 본 대수적 효과의 튜토리얼에서 가장 흔하게 볼 수 있는 예제 중의 하나이다. 

다시 말하지만, 자바스크립트에는 대수적 효과가 없기 때문에, 리액트가 실제로 이렇게 동작하지는 않는다. 대신에 현재 컴포넌트를 저장하는 숨겨진 필드가 있으며, 또한 `useState`의 구현체를 갖는 현재 "디스패처"를 가리키는 필드도 있다. 심지어 성능 최적화에 사용되는 [마운트(mount)와 업데이트(update)만을 위한](https://github.com/facebook/react/blob/2c4d61e1022ae383dd11fe237f6df8451e6f0310/packages/react-reconciler/src/ReactFiberHooks.js#L1260-L1290) 별도의 `useState` 구현체도 있다. 하지만 정말 열린 마음으로 받아들인다면, 사실상 이 코드를 효과 핸들러라고 볼 수도 있을 것이다.

정리하자면, 자바스크립트에서 throw하는 기능은 어설프게나마 IO 효과의 역할을 하며(그 코드를 나중에 다시 실행하는 게 안전하고, CPU를 과하게 사용하지 않는 한),  `try / finally` 내부에 변경 가능한 "디스패처" 필드를 갖는 것은 어설프게나마 동기적 효과 핸들러의 역할을 한다고 볼 수 있다.

[제너레이터를 사용하면](https://dev.to/yelouafi/algebraic-effects-in-javascript-part-4---implementing-algebraic-effects-and-handlers-2703) 훨씬 더 제대로 된 효과를 구현할 수도 있지만, 그 경우 자바스크립트 함수의 "투명한(transparent)" 본성을 포기하고 모든 함수를 제너레이터로 변경해야만 한다. 그건... 쩝.

### 더 알아보기

개인적으로는 내가 대수적 효과를 이렇게 잘 이해할 수 있다는 사실에 놀랐다. 나는 항상 모나드와 같은 추상적인 개념을 이해하기가 어려웠는데, 대수적 효과는 "단번에" 이해할 수 있었다. 이 글을 읽고 다른 사람들도 대수적 효과를 "단번에" 이해할 수 있길 바란다.

대수적 효과가 주류로 사용될 수 있을지는 모르겠다. 만약 2025년까지 어떤 주류 언어도 대수적 효과를 지원하지 않는다면 실망스러울 것 같다. 5년 후에 꼭 다시 확인하라고 알려주길 바란다!

물론 대수적 효과로 할 수 있는 일은 이보다 훨씬 많다. 하지만 이 개념을 사용해서 직접 코드를 작성하기 전까지는 실제로 그 위력을 체감하기가 매우 어렵다. 만약 이 글을 읽고 흥미가 생겼다면, 다음 자료를 좀 더 확인해보자.

- https://github.com/ocamllabs/ocaml-effects-tutorial

- https://www.janestreet.com/tech-talks/effective-programming/

- https://www.youtube.com/watch?v=hrBq8R_kxI0


많은 사람들이 지적하길, 타입과 관련된 내용을 빼고 나면(내가 이 글에서 한 것처럼), 커먼 리습(Common Lisp)의 [조건 시스템(condition system)](https://en.wikibooks.org/wiki/Common_Lisp/Advanced_topics/Condition_System)이 사실상 대수적 효과와 같은 기능이라고 한다. 또한 James Long이 쓴 [컨티뉴에이션(continuation)에 대한 글](https://jlongster.com/Whats-in-a-Continuation)을 보면, 내장 기능인 `call/cc`를 기초로 해서 재시작 가능한 예외를 실제로 구현하는 방법을 잘 설명하고 있다.

만약 자바스크립트를 사용하는 사람들이 대수적 효과를 이해하는 데 도움을 줄 만한 자료가 있다면, 트위터를 통해 알려주기 바란다!
