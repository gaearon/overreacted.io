---
title: Hogyan különbözteti meg a React az osztályt a függvénytől?
date: '2018-12-02'
spoiler: Lesz szó osztályokról, konstruktorokról, prototípus láncokról és API dizájnról.
---

Vegyük ezt a `Greeting` komponenst, ami függvényként van definiálva:

```jsx
function Greeting() {
  return <p>Hello</p>;
}
```

React-ben ugyanezt osztályként is definiálhatjuk

```jsx
class Greeting extends React.Component {
  render() {
    return <p>Hello</p>;
  }
}
```

(Egészen [mostanáig](https://reactjs.org/docs/hooks-intro.html) ez volt az egyetlen módja, hogy éljünk az állapot (state) által nyújtott lehetőségekkel.

Amikor renderelni akarjuk a `<Greeting />` komponenst, nem számít hogyan volt definiálva:

```jsx
// Osztály vagy függvény - tökmindegy.
<Greeting />
```

De a *React-nek* igenis fontos ez a különbség!

Ha a `Greeting` egy függvény, akkor a React-nek meg kell hívnia:

```jsx
// Saját kód
function Greeting() {
  return <p>Hello</p>;
}
// React kód
const result = Greeting(props); // <p>Hello</p>
```

De ha a `Greeting` egy osztály, akkor a React-nek először létre kell hoznia egy példányt a `new` operátorral és csak *ez után* hívja meg a `render` metódust az imént létrehozott példányon. 

```jsx
// Saját kód
class Greeting extends React.Component {
  render() {
    return <p>Hello</p>;
  }
}
// React kód
const instance = new Greeting(props); // Greeting {}
const result = instance.render(); // <p>Hello</p>
```

A React célja mindkét esetben az, hogy megkapja a renderelt elemet (a példánkban `<p>Hello</p>`). De ennek a folyamatnak a lépései attől függenek, hogyan volt a `Greeting` definiálva.

**Hogyan tudja tehát a React, hogy egy komponens osztály vagy függvény?**

Az [előző poszthoz](/why-do-we-write-super-props/) hasonlóan, **nem *kell* mindezt tudni, ahhoz hogy hatékonyan használjuk a React-et.** Én sem tudtam évekig. Kérek mindenkit, hogy ne csináljunk ebből egy intejú kérdést. Valójában ez a poszt inkább szól a JavaScript-ről mint a React-ről.

Ez a blog azoknak az érdeklődő olvasóknak szól, akik tudni akarják *miért* működik a React úgy ahogy. Magadra ismertél? Akkor ugorjunk neki együtt.

**Hosszú lesz az út, öveket becsatolni! Ez a poszt nem a tartalmaz sok információt magáról a React-ről, de át fogjuk venni a `new`, `this`, `class`, nyíl operátoros függvények, `prototype`, `__proto__`, `instanceof` néhány tulajdonságát és hogy ezek hogyan függenek össze JavaScript-ben. Szerencsére ezeken nem kell túl sokat gondolkodni a React *használata* közben. Viszont ha te implementálod a React-et...**

(Ha csak a válaszra vagy kíváncsi, görgess a legvégére.)

----
Először is azt kell megértenünk, miért fontos a függvényeket és az osztályokat külön kezelnünk. Figyeljük meg hogyan használjuk a `new` operátort egy osztály létrehozásakor:

```jsx{5}
// Ha a Greeting egy függvény
const result = Greeting(props); // <p>Hello</p>
// Ha a Greeting egy osztály
const instance = new Greeting(props); // Greeting {}
const result = instance.render(); // <p>Hello</p>
```

Nézzük meg, hogy nagyjából mit csinál a `new` operátor JavaScript-ben.

---

A múltban nem voltak osztályok a JavaScript-ben. Azonban egyszerű függvények segíségével ki lehetett fejezni hasonló kódolási mintákat. **Konkrétan *akármilyen* függvényt lehet egy osztály konstruktorhoz hasonló szerepkörben használni, mindössze a `new` operátorral kell meghívni:**

```jsx
// Egy egyszerű függvény
function Person(name) {
  this.name = name;
}
var fred = new Person('Fred'); // ✅ Person {name: 'Fred'}
var george = Person('George'); // 🔴 Nem fog működni
```

Ez a kód még ma is érvényes! Próbáld ki DevTools-ban.

Ha `new` és `this` **nélkül** deklarálnánk és hívnánk meg, akkor a `Person('Fred')` valami globális és hasznavehetetlen (mint például a `window` vagy `undefined`) dologra mutatna. A kódunk tehát hibát jelezne vagy váratlanul megváltoztatná a `window.name` értékét.

A `new` operátort egy függvény meghívása elé rakva azt fejezzük ki, hogy: "Figyelj JavaScript, tudom hogy a `Person` csak egy függvény, de tegyünk úgy mintha egy osztály konstruktor lenne. **Hozz létre egy `{}` objektumot és a `Person` függvényen belül lévő `this` mutasson erre az objektumra, hogy hozzá tudjak rendelni olyan dolgokat, mint a `this.name`. Aztán térj vissza ezzel az objektummal.** "

Ezt csinálja a `new` operátor.

```jsx
var fred = new Person('Fred'); // A `Person`-ban lévő `this` erre az objektumra utal
```

A `new` operátor azt is lehetővé teszi, hogy minden amit a `Person.prototype`-on definiálunk az a `fred` objektum számára is elérhető lesz:

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

Így lehetett osztályokat imitálni mielőtt azok megjelentek volna JavaScript-ben.

---

A `new` operátor tehát nem egy újdonság JavaScript-ben. Az osztályok azonban újabb keletűek. A segítségükkel sokkal kifejezőbbé tudjuk tenni a korábbi kódunkat:

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

*A fejlesztő szándékának megőrzése* fontos egy programnyelv vagy egy API tervezésekor.

Ha írunk egy függvényt, a JavaScript nem tudja magától kitalálni, hogy azt úgy kell meghívnia, mint mondjuk az `alert()`-et vagy konstruktorként, mint a `new Person()` esetében. Egy olyan függvény esetében, mint a `Person`, a `new` elhagyása zavaros következményekkel jár.

**Az osztály szintaxissal ki tudjuk fejezni, hogy: "Ez nem csak egy függvény - ez egy osztály és tartozik hozzá egy konstruktor".** Ha lefelejtjük a `new`-t ennek a meghívásakor, a JavaScript hibát fog jelezni:

```jsx
let fred = new Person('Fred');
// ✅  Ha a Person egy függvény: semmi gond
// ✅  Ha a Person egy osztály: szintén semmi gond
let george = Person('George'); // Hiányzó `new`
// 😳 Ha a Person egy konstruktor-szerű függvény: zavaros viselkedés
// 🔴 Ha a Person egy osztály: azonnali hibaüzenet
```

A hibákat ezáltal könnyebb korán észrevenni, semmint várni hogy bekövetkezzen valami rejtélyes bug, például hogy a `this.name` a `george.name` helyett a `window.name`-et állítja be.

Ám ez azzal is jár, hogy a React-nak minden egyes osztály meghívása elé oda kell tennie a `new` operátort. Nem hívhatja meg azokat egyszerű függvényként, mert a JavaScript hibát jelezne!

```jsx
class Counter extends React.Component {
  render() {
    return <p>Hello</p>;
  }
}
// 🔴 A React nem hívhatja meg így
const instance = Counter(props);
```

Ebből még baj lehet.

---

Mielőtt látnánk hogyan oldja meg a React ezt a problémát, jusson eszünkbe, hogy a legtöbb React felhasználó valamilyen fordítóprogramot használ - mint például a Babel - hogy az osztályokat és a többi modern funkciókat lefordítsák a régebbi böngészők számára. A tervezéskor tehát ezeket a fordítóprogramokat is figyelembe kell vennünk.

A Babel korai verzióiban az osztályokat meg lehetett hívni `new` nélkül is. Ez azonban ki lett javítva - egy kis extra kód hozzáadásával:

```jsx
function Person(name) {
  // Leegyszerűsített Babel kód:
  if (!(this instanceof Person)) {
    throw new TypeError("Cannot call a class as a function");
  }
  // Saját kód:
  this.name = name;
}
new Person('Fred'); // ✅ Oké
Person('George');   // 🔴 Nem lehet az osztályt függvényként meghívni
``` 

Hasonló kóddal már találkozhattál a bundle-ödben. Erre való az a sok `_classCallCheck` függvény. (A bundle mérete csökkenthető ha az ilyen ellenőrzéseket nélkülöző "loose mode"-ot választjuk, de ez megnehezítheti a valós natív osztályokra való jövőbeli átállást.) 

---

Most már tehát nagyjából értjük, hogy mi a különbség ha `new`-val vagy anélkül hívunk meg valamit:

|  | `new Person()` | `Person()` |
|---|---|---|
| `class` | ✅ A `this` egy `Person` példányra mutat | 🔴 `TypeError`
| `function` | ✅ A `this` egy `Person` példányra mutat | 😳 A `this` vagy a `window`-ra mutat vagy `undefined` |

Ezért fontos, hogy a React helyesen hívja meg a komponenseket. **Ha a komponens osztályként van definiálva a React-nak a `new` operátorral kell meghívnia.**

Akkor a React csupán ellenőrzi, hogy egy osztályról van szó vagy sem?

Ne olyan hevesen! Még ha [meg is tudnánk különböztetni egy osztályt egy függvénytől JavaScript-ben](https://stackoverflow.com/questions/29093396/how-do-you-check-the-difference-between-an-ecmascript-6-class-and-function), a Babel és a hozzá hasonló eszközök által fordított osztályok esetében ez akkor sem működne. A böngésző szemében ezek mindössze sima függvények. Nagy pech a React számára.

---

Oké, akkor a React nem tehetné oda `new` kulcsszót minden egyes meghívás elé? Sajnos ez sem működne.

Ha a szokásos függvényeket a `new`-val hívjuk meg, akkor egy objektum példány társul hozzájuk, amire a `this` mutat. Ez kívánatos a konstruktor függvényeknél (mint például a korábbi `Person`), de zavaró a függvény komponensek esetében:

```jsx
function Greeting() {
  // Nem várjuk el, hogy a `this` akármire mutasson
  return <p>Hello</p>;
}
```

Ez még akár elviselhető is lenne. Van viszont két *másik* oka annak, hogy ez az ötlet nem működik.

---

Az első ok, amiért nem használhatjuk minden esetben a `new`-t az az, hogy ha a natív (és nem a Babel által lefordított) nyíl operátoros függvényeket a `new` kulcsszóval hívjuk meg, akkor hibaüzenetet kapunk:

```jsx
const Greeting = () => <p>Hello</p>;
new Greeting(); // 🔴 A Greeting nem egy konstruktor
```

Ez a viselkedés szándékos és a nyíl operátoros függvények dizájnjából ered. A nyíl operátoros függvények egyik előnye ugyanis az, hogy *nem* rendelkeznek saját `this` értékkel - ehelyett a `this`-t a legközelebbi szabályos függvénytől veszik át:

```jsx{2,6,7}
class Friends extends React.Component {
  render() {
    const friends = this.props.friends;
    return friends.map(friend =>
      <Friend
        // `A `this` a `render` metódustól származik
        size={this.props.size}
        name={friend.name}
        key={friend.id}
      />
    );
  }
}
```

Oké, szóval a **nyíl operátoros függvények nem rendelkeznek saját `this`-szel.** Viszont ez azt jelenti, hogy teljesen használhatatlanok konstruktorként!

```jsx
const Person = (name) => {
  // 🔴 Ennek nincs értelme!
  this.name = name;
}
```

Emiatt a **JavaScript nem engedélyezi, hogy a nyíl operátoros függvényeket a `new` kulcsszóval hívjuk meg.** Ha mégis így teszünk, az valószínűleg nem volt szándékos és jobb is, ha minél hamarabb tudomást szerzünk róla. Hasonló okokból kifolyólag nem engedi a JavaScript az osztályok meghívását a `new` operátor *nélkül*.

Ez így oké, viszont ez keresztülhúzza a számításainkat. A React nem hívhat meg mindent a `new` kulcsszóval, mert a nyíl operátoros függvények esetében ez nem működne! A `new`-val való meghívás helyett megpróbálhatnánk kiszűrni a nyíl operátoros függvényeket azáltal, hogy nekik nincs `prototype` mezőjük:

```jsx
(() => {}).prototype // undefined
(function() {}).prototype // {constructor: f}
```

De ez [nem működne](https://github.com/facebook/react/issues/4599#issuecomment-136562930) a Babel által fordított függvények esetében. Ez nem biztos, hogy olyan nagy ügy, van viszont egy másik ok, ami miatt ez a megközelítés egy zsákutca.

---

A másik ok amiért nem használhatjuk folyton a `new` kulcsszót az az, hogy ez megakadályozná a React-et abban, hogy támogassa azokat a komponenseket, amik string-ekkel vagy más primitív típusokkal térnek vissza. 

```jsx
function Greeting() {
  return 'Hello';
}
Greeting(); // ✅ 'Hello'
new Greeting(); // 😳 Greeting {}
```

Ez megint csak a [`new` operátor](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/new) különös koncepciójából ered. Ahogy azt láttuk korábban a `new` arra utasítja a JavaScript-et, hogy hozzon létre egy objektumot, a függvényen belül a `this` mutasson erre az objektumra, végül pedig kapjuk meg ezt az objektumot a `new` eredményeként.

Azonban a JavaScript azt is megengedi, hogy egy `new` operátorral meghívott függvény *felülírja* a `new` visszatérési értékét azáltal, hogy valami más objektummal tér vissza. Feltehetőleg ezt hasznosnak tekintették az olyan esetekben, amikor a példányok újrafelhasználásával összevontabb kódot szeretnénk írni:

```jsx{1-2,7-8,17-18}
// Szabadon definiálva
var zeroVector = null;
function Vector(x, y) {
  if (x === 0 && y === 0) {
    if (zeroVector !== null) {
      // Újrahasznosítva ugyanazt a példányt
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

Azonban a `new` *teljesen figyelmen kívűl hagyja* egy függvény visszatérési értékét abban az esetben, amikor az *nem* egy objektum. Ha egy string vagy egy szám a visszatérési érték az olyan, mintha nem is volna `return` a függvényben. 

```jsx
function Answer() {
  return 42;
}
Answer(); // ✅ 42
new Answer(); // 😳 Answer {}
```

Egyszerűen nincs rá mód, hogy olvassuk a primitív visszatérési értékeket (mint például string vagy szám) ha a függvény a `new` kulcsszóval került meghívásra. Tehát ha a React mindig a `new`-t használná képtelen lenne azokat a komponenseket támogatni, amelyek egy string-et eredményeznek!

Mivel ez elfogadhatatlan szükségünk van egy kompromisszumra.

---

Mit is tudunk eddig? A React-nek az osztályokat (beleértve a Babel outputot) a `new`-val *együtt*, a normál és a nyíl operátoros függvényeket (beleértve a Babel outputot) viszont a `new` *nélkül* kell meghívnia. Ezeket viszont nem lehet megbízható módon megkülönböztetni.

**Ha nem tudjuk ezt az általános problémát megoldani, egy specifikusabbat meg tudnánk?**

Amikor egy komponenst osztályként definiálunk a legtöbbször a `React.Component` osztályt szeretnénk bővíteni, hogy hozzáférjünk olyan beépített metódusokhoz, mint például a `this.setState()`. **Ahelyett, hogy megpróbálnánk azonosítani az összes osztályt, nem tudnánk csak a `React.Component` utódosztályait kiszűrni?**

Spoiler: a React pontosan ezt csinálja.

---

Talán a helyes módszer, hogy megállapítsuk a `Greeting` komponensről hogy egy React osztály-e az, hogy megvizsgáljuk a `Greeting.prototype instanceof React.Component` igazságértékét:

```jsx
class A {}
class B extends A {}
console.log(B.prototype instanceof A); // true
```

Tudom mire gondoltok. Mi folyik itt? Hogy ezt megválaszoljuk, meg kell értenünk a JavaScript prototípusokat. 

Talán ismerős lehet a "prototípus lánc". Minden JavaScript objektum rendelkezhet egy "prototípussal". Amikor azt írjuk, hogy `fred.sayHi()`, viszont a `fred` objektum közvetlenül nem rendelkezik ezzel a metódussal, akkor szétnézünk `fred` prototípusában, hátha ott van a `sayHi` definiálva.  Ha ott sem találjuk, akkor továbbmegyünk a láncban következő prototípusra - `fred` prototípusának a prototípusára. És így tovább.

**Zavaró módon egy osztály vagy egy függvény `prototype` mezője _nem_ az adott elem prototípusára mutat.** Nem viccelek.

```jsx
function Person() {}
console.log(Person.prototype); // 🤪 Nem a Person prototípusa
console.log(Person.__proto__); // 😳 A Person prototípusa
```

A "prototípus lánc" tehát inkább úgy néz ki, hogy `__proto__.__proto__.__proto__` semmint hogy `prototype.prototype.prototype`. Évekbe tartott hogy ezt megértsem.

Akkor visztont mire mutat a `prototype` mező egy függvény vagy osztály esetében? **Hát a `__proto__`-ra, amivel minden olyan objektum rendelkezik, ami egy függvénytől vagy egy osztálytól származik és a `new` operátorral került meghívásra!**

```jsx{8}
function Person(name) {
  this.name = name;
}
Person.prototype.sayHi = function() {
  alert('Hi, I am ' + this.name);
}
var fred = new Person('Fred'); // A `fred.__proto__` immár a `Person.prototype`-ra mutat
```

A JavaScript tehát ezt a `__proto__` láncot használja a változók megkeresésére:

```jsx
fred.sayHi();
// 1. fred rendelkezik saját sayHi metódussal? Nem.
// 2. fred.__proto__ rendelkezik saját sayHi metódussal? Igen. Hívjuk meg!
fred.toString();
// 1. fred rendelkezik saját toString metódussal? Nem.
// 2. fred.__proto__ rendelkezik saját toString metódussal? Nem.
// 3. fred.__proto__.__proto__ rendelkezik saját toString metódussal? Igen. Hívjuk meg!
```

A gyakorlatban szinte sosem kell a `__proto__`-hoz közvetlenül hozzányúlnunk, kivéve ha a prototípus lánchoz köthető hibát keresünk. Ha azt szeretnénk, hogy a `fred.__proto__`-nak legyen hozzáférése valamihez, azt a `Person.prototype`-on kell beállítanunk. Legalábbis eredetileg így kellett.

A böngészők eredetileg nem is férhettek volna hozzá a `__proto__` mezőhöz, mivel a prototípus láncot egy belső koncepciónak szánták. De néhány böngésző mégis hozzáfért, így a `__proto__` akaratlanul, de mégis standarddá vált (viszont mára elevult és a `Object.getPrototypeOf()` vette át a helyét).

**Akárhogy is, én még mindig nagyon furcsának találom, hogy egy mező amit `prototype`-nak hívnak nem az adott érték prototípusra utal** (például a `fred.prototype` nincs definiálva, mert a `fred` nem egy függvény). Személy szerint én azt gondolom, hogy ez fő oka annak, hogy még a tapasztalt fejlesztők is gyakran félreértik a JavaScript prototípusokat.

---

Hosszú egy poszt, mi? Körülbelül 80%-nál tartunk. Kitartás.

Tudjuk tehát, hogy amikor azt írjuk, hogy `obj.foo`, akkor a JavaScript valójában megnézi, hogy a `foo` definiálva van-e az `obj`-en, `obj.__proto__`-n, `obj.__proto__.__proto__`-n és így tovább.

Az osztályok esetében ennek a mechanizmusnak nem vagyunk közvetlenül kitéve, de az `extends` ugyanúgy működik a jó öreg prototípus láncon is. Így férnek hozzá a React osztályaink olyan metódusokhoz, mint a `setState`:

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
c.render();      // Megtalálva a c.__proto__ -n (Greeting.prototype)
c.setState();    // Megtalálva a c.__proto__.__proto__ -n (React.Component.prototype)
c.toString();    // Megtalálva a c.__proto__.__proto__.__proto__ -n (Object.prototype)
```

Más szavakkal, **amikor osztályokat használunk, egy példány `__proto__` lánca "tükrözi" az oszály hierarchiát:**

```jsx
// `extends` lánc
Greeting
  → React.Component
    → Object (implicit módon)
// `__proto__` lánc
new Greeting()
  → Greeting.prototype
    → React.Component.prototype
      → Object.prototype
```

2 Chainz.

---

Mivel a `__proto__` letükrözi az osztály hierarchiát, megnézhetjük, hogy a `Greeting` a `React.Component` bővítménye-e, kezdve a `Greeting.prototype`-nál majd tovább követve a `__proto__` láncot:


```jsx{3,4}
// `__proto__` lánc
new Greeting()
  → Greeting.prototype // 🕵️ Itt kezdünk
    → React.Component.prototype // ✅ Megvan!
      → Object.prototype
```

Szerencsére az `x instanceof Y` pontosan ezt a fajta keresést hajtja végre. Ez az `x.__proto__` láncot követve kutat az `Y.prototype` után.

Ezt normális esetben arra használjuk, hogy megmondjuk valamiről hogy egy osztály példánya-e:

```jsx
let greeting = new Greeting();
console.log(greeting instanceof Greeting); // true
// greeting (🕵️‍ Itt kezdünk)
//   .__proto__ → Greeting.prototype (✅ Megvan!)
//     .__proto__ → React.Component.prototype 
//       .__proto__ → Object.prototype
console.log(greeting instanceof React.Component); // true
// greeting (🕵️‍ Itt kezdünk)
//   .__proto__ → Greeting.prototype
//     .__proto__ → React.Component.prototype (✅ Megvan!)
//       .__proto__ → Object.prototype
console.log(greeting instanceof Object); // true
// greeting (🕵️‍ Itt kezdünk)
//   .__proto__ → Greeting.prototype
//     .__proto__ → React.Component.prototype
//       .__proto__ → Object.prototype (✅ Megvan!)
console.log(greeting instanceof Banana); // false
// greeting (🕵️‍ Itt kezdünk)
//   .__proto__ → Greeting.prototype
//     .__proto__ → React.Component.prototype 
//       .__proto__ → Object.prototype (🙅‍ Nem találtuk sehol!)
```

De ugyanúgy működne, ha azt akarnánk meghatározni, hogy egy osztály egy másik osztály bővítménye-e:

```jsx
console.log(Greeting.prototype instanceof React.Component);
// greeting
//   .__proto__ → Greeting.prototype (🕵️‍ Itt kezdünk)
//     .__proto__ → React.Component.prototype (✅ Megvan!)
//       .__proto__ → Object.prototype
```

Ez az a módszer, amivel meg tudjuk határozni, hogy valami egy React komponens osztály vagy pedig egy szokványos függvény.

---

A React azonban nem így csinálja. 😳

Ezt az `instanceof`-ot használó megoldás egyik ellentmondásossága, hogy nem működik ha a React több példánya is jelen van az oldalon és az a komponens amit éppen ellenőrzünk egy *másik* React példány `React.Component`-jétől örököl. Többfajta React példány ötvözése egy projekten belül sok okból kifolyólag sem jó ötlet, de a múltban megpróbáltuk elkerülni az ezzel járó problémákat, ha lehetséges volt. (A Hooks-szal azonban, [lehet hogy muszáj](https://github.com/facebook/react/issues/13991) lesz megszabadulnunk a duplikácikótól.)

Egy másik lehetséges heurisztika, ha ellenőriznénk, hogy a `render` metódus definiálva van-e a prototípuson. Azonban régebben [nem volt tiszta](https://github.com/facebook/react/issues/4599#issuecomment-129714112), hogy a komponens API hogyan fog fejlődni. Minden ellenőrzésnek van egy ára, így nem akartunk egynél többet elvégezni. Ez akkor sem működne ha a `render` egy példány metódusként lenne definiálva, az osztály attribútumok szintaxisához hasonlóan.

Ellenben a React inkább egy speciális flag-et [rendelt](https://github.com/facebook/react/pull/4663) a bázis komponenshez. A React ellenőrzi, hogy megvan-e ez a flag, és innen tudja, hogy valami egy React komponens-e vagy sem.

Eredetileg ez a flag a bázis `React.Component` osztályon magán volt:

```jsx
// Inside React
class Component {}
Component.isReactClass = {};
// Ellenőrizhetjük így
class Greeting extends Component {}
console.log(Greeting.isReactClass); // ✅ Igen
```

Ám néhány konkrét osztály implementáció [nem](https://github.com/scala-js/scala-js/issues/1900) tartalmazott másolatokat a statikus tulajdonságokról (vagy maga módosította a `__proto__`-t, ami nem volt a standard része), így ez a flag elveszett.

A React ezért [rakta át](https://github.com/facebook/react/pull/5021) ezt a flag-et inkább a `React.Component.prototype`-ra:

```jsx
// React kód
class Component {}
Component.prototype.isReactComponent = {};
// Így tudjuk ellenőrizni
class Greeting extends Component {}
console.log(Greeting.prototype.isReactComponent); // ✅ Igen
```

**És lényegében ez minden.**

Felmerülhet a kérdés, hogy ez miért egy objektum egy egyszerű boolean helyett. A gyakorlatban nem számít sokat, de a Jest korábbi verzióiban (mielőtt a Jest jó lett™️) az automocking alapból be volt kapcsolva. Ezek a generált teszt objektumok (mock-ok) nélkülöztek minden primitív adatmezőt, [lehetetlenné téve az ellenőrzést](https://github.com/facebook/react/pull/4663#issuecomment-136533373). Köszi Jest.

Az `isReactComponent` ellenőrzése mindmáig [a React része.](https://github.com/facebook/react/blob/769b1f270e1251d9dbdce0fcbd9e92e502d059b8/packages/react-reconciler/src/ReactFiber.js#L297-L300)

Ha nem a `React.Component`-et bővítjük, akkor a React nem fogja megtalálni az `isReactComponent`-et a prototípuson és ezért nem is fogja osztályként kezelni. Most már tudjuk hogy a `Cannot call a class as a function` hibaüzenetre a [legtöbb szavazatot kapó válasz](https://stackoverflow.com/a/42680526/458193) miért az, hogy adjuk hozzá a komponenshez az `extends React.Component`-et. Végezetül van egy [figyelmeztetés is](https://github.com/facebook/react/pull/11168), ami jelzi ha a `prototype.render` létezik, de a `prototype.isReactComponent` nem.

---

Úgy vélhetitek, hogy ebben a történet kicsit sok a beetetést. **Maga a megoldás rendkívül egyszerű, mégis azért tettem meg ezt a hatalmas kerülőutat, hogy elmagyarázzam a React *miért* ezt a megoldást választotta és milyen más alternatívák merültek fel.**

Tapasztalatom szerint ez gyakran megesik az API könyvtárakkal. Ha azt várjuk el egy API-tól, hogy egyszerűen lehessen használni akkor figyelembe kell venni a nyelv szemantikáját (valószínűleg több nyelvét is, beleértve a lehetséges jövőbeli irányvonalakat is), a lefutás gyorsaságát, a munkakörnyezetet fordítási műveletekkel és azok nélkül, az ökoszisztéma és a programcsomagok állapotát és számos más tényezőt. A végső megoldás nem mindig a legelegánsabb is, viszont muszáj használhatónak lennie.

**Ha a végső API sikeres, a _felhasználónak_ soha nem kell ezen a procedúrán rágódnia.** Ehelyett fókuszálhatnak inkább az appokra.

De ha kíváncsi vagy... nem árt ha tudod, hogy működnek a dolgok.