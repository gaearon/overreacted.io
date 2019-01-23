---
title: Perché scriviamo super(props)?
date: '2018-11-30'
spoiler: C'è un twist alla fine.
---


Ho sentito che gli [Hooks](https://reactjs.org/docs/hooks-intro.html) sono il nuovo trend. Ironicamente, voglio iniziare questo blog dallo spiegare alcuni fatti divertenti dei componenti scritti con le *classi*. Che ve ne pare?

**Questi trucchi *non* sono importanti per usare React produttivamente. Però potreste trovarli interessanti se vi piace scoprire come funzionano le cose.**

Ecco il primo.

---

Ho scritto `super(props)` più volte nella mia vita di quante me ne piacerebbe sapere:

```jsx{3}
class Checkbox extends React.Component {
  constructor(props) {
    super(props);
    this.state = { isOn: true };
  }
  // ...
}
```

Ovviamente, la proposta per i [class fields](https://github.com/tc39/proposal-class-fields) ci permette di saltare la cerimonia:

```jsx
class Checkbox extends React.Component {
  state = { isOn: true };
  // ...
}
```

Una sintassi così è stata [pianificata](https://reactjs.org/blog/2015/01/27/react-v0.13.0-beta-1.html#es7-property-initializers) quando React 0.13 ha introdotto il supporto per le classi nel 2015. Definire il `constructor` e chiamare `super(props)` sono sempre state azioni pensate per essere una soluzione temporanea fin quando i `class fields` avrebbero fornito una soluzione più ergonomica.

Torniamo all'esempio che usa le classi ES2015:

```jsx{3}
class Checkbox extends React.Component {
  constructor(props) {
    super(props);
    this.state = { isOn: true };
  }
  // ...
}
```

**Perché dobbiamo chiamare `super`? Possiamo *non* chiamarlo? Se lo dobbiamo chiamare, che cosa succede se non passiamo `props`? Ci sono altri argomenti?** Scopriamolo.

---

In JavaScript, `super` si riferisce al costruttore della classe genitore. (Nel nostro esempio, punta all'implementazione della classe `React.Component`.)

Da notare, non potete usare `this` in un costruttore se non *dopo* aver chiamato il costruttore genitore. JavaScript non ve lo permette:

```jsx
class Checkbox extends React.Component {
  constructor(props) {
    // 🔴 Non si può ancora usare `this`
    super(props);
    // ✅ Ora si però
    this.state = { isOn: true };
  }
  // ...
}
```

C'è una buona ragione per la quale JavaScript forza il costruttore genitore a essere eseguito prima di toccare `this`. Considerate questa gerarchia di classi:

```jsx
class Person {
  constructor(name) {
    this.name = name;
  }
}

class PolitePerson extends Person {
  constructor(name) {
    this.greetColleagues(); // 🔴 Non è permesso, leggete sotto il perché
    super(name);
  }
  greetColleagues() {
    alert('Buongiorno gente!');
  }
}
```

Immaginate che l'uso di `this` prima che sia chiamato `super` *sia* permesso. Un mese dopo, potremmo cambiare `greetColleagues` per includere il nome della persona nel messaggio:

```jsx
  greetColleagues() {
    alert('Buongiorno gente!');
    alert('Il mio nome è ' + this.name + ', piacere di conoscerti!');
  }
```

Però abbiamo dimenticato che `this.greetColleagues()` è chiamato prima che la chiamata di `super()` abbia avuto la possibilità di impostare `this.name`. Quindi `this.name` non è nemmeno definito! Come possiamo vedere, codice come questo è difficile da comprendere.

Per evitare queste insidie, **JavaScript vi forza a chiamare `super` prima di utilizzare `this` in un costruttore.** Lasciate che il genitore faccia quello che deve fare! Questa limitazione si applica anche ai componenti di React definiti con le classi:

```jsx
  constructor(props) {
    super(props);
    // ✅ Adesso si può usare `this`
    this.state = { isOn: true };
  }
```

Questo ci lascia un'altra domanda: perché passare `props`?

---

Potremmo pensare che passare `props` a `super` sia necessario per fare in modo che il costruttore di `React.Component` inizializzi `this.props`:

```jsx
// Dentro React
class Component {
  constructor(props) {
    this.props = props;
    // ...
  }
}
```

In effetti non è molto lontano dalla realtà — infatti è [quello che fa](https://github.com/facebook/react/blob/1d25aa5787d4e19704c049c3cfa985d3b5190e0d/packages/react/src/ReactBaseClasses.js#L22).

Ma per qualche ragione, anche se chiamassimo `super()` senza l'argomento `props`, saremmo ancora in grado di accedere a `this.props` dentro `render` e altri metodi. (Se non mi credete, provate voistessi!)

Come funziona *questa* cosa? Viene fuori che **React assegna `props` all'istanza subito dopo aver chiamato il *vostro* costruttore:**

```jsx
  // Dentro React
  const instance = new YourComponent(props);
  instance.props = props;
```

Quindi anche se vi dimenticate di passare `props` a `super()`, React lo avrebbe comunque impostato subito dopo. C'è una ragione per questo.

Quando React ha aggiunto il supporto alle classi, non ha aggiunto il supporto solo per le classi ES6. L'obiettivo era di supportare la più vasta gamma di astrazioni di classe possibile. [Non era chiaro](https://reactjs.org/blog/2015/01/27/react-v0.13.0-beta-1.html#other-languages) quanto di successo sarebbero stati linguaggi come ClojureScript, CoffeeScript, ES6, Fable, Scala.js, TypeScript, o altre soluzioni per definire i componenti. Quindi React era intenzionalmente senza opinioni riguardo a se chiamare `super()` fosse richiesto o meno — anche se nelle classi ES6 lo è.

Quindi questo vuol dire che possiamo scrivere `super()` invece di `super(props)`?

**Pobabilmente no poiché non è ancora molto chiaro.** Certo, React avrebbe comunque assegnato `this.props` *dopo* aver eseguito il vostro costruttore. Ma `this.props` sarebbe ancora indefinito *tra* la chiamata a `super` e la fine del costruttore:

```jsx{14}
// Dentro React
class Component {
  constructor(props) {
    this.props = props;
    // ...
  }
}

// Nel vostro codice
class Button extends React.Component {
  constructor(props) {
    super(); // 😬 Abbiamo dimenticato di passare props
    console.log(props);      // ✅ {}
    console.log(this.props); // 😬 undefined 
  }
  // ...
}
```

Il debug può essere ancora più impegnativo se questo succede in qualche metodo che viene richiamato *dal* costruttore. **Ed è per questo che raccomando di chiamare sempre `super(props)`, anche se non è strettamente necessario:**

```jsx
class Button extends React.Component {
  constructor(props) {
    super(props); // ✅ Abbiamo passato props
    console.log(props);      // ✅ {}
    console.log(this.props); // ✅ {}
  }
  // ...
}
```

Questo assicura che `this.props` sia impostato anche prima che il costruttore esca.

-----

C'è un'altra cosa di cui gli utenti che usano React da tanto tempo potrebbero essere curiosi di sapere.

Potreste aver notato che quando usiamo le Context API nelle classi (con il vecchio `contextTypes` o con la nuova API `contextType` introdotta in React 16.6), `context` è passato come secondo argomento al costruttore.

Quindi perché non scriviamo `super(props, context)`? Potremmo, ma il context è usato meno spesso delle props, quindi questo problema viene fuori di rado.

**Con la proposta dei class fields queste problematiche per lo più non si presentano.** Senza una chiamata esplicita al costruttore, tutti gli argomenti sono comunque passati automaticamente. È per questo che espressioni come `state = {}` permettono l'inclusione di referenze `this.props` o `this.context` se necessario.

Con gli Hooks, non abbiamo nemmeno `super` o `this`. Ma questo è un argomento per un'altra volta.
