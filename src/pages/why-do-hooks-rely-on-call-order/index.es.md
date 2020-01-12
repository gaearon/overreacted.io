---
title: ¿Por qué los Hooks de React dependen del orden de invocación?
date: '2018-12-13'
spoiler: Lecciones aprendidas de los mixins, props de renderizado, HOC y clases.
---

En React Conf 2018, el equipo de React presentó [la propuesta de Hooks](https://reactjs.org/docs/hooks-intro.html).

Si te gustaría saber qué son los Hooks y que problemas resuelven, revisa [nuestras charlas](https://www.youtube.com/watch?v=dpw9EHDh2bM) donde se introdujeron y [mi artículo posterior](https://medium.com/@dan_abramov/making-sense-of-react-hooks-fdbde8803889) donde se abordan frecuentes concepciones erróneas.

Lo más probable es que no te gusten los Hooks en un principio.

![Negative HN comment](./hooks-hn1.png)

> Mi instinto me dice que los Hooks no son la más grande adición a React. Algo que siempre he alabado de React es la API limpia y extremadamente explícita (siendo `dangerouslySetInnerHTML` mi ejemplo favorito). La API de los hooks toma el camino peligroso de lo implícito y la magia lo que para mí solo puede traducirse en cosas malas.

Son como un disco que gusta solo después de escucharlo varias veces:

![Positive HN comment from the same person four days later](./hooks-hn2.png)

> Después de filtrar esta API por los últimos 3 días y actualizarme con la RFC, he cambiado mi posición. Creí que no podía dejar este comentario así, porque ya no refleja mi posición. Creo que los hooks son maravillosos. Si el equipo de React logra concretar la API pienso que revolucionarán la forma en que trabajamos en React. Aún siento que subirán un poco la barrera de entrada, pero para un desarrollador experimentado de React son fantásticos.

Cuando leas la documentación, no te pierdas [la página más importante](https://reactjs.org/docs/hooks-custom.html) ¡acerca de construir tus propios Hooks! Demasiados se fijan solo en una parte de nuestro mensaje con la que no están de acuerdo (p. ej., que aprender clases es difícil) y pierden de vista el concepto más amplio detrás de los Hooks. Y este es que los **Hooks son como *mixins funcionales* que te permiten crear y componer tus propias abstracciones.**

Los Hooks [están influenciados por conocimiento previo](https://reactjs.org/docs/hooks-faq.html#what-is-the-prior-art-for-hooks), pero no he visto nada *exactamente* igual hasta que Sebastian compartió su idea con el equipo. Desgraciadamente, es fácil dejar pasar la conexión que existe entre las decisiones específicas sobre las API y las valiosas propiedades que abre este diseño. Con este artículo espero ayudar a más personas a entender la razón detrás del aspecto más controversial de la propuesta de los Hooks.

**El resto de este artículo asume que conoces la API Hook `useState()` y cómo escribir un Hook personalizado. Si no lo sabes, revisa los enlaces anteriores. Además, ten en mente que los Hooks son experimentales y no tienes que aprenderlos ahora mismo!**

(Nota aclaratoria: Este es un artículo a título personal y no refleja necesariamente las opiniones del equipo de React. Es largo, el tema es complejo y puede que haya cometido algunos errores en alguna parte).

---

El primero y probablemente el mayor impacto que recibes al aprender sobre los Hooks es que dependen de un *índice persistente de invocación entre invocaciones*. Esto tiene varias [implicaciones](https://reactjs.org/docs/hooks-rules.html).

La decisión claramente es controvertida. Por ello, [contra nuestros principios](https://www.reddit.com/r/reactjs/comments/9xs2r6/sebmarkbages_response_to_hooks_rfc_feedback/e9wh4um/), solo publicamos esta propuesta después que sentimos que la documentación y las charlas los describían suficientemente bien para que se le diera un oportunidad justa.

**Si estás preocupado con algún aspecto del diseño de la API de los Hooks, te animo a leer la [respuesta completa](https://github.com/reactjs/rfcs/pull/68#issuecomment-439314884) de Sebastian a los más de 1 000 comentarios en el debate de la RFC.** Es abarcador, pero también bastante denso. Probablemente podría convertir cada párrafo de ese comentario en un artículo independiente. (De hecho, ¡ya [lo hice](/how-does-setstate-know-what-to-do/) una vez!)

Hay una parte en específico en la que me gustaría enfocarme hoy. Como quizá recuerdes, cada Hook se puede usar en un componente más de una vez. Por ejemplo, podemos declarar [múltiples variables de estado](https://reactjs.org/docs/hooks-state.html#tip-using-multiple-state-variables) al invocar a `useState()` repetidamente:

```jsx{2,3,4}
function Form() {
  const [name, setName] = useState('Mary');              // Variable de estado 1
  const [surname, setSurname] = useState('Poppins');     // Variable de estado 2
  const [width, setWidth] = useState(window.innerWidth); // Variable de estado 3

  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  });

  function handleNameChange(e) {
    setName(e.target.value);
  }

  function handleSurnameChange(e) {
    setSurname(e.target.value);
  }

  return (
    <>
      <input value={name} onChange={handleNameChange} />
      <input value={surname} onChange={handleSurnameChange} />
      <p>Hello, {name} {surname}</p>
      <p>Window width: {width}</p>
    </>
  );
}
```

Fíjate que utilizamos la sintaxis de desestructuración de arreglos para nombrar las variables de estado de `useState()`, pero estos nombres no se le pasan a React. En su lugar, en este ejemplo, **React trata a `name` como «la primera variable de estado», a `surname` como «la segunda variable de estado», y así sucesivamente**. Su *índice de invocación* es lo que les da una identidad estable entre cada nuevo renderizado. Este modelo mental está bien descrito [en este artículo](https://medium.com/@ryardley/react-hooks-not-magic-just-arrays-cd4f1857236e).

A nivel superficial, depender del índice de invocación *no parece correcto*. Una intuición es una señal útil, pero puede estar errada; especialmente si no hemos comprendido del todo el problema que estamos resolviendo. **En este artículo, tomaré algunas alternativas de diseño para los Hooks sugeridas con frecuencia y mostraré cuando se derrumban.**

---

Este artículo no será exhaustivo. Dependiendo con cuánta granularidad cuentes, hemos visto desde una docena hasta *cientos* de propuestas alternativas. También nosotros hemos [pensado](https://github.com/reactjs/react-future) en API alternativas para componentes durante los últimos cinco años.

Artículos como este son complicados porque aun si se cubren cien alternativas, alguien puede parar y decir: «!Ah, no pensaste en *esa*!».

En la práctica, diferentes propuestas alternativas tienden a solaparse en sus desventajas. En lugar de enumerar *todas* las API sugeridas (lo que me tomaría meses), demostraré los defectos más comunes con ejemplos específicos. Categorizar otras API posibles de acuerdo a estos problemas podría ser un ejercicio para el lector. 🧐

*Eso no quiere decir que los Hooks no tengan defectos.* Pero una vez que te familiarizas con los de otras soluciones, puede que le empieces a hallar sentido al diseño de los Hooks.

---

### Defecto n.º 1: No permite extraer un Hook personalizado

Sorprendentemente, muchas propuestas alternativas no permiten en lo absoluto [Hooks personalizados](https://reactjs.org/docs/hooks-custom.html). Quizá no enfatizamos lo suficiente a los Hooks personalizados en la documentación de la «motivación». Es difícil hacerlo hasta que las primitivas se comprenden bien, por lo que es el problema del huevo y la gallina. Pero los Hooks personalizados son por mucho el punto de toda la propuesta.

Por ejemplo, una alternativa prohibía múltiples invocaciones a `useState()` en un componente. Tendrías que mantener el estado en un objeto, ¿funciona para las clases, no?

```jsx
function Form() {
  const [state, setState] = useState({
    name: 'Mary',
    surname: 'Poppins',
    width: window.innerWidth,
  });
  // ...
}
```

Seamos claros, los Hooks *sí* permiten este estilo. No *tienes que* dividir tu estado en varias variables de estado (mira nuestras [recomendaciones](https://reactjs.org/docs/hooks-faq.html#should-i-use-one-or-many-state-variables) en las preguntas frecuentes).

Pero el punto de permitir múltiples invocaciones a `useState()` es que puedas *extraer* partes de lógica con estado (estado + efectos) de tu componente en Hooks personalizados que pueden *también* usar independientemente estado local y efectos.

```jsx{6-7}
function Form() {
  // Se declaran algunas variables de estado directamente en el cuerpo del componente
  const [name, setName] = useState('Mary');
  const [surname, setSurname] = useState('Poppins');

  // Movemos algo de estado y efectos hacia un Hook personalizado
  const width = useWindowWidth();
  // ...
}

function useWindowWidth() {
  // Se declara algo de estado y efecto en un Hook personalizado
  const [width, setWidth] = useState(window.innerWidth);
  useEffect(() => {
    // ...
  });
  return width;
}
```

Si solo permites una invocación a `useState()` por componente, pierdes la habilidad de los Hooks personalizados para introducir estado local, que es básicamente el punto de los Hooks personalizados.

### Defecto n.º 2: Conflictos de nombre

Otra sugerencia común es permitir a `useState()` que acepte como argumento una llave (p. ej. una cadena) que identifique de manera única una variable de estado en particular dentro de un componente.

Hay algunas variaciones de esta idea, pero todas lucen aproximadamente como esta:

```jsx
// ⚠️ Esta NO es la API de los Hooks de React
function Form() {
  // Pasamos algún tipo de llave de estado a useState()
  const [name, setName] = useState('name');
  const [surname, setSurname] = useState('surname');
  const [width, setWidth] = useState('width');
  // ...
```

Esto intenta evitar la dependencia en el índice de invocación (¡sí, llaves explícitas!), pero introduce otro problema: Conflictos de nombre.

De acuerdo, probablemente no te verás tentado a invocar `useState('name')` dos veces en el mismo componente a no ser por error. Puede ocurrir accidentalmente, pero podríamos decir eso de cualquier error. Sin embargo, es bastante probable que cuando trabajes en un *Hook personalizado* querrás añadir o eliminar variables de estado y efectos.

Con esta propuesta, cada vez que añades una variable de estado dentro de un Hook personalizado, te arriesgas a quebrar cualquier componente que lo use (directa o transitivamente), porque *podrían estar usando el mismo nombre* para sus propias variables de estado.

Este es un ejemplo de una API que no está [optimizada para el cambio](/optimized-for-change/). El código actual puede que luzca siempre «elegante», pero es muy frágil en cuanto a cambios en los requerimientos se refiere. Debemos [aprender](https://reactjs.org/blog/2016/07/13/mixins-considered-harmful.html#mixins-cause-name-clashes) de nuestros errores.

La propuesta real de los Hooks resuelve esto al depender en el orden de invocación: aún si dos Hooks usan una variable de estado `name` estarían aislados entre sí. Cada invocación a `useState()` obtiene su propia «celda de memoria».

Aún hay otras formas de resolver este defecto, pero siempre tienen sus propios inconvenientes. Exploremos este espacio problemático más detenidamente.

### Defecto n.º 3: No se puede invocar dos veces al mismo Hook

Otra variación de la propuesta «con llave» de `useState` es usar algo como `Symbol`. ¿Los símbolos no pueden colisionar, no?

```jsx
// ⚠️ Esta NO es la API de los Hooks de React
const nameKey = Symbol();
const surnameKey = Symbol();
const widthKey = Symbol();

function Form() {
  // Pasamos algún tipo de llave de estado a useState()
  const [name, setName] = useState(nameKey);
  const [surname, setSurname] = useState(surnameKey);
  const [width, setWidth] = useState(widthKey);
  // ...
```

Esta propuesta parece funcionar para extraer el Hook `useWindowWidth()`:

```jsx{4,11-17}
// ⚠️ Esta NO es la API de los Hooks de React
function Form() {
  // ...
  const width = useWindowWidth();
  // ...
}

/*********************
 * useWindowWidth.js *
 ********************/
const widthKey = Symbol();
 
function useWindowWidth() {
  const [width, setWidth] = useState(widthKey);
  // ...
  return width;
}
```

Pero fallaría si intentamos extraer el manejo de los campos de entrada:

```jsx{4,5,19-29}
// ⚠️ Esta NO es la API de los Hooks de React
function Form() {
  // ...
  const name = useFormInput();
  const surname = useFormInput();
  // ...
  return (
    <>
      <input {...name} />
      <input {...surname} />
      {/* ... */}
    </>
  )
}

/*******************
 * useFormInput.js *
 ******************/
const valueKey = Symbol();
 
function useFormInput() {
  const [value, setValue] = useState(valueKey);
  return {
    value,
    onChange(e) {
      setValue(e.target.value);
    },
  };
}
```

(Admito que este Hook `useFormInput()` no es particularmente útil, pero podrías imaginarlo para el manejo de la validación y del cambio de los monitores de estado de manera similar a [Formik](https://github.com/jaredpalmer/formik)).

Detectas el error?

Estamos invocando `useFormInput()` dos veces pero `useFormInput()` siempre invoca a `useState()` con la misma llave. Por tanto estamos haciendo efectivamente algo como esto:

```jsx
  const [name, setName] = useState(valueKey);
  const [surname, setSurname] = useState(valueKey);
```

Y así es como obtenemos de nuevo una colisión.

La propuesta real de los Hooks no tienen este problema porque **cada _invocación_ a `useState()` obtiene su propio estado aislado.** Depender de un índice de invocación persistente nos libera de la preocupación de las colisiones de nombre.

### Defecto n.º 4: El problema del diamante

Técnicamente este es el mismo defecto que el anterior, pero vale la pena mencionarlo por su notoriedad. Incluso [se describe en Wikipedia](https://es.wikipedia.org/wiki/Problema_del_diamante). (Aparentemente, a veces se le llama «el letal diamante de la muerte», ¡genial!).

Lo [sufrimos en carne propia](https://reactjs.org/blog/2016/07/13/mixins-considered-harmful.html#mixins-cause-name-clashes) con nuestro sistema de mixins.

Dos Hooks personalizados como `useWindowWidth()` y `useNetworkStatus()` podrían querer usar internamente un mismo Hook personalizado como `useSubscription()`:

```jsx{12,23-27,32-42}
function StatusMessage() {
  const width = useWindowWidth();
  const isOnline = useNetworkStatus();
  return (
    <>
      <p>Window width is {width}</p>
      <p>You are {isOnline ? 'online' : 'offline'}</p>
    </>
  );
}

function useSubscription(subscribe, unsubscribe, getValue) {
  const [state, setState] = useState(getValue());
  useEffect(() => {
    const handleChange = () => setState(getValue());
    subscribe(handleChange);
    return () => unsubscribe(handleChange);
  });
  return state;
}

function useWindowWidth() {
  const width = useSubscription(
    handler => window.addEventListener('resize', handler),
    handler => window.removeEventListener('resize', handler),
    () => window.innerWidth
  );
  return width;
}

function useNetworkStatus() {
  const isOnline = useSubscription(
    handler => {
      window.addEventListener('online', handler);
      window.addEventListener('offline', handler);
    },
    handler => {
      window.removeEventListener('online', handler);
      window.removeEventListener('offline', handler);
    },
    () => navigator.onLine
  );
  return isOnline;
}
```

Este es un caso completamente válido. **Debería ser seguro para el autor de un Hook personalizado comenzar o parar de usar otro Hook personalizado sin preocuparse por si «ya está siendo usado» en algún lugar de la cadena.** De hecho, *no puedes conocer* la cadena completa a menos que audites en cada cambio cada componente que usa tu Hook.

(Como contraejemplo, el mixin heredado `createClass()` no te permitía hacer esto. A veces acabarías con dos mixins que hacían exactamente lo que necesitabas pero eran mutualmente incompatibles pues heredaban del mismo mixin «base»).

Este es nuestro «diamante»:  💎

```
       / useWindowWidth()   \                   / useState()  🔴 Colisión
Status                        useSubscription() 
       \ useNetworkStatus() /                   \ useEffect() 🔴 Colisión
```

La dependencia en el orden de invocación persistente naturalmente lo resuelve:

```
                                                 / useState()  ✅ #1. Estado
       / useWindowWidth()   -> useSubscription()                    
      /                                          \ useEffect() ✅ #2. Efecto
Status                         
      \                                          / useState()  ✅ #3. Estado
       \ useNetworkStatus() -> useSubscription()
                                                 \ useEffect() ✅ #4. Efecto
```

Las invocaciones a funciones no tienen un problema de «diamante» porque forman un árbol. 🎄

### Defecto n.º 5: Copiar y pegar quiebra las cosas

Quizá podríamos salvar la propuesta del estado con llave al introducir algún tipo de espacio de nombre. Hay varias formas diferentes de hacerlo.

Una forma sería aislar las llaves de estado con clausuras. Ello requeriría que «instanciaras» los Hooks personalizados y añadieras una función envoltorio a cada uno de ellos.

```jsx{5,6}
/*******************
 * useFormInput.js *
 ******************/
function createUseFormInput() {
  // Única por instanciación
  const valueKey = Symbol();  

  return function useFormInput() {
    const [value, setValue] = useState(valueKey);
    return {
      value,
      onChange(e) {
        setValue(e.target.value);
      },
    };
  }
}
```

Este enfoque fuerza demasiado las cosas. Uno de los objetivos de diseño de los Hooks es evitar el estilo funcional profundamente anidado que prevalece en los componentes de orden superior y las props de renderizado. En este caso tenemos que «instanciar» *cualquier* Hook personalizado antes de usarlo y utilizar la función resultante *exactamente una vez* en el cuerpo de un componente. Esto no es mucho más simple que invocar a los Hooks incondicionalmente.

Adicionalmente, tienes que repetir dos veces cada Hook personalizado usado en un componente. Una vez en el ámbito del nivel superior (o dentro del ámbito de una función si estuviéramos escribiendo un Hook personalizado) y otra en el lugar de la invocación. Eso se traduce en tener que saltar entre las declaraciones del renderizado y las del nivel superior incluso para cambios pequeños:

```jsx{2,3,7,8}
// ⚠️ Esta NO es la API de los Hooks de React
const useNameFormInput = createUseFormInput();
const useSurnameFormInput = createUseFormInput();

function Form() {
  // ...
  const name = useNameFormInput();
  const surname = useNameFormInput();
  // ...
}
```

Además necesitas ser muy preciso con sus nombres. Siempre tendrías «dos niveles» de nombres: los «constructores» como `createUseFormInput` y los Hooks instanciados como `useNameFormInput` y `useSurnameFormInput`.

Si invocas a las «instancia» del Hook personalizado dos veces tienes como resultado una colisión. De hecho, el código anterior tiene ese error; lo notaste? Debería ser:

```jsx
  const name = useNameFormInput();
  const surname = useSurnameFormInput(); // No es useNameFormInput!
```

Estos no son problemas insalvables, pero para mí añaden *más* fricción que seguir las [Reglas de los Hooks](https://reactjs.org/docs/hooks-rules.html).

También es importante que rompen con las expectativas de «copiar y pegar». Extraer un Hook personalizado sin un envoltorio de clausura extra *aún funciona* con esta forma, pero solo hasta que se invoque dos veces (y ahí es que crea el conflicto). Es desafortunado que una API parezca funcionar, pero luego te fuerce a Envolverlo Todo™️ una vez que te das cuenta que hay un conflicto en algún lugar en lo profundo de la cadena.

### Defecto n.º 6: Aún necesitamos un *lint*

Hay otra forma de evitar conflictos con el estado con llaves. Si lo sabes, probablemente ya estabas molesto, ¡porque aún no lo admitía! Lo siento.

La idea es que podríamos *conformar* llaves cada vez que escribimos un Hook personalizado. Algo como esto:

```jsx{4,5,16,17}
// ⚠️ Esta NO es la API de los Hooks de React
function Form() {
  // ...
  const name = useFormInput('name');
  const surname = useFormInput('surname');
  // ...
  return (
    <>
      <input {...name} />
      <input {...surname} />
      {/* ... */}
    </>    
  )
}

function useFormInput(formInputKey) {
  const [value, setValue] = useState('useFormInput(' + formInputKey + ').value');
  return {
    value,
    onChange(e) {
      setValue(e.target.value);
    },
  };
}
```

De todas las distintas alternativas, esta es la que menos me desagrada. Sin embargo, no creo que valga la pena.

El código que pase llaves no únicas o mal compuestas podría *funcionar accidentalmente* hasta que un Hook fuese invocado en múltiples ocasiones o colisionara con otro Hook. O peor aún, si fuese condicional (estamos intentando «arreglar» el requerimiento de invocación incondicional, ¿cierto?) podría que no encontraramos siquiera las colisiones hasta tiempo después.

Recordar pasar llaves por todas las capas de Hooks personalizados parece lo suficientemente frágil para que quisiéramos comprobarlo con un *lint*. Añadirían trabajo extra en tiempo de ejecución (no se debe olvidar que necesitarían funcionar *como llaves*) y cada uno de ellos añade al tamaño del compilado final. **Pero si de todas formas tenemos que usar un *lint*, ¿qué problema resolvimos?**

Podría tener sentido si declarar condicionalmente estado y efectos fuera altamente deseable. Pero en la práctica lo encuentro confuso. De hecho, no recuerdo a nadie pedir nunca definir condicionalmente `this.state` o `componentDidMount`.

¿Qué significa este código exactamente?

```jsx{3,4}
// ⚠️ Esta NO es la API de los Hooks de React
function Counter(props) {
  if (props.isActive) {
    const [count, setCount] = useState('count');
    return (
      <p onClick={() => setCount(count + 1)}>
        {count}
      </p>;
    );
  }
  return null;
}
```

Se preserva `count` cuando `props.isActive` es `false`? O se reinicia porque `useState('count')` no se invocó?

Si se preserva el estado condicional, ¿qué ocurre con un efecto?

```jsx{5-8}
// ⚠️ Esta NO es la API de los Hooks de React
function Counter(props) {
  if (props.isActive) {
    const [count, setCount] = useState('count');
    useEffect(() => {
      const id = setInterval(() => setCount(c => c + 1), 1000);
      return () => clearInterval(id);
    }, []);
    return (
      <p onClick={() => setCount(count + 1)}>
        {count}
      </p>;
    );
  }
  return null;
}
```

Definitivamente no puede ejecutarse *antes* de que `props.isActive` sea `true` por primera vez. Pero una vez que se vuelve `true`, ¿para alguna vez de ejecutarse? ¿Se reinicia el intervalo cuando cambia `props.isActive` a `false`? Si lo hace, confunde el hecho de que el efecto se comporte de manera diferente al estado (que dijimos no se iba a reiniciar). Si el efecto continúa ejecutándose, confunde que el `if` fuera del efecto no lo haga en realidad condicional. ¿No dijimos que queríamos efectos condicionales?

Si el estado *sí* se reinicia cuando no lo «usamos» durante un renderizado, ¿qué ocurre si múltiples ramas `if` contienen `useState('count')`, pero solo una se ejecuta en un momento dado? ¿Es un código válido? Si nuestro modelo mental es un «mapa con llaves», ¿por qué «desaparecen» de él los elementos? ¿Esperaría el desarrollador un `return` anticipado de un componente para reiniciar todo el estado después de él? Si de verdad quisiéramos reiniciar el estado, podríamos hacerlo explícitamente al extraer un componente:

```jsx
function Counter(props) {
  if (props.isActive) {
    // Claramente tiene su propio estado
    return <TickingCounter />;
  }
  return null;
}
```

Esa probablemente se convertiría de todas formas en una «buena práctica» para evitar estas preguntas confusas. Por lo que de cualquier forma que elijas para responderlas creo que la semántica de *declarar* condicionalmente el estado y los efectos termina siendo tan extraña que podríamos querer usar un *lint* para prevenirla.

Si de todas formas tenemos que usar un *lint*, el requerimiento de componer llaves correctamente se convierte en una *carga innecesaria.* No nos trae nada que realmente *querramos* hacer. Sin embargo, eliminar ese requerimiento (y volver a la propuesta original) *sí* nos reporta un beneficio. Provoca que copiar y pegar código de un componente en un Hook personalizado sea seguro sin utilizar espacios de nombres, reduce las adiciones al tamaño del compilado provocadas por las llaves y permite una implementación un poco más eficiente (no hay necesidad de búsquedas en un diccionario).

Las pequeñas cosas van sumando.

### Defecto n.º 7: No se pueden pasar valores entre los Hooks

Una de las mejores características de los Hooks es que permiten pasar valores entre ellos.

Aquí hay un ejemplo hipotético de un selector del destinatario de un mensaje que muestra si el amigo escogido actualmente está en línea:

```jsx{8,9}
const friendList = [
  { id: 1, name: 'Phoebe' },
  { id: 2, name: 'Rachel' },
  { id: 3, name: 'Ross' },
];

function ChatRecipientPicker() {
  const [recipientID, setRecipientID] = useState(1);
  const isRecipientOnline = useFriendStatus(recipientID);

  return (
    <>
      <Circle color={isRecipientOnline ? 'green' : 'red'} />
      <select
        value={recipientID}
        onChange={e => setRecipientID(Number(e.target.value))}
      >
        {friendList.map(friend => (
          <option key={friend.id} value={friend.id}>
            {friend.name}
          </option>
        ))}
      </select>
    </>
  );
}

function useFriendStatus(friendID) {
  const [isOnline, setIsOnline] = useState(null);
  const handleStatusChange = (status) => setIsOnline(status.isOnline);
  useEffect(() => {
    ChatAPI.subscribeToFriendStatus(friendID, handleStatusChange);
    return () => {
      ChatAPI.unsubscribeFromFriendStatus(friendID, handleStatusChange);
    };
  });
  return isOnline;
}
```

Cuando cambias el destinatario, nuestro Hook `useFriendStatus()` eliminaría su suscripción del estado del amigo anterior, y se suscribiría al próximo.

Esto funciona porque podemos pasar el valor de retorno del Hook `useState()` al Hook `useFriendStatus()`:

```jsx{2}
  const [recipientID, setRecipientID] = useState(1);
  const isRecipientOnline = useFriendStatus(recipientID);
```

Pasar valores entre Hooks es muy poderoso. Por ejemplo, [React Spring](https://medium.com/@drcmda/hooks-in-react-spring-a-tutorial-c6c436ad7ee4) te permite crear una animación de un rastro de varios valores «siguiéndose» entre ellos:

```jsx
  const [{ pos1 }, set] = useSpring({ pos1: [0, 0], config: fast });
  const [{ pos2 }] = useSpring({ pos2: pos1, config: slow });
  const [{ pos3 }] = useSpring({ pos3: pos2, config: slow });
```

(Aquí hay un [demo](https://codesandbox.io/s/ppxnl191zx)).

Las propuestas que ponen la inicialización de los Hooks en valores por defecto en argumentos o que escriben Hooks como decoradores hacen difícil expresar este tipo de lógica.

Si la invocación a los Hooks no ocurre en el cuerpo de la función dejará de ser fácil pasar valores entre ellos, transformar esos valores sin crear muchas capas de componentes, o añadir `useMemo()` para memorizar un cálculo intermedio. Tampoco puedes referenciar fácilmente estos valores en efectos, porque no los pueden capturar en clausuras. Hay formas de superar estos problemas con algunas convenciones, pero requieren que mentalmente «hagas coincidir» entradas y salidas. Esto es complicado y viola el estilo de otra manera directo de React.

Pasar valores entre los Hooks es parte de la base de nuestra propuesta. El patrón de props de renderizado era lo más cercano que se podía obtener sin los Hooks, pero no se podían obtener todos los beneficios sin algo como [*Component Component*](https://ui.reach.tech/component-component) que tiene mucho ruido sintáctico debido a una «falsa jerarquía». Los Hooks eliminan esa jerarquía pasando valores, y las invocaciones a función son la forma más sencilla de hacerlo.

### Defecto n.º 8: Demasiada ceremonia

Hay muchas propuestas que se incluyen en esta categoría. La mayoría intentan evitar la percibida dependencia de React que tienen los Hooks. Hay varias formas de conseguirlo: hacer que los Hooks incorporados por defecto estén disponibles en `this`, convertirlos en un argumento extra que hay que pasarle a todo y así sucesivamente.

Creo que [la respuesta de Sebastian](https://github.com/reactjs/rfcs/pull/68#issuecomment-439314884) aborda esta forma mejor de lo que yo puedo describir, por lo que te animo a leer su primera sección (*«Injection Model»*).

Solo diré que hay una razón por la que los programadores tienden a preferir `try` / `catch` para manejar errores en lugar de pasar códigos de error a través de cada función. Es la misma razón por la que preferimos los módulos ES con `import` (o el `require` de CommonJS) a las definiciones explícitas de AMD donde se nos pasa `require`.

```jsx
// ¿Alguien extraña AMD?
define(['require', 'dependency1', 'dependency2'], function (require) {
  var dependency1 = require('dependency1'),
  var dependency2 = require('dependency2');
  return function () {};
});
```

Sí, puede que AMD sea más «honesto» en el hecho de que los módulos no son cargados en realidad sincrónicamente en el ambiente de un navegador. Pero una vez que sabes eso, tener que escribir todo lo que conlleva `define` se convierte en un sinsentido.

`try` / `catch`, `require` y la API de Contexto de React son ejemplos pragmáticos de cómo queremos tener un manejador «ambiental» disponible en lugar de moverlo explícitamente por cada nivel; incluso si de manera general valoramos lo explícito. Creo que vale igual para los Hooks.

Es similar a como, cuando definimos componentes, simplemente tomamos `Component` de `React`. Quizá nuestro código estaría más desacoplado de React si exportáramos una función constructora para cada componente.

```jsx
function createModal(React) {
  return class Modal extends React.Component {
    // ...
  };
}
```

Pero en la práctica termina siendo solo una indirección molesta. Cuando en realidad queramos simular React con algo más, siempre podemos hacerlo en el nivel del sistema de módulos.

Lo mismo se puede aplicar a los Hooks. Aún más, como menciona la [respuesta de Sebastian](https://github.com/reactjs/rfcs/pull/68#issuecomment-439314884), es *técnicamente posible* «redireccionar» los Hooks exportados por `react` a una implementación diferente. ([Uno de mis artículos anteriores](/how-does-setstate-know-what-to-do/) menciona cómo).

Otra forma de imponer más ceremonia es hacer a los Hooks [monádicos](https://paulgray.net/an-alternative-design-for-hooks/) o añadir un concepto de primera clase como `React.createHook()`. Aparte del costo adicional en tiempo de ejecución, cualquier solución que añade envoltorios pierde uno de los grandes beneficios de usar funciones comunes: *Son muy fáciles de depurar*.

Las funciones comunes te permiten ir y venir con un depurador, sin que interfiera ningún código externo de alguna biblioteca y ver exactamente cómo fluyen los valores dentro del cuerpo de tu componente. Las indirecciones dificultan este proceso. Soluciones que son similares en espíritu ya sea a los componentes de orden superior (Hooks «decoradores») o a las props de renderizado (p. ej. la propuesta `adopt` o usar `yield` desde generadores) padecen el mismo problema. Las indirecciones además complican el uso de tipos estáticos.

---

Como mencioné anteriormente, este artículo no intenta ser exhaustivo. Hay otros problemas interesantes con propuestas diferentes. Algunos son más oscuros (p. ej. relacionados con la concurrencia o técnicas avanzadas de compilación) y puede ser el tema para otro artículo en el futuro.

Los Hooks tampoco son perfectos, pero es el mejor punto medio que pudimos encontrar para resolver estos problemas. Hay asuntos que [todavía tenemos que resolver](https://github.com/reactjs/rfcs/pull/68#issuecomment-440780509) y existen elementos que son más incómodos de lograr que con clases. Ese es también tema para otro artículo.

Ya sea si cubrí tu propuesta alternativa favorita o no, espero que este escrito haya ayudado a arrojar algo de luz en nuestro proceso de pensamiento y en los criterios que consideramos al escoger una API. Como puedes ver, mucho de ello (como asegurarse que copiar y pegar, mover código, añadir y eliminar dependencias funcionaran previsiblemente) tiene que ver con [optimizar para el cambio](/optimized-for-change/). Espero que los usuarios de React apreciarán estos aspectos.
