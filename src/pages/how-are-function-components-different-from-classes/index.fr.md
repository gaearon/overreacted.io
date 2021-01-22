---
title: En quoi les fonctions composants sont-elles différentes des classes ?
date: '2019-03-03'
spoiler: C’est un genre de Pokémon complètement différent.
---

Quelles sont les différences entre les fonctions composants et les classes React ?

Pendant longtemps, la réponse canonique affirmait que les classes donnent accès à davantage de fonctionnalités (telles que l'état local).  Mais avec les [Hooks](https://fr.reactjs.org/docs/hooks-intro.html), ça n’est plus vrai.

Vous avez peut-être entendu dire que l’un ou l’autre offre de meilleures performances.  Mais lequel ?  La plupart des comparaisons sont [faussées](https://medium.com/@dan_abramov/this-benchmark-is-indeed-flawed-c3d6b5b6f97f) aussi j’éviterais de [tirer des conclusions hâtives](https://github.com/ryardley/hooks-perf-issues/pull/2) en les lisant.  Les performances découlent surtout de ce que fait votre code, bien plus que du fait que vous ayez opté pour une fonction ou une classe.  D’après ce que nous avons pu voir, les différences de performances sont négligeables, même si les stratégies d’optimisation sont un peu [différentes](https://reactjs.org/docs/hooks-faq.html#are-hooks-slow-because-of-creating-functions-in-render).

En tous cas, nous [déconseillons](https://fr.reactjs.org/docs/hooks-faq.html#should-i-use-hooks-classes-or-a-mix-of-both) de ré-écrire vos composants existants à moins que vous n’ayez d’autres raisons de le faire et soyez à l’aise à l’idée de faire partie des premiers utilisateurs. Les Hooks sont encore tout neufs (comme React l’était en 2014), et certaines « meilleures pratiques » ne figurent pas encore dans les tutoriels.

Ce qui nous amène où, exactement ?  Y a-t-il la moindre différence fondamentale entre les fonctions et les classes React, finalement ?  Bien sûr qu’il y en a—en termes de modèle mental. **Dans cet article, je vais parler de la plus importante différence entre eux.**  Elle était déjà là lorsque les fonctions composants sont [arrivées](https://fr.reactjs.org/blog/2015/09/10/react-v0.14-rc1.html#stateless-function-components) en 2015, mais on a tendance à l’oublier :

>**Les fonctions composants capturent les valeurs du rendu.**

Décortiquons ce que j’entends par là.

---

**Remarque : cet article ne porte aucun jugement de valeur sur les classes ou les fonctions.  Je me contente de décrire la différence entre les deux modèles de programmation en React.  Si vous avez des questions au sujet de l’adoption croissante des fonctions, je vous invite à consulter la [FAQ des Hooks](https://fr.reactjs.org/docs/hooks-faq.html#adoption-strategy).**

---

Prenons ce composant :

```jsx
function ProfilePage(props) {
  const showMessage = () => {
    alert('Vous suivez désormais ' + props.user);
  };

  const handleClick = () => {
    setTimeout(showMessage, 3000);
  };

  return (
    <button onClick={handleClick}>Suivre</button>
  );
}
```

Il affiche un bouton qui simule une requête réseau avec `setTimeout` puis affiche un message de confirmation.  Par exemple, si `props.user` est `'Dan'`, il affichera `'Vous suivez désormais Dans'` après trois secondes.  Simple comme tout.

*(Notez au passage que cet exemple pourrait tout aussi bien utiliser des déclarations de fonctions. `function handleClick()` fonctionnerait exactement pareil.)*

Comment écrire ça avec une classe ?  Une transcription naïve pourrait ressembler à ça :

```jsx
class ProfilePage extends React.Component {
  showMessage = () => {
    alert('Vous suivez désormais ' + this.props.user);
  };

  handleClick = () => {
    setTimeout(this.showMessage, 3000);
  };

  render() {
    return <button onClick={this.handleClick}>Suivre</button>;
  }
}
```

On pense généralement que ces deux exemples de code sont équivalents.  Il est fréquent qu'on refactorise librement d’une approche à l’autre sans en remarquer les implications :

![Cherchez la différence entre ces deux versions](./wtf.gif)

**Et pourtant, ces deux morceaux de code ont une différence subtile.**  Regardez-les bien.  Avez-vous repéré la différence ?  Personnellement, ça m’a pris pas mal de temps pour m’en rendre compte.

**Les *spoilers* (ou *divulgâcheurs*, comme le disent magnifiquement nos amis Québecois) arrivent, alors voici déjà une [démo interactive](https://codesandbox.io/s/pjqnl16lm7) si vous voulez essayer de trouver par vous-même.** Le reste de cet article explique la différence et illustre en quoi elle est importante.

---

Avant de continuer, j’aimerais insister sur le fait que la différence que je décris n’a rien à voir avec les Hooks React.  Les exemples ci-dessus n’utilisent même pas les Hooks !

Il s’agit avant tout de la différence entre les fonctions et les classes en React.  Si vous avez l’intention d’utiliser plus souvent les fonctions dans une appli React, vous voudrez sans doute bien comprendre ça.

---

**Mettons la différence en évidence avec un bug fréquent dans les applications React.**

Ouvrez cette **[_sandbox_ d’exemple](https://codesandbox.io/s/pjqnl16lm7)** avec un sélecteur de profil actif et les deux implémentations de `ProfilePage` vues ci-dessus, chacune affichant un bouton *Follow*.

Essayez cette séquence d’actions pour chaque bouton :

1. **Cliquez** sur un des boutons *Follow*.
2. **Changez** le profil sélectionné en moins de 3 secondes.
3. **Lisez** le texte de l’alerte.

Vous remarquerez une différence originale :

* Avec la **fonction** `ProfilePage` du bouton du haut, cliquer *Follow* sur le profil de Dan puis choisir le profil de Sophie affichera tout de même `'Followed Dan'`.

* Avec la **classe** `ProfilePage` du bouton du bas, ça afficherait `'Followed Sophie'` :

![Démonstration des étapes](./bug.gif)

---

Dans cet exemple, c’est le premier comportement qui a raison.  **Si nous suivons une personne puis navigons sur le profil d’une autre, mon composant ne devrait pas s’emmêler les pinceaux quant à la personne que j’ai suivie.**  L’implémentation à base de classe est clairement défectueuse.

*(Ceci étant dit, vous devriez carrément [suivre Sophie](https://mobile.twitter.com/sophiebits).)*

---

Alors pourquoi notre exemple à base de classe se comporte-t-il ainsi ?

Examinons de plus près la méthode `showMessage` de notre classe :

```jsx{3}
class ProfilePage extends React.Component {
  showMessage = () => {
    alert('Vous suivez désormais ' + this.props.user);
  };
```

Cette méthode de classe lit l’info dans `this.props.user`.  Les props sont immuables en React donc elles ne peuvent jamais changer.  **En revanche, `this` est (et a toujours été) modifiable.**

En fait, c’est l’objectif-même de `this` dans une classe.  React lui-même le modifie au fil du temps pour que vous puissiez en lire une version à jour dans `render` et les méthodes de cycle de vie.

Du coup si notre composant refait un rendu pendant que la requête est en cours, `this.props` va changer.  La méthode `showMessage` lit `user` depuis des `props` « trop récentes ».

Ça met en lumière une question intéressante sur la nature des interfaces utilisateurs (UI).  Si nous estimons qu’une UI est conceptuellement une fonction de l’état applicatif courant, **les gestionnaires d’événements font partie du résultat du rendu, au même titre que la sortie visuelle.**  Nos gestionnaires d’événements « appartiennent » à un rendu particulier, avec ses props et son état local spécifiques.

Seulement voilà, différer une fonction de rappel qui lira `this.props` rompt cette association.  Notre fonction de rappel `showMessage` n’est pas « liée » à un rendu particulier, de sorte qu’elle « perd » les props idoines.  En lisant `this`, nous avons coupé la connexion.

---

**Imaginons que les fonctions composants n’existent pas.**  Comment résoudrions-nous ce problème ?

On voudrait en quelque sorte « réparer » le lien entre le `render` doté des bonnes props et la fonction de rappel `showMessage` qui les lira.  Les `props` se perdent en chemin.

Une façon de faire consisterait à lire `this.props` tôt dans le gestionnaire, puis à les passer explicitement à la fonction exécutée en différé :

```jsx{2,7}
class ProfilePage extends React.Component {
  showMessage = (user) => {
    alert('Vous suivez désormais ' + user);
  };

  handleClick = () => {
    const {user} = this.props;
    setTimeout(() => this.showMessage(user), 3000);
  };

  render() {
    return <button onClick={this.handleClick}>Suivre</button>;
  }
}
```

Ça [marche](https://codesandbox.io/s/3q737pw8lq).  Mais cette approche est significativement plus verbeuse et porte un risque d’erreurs qui ne fera que croître avec le temps.  Et si on a besoin de plus d’une prop ?  Et si on a aussi besoin de l’état local ?  **Si `showMessage` appelle une autre méthode, et que cette méthode lit `this.props.something` ou `this.state.something`, on reviendra au point de départ.**  On aurait besoin de passer `this.props` et `this.state` en arguments à chaque méthode appelée depuis `showMessage`.

Ça irait *a contrario* de l’ergonomie de base d’une classe.  C’est par ailleurs difficile à se rappeler et à garantir, d’où la tendance de certaines personnes à plutôt accepter les bugs comme une fatalité.

Dans le même esprit, placer le code appelant `alert` à la volée dans `handleClick` ne résout pas le problème général.  Nous voulons structurer le code d’une façon qui permette la découpe en plusieurs méthodes *mais* qui autorise aussi la lecture des props et de l’état local qui étaient en vigueur lors du rendu déclencheur.  **Ce problème n’est même pas spécifique à React : vous pouvez le reproduire dans n’importe quelle bibliothèque UI qui place ses données dans un objet modifiable tel que `this`.**

Peut-être qu’on pourrait *lier* les méthodes dans le constructeur ?

```jsx{4-5}
class ProfilePage extends React.Component {
  constructor(props) {
    super(props);
    this.showMessage = this.showMessage.bind(this);
    this.handleClick = this.handleClick.bind(this);
  }

  showMessage() {
    alert('Vous suivez désormais ' + this.props.user);
  }

  handleClick() {
    setTimeout(this.showMessage, 3000);
  }

  render() {
    return <button onClick={this.handleClick}>Suivre</button>;
  }
}
```

Non, ça ne change rien.  Rappelez-vous, le problème c’est qu’on lit `this.props` trop tard, ce n’est pas une histoire de syntaxe ! **Ceci dit, le problème disparaîtrait si nous nous basions entièrement sur les fermetures lexicales *(closures, NdT)* JavaScript.**

On évite souvent les fermetures lexicales parce qu’il est [difficile](https://wsvincent.com/javascript-closure-settimeout-for-loop/) de réfléchir à une valeur qui peut bouger dans le temps.  Mais en React, les props et l’état sont immuables !  (En tout cas, nous le recommandons fortement.)  Ça réduit considérablement les risques de nous tirer une balle dans le pied.

Ça signifie que si vous réalisez une fermeture lexicale sur les props ou l’état local d’un rendu donné, vous pouvez être sûr·e qu’elles ne bougeront pas :

```jsx{3,4,9}
class ProfilePage extends React.Component {
  render() {
    // Capturons les props !
    const props = this.props;

    // Remarque : on est *dans render*, pas dans d’autres méthodes de la classe.
    const showMessage = () => {
      alert('Vous suivez désormais ' + props.user);
    };

    const handleClick = () => {
      setTimeout(showMessage, 3000);
    };

    return <button onClick={handleClick}>Suivre</button>;
  }
}
```

**Vous avez « capturé » les props au moment du rendu :**

![Capture d’un Pokemon](./pokemon.gif)

De cette façon, tout code à l’intérieur du rendu (y compris `showMessage`) a la certitude de voir les props de ce rendu spécifique.  React cesse de « piquer notre fromage ».

**On peut alors ajouter autant de fonctions utilitaires qu’on veut à l’intérieur, elles pourraient toutes utiliser les props et l’état local capturés.**  Les fermetures lexicales à la rescousse !

---

L’[exemple ci-dessus](https://codesandbox.io/s/oqxy9m7om5) est juste mais a une drôle de tête.  À quoi sert-il d’avoir une classe si on définit les fonctions dans `render` au lieu d’utiliser des méthodes de classe ?

Eh bien oui, on pourrait simplement virer le « squelette » de classe autour :

```jsx
function ProfilePage(props) {
  const showMessage = () => {
    alert('Vous suivez désormais ' + props.user);
  };

  const handleClick = () => {
    setTimeout(showMessage, 3000);
  };

  return (
    <button onClick={handleClick}>Suivre</button>
  );
}
```

Comme dans la version précédente, les `props` sont capturées : React les passe en argument.  **Contrairement à `this`, l’objet `props` lui-même n’est jamais modifié par React.**

C’est encore plus évident si on déstructure `props` dans la signature de la fonction :

```jsx{1,3}
function ProfilePage({ user }) {
  const showMessage = () => {
    alert('Vous suivez désormais ' + user);
  };

  const handleClick = () => {
    setTimeout(showMessage, 3000);
  };

  return (
    <button onClick={handleClick}>Suivre</button>
  );
}
```

Quand le composant parent affiche `ProfilePage` avec des props différentes, React rappellera la fonction `ProfilePage`.  Mais le gestionnaire d’événements qui a réagi à notre clic « appartenait » au rendu précédent, avec sa propre valeur de `user` et son `showMessage` qui la lit.  Ils restent intacts.

C’est pourquoi, dans la version basée fonction de [cette démo](https://codesandbox.io/s/pjqnl16lm7), cliquer *Follow* sur le profil de Sophie puis sélectionner rapidement Sunil afficherait quand même `'Followed Sophie'` :

![Démo du comportement correct](./fix.gif)

Ce comportement est le bon. *(Même si vous voudrez peut-être [suivre Sunil](https://mobile.twitter.com/threepointone) aussi !)*

---

Nous comprenons à présent la différence majeure entre les fonctions et les classes en React :

>**Les fonctions composants capturent les valeurs du rendu.**

**Avec les Hooks, le même principe s’applique aussi à l’état.**  Prenez cet exemple :

```jsx
function MessageThread() {
  const [message, setMessage] = useState('');

  const showMessage = () => {
    alert('Vous avez dit : ' + message);
  };

  const handleSendClick = () => {
    setTimeout(showMessage, 3000);
  };

  const handleMessageChange = (e) => {
    setMessage(e.target.value);
  };

  return (
    <>
      <input value={message} onChange={handleMessageChange} />
      <button onClick={handleSendClick}>Envoyer</button>
    </>
  );
}
```

(Voici une [démo interactive](https://codesandbox.io/s/93m5mz9w24).)

Ça ne casse pas des briques comme UI de messagerie, mais ça permet d'illustrer le même aspect : si j’envoie un message donné, le composant ne devrait pas s’emmêler les pinceaux quant au message qui est effectivement parti.  La variable `message` de la fonction composant capture l’état qui « appartient » au rendu ayant produit le gestionnaire d’événement appelé par le navigateur.  Ainsi `message` conserve la valeur qu’avait le champ quand j’ai cliqué sur « Envoyer ».

---

On a compris que les fonctions en React capturent les props et l'état local par défaut. **Mais comment faire si nous *voulons* lire des props ou un état qui n’appartiennent pas à ce rendu spécifique ?**  Et si nous voulions [« lire dans l’avenir »](https://dev.to/scastiel/react-hooks-get-the-current-state-back-to-the-future-3op2) ?

Avec les classes, il suffit de lire `this.props` ou `this.state` parce que `this` est lui-même modifiable.  React le modifie.  Dans les fonctions composants, il est également possible d’avoir une valeur modifiable partagée par tous les rendus du composant.  Ça s’appelle une « ref » :

```jsx
function MyComponent() {
  const ref = useRef(null);
  // Vous pouvez lire et écrire `ref.current`.
  // ...
}
```

Ceci dit, vous devrez la gérer vous-même.

Une ref [remplit le même rôle](https://fr.reactjs.org/docs/hooks-faq.html#is-there-something-like-instance-variables) qu’un champ d’instance.  C’est une échappatoire vers un monde impératif et modifiable.  Vous avez peut-être l’habitude des « refs DOM », mais ici le concept est beaucoup plus général.  C’est juste une boîte dans laquelle vous pouvez mettre des trucs.

Même visuellement, `this.something` est comme un reflet de `something.current` dans un miroir.  Ils représentent le même concept.

Par défaut, React ne crée pas de refs pour les derniers props et état local en date des composants fonctions.  Vous n’en avez presque jamais besoin, donc les prédéfinir serait un gâchis de ressources.  Ceci dit, vous pouvez pister manuellement une valeur si le cœur vous en dit :

```jsx{3,6,15}
function MessageThread() {
  const [message, setMessage] = useState('');
  const latestMessage = useRef('');

  const showMessage = () => {
    alert('Vous avez dit : ' + latestMessage.current);
  };

  const handleSendClick = () => {
    setTimeout(showMessage, 3000);
  };

  const handleMessageChange = (e) => {
    setMessage(e.target.value);
    latestMessage.current = e.target.value;
  };
```

Si nous lisions `message` dans `showMessage`, nous verrions le message au moment où nous avions pressé le bouton Envoyer.  Mais nous le lisons depuis `latestMessage.current`, donc nous obtenons la dernière valeur inscrite—même si nous avons continué à taper après avoir pressé le bouton d’envoi.

Vous pouvez comparer les [deux](https://codesandbox.io/s/93m5mz9w24) [démos](https://codesandbox.io/s/ox200vw8k9) pour bien vous rendre compte de la différence.  Une ref est un moyen de « laisser tomber » la cohérence de rendu, ce qui s’avère parfois utile.

En règle générale, vous devriez éviter de lire ou d’écrire des refs *pendant* le rendu, parce qu’elles sont modifiables.  On préfère avoir des rendus prévisibles.  **Toutefois, si nous voulons accéder à la valeur la plus récente d’une prop ou d’une variable d’état donnée, mettre à jour la ref manuellement est fastidieux.**  On pourrait l’automatiser en utilisant un effet :

```jsx{4-8,11}
function MessageThread() {
  const [message, setMessage] = useState('');

  // Garde trace de la dernière valeur saisie
  const latestMessage = useRef('');
  useEffect(() => {
    latestMessage.current = message;
  });

  const showMessage = () => {
    alert('Vous avez dit : ' + latestMessage.current);
  };
```

(Voici une [démo](https://codesandbox.io/s/yqmnz7xy8x).)

Nous affectons la ref *dans* un effet afin que la valeur de la ref ne change qu’après la mise à jour du DOM.  Ça garantit que notre mutation ne viendra pas casser des fonctionnalités comme [la découpe temporelle et Suspense](https://fr.reactjs.org/blog/2018/03/01/sneak-peek-beyond-react-16.html), qui reposent sur la capacité à interrompre les rendus.

Il est assez rare de devoir utiliser un ref ainsi.  **Capturer les props et l’état est en général une meilleure approche, donc celle par défaut.**  Néanmoins, ça peut être utile pour interagir avec des [API impératives](/making-setinterval-declarative-with-react-hooks/) comme les horloges et les abonnements. Rappelez-vous que vous pouvez pister *n’importe quelle* valeur de cette façon : une prop, une variable d’état, l’objet de props tout entier, ou même une fonction.

C’est également pratique pour des optimisations, comme lorsque l’identité de `useCallback` change trop souvent.  Ceci dit, [utiliser un réducteur](https://fr.reactjs.org/docs/hooks-faq.html#how-to-avoid-passing-callbacks-down) constitue souvent une [meilleure solution](https://github.com/ryardley/hooks-perf-issues/pull/3). (Ce sera pour un autre article !)

---

Dans cet article, nous avons examiné des approches défectueuses fréquentes dans les classes, et vu comment les fermetures lexicales nous aident à les corriger.  Pourtant, vous avez peut-être remarqué que lorsque nous essayons d’optimiser les Hooks en précisant un tableau de dépendances, nous avons parfois des problèmes en raisons de fermetures lexicales obsolètes.  Est-ce que ça veut dire que les fermetures lexicales sont un problème ?  Je ne le pense pas.

Comme nous l'avons vu plus haut, elles nous aident en fait à *corriger* les problèmes subtils qu'on a souvent du mal à remarquer.  Dans la même veine, elles facilitent grandement l'écriture de code qui fonctionne correctement en [Mode Concurrent](https://fr.reactjs.org/blog/2018/03/01/sneak-peek-beyond-react-16.html).  Tout ça est possible parce que la logique à l’intérieur du composant lit les props et l’état corrects depuis la fermeture lexicale associée au bon rendu.

Dans tous les cas que j’ai pu examiner jusqu'ici, **les problèmes de « fermeture lexicale obsolète » étaient dus à la supposition incorrecte que « les fonctions ne changent pas » ou que « les props sont toujours les mêmes ».**  Ce n’est pas le cas, comme j’espère l’avoir clarifié ici.

Les fonctions créent une fermeture lexicale sur leurs props et leur état local, de sorte que leur identité est tout aussi importante.  Ce n’est pas un bug, mais une fonctionnalité des fonctions composants.  Les fonctions ne devraient pas être exclues du « tableau des dépendances » de `useEffect` ou `useCallback`, par exemple.  (Le meilleur correctif consiste généralement à utiliser `useReducer`, ou la solution à base de `useRef` vue plus haut, et nous documenterons prochainement sur quels critères opter pour l’une ou l’autre.)

Quand nous écrivons la majorité de notre code React sous forme de fonctions, nous devons ajuster notre intuition quant à [l’optimisation du code](https://github.com/ryardley/hooks-perf-issues/pull/3) et [les types de valeurs qui peuvent changer au fil du temps](https://github.com/facebook/react/issues/14920).

Comme [l’a si bien dit Fredrik](https://mobile.twitter.com/EphemeralCircle/status/1099095063223812096) :

>La meilleure règle mentale que j’ai pu trouver jusqu’ici avec les hooks, c’est qu’on devrait « coder comme si n’importe quelle valeur était susceptible de changer avec le temps ».

Les fonctions ne font pas exception à cette règle.  Ça prendra du temps pour que la majorité des supports d’apprentissage de React abordent ce point.  Ça nécessite quelques ajustements à notre modèle mental basé sur les classes.  Mais j’espère que cet article vous aura aidé à considérer tout ça d’un regard neuf.

Les fonctions React capturent toujours leurs valeurs—et désormais nous savons pourquoi.

![Pikachu qui sourit](./pikachu.gif)

Elles sont un genre de Pokémon complètement différent.
