---
title: Notação "Big-O"
date: '2019-01-25'
spoiler: Qual é o 🐞(<i>n</i>) de sua API?
---

Quando você escreve um código sensível ao desempenho, é uma boa ideia ter em mente sua complexidade algorítmica. É frequentemente expresso com o [Notação Big-O](https://rob-bell.net/2009/06/a-beginners-guide-to-big-o-notation/).

Big-O mede ** o quanto mais lento o código ficará quando você acrecentar mais dados nele**. Por Exemplo, se um algoritmo de ordenação tiver O(<i>n<sup>2</sup></i>) de complexidade, Adicionando × 50 vezes mais itens serão aproximadamente 50<sup>2</sup> = 2,500 vezes mais lento. Big O nao te proporciona o numero exato, mais ele te ajuda a entender como *escala* um algoritmo.

Serve como exemplo: O(<i>n</i>), O(<i>n</i> log <i>n</i>), O(<i>n<sup>2</sup></i>), O(<i>n!</i>).


Contudo, **este post não é sobre algoritmos ou desempenho**. É sobre APIs e depuração(debugging). Acontece que o design da API envolve considerações muito semelhantes.

---

Uma parte significativa de nosso tempo é descobrir e corrigir erros em nosso código. A maioria dos desenvolvedores gostaria de encontrar erros mais rapidamente. Por mais satisfatório que possa ser no final, é um saco passar todo o dia perseguindo um único bug quando você poderia ter implementado algo do seu roteiro.

A experiência de depuração(debugging) influencia nossa escolha de abstrações, bibliotecas e ferramentas. Alguns projetos de API e linguagem fazem com que toda uma classe de erros seja impossível. Alguns criam problemas sem fim. ** Mas como você pode dizer qual é qual? **

Muitas discussões on-line sobre APIs estão principalmente relacionadas à estética. Mas isso [não diz muito] (/ optimized-for-change /) sobre o que se sente ao usar uma API na prática.

** Eu tenho uma métrica que me ajuda a pensar sobre isso. Eu chamo de Notação *Bug-O*  :**

<font size="40">🐞(<i>n</i>)</font>

O Big-O descreve quanto um algoritmo perde performance à medida que as entradas crescem. O * Bug-O * descreve o quanto uma API atrasa * você * à medida que sua base de código cresce.

---

Por exemplo, considere este código que atualiza manualmente o DOM ao longo do tempo com operações imperativas como `node.appendChild ()` e `node.removeChild ()` e nenhuma estrutura clara:

```jsx
function trySubmit() {
  // Seção 1
  let spinner = createSpinner();
  formStatus.appendChild(spinner);
  submitForm().then(() => {
  	// Seção 2
    formStatus.removeChild(spinner);
    let successMessage = createSuccessMessage();
    formStatus.appendChild(successMessage);
  }).catch(error => {
  	// Seção 3
    formStatus.removeChild(spinner);
    let errorMessage = createErrorMessage(error);
    let retryButton = createRetryButton();
    formStatus.appendChild(errorMessage);
    formStatus.appendChild(retryButton)
    retryButton.addEventListener('click', function() {
      // Seção 4
      formStatus.removeChild(errorMessage);
      formStatus.removeChild(retryButton);
      trySubmit();
    });
  })
}
```

O problema com este código não é que seja "feio". Nós não estamos falando de estética. ** O problema é que, se houver um bug nesse código, não sei onde começar a procurar. **

** Dependendo da ordem na qual os retornos de chamada e os eventos são acionados, há uma explosão combinatória do número de caminhos de código que esse programa pode realizar. ** Em alguns deles, vejo as mensagens certas. Em outros, vejo vários dispositivos de rotação, falhas e mensagens de erro juntos e, possivelmente, falhas.

Esta função tem 4 seções diferentes e não há garantias sobre a sua encomenda. Meu cálculo não-científico me diz que existem 4 × 3 × 2 × 1 = 24 ordens diferentes nas quais elas podem ser executadas. Se adicionar mais quatro segmentos de código, serão 8 × 7 × 6 × 5 × 4 × 3 × 2 × 1 - * quarenta mil * combinações. Boa sorte depurando isso.

** Em outras palavras, o Bug-O desta abordagem é 🐞 (<i> n! </ I>) ** onde * n * é o número de segmentos de código que tocam o DOM. Sim, isso é um * fatorial *. Claro, não estou sendo muito científico aqui. Nem todas as transições são possíveis na prática. Mas, por outro lado, cada um desses segmentos pode ser executado mais de uma vez. <span style="word-break: keep-all"> 🐞 (* ¯ \\\ _ (ツ) \ _ / ¯ *) </ span> 
pode ser mais preciso, mas ainda é muito ruim. Nós podemos fazer melhor.

---

Para melhorar o Bug-O deste código, podemos limitar o número de possíveis estados e resultados. Nós não precisamos de nenhuma biblioteca para fazer isso. É apenas uma questão de impor alguma estrutura em nosso código. Aqui está uma maneira de fazer isso:

```jsx
let currentState = {
  step: 'initial', // 'initial' | 'pending' | 'success' | 'error'
};

function trySubmit() {
  if (currentState.step === 'pending') {
    // Não permite enviar mais de uma vez
    return;
  }
  setState({ step: 'pending' });
  submitForm().then(() => {
    setState({ step: 'success' });
  }).catch(error => {
    setState({ step: 'error', error });
  });
}

function setState(nextState) {
  // Limpa todas os filhos(children) existentes
  formStatus.innerHTML = '';

  currentState = nextState;
  switch (nextState.step) {
    case 'initial':
      break;
    case 'pending':
      formStatus.appendChild(spinner);
      break;
    case 'success':
      let successMessage = createSuccessMessage();
      formStatus.appendChild(successMessage);
      break;
    case 'error':
      let errorMessage = createErrorMessage(nextState.error);
      let retryButton = createRetryButton();
      formStatus.appendChild(errorMessage);
      formStatus.appendChild(retryButton);
      retryButton.addEventListener('click', trySubmit);
      break;
  }
}
```

Esse código pode não parecer muito diferente. É até um pouco mais detalhado. Mas é * dramaticamente * mais simples depurar por causa dessa linha:
```jsx{3}
function setState(nextState) {
  // Clear all existing children
  formStatus.innerHTML = '';

  // ... O codigo adiciona coisas no formStatus ...
```

Ao limpar o status do formulário antes de fazer qualquer manipulação, garantimos que as operações do DOM sempre comecem do zero. É assim que podemos combater a inevitável [entropia] (/the-elements-of-ui-engineering/) - não deixando que os erros se acumulem. Este é o equivalente codificador de “desligá-lo e ligá-lo novamente”, e funciona incrivelmente bem.

** Se houver um bug na saída, precisamos apenas pensar em * um * passo atras - para a chamada `setState` anterior. ** O Bug-O da depuração de um resultado de renderização é 🐞 (* n *) onde * n * é o número de caminhos de código de renderização. Aqui são apenas quatro (porque temos quatro casos em um `switch`).

Podemos ainda ter condições de * definir * o estado, mas a depuração é mais fácil porque cada estado intermediário pode ser registrado e inspecionado. Também podemos proibir quaisquer transições indesejadas explicitamente:

```jsx
function trySubmit() {
  if (currentState.step === 'pending') {
    // Não permite enviar mais de uma vez
    return;
  }
```

Claro, sempre recompor o DOM vem com uma compensação. A remoção e recriação desnecessária do DOM toda vez destruiria seu estado interno, perderia o foco e causaria terríveis problemas de desempenho em aplicativos maiores.

É por isso que bibliotecas como o React podem ser úteis. Eles permitem que você * pense * no paradigma de sempre recriar a interface do usuário do zero, sem necessariamente fazê-lo:

```jsx
function FormStatus() {
  let [state, setState] = useState({
    step: 'initial'
  });

  function handleSubmit(e) {
    e.preventDefault();
    if (state.step === 'pending') {
      // Não permite enviar mais de uma vez
      return;
    }
    setState({ step: 'pending' });
    submitForm().then(() => {
      setState({ step: 'success' });
    }).catch(error => {
      setState({ step: 'error', error });
    });
  }

  let content;
  switch (state.step) {
    case 'pending':
      content = <Spinner />;
      break;
    case 'success':
      content = <SuccessMessage />;
      break;
    case 'error':
      content = (
        <>
          <ErrorMessage error={state.error} />
          <RetryButton onClick={handleSubmit} />
        </>
      );
      break;
  }

  return (
    <form onSubmit={handleSubmit}>
      {content}
    </form>
  );
}
```

O código pode parecer diferente, mas o princípio é o mesmo. A abstração do componente impõe limites para que você saiba que nenhum outro código * na página poderia mexer com o estado do seu DOM. A componentização ajuda a reduzir o Bug-O.

De fato, se o valor * any * parece errado no aplicativo React do DOM, é possível rastrear de onde ele vem examinando o código de componentes acima dele na árvore React, um por um. Não importa o tamanho do aplicativo, o rastreamento de um valor renderizado é 🐞 (* altura da árvore *).

** Da próxima vez que você vir uma discussão sobre a API, considere: qual é o 🐞 (* n *) das tarefas comuns de depuração(debugging) nela? ** E as APIs e os princípios existentes com os quais você está profundamente familiarizado? Redux, CSS, herança - todos eles têm seu próprio Bug-O.

---