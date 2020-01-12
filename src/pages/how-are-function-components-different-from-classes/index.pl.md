---
title: Czym różnią się komponenty funkcyjne od klasowych?
date: '2019-03-03'
spoiler: To są zupełnie różne Pokemony.
---

Czym różnią się Reactowe funkcyjne komponenty od tych klasowych?

Przez jakiś czas, podstawową odpowiedzią na to pytanie było, że klasy dają dostęp do większej ilości funkcjonalności (na przykład do state'u). Od momentu pojawienia się [Hooków](https://reactjs.org/docs/hooks-intro.html), nie stanowi to argumentu.

Być może słyszałeś że któryś z komponentów jest lepszy od drugiego pod względem wydajności. Który właściwie? Wiele mających to wyjaśnić testów zostało [źle](https://medium.com/@dan_abramov/this-benchmark-is-indeed-flawed-c3d6b5b6f97f?source=your_stories_page---------------------------) przeprowadzonych, więc byłbym uważny z [wyciąganiem z nich wniosków ](https://github.com/ryardley/hooks-perf-issues/pull/2). Wydajność zależy przede wszystkim od tego co robi kod, a nie od tego czy wybierze się funkcję czy klasę. Z naszych obserwacji wynika, że różnice w wydajności są pomijalne, pomimo tego, że strategie optymalizacyjne są trochę [inne](https://reactjs.org/docs/hooks-faq.html#are-hooks-slow-because-of-creating-functions-in-render).

W każdym razie [nie polecamy](https://reactjs.org/docs/hooks-faq.html#should-i-use-hooks-classes-or-a-mix-of-both) Ci przepisywania istniejących komponentów, jeżeli nie posiadasz naprawdę istotnych powodów oraz nie przeszkadza Ci bycie early-adaopterem. Hooki to wciąż nowe zagadanienie (tak samo jak React był w 2014 roku) i pewne "dobre praktyki" nie zostały jeszcze zaprezentowane w tutorialach.

Na czym więc stoimy? Czy są w ogóle jakieś fundamentalne różnice pomiędzy React'owymi fukcjami a klasami? Jasne że tak - w modelu mentalnym. **W tym wpisie przyjrzę się podstawowej różnicy między nimi.** Istniała ona od momentu [wprowadzenia](https://reactjs.org/blog/2015/09/10/react-v0.14-rc1.html#stateless-function-components) komponentów funkcyjnych w 2015 roku, ale zwykle była omijana:

>**Funkcyjne komponenty przejmują wyrenderowane wartości.**

Przyjrzyjmy się bliżej co to oznacza.

---
**UWAGA: ten post nie jest w żaden sposób sądem wartościującym na klasach czy funkcjach. Opisuję jedynie różnicę pomiędzy dwoma modelami programistycznymi w React'cie. W przypadku pytań o to jak szerzej zastosować funkcję zapraszam do [Hooks FAQ](https://reactjs.org/docs/hooks-faq.html#adoption-strategy).**

---

Rozważmy taki komponent:

```jsx
function ProfilePage(props) {
  const showMessage = () => {
    alert('Followed ' + props.user);
  };

  const handleClick = () => {
    setTimeout(showMessage, 3000);
  };

  return (
    <button onClick={handleClick}>Follow</button>
  );
}
```
Pokazuje on button który symuluje zapytanie przez użycie `setTimeout` a następnie pokazuje alert z potwierdzeniem. Przykładowo jeżeli `props.user` to `'Dan'`, komponent pokaże `'Followed Dan'` po trzech sekundach. No i tyle.

*(Zauważ, że w przykładzie powyżej nie ma znaczenia czy użyję funkcji strzałkowej czy deklaracji funkcji. `function handleClick()` zadziałałoby identycznie).*

Jak byśmy to napisali jako klasę? Tłumacząc to w sposób naiwny mogłoby to wyglądać tak:

```jsx
class ProfilePage extends React.Component {
  showMessage = () => {
    alert('Followed ' + this.props.user);
  };

  handleClick = () => {
    setTimeout(this.showMessage, 3000);
  };

  render() {
    return <button onClick={this.handleClick}>Follow</button>;
  }
}
```
Powszechnie uważa się, że te dwa fragmenty kodu są sobie równe. Ludzie często po prostu refaktorują z jednego sposobu na drugi nie dostrzegając jakie to niesie konsekwencje:

![Zauważ różnicę pomiędzy tymi dwoma fragmentami kodu](./wtf.gif)

**Jest jednak pewna delikatna różnica pomiędzy tymi dwoma fragmentami kodu.** Przyjrzyj się im dobrze. Czy już ją widzisz? Mi osobiście zajęło chwilę żeby to dostrzec.

**Jeżeli chcesz pogłówkować sam, zatrzymaj się przy [live demo](https://codesandbox.io/s/pjqnl16lm7). Dalej pokazane są spoilery, które mogłyby Ci w tym przeszkodzić.** Dalsza część artykułu wyjaśnia wcześniej wspomnianą różnicę oraz pokazuje, dlaczego jest ona istotna.

---

Zanim przejdziemy dalej, chciałbym podkreślić że różnica, którą opisuję nie jest jako tako powiązana z Hookami. Przykłady które pokazuję nawet ich nie używają!

Chodzi tylko o różnicę pomiędzy funkcjami a klasami w React'cie. Jeżeli planujesz częstsze używanie funkcji w React'cie to możesz chcieć je zrozumieć.

---

**Zaprezentujemy tę różnicę poprzez wskazanie częstego bug'u w Reactowych aplikacjach.**

Otwórz **[przykładowy sandbox](https://codesandbox.io/s/pjqnl16lm7)** z aktualnym profile-selectorem oraz dwoma powyższymi implementacjami `ProfilePage` - każdy renderuje przycisk Follow.

Wypróbuj poniższą sekwencję naciskając raz jeden przycisk raz drugi:

1. **Naciśnij** jeden z przycisków Follow.
2. **Zmień** profil zanim miną 3 sekundy.
3. **Przeczytaj** tekst z alertu.

Zauważysz osobliwą różnicę:

*  Kiedy `ProfilePage` jest **funkcją**, kliknięcie Follow na profilu Dan a następnie zmiana na profil Sophie wywoła wyświetlenie spodziewanego alertu `'Followed Dan'`

* Kiedy `ProfilePage` jest **klasą**, będzie to alert z `'Followed Sophie'`

![Demonstracja kroków](./bug.gif)

---

W tym przykładzie pierwsze zachowanie jest poprawne. **Jeżeli zaczynam kogoś obserwować (follow) a następnie zmienię profil na inny, komponent nie powinien mieć problemu z tym kogo zacząłem obserwować.** Jest jasne, że implementacja z wykorzystaniem klasy ma błędy.

*(Tak czy inaczej, absolutnie powinniście zacząć [obserwować Sophie](https://mobile.twitter.com/sophiebits).)*

---

Więc dlaczego nasz przykład z klasą tak się zachowuje?

Przyjrzyjmy się bliżej metodzie `showMessage` w naszej klasie:

```jsx{3}
class ProfilePage extends React.Component {
  showMessage = () => {
    alert('Followed ' + this.props.user);
  };
```
Ta metoda z klasy czyta z `this.props.user`. Propsy są niemutowanlne w React'cie więc nie nigdy nie ulegają zmianie. **Ale `this` *jest* i zawsze był mutowalny.**

Faktycznie, taki jest przecież cel istnienia `this` w klasie. React ciągle przeprowadza tę mutację, żebyś mógłby mieć jego świeżą wersje w `renderze` i metodach lifecycle.

Więc jeżeli komponent się rerenderuje, podczas gdy w zapytanie jest jeszcze w trakcie, to `this.props` się zmieni. `showMessage` czyta z `user` z niewłaściwego, “zbyt nowego“ `props`.

To uwidacznia ciekawą obserwacje dotyczącą natury interfejsów użytkownika. Jeżeli założymy, że UI jest funkcją aktualnego stanu aplikacji, **to obsługa zdarzeń również jest częścią wyniku renderowania - tak samo jak wynik wizualny.** Nasza obsługa zdarzeń “należy“ do konkretnego cyklu renderowania z konkretnymi propsami i statem.

Jednak użycie timeouta którego funkcja wywołania zwrotnego czyta z `this.props` niszczy to połączenie. Nasza funkcja wywołania zwrotnego `showMessage` nie jest “połączona“ z żadnym renderem, dlatego “traci“ poprawny props. Czytanie z `this` niszczy to połączenie.

---
**Wyobraźmy sobie, że funkcyjne komponenty nie istnieją.** Jak rozwiązalibyśmy ten problem?

Chcielibyśmy w jakiś sposób “naprawić“ połącznie między `renderem` z właściwymi propsami a funkcja wywołania zwrotnego `showMessage` która je czyta. Gdzieś po drodze te `propsy` się gubią.

Jednym ze sposobów byłoby zczytanie `this.props` wcześniej a następnie przesłanie ich jawnie do funkcji callbacku w timeout'cie:

```jsx{2,7}
class ProfilePage extends React.Component {
  showMessage = (user) => {
    alert('Followed ' + user);
  };

  handleClick = () => {
    const {user} = this.props;
    setTimeout(() => this.showMessage(user), 3000);
  };

  render() {
    return <button onClick={this.handleClick}>Follow</button>;
  }
}
```
I to [działa](https://codesandbox.io/s/3q737pw8lq). Jednakże to podejście powoduje że kod z czasem staje się zdecydowanie bardziej rozwlekły i podatny na błędy. Co jeżeli potrzebowalibyśmy więcej niż jeden prop? Co jeżeli musielibyśmy dostać się też do state'u? **Jeżeli `showMessage` zawoła inną metodę, a ta metoda znowu zczyta `this.props.something` albo `this.state.something`, będziemy mieć ponownie ten sam problem.** Więc musielibyśmy przesłać `this.props` i `this.state` jako argumenty do każdej metody wywoływanej z `showMessage`.

Robienie tego w taki sposób pozbawia klasy ergonomii użytkowania którą normalnie byśmy mieli. Jest to też trudne do zapamiętania czy wymuszenia, przez co w zamian ludzie zwykle wolą przystawać na bugi.

Podobnie umieszczenie kodu `alertu` wewnątrz `handleClick` nie rozwiązałoby większego problemu. Chcemy tak strukturyzować kod, żeby można go było dzielić na więcej metod, *ale* chcemy też mieć możliwość czytania z propsów i state'u które odnoszą się do tego konkretnego renderu który został wywołany. **Ten problem nie jest w żadnej sposób wyjątkowy dla Reacta - to samo może zreprodukować w każdej innej bibilotece do UI która trzyma dane w mutowalnych strukturach jak `this`.**

Może moglibyśmy *zbindować* metody w konstruktorze?

```jsx{4-5}
class ProfilePage extends React.Component {
  constructor(props) {
    super(props);
    this.showMessage = this.showMessage.bind(this);
    this.handleClick = this.handleClick.bind(this);
  }

  showMessage() {
    alert('Followed ' + this.props.user);
  }

  handleClick() {
    setTimeout(this.showMessage, 3000);
  }

  render() {
    return <button onClick={this.handleClick}>Follow</button>;
  }
}
```

Niestety, nie naprawia to niczego. Pamiętaj, że problem polega na tym, że czytamy z `this.props` za późno - a nie na tym jakiego syntaxu używamy! **Jednak problem by zniknął gdybyśmy w pełni polegali na JavaScriptowych domknięciach.**

Domknięcia są często unikane przez to, że [ciężko](https://wsvincent.com/javascript-closure-settimeout-for-loop/) się myśli o wartościach które z czasem są zmieniane. Ale w React'cie propsy i state'y są niemutowalne! (A przynajmniej jest to zdecydowanie rekomendowane.) To eliminuje dużą bolączkę związaną z używaniem domknięć.

To oznacza, że jeżeli zrobisz domknięcie na propsach i state'cie w jakimś konkretnym renderze to możesz zawsze polegać na tym, że zostaną one tak jak były:

```jsx{3,4,9}
class ProfilePage extends React.Component {
  render() {
    // Capture the props!
    const props = this.props;

    // Note: we are *inside render*.
    // These aren't class methods.
    const showMessage = () => {
      alert('Followed ' + props.user);
    };

    const handleClick = () => {
      setTimeout(showMessage, 3000);
    };

    return <button onClick={handleClick}>Follow</button>;
  }
}
```


**Właśnie “złapałeś“ propsy na czas renderu:**

![Łapanie Pokemona](./pokemon.gif)

W ten sposób jakikolwiek kod wewnątrz (włączając w to `showMessage`) ma gwarancję, że zobaczy prosy dla tego konkretnego renderu. React nie “przestawia nam już rzeczy“.

**Moglibyśmy dodać tyle pomocnicznych funkcji ile chcemy i używałyby one uchwyconych propsów i state'u.** Domknięcia na ratunek!

---
[Powyższy przykład](https://codesandbox.io/s/oqxy9m7om5) jest poprawny ale wygląda dziwnie. Jaki jest cel posiadania klasy, jeżeli wewnątrz `renderu`definiujemy funkcje zamiast używać metod klasy?

Rzeczywiście, możemy uprościć kod usuwając “warstwę“ z klasą:
```jsx
function ProfilePage(props) {
  const showMessage = () => {
    alert('Followed ' + props.user);
  };

  const handleClick = () => {
    setTimeout(showMessage, 3000);
  };

  return (
    <button onClick={handleClick}>Follow</button>
  );
}
```

Tak jak powyżej, `propsy` wciąż są łapane - React przekazuje je jako argument. **Inaczej niż w przypadku `this`, objekt `props` nigdy nie jest mutowany przez Reacta.**

Staje się to trochę bardziej oczywiste kiedy zdestrukturyzujemy `props` podczas definicji funkcji:

```jsx{1,3}
function ProfilePage({ user }) {
  const showMessage = () => {
    alert('Followed ' + user);
  };

  const handleClick = () => {
    setTimeout(showMessage, 3000);
  };

  return (
    <button onClick={handleClick}>Follow</button>
  );
}
```

Kiedy komponent rodzic renderuje `ProfilePage` z innymi propsami, React odpala funkcję `ProfilePage` ponownie. Ale handler który wcześniej kliknęliśmy “należy“ do poprzedniego renderu z jego własną wartością `user` i callbackiem `showMessage` który go czyta. Wszystkie one pozostają niezmienione.

To dlatego w wersji [demo](https://codesandbox.io/s/pjqnl16lm7) z funkcją, kliknięcie Follow w profil Sophie, a następnie zmiana wyboru na Sunil pokaże alert `'Followed Sophie'`:

![Demonstracja poprawnego zachowania](./fix.gif)
To działanie jest poprawne. *(Ale i tak możesz chcieć zacząć [obserwować też Sunil](https://mobile.twitter.com/threepointone)!)*

---
Teraz rozumiemy największą różnicę między funkcjami a klasami w React'cie:

>**Funkcyjne komponenty chwytają renderowane wartości.**

**Przy Hook'ach ta sama zasada działa również dla state'u.** Rozważmy ten przykład:

```jsx
function MessageThread() {
  const [message, setMessage] = useState('');

  const showMessage = () => {
    alert('You said: ' + message);
  };

  const handleSendClick = () => {
    setTimeout(showMessage, 3000);
  };

  const handleMessageChange = (e) => {
    setMessage(e.target.value);
  };

  return (
    <>
      <input value={message} onChange={handleMessageChange} />
      <button onClick={handleSendClick}>Send</button>
    </>
  );
}
```

(Tutaj znajdziesz [live demo](https://codesandbox.io/s/93m5mz9w24).)

Mimo, że nie jest to najlepszy UI dla apki do komunikacji, pokazuje tę samą rzecz: jeżeli wysyłam jakąś wiadomość to komponentowi nie powinno się mieszać która wiadomość ma zostać wysłana. `Message` z funkcyjnego komponentu łapie state który “należy“ do renderu, który zaś zwraca click handler wywołany przez przeglądarkę. `Message` jest więc ustawiony na to co, znajduje się w inpucie kiedy kliknę “Send“.

---
Wiemy więc że funkcje w React'cie domyślnie łapią propsy i state. **A co jeżeli chcemy czytać ostatni props albo state który nie należy do tego renderu?** Co jeżeli chcemy [“czytać je z przyszłości”](https://dev.to/scastiel/react-hooks-get-the-current-state-back-to-the-future-3op2)?

W klasie robi się to tak, że czyta się `this.props` albo `this.state` ponieważ `this` samo w sobie jest mutowalne. React je mutuje. W funkcyjnych komponentach też możesz mieć mutowalne wartości, które są współdzielone między wszystkimi renderami komponentu. Nazywa się to “ref“:

```jsx
function MyComponent() {
  const ref = useRef(null);
  // You can read or write `ref.current`.
  // ...
}
```

Jednak musiałbyś radzić sobie z tym sam.

Ref [odgrywa taką samą rolę](https://reactjs.org/docs/hooks-faq.html#is-there-something-like-instance-variables) jak pole instancyjne. Jest wyjściem ewakuacyjnym do świata mutowalnego i imperatywnego. Możesz kojarzyć “DOM refs“ ale koncepcja jest dużo bardziej ogólna. To jest tylko pudełko, w którym możesz coś umieścić.

Nawet wizualnie `this.something` wygląda jak lustrzane odbicie `something.current`. Oba reprezentują ten sam koncept.

Domyślnie, React nie tworzy refów dla ostatniech propsów i state'u w komponentach funkcyjnych. W wielu przypadkach ich nie potrzebujesz i przypisywanie ich byłoby niepotrzebną pracą. Jeśli chcesz, możesz śledzić tę wartość manualnie:

```jsx{3,6,15}
function MessageThread() {
  const [message, setMessage] = useState('');
  const latestMessage = useRef('');

  const showMessage = () => {
    alert('You said: ' + latestMessage.current);
  };

  const handleSendClick = () => {
    setTimeout(showMessage, 3000);
  };

  const handleMessageChange = (e) => {
    setMessage(e.target.value);
    latestMessage.current = e.target.value;
  };
```
Jeżeli zczytamy `message` z `showMessage`, to zobaczymy wiadomość w tym samym czasie, w którym kliknęliśmy przycisk Send. Ale kiedy czytamy `latestMessage.current`, to dostajemy ostatnią wartość - nawet jeżeli będziemy dalej pisać po tym jak kliknęliśmy w przycisk Send.

Możesz porównać [oba](https://codesandbox.io/s/93m5mz9w24) [dema](https://codesandbox.io/s/ox200vw8k9) żeby zobaczyć różnicę na właśne oczy. Ref jest sposobem na “wypisanie“ się z tej regularności renderowania i w niektórych przypadkach może być pomocne.

Ogólnie powinniśmy unikać czytania i zmiany refów *podczas* renderowania, ponieważ są one mutowalne. Zależy nam, aby renderowanie było przewidywalne. **Jednak jeżeli chcemy dostać ostatnią wartość jakiegoś konkretnego prosu czy state'u to manualne aktualizowanie refów może być denerwujące.** Możemy to zautomatyzować poprzez użycie efektu:

```jsx{4-8,11}
function MessageThread() {
  const [message, setMessage] = useState('');

  // Keep track of the latest value.
  const latestMessage = useRef('');
  useEffect(() => {
    latestMessage.current = message;
  });

  const showMessage = () => {
    alert('You said: ' + latestMessage.current);
  };
```

(Tutaj znajdziesz [demo](https://codesandbox.io/s/yqmnz7xy8x).)

Robimy przypisanie *wewnątrz* efektu, dzięki czemu wartość ref zmienia się tylko kiedy DOM zostanie zaktualizowany. To zapewnia, że nasza mutacja nie zepsuje funkcjonalności jak [Time Slicing i Suspense](https://reactjs.org/blog/2018/03/01/sneak-peek-beyond-react-16.html), które polegają na przerywalnym renderze.

Używanie ref w takim kontekście nie jest zbytnio popularne. **Chwytanie propsów czy state'u jest zazwyczaj lepszym wyborem.** Jednak może to być pomocne, kiedy używa się [imperatywnych API](/making-setinterval-declarative-with-react-hooks/) jak interwały czy subskrybcje. Pamiętaj, że możesz w ten sposób śledzić *każdą* wartość - prop, state, cały objekt props czy nawet funkcję.

Ten wzorzec może być pomocny przy optymalizacji - na przykład kiedy `useCallback` jest zbyt często zmieniany. Jednak [użycie reducera](https://reactjs.org/docs/hooks-faq.html#how-to-avoid-passing-callbacks-down) jest zwykle [lepszą opcją](https://github.com/ryardley/hooks-perf-issues/pull/3). (Temat na artykuł na przyszłość!)

---
W tym artykule przyjrzeliśmy się powszechnemu niewłaściwemu sposobowi używania klas oraz temu jak domknięcia pomagają nam to naprawić. Jak mogłeś jednak zauważyć, kiedy próbujesz optymalizować Hooki przez określenie tablicy zależności, możesz trafić na bugi związane ze starymi domknięciami. Czy to oznacza że domknięcia są problemem? Nie sądzę.

Tak jak widzieliśmy to wyżej, to właśnie domknięcia pomagają nam *naprawić* pewne subtelne problemy które ciężko zauważyć. Tak samo ułatwiają one pisanie kodu, który będzie działać poprawnie w [Concurrent Mode](https://reactjs.org/blog/2018/03/01/sneak-peek-beyond-react-16.html). Jest to możliwe przez to, że logika wewnątrz komponentu domyka się na właściwych propsach i state'cie, z którymi został wyrenderowany.

We wszystkich przypadkach które widziałem do tej pory, ten problem ze  **“starymi domknięciami“ zdarzał się przez niewłaściwe założenie że "funkcje się nie zmieniają" albo że “propsy są zawsze takie same“.** Tak nie jest, a ten artykuł mam nadzieję pomaga to wyjaśnić.

Funkcje domykają się na ich propsach i state'cie - dlatego właśnie ich tożsamość jest tak ważna. To nie jest błąd, a cecha funkcyjnych komponentów. Funkcje nie powinny być wykluczane z “tablicy zależności“ przykładowo dla `useEffect` albo `useCallback`. (Poprawnym rozwiązaniem jest albo użycie `useReducer`, albo rozwiązania `useRef` przedstawionego wyżej - wkrótce udokumentujemy jak wybrać pomiędzy jednym a drugim).

Kiedy większość naszego React'owego kodu piszemy za pomocą funkcji, musimy dostosować naszą intuicję dotyczącą [optymalizacji kodu](https://github.com/ryardley/hooks-perf-issues/pull/3) i [tego co może zmienić się w czasie.](https://github.com/facebook/react/issues/14920).

Jak [przedstawił to Fredrik](https://mobile.twitter.com/EphemeralCircle/status/1099095063223812096):

>Najlepszą mentalną regułę jaką można sobie wyobrazić dla Hooków to ”pisz je tak, jakby wszystko mogło się zmienić w czasie”

Funkcje nie są wyjątkiem od tej reguły. Trochę czasu musi upłynąć zanim stanie się to wiedzą powszechną w React'owych materiałach do nauki. Wymaga to lekkiego przestawienia się z myślenia w klasach, ale mam nadzieję, że ten artykuł pomoże spojrzeć na to z nowej, świeżej perspektywy.

React'owe funkcje zawsze chwytają swoją wartość - teraz już wiemy dlaczego.

![Uśmiechnięty Pikachu](./pikachu.gif)

Są one zupełnie innym Pokemonem.
