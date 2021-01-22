---
title: Warum ist X kein Hook?
date: '2019-01-26'
spoiler: Nur weil wir es können, müssen wir es nicht tun.
---

Seit der Veröffentlichung der Alpha-Version der [React Hooks](https://reactjs.org/hooks), steht die folgende Frage bei Diskussionen im Raum: “Warum ist *\<irgendeine andere API\>* kein Hook?”

Nur als Erinnerung: Das *sind* Hooks:

* [`useState()`](https://reactjs.org/docs/hooks-reference.html#usestate) Lässt dich eine State-Variable deklarieren.
* [`useEffect()`](https://reactjs.org/docs/hooks-reference.html#useeffect) Lässt dich eine Nebenerscheinung (side effect) deklarieren.
* [`useContext()`](https://reactjs.org/docs/hooks-reference.html#usecontext) Lässt dich den Context verwenden.

Es gibt jedoch auch noch andere APIs, wie `React.memo()` und `<Context.Provider>`, die *keine* Hooks sind. Bereits vorgeschlagene Hookvarianten dieser APIs wären *nicht kompositionell* oder *antimodulär*. Dieser Artikel erklärt warum das so ist.

**Hinweis: Dieser Post ist ein tiefer Einblick für Leute, die in Diskussionen über APIs interessiert sind. Seht diesen Artikel nicht als produktive Arbeit mit React an!**

---

Es gibt zwei wichtige Eigenschaften die wir bei React APIs beibehalten wollen:

1. **Komposition:** [Eigene Hooks](https://reactjs.org/docs/hooks-custom.html) sind der hauptsächliche Grund warum wir uns so auf die Hook API freuen. Wir glauben, dass viele Leute ihre eigenen Hooks bauen werden und wir müssen auch sicher sein, dass diese sich [nicht widersprechen](/why-do-hooks-rely-on-call-order/#flaw-4-the-diamond-problem). (Sind wir nicht alle ein wenig verwöhnt, dass Komponenten so gut zusammen funktionieren und sich nicht gegenseitig zerstören?)

2. **Debugging:** Wir wollen, dass Bugs [einfach zu finden](/the-bug-o-notation/) sind während die Anwendung größer und größer wird. Eines der besten Features von React ist die Tatsache, dass wenn man sieht das etwas falsch gerendert wird, man einfach den Komponentenbaum heruntergehen kann, bis man das Prop oder den State gefunden, der den Fehler hervorgerufen hat.

Diese beiden Einschränkungen zusammen zeigen uns was ein Hook sein kann und was *nicht*. Lasst uns zusammen ein paar Beispiele anschauen.

---

##  Ein richger Hook: `useState()`

### Komposition

Mehrere selbsterstellte Hooks, die `useState()` verwenden, haben keine Komplikationen:

```jsx
function useMyCustomHook1() {
  const [value, setValue] = useState(0);
  // Was hier passiert, bleibt hier.
}

function useMyCustomHook2() {
  const [value, setValue] = useState(0);
  // Was hier passiert, bleibt hier.
}

function MyComponent() {
  useMyCustomHook1();
  useMyCustomHook2();
  // ...
}
```

Das Hinzufügen eines neuen Aufrufs von `useState()` ist immer sicher. Du brauchst dir keine Gedanken über andere Hooks, die bereits von einer Komponente verwendet werden, machen um eine neue State-Variable zu erstellen. Außerdem ist es nicht möglich andere State-Variablen zu zerstören, wenn man eine andere updatet.

**Fazit:** ✅ `useState()` beeinflusst selbsterstellte Hooks nicht.

### Debugging

Hooks sind besonders hilfreich, da man Werte *zwischen* ihnen austauschen kann.

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

Aber was ist, wenn wir einen Fehler machen? Wie funktioniert das Debugging?

Sagen wir mal, dass die CSS-Klasse die wir von `theme.comment` bekommen, falsch ist. Wie wollen wir das debuggen? Wir könnten einen Breakpoint setzen oder ein paar Logs in den Body der Komponente schreiben.

Möglicherweise würden wir sehen, dass `theme` falsch ist, aber `width` und `isMobile` richtig sind. Dadurch wissen wir, dass das Problem bei `useTheme()` liegt. Oder vielleicht würden wir sehen, dass `width` selber falsch ist. Das würde uns zeigen, dass wir uns mal `useWindowWith()` anschauen sollten.

**Ein einfacher Blick auf die Zwischenwerte zeigt uns welcher der Hooks den Bug enthält.** Wir brauchen nicht auf *alle* Implementationen zu schauen.

Dann können wir auf den Wert, der den Bug enthält, "reinzoomen".

Dies wird umso wichtiger, desto verschachtelter die eigenen Hooks werden. Stellen wir uns vor, dass wir 3 Ebenen von verschachtelten selbsterstellten Hooks haben, wobei jede Ebene 3 verschiedene Hooks beinhaltet. Der [Unterschied](/the-bug-o-notation/) zwischen der Suche eines Bugs an **3 Stellen** und der Suche an potentiell **3 + 3×3 + 3×3×3 = 39 Stellen** ist riesig. Glücklicherweise kann `useState()` nicht auf magische Weise andere Hooks oder Komponenten "beinflussen". Ein vergbuggter Wert, der davon zurück zurückgegeben wird, hinterlässt eine Spur so wie jede andere Variable auch 🐛

**Fazit:** ✅ `useState()` verschleiert nicht die Ursache-Wirkungs-Beziehung in unserem Code. Wir können den Brotkrümeln bis zu unserem Bug folgen. (Wie Hänsel und Gretel)

---

## Kein Hook: `useBailout()`

Als Optimierungsmöglichkeiten können Komponenten, die Hooks verwenden, das Re-Rendering auslassen.

Eine Möglichkeit besteht darin einen  [`React.memo()`](https://reactjs.org/blog/2018/10/23/react-v-16-6.html#reactmemo)-Wrapper um die ganze Komponente zu legen. Dies lässt ein Re-Rendering aus, wenn die Props auf flacher Ebene gleich den Props des letzen Renderings sind. Dies ist ähnlich wie eine `PureComponent`-Klasse.

`React.memo()` nimmt eine Komponente entgegen und gibt eine Komponente zurück:

```jsx{4}
function Button(props) {
  // ...
}
export default React.memo(Button);
```

**Aber warum ist das kein Hook?**

Egal ob man es `useShouldComponentUpdate()`, `usePure()`, `useSkipRender()`, oder `useBailout()`, nennt, die Idee sieht folgendermaßen aus:

```jsx
function Button({ color }) {
  // ⚠️ Keine echte API
  useBailout(prevColor => prevColor !== color, color);

  return (
    <button className={'button-' + color}>
      OK
    </button>
  )
}
```

Es gibt jedoch noch einige weitere Varianten (z.B. ein einfacher `usePure()`-Marker) aber im großen Ganzen haben diese einige Nachteile.

### Komposition

Gehen wir davon aus, dass wir versuchen `useBailout()` in zwei selbsterstellten Hooks zu verwenden:

```jsx{4,5,19,20}
function useFriendStatus(friendID) {
  const [isOnline, setIsOnline] = useState(null);

  // ⚠️ Keine echte API
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

  // ⚠️ Keine echte API
  useBailout(prevWidth => prevWidth !== width, width);

  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  });

  return width;
}
```

Was passiert nun, wenn wir versuchen die Beiden in der selben Komponente zu verwenden?


```jsx{2,3}
function ChatThread({ friendID, isTyping }) {
  const width = useWindowWidth();
  const isOnline = useFriendStatus(friendID);
  return (
    <ChatLayout width={width}>
      <FriendStatus isOnline={isOnline} />
      {isTyping && 'Schreibt...'}
    </ChatLayout>
  );
}
```

Wann rendert es neu?

Wenn jeder `useBailout()`-Aufruf die Möglichkeit hätte ein Update auszulassen, dann wären die Updates von `userWindowWidth()` durch `useFriendStatus()` geblockt und andersherum. **Diese Hooks würden sich gegenseitig blockieren**.

Aber wenn `useBailout()` erst dann respektiert werden würde, wenn *alle* Aufrufe aus einer Komponente das Blocken des Updates akzeptieren würden, dann würde unser `ChatThread` nicht funktionieren und keine Änderungen an dem `isTyping` Props updaten.

Noch schlimmer ist, dass dies dazu führt das **alle neuen Hooks für `ChatThread` kaputt gehen würden, wenn sie nicht *auch* `useBailout()` aufrufen würden**. Andererseits können sie sich nicht gegen den Bailout in `useWindowWith()` und `useFriendStatus()` "wehren".

**Fazit:** 🔴 `useBailout()` zerstört eine gemeinsame Benutzung. Wenn man es zu den Hooks hinzufügt, macht es andere State-Updates in anderen Hooks kaputt. Wir wollen, dass die APIs [funktionssicher](/optimized-for-change/) sind und dieses Verhalten ist ziemlich genau das Gegenteil.

### Debugging

Wie beinflusst ein Hook wie `useBailout()` das Debugging?

Dafür nutzen wir das gleiche Beispiel:

```jsx
function ChatThread({ friendID, isTyping }) {
  const width = useWindowWidth();
  const isOnline = useFriendStatus(friendID);
  return (
    <ChatLayout width={width}>
      <FriendStatus isOnline={isOnline} />
      {isTyping && 'Schreibt...'}
    </ChatLayout>
  );
}
```

Wir sagen, dass `Schreibt...` nicht dann angezeigt wird wenn wir es erwartet haben, obwohl irgendwie viele Ebenen darüber das Prop sich ändert. Wie debuggen wir das?

**Normalerweise kann man mit voller Überzeugung sagen, dass man bei React einfach *nachschaut*.** Wenn `ChatThread` keinen neuen `isTyping` Wert bekommt, können wir die Komponente, die `<ChatThread isTyping={myVar} />` rendert, öffnen und `myVar` checken. Auf einer Ebene werden wir entweder ein verbuggtes `shouldComponentUpdate()` oder einen falschen `isTyping` Wert finden. Ein Blick auf jede Komponente in dieser Kette reicht normalerweise aus, um die Ursache des Problems zu finden.

Aber wenn jedoch dieser `useBailout()` Hook existieren würde, würde man nie den wahren Grund warum ein Update übersprungen wurde finden bis man *jeden einzelnen erstellen Hook* (bis in die Tiefe), der von unserem `ChatThread` und Komponenten in seiner Kette verwendet wird, überprüft hätte. Weil jede einzelne Parent-Komponente *auch* selbsterstellte Hooks benutzen kann, [skaliert](/the-bug-o-notation/) diese Suche schrecklich.

Das ist so, als würde man nach einem Schraubenzieher in einer Kiste voller Schubladen suchen und jede Schublade würde eine Menge kleinerer Kisten voller Schubladen beinhalten und man weiß nicht wie tief diese Höhle weiter geht.

**Fazit:** 🔴 Der `useBailout()` Hook zerstört nicht nur die Komposition, sondern erhöht auch massiv die Anzahl der Schritte, die zum Debugging benötigt werden. Außerdem fordert es eine große geistige Anstregung um einen verbuggten Bailout zu finden - in manchen Fällen sogar exponentiell mehr.

---

Wir haben uns gerade mal einen echten Hook, `useState()`, und eine beliebten Vorschlag, der bewusst *kein* Hook ist, angeschaut. Wir haben diese durch die Facetten von Komposition und Debugging verglichen und darüber diskutiert, warum einer von denen funktioniert und der andere nicht.

Während es keine "Hook Version" von `memo()` oder `shouldComponentUpdate()` gibt, *bietet* React einen Hook namens [`useMemo()`](https://reactjs.org/docs/hooks-reference.html#usememo). Dieser ist für einen ähnlichen Gebrauch, aber seine Bedeutung ist anders genug, um nicht in die oben beschriebenen Fallstricke zu geraten.

`useBailout()` ist nur ein Beispiel von etwas, was nicht als Hook funktioniert. Es gibt jedoch auch noch einige andere - zum Beispiel `useProvider()`, `useCatch()`, oder `useSuspense()`.

Weißt du warum?

*(Flüsternd: Komposition... Debugging...)*
