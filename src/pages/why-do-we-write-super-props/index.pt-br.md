---
title: Por Que Nós Escrevemos super(props)?
date: '2018-11-30'
spoiler: There’s a twist at the end.
---


Eu ouvi dizer que os [Hooks](https://reactjs.org/docs/hooks-intro.html) são a nova moda. Ironicamente, eu quero começar este blog listando fatos curiosos sobre os componentes de *classes*. Olha só para isso!

**Essas pegadinhas *não* são importantes para o uso produtivo do React. Contudo, você pode achá-los interessantes se quiser se aprofundar em saber como essas coisas funcionam.**

Eis a primeira.

---

Eu já escrevi `super(props)` mais vezes na minha vida do que eu gostaria de ter feito:

```jsx{3}
class Checkbox extends React.Component {
  constructor(props) {
    super(props);
    this.state = { isOn: true };
  }
  // ...
}
```

Claro, a [proposta de atributos de classe](https://github.com/tc39/proposal-class-fields) nos permite pular toda essa cerimônia.

```jsx
class Checkbox extends React.Component {
  state = { isOn: true };
  // ...
}
```

Uma sintaxe como essa foi [planejada](https://reactjs.org/blog/2015/01/27/react-v0.13.0-beta-1.html#es7-property-initializers) quando o React 0.13 passou a dar suporte a classes em 2015. Definir o `constructor` e invocar o `super(props)` desde sempre foi pensada como uma solução temporária até que os atributos das classes oferecessem uma alternativa mais ergonômica.

Mas vamos voltar para esse exemplo usando apenas as funcionalidades do ES2015:

```jsx{3}
class Checkbox extends React.Component {
  constructor(props) {
    super(props);
    this.state = { isOn: true };
  }
  // ...
}
```

**Por que nós invocamos o `super`? Nós podemos *não* invocá-lo? Se nós tivermos que invocá-lo, o que acontece se nós não passarmos as `props`? Existe mais algum argumento?** Vamos descobrir.

---

No JavaScript, o `super` refere-se ao construtor da classe pai. (No nosso exemplo, ele refere-se à implementação de `React.Component`.)

É importante lembrar que você não pode usar o `this` em um construtor *até* que você tenha chamado o construtor pai. O JavaScript não vai te deixar fazer isso:

```jsx
class Checkbox extends React.Component {
  constructor(props) {
    // 🔴 Ainda não podemos usar o `this`
    super(props);
    // ✅ Agora podemos
    this.state = { isOn: true };
  }
  // ...
}
```

Existe uma boa razão do porquê o JavaScript requer que o construtor pai seja executado antes que você mexa com o `this`. Considere essa hierarquia de classes:

```jsx
class Person {
  constructor(name) {
    this.name = name;
  }
}

class PolitePerson extends Person {
  constructor(name) {
    this.greetColleagues(); // 🔴 Isso não é permitido, leia abaixo para saber o porquê
    super(name);
  }
  greetColleagues() {
    alert('Good morning folks!');
  }
}
```

Suponha que usar o `this` antes de invocar o `super` *fosse* permitido. Um mês depois, nós poderíamos alterar o método `greetColleagues` para incluir o nome da pessoa na mensagem:

```jsx
  greetColleagues() {
    alert('Good morning folks!');
    alert('My name is ' + this.name + ', nice to meet you!');
  }
```

Mas nós esquecemos que `this.greetColleagues()` é invocado antes que a chamada do `super()` tivesse a chance de inicializar o `this.name`. Desse modo, `this.name` não está sequer definido ainda! Como você pode ver, um código como esse pode ser bem difícil de entender.

Para evitar tais armadilhas, **o JavaScript requer que, caso queira usar o `this` em um construtor, você *precisará* invocar o `super` primeiro.** Deixe que o construtor pai faça as coisas dele. E essa limitação também é aplicada em componentes do React definidas como classes:

```jsx
  constructor(props) {
    super(props);
    // ✅ Tudo bem usar o `this` agora
    this.state = { isOn: true };
  }
```

Isso nos deixa com outra pergunta: por que passar as `props`?

---

Você pode achar que passar as `props` como parâmetro para o `super` é necessário para que o construtor base de `React.Component` possa inicializar o `this.props`:

```jsx
// Dentro do React
class Component {
  constructor(props) {
    this.props = props;
    // ...
  }
}
```

E isso não está longe de ser verdade - de fato, isto [é o que ele faz](https://github.com/facebook/react/blob/1d25aa5787d4e19704c049c3cfa985d3b5190e0d/packages/react/src/ReactBaseClasses.js#L22).

Mas de alguma forma, mesmo se você invocar o `super()` sem o argumento `props`, você ainda será capaz de acessar o `this.props` no `render` e em outros métodos. (Se você não acredita em mim, tente você mesmo!)

Como *isso* funciona? Acontece que o **React também atribui as `props` na instância logo após chamar o *seu* construtor:**

```jsx
  // Dentro do React
  const instance = new YourComponent(props);
  instance.props = props;
```

Então mesmo que você esqueça de passar as `props` para o `super`, o React ainda vai realizar a configuração das mesmas logo em seguida. Existe um motivo para tal.

Quando o React passou a dar suporte para classes, ele não fez isso somente para as classes do ES6. O objetivo era dar suporte para o maior número de abstrações de classes que fosse possível. [Não estava claro](https://reactjs.org/blog/2015/01/27/react-v0.13.0-beta-1.html#other-languages) o quão bem-sucedidos seriam ClojureScript, CoffeeScript, ES6, Fable, Scala.js, TypeScript ou outras soluções para definir componentes. Então, o React intencionalmente não tinha uma posição clara se era necessário invocar o `super()` - ainda que isso fosse necessário em classes do ES6.

Então isso significa que você pode escrever somente `super()` ao invés de `super(props)`?

**Provavelmente não, porque isso ainda deixaria as coisas confusas.** De fato, o React em seguida iria inicializar o `this.props` *após* a execução do seu construtor. Porém o `this.props` ainda estaria indefinido *entre* a invocação do `super` e o término do seu construtor.

```jsx{14}
// Dentro do React
class Component {
  constructor(props) {
    this.props = props;
    // ...
  }
}

// Dentro do seu código
class Button extends React.Component {
  constructor(props) {
    super(); // 😬 Nós esquecemos de passar as props
    console.log(props);      // ✅ {}
    console.log(this.props); // 😬 undefined 
  }
  // ...
}
```

Isso pode ser ainda mais complicado de depurar se ocorrer em algum método que é invocado *de dentro* do construtor. **E é por isso que eu recomendo sempre usar o `super(props)`, mesmo que isso não seja estritamente necessário:**

```jsx
class Button extends React.Component {
  constructor(props) {
    super(props); // ✅ Nós passamos as props
    console.log(props);      // ✅ {}
    console.log(this.props); // ✅ {}
  }
  // ...
}
```

Isso garante que o `this.props` estará configurado antes do término da execução do construtor.

-----

Existe um último ponto sobre o qual os usuários mais antigos do React talvez estejam curiosos.

Você deve ter percebido que quando você usa a API de Context em classes (seja com a antiga API `contextTypes` ou com a moderna `contextType`, que foi adicionada no React 16.6), o `context` é passado como segundo argumento para o construtor.

Então por que nós não escrevemos `super(props, context)`? Nós poderíamos, mas o contexto é pouco usado, então essa armadilha não aparece com a mesma frequência.

**Com a proposta de atributos de classe, essa armadilha praticamente desaparece de qualquer modo.** Sem um construtor explícito, todos os argumentos são passados automaticamente. É isso que permite que uma expressão como `state = {}` inclua referências para `this.props` ou `this.context` se necessário.

Com os Hooks, nós sequer temos `super` ou `this`. Mas isso é conversa para outro dia.
