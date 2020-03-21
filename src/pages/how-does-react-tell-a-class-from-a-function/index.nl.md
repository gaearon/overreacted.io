---
title: Hoe onderscheidt React een class van een functie?
date: '2018-12-02'
spoiler: We praten over classes, new, instanceof, prototype chains, en API design.
---

Neem deze `Greeting` component, gedefinieerd als functie:

```jsx
function Greeting() {
  return <p>Hello</p>;
}
```

Als we deze als class zouden definiëren zou dit geen probleem zijn voor React:

```jsx
class Greeting extends React.Component {
  render() {
    return <p>Hello</p>;
  }
}
```

(Dit was [tot kort geleden](https://reactjs.org/docs/hooks-intro.html) bijvoorbeeld de enige manier om ‘state’ te gebruiken.)

Nu is het begrijpelijk dat het voor jou niet veel uitmaakt hoe je `<Greeting />` definieert. Zolang het maar werkt:

```jsx
// Class of functie — wat maakt het uit.
<Greeting />
```

Echter, voor React maakt het wel uit!

Als `Greeting` namelijk een functie is, moet React deze eerst aanroepen voordat het goed werkt:

```jsx
// Jouw code
function Greeting() {
  return <p>Hello</p>;
}

// In React
const result = Greeting(props); // <p>Hello</p>
```

Echter, als `Greeting` een class is moet React deze eerst initialiseren met de `new` operator om daarna de render method aan te roepen binnen de zojuist gecreëerde instantie van `Greeting`:

```jsx
// Jouw code
class Greeting extends React.Component {
  render() {
    return <p>Hello</p>;
  }
}

// In React
const instance = new Greeting(props); // Greeting {}
const result = instance.render(); // <p>Hello</p>
```

In beide gevallen heeft React als doel om de node te renderen (in dit voorbeeld `<p>Hello</p>`). Echter, de manier waarop React daarvoor te werk moet gaan is afhankelijk van de manier waarop `Greeting` is gedefinieerd.

**Dus, hoe weet React of iets een class of een functie is?**

Zoals ik in [mijn vorige blogpost](/why-do-we-write-super-props/) al vertelde: **hoe React dit doet is geen kennis die je *nodig* hebt om goed te kunnen werken met React.** Zelf wist ik dit ook jarenlang niet. Ik zou het dan ook zeker niet aan iemand vragen tijdens een interview. Deze blogpost gaat om heel eerlijk te zijn eigenlijk ook meer over JavaScript dan over React.

Dus, ben jij een nieuwsgierige lezer die wil weten *waarom* React op een bepaalde manier werkt? Laten we er dan snel in duiken.

**Bereid je voor... Dit is een lang verhaal waarbij ik het vooral ga hebben over JavaScript en niet over React. Ik bespreek wel een aantal aspecten rondom `new`, `this`, `class`, `arrow functions`, `prototype`, `__proto__`, `instanceof` en de manier waarop deze samenwerken in JavaScript. Gelukkig hoef je niet veel na te denken over die dingen als je React *gebruikt*. Echter, als je React implementeert…**

(Als je gewoon wil weten hoe React het verschil tussen een class en functie weet kan je ook gewoon naar het einde scrollen.)

----

Om te beginnen moeten we begrijpen waarom het belangrijk is om het verschil tussen functies en classes te weten. Beide worden namelijk anders behandeld. Zie hier hoe we de `new` operator gebruiken als we een class aanroepen:

```jsx{5}
// Als Greeting een functie is
const result = Greeting(props); // <p>Hello</p>

// Als Greeting een class is
const instance = new Greeting(props); // Greeting {}
const result = instance.render(); // <p>Hello</p>
```

Laten we in een notendop kijken wat de `new` operator doet in JavaScript.

---

Zelfs toen JavaScript vroeger geen classes had kon je een vergelijkbaar patroon als die van een class gebruiken door functies in te zetten. **Heel concreet: je kan iedere functie dezelfde rol geven als een class constructor door `new` te plaatsen voor het aanroepen:**

```jsx
// Een normale functie
function Person(name) {
  this.name = name;
}

var fred = new Person('Fred'); // ✅ Person {name: 'Fred'}
var george = Person('George'); // 🔴 Werkt niet
```

Zelfs nu dat JavaScript classes heeft werkt bovenstaande code nog steeds! Probeer het maar eens in DevTools.

Als je `Person(‘Fred’)` aanroept **zonder** `new`, verwijst `this` naar iets globaals en onhandigs (bijvoorbeeld `window` of `undefined`). Onze code zou dus kunnen crashen of iets raars doen zoals `window.name` creëren.

Door `new` te gebruiken zeggen we eigenlijk: “Hey JavaScript, ik weet dat `Person` gewoon een functie is. Maar laten deze gebruiken alsof het een class constructor is. **Maak een `{}` object en verwijs `this` binnen de `Person` functie naar dat `{}` object zodat ik dingen zoals `this.name` kan toewijzen. Geef mij daarna dat object weer terug.”**

En dat is wat de `new` operator doet.

```jsx
var fred = new Person('Fred'); // Hetzelfde object als ‘this’ in ‘Person’
```

De `new` operator zorgt er ook voor dat alles wat we op `Person.prototype` zetten beschikbaar is in het `fred` object:

```jsx{4-6,9}
function Person(name) {
  this.name = name;
}
Person.prototype.sayHi = function() {
  alert('Hi, I am ' + this.name);
}

var fred = new Person('Fred');
fred.sayHi();
```

Dit is hoe mensen vroeger classes nabootsten voordat ze officieel werden toegevoegd aan JavaScript.

---

Waar `new` al een tijdje te gebruiken is in JavaScript, zijn classes nieuwer. Classes maken het ons mogelijk om de code hierboven te herschrijven op een leesbaardere manier die duidelijker maakt wat we ermee willen bereiken:

```jsx
class Person {
  constructor(name) {
    this.name = name;
  }
  sayHi() {
    alert('Hi, I am ' + this.name);
  }
}

let fred = new Person('Fred');
fred.sayHi();
```

*Die duidelijkheid over wat de developer ergens mee wil bereiken is enorm belangrijk.* Het is dus belangrijk om hier rekening mee te houden bij zowel het ontwerpen van programmeertalen als API’s.

Als je een functie schrijft kan JavaScript niet zelf inschatten of deze moet worden aangeroepen met `alert()` of dat het een constructor moet zijn zoals `new Person()`. `new` vergeten bij het aanroepen van `Person` kan voor verwarrende resultaten zorgen.

**Dankzij de syntax van class is het mogelijk te zeggen: “Dit is niet zomaar een functie - het is een class en het heeft een constructor”.** Als je `new` vergeet te gebruiken wanneer je deze aanroept geeft JavaScript een error:

```jsx
let fred = new Person('Fred');
// ✅ Als Person een functie is: werkt prima
// ✅ Als Person een class is: werkt ook prima

let george = Person('George'); // We zijn ‘new’ vergeten
// 😳 Als Person een constructor-achtige functie is: verwarrend gedrag
// 🔴 Als Person een class is: geeft direct een error
```

Dit helpt ons om snel fouten te vinden. In plaats van dat we moeten wachten totdat er een rare bug tevoorschijn komt. Zoals `this.name` die geïmplementeerd wordt als `window.name` in plaats van `george.name`.

Dit betekent echter wel dat React `new` moet gebruiken voordat een class aangeroepen wordt. Een class kan niet aangeroepen worden als een normale functie, sinds JavaScript dit als een error zou behandelen.

```jsx
class Counter extends React.Component {
  render() {
    return <p>Hello</p>;
  }
}

// 🔴 Dit is in React niet zomaar mogelijk:
const instance = Counter(props);
```

Dit vraagt om problemen.

---

Voordat we gaan kijken hoe React dit oplost is het belangrijk om te realiseren dat de meeste gebruikers van React compilers zoals Babel gebruiken om moderne functionaliteiten zoals classes te kunnen gebruiken in oudere browsers. Dus we moeten rekening houden met compilers in het ontwerp van React.

In oudere versies van Babel konden classes aangeroepen worden zonder `new`. Dit is echter opgelost  - door middel van wat extra code.

```jsx
function Person(name) {
  // Een versimpelde versie van de Babel output:
  if (!(this instanceof Person)) {
    throw new TypeError("Cannot call a class as a function");
  }
  // Onze code:
  this.name = name;
}

new Person('Fred'); // ✅ Okay
Person('George'); // 🔴 Cannot call a class as a function.
```

Het kan zijn dat je dit soort code hebt gezien in je bundle. Dit is wat al die `_classCallCheck` functies doen. (Je kan de bundle size optimaliseren door gebruik te maken van de ‘loose mode’ waar geen checks in zitten. Maar dit kan het mogelijk wel moeilijker maken om de transitie naar echte native classes te maken).

---

Oké, hopelijk heb je nu iets meer door wat het verschil is tussen het aanroepen van iets met `new` en zonder `new`:

|  | `new Person()` | `Person()` |
|---|---|---|
| `class` | ✅ `this` is een `Person` instance | 🔴 `TypeError`
| `function` | ✅ `this` is een `Person` instance | 😳 `this` is `window` of `undefined` |

Dit is nou precies waarom het belangrijk is dat React jouw component correct aanroept. **Als je component is gedefinieerd als een class moet React `new` gebruiken wanneer deze wordt aangeroepen.**

Dus, kan React gewoon checken of iets een class is of niet?

Nou, zo makkelijk is dat dus niet. [Zelfs als we een class van een functie zouden kunnen onderscheiden in JavaScript](https://stackoverflow.com/questions/29093396/how-do-you-check-the-difference-between-an-ecmascript-6-class-and-function) zou dit niet werken voor classes die zijn verwerkt door tools zoals Babel. Voor de browser is het namelijk gewoon een functie. Pech voor React.

---

Oke, dus misschien zou React gewoon `new` kunnen gebruiken op iedere call? Nou… jammer genoeg zou ook dat niet echt werken.

Normale functies die worden aangeroepen met `new` krijgen een object instance zoals `this`. Dat is op zich wenselijk voor functies die als constructor zijn geschreven (zoals `Person` hierboven) maar het zou verwarrend zijn voor function components:

```jsx
function Greeting() {
  // We verwachten niet dat `this` hier ook maar enigszins een vorm van een instance is.
  return <p>Hello</p>;
}
```

Dit hoeft natuurlijk geen probleem te zijn. Toch zijn er nog twee *andere* redenen waarom het juist wel een probleem is.

---

De eerste reden waarom `new` gebruiken niet altijd zou werken is dat native arrow functies aanroepen met `new` een error geeft (behalve als ze zijn gecompileerd door Babel):

```jsx
const Greeting = () => <p>Hello</p>;
new Greeting(); // 🔴 Greeting is geen constructor
```

Dit is express gedaan en heeft te maken met het ontwerp van arrow functies. Een van de grootste voordelen van een arrow functie is dat ze niet hun eigen `this` value hebben - in plaats daarvan komt `this` van de dichtstbijzijnde normale functie:

```jsx{2,6,7}
class Friends extends React.Component {
  render() {
    const friends = this.props.friends;
    return friends.map(friend =>
      <Friend
        // `this` komt uit de ‘render’ method.
        size={this.props.size}
        name={friend.name}
        key={friend.id}
      />
    );
  }
}
```

Oke, dus **arrow functies hebben geen beschikking over hun eigen `this`.** Wacht... dat zou betekenen dat ze totaal onbruikbaar zijn als constructors!

```jsx
const Person = (name) => {
  // 🔴 Dit zou niet logisch zijn
  this.name = name;
}
```

Daarom **maakt JavaScript het onmogelijk om een arrow function aan te roepen met `new`.** Als je dit wel zou doen is de kans dat je een fout maakt toch al aanwezig. Dat kan je dan maar beter zo snel mogelijk weten. Het is een beetje hetzelfde als hoe JavaScript het je niet toelaat om een class aan te roepen zonder `new`.

Heel leuk, maar het maakt ons plan wel iets moeilijker. React kan niet zomaar `new` aanroepen op ieder type functie omdat het mis zou gaan bij arrow functies. We zouden kunnen proberen om arrow functies te filteren door te kijken of ze geen `prototype` hebben en hierdoor besluiten of we wel of niet `new` kunnen gebruiken:

```jsx
(() => {}).prototype // undefined
(function() {}).prototype // {constructor: f}
```

Maar dit [zou niet werken](https://github.com/facebook/react/issues/4599#issuecomment-136562930) voor functies die al zijn compiled door Babel. Misschien niet echt een big deal, maar er is ook nog een andere reden die ervoor zorgt dat deze aanpak niet een goed idee is.

---

Een andere reden waarom we niet altijd `new` kunnen gebruiken is omdat het React ervan zou weerhouden om components te ondersteunen die strings of andere primitieve types teruggeven.

```jsx
function Greeting() {
  return 'Hello';
}

Greeting(); // ✅ 'Hello'
new Greeting(); // 😳 Greeting {}
```

Dit heeft wederom te maken met de gekkigheden van het ontwerp van de [`new` operator](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/new). Zoals we eerder zagen vertelt `new` de JavaScript engine om een object te maken, deze om te zetten in `this` binnen de functie en dit object later terug te geven als resultaat van `new`.

Echter, JavaScript staat het functies die zijn aangeroepen met `new` ook toe om de return value van `new` te overschrijven door een ander object terug te geven. Waarschijnlijk omdat dit handig zou zijn voor patterns zoals pooling waarbij we instanties willen hergebruiken:

```jsx{1-2,7-8,17-18}
// Lui gemaakt
var zeroVector = null;

function Vector(x, y) {
  if (x === 0 && y === 0) {
    if (zeroVector !== null) {
      // Gebruikt dezelfde instance
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

`new` negeert de return value van een functie ook volledig als het *geen* object is. Als je een string of number zou teruggeven, lijkt het eigenlijk alsof er in eerste instantie geen return is.

```jsx
function Answer() {
  return 42;
}

Answer(); // ✅ 42
new Answer(); // 😳 Answer {}
```

Het is gewoon niet mogelijk om een primitieve return value (zoals een number of string) uit te lezen van een functie als deze wordt aangeroepen met `new`. Dus als React altijd `new` zou gebruiken, zou deze geen ondersteuning kunnen bieden voor components die strings teruggeven!

Dat is onacceptabel dus we moeten een tussenweg zien te vinden.

---

Wat hebben we tot nu toe geleerd? React *moet* classes (inclusief Babel output) aanroepen met `new` maar het moet normale functies of arrow functies (inclusief Babel output) aanroepen *zonder* `new`. En er is geen betrouwbare manier om deze twee van elkaar te onderscheiden.

**Als we een algemeen probleem niet kunnen oplossen, kunnen we dan misschien wel een meer specifiek probleem oplossen?**

Als je een component als een class definieert wil je waarschijnlijk `React.Component` gebruiken voor ingebouwde methoden zoals `this.setState()`. **In plaats van alle classes proberen te detecteren, kunnen we ook gewoon op zoek gaan naar `React.Component` afstammelingen?**

Spoiler: dit is precies wat React doet.

---

Misschien is de meest idiomatische manier om te checken of `Greeting` een React component class is door dit te testen: `Greeting.prototype instanceof React.Component`:

```jsx
class A {}
class B extends A {}

console.log(B.prototype instanceof A); // true
```

Ik weet wat je nu denkt. Wat is hier zojuist gebeurt?! Om dit uit te leggen moeten we JavaScript prototypes begrijpen.

Misschien ben je bekend met de ‘prototype chain’. Ieder object in JavaScript kan een ‘prototype’ hebben. Wanneer we `fred.sayHi()` schrijven maar `fred` heeft geen `sayHi` property, kijken we naar de `sayHi` property op `fred`’s prototype. Als we deze hier niet kunnen vinden kijken we naar de volgende prototype in de schakel - de `prototype` van `fred`’s `prototype`. Ga zo maar door.

**Het kan wel verwarrend zijn. Dit komt doordat de `prototype` property van een class of functie *niet* verwijst naar de prototype van die value.** Geloof me.

```jsx
function Person() {}

console.log(Person.prototype); // 🤪 Niet Person’s prototype
console.log(Person.__proto__); // 😳 Person’s prototype
```

De ‘prototype chain’ is meer iets als `__proto__.__proto__.__proto__` in plaats van `prototype.prototype.prototype` Het duurde me jaren om dit te begrijpen.

Maar wat is de `prototype` property van een functie of een class dan? **Het is de `__proto__` die wordt meegegeven aan alle objecten die zijn aangeroepen met `new` op die class of functie!**

```jsx{8}
function Person(name) {
  this.name = name;
}
Person.prototype.sayHi = function() {
  alert('Hi, I am ' + this.name);
}

var fred = new Person('Fred'); // Zet ‘fred.__proto__’ naar ‘Person.prototype’
```

En die `__proto__` chain is hoe JavaScript properties opzoekt:

```jsx
fred.sayHi();
// 1. Heeft fred een sayHi property? Nee.
// 2. Heeft fred.__proto__ een sayHi property? Ja! Roep maar aan!

fred.toString();
// 1. Heeft fred een toString property? Nee.
// 2. Heeft fred.__proto__ een toString property? Nee.
// 3. Heeft fred.__proto__.__proto__ een toString property? Ja! Roep maar aan!
```

In de praktijk zou je eigenlijk nooit `__proto__` hoeven aanraken in je code behalve als je iets aan het debuggen bent dat te maken heeft met de prototype chain. Als je iets beschikbaar wil maken op `fred.__proto__` moet je deze eigenlijk zetten op `Person.prototype`. Althans, dat is hoe het ontwerp in eerste instantie was.

De `__proto__` property was niet eens bedoelt om beschikbaar gemaakt te worden door browsers omdat de prototype chain werd gezien als een intern concept. Maar sommige browsers hebben `__proto__` toegevoegd en uiteindelijk werd het heel erg gestandaardiseerd. (wel deprecated omdat er een preferentie kwam voor `Object.getPrototypeOf()`).

**Toch blijf ik het verwarrend vinden dat een property die `prototype` genoemd is, niet de prototype teruggeeft van een value** (bijvoorbeeld, `fred.prototype` is `undefined` omdat `fred` geen functie is). Persoonlijk denk ik dat dit een van de grootste redenen is dat zelfs developers met veel ervaring moeite hebben met het begrijpen van JavaScript prototypes.

---

Dit is een lange post of niet? Ik zou zeggen dat we er voor ongeveer 80% zijn. Houd vol.

We weten dat wanneer we `obj.foo` zeggen, JavaScript op zoek gaat naar `foo` binnen `obj`, `obj.__proto__`, `obj.__proto__.__proto__` enzovoorts.

Met classes krijg je niet direct toegang tot dit mechanisme. `extends` werkt echter wel bovenop de oude vertrouwde prototype chain. Dat is hoe onze React class instance toegang krijgt tot methods zoals `setState`:

```jsx{1,9,13}
class Greeting extends React.Component {
  render() {
    return <p>Hello</p>;
  }
}

let c = new Greeting();
console.log(c.__proto__); // Greeting.prototype
console.log(c.__proto__.__proto__); // React.Component.prototype
console.log(c.__proto__.__proto__.__proto__); // Object.prototype

c.render();      // Gevonden op c.__proto__ (Greeting.prototype)
c.setState();    // Gevonden op c.__proto__.__proto__ (React.Component.prototype)
c.toString();    // Gevonden op c.__proto__.__proto__.__proto__ (Object.prototype)
```

In andere woorden, **als je classes gebruikt, ‘weerspiegelt’ de instantie de `__proto__` chain van de class hierarchie:**

```jsx
// `extends` chain
Greeting
  → React.Component
    → Object (implicitly)

// `__proto__` chain
new Greeting()
  → Greeting.prototype
    → React.Component.prototype
      → Object.prototype
```

2 Chainz.

---

Sinds de `__proto__` chain de class hierarchie weerspiegelt kunnen we checken of `Greeting` de `React.Component` extend door te starten met `Greeting.prototype` en dan de `__proto__` chain te volgen:

```jsx{3,4}
// `__proto__` chain
new Greeting()
  → Greeting.prototype // 🕵️ We beginnen hier
    → React.Component.prototype // ✅ Gevonden!
      → Object.prototype
```

Handig genoeg doet `x instanceof Y` precies hetzelfde. Het volgt de `x.__proto__` chain om daar naar `Y.prototype` te zoeken.

Normaal gesproken wordt het gebruikt om te kijken of iets een instance van een class is:

```jsx
let greeting = new Greeting();

console.log(greeting instanceof Greeting); // true
// greeting (🕵️‍ We beginnen hier)
//   .__proto__ → Greeting.prototype (✅ Gevonden!)
//     .__proto__ → React.Component.prototype
//       .__proto__ → Object.prototype

console.log(greeting instanceof React.Component); // true
// greeting (🕵️‍ We beginnen hier)
//   .__proto__ → Greeting.prototype
//     .__proto__ → React.Component.prototype (✅ Gevonden!)
//       .__proto__ → Object.prototype

console.log(greeting instanceof Object); // true
// greeting (🕵️‍ We beginnen hier!)
//   .__proto__ → Greeting.prototype
//     .__proto__ → React.Component.prototype
//       .__proto__ → Object.prototype (✅ Gevonden!)

console.log(greeting instanceof Banana); // false
// greeting (🕵️‍ We beginnen hier!)
//   .__proto__ → Greeting.prototype
//     .__proto__ → React.Component.prototype
//       .__proto__ → Object.prototype (🙅‍ Niet gevonden!)
```

Maar het zou net zo goed kunnen werken om te bepalen of een class een andere class extend:

```jsx
console.log(Greeting.prototype instanceof React.Component);
// greeting
//   .__proto__ → Greeting.prototype (🕵️‍ We beginnen hier)
//     .__proto__ → React.Component.prototype (✅ Gevonden!)
//       .__proto__ → Object.prototype
```

En zo’n check is hoe we kunnen bepalen of iets een React component class of een normale functie is.

---

Dat is echter niet wat React doet. 😳

Een nadeel van de `instanceof` oplossing is dat het niet werkt als er meerdere kopiëen van React op de pagina zijn. En de component die we aan het checken zijn iets erft van `React.Component` van een *andere* kopie van React. Meerdere kopieën van React mixen in hetzelfde project is sowieso een slecht idee. Maar historisch gezien proberen we zoveel mogelijk problemen te vermijden. [(Met Hooks moeten we misschien deduplicatie forceren.)](https://github.com/facebook/react/issues/13991)

Een ander mogelijke oplossing zou kunnen zijn om te checken of er een `render` method aanwezig is op het prototype. Echter, voorheen was het [niet duidelijk](https://github.com/facebook/react/issues/4599#issuecomment-129714112) hoe de component API zou evolueren. Iedere check kost iets dus we wilden er niet meer dan een toevoegen. Het zou ook niet werken als `render` als een instance method was gedefinieerd, zoals met de class property syntax.

In plaats daarvan [voegde](https://github.com/facebook/react/pull/4663) React een speciale vlag toe aan de base component. React checkt de aanwezigheid van deze flag en dat is hoe deze weet of iets een React component class is of niet.

In het begin was de flag op de base van de `React.Component` class zelf:

```jsx
// In React
class Component {}
Component.isReactClass = {};

// We kunnen het op deze manier checken
class Greeting extends Component {}
console.log(Greeting.isReactClass); // ✅ Ja
```

Echter, sommige class implementaties waar we ons op richtten kopiëren static properties [niet](https://github.com/scala-js/scala-js/issues/1900) (of zetten de niet-standaard `__proto__`), waardoor de vlag kwijtraakte.

Dit is waarom React de vlag [verplaatste](https://github.com/facebook/react/pull/5021) naar `React.Component.prototype`:

```jsx
// In React
class Component {}
Component.prototype.isReactComponent = {};

//  We kunnen het op deze manier checken
class Greeting extends Component {}
console.log(Greeting.prototype.isReactComponent); // ✅ Ja
```

**En dat is het enige dat we hoeven te doen om het verschil te zien.**

Je vraagt je misschien af waarom het een object is en geen boolean. In de praktijk maakt het niet veel uit maar eerdere versies van Jest (Voordat Jest Goed Was™️) had automocking standaard aan staan. De gegenereerde mocks lieten primitieve properties achterwegen, en [braken daarmee de check](https://github.com/facebook/react/pull/4663#issuecomment-136533373). Bedankt Jest.

De `isReactComponent` check wordt vandaag de dag nog steeds [gebruikt in React](https://github.com/facebook/react/blob/769b1f270e1251d9dbdce0fcbd9e92e502d059b8/packages/react-reconciler/src/ReactFiber.js#L297-L300).

Als je `React.Component` niet extend zal React `isReactComponent` niet vinden op de prototype en de component niet als class behandelen. Nu weet je waarom het antwoord ‘add `extends React.Component`’ [de meeste upvotes heeft](https://stackoverflow.com/a/42680526/458193) op de vraag `Cannot call a class as a function`. Ten slotte is er een [waarschuwing toegevoegd](https://github.com/facebook/react/pull/11168) die waarschuwt wanneer `prototype.render` bestaat maar `prototype.isReactComponent` niet.

---

Je zou kunnen zeggen dat dit hele verhaal een beetje flauw is. **Het antwoord is immers erg simpel. Maar ik heb er best wat werk in gestopt om uit te kunnen leggen *waarom* er in React uiteindelijk voor deze oplossing is gekozen, en wat de alternatieven waren.**

Naar mijn ervaring is dit vaker het geval met library API’s. Om als API makkelijk te gebruiken te zijn moet je vaak rekening houden met de semantiek (mogelijk voor meerdere talen, inclusief toekomstige veranderingen), snelheidsverbeteringen, ergonomie met en zonder compile-time stappen, de staat van het ecosysteem en packaging oplossingen, vroege waarschuwingen en nog veel meer. Het eindresultaat is misschien niet altijd even elegant, maar het moet wel praktisch zijn.

**Als de uiteindelijke API succesvol is, hoeven de gebruikers nooit over dit proces na te denken**. Zo kunnen ze zich focussen op het maken van apps.

Maar als je toch nieuwsgierig bent naar hoe het werkt, is het ook fijn om te weten hoe het werkt.
