---
title: Warum verwenden wir super(props)?
date: '2018-11-30'
spoiler: Das Ende besitzt eine Wendung.
---


[Hooks](https://reactjs.org/docs/hooks-intro.html) sind scheinbar der letzte Schrei. Ironischerweise möchte ich diesen Blogeintrag damit beginnen ein par Fun-Facts zum Thema *class* components loszuwerden. Wie wäre es damit!

**Es ist absolut *nicht* notwendig diese Fakten zu kennen um effektiv mit React arbeiten zu können. Jedoch könnte es interessant werden, wenn man tiefer in die Materie einsteigen möchte.**

Fun-Fact Nummer Eins.

---

Ich habe `super(props)` bereits öfter schreiben dürfen, als es mir lieb ist:

```jsx{3}
class Checkbox extends React.Component {
  constructor(props) {
    super(props);
    this.state = { isOn: true };
  }
  // ...
}
```

Das [class fields proposal](https://github.com/tc39/proposal-class-fields) macht es natürlich einfach das Ganze zu überspringen:

```jsx
class Checkbox extends React.Component {
  state = { isOn: true };
  // ...
}
```

Eine ähnliche Syntax war bereits [geplant](https://reactjs.org/blog/2015/01/27/react-v0.13.0-beta-1.html#es7-property-initializers), als 2015, mit React 0.13, die Unterstützung von plain classes hinzugefügt wurde. Das Definieren vom separaten `Konstruktor` und der Aufruf von `super(props)` war schon immer als Übergangslösung gedacht. Diese sollte letztlich durch eine ergonomischere Lösung mithilfe von Klassenattributen abgelöst werden.

Schauen wir uns das Beispiel nochmal an, jedoch mit den ES2015-Funktionalitäten:

```jsx{3}
class Checkbox extends React.Component {
  constructor(props) {
    super(props);
    this.state = { isOn: true };
  }
  // ...
}
```
**Warum rufen wir `super` auf? Können wir nicht darauf *verzichten*? Wenn kein Weg daran vorbei führt, was passiert wenn wir die `props` nicht übergeben? Gibt es außerdem noch weitere Eingabeparameter?** Gehen wir der Sache näher auf den Grund.

---

In Javascript weist `super` immer auf den Konstruktor der Basisklasse. (In unserem Beispiel bezieht es sich auf die Implementation von `React.Component`.)

Es sei wichtig zu wissen, dass man `this` im Konstruktor erst *nach* dem Aufruf des eigentlichen Basiskonstruktors verwenden kann. Javascript erlaubt es nicht:

```jsx
class Checkbox extends React.Component {
  constructor(props) {
    // 🔴 Kann `this` noch nicht verwenden
    super(props);
    // ✅ Jetzt funktioniert es
    this.state = { isOn: true };
  }
  // ...
}
```

Es gibt einen guten Grund warum Javascript es verlangt den übergeordneten Konstruktor aufzurufen, bevor man `this` nutzen darf. Stellen wir uns folgende Klassenhierarchie vor:

```jsx
class Person {
  constructor(name) {
    this.name = name;
  }
}

class PolitePerson extends Person {
  constructor(name) {
    this.greetColleagues(); // 🔴 Dies ist verboten, unten steht warum
    super(name);
  }
  greetColleagues() {
    alert('Guten Morgen, Freunde!');
  }
}
```

Nehmen wir einmal an, es *wäre* erlaubt `this` vor `super` aufzurufen. Nach einem Monat ändern wir dann `greetColleagues`, sodass es den Namen der Person mit beinhaltet:

```jsx
  greetColleagues() {
    alert('Guten Morgen, Freunde!');
    alert('Mein Name ist ' + this.name + ', freut mich euch kennenzulernen!');
  }
```

An dieser Stelle vergessen wir jedoch, dass `this.greetColleagues()` vor `super()` aufgerufen wird. Das Attribut `this.name` konnte also noch gar nicht richtig gesetzt werden. Zum Zeitpunkt an dem wir den Wert in der Methode abrufen ist `this.name` noch nicht einmal definiert! Es ist wahrlich schwer sich mit solchem Code auseinanderzusetzen.

Um Fallen wie diesen aus dem Weg zu gehen **wird von Javascript verlangt, dass `super` *aufgerufen werden muss*, bevor man `this` im Konstruktor benutzen darf.** Lassen wir also die Superklasse ihr Ding machen! Diese Einschränkung trifft auch auf in Klassen definierte React-Komponenten zu:

```jsx
  constructor(props) {
    super(props);
    // ✅ Jetzt können wir `this` benutzen
    this.state = { isOn: true };
  }
```


Nun führt uns das alles jedoch zur nächsten Frage: Warum reichen wir die `props` weiter?

---

Es ist denkbar, dass das Hinunterreichen der `props` an `super` notwendig ist, damit `React.Component` seine `this.props` korrekt setzen kann:

```jsx
// Im Inneren von React
class Component {
  constructor(props) {
    this.props = props;
    // ...
  }
}
```

Und dies ist gar nicht so falsch, letztendlich ist es sogar [genau so](https://github.com/facebook/react/blob/1d25aa5787d4e19704c049c3cfa985d3b5190e0d/packages/react/src/ReactBaseClasses.js#L22).

Nun erscheint es jedoch eigenartig, dass, selbst wenn man `super()` ohne jeglich Argumente aufruft, man in Methoden wie `render` noch immer Zugriff auf `this.props` hat. (Wenn Du mir nicht traust, probiere es selber aus!)

Wie kann *das* funktionieren? Es stellt sich heraus, dass **React jeder Instanz ebenfalls `props` zuweist, gleich nach Aufruf *deines* Konstruktors:**

```jsx
  // Im Inneren von React
  const instance = new YourComponent(props);
  instance.props = props;
```

Somit sorgt React dafür, dass selbst wenn man vergisst die `props` an `super()` weiterzureichen, diese unmittelbar nach der Instanziierung automatisch gesetzt werden. Hierfür gibt es einen Grund.

Als in React die Unterstützung von Klassen hinzugefügt wurde, hat man dabei nicht nur ES6-Klassen berücksichtig. Das Ziel war es, ein möglichst weites Spektrum an Klassenabstraktionen abdecken zu können. Es war [nicht absehbar](https://reactjs.org/blog/2015/01/27/react-v0.13.0-beta-1.html#other-languages), wie erfolgreich Lösungen hinsichtlich React-Komponenten mit ClojureScript, CoffeeScript, ES6, Fable, Scala.js, TypeScript oder Anderen werden könnten. Aus diesem Grund blieb React absichtlich neutral gegenüber, ob ein Aufruf von `super()` erforderlich sei - auch wenn dies für ES6-Klassen nötig ist.

Heißt das also, dass man einfach `super()` anstelle von `super(props)` schreiben kann?

**Wahrscheinlich nicht, weil auch dies noch immer für Verwirrung sorgt.** Einerseits würde React *nach* dem Aufruf des eigenen Konstruktors `this.props` automatisch zuweisen, jedoch wären `this.props` dann *zwischen* dem Aufruf von `super` und dem Ende des Konstruktors nicht definiert:

```jsx{14}
// Im Inneren von React
class Component {
  constructor(props) {
    this.props = props;
    // ...
  }
}

// Im eigenen Code
class Button extends React.Component {
  constructor(props) {
    super(); // 😬 Wir haben vergessen props zu übergeben
    console.log(props);      // ✅ {}
    console.log(this.props); // 😬 nicht definiert
  }
  // ...
}
```

Dieses Verhalten kann noch verwirrender werden, wenn es in einzelnen Methoden vorkommt, welche *innerhalb* eines Konstruktors aufgerufen werden. **Ich empfehle daher, die `props` immer mit `super(props)` an die Basisklasse runterzureichen, selbst wenn dies nicht dringend notwendig ist:**

```jsx
class Button extends React.Component {
  constructor(props) {
    super(props); // ✅ Wir haben props übergeben
    console.log(props);      // ✅ {}
    console.log(this.props); // ✅ {}
  }
  // ...
}
```

Damit stellt man sicher, dass `this.props` schon vor Ende des Konstruktors gesetzt wurde.

-----

Es gibt noch eine weitere Sache, die erfahrene React-Nutzer neugierig machen könnte.

Es könnte aufgefallen sein, dass beim Nutzen der Context-API in Klassen (entweder mittels der alten `contextTypes` oder der modernen `contextType` API, hinzugefügt in React 16.6), `context` als zweites Argument an den Konstruktor übergeben wird.

Warum schreiben wir also nicht `super(props, context)`? Dies wäre ohne Weiteres möglich, jedoch wird context seltener benutzt und daher stößt also seltener auf diese Falle.

**Mit dem class fields proposal erübrigen sich mögliche Fallstricke allemal.** Ohne einen expliziten Konstruktor werden alle Argumente automatisch reingereicht. Dadurch kann ein Ausdruck wie `state = {}` bei Bedarf Verweise auf `this.props` oder `this.context` enthalten.

Mit Hooks braucht man nicht einmal mehr `super` oder `this`. Das ist allerdings ein Thema für einen anderen Tag.
