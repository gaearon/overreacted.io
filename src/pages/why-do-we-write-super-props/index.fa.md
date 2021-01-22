---
title: چرا super(props) رو می‌نویسیم؟
date: '2018-11-30'
spoiler: آخرش یک تغییر غیر منتظرس.
---

شنیدم که [Hooks](https://reactjs.org/docs/hooks-intro.html) موضوع داغه روزه جدیدن. شاید باورتون نشه ولی میخوام که این وبلاگو با توضیح دادن یه سری از چیزای باحال *class* کامپوننت‌ها شروع کنم. چطوره؟!

**این چیزایی که اینجا می‌نویسم چیزایی *نیستن* که شما باهاش بتونید ری‌اکت رو بهتر بنویسید. ولی اگه دوست دارید که در مورد ری‌اکت عمیق‌تر بدونید که چیزای مختلف چجوری کار می‌کنه ممکنه براتون جالب باشه.**

خب بریم سراغ اولین پست.

---

من توی زندگیم خیلی بیشتر از چیزی که دونسته باشم ‍`super(props)` نوشتم:

```jsx{3}
class Checkbox extends React.Component {
  constructor(props) {
    super(props);
    this.state = { isOn: true };
  }
  // ...
}
```

قطعن که [پروپوزال class fields](https://github.com/tc39/proposal-class-fields) بهمون این اجازه رو میده که درگیر این داستان نشیم:

```jsx
class Checkbox extends React.Component {
  state = { isOn: true };
  // ...
}
```

سینتکسی شبیه به این [برنامه‌ریزی](https://reactjs.org/blog/2015/01/27/react-v0.13.0-beta-1.html#es7-property-initializers) شده بود وقتی که ری‌اکت ورژن 0.13 پشتیبانی از کلاس‌ها رو اضافه کرد. تعریف کردن `constructor` و صدا زدن `super(props)` همیشه یک راه موقت در نظر گرفته شده بود تا زمانی که class fields یک راه مشابه بهتری رو ارائه رو بده خودش.

ولی بذارید برگردیم به مثالمون و فقط از خود ES2015 استفاده کنیم:

```jsx{3}
class Checkbox extends React.Component {
  constructor(props) {
    super(props);
    this.state = { isOn: true };
  }
  // ...
}
```

**چرا ما `super` رو صدا می‌زنیم؟ آیا می‌تونیم که صداش نزنیم؟ اگه که باید صداش بزنیم چی میشه اگه `props` رو پاس ندیم بهش؟ آیا پارامترهای دیگه‌ای هم هست؟**

---

توی جاوااسکریپت `super` به کلاس پدرش (کلاسی که از اون داره ارث می‌بره) اشاره می‌کنه. (توی مثال ما super داره به `React.Component` اشاره می‌کنه.)

و یک نکته‌ی مهمی که هست اینه که شما نمی‌تونی از `this` توی یک `constructor` استفاده کنی تا قبل اینکه constructor کلاس پدرش رو صدا نزده باشی. یعنی جاوااسکریپت بهتون این اجازه رو نمیده:

```jsx
class Checkbox extends React.Component {
  constructor(props) {
    // 🔴 Can’t use `this` yet
    super(props);
    // ✅ Now it’s okay though
    this.state = { isOn: true };
  }
  // ...
}
```

البته دلایل خوبی پشت این قضیس که جاوااسکریپت مجبورتون می‌کنه که constructor کلاس پدر باید قبل اینکه از `this` استفاده کنید اجرا بشه. این کلاس‌ها رو در نظر بگیرید:

```jsx
class Person {
  constructor(name) {
    this.name = name;
  }
}

class PolitePerson extends Person {
  constructor(name) {
    this.greetColleagues(); // 🔴 This is disallowed, read below why
    super(name);
  }
  greetColleagues() {
    alert('Good morning folks!');
  }
}
```

تصور کنید که می‌تونستید از `this` استفاده کنید. یک ماه بعد میومدیم که `greetCollegues` رو یکم تغییر می‌دادیم و اسم شخص رو هم توی متن پیام اضافه می‌کردیم:

```jsx
  greetColleagues() {
    alert('Good morning folks!');
    alert('My name is ' + this.name + ', nice to meet you!');
  }
```

ولی فراموش کردیم که `this.greetColleagues()` داره قبل اینکه `super()` بخواد `this.name` رو ست کنه صدا زده می‌شه. بنابراین اصلن `this.name` هنوز تعریف نشده! همونطور که می‌بینید کدای اینطوری فکر کردن بهشون می‌تونه خیلی سخت باشه.

برای جلوگیری از مشکلات و داستان‌های اینطوری **جاوااسکریپت مجبورتون می‌کنه که اگه از `this` می‌خواید توی constructor استفاده کنید *باید* `super` رو اول از همه صدا بزنید.** بذارید که پدر کارشو بکنه! و این محدودیت هم توی ری‌اکت و کامپوننت‌های که با کلاس می‌نویسید هستش.

```jsx
  constructor(props) {
    super(props);
    // ✅ Okay to use `this` now
    this.state = { isOn: true };
  }
```

یک سوال دیگه‌ای که به وجود میاد: چرا `props` رو پاس می‌دیم؟

---

ممکنه که فکر کنید که پاس دادن `props` به `super` لازمه که constructor `React.Component` بتونه `this.props` رو مقداردهی اولیه کنه.

```jsx
// Inside React
class Component {
  constructor(props) {
    this.props = props;
    // ...
  }
}
```

که خب خیلی هم بیراه نیست. در اصل [این طوری هستش که انجام میده](https://github.com/facebook/react/blob/1d25aa5787d4e19704c049c3cfa985d3b5190e0d/packages/react/src/ReactBaseClasses.js#L22)

ولی یجورایی اگه حتی شما `super()` رو بدون پارامتر `props` هم صدا بزنید می‌بینید که توی `render` هنوز به `this.props` دسترسی دارید. (اگه باورتون نمیشه خودتون امتحان کنید!)

چطوری این مدلی کار می‌کنه؟ به این برمی‌گرده که **ری‌اکت `props` رو هم به instance اضافه می‌کنه بعد از اینکه constructorـتون رو صدا می‌زنید.**

```jsx
  // Inside React
  const instance = new YourComponent(props);
  instance.props = props;
```

پس حتی وقتی که شما فراموش کردید که `props` رو به `super()` پاس بدید، ری‌اکت خودش بعدش ستش می‌کنه. یک دلیلی هم برای این کار هست.

وقتی که ری‌اکت پشتیبانی از کلاس‌ها رو اضافه کرد، فقط پشتیبانی از خود کلاس‌های ES6 نبود. هدف این بود که یک بخش زیادی از abstraction‌های کلاس‌ها هم تا جایی که ممکن بود پشتیبانی کنه. برای تعریف کردن کامپوننت [مشخص نبود](https://reactjs.org/blog/2015/01/27/react-v0.13.0-beta-1.html#other-languages) که چقدر این قابل قبول خواهد بود توی ClojureScript, CoffeeScript, ES6, Fable, Scala.js, TypeScript یا چیزای دیگه. بنابراین ری‌اکت برای صدا زدن `super()` (که توی کلاس‌های ES6 اجباریه) هیچ اجباری نداشت.

خب پس همین کافیه که بنویسیم `super()` به جای اینکه بنویسیم `super(props)`؟

**شاید به خاطر اینکه گیج‌کنندس، نه.** درسته که خود ری‌اکت `this.props` رو ست می‌کنه بعد این که constructorـتون اجرا می‌شه. ولی خب `this.props` از جایی که `super` تا انتهای constructorـتون undefined خواهد بود:

```jsx{14}
// Inside React
class Component {
  constructor(props) {
    this.props = props;
    // ...
  }
}

// Inside your code
class Button extends React.Component {
  constructor(props) {
    super(); // 😬 We forgot to pass props
    console.log(props);      // ✅ {}
    console.log(this.props); // 😬 undefined
  }
  // ...
}
```

حتی می‌تونه چالش‌های بیشتری رو داشته باشه برای ایرادیابی و دیباگ کردن اگه که این اتفاق توی متدهایی بیفته که دارن از constructor صدا زده می‌شن. **و به همین خاطر هستش که توصیه می‌کنم که همیشه `super(props)` استفاده کنید حتی اگه جاهایی که فکر می‌کنید نیاز به این کار نیست خیلی:**

```jsx
class Button extends React.Component {
  constructor(props) {
    super(props); // ✅ We passed props
    console.log(props);      // ✅ {}
    console.log(this.props); // ✅ {}
  }
  // ...
}
```

اینطوری مطمئن میشیم که `this.props` ست شده حتی قبل اینکه constructorـیی وجود داشته باشه.

---

آخرین چیزی که میخوام بگم چیزیه که کاربرای ری‌اکت از خیلی وقت پیش ممکنه در موردش کنجکاو باشن.

ممکنه وقتی از Context API توی کلاس‌ها استقاده می‌کنید (چه نسخه‌ی `contextTypes` قدیمی چه مدرنش که توی ورژن ۱۶.۶ اضافه شده) توجه کرده باشید، `context` به عنوان پارامتر دوم پاس داده میشه به constructor.

خب چرا ما نباید جاش `super(props, context)` بنویسیم؟ می تونیم این کارم بکنیم ولی context اغلب کمتر استفاده می‌شه و این داستانایی که پیش میاد خیلی به چشم نمیاد برای context.

**با پروپوزال class fields کل این مشکلات و داستانا از بین می‌رن در هر صورت.** بدون نوشتن constructor، همه‌ی پارامترها خودکار ست می‌شن. این چیزیه که به اکسپرشنی مثل `state = {}` اجازه این رو می‌ده که `this.props` یا `this.context` به درستی رفرنس بدن اگه نیاز شد.

با Hooks ما حتی به `super` و `this` نیاز نداریم به کل. ولی این یک بحث دیگس که بعدن بهش می‌پردازیم.
