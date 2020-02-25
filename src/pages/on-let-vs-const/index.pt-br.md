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

## Why Not `prefer-const`

* **Loss of Intent**: If we force `const` everywhere it can work, we lose the ability to communicate whether it was *important* for something to not be reassigned.
* **Confusion with Immutability**: In every discussion about why you should prefer `const`, someone always confuses with immutability. This is unsurprising, as both assignment and mutation use the same `=` operator. In response, people are usually told that they should "just learn the language". However, the counter-argument is that if a feature that prevents mostly beginner mistakes is confusing to beginners, it isn't very helpful. And unfortunately, it doesn't help prevent mutation mistakes which span across modules and affect everyone.
* **Pressure to Avoid Redeclaring**: A `const`-first codebase creates a pressure to not use `let` for conditionally assigned variables. For example, you might write `const a = cond ? b : c` instead of an `if` condition, even if both `b` and `c` branches are convoluted and giving them explicit names is awkward.
* **Reassignments May Not Cause Bugs**: There are three common cases when reassignments cause bugs: when the scope is very large (such as module scope or huge functions), when the value is a parameter (so it's unexpected that it would be equal to something other than what was passed), and when a variable is used in a nested function. However, in many codebases most variables won't satisfy either of those cases, and parameters can't be marked as constant at all.
* **No Performance Benefits**: It is my understanding that the engines are already aware of which variables are only assigned once -- even if you use `var` or `let`. If we insist on speculating, we could just as well speculate that extra checks can *create* performance cost rather than reduce it. But really, engines are smart.

## My Conclusion

I don't care.

I would use whatever convention already exists in the codebase.

If you care, use a linter that automates checking and fixing this so that changing `let` to `const` doesn't become a delay in code review.

Finally, remember that linters exist to serve *you*. If a linter rule annoys you and your team, delete it. It may not be worth it. Learn from your own mistakes.