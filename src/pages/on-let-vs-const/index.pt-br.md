---
title: Sobre let vs const
date: '2019-12-22'
spoiler: Então, qual eu devo usar?
---

Meu [post anterior](/what-is-javascript-made-of/) incluiu este parágrafo:

>**`let` vs `const` vs `var`**: Geralmente você quer `let`. Se você quiser proibir atribuição para essa variável, você pode usar `const`. (Alguns códigos e colegas de trabalho são pedantes e forçam você a usar `const` quando há apenas uma atribuição.)

Isso acabou sendo muito controverso, causando discussões no Twitter e Reddit. Parece que a visão da maioria (ou pelo menos, a visão da maioria que se expressa) é que deve-se *usar `const` sempre que possível* e apenas recorrer ao `let` quando necessário, como pode ser imposto pela regra do ESLint [`prefer-const`](https://eslint.org/docs/rules/prefer-const).

Neste post, eu vou resumir brevemente alguns dos argumentos e contra-argumentos que eu encontrei, assim como minha conclusão pessoal sobre esse assunto.

## Porque Usar `prefer-const`

* **Uma maneira de fazer**: É uma sobrecarga mental ter que escolher entre `let` e `const` toda vez. Uma regra como "sempre use `const` onde funcionar" deixa você parar de pensar sobre isso e pode ser imposta por um linter.
* **Reatribuições Podem Causar Bugs**: Em uma função maior, é fácil de perder quando uma variável é reatribuída. Isso pode causar bugs. Particularmente em closures, `const` te dá confiança de que você sempre verá o mesmo valor.
* **Aprendendo Sobre Mutações**: O pessoal novo em JavaScript geralmente fica confuso pensando que `const` significa imutabilidade. Porém, pode-se argumentar que de qualquer forma é importante aprender a diferença entre mutação e atribuição de variável, e preferindo `const` te força a confrontar essa distinção mais cedo.
* **Atribuições Sem Sentido**: Algumas vezes, uma atribuição não faz sentido algum. Por exemplo, com React Hooks, os valores que você recebe de um Hook como `useState` são mais parecidos com parâmetros. Eles fluem em uma direção. Ver um erro em suas atribuições te ajuda a entender mais cedo sobre o fluxo de dados do React.
* **Benefícios de Performance**: Existem afirmações ocasionais de que as engines de JavaScript conseguem rodar código que usa `const` mais rápido devido ao conhecimento de que a variável não vai ser reatribuída.

## Porque Não Usar `prefer-const`

* **Perda do objetivo**: Se forçarmos `const` em qualquer lugar que funcionar, nós perdemos a habilidade de comunicar se era *importante* alguma coisa não ser reatribuída.
* **Confusão com Imutabilidade**: Em todas as discussões sobre porque você deve usar `const`, alguém sempre confunde com imutabilidade. Isso não é surpresa, já que atribuição e mutação usam o mesmo operador `=`. Em resposta, as pessoas geralmente são ditas para "simplesmente aprender a linguagem". Entretanto, o contra-argumento é que se o recurso que previne principalmente erros de iniciantes é confuso para os iniciantes, então ele não é de grande ajuda. E infelizmente, não ajuda a prevenir erros de mutação que se estendem pelos módulos e afetam a todos.
* **Pressão para Evitar Redeclaração**: Um código que prioriza `const` cria a pressão de não usar `let` para variáveis com atribução condicional. Por exemplo, você pode escrever `const a = cond ? b : c` em vez de uma condição `if`, mesmo que ambos os ramos `b` e `c` sejam complexos e dar nomes para eles explicitamente seja estranho.
* **Reatribuições Podem Não Causar Bugs**: Existem três casos comuns em que reatribuições causam bugs: quando o escopo é muito grande (como em módulos ou funções enormes), quando o valor é um parâmetro (então é inesperado que ele seja diferente do valor que foi passado), e quando a variável é usada em uma função aninhada. Entretanto, em vários códigos a maioria das variáveis não satisfazem nenhum desses casos, e parâmetros não podem ser marcados como constantes.
* **Sem Benefícios de Performance**: O meu entendimento é que as engines JavaScript já têm consciência de quais variáveis são atribuídas apenas uma vez -- mesmo se você usar `var` ou `let`. Se insistirmos em especular, também podemos especular que verificações extras podem *criar* custos de performance em vez de reduzi-los. Mas sinceramente, engines são espertas.
 
## Minha Conclusão

Eu não me importo.

Eu usaria qualquer convenção já existente no código.

Se você se importa, use um linter que automatize a verificação e correção disso, para que trocar `let` por `const` não se torne um atraso no code review.

Finalmente, lembre que linters existem para servir *você*. Se uma regra do linter incomoda você e seu time, delete-a. Ela pode não valer a pena. Aprenda com seus próprios erros.