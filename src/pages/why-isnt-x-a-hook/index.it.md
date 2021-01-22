---
title: Perché X non è un hook?
date: '2019-01-26'
spoiler: Solo perché possiamo, non significa che dobbiamo.
---

Sin da quando la versione alpha di [React Hooks](https://reactjs.org/hooks) è stata rilasciata, vi è una domanda che continua ad emergere in varie discussioni: “Perché *\<API a tua scelta\>* non è un Hook?”

Come promemoria, ecco alcuni esempi di Hook *validi*:

* [`useState()`](https://reactjs.org/docs/hooks-reference.html#usestate) ti permette di dichiarare una variabile di stato.
* [`useEffect()`](https://reactjs.org/docs/hooks-reference.html#useeffect) ti permette di dichiarare un effetto collaterale.
* [`useContext()`](https://reactjs.org/docs/hooks-reference.html#usecontext) ti permette di leggere un contesto.

Esistono però alcune API, come `React.memo()` e `<Context.Provider>`, che *non sono* un Hook. Alcune implementazioni in forma di Hook proposte per questi due esempi, sarebbero *non-composizionali* o *antimodulari*. In questo articolo cercheremo di capire perché.

**Nota: questo post è una discussione più in dettaglio per chi è interessato allo sviluppo di API. Nulla di ciò che viene discusso è essenziale per essere produttivo con React!**

---

Vi sono due proprietà importanti che vogliamo preservare nella API di React:

1. **Composizione:** Gli [Hook Personalizzati](https://reactjs.org/docs/hooks-custom.html) sono uno dei motivi principali per cui siamo entusiasti di aver introdotto una API per Hook. Ci aspettiamo di vedere diversi sviluppatori creare i propri Hook, e dobbiamo assicurarci che Hook creati da persone diverse [non siano in conflitto](/why-do-hooks-rely-on-call-order/#flaw-4-the-diamond-problem). (Non ci sentiamo viziati da come le componenti in React si compongono in maniera così' chiare senza interferire l'una con l'altra?)

2. **Debuggabilità:** Vogliamo che i bug siano [facili da trovare](/the-bug-o-notation/) man mano che l'applicazione cresce. Una delle caratteristiche migliori di React è che se noti qualcosa renderizzato in maniera scorretta, puoi navigare l'albero delle componenti finché non trovi la proprietà o lo stato che ha causato il problema.

Questi due vincoli messi insieme indicano cosa *può* e cosa *non può* essere un Hook. Proviamo alcuni esempi per chiarire.

---

##  Un Vero Hook: `useState()`

### Composizione

Hook personalizzati diversi che invocano `useState()` non confliggono:

```jsx
function useMyCustomHook1() {
  const [value, setValue] = useState(0);
  // Quel che succede qui, rimane qui.
}

function useMyCustomHook2() {
  const [value, setValue] = useState(0);
  // Quel che succede qui, rimane qui.
}

function MyComponent() {
  useMyCustomHook1();
  useMyCustomHook2();
  // ...
}
```

Aggiungere una chiamata a `useState()` che non dipenda da alcun condizionale è sempre un'operazione sicura. Non hai bisogno di sapere nulla riguardo ad altri Hook utilizzati da una componente per dichiarare una nuova variabile di stato. Inoltre, non puoi compromettere altre variabili di stato durante l'aggiornamento di una di esse.

**Verdetto:** ✅ `useState()` non rende gli Hook personalizzati fragili.

### Debuggabilità

Gli Hook sono utili perché puoi passare valori *tra* di loro:

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

Ma cosa succede se faccio un errore ? Come possiamo debuggarlo ?

Supponiamo che la classe CSS ottenuta da `theme.comment` sia sbagliata. Come possiamo debuggare questo errore? Potremmo impostare qualche breakpoint o qualche log all'interno della nostra componente.

Forse ci rendiamo conto che `theme` è sbagliato ma `width` e `isMobile` sono corretti. Questo ci suggerisce che il problema sia all'interno di `useTheme()`. O forse notiamo che `width` è sbagliato. Questo ci suggerisce di investigare all'interno di `useWindowWidth()`.

**Un primo sguardo ai valori intermedi ci dice quale Hook al livello più alto contiene il bug**. Non abbiamo bisogno di guardare all'interno di *tutti* gli Hook.

Dopo questo primo sguardo possiamo "concentrarci" su quello contenente il bug, e ripetere.

Questo processo diventa più importante se gli Hook personalizzati si annidano a maggiore profondità. Immagina se avessimo 3 livelli di Hook personalizzati, ciascuno di questi livelli utilizza 3 diversi Hook personalizzati al loro interno. La [differenza](/the-bug-o-notation/) tra cercare un bug in **3 posti diversi** rispetto a cercare potenzialmente **3 + 3×3 + 3×3×3 = 39 posti diversi** è enorme. Fortunatamente, `useState()` non può magicamente "influenzare" altri Hook o componenti. Se ritorna un valore buggato, lascerà una traccia alle sue spalle, come qualsiasi altra variabile. 🐛

**Verdetto:** ✅ `useState()` non nasconde la relazione di causa-effetto nel nostro codice. Possiamo seguire gli indizi che ci portano direttamente all'origine del bug.

---

## Non un vero Hook: `useBailout()`

Come ottimizzazione, le componenti che usano Hook possono evitare ri-renderizzazione.

Tale ottimizzazione la possiamo ottenere avvolgendo l'intera componente in [`React.memo()`](https://reactjs.org/blog/2018/10/23/react-v-16-6.html#reactmemo). In questo modo possiamo evitare ri-renderizzazione se le props sono superficialmente uguali all'ultima renderizzazione. Un comportamento simile lo abbiamo visto per le componenti in forma di classe tramite `PureComponent`.

`React.memo()` riceve una componente e ritorna una componente:

```jsx{4}
function Button(props) {
  // ...
}
export default React.memo(Button);
```

**Ma perché non é un Hook?**

Indipendentemente dal chiamarla `useShouldComponentUpdate()`, `usePure()`, `useSkipRender()`, o `useBailout()`, l'approccio proposto tende a prendere la seguente forma:

```jsx
function Button({ color }) {
  // ⚠️ Non una vera API
  useBailout(prevColor => prevColor !== color, color);

  return (
    <button className={'button-' + color}>  
      OK
    </button>
  )
}
```

Esistono alcune variazioni aggiuntive (e.g. un semplice `usePure()`) ma in generale, hanno tutti gli stessi difetti.

### Composizione

Proviamo ad inserire `useBailout()` in due Hook personalizzati:

```jsx{4,5,19,20}
function useFriendStatus(friendID) {
  const [isOnline, setIsOnline] = useState(null);

  // ⚠️ Non una vera API
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
  
  // ⚠️ Non una vera API
  useBailout(prevWidth => prevWidth !== width, width);

  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener('resizé, handleResize);
    return () => window.removeEventListener('resizé, handleResize);
  });

  return width;
}
```

Cosa succede se li usi entrambi nella stessa componente ?


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

Quando avviene la re-renderizzazione ?

Se ogni chiamata a `useBailout()` avesse la capacità di evitare un aggiornamento, gli aggiornamenti provenienti da `useWindowWidth()` sarebbero bloccati da `userFriendStatus()`, e vice versa. **Questi Hook si danneggiano l'un l'altro**.

Tuttavia, se `useBailout()` fosse rispettato solo quando *tutte* le chiamate all'interno di una singola componente *concordano* nel bloccare un aggiornamento, il nostro `ChatThread` fallirebbe l'aggiornamento durante cambiamenti della proprietà `isTyping`.

Peggio ancora, con questa semantica **qualsiasi nuovo Hook aggiunto a `ChatThread` fallirebbe se *anch'esso* non eseguisse una chiamata a `useBailout()`**. Altrimenti, non possono *votare contro* il bailout all'interno di `useWindowWidth()` e `useFriendStatus()`.

**Verdetto:** 🔴 `useBailout()` rovina la composizione. Aggiungerlo ad un Hook fa fallire gli aggiornamento di stato in altri Hook. Vogliamo che ogni API sia [antifragile](/optimized-for-change/), e tale comportamento rappresenta l'esatto opposto.

### Debuggabilità

In che modo l'Hook `useBailout()` influenza la debugabbilità?

Proviamo ad usare lo stesso esempio:

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

Supponiamo che il testo `Typing...` non appaia quando ci aspettiamo, malgrado il fatto che in qualche livello superiore la proprietà sia stata cambiata. Come possiamo debuggare questo errore?

**Normalmente, in React puoi rispondere a questa domanda con una certa confidenza semplicemente risalendo l'albero delle componenti**. Se `ChatThread` non ottiene un nuovo valore per `isTyping`, possiamo guardare all'interno della componente che renderizza  `<ChatThread isTyping={myVar} />`, controllare `myVar`, e così via. In uno di questi livelli, o scopriamo che un bailout in `shouldComponentUpdate` è buggato, oppure è stato inoltrato un valore incorretto per `isTyping`. Un semplice sguardo a ciascuna componente lungo questa catena è sufficiente a individuare l'origine del problema.

Tuttavia, se `useBailout()` fosse un vero Hook, non saresti mai in grado di sapere la ragione per cui viene saltato un aggiornamento. L'unica soluzione sarebbe di controllare *ciascun singolo Hook personalizzato* (in profondità) usato da `ChatThread` e da tutte le componenti risalendo l'albero. Poiché *anche* ogni componente parente può usare Hook personalizzati, il problema [cresce](/the-bug-o-notation/) in maniera terribile.

E’ come se tu stessi cercando un cacciavite in una cassettiera, e ciascuno cassetto contenesse un paio di piccole cassettiere, e non sai mai quanto è profonda la tana del coniglio.

**Verdetto:** 🔴 Non soltanto l'Hook `useBailout()` rovina la composizione, ma aumenta drasticamente il numero di passi necessari per debuggare. Inoltre il peso cognitivo per trovare un bailout buggato (in alcuni casi), cresce anch'esso a livello esponenziale.

---
Abbiamo appena osservato un Hook vero e proprio, `useState()`, e un suggerimento comune che *non* è un Hook intenzionalmente - `useBailout()`. Abbiamo confrontato questi Hook dal punto di vista della Composizione e Debuggabilità, e discusso il motivo per cui uno dei due funziona e l'altro no.

Sebbene non ci sia una *versione in forma di Hook* di `memo()` o `shouldComponentUpdate()`, React *fornisce* un Hook chiamato [`useMemo()`](https://reactjs.org/docs/hooks-reference.html#usememo). Lo scopo è molto simile, ma la semantica è sufficientemente diversa da non cadere vittima dei vari problemi menzionati.

`useBailout()` è un semplice esempio di qualcosa che non funziona bene in forma di Hook. Altri esempi simili sono: `useProvider()`, `useCatch()`, o `useSuspense()`.

Riesci a capire come mai?

*(Bisbigliando: Composizione... Debuggabilità...)*
