---
title: Como o setState sabe o que fazer?
date: '2018-12-09'
spoiler: Injeção de dependencia é legal se você não tem que pensar sobre isso.
---

Quando você chama `setState` dentro de um componente, o que você pensa que acontece?

```jsx{11}
import React from 'react';
import ReactDOM from 'react-dom';

class Button extends React.Component {
  constructor(props) {
    super(props);
    this.state = { clicked: false };
    this.handleClick = this.handleClick.bind(this);
  }
  handleClick() {
    this.setState({ clicked: true });
  }
  render() {
    if (this.state.clicked) {
      return <h1>Thanks</h1>;
    }
    return (
      <button onClick={this.handleClick}>
        Click me!
      </button>
    );
  }
}

ReactDOM.render(<Button />, document.getElementById('container'));
```

Claro, React re-renderiza o componente com o próximo estado `{ clicked: true }` e atualiza o DOM para corresponder o elemento `<h1>Thanks</h1>`.

Parece simples. Mas espere, *React* faz isso? Ou *React DOM*?

Atualizando o DOM parece algo de responsabilidade do React DOM. Mas nós estamos chamando `this.setState()` que não é algo oriundo do React DOM. E nossa classe base React.Component é definida dentro do próprio React.

Então como pode `setState()` dentro do `React.Component` atualizar o DOM?

**Aviso: Assim como a [maioria](/why-do-react-elements-have-typeof-property/) das [outras](/how-does-react-tell-a-class-from-a-function/) [postagens](/why-do-we-write-super-props/) neste blog, você não *precisa* saber nada disso para ser produtivo com o React. Esse post é para quem gosta de ver o que está por trás da cortina. Completamente opcional!**

---

Podemos pensar que a classe `React.Component` contém a lógica de atualização do DOM.

Mas se fosse esse o caso, como pode `this.setState()` funcionar em outros ambientes? Por exemplo, os componentes nos aplicativos React Native também estendem o `React.Component`. Eles chamam de `this.setState()` exatamente como fizemos acima, e ainda o React Native funciona com views nativas do Android e iOS em vez do DOM.

Você também pode estar familiarizado com o React Test Renderer ou Shallow Renderer. Ambas as estratégias de teste permitem renderizar componentes normais e chamar `this.setState()` dentro deles. Mas nenhum deles trabalha com o DOM.

Se você usou renderizadores como [React Art](https://github.com/facebook/react/tree/master/packages/react-art), você também pode saber que é possivél usar mais de um renderizadores na página. (Por exemplo, Art components trabalham dentro da árvore do React DOM). Isso faz com que um sinalizador global ou variável seja insustentável.

Então de alguma forma **`React.Component` delega a manipulação de atualização de estado para a plataforma específica do código.** Depois nós podemos entender como isso acontece, vamos nos aprofundar em como os pacotes são separados e por quê.

---

Há um equívoco comum de que o “motor” do React vive dentro do package do React. E isso não é uma verdade.

Um fato, todo desde a [separação](https://reactjs.org/blog/2015/07/03/react-v0.14-beta-1.html#two-packages) no React 0.14, o pacote do `react` intencionalmente expõem apenas APIs para *definir* componentes. A maioria das *implementações* do React vive dentro dos “renderizadores”.


`react-dom`, `react-dom/server`, `react-native`, `react-test-renderer`, `react-art` são alguns dos exmplos de renderizadores (e você pode [construir seu próprio](https://github.com/facebook/react/blob/master/packages/react-reconciler/README.md#practical-examples)).

É por isso que o pacote do `react` é útil independente de qual plataforma você segmentar. Todos suas exportações, como os `React.Component`, `React.createElement`, `React.Children` e (eventualmente) [Hooks](https://reactjs.org/docs/hooks-intro.html), são independentes de uma plataforma específica. Se você executar React DOM, React DOM Server, ou React Native, seus componente importariam e usariam eles da mesma forma.

Em contraste, os pacotes de renderizadores expõem APIs específicas da plataforma, como `ReactDOM.render()`, que permitem montar uma hierarquia React em um nó do DOM. Cada renderizador fornece uma API como essa. Idealmente, a maioria dos *componentes* não precisam importar nada de um renderizador. Isso os mantém mais portáteis.

**O que a maioria das pessoas imaginam é como o “motor” do React está dentro de cada renderizador individual.** Muitos renderizadores incluem uma cópia do mesmo código — nós o chamamos de [“reconciliador”](https://github.com/facebook/react/tree/master/packages/react-reconciler). Uma [etapa de compilação](https://reactjs.org/blog/2017/12/15/improving-the-repository-infrastructure.html#migrating-to-google-closure-compiler) suaviza o código do reconciliador junto com o código do renderizador em um único bundle altamente otimizado para melhor desempenho. (O código copiado geralmente não é bom para o tamanho do bundle, mas a grande maioria dos usuários do React precisa apenas de um renderizador por vez, como `react-dom`.)

A conclusão aqui é que o pacote `react` permite que você *use* os recursos do React, mas não sabe nada sobre *como* eles são implementados. Os pacotes renderizadores (`react-dom`, `react-native`, etc) fornecem a implementação dos recursos do React e da lógica específica da plataforma. Parte desse código é compartilhada ("reconciliador"), mas isso é um detalhe individual de implementação dos renderizadores .

---

Agora nós sabemos porque *ambos* pacotes `react` e `react-dom` precisam estar atualizados para novos recursos. Por exemplo, quando React 16.3 adicionou Context API, `React.createContext()` foi exposto no pacote do React.

Mas na realidade o recurso do contenxt `React.createContext()` não foi *implementado*. Por exemplo, a implementação precisaria ser diferente entre React DOM e React DOM Server. Então `createContext()` retorna um objeto simples:


```jsx
// A bit simplified
function createContext(defaultValue) {
  let context = {
    _currentValue: defaultValue,
    Provider: null,
    Consumer: null
  };
  context.Provider = {
    $$typeof: Symbol.for('react.provider'),
    _context: context
  };
  context.Consumer = {
    $$typeof: Symbol.for('react.context'),
    _context: context,
  };
  return context;
}
```
Quando você usa `<MyContext.Provider>` ou `<MyContext.Consumer>` no código, o *renderizador* que decide como lidar com eles. React DOM pode rastrear valores de context de uma maneira, mas o React DOM Server pode fazer isso de maneira diferente.

**Então se você atualizar o `react` para 16.3+, mas não atualizar o `react-dom`, você estaria usando um renderizador que ainda não reconhece os tipos especial Provider e Consumer.** Isso é o porque um aviso do `react-dom` [aparecerá dizendo que esses tipos são invalidos](https://stackoverflow.com/a/49677020/458193).

O mesmo embargo se aplica para o React Native. Contudo, ao contrário do React DOM, uma nova versão do React não “força” imediatamente uma nova versão do React Native. Eles tem um calendário de lançamentos independentes. O código do renderizador atualizado é [sincronizado separadamente](https://github.com/facebook/react-native/commits/master/Libraries/Renderer/oss) no repositório do React Native em algumas semanas posterior. É por isso que os recursos ficam disponíveis no React Native em um cronograma diferente do que no React DOM.

---

Ok, então agora nós sabemos que o pacote do `react` não contém nada interessante, e que a implementação vive dentro dos renderizadores como `react-dom`, `react-native`, e assim por diante. Mas isso não responde nossa questão. Como o `setState()` dentro do `React.Component` "conversa" como renderizador certo?

**A resposta é que cada renderizador seta um campo especial quando a classe foi criada.** Esse campo é chamado de `updater`. Isso não é algo que *você* definiria — em vez disso, isso é algo que o React DOM, React DOM Server ou React Native é setado depois de ter criado uma instância de uma classe:


```jsx{4,9,14}
// Inside React DOM
const inst = new YourComponent();
inst.props = props;
inst.updater = ReactDOMUpdater;

// Inside React DOM Server
const inst = new YourComponent();
inst.props = props;
inst.updater = ReactDOMServerUpdater;

// Inside React Native
const inst = new YourComponent();
inst.props = props;
inst.updater = ReactNativeUpdater;
```

Olhando para a [implementação do `setState` dentro do `React.Component`](https://github.com/facebook/react/blob/ce43a8cd07c355647922480977b46713bd51883e/packages/react/src/ReactBaseClasses.js#L58-L67), todo trabalho é delego para o renderizador que criou essa instância do componente:


```jsx
// A bit simplified
setState(partialState, callback) {
  // Use the `updater` field to talk back to the renderer!
  this.updater.enqueueSetState(this, partialState, callback);
}
```

React DOM Server [pode querer ignorar](https://github.com/facebook/react/blob/ce43a8cd07c355647922480977b46713bd51883e/packages/react-dom/src/server/ReactPartialRenderer.js#L442-L448) a atualização do state e avisar você, enquanto React DOM e React Native deixariam suas cópias do reconciliador [lidar com isso](https://github.com/facebook/react/blob/ce43a8cd07c355647922480977b46713bd51883e/packages/react-reconciler/src/ReactFiberClassComponent.js#L190-L207).

E assim é como `this.setState()` pode atualizar o DOM mesmo que esteja definido no pacote React. Ele lê `this.updater`, que foi definido pelo React DOM, e permite que o React DOM agende e cuide da atualização

---

Nós agora sabemos sobre classes, mas o que acontecer com Hooks?

Quando as pessoas dão suas primeiras olhadas para a [proposta da API do Hooks](https://reactjs.org/docs/hooks-intro.html), elas muitas vezes se perguntam: como o `useState` “ sabe o que fazer "? A suposição é de que é algo mais “mágico” do que uma classe `React.Component` com `this.setState()`.

Mas nós vimos hoje, a classe que implementa o `setState()` pode parecer uma ilusão. Ela não faz nada, exceto encaminhar a chamada para o renderizador atual. E `useState` Hook faz [exatamente a mesma coisa](https://github.com/facebook/react/blob/ce43a8cd07c355647922480977b46713bd51883e/packages/react/src/ReactHooks.js#L55-L56).

**Em vez de um campo updater, os Hooks usam um objeto “dispatcher”.** Quando você chama `React.useState()`, `React.useEffect()`, ou outro Hook interno, essas chamadas são encaminhadas para o dispatcher atual.


```jsx
// In React (simplified a bit)
const React = {
  // Real property is hidden a bit deeper, see if you can find it!
  __currentDispatcher: null,

  useState(initialState) {
    return React.__currentDispatcher.useState(initialState);
  },

  useEffect(initialState) {
    return React.__currentDispatcher.useEffect(initialState);
  },
  // ...
};
```

E renderizadores individuais setão o dispatcher antes de renderizar seu componente:

```jsx{3,8-9}
// In React DOM
const prevDispatcher = React.__currentDispatcher;
React.__currentDispatcher = ReactDOMDispatcher;
let result;
try {
  result = YourComponent(props);
} finally {
  // Restore it back
  React.__currentDispatcher = prevDispatcher;
}
```

Por exemplo, a implementação do React DOM Server está [aqui](https://github.com/facebook/react/blob/ce43a8cd07c355647922480977b46713bd51883e/packages/react-dom/src/server/ReactPartialRendererHooks.js#L340-L354), e a implementação do reconciliador compartilhada pelo React DOM e React Native está [aqui](https://github.com/facebook/react/blob/ce43a8cd07c355647922480977b46713bd51883e/packages/react-reconciler/src/ReactFiberHooks.js).

É por isso que um renderizador como `react-dom` precisa acessar o mesmo pacote `react` que você chama de Hooks. Caso contrário, seu componente não "verá" o expedidor! Isso pode não funcionar quando você tem [várias cópias do React](https://github.com/facebook/react/issues/13991) na mesma árvore de componentes. No entanto, isso sempre levou a bugs obscuros, fazendo com que os Hooks o obrigassem a resolver a duplicação de pacotes antes que isso lhe custasse caro.

Embora não encorajamos isso, você pode substituir tecnicamente o dispatcher para casos avançados de uso de ferramentas. (Eu menti sobre o nome `__currentDispatcher` mas você pode encontrar o nome real no repositório React). Por exemplo, o React DevTools [usará um dispatcher especial](https://github.com/facebook/react/blob/ce43a8cd07c355647922480977b46713bd51883e/packages/react-debug-tools/src/ReactDebugHooks.js#L203-L214) para introspecção da árvore de Hooks e capturando rastreamentos de pilha JavaScript. *Não repita isso em casa.*

Isso também significa que os Hooks não estão inerentemente ligados ao React. Se, no futuro, mais bibliotecas quiserem reutilizar o Hooks, em teoria, o despachante pode passar para um pacote separado e ser exposto como uma API de primeira classe com um nome menos “assustador”. Na prática, preferimos evitar a abstração prematura até que seja necessário.

Tanto o campo `updater` quanto o objeto `__currentDispatcher` são formas de um princípio genérico de programação chamado *injeção de dependência*. Em ambos os casos, os renderizadores “injetam” implementações de recursos como 'setState' no pacote genérico React para manter seus componentes mais declarativos.

Você não precisa pensar em como isso funciona quando você for programar com React. Gostaríamos que os usuários do React passassem mais tempo pensando no código do aplicativo do que conceitos abstratos, como a injeção de dependência. Mas se você já se perguntou como `this.setState()` ou `useState()` sabe o que fazer, espero que isso ajude.

---
