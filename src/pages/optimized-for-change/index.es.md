---
title: Optimizadas para el cambio
date: '2018-12-12'
spoiler: ¿Qué hace a una gran API?
---

¿Qué hace a una gran API?

Un *buen* diseño de API es memorable e inequívoco. Fomenta el código legible, correcto y de rendimiento y ayuda a los desarrolladores a caer en [el abismo del éxito](https://blog.codinghorror.com/falling-into-the-pit-of-success/).

Llamo a estos aspectos de diseño "de primer orden" porque son lo primero en que un desarrollador tiende a enfocarse. Puede que tengas que comprometer algunos de ellos y hacer concesiones, pero al menos siempre están en tu mente.

Sin embargo, a menos que estés enviando un rover a Marte, tu código probablemente cambiará con el tiempo y también lo hará el código de quienes consumen tu API.

Los mejores diseñadores de APIs que conozco no se detienen en los aspectos "de primer orden" como la legibilidad. Le dedican el mismo o mayor esfuerzo a lo que yo llamo diseño de APIs "de segundo orden": **cómo el código que usa esta API evolucionará con el tiempo.**

Un mínimo cambio en los requerimientos puede hacer al código más elegante caerse a pedazos.

Las *grandes* APIs se anticipan a eso. Anticipan que querrás mover código. Copiar y pegar alguna parte. Renombrarla. Unificar casos especiales en un helper genérico y reutilizable. Deshacer una abstracción a casos específicos. Añadir un hack. Optimizar un cuello de botella. Descartar una parte y hacerla de cero. Cometer un error. Conducir entre la causa y el efecto. Arreglar un bug. Revisar el arreglo.

Las grandes APIs no solo te ayudan a caer en el abismo del éxito, sino que te ayudan a *permanecer* ahí.

Están optimizadas para el cambio.
