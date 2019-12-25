---
title: 'Preparando para uma Tech Talk, Parte 3: Conteúdo'
date: '2019-07-10'
spoiler: Transformando uma ideia em uma conversa.
---

Eu fiz [algumas](https://www.youtube.com/watch?v=xsSnOQynTHs) [tech](https://www.youtube.com/watch?v=nLF0n9SACd4) [talks](https://www.youtube.com/watch?v=dpw9EHDh2bM) que eu acho que foram bons.

Às vezes as pessoas me perguntam como eu me preparo para uma conversa. Para cada pessoa que discursa, a resposta é muito pessoal. Estou apenas compartilhando o que funciona para mim.

**Este é o terceiro post de uma série**, onde explico meu processo de preparação para uma palestra sobre tecnologia — desde a concepção da ideia até o dia real da apresentação:

* **[Preparando para uma Tech Talk, Parte 1: Motivação](/preparing-for-tech-talk-part-1-motivation/)**
* **[Preparando para uma Tech Talk, Parte 2: O quê, Por Que, e Como](/preparing-for-tech-talk-part-2-what-why-and-how/)**
* **Preparando para uma Tech Talk, Parte 3: Conteúdo  (*Esse post*)**
* Continua

<p />

---

**Nesta postagem, vou me concentrar no meu processo de criação dos slides e no conteúdo real da minha apresentação.**

--

Existem duas maneiras de construir algo.

Você pode criar **de cima para baixo**, onde começa com um esboço geral bruto e depois refina gradualmente cada parte individual. Ou você pode criar **de baixo para cima**, começando com um fragmento pequeno, mas polido, e depois crescendo tudo o que estiver ao seu redor. Isso pode lembrá-lo de como alguns formatos de imagem sempre são carregados de cima para baixo, enquanto outros começam embaçados no início, mas depois ficam mais nítidos à medida que mais dados são carregados.

Eu costumo **combinar essas abordagens** ao preparar as apresentações.

--

### Passe de cima para baixo: O Esboço

Depois que eu sei [sobre o que é a conversa](/preparing-for-tech-talk-part-2-what-why-and-how/), **Eu escrevo um esboço irregular. É uma lista com todos os pensamentos que eu quero incluir.** Não precisa ser polido ou claro para ninguém que não seja eu. Estou apenas jogando coisas na parede para ver o que gruda.

Um esboço geralmente começa com muitas lacunas e incógnitas:

```
- introdução
  - Oi, Eu sou Dan
  - Eu trabalho no React
- problemas
  - inferno de empacotamento
  - ???
- demonstração
  - ??? como evitar que as pessoas se estressem pensando que é uma mudança radical
  - state
  - effects
    - ??? que exemplo escolher
    - talvez esplicar dependências
  - custom Hooks <----- "aha" momento
- links
  - estresse, não há mudanças signifiactivas
- ???
  - algo filosófico e tranquilizador
```

Muitos pensamentos iniciais no esboço podem não fazer o corte final. De fato, escrever um esboço é uma ótima maneira de separar as idéias que contribuem para o ["o quê" e o "porquê"](/preparing-for-tech-talk-part-2-what-why-and-how/) da palestra do "filler" que deve ser removido.

O esboço é um rascunho vivo. Pode ser vago no começo. Eu ajusto continuamente o esboço enquanto trabalho na talk. Eventualmente, pode acabar parecendo mais com isso:

```
- introdução
  - oi, Eu sou Dan
  - Eu trabalho no React
- problemas
  - inferno de empacotamento
  - componentes grandes
  - consertar um piora o outro
  - devemos desistir
    - lol mixins?
- crossroads
  - talvez não possamos consertar isso
  - mas e se pudermos?
  - nós temos uma proposta
    - sem mudanças que vão quebrar
- demo
  - state Hook
  - mais de um state Hook
    - mencionar regras
  - effect Hook
  - effect cleanup
  - custom Hooks <----- "aha" momento
- recaptular
  - sem mudanças que vão quebrar
  - você pode tentar agora
  - link para à rfc
- outro
  - faça isso pessoal
  - hook : componente :: electron : atom
  - logo + "hooks estiveram aqui o tempo todo"
```

But sometimes pieces don’t fall into place until after all the slides are done.Às vezes, porém, as peças não se encaixam até que todos os slides estejam prontos.

**O esboço me ajuda a manter a estrutura digerível.** Para a estrutura da minha talk, eu sigo frequentemente o [“Hero’s Journey”](http://www.tlu.ee/~rajaleid/montaazh/Hero%27s%20Journey%20Arch.pdf) padrão que você encontrará na cultura popular em todos os lugares, por exemplo nos livros de Harry Potter. Você começa com algum conflito ("Sirius está indo atrás de você", "Comensais da Morte estão derrubando a Taça de Quadribol", "Snape faz um juramento obscuro", etc). Depois, há algumas configurações (compre alguns livros, aprenda alguns feitiços). Eventualmente, há um pico de energia em que vencemos o vilão. Então Dumbledore diz algo meta e paradoxal, e todos voltamos para casa.

Meu modelo mental para palestras se parece com:

1. Estabeleça algum conflito ou problema para atrair o espectador.
2. Conduza-os pelo principal momento "aha". (O "o que" da minha palestra.)
3. Recapitule como o que fizemos resolve o problema proposto.
4. Termine com algo que agrada as emoções (o "porquê" da minha palestra).
    - Esta parte cai especialmente bem se houver alguma camada ou simetria inesperada que só fica clara no final. Se eu ficar [arrepiado](https://en.wikipedia.org/wiki/Frisson), é bom.
    
Obviamente, uma estrutura como essa é apenas uma forma — e uma forma exagerada. Por isso, é sua responsabilidade preenchê-lo com material envolvente e adicionar seu próprio toque. Se o conteúdo da conversa em si não for atraente, agrupá-lo em um clichê não ajudará.

**O esboço também me ajuda a encontrar inconsistências.** Por exemplo, talvez uma idéia no meio precise de algum outro conceito que só apresento mais tarde. Então eu preciso de reordená-los. O esboço fornece uma visão panorâmica de todos os pensamentos que eu queria mencionar e ajuda a garantir que o fluxo entre eles seja apertado e faça sentido.

### Passe de baixo para cima: A Seção de Alta Energia

Escrever o esboço é um processo de cima para baixo. Mas também começo a trabalhar de baixo para cima em algo concreto, como os slides ou uma demonstração em paralelo.

**Em particular, tento construir uma prova de conceito da parte de "alta energia" da minha palestra o mais rápido possível.** Por exemplo, pode ser um momento em que uma ideia crucial seja explicada ou demonstrada. Como explico isso? O que exatamente vou dizer ou fazer, e será suficiente? Preciso de slides? Demonstrações? Ambos? Preciso usar imagens? Animações? Qual é a sequência exata de minhas palavras e ações? Eu gostaria de assistir a essa palestra apenas por esta explicação?

Essa parte é a mais difícil para mim, porque geralmente acabo fazendo muitas versões que jogo fora. Requer um estado de espírito especial quando consigo me concentrar profundamente, me permitir experimentar coisas tolas e depois me sentir livre para destruir tudo.

Passo muito tempo escolhendo cabeçalhos, descobrindo o seqüenciamento de uma demonstração ao vivo, aprimorando as animações e procurando memes. **A maior parte deste trabalho é descartável** (por exemplo, eu geralmente acabo excluindo todos os memes), mas esse estágio realmente define a conversa para mim. Meu objetivo é encontrar a rota mais próxima de *não saber* a *conhecer* uma idéia - para que eu possa compartilhar essa jornada mais tarde com o público.

Depois de me sentir bem com a parte de alta energia da minha palestra, verifico se o esboço que escrevi antes ainda faz sentido. Nesse ponto, muitas vezes percebo que devo jogar fora os 60% do meu esboço anterior e reescrevê-lo para focar em uma idéia menor.

### Faça Muitas Corridas a Seco

Continuo o trabalho de cima para baixo (estrutura de tópicos) e o de baixo para cima (construindo seções concretas) até que não haja mais espaços em branco. Quando eu tenho a primeira versão preliminar de toda a palestra, me tranco em uma sala e finjo realmente *dar* a palestra pela primeira vez. É uma bagunça, eu tropeço muito, paro frases no meio do caminho e tento diferentes, e assim por diante — mas eu passo por tudo isso.

Isso me ajuda a medir o quanto vou precisar cortar. A primeira tentativa geralmente acaba muito maior que o intervalo de tempo, mas também noto que algumas seções foram confusas. Então, eu as corto, ajusto os slides para combinar melhor com o que quero dizer e tento dar a palestra toda novamente.

Repito esse processo por vários dias, enquanto continuo polindo os slides e o fluxo. Este é um bom momento para começar a praticar com outras pessoas. Normalmente começo com um único amigo e depois faço algumas tentativas com um público pequeno (no máximo 15 pessoas). Essa é uma boa maneira de obter feedback antecipado, mas o mais importante é como me acostumo a essa palestra e aprendo a me sentir à vontade para transmiti-la.

Prefiro não escrever frases completas ou anotações reais de um orador. Isso me estressa, porque sinto a pressão para realmente segui-los e surtar se perder alguma coisa. Em vez disso, prefiro ensaiar a palestra várias vezes (de 3 a 20) para que as frases que quero dizer para qualquer slide "cheguem até mim" sem pensar muito. É mais fácil contar uma história que você já contou muitas vezes antes.

---

Neste post, descrevi como preparo o conteúdo para minhas palestras. No próximo post, compartilharei algumas dicas sobre o que faço no dia da palestra em si.

**Anterior nesta série:[Preparando-se para uma conversa técnica, parte 2: O que, por que e como](/preparing-for-tech-talk-part-2-what-why-and-how/)**.
