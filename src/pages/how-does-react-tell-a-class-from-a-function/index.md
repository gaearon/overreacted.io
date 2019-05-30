---
عنوان: چطور React یک کلاس رو از تابع صدا میزنه
تاریخ: '2018-12-02'
پوشش: در موردشون صحبت میکنیم classes, new, instanceof, prototype chains, and API design.
---

کامپوننت `Greeting` رو که به عنوان یک تابع تعریف شده در نظر بگیرید:

```jsx
function Greeting() {
  return <p>Hello</p>;
}
```

React از تعریفش به عنوان کلاس پشتیبانی میکنه:

```jsx
class Greeting extends React.Component {
  render() {
    return <p>Hello</p>;
  }
}
```

(تا [recently](https://reactjs.org/docs/hooks-intro.html), تنها راه استفاده از ویژگی state بود.)

میخوایم کامپونت `<Greeting />` رو نمایش بدیم, اهمیتی به شیوه تعریفش نمیدیم:

```jsx
// Class or function — whatever.
<Greeting />
```

اما *خود React* به تفاوت هاش اهمین میده!

اگر `Greeting` یک تابع باشه, React باید صداش بزنه:

```jsx
// Your code
function Greeting() {
  return <p>Hello</p>;
}

// Inside React
const result = Greeting(props); // <p>Hello</p>
```

اما اگه `Greeting` یک کلاس باشه, React باید با عملگر `new` ازش یک نمونه بسازه و *بعد* متد `render` روی نمونه ساخته شده صدا بزنه:

```jsx
// Your code
class Greeting extends React.Component {
  render() {
    return <p>Hello</p>;
  }
}

// داخل React
const instance = new Greeting(props); // Greeting {}
const result = instance.render(); // <p>Hello</p>
```

تو هر دو مورد هدف React’s نمایش گره (برای مثال, `<p>Hello</p>`) هست. اما اقدامات ریزتر بستگی به این داره که `Greeting` چطور تعریف میشه.

**پس React چطور بفهمه که چیزی که داخلش هست کلاسه یا تابع?**

مثل مطلب قبلی ام [previous post](/why-do-we-write-super-props/), **شما *نیاز ندارید* به عنوان سازنده اینو بدونید.** من هم سال ها اینو نمیدونستم. اینو تو سوالای مصاحبه ازش استفاده نکنید. در واقع این مطلب بیشتر به جاوااسکریپت مربوط میشه تا React.

این بلاگ برای اونایی هست که میخوان بدونن *چرا* React با یک روش مشخص کار میکنه. اگه اون شخص شمایی? پس د برو که رفتیم.

**یک ماجرای طولانیه. کمربندت رو ببند. این مطلب نکته خاصی در مورد React نداره, ما جنبه های جدیدی از `new`, `this`, `class`, arrow توابع, `prototype`, `__proto__`, `instanceof`, و این که اینها تو جاوا اسکریپت چطوری کار میکنن بررسی میکنیم. خوشبختانه, لازم نیست چیز زیادی ازشون بدونید وقتی دارید از React *استفاده میکنید* . همچنین اگه دارید اونو به اجرا درمیارید...**

(اگه میخواید جواب نهایی رو بدونید, خیلی برید پایین.)

----

اول, باید یاد بگیریم که با تابع و کلاس چطور رفتار کنیم. دقت کنیم که عملگر `new` کی یک کلاس رو صدا میزنه:

```jsx{5}
// تابع
const result = Greeting(props); // <p>Hello</p>

// کلاس
const instance = new Greeting(props); // Greeting {}
const result = instance.render(); // <p>Hello</p>
```

پس بیاید عمیقا عملگر `new` در جاوا اسکریپت درک کنیم.

---

در روزگار قدیم, کلاسی تو جاوااسکریپت وجود نداشت. اما, با توابعی میتونستی الگویی شبیه به اون رو داشته باشی. **به طور دقیق, با قرار دادن `new` قبل از صدا زدن تابع رفتار مشابه کلاس رو بهش بدید:**

```jsx
// تابع
function Person(name) {
  this.name = name;
}

var fred = new Person('Fred'); // ✅ Person {name: 'Fred'}
var george = Person('George'); // 🔴 کار نمیکنه
```

هنوز هم میتونید به این شکل کد بنویسید! رو DevTools تستش کنید.

اگه `Person('Fred')` رو **بدون** `new` صدا بزنید, `this` داخلش امکان داره یه چیز global اشاره کنه و بر کاربرد باشه (برای مثال, `window` یا `undefined`). So our code would crash or do something silly like setting `window.name`.

با اضافه کردن `new` قبل از فراخوانی, میگیم “آهای جاوااسکریپت, من یک `Person` رو میشناسم که فقط یک تابع است اما بهش اجازه بده به عنوان سازنده کلاس باشه. ** یک شی `{}` بساز و اشاره کن به `this` و تابع `Person` داخلش رو به چیزی مثل `this.name` اختصاص بده. بعد اون شی رو بهم برگردون.**”

این کاریه که عملگر `new` انجام میده.

```jsx
var fred = new Person('Fred'); // Same object as `this` inside `Person`
```

عملگر `new` هر چیزی که تو `Person.prototype` قرار دادیم رو روی شی `fred` برامون مهیا میکنه:

```jsx{4-6,9}
function Person(name) {
  this.name = name;
}
Person.prototype.sayHi = function() {
  alert('Hi, I am ' + this.name);
}

var fred = new Person('Fred');
fred.sayHi();
```

این کاریه که ملت تو جاوااسکریپت برای معادل سازی کلاس انجام میدن.

---

پس `new` جاوااسکریپت رو به نوعی دور میزنه. اما, کلاس ها یکم جدیدن. اونها به ما برای اینن که کارای دلخواه خودمون رو بکنیم:

```jsx
class Person {
  constructor(name) {
    this.name = name;
  }
  sayHi() {
    alert('Hi, I am ' + this.name);
  }
}

let fred = new Person('Fred');
fred.sayHi();
```

*به دست اوردن دل برنامه نویس* مهم ترین چیزیه که تو طراحی رابط برنامه نویسی مطرحه.

اگه یک تابع بنویسی, جاوااسکریپت نمتونه بفهمه مثل `alert()` فراخونیش کنه یا شبیه به یک سازندهه `new Person()` عمل کنه. یادش میره `new`  رو برای تابعی مثل  `Person` و این باعث میشه رفتار گیج کننده ای نشون بده.

**نحوبندی کلاس به ما میگه: “این فقط یک تابع نیست — این یک کلاسه و سازنده هم داره”.** اگه `new` رو یادت رفته موقع فراخونی جاوا اسکریپت هم خطا رو برات رو میکنه:

```jsx
let fred = new Person('Fred');
// ✅  اگه تابع باشع: درست کار میکنه
// ✅  اگه کلاس باشه: باز هم درست کار میکنه

let george = Person('George'); //  `new` رو یادمون رفت
// 😳 اگه تابع شبه سازنده باشه: رفتار گیج کننده ای نشون میده
// 🔴 اگه کلاس باشه: سریعا منفجر میشه
```

This helps us catch mistakes early instead of waiting for some obscure bug like `this.name` being treated as `window.name` instead of `george.name`.

However, it means that React needs to put `new` before calling any class. It can’t just call it as a regular function, as JavaScript would treat it as an error!

```jsx
class Counter extends React.Component {
  render() {
    return <p>Hello</p>;
  }
}

// 🔴 React can't just do this:
const instance = Counter(props);
```

This spells trouble.

---

Before we see how React solves this, it’s important to remember most people using React use compilers like Babel to compile away modern features like classes for older browsers. So we need to consider compilers in our design.

In early versions of Babel, classes could be called without `new`. However, this was fixed — by generating some extra code:

```jsx
function Person(name) {
  // A bit simplified from Babel output:
  if (!(this instanceof Person)) {
    throw new TypeError("Cannot call a class as a function");
  }
  // Our code:
  this.name = name;
}

new Person('Fred'); // ✅ Okay
Person('George');   // 🔴 Cannot call a class as a function
``` 

You might have seen code like this in your bundle. That’s what all those `_classCallCheck` functions do. (You can reduce the bundle size by opting into the “loose mode” with no checks but this might complicate your eventual transition to real native classes.)

---

By now, you should roughly understand the difference between calling something with `new` or without `new`:

|  | `new Person()` | `Person()` |
|---|---|---|
| `class` | ✅ `this` is a `Person` instance | 🔴 `TypeError`
| `function` | ✅ `this` is a `Person` instance | 😳 `this` is `window` or `undefined` |

This is why it’s important for React to call your component correctly. **If your component is defined as a class, React needs to use `new` when calling it.**

So can React just check if something is a class or not?

Not so easy! Even if we could [tell a class from a function in JavaScript](https://stackoverflow.com/questions/29093396/how-do-you-check-the-difference-between-an-ecmascript-6-class-and-function), this still wouldn’t work for classes processed by tools like Babel. To the browser, they’re just plain functions. Tough luck for React.

---

Okay, so maybe React could just use `new` on every call? Unfortunately, that doesn’t always work either.

With regular functions, calling them with `new` would give them an object instance as `this`. It’s desirable for functions written as constructor (like our `Person` above), but it would be confusing for function components:

```jsx
function Greeting() {
  // We wouldn’t expect `this` to be any kind of instance here
  return <p>Hello</p>;
}
```

That could be tolerable though. There are two *other* reasons that kill this idea.

---

The first reason why always using `new` wouldn’t work is that for native arrow functions (not the ones compiled by Babel), calling with `new` throws an error:

```jsx
const Greeting = () => <p>Hello</p>;
new Greeting(); // 🔴 Greeting is not a constructor
```

This behavior is intentional and follows from the design of arrow functions. One of the main perks of arrow functions is that they *don’t* have their own `this` value — instead, `this` is resolved from the closest regular function:

```jsx{2,6,7}
class Friends extends React.Component {
  render() {
    const friends = this.props.friends;
    return friends.map(friend =>
      <Friend
        // `this` is resolved from the `render` method
        size={this.props.size}
        name={friend.name}
        key={friend.id}
      />
    );
  }
}
```

Okay, so **arrow functions don’t have their own `this`.** But that means they would be entirely useless as constructors!

```jsx
const Person = (name) => {
  // 🔴 This wouldn’t make sense!
  this.name = name;
}
```

Therefore, **JavaScript disallows calling an arrow function with `new`.** If you do it, you probably made a mistake anyway, and it’s best to tell you early. This is similar to how JavaScript doesn’t let you call a class *without* `new`.

This is nice but it also foils our plan. React can’t just call `new` on everything because it would break arrow functions! We could try detecting arrow functions specifically by their lack of `prototype`, and not `new` just them:

```jsx
(() => {}).prototype // undefined
(function() {}).prototype // {constructor: f}
```

But this [wouldn’t work](https://github.com/facebook/react/issues/4599#issuecomment-136562930) for functions compiled with Babel. This might not be a big deal, but there is another reason that makes this approach a dead end.

---

Another reason we can’t always use `new` is that it would preclude React from supporting components that return strings or other primitive types.

```jsx
function Greeting() {
  return 'Hello';
}

Greeting(); // ✅ 'Hello'
new Greeting(); // 😳 Greeting {}
```

This, again, has to do with the quirks of the [`new` operator](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/new) design. As we saw earlier, `new` tells the JavaScript engine to create an object, make that object `this` inside the function, and later give us that object as a result of `new`.

However, JavaScript also allows a function called with `new` to *override* the return value of `new` by returning some other object. Presumably, this was considered useful for patterns like pooling where we want to reuse instances:

```jsx{1-2,7-8,17-18}
// Created lazily
var zeroVector = null;

function Vector(x, y) {
  if (x === 0 && y === 0) {
    if (zeroVector !== null) {
      // Reuse the same instance
      return zeroVector;
    }
    zeroVector = this;
  }
  this.x = x;
  this.y = y;
}

var a = new Vector(1, 1);
var b = new Vector(0, 0);
var c = new Vector(0, 0); // 😲 b === c
```

However, `new` also *completely ignores* a function’s return value if it’s *not* an object. If you return a string or a number, it’s like there was no `return` at all.

```jsx
function Answer() {
  return 42;
}

Answer(); // ✅ 42
new Answer(); // 😳 Answer {}
```

There is just no way to read a primitive return value (like a number or a string) from a function when calling it with `new`. So if React always used `new`, it would be unable to add support components that return strings!

That’s unacceptable so we need to compromise.

---

What did we learn so far? React needs to call classes (including Babel output) *with* `new` but it needs to call regular functions or arrow functions (including Babel output) *without* `new`. And there is no reliable way to distinguish them.

**If we can’t solve a general problem, can we solve a more specific one?**

When you define a component as a class, you’ll likely want to extend `React.Component` for built-in methods like `this.setState()`. **Rather than try to detect all classes, can we detect only `React.Component` descendants?**

Spoiler: this is exactly what React does.

---

Perhaps, the idiomatic way to check if `Greeting` is a React component class is by testing if `Greeting.prototype instanceof React.Component`:

```jsx
class A {}
class B extends A {}

console.log(B.prototype instanceof A); // true
```

I know what you’re thinking. What just happened here?! To answer this, we need to understand JavaScript prototypes.

You might be familiar with the “prototype chain”. Every object in JavaScript might have a “prototype”. When we write `fred.sayHi()` but `fred` object has no `sayHi` property, we look for `sayHi` property on `fred`’s prototype. If we don’t find it there, we look at the next prototype in the chain — `fred`’s prototype’s prototype. And so on.

**Confusingly, the `prototype` property of a class or a function _does not_ point to the prototype of that value.** I’m not kidding.

```jsx
function Person() {}

console.log(Person.prototype); // 🤪 Not Person's prototype
console.log(Person.__proto__); // 😳 Person's prototype
```

So the “prototype chain” is more like `__proto__.__proto__.__proto__` than `prototype.prototype.prototype`. This took me years to get.

What’s the `prototype` property on a function or a class, then? **It’s the `__proto__` given to all objects `new`ed with that class or a function!**

```jsx{8}
function Person(name) {
  this.name = name;
}
Person.prototype.sayHi = function() {
  alert('Hi, I am ' + this.name);
}

var fred = new Person('Fred'); // Sets `fred.__proto__` to `Person.prototype`
```

And that `__proto__` chain is how JavaScript looks up properties:

```jsx
fred.sayHi();
// 1. Does fred have a sayHi property? No.
// 2. Does fred.__proto__ have a sayHi property? Yes. Call it!

fred.toString();
// 1. Does fred have a toString property? No.
// 2. Does fred.__proto__ have a toString property? No.
// 3. Does fred.__proto__.__proto__ have a toString property? Yes. Call it!
```

In practice, you should almost never need to touch `__proto__` from the code directly unless you’re debugging something related to the prototype chain. If you want to make stuff available on `fred.__proto__`, you’re supposed to put it on `Person.prototype`. At least that’s how it was originally designed.

The `__proto__` property wasn’t even supposed to be exposed by browsers at first because the prototype chain was considered an internal concept. But some browsers added `__proto__` and eventually it was begrudgingly standardized (but deprecated in favor of `Object.getPrototypeOf()`).

**And yet I still find it very confusing that a property called `prototype` does not give you a value’s prototype** (for example, `fred.prototype` is undefined because `fred` is not a function). Personally, I think this is the biggest reason even experienced developers tend to misunderstand JavaScript prototypes.

---

This is a long post, eh? I’d say we’re 80% there. Hang on.

We know that when we say `obj.foo`, JavaScript actually looks for `foo` in `obj`, `obj.__proto__`, `obj.__proto__.__proto__`, and so on.

With classes, you’re not exposed directly to this mechanism, but `extends` also works on top of the good old prototype chain. That’s how our React class instance gets access to methods like `setState`:

```jsx{1,9,13}
class Greeting extends React.Component {
  render() {
    return <p>Hello</p>;
  }
}

let c = new Greeting();
console.log(c.__proto__); // Greeting.prototype
console.log(c.__proto__.__proto__); // React.Component.prototype
console.log(c.__proto__.__proto__.__proto__); // Object.prototype

c.render();      // Found on c.__proto__ (Greeting.prototype)
c.setState();    // Found on c.__proto__.__proto__ (React.Component.prototype)
c.toString();    // Found on c.__proto__.__proto__.__proto__ (Object.prototype)
```

In other words, **when you use classes, an instance’s `__proto__` chain “mirrors” the class hierarchy:**

```jsx
// `extends` chain
Greeting
  → React.Component
    → Object (implicitly)

// `__proto__` chain
new Greeting()
  → Greeting.prototype
    → React.Component.prototype
      → Object.prototype
```

2 Chainz.

---

Since the `__proto__` chain mirrors the class hierarchy, we can check whether a `Greeting` extends `React.Component` by starting with `Greeting.prototype`, and then following down its `__proto__` chain:

```jsx{3,4}
// `__proto__` chain
new Greeting()
  → Greeting.prototype // 🕵️ We start here
    → React.Component.prototype // ✅ Found it!
      → Object.prototype
```

Conveniently, `x instanceof Y` does exactly this kind of search. It follows the `x.__proto__` chain looking for `Y.prototype` there.

Normally, it’s used to determine whether something is an instance of a class:

```jsx
let greeting = new Greeting();

console.log(greeting instanceof Greeting); // true
// greeting (🕵️‍ We start here)
//   .__proto__ → Greeting.prototype (✅ Found it!)
//     .__proto__ → React.Component.prototype 
//       .__proto__ → Object.prototype

console.log(greeting instanceof React.Component); // true
// greeting (🕵️‍ We start here)
//   .__proto__ → Greeting.prototype
//     .__proto__ → React.Component.prototype (✅ Found it!)
//       .__proto__ → Object.prototype

console.log(greeting instanceof Object); // true
// greeting (🕵️‍ We start here)
//   .__proto__ → Greeting.prototype
//     .__proto__ → React.Component.prototype
//       .__proto__ → Object.prototype (✅ Found it!)

console.log(greeting instanceof Banana); // false
// greeting (🕵️‍ We start here)
//   .__proto__ → Greeting.prototype
//     .__proto__ → React.Component.prototype 
//       .__proto__ → Object.prototype (🙅‍ Did not find it!)
```

But it would work just as fine to determine if a class extends another class:

```jsx
console.log(Greeting.prototype instanceof React.Component);
// greeting
//   .__proto__ → Greeting.prototype (🕵️‍ We start here)
//     .__proto__ → React.Component.prototype (✅ Found it!)
//       .__proto__ → Object.prototype
```

And that check is how we could determine if something is a React component class or a regular function.

---

That’s not what React does though. 😳

One caveat to the `instanceof` solution is that it doesn’t work when there are multiple copies of React on the page, and the component we’re checking inherits from *another* React copy’s `React.Component`. Mixing multiple copies of React in a single project is bad for several reasons but historically we’ve tried to avoid issues when possible. (With Hooks, we [might need to](https://github.com/facebook/react/issues/13991) force deduplication though.)

One other possible heuristic could be to check for presence of a `render` method on the prototype. However, at the time it [wasn’t clear](https://github.com/facebook/react/issues/4599#issuecomment-129714112) how the component API would evolve. Every check has a cost so we wouldn’t want to add more than one. This would also not work if `render` was defined as an instance method, such as with the class property syntax.

So instead, React [added](https://github.com/facebook/react/pull/4663) a special flag to the base component. React checks for the presence of that flag, and that’s how it knows whether something is a React component class or not.

Originally the flag was on the base `React.Component` class itself:

```jsx
// Inside React
class Component {}
Component.isReactClass = {};

// We can check it like this
class Greeting extends Component {}
console.log(Greeting.isReactClass); // ✅ Yes
```

However, some class implementations we wanted to target [did not](https://github.com/scala-js/scala-js/issues/1900) copy static properties (or set the non-standard `__proto__`), so the flag was getting lost.

This is why React [moved](https://github.com/facebook/react/pull/5021) this flag to `React.Component.prototype`: 

```jsx
// Inside React
class Component {}
Component.prototype.isReactComponent = {};

// We can check it like this
class Greeting extends Component {}
console.log(Greeting.prototype.isReactComponent); // ✅ Yes
```

**And this is literally all there is to it.**

You might be wondering why it’s an object and not just a boolean. It doesn’t matter much in practice but early versions of Jest (before Jest was Good™️) had automocking turned on by default. The generated mocks omitted primitive properties, [breaking the check](https://github.com/facebook/react/pull/4663#issuecomment-136533373). Thanks, Jest.

The `isReactComponent` check is [used in React](https://github.com/facebook/react/blob/769b1f270e1251d9dbdce0fcbd9e92e502d059b8/packages/react-reconciler/src/ReactFiber.js#L297-L300) to this day.

If you don’t extend `React.Component`, React won’t find `isReactComponent` on the prototype, and won’t treat component as a class. Now you know why [the most upvoted answer](https://stackoverflow.com/a/42680526/458193) for `Cannot call a class as a function` error is to add `extends React.Component`. Finally, a [warning was added](https://github.com/facebook/react/pull/11168) that warns when `prototype.render` exists but `prototype.isReactComponent` doesn’t.

---

You might say this story is a bit of a bait-and-switch. **The actual solution is really simple, but I went on a huge tangent to explain *why* React ended up with this solution, and what the alternatives were.**

In my experience, that’s often the case with library APIs. For an API to be simple to use, you often need to consider the language semantics (possibly, for several languages, including future directions), runtime performance, ergonomics with and without compile-time steps, the state of the ecosystem and packaging solutions, early warnings, and many other things. The end result might not always be the most elegant, but it must be practical.

**If the final API is successful, _its users_ never have to think about this process.** Instead they can focus on creating apps.

But if you’re also curious... it’s nice to know how it works.
