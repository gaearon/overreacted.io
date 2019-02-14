---
title: ¿Por qué x no es un Hook?
date: '2019-01-26'
spoiler: Solo porque podemos, no significa que debamos hacerlo.
---

Desde la primera versión alfa de los [Hooks](https://reactjs.org/hooks) hay una pregunta recurrente en los debates: «¿Por qué *\<tal API\>* no es un Hook?»

A modo de recordatorio, les muestro algunas que *sí son* Hooks:

* [`useState()`](https://reactjs.org/docs/hooks-reference.html#usestate) permite declarar una variable de estado.
* [`useEffect()`](https://reactjs.org/docs/hooks-reference.html#useeffect) permite declarar un efecto secundario.
* [`useContext()`](https://reactjs.org/docs/hooks-reference.html#usecontext) permite acceder a un contexto.

Pero existen otras API, como `React.memo()` y `<Context.Provider>`, que *no* son Hooks. Versiones con Hooks de estas comúnmente propuestas serían *no composicionales* o *antimodulares*. Este artículo te ayudará a comprender por qué.

**Nota: Este artículo es una inmersión para aquellos interesados en analizar las API. ¡No necesitas pensar en nada de esto para ser productivo con React!**

---

Hay dos propiedades importantes que queremos que se preserven en las API de React:

1. **Composición:** Los [Hooks personalizados](https://reactjs.org/docs/hooks-custom.html) son la razón principal por la que estamos tan entusiasmados con la API de los Hooks. Esperamos que las personas construyan sus propios Hooks con mucha frecuencia, y por ello necesitamos que los Hooks escritos por personas distintas [no entren en conflicto](/why-do-hooks-rely-on-call-order/#flaw-4-the-diamond-problem). (¿No estamos todos ya malcriados por la manera tan limpia en que se pueden componer los componentes sin antes romperse entre sí?)

2. **Depuración:** Queremos que los errores sean [fáciles de encontrar](/the-bug-o-notation/) a medida que la aplicación crece. Una de las mejores funcionalidades de React es que si ves algo renderizado de manera incorrecta, puedes recorrer el árbol hacia arriba hasta que encuentres qué prop o estado de componente causó el error.

Estas dos restricciones juntas nos pueden decir qué puede o *no puede* ser un Hook. Probemos algunos ejemplos.

---

##  Un Hook real: `useState()`

### Composición

Múltiples Hooks personalizados invocando cada uno a `useState()` no entran en conflicto:

```jsx
function useMyCustomHook1() {
  const [value, setValue] = useState(0);
  // Lo que pasa aquí, aquí se queda.
}

function useMyCustomHook2() {
  const [value, setValue] = useState(0);
  // Lo que pasa aquí, aquí se queda.
}

function MyComponent() {
  useMyCustomHook1();
  useMyCustomHook2();
  // ...
}
```

Añadir una nueva invocación incondicional a `useState()` es siempre segura. No necesitas saber nada acerca de otros Hooks usados por un componente para declarar una nueva variable de estado. Tampoco puedes romper otras variables de estado al actualizar una de ellas.

**Verdicto:** ✅ `useState()` no hacen frágiles a los Hooks personalizados.

### Depuración

Los Hooks son útiles porque puedes pasar valores *entre* ellos:

```jsx{4,12,14}
function useWindowWidth() {
  const [width, setWidth] = useState(window.innerWidth);
  // ...
  return width;
}

function useTheme(isMobile) {
  // ...
}

function Comment() {
  const width = useWindowWidth();
  const isMobile = width < MOBILE_VIEWPORT;
  const theme = useTheme(isMobile);
  return (
    <section className={theme.comment}>
      {/* ... */}
    </section>
  );
}
```

¿Pero qué ocurre si cometemos un error? ¿Cómo funciona la depuración?

Digamos que la clase CSS que obtenemos de `theme.comment` está mal. ¿Cómo depuramos esto? Podemos establecer un punto de quiebre o algunos *logs* en el cuerpo de nuestro componente.

Quizá notaríamos que `theme` está mal pero `width` e `isMobile` están correctos. Esto nos indicaría que el problema está dentro de `useTheme()`. O quizá veríamos que `width` en sí está incorrecto. Esto nos indicaría que debiéramos mirar dentro de `useWindowWidth()`.

** Una sola mirada a los valores intermedios nos dice cuál de los Hooks en el nivel superior contiene el error.** No necesitamos mirar a *todas* sus implementaciones.

Luego podemos «aproximarnos» al que tiene el error, y repetir.

Esto adquiere mayor importancia si la profundidad del anidamiento del Hook personalizado se incrementa. Imagina que tenemos 3 niveles de anidamiento, cada nivel usando 3 Hooks personalizados dentro. La [diferencia](/the-bug-o-notation/) entre buscar un error en **3 lugares** contra potencialmente buscar **3 + 3×3 + 3×3×3 = 39 lugares** es enorme. Por suerte `useState()` no puede mágicamente «influenciar» a otros Hooks o componentes. Un valor con errores devuelto por él deja un rastro detrás, justo como cualquier variable. 🐛

**Veredicto:** ✅ `useState()` no oscurece la relación causa-efecto en nuestro código. Podemos seguir el rastro directamente al error.

---

## No es un Hook: `useBailout()`

Como una optimización, los componentes que usan Hooks pueden librarse (en inglés *bail out*) de volver a ser renderizados.

Una forma de hacerlo es cubrir todo el componente con[`React.memo()`](https://reactjs.org/blog/2018/10/23/react-v-16-6.html#reactmemo). Se libra de volver a renderizar si las props son superficialmente iguales a lo que se tenía durante el último renderizado. Esto lo hace similar a `PureComponent` en clases.

`React.memo()` toma un componente y devuelve un componente:

```jsx{4}
function Button(props) {
  // ...
}
export default React.memo(Button);
```

**Pero por qué no es un Hook?**

Ya sea si lo llamas `useShouldComponentUpdate()`, `useBailout()`, `usePure()`, o `useShouldComponentUpdate()`, la propuesta suele parecerse a algo como esto:

```jsx
function Button({ color }) {
  // ⚠️ No es una API real
  useBailout(prevColor => prevColor !== color, color);

  return (
    <button className={'button-' + color}>  
      OK
    </button>
  )
}
```

Hay algunas otras variaciones (por ejemplo un simple marcador `usePure()`) pero a grandes rasgos tienen las mismas fallas.

### Composición

Digamos que intentamos poner `useBailout()` en dos Hooks personalizados:

```jsx{4,5,19,20}
function useFriendStatus(friendID) {
  const [isOnline, setIsOnline] = useState(null);

  // ⚠️ No es una API real
  useBailout(prevIsOnline => prevIsOnline !== isOnline, isOnline);

  useEffect(() => {
    const handleStatusChange = status => setIsOnline(status.isOnline);
    ChatAPI.subscribe(friendID, handleStatusChange);
    return () => ChatAPI.unsubscribe(friendID, handleStatusChange);
  });

  return isOnline;
}

function useWindowWidth() {
  const [width, setWidth] = useState(window.innerWidth);
  
  // ⚠️ No es una API real
  useBailout(prevWidth => prevWidth !== width, width);

  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  });

  return width;
}
```

¿Qué ocurre ahora si usas ambos en el mismo componente?


```jsx{2,3}
function ChatThread({ friendID, isTyping }) {
  const width = useWindowWidth();
  const isOnline = useFriendStatus(friendID);
  return (
    <ChatLayout width={width}>
      <FriendStatus isOnline={isOnline} />
      {isTyping && 'Typing...'}
    </ChatLayout>
  );
}
```

¿Cuándo se vuelve a renderizar?

Si cada llamada a `useBailout()` tiene el poder de detener una actualización, entonces las actualizaciones de `useWindowWidth()` serían bloqueadas por `useFriendStatus()`, y viceversa. **Estos Hooks se romperían entre sí.**

Sin embargo, si `useBailout()` se respetara cuando *todas* las llamadas a él dentro de un solo componente *estén de acuerdo* en bloquear una actualización, nuestro `ChatThread` no sería capaz de responder con una actualización a los cambios de la prop `isTyping`.

Aún peor, con estas semánticas **cualquier Hook que se añada a `ChatThread` se rompería si no llaman *también* a `useBailout()`**. De otra forma, no pueden «votar en contra» de librar de la actualización dentro de `useWindowWidth()` y `useFriendStatus()`.

**Verdicto:** 🔴 `useBailout()` rompe la composición. Añadirlo a un Hook rompe las actualizaciones de estado en otros Hooks. Queremos que las API sean [antifrágiles](/optimized-for-change/), y este comportamiento es prácticamente lo opuesto.

### Depuración

¿Cómo un Hook como `useBailout()` afecta a la depuración?

Utilizaremos el mismo ejemplo:

```jsx
function ChatThread({ friendID, isTyping }) {
  const width = useWindowWidth();
  const isOnline = useFriendStatus(friendID);
  return (
    <ChatLayout width={width}>
      <FriendStatus isOnline={isOnline} />
      {isTyping && 'Typing...'}
    </ChatLayout>
  );
}
```

Digamos que la etiqueta `Typing...` no aparece donde se espera, aun cuando en algún sitio, muchas capas por encima, la prop está cambiando. ¿Cómo lo depuramos?

**Normalmente, en React puedes responder con seguridad esta pregunta mirando *hacia arriba*.** Si `ChatThread` no obtiene el valor `isTyping`, podemos abrir el componente que renderiza `<ChatThread isTyping={myVar} />` y comprobar `myVar`, y así sucesivamente. En uno de estos niveles, o bien encontraremos una implementación errónea de `shouldComponentUpdate()`, o un valor incorrecto de `isTyping` pasándose hacia abajo. Una mirada a cada componente en la cadena es generalmente suficiente para localizar el origen del problema.

Sin embargo, si este Hook `useBailout()` fuera real, nunca sabrías la razón por la que una actualización se saltó hasta que compruebas *cada uno de los Hooks personalizados* usados (en profundidad) por nuestro componente `ChatThread` y los componentes de su cadena de propiedad. Dado que cada componente padre puede *también* usar Hooks personalizados, esto es un desastre en materia de [escalabilidad](/the-bug-o-notation/).

Es como si estuvieras buscando un destornillador en una cajonera y cada gaveta tiene otras cajoneras más pequeñas, y no sabes hasta cuándo continúa el enredo.

**Veredicto:** 🔴 El Hook `useBailout()` no solo rompe la composición, sino también incrementa ampliamente el número de pasos para depurar y la carga cognitiva para encontrar una optimización errónea — en algunos casos, exponencialmente.

---

Solo nos detuvimos en un Hook real, `useState()`, y una sugerencia frecuente que intencionalmente *no* es un Hook — `useBailout()`. Los comparamos con el filtro de la Composición y la Depuración, y analizamos por qué uno de ellos funciona y el otro no.

Si bien no hay una «versión Hook» de `memo()` o `shouldComponentUpdate()`, React *sí* provee un Hook llamado [`useMemo()`](https://reactjs.org/docs/hooks-reference.html#usememo). Sirve a un propósito similar, pero su semántica es lo suficientemente distinta para no caer en los escollos descritos anteriormente.

`useBailout()` es solo un ejemplo de algo que no funciona bien como un Hook. Pero hay otros que simplemente no funcionan como Hooks — por ejemplo, `useProvider()`, `useCatch()`, o `useSuspense()`.

¿Puedes ver por qué?

*(Susurros: Composición... Depuración...)*
