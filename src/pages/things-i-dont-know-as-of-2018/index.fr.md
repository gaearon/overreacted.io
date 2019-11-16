---
title: Les choses que je ne sais pas encore en 2018
date: '2018-12-28'
spoiler: Nous pouvons admettre nos lacunes en connaissances sans pour autant dévaluer notre expertise.
---

Les gens pensent souvent que j'en sais beaucoup plus que ce que je sais vraiment. Ce n'est pas un mauvais problème à avoir et je ne m'en plains pas. (Les personnes issues de minorités sont souvent victimes du biais opposé malgré leurs qualifications durement acquises, et c'est *nul*.)

**Dans cet article, je vous propose une liste incomplète de sujets relatifs à la programmation qu'on a tendance à supposer à tort que je connais.** Je ne dis pas que *vous* n'avez pas à les apprendre — ou que je ne connais pas d'*autres* choses utiles. Mais puisque je ne suis pas dans une position vulnérable en ce moment, je peux être honnête à ce sujet.

Je vais vous expliquer pourquoi je pense que c’est important.

---

Premièrement, on attend souvent des ingénieurs chevronnés, de façon complètement irréaliste, qu'ils connaissent toutes les technologies de leur domaine. Avez-vous déjà vu une « liste de choses à apprendre » qui comprenne des centaines de bibliothèques et d’outils? C'est utile — mais intimidant.

Qui plus est, quel que soit votre niveau d'expérience, vous n’êtes jamais à l’abri d’osciller entre des sentiments de compétence, d’inadaptation (« syndrôme de l'imposteur »), et de confiance excessive (« effet Dunning-Kruger »). Tout cela dépend de votre environnement, votre travail, votre personnalité, vos coéquipiers, votre état mental, le moment de la journée, et j'en passe.

Les développeurs expérimentés partagent parfois leurs insécurités afin d'encourager les débutants. Mais il existe une énorme différence entre un chirurgien chevronné qui a parfois encore la frousse et un étudiant qui tient son premier scalpel !

Entendre que "nous sommes tous des développeurs juniors" peut être décourageant et sonner comme des paroles creuses aux oreilles d'apprentis qui font face à un véritable manque de connaissances. Les confessions encourageantes de développeurs bien intentionnés comme moi ne suffisent pas.

Cela dit, même les ingénieurs expérimentés ont encore à apprendre. Cet article parle de mes propres lacunes, et j'encourage quiconque peut se permettre la même vulnérabilité à partager les leurs. Mais ne dévaluons pas notre expérience dans le processus.

**Nous pouvons admettre nos lacunes de connaissances, nous sentir ou non comme des imposteurs, et avoir tout de même une expertise extrêmement précieuse qui prend des années de travail acharné à développer.**

---

Cette mise en garde posée, voici une petite partie des choses que je ne sais pas :

* **Commandes Unix et Bash.** Je peux faire `ls` et `cd` mais je dois chercher pour tout le reste. Je comprends le concept de *piping* mais je ne l'ai utilisé que dans des cas simples. Je ne sais pas comment utiliser `xargs` pour créer des chaînes complexes, ou comment composer et rediriger différents flux de sortie. Je n'ai aussi jamais vraiment bien appris Bash, alors je ne peux écrire que des scripts très simples (et probablement défectueux).

* **Les langages de bas niveau.** Je comprends que le langage d’assemblage nous laisse stocker des choses en mémoire et sauter d'un endroit à l'autre dans le code, mais c'est à peu près tout. J'ai écrit quelques lignes de C et je comprends ce qu'est un pointeur, mais je ne sais pas comment utiliser `malloc` ou d'autres techniques de gestion manuelle de la mémoire. Je n’ai jamais joué avec Rust.

* **La pile de protocoles.** Je sais que les ordinateurs ont des adresses IP, et qu’on utilise DNS pour gérer les noms d'hôtes. Je sais qu'il y a des protocoles de bas niveau comme TCP/IP pour échanger des paquets et qui en assurent (peut-être ?) l'intégrité. C'est tout—je ne suis pas certain des détails.

* **Les conteneurs.** Je n'ai aucune idée de comment utiliser Docker ou Kubernetes. (Il y a un rapport ?) J'ai la vague idée qu'ils me laissent lancer une machine virtuelle distincte de façon prévisible. Ça a l'air cool mais je n'ai jamais essayé.

* **Le serverless.** Ça a l'air cool aussi. Jamais essayé. Je ne vois pas clairement comment ce modèle change la programmation back-end (ou même si ça la change).

* **Les microservices.** Si je comprends bien, cela veut simplement dire « plusieurs APIs dont les points d’accès communiquent entre eux ». Je ne sais pas quels sont les avantages pratiques ou les inconvénients de cette approche parce que je ne l'ai jamais utilisée.

* **Python.** Je me sens coupable sur ce coup — j'ai *travaillé* avec Python pendant plusieurs années, mais je n'ai jamais pris le temps de réellement l'apprendre. Il y a plusieurs choses, telles que le comportement des imports, qui sont totalement opaques à mes yeux.

* **Les backends basés sur Node.** Je comprends comment faire tourner Node, j'ai utilisé quelques APIs comme `fs` pour des outils de build, et je peux configurer Express. Mais je n'ai jamais utilisé une base de données dans du code Node et je ne sais pas vraiment comment écrire un backend en Node. Je n’ai par ailleurs aucune expérience avec les frameworks React comme Next au-delà d'un simple ”hello world”.

* **Les plateformes natives.** J'ai essayé d'apprendre l'Objective C à un moment donné, mais sans succès. Je n'ai pas appris Swift non plus. Même chose pour Java. (Je pourrais probablement me débrouiller avec en revanche, vu que j'ai beaucoup fait de C#.)

* **Les algorithmes.** Le plus loin que je puisse aller est un tri à bulles et peut-être un *quicksort* sur un bon jour. Je peux probablement me débrouiller sur des traversées de graphes simples, si elles sont liées à un problème concret. Je comprends la notation O(n), mais ma compréhension ne va pas beaucoup plus loin que « ne mets pas de boucles à l'intérieur de boucles ».

* **Les langages fonctionnels.** À moins que vous ne comptiez JavaScript, je ne m'y connais en aucun language traditionnellement fonctionnel. (Je ne suis à l’aise qu'en C# et JavaScript — et j'ai déjà oublié l’essentiel de mon C#). J'ai du mal à lire du code inspiré de LISP (comme Clojure), Haskell (comme Elm) ou ML (comme OCaml).

* **La terminologie fonctionnelle.** Je m’arrête à *map* et *reduce*. Je ne connais pas les monoïdes, foncteurs, etc. Je sais ce qu'est une monade, mais peut-être qu’en fait non.

* **Le CSS moderne.** Je ne connais ni Flexbox, ni Grid. Les *floats*, c'est mon truc.

* **Les méthodologies CSS.** J'ai utilisé BEM (c'est-à-dire la partie CSS, et non pas le BEM original), mais c'est tout ce que je connais. Je n'ai pas essayé OOCSS ou d'autres méthodologies.

* **SCSS/Sass.** Je n'ai jamais eu l'opportunité de les apprendre.

* **CORS.** Ces erreurs me font peur ! Je sais que je dois configurer des en-têtes pour les régler mais j'ai gaspillé des heures là-dessus par le passé.

* **HTTPS/SSL.** Je ne l'ai jamais configuré. Je ne sais pas comment ça fonctionne, sauf pour le concept de clés privées et publiques.

* **GraphQL.** Je peux lire une requête mais je ne sais pas vraiment comment exprimer des trucs avec des nœuds ou des *edges*, quand utiliser des fragments, et comment la pagination fonctionne.

* **Les sockets.** À mes yeux, elles permettent aux ordinateurs de communiquer sans s’en tenir au modèle requête/réponse, mais c'est à peu près tout.

* **Les flux.** Mis à part les Observables Rx, je n'ai jamais travaillé de près avec les flux. J'ai utilisé de vieux flux Node à une ou deux reprises, mais j'ai toujours foiré la gestion d'erreur.

* **Electron.** Jamais essayé.

* **TypeScript.** Je comprends le concept de types et je peux lire les annotations, mais je n'en ai jamais écrit. Les quelques fois où j'ai essayé, je me suis pris des murs.

* **Les déploiements et devops.** Je peux envoyer des fichiers via FTP ou tuer des processus, mais c'est la limite de mes compétences en devops.

* **Les graphiques.** Qu'il s'agisse de canvas, SVG, WebGL ou de graphiques de bas niveau, je n'y connais quasi rien. Je saisis l'idée générale mais il me faudrait apprendre les bases.

Bien entendu, cette liste n'est pas exhaustive. Il y a beaucoup de choses que je ne sais pas.

---

Cet article peut paraître curieux. Je ne me sens pas à l’aise en l’écrivant. Suis-je en train de me vanter de mon ignorance ? Ce que j'espère que vous retiendrez de cet article, c‘est que :

* **Même vos développeurs favoris n'en savent probablement pas autant que vous le croyez.**

* **Peu importe votre niveau de connaissances, votre confiance en vous peut fortement varier.**

* **Les développeurs expérimentés détiennent une expertise précieuse malgré leurs lacunes de connaissances.**

Je suis conscient de mes propres lacunes (en tout cas, quelques-unes d'entre elles). Je peux les combler plus tard quand j’en deviendrai curieux ou si j’en ai besoin sur un projet.

Cela n'enlève rien à mes connaissances ni à mon expérience. Il y a plein de choses que je sais bien faire. Par exemple, apprendre de nouvelles technologies quand j’en ai besoin.

>Mise à jour: J'ai aussi [écrit](/the-elements-of-ui-engineering/) à propos de quelques trucs que je connais.
