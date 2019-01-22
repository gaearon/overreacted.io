---
title: Prečo používame super(props)?
date: '2018-11-30'
spoiler: Koniec bude prekvapujúci. 
---

Vraj sú v Reacte [Hooks](https://reactjs.org/docs/hooks-intro.html) trendy. Ale blog začínam vysvetlením ako fungujú komponenty vytvorené pomocou *tried*.

**Tieto veci *nie* sú dôležité na to aby ste boli produktívni pri používaní Reactu. Ale budete radi ak viete ako veci fungujú.**

Tu je prvý príspevok.

---

Do kódu som napísal `super(props)` toľko krát, že už to ani nerátam:

```jsx{3}
class Checkbox extends React.Component {
  constructor(props) {
    super(props);
    this.state = { isOn: true };
  }
  // ...
}
```

Samozrejme, nemusíme to robiť, keď použijeme [vlastnosti tried](https://github.com/tc39/proposal-class-fields):

```jsx
class Checkbox extends React.Component {
  state = { isOn: true };
  // ...
}
```

Podobná syntax bola [naplánovaná](https://reactjs.org/blog/2015/01/27/react-v0.13.0-beta-1.html#es7-property-initializers) ešte keď React 0.13 pridal podporu pre triedy v roku 2015. Použitie konštruktora a `super(props)` bolo len dočasným riešením dokým vlastnosti tried neposkytli pohodlnejšiu alternatívu.

Ale vráťme sa k príkladu, ktorý používa iba funkcie štandardu ES2015:

```jsx{3}
class Checkbox extends React.Component {
  constructor(props) {
    super(props);
    this.state = { isOn: true };
  }
  // ...
}
```

**Prečo vlastne používame funkciu `super`? Môžeme ju *ne*použiť? Ak ju musíme používať, čo sa stane ak jej neposkytneme `props`? Používajú sa aj iné parametre?** Pozrime sa na to.

---

V JavaScripte je funkcia `super` konštruktor triedy, ktorú rozširujeme. (V tomto príklade sa jedná o implementáciu `React.Component`.)

Je dôležité vedieť, že v konštruktore nemôžete používať `this` *až pokým* ste nepoužili funkciu `super`:

```jsx
class Checkbox extends React.Component {
  constructor(props) {
    // 🔴 Nemôžeme používať `this`
    super(props);
    // ✅ Až teraz to môžeme používať
    this.state = { isOn: true };
  }
  // ...
}
```

Existuje dobrý dôvod prečo JavaScript chce, aby ste použili konštruktor rozširovanej triedy predtým, než použijete `this`. Predstavme si takú hierarchiu:

```jsx
class Person {
  constructor(name) {
    this.name = name;
  }
}

class PolitePerson extends Person {
  constructor(name) {
    this.greetColleagues(); // 🔴 Toto sa nesmie
    super(name);
  }
  greetColleagues() {
    alert('Dobré ráno, priatelia!');
  }
}
```

Teraz si predstavme, že použijeme `this` pred funkciou `super`. O mesiac neskôr chceme zmeniť funkciu `greetColleagues` tak, aby v správe bolo meno dotyčnej osoby:

```jsx
  greetColleagues() {
    alert('Dobré ráno, priatelia!');
    alert('Volám sa ' + this.name + ', rád Vás spoznávam!');
  }
```

Ale zabudli sme, že funkcia `this.greetColleagues()` bola použitá predtým, než funkcia `super()` definovala vlastnosť `this.name`. To znamená, že vlastnosť `this.name` nie je definovaná! Ako vidíte, pri takom kóde sa veľmi ťažko rozmýšľa.

Aby sme sa tomu vyhli, **JavaScript chce, aby ste použili `super` _predtým_, než použijete `this`.** Nech si trieda, ktorá bola rozšírená, robí čo len chce! To obmedzenie platí aj na komponenty, ktoré sú definované pomocou tried:

```jsx
  constructor(props) {
    super(props);
    // ✅ Až teraz môžeme používať `this`
    this.state = { isOn: true };
  }
```

Teraz máme ďalšiu otázku: prečo funkcii `super` poskytujeme `props`?

---

Môžete si myslieť, že  aby mohol konštruktor triedy `React.Component` nastaviť `this.props`, musíme poskytnúť funkcii `super` parameter `props`:

```jsx
// Vo vnútri Reactu
class Component {
  constructor(props) {
    this.props = props;
    // ...
  }
}
```

A neboli by ste ďaleko od pravdy — [aj sa to deje](https://github.com/facebook/react/blob/1d25aa5787d4e19704c049c3cfa985d3b5190e0d/packages/react/src/ReactBaseClasses.js#L22).

Ale aj keby ste použili funkciu `super()` bez parametra `props`, stále by ste vedeli používať `this.props` v metódach ako sú `render` a podobne. (Neveríte? Vyskúšajte to!)

Ako je možné, že *to* funguje? **React nastavuje vlastnosť `props` hneď potom, ako použije *váš* konštruktor:**

```jsx
  // Vo vnútri Reactu
  const instance = new YourComponent(props);
  instance.props = props;
```

Takže aj keď zabudnete poskytnúť `props` funkcii `super()`, React ich nastaví. A je na to aj dôvod.

Keď React pridal podporu pre triedy, nepridal podporu iba pre ES6. Cieľom bolo pridať podporu pre čo najviac abstrakcií tried. A vtedy [nebolo jasné](https://reactjs.org/blog/2015/01/27/react-v0.13.0-beta-1.html#other-languages), ako úspešné budú jazyky ako sú ClojureScript, CoffeeScript, ES6, Fable, Scala.js alebo TypeScript. Takže React bol zámerne nestranný, a nevyžadoval použitie funkcie `super()` — aj keď sú triedy štandardu ES6 iné.

Znamená to, že môžeme použiť `super()` namiesto `super(props)`?

**Ani nie, pretože je to stále mätúce.** Áno, React nastaví `this.props` *potom* ako bol váš konštruktor spustený. Ale `this.props` stále nie je definovaný *od* použitia funkcie `super` *až* po koniec konštruktora:

```jsx{14}
// Vo vnútri Reactu
class Component {
  constructor(props) {
    this.props = props;
    // ...
  }
}

// Vo vašom kóde
class Button extends React.Component {
  constructor(props) {
    super(); // 😬 Zabudli sme na props
    console.log(props);      // ✅ {}
    console.log(this.props); // 😬 undefined 
  }
  // ...
}
```

A je výzvou opraviť chybu, ktorá nastane v nejakej funkcii, ktorá je použitá *v konštruktore*. **Práve preto vždy odporúčam používať `super(props)`, aj keď to nie je nevyhnutné:**

```jsx
class Button extends React.Component {
  constructor(props) {
    super(props); // ✅ Posktyli sme props
    console.log(props);      // ✅ {}
    console.log(this.props); // ✅ {}
  }
  // ...
}
```

Vďaka tomu bude `this.props` dostupný ešte predtým, než bude konštruktor ukončený.

-----

Tu je ešte jedna vec o ktorú sa môžu dlhodobí používatelia Reactu zaujímať.

Mohli ste si všimnúť, že keď v triedach použijete Context API (či už pomocou zastaralého API `contextTypes` alebo moderného API `contextType`, pridaného v Reacte 16.6), `context` je druhým parametrom konštruktora.

Prečo teda nepoužívame `super(props, context)`? Môžeme, ale `context` sa nepoužíva až tak často.

**Aj tak je vďaka vlastnostiam triedy tento problém vyriešený.** Bez daného konštruktora sú všetky parametre dané rozširovanej funkcii. Kvôli tomu môže `state = {}` použiť `this.props` alebo `this.context`.

Keď používame Hooks, nepoužívame ani `super`, ani `this`. Ale to je téma do budúcna.
