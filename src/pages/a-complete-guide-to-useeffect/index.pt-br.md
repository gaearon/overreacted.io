---
title: Um guia completo para useEffect
date: '2019-03-09'
spoiler: Efeitos fazem parte do seu fluxo de dados.
---

Você escreveu alguns componentes com [Hooks](https://reactjs.org/docs/hooks-intro.html). Talvez até um pequeno app. Até então você está satisfeito. Está confortável com a API e aprendeu alguns truques durante o caminho. Você até [criou alguns Hooks personalizados](https://reactjs.org/docs/hooks-custom.html) para extrair lógica repetitiva (lá se foram 300 linhas!) e mostrou tudo isso para seus colegas. "Ótimo trabalho!", eles disseram.

Mas, algumas vezes, quando você usa `useEffect`, os pedaços não se encaixam muito bem. Você tem aquela sensação incômoda de que está perdendo alguma coisa. Parece semelhante aos ciclos de vida das classes...mas é mesmo? Você se encontra fazendo perguntas como:

* 🤔 Como faço para replicar `componentDidMount` com `useEffect`?
* 🤔 Como faço para buscar dados corretamente dentro de `useEffect`? O que é `[]`?
* 🤔 Preciso especificar funções como dependências do efeito ou não?
* 🤔 Por que às vezes recebo um loop infinito na busca de dados?
* 🤔 Por que às vezes recebo um *state* ou *props* antiga dentro do meu efeito?

Quando comecei a usar o Hooks, também fiquei confuso com todas essas perguntas. Mesmo ao escrever os documentos iniciais, eu não tinha uma compreensão firme de algumas das sutilezas. Desde então, tive alguns momentos "aha" que quero compartilhar com você. **Faremos um mergulho profundo nesses detalhes, trazendo a superfície as respostas a essas perguntas, que no final, parecerão óbvias para você.**

Para **ver** essas respostas, precisamos dar um passo para trás. O objetivo deste artigo não é fornecer uma lista de receitas. É para ajudar você a realmente "clicar" o `useEffect`. Não haverá muito a aprender. Na verdade, passaremos a maior parte do tempo *desaprendendo*.

**Só depois que parei de olhar para o Hook `useEffect` através do prisma que estou acostumado dos métodos de ciclo de vida de classes, que todas as peças se juntaram para mim.**

>“Desaprenda o que você aprendeu.” — Yoda

![Yoda cheirando o ar. Legenda: “Sinto cheiro de bacon.”](./yoda.jpg)

---

**Este artigo assume que você esteja familiarizado com a API do [`useEffect`](https://reactjs.org/docs/hooks-effect.html).**

**Também é *muito* longo. É como um mini-livro. Esse é apenas o meu formato preferido. Mas eu escrevi um TLDR logo abaixo se você está com pressa ou não se importa.**

**Se você não se sentir confortável com guias que mergulham profundo nos detalhes, espere até que essas explicações apareçam em outro lugar. Assim como quando o React saiu em 2013, levará algum tempo para que as pessoas reconheçam um modelo mental diferente e o ensinem.**

---

## TLDR

Aqui está um rápido TLDR se você não quiser ler a coisa toda. Se algumas partes não fizerem sentido, você pode rolar para baixo até encontrar algo relacionado.

Sinta-se livre para ignorá-lo se você pretende ler o post inteiro. Também vou vinculá-lo no final.

**🤔 Pergunta: Como faço para replicar `componentDidMount` com `useEffect`?**

Embora você possa usar o `useEffect(fn, [])`, não é um equivalente exato. Ao contrário do `componentDidMount`, ele irá capturar *props* e *state*. Assim, mesmo dentro dos retornos de chamada, você verá os valores iniciais de *props* e *state*. Se você quiser ver algo "mais recente", você pode escrever uma *ref* para isso. Mas normalmente há uma maneira mais simples de estruturar o código para que você não precise fazer isso. Tenha em mente que o modelo mental para efeitos é diferente de `componentDidMount` e outros ciclos de vida, e tentar encontrar seus equivalentes exatos pode te confundir mais do que ajudar. Para se tornar produtivo, você precisa "pensar em efeitos", e o modelo mental deles está mais perto de "implementar a sincronização" do que "responder a eventos do ciclo de vida".

**🤔 Pergunta: Como faço para buscar dados corretamente dentro de `useEffect`? O que é `[]`?**

[Este artigo](https://www.robinwieruch.de/react-hooks-fetch-data/) é um bom manual sobre como buscar dados com `useEffect`. Certifique-se de ler até o fim! Não é tão longo como este. `[]` significa que o efeito não usa nenhum valor que participa do fluxo de dados do React e, por esse motivo, é seguro para ser aplicado apenas uma vez. Também é uma fonte comum de erros quando o valor é realmente usado. Você precisará aprender algumas estratégias (principalmente `useReducer` e `useCallback`) que podem remover a necessidade de uma dependência, ao invés de omitir isso incorretamente.

**🤔 Pergunta: Preciso especificar funções como dependências do efeito ou não?**

A recomendação é mover funções que não precisam de *props* ou *state* para fora do seu componente e extrair aquelas que são usadas apenas por um efeito, para dentro desse efeito. Se mesmo depois disso, o efeito ainda acabar usando funções do escopo da renderização (incluindo funções vindas de *props*), envolva-as em `useCallback` aonde elas estiverem definidas e repita o processo. Por que isso é importante? Funções podem "ver" valores de *props* e *state*, significa eles participam do fluxo de dados do React.

**🤔 Pergunta: Por que às vezes recebo um loop infinito na busca de dados?**

Isso pode acontecer se você estiver buscando dados em um efeito sem o segundo argumento de dependências. Sem ele, os efeitos são executados após cada renderização - e definindo um novo estado acionará os efeitos novamente. Um loop infinito também pode acontecer se você especificar um valor que sempre muda no array de dependências. Você pode descobrir qual deles, removendo-os um por um. No entanto, remover uma dependência usada (ou especificar cegamente `[]`) geralmente é uma correção incorreta. Ao invés disso, corrija o problema na sua origem. Por exemplo, funções podem causar esse problema e colocá-las dentro de efeitos, movendo-as ou envolvendo-as com o uso de `useCallback`. Para evitar a recriação de objetos, o `useMemo` pode servir a um propósito semelhante.

**🤔 Pergunta: Por que às vezes recebo um *state* ou *props* antiga dentro do meu efeito?**

Os efeitos sempre podem "ver" as *props* e *state* da renderização em que foram definidos. [Isso ajuda a evitar erros](https://overreacted.io/how-are-function-components-different-from-classes/), mas em alguns casos pode ser irritante. Para esses casos, você pode manter, explicitamente, algum valor em uma _ref_ mutável (o artigo do link explica isso no final). Se você acha que está vendo *props* ou *state* a de uma renderização antiga, mas não é o que você espera, você provavelmente deixou passar alguma dependência. Tente usar a [regra do linter](https://github.com/facebook/react/issues/14920) para te treinar a exergá-los. Depois de alguns dias, será como uma segunda natureza para você. Veja também [essa reposta](https://reactjs.org/docs/hooks-faq.html#why-am-i-seeing-stale-props-or-state-inside-my-function) no nosso FAQ.

---

Espero que este TLDR tenha sido útil! Caso contrário, vamos continuar.

---

## Cada renderização tem seus próprios *props* e *state*

Antes de falarmos sobre efeitos, precisamos falar sobre renderização.

Aqui está um contador. Olhe a linha destacada de perto:

```jsx{6}
function Counter() {
  const [count, setCount] = useState(0);

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

O que isso significa? Será que `count`, de alguma forma, "fica olhando" as alterações ao nosso estado e atualiza automaticamente? Essa pode ser uma primeira intuição quando você aprende React, mas não é um [modelo mental preciso](https://overreacted.io/react-as-a-ui-runtime/).

Neste exemplo, `count` é apenas um número. Não é uma mágica de "ligação de dados" (**data binding**), um "observador" (**watcher**), um "proxy" ou qualquer outra coisa. É um bom e antigo número como este:

```jsx
const count = 42;
// ...
<p>You clicked {count} times</p>
// ...
```

A primeira vez que nosso componente renderiza, a variável `count` que obtemos de `useState()` é `0`. Quando chamamos `setCount(1)`, o React chama nosso componente novamente. Desta vez, a contagem será `1`. E assim por diante:

```jsx{3,11,19}
// Durante primeira renderização
function Counter() {
  const count = 0; // Returned by useState()
  // ...
  <p>You clicked {count} times</p>
  // ...
}

// Após um clique, nossa função é chamada novamente
function Counter() {
  const count = 1; // Returned by useState()
  // ...
  <p>You clicked {count} times</p>
  // ...
}

// Após outro clique, nossa função é chamada novamente
function Counter() {
  const count = 2; // Returned by useState()
  // ...
  <p>You clicked {count} times</p>
  // ...
}
```

**Sempre que atualizamos o estado, o React chama nosso componente. Cada renderização "vê" seu próprio valor de `count`, que é uma *constante* dentro de nossa função.**

Portanto, essa linha não faz nenhuma ligação de dados especial:

```jsx
<p>You clicked {count} times</p>
```

**Ela apenas incorpora um valor numérico na saída de renderização.** Esse número é fornecido pelo React. Quando chamamos `setCount`, React chama nosso componente novamente com um valor de contagem diferente. Em seguida, o React atualiza o DOM para corresponder à nossa nova saída de renderização.

A principal conclusão é que a constante `count`, em qualquer renderização, não muda com o tempo. É nosso componente que é chamado novamente e cada renderização "vê" seu próprio valor de contagem isolado entre renderizações.

*(Para uma visão detalhada desse processo, confira meu post [React as a UI Runtime](https://overreacted.io/react-as-a-ui-runtime/).)*

## Cada renderização tem seus próprios manipuladores de eventos

Por enquanto, tudo bem. E quanto aos manipuladores de eventos?

Veja este exemplo. Ele mostra um alerta com `count` após três segundos:

```jsx{4-8,16-18}
function Counter() {
  const [count, setCount] = useState(0);

  function handleAlertClick() {
    setTimeout(() => {
      alert('You clicked on: ' + count);
    }, 3000);
  }

  return (
    <div>
      <p>You clicked {count} times</p>
      <button onClick={() => setCount(count + 1)}>
        Click me
      </button>
      <button onClick={handleAlertClick}>
        Show alert
      </button>
    </div>
  );
}
```

Digamos que eu faça a seguinte sequência de etapas:

* **Incrementar** o contador 3 vezes
* **Pressionar** "Mostrar alerta"
* **Incrementar** o contador para 5 antes que o tempo limite seja disparado

![Demonstração do Counter](./counter.gif)

O que você espera que o alerta mostre? Você espera que seja 5 - que é o estado do contador no momento do alerta? Ou que irá mostrar 3 - o estado quando eu cliquei?

---

*spoilers à frente*

---

Vá em frente e [tente você mesmo!](https://codesandbox.io/s/w2wxl3yo0l)

Se o comportamento não fizer muito sentido para você, imagine um exemplo mais prático: um aplicativo de bate-papo com o ID do destinatário atual no estado e um botão Enviar. [Este artigo](https://overreacted.io/how-are-function-components-different-from-classes/) explora as razões em profundidade, mas a resposta correta é 3.

O alerta irá "capturar" o estado no momento em que eu cliquei no botão.

*(Também existem maneiras de implementar o outro comportamento, mas vou me concentrar no caso padrão por enquanto. Ao construir um modelo mental, é importante distinguir o "caminho de menor resistência" das saídas de emergência que você pode utilizar uma vez ou outra.)*

---

Mas como isso funciona?

Nós vimos que o valor `count` é uma constante para cada chamada específica da nossa função. Vale a pena enfatizar isso - **nossa função é chamada muitas vezes (uma vez para cada renderização), mas em cada uma dessas vezes o valor de `count` dentro dela é constante e configurado para um valor específico (o estado para aquela renderização).**

Isso não é específico do React - o comportamento regular de funções funcionam de maneira semelhante:

```jsx{2}
function sayHi(person) {
  const name = person.name;
  setTimeout(() => {
    alert('Hello, ' + name);
  }, 3000);
}

let someone = {name: 'Dan'};
sayHi(someone);

someone = {name: 'Yuzhi'};
sayHi(someone);

someone = {name: 'Dominic'};
sayHi(someone);
```

Nesse [exemplo](https://codesandbox.io/s/mm6ww11lk8), a variável externa `someone` é reatribuída várias vezes. (Assim como em algum lugar no React, o estado *atual* do component pode mudar.) **No entanto, no interior de `sayHi`, há uma constante local chamada `name` associada a uma `person` de uma chamada específica.** Essa constante é local, por isso é isolado entre as chamadas! Como resultado, quando os temporizadores são acionados, cada alerta "lembra" o próprio `name`.

Isso explica como o manipulador de eventos captura `count` no momento do clique. Se aplicarmos o mesmo princípio de substituição, cada render "vê" o seu próprio `count`:

```jsx{3,15,27}
// Durante primeira renderização
function Counter() {
  const count = 0; // Returned by useState()
  // ...
  function handleAlertClick() {
    setTimeout(() => {
      alert('You clicked on: ' + count);
    }, 3000);
  }
  // ...
}

// Após um clique, nossa função é chamada novamente
function Counter() {
  const count = 1; // Returned by useState()
  // ...
  function handleAlertClick() {
    setTimeout(() => {
      alert('You clicked on: ' + count);
    }, 3000);
  }
  // ...
}

// Após outro clique, nossa função é chamada novamente
function Counter() {
  const count = 2; // Returned by useState()
  // ...
  function handleAlertClick() {
    setTimeout(() => {
      alert('You clicked on: ' + count);
    }, 3000);
  }
  // ...
}
```

Então, efetivamente, cada render retorna sua própria "versão" de `handleAlertClick`. Cada uma dessas versões "lembra" o seu próprio valor de `count`:

```jsx{6,10,19,23,32,36}
// Durante primeira renderização
function Counter() {
  // ...
  function handleAlertClick() {
    setTimeout(() => {
      alert('You clicked on: ' + 0);
    }, 3000);
  }
  // ...
  <button onClick={handleAlertClick} /> // Com 0 dentro
  // ...
}

// Após um clique, nossa função é chamada novamente
function Counter() {
  // ...
  function handleAlertClick() {
    setTimeout(() => {
      alert('You clicked on: ' + 1);
    }, 3000);
  }
  // ...
  <button onClick={handleAlertClick} /> // Com 1 dentro
  // ...
}

// Após outro clique, nossa função é chamada novamente
function Counter() {
  // ...
  function handleAlertClick() {
    setTimeout(() => {
      alert('You clicked on: ' + 2);
    }, 3000);
  }
  // ...
  <button onClick={handleAlertClick} /> // Com 2 dentro
  // ...
}
```

É por isso que [nesse exemplo](https://codesandbox.io/s/w2wxl3yo0l), os manipuladores de eventos "pertencem" a uma determinada renderização e quando você clica, ele mantém com o estado de `counter` daquela renderização.

**Dentro de qualquer renderização em particular, os objetos e o estado permanecem para sempre iguais.** Mas se *props* e *state* forem isolados entre renderizadores, o mesmo acontecerá com qualquer valor usando-os (incluindo os manipuladores de eventos). Eles também "pertencem" a uma renderização específica. Assim, mesmo as funções assíncronas dentro de um manipulador de eventos "irão ver" o mesmo valor de `count`.

*Nota: eu adicionei valores literais do `count` diretamente nas funções `handleAlertClick` acima. Essa substituição mental é segura pois `count` não pode ser alterado em uma renderização específica. É declarado como uma `const` e é um número. Seria seguro pensar da mesma maneira sobre outros valores, como objetos, mas somente se concordarmos em evitar mutação no estado. Chamar `setSomething(newObj)` com um novo objeto recém-criado, ao invés de mutá-lo, é bom pois o estado pertencente a renderizações anteriores ficará intacto.*

## Cada renderização tem seus próprios efeitos

Este deveria ser um post sobre efeitos, mas ainda não falamos sobre eles ainda! Nós vamos corrigir isso agora. Acontece que os efeitos não são realmente diferentes.

Vamos voltar a um [exemplo da documentação](https://reactjs.org/docs/hooks-effect.html):

```jsx{4-6}
function Counter() {
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

**Aqui está uma pergunta para você: como fazer para que o efeito leia o estado mais recente de `count`?**

Talvez haja algum tipo de "vinculação de dados" ou "observação" que faça a atualização contínua de `count` dentro da função de efeito? Talvez `count` seja uma variável mutável que o React define dentro de nosso componente para que nosso efeito sempre tenha o valor mais recente?

Não.

Nós já sabemos que `count` é constante dentro de uma determinada renderização. Os manipuladores de eventos "veem" o estado de `count` da renderização que eles "pertencem" pois `count` é uma variável dentro do seu escopo. O mesmo é verdade para efeitos!

**Não é a variável `count` que de alguma forma mudou dentro de um efeito "imutável". É a _função do efeito em si_ que é diferente em cada renderização.**

Cada versão "vê" o valor de `count` da renderização que ela "pertence":

```jsx{5-8,17-20,29-32}
// Durante primeira renderização
function Counter() {
  // ...
  useEffect(
    // Função de efeito da primeira renderização
    () => {
      document.title = `You clicked ${0} times`;
    }
  );
  // ...
}

// Após um clique, nossa função é chamada novamente
function Counter() {
  // ...
  useEffect(
    // Função de efeito da segunda renderização
    () => {
      document.title = `You clicked ${1} times`;
    }
  );
  // ...
}

// Após outro clique, nossa função é chamada novamente
function Counter() {
  // ...
  useEffect(
    // Função de efeito da terceira renderização
    () => {
      document.title = `You clicked ${2} times`;
    }
  );
  // ..
}
```

O React lembra a função de efeito que você forneceu e a executa depois de liberar as alterações para o DOM e permitir que o navegador pinte a tela.

Mesmo se falarmos de um conceitual único _efeito_ aqui (atualizando o título do documento), ele é representado por uma _função diferente_ em cada renderização - e cada função de efeito "vê" suas *props* e *state* da renderização específica à qual ele "pertence".

**Conceitualmente, você pode imaginar que os efeitos _fazem parte do resultado da renderização_.**

Falando rigorosamente, eles não são (tudo isso para [permitir a composição do Hook](https://overreacted.io/why-do-hooks-rely-on-call-order/) sem uma sintaxe grotesca ou com alguma sobrecarga em tempo de execução). No modelo mental que estamos construindo, as funções de efeito pertencem a uma renderização específica, da mesma maneira que os manipuladores de eventos.

---

Para ter certeza de que temos uma sólida compreensão, vamos recapitular nossa primeira renderização:

- **React**: Me retorna a interface do usuário quando o estado é `0`.
- **Seu Componente**:
  - Aqui está o resultado da renderização: `<p>You clicked 0 times</p>`.
  - Lembre-se de executar este efeito depois que você estiver pronto: `() => { document.title = 'You clicked 0 times' }`.
- **React**: Claro. Atualizando a interface do usuário. Olá navegador, estou adicionando algumas coisas ao DOM.
- **Navegador**: Legal, eu pintei para a tela.
- **React**: OK, agora vou executar o efeito que você me deu.
  - Executando: `() => { document.title = 'You clicked 0 times' }`.

---

Agora vamos recapitular o que acontece depois que clicamos:

- **Seu componente**: Ei React, defina meu estado como `1`.
- **React**: Me retorna a interface do usuário quando o estado é `1`
- **Seu componente**:
  - Aqui está o resultado da renderização: `<p>You clicked 1 times</p>`.
  - Lembre-se de executar este efeito depois que você estiver pronto: `() => { document.title = 'You clicked 1 times' }`.
- **React**: Claro. Atualizando a interface do usuário. Ei navegador, eu mudei o DOM.
- **Navegador**: Legal, eu pintei suas alterações na tela.
- **React**: OK, agora eu vou executar o efeito que pertence a rendererização que acabei de fazer.
  - Executando: `() => { document.title = 'You clicked 1 times' }`.

---

## Cada renderização tem seu próprio... tudo

**Sabemos agora que os efeitos são executados após cada renderização, são conceitualmente parte da saída do componente e “veem” os objetos e o estado a partir dessa renderização específica.**

Vamos tentar um experimento mental. Considere este código:

```jsx{4-8}
function Counter() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    setTimeout(() => {
      console.log(`You clicked ${count} times`);
    }, 3000);
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

Se eu clicar várias vezes com um pequeno *delay*, como o log de registros irá ficar?

---

*spoilers à frente*

---

Você pode pensar que isso é uma pegadinha e o resultado final não é intuitivo. Não é! Vamos ver uma sequência de logs - cada um pertencente a uma renderização específica e, portanto, com seu próprio valor de `count`. [Você pode tentar aqui](https://codesandbox.io/s/lyx20m1ol):

![Gravação da tela com logs 1, 2, 3, 4, 5 em ordem](./timeout_counter.gif)

Você pode pensar: “Claro que é assim que funciona! De que outra forma poderia funcionar?

Bem, não é assim que `this.state` funciona em `class`. É fácil cometer o erro de pensar que [essa implementação](https://codesandbox.io/s/kkymzwjqz3) é equivalente em `class`:

```jsx
  componentDidUpdate() {
    setTimeout(() => {
      console.log(`You clicked ${this.state.count} times`);
    }, 3000);
  }
```

No entanto, `this.state.count` sempre aponta para a contagem mais recente ao invés da que pertence a uma renderização específica. Então, você verá `5` nos logs:

![Gravação da tela com logs 5, 5, 5, 5, 5 em ordem](./timeout_counter_class.gif)

Eu acho irônico que os Hooks dependam tanto de **closures** em JavaScript, e ainda assim, é a implementação de classes que sofre com [a confusão canônica de valores errados em temporizadores](https://wsvincent.com/javascript-closure-settimeout-for-loop/) que é freqüentemente associada com **closures**. Isso ocorre porque a fonte real da confusão neste exemplo é a mutação (o React faz mutação em `this.state` nas classes para apontar para o estado mais recente) e não na **closures** em si.

**Closures são ótimas quando os valores que você encapsula nunca mudam. Isso os torna fáceis de se pensar porque você está essencialmente se referindo a uma constante.** E como discutimos, *props* e *state* nunca mudam dentro de uma renderização específica. A propósito, podemos consertar a versão de classe...utilizando [uma **closure**](https://codesandbox.io/s/w7vjo07055).

## Nadando contra a maré

Neste ponto, é importante falar explicitamente: cada função dentro da renderização do componente (incluindo manipuladores de eventos, efeitos, temporizadores ou chamadas de API dentro delas) capturam *props* e *state* da chamada de renderização que a definiu.

Então, esses dois exemplos são equivalentes:

```jsx{4}
function Example(props) {
  useEffect(() => {
    setTimeout(() => {
      console.log(props.counter);
    }, 1000);
  });
  // ...
}
```

```jsx{2,5}
function Example(props) {
  const counter = props.counter;
  useEffect(() => {
    setTimeout(() => {
      console.log(counter);
    }, 1000);
  });
  // ...
}
```

**Não importa se você lê as *props* ou as declara mais "cedo" dentro do seu componente.** Elas não vão mudar! Dentro do escopo de uma única renderização, as *props* e *state* permanecem as mesmas. (desestruturando as *props* tornam isso mais óbvio.)

Naturalmente, às vezes você deseja ler o valor mais recente ao invés do que foi capturado, talvez em algum retorno de chamada definido em um efeito. A maneira mais fácil de fazer isso é usando refs, conforme descrito na última seção [deste artigo](https://overreacted.io/how-are-function-components-different-from-classes/).

Fique ciente de que quando você quiser ler as *props* futuras, ou *state* de uma função em uma renderização passada, você estará nadando contra a maré. Não é errado (e, em alguns casos, necessário), mas isso pode parecer menos "limpo", ao sair do paradigma. Essa é uma consequência intencional porque ajuda a destacar qual código é frágil e depende de um tempo específico. Nas **class**, é menos óbvio quando isso acontece.

Aqui está uma [versão do nosso contador](https://codesandbox.io/s/rm7z22qnlp) que replica o comportamento da classe:

```jsx{3,6-7,9-10}
function Example() {
  const [count, setCount] = useState(0);
  const latestCount = useRef(count);

  useEffect(() => {
    // Define o último valor por mutação
    latestCount.current = count;
    setTimeout(() => {
      // Lendo o último valor da mutação
      console.log(`You clicked ${latestCount.current} times`);
    }, 3000);
  });
  // ...
```

![Gravação da tela com logs 5, 5, 5, 5, 5 em ordem](./timeout_counter_refs.gif)

Pode parecer estranho mutar algo em React. No entanto, é exatamente assim que o próprio React reatribui `this.state` em classes. Ao contrário das *props* e *state* capturadas, você não tem nenhuma garantia de que a leitura `latestCount.current` forneça o mesmo valor em qualquer chamada de retorno específica. Por definição, você pode alterá-lo a qualquer momento. É por isso que não é um padrão, e você tem que optar manualmente por isso.

## Então, o que acontece no momento de limpeza?

Como [a documentação explica](https://reactjs.org/docs/hooks-effect.html#effects-with-cleanup), alguns efeitos podem ter uma fase de limpeza. Essencialmente, sua finalidade é "desfazer" um efeito para casos como **subscriptions**.

Considere este código:

```jsx
  useEffect(() => {
    ChatAPI.subscribeToFriendStatus(props.id, handleStatusChange);
    return () => {
      ChatAPI.unsubscribeFromFriendStatus(props.id, handleStatusChange);
    };
  });
```

Vamos supor que *props* está em `{id: 10}` na primeira renderização e `{id: 20}` na segunda. Você pode pensar que algo assim acontece:

- React limpa o efeito para `{id: 10}`
- React renderiza a interface do usuário para `{id: 20}`
- React executa o efeito para `{id: 20}`

(Esse não é bem o caso.)

Com este modelo mental, você pode pensar que a limpeza “vê” os objetos antigos porque ela executa antes de renderizar novamente, e então o novo efeito “vê” as novas *props* porque executa após a re-renderização. Esse é o modelo mental diretamente relacionado aos ciclos de vida das classes, e **não é preciso nesse caso**. Vamos ver o porque.

React apenas executa os efeitos [depois de deixar o navegador pintar as alterações na tela](https://medium.com/@dan_abramov/this-benchmark-is-indeed-flawed-c3d6b5b6f97f). Isso torna seu aplicativo mais rápido, pois a maioria dos efeitos não precisa bloquear as atualizações de tela. A limpeza do efeito também é atrasada. **O efeito anterior é limpo _após_ a nova renderização com novas *props***:

* **React renderiza a interface do usuário para `{id: 20}`.**
* O navegador pinta a tela. Nós vemos a interface do usuário para `{id: 20}`na tela.
* **React limpa o efeito para `{id: 10}`.**
* React executa o efeito para `{id: 20}`.

Você pode estar se perguntando: mas como a limpeza do efeito anterior ainda pode “ver” as *props* `{id: 10}` se ele foi executado depois que os adereços mudaram para `{id: 20}`?

Nós estivemos aqui antes...🤔

![Déjà vu (cena do gato do filme Matrix)](./deja_vu.gif)

Citando a seção anterior:

>Todas as funções dentro da renderização do componente (incluindo manipuladores de eventos, efeitos, temporizadores ou chamadas de API dentro delas) capturam *props* e *state* da chamada de renderização que a definiu.

Agora a resposta é clara! A limpeza do efeito não lê as *props* "mais recentes", o que quer que isso signifique. Ela lê as *props* que pertencem à renderização que a definiu:

```jsx{8-11}
// Primeira renderização, props são {id: 10}
function Example() {
  // ...
  useEffect(
    // Efeito da primeirza renderização
    () => {
      ChatAPI.subscribeToFriendStatus(10, handleStatusChange);
      // Limpeza para o efeito da primeira renderização
      return () => {
        ChatAPI.unsubscribeFromFriendStatus(10, handleStatusChange);
      };
    }
  );
  // ...
}

// Próxima renderização, props são {id: 20}
function Example() {
  // ...
  useEffect(
    // Efeito da segunda renderização
    () => {
      ChatAPI.subscribeToFriendStatus(20, handleStatusChange);
      // Limpeza para o efeito da segunda renderização
      return () => {
        ChatAPI.unsubscribeFromFriendStatus(20, handleStatusChange);
      };
    }
  );
  // ...
}
```

Reinos se elevarão e se transformarão em cinzas, o Sol irá ejetar suas camadas externas e se tornar uma [anã branca](https://pt.wikipedia.org/wiki/Anã_branca) e a última civilização terminará. Mas nada fará com que as *props* utilizadas pela etapa de limpeza da primeira renderização sejam outras do que `{id: 10}`.

Isso é o que permite que o React lide com os efeitos logo após a pintura - tornando seus aplicativos mais rápidos por padrão. As *props* antigas ainda estão lá, se o nosso código precisar delas.

## Sincronização, não Ciclos de Vida

Uma das minhas coisas favoritas sobre o React é que ele unifica a descrição do resultado inicial da renderização e das atualizações. Isso [reduz a entropia do seu programa](https://overreacted.io/the-bug-o-notation/).

Digamos que meu componente é o seguinte:

```jsx
function Greeting({ name }) {
  return (
    <h1 className="Greeting">
      Hello, {name}
    </h1>
  );
}
```

Não importa se eu renderizo `<Greeting name="Dan" />` e depois `<Greeting name="Yuzhi" />`, ou se apenas renderizo `<Greeting name="Yuzhi" />`. No final, vamos ver `"Hello, Yuzhi"` em ambos os casos.

As pessoas dizem: "É tudo sobre a jornada, não o destino". Com React, é o oposto. **É tudo sobre o destino, não a jornada**. Essa é a diferença entre as chamadas `$.addClass` e `$.removeClass` no código jQuery (nossa "jornada") e especificando *qual deve* ser a classe CSS no código React (nosso "destino").

**React sincroniza o DOM de acordo com nossas *props* e *state* atuais.** Não há distinção entre uma "montagem" ou uma "atualização" durante a renderização.

Você deve pensar nos efeitos de maneira semelhante. **`useEffect` permite sincronizar as coisas fora da árvore do React de acordo com as nossas *props* e *state***.

```jsx{2-4}
function Greeting({ name }) {
  useEffect(() => {
    document.title = 'Hello, ' + name;
  });
  return (
    <h1 className="Greeting">
      Hello, {name}
    </h1>
  );
}
```

Isso é sutilmente diferente do modelo mental familiar de montagem/atualização/desmontagem. **É importante realmente internalizar isso. Se você está tentando escrever um efeito que se comporta de maneira diferente dependendo se o componente renderiza pela primeira vez ou não, você está nadando contra a maré!** Falhamos em sincronizar se nosso resultado depende da "jornada" e não do "destino".

Não importa se renderizamos com as *props* A, B e C, ou se renderizamos com C imediatamente. Embora possa haver algumas diferenças temporárias (por exemplo, enquanto estamos buscando dados), eventualmente, o resultado final deve ser o mesmo.

Ainda assim, é claro que executar todos os efeitos em cada render pode não ser eficiente. (E em alguns casos, isso levaria a loops infinitos.)

Então, como podemos consertar isso?

## Ensinando React a diferenciar seus efeitos

Nós já aprendemos essa lição com o próprio DOM. Ao invés de alterá-lo em cada nova renderização, o React só atualiza as partes do DOM que realmente mudam.

Quando você está atualizando:

```jsx
<h1 className="Greeting">
  Hello, Dan
</h1>
```

Para:

```jsx
<h1 className="Greeting">
  Hello, Yuzhi
</h1>
```

React vê dois objetos:

```jsx
const oldProps = {className: 'Greeting', children: 'Hello, Dan'};
const newProps = {className: 'Greeting', children: 'Hello, Yuzhi'};
```

React verifica cada uma de suas *props* e determina que `children` mudou e por isso, precisa realizar uma atualização no DOM, mas `className` não mudou. Então, ele pode apenas fazer:

```jsx
domNode.innerText = 'Hello, Yuzhi';
// Não precisa tocar `domNode.className`
```

**Podemos fazer algo assim com efeitos também? Seria bom evitar sua execução quando desnecessário.**

Por exemplo, talvez nosso componente renderize novamente devido a uma alteração de estado:

```jsx{11-13}
function Greeting({ name }) {
  const [counter, setCounter] = useState(0);

  useEffect(() => {
    document.title = 'Hello, ' + name;
  });

  return (
    <h1 className="Greeting">
      Hello, {name}
      <button onClick={() => setCounter(count + 1)}>
        Increment
      </button>
    </h1>
  );
}
```

Mas nosso efeito não usa o estado `counter`. **Nosso efeito sincroniza o `document.title` com a prop `name`, mas nesse caso, a prop `name` é a mesma**. Reatribuir `document.title` em cada mudança de `counter` não é ideal.

Certo, então... React pode checar a diferença em efeitos?

```jsx
let oldEffect = () => { document.title = 'Hello, Dan'; };
let newEffect = () => { document.title = 'Hello, Dan'; };
// O React pode ver entender que essas funções fazem a mesma coisa?
```

Na verdade não. React não pode adivinhar o que a função faz sem chamá-la. (O código fonte realmente não contém valores específicos, apenas encapsula a prop `name`.)

É por isso que, se você quiser evitar a repetição desnecessárias de efeitos, você pode fornecer um array de dependências como segundo argumento (também conhecido como "deps") para `useEffect`:

```jsx{3}
  useEffect(() => {
    document.title = 'Hello, ' + name;
  }, [name]); // Nossas "deps"
```

**É como dizer ao React: "Ei, eu sei que você não pode "ver" dentro desta função, mas eu prometo que só a prop `name` é usada do escopo de renderização e nada mais."**

Se cada um desses valores for o mesmo entre a renderização atual e a anterior, esse efeito não será sincronizado, portanto, o React pode pular o efeito:

```jsx
const oldEffect = () => { document.title = 'Hello, Dan'; };
const oldDeps = ['Dan'];

const newEffect = () => { document.title = 'Hello, Dan'; };
const newDeps = ['Dan'];

// React não pode "olhar" dentro de funções, apenas em "deps"
// Como todas as "deps" são as mesmas, ele não precisa executar o efeito
```

Se mesmo um dos valores do array de dependências for diferente entre renderizações, sabemos que a execução do efeito não será ignorada. Sincronizando todas as coisas!

## Mentir para o React sobre suas "deps" pode causar problemas

Mentir para o React sobre suas "deps" tem consequências ruins. Intuitivamente, isso faz sentido, mas eu vi praticamente todo mundo que tenta usar `useEffect` com um modelo mental das `class`, tenta enganar as regras! (E eu fiz isso também no começo!)

```jsx
function SearchResults() {
  async function fetchData() {
    // ...
  }

  useEffect(() => {
    fetchData();
  }, []); // Isso é certo? Nem sempre -- e tem um jeito melhor de escrever isso.

  // ...
}
```

*(O [FAQ dos Hooks explica](https://reactjs.org/docs/hooks-faq.html#is-it-safe-to-omit-functions-from-the-list-of-dependencies) o que fazer ao invés do exemplo acima. [Voltaremos nesse exemplo](https://overreacted.io/a-complete-guide-to-useeffect/#moving-functions-inside-effects) mais para frente.)*

"Mas eu só quero executar isso ao montar o componente!", Você dirá. Por enquanto, lembre-se: se você especificar "deps", **todos os valores de dentro de seu componente que são usados ​​pelo efeito devem ser listados lá**. Incluindo *props*, *state*, funções - qualquer coisa no escopo do seu componente usado dentro do efeito.

Às vezes, quando você faz isso, isso causa algum problema. Por exemplo, talvez você veja um loop de infinito ao buscar dados ou um **socket** é recriado com muita freqüência. **A solução para esse problema não é remover a dependência** e iremos ver as soluções em breve.

Mas antes de pularmos para as soluções, vamos entender melhor o problema.

## O que acontece se mentirmos na nossa lista de "deps"

Se na nossa lista de "deps" estiverem todos os valores usados ​​pelo efeito, o React saberá quando executá-lo novamente:

```jsx{3}
  useEffect(() => {
    document.title = 'Hello, ' + name;
  }, [name]);
```

![Diagrama de efeitos substituindo uns aos outros](./deps-compare-correct.gif)

*(Quando as dependências são diferentes, nós executamos novamente o efeito.)*

Mas se especificamos `[]` para este efeito, a nova função de efeito não seria executada:

```jsx{3}
  useEffect(() => {
    document.title = 'Hello, ' + name;
  }, []); // Errado: `name` está faltando na lista de "deps"
```

![Diagrama de efeitos substituindo uns aos outros](./deps-compare-wrong.gif)

*(Como as dependências são iguais, nós pulamos o efeito.)*

Nesse caso, o problema pode parecer óbvio. Mas a intuição pode enganá-lo em outros casos, especialmente se sua memória muscular lembrar de soluções com *class*.

Por exemplo, digamos que estamos escrevendo um contador que aumenta a cada segundo. Com `class`, nossa intuição é: "Configure o intervalo uma vez e destrua-o uma vez". Aqui está um [exemplo](https://codesandbox.io/s/n5mjzjy9kl) de como podemos fazer isso. Quando traduzimos mentalmente esse código em `useEffect`, instintivamente adicionamos `[]` a lista de "deps". “Eu quero que seja executado uma vez”, certo?

```jsx{9}
function Counter() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setCount(count + 1);
    }, 1000);
    return () => clearInterval(id);
  }, []);

  return <h1>{count}</h1>;
}
```

No entanto, este exemplo [só incrementa uma vez](https://codesandbox.io/s/91n5z8jo7r). *Oops.*

Se o seu modelo mental é “dependências, deixe-me especificar quando quero reativar o efeito”, este exemplo pode dar a você uma crise existencial. Você *quer* acioná-lo uma vez porque é um intervalo - então por que ele está causando problemas?

No entanto, isso faz sentido se você sabe que a lista de dependências são nossas dicas para o React sobre *tudo* o que o efeito usa do escopo de renderização. Ele usa, `count`, mas nós mentimos para o React, dizendo que isso não acontece com `[]`. É só uma questão de tempo antes que isso nos morde de volta!

Na primeira renderização, `count` é `0`. Portanto, `setCount(count + 1)` no primeiro efeito de renderização significa `setCount(0 + 1)`. **Como nunca executamos novamente o efeito por causa das "deps" `[]`, ele continuará chamando `setCount(0 + 1)` cada segundo:**

```jsx{8,12,21-22}
// Primeira renderização, `state` é 0
function Counter() {
  // ...
  useEffect(
    // Efeito da primeira renderização
    () => {
      const id = setInterval(() => {
        setCount(0 + 1); // Always setCount(1)
      }, 1000);
      return () => clearInterval(id);
    },
    [] // Nunca re-execute o efeito
  );
  // ...
}

// Toda renderização subsequente, `state` é 1
function Counter() {
  // ...
  useEffect(
    // Esse efeito é sempre ignorado porque
    // nós mentimos para o React sobre a lista
    // em branco de dependências
    () => {
      const id = setInterval(() => {
        setCount(1 + 1);
      }, 1000);
      return () => clearInterval(id);
    },
    []
  );
  // ...
}
```

Nós mentimos para o React dizendo que nosso efeito não depende de um valor de dentro de nosso componente, quando na verdade ele depende!

Nosso efeito usa `count` - um valor dentro do escopo de renderização do componente, porém fora do efeito:

```jsx{1,5}
  const count = // ...

  useEffect(() => {
    const id = setInterval(() => {
      setCount(count + 1);
    }, 1000);
    return () => clearInterval(id);
  }, []);
```

Portanto, especificar `[]` como uma dependência criará um erro. O React irá comparar as dependências e pulará a atualização desse efeito:

![Diagrama da closure do intervalo já obsoleto](./interval-wrong.gif)

*(As dependências são iguais, então pulamos o efeito.)*

Questões como essa são difíceis de se pensar. Portanto, eu te encorajo a adotar como uma regra rigorosa de sempre ser honesto sobre suas dependências de efeito e especificar todas elas. Fornecemos [uma regra no linter](https://github.com/facebook/react/issues/14920) se você quiser impor isso ao seu time.

## Duas maneiras de ser honesto sobre suas dependências

Existem duas estratégias para ser honesto sobre suas dependências. Geralmente, você deve começar com o primeiro e depois aplicar o segundo, se necessário.

**A primeira estratégia é arrumar o array de dependências para incluir todos os valores do escopo do componente que são usados ​​dentro do efeito.** Vamos incluir `count`:

```jsx{3,6}
useEffect(() => {
  const id = setInterval(() => {
    setCount(count + 1);
  }, 1000);
  return () => clearInterval(id);
}, [count]);
```

Isso faz com que o array de dependências fique correto. Pode não ser *ideal*, mas esse é o primeiro problema que precisamos corrigir. Agora, uma mudança em `count` irá executar o efeito novamente, com cada próximo intervalo referenciando `count` do escopo de renderização do seu component em `setCount(count + 1)`:

```jsx{8,12,24,28}
// Primeira renderização, `state` é 0
function Counter() {
  // ...
  useEffect(
    // Efeito na primeira renderização
    () => {
      const id = setInterval(() => {
        setCount(0 + 1); // setCount(count + 1)
      }, 1000);
      return () => clearInterval(id);
    },
    [0] // [count]
  );
  // ...
}

// Segunda renderização, `state` é 1
function Counter() {
  // ...
  useEffect(
    // Effect from second render
    () => {
      const id = setInterval(() => {
        setCount(1 + 1); // setCount(count + 1)
      }, 1000);
      return () => clearInterval(id);
    },
    [1] // [count]
  );
  // ...
}
```

Isso [resolveria o problema](https://codesandbox.io/s/0x0mnlyq8l), mas nosso intervalo seria limpo e definido novamente sempre que alterações no `count` fossem feitas. Isso pode ser indesejável:

![Diagrama do intervalo que se reinscreve](./interval-rightish.gif)

*(As dependências são diferentes, então executamos novamente o efeito.)*

---

**A segunda estratégia é alterar o código do nosso efeito para que ele não *precise* de um valor que mude com mais frequência do que desejamos.** Nós não queremos mentir sobre as dependências - apenas queremos que nosso efeito tenha menos dependências.

Vamos ver algumas técnicas comuns para remover dependências.

---

## Tornando os Efeitos Auto-Suficientes

Queremos nos livrar de `count` na lista de dependências em nosso efeito:

```jsx{3,6}
  useEffect(() => {
    const id = setInterval(() => {
      setCount(count + 1);
    }, 1000);
    return () => clearInterval(id);
  }, [count]);
```

Para fazer isso, precisamos nos perguntar: para que estamos utilizando `count`? Parece que só usamos para a chamada de `setCount`. E para esse caso, realmente não precisamos de `count`. Quando queremos atualizar o estado com base no estado anterior, podemos usar [a forma funcional](https://reactjs.org/docs/hooks-reference.html#functional-updates) do `setState`:

```jsx{3}
  useEffect(() => {
    const id = setInterval(() => {
      setCount(c => c + 1);
    }, 1000);
    return () => clearInterval(id);
  }, []);
```

Eu gosto de pensar nesses casos como "falsas dependências". Sim, `count` foi uma dependência necessária porque escrevemos `setCount(count + 1)` dentro do efeito. No entando, nós só precisávamos de `count` para transformá-lo em `count + 1` e "enviar de volta" para o React. Mas o React *já conhece* o atual valor de `count`. **O que precisamos dizer ao React é que ele incremente o estado - qualquer que seja seu valor atual.**

Isso é exatamente o que `setCount(c => c + 1)` faz. Você pode pensar nisso como "enviar uma instrução" para o React de como o estado deve mudar. Essa "forma funcional" também ajuda em outros casos, como quando você faz [atualizações em lotes](https://overreacted.io/react-as-a-ui-runtime/#batching).

**Perceba que nós realmente _fizemos o trabalho_ para remover a dependência. Nós não trapaceámos. Nosso efeito não lê mais o valor `count` do escopo de renderização:**

![Diagrama do interval que funciona](./interval-right.gif)

*(As dependências são iguais, então pulamos o efeito.)*

Você pode [tentar aqui](https://codesandbox.io/s/q3181xz1pj).

Embora esse efeito seja executado apenas uma vez, o retorno de chamada do intervalo que definimos pertencente à primeira renderização, é perfeitamente capaz de enviar a instrução de atualização`c => c + 1`  toda vez que o intervalo é disparado. Não precisamos mais saber o estado atual de `count`. React já o conhece.

## Atualizações Funcionais e Google Docs

Lembra que falamos sobre sincronização sendo o modelo mental para efeitos? Um aspecto interessante da sincronização é que muitas vezes você deseja manter as "mensagens" entre os sistemas separados de seu estado. Por exemplo, editar um documento no Google Docs não envia a *página inteira* para o servidor. Isso seria muito ineficiente. Ao invés disso, ele envia uma representação do que o usuário tentou fazer.

Embora nosso caso de uso seja diferente, uma filosofia semelhante se aplica aos efeitos. **Precisamos enviar apenas as informações mínimas necessárias de dentro dos efeitos para um componente.** O atualizador `setCount(c => c + 1)`, por exemplo, tem menos informações do que `setCount(count + 1)` porque ele não está "contaminado" pela contagem atual. Ele apenas expressa a ação desejada ("incrementar"). Pensar em React [envolve encontrar o estado mínimo](https://reactjs.org/docs/thinking-in-react.html#step-3-identify-the-minimal-but-complete-representation-of-ui-state). É o mesmo princípio, mas para atualizações.

Codificar a *intenção* (ao invés do resultado) é semelhante a como o Google Docs [resolve](https://medium.com/@srijancse/how-real-time-collaborative-editing-work-operational-transformation-ac4902d75682) a edição colaborativa. Embora tenhamos ampliando a analogia, as atualizações funcionais desempenham um papel semelhante no React. Eles garantem que atualizações de várias fontes (manipuladores de eventos, assinaturas de efeitos, etc) possam ser aplicadas corretamente em um lote e de maneira previsível.

**No entanto, `setCount(c => c + 1)` não é ótimo.** Parece um pouco estranho e é muito limitado no que pode ele fazer. Por exemplo, se tivéssemos duas variáveis ​​de estado cujos valores dependessem uns dos outros, ou se precisarmos calcular o próximo estado com base em uma *prop*, isso não nos ajudaria. Felizmente, `setCount(c => c + 1)` tem um padrão poderoso. Seu nome é `useReducer`.

## Desacoplando Atualizações de Ações

Vamos modificar o exemplo anterior para ter duas variáveis ​​de estado: `count` e `step`. Nosso intervalo irá incrementar o valor de `count` pelo valor de entrada do `step`:

```jsx{7,10}
function Counter() {
  const [count, setCount] = useState(0);
  const [step, setStep] = useState(1);

  useEffect(() => {
    const id = setInterval(() => {
      setCount(c => c + step);
    }, 1000);
    return () => clearInterval(id);
  }, [step]);

  return (
    <>
      <h1>{count}</h1>
      <input value={step} onChange={e => setStep(Number(e.target.value))} />
    </>
  );
}
```

(Aqui está uma [demonstração](https://codesandbox.io/s/zxn70rnkx) .)

Note que **não estamos trapaceando**. Desde que comecei a usar `step` dentro do efeito, eu adicionei ele nas dependências. E é por isso que o código é executado corretamente.

O comportamento atual neste exemplo é que realizando uma mudança em `step`, reinicia o intervalo - porque ele é uma das dependências. E em muitos casos, é exatamente isso que você quer! Não há nada de errado em encerrar um efeito e defini-lo de novo, e não devemos evitar isso a menos que tenhamos um bom motivo.

No entanto, digamos que queremos que o relógio de intervalo não seja redefinido nas alterações para o `step`. Como removemos `step` da dependência do nosso efeito?

**Ao definir uma variável de estado depende do valor atual de outra variável de estado, você pode tentar substituir ambos por `useReducer`.**

Quando você se encontrar escrevendo `setSomething(something => ...)`, é um bom momento para considerar o uso de um redutor. Um redutor permite **desassociar as "ações" que ocorreram em seu componente de como o estado é atualizado.**

Vamos trocar a dependência `step` por um `dispatch` em nosso efeito:

```jsx{1,6,9}
const [state, dispatch] = useReducer(reducer, initialState);
const { count, step } = state;

useEffect(() => {
  const id = setInterval(() => {
    dispatch({ type: 'tick' }); // Ao invés de `setCount(c => c + step)`
  }, 1000);
  return () => clearInterval(id);
}, [dispatch]);
```

(Veja aqui [uma demonstração](https://codesandbox.io/s/xzr480k0np).)

Você pode me perguntar: "Como isso é melhor?" A resposta é que o **React garante que a função `dispatch` seja constante durante toda a vida útil do componente. Portanto, o exemplo acima nunca precisa reescrever o intervalo.**

Nós resolvemos nosso problema!

*(Você pode omitir os valores de `dispatch`, `setState` e `useRef` das "deps" porque React garante que eles sejam estáticos. Mas também não faz mal especificá-los.)*

Ao invés de ler o estado *dentro* de um efeito, ele envia uma *ação* que descreve as informações *sobre o que aconteceu*. Isso permite que nosso efeito fique desacoplado do estado `step`. Nosso efeito não se importa em *como* atualizamos o estado, apenas nos informa *sobre o que aconteceu*. O redutor centraliza a lógica de atualização:

```jsx{8,9}
const initialState = {
  count: 0,
  step: 1,
};

function reducer(state, action) {
  const { count, step } = state;
  if (action.type === 'tick') {
    return { count: count + step, step };
  } else if (action.type === 'step') {
    return { count, step: action.step };
  } else {
    throw new Error();
  }
}
```

(Aqui está [uma demonstração](https://codesandbox.io/s/xzr480k0np), se você não viu o link mais cedo).

## Por que useReducer é o "Modo Trapaça" dos Hooks

Nós vimos como remover dependências quando um efeito precisa definir o estado com base no estado anterior ou em outra variável de estado. **Mas e se precisarmos de ferramentas para calcular o próximo estado?** Por exemplo, talvez nossa API seja `<Counter step={1} />`. Certamente não podemos evitar especificar `props.step` como uma dependência, certo?

Na verdade, nós podemos! Podemos colocar o redutor em si dentro do nosso componente para ler *props*:

```jsx{1,6}
function Counter({ step }) {
  const [count, dispatch] = useReducer(reducer, 0);

  function reducer(state, action) {
    if (action.type === 'tick') {
      return state + step;
    } else {
      throw new Error();
    }
  }

  useEffect(() => {
    const id = setInterval(() => {
      dispatch({ type: 'tick' });
    }, 1000);
    return () => clearInterval(id);
  }, [dispatch]);

  return <h1>{count}</h1>;
}
```

Esse padrão desativa algumas otimizações, então tente não usá-lo em todos os lugares, mas você pode acessar totalmente suas *props* em um redutor se precisar. (Aqui está [uma demonstração](https://codesandbox.io/s/7ypm405o8q).)

**Mesmo nesse caso, a identidade do `dispatch` ainda é garantida como estável entre as renderizações.** Então você pode omiti-lo das deps de efeito, se quiser. Isso não fará com que o efeito seja executado novamente.

Você pode estar se perguntando: como isso funciona? Como o redutor "sabe" as *props* chamadas de dentro de um efeito que pertence a outra renderização? A resposta é que, quando você usa `dispatch`, React lembra a ação - mas ele irá chamar seu redutor durante a próxima renderização. Nesse ponto, as *props* novas estarão no escopo e você não estará dentro de um efeito.

**É por isso que eu gosto de pensar em `useReducer` como o "Modo Trapaça" dos Hooks. Isso me permite desacoplar a lógica de atualização da descrição do que aconteceu. Isso, por sua vez, me ajuda a remover dependências desnecessárias de meus efeitos e a evitar que sejam executados novamente com mais frequência do que o necessário.**

## Movendo Funções Para Dentro Dos Efeitos

Um erro comum é pensar que as funções não devem ser dependências. Por exemplo, isso parece funcionar:

```jsx{13}
function SearchResults() {
  const [data, setData] = useState({ hits: [] });

  async function fetchData() {
    const result = await axios(
      'https://hn.algolia.com/api/v1/search?query=react',
    );
    setData(result.data);
  }

  useEffect(() => {
    fetchData();
  }, []); // Isso tá certo, né?

  // ...
```

*([Este exemplo](https://codesandbox.io/s/8j4ykjyv0) é adaptado de um ótimo artigo do Robin Wieruch - [confira](https://www.robinwieruch.de/react-hooks-fetch-data/)!)*

E para ser claro, esse código *funciona*. **Mas o problema de simplesmente omitir funções locais é que fica difícil saber se estamos lidando com todos os casos à medida que o componente cresce!**

Imagine que nosso código foi dividido e cada função era cinco vezes maior:

```jsx
function SearchResults() {
  // Imagine que essa função é longa
  function getFetchUrl() {
    return 'https://hn.algolia.com/api/v1/search?query=react';
  }

  // Imagine que essa função também é longa
  async function fetchData() {
    const result = await axios(getFetchUrl());
    setData(result.data);
  }

  useEffect(() => {
    fetchData();
  }, []);

  // ...
}
```

Agora vamos dizer que futuramente usamos algum estado ou *props* em uma dessas funções:

```jsx{6}
function SearchResults() {
  const [query, setQuery] = useState('react');

  // Imagine que essa função também é longa
  function getFetchUrl() {
    return 'https://hn.algolia.com/api/v1/search?query=' + query;
  }

  // Imagine que essa função também é longa
  async function fetchData() {
    const result = await axios(getFetchUrl());
    setData(result.data);
  }

  useEffect(() => {
    fetchData();
  }, []);

  // ...
}
```

Se nos esquecermos de atualizar as deps de qualquer um desses efeitos que chamam essas funções (possivelmente, através de outras funções!), Nossos efeitos não conseguirão sincronizar as mudanças de nossas *props* e *state*. Isso não soa ideal!

Por sorte, existe uma solução fácil para esse problema. **Se você usar apenas algumas funções *dentro* de um efeito, mova elas diretamente para *dentro* desse efeito:**

```jsx{4-12}
function SearchResults() {
  // ...
  useEffect(() => {
    // Movemos a função para dentro do efeito!
    function getFetchUrl() {
      return 'https://hn.algolia.com/api/v1/search?query=react';
    }

    async function fetchData() {
      const result = await axios(getFetchUrl());
      setData(result.data);
    }

    fetchData();
  }, []); // ✅ As dependências estão corretas
  // ...
}
```

([Aqui está uma demonstração](https://codesandbox.io/s/04kp3jwwql).)

Então, qual é o benefício? Não precisamos mais pensar nas “dependências transitivas”. Nosso array de dependências não está mais ocupado: **realmente _não_ estamos usando nada do escopo externo do componente em nosso efeito.**

Se mudarmos `getFetchUrl` para usar o estado `query`, teremos uma probabilidade maior de perceber que estamos editando isso *dentro* de um efeito - e, portanto, precisamos adicionar `query` às dependências do efeito:

```jsx{6,15}
function SearchResults() {
  const [query, setQuery] = useState('react');

  useEffect(() => {
    function getFetchUrl() {
      return 'https://hn.algolia.com/api/v1/search?query=' + query;
    }

    async function fetchData() {
      const result = await axios(getFetchUrl());
      setData(result.data);
    }

    fetchData();
  }, [query]); // ✅ As dependências estão corretas

  // ...
}
```

(Aqui está [uma demonstração](https://codesandbox.io/s/pwm32zx7z7).)

Adicionando essa dependência, nós não estamos apenas "apagizando o React". Isso *faz sentido* para rebuscar os dados quando a consulta muda. **O design de `useEffect` força você a notar que a mudança em nosso fluxo de dados e escolher como nossos efeitos devem sincronizar eles - ao invés de ignorá-los até que nosso usuário final encontre um bug.**

Graças a regra `exhaustive-deps` plugin `eslint-plugin-react-hooks`, [ele pode analisar os efeitos enquanto você digita no seu editor](https://github.com/facebook/react/issues/14920) e recebe sugestões sobre quais dependências estão faltando. Em outras palavras, uma máquina pode informar quais alterações no fluxo de dados não estão sendo tratadas corretamente por um componente:

![Gif da regra do linter](./exhaustive-deps.gif)

Bem maneiro.

## Mas Eu Não Posso Colocar Essa Função Dentro De Um Efeito

Às vezes você pode não vai querer mover uma função para dentro de um efeito. Por exemplo, vários efeitos no mesmo componente podem chamar a mesma função e você não quer copiar e colar sua lógica. Ou talvez seja uma *prop*.

Você deve evitar colocar uma função como esta nas dependências do efeito? Eu acredito que não. Novamente, os **efeitos não devem mentir sobre suas dependências.** Geralmente existem soluções melhores. Um equívoco comum é que "uma função nunca mudaria". Mas, como aprendemos ao longo deste artigo, isso está longe de ser verdade. Na verdade, uma função definida dentro de um componente muda em cada renderização!

**Isso por si só apresenta um problema.** Vamos dizer que dois efeitos chama `getFetchUrl`:

```jsx
function SearchResults() {
  function getFetchUrl(query) {
    return 'https://hn.algolia.com/api/v1/search?query=' + query;
  }

  useEffect(() => {
    const url = getFetchUrl('react');
    // ... Busca dados e faz algo ...
  }, []); // 🔴 Dependência em falta: getFetchUrl

  useEffect(() => {
    const url = getFetchUrl('redux');
    // ... Busca dados e faz algo ...
  }, []); // 🔴 Dependência em falta: getFetchUrl

  // ...
}
```

Nesse caso, talvez você não queira mover `getFetchUrl` para dentro de nenhum dos efeitos, pois não seria capaz de compartilhar a lógica.

Por outro lado, se você for "honesto" sobre as dependências de efeitos, poderá encontrar um problema. Como ambos os nossos efeitos dependem de `getFetchUrl` **(o que é diferente em cada renderização)**, nossos arrays de dependência são inúteis:

```jsx{2-5}
function SearchResults() {
  // 🔴 Re-executa todos os efeitos em cada renderização
  function getFetchUrl(query) {
    return 'https://hn.algolia.com/api/v1/search?query=' + query;
  }

  useEffect(() => {
    const url = getFetchUrl('react');
    // ... Busca dados e faz algo ...
  }, [getFetchUrl]); // 🚧 As dependências estão corretas, mas elas mudam frequentemente

  useEffect(() => {
    const url = getFetchUrl('redux');
    // ... Busca dados e faz algo ...
  }, [getFetchUrl]); // 🚧 As dependências estão corretas, mas elas mudam frequentemente

  // ...
}
```

Uma solução tentadora para isso é simplesmente evitar `getFetchUrl` na lista de dependências. No entanto, não acho que seja uma boa solução. Isso torna difícil perceber quando *estamos* adicionando uma alteração no fluxo de dados que *precisa* ser tratado por um efeito. Isso leva a erros como o "intervalo que nunca atualiza" que vimos anteriormente.

Ao invés disso, existem duas outras soluções que são mais simples.

**Primeiro de tudo, se uma função não usa nada do escopo do componente, você pode mover ela para fora do componente e usa-lá livremente dentro de seus efeitos:**

```jsx{1-4}
// ✅ Não é afetado pelo fluxo de dados
function getFetchUrl(query) {
  return 'https://hn.algolia.com/api/v1/search?query=' + query;
}

function SearchResults() {
  useEffect(() => {
    const url = getFetchUrl('react');
    // ... Busca dados e faz algo ...
  }, []); // ✅ As dependências estão corretas

  useEffect(() => {
    const url = getFetchUrl('redux');
    // ... Busca dados e faz algo ...
  }, []); // ✅ As dependências estão corretas

  // ...
}
```

Não há necessidade de especificá-las nas listas de deps porque a função não está no escopo de renderização e não pode ser afetada pelo fluxo de dados. Ela também não pode depender acidentalmente de *props* ou *state*.

Como alternativa, você pode encapsular a função no [Hook `useCallback`](https://reactjs.org/docs/hooks-reference.html#usecallback):

```jsx{2-5}
function SearchResults() {
  // ✅ Preserva a identidade quando as *props* são as mesmas
  const getFetchUrl = useCallback((query) => {
    return 'https://hn.algolia.com/api/v1/search?query=' + query;
  }, []);  // ✅ As dependências do Callback estão corretas

  useEffect(() => {
    const url = getFetchUrl('react');
    // ... Busca dados e faz algo ...
  }, [getFetchUrl]); // ✅ As dependências do Efeito estão corretas

  useEffect(() => {
    const url = getFetchUrl('redux');
    // ... Busca dados e faz algo ...
  }, [getFetchUrl]); // ✅ As dependências do Efeito estão corretas

  // ...
}
```

`useCallback` é como adicionar outra camada de verificações de dependência. Ele está resolvendo o problema do outro lado - **ao invés de evitar uma dependência de função, nós fazemos a função em si só mudar quando necessário.**

Vamos ver porque esta abordagem é útil. Anteriormente, nosso exemplo mostrava dois resultados de pesquisa (um para o termo 'react' e outro para 'redux'). Mas digamos que queremos adicionar uma entrada para que você possa procurar por uma `query` arbitrária. Então, ao invés de passarmos `query` como um argumento, `getFetchUrl` irá usar a variável do estado local.

Nós veremos imediatamente que está faltando `query` na lista de dependência:

```jsx{5}
function SearchResults() {
  const [query, setQuery] = useState('react');
  const getFetchUrl = useCallback(() => { // Não temos `query` como argumento
    return 'https://hn.algolia.com/api/v1/search?query=' + query;
  }, []); // 🔴 Está faltando uma dependência: `query`
  // ...
}
```

Se eu corrigir as dependências em `useCallback` e incluir `query`, qualquer efeito com `getFetchUrl` listado em suas "deps" será executado novamente sempre que a `query` for alterada:

```jsx{4-7}
function SearchResults() {
  const [query, setQuery] = useState('react');

  // ✅ Preserva a identidade até a `query` mudar
  const getFetchUrl = useCallback(() => {
    return 'https://hn.algolia.com/api/v1/search?query=' + query;
  }, [query]);  // ✅ As dependências do Callback estão corretas

  useEffect(() => {
    const url = getFetchUrl();
    // ... Busca dados e faz algo ...
  }, [getFetchUrl]); // ✅ As dependências do Efeito estão corretas

  // ...
}
```

Graças a `useCallback`, se `query` for a mesma, `getFetchUrl` também permanece a mesma, e nosso efeito não é executado novamente. Mas se houver alterações na `query` então `getFetchUrl` também irá mudar e nós buscaremos os dados novamente. É muito parecido com quando você altera alguma célula em uma planilha do Excel, e as outras células que a usam recalculam automaticamente.

Isso é apenas uma conseqüência de adotar o fluxo de dados e a mentalidade de sincronização. **A mesma solução funciona para objetos de função passados pelos elementos pais:**

```jsx{4-8}
function Parent() {
  const [query, setQuery] = useState('react');

  // ✅ Preserva a identidade até a `query` mudar
  const fetchData = useCallback(() => {
    const url = 'https://hn.algolia.com/api/v1/search?query=' + query;
    // ... Fetch data and return it ...
  }, [query]);  // ✅ As dependências do Callback estão corretas

  return <Child fetchData={fetchData} />
}

function Child({ fetchData }) {
  let [data, setData] = useState(null);

  useEffect(() => {
    fetchData().then(setData);
  }, [fetchData]); // ✅ As dependências do Efeito estão corretas

  // ...
}
```

Como `fetchData` só muda quando o estado `query` do `Parent` muda, `Child` não irá buscar dados até que seja realmente necessário (houver alguma alteração).

## As Funções Fazem Parte do Fluxo de Dados?

Curiosamente, esse padrão quando quebrado com o paradigma de classes, realmente mostra a diferença entre efeitos e ciclos de vida. Considere esse exemplo:

```jsx{5-8,18-20}
class Parent extends Component {
  state = {
    query: 'react'
  };
  fetchData = () => {
    const url = 'https://hn.algolia.com/api/v1/search?query=' + this.state.query;
    // ... Busca dados e faz algo ...
  };
  render() {
    return <Child fetchData={this.fetchData} />;
  }
}

class Child extends Component {
  state = {
    data: null
  };
  componentDidMount() {
    this.props.fetchData();
  }
  render() {
    // ...
  }
}
```

Você pode estar pensando: “Vamos Dan, todos nós sabemos que `useEffect` é como `componentDidMount` e `componentDidUpdate` combinados, você não pode continuar batendo naquele tambor!” **No entanto, isso não funciona nem com `componentDidUpdate`:**

```jsx{8-13}
class Child extends Component {
  state = {
    data: null
  };
  componentDidMount() {
    this.props.fetchData();
  }
  componentDidUpdate(prevProps) {
    // 🔴 Essa condição nunca será verdadeira
    if (this.props.fetchData !== prevProps.fetchData) {
      this.props.fetchData();
    }
  }
  render() {
    // ...
  }
}
```

Claro, `fetchData` é um método de classe! (Ou melhor, uma propriedade de classe - mas isso não muda nada.) Não será diferente por causa de uma mudança de estado. Então, `this.props.fetchData` vai ser igual a `prevProps.fetchData` e nós nunca vamos buscar dados novamente. Vamos apenas remover essa condição então?

```jsx
  componentDidUpdate(prevProps) {
    this.props.fetchData();
  }
```

Oh, espere, isso busca dados em *cada* nova renderização. (Se adicionarmos uma animação acima nessa árvore de componentes, é uma maneira divertida de descobrir isso.) E se vincularmos com uma `query` específica?

```jsx
  render() {
    return <Child fetchData={this.fetchData.bind(this, this.state.query)} />;
  }
```

Mas então `this.props.fetchData !== prevProps.fetchData` é *sempre* verdadeiro, mesmo que `query` não mude! Então, vamos *sempre* executar a busca de dados.

A única solução real para esse enigma com as classes é morder a língua e passar a `query` em si para o componente `Child`. Na verdade, `Child`, acaba não *usando* a `query`, mas pode disparar uma busca quando muda:

```jsx{10,22-24}
class Parent extends Component {
  state = {
    query: 'react'
  };
  fetchData = () => {
    const url = 'https://hn.algolia.com/api/v1/search?query=' + this.state.query;
    // ... Busca dados e faz algo ...
  };
  render() {
    return <Child fetchData={this.fetchData} query={this.state.query} />;
  }
}

class Child extends Component {
  state = {
    data: null
  };
  componentDidMount() {
    this.props.fetchData();
  }
  componentDidUpdate(prevProps) {
    if (this.props.query !== prevProps.query) {
      this.props.fetchData();
    }
  }
  render() {
    // ...
  }
}
```

Ao longo dos anos trabalhando com classes com o React, eu me acostumei em passar *props* desnecessárias e quebrar o encapsulamento de componentes pai, e eu só percebi o porque tivemos que fazer isso a uma semana atrás.

**Com as classes, as funções em *props* por si só não fazem parte do fluxo de dados.** Os métodos se misturam a variável mutável `this`, então não podemos confiar em sua identidade para identificar qualquer coisa. Portanto, mesmo quando queremos apenas uma função, temos que passar um monte de outros dados para poder "diferenciá-la". Não podemos saber se o `this.props.fetchData` passado do pai depende de algum estado ou não, e se esse estado acabou de mudar.

**Com `useCallback`, funções podem participar totalmente no fluxo de dados.** Podemos dizer que, se as entradas da função forem alteradas, a função em si mudou, mas se não, ela permaneceu a mesma. Graças à granularidade fornecida por `useCallback`, mudanças nas *props* em `props.fetchData` podem se propagar automaticamente.

Da mesma forma, [`useMemo`](https://reactjs.org/docs/hooks-reference.html#usememo) nos permite fazer o mesmo para objetos complexos:

```jsx
function ColorPicker() {
  // Não quebra a comparação raza no Child
  // ao menos que `color` mude
  const [color, setColor] = useState('pink');
  const style = useMemo(() => ({ color }), [color]);
  return <Child style={style} />;
}
```

**Eu quero enfatizar que colocar `useCallback` em todos os lugares não é ideal.** É uma ótima saída de emergência e é útil quando uma função é passada e chamada de dentro de um efeito em elementos filhos. Ou se você está tentando impedir a quebra de memoização de um componente filho. Mas Hooks fazem [um melhor serviço para evitar passar callbacks completamente](https://reactjs.org/docs/hooks-faq.html#how-to-avoid-passing-callbacks-down)

Nos exemplos acima, eu gostaria que `fetchData` estivesse dentro do meu efeito (que por sua vez poderia ser extraído para um Hook personalizado) ou uma importação de nível superior. Eu quero manter os efeitos simples, e utilizar retornos de chamadas neles não ajudam. ("E se alguma `props.onComplete` for alterada enquando uma busca de dados estiver em andamento?") Você pode [simular o comportamento da classe](https://overreacted.io/a-complete-guide-to-useeffect/#swimming-against-the-tide), mas isso não resolve essa **condição de corrida** (*race conditions*).

## Falando em Condições de Corrida

Um exemplo clássico de busca de dados com classes pode ser feito assim:

```jsx
class Article extends Component {
  state = {
    article: null
  };
  componentDidMount() {
    this.fetchData(this.props.id);
  }
  async fetchData(id) {
    const article = await API.fetchArticle(id);
    this.setState({ article });
  }
  // ...
}
```

Como você provavelmente sabe, esse código é *buggy*. Também não suporta atualizações. Então, o segundo exemplo clássico que você pode encontrar online é algo assim:

```jsx{8-12}
class Article extends Component {
  state = {
    article: null
  };
  componentDidMount() {
    this.fetchData(this.props.id);
  }
  componentDidUpdate(prevProps) {
    if (prevProps.id !== this.props.id) {
      this.fetchData(this.props.id);
    }
  }
  async fetchData(id) {
    const article = await API.fetchArticle(id);
    this.setState({ article });
  }
  // ...
}
```

Isso definitivamente é melhor! Mas ainda é *buggy*. A razão pela qual é *buggy* é que o pedido pode sair de ordem. Se eu estou buscando `{id: 10}`, e mudo para `{id: 20}`, mas a solicitação `{id: 20}` chegou primeiro lugar, a solicitação que começou mais cedo, e terminou depois, incorretamente substituiria meu estado.

Isso é chamado de **condição de corrida**, e é típico no código que mistura `async`/`await` (que supõe que algo espera pelo resultado) com fluxo de dados de cima-baixo (*props* ou *state* podem mudar enquanto estamos no meio de uma função assíncrona).

Os efeitos não resolvem este problema magicamente, embora avisem se você tentar passar uma função `async` diretamente para o efeito. (Precisamos melhorar esse aviso para explicar melhor os problemas que você pode encontrar.)

Se a abordagem assíncrona que você usa suportar cancelamento, isso é ótimo! Você pode cancelar a solicitação assíncrona diretamente na sua função de limpeza.

Alternativamente, a abordagem temporária mais fácil é rastreá-la com um booleano:

```jsx{5,9,16-18}
function Article({ id }) {
  const [article, setArticle] = useState(null);

  useEffect(() => {
    let didCancel = false;

    async function fetchData() {
      const article = await API.fetchArticle(id);
      if (!didCancel) {
        setArticle(article);
      }
    }

    fetchData();

    return () => {
      didCancel = true;
    };
  }, [id]);

  // ...
}
```

[Este artigo](https://www.robinwieruch.de/react-hooks-fetch-data/) detalha como você pode manipular erros e estados de carregamento, além de extrair essa lógica em um Hook personalizado. Eu recomendo a leitura caso você queira saber mais sobre como buscar dados com Hooks.

## Elevando o Nível

Com a mentalidade de ciclo de vida das classes, os efeitos colaterais se comportam de maneira diferente do que é renderizado. A renderização de uma interface do usuário é guiada por *props* e *state*, e é garantido que seja consistente com eles, mas os efeitos colaterais não são. Esta é uma fonte comum de erros.

Com a mentalidade de `useEffect`, as coisas são sincronizadas por padrão. Os efeitos colaterais tornam-se parte do fluxo de dados do React. Para cada chamada `useEffect`, uma vez que você o faça corretamente, o seu componente cuida de casos extremos muito melhor.

No entanto, o custo inicial de acertar é maior. Isso pode ser chato. Escrever um código de sincronização que lide bem com os casos extremos é inerentemente mais difícil do que disparar efeitos colaterais únicos que não são consistentes com a renderização.

Isso poderia ser preocupante se `useEffect` fosse *a* ferramenta que você usa a maior parte do tempo. No entanto, é um bloco de construção de baixo nível. Estamos no início dos Hooks, então todo mundo usa blocos de baixo nível o tempo todo, especialmente em tutoriais. Mas, na prática, é provável que a comunidade comece a migrar para abstrações em torno dos Hooks, pois boas APIs ganham impulso.

Estou vendo aplicativos diferentes criarem seus próprios Hooks, como `useFetch`, que encapsula parte da lógica de autenticação do aplicativo ou `useTheme`, que usa o contexto para injetar um tema. Uma vez que você tenha uma caixa de ferramentas dessas, você não usará o `useEffect` *tão* frequentemente. Mas a resiliência que ele traz, cria benefícios para Hooks construído por cima dele.

Até agora, `useEffect` é mais usado para busca de dados. Mas a busca de dados não é exatamente um problema de sincronização. Isto é especialmente óbvio porque as nossas dependências são frequentemente `[]`. Então, o que estamos sincronizando?

A longo prazo, [Suspense para Busca de Dados](https://reactjs.org/blog/2018/11/27/react-16-roadmap.html#react-16x-mid-2019-the-one-with-suspense-for-data-fetching) permitirá que bibliotecas de terceiros tenham uma maneira, de primeira classe, de instruir o React a suspender a renderização até que algo assíncrono (qualquer coisa: código, dados, imagens) estejam prontos.

Como o Suspense cobre gradualmente mais casos de busca de dados, eu antecipo que `useEffect` vai ficar no plano de fundo, como uma ferramenta avançada para casos em que você realmente deseja sincronizar *props* e *state* para algum efeito colateral. Ao contrário da busca de dados, ele lida com este caso naturalmente, pois ele foi projetado para isso. Mas até lá, Hooks personalizados como [mostrado aqui](https://www.robinwieruch.de/react-hooks-fetch-data/), são uma boa maneira de reutilizar a lógica de busca de dados.

## Finalizando

Agora que você sabe tudo o que eu sei sobre o uso de efeitos, confira o [TLDR](#tldr) no início. Ele faz sentido? Perdi alguma coisa? (Eu ainda tenho mais papel aqui!)

Eu adoraria ouvir de você no Twitter! Obrigado pela leitura.
