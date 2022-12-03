---
title: Dlaczego piszemy super(props)?
date: '2018-11-30'
spoiler: Na końcu będzie zwrot akcji.
---


Słyszałem, że [Hooks](https://reactjs.org/docs/hooks-intro.html) są teraz na fali. Na przekór temu zacznę od ciekawostek dotyczących komponentów pisanych jako *klasy*. Co ty na to!

**Te haczyki *nie* są istotne, żeby wydajnie używać React. Może wydadzą ci się zabawne jeśli lubisz zgłębiać jak coś dokładnie działa.**

Teraz pierwszy z nich.

---

W swoim życiu napisałem `super(props)` więcej razy niż chciałbym wiedzieć:

```jsx{3}
class Checkbox extends React.Component {
  constructor(props) {
    super(props);
    this.state = { isOn: true };
  }
  // ...
}
```

Oczywiście [propozycja pól w klasach](https://github.com/tc39/proposal-class-fields) pozwala skrócić tę ceremonię:

```jsx
class Checkbox extends React.Component {
  state = { isOn: true };
  // ...
}
```

Taka składnia była [planowana](https://reactjs.org/blog/2015/01/27/react-v0.13.0-beta-1.html#es7-property-initializers) kiedy React 0.13 dodał wsparcie dla prostych klas w roku 2015. Definiowanie funkcji `constructor` i wołanie `super(props)` było zawsze uważane jako rozwiązanie tymczasowe aż do momentu kiedy pola w klasach staną się wygodną alternatywą. 

Wróćmy do naszego przykładu wykorzystującego tylko składnię ES2015:

```jsx{3}
class Checkbox extends React.Component {
  constructor(props) {
    super(props);
    this.state = { isOn: true };
  }
  // ...
}
```

**Dlaczego wołamy `super`? Czy możemy go *nie* wywoływać? A jeżeli już musimy to co stanie się jeśli nie przekażemy `props`? Czy są jakieś inne argumenty?** Sprawdźmy to.

---

W JavaScript `super` odnośi się do konstruktora klasy nadrzędnej. (W naszym przykładzie wskazuje na implementację `React.Component`.)

Co istotne w konstruktorze nie można używać `this` *dopóki* nie wywołamy konstruktora nadrzędnego. JavaScript nie pozwoli na coś takiego:

```jsx
class Checkbox extends React.Component {
  constructor(props) {
    // 🔴 Jeszcze nie możesz używać `this`
    super(props);
    // ✅ Teraz już można
    this.state = { isOn: true };
  }
  // ...
}
```

Istnieje dobry powód dlaczego JavaScript wymaga wywołania konstruktora nadrzędnego zanim będzie można użyć słowa kluczowego `this`. Wyobraźmy sobie taką hierarchię klas:

```jsx
class Person {
  constructor(name) {
    this.name = name;
  }
}

class PolitePerson extends Person {
  constructor(name) {
    this.greetColleagues(); // 🔴 Tak nie wolno, przeczytaj poniżej dlaczego
    super(name);
  }
  greetColleagues() {
    alert('Witajcie przyjaciele!');
  }
}
```

Wyobraź sobie, że użycie `this` zanim wywołamy `super` *byłoby* dozwolone. Miesiąc później moglibyśmy zmienić `greetColleagues` tak, żeby zawierało imię osoby w wiadomości na powitanie:

```jsx
  greetColleagues() {
    alert('Witajcie przyjaciele!');
    alert('Nazywam się ' + this.name + ', miło cię poznać!');
  }
```

Zapomnieliśmy jednak, że `this.greetColleagues()` jest wywoływane zanim `super()` miało okazję ustawić `this.name`. Tak więc `this.name` nie jest jeszcze nawet zdefiniowane! Jak widzisz taki kod może być trudny do zrozumienia. 

Żeby uniknąć takich pułapek, **JavaScript wymaga, że przed użyciem `this` w konstruktorze, najpierw *trzeba* wywołać `super`.** Niech rodzić zrobi co trzeba! To samo ograniczenie ma zastosowanie w komponentach React definiowanych jako klasy:

```jsx
  constructor(props) {
    super(props);
    // ✅ Teraż można używać `this`
    this.state = { isOn: true };
  }
```

Zostało nam jeszcze jedno pytanie: dlaczego przekazujemy `props`?

---

Może wydawać ci się, że przekazywanie `props` do `super` jest konieczne, żeby bazowy konstruktor `React.Component` mógł inicjalizować `this.props`:

```jsx
// Wewnątrz React
class Component {
  constructor(props) {
    this.props = props;
    // ...
  }
}
```

Nie jest to dalekie od prawdy — rzeczywiście, tak [właśnie robi](https://github.com/facebook/react/blob/1d25aa5787d4e19704c049c3cfa985d3b5190e0d/packages/react/src/ReactBaseClasses.js#L22).

Jednak nawet jeżeli wywołasz `super()` bez przekazania argumentu `props`, nadal będziesz miał dostęp do `this.props` w metodzie `render` i w pozostałych metodach. (Sprawdź to jeżeli mi nie wierzysz!)

W jaki sposób *to* działa? Okazuje się, że **React również przypisuje `props` do instancji klasy zaraz po wywołaniu *twojego* konstruktora:**

```jsx
  // Wewnątrz React
  const instance = new YourComponent(props);
  instance.props = props;
```

Tak więc nawet jeżeli zapomnisz przekazać `props` do `super()`, React ustawi je za ciebie chwilę później. Dzieje się to nie bez powodu. 

Kiedy React dodał wsparcie dla klas, nie było to tylko wsparcie klas ES6. Wtedy nie było jeszcze [jasne](https://reactjs.org/blog/2015/01/27/react-v0.13.0-beta-1.html#other-languages) jak duży sukces odniosą ClojureScript, CoffeeScript, ES6, Fable, Scala.js, TypeScript i inne sposoby definiowania komponentów. Dlatego React celowo nie określał czy wywołanie `super()` ma być wymagane — pomimo tego, że jest tak w klasach ES6.

Czy w takim razie możesz używać samego `super()` zamiast `super(props)`?

**Prawdopodobnie nie ponieważ jest to mylące.** Oczywiście React za chwilę przypisze `this.props` *po* wywołaniu twojego konstruktora. Jednak `this.props` byłoby `undefined` *pomiędzy* wywołaniem `super` aż do końca twojego konstruktora:

```jsx{14}
// Wewnątrz React
class Component {
  constructor(props) {
    this.props = props;
    // ...
  }
}

// W twoim kodzie
class Button extends React.Component {
  constructor(props) {
    super(); // 😬 Zapomnieliśmy przekazać props
    console.log(props);      // ✅ {}
    console.log(this.props); // 😬 undefined 
  }
  // ...
}
```

Jeszcze większym wyzwaniem będzie debugowanie jeżeli dzieje się tak wewnątrz metody wywoływanej *w* konstruktorze. **Dlatego zalecam przekazywanie `super(props)` zawsze, niezależnie od tego czy jest to konieczne w danym momencie:**

```jsx
class Button extends React.Component {
  constructor(props) {
    super(props); // ✅ Przekazujemy props
    console.log(props);      // ✅ {}
    console.log(this.props); // ✅ {}
  }
  // ...
}
```

Dzięki temu `this.props` jest ustawione przed zakończeniem wykonywania się konstruktora. 

-----

Jest jeszcze jedna ciekawostka dla tych, którzy używają React'a od dawna.

Być może wpadło ci w oko, że kiedy używasz Context API w klasach (niezależnie od tego czy starego `contextTypes` czy nowego API `contextType` dodanego w React 16.6), `context` przekazywany jest jako drugi argument konstruktora. 

Dlaczego więc nie piszemy `super(props, context)`? Moglibyśmy, ale ponieważ context używany jest rzadziej to w konsekwencji problem ten nie pojawia się równie często. 

**Wraz z pojawieniem się propozycji pól w klasach cały ten problem w zasadzie przestaje mieć znaczenie.** Kiedy brak zdefiniowanego konstruktora wszystkie argumenty są przekazywane automatycznie. Właśnie dzięki temu wyrażenie takie jak `state = {}` może zawierać odniesienia do `this.props` lub `this.context` jeżeli jest to konieczne.

A kiedy zaczynamy używać Hooks nie mamy nawet do czynienia z `super` ani z `this`, ale to już temat na inny dzień.
