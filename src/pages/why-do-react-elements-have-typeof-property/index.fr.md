---
title: Pourquoi les éléments React ont-ils une propriété $$typeof ?
date: '2018-12-03'
spoiler: C’est une question de sécurité.
---

Vous vous dites peut-être que vous écrivez du JSX :

```jsx
<marquee bgcolor="#ffa7c4">salut</marquee>
```

Mais en vrai, vous appelez une fonction :

```jsx
React.createElement(
  /* type */ 'marquee',
  /* props */ { bgcolor: '#ffa7c4' },
  /* children */ 'salut'
)
```

Et cette fonction vous renvoie un objet.  Nous appelons cet objet un *élément* React.  Il dit à React quoi *renderer* ensuite.  Vos composants renvoient une arborescence d’éléments.

```jsx{9}
{
  type: 'marquee',
  props: {
    bgcolor: '#ffa7c4',
    children: 'salut',
  },
  key: null,
  ref: null,
  $​$typeof: Symbol.for('react.element'), // Tékitoa ?
}
```

Si vous utilisez React vous voyez peut-être à quoi correspondent les champs `type`, `props`, `key`, et `ref`. **Mais qu’est-ce que `$$typeof` ? Et pourquoi a-t-il un `Symbol()` comme valeur ?**

C’est encore un de ces trucs que vous n’avez pas *besoin* de savoir pour utiliser React, mais qui sont agréables à savoir.  Cet article contient aussi quelques astuces sur la sécurité qui pourraient vous intéresser.  Peut-être qu’un jour vous écrirez votre propre bibliothèque UI et que tout ça vous sera bien utile.  Je l’espère en tout cas.

---

Avant que les bibliothèques UI côté client deviennent répandues et ajoutent des protections basiques, on trouvait fréquemment du code applicatif qui construisait du HTML et l’insérait à même le DOM :

```jsx
const messageEl = document.getElementById('message');
messageEl.innerHTML = '<p>' + message.text + '</p>';
```

Ça marche bien, sauf lorsque `message.text` est un truc du genre `'<img src onerror="stealYourPassword()">'`. **Vous ne voulez surtout pas que des trucs écrits par des inconnus atterrissent tels quels dans le HTML rendu par votre application.**

(Détail amusant : si vous ne faites que du rendu côté client, une balise `<script>` ici ne vous permettrait pas d’exécuter du JavaScript. Mais [ne laissez pas ce soulagement](https://gomakethings.com/preventing-cross-site-scripting-attacks-when-using-innerhtml-in-vanilla-javascript/) vous donner une illusion de sécurité.)

Pour vous protéger contre ce type d’attaques, vous pouvez utiliser des APIs sécurisées telles que `document.createTextNode()` ou `textContent`, qui ne traitent que du texte.  Vous pouvez aussi « échapper » en amont les données saisies en remplaçant des caractères potentiellement dangereux tels que `<`, `>` et d’autres au sein des textes fournis par les utilisateurs.

Même ainsi, le coût d’une erreur est élevé, et c’est pénible de devoir se rappeler à tout instant de retravailler les textes fournis par les utilisateurs dans nos affichages.  **C’est pourquoi les bibliothèques modernes telles que React échappent le contenu textuel des chaînes par défaut :**

```jsx
<p>
  {message.text}
</p>
```

Si `message.text` est un texte conçu pour réaliser une attaque à l’aide d’une `<img>` ou autre balise, ça ne deviendra donc pas une véritable balise `<img>`.  React échappera le contenu *et ensuite* l’insèrera dans le DOM.  Ainsi au lieu de voir l’image résultante, on n’en verra que le balisage.

Pour injecter du HTML quelconque dans un élément React, vous devez écrire `dangerouslySetInnerHTML={{ __html: message.text }}`. **Le côté gauche et pénible de cette syntaxe est une *fonctionnalité*.**  L’idée est que ce type de code vous saute aux yeux, afin de faciliter son examen lors des revues et audits de code.

---

**React est-il pour autant totalement immunisé contre les attaques d’injection ? Non.** HTML et le DOM offrent [une large surface d’attaque](https://github.com/facebook/react/issues/3473#issuecomment-90594748), trop difficile ou lente à mitiger pour React et les autres bibliothèques UI. La plupart des vecteurs d’attaque restants concernent les attributs.  Par exemple, si vous *renderez* `<a href={user.website}>`, malheur à vous si l’utilisateur a comme site web `'javascript: stealYourPassword()'`.  Réutiliser verbatim des saisies utilisateurs, par exemple avec un *spread* comme `<div {...userData}>`, reste rare mais tout aussi dangereux.

React [pourrait](https://github.com/facebook/react/issues/10506) fournir davantage de protection au fil du temps, mais dans la plupart des cas cela provient de soucis côté serveur qui [devraient](https://github.com/facebook/react/issues/3473#issuecomment-91327040) être corrigées là-bas de toutes façons.

Quoi qu’il en soit, échapper les contenus textuels reste une première ligne de défense raisonnable, qui rattrape de nombreuses attaques potentielles.  N’est-il pas agréable de savoir que le code ci-dessous est sécurisé ?

```jsx
// Échappé automatiquement
<p>
  {message.text}
</p>
```

**Eh bien, ça n’a pas toujours été le cas, figurez-vous.**  Et c’est là que `$$typeof` entre en scène.

---

Les éléments React ont été volontairement conçus comme des objets nus :

```jsx
{
  type: 'marquee',
  props: {
    bgcolor: '#ffa7c4',
    children: 'salut',
  },
  key: null,
  ref: null,
  $$typeof: Symbol.for('react.element'),
}
```

Même si en temps normal vous les créez avec `React.createElement()`, ce n’est pas une obligation.  Il y a des cas qui justifient que React prenne en charge des objets nus écrits comme celui ci-dessus.  Bien entendu, vous ne *voulez* probablement pas les écrire comme ça, mais [ça peut être](https://github.com/facebook/react/pull/3583#issuecomment-90296667) utile pour un compilateur optimisant, pour passer de l’UI entre des *workers*, ou pour découpler JSX du module React.

Cependant, **si votre serveur a une faille qui permet aux utilisateurs de stocker des objets JSON quelconques** là où le code client attend une chaîne, ça peut devenir un problème :

```jsx{2-10,15}
// Le serveur a une faille qui laisse les utilisateurs stocker du JSON
let expectedTextButGotJSON = {
  type: 'div',
  props: {
    dangerouslySetInnerHTML: {
      __html: '/* mets ton attaque ici */'
    },
  },
  // ...
};
let message = { text: expectedTextButGotJSON };

// Dangereux dans React 0.13
<p>
  {message.text}
</p>
```

Dans le cas ci-dessus, React 0.13 serait [vulnérable](http://danlec.com/blog/xss-via-a-spoofed-react-element) à une attaque XSS.  Pour être bien clair encore une fois, **cette attaque dépend d’une faille serveur existante.**  Ce qui ne veut pas dire que React ne pourrait pas améliorer sa protection contre ça.  Et depuis React 0.14, c’est ce qu’il fait.

Le correctif dans React 0.14 a consisté à [taguer chaque élément React avec une valeur de type Symbol](https://github.com/facebook/react/pull/4832) :

```jsx{9}
{
  type: 'marquee',
  props: {
    bgcolor: '#ffa7c4',
    children: 'salut',
  },
  key: null,
  ref: null,
  $​$typeof: Symbol.for('react.element'),
}
```

Ça fonctionne parce qu’on ne peut pas mettre des `Symbol`s dans du JSON. **Ainsi même si le serveur avait une faille qui permette de renvoyer du JSON au lieu de texte simple, ce JSON ne pourrait pas inclure `Symbol.for('react.element')`.** React vérifiera `element.$$typeof`, et refusera de traiter un élément où ce dernier est manquant ou invalide.

Le truc chouette avec `Symbol.for()` spécifiquement, c’est que **ces symboles sont partagés entre les environnements comme les *iframes* et les *workers*.** Donc ce correctif ne nous empêche pas de passer des éléments fiables entre différentes parties de l’application, même dans des situations exotiques.  Dans la même veine, même si plusieurs copies de React existaient sur la page, elles seraient tout de même « d’accord » sur la valeur valide de `$$typeof`.

---

Et pour les navigateurs qui [ne prennent pas en charge](https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Objets_globaux/Symbol#Compatibilit%C3%A9_des_navigateurs) les symboles ?

Hélas, ils ne bénéficieront pas de cette protection supplémentaire.  React inclut tout de même un champ `$$typeof` sur les éléments par souci de cohérence, mais il est [défini par un nombre](https://github.com/facebook/react/blob/8482cbe22d1a421b73db602e1f470c632b09f693/packages/shared/ReactSymbols.js#L14-L16) — `0xeac7`.

Pourquoi ce nombre spécifiquement ? `0xeac7` ressemble un peu à « React ».
