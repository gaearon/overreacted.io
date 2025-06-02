---
title: RSC for LISP Developers
date: '2025-06-01'
spoiler: Quoting for modules.
---

One of the big ideas of LISP is that code is data, and data is code. I mean, that's kind of [generally](https://wiki.c2.com/?DataAndCodeAreTheSameThing) true, but in LISP it's both culturally and syntactically emphasized. For example, let's take this piece of code in LISP:

```lisp
(+ 2 2)
```

This gives us `4`.

But let's put a quote before it:

```lisp
'(+ 2 2)
```

Suddenly, the result is... `(+ 2 2)`.

Uh, what do I do with that? Well, that's a piece of LISP code. "Quoting" a piece of LISP code means "don't actually evaluate it, just give me the code itself".

Of course, I *could* evaluate it later:

```lisp
(eval '(+ 2 2))
```

This gives me `4` again.

That's what I mean by "code is data" being very much in the LISP culture. The language has a first-class primitive for "don't execute this part". That's quoting.

Now consider web apps.

A web server is a program whose job is to generate another program. A server generates the client program (written in HTML and JavaScript) and serves it to the client computer. Generating and sending code sounds an awful lot like quoting.

In JavaScript, we don't have quoting. I can't put a `'` before a function and say "now I want to treat this as data rather than code". Well, I could wrap it into a string literal, but there would be no syntax highlighting and it would kind of lose too much syntatic power. You really don't want to be coding inside string literals.

We can't "quote" individual code blocks in JavaScript without losing many benefits of the language. However, what if we could "quote"... an entire module?

React Server Components (RSC) is a client-server programming paradigm that uses a similar idea to refer to client code from the server code. The `'use client'` directive lets you [import code designed for the client--but without running it](/why-does-rsc-integrate-with-a-bundler/#serializing-modules):

<Client>

```js {1}
'use client'

export function onClick() {
  alert('Hi.');
}
```

</Client>

Like quoting, it marks a piece of code to be treated as data. *Unlike* quoting in LISP, the result you get back is opaque--you can't transform or introspect that code.

This means that whoever imports `onClick` from the backend code won't get an actual `onClick` function--instead, they'll get `'/js/chunk123.js#onClick'` or something like that identifying *how to load* this module. It gives you code-as-data. Unlike with LISP quoting, this is [implemented at the compile time](/why-does-rsc-integrate-with-a-bundler/#rsc-bundler-bindings) using a bundler.

Eventually this code will make it to the client (as a `<script>`) and be evaluated there. Then, the `onClick` function will actually exist (and maybe even be called).

What this gives us is an ability to write a program that composes behaviors that execute at different stages (on the server and the client) in a very modular way. [See here for example.](/impossible-components/#final-code) The parts outside the "quote" deal with server-only resources, while the parts inside the "quote" are stateful and exist on the client--but they are composed. The server stuff can wrap the client stuff, the client stuff can wrap the server stuff, as long as you're doing all composition from the server. And what doing composition on the server enables is a guarantee that all the server stuff runs [within a single request/response roundtrip](/one-roundtrip-per-navigation/). It's also [progressively streamed](/progressive-json/).

That's kind of it, really. Of course, this is a lot less powerful than quoting because the evaluation strategies are being prescribed by React, and there's no kind of metaprogramming like transforming the code itself. So maybe it's still a stretch.

I know LISP has a rich tradition of solutions that compose code across multiple environments, with some newer approaches like [Electric](https://github.com/hyperfiddle/electric) picking up steam. I don't understand LISP well enough to dig deep into them but I would love to see more explanations targeted at JavaScript developers, both about prior art and new ideas.

Thank you!

I'll try to learn LISP too, someday.
