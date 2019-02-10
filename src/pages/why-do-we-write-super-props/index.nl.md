---
title: Waarom gebruiken we super(props)?
date: '2018-11-30'
spoiler: Het einde heeft een wending.
---

[Hooks](https://reactjs.org/docs/hooks-intro.html) zijn blijkbaar helemaal in. Ironisch genoeg wil ik dit blog beginnen met een aantal leuke feiten over *class* components. Wat dacht je daarvan!

**Het is totaal *niet* nodig om deze feitjes te weten om effectief met React te kunnen werken. Maar het kan wel interessant zijn als je wil weten hoe alles samenhangt.**

Ten eerste.

---

Ik heb `super(props)` vaker geschreven dan ik zou willen toegeven:

```jsx{3}
class Checkbox extends React.Component {
  constructor(props) {
    super(props);
    this.state = { isOn: true };
  }
  // ...
}
```

Natuurlijk maakt [the class fields proposal](https://github.com/tc39/proposal-class-fields) het heel makkelijk om dit hele gedoe over te slaan:


```jsx
class Checkbox extends React.Component {
  state = { isOn: true };
  // ...
}
```
Deze syntax stond al in de [planning](https://reactjs.org/blog/2015/01/27/react-v0.13.0-beta-1.html#es7-property-initializers) toen er in React 0.13 in 2015 ondersteuning kwam voor plain classes. Het definiëren van de `constructor` en aanroepen van `super(props)` was altijd bedoeld als een tijdelijke oplossing totdat class fields een goed alternatief kon bieden.

Laten we het voorbeeld nog eens bekijken, maar dan met gebruik van ES2015 functionaliteiten:

```jsx{3}
class Checkbox extends React.Component {
  constructor(props) {
    super(props);
    this.state = { isOn: true };
  }
  // ...
}
```

**Waarom is het nodig om `super` aan te roepen? Is het ook mogelijk dit niet te doen? En als dit dan toch nodig is, wat gebeurt er dan als we geen `props` meegeven? Zijn er nog andere argumenten?** Laten we kijken.

---

`super` refereert in JavaScript naar de parent class `constructor`. (In ons voorbeeld verwijst het naar de implementatie van `React.Component`.)

Belangrijk om te weten is dat je `this` pas kan gebruiken in een `constructor` *nadat* je de parent `constructor` hebt aangeroepen. JavaScript laat het niet toe om:

```jsx
class Checkbox extends React.Component {
  constructor(props) {
    // 🔴 Kan 'this' nog niet gebruiken.
    super(props);
    // ✅ Nu kan het wel.
    this.state = { isOn: true };
  }
  // ...
}
```

Er is een goede reden dat JavaScript aandringt op het uitvoeren van de parent `constructor` voordat je iets met `this` doet. Stel je een class hierarchie voor:

```jsx
class Person {
  constructor(name) {
    this.name = name;
  }
}

class PolitePerson extends Person {
  constructor(name) {
    this.greetColleagues(); // 🔴 Dit mag niet, lees hieronder waarom.
    super(name);
  }
  greetColleagues() {
    alert('Good morning folks!');
  }
}
```

Stel je voor dat je `this` gebruikt *voordat* `super` kan worden aangeroepen. Een maand later willen we misschien `greetColleagues` aanpassen zodat deze ook de naam van de persoon heeft in het bericht:

```jsx
  greetColleagues() {
    alert('Good morning folks!');
    alert('My name is ' + this.name + ', nice to meet you!');
  }
```

Maar we zijn vergeten dat `this.greetColleagues()` aangeroepen is voordat `super()` de kans heeft gekregen om `this.name` op te zetten. `this.name` is dus nog niet eens gedefinieerd! Zoals je kan zien kan dit soort code moeilijk zijn om rekening mee te houden.

Om dit soort valkuilen te voorkomen **forceert JavaScript ons eerst `super` aan te roepen voordat je `this` kan gebruiken.** Laat de parent zijn ding doen! Deze beperking is ook van toepassing op React components die als class worden gedefinieerd:

```jsx
  constructor(props) {
    super(props);
    // ✅ Het is OK om `this` nu te gebruiken.
    this.state = { isOn: true };
  }
```

Dit brengt ons bij de volgende vraag: waarom zou je `props` meegeven?

---

Je zou denken dat het meegeven van `props` aan `super` noodzakelijk is, omdat het de constructor van `React.Component` in staat stelt `this.props` te initialiseren:

```jsx
// In React
class Component {
  constructor(props) {
    this.props = props;
    // ...
  }
}
```

Dit ligt niet ver van de waarheid - dat is ook precies [wat het doet](https://github.com/facebook/react/blob/1d25aa5787d4e19704c049c3cfa985d3b5190e0d/packages/react/src/ReactBaseClasses.js#L22).

Maar als je `super()` aanroept zonder het `props` argument, is het op een of andere manier toch nog mogelijk om `this.props` te benaderen in de `render` method en andere methods. (Geloof je me niet? Probeer het dan vooral zelf uit).

Hoe *dat* werkt? Het blijkt dat **React props ook toewijst op de instance net nadat *jouw* constructor is aangeroepen:**

```jsx
  // In React
  const instance = new YourComponent(props);
  instance.props = props;
```

Dus zelfs als je vergeet `props` mee te geven aan `super()` zal React ze direct na afloop klaarzetten. En daar is een reden voor.

Toen er in React ondersteuning kwam voor classes, kwam er niet alleen ondersteuning voor ES6 classes. Het doel was om een zo breed mogelijk scala aan class abstracties te ondersteunen. Het was [niet geheel duidelijk](https://reactjs.org/blog/2015/01/27/react-v0.13.0-beta-1.html#other-languages) hoe succesvol ClojureScript, CoffeeScript, ES6, Fable, Scala.js, TypeScript of andere oplossingen zouden zijn voor het definiëren van componenten. Daarom bleef React neutraal wat betreft of het aanroepen van `super()` nodig zou zijn - zelfs als dat bij ES6 classes wel nodig is.

Betekent dit dat je gewoon `super()` kan gebruiken in plaats van `super(props)`?

**Waarschijnlijk niet, sinds het nog steeds verwarrend is.** Uiteraard, React zal `this.props` toewijzen nadat de `constructor` zijn werk heeft gedaan. Maar `this.props` zou nog steeds niet gedefinieerd zijn *tussen* de `super` call en het einde van je `constructor`:

```jsx{14}
// In React
class Component {
  constructor(props) {
    this.props = props;
    // ...
  }
}

// In de code
class Button extends React.Component {
  constructor(props) {
    super(); // 😬 We vergaten props mee te geven
    console.log(props);      // ✅ {}
    console.log(this.props); // 😬 undefined
  }
  // ...
}
```

Het kan nog uitdagender zijn om te debuggen als dit in een method gebeurt die wordt aangeroepen *vanuit* de `constructor`. **En dat is waarom ik aanraad om altijd `super(props)` door te geven, zelfs als het niet per se verplicht is:**

```jsx
class Button extends React.Component {
  constructor(props) {
    super(props); // ✅ We gaven props mee
    console.log(props);      // ✅ {}
    console.log(this.props); // ✅ {}
  }
  // ...
}
```

Dit waarborgt dat `this.props` is gedefinieerd nog voordat de `constructor` klaar is.

-----

Er is nog één ding waar mensen die React al langer gebruiken misschien nieuwsgierig naar zijn.

Het is je misschien opgevallen dat als je de Context API in classes (met legacy `contextTypes` of de modernere `contextType` API die werd toegevoegd in React 16.6), gebruikt, `context` als tweede argument wordt meegegeven aan de `constructor`.

Dus waarom schrijven we dan niet `super(props, context)`?  Dit zou kunnen, maar context wordt veel minder vaak gebruikt, dus deze valkuil zal minder vaak voorkomen.

**Met de class fields proposal verdwijnt deze valkuil sowieso al zo goed als volledig.** Zonder een expliciete `constructor` worden alle argumenten automatisch al doorgegeven. Dit maakt het mogelijk dat een expressie zoals `state = {}` referenties bevat naar `this.props` of `this.context` als het nodig is.

Met Hooks hebben we niet eens `super` of `this`. Maar dat is een onderwerp voor een andere dag.