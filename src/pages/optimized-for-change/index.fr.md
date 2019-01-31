---
title: Optimisées pour le changement
date: '2018-12-12'
spoiler: Qu'est-ce qui caractérise une bonne API ?
---

Qu'est-ce qui caractérise une bonne API ?

Une API *bien* conçue est mémorisable et sans ambiguïté. Elle encourage un code lisible, correct et performant, tout en aidant les développeurs à tomber dans [le gouffre du succès](https://blog.codinghorror.com/falling-into-the-pit-of-success/).

Je qualifie ces aspects de la conception de « premier ordre » car ils représentent les premières choses sur lesquelles le développeur de bibliothèque doit se concentrer. Il est possible que vous ayez à réaliser quelques compromis, mais ces aspects seront toujours présents dans votre esprit.

Cependant, à moins que vous n'envoyiez un rover sur Mars, votre code changera sûrement avec le temps. Il en est de même pour le code qui utilise votre API.

Les meilleurs concepteurs d'API que je connaisse ne s'arrêtent pas à ces aspects de « premier ordre » comme la lisibilité. Ils fournissent autant d'efforts, si ce n'est plus, à la réalisation de ce que j'appelle la conception de « second ordre » : **comment le code utilisant votre API évoluera avec le temps.**

Le plus petit changement dans les spécifications peut rendre le plus élégant des codes inutilisable.

Les *bonnes* APIs anticipent cela. Elles anticipent votre besoin de déplacer du code. Copier-coller certaines parties. Les renommer. Unifier les cas spécifiques en un utilitaire générique et réutilisable. Redécliner vos abstractions en cas spécifiques. Ajouter un hack. Optimiser un goulot d'étranglement. Se débarrasser d’une partie pour la réécrire de zéro. Faire une erreur. Naviguer entre les causes et les effets. Corriger un bug. Revoir ce correctif.

Les bonnes APIs ne se contentent pas de vous permettre de tomber dans le « gouffre du succès », elles vous aident à y *rester*.

Elles sont optimisées pour le changement.
