---
title: Escrevendo Componentes Resilientes
date: '2019-03-16'
spoiler: Quatro princípios para te colocar no caminho certo.
---

Quando as pessoas começam a aprender React, elas normalmente perguntam por um guia de estilos. Apesar de ser uma boa ideia em ter algumas regras consistentes aplicadas em todo o projeto, muitas delas são arbitrárias - então, o React não tem uma opinião muito forte sobre elas.

Você pode usar diferentes sistemas de tipagem, preferir declarações de função ou arrow functions, organizar suas props por ordem alfabética ou de uma maneira que ache confortável.

Essa flexibilidade permite [integrar o React](https://pt-br.reactjs.org/docs/add-react-to-a-website.html) em projetos com convenções já existentes. Mas, também é um convite a um debate sem fim.

***Existem* importantes princípios de design que todo componente deveria almejar seguir. Mas, não acho que guias de estilos englobam muito bem esses princípios. Falaremos sobre guias de estilos primeiro, e depois [veremos os princípios que _são_ úteis](#escrevendo-componentes-resilientes).**

---

## Não se Distraia com Problemas Imaginários

Antes de falarmos de princípios de design de componentes, eu gostaria de dizer algumas coisas sobre guias de estilos. Essa não é uma opinião muito popular, mas alguém precisa dizê-la!

Na comunidade JavaScript, existem alguns guias de estilo com opiniões fortes aplicados por um linter. Minha observação pessoal é de que eles tendem a criar mais fricção do que é necessário. Não consigo nem contar quantas vezes alguém me mostrou um código absolutamente válido e disse "o React reclama disso", mas na verdade era a configuração do lint deles reclamando! Isso leva a três coisas:

* As pessoas se acostumam a ver seu linter como um **guardião ruidoso e excessivamente zeloso**, ao invés de uma ferramenta útil. Avisos que são úteis acabam afundando em um mar de trivialidade.

* As pessoas não aprendem a **diferenciar os usos válidos e inválidos** de um certo padrão. Por exemplo, existe uma regra popular que impede de chamar o `setState` dentro do `componentDidMount`. Mas, se isso fosse "ruim" sempre, o React simplesmente não permitiria! Existe um caso de uso legítimo para isso, e é para medir o layout do DOM - por exemplo, para positionar uma tooltip. Já vi pessoas "contornarem" essa regra adicionando um `setTimeout`, o que foge completamente do propósito.

* Eventualmente, as pessoas adotam a "mentalidade de executor" e passam a opinar sobre coisas que **não trazem uma diferença significativa**, mas que são fáceis de identificar no código. “Você usou uma declaração de função, mas *nosso* projeto usa arrow functions.” Sempre que tenho um sentimento forte sobre forçar uma regra como essa, olhar mais a fundo revela que investi esforço emocional nela - e fico relutante em desapegar. Me leva a uma falsa sensação de realização, sem melhorar meu código.

Estou dizendo para parar de usar o lint? De jeito nenhum!

**Com uma boa configuração, um linter é uma ótima ferramenta para pegar bugs antes que aconteçam.** É por se concentrar muito no *estilo* que ele se torna uma distração.

---

## Seja como Marie Kondo com sua Configuração de Lint

Aqui está o que eu sugiro que você faça na segunda-feira. Junte seu time por meia hora, repasse cada uma das regras de lint habilitadas na config do seu projeto, e pergunte a si mesmo: *"Alguma vez essa regra nos ajudou a pegar um bug?"* Caso contrário, *desligue-a*. Você também pode começar do zero com [`eslint-config-react-app`](https://www.npmjs.com/package/eslint-config-react-app), que não possui nenhuma regra de estilo.

No mínimo, seu time deveria ter um processo para remover regras de lint que causam conflitos. Nunca assuma que qualquer coisa que você ou outra pessoa adicionou à configuração do lint há um ano é uma "boa prática". Questione e busque respostas. Não deixe que ninguém diga que você não é inteligente o suficiente para escolher suas próprias regras de lint.

**Mas, e quanto à formatação?** Use o [Prettier](https://prettier.io/) e esqueça sobre essas "trivialidades nos estilos". Você não precisa de uma ferramenta que grite com você por colocar um espaço extra, se outra ferramenta pode consertá-lo por você. Use o linter para encontrar *bugs*, mas não para forçar *e s t é t i c a*

É claro, há aspectos do estilo do código que não estão diretamente relacionados à formatação, mas que ainda podem incomodar se não forem consistentes em todo o projeto.

No entanto, muitos deles são sutis demais para que sejam pegos por uma regra de lint, de qualquer forma. Por isso, é importante **construir a confiança** entre membros do time, e compartilhar aprendizados úteis na forma de uma wiki ou um guia curto de design.

Nem tudo vale à pena automatizar! Os insights ganhos por *realmente ler* a lógica em um desses guia pode ser mais valioso do que só seguir as "regras".

**Mas, se seguir um guia de estilo rigoroso é uma distração, o que é realmente importante?**

Este é o tópico deste post.

---

## Escrevendo Componentes Resilientes

Nenhuma quantidade de indentação ou organização dos imports em ordem alfabética pode consertar um design quebrado. Então, ao invés de focar na *aparência* de um código, vou focar em como ele *funciona*. Existem alguns princípios de design de componentes que acho muito úteis:

1. **[Não impeça o fluxo de dados](#princípio-1-não-impeça-o-fluxo-de-dados)**
2. **[Sempre pronto para renderizar](#princípio-2-sempre-pronto-para-renderizar)**
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

No raro caso desse comportamento *ser* intencional, certifique-se de chamar essa prop de `initialColor` ou `defaultColor` para deixar claro que as atualizações a ela serão ignoradas.

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

Valores computados são outra razão para as pessoas, algumas vezes, tentarem copiar props para o estado. Por exemplo, imagine que determinamos a cor do *texto do botão* baseada em uma computação cara envolvendo a prop `color` como argumento:

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

### Don’t Stop the Data Flow in Side Effects

So far, we’ve talked about how to keep the rendering result consistent with prop changes. Avoiding copying props into state is a part of that. However, it is important that **side effects (e.g. data fetching) are also a part of the data flow**.

Consider this React component:

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

A lot of React components are like this — but if we look a bit closer, we'll notice a bug. The `fetchResults` method uses the `query` prop for data fetching:

```jsx{2}
  getFetchUrl() {
    return 'http://myapi/results?query' + this.props.query;
  }
```

But what if the `query` prop changes? In our component, nothing will happen. **This means our component’s side effects don’t respect changes to its props.** This is a very common source of bugs in React applications.

In order to fix our component, we need to:

* Look at `componentDidMount` and every method called from it.
  - In our example, that’s `fetchResults` and `getFetchUrl`.
* Write down all props and state used by those methods.
  - In our example, that’s `this.props.query`.
* Make sure that whenever those props change, we re-run the side effect.
  - We can do this by adding the `componentDidUpdate` method.

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
    return 'http://myapi/results?query' + this.props.query; // ✅ Updates are handled
  }
  render() {
    // ...
  }
}
```

Now our code respects all changes to props, even for side effects.

However, it’s challenging to remember not to break it again. For example, we might add `currentPage` to the local state, and use it in `getFetchUrl`:

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

Alas, our code is again buggy because our side effect doesn’t respect changes to `currentPage`.

**Props and state are a part of the React data flow. Both rendering and side effects should reflect changes in that data flow, not ignore them!**

To fix our code, we can repeat the steps above:

* Look at `componentDidMount` and every method called from it.
  - In our example, that’s `fetchResults` and `getFetchUrl`.
* Write down all props and state used by those methods.
  - In our example, that’s `this.props.query` **and `this.state.currentPage`**.
* Make sure that whenever those props change, we re-run the side effect.
  - We can do this by changing the `componentDidUpdate` method.

Let’s fix our component to handle updates to the `currentPage` state:

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
      '&page=' + this.state.currentPage // ✅ Updates are handled
    );
  }
  render() {
    // ...
  }
}
```

**Wouldn’t it be nice if we could somehow automatically catch these mistakes?** Isn’t that something a linter could help us with?

---

Unfortunately, automatically checking a class component for consistency is too difficult. Any method can call any other method. Statically analyzing calls from `componentDidMount` and `componentDidUpdate` is fraught with false positives.

However, one *could* design an API that *can* be statically analyzed for consistency. The [React `useEffect` Hook](/a-complete-guide-to-useeffect/) is an example of such API:

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

We put the logic *inside* of the effect, and that makes it easier to see *which values from the React data flow* it depends on. These values are called “dependencies”, and in our example they are `[currentPage, query]`.

Note how this array of “effect dependencies” isn’t really a new concept. In a class, we had to search for these “dependencies” through all the method calls. The `useEffect` API just makes the same concept explicit.

This, in turn, lets us validate them automatically:

![Demo of exhaustive-deps lint rule](./useeffect.gif)

*(This is a demo of the new recommended `exhaustive-deps` lint rule which is a part of `eslint-plugin-react-hooks`. It will soon be included in Create React App.)*

**Note that it is important to respect all prop and state updates for effects regardless of whether you’re writing component as a  class or a function.**

With the class API, you have to think about consistency yourself, and verify that changes to every relevant prop or state are handled by `componentDidUpdate`. Otherwise, your component is not resilient to prop and state changes. This is not even a React-specific problem. It applies to any UI library that lets you handle “creation” and “updates” separately.

**The `useEffect` API flips the default by encouraging consistency.** This [might feel unfamiliar at first](/a-complete-guide-to-useeffect/), but as a result your component becomes more resilient to changes in the logic. And since the “dependencies” are now explicit, we can *verify* the effect is consistent using a lint rule. We’re using a linter to catch bugs!

---

### Don’t Stop the Data Flow in Optimizations

There's one more case where you might accidentally ignore changes to props. This mistake can occur when you’re manually optimizing your components.

Note that optimization approaches that use shallow equality like `PureComponent` and `React.memo` with the default comparison are safe.

**However, if you try to “optimize” a component by writing your own comparison, you may mistakenly forget to compare function props:**

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

It is easy to miss this mistake at first because with classes, you’d usually pass a *method* down, and so it would have the same identity anyway:

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

So our optimization doesn’t break *immediately*. However, it will keep “seeing” the old `onClick` value if it changes over time but other props don’t:

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

In this example, clicking the button should disable it — but this doesn’t happen because the `Button` component ignores any updates to the `onClick` prop.

This could get even more confusing if the function identity itself depends on something that could change over time, like `draft.content` in this example:

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

While `draft.content` could change over time, our `Button` component ignored change to the `onClick` prop so it continues to see the “first version” of the `onClick` bound method with the original `draft.content`.

**So how do we avoid this problem?**

I recommend to avoid manually implementing `shouldComponentUpdate` and to avoid specifying a custom comparison to `React.memo()`. The default shallow comparison in `React.memo` will respect changing function identity:

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
export default React.memo(Button); // ✅ Uses shallow comparison
```

In a class, `PureComponent` has the same behavior.

This ensures that passing a different function as a prop will always work.

If you insist on a custom comparison, **make sure that you don’t skip functions:**

```jsx{5}
  shouldComponentUpdate(prevProps) {
    // ✅ Compares this.props.onClick 
    return (
      this.props.color !== prevProps.color ||
      this.props.onClick !== prevProps.onClick
    );
  }
```

As I mentioned earlier, it’s easy to miss this problem in a class component because method identities are often stable (but not always — and that’s where the bugs become difficult to debug). With Hooks, the situation is a bit different:

1. Functions are different *on every render* so you discover this problem [right away](https://github.com/facebook/react/issues/14972#issuecomment-468280039).
2. With `useCallback` and `useContext`, you can [avoid passing functions deep down altogether](https://reactjs.org/docs/hooks-faq.html#how-to-avoid-passing-callbacks-down). This lets you optimize rendering without worrying about functions.

---

To sum up this section, **don’t stop the data flow!**

Whenever you use props and state, consider what should happen if they change. In most cases, a component shouldn’t treat the initial render and updates differently. That makes it resilient to changes in the logic.

With classes, it’s easy to forget about updates when using props and state inside the lifecycle methods. Hooks nudge you to do the right thing — but it takes some mental adjustment if you’re not used to already doing it.

---

## Principle 2: Always Be Ready to Render

React components let you write rendering code without worrying too much about time. You describe how the UI *should* look at any given moment, and React makes it happen. Take advantage of that model!

Don’t try to introduce unnecessary timing assumptions into your component behavior. **Your component should be ready to re-render at any time.**

How can one violate this principle? React doesn’t make it very easy — but you can do it by using the legacy `componentWillReceiveProps` lifecycle method:

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

In this example, we keep `value` in the local state, but we *also* receive `value` from props. Whenever we “receive new props”, we reset the `value` in state.

**The problem with this pattern is that it entirely relies on accidental timing.**

Maybe today this component’s parent updates rarely, and so our `TextInput` only “receives props” when something important happens, like saving a form.

But tomorrow you might add some animation to the parent of `TextInput`. If its parent re-renders more often, it will keep [“blowing away”](https://codesandbox.io/s/m3w9zn1z8x) the child state! You can read more about this problem in [“You Probably Don’t Need Derived State”](https://reactjs.org/blog/2018/06/07/you-probably-dont-need-derived-state.html).

**So how can we fix this?**

First of all, we need to fix our mental model. We need to stop thinking of “receiving props” as something different from just “rendering”. A re-render caused by a parent shouldn’t behave differently from a re-render caused by our own local state change. **Components should be resilient to rendering less or more often because otherwise they’re too coupled to their particular parents.**

*([This demo](https://codesandbox.io/s/m3w9zn1z8x) shows how re-rendering can break fragile components.)*

While there are a few [different](https://reactjs.org/blog/2018/06/07/you-probably-dont-need-derived-state.html#preferred-solutions) [solutions](https://reactjs.org/docs/hooks-faq.html#how-do-i-implement-getderivedstatefromprops) for when you *truly* want to derive state from props, usually you should use either a fully controlled component:

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

Or you can use an uncontrolled component with a key to reset it:

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

The takeaway from this section is that your component shouldn’t break just because it or its parent re-renders more often. The React API design makes it easy if you avoid the legacy `componentWillReceiveProps` lifecycle method.

To stress-test your component, you can temporarily add this code to its parent:

```jsx{2}
componentDidMount() {
  // Don't forget to remove this immediately!
  setInterval(() => this.forceUpdate(), 100);
}
```

**Don’t leave this code in** — it’s just a quick way to check what happens when a parent re-renders more often than you expected. It shouldn’t break the child!

---

You might be thinking: “I’ll keep resetting state when the props change, but will prevent unnecessary re-renders with `PureComponent`”.

This code should work, right?

```jsx{1-2}
// 🤔 Should prevent unnecessary re-renders... right?
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

At first, it might seem like this component solves the problem of “blowing away” the state on parent re-render. After all, if the props are the same, we just skip the update — and so `componentWillReceiveProps` doesn’t get called.

However, this gives us a false sense of security. **This component is still not resilient to _actual_ prop changes.** For example, if we added *another* often-changing prop, like an animated `style`, we would still “lose” the internal state:

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

So this approach is still flawed. We can see that various optimizations like `PureComponent`, `shouldComponentUpdate`, and `React.memo` shouldn’t be used for controlling *behavior*. Only use them to improve *performance* where it helps. If removing an optimization _breaks_ a component, it was too fragile to begin with.

The solution here is the same as we described earlier. Don’t treat “receiving props” as a special event. Avoid “syncing” props and state. In most cases, every value should either be fully controlled (through props), or fully uncontrolled (in local state). Avoid derived state [when you can](https://reactjs.org/blog/2018/06/07/you-probably-dont-need-derived-state.html#preferred-solutions). **And always be ready to render!**

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
