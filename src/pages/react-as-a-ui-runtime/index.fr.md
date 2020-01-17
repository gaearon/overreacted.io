---
title: React vu comme une Runtime d’UI
date: '2019-02-02'
spoiler: Une description en profondeur du modèle de programmation de React.
---

La plupart des tutos présentent React comme une bibliothèque UI.  C’est logique puisque React *est* une bibliothèque UI.  C’est littéralement dans son slogan !

![Capture d’écran de la page d’accueil de React : « Une bibliothèque JavaScript pour construire des interfaces utilisateurs »](./react.png)

J’ai déjà parlé des défis de la création d’[interfaces utilisateurs](/the-elements-of-ui-engineering/).   Mais cet article parle de React sous un autre angle—plutôt en tant qu’[environnement d’exécution](https://en.wikipedia.org/wiki/Runtime_system). _(Dans la suite de cet article, pour des raisons de concision, nous emploierons le terme générique anglais **runtime**, NdT)_

**Cet article ne vous apprendera rien sur la création d’interfaces utilisateurs.**  Mais il vous aidera peut-être à comprendre plus en profondeur le modèle de programmation de React.

---

**Note : si vous _apprenez_ React, jetez plutôt un œil aux [docs](https://reactjs.org/docs/getting-started.html#learn-react).**

<font size="60">⚠️</font>

**On part pour une exploration en profondeur—cet article N’EST PAS destiné aux personnes qui débutent en React.**  Dans cet article, je décris la majeure partie du modèle de programmation de React en partant de principes premiers.  Je n’explique pas comment on s’en sert—plutôt comment il fonctionne.

Je vise ici un lectorat de développeur·se·s chevronné·e·s et de personnes qui bossent sur d’autres bibliothèques UI et se demandent quels compromis React a retenus.  J’espère que vous trouverez ce texte utile !

**Beaucoup de monde utilise React avec succès pendant des années sans avoir à réfléchir à la plupart de ces questions.**  On adopte ici clairement un regard sur React orienté développeurs, par opposition à, par exemple, une [vision de designer](http://mrmrs.cc/writing/developing-ui/).  Mais je trouve qu’il n’est pas inutile de proposer des ressources pour ces deux mondes.

Cet avertissement derrière nous, allons-y !

---

## Arbre hôte

Certains programmes produisent des nombres.  D’autres produisent des poèmes.  Les différents langages et leurs runtimes sont souvent optimisés pour un ensemble particulier de tâches, et React ne fait pas exception.

Les programmes utilisant React produisent en général **un arbre qui peut changer avec le temps**.  Ce peut être un [arbre DOM](https://www.npmjs.com/package/react-dom), ou une [hiérarchie iOS](https://developer.apple.com/library/archive/documentation/General/Conceptual/Devpedia-CocoaApp/View%20Hierarchy.html), un arbre de [primitives PDF](https://react-pdf.org/), ou même [des objets JSON](https://reactjs.org/docs/test-renderer.html). Dans tous les cas, on cherche en général à représenter une forme d’UI grâce à lui.  Nous l’appellerons l’arbre *hôte* parce qu’il fait partie de *l’environnement hôte* hors de React—tel que le DOM ou iOS.  L’arbre hôte a généralement une [API](https://developer.mozilla.org/en-US/docs/Web/API/Node/appendChild) impérative qui lui est [propre](https://developer.apple.com/documentation/uikit/uiview/1622616-addsubview).  React est une couche au-dessus de ça.

Alors en quoi React est-il utile ?  En termes abstraits, il vous aide à écrire un programme qui manipule de façon prévisible un arbre hôte complexe en réponse à des événements extérieurs tels que des interactions, une réponse réseau, des timers, etc.

Un outil spécialisé marche en général mieux qu’un outil générique parce qu’il peut imposer des contraintes particulières qui lui procurent un avantage.  React se base sur deux suppositions principales :

* **La stabilité.**  L’arbre hôte est relativement stable et la plupart des mises à jour n’en changent pas radicalement la structure générale.  Si une appli redisposait tous ses éléments interactifs dans une configuration totalement différente à chaque seconde, elle serait bien difficile à utiliser.  Où est passé ce bouton ? Pourquoi mon écran danse-t-il ?

* **La régularité.**  L’arbre hôte peut être décomposé en motifs d’UI qui gardent un aspect et un comportement cohérents (tels que des boutons, des listes, des avatars) plutôt que des formes aléatoires.

**Ces suppositions s’avèrent justes dans la plupart des UIs.**  Le côté face, c’est que React n’est pas l’outil adapté lorsqu’on manque de « motifs » stables dans la sortie produite.  Par exemple, React pourrait vous aider à écrire un client Twitter mais ne serait guère utile pour un [économiseur d’écran de tuyaux en 3D](https://www.youtube.com/watch?v=Uzx9ArZ7MUU).

## Instances hôtes

L’arbre hôte est constitué de nœuds.  Nous les appellerons des « instances hôtes ».

Dans un environnement DOM, les instances hôtes sont des nœuds DOM normaux—comme ces objets que vous obtenez en appelant `document.createElement('div')`.  Sur iOS, les instances hôtes pourraient être des valeurs JavaScript identifiant de façon unique des vues natives.

Les instances hôtes ont leurs propriétés propres (ex. `domNode.className` ou `view.tintColor`).  Elles peuvent aussi avoir d’autres instances hôtes comme éléments enfants.

(Ceci n’a rien à voir avec React—je décris ici les environnements hôtes.)

Une API est généralement disponible pour manipuler les instances hôtes. Par exemple, le DOM fournit des APIs telles que `appendChild`, `removeChild`, `setAttribute` et ainsi de suite.  Dans des applis React, nous n’appelons généralement pas ces APIs. C’est le boulot de React.

## Renderers

Un _renderer (moteur de rendu, mais nous utiliserons sans italiques le terme anglais établi **renderer**, NdT)_ apprend à React à parler à un environnement hôte spécifique et gère ses instances hôtes.  React DOM, React Native, et même [Ink](https://mobile.twitter.com/vadimdemedes/status/1089344289102942211) sont des renderers React. Vous pouvez aussi [créer votre propre renderer React](https://github.com/facebook/react/tree/master/packages/react-reconciler).

Les renderers React peuvent fonctionner dans l’un de deux modes.

La vaste majorité des renderers sont écrits sur le mode « mutatif ». C’est le mode de fonctionnement du DOM : on peut créer un nœud, définir ses propriétés, et plus tard lui ajouter ou retirer des enfants. Les instances hôtes sont complètement modifiables.

React peut également fonctionner en mode « persistant ». Ce mode est là pour les environnements qui ne fournissent pas de méthodes du type `appendChild()`, mais au contraire clonent l’arbre parent et remplacent systématiquement l’enfant de plus haut niveau.  L’immutabilité au niveau de l’arbre hôte facilite le recours au multi-thread. [React Fabric](https://facebook.github.io/react-native/blog/2018/06/14/state-of-react-native-2018) en tire parti.

En tant qu’utilisateurs de React, nous n’avons jamais besoin de penser à ces nœuds.  Je veux juste insister sur le fait que React n’est pas juste un adaptateur entre deux modes.  Son utilité est indépendante du paradigme d’API des vues de bas niveau qu’il cible.

## Éléments React

Dans l’environnement hôte, une instance hôte (telle qu’un nœud DOM) constitue le plus petit bloc de construction.  Dans React, ce plus petit bloc est un *élément React*.

Un élément React est un objet JavaScript nu.  Il *décrit* une instance hôte.

```jsx
// JSX est un sucre syntaxique pour ces objets.
// <button className="blue" />
{
  type: 'button',
  props: { className: 'blue' }
}
```

Un élément React est léger et n’est pas associé à une instance hôte. Encore une fois, il se contente de *décrire* ce que vous voulez voir à l’écran.

Tout comme les instances hôtes, les éléments React peuvent former un arbre :

```jsx
// JSX est un sucre syntaxique pour ces objets.
// <dialog>
//   <button className="blue" />
//   <button className="red" />
// </dialog>
{
  type: 'dialog',
  props: {
    children: [{
      type: 'button',
      props: { className: 'blue' }
    }, {
      type: 'button',
      props: { className: 'red' }
    }]
  }
}
```

*(Remarque : j’ai laissé de côté [certaines propriétés](/why-do-react-elements-have-typeof-property/) qui n’ont pas d’intérêt pour cette explication.)*

Rappelez-vous cependant que **les éléments React n’ont pas leur propre identité persistante.**  Ils sont censés être re-créés et jetés à tout bout de champ.

Les éléments React sont immuables.  Par exemple, vous ne pouvez pas changer les enfants ni une propriété d’un élément React.  Si vous voulez afficher quelque chose de différent par la suite, vous devrez le *décrire* à l’aide d’un nouvel arbre d’éléments React créé à partir de zéro.

J’aime considérer les éléments React comme les images distinctes d’un film.  Ils représentent ce à quoi l’UI devrait ressembler à un point précis dans le temps.  Ils ne changent pas.

## Point d’entrée

Chaque renderer React a un « point d’entrée ».  C’est l’API qui nous permet de dire à React d’afficher un arbre d’éléments React donné au sein d’une instance hôte conteneur.

Par exemple, le point d’entrée de React DOM est `ReactDOM.render` :

```jsx
ReactDOM.render(
  // { type: 'button', props: { className: 'blue' } }
  <button className="blue" />,
  document.getElementById('container')
);
```

Quand nous écrivons `ReactDOM.render(reactElement, domContainer)`, nous disons en fait : **« Cher React, fais que l’arbre hôte dans `domContainer` reflète celui de mon `reactElement`. »**

React va regarder `reactElement.type` (dans notre exemple, `'button'`) et demander au renderer de React DOM de créer une instance hôte adaptée et d’en définir les propriétés :

```jsx{3,4}
// Quelque part dans le renderer ReactDOM (simplifié)
function createHostInstance(reactElement) {
  let domNode = document.createElement(reactElement.type);
  domNode.className = reactElement.props.className;
  return domNode;
}
```

Dans cet exemple, en pratique React fera ceci :

```jsx{1,2}
let domNode = document.createElement('button');
domNode.className = 'blue';

domContainer.appendChild(domNode);
```

Si l’élément React a des éléments enfants dans `reactElement.props.children`, React va récursivement créer des instances hôtes pour eux aussi lors du premier rendu.

## Réconciliation

Que se passe-t-il si nous appelons `ReactDOM.render()` deux fois avec le même conteneur ?

```jsx{2,11}
ReactDOM.render(
  <button className="blue" />,
  document.getElementById('container')
);

// ... plus tard ...

// Ce code doit-il *remplacer* l’instance hôte du
// bouton, ou simplement mettre à jour une propriété
// sur l’instance existante ?
ReactDOM.render(
  <button className="red" />,
  document.getElementById('container')
);
```

Encore une fois, le boulot de React consiste à *faire que l’arbre hôte corresponde à l’arbre d’éléments React fourni*. Le processus qui détermine *quoi* faire dans l’arbre d’instances hôtes en réponse à de nouvelles informations est parfois appelé [réconciliation](https://reactjs.org/docs/reconciliation.html).

Il y a deux façons de s’y prendre.  Une version simplifiée de React pourrait juste dégager l‘arbre existant et le recréer à partir de zéro :

```jsx
let domContainer = document.getElementById('container');
// Effacer l’arbre
domContainer.innerHTML = '';
// Créer le nouvel arbre d’instances hôtes
let domNode = document.createElement('button');
domNode.className = 'red';
domContainer.appendChild(domNode);
```

Mais dans le DOM, cette approche est lente et perd des informations importantes telles que le focus, la sélection, l’état du défilement, et ainsi de suite.  Au lieu de ça, nous voulons que React fasse quelque chose comme ceci :

```jsx
let domNode = domContainer.firstChild;
// Mettre à jour l’instance hôte existante
domNode.className = 'red';
```

En d’autres termes, React a besoin de décider quand _mettre à jour_ une instance hôte existante pour correspondre à un nouvel élément React, et quand en créer une _nouvelle_.

Ce qui pose la question de *l’identité*.  L’élément React peut être différent à chaque fois, mais quand se rapporte-t-il à la même instance hôte, conceptuellement ?

Dans notre exemple, la réponse est simple.  Nous affichions un `<button>` comme premier (et seul) enfant, et nous voulons afficher un `<button>` à nouveau, à la même position.  Nous avons déjà une instance hôte `<button>` alors pourquoi en re-créer une ?  Contentons-nous de la réutiliser.

Voilà qui est assez proche de la façon dont React aborde ce problème.

**Si un type d’élément à la même position dans l’arbre « correspond » entre les rendus précédent et suivant, React réutilise l’instance hôte existante.**

Voici un exemple commenté qui montre *grosso modo* ce que fait React :

```jsx{9,10,16,26,27}
// let domNode = document.createElement('button');
// domNode.className = 'blue';
// domContainer.appendChild(domNode);
ReactDOM.render(
  <button className="blue" />,
  document.getElementById('container')
);

// Instance hôte réutilisable ? Oui ! (button → button)
// domNode.className = 'red';
ReactDOM.render(
  <button className="red" />,
  document.getElementById('container')
);

// Instance hôte réutilisable ? Non ! (button → p)
// domContainer.removeChild(domNode);
// domNode = document.createElement('p');
// domNode.textContent = 'Hello';
// domContainer.appendChild(domNode);
ReactDOM.render(
  <p>Hello</p>,
  document.getElementById('container')
);

// Instance hôte réutilisable ? Oui ! (p → p)
// domNode.textContent = 'Goodbye';
ReactDOM.render(
  <p>Goodbye</p>,
  document.getElementById('container')
);
```

La même heuristique est utilisée pour les arbres enfants.  Par exemple, quand nous mettons à jour un `<dialog>` avec deux `<button>s` à l’intérieur, React décide d’abord s’il peut réutiliser le `<dialog>`, puis répète cette procédure de décision pour chaque enfant.

## Conditions

Si React réutilise les instances hôtes seulement quand les types d’éléments « correspondent » d’une mise à jour à l’autre, comment produire du contenu conditionnel ?

Imaginons que nous voulions commencer par afficher seulement un champ, pour ensuite produire un message avant lui :

```jsx{12}
// Premier rendu
ReactDOM.render(
  <dialog>
    <input />
  </dialog>,
  domContainer
);

// Rendu suivant
ReactDOM.render(
  <dialog>
    <p>Je viens d’être ajouté ici !</p>
    <input />
  </dialog>,
  domContainer
);
```

Dans cet exemple, l’instance hôte `<input>` serait re-créée.  React parcourerait l’arbre des éléments, le comparant à la version précédente :

* `dialog → dialog` : Instance hôte réutilisable ? **Oui—le type correspond.**
  * `input → p` : Instance hôte réutilisable ? **Non, le type a changé !** Il faut retirer le `input` existant et crée une nouvelle instance hôte `p`.
  * `(rien) → input` : Il faut créer une nouvelle instance hôte `input`.

Ainsi, le code de mise à jour exécuté par React ressemblerait à ceci :

```jsx{1,2,8,9}
let oldInputNode = dialogNode.firstChild;
dialogNode.removeChild(oldInputNode);

let pNode = document.createElement('p');
pNode.textContent = 'Je viens d’être ajouté ici !';
dialogNode.appendChild(pNode);

let newInputNode = document.createElement('input');
dialogNode.appendChild(newInputNode);
```

Ce n’est pas idéal parce que *conceptuellement* le `<input>` n’a pas été *remplacé* par le `<p>`—il a juste bougé.  On ne veut pas perdre sa sélection, son état de focus, et son contenu en re-créant son DOM.

Même si ce problème a une solution simple (que nous allons voir dans un instant), il ne survient que rarement dans les applications React.  Il est intéressant de voir pourquoi.

En pratique, vous appeleriez rarement `ReactDOM.render`.  Les applis React ont plutôt tendance à être décomposées en fonctions du genre de celle-ci :

```jsx
function Form({ showMessage }) {
  let message = null;
  if (showMessage) {
    message = <p>Je viens d’être ajouté ici !</p>;
  }
  return (
    <dialog>
      {message}
      <input />
    </dialog>
  );
}
```

Cet exemple ne souffre pas du problème que nous venons de décrire.  Il est peut-être plus facile de comprendre pourquoi en examinant la notation objet plutôt que son JSX.  Regardez donc l’arbre des éléments enfants de `dialog` :

```jsx{12-15}
function Form({ showMessage }) {
  let message = null;
  if (showMessage) {
    message = {
      type: 'p',
      props: { children: 'Je viens d’être ajouté ici !' }
    };
  }
  return {
    type: 'dialog',
    props: {
      children: [
        message,
        { type: 'input', props: {} }
      ]
    }
  };
}
```

**Peu importe que `showMessage` soit `true` ou `false`, le `<input>` est le second enfant et sa position dans l’arbre ne change pas d’un rendu à l’autre.**

Si `showMessage` passait de `false` à `true`, React parcourerait l’arbre d’éléments, en le comparant à la version précédente :

* `dialog → dialog` : Instance hôte réutilisable ? **Oui—le type correspond.**
  * `(null) → p` : Il faut créer une nouvelle instance hôte `p`.
  * `input → input` : Instance hôte réutilisable ? **Oui—le type correspond.**

Et le code exécuté par React ressemblerait à ceci :

```jsx
let inputNode = dialogNode.firstChild;
let pNode = document.createElement('p');
pNode.textContent = 'Je viens d’être ajouté ici !';
dialogNode.insertBefore(pNode, inputNode);
```

Pas de perte de l‘état du champ désormais.

## Listes

Il suffit généralement de comparer les types d’éléments pour une position donnée dans l’arbre afin de décider si on réutilise ou re-crée l’instance hôte correspondante.

Mais ça ne marche bien que si les positions des enfants sont stables, sans réordonnancement.  Dans notre exemple précédent, même si on pourrait qualifier `message` de « trou », nous savions quand même que le champ apparaît après le message, et qu’il n’y avait pas d’autre enfant.

Avec des listes dynamiques, on ne peut jamais être sûrs que l’ordre est stable :

```jsx
function ShoppingList({ list }) {
  return (
    <form>
      {list.map(item => (
        <p>
          Vous avez acheté {item.name}
          <br />
          Combien en voulez-vous : <input />
        </p>
      ))}
    </form>
  )
}
```

Si jamais la `list` de notre panier de courses est réordonnée, React verra que tous les éléments `p` et `input` à l’intérieur ont le même type, et ne saura pas qu’il doit les déplacer. (Du point de vue de React, les *éléments eux-mêmes* ont changé, et non leur ordre.)

Le code exécuté par React pour réordonner 10 éléments ressemblerait à ceci :

```jsx
for (let i = 0; i < 10; i++) {
  let pNode = formNode.childNodes[i];
  let textNode = pNode.firstChild;
  textNode.textContent = 'Vous avez acheté ' + items[i].name;
}
```

Ainsi, au lieu de les *réordonner*, React opterait plutôt pour *mettre à jour* chacun d’eux.  Ça peut engendrer des problèmes de performance, voire des bugs.  Par exemple, le contenu du premier champ resterait reflété dans le premier champ *après* le tri—même si conceptuellement ils pouvaient utiliser des produits distincts dans le panier !

**C’est pourquoi React vous asticote pour que vous fournissiez une propriété spéciale appelée `key` chaque fois que vous utilisez un tableau d’éléments dans votre rendu :**

```jsx{5}
function ShoppingList({ list }) {
  return (
    <form>
      {list.map(item => (
        <p key={item.productId}>
          Vous avez acheté {item.name}
          <br />
          Combien en voulez-vous : <input />
        </p>
      ))}
    </form>
  )
}
```

Une `key` indique à React qu’il devrait considérer un élément comme étant *conceptuellement* le même, quand bien même sa *position* au sein de son élément parent évolue d’un rendu à l’autre.

Quand React verra `<p key="42">` au sein d’un `<form>`, il vérifiera que le rendu précédent contenait également un `<p key="42">` au sein du même `<form>`.  Ça marche même si les enfants du `<form>` ont changé d’ordre.  React réutilisera l’instance hôte précédente avec la même clé si elle existe, et réordonnera les autres éléments de même niveau en fonction de ça.

Remarquez bien que `key` n’a d’importance qu’au sein d’un élément parent React précis, tel que `<form>`.  React n’essaiera pas de faire correspondre des éléments de clé identique situés dans des parents différents. (React n’a pas de méthode idiomatique pour déplacer une instance hôte d’un parent à l’autre sans la re-créer).

Comment choisir une bonne valeur pour `key` ?  Une manière simple de répondre à cette question consiste à se demander : **quand est-ce que _vous_ diriez qu’un élément est le « même », indépendamment de l’ordre ?**  Par exemple, dans notre panier d’achats, l’ID du produit identifie chaque élément de façon unique parmi ceux de même niveau.

## Composants

Nous avons déjà vu des fonctions qui renvoient des éléments React :

```jsx
function Form({ showMessage }) {
  let message = null;
  if (showMessage) {
    message = <p>Je viens d’être ajouté ici !</p>;
  }
  return (
    <dialog>
      {message}
      <input />
    </dialog>
  );
}
```

Nous appelons ces fonctions des *composants*.  Elles nous permettent de créer notre propre « boîte à outils » de boutons, avatars, commentaires, etc.  Les composants sont la raison d’être de React.

Les composants prennent un argument—un objet. Il contient des « props » (le raccourci de « propriétés »).  Ici, `showMessage` est une prop.  Elles jouent un rôle similaire à des arguments nommés.

## Pureté

Les composants React sont supposés purs vis-à-vis de leurs props.

```jsx
function Button(props) {
  // 🔴 Ça ne marche pas
  props.isActive = true;
}
```

De façon générale, le code mutatif n’est pas du React idiomatique. (Nous explorerons plus tard la manière idiomatique de mettre à jour l’UI en réponse à des événements.)

En revanche, les *mutations locales* ne posent aucun souci :

```jsx{2,5}
function FriendList({ friends }) {
  let items = [];
  for (let i = 0; i < friends.length; i++) {
    let friend = friends[i];
    items.push(
      <Friend key={friend.id} friend={friend} />
    );
  }
  return <section>{items}</section>;
}
```

Nous avons créé `items` *pendant le rendu* et aucun autre composant ne l’a « vu », de sorte que nous pouvons le modifier autant qu’on le souhaite avant de l’intégrer au résultat du rendu.  Pas besoin de faire des contorsions de code pour éviter ce genre de mutations locales.

Dans le même esprit, l’initialisation tardive est acceptable même si elle n’est pas totalement « pure » :

```jsx
function ExpenseForm() {
  // Acceptable si ça n’affecte pas d’autres composants :
  SuperCalculator.initializeIfNotReady();

  // Suite du rendu...
}
```

Tant qu’il reste possible d’appeler le composant plusieurs fois de façon fiable, et que ça n’affecte pas le rendu d’autres composants, React ne se soucie pas de savoir si votre composant est 100% pur au sens strict de la programmation fonctionnelle. L’[idempotence](https://stackoverflow.com/questions/1077412/what-is-an-idempotent-operation) est plus importante pour React que la pureté.

Ceci étant dit, les effets de bord qui sont directement visibles pour l’utilisateur ne sont pas autorisés dans les composants React.  En d’autres termes, simplement *appeler* une fonction composant ne devrait pas en soi produire de changement à l’écran.

## Récursivité

Comment *utiliser* des composants au sein d’autres composants ?  Les composants sont des fonctions, donc on *pourrait* juste les appeler :

```jsx
let reactElement = Form({ showMessage: true });
ReactDOM.render(reactElement, domContainer);
```

Cependant, ce n’est *pas* la façon idiomatique d’utiliser des composants dans la runtime React.

Non, la manière idiomatique d’utiliser un composant consiste à utiliser le même mécanisme que nous avons déjà vu : les éléments React. **Ça signifie que vous n’appelez pas directement une fonction composant, mais laissez React le faire plus tard pour vous** :

```jsx
// { type: Form, props: { showMessage: true } }
let reactElement = <Form showMessage={true} />;
ReactDOM.render(reactElement, domContainer);
```

Et quelque part dans React, votre composant sera appelé :

```jsx
// Quelque part dans React
let type = reactElement.type; // Form
let props = reactElement.props; // { showMessage: true }
let result = type(props); // Ce que Form renvoie
```

Les noms des fonctions composants ont par convention des initiales majuscules.  Lorsque la transformation du JSX voit `<Form>` au lieu de `<form>`, elle transforme le `type` de l’objet en identifiant plutôt qu’en chaîne :

```jsx
console.log(<form />.type); // Chaîne 'form'
console.log(<Form />.type); // Fonction Form
```

Il n’y a pas de mécanisme global d’enregistrement—on réfère littéralement à `Form` par son nom lorsqu’on tape `<Form />`. Si `Form` n’existe pas dans la portée courante, vous verrez une erreur JavaScript comme lorsque vous utilisez un nom de variable incorrect.

**OK, alors que fait React quand le type d’un élément est une fonction ?  Il appelle votre composant, et demande quel élément _celui-ci_ veut afficher.**

Ce processus continue récursivement, comme le décrit en détail [cet article](https://reactjs.org/blog/2015/12/18/react-components-elements-and-instances.html).  En résumé, ça ressemble à ça :

- **Vous :** `ReactDOM.render(<App />, domContainer)`
- **React :** Hé `App`, tu affiches quoi ?
  - `App`: J’affiche un `<Layout>` avec un `<Content>` dedans.
- **React :** Hé `Layout`, tu affiches quoi ?
  - `Layout`: J’affiche mes enfants dans un `<div>`. Là j’ai comme enfant un `<Content>` du coup j’imagine qu’il va dans le `<div>`.
- **React :** Hé `<Content>`, tu affiches quoi ?
  - `Content`: J’affiche un `<article>` avec du texte et un `<Footer>` à l’intérieur.
- **React :** Hé `<Footer>`, tu affiches quoi ?
  - `Footer`: J’affiche un `<footer>` avec encore du texte.
- **React :** OK, alors voilà :

```jsx
// Structure DOM résultante
<div>
  <article>
    Du texte
    <footer>encore du texte</footer>
  </article>
</div>
```

Voilà pourquoi nous disons que la réconciliation est récursive.  Quand React parcourt l’arbre d’éléments, il peut rencontrer un élément dont le `type` est un composant.  Il va alors l’appeler et continuer à descendre dans l’arbre des éléments React renvoyés.  Lorsqu’il ne restera plus de composants à appeler, React saura quoi changer dans l’arbre hôte.

Les mêmes règles de réconciliation que nous avons vues plus haut s’appliquent ici aussi. Si le `type` à une position donnée (déterminée par l’index et la `key` optionnelle) évolue, React jettera les instances hôtes à l’intérieur et les re-créera.

## Inversion de contrôle

Vous vous demandez peut-être pourquoi nous n’appelons pas simplement les composants en direct ?  Pourquoi écrire `<Form />` plutôt que `Form()` ?

**React est mieux à même de faire son boulot s’il « voit » vos composants plutôt que juste l’arbre des éléments React obtenu après les avoir appelés récursivement.**

```jsx
// 🔴 React ignore l’existence-même de Layout et Article.
// C’est vous qui les appelez.
ReactDOM.render(
  Layout({ children: Article() }),
  domContainer
)

// ✅ React sait que Layout et Article existent.
// React les appelle.
ReactDOM.render(
  <Layout><Article /></Layout>,
  domContainer
)
```

C’est un exemple classique d’[inversion de contrôle](https://fr.wikipedia.org/wiki/Inversion_de_contrôle).  En laissant React prendre le contrôle des appels de nos composants, on obtient quelques possibilités intéressantes :

* **Les composants deviennent plus que de simples fonctions.**  React peut ajouter des fonctionnalités aux fonctions composants telles qu’un *état local* associé à l’identité du composant dans l’arbre.  Une bonne runtime fournit des abstractions fondamentales qui correspondent au problème traité.  Comme nous l’avons déjà mentionné, React est spécifiquement conçu pour des programmes qui affichent des arbres d’UI et répondent aux interactions.  Si vous appelez les composants directement, vous devez construire ces fonctionnalités vous-mêmes.

* **Les types de composants participent à la réconciliation.**  En laissant React appeler vos composants, vous lui en dites davantage sur la structure conceptuelle de votre arbre.  Par exemple, quand vous passez du rendu d’une page  `<Feed>` à celui d’une page `<Profile>`, React n’essaiera pas de ré-utiliser des instances hôtes à l’intérieur—tout comme lorsque vous remplacez un `<button>` par un `<p>`.  Tout l’état disparaît—ce qui est généralement une bonne chose lorsqu’on passe au rendu d’une vue conceptuellement distincte.  Vous n’avez sans doute pas envie de préserver les valeurs des champs lorsque vous passez d’un `<PasswordForm>` à un `<MessengerChat>`, même si des positions de `<input>` dans l’arbre correspondent par pur hasard.

* **React peut différer la réconciliation.**  Si React a la main sur l’appel de vos composants, il peut faire pas mal de choses intéressantes.  Par exemple, il peut laisser le navigateur avancer sur ses autres tâches entre des appels de composants, afin que le rendu d’un gros arbre de composants [ne bloque pas le thread principal](https://reactjs.org/blog/2018/03/01/sneak-peek-beyond-react-16.html).  Il est délicat d’orchestrer ce genre de choses manuellement sans ré-implémenter une large portion de React.

* **Le débogage est facilité.**  Si les composants sont des citoyens de premier ordre dont la bibliothèque a connaissance, on peut construire [des outils développeurs avancés](https://github.com/facebook/react-devtools) pour l’introspection lors du développement.

Le dernier avantage que présente l’appel de nos fonctions composants par React, c’est *l’évaluation paresseuse*.  Voyons ce que j’entends par là.

## Évaluation paresseuse

Quand on appelle des fonctions en JavaScript, leurs arguments sont évalués avant l’appel :

```jsx
// (2) Ceci est calculé en second
eat(
  // (1) Ceci est calculé en premier
  prepareMeal()
);
```

C’est généralement ce à quoi les développeurs JavaScript s’attendent, parce que les fonctions JavaScript peuvent avoir des effets de bord implicites.  Ce serait surprenant d’appeler une fonction qui ne s’exécuterait en fait qu’une fois que JavaScript « utilise » son résultat d’une façon ou d’une autre.

Cependant, les composants React sont [relativement](#pureté) purs. Il n’y a absolument aucune raison de les exécuter si nous savons que leur résultat n’apparaîtra pas à l’écran.

Prenons le composant suivant qui met un `<Comments>` dans une `<Page>` :

```jsx{11}
function Story({ currentUser }) {
  // return {
  //   type: Page,
  //   props: {
  //     user: currentUser,
  //     children: { type: Comments, props: {} }
  //   }
  // }
  return (
    <Page user={currentUser}>
      <Comments />
    </Page>
  );
}
```

Le composant `Page` pourrait afficher ses enfants à l’intérieur d’un `Layout` :

```jsx{4}
function Page({ user, children }) {
  return (
    <Layout>
      {children}
    </Layout>
  );
}
```

*(`<A><B /></A>` en JSX est la même chose que `<A children={<B />} />`.)*

Mais que se passerait-il si on avait une condition de court-circuit ?

```jsx{2-4}
function Page({ user, children }) {
  if (!user.isLoggedIn) {
    return <h1>Veuillez vous identifier</h1>;
  }
  return (
    <Layout>
      {children}
    </Layout>
  );
}
```

Si nous appelions `Comments()` en tant que fonction, il s’exécuterait immédiatement, que `Page` veuille ou non l’utiliser dans le rendu :

```jsx{4,8}
// {
//   type: Page,
//   props: {
//     children: Comments() // Toujours exécuté !
//   }
// }
<Page>
  {Comments()}
</Page>
```

Mais si nous passons un élément React, nous n’éxécutons pas du tout `Comments` nous-mêmes :

```jsx{4,8}
// {
//   type: Page,
//   props: {
//     children: { type: Comments }
//   }
// }
<Page>
  <Comments />
</Page>
```

Ça permet à React de décider quand et *si* il va l’appeler.  Si notre composant `Page` ignore sa prop `children` et affiche `<h1>Veuillez vous identifier</h1>` à la place, React n’essaiera même pas d’appeler la fonction `Comments`.  Ça servirait à quoi ?

C’est une bonne chose, parce que ça nous permet non seulement d’éviter un travail de rendu superflu qui serait ensuite jeté, mais ça rend aussi notre code plus robuste.  (On se fiche de savoir si `Comments` lèverait ou non une exception lorsque l’utilisateur n’est pas identifié—elle ne sera pas appelée.)

## État

Nous avons parlé [plus haut](#réconciliation) de l’identité, et de la façon dont la « position » conceptuelle d’un élément dans l’arbre indique à React s’il doit réutiliser une instance hôte ou en créer une nouvelle. Les instances hôtes peuvent avoir des tas d’états locaux : le focus, la sélection, la valeur saisie, etc.  Nous voulons préserver cet état à travers les mises à jour qui affichent conceptuellement la même UI.  Nous voulons aussi le détruire de façon prévisible lorsque nous affichons quelque chose de conceptuellement distinct (comme lorsque nous passons d’un `<SignupForm>` à un `<MessengerChat>`).

**L’état local est si utile que React permet à *vos propres* composants d’en avoir un aussi.**  Les composants restent des fonctions mais React les dope avec des fonctionnalités utiles pour faire de l’UI.  L’état local associé à leur position dans l’arbre fait partie de ces améliorations.

Nous appelons ces fonctionnalités des *Hooks*. Par exemple, `useState` est un Hook.

```jsx{2,6,7}
function Example() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>Vous avez cliqué {count} fois</p>
      <button onClick={() => setCount(count + 1)}>
        Cliquez-moi
      </button>
    </div>
  );
}
```

Il renvoie un duo de valeurs : l’état courant et une fonction qui le met à jour.

La syntaxe de [déstructuration positionnelle](https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Opérateurs/Affecter_par_décomposition#Décomposition_d'un_tableau) nous permet de donner des noms libres à nos variables d’état.  Par exemple, j’ai appelé ce duo `count` et `setCount`, mais ça aurait tout aussi bien pu être `banana` et `setBanana`.  Dans la suite de cet article, j’utilisera `setState` pour parler de la deuxième valeur, indépendamment de son nom effectif dans les différents exemples.

*(Vous pouvez en apprendre davantage sur `useState` et les autres Hooks fournis par React [ici](https://reactjs.org/docs/hooks-intro.html).)*

## Cohérence

Même si nous souhaitions découper le processus de réconciliation lui-même en étapes de travail [non-bloquantes](https://www.youtube.com/watch?v=mDdgfyRB5kg), nous devrions tout de même effectuer les opérations réelles sur l’arbre hôte en une seule passe synchrone.  Ainsi nous pouvons nous assurer que l’utilisateur ne verra pas une UI mise à jour à moitié, et que le navigateur n’effectuera pas inutilement de la mise en page ou des calculs de style pour des états intermédiaires que l’utilisateur ne devrait même pas voir.

C’est pourquoi React découpe tout son travail en « phase de rendu » et « phase de commit ». La *phase de rendu* décrit l’appel de vos composants par React et la réconciliation.  Elle peut être interrompue de façon fiable et [à l’avenir](https://reactjs.org/blog/2018/03/01/sneak-peek-beyond-react-16.html) sera asynchrone. La *phase de commit* décrit les manipulations de l’arbre hôte par React.  Elle est toujours synchrone.

## Mémoïsation

Quand un parent planifie une mise à jour en appelant `setState`, React réconcilie par défaut tout l’arbre de ses enfants.  Il procède ainsi parce qu’il ne sait pas si une mise à jour dans le parent affecterait ou non les enfants, aussi il opte par défaut pour une garantie de cohérence.  Ça semble très coûteux dit comme ça, mais en pratique ce n’est jamais un problème pour des arbres enfants de petite et moyenne tailles.

Lorsque ces arbres deviennent trop profonds ou larges, vous pouvez dire à React de [mémoïser](https://fr.wikipedia.org/wiki/Mémoïsation) un sous-arbre et de réutiliser un résultat de rendu précédent lorsque les props mises à jour restent identiques en surface :

```jsx{5}
function Row({ item }) {
  // ...
}

export default React.memo(Row);
```

À présent un `setState` dans le composant `<Table>` parent sauterait la réconciliation des `Row`s dont la prop `item` référence la même valeur (pour des objets, le même objet en mémoire) que la prop `item` du rendu précédent.

Vous pouvez affiner le degré de mémoïsation jusqu’au niveau d’expressions individuelles avec le [Hook `useMemo()`](https://reactjs.org/docs/hooks-reference.html#usememo). Le cache est local à la position dans l’arbre de composants et sera détruit avec l’état local.  Il ne contient que la dernière valeur utilisée.

React ne mémoïse pas par défaut les composants, et c’est volontaire.  De nombreux composants reçoivent toujours des props différentes, de sorte que les mémoïser serait inutilement coûteux.

## Des modèles bruts

C’est assez ironique, mais React n’utilise pas de système « réactif » pour des mises à jour fines.  En d’autres termes, toute mise à jour au sommet déclenche une réconciliation au lieu de ne mettre à jour que les composants affectés par les modifications.

Cette décision de conception est volontaire.  Le [Time to interactive](https://calibreapp.com/blog/time-to-interactive/) est une métrique cruciale pour les applis web grand public, et la traversée des modèles pour définir des écouteurs fins consommerait trop de ce précieux temps initial.  Qui plus est, pour de nombreuses applis les interactions ont tendance à produire  des mises à jour très localisées (survol de bouton) ou au contraire très globales (transition de page), deux cas pour lesquels une supervision fine serait un gâchis de ressources en mémoire.

Un des principes de conception fondamentaux de React, c’est qu’il doit fonctionner avec des données brutes.  Si vous avez un tas d’objets JavaScript reçus par le réseau, vous devez pouvoir les injecter dans vos composants sans traitement préalable.  On ne voulait pas de pièges vous empêchant d’accéder à certaines propriétés, ou de soucis soudains de performance sur certains changements subtils de structure.  Le rendu de React est en O(*taille de la vue*) plutôt qu’en O(*taille du modèle*), et on peut significativement réduire la *taille de la vue* grâce au [fenêtrage virtuel](https://react-window.now.sh/#/examples/list/fixed-size).

Pour certaines applis, des abonnements fins restent très utiles—par exemple des affichages temps réel d’indices boursiers.  Ce sont des exemples rares de situations où « tout est toujours mis à jour en même temps ».  Même s’il dispose de certaines sorties de secours orientées code impératif pour optimiser ce type de cas, React n’est sans doute pas la meilleure option dans ces situations.  Quoi qu’il en soit, rien ne vous empêche d’implémenter votre propre système d’abonnements fins par-dessus React.

**Notez toutefois qu’on trouve des problèmes de performances classiques que même les abonnements fins et les sytèmes « réactifs » ne peuvent résoudre.**  Par exemple, faire le rendu d’un *nouvel* arbre profond (ce qui arrive à chaque transition de page) sans bloquer le navigateur.  Suivre finement les modifications n’aiderait en rien—en fait, ça ralentirait même le traitement parce qu’on aurait davantage de boulot pour mettre en place les abonnements.  Autre souci classique : devoir attendre des données pour commencer le rendu d’une vue.  Avec React, nous espérons résoudre ces deux problématiques grâce au [Rendu Concurrent](https://reactjs.org/blog/2018/03/01/sneak-peek-beyond-react-16.html).


## Traitement par lots

Plusieurs composants pourraient vouloir mettre à jour leur état en réponse à un même événement.  L’exemple ci-dessous est artificiel mais il illustre un schéma courant :

```jsx{4,14}
function Parent() {
  let [count, setCount] = useState(0);
  return (
    <div onClick={() => setCount(count + 1)}>
      Vous avez cliqué {count} fois sur le parent
      <Child />
    </div>
  );
}

function Child() {
  let [count, setCount] = useState(0);
  return (
    <button onClick={() => setCount(count + 1)}>
      Vous avez cliqué {count} fois sur l’enfant
    </button>
  );
}
```

Quand un événement survient, la prop `onClick` de l’enfant est déclenchée d’abord (ce qui exécute un `setState`).  Puis le parent appelle `setState` au sein de son propre gestionnaire `onClick`.

Si React lançait immédiatement un nouveau rendu de composants en réponse aux appels à `setState`,  on se retrouverait à faire le rendu de l’enfant deux fois :

```jsx{4,8}
*** Début du gestionnaire d’événement click de React ***
Child (onClick)
  - setState
  - rendu de Child // 😞 inutile
Parent (onClick)
  - setState
  - rendu de Parent
  - rendu de Child
*** Fin du gestionnaire d’événement click de React ***
```

Le premier rendu de `Child` est gaspillé.  Et nous ne pourrions pas faire que React saute le deuxième rendu de `Child` parce que `Parent` lui passe peut-être des données différentes suite à la mise à jour de son état.

**Voilà pourquoi React traite les mises à jour au sein des gestionnaires d’événements par lot :**

```jsx
*** Début du gestionnaire d’événement click de React ***
Child (onClick)
  - setState
Parent (onClick)
  - setState
*** Traitement des mises à jour d’état               ***
  - rendu de Parent
  - rendu de Child
*** Fin du gestionnaire d’événement click de React   ***
```

Les appels à `setState` dans les composants ne causent pas immédiatement un nouveau rendu.  Au lieu de ça, React exécute d’abord tous les gestionnaires d’événements, puis déclenche un unique rendu qui regroupe toutes les mises à jour d’état.

Le regroupement en lots améliore les performances mais peut surprendre lorsque vous écrivez ce genre de code :

```jsx
  const [count, setCounter] = useState(0);

  function increment() {
    setCounter(count + 1);
  }

  function handleClick() {
    increment();
    increment();
    increment();
  }
```

Si on a commencé avec un `count` à `0`, on aurait juste trois appels à `setCount(1)`.  Pour corriger ça, `setState` peut aussi être appelé avec une fonction de « mise à jour » :

```jsx
  const [count, setCounter] = useState(0);

  function increment() {
    setCounter(c => c + 1);
  }

  function handleClick() {
    increment();
    increment();
    increment();
  }
```

React mettrait ces fonctions dans une file, et plus tard les déclencherait en séquence, aboutissant à un nouveau rendu avec `count` à `3`.

Si votre logique de gestion d’état devient plus complexe que quelques appels à `setState`, je vous recommande de l’exprimer sous forme d’un réducteur d’état local grâce au [Hook `useReducer`](https://reactjs.org/docs/hooks-reference.html#usereducer). C’est une sorte d‘évolution de cette approche dans laquelle chaque type de mise à jour dispose d’un nom :

```jsx
  const [counter, dispatch] = useReducer((state, action) => {
    if (action === 'increment') {
      return state + 1;
    } else {
      return state;
    }
  }, 0);

  function handleClick() {
    dispatch('increment');
    dispatch('increment');
    dispatch('increment');
  }
```

L’argument `action` peut être n’importe quoi, même si c’est le plus souvent un objet.

## Arbre d’appels

La runtime d’un langage de programmation a généralement une [pile d’appels](https://medium.freecodecamp.org/understanding-the-javascript-call-stack-861e41ae61d4).  Quand une fonction `a()` appelle `b()` qui elle-même appelle `c()`, quelque part dans le moteur JavaScript on trouve une structure de données du style `[a, b, c]` qui « garde trace » de l’endroit où vous êtes et du code à exécuter ensuite.    Une fois que vous quittez `c`, son descripteur dans la pile d’appel disparaît—pouf ! On n’a plus besoin de lui.  On revient à l’intérieur de `b`.  Lorsqu’on finit par quitter `a`, la pile d’appels est vide.

Bien sûr, React lui-même est en JavaScript et obéit aux règles de ce langage.  Mais on peut imaginer qu’en interne React ait une sorte de pile d’appels à lui pour se rappeler quel composant est en train de faire son rendu, par exemple `[App, Page, Layout, Article /* Nous sommes ici */]`.

Là où React diffère d’une runtime de langage traditionnelle, c’est qu’il est spécialisé dans le rendu d’arbres d’UI.  Ces arbres ont besoin de « rester en vie » afin que nous puissions interagir avec eux.  Le DOM ne disparaît pas après notre premier appel à `ReactDOM.render()`.

Je tire sans doute un peu trop sur la métaphore, mais j’aime imaginer que les composants React sont dans une sorte « d’arbre d’appels » plutôt qu’une simple « pile d’appels ».  Quand on « sort » d’un composant `Article`, son descripteur dans « l’arbre d’appels » de React n’est pas détruit.  Il faut bien qu’on conserve l’état local et les références vers les instances hôtes [quelque part](https://medium.com/react-in-depth/the-how-and-why-on-reacts-usage-of-linked-list-in-fiber-67f1014d0eb7).

Ces descripteurs de « l’arbre d’appels » *sont bien* détruits, avec leur état local et leurs instances hôtes, mais uniquement quand les règles de la [réconciliation](#réconciliation) le jugent nécessaire.  Si vous avez déjà lu le code source de React, vous avez peut-être entendu parler de ces descripteurs, dont le nom technique est [Fibres](https://fr.wikipedia.org/wiki/Fibre_(informatique)).

C’est dans ces Fibres que l’état local est maintenu.  Quand l’état change, React considère que les Fibres dans l’arbre sous-jacent ont besoin d’une réconciliation, et appelle ces composants.

## Contexte

Dans React, on transmet des données aux autres composants à l’aide des props.  Parfois, la majorité des composants ont besoin de la même chose—par exemple, le thème visuel actuellement employé.  Ça devient vite fastidieux de transmettre cette info à chaque niveau de profondeur.

React résout ça avec le [Contexte](https://reactjs.org/docs/context.html).  C’est dans le principe comme une [portée dynamique](http://wiki.c2.com/?DynamicScoping) pour les composants.  C’est comme un trou de ver qui vous permet de placer une info tout en haut, et que chaque enfant plus bas dans l’arbre soit capable de la lire et de relancer son rendu quand elle change.

```jsx
const ThemeContext = React.createContext(
  'light' // Valeur par défaut et valeur de secours
);

function DarkApp() {
  return (
    <ThemeContext.Provider value="dark">
      <MyComponents />
    </ThemeContext.Provider>
  );
}

function SomeDeeplyNestedChild() {
  // Dépend d’où l’enfant fait son rendu
  const theme = useContext(ThemeContext);
  // ...
}
```

Quand `SomeDeeplyNestedChild` fait son rendu, `useContext(ThemeContext)` ira chercher le plus proche `<ThemeContext.Provider>` en remontant l’arbre, et utilisera sa `value`.

(En pratique, React maintient une pile de contexte pendant le rendu.)

S’il n’y a pas de `ThemeContext.Provider` au-dessus, le résultat d’un appel à `useContext(ThemeContext)` sera la valeur par défaut fournie lors de l’appel à `createContext()`.  Dans notre exemple, ce serait `'light'`.

## Effets

Nous avons mentionné plus tôt que les composants React ne devraient pas avoir d’effet de bord observable pendant le rendu.  Mais les effets de bord sont parfois nécessaires.  On peut vouloir gérer le focus, dessiner sur un canevas, s’abonner à une source de données, et ainsi de suite.

Dans React, on fait ça en déclarant un effet :

```jsx{4-6}
function Example() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    document.title = `Vous avez cliqué ${count} fois`;
  });

  return (
    <div>
      <p>Vous avez cliqué {count} fois</p>
      <button onClick={() => setCount(count + 1)}>
        Cliquez-moi
      </button>
    </div>
  );
}
```

Chaque fois que possible, React diffère l’exécution des effets jusqu’à ce que le navigateur redessine à l’écran.  L’intérêt est de minimiser des métriques telles que [time to interactive](https://calibreapp.com/blog/time-to-interactive/) et [time to first paint](https://developers.google.com/web/tools/lighthouse/audits/first-meaningful-paint), qui ne devraient pas pâtir de tâches comme l’abonnement à une source de données. (Il y a un Hook [rarement utilisé](https://reactjs.org/docs/hooks-reference.html#uselayouteffect) qui vous permet de contourner ce comportement pour faire des traitements synchrones.  Évitez.)

Les effets ne s’exécutent pas qu’une seule fois.  Ils ont lieu aussi bien après que le composant est affiché à l’utilisateur pour la première fois, qu’après ses mises à jour.  Les effets peuvent exploiter les props et l’état local courants, grâce à la fermeture lexicale *(closure, NdT)*, comme avec `count` dans l’exemple ci-dessus.

Certains effets peuvent avoir besoin d’un code de nettoyage, comme dans le cas des abonnements.  Pour nettoyer derrière lui, un effet peut renvoyer une fonction :

```jsx
  useEffect(() => {
    DataSource.addSubscription(handleChange);
    return () => DataSource.removeSubscription(handleChange);
  });
```

React exécutera la fonction renvoyée avant d’appliquer l’effet la fois suivante, ainsi qu’avant de détruire le composant.

Parfois, re-exécuter l’effet à chaque rendu n’est pas souhaitable.  On peut demander à React de [sauter](https://reactjs.org/docs/hooks-effect.html#tip-optimizing-performance-by-skipping-effects) l’exécution de l’effet si certaines variables n’ont pas changé :

```jsx{3}
  useEffect(() => {
    document.title = `Vous avez cliqué ${count} fois`;
  }, [count]);
```

Ceci dit, c’est souvent une optimisation prématurée, et ça peut amener des problèmes si vous n’êtes pas bien à l’aise avec le fonctionnement des fermetures lexicales en JavaScript.

Par exemple, le code suivant est défectueux :

```jsx
  useEffect(() => {
    DataSource.addSubscription(handleChange);
    return () => DataSource.removeSubscription(handleChange);
  }, []);
```

Il bugue parce que `[]` dit en substance « ne re-exécute jamais cet effet ».  Mais l’effet utilise le `handleChange` de la portée englobante, et le corps de `handleChange` pourrait exploiter des props ou de l’état local :

```jsx
  function handleChange() {
    console.log(count);
  }
```

Si on ne laisse jamais l’effet se re-exécuter, `handleChange` continuera à référencer sa version du premier rendu, et `count` y sera toujours à `0`.

Pour éviter ça, assurez-vous que si vous précisez un tableau de dépendances, il contienne bien **toutes** les choses qui peuvent changer, y compris les fonctions :

```jsx{4}
  useEffect(() => {
    DataSource.addSubscription(handleChange);
    return () => DataSource.removeSubscription(handleChange);
  }, [handleChange]);
```

En fonction de votre code, vous verriez peut-être encore des ré-abonnements superflus parce que `handleChange` elle-même est différente à chaque `render`.  Le Hook [`useCallback`](https://reactjs.org/docs/hooks-reference.html#usecallback) peut vous aider dans ce type de situation.  Ou alors, vous pouvez laisser le ré-abonnement se faire.  Par exemple, l’API `addEventListener` du navigateur est extrêmement rapide, et sauter à travers des cerceaux en flamme pour éviter de l’appeler risque d’être plus problématique que de la laisser faire.

*(Vous pouvez en apprendre davantage sur `useEffect` et les autres Hooks fournis par React [ici](https://reactjs.org/docs/hooks-effect.html).)*

## Hooks personnalisés

Dans la mesure où des Hooks comme `useState` et `useEffect` sont des appels de fonctions, nous pouvons les composer pour créer nos propres Hooks :

```jsx{2,8}
function MyResponsiveComponent() {
  const width = useWindowWidth(); // Notre Hook personnalisé
  return (
    <p>La fenêtre fait {width} de large</p>
  );
}

function useWindowWidth() {
  const [width, setWidth] = useState(window.innerWidth);
  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  });
  return width;
}
```

Les Hooks personnalisés permettent à différents composants de partager une logique à état réutilisable.  Notez que *l’état lui-même* n’est pas partagé.  Chaque appel à un Hook déclare son propre état isolé.

*(Vous pouvez en apprendre davantage sur l’écriture de vos propres Hooks [ici](https://reactjs.org/docs/hooks-custom.html).)*

## Ordre statique d’utilisation

Vous pouvez considérer `useState` comme une syntaxe pour définir une « variable d’état React ».  Ce n’est pas *vraiment* une syntaxe, naturellement.  Nous écrivons toujours du JavaScript.  Mais nous considérons ici React comme un environnement d’exécution, et parce que React spécialise JavaScript pour la description d’arbres d’UI, ses fonctionnalités sont parfois au plus près de la couche langage.

Si `use` *était* une syntaxe, il serait logique qu’elle existe au niveau racine des composants :

```jsx{3}
// 😉 Note : cette syntaxe n’existe pas
component Example(props) {
  const [count, setCount] = use State(0);

  return (
    <div>
      <pVous avez cliqué {count} fois</p>
      <button onClick={() => setCount(count + 1)}>
        Cliquez-moi
      </button>
    </div>
  );
}
```

Du coup, que pourrait bien signifier le recours à cette syntaxe à l’intérieur d’un bloc conditionnel, d’une fonction de rappel, ou hors d’un composant ?

```jsx
// 😉 Note : cette syntaxe n’existe pas

// Est-ce un état local... ou autre chose ?
const [count, setCount] = use State(0);

component Example() {
  if (condition) {
    // Que se passe-t-il si la condition est fausse ?
    const [count, setCount] = use State(0);
  }

  function handleClick() {
    // Que se passe-t-il quand on quitte cette fonction ?
    // En quoi est-ce différent d’une variable ?
    const [count, setCount] = use State(0);
  }
```

L’état dans React est local au *composant* et à son identité dans l’arbre. Si `use` était une véritable syntaxe, il serait du coup logique qu’on limite son utilisabilité à la portée racine d’un composant :

```jsx
// 😉 Note : cette syntaxe n’existe pas
component Example(props) {
  // Seulement valide ici
  const [count, setCount] = use State(0);

  if (condition) {
    // Ici ça donnerait une erreur de syntaxe
    const [count, setCount] = use State(0);
  }
```

C’est un peu comme le fait que `import` ne marche qu’au niveau racine d’un module.

**Bien sûr, `use` n‘est pas réellement une syntaxe.** (Ça n’aurait pas beaucoup d’avantages mais ça entraînerait une tonne de friction.)

Ceci dit, React *s’attend bien* à ce que tous les appels aux Hooks surviennent uniquement au niveau racine de composants, et de façon inconditionnelle. Ces [Règles des Hooks](https://reactjs.org/docs/hooks-rules.html) peuvent être garanties avec un [plugin de linter](https://www.npmjs.com/package/eslint-plugin-react-hooks).  Ce choix de conception a donné lieu à des débats houleux mais en pratique je n’ai pas eu vent de personnes qui auraient été surprises à l’usage.  J’ai également écrit un article qui explique pourquoi les alternatives couramment suggérées [ne fonctionnent pas](/why-do-hooks-rely-on-call-order/).

En interne, les Hooks sont implémentés avec des [listes liées](https://dev.to/aspittel/thank-u-next-an-introduction-to-linked-lists-4pph).  Quand on appelle `useState`, on déplace un pointeur sur le prochain élément.  Quand on quitte le [descripteur dans « l’arbre d’appels »](#arbre-dappels) du composant, on sauve la liste résultat jusqu’au prochain rendu.

[Cet article](https://medium.com/@ryardley/react-hooks-not-magic-just-arrays-cd4f1857236e) fournit une explication simplifiée du fonctionnement interne des Hooks.  Il est peut-être plus facile d’y penser en termes de tableaux qu’en termes de listes liées :


```jsx
// Pseudocode
let hooks, i;
function useState() {
  i++;
  if (hooks[i]) {
    // Rendus suivants
    return hooks[i];
  }
  // Premier rendu
  hooks.push(...);
}

// On se prépare au rendu
i = -1;
hooks = fiber.hooks || [];
// Appel du composant
YourComponent();
// Mémoriser l’état des Hooks
fiber.hooks = hooks;
```

*(Si vous êtes curieux·se, le véritable code est [ici](https://github.com/facebook/react/blob/master/packages/react-reconciler/src/ReactFiberHooks.js).)*

C’est *grosso modo* comme ça que les appels à `useState()` obtiennent le bon état.  Comme nous l’avons vu [plus tôt](#réconciliation), « faire correspondre des trucs » n’a rien de nouveau pour React—la réconciliation repose de façon similaire sur la correspondance entre éléments d’un rendu à l’autre.

## Et le reste

Nous avons abordé pratiquement tous les aspects importants de React comme environnement d’exécution.  Si vous avez fini cette page, vous avez sans doute une connaissance plus pointue de React que 90% de ses utilisateurs.  Et il n’y a rien de mal à ça !

J’ai laissé de côté certaines parties—principalement parce qu’elles ne sont pas encore parfaitement claires même pour nous.  React n’a pas pour le moment de solution satisfaisante pour des rendus multi-passes, c’est-à-dire quand le rendu du parent a besoin d’infos issues de ses enfants.  Et puis, l’[API de gestion d’erreurs](https://reactjs.org/docs/error-boundaries.html) n’a pas encore de version Hook.  Il est possible que ces deux points soient résolus d’un seul coup.  Le Mode Concurrent n’est pas encore stable, et son interaction avec Suspense soulève des questions intéressantes.  Peut-être que je ferai un article complémentaire lorsque nous aurons de meilleures réponses à ces questions, et que Suspense sera prêt pour davantage que du [chargement paresseux](https://reactjs.org/blog/2018/10/23/react-v-16-6.html#reactlazy-code-splitting-with-suspense).

**Je trouve que ça en dit long sur le succès de l’API de React, qu’on puisse aller aussi loin avec sans jamais avoir à se préoccuper de la majorité de ces questions.**  De bons comportements par défaut comme l’heuristique de la réconciliation fonctionnent impeccablement la plupart du temps.  Et des avertissements comme celui sur `key` vous donnent une petite tape sur l’épaule quand vous risquez de vous tirer dans le pied.

Si vous êtes accroc de bibliothèques UI, j’espère que cet article vous aura diverti, et aura clarifié le fonctionnement profond de React.  Ou peut-être avez-vous décidé que React est trop compliqué et que vous ne voulez plus en entendre parler.  Quoi qu’il en soit, j’adorerais avoir votre réaction sur Twitter !  Merci de m’avoir lu.
