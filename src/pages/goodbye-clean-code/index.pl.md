---
title: 'Żegnaj, czysty kodzie'
date: '2020-01-11'
spoiler: Pozwól, aby czysty kod cię prowadził. Potem, pozwól mu odejść.
---

Był wieczór. 

My colleague has just checked in the code that they've been writing all week. We were working on a graphics editor canvas, and they implemented the ability to resize shapes like rectangles and ovals by dragging small handles at their edges.

Kod działał.

Ale się powtarzał. Każda figura ( jak prostokąt czy owal) miała oddzielny zestaw przycisków, a przeciąganie każdego z nich zmieniało figurę w inny sposób. Jeżeli użytkownik trzymał Shift, musieliśmy zachowywać również proporcje przy zmianie skali. Było tam sporo matmy.

Kod wyglądał mniej więcej tak:

```jsx
let Rectangle = {
  resizeTopLeft(position, size, preserveAspect, dx, dy) {
    // 10 powtarzalnych linii matmy
  },
  resizeTopRight(position, size, preserveAspect, dx, dy) {
    // 10 powtarzalnych linii matmy
  },
  resizeBottomLeft(position, size, preserveAspect, dx, dy) {
    // 10 powtarzalnych linii matmy
  },
  resizeBottomRight(position, size, preserveAspect, dx, dy) {
    // 10 powtarzalnych linii matmy
  },
};

let Oval = {
  resizeLeft(position, size, preserveAspect, dx, dy) {
    // 10 powtarzalnych linii matmy
  },
  resizeRight(position, size, preserveAspect, dx, dy) {
    // 10 powtarzalnych linii matmy
  },
  resizeTop(position, size, preserveAspect, dx, dy) {
    // 10 powtarzalnych linii matmy
  },
  resizeBottom(position, size, preserveAspect, dx, dy) {
    // 10 powtarzalnych linii matmy
  },
};

let Header = {
  resizeLeft(position, size, preserveAspect, dx, dy) {
    // 10 powtarzalnych linii matmy
  },
  resizeRight(position, size, preserveAspect, dx, dy) {
    // 10 powtarzalnych linii matmy
  },  
}

let TextBlock = {
  resizeTopLeft(position, size, preserveAspect, dx, dy) {
    // 10 powtarzalnych linii matmy
  },
  resizeTopRight(position, size, preserveAspect, dx, dy) {
    // 10 powtarzalnych linii matmy
  },
  resizeBottomLeft(position, size, preserveAspect, dx, dy) {
    // 10 powtarzalnych linii matmy
  },
  resizeBottomRight(position, size, preserveAspect, dx, dy) {
    // 10 powtarzalnych linii matmy
  },
};
```

Ta powtarzająca się matematyka męczyła mnie.

Nie była *czysta*.

Większość tej powtarzalności pojawiała się kiedy rozciągaliśmy kształty w tym samym kierunku. Na przykład `Oval.resizeLeft()`  było podobne do `Header.resizeLeft()`. Spowodowane to było że obydwa rozwiązały ten sam problem, rozciągania w lewą stronę.

Drugie występujące podobieństwa dotyczył tej samej figury. `Oval.resizeLeft()` miało pokrewieństwa z wszystkimi innymi metodami z klasy `Oval`. Spowodowane to było tym, że wszystkie metody dotyczyły właśnie owalu. Było również parę linijek powtarzającego siękodu w klasach `Rectangle`, `Header`, oraz `TextBlock`, dlatego że wszystkie *są* prostokątami. 

Wpadlem na pomysł. 

Moglibyśmy *usunąć wszystkie powtórzenia* grupując kod w taki sposób:

```jsx
let Directions = {
  top(...) {
    // 5 unikalnych linijek matmy
  },
  left(...) {
    // 5 unikalnych linijek matmy
  },
  bottom(...) {
    // 5 unikalnych linijek matmy
  },
  right(...) {
    // 5 unikalnych linijek matmy
  },
};

let Shapes = {
  Oval(...) {
    // 5 unikalnych linijek matmy
  },
  Rectangle(...) {
    // 5 unikalnych linijek matmy
  },
}
```

i potem stworzyć odpowiednie dla każdego obiektu reakcje:

```jsx
let {top, bottom, left, right} = Directions;

function createHandle(directions) {
  // 20 lines of code
}

let fourCorners = [
  createHandle([top, left]),
  createHandle([top, right]),
  createHandle([bottom, left]),
  createHandle([bottom, right]),
];
let fourSides = [
  createHandle([top]),
  createHandle([left]),
  createHandle([right]),
  createHandle([bottom]),
];
let twoSides = [
  createHandle([left]),
  createHandle([right]),
];

function createBox(shape, handles) {
  // 20 lini kodu
}

let Rectangle = createBox(Shapes.Rectangle, fourCorners);
let Oval = createBox(Shapes.Oval, fourSides);
let Header = createBox(Shapes.Rectangle, twoSides);
let TextBox = createBox(Shapes.Rectangle, fourCorners);
```

Kod zmniejszył się o połowę, i powtarzalność spadła do zera! Tak *czysto*. Jeżeli chcielibyśmy zmienić zachowanie dla konkretnej figury w konkretnym kierunku, możemy zrobić to w jednym miejscu zamiast aktualizować metody w róznych miejscach.

Była już późna noc ( i trochę mnie poniosło). Wrzuciłem swój refactor na mastera i poszedłem spać, dumny że naprawiłem bałaganiarski kod mojego kolegi. 

## Następnego dnia

... nie poszlo tak jak myślałem.

Mój szef zaprosił mnie na pogawętkę jeden na jednego, gdzie grzecznie poprosił mnie abym cofnął swoje zmiany. Byłem przerażony. Stary kod był bałaganem, a mój był *czysty*!

Niechętnie zgodziłem się, ale lata zajęło mi przyznanie mu racji. 

## To taki Okres

Obsesja na punkcie "czystego kodu" i usuwaniu powtórzeń to okres który przechodzi każdy z nas. Kiedy nie jesteśmy pewni swojego kodu, łatwo jest się trzymać dumnie narzuconych sobie dobrych praktyk aby potwierdzić swój profesjonalizm mierzalną skalą. Zbiór rygorystycznych zasad nazewnictwa, lintera, struktury plików, braku powtórzeń. 

Nie możesz zautomatyzować usuwania duplikacji, ale *staje się* to łatwiejsze z czasem. Zwykle jesteś wstanie stwierdzić czy kodu powtózeń jest więcej czy mniej po każdej zmianie. Wynikiem tego, usuwanie duplikacji wydaje się być niezależną metryką na temat kodu. Gorzej, igra to z poczuciem tożsamości programistów: *"Jestem osobą która pisze czysty kod"*. Potrafi to wpływać tak mocno jak każde inne kłamstwo które sobie wmawiamy.

Kiedy tylko nauczymy się [abstrakcji](https://www.sandimetz.com/blog/2016/1/20/the-wrong-abstraction), łatwo jest wpaść w przyzwyczajenie aby tworzyć z powietrza kolejne abstrakcje kiedy tylko widzimy powtarzający się kod. Po kilku latach kodzenia, widzimy powtarzalny kod *wszędzie* -- i abstrakcje stają się naszą nową supermocą. Jeżeli ktoś powie nam że abstrakcja jest *cnotą*, łykniemy to. I zaczniemy oceniać innych ludzi przez pryzmat ich "czystośći".

Teraz widzę że mój "refactor" był porażką z dwóch powodów:

* Po pierwsze, nie zapytałem o to osoby która pisała kod. Zmieniłem go i sprawdziłem bez żadnej uwagi. Nawet jeżeli to *było* polepszenie ( w co już nie wierzę), to najgorszy sposób żeby je przeprowadzić. Zdrowy zespół ciągle *buduje zaufanie*. Przepisywanie kodu twojego współpracownika bez żadnej dyskusji z nim to ogromne uderzenie we wspólne zaufanie i tworzenie kodu.  

* Po drugie, nic nie jest za darmo. Mój kod wymienił możliwość zmiany wymagań na zmniejszoną duplikację kodu, i nie była to dobra wymiana. Na przykład, później potrzebowaliśmy bardziej specyficznych zachowań dla innych przycisków i dla innych figur. Moje abstrakty stałyby się zdecyodwanie zbyt skomplikowane i kosztowne, a orginalny "bałganiarski" kod pozwoliłbym na takie zmiany łatwo jak po maśle.

Czy mam na mysli że masz pisać "brzydki" kod? Nie. Sugeruję aby przemyśleć co masz na myśli jak mówisz "czysty" lub "brzydki". Czy czujesz że kod jest rewolucyjny? Poprawny? Ładny? Elegancki? Jak bardzo jesteś pewny że potrafiłbyś wskazać konkretne wady oraz zalety tych rozwiązań w praktce? Jak wpływają one na sposób w jaki kod jest napisany i jak go [modyfikują](/optimized-for-change/)?

Na pewno nie myślałem długo na ten temat. Patrzyłem bardziej na to jak kod *wygląda* -- ale nie na to jak *zmienia się* wraz z zespołem piszącym go prostych ludzi.  

Pisanie kodu, to podróż. Pomyśl, jak daleko cię ona zaprowadziła od twojej pierwszej lini kodu, do tego gdzie teraz jesteś. Rozumiem że świetnie było poczuć tą ekscytację pierwszego razu kiedy zrobiłęś refactor classy i zmieniłeś kod na bardziej prosty. Jeżeli czujesz dumę z rzemiosła jakim jest pisanie kodu, łatwo jest popaść w rutynę poprawiania i czyszczenia go. Rób to, tak długo jak chcesz. 

Ale nie zatrzymuj się tylko na tym. Nie bądź kultystą czystego kodu. Czysty kod nie jest celem. To próba stworzenia czegoś czytelniejszego z zagmatwanych systemów którymi się zajmujemy. To mechnizm obronny aktywowany jak nie jesteś pewny w jaki sposób zmiana wpłynie to na cały kod, i potrzebujesz kompasu na tym morzu nieznanego. 

Pozwól aby czysty kod cię porwadził. **Potem, pozwól mu odejść.**
