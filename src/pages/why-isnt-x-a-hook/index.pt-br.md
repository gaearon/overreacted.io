---
title: Por quê X não é um Hook?
date: '2019-01-26'
spoiler: Só porque podemos, não significa que devemos fazer.
---

Desde que a primeira versão alfa dos [Hooks](https://reactjs.org/hooks) foi liberada, uma dúvida sempre volta a aparecer em discussões: "Por quê *\<tal API\>* não é um Hook?"

Para relembrarmos, aqui estão algumas coisas que os Hooks *são*:

* [`useState()`](https://reactjs.org/docs/hooks-reference.html#usestate) permite declarar uma variável de estado (`state`).
* [`useEffect()`](https://reactjs.org/docs/hooks-reference.html#useeffect) permite declarar um efeito secundário.
* [`useContext()`](https://reactjs.org/docs/hooks-reference.html#usecontext) permite acessar informações de um contexto (`context`).

Mas existem outras APIs, como `React.memo()` e `<Context.Provider>`, que *não* são Hooks. Versões comumente propostas dessas APIs com Hooks seriam *não composicionais* e *antimodulares*. Esse artigo o irá ajudar a entender o porquê. 

**Nota: Esse artigo não é uma imersão para aqueles que estão interessados em analisar APIs. Você não precisa pensar em nada disso para ser produtivo com o React!**

---

Há duas importantes propriedades que queremos preservar nas APIs do React:

1. **Composição:** Os [Hooks customizados](https://reactjs.org/docs/hooks-custom.html) são a razão principal por estarmos entusiasmados com a API dos Hooks. Esperamos que as pessoas criem seus própios Hooks frequentemente, e precisamos ter certeza que os Hooks escritos por pessoas diferentes [não entrem em conflito](/why-do-hooks-rely-on-call-order/#flaw-4-the-diamond-problem). (Não estamos todos mimados na forma em que os componentes conseguem se compor de forma limpa e sem quebrar um ao outro?)

2. **Depuração:** Queremos que os erros sejam [fáceis de se encontrar](/the-bug-o-notation/) a medida que a aplicação cresce. Uma das melhores funcionalidades do React é que se vemos algo renderizado da maneira incorreta, podemos percorrer a árvore acima até encontrar qual prop ou estado de componente que causou o erro.

Essas duas restrições juntas podem nos dizer o que pode ou *não pode* ser um Hook. Vamos ver alguns exemplos.

---

## Um Hook Real: `useState()`

### Composição

Múltiplos Hooks customizados utilizando `useState()` não entram em conflito:

```jsx
function useMyCustomHook1() {
  const [value, setValue] = useState(0);
  // O que acontece aqui, fica aqui.
}

function useMyCustomHook2() {
  const [value, setValue] = useState(0);
  // O que acontece aqui, fica aqui.
}

function MyComponent() {
  useMyCustomHook1();
  useMyCustomHook2();
  // ...
}
```

Adicionar uma nova chamada a `useState()` é sempre seguro. Não precisamos saber nada sobre os outros Hooks usados por um componente para declarar uma nova variável de estado (`state`). Também não podemos quebrar outras variáveis de estado (`state`) ao atualizar uma delas.

**Veredito:** ✅ `useState()` não deixa os Hooks customizados frágeis.

### Depuração

Os Hooks são úteis porque podemos passar valores *entre* eles:

```jsx{4,12,14}
function useWindowWidth() {
  const [width, setWidth] = useState(window.innerWidth);
  // ...
  return width;
}

function useTheme(isMobile) {
  // ...
}

function Comment() {
  const width = useWindowWidth();
  const isMobile = width < MOBILE_VIEWPORT;
  const theme = useTheme(isMobile);
  return (
    <section className={theme.comment}>
      {/* ... */}
    </section>
  );
}
```

Mas e se cometermos um erro? Como funciona a depuração?

Vamos dizer que a classe CSS que obtemos de `theme.comment` está errada. Como depuramos isso? Podemos colocar um `breakpoint` ou alguns *logs* no corpo de nosso componente.

Talvez iríamos notar que `theme` está errada, mas `width` e `isMobile` estão corretas. Isso nos indicaria que o problema está dentro de `useTheme()`. Ou talvez iríamos ver que `width` está errada. Isso nos indicaria para verificar dentro de `useWindowWidth()`.

**Uma única verificação aos valores intermediários nos diria qual o Hook no nível superior que contém o erro.** Não precisaríamos de olhar **todas** as suas implementações.

Então podemos "verificar mais de perto" aquele que contém um erro e repetir.

Isso se torna mais importante se a profundidade de aninhamento de Hooks customizados aumentar. Imagine que temos 3 níveis de aninhamento, cada nível usando 3 Hooks customizados diferentes dentro. A [diferença](/the-bug-o-notation/) entre procurar por um erro em **3 lugares** contra potencialmente procurar **3 + 3×3 + 3×3×3 = 39 lugares** é enorme. Por sorte, `useState()` não pode magicamente "influenciar" outros Hooks ou componentes. Um valor errado retornado por ele deixa um rastro, assim como qualquer outra variável. 🐛

**Veredito:** ✅ `useState()` não obscurece a relação causa-efeito em nosso código. Podemos seguir o rastro diretamente até o erro.

---

## Não é um Hook: `useBailout()`

Como uma otimização, componentes que utilizam Hooks podem "se livrar" (do inglês *bail out*) de voltar a serem renderizados.

Uma forma de fazer isso é encapsular todo o componente com um [`React.memo()`](https://reactjs.org/blog/2018/10/23/react-v-16-6.html#reactmemo). Ele deixa de voltar a renderizar se as props são superficialmente iguais ao que tínhamos durante a última renderização. Isso o faz similar a um `PureComponent` em classes.

`React.memo()` recebe um componente e retorna um componente:

```jsx{4}
function Button(props) {
  // ...
}
export default React.memo(Button);
```

**Mas por quê isso não é simplesmente um Hook?**

Não importa se você o chamarmos de `useShouldComponentUpdate()`, `usePure()`, `useSkipRender()` ou `useBailout()`, a implementação deve se parecer com algo assim:

```jsx
function Button({ color }) {
  // ⚠️ Não é uma API real
  useBailout(prevColor => prevColor !== color, color);

  return (
    <button className={'button-' + color}>  
      OK
    </button>
  )
}
```

Há algumas variações (por exemplo um simples marcador `usePure()`) mas no final eles possuem as mesmas falhas.

### Composição

Digamos que tentamos colocar `useBailout()` em dois Hooks customizados:

```jsx{4,5,19,20}
function useFriendStatus(friendID) {
  const [isOnline, setIsOnline] = useState(null);

  // ⚠️ Não é uma API real
  useBailout(prevIsOnline => prevIsOnline !== isOnline, isOnline);

  useEffect(() => {
    const handleStatusChange = status => setIsOnline(status.isOnline);
    ChatAPI.subscribe(friendID, handleStatusChange);
    return () => ChatAPI.unsubscribe(friendID, handleStatusChange);
  });

  return isOnline;
}

function useWindowWidth() {
  const [width, setWidth] = useState(window.innerWidth);
  
  // ⚠️ Não é uma API real
  useBailout(prevWidth => prevWidth !== width, width);

  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  });

  return width;
}
```

O que acontece agora se você usar ambos no mesmo componente?


```jsx{2,3}
function ChatThread({ friendID, isTyping }) {
  const width = useWindowWidth();
  const isOnline = useFriendStatus(friendID);
  return (
    <ChatLayout width={width}>
      <FriendStatus isOnline={isOnline} />
      {isTyping && 'Typing...'}
    </ChatLayout>
  );
}
```

Quando ele irá voltar a renderizar?

Se cada chamada a `useBailout()` tem o poder de pular uma atualização, então as atualizações de `useWindowWidth()` seriam bloqueadas por `useFriendStatus()`, e vice-versa. **Esses Hooks iriam quebrar um ao outro.**

Porém, se `useBailout()` fosse respeitado apenas quando *todas* as chamadas dentro de um único componente "concordassem" em bloquear uma atualização, nosso `ChatThread` iria falhar em atualizar nas mudanças da prop `isTyping`.

Pior ainda, com essa semântica **qualquer Hook que fosse adicionado a `ChatThread` iria quebrar se eles não chamassem *também* a `useBailout()`**. De outra forma, eles não poderiam "votar contra" de deixar de atualizar dentro de `useWindowWidth()` e `useFriendStatus()`.

**Veredito:** 🔴 `useBailout()` quebra a composição. Adicionar ele a um Hook quebra a atualização de estado em outros Hooks. Nós queremos que as APIs sejam [antifrágeis](/optimized-for-change/), e esse comportamento é praticamente o oposto.

### Depuração

Como um Hook como `useBailout()` afeta a depuração?

Utilizaremos o mesmo exemplo:

```jsx
function ChatThread({ friendID, isTyping }) {
  const width = useWindowWidth();
  const isOnline = useFriendStatus(friendID);
  return (
    <ChatLayout width={width}>
      <FriendStatus isOnline={isOnline} />
      {isTyping && 'Typing...'}
    </ChatLayout>
  );
}
```

Digamos que a *label* `Typing...` não apareça quando se espera, apesar de que em algum lugar muitos níveis acima a prop está sendo alterada. Como depuramos isso?

**Normalmente, em React podemos responder essa questão com segurança olhando *para os níveis acima*.** Se `ChatThread` não obtém um novo valor `isTyping`, podemos abrir o componente que renderiza `<ChatThread isTyping={myVar} />` e checar `myVar`, e assim por diante. Em algum desses níveis, ou vamos encontrar uma implementação errada de `shouldComponentUpdate()`, ou um valor incorreto de `isTyping` sendo passado para baixo. Apenas uma verificação em cada componente da cadeia de renderização é geralmente suficiente para localizar a origem do problema.

Contudo, se esse Hook `useBailout()` fosse real, nunca saberíamos a razão pela qual uma atualização foi pulada até que verificássemos *cada um dos Hooks customizados* (em profundidade) usado pelo nosso componente `ChatThread` e os componentes em suas cadeias de renderização. Visto que todo componente pai pode *também* utilizar Hooks customizados, isso iria tomar uma [proporção terrível](/the-bug-o-notation/)

É como se você estivesse procurando por uma chave de fenda em uma cômoda cheia de gavetas, e cada gaveta teria diversas outras cômodas menores, e você não saberia até quando continuaria assim.

**Veredito:** 🔴 O Hook `useBailout()` não apenas quebra a composição, mas também aumenta de forma ampla o número de passos para se depurar e a carga cognitiva para encontrar uma otimização com erros - em alguns casos, exponencialmente.

---

Nós acabamos de verificar um Hook real, `useState()`, e uma sugestão frequente que intencionalmente *não* é um Hook - `useBailout()`. Nós os comparamos com os filtros de Composição e Depuração e analisamos os motivos pelos quais um deles funciona e o outro não.

Enquanto não há uma "versão Hook" de `memo()` ou `shouldComponentUpdate()`, o React *fornece* um Hook chamado [`useMemo()`](https://reactjs.org/docs/hooks-reference.html#usememo). Serve para um propósito similar, mas sua semântica é suficientemente diferente para não cair nas armadilhas descritas anteriormente.

`useBailoout()` é apenas um exemplo de algo que não funciona bem como um Hook. Mas também há alguns outros - por exemplo, `useProvider()`, `useCatch()`, ou `useSuspense()`.

Você consegue ver o por quê?

*(Sussurros: Composição... Depuração...)*
