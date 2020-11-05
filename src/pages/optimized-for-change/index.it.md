---
title: Ottimizzate per il Cambiamento
date: '2018-12-12'
spoiler: Cosa rende grandi delle API?
---

Cosa rende grandi delle API?

Un *buon* design di API è facile da memorizzare e non ambiguo. Incoraggia codice leggibile, corretto e performante ed aiuta gli sviluppatori a entrare nell' [olimpo del successo](https://blog.codinghorror.com/falling-into-the-pit-of-success/).

Chiemo questi aspetti del design di "primo ordine", perché sono i primi su cui gli sviluppatori di librerie tendono a focalizzarsi. Potresti dover scendere a compromessi su alcuni di essi, fare delle rinunce, ma comunque sono sempre lì, ben chiari in testa.

Tuttavia, a meno che tu non stia mandando un rover su Marte, il tuo codice probabilmente cambierà nel corso del tempo, come allo stesso modo cambieranno gli utilizzatori delle tue API.

I migliori designer di PAI che conosco non si limitano ad aspetti del "primo ordine" come la leggibilità. Dedicano lo stesso sforzo, se non maggiore, a quelli che chiamo design di "secondo ordine" delle API: **come il codice che usa quelle API si evolverà nel tempo**.

Un piccolo cambiamento nei requisiti può far sgretolare il più elegante dei codici.

Delle *grandi* API anticipano ciò. Anticipano che vorrai spostare del codice. Copiarlo e incollarlo da qualche parte. Rinominarlo. Unificare casi speciali in helper generici riutilizzabili. Disfare un'astrazione nei suoi casi specifici. Aggiungere un hack. Ottimizzare un collo di bottiglia. Buttare una parte e ricominciarla da capo. Navigare tra causa ed effetto. Correggere un bug. Rivedere la correzione.

Le grandi API non solo di fanno entrare nell'olimpo del successo, ma ti aiutano a rimanerci.

Sono ottimizzate per il cambiamento.
