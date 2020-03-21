---
title: Geoptimaliseerd voor verandering
date: '2018-12-12'
spoiler: Wat maakt een goede API?
---

Wat maakt een goede API?

Een *goed* API ontwerp is herkenbaar en ondubbelzinnig. Het zet aan tot leesbare, correcte en performante code en helpt ontwikkelaars [op weg naar succes](https://blog.codinghorror.com/falling-into-the-pit-of-success/).

Ik noem dit ontwerpaspecten van de "eerste orde" omdat dit zaken zijn waar een library-ontwikkelaar zich eerst op concentreert. Over een aantal ervan moet je mogelijk een compromis sluiten en afwegingen maken, maar je hebt ze in ieder geval altijd in je gedachten.

Tenzij je echter een rover naar Mars stuurt, zal je code waarschijnlijk veranderen in de loop van de tijd. En dat geldt ook voor de code van je API-gebruikers.

De beste API-ontwerpers die ik ken, stoppen niet bij de aspecten van de "eerste orde" zoals leesbaarheid. Ze besteden evenveel, zo niet meer, aandacht aan wat ik API-ontwerp van de "tweede orde" noem: **hoe code die deze API gebruikt gaandeweg zou kunnen evolueren.**

Een kleine wijziging aan de vereisten kan de meest elegante code uit elkaar doen vallen.

*Goede* API's anticiperen daarop. Ze verwachten dat je bepaalde code wil verplaatsen. Een deel wil kopiëren en plakken. Hernoemen. Speciale gevallen in een generieke en herbruikbare helper wil samenvoegen. Een abstractie wil terugdraaien naar concrete gevallen. Een hack wil toevoegen. En knelpunt wil optimaliseren. Een onderdeel wil weggooien om opnieuw te starten. Een fout wil maken. Wil navigeren tussen oorzaak en gevolg. Een bug wil verhelpen. Een aanpassing wil nakijken.

Goede API's helpen je niet alleen op weg naar succes, ze helpen je daar ook te *blijven*.

Ze zijn geoptimaliseerd voor verandering.
