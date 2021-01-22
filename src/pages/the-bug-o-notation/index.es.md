---
title: La notación “Bug-O”
date: '2019-01-25'
spoiler: ¿Cuál es la 🐞(<i>n</i>) de tu API?
---

Cuando escribes código prestando especial atención al rendimiento, es generalmente una buena idea tener en cuenta su complejidad algorítmica. A menudo la complejidad se expresa por medio de la [notación Big-O](https://rob-bell.net/2009/06/a-beginners-guide-to-big-o-notation/).

La notación Big-O mide **cuán lento será el código a medida que le añades más datos.**. Por ejemplo, si un algoritmo de ordenación tiene una complejidad de O(<i>n<sup>2</sup></i>), la incorporación de 50 veces más elementos a dicho algoritmo, supondrá que este sea 50<sup>2</sup> = 2,500 veces más lento. La Big-O no te proporciona un número exacto, pero sí ayuda a entender cómo *escala* un algoritmo.

Sirvan como ejemplo: O(<i>n</i>), O(<i>n</i> log <i>n</i>), O(<i>n<sup>2</sup></i>), O(<i>n!</i>).

Sin embargo, **este post no trata sobre algoritmos o rendimiento**. Se centra en APIs y depuración. Resulta que el diseño de una API implica consideraciones muy similares.

---

Dedicamos una parte importante de nuestro tiempo a encontrar y corregir errores del código. A la mayoría de los desarrolladores les encantaría encontrar errores más rápido. Por muy satisfactorio que sea al final, es una pena pasar todo el día persiguiendo un solo error cuando realmente podrías haber implementado una solución a tu plan de trabajo.

La experiencia que adquirimos corrigiendo errores influye en la elección de abstracciones, bibliotecas y herramientas. Algunas APIs y los diseños de los lenguajes hacen imposible cometer ciertas clases de errores. Otras por el contrario, provocan un sinfín de problemas. **Pero, ¿cómo puedes saber cuándo te encuentras en una situación o en otra?**

Muchas discusiones online sobre APIs versan principalmente sobre su estética. Lo cual, [no nos dice mucho](/optimized-for-change/) sobre lo que uno siente al utilizar una API.

**Tengo una métrica que me ayuda a pensar sobre esto. La llamo la notación *Bug-O*:**

<font size="40">🐞(<i>n</i>)</font>

La Big-O describe cuánto se ralentiza un algoritmo a medida que crecen los datos introducidos. La *Bug-O* describe cuánto te ralentiza una API a medida que crece tu base de código.

---

Por ejemplo, considera el siguiente código que actualiza manualmente el DOM a lo largo del tiempo, con operaciones imperativas como `node.appendChild()` y `node.removeChild()` sin una estructura clara:

```jsx
function trySubmit() {
  // Sección 1
  let spinner = createSpinner();
  formStatus.appendChild(spinner);
  submitForm().then(() => {
  	// Sección 2
    formStatus.removeChild(spinner);
    let successMessage = createSuccessMessage();
    formStatus.appendChild(successMessage);
  }).catch(error => {
  	// Sección 3
    formStatus.removeChild(spinner);
    let errorMessage = createErrorMessage(error);
    let retryButton = createRetryButton();
    formStatus.appendChild(errorMessage);
    formStatus.appendChild(retryButton)
    retryButton.addEventListener('click', function() {
      // Sección 4
      formStatus.removeChild(errorMessage);
      formStatus.removeChild(retryButton);
      trySubmit();
    });
  })
}
```

El problema con este código no es que sea "feo". No estamos hablando de estética. **El problema es que si hay un error en este código, no sé por dónde empezar a buscar**.

**Dependiendo del orden en que se activen las devoluciones de llamada (callbacks) y los eventos, existe una explosión combinatoria del número de rutas de código que este programa podría tomar.** En algunas de ellas, veré los mensajes correctos. En otras, veré ruletas (spinners), mensajes de error y errores, y posiblemente caídas de la aplicación.

La función citada anteriormente tiene 4 secciones diferentes y no hay garantías acerca de su ejecución. Mi cálculo (no científico) me dice que hay 4×3×2×1 = 24 operaciones diferentes que podrían ejecutarse. Si agrego cuatro segmentos de código más, serán 8×7×6×5×4×3×2×1 — *cuarenta mil* combinaciones. Buena suerte depurando eso.

**En otras palabras, la Bug-O de este enfoque es 🐞(<i>n!</i>)** donde *n* es el número de segmentos de código que tocan el DOM. Sí, eso es un *análisis factorial*. Por supuesto, no estoy siendo muy riguroso aquí. En la práctica, no todas las operaciones son posibles. Por otro lado, cada uno de estos segmentos puede ejecutarse más de una vez. La Bug-O <span style="word-break: keep-all">🐞(*¯\\\_(ツ)\_/¯*)</span> podría ser más precisa, pero aun así es bastante mala. Podemos hacerlo mejor.

---

Para mejorar la Bug-O de este código podemos limitar la cantidad de estados y resultados posibles. No necesitamos ninguna biblioteca para hacerlo. Es solo una cuestión de hacer cumplir alguna estructura en nuestro código. A continuación se muestra una manera:

```jsx
let currentState = {
  step: 'initial', // 'initial' | 'pending' | 'success' | 'error'
};

function trySubmit() {
  if (currentState.step === 'pending') {
    // No permitir enviar (submit) dos veces
    return;
  }
  setState({ step: 'pending' });
  submitForm().then(() => {
    setState({ step: 'success' });
  }).catch(error => {
    setState({ step: 'error', error });
  });
}

function setState(nextState) {
  // Borrar todos los hijos (children) existentes
  formStatus.innerHTML = '';

  currentState = nextState;
  switch (nextState.step) {
    case 'initial':
      break;
    case 'pending':
      formStatus.appendChild(spinner);
      break;
    case 'success':
      let successMessage = createSuccessMessage();
      formStatus.appendChild(successMessage);
      break;
    case 'error':
      let errorMessage = createErrorMessage(nextState.error);
      let retryButton = createRetryButton();
      formStatus.appendChild(errorMessage);
      formStatus.appendChild(retryButton);
      retryButton.addEventListener('click', trySubmit);
      break;
  }
}
```

Este código puede no parecer muy diferente. Es incluso un poco más detallado. Pero es *mucho más* sencillo de depurar debido a esta línea:

```jsx{3}
function setState(nextState) {
  // Borrar todos los hijos (children) existentes
  formStatus.innerHTML = '';

  // ... código que añade algo a formStatus ...
```

Al borrar el estado del formulario antes de realizar cualquier manipulación, nos aseguramos de que nuestras operaciones contra el DOM siempre comiencen desde cero. Así podemos combatir la inevitable [entropía](/the-elements-of-ui-engineering/) — al *evitar* que los errores se acumulen. Este es el equivalente en código a "apagar y encender de nuevo“, y funciona sorprendentemente bien.

**Si hay un error en la emisión, solo tenemos que pensar en *el paso previo* — la llamada `setState` anterior.** La Bug-O de depurar un resultado de renderización es 🐞(*n*) donde *n* es el número de rutas de renderización. En este caso, son solo cuatro (porque tenemos cuatro casos en el `switch`).

Es posible que aún tengamos condiciones de carrera para *establecer* el valor del state, pero depurar dichas condiciones es más sencillo porque cada estado intermedio se puede evaluar e inspeccionar. También podemos rechazar explícitamente cualquier operación no deseada:

```jsx
function trySubmit() {
  if (currentState.step === 'pending') {
    // No permitir enviar (submit) dos veces
    return;
  }
```

Por supuesto, recomponer el DOM viene con una contrapartida. Eliminar y volver a crear ingenuamente el DOM cada vez, destruiría su estado interno (internal state), se perdería el foco (focus) y causaría terribles problemas de rendimiento en aplicaciones grandes.

Es por eso que las bibliotecas como React pueden ser útiles. Te permiten *pensar* en el paradigma de recrear siempre la interfaz de usuario desde cero sin necesariamente hacerlo:

```jsx
function FormStatus() {
  let [state, setState] = useState({
    step: 'initial'
  });

  function handleSubmit(e) {
    e.preventDefault();
    if (state.step === 'pending') {
      // No permitir enviar (submit) dos veces
      return;
    }
    setState({ step: 'pending' });
    submitForm().then(() => {
      setState({ step: 'success' });
    }).catch(error => {
      setState({ step: 'error', error });
    });
  }

  let content;
  switch (state.step) {
    case 'pending':
      content = <Spinner />;
      break;
    case 'success':
      content = <SuccessMessage />;
      break;
    case 'error':
      content = (
        <>
          <ErrorMessage error={state.error} />
          <RetryButton onClick={handleSubmit} />
        </>
      );
      break;
  }

  return (
    <form onSubmit={handleSubmit}>
      {content}
    </form>
  );
}
```

El código puede parecer diferente, pero el principio es el mismo. La abstracción del componente impone límites para cerciorarse de que ningún *otro* código de la página pudiera modificar el DOM o el estado. La creación de componentes ayuda a reducir la Bug-O.

De hecho, si *algún* valor parece incorrecto en el DOM de una aplicación de React, puedes rastrear de dónde proviene, revisando el código de los componentes uno a uno, en el árbol de React. No importa el tamaño de la aplicación, el seguimiento de un valor renderizado es 🐞 (*altura del árbol*).

**La próxima vez que veas una discusión sobre una API, considera: ¿cuál es la 🐞(*n*) de tareas de depuración comunes en ella?** ¿Qué hay de las APIs (y sus principios existentes) con las que estás profundamente familiarizado? Redux, CSS, herencia, todos tienen su propia Bug-O.

---