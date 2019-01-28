---
title: Hvorfor Skriver Vi super(props)?
date: '2018-11-30'
spoiler: Den som venter på noe godt, venter ikke forgjeves.
---


Jeg hørte at [Hooks](https://reactjs.org/docs/hooks-intro.html) er på moten. Ironisk nok vil jeg heller starte denne bloggen med å snakke om morsomme fakta om *klasse* komponenter. Tenke seg til!

**Disse [gotcha'ene](https://en.wikipedia.org/wiki/Gotcha_(programming)) er *ikke* viktige for å kunne bruke React produktivt, men de kan appellere til deg dersom du liker å komme til bunns i hvordan ting funker.**

Her er den første.

---

Jeg har skrevet `super(props)` flere ganger i mitt liv enn jeg vil vite:

```jsx{3}
class Checkbox extends React.Component {
  constructor(props) {
    super(props);
    this.state = { isOn: true };
  }
  // ...
}
```

Selvfølgelig, [forslaget til class fields](https://github.com/tc39/proposal-class-fields) lar oss hoppe over seremonien:

```jsx
class Checkbox extends React.Component {
  state = { isOn: true };
  // ...
}
```

og denne syntaksen var [planlagt](https://reactjs.org/blog/2015/01/27/react-v0.13.0-beta-1.html#es7-property-initializers) da React 0.13 la til støtte for vanlige klasser i 2015. Det å definere en `constructor` også kalle `super(props)` var alltid ment til å være en midlertidig løsning, frem til klassefeltene (class fields) kunne bidra med et ergonomisk alternativ.

Allikevel, la oss ta for oss dette eksemplet ved å bare bruke ES2015 egenskaper:

```jsx{3}
class Checkbox extends React.Component {
  constructor(props) {
    super(props);
    this.state = { isOn: true };
  }
  // ...
}
```

**Hvorfor kaller vi på `super`? Kan vi velge å *ikke* kalle på den? Hvis vi kaller på den, hva skjer hvis vi ikke sender med `props`? 
Finnes det andre parametre?** La oss finne ut av det.

---

I JavaScript, refererer `super` til parent-klasse konstruktøren. (I vårt eksempel peker den på `React.Component` implementasjonen.)

Her er det viktig å nevne at du ikke kan bruke `this` i en konstruktør *før* du har kalt på parent konstruktøren. JavaScript tillater det ikke:

```jsx
class Checkbox extends React.Component {
  constructor(props) {
    // 🔴 Kan ikke bruke `this` enda
    super(props);
    // ✅ Herfra går det bra
    this.state = { isOn: true };
  }
  // ...
}
```

Og det er med god grunn at JavaScript krever at parent konstruktøren kjører før du rører `this`. Se for deg følgende klassehierarki:

```jsx
class Person {
  constructor(name) {
    this.name = name;
  }
}

class PolitePerson extends Person {
  constructor(name) {
    this.greetColleagues(); // 🔴 Dette er ikke lov, les hvorfor nedenfor
    super(name);
  }
  greetColleagues() {
    alert('God morgen folkens!');
  }
}
```

Forestill deg at det *var* tillat å bruke `this` før `super`-kallet. En måned senere, kan det hende vi endrer `greetColleagues` slik at den inkluderer personens navn:

```jsx
  greetColleagues() {
    alert('God morgen folkens!');
    alert('Mitt navn er' + this.name + ', hyggelig å møte dere!');
  }
```

Men vi glemte at `this.greetColleagues()` blir kalt før `super()`-kallet hadde en sjanse til å sette opp `this.name`. Så `this.name` er ikke definert enda! Som du skjønner, kan kode som dette bli veldig vanskelig å holde styr på.

For å unngå slike fallgruver, **krever JavaScript at hvis du vil bruke `this` i en konstruktør, *må du* kalle `super` først.** La parenten gjøre greia si! Denne begrensningen gjelder for React komponenter som er definert som klasser også:

```jsx
  constructor(props) {
    super(props);
    // ✅ Okay å bruke `this` nå
    this.state = { isOn: true };
  }
```

Dette fører oss videre til neste spørsmål: hvorfor sende `props`?

---

Du tenker kanskje at å sende `props` til `super` er nødvendig for at den underliggende `React.Component` konstruktøren skal kunne initiere `this.props`:

```jsx
// Inne i React
class Component {
  constructor(props) {
    this.props = props;
    // ...
  }
}
```

Og det er ikke langt fra sannheten — det er nemlig [akkurat det den gjør](https://github.com/facebook/react/blob/1d25aa5787d4e19704c049c3cfa985d3b5190e0d/packages/react/src/ReactBaseClasses.js#L22).

Men på en eller annen måte, selv om du kaller `super()` uten `props` parameteren, kan du fortsatt akksesere  `this.props` i `render` og andre metoder. (Hvis du ikke tror på meg kan du jo prøve det selv!)

Hvordan funker *det*? Det viser seg at **React også tildeler `props` til instansen rett etter den kaller på *din* konstruktør:**

```jsx
  // Inne i React
  const instance = new YourComponent(props);
  instance.props = props;
```

Så selv om du glemmer å sende `props` til `super()`, vil React uansett initiere dem rett etterpå, og det er en grunn til dette.

Da React la til støtte for klasser, la den ikke bare til støtte for ES6 klasser. Målet var å støtte så mange klasseabtrasksjoner som overhode mulig. Det var imidlertid [uklart](https://reactjs.org/blog/2015/01/27/react-v0.13.0-beta-1.html#other-languages) hvor velykket ClojureScript, CoffeeScript, ES6, Fable, Scala.js, TypeScript, eller andre løsninger ville være for å definere komponenter. Dermed hadde React helt bevisst ingen formening om det skulle være et krav å kalle `super()` — selv om ES6 klasser krever det.

Så betyr dette at man bare kan skrive `super()` istedenfor `super(props)`?

**Egentlig ikke, da dette fortsatt er forvirrende.** Selv om React vil tildele `this.props` verdier *etter* at konstruktøren din kjører, vil `this.props` fortsatt være udefinert *mellom* `super` kallet og slutten på konstuktøren din:

```jsx{14}
// Inne i React
class Component {
  constructor(props) {
    this.props = props;
    // ...
  }
}

// Inne i din kode
class Button extends React.Component {
  constructor(props) {
    super(); // 😬 Vi glemte å sende med props
    console.log(props);      // ✅ {}
    console.log(this.props); // 😬 udefinert
  }
  // ...
}
```

Og det kan være enda mer utfordrende å debugge dette hvis det skjer i en metode som er kalt *fra* konstrukøtren. **Derfor anbefaler jeg på det sterkeste å alltid bruke `super(props)`, selv om det strengt tatt ikke er nødvendig:**

```jsx
class Button extends React.Component {
  constructor(props) {
    super(props); // ✅ Vi sendte props
    console.log(props);      // ✅ {}
    console.log(this.props); // ✅ {}
  }
  // ...
}
```

På denne måten er vi helt sikre på at `this.props` er definert, også før man går ut av konstruktøren.

-----

Det er en siste ting som langvarige React-brukere kanskje er nysgjerrige på.

Du har kanskje merket at når du bruker Context APIet i klasser (enten med den utdaterte `contextTypes`, eller det moderne `contextType` APIet som ble lagt til i React 16.6), blir også `context` sendt som en parameter til konstruktøren.

Hvorfor skriver vi ikke da `super(props, context)` isteden? Vi kunne ha gjort det, men context brukes mye mindre en props, og dermed oppstår altså fallgruven heller ikke så ofte.

**Dessuten forsvinner denne fallgruven mer eller mindre helt med forslaget til class fields som ble nevnt tidligere.** Ettersom vi ikke eksplitsitt lager en konstruktør, vil alle parameterene bli sendt automatisk. Det er også denne funksjonaliteten som tillater en kodesnutt som `state = {}` å fortsatt inkludere referanser til `this.props` eller `this.context` om nødvendig.

Når det kommer til Hooks, har vi ikke `super` eller `this` engang, men det er et tema for en annen dag.
