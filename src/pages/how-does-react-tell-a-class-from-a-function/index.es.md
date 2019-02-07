---
title: ¿Cómo React distingue una clase de una función?
date: '2018-12-02'
spoiler: Hablamos de clases, new, instanceof, cadenas de prototipo, y diseño de las API.
---

Considera este componente `Saludo` definido como una función:

```jsx
function Saludo() {
  return <p>Hola</p>;
}
```

React también permite definirlo como una clase:

```jsx
class Saludo extends React.Component {
  render() {
    return <p>Hola</p>;
  }
}
```

(Hasta [hace poco](https://reactjs.org/docs/hooks-intro.html), esa era la única forma de utilizar características como el estado.)

Cuando se quiere renderizar un componente `<Saludo />`, no importa cómo se define:

```jsx
// Clase o función — no importa.
<Saludo />
```

¿Pero a *React* sí que le importa la diferencia!

Si `Saludo` es una función, React necesita invocarla:

```jsx
// Tu código
function Saludo() {
  return <p>Hola</p>;
}

// Dentro de React
const resultado = Saludo(props); // <p>Hola</p>
```

Pero si `Saludo` es una clase, React necesita instanciarla con el operador `new` y *luego* invocar el método `render` en la instancia recién creada:

```jsx
// Tu código
class Saludo extends React.Component {
  render() {
    return <p>Hola</p>;
  }
}

// Dentro de React
const instancia = new Saludo(props); // Saludo {}
const resultado = instancia.render(); // <p>Hola</p>
```

En ambos casos el objetivo de React es obtener el nodo renderizado (en este ejemplo, `<p>Hola</p>`). Pero los pasos exactos dependen de cómo se define `Saludo`.

**¿Pero cómo sabe React si algo es una clase o una función?**

Tal y como dije en mi [artículo anterior](/why-do-we-write-super-props/), **no *necesitas* saber esto para ser productivo en React.** Yo me pasé años sin saberlo. Por favor no conviertas esto en una pregunta de entrevista. De hecho, este artículo es más sobre Javascript que sobre React.

Este blog es para el lector curioso que quiere saber *por qué* React funciona de cierta manera. ¿Eres esa persona? Si es así, profundicemos juntos.

**Este es un viaje largo, así que abróchate el cinturón. Este artículo no tiene mucha información sobre React en sí, pero analizaremos algunos aspectos de `new`, `this`, `class`, funciones flecha, `prototype`, `__proto__`, `instanceof`, y como todas funcionan en conjunto en JavaScript. Afortunadamente, no necesitas pensar mucho sobre estas cosas cuando *usas* React. Cuando implementas React la historia es otra...**

(Si lo único que quieres es saber la respuesta, ve justo hasta el final).

----

Primero, necesitamos entender por qué es importante tratar a las funciones y a las clases de manera diferente. Nota como usamos el operador `new` cuando se invoca una clase:

```jsx{5}
// Si Saludo es una función
const resultado = Saludo(props); // <p>Hola</p>

// Si Saludo es una clase
const instancia = new Saludo(props); // Saludo {}
const resultado = instancia.render(); // <p>Hola</p>
```

Veamos a grandes rasgos lo que hace el operador `new` en JavaScript.

---

En los viejos tiempos, Javascript no tenía clases. Sin embargo podías expresar un patrón similar a las clases usando funciones comunes. **En concreto, se podía usar *cualquier* función en un papel similar al de un constructor de clase al añadir `new` antes de la invocación:**

```jsx
// Solo una función
function Persona(nombre) {
  this.nombre = nombre;
}

var fred = new Persona('Fred'); // ✅ Persona {nombre: 'Fred'}
var george = Persona('George'); // 🔴 No funcionará
```

¡Aún hoy se puede escribir código como este! Pruébalo en las herramientas de desarrollo.

Si invocabas `Persona('Fred')` **sin** `new`, dentro de ella `this` apuntaría a algo global e inútil (por ejemplo `window` o `undefined`). Por lo que nuestro código fallaría o haría algo estúpido como asignarle un valor a `window.name`.

Al añadir `new` antes de la invocación, estamos diciendo: «JavaScript, sé que `Persona` es solo una función pero finjamos que es algo como un constructor de clase. **Crea un objeto `{}` y pon a apuntar a `this` dentro de la función `Persona` a ese objeto; para que así yo pueda asignar cosas como `this.name`. Por último, devuélveme ese objeto.**”

Eso es lo que el operador `new` hace.

```jsx
var fred = new Persona('Fred'); // El mismo objeto que `this` dentro de `Persona`
```

El operador `new` también pone a disposición dentro del objeto `fred` todo lo que pongamos en `Persona.prototype`.

```jsx{4-6,9}
function Persona(nombre) {
  this.nombre = nombre;
}
Persona.prototype.diHola = function() {
  alert('Hola, Soy ' + this.nombre);
}

var fred = new Persona('Fred');
fred.diHola();
```

Así es como las personas emulaban las clases antes que Javascript las añadiera directamente.

---

Así que `new` ha estado rondando JavaScript por bastante tiempo. Sin embargo, las clases son mucho más recientes; ellas nos permiten reescribir el código anterior para acercarnos más a lo que intentamos expresar:

```jsx
class Persona {
  constructor(nombre) {
    this.nombre = nombre;
  }
  diHola() {
    alert('Hola, Soy ' + this.nombre);
  }
}

let fred = new Persona('Fred');
fred.diHola();
```

*Capturar la intención del desarrollador* es importante en el diseño de lenguajes y API.

Si escribes una función, Javascript no puede adivinar si la intención es ser invocada como `alert()` o si funciona como un constructor como `new Persona()`. Si se olvidara especificar `new` para una función como `Persona`, ello conduciría a un comportamiento confuso.

**La sintaxis de las clases nos permiten decir: «Esto no es solo una función — es una clase y tiene un constructor».** Si olvidas `new` al invocarla, Javascript elevará un error:

```jsx
let fred = new Persona('Fred');
// ✅  Si Persona es una función: no hay problemas
// ✅  Si Persona es una clase: tampoco hay problemas

let george = Persona('George'); // Olvidamos `new`
// 😳 Si Persona es un función tipo constructor: comportamiento confuso
// 🔴 Si Persona es una clase: falla inmediatamente
```

Esto nos ayuda a detectar el error rápidamente en lugar de esperar por algún error oculto como que `this.name` sea tratado como `window.name` y no `george.name`.

Sin embargo, ello significa que React necesita poner `new` antes de invocar cualquier clase. No puede simplemente invocarla como una función regular, ¡pues Javascript lo trataría como un error!

```jsx
class Contador extends React.Component {
  render() {
    return <p>Hola</p>;
  }
}

// 🔴 React no puede hacer esto:
const instancia = Contador(props);
```

Esto claramente trae problemas.

---

Antes de ver cómo React lo resuelve, es importante recordar que la mayoría de las personas que usan React utilizan compiladores como Babel para traducir características modernas como las clases a algo que puedan entender los navegadores antiguos. Por tanto, debemos considerar a los compiladores en nuestro diseño.

En las primeras versiones de Babel, se podían invocar las clases sin `new`. Sin embargo, eso se solucionó — con la generación de algún código extra:

```jsx
function Persona(nombre) {
  // Un fragmento simplificado de la salida de Babel:
  if (!(this instanceof Persona)) {
    throw new TypeError("No se puede invocar una clase como una función");
  }
  // Nuestro código:
  this.nombre = nombre;
}

new Persona('Fred'); // ✅ Bien
Persona('George');   // 🔴 No se puede llamar una clase como una función
``` 

Puede que hayas visto código como este en tu archivo compilado. Eso es lo que hacen todas esas funciones `_classCallCheck`. (Puedes reducir el tamaño del resultado de la compilación si optas por el «modo relajado» (*loose mode*) sin chequeos pero ello puede complicar tu eventual transición a clases nativas reales.)

---

Hasta este punto deberías comprender a grandes rasgos la diferencia entre invocar algo con `new` y sin `new`:

|  | `new Persona()` | `Persona()` |
|---|---|---|
| `clase` | ✅ `this` es una instancia de `Persona` | 🔴 `TypeError`
| `función` | ✅ `this` es una instancia de `Persona` | 😳 `this` es `window` o `undefined` |

Por eso es importante para React invocar tu componente de manera correcta. **Si tu componente se define como una clase, React necesita usar `new` cuando lo invoca.**

Entonces, ¿puede React simplemente chequear si algo es una clase o no?

¡No tan fácil! Aún si pudiésemos [diferenciar una clase de una función en JavaScript](https://stackoverflow.com/questions/29093396/how-do-you-check-the-difference-between-an-ecmascript-6-class-and-function), no funcionaría para las clases procesadas por herramientas como Babel. Para el navegador, solo son simples funciones. Mala suerte para React.

---

Bien, ¿quizá React podría usar `new` en cada invocación? Desafortunadamente, eso tampoco funciona siempre.

Con funciones comunes, invocarlas con `new` les daría una instancia de objeto como `this`. Eso es deseable para funciones escritas como un constructor (como nuestra anterior `Persona`), pero sería confuso para las componentes de función:

```jsx
function Saludo() {
  // No esperaríamos aquí que `this` sea algún tipo de instancia
  return <p>Hola</p>;
}
```

Sin embargo, eso sería tolerable. Hay *otras* dos razones para descartar esa idea.

---

La primera razón por la que usar siempre `new` no funcionaría es que en el caso de las funciones flecha nativas (no las que compila Babel), invocarlas con `new` lanza un error:

```jsx
const Saludo = () => <p>Hola</p>;
new Saludo(); // 🔴 Saludo no es un constructor
```

Este comportamiento es intencional y se desprende del diseño de las funciones flecha. Uno de los principales beneficios de las funciones flecha es que *no* tienen su propio valor `this` — en su lugar `this` se resuelve a partir de la función común más cercana:

```jsx{2,6,7}
class Amigos extends React.Component {
  render() {
    const amigos = this.props.amigos;
    return amigos.map(amigo =>
      <Amigo
        // `this` se resuelve a partir del método `render`
        tamaño={this.props.tamaño}
        nombre={amigo.nombre}
        key={amigo.id}
      />
    );
  }
}
```

Bien, así que **las funciones flecha no tienen su propio `this`.** ¡Pero eso significa que serían completamente inútiles como constructores!

```jsx
const Persona = (nombre) => {
  // 🔴 ¡Esto no tendría sentido!
  this.nombre = nombre;
}
```

Por tanto, **Javascript no permite invocar una función flecha con `new`.** Si lo haces, probablemente es un error, y es mejor decírtelo pronto. Es similar a como Javascript no te permite invocar una clase *sin* `new`.

Eso es bueno, pero nos arruina el plan. React no puede simplemente invocar con `new` a todo ¡porque haría fallar a las funciones flecha! Podríamos intentar detectar específicamente a las funciones flecha por su falta de `prototype`, y no invocarlas con `new`.


```jsx
(() => {}).prototype // undefined
(function() {}).prototype // {constructor: f}
```

Pero esto [no funcionaría](https://github.com/facebook/react/issues/4599#issuecomment-136562930) para funciones compiladas con Babel; lo que podría no ser de gran importancia, pero hay otra razón que hace de esta vía un callejón sin salida.

---

Otra razón por la que no podemos usar siempre `new` es que evitaría que React diera soporte a componentes que devuelven cadenas u otros tipos primitivos.


```jsx
function Saludo() {
  return 'Hola';
}

Saludo(); // ✅ 'Hola'
new Saludo(); // 😳 Saludo {}
```

De nuevo, Esto tiene que ver con las rarezas del diseño del [operador `new`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/new). Como vimos antes, `new` le dice al motor de Javascript que cree un objeto, que dentro de la función ese objeto sea `this`, y luego nos devuelva ese objeto como resultado de `new`.

Sin embargo, Javascript también permite que una función invocada con `new` *sobreescriba* el valor de retorno de `new` devolviendo algún otro objeto. Presumiblemente, esto se consideró util para patrones como *pool* en el que se quiere reutilizar instancias:


```jsx{1-2,7-8,17-18}
// Inicialización perezosa
var vectorCero = null;

function Vector(x, y) {
  if (x === 0 && y === 0) {
    if (vectorCero !== null) {
      // Reutilizar la misma instancia
      return vectorCero;
    }
    vectorCero = this;
  }
  this.x = x;
  this.y = y;
}

var a = new Vector(1, 1);
var b = new Vector(0, 0);
var c = new Vector(0, 0); // 😲 b === c
```

Sin embargo, `new` además *ignora completamente* el valor de retorno de una función si este no es un objeto. Si devuelves una cadena o un número, es como si no hubiera `return` en lo absoluto.

```jsx
function Answer() {
  return 42;
}

Answer(); // ✅ 42
new Answer(); // 😳 Answer {}
```

Simplemente no hay manera de leer un valor de retorno primitivo (como un número o una cadena) de una función cuando se invoca con `new`. Así que si React siempre usase `new`, sería incapaz de añadir soporte para componentes que devuelven cadenas!

Eso es inaceptable por lo que necesitamos una solución intermedia.

---

¿Qué aprendimos hasta ahora? React necesita invocar a las clases (incluidas las de la salida de Babel) *con* `new`, pero necesita invocar a las funciones comunes y a las funciones flechas (incluidas las de la salida de Babel) *sin* `new`. Y no hay forma confiable de distinguirlas.

**Si no podemos resolver un problema general, ¿podemos resolver uno más específico?**

Cuando defines un componente como una clase, probablemente quieras heredar de `React.Component` para tener disponibles los métodos ya incluidos como `this.setState()`. **En lugar de intentar detectar todas las clases, ¿podremos detectar solo a los descendientes de `React.Component`**

Espóiler: esto es exactamente lo que hace React.

---

Quizá la forma idiomática de chequear si `Saludo` es un componente de clase de React es realizando la comprobación `Saludo.prototype instanceof React.Component`:

```jsx
class A {}
class B extends A {}

console.log(B.prototype instanceof A); // true
```

Sé lo que estás pensando. ¡¿Qué es lo que acaba de ocurrir?! Para responderlo, necesitamos entender los prototipos de JavaScript.

Puede que estés familiarizado con la «cadena de prototipo». Cada objeto en Javascript puede tener un «prototipo». Cuando escribimos `fred.diHola()` y el objeto `fred` no tiene un atributo `diHola` lo que hacemos es buscar el atributo `diHola` en el prototipo de `fred`. Si ahí no lo encontramos, buscamos en el próximo prototipo de la cadena — el prototipo del prototipo de `fred`. Y así sucesivamente.

**Para hacer las cosas más confusas, el atributo `prototype` de una clase o una función _no_ apunta al prototipo de ese valor.** No es broma.

```jsx
function Persona() {}

console.log(Persona.prototype); // 🤪 No es el prototipo de Persona
console.log(Persona.__proto__); // 😳 El prototipo de Persona
```

Así que la «cadena de prototipo» es más bien `__proto__.__proto__.__proto__` que `prototype.prototype.prototype`. Me tomó años entender esto.

¿Qué es entonces el atributo `prototype` en una función o en una clase? **¡Es el `__proto__` que se le da a todos los objetos de esa clase o función creados con `new`!**

```jsx{8}
function Persona(nombre) {
  this.nombre = nombre;
}
Persona.prototype.diHola = function() {
  alert('Hola, Soy ' + this.nombre);
}

var fred = new Persona('Fred'); // `Persona.prototype` se le asigna a `fred.__proto__`
```

Y esa cadena de `__proto__` es como JavaScript busca los atributos:

```jsx
fred.diHola();
// 1. ¿Tiene fred un atributo diHola? No.
// 2. ¿Tiene fred.__proto__ un atributo diHola? Sí. ¡Invoquémoslo!

fred.toString();
// 1. ¿Tiene fred un atributo toString? No.
// 2. ¿Tiene fred.__proto__ un atributo toString? No.
// 3. ¿Tiene fred.__proto__.__proto__ un atributo toString? Sí. ¡Invoquémosolo!
```

En la práctica, casi nunca te encontrarías con la necesidad de tocar `__proto__` directamente desde el código a menos que estés depurando algo relacionado con la cadena de prototipo. Si quieres hacer que algo esté disponible en `fred.__proto__`, se supone que lo pongas en `Persona.prototype`. Al menos es como se diseñó originalmente.

Al principio ni siquiera se suponía que `__proto__` fuera expuesto por los navegadores, porque la cadena de prototipo se consideraba un concepto interno. Pero algunos navegadores añadieron `__proto__` y eventualmente fue estandarizado a regañadientes (pero despreciado en favor de `Object.getPrototypeOf()`).

**Y aun así hallo bastante confuso que un atributo llamado `prototype` no te de el prototipo del valor** (por ejemplo, `fred.prototype` no está definido porque `fred` no es una función). Personalmente, pienso que es la razón principal por la que aún desarrolladores experimentados tienden a no entender correctamente los prototipos de Javascript.

---

¿Es largo el artículo, eh? Diría que vamos por el 80%. Aguanta un poco.

Sabemos que cuando dice `obj.foo`, Javascript lo que en realidad hace es buscar `foo` en `obj`, `obj.__proto__`, `obj.__proto__.__proto__`, y así sucesivamente.

Con las clases, no estás expuesto directamente a este mecanismo, pero `extends` también funciona sobre el viejo patrón de la cadena de prototipo. Así es como nuestra instancia de clase de React tiene acceso a métodos como `setState`:

```jsx{1,9,13}
class Saludo extends React.Component {
  render() {
    return <p>Hola</p>;
  }
}

let c = new Saludo();
console.log(c.__proto__); // Saludo.prototype
console.log(c.__proto__.__proto__); // React.Component.prototype
console.log(c.__proto__.__proto__.__proto__); // Object.prototype

c.render();    // Encontrado en c.__proto__ (Saludo.prototype)
c.setState();  // Encontrado en c.__proto__.__proto__ (React.Component.prototype)
c.toString();  // Encontrado en c.__proto__.__proto__.__proto__ (Object.prototype)
```

En otras palabras, **cuando usas clases, una cadena `__proto__` de la instancia «refleja» la jerarquía de clases:**

```jsx
// cadena `extends`
Saludo
  → React.Component
    → Object (implícitamente)

// cadena `__proto__`
new Saludo()
  → Saludo.prototype
    → React.Component.prototype
      → Object.prototype
```

*2 Chainz.*

---

Dado que la cadena `__proto__` es un reflejo de la jerarquía de clases, podemos comprobar si `Saludo` hereda de `React.Component` comenzando con `Saludo.prototype`, y seguir luego hacia abajo en su cadena `__proto__`:

```jsx{3,4}
// cadena `__proto__`
new Saludo()
  → Saludo.prototype // 🕵️ Comenzamos aquí
    → React.Component.prototype // ✅ ¡Lo encontré!
      → Object.prototype
```

Convenientemente, `x instanceof Y` hace exactamente este tipo de búsqueda. Sigue la cadena `x.__proto__` buscando `Y.prototype`.

Normalmente, se usa para determinar si algo es una instancia de una clase.

```jsx
let saludo = new Saludo();

console.log(saludo instanceof Saludo); // true
// saludo (🕵️‍ Comenzamos aquí)
//   .__proto__ → Saludo.prototype (✅ ¡Lo encontré!)
//     .__proto__ → React.Component.prototype 
//       .__proto__ → Object.prototype

console.log(saludo instanceof React.Component); // true
// saludo (🕵️‍ Comenzamos aquí)
//   .__proto__ → Saludo.prototype
//     .__proto__ → React.Component.prototype (✅ ¡Lo encontré!)
//       .__proto__ → Object.prototype

console.log(saludo instanceof Object); // true
// saludo (🕵️‍ Comenzamos aquí)
//   .__proto__ → Saludo.prototype
//     .__proto__ → React.Component.prototype
//       .__proto__ → Object.prototype (✅ ¡Lo encontré!)

console.log(saludo instanceof Banana); // false
// saludo (🕵️‍ Comenzamos aquí)
//   .__proto__ → Saludo.prototype
//     .__proto__ → React.Component.prototype 
//       .__proto__ → Object.prototype (🙅‍ ¡No lo encontré!)
```

Pero para determinar si una clase hereda de otra clase también funcionaría:

```jsx
console.log(Saludo.prototype instanceof React.Component);
// saludo
//   .__proto__ → Saludo.prototype (🕵️‍ Comenzamos aquí)
//     .__proto__ → React.Component.prototype (✅ ¡Lo encontré!)
//       .__proto__ → Object.prototype
```

Y esa comprobación permitiría determinar si algo es un componente de clase de React o una función común.

---

No obstante, eso no es lo que hace React. 😳

Un problema con la solución de `instanceof` es que no funciona cuando hay múltiples copias de React en la página y el componente que estamos comprobando hereda del `React.Component` de *otra* copia de React. Mezclar múltiples copias de React en un proyecto es malo por varias razones, pero históricamente hemos tratado de evitar problemas cuando sea posible. (Sin embargo, con los Hooks, [puede que necesitemos](https://github.com/facebook/react/issues/13991) obligar que no exista duplicación.)

Otra posible heurística podría ser comprobar la presencia del método render en el prototipo. Sin embargo, en ese momento [no estaba claro](https://github.com/facebook/react/issues/4599#issuecomment-129714112) como evolucionaría la API de componentes. Cada comprobación tiene un costo por lo que no quisiéramos añadir más de uno. Tampoco funcionaría si `render` se definiera como un método de instancia, como en la sintaxis de atributos de clase.

Por lo que en su lugar, React [agregó](https://github.com/facebook/react/pull/4663) un centinela, y es así cómo sabe si algo es un componente de clase o no.

Originalmente el centinela estaba en la misma clase base `React.Component`:

```jsx
// Dentro de React
class Component {}
Component.isReactClass = {};

// Podemos comprobar de esta forma
class Saludo extends Component {}
console.log(Saludo.isReactClass); // ✅ Sí
```

Sin embargo, algunas implementaciones de clases que queríamos abordar [no](https://github.com/scala-js/scala-js/issues/1900) copian los atributos estáticos (o no establecen el no estandarizado `__proto__`), por lo que el centinela se perdía.

Es por ello que React [movió](https://github.com/facebook/react/pull/5021) este centinela a `React.Component.prototype`:

```jsx
// Dentro de React
class Component {}
Component.prototype.isReactComponent = {};

// Podemos comprobar de esta forma
class Saludo extends Component {}
console.log(Saludo.prototype.isReactComponent); // ✅ Sí
```

**Y esto es literalmente todo lo que hay que hacer.**

Puedes estarte preguntando por qué es un objeto y no simplemente un booleano. No importa mucho en la práctica, pero las primeras versiones de Jest (antes de que Jest fuera Bueno™️) tenían habilitada por defecto la simulación automática (*automocking*). Los objetos simulados resultantes omitían los atributos primitivos, [afectando la comprobación](https://github.com/facebook/react/pull/4663#issuecomment-136533373). Gracias, Jest.

La comprobación `isReactComponent` [se usa en React](https://github.com/facebook/react/blob/769b1f270e1251d9dbdce0fcbd9e92e502d059b8/packages/react-reconciler/src/ReactFiber.js#L297-L300) hasta el día de hoy.

Si no heredas de `React.Component`, React no encontrará `isReactComponent` en el prototipo, y no tratará al componente como una clase.

Ahora sabes porqué [la respuesta con más votos positivos](https://stackoverflow.com/a/42680526/458193) para el error `No se puede invocar una clase como una función` es añadir `extends React.Component`. Al final [se añadió una advertencia](https://github.com/facebook/react/pull/11168) que se activa cuando existe `prototype.render` pero no `prototype.isReactComponent`.

---

Se podría decir que con esta historia les he vendido gato por liebre. **Las solución real es muy simple, pero me fui ampliamente por la tangente para explicar *por qué* React terminó usando esta solución, y cuáles era las alternativas.**

De acuerdo a mi experiencia, es lo que ocurre frecuentemente con las API de las bibliotecas. Para que una API sea sencilla de usar, a menudo debes considerar la semántica del lenguaje (posiblemente la de varios lenguajes, incluyendo direcciones futuras), desempeño de ejecución, ergonomía con y sin pasos de compilación, el estado del ecosistema y las soluciones de empaquetado, advertencias tempranas y muchas otras cosas. El resultado final podría no ser siempre el más elegante, pero debe ser práctico.

**Si la API final es exitosa, _sus usuarios_ nunca tendrán que pensar en este proceso.** En su lugar se pueden enfocar en crear aplicaciones.

Pero si además eres curioso... es bueno saber cómo funciona.
