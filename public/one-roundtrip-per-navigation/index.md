---
title: One Roundtrip Per Navigation
date: '2025-05-29'
spoiler: What do HTML, GraphQL, and RSC have in common?
---

How many requests should it take to navigate to another page?

In the simplest case, a navigation is resolved in a single request. You click a link, the browser requests the HTML content for the new URL, and then displays it.

In practice, a page might also want to display some images, load some client-side JavaScript, load some extra styles, and so on. So there'll be a bunch of requests. Some will be render-blocking (so the browser will defer displaying the page until they resolve), and the rest will be "nice-to-have". Maybe they'll be important for full interactivity but the browser can already display the page while they load.

Okay, but what about loading *data*?

How many API requests should it take to get the *data* for the next page?

---

### HTML

Before much of the web development has moved to the client, this question didn't even make sense. There was no concept of "hitting the API" because you wouldn't think of your server as an *API server*--it was just *the server*, returning HTML.

**In traditional "HTML apps", aka websites, getting the data always takes a single roundtrip.** The user clicks a link, the server returns the HTML, and all the data necessary to display the next page is already embedded *within* that HTML. The HTML itself *is* the data. It doesn't need further processing--it's ready for display:

```html
<article>
  <h1>One Roundtrip Per Navigation</h1>
  <p>How many requests should it take to navigate to another page?</p>
  <ul class="comments">
    <li>You're just reinventing HTML</li>
    <li>You're just reinventing PHP</li>
    <li>You're just reinventing GraphQL</li>
    <li>You're just reinventing Remix</li>
    <li>You're just reinventing Astro</li>
  </ul>
</article>
```

(Yes, technically some static, reusable and cacheable parts like images, scripts, and styles get "outlined", but you can also always inline them whenever that's useful.)

---

### "REST"

Things changed as we moved more of the application logic to the client side. The data we want to fetch is usually determined by the UI we need to display. When we want to show a post, we need to fetch that post. When we want to show a post's comments, we need to fetch those comments. So how many fetches do we make?

With JSON APIs, a technique [known as](https://htmx.org/essays/how-did-rest-come-to-mean-the-opposite-of-rest) REST suggests to expose an endpoint per a conceptual "resource". Nobody knows what exactly a "resource" is but usually the backend team will be in charge of defining this concept. So maybe you'll have a Post "resource" and a Post Comments "resource", and so you'll be able to load the data for the post page (which contains the post and its comments) in two fetches.

But *where* do these two fetches happen?

In server-centric HTML apps (aka websites) you could hit two REST APIs during a single request, and still return all the data as a single response. This is because the REST API requests would happen *on the server*. The REST API was used mostly as an explicit boundary for the data layer, but it was not really required (many were happy to use an in-process data layer that you can import--like in Rails or Django). Regardless of REST, the data (HTML) arrived to the client (browser) in one piece.

As we started moving UI logic to the client for richer interactivity, it felt natural to keep the existing REST APIs but to `fetch` them *from* the client. Isn't that kind of flexiblity exactly what JSON APIs were great at? Everything became a JSON API:

```js
const [post, comments] = await Promise.all([
  fetch(`/api/posts/${postId}`).then(res => res.json()),
  fetch(`/api/posts/${postId}/comments`).then(res => res.json())
]);
```

**However as a result, there are now two fetches in the Network tab: one fetch for the Post and another fetch for that Post's Comments.** A single page--a single link click--often needs data from more than one REST "resource". In the best case, you can hit a couple of endpoints and call it a day. In the worst case, you might have to hit N endpoints for N items, or hit the server repeatedly in a series of server/client waterfalls (get some data, compute stuff from it, use that to get some more data).

An inefficiency is creeping in. When we were on the server, making a bunch of REST requests was cheap because we had control over how our code is deployed. If those REST endpoints were far away, we could move our server closer to them or even move their code in-process. We could use replication or server-side caching. Even if something got inefficient, on the server we have many *levers* to improve that inefficiency. Nothing is *stopping* us from improving things on the server side.

However, if you think of the server as a black box, you can't improve on the APIs it provides. You can't optimize a server/client waterfall if the server doesn't return all the data needed to run requests in parallel. You can't reduce the number of parallel requests if the server doesn't provide an API that returns all the data in a batch.

At some point you're going to hit a wall.

---

### Components

The problem above wouldn't be so bad if not for the tension between efficiency and encapsulation. As developers, we feel compelled to place the logic to load the data close to where this data is used. Someone might say this leads to "spaghetti code", but it doesn't have to! The idea itself is solid. Recall--the UI *determines* the data. The data you need depends on what you want to display. The data fetching logic and the UI logic are *inherently coupled*--when one changes, the other needs to be aware of that. You don't want to break stuff by "underfetching" or bloat it by "overfetching". But how do you keep the UI logic and the data fetching in sync?

The most direct approach would be to put the data loading logic directly in your UI components. That's the “`$.ajax` in a `Backbone.View`" approach, or “`fetch` in `useEffect`" approach. It was incredibly popular with the rise of client-side UI--and still is. The benefit of this approach is *colocation:* the code that says what data to load is located right next to the code consuming it. Different people can write components that depend on different data sources, and then put them together:

```js
function PostContent({ postId }) {
  const [post, setPost] = useState()
  useEffect(() => {
    fetch(`/api/posts/${postId}`)
      .then(res => res.json())
      .then(setPost);
  }, []);
  if (!post) {
    return null;
  }
  return (
    <article>
      <h1>{post.title}</h1>
      <p>{post.content}</p>
      <Comments postId={postId} />
    </article>
  );
}

function Comments({ postId }) {
  const [comments, setComments] = useState([])
  useEffect(() => {
    fetch(`/api/posts/${postId}/comments`)
      .then(res => res.json())
      .then(setComments);
  }, [])
  return (
    <ul className="comments">
      {comments.map(c => <li key={c.id}>{c.text}</li>)}
    </ul>
  );
}
```

However, this approach makes the problem from the previous section much more severe. Not only does rendering a single page take a bunch of requests, these requests are now *spread out in the codebase*. How do you audit for inefficiencies?

Someone might edit a component, add some data loading to it, and thus introduce a new client/server waterfall to a dozen different screens using that component. If our components ran on the server *only*--like [Astro Components](https://docs.astro.build/en/basics/astro-components/)--data fetching delays would at best be nonexistent and at worst be predictable. But on the client, smudging the data fetching logic across components cascades the inefficiencies without good levers to fix them--we can't *move the user* any closer to our servers. (And *inherent* waterfalls can't be fixed from the client at all--even by prefetching.)

Let's see if adding a bit more structure to our data fetching code can help.

---

### Queries

Interestingly, solutions that bring some structure to data fetching--like [React Query](https://tanstack.com/query/latest/docs/framework/react/overview) (`useQuery`)--aren't on their own immune to this. They're much more principled than `fetch` in `useEffect` (and caching helps) but you get the same "N queries for N items" and "server/client query waterfalls" problems with them.

```js
function usePostQuery(postId) {
  return useQuery(
    ['post', postId],
    () => fetch(`/api/posts/${postId}`).then(res => res.json())
  );
}

function usePostCommentsQuery(postId) {
  return useQuery(
    ['post-comments', postId],
    () => fetch(`/api/posts/${postId}/comments`).then(res => res.json())
  );
}

function PostContent({ postId }) {
  const { data: post } = usePostQuery(postId);
  if (!post) {
    return null;
  }
  return (
    <article>
      <h1>{post.title}</h1>
      <p>{post.content}</p>
      <Comments postId={postId} />
    </article>
  );
}

function Comments({ postId }) {
  const { data: comments } = usePostCommentsQuery(postId);
  return (
    <ul className="comments">
      {comments.map(c => <li key={c.id}>{c.text}</li>)}
    </ul>
  );
}
```

In fact, client-side caching in general is a bit of a red herring. It is essential for the Back button to be instant in client-side apps (and thus should not be neglected), and it helps to reuse stuff from the cache for some navigations like tab switches. But for many navigations--primarily clicking on links--the user actually *expects* to see fresh content. It's why the browser waits to load the page in "HTML apps"! The user might not want the *whole* page to be replaced (especially if your app has a navigation "shell"), but the content area is expected to be fresh after a link click. (Of course, prefetching on hover for an instant-*and*-fresh navigation is even nicer.)

Counter-intuitively, this means that faster is not *always* better. It's often *worse* for the user experience to show a flash of stale cached content and then immediately replace it a la "stale-while-revalidate". It betrays the user's intent. Clicking the link carries an expectation of freshness. I don't want to have to Ctrl+R "just in case".

Client-side caching helps if the content *couldn't have changed yet* or you simply don't care to reflect the changes, but it isn't panacea and doesn't fix other issues. It solves a range of problems, but it doesn't reduce the number of requests when we *want* the data to be fresh, and it doesn't help us prevent server/client waterfalls.

So now we have this tension: we know it's *good* to colocate the UI with its data requirements, but we also want to avoid server/client waterfalls and firing too many parallel requests. Client-side caching of queries *alone* doesn't fix this.

What do we do?

---

### Client Loaders

One thing we could do is to give up on colocation. Suppose that for each route, we define a function that will load all the data for that route. We'll call it a *loader:*

```js
async function clientLoader({ params }) {
  const { postId } = params;
  const [post, comments] = await Promise.all([
    fetch(`/api/posts/${postId}`).then(res => res.json()),
    fetch(`/api/posts/${postId}/comments`).then(res => res.json())
  ]);
  return { post, comments };
}
```

This example is using the [`clientLoader`](https://reactrouter.com/start/framework/data-loading#client-data-loading) API from React Router, but the idea itself is more general. For each navigation, assume that the router runs the loader for the next route, and then hands off the data to your component hierarchy.

The downside of this approach is that the data requirements are no longer colocated with the components that need that data. There's now a piece of code "at the top" of each route that has to "know" what the entire hierarchy below it needs. In that sense, it feels like a step back from fetching in Queries or in Components.

The upside of this approach is that it's way easier to avoid client/server waterfalls. They are still *possible* (and sometimes unavoidable) because the `loader` function above runs on the client--but they are *visible*. You're not creating client/server waterfalls *by default*, which fetching in Components or Queries suffered from.

---

### Server Loaders

Another upside of loaders is that, if each route has a self-contained loader, it is easy to move some of this logic *to the server*. Since the loader is independent from your components (it runs *before* any components), you could make it a part of your HTML or API server--or even a separate "BFF" server (a *"backend for frontend"*).

```js
// This could run on the server instead
async function loader({ params }) {
  const { postId } = params;
  const [post, comments] = await Promise.all([
    fetch(`/api/posts/${postId}`).then(res => res.json()),
    fetch(`/api/posts/${postId}/comments`).then(res => res.json())
  ]);
  return { post, comments };
}
```

This is the model followed by the [React Router `loader` function](https://reactrouter.com/start/framework/data-loading#server-data-loading) as well as the old school Next.js `getServerSideProps()`. (Usually, a code transform "detaches" the server loader code from the rest of your code which is destined for the client.)


Why move the loader to the server?

If you don't treat the server as a black box beyond your control, it is *the* natural place to put your data fetching code. When you're on the server, you have all the levers to improve common performance problems. You often have control over latency--for example, you can your BFF server closer to the data source. Then even *inherent* waterfalls will be cheap. If the data source is slow, you have ability to add cross-request caching on the server. You also have the option of dispensing with microservices entirely and moving your data layer to be in-process, like in Rails:

```js {1,6-7}
import { loadPost, loadComments } from 'my-data-layer';

async function loader({ params }) {
  const { postId } = params;
  const [post, comments] = await Promise.all([
    loadPost(postId),
    loadComments(postId)
  ]);
  return { post, comments };
}
```

An in-process data layer gives you the ultimate opportunities for optimization. It lets you drop down to a lower level whenever necessary (for example, to call an optimized stored procedure for a particular screen). In-memory per-request caching and batching let you reduce the number of database trips even further. You don't have to worry about overfetching or underfetching--each loader can send *just the data that its screen needs*. No more "expanding" REST "resources".

But even if you stick with calling the REST APIs, you've recovered a lot of useful properties of traditional "HTML apps"--the kind of architecture you'd have with Rails or Django. **From the client perspective, the data (JSON this time) arrives in a single roundtrip.** And client/server waterfalls *can never happen* in this model.

Okay, so those are the upsides of server loaders. What are the downsides?

---

### Server Functions

Recall that when we decided to use loaders, we've given up on colocation.

What if we keep the loaders on the server but write a *loader per component* so that we can regain the colocation? This might require further blurring the boundaries between server and client code but let's roll with it for now and see where it leads.

The way you would do this depends on what "boundary-blurring" mechanism you use. Let's start with [TanStack Server Functions](https://tanstack.com/start/latest/docs/framework/react/server-functions) as an example.

This lets us declare a few TanStack Server Functions that the client can import:

```js
import { createServerFn } from '@tanstack/react-start'
import { loadPost, loadComments } from 'my-data-layer';

export const getPost = createServerFn({ method: 'GET' }).handler(
  async (postId) => loadPost(postId)
);

export const getComments = createServerFn({ method: 'GET' }).handler(
  async (postId) => loadComments(postId)
);
```

Here is a similar example with the [React Server Functions](https://react.dev/reference/rsc/server-functions) syntax instead:

```js
'use server';

import { loadPost, loadComments } from 'my-data-layer';

export async function getPost(postId) {
  return loadPost(postId);
}

export async function getComments(postId) {
  return loadComments(postId);
}
```

I won't dwell on their differences for now--for the purposes of this post let's consider them equivalent. In both cases, [they create implicit RPC endpoints.](/what-does-use-client-do/#use-server)

The point is that your client-side components can import them directly. No need to set up a REST endpoint of an "API route". It's an implicit API route by `import`.

Now we have colocation again! `PostContent` only needs `getPost`:

```js {1,5}
import { getPost } from './my-server-functions';
import { Comments } from './Comments';

function usePostQuery(postId) {
  return useQuery(['post', postId], () => getPost(postId));
}

function PostContent({ postId }) {
  const { data: post } = usePostQuery(postId);
  if (!post) {
    return null;
  }
  return (
    <article>
      <h1>{post.title}</h1>
      <p>{post.content}</p>
      <Comments postId={postId} />
    </article>
  );
}
```

Similarly, `Comments` can import `getComments` directly from the server:

```js {1,4}
import { getComments } from './my-server-functions';

function usePostCommentsQuery(postId) {
  return useQuery(['post-comments', postId], () => getComments(postId));
}

export function Comments({ postId }) {
  const { data: comments } = usePostCommentsQuery(postId);
  return (
    <ul className="comments">
      {comments.map(c => <li key={c.id}>{c.text}</li>)}
    </ul>
  );
}
```

But wait...

This doesn't actually help any of the problems we outlined earlier!

In fact, we've *regressed* the performance characteristics back to fetching inside [Components](#components) or [Queries](#queries). The only thing that Server Functions help with is *nicer syntax* (`import` instead of an API route). But when used for *colocated data fetching*, Server Functions are a *step back* from Server Loaders. They don't enforce fetching in a single roundtrip, and don't prevent server/client waterfalls. Server Functions reduce the plumbing of *calling the server* but they do not improve data fetching.

Does anything?

---

### GraphQL Fragments

Tragically misunderstood, GraphQL is one take on efficient colocation.

The idea of GraphQL--the way it was [intended](https://alan.norbauer.com/articles/relay-style-graphql/) to be used--is that individual components can declare their data dependencies as *fragments* which then get composed together. (After many years, thankfully, [Apollo supports this too.](https://www.apollographql.com/blog/optimizing-data-fetching-with-apollo-client-leveraging-usefragment-and-colocated-fragments))

This means that the `Comment` component can declare its own data needs:

```js {14-17}
function Comments({ comments }) {
  return (
    <ul className="comments">
      {comments.map(comment => (
        <Comment key={comment.id} comment={comment} />
      ))}
    </ul>
  );
}

function Comment({ comment }) {
  const data = useFragment(
    graphql`
      fragment CommentFragment on Comment {
        id
        text
      }
    `,
    comment
  );
  return <li>{data.text}</li>;
}
```

Note that the `Comment` component **does not do any data fetching on its own.** It only *declares* what data it needs. Now let's look at the `PostContent` component.

The `PostContent` component *composes* the `Comment`'s fragment into its own:

```js {9}
function PostContent({ post }) {
  const data = useFragment(
    graphql`
      fragment PostContentFragment on Post {
        title
        content
        comments {
          id
          ...CommentFragment
        }
      }
    `,
    post
  );
  return (
    <article>
      <h1>{data.title}</h1>
      <p>{data.content}</p>
      <Comments comments={data.comments} />
    </article>
  );
}
```

The actual data fetching happens somewhere at the top level. The fragments would compose into this GraphQL query that describes the data *for the entire route:*

```graphql
query PostPageQuery($postId: ID!) {
  post(id: $postId) {
    # From PostContentFragment
    title
    content
    comments {
      # From CommentFragment
      id
      text
    }
  }
}
```

It's like an automatically generated loader!

For every screen, it's now possible to generate a query that precisely describes all the data needed by that screen, according to the source code of your components. If you want to change what data is needed by some component, you just change the fragment in that component, and all the queries will change automatically. **With GraphQL fragments, each navigation loads data in a single roundtrip.**

GraphQL is not for everyone. I still feel a bit lost in the syntax (partially because I never heavily used it) and it requires some institutional knowledge to use it well--both on the server side and on the client side. I'm not here to sell you on GraphQL.

But it deserves to be said that GraphQL is one of the *few* approaches that actually *did* crack this nut. It lets you colocate data requirements with UI but *without* the penalties of doing it naïvely (that [Components](#components) and [Queries](#queries) suffer from, with or without [Server Functions](#server-functions)). In other words, GraphQL offers both the performance characteristics of [Server Loaders](#server-loaders) *and* the colocation and modularity of [Queries](#queries).

There's another solution that attempts to do that.

---

### RSC

React Server Components are the React team's answer to the question that plagued the team throughout the 2010s. "How to do data fetching in React?"

Imagine that each component that needs some data can have its own [Server Loader](#server-loaders). This is the simplest possible solution--a function per such component.

Now, we know that calling Server Loaders *from* components for data fetching [would have been a mistake](#server-functions)--we'd go straight back to server/client waterfalls. So we'll do it the other way around. Our Server Loaders will *return* our components:

<Server>

```js {7,9,15}
import { loadPost, loadComments } from 'my-data-layer';
import { PostContent, Comments } from './client';

function PostContentLoader({ postId }) {
  const post = await loadPost(postId);
  return (
    <PostContent post={post}>
      <CommentsLoader postId={postId} />
    </PostContent>
  );
}

function CommentsLoader({ postId }) {
  const comments = await loadComments(postId);
  return <Comments comments={comments} />;
}
```

</Server>

<Client glued>

```js
'use client';

export function PostContent({ post, children }) {
  return (
    <article>
      <h1>{post.title}</h1>
      <p>{post.content}</p>
      {children}
    </article>
  );
}

export function Comments({ comments }) {
  return (
    <ul className="comments">
      {comments.map(c => <li key={c.id}>{c.text}</li>)}
    </ul>
  );
}
```

</Client>

The data flows down. The server is the source of truth. Components that want to "receive props from the server" opt into that with the [`'use client'` directive](/what-does-use-client-do/). Since our "Server Loaders" are indistinguishable from components, we're calling them Server Components. But they're a composable version of Server Loaders.

This might remind you of the old "Container vs Presentational Components" pattern, except all "Containers" run on the server to avoid extra roundtrips.

What do we get from this approach?

- **We get the efficiency of [Server Loaders](#server-loaders).** All of the performance optimization strategies that apply to them (per-request caching, cross-request caching, deploying closer to the data source) apply to Server Components. There's a guarantee that server/client waterfalls can't happen. Data arrives in one roundtrip.
- **We get the colocation of [Components](#components) (or [GraphQL Fragments](#graphql-fragments)).** Although data dependencies aren't literally declared in the same file, they're a single hop away. You can always "Find All References" to find where the *server props* are coming from, just like when you look for where the props come from in React in general.
- **We get the "vanilla" mental model of [HTML](#html) apps.** There's no separate "API" (although you can add one if you'd like) or long-term normalized client caching. You return a tree, but your palette is your React components (rather than HTML). There's no special language to learn, or data loading APIs. In a way, there *is* no API.

In fact, the example above can be collapsed to:

```js
import { loadPost, loadComments } from 'my-data-layer';
import { PostContent, Comments } from './client';

async function PostContent({ postId }) {
  const post = await loadPost(postId);
  return (
    <article>
      <h1>{post.title}</h1>
      <p>{post.content}</p>
      <Comments postId={postId} />
    </article>
  );
}

async function Comments({ postId }) {
  const comments = await loadComments(postId);
  return (
    <ul className="comments">
      {comments.map(c => <li key={c.id}>{c.text}</li>)}
    </ul>
  );
}
```

---

### So What?

In this post, I tried to show how RSC relate to different aspects of existing data fetching solutions. There's many things I haven't covered, but I'll note a few:

- Fetching data in a single roundtrip might seem like a bad idea if some part is slower to load. (RSC solves this by streaming, GraphQL by the `@defer` directive.)
- Server/client waterfalls might seem like less of a problem if you use prefetching. (That's not true; for *inherent* client/server waterfalls, prefetching doesn't help.)
- Fetching in components might seem like a bad idea due to server-only waterfalls. (This is true in some cases, depending on whether you use a low-latency data layer. I don't think this speaks against RSC but I'll save that for another post.)

**If there's one thing I'd like to you to take away, it's that there aren't many solutions that aim to solve both colocation *and* efficiency. HTML templates do that (with [Astro](https://astro.build/) as a modern contender), GraphQL does it, and RSC also does it.**

Something to ask your favorite framework for!
