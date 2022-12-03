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
      return <h1>Gracias</h1>;
    }
    return (
      <button onClick={this.handleClick}>
        ¡Haz clic en mí!
      </button>
    );
  }
}

ReactDOM.render(<Button />, document.getElementById('container'));
```

Claro, React vuelve a renderizar el componente con el próximo estado `{ clicked: true }` y actualiza el DOM para hacerlo coincidir con el elemento devuelto `<h1>Gracias</h1>`.

Parece sencillo, pero, espera. ¿Lo hace *React*, o *React DOM*?

La actualización del DOM parece algo que debe ser responsabilidad de React DOM. Pero estamos llamando a `this.setState()`, no a algo de React DOM. Y nuestra clase base `React.Component` se define también dentro de React.

Entonces, ¿cómo puede `setState()` dentro de `React.Component` actualizar el DOM?

**Aclaración: Al igual que la [mayoría](/why-do-react-elements-have-typeof-property/) de los [otros ](/how-does-react-tell-a-class-from-a-function/) [artículos](/why-do-we-write-super-props/) en este blog, en realidad no *necesitas* saber nada de esto para ser productivo en React. Este artículo es para aquellos a los que les gusta ver qué hay detrás del telón. ¡Completamente opcional!**

---

Podríamos pensar que la clase `React.Component` contiene lógica de actualización del DOM.

Pero si ese fuera el caso, ¿cómo puede funcionar `this.setState()` en otros entornos? Por ejemplo, los componentes en aplicaciones de React Native también heredan de `React.Component`. Llama a `this.setState()` justo como acabamos de hacerlo, y sin embargo React Native funciona con las vistas nativas de Android y iOS y no con el DOM.

Puede que también estés familiarizado con React Test Renderer o Shallow Renderer. Ambas estrategias de realización de pruebas te permiten renderizar componentes normales y llamar a `this.setState()` dentro de ellos. Pero ninguna de ellas trabaja con el DOM.

Si has usado renderizadores como [React ART](https://github.com/facebook/react/tree/master/packages/react-art), puede que también sepas que es posible utilizar más de un renderizador en la página. (Por ejemplo, los componentes ART funcionan dentro de un árbol de React DOM). Esto hace que un centinela o variable global sea insostenible.

Entonces, de alguna manera **`React.Component` delega el manejo de las actualizaciones de estado al código específico de la plataforma.** Antes de que podamos entender cómo esto ocurre, investiguemos con mayor profundidad cómo están separados los paquetes y por qué.

---

Existe una idea equivocada de que el «motor» de React vive dentro del paquete `react`. Eso no es cierto.

De hecho, desde la [separación de los paquetes en React 0.14](https://reactjs.org/blog/2015/07/03/react-v0.14-beta-1.html#two-packages), el paquete `react` intencionalmente solo expone APIs para definir componentes. La mayoría de la *implementación* de React vive dentro de los «renderizadores».

`react-dom`, `react-dom/server`, `react-native`, `react-test-renderer`, `react-art` son algunos ejemplos de renderizadores (y puedes [construir el tuyo](https://github.com/facebook/react/blob/master/packages/react-reconciler/README.md#practical-examples)).

Es por eso que el paquete `react` es útil sin importar la plataforma de destino. Todas sus exportaciones, como `React.Component`, `React.createElement`, las utilidades de `React.Children` y (eventualmente) los [Hooks](https://reactjs.org/docs/hooks-intro.html), son independientes de la plataforma de destino. Ya sea si corres React DOM, React DOM Server o React Native, tus componentes los importarán y usarán de la misma forma.

En contraste, los paquetes de renderizadores exponen APIs específicas para cada plataforma como `ReactDOM.render()` que te permite montar una jerarquía de React en un nodo del DOM. Cada renderizador proporciona una API similar a esta. Idealmente, la mayoría de los *componentes* no deberían tener la necesidad de importar nada de un renderizador. Esto los mantiene más portables.

**Lo que la mayoría de las personas imaginan como el «motor» de React está dentro de cada renderizador individual.** Muchos renderizadores incluyen una copia del mismo código (lo llamamos el [«conciliador»](https://github.com/facebook/react/tree/master/packages/react-reconciler)). Un [paso de compilación](https://reactjs.org/blog/2017/12/15/improving-the-repository-infrastructure.html#migrating-to-google-closure-compiler) une el código del conciliador junto con el del renderizador en un paquete altamente optimizado para un mejor rendimiento. (Copiar código no es a menudo muy bueno para el tamaño final de las aplicaciones pero la gran mayoría de los usuarios de React solo necesitan un solo renderizador en cada momento, como el caso de `react-dom`).

La moraleja aquí es que el paquete `react` solo te deja *utilizar* características de React pero no sabe nada de *cómo* están implementadas. Los paquetes renderizadores (`react-dom`, `react-native`, etc) proporcionan la implementación de características de React y la lógica específica de cada plataforma. Parte de ese código es compartido («el conciliador»), pero ese es un detalle de implementación de cada renderizador.

---

Ahora sabemos por qué tanto `react` como `react-dom` tienen que actualizarse para obtener nuevas características. Por ejemplo, cuando React 16.3 añadió la API Context, se expuso `React.createContext()` en el paquete de React.

Pero `React.createContext()` en realidad no *implementa* la funcionalidad de contexto. La implementación necesitaría ser diferente entre React DOM y React DOM Server, por ejemplo. Es por eso que `createContext()` devuelve algunos objetos planos:

```jsx
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

Cuando utilizas en el código `<MyContext.Provider>` o `<MyContext.Consumer>`, es el *renderizador* el que decide cómo manejarlos. React DOM puede que lleve el seguimiento de los valores de contexto de una forma, pero React DOM Server lo haga de una manera distinta.

**Es por eso que si actualizas `react` a 16.3+, pero no actualizas `react-dom`, estarías usando un renderizador que no está todavía al tanto de los tipos especiales `Provider` y `Consumer`.** Es por eso que un `react-dom` antiguo [fallaría diciendo que estos tipos no son válidos](https://stackoverflow.com/a/49677020/458193).

La misma advertencia aplica para React Native. Sin embargo, a diferencia de React DOM, un lanzamiento de React no «fuerza» inmediatamente un lanzamiento de React Native. Ambos tienen diferentes programaciones de sus lanzamientos. El código del renderizador actualizado se [sincroniza de forma separada](https://github.com/facebook/react-native/commits/master/Libraries/Renderer/oss) con el repositorio de React Native una vez cada unas pocas semanas. Es por eso que las nuevas funcionalidades están disponibles en React Native con una programación diferente que en React DOM.

---

Bien, ahora ya sabemos que el paquete `react` no contiene nada interesante y la implementación vive en los renderizadores como `react-dom`, `react-native` y otros. Pero eso no responde nuestra pregunta. ¿Cómo `setState()` dentro de `React.Component` le «habla» al renderizador apropiado?

**La respuesta es que cada renderizador establece un campo especial en la clase creada.** Este campo se llama `updater`. No es algo que *tú* estableces, esa es tarea de React DOM, React DOM Server o React Native justo después de crear una instancia de tu clase:


```jsx{4,9,14}
// Dentro de React DOM
const inst = new TuComponente();
inst.props = props;
inst.updater = ReactDOMUpdater;

// Dentro de React DOM Server
const inst = new TuComponente();
inst.props = props;
inst.updater = ReactDOMServerUpdater;

// Dentro de React Native
const inst = new TuComponente();
inst.props = props;
inst.updater = ReactNativeUpdater;
```

Al mirar a la [implementación de `setState` en `React.Component`](https://github.com/facebook/react/blob/ce43a8cd07c355647922480977b46713bd51883e/packages/react/src/ReactBaseClasses.js#L58-L67), todo lo que hace es delegar trabajo al renderizador que creó esta instancia de componente.

```jsx
// Está algo simplificado
setState(partialState, callback) {
  // ¡Usa el campo `updater` para hablar con el renderizador!
  this.updater.enqueueSetState(this, partialState, callback);
}
```

React DOM Server [podría querer](https://github.com/facebook/react/blob/ce43a8cd07c355647922480977b46713bd51883e/packages/react-dom/src/server/ReactPartialRenderer.js#L442-L448) ignorar una actualización de estado y advertirte, mientras React DOM y React Native dejarían a sus copias del conciliador que se [encargaran de eso](https://github.com/facebook/react/blob/ce43a8cd07c355647922480977b46713bd51883e/packages/react-reconciler/src/ReactFiberClassComponent.js#L190-L207).

Y así es como `this.setState()` puede actualizar el DOM aún cuando está definido en el paquete de React. Él lee `this.updater` puesto por React DOM y deja que React DOM organice y maneje la actualización.

---

¿Ya sabemos de las clases, pero, y los Hooks?

Cuando las personas ven por primera vez la [API de la propuesta de los Hooks](https://reactjs.org/docs/hooks-intro.html), a menudo se preguntan: ¿cómo `useState` «sabe qué hacer»? Se asume que es más «mágico» que una clase base `React.Component` con `this.setState()`.

Pero como hemos visto hoy, la implementación de `setState()` en la clase base ha sido todo el tiempo una ilusión. No hace nada excepto pasar la llamada al renderizador actual. Y el Hook `useState` [hace exactamente lo mismo](https://github.com/facebook/react/blob/ce43a8cd07c355647922480977b46713bd51883e/packages/react/src/ReactHooks.js#L55-L56).

**En lugar de un campo `updater`, los Hooks tienen un objeto «*dispatcher*».** Cuando llamas a `React.useState()`, `React.useEffect()` u otro de los Hooks integrados en React, estas llamadas se pasan al *dispatcher* actual.

```jsx
// En React (está algo simplificado)
const React = {
  // La propiedad real está algo más escondida. ¡Intenta encontrarla!
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

Y los renderizadores individuales establecen el *dispatcher* antes de renderizar tu componente:

```jsx{3,8-9}
// In React DOM
const prevDispatcher = React.__currentDispatcher;
React.__currentDispatcher = ReactDOMDispatcher;
let result;
try {
  result = TuComponente(props);
} finally {
  // Restore it back
  React.__currentDispatcher = prevDispatcher;
}
```

Por ejemplo, la implementación de React DOM Server está [aquí](https://github.com/facebook/react/blob/ce43a8cd07c355647922480977b46713bd51883e/packages/react-dom/src/server/ReactPartialRendererHooks.js#L340-L354) y la implementación del conciliador compartida por React DOM y React Native está [aquí](https://github.com/facebook/react/blob/ce43a8cd07c355647922480977b46713bd51883e/packages/react-reconciler/src/ReactFiberHooks.js).

Es por eso que un renderizador como `react-dom` necesita acceder al mismo paquete `react` del que llamas a los Hooks. De otra forma, ¡tu componente no «vería» al *dispatcher*! Esto puede que no funcione cuando tienes [múltiples copias de React](https://github.com/facebook/react/issues/13991) en el mismo árbol de componentes. Sin embargo, esto siempre ha conducido a oscuros errores, así que los Hooks te obligan a resolver la duplicación antes de que te salga caro.

Si bien no lo promovemos, técnicamente puedes sobrescribir tú mismo el *dispatcher* para casos de uso avanzados que involucren la creación de herramientas. (Mentí sobre el nombre `__currentDispatcher`, pero puedes buscar el real en el repositorio de React). Por ejemplo, React DevTools usará un [*dispatcher* creado especialmente](https://github.com/facebook/react/blob/ce43a8cd07c355647922480977b46713bd51883e/packages/react-debug-tools/src/ReactDebugHooks.js#L203-L214) con el propósito de hacer la introspección del árbol de Hooks al capturar las trazas de la pila de Javascript. *No repitas esto en casa.*

Esto también significa que los Hooks no están atados inherentemente a React. En el futuro si más bibliotecas quisieran reutilizar los mismos Hooks primitivos, en teoría el *dispatcher* se podría mover a un paquete separado y exponerse como una API de primera clase con un nombre menos *aterrador*. En la práctica, preferiríamos evitar la abstracción prematura hasta que haya necesidad de ella.

Tanto el campo `updater` y el objeto `__currentDispatcher` son formas de un principio genérico de programación llamado *inyección de dependencias*. En ambos casos, los renderizadores «inyectan» implementaciones de características como `setState` en el paquete genérico de React para así mantener tus componentes más declarativos.

No tienes que pensar en cómo funciona esto cuando utilizas React. Nos gustaría que los usuarios de React pasen más tiempo pensando en su código de aplicación que en conceptos abstractos como la inyección de dependencias. Pero si alguna ves te preguntaste cómo `this.setState()` o `useState()` saben qué hacer, espero que esto haya sido de ayuda.

---

