---
title: Comment setState sait-il quoi faire ?
date: '2018-12-09'
spoiler: L’injection de dépendances c’est bien si vous n’avez pas besoin d’y penser.
---

Quand vous appelez `setState` dans un composant, que croyez-vous qu’il se passe ?

```jsx{11}
import React from 'react';
import ReactDOM from 'react-dom';

class Button extends React.Component {
  constructor(props) {
    super(props);
    this.state = { clicked: false };
    this.handleClick = this.handleClick.bind(this);
  }
  handleClick() {
    this.setState({ clicked: true });
  }
  render() {
    if (this.state.clicked) {
      return <h1>Merci</h1>;
    }
    return (
      <button onClick={this.handleClick}>
        Cliquez-moi !
      </button>
    );
  }
}

ReactDOM.render(<Button />, document.getElementById('container'));
```

Bien sûr, React refait le rendu du composant avec l’état `{ clicked: true }` et met à jour le DOM pour correspondre à l’élément `<h1>Merci</h1>` retourné.

Ça semble simple.  Mais attendez, est-ce *React* qui fait ça ? Ou *React DOM* ?

La mise à jour du DOM semble faire partie des responsabilités de React DOM.  Mais nous appelons `this.setState()`, et non une API de React DOM.  Et notre classe de base `React.Component` est définie dans React lui-même.

Alors comment `setState()`, au sein de `React.Component`, peut-elle mettre à jour le DOM ?

**Avertissement : tout comme [la plupart](/why-do-react-elements-have-typeof-property/) des [autres](/how-does-react-tell-a-class-from-a-function/) [articles](/why-do-we-write-super-props/) de ce blog, vous n’avez pas vraiment *besoin* de savoir tout ça pour être efficace avec React. Cet article est plus pour les personnes qui aiment voir ce qu’il y a derrière le rideau.  C’est complètement optionnel !**

---

On pourrait penser que la classe `React.Component` contient la logique de mise à jour du DOM.

Mais si tel était le cas, comment `this.setState()` pourrait-elle fonctionner dans d’autres environnements ?  Par exemple, les composants dans les applications React Native étendent aussi `React.Component`.  Ils appellent `this.setState()` tout comme nous ci-dessus, et pourtant React Native utilise les vues natives d’Android et iOS plutôt que le DOM.

Vous connaissez peut-être aussi React Test Renderer ou le Shallow Renderer.  Ces deux stratégies de test vous permettent de faire le rendu de composants normaux et d’appeler `this.setState()` dans leur code. Mais aucune des deux ne fonctionne avec le DOM.

Si vous avez déjà utilisé des moteurs de rendu (*renderers*) comme [React ART](https://github.com/facebook/react/tree/master/packages/react-art), vous pourriez aussi penser qu’il doit être possible d’utiliser plus d’un moteur de rendu dans la page. (Par exemple, les composants ART fonctionnent à l’intérieur d’une arborescence DOM.)  Du coup l’idée d’un drapeau ou d’une variable globale semble injouable.

Il semble que d’une façon ou d’une autre, **`React.Component` délègue la gestion des mises à jour d’état à du code spécifique à la plate-forme.**  Mais pour pouvoir comprendre comment ça se passe, il nous faut d’abord creuser un peu la façon dont les paquets sont séparés, et la raison de ce découpage.

---

Une idée reçue tenace soutient que le « moteur » de React vit dans le module `react`.  Il n’en est rien.

En fait, depuis la [découpe de modules dans React 0.14](https://reactjs.org/blog/2015/07/03/react-v0.14-beta-1.html#two-packages), le module `react` n’expose volontairement que les APIs pour *définir* les composants.  La majeure partie de l’*implémentation* de React vit dans les « moteurs de rendu » (*renderers*).

`react-dom`, `react-dom/server`, `react-native`, `react-test-renderer`, `react-art` sont autant d’exemples de moteurs (et vous pouvez [créer le vôtre](https://github.com/facebook/react/blob/master/packages/react-reconciler/README.md#practical-examples)).

C’est pourquoi le module `react` reste utile quelle que soit la plate-forme cible.  Tous ses exports, tels que `React.Component`, `React.createElement`, les utilitaires `React.Children` et (à terme) les [Hooks](https://reactjs.org/docs/hooks-intro.html), sont indépendants de la plate-forme cible.  Que vous utilisiez React DOM, React DOM Server ou React Native, vos composants les importeraient et les utiliseraient de la même façon.

À l’opposé, les modules de moteurs expose des APIs spécifiques à la plate-forme, telles que `ReactDOM.render()`, qui vous permet de « monter » votre arborescence d’éléments React au sein d’un nœud du DOM.  Chaque moteur fournit une API de ce genre.  Dans l’idéal, la majorité des *composants* ne devrait pas avoir à importer quoi que ce soit du moteur.  Ce qui les rend plus universels.

**Ce que la plupart des gens conçoivent comme le « moteur » de React réside dans chaque moteur de rendu individuel.**  De nombreux moteurs incorporent une copie du même code—on l’appelle le [« réconciliateur »](https://github.com/facebook/react/tree/master/packages/react-reconciler). Une [étape de build](https://reactjs.org/blog/2017/12/15/improving-the-repository-infrastructure.html#migrating-to-google-closure-compiler) fusionne le code du réconciliateur avec celui du moteur pour produire un bundle unique hautement optimisé afin d’améliorer les performances.  (Copier du code n’est généralement pas top pour la taille du bundle, mais la vaste majorité des utilisateurs de React n’ont besoin que d’un moteur à la fois, tel que `react-dom`.)

Le point à retenir ici, c’est que le module `react` vous permet seulement d’*utiliser* des fonctionnalités de React, mais ne sait absolument pas *comment* elles sont implémentées.  Ce sont les modules de moteurs (`react-dom`, `react-native`, etc.) qui fournissent l’implémentation des fonctionnalités de React et la logique spécifique à la plate-forme.  Une partie de ce code est partagée (le « réconciliateur »), mais c’est un détail d’implémentation des différents moteurs.

---

À présent nous savons pourquoi on a besoin de mettre à jour aussi bien les modules `react` que `react-dom` pour bénéficier des nouvelles fonctionnalités.  Par exemple, quand React 16.3 a ajouté l’API de Contextes, `React.createContext()` était exposée sur le module React.

Mais `React.createContext()` *n’implémente* pas vraiment la fonctionnalité de contexte. L’implémentation va différer par exemple entre React DOM et React DOM Server. Du coup, `createContext()` ne renvoie que quelques objets nus :

```jsx
// Un peu simplifié
function createContext(defaultValue) {
  let context = {
    _currentValue: defaultValue,
    Provider: null,
    Consumer: null
  };
  context.Provider = {
    $$typeof: Symbol.for('react.provider'),
    _context: context
  };
  context.Consumer = {
    $$typeof: Symbol.for('react.context'),
    _context: context,
  };
  return context;
}
```

Quand vous utilisez `<MyContext.Provider>` ou `<MyContext.Consumer>` dans votre code, c’est le *moteur* qui décide comment les traiter.  React DOM assurera le suivi des valeurs d’une certaine façon, mais React DOM Server pourrait très bien bosser différemment.

**Ainsi si vous mettez à jour `react` en 16.3+ mais négligez la mise à jour correspondante de `react-dom`, vous utiliseriez un moteur qui n’est pas encore au fait des types spéciaux `Provider` et `Consumer`.**  C’est pourquoi une version plus ancienne de `react-dom` [échouerait en déclarant ces types comme invalides](https://stackoverflow.com/a/49677020/458193).

La même mise en garde existe pour React Native.  Toutefois, contrairement à React DOM, une version de React n’entraîne pas obligatoirement la version associée de React Native.  Les deux ont des cycles de versions indépendants.  Le code du moteur mis à jour est [synchronisé séparément](https://github.com/facebook/react-native/commits/master/Libraries/Renderer/oss) au sein du dépôt React Native, à quelques semaines d’intervalle.  C’est pourquoi les fonctionnalités de React deviennent disponibles dans React Native à un rythme distinct de celui de React DOM.

---

Bon, donc on sait maintenant que le module `react` ne contient rien de bien intéressant, et que l’implémentation vit dans les moteurs comme `react-dom`, `react-native` et ainsi de suite.  Mais ça ne répond toujours pas à notre question.  Comment `setState()`, au sein de `React.Component`, « parle-t-il » au bon moteur ?

**Il s’avère que chaque moteur définit un champ spécial sur la classe créée.** Ce champ est appelée `updater`.  Ce n’est pas quelque chose que *vous* définiriez—c’est plutôt un champ défini par React DOM, React DOM Server ou React Native juste après avoir instancié votre classe :

```jsx{4,9,14}
// Dans React DOM
const inst = new YourComponent();
inst.props = props;
inst.updater = ReactDOMUpdater;

// Dans React DOM Server
const inst = new YourComponent();
inst.props = props;
inst.updater = ReactDOMServerUpdater;

// Dans React Native
const inst = new YourComponent();
inst.props = props;
inst.updater = ReactNativeUpdater;
```

Si on regarde [l’implémentation de `setState` dans `React.Component`](https://github.com/facebook/react/blob/ce43a8cd07c355647922480977b46713bd51883e/packages/react/src/ReactBaseClasses.js#L58-L67), elle se contente de déléguer le boulot au moteur qui a instancié le composant :

```jsx
// Un peu simplifié
setState(partialState, callback) {
  // Utilise le champ `updater` pour parler au moteur !
  this.updater.enqueueSetState(this, partialState, callback);
}
```

React DOM Server [pourrait vouloir](https://github.com/facebook/react/blob/ce43a8cd07c355647922480977b46713bd51883e/packages/react-dom/src/server/ReactPartialRenderer.js#L442-L448)
ignorer une mise à jour de l’état et vous avertir, tandis que React DOM et React Native laisseraient leurs copies du réconciliateur [gérer la mise à jour](https://github.com/facebook/react/blob/ce43a8cd07c355647922480977b46713bd51883e/packages/react-reconciler/src/ReactFiberClassComponent.js#L190-L207).

Et voilà comment `this.setState()` peut mettre à jour le DOM même s’il est défini dans le module noyau React.  Il récupère le `this.updater` qui a été défini par React DOM, et laisse ce dernier planifier et exécuter la mise à jour.

---

Maintenant qu’on sait ce qu’il en est pour les classes, qu’est-ce que ça donne avec les Hooks ?

Quand les gens commencent à lire la [proposition d’API pour les Hooks](https://reactjs.org/docs/hooks-intro.html), ils se demandent souvent : comment `useState` « sait-il quoi faire » ? Ils supposent apparemment que c’est plus « magique » que la classe `React.Component` et `this.setState()`.

Mais comme nous venons de le voir, l’implémentation de `setState()` dans cette classe de base a toujours été une illusion.  Elle ne fait rien d’autre que transférer l’appeler au moteur courant. Et le Hook `useState` [fait exactement la même chose](https://github.com/facebook/react/blob/ce43a8cd07c355647922480977b46713bd51883e/packages/react/src/ReactHooks.js#L55-L56).

**Au lieu du champ `updater`, les Hooks utilisent un objet « envoyeur ».** Quand vous appelez `React.useState()`, `React.useEffect()`, ou n’importe quel autre Hook prédéfini, ces appels sont transférés à l’envoyeur courant.

```jsx
// Dans React (un peu simplifié)
const React = {
  // La véritable propriété est en fait enfouie plus profondément,
  // essayez donc de la trouver !
  __currentDispatcher: null,

  useState(initialState) {
    return React.__currentDispatcher.useState(initialState);
  },

  useEffect(initialState) {
    return React.__currentDispatcher.useEffect(initialState);
  },
  // ...
};
```

Et les différents moteurs définissent l’envoyeur avant d’assurer le rendu du composant :

```jsx{3,8-9}
// Dans React DOM
const prevDispatcher = React.__currentDispatcher;
React.__currentDispatcher = ReactDOMDispatcher;
let result;
try {
  result = YourComponent(props);
} finally {
  // Restaurer l’envoyeur
  React.__currentDispatcher = prevDispatcher;
}
```

Par exemple, l’implémentation pour React DOM Server est [ici](https://github.com/facebook/react/blob/ce43a8cd07c355647922480977b46713bd51883e/packages/react-dom/src/server/ReactPartialRendererHooks.js#L340-L354), et l’implémentation au sein du réconciliateur partagé par React DOM et React Native est [là](https://github.com/facebook/react/blob/ce43a8cd07c355647922480977b46713bd51883e/packages/react-reconciler/src/ReactFiberHooks.js).

C’est pour cela qu’un moteur comme `react-dom` a besoin d’accéder au même module `react` que celui d’où viennent les Hooks. Sinon, votre composant ne « verra » pas l’envoyeur !  Ça pourrait ne pas marcher si vous avez [plusieurs copies de React](https://github.com/facebook/react/issues/13991) dans une même arborescence de composants. Ceci étant dit, ces situations ont toujours entraîné des bugs obscurs, de sorte que les Hooks vous forcent à régler votre problème de duplication avant qu’il ne vous coûte cher.

Par ailleurs, même si ce n’est pas recommandé, vous pouvez techniquement remplacer l’envoyeur vous-même pour des cas d’usage autour d’un outillage avancé. (J’ai menti sur le nom `__currentDispatcher`, mais vous pouvez trouver le véritable emplacement dans le dépôt de React.)  Par exemple, les React DevTools utiliseront [un envoyeur sur-mesure](https://github.com/facebook/react/blob/ce43a8cd07c355647922480977b46713bd51883e/packages/react-debug-tools/src/ReactDebugHooks.js#L203-L214) pour introspecter l’arborescence des Hooks en capturant les piles d’appels JavaScript.  *N’essayez pas ça chez vous.*

Ça signifie aussi que les Hooks ne sont pas intrinsèquement liés à React.  Si à l’avenir davantage de bibliothèques veulent réutiliser ces mêmes Hooks prédéfinis, en théorie l’envoyeur pourrait être extrait dans son propre module et exposé en tant qu’API à part entière, avec un nom sans doute moins « effrayant ».  En pratique, on préfère éviter les abstractions prématurées et attendre qu’un véritable besoin émerge.

Tant le champ `updater` que l’objet `__currentDispatcher` sont des manifestations d’un principe général de programmation appelée *l’injection de dépendances*.  Dans les deux cas, les moteurs « injectent » l’implémentation de fonctionnalités telles que `setState` dans le module React générique, afin que vos composants restent plus déclaratifs.

Vous n’avez pas à vous soucier de tout ça pour utiliser React.  On préfère que les utilisateurs de React passent davantage de temps à réfléchir à leur code applicatif qu’à des notions abstraites comme l’injection de dépendances.  Mais si vous vous êtes déjà demandé comment `this.setState()` ou `useState()` savent quoi faire, j’espère que cet article vous a aidés.
