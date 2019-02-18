---
title: ¿Cómo sabe setState qué hacer?
date: '2018-12-09'
spoiler: La inyección de dependencias es buena si no tienes que pensar en ella.
---

Cuando llamas a `setState` en un componente, ¿qué crees que ocurre?

```jsx{11}
import React from 'react';
import ReactDOM from 'react-dom';

class Button extends React.Component {
  constructor(props) {
    super(props);
    this.state = { clicked: false };
    this.handleClick = this.handleClick.bind(this);
  }
  handleClick() {
    this.setState({ clicked: true });
  }
  render() {
    if (this.state.clicked) {
      return <h1>Thanks</h1>;
    }
    return (
      <button onClick={this.handleClick}>
        Click me!
      </button>
    );
  }
}

ReactDOM.render(<Button />, document.getElementById('container'));
```

Claro, React vuelve a renderizar el componente con el próximo estado `{ clicked: true }` y actualiza el DOM para hacerlo coincidir con el elemento devuelto `<h1>Thanks</h1>`.

Parece sencillo, pero, espera. ¿Lo hace *React*, o *React DOM*?

La actualización del DOM parece algo que debe ser responsabilidad de React DOM. Pero estamos llamando a `this.setState()`, no a algo de React DOM. Y nuestra clase base `React.Component` se define también dentro de React.

Entonces, ¿cómo puede `setState()` dentro de `React.Component` actualizar el DOM?

**Aclaración: Al igual que la [mayoría](/why-do-react-elements-have-typeof-property/) de los [otros ](/how-does-react-tell-a-class-from-a-function/) [artículos](/why-do-we-write-super-props/) en este blog, en realidad no *necesitas* saber nada de esto para ser productivo en React. Este artículo es para aquellos a los que les gusta ver que hay detrás del telón. ¡Completamente opcional!**

---

Podríamos pensar que la clase `React.Component` contiene lógica de actualización del DOM.

Pero si ese fuera el caso, ¿cómo puede funcionar `this.setState()` en otros entornos? Por ejemplo, los componentes en aplicaciones de React Native también heredan de `React.Component`. Llama a `this.setState()` justo como acabamos de hacerlo, y sin embargo React Native funciona con las vistas nativas de Android y iOS y no con el DOM.

Puede que también estés familiarizado con React Test Renderer o Shallow Renderer. Ambas estrategias de realización de pruebas te permiten renderizar componentes normales y llamar a `this.setState()` dentro de ellos. Pero ninguna de ellas trabaja con el DOM.

Si has usado renderizadores como [React ART](https://github.com/facebook/react/tree/master/packages/react-art), puede que también sepas que es posible utilizar más de un renderizador en la página. (Por ejemplo, los componentes ART funcionan dentro de un árbol de React DOM). Esto hace que un centinela o variable global sea insostenible.

Entonces, de alguna manera **`React.Component` delega el manejo de las actualizaciones de estado al código específico de la plataforma.** Antes de que podamos entender como esto ocurre, investiguemos con mayor profundidad en cómo están separados los paquetes y por qué.

---

Existe una idea equivocada de que el «motor» de React vive dentro del paquete `react`. Eso no es cierto.

De hecho, desde la [separación de los paquetes en React 0.14](https://reactjs.org/blog/2015/07/03/react-v0.14-beta-1.html#two-packages), el paquete `react` intencionalmente solo expone APIs para definir componentes. La mayoría de la *implementación* de React vive entro de los «renderizadores».

`react-dom`, `react-dom/server`, `react-native`, `react-test-renderer`, `react-art` son algunos ejemplos de renderizadores (y puedes [construir el tuyo](https://github.com/facebook/react/blob/master/packages/react-reconciler/README.md#practical-examples)).

Es por eso que el paquete `react` es útil sin importar la plataforma de destino. Todas sus exportaciones, como `React.Component`, `React.createElement`, las utilidades de `React.Children` y (eventualmente) los [Hooks](https://reactjs.org/docs/hooks-intro.html), son independientes de la plataforma de destino. Ya sea si corres React DOM, React DOM Server o React Native, tus componentes los importarán y usarán de la misma forma.

En contraste, los paquetes de renderizadores expones APIs específicas para cada plataforma como `ReactDOM.render()` que te permite montar una jerarquía de React en un nodo del DOM. Cada renderizador proporciona una API similar a esta. Idealmente, la mayoría de los *componentes* no deberían tener la necesidad de importar nada de un renderizador. Esto los mantiene más portables.

**Lo que la mayoría de las personas imaginan como el «motor» de React está dentro de cada renderizador individual.** Muchos renderizadores incluyen una copia del mismo código (lo llamamos el [«conciliador»](https://github.com/facebook/react/tree/master/packages/react-reconciler)) Un paso de compilación(https://reactjs.org/blog/2017/12/15/improving-the-repository-infrastructure.html#migrating-to-google-closure-compiler) une el código del conciliador junto con el del renderizador en un paquete altamente optimizado para un mejor rendimiento. (Copiar código no es a menudo muy bueno para el tamaño final de las aplicaciones pero la gran mayoría de los usuarios de React solo necesitan un solo renderizador en cada momento, como el caso de `react-dom`).

La moraleja aquí es que el paquete `react` solo te deja *utilizar* características de React pero no sabe nada de *cómo* están implementadas. Los paquetes renderizadores (`react-dom`, `react-native`, etc) proporcionan la implementación de características de React y la lógica específica de cada plataforma. Parte de ese código es compartido («el conciliador»), pero ese es un detalle de implementación de cada renderizador.

---

Ahora sabemos por qué tanto `react` como `react-dom` tienen que actualizarse para obtener nuevas características. Por ejemplo, cuando React 16.3 añadió la API Context, se expuso `React.createContext()` en el paquete de React.

Pero `React.createContext()` en realidad no *implementa* la característica de contexto. La implementación necesitaría ser diferente entre React DOM y React DOM Server, por ejemplo. Es por eso que `createContext()` devuelve algunos objetos planos:

```js
// Está algo simplificado
function createContext(defaultValue) {
  let context = {
    _currentValue: defaultValue,
    Provider: null,
    Consumer: null
  };
  context.Provider = {
    $$typeof: Symbol.for('react.provider'),
    _context: context
  };
  context.Consumer = {
    $$typeof: Symbol.for('react.context'),
    _context: context,
  };
  return context;
}
```

Cuando utilizas en el código `<MyContext.Provider>` o `<MyContext.Consumer>`, es el *renderizador* el que decide como manejarlos. React DOM puede que lleve el seguimiento de los valores de contexto de una forma, pero React DOM lo haga de una manera distinta.

**Es po eso que si actualizas `react` a 16.3+, pero no actualizas `react-dom`, estarías usando un renderizador que no está todavía al tanto de los tipos especiales `Provider` y `Consumer`.** Es por eso que un `react-dom` antiguo [fallaría diciendo que estos tipos no son válidos](https://stackoverflow.com/a/49677020/458193).

La misma advertencia aplica para React Native. Sin embargo, a diferencia de React DOM, una versión nueva de React no «fuerza» inmediatamente una nueva versión de React Native. Ambos tienen diferentes programaciones de sus lanzamientos. El código actualizado del renderizador se [sincroniza de forma separada](https://github.com/facebook/react-native/commits/master/Libraries/Renderer/oss) una vez cada unas pocas semanas ????? Es por eso que las características están disponibles en React Native con una programación diferente que en React DOM.

---

Okay, so now we know that the `react` package doesn’t contain anything interesting, and the implementation lives in renderers like `react-dom`, `react-native`, and so on. But that doesn’t answer our question. How does `setState()` inside `React.Component` “talk” to the right renderer?

**The answer is that every renderer sets a special field on the created class.** This field is called `updater`. It’s not something *you* would set — rather, it’s something React DOM, React DOM Server or React Native set right after creating an instance of your class:


```js{4,9,14}
// Inside React DOM
const inst = new YourComponent();
inst.props = props;
inst.updater = ReactDOMUpdater;

// Inside React DOM Server
const inst = new YourComponent();
inst.props = props;
inst.updater = ReactDOMServerUpdater;

// Inside React Native
const inst = new YourComponent();
inst.props = props;
inst.updater = ReactNativeUpdater;
```

Looking at the [`setState` implementation in `React.Component`](https://github.com/facebook/react/blob/ce43a8cd07c355647922480977b46713bd51883e/packages/react/src/ReactBaseClasses.js#L58-L67), all it does is delegate work to the renderer that created this component instance:

```js
// A bit simplified
setState(partialState, callback) {
  // Use the `updater` field to talk back to the renderer!
  this.updater.enqueueSetState(this, partialState, callback);
}
```

React DOM Server [might want to](https://github.com/facebook/react/blob/ce43a8cd07c355647922480977b46713bd51883e/packages/react-dom/src/server/ReactPartialRenderer.js#L442-L448) ignore a state update and warn you, whereas React DOM and React Native would let their copies of the reconciler [handle it](https://github.com/facebook/react/blob/ce43a8cd07c355647922480977b46713bd51883e/packages/react-reconciler/src/ReactFiberClassComponent.js#L190-L207).

And this is how `this.setState()` can update the DOM even though it’s defined in the React package. It reads `this.updater` which was set by React DOM, and lets React DOM schedule and handle the update.

---

We know about classes now, but what about Hooks?

When people first look at the [Hooks proposal API](https://reactjs.org/docs/hooks-intro.html), they often wonder: how does `useState` “know what to do”? The assumption is that it’s more “magical” than a base `React.Component` class with `this.setState()`.

But as we have seen today, the base class `setState()` implementation has been an illusion all along. It doesn’t do anything except forwarding the call to the current renderer. And `useState` Hook [does exactly the same thing](https://github.com/facebook/react/blob/ce43a8cd07c355647922480977b46713bd51883e/packages/react/src/ReactHooks.js#L55-L56).

**Instead of an `updater` field, Hooks use a “dispatcher” object.** When you call `React.useState()`, `React.useEffect()`, or another built-in Hook, these calls are forwarded to the current dispatcher.

```js
// In React (simplified a bit)
const React = {
  // Real property is hidden a bit deeper, see if you can find it!
  __currentDispatcher: null,

  useState(initialState) {
    return React.__currentDispatcher.useState(initialState);
  },

  useEffect(initialState) {
    return React.__currentDispatcher.useEffect(initialState);
  },
  // ...
};
```

And individual renderers set the dispatcher before rendering your component:

```js{3,8-9}
// In React DOM
const prevDispatcher = React.__currentDispatcher;
React.__currentDispatcher = ReactDOMDispatcher;
let result;
try {
  result = YourComponent(props);
} finally {
  // Restore it back
  React.__currentDispatcher = prevDispatcher;
}
```

For example, the React DOM Server implementation is [here](https://github.com/facebook/react/blob/ce43a8cd07c355647922480977b46713bd51883e/packages/react-dom/src/server/ReactPartialRendererHooks.js#L340-L354), and the reconciler implementation shared by React DOM and React Native is [here](https://github.com/facebook/react/blob/ce43a8cd07c355647922480977b46713bd51883e/packages/react-reconciler/src/ReactFiberHooks.js).

This is why a renderer such as `react-dom` needs to access the same `react` package that you call Hooks from. Otherwise, your component won’t “see” the dispatcher! This may not work when you have [multiple copies of React](https://github.com/facebook/react/issues/13991) in the same component tree. However, this has always led to obscure bugs so Hooks force you to solve the package duplication before it costs you.

While we don’t encourage this, you can technically override the dispatcher yourself for advanced tooling use cases. (I lied about  `__currentDispatcher` name but you can find the real one in the React repo.) For example, React DevTools will use [a special purpose-built dispatcher](https://github.com/facebook/react/blob/ce43a8cd07c355647922480977b46713bd51883e/packages/react-debug-tools/src/ReactDebugHooks.js#L203-L214) to introspect the Hooks tree by capturing JavaScript stack traces. *Don’t repeat this at home.*

This also means Hooks aren’t inherently tied to React. If in the future more libraries want to reuse the same primitive Hooks, in theory the dispatcher could move to a separate package and be exposed as a first-class API with a less “scary” name. In practice, we’d prefer to avoid premature abstraction until there is a need for it.

Both the `updater` field and the `__currentDispatcher` object are forms of a generic programming principle called *dependency injection*. In both cases, the renderers “inject” implementations of features like `setState` into the generic React package to keep your components more declarative.

You don’t need to think about how this works when you use React. We’d like React users to spend more time thinking about their application code than abstract concepts like dependency injection. But if you’ve ever wondered how `this.setState()` or `useState()` know what to do, I hope this helps.

---

