---
title: Como o React diferencia uma classe de uma função?
date: '2018-12-02'
spoiler:  Falaremos sobre classes, new, instanceof, prototype chains e do design da API.
---

Considere o componente `Greeting`, escrito como uma função:

```jsx
function Greeting() {
  return <p>Hello</p>;
}
```

O React também permite escrevê-lo como uma classe:

```jsx
class Greeting extends React.Component {
  render() {
    return <p>Hello</p>;
  }
}
```

(Até [recentemente](https://reactjs.org/docs/hooks-intro.html), essa era a única forma de usar *features* como o state.)

Quando você deseja renderizar o componente `<Greeting />`, o modo como ele foi implementado não interessa:

```jsx
// Classe ou função — tanto faz.
<Greeting />
```

Porém, o *próprio React* se importa com essa diferença!

Se `Greeting` é uma função, o React precisa chamá-lo:

```jsx
// Seu Código
function Greeting() {
  return <p>Hello</p>;
}

// Dentro do React
const result = Greeting(props); // <p>Hello</p>
```

Mas se `Greeting` for uma classe, o React precisa instanciar ele com um operador `new` e *então* chamar o método `render` na instância criada:

```jsx
// Seu código
class Greeting extends React.Component {
  render() {
    return <p>Hello</p>;
  }
}

// Dentro do React
const instance = new Greeting(props); // Greeting {}
const result = instance.render(); // <p>Hello</p>
```

Em ambos os casos, o objetivo do React é conseguir que o nó seja renderizado (no caso o `<p>Hello</p>`). Mas os passos para tal dependem de como `Greeting` foi definido.

**Então como o React sabe que uma coisa é uma classe ou uma função?**

Assim como no meu [post anterior](/why-do-we-write-super-props/), **você não *precisa* saber isso para ser produtivo no React.** Eu mesmo não sabia durante anos. Por favor, não faça isso virar uma pergunta de entrevista. Na realidade, esse post é mais sobre JavaScript do que de React.

Esse blog é para leitores curiosos que querem saber *como* o React funciona de certa forma. Você é esta pessoa? Então vamos mergulhar juntos.

**Essa é uma longa jornada. Prepare-se. Esse post não tem muita informação sobre o React, mas vamos passar por aspectos como o `new`, o `this`, classes, arrow functions, `prototype`, `__proto__`, `instanceof`, e como essas coisas funcionam junto no JavaScript. Por sorte, você não precisa pensar tanto sobre elas enquanto *usa* o React. Já se você estiver implementando o React...**

(Se você quer apenas saber a resposta, dê um scroll até o final.)

----

Primeiramente, precisamos definir o que é importante para tratar funçõs e classes de forma diferente. Note que usamos o operador `new` quando chamamos uma classe:

```jsx{5}
// Se Greeting é uma função
const result = Greeting(props); // <p>Hello</p>

// Se Greeting é uma classe
const instance = new Greeting(props); // Greeting {}
const result = instance.render(); // <p>Hello</p>
```

Vamos pegar uma noção do que esse `new` faz no JavaScript.

---

Nos velhos tempos, o JavaScript não tinha classes. Porém, era possível se expressar de forma similar usando apenas funções. **De forma concreta, você pode usar *qualquer* função de forma similar à um construtor de uma classe, adicionando um `new` antes da sua chamada:**

```jsx
// Apenas uma função
function Person(name) {
  this.name = name;
}

var fred = new Person('Fred'); // ✅ Person {name: 'Fred'}
var george = Person('George'); // 🔴 Não Funciona
```

Você ainda pode escrever códigos como esse hoje em dia! Tente isso nos DevTools do navegador.

Se você chamou `Person('Fred')` **sem** o `new`, o `this` de dentro deve apontar para alguma coisa global e inútil (por exemplo, `window` ou `undefined`). Assim, o seu código iria quebrar ou fazer alguma coisas idiota como definir `window.name`.

Adicionando `new` antes da chamada, falamos: "Ou JavaScript, eu sei que `Person` é só uma função, mas vamos fazer de conta que é o construtor de uma classe". **Crie um objeto `{}` e aponte o `this` dentro da função `Person` para o objeto criado, para conseguir definir coisas como `this.name`. Depois devolva esse objeto para mim.**"

Isso é o que o operador `new` faz.

```jsx
var fred = new Person('Fred'); // Mesmo objeto que o `this` dentro de `Person`
```

O operador `new` também faz qualquer coisa que colocamos em `Person.prototype` esteja disponível no objeto `fred`:

```jsx{4-6,9}
function Person(name) {
  this.name = name;
}
Person.prototype.sayHi = function() {
  alert('Hi, I am ' + this.name);
}

var fred = new Person('Fred');
fred.sayHi();
```

Essa é a forma que as pessoas emulavam classes antes que as mesmas fossem adicionadas no JavaScript.

---

Então o `new` já estava presente no JavaScript por um tempo. Porém classes são mais recentes. Elas nos permitem reescrever o código anterior, para se adequar mais com a nossa intenção:

```jsx
class Person {
  constructor(name) {
    this.name = name;
  }
  sayHi() {
    alert('Hi, I am ' + this.name);
  }
}

let fred = new Person('Fred');
fred.sayHi();
```

*Capturar a intenção do desenvolvedor* é importante no design da API de qualquer linguagem.

Se você escreve uma função, o JavaScript não consegue adivinhar se ela deveria ser chamada como `alert()` ou se deveria funcionar como um construtor do tipo `new Person()`. Esquecer de especificar o `new` para uma função como `Person` poderia levar a comportamentos confusos.

**A sintaxe de classe nos diz: "Isso não é apenas uma função - é uma classe e ela tem um construtor".** Se você esquecer do `new` quando for chamar ela, o JavaScript vai retornar um erro:

```jsx
let fred = new Person('Fred');
// ✅  Se Person for uma função: funciona
// ✅  Se Person for uma classe: funciona também

let george = Person('George'); // Esquecemos do `new`
// 😳 Se Person for uma função do tipo construtor: comportamento confuso
// 🔴 Se Person for uma classe: falha na hora
```

Isso nos ajuda a achar erros no começo, ao invés de esperar a ocorrência de um bug obscuro, do tipo `this.name` sendo tratado como `window.name` em vez de `george.name`.

Porém, isso significa que o React precisa colocar o `new` antes de chamar qualquer classe. Elas não poderiam ser tratadas como funções regulares, pois o JavaScript retornaria um erro!

```jsx
class Counter extends React.Component {
  render() {
    return <p>Hello</p>;
  }
}

// 🔴 O React não pode fazer isso:
const instance = Counter(props);
```

Isso cheira à confusão.

---

Antes de ver como o React resolve isso, é importante lembrar que muitas pessoas que usam o React, usam compiladores como o Babel para compilar *features* modernas como *classes* para navegadores antigos. Então devemos considerar compiladores no nosso design.

Em versões antigas do Babel, classes poderiam ser chamadas sem o `new`. Porém, isso foi arrumado - adicionando mais código:

```jsx
function Person(name) {
  // Simplificado da saída do Babel:
  if (!(this instanceof Person)) {
    throw new TypeError("Cannot call a class as a function");
  }
  // Nosso codigo:
  this.name = name;
}

new Person('Fred'); // ✅ Certo
Person('George');   // 🔴 Não pode chamar uma classe como uma função
```

Você deve ter visto códigos como este no seu pacote. Isso é o que todas as funções `_classCallCheck` fazem. (Você pode reduzir o tamanho do pacote selecionando o modo "loose mode" sem checagens, mas isso pode complicar a transição para classes nativas reais.)

---

Agora você deve entender mais ou menos a diferença entre chamar uma coisa com `new` ou sem:

|  | `new Person()` | `Person()` |
|---|---|---|
| `classe` | ✅ `this` é uma instância de `Person` | 🔴 `TypeError`
| `função` | ✅ `this` é uma instância de `Person` | 😳 `this` é `window` ou `undefined` |

Isso é o motivo de ser importante o React chamar os componentes corretamente. **Se seus componentes estão definidos como uma classe, o React precisa usar o `new` na chamada.**

Então o React pode apenas verificar se uma coisa é uma clase ou não?

Não é tão simples! Mesmo que nós pudessemos [diferenciar uma classe de uma função no JavaScript](https://stackoverflow.com/questions/29093396/how-do-you-check-the-difference-between-an-ecmascript-6-class-and-function), isso ainda não ajudaria em classes processadas por ferramentas como o Babel. Para o navegador, elas são apenas funções. Azar para o React.

---

Certo. Então o React poderia usar o `new` em toda chamada? Infelizmente, isso não funciona sempre.

Para funções regulares, chamar elas com `new` daria uma instância do objeto `this`. Isso é desejável nas funções escritas como construtores (como o nosso `Person`), mas seria confuso para componentes funcionais:

```jsx
function Greeting() {
  // Não esperamos que `this` seja qualquer instância aqui
  return <p>Hello</p>;
}
```

Isso ainda poderia ser tolerável. Existem 2 *outras* razões para matar essa ideia.

---

A primeira razão é que sempre usar `new` não funcionaria para arrow functions nativas (não aquelas compiladas pelo Babel), pois chamando com `new` retornaria um erro:

```jsx
const Greeting = () => <p>Hello</p>;
new Greeting(); // 🔴 Greeting não é um construtor
```

Esse comportamento é intecional e segue o design das arrow functions. Uma das muitas características das arrow functions é a de que elas *não* possuem um `this` próprio - no lugar disso, o `this` é resolvido como a função regular mais próxima:

```jsx{2,6,7}
class Friends extends React.Component {
  render() {
    const friends = this.props.friends;
    return friends.map(friend =>
      <Friend
        // o `this` é resolvido como o do método `render`
        size={this.props.size}
        name={friend.name}
        key={friend.id}
      />
    );
  }
}
```

Certo. então **arrow functions não possuem o seu próprio `this`.** Mas isso significa que elas seriam inteiramente inúteis como construtores!

```jsx
const Person = (name) => {
  // 🔴 Isso não faria sentido!
  this.name = name;
}
```

Assim, **O JavaScript não permite a chamada de uma arrow function com `new`.** Se você fizer isso, provavelmente cometeu um erro mesmo, e é melhor ser avisado o mais cedo possível. Isso é similar ao motivo do JavaScript não deixar você chamar uma classe *sem* o `new`.

Isso é legal, mas também estraga nossos planos. O React não pode apenas chamar `new` em qualquer coisa porque isso quebraria as arrow functions! Nós poderiamos tentar detectar as arrow functions pela falta de `prototype`, e não colocar o `new` nelas:

```jsx
(() => {}).prototype // undefined
(function() {}).prototype // {constructor: f}
```

Mas isso [não funcionaria](https://github.com/facebook/react/issues/4599#issuecomment-136562930) para funções compiladas com o Babel. Isso pode não ser grande coisa, mas existe outra razão que faz essa abordagem um caminho sem saídas.

---

Outra razão para não colocarmos `new` é que isso impediria o React de suportar componentes que retornam string ou outros tipos primitivos.

```jsx
function Greeting() {
  return 'Hello';
}

Greeting(); // ✅ 'Hello'
new Greeting(); // 😳 Greeting {}
```

Isso, novamente, tem a ver com as peculiaridades do design do [operador `new`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/new). Como nós vimos anteriormente, `new` diz ao JavaScript para criar um objeto, fazer o `this` virar o objeto dentro da função, e depois nos dar um objeto que é resultado do `new`.

Porém, o JavaScript também permite que a função chamada com `new` *sobrescreva* o valor retornado por `new` retornando algum outro objeto. Provavelmente, isso foi considerado útil para padrões como o polling, onde queremos reusar instâncias:

```jsx{1-2,7-8,17-18}
// Criado tardio
var zeroVector = null;

function Vector(x, y) {
  if (x === 0 && y === 0) {
    if (zeroVector !== null) {
      // Reusa a mesma instância
      return zeroVector;
    }
    zeroVector = this;
  }
  this.x = x;
  this.y = y;
}

var a = new Vector(1, 1);
var b = new Vector(0, 0);
var c = new Vector(0, 0); // 😲 b === c
```

Porém, `new` também *ignora completamente* o valor de retorno da função se ele *não* for um objeto. Se você retornar uma string ou um número, é com se não existisse nenhum `return`.

```jsx
function Answer() {
  return 42;
}

Answer(); // ✅ 42
new Answer(); // 😳 Answer {}
```

Não existe uma forma de ler um valor primitivo (como um número ou uma string) de uma função quando chamada com `new`. Dessa forma, se o React sempre usar `new`, não seria possível adicionar suporte para componentes que retornam strings!

Isso é inaceitável, então devemos ajustar.

---

O que aprendemos até agora? O React precisa chamar classes (incluindo a saída do Babel) *com* `new`, mas ele precisa chamar funções regulares e arrow functions (incluindo da saída do Babel) *sem* o `new`. Ainda não existe nenhuma forma de distinguí-los.

**Se não podemos resolver um problema genérico, podemos resolver um mais específico?**

Quando você define um componente como uma classe, você provavelmente quer que herde de `React.Component` para usar os métodos integrados como o `this.setState()`. **Em vez de tentar detectar todas as classes, podemos detectar apenas os decendentes de `React.Component`?**

Spoiler: isso é exatamente o que o React faz.

---

Talvez, a forma idiomática de verificar se `Greeting` é uma classe do React, é testando `Greeting.prototype instanceof React.Component`:

```jsx
class A {}
class B extends A {}

console.log(B.prototype instanceof A); // true
```

Eu sei o que você está pensando. O que aconteceu aqui?! Para responder isso, precisamos entender os protypes do JavaScript.

Você pode estar familiarizado com a "cadeia de prototype". Todo objeto no JavaScript pode ter um "prototype". Quando nós escrevemos `fred.sayHi()` mas o objeto `fred` não tem uma propriedade `sayHi`, procuramos por `sayHi` no prototype de `fred`. Se não acharmos lá, procuramos no próximo prototype da cadeia - o prototype do prototype de `fred`. E assim por diante.

**De maneira confusa, a propriedade `prototype` de uma classe ou função _não_ aponta para o prototype de seu valor.** Eu não estou brincando.

```jsx
function Person() {}

console.log(Person.prototype); // 🤪 Não é o prototype de Person
console.log(Person.__proto__); // 😳 É o prototype de Person
```

Então a "cadeia de prototype" é mais como `__proto__.__proto__.__proto__` do que `prototype.prototype.prototype`. Isso levou anos para eu entender.

O que é a propriedade `prototype` de uma função ou uma classe, então? **É o `__proto__` dado à todos os objetos criados à partir da função ou classe!**

```jsx{8}
function Person(name) {
  this.name = name;
}
Person.prototype.sayHi = function() {
  alert('Hi, I am ' + this.name);
}

var fred = new Person('Fred'); // Define `fred.__proto__` como `Person.prototype`
```

E essa cadeia de `__proto__` é como o JavaScript procura por propriedades:

```jsx
fred.sayHi();
// 1. fred possui uma propriedade sayHi? Não.
// 2. fred.__proto__ possui um propriedade sayHi? Sim. Chame ela!

fred.toString();
// 1. fred possui uma propriedade toString? Não.
// 2. fred.__proto__ possui um propriedade toString? Não.
// 2. fred.__proto____proto__ possui um propriedade toString? Sim. Chame ela!
```

Na prática, você deveria quase nunca precisar tocar no `__proto__` diretamente do código, a menos que você esteja debugando alguma coisa relacionada à cadeia de prototype. Se você quer que coisas estejam disponíveis em `fred.__proto__`, você deveria colocá-las em `Person.prototype`. Pelo menos isso é como as coisas foram projetadas inicialmente.

A propriedade `__proto__` não deveria ser exposta pelos navegadores, já que a cadeia de prototype era considerada uma coisa interna. Mas alguns navegadores adicionaram o `__proto__` e eventualmente ela foi padronizada a contragosto (mas foi descontinuada em favor de `Object.getPrototypeOf()`).

**Ainda assim eu acho muito confuso que uma propriedade chamada `prototype` não dá o prototype do valor** (por exemplo, `fred.prototype` não é definido porque `fred` não é uma função). Pessoalmente, eu acho que isso é a maior razão que mesmo desenvolvedores experientes tendem à não entender os prototypes do JavaScript.

---

Este post está longo, né? Eu diria que estamos em 80% dele. Aguente firme.

Sabemos que quando usamos `obj.foo`, o JavaScript na verdade procura por `foo` em `obj`, `obj.__proto__`, `obj.__proto__.__proto__`, e por aí vai.

Com classes, você não está exposto diretamente à esse mecanismo, mas o `extends` também funciona por cima da velha cadeia de prototypes. Isso é como as instâncias das classes do React conseguem acesso aos métodos como `setState`:

```jsx{1,9,13}
class Greeting extends React.Component {
  render() {
    return <p>Hello</p>;
  }
}

let c = new Greeting();
console.log(c.__proto__); // Greeting.prototype
console.log(c.__proto__.__proto__); // React.Component.prototype
console.log(c.__proto__.__proto__.__proto__); // Object.prototype

c.render();      // Achado em c.__proto__ (Greeting.prototype)
c.setState();    // Achado em c.__proto__.__proto__ (React.Component.prototype)
c.toString();    // Achado em c.__proto__.__proto__.__proto__ (Object.prototype)
```

Em outras palavras, **quando você usa classes, a cadeia de `__proto__` de uma instância "imita" a hierarquia de classes:**

```jsx
// cadeia de `extends`
Greeting
  → React.Component
    → Object (implícito)

// cadeia de `__proto__`
new Greeting()
  → Greeting.prototype
    → React.Component.prototype
      → Object.prototype
```

2 Cadeias.

---

Assim como a cadeia de `__proto__` imita a hierarquia de classes, podemos verificar se `Greeting` herda de `React.Component` com `Greeting.prototype`, e dessa forma seguir sua cadeia de `__proto__`:

```jsx{3,4}
// cadeia de `__proto__`
new Greeting()
  → Greeting.prototype // 🕵️ Começamos aqui
    → React.Component.prototype // ✅ Encontrado!
      → Object.prototype
```

Convenientemente, `x instanceof y` faz exatamente esse mesmo tipo de busca. Ele segue a cadeia de `x.__proto__` procurando por `Y.prototype`.

Normalmente, isso é usado para determinar se uma coisa é uma instância de uma classe:

```jsx
let greeting = new Greeting();

console.log(greeting instanceof Greeting); // true
// greeting (🕵️‍ Começamos aqui)
//   .__proto__ → Greeting.prototype (✅ Encontrado!)
//     .__proto__ → React.Component.prototype
//       .__proto__ → Object.prototype

console.log(greeting instanceof React.Component); // true
// greeting (🕵️‍ Começamos aqui)
//   .__proto__ → Greeting.prototype
//     .__proto__ → React.Component.prototype (✅ Encontrado!)
//       .__proto__ → Object.prototype

console.log(greeting instanceof Object); // true
// greeting (🕵️‍ Começamos aqui)
//   .__proto__ → Greeting.prototype
//     .__proto__ → React.Component.prototype
//       .__proto__ → Object.prototype (✅ Encontrado!)

console.log(greeting instanceof Banana); // false
// greeting (🕵️‍ Começamos aqui)
//   .__proto__ → Greeting.prototype
//     .__proto__ → React.Component.prototype
//       .__proto__ → Object.prototype (🙅‍ Não foi encontrado!)
```

Mas isso também funciona normal para determinar se uma classe herda de outra classe:

```jsx
console.log(Greeting.prototype instanceof React.Component);
// greeting
//   .__proto__ → Greeting.prototype (🕵️‍ Começamos aqui)
//     .__proto__ → React.Component.prototype (✅ Encontrado!)
//       .__proto__ → Object.prototype
```

E essa verificação é como determinamos se uma coisa é um componente de classe do React ou uma função regular.

---

Mas isso não é o que o React faz. 😳

Uma peculiaridade da solução com `instanceof` é que ela não funciona quando temos múltiplas cópias do React na página, e o componente que estamos verificando herda de *outro* `React.Component` de uma cópia do React. Misturando múltiplas cópias do React em um único projeto é ruim por diversas razões, e históricamente tentamos evitar tais problemas quando possível. (Com o Hooks, nós [provavelmente vamos precisar](https://github.com/facebook/react/issues/13991) forçar a remoção da duplicação.)

Uma outra possibilidade heurística poderia ser a verificação da presença de um método `render` no prototype. Porém, [não estava claro](https://github.com/facebook/react/issues/4599#issuecomment-129714112) como a API iria evoluir. Toda verificação tem um custo e nós não queríamos adicionar mais uma. Isso também não funcionaria se o `render` fosse definido como um método de instância, como na sintaxe de propriedade de uma classe.

Então, ao invés disso, o React [adicionou](https://github.com/facebook/react/pull/4663) uma flag especial para o componente base. O React verifica pela presença dessa flag, e dessa forma ele sabe quando uma coisa é uma classe do React ou não.

Originalmente a flag estava na classe base `React.Component`:

```jsx
// Dentro do React
class Component {}
Component.isReactClass = {};

// Podemos verificar dessa maneira
class Greeting extends Component {}
console.log(Greeting.isReactClass); // ✅ Sim
```

Porém, algumas implementações de classe que tínhamos como alvo [não](https://github.com/scala-js/scala-js/issues/1900) copiavam propriedades estáticas (ou definiam um `__proto__` não padronizado), e a flag era jogada fora.

Isso é o motivo do React ter [movido](https://github.com/facebook/react/pull/5021) a flag para `React.Component.prototype`:

```jsx
// Dentro do React
class Component {}
Component.prototype.isReactComponent = {};

// Podemos verificar dessa maneira
class Greeting extends Component {}
console.log(Greeting.prototype.isReactComponent); // ✅ Sim
```

**E isso é literalmente tudo o que é feito.**

Você pode estar pensando sobre o motivo de ser um objeto e não um booleano. Isso não importa muito na prática, mas em versões iniciais do Jest (antes do Jest ser Bom™️) o automocking era ativado automaticamente. Os mocks gerados omitiam as propriedades primitivas, [quebrando a verificação](https://github.com/facebook/react/pull/4663#issuecomment-136533373). Obrigado Jest.

A verificação `isReactComponent` é [usada no React](https://github.com/facebook/react/blob/769b1f270e1251d9dbdce0fcbd9e92e502d059b8/packages/react-reconciler/src/ReactFiber.js#L297-L300) até hoje.

Se você não herdar de `React.Component`, o React não vai encontrar a propriedade `isReactComponent` no seu prototype, e não vai tratar o componente como uma classe. Agora você sabe o motivo da [resposta mais bem avaliada](https://stackoverflow.com/a/42680526/458193) para o erro `Cannot call a class as a function` ser a adição de `extends React.Component`. Por fim, um [alerta foi adicionado](https://github.com/facebook/react/pull/11168) informando que `prototype.render` existe mas `prototype.isReactComponent` não.

---

Você pode dizer que essa história é como matar um mosquito com um canhão. **A solução é simples, mas eu fui longe para explicar o *porque* do React acabar utilizando ela, e quais eram as alternativas.**

Na minha experiência, isso acontece para APIs de bibliotecas. Por uma API ser simples de usar, na maioria dos casos você precisa considerar a semântica da linguagem (possivelmente, para algumas linguagens, incluindo versões futuras), o desempenho, a ergonomia com e sem os tempos de compilação, o estado do ecossistema e os métodos para criação de pacotes, avisos o mais cedo possível, e muitas outras coisas. O resultado final pode não ser sempre o mais elegante, mais deve ser o mais prático.

**Se a API for um sucesso, _seus usuários_ nunca vão precisar pensar sobre o processo.** Ao invés disso eles podem focar na criação de aplicações.

Mas se você também é curioso... é legal saber como ela funciona.
