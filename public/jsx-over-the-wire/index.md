---
title: JSX Over The Wire
date: '2025-04-16'
spoiler: Turning your API inside-out.
---

Suppose you have an API route that returns some data as JSON:

```js {8-10}
app.get('/api/likes/:postId', async (req, res) => {
  const postId = req.params.postId;
  const [post, friendLikes] = await Promise.all([
    getPost(postId),
    getFriendLikes(postId, { limit: 2 }),
  ]);
  const json = {
    totalLikeCount: post.totalLikeCount,
    isLikedByUser: post.isLikedByUser,
    friendLikes: friendLikes,
  };
  res.json(json);
});
```

You also have a React component that needs that data:

```js {2-4}
function LikeButton({
  totalLikeCount,
  isLikedByUser,
  friendLikes
}) {
  let buttonText = 'Like';
  if (totalLikeCount > 0) {
    // e.g. "Liked by You, Alice, and 13 others"
    buttonText = formatLikeText(totalLikeCount, isLikedByUser, friendLikes);
  }
  return (
    <button className={isLikedByUser ? 'liked' : ''}>
      {buttonText}
    </button>
  );
}
```

How do you get that data into that component?

You could pass it from a parent component using some data fetching library:

```js
function PostLikeButton({ postId }) {
  const [json, isLoading] = useData(`/api/likes/${postId}`);
  // ...
  return (
    <LikeButton
      totalLikeCount={json.totalLikeCount}
      isLikedByUser={json.isLikedByUser}
      friendLikes={json.friendLikes}
    />
  );
}
```

That's one way of thinking about it.

But have another look at your API:

```js {8-10}
app.get('/api/likes/:postId', async (req, res) => {
  const postId = req.params.postId;
  const [post, friendLikes] = await Promise.all([
    getPost(postId),
    getFriendLikes(postId, { limit: 2 }),
  ]);
  const json = {
    totalLikeCount: post.totalLikeCount,
    isLikedByUser: post.isLikedByUser,
    friendLikes: friendLikes,
  };
  res.json(json);
});
```

Do these lines remind you of anything?

Props. *You're passing props.* You just didn't specify *where to*.

But you already know their final destination--`LikeButton`.

Why not just fill that in?

```js {8,12}
app.get('/api/likes/:postId', async (req, res) => {
  const postId = req.params.postId;
  const [post, friendLikes] = await Promise.all([
    getPost(postId),
    getFriendLikes(postId, { limit: 2 }),
  ]);
  const json = (
    <LikeButton
      totalLikeCount={post.totalLikeCount}
      isLikedByUser={post.isLikedByUser}
      friendLikes={friendLikes}
    />
  );
  res.json(json);
});
```

Now the "parent component" of `LikeButton` is the *API itself*.

Wait, what?

Weird, I know. We're going to worry about whether it's a good idea later. But for now, notice how this inverts the relationship between components and the API. This is sometimes known as the Hollywood Principle: "Don't call me, I'll call you."

Your components don't call your API.

Instead, your API *returns* your components.

Why would you ever want to do that?

---

- [Part 1: JSON as Components](#part-1-json-as-components)
- [Part 2: Components as JSON](#part-2-components-as-json)
- [Part 3: JSX Over The Wire](#part-3-jsx-over-the-wire)

---

## Part 1: JSON as Components

### Model, View, ViewModel

There is a fundamental tension between how we want to *store* information and how we want to *display* it. We generally want to store more things than we display.

For example, consider a Like button on a Post. When we store Likes for a given Post, we might want to represent them as a table of `Like` rows like this:

```js
type Like = {
  createdAt: string, // Timestamp
  likedById: number, // User ID
  postId: number     // Post ID
};
```

Let's call this kind of data a "Model". It represents the raw shape of the data.

```js
type Model = Like;
```

So our Likes database table might contain data of that shape:

```js
[{
  createdAt: '2025-04-13T02:04:41.668Z',
  likedById: 123,
  postId: 1001
}, {
  createdAt: '2025-04-13T02:04:42.668Z',
  likedById: 456,
  postId: 1001
}, {
  createdAt: '2025-04-13T02:04:43.668Z',
  likedById: 789,
  postId: 1002
}, /* ... */]
```

However, what we want to *display* to the user is different.

What we want to display is the *number of Likes* for that Post, whether the *user has already liked it*, and the names of *their friends who also liked it*. For example, the Like button could appear pressed in (which means that you already liked this post) and say "You, Alice, and 13 others liked this." Or "Alice, Bob, and 12 others liked this."

```js
type LikeButtonProps = {
  totalLikeCount: number,
  isLikedByUser: boolean,
  friendLikes: string[]
}
```

Let's call this kind of data a "ViewModel".

```js
type ViewModel = LikeButtonProps;
```

A ViewModel represents data in a way that is directly consumable by the UI (i.e the *view*). It is often significantly different from the raw Model. In our example:

- ViewModel's `totalLikeCount` is aggregated from individual `Like` models.
- ViewModel's `isLikedByUser` is personalized and depends on the user.
- ViewModel's `friendLikes` is both aggregated and personalized. To calculate it, you'd have to takes the Likes for this post, filter them down to likes from friends, and get the first few friends' names (which are likely stored in a different table).

Clearly, Models will need to turn into ViewModels at some point. The question is *where* and *when* this happens in the code, and how that code evolves over time.

---

### REST and JSON API

The most common way to solve this problem is to expose some kind of a JSON API that the client can hit to assemble the ViewModel. There are different ways to design such an API, but the most common way is what's usually known as REST.

The typical way to approach REST ([let's say we've never read this article](https://htmx.org/essays/how-did-rest-come-to-mean-the-opposite-of-rest/)) is to pick some "Resources"--such as a Post, or a Like--and provide JSON API endpoints that list, create, update, and delete such Resources. Naturally, REST does not specify anything about how you should *shape* these Resources so there's a lot of flexibility.

Often, you might start by returning the shape of the Model:

```js
// GET /api/post/123
{
  title: 'My Post',
  content: 'Hello world...',
  authorId: 123,
  createdAt: '2025-04-13T02:04:40.668Z'
}
```

So far so good. But how would you incorporate Likes into this? Maybe `totalLikeCount` and `isLikedByUser` could be a part of the Post Resource:

```js {7,8}
// GET /api/post/123
{
  title: 'My Post',
  content: 'Hello world...',
  authorId: 123,
  createdAt: '2025-04-13T02:04:40.668Z',
  totalLikeCount: 13,
  isLikedByUser: true
}
```

Now, should `friendLikes` also go there? We need this information on the client.

```js {9}
// GET /api/post/123
{
  title: 'My Post',
  authorId: 123,
  content: 'Hello world...',
  createdAt: '2025-04-13T02:04:40.668Z',
  totalLikeCount: 13,
  isLikedByUser: true,
  friendLikes: ['Alice', 'Bob']
}
```

Or are we starting to abuse the notion of a Post by adding too much stuff to it? Okay, how about this, maybe we could offer a separate endpoint for a Post's Likes:

```js {1}
// GET /api/post/123/likes
{
  totalCount: 13,
  likes: [{
    createdAt: '2025-04-13T02:04:41.668Z',
    likedById: 123,
  }, {
    createdAt: '2025-04-13T02:04:42.668Z',
    likedById: 768,
  }, /* ... */]
}
```

So a Post's Like becomes its own "Resource".

That's nice in theory but we're going to need to know the likers' names, and we don't want to make a request for each Like. So we need to "expand" the users here:

```js {6-10,13-17}
// GET /api/post/123/likes
{
  totalCount: 13,
  likes: [{
    createdAt: '2025-04-13T02:04:41.668Z',
    likedBy: {
      id: 123,
      firstName: 'Alice',
      lastName: 'Lovelace'
    }
  }, {
    createdAt: '2025-04-13T02:04:42.668Z',
    likedBy: {
      id: 768,
      firstName: 'Bob',
      lastName: 'Babbage'
    }
  }]
}
```

We also "forgot" which of these Likes are from friends. Should we solve this by having a separate `/api/post/123/friend-likes` endpoint? Or should we order by friends first and include `isFriend` into the `likes` array items so we can disambiguate friends from other likes? Or should we add `?filter=friends`?

Or should we include the friend likes directly into the Post to avoid two API calls?

```js {9-23}
// GET /api/post/123
{
  title: 'My Post',
  authorId: 123,
  content: 'Hello world...',
  createdAt: '2025-04-13T02:04:40.668Z',
  totalLikeCount: 13,
  isLikedByUser: true,
  friendLikes: [{
    createdAt: '2025-04-13T02:04:41.668Z',
    likedBy: {
      id: 123,
      firstName: 'Alice',
      lastName: 'Lovelace'
    }
  }, {
    createdAt: '2025-04-13T02:04:42.668Z',
    likedBy: {
      id: 768,
      firstName: 'Bob',
      lastName: 'Babbage'
    }
  }]
}
```

This seems useful but what if `/api/post/123` gets called from other screens that don't need this information--and you'd rather not slow them down? Maybe there could be an opt-in like `/api/post/123?expand=friendLikes`?

Anyway, the point I'm trying to make here is not that it's *impossible* to design a good REST API. The vast majority of apps I've seen works this way so it's at the very least doable. But anyone who designed one and then worked on it for more than a few months knows the drill. *Evolving REST endpoints is a pain in the ass.*

It usually goes like this:

1. Initially, you have to decide how to structure the JSON output. None of the options are *cleary better* than the rest; mostly you're just guessing how the app will evolve.
2. The initial decisions tend to settle down after a few back-and-forth iterations... until the next UI redesign which causes ViewModels to have slightly different shapes. The already existing REST endpoints don't quite cover the new needs.
3. It's possible to add new REST API endpoints, but at some point you're not really "supposed to" add more because you already defined all the possible Resources. For example, if `/posts/123` exists, you likely won't add another "get post" API.
4. Now you're running into issues with calculating and sending either *not enough* or *too much* data. You either aggressively "expand" fields in the existing Resources or come up with an elaborate set of conventions for doing it on-demand.
5. Some ViewModels are only needed by a subset of screens but they're always included in the response because that's easier than making them configurable.
6. Some screens resort to cobbling their ViewModels together from multiple API calls because no single response contains all the necessary information anymore.
7. Then the design and the functionality of your product changes again. *Repeat.*

There's clearly some fundamental tension here, but what is causing it?

First, note how the shape of the ViewModels is determined by the UI. It's not a reflection of some platonic idea of a Like; rather, it's dictated by the design. We want to show "You, Ann, and 13 others liked this", *therefore* we need these fields:

```js
type LikeButtonProps = {
  totalLikeCount: number,
  isLikedByUser: boolean,
  friendLikes: string[]
}
```

If this screen's design or functionality changes (for example, if you want to show the avatars of your friends who liked the post), the ViewModel will change as well:

```js {4-7}
type LikeButtonProps = {
  totalLikeCount: number,
  isLikedByUser: boolean,
  friendLikes: {
    firstName: string
    avatar: string
  }[]
}
```

But here's the rub.

REST (or, rather, how REST is broadly used) encourages you to think in terms of Resources rather than Models *or* ViewModels. At first, your Resources start out as mirroring Models. But a single Model rarely has enough data for a screen, so you develop ad-hoc conventions for nesting Models in a Resource. However, including *all* the relevant Models (e.g. all Likes of a Post) is often impossible or impractical, so you start adding ViewModel-ish fields like `friendLikes` to your Resources.

But putting ViewModels in Resources also doesn't work very well. ViewModels are not abstract concepts like "a post"; each ViewModel describes a *specific piece of UI*. As a result, the shape of your "Post" Resource grows to encompass the needs of every screen displaying a post. But those needs also *change over time,* so the "Post" Resource's shape is at best a compromise between what different screens need now, and at worst a fossilized record of everything they've ever needed in the past.

Let me put this more bluntly:

**REST Resources don't have a firm grounding in the reality.** Their shapes are not sufficiently constrained--we're making up concepts mostly out of thin air. Unlike Models, they're not grounded in the reality of how the data is stored. And unlike ViewModels, they're not grounded in the reality of how the data is presented. Unfortunately, nudging them in either direction only makes things worse.

If you keep REST Resources close to the Models, you'll hurt the user experience. Now things that could be fetched in a single request would require a couple or, god forbid, N calls. This is especially noticeable in products from companies where the backend team "hands off" a REST API to the frontend team and takes no feedback. The API may look simple and elegant but it is completely impractical to consume.

On the other hand, if you nudge REST Resources to stay closer to the ViewModels, you're hurting maintainability. ViewModels are fickle! Most ViewModels are going to change the next time the corresponding piece of UI is redesigned. But changing the shape of REST Resources is hard--the same Resources are being fetched by many screens. As a result, their shape gradually drifts away from the needs of the current ViewModels, and becomes difficult to evolve. There's a reason the backend teams often resist adding UI-specific fields to the response: they'll likely get stale!

This doesn't necessarily mean that REST itself, as it's broadly understood, is broken. It can be very nice to use when the Resources are well-defined and their fields are well-chosen. But this often goes against the client's needs, which is to get all the data *for a particular screen*. There's something missing in the middle.

We need a translation layer.

---

### API for ViewModels

There is a way to resolve this tension.

You have some latitude with how exactly you could approach it but the main idea is that your client should be able to request *all data for a specific screen at once*.

It's such a simple idea!

Instead of requesting "canonical" REST Resources from the client such as:

```bash
GET /data/post/123       # Get Post Resource
GET /data/post/123/likes # Get Post Likes Resource
```

you request a ViewModel for *a specific screen* (i.e. a route):

```bash
GET /screens/post-details/123 # Get ViewModel for the PostDetails screen
```

This data would include *everything* that screen needs.

The difference is subtle but profound. You're no longer trying to define a universal canonical shape of a *Post*. Rather, you send whatever data the *PostDetails screen* needs in order to display its components *today*. If the PostDetails screen gets deleted, this endpoint gets deleted too. If a different screen wants to display some related information (for example, a PostLikedBy popup), it will gets its own route:

```bash {2}
GET /screens/post-details/123 # Get ViewModel for the PostDetails screen
GET /screens/post-liked-by/123 # Get ViewModel for the PostLikedBy screen
```

Okay, but how does this help?

This avoids the trap of "ungrounded" abstraction. The ViewModel interface for every screen precisely specifies the shape of the server response. If you need to change it or fine-tune it, you can do that without affecting any other screens.

For example, a `PostDetails` screen ViewModel might look like this:

```js
type PostDetailsViewModel = {
  postTitle: string,
  postContent: string,
  postAuthor: {
    name: string,
    avatar: string,
    id: number
  },
  friendLikes: {
    totalLikeCount: number,
    isLikedByUser: boolean,
    friendLikes: string[]
  }
};
```

So that's what the server would return for `/screens/post-details/123`. Later, if you want to display avatars of friend likes, you'd just add it to *that* ViewModel:

```js {12-15}
type PostDetailsViewModel = {
  postTitle: string,
  postContent: string,
  postAuthor: {
    name: string,
    avatar: string,
    id: number
  },
  friendLikes: {
    totalLikeCount: number,
    isLikedByUser: boolean,
    friendLikes: {
      firstName: string
      avatar: string
    }[]
  }
}
```

Note that you'd only have to update *that screen's endpoint*. You're no longer forced to balance what one screen needs with what another screen needs. There are no questions like "which Resource does this field belong to?", or whether it should be "expanded". If some screen needs more data than others, you can just include more data in *that* screen's response--it doesn't have to be generic or configurable. **The shape of the server response is exactly determined by each screen's needs.**

This *does* solve the stated problems with REST.

It also introduces a few novel questions:

1. There's going to be *a lot* more endpoints than with REST Resources--an endpoint per screen. How will these endpoints be structured and kept maintainable?
2. How do you reuse code between the endpoints? Presumably there would be a lot of duplicated data access and other business logic between those endpoints.
3. How do you convince the backend team to pivot from their REST APIs to this?

The last question is probably the first we need to resolve. The backend team will likely have very warranted reservations about this approach. At the very least, if this approach proves terrible, it would be good to have a way to migrate back.

Luckily, there's no need to throw anything away.

---

### Backend For Frontend

Instead or *replacing* your existing REST API, you can add a new *layer* in front of it:

```js {1-2,4-6}
// You're adding new screen-specific endpoints...
app.get('/screen/post-details/:postId', async (req, res) => {
  const [post, friendLikes] = await Promise.all([
    // ...which call your existing REST API here
    fetch(`/api/post/${postId}`).then(r => r.json()),
    fetch(`/api/post/${postId}/friend-likes`).then(r => r.json()),
  ]);
  const viewModel = {
    postTitle: post.title,
    postContent: parseMarkdown(post.content),
    postAuthor: post.author,
    postLikes: {
      totalLikeCount: post.totalLikeCount,
      isLikedByUser: post.isLikedByUser,
      friendLikes: friendLikes.likes.map(l => l.firstName)
    }
  };
  res.json(viewModel);
});
```

This is not a new idea. Such a layer is often called BFF, or *Backend for Frontend.* In this case, the job of the BFF is to adapt your REST API to returning ViewModels.

**If some screen needs more data, a BFF lets you serve more data to it without changing your entire data model. It keeps screen-specific changes scoped. Crucially, it lets you deliver all the data any screen needs in a single roundtrip.**

The BFF doesn't have to be written in the same language as your REST API. For reasons we'll get into later, it's advantageous to write BFF in the same language as your frontend code. You can think of it as *a piece of the frontend that happens to run on the server*. It's like the frontend's "ambassador" to the server. It "adapts" the REST responses into the shape that each screen of the frontend UI actually wants.

Although you can get some of the benefits of BFF with client-only per-route loaders like [`clientLoader` in React Router](https://reactrouter.com/start/framework/data-loading#client-data-loading), there's a lot you unlock by actually deploying this layer on the server close to where the REST endpoints are deployed.

For example, even if you *do* have to make several REST API requests serially one after another to load all the necessary data for a screen, the latency between the BFF and your REST API would be much lower than when making multiple serial requests from the client. If your REST API responses are fast on the internal network, you can cut down literal seconds of what used to be client/sever waterfalls without actually parallelizing the (sometimes inevitable) serial calls.

A BFF also lets you apply data transformations *before* sending data to the client, which can significantly improve performance on low-end client devices. You can even go as far as to cache or persist some computations on the disk, even *between* different users, since you have access to the disk--and to server caches like Redis. In that sense, a BFF lets a frontend team have *their very own little slice of the server*.

Importantly, a BFF gives you a way to experiment with alternatives to your REST APIs without affecting the client application. For example, if your REST API has no other consumers, you can turn it into an internal microservice and avoid exposing it to the world. Moreover, you could turn it into a *data access layer* rather than an HTTP service, and simply *import* that data access layer in-process from your BFF:

```js {1,6-8}
import { getPost, getFriendLikes } from '@your-company/data-layer';

app.get('/screen/post-details/:postId', async (req, res) => {
  const postId = req.params.postId;
  const [post, friendLikes] = await Promise.all([
    // Reads from an ORM and applies business logic.
    getPost(postId),
    getFriendLikes(postId, { limit: 2 }),
  ]);
  const viewModel = {
    postTitle: post.title,
    postContent: parseMarkdown(post.content),
    postAuthor: post.author,
    postLikes: {
      totalLikeCount: post.totalLikeCount,
      isLikedByUser: post.isLikedByUser,
      friendLikes: friendLikes.likes.map(l => l.firstName)
    }
  };
  res.json(viewModel);
});
```

(Of course, this part only works if you can write lower-level backend logic in JS.)

This can help you avoid problems like loading the same information many times from the database (no `fetch` calls means database reads can be batched). It also lets you "drop down" the abstraction level when needed--for example, to run a fine-tuned stored database procedure that isn't neatly exposed over the REST API.

There's a lot to like about the BFF pattern. It solves quite a few problems but it also raises new questions. For example, how do you organize its code? If each screen is essentially its own API method, how do you avoid duplication of code? And how do you keep your BFF synchronized with data requirements of the front-end side?

Let's try to make some progress on answering those.

---

### Composable BFF

Suppose you're adding a new `PostList` screen. It's going to render *an array* of `<PostDetails>` components, each of which needs the same data as before:

```js
type PostDetailsViewModel = {
  postTitle: string,
  postContent: string,
  postAuthor: {
    name: string,
    avatar: string,
    id: number
  },
  friendLikes: {
    totalLikeCount: number,
    isLikedByUser: boolean,
    friendLikes: string[]
  }
};
```

So the ViewModel for `PostList` contains an array of `PostDetailsViewModel`:

```js
type PostListViewModel = {
  posts: PostDetailsViewModel[]
};
```

How would you load the data for `PostList`?

Your first inclination may be to make a series of requests from the client to the existing `/screen/post-details/:postId` endpoint which already knows how to prepare a ViewModel for a single post. We just need to call it for every post.

But wait, this defeats the entire purpose of the BFF! Making many requests for a single screen is inefficient and is precisely the kind of compromise that we've been trying to avoid. **Instead, we'll add a new BFF endpoint for the new screen.**

The new endpoint might initially look like this:

```js {22-47}
import { getPost, getFriendLikes, getRecentPostIds } from '@your-company/data-layer';

app.get('/screen/post-details/:postId', async (req, res) => {
  const postId = req.params.postId;
  const [post, friendLikes] = await Promise.all([
    getPost(postId),
    getFriendLikes(postId, { limit: 2 }),
  ]);
  const viewModel = {
    postTitle: post.title,
    postContent: parseMarkdown(post.content),
    postAuthor: post.author,
    postLikes: {
      totalLikeCount: post.totalLikeCount,
      isLikedByUser: post.isLikedByUser,
      friendLikes: friendLikes.likes.map(l => l.firstName)
    }
  };
  res.json(viewModel);
});

app.get('/screen/post-list', async (req, res) => {
  // Grab the recent post IDs
  const postIds = await getRecentPostIds();
  const viewModel = {
    // For each post ID, load the data in parallel
    posts: await Promise.all(postIds.map(async postId => {
      const [post, friendLikes] = await Promise.all([
        getPost(postId),
        getFriendLikes(postId, { limit: 2 }),
      ]);
      const postDetailsViewModel = {
        postTitle: post.title,
        postContent: parseMarkdown(post.content),
        postAuthor: post.author,
        postLikes: {
          totalLikeCount: post.totalLikeCount,
          isLikedByUser: post.isLikedByUser,
          friendLikes: friendLikes.likes.map(l => l.firstName)
        }
      };
      return postDetailsViewModel;
    }))
  };
  res.json(viewModel);
});
```

However, note that there's significant code duplication between the endpoints:

```js {5-8,10-17,26-29,31-38}
import { getPost, getFriendLikes, getRecentPostIds } from '@your-company/data-layer';

app.get('/screen/post-details/:postId', async (req, res) => {
  const postId = req.params.postId;
  const [post, friendLikes] = await Promise.all([
    getPost(postId),
    getFriendLikes(postId, { limit: 2 }),
  ]);
  const viewModel = {
    postTitle: post.title,
    postContent: parseMarkdown(post.content),
    postAuthor: post.author,
    postLikes: {
      totalLikeCount: post.totalLikeCount,
      isLikedByUser: post.isLikedByUser,
      friendLikes: friendLikes.likes.map(l => l.firstName)
    }
  };
  res.json(viewModel);
});

app.get('/screen/post-list', async (req, res) => {
  const postIds = await getRecentPostIds();
  const viewModel = {
    posts: await Promise.all(postIds.map(async postId => {
      const [post, friendLikes] = await Promise.all([
        getPost(postId),
        getFriendLikes(postId, { limit: 2 }),
      ]);
      const postDetailsViewModel = {
        postTitle: post.title,
        postAuthor: post.author,
        postContent: parseMarkdown(post.content),
        postLikes: {
          totalLikeCount: post.totalLikeCount,
          isLikedByUser: post.isLikedByUser,
          friendLikes: friendLikes.likes.map(l => l.firstName)
        }
      };
      return postDetailsViewModel;
    }))
  };
  res.json(viewModel);
});
```

It's almost like there is a notion of “`PostDetails` ViewModel” begging to be extracted. This should not be surprising--both screens render the same `<PostDetails>` component, so they need similar code to load the data for it.

---

### Extracting a ViewModel

Let's extract a `PostDetailsViewModel` function:

```js {3-18,22,29-31}
import { getPost, getFriendLikes, getRecentPostIds } from '@your-company/data-layer';

async function PostDetailsViewModel({ postId }) {
  const [post, friendLikes] = await Promise.all([
    getPost(postId),
    getFriendLikes(postId, { limit: 2 }),
  ]);
  return {
    postTitle: post.title,
    postContent: parseMarkdown(post.content),
    postAuthor: post.author,
    postLikes: {
      totalLikeCount: post.totalLikeCount,
      isLikedByUser: post.isLikedByUser,
      friendLikes: friendLikes.likes.map(l => l.firstName)
    }
  };
}

app.get('/screen/post-details/:postId', async (req, res) => {
  const postId = req.params.postId;
  const viewModel = await PostDetailsViewModel({ postId });
  res.json(viewModel);
});

app.get('/screen/post-list', async (req, res) => {
  const postIds = await getRecentPostIds();
  const viewModel = {
    posts: await Promise.all(postIds.map(postId =>
      PostDetailsViewModel({ postId })
    ))
  };
  res.json(viewModel);
});
```

This makes our BFF endpoints significantly simpler.

In fact, we can go a bit further. Look at this part of `PostDetailsViewModel`:

```js {10-14}
async function PostDetailsViewModel({ postId }) {
  const [post, friendLikes] = await Promise.all([
    getPost(postId),
    getFriendLikes(postId, { limit: 2 }),
  ]);
  return {
    postTitle: post.title,
    postContent: parseMarkdown(post.content),
    postAuthor: post.author,
    postLikes: {
      totalLikeCount: post.totalLikeCount,
      isLikedByUser: post.isLikedByUser,
      friendLikes: friendLikes.likes.map(l => l.firstName)
    }
  };
}
```

We know that the purpose of the `postLikes` field is to eventually become props for the `LikeButton` component--i.e. this field is `LikeButton`'s ViewModel:

```js {2-4}
function LikeButton({
  totalLikeCount,
  isLikedByUser,
  friendLikes
}) {
  // ...
}
```

So let's extract the logic preparing these props into `LikeButtonViewModel`:

```js {3-12,18,24}
import { getPost, getFriendLikes, getRecentPostIds } from '@your-company/data-layer';

async function LikeButtonViewModel({ postId }) {
  const [post, friendLikes] = await Promise.all([
    getPost(postId),
    getFriendLikes(postId, { limit: 2 }),
  ]);
  return {
    totalLikeCount: post.totalLikeCount,
    isLikedByUser: post.isLikedByUser,
    friendLikes: friendLikes.likes.map(l => l.firstName)
  };
}

async function PostDetailsViewModel({ postId }) {
  const [post, postLikes] = await Promise.all([
    getPost(postId), // It's fine to getPost() here again. Our data layer deduplicates calls via an in-memory cache.
    LikeButtonViewModel({ postId }),
  ]);
  return {
    postTitle: post.title,
    postContent: parseMarkdown(post.content),
    postAuthor: post.author,
    postLikes
  };
}
```

Now we have a tree of functions that load data as JSON--our ViewModels.

Depending on your background, this might remind you of a few other things. It might remind you of composing Redux reducers out of smaller reducers. It might also remind you of composing GraphQL fragments out of smaller fragments. Or it might remind you of composing React components from other React components.

Although the code style is a little verbose now, there is something oddly satisfying in breaking apart a screen's ViewModel into smaller ViewModels. It feels similar to writing a React component tree, except that we're decomposing a backend API. It's like *the data has its own shape but it roughly lines up with your React component tree*.

Let's see what happens when the UI needs to evolve.

---

### Evolving a ViewModel

Suppose the UI design changes, and we want to display friends' avatars too:

```js {4-7}
type LikeButtonProps = {
  totalLikeCount: number,
  isLikedByUser: boolean,
  friendLikes: {
    firstName: string
    avatar: string
  }[]
}
```

Assuming we use TypeScript, we'll immediately get a type error in the ViewModel:

```js {3,11-12}
async function LikeButtonViewModel(
  { postId } : { postId: number }
) : LikeButtonProps {
  const [post, friendLikes] = await Promise.all([
    getPost(postId),
    getFriendLikes(postId, { limit: 2 }),
  ]);
  return {
    totalLikeCount: post.totalLikeCount,
    isLikedByUser: post.isLikedByUser,
    // 🔴 Type 'string[]' is not assignable to type '{ firstName: string; avatar: string; }[]'.
    friendLikes: friendLikes.likes.map(l => l.firstName)
  };
}
```

Let's fix it:

```js {11-14}
async function LikeButtonViewModel(
  { postId } : { postId: number }
) : LikeButtonProps {
  const [post, friendLikes] = await Promise.all([
    getPost(postId),
    getFriendLikes(postId, { limit: 2 }),
  ]);
  return {
    totalLikeCount: post.totalLikeCount,
    isLikedByUser: post.isLikedByUser,
    friendLikes: friendLikes.likes.map(l => ({
      firstName: l.firstName,
      avatar: l.avatar,
    }))
  };
}
```

Now the BFF response for every screen that includes a `LikeButton` ViewModel will use the new `friendLikes` format, which is exactly what the `LikeButton` React component wants. There are no further changes to make--*it just works*. We *know* that it works because `LikeButtonViewModel` is the only place generating props for a `LikeButton`, no matter which screen we're requesting from the BFF. (For now assume that this is true; we're still yet to decide how exactly to tie them.)

I'd like to call attention to the previous fact because this is quite profound.

When was the last time you could clearly trace the correspondence between a deeply nested piece of server code generating a fragment of data, and a deeply nested piece of the client code consuming that data? We're clearly onto *something*.

---

### ViewModel Parameters

You might have noticed that ViewModel functions can take parameters. Importantly, these parameters can be specified by the "parent" ViewModel functions and plumbed down--so the client doesn't need to be aware of them.

For example, suppose you wanted to make the Post List page only display the first paragraph of every post's content. Let's add a parameter to its ViewModel:

```js {3,11-13,23,34}
async function PostDetailsViewModel({
  postId,
  truncateContent
}) {
  const [post, postLikes] = await Promise.all([
    getPost(postId),
    LikeButtonViewModel({ postId }),
  ]);
  return {
    postTitle: post.title,
    postContent: parseMarkdown(post.content, {
      maxParagraphs: truncateContent ? 1 : undefined
    }),
    postAuthor: post.author,
    postLikes
  };
}

app.get('/screen/post-details/:postId', async (req, res) => {
  const postId = req.params.postId;
  const viewModel = await PostDetailsViewModel({
    postId,
    truncateContent: false
  });
  res.json(viewModel);
});

app.get('/screen/post-list', async (req, res) => {
  const postIds = await getRecentPostIds();
  const viewModel = {
    posts: await Promise.all(postIds.map(postId =>
      PostDetailsViewModel({
        postId,
        truncateContent: true
      })
    ))
  };
  res.json(viewModel);
});
```

The JSON response for the `post-details` endpoint still includes the entire posts, but the `post-list` JSON endpoint will now only serve their abridged summaries. This is a *view model* concern, and now we have a natural place to express it in code.

---

### Plumbing ViewModel Parameters

Next, suppose you wanted to include avatars only on the Details screen. Let's edit `LikeButtonViewModel` to take and respect an `includeAvatars` parameter:

```js {3,14}
async function LikeButtonViewModel({
  postId,
  includeAvatars
}) {
  const [post, friendLikes] = await Promise.all([
    getPost(postId),
    getFriendLikes(postId, { limit: 2 }),
  ]);
  return {
    totalLikeCount: post.totalLikeCount,
    isLikedByUser: post.isLikedByUser,
    friendLikes: friendLikes.likes.map(l => ({
      firstName: l.firstName,
      avatar: includeAvatars ? l.avatar : null,
    }))
  };
}
```

Now you can plumb it down all the way from the BFF endpoints:

```js {4,8,25,37}
async function PostDetailsViewModel({
  postId,
  truncateContent,
  includeAvatars
}) {
  const [post, postLikes] = await Promise.all([
    getPost(postId),
    LikeButtonViewModel({ postId, includeAvatars }),
  ]);
  return {
    postTitle: post.title,
    postContent: parseMarkdown(post.content, {
      maxParagraphs: truncateContent ? 1 : undefined
    }),
    postAuthor: post.author,
    postLikes
  };
}

app.get('/screen/post-details/:postId', async (req, res) => {
  const postId = req.params.postId;
  const viewModel = await PostDetailsViewModel({
    postId,
    truncateContent: false,
    includeAvatars: true
  });
  res.json(viewModel);
});

app.get('/screen/post-list', async (req, res) => {
  const postIds = await getRecentPostIds();
  const viewModel = {
    posts: await Promise.all(postIds.map(postId =>
      PostDetailsViewModel({
        postId,
        truncateContent: true,
        includeAvatars: false
      })
    ))
  };
  res.json(viewModel);
});
```

Again, the client doesn't pass ad-hoc parameters like `?includeAvatars=true` to the server to ensure that the avatars are included in the JSON response. Instead, the `post-list` BFF endpoint itself *knows* a Post List shouldn't include avatars, so it can pass `includeAvatars: false` to `PostDetailsViewModel`, which plumbs it down to `LikeButtonViewModel`. The client code doesn't need to be aware of the server logic at all--all it cares about is that it gets the props that it wants.

For the case when we *do* show avatars of friends, we might want to show five rather than two. We can make that change directly in `LikeButtonViewModel`:

```js {7}
async function LikeButtonViewModel({
  postId,
  includeAvatars
}) {
  const [post, friendLikes] = await Promise.all([
    getPost(postId),
    getFriendLikes(postId, { limit: includeAvatars ? 5 : 2 }),
  ]);
  return {
    totalLikeCount: post.totalLikeCount,
    isLikedByUser: post.isLikedByUser,
    friendLikes: friendLikes.likes.map(l => ({
      firstName: l.firstName,
      avatar: includeAvatars ? l.avatar : null,
    }))
  };
}
```

Since the `LikeButtonViewModel` function exists solely to generate the `LikeButton` props, adding more presentational logic here feels natural. It's a *view* model, right? If another view *wanted* to show a different number of avatars, it could do that. Unlike with REST, there is no canonical notion of a "post"--so any UI can specify *exactly* the data it needs, from a screen all the way down to a button.

Our ViewModels evolve in the exact lockstep with the needs of the client.

---

### Composing ViewModels

Something interesting is taking shape. We've started to split our BFF endpoints into units of reusable logic, and we've found that these units let us encapsulate *data loading* in a similar way as we've been encapsulating the *user interface*. If you squint at ViewModels, you might even see some parallels to components.

And yet the end result of the ViewModel tree is not a UI tree--it's just JSON.

```js
// GET /screen/post-list
{
  /* Begin screen/post-list ViewModel */
  posts: [{
    /* Begin PostDetailsViewModel */
    postTitle: "JSX Over The Wire",
    postAuthor: "Dan",
    postContent: "Suppose you have an API route that returns some data as JSON.",
    postLikes: {
      /* Begin LikeButtonViewModel */
      totalLikeCount: 8,
      isLikedByUser: false,
      friendLikes: [{
        firstName: "Alice"
      }, {
        firstName: "Bob"
      }]
      /* End LikeButtonViewModel */
    }
    /* End PostDetailsViewModel */
  }, {
    /* Begin PostDetailsViewModel */
    postTitle: "React for Two Computers",
    postAuthor: "Dan",
    postContent: "I’ve been trying to write this post at least a dozen times.",
    postLikes: {
      /* Begin LikeButtonViewModel */
      totalLikeCount: 13,
      isLikedByUser: true,
      friendLikes: [{
        firstName: "Bob"
      }]
      /* End LikeButtonViewModel */
    }
    /* End PostDetailsViewModel */
  }]
}
```

But what should we *do* with that JSON?

In the end, *somehow* we want the props generated by `LikeButtonViewModel` to end up in the `LikeButton` component. Likewise, *somehow* we want the props generated by `PostDetailsViewModel` to get to the `PostDetails` component. We don't want to generate a huge ViewModel tree of JSON just to manually plumb every piece of it down exactly to the component that needs that ViewModel's data.

We're building two parallel hierarchies in the two worlds.

But these worlds are not connected yet.

Something is missing.

---

### Recap: JSON as Components

- For any UI, the data begins its life as Models and ends its life as ViewModels. The transformation between Models and ViewModels has to happen somewhere.
- The shape of ViewModels is fully dictated by the design of our user interface. This means that they will evolve over time together with our designs. Also, different screens need different ViewModels aggregated from the same underlying Models.
- Modeling data from the server as REST Resources creates a tension. If REST Resources are close to raw Models, it may require multiple roundtrips and complex ad-hoc conventions to obtain the necessary ViewModels for a screen. If REST Resources are close to ViewModels, they get too coupled to the initial screens they were designed to represent, and don't evolve together with the needs of the client.
- We can resolve this tension by creating another layer--a *Backend For Frontend* (BFF). The job of the BFF is to translate the needs of the client ("give me data for this screen") to REST calls on the backend. A BFF can also evolve beyond being a facade for REST, and instead load data directly using an in-process data layer.
- Since the BFF's job is to return all the data needed for each screen as a piece of JSON, it is natural to split up the data loading logic into reusable units. A screen's ViewModel can be decomposed into a tree of ViewModels, corresponding to the pieces of server data that different components will want to receive on the client. These individual ViewModels can then be recombined and composed together.
- These ViewModel functions can pass information to each other. This lets us customize the JSON we're sending depending on the screen. Unlike with REST, we're no longer trying to design canonical shapes like a "a post object" used throughout all responses. At any point, we can diverge and serve different ViewModels for the same information to different screens--whatever *they* want. These ViewModels are *view* models. They can--should?--have presentation logic.
- We're beginning to realize that ViewModels form a very similar structure to React components. *ViewModels are like components, but for generating JSON*. However, we still haven't figured out how to actually *pass* the JSON they're generating on the server to the components that need it on the client. It's also annoying to deal with two parallel hierarchies. We're onto something, but we're missing something.

What are we missing?

---

## Part 2: Components as JSON

### HTML, SSI, and CGI

JSON, MVVM, BFF, what the hell was that?!

What an incredibly overengineered way to make a website. These React complexity peddlers are *so* out of touch. If only they knew the *history*.

Back in *my* days, we'd just write a bit of HTML and call it a day.

My `index.html` homepage would look like this:

```js
<html>
  <body>
    <h1>Welcome to my blog!</h1>
    <h2>Latest posts</h2>
    <h3>
      <a href="/jsx-over-the-wire.html">
        JSX Over The Wire
      </a>
    </h3>
    <p>
      Suppose you have an API route that returns some data as JSON. [...]
    </p>
    <h3>
      <a href="/jsx-over-the-wire.html">
        React for Two Computers
      </a>
    </h3>
    <p>
      I’ve been trying to write this post at least a dozen times. [...]
    </p>
    ...
  </body>
</html>
```

Then my `jsx-over-the-wire.html` post details page would look like this:

```js
<html>
  <body>
    <h1>JSX Over The Wire</h1>
    <p>
      Suppose you have an API route that returns some data as JSON.
    </p>
    ...
  </body>
</html>
```

I'd put these files on a box with Apache and that would be it!

Now suppose I wanted to add a footer to all my pages. That couldn't be easier. First, let me create a file called `includes/footer.html` with my footer:

```js
<marquee>
  <a href="/">overreacted</a>
</marquee>
```

Now I can include my footer on any page with [Server-Side Includes  (SSI)](https://en.wikipedia.org/wiki/Server_Side_Includes):

```js {6}
<html>
  <body>
    <h1>Welcome to my blog!</h1>
    <h2>Latest posts</h2>
    ...
    <!--#include virtual="/includes/footer.html" -->
  </body>
</html>
```

In fact, I don't want to copy and paste the first paragraph of each blog post into my `index.html` file so I might use SSI together with [CGI](https://en.wikipedia.org/wiki/Common_Gateway_Interface) to *generate* my index page:

```js {5-6}
<html>
  <body>
    <h1>Welcome to my blog!</h1>
    <h2>Latest posts</h2>
    <!--#include virtual="/cgi-bin/post-details.cgi?jsx-over-the-wire&truncateContent=true" -->
    <!--#include virtual="/cgi-bin/post-details.cgi?react-for-two-computers&truncateContent=true" -->
    <!--#include virtual="/includes/footer.html" -->
  </body>
</html>
```

Likewise, the details page will delegate to the same `post-details.cgi` script:

```js {3}
<html>
  <body>
    <!--#include virtual="/cgi-bin/post-details.cgi?jsx-over-the-wire&truncateContent=false" -->
    <!--#include virtual="/includes/footer.html" -->
  </body>
</html>
````

Finally, the `post-details.cgi` script might talk to the database:

```bash
#!/bin/sh
echo "Content-type: text/html"
echo ""

POST_ID="$(echo "$QUERY_STRING" | cut -d'&' -f1 | tr -cd '[:alnum:]._-')"
TRUNCATE="$(echo "$QUERY_STRING" | grep -c "truncateContent=true")"

TITLE=$(mysql -u admin -p'password' -D blog --skip-column-names -e \
  "SELECT title FROM posts WHERE url='$POST_ID'")
CONTENT=$(mysql -u admin -p'password' -D blog --skip-column-names -e \
  "SELECT content FROM posts WHERE url='$POST_ID'")

if [ "$TRUNCATE" = "1" ]; then
  FIRST_PARAGRAPH="$(printf "%s" "$CONTENT" | sed '/^$/q')"
  echo "<h3><a href=\"/$POST_ID.html\">$TITLE</a></h3>"
  echo "<p>$FIRST_PARAGRAPH [...]</p>"
else
  echo "<h1>$TITLE</h1>"
  echo "<p>"
  echo "$CONTENT"
  echo "</p>"
fi
```

We're in the *nineties*, okay?

So far everything is very simple, even if a bit tedious to write. What we have here is a server that returns *all the data necessary for any given screen in one roundtrip*.

*(Hmm...)*

Of course, different screens may need the same data, and we don't want to duplicate the logic. Luckily, we can *reuse dynamic includes* such as `post-details.cgi`. We can *even pass parameters* to them like `truncateContent`.

The most annoying thing about this code is that working in Bash is really not for the faint-hearted (i.e. not for me). Let's see if we can improve on that part.

---

### PHP and XHP

We could translate this entire example to old school PHP, which gives us better control flow, function calls, variables, and so on. However, I want to skip ahead.

No, not to the modern PHP MVC frameworks.

I want to skip ahead to [XHP](https://codebeforethehorse.tumblr.com/post/3096387855/an-introduction-to-xhp).

You see, the problem with the early PHP programs was that they relied on string manipulation of HTML. In that sense the PHP version doesn't improve by much:

```php
if ($truncate) {
  $splitContent = explode("\n\n", $content);
  $firstParagraph = $splitContent[0];
  echo "<h3><a href=\"/$postId.php\">$title</a></h3>";
  echo "<p>$firstParagraph [...]</p>";
} else {
  echo "<h1>$title</h1>";
  echo "<p>$content</p>";
}
```

Manipulating HTML as strings leads to code that's tangled, insecure, and difficult to maintain. Most people in the web development community took that as a signal to embrace [Rails-style MVC](https://guides.rubyonrails.org/layouts_and_rendering.html) where all the HTML was safely moved out of the code into separate files called *templates* (and all the data fetching moved to *controllers*).

However, that's not what happened at Facebook.

At Facebook, they had a different idea.

The problem with PHP, said Facebook engineers, was not the manipulation of markup *per se*. What was bad is *unprincipled* manipulation of markup, i.e. treating markup as a plain string. Markup has a certain *shape* to it--stuff contained in other stuff. What we need is a way to build and manipulate that markup without accidentally destroying its contents or interpolating unsafe content into it:

```php
if ($truncate) {
  $splitContent = explode("\n\n", $content);
  $firstParagraph = $splitContent[0];
  echo
    <x:frag>
      <h3><a href={"/{$postId}.php"}>{$title}</a></h3>
      <p>{$firstParagraph} [...]</p>
    </x:frag>;
} else {
  echo
    <x:frag>
      <h1>{$title}</h1>
      <p>{$content}</p>
    </x:frag>;
}
```

These tags are not strings of HTML! They're *objects* than can be *turned* into HTML.

Now that we've moved markup *into* our code in a maintainable way, we can create our own abstractions. For example, we can define our own `<ui:post-details>`:

```php {1}
class :ui:post-details extends :x:element {
  protected function render(): XHPRoot {
    if ($this->:truncateContent) {
      $splitContent = explode("\n\n", $this->:content);
      $firstParagraph = $splitContent[0];
      return
        <x:frag>
          <h3><a href={"/{$postId}.php"}>{$this->:title}</a></h3>
          <p>{$firstParagraph} [...]</p>
        </x:frag>;
    } else {
      return
        <x:frag>
          <h1>{$this->:title}</h1>
          <p>{$this->:content}</p>
        </x:frag>;
    }
  }
}
```

And then we can render it to the page:

```php
echo
  <ui:post-details
    postId="jsx-over-the-wire"
    truncateContent={true}
    title="JSX Over The Wire"
    content="Suppose you have an API route that returns some data..."
  />;
```

In fact, we can build an entire web application this way. Tags render other tags, which render other tags, and so on. By eschewing the Rails-style MVC model, we've accidentally discovered a much older principle: function composition.

One downside of XHP is that it isn't very well-suited to client interactivity. Since XHP executes on a server that emits HTML, the most that you can do relatively seamlessly is to replace *parts* of an existing markup with the newly generated HTML markup from the server by updating `innerHTML` of some DOM node.

Replacing `innerHTML` wasn't working out particularly well--especially for the highly interative Ads product--which made an engineer (who was not me, by the way) wonder whether it's possible to run an XHP-style "tags render other tags" paradigm directly on the client computer without losing state between the re-renders. As you might gave guessed, this led to the [invention of JSX and React.](https://legacy.reactjs.org/blog/2016/09/28/our-first-50000-stars.html#archeology)

Who cares about React though?

We're here to shill XHP.

---

### Async XHP

Earlier, `<ui:post-details>` got `title` and `content` from the calling code:

```php
echo
  <ui:post-details
    postId="jsx-over-the-wire"
    truncateContent={true}
    title="JSX Over The Wire"
    content="Suppose you have an API route that returns some data..."
  />;
```

It was not reading `title` or `content` on its own--after all, reading them from a database is (ideally) an *asynchronous* operation, while XHP tags are synchronous.

*Were.*

At some point, engineers at Facebook realized that XHP tags would be a lot more powerful if they could load their own data. [Async XHP tags](https://hhvm.github.io/xhp-lib/2015/06/01/new-features-in-depth.html#asynchronous-xhp-rendering) were born:

```php {4-5}
class :ui:post-details extends :x:element {
  use XHPAsync;

  protected async function asyncRender(): Awaitable<XHPRoot> {
    $post = await loadPost($this->:postId);
    $title = $post->title;
    $content = $post->content;
    // ...
  }
}
```

Now the `<ui:post-details>` can *load its own data* based on `postId` alone:

```php {6,10}
class :ui:post-list extends :x:element {
  protected function render(): XHPRoot {
    return
      <x:frag>
        <ui:post-details
          postId="jsx-over-the-wire"
          truncateContent={true}
        />
        <ui:post-details
          postId="react-for-two-computers"
          truncateContent={true}
        />
        ...
      </x:frag>;
  }
}
```

This approach lets you write the entire UI as *asynchronous* tags rendering other *asynchronous* tags--until the final HTML is generated. It's a powerful way to think about UI and data. It lets you write self-contained components that load their own data, and then plug those components anywhere in the tree with a one-liner. And since XHP tags run on the server, the entire screen is resolved *in a single roundtrip*.

```php
<ui:post-list /> // An entire page of HTML
```

**I need to emphasize this again. Async XHP allowed *self-contained components that load their own data* -- but! -- *displaying a screen took a single client/server roundtrip.* There aren't many UI frameworks that satisfy both of these points.**

If you're making a similar framework, there's a few details you should think about:

1. You want the siblings to be resolved in parallel. For example, the two `<ui:post-details>` above should `loadPost` around the same time. Async XHP did this.
2. You also need some way to *unblock* the rest of the page if a particular branch of the tree is taking too long. Facebook had a [BigPipe  "pagelet"](https://engineering.fb.com/2010/06/04/web/bigpipe-pipelining-web-pages-for-high-performance/) system that flushes the tree "in parts" with explicitly designed loading states acting as the seams.
3. Ideally, you want a data access layer that's able to batch reads and share an in-memory cache across different parts of the request. This ensures that even if tags deeper in the tree start "fetching" later than their parents, you're utilizing both CPU and IO well--there are always some tags to render while waiting for the DB.

Overall, async XHP was an incredibly productive mental model to work with--as long as your app was not very interactive. Unfortunately, for highly interactive apps, emitting HTML is not enough. You *need* to be able to navigate, handle mutations, and refresh content without losing the client-side state. Since XHP targeted HTML, it was a poor fit for rich interfaces, and React gradually took over.

**Still, as interfaces were being converted to React, there was a noticeable loss in conceptual simplicity. The UI and the *data that it needs*--two things that are so naturally described together--were being pulled apart into separate codebases.**

GraphQL with [Relay](https://relay.dev/) were somewhat bridging that gap and contributed some very important innovations, but using them never felt *as direct* as writing async XHP.

---

### Native Templates

XHP had an unlikely comeback at Facebook.

The mental model it offered was so productive that people didn't just want to write web interfaces with it. They also wanted to make *native apps* with it.

Think about it.

This piece of XHP is an *object:*

```js
<x:frag>
  <h1>{$this->:title}</h1>
  <p>{$this->:content}</p>
</x:frag>
```

Yes, it *can* be turned into a piece of HTML:

```js
<h1>JSX Over The Wire</h1>
<p>Suppose you have an API route that returns some data as JSON</p>
```

But it could also be turned into another representation, such as JSON:

```js
{
  type: 'x:frag',
  props: {
    children: [{
      type: 'h1',
      props: {
        children: 'JSX Over The Wire'
      }
    },
    {
      type: 'p',
      props: {
        children: 'Suppose you have an API route that returns some data as JSON'
      }
    }]
  }
}
```

There's nothing that *actually* constrains you to the primitives available in HTML. For example, `<ui:post-details>` could have been emitting [iOS views](https://developer.apple.com/documentation/uikit/uitextview) instead:

```js {2-3}
<x:frag>
  <ios:UITextView>{$this->:title}</ios:UITextView>
  <ios:UITextView>{$this->:content}</ios:UITextView>
</x:frag>
```

These tags could be transported as JSON over the network to a native iOS app that would read that JSON and construct a native iOS view hierarchy from these tags.

```js {5,11}
{
  type: 'x:frag',
  props: {
    children: [{
      type: 'ios:UITextView',
      props: {
        children: 'JSX Over The Wire'
      }
    },
    {
      type: 'ios:UITextView',
      props: {
        children: 'Suppose you have an API route that returns some data as JSON'
      }
    }]
  }
}
```

Meanwhile, on the server, you can define your own tags that render those tags:

```js
class :ui:post-list extends :x:element {
  protected function render(): XHPRoot {
    return
      <x:frag>
        <ui:post-details
          postId="jsx-over-the-wire"
          truncateContent={true}
        />
        <ui:post-details
          postId="react-for-two-computers"
          truncateContent={true}
        />
        ...
      </x:frag>
  }
}
```

In other words, you'd have a server endpoint that returns *the entire data that any particular screen needs in a single roundtrip*. Where the "data" is the native UI.

```php
<ui:post-list /> // A screen of iOS components
```

You might think this wouldn't work because a native app can't rely on a backend in the critical path. However, that's a misunderstanding of the approach. All you need to ensure is that you *request more UI* in the same situations as *when you would make an API call,* and not more often. You'll also want to have a fallback UI (like a spinner) available instantly *just like when making an API call.* In fact, you can even bundle the JSON for some of the initial screens directly within your app's binary.

In practice, system components like `ios:UITextView` are a bit too low-level to be good primitives for this kind of format. You really want to have a good "palette" of highly interactive primitives since you want *some* interactions to "skip the server" and be entirely local. For example, you might implement an `ios:ColorPicker` primitive in the native code so that it follows your finger's movement, but *persist* the chosen color using a call to the API that will serve you the next screen as JSON.

Also, if you made the primitives platform-agnostic (which Facebook did), you could use the same server codebase to assemble screens for both iOS and Android:

```js
<nt:flexbox flex-direction="column">
  <nt:text font-size={24} font-weight={FontWeight::BOLD}>
    {$this->:title}
  </nt:text>
  <nt:text font-size={18}>
    {$this->:content}
  </nt:text>
</nt:flexbox>
```

Okay, returning an entire screen as JSON, has anyone done this before?

---

### SDUI

This is not a novel idea.

This is not even a controversial idea.

You've heard of HTML, right? This is like HTML, but with *your* design system. Imagine an API endpoint that returns some UI as JSON. Let's use the JSX syntax:

```js
app.get('/app/profile/:personId', async (req, res) => {
  const [person, featureFlags] = await Promise.all([
    findPerson(req.params.personId),
    getFeatureFlags(req.user.id)
  ]);

  const json = (
    <Page title={`${person.firstName}'s Profile`}>
      <Header>
        <Avatar src={person.avatarUrl} />
        {person.isPremium && <PremiumBadge />}
      </Header>

      <Layout columns={featureFlags.includes('TWO_COL_LAYOUT') ? 2 : 1}>
        <Panel title="User Info">
          <UserDetails user={person} />
          {req.user.id === person.id && <EditButton />}
        </Panel>

        <Panel title="Activity">
          <ActivityFeed userId={person.id} limit={3} />
        </Panel>
      </Layout>
    </Page>
  );

  res.json(json);
}
```

But since you're essentially coding an API endpoint, you can do anything *your API* can do--check the feature flags, run server-only logic, read from the data layer.

Again, this is not a new idea.

In fact, it's how many of the top native apps are built. [Instagram does this](https://github.com/novitae/igbloks/tree/main/KNOWLEDGES), [Airbnb does this](https://medium.com/airbnb-engineering/a-deep-dive-into-airbnbs-server-driven-ui-system-842244c5f5), [Uber does this](https://www.reddit.com/r/androiddev/comments/1046xel/comment/j35yr8c/), [Reddit does this](https://www.infoq.com/news/2023/09/reddit-feed-server-driven-ui/), etc. These companies use in-house frameworks that implement this pattern. Many web developers are completely unaware of this pattern which is ironic because the pattern is incredibly "webby".

In the native sphere, the pattern is known as "SDUI"--*"server driven UI"*. This sounds fancy but essentially it's just JSON endpoints that return UI trees:

```js
// /app/profile/123
{
  type: "Page",
  props: {
    title: "Jae's Profile",
    children: [{
      type: "Header",
      props: {
        children: [{
          type: "Avatar",
          props: {
            src: "https://example.com/avatar.jpg"
          }
        }, {
          type: "PremiumBadge",
          props: {},
        }]
      }
    }, {
      type: "Layout",
      props: {
        columns: 2,
        children: [
          // ...
        ]
      }
    }]
  }
}
```

Then, on the native side, you have some concrete implementations of those primitives--`Page`, `Header`, `Avatar`, `PremiumBadge`, `Layout`, and so on.

Ultimately, this feels like *passing props* from the server to the client.

So if we ever find ourselves in a situation where we have a bunch of data prepared on the server, and we need to find a good way to pass pieces of that data to a bunch of functions declared on the client, a format like this might turn out to be handy.

Let's keep that in mind.

---

### Recap: Components as JSON

- From the beginning of time, making web apps involved responding to request for a specific screen with all the data needed for that screen. (HTML is data, too.)
- From the beginning of time, people looked for ways to make the generation of that "data" dynamic, to split it into reusable logic, and to pass parameters to that logic.
- In the early days of the web, it was common to compose HTML by string manipulation. Unfortunately, it was easy to mess up and led to many issues.
- This led many in the web community to banish markup to templates. But at Facebook, XHP proposed another approach: markup that produces objects.
- It turns out that making markup a first-class coding primitive naturally leads to tags "returning" other tags--instead of MVC, we got functional composition.
- XHP evolved into Async XHP, which allowed to keep the logic for rendering some UI close to the logic for loading the data it needs. This was extremely powerful.
- Unfortunately, producing HTML as the primary output format is a dead end for interactive applications. You can't "refresh" HTML in-place without blowing away the state, and state is important.
- However, nothing actually constraints us to HTML. If tags are objects, they can be sent as JSON. Many of the most successful *native* apps are built this paradigm. (And if you need HTML, you can always turn JSON *into* HTML later on.)
- Returning a tag of client primitives as a JSON tree is a nice way to represent "passing props" to the client.

---

## Part 3: JSX Over The Wire

### What We're Building

So far, we've explored two separates lines of thought:

- Directly calling REST APIs from the client layer [ignores the realities](#rest-and-json-api) of how user interfaces evolve. We can solve this by [adding a new backend layer](#api-for-viewmodels) that assembles the data on the server according to what each screen *needs*. This layer [can be split into functions](#extracting-a-viewmodel) that each specify how to load data for a particular *part* of the screen. Then these functions can be [composed together](#composing-viewmodels). However, we're not sure how to actually *tie* those functions to the components whose props they are preparing.
- We can also [start from plain HTML](#html-ssi-and-cgi) and "server includes". If we avoid early MVC-ification and instead explore treating markup as objects, we'll [eventually invent](#php-and-xhp) the concept of [asynchronous tags](#async-xhp) that load their own data and return more tags. This approach is very powerful because it lets us build self-contained components without causing multiple client/server roundtrips for fetching a single screen. Emitting HTML *as the only target format* is a dead end, but as proven by many top native applications using this approach, [emitting JSON](#native-templates) retains all the benefits. All you need is a [set of client-side primitives](#sdui) that can be composed from the server.

It turns out that these are two different ways to talk about the same thing. Ultimately, all we want is a system with these five properties:

#### Dan's Async UI Framework Checklist

1. Our system lets us split a user interface into rich, interactive components.
1. Components should have a *direct connection* with the logic that specifies how *their* server data is computed. If a component receives some information from the server, you should be a single Ctrl+Click or "Find All References" away from every place on the server where *that particular component's* props are being calculated. It should be straightforward to change which data is received by which component.
1. There should be a way to make pieces of UI truly self-contained--including their server data dependencies and corresponding server logic. You should be able to nest a piece of UI inside another piece of UI without worrying what data it needs.
1. A navigation to a new screen should be possible to complete in one client/server roundtrip. Even if you have hundreds of components that each want to load some data, from the client's perspective, a screen should arrive as a single response. In fact, we'd like our system to *stand in the way* of creating client/server waterfalls.
1. We'd like our system to fully support rich interactivity. This means that, even if some parts of it run on the server, it is *unacceptable* to require full-page refreshes on navigation or after a mutation. In fact, the system should support in-place refreshing of server data directly within an interactive tree. A component should be able to "receive new props" from the server without losing any client state.

Do you know any such systems? (Try scoring the frameworks you know.)

If not, let's invent one right now.

---

### ViewModels, Revisited

Let's get back to [the last version](#plumbing-viewmodel-parameters) of `LikeButtonViewModel` from earlier:

<Server>

```js {10-15}
async function LikeButtonViewModel({
  postId,
  includeAvatars
}) {
  const [post, friendLikes] = await Promise.all([
    getPost(postId),
    getFriendLikes(postId, { limit: includeAvatars ? 5 : 2 }),
  ]);
  return {
    totalLikeCount: post.totalLikeCount,
    isLikedByUser: post.isLikedByUser,
    friendLikes: friendLikes.likes.map(l => ({
      firstName: l.firstName,
      avatar: includeAvatars ? l.avatar : null,
    }))
  };
}
```

</Server>

This function is a *slice of the backend* that prepares the props for the `LikeButton`:

```js
{
  totalLikeCount: 8,
  isLikedByUser: false,
  friendLikes: [{
    firstName: 'Alice',
    avatar: 'https://example.com/alice.jpg'
  }, {
    firstName: 'Bob',
    avatar: 'https://example.com/bob.jpg'
  }]
}
```

Eventually we were hoping that the `LikeButton` will receive these props:

<Client>

```js {2-4}
function LikeButton({
  totalLikeCount,
  isLikedByUser,
  friendLikes
}) {
  // ...
}
```

</Client>

However, we haven't come up with any mechanism to connect the two sides yet. Who's gonna pass the JSON returned by the `LikeButtonViewModel` to the `LikeButton` component? How do we tie the ViewModels to their components?

What if we took a page out of [SDUI](#sdui) and expressed that by returning a *tag*:

<Server>

```js {10,17}
async function LikeButtonViewModel({
  postId,
  includeAvatars
}) {
  const [post, friendLikes] = await Promise.all([
    getPost(postId),
    getFriendLikes(postId, { limit: includeAvatars ? 5 : 2 }),
  ]);
  return (
    <LikeButton
      totalLikeCount={post.totalLikeCount}
      isLikedByUser={post.isLikedByUser}
      friendLikes={friendLikes.likes.map(l => ({
        firstName: l.firstName,
        avatar: includeAvatars ? l.avatar : null,
      }))}
    />
  );
}
```

</Server>

As [we know](#sdui) from earlier, we can represent this JSX as a tree of JSON. In fact, it's almost like the original JSON, but now it specifies the receiving component:

```js {2}
{
  type: "LikeButton",
  props: {
    totalLikeCount: 8,
    isLikedByUser: false,
    friendLikes: [{
      firstName: 'Alice',
      avatar: 'https://example.com/alice.jpg'
    }, {
      firstName: 'Bob',
      avatar: 'https://example.com/bob.jpg'
    }]
  }
}
```

Then React on the client would *know* to pass these props to the `LikeButton`:

<Client>

```js {1}
function LikeButton({
  totalLikeCount,
  isLikedByUser,
  friendLikes
}) {
  // ...
}
```

</Client>

And so we've finally stitched the ViewModel and its component together!

We've tied the code *generating* the props with the code *consuming* those props. Now our ViewModel and our component are a Ctrl+Click away from each other. Since JSX expressions are typechecked, we also get full typechecking for free.

Have a look at the complete picture:

<Server>

```js {10-17}
async function LikeButtonViewModel({
  postId,
  includeAvatars
}) {
  const [post, friendLikes] = await Promise.all([
    getPost(postId),
    getFriendLikes(postId, { limit: includeAvatars ? 5 : 2 }),
  ]);
  return (
    <LikeButton
      totalLikeCount={post.totalLikeCount}
      isLikedByUser={post.isLikedByUser}
      friendLikes={friendLikes.likes.map(l => ({
        firstName: l.firstName,
        avatar: includeAvatars ? l.avatar : null,
      }))}
    />
  );
}
```

</Server>

<Client glued>

```js {1-5}
function LikeButton({
  totalLikeCount,
  isLikedByUser,
  friendLikes
}) {
  let buttonText = 'Like';
  if (totalLikeCount > 0) {
    // e.g. "Liked by You, Alice, and 13 others"
    buttonText = formatLikeText(totalLikeCount, isLikedByUser, friendLikes);
  }
  return (
    <button className={isLikedByUser ? 'liked' : ''}>
      {buttonText}
    </button>
  );
}
```

</Client>

Our ViewModel is just like an [Async XHP](#async-xhp) tag, passing some information to our own `<LikeButton>` primitive that lives on client (just like in [SDUI](#sdui)). Together, they represent a self-contained piece of UI that knows how to load its own data.

Let's do this again with another ViewModel.

---

### Let's Do This Again

Now let's revisit the `PostDetailsViewModel` from [this section](#composing-viewmodels):

<Server>

```js
async function PostDetailsViewModel({
  postId,
  truncateContent,
  includeAvatars
}) {
  const [post, postLikes] = await Promise.all([
    getPost(postId),
    LikeButtonViewModel({ postId, includeAvatars }),
  ]);
  return {
    postTitle: post.title,
    postContent: parseMarkdown(post.content, {
      maxParagraphs: truncateContent ? 1 : undefined
    }),
    postAuthor: post.author,
    postLikes
  };
}
```

</Server>

We've never explicitly written it down, but suppose that there was a matching `PostDetails` component that can take that JSON and actually render the post:

<Client>

```js
function PostDetails({
  postTitle,
  postContent,
  postAuthor,
  postLikes,
}) {
  // ...
}
```

</Client>

Let's connect them together.

First, let's change `PostDetailsViewModel` to return a `PostDetails` *tag:*

<Server>

```js {11,18}
async function PostDetailsViewModel({
  postId,
  truncateContent,
  includeAvatars
}) {
  const [post, postLikes] = await Promise.all([
    getPost(postId),
    LikeButtonViewModel({ postId, includeAvatars }),
  ]);
  return (
    <PostDetails
      postTitle={post.title}
      postContent={parseMarkdown(post.content, {
        maxParagraphs: truncateContent ? 1 : undefined
      })}
      postAuthor={post.author}
      postLikes={postLikes}
    />
  );
}
```

</Server>

Now the JSON it returns will be wrapped into a `PostDetails` JSX element:

```js {2}
{
  type: "PostDetails",
  props: {
    postTitle: "JSX Over The Wire",
    postAuthor: "Dan",
    postContent: "Suppose you have an API route that returns some data as JSON.",
    postLikes: {
      type: "LikeButton",
      props: {
        totalLikeCount: 8,
        isLikedByUser: false,
        friendLikes: [{
          firstName: "Alice"
        }, {
          firstName: "Bob"
        }]
      }
    }
  }
}
```

On the client, React will take these props and pass them to `PostDetails`:

<Client>

```js
function PostDetails({
  postTitle,
  postContent,
  postAuthor,
  postLikes,
}) {
  return (
    <article>
      <h1>{postTitle}</h1>
      <div dangerouslySetInnerHTML={{ __html: postContent }} />
      <p>by {postAuthor.name}</p>
      <section>
        {postLikes}
      </section>
    </article>
  );
}
```

</Client>

And that connects the ViewModel with its component!

---

### Composing ViewModels, Revisited

Notice how `postLikes` in the last example is rendered directly into UI:

```js
<section>
  {postLikes}
</section>
```

We can do this because it's the `<LikeButton>` with its props already preconfigured by `LikeButtonViewModel`. It was right here in the JSON:

```js {6-10}
{
  type: "PostDetails",
  props: {
    // ...
    postLikes: {
      type: "LikeButton",
      props: {
        totalLikeCount: 8,
        // ...
      }
    }
  }
}
```

You might recall that we obtained it by calling `LikeButtonViewModel`:

```js {8}
async function PostDetailsViewModel({
  postId,
  truncateContent,
  includeAvatars
}) {
  const [post, postLikes] = await Promise.all([
    getPost(postId),
    LikeButtonViewModel({ postId, includeAvatars }),
  ]);
  // ...
```

However, having ViewModels manually call other ViewModels inside `Promise.all` quickly gets very tedious. So we'll adopt a new convention. Let's assume that a ViewModel can embed *another* ViewModel by returning a JSX tag.

This will let us clean up the code quite a bit:

```js {6,15-18}
async function PostDetailsViewModel({
  postId,
  truncateContent,
  includeAvatars
}) {
  const post = await getPost(postId);
  return (
    <PostDetails
      postTitle={post.title}
      postContent={parseMarkdown(post.content, {
        maxParagraphs: truncateContent ? 1 : undefined
      })}
      postAuthor={post.author}
      postLikes={
        <LikeButtonViewModel
          postId={postId}
          includeAvatars={includeAvatars}
        />
      }}
    />
  );
}
```

After this change, calling `PostDetailsViewModel` will return "unfinished" JSON:

```js {6-12}
{
  type: "PostDetails", // ✅ This is a component on the client
  props: {
    postTitle: "JSX Over The Wire",
    // ...
    postLikes: {
      type: LikeButtonViewModel, // 🟡 We haven't run this ViewModel yet
      props: {
        postId: "jsx-over-the-wire",
        includeAvatars: false,
      }
    }
  }
}
```

The code responsible for sending JSON to the client will see that it's a ViewModel (so it still needs to run!), and will call `LikeButtonViewModel` to get more JSON:

```js {6-12}
{
  type: "PostDetails", // ✅ This is a component on the client
  props: {
    postTitle: "JSX Over The Wire",
    // ...
    postLikes: {
      type: "LikeButton", // ✅ This is a component on the client
      props: {
        totalLikeCount: 8,
        // ...
      }
    }
  }
}
```

ViewModels will get recursively unfolded as they each contribute their part of the JSON. This might remind you of how [XHP tags can recursively render other XHP tags](#php-and-xhp). The final JSON will be turned on the client into a React component tree.

```js
<PostDetails
  postTitle="JSX Over The Wire"
  // ...
>
  <LikeButton
    totalLikeCount={8}
    // ...
  />
</PostDetails>
```

---

### The Data Always Flows Down

To make the JSX look slightly nicer, we can also rename `postLikes` to `children`. This will let us nest `LikeButtonViewModel` as a JSX child of `PostDetails`.

Here's the entire code so far. Notice how the data flows down:

<Server>

```js {15-18,32-38}
async function PostDetailsViewModel({
  postId,
  truncateContent,
  includeAvatars
}) {
  const post = await getPost(postId);
  return (
    <PostDetails
      postTitle={post.title}
      postContent={parseMarkdown(post.content, {
        maxParagraphs: truncateContent ? 1 : undefined
      })}
      postAuthor={post.author}
    >
      <LikeButtonViewModel
        postId={postId}
        includeAvatars={includeAvatars}
      />
    </PostDetails>
  );
}

async function LikeButtonViewModel({
  postId,
  includeAvatars
}) {
const [post, friendLikes] = await Promise.all([
  getPost(postId),
  getFriendLikes(postId, { limit: includeAvatars ? 5 : 2 }),
]);
return (
  <LikeButton
    totalLikeCount={post.totalLikeCount}
    isLikedByUser={post.isLikedByUser}
    friendLikes={friendLikes.likes.map(l => ({
      firstName: l.firstName,
      avatar: includeAvatars ? l.avatar : null,
    }))}
  />
);
```

</Server>

All of the server logic above will execute while generating the JSON. This includes both `getPost`, `parseMarkdown`, and `getFriendLikes`. The response will contain the data *for the entire screen*, satisfying one of our [key requirements](#dans-async-ui-framework-checklist):

```js
{
  type: "PostDetails", // ✅ This is a component on the client
  props: {
    postTitle: "JSX Over The Wire",
    // ...
    postLikes: {
      type: "LikeButton", // ✅ This is a component on the client
      props: {
        totalLikeCount: 8,
        // ...
      }
    }
  }
}
```

From the client's perspective, everything will appear precomputed:

<Client>

```js {5,13}
function PostDetails({
  postTitle,
  postContent,
  postAuthor,
  children,
}) {
  return (
    <article>
      <h1>{postTitle}</h1>
      <div dangerouslySetInnerHTML={{ __html: postContent }} />
      <p>by {postAuthor.name}</p>
      <section>
        {children}
      </section>
    </article>
  );
}

function LikeButton({ totalLikeCount, isLikedByUser, friendLikes }) {
  // ...
}
```

</Client>

In particular, by the time `PostDetails` runs, the `children` it receives will be the `<LikeButton>` tag itself with predefined props. The ViewModels configure the props for the client. **This is why on the client, all the props are "already there".**

Spend some time with the code above and make sure it sinks in.

Yes, this *is* weird.

It is also glorious.

What we found is a way to compose tags across client-server boundaries where the server parts can be freely wrapped in the client parts, the client parts can be freely wrapped in the server parts, and not only do they *just work*--we're also performing the data loading for all of the server parts in *a single roundtrip.*

In fact, this approach satisfies every point on [my checklist.](#dans-async-ui-framework-checklist)

Now let's tidy it up and clean up some loose ends.

---

### A Router ViewModel

As we refactor our ViewModels to use JSX (for the JSX-sceptical readers--the point here isn't just the syntax, although the syntax is nice--but [lazy evaluation](/react-as-a-ui-runtime/#lazy-evaluation)), we might realize that we don't actually need separate Express routes for every screen.

Instead, we might want to do something like this:

```js
app.get('/*', async (req, res) => {
  const url = req.url
  const json = await toJSON(<RouterViewModel url={url} />); // Evaluate JSX
  res.json(json);
});
```

Then we'd have a Router ViewModel that matches screens to routes:

```js
function RouterViewModel({ url }) {
  let route;
  if (matchRoute(url, '/screen/post-details/:postId')) {
    const {postId} = parseRoute(url, '/screen/post-details/:postId');
    route = <PostDetailsRouteViewModel postId={postId} />;
  } else if (matchRoute(url, '/screen/post-list')) {
    route = <PostDetailsRouteViewModel />;
  }
  return route;
}
```

And then each route would also be a ViewModel:

```js
async function PostDetailsRouteViewModel({ postId }) {
  return <PostDetailsViewModel postId={postId} />
}

async function PostListRouteViewModel({ postId }) {
  const postIds = await getRecentPostIds();
  return (
    <>
      {postIds.map(postId =>
        <PostDetailsViewModel key={postId} postId={postId} />
      )}
    </>
  );
}
```

On the server, it's ViewModels all the way down.

This might seem superfluous at this point. But moving the routing logic *into* the ViewModel world would let `RouterViewModel` wrap its output into a client-side `<Router>` that could re-request the JSON when you navigate to another screen.

<Server>

```js {10,12}
function RouterViewModel({ url }) {
  let route;
  if (matchRoute(url, '/screen/post-details/:postId')) {
    const {postId} = parseRoute(url, '/screen/post-details/:postId');
    route = <PostDetailsRouteViewModel postId={postId} />;
  } else if (matchRoute(url, '/screen/post-list')) {
    route = <PostDetailsRouteViewModel />;
  }
  return (
    <Router>
      {route}
    </Router>
  );
}
```

</Server>

<Client glued>

```js
function Router({ children }) {
  const [tree, setTree] = useState(children);
  // ... maybe add some logic here later ...
  return tree;
}
```

</Client>

This could also let us--if we wanted to--implement a more granular router that can split the path into segments, prepare the ViewModels for each segment in parallel when it receives a request, and even re-request individual segments on navigation. This way, we would no longer have to re-request the entire page whenever we need to go to another screen. Of course, we wouldn't want to implement this kind of logic *within* the app. Ideally, a framework would do this.

---

### Server and Client Components

We can drop the pretense now--we're describing React Server Components:

- Our "ViewModels" are Server Components.
- Our "Components" are Client Components.

There are good reasons to call both of them Components. Although in the first part of this post, Server Components [began their journey as ViewModels](#composable-bff), their lineage can be equally convincingly traced back to [Async XHP tags](#async-xhp). Since they no longer have to return JSON objects, and because in practice you'll often import the same components from both "sides", it makes sense to say Components. (In fact, in my incomplete example, all Client Components could be moved to the Server.)

In this post, we haven't discussed the actual mechanism "connecting" the module systems of Server and Client worlds. This will be a topic for another post, but in short, when you `import` something from a module with `'use client'`, you don't get the real thing--you just get a *reference* which describes *how to load* it.

<Server>

```js {1,3-4}
import { LikeButton } from './LikeButton';

console.log(LikeButton);
// "src/LikeButton.js#LikeButton"

async function LikeButtonViewModel({
  postId,
  includeAvatars
}) {
const [post, friendLikes] = await Promise.all([
  getPost(postId),
  getFriendLikes(postId, { limit: includeAvatars ? 5 : 2 }),
]);
return (
  <LikeButton
    totalLikeCount={post.totalLikeCount}
    isLikedByUser={post.isLikedByUser}
    friendLikes={friendLikes.likes.map(l => ({
      firstName: l.firstName,
      avatar: includeAvatars ? l.avatar : null,
    }))}
  />
);
```

</Server>

<Client glued>

```js {1,3}
'use client';

export function LikeButton({
  totalLikeCount,
  isLikedByUser,
  friendLikes
}) {
  let buttonText = 'Like';
  if (totalLikeCount > 0) {
    // e.g. "Liked by You, Alice, and 13 others"
    buttonText = formatLikeText(totalLikeCount, isLikedByUser, friendLikes);
  }
  return (
    <button className={isLikedByUser ? 'liked' : ''}>
      {buttonText}
    </button>
  );
}
```

</Client>

So the generated JSON will contain an instruction for loading the `LikeButton`:

```js {2}
{
  type: "src/LikeButton.js#LikeButton", // ✅ This is a Client Component
  props: {
    totalLikeCount: 8,
    // ...
  }
}
```

React will read that instruction and load it as a `<script>` tag (or read it from the bundler cache). The format is bundler-specific, which explains why React Server Components requires a bundler integration. ([Parcel just released theirs](https://parceljs.org/recipes/rsc/) which isn't tied to a framework, so it's perfect if you want to play with how RSC works.)

It's important that React Server Components emit JSON rather than HTML:

- Server tree can be refetched in-place without losing state. (React will just do its "virtual DOM" thing, i.e. apply the new props to the already existing components.)
- You can target other platforms than web. (Here's a [cool demo](https://www.youtube.com/watch?v=djhEgxQf3Kw).)
- You can still turn that JSON into HTML by executing all the Client Components within it! That's not *required* by RSC, but it is definitely doable. That's why "Client" components may run on the "server"--to output HTML, you'd run both "sides".

To conclude this post, I'll say the following. I know that React Server Components have not been everyone's cup of tea. It twists your brain but I think it twists it in a good way. I'll be posting more about why I'm excited about RSC and will try to distill some of these explanations into shorter posts. But in the meantime, I hope that this post provided some historical background on the *motivation* behind RSC, [what it can do](#dans-async-ui-framework-checklist), as well as how you could arrive at RSC through your own thinking.

(By the way, if you enjoy more philosophical and whimsical longreads, check out my [last post](/react-for-two-computers/) which arrives at RSC from the first principles without any history.)

---

### Recap: JSX Over The Wire

- React Server Components solve the [problems outlined in the first part](#recap-json-as-components) by using [techniques outlined in the second part](#recap-components-as-json). In particular, they let you "componentize" the UI-specific parts of your API and ensure they evolve together with your UI.
- This means that there is a direct connection between your components and the server code that prepares their props. You can always "Find All References" to find from where on the server the data is flowing into each of your components.
- Because React Server Components emit JSON, they don't "blow away" the state of the page on refetches. Your components can receive fresh props from the server.
- React Server Components emit JSON, but that JSON can *also* be (optionally) turned to HTML for first render. It's easy to make HTML out of JSON, but not the inverse.
- React Server Components let you create self-contained pieces of UI that take care of preparing their own server data. However, all this preparation occurs within a single roundtrip. Although your code is modular, their execution is coalesced.
- RSC is mindbending, I won't lie. Sometimes you have to think inside-out. But personally, I think RSC is awesome. The tooling is still evolving but I'm excited for its future. I hope to see more technologies thoughtfully blending the boundaries.

---

### Final Code, Slightly Edited

While this isn't a *runnable* application (I bet *you* could get there with [Next](https://nextjs.org/) or [Parcel](https://parceljs.org/recipes/rsc/)) and might contain mistakes, here's the complete code example. I've done a few renames to drop the "ViewModel" terminology so it looks more idiomatic.

<Server>

```js
import { PostDetails, LikeButton } from './client';

export async function PostDetailsRoute({ postId }) {
  return <Post postId={postId} />
}

export async function PostListRoute({ postId }) {
  const postIds = await getRecentPostIds();
  return (
    <>
      {postIds.map(postId =>
        <Post key={postId} postId={postId} />
      )}
    </>
  );
}

async function Post({
  postId,
  truncateContent,
  includeAvatars
}) {
  const post = await getPost(postId);
  return (
    <PostLayout
      postTitle={post.title}
      postContent={parseMarkdown(post.content, {
        maxParagraphs: truncateContent ? 1 : undefined
      })}
      postAuthor={post.author}
    >
      <PostLikeButton
        postId={postId}
        includeAvatars={includeAvatars}
      />
    </PostLayout>
  );
}

async function PostLikeButton({
  postId,
  includeAvatars
}) {
const [post, friendLikes] = await Promise.all([
  getPost(postId),
  getFriendLikes(postId, { limit: includeAvatars ? 5 : 2 }),
]);
return (
  <LikeButton
    totalLikeCount={post.totalLikeCount}
    isLikedByUser={post.isLikedByUser}
    friendLikes={friendLikes.likes.map(l => ({
      firstName: l.firstName,
      avatar: includeAvatars ? l.avatar : null,
    }))}
  />
);
```

</Server>

<Client glued>

```js
export function PostLayout({
  postTitle,
  postContent,
  postAuthor,
  children,
}) {
  return (
    <article>
      <h1>{postTitle}</h1>
      <div dangerouslySetInnerHTML={{ __html: postContent }} />
      <p>by {postAuthor.name}</p>
      <section>
        {children}
      </section>
    </article>
  );
}

export function LikeButton({
  totalLikeCount,
  isLikedByUser,
  friendLikes
}) {
  let buttonText = 'Like';
  if (totalLikeCount > 0) {
    buttonText = formatLikeText(totalLikeCount, isLikedByUser, friendLikes);
  }
  return (
    <button className={isLikedByUser ? 'liked' : ''}>
      {buttonText}
    </button>
  );
}
```

</Client>

Happy stitching!
