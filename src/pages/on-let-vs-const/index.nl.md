---
title: Laten we het hebben over let vs const
date: '2019-12-22'
spoiler: Dus, welke moet ik gebruiken?
---

Mijn [vorige post](/what-is-javascript-made-of/) bevat deze paragraaf:

>**`let` vs `const` vs `var`**: Over het algemeen wil je `let` gebruiken. Als je het onmogelijk wil maken om iets toe te schrijven aan deze variabele kan je `const` gebruiken. (Sommige codebases en collega's zullen je op panische wijze aanspreken dat je beter `const` kan gebruiken als de variabele maar een keer wordt toegewezen aan een waarde).

Dit bleek ietwat controversieel en zorgde voor nogal wat discussies op Twitter en Reddit. Het leek erop dat het merendeel (of in ieder geval het meest vocale deel) vond dat je *zoveel mogelijk `const` moet gebruiken als dit mogelijk is* en alleen terug moet vallen op `let` als dit nodig is. Hier kan op worden toegezien door de [`prefer-const`](https://eslint.org/docs/rules/prefer-const) ESLint regel te gebruiken.

In deze post zal ik kort een aantal argumenten en tegenargumenten die ik ben tegengekomen samenvatten. Ook zal ik mijn eigen conclusie rondom dit onderwerp toelichten.

## Waarom `prefer-const`

* **Maar Een Manier Om Het Te Doen**: Het kan best wat mentale energie kosten om iedere keer te moeten kiezen tussen `let` en `const`. Een regel zoals "gebruik altijd `const` als het kan" zorgt ervoor dat je er niet meer over hoeft na te denken, en je linter kan het helpen af te dwingen.
* **Opnieuw Toewijzen van Variabelen Kan Bugs Veroorzaken**: In grotere functies is het makkelijker om niet door te hebben dat een variabele opnieuw aan een waarde wordt toegewezen. Dit kan bugs veroorzaken, vooral in closures. `const` geeft de gemoedsrust dat je altijd dezelfde waarde zal krijgen.
* **Leren Over Mutaties**: Nieuwe mensen die JavaScript leren raken soms in de war omdat ze denken dat `const` hetzelfde is als immutability. Echter, je zou kunnen zeggen dat het belangrijk is om het verschil te snappen tussen het toewijzen en het muteren van een variabele. Door `const` te prefereren word je geforceerd om het verschil tussen die twee goed te begrijpen.
* **Nutteloze Toewijzingen**: Soms kan een toewijzing totaal onlogisch zijn. Bijvoorbeeld bij het gebruiken van React Hooks: de waarde die je krijgt van een Hook zoals `useState` zijn meer een soort parameters. Ze werken in een richting. Als je een error ziet bij het toewijzen van die variabele, kan je sneller leren hoe de React data flow werkt.
* **Verbetering in Prestatie**: Er wordt regelmatig beweerd dat JavaScript engines code die `const` gebruikt sneller kunnen laten werken omdat de variabele niet opnieuw wordt toegewezen.

## Waarom geen `prefer-const`

* **Verlies van Doel**: Als we `const` forceren waar mogelijk, verliezen we de mogelijkheid om te communiceren of het *belangrijk* was om iets niet opnieuw toe te wijzen.
* **Verwarring met Immutability**: In iedere discussie over waarom je beter `const` kan gebruiken, is er wel iemand die het verward met immutability. Dit is opvallend omdat zowel het toewijzen als muteren de `=` operator gebruiken. Mensen krijgen vaak als reactie dat ze 'de taal gewoon moeten leren'. Echter, het tegenargument is dat als iets in een taal veel fouten creëert bij beginnende developers, het niet heel erg behulpzaam is. Jammer genoeg helpt het niet om fouten met mutaties te voorkomen.
* **Druk om Opnieuw Toewijzen te Voorkomen**: Een codebase die is gebaseerd op `const` forceert de developer om geen `let` te gebruiken voor op voorwaardes gebaseerde variabelen. Je kan bijvoorbeeld `const a = cond ? b : c` schrijven in plaats van een `if` conditie. Zelfs als zowel `b` als `c` beide ingewikkeld in elkaar zitten, en het moeilijk is ze een goede expliciete naam te geven.
* **Opnieuw Toewijzen Hoeft Geen Bugs te Veroorzaken**: Er zijn drie voorbeelden waar het opnieuw toewijzen van een variabele bugs kan veroorzaken: als de scope erg groot is (zoals in modules of grote functies), als de waarde een parameter is (dus als het onverwacht is dat het iets anders kan zijn dan is doorgegeven) en als een variabele is gebruikt binnen een nested functie. Echter, in veel codebases vallen variabelen niet in deze categorieën, en parameters kunnen vaak helemaal niet als `consts` worden gemarkeerd.
* **Geen Prestatie Verbetering**: Voor zover ik weet dat de JavaScript engines zich al bewust zijn van welke variabelen maar een keer worden toegewezen -- zelfs als je `var` of `let` gebruikt. Als we willen speculeren, kunnen we net zo goed speculeren dat extra checks prestaties kunnen verergeren in plaats van verbeteren. Maar serieus, engines zijn best slim.

## Mijn Conclusie

Het maakt mij niet uit.

Ik zou gewoon de conventie gebruiken die al aanwezig is in de codebase.

Als je het echt belangrijk vindt, gebruik dan een linter die dit automatisch checkt en correct oplost zodat het niet uitmaakt wat je schrijft in je code. Het wordt dan automatisch opgelost en zo hoeft het de code review niet te vertragen.

Ten slotte: vergeet niet dat linters er zijn om *jou* te helpen. Als een regel in een linter jou en je team irriteert, verwijder deze dan. Die regel hoeft de hoeveelheid frustratie niet waard te zijn. Leer van je fouten.
