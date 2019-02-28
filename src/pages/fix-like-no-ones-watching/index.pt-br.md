---
title: 'Corrija como se ninguém estivesse olhando'
date: '2019-02-15'
spoiler: O outro tipo de débito técnico
---

Existe débito técnico que é obviamente visível.

Uma estrutura de dados inadequada pode resultar em um código complexo. Quando os requisitos ficam mudando, o código pode conter retalhos de soluções anteriores. Às vezes o código é escrito com pressa ou de forma desleixada.

Esse tipo de débito técnico é fácil de discutir porque é descaradamente visível. Ele se manifesta como bugs, problemas de performance e dificuldade em adicionar funcionalidades.

Existe um outro tipo de débito técnico, mais traiçoeiro ainda.

Talvez sua suíte de testes esteja *um pouquinho* lenta. Não tão lerda - mas o suficiente para que você não ligue em priorizar um bug existente e adiar a correção da performance dos testes. Talvez você não confie no script de deploy, tal que prefira pular um release extra. Talvez as camadas de abstração deixem tão difícil de achar um erro de performance que você prefere deixar um "TODO" no código. Às vezes os testes unitários são tão rígidos que você prefira não tentar uma ideia nova até que lançe as funcionalidades previstas.

Nada disso é considerado como um grave problema. No máximo, podem parecer apenas distrações. Parece vago reclamar sobre elas. No final do dia, se elas realmente importassem, você teria feito algo apesar do esforço, não teria?

E assim essas coisas nunca são feitas. Elas não parecem importantes o bastante por si próprias. **O esforço as matou.**. Algumas dessas explorações poderiam ter sido feitas sem nenhuma consequência. Algumas poderiam redefinir seu projeto.

Você nunca sabe. É por isso que você deve ativamente reduzir os pequenos bloqueios. Como se o destino do seu projeto dependesse delas. Porque depende.

Corrija como se ninguém estivesse olhando.
