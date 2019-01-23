---
title: Pourquoi écrit-on super(props) ?
date: '2018-11-30'
spoiler: Il y a une surprise à la fin.
---

Il paraît que les [Hooks](https://reactjs.org/docs/hooks-intro.html) sont le nouveau truc cool. Ironiquement, je souhaite commencer ce blog en parlant d’aspects amusants sur les composants écrits _sous forme de classes_. Incroyable !

**Ces petits pièges ne sont _pas_ importants pour une utilisation productive de React. Mais vous les trouverez peut-être amusants si vous aimez fouiller pour comprendre comment les choses marchent.**

Voici le premier.

---

J’ai écrit `super(props)` bien plus souvent que je ne veux bien l’admettre :

```jsx{3}
class Checkbox extends React.Component {
  constructor(props) {
    super(props);
    this.state = { isOn: true };
  }
  // ...
}
```

Bien sûr, la [proposition Class Fields](https://github.com/tc39/proposal-class-fields) nous permet de laisser tomber le formalisme :

```jsx
class Checkbox extends React.Component {
  state = { isOn: true };
  // ...
}
```

Une syntaxe similaire était [prévue](https://reactjs.org/blog/2015/01/27/react-v0.13.0-beta-1.html#es7-property-initializers) quand React 0.13 a commencé à prendre en charge les classes en 2015. Définir un `constructor` et appeler `super(props)` a toujours été considéré comme une solution temporaire en attendant que les initialiseurs de champs nous fournissent une alternative plus ergonomique.

Mais revenons à cet exemple qui se limite aux syntaxes ES2015 :

```jsx{3}
class Checkbox extends React.Component {
  constructor(props) {
    super(props);
    this.state = { isOn: true };
  }
  // ...
}
```

**Pourquoi appelle-t-on `super` ? Peut-on _ne pas_ l’appeler ? Si on doit l’appeler, que se passe-t-il si on ne passe pas `props` ? Y’a-t-il d’autres arguments ?** Allons vérifier tout ça.

---

En JavaScript, `super` fait référence au constructeur de la classe parente. (Dans notre exemple, ça pointe sur l’implémentation de `React.Component`.)

Point important, vous ne pouvez utiliser `this` dans un constructeur _qu’après_ avoir appelé le constructeur parent (si vous avez fait un `extends` spécifique). JavaScript ne vous laissera pas le faire trop tôt :

```jsx
class Checkbox extends React.Component {
  constructor(props) {
    // 🔴 On ne peut pas utiliser `this` à ce stade
    super(props);
    // ✅ Mais maintenant c’est bon !
    this.state = { isOn: true };
  }
  // ...
}
```

Il y a une bonne raison pour laquelle JavaScript vous force à exécuter le constructeur parent avant de vous laisser toucher à `this`. Imaginez cette hiérarchie de classes :

```jsx
class Person {
  constructor(name) {
    this.name = name;
  }
}

class PolitePerson extends Person {
  constructor(name) {
    this.greetColleagues(); // 🔴 Ça c’est interdit, lisez la raison dessous
    super(name);
  }
  greetColleagues() {
    alert('Salut les gens !');
  }
}
```

Imaginez que l’utilisation de `this` avant l’appel à `super` _soit permis_. Un mois plus tard, nous changerons peut-être `greetColleagues` pour inclure le nom de la personne dans le message :

```jsx
  greetColleagues() {
    alert('Salut les gens !');
    alert('Je m’appelle ' + this.name + ', enchantée !');
  }
```

Mais nous avons perdu de vue que `this.greetColleagues()` est appelée avant que notre appel à `super()` ait une chance d’initialiser `this.name`. Du coup `this.name` n’est même pas encore défini ! Comme vous pouvez le voir, il peut être délicat de bien comprendre le fonctionnement de ce genre de code.

Pour éviter ce genre de pièges, **JavaScript exige que si vous utilisez `this` dans un constructeur, vous _devez_ appeler `super` d’abord.** Que la classe parente puisse faire son boulot ! Et cette limitation s’applique également aux composants React définis par des classes :

```jsx
  constructor(props) {
    super(props);
    // ✅ On peut utiliser `this` désormais
    this.state = { isOn: true };
  }
```

Ce qui nous laisse avec une autre question : pourquoi passer `props` ?

---

Vous pensez peut-être que refiler `props` à `super` est nécessaire afin que le constructeur `React.Component` d’origine puisse initialiser `this.props` ?

```jsx
// Dans React
class Component {
  constructor(props) {
    this.props = props;
    // ...
  }
}
```

Et ce n’est pas très éloigné de la vérité—en fait, c’est [ce que ça fait](https://github.com/facebook/react/blob/1d25aa5787d4e19704c049c3cfa985d3b5190e0d/packages/react/src/ReactBaseClasses.js#L22).

Et pourtant, même si vous appelez `super()` sans passer `props` en argument, vous arriveriez toujours à accéder à `this.props` dans le `render` et d’autres méthodes. (Si vous ne me croyez pas, essayez par vous-même !)

Mais *comment ça marche* ? Eh bien, il se trouve que **React affecte aussi `props` sur l’instance juste après avoir appelé _votre_ constructeur.**

```jsx
// Dans React
const instance = new YourComponent(props);
instance.props = props;
```

Donc même si vous oubliez de passer `props` à `super()`, React les définirait tout de même par la suite. Il y a une raison à ça.

Quand React a commencé à prendre en charge les classes, il ne s’est pas limité aux classes ES6. L’objectif était de prendre en charge la plus large gamme d’abstractions de classes possible. On n’était [pas sûrs](https://reactjs.org/blog/2015/01/27/react-v0.13.0-beta-1.html#other-languages) des potentiels de succès de ClojureScript, CoffeeScript, ES6, Fable, Scala.js, TypeScript, ou d’autres solutions pour définir des composants. Résultat, React évitait volontairement d’avoir une opinion trop tranchée sur la nécessité d’appeler `super()`—même si c’est le cas dans les classes ES6.

Alors, devriez-vous juste écrire `super()` au lieu de `super(props)` ?

**Probablement pas, car ça pourrait causer de la confusion.** Bien sûr, React définira par la suite `this.props`, _après_ que votre constructeur aura été exécuté. Mais `this.props` n’en serait pas moins `undefined` _entre_ l’appel à `super` et la fin de votre constructeur :

```jsx{14}
// Dans React
class Component {
  constructor(props) {
    this.props = props;
    // ...
  }
}

// Dans votre code
class Button extends React.Component {
  constructor(props) {
    super(); // 😬 On a oublié de passer les props
    console.log(props); // ✅ {}
    console.log(this.props); // 😬 undefined
  }
  // ...
}
```

Déboguer ce type de situation peut même être encore plus difficile si le souci survient au sein d’une méthode appelée _depuis_ le constructeur. **Et voilà pourquoi je recommande de toujours appeler `super(props)`, même si ce n’est pas strictement nécessaire :**

```jsx
class Button extends React.Component {
  constructor(props) {
    super(props); // ✅ On a passé les props
    console.log(props); // ✅ {}
    console.log(this.props); // ✅ {}
  }
  // ...
}
```

Ça garantit que `this.props` est défini même avant la fin du constructeur.

---

Si vous utilisez React depuis longtemps, un dernier point vous chatouille peut-être.

Vous avez peut-être remarqué que lorsque vous utilisez l’API de Contextes dans des classes (aussi bien l’ancienne basée sur `contextTypes` que la plus récente, basée sur `contextType`, apparue dans React 16.6), `context` est passé en second argument au constructeur.

Alors pourquoi n’écrit-on pas plutôt `super(props, context)` ? On pourrait, mais le contexte est utilisé moins souvent, de sorte qu’on trébuche moins là-dessus.

**Avec la proposition Class Fields, ce type de piège disparaît de toutes façons presque entièrement.** Sans constructeur explicite, tous les arguments sont transmis automatiquement. C’est ce qui permet à une expression comme `state = {}` de référencer `this.props` ou `this.context` si nécessaire.

Avec les Hooks, on n’a même pas besoin de `super` ou `this`. Mais c’est un sujet pour un autre jour.
