---
title: Haciendo declarativo setInterval con React Hooks
date: '2019-02-04'
spoiler: Cómo aprendí a dejar de preocuparme y amar las refs. 
---

Si alguna vez jugaste con [React Hooks](https://reactjs.org/docs/hooks-intro.html) por algo màs que unas horas, probablemente hayas caido en el siguiente intrigante problema: usar `setInterval` simplemente [no funciona] (https://stackoverflow.com/questions/53024496/state-not-updating-when-using-react-state-hook-within-setinterval) como esperabas.

En las [palabras](https://mobile.twitter.com/ryanflorence/status/1088606583637061634) de Ryan Florence:

>Muchas personas han tomado nota que setInterval con hooks es una especie de tortazo en la cara de React

Honestamente, pienso que la gente tiene un punto. Que *es* confuso desde el principio.

Pero también he observado que no es un defecto de Hooks sino un desentendimiento entre [el modelo de programación de React](/react-as-a-ui-runtime/) y `setInterval`. Los hooks, que son más cercanos al modelo de programación de React que las clases, hacen el desentendimiento más prominente.

**Pero _hay_ una forma de hacerlos trabajar juntos muy bien, aunque sea un poco menos intuitiva.**

En este post, miraremos el _cómo_ hacer que los intervals y los Hooks funcionen bien juntos, _por qué_ esta solución tiene sentido, y cuales *nuevas* capacidades te puede dar.

-----

**Aviso: este post se enfoca en un _caso patológico_. Aún si una API simplifica cientos de casos de uso, la discusión va a siempre enfocarse en el más difícil.**

Si eres nuevo con Hooks y no entiendes de qué se trata, pegale una mirada a [esta introducción](https://medium.com/@dan_abramov/making-sense-of-react-hooks-fdbde8803889) y a la [documentación](https://reactjs.org/docs/hooks-intro.html). Este artículo asume que trabajaste con hooks más de una hora.

---

## Simplemente muéstrame el código

Sin más preámbulos, aquí hay un contador que aumenta el conteo cada segundo:

```jsx{6-9}
import React, { useState, useEffect, useRef } from 'react';

function Counter() {
  let [count, setCount] = useState(0);

  useInterval(() => {
    // Your custom logic here
    setCount(count + 1);
  }, 1000);

  return <h1>{count}</h1>;
}
```

*(Aquí la [demo en CodeSandbox](https://codesandbox.io/s/105x531vkq).)*

Este `useInterval` no está incorporado como React Hook; es un [Hook customizado](https://reactjs.org/docs/hooks-custom.html) que yo escribí:

```jsx
import React, { useState, useEffect, useRef } from 'react';

function useInterval(callback, delay) {
  const savedCallback = useRef();

  // Remember the latest callback.
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up the interval.
  useEffect(() => {
    function tick() {
      savedCallback.current();
    }
    if (delay !== null) {
      let id = setInterval(tick, delay);
      return () => clearInterval(id);
    }
  }, [delay]);
}
```

*(Aquí la [demo en CodeSandbox](https://codesandbox.io/s/105x531vkq) en caso de que te la hayas perdido antes.)*

**Mi Hook `useInterval` crea un interval y lo limpia tras desmontarse.** E un combo de `setInterval` con `clearInterval` ajustado al ciclo de vida del componente.

Siéntete libre de copiarlo y pegarlo en tu proyecto o ponerlo en NPM.

**Si no te importa cómo funciona, puedes dejar de leer ahora! El resto del artículo es para personas que estan listos para bucear profundo en React Hooks.**

---

## Espera, qué?! 🤔

Ya se lo que estás pensando:

>Dan, código no tiene ningún sentido. Qué pasó con eso de “sólo JavaScript”? Admite que React se volvió infructuoso con Hooks!

**Yo también pensé eso, pero cambié de parecer, y voy a cambiar el tuyo.** Antes de explicar por qué este código tiene sentido, quiero mostrarte lo que puede hacer.

---

## Por qué `useInterval()` es una mejor API


Para recordarte, mi `useInterval` Hook toma una función y un delay:

```jsx
  useInterval(() => {
    // ...
  }, 1000);
```

Esto se ve mucho como `setInterval`:

```jsx
  setInterval(() => {
    // ...
  }, 1000);
```

**Entonces por qué no usar `setInterval` directamente?**

Tal vez no es obvio al principio, pero la diferencia entre el `setInterval` que conoces y mi Hook `useInterval` es que **sus argumentos son “dinámicos”**.

Voy a ilustrarte este punto con un ejemplo.

---

Supongamos que el retraso del interval pueda ser ajustable:

![Contador con un input que ajusta el retraso del interval](./counter_delay.gif)

Mientras tu no debas necesariamente controlar el delay con un *input* ajustarlo dinámicamente puede ser útil - por ejemplo, para traer una actualización de AJAX menos seguido mientras el usuario se cambia a una pestaña diferente.

Entonces, cómo se puede hacer este setInterval en una clase? Yo terminé con esto:

```jsx{7-26}
class Counter extends React.Component {
  state = {
    count: 0,
    delay: 1000,
  };

  componentDidMount() {
    this.interval = setInterval(this.tick, this.state.delay);
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.delay !== this.state.delay) {
      clearInterval(this.interval);
      this.interval = setInterval(this.tick, this.state.delay);
    }
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  tick = () => {
    this.setState({
      count: this.state.count + 1
    });
  }

  handleDelayChange = (e) => {
    this.setState({ delay: Number(e.target.value) });
  }

  render() {
    return (
      <>
        <h1>{this.state.count}</h1>
        <input value={this.state.delay} onChange={this.handleDelayChange} />
      </>
    );
  }
}
```

*(Aquí la [demo en CodeSandbox](https://codesandbox.io/s/mz20m600mp).)*

No está tan mal!

Y cómo se vería la versión con Hooks?

<font size="50">🥁🥁🥁</font>

```jsx{5-8}
function Counter() {
  let [count, setCount] = useState(0);
  let [delay, setDelay] = useState(1000);

  useInterval(() => {
    // Your custom logic here
    setCount(count + 1);
  }, delay);

  function handleDelayChange(e) {
    setDelay(Number(e.target.value));
  }

  return (
    <>
      <h1>{count}</h1>
      <input value={delay} onChange={handleDelayChange} />
    </>
  );
}
```

*(Aquí la [demo en CodeSandbox](https://codesandbox.io/s/329jy81rlm).)*

Si, *eso es todo lo que se necesita*.

A diferencia de la versión con clases, no hay brecha de complegidad para “actualizar” el ejemplo de Hook `useInterval` para que tenga ajuste dinámico de retraso:

```jsx{4,9}
  // Delay constante
  useInterval(() => {
    setCount(count + 1);
  }, 1000);

  // Delay ajustable
  useInterval(() => {
    setCount(count + 1);
  }, delay);
```

Cuando el Hook `useInterval` ve un retraso diferente, configura el interval nuevamente.

**Salvo escribir código para *seleccionar* y *limpiar* el intervalo, yo puedo *declarar* un intervalo con un retraso particular — y nuestro Hook `useInterval` hace que así sea.**

Qué pasa si yo quiero temporalmente *pausar* mi intervalo? Puedo hacerlo con un estado:

```jsx{6}
  const [delay, setDelay] = useState(1000);
  const [isRunning, setIsRunning] = useState(true);

  useInterval(() => {
    setCount(count + 1);
  }, isRunning ? delay : null);
```

*(Aquí la [demo](https://codesandbox.io/s/l240mp2pm7)!)*

Esto es lo que me estimula acerca de los Hooks y React cada vez más. Nosotros podemos envolver una API imperativa existente y crear una API declarativa expresando nuestros deseos más apropiadamente. Exactamente como cuando renderizamos, nosotros podemos **describir el proceso en todos los puntos de tiempo simultáneamente** en lugar de preocuparnos cuidadosamente por los comandos para manipularlo.

---
Espero con esto haber convertido tu Hook `useInterval()` en una API más linda - al menos cuando lo hacemos desde un componente.

**Pero por qué usar `setInterval()` y `clearInterval()` con Hooks?**

Vamos hacia atrás a nuestro ejemplo de contador e intentemos implementarlo manualmente.
---

## Primer intento
Comenzaré con un simple ejemplo en el que sólo rendereo el estado inicial:ç

```jsx
function Counter() {
  const [count, setCount] = useState(0);
  return <h1>{count}</h1>;
}
```
Ahora quiero que el intervalo se incremente cada segundo. Este es un [efecto lateral que necesita limpiarse] (https://reactjs.org/docs/hooks-effect.html#effects-with-cleanup) así que utilizaré `useEffect()` y retornaré una función de limpieza:

```jsx{4-9}
function Counter() {
  let [count, setCount] = useState(0);

  useEffect(() => {
    let id = setInterval(() => {
      setCount(count + 1);
    }, 1000);
    return () => clearInterval(id);
  });

  return <h1>{count}</h1>;
}
```

*(Mira la[demo de CodeSandbox](https://codesandbox.io/s/7wlxk1k87j).)*

Se ve fácil? Parece funcionar.

**Sin embargo, este código tiene un comportamiento extraño.**

React por defecto vuelve a aplicar el effect después de cada render. Esto es intencional y ayuda a evitar [una cantidad enorme de bugs] (https://reactjs.org/docs/hooks-effect.html#explanation-why-effects-run-on-each-update) que se presentan en los componentes con clases de React.

Esto es en realidad bueno porque muchas subscripciones a APIs pueden felizmente remover el viejo listener y agregar uno nuevo cada vez. Sin embargo, `setInterval`no es uno de ellos. Cuando nosotros corremos `clearInterval` y `setInterval` sus tiempos se cambian. Si nosotros volvemos a renderizar y reaplicar effects demasiado seguido, el intervalo nunca tendrá chance de dispararse!

Podemos ver el bug re-renderizando nuestro componente con un *intervalo menor*:

```jsx
setInterval(() => {
  // Re renderiza y re aplica Counter
  // en cada vuelta esto genera un clearInterval()
  // del setInterval() antes de que el intervalo se dispare.
  ReactDOM.render(<Counter />, rootElement);
}, 100);
```

*(ver la [demo](https://codesandbox.io/s/9j86r218y4) de este bug.)*

---

## Segundo intento

Debes saber que ese ùseEffect()`nos permite [*optar por no*](https://reactjs.org/docs/hooks-effect.html#tip-optimizing-performance-by-skipping-effects) reaplicar los effects. Puedes especificar un array de dependencias como segundo argumento, y React sólo volverá a correr el efecto si algo de ese array cambia:

```jsx{3}
useEffect(() => {
  document.title = `Has cliqueado ${count} veces`;
}, [count]);
```

Cuando nosotros queremos que *solamente* corra el efecto al montarse y se limpie al desmontarse, podemos pasar un array vacío `[]` de dependencias.

Como sea, esto es una fuente común de errores si no estás familiarizado con los closures de Javascript. 
Nosotros reproduciremos ese error ahora mismo! (Mira también cómo se construye la [regla del lint](https://www.npmjs.com/package/eslint-plugin-react-hooks) para sacar a la superficie estos errores tempranamente.

En el primer intento, nuestro problema era que el re renderizado de los efectos causaba que nuestro temporizador se limpiara demasiado temprano. Nosotros podemos intentar arreglar eso haciendo que nunca se vuelva a correr:

```jsx{9}
function Counter() {
  let [count, setCount] = useState(0);

  useEffect(() => {
    let id = setInterval(() => {
      setCount(count + 1);
    }, 1000);
    return () => clearInterval(id);
  }, []);

  return <h1>{count}</h1>;
}
```

Pero ahora nuestro contador se actualiza a 1 y se queda ahí ([Mira el bug en acción](https://codesandbox.io/s/jj0mk6y683).)

Qué pasó?!

**El problema es que `useEffect`captura el `count`desde el primer render.** 
En ese momento es igual a `0`. Nunca volvemos a aplicar el efecto, así que el closure en `setInterval`siempre hace referencia al `count`del primer render, y `count + 1`es siempre `1`. Ups!

**Escuché tus dientes trinando. Los Hooks son desesperantes, verdad?**

[Una forma](https://codesandbox.io/s/j379jxrzjy) de arreglar esto es remplazar  `setCount(count + 1)` con una forma “actualizadora” del tipo `setCount(c => c + 1)`. Esto siempre leerá el nuevo estado para su variable. Pero esto no ayuda a leer nuevas props por ejemplo.

[Otra forma](https://codesandbox.io/s/00o9o95jyv) es usar [`useReducer()`](https://reactjs.org/docs/hooks-reference.html#usereducer). Esta aproximación da más flexibilidad. Dentro del reducer puede acceder a ambos, el estado actual y las props actualizadas. La función `dispatch` en sí nunca cambia así que puedes manejar datos en cualquier closure. Una limitación de `useReducer()` es que no puedes emitir efectos laterales en él. (De todas formas puedes retornar un nuevo estado n — que dispare algun effect.)

**Pero por qué se está volviendo tan intrincado?**

---

## Adaptación de impedancia

Este término siempre anda por ahí, y [Phil Haack](https://haacked.com/archive/2004/06/15/impedance-mismatch.aspx/) lo explica de esta forma:

>Uno podría decir que las bases de datos son de Marte y los objetos son de Venus. Las bases de datos no se asignan naturalmente a los modelos de objetos. Es muy parecido a intentar juntar los polos negativos de dos imanes.

Nuestra “adaptación de impedancia” no es sobre bases de datos y objetos. Es sobre el modelo de programación de React y la API imperativa `setInterval`.

** Un componente de React debe ser montado por un momento e ir a a través de diferentes estados, pero ese render resultante describe *a todos ellos de una.***

```jsx
  // Describe cada render
  return <h1>{count}</h1>
```

Hooks nos permite aplicar el mismo enfoque declarativo a los efectos:

```jsx{4}
  // Describes cada intervalo de estado
  useInterval(() => {
    setCount(count + 1);
  }, isRunning ? delay : null);
```

No *ponemos* el intervalo, pero especificamos *cómo está* puesto y con qué retraso.Nuestro Hook hace que suceda. Un proceso continuo está descrito en términos discretos.

**En contrasete, `setInterval` no describe el proceso a tiempo - Una vez que ponemos el intervalo no podemos cambiar nada sobre él, sólo limpiarlo.**

Ese es la discordancia entre el modelo de React y la API de `setInterval`.

---

Las props y el estado de los componentes de React pueden cambiar. React va a volver a renderearlos y "olvidar" todo sobre el render previo. Se vuelve irrelevante.

El Hook `useEffect()` se “olvida” el render previo también. Limpia el último efecto y prepara el siguiente. El próximo efecto se cierra sobre nuevas props y estado. Ese es el por qué [nuestro primer intento](https://codesandbox.io/s/7wlxk1k87j) funcionó para casos simples.

**Pero `setInterval()` no “olvida”.** Siempre va a referir a las viejas props y estado, hasta que lo reemplaces — lo cual no se puede hacer sin resetear el temporizador.

O espera, se puede?

---

## Refs al rescate!

El problema se reduce a esto:

* Hacemos `setInterval(callback1, delay)` con `callback1` como primer render.
* Tenemos `callback2` como próximo render que cierra sobre nuevas props y estado.
* Pero no podemos reemplazar el intervalo ya existente sin resetear el temporizador!

**Entonces si nosotros no reemplazamos el intervalo para nada y en su lugar introducimos una variable mutable `savedCallback` apuntando al *último* callback del intervalo?**

Así podemos ver una solución:

* Ponemos `setInterval(fn, delay)` donde `fn` llama a `savedCallback`.
* Establecer `savedCallback` hacia `callback1` luego del primer render.
* Establecer `savedCallback` hacia `callback2` luego del siguiente render.
* ???
* Beneficio

Este `savedCallback` mutable necesita “persistir” a través de los re-renders. Así que esta no puede ser una variable regular. Queremos algo más parecido a una instancia.

[Como aprendimos de las preguntas frecuentas de Hooks,](https://reactjs.org/docs/hooks-faq.html#is-there-something-like-instance-variables) `useRef()` nos da exactamente eso:

```jsx
  const savedCallback = useRef();
  // { current: null }
```

*(You might be familiar with [DOM refs](https://reactjs.org/docs/refs-and-the-dom.html) in React. Hooks use the same concept for holding any mutable values. A ref is like a “box” into which you can put anything.)*

`useRef()` retorna un objeto plano con una propiedad mutable `current` que se comparte entre ambos renders. Podemos salvar el *último* callback de intervalo así:

```jsx{8}
  function callback() {
    // Puede leer nuevas props, estados, etc.
    setCount(count + 1);
  }

  // Luego de cada render, guarda el último callback en nuestra ref.
  useEffect(() => {
    savedCallback.current = callback;
  });
```
Y luego podemos leer y llamarlo desde nuestro intervalo:

```jsx{3,8}
  useEffect(() => {
    function tick() {
      savedCallback.current();
    }

    let id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
```

Gracias al `[]` nuestro efecto nunca se va a volver a ejecutar, y el intervalo no se reinicia. Así que gracias a la ref `savedCallback`, podemos leer siempre el callback que establecemos luego del render, y llamarlo desde el ciclo del interval. 

Esta es una solución completa:

```jsx{10,15}
function Counter() {
  const [count, setCount] = useState(0);
  const savedCallback = useRef();

  function callback() {
    setCount(count + 1);
  }

  useEffect(() => {
    savedCallback.current = callback;
  });

  useEffect(() => {
    function tick() {
      savedCallback.current();
    }

    let id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return <h1>{count}</h1>;
}
```

*(Mira la [demo de CodeSandbox](https://codesandbox.io/s/3499qqr565).)*

---

## Extrayendo un Hook

Lo cierto es que, el código de arriba puede desorientarnos. Es alucinante mezclar paradigmas opuestos. Y también existe un gran potencial de hacer un lí refs.
to make a mess with mutableo con las refs mutables.

**Hooks nos provee clases primitivas de bajo nivel — pero su belleza es que nos habilita a componer y crear mejores abstracciones declarativas.**

Ideally, I just want to write this:

```jsx{4-6}
function Counter() {
  const [count, setCount] = useState(0);

  useInterval(() => {
    setCount(count + 1);
  }, 1000);

  return <h1>{count}</h1>;
}
```

Voy a copiar y pegar el cuerpo de mi mecanismo de Ref en un Hook normal:

```jsx
function useInterval(callback) {
  const savedCallback = useRef();

  useEffect(() => {
    savedCallback.current = callback;
  });

  useEffect(() => {
    function tick() {
      savedCallback.current();
    }

    let id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
}
```

Hasta acá el delay de `1000` está hardcodeado (puesto a mano). Quiero hacer de él un argumento:

```jsx
function useInterval(callback, delay) {
```

Voy a usarlo cuando declare el intervalo:

```jsx
    let id = setInterval(tick, delay);
```

 Ahora que el `delay` puede cambiar entre cada render, necesito declararlo en las dependencias de mi efecto de intervalo:
 
```jsx{8}
  useEffect(() => {
    function tick() {
      savedCallback.current();
    }

    let id = setInterval(tick, delay);
    return () => clearInterval(id);
  }, [delay]);
```

Espera, no queríamos restaurar el efecto de intervalo y específicamente pasarle `[]`para evitarlo? No exactamente. Sólo queríamos evitar que se restaure cuando el *callback* cambia. Pero cuando el `delay`cambia, nosotros *queremos* que se reinicie el temporizador!

Vamos a revisar si nuestro código funciona:

```jsx
function Counter() {
  const [count, setCount] = useState(0);

  useInterval(() => {
    setCount(count + 1);
  }, 1000);

  return <h1>{count}</h1>;
}

function useInterval(callback, delay) {
  const savedCallback = useRef();

  useEffect(() => {
    savedCallback.current = callback;
  });

  useEffect(() => {
    function tick() {
      savedCallback.current();
    }

    let id = setInterval(tick, delay);
    return () => clearInterval(id);
  }, [delay]);
}
```

*(Pruebalo en [CodeSandbox](https://codesandbox.io/s/xvyl15375w).)*

Funciona! Ahora podemos usar `useInterval()` en cualquier componente y no pensar demasiado sobre los detalles de su implementación.

## Bonus: pausando el intervalo

Digamos que ahora queremos tener la posibilidad de pausar el intervalo pasando `null` en el lugar del `delay`:

```jsx{6}
  const [delay, setDelay] = useState(1000);
  const [isRunning, setIsRunning] = useState(true);

  useInterval(() => {
    setCount(count + 1);
  }, isRunning ? delay : null);
```
Cómo podemos implementarlo? La respuesta es: no seteando el intervalo.

```jsx{6}
  useEffect(() => {
    function tick() {
      savedCallback.current();
    }

    if (delay !== null) {
      let id = setInterval(tick, delay);
      return () => clearInterval(id);
    }
  }, [delay]);
```

*(Mira el [ejemplo de CodeSandbox](https://codesandbox.io/s/l240mp2pm7).)*

Eso es. Este código baraja la posibilidad de todas las transiciones posibles: un cambio de delay, pausado o retomar un intervalo. El API `useEffect()` nos exige que hagamos un mayor esfuerzo inicial para describir la configuración y su limpieza, pero agregar nuevos casos es fácil.

## Bonus: Demo divertida.

Este Hook `useInterval()` es muy divertido para jugar con él. Cuando los efectos laterales son declarativos, es mucho más fácil orquestar juntos comportamientos complejos.

**Por ejemplo, nosotros podemos tener un `delay` de un intervalo controlado por otro intervalo:**

![Counter that automatically speeds up](./counter_inception.gif)

```jsx{10-15}
function Counter() {
  const [delay, setDelay] = useState(1000);
  const [count, setCount] = useState(0);

  // Incrementa el contador.
  useInterval(() => {
    setCount(count + 1);
  }, delay);

  // Lo hace más rápido a cada segundo!
  useInterval(() => {
    if (delay > 10) {
      setDelay(delay / 2);
    }
  }, 1000);

  function handleReset() {
    setDelay(1000);
  }

  return (
    <>
      <h1>Counter: {count}</h1>
      <h4>Delay: {delay}</h4>
      <button onClick={handleReset}>
        Reset delay
      </button>
    </>
  );
}
```

*(Mira el [demo de CodeSandbox](https://codesandbox.io/s/znr418qp13)!)*

## Últimas palabras

Tarda un poco en acostumbrarse a los Hooks - y *especialmente* en los límites del código imperativo y declarativo. Podés crear poderosas abstracciones declarativas con ellos como [React Spring](https://www.react-spring.io/docs/hooks/basics) pero ellas pueden definitivamente ponerte nervioso a veces.

Es tiempo temprano para los Hooks, y sigue habiendo patrones que definitivamente necesitamos seguir trabajando y comparando. No te apures en adoptar Hooks si estás acostumbrado a seguir las tan conocidas "buenas práticas". Sigue habiendo un montón por intentar y descubrir.

Yo espero que este artículo ayuda a entender las trampas comunes relacionadas a usar APIs como `setInterval()` con Hooks, con patrones que pueden ayudarnos a superarlos y el dulce fruto de crear API declarativas más expresivas sobre ellos.
