---
title: 'Adiós, código limpio'
date: '2020-01-11'
spoiler: Deja que el código limpio te guíe. Luego déjalo ir.
---

Era tarde en la noche.

Mi colega acababa de subir el código en el que había estado trabajando toda la semana. Estabamos trabajando en un editor de gráficos en canvas y ellos implementaron la capacidad de redimensionar figuras, como rectángulos y óvalos, usando pequeños controles en sus bordes y arrastrándolos.

El código funcionaba.

Pero era repetitivo. Cada figura (como un rectángulo o un óvalo) tenía un conjunto diferente de controles, y arrastrar cada control en direcciones diferentes modificaba la posición y tamaño de la figura de manera diferente. Si el usuario mantenía presionada la tecla Shift, también preservabamos las proporciones mientras redimensionabamos. Había mucha lógica matemática.

El código era algo así:

```jsx
let Rectangle = {
  resizeTopLeft(position, size, preserveAspect, dx, dy) {
    // 10 líneas repetitivas de operaciones matemáticas
  },
  resizeTopRight(position, size, preserveAspect, dx, dy) {
    // 10 líneas repetitivas de operaciones matemáticas
  },
  resizeBottomLeft(position, size, preserveAspect, dx, dy) {
    // 10 líneas repetitivas de operaciones matemáticas
  },
  resizeBottomRight(position, size, preserveAspect, dx, dy) {
    // 10 líneas repetitivas de operaciones matemáticas
  },
};

let Oval = {
  resizeLeft(position, size, preserveAspect, dx, dy) {
    // 10 líneas repetitivas de operaciones matemáticas
  },
  resizeRight(position, size, preserveAspect, dx, dy) {
    // 10 líneas repetitivas de operaciones matemáticas
  },
  resizeTop(position, size, preserveAspect, dx, dy) {
    // 10 líneas repetitivas de operaciones matemáticas
  },
  resizeBottom(position, size, preserveAspect, dx, dy) {
    // 10 líneas repetitivas de operaciones matemáticas
  },
};

let Header = {
  resizeLeft(position, size, preserveAspect, dx, dy) {
    // 10 líneas repetitivas de operaciones matemáticas
  },
  resizeRight(position, size, preserveAspect, dx, dy) {
    // 10 líneas repetitivas de operaciones matemáticas
  },  
}

let TextBlock = {
  resizeTopLeft(position, size, preserveAspect, dx, dy) {
    // 10 líneas repetitivas de operaciones matemáticas
  },
  resizeTopRight(position, size, preserveAspect, dx, dy) {
    // 10 líneas repetitivas de operaciones matemáticas
  },
  resizeBottomLeft(position, size, preserveAspect, dx, dy) {
    // 10 líneas repetitivas de operaciones matemáticas
  },
  resizeBottomRight(position, size, preserveAspect, dx, dy) {
    // 10 líneas repetitivas de operaciones matemáticas
  },
};
```

Esas operaciones matemáticas repetidas me estaban molestando.

No era *limpio*.

La mayor parte de la repetición se daba entre direcciones similares. Por ejemplo, `Oval.resizeLeft()` tenia similitudes con `Header.resizeLeft()`. Esto se debía a que ambos se ocupaban de arrastrar el control del lado izquierdo.

La otra similitud se daba entre métodos para la misma figura. Por ejemplo, `Oval.resizeLeft()` tenía similitudes con los otros métodos de `Oval`. Esto porque todos ellos se ocupaban de los óvalos. También había duplicidad de código entre `Rectangle`, `Header` y `TextBlock` porque los `TextBlock` *eran* `Rectangle`.

Tuve una idea.

Podíamos *eliminar todo el código repetido* agrupándolo de esta manera:

```jsx
let Directions = {
  top(...) {
    // 5 líneas no repetidas de operaciones matemáticas
  },
  left(...) {
    // 5 líneas no repetidas de operaciones matemáticas
  },
  bottom(...) {
    // 5 líneas no repetidas de operaciones matemáticas
  },
  right(...) {
    // 5 líneas no repetidas de operaciones matemáticas
  },
};

let Shapes = {
  Oval(...) {
    // 5 líneas no repetidas de operaciones matemáticas
  },
  Rectangle(...) {
    // 5 líneas no repetidas de operaciones matemáticas
  },
}
```

y luego componiendo sus comportamientos:

```jsx
let {top, bottom, left, right} = Directions;

function createHandle(directions) {
  // 20 líneas de código
}

let fourCorners = [
  createHandle([top, left]),
  createHandle([top, right]),
  createHandle([bottom, left]),
  createHandle([bottom, right]),
];
let fourSides = [
  createHandle([top]),
  createHandle([left]),
  createHandle([right]),
  createHandle([bottom]),
];
let twoSides = [
  createHandle([left]),
  createHandle([right]),
];

function createBox(shape, handles) {
   // 20 líneas de código
}

let Rectangle = createBox(Shapes.Rectangle, fourCorners);
let Oval = createBox(Shapes.Oval, fourSides);
let Header = createBox(Shapes.Rectangle, twoSides);
let TextBox = createBox(Shapes.Rectangle, fourCorners);
```

¡El código ocupaba la mitad y la duplicación se había ido completamente! Entonces estaba *limpio*. Si queríamos cambiar el comportamiento para una dirección en particular, podíamos hacerlo en un solo lugar, en vez de actualizar todos los métodos que estaban duplicados.

Ya era tarde en la noche (me dejé llevar). Subí mis cambios de refactorización a master y me fuí a la cama, orgulloso de como pude desenredar el código desordenado de mi colega.

## La mañana siguiente

... no fue como esperaba.

Mi jefe me invitó a una reunión uno-a-uno donde cortésmente me pidieron que revirtiera mis cambios. Estaba atónito. ¡El código anterior era un desastre, y el mío era *limpio*!.

Cumplí a regañadientes, pero me tomó años darme cuenta de que tenían razón.

## Es una fase

Obsesionarse con el "código limpio" y eliminar toda duplicación es una fase por la que muchos de nosotros pasamos. Cuando no nos sentimos seguros de nuestro código, es tentador vincular nuestro sentido de autoestima y orgullo profesional a algo que se puede medir. Un conjunto de reglas de un linter, un esquema de nombres, una estructura de archivos, una falta de duplicación.

No puedes automatizar la eliminación de código repetido, pero se hace más fácil con la práctica. Usualmente puedes darte cuenta que hay más o menos de esto después de cada cambio. Como resultado, eliminar duplicación se siente como mejorar alguna métrica objetiva del código. Peor, esto confunde el sentido de identidad de las personas: *Soy el tipo de persona que escribe código limpio*. Es tan poderoso como cualquier otro tipo de autoengaño.

Una vez que aprendemos como crear [abstracciones](https://www.sandimetz.com/blog/2016/1/20/the-wrong-abstraction), es tentador dejarse llevar por esa habilidad y sacar abstracciones de la nada en cualquier momento que vemos código repetido. Despues de muchos años codificando, vemos repetición *en todos lados* -- y abstraer es nuestro nuevo superpoder. Si alguien nos dice que la abstracción es una *virtud*, le creemos. Y empezamos a juzgar a otros por no rendir culto a la "limpieza en el código".

Ahora veo como mi "refactorización" era un desastre por dos razones:

* Primero, no hablé con la persona que lo escribió. Reescribí el código y lo subí sin su aporte. Aunque era una mejora (cosa que ya no considero así), es una manera terrible de hacerlo. Un equipo de ingeniería sano está constantemente *construyendo confianza*. Reescribir el código de tu compañero sin una discusión previa es un gran golpe a tus habilidades de trabajo en equipo para colaborar efectivamente sobre la base de código.

* Segundo, nada es gratis. Mi código intercambiaba la habilidad de cambiar los requerimientos por menos duplicidad de código, y ese no era un buen intercambio. Por ejemplo, luego necesitamos muchos casos y comportamientos especiales para los diferentes controles en las diferentes figuras. Mi abstracción se hubiera convertido mucho más desordenada para lograr eso a la larga, mientras que la versión original "desordenada" pudo afrontar esos cambios de manera fácil.

¿Estoy diciendo que debemos escribir código "sucio"? No. Estoy sugiriendo que pensemos profundamente a que nos referimos cuando decimos "limpio" o "sucio". ¿Te da un sentimiento de revolución? ¿Correctitud? ¿Belleza? ¿Elegancia? ¿Qué tan seguro estás de que puedes darles un nombre a los resultados de ingeniería concretos correspondientes a esas cualidades? ¿Cómo afectan exactamente a la manera en la que el código está escrito y es [modificado](/optimized-for-change/)?

Estoy seguro que no pensaste profundamente acerca de estas cosas. Yo pensaba mucho acerca de cómo *lucía* el código -- pero no acerca de cómo *evolucionaba* con un equipo de simples humanos.

Programar es un recorrido. Piensa qué tan lejos has llegado desde tu primera línea de código hasta donde estás ahora. Reconozco que fue una alegría ver por primera vez como extraer una función o refactorizar una clase puede hacer el código mas simple. Si te enorgulleces de tu oficio, es tentador perseguir la limpieza de código. Hazlo por un tiempo.

Pero no te quedes ahí. No seas un fanático del código limpio. El código limpio no es una meta. Es un intento de dar sentido a la inmensa complejidad de sistemas con los que lidiamos. Es un mecanismo de defensa cuando no estás seguro de cómo un cambio puede afectar la base de código, pero necesitas guía en un mar de incógnitas.

Deja que el código limpio te guíe. *Luego déjalo ir.*
