---
title: Pourquoi les Hooks React dépendent-ils de l’ordre d’appel ?
date: '2018-12-13'
spoiler: Les leçons que nous avons tirées des mixins, render props, HOCs et classes.
---

Lors de la React Conf 2018, l’équipe de React a présenté notre [proposition de Hooks](https://reactjs.org/docs/hooks-intro.html).

Si vous souhaitez comprendre ce que sont les Hooks et quels problèmes ils résolvent, jetez un œil à [nos présentations](https://www.youtube.com/watch?v=dpw9EHDh2bM) qui sont une bonne introduction, ainsi que [mon article complémentaire](https://medium.com/@dan_abramov/making-sense-of-react-hooks-fdbde8803889) qui traitait des principales fausses idées sur le sujet.

Il est possible que votre réaction initiale aux Hooks soit négative :

![Commentaire HN négatif](./hooks-hn1.png)

<blockquote class="translation">« Ma réaction viscérale est que les Hooks ne sont pas une super idée pour React.  Un des trucs que j’ai toujours mis en avant au sujet de React est son API propre et extrêmement explicite (<code>dangerouslySetInnerHTML</code> étant mon exemple préféré).  L’API des Hooks emprunte un chemin dangereux vers plus d’implicite et de magie qui à mon sens ne peut avoir que de mauvaises conséquences. » <cite> NdT</cite></blockquote>

Ils sont un peu comme un morceau de musique qui vous envoute au bout de quelques écoutes :

![Commentaire HN positif de la même personne, 4 jours plus tard](./hooks-hn2.png)

<blockquote class="translation">« Après avoir bûché cette API ces 3 derniers jours et suivi les discussions dans la RFC, j’ai complètement revu ma position.  Je me suis dit que je ne pouvais pas laisser mon commentaire initial intact, parce qu’il ne reflète plus du tout mon opinion.  Je trouve les Hooks fabuleux. Si l’équipe de React arrive à une API impeccable, j’ai le sentiment que les Hooks vont révolutionner notre façon d’utiliser React.  J’ai toujours l’impression qu’ils élèveront un peu la barrière d’entrée, mais pour un développeur React expérimenté, ils sont fantastiques. » <cite>NdT</cite></blockquote>

Quand vous lirez les docs, ne loupez pas [la page la plus importante](https://reactjs.org/docs/hooks-custom.html) qui parle de construire vos propres Hooks ! Trop de gens se focalisent sur une partie de notre message avec laquelle ils ne sont pas d’accord (ex. qu’apprendre les classes est difficile) et loupent la vision d’ensemble derrière les Hooks.  Et cette vision d’ensemble, c’est que  **les Hooks sont comme des *mixins fonctionnels* qui vous permettent de créer et composer vos propres abstractions.**

Les Hooks [se sont inspirés de travaux antérieurs](https://reactjs.org/docs/hooks-faq.html#what-is-the-prior-art-for-hooks) mais je n’ai rien vu qui soit *vraiment* similaire jusqu’à ce que Sebastien partage son idée avec l’équipe.  Malheureusement, il est facile de ne pas prêter attention à la relation étroite entre des choix de conception spécifiques pour l'API et les avantages qui en découlent.  Avec cet article, j’espère aider davantage de personnes à comprendre la philosophie qui sous-tend l’aspect le plus controversé de la proposition des Hooks.

**La suite de cet article suppose que vous connaissez l’API de Hooks `useState()` et avez lu comment écrire son propre Hook.  Si ce n’est pas le cas, suivez les liens ci-avant.  Par ailleurs, gardez à l’esprit que les Hooks sont encore expérimentaux et que vous n’avez pas besoin d’apprendre à vous en servir dès maintenant !**

(Mise en garde : ceci est un article à moi, et ne reflète pas nécessairement les opinions de l’équipe React.  L’article est long, le sujet complexe, et je ne suis pas à l’abri d’avoir fait une erreur quelque part.)

---

Le premier—et sans doute le plus grand—choc lorsque vous découvrez les Hooks est qu’ils exigent un *maintien de l’ordre des appels d’un rendu à l’autre*.  Ce qui n’est pas sans [conséquences](https://reactjs.org/docs/hooks-rules.html).

Cette décision est évidemment controversée.  C’est pourquoi, [contrairement à nos principes](https://www.reddit.com/r/reactjs/comments/9xs2r6/sebmarkbages_response_to_hooks_rfc_feedback/e9wh4um/), nous avons publié la proposition seulement une fois que nous estimions que la documentation et nos présentations faisaient un travail d’explication suffisamment bon pour que les gens lui donnent une chance.

**Si vous avez des réserves sur certains aspects de la conception de l’API des Hooks, je ne saurais trop vous recommander la lecture de [la réponse détaillée](https://github.com/reactjs/rfcs/pull/68#issuecomment-439314884) de Sebastian à la discussion RFC, qui dépasse les 1 300 commentaires.**  Elle est très complète, mais aussi assez dense.  Je pourrais sans doute transformer chacun de ses paragraphes en un article dédié sur ce blog.  (En fait, je l’ai [déjà fait](/how-does-setstate-know-what-to-do/) une fois !)

Aujourd’hui j’aimerais aborder un point particulier.  Comme vous vous en souvenez peut-être, chaque Hook peut être utilisé dans un composant plus d’une fois.  Par exemple, nous pouvons déclarer [plusieurs variables d’état](https://reactjs.org/docs/hooks-state.html#tip-using-multiple-state-variables) en utilisant `useState()` à chaque fois :

```jsx{2,3,4}
function Form() {
  const [name, setName] = useState('Mary');              // Variable d’état 1
  const [surname, setSurname] = useState('Poppins');     // Variable d’état 2
  const [width, setWidth] = useState(window.innerWidth); // Variable d’état 3

  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  });

  function handleNameChange(e) {
    setName(e.target.value);
  }

  function handleSurnameChange(e) {
    setSurname(e.target.value);
  }

  return (
    <>
      <input value={name} onChange={handleNameChange} />
      <input value={surname} onChange={handleSurnameChange} />
      <p>Bonjour, {name} {surname}</p>
      <p>La fenêtre fait {width} de large</p>
    </>
  );
}
```

Remarquez que nous utilisons la syntaxe de déstructuration positionnelle pour nommer les variables d’état issues de `useState()`, mais que ces noms ne sont pas passés à React.  Au lieu de ça, dans cet exemple **React traite `name` comme « la première variable d’état », `surname` comme « la deuxième variable d’état », et ainsi de suite**. Leur *position d’appel* est ce qui leur confère une identité stable d’un rendu à l’autre.  Ce modèle mental est bien décrit [dans cet article](https://medium.com/@ryardley/react-hooks-not-magic-just-arrays-cd4f1857236e).

En surface, se reposer sur l’ordre d’appel *ne sent pas bon*.  Une telle sensation est certes un signal utile, mais elle peut être erronée—surtout si nous n’avons pas encore complètement internalisé le problème que nous sommes en train de résoudre. **Dans cet article, je vais examiner quelques approches alternatives qui ont été suggérées pour les Hooks, et expliquer pourquoi elles ne fonctionnent pas.**

---

Cet article ne sera pas exhaustif.  Selon la granularité que vous employez pour les distinguer, on a vu entre une douzaine et des *centaines* de propositions alternatives distinctes.  Nous aussi, nous avons [réfléchi](https://github.com/reactjs/react-future) à des APIs alternatives de composant ces cinq dernières années.

Des articles comme celui-ci sont délicats parce que même si vous couvrez une centaine d’alternatives, quelqu’un en retouchera légèrement une et dira : « Ah, tu n’avais pas pensé à *ça* ! »

En pratique, des alternatives différentes ont tendance à se recouper dans leurs inconvénients.  Plutôt que d’énumérer *toutes* les APIs suggérées (ce qui me prendrait des mois), je vais illustrer leurs défauts les plus courants à l’aide d’exemples précis.  Quant à catégoriser les autres APIs possibles à l’aide de ces failles, je le laisse en exercice aux lecteurs, comme dirait l’autre.

*Ça ne veut pas dire que les Hooks sont sans défaut.* Mais une fois que vous aurez assimilé les failles des autres solutions, vous vous direz peut-être que la conception des Hooks a du sens.

---

### Défaut n°1 : Impossible d’extraire un Hook personnalisé

Cela nous a surpris, mais de nombreuses propositions alternatives ne permettent pas du tout de faire des [Hooks personnalisés](https://reactjs.org/docs/hooks-custom.html).  Peut-être n’avons-nous pas mis suffisamment ces derniers en avant dans les docs « Motifs ».   C’est difficile à faire tant que les primitives des Hooks ne sont pas bien comprises.  C’est un peu le problème de l’œuf et la poule.  Mais les Hooks personnalisés sont au cœur de notre proposition.

Par exemple, une alternative bannissait les appels multiples à `useState()` dans un composant.  On devait conserver l’état dans un objet unique.  Ça marche pour les classes, non ?

```jsx
function Form() {
  const [state, setState] = useState({
    name: 'Mary',
    surname: 'Poppins',
    width: window.innerWidth,
  });
  // ...
}
```

Soyons clairs: les Hooks *autorisent* ce style.  Vous n’êtes pas *obligés* de découper votre état en plusieurs variables (comme en témoignent les [recommandations](https://reactjs.org/docs/hooks-faq.html#should-i-use-one-or-many-state-variables) de la FAQ).

Mais l’idée derrière la possibilité d’appels multiples à `useState()`, c’est qu’on puisse *extraire* des parties de la logique à état (état + effets) hors de vos composants vers des Hooks personnalisés qui pourront *aussi* utiliser de façon indépendante l’état local et les effets :

```jsx{6-7}
function Form() {
  // Déclarons quelques variables d’état directement dans le corps de composant
  const [name, setName] = useState('Mary');
  const [surname, setSurname] = useState('Poppins');

  // On a sorti une partie de l’état et des effets dans un Hook personnalisé
  const width = useWindowWidth();
  // ...
}

function useWindowWidth() {
  // Déclarons quelques variables d’état directement dans un Hook personnalisé
  const [width, setWidth] = useState(window.innerWidth);
  useEffect(() => {
    // ...
  });
  return width;
}
```

Si vous n’autorisez qu’un appel à `useState()` par composant, vous perdez la possibilité pour les Hooks personnalisés d’introduire de l’état local.  Ce qui est pourtant l’essence des Hooks personnalisés.

### Défaut n°2 : Conflits de nommage

Une suggestion fréquente consiste à ce que `useState()` accepte un argument de clé (ex. une chaîne) qui identifierait de façon unique la variable d’état au sein du composant.

On trouve diverses variations de cette idée, mais ça ressemble toujours plus ou moins à ça :

```jsx
// ⚠️ Ceci n’est PAS l’API de Hooks de React
function Form() {
  // On passerait une sorte de clé d’état à useState()
  const [name, setName] = useState('name');
  const [surname, setSurname] = useState('surname');
  const [width, setWidth] = useState('width');
  // ...
```

On tente ainsi de cesser de dépendre de l’ordre des appels (ouais, des clés explicites !) mais on amène un autre problème : les conflits de nommage.

D’accord, vous ne serez sans doute pas tentés d’appeler `useState('name')` deux fois dans le même composant, sauf par erreur.  Ça pourrait arriver par accident, ce qui est vrai pour n’importe quel bug.  Néanmoins, il est beaucoup plus probable que lorsque vous travaillez sur un *Hook personnalisé*, vous souhaitiez ajouter ou retirer des variables d’état et des effets.

Avec ce type de proposition, chaque fois que vous ajoutez une variable d’état dans un Hook personnalisé, vous risquez de casser les composants qui vous utilisent (directement ou transitivement) *parce qu’ils utilisent peut-être déjà le même nom* dans leurs propres variables d’état.

C’est l’exemple même d’une API qui n’est pas [optimisée pour le changement](/optimized-for-change/). Le code actuel semble peut-être « élégant », mais il réagirait mal à des changements de specs pour votre application. Ce serait bien qu’on [apprenne](https://reactjs.org/blog/2016/07/13/mixins-considered-harmful.html#mixins-cause-name-clashes) de nos erreurs.

La proposition officielle pour les Hooks résout ce problème en utilisant plutôt l’ordre d’appel : même si deux Hooks utilisent une variable d’état `name`, elles seront isolées l’une de l’autre.  Chaque appel à `useState()` obtient sa propre « cellule mémoire ».

Il y a quelques autres manières de contourner ce défaut, mais elles ont toutes leurs propres soucis.  Explorons ce sujet d’un peu plus près.

### Défaut n°3 : Impossible d’appeler le même Hook deux fois

Une autre variation de l’approche « par clé » de `useState` consiste à utiliser quelque chose comme les Symboles. Ceux-ci empêchent les conflits, pas vrai ?

```jsx
// ⚠️ Ceci n’est PAS l’API de Hooks de React
const nameKey = Symbol();
const surnameKey = Symbol();
const widthKey = Symbol();

function Form() {
  // On passerait une sorte de clé d’état à useState()
  const [name, setName] = useState(nameKey);
  const [surname, setSurname] = useState(surnameKey);
  const [width, setWidth] = useState(widthKey);
  // ...
```

Cette approche semble fonctionner pour extraire le Hook `useWindowWidth` :

```jsx{4,11-17}
// ⚠️ Ceci n’est PAS l’API de Hooks de React
function Form() {
  // ...
  const width = useWindowWidth();
  // ...
}

/*********************
 * useWindowWidth.js *
 ********************/
const widthKey = Symbol();

function useWindowWidth() {
  const [width, setWidth] = useState(widthKey);
  // ...
  return width;
}
```

Mais si on essaie d’extraire la gestion de saisie, ça échouerait :

```jsx{4,5,19-29}
// ⚠️ Ceci n’est PAS l’API de Hooks de React
function Form() {
  // ...
  const name = useFormInput();
  const surname = useFormInput();
  // ...
  return (
    <>
      <input {...name} />
      <input {...surname} />
      {/* ... */}
    </>
  )
}

/*******************
 * useFormInput.js *
 ******************/
const valueKey = Symbol();

function useFormInput() {
  const [value, setValue] = useState(valueKey);
  return {
    value,
    onChange(e) {
      setValue(e.target.value);
    },
  };
}
```

(Je vous accorde que ce Hook `useFormInput()` n’est pas super utile, mais on pourrait imaginer qu’il gère des trucs comme la validation ou un drapeau de modification, façon [Formik](https://github.com/jaredpalmer/formik).)

Vous avez repéré le bug ?

On appelle `useFormInput()` deux fois, mais notre `useFormInput()` appelle toujours `useState()` avec la même clé.  En pratique, on fait ceci :

```jsx
  const [name, setName] = useState(valueKey);
  const [surname, setSurname] = useState(valueKey);
```

Et hop, re-conflit.

La proposition officielle pour les Hooks n’a pas ce problème parce que **chaque _appel_ à `useState()` obtient son propre état isolé.**  Se baser sur une position d’appel stable nous libère des soucis de conflit de nommage.

### Défaut n°4 : Le problème du Diamant

Techniquement c’est le même défaut que juste avant, mais il mérite d’être mentionné à part en raison de sa célébrité.  Il est même [décrit dans Wikipedia](https://fr.wikipedia.org/wiki/Probl%C3%A8me_du_diamant). (Apparemment, on l’appelle aussi « Diamant mortel de la mort » — pas mal.)

Notre propre système de mixins [en souffrait](https://reactjs.org/blog/2016/07/13/mixins-considered-harmful.html#mixins-cause-name-clashes).

Deux Hooks personnalisés comme `useWindowWidth()` et `useNetworkStatus()` pourraient vouloir utiliser le même Hook personnalisé genre `useSubscription()` sous le capot :

```jsx{12,23-27,32-42}
function StatusMessage() {
  const width = useWindowWidth();
  const isOnline = useNetworkStatus();
  return (
    <>
      <p>La fenêtre fait {width} de large</p>
      <p>Vous êtes {isOnline ? 'en ligne' : 'hors-ligne'}</p>
    </>
  );
}

function useSubscription(subscribe, unsubscribe, getValue) {
  const [state, setState] = useState(getValue());
  useEffect(() => {
    const handleChange = () => setState(getValue());
    subscribe(handleChange);
    return () => unsubscribe(handleChange);
  });
  return state;
}

function useWindowWidth() {
  const width = useSubscription(
    handler => window.addEventListener('resize', handler),
    handler => window.removeEventListener('resize', handler),
    () => window.innerWidth
  );
  return width;
}

function useNetworkStatus() {
  const isOnline = useSubscription(
    handler => {
      window.addEventListener('online', handler);
      window.addEventListener('offline', handler);
    },
    handler => {
      window.removeEventListener('online', handler);
      window.removeEventListener('offline', handler);
    },
    () => navigator.onLine
  );
  return isOnline;
}
```

C’est un cas d’utilisation totalement légitime. **Il devrait être sans danger pour l’auteur d’un Hook personnalisé de commencer ou de cesser d’utiliser un autre Hook personnalisé sans avoir à se soucier du fait qu’il serait « déjà utilisé » ailleurs dans la chaîne.** En fait, *on ne peut jamais connaître* la chaîne complète à moins d’auditer chaque composant utilisant notre Hook, chaque fois qu’on le modifie.

(À titre de contre-exemple, les mixins historiques `createClass()` de React ne vous permettaient pas de faire ça. Il pouvait arriver que vous ayez deux mixins qui faisaient chacun exactement ce dont vous aviez besoin mais étaient mutuellement incompatibles parce qu’ils étendait le même « mixin de base ».)

Voici notre « diamant » : 💎

```
       / useWindowWidth()   \                   / useState()  🔴 Clash
Status                        useSubscription()
       \ useNetworkStatus() /                   \ useEffect() 🔴 Clash
```

En nous basant sur l’ordre d’appel, le problème disparaît naturellement :

```
                                                 / useState()  ✅ #1. État
       / useWindowWidth()   -> useSubscription()
      /                                          \ useEffect() ✅ #2. Effet
Status
      \                                          / useState()  ✅ #3. État
       \ useNetworkStatus() -> useSubscription()
                                                 \ useEffect() ✅ #4. Effet
```

Les appels de fonctions n’ont pas de problème de « diamant » parce qu’elles forment plutôt un arbre. 🎄

### Défaut n°5 : Le copier-coller casse des trucs

On pourrait peut-être sauver la proposition à base de clés en introduisant une sorte d’espace de noms.  Il y a plusieurs manières de s’y prendre.

Une première façon consisterait à isoler les clés d’état dans des fermetures lexicales (*closures*).  Cela nécessiterait qu’on « instancie » les Hooks personnalisés et qu’on ajoute donc une fonction d’enrobage autour de chacun d’eux :

```jsx{5,6}
/*******************
 * useFormInput.js *
 ******************/
function createUseFormInput() {
  // Unique par « instanciation »
  const valueKey = Symbol();

  return function useFormInput() {
    const [value, setValue] = useState(valueKey);
    return {
      value,
      onChange(e) {
        setValue(e.target.value);
      },
    };
  }
}
```

Cette approche est plutôt lourde.  Un des objectifs de conception des Hooks était justement d’éviter le style fonctionnel fortement imbriqué qui domine les composants d’ordre supérieur (HOC) et les *render props*.  Ici, on doit « instancier » *n’importe quel* Hook avant de nous en servir—et utiliser la fonction résultat *une seule fois* dans le corps du composant.  Ce n’est pas tellement plus simple que de devoir appeler les hooks inconditionnellement.

Qui plus est, on devrait répéter chaque Hook personnalisé utilisé par un composant : une première fois au niveau racine (ou dans la portée de la fonction si on écrit un Hook personnalisé), et une seconde fois à l’emplacement effectif d’appel.  Ça signifie qu’il vous faudrait jongler entre le rendu et la déclaration racine même pour de petites modifications :

```jsx{2,3,7,8}
// ⚠️ Ceci n’est PAS l’API de Hooks de React
const useNameFormInput = createUseFormInput();
const useSurnameFormInput = createUseFormInput();

function Form() {
  // ...
  const name = useNameFormInput();
  const surname = useNameFormInput();
  // ...
}
```

Il faudrait aussi faire preuve de beaucoup de rigueur dans le nommage.  On aurait toujours « deux niveaux » de noms—les *factories* comme `createUseFormInput` et les Hooks instanciés comme `useNameFormInput` et `useSurnameFormInput`.

Si vous appeliez la même « instance » de Hook personnalisé deux fois, vous auriez un conflit d’état.  En fait, le code ci-dessus fait cette erreur, vous l’aviez remarqué ? Ce devrait être :

```jsx
  const name = useNameFormInput();
  const surname = useSurnameFormInput(); // Et non useNameFormInput !
```

Ces problèmes ne sont pas insurmontables mais j’estime qu’ils ajoutent *plus* de friction que de simplement suivre les [Règles des Hooks](https://reactjs.org/docs/hooks-rules.html).

Point tout aussi important, cette approche enfreint les attentes qu’on a du copier-coller.  Extraire un Hook personnalisé sans l’enrobage de fermeture lexicale *continue à marcher* avec cette approche, mais seulement jusqu’à ce qu’on l’appelle deux fois. (À partir de quoi un conflit émerge.)  Il est désolant qu’une API qui semble marcher nous force soudain à Enrober Tout Partout™ lorsqu’on réalise qu’un conflit est survenu quelque part au fin fond de la chaîne.

### Défaut n°6 : On a toujours besoin d’un *linter*

Il existe une autre façon d’éviter les conflits dus à un état géré par clés.  Si vous la connaissez, vous deviez commencer à fulminer que je n’en aie pas encore parlé ! Désolé.

L’idée serait de *composer* les clés chaque fois qu’on écrit un Hook personnalisé.  Quelque chose comme ça :

```jsx{4,5,16,17}
// ⚠️ Ceci n’est PAS l’API de Hooks de React
function Form() {
  // ...
  const name = useFormInput('name');
  const surname = useFormInput('surname');
  // ...
  return (
    <>
      <input {...name} />
      <input {...surname} />
      {/* ... */}
    </>
  )
}

function useFormInput(formInputKey) {
  const [value, setValue] = useState('useFormInput(' + formInputKey + ').value');
  return {
    value,
    onChange(e) {
      setValue(e.target.value);
    },
  };
}
```

De toutes les alternatives proposées, c’est celle qui me dérange le moins.  Mais je ne pense quand même pas qu’elle vaille le coup.

Du code qui passerait des clés non-uniques ou mal composées *tomberait en marche* jusqu’à ce qu’un Hook soit appelé plusieurs fois, ou entre en conflit avec un autre Hook.  Pire, si c’est censé permettre l’appel conditionnel (après tout, on essaie de « corriger » l’exigence d’appel inconditionnel, non ?), on ne pourrait détecter ces conflits que tardivement.

Devoir se rappeler de passer des clés à travers chaque couche de Hooks personnalisés semble suffisamment fragile pour que je veuille avoir un *linter* pour ça.  Ce qui ajouterait du travail à l’exécution (n’oubliez pas qu’elles sont censées servir *de clés*), et chaque fois ce sont quelques grammes supplémentaires dans le poids du bundle final. **Mais si on doit *linter* de toutes façons, quel problème a-t-on résolu ?**

Ça pourrait avoir du sens si la déclaration conditionnelle d’état et d’effets était vraiment souhaitable.  Mais en pratique, je la trouve plutôt gênante.  Je n’ai pas souvenir de qui que ce soit ayant jamais demandé à définir conditionnellement `this.state` ou `componentDidMount`, d’ailleurs.

Selon vous, que signifie le code ci-dessous ?

```jsx{3,4}
// ⚠️ Ceci n’est PAS l’API de Hooks de React
function Counter(props) {
  if (props.isActive) {
    const [count, setCount] = useState('count');
    return (
      <p onClick={() => setCount(count + 1)}>
        {count}
      </p>;
    );
  }
  return null;
}
```

Est-ce que `count` est préservé quand `props.isActive` est `false` ?  Ou alors, est-il réinitialisé parce que `useState('count')` n’a pas été appelée ?

Si un état conditionnel est préservé, qu’en est-il d’un effet ?

```jsx{5-8}
// ⚠️ Ceci n’est PAS l’API de Hooks de React
function Counter(props) {
  if (props.isActive) {
    const [count, setCount] = useState('count');
    useEffect(() => {
      const id = setInterval(() => setCount(c => c + 1), 1000);
      return () => clearInterval(id);
    }, []);
    return (
      <p onClick={() => setCount(count + 1)}>
        {count}
      </p>;
    );
  }
  return null;
}
```

Il ne peut clairement pas s’exécuter *avant* que `props.isActive` soit à `true` pour la première fois. Mais une fois qu’elle devient `true`, l’effet s’arrête-t-il jamais de tourner ?  Le *timer* périodique doit-il être annulé quand `props.isActive` passe à `false` ?  Si tel est le cas, ce serait déroutant qu’un effet se comporte différemment de l’état (dont on a dit qu’il était préservé).  Mais si l’effet continue, il est déroutant que le `if` qui entoure l’effet ne le rende plus conditionnel.  L’idée n’était-elle pas d’avoir des effets conditionnels ?

Et si l’état *est* réinitialisé quand on ne « l’utilise » pas lors d’un rendu, que se passerait-il si plusieurs branches de `if` contiennent un `useState('count')`, mais que seule l’une d’elles s’exécute à un instant donné ? Serait-ce un code valide ? Si notre modèle mental est une « table de correspondances à base de clés », pourquoi des trucs « disparaîtraient » à l’intérieur ? La développeuse s’attendrait-elle à ce qu’un `return` de court-circuit dans le composant réinitialise tous les états utilisés plus loin ?  Si on voulait vraiment réinitialiser l’état, on pourrait être explicites en extrayant un composant :

```jsx
function Counter(props) {
  if (props.isActive) {
    // Là, on a clairement un état qui lui est propre
    return <TickingCounter />;
  }
  return null;
}
```

De toutes façons, ça deviendrait probablement une « meilleure pratique » pour éviter ces questions dérangeantes. Ainsi, peu importe comment vous décidez de les traiter, je pense que les aspects sémantiques de la *déclaration* conditionnelle d’état et d’effets apporte intrinsèquement des comportements si bizarres que vous voudriez *linter* pour les empêcher.

Et si on doit *linter*, l’exigence de composition correcte des clés devient un « poids mort ».  Elle ne nous apporte rien que nous *voulions* vraiment.  En revanche, abandonner cette exigence (et revenir à la proposition officielle) *nous apporte bien* quelque chose.  Elle permet de copier-coller en confiance du code de composant vers un Hook personnalisé, sans avoir à recourir à un espace de noms ; elle réduit la taille du bundle en supprimant le besoin de clés ; et elle ouvre la voie à une implémentation légèrement plus performante (pas besoin de lookups dans une Map).

Ce sont des petits gestes qui comptent.

### Défaut n°7 : Impossible de passer des valeurs entre les Hooks

Un des plus grands avantages des Hooks est qu’on peut aisément passer des valeurs entre eux.

Voici un exemple hypothétique de choix d’un destinataire de message qui affiche l’état en ligne de la personne sélectionnée :

```jsx{8,9}
const friendList = [
  { id: 1, name: 'Phoebe' },
  { id: 2, name: 'Rachel' },
  { id: 3, name: 'Ross' },
];

function ChatRecipientPicker() {
  const [recipientID, setRecipientID] = useState(1);
  const isRecipientOnline = useFriendStatus(recipientID);

  return (
    <>
      <Circle color={isRecipientOnline ? 'green' : 'red'} />
      <select
        value={recipientID}
        onChange={e => setRecipientID(Number(e.target.value))}
      >
        {friendList.map(friend => (
          <option key={friend.id} value={friend.id}>
            {friend.name}
          </option>
        ))}
      </select>
    </>
  );
}

function useFriendStatus(friendID) {
  const [isOnline, setIsOnline] = useState(null);
  const handleStatusChange = (status) => setIsOnline(status.isOnline);
  useEffect(() => {
    ChatAPI.subscribeToFriendStatus(friendID, handleStatusChange);
    return () => {
      ChatAPI.unsubscribeFromFriendStatus(friendID, handleStatusChange);
    };
  });
  return isOnline;
}
```

Quand on change le destinataire, notre Hook `useFriendStatus()` serait automatiquement désinscrit du statut de la personne précédente, et s’inscrirait à celui de la prochaine.

Ça fonctionne parce qu’on peut passer la valeur de retour du Hook `useState()` au Hook `useFriendStatus()` :

```jsx{2}
  const [recipientID, setRecipientID] = useState(1);
  const isRecipientOnline = useFriendStatus(recipientID);
```

Passer des valeurs entre les Hooks recèle une énorme puissance.  Par exemple, [React Spring](https://medium.com/@drcmda/hooks-in-react-spring-a-tutorial-c6c436ad7ee4) vous permet de créer une séquence d’animations basée sur plusieurs valeurs qui se « suivent » l’une l’autre :

```jsx
  const [{ pos1 }, set] = useSpring({ pos1: [0, 0], config: fast });
  const [{ pos2 }] = useSpring({ pos2: pos1, config: slow });
  const [{ pos3 }] = useSpring({ pos3: pos2, config: slow });
```

(Voici une [démo](https://codesandbox.io/s/ppxnl191zx).)

Les propositions qui placent l’initialisation des Hooks dans des valeurs par défaut d’arguments, ou qui écrivent les Hooks sous forme de décorateurs, rendent ce genre de logique difficile à exprimer.

Si l’appel des Hooks ne se fait pas au sein de la fonction, on ne peut plus facilement passer des valeurs entre eux, ou transformer ces valeurs, sans ajouter plusieurs couches de composants, ou ajouter un `useMemo()` pour mettre en cache des calculs intermédiaires.  On ne peut pas non plus référencer facilement ces valeurs dans les effets parce qu’ils ne peuvent pas capturer les valeurs grâce à la fermeture lexicale (*closure*).  Il existe des moyens de contourner ces problèmes à l’aide de conventions, mais elles nous obligent à faire une « correspondance » mentale entre entrées et sorties.  C’est délicat, et en violation du style par ailleurs direct de React.

Passer des valeurs entre les hooks est au cœur de notre proposition.  L’approche des *render props* était ce qui s’en rapprochait le plus sans les Hooks, mais on n’en tirait pas les pleins bénéfices qu’en recourant à quelque chose comme [Component Component](https://ui.reach.tech/component-component), ce qui amène beaucoup de bruit syntaxique en raison de sa « fausse hiérarchie ».  Les Hooks aplatissent la hiérarchie en passant les valeurs—et les appels de fonctions sont la manière la plus simple de le faire.

### Défaut n°8 : Trop de formalisme

Ce défaut se retrouve dans de nombreuses propositions.  La plupart tentent d’éviter une dépendance perçue des Hooks à React.  Les manières d’y arriver sont nombreuses : rendre les hooks prédéfinis accessibles via `this`, les passer comme argument supplémentaire à toutes les méthodes, etc.

Je trouve que [la réponse de Sebastian](https://github.com/reactjs/rfcs/pull/68#issuecomment-439314884) traite ce point beaucoup mieux que je ne pourrais le faire, alors je vous encourage à en lire la première section (_“Injection Model”_).

Je me contenterai de dire ici que ce n’est pas sans raison que les programmeurs ont tendance à préférer `try` / `catch` plutôt que passer les codes d’erreur à travers chaque fonction de rappel lorsqu’il s’agit de gérer les erreurs. C’est pour la même raison qu’ils préfèrent les modules ES basés sur `import` (ou le `require` de CommonJS) aux définitions « explicites » d’AMD qui nous passent le `require` en argument.

```jsx
// Y’a-t-il quelqu’un qui est nostalgique d’AMD ?
define(['require', 'dependency1', 'dependency2'], function (require) {
  var dependency1 = require('dependency1');
  var dependency2 = require('dependency2');
  return function () {};
});
```

Oui, AMD est peut-être plus « honnête » sur le fait que les modules ne sont pas chargés de façon synchrone par l’environnement du navigateur.  Mais une fois qu’on a compris ça, il est juste pénible d’avoir à écrire ce sandwich à base de `define` à chaque fois.

`try` / `catch`, `require`, et l’API de Contextes de React sont des exemples pragmatiques de situations où l’on souhaite avoir une gestion « déjà là » plutôt que d’avoir à la passer explicitement à travers chaque niveau de code—même si, en général, on préfère être explicites.  Je pense qu’il en va de même pour les Hooks.

C’est un peu comme le fait que, lorsqu’on définit des composants, on choppe juste le `Component` depuis `React`.  Notre code serait sans doute plus découplé de React si on exportait à la place une factory pour chaque composant :

```jsx
function createModal(React) {
  return class Modal extends React.Component {
    // ...
  };
}
```

Mais en pratique, ça deviendrait juste une couche énervante d’indirection.  Le jour où on voudra effectivement remplacer React par autre chose, on pourra toujours plutôt le faire au niveau du systèmes de modules.

C’est pareil pour les Hooks. Ceci dit, comme [la réponse de Sebastian](https://github.com/reactjs/rfcs/pull/68#issuecomment-439314884) le mentionne, il est *techniquement possible* de « rediriger » les Hooks exportés par `react` vers une autre implémentation. ([Un de mes précédents articles](/how-does-setstate-know-what-to-do/) indique comment.)

Une autre manière d’imposer trop de formalisme consisterait à rendre les Hooks [monadiques](https://paulgray.net/an-alternative-design-for-hooks/) ou à ajouter un concept à part entière du genre `React.createHook()`. Le surcoût d’exécution mis à part, toute solution qui ajoute de l’enrobage nous fait perdre un des avantages majeurs des fonctions nues : *y’a pas plus simple à déboguer.*

Les fonctions nues vous laissent entrer et sortir avec un débogueur sans vous embourber dans du code intermédiaire de bibliothèque, et voir exactement comment les valeurs circulent dans le corps de votre composant.  Les indirections rendent cela difficile.  Les solutions d’esprit similaire aux composants d’ordre supérieurs (Hooks de style « décorateurs ») ou aux *render props* (ex. la proposition `adopt` ou le recours au `yield` des générateurs) souffrent du même problème.  Les indirections compliquent par ailleurs le typage statique.

---

Comme je l’ai dit plus tôt, cet article n’ambitionne pas d’être exhaustif.  On trouve d’autres problèmes intéressants dans d’autres propositions.  Certains sont plus obscurs (ex. relatifs à la concurrence ou à des techniques de compilation avancées) et feront peut-être le sujet d’un autre article à l’avenir.

Les Hooks ne sont pas non plus parfaits, mais ils constituent le meilleur compromis que nous avons pu trouver pour résoudre ces problèmes.  Il existe encore des choses que nous [devons régler](https://github.com/reactjs/rfcs/pull/68#issuecomment-440780509), et il y a des choses qui sont plus malaisées à faire avec les Hooks qu’avec des classes.  Là aussi, c’est un sujet pour un autre article.

Que j’aie ou non couvert votre proposition alternative préférée, j’espère que ce texte vous aura aidés à mieux comprendre notre processus de réflexion et les critères que nous examinons quand nous choisissons une API.  Comme vous pouvez le voir, de nombreux points (tels que la capacité à copier-coller en confiance, à déplacer du code, à ajouter ou retirer des dépendances) servent à [optimiser pour le changement](/optimized-for-change/).  J’espère que les utilisateurs de React apprécieront ces aspects.
