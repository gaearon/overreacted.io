---
title: Pourquoi X n’est-il pas un hook ?
date: '2019-01-26'
spoiler: C’est pas parce qu’on peut qu’on devrait.
---

Depuis la sortie de la première version alpha des [Hooks React](https://reactjs.org/hooks), une question revient souvent dans les discussions : « Pourqoi est-ce que *\<telle ou telle API\>* n’est pas un Hook ? »

À titre de rappel, voici quelques trucs qui *sont* des Hooks :

* [`useState()`](https://reactjs.org/docs/hooks-reference.html#usestate) permet de déclarer une variable d’état.
* [`useEffect()`](https://reactjs.org/docs/hooks-reference.html#useeffect) permet de déclarer un effet de bord.
* [`useContext()`](https://reactjs.org/docs/hooks-reference.html#usecontext) permet de lire des données issues du Contexte.

Mais il y a d’autres APIs, telles que `React.memo()` et `<Context.Provider>`, qui ne sont *pas* des Hooks. Les propositions les plus courantes pour en faire des Hooks s’avèrent toujours *impossibles à composer* ou *anti-modulaires*. Cet article devrait vous aider à comprendre pourquoi.

**Note : cet article est une exploration en profondeur pour les gens qui aiment discuter d’APIs.  Vous n’avez pas besoin de penser à tout ça pour être efficace avec React !**

---

Nous voulons que les APIs React préservent deux propriétés importantes :

1. **Composition :** [les Hooks personnalisés](https://reactjs.org/docs/hooks-custom.html) sont la principale raison de notre enthousiasme pour l’API des Hooks.  Nous nous attendons à ce que les gens créent fréquemment leurs propres Hooks, et nous voulons nous assurer que les Hooks écrits par différentes personnes [ne rentrent pas en conflit](/why-do-hooks-rely-on-call-order/#flaw-4-the-diamond-problem). (Vous trouvez pas qu’on est pourris gâtés par la façon dont les composants se composent proprement et ne se cassent pas l’un l’autre ?)

2. **Débogage :** Nous voulons que les bugs soients [faciles à repérer](/the-bug-o-notation/) alors que l’application grandit.  Un des meilleurs aspects de React, c’est que lorsqu’on remarque un problème dans le rendu, il suffit de remonter l’arborescence des composants jusqu’à trouver dans quel composant une *prop* ou l’état local a causé l’erreur.

Prises ensemble, ces deux contraintes nous disent ce qui peut et *ne peut pas* être un Hook.  Essayons ça sur quelques exemples.

---

## Un véritable Hook : `useState()`

### Composition

Si plusieurs Hooks personnalisés appellent chacun `useState()`, ça ne crée pas de conflit :

```jsx
function useMyCustomHook1() {
  const [value, setValue] = useState(0);
  // Ce qui se passe ici, ça reste ici.
}

function useMyCustomHook2() {
  const [value, setValue] = useState(0);
  // Ce qui se passe ici, ça reste ici.
}

function MyComponent() {
  useMyCustomHook1();
  useMyCustomHook2();
  // ...
}
```

Ajouter un nouvel appel inconditionnel à `useState()` est toujours sans risque.  Pas besoin de savoir quoi que ce soit sur les autres Hooks qu’utiliserait un composant quand on déclare une nouvelle variable d’état.  Il est juste impossible de casser les autres variables d’état lorsqu’on en met une à jour.

**Verdict :** ✅ `useState()` ne fragilise pas les Hooks personnalisés.

### Débogage

Un des gros avantages des Hooks, c’est qu’ils peuvent se refiler des valeurs *entre eux* :

```jsx{4,12,14}
function useWindowWidth() {
  const [width, setWidth] = useState(window.innerWidth);
  // ...
  return width;
}

function useTheme(isMobile) {
  // ...
}

function Comment() {
  const width = useWindowWidth();
  const isMobile = width < MOBILE_VIEWPORT;
  const theme = useTheme(isMobile);
  return (
    <section className={theme.comment}>
      {/* ... */}
    </section>
  );
}
```

Mais que se passe-t-il si on commet une erreur ? À quoi ressemble le débogage ?

Imaginons que la classe CSS qu’on récupère dans `theme.comment` soit erronée.  Comment déboguerait-on ça ?  On peut poser un point d’arrêt ou ajouter quelques appels de log dans le corps de notre composant.

Peut-être que nous verrions que `theme` n’est pas le bon mais que `width` et `isMobile` sont corrects.  Ça nous dirait que le problème vient de `useTheme()`.  Ou peut-être verrions-nous que `width` lui-même est faussé, ce qui nous orienterait vers `useWindowWidth()`.

**Un simple coup d’œil aux valeurs intermédiaires nous dirait lequel de nos Hooks, définis au niveau racine, est à l’origine du bug.**  On n’a pas besoin d’aller fouiller dans *toutes* les implémentations.

Alors seulement on pourra « zoomer » sur le code du hook qui a un bug, et reprendre notre débogage.

Ce point devient critique si la profondeur d’imbrication de nos Hooks personnalisés augmente.  Imaginez que nous ayons 3 niveaux d’imbrication de nos Hooks personnalisés, chacun utilisant 3 Hooks personnalisés distincts.  La [différence](/the-bug-o-notation/) entre chercher un bug à **3 endroits** au lieu de potentiellement vérifier **3 + 3×3 + 3×3×3 = 39 endroits** est énorme. Heureusement, `useState()` ne peut pas « influencer » par magie les autres Hooks ou composants.  S’il renvoie une valeur défectueuse, ça laisse une piste qu’on peut remonter, comme pour n’importe quelle variable. 🐛

**Verdict :** ✅ `useState()` ne masque pas la relation de cause à effet dans notre code.  On peut remonter la piste directement jusqu’à l’origine du bug.

---

## Pas un Hook : `useBailout()`

Pour des raisons d’optimisation, les composants utilisant des Hooks peuvent choisir de sauter un nouveau rendu.

Une des manières d’y parvenir consiste à enrober le composant complet par un [`React.memo()`](https://reactjs.org/blog/2018/10/23/react-v-16-6.html#reactmemo).  Ça fait automatiquement l’impasse sur le rendu si les *props* sont identiques en surface avec celles du rendu précédent.  C’est similaire au recours à `PureComponent` pour les classes.

`React.memo()` prend un composant et renvoie un composant :

```jsx{4}
function Button(props) {
  // ...
}
export default React.memo(Button);
```

**Mais pourquoi ne pas en faire plutôt un Hook ?**

Les proposition dans ce sens, qu’elles l’appellent `useShouldComponentUpdate()`, `usePure()`, `useSkipRender()`, ou `useBailout()`, ont tendance à ressembler à ceci :

```jsx
function Button({ color }) {
  // ⚠️ Cette API n’existe pas
  useBailout(prevColor => prevColor !== color, color);

  return (
    <button className={'button-' + color}>
      OK
    </button>
  )
}
```

On trouve quelques variations supplémentaires (par ex. un simple marqueur `usePure()`), mais dans les grandes lignes toutes partagent les mêmes failles.

### Composition

Imaginons que nous essayions d’utiliser `useBailout()` dans deux Hooks personnalisés :

```jsx{4,5,19,20}
function useFriendStatus(friendID) {
  const [isOnline, setIsOnline] = useState(null);

  // ⚠️ Cette API n’existe pas
  useBailout(prevIsOnline => prevIsOnline !== isOnline, isOnline);

  useEffect(() => {
    const handleStatusChange = status => setIsOnline(status.isOnline);
    ChatAPI.subscribe(friendID, handleStatusChange);
    return () => ChatAPI.unsubscribe(friendID, handleStatusChange);
  });

  return isOnline;
}

function useWindowWidth() {
  const [width, setWidth] = useState(window.innerWidth);

  // ⚠️ Cette API n’existe pas
  useBailout(prevWidth => prevWidth !== width, width);

  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  });

  return width;
}
```

Voyons maintenant ce qui se passe si on utilise les deux dans le même composant :

```jsx{2,3}
function ChatThread({ friendID, isTyping }) {
  const width = useWindowWidth();
  const isOnline = useFriendStatus(friendID);
  return (
    <ChatLayout width={width}>
      <FriendStatus isOnline={isOnline} />
      {isTyping && 'En train d’écrire…'}
    </ChatLayout>
  );
}
```

Quand est-ce que ça refait un rendu ?

Si chaque appel à `useBailout()` a le pouvoir de sauter la mise à jour, alors les mises à jour de `useWindowWidth()` seraient bloquées par `useFriendStatus()`, et réciproquement. **Ces Hooks se casseraient l’un l’autre.**

Inversement, si `useBailout()` n’était pris en compte que lorsque *tous* ses appels au sein de ce composant « sont d’accord » pour bloquer une mise à jour, notre `ChatThread` ne se mettrait pas à jour lorsque la *prop* `isTyping` change.

Pire encore : avec cette sémantique **n’importe quel Hook ajouté à `ChatThread` pourrait casser s’il n’appelle pas *aussi* `useBailout()`**.  Parce que dans le cas contraire, il ne pourrait pas « voter contre » la décision de sauter le rendu faite par `useWindowWidth()` et `useFriendStatus()`.

**Verdict :** 🔴 `useBailout()` enfreint la composition.  L’ajouter dans un Hook casse les mises à jour d’état dans les autres Hooks.  Nous voulons des APIs qui sont [anti-fragiles](/optimized-for-change/), et ce comportement en est pratiquement l’opposé.

### Débogage

Comment un Hook comme `useBailout()` impacterait-il le débogage ?

Voyons ça sur le même exemple :

```jsx
function ChatThread({ friendID, isTyping }) {
  const width = useWindowWidth();
  const isOnline = useFriendStatus(friendID);
  return (
    <ChatLayout width={width}>
      <FriendStatus isOnline={isOnline} />
      {isTyping && 'En train d’écrire…'}
    </ChatLayout>
  );
}
```

Imaginons que le libellé `En train d’écrire…` n’apparaisse pas quand on s’y attend, alors même que, quelque part plus haut dans l’arbre, la *prop* a changé.  Comment déboguer ça ?

**Normalement, avec React on peut répondre en confiance à cette question en regardant *plus haut*.**  Si `ChatThread` n’a pas reçu une nouvelle valeur pour `isTyping`, on peut ouvrir le composant qui fait le rendu de `<ChatThread isTyping={myVar} />` et vérifier `myVar`, et ainsi de suite.  Dans l’un de ces niveaux, nous trouverons soit un bug d’optimisation dans `shouldComponentUpdate()`, soit une valeur incorrecte de `isTyping` qui se retrouve transmise plus bas.  Jeter un œil à chaque composant de la chaîne suffit généralement à repérer l’origine du problème.

En revanche, si le Hook `useBailout()` existait, on ne pourrait jamais connaître la raison du saut d’un rendu tant qu’on n’aurait pas examiné *la totalité des Hooks personnalisés* (en profondeur qui plus est) utilisés par notre `ChatThread` et les composants de sa propre chaîne de parents.  Dans la mesure où chaque composant parent peut *aussi* avoir ses propres Hooks personnalisés, ça [monte très mal en complexité](/the-bug-o-notation/).

Ça revient à chercher un tournevis dans une armoire à tiroirs, où chaque tiroir contiendrait un tas d’autres petites armoires à tiroirs, et on n’a aucune idée de jusqu’à quel niveau de profondeur on va devoir aller.

**Verdict :** 🔴 Non seulement `useBailout()` enfreint la composition, mais il augmente aussi de beaucoup le nombre d’étapes de débogage et la charge mentale nécessaires pour trouver la cause d’un saut incorrect de rendu—une augmentation parfois exponentielle.

---

Nous venons d’examiner un Hook existant, `useState()`, et un Hook fréquemment suggéré mais volontairement indisponible, `useBailout()`.  Nous les avons comparés au regard de la Composition et du Débogage, et discuté des raisons qui font que l’un fonctionne et l’autre non.

Même s’il n’y a pas de « version Hook » de `memo()` et `shouldComponentUpdate()`, React *fournit bien* un Hook appelé [`useMemo()`](https://reactjs.org/docs/hooks-reference.html#usememo).  Son objectif a bien un rapport, mais la sémantique des deux est suffisamment différente pour qu’on ne tombe pas dans les pièges détaillés plus haut.

`useBailout()` n’est qu’un exemple d’un service qui ne pourrait pas bien fonctionner en tant que Hook. Mais il y en a d’autres—par exemple `useProvider()`, `useCatch()`, ou `useSuspense()`.

Pouvez-vous deviner pourquoi ?

*(Chuchotement : Composition… Débogage…)*
