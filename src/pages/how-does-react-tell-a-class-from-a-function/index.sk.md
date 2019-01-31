---
title: Ako vie React rozoznať triedu od funkcie?
date: '2018-12-02'
spoiler: V tomto článku hovorím o triedach, new, instanceof, sieti prototypov, a dizajne API.
---

Predstavme si komponentu `Greeting`, ktorá je definovaná ako funkcia:

```jsx
function Greeting() {
  return <p>Ahoj</p>;
}
```

Túto komponentu môžeme definovať aj ako triedu:

```jsx
class Greeting extends React.Component {
  render() {
    return <p>Ahoj</p>;
  }
}
```

([Donedávna](https://reactjs.org/docs/hooks-intro.html) to bol jediný spôsob, ako mohla komponenta udržiavať svoj vlastný stav.)

Ak chceme vykresliť `<Greeting />`, nás nezaujíma, ako je komponenta definovaná:

```jsx
// Buď trieda alebo funkcia
<Greeting />
```

Ale *samotný React* sa o to zaujíma!

Ak je `Greeting` funkcia, React ju musí zavolať:

```jsx
// Váš kód
function Greeting() {
  return <p>Ahoj</p>;
}

// Vo vnútri Reactu
const result = Greeting(props); // <p>Ahoj</p>
```

Ale ak je `Greeting` trieda, React ju musí inicializovať pomocou operátora `new` a *potom* spustiť metódu `render` v práve vytvorenej inštancii:

```jsx
// Váš kód
class Greeting extends React.Component {
  render() {
    return <p>Ahoj</p>;
  }
}

// Vo vnútri Reactu
const instance = new Greeting(props); // Greeting {}
const result = instance.render(); // <p>Ahoj</p>
```

V oboch prípadoch je cieľom Reactu sa dostať k vykreslenému objektu (`<p>Ahoj</p>`). Ale akým spôsobom, záleží od toho, ako je definovaný `Greeting`.

**Tak ako React vie, že či je niečo triedou alebo funkciou?**

Podobne, ako v mojom [predchazdajúcom príspevku](/why-do-we-write-super-props/), **tieto veci *nie sú* dôležité na to, aby ste boli produktívni pri používaní Reactu.** Ja sám som o tom nevedel niekoľko rokov. Prosím, nepýtajte sa to počas pohovoru. Popravde, tento príspevok je viac o JavaScripte než o Reacte.

Tento blog je pre zaujatého čitateľa, ktorý chce vedieť, *prečo* práve tak React funguje. Ste jedným z nich? Pozrime sa na to spolu.

**Pripravte sa, čaká nás dlhá cesta. Tento príspevok sa veľmi nezaoberá Reactom, ale pozrieme sa na `new`, `this`, `class`, skrátené funkcie, `prototype`, `__proto__`, `instanceof`, a ako všetky tie veci fungujú v JavaScripte. Našťastie, ak *používate* React, na to ani nemusíte myslieť. Ale ak chete implementovať React…**

(Ak chcete skrátenú odpoveď, prejdite ku koncu.)

----

Najprv musíme pochopiť prečo je dôležité rozoznať funkcie od tried. Všimnite si, ako sa počas inicializácie používa operátor `new`:

```jsx{5}
// Ak je Greeting funkcia
const result = Greeting(props); // <p>Ahoj</p>

// Ak je Greeting trieda
const instance = new Greeting(props); // Greeting {}
const result = instance.render(); // <p>Ahoj</p>
```

Pozrime sa, čo robí operátor `new` v JavaScripte.

---

Triedy sú v JavaScripte novinkou. Predtým, keď ste chceli niečo podobné, mohli ste urobiť z funkcie triedu tak, že **telo funkcie použijete ako konštruktor novej triedy, a pred názov funkcie dáte slovíčko `new`.**

```jsx
// Obyčajná funkcia
function Person(name) {
  this.name = name;
}

var jan = new Person('Ján'); // ✅ Person {name: 'Ján'}
var richard = Person('Richard'); // 🔴 To nepôjde
```

Aj teraz to môžete urobiť! Skúste si to v nástrojoch pre vývojárov. (DevTools / "Preskúmať prvok")

Ak spustíte `Person('Ján')` **bez** slovíčka `new`, `this` bude v tom kontexte niečo, čo vôbec nesúvisí s `Person` (napríklad `window` alebo `undefined`). Takže náš kód by buď nefungoval, alebo by urobil nejakú hlúposť a nastavil by `window.name`.

Ak pred spustením dáme slovíčko `new`, prikážeme JavaScriptu, aby predstieral, že `Person` je konštruktorom triedy, **a vytvorí prázdny objekt, nastaví `this` na ten objekt, nastaví `this.name` a vrátí ten upravený objekt.**

```jsx
var jan = new Person('Ján'); // Rovnaký objekt, aký je `this` vo funkcii `Person`
```

Taktiež operátor `new` nastaví premennú `jan` tak, aby mal prístup k `Person.prototype`:

```jsx{4-6,9}
function Person(name) {
  this.name = name;
}
Person.prototype.sayHi = function() {
  alert('Ahoj, volám sa ' + this.name);
}

var jan = new Person('Ján');
jan.sayHi();
```

Takto vývojári imitovali triedy, než boli podporované samotným JavaScriptom.

---

Takže operátor `new` je v JavaScripte už nejakú dobu. Ale triedy samy o sebe sú novinkou. Pomocou nich môžeme naznačiť náš zámer:

```jsx
class Person {
  constructor(name) {
    this.name = name;
  }
  sayHi() {
    alert('Ahoj, volám sa ' + this.name);
  }
}

let jan = new Person('Ján');
jan.sayHi();
```

Keď navrhujeme syntax a API, je dôležité myslieť aj na to, ako by vedel vývojár *naznačiť zámer kódu*.

Ak sa vytvorí funkcia, JavaScript nevie, že či je tá funkcia jednoduchá a má byť iba spustená ako `alert()`, alebo že či je tá funkcia v skutočnosti konštruktor triedy ako je `new Person()`. Ak niekto zabudne na slovíčko `new` pred funkciou ako je `Person`, môže to vyvolať zmätok.

**Syntaxou vieme naznačiť, že to nie je iba funkcia — ale trieda s konštruktorom.** Ak zabudneme na slovíčko `new`, JavaScript sa bude sťažovať:

```jsx
let jan = new Person('Ján');
// ✅ Ak je Person funkcia: funguje to
// ✅ Ak je Person trieda: stále to funguje

let richard = Person('Richard'); // Zabudli sme na `new`
// 😳 Ak je Person funkcia podobná triede: zmätok
// 🔴 Ak je Person trieda: nebude to fungovať
```

Vďaka tomu vieme zistiť chyby skôr, než narazíme na nejaký divný problém, kde `this.name` je v skutočnosti `window.name`, a nie `richard.name`.

To znamená, že React musí použiť slovíčko `new` predtým, než vytvorí inštanciu triedy. Nemôže ju použiť ako obyčajnú funkciu, pretože JavaScript by to bral ako chybu!

```jsx
class Counter extends React.Component {
  render() {
    return <p>Ahoj</p>;
  }
}

// 🔴 To sa nesmie:
const instance = Counter(props);
```

To by bol prúser.

---

Predtým, než sa pozrieme na to, ako to rieši React, je dôležité vedieť, že väčšina ľudí používa nástroje, ako je Babel, aby mohli používať moderné funkcie v starších prehliadačoch. Takže musíme brať do úvahy aj kompilátory.

V prvých verziách Babelu mohli byť triedy spustené bez použitia `new`. Samozrejme, tá chyba bola opravená — stačilo pridať kód navyše:

```jsx
function Person(name) {
  // Skrátená verzia výstpného kódu:
  if (!(this instanceof Person)) {
    throw new TypeError("Cannot call a class as a function");
    // "Nemožno spustiť triedu ako funkciu"
  }
  // Náš kód:
  this.name = name;
}

new Person('Ján'); // ✅
Person('Richard');   // 🔴 Cannot call a class as a function
``` 

Podobný kód ste mohli vidieť aj vo výstupe kompilátora. Práve to robí funkcia `_classCallCheck`. (Môžete zmenšiť veľkosť výstupu pomocou voľného režimu (loose mode), ktorý síce nepridáva žiadne kontroly, ale môže skomplikovať prechod na skutočné triedy.)

---

Teraz by ste mali vedieť rozdiel medzi použitím `new` a *ne*použitím `new`:

|  | `new Person()` | `Person()` |
|---|---|---|
| `class` | ✅ `this` je inštancia objektu `Person` | 🔴 `TypeError`
| `function` | ✅ `this` je inštancia objektu `Person` | 😳 `this` je `window`/`undefined` |

Práve preto je dôležité, aby React vedel spustiť komponentu napriamo. **Ak je váša komponenta definovaná ako trieda, React musí pred jej spustením použiť `new`.**

Vie React zistiť, že či je niečo trieda alebo nie?

Nie je to také jednoduché. Aj keď [v JavaScripte vieme rozlíšiť triedu od funkcie](https://stackoverflow.com/questions/29093396/how-do-you-check-the-difference-between-an-ecmascript-6-class-and-function), nefunguje to pre triedy, ktoré boli spracované nástrojmi ako sú Babel. Prehliadač si myslí, že sú to obyčajné funkcie. React má smolu.

---

Dobre, môže React používať `new` pred každým spustením? Bohužiaľ, nie vždy.

Keď spustíme obyčajnú funkciu pomocou `new`, získame inštanciu objektu. To chceme pri funkciách, ktoré sú v skutočnosti konštruktorom (akou je už spomínaný `Person`), ale bolo by to mätúce v prípade komponentov, ktoré sme definovali ako funkcie:

```jsx
function Greeting() {
  // Neočákava sa, že tu bude `this` nejakou inštanciou
  return <p>Ahoj</p>;
}
```

Aj to by sa ešte dalo tolerovať. Ale existujú *ďalšie* dva dôvody, prečo to nie je dobrý nápad.

---

Prvým dôvodom je, že by operátor `new` nefungoval v skutočných skrátených funkciách (nie tie, ktoré boli kompilované Babelom). Ich spustenie s operátorom `new` vyhodí chybu:

```jsx
const Greeting = () => <p>Ahoj</p>;
new Greeting(); // 🔴 Greeting is not a constructor ("Greeting nie je konštruktor")
```

To nie je chyba, ale vlastnosť skrátených funkcií. Jednou z výhod skrátených funkcií je, že nemá svoje vlastné `this` — namiesto toho preberá `this` od jej najbližšej funkcie:

```jsx{2,6,7}
class Friends extends React.Component {
  render() {
    const friends = this.props.friends;
    return friends.map(friend =>
      <Friend
        // `this` je z metódy `render`
        size={this.props.size}
        name={friend.name}
        key={friend.id}
      />
    );
  }
}
```

Dobre, takže **skrátené funkcie nemajú svoje vlastné `this`.** To ale znamená, že sú nepoužiteľné ako konštruktor!

```jsx
const Person = (name) => {
  // 🔴 To nedáva zmysel!
  this.name = name;
}
```

Práve preto **JavaScript nedovolí spustenie skrátenej funkcie so slovíčkom `new`.** Ak sa to stane, je šanca, že už ste aj tak spravili chybu, a je najlepšie sa o chybách dozvedieť čo najskôr. Z podobného dôvodu JavaScript nedovolí spustiť triedu *bez* `new`.

Skvelé, ale to nám kazí plány. React nemôže používať `new` na všetko, pretože potom nemôžeme používať skrátené funkcie! Aj keď vieme zistiť, že či je nejaká funkcia skrátená, lebo ony nemajú `prototype`:

```jsx
(() => {}).prototype // undefined
(function() {}).prototype // {constructor: f}
```

Ale to [nebude fungovať](https://github.com/facebook/react/issues/4599#issuecomment-136562930) pre funkcie skompilované pomocou nástrojov ako je Babel. Aj keď to nie je až taký problém, je aj ďalší dôvod, prečo to React nemôže robiť.

---

Posledným dôvodom je, že by React nemohol podporovať komponenty, ktoré vracajú reťazce alebo iné jednoduché hodnoty.

```jsx
function Greeting() {
  return 'Ahoj';
}

Greeting(); // ✅ 'Ahoj'
new Greeting(); // 😳 Greeting {}
```

A to je kvôli tomu, lebo [operátor `new`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/new) vytvára objekt, ktorý bude vo funkcii ako `this`, a vracia nám ten objekt.

Avšak funkcia, ktorá bola spustená pomocou `new` môže *určiť* objekt, ktorý bude vo funkcii definovaný ako `this`. Je to užitočné v prípadoch ako je "pooling," kde jeden objekt môže byť použitý viackrát.

```jsx{1-2,7-8,17-18}
// Hodnota bude nastavená neskôr
var zeroVector = null;

function Vector(x, y) {
  if (x === 0 && y === 0) {
    if (zeroVector !== null) {
      // Použi už vytvorenú objekt
      return zeroVector;
    }
    zeroVector = this;
  }
  this.x = x;
  this.y = y;
}

var a = new Vector(1, 1);
var b = new Vector(0, 0);
var c = new Vector(0, 0); // 😲 b === c
```

Ale `new` *ignoruje* vrátenú hodnotu, ak tá hodnota *nie* je objektom. Ak funkcia vráti reťazec alebo číslo, `new` sa tvári, ako keby funkcia nevrátila nič.

```jsx
function Answer() {
  return 42;
}

Answer(); // ✅ 42
new Answer(); // 😳 Answer {}
```

Neexistuje žiaden spôsob, ako získať jednoduchú hodnotu (ako je číslo alebo reťazec) z funkcie, ktorá bola spustená pomocou `new`. Takže ak React by stále používal `new`, nemohol by pridať podporu pre komponenty, ktoré vracajú reťazce.

To nie je prijateľné a práve preto potrebujeme nájsť kompromis.

---

Čo sme sa teda naučili? React potrebuje spustiť triedy (vrátane výstupu z Babelu) *pomocou* `new`, ale funkcie, či obyčajné alebo skrátene, *bez* `new`. A neexistuje žiaden spoľahlivý spôsob, ako ich rozlíšiť.

**Ak teda nevieme vyriešiť všeobecný problém, čo tak vyriešiť nejaký špecifický?**

Ak definujete komponentu ako triedu, je šanca, že kvôli metódam ako je `this.setState()` rozšírite celú triedu `React.Component`. **Čo keby namiesto toho, aby sme skúšali zistiť, že či je niečo trieda, by sme zisťovali, že či komponent rozširuje `React.Component`?**

Spoiler: práve to React robí.

---

Najlepším spôsobom, ako zistiť, že či je `Greeting` React komponenta vytvorená pomocou triedy je, že či `Greeting.prototype instanceof React.Component` vracia `true`:

```jsx
class A {}
class B extends A {}

console.log(B.prototype instanceof A); // true
```

Viem, čo si práve myslíte. Čo sa to práve deje?! Aby bola odpoveď jasná, potrebujeme pochopiť, ako fungujú prototypy v JavaScripte.

Určite ste počuli o "sieti prototypov." Každý objekt v JavaScripte má svoj "prototyp." Keď napíšeme `jan.sayHi()`, ale `jan` nemá vlastnosť `sayHi`, budeme ju hladať v prototype objektu `jan`. Ak ju nenájdeme ani tam, pozrieme sa na ďalší prototyp v sieti — prototyp prototypu objektu `jan`. A tak ďalej.

**Avšak vlastnosť `prototype` *nie je* prototypom triedy alebo funkcie.** Nie, nerobím si srandu.

```jsx
function Person() {}

console.log(Person.prototype); // 🤪 Nie je prototyp objektu Person
console.log(Person.__proto__); // 😳 Prototyp objektu Person
```

Takže tá "sieť prototypov" je skôr `__proto__.__proto__.__proto__`, než `prototype.prototype.prototype`. Trvalo mi to niekoľko rokov, než som to pochopil.

Čo znamená vo funkcii alebo v triede vlastnosť `prototype`? **Je to vlastne vlastnosť, ktorá je v inicializovaných objektoch nastavená ako `__proto__`!**

```jsx{8}
function Person(name) {
  this.name = name;
}
Person.prototype.sayHi = function() {
  alert('Ahoj, volám sa ' + this.name);
}

var jan = new Person('Ján'); // Nastaví `jan.__proto__` na `Person.prototype`
```

JavaScript získava vlastnosti práve cez `__proto__`:

```jsx
jan.sayHi();
// 1. Má jan vlastnosť sayHi? Nie.
// 2. Má jan.__proto__ vlastnosť sayHi? Áno. Spusti ju!

jan.toString();
// 1. Má jan vlastnosť toString? Nie.
// 2. Má jan.__proto__ vlastnosť toString? Nie.
// 3. Má jan.__proto__.__proto__ vlastnosť toString? Áno. Spusti ju!
```

V skutočnosti by ste nemali používať `__proto__`. Jedine ak hľadáte nejakú chybu, ktorá súvisí so sieťou prototypov. Ak chcete mať nejaké vlastnosti v `jan.__proto__`, mali by byť v `Person.prototype`. Aspoň to tak bolo pôvodne myslené.

Vlastnosť `__proto__` vlastne nemala byť dostupná používateľom, pretože sieť prototypov bol považovaný za vnútorný koncept. Ale niektoré prehliadače pridali pre ňu podporu a vlastnosť bola štandardizovaná. (Ale je považovaná za zastaralú, a mala by sa používať funkcia `Object.getPrototypeOf()`.)

**Stále nechápem prečo vlastnosť, ktorá sa nazýva `prototype` nevracia prototyp danej hodnoty** (v tomto prípade `jan.prototype` nie je definovaný, pretože `jan` nie je funkcia). Ja si myslím, že toto je najväčším dôvodom prečo aj väčšina skúsených vývojárov nerozumie prototypom v JavaScripte.

---

Ten príspevok je ale dlhý. Ale už sme na konci. To dáte.

Keď spustíme `obj.foo`, JavaScript bude hľadať `foo` v premenných `obj`, `obj.__proto`, `obj.__proto__.__proto__`, a tak ďalej.

Aj keď sa pomocou tried priamo nepripájate do siete, `extends` vo vnútri stále funguje na starej známej sieti prototypov. Vďaka tomu má komponenta v Reacte, ktorá bola vytvorená pomocou triedy prístup k metódam ako je `setState`:

```jsx{1,9,13}
class Greeting extends React.Component {
  render() {
    return <p>Ahoj</p>;
  }
}

let c = new Greeting();
console.log(c.__proto__); // Greeting.prototype
console.log(c.__proto__.__proto__); // React.Component.prototype
console.log(c.__proto__.__proto__.__proto__); // Object.prototype

c.render();      // Nájdené v c.__proto__ (Greeting.prototype)
c.setState();    // Nájdené v c.__proto__.__proto__ (React.Component.prototype)
c.toString();    // Nájdené v c.__proto__.__proto__.__proto__ (Object.prototype)
```

Inými slovami, **hierarchia triedy je podobná sieti prototypov:**

```jsx
// sieť rozširovania triedy cez `extends`
Greeting
  → React.Component
    → Object (implicitly)

// sieť prototypov
new Greeting()
  → Greeting.prototype
    → React.Component.prototype
      → Object.prototype
```

---

Pretože sieť prototypov odzrkadľuje hierarchiu tried, máme možnosť zistiť, že či `Greeting` rozširuje `React.Component` tak, že začneme od `Greeting.prototype` a pokračujeme cez sieť prototypov:

```jsx{3,4}
// `__proto__` chain
new Greeting()
  → Greeting.prototype // 🕵️ Začíname
    → React.Component.prototype // ✅ Tu je!
      → Object.prototype
```

Našťastie, `x instanceof Y` robí presne to isté. Hľadá `Y.prototype` v sieti prototypov `x.__proto__`.

Obyčajne sa ten kód používa na to, aby sa zistilo, že či je niečo inštanciou triedy:

```jsx
let greeting = new Greeting();

console.log(greeting instanceof Greeting); // true
// greeting (🕵️‍ Začíname)
//   .__proto__ → Greeting.prototype (✅ Tu je!)
//     .__proto__ → React.Component.prototype 
//       .__proto__ → Object.prototype

console.log(greeting instanceof React.Component); // true
// greeting (🕵️‍ Začíname)
//   .__proto__ → Greeting.prototype
//     .__proto__ → React.Component.prototype (✅ Tu je!)
//       .__proto__ → Object.prototype

console.log(greeting instanceof Object); // true
// greeting (🕵️‍ Začíname)
//   .__proto__ → Greeting.prototype
//     .__proto__ → React.Component.prototype
//       .__proto__ → Object.prototype (✅ Tu je!)

console.log(greeting instanceof Banana); // false
// greeting (🕵️‍ Začíname)
//   .__proto__ → Greeting.prototype
//     .__proto__ → React.Component.prototype 
//       .__proto__ → Object.prototype (🙅‍ Nenašli sme!)
```

Ale funguje aj v prípadoch, keď chceme zistiť, že či trieda rozširuje inú triedu:

```jsx
console.log(Greeting.prototype instanceof React.Component);
// greeting
//   .__proto__ → Greeting.prototype (🕵️‍ Začíname)
//     .__proto__ → React.Component.prototype (✅ Tu je!)
//       .__proto__ → Object.prototype
```

A takto vieme zistiť, že či je React komponenta trieda alebo obyčajná funkcia.

---

Dobre, v skutočnosti React nepoužíva toto riešenie. 😳

Problém s takýmto riešením je, že nefunguje ak je na stránke viac verzií Reactu, a komponenta, ktorú kontrolujeme, rozširuje `React.Component` *inej* verzie Reactu. Nie je dobré miešať viacero verzií Reactu z rôznych dôvodov, ale snažíme sa vyhnúť čo najviac možným chybám. (S funkciou Hooks ale budeme ale musieť [vynútiť používanie iba jednej verzie](https://github.com/facebook/react/issues/13991))

Mohli by sme skontrolovať, že či je v prototype metóda `render`. Ale vtedy [nebolo jasné](https://github.com/facebook/react/issues/4599#issuecomment-129714112), že ako sa vyvinie API komponentu. Každá kontrola stojí niečo, a nechceli sme pridávať viac ako jednu. Taktiež by to nefungovalo, ak je metóda `render` definovaná ako metóda inštancie, ako je v prípade kódu s vlastnosťami triedy.

Namiesto toho React [pridal](https://github.com/facebook/react/pull/4663) značku do základnej triedy. React skontroluje, že či tá komponenta má značku, a tak React vie, že či je niečo React komponenta definovaná pomocou triedy alebo nie.

Najprv bola tá značka v samotnej triede `React.Component`:

```jsx
// Vo vnútri Reactu
class Component {}
Component.isReactClass = {};

// Takto môžeme skontrolovať jej existenciu
class Greeting extends Component {}
console.log(Greeting.isReactClass); // ✅ Áno
```

Avšak niektoré implementácie, na ktoré sme mysleli, [nekopírovali](https://github.com/scala-js/scala-js/issues/1900) statické vlastnosti (alebo nenastavovali `__proto__`), takže tá značka začala miznúť.

To je dôvod, prečo v Reacte bola táto značka [presunutá](https://github.com/facebook/react/pull/5021) do `React.Component.prototype`:

```jsx
// Vo vnútri Reactu
class Component {}
Component.prototype.isReactComponent = {};

// Takto môžeme skontrolovať jej existenciu
class Greeting extends Component {}
console.log(Greeting.prototype.isReactComponent); // ✅ Áno
```

**A to je doslova všetko.**

Možno premýšľate nad tým, že prečo je táto vlastnosť objektom, a nie binárnou hodnotou. V skutočnosti je to jedno, ale v skorších verziách testovacieho frameworku Jest (predtým, než bol Jest vôbec dobrý™) bolo automatické simulovanie objektov automaticky zapnuté. Simulované objekty nemali v sebe vlastnosti s jednoduchými hodnotami, [a tak tá kontrola nefungovala vôbec](https://github.com/facebook/react/pull/4663#issuecomment-136533373). Díky, Jest.

V Reacte sa táto kontrola [používa doteraz](https://github.com/facebook/react/blob/769b1f270e1251d9dbdce0fcbd9e92e502d059b8/packages/react-reconciler/src/ReactFiber.js#L297-L300).

Ak nerozšírite `React.Component`, v prototype nebude `isReactComponent`, a nebude si myslieť, že táto komponenta je definovaná pomocou triedy. Teraz viete, prečo riešenie na chybu `Cannot call a class as a function` je použiť `extends React.Component`. [Táto odpoveď má v Stack Overflow najviac hlasov.](https://stackoverflow.com/a/42680526/458193) Nakoniec bolo [pridané upozornenie](https://github.com/facebook/react/pull/11168), ktoré sa objaví, ak existuje `prototype.render`, ale nie `prototype.isReactComponent`.

---

Možno si myslíte, že tým príbehom som vás nejako oklamal. **V skutočnosti je to riešenie dosť jednoduché, ale taktiež som vám vysvetlil *prečo* React používa takéto riešenie, a aké boli iné možnosti.**

Podľa vlastných skúsenosti vám viem povedať, že toto je stály problém s API knižníc. Aby sa API používalo jednoducho, taktiež potrebujete myslieť na rôzne vlastnosti jazyka (alebo jazykov, vrátane ich vízie), ich výkon, "ergonómiu" používania bez aj s kompiláciou, stav ekosystému a rôznych riešení systémov na inštaláciu závislostí, skoré upozornenia, atď. Konečný výsledok nemusí byť vždy elegantný, ale musí byť praktický.

**Aby bolo konečné API úspešné, *užívatelia* nemusia myslieť na ten proces.** Namiesto toho môžu tvoriť aplikácie.

Ale ak ste zvedavý… je dobré vedieť, ako to funguje.
