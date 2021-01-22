---
title: Чому ми пишемо super(props)?
date: '2018-11-30'
spoiler: В кінці статті присутній підступ.
---


Я чув, що [Hooks](https://reactjs.org/docs/hooks-intro.html) зараз нова гаряча тема. Іронічно, але я хочу розпочати цей блог з опису цікавих фактів про *class* компоненти. Як щодо цього!

**Ці пастки (неочевидні речі) *не є* важливими для продуктивного використання React. Але ви можете знайти їх цікавими, якщо ви любите копати глибше задля розуміння як все працює.**


І ось перша неочевидна річ.

---

За своє життя я писав `super(props)` більше разів ніж насправді хотів би того:

```jsx{3}
class Checkbox extends React.Component {
  constructor(props) {
    super(props);
    this.state = { isOn: true };
  }
  // ...
}
```

Звісно, [class fields proposal](https://github.com/tc39/proposal-class-fields) дозволяє уникати цього:

```jsx
class Checkbox extends React.Component {
  state = { isOn: true };
  // ...
}
```

Синтаксис на зразок цього [планувався](https://reactjs.org/blog/2015/01/27/react-v0.13.0-beta-1.html#es7-property-initializers), коли React 0.13 додав підтримку звичайних класів у 2015. Визначення `constructor` та виклик `super(props)` замислювався як тимчасове рішення, допоки класи не запровадять більш ергономічну альтернативу.

Але давайте повернемося до цього прикладу, використовуючи лише властивості ES2015:

```jsx{3}
class Checkbox extends React.Component {
  constructor(props) {
    super(props);
    this.state = { isOn: true };
  }
  // ...
}
```

**Чому ми викликаємо `super`? Чи можемо ми не робити цього? Якщо ми зобов'язані викликати його, що трапиться, якщо ми не передамо `props`? Чи є будь-які інші аргументи у `super`?** Давайте розберемося.

---

У JavaScript `super` посилається на конструктор базового класу. (У нашому прикладі він посилається до реалізації `React.Component`.)

Важливо, що ви не можете використовувати `this` у конструкторі, *допоки* ви не викличете базовий конструктор. JavaScript не дозволить вам зробити це:


```jsx
class Checkbox extends React.Component {
  constructor(props) {
    // 🔴 Поки не можна використовувати `this`
    super(props);
    // ✅ Тепер, мабуть, все ok
    this.state = { isOn: true };
  }
  // ...
}
```

Є чудова причина, чому JavaScript примушує, щоб базовий конструктор виконувався перед тим, як ви використаєте `this`. Роздивимось ієрархію класів:

```jsx
class Person {
  constructor(name) {
    this.name = name;
  }
}

class PolitePerson extends Person {
  constructor(name) {
    this.greetColleagues(); // 🔴 Це не дозволяється, читай нижче чому
    super(name);
  }
  greetColleagues() {
    alert('Good morning folks!');
  }
}
```

Уявіть якщо використання `this` перед викликом `super` *було б* дозволено. Місяць потому, ми б змінили `greenColleagues`, яка включала б в себе ім'я персони у повідомленні.

```jsx
  greetColleagues() {
    alert('Good morning folks!');
    alert('My name is ' + this.name + ', nice to meet you!');
  }
```

Але ми забули, що `this.greetColleagues()` викликається перед викликом `super()` і не має шансу встановити значення `this.name`. Тож `this.name` досі не було би визначено! Як ви бачите, поводження такого коду складно передбачити.

Для того щоб обійти подібні неочевидності, **JavaScript *змушує* вас спочатку викликати `super`, якщо ви бажаете використовувати `this` у конструкторі.** Нехай батьки роблять те, що повинні робити! І ці обмеження застосовуються до React-компонентів, які визначенні як класи:


```jsx
  constructor(props) {
    super(props);
    // ✅ Тепер можливо використовувати `this`
    this.state = { isOn: true };
  }
```

Але залишається інше питання: навіщо передавати `props`?

---

Ви можете подумати, що передавання `props` до `super` необхідно для того, щоб базовий конструктор `React.Component` зміг ініціалізувати `this.props`:

```jsx
// Усередині React
class Component {
  constructor(props) {
    this.props = props;
    // ...
  }
}
```

І це дійсно недалеко від правди, ось що [він робить](https://github.com/facebook/react/blob/1d25aa5787d4e19704c049c3cfa985d3b5190e0d/packages/react/src/ReactBaseClasses.js#L22).

Але якщо ви викличите `super()` без аргумента `props`, ви всеодно будете мати доступ до `this.props` у методі `render` та інших. (Якщо ви мені не вірите, спробуйте самі!)

Як *це* працює? Виявляється, що **React також присвоює `props` екземпляру класа одразу після виклику *вашого* конктруктора:**


```jsx
  // Усередині React
  const instance = new YourComponent(props);
  instance.props = props;
```

Тож навіть якщо ви забудете передати `props` до `super()`, React все одно одразу їх виставить. І для цього є причина.

Коли React додав підтримку класів, він додав не лише підтримку ES6 класів. На меті була підтримка усіх абстракцій класів, яка лише можлива. Було [не очевидно](https://reactjs.org/blog/2015/01/27/react-v0.13.0-beta-1.html#other-languages) наскільки успішними можуть бути ClojureScript, CoffeeScript, ES6, Fable, Slaca.js, TypeScript, або інші рішення для визначення компонентів. Тож React був навмисно замисленний щодо відсутності необхідності виклику `super()` – навіть якщо у ES6 це обов'язково.

Отже це означає, що ви можете писати лише `super()` замість `super(props)`?

**Взагалі-то, ні, адже це все ще дуже заплутано.** Звісно, пізніше React присвоїть `this.props` *після* виконання вашого конструктора. Але `this.props` буде досі `undefined` *між* викликом `super` та кінцем вашого конструктора:


```jsx{14}
// Усередині React
class Component {
  constructor(props) {
    this.props = props;
    // ...
  }
}

// Усередині вашого коду
class Button extends React.Component {
  constructor(props) {
    super(); // 😬 Ми забули передати props
    console.log(props);      // ✅ {}
    console.log(this.props); // 😬 undefined 
  }
  // ...
}
```

І це може бути те ще випробування для дебаґінгу, якщо це трапиться у якомусь методі, який викликається *з* конструктора. **І ось чому я рекомендую завжди передавати `super(props)`, навіть якщо це і не є суворо обов'язковим:**

```jsx
class Button extends React.Component {
  constructor(props) {
    super(props); // ✅ Ми передали props
    console.log(props);      // ✅ {}
    console.log(this.props); // ✅ {}
  }
  // ...
}
```

Це забезпечує, що значення `this.props` встановлено, навіть перед виходом з конструктору.

-----

Є ще одна річ, яка для тривалих користувачів React може бути цікавою.

Ви могли відмітити, що коли ви використовуєте Context API у класах (зі старим `contextTypes` або з сучасним `contextType` API доданим у React 16.6), `context` передається другим аргументом до конструктора.

Тоді чому ми не пишемо `super(props, context)`? Ми можемо, але context використовується набагато рідше, тому ця пастка (неочевидність) не така вже і важлива.

**Разом з пропозицією щодо полів класа (class fields proposal) ця пастка повністю зникає.** Без явного конструктора, усі аргументи передаються донизу автоматично. Саме це дозволяє включати посилання на `this.props` або `this.context` до виразів на кшталт `state = {}`.

Разом з хуками (Hooks) ми навіть не маємо `super` або `this`. Але це тема іншого дня.
