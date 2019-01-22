---
title: Mi lista de deseos para la recarga en caliente
date: '2018-12-08'
spoiler: No quiero muchas cosas para navidad. Solo hay algo que necesito.
---

¿Tienes un proyecto en el que te enfocas repetidamente con una mezcla de éxito y fracaso, te haces a un lado por un tiempo, y luego lo intentas de nuevo —año tras año? Para algunos puede ser un enrutador o una lista con desplazamiento virtual. Para mí, es la recarga en caliente (*hot reloading*).

Mi primer contacto con la idea de cambiar código al instante fue una breve mención en un libro sobre Erlang que leí cuando era un adolescente. Mucho después, como muchos otros, me enamoré de los [hermosos demos de Bret Victor](https://vimeo.com/36579366). En algún lugar leí que Bret se había disgustado con el hecho de que algunos comenzaron a escoger partes «fáciles» de sus demos arruinando la visión en su conjunto (no sé si esto es cierto). **Como quiera que sea, para mí realizar mejoras incrementales que las personas dan luego por sentado es un éxito.** Personas más inteligentes que yo trabajarán en las Próximas Grandes Ideas.

Ahora bien, quisiera dejar claro que ninguna de las *ideas* que se discuten en esta publicación son mías. Me he [inspirado](https://redux.js.org/#thanks) en muchos proyectos y personas. Incluso, personas cuyos proyectos nunca he probado, ocasionalmente me han dicho que les he robado su material.

No soy un inventor. Si tengo un «principio», ese es tomar una visión que me inspira y compartirla con más personas — a través de palabras, código y demos.

Y la recarga en caliente me inspira.

---

He intentado varias veces implementar la recarga en caliente para React.

En retrospectiva, [el primer demo](https://vimeo.com/100010922) que armé cambió mi vida. Conseguí mis primeros seguidores en Twitter, mis primeras mil estrellas en GitHub, luego mi primea aparición en [portada de HN](https://news.ycombinator.com/item?id=8982620), e incluso mi primera [ponencia en una conferencia](https://www.youtube.com/watch?v=xsSnOQynTHs) (trayendo a la vida a Redux, ups). Esta primera iteración funcionó bastante bien. Sin embargo, React se *apartó* de `createClass`, haciendo una implementación confiable mucho más díficil.

Desde entonces he hecho [algunos otros intentos](https://medium.com/@dan_abramov/hot-reloading-in-react-1140438583bf?source=user_profile---------6------------------) para arreglarlos, cada uno defectuoso en una manera diferente. Uno de ellos aún se usa en React Native (la recarga en caliente de funciones no funciona allí debido a mis errores — ¡lo siento!)

Frustrado por mi inhabilidad para resolver algunos problemas y por la falta de tiempo, le pasé React Hot Loader a un grupo de talentosos colaboradores. Ellos lo han hecho avanzar y han encontrado ingeniosas soluciones para mis defectuosos diseños. Les estoy agradecido por mantener el proyecto en buen estado a pesar de los desafíos.

---

**Para dejarlo claro, la recarga en caliente en React es bastante utilizable al día de hoy.** De hecho este blog usa Gatsby, que a su vez utiliza React Hot Loader tras bambalinas. Guardo esta publicación en mi editor y se actualiza sin refrescar. ¡Magia! En cierta forma, la visión que me preocupaba que nunca llegaría a tener uso generalizado es ya casi aburrida.

Pero hay muchas personas que sienten que no es tan buena como podría serlo. Algunos la desestiman viéndola como un mero truco y eso me parte un poco el corazón; pero creo que lo que están diciendo en realidad es: **la experiencia no es transparente.** No vale la pena si nunca estás seguro si una recarga en caliente funcionó, si se quiebra de forma confusa, o si es más fácil simplemente refrescar. Estoy de acuerdo con esto al 100%, pero para mí significa que tenemos más trabajo que hacer. Y estoy emocionado en comenzar a pensar acerca de como se vería en el futuro la recarga en caliente con soporte oficial en React.

(Si usas un lenguaje como Elm, Reason o ClojureScript, quizá esos problemas ya están resueltos en tu ecosistema. Estoy contento de que estés contento. Ello no me detendrá en intentar y fallar en traer cosas buenas a Javascript).

---

Creo que estoy listo para hacer otro intento de implementarla. He aquí por qué.

Desde que `createClass` dejó de ser la primera forma de definir componentes, **la mayor fuente de complejidad y fragilidad en la recarga en caliente de componentes ha sido reemplazar dinámicamente los métodos de las clases.** ¿Cómo parchear instancias existentes de clases con nuevas «versiones» de sus métodos? La respuesta simple es «reemplazarlos en el prototipo», pero incluso con Proxys, en mi experiencia, hay demasiadas situaciones especiales como para que funcione de manera confiable.

En comparación, la recarga en caliente de funciones es sencilla. Un plugin de Babel podría dividir cualquier componente de función exportado desde un módulo en dos funciones:

```jsx
// Reasigna la última versión
window.latest_Button = function(props) {
  // Tu código se mueve aquí por un plugin
  return <button>Hello</button>;
}

// Piensa en esto como un «proxy»
// que los otros componentes usarían
export default function Button(props) {
  // Siempre apunta a la última versión
  return window.latest_Button(props);
}
```

Cada vez que este módulo se vuelve a ejecutar luego de una edición, `window.latest_Button` apuntaría a la última implementación. Reusar la misma función `Button` entre evaluaciones de módulos nos permitiría engañar a React para que no desmonte nuestro componente aún cuando hayamos cambiado la implementación.

Por mucho tiempo, me pareció que implementar la recarga en caliente de manera confiable *únicamente* para funciones animaría a escribir código enrevesado solo para evitar el uso de clases. Pero con los [Hooks](https://reactjs.org/docs/hooks-intro.html), los componentes de función no son segundos de nadie por lo que esto ha dejado de ser una preocupación. Y este enfoque «sencillamente funciona» con los Hooks:

```jsx{4}
// Reasigna la última versión
window.latest_Button = function(props) {
  // Tu código se mueve aquí por un plugin
  const [name, setName] = useState('Mary');
  const handleChange = e => setName(e.target.value);
  return (
    <>
      <input value={name} onChange={handleChange} />
      <h1>Hello, {name}</h1>
    </>
  );
}

// Piensa en esto como un «proxy»
// que los otros componentes usarían
export default function Button(props) {
  // Siempre apunta a la última versión
  return window.latest_Button(props);
}
```

Siempre y cuando el orden de invocación de los Hooks no cambie, podemos preservar el estado incluso mientras se remplaza `window.latest_Button` entre ediciones. Y reemplazar manejadores de eventos «simplemente funciona» también — porque los Hooks dependen de clausuras, y en este caso reemplazamos toda la función.

---

Este es simplemene un vago esbozo de un posible enfoque. Hay más (algunos son muy diferentes). ¿Cómo podemos evaluarlos y compararlos?

Antes de que me apegue demasiado a un enfoque en específico que pueda ser de alguna manera defectuoso, **decidí escribir algunos principios que creo de importancia para juzgar cualquier implementación de recarga en caliente para el código de componentes.**

Sería bueno luego expresar estos principios como pruebas. Estas reglas no son estrictas y se podría ceder de manera razonable en algunas. Pero si decidimos romperlas, debería ser una decisión de diseño explícita y no algo que descubramos luego accidentalmente.

He aquí mi lista de deseos para recargar instantáneamentes componentes de React:

### Corrección

* **La recarga en caliente no debe ser observable antes de la primera edición.** Hasta que guardes un archivo, el código debería comportarse exactamente como si la recarga en caliente estuviera deshabilitada. Se espera que cosas como `fn.toString()` no se correspondan, lo cual ya es así con la minificación. Pero no debería afectar lógica razonable de la aplicación y las bibliotecas.

* **La recarga en caliente no debería romper las reglas de React.** No se debería invocar los elementos del ciclo de vida de los componentes de una manera inesperada, intercambiar accidentalmente el estado entre árboles no relacionados, o hacer otras cosas impropias de React.

* **El tipo de un elemento siempre debería estar acorde con el tipo esperado.** Algunos enfoques encapsulan tipos de componentes pero ello afecta a `<MiComponente />.type === MiComponente`. Es una causa común de errores y no debería ocurrir.

* **Debería ser fácil soportar todos los tipos de React.** `lazy`, `memo`, `forwardRef` — todos deberían soportarse y no debería ser difícil añadir soporte para más. Variaciones anidades como `memo(memo(...))` también deberían funcionar. Siempre deberíamos remontar cuando la forma del tipo cambia.

* **No debería reimplementar una parte no trivial de React.** Es difícil mantener el paso de React. Si una solución reimplementa React representa un problema a largo plazo cuando React añada funcionalidades como Suspense.

* **Reexportar no debería dejar de funcionar.** Si un componente reexporta componentes de otros módulos (ya sea propios o de `node_modules`), ello no debería causar ningún problema.

* **Los atributos estáticos no deberían dejar de funcionar** Si defines un método `ProfilePage.onEnter`, esperarías que un módulo que lo importe sea capaz de leerlo. A veces las bibliotecas dependen de esto por lo que es importante que sea posible leer y escribir atributos estáticos, y que el componente en sí que «vea» los mismos valores en sí mismo.

* **Es mejor perder estado local que comportarse incorrectamente.** Si no podemos parchear algo de manera confiable (por ejemplo, una clase), es mejor perder su estado local que realizar un esfuerzo en actualizarlo con solo un éxito parcial. El desarrollador desconfiará de todas formas y probablemente forzará refrescar. Debemos ser intencionales en cuanto a qué casos estamos seguros de poder manejar, y descartar el resto.

* **Es mejor perder estado local que usar una versión antigua.** Esta es una variación más específica del principio anterior. Por ejemplo, si una clase no puede ser recargada instantáneamente, el código debería forzar un remonte de aquellos componentes con la nueva versión en lugar de seguir renderizando un zombi.

### Localidad

* **Editar un módulo debería reejecutar tan pocos módulos como sea posible.** Los efectos secundarios durante la inicialización de módulos generalmente se desaconsejan. Pero mientras más código se ejecuta, es más probable que algo cause un desastre cuando se invoque dos veces. Estamos escribiendo Javascript, y los componentes de React son islas de (relativa) pureza, pero incluso allí no tenemos fuertes garantías. Por lo que si edito un módulo, mi solución de recarga en caliente debería reejecutar ese módulo e intentar detenerse ahí si fuera posible.

* **Editar un componente no debería destruir el estado de sus padres o hermanos.** De manera similar a como `setState()` solo afecta el árbol hacia abajo, editar un componente no debería afectar nada por encima de él.

* **Las ediciones de código que no sea de React deberían propagarse hacia arriba.** Si editas un archivo con constantes o funciones puras que es importado por varios componentes, esos componentes deberían actualizarse. Es aceptable perder estado de módulo en esos archivos.

* **Un error de ejecución introducido durante la recarga en caliente no debería propagarse.** Si cometes un error en un componente, no debería romper toda tu aplicación. En React, esto se resuelve usualmente con barreras de error. Sin embargo, estas son demasiado molestas para los incontables errores tipográficos que cometemos al hacer una edición. Debería ser capaz de cometer y resolver errores en tiempo de ejecución mientras trabajo en un componente sin que se desmonten sus hermanos o padres. Sin embargo, los errores que *no* ocurren durante la recarga en caliente (y que son errores legítimos en mi código) deberían ir a la barrera de error más cercana.

* **Preservar el estado propio a menos que esté claro que el desarrollador no lo desea.** Si solo estás ajustando estilos, es frustante que se reinicie el estado en cada edición. Por otra parte, si lo que haces es cambiar la forma del estado o el estado inicial, a menudo prefieres reiniciarlo. Por defecto deberíamos hacer nuestro mejor esfuerzo para preservar el estado. Pero si lleva a un error durante la recarga en caliente, eso es a menudo un signo de que alguna suposición cambió, por lo que deberíamos reiniciar el estado e *intentar* renderizar en ese caso. Comentar y descomentar código es común por lo que es importante manejar ese caso elegantemente. Por ejemplo, eliminar Hooks *al final* no debería reiniciar el estado.

* **Descartar el estado cuando está claro que el desarrollador así lo desea.** En algunos casos podemos detectar proactivamente que el usuario quiere reiniciar. Por ejemplo, si el orden de los Hooks cambió, o si Hooks primitivos como `useState` cambian su tipo de estado inicial. También podemos ofrecer una anotación ligera que se pueda usar para forzar a un componente a reiniciarse en cada edición. Podría ser algo como `// !` u otra convención similar que sea rápida de añadir y eliminar mientras te enfocas en como se monta el componente.

* **Soportar actualizar elementos «fijos».** Si un componente se envuelve con `memo()`, la recarga en caliente debería aún ser capaz de actualizarlo. Si un efecto se llama con `[]`, debería aún reemplazarlo. El código es como una variable invisible. Anteriormente, pensaba que era importante forzar actualizaciones profundas hacia abajo para casos como `renderRow={this.renderRow}`. En el mundo de los Hooks, dependemos de todas formas de las clausuras por lo que esto parece ya innecesario. Una referencia diferente debería ser suficiente.

* **Soportar múltiples componentes en un archivo.** Es un patrón común que se definan múltiples componentes en el mismo archivo. Aún si solo mantenemos el estado para los componentes de función, queremos estar seguros de que ponerlos en un archivo no cause que pierdan estado. Note que estos pueden ser mutualmente recursivos.

* **Cuando sea posible, preservar el estado de los hijos.** Si editas un componente, siempre resulta frustrante si sus hijos inintencionadamente pierden estado. Siempre y cuando los tipos de elemento de los hijos se definan en otros archivos, esperamos que su estado se preserve. Si están en el mismo archivo, deberíamos hacer nuestro mayor esfuerzo.

* **Soportar Hooks personalizados.** Para Hooks personalizados bien escritos (algunos casos como `useInterval()` pueden ser un poco difíciles), recargar instantáneamente cualquier parámetro (incluidas funciones) debería funcionar. Esto no debería necesitar trabajo extra y es consecuencia del diseño de los Hooks. Nuestra solución simplemente no debería meterse en el medio. 

* **Soportar *render props*.** Esto usualmente no representa un problema, pero vale la pena verificar que funcionen y se actualizan como se espera.

* **Soportar componentes de alto nivel.** Encapsular una exportación en un componente de alto nivel como `connect` no debería interrumpir la recarga en caliente ni la preservación del estado. Si se usa un componente creado por un HOC en JSX (como `styled`), y ese componente es una clase, se espera que pierda estado cuando se instancia en el archivo editado. Pero un HOC que devuelve un componente de función (potencialmente usando Hooks) no debería perder estado aún si se define en el mismo archivo. De hecho, incluso ediciones a sus parámetros (por ejemplo `mapStateToProps`) deberían ser reflejadas.

### Retroalimentación

* **Tanto el éxito como el fracaso debería proveer retroalimentación visual.** Siempre deberías estar seguro de si una recarga en caliente falló o no. En caso de un error de ejecución o de sintaxis debería mostrarse una capa que sería automáticamente eliminada luego de volverse irrelevante. Cuando la recarga en caliente es exitosa, debería existir algún tipo de retroalimentación visual como un destello en los componentes actualizados o una notificación.

* **Un error de sintaxis no debería causar un error de ejecución o que se refresque.** Cuando editas el código y tienes un error de sintaxis, debería mostrarse en una capa modal (de manera ideal, con un enlace al editor). Si cometes otro error de sintaxis, la capa existente se actualiza. La recarga en caliente solo se intenta realizar *después* de que corrijas tus errores de sintaxis. Un error de sintaxis no debería provocar que pierdas el estado.

* **Un error de sintaxis después de recargar debería estar aún visible.** Si ves una capa modal de error de sintaxis y refrescas, deberías continuar viéndola. No debería permitirte bajo ningún concepto ejecutar la última versión (Lo he visto en algunas configuraciones).

* **Considerar exponer herramientas que empoderen al usuario.** Con la recarga en caliente el código mismo puede ser tu «terminal». Además del hipotético comando `// !` para forzar remontar, podría existir, por ejemplo, un comando `// inspect` que muestre un panel con valores de los props al lado del componente. ¡Sé creativo!

* **Minimizar el ruido.** Las herramientas de desarrollo y los mensajes de advertencia no deberían exponer que estamos haciendo algo especial. Evita romper `displayName` o añadir envoltorios inútiles a la salida de la depuración.

* **La depuración en los principales navegadores debería mostrar el código más reciente.** Si bien esto no depende totalmente de nosotros, deberíamos hacer nuestro mayor esfuerzo para asegurar que el depurador del navegador muestra la versión más reciente de cualquier archivo y que los puntos de quiebre funcionan como se espera.

* **Optimizar para iteraciones rápidas, no largas refactorizaciones.** Esto es Javascript, no Elm. Cualquier serie larga de ediciones lo más probable es que no se recargue instantáneamente bien debido a un puñado de errores que necesitan corregirse uno por uno. Ante la duda, optimiza para el caso de uso de ajustar algunos componentes en un pequeño ciclo de interaciones en lugar de para una gran refactorización. Y sé predecible. Ten en mente que si pierdes la confianza del desarrollador, este refrescará de todas formas.

---

Esta es mi lista de deseos de cómo la recarga en caliente en React —o cualquier otro sistema de componentes que ofrezca más que plantillas— debe funcionar. Hay probablemente más cosas que añadiré aquí con el tiempo.

No sé cuántos de estos objetivos podemos satisfacer con Javascript. Pero hay una razón adicional por la que estoy deseando trabajar en la recarga en caliente de nuevo. Como ingeniero soy más organizado que antes. En particular, **finalmente aprendí la lección de apuntar los requerimientos como estos antes de involucrarme en otra implementación.**

¡Quizá esta funcione de verdad! Pero si no lo hace, al menos habré dejado algunas migas en el camino de la próxima persona que lo intente.
