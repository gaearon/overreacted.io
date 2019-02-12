---
title: Zašto pišemo super(props)?
date: '2018-11-30'
spoiler: Ima jedan obrt na kraju.
---


Čuo sam da su [hukovi](https://reactjs.org/docs/hooks-intro.html) sada u modi. Ironično je, ali hoću da započnem ovaj blog pričom o zanimljivim stvarima vezanim za *klasne* komponente. Ma vidi ti to!

**Ove smicalice *nisu* važne za produktivnost u React-u. Ali možda vam bude zabavno da malo dublje pročačkate kako stvari rade.**

Evo prve.

---

Napisao sam `super(props)` više puta u životu nego što bih hteo da znam:

```jsx{3}
class Checkbox extends React.Component {
  constructor(props) {
    super(props);
    this.state = { isOn: true };
  }
  // ...
}
```

Naravno, [predlog o poljima klase (class fields)](https://github.com/tc39/proposal-class-fields) nam omogućava da preskočimo ovu ceremoniju:

```jsx
class Checkbox extends React.Component {
  state = { isOn: true };
  // ...
}
```

Ovakva sintaksa je bila [planirana](https://reactjs.org/blog/2015/01/27/react-v0.13.0-beta-1.html#es7-property-initializers) kada je 2015. godine u verziji 0.13 dodata podrška za obične klase. Definisanje konstruktora i poziv `super(props)` je oduvek i trebalo da bude samo privremeno rešenje, dok polja klase ne postanu zadovoljavajuća alternativa.

Ali da se vratimo na ovaj primer koji koristi samo stvari iz ES2015:

```jsx{3}
class Checkbox extends React.Component {
  constructor(props) {
    super(props);
    this.state = { isOn: true };
  }
  // ...
}
```

**Zašto zovemo `super`? Da li možemo da ga *ne* pozovemo? Ako moramo, šta se desi kad ne prosledimo `props`? Ima li još argumenata?** Hajde da vidimo.

---

U JavaSkriptu, `super` pokazuje na konstruktor roditeljske klase. (U našem primeru, pokazuje na implementaciju `React.Component`).

Važno je obratiti pažnju na to da `this` ne može da se koristi u konstrukturu sve dok se ne pozove *roditeljski* konstruktor. JavaSkript neće da vam dozvoli to:

```jsx
class Checkbox extends React.Component {
  constructor(props) {
    // 🔴 Još ne smemo da koristimo `this`
    super(props);
    // ✅ Ali sad je okej
    this.state = { isOn: true };
  }
  // ...
}
```

Postoji dobar razlog zašto JavaSkript primorava pozivanje roditeljskog konstruktora pre nego što se petlja oko `this`-a. Zamislite ovakvu hijerarhiju:

```jsx
class Osoba {
  constructor(ime) {
    this.ime = ime;
  }
}

class UčtivaOsoba extends Osoba {
  constructor(ime) {
    this.pozdraviKolege(); // 🔴 Ovo nije dozvoljeno, vidi dole zašto
    super(ime);
  }
  pozdraviKolege() {
    alert('Dobro jutro, narode!');
  }
}
```

Zamislimo da `this` pre `super` ipak *jeste* dozvoljeno. Mesec dana kasnije, možda promenimo `pozdraviKolege` da sadrži i ime osobe u poruci:

```jsx
  pozdraviKolege() {
    alert('Dobro jutro, narode!');
    alert('Ja sam ' + this.ime + ', drago mi je!');
  }
```

Ali zaboravili smo da se `this.pozdraviKolege()` zove pre nego što poziv funkcije `super()` stigne da postavi `this.ime`. Znači da `this.ime` još nije ni definisano! Kao što vidite, o ovakvom kodu je jako teško razmišljati.

Da se ne bismo opekli, **JavaSkript nas *tera* prvo da pozovemo `super`, ako hoćemo da koristimo `this` u konstruktoru.** Neka roditelj prvo obavi svoje! A ovo ograničenje važi i za React komponente definisane kao klase:

```jsx
  constructor(props) {
    super(props);
    // ✅ Ovde ispod možemo da koristimo `this`
    this.state = { isOn: true };
  }
```

Ali i dalje je ostalo jedno pitanje: zašto prosleđujemo `props`?

---

Možda se čini da je prosleđivanje `props`-a `super`-u obavezno da bi konstruktor osnovne klase `React.Component` mogao da inicijalizuje `this.props`:

```jsx
// React-ov kôd
class Component {
  constructor(props) {
    this.props = props;
    // ...
  }
}
```

I to nije daleko od istine: tako i [radi](https://github.com/facebook/react/blob/1d25aa5787d4e19704c049c3cfa985d3b5190e0d/packages/react/src/ReactBaseClasses.js#L22).

Ali nekako, čak i kad pozovete `super()` bez argumenta `props`, i dalje možete da pripstupite `this.props` u `render`-u i drugim metodama. (Ako mi ne verujete, probajte sami!)

A kako *to* radi? Ispostavlja se da **i React dodeljuje `props` instanci odmah nakon što pozove *vaš* konstruktor:**

```jsx
  // React-ov kôd
  const instance = new VašaKomponenta(props);
  instance.props = props;
```

Prema tome, čak i da zaboravite da prosledite `props` kad zovete `super()`, React će ih ipak dobro postaviti kasnije. A postoji i razlog za to.

Kad je React dodao podršku za klase, nije dodao podršku samo za ES6 klase. Cilj je bio najširi mogući opseg apstrakcija klasa. [Nije bilo jasno](https://reactjs.org/blog/2015/01/27/react-v0.13.0-beta-1.html#other-languages) koliko će uspešna biti rešenja za definisanje komponenti kao što su ClojureScript, CoffeeScript, ES6, Fable, Scala.js, TypeScript, i druga. Zato React namerno nije donosio odluku o tome da li se `super()` mora pozvati ili ne (iako je poziv obavezan kod ES6 klasa).

Da li to onda znači da možete da napišete `super()` umesto `super(props)`?

**Verovatno ne jer je i dalje zbunjujuće.** Da, React će *nakon* izvršetka vašeg konstruktora da izvrši dodelu u `this.props`. Ali `this.props` će i dalje biti nedefinisano *između* poziva `super` i kraja konstruktora:

```jsx{14}
// React-ov kod
class Component {
  constructor(props) {
    this.props = props;
    // ...
  }
}

// Inside your code
class Button extends React.Component {
  constructor(props) {
    super(); // 😬 Zaboravili smo na props
    console.log(props);      // ✅ {}
    console.log(this.props); // 😬 undefined 
  }
  // ...
}
```

Ovo može biti još teže za debagiranje ako se desi u nekoj metodi koju *zove* konstruktor. **I zato se uvek preporučuje da se prosledi `super(props)`, iako nije striktno obavezno:**

```jsx
class Button extends React.Component {
  constructor(props) {
    super(props); // ✅ Prosledili smo props
    console.log(props);      // ✅ {}
    console.log(this.props); // ✅ {}
  }
  // ...
}
```

Ovim smo se osigurali da je `this.props`-u dodeljena vrednost čak i pre nego što se izađe iz konstruktora.

---

Ima još jedna stvar koja možda zanima one koji React koriste duže vreme.

Možda ste primetili da, kada koristite Context API u klasama (bilo sa zaostavštinom `contextTypes` ili sa modernim `contextType` API-jem dodatim u verziji 16.6), `context` se prosleđuje kao drugi agrument konstruktora.

Zašto onda ne pišemo `super(props, context)`? Mogli bismo, ali kontekst se koristimo mnogo ređe pa se cela ova zavrzlama ređe dešava.

**Sve to svakako nestaje kad se uzme u obzir predlog o poljima klase.** Bez eksplicitnog konstruktora, svi argumenti se automatski prosleđuju. Ovo omogućava da izrazi kao `state = {}` uključe reference na `this.props` ili `this.context` ako je to neophodno.

Sa hukovima, nemamo ni `super` ni `this`. Ali to je priča za drugi put.
