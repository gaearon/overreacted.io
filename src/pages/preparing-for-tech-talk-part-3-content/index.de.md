---
title: 'Vorbereitung für Tech Vorträge, Part 3: Inhalt'
date: '2019-07-10'
spoiler: Von der Idee zu einem Vortrag.
---

Ich habe bereits ein [paar](https://www.youtube.com/watch?v=xsSnOQynTHs) [Tech](https://www.youtube.com/watch?v=nLF0n9SACd4) [Voträge](https://www.youtube.com/watch?v=dpw9EHDh2bM) gehalten, die in meinen Augen gut liefen.

Hin und wieder werde ich gefragt, wie ich mich auf meine Vorträge vorbereite.
Die Antwort hängt von jedem Speaker persönlich ab.
Ich möchte nun teilen, was für mich funktioniert.

**Dies ist der dritte Artikel in einer Serie**, in der ich meinen Prozess zur Vorbereitung für Tech Vorträge erkläre - von der ersten Idee bis zum Tag der Präsentation.

* **[Vorbereitung für Tech Vorträge, Part 1: Motivation](/preparing-for-tech-talk-part-1-motivation/)**
* **[Vorbereitung für Tech Vorträge, Part 2: Was, warum und wie](/preparing-for-tech-talk-part-2-what-why-and-how/)**
* **Vorbereitung für Tech Vorträge, Part 3: Inhalt (*dieser Artikel*)**
* Fortsetzung folgt…

<p />

---

**In diesem Artikel fokussiere ich mich auf den Prozess zur Erstellung der Folien und des Inhalts meines Vortrags.**

---

Es gibt zwei Wege etwas zu erstellen.

Du kannst von **oben-nach-unten** vorgehen, wobei du mit einer groben Gesamtentwurf startest und danach schrittweise jeden individuellen Teil verfeinerst. Oder du kannst von **unten-nach-oben** arbeiten, wo du mit einem kleinen ausgearbeitetten Fragment startest und dann alles außen herum entwickelst. Dies könnte dich daran erinnern, wie manche Bildformate immer von oben-nach-unten geladen werden, wobei andere starten verschwommen werden aber schärfer je mehr Daten geladen sind.

Meist mische ich diese beiden Herangehensweisen bei der Vorbereitung meiner Vorträge.

---

### Von oben-nach-unten: Der Überblick

Sobald ich weiß, [worüber der Vortrag handeln soll](/preparing-for-tech-talk-part-2-what-why-and-how/), **schreibe ich einen groben Gesamtentwurf. Dies ist eine Stichpunktliste von jedem Gedanken den ich einbauen möchte.** Es muss nicht ausgereift oder verständlich für andere sein. Ich brainstorme hier nur und schaue, was zusammenpasst.

Ein Entwurf startet gewöhnlich mit einigen Lücken und Unbekannten:


```
- Einleitung
  - Hi, meine Name ist Dan
  - Ich arbeite an React
- Probleme
  - Wrapper hell
  - ???
- Demo
  - ??? Wie kann ich die Angst aus dem Weg schaffen, dass dies ein Breaking-Change sei
  - Zustand (State)
  - Effekte
    - ??? Welches Beispiel
    - Vielleicht die Abhängigkeiten erklären
  - eigene Hooks <----- "Aha" Moment
- Links
  - Betonen, dass es sich nicht um eien Breaking-Change handelt
- ???
  - etwas philosophisches und beruhigendes
```

Viele anfängliche Gedanken im Entwurf schaffen es nicht in den finalen Stand. Faktisch ist das Schreiben eines Entwurfs ein gutes Mittel, um die Ideen, die zu dem ["was" und "warum"](/preparing-for-tech-talk-part-2-what-why-and-how/) beitragen von den "Füllern", die entfernt werden sollten zu separieren.

Der Entwurf ist ein Arbeitsmittel. Er kann am Anfang ungenau sein. Ich optimiere den Entwurf kontinuierlich während ich an meinem Vortrag arbeite. Schließlich könnte es eher wie folgt aussehen:


```
- Einleitung
  - Hi, meine Name ist Dan
  - Ich arbeite an React
- Probleme
  - Wrapper hell
  - Große Komponenten
  - Reparatur der Einen zerstört eine andere
  - sollten wir aufgeben
    - lol Mixins?
- Kreuzung
  - vielleicht können wir das gar nicht fixen
  - aber wenn wir können?
  - wie haben einen Vorschlag
    - keine Breaking-Changes
- Demo
  - state Hook
  - mehr als nur eine state Hook
    - Regeln erwähnen
  - Durchführen einer Hook
  - Durchführen vom Aufräumen
  - eigene Hooks <----- "Aha" Moment
- Zusammenfassung
  - keine Breaking-Changes
  - Ihr könnt es jetzt ausprobieren
  - Link zum RFC
- Abmoderation
  - persönlich
  - Hook : Komponente :: Elektron : Atom
  - Logo + "Hooks waren schon die ganze Zeit da"
```

Aber manchmal fallen die Stücke erst nachdem alle Folien fertig sind zusammen.

**Der Entwurf hilft mir die Struktur verdaulich zu halten.** Für meine Vorträge halte ich mich oft an das Strukturmuster [“Hero’s Journey”](http://www.tlu.ee/~rajaleid/montaazh/Hero%27s%20Journey%20Arch.pdf), dass in vielen populären Kulturen zu finden ist, beispielsweise den Harry Potter Büchern. Du startest mit einem Konflikt (“Sirius ist hinter dir her”, “Todesesser zerbrechen den Quidditch Cup”, “Die Schlange nutzt einen zwielichtigen Schwur”, etc.). Dann existiert ein Setup (kaufe ein paar Bücher, lerne einige Zaubersprüche). Schließlich gibt es einen Adrenalinschub, wobei der Bösewicht besiegt wird. Dann sagt Dumbledore etwas paradoxes und wir alle gehen nach Hause.

Meine mentale Vorlage für Vorträge sieht in etwa so aus:

1. Etablierung von Konflikten oder einem Problem, um die Zuhörer zu begeistern.
2. Führe sie zu dem "Aha" Moment. (Das "was" meines Vortrags.)
3. Zusammenfassung, was wir getan haben, um die Probleme zu lösen.
4. Beenden mit etwas, dass emotional wirkt (Das "warum" meines Vortrags).
    - Dieser Part kommt besonders gut an, wenn hier eine Ebene oder Symmetrie existiert, die erst am Ende klar wird. Wenn ich [Gänsehaut](https://en.wikipedia.org/wiki/Frisson) bekomme, ist es gut.

Natürlich ist eine Struktur wie diese nur eine Form, dazu eine sehr oft genutzte. Somit ist es ganz von dir abhängig, es mit fesselndem Material auszufüllen and deine eigene Wendung einzubauen. Wenn der Inhalt des Vortrags selber nicht begeistert, wird es nicht helfen, diesen in Floskeln einzubauen.

**Der Entwurf hilft Inkonsistenz herauszufinden.** Als Beispiel, vielleicht benötigt eine Idee in der Mitte des Vortrags ein anderes Konzept, dass ich erst später einführe. Dann muss ich den Inhalt neu ordnen. Der Entwurf bietet mir hier eine Vogelperspektive aller Gedanken, die ich erwähnen möchte und stellt sicher, dass der Übergang zwischen ihnen passt und Sinn macht.

### Von unten-nach-oben: Die Sektion mit Adrenalin

Das Schreiben des Entwurfs ist ein von oben-nach-unten Prozess. Aber gleichzeitig starte ich an etwas konkretem von unten-nach-oben wie den Folien oder einer Demo.

**Im Speziellen versuche ich ein Proof of Concept des Adrenalinparts meines Vortrags so schnell wie möglich zu erstellen.**  Als Beispiel, es könnte dies ein Moment sein, wenn eine entscheidende Idee erklärt oder vorgstellt wurde. Wie werde ich diese erklären? Was genau werde ich sagen oder machen und wird dies genügen? Benötige ich Folien? Demos? Beides? Sollte ich Bilder benutzen? Animationen? Was ist die exakte Reihenfolge an Worten und Taten? Würde ich mir diesen Vortrag allein wegen dieser Erklärung ansehen wollen?

Dieser Teil ist der Schwerste, weil ich hier meistens viele Versionen erstelle, die ich wieder verwefe. Es benötigt eine spezielle geistige Verfassung, wobei ich mich tief fokussieren kann, was mir erlaubt dumme Dinge auszuprobieren und ich mich frei fühle, sie alle wieder zu verwefen.

Ich verbringe viel Zeit damit, Überschriften auszuwählen, die Ablaufplanung einer Live Demo herauszufinden, Animationen anzupassen und suche nach Memes. **Das Meiste dieser Arbeit werfe ich wieder weg** (beispielsweise lösche ich letztendlich wieder alle Memes), aber diese Phase definiert den Vortrag für mich. Mein Ziel ist es die nächste Route von *nicht wissen* zum *wissen* einer Idee zu finden - damit ich diese Reise später mit den Zuhörern teilen kann.

Nachdem ich mit dem Adrenalinpart meines Vortrags zufrieden bin, schaue ich, dass mein Entwurf weiterhin Sinn macht. An diesem Punkt merke ich oft, dass ich 60% meines vorherigen Entwurfs verwerfen kann und schreibe es neu mit einem Fokus auf eine kleinere Idee.

### Führe mehrere Probeläufe durch

Ich fahre fort mit sowohl oben-nach-unten Arbeiten (Entwurf), als auch unten-nach-oben Arbeiten (das Bauen konkreter Sektionen) bis es keine offenen Stellen mehr gibt. Wenn ich die erste Version des gesamten Vortrags verfasst habe, sperre ich mich in ein Zimmer ein und tue so, als würde ich den Vortrag zum ersten Mal halten. Dies ist chaotisch, ich stolpere viel, stoppe in der Mitte der Sätze und probiere unterschiedliche Sätze und so weiter - aber ich schaffe es durch den gesamten Vortrag.

Dies hilft mir zu messen, wie viel ich noch herausnehmen muss. Der erste Versuch dauert meist weitaus länger als mein gegebenes Zeitfenster, aber ich stelle oft Sektionen fest, die verwirrend waren. Diese nehme ich dann heraus, passe die Folien an, damit sie besser zu dem was ich sagen will passen und gehe in den nächsten Versuch.

Ich wiederhole diesen Prozess über mehrere Tage und überarbeite die Folien und Ablauf. Dies ist eine passende Zeit den Vortrag mit anderen Personen zu üben. Normalerweise starte ich mit einem Freund und später führe ich ein paar Probeläufe mit kleinen Zuschauemengen durch (maximal 15 Personen). Dies ist ein guter Weg frühes Feedback zu erhalten, aber am Wichtigsten ist es, dass ich mich an den Vortrag gewöhnen kann und lerne, mich beim Vortragen wohl zu fühlen.

Ich ziehe es vor keine kompletten Sätze oder Sprechernotizen zu schreiben. Diese stressen mich, weil ich mich unter Druck gesetzt fühle diesen zu folgen und habe Angst etwas zu vergessen. Stattdessen präferiere ich das Einstudieren meines Vortrags (von 3 bis 20 mal), dass der Satz zu jeder Folie mir einfach fällt, ohne dass ich allzuviel darüber nachdenken muss. Es ist weitaus einfacher eine Geschichte zu erzählen, die du schon oft erzählt hast.

---

In diesem Artikel habe ich beschrieben, wie ich den Inhalt meines Vortrags vorbereite. Im nächsten Artikel werde ich Tipps über mein Handeln am Tag der Präsentation teilen.

**Vorheriger Artikel der Serie: [Vorbereitung für Tech Vorträge, Part 2: Was, warum und wie](/preparing-for-tech-talk-part-2-what-why-and-how/)**.
