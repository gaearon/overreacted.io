---
title: Sobre let vs const
date: '2019-12-22'
spoiler: Qual devo usar?
---

Meu [post anterior](/what-is-javascript-made-of/) inclui este parágrafo:

>**`let` vs `const` vs `var`**: Normalmente optará por `let`. Se você quer impedir atribuições para esta variável, pode usar `const`. (Algumas codebases e colegas de trabalho são minuciosos e te forçam a usar `const` quando tem apenas uma atribuição).

Isso acabou sendo muito polêmico, gerando discussões no Twitter e Reddit. Parece que a opinião da maioria (ou pelos menos, a opinião mais aclamada) é que alguém deveria *usar `const` sempre que possível,* usando `let` somente onde é necessário, podendo ser forçada a regra ESLint [`prefer-const`](https://eslint.org/docs/rules/prefer-const).

Neste post, resumirei brevemente alguns dos prós e contras que encontrei, bem como minha conclusão pessoal sobre esse assunto.

## Why `prefer-const`

* **One Way to Do It**: It is mental overhead to have to choose between `let` and `const` every time. A rule like "always use `const` where it works" lets you stop thinking about it and can be enforced by a linter.
* **Reassignments May Cause Bugs**: In a longer function, it can be easy to miss when a variable is reassigned. This may cause bugs. Particularly in closures, `const` gives you confidence you'll always "see" the same value.
* **Learning About Mutation**: Folks new to JavaScript often get confused thinking `const` implies immutability. However, one could argue that it's important to learn the difference between variable mutation and assignment anyway, and preferring `const` forces you to confront this distinction early on.
* **Meaningless Assignments**: Sometimes, an assignment doesn't make sense at all. For example, with React Hooks, the values you get from a Hook like `useState` are more like parameters. They flow in one direction. Seeing an error on their assignment helps you learn earlier about the React data flow.
* **Performance Benefits**: There are occasional claims that JavaScript engines could make code using `const` run faster due to the knowledge the variable won't be reassigned.

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