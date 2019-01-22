---
title: Miért írjuk mindig, hogy super(props)?
date: '2018-11-30'
spoiler: A végén lesz egy csavar.
---


Tudom, hogy mostanában a [Hookok](https://reactjs.org/docs/hooks-intro.html) vannak középpontban, éppen ezért irónikus, hogy *class*  komponensekkel kapcsolatos tényekkel kezdem el ezt a blogot. És akkor mi van?!

**Ezek a 'jaj, már értem!' pillanatok *nem* fontosak a React használatát illletően, de mindenképpen szórakoztatóak, ha szeretsz elmerülni a dolgok működésében.**

Íme az első.

---

Többször írtam már le a `super(props)`-ot életemben, mint, hogy azt tudni akarnád:

```jsx{3}
class Checkbox extends React.Component {
  constructor(props) {
    super(props);
    this.state = { isOn: true };
  }
  // ...
}
```

Természetesen a [class-okat érintő, tervezett újítások](https://github.com/tc39/proposal-class-fields) megspórolják nekünk a vesződést:


```jsx
class Checkbox extends React.Component {
  state = { isOn: true };
  // ...
}
```

Az ilyen típusú szintaxist akkor [tervezték](https://reactjs.org/blog/2015/01/27/react-v0.13.0-beta-1.html#es7-property-initializers), amikor a React 0.13 megkapta a class-ok támogatását, még 2015-ben. A `konstruktorok` definiálása és a `super(props)` hívása mindig is ideiglenes megoldásnak számított, egészen addig, amíg a class alapú mezők egy kényelmes alternatívát nem nyújtottak.

Térjünk vissza ugyanerre a példára, csak már ES2015-ös újdonságokkal:

```jsx{3}
class Checkbox extends React.Component {
  constructor(props) {
    super(props);
    this.state = { isOn: true };
  }
  // ...
}
```

**Miért hívjuk meg a `super` föggvényt? Megtehetjük, hogy *nem* hívjuk meg? Ha muszáj meghívnunk, akkor mi történik, amikor nem adunk át neki `props` értéket? Létezik más argumentuma?** Derítsük ki!

---

JavaScript-ben a `super` függvény a szülő osztály konstruktorára utal. (A példánkban, a `React.Component`-ben találhatóra mutat.)

Még fontosabb tudni, hogy nem használhatjuk a `this` hivatkozást egy konstruktorban,amíg a szülő konstruktorának hívása meg nem történt. A JavaScript egyszerűen nem fogja engedni:

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

Jó oka van a JavaScript-nek, hogy ha erőszakkal is, de lefuttatja velünk a szülő osztály konstruktorát mielőtt hozzáférünk a `this` hivatkozáshoz. Gondoljuk csak végig a class felépítését:

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

Képzeljük el, hogy elkezdjük használni a `this`-t mielőtt *meghívnánk* a super függvényt. Egy hónappal később mondjuk megváltoztatjuk a `greetColleagues` függvényt, hogy az általa kiírt üzenet tartalmazza a személy nevét:

```jsx
  greetColleagues() {
    alert('Good morning folks!');
    alert('My name is ' + this.name + ', nice to meet you!');
  }
```

De tegyük fel, hogy elfelejtjük, hogy a `this.greetColleagues()` függvény előbb meghívódik, mielőtt a `super()` függvény be tudná állítani a `this.name` változót. Ebben az esetben a `this.name` még csak nem is lett definiálva. Ahogyan azt láthatjuk is, nagyon nehéz ilyen típusú kóddal tervezni és gondolkodni.

Hogy elkerüljük az ilyen buktatókat, a **JavaScript kényszerít minket, hogy ha a `this` hivatkozást szeretnénk használni, akkor előtte előszőr a `super` metódust *kell* meghívnunk.** Engedjük a szülőket, hogy tegyék a dolgukat! Ez a korlátozás a React komponensek meghatározására is érvényes:

```jsx
  constructor(props) {
    super(props);
    // ✅ Okay to use `this` now
    this.state = { isOn: true };
  }
```

Egy kérdés maradt hátra: miért kell átadnunk a `props` argumentumot?

---

Azt hihetnéd, hogy azért szükséges, mert `props` átadásával a `super` függvény beállítja a `this.props` kezdeti értékét a `React.Component`-en belül

```jsx
// Inside React
class Component {
  constructor(props) {
    this.props = props;
    // ...
  }
}
```

Ez nincs is messze az igazságtól - valójában [ezt csinálja](https://github.com/facebook/react/blob/1d25aa5787d4e19704c049c3cfa985d3b5190e0d/packages/react/src/ReactBaseClasses.js#L22).

De, ha meghívjuk a `super()` függvényt a `props` argumentum nélkül, akkor is el fogjuk tudni érni a `this.props`-ot a `render` és az összes többi függvényen belül. (Ha nem hiszel nekem, próbáld ki!)

Hogyan lehetséges *ez*? Ebből kiderül, hogy a **React hozzárendeli a `props` argumentumot a példányunkhoz, rögtön miután meghívta az adott példány *konstruktorát:**:

```jsx
  // Inside React
  const instance = new YourComponent(props);
  instance.props = props;
```

Tehát, még ha el is felejted a `props`-ot átadni a `super()` függvénynek, a React ezt megteszi helyetted. Ennek oka van.

Amikor a React megkapta a class-ok támogatását, akkor nem csak az ES6 osztályok tulajdonságát kapta meg. A cél az volt, hogy olyan széles körben fedjük le az egyes osztályok absztakciókat, amennyire csak lehetséges. [Nem teljesen volt világos](https://reactjs.org/blog/2015/01/27/react-v0.13.0-beta-1.html#other-languages), hogy mennyire lesz sikeres a ClojureScript-tel, CoffeeScript-tel, ES6-tal, Fable-el, Scala.js-el, TypeScript-tel, vagy más komponens alapú megoldással. Míg az ES6-ot igen, addig a React-ot szándékosan tervezték úgy, hogy ne függjön attól, hogy a `super()` függvény meg lett-e hívva vagy sem.

Ez azt jelenti, hogy elég mostantól `super()` függvényt hívni a `super(props)` helyett?

**Természetesen nem, mert zavaró.** Persze, a React gondoskodna a `this.props` *későbbi* hozzárendeléséről, miután a konstruktor meghívódott, de a `this.props` még mindig undefined lenne a `super` függvény meghívása és a konstruktor vége *között*:

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
Sokkal nagyobb kihívást jelenthet a hibakeresés is, ha ez valamelyik metódusban történik, amely a *konstruktorból* lett meghívva. **Ezért javaslom, hogy mindig adjuk át a super() függvénynek a `props`-t, még ha ez nem is szigorúan kötelező:** 

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

Ezzel biztosak lehetünk abban, hogy a `this.props` beállításra kerül, még a konstruktor lefutása előtt.

-----

Van még egy dolog, amire biztosan kíváncsiak a React felhasználók.

Biztosan megfigyelted már, hogy, amikor a Context API-t használod class-okon belül (még a régi `contextTypes` és az új `contextType` (React 16.6) esetében is), a `context`, mint második paraméter érkezik a konstruktorba.

Miért is nem írjuk egyszerűen, hogy `super(props, context)`? Megtehetnénk, de a context nagyon ritkán kerül felhasználásra, ezért ez a szituáció nem merül fel túl gyakran.

**A class-ok mezőit érintő újításoknak köszönhetően ezek a buktatók teljesen megszűnnek.** Létező konstuktor nélkül is minden argumentum automatikusan átadásra kerül a komponensek számára. Ennek köszönhetően használhatjuk a `state = {}` kifejezést, hogy hivatkozásokat ágyazhassunk be a `this.props`-ot és a `this.context`-et illetően, persze csak ha szükséges.

A Hook-ok esetében egyáltalán nincs `super` függvényünk vagy `this` hivatkozásunk, de ez már egy másik történet, másik alkalomra.
