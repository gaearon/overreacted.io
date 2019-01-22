---
title: Cosas que aún no sé en 2018
date: '2018-12-28'
spoiler: Podemos admitir nuestros vacíos de conocimiento sin devaluar nuestra experiencia.
---

Con frecuencia la gente asume que sé mucho más de lo que sé en realidad. No es un problema feo para tener y no me estoy quejando. (Las personas que pertenecen a alguna minoría a menudo sufren un prejuicio a la inversa a pesar de sus bien merecidas credenciales, y eso *apesta*.)

**En este artículo ofreceré una lista incompleta de temas de programación que a menudo la gente asume incorrectamente que yo sé.** No estoy diciendo que *tú* no necesitas aprenderlas — o que yo no sé *otras* cosas útiles. Pero ya que ahora mismo no estoy en una posición vulnerable puedo ser honesto con esto.

He aquí por qué creo que es importante.

---

Primero, suele haber una expectativa poco realista de que un ingeniero con experiencia sabe todas las tecnologías en su campo. ¿Has visto alguna vez una “hoja de ruta de aprendizaje” con cien librerías y herramientas? Es útil — pero intimidante.

Lo que es más, no importa cuánta experiencia tengas, todavía puedes verte alternando entre sentirte capaz, inadecuado (“Impostor syndrome” o “síndrome del impostor”) y demasiado seguro (“Efecto Dunning-Kruger“). Depende de tu entorno, trabajo, personalidad, compañeros, estado mental, hora del día, etc.

Los desarrolladores con experiencia a veces comparten sus inseguridades para animar a los principiantes. Pero, ¡Hay un mundo de diferencia entre un cirujano experto que aún se pone nervioso y un estudiante sujetando su primer bisturí!

Escuchar “todos somos desarrolladores junior” puede ser desalentador y sonar como charla vacía para los aprendices enfrentándose a un verdadero vacío en el conocimiento. Confesiones alentadoras de practicantes bien intencionados como yo no ayudan con eso.

Aún así, incluso ingenieros con experiencia tienen muchos vacíos en el conocimiento. Este artículo es sobre los míos, y movito a quienes pueden permitirse vulnerabilidades similares a compartir los suyos. Pero no devaluemos nuestra experiencia mientras lo hacemos.

**Podemos admitir nuestro vacío en el conocimiento, sentirnos o no como impostores y aún así tener habilidades y experiencias muy valiosas que toman años de duro trabajo desarrollar.**

---

Con ese descargo de responsabilidad fuera del camino, aquí hay algunas cosas que no sé:

* **Comandos Unix y Bash.** Puedo usar `ls` y `cd` pero busco todo lo demás. Entiendo el concepto de *pipes* pero solo las he usado en casos sencillos. No sé cómo usar `xargs` para crear cadenas complejas o cómo componer y redirigir diferentes *streams* de salida. Tampoco nunca aprendí Bash apropiadamente así que solo puedo escribir scripts muy simples (y comúnmente con errores).

* **Lenguajes de bajo nivel.** Entiendo que Assembly te permite almacenar cosas en memoria y saltar por el código, pero nada más. Escribí unas cuantas líneas de C y puedo entender lo que es un puntero, pero no sé cómo usar `malloc` (asignación dinámica de memoria) u otras técnicas manuales de manejo de memoria. Nunca jugué con Rust.

* **Pila de protocolos.** Sé que las computadoras tienen direcciones IP y que DNS es cómo resolvemos nombres de dominio. Sé que hay protocolos de bajo nivel como TCP/IP para intercambiar paquetes que (¿tal vez?) aseguran integridad. Eso es todo — se me escapan los detalles.

* **Contenedores.** No tengo idea de cómo usar Docker o Kubernetes. (¿Están relacionados?) Tengo una vaga idea de que me dejan levantar una máquina virtual separada en forma predecible. Suena bien pero no lo he probado.

* **Serverless.** También suena bien. Nunca lo he probado. No tengo una idea clara de cómo ese modelo cambia la programación en backend (si es que lo hace).

* **Microservicios.** Si entiendo correctamente, esto únicamente significa “muchos endpoints de APIs hablando entre ellos”. No sé cuáles son las ventajas o desventajas de esta aproximación porque no he trabajado con ellos.

* **Python.** Me siento mal con este — *Sí he* trabajado con Python por muchos años en algún momento y nunca me molesté en aprenderlo en serio. Hay muchas cosas en él como el comportamiento de los imports que me son completamente opacos.

* **Backends con Node.** Entiendo cómo correr Node, usé algunas APIs como `fs` para herramientas de compilado y puedo configurar Express. Pero nunca hablé desde Node con una base de datos y no sé realmente cómo escribir un backend con él. Tampoco estoy familiarizado con frameworks de React como Next más allá de un “hola mundo”.

* **Plataformas nativas.** Intenté aprender Objective C en algún momento, pero no funcionó. Tampoco he aprendido Swift. Lo mismo con Java. (Aunque probablemente pueda entenderlo ya que trabajé con C#.)

* **Algoritmos.** Lo más que sacarás de mí es ordenamiento de burbuja y quizás quicksort en un día bueno. Probablemente puedo hacer tareas sencillas recorriendo grafos (*graph traversing*) si están atadas a un problema práctico particular. Entiendo la notación O(n) pero mi entendimiento no va más allá de “no pongas ciclos dentro de ciclos”.

* **Lenguajes funcionales.** A menos que cuentes JavaScript, no manejo fluidamente lenguajes funcionales tradicionales. (
manejo fluidamente C# y JavaScript — y ya me olvidé la mayor parte de C#.) Me cuesta leer código inspirado en LISP (como Clojure), Haskell (como Elm), o ML (como OCaml).

* **Terminología funcional.** Map y reduce es hasta donde llego. No sé monoids, functors, etc. Sé lo que es una mónada pero quizás eso es una ilusión.

* **CSS moderno.** No sé ni Flexbox ni Grid. Los *Floats* son mi elección.

* **Metodologías CSS** He usado BEM (referido a CSS, no el BEM original) pero eso es todo lo que sé. No he probado OOCSS u otras metodologías.

* **SCSS / Sass.** Nunca los aprendí.

* **CORS.** ¡Odio esos errores! Sé que necesito configurar algunos headers para arreglarlos pero he desperdiciado horas en ellos en el pasado.

* **HTTPS / SSL.** Nunca lo he configurado. No sé cómo funciona más allá de la idea de llaves privadas y públicas.

* **GraphQL.** Puedo leer una query pero no sé realmente cómo expresar cosas con nodos y bordes, cúando usar fragmentos y cómo funciona ahí la paginación.

* **Sockets.** Mi modelo mental es que hicieron que las computadores se comuniquen entre sí fuera del modelo "petición/respuesta" pero eso es todo lo que sé.

* **Streams.** Sin contar Rx Observables, no he trabajado cercanamente con streams. Usé los streams viejos de Node una o dos veces pero siempre me equivocaba con el manejo de errores.

* **Electron.** Nunca lo probé.

* **TypeScript.** Entiendo el concepto de tipos y puedo leer anotaciones pero nunca lo he escrito. Las pocas veces que lo he probado me encontré con dificultades.

* **Desarrollo y DevOps.** Puedo enviar algunos archivos por FTP o matar algunos procesos pero ese es el límite de mis habilidades de DevOps.

* **Gráficas.** Ya sea canvas, SVG, WebGL o gráficos de bajo nivel, no soy productivo en ellos. Entiendo la idea general pero necesitaría aprender las primitivas.

Por supuesto que esta lista no es exhaustiva. Hay muchas cosas que no sé.

---

Puede parecer algo extraño para discutir. Incluso se siente mal escribirlo. ¿Me estoy jactando de mi ignorancia? Lo que quiero que se lleven de este artículo es:

* **Incluso sus desarrolladores favoritos pueden no saber muchas cosas que tú sí sabes.**

* **Sin importar tu nivel de conocimientos, tu seguridad puede variar enormemente.**

* **Desarrolladores experimentados tiene habilidades valiosas a pesar de sus vacíos de conocimientos.**

Soy consciente de mis vacíos de conocimientos (al menos de algunos de ellos). Puedo llenarlos luego si me siento curioso o si los necesito para un proyecto.

Esto no devalúa mi conocimiento y experiencia. Hay muchas cosas que puedo hacer bien. Por ejemplo, aprender tecnologías cuando las necesito.

>Actualización: También [escribí](/the-elements-of-ui-engineering/) sobre un par de cosas que sí sé.
