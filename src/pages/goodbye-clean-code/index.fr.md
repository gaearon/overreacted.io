---
title: 'Au revoir le Clean Code'
date: '2020-01-11'
spoiler: Laissez le clean code vous guider, puis laissez le partir.
---

C'était tard dans la soirée.

Mon collègue vient juste d'enregistrer le code qu'il a écrit toute la semaine. Nous étions en train de travailler sur canvas d'éditeur graphique, et ils ont intégré la possibilité de redimensionner des formes comme des rectangles et des ovales en faisant glisser de petites poignées sur leurs bords.

Le code fonctionnait.

Mais c'était répétitif. Chaque forme (comme les rectangles ou les ovales) a un ensemble différent de poignée, et le fait de faire glisser chaque poignées dans différentes directions affectait la position et la taille de la forme et de manière différente. Si l'utilisateur maintenant la touche Shift, il fallait également préserver les proportions lors du redimensionnement. Il y avait beaucoup de math.

Le code ressemblait à quelque chose comme ça : 

```jsx
let Rectangle = {
  resizeTopLeft(position, size, preserveAspect, dx, dy) {
    // 10 lignes de code de math répétitives
  },
  resizeTopRight(position, size, preserveAspect, dx, dy) {
    // 10 lignes de code de math répétitives
  },
  resizeBottomLeft(position, size, preserveAspect, dx, dy) {
    // 10 lignes de code de math répétitives
  },
  resizeBottomRight(position, size, preserveAspect, dx, dy) {
    // 10 lignes de code de math répétitives
  },
};

let Oval = {
  resizeLeft(position, size, preserveAspect, dx, dy) {
    // 10 lignes de code de math répétitives
  },
  resizeRight(position, size, preserveAspect, dx, dy) {
    // 10 lignes de code de math répétitives
  },
  resizeTop(position, size, preserveAspect, dx, dy) {
    // 10 lignes de code de math répétitives
  },
  resizeBottom(position, size, preserveAspect, dx, dy) {
    // 10 lignes de code de math répétitives
  },
};

let Header = {
  resizeLeft(position, size, preserveAspect, dx, dy) {
    // 10 lignes de code de math répétitives
  },
  resizeRight(position, size, preserveAspect, dx, dy) {
    // 10 lignes de code de math répétitives
  },  
}

let TextBlock = {
  resizeTopLeft(position, size, preserveAspect, dx, dy) {
    // 10 lignes de code de math répétitives
  },
  resizeTopRight(position, size, preserveAspect, dx, dy) {
    // 10 lignes de code de math répétitives
  },
  resizeBottomLeft(position, size, preserveAspect, dx, dy) {
    // 10 lignes de code de math répétitives
  },
  resizeBottomRight(position, size, preserveAspect, dx, dy) {
    // 10 lignes de code de math répétitives
  },
};
```

Toute cette répétition de math m'ennuyait vraiment.

Ce n'était pas *clean*.

La plupart des répétitions étaient entre des directions similaires. Par exemple, `Oval.resizeLeft()` avait des similitudes avec `Header.resizeLeft()`. En effet, toutes deux traite du déplacement de la poignée côté gauche.

L'autre similitude était entre les méthodes pour la même forme. Par exemple, `Oval.resizeLeft()` avait des similitudes avec les autres méthodes `Oval`. Cela s'explique par le fait qu'elles traitent toutes des ovales. Il y avait aussi des doublons entre `Rectangle`, `Header` et `TextBlock` parce que les blocs de texte *sont* des rectangles.

J'ai eu une idée.

Nous pourrions *supprimer toutes les duplications* en regroupant le code comme ceci :

```jsx
let Directions = {
  top(...) {
    Seulement 5 lignes de code de math uniques
  },
  left(...) {
    Seulement 5 lignes de code de math uniques
  },
  bottom(...) {
    Seulement 5 lignes de code de math uniques
  },
  right(...) {
    Seulement 5 lignes de code de math uniques
  },
};

let Shapes = {
  Oval(...) {
    Seulement 5 lignes de code de math uniques
  },
  Rectangle(...) {
    Seulement 5 lignes de code de math uniques
  },
}
```

et ensuite, de composer leurs comportements :

```jsx
let {top, bottom, left, right} = Directions;

function createHandle(directions) {
  // 20 lignes de code
}

let fourCorners = [
  createHandle([top, left]),
  createHandle([top, right]),
  createHandle([bottom, left]),
  createHandle([bottom, right]),
];
let fourSides = [
  createHandle([top]),
  createHandle([left]),
  createHandle([right]),
  createHandle([bottom]),
];
let twoSides = [
  createHandle([left]),
  createHandle([right]),
];

function createBox(shape, handles) {
  // 20 lignes de code
}

let Rectangle = createBox(Shapes.Rectangle, fourCorners);
let Oval = createBox(Shapes.Oval, fourSides);
let Header = createBox(Shapes.Rectangle, twoSides);
let TextBox = createBox(Shapes.Rectangle, fourCorners);
```

Le code est deux fois moins volumineux, et la duplication de code à complètement disparu ! C'est tellement *propre*. Si nous voulons changer le comportement pour une direction ou une forme particulière, nous pouvons le faire en un seul endroit au lieu de mettre à jour des méthodes partout.

Il était déjà tard dans la nuit (Je me suis laissé emporté). J'ai mis mon code refactorisé dans le master et je suis parti me coucher, fier d'avoir démêlé le code désordonné de mon collègue.

## Le lendemain matin

... il ne s'est pas passé ce que j'aurais espéré.

Mon boss m'a invité pour une discussion en face-à-face où il m'a demandé de revenir en arrière et de supprimer mon code. J'étais horrifié. L'ancien code était un désordre et le mien était *propre* !

J'ai obtempéré à contrecœur, mais il m'a fallu des années pour comprendre qu'ils avaient raison.

## C'est un passage

L'obsession du "Clean code" et de la suppression des doublons est une phase que beaucoup d'entre nous traversent. Lorsque nous n'avons pas confiance en notre code, il est tentant d'attacher toute notre estime de nous et notre fierté professionnelle à quelque chose qui peut être mesuré. Un ensemble de règles strictes, de schéma de montages, de structure de fichiers, de manque de duplication.

Vous ne pouvez pas automatiser la suppression des doublons, mais cela devient plus facile avec la pratique. Vous pouvez généralement dire s'il y en a moins ou plus après chaque changement. Par conséquent, la suppression des doublons donne l'impression d'améliorer notre code d'une façon qui peut être objectivement mesuré. Pire encore, cela perturbe le sentiment d'identité des gens : *"Je suis le genre de personne qui écrit du code propre"*. C'est aussi puissant que n'importe quel type d'auto-illusion.

Une fois que nous avons appris à créer de [l'abstraction](https://www.sandimetz.com/blog/2016/1/20/the-wrong-abstraction), il peut être tentant d'aller loin dans cette habilité, et de tirer des abstraction à chaque fois que nous voyons du code répétitif. Après quelques années de code, nous voyons des répétitions *partout* -- l'abstraction est votre nouveau super pouvoir. Si quelqu'un vous dit que l'abstraction est une *vertue*, nous le mangeons. Et nous commençons à juger les personnes qui ne vouent pas un culte à la "propreté".

J'ai vu que ma "refactorisation" était un désastre de deux manières : 

* Premièrement, je n'ai pas parlé à la personne qui l'avait écrit. J'ai réécrit le code et l'ai poussé en ligne sans même son aval. Même si *c'était* une amélioration (ce que je ne crois plus), c'est une manière horrible de le faire. Une équipe d'ingénieur saine est constamment en train de *construire de la confiance*. Réécrire le code de vos collègues sans leur en parler est un coup dur pour votre capacité à collaborer efficacement sur une codebase ensemble.

* Deuxièmement, rien n'est gratuit. Mon code échangeait la possibilité  de modifier les exigences de notre code contre une réduction de la duplication, et ce n'est pas un bon échange. Par exemple, nous avons ensuite eu besoin de nombreux cas et comportement spéciaux pour différentes poignées sur différentes formes. Mon abstraction aurait dû devenir bien plus compliquée et alambiquée pour permettre de réaliser cela, alors qu'avec la version "désordonnée", de tels changement restaient simples comme bonjour.

Suis-je en train de dire que vous devriez écrire du code "sale" ? Non. Je vous suggère simplement de profondément réfléchir à ce que voulez dire quand vous parler de "clean" ou "sale". Ressentez-vous un sentiment de révolte ? De droiture ? De beauté ? D'élégance ? Êtes-vous sûr de pouvoir nommer à quoi correspondent ces qualités en terme d'ingénierie ? Comment affectent-ils exactement la façon dont le code est écrit et [modifié](/optimized-for-change/) ?

Je suis sûr que je n'ai pas pensé profondément à une seule de ces choses. J'ai uniquement pensé à l'apparence du code, mais pas à son évolution avec une équipe d'humains.

Le développement est un voyage. Pensez au chemin parcouru depuis votre première ligne de code jusqu'à là où vous êtes maintenant. Je pense que c'était une joie de voir pour la première fois comment l'extraction d'une fonction ou la re factorisation d'une classe peut rendre simple un code alambiqué. Si vous êtes fier de votre travail, il est tentant de rechercher la propreté dans le code. Faites-le pendant un certain temps.

Mais ne vous arrêtez pas là. Ne faites pas du zèle de clean code. Le clean code n'est pas un objectif. C'est une tentative de donner du sens à l'immense complexité des systèmes auxquels nous avons affaire. C'est un mécanisme de défense lorsque vous n'êtes pas encore sûr de l'impact d'un changement sur la codebase, mais que vous avez besoin d'être guidé en eau troubles.

Laissez le clean code vous guidez. **Puis laissez le s'en aller**.
