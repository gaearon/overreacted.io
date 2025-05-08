---
title: Static as a Server
date: '2025-05-08'
spoiler: You wouldn't download a site.
---

RSC means React *Server* Components.

And yet, although this blog is built with RSC, it is statically served from a Cloudflare CDN using their free static hosting plan. It costs me exactly zero.

*Zero.*

How is this possible?

Aren't these React *Server* Components?

In the past, "server" and "static" frameworks were thought of as separate tools. For example, you might use Rails or PHP for a "server" app, but if you wanted to generate a "static" HTML+CSS+JS site, you might use Jekyll or Hugo instead.

However, it's getting more common for frameworks to support both "server" and "static" *output modes.* This builds on an insight that seems obvious in retrospect: you can take any "server" framework and get a "static" site out of it by running its "server" during the build and hitting it with a request for every page you want to generate, and then storing the responses on disk. It would be annoying to do this by hand, which is why newer frameworks tend to support this out of the box.

**I'll call these frameworks "hybrid". They're conceptually "server" frameworks following the request/response model, but with an option for "static" output.**

Sometimes, focusing on one use case and nailing it makes the specialization worth it. But I don't think this is happening here. I'm not aware of any way in which a "static" tool adds value to developers or to end users *by being* "static"-only. This doesn't mean "static"-only tools are bad, but I see no reason to *prefer* them. On the other hand, I see several tangible reasons to prefer "hybrid" frameworks.

First, the "hybrid" approach reduces tooling fragmentation--why have two ecosystems when the overlap is so large? The difference is just *when* the code runs.

The "hybrid" approach also gives you both more flexibility and more granularity. It doesn't lock you into a specific approach. In fact, the choice to do "server" or "static" rendering could now be done route by route. You can start with a fully "static" site and then later add a "server" page to show some dynamic content. Or you might start with a "server" site, and then add some "static" marketing pages. Your projects, some fully "static" and some "server", can share code and plugins. And arguably, the request/response mental model itself feels natural and intuitive.

There's nothing RSC-specific to this approach. For example, [Astro](https://docs.astro.build/) is [*not*](/rsc-for-astro-developers/) an RSC framework, but it *is* a "hybrid" framework. It produces "static" sites by default but you can opt into "server" features like [API routes](https://docs.astro.build/en/guides/endpoints/#server-endpoints-api-routes) and [on-demand rendering.](https://docs.astro.build/en/guides/on-demand-rendering/)

Of course, the same applies to RSC.

My blog is built with Next.js, which emits "static" sites by default. In fact, I'm *enforcing* that with the [`output: "export"` option](https://nextjs.org/docs/pages/guides/static-exports) which disables any features that require a "server"--which I do not have. If I try to use any "server" features, my "static" build will fail, which is exactly what I want to happen in this case.

In other words, this *React Server Component* runs at the build time during deploy:

```js
export default async function Home() {
  const posts = await getPosts();
  return (
    <div className="relative -top-[10px] flex flex-col gap-8">
      {posts.map((post) => (
        <Link
          key={post.slug}
          className="block py-4 hover:scale-[1.005] will-change-transform"
          href={"/" + post.slug + "/"}
        >
          <article>
            <PostTitle post={post} />
            <PostMeta post={post} />
            <PostSubtitle post={post} />
          </article>
        </Link>
      ))}
    </div>
  );
}
```

You can see its output on my [homepage.](/) The `await getPosts()` call reads from the filesystem--it's neither some kind of a client fetch nor some kind of a server runtime code. This Server Component runs *during deployment* of my static blog.

Yes, it's confusing that we say "React *Server* components" even when we run them "statically". But I've already explained that *any* "server" framework is *already* a "static" framework. You just need to hit it early and save its responses to the disk.

So let's just collectively agree to get over this.

The code we write is exactly the same.

"Static" is a "server" that runs ahead of time.
