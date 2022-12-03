---
title: Escribir components resilientes
date: '2019-03-16'
spoiler: Cuatro principios para guiarte por el camino correcto.
---

Cuando alguien comienza a estudiar React a menudo pide una guía de estilo. Si bien es una buena idea aplicar consistentemente algunas reglas en un proyecto, muchas de ellas son arbitrarias —y por tanto React no tiene una opinión tajante sobre ellas—.

Puedes usar diferentes sistemas de tipos, preferir declaraciones o funciones flecha, ordenar tus props en orden alfabético o en cualquier orden que te resulte agradable.

Esta flexibilidad permite que se [React se integre](https://reactjs.org/docs/add-react-to-a-website.html) en proyectos con convenciones ya existentes. Pero también da lugar a debates interminables.

**_Sí hay_ principios de diseño importantes que todo componente debería intentar seguir. Pero no creo que las guías de estilo capturen bien esos principios. Hablaremos primero sobre las guías de estilo, y luego [le echaremos un vistazo a los principio que _son_ realmente útiles](#writing-resilient-components).**

---

## No te dejes distraer por problemas imaginarios

Antes de que abordemos los principios de diseño de componentes, quisiera dedicar algunas palabras a las guías de estilo. ¡Esta no es una opinión popular, pero alguien tiene que decirla!

En la comunidad de JavaScript hay algunas guías de estilo estrictas y dogmáticas que se hacen cumplir por un _linter_. Mi observación personal es que suelen crear más fricción que el valor que tienen. Son innumerables las veces que alguien me ha mostrado un código completamente válido y me ha dicho «React se queja por esto», ¡pero era el _linter_ quien se quejaba! Esto conduce a tres problemas:

* Las personas se acostumbran a ver al _linter_ más como un **guardián excesivamente ruidoso** que como una herramienta útil. Las advertencias útiles quedan ahogadas en el mar de minucias de estilo. Al final, no revisan los mensajes del _linter_ mientras depuran el código, y se pierden consejos útiles. Aún más, quienes están menos acostumbradas a escribir JavaScript (por ejemplo, los diseñadores) se les hace más difícil trabajar con el código.

* Las personas no aprenden a **diferenciar entre usos válidos e inválidos** de un patrón determinado. Por ejemplo, hay una regla popular que prohíbe llamar a `setState` dentro de `componentDidMount`. ¡Pero, si siempre fuera «malo», React simplemente no lo permitiría! Hay una caso de uso legítimo: para hacer mediciones de la maquetación del nodo del DOM (por ejemplo, para posicionar un globo de ayuda). He visto personas «sortear» esta regla añadiendo `setTimeout`, lo que no tiene ningún sentido.

* Tarde o temprano, las personas adoptan el papel de «agente que hace cumplir las normas» y se vuelven dogmáticas sobre cosas que **no aportan ninguna diferencia significativa**, pero que son fáciles de encontrar en el código. «Usaste una declaración de función, pero *nuestro* proyecto usa funciones flecha». Cada vez que tengo una opinión tajante sobre hacer cumplir una regla como esta, si me detengo a analizar con profundidad resulta que he invertido esfuerzo emocional en esta regla —y me cuesta dejarla ir—. Me adormece en la falsa sensación de haber logrado algo sin mejorar mi código.

¿Acaso estoy diciendo que deberíamos dejar de usar un _linter_? ¡Para nada!

**Con una buena configuración, un _linter_ es una herramienta magnífica para detectar errores antes de que ocurran.** Es el enfoque excesivo en el *estilo* lo que lo convierte en una distracción.

---

## Haz un Marie Kondo a tu configuración del _linter_

Esto es lo que te sugiero que hagas el lunes. Reúne a tu equipo por media hora, recorre cada regla del _linter_ que esté habilitada en la configuración de tu proyecto y pregúntate: *«¿Esta regla nos ha ayudado alguna vez a detectar un error?»*. Si no es el caso, *desactívala.* (También puedes empezar de cero con [`eslint-config-react-app`](https://www.npmjs.com/package/eslint-config-react-app) que no tiene reglas de estilo).

Como mínimo, tu equipo debería tener un proceso para eliminar reglas que causan fricción. No asumas que algo que tú o alguien más añadió a tu configuración del _linter_ hace un año es una «buena práctica». Cuestiónalo y busca respuestas. No dejes que nadie te diga que no eres lo suficientemente inteligente para elegir tus reglas del _linter_.

**¿Pero, y el formateo?** Usa [Prettier](https://prettier.io/) y olvídate de las «minucias de estilo». No necesitas una herramienta que te grite por un espacio adicional si otra herramienta puede arreglarlo por ti. Usa el _linter_ para encontrar *errores*, no para hacer cumplir las reglas de *e s t é t i c a*.

Por supuesto, hay elementos del estilo de código que no están relacionados directamente con el formateo, pero pueden ser molestos cuando son inconsistentes en un proyecto.

Sin embargo, muchos de ellos son muy sutiles para detectarlos con una regla del _linter_. Por eso es importante **construir confianza** entre los miembros del equipo y compartir conocimientos útiles en la forma de una página wiki o una pequeña guía de diseño.

¡No todo vale la pena automatizarlo! La comprensión ganada de *realmente leer* las razones en esa guía puede ser más valioso que seguir las «reglas».

**Pero si seguir una guía de estilo estricta es una distracción, ¿qué es realmente importante?**

Ese es el tema de este artículo.

---

## Escribir componentes resilientes

No existe una cantidad de tabulación o de organizar _imports_ alfabéticamente que arregle un diseño roto. Es por eso que en lugar de enfocarme en cómo *luce* el código, lo haré en cómo *funciona*. Hay algunos principios de diseños de componentes que encuentro muy útiles:

1. **[No detengas el flujo de datos](#principle-1-dont-stop-the-data-flow)**
2. **[Estate listo siempre para renderizar](#principle-2-always-be-ready-to-render)**
3. **[Ningún componente es un *singleton*](#principle-3-no-component-is-a-singleton)**
4. **[Mantén aislado el estado local](#principle-4-keep-the-local-state-isolated)**

Incluso si no usas React, descubrirás los mismos principios por prueba y error en cualquier modelo de componentes de UI con un flujo de datos unidireccional.

---

## Principio 1: No detengas el flujo de datos

### No detengas el flujo de datos en el renderizado

Cuando alguien utiliza tu componente, espera que pueda pasar diferentes props a través del tiempo y que el componente refleje esos cambios:

```jsx
// isOk podría estar determinado por el estado y cambiar a través del tiempo
<Button color={isOk ? 'blue' : 'red'} />
```

De forma general, es así como React funciona por defecto. Si usas una prop `color` dentro de un componente `Button`, verás para ese renderizado el valor que se proporcionó desde arriba:

```jsx
function Button({ color, children }) {
  return (
    // ✅ ¡`color` siempre está fresco!
    <button className={'Button-' + color}>
      {children}
    </button>
  );
}
```

Sin embargo, un error común cuando se está aprendiendo React consiste en copiar las props en el estado:

```jsx{3,6}
class Button extends React.Component {
  state = {
    color: this.props.color
  };
  render() {
    const { color } = this.state; // 🔴 ¡`color` no está fresco!
    return (
      <button className={'Button-' + color}>
        {this.props.children}
      </button>
    );
  }
}
```

Esto puede que te parezca intuitivo en un inicio si has usado clases fuera de React. **Sin embargo, al copiar una prop en el estado estás ignorando todas las actualizaciones que se le hagan.**

```jsx
// 🔴 Ya no funciona para las actualizaciones con la implementación de arriba
<Button color={isOk ? 'blue' : 'red'} />
```

En el caso excepcional en que este comportamiento *es* intencional, asegúrate de nombrar esa prop `initialColor` o `defaultColor` para aclarar de que los cambios que tenga serán ignorados.

Pero lo común será **leer las props directamente en tu componente** y evitar copiar las props (o cualquier cosa que se calcule a partir de las props) en el estado:

```jsx
function Button({ color, children }) {
  return (
    // ✅ ¡`color` siempre está fresco!
    <button className={'Button-' + color}>
      {children}
    </button>
  );
}
```

----

Los valores calculados son otra razón por la que a veces se intenta copiar las props en el estado. Por ejemplo, imagina que se determine el color del *texto del botón* con base en un cálculo costoso que toma el `color` del fondo como argumento:

```jsx{3,9}
class Button extends React.Component {
  state = {
    textColor: slowlyCalculateTextColor(this.props.color)
  };
  render() {
    return (
      <button className={
        'Button-' + this.props.color +
        ' Button-text-' + this.state.textColor // 🔴 No se refresca cuando la prop `color` se actualiza
      }>
        {this.props.children}
      </button>
    );
  }
}
```

Este componente es propenso a errores porque no recalcula `this.state.textColor` cuando la prop `color` cambia. La forma más sencilla de solucionarlo implica mover el cálculo de `textColor` al método `render`, y convertir el  componente en `PureComponent`:

```jsx{1,3}
class Button extends React.PureComponent {
  render() {
    const textColor = slowlyCalculateTextColor(this.props.color);
    return (
      <button className={
        'Button-' + this.props.color +
        ' Button-text-' + textColor // ✅ Siempre fresco
      }>
        {this.props.children}
      </button>
    );
  }
}
```

¡Problema resuelto! Ahora si las props cambian recalcularemos `textColor`, pero evitamos el cálculo costoso si las props son las mismas.

Sin embargo, podríamos optimizarlo aún más. ¿Y si lo que cambia es la prop `children`? Resulta desafortunado recalcular `textColor` en ese caso. Nuestro segundo intento podría ser invocar el cálculo en `componentDidUpdate`:

```jsx{5-12}
class Button extends React.Component {
  state = {
    textColor: slowlyCalculateTextColor(this.props.color)
  };
  componentDidUpdate(prevProps) {
    if (prevProps.color !== this.props.color) {
      // 😔 Rerenderizado extra para cada actualización
      this.setState({
        textColor: slowlyCalculateTextColor(this.props.color),
      });
    }
  }
  render() {
    return (
      <button className={
        'Button-' + this.props.color +
        ' Button-text-' + this.state.textColor // ✅ Fresco en el renderizado final
      }>
        {this.props.children}
      </button>
    );
  }
}
```

Sin embargo, esto se traduce en que nuestro componente hace un segundo rerenderizado luego de cada cambio. Eso tampoco es ideal si lo que estamos es intentarlo optimizar.

Podrías usar el antiguo método de ciclo de vida `componentWillReceiveProps`. Sin embargo, ahí las personas suelen poner también efectos secundarios. Eso, luego, causaría problemas para funcionalidades futuras del renderizado concurrente [como la segmentación de tiempo y _Suspense_](https://es.reactjs.org/blog/2018/03/01/sneak-peek-beyond-react-16.html). Y el método «más seguro» `getDerivedStateFromProps` es complejo e incómodo.

Detengámonos y demos un paso atrás. En efecto, deseamos [*memoización*](https://es.wikipedia.org/wiki/Memoizaci%C3%B3n). Tenemos algunas entradas, y no queremos recalcular la salida a menos que las entradas cambien.

Con una clase, podrías usar un [utilitario](https://es.reactjs.org/blog/2018/06/07/you-probably-dont-need-derived-state.html#what-about-memoization) para la memoización. Sin embargo, los Hooks van un paso más allá e incorporan una forma de memoizar cálculos costosos:

```jsx{2-5}
function Button({ color, children }) {
  const textColor = useMemo(
    () => slowlyCalculateTextColor(color),
    [color] // ✅ Se recalcula solo si cambia `color`
  );
  return (
    <button className={'Button-' + color + ' Button-text-' + textColor}>
      {children}
    </button>
  );
}
```

¡Ese es todo el código que necesitas!

En un componente de clase, puedes usar un utilitario como [`memoize-one`](https://github.com/alexreardon/memoize-one). En un componente de función, el Hook `useMemo` te ofrece una funcionalidad similar.

Ya hemos visto que **incluso optimizar cálculos costosos no es una buena razón para copiar props en el estado.** Nuestro renderizado debería respertar los cambios a las props.

---

### No detengas el flujo de datos en los efectos secundarios

Hasta ahora hemos hablado de cómo hacer que el resultado del renderizado se mantenga consistente con los cambios de las props. Evitar copiar props en el estado es una parte. Sin embargo, es importante que **los efectos secundarios (como la carga de datos) sean también parte del flujo de datos**.

Tomemos como ejemplo este componente de React:

```jsx{5-7}
class SearchResults extends React.Component {
  state = {
    data: null
  };
  componentDidMount() {
    this.fetchResults();
  }
  fetchResults() {
    const url = this.getFetchUrl();
    // Se hace la carga de datos...
  }
  getFetchUrl() {
    return 'http://myapi/results?query' + this.props.query;
  }
  render() {
    // ...
  }
}
```

Muchos componentes de React son así: pero si nos detenemos a mirar un poco, podremos notar un error. El método `fetchResults` utiliza la prop `query` para hacer la carga de datos:

```jsx{2}
  getFetchUrl() {
    return 'http://myapi/results?query' + this.props.query;
  }
```

¡Pero qué pasa si cambia la prop `query`? En nuestro componente, no pasará nada. **Esto significa que los efectos secundarios de nuestro componente no respetan los cambios en sus props.** Esta es una fuente común de errores en las aplicaciones de React.

Para arreglar nuestro componente, debemos:

* Fijarnos en `componentDidMount` y en cada método que se llama desde él.
  - En nuestro ejemplo, son `fetchResults` y `getFetchUrl`.
* Apuntar todas las props y estado que estos métodos usan.
  - En nuestro ejemplo, es `this.props.query`.
* Asegúrate de que cada vez que esas props cambien, volvamos a ejecutar el efecto secundario.
  - Podemos hacerlo si añadimos el método `componentDidUpdate`.

```jsx{8-12,18}
class SearchResults extends React.Component {
  state = {
    data: null
  };
  componentDidMount() {
    this.fetchResults();
  }
  componentDidUpdate(prevProps) {
    if (prevProps.query !== this.props.query) { // ✅ Volver a cargar cuando hay un cambio
      this.fetchResults();
    }
  }
  fetchResults() {
    const url = this.getFetchUrl();
    // Se hace la carga de datos...
  }
  getFetchUrl() {
    return 'http://myapi/results?query' + this.props.query; // ✅ Se manejan las actualizaciones
  }
  render() {
    // ...
  }
}
```

Ahora nuestro código respeta todos los cambios a las props, incluso para los efectos secundarios.

Sin embargo, es complicado no volver a cometer el error. Por ejemplo, podríamos añadir `currentPage` al estado local y usarlo en `getFetchUrl`:

```jsx{4,21}
class SearchResults extends React.Component {
  state = {
    data: null,
    currentPage: 0,
  };
  componentDidMount() {
    this.fetchResults();
  }
  componentDidUpdate(prevProps) {
    if (prevProps.query !== this.props.query) {
      this.fetchResults();
    }
  }
  fetchResults() {
    const url = this.getFetchUrl();
    // Se hace la carga de datos...
  }
  getFetchUrl() {
    return (
      'http://myapi/results?query' + this.props.query +
      '&page=' + this.state.currentPage // 🔴 Se ignoran las actualizaciones
    );
  }
  render() {
    // ...
  }
}
```

Vaya, nuestro código es propenso a errores nuevamente porque nuestro efecto secundario no respeta los cambios a `currentPage`.

**Las props y el estado son parte del flujo de datos de React. Tanto el renderizado como los efectos secundarios deben reflejar los cambios en el flujo de datos, ¡no ignorarlos!**

Para arreglar nuestro código, podemos repetir los pasos de arriba:

* Fijarnos en `componentDidMount` y en cada método que se llama desde él.
  - En nuestro ejemplo, son `fetchResults` y `getFetchUrl`.
* Apuntar todas las props y estado que estos métodos usan.
  - En nuestro ejemplo, son `this.props.query` **y `this.state.currentPage`**.
* Asegúrate de que cada vez que esas props cambien, volvamos a ejecutar el efecto secundario.
  - Podemos hacerlo si añadimos el método `componentDidUpdate`.

Arreglemos nuestro componente para manejar las actualizaciones al estado `currentPage`:

```jsx{11,24}
class SearchResults extends React.Component {
  state = {
    data: null,
    currentPage: 0,
  };
  componentDidMount() {
    this.fetchResults();
  }
  componentDidUpdate(prevProps, prevState) {
    if (
      prevState.currentPage !== this.state.currentPage || // ✅ Volver a cargar cuando hay un cambio
      prevProps.query !== this.props.query
    ) {
      this.fetchResults();
    }
  }
  fetchResults() {
    const url = this.getFetchUrl();
    // Se hace la carga de datos...
  }
  getFetchUrl() {
    return (
      'http://myapi/results?query' + this.props.query +
      '&page=' + this.state.currentPage // ✅ Se manejan las actualizaciones
    );
  }
  render() {
    // ...
  }
}
```

**¿No estaría bien si de alguna forma pudiésemos detectar estos errores?** ¿No es esto algo con lo que un _linter_ nos pudiera ayudar?

---

Desafortunadamente, comprobar automáticamente la consistencia de un componente de clase es muy difícil. Cualquier método puede llamar a otro. El análisis estático de las llamadas que se hacen en `componentDidMount` y `componentDidUpdate` está lleno de falsos positivos.

Sin embargo, se *podría* diseñar una API que *pueda* analizarse estáticamente para comprobar la consistencia. El [Hook `useEffect` de React](/a-complete-guide-to-useeffect/) es un ejemplo de este tipo de API:

```jsx{13-14,19}
function SearchResults({ query }) {
  const [data, setData] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);

  useEffect(() => {
    function fetchResults() {
      const url = getFetchUrl();
      // Se hace la carga de datos...
    }

    function getFetchUrl() {
      return (
        'http://myapi/results?query' + query +
        '&page=' + currentPage
      );
    }

    fetchResults();
  }, [currentPage, query]); // ✅ Volver a cargar cuando hay un cambio

  // ...
}
```

Ponemos la lógica *dentro* del efecto, lo que facilita ver de *qué valores del flujo de datos de React* depende. Estos valores se llaman «dependencias» y en nuestro ejemplo son `[currentPage, query]`.

Fíjate como este arreglo de «dependencias del efecto» en realidad no es un nuevo concepto. En una clase, teníamos que buscar estas «dependencias» por todas las llamadas de los métodos. la API `useEffect` hace que el mismo concepto sea explícito.

Ahora, esto nos permite hacer la validación automáticamente:

![Demo de la regla del _linter_ exhaustive-deps](./useeffect.gif)

*(Esta es una demo de la nueva regla recomendada del _linter_ `exhaustive-deps` que es parte de `eslint-plugin-react-hooks`. Pronto se incluirá en Create React App).*

**Fíjate que es importante respetar todas las actualizaciones de las props y el estado para los efectos sin importar si estás escribiendo el componente como una clase o una función.**

Con la API de clases, debes pensar sobre la consistencia por tu cuenta, y verificar que los cambios en cada prop o estado relevantes se manejen por `componentDidUpdate`. De lo contrario, tu componente no es resiliente a los cambios en props y estado. Esto no es ni siquiera un problema específico de React. Aplica a cualquier biblioteca de UI que te permita manejar la «creación» y «actualización» de forma independiente.

**La API `useEffect` cambia el comportamiento por defecto y promueve la consistencia.** Esto [puede parecer extraño en un inicio](/a-complete-guide-to-useeffect/), pero el resultado es un componente que se vuelve más resiliente a los cambios en la lógica. Y como ahora las «dependencias» son explícitas, podemos *verificar* que el efecto es consistente con el uso de una regla de _linter_. ¡Usamos un _linter_ para detectar errores!

---

### No detengas el flujo de datos en las optimizaciones

Hay otro caso en el que podrías terminar ignorando los cambios a las props. El error puede ocurrir cuando optimizas manualmente tus componentes.

Fíjate que las formas de optimización que utilizan igualdad superficial como `PureComponente` y `React.memo` con la comparación por defecto son seguras.

**Sin embargo, si intentas «optimizar» un componente escribiendo tu propia comparación, puede que por error olvides comparar props de funciones:**

```jsx{2-5,7}
class Button extends React.Component {
  shouldComponentUpdate(prevProps) {
    // 🔴 No compara this.props.onClick
    return this.props.color !== prevProps.color;
  }
  render() {
    const onClick = this.props.onClick; // 🔴 No refleja actualizaciones
    const textColor = slowlyCalculateTextColor(this.props.color);
    return (
      <button
        onClick={onClick}
        className={'Button-' + this.props.color + ' Button-text-' + textColor}>
        {this.props.children}
      </button>
    );
  }
}
```

Es fácil no darse cuenta de este error a primera vista, porque con las clases pasarías hacia abajo un *método*, y por tanto tendría de todas formas la misma identidad:

```jsx{2-4,9-11}
class MyForm extends React.Component {
  handleClick = () => { // ✅ Siempre la misma función
    // Hacer algo
  }
  render() {
    return (
      <>
        <h1>Hello!</h1>
        <Button color='green' onClick={this.handleClick}>
          Press me
        </Button>
      </>
    )
  }
}
```

Ocurre entonces que nuestra optimización no se rompe *inmediatamente*. Sin embargo, seguirá «viendo» el antiguo valor de `onClick` si va cambiando mientras las otras props no lo hacen:

```jsx{6,13-15}
class MyForm extends React.Component {
  state = {
    isEnabled: true
  };
  handleClick = () => {
    this.setState({ isEnabled: false });
    // Hacer algo
  }
  render() {
    return (
      <>
        <h1>Hello!</h1>
        <Button color='green' onClick={
          // 🔴 Button ignora las actualizaciones a la prop onClick
          this.state.isEnabled ? this.handleClick : null
        }>
          Press me
        </Button>
      </>
    )
  }
}
```

En este ejemplo, si se hace clic en el botón se debería deshabilitar —pero no ocurre porque el componente `Button` ignora las actualizaciones a la prop `onClick`—.

Esto podría complicarse más si la identidad de la función depende de algo que podría cambiar en el tiempo, como `draft.content` en este ejemplo:

```jsx{6-7}
  drafts.map(draft =>
    <Button
      color='blue'
      key={draft.id}
      onClick={
        // 🔴 Button ignora las actualizaciones a la prop onClick
        this.handlePublish.bind(this, draft.content)
      }>
      Publish
    </Button>
  )
```

Si bien `draft.content` podría cambiar en el tiempo, nuestro componente `Button` ignoraría el cambio a la prop `onClick` y continuaría viendo la «primera versión» de `onClick` ligado al `draft.content` original.

**¿Cómo resolvemos este problema entonces?**

Yo recomiendo evitar implementar `shouldComponentUpdate` y evitar especificar una comparación personalizada para `React.memo()`. La comparación superficial en `React.memo` respetará el cambio de la identidad de la función:

```jsx{11}
function Button({ onClick, color, children }) {
  const textColor = slowlyCalculateTextColor(color);
  return (
    <button
      onClick={onClick}
      className={'Button-' + color + ' Button-text-' + textColor}>
      {children}
    </button>
  );
}
export default React.memo(Button); // ✅ Utiliza comparación superficial
```

En una clase, `PureComponent` tiene el mismo comportamiento.

Esto nos asegura que el paso de una función diferente como prop siempre funcionará.

Si insistes en una comparación personalizada, **asegúrate de no excluir las funciones:**

```jsx{5}
  shouldComponentUpdate(prevProps) {
    // ✅ Compara this.props.onClick 
    return (
      this.props.color !== prevProps.color ||
      this.props.onClick !== prevProps.onClick
    );
  }
```

Como mencioné anteriormente, es fácil pasar por alto este problema en los componentes de clase, porque las identidades de los métodos son a menudo estables (pero no siempre —y es ahí dónde los errores son difíciles de depurar—). Con los Hooks la situación cambia un poco:

1. Las funciones son diferentes *en cada renderizado* por lo que descubres este problema [inmediatamente](https://github.com/facebook/react/issues/14972#issuecomment-468280039).
2. Con `useCallback` y `useContext`, puedes [evitar pasar funciones del todo](https://reactjs.org/docs/hooks-faq.html#how-to-avoid-passing-callbacks-down). Esto te permite optimizar el renderizado sin preocuparte sobre las funciones.

---

Resumiendo esta sección, **¡no detengas el flujo de datos!**

Cada vez que uses props y estado analiza qué debería pasar si cambian. En la mayoría de los casos un componente no debería tratar el renderizado inicial y las actualizaciones de forma distinta. Eso lo hace resiliente a los cambios en la lógica.

Con las clases, es fácil olvidarse de las actualizaciones cuando se usan props y estados dentro de los métodos de ciclo de vida. Los Hooks te conducen a la forma correcta —pero se necesita algunos ajustes mentales si no tienes la costumbre de hacerlo—.

---

## Principio 2: Estate siempre listo para renderizar

Los componentes de React te permiten escribir código sin preocuparte mucho por el tiempo. Describes como la UI *debería* verse en cualquier momento, y React lo hace realidad. ¡Aprovecha ese modelo!

No trates de introducir suposiciones innecesarias sobre el tiempo en el comportamiento de tu componente. **Tu componente debería estar listo para volverse a renderizar en cualquier momento.**

¿Cómo se puede violar este principio? React no lo pone fácil —pero puedes hacerlo usando el método de ciclo de vida `componentWillReceiveProps`—:

```jsx{5-8}
class TextInput extends React.Component {
  state = {
    value: ''
  };
  // 🔴 Reasigna el estado local con cada renderizado del padre
  componentWillReceiveProps(nextProps) {
    this.setState({ value: nextProps.value });
  }
  handleChange = (e) => {
    this.setState({ value: e.target.value });
  };
  render() {
    return (
      <input
        value={this.state.value}
        onChange={this.handleChange}
      />
    );
  }
}
```

En este ejemplo, guardamos `value` en el estado local, pero *también* recibimos `value` como prop. Cada vez que «recibimos nuevas props», volvemos a establecer un `value` en el estado.

**El problema de este patrón es que depende totalmente de una sincronización accidental.**

Quizá hoy el padre de este componente se actualiza con poca frecuencia, y por tanto nuestro `TextInput` solo «recibe props» cuando pasa algo importante, como al guardar un formulario.

Pero mañana podríamos añadir una animación al padre de `TextInput`. Si el padre se rerenderiza más a menudo, ¡estará continuamente [«destruyendo»](https://codesandbox.io/s/m3w9zn1z8x) el estado del hijo! Puedes leer más sobre este problema en [«Probablemente no necesitas estado derivado»](https://es.reactjs.org/blog/2018/06/07/you-probably-dont-need-derived-state.html).

**¿Cómo podemos arreglarlo entonces?**

Antes que nada, debemos corregir nuestro modelo mental. Necesitamos dejar de pensar en «recibir props» como algo diferente a simplemente «renderizar». Un rerenderizado causado por un padre no debería comportarse de forma distinta a un rerenderizado causado por nuestro propio cambio de estado local. **Los componentes deberían ser resilientes al renderizado sea con más o menos frecuencia, porque de lo contrario estarían demasiado acoplados a sus padres.**

*([Esta demo](https://codesandbox.io/s/m3w9zn1z8x) muestra como el rerenderizado puede romper componentes frágiles.)*

Si bien hay algunas [soluciones](https://es.reactjs.org/blog/2018/06/07/you-probably-dont-need-derived-state.html#preferred-solutions) [diferentes](https://es.reactjs.org/docs/hooks-faq.html#how-do-i-implement-getderivedstatefromprops) para cuando realmente necesitas derivar estado de la props, usualmente deberías usar o bien un componente completamente controlado:

```jsx
// Opción 1: Componente completamente controlado.
function TextInput({ value, onChange }) {
  return (
    <input
      value={value}
      onChange={onChange}
    />
  );
}
```

O bien puedes usar un componente no controlado con una key para reiniciarlo:

```jsx
// Opción 2: Componente completamente no controlado.
function TextInput() {
  const [value, setValue] = useState('');
  return (
    <input
      value={value}
      onChange={e => setValue(e.target.value)}
    />
  );
}

// Podemos reiniciar su estado inicial luego con un cambio de key:
<TextInput key={formId} />
```

Lo que nos deberíamos llevar de esta sección es que tus componentes no deberían romperse simplemente porque su padre o sus padres se rerenderizan más a menudo. El diseño de la API de React lo facilita si evitas el antiguo método `componentWillReceiveProps`.

Para hacer una prueba de estrés a tu componente, puedes añadir temporalmente este código a su padre:

```jsx{2}
componentDidMount() {
  // ¡No olvides eliminar esto inmediatamente!
  setInterval(() => this.forceUpdate(), 100);
}
```

**No dejes este código** —es solo una forma rápida de comprobar qué pasa cuando un padre se rerenderiza más a menudo de lo que esperarías. ¡No debería romper al hijo!

---

Podrías estar pensando: «Seguiré reiniciando el estado cuando las props cambien, pero impediré los rerenderizados innecesarios con `PureComponent`».

¿Este código debería funcionar, cierto?

```jsx{1-2}
// 🤔 Debería prevenir rerenderizados innecesarios... ¿cierto?
class TextInput extends React.PureComponent {
  state = {
    value: ''
  };
  // 🔴 Reasigna el estado local en cada renderizado del padre
  componentWillReceiveProps(nextProps) {
    this.setState({ value: nextProps.value });
  }
  handleChange = (e) => {
    this.setState({ value: e.target.value });
  };
  render() {
    return (
      <input
        value={this.state.value}
        onChange={this.handleChange}
      />
    );
  }
}
```

A primera vista podría parece que este componente soluciona el problema del estado «destruido» en cada rerenderizado. Después de todo, si las props son las mismas, simplemente no hacemos la actualización —y por tanto no se llama a `componentWillReceiveProps`—.

Sin embargo, esto nos da una falsa sensación de seguridad. **Este componente aún no es resiliente a cambios _reales_ en las props.** Por ejemplo, si añadimos *otra* prop que cambie a menudo, como un `style` animado, aún «perderíamos» el estado interno:

```jsx{2}
<TextInput
  style={{opacity: someValueFromState}}
  value={
    // 🔴 componentWillReceiveProps en TextInput
    // reinicia el estado a este valor en cada tic de la animación.
    value
  }
/>
```

Esta vía todavía tiene defectos. Podemos ver que las optimizaciones como `PureComponent`, `shouldComponentUpdate` y `React.memo` no deberían usarse para controlar *comportamiento*. Solo úsalas para mejorar el *rendimiento* cuando sea necesario. Si el hecho de eliminar una optimización _rompe_ un componente, es que ya era demasiado frágil.

La solución en este caso es la misma que hemos descrito anteriormente. No trates «recibir props» como un evento especial. Evita sincronizar props y estado. En la mayoría de los casos, cada valor debería ser o bien completamente controlado (por props), o completamente no controlado (en estado local). Evita el estado derivado [siempre que puedas](https://es.reactjs.org/blog/2018/06/07/you-probably-dont-need-derived-state.html#preferred-solutions). **¡Y estate listo siempre para renderizar!**

---

## Principio 3: Ningún componente es un *singleton*

En ocasiones asumimos que un componente determinado solo se mostrará una vez: por ejemplo, una barra de navegación. Esto puede cumplirse por un tiempo. Sin embargo, hacer esa suposición a menudo causa problemas de diseño que solo salen a la luz más tarde.

Por ejemplo, quizá necesites implementar una animación *entre* dos componentes `Page` cuando cambia una ruta —la página anterior y la próxima página. Ambos componentes deben estar montados durante la animación. Sin embargo, en ese momento podrías descubrir que cada uno de esos componente asume que es el único `Page` en la pantalla.

Es fácil comprobar estos problemas. Solo por diversión, intenta renderizar tu aplicación dos veces:

```jsx{3,4}
ReactDOM.render(
  <>
    <MyApp />
    <MyApp />
  </>,
  document.getElementById('root')
);
```

Haz algunos clics. (Podrías necesitar cambiar algún CSS para este experimento).

**¿Tu aplicación aún funciona como era de esperar?** ¿O ves fallas y errores inesperados? Es una buena idea hacer pruebas de estrés en componentes complejos de vez en cuando, y asegurarnos que múltiples copias de estos no entren en conflicto entre sí.

Un ejemplo de un patrón problemático que yo mismo he escrito algunas veces es «limpiar» estado global en `componentWillUnmount`:

```jsx{2-3}
componentWillUnmount() {
  // Resetear algo en un store de Redux
  this.props.resetForm();
}
```

Por supuesto, si hay dos componentes de este tipo en la página, cuando se desmonta uno de ellos se podría romper al otro. Resetear estado «global» al *montar* no es mejor:

```jsx{2-3}
componentDidMount() {
  // Resetear algo en un store de Redux
  this.props.resetForm();
}
```

En ese caso el *montaje* de un segundo formulario romperá el primero.

Estos patrones son buenos indicadores de en dónde se encuentra la fragilidad de nuestros componentes. ***Mostrar* o *esconder* un árbol no debiera romper componentes fuera de ese árbol.**

Sin importar si planeas renderizar este componente dos veces o no, resolver estos problemas vale la pena a la larga. Te conduce a un diseño más resiliente.

---

## Principio 4: Mantén el estado local aislado

Considera un componente `Publicación` de una red social. Tiene una lista de hilos `Comentario` (que se pueden expandir) y un cuadro de texto `NuevoComentario`.

Los componentes de React pueden tener estado local. ¿Pero, qué estado es realmente local? ¿Es el contenido de la publicación estado local o no? ¿Y la lista de comentarios? ¿O el registro de qué hilos de comentarios se expanden? ¿O el valor del cuadro de texto de comentarios?

Si estás acostumbrado a ponerlo todo en un «manejador de estado», puede ser un desafío responder esta pregunta. Por tanto aquí muestro una forma sencilla de tomar la decisión.

**Si no tienes seguridad si algún estado es local, pregúntate: «¿Si este componente se renderizara dos veces, se debería reflejar esta interacción en la otra copia?» Cada vez que la respuesta es «no», has encontrado estado local.**

Por ejemplo, imagina que renderizamos la misma `Publicación` dos veces. Veamos diferentes elementos dentro de ella que pueden cambiar.

* *Contenido de la publicación.* Quisiéramos editar la publicación en un árbol para actualizarla en otro árbol. Por tanto probablemente *no debería* se el estado local del componente `Publicación`. (En su lugar, el contenido de la publicación podría vivir en alguna caché como Apollo, Relay, o Redux).

* *Lista de comentarios.* Esto es similar al contenido de la publicación. Quisiéramos que si se añade un nuevo comentario en un árbol que se refleje también en el otro árbol. Es por esto que idealmente usaríamos algún tipo de caché, y **no debería** ser un estado local de nuestra `Publicación`.

* *Qué comentarios están expandidos.* Sería extraño que al expandir un comentario en un árbol también se expandiera en otro árbol. En este caso estamos interactuando con una *representación particular de la UI* del `Comentario` y no una «entidad comentario» abstracta. Es por eso que un marcador de «expandido» **debería** ser estado local de `Comentario`.

* *El valor del cuadro de texto de un nuevo comentario.* Sería raro si al escribir un comentario en un cuadro de texto, también se fuera actualizando otro cuadro de texto en otro árbol. A menos que los cuadros de texto estén claramente agrupados, lo común es que sean independientes. Por tanto el valor del cuadro de texto **debería** ser estado local del componente `NuevoComentario`.

No estoy sugiriendo una interpretación dogmática de estas reglas. Por supuesto, en una aplicación más simple podrías usar estado local para todo, incluidas esas «cachés». Estoy hablando solamente sobre la experiencia de usuario ideal [a partir de los principios fundamentales](/the-elements-of-ui-engineering/).

**Evita convertir estado realmente local en estado global.** Esto entra en nuestro tema de «resiliencia»: hay menos sincronizaciones sorprendentes que puedan estar ocurriendo entre componentes. Como ventaja adicional, esto *también* resuelve numerosos tipos de problemas de rendimiento. «Renderizar de más» es un problema mucho menor cuando tu estado está en el lugar adecuado.

---

## Resumen

Recordemos estos principios una vez más:

1. **[No detengas el flujo de datos](#principle-1-dont-stop-the-data-flow)** Las props y el estado pueden cambiar, y los componentes debería manejar esos cambios siempre que ocurran.
2. **[Estate listo siempre para renderizar](#principle-2-always-be-ready-to-render)** Un componente no debería romperse porque se renderiza con más o menos frecuencia.
3. **[Ningún componente es un *singleton*](#principle-3-no-component-is-a-singleton)** Incluso si un componente se renderiza solo una vez, tu diseño mejorará si al renderizarlo dos veces no se rompe.
4. **[Mantén aislado el estado local](#principle-4-keep-the-local-state-isolated)** Piensa en qué estado es local a una representación de UI determinada —y no levantes el estado más alto de lo que sea necesario—.

**Estos principios te ayudan a escribir componentes que están [optimizados para el cambio](/optimized-for-change/). Es fácil añadirlos, cambiarlos y eliminarlos.**

Y lo más importante, una vez que nuestros componentes son resilientes, podemos volver al acuciante dilema de si la props deberían ordenarse alfabéticamente.
