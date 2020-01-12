---
title: ¿Cómo funciona el modo de desarrollo?
date: '2019-08-04'
spoiler: Eliminación de código muerto por convención.
---

Si tu base de código JavaScript es al menos moderadamente compleja, **probablemente tienes una forma de compilar en *bundles* código diferente en desarrollo y producción**.

Compilar en *bundles* y ejecutar código diferente en desarrollo y producción es poderoso. En modo de desarrollo, React incluye muchas advertencias que te ayudan a encontrar problemas antes de que lleven a bugs. Sin embargo, el código necesario para detectar tales problemas con frecuencia aumentan el tamaño del *bundle* y ralentiza la aplicación.

La ralentización es aceptable en desarrollo. De hecho, ejecutar el código más lentamente en desarrollo *puede hasta ser beneficioso* porque compensa parcialmente la discrepancia entre máquinas rápidas de desarrollo y los dispositivos promedio de los consumidores.

En producción no queremos pagar ese costo. Por lo tanto, omitimos estas verificaciones. ¿Cómo funciona eso? Veamos.

---

La forma exacta para ejecutar código en desarrollo depende de tu *build pipeline* de JavaScript (y de si tienes una). En Facebook es algo así:

```jsx
if (__DEV__) {
  hacerAlgoEnDesarrollo();
} else {
  hacerAlgoEnProd();
}
```

Aquí, `__DEV__` no es una variable real. Es una constante que se sustituye cuando los módulos son compilados para el navegador. El resultado se ve así:

```jsx
// En desarrollo:
if (true) {
  hacerAlgoEnDesarrollo(); // 👈
} else {
  hacerAlgoEnProd();
}

// En producción:
if (false) {
  hacerAlgoEnDesarrollo();
} else {
  hacerAlgoEnProd(); // 👈
}
```

En producción, también ejecutarías un *minificador* (por ejemplo, [terser](https://github.com/terser-js/terser)) en el código. La mayoría de los *minificadores* de JavaScript hacen una forma limitada de [eliminación de código muerto](https://es.wikipedia.org/wiki/Eliminaci%C3%B3n_de_c%C3%B3digo_muerto), como quitar las ramas `if (false)`. Entonces en producción sólo verías:

```jsx
// En producción (luego de minificar):
hacerAlgoEnProd();
```
*(Ten en cuenta que hay límites significativos en qué tan efectiva es la eliminación de código muerto con herramientas comunes de JavaScript, pero eso es un tema aparte.)*

Aunque puede que no estés usando la constante mágica `__DEV__`, si usas algún *bundler* de JavaScript popular como webpack, puede que haya otra convención que puedas seguir. Por ejemplo, es común expresar el mismo patrón de esta forma:

```jsx
if (process.env.NODE_ENV !== 'production') {
  hacerAlgoEnDesarrollo();
} else {
  hacerAlgoEnProd();
}
```

**Ese es exactamente el patrón usado por librerías como [React](https://es.reactjs.org/docs/optimizing-performance.html#use-the-production-build) y [Vue](https://vuejs.org/v2/guide/deployment.html#Turn-on-Production-Mode) cuando los importas de npm usando un *bundler*** (Las compilaciones de etiquetas `<script>` de un solo archivo ofrecen versiones de desarrollo y producción como archivos `.js` y `.min.js` separados.)

Esta convención en particular viene de Node.js. En Node.js, hay una variable global `process` que expone las variables de entorno de tu sistema como propiedades en el objeto [`process.env`](https://nodejs.org/dist/latest-v8.x/docs/api/process.html#process_process_env). Sin embargo, cuando ves este patrón en una base de código de *front-end*, no hay ninguna variable real `process` involucrada. 🤯

En su lugar, toda la expresión `process.env.NODE_ENV` se sustituye por un string literal en el momento de compilación, igual que nuestra variable mágica `__DEV__`:

```jsx
// En desarrollo
if ('development' !== 'production') { // true
  hacerAlgoEnDesarrollo(); // 👈
} else {
  hacerAlgoEnProd();
}

// En producción:
if ('production' !== 'production') { // false
  hacerAlgoEnDesarrollo();
} else {
  hacerAlgoEnProd(); // 👈
}
```
Dado que toda la expresión es constante (`'production' !== 'production'` siempre será `false`), un *minificador* también puede quitar la otra rama.

```jsx
// En producción (luego de minificar):
hacerAlgoEnProd();
```

Travesura lograda.

---

Ten en cuenta que esto **no funcionaría** con expresiones más complejas:

```jsx
let mode = 'production';
if (mode !== 'production') {
  // 🔴 no se garantiza que se elimine
}
```

Las herramientas de análisis estático de JavaScript no son muy inteligentes debido a la naturaleza dinámica del lenguaje. Cuando ven variables como `mode` en lugar de expresiones estáticas como `false` o `'production' !== 'production'`, generalmente se rinden.

De igual forma, la eliminación de código muerto en JavaScript generalmente no funciona bien fuera de los límites del módulo cuando usas la sentencia de nivel superior `import`:

```jsx
// 🔴 no se garantiza que se elimine
import {algunaFuncion} from 'some-module';

if (false) {
  algunaFuncion();
}
```

Por eso necesitas escribir código de forma muy mecánica tal que haga la condición *definitivamente estática* y asegure que *todo el código* que quieres eliminar se encuentre dentro.

---

Para que todo esto funcione, tu *bundler* necesita reemplazar `process.env.NODE_ENV` y necesita saber en qué modo *quieres* compilar el proyecto.

Hace unos años, solía ser común olvidarse configurar el entorno. Con frecuencia veías proyectos en modo de desarrollo desplegados en producción.

Eso es malo porque hace que el sitio web cargue y funcione más lentamente.

En los últimos dos años, la situación mejoró significativamente. Por ejemplo, webpack añadió una simple opción `mode` en lugar de tener que configurar manualmente el reemplazo de `process.env.NODE_ENV`. Ahora React DevTools también muestra un ícono rojo en sitios en modo de desarrollo, haciendo más fácil identificar e incluso [reportar](https://mobile.twitter.com/BestBuySupport/status/1027195363713736704).

![Advertencia de modo de desarrollo en React DevTools](devmode.png)

Instaladores dogmáticos como Create React App, Next/Nuxt, Vue CLI, Gatsby y otros hacen más difícil equivocarse con esto separando los *builds* de desarrollo y producción en dos comandos separados (por ejemplo, `npm start` y `npm run build`). Generalmente, solo se puede desplegar el build de producción por lo que el desarrollador ya no puede cometer este error.

Siempre existe un argumento que quizás el modo *producción* necesita ser el valor por defecto y el modo de desarrollo opcional. Personalmente no me convence este argumento. Las personas que se benefician más de las advertencias en el modo de desarrollo generalmente son nuevos en la librería. *No sabrían cómo activarlo,* y evitarían encontrar muchos bugs que con las advertencias se hacen evidentes.

Si, los problemas de rendimiento son malos, pero también es enviar experiencias rotas y llenas de bugs a los usuarios finales. Por ejemplo, el [warning de *key* de React](https://es.reactjs.org/docs/lists-and-keys.html#keys) ayuda a prevenir bugs como enviar un mensaje a la persona equivocada o comprar el producto erróneo. Desarrollar con esta advertencia desactivada es un riesgo significativo para ti *y* tus usuarios. Si está desactivada por defecto, entonces para el momento que encuentres la opción para activarlo, tendrás demasiadas advertencias para limpiar. Así que muchas personas lo volverían a apagar. Este es el motivo por el que necesita estar activado desde el comienzo en lugar de activado luego.

Finalmente, incluso si las advertencias de desarrollo son opcionales y los desarrolladores *supieran* que deben activarlas en una etapa temprana del desarrollo, simplemente volveríamos al mismo problema. ¡Alguien accidentalmente las dejaría activadas en producción!

Y volvimos al primer casillero.

Personalmente creo en **herramientas que muestran y usan el modo correcto dependiendo si estás depurando o desplegando**. Casi cualquier entorno (sea móvil, escritorio o servidor) excepto el navegador ha tenido una forma de cargar y diferenciar builds de desarrollo y producción por décadas.

En lugar de dejar a las librerías inventar y nosotros depender de convenciones ad-hoc, quizás es momento que los entornos de JavaScript vean la distinción como una necesidad de primera clase.

---

¡Suficiente filosofía!

Miremos de nuevo a este código:

```jsx
if (process.env.NODE_ENV !== 'production') {
  hacerAlgoEnDesarrollo();
} else {
  hacerAlgoEnProd();
}
```

Quizás te preguntes: si no hay ningún objeto `process` en el código de front-end, ¿por qué las librerías como React y Vue dependen de ella en los builds de npm?

*(Para aclarar esto nuevamente; las etiquetas `<script>` que puedes cargar en el navegador, ofrecidas tanto por React y por Vue, no dependen de esto. En su lugar, tu tienes que manualmente elegir entre los archivos de desarrollo `.js` y de producción `.min.js`. La sección debajo es solo acerca de usar React o Vue con un bundler `import`ándolos desde npm.)*

Como muchas cosas en programación, esta convención en particular tiene mayormente motivos históricos. Aún estamos usándola porque ahora es ampliamente adoptada por diferentes herramientas. Cambiar a algo diferente es costoso y no aporta mucho.

Entonces ¿cuál es la historia detrás?

Muchos años antes de estandarizar la sintaxis de `import` y `export`, había muchas formas diferentes de expresar relaciones entre módulos. Node.js popularizó `require()` y `module.exports`, conocidos como [CommonJS](https://en.wikipedia.org/wiki/CommonJS).

El código publicado en los comienzos del registro de npm era escrito para Node.js. Express era (¿y quizás aún lo sea?) el framework para servidores Node.js y [usaba la variable de entorno `NODE_ENV`](https://expressjs.com/en/advanced/best-practice-performance.html#set-node_env-to-production) para activar el modo de producción. Algunos otros paquetes de npm adoptaron la misma convención.

Los primeros *bundlers* de JavaScript como browserify querían hacer posible usar el código de npm en proyectos de front-end. (Sí, en [ese entonces](https://blog.npmjs.org/post/101775448305/npm-and-front-end-packaging) ¡casi nadie usaba npm para front-end! ¿te imaginas?) Así que extendieron la misma convención ya presente en el ecosistema de Node.js a código de front-end.

La transformada original “envify” fue [lanzada en 2013](https://github.com/hughsk/envify/commit/ae8aa26b759cd2115eccbed96f70e7bbdceded97). React fue hecho open source por ese entonces y npm con browserify parecía la mejor solución para compilar código CommonJS de front-end.

React comenzó a proveer builds npm (adicionalmente a builds para etiquetas `<script>`) desde el comienzo. Cuando React se hizo popular, también lo hicieron las buenas prácticas para escribir JavaScript modular con CommonJS y entregar código de front-end vía npm.

React necesitaba quitar código que era sólo para desarrollo en el modo de producción. Browserify ya ofrecía una solución a este problema, así que React adoptó la convención de usar `process.env.NODE_ENV` para sus builds npm. Con el tiempo, muchas otras herramientas y librerías, incluyendo webpack y Vue, hicieron lo mismo.

Por el 2019, browserify ha perdido bastante popularidad. Sin embargo, reemplazar `process.env.NODE_ENV` con `development` o `production` en el paso de compilación es una convención aún popular.

*(Sería interesante ver cómo la adaptación de módulos ES como formato de distribución, en lugar de sólo como formato de autoría, cambia la ecuación. ¿Cuéntamelo en Twitter?)*

---

Una cosa que aún podría confundirte es que en el código fuente de React en GitHub verás que `__DEV__`es usada como variable mágica. Pero en el código de React en npm, usa `process.env.NODE_ENV`. ¿Cómo funciona eso?

Históricamente usamos `__DEV__` en el código fuente para que coincida con el código de Facebook. Por un largo tiempo, React era copiado directamente en la base de código de Facebook por lo que debía seguir las mismas reglas. Para npm, teníamos un paso de compilación que literalmente reemplazaba las verificaciones de `__DEV__` con `process.env.NODE_ENV !== 'production'` justo antes de publicar.

Esto era a veces un problema. A veces, un patrón de código que dependía de alguna convención de Node.js funcionaba bien en npm pero rompía Facebook, o viceversa.

Desde React 16 cambiamos este enfoque. En su lugar, ahora [compilamos un bundle](https://reactjs.org/blog/2017/12/15/improving-the-repository-infrastructure.html#compiling-flat-bundles) para cada entorno (incluyendo las etiquetas`<script>`, npm y el código interno de Facebook). Así que incluso código en CommonJS para npm es compilado para separar bundles de desarrollo y de producción antes de tiempo.

Esto significa que mientras el código fuente de React dice `if (__DEV__)`, en realidad producimos dos bundles para cada paquete. Uno ya precompilado con `__DEV__ = true` y otro precompilado con `__DEV__ = false`. El punto de entrada para cada paquete en npm “decide” cuál exportar.

[Por ejemplo:](https://unpkg.com/browse/react@16.8.6/index.js)

```jsx
if (process.env.NODE_ENV === 'production') {
  module.exports = require('./cjs/react.production.min.js');
} else {
  module.exports = require('./cjs/react.development.js');
}
```

Y ese es el único lugar donde tu *bundler* interpolará `'development'` o `'production'` como un string, y donde tu minificador se deshacerá de ese `require` sólo para desarrollo.

Tanto `react.production.min.js` como `react.development.js` ya no tienen verificaciones con `process.env.NODE_ENV`. Esto es muy bueno porque *cuando de hecho corremos en Node.js*, acceder a `process.env` es un [poco lento](https://reactjs.org/blog/2017/09/26/react-v16.0.html#better-server-side-rendering). Compilar los bundles en ambas formas antes de tiempo también nos deja optimizar el tamaño de archivo de forma [mucho más consistente](https://reactjs.org/blog/2017/09/26/react-v16.0.html#reduced-file-size), independientemente de qué *bundler* o *minificador* uses.

¡Y así es como realmente funciona!

---

Desearía que existiera una forma más *primera clase* de hacerlo sin dependender de convenciones, pero aquí estamos. Sería genial si los modos fueran un concepto de primera clase en todos los entornos de JavaScript y que hubiera una forma de que un navegador identifique que algún código está en modo desarrollo cuando no debe.

Por otro lado, es fascinante ver cómo una convención en un único proyecto puede propagarse en todo el ecosistema. `EXPRESS_ENV` [se convirtió en `NODE_ENV`](https://github.com/expressjs/express/commit/03b56d8140dc5c2b574d410bfeb63517a0430451) en 2010 y [se propagó al front-end](https://github.com/hughsk/envify/commit/ae8aa26b759cd2115eccbed96f70e7bbdceded97) en 2013. Quizás la solución no es perfecta, pero para cada proyecto el costo de adoptarla era más bajo que el costo de convencer a todos los demás que adopten algo diferente. Esto nos enseña una valiosa lección sobre la adopción de [*top-down* versus *bottom-up*](https://es.wikipedia.org/wiki/Top-down_y_bottom-up). Entender cómo esta dinámica funciona distingue entre intentos de estandarización exitosos y fracasos.

Separar los modos de desarrollo y producción es una técnica muy útil. Recomiendo que la uses en tus librerías y en el código de aplicación para los tipos de chequeos que son demasiado costosos hacer en producción, pero son valiosos (¡y generalmente críticos!) de hacer en desarrollo.

Como cualquier característica poderosa, hay formas en que puede utilizarse mal. ¡Este será el tema de mi próximo artículo!
