---
title: 'Antes de utilizar memo()'
date: '2021-02-23'
spoiler: "Optimizaciones de renderizado que llegan naturalmente."
---

Hay muchos artículos escritos acerca de las optimizaciones de rendimiento de React. En general, si alguna actualización de estado es lenta, deberías: 

1. Verificar que estás corriendo una compilación (build) de producción. (Las compilaciones (builds) de desarrollo son intencionalmente más lentas, incluso, en casos extremos en un orden de magnitud.)
2. Verificar que no ha puesto el estado más arriba de lo necesario en el árbol. (Por ejemplo, poner la entrada del estado en un almacén centralizado podría no ser la mejor idea)
3. Ejecutar React DevTools Profiler para ver qué se vuelve a renderizar, y envolver los subárboles más costosos con `memo()`. (Y agregar `useMemo()` donde sea necesario.)

Este último paso es molesto, especialmente para los componentes intermedios, e idealmente un compilador lo haría por ti. En el futuro, podría ser.

**En esta publicación, quiero compartir dos técnicas diferentes.** Son sorprendentemente básicas, razón por la cual las personas rara vez se dan cuenta de que mejoran el rendimiento de renderizado.

**¡Estas técnicas son complementarias a lo que ya sabes!** No reemplazan `memo` o `useMemo`, pero, a menudo son buenas para probarlas primero.

## Un Componente Lento (Simulado)

Aquí hay un componente con un problema grave de rendimiento en el renderizado:

```jsx
import { useState } from 'react';

export default function App() {
  let [color, setColor] = useState('red');
  return (
    <div>
      <input value={color} onChange={(e) => setColor(e.target.value)} />
      <p style={{ color }}>Hello, world!</p>
      <ExpensiveTree />
    </div>
  );
}

function ExpensiveTree() {
  let now = performance.now();
  while (performance.now() - now < 100) {
    // Artificial delay -- do nothing for 100ms
  }
  return <p>I am a very slow component tree.</p>;
}
```

*([Pruébalo aquí](https://codesandbox.io/s/frosty-glade-m33km?file=/src/App.js:23-513))*

El problema es que cada vez que `color` cambia dentro de `App`, volveremos a renderizar `<ExpensiveTree />` el cual hemos simulado para ser muy lento.

Podría [poner `memo()` en él](https://codesandbox.io/s/amazing-shtern-61tu4?file=/src/App.js) y terminarlo, pero existen muchos artículos al respecto, por lo que, no perderé tiempo en ello. Quiero mostrar dos técnicas diferentes.

## Solución 1: Mover el Estado Hacia Abajo

Si observas el código de renderizado atentamente, notarás que solo una parte del árbol devuelto realmente se preocupa por el `color` actual:

```jsx{2,5-6}
export default function App() {
  let [color, setColor] = useState('red');
  return (
    <div>
      <input value={color} onChange={(e) => setColor(e.target.value)} />
      <p style={{ color }}>Hello, world!</p>
      <ExpensiveTree />
    </div>
  );
}
```

Así que extraigamos esa parte en un componente `Form` y movamos el estado _abajo_ en él:

```jsx{4,11,14,15}
export default function App() {
  return (
    <>
      <Form />
      <ExpensiveTree />
    </>
  );
}

function Form() {
  let [color, setColor] = useState('red');
  return (
    <>
      <input value={color} onChange={(e) => setColor(e.target.value)} />
      <p style={{ color }}>Hello, world!</p>
    </>
  );
}
```

*([Pruébalo aquí](https://codesandbox.io/s/billowing-wood-1tq2u?file=/src/App.js:64-380))*

Ahora, si el `color` cambia, solo el `Form` se vuelve a renderizar. Problema resuelto.

## Solución 2: Elevar el Contenido

La solución anterior no funciona si la parte del estado se utiliza en algún lugar *por encima* del árbol costoso. Por ejemplo, digamos que ponemos el `color` en el `<div>` *padre*:

```jsx{2,4}
export default function App() {
  let [color, setColor] = useState('red');
  return (
    <div style={{ color }}>
      <input value={color} onChange={(e) => setColor(e.target.value)} />
      <p>Hello, world!</p>
      <ExpensiveTree />
    </div>
  );
}
```

*([Pruébalo aquí](https://codesandbox.io/s/bold-dust-0jbg7?file=/src/App.js:58-313))*

Ahora, parece que no podemos "extraer" simplemente las partes que no utilizan `color` dentro de otro componente, ya que eso incluiría el `div` padre, que luego incluiría `<ExpensiveTree />`. No podemos evitar `memo` esta vez, ¿cierto?

¿O, sí podemos?

Juega con este sandbox e intenta resolverlo.

...

...

...

La respuesta es notablemente simple:

```jsx{4,5,10,15}
export default function App() {
  return (
    <ColorPicker>
      <p>Hello, world!</p>
      <ExpensiveTree />
    </ColorPicker>
  );
}

function ColorPicker({ children }) {
  let [color, setColor] = useState("red");
  return (
    <div style={{ color }}>
      <input value={color} onChange={(e) => setColor(e.target.value)} />
      {children}
    </div>
  );
}
```

*([Pruébalo aquí](https://codesandbox.io/s/wonderful-banach-tyfr1?file=/src/App.js:58-423))*

Separamos el componente `App` en dos. Las partes que dependen del `color`, junto con la variable de estado `color` propiamente, se han movido a `ColorPicker`.

Las partes a las que no les importa el `color` se quedan en el componente `App` y son pasadas a `ColorPicker` como contenido JSX, también conocido como la propiedad `children`.

Cuando el `color` cambia, `ColorPicker` se vuelve a renderizar. Pero, todavía tiene la misma propiedad `children` que obtuvo de `App` la última vez, por lo que React no visita este subárbol.

Y como resultado, `<ExpensiveTree />` no se vuelve a renderizar.

## ¿Cuál es la moraleja?

Antes de aplicar optimizaciones como `memo` o `useMemo`, podría tener sentido buscar si se puede separar las partes que cambian de las que no cambian.

La parte interesante de estos enfoques es que **en realidad no tienen nada que ver con el rendimiento, per se**. Utilizar la propiedad `children` para separar componentes usualmente hace que el flujo de datos de tu aplicación sea más fácil de seguir y reduce la cantidad de propiedades conectados a través del árbol. La mejora del rendimiento en casos como este es una guinda del pastel, no el objetivo final.

Curiosamente, este patrón también desbloquea _más_ beneficios de rendimiento en el futuro.

Por ejemplo, cuando [Los Componentes del Servidor](https://reactjs.org/blog/2020/12/21/data-fetching-with-react-server-components.html) estén estable y listos para su utilización, nuestro componente `ColorPicker` podría recibir sus `children` [desde el servidor](https://youtu.be/TQQPAU21ZUw?t=1314). El componente completo `<ExpensiveTree />` o sus partes podrían ejecutarse en el servidor, e incluso una actualización de estado de React de nivel superior "saltaría" esas partes en el cliente.

¡Eso es algo que incluso `memo` no podría hacer! Pero de nuevo, ambos enfoques son complementarios. No descuides mover el estado hacia abajo (¡y subir el contenido!)

Luego, donde no sea suficiente, utiliza el Profiler y esparce esos memo’s.

## ¿No leí sobre esto antes?

[Si, probablemente.](https://kentcdodds.com/blog/optimize-react-re-renders)

Esto no es una idea nueva. Es una consecuencia natural del modelo de composición de React. Es lo suficientemente simple como para subestimarlo, y merece un poco más de amor.
