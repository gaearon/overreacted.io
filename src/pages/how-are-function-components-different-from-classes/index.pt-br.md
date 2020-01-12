---
title: Como os componentes de função são diferentes de componentes de classe?
date: '2019-03-03'
spoiler: Eles são Pokémons totalmente diferentes.
---

Como os componentes de função diferem de componentes de classe em React?

Por um tempo, a resposta padrão é que as classes fornecem acesso a mais recursos (como o estado). Com [Hooks](https://reactjs.org/docs/hooks-intro.html), isso não é mais verdade.

Talvez você tenha ouvido que um deles é mais performático. Qual? Muitos desses benchmarks são [falhos](https://medium.com/@dan_abramov/this-benchmark-is-indeed-flawed-c3d6b5b6f97f?source=your_stories_page---------------------------) então eu tomaria cuidado [tirando conclusões](https://github.com/ryardley/hooks-perf-issues/pull/2) partindo deles. A performance depende principalmente do que o código está fazendo, e não se você escolheu utilizar uma função ou uma classe. Em nossa observação, as diferenças de performance são insignificantes, embora as estratégias de otimização sejam um pouco [diferentes](https://reactjs.org/docs/hooks-faq.html#are-hooks-slow-because-of-creating-functions-in-render).

Em qualquer um dos casos, [não recomendamos](https://reactjs.org/docs/hooks-faq.html#should-i-use-hooks-classes-or-a-mix-of-both) reescrever os componentes que já existem em sua aplicação, a menos que você tenha outras razões e não se importe em ser um pioneiro. Os Hooks ainda são novos (como o React foi em 2014), e algumas "melhores práticas" ainda não foram incluídas nos tutoriais.

Então, como ficamos? Existe alguma diferença fundamental entre as funções React e as classes? Claro, existem - no modelo mental. **Neste post, vou olhar para a maior diferença entre eles.** Isto existia desde que os componentes de função foram [introduzidos](https://reactjs.org/blog/2015/09/10/react-v0.14-rc1.html#stateless-function-components) em 2015, mas isto é frequentemente ignorado:

>**Os componentes de função capturam os valores renderizados.**

Vamos ver o que isso significa.

---

**Nota: este post não é um julgamento de valor de classes ou funções. Eu estou apenas descrevendo a diferença entre esses dois modelos de programação no React. Para perguntas sobre a adoção de funções mais amplamente, consulte o [Hooks FAQ](https://reactjs.org/docs/hooks-faq.html#adoption-strategy).**

---

Considere este componente:

```jsx
function ProfilePage(props) {
  const showMessage = () => {
    alert('Followed ' + props.user);
  };

  const handleClick = () => {
    setTimeout(showMessage, 3000);
  };

  return (
    <button onClick={handleClick}>Follow</button>
  );
}
```

Ele mostra um botão que simula um request no servidor com o `setTimeout` e, em seguida, mostra um alerta de confirmação. Por exemplo, se `props.user` for `'Dan'`, ele mostrará `'Followed Dan'` depois de três segundos. Simples assim.

*(Note que não importa se eu uso arrow functions ou declarações de função no exemplo acima. `function handleClick()` funcionaria exatamente da mesma forma.)*

Como escrevemos isso utilizando classe? Uma tradução ingênua poderia ser:

```jsx
class ProfilePage extends React.Component {
  showMessage = () => {
    alert('Followed ' + this.props.user);
  };

  handleClick = () => {
    setTimeout(this.showMessage, 3000);
  };

  render() {
    return <button onClick={this.handleClick}>Follow</button>;
  }
}
```

É comum pensar que esses dois trechos de código são equivalentes. As pessoas muitas vezes fazem o *refactory* livremente entre esses padrões sem perceber suas implicações:

![Detectar a diferença entre essas duas versões](./wtf.gif)

**No entanto, esses dois trechos de código são sutilmente diferentes.** Dê uma boa olhada neles. Você consegue ver a diferença? Pessoalmente, levei um tempo para ver isso.

**Há spoilers à seguir, então aqui está uma [demonstração](https://codesandbox.io/s/pjqnl16lm7) se você quiser descobrir por conta própria.** O restante deste artigo explica a diferença e por que isto é importante.

---

Antes de continuarmos, gostaria de enfatizar que a diferença que estou descrevendo não tem nada a ver com React Hooks, por si só. Os exemplos acima nem usam Hooks!

É sobre a diferença entre funções e classes no React. Se você planeja usar funções com mais frequência em uma aplicação React, convém entender isto.

---

**Vamos ilustrar a diferença com um erro que é comum em aplicações React.**

Abra este **[exemplo](https://codesandbox.io/s/pjqnl16lm7)** com um seletor de perfil e as duas implementações de `ProfilePage` acima - cada uma renderizando um botão Follow.

Experimente esta sequência de ações com os dois botões:

1. **Clique** num dos botões Follow.
2. **Altere** o perfil selecionado antes de passar 3 segundos.
3. **Leia** o texto do alerta.

Você notará uma diferença peculiar:

* Com o **componente de função** `ProfilePage` acima, ao clicar em Follow com o perfil do Dan e depois mudar para o da Sophie ainda alertaria `'Followed Dan'`.

* Com o **componente de classe** `ProfilePage` acima, ele alertaria `'Followed Sophie'`:

![Demonstração dos passos](./bug.gif)

---


Neste exemplo, o primeiro comportamento é o correto. **Se eu seguir uma pessoa e depois navegar para o perfil de outra pessoa, meu componente não ficará confuso sobre quem eu segui.** Essa implementação de classe é claramente problemática.

*(Embora você realmente devesse [seguir a Sophie](https://mobile.twitter.com/sophiebits))*

---

Então, por que nosso exemplo de classe se comporta dessa maneira?

Vamos olhar de perto o método `showMessage` em nossa classe:

```jsx{3}
class ProfilePage extends React.Component {
  showMessage = () => {
    alert('Followed ' + this.props.user);
  };
```

Este método da classe pega o user a partir de `this.props.user`. As props são imutáveis ​​em React então elas nunca podem mudar. **No entanto, `this` *é* e sempre foi mutável.**

Na verdade, esse é o propósito de `this` em uma classe. O React por si só muda ao longo do tempo para que você possa pegar a nova versão no método `render` e nos métodos de ciclo de vida.

Portanto, se nosso componente renderizar novamente enquanto a solicitação estiver em andamento, `this.props` será alterado. O método `showMessage` pega a propriedade `user` do novo `props`.

Isso expõe uma observação interessante sobre a natureza das interfaces do usuário. Se dissermos que uma interface do usuário é conceitualmente uma função do estado atual da aplicação, **os manipuladores de eventos são parte do resultado da renderização - assim como o que é renderizado na tela**. Nossos manipuladores de eventos “pertencem” a uma renderização específica com props e state específicos.

No entanto, fazendo que um callback leia de `this.props` em um tempo posterior faz com que essa associação não seja satisfeita. Nosso callback  `showMessage` não está “amarrado” a nenhuma renderização específica e, portanto, “perde” as props corretas. A leitura de `this` separou essa conexão.

---

**Digamos que os componentes de função não existissem.** Como resolveríamos esse problema?

Nós queremos de alguma forma "consertar" a conexão entre o `render` com as props corretas e o callback `showMessage` que os lê. Em algum momento as `props` se perdem.

Uma maneira de fazer isso seria ler `this.props` no início do evento e, em seguida, passá-los explicitamente no callback:

```jsx{2,7}
class ProfilePage extends React.Component {
  showMessage = (user) => {
    alert('Followed ' + user);
  };

  handleClick = () => {
    const {user} = this.props;
    setTimeout(() => this.showMessage(user), 3000);
  };

  render() {
    return <button onClick={this.handleClick}>Follow</button>;
  }
}
```

Isso [funciona](https://codesandbox.io/s/3q737pw8lq). No entanto, essa abordagem torna o código significativamente mais verboso e propenso a erros com o tempo. E se precisássemos mais do que uma única prop? E se nós também precisássemos acessar o estado? **Se `showMessage` chamar outro método, e esse método ler `this.props.alguma_coisa` ou `this.state.alguma_coisa`, teremos exatamente o mesmo problema novamente.** Então teríamos que passar `this.props` e `this.state` como argumentos de todas chamadas de `showMessage`.

Fazer isso tira a ergonomia normalmente oferecida por uma classe. Também é difícil lembrar ou impor, e é por isso que as pessoas geralmente se contentam com bugs.

Da mesma forma, colocando o `alert` dentro de `handleClick` não resolve o problema maior. Queremos estruturar o código de uma forma que permita dividi-lo em mais métodos *mas* também ler os props e estado que correspondem à renderização relacionada a essa chamada. **Este problema não é exclusivo do React - você pode reproduzi-lo em qualquer biblioteca de UI que coloque dados em um objeto mutável como o `this`.**

Talvez pudéssemos fazer o *bind* dos métodos no construtor?

```jsx{4-5}
class ProfilePage extends React.Component {
  constructor(props) {
    super(props);
    this.showMessage = this.showMessage.bind(this);
    this.handleClick = this.handleClick.bind(this);
  }

  showMessage() {
    alert('Followed ' + this.props.user);
  }

  handleClick() {
    setTimeout(this.showMessage, 3000);
  }

  render() {
    return <button onClick={this.handleClick}>Follow</button>;
  }
}
```

Não, isso não arruma nada. Lembre-se, o problema é que estamos lendo de 'this.props' em um tempo posterior - não a sintaxe que estamos usando! **No entanto, o problema desapareceria se nos baseamos totalmente em closures de JavaScript.**

Os closures geralmente são evitados porque é [difícil](https://wsvincent.com/javascript-closure-settimeout-for-loop/) pensar em um valor que pode sofrer alterações ao longo do tempo. Mas em React, props e state são imutáveis! (Ou pelo menos, é uma recomendação forte que sejam.) Isso remove uma grande arma de closures.

Isso significa que, se você guardar os props ou state de uma renderização específica, poderá sempre contar com eles permanecendo exatamente iguais:

```jsx{3,4,9}
class ProfilePage extends React.Component {
  render() {
    // Capturando as props!
    const props = this.props;

    // Note: we are *inside render*.
    // Não são métodos de classe
    const showMessage = () => {
      alert('Followed ' + props.user);
    };

    const handleClick = () => {
      setTimeout(showMessage, 3000);
    };

    return <button onClick={handleClick}>Follow</button>;
  }
}
```


**Você "capturou" os props no momento da renderização:**

![Capturando Pokemon](./pokemon.gif)

Desta forma, qualquer código dentro dele (incluindo `showMessage`) é garantido ler as props de uma renderização específica. React não vai mais "mexer no nosso queijo".

**Poderíamos então adicionar quantas funções auxiliares quisermos, e todas elas usariam as props e o state capturados.** Closures é a salvação!

---

O [exemplo acima](https://codesandbox.io/s/oqxy9m7om5) está correto, mas parece estranho. Qual é o objetivo de ter uma classe se você definir funções dentro de `render` em vez de usar métodos de classe?

De fato, podemos simplificar o código removendo as particularidades de classe em torno disso:

```jsx
function ProfilePage(props) {
  const showMessage = () => {
    alert('Followed ' + props.user);
  };

  const handleClick = () => {
    setTimeout(showMessage, 3000);
  };

  return (
    <button onClick={handleClick}>Follow</button>
  );
}
```

Assim como acima, as `props` ainda estão sendo capturadas - o React os passa como um argumento. **Ao contrário de `this`, o objeto `props` em si nunca é modificado pelo React.**

É um pouco mais óbvio se você fizer o destructure de `props` na definição da função:

```jsx{1,3}
function ProfilePage({ user }) {
  const showMessage = () => {
    alert('Followed ' + user);
  };

  const handleClick = () => {
    setTimeout(showMessage, 3000);
  };

  return (
    <button onClick={handleClick}>Follow</button>
  );
}
```

Quando o componente pai renderizar `ProfilePage` com as props diferentes, o React chamará a função `ProfilePage` novamente. Mas o manipulador de evento que nós clicamos “pertenceu” a renderização anterior com seu próprio valor de `user` e o callback `showMessage` que o lê. Eles estão todos intactos.

É por isso que, na versão de função [desta demo](https://codesandbox.io/s/pjqnl16lm7), ao clicar em Follow no perfil da Sophie e depois alterar a seleção para Sunil iria alertar `'Followed Sophie'`:

![Demonstração do comportamento correto](./fix.gif)

Esse comportamento está correto. *(Embora você deva [seguir o Sunil](https://mobile.twitter.com/threepointone) também!)*

---

Agora entendemos a grande diferença entre funções e classes no React:

>**Os componentes de função capturam os valores renderizados.**

**Com Hooks, o mesmo princípio também se aplica ao estado.** Considere este exemplo:

```jsx
function MessageThread() {
  const [message, setMessage] = useState('');

  const showMessage = () => {
    alert('You said: ' + message);
  };

  const handleSendClick = () => {
    setTimeout(showMessage, 3000);
  };

  const handleMessageChange = (e) => {
    setMessage(e.target.value);
  };

  return (
    <>
      <input value={message} onChange={handleMessageChange} />
      <button onClick={handleSendClick}>Send</button>
    </>
  );
}
```

(Aqui está uma [demonstração](https://codesandbox.io/s/93m5mz9w24).)

Embora essa não seja uma boa UI, ela ilustra o mesmo ponto: se eu enviar uma mensagem específica, o componente não ficará confuso sobre qual mensagem foi realmente enviada. A `message` deste componente de função captura o estado que “pertence“ a renderização que retornou o manipulador de clique chamado pelo navegador. Então o `message` é definido com o que estava no input quando eu cliquei em “Send”.

---

Portanto, sabemos que as funções em React capturam props e state por padrão. **Mas e se nós *quisermos* ler as últimas props ou state que não pertencem a esta renderização específica?** E se quisermos [“lê-los do futuro”](https://dev.to/scastiel/react-hooks-get-the-current-state-back-to-the-future-3op2)?

Nas classes, você faria isso lendo `this.props` ou `this.state` porque `this` é mutável. O React altera isto. Nos componentes de função, você também pode ter um valor mutável compartilhado por todas as renderizações do componente. Isto é chamado de “ref”:

```jsx
function MyComponent() {
  const ref = useRef(null);
  // Você pode ler ou setar `ref.current`.
  // ...
}
```

No entanto, você terá que gerenciar por conta própria.

Um ref [desempenha o mesmo papel](https://reactjs.org/docs/hooks-faq.html#is-there-something-like-instance-variables) de uma variável de instância. É a valvula de escape para o mundo imperativo mutável. Você pode estar familiarizado com “DOM refs”, mas o conceito é muito mais geral. É apenas uma caixa na qual você pode colocar alguma coisa.

Mesmo visualmente, `this.alguma_coisa` parece um espelho de `alguma_coisa.current`. Eles representam o mesmo conceito.

Por padrão, o React não cria referências para as props mais recentes ou para o state em componentes de função. Em muitos casos, você não precisa deles, e seria um desperdício de trabalho atribuí-los. No entanto, você pode acompanhar o valor manualmente se quiser:

```jsx{3,6,15}
function MessageThread() {
  const [message, setMessage] = useState('');
  const latestMessage = useRef('');

  const showMessage = () => {
    alert('You said: ' + latestMessage.current);
  };

  const handleSendClick = () => {
    setTimeout(showMessage, 3000);
  };

  const handleMessageChange = (e) => {
    setMessage(e.target.value);
    latestMessage.current = e.target.value;
  };
```

Se lermos `message` em `showMessage`, teremos a mensagem no momento em que pressionamos o botão Send. Mas quando lemos `latestMessage.current`, obtemos o valor mais recente - mesmo se continuarmos digitando depois que o botão Send foi pressionado.

Você pode comparar as [duas](https://codesandbox.io/s/93m5mz9w24) [demos](https://codesandbox.io/s/ox200vw8k9) para ver a diferença. Um ref é uma maneira de “desativar“ a consistência de renderização e pode ser útil em alguns casos.

Geralmente, você deve evitar ler ou definir refs *durante* a renderização porque eles são mutáveis. Queremos manter a renderização previsível. **No entanto, se quisermos obter o valor mais recente de um prop ou state específico, pode ser irritante atualizar o ref manualmente.** Podemos automatizar isto usando o `useEffect`:

```jsx{4-8,11}
function MessageThread() {
  const [message, setMessage] = useState('');

  // Acompanha o valor mais recente.
  const latestMessage = useRef('');
  useEffect(() => {
    latestMessage.current = message;
  });

  const showMessage = () => {
    alert('You said: ' + latestMessage.current);
  };
```

(Aqui está uma [demo](https://codesandbox.io/s/yqmnz7xy8x).)

Nós fazemos a atribuição *dentro* de um `useEffect` para que o valor ref apenas mude após o DOM ter sido atualizado. Isso garante que a nossa mutação não interrompa recursos como [Time Slicing e Suspense](https://reactjs.org/blog/2018/03/01/sneak-peek-beyond-react-16.html) que contam com renderização interruptível.

Usar uma referência como essa não é necessário com muita frequência. **Capturar props ou state geralmente é a melhor escolha.** No entanto, isto pode ser útil quando se lida com [APIs imperativas](/making-setinterval-declarative-with-react-hooks/) como intervalos e assinaturas. Lembre-se de que você pode rastrear *qualquer* valor como este - um prop, uma variável de estado, o objeto prop completo ou até mesmo uma função.

Esse padrão também pode ser útil para otimizações - como quando a identidade `useCallback` muda com muita freqüência. No entanto, [usar um reducer](https://reactjs.org/docs/hooks-faq.html#how-to-avoid-passing-callbacks-down) geralmente é a [melhor solução](https://github.com/ryardley/hooks-perf-issues/pull/3). (Um tópico para um post futuro no blog!)

---

Nesta postagem, analisamos um defeito em um padrão comum em classes e como closures nos ajudam a corrigi-lo. No entanto, você deve ter notado que, ao tentar otimizar os Hooks, especificando um array de dependências, é possível ter erros com closures. Isso significa que as closures são o problema? Acho que não.

Como vimos acima, as closures realmente nos ajudam *a corrigir* os problemas sutis que são difíceis de notar. Da mesma forma, fica muito mais fácil escrever código que funcione corretamente no [Modo Concorrente](https://reactjs.org/blog/2018/03/01/sneak-peek-beyond-react-16.html). Isso é possível porque a lógica dentro do componente se fecha sobre os props e o state corretos com os quais ele foi renderizado.

Em todos os casos que vi até agora, **os problemas com “closures” acontecem devido a uma suposição equivocada de que “as funções não mudam” ou que “as props são sempre as mesmas”**. Este não é o caso, como espero que este post tenha ajudado a esclarecer.

As funções se fecham sobre suas props e state - e, portanto, sua identidade é tão importante quanto. Isso não é um bug, mas um recurso de componentes de função. As funções não devem ser excluídas do “array de dependências“ para `useEffect` ou `useCallback`, por exemplo. (A forma correta de corrigir isto geralmente é com `useReducer` ou com o `useRef` da solução acima - em breve documentaremos como escolher entre eles).

Quando escrevemos a maioria do nosso código React com funções, precisamos ajustar nossa intuição sobre [otimização de código](https://github.com/ryardley/hooks-perf-issues/pull/3) e [quais valores podem mudar ao longo do tempo](https://github.com/facebook/react/issues/14920).

Como [Fredrik colocou](https://mobile.twitter.com/EphemeralCircle/status/1099095063223812096):

>A melhor regra mental que encontrei até agora com hooks foi ”codificar como se qualquer valor pudesse mudar a qualquer momento”.

Funções não são exceção a esta regra. Levará algum tempo para que isso seja de conhecimento comum em tutoriais de React. Isso requer algum ajuste da mentalidade de componentes de classe. Mas espero que este artigo ajude você a ver com outros olhos.

As funções React sempre capturam seus valores - e agora sabemos por quê.

![Pikachu sorrindo](./pikachu.gif)

Eles são um Pokémon totalmente diferente.
