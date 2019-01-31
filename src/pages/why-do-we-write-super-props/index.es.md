---
title: ¿Por qué escribimos super(props)?
date: '2018-11-30'
spoiler: Hay un giro inesperado al final.
---

He escuchado que los [Hooks](https://reactjs.org/docs/hooks-intro.html) son la nueva sensación. Irónicamente, quiero empezar este blog describiendo hechos interesantes sobre componentes de *clase*. ¡¿Qué les parece?!

**Estos trucos *no* son importantes para usar React de manera productiva; pero puedes hallarlos entretenidos si quieres profundizar en cómo funcionan las cosas.**

Aquí está el primero.

---

He escrito `super(props)` más veces en mi vida de las que quisiera saber:

```jsx{3}
class Checkbox extends React.Component {
  constructor(props) {
    super(props);
    this.state = { isOn: true };
  }
  // ...
}
```

Por supuesto, la [propuesta de atributos de clase](https://github.com/tc39/proposal-class-fields) nos permite obviar la ceremonia:

```jsx
class Checkbox extends React.Component {
  state = { isOn: true };
  // ...
}
```

Una sintaxis como esta se [planeó](https://reactjs.org/blog/2015/01/27/react-v0.13.0-beta-1.html#es7-property-initializers) cuando React 0.13 añadió soporte para clases simples en 2015. Definir el `constructor` e invocar `super(props)` siempre se pensó como una solución temporal hasta que los atributos de clases proveyeran una alternativa ergonómica.

Pero volvamos a este ejemplo usando solo características de ES2015:

```jsx{3}
class Checkbox extends React.Component {
  constructor(props) {
    super(props);
    this.state = { isOn: true };
  }
  // ...
}
```

**¿Por qué invocamos `super`? ¿Podemos *no* invocarlo? Si lo tenemos que invocar, ¿qué pasa si no pasamos `props`? ¿Habrá otros argumentos?** Averigüémoslo.

---

En JavaScript, `super` hace referencia al constructor de la clase base (en nuestro ejemplo, apunta a la implementación de `React.Component`).

Algo importante, no puedes usar `this` en un constructor hasta *después* que se haya llamado al constructor base. Javascript no te lo permitirá:

```jsx
class Checkbox extends React.Component {
  constructor(props) {
    // 🔴 Aún no se puede usar `this`
    super(props);
    // ✅ Sin embargo ahora no hay problemas
    this.state = { isOn: true };
  }
  // ...
}
```

Hay una buena razón por la que Javascript obliga a que el constructor base se ejecute antes de que toques `this`. Considera una jerarquía de clases:

```jsx
class Persona {
  constructor(nombre) {
    this.nombre = nombre;
  }
}

class PersonaEducada extends Persona {
  constructor(nombre) {
    this.saludarColegas(); // 🔴 Esto no está permitido, lee debajo por qué
    super(nombre);
  }
  saludarColegas() {
    alert('¡Buenos días amigos!');
  }
}
```

Imagina que se *permitiera* usar `this` antes de invocar `super`. Un mes después, podríamos querer cambiar `saludarColegas` para incluir el nombre de la persona en el mensaje:

```jsx
  saludarColegas() {
    alert('¡Buenos días amigos!');
    alert('Mi nombre es ' + this.nombre + '. ¡Encantado de conocerlos!');
  }
```

Pero olvidamos que `this.saludarColegas()` se invoca antes de que la llamada a `super()` tuviese oportunidad de inicializar `this.nombre`. ¡Así que `this.nombre` no está aún ni siquiera definido! Como puedes ver, puede ser difícil analizar un código como este.

Para evitar tales trampas **JavaScript obliga que si quieres usar `this` en un constructor, *tienes que* invocar `super` primero.** ¡Deja que la base haga su trabajo! Y esta limitación también se aplica a los componentes de React definidos como clases:

```jsx
  constructor(props) {
    super(props);
    // ✅ Está bien usar `this` ahora
    this.state = { isOn: true };
  }
```

Esto nos deja con otra pregunta: ¿por qué pasar `props`?

---

Podrías pensar que pasar `props` hacia `super` es necesario de manera que el constructor base de `React.Component` pueda inicializar `this.props`:

```jsx
// Dentro de React
class Component {
  constructor(props) {
    this.props = props;
    // ...
  }
}
```

Y ello no está lejos de la verdad — de hecho, eso es [lo que hace](https://github.com/facebook/react/blob/1d25aa5787d4e19704c049c3cfa985d3b5190e0d/packages/react/src/ReactBaseClasses.js#L22).

Pero de alguna manera, si invocas `super()` sin el argumento `props`, aún serás capaz de acceder a `this.props` en `render` y otros métodos. (Si no me crees, ¡inténtalo tú mismo!)

¿Como funciona *eso* ? Resulta que **React también asigna `props` a la instancia justo después de invocar a *tu* constructor:**

```jsx
  // Dentro de React
  const instancia = new TuComponente(props);
  instancia.props = props;
```

Así que aún si olvidas pasarle `props` a `super()`, React aún lo pondría justo después. Hay una razón para ello.

Cuando React añadió soporte para clases, no añadió soporte solo para clases ES6. El objetivo era soportar el mayor rango de abstracciones de clase como fuera posible. [No estaba claro](https://reactjs.org/blog/2015/01/27/react-v0.13.0-beta-1.html#other-languages) cuán relativamente exitosos serían ClojureScript, CoffeeScript, ES6, Fable, Scala.js, TypeScript, u otras soluciones para definir componentes. Así que React intencionalmente no requería llamar a `super()` — aún cuando las clases ES6 sí lo hacen.

¿Esto quiere decir que puedes escribir simplemente `super()` en lugar de `super(props)`?

**Probablemente no, porque sigue siendo confuso.** Seguro, React asignaría `this.props` *después* que tu constructor se ha ejecutado. Pero `this.props` aún no estaría definido *entre* la invocación a `super` y el fin de tu constructor:

```jsx{14}
// Dentro de React
class Component {
  constructor(props) {
    this.props = props;
    // ...
  }
}

// Dentro de tu código
class Button extends React.Component {
  constructor(props) {
    super(); // 😬 Olvidamos pasar props
    console.log(props);      // ✅ {}
    console.log(this.props); // 😬 undefined 
  }
  // ...
}
```

Puede ser aún más difícil de depurar si esto ocurre en algún método invocado *desde* el constructor. **Y por eso es que recomiendo siempre pasar `super(props)`, aun cuando no es estrictamente necesario:**

```jsx
class Button extends React.Component {
  constructor(props) {
    super(props); // ✅ Pasamos props
    console.log(props);      // ✅ {}
    console.log(this.props); // ✅ {}
  }
  // ...
}
```

Esto asegura que `this.props` esté definido aún antes de que el constructor termine.

-----

Hay una última parte sobre la que los usuarios veteranos de React podrían tener curiosidad.

Puede que hayas notado cuando usas la API Context en clases (ya sea con la antigua API `contextTypes` o la moderna `contextType` añadida en React 16.6), `context` se pasa como segundo argumento al constructor.

¿Entonces por qué en su lugar no escribimos `super(props, context)`? Podríamos, pero context se usa con menos frecuencia, por lo que esta trampa no aparece tan a menudo.

**Con la propuesta de atributos de clase esta trampa mayormente desaparece de todas formas.** Sin un constructor explícito, todos los argumentos se pasan automáticamente. Esto es lo que permite que una expresión como `state = {}`, si lo necesita, incluya referencias a `this.props` o `this.context`.

Con los Hooks, ni siquiera tenemos `super` o `this`. Pero ese es tema para otro día.
