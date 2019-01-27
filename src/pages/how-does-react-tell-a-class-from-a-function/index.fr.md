---
title: Comment React distingue-t-il entre Classes et Fonctions ?
date: '2018-12-02'
spoiler: Où nous parlons de classes, new, instanceof, des chaînes de prototypes et de la conception d’API.
---

Observez ce composant `Greeting` défini par une fonction :

```jsx
function Greeting() {
  return <p>Bonjour</p>;
}
```

React permet aussi de le définir par une classe :

```jsx
class Greeting extends React.Component {
  render() {
    return <p>Bonjour</p>;
  }
}
```

(Jusqu’à [récemment](https://reactjs.org/docs/hooks-intro.html), c’était la seule manière d’utiliser certaines fonctionnalités telles que la gestion d’état.)

Quand vous voulez afficher un `<Greeting />`, vous ne vous préoccupez pas de la façon dont il a été défini :

```jsx
// Classe ou fonction — peu importe.
<Greeting />
```

Mais pour *React lui-même*, ça fait une différence !

Si `Greeting` est une fonction, React a besoin de l’appeler :

```jsx
// Votre code
function Greeting() {
  return <p>Bonjour</p>;
}

// Dans React
const result = Greeting(props); // <p>Bonjour</p>
```

Mais si `Greeting` est une classe, React doit l’instancier à l’aide de l’opérateur `new` et *ensuite* appeler la méthode `render` sur l’instance nouvellement créée :

```jsx
// Votre code
class Greeting extends React.Component {
  render() {
    return <p>Bonjour</p>;
  }
}

// Dans React
const instance = new Greeting(props); // Greeting {}
const result = instance.render(); // <p>Bonjour</p>
```

Dans les deux cas, l’objectif de React est d’obtenir le nœud rendu (dans cette exemple, `<p>Bonjour</p>`).  Mais les étapes exactes dépendent de la façon dont `Greeting` est défini.

**Alors comment React sait-il si quelque chose est une classe ou une fonction ?**

Tout comme dans mon [précédent article](/why-do-we-write-super-props/), **vous n’avez pas *besoin* de savoir ça pour être efficace avec React.**  Je ne le savais pas moi-même pendant des années.  Ne faites pas de cet article une question d’entretien technique.  En fait, cet article est plus à propos de JavaScript que de React.

Ce blog est pour les personnes curieuses qui veulent savoir *pourquoi* React fonctionne d’une certaine manière.  Êtes-vous une telle personne ?  Alors creusons ensemble.

**Ce sera un long voyage.  Attachez votre ceinture.  Cet article n’a pas beaucoup d’informations sur React lui-même, mais nous explorerons des aspects de `new`, `this`, `class`, des fonctions fléchées, de `prototype`, `__proto__`, `instanceof`, et de la façon dont toutes ces choses fonctionnent ensemble en JavaScript.  Heureusement, vous n’avez pas tellement besoin de penser à tout ça quand vous *utilisez* React.  Mais si vous implémentez React…**

(Si tout ce qui vous intéresse c’est de connaître la réponse, déroulez jusqu’à la toute fin.)

----

Pour commencer, nous devons comprendre pourquoi il est important de traiter les fonctions et les classes différemment.  Remarquez comment nous utilisons l’opérateur `new` pour appeler une classe :

```jsx{5}
// Si Greeting est une fonction
const result = Greeting(props); // <p>Bonjour</p>

// Si Greeting est une classe
const instance = new Greeting(props); // Greeting {}
const result = instance.render(); // <p>Bonjour</p>
```

Essayons de comprendre à peu près ce que fait l’opérateur `new` en JavaScript.

---

Autrefois, JavaScript n’avait pas de classes.  Cependant, vous pouviez exprimer une approche similaire aux classes avec de simples fonctions.  **Concrètement, vous pouvez utiliser *n’importe quelle* fonction dans une optique similaire à un constructeur en ajoutant `new` avant son appel :**

```jsx
// Juste une function
function Person(name) {
  this.name = name;
}

var fred = new Person('Fred'); // ✅ Person {name: 'Fred'}
var george = Person('George'); // 🔴 Ne marchera pas
```

On peut toujours écrire du code de ce genre de nos jours ! Essayez donc dans les DevTools.

Si vous appeliez `Person('Fred')` **sans** `new`, `this` à l’intérieur référencerait un objet global et inutile (par exemple, `window` ou `undefined`).  De sorte que notre code planterait, ou ferait un truc idiot comme définir `window.name`.

En ajoutant `new` avant l’appel, nous disons : « Hé, JavaScript, je sais bien que `Person` est juste une fonction mais faisons comme si c’était un genre de constructeur de classe. **Crée un objet `{}` et fais-le référencer par `this` au sein de la fonction `Person`, pour que je puisse y affecter des trucs genre `this.name`.  Puis renvoie-moi cet objet.** »

C’est en résumé ce que fait l’opérateur `new`.

```jsx
var fred = new Person('Fred'); // Même objet que `this` dans `Person`
```

L’opérateur `new` rend également accessible via l’objet `fred` tout ce que nous mettons dans `Person.prototype` :

```jsx{4-6,9}
function Person(name) {
  this.name = name;
}
Person.prototype.sayHi = function() {
  alert('Bonjour, je m’appelle ' + this.name);
}

var fred = new Person('Fred');
fred.sayHi();
```

Et c’est comme ça qu’on simulait des classes avant que JavaScript ne fournisse une syntaxe dédiée.

---

Donc `new` existe en JavaScript depuis des lustres.  En revanche, les classes sont plus récentes.  Elles nous permettent de réécrire le code ci-dessus pour mieux coller à notre intention :

```jsx
class Person {
  constructor(name) {
    this.name = name;
  }
  sayHi() {
    alert('Bonjour, je m’appelle ' + this.name);
  }
}

let fred = new Person('Fred');
fred.sayHi();
```

*Saisir l’intention du développeur* est une part importante de la conception de langage et d’API.

Si vous écrivez une fonction, JavaScript ne peut pas deviner si vous souhaitez l’utiliser comme `alert()` ou si ce sera un constructeur comme `new Person()`.  Oublier de préciser `new` pour une fonction comme `Person` donnerait des résultats inattendus.

**La syntaxe de classes nous permet de dire : « ce n’est pas juste une fonction—c‘est une classe et elle a un constructeur. »**  Si vous oubliez le `new` en l’appelant, JavaScript lèvera une erreur :

```jsx
let fred = new Person('Fred');
// ✅  Si Person est une fonction, ça marche
// ✅  Si Person est une classe, ça marche aussi

let george = Person('George'); // On a oublié `new`
// 😳 Si Person est une fonction de type constructeur : comportement foireux
// 🔴 Si Person est une classe : échec immédiat
```

Ça nous aide a attraper les erreurs tôt au lieu de devoir attendre un bug obscur du style `this.name` devenant `window.name` au lieu de `george.name`.

Ceci dit, ça signifie que React a besoin de mettre un `new` avant d’appeler une classe.  Il ne peut pas juste l’appeler comme une fonction classique, ou JavaScript traitera ça comme une erreur !

```jsx
class Counter extends React.Component {
  render() {
    return <p>Bonjour</p>;
  }
}

// 🔴 React ne peut pas se contenter de faire ça :
const instance = Counter(props);
```

Ça ne sent pas bon.

---

Avant de voir comment React résout ce problème, il faut bien se souvenir que la plupart des gens utilisent React avec des transpileurs comme Babel pour permettre aux anciens navigateurs de tirer parti de fonctionnalités modernes, comme les classes.  Donc nous devons garder les transpileurs à l’esprit dans notre approche.

Dans les premières versions de Babel, les classes pouvaient être appelées sans `new`.  Ça a toutefois été corrigé—en générant un peu de code en plus :

```jsx
function Person(name) {
  // Légèrement simplifié par rapport au code pondu par Babel
  if (!(this instanceof Person)) {
    throw new TypeError("Cannot call a class as a function");
  }
  // Notre code :
  this.name = name;
}

new Person('Fred'); // ✅ Okay
Person('George');   // 🔴 Cannot call a class as a function
```

Vous avez peut-être déjà vu ce genre de code dans votre _bundle_. C’est la raison d‘être de tous ces appels à `_classCallCheck`. (On peut réduire la taille du _bundle_ en optant pour le mode « laxiste », sans vérifications, mais ça peut compliquer la transition ultérieure aux classes natives.)

---

À ce stade, vous devriez avoir une compréhension suffisante de la différence entre appeler une fonction avec `new` ou sans `new` :

|            | `new Person()`                        | `Person()`                            |
| ---------- | ------------------------------------- | ------------------------------------- |
| `class`    | ✅ `this` est une instance de `Person` | 🔴 `TypeError`                        |
| `function` | ✅ `this` est une instance de `Person` | 😳 `this` est `window` ou `undefined` |

C’est pourquoi il est important pour React d’appeler votre composant correctement. **Si votre composant est défini comme une classe, React doit utiliser `new` pour l’appeler.**

Alors React peut-il juste vérifier si quelque chose est une classe ou non ?

Pas si simple ! Même si on pourrait [distinguer une classe d’une fonction en JavaScript](https://stackoverflow.com/questions/29093396/how-do-you-check-the-difference-between-an-ecmascript-6-class-and-function), ça ne nous aiderait pas pour les classes transformées par des outils tels que Babel.  Pour le navigateur, il s’agirait de fonctions classiques.  Pas de bol pour React.

---

OK, alors peut-être React peut-il juste utiliser `new` pour tous les appels ?  Malheureusement, ça ne marcherait pas non plus.

Avec les fonctions classiques, les appeler avec `new` leur donnerait une instance comme `this`.  C’est souhaitable pour les fonctions écrites en tant que constructeurs (comme notre `Person` plus haut), mais ça serait problématique pour les fonctions de composants :

```jsx
function Greeting() {
  // On ne s’attend pas à ce que `this` soit ici une instance quelconque
  return <p>Bonjour</p>;
}
```

Ça serait toutefois acceptable.  Il y a deux *autres* raisons pour lesquelles on laissera tomber cette idée.

---

La première raison qui empêche `new` de marcher dans ce cas de figure concerne les fonctions fléchées natives (pas celles transpilées par Babel), car les appeler avec `new` lève une erreur :

```jsx
const Greeting = () => <p>Bonjour</p>;
new Greeting(); // 🔴 Greeting is not a constructor
```

C’est un comportement volontaire qui procède de la conception des fonctions fléchées.  Un des principaux avantages des fonctions fléchées, c’est qu’elles *n’ont pas* leur propre valeur de `this`—à la place, `this` est résolu lexicalement, depuis la plus proche portée de fonction classique :

```jsx{2,6,7}
class Friends extends React.Component {
  render() {
    const friends = this.props.friends;
    return friends.map(friend =>
      <Friend
        // `this` est résolu depuis la méthode `render`
        size={this.props.size}
        name={friend.name}
        key={friend.id}
      />
    );
  }
}
```

OK, donc **les fonctions fléchées n’ont pas leur propre `this`.**  Mais ça veut dire qu’elles ne peuvent pas être des constructeurs !

```jsx
const Person = (name) => {
  // 🔴 Ça n’aurait aucun sens !
  this.name = name;
}
```

C’est pourquoi **JavaScript interdit l’appel d’une fonction fléchée avec `new`.**  Si vous le faites, c’est probablement une erreur de toutes façons, et il vaut mieux vous le dire tôt.  C’est comme lorsque JavaScript ne vous laisse pas appeler une classe *sans* `new`.

Tout ça est bien joli mais ça fait échouer notre plan.  React ne peut pas juste appeler `new` sur tout parce que ça casserait les fonctions fléchées !  On pourrait essayer de détecter les fonctions fléchées spécifiquement grâce à leur manque de `prototype`, et ne pas appeler `new` sur elles :

```jsx
(() => {}).prototype // undefined
(function() {}).prototype // {constructor: f}
```

Mais ça [ne marcherait pas](https://github.com/facebook/react/issues/4599#issuecomment-136562930) pour les fonctions transpilées par Babel. Ça n’est peut-être pas un gros sujet, mais c’est une raison de plus qui fait que cette approche est une impasse.

---

Une autre raison qui nous empêche d’utiliser systématiquement `new` : ça empêcherait React de permettre aux composants de renvoyer des chaînes de caractères ou d’autres types de primitives.

```jsx
function Greeting() {
  return 'Bonjour';
}

Greeting(); // ✅ 'Bonjour'
new Greeting(); // 😳 Greeting {}
```

C'est là aussi dû aux particularités de conception de l’[opérateur `new`](https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Op%C3%A9rateurs/L_op%C3%A9rateur_new). Comme nous l’avons vu plus tôt, `new` dit au moteur JavaScript de créer un objet, en faire le `this` au sein de la fonction, et au final nous le renvoyer comme résultat de `new`.

Seulement voilà, JavaScript permet aussi à une fonction appelée avec `new` de *remplacer* la valeur de retour de `new` en renvoyant un autre objet.  C’était apparemment considéré utile pour des besoins comme le recyclage d’instance (*pooling*) :

```jsx{1-2,7-8,17-18}
// Créé à la demande (“lazily”)
var zeroVector = null;

function Vector(x, y) {
  if (x === 0 && y === 0) {
    if (zeroVector !== null) {
      // Réutilise la même instance
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

Le hic, c’est que `new` va aussi *complètement ignorer* la valeur de retour de la fonction si ce n’est *pas* un objet.  Si vous renvoyez un littéral texte ou numérique, c’est comme si vous n’aviez écrit aucun `return`.

```jsx
function Answer() {
  return 42;
}

Answer(); // ✅ 42
new Answer(); // 😳 Answer {}
```

Il est tout simplement impossible de récupérer la valeur primitive de retour (telle qu’un nombre ou une chaîne) depuis une fonction appelée avec `new`.  Donc si React utilisait toujours `new`, il ne pourrait pas autoriser les composants à renvoyer des chaînes de caractères !

C’est inacceptable, donc on a besoin de trouver un compromis.

---

Bon, qu’a-t-on appris jusqu’ici ?  React a besoin d’appeler les classes (y compris celles transpilées par Babel) *avec* `new`, mais il doit aussi appeler les fonctions classiques ou fléchées (y compris celles transpilées par Babel) *sans* `new`.  Et il n’y a aucun moyen fiable de distinguer entre les deux.

**Si on ne peut pas résoudre un problème général, peut-on en résoudre un plus spécifique ?**

Quand vous définissez un composant comme classe, vous allez probablement étendre `React.Component`, afin de tirer parti des méthodes prédéfinies comme `this.setState()`.  **Plutôt que d’essayer de détecter toutes les classes, peut-on seulement détecter les descendantes de `React.Component` ?**

*Spoiler* : c’est exactement ce que fait React.

---

La manière idiomatique de vérifier si `Greeting` est une classe de composant React serait sans doute de tester si `Greeting.prototype instanceof React.Component` :

```jsx
class A {}
class B extends A {}

console.log(B.prototype instanceof A); // true
```

Je sais ce que vous vous dites.  C’est quoi ce truc ?!  Pour répondre à ça, il nous faut comprendre le fonctionnement des prototypes en JavaScript.

Vous avez peut-être entendu parler de la « chaîne de prototypes ».  Chaque objet en JavaScript est susceptible d’avoir un « prototype ».  Quand vous écrivez `fred.sayHi()` mais que `fred` est un objet qui n’a pas de propriété `sayHi`, on cherche cette propriété `sayHi` sur le prototype de `fred`.  Si on ne l'y trouve toujours pas, on cherche sur le prototype suivant dans la chaîne—le prototype du prototype de `fred`. Et ainsi de suite.

**Histoire de rajouter à la confusion, la propriété `prototype` d’une classe ou d’une fonction _ne référence pas_ le prototype de cette valeur.** Sérieux.

```jsx
function Person() {}

console.log(Person.prototype); // 🤪 Pas le prototype de Person
console.log(Person.__proto__); // 😳 Le prototype de Person
```

Donc la « chaîne de prototypes » est en fait plutôt `__proto__.__proto__.__proto__` que `prototype.prototype.prototype`. Ça m’a pris des années pour comprendre ça.

Que fait la propriété `prototype` d’une fonction ou classe, alors ? **C’est le `__proto__` fourni à tous les objets instanciés avec `new` sur cette classe ou fonction !**

```jsx{8}
function Person(name) {
  this.name = name;
}
Person.prototype.sayHi = function() {
  alert('Bonjour, je m’appelle ' + this.name);
}

var fred = new Person('Fred'); // Cale `fred.__proto__` sur `Person.prototype`
```

Et c’est le long de cette chaîne de `__proto__` que JavaScript recherche les propriétés :

```jsx
fred.sayHi();
// 1. fred a-t-il une propriété sayHi ? Non.
// 2. fred.__proto__ a-t-il une propriété sayHi ? Oui. Appelle-la !

fred.toString();
// 1. fred a-t-il une propriété toString ? Non.
// 2. fred.__proto__ a-t-il un propriété toString ? Non.
// 3. fred.__proto__.__proto__ a-t-il une propriété toString ? Oui. Appelle-la !
```

En pratique, vous ne devriez pratiquement jamais manipuler `__proto__` directement dans votre code, sauf si vous êtes en train de déboguer un truc lié à la chaîne de prototypes.  Si vous souhaitez mettre un truc à disposition dans `fred.__proto__`, vous êtes censés le placer dans `Person.prototype`.  En tout cas, c’était l’idée de base.

La propriété `__proto__` n’était même pas censée au départ être exposée  publiquement par les navigateurs, parce que la chaîne de prototypes était considérée comme un détail d’implémentation.  Mais certains navigateurs l’ont rendue publique et au final elle a fait l’objet d’une standardisation réticente (mais a ensuite été dépréciée au profit de `Object.getPrototypeOf()`).

**Et pourtant je trouve toujours hallucinant qu’une propriété appelée `prototype` ne vous fournisse pas le prototype d’une valeur** (par exemple, `fred.prototype` est indéfini parce que `fred` n’est pas une fonction).  Personnellement, je trouve que c’est la raison majeure pour laquelle même des développeurs expérimentés ont tendance à comprendre les prototypes JavaScript de travers.

---

Il est long cet article, hein ? Je dirais qu’on est à 80% là.  Tenez le coup.

<!-- RESUME -->

On sait que lorsqu’on dit `obj.foo`, JavaScript examine en fait `obj.__proto__`, `obj.__proto__.__proto__`, et ainsi de suite.

Avec les classes, on ne perçoit pas directement ce mécanisme, mais `extends` fonctionne aussi grâce à cette bonne vieille chaîne de prototypes.  C’est ainsi qu’une instance de classe React peut accéder à des méthodes comme `setState` :

```jsx{1,9,13}
class Greeting extends React.Component {
  render() {
    return <p>Bonjour</p>;
  }
}

let c = new Greeting();
console.log(c.__proto__); // Greeting.prototype
console.log(c.__proto__.__proto__); // React.Component.prototype
console.log(c.__proto__.__proto__.__proto__); // Object.prototype

c.render();   // Trouvé dans c.__proto__ (Greeting.prototype)
c.setState(); // Trouvé dans c.__proto__.__proto__ (React.Component.prototype)
c.toString(); // Trouvé dans c.__proto__.__proto__.__proto__ (Object.prototype)
```

En d’autres termes, **quand vous utilisez des classes, la chaîne des `__proto__` d’une instance reflète la hiérarchie des classes :**

```jsx
// chaîne des `extends`
Greeting
  → React.Component
    → Object (implicitement)

// chaîne des `__proto__`
new Greeting()
  → Greeting.prototype
    → React.Component.prototype
      → Object.prototype
```

2 Chainz.

---

Puisque la chaîne des `__proto__` reflète la hiérarchie des classes, nous pouvons vérifier si `Greeting` étend `React.Component` en commençant avec `Greeting.prototype`, puis en remontant le long de la chaîne des `__proto__` :

```jsx{3,4}
// chaîne des `__proto__`
new Greeting()
  → Greeting.prototype // 🕵️ On commence ici
    → React.Component.prototype // ✅ Trouvé !
      → Object.prototype
```

Et devinez quoi, `x instanceof Y` fait exactement ce type de recherche.  Il suit la chaîne démarrant avec `x.__proto__` à la recherche de `Y.prototype`.

D’habitude, on utilise ça pour déterminer si un objet est une instance d’une classe donnée :

```jsx
let greeting = new Greeting();

console.log(greeting instanceof Greeting); // true
// greeting (🕵️‍ On commence ici)
//   .__proto__ → Greeting.prototype (✅ Trouvé !)
//     .__proto__ → React.Component.prototype
//       .__proto__ → Object.prototype

console.log(greeting instanceof React.Component); // true
// greeting (🕵️‍ On commence ici)
//   .__proto__ → Greeting.prototype
//     .__proto__ → React.Component.prototype (✅ Trouvé !)
//       .__proto__ → Object.prototype

console.log(greeting instanceof Object); // true
// greeting (🕵️‍ On commence ici)
//   .__proto__ → Greeting.prototype
//     .__proto__ → React.Component.prototype
//       .__proto__ → Object.prototype (✅ Trouvé !)

console.log(greeting instanceof Banana); // false
// greeting (🕵️‍ On commence ici)
//   .__proto__ → Greeting.prototype
//     .__proto__ → React.Component.prototype
//       .__proto__ → Object.prototype (🙅‍ Pas trouvé !)
```

Mais ça marcherait tout aussi bien pour déterminer si une classe en étend une autre :

```jsx
console.log(Greeting.prototype instanceof React.Component);
// greeting
//   .__proto__ → Greeting.prototype (🕵️‍ On commence ici)
//     .__proto__ → React.Component.prototype (✅ Trouvé !)
//       .__proto__ → Object.prototype
```

Et voilà comment on pourrait déterminer si quelque chose est une classe de composant React ou une fonction classique.

---

Mais ce n’est pas ce que fait React. 😳

Un des pièges de la solution à base d’`instanceof`, c’est qu’elle ne marche pas lorsqu’on a de multiples copies de React dans la page, et que le composant qu’on examine hérite du `React.Component` provenant d’une *autre* copie de React.  Avoir plusieurs copies de React dans un même projet est une mauvaise idée pour plusieurs raisons, mais historiquement nous avons essayé d’éviter, autant que possible, que ça pose problème. (Ceci dit, avec les Hooks, on [devra peut-être](https://github.com/facebook/react/issues/13991) exiger l’unicité.)

Une autre heuristique possible serait de vérifier si une méthode `render` est présente sur le prototype.  Toutefois, à l’époque on [n’était pas sûrs](https://github.com/facebook/react/issues/4599#issuecomment-129714112) de la façon dont l’API évoluerait.  Chaque vérification entraîne un coût, on ne voulait pas avoir à en faire plusieurs.  Par ailleurs, ça ne marcherait pas non plus si `render` était définie comme méthode sur l’instance, avec la syntaxe des initialiseurs de champs par exemple.

De sorte qu’à la place, React [a ajouté](https://github.com/facebook/react/pull/4663) un drapeau spécial sur le composant de base.  React vérifie la présence de ce drapeau, et c’est comme ça qu’il sait si il a affaire à une classe de composant React ou non.

Au début le drapeau était défini sur la classe de base `React.Component` elle-même :

```jsx
// Dans React
class Component {}
Component.isReactClass = {};

// On peut le vérifier comme ceci
class Greeting extends Component {}
console.log(Greeting.isReactClass); // ✅ Oui
```

Seulement voilà, certaines implémentations de classes que nous voulions permettre [ne copiaient pas](https://github.com/scala-js/scala-js/issues/1900) les propriétés statiques (ou ne définissaient pas la propriété non standard `__proto__`), de sorte que le drapeau disparaissait.

C’est pourquoi React [a déplacé](https://github.com/facebook/react/pull/5021) ce drapeau vers `React.Component.prototype`:

```jsx
// Dans React
class Component {}
Component.prototype.isReactComponent = {};

// On peut le vérifier comme ceci
class Greeting extends Component {}
console.log(Greeting.prototype.isReactComponent); // ✅ Oui
```

**Et c’est littéralement tout ce qu’on a besoin de faire.**

Vous vous demandez peut-être pourquoi c’est un objet, et pas juste un booléen.  En pratique ça n’a pas beaucoup d’importance, mais les premières versions de Jest (avant que Jest soit Bien™) avait l’*automocking* activé par défaut.  Les mocks générés laissaient de côté les propriétés primitives, [ce qui pétait notre vérification](https://github.com/facebook/react/pull/4663#issuecomment-136533373). Merci Jest.

La vérification de `isReactComponent` reste [utilisée par React](https://github.com/facebook/react/blob/769b1f270e1251d9dbdce0fcbd9e92e502d059b8/packages/react-reconciler/src/ReactFiber.js#L297-L300) jusqu’à ce jour.

Si vous n’étendez pas `React.Component`, React ne trouvera pas `isReactComponent` sur le prototype et ne traitera pas le composant comme une classe.  Maintenant vous savez pourquoi [la réponse la plus populaire](https://stackoverflow.com/a/42680526/458193) à l’erreur `Cannot call a class as a function` consiste à ajouter `extends React.Component`. Pour finir, un [avertissement a été ajouté](https://github.com/facebook/react/pull/11168) si `prototype.render` existe mais que `prototype.isReactComponent` est manquant.

---

Vous trouvez peut-être que le titre de cet article était un leurre grossier. **La solution réelle est super simple, mais je suis parti sur une tangente de fou pour vous expliquer *pourquoi* React a fini par opter pour cette solution, et quelles étaient les alternatives.**

D’après ma propre expérience, c’est souvent le cas avec les APIs de bibliothèques.  Pour qu’une API soit facile à utiliser, on doit souvent considérer la sémantique du langage (voire, pour plusieurs langages, leurs évolutions à venir), la performance d’exécution, l’ergonomie avec ou sans étapes de transpilation, l’état de l’écosystème et des solutions de *packaging*, la capacité à produire des avertissements le plus en amont possible, et bien d’autres facteurs.  Le résultat final n’est pas toujours le plus élégant, mais doit être le plus pratique.

**Si l’API finale a du succès, _ses utilisateurs_ n’auront jamais à penser à ce processus.**  Ils peuvent ainsi se concentrer plutôt sur la création de leurs applications.

Mais si vous êtes par ailleurs curieux·se… c’est sympa de savoir comment ça marche sous le capot.
