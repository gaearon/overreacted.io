---
title: ¿Cuáles son los principios del equipo de React?
date: '2019-12-25'
spoiler: UI antes de API.
---

En mi tiempo en el equipo de React, he tenido la suerte de ver como [Jordan](https://twitter.com/jordwalke), [Sebastian](https://twitter.com/sebmarkbage), [Sophie](https://twitter.com/sophiebits) y otros miembros establecidos enfocan los problemas. En este artículo, voy a sintetizar lo que he aprendido de ellos en unos cuantos principios técnicos. Estos principios no se proponen ser exhaustivos. Este es mi intento personal de formalizar observaciones de cómo funciona el equipo de React (otros miembros del equipo pueden tener perspectivas diferentes).

## UI antes de API

Cada abstracción tiene sus propias peculiaridades cuando se despliega en escala. ¿Cómo se manifiestan estas peculiaridades en las interfaces de usuario? ¿Eres capaz de identificar cuándo una aplicación está construida con una abstracción en particular?

Las abstracciones tienen un efecto directo en las experiencias del usuario (permitiéndolas, perpetuándolas, e incluso haciendo algunas imposibles). Es por ello que cuando diseñamos APIs, no comenzamos con la abstracción misma. En cambio, iniciamos con la experiencia de usuario deseada y trabajamos hacia atrás buscando la abstracción.

A veces mientras trabajamos hacia atrás, nos damos cuenta que debemos cambiar el enfoque completo para poder permitir la experiencia de usuario adecuada. No podríamos verlo si comenzamos con la API. Por tanto ponemos la interfaz de usuario antes de la API.

## Absorber la complejidad

Hacer que los elementos internos de React sean simples no es nuestro objetivo. Estamos dispuestos a hacer los elementos internos de React complejos si esa complejidad permite que el código de los desarrolladores de productos sea más fácil de entender y modificar.

Queremos permitir que el desarrollo de productos sea descentralizado y colaborativo. A menudo eso significa que llevamos nosotros la carga de la centralización. React no puede separarse en módulos pequeños, simples y con bajo acoplamiento, porque para poder hacer su trabajo, alguien tiene que actuar como el coordinador. Ese es React.

Al elevar el nivel de abstracción, hacemos que los desarrolladores de productos sean más poderosos. Se benefician del sistema como un conjunto, que tiene varias propiedades predecibles. Pero esto significa que cada nueva funcionalidad N+1 que introducimos tiene que funcionar bien con todas las N funcionalidades existentes. Es por esa razón que contribuir con nuevas funcionalidades a React es más difícil tanto en el lado de diseño como de implementación. Es por eso que no tenemos muchas contribuciones de código abierto al «núcleo».

Absorbemos la complejidad para impedir que se escurra en el código del producto.

## Hacks, luego las formas idiomáticas

Cada API crea nuevas restricciones. En ocasiones estas restricciones impiden que las personas puedan ofrecer agradables experiencias de usuario. Proporcionamos puertas de escape para que puedan saltarse nuestras reglas cuando sea necesario.

Los _hacks_ no pueden sobrevivir por mucho, porque son frágiles. Los desarrolladores de productos luego tienen que escoger entre si prefieren asumir el peso del mantenimiento teniendo el _hack_, o degradar la experiencia de usuario, pero quitando el _hack_. A menudo es la experiencia de usuario la que pierde, o el _hack_ previene mejoras posteriores a ella.

Necesitamos permitir _hacks_ usando puertas de escape, y observar qué _hacks_ las personas ponen en práctica. Nuestro trabajo es proporcionar eventualmente una solución idiomática para los _hacks_ que existen en nombre de una mejor experiencia de usuario. A veces, una solución puede tomar años. Preferimos un _hack_ flexible a consolidar una forma idiomática pobre.

## Permitir el razonamiento local

No hay muchas cosas qué hacer en un editor de código. Puedes añadir algunas líneas o eliminarlas. O copiar y pegar algo. Sin embargo, aún así muchas abstracciones hacen que estas operaciones básicas sean difíciles. 

Por ejemplo los _frameworks_ MVC tienen la tendencia de hacer insegura la acción de eliminar alguna parte de la salida del renderizado. Esto ocurre porque los padres llaman imperativamente métodos en sus hijos (que ya no están después de que los eliminaste). Por contraste, en React es usualmente seguro eliminar líneas de código en tu árbol de renderizado. Esto es un logro.

Cuando no es seguro hacer algo, queremos que el desarrollador descubra los efectos completos de sus cambios tan rápido como sea posible. Advertencias, chequeos de tipos y herramientas de desarrollo pueden ayudar, pero están limitados por el diseño de la API. Si la API no es suficientemente restrictiva, el razonamiento local es imposible. Por ejemplo, es por eso que `findDOMNode()` es malo. Requiere conocimiento global.

## Complejidad progresiva

Algunos _frameworks_ escogen tener una bifurcación en el camino. Proporcionan dos formas de hacer algo: una forma fácil y una forma poderosa. La forma fácil se aprende con comodidad, pero en algún punto puedes chocar contra un muro. Cuando eso ocurre, tienes que deshacer el trabajo anterior y reimplementarlo de forma distinta.

Preferimos que la implementación de algo complejo no sea muy diferente en su estructura a la implementación de algo simple. Por ejemplo, no ofrecemos un lenguaje de plantillas separado «para los casos simples» porque crearía una bifurcación en el camino. Estamos dispuestos a ceder en la barrera de entrada si pensamos que vas a querer pronto el mecanismo con todas las funcionalidades. 

En ocasiones, la «forma fácil» y la «forma poderosa» son dos _frameworks_ distintos. Entonces también tienes que reescribir. Es bueno cuando también puedes evitarlo. Por ejemplo, añadir renderizado en el servidor es una optimización que requiere algún esfuerzo extra en React, pero no una reescritura completa.

## Contener el daño

Herramientas de arriba hacia abajo como los presupuestos de código son importantes. Sin embargo, a la larga, nuestros estándares declinan, funcionalidades se entregan bajo fechas límite y productos dejarán de ser mantenidos. Cuando no podemos depender de que todos estén en sintonía, nuestro rol como coordinador es contener el daño.

Si alguna interfaz de usuario es lenta o por encima del presupuesto, necesitamos hacer lo que podamos para reducir sus efectos negativos sobre el tiempo de carga e interacción con otras partes de la interfaz de usuario. Idealmente, el desarrollador solo debiera «pagar» por las funcionalidades que usa, y el usuario solo debiera «pagar» por la interfaz con la que interactúa. Las funcionalidades del Modo Concurrente como los cortes de tiempo y la hidratación selectiva son diferentes formas de lograrlo. 

Dado que el costo asociado al código de la biblioteca es relativamente estable, pero el código de la aplicación es ilimitado, tenemos la tendencia a enfocarnos en contener el daño en el código de la aplicación y no en el código fijo del código de la biblioteca. 

## Confiar en la teoría

En ocasiones, sabemos que un enfoque es un callejón sin salida. Quizá funciona hoy, pero ya estamos conscientes de sus limitaciones, y ellas son las que fundamentalmente previenen que podamos ofrecer la experiencia de usuario deseada. Renunciamos a seguir invirtiendo en ese enfoque tan pronto como sea viable hacerlo.

Queremos evitar quedarnos atrapados en un máximo local. Si otro enfoque tiene mucho más sentido en teoría, estamos dispuestos a invertir en el esfuerzo para llegar allí, aún si toma muchos años. Habrán muchos obstáculos y soluciones de compromiso prácticas que tengamos que hacer para poder llegar allí. Pero confiamos en que si seguimos trabajando en ello, eventualmente la teoría gana.

## ¿Cuáles son los principios de tu equipo?

Estos son algunos principios fundamentales que he observado en cómo trabajamos, pero probablemente me han faltado varios. Tampoco he tocado principios menos técnicos sobre cómo publicamos nuestras APIs, comunicamos cambios, etcétera. Ese podría ser el tema para otro día.

¿Tu equipo tiene un conjunto de principios? Me encantaría escuchar sobre ellos.

*Este artículo fue publicado originalmente [aquí](https://react.christmas/2019/24).*
