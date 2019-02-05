---
title: Proč používáme super(props)?
date: '2018-11-30'
spoiler: Konec bude překvapující.
---

Prý je funkce [Hooks](https://reactjs.org/docs/hooks-intro.html) v Reactu cool. Ale blog začínam vysvětlením jak fungují komponenty vytvořené pomocí *třídy*.

**Tyto věci *nejsou* důležité k tomu, abyste byli produktivní při používání Reactu, ale budete rádi, když jim porozumíte.**

Tady je první příspěvek.

---

Do kódu jsem napsal `super(props)` tolikrát, že už to ani nespočítam:

```jsx{3}
class Checkbox extends React.Component {
  constructor(props) {
    super(props);
    this.state = { isOn: true };
  }
  // ...
}
```

Samozřejmě, nemusíme to dělat, když použijeme [vlastnosti třídy](https://github.com/tc39/proposal-class-fields):

```jsx
class Checkbox extends React.Component {
  state = { isOn: true };
  // ...
}
```

Syntaxe podobná tomuto byla [plánována](https://reactjs.org/blog/2015/01/27/react-v0.13.0-beta-1.html#es7-property-initializers) již s Reactem verze 0.13, který přidal podporu pro třídy v roce 2015. Použití konstruktoru a `super(props)` bylo jen dočasným řešením dokud vlastnosti tříd neposkytly pohodlnější alternativu.

Ale vraťme se k příkladu, který používá jenom funkce standardu ES2015:

```jsx{3}
class Checkbox extends React.Component {
  constructor(props) {
    super(props);
    this.state = { isOn: true };
  }
  // ...
}
```

**Proč vlastně používame funkci `super`? Můžeme ji *ne*používat? Pokud ji musíme používat, co se stane když jí neposkytneme `props`? Používají se i jiné parametry?** Podívejme se na to…

---

V JavaScriptu je funkce `super` konstruktorem třídy, kterou rozširujeme. (V tomto případě se jedná o implementaci `React.Component`.)

Je důležité vědět, že v konstruktoru nemůžeme používat `this` *do* té doby, než použijeme funkci `super`:

```jsx
class Checkbox extends React.Component {
  constructor(props) {
    // 🔴 Nemůžeme používat `this`
    super(props);
    // ✅ Můžeme používat `this`
    this.state = { isOn: true };
  }
  // ...
}
```

Existuje dobrý důvod, proč JavaScript chce, abychom zavolali konstruktor rozšiřované třídy předtím, než použijeme `this`. Představme si hierarchii:

```jsx
class Person {
  constructor(name) {
    this.name = name;
  }
}

class PolitePerson extends Person {
  constructor(name) {
    this.greetColleagues(); // 🔴 To se nesmí
    super(name);
  }
  greetColleagues() {
    alert('Dobrý den, přátelé!');
  }
}
```

Teď si představme, že použijeme `this` před funkcí `super`. O měsic později chceme změnit funkci `greetColleagues` tak, aby ve zprávě bylo jméno dotyčné osoby:

```jsx
  greetColleagues() {
    alert('Dobrý den, přátelé!');
    alert('Těší mě, jmenuji se ' + this.name + '!');
  }
```

Do té doby jsme už i zapomněli, že funkce `this.greetColleagues()` byla použitá předtím, než funkce `super()` definovala `this.name`. To znamená, že vlastnost `this.name` není definovaná! Jak vidíte, při takovém kódu se velmi těžce přemýšlí.

Proto **JavaScript chce, abychom zavolali `super` *předtím*, než použijeme `this`.** Ať si třída, která byla rozšířená, dělá co jen chce! To omezení platí i na komponenty, které jsou definované pomocí třídy:

```jsx
  constructor(props) {
    super(props);
    // ✅ Teď můžeme používat `this`
    this.state = { isOn: true };
  }
```

Z toho vyplývá další otázka: proč poskytujeme funkci `super` parametr `props`?

---

Aby mohl konstruktor třídy `React.Component` nastavit `this.props`, měli bychom poskytnout [funkci `super` parametr `props`](https://github.com/facebook/react/blob/1d25aa5787d4e19704c049c3cfa985d3b5190e0d/packages/react/src/ReactBaseClasses.js#L22):

```jsx
// Inside React
class Component {
  constructor(props) {
    this.props = props;
    // ...
  }
}
```

Ale i kdybychom zavolali funkci `super()` bez parametru `props`, stále můžeme používat `this.props` v metodách jako je `render` a podobně. (Nevěříte? Vyzkoušejte to!)

Jak je možné, že *to* funguje? **React nastavuje `props` hned poté, jak použije kontruktor *vašeho* komponentu:**

```jsx
// Pod kapotou Reactu
const instance = new YourComponent(props);
instance.props = props;
```

Takže i když zapomeneme poskytnout `props` funkci `super()`, React je nastaví. I na to je důvod:

Když React přidal podporu pro třídy, nepřidal podporu jenom pro ES6. Cílem bylo přidat podporu pro co nejvíc abstrakcí třídy. A tehdy [nebylo jasné](https://reactjs.org/blog/2015/01/27/react-v0.13.0-beta-1.html#other-languages), jak úspěšné budou jazyky jako jsou ClojureScript, CoffeeScript, ES6, Fable, Scala.js nebo TypeScript. React byl záměrně nestranný, a nevyžadoval použití funkce `super()` — i když jsou třídy standardu ES6 jiné.

Znamená to, že můžeme použít `super()` namísto `super(props)`?

**Ani ne, protože je to matoucí.** Ano, React sice nastaví `this.props` *poté*, co byl váš konstruktor spuštěný. Jenže *od* zavolání funkce `super` *až* po konec konstruktora nebude `this.props` definovaný:

```jsx{14}
// Pod kapotou Reactu
class Component {
  constructor(props) {
    this.props = props;
    // ...
  }
}

// Ve vašem kódu
class Button extends React.Component {
  constructor(props) {
    super(); // 😬 Zapomněli jsme na props
    console.log(props);      // ✅ {}
    console.log(this.props); // 😬 undefined 
  }
  // ...
}
```

A je výzvou opravit chybu, která nastane když je funkce volaná *v konstruktoru*. **Právě proto vždy doporučuji používat `super(props)`:**

```jsx
class Button extends React.Component {
  constructor(props) {
    super(props); // ✅ Poskytli jsme props
    console.log(props);      // ✅ {}
    console.log(this.props); // ✅ {}
  }
  // ...
}
```

Díky tomu bude `this.props` dostupný ještě předtím, než bude konstruktor ukončený.

-----

Je tu ještě jedna věc, o kterou se můžou zajímat dlouhodobí uživatelé Reactu.

Mohli jste si všimnout, že když se ve třídě použije Context API (jestli už pomocí zastaralého `contextTypes`, nebo moderního `contextType`, přidaného ve verzi 16.6), `context` je druhým parametrem konstruktora.

Proč teda nepoužívame `super(props, context)`? Můžeme, ale `context` se nepoužíva až tak často.

**Díky vlastnostem třídy je tento problém vyřešený.** Bez daného konstruktora jsou všechny parametry dané rozšiřované třídě. Kvůli tomu může `state = {}` použít `this.props` nebo `this.context`.

Když používame funkci Hooks, nepoužívame ani `super`, ani `this`. Ale to je téma do budoucna.
