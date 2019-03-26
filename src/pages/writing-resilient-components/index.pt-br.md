---
title: Criando Componentes resilientes
date: '2019-03-16'
spoiler: Quatro princípios para te colocar na direção certa.
---

Quando as pessoas começam a aprender React, frequentemente eles pedem por guia de boas práticas. Enquanto é uma boa ideia ter regras consistentes determinadas em um projeto, a maioria delas são arbitrárias  — e React não tem uma forte opinião sobre elas.

Você pode implementar de diferentes formas, preferir funcoes declarativas ou arrow functions, organizar suas props em ordem alfabética ou da forma que voce achar melhor.

Essa flexibilidade permite [Integrar React](https://reactjs.org/docs/add-react-to-a-website.html) em projetos com convenções existentes. Mas isso também gera debates infinitos.

**Existem importantes principios que todos componentes deveriam seguir. Mas eu nao acredito que os guias de estilo cobrem esses princípios muito bem. Nos falaremos sobre os Guias de estilo primeiros, e ai  [olhareoms os princípios que sao realmente úteis](#writing-resilient-components).**

---

## Não se distráia com problemas imaginários

Antes de falarmos sobre principios de design de componentes , Eu gostaria de falar algumas palavras sobre guias de estilo. Essa opinião noa é muito popular, mas alguém precisa falar!

Na comunidade de JavaScript, existem algumas opiniões restritas sobre guias de estilo(style guides) opionados reinforcados com linter. Minha opinião pessoal é de que eles tendem a criar mais atritos do que eles valhem. Eu nao consigo contar quantas vezes alguém me mostrou um código absolutamente válido e disse “React reclama sobre isso”, mas isso era a regra dele do linter! Isso leva para três problemas:

*As pessoas se acostumam a ver o linter como **porteiro barulhento com excesso de zelo** ao invés de uma ferramenta útil. Alertas úteis são abafados por um mar de lendias de estilo. Como resultado, as pessoas não examinam as mensagens do linter durante a depuração e não recebem dicas úteis. Além disso, as pessoas menos habituadas a escrever JavaScript (por exemplo, designers) têm mais dificuldade em trabalhar com o código.

* As pessoas não aprender a **usos válidos ou uso inválido** de um certo padão. por exemplo, existe uma regra popular que proíbe chamar o `setState` dentro do` componentDidMount`. Mas se fosse sempre "ruim", o React simplesmente não permitiria! Há um caso de uso legítimo para isso e isso é medir o layout do nó DOM - por exemplo, para posicionar uma dica de ferramenta. Eu já vi pessoas "contornarem" essa regra, adicionando um "setTimeout" que perde completamente o ponto.

* Eventualmente, as pessoas adotam a “mentalidade de executor” e ficam opinadas sobre coisas que **não traz uma diferença significativa** mas são fáceis de digitalizar no código. “Você usou uma declaração de função, mas *nosso* projeto usa arrow functions.” 
Sempre que tenho um forte sentimento de impor uma regra como essa, parecer mais profundo revela que eu investi esforço emocional nessa regra - e luto para deixá-la ir. Isso me leva a uma falsa sensação de realização sem melhorar meu código.

Eu estou dizendo que deveíamos para de usar linter? Não mesmo!

**Com uma boa configuração, um linter é uma ótima ferramenta para capturar erros antes que eles aconteçam.** Focar de mais no *style* que faz com que isso vire distração.

---

## Marie Kondo e sua configuração linter

Aqui está o que eu sugiro que você faça na segunda-feira. Reúna sua equipe por meia hora, leia todas as regras de lint ativadas na configuração do seu projeto e pergunte a si mesmo: *“Essa regra ja nos ajudou a previnir algum problema?”* se nao, *remova essa regra.* (Você também pode começar de uma limpa com [`eslint-config-react-app`](https://www.npmjs.com/package/eslint-config-react-app) que nao possui nenhuma regra de estilo.)

No mínimo, sua equipe deve ter um processo para remover regras que causam atrito. Não assuma que qualquer coisa que você ou alguma outra pessoa tenha adicionado à sua configuração de lint há um ano é uma "prática recomendada". Questione e procure respostas. Não deixe que ninguém lhe diga que você não é inteligente o suficiente para escolher suas regras linter.

**Mas e sobre auto formatar?** Use [Prettier](https://prettier.io/) e esqueca sobre “as lendias de estilo”. Você não precisa de uma ferramenta para gritar com você por colocar um espaço extra se outra ferramenta puder corrigi-lo para você. Use o linter para encontrar *erros*,não para reforçar *e s t é t i c a*.

Naturalmente, há aspectos do estilo de codificação que não estão diretamente relacionados à formatação, mas ainda podem ser incômodos quando inconsistentes em todo o projeto.

No entanto, muitos deles são muito sutis para capturar com uma regra de fiapos de qualquer maneira. É por isso que é importante **criar confiança** entre os membros da equipe e compartilhar aprendizados úteis na forma de uma página da wiki ou um breve guia de design.

Nem tudo vale a pena automatizar! O conhecimento obtido com *leitura* e a lógica em tal guia pode ser mais valiosa do que seguir as “regras”.

**Mas se seguir um guia de estilo estrito é uma distração, o que é realmente importante?**

Esse é o tópico desta postagem.

---

## Escrevendo componentes resilientes

Nenhuma quantidade de importações de indentação ou classificação em ordem alfabética pode corrigir um design quebrado. Então, ao invés de focar em como algum código *é escrito*, Eu vou focar em como ele *funciona*. Existem alguns princípios de design de componentes que considero muito úteis:

1. **[Não pare o fluxo de dados](#principle-1-dont-stop-the-data-flow)**
2. **[Esteja sempre preparado para renderizar](#principle-2-always-be-ready-to-render)**
3. **[Nenhum componente é um singleton](#principle-3-no-component-is-a-singleton)**
4. **[Mantenha o estado local isolado](#principle-4-keep-the-local-state-isolated)**

Mesmo que você não use o React, provavelmente descobrirá os mesmos princípios por tentativa e erro para qualquer modelo de componente de interface do usuário com fluxo de dados unidirecional.

---

## Principle 1: Não pare o fluxo de dados

### Não pare o fluxo de dados na Rendenização

Quando alguém usa o seu componente, eles esperam que eles possam passar props diferentes para ele ao longo do tempo, e que o componente irá refletir essas mudanças:

```jsx
// está ok poder ser impulsionado por estado e poder mudar a qualquer momento
<Button color={isOk ? 'blue' : 'red'} />
```

Em geral, é assim que o React funciona por padrão. Se você usar uma propriedade `color` dentro de um componente` Button`, verá o valor fornecido acima para aquela renderização:

```jsx
function Button({ color, children }) {
  return (
    // ✅ `color` esta sempre atualizada!
    <button className={'Button-' + color}>
      {children}
    </button>
  );
}
```

No entanto, um erro comum ao aprender React é copiar props para o estado:

```jsx{3,6}
class Button extends React.Component {
  state = {
    color: this.props.color
  };
  render() {
    const { color } = this.state; // 🔴 `color` é estado!
    return (
      <button className={'Button-' + color}>
        {this.props.children}
      </button>
    );
  }
}
```

Isso pode parecer mais intuitivo no início se você usou classes fora do React. **No entanto, ao copiar um suporte para o estado, você está ignorando todas as atualizações.**

```jsx
// 🔴 Não funciona mais para atualizações com a implementação acima
<Button color={isOk ? 'blue' : 'red'} />
```

No caso raro de que esse comportamento *seja* intencional, certifique-se de chamar o prop `initialColor` ou` defaultColor` para esclarecer que as alterações são ignoradas.

Mas normalmente você vai querer **ler as props diretamente em seu componente** e evitar copiar props (ou qualquer coisa computada das props) para o estado:

```jsx
function Button({ color, children }) {
  return (
    // ✅ `color` é sempre atualizada!
    <button className={'Button-' + color}>
      {children}
    </button>
  );
}
```

----

Valores computados são outra razão pela qual as pessoas às vezes tentam copiar props no estado. Por exemplo, imagine que determinamos a cor do *button text* com base em um cálculo caro com o background 'color' como argumento:

```jsx{3,9}
class Button extends React.Component {
  state = {
    textColor: slowlyCalculateTextColor(this.props.color)
  };
  render() {
    return (
      <button className={
        'Button-' + this.props.color +
        ' Button-text-' + this.state.textColor // 🔴 Stale on `color` prop updates
      }>
        {this.props.children}
      </button>
    );
  }
}
```

Este componente apresenta bugs porque não recalcula `this.state.textColor` na alteração de proposição` color`. A solução mais fácil seria mover o cálculo `textColor` para o método` render` e torná-lo um `PureComponent`:

```jsx{1,3}
class Button extends React.PureComponent {
  render() {
    const textColor = slowlyCalculateTextColor(this.props.color);
    return (
      <button className={
        'Button-' + this.props.color +
        ' Button-text-' + textColor // ✅ Always fresh
      }>
        {this.props.children}
      </button>
    );
  }
}
```

Problema resolvido! Agora, se os props mudarem, recalcularemos `textColor`, mas evitaremos o caro cálculo nos mesmos objetos.

No entanto, podemos querer otimizá-lo ainda mais. E se for a proposição `children` que mudou? Parece lamentável recalcular o `textColor` nesse caso. Nossa segunda tentativa pode ser invocar o cálculo em `componentDidUpdate`:

```jsx{5-12}
class Button extends React.Component {
  state = {
    textColor: slowlyCalculateTextColor(this.props.color)
  };
  componentDidUpdate(prevProps) {
    if (prevProps.color !== this.props.color) {
      // 😔 Extra re-render for every update
      this.setState({
        textColor: slowlyCalculateTextColor(this.props.color),
      });
    }
  }
  render() {
    return (
      <button className={
        'Button-' + this.props.color +
        ' Button-text-' + this.state.textColor // ✅ Fresh on final render
      }>
        {this.props.children}
      </button>
    );
  }
}
```

No entanto, isso significaria que nosso componente faz uma segunda renderização após cada alteração. Isso também não é ideal se estamos tentando otimizá-lo.

Você poderia usar o ciclo de vida `componentWillReceiveProps` para isso. No entanto, as pessoas costumam colocar efeitos colaterais lá também. Isso, por sua vez, muitas vezes causa problemas para a próxima renderização concorrente [recursos como Time Slicing e Suspense](https://reactjs.org/blog/2018/03/01/sneak-peek-beyond-react-16.html). E o método "getDerivedStateFromProps" mais seguro é desajeitado.

LEt é recuar por um segundo. Efetivamente, queremos[*memorização*](https://en.wikipedia.org/wiki/Memoization). Temos algumas entradas e não queremos recalcular a saída, a menos que as entradas sejam alteradas.

Com uma classe, você poderia usar um [helper](https://reactjs.org/blog/2018/06/07/you-probably-dont-need-derived-state.html#what-about-memoization) para memoização. No entanto, os Ganchos levam isso um passo adiante, oferecendo uma maneira integrada de memorizar cálculos caros:

```jsx{2-5}
function Button({ color, children }) {
  const textColor = useMemo(
    () => slowlyCalculateTextColor(color),
    [color] // ✅ Don’t recalculate until `color` changes
  );
  return (
    <button className={'Button-' + color + ' Button-text-' + textColor}>
      {children}
    </button>
  );
}
```

Esse é todo o código que você precisa!

Em um componente classe, você pode utilizar um metodo helper como [`memoize-one`](https://github.com/alexreardon/memoize-one) por isso. Em um componente de função, o gancho `useMemo` oferece uma funcionalidade semelhante.

Agora, vemos que **mesmo a otimização de cálculos computacionais não é um bom motivo para copiar props para o estado.** Nosso resultado de renderização deve respeitar as alterações nas props.

---

### Não pare o fluxo de dados em efeitos colaterais

Até agora, falamos sobre como manter o resultado da renderização consistente com as alterações das props. Evitar copiar as props no estado é uma parte disso. No entanto, é importante que **efeitos colaterais (ex. busca de dados) também faca parte do fluxo de data**.

Considere esse React componente:

```jsx{5-7}
class SearchResults extends React.Component {
  state = {
    data: null
  };
  componentDidMount() {
    this.fetchResults();
  }
  fetchResults() {
    const url = this.getFetchUrl();
    // Do the fetching...
  }
  getFetchUrl() {
    return 'http://myapi/results?query' + this.props.query;
  }
  render() {
    // ...
  }
}
```

Muitos componentes do React são assim - mas se olharmos um pouco mais de perto, notaremos um erro. O método `fetchResults` usa o prop da` query` para busca de dados:

```jsx{2}
  getFetchUrl() {
    return 'http://myapi/results?query' + this.props.query;
  }
```

Mas e se a propensão `query` mudar? Em nosso componente, nada vai acontecer. **Isso significa que os efeitos colaterais de nossos componentes não respeitam as alterações em seus props.** Essa é uma fonte muito comum de erros nos aplicativos React.

Para consertar nosso componente, precisamos:

* Olhe para `componentDidMount` e cada método chamado a partir dele.
  - No nosso exemplo, isso é `fetchResults` e` getFetchUrl`.
* Anote todos os props e estados usados ​​por esses métodos.
  - No nosso exemplo, isso é `this.props.query`.
* Certifique-se de que sempre que esses props mudam, nós executamos novamente o efeito colateral.
  - Podemos fazer isso adicionando o método `componentDidUpdate`.

```jsx{8-12,18}
class SearchResults extends React.Component {
  state = {
    data: null
  };
  componentDidMount() {
    this.fetchResults();
  }
  componentDidUpdate(prevProps) {
    if (prevProps.query !== this.props.query) { // ✅ Refetch on change
      this.fetchResults();
    }
  }
  fetchResults() {
    const url = this.getFetchUrl();
    // Do the fetching...
  }
  getFetchUrl() {
    return 'http://myapi/results?query' + this.props.query; // ✅ Atualizações são tratadas
  }
  render() {
    // ...
  }
}
```

Agora nosso código respeita todas as mudanças nos objetos, mesmo para efeitos colaterais.

No entanto, é um desafio lembrar de não quebrá-lo novamente. Por exemplo, podemos adicionar `currentPage` ao estado local e usá-lo em` getFetchUrl`:

```jsx{4,21}
class SearchResults extends React.Component {
  state = {
    data: null,
    currentPage: 0,
  };
  componentDidMount() {
    this.fetchResults();
  }
  componentDidUpdate(prevProps) {
    if (prevProps.query !== this.props.query) {
      this.fetchResults();
    }
  }
  fetchResults() {
    const url = this.getFetchUrl();
    // Do the fetching...
  }
  getFetchUrl() {
    return (
      'http://myapi/results?query' + this.props.query +
      '&page=' + this.state.currentPage // 🔴 Updates are ignored
    );
  }
  render() {
    // ...
  }
}
```

Infelizmente, o nosso código está novamente com problemas porque o nosso efeito colateral não respeita as alterações ao `currentPage`.

** props e estado fazem parte do fluxo de dados do React. A renderização e os efeitos colaterais devem refletir as alterações nesse fluxo de dados, não ignorá-los! **

Para corrigir nosso código, podemos repetir as etapas acima:

* Olhe para `componentDidMount` e cada método chamado a partir dele.
  - No nosso exemplo, isso é `fetchResults` e` getFetchUrl`.
* Anote todos os props e estados usados ​​por esses métodos.
  - No nosso exemplo, isso é `this.props.query`
 **e `this.state.currentPage`**.
* Certifique-se de que sempre que esses props mudam, nós executamos novamente o efeito colateral.
  - Podemos fazer isso alterando o método `componentDidUpdate`.

Vamos corrigir nosso componente para lidar com atualizações do estado `currentPage`:

```jsx{11,24}
class SearchResults extends React.Component {
  state = {
    data: null,
    currentPage: 0,
  };
  componentDidMount() {
    this.fetchResults();
  }
  componentDidUpdate(prevProps, prevState) {
    if (
      prevState.currentPage !== this.state.currentPage || // ✅ Refetch on change
      prevProps.query !== this.props.query
    ) {
      this.fetchResults();
    }
  }
  fetchResults() {
    const url = this.getFetchUrl();
    // Do the fetching...
  }
  getFetchUrl() {
    return (
      'http://myapi/results?query' + this.props.query +
      '&page=' + this.state.currentPage // ✅ 
    );
  }
  render() {
    // ...
  }
}
```

**Não seria bom se pudéssemos de alguma forma detectar automaticamente esses erros?** Não é algo que um linter pode nos ajudar?

---

Infelizmente, verificar automaticamente um componente de classe quanto à consistência é muito difícil. Qualquer método pode chamar qualquer outro método. Analisar estatisticamente as chamadas de `componentDidMount` e` componentDidUpdate` é repleto de falsos positivos.

No entanto, um *poderia* projetar uma API que *possa* ser estaticamente analisada para consistência. o [React `useEffect` Hook](/a-complete-guide-to-useeffect/) é um exemplo de tal API:

```jsx{13-14,19}
function SearchResults({ query }) {
  const [data, setData] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);

  useEffect(() => {
    function fetchResults() {
      const url = getFetchUrl();
      // Do the fetching...
    }

    function getFetchUrl() {
      return (
        'http://myapi/results?query' + query +
        '&page=' + currentPage
      );
    }

    fetchResults();
  }, [currentPage, query]); // ✅ Refetch on change

  // ...
}
```

Colocamos a lógica *dentro* do efeito, e isso facilita a visualização *de quais valores do fluxo de dados React* depende. Estes valores são chamados “dependências”, e no nosso exemplo eles são `[currentPage, query]`.

Observe como essa matriz de "dependências de efeito" não é realmente um conceito novo. Em uma classe, tivemos que procurar por essas “dependências” por meio de todas as chamadas de método. A API `useEffect` apenas torna o mesmo conceito explícito.

Isso, por sua vez, nos permite validá-los automaticamente:

![Demonstração da regra de lint exhaustive-deps](./useeffect.gif)

*(Esta é uma demonstração da nova regra `lintive-deps ', que é uma parte do` eslint-plugin-react-hooks`. Ele será incluído em breve no Create React App.)*

**Observe que é importante respeitar todas as atualizações de prop e estado dos efeitos, independentemente de você estar escrevendo componente como uma classe ou uma função.**

Com a API da classe, você precisa pensar na consistência e verificar se as alterações em cada prop ou estado relevante são tratadas pelo `componentDidUpdate`. Caso contrário, seu componente não é resiliente para prop e alterações de estado. Isso não é nem mesmo um problema específico do React. Aplica-se a qualquer biblioteca de interface do usuário que permite lidar com "criação" e "atualizações" separadamente.

**A API `useEffect` inverte o padrão, incentivando a consistência.** Isso [pode parecer estranho no começo](/a-complete-guide-to-useeffect/), mas como resultado, seu componente se torna mais resiliente a mudanças na lógica. E como as “dependências” agora são explícitas, podemos * verificar * que o efeito é consistente usando uma regra de lint. Estamos usando um linter para pegar insetos!

---

### Não interrompa o fluxo de dados nas otimizações

Há mais um caso em que você pode ignorar acidentalmente as alterações nas props. Esse erro pode ocorrer quando você otimiza manualmente seus componentes.

Observe que as abordagens de otimização que usam igualdade superficial como `PureComponent` e` React.memo` com a comparação padrão são seguras.

**No entanto, se você tentar “otimizar” um componente escrevendo sua própria comparação, você pode se esquecer de comparar, por engano, a função props:**

```jsx{2-5,7}
class Button extends React.Component {
  shouldComponentUpdate(prevProps) {
    // 🔴 Doesn't compare this.props.onClick 
    return this.props.color !== prevProps.color;
  }
  render() {
    const onClick = this.props.onClick; // 🔴 Doesn't reflect updates
    const textColor = slowlyCalculateTextColor(this.props.color);
    return (
      <button
        onClick={onClick}
        className={'Button-' + this.props.color + ' Button-text-' + textColor}>
        {this.props.children}
      </button>
    );
  }
}
```

É fácil ignorar esse erro no início porque, com as aulas, você costuma passar um *método* para baixo e, assim, teria a mesma identidade:

```jsx{2-4,9-11}
class MyForm extends React.Component {
  handleClick = () => { // ✅ Always the same function
    // Do something
  }
  render() {
    return (
      <>
        <h1>Hello!</h1>
        <Button color='green' onClick={this.handleClick}>
          Press me
        </Button>
      </>
    )
  }
}
```

Portanto, nossa otimização não quebra *imediatamente*. No entanto, ele continuará "vendo" o antigo valor "onClick" se mudar ao longo do tempo, mas outros props não:

```jsx{6,13-15}
class MyForm extends React.Component {
  state = {
    isEnabled: true
  };
  handleClick = () => {
    this.setState({ isEnabled: false });
    // Do something
  }
  render() {
    return (
      <>
        <h1>Hello!</h1>
        <Button color='green' onClick={
          // 🔴 Button ignores updates to the onClick prop
          this.state.isEnabled ? this.handleClick : null
        }>
          Press me
        </Button>
      </>
    )
  }
}
```

Neste exemplo, clicar no botão deve desativá-lo, mas isso não acontece porque o componente "Button" ignora as atualizações para o prop `onClick`.

Isso pode ficar ainda mais confuso se a própria identidade da função depender de algo que pode mudar com o tempo, como `draft.content` neste exemplo:

```jsx{6-7}
  drafts.map(draft =>
    <Button
      color='blue'
      key={draft.id}
      onClick={
        // 🔴 Button ignores updates to the onClick prop
        this.handlePublish.bind(this, draft.content)
      }>
      Publish
    </Button>
  )
```

Enquanto o `draft.content` pode mudar com o tempo, nosso componente` Button` ignorou a mudança para o prop `onClick` para continuar a ver a“ primeira versão ”do método` onClick` com o `draft.content` original.

**Então, como podemos evitar esse problema?**

Eu recomendo evitar a implementação manual de `shouldComponentUpdate` e evitar especificar uma comparação personalizada para` React.memo () `. A comparação superficial padrão em `React.memo` respeitará a alteração da identidade da função:

```jsx{11}
function Button({ onClick, color, children }) {
  const textColor = slowlyCalculateTextColor(this.props.color);
  return (
    <button
      onClick={onClick}
      className={'Button-' + color + ' Button-text-' + textColor}>
      {children}
    </button>
  );
}
export default React.memo(Button); // ✅ Usa comparação superficial
```

Em uma classe, o `PureComponent` tem o mesmo comportamento.

Isso garante que passar uma função diferente como um prop sempre funcionará.

Se você insistir em uma comparação personalizada, 
**certifique-se de não ignorar as funções:**

```jsx{5}
  shouldComponentUpdate(prevProps) {
    // ✅ Compares this.props.onClick 
    return (
      this.props.color !== prevProps.color ||
      this.props.onClick !== prevProps.onClick
    );
  }
```

Como mencionei anteriormente, é fácil perder esse problema em um componente de classe porque as identidades de método costumam ser estáveis ​​(mas nem sempre - e é aí que os bugs se tornam difíceis de depurar). Com Hooks, a situação é um pouco diferente:

1. Funções são diferentes *em cada renderização* para você descobrir esse problema[Imediatamente](https://github.com/facebook/react/issues/14972#issuecomment-468280039).
2. Com `useCallback` e` useContext`, você pode [evitar passar funções profundamente](https://reactjs.org/docs/hooks-faq.html#how-to-avoid-passing-callbacks-down). Isso permite otimizar a renderização sem se preocupar com funções.

---

Para resumir esta seção, **não pare o fluxo de dados!**

Sempre que você usar props e estados, considere o que deve acontecer se eles mudarem. Na maioria dos casos, um componente não deve tratar a renderização inicial e atualiza de forma diferente. Isso faz com que resiliente às mudanças na lógica.

Com as turmas, é fácil esquecer as atualizações ao usar props e estado dentro dos métodos do ciclo de vida. Ganchos o cutucam para fazer a coisa certa - mas é preciso algum ajuste mental se você não estiver acostumado a já fazer isso.

---

## Princípio 2: Esteja sempre pronto para renderizar

Os componentes do React permitem escrever código de renderização sem se preocupar muito com o tempo. Você descreve como a interface do usuário *deve* parecer em qualquer momento e o React faz isso acontecer. Aproveite esse modelo!

Não tente introduzir hipóteses de tempo desnecessárias no comportamento do seu componente. **Seu componente deve estar pronto para ser renderizado a qualquer momento.**

Como alguém pode violar esse princípio? O React não facilita muito, mas você pode fazer isso usando o método de ciclo de vida 'componentWillReceiveProps' herdado:

```jsx{5-8}
class TextInput extends React.Component {
  state = {
    value: ''
  };
  // 🔴 Resets local state on every parent render
  componentWillReceiveProps(nextProps) {
    this.setState({ value: nextProps.value });
  }
  handleChange = (e) => {
    this.setState({ value: e.target.value });
  };
  render() {
    return (
      <input
        value={this.state.value}
        onChange={this.handleChange}
      />
    );
  }
}
```
Neste exemplo, mantemos o `valor` no estado local, mas nós * também * recebemos` valor` de props. Sempre que "recebemos novos props", redefinimos o "valor" no estado.

**O problema com esse padrão é que ele depende inteiramente do momento acidental.**

Talvez hoje as atualizações dos componentes do pai raramente sejam atualizadas e, assim, nosso TextInput só recebe props quando algo importante acontece, como salvar um formulário.

Mas amanhã você pode adicionar alguma animação ao pai de TextInput. Se seu pai re-render mais vezes, ele vai manter ["soprando"](https://codesandbox.io/s/m3w9zn1z8x)  Você pode ler mais sobre esse problema em ["Você provavelmente não precisa ter um estado derivado"](https://reactjs.org/blog/2018/06/07/you-probably-dont-need-derived-state.html).

**Então, como podemos corrigir isso?**

Primeiro de tudo, precisamos consertar nosso modelo mental. Precisamos parar de pensar em “receber adereços” como algo diferente de apenas “renderização”. Uma nova renderização causada por um pai não deve se comportar de maneira diferente de um novo processamento causado por nossa própria alteração de estado local. **Os componentes devem ser resilientes para renderizar com menos ou mais frequência, porque, caso contrário, eles são muito acoplados a seus pais em particular.**

*([Esta demo](https://codesandbox.io/s/m3w9zn1z8x) mostra como a nova renderização pode quebrar componentes frágeis.)*

Embora existam alguns [diferentes](https://reactjs.org/blog/2018/06/07/you-probably-dont-need-derived-state.html#preferred-solutions) [Soluções](https://reactjs.org/docs/hooks-faq.html#how-do-i-implement-getderivedstatefromprops) para quando você *realmente* quer derivar o estado de adereços, geralmente você deve usar um componente totalmente controlado:

```jsx
// Option 1: Fully controlled component.
function TextInput({ value, onChange }) {
  return (
    <input
      value={value}
      onChange={onChange}
    />
  );
}
```

Ou você pode usar um componente não controlado com uma chave para redefini-lo:

```jsx
// Option 2: Fully uncontrolled component.
function TextInput() {
  const [value, setValue] = useState('');
  return (
    <input
      value={value}
      onChange={e => setValue(e.target.value)}
    />
  );
}

// We can reset its internal state later by changing the key:
<TextInput key={formId} />
```

A conclusão desta seção é que seu componente não deve ser quebrado apenas porque ele ou o pai é processado com mais frequência. O design da React API torna mais fácil evitar o método de ciclo de vida 'componentWillReceiveProps' herdado.

Para testar seu componente com ênfase, você pode adicionar temporariamente esse código:

```js{2}
componentDidMount() {
  // Don't forget to remove this immediately!
  setInterval(() => this.forceUpdate(), 100);
}
```
**Não deixe este código em** - é apenas uma maneira rápida de verificar o que acontece quando um dos pais é processado novamente com mais frequência do que o esperado. Não deve quebrar a criança!

---

Você pode estar pensando: "Continuarei redefinindo o estado quando os objetos forem alterados, mas evitaremos re-renderizações desnecessárias com o` PureComponent` ".

Esse código deve funcionar, certo?


```jsx{1-2}
// 🤔 Deve evitar re-renderizações desnecessárias ... certo?

class TextInput extends React.PureComponent {
  state = {
    value: ''
  };
  // 🔴 Resets local state on every parent render
  componentWillReceiveProps(nextProps) {
    this.setState({ value: nextProps.value });
  }
  handleChange = (e) => {
    this.setState({ value: e.target.value });
  };
  render() {
    return (
      <input
        value={this.state.value}
        onChange={this.handleChange}
      />
    );
  }
}
```

A princípio, pode parecer que esse componente resolve o problema de “explodir” o estado na re-renderização pai. Afinal, se os props são os mesmos, apenas pulamos a atualização - e então `componentWillReceiveProps` não é chamado.

No entanto, isso nos dá uma falsa sensação de segurança. **Este componente ainda não é resiliente a _actual_ prop changes.** Por exemplo, se nós adicionamos *outro* proprieção que muda frequentemente, como um `estilo` animado, nós ainda “perderíamos” o estado interno:

```jsx{2}
<TextInput
  style={{opacity: someValueFromState}}
  value={
    // 🔴 componentWillReceiveProps in TextInput
    // resets to this value on every animation tick.
    value
  }
/>
```

Portanto, essa abordagem ainda é falha. Podemos ver que várias otimizações como `PureComponent`,` shouldComponentUpdate` e `React.memo` não devem ser usadas para controlar *o comportamento*. Use-os apenas para melhorar o desempenho *, onde isso ajuda. Se remover uma otimização _breaks_ um componente, era muito frágil para começar.

A solução aqui é a mesma que descrevemos anteriormente. Não trate "recebendo props" como um evento especial. Evite "sincronizar" props e estado. Na maioria dos casos, todos os valores devem ser totalmente controlados (por meio de props) ou totalmente descontrolados (no estado local). Evite o estado derivado [quando puder] (https://reactjs.org/blog/2018/06/07/you-probably-dont-need-derived-state.html#preferred-solutions). **E esteja sempre pronto para renderizar!**

---

## Princípio 3: Nenhum componente é um singleton

Às vezes, assumimos que um determinado componente só é exibido uma vez. Tal como uma barra de navegação. Isso pode ser verdade por algum tempo. No entanto, essa suposição geralmente causa problemas de design que surgem apenas muito mais tarde.

Por exemplo, talvez você precise implementar uma animação *entre* dois componentes `Page` em uma mudança de rota - a` Página` anterior e a próxima `Page`. Ambos precisam ser montados durante a animação. No entanto, você pode descobrir que cada um desses componentes pressupõe que seja a única `Página` na tela.

É fácil verificar esses problemas. Apenas por diversão, tente renderizar seu aplicativo duas vezes:

```jsx{3,4}
ReactDOM.render(
  <>
    <MyApp />
    <MyApp />
  </>,
  document.getElementById('root')
);
```
Clique ao redor. (Você pode precisar ajustar algumas CSS para este experimento.)

**Seu aplicativo ainda se comporta como esperado?** Ou você vê estranhas falhas e erros? É uma boa ideia fazer esse teste de estresse em componentes complexos de vez em quando e garantir que várias cópias deles não entrem em conflito.

Um exemplo de um padrão problemático que já escrevi algumas vezes é a "limpeza" do estado global em "componentWillUnmount":

```jsx{2-3}
componentWillUnmount() {
  // Resets something in Redux store
  this.props.resetForm();
}
```

Naturalmente, se houver dois desses componentes na página, desmontar um deles pode quebrar o outro. Redefinir o estado "global" no *montar* não é melhor:

```jsx{2-3}
componentDidMount() {
  // Resets something in Redux store
  this.props.resetForm();
}
```

Nesse caso, *montar* um segundo formulário quebrará o primeiro.

Esses padrões são bons indicadores de onde nossos componentes são frágeis. ***Mostrar *ou* ocultar *uma árvore não deve quebrar componentes fora dessa árvore.**

Se você pretende renderizar esse componente duas vezes ou não, a solução desses problemas é compensada a longo prazo. Isso leva você a um design mais resiliente.

---

## Princípio 4: Mantenha o Estado local isolado

Considere um componente `Post` das mídias sociais. Tem uma lista de tópicos `Comment` (que podem ser expandidos) e uma entrada` NewComment`.

Reagir componentes podem ter estado local. Mas qual estado é verdadeiramente local? O conteúdo da postagem é estado local ou não? E a lista de comentários? Ou o registro de quais segmentos de comentários são expandidos? Ou o valor da entrada de comentários?

Se você está acostumado a colocar tudo em um "gerente de estado", responder a essa pergunta pode ser um desafio. Então, aqui está uma maneira simples de decidir.

**Se você não tiver certeza se algum estado é local, pergunte a si mesmo: "Se esse componente foi renderizado duas vezes, essa interação deve refletir na outra cópia?" Sempre que a resposta for "não", você encontrará algum estado local.**

Por exemplo, imagine que renderizamos o mesmo `Post` duas vezes. Vamos olhar para coisas diferentes que podem mudar.

* *Publicar conteúdo.* Queríamos editar a postagem em uma árvore para atualizá-la em outra árvore. Portanto, provavelmente**não deveria** ser o estado local de um componente `Post`. (Em vez disso, o conteúdo da postagem poderia estar em algum cache, como o Apollo, o Relay ou o Redux.)

* *Lista de comentários* Isso é semelhante ao postar conteúdo. Gostaríamos de adicionar um novo comentário em uma árvore para ser refletido na outra árvore também. Então, idealmente, nós usaríamos algum tipo de cache para isso, e **não deveria** ser um estado local do nosso `Post`.

* *Quais comentários são expandidos.* Seria estranho se expandir um comentário em uma árvore também o expandisse em outra árvore. Nesse caso, estamos interagindo com um "comentário" específico *Representação da interface do usuário* em vez de uma "entidade de comentário" abstrata. Portanto, um sinalizador “expandido” ** deve ser um estado local do comentário.

* *O valor da nova entrada de comentário.* Seria estranho se digitar um comentário em uma entrada também atualizasse uma entrada em outra árvore do DOM. A menos que os insumos sejam claramente agrupados, geralmente as pessoas esperam que eles sejam independentes. Portanto, o valor de entrada ** deve ser um estado local do componente NewComment.

Eu não sugiro uma interpretação dogmática dessas regras. É claro que, em um aplicativo mais simples, você pode querer usar o estado local para tudo, incluindo os "caches". Estou falando apenas da experiência ideal do usuário [dos primeiros princípios](/the-elements-of-ui-engineering/).

**Evite tornar o estado verdadeiramente local global.** Isso entra no nosso tópico de "resiliência": há menos sincronização surpreendente entre os componentes. Como bônus, isso * também * corrige uma grande classe de problemas de desempenho. "Over-rendering" é muito menos um problema quando o seu estado está no lugar certo.

---

## Recapitulação

Vamos recapitular esses princípios mais uma vez:

1. **[Não pare o fluxo de dados.](#principle-1-dont-stop-the-data-flow)** props e estado podem mudar, e os componentes devem lidar com essas mudanças sempre que acontecerem.
2. **[Esteja sempre pronto para renderizar.](#principle-2-always-be-ready-to-render)** Um componente não deve ser quebrado porque é renderizado com mais ou menos frequência.
3. **[Nenhum componente é um singleton.](#principle-3-no-component-is-a-singleton)** Mesmo que um componente seja processado apenas uma vez, seu design será aprimorado se a renderização duas vezes não o quebrar.
4. **[Mantenha o estado local isolado.](#principle-4-keep-the-local-state-isolated)** Pense em qual estado é local para uma determinada representação da interface do usuário e não coloque esse estado acima do necessário.

**Esses princípios ajudam você a escrever componentes que são [otimizados para alteração] (/optimized-for-change/). É fácil adicionar, alterá-los e excluí-los.**

E o mais importante, uma vez que nossos componentes sejam resilientes, podemos voltar ao dilema urgente de saber se os objetos devem ou não ser classificados por alfabeto.
