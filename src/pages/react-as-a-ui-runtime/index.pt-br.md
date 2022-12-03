---
title: React como um ambiente de execução de Interfaces
date: '2019-02-02'
spoiler: Uma descrição aprofundada do modelo de programação do React.
---

Muitos tutoriais introduzem React como uma biblioteca para criação de Interface com o Usuário (_UI_ em inglês). Isso faz sentido porque React *é* uma biblioteca de UI. É, literalmente, o que diz o slogan!

![Captura de tela da home do React: "A JavaScript library for building user interfaces"](./react.png)

Já escrevi sobre os desafios de se criar [interfaces de usuário](/the-elements-of-ui-engineering/). Porém, esse post é sobre React de uma maneira diferente - mais como [programar um ambiente de execução](https://en.wikipedia.org/wiki/Runtime_system).

**Esse post não vai te ensinar nada sobre a criação de interfaces com o usuário.** Entretando, ele pode te ajudar a entender o modelo de programação do React com mais profundidade.

---

**Nota: Se você está _aprendendo_ React, leia a [documentação](https://reactjs.org/docs/getting-started.html#learn-react) em vez desse post.

<font size="60">⚠️</font>

**Esse é um aprofundamento - ESSE NÃO É um post amigável para iniciantes.** Nesse post, descrevo a maior parte do modelo de programação do React a partir dos seus princípios. Não explico como utilizá-lo - apenas como funciona.

É voltado aos programadores experientes e ao pessoal que trabalha com outras bibliotecas de UI e me perguntaram sobre o custo-benefício de algumas escolhas no React. Espero que você ache-o útil!

**Muitas pessoas tem sucesso usando React por anos sem pensar na maioria desses tópicos.** Isso é, definitivamente, uma visão de programador sobre React em vez de uma [visão de designer](http://mrmrs.cc/writing/developing-ui/). Mas não acho prejudicial ter material para as duas.

With that disclaimer out of the way, let’s go!

Com esse aviso dado, vamos lá!

---

## Árvore do Host

Some programs output numbers. Other programs output poems. Different languages and their runtimes are often optimized for a particular set of use cases, and React is no exception to that.

Alguns programas geram números. Outros programas geram poemas. Diferentes linguagens e seus ambientes de execução são frequentemente otimizados para um conjunto particular de casos de uso, e o React não é uma exceção a isso.

Programas em React geralmente produzem **uma árvore que pode mudar com o passar do tempo**. Pode ser uma [árvore DOM](https://www.npmjs.com/package/react-dom), uma [hierarquia iOS](https://developer.apple.com/library/archive/documentation/General/Conceptual/Devpedia-CocoaApp/View%20Hierarchy.html), uma árvore de [primitivas de PDF](https://react-pdf.org/), ou mesmo [objetos JSON](https://reactjs.org/docs/test-renderer.html). Entretanto, normalmente, nós desejamos representar uma UI com isso. Nós chamamos de "árvore do *host*" porque ela é parte do *ambiente que hospeda* fora do React - como o DOM ou o iOS. A árvore do host geralmente possui [sua](https://developer.mozilla.org/en-US/docs/Web/API/Node/appendChild) [própria](https://developer.apple.com/documentation/uikit/uiview/1622616-addsubview) API imperativa. React é uma camada sobre ela.

Então para que o React é útil? De maneira bem abstrata, ele te ajuda a escrever programas que manipulam uma árvore do host complexa de maneira previsível em resposta a eventos externos como interações, respostas de rede, temporizadores e por aí vai.

Uma ferramenta especializada funciona melhor do que uma genérica quando ela pode impor algumas coisas e se beneficiar dessas limitações. O React aposta em dois princípios:

* **Estabilidade.** A árvore do host é relativamente estável e muitas atualizações não alteram radicalmente sua estrutura geral. Se uma aplicação rearranjasse todos os seus elementos interativos em uma combinação diferente a cada segundo, ela seria bem difícil de usar. Para onde foi aquele botão? Por que minha tela está dançando?

* **Regularidade.** A árvore do host pode ser quebrada em diferentes padrões de UI que se comportam de maneira consistente (como botões, listas, avatares) em vez de formas aleatórias.

**Acontece que esses princípios são verdadeiros para a maioria das UIs.** Contudo, React não é apropriado quando não existem "padrões" estáveis na saída do programa. Por exemplo, React pode te ajudar a escrever um cliente para o Twitter, mas não será muito útil para um [protetor de tela de pipas 3D](https://www.youtube.com/watch?v=Uzx9ArZ7MUU).

## Instâncias do Host

A árvore do host consiste em nós. Vamos chamá-los de "instâncias do host".

No ambiente do DOM, as instâncias do host são nós DOM comuns - como os objetos que você recebe quando chama `document.createElement('div')`. No iOS, as instâncias do host podem ser valores que identificam unicamente uma visão nativa do JavaScript.

Instâncias do host tem suas propriedades (ex: `domNode.className` ou `view.tintColor`). Elas também podem conter outras instâncias como filhas.

Isso não tem nada a ver com React - Estou descrevendo os ambientes dos hosts.

Geralmente, existe uma API para manipular instâncias do host. Por exemplo, o DOM provê APIs como `appendChild`, `removeChild`, `setAttribute` e por aí vai. Em aplicações React, geralmente não se chama essas APIs. Esse é o trabalho do React.

## Renderizadores

Um *renderizador* ensina o React a conversar com um ambiente host específico e a gerencias suas instâncias. React DOM, React Native e mesmo [Ink](https://mobile.twitter.com/vadimdemedes/status/1089344289102942211) são renderizadores React. Você também pode [criar seu próprio renderizador React](https://github.com/facebook/react/tree/master/packages/react-reconciler).

Renderizadores React podem funcionar de duas maneiras diferentes.

A grande maioria dos renderizadores são escritos para usar o modo "mutação". Esse modo é como o DOM funciona: nós podemos criar um nó, determinar suas propriedades e, depois, adicionar ou remover seus filhos. As instâncias do host são completamente mutáveis.

O React também pode funcionar em um modo ["persistente"](https://en.wikipedia.org/wiki/Persistent_data_structure). Esse modo é para ambientes host que não proveem métodos como `appendChild()` e, em vez disso, clonam a árvore pai e sempre substituem as filhas mais acima. Imutabilidade no nível da árvore torna a _multi-threading_ mais fácil.

Como um usuário do React, você nunca precisou pensar sobre esses modos. Apenas quero ressaltar que o React não é apenas um adaptador de um modo para o outro. Sua utilidade é ortogonal ao paradigma de baixo nível da API visual utilizada.

## Elementos React

No ambiente do host, uma instância (como um nó DOM) é o menor bloco. No React, o menor bloco é um *elemento React*.

Um elemento React é um objeto JavaScript simples. Ele pode *descrever* uma instância do host.

```jsx
// JSX é um açúcar sintático para esses objetos.
// <button className="blue" />
{
  type: 'button',
  props: { className: 'blue' }
}
```

Um elemento React é leve e não possui instâncias do host atreladas a ele. Novamente, isso é apenas uma *descrição* do que você deseja ver na tela.

Assim como as instâncias do host, elementos React podem formar uma árvore:

```jsx
// JSX é um açúcar sintático para esses objetos.
// <dialog>
//   <button className="blue" />
//   <button className="red" />
// </dialog>
{
  type: 'dialog',
  props: {
    children: [{
      type: 'button',
      props: { className: 'blue' }
    }, {
      type: 'button',
      props: { className: 'red' }
    }]
  }
}
```

*(Nota: omiti [algumas propriedades](/why-do-react-elements-have-typeof-property/) que não são importantes para essa explicação.)*

Entretanto, lembre-se de que **elementos React não tem sua identidade persistida.** Eles são sempre recriados e dispensados.

Elementos React são imutáveis. Por exemplo, você não pode alterar os filhos ou uma propriedade de um elemento React. Se você deseja renderizar algo diferente depois, você tem de *descrevê-lo* com uma nova árvore de elementos React criadas do zero.

Gosto de pensar em elementos React como sendo quadros de um filme. Eles capturam como a UI deveria parecer em algum ponto específico do tempo. Eles não se alteram.

## Ponto de entrada

Cada elemento React tem seu "ponto de entrada". A API é o que nos permite indicar ao React que renderize uma árvore particular de elementos React dentro de um _container_ de instâncias do host.

Por exemplo, o ponto de entrada do React DOM é `ReactDOM.render`:

```jsx
ReactDOM.render(
  // { type: 'button', props: { className: 'blue' } }
  <button className="blue" />,
  document.getElementById('container')
);
```

Quando dizemos `ReactDOM.render(reactElement, domContainer)`, nós queremos dizer: **"Querido React, faça a árvore do host `domContainer` ser equivalente ao meu `reactElement`."**

O React olhará para o `reactElement.type` (`'button'`, no nosso exemplo) e pedirá ao renderizador React DOM para criar uma instância do host para ele e determinar as propriedades:

```jsx{3,4}
// Em algum lugar do renderizador ReactDOM (simplificado)
function createHostInstance(reactElement) {
  let domNode = document.createElement(reactElement.type);
  domNode.className = reactElement.props.className;
  return domNode;
}
```

No nosso exemplo, o React vai, efetivamente, fazer isso:

```jsx{1,2}
let domNode = document.createElement('button');
domNode.className = 'blue';

domContainer.appendChild(domNode);
```

Se o elemento React tem elementos filhos em `reactElement.props.children`, o React também vai criar instâncias do host recursivamente para eles na primeira renderização.

## Reconciliação

O que acontece se chamarmos `ReactDOM.render()` duas vezes no mesmo _container_?

```jsx{2,11}
ReactDOM.render(
  <button className="blue" />,
  document.getElementById('container')
);

// ... depois ...

// Isso deve *substituir* a instância do botão
// ou apenas atualizar uma propriedade numa já existente?
ReactDOM.render(
  <button className="red" />,
  document.getElementById('container')
);
```

Novamente, o trabalho do React é *fazer com que a árvore do host seja equivalente àquela provida pela àrvore de elementos do React*. O processo de entender *o que* fazer com a árvore da instância em resposta à nova informação é chamada, algumas vezes, de [reconciliação](https://reactjs.org/docs/reconciliação.html).

Existem duas maneiras de fazer isso. A maneira simplificada do React poderia remover toda a árvore existente e recriar uma do zero:

```jsx
let domContainer = document.getElementById('container');
// Limpa a árvore
domContainer.innerHTML = '';
// Cria uma nova árvore de instâncias
let domNode = document.createElement('button');
domNode.className = 'red';
domContainer.appendChild(domNode);
```

Porém, no DOM, essa maneira é lenta e perde informações importantes como foco, seleção, estado de _scroll_ e por aí vai. Em vez disso, nós queremos que o React faça algo parecido com isso:

```jsx
let domNode = domContainer.firstChild;
// Atualiza a instância existente
domNode.className = 'red';
```

Em outras palavras, o React precisa decidir quando _atualizar_ uma instância existente para se igualar a um novo elemento React e quando criar uma _nova_ instância.

Isso levanta a questão da *identidade*. Um elemento React pode ser diferente sempre, mas e quando ele se refere, conceitualmente, à mesma instância do host?

No nosso exemplo, isso é simples. Nós renderizávamos um `<button>` como o primeiro (e único) filho, e nós queríamos renderizar um `<button>` no mesmo lugar novamente. Nós já temos uma instância `<button>` no host, então por que recriá-la? Vamos apenas reusá-la.

Isso está bem próximo de como o React pensa sobre o problema.

**Se o tipo de um elemento no mesmo lugar da árvore é "igual" na renderização anterior e na próxima, o React reutiliza a instância existente.**

Aqui está um exemplo com comentários mostrando, basicamente, o que o React faz:

```jsx{9,10,16,26,27}
// let domNode = document.createElement('button');
// domNode.className = 'blue';
// domContainer.appendChild(domNode);
ReactDOM.render(
  <button className="blue" />,
  document.getElementById('container')
);

// Pode reusar a instância do host? Sim! (button -> button)
// domNode.className = 'red';
ReactDOM.render(
  <button className="red" />,
  document.getElementById('container')
);

// Posso reusar a instância? Não! (button -> p)
// domContainer.removeChild(domNode);
// domNode = document.createElement('p');
// domNode.textContent = 'Hello';
// domContainer.appendChild(domNode);
ReactDOM.render(
  <p>Hello</p>,
  document.getElementById('container')
);

// Posso reusar a instância? Sim! (p -> p)
// domNode.textContent = 'Goodbye';
ReactDOM.render(
  <p>Goodbye</p>,
  document.getElementById('container')
);
```

A mesma heurística é utilizada para árvores filhas. Por exemplo, quando nós atualizamos uma `<dialog>` com dois `<button>`s dentro, o React primeiro decide se vai reusar `<dialog>` e, depois, repete esse procedimento de decisão para cada filha.

## Condições

Se o React reusar instâncias do host apenas quando os tipos dos elementos se "equivalem" entre atualizações, como podemos renderizar conteúdo condicional?

Digamos que desejamos, inicialmente, exibir apenas um _input_, e, em seguida, renderizar uma mensagem antes dele:

```jsx{12}
// Primeira renderização
ReactDOM.render(
  <dialog>
    <input />
  </dialog>,
  domContainer
);

// Segunda renderização
ReactDOM.render(
  <dialog>
    <p>Acabei de ser adicionado aqui!</p>
    <input />
  </dialog>,
  domContainer
);
```

Nesse exemplo, a instância `<input>` do host seria recriada. O React caminharia na árvore de elementos, comparando-os com a versão anterior:

* `dialog -> dialog`: Pode reusar a instância? **Sim - o tipo é o mesmo.**
 * `input -> p`: Pode reusar a instância? **Não, o tipo foi alterado!** É necessário remover a instância existente de `input` e criar uma nova instância de `p`.
 * `(nothing) -> input`: É necessário criar uma nova instância `input` do host.

Então, efetivamente, o código de atualização executado pelo React seria:

```jsx{1,2,8,9}
let oldInputNode = dialogNode.firstChild;
dialogNode.removeChild(oldInputNode);

let pNode = document.createElement('p');
pNode.textContent = 'Acabei de ser adicionado aqui!';
dialogNode.appendChild(pNode);

let newInputNode = document.createElement('input');
dialogNode.appendChild(newInputNode);
```

Isso não é bom porque *conceitualmente* o `<input>` não foi *substituído* por `<p>` - ele apenas foi movido de lugar. Nós não desejamos perder sua seleção, foco, estado e conteúdo devido à recriação do DOM.

Enquanto esse problema possui um ajuste fácil (que comentaremos sobre ele em um minuto), isso geralmente não acontece em aplicações React. É interessante ver o porquê.

Na prática, você raramente chamaria `ReactDOM.render` diretamente. Em vez disso, aplicações React tendem a ser divididas em funções como essa:

```jsx
function Form({ showMessage }) {
  let message = null;
  if (showMessage) {
    message = <p>Acabei de ser adicionado aqui!</p>;
  }
  return (
    <dialog>
      {message}
      <input />
    </dialog>
  );
}
```

Esse exemplo não sofre do problema que acabamos de descrever. Pode ser mais fácil ver o motivo se utilizarmos a notação de objetos em vez de JSX. Veja a árvore do elemento filho `dialog`:

```jsx{12-15}
function Form({ showMessage }) {
  let message = null;
  if (showMessage) {
    message = {
      type: 'p',
      props: { children: 'Acabei de ser adicionado aqui!' }
    };
  }
  return {
    type: 'dialog',
    props: {
      children: [
        message,
        { type: 'input', props: {} }
      ]
    }
  };
}
```

**Independentemente de `showMessage` ser `true` ou `false`, o `<input>` é o segundo filho e sua posição na árvore não é alterada entre as renderizações.**

Se `showMessage` for alterado de `false` para `true`, o React caminharia a árvore de elementos, comparando-a com a versão anterior:

* `dialog -> dialog`: Pode reusar a instância? **Sim - o tipo é o mesmo.**
  * `null -> p`: É necessário inserir uma nova instância `p`.
  * `input -> input`: Pode reusar a instância? **Sim - o tipo é o mesmo.**

E o código executado pelo React seria similar a esse:

```jsx
let inputNode = dialogNode.firstChild;
let pNode = document.createElement('p');
pNode.textContent = 'Acabei de ser adicionado aqui!';
dialogNode.insertBefore(pNode, inputNode);
```

Nenhum estado do _input_ é perdido agora.

## Listas

Geralmente, comparar o tipo do elemento na árvore na mesma posição é suficiente para decidir entre reusar ou recriar uma instância correspondente.

Mas isso só funciona bem se as posições dos filhos são estáticas e não reordenam. No nosso exemplo acima, mesmo que `message` pudesse ser um "buraco", nós ainda saberíamos que o _input_ vai depois de _message_, e não existem outras filhas.

Com listas dinâmicas, não podemos ter certeza se a ordem é sempre a mesma:

```jsx
function ShoppingList({ list }) {
  return (
    <form>
      {list.map(item => (
        <p>
          Você comprou {item.name}
          <br />
          Insira quantos você deseja: <input />
        </p>
      ))}
    </form>
  )
}
```

Se a `list` dos nossos itens de compra é sempre reordenada, o React verá que todos os elementos filhos `p` e `input` têm o mesmo tipo e não saberá como movê-los. (Da perspectiva do React, os *próprios itens* foram alterados, e não sua ordem.)

O código executado pelo React para reordenar os 10 itens seria algo assim:

```jsx
for (let i = 0; i < 10; i++) {
  let pNode = formNode.childNodes[i];
  let textNode = pNode.firstChild;
  textNode.textContent = 'Você comprou ' + items[i].name;
}
```

Então, em vez de *reordená-los*, o React iria, efetivamente, *atualizar* cada item. Isso poderia criar problemas de desempenho e, possivelmente, bugs. Por exemplo, o conteúdo do primeiro _input_ seria refletido no primeiro _input_ *depois* da ordenação - mesmo que, conceitualmente, eles se refiram a produtos diferentes da sua lista de compras!

**É por isso que o React te incomoda para especificar a propriedade especial chamada `key` sempre que você inclui um vetor de elementos na sua saída:**

```jsx{5}
function ShoppingList({ list }) {
  return (
    <form>
      {list.map(item => (
        <p key={item.productId}>
          Você comprou {item.name}
          <br />
          Insira quantos você deseja: <input />
        </p>
      ))}
    </form>
  )
}
```

Uma `key` indica ao React que ele deve considerar um item como sendo *conceitualmente* o idêntico mesmo que ele tenha *posições* diferentes dentro do seu pai entre as renderizações.

Quando o React vê `<p key="42">` dentro de um `<form>`, ele vai conferir se a renderização anterior também continha `<p key="42">` dentro do mesmo `<form>`. Isso funciona mesmo se os filhos de `<form>` tiverem sua ordem alterada. O React reutilizará as instâncias anteriores com a mesma _key_ se ela existir, e reordenar os filhos de acordo com isso.

Note que a `key` é relevante apenas dentro de um pai particular de um elemento React como um `<form>`. O React não vai tentar "igualar" elementos com a mesma chave entre pais diferentes. (O React não tem suporte idiomático para mover uma instância de um host entre diferentes pais sem recriá-las.)

E qual é um bom valor para `key`? Uma maneira fácil de responder a isso é perguntando: **quando _você_ diria que um item é "igual" mesmo que a ordem seja alterada?** Por exemplo, na nossa lista de compras, o ID do produto é seu identificador único entre os irmãos.

## Componentes

Já vimos funções que retornam elementos React:

```jsx
function Form({ showMessage }) {
  let message = null;
  if (showMessage) {
    message = <p>Acabei de ser adicionado aqui!</p>;
  }
  return (
    <dialog>
      {message}
      <input />
    </dialog>
  );
}
```

Elas são chamadas *componentes*. Vamos criar nossa própria "caixa de ferramentas" de botões, avatares, comentários e por aí vai. Componentes são o pão e a manteiga do React.

Componentes recebem um único argumento - um objeto _hash_. Ele contém "props" (abreviação de "propriedades"). Aqui, `showMessage` é uma prop. Elas são como argumentos nomeados.

## Pureza

Assume-se que componentes React são puros em relação às suas props.

```jsx
function Button(props) {
  // 🔴 Não funciona
  props.isActive = true;
}
```

No geral, mutações não são idiomáticas no React. (Discutiremos mais sobre a maneira idiomática de atualizar a UI em resposta a eventos mais tarde.)

Entretanto, *mutações locais* são perfeitamente aceitáveis:

```jsx{2,5}
function FriendList({ friends }) {
  let items = [];
  for (let i = 0; i < friends.length; i++) {
    let friend = friends[i];
    items.push(
      <Friend key={friend.id} friend={friend} />
    );
  }
  return <section>{items}</section>;
}
```

Criamos `items` *enquanto renderizamos* e nenhum outro componente o "viu", então podemos modificá-los o tanto quanto quisermos antes de passá-los adiante como parte do resultado da renderização. Não é necessário contorcer seu código para evitar mutações locais.

De forma semelhante, iniciações preguiçosas são aceitáveis apesar de não serem completamente "puras":

```jsx
function ExpenseForm() {
  // Ok se ela não afeta outros componentes:
  SuperCalculator.initializeIfNotReady();

  // Continue a renderização...
}
```

Enquanto chamar um componente múltiplas vezes é seguro e não afeta a renderização de outros componentes, o React não se importa se é 100% puro no sentido da Programação Funcional (FP em inglês). [Idempotência](https://stackoverflow.com/questions/1077412/what-is-an-idempotent-operation) é mais importante para o React do que a pureza.

Dito isso, efeitos colaterais que são diretamente visíveis para o usuário não são permitidos em componentes React. Em outras palavras, simplesmente *chamar* um componente não deveria, por si só, produzir uma mudança na tela.

## Recursão

Como *usamos* componentes em outros componentes? Componentes são funções então *poderíamos* chamá-los:

```jsx
let reactElement = Form({ showMessage: true });
ReactDOM.render(reactElement, domContainer);
```

Contudo, essa *não é* a maneira idiomática de se usar componentes no ambiente de execução React.

Em vez disso, a maneira idiomática de se usar um componente é com o mesmo mecanismo que já vimos aqui antes - elementos React. **Isso significa que você não deve chamar diretamente a função do componente, mas deixar que o React faça isso por você**:

```jsx
// { type: Form, props: { showMessage: true } }
let reactElement = <Form showMessage={true} />;
ReactDOM.render(reactElement, domContainer);
```

E, em algum lugar dentro do React, seu componente será chamado:

```jsx
// Em algum lugar dentro do React
let type = reactElement.type; // Form
let props = reactElement.props; // { showMessage: true }
let result = type(props); // O que quer que Form retorne
```

Os nomes dos componentes são, por convenção, escritos com letra maiúscula. Quando a transformação do JSX vê `<Form>` em vez de `<form>`, ela cria o objeto `type` como um identificador em vez de uma string:

```jsx
console.log(<form />.type); // string 'form'
console.log(<Form />.type); // função Form
```

Não existe um mecanismo registrador global - literalmente nos referimos ao nome `Form` quando digitamos `<Form />`. Se `Form` não existe no escopo local, você verá um erro JavaScript como normalmente veria com nomes de variável.

**Ok, então o que o React faz quando o tipo de um elemento é uma função? Ele chama seu componente e pergunta qual elemento _aquele_ componente quer renderizar.**

Esse processo continua recursivamente e é descrito em mais detalhes [aqui](https://reactjs.org/blog/2015/12/18/react-components-elements-and-instances.html). Em resumo, é parecido com isso:

- **Você:** `ReactDOM.render(<App />, domContainer)`
- **React:** Ei, `App`, o que você renderiza?
  - `App`: Eu renderizo `<Layout>` com `<Content>` dentro.
- **React:** Ei, `Layout`, o que você renderiza?
  - `Layout`: Eu renderizo meus filhos em uma `<div>`. Meu filho é `<Content>`, então acho que isso vai dentro da `<div>`.
- **React:** Ei, `<Content>`, o que você renderiza?
  - `Content`: Eu renderizo um `<article>` com um texto e um `<Footer>` dentro.
- **React:** Ei, `<Footer>`, o que você renderiza?
  - `Footer`: Eu renderizo um `<footer>` com um texto.
- **React:** Ok, aqui está:

```jsx
// Estrutura DOM resultante
<div>
  <article>
    Um texto
    <footer>Mais algum texto</footer>
  </article>
</div>
```

É por isso que dizemos que a reconciliação é recursiva. Quando o React caminha na árvore de elementos, ele pode encontrar um elemento cujo `type` é um componente. Ele vai chamá-lo e continuar a descer pela árvore dos elementos React retornados. Eventualmente, vamos ficar sem componentes, e o React vai saber o que alterar na árvore do host.

As mesmas regras de reconciliação já discutidas aplicam-se aqui também. Se o `type` em uma posição (determinada pelo índice e a `key` opcional) for alterada, o React vai jogar fora as instâncias do host dentro dela e recriá-las.

## Inversão de controle

Você deve estar se perguntando: por que apenas não chamamos os componentes diretamente? Por que escrever `<Form />` em vez de `Form()`?

**O React pode fazer seu trabalho melhor se "souber" a respeito dos seus componentes do que apenas ver a árvore de elementos React após chamá-los recursivamente.**

```jsx
// 🔴 O React não tem ideia de que Layout e Article existem.
// Você está chamando eles.
ReactDOM.render(
  Layout({ children: Article() }),
  domContainer
)

// ✅ O React sabe que Layout e Article existem.
// O React chama eles.
ReactDOM.render(
  <Layout><Article /></Layout>,
  domContainer
)
```

Esse é um exemplo clássico de [inversão de controle](https://en.wikipedia.org/wiki/Inversion_of_control). Existem algumas propriedades interessantes que temos ao permitir que o React controle a chamada dos nossos componentes:

* **Componentes se tornam mais do que apenas funções.** O React pode ampliar os componentes com funcionalidades como *estado local* que é ligado à identidade do componente na árvore. Um bom ambiente de execução provê abstrações fundamentais que comparam o problema em questão. Como já mencionamos, o React é orientado especificamente para programas que renderizam árvores de UI e respondem à interações. Se você chamasse os componentes diretamente, teria de implementar essas funcionalidades você mesmo.

* **Tipos de componentes participam da reconciliação.** Ao permitir que o React chame seus componentes, você também diz mais a ele sobre a estrutura conceitual da sua árvore. Por exemplo, quando você move a renderização do `<Feed>` para a página `<Profile>`, o React não vai tentar reusar instâncias do host dentro dela - assim como quando você substitui `<button>` por um `<p>`. Todo o estado vai embora - o que é geralmente bom quando você renderiza uma _view_ conceitualmente diferente. Você não deveria querer preservar o estado do _input_ entre `<PasswordForm>` e `<MessengerChat>` mesmo que a posição do `<input>` na árvore se "alinhasse" entre eles acidentalmente.

* **O React pode atrasar a reconciliação.** Se o React controla as chamadas aos seus componentes, ele pode fazer muitas coisas interessantes. Por exemplo, ele pode deixar o navegador realizar algumas tarefas entre as chamadas de componentes para que a re-renderização de uma árvore grande de componentes [não bloqueie a thread principal](https://reactjs.org/blog/2018/03/01/sneak-peek-beyond-react-16.html). Orquestrar isso manualmente sem reimplementar uma grande parte do React é difícil.

* **Uma história de debugging melhor.** Se componentes são cidadãos de primeira classe que a biblioteca está ciente, podemos construir [ricas ferramentas para desenvolvedores](https://github.com/facebook/react-devtools) para introspecção em tempo de desenvolvimento.

O último benefício do React chamando seus componentes é a *avaliação preguiçosa*. Vamos ver o que isso significa.

## Avaliação Preguiçosa

Quando nós chamamos funções em JavaScript, os argumentos são avaliados antes da chamada:

```jsx
// (2) This gets computed second
eat(
  // (1) This gets computed first
  prepareMeal()
);
```

Isso é, geralmente, o que os desenvolvedores JavaScript esperam porque as funções em JavaScript podem ter efeitos colaterais implícitos. Seria surpreendente se chamássemos uma função em JavaScript, mas ela não executasse até que seu resultado fosse "usado" de alguma maneira.

Entretanto, componentes React são [relativamente](#pureza) puros. Não existe absolutamente nenhuma necessidade de executá-los se soubermos que o resultado não vai ser renderizado na tela.

Considere esse componente que usa `<Comments>` dentro de um `<Page>`:

```jsx{11}
function Story({ currentUser }) {
  // return {
  //   type: Page,
  //   props: {
  //     user: currentUser,
  //     children: { type: Comments, props: {} }
  //   }
  // }
  return (
    <Page user={currentUser}>
      <Comments />
    </Page>
  );
}
```

O componente `Page` pode renderizar os filhos dado a ele dentro de um `Layout`:

```jsx{4}
function Page({ user, children }) {
  return (
    <Layout>
      {children}
    </Layout>
  );
}
```

*(`<A><B /></A>` em JSX é o mesmo que `<A children={<B />} />`.)*

Mas e se ele tem uma condição de saída antes disso?

```jsx{2-4}
function Page({ user, children }) {
  if (!user.isLoggedIn) {
    return <h1>Por favor, faça login</h1>;
  }
  return (
    <Layout>
      {children}
    </Layout>
  );
}
```

Se chamarmos `Comments()` como uma função, ele seria executado imediatamente, independente de `Page` desejar renderizá-lo ou não:

```jsx{4,8}
// {
//   type: Page,
//   props: {
//     children: Comments() // Sempre executa!
//   }
// }
<Page>
  {Comments()}
</Page>
```

Mas se passarmos um elemento React, não precisamos executar `Comments`:

```jsx{4,8}
// {
//   type: Page,
//   props: {
//     children: { type: Comments }
//   }
// }
<Page>
  <Comments />
</Page>
```


Isso deixa o React decidir quando e *como* chamá-lo. Se nosso componente `Page` ignora suas props `children` e, em vez disso, renderiza `<h1>Por favor, faça login</h1>`, o React não vai nem tentar chamar a função de `Comments`. Mas e daí?

Isso é bom porque nos permite evitar renderizações desnecessárias que seriam jogadas fora e faz nosso código menos frágil. (Não nos importamos se `Comments' é jogado fora ou não quando o usuário não fez login - ele não vai ser chamado.)

## Estado

Falamos [mais cedo](#reconciliação) sobre identidade e como a "posição" conceitual de um elemento na árvore indica ao React se ele deve reusar uma instância de host ou criar uma nova. Instâncias do host têm todo tipo de estado local: foco, seleção, _input_, etc. Queremos preservar esse estado entre atualizações que, conceitualmente, renderizam a mesma UI. Também desejamos conseguir prever o momento de destruir a instância quando renderizamos algo conceitualmente diferente (como quando saímos de `<SignupForm>` para `<MessengerChat>`).

**Estado local não é tão útil quando o React permite que *seus próprios* componentes também tenham os seus.** Componentes continuam sendo funções, mas o React amplia-os com funcionalidades que são úteis para UIs. Estado local associado à posição na árvore é uma dessas funcionalidades.

Chamamos essas funcionalidades de *Hooks*. Por exemplo, `useState` é um Hook.

```jsx{2,6,7}
function Example() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>Você clicou {count} vezes</p>
      <button onClick={() => setCount(count + 1)}>
        Clique em mim
      </button>
    </div>
  );
}
```

Ela retorna um par de valores: o estado atual e uma função que o atualiza.


A sintaxe do [array destructuring](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment#Array_destructuring) nos permite dar nomes arbitrários às nossas variáveis de estado. Por exemplo, chamei esse par de `count` e `setCount`, mas poderia ser `banana` e `setBanana`. No texto abaixo, usarei `setState` para referir ao segundo valor independentemente do nome atual nos exemplos.

*(Você pode aprender mais sobre `useState` e outros Hooks fornecidos pelo React [aqui](https://reactjs.org/docs/hooks-intro.html).)*

## Consistência

Mesmo se desejarmos dividir o processo de reconciliação em partes [não-bloqueantes](https://www.youtube.com/watch?v=mDdgfyRB5kg), deveríamos realizar as operações da árvore do host em uma única ação síncrona. Dessa maneira, podemos garantir que o usuário não verá uma UI atualizada pela metade, e que o navegador não executará layout desnecessário e recálculo de estilo para estados intermediários que o usuário não deveria ver.

É por isso que o React divide todo o trabalho entre a "fase de renderização" e a "fase de commit". *Fase de renderização* é quando o React chama os seus componentes e executa a reconciliação. É seguro interromper e [no futuro](https://reactjs.org/blog/2018/03/01/sneak-peek-beyond-react-16.html) isso vai ser assíncrono. A *fase de commit* é quando o React toca a árvore do host. Ela é sempre síncrona.

## Memorizando

Quando um pai agenda uma atualização chamando `setState`, o React, por padrão, reconcilia toda sua sub-árvore filha. Isso acontece porque o React não consegue saber se uma atualização no pai afetaria os filhos ou não e, por padrão, o React opta por ser consistente. Isso pode parecer muito caro na prática, mas não é um problema para sub-árvores pequenas e médias.

Quando a árvore se torna muito profunda ou larga, você pode pedir para o React [memorizar](https://en.wikipedia.org/wiki/Memoization) a sub-árvore e reusar renderizações anteriores durante alterações rasas de props iguais:

```jsx{5}
function Row({ item }) {
  // ...
}

export default React.memo(Row);
```

Agora, `setState` em um componente `<Table>` pai vai desconsiderar a reconciliação dos `item` das `Row`s que são, referencialmente, iguais aos `item` da última renderização.

Você pode conseguir memorização fina no nível das expressões individuais com o [Hook `useMemo()`](https://reactjs.org/docs/hooks-reference.html#usememo). O _cache_ é local para a posição do componente na árvore e vai ser destruído junto com seu estado local. Ele só guarda o último item.

O React intencionalmente não memoriza componentes por padrão. Muitos componentes sempre recebem props diferentes, por isso memorizá-los seria um prejuízo.

## Modelos Puros

Ironicamente, o React não usa um sistema de "reatividade" para atualizações delicadas. Em outras palavras, qualquer atualização no topo desencadea reconciliação em vez de atualizar apenas os componentes afetados pela mudança.

Essa é uma decisão intencional de design. O [tempo para ser interativo](https://calibreapp.com/blog/time-to-interactive/) é uma métrica crucial em aplicações web para consumidores, e atravessar modelos para configurar escutas delicadas consome muito desse tempo precioso. Adicionalmente, em muitas apps, interações tendem a resultar em pequenas (_hover_ de botão) ou grandes (transição de página) atualizações, sendo inscrições delicadas um desperdício de recursos de memória nesse caso.

Um dos mais importantes princípios de design do React é que ele funciona com dados puros. Se você tiver um monte de objetos JavaScript recebidos da rede, você pode, então, colocá-los diretamente em seus componentes sem pré-processamento. Não existem pegadinhas sobre quais propriedades você pode acessar, ou picos de performance inesperados quando uma estrutura muda um pouco. A Renderização do React é O(*tamanho da view*) em vez de O(*tamanho do modelo*), e você pode cortar significamente o *tamanho da view* com [windowing](https://react-window.now.sh/#/examples/list/fixed-size).

Existem alguns tipos de aplicações onde inscrições delicadas são benéficas - como cotações de ações. Esse é um exemplo raro de "tudo se altera constantemente ao mesmo tempo". Enquanto saídas de emergência imperativas podem ajudar a otimizar tal código, o React pode não ser a melhor opção para esse caso de uso. Ainda assim, você pode implementar seu próprio sistema de inscrição delicada em cima do React.

**Note que existem problemas comuns de performance que mesmo inscrições delicadas e sistemas de "reatividade" não podem resolver.** Por exemplo, renderizar uma *nova* árvore profunda (que acontece a cada transição de página) sem bloquear o navegador. Alterar o acompanhamento não o faz mais rápido - o faz mais lento porque temos mais trabalho a fazer para configurar as inscrições. Outro problema é que temos que esperar pelos dados antes de podermos renderizar a _view_. No React, nosso objetivo é resolver ambos os problemas com [Renderização Concorrente](https://reactjs.org/blog/2018/03/01/sneak-peek-beyond-react-16.html).


## Agrupamento

Muitos componentes podem desejar atualizar o estado em resposta ao mesmo evento. Esse exemplo é simples, mas ilustra um padrão comum:

```jsx{4,14}
function Pai() {
  let [count, setCount] = useState(0);
  return (
    <div onClick={() => setCount(count + 1)}>
      O Pai clicou {count} vezes
      <Filho />
    </div>
  );
}

function Filho() {
  let [count, setCount] = useState(0);
  return (
    <button onClick={() => setCount(count + 1)}>
      O filho clicou {count} vezes
    </button>
  );
}
```

Quando um evento é despachado, o `onClick` do filho é disparado primeiro (chamando seu `setState`). Então, o pai chama `setState` no seu próprio `onClick`.

Se o React rerenderizar imediatamente os componentes em resposta às chamadas de `setState`, nós terminaríamos renderizando o filho duas vezes:

```jsx{4,8}
*** O React entrando no evento de click do navegador ***
Filho (onClick)
  - setState
  - rerenderiza o filho // 😞 desnecessário
Pai (onClick)
  - setState
  - rerenderiza o Pai
  - rerenderiza o Filho
*** O React saindo do evento de click do navegador ***
```

O primeiro render do `Filho` seria desperdiçado. E não poderíamos fazer o React pular a renderização do `Filho` pela segunda vez porque o `Pai` poderia passar dados diferentes para ele baseado no seu estado atualizado.

**É por isso que o React agrupa as atualizações dentro dos eventos:**

```jsx
*** O React entrando no evento de click do navegador ***
Filho (onClick)
  - setState
Pai (onClick)
  - setState
*** Processando atualizações de estado ***
  - rerenderizando o Pai
  - rerenderizando o Filho
*** O React saindo do evento de click do navegador ***
```

As chamadas de `setState` nos componentes não deveriam causar uma rerenderização imediata. Em vez disso, o React executaria todos os eventos primeiro e, depois, dispararia uma única rerenderização agrupando todas as atualizações de uma vez.

Agrupamento é bom para performance, mas pode ser uma surpresa se você escrever código assim:

```jsx
  const [count, setCount] = useState(0);

  function increment() {
    setCount(count + 1);
  }

  function handleClick() {
    increment();
    increment();
    increment();
  }
```

Se começarmos com `count` em `0`, esses seriam apenas três chamadas de `setCount(1)`. Para resolver isso, o `setState` provê uma sobrecarga que aceita uma função "atualizador":

```jsx
  const [count, setCount] = useState(0);

  function increment() {
    setCount(c => c + 1);
  }

  function handleClick() {
    increment();
    increment();
    increment();
  }
```

O React colocaria as funções atualizadoras em uma fila, e depois as executaria em sequência, resultando em uma rerenderização com `count` em `3`.

Quando uma lógica de estado se torna mais complexa do que algumas chamadas para `setState`, eu recomendo expressar isso como um redutor de estado local com o [Hook `useReducer`](https://reactjs.org/docs/hooks-reference.html#usereducer). É como uma evolução desse padrão de "atualizador" em que cada atualização tem um nome:

```jsx
  const [counter, dispatch] = useReducer((state, action) => {
    if (action === 'increment') {
      return state + 1;
    } else {
      return state;
    }
  }, 0);

  function handleClick() {
    dispatch('increment');
    dispatch('increment');
    dispatch('increment');
  }
```

O argumento `action` pode ser qualquer coisa, porém uma escolha comum é um objeto.

## Árvore de Chamadas

O ambiente de execução de uma linguagem geralmente tem uma [pilha de chamadas](https://medium.freecodecamp.org/understanding-the-javascript-call-stack-861e41ae61d4). Quando uma função `a()` chama `b()` que, por sua vez, chama `c()`, em algum lugar do motor JavaScript existe uma estrutura de dados como `[a, b, c]` que "rastreia" onde você está e qual código executar em seguida. Uma vez que você sai do `c`, sua pilha de chamada se vai - puf! Ela não é mais necessária. Saltamos de volta ao `b`. No momento em que saímos de `a`, a pilha de chamadas está vazia.

Claro, o próprio React executa no JavaScript e obedece as regras do JavaScript. Mas podemos imaginas que, internamente, o React tem algum tipo próprio de pilha de chamadas para lembrar qual o componente que está renderizando no momento, ex: `[App, Page, Layout, Article /* estamos aqui */]`.

O React é diferente de um ambiente de execução de uma linguagem de propósito geral porque ele é voltado para renderização de árvores de UI. Essas árvores precisam "manter-se vivas" para que possamos interagir com elas.

Isso pode extrapolar a metáfora, mas gosto de pensar nos componentes React estando dentro de uma "árvore de chamadas" do que simplesmente uma "pilha de chamadas". Quando "saímos" do componente `Article`, seu espaço na "árvore de chamadas" do React não é destruído. Precisamos manter o estado local e as referências às instâncias do host [em algum lugar](https://medium.com/react-in-depth/the-how-and-why-on-reacts-usage-of-linked-list-in-fiber-67f1014d0eb7).

Esses espaços na "árvore de chamadas" *são* destruídos junto com seus estados locais e instâncias do host, porém apenas quando as regras de [reconciliação](#reconciliação) dizem que é necessário. Se você já viu o código-fonte do React alguma vez, você deve ter visto esses espaços sendo referidos como [Fibers](https://en.wikipedia.org/wiki/Fiber_(computer_science)).

_Fibers_ são onde o estado local realmente vive. Quando o estado é atualizado, o React marca os _Fibers_ abaixo como precisando de reconciliação, e chama esses componentes.

## Contexto

No React, passamos as coisas para outros componentes abaixo como props. Algumas vezes, a maioria dos componentes precisam da mesma coisa - por exemplo, o tema visual escolhido. Se torna trabalhoso passá-lo para cada nível abaixo.

No React, isso é resolvido com o [Contexto](https://reactjs.org/docs/context.html). Isso é essencialmente como um [escopo dinâmico](http://wiki.c2.com/?DynamicScoping) para componentes. É como um buraco de minhoca que te permite colocar algo no topo e faz com que cada filho abaixo seja capaz de lê-lo e rerenderizar quando é alterado.

```jsx
const ThemeContext = React.createContext(
  'light' // Valor padrão como reserva
);

function DarkApp() {
  return (
    <ThemeContext.Provider value="dark">
      <MyComponents />
    </ThemeContext.Provider>
  );
}

function SomeDeeplyNestedChild() {
  // Depende de onde o filho é renderizado
  const theme = useContext(ThemeContext);
  // ...
}
```

Quando `SomeDeeplyNestedChild` renderiza, `useContext(ThemeContext)` vai procurar pelo `<ThemeContext.Provider>` mais próximo acima dele na árvore, e usar o seu `value`.

(Na prática, o React mantém uma pilha de contexto enquanto renderiza.)

Se não existe `ThemeContext.Provider` acima, o resultado da chamada de `useContext(ThemeContext)` vai ser o valor padrão especificado na chamada de `createContext()`.  No nosso exemplo, isso é `'light'`.

## Efeitos

Mencionamos anteriormente que os componentes React não deveriam ter efeitos colaterais observáveis durante a renderização. Mas efeitos colaterais são necessários algumas vezes. Podemos querer gerenciar o foco, desenhar em um _canvas_, inscrever em uma fonte de dados e por aí vai.

No React, isso pode ser feito declarando um efeito:

```jsx{4-6}
function Example() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    document.title = `You clicked ${count} times`;
  });

  return (
    <div>
      <p>You clicked {count} times</p>
      <button onClick={() => setCount(count + 1)}>
        Click me
      </button>
    </div>
  );
}
```

Quando possível, o React adia a execução dos efeitos até que o navegador repinte a tela. Isso é bom porque códigos como inscrições de fontes de dados não deveriam prejudicar o [tempo para interatividade](https://calibreapp.com/blog/time-to-interactive/) o [tempo para primeira pintura](https://developers.google.com/web/tools/lighthouse/audits/first-meaningful-paint). (Existe um Hook [usado raramente](https://reactjs.org/docs/hooks-reference.html#uselayouteffect) que te permite sair desse comportamento e fazer as coisas de forma síncrona. Evite-o.)

Efeitos não executam apenas uma vez. Eles executam tanto depois de um componente ser exibido para o usuário pela primeira vez quanto depois que ele atualiza. Efeitos podem aproximar props e estado, assim como o `count` no exemplo acima.

Efeitos podem requerer uma limpeza, como no caso das inscrições. Para limpar, um efeito pode retornar uma função:

```jsx
  useEffect(() => {
    DataSource.addSubscription(handleChange);
    return () => DataSource.removeSubscription(handleChange);
  });
```

O React vai executar a função retornada antes de aplicar esse efeito na próxima vez, e também antes do componente ser destruído.

Algumas vezes, re-executar o efeito em cada renderização pode ser indesejado. Você pode pedir ao React para [pular](https://reactjs.org/docs/hooks-effect.html#tip-optimizing-performance-by-skipping-effects) a aplicação do efeito se certas variáveis não mudarem:

```jsx{3}
  useEffect(() => {
    document.title = `You clicked ${count} times`;
  }, [count]);
```

Entretando, é, geralmente, uma otimização prematura e pode levar a problemsa se você não está familiarizado em como as _closures_ em JavaScript funcionam.

Por exemplo, esse código está bugado:

```jsx
  useEffect(() => {
    DataSource.addSubscription(handleChange);
    return () => DataSource.removeSubscription(handleChange);
  }, []);
```

Está bugado porque o `[]` diz "jamais reexecute esse efeito". Mas o efeito utiliza `handleChange` que é definido fora dele. E `handleChange` pode conter referência para qualquer props ou estado:

```jsx
  function handleChange() {
    console.log(count);
  }
```

Se nós jamais permitirmos o efeito executar novamente, `handleChange` vai permanecer apontando para a versão da primeira renderização, e `count` vai sempre ser `0` dentro dele.

Para resolver isso, se assegure de que se você especificar um array de dependências, que ele inclua *tudo* que pode mudar, incluindo as funções:

```jsx{4}
  useEffect(() => {
    DataSource.addSubscription(handleChange);
    return () => DataSource.removeSubscription(handleChange);
  }, [handleChange]);
```

Dependendo do seu código, você ainda pode ver reinscrições desnecessárias porque o próprio `handleChange` é diferente em cada renderização. O Hook [`useCallback`](https://reactjs.org/docs/hooks-reference.html#usecallback) pode te ajudar com isso. Alternativamente, você pode apenas permiti-lo se reinscrever. Por exemplo, o `addEventListener` da API de um navegador é extremamente rápido, e fazer saltos para impedir que ele seja chamado pode causar mais problemas do que o necessário.

*(Você pode aprender mais sobre `useEffect` e outros Hooks que o React provê [aqui](https://reactjs.org/docs/hooks-effect.html).)*


## Hooks Customizados

Já que Hooks como `useState` e `useEffect` são chamadas de funções, podemos usá-las em nossos próprios Hooks:

```jsx{2,8}
function MyResponsiveComponent() {
  const width = useWindowWidth(); // Our custom Hook
  return (
    <p>Window width is {width}</p>
  );
}

function useWindowWidth() {
  const [width, setWidth] = useState(window.innerWidth);
  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  });
  return width;
}
```

Hooks customizados permitem que diferentes componentes compartilhem uma lógica com estado. Note que o *próprio estado* não é compartilhado. Cada chamada para um Hook declara seu próprio estado isolado.

*(Você pode aprender mais sobre escrever seus próprios Hooks [aqui](https://reactjs.org/docs/hooks-custom.html).)*

## Ordem de Uso Estático

Você pode pensar em `useState` como uma sintaxe para definir uma "variável de estado do React". Não é *exatamente* uma sintaxe, é claro. Ainda estamos escrevendo JavaScript. Mas estamos olhando para o React como um ambiente de execução, e porque o React utiliza JavaScript para descrever árvores de UI, suas funcionalidades algumas vezes vivem perto do espaço da linguagem.

Se `use` *fosse* uma sintaxe, faria sentido para ela estar no nível mais alto:

```jsx{3}
// 😉 Nota: não é uma sintaxe real
component Example(props) {
  const [count, setCount] = use State(0);

  return (
    <div>
      <p>You clicked {count} times</p>
      <button onClick={() => setCount(count + 1)}>
        Click me
      </button>
    </div>
  );
}
```

O que colocá-lo em uma condição ou um _callback_ ou fora de um componente significaria?

```jsx
// 😉 Nota: não é uma sintaxe real

// Isso é estado local... de quê?
const [count, setCount] = use State(0);

component Example() {
  if (condition) {
    // O que acontece a ele se a condição for falsa?
    const [count, setCount] = use State(0);
  }

  function handleClick() {
    // O que acontece a ele quando saímos da função?
    // Qual a diferença disso para uma variável?
    const [count, setCount] = use State(0);
  }
```

O estado do React é local para o *componente* e sua identidade na árvore. Se `use` fosse uma sintaxe real, faria sentido colocá-la no nível mais alto de um componente também:

```jsx
// 😉 Nota: não é uma sintaxe real
component Example(props) {
  // Só é válido aqui
  const [count, setCount] = use State(0);

  if (condition) {
    // Isso seria um erro de sintaxe
    const [count, setCount] = use State(0);
  }
```

Isso é similar a como o `import` só funciona no nível mais alto como um módulo.

**É claro, `use` não é realmente uma sintaxe.** (não traria muitos benefícios e criaria muita fricção.)

Entretanto, o React *realmente* espera que todas as chamadas de Hooks aconteçam no nível mais alto de um componente incondicionalmente. Essas [Regras dos Hooks](https://reactjs.org/docs/hooks-rules.html) podem ser reforçadas com um [plugin de linter](https://www.npmjs.com/package/eslint-plugin-react-hooks). Essa escolha de design gerou argumentos acalorados, mas, na prática, não tenho visto isso confundir as pessoas. Também escrevi sobre como alternativas comumente propostas [não funcionam](https://overreacted.io/why-do-hooks-rely-on-call-order/).

Internamente, Hooks são implementados como [listas encadeadas](https://dev.to/aspittel/thank-u-next-an-introduction-to-linked-lists-4pph). Quando você chama `useState`, nós movemos o ponteiro para o próximo item. Quando saímos do [espaço na "árvore de chamadas"](#árvore-de-chamadas) do componente, nós salvamos a lista resultante ali até a próxima renderização.

[Esse artigo](https://medium.com/@ryardley/react-hooks-not-magic-just-arrays-cd4f1857236e) provê uma explicação simplificado de como os Hooks funcionam internamente. Vetores podem ser um modelo mental mais fácil do que listas encadeadas:

```jsx
// Pseudocódigo
let hooks, i;
function useState() {
  i++;
  if (hooks[i]) {
    // Próxima renderização
    return hooks[i];
  }
  // Primeira renderização
  hooks.push(...);
}

// Preparando para renderizar
i = -1;
hooks = fiber.hooks || [];
// Chamando o componente
YourComponent();
// Memorizando o estado do Hooks
fiber.hooks = hooks;
```

*(Se você for uma pessoa curiosa, o código real está [aqui](https://github.com/facebook/react/blob/master/packages/react-reconciler/src/ReactFiberHooks.js).)*

Isso é basicamente como cada chamada a `useState()` encontra o estado correto. Como aprendemos [mais cedo](#reconciliação), "comparar as coisas" não é novo para o React - a reconciliação se baseia nos elementos sendo comparados entre renderizações de maneira semelhante.

## O que sobrou

Toquei em quase todos os aspectos importantes do ambiente de execução do React. Se você terminou de ler essa página, você provavelmente sabe mais dos detalhes do React do que 90% dos seus usuários. E não há nada de errado com isso!

Há algumas partes que deixei de fora - mais porque elas ainda não são claras mesmo para nós. O React não tem uma boa história para as renderizações com muitos passes - como quando o pai precisa de informações do filho para renderizar. A [API de gestão de erro](https://reactjs.org/docs/error-boundaries.html) também ainda não tem uma versão para os Hooks. É possível que esses dois problemas sejam resolvidos juntos. Modo Concorrente ainda não está estável, e existem questões interessantes sobre como o Suspense se encaixa nesse quadro. Talvez eu faça um acompanhamento quando esteja tudo resolvido e o Suspense esteja pronto para mais coisas do que apenas o [carregamento preguiçoso](https://reactjs.org/blog/2018/10/23/react-v-16-6.html#reactlazy-code-splitting-with-suspense).

**Eu acho que isso mostra o sucesso da API do React quando você pode chegar muito longe sem nem se preocupar com muitos desses tópicos.** Muitos padrões como a heurística da reconciliação fazem o certo em muitos casos. Cuidados, como o da `key`, te incomodam quando você arrisca atirar no próprio pé.

Se você é um nerd de bibliotecas UI, espero que esse post foi algo divertido e esclareceu como o React trabalha com mais profundidade. Ou talvez você decidiu que o React é muito complicado e não quer nunca mais vê-lo de novo. De todo modo, eu gostaria de ouvir de você no Twitter! Obrigado por ler.
