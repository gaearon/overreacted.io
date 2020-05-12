---
title: Escrevendo Componentes Resilientes
date: '2019-03-16'
spoiler: Quatro princípios para te colocar no caminho certo.
---

Quando as pessoas começam a aprender React, elas normalmente perguntam por um guia de estilos. Apesar de ser uma boa ideia em ter algumas regras consistentes aplicadas em todo o projeto, muitas delas são arbitrárias - então, o React não tem uma opinião muito forte sobre elas.

Você pode usar diferentes sistemas de tipagem, preferir declarações de função ou arrow functions, organizar suas props por ordem alfabética ou de uma maneira que ache confortável.

Essa flexibilidade permite [integrar o React](https://pt-br.reactjs.org/docs/add-react-to-a-website.html) a projetos com convenções já existentes. Mas, também é um convite a um debate sem fim.

**_Existem_ importantes princípios de design que todo componente deveria almejar seguir. Mas, não acho que guias de estilos englobam muito bem esses princípios. Falaremos sobre guias de estilos primeiro, e depois [veremos os princípios que _são_ úteis](#escrevendo-componentes-resilientes).**

---

## Não se Distraia com Problemas Imaginários

Antes de falarmos de princípios de design de componentes, eu gostaria de dizer algumas coisas sobre guias de estilos. Essa não é uma opinião muito popular, mas alguém precisa dizê-la!

Na comunidade JavaScript, existem alguns guias de estilo com opiniões fortes aplicados por um linter. Minha observação pessoal é de que eles tendem a criar mais fricção do que é necessário. Não consigo nem contar quantas vezes alguém me mostrou um código absolutamente válido e disse "o React reclama disso", mas na verdade era a configuração do lint deles reclamando! Isso leva a três coisas:

* As pessoas se acostumam a ver seu linter como um **guardião ruidoso e excessivamente zeloso**, ao invés de uma ferramenta útil. Avisos que são úteis acabam afundando em um mar de trivialidade.

* As pessoas não aprendem a **diferenciar os usos válidos e inválidos** de um certo padrão. Por exemplo, existe uma regra popular que impede de chamar o `setState` dentro do `componentDidMount`. Mas, se isso fosse "ruim" sempre, o React simplesmente não permitiria! Existe um caso de uso legítimo para isso, e é para medir o layout do DOM - por exemplo, para positionar uma tooltip. Já vi pessoas "contornarem" essa regra adicionando um `setTimeout`, o que foge completamente do propósito.

* Eventualmente, as pessoas adotam a "mentalidade de executor" e passam a opinar sobre coisas que **não trazem uma diferença significativa**, mas que são fáceis de identificar no código. “Você usou uma declaração de função, mas _nosso_ projeto usa arrow functions.” Sempre que tenho um sentimento forte sobre forçar uma regra como essa, olhar mais a fundo revela que investi esforço emocional nela - e fico relutante em desapegar. Me leva a uma falsa sensação de realização, sem melhorar meu código.

Estou dizendo para parar de usar o lint? De jeito nenhum!

**Com uma boa configuração, um linter é uma ótima ferramenta para pegar bugs antes que aconteçam.** É por se concentrar muito no _estilo_ que ele se torna uma distração.

---

## Seja como Marie Kondo com sua Configuração de Lint

Aqui está o que eu sugiro que você faça na segunda-feira. Junte seu time por meia hora, repasse cada uma das regras de lint habilitadas na config do seu projeto, e pergunte a si mesmo: _"Alguma vez essa regra nos ajudou a pegar um bug?"_ Caso contrário, _desligue-a_. Você também pode começar do zero com [`eslint-config-react-app`](https://www.npmjs.com/package/eslint-config-react-app), que não possui nenhuma regra de estilo.

No mínimo, seu time deveria ter um processo para remover regras de lint que causam conflitos. Nunca assuma que qualquer coisa que você ou outra pessoa adicionou à configuração do lint há um ano é uma "boa prática". Questione e busque respostas. Não deixe que ninguém diga que você não é inteligente o suficiente para escolher suas próprias regras de lint.

**Mas, e quanto à formatação?** Use o [Prettier](https://prettier.io/) e esqueça sobre essas "trivialidades nos estilos". Você não precisa de uma ferramenta que grite com você por colocar um espaço extra, se outra ferramenta pode consertá-lo por você. Use o linter para encontrar _bugs_, mas não para forçar _e s t é t i c a_

É claro, há aspectos do estilo do código que não estão diretamente relacionados à formatação, mas que ainda podem incomodar se não forem consistentes em todo o projeto.

No entanto, muitos deles são sutis demais para que sejam pegos por uma regra de lint, de qualquer forma. Por isso, é importante **construir a confiança** entre membros do time, e compartilhar aprendizados úteis na forma de uma wiki ou um guia curto de design.

Nem tudo vale à pena automatizar! Os insights ganhos por _realmente ler_ a lógica em um desses guia pode ser mais valioso do que só seguir as "regras".

**Mas, se seguir um guia de estilo rigoroso é uma distração, o que é realmente importante?**

Este é o tópico deste post.

---

## Escrevendo Componentes Resilientes

Nenhuma quantidade de indentação ou organização dos imports em ordem alfabética pode consertar um design quebrado. Então, ao invés de focar na _aparência_ de um código, vou focar em como ele _funciona_. Existem alguns princípios de design de componentes que acho muito úteis:

1. **[Não impeça o fluxo de dados](#princípio-1-não-impeça-o-fluxo-de-dados)**
2. **[Esteja sempre pronto para renderizar](#princípio-2-esteja-sempre-pronto-para-renderizar)**
3. **[Nenhum componente é um singleton](#princípio-3-nenhum-componente-é-um-singleton)**
4. **[Mantenha o estado local isolado](#princípio-4-mantenha-o-estado-local-isolado)**

Mesmo que você não use React, provavelmente descobrirá os mesmos princípios por tentativa e erro para qualquer UI no modelo de componentes com fluxo de dados unidirectional.

---

## Princípio 1: Não Impeça o Fluxo de Dados

### Não Impeça o Fluxo de Dados na Renderização

Quando alguém usa seu componente, espera que possa passar diferentes props ao longo do tempo, e que esse componente reflita essas mudanças:

```jsx
// isOk pode depender do estado e pode mudar a qualquer momento
<Button color={isOk ? 'blue' : 'red'} />
```

No geral, é assim que o React funciona por padrão. Se você usa uma prop `color` dentro de um componente `Button`, verá o valor fornecido acima para essa renderização:

```jsx
function Button({ color, children }) {
  return (
    // ✅ `color` está sempre atualizada!
    <button className={'Button-' + color}>
      {children}
    </button>
  );
}
```

No entanto, um erro comum durante o aprendizado de React é a cópia das props para o estado:

```jsx{3,6}
class Button extends React.Component {
  state = {
    color: this.props.color
  };
  render() {
    const { color } = this.state; // 🔴 `color` é sempre a mesma!
    return (
      <button className={'Button-' + color}>
        {this.props.children}
      </button>
    );
  }
}
```

Isso pode parecer mais intuitivo, a princípio, se você usou classes fora do React. **No entanto, ao copiar a prop para o estado, você está ignorando todas as atualizações dela.**

```jsx
// 🔴 Não funciona mais para atualizações com a implementação acima
<Button color={isOk ? 'blue' : 'red'} />
```

No raro caso desse comportamento _ser_ intencional, certifique-se de chamar essa prop de `initialColor` ou `defaultColor` para deixar claro que as atualizações a ela serão ignoradas.

Mas, normalmente, você irá querer **ler as props diretamente no seu componente** e evitar copiar props (ou qualquer coisa computada a partir das props) para o estado:

```jsx
function Button({ color, children }) {
  return (
    // ✅ `color` está sempre atualizada!
    <button className={'Button-' + color}>
      {children}
    </button>
  );
}
```

----

Valores computados são outra razão para as pessoas, algumas vezes, tentarem copiar props para o estado. Por exemplo, imagine que determinamos a cor do _texto do botão_ baseada em uma computação cara envolvendo a prop `color` como argumento:

```jsx{3,9}
class Button extends React.Component {
  state = {
    textColor: slowlyCalculateTextColor(this.props.color)
  };
  render() {
    return (
      <button className={
        'Button-' + this.props.color +
        ' Button-text-' + this.state.textColor // 🔴 Não mudará com atualizações da prop `color`
      }>
        {this.props.children}
      </button>
    );
  }
}
```

Esse componente está bugado porque não recalcula `this.state.textColor` na mudança da prop `color`. A forma mais fácil de consertar isso, seria mover a computação de `textColor` para o método `render` e transformar esse componente num `PureComponent`:

```jsx{1,3}
class Button extends React.PureComponent {
  render() {
    const textColor = slowlyCalculateTextColor(this.props.color);
    return (
      <button className={
        'Button-' + this.props.color +
        ' Button-text-' + textColor // ✅ Sempre atualizada
      }>
        {this.props.children}
      </button>
    );
  }
}
```

Problema resolvido! Agora, se as props mudarem, vamos recalcular a `textColor`, mas evitamos a computação cara nas mesmas props.

No entanto, talvez queiramos otimizar mais. E se fosse a prop `children` que mudasse? Parece lamentável ter que recalcular a `textColor` nesse caso. Nossa segunda tentativa poderia ser invocar o cálculo dentro do `componentDidUpdate`:

```jsx{5-12}
class Button extends React.Component {
  state = {
    textColor: slowlyCalculateTextColor(this.props.color)
  };
  componentDidUpdate(prevProps) {
    if (prevProps.color !== this.props.color) {
      // 😔 Re-renderização extra para cada atualização
      this.setState({
        textColor: slowlyCalculateTextColor(this.props.color),
      });
    }
  }
  render() {
    return (
      <button className={
        'Button-' + this.props.color +
        ' Button-text-' + this.state.textColor // ✅ Atualizada na renderização final
      }>
        {this.props.children}
      </button>
    );
  }
}
```

Entretanto, isso significaria que nosso componente faz uma segunda re-renderização depois de cada atualização. Isso também não é o ideal, já que estamos tentando otimizá-lo.

Você poderia usar o método legado de ciclo de vida `componentWillReceiveProps` para isso. No entanto, as pessoas frequentemente introduzem efeitos colaterais aí também. Isso, por sua vez, frequentemente causa problemas para as futuras [features de Renderização Concorrente como Time Slicing e Suspense](https://pt-br.reactjs.org/blog/2018/03/01/sneak-peek-beyond-react-16.html). E o método "mais seguro" `getDerivedStateFromProps` é desajeitado.

Vamos voltar alguns passos por um segundo. Efetivamente, o que queremos é [memoização](https://en.wikipedia.org/wiki/Memoization). Nós temos alguns valores entrada e não queremos recalcular o valor de saída, a não ser que a entrada mude.

Com uma classe, você poderia usar um [helper](https://reactjs.org/blog/2018/06/07/you-probably-dont-need-derived-state.html#what-about-memoization) para memoização. No entanto, Hooks levam isso a um nível além, dando-lhe uma maneira nativa de memoizar computações caras:

```jsx{2-5}
function Button({ color, children }) {
  const textColor = useMemo(
    () => slowlyCalculateTextColor(color),
    [color] // ✅ Não recalcular até que `color` mude
  );
  return (
    <button className={'Button-' + color + ' Button-text-' + textColor}>
      {children}
    </button>
  );
}
```

Esso é todo o código que você precisa!

Num componente com classes, você pode usar um helper como [`memoize-one`](https://github.com/alexreardon/memoize-one) para isso. Em um componente funcional, o Hook `useMemo` fornece uma funcionalidade similar.

Agora vemos que **mesmo otimizar computações caras não torna-se um bom motivo para copiar props para o estado.** O resultado da nossa renderização deve respeitar as mudanças nas props.

---

### Não Impeça o Fluxo de Dados em Efeitos Colaterais

Até agora, falamos sobre como manter o resultado de uma renderização consistente com a mudança de props. Evitar copiar props para o estado é parte disso. No entanto, é importante que **efeitos colaterais (por exemplo, data fetching) também sejam parte do fluxo de dados**.

Considere esse componente do React:

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
    // Faz o fetching...
  }
  getFetchUrl() {
    return 'http://myapi/results?query' + this.props.query;
  }
  render() {
    // ...
  }
}
```

Vários componentes do React se parecem com isso - mas se olharmos mais de perto, notaremos um bug. O método `fetchResults` usa a prop `query` para fazer o fetch:

```jsx{2}
  getFetchUrl() {
    return 'http://myapi/results?query' + this.props.query;
  }
```

Mas, e se a prop `query` mudar? No nosso componente, nada vai acontecer. **Isso significa que os efeitos colaterais do componente não respeitam mudanças nas props.** Essa é uma origem muito comum de bugs em aplicações React.

A fim de consertar nosso componente, precisamos:

* Olhar para o `componentDidMount` e todos os métodos chamados a partir dele.
  - No nosso exemplo, são o `fetchResults` e o `getFetchUrl`.
* Escrever todas as props e estado usados por esses métodos.
  - Em nosso exemplo, é `this.props.query`.
* Garantir que, sempre que essas props mudarem, nós executamos novamente o efeito colateral.
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
    if (prevProps.query !== this.props.query) { // ✅ Refaz o fetch ao mudar
      this.fetchResults();
    }
  }
  fetchResults() {
    const url = this.getFetchUrl();
    // Faz o fetching...
  }
  getFetchUrl() {
    return 'http://myapi/results?query' + this.props.query; // ✅ Lidamos com as atualizações
  }
  render() {
    // ...
  }
}
```

Agora, nosso código respeita todas as mudanças nas props, inclusive em efeitos colaterais.

Entretanto, é um desafio se lembrar disso para não quebrar novamente. Por exemplo, nós poderíamos adicionar `currentPage` ao estado local, e usar no `getFetchUrl`:

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
    // Faz o fetching...
  }
  getFetchUrl() {
    return (
      'http://myapi/results?query' + this.props.query +
      '&page=' + this.state.currentPage // 🔴 Atualizações são ignoradas
    );
  }
  render() {
    // ...
  }
}
```
Infelizmente, nosso código está bugado outra vez, porque nosso efeito colateral não respeita mudanças à `currentPage`.

**Props e estado são parte do fluxo de dados do React. Ambos renderização e efeitos colaterais deveriam refletir as mudanças nesse fluxo de dados, não ignorá-las!**

Para consertar nosso código, podemos repetir os passos acima:

* Olhar para o `componentDidMount` e todos os métodos chamados a partir dele.
  - No nosso exemplo, são o `fetchResults` e o `getFetchUrl`.
* Escrever todas as props e estado usados por esses métodos.
  - Em nosso exemplo, é `this.props.query` **e `this.state.currentPage`**.
* Garantir que, sempre que essas props mudarem, nós executamos novamente o efeito colateral.
  - Podemos fazer isso adicionando o método `componentDidUpdate`.

Vamos consertar nosso componente para lidar com as atualizações ao estado de `currentPage`:

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
      prevState.currentPage !== this.state.currentPage || // ✅ Refaz o fetch ao mudar
      prevProps.query !== this.props.query
    ) {
      this.fetchResults();
    }
  }
  fetchResults() {
    const url = this.getFetchUrl();
    // Faz o fetching...
  }
  getFetchUrl() {
    return (
      'http://myapi/results?query' + this.props.query +
      '&page=' + this.state.currentPage // ✅ Lidamos com as atualizações
    );
  }
  render() {
    // ...
  }
}
```

**Não seria bom se pudéssemos, de alguma forma, pegar esses erros automaticamente?** Isso não seria algo em que um linter poderia nos ajudar?

---

Infelizmente, checar automaticamente um componente com classes por consistências é muito difícil. Qualquer método pode chamar qualquer outro. Analisar estaticamente as chamadas do `componentDidMount` e `componentDidUpdate` está sujeita a falsos positivos.

Entretanto, uma pessoa _poderia_ projetar uma API que _pode_ ser analisada estaticamente por consistências. O [Hook do React `useEffect`](/a-complete-guide-to-useeffect/) é um exemplo de tal API:

```jsx{13-14,19}
function SearchResults({ query }) {
  const [data, setData] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);

  useEffect(() => {
    function fetchResults() {
      const url = getFetchUrl();
      // Faz o fetching...
    }

    function getFetchUrl() {
      return (
        'http://myapi/results?query' + query +
        '&page=' + currentPage
      );
    }

    fetchResults();
  }, [currentPage, query]); // ✅ Refaz o fetch ao mudar

  // ...
}
```

Colocamos a lógica _dentro_ do efeito, e isso torna fácil em saber _de quais valores do fluxo de dados do React_ ele depende. Esses valores são chamados de "dependências", e no nosso exemplo, elas são `[currentPage, query]`.

Note como esse array de "dependências de efeito" não é um novo conceito. Em uma classe, tínhamos que buscar por essas "dependências" através de todas as chamadas de métodos. A API do `useEffect` apenas torna explícito esse mesmo conceito.

Isso, por sua vez, permite que as validemos automaticamente:

![Demo of exhaustive-deps lint rule](./useeffect.gif)

_(Isso é uma demo da nova regra de lint recomendada `exhaustive-deps` que é parte do `eslint-plugin-react-hooks`. Em breve, será incluída no Create React App.)_

**Observe que é importante respeitar todas as atualizações de prop e estado dos efeitos, independentemente de você estar escrevendo o componente como uma classe ou uma função.**

Com a API de classes, você mesmo deve pensar sobre a consistência e verificar se as alterações em cada prop ou estado relevantes são tratadas pelo `componentDidUpdate`. Caso contrário, seu componente não é resiliente para mudanças de prop ou estado. Esse nem é um problema específico do React. Aplica-se a qualquer biblioteca de UI que permite manipular a "criação" e as "atualizações" separadamente.

**A API do `useEffect` inverte o padrão ao incentivar a consistência.** Isso [pode parecer estranho a princípio](/a-complete-guide-to-useeffect/), mas, como resultado, seu componente se torna mais resistente a alterações na lógica. E como as "dependências" agora estão explícitas, podemos _verificar_ se o efeito é consistente usando uma regra de lint. Estamos usando um linter para capturar bugs!

---

### Não Impeça o Fluxo de Dados em Otimizações

Existe mais um caso em que você pode, acidentalmente, ignorar mudanças às props. Esse erro pode ocorrer quando você está otimizando seus componentes manualmente.

Observe que abordagens de otimização que usam igualdade rasa como `PureComponent` e `React.memo` com a comparação padrão são seguras.

**Entretanto, se você tentar "otimizar" um componente escrevendo suas próprias comparações, você pode acidentalmente esquecer de comparar props de funções**:

**However, if you try to “optimize” a component by writing your own comparison, you may mistakenly forget to compare function props:**

```jsx{2-5,7}
class Button extends React.Component {
  shouldComponentUpdate(prevProps) {
    // 🔴 Não compara this.props.onClick 
    return this.props.color !== prevProps.color;
  }
  render() {
    const onClick = this.props.onClick; // 🔴 Não reflete as atualizações
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

É fácil perder esse erro em um primeiro momento, porque com classes você normalmente passaria para baixo um _método_, então ele teria a mesma identidade de qualquer forma:

```jsx{2-4,9-11}
class MyForm extends React.Component {
  handleClick = () => { // ✅ Sempre a mesma função
    // Faz algo
  }
  render() {
    return (
      <>
        <h1>Olá!</h1>
        <Button color='green' onClick={this.handleClick}>
          Clique-me
        </Button>
      </>
    )
  }
}
```

Logo, nossa otimização não quebra _imediatamente_. No entanto, continuará "enxergando" o valor antigo do `onClick`, se mudar ao longo do tempo e outras props não:

```jsx{6,13-15}
class MyForm extends React.Component {
  state = {
    isEnabled: true
  };
  handleClick = () => {
    this.setState({ isEnabled: false });
    // Faz algo
  }
  render() {
    return (
      <>
        <h1>Olá!</h1>
        <Button color='green' onClick={
          // 🔴 Button ignora atualizações à prop onClick
          this.state.isEnabled ? this.handleClick : null
        }>
          Clique-me
        </Button>
      </>
    )
  }
}
```

Nesse exemplo, clicar no botão deveria desabilitá-lo - mas isso não ocorre, porque o componente `Button` ignora qualquer atualização à prop `onClick`.

Isso poderia se tornar ainda mais confuso se a identidade da própria função depende de algo que pode mudar ao longo do tempo, como `draft.content` nesse exemplo:

```jsx{6-7}
  drafts.map(draft =>
    <Button
      color='blue'
      key={draft.id}
      onClick={
        // 🔴 Button ignora atualizações à prop onClick
        this.handlePublish.bind(this, draft.content)
      }>
      Publicar
    </Button>
  )
```

Enquanto `draft.content` pode mudar ao longo do tempo, nosso componente `Button` ignora mudanças à prop `onClick`, de forma que continua a enxergar a "primeira versão" do método `onClick` vinculado com o `draft.content` original.

**Então, como evitamos esse problema?**

Recomendo evitar implementar manualmente o `shouldComponentUpdate` e evitar especificar comparações customizadas no `React.memo()`. A comparação padrão no `React.memo` respeitará mudanças na identidade da função:

```jsx{11}
function Button({ onClick, color, children }) {
  const textColor = slowlyCalculateTextColor(color);
  return (
    <button
      onClick={onClick}
      className={'Button-' + color + ' Button-text-' + textColor}>
      {children}
    </button>
  );
}
export default React.memo(Button); // ✅ Usa comparação rasa
```

Em uma classe, `PureComponent` tem o mesmo comportamento.

Isso garante que passar uma função diferente como uma prop sempre funcionará.

Se você insiste em fazer uma comparação customizada, **tenha certeza que não pulará funções**:

```jsx{5}
  shouldComponentUpdate(prevProps) {
    // ✅ Compara this.props.onClick 
    return (
      this.props.color !== prevProps.color ||
      this.props.onClick !== prevProps.onClick
    );
  }
```

Como mencionei anteriormente, é fácil deixar escapar esse problema em um componente com classes, porque identidades de métodos são estáveis, normalmente (mas não sempre - e é aí que fica difícil depurar os bugs). Com Hooks, a situação é um pouco diferente:

1. Funções são diferentes _em cada renderização_, então você descobrirá esse problema [no mesmo momento](https://github.com/facebook/react/issues/14972#issuecomment-468280039).
2. Com `useCallback` e `useContext`, você pode [evitar passar funções a níveis muito profundos](https://reactjs.org/docs/hooks-faq.html#how-to-avoid-passing-callbacks-down). Isso deixa você otimizar a renderização sem precisar se preocupar com funções.

---

Para resumir essa seção, **não interrompa o fluxo de dados!**

Sempre que você usar props e estado, considere o que aconteceria se eles mudarem. Na maioria dos cados, um componente não deveria tratar de forma diferente a primeira renderização das suas atualizações. Isso o torna resiliente à mudanças na lógica.

Com classes, é fácil se esquecer sobre atualizações quando usando props e estado dentro de métodos do ciclo de vida. Hooks o levam a fazer a coisa certa - mas isso requer um ajuste de mentalidade, se você já não estiver acostumado a fazer.

---

## Princípio 2: Esteja Sempre Pronto para Renderizar

Componentes React permitem a você escrever código renderizável sem se preocupar muito com o tempo. Você descreve como a UI _deveria_ ser a qualquer momento, e o React faz acontecer. Usufrua da vantagem desse modelo!

Não tente introduzir suposições desnecessárias sobre tempo no comportamento do seu componente. **Seu componente deve estar pronto para re-renderizar a qualquer momento.**

Como alguém pode violar esse princípio? React não facilita muito - mas você pode fazê-lo usando o método legado de ciclo de vida `componentWillReceiveProps`:

```jsx{5-8}
class TextInput extends React.Component {
  state = {
    value: ''
  };
  // 🔴 Reseta o estado local cada vez que o componente pai renderizar
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

Nesse exemplo, mantemos a variável `value` no estado local, mas também recebemos `value` das props. Sempre que "recebemos novas props", resetamos o `value` no estado.

**O problema com esse pattern é que depende inteiramente de tempo acidental**.

Talvez hoje o pai desse componente atualize raramente, então nosso `TextInput` só "recebe props" quando algo importante acontece, como salvar um formulário.

Mas, amanhã talvez você adicione alguma animação ao pai do `TextInput`. Se o pai dele re-renderizar mais frequentemente, ficará sempre ["limpando"](https://codesandbox.io/s/m3w9zn1z8x) o estado do filho! Você pode ler mais sobre esse problema em [Você Provavelmente Não Precisa de Estado Derivado](https://pt-br.reactjs.org/blog/2018/06/07/you-probably-dont-need-derived-state.html).

**Então, como podemos consertar isso?**

Primeiramente, precisamos consertar nosso modelo mental. Precisamos parar de pensar que "receber props" é algo diferente de "renderizar". Uma re-renderização causada por um componente pai, não deveria se comportar diferentemente de uma re-renderização causada por uma mudança de estado local. **Componentes deveriam ser resistentes à renderizar numa frequência maior ou menor, caso contrário eles estão muito acoplados aos seus pais.**

_([Essa demo](https://codesandbox.io/s/m3w9zn1z8x) mostra como a re-renderização pode quebrar componentes frágeis.)_

Apesar de existirem [diferentes](https://pt-br.reactjs.org/blog/2018/06/07/you-probably-dont-need-derived-state.html#preferred-solutions) [soluções](https://pt-br.reactjs.org/docs/hooks-faq.html#how-do-i-implement-getderivedstatefromprops) para quando você _realmente_ deseja derivar seu estado das props, normalmente você deveria usar um componente controlado:

```jsx
// Opção 1: Componente completamente controlado.
function TextInput({ value, onChange }) {
  return (
    <input
      value={value}
      onChange={onChange}
    />
  );
}
```

Ou você poderia usar um componente não controlado, com uma chave para resetá-lo:

```jsx
// Opção 2: Componente completamente não controlado.
function TextInput() {
  const [value, setValue] = useState('');
  return (
    <input
      value={value}
      onChange={e => setValue(e.target.value)}
    />
  );
}

// Podemos resetar esse estado interno depois, mudando a key:
<TextInput key={formId} />
```

O que podemos levar dessa seção é que seu componente não deveria quebrar só porque ele, ou seu pai, re-renderizam mais frequentemente. O design da API do React facilita isso se você evitar o método legado de ciclo de vida `componentWillReceiveProps`.

Para estressar seu componente, você pode adicionar esse código no componente pai, temporariamente:

```jsx{2}
componentDidMount() {
  // Não se esqueça de remover isso imediatamente!
  setInterval(() => this.forceUpdate(), 100);
}
```

**Não deixe esse código aí** - é apenas uma forma rápida de checar o que acontece quando um componente pai re-renderiza mais rápido do que você esperava. Não deveria quebrar o componente filho!

---

Você deve estar pensando: "Vou continuar resetando o estado quando as props mudarem, mas posso prevenir re-renderizações desnecessárias com o `PureComponent`".

Esse código deveria funcionar, certo?

```jsx{1-2}
// 🤔 Deveria impedir re-renderizações desnecessárias... certo?
class TextInput extends React.PureComponent {
  state = {
    value: ''
  };
  // 🔴 Reseta o estado local a cada renderização do pai
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

Num primeiro momento, parece que esse componente resolve o problema de "limpar" o estado quando o pai re-renderiza. Afinal, se as props são as mesmas, apenas pulamos a atualização - e, então, `componentWillReceiveProps` não é chamado.

No entanto, isso nos dá o falso senso de segurança. **Esse componente ainda não é resistente à _verdadeiras_ mudanças nas props**. Por exemplo, se adicionarmos _outra_ prop que muda frequentemente, como um `style` animado, ainda "perderíamos" o estado interno:

```jsx{2}
<TextInput
  style={{opacity: someValueFromState}}
  value={
    // 🔴 componentWillReceiveProps no TextInput
    // reseta para esse valor a cada passagem da animação.
    value
  }
/>
```

Então, essa abordagem ainda é falha. Podemos ver que várias otimizações como `PureComponent`, `shouldComponentUpdate`, e `React.memo` não deveriam ser usadas para controlar _comportamento_. Apenas use-as para melhorar _performance_ onde ajudar. Se ao remover uma otimização o componente _quebra_, então ele já era frágil demais.

A solução aqui é a mesma que descrevemos anteriormente. Não trate o ato de "receber props" como um evento especial. Evite "sincronizar" props e estado. Na maioria dos casos, cada valor deveria ser controlado completamente (através das props), ou não controlado (no estado local). Evite derivar o estado [quando puder](https://pt-br.reactjs.org/blog/2018/06/07/you-probably-dont-need-derived-state.html#preferred-solutions). **E sempre esteja preparado para renderizar!**

---

## Principle 3: No Component Is a Singleton

Sometimes we assume a certain component is only ever displayed once. Such as a navigation bar. This might be true for some time. However, this assumption often causes design problems that only surface much later. 

For example, maybe you need to implement an animation *between* two `Page` components on a route change — the previous `Page` and the next `Page`. Both of them need to be mounted during the animation. However, you might discover that each of those components assumes it’s the only `Page` on the screen.

It’s easy to check for these problems. Just for fun, try to render your app twice:

```jsx{3,4}
ReactDOM.render(
  <>
    <MyApp />
    <MyApp />
  </>,
  document.getElementById('root')
);
```

Click around. (You might need to tweak some CSS for this experiment.)

**Does your app still behave as expected?** Or do you see strange crashes and errors? It’s a good idea to do this stress test on complex components once in a while, and ensure that multiple copies of them don’t conflict with one another.

An example of a problematic pattern I’ve written myself a few times is performing global state “cleanup” in `componentWillUnmount`:

```jsx{2-3}
componentWillUnmount() {
  // Resets something in Redux store
  this.props.resetForm();
}
```

Of course, if there are two such components on the page, unmounting one of them can break the other one. Resetting “global” state on *mount* is no better:

```jsx{2-3}
componentDidMount() {
  // Resets something in Redux store
  this.props.resetForm();
}
```

In that case *mounting* a second form will break the first one.

These patterns are good indicators of where our components are fragile. ***Showing* or *hiding* a tree shouldn’t break components outside of that tree.**

Whether you plan to render this component twice or not, solving these issues pays off in the longer term. It leads you to a more resilient design.

---

## Principle 4: Keep the Local State Isolated

Consider a social media `Post` component. It has a list of `Comment` threads (that can be expanded) and a `NewComment` input.

React components may have local state. But what state is truly local? Is the post content itself local state or not? What about the list of comments? Or the record of which comment threads are expanded? Or the value of the comment input?

If you’re used to putting everything into a “state manager”, answering this question can be challenging. So here’s a simple way to decide.

**If you’re not sure whether some state is local, ask yourself: “If this component was rendered twice, should this interaction reflect in the other copy?” Whenever the answer is “no”, you found some local state.**

For example, imagine we rendered the same `Post` twice. Let’s look at different things inside of it that can change.

* *Post content.* We’d want editing the post in one tree to update it in another tree. Therefore, it probably **should not** be the local state of a `Post` component. (Instead, the post content could live in some cache like Apollo, Relay, or Redux.)

* *List of comments.* This is similar to post content. We’d want adding a new comment in one tree to be reflected in the other tree too. So ideally we would use some kind of a cache for it, and it **should not** be a local state of our `Post`.

* *Which comments are expanded.* It would be weird if expanding a comment in one tree would also expand it in another tree. In this case we’re interacting with a particular `Comment` *UI representation* rather than an abstract “comment entity”. Therefore, an “expanded” flag **should** be a local state of the `Comment`.

* *The value of new comment input.* It would be odd if typing a comment in one input would also update an input in another tree. Unless inputs are clearly grouped together, usually people expect them to be independent. So the input value **should** be a local state of the `NewComment` component.

I don’t suggest a dogmatic interpretation of these rules. Of course, in a simpler app you might want to use local state for everything, including those “caches”. I’m only talking about the ideal user experience [from the first principles](/the-elements-of-ui-engineering/).

**Avoid making truly local state global.** This plays into our topic of “resilience”: there’s fewer surprising synchronization happening between components. As a bonus, this *also* fixes a large class of performance issues. “Over-rendering” is much less of an issue when your state is in the right place.

---

## Recap

Let’s recap these principles one more time:

1. **[Don’t stop the data flow.](#principle-1-dont-stop-the-data-flow)** Props and state can change, and components should handle those changes whenever they happen.
2. **[Always be ready to render.](#principle-2-always-be-ready-to-render)** A component shouldn’t break because it’s rendered more or less often.
3. **[No component is a singleton.](#principle-3-no-component-is-a-singleton)** Even if a component is rendered just once, your design will improve if rendering twice doesn’t break it.
4. **[Keep the local state isolated.](#principle-4-keep-the-local-state-isolated)** Think about which state is local to a particular UI representation — and don’t hoist that state higher than necessary.

**These principles help you write components that are [optimized for change](/optimized-for-change/). It’s easy to add, change them, and delete them.**

And most importantly, once our components are resilient, we can come back to the pressing dilemma of whether or not props should be sorted by alphabet.
