---
title: React como un entorno en tiempo de ejecución para IU
date: '2019-02-02'
spoiler: Una descripción detallada del modelo de programación de React.
---

La mayoría de los tutoriales introducen a React como una biblioteca de IU. Esto tiene sentido porque React *es* una biblioteca de IU. ¡Eso es literalmente lo que dice el eslogan!

![React homepage screenshot: "A JavaScript library for building user interfaces"](./react.png)

He escrito antes sobre los desafíos de crear [interfaces de usuario](/the-elements-of-ui-engineering/). Pero este artículo trata a React de una manera distinta, más como un [entorno en tiempo de ejecución](https://en.wikipedia.org/wiki/Runtime_system).

**Este artículo no te enseñará nada sobre la creación de interfaces de usuario.** Pero podría ayudarte a entender el modelo de programación de React con mayor profundidad.

---

**Nota: Si estás _aprendiendo_ React, consulta en cambio [la documentación](https://reactjs.org/docs/getting-started.html#learn-react).**

<font size="60">⚠️</font>

**Esta es una inmersión profunda, NO ES un artículo adecuado para principiantes.** En este artículo describo la mayor parte del modelo de programación de React desde la base. No explico cómo usarlo, solo como funciona.

Está dirigido a programadores experimentados y gente que trabaja en otras bibliotecas de UI que han preguntado sobre algunos compromisos asumidos?????? en React. ¡Espero que te resulte útil!

**Muchas personas llegan a utilizan React por años sin pensar acerca de la mayoría de estos temas.** Esta es definitivamente una visión de React centrada en la programación, más que, digamos, centrada en el diseño(http://mrmrs.cc/writing/2016/04/21/developing-ui/). Pero no creo haga daño tener recursos para ambas.

Pasada ya la advertencia, ¡continuemos!

---

## Árbol anfitrión

Algunos programas dan como resultado números, otros, poemas. Los diferentes lenguajes y sus entornos en tiempo de ejecución a menudo están optimizados para un conjunto particular de casos de uso y React no es la excepción.

Los programas de React generalmente dan como resultado **un árbol que puede cambiar con el tiempo**. Puede ser un [árbol DOM](https://www.npmjs.com/package/react-dom), una [jerarquía de iOS](https://developer.apple.com/library/archive/documentation/General/Conceptual/Devpedia-CocoaApp/View%20Hierarchy.html), un árbol de [primitivas PDF](https://react-pdf.org/), o incluso de [objetos JSON](https://reactjs.org/docs/test-renderer.html). Sin embargo, lo que queremos generalmente es representar alguna IU con él. Lo llamaremos árbol *anfitrión*, porque es parte del *ambiente anfitrión* fuera e React (como DOM o iOS). El árbol anfitrión a menudo tiene [su](https://developer.mozilla.org/en-US/docs/Web/API/Node/appendChild) [propia](https://developer.apple.com/documentation/uikit/uiview/1622616-addsubview) API imperativa. React es una capa encima de ella.

¿Entonces para qué sirve React? Muy abstractamente, te ayuda a escribir un programa que manipula predeciblemente un árbol anfitrión complejo en respuesta a eventos externos como interacciones, respuestas de la red, temporizadores, etc.

Una herramienta especializada funciona mejor que una genérica cuando puede imponer y tomar provecho de algunas restricciones. React se basa en dos principios:

* **Estabilidad.** El árbol anfitrión es relativamente estable y la mayoría de las actualizaciones no cambian radicalmente su estructura general. Si una aplicación reorganizara todos sus elementos interactivos resultando en una combinación completamente diferente cada segundo sería difícil de usar. ¿Dónde fue a parar ese botón? ¿Por qué está bailando mi pantalla?

* **Regularidad.** El árbol anfitrión se puede dividir en patrones de IU que lucen y se comportan de manera consistente (como botones, listas, avatares) y no formas aleatorias.

**Estos principios resultan ser ciertos para la mayoría de las IU.** Sin embargo, React no es adecuado cuando no hay «patrones» estables en la salida?????. Por ejemplo, React puede ayudarte a escribir un cliente de Twitter, pero no será muy útil para un [salvapantallas de tuberías en 3D](https://www.youtube.com/watch?v=Uzx9ArZ7MUU).

## Instancias anfitrionas

El árbol anfitrión está formado por nodos. Los llamaremos «instancias anfitrionas».

En el entorno DOM, las instancias anfitrionas son nodos DOM comunes (como los objetos que obtienes al llamar a `document.createElement('div')`). En iOS, las instancias anfitrionas podrían ser valores que identifiquen de manera única desde Javascript una vista nativa.

Las instancias anfitrionas tienen sus propias propiedades (p. ej. `domNode.className` o `view.tintColor`). Podrían también contener otras instancias anfitrionas como hijas.

(Esto no tiene nada que ver con React, lo que hago es describir los entornos anfitriones).

Generalmente hay una API para manipular las instancias anfitrionas. Por ejemplo, el DOM proporciona entre otras API `appendChild`, `removeChild`, `setAttribute`. En las aplicaciones React, generalmente no se invocan estas API. Ese es trabajo de React.

## Renderizador

Un *renderizador* le enseña a React a hablar con un entorno anfitrión en específico y manejar sus instancias anfitrionas. React DOM, React Native, e incluso [Ink](https://mobile.twitter.com/vadimdemedes/status/1089344289102942211) son renderizadores de React. También tú puedes [crear tu propio renderizador de React](https://github.com/facebook/react/tree/master/packages/react-reconciler).

Los renderizadores de React pueden funcionar en uno o dos modos.

La mayoría de los renderizadores se escriben para utilizar el modo de «mutación». Este modeo es como funciona el DOM: podemos crear un nodo, establecer sus propiedades y luego añadir o eliminar hijos de él. Las instancias anfitrionas son completamente mutables.

React también puede funcionar en un modo «persistente». Este modo es para entornos anfitriones que no proporcionan métodos como `appendChild()` pero en su lugar clonan el árbol padre y siempre reemplazan el hijo del nivel superior. La inmutabilidad al????? nivel del árbol anfitrión hace más fácil el multihilo. [React Fabric](https://facebook.github.io/react-native/blog/2018/06/14/state-of-react-native-2018) lo aprovecha.

Como usuario de React, nunca tienes que pendar acerca de estos modos. Solo quiero resaltar que React no es solo un adaptador de un modo a otro. Su utilidad es ortogonal al paradigma de API de vista de bajo nivel al que se dirige.??????

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

Un elemento de React es ligero y no tiene una instancia anfitriona atada a él. Repito, es meramente una *descripción* de lo que quieres ver en pantalla.

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

Los elementos de React son inmutables. Por ejemplo, no puedes cambiar los hijos o una propriedad de un elemento de React. Si quieres renderizar algo distinto luego, lo *describirás* con un nuevo árbol de elementos de React creado desde cero.

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

Cuando decimos `ReactDOM.render(reactElement, domContainer)`, lo que queremos decir es: **«Querido React, haz que el árbol anfitrión `domContainer` tenga una correspondencia on `reactElement`».**

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

## Reconciliación

¿Qué ocurre si invocamos a `ReactDOM.render()` dos veces dentro del mismo contenedor?

```jsx{2,11}
ReactDOM.render(
  <button className="blue" />,
  document.getElementById('container')
);

// ... luego ...

// Should this *replace* the button host instance
// or merely update a property on an existing one?
ReactDOM.render(
  <button className="red" />,
  document.getElementById('container')
);
```

Repito, el trabajo de React es *hacer que el árbol anfitrión se corresponda con el árbol de elementos de React proporcionado*. El proceso de averiguar *qué* hacer al árbol de instancias anfitrionas en respuesta a la nueva información se denomina en ocasiones [reconciliación](https://reactjs.org/docs/reconciliation.html).

Hay dos vías de hacerlo. Una versión simplificada de React podría eliminar completamente el árbol existente y recrearlo desde cero.

```jsx
let domContainer = document.getElementById('container');
// Clear the tree
domContainer.innerHTML = '';
// Create the new host instance tree
let domNode = document.createElement('button');
domNode.className = 'red';
domContainer.appendChild(domNode);
```

Pero en el DOM, esto es lento y pierde información importante como el foco, la selección, el estado de la navegación, etc. En su lugar, queremos que React haga algo como esto:

```jsx
let domNode = domContainer.firstChild;
// Update existing host instance
domNode.className = 'red';
```

En otras palabras, React necesita decidir cuando _actualizar_ una instancia anfitriona existente para hacerla corresponder con un nuevo elemento de React y cuando crear una _nueva_.

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

// Can reuse host instance? Yes! (button → button)
// domNode.className = 'red';
ReactDOM.render(
  <button className="red" />,
  document.getElementById('container')
);

// Can reuse host instance? No! (button → p)
// domContainer.removeChild(domNode);
// domNode = document.createElement('p');
// domNode.textContent = 'Hello';
// domContainer.appendChild(domNode);
ReactDOM.render(
  <p>Hello</p>,
  document.getElementById('container')
);

// Can reuse host instance? Yes! (p → p)
// domNode.textContent = 'Goodbye';
ReactDOM.render(
  <p>Goodbye</p>,
  document.getElementById('container')
);
```

La misma heurística se usa para árbol hijos. Por ejemplo, cuando actualizamos un `<dialog>` con dos `<button>`s dentro, React primero decide si reusa el `<dialog>` y luego repite este proceso de decisión para cada hijo.

## Condiciones

Si React solo reutiliza instancias anfitrionas cuando los tipos de los elementos «coinciden» entre actualizaciones, ¿cómo podemos renderizar contenido condicional?

Digamos que queremos mostrar primero solo un *input* ????, pero luego renderizar un mensaje antes de él:

```jsx{12}
// First render
ReactDOM.render(
  <dialog>
    <input />
  </dialog>,
  domContainer
);

// Next render
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

No ser perdió estado ahora.

## Listas

La comparación del tipo del elemento en la misma posición en el árbol generalmente es suficiente para decidir si reutilizar o recrear la instancia anfitriona correspondiente.

Pero esto solo funciona bien si las posiciones de los hijos son estáticas y no cambian su orden. En nuestro ejemplo previo, aún cuando `message` podría ser un «hueco», todavía sabíamos que ahí el input???? va después del mensaje, y que no hay otros hijos.

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

Por lo que en lugar de *reordenarlos*, React efectivamente *actualizaría* cada uno de ellos. Esto puede crear problemas de rendimiento y posibles errores. Por ejemplo, el contenido del primer input???? permanecería reflejado en el primer input??? después del ordenamiento, ¡aún cuando conceptualmente puedan hacer referencia a productos diferentes en tu lista de compra!

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

Una llave le dice a React que debe consider a un elemento *conceptualmente* el mismo aún si entre renderizados tiene una *posición* diferente dentro de su elemento padre.

Cuando React vee `<p key="42">` dentro de un `<form>`, comprobará si el renderizado anterior también tenía `<p key="42">` dentro del mismo `<form>`. Esto funciona incluso si los hijos de `<form>` cambiaron su orden. React reutilizará la instancia anfitriona anterior con la misma llave si exista y reordenará correspondientemente a los hermanos.

Nota que la llave es solo relevante dentro de un elemento React padre en particular, como un `<form>`. React no intentará hacer «coincidir» elementos con las mismas llaves entre diferentes padres. (React no tiene una vía idiomática para mover una instancia anfitriona entre diferentes padres sin recrearla).

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

Son llamadas *componentes*. Nos permiten crear nuestra propio *«toolbox»* de botones, avatares, comentarios, etc. En React los componentes son el pan nuestro de cada día.?????

Los componentes toman un argumento (un objeto *hash)*. Contiene *props*
Components take one argument — an object hash. It contains «props» (diminutivo de «propiedades»). Aquí, `showMessage` es una prop. Son como argumentos nombrados.

## Pureza

Se asume que los componentes de React son puros con respecto a sus props.

```jsx
function Button(props) {
  // 🔴 Doesn't work
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
  // Fine if it doesn't affect other components:
  SuperCalculator.initializeIfNotReady();

  // Continue rendering...
}
```

Mientras que la invocación a un componente en múltiples ocasiones sea segura y no afecte el renderizado de otros componentes, a React no le importa si es 100% puro en el sentido estricto de la palabra dentro de la programación funcional (PF). [La idempotencia](https://stackoverflow.com/questions/1077412/what-is-an-idempotent-operation) es más importante para React que la pureza.

Con eso dicho, los efectos secundarios que son directamente visibles al usuario no están permitidos en los componentes de React. Dicho de otra forma, el simple hecho de *invocar* una función componente no debería por sí mismo producir un cambio en la pantalla.

## Recursividad

¿Como *utilizamos* componentes desde otros componentes? Los componentes son funciones, por lo que *podríamos* invocarlos:

```jsx
let reactElement = Form({ showMessage: true });
ReactDOM.render(reactElement, domContainer);
```

Sin embargo, esta *no* es la forma idiomática de usar componentes en el entorno en tiempo de ejecución de React.

En cambio, la forma idiomática de usar un componente es con el mismo mecanimso que hemos visto anteriormente --- Elementos de React. **Esto significa que no tienes que invocar directamente la función del componente, sino dejar a React que lo haga luego por ti**:

```jsx
// { type: Form, props: { showMessage: true } }
let reactElement = <Form showMessage={true} />;
ReactDOM.render(reactElement, domContainer);
```

Y en algún sitio dentro de React, tu componente será invocado:

```jsx
// Somewhere inside React
let type = reactElement.type; // Form
let props = reactElement.props; // { showMessage: true }
let result = type(props); // Whatever Form returns
```

Por convención, los nombres de las funciones componente se escriben con inicial mayúscula. Cuando la transformación???? JSX ve `<Form>` y no `<form>`, hace al `type` mismo del objeto un identificador y no una cadena:

```jsx
console.log(<form />.type); // 'form' string
console.log(<Form />.type); // Form function
```

No hay un mecanismo global de registro, literalmente nos referimo a `Form` por el nombre cuando escribimos `<Form />`. Si form no existe en el ámbito local, verás un error de Javascript como lo harías normalmente con un nombre de variable incorrecto.

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
// Resulting DOM structure
<div>
  <article>
    Some text
    <footer>some more text</footer>
  </article>
</div>
```

Por eso es que decimos que la reconciliación es recursiva. Cuando React recorre el árbol de elementos, puede encontrarse un elemento cuyo `type` es un componente. Lo llamará y seguirá descendiendo hacia abajo del árbol de elementos de React devueltos. Eventualmente se nos acabarán los componentes y React sabrá qué cambiar en el árbol anfitrión.

Las mismas reglas de reconciliación que ya discutimos funcionan también aquí. Si el `type` en la misma posición (determinado por el índice y opcionalmente `key`) cambia, React se deshacerá las instancias anfitrionas dentro y las recreará.

## Inversion of Control

Podrías estarte preguntando: ¿Por qué no llamamos a los componentes directamente? ¿Por qué escribir `<Form />` y no `Form()`?

**React puede hacer mejor su trabajo si «tiene conocimiento» sobre tus componentes, más que si solo viera el árbol de elementos de React después de llamarlos recursivamente.**

```jsx
// 🔴 React has no idea Layout and Article exist.
// You're calling them.
ReactDOM.render(
  Layout({ children: Article() }),
  domContainer
)

// ✅ React knows Layout and Article exist.
// React calls them.
ReactDOM.render(
  <Layout><Article /></Layout>,
  domContainer
)
```

Este es un ejemplo clásico de [inversión de control](https://en.wikipedia.org/wiki/Inversion_of_control). Hay algunas propiedades interesantes que obtenemos al dejar a React tomar el control de la llamada de nuestros componentes:

* **Los componentes se vulven más que funciones.** React puede aumenter las funciones de los componentes con características como *el estado local* que están vinculadas a la identidad del componente en el árbol. Un buen *runtime* proporciona abstracciones fundamentales que coinciden con el problema en cuestión. Como ya mencionamos, React está orientado específicamente a programas que renderizan árboles de IU y responden a interacciones. Si llamas a los componentes directamente, tendrías que construir estas características tú mismo.

* **Los tipos de componentes participan en la reconciliación.** Al dejar a React llamar a tus componentes, también le dices más acerca de la estructura conceptual de tu árbol. Por ejemplo, cuando cambias de renderizar `<Feed>` a la página de `<Profile>`, React no intentará reutilizar instancias anfitrionas dentro de ellos (justo como cuando reemplazas `<button>` con un `<p>`). Todo el estado se habrá ido, lo cual generalmente es bueno cuando renderizas una vista conceptualmente diferente. No querrás preservar el estado del ?????input entre `<PasswordForm>` y `<MessengerChat>`, incluso si la posición del `<input>` en el árbol accidentalmente se alinea entre ellos.

* **React puede retardar la reconciliación.** Si React toma el control sobre las llamadas a nuestros componentes, puede hacer muchas cosas interesantes. Por ejemplo, puede dejar que el navegador haga algún trabajo entre las llamadas a componentes para que el rerenderizado de un árbol grande de componentes [no bloquee el hilo principal](https://reactjs.org/blog/2018/03/01/sneak-peek-beyond-react-16.html). Orquestar esto manualmente sin reimplementar una parte grande de React es difícil.

* **Una mejor historia de depuración.** Si los componentes son ciudadanos de primera categoría de los que la biblioteca está al tanto, podemos contruir [avanzadas??? herramientas para el desarrollador](https://github.com/facebook/react-devtools) para la instrospección en el desarrollo.

El último beneficio de que React llame tus funciones de componentes es la *evaluación diferida*. Veamos que significa esto.

## Evaluación diferida

Cuando llamamos funciones en JavaScript, los argumentos se evalúan antes de la llamada:

```jsx
// (2) This gets computed second
eat(
  // (1) This gets computed first
  prepareMeal()
);
```

Esto es generalmente lo que esperan los desarrolladores de Javascript, porque las funciones de Javascript pueden tener efectos secundarios implícitos. No sorprendería si llamaramos a una función, pero no se ejecutara hasta que su resultado de alguna forma sea «utilizado» en Javascript.

Sin embargo, los componentes de React son [relativamente](#purity) puros. No hay absolutamente ninguna necesidad de ejecutarlos si sabemos que su resultado no va a ser renderizado en la pantalla.

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

El componente `Page` puede renderizar los hijos que se le dan desde un `Layout`:????

```jsx{4}
function Page({ currentUser, children }) {
  return (
    <Layout>
      {children}
    </Layout>
  );
}
```

*(`<A><B /></A>` en JSX es lo mismo que `<A children={<B />} />`.)*

Pero, ¿qué tal???? si existe una condición temprana de salida?

```jsx{2-4}
function Page({ currentUser, children }) {
  if (!currentUser.isLoggedIn) {
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
//     children: Comments() // Always runs!
//   }
// }
<Page>
  {Comments()}
</Page>
```

Pero si pasamos un elemento de React, no necesitamos ejecutar `Comments` en lo absoluto??????.

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

Esto le permite a React decidir cuándo y *si* llamarlo. Si nuestro componente `Page` ignora su prop `children` y renderiza en cambio `<h1>Please login</h1>`, React no intentará siquiera llamar a la función `Comments`. ¿Cuál sería el punto en hacerlo??????????????

Esto es bueno porque permite evitar trabajo de renderizado innecesario que de otra formar sería desechado y reduce la fragilidad del código. (No nos importa si `Comments` lanza o no un error cuando el usuario está deslogueado??????, porque no será llamado).

## Estado

[Antes](#reconciliation) hablamos acerca de la identidad y de cómo la «posición» conceptual en el árbol le dice a React si debe reutilizar una instancia anfitriona o crear una nueva. Las instancias anfitrionas puenden tenert todo tipo de estado local: foco, selección, entrada?????, etc. Queremos reservar estado entre actualizaciones que conceptualmente rendericen la misma IU. Además queremos destruirlo previsiblemente cuando rendericemos algo conceptualmente diferente (cmo movernos desde `<SignupForm>` a `<MessengerChat>`).

El estado local es tan útlil porque React permite que *tus propios* componentes también lo tengan.** Los componentes son aún funciones, pero React los aumenta con características que son útiles para las IU. El estado local atado a la posición en el árbol es una de esas características.

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

Devuelve un par de valores: el estado acutal y una función que lo actualiza.

La sintaxis de [desestructuración de arreglos](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment#Array_destructuring) nos permite darle nombres arbitrarios a nuestras variables de estado. Por ejemplo, nombré a este par `count` y `setCount`, pero pudo haber sido `banana` y `setBanana`. En lo que queda del texto, usaré `setState` para referirme al segundo valor sin importar de su nombre real que tengan en los ejemplos.

*(Puedes aprender más de `useState` y otros Hooks proporcionados por React [aquí](https://reactjs.org/docs/hooks-intro.html)).*

## Consistencia

Incluso si quisieramos dividir el proceso de reconciliación en porciones de tareas que [no se bloqueen](https://www.youtube.com/watch?v=mDdgfyRB5kg), aún haríamos las operaciones reales del árbol anfitrión en un solo paso síncrono. De esta manera podemos asegurar que el usuario no ve una interfaz actualizada a medios y que el navegador no realice recálculos innecesarios del *layout* y el estilo para estados intermedios que el usuario no debería ver.

Por esto es que React divide todo el trabajo en la «fase de renderizado» y la «fase de *commit*». La «fase de renderizado» es cuando React llama a tus componentes y realiza la reconciliación. Es seguro interrumpirla y [en el futuro](https://reactjs.org/blog/2018/03/01/sneak-peek-beyond-react-16.html) será asíncrona. La *fase de _commit_* es cuando React toca el árbol anfitrión. Siempre es síncrona.


## Memoización

Cuando un padre programa una actualización llamando a `setState`, React concilia de forma predeterminada todo su subárbol secundario. Esto se debe a que React no puede saber si una actualización en el padre afectaría al hijo o no, y por defecto React opta por ser consistente. Esto puede parecer muy costoso, pero en la práctica no es un problema para los subárboles pequeños y medianos.

Cuando los árboles se vuelven demasiado profundos o anchos, puede decirle a React que [memoice](https://en.wikipedia.org/wiki/Memoization) un subárbol y reutilice el resultado de la renderización anterior durante cambios de props superficialmente iguales:

```jsx{5}
function Row({ item }) {
  // ...
}

export default React.memo(Row);
```

Ahora `setState` en un componente padre `<Table>` se saltaría la conciliación de `Row` cuyo `item` es referencialmente igual al `item` renderizado la última vez.

Puedes obtener una memoización detallada al nivel de expresiones individuales con el [Hook `useMemo()`](https://reactjs.org/docs/hooks-reference.html#usememo). La caché es local a la posición del árbol de componentes y se destruirá junto con su estado local. Solo tiene un último elemento.

React de manera intencional no memoiza componentes por defecto. Muchos componentes siempre reciben diferentes props por lo que memoizarlos constituiría una pérdida neta.

## Raw Models

Irónicamente, React no usa un sistema de «reactividad» para actualizaciones detalladas. En otras palabras, cualquier actualización en la parte superior desencadena la conciliación en lugar de actualizar solo los componentes afectados por los cambios.

Esta es una decisión di diseño intencional. [*Time to interactive*](https://calibreapp.com/blog/time-to-interactive/) es una métrica crucial en aplicaciones web de consumo??????????This is an intentional design decision. [Time to interactive](https://calibreapp.com/blog/time-to-interactive/) is a crucial metric in consumer web applications, and traversing models to set up fine-grained listeners spends that precious time. Additionally, in many apps interactions tend to result either in small (button hover) or large (page transition) updates, in which case fine-grained subscriptions are a waste of memory resources.

Una de los principios básicos de diseño de React es que funciona con datos en bruto. Si tienes una cantidad de objetos Javascript recibidos por la red, puedes incorporarlos directamente en tus componentes sin procesamiento. No hay errores inesperados en cuanto a qué propiedades puedes acceder, o caídas inesperadas en el rendimiento cuando una estructura cambia ligeramente. El renderizado de React es O(*tamaño de la vista*) y no O(*tamaño del modelo*), y se puede reducir significativamente el *tamaño de la vista* con la técnica de????? [*ventanas*](https://react-window.now.sh/#/examples/list/fixed-size).

Hay algunos tipos de aplicaciones donde la suscripciones detalladas son beneficiosas (como los indicadores de cotizaciones bursátiles). Este es un ejemplo poco común de «todo se actualiza constantemente al mismo tiempo». Si bien las vías de escape imperativas pueden ayudar a optimizar dicho código, React podría no ser la mejor opción para este caso de uso. Aún así, puedes implementar tu propio sistema detallado???? de suscripción sobre React.

**Nota que hay problemas de rendimiento comunes que incluso los sistemas detallados de suscripciones y «reactivos» no pueden solucionar.**
**Note that there are common performance issues that even fine-grained subscriptions and “reactivity” systems can’t solve.** For example, rendering a *new* deep tree (which happens on every page transition) without blocking the browser. Change tracking doesn’t make it faster — it makes it slower because we have to do more work to set up subscriptions. Another problem is that we have to wait for data before we can start rendering the view. In React, we aim to solve both of these problems with [Concurrent Rendering](https://reactjs.org/blog/2018/03/01/sneak-peek-beyond-react-16.html).


## Batching

Several components may want to update state in response to the same event. This example is convoluted but it illustrates a common pattern:

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

When an event is dispatched, the child’s `onClick` fires first (triggering its `setState`). Then the parent calls `setState` in its own `onClick` handler.

If React immediately re-rendered components in response to `setState` calls, we’d end up rendering the child twice:

```jsx{4,8}
*** Entering React's browser click event handler ***
Child (onClick)
  - setState
  - re-render Child // 😞 unnecessary
Parent (onClick)
  - setState
  - re-render Parent
  - re-render Child
*** Exiting React's browser click event handler ***
```

The first `Child` render would be wasted. And we couldn’t make React skip rendering `Child` for the second time because the `Parent` might pass some different data to it based on its updated state.

**This is why React batches updates inside event handlers:**

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

The `setState` calls in components wouldn’t immediately cause a re-render. Instead, React would execute all event handlers first, and then trigger a single re-render batching all of those updates together.

Batching is good for performance but can be surprising if you write code like:

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

If we start with `count` set to `0`, these would just be three `setCount(1)` calls. To fix this, `setState` provides an overload that accepts an “updater” function:

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

React would put the updater functions in a queue, and later run them in sequence, resulting in a re-render with `count` set to `3`.

When state logic gets more complex than a few `setState` calls, I recommend to express it as a local state reducer with the [`useReducer` Hook](https://reactjs.org/docs/hooks-reference.html#usereducer). It’s like an evolution of this “updater” pattern where each update is given a name:

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

The `action` argument can be anything, although an object is a common choice.

## Call Tree

A programming language runtime usually has a [call stack](https://medium.freecodecamp.org/understanding-the-javascript-call-stack-861e41ae61d4). When a function `a()` calls `b()` which itself calls `c()`, somewhere in the JavaScript engine there’s a data structure like `[a, b, c]` that “keeps track” of where you are and what code to execute next. Once you exit out of `c`, its call stack frame is gone — poof! It’s not needed anymore. We jump back into `b`. By the time we exit `a`, the call stack is empty.

Of course, React itself runs in JavaScript and obeys JavaScript rules. But we can imagine that internally React has some kind of its own call stack to remember which component we are currently rendering, e.g. `[App, Page, Layout, Article /* we're here */]`.

React is different from a general purpose language runtime because it’s aimed at rendering UI trees. These trees need to “stay alive” for us to interact with them. The DOM doesn’t disappear after our first `ReactDOM.render()` call.

This may be stretching the metaphor but I like to think of React components as being in a “call tree” rather than just a “call stack”. When we go “out” of the `Article` component, its React “call tree” frame doesn’t get destroyed. We need to keep the local state and references to the host instances [somewhere](https://medium.com/react-in-depth/the-how-and-why-on-reacts-usage-of-linked-list-in-fiber-67f1014d0eb7).

These “call tree” frames *are* destroyed along with their local state and host instances, but only when the [reconciliation](#reconciliation) rules say it’s necessary. If you ever read React source, you might have seen these frames being referred to as [Fibers](https://en.wikipedia.org/wiki/Fiber_(computer_science)).

Fibers are where the local state actually lives. When state is updated, React marks the Fibers below as needing reconciliation, and calls those components.

## Context

In React, we pass things down to other components as props. Sometimes, the majority of components need the same thing — for example, the currently chosen visual theme. It gets cumbersome to pass it down through every level.

In React, this is solved by [Context](https://reactjs.org/docs/context.html). It is essentially like [dynamic scoping](http://wiki.c2.com/?DynamicScoping) for components. It’s like a wormhole that lets you put something on the top, and have every child at the bottom be able to read it and re-render when it changes.

```jsx
const ThemeContext = React.createContext(
  'light' // Default value as a fallback
);

function DarkApp() {
  return (
    <ThemeContext.Provider value="dark">
      <MyComponents />
    </ThemeContext.Provider>
  );
}

function SomeDeeplyNestedChild() {
  // Depends on where the child is rendered
  const theme = useContext(ThemeContext);
  // ...
}
```

When `SomeDeeplyNestedChild` renders, `useContext(ThemeContext)` will look for the closest `<ThemeContext.Provider>` above it in the tree, and use its `value`.

(In practice, React maintains a context stack while it renders.)

If there’s no `ThemeContext.Provider` above, the result of `useContext(ThemeContext)` call will be the default value specified in the `createContext()` call. In our example, it is `'light'`.


## Effects

We mentioned earlier that React components shouldn’t have observable side effects during rendering. But side effects are sometimes necessary. We may want to manage focus, draw on a canvas, subscribe to a data source, and so on.

In React, this is done by declaring an effect:

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

When possible, React defers executing effects until after the browser re-paints the screen. This is good because code like data source subscriptions shouldn’t hurt [time to interactive](https://calibreapp.com/blog/time-to-interactive/) and [time to first paint](https://developers.google.com/web/tools/lighthouse/audits/first-meaningful-paint). (There's a [rarely used](https://reactjs.org/docs/hooks-reference.html#uselayouteffect) Hook that lets you opt out of that behavior and do things synchronously. Avoid it.)

Effects don’t just run once. They run both after component is shown to the user for the first time, and after it updates. Effects can close over current props and state, such as with `count` in the above example.

Effects may require cleanup, such as in case of subscriptions. To clean up after itself, an effect can return a function:

```jsx
  useEffect(() => {
    DataSource.addSubscription(handleChange);
    return () => DataSource.removeSubscription(handleChange);
  });
```

React will execute the returned function before applying this effect the next time, and also before the component is destroyed.

Sometimes, re-running the effect on every render can be undesirable. You can tell React to [skip](https://reactjs.org/docs/hooks-effect.html#tip-optimizing-performance-by-skipping-effects) applying an effect if certain variables didn’t change:

```jsx{3}
  useEffect(() => {
    document.title = `You clicked ${count} times`;
  }, [count]);
```

However, it is often a premature optimization and can lead to problems if you’re not familiar with how JavaScript closures work.

For example, this code is buggy:

```jsx
  useEffect(() => {
    DataSource.addSubscription(handleChange);
    return () => DataSource.removeSubscription(handleChange);
  }, []);
```

It is buggy because `[]` says “don’t ever re-execute this effect”. But the effect closes over `handleChange` which is defined outside of it. And `handleChange` might reference any props or state:

```jsx
  function handleChange() {
    console.log(count);
  }
```

If we never let the effect re-run, `handleChange` will keep pointing at the version from the first render, and `count` will always be `0` inside of it.

To solve this, make sure that if you specify the dependency array, it includes **all** things that can change, including the functions:

```jsx{4}
  useEffect(() => {
    DataSource.addSubscription(handleChange);
    return () => DataSource.removeSubscription(handleChange);
  }, [handleChange]);
```

Depending on your code, you might still see unnecessary resubscriptions because `handleChange` itself is different on every render. The [`useCallback`](https://reactjs.org/docs/hooks-reference.html#usecallback) Hook can help you with that. Alternatively, you can just let it re-subscribe. For example, browser’s `addEventListener` API is extremely fast, and jumping through hoops to avoid calling it might cause more problems than it’s worth.

*(You can learn more about `useEffect` and other Hooks provided by React [here](https://reactjs.org/docs/hooks-effect.html).)*

## Custom Hooks

Since Hooks like `useState` and `useEffect` are function calls, we can compose them into our own Hooks:

```jsx{2,8}
function MyResponsiveComponent() {
  const width = useWindowWidth(); // Our custom Hook
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

Custom Hooks let different components share reusable stateful logic. Note that the *state itself* is not shared. Each call to a Hook declares its own isolated state.

*(You can learn more about writing your own Hooks [here](https://reactjs.org/docs/hooks-custom.html).)*

## Static Use Order

You can think of `useState` as a syntax for defining a “React state variable”. It’s not *really* a syntax, of course. We’re still writing JavaScript. But we are looking at React as a runtime environment, and because React tailors JavaScript to describing UI trees, its features sometimes live closer to the language space.

If `use` *was* a syntax, it would make sense for it to be at the top level:

```jsx{3}
// 😉 Note: not a real syntax
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

What would putting it into a condition or a callback or outside a component even mean?

```jsx
// 😉 Note: not a real syntax

// This is local state... of what?
const [count, setCount] = use State(0);

component Example() {
  if (condition) {
    // What happens to it when condition is false?
    const [count, setCount] = use State(0);
  }

  function handleClick() {
    // What happens to it when we leave a function?
    // How is this different from a variable?
    const [count, setCount] = use State(0);
  }
```

React state is local to the *component* and its identity in the tree. If `use` was a real syntax it would make sense to scope it to the top-level of a component too:


```jsx
// 😉 Note: not a real syntax
component Example(props) {
  // Only valid here
  const [count, setCount] = use State(0);

  if (condition) {
    // This would be a syntax error
    const [count, setCount] = use State(0);
  }
```

This is similar to how `import` only works at the top level of a module.

**Of course, `use` is not actually a syntax.** (It wouldn’t bring much benefit and would create a lot of friction.)

However, React *does* expect that all calls to Hooks happen only at the top level of a component and unconditionally. These [Rules of Hooks](https://reactjs.org/docs/hooks-rules.html) can be enforced with [a linter plugin](https://www.npmjs.com/package/eslint-plugin-react-hooks). There have been heated arguments about this design choice but in practice I haven’t seen it confusing people. I also wrote about why commonly proposed alternative [don’t work](https://overreacted.io/why-do-hooks-rely-on-call-order/).

Internally, Hooks are implemented as [linked lists](https://dev.to/aspittel/thank-u-next-an-introduction-to-linked-lists-4pph). When you call `useState`, we move the pointer to the next item. When we exit the component’s [“call tree” frame](#call-tree), we save the resulting list there until the next render.

[This article](https://medium.com/@ryardley/react-hooks-not-magic-just-arrays-cd4f1857236e) provides a simplified explanation for how Hooks work internally. Arrays might be an easier mental model than linked lists:


```jsx
// Pseudocode
let hooks, i;
function useState() {
  i++;
  if (hooks[i]) {
    // Next renders
    return hooks[i];
  }
  // First render
  hooks.push(...);
}

// Prepare to render
i = -1;
hooks = fiber.hooks || [];
// Call the component
YourComponent();
// Remember the state of Hooks
fiber.hooks = hooks;
```

*(If you’re curious, the real code is [here](https://github.com/facebook/react/blob/master/packages/react-reconciler/src/ReactFiberHooks.js).)*

This is roughly how each `useState()` call gets the right state. As we’ve learned [earlier](#reconciliation), “matching things up” isn’t new to React — reconciliation relies on the elements matching up between renders in a similar way.

## What’s Left Out

We’ve touched on pretty much all important aspects of the React runtime environment. If you finished this page, you probably know React in more detail than 90% of its users. And there’s nothing wrong with that!

There are some parts I left out — mostly because they’re unclear even to us. React doesn’t currently have a good story for multipass rendering, i.e. when the parent render needs information about the children. Also, the [error handling API](https://reactjs.org/docs/error-boundaries.html) doesn’t yet have a Hooks version. It’s possible that these two problems can be solved together. Concurrent Mode is not stable yet, and there are interesting questions about how Suspense fits into this picture. Maybe I’ll do a follow-up when they’re fleshed out and Suspense is ready for more than [lazy loading](https://reactjs.org/blog/2018/10/23/react-v-16-6.html#reactlazy-code-splitting-with-suspense).

**I think it speaks to the success of React’s API that you can get very far without ever thinking about most of these topics.** Good defaults like the reconciliation heuristics do the right thing in most cases. Warnings like the `key` warning nudge you when you risk shooting yourself in the foot.

If you’re a UI library nerd, I hope this post was somewhat entertaining and clarified how React works in more depth. Or maybe you decided React is too complicated and you’ll never look it again. In either case, I’d love to hear from you on Twitter! Thank you for reading.
