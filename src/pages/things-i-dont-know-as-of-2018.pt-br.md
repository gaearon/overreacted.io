---
title: Coisas que eu não sei em pleno 2018
date: '2018-12-28'
langs: ['en', 'zh-hant', 'ko', 'sv', 'es', 'pt-br', 'ja']
spoiler: Podemos admitir nossas lacunas de conhecimento sem desvalorizar nossa experiência.
---

As pessoas frequentemente assumem que eu sei mais do que eu realmente sei. Isso não é um problema e eu não estou reclamando. (Companheiros de grupos minoritários frequentemente sofrem o viés contrário, apesar de suas credenciais duramente adquiridas, e isso *é um saco*).

**Neste post irei oferecer uma lista incompleta de tópicos de programação que as pessoas frequentemente assumem de forma errada que eu sei.** Eu não estou dizendo que *você* não precisa aprendê-las — ou que eu não sei *outras* coisas úteis. Mas, como eu não estou em uma posição vulnerável agora, posso ser honesto sobre isso.

Deixo aqui o porquê de eu achar isso importante.

---

Primeiro, geralmente existe uma expectativa irreal de que um engenheiro experiente conhece todas as tecnologias em seu campo de atuação. Você já viu um “roteiro de aprendizagem” que consistia em centenas de bibliotecas e ferramentas? Isso é útil - mas intimidador.

Além do mais, não importa o quão experiente você fique, você ainda vai se encontrar se sentindo entre capaz, inadequado (“Síndrome do impostor”), e com excesso de confiança (“Dunning - Kruger effect”). Isso depende do seu ambiente, emprego, personalidade, companheiros de trabalho, estado mental, hora do dia, e por aí vai.

Às vezes, desenvolvedores experientes se abrem sobre suas inseguranças para encorajar os iniciantes. Mas, existe um mundo de diferença entre um cirurgião experiente que ainda fica nervoso e um estudante segurando seu primeiro bisturi!

Ouvir como “somos todos desenvolvedores juniores” pode ser desanimador e soar como conversa fiada para os alunos que enfrentam uma lacuna real no conhecimento. Boas confissões de praticantes bem intencionados como eu não podem fechar esta lacuna.

Ainda assim, até os engenheiros experientes possuem muitas lacunas de conhecimento. Este post é sobre mim, e eu incentivo aqueles que tenham vulnerabilidade similar a compartilhar suas próprias. Mas não vamos desvalorizar nossa experiência enquanto fazemos isso.

**Nós podemos admitir nossas lacunas de conhecimento, podemos ou não nos sentirmos impostores, e ainda assim possuímos uma expertise profundamente valiosa que leva anos de trabalho duro para desenvolver.**

---

Com este aviso prévio, aqui vão algumas coisas que eu não sei:

* **Comandos Unix e Bash.**  Eu posso rodar `ls` e `cd` mas eu pesquiso o restante. Eu sei o conceito de piping mas eu apenas o uso em casos simples. Eu não sei como usar `xargs` para criar pipes complexos, ou como compor e redirecionar diferentes streams de saída. Eu também nunca aprendi Bash de forma adequada então eu só consigo escrever shell scripts muito simples (e frequentemente bugados).

* **Linguagens de baixo nível.** Eu entendo que Assembly te permite armazenar coisas na memória e saltar ao redor do código mas isso é tudo. Eu escrevi algumas linhas de C e entendo o que é um ponteiro, mas eu não sei como usar `malloc` ou outras técnicas manuais de manipulação  de memória. Nunca brinquei com Rust.

* **Pilhas de rede.** Eu sei que computadores possuem um endereço IP, e que DNS é como resolvemos hostnames. Eu sei que existem protocolos de baixo nível como TCP/IP para a troca de pacotes que (talvez?) garanta integridade. É isso — Eu sou confuso nos detalhes.

* **Containers.** Eu não tenho ideia de como usar Docker ou Kubernetes. (Eles estão relacionados?) Eu tenho uma ideia vaga de que eles me deixam rodar uma VM separada de uma forma previsível. Parece legal mas eu não testei.

* **Serverless.** Também parece legal. Nunca tentei. Eu não tenho uma ideia clara de como este modelo muda a programação em backend (e se de fato muda).

* **Microservices.** Se eu entendi corretamente, isso apenas significa “vários endpoints de APIs conversando entre si”. Eu não sei quais são as vantagens ou desvantagens práticas desta abordagem porque eu não trabalhei com ela.

* **Python.** u me sinto mal com isso — Eu *trabalhei* com Python por vários anos em algum momento e nunca me preocupei em aprender. Existem várias coisas como o comportamento de importações que são totalmente obscuras pra mim.

* **Node backends.** Eu sei como rodar o Node, usei algumas APIs como `fs` para ferramentas de construção, e consigo configurar o Express. Mas eu nunca comuniquei o Node com banco de dados e realmente não sei como escrever backend nele. Eu também não sou familiarizado com frameworks React como Next, além de um “hello world”.

* **Plataformas nativas.** Eu tentei aprender Objective C em algum momento mas não funcionou. Eu também não aprendi Swift. O mesmo para Java. (Eu provavelmente poderia ter pego o Java já que trabalhei com C#)

* **Algoritmos.** O máximo que você vai conseguir de mim é um bubble sort e talvez um quicksort em um dia bom. Provavelmente posso fazer tarefas simples de travessia de grafos se eles estiverem ligados a um problema prático específico. Eu entendo a notação O(n) mas meu entendimento não é muito mais profundo do que “não coloque loops dentro de loops”.

* **Linguagens funcionais.** A não ser que você considere JavaScript, Eu não sou fluente em nenhuma linguagem funcional tradicional. (Eu apenas sou fluente em C# e JavaScript — e eu já esqueci a maior parte do C#.) Eu me esforço para ler códigos de linguagens inspiradas no LISP (como Clojure), inspiradas no Haskell (como Elm), ou inspiradas no ML (como OCaml).

* **Terminologia funcional.** Map e reduce é o mais longe que eu vou. Eu não conheço monoids, functors, etc. Eu sei o que é um monad mas talvez seja uma ilusão.

* **Modern CSS.** Eu não conheço Flexbox ou Grid. Floats é minha geléia.

* **Metodologias CSS.** Eu usei BEM (a parte do CSS part, não o BEM original) mas isso é tudo que eu sei. Eu não testei o OOCSS ou outras metodologias.

* **SCSS / Sass.** Nunca aprendi.

* **CORS.** Eu tenho medo desses erros! Eu sei que preciso configurar alguns headers para consertá-los mas eu gastei horas com isso no passado.

* **HTTPS / SSL.** NNunca configurei. Não sei como funciona além da ideia de chaves privadas e públicas.

* **GraphQL.**u posso ler uma query mas eu realmente não sei como expressar algo com nodes e edges, quando usar fragmentos e como a paginação funciona nele.

* **Sockets.** Meu modelo mental é que eles permitem computadores conversarem entre si fora do modelo requisição/resposta mas é tudo que sei.

* **Streams.** Além dos Rx Observables, eu não trabalhei com Streams de forma mais próxima. Eu usei os antigos streams de Node uma ou duas vezes mas sempre bagunçou o tratamento de erros.

* **Electron.** Nunca tentei.

* **TypeScript.** Eu entendo o conceito de tipos e posso ler anotações mas eu nunca escrevi. As poucas vezes que eu tentei encontrei dificuldades.

* **Deployment e devops.** Eu consigo administrar o envio de alguns arquivo através do FTP ou matar algum processo mas este é o limite das minhas habilidades de devops.

* **Graphics.** Seja canvas, SVG, WebGL ou gráficos de baixo nível, eu não sou produtivo nisso. Eu conheço a idéia geral mas eu preciso aprender a raiz.

Com certeza esta lista não é exaustiva. Existem muitas coisas que eu não sei.

---

Talvez isso pareça uma coisa estranha de se discutir. Pode até parecer errado escrever isso. Eu estou me vangloriando da minha ignorância? Minha intenção com essa postagem é:

* **Até mesmo os seus desenvolvedores favoritos talvez não saibam algumas coisas que você sabe.**

* **Independentemente do seu nível de conhecimento, sua confiança pode variar muito.**

* **Desenvolvedores experientes possuem conhecimentos valiosos apesar das lacunas no conhecimento.**

Estou ciente sobre as lacunas em meu conhecimento (pelo menos alguns deles). Posso preenchê-los posteriormente por curiosidade ou se eu precisar para um projeto.

Isso não desvaloriza meu conhecimento e experiência. Existem muitas coisas que eu consigo fazer bem. Por exemplo, aprender tecnologias quando eu preciso delas.

>Atualização: também [escrevi](/the-elements-of-ui-engineering/) sobre algumas coisas que eu sei.
