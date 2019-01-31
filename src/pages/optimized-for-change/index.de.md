---
title: Optimiert für den Wandel
date: '2018-12-12'
spoiler: Was macht eine großartige API aus?
---

Was macht eine großartige API aus?

*Großartiges* API Design ist einprägsam und eindeutig. Es fördert lesbaren, korrekten und performanten Code und hilft Entwicklern in [die Grube des Erfolgs](https://blog.codinghorror.com/falling-into-the-pit-of-success/) zu fallen.

Ich nenne dies die Designaspekte der "ersten Ordnung", denn sie sind meist das Erste auf das sich Entwickler von Programmbibliotheken konzentrieren. Eventuell musst du Kompromisse eingehen oder einzelne Punkte vernachlässigen aber du solltest sie stets im Kopf behalten.

Allerdings, solange du keinen Rover zum Mars sendest, wird sich dein Code mit der Zeit verändern. Und das trifft auch auf den Code zu, welcher deine API konsumiert.

Die besten API-Designer, die ich kenne, hören nicht bei den Aspekten der ersten Ordnung auf, wie z.B. der Lesbarkeit. Sie widmen sich mindestens genauso dem, was ich das API-Design "zweiter Ordnung" nenne: **Wie sich Code, der diese API verwendet, im Laufe der Zeit entwickeln wird.**

Eine geringfügige Änderung der Anforderungen kann dazu führen, dass der eleganteste Code auseinanderfällt.

*Großartige* APIs sehen das voraus. Sie gehen bereits davon aus, dass du Code hin und her schieben wirst. Teile kopierst und wo anders wieder einfügst. Dinge umbennenst. Spezialfälle in einem allgemeinen Helfer zusammenführst. Eine Verallgemeinerung wieder zurück in ihre Spezialfälle dröselst. Einen Hack hinzufügst. Einen Flaschenhals optimierst. Einen Teil wegwirfst und ihn von vorne beginnst. Einen Fehler machst. Zwischen Ursache und Wirkung springst. Einen Fehler behebst. Und die Lösung überprüfst.

Großartige APIs lassen dich nicht nur in eine Erfolgsgrube fallen, sondern sorgen dafür, dass du dort auch *bleibst*.

Sie sind optimiert für den Wandel.
