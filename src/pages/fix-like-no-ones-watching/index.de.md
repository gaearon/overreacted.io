---
title: 'Repariere was das Zeug hält'
date: '2019-02-15'
spoiler: Die andere Art von technischen Schulden.
---

Manch technische Schulden sind absolut offensichtlich.

Eine unordentliche Datenstruktur kann zu Spaghetti-Code führen. Durch wiederholte Anforderungsänderungen können sich veraltete Lösungsansätze im Code einnisten. Manchmal ist man im Stress, manchmal ist man einfach nur schluderig.

Diese Arten von technischen Schulden lassen sich gut diskutieren, da sie schnell und einfach sichtbar werden. Sie offenbaren sich in Form von Bugs, Performanceeinbußen und durch Schwierigkeiten beim Hinzufügen von neuen Features.

Es gibt eine andere, noch heimtückischere Art der technischen Schuld.

Vielleicht ist die Testsuite ein *bisschen* langsam. Nicht kriechend langsam - gerade so, dass du es nicht für nötig erachtest es in dein Backlog aufzunehmen. Vielleicht vermeidest du auch einen zusätzlichen Release, weil du dem Deploymentscript nicht traust. Möglicherweise machen es dir Abstraktionsebenen zu schwer, um Performance-Regressionen zu lokalisieren. Dadurch lässt du schließlich ein TODO im Code stehen. Manchmal sind Unit-Tests einfach zu starr gestrickt, dass man spontane Verbesserrungen gerne bis nach dem Release der geplanten Features aufschiebt.

Nichts von alledem entpuppt sich als blankes Tabu. Das ein oder andere könnte vielleicht als geringes Übel angesehen werden. Es fühlt sich mühevoll an ihnen überhaupt geringe Aufmerksamkeit zu schenken. Würden diese Dinge *wirklich* zu Problemen führen, hätte man sich dann nicht um sie gekümmert, trotz der Mühe?

Und somit werden sie niemals angegangen. Sie allein wirken nicht wichtig genug. **Der Aufwand hat sie zunichtegemachte.** Einige dieser Nachgiebigkeiten könnten keine Konsequenzen nach sich ziehen. Andere könnten dein Projekt auf den Kopf stellen.

Man kann nie wissen. Daher sollte man stets auch relativ kleine Reibungspunkte versuchen zu reduzieren. Als würde des Projektes Schicksal davon abhängen. Genau das tut es nämlich.

Repariere was das Zeug hält.