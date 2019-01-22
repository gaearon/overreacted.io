---
title: Otimizadas para Mudanças
date: '2018-12-12'
spoiler: O que torna uma API excelente?
---

O que torna uma API excelente?

Um *bom* design de API é marcante e claro. Ele estimula códigos legíveis, corretos e performáticos, e ajuda desenvolvedores a caírem no [poço de sucesso](https://blog.codinghorror.com/falling-into-the-pit-of-success/).

Eu chamo esses aspéctos do design de “primeira ordem” pois eles são as primeiras coisas nas quais os desenvolvedores de bibliotecas tendem a focar. Você pode ter que comprometer alguns deles e fazer trocas(*tradeoffs*) mas pelo menos eles estão sempre na sua cabeça.

Entretanto, a menos que você esteja lançando uma sonda pra Marte, seu código provavelmente vai mudar com o passar do tempo, assim como o código dos usuários da sua API.

Os melhores designers de API que eu conheço não se contentam apenas com os aspéctos de “primeira ordem” como legibilidade. Eles dedicam tanto quanto, senão mais, esforço no que eu chamo de design de API de “segunda ordem”: **Como o código que utiliza esta API irá evoluir com o tempo.**

Uma pequena mudança nos requisitos pode fazer o código mais elegante desmoronar.

APIs *excelentes* antecipam isso. Elas antecipam que você irá querer mover algum código. Copiar e colar alguma parte. Renomear algo. Unificar casos especiais em um assistente genérico reutilizável. Reverter uma abstração de volta em um caso específico. Adicionar um hack. Otimizar um gargalo. Jogar fora uma parte e começar de novo. Cometer um erro. Navegar entre a causa e efeito. Corrigir um bug. Revisar um ajuste.

APIs excelentes não só te fazem cair no poço de sucesso, elas te ajudam a *ficar* lá.

Elas são otimizadas para mudanças.
