---
title: React como un «runtime» para interfaces de usuario
date: '2019-02-02'
spoiler: Una descripción detallada del modelo de programación de React.
---

La mayoría de los tutoriales introducen a React como una biblioteca de interfaces de usuario (IU). Tiene lógica porque React *es* una biblioteca de IU. ¡Eso es literalmente lo que dice el eslogan!

![React homepage screenshot: "A JavaScript library for building user interfaces"](./react.png)

He escrito antes sobre los desafíos de crear [interfaces de usuario](/the-elements-of-ui-engineering/). Pero este artículo trata a React de una manera distinta, más como un [*runtime*](https://en.wikipedia.org/wiki/Runtime_system) (también llamado entorno en tiempo de ejecución).

**Este artículo no te enseñará nada sobre la creación de interfaces de usuario.** Pero podría ayudarte a entender el modelo de programación de React con mayor profundidad.

---

**Nota: Si estás _aprendiendo_ React, consulta en cambio [la documentación](https://reactjs.org/docs/getting-started.html#learn-react).**

<font size="60">⚠️</font>

**Esta es una inmersión profunda, NO ES un artículo adecuado para principiantes.** En este artículo describo la mayor parte del modelo de programación de React desde la base. No explico cómo usarlo, solo como funciona.

Está dirigido a programadores experimentados y personas que trabajan en otras bibliotecas de IU y han preguntado sobre algunas decisiones en React en que se han adoptado términos medios. ¡Espero que les resulte útil!

**Muchas personas llegan a utilizan React por años sin pensar acerca de la mayoría de estos temas.** Esta es definitivamente una visión de React centrada en la programación, más que, digamos, [centrada en el diseño](http://mrmrs.cc/writing/developing-ui/). Pero no creo haga daño tener recursos para ambas.

Pasada ya la advertencia, ¡continuemos!

---

## Árbol anfitrión

Algunos programas dan como resultado números, otros, poemas. Los diferentes lenguajes y sus *runtimes* a menudo están optimizados para un conjunto particular de casos de uso y React no es la excepción.

Los programas de React generalmente dan como resultado **un árbol que puede cambiar con el tiempo**. Puede ser un [árbol DOM](https://www.npmjs.com/package/react-dom), una [jerarquía de iOS](https://developer.apple.com/library/archive/documentation/General/Conceptual/Devpedia-CocoaApp/View%20Hierarchy.html), un árbol de [primitivas PDF](https://react-pdf.org/), o incluso de [objetos JSON](https://reactjs.org/docs/test-renderer.html). Sin embargo, lo que queremos generalmente es representar alguna IU con él. Lo llamaremos árbol *anfitrión*, porque es parte del *entorno anfitrión* fuera de React (como DOM o iOS). El árbol anfitrión a menudo tiene [su](https://developer.mozilla.org/en-US/docs/Web/API/Node/appendChild) [propia](https://developer.apple.com/documentation/uikit/uiview/1622616-addsubview) API imperativa. React es una capa encima de ella.

¿Entonces para qué sirve React? Muy abstractamente, te ayuda a escribir un programa que manipula predeciblemente un árbol anfitrión complejo en respuesta a eventos externos como interacciones, respuestas de la red, temporizadores, etc.

Una herramienta especializada funciona mejor que una genérica cuando puede imponer y tomar provecho de algunas restricciones. React se basa en dos principios:

* **Estabilidad.** El árbol anfitrión es relativamente estable y la mayoría de las actualizaciones no cambian radicalmente su estructura general. Si una aplicación reorganizara todos sus elementos interactivos resultando en una combinación completamente diferente cada segundo, sería difícil de usar. ¿Dónde fue a parar ese botón? ¿Por qué está bailando mi pantalla?

* **Regularidad.** El árbol anfitrión se puede dividir en patrones de IU que lucen y se comportan de manera consistente (como botones, listas, avatares) y no formas aleatorias.

**Estos principios resultan ser ciertos para la mayoría de las IU.** Sin embargo, React no es adecuado cuando no hay «patrones» estables en la salida. Por ejemplo, React puede ayudarte a escribir un cliente de Twitter, pero no será muy útil para un [salvapantallas de tuberías en 3D](https://www.youtube.com/watch?v=Uzx9ArZ7MUU).

## Instancias anfitrionas

El árbol anfitrión está formado por nodos. Los llamaremos «instancias anfitrionas».

En el entorno DOM, las instancias anfitrionas son nodos DOM comunes (como los objetos que obtienes al llamar a `document.createElement('div')`). En iOS, las instancias anfitrionas podrían ser valores que identifiquen de manera única desde Javascript una vista nativa.

Las instancias anfitrionas tienen sus propias propiedades (p. ej. `domNode.className` o `view.tintColor`). Podrían también contener otras instancias anfitrionas como hijas.

(Esto no tiene nada que ver con React, lo que hago es describir los entornos anfitriones).

Generalmente hay una API para manipular las instancias anfitrionas. Por ejemplo, el DOM proporciona entre otras API `appendChild`, `removeChild`, `setAttribute`. En las aplicaciones React, generalmente no se llama a estas API. Ese es trabajo de React.

## Renderizador

Un *renderizador* le enseña a React a hablar con un entorno anfitrión en específico y manejar sus instancias anfitrionas. React DOM, React Native, e incluso [Ink](https://mobile.twitter.com/vadimdemedes/status/1089344289102942211) son renderizadores de React. También tú puedes [crear tu propio renderizador de React](https://github.com/facebook/react/tree/master/packages/react-reconciler).

Los renderizadores de React pueden funcionar en uno o dos modos.

La mayoría de los renderizadores se escriben para utilizar el modo de «mutación». Este modelo es cómo funciona el DOM: podemos crear un nodo, establecer sus propiedades y luego añadir o eliminar hijos de él. Las instancias anfitrionas son completamente mutables.

React también puede funcionar en un modo «persistente». Este modo es para entornos anfitriones que no proporcionan métodos como `appendChild()` pero en su lugar clonan el árbol padre y siempre reemplazan el hijo del nivel superior. La inmutabilidad al nivel del árbol anfitrión hace más fácil el uso de multihilo. [React Fabric](https://facebook.github.io/react-native/blog/2018/06/14/state-of-react-native-2018) toma provecho de ello.

Como usuario de React, nunca tienes que pensar acerca de estos modos. Solo quiero resaltar que React no es solo un adaptador de un modo a otro. Su utilidad es ortogonal al paradigma de API de vista de bajo nivel al que está enfocado.

## Elementos de React

En el entorno anfitrión, una instancia anfitriona (como un nodo DOM) es el bloque de construcción más pequeño. En React, el bloque de construcción más pequeño es un *elemento de React*.

Un elemento de React es un objeto plano de Javascript. Puede *describir* una instancia anfitriona.

```jsx
// JSX es azúcar sintáctica para estos objetos.
// <button className="blue" />
{
  type: 'button',
  props: { className: 'blue' }
}
```

Un elemento de React es ligero y no tiene una instancia anfitriona vinculada a él. Repito, es meramente una *descripción* de lo que quieres ver en pantalla.

Al igual que las instancias anfitrionas, los elementos de React pueden formar un árbol:

```jsx
// JSX es azúcar sintáctica para estos objetos.
// <dialog>
//   <button className="blue" />
//   <button className="red" />
// </dialog>
{
  type: 'dialog',
  props: {
    children: [{
      type: 'button',
      props: { className: 'blue' }
    }, {
      type: 'button',
      props: { className: 'red' }
    }]
  }
}
```

*(Nota: He omitido [algunas propiedades](/why-do-react-elements-have-typeof-property/) que no son importantes para esta explicación.)*

Sin embargo, recuerda que **los elementos de React no tienen su propia identidad persistente.** Están pensados para ser recreados y desechados todo el tiempo.

Los elementos de React son inmutables. Por ejemplo, no puedes cambiar los hijos o una propiedad de un elemento de React. Si quieres renderizar algo distinto luego, lo *describirás* con un nuevo árbol de elementos de React creado desde cero.

Me gusta pensar en los elementos de React como fotogramas de una película. Capturan cómo se debe ver la IU en un instante específico de tiempo. No cambian.

## Punto de entrada

Cada renderizador de React tiene un «punto de entrada». Es la API que nos permite decirle a React que renderice un árbol de elementos de React en particular dentro de una instancia anfitriona que lo contenga.

Por ejemplo, el punto de entrada de React DOM es `ReactDOM.render`:

```jsx
ReactDOM.render(
  // { type: 'button', props: { className: 'blue' } }
  <button className="blue" />,
  document.getElementById('container')
);
```

Cuando decimos `ReactDOM.render(reactElement, domContainer)`, lo que queremos decir es: **«Querido React, haz que el árbol anfitrión `domContainer` tenga una correspondencia con `reactElement`».**

React buscará en el atributo `reactElement.type` (en nuestro ejemplo, `'button'`) y le pedirá al renderizador de React DOM que cree una instancia anfitriona para él y le asigne las propiedades:

```jsx{3,4}
// En algún lugar del renderizador de ReactDOM (simplificado)
function createHostInstance(reactElement) {
  let domNode = document.createElement(reactElement.type);
  domNode.className = reactElement.props.className;
  return domNode;
}
```

En nuestro ejemplo, lo que hará React es:

```jsx{1,2}
let domNode = document.createElement('button');
domNode.className = 'blue';

domContainer.appendChild(domNode);
```

Si un elemento de React tiene elementos hijos en `reactElement.props.children`, React creará recursivamente instancias anfitrionas también para ellos en el primer renderizado.

## Conciliación

¿Qué ocurre si llamamos a `ReactDOM.render()` dos veces dentro del mismo contenedor?

```jsx{2,11}
ReactDOM.render(
  <button className="blue" />,
  document.getElementById('container')
);

// ... luego ...

// ¿Debería esto *reemplazar la instancia anfitriona
// o solo actualizar una propiedad en una existente?
ReactDOM.render(
  <button className="red" />,
  document.getElementById('container')
);
```

Repito, el trabajo de React es *hacer que el árbol anfitrión se corresponda con el árbol de elementos de React proporcionado*. El proceso de averiguar *qué* hacer al árbol de instancias anfitrionas en respuesta a la nueva información se denomina en ocasiones [conciliación](https://reactjs.org/docs/reconciliation.html).

Hay dos vías de hacerlo. Una versión simplificada de React podría eliminar completamente el árbol existente y recrearlo desde cero.

```jsx
let domContainer = document.getElementById('container');
// Limpiar el árbol
domContainer.innerHTML = '';
// Crear el nuevo árbol de instancias anfitrionas
let domNode = document.createElement('button');
domNode.className = 'red';
domContainer.appendChild(domNode);
```

Pero en el DOM, esto es lento y pierde información importante como el foco, la selección, el estado de la navegación, etc. En su lugar, queremos que React haga algo como esto:

```jsx
let domNode = domContainer.firstChild;
// Actualizar instancias anfitrionas existentes
domNode.className = 'red';
```

En otras palabras, React necesita decidir cuándo _actualizar_ una instancia anfitriona existente para hacerla corresponder con un nuevo elemento de React y cuándo crear una _nueva_.

Esto genera una pregunta de *identidad*. El elemento de React puede ser diferente cada vez, pero, ¿cuándo hace referencia conceptualmente a la misma instancia anfitriona?

En nuestro ejemplo es sencillo. Habíamos renderizado un `<button>` como primero (y único) hijo, y queremos renderizar un `<button>` en el mismo lugar otra vez. Ya tenemos una instancia anfitriona `<button>`, entonces, ¿para qué recrearla? Sencillamente reutilicémosla.

Esto está bastante cerca de como React lo analiza.

**Si un tipo de elemento en el mismo lugar en el árbol «coincide» entre el renderizado anterior y el próximo, React reutiliza la instancia anfitriona existente.**

Aquí hay un ejemplo con comentarios que muestra a grandes rasgos lo que hace React:

```jsx{9,10,16,26,27}
// let domNode = document.createElement('button');
// domNode.className = 'blue';
// domContainer.appendChild(domNode);
ReactDOM.render(
  <button className="blue" />,
  document.getElementById('container')
);

// ¿Se puede reutilizar la instancia anfitriona? ¡Sí! (button → button)
// domNode.className = 'red';
ReactDOM.render(
  <button className="red" />,
  document.getElementById('container')
);

// ¿Se puede reutilizar la instancia anfitriona? ¡No! (button → p)
// domContainer.removeChild(domNode);
// domNode = document.createElement('p');
// domNode.textContent = 'Hello';
// domContainer.appendChild(domNode);
ReactDOM.render(
  <p>Hello</p>,
  document.getElementById('container')
);

// ¿Se puede reutilizar la instancia anfitriona? ¡Sí! (p → p)
// domNode.textContent = 'Goodbye';
ReactDOM.render(
  <p>Goodbye</p>,
  document.getElementById('container')
);
```

La misma heurística se usa para árboles hijos. Por ejemplo, cuándo actualizamos un `<dialog>` con dos `<button>`s dentro, React primero decide si reutiliza el `<dialog>` y luego repite este proceso de decisión para cada hijo.

## Condiciones

Si React solo reutiliza instancias anfitrionas cuando los tipos de los elementos «coinciden» entre actualizaciones, ¿cómo podemos renderizar contenido condicional?

Digamos que queremos mostrar primero solo un campo de entrada, pero luego renderizar un mensaje antes de él:

```jsx{12}
// Primer renderizado
ReactDOM.render(
  <dialog>
    <input />
  </dialog>,
  domContainer
);

// Próximo renderizado
ReactDOM.render(
  <dialog>
    <p>I was just added here!</p>
    <input />
  </dialog>,
  domContainer
);
```

En este ejemplo, la instancia anfitriona del `<input>` tendría que ser recreada. React recorrería el árbol del elemento, comparándolo con la versión anterior:

* `dialog → dialog`: ¿Se puede reutilizar la instancia anfitriona? **Sí, el tipo coincide.**
  * `input → p`: ¿Se puede reutilizar la instancia anfitriona? **No, ¡el tipo cambió!** Necesitamos eliminar el `input` existente y crear una nueva instancia anfitriona `p`.
  * `(nothing) → input`: Se necesita crear una nueva instancia anfitriona `input`.

El código de actualización ejecutado por React sería algo como:

```jsx{1,2,8,9}
let oldInputNode = dialogNode.firstChild;
dialogNode.removeChild(oldInputNode);

let pNode = document.createElement('p');
pNode.textContent = 'I was just added here!';
dialogNode.appendChild(pNode);

let newInputNode = document.createElement('input');
dialogNode.appendChild(newInputNode);
```

Esto no es lo mejor, porque *conceptualmente* `<input>` no ha sido *reemplazado* por `<p>`, simplemente se movió. No queremos perder su selección, el estado del foco y el contenido al recrear el DOM.

Si bien este problema tiene una solución sencilla (a la que llegaremos en un minuto), no ocurre frecuentemente en las aplicaciones de React. Es interesantes ver por qué.

En la práctica, raramente llamarías directamente a `ReactDOM.render`. En cambio, las aplicaciones de React tienden a dividirse en funciones como esta:

```jsx
function Form({ showMessage }) {
  let message = null;
  if (showMessage) {
    message = <p>I was just added here!</p>;
  }
  return (
    <dialog>
      {message}
      <input />
    </dialog>
  );
}
```

Este ejemplo no presenta los problemas que acabamos de describir. Puede que sea más fácil ver por qué si usamos notación de objetos en lugar de JSX. Observa el árbol de elementos hijo de `dialog`.

```jsx{12-15}
function Form({ showMessage }) {
  let message = null;
  if (showMessage) {
    message = {
      type: 'p',
      props: { children: 'I was just added here!' }
    };
  }
  return {
    type: 'dialog',
    props: {
      children: [
        message,
        { type: 'input', props: {} }
      ]
    }
  };
}
```

**Sin importar si `showMessage` es `true` o `false`, `<input>` es el segundo hijo y no cambia su posición en el árbol entre renderizados.**

Si `showMessage` cambia de `false` a `true`, React recorrería el árbol del elemento, comparándolo con la versión anterior:

* `dialog → dialog`: ¿Se puede reutilizar la instancia anfitriona? **Sí, el tipo coincide.**
  * `(null) → p`: Se necesita insertar una nueva instancia anfitriona `p`.
  * `input → input`: ¿Se puede reutilizar la instancia anfitriona? **Sí, el tipo coincide.**

Y el código ejecutado por React sería similar a este:

```jsx
let inputNode = dialogNode.firstChild;
let pNode = document.createElement('p');
pNode.textContent = 'I was just added here!';
dialogNode.insertBefore(pNode, inputNode);
```

Ahora no se perdió el estado de la entrada.

## Listas

La comparación del tipo del elemento en la misma posición en el árbol generalmente es suficiente para decidir si reutilizar o recrear la instancia anfitriona correspondiente.

Pero esto solo funciona bien si las posiciones de los hijos son estáticas y no cambian su orden. En nuestro ejemplo previo, aun cuando `message` podría ser un «hueco», todavía sabíamos que ahí el campo de entrada va después del mensaje, y que no hay otros hijos.

Con listas dinámicas, no podemos estar seguros si el orden será siempre el mismo:

```jsx
function ShoppingList({ list }) {
  return (
    <form>
      {list.map(item => (
        <p>
          You bought {item.name}
          <br />
          Enter how many do you want: <input />
        </p>
      ))}
    </form>
  )
}
```

Si la `list` de nuestros artículos de compra se reorganiza, React verá que todos los elementos `p` e `input` dentro tienen el mismo tipo y no sabrá moverlos. (Desde el punto de vista de React, los *elementos en sí* cambiaron, no el orden).

El código que ejecuta React para reorganizar 10 elementos podría ser algo como:

```jsx
for (let i = 0; i < 10; i++) {
  let pNode = formNode.childNodes[i];
  let textNode = pNode.firstChild;
  textNode.textContent = 'You bought ' + items[i].name;
}
```

Por lo que, en lugar de *reordenarlos*, React efectivamente *actualizaría* cada uno de ellos. Esto puede crear problemas de rendimiento y posibles errores. Por ejemplo, el contenido del primer campo de entrada permanecería reflejado en el primer campo de entrada después del ordenamiento, ¡aun cuando conceptualmente puedan hacer referencia a productos diferentes en tu lista de compra!

**Es por esto que React te molesta pidiéndote que especifiques una propiedad especial llamada `key` (llave) cada vez que incluyes un arreglo de elementos en tu salida:**

```jsx{5}
function ShoppingList({ list }) {
  return (
    <form>
      {list.map(item => (
        <p key={item.productId}>
          You bought {item.name}
          <br />
          Enter how many do you want: <input />
        </p>
      ))}
    </form>
  )
}
```

Una llave le dice a React que debe considerar a un elemento *conceptualmente* el mismo aún si entre renderizados tiene una *posición* diferente dentro de su elemento padre.

Cuando React ve `<p key="42">` dentro de un `<form>`, comprobará si el renderizado anterior también tenía `<p key="42">` dentro del mismo `<form>`. Esto funciona incluso si los hijos de `<form>` cambiaron su orden. React reutilizará la instancia anfitriona anterior con la misma llave si existe y reordenará correspondientemente a los hermanos.

Observa que la llave es solo relevante dentro de un elemento React padre en particular, como un `<form>`. React no intentará hacer «coincidir» elementos con las mismas llaves entre diferentes padres. (React no tiene una vía idiomática para mover una instancia anfitriona entre diferentes padres sin recrearla).

¿Qué valor es bueno para una llave? Una forma fácil de responderlo es preguntarse: **¿Cuándo _dirías_ que un elemento es el «mismo» incluso si cambió el orden?** Por ejemplo, en nuestra lista de compras, el ID del producto lo identifica de manera única entre sus hermanos.

## Componentes

Ya hemos visto funciones que devuelven elementos de React:

```jsx
function Form({ showMessage }) {
  let message = null;
  if (showMessage) {
    message = <p>I was just added here!</p>;
  }
  return (
    <dialog>
      {message}
      <input />
    </dialog>
  );
}
```

Son llamadas *componentes*. Nos permiten crear nuestro propio paquete de botones, avatares, comentarios, etc. Los componentes son el elemento esencial en React.

Los componentes toman un argumento (un objeto *hash)*. Contiene «props» (diminutivo de «propiedades»). Aquí, `showMessage` es una prop. Son como argumentos nombrados. 

## Pureza

Se asume que los componentes de React son puros con respecto a sus props.

```jsx
function Button(props) {
  // 🔴 No funciona
  props.isActive = true;
}
```

En general, la mutación no es idiomática en React. (Hablaremos luego más acerca de la forma idiomática de actualizar la IU en respuesta a eventos).

Sin embargo, no hay ningún problema con la *mutación local*:

```jsx{2,5}
function FriendList({ friends }) {
  let items = [];
  for (let i = 0; i < friends.length; i++) {
    let friend = friends[i];
    items.push(
      <Friend key={friend.id} friend={friend} />
    );
  }
  return <section>{items}</section>;
}
```

Creamos `items` *mientras se renderiza* y ningún otro componente lo «vio», por lo que podemos mutarlo tanto como queramos antes de entregarlo como parte del renderizado resultante. No hay necesidad de hacer malabares en tu código para evitar mutaciones locales.

De manera similar, no hay problema con la inicialización diferida a pesar de no ser completamente «pura»:

```jsx
function ExpenseForm() {
  // Está bien si no afecta a otros componentes:
  SuperCalculator.initializeIfNotReady();

  // Continúa leyendo...
}
```

Mientras que la llamada a un componente en múltiples ocasiones sea segura y no afecte el renderizado de otros componentes, a React no le importa si es 100% puro en el sentido estricto de la palabra dentro de la programación funcional (PF). [La idempotencia](https://stackoverflow.com/questions/1077412/what-is-an-idempotent-operation) es más importante para React que la pureza.

Con eso dicho, los efectos secundarios que son directamente visibles al usuario no están permitidos en los componentes de React. Dicho de otra forma, el simple hecho de *llamar* a una función componente no debería por sí mismo producir un cambio en la pantalla.

## Recursividad

¿Cómo *utilizamos* componentes desde otros componentes? Los componentes son funciones, por lo que *podríamos* llamarlos:

```jsx
let reactElement = Form({ showMessage: true });
ReactDOM.render(reactElement, domContainer);
```

Sin embargo, esta *no* es la forma idiomática de usar componentes en el *runtime* de React.

En cambio, la forma idiomática de usar un componente es con el mismo mecanismo que hemos visto anteriormente: Elementos de React. **Esto significa que no tienes que invocar directamente la función del componente, sino dejar a React que lo haga luego por ti**:

```jsx
// { type: Form, props: { showMessage: true } }
let reactElement = <Form showMessage={true} />;
ReactDOM.render(reactElement, domContainer);
```

Y en algún sitio dentro de React, tu componente será llamado:

```jsx
// En algún lugar dentro de React
let type = reactElement.type; // Form
let props = reactElement.props; // { showMessage: true }
let result = type(props); // Whatever Form returns
```

Por convención, los nombres de las funciones componente se escriben con inicial mayúscula. Cuando el transformador de JSX ve `<Form>` y no `<form>`, hace al `type` mismo del objeto un identificador y no una cadena:

```jsx
console.log(<form />.type); // 'form' string
console.log(<Form />.type); // Form function
```

No hay un mecanismo global de registro, literalmente nos referimos a `Form` por el nombre cuando escribimos `<Form />`. Si form no existe en el ámbito local, verás un error de Javascript como lo harías normalmente con un nombre de variable incorrecto.

**Bien, ¿entonces qué hace React cuando un tipo de elemento es una función? Llama a tu componente, y le pregunta qué elemento quiere _ese_ componente renderizar.**

Este proceso continúa recursivament y se describe con mayor detalle [aquí](https://reactjs.org/blog/2015/12/18/react-components-elements-and-instances.html). Resumiendo, luce así:

- **Tú:** `ReactDOM.render(<App />, domContainer)`
- **React:** Oye `App`, ¿qué renderizas?
  - `App`: Renderizo un `<Layout>` con `<Content>` dentro.
- **React:** Oye `Layout`, ¿qué renderizas?
  - `Layout`: Renderizo mis hijos en un `<div>`. Mi hijo era `<Content>`, así que supongo que va dentro dentro del `<div>`.
- **React:** Oye `<Content>`, ¿qué renderizas?
  - `Content`: Renderizo un `<article>` con algún texto y un `<Footer>` dentro.
- **React:** Oye `<Footer>`, ¿qué renderizas?
  - `Footer`: Renderizo un `<footer>` con algún texto más.
- **React:** Bien, aquí va:

```jsx
// Estructura DOM resultante
<div>
  <article>
    Some text
    <footer>some more text</footer>
  </article>
</div>
```

Por eso es que decimos que la conciliación es recursiva. Cuando React recorre el árbol de elementos, puede encontrarse un elemento cuyo `type` es un componente. Lo llamará y seguirá descendiendo hacia abajo del árbol de elementos de React devueltos. Eventualmente se nos acabarán los componentes y React sabrá qué cambiar en el árbol anfitrión.

Las mismas reglas de conciliación que ya discutimos funcionan también aquí. Si el `type` en la misma posición (determinado por el índice y opcionalmente `key`) cambia, React se deshacerá las instancias anfitrionas dentro y las recreará.

## Inversión de control

Podrías estarte preguntando: ¿Por qué no llamamos a los componentes directamente? ¿Por qué escribir `<Form />` y no `Form()`?

**React puede hacer mejor su trabajo si «tiene conocimiento» sobre tus componentes, más que si solo viera el árbol de elementos de React después de llamarlos recursivamente.**

```jsx
// 🔴 React no tiene idea que Layout y Article existen.
// Los estás llamando.
ReactDOM.render(
  Layout({ children: Article() }),
  domContainer
)

// ✅ React sabe que Layout y Article existen.
// React los llama.
ReactDOM.render(
  <Layout><Article /></Layout>,
  domContainer
)
```

Este es un ejemplo clásico de [inversión de control](https://en.wikipedia.org/wiki/Inversion_of_control). Hay algunas propiedades interesantes que obtenemos al dejar a React tomar el control de la llamada de nuestros componentes:

* **Los componentes se vuelven más que funciones.** React puede aumentar las funciones de los componentes con características como *el estado local* que están vinculadas a la identidad del componente en el árbol. Un buen *runtime* proporciona abstracciones fundamentales que coinciden con el problema en cuestión. Como ya mencionamos, React está orientado específicamente a programas que renderizan árboles de IU y responden a interacciones. Si llamas a los componentes directamente, tendrías que construir estas características tú mismo.

* **Los tipos de componentes participan en la conciliación.** Al dejar a React llamar a tus componentes, también le dices más acerca de la estructura conceptual de tu árbol. Por ejemplo, cuando cambias de renderizar `<Feed>` a la página de `<Profile>`, React no intentará reutilizar instancias anfitrionas dentro de ellos (justo como cuando reemplazas `<button>` con un `<p>`). Todo el estado se habrá ido, lo cual generalmente es bueno cuando renderizas una vista conceptualmente diferente. No querrás preservar el estado del campo de entrada entre `<PasswordForm>` y `<MessengerChat>`, incluso si la posición del `<input>` en el árbol accidentalmente se alinea entre ellos.

* **React puede retardar la conciliación.** Si React toma el control sobre las llamadas a nuestros componentes, puede hacer muchas cosas interesantes. Por ejemplo, puede dejar que el navegador haga algún trabajo entre las llamadas a componentes para que el rerenderizado de un árbol grande de componentes [no bloquee el hilo principal](https://reactjs.org/blog/2018/03/01/sneak-peek-beyond-react-16.html). Orquestar esto manualmente sin reimplementar una parte grande de React es difícil.

* **Una mejor historia de depuración.** Si los componentes son ciudadanos de primera categoría de los que la biblioteca está al tanto, podemos construir [mejores herramientas para el desarrollador](https://github.com/facebook/react-devtools) para la instrospección en el desarrollo.

El último beneficio de que React llame tus funciones de componentes es la *evaluación diferida*. Veamos qué significa esto.

## Evaluación diferida

Cuando llamamos funciones en JavaScript, los argumentos se evalúan antes de la llamada:

```jsx
// (2) Esto se calcula de segundo
eat(
  // (1) Esto se calcula primero
  prepareMeal()
);
```

Esto es generalmente lo que esperan los desarrolladores de Javascript, porque las funciones de Javascript pueden tener efectos secundarios implícitos. No sorprendería si llamaramos a una función, pero no se ejecutara hasta que su resultado de alguna forma sea «utilizado» en Javascript.

Sin embargo, los componentes de React son [relativamente](#pureza) puros. No hay absolutamente ninguna necesidad de ejecutarlos si sabemos que su resultado no va a ser renderizado en la pantalla.

Considera este componente que pone `<Comments>` dentro de una `<Page>`:

```jsx{11}
function Story({ currentUser }) {
  // return {
  //   type: Page,
  //   props: {
  //     user: currentUser,
  //     children: { type: Comments, props: {} }
  //   }
  // }
  return (
    <Page user={currentUser}>
      <Comments />
    </Page>
  );
}
```

El componente `Page` puede renderizar los hijos que se le dan desde un `Layout`:

```jsx{4}
function Page({ user, children }) {
  return (
    <Layout>
      {children}
    </Layout>
  );
}
```

*(`<A><B /></A>` en JSX es lo mismo que `<A children={<B />} />`.)*

Pero, ¿qué ocurre si existe una condición temprana de salida?

```jsx{2-4}
function Page({ user, children }) {
  if (!user.isLoggedIn) {
    return <h1>Please login</h1>;
  }
  return (
    <Layout>
      {children}
    </Layout>
  );
}
```

Si llamamos a `Comments()` como una función se ejecutaría inmediatamente sin importar si `Page` quiere renderizarlos o no:

```jsx{4,8}
// {
//   type: Page,
//   props: {
//     children: Comments() // ¡Siempre se ejecuta!
//   }
// }
<Page>
  {Comments()}
</Page>
```

Pero si pasamos un elemento de React, no ejecutamos `Comments` en lo absoluto.

```jsx{4,8}
// {
//   type: Page,
//   props: {
//     children: { type: Comments }
//   }
// }
<Page>
  <Comments />
</Page>
```

Esto le permite a React decidir cuándo y *si* llamarlo. Si nuestro componente `Page` ignora su prop `children` y renderiza en cambio `<h1>Please login</h1>`, React no intentará siquiera llamar a la función `Comments`. ¿Cuál sería el punto en hacerlo?

Esto es bueno porque permite evitar trabajo de renderizado innecesario que de otra forma sería desechado y reduce la fragilidad del código. (No nos importa si `Comments` lanza o no un error cuando el usuario está desconectado, porque no será llamado).

## Estado

[Antes](#conciliación) hablamos acerca de la identidad y de cómo la «posición» conceptual en el árbol le dice a React si debe reutilizar una instancia anfitriona o crear una nueva. Las instancias anfitrionas puenden tenert todo tipo de estado local: foco, selección, entrada, etc. Queremos reservar estado entre actualizaciones que conceptualmente rendericen la misma IU. Además, queremos destruirlo previsiblemente cuando rendericemos algo conceptualmente diferente (como movernos desde `<SignupForm>` a `<MessengerChat>`).

**El estado local es tan útil porque React permite que *tus propios* componentes también lo tengan.** Los componentes son aún funciones, pero React los aumenta con características que son útiles para las IU. El estado local vinculado a la posición en el árbol es una de esas características.

Llamamos a estas características *Hooks*. Por ejemplo, `useState` es un Hook.

```jsx{2,6,7}
function Example() {
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

Devuelve un par de valores: el estado actual y una función que lo actualiza.

La sintaxis de [desestructuración de arreglos](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment#Array_destructuring) nos permite darles nombres arbitrarios a nuestras variables de estado. Por ejemplo, nombré a este par `count` y `setCount`, pero pudo haber sido `banana` y `setBanana`. En lo que queda del texto, usaré `setState` para referirme al segundo valor sin importar el nombre real que tenga en los ejemplos.

*(Puedes aprender más de `useState` y otros Hooks proporcionados por React [aquí](https://reactjs.org/docs/hooks-intro.html)).*

## Consistencia

Incluso si quisiéramos dividir el proceso de conciliación en porciones de tareas que [no se bloqueen](https://www.youtube.com/watch?v=mDdgfyRB5kg), aún haríamos las operaciones reales del árbol anfitrión en un solo paso síncrono. De esta manera podemos asegurar que el usuario no ve una interfaz actualizada a medias y que el navegador no vuelva a realizar cálculos innecesarios del diseño y el estilo para estados intermedios que el usuario no debería ver.

Por esto es que React divide todo el trabajo en la «fase de renderizado» y la «fase de confirmación». La «fase de renderizado» es cuando React llama a tus componentes y realiza la conciliación. Es seguro interrumpirla y [en el futuro](https://reactjs.org/blog/2018/03/01/sneak-peek-beyond-react-16.html) será asíncrona. La *fase de _confirmación_* ocurre cuando React toca el árbol anfitrión. Siempre es síncrona.


## Memoización

Cuando un padre programa una actualización llamando a `setState`, React concilia de forma predeterminada todo su subárbol secundario. Esto se debe a que React no puede saber si una actualización en el padre afectaría al hijo o no, y por defecto React opta por ser consistente. Esto puede parecer muy costoso, pero en la práctica no es un problema para los subárboles pequeños y medianos.

Cuando los árboles se vuelven demasiado profundos o anchos, puedes decirle a React que [memoice](https://en.wikipedia.org/wiki/Memoization) un subárbol y reutilice el resultado de la renderización anterior durante cambios de props superficialmente iguales:

```jsx{5}
function Row({ item }) {
  // ...
}

export default React.memo(Row);
```

Ahora `setState` en un componente padre `<Table>` se saltaría la conciliación de `Row` cuyo `item` es referencialmente igual al `item` renderizado la última vez.

Puedes obtener una memoización detallada al nivel de expresiones individuales con el [Hook `useMemo()`](https://reactjs.org/docs/hooks-reference.html#usememo). La caché es local a la posición del árbol de componentes y se destruirá junto con su estado local. Solo tiene un último elemento.

React de manera intencional no memoiza componentes por defecto. Muchos componentes siempre reciben diferentes props por lo que memoizarlos constituiría una pérdida neta.

## Modelos en bruto

Irónicamente, React no usa un sistema de «reactividad» para actualizaciones detalladas. En otras palabras, cualquier actualización en la parte superior desencadena la conciliación en lugar de actualizar solo los componentes afectados por los cambios.

Esta es una decisión de diseño intencional. [*El tiempo para interactuar*](https://calibreapp.com/blog/time-to-interactive/) es una métrica crucial en aplicaciones web de consumo y los modelos que hacen un recorrido para configurar *listeners* detallados consumen ese tiempo precioso. Adicionalmente, en muchas aplicaciones las interacciones pueden resultar en pequeñas (pasarle por encima a un botón) o grandes (transiciones de página) actualizaciones, en cuyo caso las suscripciones detalladas son un desperdicio de los recursos de memoria.

Una de los principios básicos de diseño de React es que funciona con datos en bruto. Si tienes una cantidad de objetos Javascript recibidos por la red, puedes incorporarlos directamente en tus componentes sin procesamiento. No hay errores inesperados en cuanto a qué propiedades puedes acceder, o caídas inesperadas en el rendimiento cuando una estructura cambia ligeramente. El renderizado de React es O(*tamaño de la vista*) y no O(*tamaño del modelo*), y se puede reducir significativamente el *tamaño de la vista* con la técnica de [*ventanas virtuales*](https://react-window.now.sh/#/examples/list/fixed-size).

Hay algunos tipos de aplicaciones donde la suscripciones detalladas son beneficiosas (como los indicadores de cotizaciones bursátiles). Este es un ejemplo poco común de «todo se actualiza constantemente al mismo tiempo». Si bien las vías de escape imperativas pueden ayudar a optimizar dicho código, React podría no ser la mejor opción para este caso de uso. Aún así, puedes implementar tu propio sistema detallado de suscripción sobre React.

**Nota que hay problemas de rendimiento comunes que incluso los sistemas detallados de suscripciones y «reactivos» no pueden solucionar.** Por ejemplo, renderizar un *nuevo* árbol profundo (lo que ocurren en cada transición de página) sin bloquear el navegador. El seguimiento de cambios no lo hace más rápido, lo hace más lento, porque tenemos que hacer más trabajo para configurar las suscripciones. Otro problema es que tenemos que esperar datos antes de poder comenzar a renderizar la vista. En React, nuestro objetivo es resolver ambos problemas con el [renderizado concurrente](https://reactjs.org/blog/2018/03/01/sneak-peek-beyond-react-16.html).


## Procesamiento por lotes

Es posible que varios componentes deseen actualizar el estado en respuesta al mismo evento. Este ejemplo es complicado, pero ilustra un patrón común:

```jsx{4,14}
function Parent() {
  let [count, setCount] = useState(0);
  return (
    <div onClick={() => setCount(count + 1)}>
      Parent clicked {count} times
      <Child />
    </div>
  );
}

function Child() {
  let [count, setCount] = useState(0);
  return (
    <button onClick={() => setCount(count + 1)}>
      Child clicked {count} times
    </button>
  );
}
```

Cuando se envía un evento, el `onClick` del hijo se dispara primero (activando su `setState`). Luego, el padre llama a `setState` en su propio manejador del `onClick`.

Si React vuelve a renderizar inmediatamente los componentes en respuesta a las llamadas a `setState`, terminaríamos renderizando el hijo dos veces:

```jsx{4,8}
*** Entering React's browser click event handler ***
Child (onClick)
  - setState
  - re-render Child // 😞 innecesario
Parent (onClick)
  - setState
  - re-render Parent
  - re-render Child
*** Exiting React's browser click event handler ***
```

El primer renderizado de `Child` se perdería. Y no pudimos hacer que React omitiera la renderización de `Child` por segunda vez porque `Parent` podría pasarle datos diferentes según su estado actualizado.

**Esta es la razón por la que React hace actualizaciones en lote dentro de los manejadores de eventos:**

```jsx
*** Entering React's browser click event handler ***
Child (onClick)
  - setState
Parent (onClick)
  - setState
*** Processing state updates                     ***
  - re-render Parent
  - re-render Child
*** Exiting React's browser click event handler  ***
```

Las llamadas a `setState` en componentes no causarían inmediatamente un renderizado. En cambio, React ejecutaría primero todos los manejadores de eventos y luego iniciaría un solo rerenderizado agrupando todas las actualizaciones.

El procesamiento en lote es bueno para el rendimiento, pero puede sorprender si escribes código como este:

```jsx
  const [count, setCounter] = useState(0);

  function increment() {
    setCounter(count + 1);
  }

  function handleClick() {
    increment();
    increment();
    increment();
  }
```

Si iniciamos con `count` en `0`, serían solo tres llamadas a `setCount(1)`. Para solucionarlo, `setState` proporciona un argumento extra que acepta un función «actualizadora»:

```jsx
  const [count, setCounter] = useState(0);

  function increment() {
    setCounter(c => c + 1);
  }

  function handleClick() {
    increment();
    increment();
    increment();
  }
```

React pone las funciones actualizadoras en una cola y luego las ejecuta en secuencia. Como resultado se renderiza con `count` igual a `3`.

Cuando la lógica del estado se vuelve más compleja que unas pocas llamadas a `setState`, recomiendo expresarla como un reductor de estado local con el [Hook `useReducer`](https://reactjs.org/docs/hooks-reference.html#usereducer). Es como una evolución de este patrón de «actualizador» en el cual cada actualización lleva un nombre:

```jsx
  const [counter, dispatch] = useReducer((state, action) => {
    if (action === 'increment') {
      return state + 1;
    } else {
      return state;
    }
  }, 0);

  function handleClick() {
    dispatch('increment');
    dispatch('increment');
    dispatch('increment');
  }
```

El argumento `action` puede ser cualquier cosa, sin embargo, un objeto es una elección común.

## Árbol de llamadas

Un *runtime* de un lenguaje de programación usualmente tiene una [pila de llamadas](https://medium.freecodecamp.org/understanding-the-javascript-call-stack-861e41ae61d4). Cuando una función `a()` llama a `b()` que a su vez llama a `c()`, en algún lugar en el motor de Javascript hay una estructura de datos como `[a, b, c]` que «hace un seguimiento» de dónde estás y qué código hay que ejecutar a continuación. Una vez que sales de `c`, el fotograma de la pila de llamada se va, ¿desaparece! Ya no se necesita. Volvemos a `b`. Para cuando salimos de `a`, la pila de llamadas está vacía.

Por supuesto, el propio React corre sobre Javascript y respeta las reglas de Javascript. Pero podemos imaginarnos que internamente React tiene una suerte de pila de llamadas propia para recordar qué componente estamos actualmente renderizando, por ejemplo `[App, Page, Layout, Article /* estamos aquí */]`.

React es diferente a un *runtime* de un lenguaje de propósito general porque su objetivo es renderizar árboles de interfaces de usuario. Estos árboles necesitan «permanecer vivos» para que interactuemos con ellos. El DOM no desaparece después de nuestra primera llamada a `ReactDOM.render()`.

Esto podría estar estrechando la métafora, pero me gusta pensar en los componentes de React como un «árbol de llamadas» más que solo una «pila de llamadas». Cuando «salimos» del componente `Article`, el fotograma del «árbol de llamadas» de React no se destruye. Necesitamos mantener el estado local y las referencias a las instancias anfitrionas en [algún sitio](https://medium.com/react-in-depth/the-how-and-why-on-reacts-usage-of-linked-list-in-fiber-67f1014d0eb7).

Estos fotogramas del «árbol de llamadas» *son* destruidos junto con su estado local y las instancias anfitrionas, pero solo cuando las reglas de la [conciliación](#conciliación) dicen que es necesario. Si alguna vez leíste el código fuente de React, puede que hayas visto hacer referencia a estos fotogramas como [fibras](https://en.wikipedia.org/wiki/Fiber_(computer_science)).

Las fibras son donde vive en realidad el estado local. Cuando se actualiza el estado, React marca las fibras debajo como necesitadas de conciliación y llama a esos componentes.

## Contexto

En React, le pasamos datos hacia abajo a otros componentes como props. A veces, la mayoría de los componentes necesitan lo mismo, por ejemplo, el tema visual escogido actualmente. Se vuelve incómodo pasarlo hacia abajo en cada nivel.

En React, esto lo resuelve el [Contexto](https://reactjs.org/docs/context.html). Es esencialmente como [el alcance dinámico](http://wiki.c2.com/?DynamicScoping) para componentes. Es como una agujero de gusano que te permite poner algo encima, y cada hijo debajo es capaz de leer y volver a renderizar cuando cambia.

```jsx
const ThemeContext = React.createContext(
  'light' // Valor predeterminado como reserva
);

function DarkApp() {
  return (
    <ThemeContext.Provider value="dark">
      <MyComponents />
    </ThemeContext.Provider>
  );
}

function SomeDeeplyNestedChild() {
  // Depende de dónde el hijo se renderiza
  const theme = useContext(ThemeContext);
  // ...
}
```

Cuando `SomeDeeplyNestedChild` renderiza, `useContext(ThemeContext)` buscará por el `<ThemeContext.Provider>` más cercano por encima de él en el árbol, y usará su `value`.

(En la práctica, React mantiene una pila de contexto mientras renderiza).

Si no hay arriba un `ThemeContext.Provider`, el resultado de la llamada a `useContext(ThemeContext)` será el valor por defecto especificado en la llamada a `createContext()`. En nuestro ejemplo es `'light'`.


## Efectos

Mencionamos antes que los componentes de React no deberían tener efectos secundarios observables durante el renderizado. Pero los efectos secundarios a veces son necesarios. Podemos querer manejar el foco, dibujar en un *canvas*, suscribirnos a una fuente de datos, etc.

En React, ello se hace al declarar un efecto:

```jsx{4-6}
function Example() {
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

Siempre que sea posible, React retarda la ejecución de los efectos hasta que el navegador repinta la pantalla. Esto es bueno, porque código como las suscripciones a una fuente de datos no deberían impactar el [tiempo para ser interactivo](https://calibreapp.com/blog/time-to-interactive/) y el [tiempo de la primera pintura](https://developers.google.com/web/tools/lighthouse/audits/first-meaningful-paint). (Hay un Hook [raramente usado](https://reactjs.org/docs/hooks-reference.html#uselayouteffect) que permite abandonar este comportamiento y hacer cosas sincrónicamente. Evítalo).

Los efectos no se ejecutan solo una vez. Se ejecutan después que el componente se muestra al usuario por primera vez y también después que se actualiza. Los efectos pueden utilizar las props y el estado actual, como con `count` en el ejemplo anterior.

Los efectos pueden requerir una fase de limpieza, como en el caso de las suscripciones. Para hacer la limpieza, un efecto puede devolver una función:

```jsx
  useEffect(() => {
    DataSource.addSubscription(handleChange);
    return () => DataSource.removeSubscription(handleChange);
  });
```

React ejecutará la función devuelta antes de aplicar este efecto la próxima vez y también antes de que se destruya el componente.

A veces, volver a ejecutar el efecto en cada renderizado puede no ser deseable. Le puedes decir a React que se [salte](https://reactjs.org/docs/hooks-effect.html#tip-optimizing-performance-by-skipping-effects) la aplicación de un efecto si ciertas variables no cambiaron:

```jsx{3}
  useEffect(() => {
    document.title = `You clicked ${count} times`;
  }, [count]);
```

Sin embargo, a menudo es una optimización prematura y puede conducir a problemas si no estás familiarizado con cómo funcionan las clausuras en Javascript:

Por ejemplo, este código es problemático:

```jsx
  useEffect(() => {
    DataSource.addSubscription(handleChange);
    return () => DataSource.removeSubscription(handleChange);
  }, []);
```

Lo que pasa es que `[]` dice «no vuelvas a ejecutar nunca este efecto». Pero el efecto aplica una clausura sobre `handleChange` que está definido fuera de él y `handleChange` podría referenciar cualquier prop o estado:

```jsx
  function handleChange() {
    console.log(count);
  }
```

Si no dejamos que el efecto se vuelva a ejecutar nunca, `handleChange` seguiría apuntando a la versión del primer renderizado, y `count` sería siempre `0` dentro de él.

Para resolver esto, asegúrate de que si especificas el arreglo de dependencias, incluya **todo** lo que puede cambiar, incluidas ls funciones:

```jsx{4}
  useEffect(() => {
    DataSource.addSubscription(handleChange);
    return () => DataSource.removeSubscription(handleChange);
  }, [handleChange]);
```

Dependiendo de tu código, puede que aún veas resuscripciones innecesarios, porque el propio `handleChange` es diferente en cada renderizado. El Hook [`useCallback`](https://reactjs.org/docs/hooks-reference.html#usecallback) puede ayudarte con eso. De manera alternativa, simplemente puedes dejarlo que resuscriba. Por ejemplo, la API del navegador `addEventListener` es extremadamente rápida y hacer malabares para evitar llamarla podría reportar más problemas que beneficios.

*(Puedes aprender más sobre `useEffect` y otros Hooks proporcionados por React [aquí](https://reactjs.org/docs/hooks-effect.html).)*

## Hooks personalizados

Dado que los Hooks como `useState` y `useEffect` son llamadas a funciones, podemos componerlos en nuestros propios Hooks:

```jsx{2,8}
function MyResponsiveComponent() {
  const width = useWindowWidth(); // Nuestro Hook personalizado
  return (
    <p>Window width is {width}</p>
  );
}

function useWindowWidth() {
  const [width, setWidth] = useState(window.innerWidth);
  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  });
  return width;
}
```

Los Hooks personalizados permiten a los componentes compartir lógica de estado reutilizable. Nota que el *estado en sí* no se comparte. Cada llamada a un Hook declara su propio estado aislado.

*(Puedes aprender más de cómo escribir tus propios Hooks [aquí](https://reactjs.org/docs/hooks-custom.html)).*

## Orden estático de uso

Puedes pensar en `useState` como una sintaxis para definir una «variable de estado de React». No es *en realidad* una sintaxis, por supuesto. Aún estamos escribiendo Javascript. Pero al mirar a React como un *runtime* y porque React adapta Javascript para describir árboles de IU, sus características algunas veces se mueven dentro del ámbito de los lenguajes.

Si `use` *fuera* una sintaxis, tendría sentido que estuviera en el nivel superior:

```jsx{3}
// 😉 Nota: No es una sintaxis real
component Example(props) {
  const [count, setCount] = use State(0);

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

¿Acaso tendría algún sentido ponerlo en una condición, o en un *callback* o fuera de un componente?

```jsx
// 😉 Nota: no es una sintaxis real

// Esto es estado local... ¿de qué?
const [count, setCount] = use State(0);

component Example() {
  if (condition) {
    // ¿Qué le sucede cuando la condición es falsa?
    const [count, setCount] = use State(0);
  }

  function handleClick() {
    // ¿Qué le ocurre cuando salimos de una función?
    // ¿De qué forma esto es diferente a una variable?
    const [count, setCount] = use State(0);
  }
```

El estado en React es local al *componente* y a su identidad en el árbol. Si `use` fuera una sintaxis real, también tendría sentido permitirla solo en el ámbito del nivel superior de los componentes:


```jsx
// 😉 Nota: no es una sintaxis real
component Example(props) {
  // Solo válido aquí
  const [count, setCount] = use State(0);

  if (condition) {
    // Esto sería un error de sintaxis
    const [count, setCount] = use State(0);
  }
```

Es similar a como `import` solo funciona en el nivel superior de un módulo.

**Por supuesto, `use` no es en realidad una sintaxis.** (No traería mucho beneficio y crearía mucha fricción).

Sin embargo, React *sí* espera que todas las llamadas a los Hooks ocurran solo en el nivel superior de un componente e incondicionalmente. Estas [Reglas de los Hooks](https://reactjs.org/docs/hooks-rules.html) se pueden hacer cumplir con un [plugin de un *lint*](https://www.npmjs.com/package/eslint-plugin-react-hooks). Han existido discusiones acaloradas acerca de esta elección de diseño, pero en la práctica no he visto que confunda a la gente. También escribí por qué alternativas propuestas comúnmente [no funcionan](https://overreacted.io/why-do-hooks-rely-on-call-order/).

Internamente, los Hooks se implementan como [listas enlazadas](https://dev.to/aspittel/thank-u-next-an-introduction-to-linked-lists-4pph). Cuando se llama a `useState`, movemos el puntero al próximo elemento. Cuando salimos del [fotograma del «árbol de llamada»](#árbol-de-llamadas) del componente, guardamos la lista resultante ahí hasta el próximo renderizado.

[Este artículo](https://medium.com/@ryardley/react-hooks-not-magic-just-arrays-cd4f1857236e) proporciona una explicación simplificada de cómo los Hooks funcionan internamente. Los arreglos puede que sean un modelo mental más fácil que las listas enlazadas:


```jsx
// Seudocódigo
let hooks, i;
function useState() {
  i++;
  if (hooks[i]) {
    // Próximos renderizados
    return hooks[i];
  }
  // Primer renderizado
  hooks.push(...);
}

// Se prepara el renderizado
i = -1;
hooks = fiber.hooks || [];
// Se llama al compnente
YourComponent();
// Se recuerda el estado de los Hooks
fiber.hooks = hooks;
```

*(Si sientes curiosidad, el código real está [aquí](https://github.com/facebook/react/blob/master/packages/react-reconciler/src/ReactFiberHooks.js)).*

Esto es a grandes rasgos como cada llamada a `useState()` obtiene el estado correcto. Como aprendimos [antes](#conciliación), «hacer coincidir las cosas» no es nuevo para React. La conciliación depende de una manera similar en que los elementos coincidan entre los renderizados.

## Lo que se quedó fuera

Hemos abordado casi todos los aspectos importantes del *runtime* de React. Si terminaste esta página, probablemente conoces React con más detalle que el 90% de sus usuarios. ¡Y no hay nada malo en ello!

Hay algunas partes que dejé fuera, en su mayoría, porque no están claras incluso para nosotros. React actualmente no tiene una buena historia para el renderizado multipasos, o sea, cuando el renderizador del padre necesita información sobre los hijos. También, la [API de manejo de errores](https://reactjs.org/docs/error-boundaries.html) no tiene todavía una versión con Hooks. Es posible que estos dos problemas se puedan resolver juntos. El modo concurrente aún no es estable y hay preguntas interesantes sobre como Suspense encaja en esta historia. Quizá haga un seguimiento cuando salgan y Suspense esté listo para más que la [carga diferida](https://reactjs.org/blog/2018/10/23/react-v-16-6.html#reactlazy-code-splitting-with-suspense).

**Creo que habla del éxito de la API de React que puedas llegar bien lejos sin siquiera pensar en la mayoría de estos temas.** Buenos valores predeterminados como las heurísticas de conciliación hacen lo correcto en la mayoría de los casos. Advertencias como la de `key` te avisan cuando está a punto de salirte el tiro por la culata.

Si eres un apasionado de las bibliotecas de IU espero que este artículo haya sido entretenido en cierta forma y haya aclarado con mayor profundidad como funciona React. O quizá decidiste que React es demasiado complicado y no quieres verlo nunca más. En cualquier caso, ¡me gustaría saber lo que piensas en Twitter! Gracias por leer.
