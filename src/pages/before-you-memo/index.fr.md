---
title: "Avant Que Vous N'utilisiez memo()"
date: '2021-02-23'
spoiler: "Les optimisations du rendu deviennent naturelles."
---

Il existe de nombreux articles qui traites de l'optimisations des performances avec React. En général, si certaines mises à jours d'états sont lentes, vous devez:

1. Vérifiez que vous êtes actuellement sur un build de production. (Les builds de développement sont intentionnellement plus lents, dans des cas extrêmes, même d'un ordre de grandeur.)
2. Vérifiez que vous n'avez pas mis votre état plus que nécessaire dans l'arborescence. (Par exemple, mettre l'état d'un input dans un store centralisé peut ne pas être une bonne idée.)
3. Lancez React DevTools Profiler pour voir ce qui est re-rendu, et emballer les sous-éléments les plus gourmands avec `memo()`. (Et ajoutez `useMemo()` là où c'est nécessaire.)

La dernière étape est ennuyante, spécialement pour les composants intermédiaires, et idéalement, un compilateur le ferait pour vous. Dans le futur, il le fera.

**Dans ce post, je veux partager avec vous deux différentes techniques** Elles sont surprenament basique, et c'est pourquoi les gens réalisent rarement qu'elles peuvent améliorer les performances de rendus.

**Ces techniques sont complémentaires avec ce que vous savez déjà.** Elles ne remplacent pas `memo` ou `useMemo`, mais il est souvent bien mieux de les essayer en premier.

## Un Componsant (Artificiellement) Lent

Voici un componsant qui présente un sévère problème de performance de rendu :

```jsx
import { useState } from 'react';

export default function App() {
  let [color, setColor] = useState('red');
  return (
    <div>
      <input value={color} onChange={(e) => setColor(e.target.value)} />
      <p style={{ color }}>Hello, world!</p>
      <ExpensiveTree />
    </div>
  );
}

function ExpensiveTree() {
  let now = performance.now();
  while (performance.now() - now < 100) {
    // Artificial delay -- do nothing for 100ms
  }
  return <p>I am a very slow component tree.</p>;
}
```

*([Essayez le ici](https://codesandbox.io/s/frosty-glade-m33km?file=/src/App.js:23-513))*

Le problème est qu'à chaque fois que `color` change à l'intérieur d'`App`, on refait un rendu d'`<ExpensiveTree/>` que vous avons articiellement retardé pour qu'il soit très lent.

Je pourrais [lui mettre `memo()` dessus](https://codesandbox.io/s/amazing-shtern-61tu4?file=/src/App.js) et l'appeler un jour, mais il y a tellement d'article qui traîte de ce sujet que je ne vais pas passer de temps là dessus. Je veux vous montrer deux solutions différentes.

## Solution 1 : Déplacer l'État Vers Le Bas

Si vous regardez le code de rendu de plus près, vous noterez que seule une partie de l'arborescence retourné se soucie réellement de la `color` actuelle :

```jsx{2,5-6}
export default function App() {
  let [color, setColor] = useState('red');
  return (
    <div>
      <input value={color} onChange={(e) => setColor(e.target.value)} />
      <p style={{ color }}>Hello, world!</p>
      <ExpensiveTree />
    </div>
  );
}
```

Donc, extrayons cette partie dans un composant `Form` et bouger l'état vers _le bas_ dedans :

```jsx{4,11,14,15}
export default function App() {
  return (
    <>
      <Form />
      <ExpensiveTree />
    </>
  );
}

function Form() {
  let [color, setColor] = useState('red');
  return (
    <>
      <input value={color} onChange={(e) => setColor(e.target.value)} />
      <p style={{ color }}>Hello, world!</p>
    </>
  );
}
```

*([Essayez le ici](https://codesandbox.io/s/billowing-wood-1tq2u?file=/src/App.js:64-380))*

## Solution 2 : Remonter le contenu

La solution ci-dessus ne fonctionne pas si l'état est utilisé quelque part *au-dessus* de l'arbre gourmand. Par exemple, disons que nous avons mis la `color` sur la `<div>` *parente* :

```jsx{2,4}
export default function App() {
  let [color, setColor] = useState('red');
  return (
    <div style={{ color }}>
      <input value={color} onChange={(e) => setColor(e.target.value)} />
      <p>Hello, world!</p>
      <ExpensiveTree />
    </div>
  );
}
```

*([Essayez le ici](https://codesandbox.io/s/bold-dust-0jbg7?file=/src/App.js:58-313))*

Maintenant, il semble que nous ne puissions pas juste "extraire" les parties qui n'utilisent pas `color` dans d'autres composants, puisque cela inclurait alors `<ExpensiveTree />`. Nous ne pouvos pas éviter le `memo` cette fois, n'est-ce pas ?

Ou peut-être que l'on peut ?

Jouez avec ce sandbox et voyez si vous pouvez trouver une solution.

...

...

...

La réponse est remarquablement claire :

```jsx{4,5,10,15}
export default function App() {
  return (
    <ColorPicker>
      <p>Hello, world!</p>
      <ExpensiveTree />
    </ColorPicker>
  );
}

function ColorPicker({ children }) {
  let [color, setColor] = useState("red");
  return (
    <div style={{ color }}>
      <input value={color} onChange={(e) => setColor(e.target.value)} />
      {children}
    </div>
  );
}
```

*([Essayez le ici](https://codesandbox.io/s/wonderful-banach-tyfr1?file=/src/App.js:58-423))*

Nous avons divisé `App` en deux composants. Les parties qui dépendent de `color`, ainsi que la variable d'état `color`, ont étés déplacés dans `ColorPicker`.

Les parties qui ne se soucient pas de `color`, sont restés à l'intérieur du composant `App` et sont passé à `ColorPicker` en tant que contenu JSX, également connu sous le nom de prop `children`.

Lorsque la couleur change, le composant `ColorPicker` se rend à nouveau. Mais il a toujours la même prop `children` qu'il a obtenu de l'`App` la dernière fois, donc React ne visite pas cette sous-arborescence.

Et par conséquent, `<ExpensiveTree />` ne se recharge pas à nouveau.

## Quelle est la morale ? 

Avant d'appliquer des optimisations comme `memo` ou `useMemo`, il peut être utile de regarder si vous pouvez séparer les parties qui sont à amener à changer des parties qui ne changeront pas.

Ce qui intéressant dans ces approches, c'est qu'**elles n'ont pas vraiment de rapport avec les performances en soi**. L'utilisation de la prop `children` pour diviser les composants rend généralement le flux de données de votre application plus facile à suivre et réduit le nombre de props à descendre dans l'arborescence. L'amélioration des performances dans des cas comme celui-ci est un bonus, la cerise sur le gâteau, pas l'objectif final.

Curieusement, ce modèle permet également de débloquer _d'autres_ bénéfices en termes de performances à l'avenir.

Par exemple, quand les [Server Components](https://reactjs.org/blog/2020/12/21/data-fetching-with-react-server-components.html) seront stables et prêts à être adopté, notre composant `ColorPicker` pourra recevoir ces `children` [de la part du serveur](https://youtu.be/TQQPAU21ZUw?t=1314). Soit l'ensemble du composant `<ExpensiveTree />`, soit ses parites pourraient s'exécuter sur le serveur, et même une mise à jour des états de React de haut niveau "sauterait" ces parties sur le client.

C'est quelque chose que même l'utilisation de `memo` ne pouvait pas faire ! Mais encore une fois, les deux approches sont complémentaires. Ne négligez pas de descendre l'état (et de remonter le contenu !).

Puis, là où ça ne suffit pas, utilisez le Profiler et saupoudrez ces mémos.

## Est-ce que j'ai déjà lu quelque chose à ce sujet ?

[Oui, probablement.](https://kentcdodds.com/blog/optimize-react-re-renders)

Il ne s'agit pas d'une idée neuve. C'est une conséquence naturelle du modèle de composition de React. Elle est assez simple pour être sous-estimée et mérite un peu plus d'amour.
