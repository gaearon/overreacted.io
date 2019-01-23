---
title: Prečo používame super(props)?
date: '2018-11-30'
spoiler: Koniec bude prekvapujúci. 
---

Vraj je funkcia [Hooks](https://reactjs.org/docs/hooks-intro.html) v Reacte trendy. Ale blog začínam vysvetlením ako fungujú komponenty vytvorené pomocou *triedy*.

**Tieto veci *nie sú* dôležité na to, aby ste boli produktívni pri používaní Reactu. Ale budete radi ak viete, ako veci fungujú.**

Tu je prvý príspevok.

---

Do kódu som napísal `super(props)` toľkokrát, že už to ani nerátam:

```jsx{3}
class Checkbox extends React.Component {
  constructor(props) {
    super(props);
    this.state = { isOn: true };
  }
  // ...
}
```

Samozrejme, nemusíme to robiť, keď použijeme [vlastnosti triedy](https://github.com/tc39/proposal-class-fields):

```jsx
class Checkbox extends React.Component {
  state = { isOn: true };
  // ...
}
```

Syntax podobná tomuto bola v Reacte [plánovaná](https://reactjs.org/blog/2015/01/27/react-v0.13.0-beta-1.html#es7-property-initializers) už vo verzii 0.13, ktorý pridal podporu pre triedy v roku 2015. Použitie konštruktora a `super(props)` bolo len dočasným riešením dokiaľ vlastnosti triedy neposkytli pohodlnejšiu alternatívu.

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

**Prečo vlastne používame funkciu `super`? Môžeme ju *ne*používať? Ak ju musíme používať, čo sa stane keď jej neposkytneme `props`? Používajú sa aj iné parametre?** Pozrime sa na to…

---

V JavaScripte je funkcia `super` konštruktor triedy, ktorú rozširujeme. (V tomto príklade sa jedná o implementáciu `React.Component`.)

Je dôležité vedieť, že v konštruktore nemôžeme používať `this` dovtedy, *pokým* nepoužijeme funkciu `super`:

```jsx
class Checkbox extends React.Component {
  constructor(props) {
    // 🔴 Nemôžeme používať `this`
    super(props);
    // ✅ Až teraz môžeme používať `this`
    this.state = { isOn: true };
  }
  // ...
}
```

Existuje dobrý dôvod, prečo JavaScript chce, aby sme zavolali konštruktor rozširovanej triedy *predtým*, než použijeme `this`. Predstavme si hierarchiu:

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
    alert('Dobrý deň, priatelia!');
  }
}
```

Teraz si predstavme, že použijeme `this` pred funkciou `super`. O mesiac neskôr chceme zmeniť funkciu `greetColleagues` tak, aby v správe bolo meno dotyčnej osoby:

```jsx
  greetColleagues() {
    alert('Dobrý deň, priatelia!');
    alert('Teší ma, volám sa ' + this.name + '!');
  }
```

Dovtedy sme už aj zabudli, že funkcia `this.greetColleagues()` bola použitá predtým, než funkcia `super()` definovala `this.name`. To znamená, že vlastnosť `this.name` nie je definovaná! Ako vidíte, pri takom kóde sa veľmi ťažko premýšľa.

Preto **JavaScript chce, aby sme zavolali `super` *predtým*, než použijeme `this`.** Nech si trieda, ktorá bola rozšírená, robí čo len chce! To obmedzenie platí aj na komponenty, ktoré sú definované pomocou triedy:

```jsx
  constructor(props) {
    super(props);
    // ✅ Až teraz môžeme používať `this`
    this.state = { isOn: true };
  }
```

Z toho vyplýva ďalšia otázka: prečo poskytujeme funkcii `super` parameter `props`?

---

Aby mohol konštruktor triedy `React.Component` nastaviť `this.props`, mali by sme poskytnúť [funkcii `super` parameter `props`](https://github.com/facebook/react/blob/1d25aa5787d4e19704c049c3cfa985d3b5190e0d/packages/react/src/ReactBaseClasses.js#L22):

```jsx
// Vo vnútri Reactu
class Component {
  constructor(props) {
    this.props = props;
    // ...
  }
}
```

Ale aj keby sme zavolali funkciu `super()` bez parametra `props`, stále by sme vedeli používať `this.props` v metódach ako je `render` a podobne. (Neveríte? Vyskúšajte to!)

Ako to je možné, že *to* funguje? **React nastavuje `props` hneď potom, ako použije *váš* konštruktor:**

```jsx
// Vo vnútri Reactu
const instance = new YourComponent(props);
instance.props = props;
```

Takže aj keď zabudneme poskytnúť `props` funkcii `super()`, React ich nastaví. Aj na to je dôvod.

Keď React pridal podporu pre triedy, nepridal podporu iba pre ES6. Cieľom bolo pridať podporu pre čo najviac abstrakcii triedy. A vtedy [nebolo jasné](https://reactjs.org/blog/2015/01/27/react-v0.13.0-beta-1.html#other-languages), ako úspešné budú jazyky ako sú ClojureScript, CoffeeScript, ES6, Fable, Scala.js alebo TypeScript. React bol zámerne nestranný, a nevyžadoval použitie funkcie `super()` — aj keď sú triedy štandardu ES6 iné.

Znamená to, že môžeme používať `super()` namiesto `super(props)`?

**Ani nie, pretože je to mätúce.** Áno, React nastaví `this.props` *potom*, ako bol váš konštruktor spustený. Lenže *od* zavolania funkcie `super` *až* po koniec konštruktora nebude `this.props` definovaný:

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

A je výzvou opraviť chybu, ktorá nastane, keď je nejaká funkcia volaná *v konštruktore*. **Práve preto vždy odporúčam používať `super(props)`:**

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

Je ešte jedna vec, o ktorú sa môžu zaujímať dlhodobí používatelia Reactu.

Mohli ste si všimnúť, že keď sa v triede použije Context API (či už pomocou zastaralého `contextTypes` alebo moderného `contextType`, pridaného vo verzii 16.6), `context` je druhým parametrom konštruktora.

Prečo teda nepoužívame `super(props, context)`? Môžeme, ale `context` sa nepoužíva až tak často.

**Vďaka vlastnostiam triedy je tento problém vyriešený.** Bez daného konštruktora sú všetky parametre dané rozširovanej triede. Kvôli tomu môže `state = {}` použiť `this.props` alebo `this.context`.

Keď používame funkciu Hooks, nepoužívame ani `super`, ani `this`. Ale to je téma do budúcna.
