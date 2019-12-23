---
title: Escrevendo Componentes Resilientes
date: '2019-03-16'
spoiler: Quatro princípios para colocá-lo no caminho certo.
---

Quando as pessoas começam a aprender React, geralmente pedem um guia de estilo. Embora seja uma boa ideia aplicar regras consistentes em um projeto, muitas delas são arbitrárias - então React não tem uma opinião forte sobre elas.

Você pode usar diferentes sistemas de tipos, preferir declarações de funções ou arrow functions (funções com a seta =>), classificar seus props em ordem alfabética ou em uma ordem que você achar agradável.

Essa flexibilidade permite [integrar React](https://reactjs.org/docs/add-react-to-a-website.html) em projetos com convenções existentes. Mas também convida a debates intermináveis.

**Existem _alguns_ princípios importantes de design que cada componente deve se esforçar para seguir. Mas eu não acho que os guias de estilo capturem bem esses princípios. Falaremos sobre os guias de estilo primeiro, e em seguida [veremos os princípios que realmente _são_ úteis](#escrevendo-componentes-resilientes).**

---

## Não se distraia com problemas imaginários

Antes de falarmos sobre os princípios de design de componentes, quero dizer algumas palavras sobre os guias de estilo. Esta não é uma opinião popular, mas alguém precisa dizer isso!

Na comunidade JavaScript, existem alguns guias de estilo rigorosos e opinativos aplicados por um linter. Minha observação pessoal é que eles tendem a criar mais atrito do que valem. Não sei contar quantas vezes alguém me mostrou um código absolutamente válido e disse: "React está reclamando sobre isso", mas foi a sua configuração de linter reclamando! Isso leva a três problemas:

* As pessoas se acostumam a ver o linter como **um porteiro barulhento** em vez de uma ferramenta útil. Avisos úteis são abafados por um mar de lêndeas estilizadas. Como resultado, as pessoas não examinam as mensagens do linter durante a depuração e perdem dicas úteis. Além disso, as pessoas que estão menos acostumadas a escrever JavaScript (por exemplo, designers) têm mais dificuldade em trabalhar com o código.

* As pessoas não aprendem a **diferenciar entre usos válidos e inválidos** de um determinado padrão. Por exemplo, existe uma regra popular que proíbe chamar `setState` dentro de `componentDidMount`. Mas se sempre fosse "ruim", React simplesmente não permitiria! Existe um caso de uso legítimo para isso, que é medir o layout do nó DOM (Document object model) - por exemplo, para posicionar uma dica de ferramenta. Eu já vi pessoas "contornando" essa regra adicionando um `setTimeout` que perde completamente o objetivo.

* Eventualmente, as pessoas adotam a "mentalidade de executor" e possuem fortes opiniões sobre coisas que **não trazem uma diferença significativa** mas são fáceis de procurar no código. “Você usou uma declaração de função, mas *nosso* projeto usa funções de seta (Arrow functions =>).” Sempre que tenho um forte sentimento de impor uma regra como essa, uma análise mais profunda revela que investi esforço emocional nessa regra - e luto para deixá-la ir. Isso me leva a uma falsa sensação de realização sem melhorar meu código.

Estou dizendo que deveríamos parar de usar linter? De modo nenhum!

**Com uma boa configuração, um linter é uma ótima ferramenta para detectar bugs antes que eles aconteçam.** Ele está focando demais no *estilo* o que o transforma em uma distração.

---

## Marie Kondo Suas Configurações de Linter

Aqui está o que eu sugiro que você faça na segunda-feira. Reúna sua equipe por meia hora, repasse todas as regras de linter ativadas na configuração do seu projeto e pergunte a si mesmo: *“Essa regra já nos ajudou a detectar um bug?”* Caso não, *desligue-o.* (Você também pode iniciar a partir de uma lista limpa com [`eslint-config-react-app`](https://www.npmjs.com/package/eslint-config-react-app) que não possui regras de estilo.)

No mínimo, sua equipe deve ter um processo para remover regras que causam atrito. Não presuma que tudo o que você ou alguma outra pessoa adicionou à sua configuração de linter há um ano é uma "prática recomendada". Faça perguntas e procure respostas. Não deixe ninguém lhe dizer que você não é inteligente o suficiente para escolher suas regras de linter.

**Mas e quanto à formatação?** Use [Prettier](https://prettier.io/) e esqueça as "lêndeas de estilo". Você não precisa de uma ferramenta para gritar com você por colocar um espaço extra se outra ferramenta puder corrigi-lo. Use o linter para encontrar *bugs*, sem impor as *e s t é t i c a s*.

Obviamente, existem aspectos do estilo de codificação que não estão diretamente relacionados à formatação, mas ainda podem ser irritantes quando são inconsistentes no projeto.

No entanto, muitos deles são sutis demais para serem capturados com uma regra de linter. É por isso que é importante **criar confiança** entre os membros da equipe e compartilhar aprendizados úteis na forma de uma página da wiki ou de um breve guia de design.

Nem tudo vale a pena automatizar! Os insights obtidos com a *real leitura* do raciocínio de um guia podem ser mais valiosos do que seguir as "regras".

**Mas se seguir um guia de estilo rigoroso é uma distração, o que é realmente importante?**

Esse é o tópico deste post.

---

## Escrevendo Componentes Resilientes

Nenhuma quantidade de indentação ou classificação em ordem alfabética pode corrigir um design quebrado. Então, ao invés de focar em como algum código *aparenta*, vou me concentrar em como ele *funciona*. Existem alguns princípios de design de componentes que considero muito úteis:

1. **[Não interrompa o fluxo de dados](#Princípio-1:-Não-Interrompa-o-Fluxo-de-Dados)**
2. **[Esteja sempre pronto para renderizar](#Princípio-2:-Esteja-sempre-pronto-para-renderizar)**
3. **[Nenhum componente é um singleton](#Princípio-3:-Nenhum-Componente-é-um-Singleton)**
4. **[Mantenha o estado local isolado](#Princípio-4:-Mantenha-o-State-Local-Isolado)**

Mesmo se você não usar React, provavelmente descobrirá os mesmos princípios por tentativa e erro para qualquer modelo de componente de interface do usuário com fluxo de dados unidirecional.

---

## Princípio 1: Não Interrompa o Fluxo de Dados

### Não Interrompa O Fluxo de Dados na Renderização

Quando alguém usa o seu componente, eles esperam poder passar diferentes propriedades ao longo do tempo, e que o componente reflita essas alterações:

```jsx
// isOk pode ser impulsionado pelo estado e pode mudar a qualquer momento
<Button color={isOk ? 'blue' : 'red'} />
```

Em geral, é assim que o React funciona por padrão. Se você usar uma propriedade `color` dentro de um componente `Button`, verá o valor fornecido para essa renderização:

```jsx
function Button({ color, children }) {
  return (
    // ✅ `color` é sempre recente!
    <button className={'Button-' + color}>
      {children}
    </button>
  );
}
```

No entanto, um erro comum ao aprender React é copiar propriedades (props) dentro do estado (state):

```jsx{3,6}
class Button extends React.Component {
  state = {
    color: this.props.color
  };
  render() {
    const { color } = this.state; // 🔴 `color` é obsoleto!
    return (
      <button className={'Button-' + color}>
        {this.props.children}
      </button>
    );
  }
}
```

Isso pode parecer mais intuitivo a princípio se você já usou classes fora do React. **No entanto, ao copiar uma propriedade (prop) para dentro do estado (state), você está ignorando todas as atualizações.**

```jsx
// 🔴 Não funciona mais para atualizações com a implementação acima
<Button color={isOk ? 'blue' : 'red'} />
```

Nos raros casos em que esse comportamento *é* intencional, chame esse prop de `initialColor` ou `defaultColor` para esclarecer que as alterações nele são ignoradas.

Mas geralmente você deseja **ler as propriedades (props) diretamente no seu componente** e evitar copiar props (ou qualquer coisa calculada a partir dos props) para dentro do estado (state):

```jsx
function Button({ color, children }) {
  return (
    // ✅ `color` é sempre recente!
    <button className={'Button-' + color}>
      {children}
    </button>
  );
}
```

---

Valores computados são outra razão pela qual as pessoas às vezes tentam copiar propriedade (props) dentro do estado (state). Por exemplo, imagine que determinamos a cor do *texto do botão* com base em um cálculo complexo com background `color` como argumento:

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

Este componente é defeituoso porque não recalcula `this.state.textColor` na alteração da propriedade (prop) `color`. A correção mais fácil seria mover o cálculo `textColor` para o método `render` e torná-lo um `PureComponent`:

```jsx{1,3}
class Button extends React.PureComponent {
  render() {
    const textColor = slowlyCalculateTextColor(this.props.color);
    return (
      <button className={
        'Button-' + this.props.color +
        ' Button-text-' + textColor // ✅ Sempre atualizado
      }>
        {this.props.children}
      </button>
    );
  }
}
```

Problema resolvido! Agora se as propriedades (props) mudarem, recalcularemos `textColor`, mas evitaremos o cálculo caro nos mesmos props.

No entanto, podemos otimizá-lo ainda mais. E se os `children` que mudaram? Parece lamentável recalcular o `textColor` nesse caso. Nossa segunda tentativa pode ser invocar o cálculo em `componentDidUpdate`:

```jsx{5-12}
class Button extends React.Component {
  state = {
    textColor: slowlyCalculateTextColor(this.props.color)
  };
  componentDidUpdate(prevProps) {
    if (prevProps.color !== this.props.color) {
      // 😔 Extra renderização para cada atualização
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

No entanto, isso significa que nosso componente é re-renderizado após cada alteração. Também não é o ideal se estamos tentando otimizá-lo.

Você pode usar o antigo método `componentWillReceiveProps` para isso. No entanto, as pessoas costumam colocar efeitos colaterais lá também. Isso, por sua vez, costuma causar problemas para a próxima renderização simultânea [recursos como Time Slicing e Suspense](https://reactjs.org/blog/2018/03/01/sneak-peek-beyond-react-16.html). E o método "mais seguro" `getDerivedStateFromProps` é desajeitado.

Vamos voltar um pouco. Efetivamente, queremos [*memoization*](https://en.wikipedia.org/wiki/Memoization). Temos algumas entradas e não queremos recalcular a saída, a menos que as entradas sejam alteradas.

Com uma classe, você pode usar um [helper](https://reactjs.org/blog/2018/06/07/you-probably-dont-need-derived-state.html#what-about-memoization) para memorização. No entanto, Hooks dão um passo adiante, oferecendo uma maneira integrada de memorizar cálculos caros:

```jsx{2-5}
function Button({ color, children }) {
  const textColor = useMemo(
    () => slowlyCalculateTextColor(color),
    [color] // ✅ Não recalcule ate que `color` sofra alterações
  );
  return (
    <button className={'Button-' + color + ' Button-text-' + textColor}>
      {children}
    </button>
  );
}
```

Esse é todo o código que você precisa!

Em um componente de classe, você pode usar um auxiliar como [`memoize-one`](https://github.com/alexreardon/memoize-one) para isso. Em um componente de função, `useMemo` Hook fornece uma funcionalidade semelhante.

Agora vemos que **otimizar cálculos caros não é um bom motivo para copiar propriedade (props) dentro do estado (state).** Nosso resultado de renderização deve respeitar as alterações nos props.

---

### Não Interrompa o Fluxo de Dados em Efeitos Colaterais

Até agora, falamos sobre como manter o resultado da renderização consistente com as alterações das propriedades (props). Evitar copiar props para o estado (state) faz parte disso. No entanto, é importante que **efeitos colaterais (por exemplo, carregamento de dados) também façam parte do fluxo de dados**.

Considere esse componente React:

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

Muitos componentes React são assim - mas se olharmos um pouco mais de perto, perceberemos um erro. O método `fetchResults` usa a `query` prop para a busca de dados:

```jsx{2}
  getFetchUrl() {
    return 'http://myapi/results?query' + this.props.query;
  }
```

Mas e se a `query` prop mudar? No nosso componente, nada vai acontecer. **Isso significa que os efeitos colaterais do nosso componente não respeitam alterações em seus props.** Essa é uma fonte muito comum de bugs em aplicações React.

Para consertar nosso componente, nós precisamos de:

* Veja `componentDidMount` e todos os métodos chamados a partir dele.
  - Em nosso exemplo, os métodos são `fetchResults` e `getFetchUrl`.
* Escreva todos os props e o state usado por esses métodos.
  - Em nosso exemplo, eles são `this.props.query`.
 * Certifique-se de que sempre que esses props forem alterados, executemos novamente o efeito colateral.
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
    if (prevProps.query !== this.props.query) { // ✅ Atualize em uma mudança
      this.fetchResults();
    }
  }
  fetchResults() {
    const url = this.getFetchUrl();
    // Faça o carregamento...
  }
  getFetchUrl() {
    return 'http://myapi/results?query' + this.props.query; // ✅ Atualizações são tratadas
  }
  render() {
    // ...
  }
}
```

Agora, nosso código respeita todas as alterações nos props, mesmo para efeitos colaterais.

No entanto, é um desafio lembrar de não quebrá-lo novamente. Por exemplo, podemos adicionar `currentPage` ao estado (state) local e usá-lo em `getFetchUrl`:

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
    // Faça o carregamento...
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

Infelizmente, nosso código está novamente com erros porque nosso efeito colateral não respeita as alterações em `currentPage`.

**Props e estado fazem parte do fluxo de dados do React. Tanto a renderização quanto os efeitos colaterais devem refletir alterações no fluxo de dados, não ignorá-las!**

Para corrigir nosso código, podemos repetir as etapas acima:

* Veja `componentDidMount` e todos os métodos chamados a partir dele.
  - Em nosso exemplo, os métodos são `fetchResults` e `getFetchUrl`.
* Escreva todos os props e o state usado por esses métodos.
  - Em nosso exemplo, eles são `this.props.query` **e `this.state.currentPage`**..
* Certifique-se de que sempre que esses props forem alterados, executemos novamente o efeito colateral.
  - Podemos fazer isso adicionando o método `componentDidUpdate`.

Vamos corrigir nosso componente para lidar com atualizações no state `currentPage`:

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
      prevState.currentPage !== this.state.currentPage || // ✅ Recarregue nas mudanças
      prevProps.query !== this.props.query
    ) {
      this.fetchResults();
    }
  }
  fetchResults() {
    const url = this.getFetchUrl();
    // Faça o carregamento...
  }
  getFetchUrl() {
    return (
      'http://myapi/results?query' + this.props.query +
      '&page=' + this.state.currentPage // ✅ Atualizações são tratadas
    );
  }
  render() {
    // ...
  }
}
```

**Não seria bom se, de alguma forma, pudéssemos detectar esses erros automaticamente?** Não é algo que um linter poderia nos ajudar?

---

Infelizmente, a verificação automática de um componente de classe quanto à consistência é muito difícil. Qualquer método pode chamar qualquer outro método. A análise estatística de chamadas de `componentDidMount` e `componentDidUpdate` é repleta de falsos positivos.

No entanto, é *possível* projetar uma API que *possa* ser estaticamente analisada quanto à consistência. O [React `useEffect` Hook](/a-complete-guide-to-useeffect/) é um exemplo dessa API:

```jsx{13-14,19}
function SearchResults({ query }) {
  const [data, setData] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);

  useEffect(() => {
    function fetchResults() {
      const url = getFetchUrl();
      // Faça o carregamento...
    }

    function getFetchUrl() {
      return (
        'http://myapi/results?query' + query +
        '&page=' + currentPage
      );
    }

    fetchResults();
  }, [currentPage, query]); // ✅ Recarregue nas mudanças

  // ...
}
```

Colocamos a lógica *dentro* do efeito, e isso facilita a visualização *de quais valores do fluxo de dados React* eles dependem. Esses valores são chamados de "dependências" e, em nosso exemplo, são `[currentPage, query]`.

Observe como esse conjunto de "dependências de efeitos" não é realmente um conceito novo. Em uma classe, tivemos que procurar essas "dependências" através de todas as chamadas de método. A API `useEffect` apenas torna explícito o mesmo conceito.

Isso, por sua vez, permite validá-los automaticamente:

![Demo of exhaustive-deps lint rule](./useeffect.gif)

*(Esta é uma demonstração da nova recomendação `exhaustive-deps` de regra de linter, que faz parte do `eslint-plugin-react-hooks`. Em breve será incluída no Create React App.)*

**Observe que é importante respeitar todas as atualizações de prop e state dos efeitos, independentemente de você estar escrevendo o componente como uma classe ou uma função.**

Com a API da classe, você deve pensar na consistência e verificar se as alterações em cada objeto ou estado relevante são tratadas pelo `componentDidUpdate`. Caso contrário, seu componente não é resiliente para alterações no prop e state. Esse nem é um problema específico do React. Aplica-se a qualquer biblioteca de interface do usuário que permite manipular a "criação" e as "atualizações" separadamente.

**A API `useEffect` inverte o padrão, incentivando a consistência.** Isso [pode parecer estranho a princípio](/a-complete-guide-to-useeffect/), mas como resultado, seu componente se torna mais resiliente a alterações na lógica. E como as “dependências” agora são explícitas, podemos *verificar* se o efeito é consistente usando uma regra de linter. Estamos usando um linter para capturar bugs!

---

### Não Interrompa o Fluxo de Dados nas Otimizações

Há mais um caso em que você acidentalmente pode ignorar alterações nos props. Esse erro pode ocorrer quando você está otimizando manualmente seus componentes.

Observe que as abordagens de otimização que usam igualdade superficiais como `PureComponent` e `React.memo` com a comparação padrão são seguras.

**No entanto, se você tentar "otimizar" um componente escrevendo sua própria comparação, poderá esquecer por engano de comparar os props da função:**

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

É fácil perder esse erro no início, porque com classes você geralmente passa um *método* para baixo e, portanto, teria a mesma identidade:

```jsx{2-4,9-11}
class MyForm extends React.Component {
  handleClick = () => { // ✅ Sempre a mesma função
    // Faça alguma coisa
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

Então, nossa otimização não quebra *imediatamente*. No entanto, continuará "vendo" o antigo valor `onClick` se ele mudar com o tempo, mas outros props não:

```jsx{6,13-15}
class MyForm extends React.Component {
  state = {
    isEnabled: true
  };
  handleClick = () => {
    this.setState({ isEnabled: false });
    // Faça alguma coisa
  }
  render() {
    return (
      <>
        <h1>Hello!</h1>
        <Button color='green' onClick={
          // 🔴 Botão ignora atualizações no prop onClick
          this.state.isEnabled ? this.handleClick : null
        }>
          Press me
        </Button>
      </>
    )
  }
}
```

Neste exemplo, clicar no botão deveria desativá-lo - mas isso não acontece porque o componente `Button` ignora quaisquer atualizações no prop `onClick`.

Isso pode ficar ainda mais confuso se a função identificar que depende de algo que pode mudar ao longo do tempo, como `draft.content` neste exemplo:

```jsx{6-7}
  drafts.map(draft =>
    <Button
      color='blue'
      key={draft.id}
      onClick={
        // 🔴 Botão ignora atualizações no prop onClick
        this.handlePublish.bind(this, draft.content)
      }>
      Publish
    </Button>
  )
```

Embora `draft.content` possa mudar ao longo do tempo, nosso componente `Button` ignorou a alteração no prop `onClick`, de modo que continua a ver a "primeira versão" do método vinculado `onClick` com o `draft.content` original.

**Então como nós evitamos esse problema?**

Eu recomendo evitar a implementação manual de `shouldComponentUpdate` e evitar a especificação de uma comparação personalizada para `React.memo()`. A comparação superficial padrão no `React.memo` respeitará a alteração da identidade da função:

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

Em uma classe, `PureComponent` tem o mesmo comportamento.

Isso garante que passar uma função diferente como prop vai sempre funcionar.

Se você insistir em uma comparação personalizada, **certifique-se de não pular as funções:**

```jsx{5}
  shouldComponentUpdate(prevProps) {
    // ✅ Compara this.props.onClick 
    return (
      this.props.color !== prevProps.color ||
      this.props.onClick !== prevProps.onClick
    );
  }
```

Como mencionei anteriormente, é fácil perder esse problema em um componente de classe porque as identidades do método geralmente são estáveis (mas nem sempre - e é aí que os erros se tornam difíceis de depurar). Com Hooks, a situação é um pouco diferente:

1. Funções são diferentes *em cada renderização* então você descobre esse problema [imediatamente](https://github.com/facebook/react/issues/14972#issuecomment-468280039).
2. Com `useCallback` e `useContext`, você pode [evitar passar funções profundamente](https://reactjs.org/docs/hooks-faq.html#how-to-avoid-passing-callbacks-down). Isso permite otimizar a renderização sem se preocupar com funções.

---

Para resumir esta seção, **não pare o fluxo de dados!**

Sempre que você usar props e state, considere o que deve acontecer se eles mudarem. Na maioria dos casos, um componente não deve tratar a renderização inicial e as atualizações de maneira diferente. Isso o torna resiliente a mudanças na lógica.

Com classes, é fácil esquecer as atualizações ao usar props e state dentro dos métodos do ciclo de vida. Hooks o incentivam a fazer a coisa certa - mas é necessário algum ajuste mental se você não estiver acostumado a fazê-lo.

---

## Princípio 2: Esteja sempre pronto para renderizar

Os componentes React permitem escrever código de renderização sem se preocupar muito com o tempo. Você descreve como a interface do usuário *deve* parecer a qualquer momento e o React faz com que isso aconteça. Aproveite esse modelo!

Não tente introduzir suposições de tempo desnecessárias no comportamento do seu componente. **Seu componente deve estar pronto para ser renderizado novamente a qualquer momento.**

Como alguém pode violar esse princípio? React não facilita muito, mas você pode fazer isso usando o antigo método de ciclo de vida `componentWillReceiveProps`:

```jsx{5-8}
class TextInput extends React.Component {
  state = {
    value: ''
  };
  // 🔴 Reinicia o state local a cada renderização do pai
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

Neste exemplo, mantemos `value` no state local, mas nós *também* recebemos `value` de props. Sempre que "recebemos novos props", redefinimos o `valor` no state.

**O problema com esse padrão é que ele depende inteiramente de tempo acidental.**

Talvez hoje em dia o pai desse componente seja atualizado raramente e, portanto, nosso `TextInput` só "recebe props" quando algo importante acontece, como salvar um formulário.

Mas amanhã talvez você possa adicionar alguma animação ao pai de `TextInput`. Se seu pai for renderizado com mais frequência, ele continuará ["explodindo"](https://codesandbox.io/s/m3w9zn1z8x) no state do filho! Você pode ler mais sobre esse problema em [“Você provavelmente não precisa de um state derivado”](https://reactjs.org/blog/2018/06/07/you-probably-dont-need-derived-state.html).

**Então como podemos consertar isso?**

Primeiro de tudo, precisamos consertar nosso modelo mental. Precisamos parar de pensar em "receber props" como algo diferente de apenas "renderizar". Uma nova renderização causada por um pai não deve se comportar de maneira diferente de uma nova renderização causada por nossa própria alteração no state local. **Os componentes devem ser resilientes à renderização com menos ou mais frequência, caso contrário, eles são muito acoplados a seus pais em particular.**

*([Esta demonstração](https://codesandbox.io/s/m3w9zn1z8x) mostra como a nova renderização pode quebrar componentes frágeis.*

Embora existam algumas [diferentes](https://reactjs.org/blog/2018/06/07/you-probably-dont-need-derived-state.html#preferred-solutions) [soluções](https://reactjs.org/docs/hooks-faq.html#how-do-i-implement-getderivedstatefromprops) para quando você *realmente* quiser derivar o state dos props, normalmente você deve usar um componente totalmente controlado:

```jsx
// Opção 1: Componente totalmente controlado.
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
// Opção 2: Componente totalmente não controlado.
function TextInput() {
  const [value, setValue] = useState('');
  return (
    <input
      value={value}
      onChange={e => setValue(e.target.value)}
    />
  );
}

// Podemos redefinir seu state interno posteriormente, alterando a chave:
<TextInput key={formId} />
```

O principal desta seção é que seu componente não deve ser quebrado apenas porque ele ou seus pais são renderizados com mais frequência. O design da API do React facilita se você evitar o antigo método de ciclo de vida `componentWillReceiveProps`.

Para testar seu componente por estresse, você pode adicionar temporariamente esse código ao seu pai:

```js{2}
componentDidMount() {
  // Não se esqueça de remover isso imediatamente!
  setInterval(() => this.forceUpdate(), 100);
}
```

**Não deixe esse código dentro do componente** — é apenas uma maneira rápida de verificar o que acontece quando um pai é renderizado com mais frequência do que o esperado. Não deve quebrar o componente filho!

---

Você pode estar pensando: "Continuarei redefinindo o state quando os props forem alterados, mas impedirei a renderização desnecessária com o `PureComponent`".

Esse código deveria funcionar, certo?

```jsx{1-2}
// 🤔 Deve evitar renderizações desnecessárias... certo?
class TextInput extends React.PureComponent {
  state = {
    value: ''
  };
  // 🔴 Redefine o state local em cada renderização do pai
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

A princípio, pode parecer que esse componente resolve o problema de "explodir" o state na nova renderização do pai. Afinal, se os props forem os mesmos, pularemos a atualização — e o `componentWillReceiveProps` não será chamado.

No entanto, isso nos dá uma falsa sensação de segurança. **Este componente ainda não é resiliente a uma _real_ mudança de props.** Por exemplo, se adicionássemos *outro* prop que muda frequentemente, como um `style` animado, ainda "perderíamos" o estado interno:

```jsx{2}
<TextInput
  style={{opacity: someValueFromState}}
  value={
    // 🔴 componentWillReceiveProps em TextInput
    // redefine esse valor em cada momento da animação.
    value
  }
/>
```

Então essa abordagem ainda é falha. Podemos ver que várias otimizações como `PureComponent`, `shouldComponentUpdate`, e `React.memo` não devem ser usadas para controlar o *comportamento*. Use-os apenas para melhorar o *desempenho* onde isso ajudar. Se a remoção de uma otimização _quebra_ um componente, já era muito frágil para começar.

A solução aqui é a mesma que descrevemos anteriormente. Não trate "receber props" como um evento especial. Evite "sincronizar" props e state. Na maioria dos casos, todo valor deve ser totalmente controlado (por meio de props) ou totalmente não controlado (no state local). Evite o state derivado [quando você puder](https://reactjs.org/blog/2018/06/07/you-probably-dont-need-derived-state.html#preferred-solutions). **E esteja sempre pronto para renderizar!**

---

## Princípio 3: Nenhum Componente é um Singleton

Às vezes assumimos que um determinado componente é exibido apenas uma vez. Como uma barra de navegação. Isso pode ser verdade por algum tempo. No entanto, essa suposição geralmente causa problemas de design que só aparecem muito mais tarde.

Por exemplo, talvez você precise implementar uma animação *entre* dois componentes `Page` em uma mudança de rota — a `Page` anterior e a próxima `Page`. Ambos precisam ser montados durante a animação. No entanto, você pode descobrir que cada um desses componentes pressupõe que é a única `Page` na tela.

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

Clique ao redor. (Você pode precisar ajustar alguns CSS para este experimento.)

**Seu aplicativo ainda se comporta conforme o esperado?** Ou você vê falhas e erros estranhos? É uma boa ideia fazer esse teste de estresse em componentes complexos de vez em quando e garantir que várias cópias deles não entrem em conflito.

Um exemplo de um padrão problemático que eu mesmo escrevi algumas vezes é fazer a limpeza do global state em `componentWillUnmount`:

```jsx{2-3}
componentWillUnmount() {
  // Redefine alguma coisa na Redux store
  this.props.resetForm();
}
```

Obviamente, se houver dois desses componentes na página, desmontar um deles pode quebrar o outro. Redefinir o estado "global" ao *montar* não é melhor:

```jsx{2-3}
componentDidMount() {
  // Redefine alguma coisa na Redux store
  this.props.resetForm();
}
```

Nesse caso a *montagem* de um segundo form quebrará o primeiro form.

Esses padrões são bons indicadores de onde nossos componentes são frágeis. ***Mostrar* ou *ocultar* uma árvore não deve quebrar componentes fora dessa árvore.**

Se você planeja renderizar esse componente duas vezes ou não, a solução desses problemas compensa a longo prazo. Isso leva a um design mais resiliente.

---

## Princípio 4: Mantenha o State Local Isolado

Considere um componente `Post` nas redes sociais. Possui uma lista de `Comment` tópicos (que podem ser expandidos) e um `NewComment` input.

Os componentes React podem ter state local. Mas que state é verdadeiramente local? O conteúdo da postagem é em si é state local ou não? E a lista de comentários? Ou o registro de quais tópicos de comentário são expandidos? Ou o valor de input do comentário?

Se você está acostumado a colocar tudo em um "gerenciador de state", responder a essa pergunta pode ser um desafio. Então, aqui está uma maneira simples de decidir.

**Se você não tiver certeza se algum state é local, pergunte a si mesmo: “Se esse componente foi renderizado duas vezes, essa interação deveria refletir na outra cópia?” Sempre que a resposta for “não”, você encontrará algum state local.**

Por exemplo, imagine que renderizamos o mesmo `Post` duas vezes. Vamos ver coisas diferentes dentro dele que podem mudar.

* *Conteúdo da postagem.* Queremos editar a postagem em uma árvore para atualizá-la em outra. Portanto, provavelmente **não deveria** ser o state local de um componente `Post`. (Em vez disso, o conteúdo da postagem pode ficar em algum cache como Apollo, Relay ou Redux.)

* *Lista de comentários.* É semelhante ao conteúdo da postagem. Queremos adicionar um novo comentário em uma árvore para ser refletido na outra árvore também. Então, idealmente, usaríamos algum tipo de cache para isso, e ele **não deve** ser um state local do nosso `Post`.

* *Quais comentários são expandidos.* Seria estranho se expandir um comentário em uma árvore também o expandisse em outra árvore. Nesse caso, estamos interagindo com um determinado "Comentário" *representação da interface do usuário* em vez de uma "entidade de comentário" abstrata. Portanto, um sinalizador "expandido" **deve** ser um state local do `Comentário`.

* *O valor da nova entrada de comentário.* Seria estranho se a digitação de um comentário em uma árvore também atualizasse uma entrada de comentário em outra árvore. A menos que as entradas sejam claramente agrupadas, geralmente as pessoas esperam que sejam independentes. Portanto, o valor de entrada **deve** ser um state local do componente `NewComment`.

Eu não sugiro uma interpretação dogmática dessas regras. Obviamente, em um aplicativo mais simples, você pode querer usar o state local para tudo, incluindo os "caches". Estou falando apenas da experiência ideal do usuário [dos primeiros princípios](/the-elements-of-ui-engineering/).

**Evite tornar o state verdadeiramente local em global.** Isso entra no nosso tópico "resiliência": há menos sincronizações surpreendentes acontecendo entre os componentes. Como bônus, isso *também* corrige uma grande classe de problemas de desempenho. "Over-rendering" é muito menos problemático quando seu state está no lugar certo.

---

## Recaptulando

Vamos recapitular esses princípios mais uma vez:

1. **[Não Interrompa o Fluxo de Dados](#Princípio-1:-Não-Interrompa-o-Fluxo-de-Dados)** Props e state podem mudar, e os componentes devem lidar com essas mudanças sempre que elas acontecerem.
2. **[Esteja sempre pronto para renderizar](#Princípio-2:-Esteja-sempre-pronto-para-renderizar)** Um componente não deve quebrar porque é renderizado com mais ou menos frequência.
3. **[Nenhum componente é um singleton](#Princípio-3:-Nenhum-Componente-é-um-Singleton)** Mesmo que um componente seja renderizado apenas uma vez, seu design será aprimorado se ao renderizar duas vezes não o quebrar.
4. **[Mantenha o estado local isolado](#Princípio-4:-Mantenha-o-State-Local-Isolado)** Pense em qual state é local para uma representação específica da interface do usuário — e não o levante mais alto do que o necessário.

**Esses princípios ajudam a escrever componentes que são [otimizados para alterações](/optimized-for-change/). É fácil adicionar, alterá-los e excluí-los.**

E o mais importante, uma vez que nossos componentes sejam resilientes, podemos voltar ao insistente dilema de saber se os props devem ou não ser classificados por ordem alfabética.
