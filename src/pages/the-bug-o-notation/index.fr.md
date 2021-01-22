---
title: La notation « Bug-O »
date: '2019-01-25'
spoiler: Quel est le 🐞(<i>n</i>) de votre API ?
---

Quand on écrit du code dont la performance est critique, il vaut mieux garder à l’esprit sa complexité algorithmique.  Elle est fréquemment exprimée à l’aide d’une [comparaison asymptotique](https://rob-bell.net/2009/06/a-beginners-guide-to-big-o-notation/), souvent appelée « notation Grand O » *(Big-O Notation, NdT)*.

La notation Big-O mesure **la façon dont le code ralentit lorsqu’on augmente le volume de données qu’il doit traiter.**  Par exemple, si un algorithme de tri a une complexité de O(<i>n<sup>2</sup></i>), trier 50 fois plus d’éléments prendra environ 50<sup>2</sup> = 2 500 fois plus de temps. Big-O ne nous donne pas un nombre exact, mais nous aide à comprendre comment un algorithme *monte en charge*.

Quelques exemples : O(<i>n</i>), O(<i>n</i> log <i>n</i>), O(<i>n<sup>2</sup></i>), O(<i>n!</i>).


Ceci dit, **cet article ne parle pas d’algorithmes ni de performance.**  Il parle d’APIs et de débogage.  Il s’avère que la conception d’API entraîne des considérations très similaires.

---

Une partie significative de notre temps est aspirée par la recherche et la correction de bugs dans notre code.  La plupart des développeurs aimeraient trouver les bugs plus vite.  Aussi satisfaisant que ça puisse être lorsqu’on l’a enfin débusqué, il est tout de même rageant de passer la journée entière à pourchasser un unique bug alors qu’on aurait pu à la place implémenter une fonctionnalité prévue.

L’expérience de débogage influence nos choix en termes d’abstractions, de bibliothèques et d’outils.  Certaines conceptions d’APIs et de langages rendent impossible des catégories entières d’erreurs.  D’autres recèlent un potentiel infini de problèmes.  **Mais comment savoir lesquelles sont lesquelles ?**

De nombreuses discussions en ligne sur les APIs se focalisent sur leur esthétique.  Mais ça [ne nous dit pas grand chose](/optimized-for-change/) sur le ressenti d’utilisation réelle d’une API donnée.

**J’ai une métrique qui m’aide à réfléchir à ça.  Je l’appelle la notation *Bug-O* :**

<font size="40">🐞(<i>n</i>)</font>

La notation Big-O décrit le ralentissement d’un algorithme proportionnellement à la taille de ses entrées.  La *Bug-O* décrit le ralentissement de *votre expérience développeur* avec une API donnée proportionnellement à la taille de votre base de code.

---

Par exemple, observez le code ci-dessous qui met manuellement à jour le DOM au fil du temps avec des opérations impératives telles que `node.appendChild()` et `node.removeChild()`, et n’a pas de structure claire :

```jsx
function trySubmit() {
  // Section 1
  let spinner = createSpinner();
  formStatus.appendChild(spinner);
  submitForm().then(() => {
  	// Section 2
    formStatus.removeChild(spinner);
    let successMessage = createSuccessMessage();
    formStatus.appendChild(successMessage);
  }).catch(error => {
  	// Section 3
    formStatus.removeChild(spinner);
    let errorMessage = createErrorMessage(error);
    let retryButton = createRetryButton();
    formStatus.appendChild(errorMessage);
    formStatus.appendChild(retryButton)
    retryButton.addEventListener('click', function() {
      // Section 4
      formStatus.removeChild(errorMessage);
      formStatus.removeChild(retryButton);
      trySubmit();
    });
  })
}
```

Le problème avec ce code, ce n’est pas qu’il est « moche ».  On ne parle pas ici d’esthétique.  **Le problème c’est que s’il y a un bug dans ce code, je ne sais même pas par où commencer.**

**Selon l’ordre de déclenchement des fonctions de rappel et des événements, il y a une explosion combinatoire du nombre de chemins que ce programme peut emprunter.**  Pour certains, vous verrez les bons messages.  Pour d’autres, vous verrez plusieurs spinners, messages d’échec et d’erreurs en même temps, voire ça plantera carrément.

Cette fonction a 4 sections différentes et aucune garantie sur leur ordonnancement.  Mes calculs hautement non-scientifiques me disent qu’on obtient 4×3×2×1 = 24 ordres différents d’exécution possible.  Si j’ajoute encore quatre segments supplémentaires, ce sera 8×7×6×5×4×3×2×1 — *quarante mille* combinaisons.  Bon courage pour déboguer ça.

**En d’autres termes, la Bug-O de cette approche est 🐞(<i>n!</i>)** où *n* est le nombre de segments de code qui touchent au DOM. Ouais, c’est une *factorielle*.  Bien sûr, je ne suis pas très scientifique, sur ce coup.  Toutes les transitions ne sont pas possibles en pratique.  Mais d’un autre côté, chacun de ces segments peut tourner plus d’une fois. <span style="word-break: keep-all">🐞(*¯\\\_(ツ)\_/¯*)</span> serait peut-être une description plus exacte, mais ça craint quand même.  On peut mieux faire.

---

Pour améliorer la Bug-O de ce code, on peut limiter le nombre d’états et de résultats possibles.  Pas besoin d’une bibliothèque pour ça : c’est juste une question de meilleure structuration de notre code.  Voici une manière possible d’y arriver :

```jsx
let currentState = {
  step: 'initial', // 'initial' | 'pending' | 'success' | 'error'
};

function trySubmit() {
  if (currentState.step === 'pending') {
    // On empêche le double envoi
    return;
  }
  setState({ step: 'pending' });
  submitForm().then(() => {
    setState({ step: 'success' });
  }).catch(error => {
    setState({ step: 'error', error });
  });
}

function setState(nextState) {
  // On efface d’abord tous les nœuds fils existants
  formStatus.innerHTML = '';

  currentState = nextState;
  switch (nextState.step) {
    case 'initial':
      break;
    case 'pending':
      formStatus.appendChild(spinner);
      break;
    case 'success':
      let successMessage = createSuccessMessage();
      formStatus.appendChild(successMessage);
      break;
    case 'error':
      let errorMessage = createErrorMessage(nextState.error);
      let retryButton = createRetryButton();
      formStatus.appendChild(errorMessage);
      formStatus.appendChild(retryButton);
      retryButton.addEventListener('click', trySubmit);
      break;
  }
}
```

Ce code n’a pas l’air très différent.  Il est même un poil plus verbeux.  Mais il est *dramatiquement* plus simple à déboguer, principalement grâce à cette ligne :

```jsx{3}
function setState(nextState) {
  // On efface d’abord tous les nœuds fils existants
  formStatus.innerHTML = '';

  // ... code qui ajoute des trucs à formStatus ...
```

En effaçant l’état du formulaire avant de faire quoi que ce soit d’autre, on s’assure que les opérations sur le DOM partiront toujours de zéro.  C’est ainsi qu’on combat l’inévitable [entropie](/the-elements-of-ui-engineering/)—en *ne laissant pas* les erreurs s’accumuler. C’est l’équivalent code du « éteins-le puis rallume-le », et ça marche incroyablement bien.

**S’il y a un bug dans l’affichage, on a juste besoin de réfléchir *une* étape en amont—d’examiner l’appel à `setState` précédent.**  La Bug-O du débogage d’un résultat de rendu devient 🐞(*n*), où *n* est le nombre de chemins de rendu dans le code.  Ici, c’est juste quatre (parce qu’on a quatre cas dans le `switch`).

On a toujours un petit risque de soucis de concurrence dans la *définition* de l’état, mais déboguer ce type de problèmes est plus facile parce que chaque état intermédiaire peut être logué et examiné.  On peut interdire les transitions indésirables explicitement :

```jsx
function trySubmit() {
  if (currentState.step === 'pending') {
    // On empêche le double envoi
    return;
  }
```

Bien sûr, réinitialiser le DOM à chaque fois n’est pas sans inconvénient.  Le retrait puis la re-création naïfs du DOM à chaque appel effaceraient l’état interne, perdraient le focus, et tueraient la performance sur des applications de grande taille.

C’est pourquoi des bibliothèques comme React peuvent être utiles.  Elles vous permettent de *réfléchir* en conservant le paradigme de la re-création de l'UI à partir de zéro, sans forcément tout effacer sous le capot :

```jsx
function FormStatus() {
  let [state, setState] = useState({
    step: 'initial'
  });

  function handleSubmit(e) {
    e.preventDefault();
    if (state.step === 'pending') {
      // On empêche le double envoi
      return;
    }
    setState({ step: 'pending' });
    submitForm().then(() => {
      setState({ step: 'success' });
    }).catch(error => {
      setState({ step: 'error', error });
    });
  }

  let content;
  switch (state.step) {
    case 'pending':
      content = <Spinner />;
      break;
    case 'success':
      content = <SuccessMessage />;
      break;
    case 'error':
      content = (
        <>
          <ErrorMessage error={state.error} />
          <RetryButton onClick={handleSubmit} />
        </>
      );
      break;
  }

  return (
    <form onSubmit={handleSubmit}>
      {content}
    </form>
  );
}
```

Le code peut sembler différent, mais le principe est le même.  L’abstraction du composant garantit une frontière qui nous donne la certitude qu’aucun *autre* code sur la page ne pourra venir pourrir ce fragment DOM ou notre état.  L’isolation des composants aide à réduire la Bug-O.

En fait, si *n’importe quelle* valeur semble erronée dans le DOM d’une appli React, vous pouvez retracer sa source simplement en regardant le code des composants au-dessus d’elle dans l’arborescence React, un par un.  Quelle que soit la taille de l’appli, retracer l’origine d’une valeur rendue est 🐞(*profondeur de l’arbre*).

**La prochaine fois que vous lisez une discussion sur une API, posez-vous la question : quelle est la 🐞(*n*) des tâches courantes de débogage avec elle ?** Et qu’en est-il des APIs et principes que vous utilisez couramment ? Redux, CSS, l’héritage—ils ont tous leur propre Bug-O.

---
