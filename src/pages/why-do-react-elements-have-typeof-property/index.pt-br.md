---
title: Por quê os Elementos React possuem uma propriedade $$typeof
date: '2018-12-03'
spoiler: É algo relacionado a segurança.
---

Podemos achar que estamos escrevendo JSX:

```jsx
<marquee bgcolor="#ffa7c4">hi</marquee>
```

Mas na verdade, estamos chamando uma função:

```jsx
React.createElement(
  /* type */ 'marquee',
  /* props */ { bgcolor: '#ffa7c4' },
  /* children */ 'hi'
)
```

E essa função retorna um objeto. Nós chamamos esse objeto de *elemento* React. Ele diz ao React o que renderizar a seguir. Seus componentes retornam uma árvore deles.

```jsx{9}
{
  type: 'marquee',
  props: {
    bgcolor: '#ffa7c4',
    children: 'hi',
  },
  key: null,
  ref: null,
  $$typeof: Symbol.for('react.element'), // 🧐 O que é isso
}
```

Se você já utilizou o React, deve estar familiarizado com as propriedades `type`, `props`, `key`, e `ref`. **Mas o que é `$$typeof`? E por que ele tem um `Symbol()` como valor?**

Essa é mais uma daquelas coisas que você **não** precisa saber para usar o React, mas que o irá fazer se sentir bem ao aprender. Também há algumas dicas sobre segurança nesse artigo que você possa querer saber. Talvez um dia você irá criar sua própria biblioteca de UI e tudo isso irá ser útil. Eu espero sinceramente que sim.

---

Antes das bibliotecas de UI se tornarem comuns e adicionarem proteção básica, era comum uma aplicação construir HTML e inserir ele no DOM:

```jsx
const messageEl = document.getElementById('message');
messageEl.innerHTML = '<p>' + message.text + '</p>';
```

Isso funciona bem, exceto quando seu `message.text` é algo como `'<img src onerror="roubarSuaSenha()">'`. **Você não quer que coisas escritas por estranhos apareçam literalmente no HTML renderizado pela sua aplicação.**

(Curiosidade: se você apenas fizer renderização no cliente, uma tag `<script>` não iria permitir que o código JavaScript fosse executado. Mas [não deixe que isso](https://gomakethings.com/preventing-cross-site-scripting-attacks-when-using-innerhtml-in-vanilla-javascript/) te leve a ter uma falsa sensação de segurança.)

Para proteger de tais ataques, você pode usar APIs seguras como `document.createTextNode()` ou `textContent` que apenas trabalham com texto. Você também pode preventivamente substituir caracteres potencialmente perigosos como `<`, `>` e outros em qualquer texto que seja fornecido pelos usuários.

Ainda assim, o custo de um erro é grande e é complicado lembrarmos disso toda vez que precisamos trabalhar com um texto escrito pelo usuário ao renderizar algo. **Esse é o motivo em que bibliotecas modernas como o React fazem essa sanitização em textos por padrão:**

```jsx
<p>
  {message.text}
</p>
```

Se `message.text` é um texto malicioso com uma `<img>` ou alguma outra tag, ele não irá se tornar uma tag `<img>` real. O React irá sanitizar o conteúdo e *depois* inserir ele no DOM. Então ao invés de ver a tag `<img>` você verá apenas a sua *markup*.

Para renderizar HTML puro dentro de um elemento React, você deve escrever `dangerouslySetInnerHTML={{ __html: message.text }}`. **O fato disso ser complicado de se digitar é uma *feature*.** É algo feito para ser facilmente visível em revisões de código e em auditorias em base de códigos.

---

**Isso quer dizer que o React é totalmente seguro contra ataques de injeção? Não.** O HTML e o DOM podem ser alvos de [diversos tipos de ataques](https://github.com/facebook/react/issues/3473#issuecomment-90594748) que são difíceis demais ou muito lentos para que o React ou outras bibliotecas de UI possam mitigar contra. A maioria dos outros tipos de ataque envolvem atributos. Por exemplo, se você renderizar `<a href={user.website}>`, cuidado com o website do usuário que pode ser `'javascript: roubarSuaSenha()'`. Fazer spread (*spread operator*) de dados inseridos pelo usuário como `<div {...userData}>` é algo raro mas também perigoso.

O React [pode](https://github.com/facebook/react/issues/10506) providenciar mais proteção ao passar do tempo, mas na maioria das vezes isso é consequência de problemas do servidor que [deveriam](https://github.com/facebook/react/issues/3473#issuecomment-91327040) ser corrigidos lá de toda forma.

Ainda assim, sanitizar conteúdo de texto é uma primeira linha de defesa razoável que pode capturar muitos ataques potenciais. Não é legal saber que um código assim é seguro?

```jsx
// Sanitizado automaticamente
<p>
  {message.text}
</p>
```
**Bom, isso não é sempre verdade também.** E é aí onde o `$$typeof` entra.

---

Elementos React são objetos simples:

```jsx
{
  type: 'marquee',
  props: {
    bgcolor: '#ffa7c4',
    children: 'hi',
  },
  key: null,
  ref: null,
  $$typeof: Symbol.for('react.element'),
}
```

Enquanto você normalmente cria eles com `React.createElement()`, isso não é obrigatório. Há casos de uso válido para que o React consiga trabalhar com objetos de elementos escritos como eu fiz acima. Claro, você provavelmente não *quer* escrever eles assim - mas isso [pode ser](https://github.com/facebook/react/pull/3583#issuecomment-90296667) útil para um compilador de otimização, passando elementos UI entre *workers*, ou para desacoplar JSX do React.

Contudo, **se seu servidor tem uma falha que deixa o usuário armazenar um objeto JSON arbitrário** quando o código no cliente espera por uma string, isso pode se tornar um problema:

```jsx{2-10,15}
// Servidor pode ter uma falha que deixa o usuário armazenar um JSON
let expectedTextButGotJSON = {
  type: 'div',
  props: {
    dangerouslySetInnerHTML: {
      __html: '/* coloque o código malicioso aqui */'
    },
  },
  // ...
};
let message = { text: expectedTextButGotJSON };

// Perigoso na React 0.13
<p>
  {message.text}
</p>
```

Nesse caso, o React 0.13 seria [vulnerável](http://danlec.com/blog/xss-via-a-spoofed-react-element) a um ataque XSS. Para explicar melhor, novamente, **esse ataque depende de uma falha existente no servidor**. Ainda assim, o React poderia fazer um trabalho melhor de proteger as pessoas contra isso. E a partir do React 0.14, ele faz.

A correção no React 0.14 foi [rotular todo elemento React com um Symbol](https://github.com/facebook/react/pull/4832):

```jsx{9}
{
  type: 'marquee',
  props: {
    bgcolor: '#ffa7c4',
    children: 'hi',
  },
  key: null,
  ref: null,
  $$typeof: Symbol.for('react.element'),
}
```

Isso funciona porque não há como colocar um `Symbol` em um JSON. **Então mesmo que o servidor tenha uma falha de segurança e retorne um JSON ao invés de um texto, esse JSON não teria um `Symbol.for('react.element')`. **O React irá checar `element.$$typeof`, e irá recusar a processar o elemento caso não possua a proprieade ou ela seja inválida.

O que torna o uso do `Symbol.for()` tão legal especificamente é que **Symbols são globais entre ambientes como *iframes* e *workers*.** Portanto essa correção não impede a passagem de elementos confiáveis entre diferentes partes da aplicação, mesmo em condições mais exóticas. Similarmente, mesmo que tenha múltiplas cópias do React na página, elas podem ainda "concordar" em um valor válido da propriedade `$$typeof`.

---

E os navegadores que [não têm suporte](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Symbol#Browser_compatibility) para Symbols?

Infelizmente, eles não ganham essa proteção extra. O React ainda assim inclui a propriedade `$$typeof` no elemento para manter a consistência, mas é [atribuída um número a ela](https://github.com/facebook/react/blob/8482cbe22d1a421b73db602e1f470c632b09f693/packages/shared/ReactSymbols.js#L14-L16) — `0xeac7`.

Por quê esse número especificamente? `0xeac7` parece um pouco com "React".
