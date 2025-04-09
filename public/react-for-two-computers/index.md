---
title: React for Two Computers
date: '2025-04-09'
spoiler: Two things, one origin.
---

I've been trying to write this post at least a dozen times. I don't mean this figuratively; at one point, I literally had a desktop folder with a dozen abandoned drafts. They had wildly different styles--from rigoruous to chaotically cryptic and insufferably meta; they would start abruptly, chew on themselves, and eventually trail off to nowhere. One by one, I threw them all away because they all sucked.

It turns out that I wasn't really writing a post; I was actually preparing a talk. I was pretty far into the process of writing this post when I had that realization. Oops! Thankfully, the React Conf organizers let me present a new talk on a short notice, and I did that eight months ago. You can watch *React for Two Computers* below.

<iframe width="560" height="315" src="https://www.youtube.com/embed/ozI4V_29fj4?si=A_KuimpIB9kmu7GZ" title="YouTube video player" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen />

It's about everyone's favorite topic, React Server Components. (Or maybe not.)

I've given up on the idea of converting this talk into a post form, nor do I think it's possible. But I wanted to jot down a few notes that are complementary to the talk. I'm going to assume that you *have* watched the talk itself. This is just the stuff that wasn't coherent enough to make the cut--the loose threads I couldn't tie together.

---

## Act 1

### Recipes and Blueprints

What is the difference between a tag and a function call?

Here's a tag:

```js
<p>Hello</p>
```

Here's a function call:

```js
alert('Hello');
```

One difference is that `<` and `>` are hard and spiky and `(` and `)` are soft and round. But that's not what I mean. These are just visual differences. But what is the difference in how they work, what they mean, in what we expect from them?

Of course, there is no particular meaning to a *tag* or a *function call* if you don't specify which language you're using. For example, a JavaScript function call might not behave the same way as a Haskell function call; an HTML tag might not behave the same way as a ColdFusion tag. Nevertheless, there are some things that we *expect* from a tag or a function call precisely *because* we're familiar with how they work in popular languages. The spiky `<` and `>` carry a set of associations and intuitions, just like the soft `(` and `)` do. I want to dig into these intuitions.

Let's start with what `alert('Hello')` and `<p>Hello</p>` have in common:

1. **We refer to a function or a tag by its name.** By convention, a function call often starts with a verb (`createElement`, `printMoney`, `querySelectorAll`), while tags are usually named with nouns (like `p` for a *paragraph*). This isn't a hard rule (`alert` is both; `b` stands for *bold*) but it's true more often than not. (Why is that?)
1. **We can pass information to a function or a tag.** Earlier, we were passing a piece of text (`'Hello'`) to the tag and the function. But we're not limited to passing a single string. Within a JavaScript function call, we can pass multiple arguments including strings, numbers, booleans, objects, and so on. Within an HTML tag, we can pass multiple attributes, but their values cannot be objects or other rich data structures--which is quite limiting. Thankfully, tags in JSX (as well as in many HTML-based template languages) let us pass objects and any other rich values.
1. **Both function calls and tags can be deeply nested.** For example, we could write `alert('Hello, ' + prompt('Who are you?'))` to express the relationship between these two different function calls: the result of the inner `prompt` call gets combined with a string, and is then passed to the outer `alert` call. (Try it in your console if you're not sure what this does.) Although nesting is fairly common with function calls, with tags nesting really *is* the name of the game. You hardly ever see a tag completely alone and not surrounded by other tags. (Why is that?)

Clearly, function calls and tags are very similar. They let us pass some information to a named thing, and if needed, they let us elaborate by nesting further (passing some more information to some named thing (nesting as much as we need (yay!)))

We're also starting to get a few hints of the fundamental differences between them. For one, function calls tend to be verbs while tags tend to be nouns. Also, you'll encounter deeply nested tags more often than deeply nested function calls.

What's up with that?

Let's start with the latter. Why do tags tend to cling to each other? Are tags just naturally predisposed to gravitate towards other tags until they--*yoink!*--click together? Perhaps those spiky bois really do yearn for connection? That may be so, but consider this: maybe we *like* to use tags for deeply nested structures because we can see the `</end>` of every tag and don't have to guess which `)` is closing.

Tags don't lead to deep nesting--rather, we *choose* to use tags *for* deep nesting. (Recall how broadly the JavaScript community eventually adopted JSX despite it being almost universally panned for a year or two. Nesting tags is hard to give up!)

Okay, let's say we *prefer* to use tags for nesting. But why do tags tend to be nouns rather than verbs? Is this a coincidence, or is there a deeper reason for this as well?

This is more of a conjecture but I think it's because nouns are easier to decompose than verbs. Nouns describe *things*, and things can often be adequately described purely as a composition of other things. For example, a building consists of floors, floors consist of rooms, rooms consist of people, and people consist of water. Note that this description is *timeless*--not in the sense that it's a classic, but in the sense that it describes a snapshot in time, like a frame in the movie, or like a blueprint. You can omit time from the equation, and it'll still be a pretty useful description.

Verbs, on the other hand, tend to describe *processes* which happen *over* time--they're time*ful*! Consider a cooking recipe: "Heat the frying pan, put the butter on it, wait for the butter to melt, now pour the eggs on it." Although there are still opportunities for composition (*how* does one crack an egg?), the sequencing here is crucial! You need to be constantly aware of what step happens first, what step happens next, and what kind of decisions you have to make between the steps. Unlike a blueprint, a recipe has an ordering to it, and a certain urgency to it too.

So how does this relate to tags and function calls?

A recipe prescribes a sequence of steps to be performed in an order. It's composed of verbs but there is rarely a lot of nesting. (In fact, nesting may just obscure the ordering.) Each step may change something or depend on the previous steps, so it is important to execute the recipe in the exact order it was written, top to bottom. These recipes, also known as *imperative* programs, are written with function calls:

```js
const eggs = crackEggs();
heat(fryingPan);
put(fryingPan, butter);
await delay(30000);
put(fryingPan, eggs);
```

A blueprint, on the other hand, describes what nouns a thing is made of. It doesn't prescribe a specific order of operations--it only describes how the whole is broken into its parts. This is why these blueprints, also known as *declarative* programs, naturally end up deeply nested, and thus are more convenient to write with tags:

```js
<Building>
  <Roof />
  <Floor>
    <Room />
    <Room>
      <Person name="Alice" />
      <Person name="Bob" />
    </Room>
  </Floor>
  <Basement />
</Building>
```

Many real-world programs combine both techniques. For example, a typical React component combines some imperative recipes (like sequences of function calls in the event handlers) with some declarative blueprints (like the returned JSX tags).

However, ultimately, our programs must *do* something. Recipes are ready to be executed--they don't leave any ambiguity about what should be done next. Do this step, then do this step, then do this step, then done. On the other hand, a blueprint is just that--a detailed plan to construct something. It won't come to life until some recipe actually decides to construct the things described by that blueprint. (For example, React constructs the DOM described by the blueprint of your JSX.)

In a way, a blueprint is almost a recipe, but it's more passive, inert, open to future interpretation. It's a recipe but with *time itself* factored out of the equation. When you remove time, all that's left is the structure--the things, the nouns, the tags.

A blueprint is a *potential* recipe. It's a plan--something that might or might not happen depending on whether some recipe will eventually carry out that plan.

Now, blueprints are made of tags, and recipes are made of function calls. If we say a blueprint is a *potential* recipe, it follows that... a tag is a *potential* function call.

Wait, what?

---

### Await and RPC

Suppose you want to call a function. That's easy to do:

```js
alert('Hello');
```

You can be reasonably sure that as soon as that function finishes executing, the next line will run immediately. In particular, it's very nice that you can get the *result* of one function call and then immediately use it for the next function call:

```js
const name = prompt('Who are you?');
alert('Hello, ' + name);
console.log('Done.');
```

However, suppose that the function you want to call is on a different computer. That would be a bummer, right? But so it happens.

The standard way to deal with this situation would be to issue some kind of a network call. We have plenty of existing ideas in this area, such as HTTP or even something lower level. Most of us manage to spend our entire careers without ever learning how bytes travel through the underwater cables. Marvelous stuff.

Now, the problem, of course, is that our program can't continue until that network call is over. If we can't know the person's `name` without talking to another computer, we need to "pause" the execution of our code before the `alert` call.

Suppose you were the first person ever to encounter this problem.

One idea you might have is to invent a `callNetwork` API that takes a function:

```js
callNetwork('https://another-computer/?fn=prompt&args=Who+are+you?', (response) => {
  const name = response;
  alert('Hello, ' + name);
  console.log('Done.');
});
```

Once the response arrives, your `callNetwork` API would call the passed function with the `response`, at which point the rest of the code would run as usual.

This is honestly not bad for a first idea. But it's not great either:

1. **The network call has tangled up our code.** Previously, the code executed in a top-down order, but now it has a twist. Conceptually `alert('Hello' + name)` is the "next thing that happens" in the recipe we're trying to convey. However, we've had to put it *inside* the `callNetwork` call so that the computer knows to "wait" for it.
2. **We've severed the connection between two pieces of code.** Normally, when you want to call a function, you just *call* it. Assuming it's in the same file. If it's in another file, you `export` it there and then you `import` it here. But in this case we're no longer dealing with a function call--we're dealing with an HTTP call. It may be hard to see after dealing with REST APIs for decades, but we've actually lost something of the essence during this conversion. For starters, it doesn't get typechecked! That endpoint might not exist. You can't command-click into that call and see where the function is defined and what it does. There was a direct and visceral connection between the function being called and the place calling it, but there no longer is--not because you *wanted* to introduce some nice conceptual separation but because you don't have any other *means* to keep that connnection.

The problem becomes easier to see if we imagine the `alert` function is *also* on some other computer (maybe on a different one). Now the code becomes:

```js
callNetwork('https://another-computer/?fn=prompt&args=Who+are+you?', (response) => {
  const name = response;
  callNetwork('https://yet-another-computer/?fn=alert&args=Hello,+' + name, () => {
    console.log('Done.');
  });
});
```

So how do you solve these two problems?

You come up with two ideas.

To solve the first problem ("tangling" of the code), you introduce a new concept called an `async` function. An `async` function is not guaranteed to execute in a single step--rather, it's expected that it may "pause" execution (for example, due to network calls). Since it may pause, the *calling* code will need to “`await`” the async function call to acknowledge that it won't be surprised by that pause. This means the *caller* would pause too at some point, so it will *also* need to mark itself as `async`. So `async` and `await` would propagate upwards through the calling chain so that nobody is surprised their code is "pausing". At least that's your idea.

That's not a bad idea at all--in fact, some variation of it is pretty much table stakes in new programming languages. You no longer have to [convince people](https://tirania.org/blog/archive/2013/Aug-15.html) it's good.

This turns the code to:

```js
const name = await callNetwork('https://another-computer/fn=prompt&args=Who+are+you?');
await callNetwork('https://yet-another-computer/fn=alert&args=Hello,+' + name);
console.log('Done.');
```

Now you've got your eyes on the second problem. What you're trying to do is to call a function called `prompt` on one computer and a function called `alert` on another computer. Let's say these functions are actually defined in your codebase.

What if you could literally *import* them from another computer?

```js {1,2}
import { prompt } from 'another-computer';
import { alert } from 'yet-another-computer';

const name = await prompt('Who are you?');
await alert('Hello, ' + name);
console.log('Done.');
```

Wait, but that doesn't actually help the problem as stated above. For example, TypeScript won't know what `'another-computer'` is. Instead, suppose you could import those functions from wherever they actually are in your codebase:

```js {1}
import { prompt, alert } from './stuff';

const name = await prompt('Who are you?');
await alert('Hello, ' + name);
console.log('Done.');
```

But wait, that's just a normal import. It would bring them into the program on *this* computer, whereas what you wanted was to have them be deployed on *another* computer. The fact that you want them to be called remotely via HTTP across the network boundary behind the scenes needs to be expressed somewhere in code.

Let's invent a special syntax that would let you express that. We might revise this syntax later but for now we're calling it `import rpc` because what we've described here has been known for decades as [RPC](https://en.wikipedia.org/wiki/Remote_procedure_call), or a "remote procedure call":

```js {1}
import rpc { prompt, alert } from './stuff';

const name = await prompt('Who are you?');
await alert('Hello, ' + name);
console.log('Done.');
```

Imagine that TypeScript would not only let you click into them now, but it would also be *aware* that these functions are behind a remote boundary, so it would force them to be declared as `async`, and ensure that the types of their inputs and their output remain serializable (and thus can actually travel over the network).

Oh well, `async` / `await` and `import rpc`, that's enough invention for one day.

Unless?..

---

### Call Me Maybe

A colleague comes to you with a problem. "That `async` / `await` stuff and `import rpc` was great, truly great. But it only works if the other computer actually *talks back.* Imagine a computer that *doesn't.* How would you call a function there?"

The question sounds nonsensical at first but you ponder it for a bit.

If the other computer doesn't talk back... Well, natually you can't know *when* it's done, so pausing the execution with `await` won't work. So you can't do this:

```js
await alert('Hello, ' + name);
```

What's worse, if the computer where the function resides doesn't talk back, you can't get the *result* of any function call, so this would not be possible either:

```js
const name = await prompt('Who are you?');
```

You're tempted to declare the case hopeless but you're trying to think critically. Sure, you can't pass the information *back*... but you still can pass it *forward*.

For example, this only passes the information forward:

```js
alert('Hello');
```

Even if the other computer doesn't talk back, here you're just asking it to call the `alert` function with the `'Hello'` string. You're not asking for anything back.

So this call should be possible to make! Except... it wouldn't quite work like a regular function call, so it seems wrong to use the same syntax as for a regular function call. Generally, one would expect that the code below executes after the function call is *done*, but you can't guarantee it here. In fact, you can't be certain that the call will succeed at all--if it fails midway because of network, you'll have no way to know that. Unlike with RPC, you won't be notified of network errors.

This isn't a function call. It's a... *potential* function call. It's a call that might, or might not happen in the future. You could say it's a blueprint of a function call.

Let's invent some made-up syntax for these "potential calls":

```js
alert⧼'Hello'⧽;
```

We might change that syntax later. But for now let's think through the *semantics* of this syntax, i.e. what we'd actually want it to do. In the design process, it's wise to start from the limitations ("the other computer can't talk back") and see if they place any unavoidable constraints on the semantics of these "potential calls".

Clearly, these "potential calls" don't interrupt execution and don't affect the rest of the code. They're not "waiting" for anything because there's nothing to wait for:

```js
alert⧼'Hello'⧽;      // Can't know if/when this succeeds or fails
console.log('Done.') // Runs immediately
```

This poses a question: what should these "potential calls" return?

```js
const name = prompt⧼'Who are you?'⧽;
console.log(name); // ???
```

Clearly, `prompt⧼'Who are you?'⧽` can't return the eventual actual return value of the `prompt` call since the other computer can't talk back. We could decide that this syntax always returns `undefined` but that feels rather limiting. We'd have no way to coordinate the `prompt` "potential call" with the `alert` "potential call"!

What we want to achieve is something like this:

```js
const name = prompt⧼'Who are you?'⧽;
alert⧼'Hello, ' + name⧽;
```

The problem is, the code above doesn't make sense because we can't get anything *out* of the `prompt` "potential call". So we can neither assign the `name` variable nor manipulate its return value with `+` on this computer. However, here's an idea. What we *could* do is rewrite the two lines above *solely* in terms of "potential calls":

```js
alert⧼
  concat⧼
    'Hello, ',
    prompt⧼'Who are you?'⧽
  ⧽
⧽;
```

(Here and later, assume `concat` is a global function set to `(a, b) => a + b`.)

There are two benefits to reframing the code this way. First, it avoids the problem of declaring a nonsensical `name` variable that can't possibly have any meaningful value (because we're not on the other computer yet). Second, it lets us think of these nested "potential calls" as a single expression that is easy to encode as JSON:

```js
{
  fn: 'alert',
  args: [{
    fn: 'concat',
    args: ['Hello, ', {
      fn: 'prompt',
      args: ['Who are you?']
    }]
  }]
}
```

We could then send that JSON to the other computer (which can't talk back to us!), and it would interpret our instructions using a function like this:

```js
function interpret(json) {
  if (json && json.fn) {
    // Find a global function by its name
    let fn = window[json.fn];
    // Interpret any nested potential calls in the arguments
    let args = json.args.map(arg => interpret(arg));
    // Actually perform the call now
    let result = fn(...args);
    // If it returned more potential calls, do them next
    return interpret(result);
  } else {
    return json;
  }
}
```

You can verify in the console that passing the above JSON object to `interpret()` does the equivalent of the original code. (Don't forget to define a `concat` global!)

In other words, this approach works!

Let's take another look at this syntax:

```js
alert⧼
  concat⧼
    'Hello, ',
    prompt⧼'Who are you?'⧽
  ⧽
⧽;
```

We've now seen that any dependencies between the "potential calls", such as between `prompt` and `alert`, should be expressed by embedding these "potential calls" inside each other. We can't really put *code* in between them unless that code *also* resides on the other computer. On *this* computer, they're more like... markup.

Since we don't have any other ways to compose calls, we can expect nesting level to be deep. So it might be a good idea to make the syntax slightly easier to scan:

```js
<alert>
  <concat>
    Hello,
    <prompt>Who are you?</prompt>
  </concat>
</alert>
```

Note something peculiar.

With a regular function call, the return value is decided by the function you called:

```js
const result = prompt('Who are you?');
console.log(result); // 'Dan'
```

But with a "potential" function call, the return value is *the call itself as data:*

```js
const inner = <prompt>Who are you?</prompt>;
// { fn: 'prompt', args: ['Who are you?'] }

const outer = <concat>Hello, {inner}</concat>;
// {
//   fn: 'concat',
//   args: ['Hello', { fn: 'prompt', args: ['Who are you?'] }]
// }

const outest = <alert>{outer}</alert>;
// {
//   fn: 'alert',
//   args: [{
//     fn: 'concat',
//     args: ['Hello', { fn: 'prompt', args: ['Who are you?'] }]
//   }]
// }
```

The calls are not yet made--we're only building a *blueprint* of those calls:

```js
<alert>
  <concat>
    Hello,
    <prompt>Who are you?</prompt>
  </concat>
</alert>
```

This blueprint of "potential calls" looks code, but it acts like data. It's structurally similar to function calls but it is more passive, inert, open to interpretation. We're yet to *send* this blueprint to the other computer which will actually interpret it.

Anyway, writing "potential function calls" so many times is getting on my nerves.

Let's just call them tags.

---

### Splitting a Function

Here's a function:

```js
function greeting() {
  const name = prompt('Who are you?');
  alert('Hello, ' + name);
}
```

If you run it, it will execute in a single shot. As functions generally do.

Suppose you wanted to split its execution in two parts. The first part runs immediately. The second part runs when the caller decides so.

Here's an easy way to do that:

```js {3,5}
function greeting() {
  const name = prompt('Who are you?');
  return function resume() {
    alert('Hello, ' + name);
  };
}
```

Now you can run the function in two parts:

```js
const resume = greeting(); // Run the first part
resume();                  // Run the second part
```

Now suppose you want to run the second part on *another computer*. You're still thinking of it as a single computation. It just happens to be physically distributed.

"Easy!" you say:

```js {3-5}
function greeting() {
  const name = prompt('Who are you?');
  return `function resume() {
    alert('Hello, ' + name);
  }`;
}
```

Wait, what?

Okay, that's clever, you're returning *the rest of the code* from your function so that it can be transferred to another computer to finish the computation. But wait! That won't work--from the other computer's perspective, `name` is not defined:

```js
function resume() {
  alert('Hello, ' + name); // 🔴 ReferenceError: name is not defined
}
```

"Not a problem," you say:

```js {4}
function greeting() {
  const name = prompt('Who are you?');
  return `function resume() {
    alert('Hello, ' + ${JSON.stringify(name)});
  }`;
}
```

Ah, I see what you did there. So you embedded the value of the `name` that you got on the first computer *directly into* to the code that you sent to the other computer. From its perspective, the `name` will appear *precomputed*, as if it was always there:

```js
function resume() {
  alert('Hello, ' + "Dan");
}
```

In fact, that function will have no idea that it's a part of a bigger picture. From its perspective, the world *starts* on the second computer. As this function gets more complex, it might start getting the idea that it's the entire thing. And that's okay.

But you've *seen* the entire thing:

```js
function greeting() {
  const name = prompt('Who are you?');
  return `function resume() {
    alert('Hello, ' + ${JSON.stringify(name)});
  }`;
}
```

It's an interesting shape--a program returning the rest of itself in a form that can be transferred over the network to continue execution on another machine. You might call this a *closure over the network*. Notice a few things about how it works:

- **The data flows strictly in a one direction--from the first to the second computer.** The second part can see the values from the first part (as long as they can be turned into text). But the first part doesn't know anything about the second part. The first part is writing the script; the second part will be performing it on stage.
- **The first and the second parts are completely isolated.** Although they are a part of a single conceptual *program*, they are separate *runtime environments*. They can't coordinate with each other at runtime because they're separated by time and space. Their module systems are completely isolated from each other, they each have their own globals, and even may be running on different JavaScript engines.
- **The boundaries between the parts are both firm and fluid at the same time.** They are firm because these truly *are* two separate environments--nothing is shared between them except the stuff that's being closed over. However, the boundaries are fluid because *you* can move stuff between the two worlds. You get to choose which lines run on which side, when you'd rather run more code on the second computer, and when you'd rather pass the already precomputed data to it.

That last point deserves some elaboration. Suppose you're writing a [FizzBuzz](https://en.wikipedia.org/wiki/Fizz_buzz) and want to display alerts for numbers from `1` to `n`, alerting `'Fizz'` if the number divides by 3, `'Buzz'` if it divides by 5, and `'FizzBuzz'` if it divides by both:

```js
function fizzBuzz() {
  const n = Number(prompt('How many?'));
  for (let i = 1; i <= n; i++) {
    if (i % 3 === 0 && i % 5 === 0) {
      alert('FizzBuzz');
    } else if (i % 3 === 0) {
      alert('Fizz');
    } else if (i % 5 === 0) {
      alert('Buzz');
    } else {
      alert(i);
    }
  }
}
````

Now imagine this is a program for *two* computers. You could split it in different ways. For example, you could choose to do all the work on the second computer:

```js
function fizzBuzz() {
  return `function resume() {
    const n = Number(prompt('How many?'));
    for (let i = 1; i <= n; i++) {
      if (i % 3 === 0 && i % 5 === 0) {
        alert('FizzBuzz');
      } else if (i % 3 === 0) {
        alert('Fizz');
      } else if (i % 5 === 0) {
        alert('Buzz');
      } else {
        alert(i);
      }
    }
  }`;
}
```

But maybe you want to run `prompt` on the first computer. You could move the `prompt` call into the earlier part, and then pass `n` as *data* to the second part:

```js {2,4}
function fizzBuzz() {
  const n = Number(prompt('How many?'));
  return `function resume() {
    const n = ${JSON.stringify(n)};
    for (let i = 1; i <= n; i++) {
      if (i % 3 === 0 && i % 5 === 0) {
        alert('FizzBuzz');
      } else if (i % 3 === 0) {
        alert('Fizz');
      } else if (i % 5 === 0) {
        alert('Buzz');
      } else {
        alert(i);
      }
    }
  }`;
}
```

From the second computer's perspective, `n` will appear hardcoded.

In fact, you could precompute every message on the first computer:

```js {3,6,8,10,12,16}
function fizzBuzz() {
  const n = Number(prompt('How many?'));
  const messages = [];
  for (let i = 1; i <= n; i++) {
    if (i % 3 === 0 && i % 5 === 0) {
      messages.push('FizzBuzz');
    } else if (i % 3 === 0) {
      messages.push('Fizz');
    } else if (i % 5 === 0) {
      messages.push('Buzz');
    } else {
      messages.push(i);
    }
  }
  return `function resume() {
    const messages = ${JSON.stringify(messages)};
    messages.forEach(alert);
  }`;
}
```

Then, from the second computer's perspective, there would be no computation left to do other than iterating over the messages. For example, if I pick `16` as my `n`, from the second computer's perspective, the entire program looks like this:

```js
function resume() {
  const messages = [1,2,"Fizz",4,"Buzz","Fizz",7,8,"Fizz","Buzz",11,"Fizz",13,14,"FizzBuzz",16];
  messages.forEach(alert);
}
```

The downside of precomputing `messages` is that the size of the data to send grows as `n` grows. Since the FizzBuzz algorithm is trivial, it's wiser to transfer the `n` itself and let the second computer run the FizzBuzz itself. The important part is that you get to *choose* the tradeoff between passing data and running code.

Now let's get back to the original example.

We've made the conceptual point that by splitting a program between two computers, we gain the flexibility to move the computation around. However, in practice, you probably don't want to write half of your code inside of a string:

```js
function greeting() {
  const name = prompt('Who are you?');
  return `function resume() {
    alert('Hello, ' + ${JSON.stringify(name)});
  }`;
}
```

Instead, it would be nice to write `resume` in another file and just *import* it:

```js {1}
import { resume } from './stuff';

function greeting() {
  const name = prompt('Who are you?');
  return resume(name);
}
```

Except wait, `resume` can't be a regular import--*you want this function's code to be sent to another computer!* So you don't really want to *import* the function itself or run any of its code on this computer now; rather, you want to *refer* to that function. This might remind you of RPC, for which you invented `import rpc`. Let's invent another similar annotation to mark a function to be sent to another computer:

```js {1}
import tag { resume } from './stuff';

function greeting() {
  const name = prompt('Who are you?');
  return resume(name);
}
```

Why `import tag`? This function is on a computer that doesn't "talk back" so you won't be able to call it. At most you can do a "potential call"--in other words, a tag!

```js {5}
import tag { resume } from './stuff';

function greeting() {
  const name = prompt('Who are you?');
  return <resume name={name} />;
}
```

(We'll revisit the `import rpc` and `import tag` syntax and revise it later on.)

Programs split this way are often called client-server applications.

```js
import tag { Client } from './stuff';

function Server() {
  const data = precomputeData();
  return <Client data={data} />;
}
```

It's tempting to see the client and the server as two separate programs that communicate with each other. But now you know that it's a single function that closes over the network by sending the rest of itself forward in time and space.

Good luck unseeing *that*.

---

### Tags on Both Sides

A few sections ago, you invented tags:

```js
function greeting() {
  return (
    <alert>
      <concat>
        Hello,
        <prompt>Who are you?</prompt>
      </concat>
    </alert>
  );
}
```

As a reminder, tags are very similar to function calls, but they don't actually *call* anything--they just reflect the structure of a call. Because of that, they're a perfect way to represent a computation that you *want* to happen--but maybe not right now, or even not right here. Tags represent a plan, a *blueprint* of a computation:

```js
function greeting() {
  return {
    fn: 'alert',
    args: [{
      fn: 'concat',
      args: ['Hello, ', {
        fn: 'prompt',
        args: ['Who are you?']
      }]
    }]
  };
}
```

By themselves, tags don't do anything. Some code needs to actually *interpret* what they're saying. Here's one way we've seen that works for the above example:

```js
function interpret(json) {
  if (json && json.fn) {
    let fn = window[json.fn];
    let args = json.args.map(arg => interpret(arg));
    let result = fn(...args);
    return interpret(result);
  } else {
    return json;
  }
}
```

You can verify in the console that copying `greeting` and `interpret` definitions and running `interpret(greeting())` produces the expected result. (Don't forget to define `window.concat = (a, b) => a + b` for this example to work.)

However, the thing about interpretations is that they're subjective. There's more than one possible interpretation of something. That's kind of the whole point of interpretations, really. They allow that sort of flexibility.

In the earlier example, the `interpret` function was looking for the functions *implementing* each tag directly in the global `window` scope. So it was able to find `window.alert` and `window.prompt` and such there. We're now going to make a slightly different version of `interpret`. This version will take an explicit `knownTags` dictionary with these functions. Unknown tags shall be skipped.

Behold:

```js {3,4,8,11}
function interpret(json, knownTags) {
  if (json && json.fn) {
    if (knownTags[json.fn]) {
      let fn = knownTags[json.fn];
      let args = json.args.map(arg => interpret(arg, knownTags));
      let result = fn(...args);
      return interpret(result, knownTags);
    } else {
      let args = json.args.map(arg => interpret(arg, knownTags));
      return { fn: json.fn, args };
    }
  } else {
    return json;
  }
}
```

Now, if you pass empty `knownTags` to `interpert`, you'll get the original call tree:

```js
interpret(greeting(), {});

// {
//   fn: 'alert',
//   args: [{
//     fn: 'concat',
//     args: ['Hello, ', {
//       fn: 'prompt',
//       args: ['Who are you?']
//     }]
//   }]
// };
```

*However,* notice what happens if you pass `{ prompt: window.prompt }`:

```js
interpret(greeting(), {
  prompt: window.prompt
});
```

Now it will ask your name first (`prompt` *does* run) and then produce this tree:

```js
// {
//   fn: 'alert',
//   args: [{
//     fn: 'concat',
//     args: ['Hello, ', 'Dan' /* (or whatever you typed) */]
//   }]
// };
```

You still get a call tree back, but this time `prompt` has "dissolved" from it!

As an experiment, let's "dissolve" both `prompt` *and* `concat` (but not `alert`):

```js
interpret(greeting(), {
  prompt: window.prompt,
  concat: (a, b) => a + b,
});
```

This time, the `prompt` will run like before, but the message prepared for the `alert` call will already be concatenated--no `concat` in sight:

```js
// {
//   fn: 'alert',
//   args: ['Hello, Dan']
// };
```

In other words, we've *precomputed* everything except the `alert` call itself.

Let's also try "dissolving" both `alert`, `prompt`, and `concat` together, like before:

```js
interpret(greeting(), {
  alert: window.alert,
  prompt: window.prompt,
  concat: (a, b) => a + b,
});

// undefined
```

This time, all steps will run so there'll be nothing left to do.

Because a blueprint of tags is *timeless*--it doesn't prescribe a particular ordering of the operations; only their structure--we've gained the freedom to manipulate that ordering. For example, we can now *split* a single computation into several steps:

```js
const step1 = greeting();
// {
//   fn: 'alert',
//   args: [{
//     fn: 'concat',
//     args: ['Hello, ', {
//       fn: 'prompt',
//       args: ['Who are you?']
//     }]
//   }]
// };

const step2 = interpret(step1, {
  prompt: window.prompt,
  concat: (a, b) => a + b,
});
// {
//   fn: 'alert',
//   args: ['Hello, Dan']
// };

interpret(step2, {
  alert: window.alert,
});
// undefined
```

This might give you an idea.

What if you ran `step1` and `step2` on different computers? In other words, what if you interpreted, or "dissolved", *some* tags earlier on the first computer, and then sent the rest to be interpreted, or "dissolved", later on the second computer? This might turn out handy if some tags are *naturally better suited* to be intepreted on either of the two sides--for example, if these machines have different capabilities.

Think of the water state transitions: first, ice melts into water at the top of the mountain. Then the river flows down. Finally, the water evaporates. So it could be with tags. Some tags could melt early on the first computer. The remaining tags could flow over the network to another computer--and meet their fate there.

---

### The Two Computers

Your theory is elusive and sometimes you think it's nonsense but its broad shape is beginning to emerge. If you were asked to summarize it so far, you'd say this:

Some programs are distributed computations across multiple machines. In particular, some programs can be represented as functions spanning across *two* machines (although in principle there could be more). Some of those functions will have a particular shape--the first machine does some of the calculation, and then "hands off" the rest of the calculation to the second machine by sending the remaining code to it. Those are the functions that your theory is so focused on.

Let's give names to the environments of the two machines. Your programs begin in the *Early* world--the first machine. Some of the work is going to happen there. Then the remaining work is passed off to the *Late* world--the second machine.

The Early and the Late worlds are two completely isolated runtime environments separated by time and space, so they don't share any state or global variables. The Early world can *leave some residual information* for the Late world--in particular, the remaining code to run and the data that it needs to run--but nothing more.

The Early and the Late worlds don't directly `import` the code from each other because that would just bring that code *into* the importing world. What they *do*, however, is *refer* to each other's code. Both `import tag` and `import rpc` are examples of *referring* to code on another computer (in a typesafe way!) and doing something useful with it without actually loading it into the importing world.

Because of their firm separation, a function in the Early world can't *call* a function in the Late world. After all, function calls are meant to pass the information *back* to the caller, but that's not possible if the caller has long kicked the bucket.

However, passing information *forward* from the Early to the Late world still makes sense. To allow it, you've invented a weaker notion than a function call--a *tag*. A tag is like a function call but passive, inert, open to interpretation. It is a *potential* function call waiting to be materialized. A tag is a function call *as* data, ready to be executed now *or* at a better point in time, or maybe not at all. A tag is a proto-call.

You stand triumphantly, seeing the disparate threads of your theory starting to come together for the first time. Suddenly, the boss music starts playing.

*Did somebody say Time?*

---

### Time Strikes Back

Your first boss is Time itself. To beat Time, you'll have to demonstrate that your so-called *timeless* blueprints are actually timeless--and that shifting the order of their calculation will not accidentally ruin your program. You better be right!

Here is your `greeting` function from before:

```js
function greeting() {
  return (
    <alert>
      <concat>
        Hello,
        <prompt>Who are you?</prompt>
      </concat>
    </alert>
  );
}
```

I'll beef it up a little bit to make the boss fight more interesting (and more scary).

I suspect that you'll want to combine `alert` with `concat` awfully often so I'll extract them into a separate function. I'm going to call it `p`, for "paragraph".

```js
function p(...children) {
  return (
    <alert>
      <concat>
        {children}
      </concat>
    </alert>
  );
}
```

Now the `greeting` function can just return the `p` tag:

```js
function greeting() {
  return (
    <p>
      Hello,
      <prompt>Who are you?</prompt>
    </p>
  );
}
```

I'll also add a new `clock` function that returns the time at which it ran:

```js
function clock() {
  return new Date().toString();
}
```

Finally, I'll add an `app` function that combines a `greeting` with a `clock` in `p`:

```js
function app() {
  return [
    <greeting />,
    <p>The time is: <clock /></p>
  ];
}
```

Now would be a great time to support arrays in `interpret`--luckily, that's easy:

```js {12,13}
function interpret(json, knownTags) {
  if (json && json.fn) {
    if (knownTags[json.fn]) {
      let fn = knownTags[json.fn];
      let args = json.args.map(arg => interpret(arg, knownTags));
      let result = fn(...args);
      return interpret(result, knownTags);
    } else {
      let args = json.args.map(arg => interpret(arg, knownTags));
      return { fn: json.fn, args };
    }
  } else if (Array.isArray(json)) {
    return json.map(item => interpret(item, knownTags));
  } else {
    return json;
  }
}
```

Alright, let's see if `interpret` is up to the task.

First, let's try to interpret all tags together:

```js
interpret(app(), {
  alert: window.alert,
  prompt: window.prompt,
  concat: (a, b) => a + b,
  p: p,
  greeting: greeting,
  clock: clock,
});
// [undefined, undefined]
```

[Running this code](https://codesandbox.io/p/devbox/r2c-part1-forked-slfzsc?file=%2Fsrc%2Findex.mjs) produces the expected result:

1. There is a `prompt` asking for my name
1. There is an alert saying `Hello, Dan`
1. There is another alert saying `The time is: Wed Apr 09 2025 15:13:04 GMT+0900 (Japan Standard Time)`

So far so good!

Now, the claim you're defending is that, because these are just blueprints--tags that are not turned into calls yet--you are free to dissolve those tags in any order.

Let's put that to the test.

First, let's dissolve just *half* of the tags (`p`, `greeting`, and `clock`):

```js {5-7}
const step2 = interpret(app(), {
  // alert: window.alert,
  // concat: (a, b) => a + b,
  // prompt: window.prompt,
  p: p,
  greeting: greeting,
  clock: clock,
});

// [
//   { fn: 'alert', args: [{ fn: 'concat', args: ['Hello', { fn: 'prompt', args: ['Who are you?'] }] }] },
//   { fn: 'alert', args: [{ fn: 'concat', args: ['The time is ', 'Wed Apr 09 2025 15:13:04 GMT+0900 (Japan Standard Time)'] }] }
// ]
```

*Snap.*

As expected, this went quietly--no prompts or alert yet... Now you can take the intermediate result and dissolve the rest of the tags (`alert`, `concat`, `prompt`):

```js {2-4}
interpret(step2, {
  alert: window.alert,
  concat: (a, b) => a + b,
  prompt: window.prompt,
  // p: p,
  // greeting: greeting,
  // clock: clock,
});
// [undefined, undefined]
```

[This works](https://codesandbox.io/p/devbox/r2c-part1-forked-vvhg65?file=%2Fsrc%2Findex.mjs) as expected too:

1. There is a `prompt` asking for my name
1. There is an alert saying `Hello, Dan`
1. There is another alert saying `The time is: Wed Apr 09 2025 15:13:04 GMT+0900 (Japan Standard Time)`

Congratulations!

You've proven that a calculation made out of tags (rather than function calls) can be split into steps and calculated in an arbitrary order--thus defeating Time itself.

Unless?..

Why don't you try dissolving all tags together *except* for `concat`:

```js {4}
interpret(app(), {
  alert: window.alert,
  prompt: window.prompt,
  // concat: (a, b) => a + b,
  p: p,
  greeting: greeting,
  clock: clock,
});
```

Surely, in a *timeless blueprint*, it won't cause any harm to run `concat` later?

You [run the code](https://codesandbox.io/p/devbox/r2c-part1-forked-zyxyyz?file=%2Fsrc%2Findex.mjs):

1. There is a `prompt` asking for my name
1. There is an alert saying `[object Object]`
1. There is another alert saying `[object Object]`

*YOU DIED.*

---

### A Fatal Flaw

What just happened?

Turns out, your theory has a flaw. Even if you describe your program with tags rather than function calls, time is actually important! For some functions, anyway.

Consider this example:

```js
<concat>
  Hello,
  <prompt>Who are you?</prompt>
</concat>
```

When two tags are nested, in which order should they be intepreted? Should `<prompt>` be interpreted first, and the result of that be passed to the `concat` function? Or should the `concat` function receive `<prompt>` *itself as a tag*?

We can start by considering the behavior of regular function calls:

```js
concat(
  'Hello, ',
  prompt('Who are you?') // This would run first
)
```

In case you're not sure, when you call a function in JavaScript, its arguments are calculated *first*--and after those values are known, the function gets called:

```js
function concat(a, b) {
  // a is 'Hello, '
  // b is 'Dan'
  return a + b;
}
```

Our `interpret` function dealing with tags applies them in the same order. When it encounters a tag like `<concat>`, it *first* runs `interpret` on its arguments in case there are nested calls like that `<prompt>`. Only *then* it would call `concat()`:

```js {5,6}
function interpret(json, knownTags) {
  if (json && json.fn) {
    if (knownTags[json.fn]) {
      let fn = knownTags[json.fn];
      let args = json.args.map(arg => interpret(arg, knownTags));
      let result = fn(...args);
      return interpret(result, knownTags);
    } else {
      // ...
    }
  } else {
    // ...
  }
}
```

As a result, this code:

```js
<concat>
  Hello,
  <prompt>Who are you?</prompt>
</concat>
```

is currently equivalent to this:

```js
concat(
  'Hello, ',
  prompt('Who are you?') // This would run first
)
```

However, there's something off about that.

Weren't our tags supposed to be *timeless blueprints*, untethered from the pesky constraints of the tedious arguments-must-go-first JavaScript evaluation order? What good are these "tags" if in the end they behave exactly like function calls?

Okay, but how *else* could this work?

Well, what if this:

```js
<concat>
  Hello,
  <prompt>Who are you?</prompt>
</concat>
```

was instead equivalent to this:

```js
concat( // This would run first
  'Hello, ',
  <prompt>Who are you?</prompt>
)
```

Imagine that tags were evaluated *outside-in* rather than *inside-out*. So, when you have `<concat>` with `<prompt />` inside, you wouldn't actually see the `prompt` call first. Instead, you'd step into `concat` with `<prompt />` still being *a tag*:

```js {3}
function concat(a, b) {
  // a is 'Hello, '
  // b is { fn: 'prompt', args: ['Who are you?'] }
  return a + b;
}
```

Of course, that would utterly break `concat` since it can only concatenate *strings*, not some arbitrary computations like `<prompt />` which haven't even run yet.

This problem is not unique to `concat`. For example, the `alert` function also expects a *string*. It wouldn't know how to handle an object representing a tag:

```js
alert({ fn: 'concat', args: [/* ... */] });
```

Or rather, it would *handle* it--by coercing it to a string like `"[object Object]"`.

This explains what happened during the boss fight!

Although our `interpret` function would normally handle the arguments first, we specifically *delayed* interpreting the `<concat>` tag to demonstrate that the ordering doesn't matter. However, it *does* matter--both the `concat` and the `alert` functions *need* their arguments to be regular strings rather than tags.

It seems like your timeless blueprints aren't so timeless after all. Functions *need* their arguments to be computed first. That's where the time was hiding.

Your theory has a fatal flaw.

---

### A New Hope

Your theory has a fatal flaw. There are three things you can do with that.

You could pretend that it doesn't exist. But that won't fix your theory.

You could give up on your theory. But you were *onto* something, weren't you?

Finally, you could let that flaw *guide* you. Like a well-chosen failed experiment, it tells you something very important. You've made a mistake, but where *exactly?*

There's a good way to find out.

Currently, we're always eagerly interpreting nested tags before calling the parent tag's function to ensure that the tag functions get called in the *inside-out* order:

```js {5,6}
function interpret(json, knownTags) {
  if (json && json.fn) {
    if (knownTags[json.fn]) {
      let fn = knownTags[json.fn];
      let args = json.args.map(arg => interpret(arg, knownTags));
      let result = fn(...args);
      return interpret(result, knownTags);
    } else {
      let args = json.args.map(arg => interpret(arg, knownTags));
      return { fn: json.fn, args };
    }
  } else if (Array.isArray(json)) {
    return json.map(item => interpret(item, knownTags));
  } else {
    return json;
  }
}
```

What if instead we just passed the raw arguments (even if they include tags)?

```js {5,6}
function interpret(json, knownTags) {
  if (json && json.fn) {
    if (knownTags[json.fn]) {
      let fn = knownTags[json.fn];
      let args = json.args;
      let result = fn(...args);
      return interpret(result, knownTags);
    } else {
      let args = json.args.map(arg => interpret(arg, knownTags));
      return { fn: json.fn, args };
    }
  } else if (Array.isArray(json)) {
    return json.map(item => interpret(item, knownTags));
  } else {
    return json;
  }
}
```

Of course, this would completely break each of our previous examples. Remember, `alert()` can't handle an object argument like `<concat>`--and `concat()` itself can't handle an object argument like `<prompt>`. It wants two strings, not tags:

```js
const tags = (
  <concat>
    Hello, <prompt>Who are you?</prompt>
  </concat>
);

interpret(tags, {
  concat: (a, b) => a + b,
  prompt: window.prompt,
});

// 'Hello, [object Object]'
```

But fully embracing the "flaw" might also shine some light on what *does* work.

For example, replacing `<concat>` with `<p>` [no longer leads](https://codesandbox.io/p/devbox/r2c-part1-forked-kw9cxj?file=%2Fsrc%2Findex.mjs) to a broken output:

```js {14,16,20}
function p(...children) {
  return (
    <alert>
      <concat>
        {children}
      </concat>
    </alert>
  );
}

// ...

const tags = (
  <p>
    Hello, <prompt>Who are you?</prompt>
  </p>
);

interpret(tags, {
  p: p,
  prompt: window.prompt,
});

// { fn: 'alert', args: [{ fn: 'concat', args: ['Hello, ', 'Dan'] }] }
```

This might seem insignificant (we still need to run `concat` later). But actually this is very important! Something is fundamentally different between functions `concat` and `p`. The *outside-in* call order breaks `concat`, but it doesn't break `p`.

Why is that *exactly*?

---

### Embedding and Introspecting

Consider these two functions:

```js
function concat(a, b) {
  return a + b;
}

function pair(a, b) {
  return [a, b];
}
```

How are they different?

Obviously, they're different in purpose. One of them concatenates strings. The other one creates an array with the two provided elements. But there's also a more subtle difference between how they behave with respect to their arguments.

To explain it, I'll use an analogy.

Suppose your job is to tie pieces of a rope together. That's not terribly difficult. You take the two pieces and tie them together, job done. Now suppose that one day someone hands you a rope and... a pumpkin. Suddenly, you can't do your job. You need to take the two pieces of rope by their ends, but a pumpkin has no end.

Now, you might conclude from this that arbitrarily replacing things with pumpkins leads to disasters, and indeed sometimes it does. But not always.

Suppose that you have a new job wrapping up presents in a toy shop. You'd spend your day wrapping up various presents, be it a doll, or a car, or an entire toy house. Then one day someone hands you a pumpkin. Although you might refuse the request out of principle, *technically* you could wrap up a pumpkin just fine. When you wrap things up, you don't rely on their properties (like the rope-iness of a rope). You merely put them in a box. You're *embedding*, not *introspecting*.

The difference between `concat` and `pair` above is that `concat` *cares* about what's being passed to it. It *introspects*. It wouldn't work if you pass a pumpkin. But `pair` would happily accept ropes, toys, or pumpkins. It *embeds*, so it doesn't care.

Let's see how this connects to the order of execution.

Since `concat` *introspects* arguments `a` and `b` (concretely, `+` turns them to strings), `concat` breaks if you pass an uninterpreted tag as an argument:

```js
concat('Hello ', <prompt>Who are you?</prompt>);
// 'Hello, [object Object]'
```

On the other hand, `pair` *embeds* its arguments `a` and `b`. It produces a new `[a, b]` array--and that works correctly no matter what you pass as `a` or `b`. So it's happy to accept a tag as one of the arguments. It just embeds that tag in its output:

```js
const todo = pair('Hello ', <prompt>Who are you?</prompt>);
// ['Hello, ', { fn: 'prompt', args: ['Who are you?'] }]
```

This lets you interpret that tag sometime *after* the `pair` call:

```js
const result = interpret(todo, { prompt: window.prompt });
// ['Hello, ', 'Dan']
```

Let's summarize.

Generally, functions want to have their arguments computed before the call. However, if a function only *embeds* an argument in its output without *introspecting* it, you can delay computing it. You can call that function with that argument still uncomputed (a tag), and compute that tag later when it's necessary or convenient.

You may have found a way to beat Time after all.

---

### Thinking and Doing

Your program is still the same:

```js
function app() {
  return [
    <greeting />,
    <p>The time is: <clock /></p>
  ];
}

function clock() {
  return new Date().toString();
}

function greeting() {
  return (
    <p>
      Hello,
      <prompt>Who are you?</prompt>
    </p>
  );
}

function p(...children) {
  return (
    <alert>
      <concat>
        {children}
      </concat>
    </alert>
  );
}

function alert(message) {
  window.alert(message);
}

function prompt(message) {
  return window.prompt(message);
}

function concat(a, b) {
  return a + b;
}
```

But your `interpret` function is simpler--it interprets tags *outside-in*. It doesn't try to interpret the arguments before the call; rather, it *passes tags to other tags*.

```js {5,6}
function interpret(json, knownTags) {
  if (json && json.fn) {
    if (knownTags[json.fn]) {
      let fn = knownTags[json.fn];
      let args = json.args;
      let result = fn(...args);
      return interpret(result, knownTags);
    } else {
      let args = json.args.map(arg => interpret(arg, knownTags));
      return { fn: json.fn, args };
    }
  } else if (Array.isArray(json)) {
    return json.map(item => interpret(item, knownTags));
  } else {
    return json;
  }
}
```

Time smirks at you.

*"This isn't going to work, is it? Functions need to know their arguments."*

"*Some* of them do."

You look over all the functions in your program to see whether they *introspect* the stuff you're nesting inside their tags or merely *embed* it without introspection:

- Clearly, `alert` and `concat` introspect the stuff you put inside their tags.
- Some functions (`app`, `clock`, and `greeting`) take no arguments at all.
- Although you *do* pass stuff into `p`, it merely embeds whatever you nest in it.
- The case of `prompt` is ambiguous. Technically, it does introspect the `message` argument (because it passes `message` to the built-in `window.prompt`). However, so far, we haven't had a temptation to nest any other tags inside `<prompt>`. So if we promise not to do that (e.g. by restricting the type somehow), it doesn't matter.

To keeps things straight, you'll introduce a new convention.

Functions that won't break when passed tags as arguments, i.e. functions that *embed* rather than *introspect* them, will now start their names with capital letters:

```js {1,3,4,8,12,14,17,21}
function App() {
  return [
    <Greeting />,
    <P>The time is: <Clock /></P>
  ];
}

function Clock() {
  return new Date().toString();
}

function Greeting() {
  return (
    <P>
      Hello,
      <prompt>Who are you?</prompt>
    </P>
  );
}

function P(...children) {
  return (
    <alert>
      <concat>
        {children}
      </concat>
    </alert>
  );
}

function alert(message) {
  window.alert(message);
}

function prompt(message) {
  return window.prompt(message);
}

function concat(a, b) {
  return a + b;
}
```

Let's give these capital letter functions a special name: Components. Components are the "brains" of our program--they figure out what needs to be done. Because they don't introspect the stuff you nest inside of them, they can run in any order, in any number of steps, together or separately. In other words, Components *are* truly timeless. They are untethered from the future because they *return* tags, and they are untethered from the past because they *accept* tags as arguments.

What about the rest of the functions, like `alert`, `prompt`, and `concat`? Let's call them Primitives. Primitives can be used as tags too, but they don't merely embed stuff--they introspect it. They *must* know all their arguments. Primitives are the "muscles" of our program--they actually *do stuff* after most of the thinking has already been done by Components. Primitives run last: *"think before you do"*.

This distinction lets you naturally slice the program in two phases.

First, you need to *think*--that is, to run the Components. Your existing `interpret` function can take care of that:

```js
const primitives = interpret(<App />, {
  App,
  Greeting,
  Clock,
  P
});

// [
//   { fn: 'alert', args: [{ fn: 'concat', args: ['Hello', { fn: 'prompt', args: ['Who are you?'] }] }] },
//   { fn: 'alert', args: [{ fn: 'concat', args: ['The time is: ', 'Wed Apr 09 2025 15:13:04 GMT+0900 (Japan Standard Time)'] }] }
// ]
```

After *thinking*, you need to *do*. The result of the "thinking" phase contains only the Primitives. Let's create a new `perform` function that'll look a lot like `interpret`, but it will handle Primitives instead of Components. Since Primitives introspect stuff and need to *know* their arguments, `perform` ensures they run inside-out:

```js {1,4-5}
function perform(json, knownTags) {
  if (json && json.fn) {
    let fn = knownTags[json.fn];
    let args = perform(json.args, knownTags);
    let result = fn(...args);
    return perform(result, knownTags);
  } else if (Array.isArray(json)) {
    return json.map(item => perform(item, knownTags));
  } else {
    return json;
  }
}
```

Notice `perform` doesn't include any code for skipping unknown tags--it assumes `knownTags` contains *all* Primitives it may encounter. This is because `perform` is intended as *the* final step and does not let you split the computation any further.

Now you can use `perform` to finish the computation:

```js
perform(primitives, {
  alert,
  concat,
  prompt
});

// undefined
```

This displays the prompt and the two expected alerts.

[Run the code.](https://codesandbox.io/p/devbox/r2c-forked-6f6jz7?file=%2Fsrc%2Findex.mjs)

So, did you beat Time?

Sort of.

Previously, `interpret` was fragile because skipping *some* tags (like `concat`) broke the ordering that was implicitly assumed by some other tags (like `alert`). But this can no longer happen. Now `interpret` *only* deals with Components, and they don't mind being run in any order (since they *embed* rather than *introspect*).

Primitives, on the other hand, are now being handled by `perform`, which always finishes the work in a single step. So the problem can't come up there either.

If you ever extend your program to span two computers, it's Components (rather than Primitives) that would be split between them. That is because Components don't mind being run in a different order. Primitives, on the other hand, would have to run together at the very end--which puts them firmly into the Late world.

If you have some control over the computers running the Late worlds, there is an interesting optimization you could make. You could *preinstall* the Primitives that you expect to be shared by all programs alongside the JavaScript runtime. Of course, such a collection of Primitives would have to be carefully curated so that it serves a broadest possible set of use cases. But you can already see some good candidates! For example, your `P` function might make more sense as a Primitive:

```js {1}
function p(...children) {
  return (
    <alert>
      <concat>
        {children}
      </concat>
    </alert>
  );
}
```

Arguably, a "paragraph" is something many programs might want to display!

If you think bigger, you might come up with a whole suite of such Primitives--some graphical (like making something `<b>bold</b>` or `<i>italic</i>`) and some behavioral (like expanding `<details></details>` or `<a />` link).

Now, if a lot of programs used the same Primitives, and everyone was building complex programs out of those, it might make sense to move their internal implementation out of JavaScript into some lower-level language like Rust or C++. Then they could be exposed to JavaScript via some higher-level APIs. Then `perform` could be rewritten to orchestrate the computation using such APIs:

```js {5-8,11}
function perform(json) {
  if (json && json.fn) {
    let tagName = json.fn;
    let children = perform(json.args);
    let node = document.createElement(tagName);
    for (let child of [children].flat().filter(Boolean))) {
      node.appendChild(child);
    }
    return node;
  } else if (typeof json === 'string') {
    return document.createTextNode(json);
  } else if (Array.isArray(json)) {
    return json.map(perform);
  } else {
    return json;
  }
}

const tree = perform(json);
document.body.appendChild(tree);
```

You could even design a declarative language *just* for the purpose of describing trees of such Primitives. It could be designed to be more forgiving than our current setup, since for some use cases it might be nice to write it by hand.

But enough talking about the Primitives. Going forward, we will assume that [a fair number of them](https://developer.mozilla.org/en-US/docs/Web/HTML/Element) exist, that they're written as lowercase tags (such as `<p>`), and that there exists a `perform` function that knows what to do with them.

Time steps aside.

You have learned to wield the power of Time--*and* to respect its laws. Now, should you wish to continue your studies, it is time for you to learn the lessons of Space.

---

## Act 2

### The Reader and the Writer

*The Reader:* That was a long article!

*The Writer:* You betcha.

*The Reader:* And we're still just halfway in?

*The Writer:* I guess.

*The Reader:* What do you mean you *guess*? Don't you know where you're going?

*The Writer:* I have a rough idea, but thruthfully, I'm pretty much winging it.

*The Reader:* Well, that's not very responsible. I've invested a lot of time into reading this. What if it doesn't build up to something satisfying? What if you drop the ball?

*The Writer:* That's been one of my worries, yes. But there's no way for me to know that until *I* finish writing. On your side, I guess you'll just have to keep on reading.

*The Reader:* Well, okay, yes, I guess I'll just have to do that.

*The Writer:* Thank you for your understanding.

*The Reader:* It's not like I have a choice anyway.

*The Writer:* Why not? You know you can just close the tab and go about your day.

*The Reader:* You know full well that I cannot do that.

*The Writer:* And why is that exactly?

*The Reader:* Well, *I'm* just one of your characters. *You're* the one making me say things. I don't exactly have much, what do you call it... *the wiggle room*.

*The Writer:* Ah. Right. *The wiggle room.*

*The Writer briefly looks at the audience. It's hard to read his expression.*

*The Reader:* ...

*The Writer:* ...

*The Reader:* You don't have many more lines prepared for me, do you?

*The Writer:* My bad. I think that's about all I could manage.

*The Reader:* ...

*The Writer:* ...

*The Reader:* Why is this dialog even here? Does it add anything to the story?

*The Writer:* I don't know. *You* tell me.

*The Reader:* I thought *you're* the one doing the writing.

*The Writer:* Sure, but aren't *you* the one doing the reading?

---

### Code and Data

In the first half of this post, we've learned how to split a computation in time.

It turned out that some parts of the computation--the Primitives that are actively *doing* stuff--don't like to be split apart and would like to execute together. Other parts of the computation--the Components that are *thinking* about stuff--can be executed at different times, in a different order, and maybe even in different *places*.

We will now set aside Components and Primitives for a moment.

Let us investigate the difference between splitting a function *in time* and *in space*. We've seen earlier that to split a function across time, it's enough to add nesting:

```js {3,5}
function greeting() {
  const name = prompt('Who are you?');
  return function resume() {
    alert('Hello, ' + name);
  };
}
```

This lets you run it in steps rather than all at once.

```js
const resume = greeting(); // Run the first step
resume();                  // Run the second step
```

The return value of the `greeting` is a function--but that's not the whole picture. It is crucial that this function is nested *inside* `greeting`, for otherwise it would not be able to read the `name` variable. In other words, `greeting` returns both a piece of code (the `alert` call) *and* a piece of data (the `name` variable) needed by it.

This becomes more apparent if you extract `resume` into a top-level function. Now it would have to take `name` as an explicit argument:

```js {1}
function resume(name) {
  alert('Hello, ' + name);
}
```

How would we adjust the `greeting` to accommodate that? We could make it return a nested function that would provide `name` to `resume`:

```js {3}
function greeting() {
  const name = prompt('Who are you?');
  return () => resume(name);
}

function resume(name) {
  alert('Hello, ' + name);
}

const resume = greeting(); // Run the first step
resume();                  // Run the second step
```

But we could also go a bit further. Conceptually, `() => resume(name)` combines two pieces of information: *code* (`resume`) and *data* (`name`). We could make this relationship explicit by returning `[resume, name]`--code *paired* with data:

```js {3,10-11}
function greeting() {
  const name = prompt('Who are you?');
  return [resume, name];
}

function resume(name) {
  alert('Hello, ' + name);
}

const [code, data] = greeting(); // Run the first step
code(data);                      // Run the second step
```

In fact, this looks remarkably similar to the object notation that we currently use for *tags*, except that the `fn` function is an *actual function* rather than a string:

```js {3,10-11}
function greeting() {
  const name = prompt('Who are you?');
  return { fn: resume, args: [name] };
}

function resume(name) {
  alert('Hello, ' + name);
}

const { fn, args } = greeting(); // Run the first step
fn(...args);                     // Run the second step
```

It's almost like `greeting` is returning a *tag* rather than a function call. It expresses *the code it wants to run next* but it doesn't actually *do* that yet.

This gives us a new perspective for what tags really are. Yes, a tag is a potential function call. But another way to see it is that *a tag is a pairing of code and data.*

---

### Time and Space

Now let us recall how to split a computation across space. We've previously discovered one possible pattern for doing so--returning a piece of code as a string:

```js {3-5}
function greeting() {
  const name = prompt('Who are you?');
  return `function resume() {
    alert('Hello, ' + ${JSON.stringify(name)});
  }`;
}

const code = greeting();
```

Then you could call `greeting()`, save the `code` it returns, and run it *as code* on another computer. The second computer will think *this* is the entire program:

```js
function resume() {
  alert('Hello, ' + "Dan");
}
```

But *you* know that the real program includes both pieces.

Currently, `greeting` returns a string of code. However, it would be perfectly appropriate to think of it as returning both code *and* data. We just happen to be interpolating the data (the `name` variable) directly into that string of code.

This becomes more apparent if we move the `resume` code outside of `greeting`:

```js {1-5,9,12-13}
const RESUME_CODE = `
  function resume(name) {
    alert('Hello, ' + name);
  }
`;

function greeting() {
  const name = prompt('Who are you?');
  return [RESUME_CODE, name];
}

const [code, data] = greeting();
const jsonString = JSON.stringify([code, data]);
```

Now that `resume` takes `name` as an argument, the `greeting` needs to return *both* the code of the `resume` function *and* the data it needs (`name`). Then we could take `[code, data]`, turn it to JSON with `JSON.stringify`, then `JSON.parse` it on another computer, and finally call `code(...data)` to finish the program.

Of course, when we write our program, we don't really want to think about the code of `resume` as a *string*. We want to think of it as a normal piece of code which is written at the top level, has syntax highlighting, can be typechecked, and so on:

<Client>

```js
function resume(name) {
  alert('Hello, ' + name);
}
```

</Client>

But how do we *connect* this piece of code to the `greeting` function?

<Server>

```js
function greeting() {
  const name = prompt('Who are you?');
  return [RESUME_CODE, name];
}
```

</Server>

It's like these functions exist in two different *worlds*--one existing "outside" of the string of code that's about to be sent, and the other one existing "inside" of it. It's like `greeting` is writing a story, and `resume` is someone *inside* of that story.

There is a clear logical continuity between them, but they're separated by a gap much wider than defined being in different files. When the `greeting` function runs, `resume` is merely a string--more like a plan or an idea than an actual function. On the other hand, when `resume` finally runs, it has no knowledge of `greeting` having ever existed--all it receives is the `name` passed down to it.

<Server>

```js
function greeting() {
  const name = prompt('Who are you?');
  return [RESUME_CODE, name];
}
```

</Server>

<Client>

```js
function resume(name) {
  alert('Hello, ' + name);
}
```

</Client>

If you squint at it, you can still make out the "true" shape of the program:

```js
function greeting() {
  const name = prompt('Who are you?');
  return `function resume() {
    alert('Hello, ' + ${JSON.stringify(name)});
  }`;
}
```

But this "split" way of looking at it is fairer to both worlds. It doesn't prioritize one over the other. Both of them *are* our program, they're just split by time and space:

<Server>

```js
function greeting() {
  const name = prompt('Who are you?');
  return [RESUME_CODE, name];
}
```

</Server>

<Client>

```js
function resume(name) {
  alert('Hello, ' + name);
}
```

</Client>

The question is, how do we tie them together?

---

### The Two Worlds

The simplest way to tie the two worlds together would be by giving each function in the Late world a unique name that lets us refer to it from the Early world.

For example, we could assume we'll only ever need one function called `resume`:

<Server>

```js {3}
function greeting() {
  const name = prompt('Who are you?');
  return ['resume', name];
}
```

</Server>

<Client glued>

```js {1}
window['resume'] = function resume(name) {
  alert('Hello, ' + name);
}
```

</Client>

Although this is a bit clunky, it *does* create an explicit (if fragile) connection. If we ever go about renaming `resume` in the Late world, we might remember to search the codebase for any other code might be referring to it, and we might find the `greeting` in the Early world. We could even add types for `window['resume']`.

This solution isn't *that* bad. In fact, it's similar to what's happening under the hood when *you* refer to any of the Primitives built into the browser. You're not directly importing them from anywhere; you just use a global name like `p`:

<Server>

```js {3}
function Greeting() {
  const name = prompt('Who are you?');
  return <p>Hello, {name}</p>;
}
```

</Server>

<Client glued>

```js {3}
document.createElement = function(tagName) {
  switch (tagName) {
    case 'p':
    // ...
  }
}
```

</Client>

In that sense, the browser internals are their own sort of a "Late" world. A large part of them is written in a different language than JavaScript and not directly exposed to your program. Much of the logic associated with a primitive like `p`--including applying styles, laying out text, drawing, compositing, painting, and so on--will run at some point *after* your `document.createElement('p')` call. In that sense, `<p>` really is a *tag*--a call that still requires some future "carrying out".

But let's not get distracted. Browser Primitives can afford to have global names because there's a limited list of them, you need to be able to look them up, and they are always the same between the projects. On the other hand, if you define functions yourself, you probably want more explicit connections between them.

Let us come back to the pieces you want to connect:

<Server>

```js
function greeting() {
  const name = prompt('Who are you?');
  return [RESUME_CODE, name];
}
```

</Server>

<Client>

```js
function resume(name) {
  alert('Hello, ' + name);
}
```

</Client>

An obvious first step would be to mark the `resume` function for `export`. You want the code in your other files to be able to refer to it. It's not an implementation detail that can be freely removed. You don't want it to appear like dead code!


<Server>

```js
function greeting() {
  const name = prompt('Who are you?');
  return [RESUME_CODE, name];
}
```

</Server>

<Client>

```js {1}
export function resume(name) {
  alert('Hello, ' + name);
}
```

</Client>

Now that you `export`ed it, the next logical step would be to `import` it here:

<Server>

```js {1}
import { resume } from './resume';

function greeting() {
  const name = prompt('Who are you?');
  return [RESUME_CODE, name];
}
```

</Server>

<Client>

```js
export function resume(name) {
  alert('Hello, ' + name);
}
```

</Client>

Except wait.

This doesn't help you!

What you want to obtain is `RESUME_CODE`, which is this thing from earlier:

```js
const RESUME_CODE = `
  function resume(name) {
    alert('Hello, ' + name);
  }
`;
```

But what you *got* by importing `resume` is this other thing:

```js
function resume(name) {
  alert('Hello, ' + name);
}
```

*You've lost the backticks!*

---

### Mind the Gap

Let us thoroughly convince ourselves that using an `import` would not work.

Ultimately, what we're trying to do is to *modularize* this pattern:

```js
function greeting() {
  const name = prompt('Who are you?');
  return `function resume() {
    alert('Hello, ' + ${JSON.stringify(name)});
  }`;
}
```

To do that, we've split the `greeting` and the `resume` functions in two different worlds--but as a result, we've lost the syntactic connection between them.

Suppose that we try to bridge "the gap" between the worlds with an `import`:

<Server>

```js {1}
import { resume } from './resume';

function greeting() {
  const name = prompt('Who are you?');
  return [resume, name];
}
```

</Server>

<Client>

```js
export function resume(name) {
  alert('Hello, ' + name);
}
```

</Client>

Unfortunately, unless we change something about how `import` works, this would essentially just "bring" the `resume` function *itself* into the `greeting`'s world:

<Server>

```js {1-3}
function resume(name) {
  alert('Hello ', + name);
}

function greeting() {
  const name = prompt('Who are you?');
  return [resume, name];
}
```

</Server>

<Client>

```js
export function resume(name) {
  alert('Hello, ' + name);
}
```

</Client>

In other words, the overall shape of the program would look like kind of this:

```js {3-5}
function greeting() {
  const name = prompt('Who are you?');
  return function resume() {
    alert('Hello, ' + name);
  };
}
```

But the overall shape that we *need* looks kind of like this:

```js {3-5}
function greeting() {
  const name = prompt('Who are you?');
  return `function resume() {
    alert('Hello, ' + ${JSON.stringify(name)});
  }`;
}
```

It's all about the backticks!

When we `import` something, we bring that code into the importing world. But what we *want* here is to merely *refer* to that code without executing any of it. We wanted `greeting` to return a *story* about a pumpkin--not an actual pumpkin.

The problem with `import` becomes more apparent if you imagine that `resume` *itself* imports some third-party library--for example, to display a toast:

<Server>

```js
import { resume } from './resume';

function greeting() {
  const name = prompt('Who are you?');
  return [resume, name];
}
```

</Server>

<Client>

```js {1,4}
import { showToast } from 'toast-library';

export function resume(name) {
  showToast('Hello, ' + name);
}
```

</Client>

With a plain `import`, our entire program would have a shape equivalent to this:

```js {1-4,9}
// From toast-library
function initializeToastLibrary() { /* ... */ }
function showToast(message) { /* ... */ }
initializeToastLibrary();

function greeting() {
  const name = prompt('Who are you?');
  return function resume() {
    showToast('Hello, ' + name);
  };
}
```

However, the shape that we *want* is closer to something like this:

```js {4-7,10}
function greeting() {
  const name = prompt('Who are you?');
  return `
    // From toast-library
    function initializeToastLibrary() { /* ... */ }
    function showToast(message) { /* ... */ }
    initializeToastLibrary();

    function resume() {
      showToast('Hello, ' + name);
    }
  `;
}
```

The boundaries between the worlds are firm, as they *should* be. We want each world to behave consistently within itself--at least for any already existing code.

To ensure that, imports from the Early world *should* become a part of the Early world. Imports from the Late world *should* become a part of the Late world. On its own, each world should behave like its own isolated program--no funny stuff.

We don't want to break that consistency.

All we need is a *door*.

---

### A Door

We need a way to say: "I want to refer to this thing in another file, but I don't actually want to execute or even load any of its code. Just give me something that will let me programmatically find the code for that thing later." Luckily, all of this is completely made up, so we can just make up some made-up syntax for that.

*Tada!*

<Server>

```js {1}
import tag { resume } from './resume';

function greeting() {
  const name = prompt('Who are you?');
  return [resume, name];
}
```

</Server>

<Client glued>

```js
import { showToast } from 'toast-library';

export function resume(name) {
  showToast('Hello, ' + name);
}
```

</Client>

What, *just like that*?

Sure, why not.

Okay, but what does this syntax *do*?

Well, for starters, let's imagine that it just returns the source code of the function. That would let us send that code to the other computer, as we originally intended:

```js {1,10}
import tag { resume } from './resume';

function greeting() {
  const name = prompt('Who are you?');
  return [resume, name];
}

const [code, data] = greeting();
// [
//   'function resume(name) { showToast("Hello, " + name); }',
//   'Dan'
// ]
```

However, this actually isn't terribly useful--notice that `showToast` is nowhere to be found. We don't really want the source code of *the `resume` function alone*, we want *whatever's necessary for another computer to be able to load and run `resume`*.

Here's a second idea.

Why don't we have it return some kind of identifier that's uniquely designed for addressing code. For example, it could combine the filename and the export name:

```js {1,10}
import tag { resume } from './resume';

function greeting() {
  const name = prompt('Who are you?');
  return [resume, name];
}

const [code, data] = greeting();
// [
//   '/src/stuff/resume.js#resume',
//   'Dan'
// ]
```

Now, this means that the format would have to be somewhat aware of *how* the other computer loads and executes code. For example, if the other computer runs a Node.js process, it could `import()` that file from the filesystem--provided that it'll be deployed to the other computer. If the other computer runs a web browser, it could `import()` that file over HTTP from a server that would have to serve it.

In the case of a web browser, it might not be very efficient to import remote files one by one and to rely on the browser's module system to download each of their dependencies. Instead, it might make sense to use an automated *bundler* (which would combine such code into chunks) and to use a bundler-specific identifier:

```js {1,10}
import tag { resume } from './resume';

function greeting() {
  const name = prompt('Who are you?');
  return [resume, name];
}

const [code, data] = greeting();
// [
//   'chunk123#module456#resume',
//   'Dan'
// ]
```

In the simplest possible case, if *all* of the code destined for the Late world were ultimately assembled into a giant single file that gets sent to the other computer over the wire, this identifier could just be the referenced function's global name:

```js {1,10}
import tag { resume } from './resume';

function greeting() {
  const name = prompt('Who are you?');
  return [resume, name];
}

const [code, data] = greeting();
// [
//   'window.resume',
//   'Dan'
// ]
```

What matters is that we now have a syntax for some code from the Early world to *refer* to some code from the Late world. It is a *door* between the two environments.

It lets us achieve something like this:

```js
function greeting() {
  const name = prompt('Who are you?');
  return `
    import { showToast } from 'toast-library';

    function resume() {
      showToast('Hello, ' + name);
    }
  `;
}
```

by writing something like this:

<Server>

```js
import tag { resume } from './resume';

function greeting() {
  const name = prompt('Who are you?');
  return [resume, name];
}
```

</Server>

<Client glued>

```js
import { showToast } from 'toast-library';

export function resume(name) {
  showToast('Hello, ' + name);
}
```

</Client>

It lets us write a single program spanning two programming environments.

---

### Spring Cleaning

We've found a *door* between the two worlds--the Early and the Late worlds. This door, `import tag`, will let us split the computation across both time *and* space.

Before we can use this door though, we need to clean up our house. We're going to make some tweaks to our tag syntax to make it nicer for writing Components. (If you're familiar with React, you'll recognize them as bringing us closer to JSX.)

Consider this example:

```js
function App() {
  return (
    <div>
      <Greeting />
      <p>The time is: <Clock /></p>
    </div>
  );
}
```

So far, we've assumed this syntax produces an object tree like this:

```js
function App() {
  return {
    fn: 'div',
    args: [
      { fn: 'Greeting', args: [] },
      {
        fn: 'p',
        args: ['The time is: ', { fn: 'Clock', args: [] }]
      }
    ]
  };
}
```

That's all jolly well but it doesn't leave us a way to pass named attributes like `<p className="text-purple-500">`. We're going to tweak the convention so that instead of positional `args`, both the Components and the Primitives will receive a single object with *named* arguments. We'll call this object `props` for "properties". The nested tags will move to a prop called `children` inside of that object.

```js {9-12}
function App() {
  return {
    type: 'div',
    props: {
      children: [
        { type: 'Greeting', props: {} },
        {
          type: 'p',
          props: {
            className: 'text-purple-500',
            children: ['The time is: ', { type: 'Clock', props: {} }]
          }
        }
      ]
    }
  };
}
```

I've taken the liberty of renaming `fn` to `type`. Now that the Primitives like `<p>` are handled behind the scenes by `document.createElement('p')` (whatever that is) rather than our own function `p()`, it's misleading to call `p` a "function".

We'll need to adjust `interpret` to deal with the changes. If you don't remember what it looked like, don't worry--it's been a while. Here's the important part:

```js {4-6}
function interpret(json, knownTags) {
  if (json && json.type) {
    if (knownTags[json.type]) {
      let Component = knownTags[json.type];
      let props = json.props;
      let result = Component(props);
      return interpret(result, knownTags);
    } else {
      let children = json.props.children?.map(arg => interpret(arg, knownTags));
      let props = { ...json.props, children };
      return { type: json.type, props };
    }
  } else if (Array.isArray(json)) {
    return json.map(item => interpret(item, knownTags));
  } else {
    return json;
  }
}
```

We'll also tweak `perform`, with some new logic to apply props like `className`:

```js {5-6,11-14}
function perform(json) {
  if (json && json.type) {
    let tagName = json.type;
    let node = document.createElement(tagName);
    for (let [propKey, propValue] of Object.entries(json.props)) {
      if (propKey === 'children') {
        let children = perform(propValue);
        for (let child of [children].flat().filter(Boolean)) {
          node.appendChild(child);
        }
      } else {
        node[propKey] = propValue;
      }
    }
    return node;
  } else if (typeof json === 'string') {
    return document.createTextNode(json);
  } else if (Array.isArray(json)) {
    return json.map(perform);
  } else {
    return json;
  }
}
```

Now `<p className="text-purple-500">` will work!

---

### More Spring Cleaning

We're at a good point to make another quality-of-life change.

Recall that right now, to convert a tree of Components to a tree of Primitives, you have to pass all known Components as a dictionary to the `interpret` function:

```js {23-25}
function App() {
  return (
    <div>
      <Greeting />
      <p>The time is: <Clock /></p>
    </div>
  );
}

function Greeting() {
  return (
    <p>
      Hello, <input placeholder="Who are you?" />
    </p>
  );
}

function Clock() {
  return new Date().toString();
}

const primitives = interpret(<App />, {
  App,
  Greeting,
  Clock
});
```

This, however, feels pretty silly. When we write `<Greeting />`, the `Greeting` function is already in scope. And even if it weren't, we'd *want* to import it into scope to make the connection explicit. So if the `Greeting` function is already in scope, why can't the `<Greeting />` syntax "remember" which `Greeting` it was?

We can fix this by adopting a new convention. If the tag is lowercase, like `<div>`, we'll leave its `type` be a string like `'div'` in the object representation of the tag. But if the tag starts with a capital letter, like `<Greeting />`, we'll change its `type` to be *the `Greeting` function itself* rather than a `'Greeting'` string:

```js {6,12}
function App() {
  return {
    type: 'div', // Primitive (string)
    props: {
      children: [
        { type: Greeting, props: {} }, // Component (function)
        {
          type: 'p', // Primitive (string)
          props: {
            children: [
              'The time is: ',
              { type: Clock, props: {} } // Component (function)
            ],
          }
        }
      ]
    }
  };
}
```

Conveniently, we've already been starting Component names with capital letters to differentiate them from the Primitives, so we don't need to rename anything.

This lets us simplify the `interpret` function. Instead of carrying a dictionary of `knownTags` around, it will simply check `typeof json.type`. If `json.type` is a function, *that function itself* is the Component. Otherwise, it must be a Primitive:

```js {3,4}
function interpret(json) {
  if (json && json.type) {
    if (typeof json.type === 'function') {
      let Component = json.type;
      let props = json.props;
      let result = Component(props);
      return interpret(result);
    } else {
      let children = json.props.children?.map(interpret);
      let props = { ...json.props, children };
      return { type: json.type, props };
    }
  } else if (Array.isArray(json)) {
    return json.map(interpret);
  } else {
    return json;
  }
}
```

Now we can just call `interpret` without passing any extra information to it:

```js
const primitives = interpret(<App />);
// {
//   type: 'div',
//   props: {
//     children: [{
//       type: 'p',
//       props: {
//         children: [
//           'Hello, ',
//           { type: 'input', props: { placeholder: 'Who are you?' } }
//         ]
//       }
//     }, {
//       type: 'p',
//       props: {
//         children: ['The time is ', 'Wed Apr 09 2025 15:13:04 GMT+0900 (Japan Standard Time)']
//       }
//     }]
//   }
// }
```

The `interpret` function would "dissolve" all of our Components outside-in, leaving behind only the Primitives. Then the `perform` function would "dissolve" all of the Primitives inside-out, creating the end result--a browser DOM tree:

```js
const tree = perform(primitives);
// [HTMLDivElement]
document.body.appendChild(tree);
```

The boss music starts playing.

Meet *Space.*

---

### Early and Late Components

Here is your entire Component tree:

```js
export function App() {
  return (
    <div>
      <Greeting />
      <p>The time is: <Clock /></p>
    </div>
  );
}

function Greeting() {
  return (
    <p>
      Hello, <input placeholder="Who are you?" />
    </p>
  );
}

function Clock() {
  return new Date().toString();
}
```

To beat Space, you must split this computation between two different computers.

In particular, `App` and `Greeting` should run on the first machine, but the `Clock` Component should run on the second machine. These two computations should be seamlessly combined and turned into a browser DOM tree on the second computer. You should not modify any code within the Component functions.

Let's figure it out step by step.

The first thing you'll want to do is move `Clock` into a different file and `export` it:

```js {1}
export function Clock() {
  return new Date().toString();
}
```

You can now import it from the main file:

```js {1}
import { Clock } from './Clock';

export function App() {
  return (
    <div>
      <Greeting />
      <p>The time is: <Clock /></p>
    </div>
  );
}

function Greeting() {
  return (
    <p>
      Hello, <input placeholder="Who are you?" />
    </p>
  );
}
```

Except wait, this doesn't split the code between the two computers. You're going to need to *open a door* for that by changing `import` to `import tag`. You open the door from the Early world, immediately *manifesting the Late world into existence:*

<Server>

```js {1}
import tag { Clock } from './Clock';

export function App() {
  return (
    <div>
      <Greeting />
      <p>The time is: <Clock /></p>
    </div>
  );
}

function Greeting() {
  return (
    <p>
      Hello, <input placeholder="Who are you?" />
    </p>
  );
}
```

</Server>

<Client glued>

```js
export function Clock() {
  return new Date().toString();
}
```

</Client>

If you inspect the tags that the `App` Component returns, you'll notice that the `<Clock />` tag has turned into something peculiar:

```js {12-15}
{
  type: 'div', // Primitive (a string)
  props: {
    children: [{
      type: Greeting, // Component (a function)
      props: {}
    }, {
      type: 'p',
      props: {
        children: [
          'The time is ',
          {
            type: '/src/Clock.js#Clock', // What is this?
            props: {}
          }
        ]
      }
    }]
  }
}
```

By our latest convention, tags starting with a capital letter would use the corresponding value in scope for the `type`--for example, `<Greeting />` turns into `{ type: Greeting, props: {} }` where `Greeting` is a function.

The same is true for `<Clock />`. The `Clock` starts with a capital letter so we get `{ type: Clock, props: {} }`. However, `Clock` is not a regular `import` but `import tag`, which we previously defined to mean a different thing from a regular `import`. Instead of giving us the `Clock` *function*, it gives us a kind of a *reference*--an identifier that would later let us load the `Clock` source code from another computer. That's what this `'/src/Clock.js#Clock'` string is.

This is a good time to introduce some terminology:

- **Early Components** are Components that execute in the Early world. In this example, `App` and `Greeting` are Early Components.
- **Late Components** are Components sent to finish the job in the Late world. In this example, `Clock` will be the only Late Component.

You'll want to dissolve the Early Components first. That will give you the code for the Late world and the data for that code. You'll construct the Late world *from* that code, and dissolve the Late Components there. *That* will give you the Primitives.

Sounds like a plan.

Let us run `interpret(<App />)` in the Early world and inspect the result. Notice how all the Early Components (`App` and `Greeting`) dissolved from the output:

```js
{
  type: 'div',
  props: {
    children: [{
      type: 'p',
      props: {
        children: [
          'Hello, ',
          { type: 'input', props: { placeholder: 'Who are you?' } }
        ]
      }
    }, {
      type: 'p',
      props: {
        children: [
          'The time is ',
          {
            type: '/src/Clock.js#Clock',
            props: {}
          }
        ]
      }
    }]
  }
}
```

All that is left are Primitives (`'div'`, `'p'`, `'input'`) and... Late Components (here, only `'/src/Clock.js#Clock'`). We didn't have to do anything special for Late Components--since they're not functions, `interpret` does not attempt to execute them and leaves them in place, similar to how it does with the Primitives:

```js {8-12}
function interpret(json) {
  if (json && json.type) {
    if (typeof json.type === 'function') {
      let Component = json.type;
      let props = json.props;
      let result = Component(props);
      return interpret(result);
    } else {
      let children = json.props.children?.map(interpret);
      let props = { ...json.props, children };
      return { type: json.type, props };
    }
  } else if (Array.isArray(json)) {
    return json.map(interpret);
  } else {
    return json;
  }
}
```

Since the result of `interpret` does not contain any functions, it can be easily turned into a string that can then be sent over the network:

```js
const lateComponents = intepret(<App />);
const jsonString = JSON.stringify(lateComponents);
```

Later, on another computer, you can turn this string back into an object. You might be tempted to immediately pass it to `perform` to create the DOM tree:

```js
const lateComponents = JSON.parse(jsonString);
const tree = perform(lateComponents);
```

However, this would give you an error:

```js {4-6}
function perform(json) {
  if (json && json.type) {
    let tagName = json.type;
    // 🔴 Failed to execute 'createElement' on 'Document':
    // The tag name provided ('/src/Clock.js#Clock') is not a valid name.
    let node = document.createElement(tagName);
    // ...
    return node;
  } else {
    // ...
  }
}
```

Right--`perform` only deals with the Primitives, but `Clock` is a Late Component. You've dissolved Early Components (`App`, `Greeting`) in the Early world. Now you're in the Late world, so it's time to dissolve the Late Components (`Clock`).

You're trying to call `interpret` to dissolve the remaining Components:

```js {2}
const lateComponents = JSON.parse(jsonString);
const primitives = interpret(lateComponents);
```

But nothing happens. The `'/src/Clock.js#Clock'` tag is still there.

*Space smirks.*

Ah right, `interpret` would only attempt to execute *functions:*

```js {3-6}
function interpret(json) {
  if (json && json.type) {
    if (typeof json.type === 'function') {
      let Component = json.type;
      let props = json.props;
      let result = Component(props);
      return interpret(result);
    } else {
      let children = json.props.children?.map(interpret);
      let props = { ...json.props, children };
      return { type: json.type, props };
    }
  } else if (Array.isArray(json)) {
    return json.map(interpret);
  } else {
    return json;
  }
}
```

But what you have is just a *reference*, an address that tells you where to *get* the `Clock` function. You still need to actually load it on this computer.

*Space hands you this:*

```js
async function loadReference(lateReference) {
  // Pretend it was loaded over the network or from the bundler cache.
  await new Promise(resolve => setTimeout(resolve, 3000));
  if (lateReference === '/src/Clock.js#Clock') {
    return Clock;
  } else {
    throw Error('Module not found.');
  }
}
```

Okay, suppose you're given a function that does this for you. Maybe it's provided by the environment, or by the kind-hearted people working on bundlers. You can hand it `'/src/Clock.js#Clock'`, and it will asynchronously load the `Clock`:

```js
await loadReference('/src/Clock.js#Clock');
// function Clock(){}
```

This was the last piece necessary to complete the puzzle.

Whenever your `JSON.parse` function encounters something that looks like a reference, pass it to `loadReference()` and hang onto each such Promise:

```js
const pendingPromises = [];
const lateComponents = JSON.parse(jsonString, (key, value) => {
  if (typeof value?.type === 'string' && value.type.includes('#')) {
    // The `value.type` is a reference, but we want a function.
    // Start loading that function.
    const promise = loadReference(value.type).then(fn => {
      // When the function loads, replace it directly in the parsed JSON.
      value.type = fn;
    });
    // Keep track of when that happens.
    pendingPromises.push(promise);
  }
  return value;
});

// Wait for all references to load.
await Promise.all(pendingPromises);
```

After this manipulation, the `lateComponents` object will look like this:

```js {18}
{
  type: 'div',
  props: {
    children: [{
      type: 'p',
      props: {
        children: [
          'Hello, ',
          { type: 'input', props: { placeholder: 'Who are you?' } }
        ]
      }
    }, {
      type: 'p',
      props: {
        children: [
          'The time is ',
          {
            type: Clock, // The loaded function!
            props: {}
          }
        ]
      }
    }]
  }
}
```

It's just Late Components and Primitives--all references have been loaded.

Now you can finally pass it to `interpret`, executing the `Clock`. That will give you a tree of Primitives which you can turn into the DOM with `perform`:

```js
const primitives = interpret(lateComponents);
const tree = perform(json);
document.body.appendChild(tree);
```

And with that, you're done!

Let's take another look at the full picture and recap how it works.

In the Early world, you dissolve all the Early Components with `interpret`. This gives you a string that represents how to finish the computation in the Late world:

```js
const lateComponents = intepret(<App />);
const jsonString = JSON.stringify(lateComponents);
```

In the Late world, you parse that string, load the references, and then dissolve the Late Components with `interpret`. That leaves you with a tree of Primitives:

```js
const pendingPromises = [];
const lateComponents = JSON.parse(jsonString, (key, value) => {
  if (typeof value?.type === 'string' && value.type.includes('#')) {
    const promise = loadReference(value.type).then(fn => {
      value.type = fn;
    });
    pendingPromises.push(promise);
  }
  return value;
});

await Promise.all(pendingPromises);
const primitives = interpret(lateComponents);
```

Finally, those Primitives are ready to be turned into DOM or some other format:

```js
const tree = perform(json);
document.body.appendChild(tree);
```

Congratulations!

You've split a computation across both time and space.

---

### The Donut

Space folds before you, finally recognizing you as an equal.

*"You've done well."*

But it doesn't get out of your way. Instead, Space continues folding, twisting itself into a strange shape--forward, then inside out, forming a wormhole in the middle.

It kind of looks like a donut.

An all-encompassing, beautiful, terrifying donut.

*"But you're not done yet."*

Wait... You've heard that voice before.

Could that be...

*"Time?"*

A second health bar appears.

---

### Composition

Here is your program:

<Server>

```js
import tag { Clock } from './Clock';

export function App() {
  return (
    <div>
      <Greeting />
      <p>
        The time is: <Clock />
      </p>
    </div>
  );
}

function Greeting() {
  return (
    <p>
      Hello, <input placeholder="Who are you?" />
    </p>
  );
}
```

</Server>

<Client glued>

```js
export function Clock() {
  return new Date().toString();
}
```

</Client>

To beat Spacetime, change it so that the `Clock` displays the time from the Early world, but the color of the `<p>` around the `<Clock>` is decided by the Late world.

The first part is easy.

To make the `Clock` show time from the Early world, it's enough to lift it back up:

<Server>

```js {20-23}
export function App() {
  return (
    <div>
      <Greeting />
      <p>
        The time is: <Clock />
      </p>
    </div>
  );
}

function Greeting() {
  return (
    <p>
      Hello, <input placeholder="Who are you?" />
    </p>
  );
}

function Clock() {
  return new Date().toString();
}
```

</Server>

<Client glued>

```js
```

</Client>

Now you need to specify the `<p>` color. Suppose that the `perform` function already knows how to handle the `style` prop and you could specify it like this:

```js {1-3}
<p style={{
  color: prompt('Pick a color:')
}}>
  <Clock />
</p>
```

That's great, but Spacetime says `prompt` only exists in the Late world. Right now the `App` Component is defined in the Early world where `prompt` does not exist:

<Server>

```js {6-7}
export function App() {
  return (
    <div>
      <Greeting />
      <p style={{
        // 🔴 ReferenceError: prompt is not defined.
        color: prompt('Pick a color:')
      }}>
        <Clock />
      </p>
    </div>
  );
}

function Greeting() {
  return (
    <p>
      Hello, <input placeholder="Who are you?" />
    </p>
  );
}

function Clock() {
  return new Date().toString();
}
```

</Server>

<Client glued>

```js
```

</Client>

Maybe you could move the `App` Component itself into the Late world? This fixes the `prompt` but neither `Greeting` nor `Clock` are available in the Late world:

<Server>

```js
function Greeting() {
  return (
    <p>
      Hello, <input placeholder="Who are you?" />
    </p>
  );
}

function Clock() {
  return new Date().toString();
}
```

</Server>

<Client glued>

```js {2-3,6,10}
export function App() {
  // 🔴 ReferenceError: Greeting is not defined
  // 🔴 ReferenceError: Clock is not defined
  return (
    <div>
      <Greeting />
      <p style={{
        color: prompt('Pick a color:')
      }}>
        <Clock />
      </p>
    </div>
  );
}
```

</Client>

Maybe you could move the `Greeting` and the `Clock` down as well?

<Server>

```js
```

</Server>

<Client glued>

```js {14-24}
export function App() {
  return (
    <div>
      <Greeting />
      <p style={{
        color: prompt('Pick a color:')
      }}>
        <Clock />
      </p>
    </div>
  );
}

function Greeting() {
  return (
    <p>
      Hello, <input placeholder="Who are you?" />
    </p>
  );
}

function Clock() {
  return new Date().toString();
}
```

</Client>

Wait, but you wanted `Clock` to show the time from the Early world. You can't move it down. This is turning out to be a bit of a headscratcher...

Maybe you could keep the `App` in the Late world, but refer to `Greeting` and `Clock` in the Early world using `import tag`? Let's try that:

<Server>

```js
export function Greeting() {
  return (
    <p>
      Hello, <input placeholder="Who are you?" />
    </p>
  );
}

export function Clock() {
  return new Date().toString();
}
```

</Server>

<Client glued>

```js {1-2}
// 🔴 Cannot import an Early tag from a Late module.
import tag { Clock, Greeting } from './early';

export function App() {
  return (
    <div>
      <Greeting />
      <p style={{
        color: prompt('Pick a color:')
      }}>
        <Clock />
      </p>
    </div>
  );
}
```

</Client>

Nah, this doesn't make sense. It doesn't make sense for the same reason that a function *inside* of the backticks cannot call a function *outside* the backticks:

```js {2-4,8-9}
function greeting() {
  function showToast() {
    /* ... */
  }

  return `function resume() {
    const name = prompt('Who are you?');
    // 🔴 ReferenceError: showToast is not defined
    showToast('Hello, ' + name);
  }`;
}
```

The `import tag` syntax can only import things *from below, not from above*.

The Spacetime donut is starting to close in around you. You don't have much time left to think. You have one last idea from a half-forgotten dream.

The `import tag` syntax can only import things from the *world below*. But didn't you also invent a sister `import rpc` syntax that lets you import functions *over the network boundary*? If the Early world is still somewhere there, perhaps it could respond to your request and return the result of the `Greeting` and the `Clock`?

<Server>

```js
export function Greeting() {
  return (
    <p>
      Hello, <input placeholder="Who are you?" />
    </p>
  );
}

export function Clock() {
  return new Date().toString();
}
```

</Server>

<Client glued>

```js {1}
import rpc { Clock, Greeting } from './early';

export function App() {
  return (
    <div>
      <Greeting />
      <p style={{
        color: prompt('Pick a color:')
      }}>
        <Clock />
      </p>
    </div>
  );
}
```

</Client>

The donut wobbles and stops swirling for a moment.

Was *that* the solution?

It does appear to work–

*"No extra network calls. You have to do everything in one go."*

The donut resumes swirling and is starting to envelop you. The wormhole is getting ever so closer. You're no longer afraid of it, almost welcoming it.

A thought strikes your mind.

Not even a thought--a picture.

A shape.

<Server>

```js {1,7,9}
import tag { Donut } from './Donut';

export function App() {
  return (
    <div>
      <Greeting />
      <Donut>
        The time is: <Clock />
      </Donut>
    </div>
  );
}

function Greeting() {
  return (
    <p>
      Hello, <input placeholder="Who are you?" />
    </p>
  );
}

function Clock() {
  return new Date().toString();
}
```

</Server>

<Client glued>

```js {3-5,7}
export function Donut({ children }) {
  return (
    <p style={{
      color: prompt('Pick a color:')
    }}>
      {children}
    </p>
  );
}
```

</Client>

You can't *call* the past from the future, but you can *wrap* the past into the future. You don't know what this means but you know you're not breaking any rules now.

Therefore, it must work.

*You close your eyes.*

---

### A Dream Sequence

In the beginning was the tag,<br />
and the tag was in the Early world,<br />
and the tag was `<App />`.

```js
<App />
```

What's an `App`?

It's a `<div>`<br />
with a `<Greeting>`,<br />
and a `<Donut>`<br />
with a `<Clock />`.

```js
<div>
  <Greeting />
  <Donut>
    The time is: <Clock />
  </Donut>
</div>
```

What's a `<div>`?

```js {1,6}
<div>
  <Greeting />
  <Donut>
    The time is: <Clock />
  </Donut>
</div>
```

We don't know yet.

What's a `<Greeting />`?

```js {2}
<div>
  <Greeting />
  <Donut>
    The time is: <Clock />
  </Donut>
</div>
```

It's a `<p>`<br />with an `<input>`.

```js {2-4}
<div>
  <p>
    Hello, <input placeholder="Who are you?" />
  </p>
  <Donut>
    The time is: <Clock />
  </Donut>
</div>
```

What's a `<p>`?

```js {2,4}
<div>
  <p>
    Hello, <input placeholder="Who are you?" />
  </p>
  <Donut>
    The time is: <Clock />
  </Donut>
</div>
```

We don't know yet.

What's an `<input>`?

```js {3}
<div>
  <p>
    Hello, <input placeholder="Who are you?" />
  </p>
  <Donut>
    The time is: <Clock />
  </Donut>
</div>
```

We don't know yet.

What's a `Donut`?

```js {5,7}
<div>
  <p>
    Hello, <input placeholder="Who are you?" />
  </p>
  <Donut>
    The time is: <Clock />
  </Donut>
</div>
```

*We don't know yet.*

What's a `Clock`?

```js {6}
<div>
  <p>
    Hello, <input placeholder="Who are you?" />
  </p>
  <Donut>
    The time is: <Clock />
  </Donut>
</div>
```

It's the time<br />
of this world,<br />
which is Early,<br />
and whose time<br />
has come to end.

```js {6}
<div>
  <p>
    Hello, <input placeholder="Who are you?" />
  </p>
  <Donut>
    The time is: Wed Apr 09 2025 15:13:04 GMT+0900 (Japan Standard Time)
  </Donut>
</div>
```

Goodbye `App`,<br />
goodbye `Greeting`,<br />
goodbye `Clock`.<br />

*\*\*\**

*(modem sounds)*

*\*\*\**

What's a `<div>`?

```js {1,8}
<div>
  <p>
    Hello, <input placeholder="Who are you?" />
  </p>
  <Donut>
    The time is: Wed Apr 09 2025 15:13:04 GMT+0900 (Japan Standard Time)
  </Donut>
</div>
```

We don't care yet.

What's a `<p>`?

```js {2,4}
<div>
  <p>
    Hello, <input placeholder="Who are you?" />
  </p>
  <Donut>
    The time is: Wed Apr 09 2025 15:13:04 GMT+0900 (Japan Standard Time)
  </Donut>
</div>
```

We don't care yet.

What's an `<input>`?

```js {3}
<div>
  <p>
    Hello, <input placeholder="Who are you?" />
  </p>
  <Donut>
    The time is: Wed Apr 09 2025 15:13:04 GMT+0900 (Japan Standard Time)
  </Donut>
</div>
```

We don't care yet.

What's a `<Donut>`?

```js {5,7}
<div>
  <p>
    Hello, <input placeholder="Who are you?" />
  </p>
  <Donut>
    The time is: Wed Apr 09 2025 15:13:04 GMT+0900 (Japan Standard Time)
  </Donut>
</div>
```

*Let us load it.*

```js
<script src="chunk123.js"></script>
```

Oh, a `Donut`<br />
is a `<p>` <br />
of a user-chosen color.<br />
Choose away!

```js {5}
<div>
  <p>
    Hello, <input placeholder="Who are you?" />
  </p>
  <p style={{ color: 'purple' }}>
    The time is: Wed Apr 09 2025 15:13:04 GMT+0900 (Japan Standard Time)
  </p>
</div>
```

*You have chosen.*

What's a `<p>`?

```js {5,7}
<div>
  <p>
    Hello, <input placeholder="Who are you?" />
  </p>
  <p style={{ color: 'purple' }}>
    The time is: Wed Apr 09 2025 15:13:04 GMT+0900 (Japan Standard Time)
  </p>
</div>
```

We don't care yet--<br />
it is not our job to care.<br />
Goodbye `Donut`;<br />
Let us hand this<br />
to some piece<br />
of C++.

```js
<div>
  <p>
    Hello, <input placeholder="Who are you?" />
  </p>
  <p style={{ color: 'purple' }}>
    The time is: Wed Apr 09 2025 15:13:04 GMT+0900 (Japan Standard Time)
  </p>
</div>
```

---

## Epilogue

There's more we haven't covered but I'm afraid I'm running out of paper. Here's a few things a motivated reader might discover if they continue this line of thought:

- **Poison Pills:** As your codebase grows, you'll increasingly find that you don't want to think about which world you're in at any given moment--you'll only want to assert the capabilities you're relying on. For example, if you're reading from a database and the entire database exists in the Early world, you'll want some way to "poison pill" the database module so that importing it from the Late world immediately leads to a build error (instead of, say, trying to bundle the database code). In Node.js, [custom user conditions](https://nodejs.org/api/packages.html#resolving-user-conditions) provide a convenient way to enforce this.
- **Directives:** It turns out that `import tag` and `import rpc`, while theoretically elegant, are not very nice to use in practice. The technical separation between the worlds must remain firm; however, mentally you'll gradually shift to writing the code as if it doesn't matter which world you're in. With Poison Pills enforcing that stuff doesn't execute in the *wrong* world, you can largely shift the boundaries on autopilot by moving stuff around and cutting new "doors" in response to build errors. When you *want* to cut a "door", you'll find that it's more natural to mark it *next to the `export`* rather than where you do the `import`. That would let you quickly "shift" the boundaries in and out of existence--the world an imported module is in becomes an implementation detail. One way to annotate exports would be to (ab)use the [directive syntax](https://stackoverflow.com/a/37535869). If you also rename Early and Late to something more descriptive (for example, "Early" could become "Server" and "Late" could become "Client"), then `import tag` could be replaced by [`'use client'`](https://react.dev/reference/rsc/use-client) next to the `export`, and `import rpc` could turn into [`'use server'`](https://react.dev/reference/rsc/use-server).
- **Data Fetching:** The Early world (or the Server world, if you prefer) is a perfect place for data fetching because you have the opportunity to deploy the code to a low-latency environment. It would not be difficult to adjust the code to allow the "thinking" phase to be asynchronous; see if you can manage that as an exercise.
- **Streaming Execution:** In our examples, every phase of the computation happens sequentially: it doesn't start until the previous phase has fully finished. However, in practice, since Components can be executed outside-in, you can blend *all* of the phases and execute them without blocking. In particular, instead of waiting for an entire JSON tree of Late Components (or shall we call them Client Components?), you could develop a specialized wire format that leaves "holes" in place of unfinished computations, and can later fill in those holes with more JSON.
- **Stateful Late World:** Late Components become a lot more useful if you introduce a concept of State. This, again, underscores that a tag is a *potential* function call--it may happen, it may not happen, or it may *happen many times*. Every time you change the state of some Late Component, you can re-execute it without affecting any of the Early Components. This ensures State changes stay predictably instant.
- **Repurposing Early and Late Worlds:** Keep in mind that Early and Late worlds don't have to map 1:1 to existing concepts of a "server" and a "client". For example, if your Late Components are Stateful, and you have a server, you might find it useful to run *both* the Early *and* the Late worlds on that server. On the server, you'll call the Late world with the *initial* State--to produce an initial tree of Primitives, which you can turn into a format like HTML. This lets you start displaying content to the user very early--before any of the Late Components load on their machine.
- **Caching:** The Early world doesn't have to run on demand. Indeed, you can run it ahead of time and store the intermediate result of its computation (which is often known as static site generation). If you're feeling ambitious, you could even add another world--[a Cache world](https://nextjs.org/docs/app/api-reference/directives/use-cache)--to reuse pieces of computation across requests.

If you'd like to play with the final example, be my guest:

[Run the final code.](https://codesandbox.io/p/sandbox/8dgdz8?file=%2Fsrc%2Findex.mjs)

If you'd like to play with the real thing but don't want to use a framework, [Parcel has recently released support for React Server Components](https://parceljs.org/recipes/rsc/) so do check that out.

Thank you for reading!
