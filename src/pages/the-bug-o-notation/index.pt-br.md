---
title: A Notação “Bug-O”
date: '2019-01-25'
spoiler: Qual é a 🐞(<i>n</i>) da sua API?
---

Quando você escreve código cujo desempenho é crítico, é uma boa ideia ter em mente a complexidade do seu algoritmo. Geralmente expresso com a [Notação Big-O](https://rob-bell.net/2009/06/a-beginners-guide-to-big-o-notation/).

Big-O é uma medida de "o quão lento seu código vai ficando conforme você adiciona mais dados". Por exemplo, se um algoritmo de ordenação tem complexidade O(<i>n<sup>2</sup></i>), ordenar 50 vezes mais items será aproximadamente 50<sup>2</sup> = 2,500 vezes mais lento. Big-O não lhe da um número exato, mas ajuda a entender como um algoritmo *escala*.

Alguns exemplos: O(<i>n</i>), O(<i>n</i> log <i>n</i>), O(<i>n<sup>2</sup></i>), O(<i>n!</i>).


Entretanto, **esse post não é sobre algoritmos ou performance**. É sobre APIs e debug. Acontece que, o design de uma API envolve considerações bem semelhantes.

---

Uma boa parte do seu tempo é gasto encontrando e consertando erros no seu código. A maioria dos desenvolvedores gostaria de encontrar bugs mais rápido. Por mais satisfatório que seja no final, é uma droga gastar um dia inteiro procurando um único bug quando poderiamos ter implementado alguma funcionalidade. 

Nossa experiência de debug influencia nossas escolhas de abstrações, bibliotecas e ferramentas. Certos conceitos de algumas linguagens e APIs torna impossível cometer uma série de erros. Outras criam problemas intermináveis. **Mas como podemos distinguir qual é qual?**

Muitas discussões na internet sobre APIs tratam primariamente da questão estética. Mas isso [não diz muito](/optimized-for-change/) sobre como é usar a API na prática. 

**Eu tenho uma métrica que me ajuda a pensar nisso. Eu a chamo de notação *Bug-O*:**

<font size="40">🐞(<i>n</i>)</font>

a Big-O descreve o quanto um algoritmo fica mais lento conforme a quantidade de dados aumenta. A *Bug-O* descreve o quanto uma API atrasa a *sua* velocidade de desenvolvimento conforme o código cresce.

---

Por exemplo, vamos considerar esse código (sem uma estrutura clara) que atualiza o DOM manualmente com o passar do tempo usando operações imperativas tais como `node.appendChild()` e `node.removeChild()`:

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

O problema desse código não é ser "feio". Não estamos falando de estética. **O problema é que se existir algum bug no código, não sei nem por onde começar procurando.**

**Dependendo a ordem em que as callbacks e os eventos são disparados, Temos uma explosão combinatória do número de caminhos que o programa pode seguir.** Em alguns deles, eu vou ver as mensagens corretas. Em outros, eu verei diversas falhas e mensagens de erro juntas, e possivelmente a aplicação vai travar.

Essa função possui 4 seções e nenhuma garantia acerca de sua execução. Meus cálculos (não-científicos) me dizem que existem 4x3x2x1 = 24 possibilidades diferentes de execução do programa. Se eu adicionar mais 4 seções de código, serão 8×7×6×5×4×3×2×1 — *quarenta mil* combinações. Boa sorte debugando isso.

**Em outras palavras, a Bug-O dessa abordagem é 🐞(<i>n!</i>)** onde *n* é o numero de segmentos do código em contato com o DOM. Sim, essa é uma análise *fatorial*. Mas é claro, não estou sendo muito científico aqui. Nem todas as operações são possíveis na prática. Mas em contrapartida, cada um desses segmentos podem executar mais de uma vez. A Bug-O <span style="word-break: keep-all">🐞(*¯\\\_(ツ)\_/¯*)</span> poderia ser mais precisa, mas ainda sim continua bem ruim. Nós podemos fazer melhor.

---

Para melhorar a Bug-O desse código, podemos limitar o número de estados e resultados possíveis. Não precisamos de nenhuma biblioteca pra fazer isso. É apenas uma questão de aplicar uma estrutura ao nosso código. Essa é uma maneira de fazer isso:

```jsx
let currentState = {
  step: 'initial', // 'initial' | 'pending' | 'success' | 'error'
};

function trySubmit() {
  if (currentState.step === 'pending') {
    // Não deixar enviar (submit) duas vezes
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
  // Limpar todos os filhos (children) existentes
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

O código pode não parecer muito diferente. É até um pouco mais verboso. Porém é *drasticamente* mais simples de debugar devido a essa linha:

```jsx{3}
function setState(nextState) {
  // Limpar todos os filhos (children) existentes
  formStatus.innerHTML = '';

  // ... Código que adiciona alguma coisa ao formStatus ...
```

Ao limpar o estado do formulário antes de qualquer manipulação, garantimos que as operações envolvendo o DOM sempre começarão do zero. Assim podemos combater a inevitável [entropia](/the-elements-of-ui-engineering/) — ao *não* deixar os erros se acumularem. Isso seria o equivalente (em código) a "desligar e ligar denovo", e funciona incrivelmente bem.

**Se houver algum bug no resultado, só precisamos pensar no *passo anterior* - na última chamada do `setState`.** A Bug-O de debugar o resultado de uma renderização é 🐞(*n*) onde *n* é o número de caminhos que o código pode seguir. Nesse caso, são apenas quatro (temos 4 cases dentro do `switch`).

Ainda é possível termos concorrência ao *definir* o estado, mas debugar isso é mais fácil porque cada estado intermediário pode ser logado e inspecionado. Também podemos proibir explicitamente qualquer operação indesejada.

```jsx
function trySubmit() {
  if (currentState.step === 'pending') {
    // Não deixar enviar (submit) duas vezes
    return;
  }
```

Claro, sempre redefinir o DOM vem com um tradeoff. Ingenuamente remover e recriar o DOM toda hora iria destruir seu estado interno, perder o foco, e causar terríveis problemas de performance em aplicações maiores.

É por isso que bibliotecas como o React podem ser úteis. Elas lhe permitem *pensar* no paradigma de sempre recriar a interface (UI) do zero sem necessariamente fazer isso.

```jsx
function FormStatus() {
  let [state, setState] = useState({
    step: 'initial'
  });

  function handleSubmit(e) {
    e.preventDefault();
    if (state.step === 'pending') {
      // Não deixar enviar (submit) duas vezes
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
O código pode parecer diferente, porém o princípio é o mesmo. A abstração do componente impõe limites para que você saiba que *nenhum outro* código na página pode mexer com o DOM ou com o estado.
A componentização ajuda a reduzir a Bug-O.

De fato, se *qualquer* valor parecer errado no DOM de uma aplicação react, você pode rastreá-lo apenas olhando o código (um por um) dos componentes acima dele na árvore do React. Não importa o tamanho da aplicação, rastrear um valor renderizado será 🐞(*altura da árvore*).

**Da próxima vez que você ver uma discussão sobre uma API, considere isso: Qual é a 🐞(*n*) de tarefas comuns de debugar nela?** E o que dizer sobre APIs e conceitos que você é profundamente familiarizado? Redux, CSS, herança - Todos eles possuem sua própria Bug-O.

---