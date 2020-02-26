---
title: Sobre let vs const
date: '2019-12-22'
spoiler: Qual devo usar?
---

Meu [post anterior](/what-is-javascript-made-of/) inclui este parágrafo:

>**`let` vs `const` vs `var`**: Normalmente, optará por `let`. Se você quer impedir atribuições para esta variável, pode usar `const`. (Algumas codebases e colegas de trabalho são minuciosos e te forçam a usar `const` quando tem apenas uma atribuição).

Isso acabou sendo muito polêmico, gerando discussões no Twitter e Reddit. Parece que a opinião da maioria (ou pelos menos, a opinião mais aclamada) é que alguém deveria *usar `const` sempre que possível,* usando `let` somente onde é necessário, podendo ser forçada a regra ESLint [`prefer-const`](https://eslint.org/docs/rules/prefer-const).

Neste post, resumirei brevemente alguns dos prós e contras que encontrei, bem como minha conclusão pessoal sobre esse assunto.

## Porquê `prefer-const`

* **Uma maneira de fazer**: É um estresse ter que escolher entre `let` e `const` toda vez. Uma regra como "sempre use `const` onde possível" permite que você pare de pensar nisso, podendo ser aplicada por um linter.
* **Reatribuições podem causar bugs**: Em uma função maior, é fácil se perder nas reatribuições de uma variável. Isso pode causar bugs. Especialmente em closures, o `const` lhe dá confiança que você sempre "verá" o mesmo valor.
* **Aprendendo sobre mutação**: Geralmente, iniciantes em JavaScript ficam confusos ao pensar que `const` implica imutabilidade. No entanto, alguém poderia argumentar que é importante aprender a diferença entre mutação variável e atribuição de qualquer maneira, e preferir `const` força você a enfrentar essa distinção desde o início.
* **Atribuições sem sentido**: Às vezes, uma atribuição não faz sentido. Por exemplo, com React Hooks, os valores obtidos de um Hook como `useState` são mais parecidos com os parâmetros. Eles fluem em uma direção. Ver um erro na atribuição ajuda a aprender mais cedo sobre o fluxo de dados do React.
* **Benefícios de desempenho**: Há afirmações ocasionais de que as JavaScript engines podem tornar o código que usa `const` mais rápido devido ao conhecimento de que a variável não pode ser reatribuída.

## Porquê não `prefer-const`

* **Perda de propósito**: Se forçarmos `const` em todos os lugares em que possa funcionar, perderemos a capacidade de comunicar se era *importante* que algo não fosse reatribuído.
* **Confusão com imutabilidade**: Em toda discussão sobre por que você deve preferir `const`, alguém sempre confunde com imutabilidade. Isso não é surpreendente, pois a atribuição e a mutação usam o mesmo operador `=`. Em resposta, geralmente é dito às pessoas que elas deveriam "apenas aprender a linguagem". No entanto, o contra-argumento é que, se um recurso que evita principalmente erros de iniciantes é confuso para iniciantes, isso não ajuda muito. E, infelizmente, isso não ajuda a evitar erros de mutação que se estendem e afetam todos os módulos.
* **Pressão para evitar redeclaração**: Uma codebase `const`-first cria uma pressão para não usar `let` para variáveis com valores atribuídos condicionalmente. Por exemplo, você pode escrever `const a = cond ? b : c` em vez de uma condição `if`, mesmo se `b` e `c` forem complexos e dar nomes explícitos seja estranho.
* **Reatribuições podem não causar bugs**: Existem três casos comuns em que as reatribuições causam erros: quando o escopo é muito grande (como o escopo de módulo ou funções enormes), quando o valor é um parâmetro (portanto, é inesperado que seja igual a algo diferente do que foi passado), e quando uma variável é usada em funções aninhadas. No entanto, em muitas codebases, a maioria das variáveis não atendem a nenhum desses casos e os parâmetros não podem ser marcados como constantes.
* **Sem benefícios de desempenho**: Entendo que as engines já estejam cientes de quais variáveis são atribuídas apenas uma vez - mesmo se você usar `var` ou `let`. Se insistirmos em especular, poderíamos também especular que verificações extras podem *gerar* custo de desempenho em vez de reduzi-lo. Mas, na verdade, as engines são inteligentes.

## Minha conclusão

Eu não ligo.

Eu usaria qualquer convenção já existente na codebase.

Se você se importa, use um linter que automatize a verificação e a correção para que alterar de `let` para `const` não se torne um atraso na revisão do código.

Por fim, lembre-se que existem linters para servir *você*. Se uma regra incomodar você e sua equipe, exclua-a. Pode não valer a pena. Aprenda com seus próprios erros.