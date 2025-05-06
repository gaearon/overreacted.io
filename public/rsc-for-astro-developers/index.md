---
title: RSC for Astro Developers
date: '2025-05-06'
spoiler: Islands, but make it fractal.
---

Okay, so in [Astro](https://docs.astro.build/en/getting-started/) you have two things:

* [Astro Components:](https://docs.astro.build/en/basics/astro-components/) They have the `.astro` extension. They execute exclusively on the server or during the build. In other words, their code is never shipped to the client. So they can do things that client code cannot do--read from the filesystem, hit the internal services, even read from a database. But they can't do interactive things aside from whatever exists natively in the HTML or your own `<script>`. Astro Components can render either other Astro Components or Client Islands.
* [Client Islands:](https://docs.astro.build/en/concepts/islands/) Components written for React, Vue, and so on. This is your typical frontend stuff. That's where it's convenient to add the interactive bits. These Client Islands can then render other components for the same framework using that framework's own mechanism. So, a React component can render another React component, as you would expect. But you can't render an Astro Component from a Client Island. That wouldn't make sense--by that point, Astro already ran.

Here's a `PostPreview.astro` Astro Component rendering a `LikeButton` Island:

<Server>

```astro
---
import { readFile } from 'fs/promises';
import { LikeButton } from './LikeButton';

const { slug } = Astro.props;
const title = await readFile(`./posts/${slug}/title.txt`, 'utf8');
---
<article>
  <h1>{title}</h1>
  <LikeButton client:load />
</article>
```

</Server>

<Client glued>

```js
import { useState } from 'react';

export function LikeButton() {
  const [liked, setLiked] = useState(false);
  return (
    <button onClick={() => setLiked(!liked)}>
      {liked ? '❤️' : '🤍'} Like
    </button>
  );
}
```

</Client>

Notice how Astro Components and Client Islands essentially live in two different "worlds", and the data only ever flows down. Astro Components are where all the preprocessing happens; they "hand off" the interactive bits to the Client Islands.

Now let's look at React Server Components (RSC).

**In RSC, the same two things are called *Server Components* and *Client Components*.** Here is how you'd write the above Astro Component as a React Server Component:

<Server>

```js {4}
import { readFile } from 'fs/promises';
import { LikeButton } from './LikeButton';

async function PostPreview({ slug }) {
  const title = await readFile(`./posts/${slug}/title.txt`, 'utf8');
  return (
    <article>
      <h1>{title}</h1>
      <LikeButton />
    </article>
  );
}
```

</Server>

<Client glued>

```js {1}
'use client';

import { useState } from 'react';

export function LikeButton() {
  const [liked, setLiked] = useState(false);

  return (
    <button onClick={() => setLiked(!liked)}>
      {liked ? '❤️' : '🤍'} Like
    </button>
  );
}
```

</Client>

The mental model behind these two are remarkably similar! If you know Astro, you already have 80% of the mental model for React Server Components. (Even if you think React Server Components are a terrible idea, Astro is worth learning.)

Let's note a few syntactic differences you might have noticed above:

- Unlike Astro Components, React Server Components are regular JavaScript functions. They are not "single-file". The props are coming from the function argument rather than from `Astro.props`, and there is no separate "template".
- In Astro, the separation between Astro Components and Client Islands is achieved by writing the former as `.astro` files. Once you import a Client Island, you're not in an `.astro` file anymore and thus you're "leaving" the Astro world. In RSC, the same purpose is achieved by the `'use client'` directive. The `'use client'` directives marks where the Server world "ends"--[it is a door between the worlds.](/what-does-use-client-do/#two-worlds-two-doors)
- In Astro, there are directives like `client:load` that let you treat Islands either as static HTML or as hydratable on the client. React Server Components does not expose this distinction to the user code. From React's perspective, if a component was written to be interactive, it would be a *mistake* to remove this interactivity. If a component truly does not *require* interactivity, just remove `'use client'` from it, and then importing it from the Server world would *already* keep it Server-only.

The last point is interesting. In Astro, the different syntax (`.astro` files vs Client Islands) creates a sharp and obvious visual distinction between the two worlds. The same component can't act as both an Astro Component *and* a Client Island depending on the context--they're two distinct things with distinct syntaxes.

But in RSC, the "Astro" part is also "just React". So if you have a component that doesn't use any client-specific *or* server-specific features, it could play either role.

Consider a `<Markdown />` component that does its own parsing. Since it doesn't use any client features (no State) or any server features (no reading DB), it could be imported on either side. So if you import it from a Server world, it'll act like an "Astro Component", but if you import it from a Client world, it'll act like a "Client Island". This isn't some new concept, it's just how importing functions works!

In RSC, stuff imported from the Server world will run in the Server world; stuff that's imported from the Client world will run in the Client world; and stuff that's not supported in either world (e.g. DB on the Client or `useState` on the Server) will cause a build error so you'll be *forced* to "cut a door" with `'use client'`.

This is both a blessing and a curse.

It is a curse because it makes learning to wield RSC rather unintuitive. You keep worrying about "which world you're in". It takes practice to embrace that it *doesn't matter* because you can always reason locally. You can use server features like DB in files that need them, use client features like State in files that need them, and rely on build-time assertions causing errors if something is wrong. Then you look at the module stack trace and decide where to "cut a new door" for your "islands".

This *is* a curse, but it is also a blessing. By embracing React on both sides, the RSC model solves some Astro limitations that you might encounter along the way:

- Sometimes, you might write a bunch of Astro Components and later realize that you're gonna need to move that UI into Client Islands (tweaking the syntax along the way) or even duplicate it because some dynamic UI *also* wants to drive them. With RSC, you can extract the shared parts and import them from both sides. It is less important to think through "this part will mostly be dynamic" or "this part will mostly be static" for every piece of UI because you can always add or remove `'use client'` and/or move it up or down the import chain with little friction. You do decide where to "cut the door", but there's no "converting" back and forth.
- In Astro, you *can* nest Astro Components inside Client Islands, but if those include *more* Client Islands, they'll still be seen as separate roots by your framework (e.g. React). This is why *nesting interactive behavior* doesn't compose as naturally as in client apps, e.g. [React or Vue context can't be passed between Astro islands.](https://docs.astro.build/en/recipes/sharing-state-islands/) In RSC, this is not a problem--the entire UI is a single React tree under the hood. You can have a Client context provider above some Server subtree, and then a bunch of Client components reading that context anywhere below. RSC is *fractal* islands.
- Astro Components can ultimately produce only HTML. This is why clicking links on an Astro site requires the browser to fully reload the page. If that seems like acceptable UX for your use case, that's great! You can [improve it with manual logic and with View Transitions](https://docs.astro.build/en/guides/view-transitions/) but fundamentally, the page's HTML *does* get replaced. If you want a SPA-like navigation that always keeps the state of the nav chrome, whether any React state or DOM state like inputs and scroll positions, then RSC can fill that gap. RSC [uses a JSON-like](/functional-html/#objects) format for React trees--which can be *turned into* HTML (for the first paint) but also gets refetched as JSON on navigations. In other words, RSC lets you *think* in an [MPA](https://docs.astro.build/en/concepts/why-astro/#server-first) mental model--but it *feels* like a SPA.
- This also means that unlike with Astro, the Server parts of RSC UI are *refreshable in-place*. If you do actually run a server (and not just running RSC during the build like I do for my blog), RSC lets you "refresh" the screen at any time to let the *fresh server props flow into your already existing stateful client-side tree*. For example, if some Astro Component needs to refresh in response to an interaction, you would have to choose between a full page refresh or moving logic to a Client Island. In RSC, you can just ask the fresh JSX from the server to get merged into the tree.

In Astro, the fundamental output format is HTML. Since frontend frameworks don't fundamentally operate the HTML itself (they operate a stateful DOM that can be *initialized* with HTML), Astro follows a "one-time handoff" model. This makes it arguably easier to learn but limits server features to what the "first render" (to HTML) needs and mostly leaves you on your own with the interactive bits. As you make more things interactive, you might feel yourself running into Astro model's limitations, possibly choosing to move more logic to SPA-like but isolated Islands.

In RSC, the fundamental output format is a React tree (which can be turned to HTML, but can also be (re)fetched as JSON). Since RSC uses React on both sides with no visual distinction between the two worlds, it is more challenging to learn to wield it. The upside is that once you get the hang of moving the boundaries, they become very fluid and solve the problem where you have to move code "into Astro" or "back into Islands" because something ended up more static or dynamic than expected. You also can retain the same "just map the data to UI" mental model whether the UI is read-only or needs to refetch in response to mutations. The Server parts grow deeper into the tree--[interleaved](/impossible-components/#a-sortable-list-of-previews) with *their* Client parts.

And because it's React on both sides, all React features are integrated end-to-end: for example, a [`<Suspense>`](https://react.dev/reference/react/Suspense) declarative loading state on the Client will "know" to wait for async data (from the Server), JS and CSS (as the Client loads them), fonts and images (with reasonable timeouts), and even trigger the View Transitions (see [here](https://react.dev/blog/2025/04/23/react-labs-view-transitions-activity-and-more#animating-suspense-boundaries)). In React, every feature is designed so that the Server and Client pieces are arbitrarily nestable, composable, and refreshable in-place. It's a single tree. The downside is that buying into RSC means buying into React. RSC *is* full-stack React.

Finally, it is worth noting that Astro is a framework, but RSC itself is lower-level--think of it as a building block for a framework, or a standard that a framework can implement. The two officially supported implementations of RSC right now include [Next.js App Router](https://nextjs.org/) (a framework) and [Parcel RSC](https://parceljs.org/recipes/rsc/) (not a framework).

Personally, I think that the developer experience with RSC is still somewhat raw, but I also think you might want to learn it anyway. It has some interesting ideas.

Also, if you've never used Astro, give it a try! If RSC is giving you a hard time, Astro might offer a gentler onramp to the same ideas. And if you've only ever used client-side React, Astro might solve some problems you never realized you had.
