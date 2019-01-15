---
title: Cosas que aún no sé en 2018
date: '2018-12-28'
langs: ['en', 'zh-hant', 'ko', 'es']
spoiler: Podemos admitir nuestros vacíos de conocimiento sin devaluar nuestra experiencia.
---

Con frecuencia la gente asume que sé mucho más de lo que sé en realidad. No es un mal problema para tener y no me estoy quejando. (Las personas que pertenecen a alguna minoría a menudo sufren un prejuicio a la inversa a pesar de sus bien merecidas credenciales, y eso *apesta*.)

**En este artículo ofreceré una lista incompleta de temas de programación que a menudo la gente asume incorrectamente que yo sé.** No estoy diciendo que *tú* no necesitas aprenderlas — o que yo no sé *otras* cosas útiles. Pero ya que ahora mismo no estoy en una posición vulnerable puedo ser honesto con esto.

He aquí por qué creo que es importante.

---

Primero, suele haber una expectativa irrealista que un ingeniero con experiencia sabe todas las tecnologías en su campo. ¿Has visto alguna vez una “hoja de ruta de aprendizaje” con cien librerías y herramientas? Es útil — pero intimidante.

Lo que es más, no importa cuánta experiencia tengas todavía puedes verte alternando entre sentirte capaz, inadecuado (“Impostor syndrome” o “síndrome del impostor”) y demasiado seguro (“Efecto Dunning-Kruger“). Depende de tu entorno, trabajo, personalidad, compañeros, estado mental, hora del día, etc.

Los desarrolladores con experiencia a veces comparten sus inseguridades para animar a los principiantes. ¡Pero hay un mundo de diferencia entre un cirujano experto que aún se pone nervioso y un estudiante sujetando su primer bisturí!

Escuchar “todos somos desarrolladores junior” puede ser desalentador y sonar como charla vacía para los aprendices enfrentándose a un verdadero vacío en el conocimiento. Confesiones alentadoras de practicantes bien intencionados como yo no ayudan con eso.

Aún así, incluso ingenieros con experiencia tienen muchos vacíos en el conocimiento. Este artículo es sobre los míos, y llamo a quienes pueden permitirse vulnerabilidad similar a compartir los suyos. Pero no devaluemos nuestra experiencia mientras lo hacemos.

**Podemos admitir nuestro vacío en el conocimiento, sentirnos o no como impostores y aún así tener habilidades y experiencias muy valuables que toma años de duro trabajo desarrollar.**

---

Con ese descargo de responsabilidad fuera del camino, aquí hay algunas cosas que no sé:

* **Comandos Unix y Bash.** Puedo usar `ls` y `cd` pero busco todo lo demás. Entiendo el concepto de *pipes* pero sólo lo he usado en casos sencillos. No sé cómo usar `xargs` para crear cadenas complejas o cómo componer y redirigir diferentes *streams* de salida. Tampoco nunca aprendí Bash apropiadamente así que solo puedo escribir scripts muy simples (y comunmente con muchos bugs).

* **Lenguajes de bajo nivel.** Entiendo que Assembly te permite almacenar cosas en memoria y saltar por el código pero nada más. Escribí unas cuantes líneas de C y puedo entender lo que es un puntero, pero no sé cómo usar `malloc` (asignación dinámica de memoria) u otras técnicas manuales de manejo de memoria. Nunca jugué con Rust.

* **Pila de protocolos.** Sé que las computadoras tienen direcciones IP y que DNS es cómo resolvemos nombres de dominio. Sé que hay protocolos de bajo nivel como TCP/IP para intercambiar paquetes que (¿tal vez?) aseguran integridad. Eso es todo — se me escapan los detalles.

* **Contenedores.** No tengo idea de cómo usar Docker o Kubernetes. (¿Están relacionados?) Tengo una vaga idea de que me dejan levantar una una VM separada en forma predecible. Suena bien pero no lo he probado.

* **Serverless.** También suena bien. Nunca lo he probado. No tengo una idea clara de cómo ese modelo cambia la programación en backend (si es que lo hace).

* **Microservicios.** Si entiendo correctamente, esto solo significa “muchos endpoints de APIs hablando entre ellos”. No sé cuáles son las ventajas o desventajas de esta aproximación porque no he trabajado con ellos.

* **Python.** Me siento mal con este — *Si he* trabajado con Python por muchos años en algún momento y nunca me molesté en aprenderlo en serio. Hay muchas cosas en él como el comportamiento de los imports que me son completamente opacos.

* **Backends con Node.** Entiendo cómo correr Node, usé algunas APIs como `fs` para herramientas de compilado y puedo configurar Express. Pero nunca hablé desde Node con una base de datos y no sé realmente cómo escribir un backend con él. Tampoco estoy familiarizado con frameworks de React como Next más allá de un “hola mundo”.

* **Plataformas nativas.** Intenté aprender Objective C en algún momento pero no funcionó. Tampoco he aprendido Swift. Lo mismo con Java. (Aunque probablemente pueda entenderlo ya que trabajé con C#.)

* **Algoritmos.** Lo más que sacarás de mí es ordenamiento de burbuja y quizás quicksort en un día bueno. Proablemente puedo hacer tareas sencillas de recorridos de gráficas (*graph traversing*) si están atadas a un problema práctico particular. Entiendo la notación O(n) pero mi entendimiento no va más alla de “no pongas ciclos dentro de ciclos”.

* **Lenguajes funcionales.** A menos que cuentes JavaScript, no manejo fluidamente lenguajes funcionales tradicionales. (Sólo manejo fluidamente C# y JavaScript — y ya me olvidé la mayor parte de C#.) Me cuesta leer código inspirado en LISP (como Clojure), Haskell (como Elm), o ML (como OCaml).




* **Functional languages.** Unless you count JavaScript, I’m not fluent in any traditionally functional language. (I’m only fluent in C# and JavaScript — and I already forgot most of C#.) I struggle to read either LISP-inspired (like Clojure), Haskell-inspired (like Elm), or ML-inspired (like OCaml) code.

* **Functional terminology.** Map and reduce is as far as I go. I don’t know monoids, functors, etc. I know what a monad is but maybe that’s an illusion.

* **Modern CSS.** I don’t know Flexbox or Grid. Floats are my jam.

* **CSS Methodologies.** I used BEM (meaning the CSS part, not the original BEM) but that’s all I know. I haven’t tried OOCSS or other methodologies.

* **SCSS / Sass.** Never got to learn them.

* **CORS.** I dread these errors! I know I need to set up some headers to fix them but I’ve wasted hours here in the past.

* **HTTPS / SSL.** Never set it up. Don’t know how it works beyond the idea of private and public keys.

* **GraphQL.** I can read a query but I don’t really know how to express stuff with nodes and edges, when to use fragments, and how pagination works there.

* **Sockets.** My mental model is they let computers talk to each other outside the request/response model but that’s about all I know.

* **Streams.** Aside from Rx Observables, I haven’t worked with streams closely. I used old Node streams one or two times but always messed up error handling.

* **Electron.** Never tried it.

* **TypeScript.** I understand the concept of types and can read annotations but I’ve never written it. The few times I tried, I ran into difficulties.

* **Deployment and devops.** I can manage to send some files over FTP or kill some processes but that’s the limit of my devops skills.

* **Graphics.** Whether it’s canvas, SVG, WebGL or low-level graphics, I’m not productive in it. I get the overall idea but I’d need to learn the primitives.

Of course this list is not exhaustive. There are many things that I don’t know.

---

It might seem like a strange thing to discuss. It even feels wrong to write it. Am I boasting of my ignorance? My intended takeaway from this post is that:

* **Even your favorite developers may not know many things that you know.**

* **Regardless of your knowledge level, your confidence can vary greatly.**

* **Experienced developers have valuable expertise despite knowledge gaps.**

I’m aware of my knowledge gaps (at least, some of them). I can fill them in later if I become curious or if I need them for a project.

This doesn’t devalue my knowledge and experience. There’s plenty of things that I can do well. For example, learning technologies when I need them.

>Update: I also [wrote](/the-elements-of-ui-engineering/) about a few things that I know.