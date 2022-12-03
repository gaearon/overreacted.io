---
title: 'Antes De Utilizar memo()'
date: '2021-02-23'
spoiler: "Otimizações de renderização que surgem naturalmente."
---

Há muitos artigos escritos sobre otimização de performance em React. No geral, se alguma atualização de estado está lenta, você precisa:  

1. Verificar que você está executando uma build de produção. (Builds de desenvolvimento são mais lentas intencionalmente, em casos extremos em uma ordem de magnitude.) 
2. Verificar que você não colocou o estado acima na arvore do que o necessário. (Por exemplo, colocar o estado de um campo de entrada de texto em uma store centralizada pode não ser a melhor idéia.)
3. Executar a ferramenta React DevTools Profiler para ver o que está sendo re-renderizado, e envelopar a subárvore mais caras com `memo()`. (E adicionar `useMemo()` onde for necessário.)

Esse ultimo passo é chato, especialmente para componentes intermediários, e idealmente um compilador faria isso por você. No futuro, pode ser que eles façam.

**Nesse artigo, eu quero compartilhar duas técnicas diferentes.** Elas são surpreendentemente simples, o quê faz as pessoas raramente entenderem porque elas melhoram a performance de renderização 

**Essas técnicas são complementares ao que você já sabe!** Elas não substituem `memo` ou `useMemo`, mas geralmente é bom testá-las primeiro.

## Um Componente (Artificialmente) Devagar 

Esse é um componente com um problema grave de performance de renderização:

```jsx
import { useState } from 'react';

export default function App() {
  let [color, setColor] = useState('red');
  return (
    <div>
      <input value={color} onChange={(e) => setColor(e.target.value)} />
      <p style={{ color }}>Hello, world!</p>
      <ExpensiveTree />
    </div>
  );
}

function ExpensiveTree() {
  let now = performance.now();
  while (performance.now() - now < 100) {
    // Atraso artificial -- não faz nada por 100ms
  }
  return <p>I am a very slow component tree.</p>;
}
```

*([Teste aqui](https://codesandbox.io/s/frosty-glade-m33km?file=/src/App.js:23-513))*

O problema é que sempre que `color` for alterado dentro de `App`, nós iremos re-renderizar `<ExpensiveTree />`, que nós atrasamos artificialmente para ser bem devagar.

Eu poderia [colocar `memo()` nele](https://codesandbox.io/s/amazing-shtern-61tu4?file=/src/App.js) e finalizar pelo dia, mas existem muitos artigos existentes sobre isso, então não gastarei tempo com isso. Eu quero mostrar duas soluções diferentes.

## Solução 1: Mover Estado Para Baixo 

Se você observar bem o código de renderização. Você vai perceber que apenas uma parte da árvore retornada se importa com o valor atual de `color`:

```jsx{2,5-6}
export default function App() {
  let [color, setColor] = useState('red');
  return (
    <div>
      <input value={color} onChange={(e) => setColor(e.target.value)} />
      <p style={{ color }}>Hello, world!</p>
      <ExpensiveTree />
    </div>
  );
}
```

Então vamos extrair essa parte para um componente `Form` e mover o estado _abaixo_ dentro dele:

```jsx{4,11,14,15}
export default function App() {
  return (
    <>
      <Form />
      <ExpensiveTree />
    </>
  );
}

function Form() {
  let [color, setColor] = useState('red');
  return (
    <>
      <input value={color} onChange={(e) => setColor(e.target.value)} />
      <p style={{ color }}>Hello, world!</p>
    </>
  );
}
```

*([Teste aqui](https://codesandbox.io/s/billowing-wood-1tq2u?file=/src/App.js:64-380))*

Agora se o valor de `color` for alterado, apenas `Form` re-renderiza. Problema resolvido. 

## Solução 2: Mover Conteúdo Para Cima

A solução acima não funciona se o estado for utilizado em algum lugar *acima* da árvore cara. Por exemplo, vamos supor que nós colocamos `color` na `<div>` *pai*:

```jsx{2,4}
export default function App() {
  let [color, setColor] = useState('red');
  return (
    <div style={{ color }}>
      <input value={color} onChange={(e) => setColor(e.target.value)} />
      <p>Hello, world!</p>
      <ExpensiveTree />
    </div>
  );
}
```

*([Teste aqui](https://codesandbox.io/s/bold-dust-0jbg7?file=/src/App.js:58-313))*

Agora parece que nós não podemos simplesmente "extrair" as partes que não utilizam `color` para outro componente, já que isso incluiria a `div` pai, que incluiria então `<ExpensiveTree />`. Não da para evitar utilizar `memo` dessa vez, certo? 

Ou será que nós podemos?

Brinque com esse ambiente de testes e veja se você consegue descobrir.

...

...

...

A resposta é surpreendentemente simples:

```jsx{4,5,10,15}
export default function App() {
  return (
    <ColorPicker>
      <p>Hello, world!</p>
      <ExpensiveTree />
    </ColorPicker>
  );
}

function ColorPicker({ children }) {
  let [color, setColor] = useState("red");
  return (
    <div style={{ color }}>
      <input value={color} onChange={(e) => setColor(e.target.value)} />
      {children}
    </div>
  );
}
```

*([Teste aqui](https://codesandbox.io/s/wonderful-banach-tyfr1?file=/src/App.js:58-423))*

Nós dividimos o componente `App` em dois. As partes que dependem de `color`, juntas com a própria variável `color`, foram movidos para dentro de `ColorPicker`.

As partes que não se importam com `color` continuaram dentro do componente `App` e são passadas para `ColorPicker` como conteúdo JSX, também conhecida como a propriedade `children`.

Quando o valor de `color` for alterado, `ColorPicker` re-renderizará. Mas ainda terá a mesma propriedade `children` que recebeu de `App` da última vez, então o React não irá revisitar essa subárvore.

E como resultado, `<ExpensiveTree />` não re-renderizará.

## Qual A Moral Da História?

Antes de aplicar otimizações como `memo` ou `useMemo`, talvez faça sentido verificar se você pode separar as partes que mudam das partes que não mudam.

A parte interessante dessas abordagens é que **elas não tem realmente algo a ver com performance, por si mesmo**. Usar a propriedade `children` para separar componentes geralmente fazem o fluxo de dados da sua aplicação mais fáceis de entender e reduzem o número de propriedades passadas abaixo na árvore. Melhorias de performance nesses casos é a cereja no topo do bolo, não o objetivo final.

Curiosamente, esse padrão também desbloqueia _mais_ benefícios de performance no futuro.

Por exemplo, quando [Componentes de Servidor](https://reactjs.org/blog/2020/12/21/data-fetching-with-react-server-components.html) estiverem estáveis e prontos para adoção, nosso componente `ColorPicker` poderia receber seus componentes `children` [do servidor](https://youtu.be/TQQPAU21ZUw?t=1314). Tanto o componente `<ExpensiveTree />` quanto suas partes poderiam ser executadas no servidor, e até mesmo uma atualização de estado de nível superior do React poderia "pular" essas partes no cliente. 

Isso é algo que nem mesmo `memo` poderia fazer! Mas de novo, essas abordagens são complementares. Não subestime mover o estado abaixo (e mover conteúdo para cima!)

Então, onde não for o suficiente, use a ferramenta Profiler e abuse desses memos Then, where it's not enough, use the Profiler and sprinkle those memo’s.

## Eu Já Não Li Sobre Isso Antes? 

[Sim, provavelmente.](https://kentcdodds.com/blog/optimize-react-re-renders)

Essa não é uma idéia nova. É uma consequência natural do modelo de composição do React. É simples o suficiente que acaba sendo subestimada, e merece um pouco mais de amor.
