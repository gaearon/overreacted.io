---
title: 'Adeus, Código Limpo'
date: '2020-01-11'
spoiler: Deixe o código limpo guiar você. Depois, deixe-o ir.
---

Era tarde da noite.

Meu colega havia acabado de atualizar o código que nós escrevemos durante a semana inteira. Estávamos trabalhando em um editor gráfico em _canvas_, e eles implementaram a habilidade de redimensionar formas geométricas como retângulos e ovais arrastando pequenas alças nos seus vértices ou extremidades.

O código funcionava.

Mas era repetitivo. Cada forma (como um retângulo ou uma oval) tinha um conjunto diferente de alças, e arrastar cada alça em direções diferentes afetava a posição e o tamanho da forma de maneiras diversas. Se o usuário segurasse _Shift_, nós também precisaríamos preservar as proporções enquanto redimensionávamos. Havia um bocado de matemática.

O código parecia um pouco com isso:

```jsx
let Rectangle = {
  resizeTopLeft(position, size, preserveAspect, dx, dy) {
    // 10 linhas repetidas de matemática
  },
  resizeTopRight(position, size, preserveAspect, dx, dy) {
    // 10 linhas repetidas de matemática
  },
  resizeBottomLeft(position, size, preserveAspect, dx, dy) {
    // 10 linhas repetidas de matemática
  },
  resizeBottomRight(position, size, preserveAspect, dx, dy) {
    // 10 linhas repetidas de matemática
  },
};

let Oval = {
  resizeLeft(position, size, preserveAspect, dx, dy) {
    // 10 linhas repetidas de matemática
  },
  resizeRight(position, size, preserveAspect, dx, dy) {
    // 10 linhas repetidas de matemática
  },
  resizeTop(position, size, preserveAspect, dx, dy) {
    // 10 linhas repetidas de matemática
  },
  resizeBottom(position, size, preserveAspect, dx, dy) {
    // 10 linhas repetidas de matemática
  },
};

let Header = {
  resizeLeft(position, size, preserveAspect, dx, dy) {
    // 10 linhas repetidas de matemática
  },
  resizeRight(position, size, preserveAspect, dx, dy) {
    // 10 linhas repetidas de matemática
  },
}

let TextBlock = {
  resizeTopLeft(position, size, preserveAspect, dx, dy) {
    // 10 linhas repetidas de matemática
  },
  resizeTopRight(position, size, preserveAspect, dx, dy) {
    // 10 linhas repetidas de matemática
  },
  resizeBottomLeft(position, size, preserveAspect, dx, dy) {
    // 10 linhas repetidas de matemática
  },
  resizeBottomRight(position, size, preserveAspect, dx, dy) {
    // 10 linhas repetidas de matemática
  },
};
```

Aquela matemática repetitiva realmente me incomodava.

Não era _limpo_.

A maior parte da repetição era entre as direções semelhantes. Por exemplo, `Oval.resizeLeft()` tinha semelhanças com `Header.resizeLeft()`. Isso era porque ambas lidavam com arrastar a alça no lado esquerdo.

A outra semelhança era entre os métodos para a mesma forma. Por exemplo, `Oval.resizeLeft()` tinha semelhanças com os outros métodos de `Oval`. Isso acontecia porque todos lidavam com formas ovais. Também havia duplicação entre `Retangle`, `Header` e `TextBlock` porque todos *eram* retângulos.

Eu tive uma ideia.

Poderíamos *remover todas as duplicações* agrupando o código dessa maneira:

```jsx
let Directions = {
  top(...) {
    // 5 linhas únicas de matemática
  },
  left(...) {
    // 5 linhas únicas de matemática
  },
  bottom(...) {
    // 5 linhas únicas de matemática
  },
  right(...) {
    // 5 linhas únicas de matemática
  },
};

let Shapes = {
  Oval(...) {
    // 5 linhas únicas de matemática
  },
  Rectangle(...) {
    // 5 linhas únicas de matemática
  },
}
```

e, então, compor seus comportamentos:

```jsx
let {top, bottom, left, right} = Directions;

function createHandle(directions) {
  // 20 linhas de código
}

let fourCorners = [
  createHandle([top, left]),
  createHandle([top, right]),
  createHandle([bottom, left]),
  createHandle([bottom, right]),
];
let fourSides = [
  createHandle([top]),
  createHandle([left]),
  createHandle([right]),
  createHandle([bottom]),
];
let twoSides = [
  createHandle([left]),
  createHandle([right]),
];

function createBox(shape, handles) {
  // 20 linhas de código
}

let Rectangle = createBox(Shapes.Rectangle, fourCorners);
let Oval = createBox(Shapes.Oval, fourSides);
let Header = createBox(Shapes.Rectangle, twoSides);
let TextBox = createBox(Shapes.Rectangle, fourCorners);
```

O código é a metade do tamanho inicial, e a duplicação se foi! Tão *limpo*. Se queremos mudar o comportamento para uma direção em particular ou uma forma, podemos fazer isso em um único lugar em vez de atualizar todos os métodos pelo código.

Já era tarde da noite (me deixei levar). Enviei minha refatoração para o master e fui para a cama, orgulhoso de como eu desembaracei o código bagunçado do meu colega.

## A Manhã Seguinte

... não foi como esperada.


Meu chefe me convidou para uma conversa um-a-um onde eles, educadamente, me pediram para reverter minhas mudanças. Eu fiquei horrorizado. O código antigo era uma bagunça, e o meu era *limpo*!

Eu, relutantemente, concordei, mas foram anos para perceber que eles estavam certos.

## É Uma Fase

Obsessão com _"clean code"_ (código limpo) e remover duplicações é uma fase pela qual muitos de nós passamos. Quando nós não nos sentimos confiantes com o nosso código, é tentador atrelar nosso senso de autovalorização e orgulho profissional a algo que pode ser mensurado. Um conjunto rigoroso de regras de formatação, uma nomenclatura, uma estrutura de arquivos, a falta de duplicação.

Você não pode automatizar a remoção de duplicação, mas ela *fica* mais fácil com a prática. Você normalmente pode dizer se existe mais ou menos dela depois de cada mudança. Como resultado disso, remover duplicação parece que é melhorar uma métrica objetiva sobre o código. Pior ainda, ela mexe com o senso de identidade da pessoa: *Eu sou o tipo de pessoa que escreve código limpo*. É tão poderoso quanto algum tipo de auto-desprezo.

Uma vez que aprendemos a como criar [abstrações](https://www.sandimetz.com/blog/2016/1/20/the-wrong-abstraction), é tentador se ligar nessa habilidade e criar abstrações do vento sempre que vemos código repetitivo. Depois de alguns anos programando, vemos repetições *em todo lugar* — e abstrações são o nosso super poder. Se alguém nos diz que abstração é uma *virtude*, nós comemos isso. E começamos a julgar outras pessoas por não adorar a "limpeza".

Eu vejo, agora, que a minha refatoração foi um desastre de duas maneiras:

* Primeiro, eu não conversei com a pessoa que escreveu o código anterior. Eu reescrevi o código e enviei sem saber o que ela pensava. Mesmo que *fosse* uma melhoria (que eu não acredito mais nisso), essa é uma péssima maneira de fazer as coisas. Um time de engenharia está *construindo confiança* constantemente. Reescrever o código do seu colega sem uma discussão é uma grande pancada na sua habilidade de colaborar juntos efetivamente numa base de código.

* Segundo, nada é de graça. Meu código trocou a habilidade de mudar requisitos por reduzir duplicação, e essa não foi uma boa troca. Por exemplo, depois nós precisávamos de muitos casos especiais e comportamentos para alças diferentes em formas diferentes. Minha abstração teria sido muitas vezes mais complicada de conseguir isso, enquanto que na versão original e "bagunçada" isso era super fácil.

Estou dizendo que você deve escrever código "sujo"? Não. Eu sugiro que você pense bem sobre o que você quer dizer sobre "limpo" ou "sujo". Você tem um sentimento de revolta? De direito? Beleza? Elegância? Quão seguro você está que pode dizer quais os resultados concretos de engenharia que essas qualidades trazem? Como exatamente elas afetam a maneira que o código é escrito e [modificado](/optimized-for-change/)?

Com certeza eu não olhei profundamente para nenhuma dessas coisas. Eu pensei muito sobre como o código *parecia* -- mas não como ele *evoluiu* em um time de simples humanos.

Programar é uma jornada. Pense no quão longe você chegou desde a sua primeira linha de código até onde você está hoje. Lembro que era uma alegria ver pela primeira vez como extrair uma função ou refatorar uma classe poderia simplificar um código complicado. Se você tem orgulho do seu ofício, é tentador perseguir limpeza no código. Faça isso por um tempo.

Mas não pare aí. Não seja um fanático do código limpo. Código limpo não é uma meta. É uma tentativa de dar algum sentido para uma complexidade imensa que são os sistemas que nós lidamos. É um mecanismo de defesa para quando você não sabe muito bem como uma mudança afetaria seu código, mas você precisa de uma ajuda no mar de incertezas.

Deixe o código limpo guiar você. **Depois, deixe-o ir.**
