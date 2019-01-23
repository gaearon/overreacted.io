---
title: Ma liste de souhaits pour le Hot Reloading
date: '2018-12-08'
# Intentionally left in English, as these are lyrics.
spoiler: I don't want a lot for Christmas. There is just one thing I need.
---

Y’a-t-il un projet que vous rattaquez à chaque fois avec un mélange de succès et d’échec, puis vous vous en éloignez quelques temps, pour y revenir ensuite, année après année ?  Pour certains, c’est un routeur ou un système de défilement de liste virtuelle.  Pour moi, c’est le *hot reloading* *(« rechargement à chaud » ; le terme anglais, beaucoup plus installé, sera utilisé sans italiques dans la suite de ce texte, NdT)*.

La première fois que j’ai entendu parler de changer le code exécuté à la volée, c’était une brève mention dans un bouquin sur Erlang que j’ai lu étant ado.  Bien plus tard, comme de nombreux autres, je suis tombé amoureux des [magnifiques démos de Bret Victor](https://vimeo.com/36579366).  J’ai lu quelque part que Bret n’était pas content que les gens ne retiennent que les parties « faciles » de ses démos, laissant de côté la vision globale (aucune idée si c’est vrai). **Quoi qu’il en soit, à mes yeux pouvoir livrer même de petites améliorations incrémentales que les gens tiennent ensuite pour acquises constitue un succès.**  Je laisse aux gens plus intelligents que moi le soin de travailler sur les Prochaines Grandes Idées.

Bon, je voudrais tout de même insister sur le fait qu’aucune des *idées* dont parle cet article ne vient de moi. Je me suis [inspiré](https://redux.js.org/introduction/prior-art) de nombreux projets, et de nombreuses personnes.  En fait, il est même arrivé que des gens me disent que j’avais piqué des trucs dans leurs projets, alors que je n’en avais jamais entendu parler.

Je ne suis pas un inventeur. Si j’ai un « principe », c’est de prendre une vision qui m’inspire, et de la partager avec davantage de monde—au travers de mots, de code, et de démos.

Et le hot reloading m’inspire.

---

J’ai fait plusieurs tentatives d’implémentation du hot reloading pour React.

Avec le recul, [la première démo](https://vimeo.com/100010922) que j’ai bricolée a changé ma vie. Elle m’a apporté mes premiers followers sur Twitter, mon premier millier d’étoiles sur GitHub, et plus tard ma première apparition sur la [page d’accueil de HN](https://news.ycombinator.com/item?id=8982620), et même ma première [présentation en conférence](https://www.youtube.com/watch?v=xsSnOQynTHs) (en créant Redux au passage, oups). La première itération a plutôt bien marché.  Seulement voilà, peu après React a *laissé tomber* `createClass`, et implémenter tout ça de façon fiable est devenu plus difficile.

Depuis j’ai à mon actif [quelques tentatives supplémentaires](https://medium.com/@dan_abramov/hot-reloading-in-react-1140438583bf?source=user_profile---------6------------------) de résoudre ce problème, chacune avec ses propres soucis. L’une d’elles est encore utilisée dans React Native (ou le hot reloading des fonctions ne marche pas à cause de mes erreurs—désolé !)

À force de frustration face à mon incapacité à contourner ces soucis et en raison d’un manque de temps, j’ai transmis les rênes de React Hot Loader à quelques contributeurs talentueux.  Ils ont fait avancer la solution et trouvé des astuces pour contourner les failles de ma conception.  Je leur suis reconnaissant d’avoir conservé le projet en bon état malgré les défis.

---

**Soyons clair : le hot reloading avec React est bien utilisable aujourd’hui.**  En fait, ce blog utilise Gatsby qui utilise React Hot Loader sous le capot.  Je sauve l’article dans mon éditeur et il se met à jour sans rafraîchir la page.  Magique !  Dans une certaine mesure, la vision dont je craignais qu’elle ne devienne jamais très répandue est déjà d’une banalité ennuyeuse.

Mais de nombreuses personnes estiment qu’on n’est pas encore aussi bien qu’on pourrait l’être.  Certains estiment aussi que le hot reloading n’est qu’un gadget, ce qui me fend un peu le cœur, mais je crois que ce qu’elles veulent vraiment dire c’est : **l’expérience développeur n’est pas transparente.**  Ça ne vaut pas le coup si on n’est jamais sûrs que le rechargement a bien fonctionné, si ça se casse les dents de façon bizarre, ou si c’est juste plus facile de rafraîchir.  Et je suis d’accord à 100%, mais pour moi ça veut juste dire que j’ai du pain sur la planche.  Et je trouve motivant de commencer à réfléchir à ce à quoi pourrait ressembler, à l’avenir, une prise en charge officielle de React pour le hot reloading.

(Si vous utilisez un langage comme Elm, Reason ou ClojureScript, ces problèmes ont peut-être été résolus dans votre écosystème. Je suis heureux pour vous.  Mais ça ne m’empêchera pas d’essayer, sans forcément réussir, d’amener ce genre de confort dans le monde JavaScript.)

---

Je crois que je suis prêt à tenter une nouvelle fois d’implémenter ça.  Voici pourquoi.

Dès l’instant où `createClass` a cessé d’être le principal moyen de définir des composants, **la plus importante source de complexité et de fragilité pour le hot reloading a résidé dans le remplacement dynamique des méthodes des classes.**  Comment modifier les instances existantes des classes avec les nouvelles « versions » de leurs méthodes ? La réponse naïve serait « remplace-les dans le prototype » mais même avec les Proxies, mon expérience m’a appris qu’il y a trop de cas tordus à la marge pour que ça marche de façon fiable.

Par comparaison, le hot reloading de fonctions est facile.  Un plugin Babel peut découper tout composant basé fonction exporté depuis un module en deux fonctions :

```jsx
// Réaffecte la dernière version
window.latest_Button = function(props) {
  // Votre véritable code est déplacé ici par le plugin
  return <button>Bonjour</button>;
}

// Considérez ceci comme un « proxy »
// que les autres composants utiliseraient
export default function Button(props) {
  // Pointe toujours vers la dernière version
  return window.latest_Button(props);
}
```

<!-- RESUME -->

Chaque fois que ce module se re-exécute après une modification, `window.latest_Button` pointerait vers la dernière implémentation.  Réutiliser la même fonction `Button` entre les évaluations de module nous permet de feinter React pour qu’il ne démonte pas le composant *(ne le retire pas de son DOM, NdT)* même si l’implémentation réelle a en fait été remplacée.

Pendant longtemps, j’ai cru que l’implémentation fiable du hot reloading pour les fonctions serait *suffisante en elle-même* pour encourager les gens à écrire du code parfois tordu juste pour éviter les classes. Mais avec les [Hooks](https://reactjs.org/docs/hooks-intro.html), les composants fonctionnels sont mis à l'avant-plan, donc ça va bientôt être mission accomplie.  Et cette approche marche automatiquement avec les Hooks :

```jsx{4}
// Réaffecte la dernière version
window.latest_Button = function(props) {
  // Votre véritable code est déplacé ici par le plugin
  const [name, setName] = useState('Mary');
  const handleChange = e => setName(e.target.value);
  return (
    <>
      <input value={name} onChange={handleChange} />
      <h1>Bonjour, {name}</h1>
    </>
  );
}

// Considérez ceci comme un « proxy »
// que les autres composants utiliseraient
export default function Button(props) {
  // Pointe toujours vers la dernière version
  return window.latest_Button(props);
}
```

Tant que l’ordre d’appel des Hooks ne change pas, nous pouvons préserver l’état même si `window.latest_Button` est remplacée d’une modification de fichier à l’autre.  Et remplacer les gestionnaires d’événements marche d’office également—parce que les Hooks reposent sur les fermetures lexicales (*closures*), et que nous remplaçons la fonction entière.

---

C’était juste une ébauche grossière d’une solution possible.  Il y en a d’autres (certaines très différentes de ça).  Comment les évaluer et les comparer ?

Avant de trop m'attacher à une approche précise qui pourrrait présenter des défauts, **j’ai décidé de poser par écrit quelques principes que je juge importants pour évaluer une implémentation de hot reloading destinée au code de composants.**

Ce serait sympa de pouvoir exprimer au moins certains de ces principes sous forme de tests plus tard.  Ce ne sont pas des règles strictes, et des compromis raisonnables ne sont pas exclus.  Mais si on doit les enfreindre, ça devrait être une décision explicite de conception, et pas une déviation accidentelle réalisée plus tard.

Alors voici ma liste de souhaits pour le hot reloading de composants React :

### Exactitude

* **Le hot reloading doit être indétectable avant la première modification.**  Jusqu’à ce que vous sauvegardiez un fichier, le code devrait se comporter exactement comme si le hot reloading était désactivé.  On peut tolérer que des choses comme `fn.toString()` ne soient pas identiques, ce qui est de toutes façons déjà le cas avec la minification.  Mais ça ne devrait pas casser de la logique raisonnable applicative, ou au sein de bibliothèques.

* **Le hot reloading ne devrait pas enfreindre les règles de React.**  Les composants ne devraient pas voir leurs méthodes de cycle de vie appelées de façon inattendue, subir des échanges d’état local entre des portions de l’arbre sans rapport, ou faire l’objet d’autres comportements non liés à React.

* **Le type de l’élément devrait toujours correspondre à celui attendu.** Certaines approches enrobent les types de composants, mais ça peut casser `<MyThing />.type === MyThing`.  C’est une source de bugs courante et ne devrait pas arriver.

* **Il doit être facile de prendre en charge tous les types React.** `lazy`, `memo`, `forwardRef`—ils devraient tous être pris en charge et ça ne devrait pas être difficile d’ajouter la prise en charge d’autres aspects.  Les variations imbriquées telles que `memo(memo(…))`devraient aussi fonctionner.  On devrait systématiquement remonter *(procéder à une mise à jour intégrale du fragment DOM, NdT)* quand la forme du type change.

* **Ça ne devrait pas réimplémenter plus que de toutes petites parties de React.**  React progresse rapidement.  Si une solution réimplémente React ça lui posera des soucis sur le long terme lorsque React ajoute des fonctionnalités comme Suspense.

* **Les ré-exports ne devraient pas casser.**  Si un composant ré-exporte des composants issus d’autres modules (qu’ils soient à lui ou dans `node_modules`), ça ne devrait pas poser problème.

* **Les champs statiques ne devraient pas casser.** Si vous définissez une méthode `ProfilePage.onEnter`, vous vous attendriez à ce qu’un module important la classe puisse y accéder.  Parfois des bibliothèques se reposent là-dessus, alors il est important qu’il soit possible de lire et écrire des propriétés statiques, et que le composant lui-même « voie » ces valeurs à son propre niveau.

* **Il vaut mieux perdre l’état local que fausser le comportement.** Si on ne peut pas altérer un truc (par exemple, une classe) de façon fiable, il vaut mieux perdre son état local que tenter une mise à jour partielle. Quiconque nous utilise finirait par nous trouver suspects et prendre l’habitude de rafraîchir tout le temps juste au cas où.  Nous devons exprimer clairement quels cas nous pouvons gérer en confiance, et écarter les autres.

* **Il vaut mieux perdre l’état local qu’utiliser une version obsolète.** C’est une variation plus spécifique du principe précédent.  Par exemple, si une classe ne peut pas être rechargée à chaud, le code devrait forcer un remontage de ces composants avec la nouvelle version, plutôt que de continuer le *rendering* de zombies.

### Localité

* **Modifier un module devrait ré-exécuter aussi peu de modules que possible.**  Les effets de bords à l’initialisation d’un module de composant sont découragés de façon générale.  Mais plus vous écrivez de code, plus il est probable que l’appel répété d’un truc laisse des traces.  On parle de JavaScript, et les composants React sont des ilôts de pureté (relative), mais même ici nous n’avons pas de garanties fortes.  Alors si je modifie un module, ma solution de hot reloading devrait ré-exécuter ce module et s’arrêter là autant que possible.

* **Modifier un composant ne devrait pas détruire l’état de ses parents et voisins.**  De la même façon que `setState()` n’affecte que la partie inférieure de l’arbre, modifier un composant ne devrait pas affecter ce qui se trouve au-dessus ou au même niveau.

* **Modifier du code non-React devrait se propager vers le haut.**  Si vous modifiez un fichier avec des constantes ou fonctions pures qui est importé par plusieurs composants, ces composants devraient être mis à jour.  Il est acceptable de perdre l’état interne du module pour de tels fichiers.

* **Une erreur d’exécution introduite par le hot reloading ne devrait pas être propagée.** Si vous faites une erreur dans un composant, elle ne devrait pas casser toute l’application.  Dans React, on règle généralement ce problème avec les *error boundaries*. Cependant, c’est un mécanisme un peu trop grossier pour gérer les innombrables fautes de frappe que nous faisons dans notre éditeur.  Je devrais pouvoir faire et corriger des erreurs d’exécution pendant que je bosse sur un composant sans que ses voisins et parents n’aient besoin d’être démontés.  En revanche, les erreurs qui *n’arrivent pas* pendant le hot reload (et proviennent de véritables bugs dans mon code) devraient remonter jusqu’à l’*error boundary* la plus proche.

* **Préserver l’état local sauf lorsqu’il est clairement préférable de réinitialiser.**  Si vous êtes juste en train de toucher aux styles, c’est frustrant de perdre l’état local à chaque modification. En revanche, si vous venez de modifier la forme de l’état ou la valeur de l’état initial, vous préfèrerez sans doute une réinitialisation de ce dernier.  Par défaut, on devrait tout faire pour préserver l’état.  Mais si ça entraîne des erreurs dues au hot reload, c‘est souvent le signe qu’une supposition a évolué, et que nous devrions réinitialiser l’état et *retenter* le *rendering* dans ce cas.  Commenter ou décommenter du code est commun, alors il est important de gérer ça élégamment.  Par exemple, retirer des Hooks *sur la fin* ne devrait pas réinitialiser l’état.

* **Dégager l’état quand c’est clairement volontaire.**  Dans certains cas, nous pouvons aussi proactivement détecter que l’utilisateur souhaite une réinitialisation.  Par exemple, l’ordre des Hooks a changé, ou des hooks pré-fournis comme `useState` changent de type d’état initial.  Nous pouvons aussi offrir une annotation légère que vous pourriez utiliser pour forcer un composant à réinitialiser son état à chaque modification.  Quelque chose du genre de `// !` qui serait rapide à ajouter et retirer pendant que vous vous concentrez sur la logique de montage du composant.

* **Prendre en charge la mise à jour de trucs « gelés ».**  Si un composant est enrobé par `memo()`, le hot reloading devrait quand même le mettre à jour.  Si un effet est appelé avec `[]`, il devrait tout de même être remplacé.  Le code est comme une variable invisible.  Il n’y a pas si longtemps, je pensais qu’il était important de forcer des mises à jour profondes pour des trucs comme `renderRow={this.renderRow}`.  Mais dans un monde de Hooks, nous nous reposons sur les fermetures lexicales de toute façon, alors ça semble superflu désormais.  Une référence distincte devrait suffire.

* **Prendre en charge des composants multiples par fichier.**  Il est courant que plusieurs composants soient définis dans un même fichier.  Même si on ne gardait l’état que des composants fonctions, nous voulons nous assurer que les placer dans un fichier unique n’entraîne pas la perte de leur état.  Y compris si ces fonctions sont mutuellement récursives.

* **Chaque fois que possible, préserver l’état des enfants.**  Si vous modifiez un composant, c’est toujours frustrant si ses enfants perdent leur état par inadvertance.  Tant que les types d’élément des enfants sont définis dans d’autres fichiers, on s’attend à ce que leurs états soient préservés.  S’ils sont dans le même fichier, on devrait faire tout notre possible pour le garantir.

* **Prendre en charge les Hooks personnalisés.** Pour des Hooks personnalisés correctement écrits (certains cas, comme `useInterval()`, peuvent être un peu délicats), le hot reloading des arguments (y compris les fonctions) devrait marcher.  Ça ne devrait pas nécessiter de travail supplémentaire et procède de la conception des Hooks.  Notre solution doit juste éviter d’interférer.

* **Prendre en charge les *render props*.**  Ça ne pose généralement pas de problèmes, mais ça mérite qu’on vérifie qu’elles fonctionnent et sont mises à jour comme prévu.

* **Prendre en charge les composants d’ordre supérieur (HOC).** Enrober un export dans un composant d’ordre supérieur tel que `connect` ne devrait pas flinguer le hot reloading ni la préservation de l’état.  Si vous utilisez un composant créé à partir d’un HOC dans JSX (tel que `styled`), et que ce composant est une classe, on s’attend à ce qu’il perde son état s’il est instancié au sein du fichier modifié.  mais un HOC qui renvoie un composant fonction (qui utiliserait potentiellement des Hooks) ne devrait pas perdre son état, même s’il est défini dans le même fichier.  En fait, même des modifications à ses arguments (ex. `mapStateToProps`) devraient pouvoir être reflétées.

### Retour d’information

* **Tant le succès que l’échec devraient fournir un retour visuel.**  Vous devriez toujours être sûr·e que votre dernier hot reload a réussi ou échoué.  Dans le cas d’une erreur d’exécution ou de syntaxe, vous devriez voir un panneau superposé qui devrait pouvoir disparaître automatiquement lorsqu’il devient obsolète.  Lorsque le hot reload réussit, il devrait y avoir une forme de retour visuel, tel que le clignotement des composants mis à jour ou une notification.

* **Une erreur de syntaxe ne devrait causer ni erreur d’exécution ni rafraîchissement.**  Lorsque vous modifiez le code et que vous avez une erreur de syntaxe, elle devrait être affichée dans une modale superposée (idéalement, avec un clic qui vous amènerait directement dessus dans votre éditeur).  Si vous faites encore une erreur de syntaxe, la modale existante devrait être mise à jour.  Le hot reloading ne devrait être tenté *qu’une fois que* vous avez corrigé vos erreurs de syntaxe.  Celles-ci ne devraient pas vous faire perdre l’état.

* **Une erreur de syntaxe après le rechargement devrait rester visible.**  Si vous voyez une modale superposée d’erreur de syntaxe et rafraîchissez la page, vous devriez toujours la voir.  Il faudrait absolument éviter que ça n’aboutisse à l'exécution obsolète du dernier code qui avait réussi à se mettre à jour (j’ai déjà vu ça dans certaines configurations).

* **Réfléchir à la mise à disposition d’outils utilisateurs puissants.**  Avec le hot reloading, le code lui-même devient notre « terminal ».  En plus de l’hypothétique commande `// !` qui forcerait le remontage, on pourrait imaginer par exemple une commande `// inspect` qui afficherait un panneau avec les valeurs des props à côté du composant.  Faites preuve de créativité !

* **Minimiser le bruit.**  Les DevTools et les messages d’avertissement ne devraient pas manifester que nous sommes dans un contexte spécial.  Évitons de casser `displayName` ou d’ajouter des enrobages inutiles à l’affichage de débogage.

* **Le débogueur des principaux navigateurs devrait pouvoir afficher le code le plus récent.**  Ça ne dépend pas exactement de nous, mais on devrait faire de notre mieux pour que le débogueur intégré du navigateur puisse afficher la version la plus récente de n’importe quel fichier, et que les points d’arrêts fonctionnent sans surprises.

* **Optimiser pour une boucle d’itération rapide, et non du refactoring long.**  On parle de JavaScript, pas de Elm.  Toute série prolongée de modifications aboutira à une dégradation de qualité du hot reloading en raison de l’accumulation d’erreurs qui devront être corrigées une à une.  Dans le doute, optimisons pour le cas d’usage où on triture quelques composants dans le cadre d’une boucle d’itération rapide, plutôt que pour un gros refactoring.  Et soyons prévisibles.  Gardez à l’esprit que si vous perdez la confiance des développeurs, ils reviendront au rafraîchissement lourd de toutes façons.

---

C’était ma liste de souhaits pour le fonctionnement du hot reloading en React—ou avec n’importe quel système de composants proposant davantage que de simples gabarits.  J’y ajouterai sûrement d’autres trucs avec le temps.

Je ne sais pas combien de ces objectifs nous pourrons atteindre avec JavaScript.  Mais il y a encore une raison pour laquelle j’ai hâte de me remettre au travail sur le hot reloading.  En tant qu’ingénieur, je suis plus organisé qu’avant.  En particulier, **j’ai enfin appris ma leçon et je pose un cahier des charges comme celui-ci avant de me jeter dans une nouvelle implémentation.**

Peut-être que celle-ci marchera enfin !  Mais si ce n’est pas le cas, au moins j’aurai laissé quelques pistes pour la prochaine personne qui essaiera.
