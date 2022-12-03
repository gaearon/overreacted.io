---
title: Coisas que eu não sei em pleno 2018
date: '2018-12-28'
spoiler: Podemos admitir nossas lacunas de conhecimento sem desvalorizar nossa experiência.
---

As pessoas frequentemente assumem que eu sei mais do que eu realmente sei. Isso não é um problema e eu não estou reclamando. (Companheiros de grupos minoritários frequentemente sofrem o viés contrário, apesar de suas credenciais duramente adquiridas, e isso *é um saco*).

**Neste post irei oferecer uma lista incompleta de tópicos de programação que as pessoas frequentemente assumem de forma errada que eu sei.** Eu não estou dizendo que *você* não precisa aprendê-las — ou que não há *outras* coisas úteis que não sei. Mas, como eu não estou em uma posição vulnerável atualmente, posso ser honesto sobre isso.

Deixo aqui o porquê de eu achar isso importante.

---

Primeiro, geralmente existe uma expectativa irreal de que um engenheiro experiente conheça todas as tecnologias em seu campo de atuação. Você já viu um “roteiro de aprendizagem” que consistia de centenas de bibliotecas e ferramentas? Isso é útil - mas também intimidador.

Além do mais, não importa o quão experiente você se torne, você ainda vai se encontrar alternando entre se sentir capaz, inadequado (“Síndrome do impostor”), ou com excesso de confiança (“Dunning - Kruger effect”). Isso depende do seu ambiente, emprego, personalidade, companheiros de trabalho, estado mental, hora do dia, e por aí vai.

Às vezes, desenvolvedores experientes se abrem sobre suas inseguranças para encorajar os iniciantes. Mas, existe um universo inteiro de diferenças entre um cirurgião experiente que ainda fica nervoso de um estudante segurando seu primeiro bisturi!

Ouvir como “somos todos desenvolvedores juniores” pode ser desanimador e soar como conversa fiada para os alunos que enfrentam uma lacuna real no conhecimento. Boas confissões de praticantes bem intencionados como eu não podem fechar esta lacuna.

Ainda assim, até os engenheiros experientes possuem muitas lacunas de conhecimento. Este post é sobre as minhas lacunas, e eu incentivo aqueles que também possam arcar com uma vulnerabilidade similar a compartilhar suas próprias lacunas. Mas não desvalorizemos nossa experiência enquanto façamos isso.

**Nós podemos admitir nossas lacunas de conhecimento, podemos ou não nos sentirmos impostores, e ainda assim possuírmos uma expertise profundamente valiosa que leva anos de trabalho duro para desenvolver.**

---

Com este aviso prévio, aqui vão algumas coisas que eu não sei:

* **Comandos Unix e Bash.**  Eu posso rodar `ls` e `cd` mas eu pesquiso todo o restante. Eu sei o conceito de *piping* mas eu uso apenas em casos simples. Eu não sei como usar `xargs` para criar pipes complexos, ou como compor e redirecionar diferentes streams de saída. Eu também nunca aprendi Bash de forma adequada então eu só consigo escrever shell scripts muito simples (e frequentemente bugados).

* **Linguagens de baixo nível.** Eu entendo que Assembly te permite armazenar coisas na memória e pular de uma parte do código para outra, mas isso é tudo. Eu escrevi algumas linhas de C e entendo o que é um ponteiro, mas eu não sei como usar `malloc` ou outras técnicas manuais de manipulação de memória. Nunca brinquei com Rust.

* **Pilhas de rede.** Eu sei que computadores possuem um endereço IP, e que o DNS é como resolvemos hostnames. Eu sei que existem protocolos de baixo nível como TCP/IP para a troca de pacotes que (talvez?) garantem integridade. É isso — os detalhes são confusos pra mim.

* **Containers.** Eu não tenho ideia de como usar Docker ou Kubernetes. (Eles são relacionados?) Eu tenho uma ideia vaga de que eles me deixam rodar uma VM separada de uma forma previsível. Parece legal, mas eu não testei.

* **Serverless.** Também parece legal. Nunca tentei. Eu não tenho uma ideia clara de como este modelo muda a programação em backend (e se de fato muda).

* **Microsserviços.** Se eu entendi corretamente, isso simplesmente significa “vários endpoints de APIs conversando entre si”. Eu não sei quais são as vantagens ou desvantagens práticas desta abordagem porque eu não trabalhei com ela.

* **Python.** Eu me sinto mal sobre isso — eu *trabalhei* com Python por vários anos em algum momento e nunca me preocupei em aprender de fato. Existem várias coisas, como o comportamento das importações, que são totalmente obscuras pra mim.

* **Node backends.** Eu sei como rodar o Node, usei algumas APIs como `fs` para ferramentas de construção, e consigo configurar um Express. Mas eu nunca comuniquei o Node com um banco de dados e não sei exatamente como escrever um backend nele. Eu também não tenho familiaridade com frameworks React como Next, além de um “hello world”.

* **Plataformas nativas.** Eu tentei aprender Objective C em algum momento mas não deu certo. Eu também não aprendi Swift. O mesmo para Java. (Eu provavelmente poderia ter pego o Java já que trabalhei com C#).

* **Algoritmos.** O máximo que você vai conseguir de mim é um *bubble sort* e talvez um *quicksort*, num dia bom. Provavelmente posso fazer tarefas simples de percorrimento de grafos, se eles estiverem ligados a um problema prático específico. Eu entendo a notação O(n), mas meu entendimento não vai muito alm de “não coloque loops dentro de loops”.

* **Linguagens funcionais.** A não ser que você inclua JavaScript, Eu não sou fluente em nenhuma linguagem funcional tradicional. (Eu sou fluente apenas em C# e JavaScript — e eu já esqueci a maior parte do C#.) Eu tenho dificuldades para ler códigos em linguagens inspiradas no LISP (como Clojure), inspiradas no Haskell (como Elm), ou inspiradas no ML (como OCaml).

* **Terminologia funcional.** Map e reduce é o mais longe que eu vou. Eu não conheço monoids, functors, etc. Eu sei o que é um monad, mas talvez isso seja uma ilusão.

* **Modern CSS.** Eu não conheço Flexbox ou Grid. Floats é a minha praia.

* **Metodologias CSS.** Eu usei BEM (a parte do CSS, não o BEM original) mas isso é tudo que eu sei. Eu não testei o OOCSS ou outras metodologias.

* **SCSS / Sass.** Nunca aprendi.

* **CORS.** Eu tenho medo desses erros! Eu sei que preciso configurar alguns headers para consertá-los, mas eu gastei horas com isso no passado.

* **HTTPS / SSL.** Nunca configurei. Não sei como funciona, além da ideia de chaves privadas e públicas.

* **GraphQL.** Eu consigo ler uma query mas eu realmente não sei como expressar algo com nodes e edges, quando usar fragmentos, ou como a paginação funciona nele.

* **Sockets.** Na minha cabeça eles permitem aos computadores conversarem entre si fora do padrão requisição/resposta, mas é tudo que sei.

* **Streams.** Além dos Rx Observables, eu não trabalhei com Streams de forma mais próxima. Eu usei os antigos streams de Node uma ou duas vezes, mas sempre falhei tratamento de erros.

* **Electron.** Nunca tentei.

* **TypeScript.** Eu entendo o conceito de tipos e posso ler anotações mas eu nunca escrevi. As poucas vezes que eu tentei, encontrei dificuldades.

* **Deployment e devops.** Eu consigo enviar alguns arquivos por FTP ou matar algum processo, mas este é o limite das minhas habilidades em devops.

* **Graphics.** Seja canvas, SVG, WebGL ou graphics no baixo nível, eu não sou produtivo nisso. Eu conheço a idéia geral, mas eu preciso aprender a base.

Com certeza esta lista não está completa. Existem muitas coisas que eu não sei.

---

Talvez isso pareça uma coisa estranha de se discutir. Até sinto como se fosse errado escrever isso. Estaria eu me vangloriando da minha ignorância? Minha intenção com essa postagem é:

* **Até mesmo os seus desenvolvedores referência talvez não saibam algumas coisas que você sabe.**

* **Independentemente do seu nível de conhecimento, sua confiança pode variar muito.**

* **Desenvolvedores experientes possuem conhecimentos valiosos, apesar das lacunas no conhecimento.**

Estou ciente sobre as lacunas em meu conhecimento (pelo menos algumas delas). Posso preenchê-las posteriormente por curiosidade, ou se eu precisar pra um projeto.

Isso não desvaloriza meu conhecimento e experiência. Existem muitas coisas que eu consigo fazer bem. Por exemplo, aprender tecnologias quando eu preciso delas.

>Atualização: também [escrevi](/the-elements-of-ui-engineering/) sobre algumas coisas que eu sei.
