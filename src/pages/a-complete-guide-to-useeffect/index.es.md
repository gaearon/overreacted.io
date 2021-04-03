---
title: Guía completa de useEffect
date: '2019-03-09'
spoiler: Los Effects son parte de tu flujo de datos
cta: 'react'
---

Escribiste algunos componentes con [Hooks](https://reactjs.org/docs/hooks-intro.html). Tal vez incluso una pequeña aplicación. Te sientes satisfecho. Te sientes cómodo con el API e incluso pudiste aplicar algunos trucos mientras la desarrollabas. Incluso creaste algunos [Hooks personalizados](https://reactjs.org/docs/hooks-custom.html) para extraer lógica repetitiva (adiós a 300 líneas) y se lo mostraste a tus colegas. "Buen trabajo", dijeron.

Pero en ocasiones, cuando usas `useEffect`, las piezas no encajan del todo. Tienes una sensación de que algo te está haciendo falta. Pareciera similar a los métodos del ciclo de vida de componentes... pero, ¿lo es? Eventualmente te haces preguntas como:

* 🤔 ¿Cómo replico `componentDidMount` usando `useEffect`?
* 🤔 ¿Cuál es la forma correcta de obtener datos externos dentro de `useEffect`? ¿Qué es `[]`?
* 🤔 ¿Es necesario que coloque funciones en las dependencias de `useEffect` o no?
* 🤔 ¿Por qué algunas veces mi código que obtiene datos externos entra en un ciclo infinito?
* 🤔 ¿Por qué algunas veces me encuentro con estado o propiedades con valores pasados en `useEffect`?

Cuando comencé a usar Hooks, a mí también me confundían todas estas preguntas. Incluso cuando estaba escribiendo la documentación inicial, no tenía un entendimiento firme de algunos detalles. De ese entonces para acá he tenido algunos momentos de "iluminación" que quiero compartir. **Este análisis exhaustivo te dará todas las respuestas a esas preguntas.**

Para poder *ver* las respuestas, necesitamos verlo desde una perspectiva más general. El propósito de este artículo no es darte un listado de ingredientes como si se tratara de una receta. El propósito es ayudarte a digerir `useEffect`. No se tratará tanto de aprender. De hecho, vamos a invertir bastante tiempo en *des*aprender.

**Cuando dejé de ver al Hook `useEffect` a través del lente de los familiares métodos del ciclo de vida fue cuando todas las piezas encajaron para mí.**

>“Desaprende lo que has aprendido.” — Yoda

![Yoda olfateando. Caption: “Huele a tocino.”](./yoda.jpg)

---

**Este artículo asume que ya estás algo familiarizado con el API de [`useEffect`](https://reactjs.org/docs/hooks-effect.html).**

**También es *bastante* extenso. Es como un pequeño libro. Ese es mi formato preferido. Pero escribí un TLDR justo abajo en caso de que tengas prisa o no te importe demasiado.**

**Si no te sientes cómodo con análisis exhaustivos, pueda que debas esperar hasta que estas explicaciones aparezcan en otro lugar. Así como cuando React salió en 2013, va a tomar algo de tiempo para que los demás reconozcan un modelo mental diferente y puedan enseñarlo.**

---

## TLDR

Aquí hay un breve TLDR en caso de que no quieras leer todo el artículo. Si hay partes que no hacen sentido, puedes desplazarte hacia abajo hasta que encuentres algo relacionado.

Siente libertad de saltarte esta parte si piensas leer la publicación completa. Voy a agregar un vínculo hacia aquí al final.

**🤔 Pregunta: ¿Cómo replico `componentDidMount` usando `useEffect`?**

Aun cuando puedes usar `useEffect(fn, [])`, no es un equivalente exacto. A diferencia de `componentDidMount`, va a *capturar* propiedades y estado. De manera que aún dentro de los callbacks, verás las propiedades y estado iniciales. Si quieres ver lo "último" de algo, puedes escribirlo en un ref. Pero usualmente hay una manera más simple de estructurar el código de manera que no tengas que hacer esto. Toma en cuenta que el modelo mental para los effects es diferente a `componentDidMount` y a otros métodos del ciclo de vida e intentar encontrar sus equivalentes exactos puede confundirte más que ayudarte. Para ser productivo, necesitas "pensar en efectos" y su modelo mental que es más cercano a implementar sincronización que a eventos del ciclo de vida.

**🤔 Pregunta:  ¿Cuál es la forma correcta de obtener datos dentro de `useEffect`? ¿Qué es `[]`?**

[Este artículo](https://www.robinwieruch.de/react-hooks-fetch-data/) es una buena introducción a obtener datos con `useEffect`. ¡Asegúrate de leerlo completo! No es tan largo como este artículo. `[]` significa que el efecto no usa ningún valor que participe en el flujo de datos de React, y es por esa razón que es seguro ejecutarlo una sola vez. También es una fuente común de errores cuando el valor *es* usado. Tendrás que aprender algunas estrategias (principalmente `useReducer` y `useCallback`) que pueden *remover la necesidad* de una dependencia en lugar de incorrectamente omitirla.

**🤔 Pregunta: ¿Es necesario que coloque funciones en las dependencias de `useEffect` o no?**

La recomendación es sacar *fuera* de tu componente las funciones que no necesitan propiedades o estado, y colocar *adentro* de effect aquellas que son utilizadas por ese effect. Si después de seguir esas recomendaciones tu effect aún termina utilizando funciones en el alcance del renderizado (incluyendo funciones pasadas como propiedades), enciérralas en `useCallback` en donde están definidas, y repite el proceso. ¿Por qué es importante hacerlo? Las funciones pueden "ver" valores de propiedades y estado - de manera que participan en el flujo de datos. Hay una [respuesta más detallada](https://reactjs.org/docs/hooks-faq.html#is-it-safe-to-omit-functions-from-the-list-of-dependencies) en nuestro FAQ.

**🤔 Pregunta: ¿Por qué algunas veces mi código que obtiene datos externos entra en un ciclo infinito?**

Esto puede suceder si estás obteniendo datos en un effect sin utilizar el argumento de dependencias. Sin él, los effects son ejecutados después de cada render — y ajustar el estado va a disparar los effects de nuevo. Un ciclo infinito también pueda darse si especificas un valor que *siempre* cambia en el arreglo de dependencias. Puedes encontrar cuál es quitando uno por uno. Sin embargo, remover una dependencia que utilizas (o ciegamente especificar `[]`) es usualmente una solución incorrecta. En su lugar, arregla el problema desde la fuente. Por ejemplo, funciones pueden ser la causa de este problema, y con ponerlas adentro de los effects, sacarlas del componente, o colocarlas adentro de `useCallback` puede ayudar. Para evitar recrear objetos, `useMemo` puede tener un uso similar. 

**🤔 Pregunta: ¿Por qué algunas veces me encuentro con estado o propiedades con valores pasados en `useEffect`?**

Los effects siempre "ven" las propiedades y estado del renderizado en el cual fueron definidos. Esto [ayuda a prevenir errores](/how-are-function-components-different-from-classes/) pero en algunos casos puede ser molesto. Para esos casos, puedes mantener el valor en un ref mutable de manera explícita (el artículo referido lo explica al final). Si crees que te estás encontrando con propiedades o estado de un renderizado pasado, pero no espera que fuera así, probablemente te hizo falta alguna dependencia. Intenta usar una [regla de lint](https://github.com/facebook/react/issues/14920) para entrenarte a ti mismo para verlas. Un par de días, y será como una segunda naturaleza para ti. También puedes ver [esta respuesta] (https://reactjs.org/docs/hooks-faq.html#why-am-i-seeing-stale-props-or-state-inside-my-function) en nuestro FAQ.

---

¡Espero que este TLDR haya sido de ayuda! De lo contrario, vamos.

---

## Cada Render Tiene Sus Propias Propiedades y Estado

Antes que podamos hablar de effects, necesitamos hablar sobre el renderizado.

Aquí hay un contador. Observa la línea resaltada detenidamente:

```jsx{6}
function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>You clicked {count} times</p>
      <button onClick={() => setCount(count + 1)}>
        Click me
      </button>
    </div>
  );
}
```

¿Qué significa? ¿Acaso `count` de alguna manera "observa" cambios en nuestro estado y se actualiza de manera automática? Esa puede ser una útil intuición inicial cuando aprendes React, pero *no* es un [modelo mental adecuado](https://overreacted.io/react-as-a-ui-runtime/).

**En este ejemplo, `count` solo es un número.** No es un "vínculo de datos" mágico, un "observador", un "proxy", o nada más. Es un viejo y conocido número tal como este:

```jsx
const count = 42;
// ...
<p>You clicked {count} times</p>
// ...
```

La primera vez que nuestro componente se renderiza, la variable `count` que obtenemos de `useState()` es `0`. Cuando llamamos `setCount(1)`, React llama nuestro componente de nuevo. Esta vez, `count` será `1`. Y así sucesivamente:

```jsx{3,11,19}
// Durante el primer renderizado
function Counter() {
  const count = 0; // Retornado por useState()
  // ...
  <p>You clicked {count} times</p>
  // ...
}

// Después de un click, nuestra función es llamada de nuevo
function Counter() {
  const count = 1; // Retornado por useState()
  // ...
  <p>You clicked {count} times</p>
  // ...
}

// Después de otro click, nuestra función se llama de nuevo
function Counter() {
  const count = 2; // Retornado por useState()
  // ...
  <p>You clicked {count} times</p>
  // ...
}
```

**Cuando sea que actualicemos el estado, React llama a nuestro componente. Cada resultado de render "ve" su propio valor del estado `counter` el cual es una *constante* dentro de nuestra función.**

De este modo, esta línea no hace ningún tipo de vinculación de datos especiales:

```jsx
<p>You clicked {count} times</p>
```

**Solamente incrusta un valor numérico en los resultados del render.** Ese número es proporcionado por React. Cuando hacemos `setCount`, React llama nuestro componente de nuevo con un valor diferente para `count`. Luego, React actualiza el DOM para que coincida con nuestro último renderizado.

El punto importante de esto es que la constante `count` dentro de cualquier render particular no cambia con el tiempo. Es nuestro componente que es llamado de nuevo — y cada render "ve" su propio valor `count` que está aislado de render a render.

*(Para un recorrido profundo de este proceso, consulta mi publicación [React como un UI Runtime](https://overreacted.io/react-as-a-ui-runtime/) .)*

## Cada Render Tiene Sus Propios Manejadores De Eventos 

Hasta ahora, todo bien. ¿Qué hay de los manejadores de eventos?

Revisa este ejemplo. Muestra un mensaje de alerta con el valor de `count` después de tres segundos:

```jsx{4-8,16-18}
function Counter() {
  const [count, setCount] = useState(0);

  function handleAlertClick() {
    setTimeout(() => {
      alert('You clicked on: ' + count);
    }, 3000);
  }

  return (
    <div>
      <p>You clicked {count} times</p>
      <button onClick={() => setCount(count + 1)}>
        Click me
      </button>
      <button onClick={handleAlertClick}>
        Show alert
      </button>
    </div>
  );
}
```

Digamos que sigo estos pasos en orden:

* **Incremento** el contador a 3
* **Presiono** "Show alert"
* **Incremento** el contador a 5 antes de que el temporizador se dispare

![Demo del contador](./counter.gif)

¿Qué esperas que muestre el mensaje de alerta? ¿Mostrará 5 — que es el valor del estado del contador al momento del mensaje? ¿O mostrará 3 — el valor del estado cuando hice click?

----

*Vienen spoilers*

---

¡Ve y [pruébalo tu mismo!](https://codesandbox.io/s/w2wxl3yo0l)

Si el resultado no te hace mucho sentido, imagina un ejemplo más práctico: una aplicación de chat con el valor actual del ID del recipiente en su estado y un botón de Enviar. [Este artículo](https://overreacted.io/how-are-function-components-different-from-classes/) explora las razones de esto a profundidad, pero la respuesta correcta es 3.

El mensaje de alerta "captura" el estado en el momento que hice click en el botón.

*(Hay formas de implementar el otro resultado también, pero por ahora me estaré enfocando en el caso por defecto. Cuando construimos un modelo mental, es importante que distingamos el "camino con menor resistencia" del camino no convencional)*

---

¿Pero, cómo funciona?

Ya hemos discutido que el valor de `count` es constante para cada llamada particular a nuestra función. Vale la pena enfatizar esto — **nuestra función es llamada muchas veces (una por cada render), pero cada una de esas veces el valor de `count` dentro de la función es constante y asignado a un valor en particular (el estado de ese render).**

Esto no es específico de React — las funciones regulares funcionan de manera similar:

```jsx{2}
function sayHi(person) {
  const name = person.name;
  setTimeout(() => {
    alert('Hello, ' + name);
  }, 3000);
}

let someone = {name: 'Dan'};
sayHi(someone);

someone = {name: 'Yuzhi'};
sayHi(someone);

someone = {name: 'Dominic'};
sayHi(someone);
```

En [este ejemplo](https://codesandbox.io/s/mm6ww11lk8), la variable externa `someone` es reasignada en varias ocasiones. (Igual que en algún lugar en React, el estado del componente *actual* puede cambiar.) **Sin embargo, adentro de `sayHi`, hay una constante local `name` que es asociada con una `person` de cada llamada particular.** Esa constante es local, por lo tanto, ¡es aislada entre cada llamada! Como resultado, cuando el temporizador se dispara, cada alerta "recuerda" su propio `name`.

Esto explica como nuestro manejador de eventos captura el valor de `count` en el momento del click. Si aplicamos el mismo principio de substitución, cada render "ve" su propio `count`:

```jsx{3,15,27}
// Durante el primer render
function Counter() {
  const count = 0; // Retornado por useState()
  // ...
  function handleAlertClick() {
    setTimeout(() => {
      alert('You clicked on: ' + count);
    }, 3000);
  }
  // ...
}

// Después de un click, nuestra función es llamada de nuevo
function Counter() {
  const count = 1; // Retornado  por useState()
  // ...
  function handleAlertClick() {
    setTimeout(() => {
      alert('You clicked on: ' + count);
    }, 3000);
  }
  // ...
}

// Después de otro click, nuestra función es llamada otra vez
function Counter() {
  const count = 2; // Retornado por useState()
  // ...
  function handleAlertClick() {
    setTimeout(() => {
      alert('You clicked on: ' + count);
    }, 3000);
  }
  // ...
}
```

Entonces efectivamente, cada render retorna su propia "versión" de `handleAlertClick`. Cada una de esas versiones "recuerda" su propio `count`:

```jsx{6,10,19,23,32,36}
// Durante el primer render
function Counter() {
  // ...
  function handleAlertClick() {
    setTimeout(() => {
      alert('You clicked on: ' + 0);
    }, 3000);
  }
  // ...
  <button onClick={handleAlertClick} /> // La función que tiene 0 adentro
  // ...
}

// Después de un click, nuestra función es llamada nuevamente
function Counter() {
  // ...
  function handleAlertClick() {
    setTimeout(() => {
      alert('You clicked on: ' + 1);
    }, 3000);
  }
  // ...
  <button onClick={handleAlertClick} /> // La función que tiene 1 adentro
  // ...
}

// Después de otro click, nuestra función es llamada otra vez
function Counter() {
  // ...
  function handleAlertClick() {
    setTimeout(() => {
      alert('You clicked on: ' + 2);
    }, 3000);
  }
  // ...
  <button onClick={handleAlertClick} /> // La función que tiene 2 adentro
  // ...
}
```

Esta es la razón por la cual [en este demo](https://codesandbox.io/s/w2wxl3yo0l) la función que maneja el evento click "pertenece" a un render en particular, y cuando haces click, continúa utilizando el `counter` de acuerdo al estado *de* su ese render.

**Dentro de un render en particular, las propiedades y el estado se mantienen iguales para siempre.** Pero si las propiedades y el estado están aislados entre renders, así también están cualquiera que las utilice (incluyendo los manejadores de eventos). Ellos también "pertenecen" a un render en particular. De manera que incluso funciones async dentro de un manejador de eventos van a "ver" el mismo valor de `count`.

*Nota: Puse entre líneas valores concretos para `count` en la función `handleAlertClick` en los ejemplos de arriba. Esta substitución mental es segura porque el valor de `count` no es posible que cambie dentro de un mismo render. Es declarado como una `const` y es un número. Sería seguro pensar de la misma manera acerca de otros valores como objetos, pero solo si podemos acordar omitir mutar el estado. Llamar `setSomething(newObj)` con un objeto recientemente creado en lugar de mutarlo está bien porque el estado que pertenece a renders previos está intacto.*

## Cada Render Tiene Sus Propios Effect

Se suponía que esta publicación sería acerca de effects pero aún no hemos hablado nada de ellos! Arreglaremos eso ahora. Resulta que, los effects no son para nada diferentes.

Regresemos a un ejemplo de [la documentación](https://reactjs.org/docs/hooks-effect.html):

```jsx{4-6}
function Counter() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    document.title = `You clicked ${count} times`;
  });

  return (
    <div>
      <p>You clicked {count} times</p>
      <button onClick={() => setCount(count + 1)}>
        Click me
      </button>
    </div>
  );
}
```

**¿Pregunta: cómo hace el effect para leer el último valor del estado de `count`?**

¿Tal vez hay algún tipo de "datos vinculados" u "observador" que hace que `count` se actualice en vivo adentro de la función effect? ¿Tal vez `count` es una variable mutable que React define dentro de nuestro componente de manera que nuestro effect ve el último valor?

No.

Ya sabes que `count` es una constante dentro de un render particular de nuestro componente. Los manejadores de eventos "ven" el estado `count` correspondiente al render al cual "pertenece" porque `count` es una variable en su ámbito. ¡Lo mismo aplica para los effects!

**No es la variable `count` que de alguna manera cambia dentro de un effect "inmutable". Es _la función effect en sí misma_ que es diferente para cada render.**

Cada versión "ve" el valor de `count` correspondiente al render que "pertenece":

```jsx{5-8,17-20,29-32}
// Durante el primer render
function Counter() {
  // ...
  useEffect(
    // La función Effect del primer render
    () => {
      document.title = `You clicked ${0} times`;
    }
  );
  // ...
}

// Despues del click, nuestra función es llamada de nuevo
function Counter() {
  // ...
  useEffect(
    // La función Effect del segundo render
    () => {
      document.title = `You clicked ${1} times`;
    }
  );
  // ...
}

// Después de otro click, nuestra función es llamada de nuevo
function Counter() {
  // ...
  useEffect(
    // La función Effect del tercer render
    () => {
      document.title = `You clicked ${2} times`;
    }
  );
  // ..
}
```

React recuerda la función effect que proporcionaste, y la ejecuta después de despachar cambios  hacia el DOM y dejar que el navegador pinte la pantalla.

De manera que aun cuando hablamos de un solo *effect* conceptualmente (que actualiza el dítulo del documento), es representado por una *función diferente* en cada render — y cada función effect "ve" propiedades y estado correspondientes al render en particular al cual pertenece.

**Conceptualmente, puedes imaginar que los effects son *parte del resultado del render*.**

Hablando estrictamente, no lo son (con el propósito de [permitir composición de Hooks](https://overreacted.io/why-do-hooks-rely-on-call-order/) evitando sintaxis tosca o impacto en el tiempo de ejecución). Pero en el modelo mental que estamos construyendo, las funciones effect *pertenecen* a un render en particular en la misma forma que los manejadores de evento lo hacen.

---

Para asegurar que tenemos una comprensión sólida, revisemos nuestro primer render:

* **React:** Dame la UI para cuando el estado es `0`.
* **Tu componente:**
  * Aquí está el resultado del render:
  `<p>You clicked 0 times</p>`
  * También recuerda ejecutar este effect después de que hayas terminado `() => { document.title = 'You clicked 0 times' }`.
* **React:** Claro. Actualizando la UI. Hey navegador, estoy agregando algunas cosas al DOM.
* **Browser:** Super, ya lo dibujé en la pantalla.
* **React:** Ok, ahora voy a ejecutar el effect que me indicaste.
  * Ejecutando `() => { document.title = 'You clicked 0 times' }`.

---

Ahora hagamos una revisión de lo que pasa después que hacemos click:

* **Tu componente:** Hey React, pon en mi estado el valor `1`.
* **React:** Dame la UI para cuando el estado es `1`.
* **Tu componente:**
  * Aquí está el resultado del render:
  `<p>You clicked 1 times</p>`.
  * También recuerda ejecutar este effect después de que hayas terminado: `() => { document.title = 'You clicked 1 times' }`.
* **React:** Claro. Actualizando la UI. Hey navegador, he cambiado el DOM.
* **Browser:** Super, dibujé tus cambios en la pantalla.
* **React:** Ok, ahora voy a ejecutar el effect que corresponde al render que acabo de hacer.
  * Ejecutando `() => { document.title = 'You clicked 1 times' }`.

---

## Cada Render Tiene Su Propio... Todo

**En este punto ya sabemos que los effects son ejecutados después de cada render, que son conceptualmente parte de la salida del componente, y que "ven" las propiedades y el estado de ese render en particular.**

Hagamos un experimento mental. Considera este código:

```jsx{4-8}
function Counter() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    setTimeout(() => {
      console.log(`You clicked ${count} times`);
    }, 3000);
  });

  return (
    <div>
      <p>You clicked {count} times</p>
      <button onClick={() => setCount(count + 1)}>
        Click me
      </button>
    </div>
  );
}
```

Si hago click muchas veces con un leve retraso, ¿cómo se verá el log?

---

*Vienen spoilers*

---

Puede que pienses que es una trampa y que el resultado es poco intuitivo. ¡No lo es! Veremos una secuencia de logs — cada uno perteneciente a su render particular y así con su propio valor de `count`. Puedes [probarlo tu mismo](https://codesandbox.io/s/lyx20m1ol):


![Grabación de pantalla de 1, 2, 3, 4, 5 registrados en orden](./timeout_counter.gif)

Puede que pienses: "¡Por supuesto que así es como funciona! ¿De qué otra forma podría funcionar?"

Pues bien, así no es como `this.state` funciona en clases. Es fácil cometer el error de pensar que esta [implementación con clases](https://codesandbox.io/s/kkymzwjqz3) es equivalente:

```jsx
  componentDidUpdate() {
    setTimeout(() => {
      console.log(`You clicked ${this.state.count} times`);
    }, 3000);
  }
```

Sin embargo, `this.state.count` siempre apunta al *último* count en lugar apuntar al valor que corresponda a cada render. De este modo, vas a ver `5` aparecer en su lugar registrado cada vez:

![Grabación de pantalla 5, 5, 5, 5, 5 registrados en orden](./timeout_counter_class.gif)

Pienso que es irónico que los Hooks dependan tanto en closures de JavaScript, y aun así son las implementaciones con clases las que sufren de [la confusión canónica del valor-incorrecto-en-un-timeout](https://wsvincent.com/javascript-closure-settimeout-for-loop/) que frecuentemente es asociada con closures. Esto es porque la fuente de confusión en este ejemplo es la mutación (React muta `this.state` en clases para apuntar al ultimo estado) y no los closures en sí mismos.

**Los closures son grandiosos cuando los valores que encierras nunca cambian. Eso hace que sea fácil pensar en ellos porque esencialmente te estás refiriendo a constantes.** Y tal como discutimos, las propiedades y el estado nunca cambian dentro de un render en particular. Por cierto, podemos arreglar la versión que usa clases... [a través de closures](https://codesandbox.io/s/w7vjo07055).

## Nadando Contra Corriente

En este punto es importante que lo digamos en voz alta: **cada** función adentro del render de un componente (incluyendo menejadores de eventos, effects, timeouts o llamadas a API dentro de efectos) capturan las propiedades y el estado del render donde fueron definidos.

Por lo tanto estos dos ejemplos son equivalentes:

```jsx{4}
function Example(props) {
  useEffect(() => {
    setTimeout(() => {
      console.log(props.counter);
    }, 1000);
  });
  // ...
}
```

```jsx{2,5}
function Example(props) {
  const counter = props.counter;
  useEffect(() => {
    setTimeout(() => {
      console.log(counter);
    }, 1000);
  });
  // ...
}
```

**No importa si vas a leer de las propiedades o el estado "temprano" dentro de tu componente.** ¡Ninguno de ellos cambiará! Dentro del alcance de un render en particular, las propiedades y el estado se mantienen iguales. (Desestructurar las propiedades hace esto aún más obvio.)

Claro, algunas veces *quieres* leer el último valor en lugar del valor capturado dentro de algún callback definido en un effect. La forma más fácil de lograrlo es a través de refs, tal como está descrito en la última sección de [este artículo](https://overreacted.io/how-are-function-components-different-from-classes/).

Ten presente que cuando quieres leer propiedades o estado del *futuro* desde una función de un render *pasado*, están nadando en contra de la corriente. No es *incorrecto* (y en algunos casos es necesario) pero puede ser que se vea menos "limpio" el romper el paradigma. Esta es una consecuencia  intencional pues ayuda a resaltar qué código es frágil y depende del tiempo. En clases, es menos obvio cuando esto sucede.

Aquí hay una [versión de nuestro ejemplo del contador](https://codesandbox.io/s/rm7z22qnlp) que replica el comportamiento de clases:

```jsx{3,6-7,9-10}
function Example() {
  const [count, setCount] = useState(0);
  const latestCount = useRef(count);

  useEffect(() => {
    // Set the mutable latest value
    latestCount.current = count;
    setTimeout(() => {
      // Read the mutable latest value
      console.log(`You clicked ${latestCount.current} times`);
    }, 3000);
  });
  // ...
```

![Captura de pantalla de 5, 5, 5, 5, 5 registrados en orden](./timeout_counter_refs.gif)

Mutar algo en React puede parecer peculiar. Sin embargo, esto es exactamente la forma en que React en sí mismo reasigna `this.state` en clases. Contrario al estado y propiedades capturados, no tienes ninguna garantía que leer `latestCount.current` te dará el mismo valor en un callback en particular. Por definición, puedes mutarlo en cualquier momento. Es por eso que no es un valor predeterminado sino algo que debes habilitar.

## ¿Qué Hay Acerca De La Limpieza?

Tal y como [lo explican los documentos](https://reactjs.org/docs/hooks-effect.html#effects-with-cleanup), algunos effects pueden tener una fase de limpieza. Esencialmente, su propósito es "deshacer" un efecto en casos como suscripciones.

Considera este código:

```jsx
  useEffect(() => {
    ChatAPI.subscribeToFriendStatus(props.id, handleStatusChange);
    return () => {
      ChatAPI.unsubscribeFromFriendStatus(props.id, handleStatusChange);
    };
  });
```

Imagina que `props` es `{id: 10}` en el primer renderizado, y `{id: 20}` en el segundo. *Puedes* pensar que algo así pasará:

* React limpia el effect para `{id: 10}`.
* React renderiza el UI para `{id: 20}`.
* React ejecuta el efecto para `{id: 20}`.

(Ese no es para nada el caso.)

Con este modelo mental, puedes pensar que la limpieza "ve" el valor viejo de props porque corre antes que volvamos a renderizar, y luego el nuevo effecto "ve" el nuevo valor de las propiedades porque corre después de volver a renderizar. Ese es el modelo mental tomado directamente de los métodos de ciclo de vida de las clases, y **no es acertado en este caso**. Veamos por qué.

React ejecuta los efectos solamente después de [dejar el navegador pintar su contenido](https://medium.com/@dan_abramov/this-benchmark-is-indeed-flawed-c3d6b5b6f97f). Esto hace que tu aplicación sea más rápida pues la mayoría de efectos no necesitan bloquear actualizaciones de pantalla. La limpieza del efecto también es retardada. **El effect previo es limpiado _después_ del re-render con las nuevas propiedades:**

* **React renderiza la UI para `{id: 20}`.**
* El navegador dibuja. Vemos la UI para `{id: 20}` en la pantalla.
* **React limpia el effect con valor `{id: 10}`.**
* React corre el effect para `{id: 20}`. 

Te estarás preguntando: pero ¿cómo puede el método de limpieza del render anterior "ver" el viejo valor de propiedades `{id: 10}` si es ejecutado *después* de que las propiedades cambiaran a `{id: 20}`?

Ya hemos estado aquí antes... 🤔

![Deja vu (escena del gato de la película Matrix)](./deja_vu.gif)

Citando a la sección anterior:

>Cada función dentro del render de un componente (incluyendo manejadores de eventos, effects, timeouts o llamadas al API desde dentro) captura las propiedades y el estado de la llamada de render que los definió.

¡Ahora la respuesta está clara! El método de limpieza del effect no lee las "últimas" propiedades, lo que sea que eso signifique. Lee las propiedades que pertenecen al render en el que fueron definidas:

```jsx{8-11}
// Primer render, props son {id: 10}
function Example() {
  // ...
  useEffect(
    // Effect del primer render
    () => {
      ChatAPI.subscribeToFriendStatus(10, handleStatusChange);
      // Función de limpieza del primer render
      return () => {
        ChatAPI.unsubscribeFromFriendStatus(10, handleStatusChange);
      };
    }
  );
  // ...
}

// Siguiente render, las props son {id: 20}
function Example() {
  // ...
  useEffect(
    // Effect del segundo render
    () => {
      ChatAPI.subscribeToFriendStatus(20, handleStatusChange);
      // Función de limpieza del segundo render
      return () => {
        ChatAPI.unsubscribeFromFriendStatus(20, handleStatusChange);
      };
    }
  );
  // ...
}
```

Reinados ascenderán y caerán, el Sol desprenderá sus capas externas para convertirse en una enana  blanca, y la última civilización llegará a su final. Pero nada hará que las propiedades "vistas" por el effect del primer render limpien algo diferente a `{id: 10}`.

Eso es lo que le permite a React tratar con effects justo después del dibujado — y hacer que tus aplicaciones sean rápidas por definición. Las propiedades viejas están allí si nuestro código las necesita.

## Sincronización Y No Ciclo De Vida

Una de mis cosas favoritas sobre React es que unifica la descripción del resultado y las propiedades del render inicial. Esto [reduce la entropía](https://overreacted.io/the-bug-o-notation/) de tu programa.

Digamos que mi componente se ve como esto:

```jsx
function Greeting({ name }) {
  return (
    <h1 className="Greeting">
      Hello, {name}
    </h1>
  );
}
```

No importa si renderizo `<Greeting name="Dan" />` y luego `<Greeting name="Yuzhi" />`, o si simplemente renderizo `<Greeting name="Yuzhi" />`. Al final, veremos "Hello, Yuzhi" en ambos casos.

Algunos dicen: "Lo importante es el camino, no el destino". Con React, es lo contrario. **Lo importante es el destino, no el camino.** Esa es la diferencia entre las llamadas a `$.addClass` y `$.removeClass` en jQuery (nuestro "camino") y el especificar cuál es la clase de CSS que *debe ser* en React (nuestro "destino")l

**React sincroniza el DOM de acuerdo al valor actual de las propiedades y el estado.** No hay distinción entre "montar" o "actualizar" cuando se trata de renderizar.

Debes ver a los effects de una forma similar. **`useEffect` te permite _sincronizar_ cosas fuera del árbol de React con base en las propiedades y el estado.**

```jsx{2-4}
function Greeting({ name }) {
  useEffect(() => {
    document.title = 'Hello, ' + name;
  });
  return (
    <h1 className="Greeting">
      Hello, {name}
    </h1>
  );
}
```

Esto es sutilmente diferente del modelo mental de *montar/actualizar/desmontar* al que estamos familiarizados. Es importante realmente internalizar esta idea. **Si estás intentando escribir un effect que se comporta diferente dependiendo de si el componente está siendo renderizado por primera vez o no, ¡entonces estás nadando contra corriente!** Estamos fallando si nuestro resultado dependen del "camino" y no del "destino".

No debiera importar si renderizamos con las propiedades A, B y C, o si renderizamos inmediatamente C. Aún cuando puede haber unas diferencias temporales (por ejemplo, mientras obtenemos datos), eventualmente el resultado final debe ser el mismo.

Aun así, es claro que ejecutar todos los effects en *cada* render puede ser ineficiente. (Y en algunos casos, llevará a bucles infinitos.)

Entonces, ¿cómo arreglamos esto?

## Entrenando A React A Diferenciar Tus Effects

Ya hemos aprendido esta lección con el DOM. En lugar de cambiarlo en cada renderizado, React solo actualiza las partes del DOM que cambiaron.

Cuando estás actualizando de

```jsx
<h1 className="Greeting">
  Hello, Dan
</h1>
```

a

```jsx
<h1 className="Greeting">
  Hello, Yuzhi
</h1>
```

React ve dos objetos:

```jsx
const oldProps = {className: 'Greeting', children: 'Hello, Dan'};
const newProps = {className: 'Greeting', children: 'Hello, Yuzhi'};
```

Va por cada una de sus propiedades y determina que `children` ha cambiado y necesita una actualización del DOM, pero `className` no cambió. Por lo que puede hacer solamente:

```jsx
domNode.innerText = 'Hello, Yuzhi';
// Sin necesidad de actualizar domNode.className
```

**¿Podemos hacer algo similar con los effects? Sería bueno poder evitar volver a ejecutarlos si no son necesarios**

Por ejemplo, tal vez nuestro componente re-renderiza a causa del cambio en un estado:

```jsx{11-13}
function Greeting({ name }) {
  const [counter, setCounter] = useState(0);

  useEffect(() => {
    document.title = 'Hello, ' + name;
  });

  return (
    <h1 className="Greeting">
      Hello, {name}
      <button onClick={() => setCounter(count + 1)}>
        Increment
      </button>
    </h1>
  );
}
```

Pero nuestro effect no utilizar el estado `counter`. **Nuestro effect sincroniza el `document.title` con la propiedad `name` pero dicha propiedad es la misma.** Re-asignar `document.title` por cada contador no parece algo ideal.

Está bien, entonces ¿puede React simplemente... diferenciar entre sus effects?


```jsx
let oldEffect = () => { document.title = 'Hello, Dan'; };
let newEffect = () => { document.title = 'Hello, Dan'; };
// Puede React ver que estas funciones están haciendo la misma cosa?
```

No realmente. React no puede adivinar qué es lo que hace la función sin llamarla. (La implementación no contiene valores específicos, solamente utiliza el valor de la propiedad `name`)

Esta es la razón por la cual si deseas evitar re-ejecutar effects de manera innecesaria, puedes proporcionar un arreglo de dependencias (también conocido como "deps") en `useEffect`:

```jsx{3}
  useEffect(() => {
    document.title = 'Hello, ' + name;
  }, [name]); // Nuestras dependencias
```

**Es como si le dijeramos a React: "Hey, ya sé que no puedes ver _adentro_ de esta función, pero te prometo que solamente utiliza `name` y nada más de las propiedades de ese render."**

Si cada uno de estos valores es el mismo entre la ejecución del effect actual y el anterior, entonces no hay nada que sincronizar y React puede ignorar ese effect:

```jsx
const oldEffect = () => { document.title = 'Hello, Dan'; };
const oldDeps = ['Dan'];

const newEffect = () => { document.title = 'Hello, Dan'; };
const newDeps = ['Dan'];

// React no puede ver adentro de las funciones, pero puede comparar sus dependencias
// Dado que todas las dependencias son las mismas, no necesita ejecutar el `nuevo effect`
```

Si tan solo uno de los valores en el arreglo de dependencias es diferente entre renders, entonces no debemos ignorar el `useEffect`. ¡Sincroniza todo!

## No Le Mientas a React Sobre Las Dependencias

Mentirle a React sobre las dependencias tiene malas consecuencias. Intuitivamente, puede parecer lógico hacerlo, pero he visto casi a todos los que usan `useEffect` aplicando el modelo mental de clases tratar de hacer trampa. (¡Yo también lo hice al inicio!)

```jsx
function SearchResults() {
  async function fetchData() {
    // ...
  }

  useEffect(() => {
    fetchData();
  }, []); // ¿Es correcto hacer esto? No siempre -- y hay una mejor forma de escribirlo

  // ...
}
```

*(El [FAQ de Hooks](https://reactjs.org/docs/hooks-faq.html#is-it-safe-to-omit-functions-from-the-list-of-dependencies) explica qué hacer en estos casos. Vamos a volver a revisar este ejemplo [abajo](#moving-functions-inside-effects).)*

"¡Pero yo solo quiero ejecutarlo cuando se monte el componente!", podrías decir. Por ahora, recuerda: si especificas dependencias, **_todos_ los valores dentro de tu componente que son utilizados por el effect _deben_ estar allí**. Incluyendo propiedades, estado, funciones — cualquier cosa en tu componente.

En ocasiones cuando lo haces, ocasiona un problema. Por ejemplo, puede ser que hayas visto un ciclo infinito al traer datos, o un socket que es creado con mucha frecuencia. **La solución a ese problema _no_ es remover la dependencia.** Pronto veremos cuáles son las soluciones.

Pero antes de saltar a las soluciones, entendamos el problema.

## Lo Que Sucede Cuando Las Dependencias Mienten

Si las dependencias contienen cada valor utilizado por el effect, React sabe cuando correrlo de nuevo:

```jsx{3}
  useEffect(() => {
    document.title = 'Hello, ' + name;
  }, [name]);
```

![Diagrama de effects remplazándose entre si](./deps-compare-correct.gif)

*(Las dependencias son diferentes, entonces ejecutamos de nuevo el effect)*

Pero si especificamos `[]` para este effect, la nueva función effect no se ejecutaría:

```jsx{3}
  useEffect(() => {
    document.title = 'Hello, ' + name;
  }, []); // Incorrecto: name hace falta en las dependencias
```

![Diagrama de effects remplazándose entre si](./deps-compare-wrong.gif)

*(Las dependencias son iguales, entonces ignoramos este effect.)*

En este caso, el problema puede parecer obvio. Pero la intuición puede engañarte en otras ocasiones cuando una solución que usarías para classes "salta" de tu memoria.

Por ejemplo, digamos que estamos escribiendo un contador que incrementa cada segundo. En el caso de una clase, nuestra intuición es: "Definir el intervalo una vez y destruirlo una vez". Aquí hay un [ejemplo](https://codesandbox.io/s/n5mjzjy9kl) de cómo podemos hacerlo. Cuando traducimos mentalmente este código a `useEffect`, instintivamente agregamos `[]` a las dependencias. "Quiero que se ejecute solo una vez", ¿cierto?

```jsx{9}
function Counter() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setCount(count + 1);
    }, 1000);
    return () => clearInterval(id);
  }, []);

  return <h1>{count}</h1>;
}
```

Sin embargo, este ejemplo [solo *incrementa* una vez](https://codesandbox.io/s/91n5z8jo7r). *Rayos.*

Si tu modelo mental es "las dependencias me permiten especificar cuando quiero volver a llamar al effect", este ejemplo te debe estar ocasionando una crisis existencial. Tú *quieres* llamarlo una vez porque es un interval — entonces ¿por qué no está funcionando?

Sin embargo, esto hace sentido si sabes que las dependencias son nuestra pista para reaccionar a *todo* lo que el efecto usa dentro del alcance del render. Usa `count` pero mentimos diciendo que no lo usa cuando pusimos `[]`. ¡Solo es cuestión de tiempo para que nos muerda!

En el primer render, `count` es `0`. Por lo tanto, `setCount(count + 1)` en el effect del primer render es `setCount(0 + 1)`. **Dado que nunca volvemos a ejecutar el effect a causa de `[]` en las dependencias, el interval continuará llamando `setCount(0 + `)` cada segundo:**

```jsx{8,12,21-22}
// Primer render, el estado es 0
function Counter() {
  // ...
  useEffect(
    // Effect del primer render
    () => {
      const id = setInterval(() => {
        setCount(0 + 1); // Siempre setCount(1)
      }, 1000);
      return () => clearInterval(id);
    },
    [] // Nunca se vuelve a ejecutar
  );
  // ...
}

// Para cada render siguiente, el estado es 1
function Counter() {
  // ...
  useEffect(
    // Este effect siempre será ignorado porque
    // le mentimos a React al colocar [] en las dependencias
    () => {
      const id = setInterval(() => {
        setCount(1 + 1);
      }, 1000);
      return () => clearInterval(id);
    },
    []
  );
  // ...
}
```

Le mentimos a React al decirle que nuestro effect no depende de un valor dentro de nuestro componente, ¡cuando de hecho si lo hace!

Nuestro effect usa `count` — un valor que existe adentro de nuestro componente (pero fuera del effect):

```jsx{1,5}
  const count = // ...

  useEffect(() => {
    const id = setInterval(() => {
      setCount(count + 1);
    }, 1000);
    return () => clearInterval(id);
  }, []);
```

Por lo tanto, al especificar `[]` como dependencia creamos un error. React va a comparar las dependencias y va a ignorar actualizar este effect:

![Diagrama de un intervalo con closure incorrecto](./interval-wrong.gif)

*(Las dependencias son iguales, entonces nos saltamos la ejecución del effect)*

Problemas como estos son difíciles de conceptualizar. Por lo tanto, les recomiendo que adopten como una regla de manera estricta siempre ser honestos sobre las dependencias de sus effects y especificarlas todas. (Proveemos una [regla de lint](https://github.com/facebook/react/issues/14920) si quieres forzar esto en tu equipo.)

## Dos Formas De Ser Honestos Acerca De Las Dependencias

Existen dos estrategias para ser honestos acerca de las dependencias. En principio, deberías iniciar siempre con la primera estrategia, y luego aplicar la segunda si fuera necesario.

**La primera estrategia es corregir el arreglo de dependencias haciendo que incluya _todos_ los valores dentro del componente que son usados por el effect.** Incluyamos `count` como dependencia:

```jsx{3,6}
useEffect(() => {
  const id = setInterval(() => {
    setCount(count + 1);
  }, 1000);
  return () => clearInterval(id);
}, [count]);
```

Esto hace que el arreglo de dependencias esté correcto. Puede que no sea *ideal*, pero ese es el primer problema que debíamos arreglar. Ahora un cambio en `count` hará que se vuelva a ejecutar el effect, haciendo que cada interval se refiera al `count` de su render en `setCount(count + 1)`:

```jsx{8,12,24,28}
// Primer render, el estado es 0
function Counter() {
  // ...
  useEffect(
    // Effect del primer render
    () => {
      const id = setInterval(() => {
        setCount(0 + 1); // setCount(count + 1)
      }, 1000);
      return () => clearInterval(id);
    },
    [0] // [count]
  );
  // ...
}

// Segundo render, el valor de count es 1
function Counter() {
  // ...
  useEffect(
    // Effect del segundo render
    () => {
      const id = setInterval(() => {
        setCount(1 + 1); // setCount(count + 1)
      }, 1000);
      return () => clearInterval(id);
    },
    [1] // [count]
  );
  // ...
}
```

Eso podría [arreglar el problema](https://codesandbox.io/s/0x0mnlyq8l), pero nuestro intervalo sería limpiado y re-definido cada vez que `count` cambie. Eso puede ser indeseable:

![Diagrama de intervalo que se re-suscribe](./interval-rightish.gif)

*(Las dependencias son diferentes, entonces ejecutamos de nuevo el effect.)*

---

**La segunda estrategia es cambiar el código de nuestro effect de manera que no *necesite* un valor que cambie más frecuente de lo que queremos.** No queremos mentir acerca de las dependencias — solo queremos cambiar nuestro effect para que tenga *menos*.

Veamos algunas técnicas comunes para remover dependencias.

---

## Haciendo Que Los Effects Sean Auto-Suficientes

Queremos que `count` ya no sea una dependencia de nustro effect.

```jsx{3,6}
  useEffect(() => {
    const id = setInterval(() => {
      setCount(count + 1);
    }, 1000);
    return () => clearInterval(id);
  }, [count]);
```

Para lograrlo, debemos preguntarnos: **¿Para qué estamos usando `count`?** Parece que solo lo estamos utilizando en la llamada a `setCount`. En este caso, no necesitamos contar con `count` en este contexto. Cuando queremos actualizar el estado con base en su valor anterior, podemos usar la [forma funcional](https://reactjs.org/docs/hooks-reference.html#functional-updates) de `setState`:

```jsx{3}
  useEffect(() => {
    const id = setInterval(() => {
      setCount(c => c + 1);
    }, 1000);
    return () => clearInterval(id);
  }, []);
```

Me gusta conceptualizar estos casos como "falsas dependencias". Si, `count` era una dependencia necesaria porque estábamos usando `setCount(count + 1)` adentro del effect. Sin embargo, en realidad solo necesitamos `count`  para transformarlo en `count + 1` y "mandarlo de vuelta" a React. Pero React *ya tiene* el valor actual de `count`. **Todo lo que necesitamos decirle a React es que incremente el estado — cualquiera que sea justo ahora.**

Eso es justo lo que `setCount(c => c + 1)` hace. Puedes verlo como "enviarle una instrucción" a React acerca de cómo debe cambiar el estado. Esta "forma de actualización" también ayuda en otros casos, como cuando tienes que [agrupar múltiples actualizaciones](/react-as-a-ui-runtime/#batching).

**Notar que de hecho _cumplimos_ con remover la dependencia. No hicimos trampa. Nuestro effect ya no lee el valor de `counter` dentro del alcance de este render:**

![Diagrama de un interval que funciona](./interval-right.gif)

*(Las dependencias son iguales, ignoramos este effect)*

Puedes verlo funcionando [aquí](https://codesandbox.io/s/q3181xz1pj).

Aun cuando este effect solo se ejecuta una  vez, el callback del interval que pertenece al primer render es perfectamente capaz de enviar la instrucción de actualización `c => c + 1` cada vez que el intervalo se dispare. Ya no necesita saber el valor actual del `counter`. React ya lo sabe.

## Actualizaciones A Través De Funciones Y Google Docs


¿Recuerdan que dijimos que la sincronización era el modelo mental para los effects? Un aspecto interesante de la sincronización es que frecuentemente se quiere que los "mensajes" entre sistemas estén desenredados de su estado. Por ejemplo, al editar un documento en Google Docs no se envía *toda* la página al servidor. Eso sería muy ineficiente. En su lugar, envía una representación de lo que el usuario intentó hacer.

Aun cuando nuestro caso de uso es diferente, podemos aplicar una filosofía similar a los effects. **Ayuda enviar solo la información mínima necesaria desde dentro de los effects hacia el componente.** La forma de actualización `setCount(c => c + 1)` transmite estrictamente menos información que `setCount(count + 1)` porque no está "contaminada" con el valor actual de count. Solo expresa la acción ("incrementar"). Pensar en React involucra [encontrar el estado mínimo](https://reactjs.org/docs/thinking-in-react.html#step-3-identify-the-minimal-but-complete-representation-of-ui-state). Este es el mismo principio, pero para actualizaciones.

Codificar la *intención* (en lugar del resultado) es similar a la manera en que Google Docs [resuelve](https://medium.com/@srijancse/how-real-time-collaborative-editing-work-operational-transformation-ac4902d75682) la edición colaborativa. Mientras que estas es una analogía bastante ajustada, las actualizaciones a través de funciones juegan un rol similar en React. Estas se aseguran que actualizaciones desde diferentes fuentes (manejadores de eventos, suscripciones a effects, etc) puedan ser aplicadas correctamente en lote y de manera predictiva.

**Sin embargo, incluso `setCount(c => c + 1)` no es lo mejor.** Se ve un poco raro y también es muy limitado. Por ejemplo, si tuviéramos dos variables de estado que dependieran una de la otra, o si tuviéramos que calcular el siguiente  estado con base en una propiedad, no nos ayudaría. Por suerte, `setCount(c => c + 1)` tiene un patrón hermano que es más poderoso. Su nombre es `useReducer`.

## Desasociando Actualizaciones de las Acciones

Modifiquemos el ejemplo previo de manera que tengamos dos variables en el estado: `count` y `step`. Nuestro intervalo va a incrementar count con el valor ingresado en el input para `step`:

```jsx{7,10}
function Counter() {
  const [count, setCount] = useState(0);
  const [step, setStep] = useState(1);

  useEffect(() => {
    const id = setInterval(() => {
      setCount(c => c + step);
    }, 1000);
    return () => clearInterval(id);
  }, [step]);

  return (
    <>
      <h1>{count}</h1>
      <input value={step} onChange={e => setStep(Number(e.target.value))} />
    </>
  );
}
```

(Aquí hay un [demo](https://codesandbox.io/s/zxn70rnkx).)

Notar que **no estamos haciendo trampa**. Dado que comencé a usar `step` adentro del effect, lo agregué a las dependencias. Y esa es la razón del por qué el código se ejecuta correctamente.

El comportamiento actual en este ejemplo es que cuando cambio el `step` se reinicia el interval — porque es una de sus dependencias. Y en muchos casos, ¡eso es justo lo que quieres! No hay nada de malo con desarmar un effect y armarlo de nuevo, y no deberíamos evitarlo a menos que tengamos una buena razón para hacerlo.

Sin embargo, digamos que queremos que el reloj del intervalo no se resetee cuando cambie `step`. ¿Cómo quitamos a `step` de nuestras dependencias?

**Cuando el valor de una variable de estado depende del valor actual de otra variable  de estado, puede que quieras reemplazar ambas por `useReducer`.**

Cuando te encuentres escribiendo `setSomething(something => ...)`, es un buen momento para considerar usar en su lugar un reducer. Los reducers te permiten **desasociar las "acciones" que sucedieron en tu componente de cómo el estado debe actualizarse en respuesta a esas acciones**.

Intercambiemos la dependencia `step` por una dependencia de `dispatch` en nuestro efecto:

```jsx{1,6,9}
const [state, dispatch] = useReducer(reducer, initialState);
const { count, step } = state;

useEffect(() => {
  const id = setInterval(() => {
    dispatch({ type: 'tick' }); // En lugar de setCount(c => c + step);
  }, 1000);
  return () => clearInterval(id);
}, [dispatch]);
```

(Ver la [demo](https://codesandbox.io/s/xzr480k0np).)

Me puedes preguntar: "¿Cómo es que esto es mejor?" La respuesta es que **React garantiza que la función `dispatch` es constante a lo largo de la vida del componente. Entonces el ejemplo anterior no necesita nunca volver a resuscribir el intervalo.**

¡Resolvimos nuestro problema!

*(Puedes omitir `dispatch`, `setState` y `useRef` de las dependencias porque React garantiza que son estáticas. De cualquier modo, no causaremos ningún daño si lo hacemos)*

En lugar de leer el estado *dentro* del effect, dispara una *acción* que codifica la información acerca de *qué sucedió*. Esto le permite a nuestro effect mantenerse desasociado del estado `step`. A nuestro effect no le importa *cómo* actualizamos el estado, solo nos dice *lo que sucedió*. Y el reducer centraliza la lógica de actualización:

```jsx{8,9}
const initialState = {
  count: 0,
  step: 1,
};

function reducer(state, action) {
  const { count, step } = state;
  if (action.type === 'tick') {
    return { count: count + step, step };
  } else if (action.type === 'step') {
    return { count, step: action.step };
  } else {
    throw new Error();
  }
}
```

(Aquí hay una [demo](https://codesandbox.io/s/xzr480k0np) en caso de que no la hayas visto antes).

## Por Qué useReducer Es La Modalidad Tramposa De Los Hooks

Ya vimos cómo remover dependencias cuando un effect necesita actualizar algún estado con base en un estado previo o con base en otro estado. **Pero ¿qué pasa si necesitamos de _propiedades_ para calcular el valor del estado?** Por ejemplo, tal vez nuestra API es `<Counter step={1} />`. Seguramente, en este caso no podemos evitar especificar `props.step` en las dependencias, ¿o si podemos?

¡Si podemos! Podemos colocar *la función reducer* dentro de nuestro componente para que pueda leer las propiedades:

```jsx{1,6}
function Counter({ step }) {
  const [count, dispatch] = useReducer(reducer, 0);

  function reducer(state, action) {
    if (action.type === 'tick') {
      return state + step;
    } else {
      throw new Error();
    }
  }

  useEffect(() => {
    const id = setInterval(() => {
      dispatch({ type: 'tick' });
    }, 1000);
    return () => clearInterval(id);
  }, [dispatch]);

  return <h1>{count}</h1>;
}
```

Este patrón nos impide realizar algunas optimizaciones entonces trata de no utilizarlo siempre, pero definitivamente puedes acceder a las propiedades desde un reducer si asi lo necesitas. (Aquí hay una [demo](https://codesandbox.io/s/7ypm405o8q).)

**Aún en este caso, está garantizado que `dispatch` será estable entre re-renders.** Por lo tanto, puedes omitirla de las dependencias si así lo deseas. No va a causar que el effect vuelva a ejecutarse.

Puede que te estés preguntando: ¿cómo puede ser que esto funcione? ¿Cómo puede ser que el reducer "conozca" las propiedades cuando se le está llamando desde dentro de un effect que pertenece a otro render? La respuesta es que cuando tu `dispatch`, React recuerda la acción — pero va a *llamar* tu reducer durante el siguiente render. En ese punto, el valor actualizado de las propiedades estará en contexto, y tu no estarás dentro de un effect.

**Esta es la razón del por qué me gusta pensar que `useReducer` es la forma tramposa de Hooks. Me permite desacoplar la lógica de actualización del describir qué pasó. Esto, a su vez, permite remover dependencias innecesarias de mis effects y prevenir que se vuelvan a ejecutar más de lo necesario.**

## Moviendo Funciones Dentro De Effects

Un error común es pensar que las funciones no deben ser dependencias. Por ejemplo, esto pareciera que debe funcionar bien:

```jsx{13}
function SearchResults() {
  const [data, setData] = useState({ hits: [] });

  async function fetchData() {
    const result = await axios(
      'https://hn.algolia.com/api/v1/search?query=react',
    );
    setData(result.data);
  }

  useEffect(() => {
    fetchData();
  }, []); // Está correcto?

  // ...
```

*([Este ejemplo](https://codesandbox.io/s/8j4ykjyv0) está adaptado de un excelente artículo escrito por Robin Wieruch — [¡dale un vistazo!](https://www.robinwieruch.de/react-hooks-fetch-data/)!)*

Y solo para aclarar, este código *funciona*. **Pero el problema con omitir funciones locales es que se vuelve muy difícil determinar si estamos considerando todos los casos mientras el componente crece.**

Imagina que nuestro código está partido de esta manera y que cada función es cinco veces más larga:

```jsx
function SearchResults() {
  // Imagina que esta función es extensa
  function getFetchUrl() {
    return 'https://hn.algolia.com/api/v1/search?query=react';
  }

  // Imagina que esta función también es extensa
  async function fetchData() {
    const result = await axios(getFetchUrl());
    setData(result.data);
  }

  useEffect(() => {
    fetchData();
  }, []);

  // ...
}
```

Ahora digamos que más adelante usamos estado o propiedades en una de estas funciones:

```jsx{6}
function SearchResults() {
  const [query, setQuery] = useState('react');

  // Imagina que esta función es extensa
  function getFetchUrl() {
    return 'https://hn.algolia.com/api/v1/search?query=' + query;
  }

  // Imagina que esta función también es extensa
  async function fetchData() {
    const result = await axios(getFetchUrl());
    setData(result.data);
  }

  useEffect(() => {
    fetchData();
  }, []);

  // ...
}
```

Si olvidamos actualizar las dependencias de cualquiera de los effects que llaman a estas funciones (posiblemente, ¡a través de otras funciones!), nuestros effects fallarán al sincronizar cambios de nuestras propiedades o estado. Eso no suena bien.

Por fortuna, hay una solución fácil a este problema. **Si solo usas una función *adentro* de un effect, mueve la función *adentro* del effect:**

```jsx{4-12}
function SearchResults() {
  // ...
  useEffect(() => {
    // Movimos las funciones adentro del effect
    function getFetchUrl() {
      return 'https://hn.algolia.com/api/v1/search?query=react';
    }

    async function fetchData() {
      const result = await axios(getFetchUrl());
      setData(result.data);
    }

    fetchData();
  }, []); // ✅ Las dependencias están OK
  // ...
}
```

([Aquí tenemos una demo](https://codesandbox.io/s/04kp3jwwql).)

Entonces, ¿cuál es el beneficio? Ya no debemos pensar sobre las "dependencias transitivas". Nuestro arreglo de dependencias ya no está mintiendo: **de verdad _no estamos_ usando nada fuera del contexto de nuestro effect**.

Si más tarde editamos `getFetchUrl` para que use el estado `query`, es mucho más probable que notemos que la estamos editando *dentro* de un effect — y por lo tanto, que debemos agregar `query` a las dependencias:

```jsx{6,15}
function SearchResults() {
  const [query, setQuery] = useState('react');

  useEffect(() => {
    function getFetchUrl() {
      return 'https://hn.algolia.com/api/v1/search?query=' + query;
    }

    async function fetchData() {
      const result = await axios(getFetchUrl());
      setData(result.data);
    }

    fetchData();
  }, [query]); // ✅ Las dependencias están OK

  // ...
}
```

(Aquí hay una [demo](https://codesandbox.io/s/pwm32zx7z7).)

Al agregar esta dependencia, no es que solo estemos "complaciendo a React". *Hace sentido* volver a obtener los datos cuando query cambia. **El diseño de `useEffect` te forza a notar el cambio en el flujo de datos y elegir cómo deben sincronizarlo — en lugar de ignorarlo hasta que nuestros usuarios encuentren un error.**

Gracias a la regla de lint `exhaustive-deps` del plugin `eslint-plugin-react-hooks`, puedes [analizar los effects mientras vas escribiendo en tu editor](https://github.com/facebook/react/issues/14920) y recibir sugerencias acerca de cuáles dependencias hacen falta. En otras palabras, una máquina puede decirte cuáles cambios en el flujo de datos no están siendo manejados correctamente en tu componente.

![Gif de una regla de lint](./exhaustive-deps.gif)

Muy bien.

## Pero No Puedo Poner Esta Función Adentro Del Effect

Algunas veces puede que no quieras mover una función *adentro* de un effect. Por ejemplo, pueda que varios effects del componente llamen a la misma función, y no quieres copiar y pegar su lógica. O tal vez es una propiedad.

¿Debes excluir una función como esta de las dependencias? Creo que no. De nuevo, **los effects no deben mentir acerca de sus dependencias.** Regularmente hay mejores soluciones. Un error típico es creer que "una función nunca va a cambiar". Pero tal como hemos aprendido a lo largo de este artículo, nada puede estar más lejos de la realidad. En efecto, ¡una función definida dentro de un componente cambia con cada render!

**Eso por si mismo presenta un problema.** Digamos que dos effects invocan `getFetchUrl`:

```jsx
function SearchResults() {
  function getFetchUrl(query) {
    return 'https://hn.algolia.com/api/v1/search?query=' + query;
  }

  useEffect(() => {
    const url = getFetchUrl('react');
    // ... Obtener datos y hacer algo con ellos ...
  }, []); // 🔴 Falta una dependencia: getFetchUrl

  useEffect(() => {
    const url = getFetchUrl('redux');
    // ... Obtener datos y hacer algo con ellos ...
  }, []); // 🔴 Falta una dependencia: getFetchUrl

  // ...
}
```

En ese caso pueda que no quieras mover `getFetchUrl` adentro de ninguno de los effects pues no podrías reutilizar su lógica.

Por otro lado, si eres "honesto" acerca de las dependencias del effect, te encontraras con un problema. Dado que ambos effects dependen de `getFetchUrl` **(el cual cambia con cada render)** nuestros arreglos de dependencias son inútiles:

```jsx{2-5}
function SearchResults() {
  // 🔴 Hace que cada effect se ejecute en cada render
  function getFetchUrl(query) {
    return 'https://hn.algolia.com/api/v1/search?query=' + query;
  }

  useEffect(() => {
    const url = getFetchUrl('react');
    // ... Obtener datos y hacer algo con ellos ...
  }, [getFetchUrl]); // 🚧 Las dependencias están correctas, pero cambian demasiado frecuente

  useEffect(() => {
    const url = getFetchUrl('redux');
    // ... Obtener datos y hacer algo con ellos ...
  }, [getFetchUrl]); // 🚧 Las dependencias están correctas, pero cambian demasiado frecuente

  // ...
}
```

Una solución tentadora puede ser no incluir la función `getFetchUrl` en la lista de dependencias. Sin embargo, no creo que esa sea una buena solución. Hacer eso haría difícil notar cuando *estamos* agregando un cambio al flujo de datos que *necesita* ser manejado por un effect. Esto nos lleva a errores como "un interval que nunca se actualiza"  que vimos antes.

En lugar de eso, hay otras dos soluciones que son más simples.

**Primero que nada, si una función no utiliza nada del contexto del componente, puedes colocarla afuera del componente y luego usarla libremente en tus effects:**

```jsx{1-4}
// ✅ No está influenciada por el flujo de datos
function getFetchUrl(query) {
  return 'https://hn.algolia.com/api/v1/search?query=' + query;
}

function SearchResults() {
  useEffect(() => {
    const url = getFetchUrl('react');
    // ... Obtener datos y hacer algo con ellos ...
  }, []); // ✅ Dependencias correctas

  useEffect(() => {
    const url = getFetchUrl('redux');
    // ... Obtener datos y hacer algo con ellos ...
  }, []); // ✅ Dependencias correctas

  // ...
}
```

No hay necesidad de especificarla en las dependencias porque no está en el contexto del render y no puede ser afectada por el flujo de datos. No puede iniciar a depender de estado o propiedades accidentalmente.

Alternativamente, puedes encerrarla en el [`useCallback` Hook](https://reactjs.org/docs/hooks-reference.html#usecallback):


```jsx{2-5}
function SearchResults() {
  // ✅ Preserva su identidad cuando sus propias dependencias son iguales
  const getFetchUrl = useCallback((query) => {
    return 'https://hn.algolia.com/api/v1/search?query=' + query;
  }, []);  // ✅ Dependencias OK

  useEffect(() => {
    const url = getFetchUrl('react');
    // ... Obtener datos y hacer algo con ellos ...
  }, [getFetchUrl]); // ✅ Dependencias OK

  useEffect(() => {
    const url = getFetchUrl('redux');
    // ... Obtener datos y hacer algo con ellos ...
  }, [getFetchUrl]); // ✅ Dependencias OK

  // ...
}
```

`useCallback` es esencialmente como si agregáramos otra capa de chequeo de dependencias. Es resolver el problema por el otro lado — **en lugar de omitir una función en las dependencias, hacemos que la función solo cambie cuando sea necesario**.

Veamos por qué este enfoque es útil. Previamente, nuestro ejemplo mostraba dos resultados de búsqueda (para las búsquedas `'react'` y `'redux'`). Pero digamos que queremos agregar un input de manera que puedas buscar por un `query` arbitrario. Entonces en lugar de tomar `query` de un argumento, `getFetchUrl` lo va a tomar del estado.

De inmediato notaremos que le hace falta la dependencia `query`:

```jsx{5}
function SearchResults() {
  const [query, setQuery] = useState('react');
  const getFetchUrl = useCallback(() => { // Sin el argumento query
    return 'https://hn.algolia.com/api/v1/search?query=' + query;
  }, []); // 🔴 Falta la dependencia query
  // ...
}
```

Si arreglo mis dependencias del `useCallback` e incluyo `query`, cualquier effect con `getFetchUrl` en sus dependencias se va a volver a ejecutar cuando `query` cambie:

```jsx{4-7}
function SearchResults() {
  const [query, setQuery] = useState('react');

  // ✅ Preserva su identidad hasta que query cambia
  const getFetchUrl = useCallback(() => {
    return 'https://hn.algolia.com/api/v1/search?query=' + query;
  }, [query]);  // ✅ Dependencias del callback OK

  useEffect(() => {
    const url = getFetchUrl();
    // ... Obtener datos y hacer algo con ellos ...
  }, [getFetchUrl]); // ✅ Dependencias del effect OK

  // ...
}
```

Gracias a `useCallback`, si `query` es el mismo, `getFetchUrl` también se mantiene igual, y nuestro effect no se vuelve a ejecutar. Pero si `query` cambia, `getFetchUrl` también va a cambiar, y vamos a obtener los datos nuevamente. Se parece mucho a cuando cambias una celda en una hoja de Excel, y las otras celdas que la usan se recalculan automáticamente.

Esta es solo una consecuencia de abrazar el flujo de datos y la mentalidad de sincronización. **La misma solución aplica para funciones pasadas como propiedades desde componentes padres:**

```jsx{4-8}
function Parent() {
  const [query, setQuery] = useState('react');

  // ✅ Preserva su identidad hasta que query cambia
  const fetchData = useCallback(() => {
    const url = 'https://hn.algolia.com/api/v1/search?query=' + query;
    // ... Obtener datos y retornarlos ...
  }, [query]);  // ✅ Las dependencias del callback están OK

  return <Child fetchData={fetchData} />
}

function Child({ fetchData }) {
  let [data, setData] = useState(null);

  useEffect(() => {
    fetchData().then(setData);
  }, [fetchData]); // ✅ Dependencias del effect OK

  // ...
}
```

Puesto que `fetchData` solo cambia dentro de `Parent` cuando su estado `query` cambia, nuestro `Child` no va a volver a obtener datos sino hasta que sea necesario.

## ¿Son Las Funciones Parte del Flujo De Datos?

Curiosamente, este patrón está roto en el caso de clases de una manera que realmente pone en evidencia la diferencia entre los paradigmas de effect y ciclo de vida. Considera esta traducción:

```jsx{5-8,18-20}
class Parent extends Component {
  state = {
    query: 'react'
  };
  fetchData = () => {
    const url = 'https://hn.algolia.com/api/v1/search?query=' + this.state.query;
    // ... Obtener datos y hacer algo con ellos ...
  };
  render() {
    return <Child fetchData={this.fetchData} />;
  }
}

class Child extends Component {
  state = {
    data: null
  };
  componentDidMount() {
    this.props.fetchData();
  }
  render() {
    // ...
  }
}
```

Seguro estarás pensando: "Vamos Dan, todos sabemos que `useEffect` es lo mismo que `componentDidMount` y `componentDidUpdate` combinados, ¡ya deja esa cantaleta!" **Aun así, esto no funciona aún con `componentDidUpdate`:**

```jsx{8-13}
class Child extends Component {
  state = {
    data: null
  };
  componentDidMount() {
    this.props.fetchData();
  }
  componentDidUpdate(prevProps) {
    // 🔴 Esta condición nunca será verdadera
    if (this.props.fetchData !== prevProps.fetchData) {
      this.props.fetchData();
    }
  }
  render() {
    // ...
  }
}
```

Claro, `fetchData` ¡es un método de una clase! (O, en cambio, una propiedad de una clase — pero eso no cambia nada.) No va a cambiar para nada aun cuando el estado cambie. Por lo tanto `this.props.fetchData` se mantendrá igual a `prevProps.fetchData` y nunca volveremos a obtener más datos. ¿Y si quitamos esa condición entonces?

```jsx
  componentDidUpdate(prevProps) {
    this.props.fetchData();
  }
```

Un momento, esto hace que obtengamos datos en *cada* render. (Agregar una animación arriba en el árbol es una forma divertida de descubrirlo.) ¿Tal vez debemos usar bind?

```jsx
  render() {
    return <Child fetchData={this.fetchData.bind(this, this.state.query)} />;
  }
```

Pero entonces `this.props.fetchData !== prevProps.fetchData` *siempre* será `true`, ¡aún cuando `query` no cambie! Entonces *siempre* vamos a volver a traer datos.

La única solución real a este dilema usando clases es encararlo y pasar `query` al componente `Child`. `Child` no va a *utilizar* `query` directamente, pero haciendo esto podemos disparar la función que obtiene datos cuando `query` cambia:

```jsx{10,22-24}
class Parent extends Component {
  state = {
    query: 'react'
  };
  fetchData = () => {
    const url = 'https://hn.algolia.com/api/v1/search?query=' + this.state.query;
    // ... Obtener datos y hacer algo con ellos ...
  };
  render() {
    return <Child fetchData={this.fetchData} query={this.state.query} />;
  }
}

class Child extends Component {
  state = {
    data: null
  };
  componentDidMount() {
    this.props.fetchData();
  }
  componentDidUpdate(prevProps) {
    if (this.props.query !== prevProps.query) {
      this.props.fetchData();
    }
  }
  render() {
    // ...
  }
}
```

Después de tantos años de trabajar con clases en React, me he acostumbrado tanto a pasar propiedades innecesarias y romper la encapsulación del componente padre que hasta hace una semana finalmente me di cuenta por qué tenía que hacerlo.

**Con clases, las funciones pasadas en las propiedades no son realmente parte del flujo de datos.** Las funciones se encapsulan en el mutable `this` de manera que no podemos basarnos en que su identidad signifique algo. Por lo tanto, aun cuando solo nos interesa la función, tenemos que pasar otros datos con tal de poder simular el "diff". No podemos saber si `this.props.fetchData` pasado del componente padre depende de un estado o no y si ese estado ha cambiado o no.

**Con `useCallback`, las funciones pueden participar plenamente en el flujo de datos.** Podemos decir que si los parámetros de una función cambiaron, la función como tal ha cambiado, pero si no, se mantiene igual. Gracias a la granularidad que nos brinda `useCallback`, cambios en las propiedades como `props.fetchData` se propagan hacia niveles más bajos de manera automática.

De manera similar, [`useMemo`](https://reactjs.org/docs/hooks-reference.html#usememo) nos permite hacer lo mismo para objetos complejos:

```jsx
function ColorPicker() {
  // No rompe la verificación superficial de la propiedad que realiza Child
  // a menos que color en efecto cambie.
  const [color, setColor] = useState('pink');
  const style = useMemo(() => ({ color }), [color]);
  return <Child style={style} />;
}
```

**Quiero enfatizar que colocar `useCallback` en todos lados es bastante torpe.** Es una buena escotilla de escape y es útil cuando una función se pasa hacia abajo *y* es llamada desde dentro de un effect en uno de los hijos. O si estás tratando de prevenir arruinar memoization de un componente hijo. Sin embargo con los Hooks existen mejores formas de [evitar pasar callbacks hacia abajo](https://reactjs.org/docs/hooks-faq.html#how-to-avoid-passing-callbacks-down).

En los ejemplos anteriores, preferiría que `fetchData` estuviera dentro de mi effect (la cual podría ser extraída a un custom Hook) o en un import de nivel superior. Quiero mantener a los effects simples y los callbacks adentro de ellos no ayudan. (¿Qué pasaría si `props.onComplete` cambia mientras la solicitud al servidor estuviera en proceso?) Puedes [simular el comportamiento de las clases](#nadando-contra-corriente) pero eso no resuelve las condiciones de secuencia.

## Hablando de Condiciones de Secuencia

Un ejemplo típico de obtener datos con clases va más o menos así:

```jsx
class Article extends Component {
  state = {
    article: null
  };
  componentDidMount() {
    this.fetchData(this.props.id);
  }
  async fetchData(id) {
    const article = await API.fetchArticle(id);
    this.setState({ article });
  }
  // ...
}
```

Como ya sabrás, este código es defectuoso. No puede manejar actualizaciones. De manera que el segundo ejemplo clásico que puedes encontrar en internet va algo así:

```jsx{8-12}
class Article extends Component {
  state = {
    article: null
  };
  componentDidMount() {
    this.fetchData(this.props.id);
  }
  componentDidUpdate(prevProps) {
    if (prevProps.id !== this.props.id) {
      this.fetchData(this.props.id);
    }
  }
  async fetchData(id) {
    const article = await API.fetchArticle(id);
    this.setState({ article });
  }
  // ...
}
```

¡Esto es mucho mejor! Pero aún es defectuoso. La razón por la cual es defectuoso es que la llamada al servidor puede suceder en un mal momento. Si estoy solicitando `{id: 10}`, cambio a `{id: 20}`, pero la solicitud de `{id: 20}` viene primero, la solicitud que inició primero pero que terminó después va a remplazar mi estado de manera incorrecta.

A esto es a lo que llamamos una condición de secuencia, y es típico verla en código que mezcla `async` / `await` (que asume que algo espera por el resultado) con flujos de datos de arriba hacia abajo (las propiedades o el estado pueden cambiar mientras estamos ejecutando una función async).

Los effects no resuelven este problema de manera mágica, aunque te van a advertir si intentas pasar una función `async` al effect directamente. (Tenemos que mejorar esa advertencia para que explique mejor los problemas que puede ocasionar.)

Si el enfoque async que utilizas soporta cancelaciones, ¡es excelente! Puedes cancelar tu llamada async justo en la función de limpieza.

Alternativamente, el recurso provisional más fácil es rastrearlo con un boolean:

```jsx{5,9,16-18}
function Article({ id }) {
  const [article, setArticle] = useState(null);

  useEffect(() => {
    let didCancel = false;

    async function fetchData() {
      const article = await API.fetchArticle(id);
      if (!didCancel) {
        setArticle(article);
      }
    }

    fetchData();

    return () => {
      didCancel = true;
    };
  }, [id]);

  // ...
}
```

[Este artículo](https://www.robinwieruch.de/react-hooks-fetch-data/) profundiza en los detalles de cómo puedes manejar errores y estados de carga así como extraer esa lógica en un Hook personalizado. Recomiendo que lo revises si estás interesado en aprender más acerca de obtener datos con Hooks.

## Subiendo el Estándar

Con el modelo mental de ciclo de vida en las clases, los efectos secundarios se comportan diferente que los resultados del render. Renderizar la UI está manejado por las propiedades y el estado y está garantizado que será consistente con ello, pero los efectos secundarios no. Esta es una fuente común de problemas.

Con el modelo mental de `useEffect`, las cosas están sincronizadas por defecto. Los efectos secundarios se vuelven parte del flujo de datos en React. Para cada llamada a `useEffect`, una vez lo hayas comprendido, tu componente maneja los casos extremos mucho mejor.

Sin embargo, el costo de comprenderlo es más alto. Esto puede ser molesto. Escribir código que se sincronice y que maneje casos extremos de manera adecuada es inherentemente más difícil que disparar efectos secundarios eventuales que no son consistentes con el render.

Esto sería preocupante si `useEffect` estuviera diseñado para ser *la* herramienta que usas la mayor parte del tiempo. Sin embargo, es solamente una pieza de bajo nivel. Estamos en una etapa temprana para los Hooks así que todos usamos Hooks de bajo nivel todo el tiempo, especialmente en tutoriales. Pero en la práctica, es probable que la comunidad comience a moverse a Hooks de alto conforme las API van mejorando.

He visto diferentes aplicaciones crear sus propios Hooks como `useFecth` que encapsulan algo de la lógica de autenticación de su app o incluso `useTheme` que usa el contexto del tema. Una vez tengas un set de tus propias herramientas como las ya mencionadas, ya no utilizaras `useEffect` *tan* frecuentemente. Pero la resiliencia que esto trae beneficia a cada Hook construido sobre `useEffect`.

Hasta ahora, `useEffect` es más comúnmente usado para obtener datos. Pero obtener datos no es precisamente un problema de sincronización. Esto es especialmente obvio porque nuestras dependencias normalmente son `[]`. ¿Qué estamos sincronizando?

En el largo plazo, [Suspense para obtener datos](https://reactjs.org/blog/2018/11/27/react-16-roadmap.html#react-16x-mid-2019-the-one-with-suspense-for-data-fetching) le permitirá a librerías de terceros tener de primera mano una forma de decirle a React que suspenda el renderizado hasta que algo async (cualquier cosa: código, datos, imágenes) esté listo.

Mientras Suspense gradualmente cubra más casos para obtener datos, predigo que `useEffect` se va a desvanecer al segundo plano como una herramienta para usuarios avanzados para casos en los que de hecho quieras sincronizar propiedades y estado con algún efecto secundario. A diferencia de obtener datos, puede manejar este caso de manera natural porque para eso fue diseñado. Pero hasta entonces, Hooks personalizados como se [muestran aquí](https://www.robinwieruch.de/react-hooks-fetch-data/) son una buena forma de crear lógica reutilizable para obtener datos.

## Para Concluir

Ahora que sabes prácticamente todo lo que yo se acerca de user effects, revisa el [TLDR](#tldr) del inicio. ¿Hace sentido? ¿Me hizo falta algo? (¡Aún tengo donde escribir!)

¡Me encantaría escuchar de ti en Twitter! Gracias por leerme.
