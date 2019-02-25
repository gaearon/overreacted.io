---
title: 'Corrigez comme si personne ne vous regardait'
date: '2019-02-15'
spoiler: L’autre genre de dette technique.
---

Parfois la dette technique nous saute aux yeux.

Une structure de données inappropriée peut entraîner du code mal fichu.  Quand les spécifications ne cessent de changer, le code peut finir par conserver des traces des approches précédentes.  Parfois le code est écrit à la va-vite, ou juste foireux.

Il est facile de discuter de ce type de dette technique, parce qu’elle est hautement visible.  Elle se manifeste par des bugs, des soucis de performances, et une difficulté croissante pour ajouter des fonctionnalités.

Il existe un autre type de dette technique, plus insidieux.

Peut-être que la suite de tests est *un poil* lente. Ce n’est pas qu’elle se traîne vraiment—mais juste assez pour qu’on ne prenne pas la peine d'examiner un bug tout de suite, et qu’on l’ajoute plutôt à la longue liste des choses à faire plus tard.  Peut-être que vous n’avez plus pleinement confiance dans votre script de déploiement, et du coup vous sautez une livraison supplémentaire.  Peut-être que de trop nombreuses couches d’abstraction empêchent de repérer la source d’une régression de performances, alors vous laissez juste un `TODO` dans le code.  Parfois les tests unitaires deviennent si rigides que vous reportez tout essai d’une nouvelle idée captivante jusqu’à ce que vous ayez livré les fonctionnalités prévues au planning.

Rien de tout ça n’est bloquant.  En fait, ça ressemble plus à des sources de distraction.  Rien que le fait de s’en plaindre semble vain.  Après tout, si c’était *vraiment* important, vous auriez déjà traité tout ça malgré la friction, pas vrai ?

Et du coup ces sujets ne sont jamais traités.  Ils ne semblent pas assez importants en eux-mêmes. **La friction les a tués.** Certaines de ces explorations auraient pu s’avérer inutiles. D’autres auraient pu transformer radicalement votre projet.

On ne sait jamais.  C’est pourquoi vous devez activement réduire la friction.  Comme si le destin de votre projet en dépendait.  Parce que c’est le cas.

Corrigez comme si personne ne vous regardait.
