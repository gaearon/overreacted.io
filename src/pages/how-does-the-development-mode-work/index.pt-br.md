---
title: Como Funciona o Modo de Desenvolvimento?
date: '2019-08-04'
spoiler: Eliminação de código morto por convenção.
---

Se sua base de código JavaScript for moderadamente complexa, **você provavelmente tem uma maneira de criar o bundle e executar código diferente em desenvolvimento e produção**.

Agrupar e executar código diferente no desenvolvimento e produção é poderoso. No modo de desenvolvimento, o React inclui muitos avisos que ajudam a encontrar problemas antes que eles levem a erros. No entanto, o código necessário para detectar esses erros geralmente aumentam o tamanho do pacote e torna o aplicativo mais lento.

A desaceleração é aceitável no desenvolvimento. De fato, executar o código mais lentamente em desenvolvimento *pode até ser benéfico*, pois compensa parcialmente a discrepância entre máquinas de desenvolvimento rápido e um dispositivo de consumo médio.

Na produção, não queremos pagar nenhum custo. Portanto, omitimos essas verificações em produção. Como isso funciona? Vamos dar uma olhada.

---


A maneira exata de executar código diferente no desenvolvimento depende do pipeline de build do JavaScript (e se você possui um). No Facebbok, fica assim:

```js
if (__DEV__) {
  doSomethingDev();
} else {
  doSomethingProd();
}
```

Aqui, `__DEV__` não é uma variável real. É uma constante que é substituída quando os módulos são unidos pelo navegador. O resultado fica assim:

```js
// Em desenvolvimento:
if (true) {
  doSomethingDev(); // 👈
} else {
  doSomethingProd();
}

// Em produção:
if (false) {
  doSomethingDev();
} else {
  doSomethingProd(); // 👈
}
```


Em produção, você também executaria um minifier (por exemplo [terser](https://github.com/terser-js/terser)) no código. A maioria dos minificadores do JavaScript fazem uma forma limitada de [eliminação de código morto](https://en.wikipedia.org/wiki/Dead_code_elimination), como remover ramos `if (false)`. Então, em produção, você só vê:

```js
// Em produção (depois de minificado):
doSomethingProd();
```

*(Observe que existem limites significativos sobre a eficácia da eliminação do código morto com as principais ferramentas JavaScript, mas esse é um tópico separado.)*

Embora você possa não estar usando uma constante mágica `__DEV__`, se você usar um empacotador JavaScript popular como o webpack, provavelmente há outras convenções que você pode seguir. Por exemplo, é comum expressar o mesmo padrão assim:

```js
if (process.env.NODE_ENV !== 'production') {
  doSomethingDev();
} else {
  doSomethingProd();
}
```

**Esse é exatamente o padrão usado por bibliotecas como [React](https://reactjs.org/docs/optimizing-performance.html#use-the-production-build) e [Vue](https://vuejs.org/v2/guide/deployment.html#Turn-on-Production-Mode) quando você os importa do npm usando um empacotador.** (A criação de tags `<script>` de arquivo único oferece versões de desenvolvimento e produção como arquivos `.js` e `.min.js` separados.)

Essa convenção em particular é originária do Node.js. No Node.js, existe uma variável global `process` que expõe as variáveis de ambiente do seu sistema como propriedades no objeto [`process.env`](https://nodejs.org/dist/latest-v8.x/docs/api/process.html#process_process_env). No entanto, quando você vê esse padrão em uma base de código front-end, geralmente não há nenhuma variável real `process` envolvida. 🤯

Em vez disso, toda a expressão `process.env.NODE_ENV` é substituída por uma string literal no momento do build, assim como nossa variável mágica `__DEV__`:

```js
// Em desenvolvimento:
if ('development' !== 'production') { // true
  doSomethingDev(); // 👈
} else {
  doSomethingProd();
}

// Em produção:
if ('production' !== 'production') { // false
  doSomethingDev();
} else {
  doSomethingProd(); // 👈
}
```

Como toda a expressão é constante (`'production' !== 'production'` é garantida como `false`), um minificador também pode remover o outro ramo.

```js
// Em produção (depois de minificado):
doSomethingProd();
```

Malícia controlada.

---

Observe que isso **não funcionaria** com expressões mais complexas:

```js
let mode = 'production';
if (mode !== 'production') {
  // 🔴 não é garantido que seja eliminado
}
```

As ferramentas de análise estática do JavaScript não são muito inteligentes devido à natureza dinâmica da linguagem. Quando elas veem variáveis como `mode` em vez de expressões estáticas como `false` ou `'production' !== 'production'`, elas geralmente desistem.

Da mesma forma, a eliminação de código morto no JavaScript geralmente não funciona bem nos limites do módulo quando você usa as instruções `import` de nível superior:

```js
// 🔴 não é garantido que seja eliminado
import {someFunc} from 'some-module';

if (false) {
  someFunc();
}
```

Portanto, você precisa escrever o código de uma maneira muito mecânica que torne a condição *definitivamente estática* e garantir que *todo o código* que você deseja eliminar esteja dentro dele.

---

Para que tudo isso funcione, seu empacotador precisa fazer a substituição do `process.env.NODE_ENV` e precisa saber em qual modo você *deseja* construir o projeto.

Alguns anos atrás, constumava-se esquecer de configurar o ambiente. Você costuma ver um projeto no modo de desenvolvimento implantado na produção.

Isso é ruim porque faz o site carregar e rodar mais lento.

Nos últimos dois anos, a situação melhorou significativamente. Por exemplo, o webpack adicionou uma simples opção `mode` que em vez de configurar manualmente a substituição do `process.env.NODE_ENV`. O React DevTools agora também exibe um ícone vermelho em sites com modo de desenvolvimento, facilitando a localização e até a geração de [relatórios](https://mobile.twitter.com/BestBuySupport/status/1027195363713736704).

![Aviso do modo de desenvolvimento no React DevTools](devmode.png)

Configurações opinativas como Create React App, Next/Nuxt, Vue CLI, Gatsby e evitam ainda mais a confusão, separado as construções de desenvolvimento e as de produção em dois comandos. (Por exemplo, `npm start` e `npm run build`.) Normalmente, apenas uma compilação de produção pode ser implantada, para que o desenvolvedor não cometa mais esse erro.

Sempre há um argumento de que talvez o modo *produção* precise ser o padrão, e o modo de desenvolvimento precise ser optativo. Pessoalmente, não acho esse argumento convincente. As pessoas que mais se beneficiam dos avisos do modo de desenvolvimento geralmente são novas na biblioteca. *Eles não saberiam ativá-lo* e perderiam muitos bugs que os avisos teriam detectado antes.

Sim, problemas de desempenho são ruins. Mas o mesmo acontece com o envio de experiências de buggy quebradas para os usuários finais. Por exemplo, o [aviso React key](https://reactjs.org/docs/lists-and-keys.html#keys) ajuda a evitar bugs, como enviar uma mensagem para uma pessoa errada ou comprar um produto errado. Desenvolver com esse aviso desabilitado é um risco significativo para você *e* seus usuários. Se estiver desativado por padrão, quando você encontrar o botão de alternância e habilita-lo, você terá muitos avisos para limpar. Para que a maioria das pessoas o alternasse. É por isso que ele precisa estar ativado desde o início, e não ativados mais tarde.

Finalmente, sempre que os avisos de desenvolvimento tenham sido aceitos, e os desenvolvedores *sabiam* ativá-los no início do desenvolvimento, voltamos ao problema original. Alguém os deixaria acidentalmente ao implantar em produção!

E voltamos à estaca zero.

Pessoalmente, acredito em **ferramentas que exibem e usam o modo correto, independente de você estar depurando ou implantando**. Quase todos os outros ambientes (móveis, desktops ou servidores), exceto o navegador, têm uma maneira de carregar e diferenciar o desenvolvimento e a produção durante décadas.

Em vez de as bibliotecas criarem e confiarem em convenções ad-hoc, talvez seja a hora dos ambientes JavaScript verem essa distinção como uma necessidade de primeira classe.

---

Chega de filosofia!

Vamos dar outra olhada neste código:

```js
if (process.env.NODE_ENV !== 'production') {
  doSomethingDev();
} else {
  doSomethingProd();
}
```

Você pode estar se perguntando: se não há um objeto `process` real no código front-end, por que bibliotecas como React e Vue dependem dele nas compilações npm?

*(Para esclarecer isso novamente: as tags `<script>` que você pode carregar no navegador, oferecidas pelo React e pelo Vue, não dependem disso. Em vez disso, você deve escolher manualmente entre os arquivos de desenvolvimento `.js` e os arquivos de produção `.min.js`. A seção abaixo é apenas sobre o uso do React ou do Vue com um empacotador, `import`ando-os do npm.)*

Como muitas coisas na programação, esta convenção em particular tem principalmente razões históricas. Ainda o usamos, porque agora ele é amplamente adotado por diferentes ferramentas. Mudar para outro coisa é dispendioso e não custa muito.

Então, qual é a história por trás disso?

Many years before the `import` and `export` syntax was standardized, there were several competing ways to express relationships between modules. Node.js popularized `require()` and `module.exports`, known as [CommonJS](https://en.wikipedia.org/wiki/CommonJS).

Code published on the npm registry early on was written for Node.js. [Express](https://expressjs.com) was (and probably still is?) the most popular server-side framework for Node.js, and it [used the `NODE_ENV` environment variable](https://expressjs.com/en/advanced/best-practice-performance.html#set-node_env-to-production) to enable production mode. Some other npm packages adopted the same convention.

Early JavaScript bundlers like browserify wanted to make it possible to use code from npm in front-end projects. (Yes, [back then](https://blog.npmjs.org/post/101775448305/npm-and-front-end-packaging) almost nobody used npm for front-end! Can you imagine?) So they extended the same convention already present in the Node.js ecosystem to the front-end code.

The original “envify” transform was [released in 2013](https://github.com/hughsk/envify/commit/ae8aa26b759cd2115eccbed96f70e7bbdceded97). React was open sourced around that time, and npm with browserify seemed like the best solution for bundling front-end CommonJS code during that era.

React started providing npm builds (in addition to `<script>` tag builds) from the very beginning. As React got popular, so did the practice of writing modular JavaScript with CommonJS modules and shipping front-end code via npm.

React needed to remove development-only code in the production mode. Browserify already offered a solution to this problem, so React also adopted the convention of using `process.env.NODE_ENV` for its npm builds. With time, many other tools and libraries, including webpack and Vue, did the same.

By 2019, browserify has lost quite a bit of mindshare. However, replacing `process.env.NODE_ENV` with `'development'` or `'production'` during a build step is a convention that is as popular as ever.

*(It would be interesting to see how adoption of ES Modules as a distribution format, rather than just the authoring format, changes the equation. Tell me on Twitter?)*

---

One thing that might still confuse you is that in React *source code* on GitHub, you’ll see `__DEV__` being used as a magic variable. But in the React code on npm, it uses `process.env.NODE_ENV`. How does that work?

Historically, we’ve used `__DEV__` in the source code to match the Facebook source code. For a long time, React was directly copied into the Facebook codebase, so it needed to follow the same rules. For npm, we had a build step that literally replaced the `__DEV__` checks with `process.env.NODE_ENV !== 'production'` right before publishing.

This was sometimes a problem. Sometimes, a code pattern relying on some Node.js convention worked well on npm, but broke Facebook, or vice versa.

Since React 16, we’ve changed the approach. Instead, we now [compile a bundle](https://reactjs.org/blog/2017/12/15/improving-the-repository-infrastructure.html#compiling-flat-bundles) for each environment (including `<script>` tags, npm, and the Facebook internal codebase).  So even CommonJS code for npm is compiled to separate development and production bundles ahead of time.

This means that while the React source code says `if (__DEV__)`, we actually produce *two* bundles for every package. One is already precompiled with `__DEV__ = true` and another is precompiled with `__DEV__ = false`. The entry point for each package on npm “decides” which one to export.

[For example:](https://unpkg.com/browse/react@16.8.6/index.js)

```js
if (process.env.NODE_ENV === 'production') {
  module.exports = require('./cjs/react.production.min.js');
} else {
  module.exports = require('./cjs/react.development.js');
}
```

And that’s the only place where your bundler will interpolate either `'development'` or `'production'` as a string, and where your minifier will get rid of the development-only `require`.

Both `react.production.min.js` and `react.development.js` don’t have any `process.env.NODE_ENV` checks anymore. This is great because *when actually running on Node.js*, accessing `process.env` is [somewhat slow](https://reactjs.org/blog/2017/09/26/react-v16.0.html#better-server-side-rendering). Compiling bundles in both modes ahead of time also lets us optimize the file size [much more consistently](https://reactjs.org/blog/2017/09/26/react-v16.0.html#reduced-file-size), regardless of which bundler or minifier you are using.

And that’s how it really works!

---

I wish there was a more first-class way to do it without relying on conventions, but here we are. It would be great if modes were a first-class concept in all JavaScript environments, and if there was some way for a browser to surface that some code is running in a development mode when it’s not supposed to.

On the other hand, it is fascinating how a convention in a single project can propagate through the ecosystem. `EXPRESS_ENV` [became `NODE_ENV`](https://github.com/expressjs/express/commit/03b56d8140dc5c2b574d410bfeb63517a0430451) in 2010 and [spread to front-end](https://github.com/hughsk/envify/commit/ae8aa26b759cd2115eccbed96f70e7bbdceded97) in 2013. Maybe the solution isn’t perfect, but for each project the cost of adopting it was lower than the cost of convincing everyone else to do something different. This teaches a valuable lesson about the top-down versus bottom-up adoption. Understanding how this dynamic plays out distinguishes successful standardization attempts from failures.

Separating development and production modes is a very useful technique. I recommend using it in your libraries and the application code for the kinds of checks that are too expensive to do in production, but are valuable (and often critical!) to do in development.

As with any powerful feature, there are some ways you can misuse it. This will be the topic of my next post!
