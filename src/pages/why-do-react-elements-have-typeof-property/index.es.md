---
title: ¿Por qué los elementos de React tienen una propiedad $$typeof?
date: '2018-12-03'
spoiler: Tiene algo que ver con la seguridad.
---

Puede que creas que estás escribiendo JSX:

```jsx
<marquee bgcolor="#ffa7c4">hola</marquee>
```

Pero en realidad, estás llamando a una función:

```jsx
React.createElement(
  /* type */ 'marquee',
  /* props */ { bgcolor: '#ffa7c4' },
  /* children */ 'hola'
)
```

Y esa función te devuelve un objeto. Llamamos a este objeto un *elemento* de React. Este le dice a React qué es lo próximo que debe renderizar. Tus componentes devuelven un árbol de ellos.

```jsx{9}
{
  type: 'marquee',
  props: {
    bgcolor: '#ffa7c4',
    children: 'hi',
  },
  key: null,
  ref: null,
  $$typeof: Symbol.for('react.element'), // 🧐 ¿¿¿¿¿¿¿Quién es este???????
}
```

Si has utilizado React puede que te sean familiares los campos `type`, `props`, `key` y `ref`. ¿**Pero, qué es `$$typeof`? ¿Y por qué tiene un `Symbol()` como valor?**

Esta es otra de esas cosas que *no* necesitas saber para utilizar React, pero que te harán sentir bien una vez que lo hagas. También hay en este artículo algunos consejos sobre seguridad que te podrían interesar. Quizá algún día escribas tu propia biblioteca de IU y todo esto te sea útil. Espero que así sea.

---

Antes que las bibliotecas de IU del lado del cliente se volvieran comunes y añadieran una protección básica, era común que en el código de las aplicaciones se construyera HTML y se insertara en el DOM:

```jsx
const messageEl = document.getElementById('message');
messageEl.innerHTML = '<p>' + message.text + '</p>';
```

Eso funciona bien, excepto que cuando tu `message.text` es algo como `'<img src onerror="robarTuContraseña()">'`. **Ciertamente no quieres que cosas escritas por extraños aparezcan sin procesar en el HTML renderizado de tu aplicación.**

(Dato curioso: si solo haces renderizado del lado del cliente, una etiqueta `<script>` aquí no te permitiría ejecutar Javascript. Pero [no dejes que esto](https://gomakethings.com/preventing-cross-site-scripting-attacks-when-using-innerhtml-in-vanilla-javascript/) te haga confiar con un falso sentido de seguridad).

Para protegerte de estos ataques, puedes utilizar APIs seguras como `document.createTextNode()` o `textContent` que solo tratan con texto. También puedes con previsión «escapar» las entradas mediante el reemplazo de caracteres potencialmente peligrosos como `<`, `>` y otros en cualquier texto proporcionado por el usuario.

Aún así, el costo de un error es alto y es molesto recordarlo cada vez que interpoles una cadena escrita por el usuario en tu salida. **Por eso es que las bibliotecas modernas como React escapan el contenido de texto para las cadenas por defecto:**

```jsx
<p>
  {message.text}
</p>
```

Si `message.text` es una cadena maliciosa con una etiqueta `<img>` o cualquier otra, no se convertirá en una etiqueta `<img>` real. React escapará el contenido y *luego* lo insertará en el DOM. Por tanto, en lugar de ver la etiqueta `<img>` solo verás su código.

Para poder renderizar HTML arbitrariamente dentro de un elemento de React, tienes que escribir `dangerouslySetInnerHTML={{ __html: message.text }}`. **El hecho de que sea complicado escribirlo es una *característica*.** Está hecho para que sea bien visible y así se detecte sin problemas en revisiones de código y auditorías a la base de código.

---

**¿Significa eso que React es completamente inmune a los ataques de inyección? No.** HTML y el DOM ofrecen [un amplio espacio para los ataques](https://github.com/facebook/react/issues/3473#issuecomment-90594748) que hace que sea muy difícil o lento para React u otras bibliotecas de IU poder mitigarlos. La mayoría de los ataques restantes involucran atributos. Por ejemplo, si renderizas `<a href={usuario.sitioWeb}>`, tienes que tener cuidado del usuario cuyo sitio web es `'javascript: robarTuContraseña()'`. Propagar las entradas del usuario de la forma `<div {...datosDeUsuario}>` no es común, pero sí peligroso.

React [podría](https://github.com/facebook/react/issues/10506) ofrecer mayor protección con el tiempo pero en muchos casos son consecuencia de problemas en el servidor que [deben](https://github.com/facebook/react/issues/3473#issuecomment-91327040) ser solucionados allí de todas formas.

Aún sí, escapar el contenido del texto es una primera línea de defensa razonable que captura muchos ataques potenciales. ¿Acaso no resulta agradable saber que código como este es seguro?

```jsx
// Escapado automáticamente
<p>
  {message.text}
</p>
```

**Bueno, eso no siempre fue así.** Y ahí es donde entra en escena `$$typeof`.

---

Los elementos de React están concebidos en su diseño como objetos simples:

```jsx
{
  type: 'marquee',
  props: {
    bgcolor: '#ffa7c4',
    children: 'hi',
  },
  key: null,
  ref: null,
  $$typeof: Symbol.for('react.element'),
}
```

Si bien normalmente se crean con `React.createElement()`, no es un requerimiento. Hay casos de uso válidos para que React admita elementos de objetos simples escritos como lo acabo de hacer arriba. Por supuesto, probablemente no *querrías* escribirlos así, pero [puede ser](https://github.com/facebook/react/pull/3583#issuecomment-90296667) útil en la optimización de un compilador, en el paso de elementos de la IU entre *workers* o para desacoplar JSX del paquete de React.

Sin embargo, **si tu servidor tiene un agujero que permite al usuario almacenar objetos JSON arbitrarios** mientras el código del cliente espera una cadena, esto se puede convertir en un problema:

```jsx{2-10,15}
// El servidor podría tener un agujero que permita al usuario almacenar JSON
let expectedTextButGotJSON = {
  type: 'div',
  props: {
    dangerouslySetInnerHTML: {
      __html: '/* pon tu exploit aquí */'
    },
  },
  // ...
};
let message = { text: expectedTextButGotJSON };

// Peligroso en React 0.13
<p>
  {message.text}
</p>
```

En ese caso, React 0.13 sería [vulnerable](http://danlec.com/blog/xss-via-a-spoofed-react-element) a un ataque XSS. Para aclarar nuevamente, **este ataque depende de un agujero existente en el servidor**. Aún así, React podría hacer un mejor trabajo para protegernos contra eso. Y a partir de React 0.14, lo hace.

La solución en React 0.14 fue [etiquetar cada elemento de React con un `Symbol`](https://github.com/facebook/react/pull/4832):

```jsx{9}
{
  type: 'marquee',
  props: {
    bgcolor: '#ffa7c4',
    children: 'hi',
  },
  key: null,
  ref: null,
  $$typeof: Symbol.for('react.element'),
}
```

Funciona porque no puedes poner `Symbol`s en JSON. **Así que incluso si el servidor tiene un agujero de seguridad y devuelve JSON en lugar de texto, ese JSON no puede incluir `Symbol.for('react.element')`.** React comprobará el campo `element.$$typeof`, y se negará a procesar el elemento si no existe o no es válido.

Una ventaja de usar `Symbol.for()` en específico es que **Los `Symbol`s son globales entre entornos como *iframes* y *workers*.** Así que esta solución no previene el paso de elementos confiables entre diferentes partes de la aplicación, aún en condiciones más exóticas. De manera similar, aún si hay múltiples copias de React en la página, estas se pueden «poner de acuerdo» en el valor válido de `$$typeof`.

---

¿Y qué pasa con los navegadores que [no son compatibles con los](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Symbol#Browser_compatibility) `Symbol`s?

Bueno, no tienen esta protección adicional. React, por consistencia, también incluye el campo `$$typeof` en el elemento, pero le [asigna un número](https://github.com/facebook/react/blob/8482cbe22d1a421b73db602e1f470c632b09f693/packages/shared/ReactSymbols.js#L14-L16): `0xeac7`.

¿Por qué este número en específico? `0xeac7` se parece un poquito a «React».
