---
title: 'npm audit: Broken by Design'
date: '2021-07-07'
spoiler: "Found 99 vulnerabilities (84 moderately irrelevant, 15 highly irrelevant)"
---

Security is important. Nobody wants to be the person advocating for less security. So nobody wants to say it. But somebody has to say it.

So I guess I’ll say it.

**The way `npm audit` works is broken. Its rollout as a default after every `npm install` was rushed, inconsiderate, and inadequate for the front-end tooling.**

Have you heard the story about [the boy who cried wolf?](https://en.wikipedia.org/wiki/The_Boy_Who_Cried_Wolf) Spoiler alert: the wolf eats the sheep. If we don’t want our sheep to be eaten, we need better tools.

As of today, `npm audit` is a stain on the entire npm ecosystem. The best time to fix it was before rolling it out as a default. The next best time to fix it is now.

In this post, I will briefly outline how it works, why it’s broken, and what changes I’m hoping to see.

## How does npm audit work?

*[Skip ahead](#why-is-npm-audit-broken) if you already know how it works.*

Your Node.js application has a dependency tree. It might look like this:

```
your-app
  - view-library@1.0.0
  - design-system@1.0.0
  - model-layer@1.0.0
    - database-layer@1.0.0
      - network-utility@1.0.0
```

Most likely, it’s a lot deeper.

Now say there’s a vulnerability discovered in `network-utility@1.0.0`:

```
your-app
  - view-library@1.0.0
  - design-system@1.0.0
  - model-layer@1.0.0
    - database-layer@1.0.0
      - network-utility@1.0.0 (Vulnerable!)
```

This gets published in a special registry that `npm` will access next time you run `npm audit`. Since npm v6+, you’ll learn about this after every `npm install`:

```
1 vulnerabilities (0 moderate, 1 high)

To address issues that do not require attention, run:
  npm audit fix

To address all issues (including breaking changes), run:
  npm audit fix --force
```

You run `npm audit fix`, and npm tries to install the latest `network-utility@1.0.1` with the fix in it. As long as `database-layer` specifies that it depends not on *exactly* on `network-utility@1.0.0` but some permissible range that includes `1.0.1`, the fix “just works” and you get a working application:

```
your-app
  - view-library@1.0.0
  - design-system@1.0.0
  - model-layer@1.0.0
    - database-layer@1.0.0
      - network-utility@1.0.1 (Fixed!)
```

Alternatively, maybe `database-layer@1.0.0` depends strictly on `network-utility@1.0.0`. In that case, the maintainer of `database-layer` needs to release a new version too, which would allow `network-utility@1.0.1` instead:

```
your-app
  - view-library@1.0.0
  - design-system@1.0.0
  - model-layer@1.0.0
    - database-layer@1.0.1 (Updated to allow the fix.)
      - network-utility@1.0.1 (Fixed!)
```

Finally, if there is no way to gracefully upgrade the tree, you could try `npm audit fix --force`. This is supposed to be used if `database-layer` doesn’t accept the new version of `network-utility` and _also_ doesn’t release an update to accept it. So you’re kind of taking matters in your own hands, potentially risking breaking changes. Seems like a reasonable option to have.

**This is how `npm audit` is supposed to work in theory.**

As someone wise said, in theory there is no difference between theory and practice. But in practice there is. And that’s where all the fun starts.

## Why is npm audit broken?

Let’s see how this works in practice. I’ll use Create React App for my testing.

If you’re not familiar with it, it’s an integration facade that combines multiple other tools, including Babel, webpack, TypeScript, ESLint, PostCSS, Terser, and others. Create React App takes your JavaScript source code and converts it into a static HTML+JS+CSS folder. **Notably, it does *not* produce a Node.js app.**

Let’s create a new project!

```
npx create-react-app myapp
```

Immediately upon creating a project, I see this:

```
found 5 vulnerabilities (3 moderate, 2 high)
  run `npm audit fix` to fix them, or `npm audit` for details
```

Oh no, that seems bad! My just-created app is already vulnerable!

Or so npm tells me.

Let’s run `npm audit` to see what’s up.

### First “vulnerability”

Here is the first problem reported by `npm audit`:

```
┌───────────────┬──────────────────────────────────────────────────────────────┐
│ Moderate      │ Regular Expression Denial of Service                         │
├───────────────┼──────────────────────────────────────────────────────────────┤
│ Package       │ browserslist                                                 │
├───────────────┼──────────────────────────────────────────────────────────────┤
│ Patched in    │ >=4.16.5                                                     │
├───────────────┼──────────────────────────────────────────────────────────────┤
│ Dependency of │ react-scripts                                                │
├───────────────┼──────────────────────────────────────────────────────────────┤
│ Path          │ react-scripts > react-dev-utils > browserslist               │
├───────────────┼──────────────────────────────────────────────────────────────┤
│ More info     │ https://npmjs.com/advisories/1747                            │
└───────────────┴──────────────────────────────────────────────────────────────┘
```

Apparently, `browserslist` is vulnerable. What’s that and how is it used? Create React App generates CSS files optimized for the browsers you target. For example, you can say you only target modern browsers in your `package.json`:

```jsx
  "browserslist": {
    "production": [
      ">0.2%",
      "not dead",
      "not op_mini all"
    ],
    "development": [
      "last 1 chrome version",
      "last 1 firefox version",
      "last 1 safari version"
    ]
  }
```

Then it won’t include outdated flexbox hacks in the output. Since multiple tools rely on the same configuration format for the browsers you target, Create React App uses the shared `browserslist` package to parse the configuration file.

So what’s the vulnerability here? [“Regular Expression Denial of Service”](https://owasp.org/www-community/attacks/Regular_expression_Denial_of_Service_-_ReDoS) means that there is a regex in `browserslist` that, with malicious input, could become very slow. So an attacker can craft a special configuration string that, when passed to `browserslist`, could slow it down exponentially. This sounds bad...

Wait, what?! Let’s remember how your app works. You have a configuration file _on your machine_. You _build_ your project. You get static HTML+CSS+JS in a folder. You put it on static hosting. There is simple **no way** for your application user to affect your `package.json` configuration. **This doesn’t make any sense.** If the attacker already has access to your machine and can change your configuration files, you have a much bigger problem than slow regular expressions!

Okay, so I guess this “Moderate” “vulnerability” was neither moderate nor a vulnerability in the context of a project. Let’s keep going.

**Verdict: this “vulnerability” is absurd in this context.**

### Second “vulnerability”

Here is the next issue `npm audit` has helpfully reported:

```
┌───────────────┬──────────────────────────────────────────────────────────────┐
│ Moderate      │ Regular expression denial of service                         │
├───────────────┼──────────────────────────────────────────────────────────────┤
│ Package       │ glob-parent                                                  │
├───────────────┼──────────────────────────────────────────────────────────────┤
│ Patched in    │ >=5.1.2                                                      │
├───────────────┼──────────────────────────────────────────────────────────────┤
│ Dependency of │ react-scripts                                                │
├───────────────┼──────────────────────────────────────────────────────────────┤
│ Path          │ react-scripts > webpack-dev-server > chokidar > glob-parent  │
├───────────────┼──────────────────────────────────────────────────────────────┤
│ More info     │ https://npmjs.com/advisories/1751                            │
└───────────────┴──────────────────────────────────────────────────────────────┘
```

Let’s look at the `webpack-dev-server > chokidar > glob-parent` dependency chain. Here, `webpack-dev-server` is a **development-only** server that’s used to quickly serve your app **locally**. It uses `chokidar` to watch your filesystem for changes (such as when you save a file in your editor). And it uses [`glob-parent`](https://www.npmjs.com/package/glob-parent) in order to extract a part of the filesystem path from a filesystem watch pattern.

Unfortunately, `glob-parent` is vulnerable! If an attacker supplies a specially crafted filepath, it could make this function exponentially slow, which would...

Wait, what?! The development server is on your computer. The files are on your computer. The file watcher is using the configuration that *you* have specified. None of this logic leaves your computer. If your attacker is sophisticated enough to log into *your machine* during local development, the last thing they’ll want to do is to craft special long filepaths to slow down your development. They’ll want to steal your secrets instead. **So this whole threat is absurd.**

Looks like this “Moderate” “vulnerability” was neither moderate nor a vulnerability in the context of a project.

**Verdict: this “vulnerability” is absurd in this context.**

### Third “vulnerability”

Let’s have a look at this one:

```
┌───────────────┬──────────────────────────────────────────────────────────────┐
│ Moderate      │ Regular expression denial of service                         │
├───────────────┼──────────────────────────────────────────────────────────────┤
│ Package       │ glob-parent                                                  │
├───────────────┼──────────────────────────────────────────────────────────────┤
│ Patched in    │ >=5.1.2                                                      │
├───────────────┼──────────────────────────────────────────────────────────────┤
│ Dependency of │ react-scripts                                                │
├───────────────┼──────────────────────────────────────────────────────────────┤
│ Path          │ react-scripts > webpack > watchpack > watchpack-chokidar2 >  │
│               │ chokidar > glob-parent                                       │
├───────────────┼──────────────────────────────────────────────────────────────┤
│ More info     │ https://npmjs.com/advisories/1751                            │
└───────────────┴──────────────────────────────────────────────────────────────┘
```

Wait, it’s the same thing as above, but through a different dependency path.

**Verdict: this “vulnerability” is absurd in this context.**

### Fourth “vulnerability”

Oof, this one looks really bad! **`npm audit` has the nerve to show it in red color:**

```
┌───────────────┬──────────────────────────────────────────────────────────────┐
│ High          │ Denial of Service                                            │
├───────────────┼──────────────────────────────────────────────────────────────┤
│ Package       │ css-what                                                     │
├───────────────┼──────────────────────────────────────────────────────────────┤
│ Patched in    │ >=5.0.1                                                      │
├───────────────┼──────────────────────────────────────────────────────────────┤
│ Dependency of │ react-scripts                                                │
├───────────────┼──────────────────────────────────────────────────────────────┤
│ Path          │ react-scripts > @svgr/webpack > @svgr/plugin-svgo > svgo >   │
│               │ css-select > css-what                                        │
├───────────────┼──────────────────────────────────────────────────────────────┤
│ More info     │ https://npmjs.com/advisories/1754                            │
└───────────────┴──────────────────────────────────────────────────────────────┘
```

What is this “high” severity issue? “Denial of service.” I don’t want service to be denied! That would be really bad... Unless...

Let’s look at the [issue](https://www.npmjs.com/advisories/1754). Apparently [`css-what`](https://www.npmjs.com/package/css-what), which is a parser for CSS selectors, can be slow with specially crafted input. This parser is used by a plugin that generates React components from SVG files.

So what this means is that if the attacker takes control of my development machine or my source code, they put a special SVG file that will have a specially crafted CSS selector in it, which will make my build slow. That checks out...

Wait, what?! If the attacker can modify my app’s source code, they’ll probably just put a bitcoin miner in it. Why would they add SVG files into my app, unless you can mine bitcoins with SVG? Again, this doesn’t make *any* sense.

**Verdict: this “vulnerability” is absurd in this context.**

So much for the “high” severity.

### Fifth “vulnerability”

```
┌───────────────┬──────────────────────────────────────────────────────────────┐
│ High          │ Denial of Service                                            │
├───────────────┼──────────────────────────────────────────────────────────────┤
│ Package       │ css-what                                                     │
├───────────────┼──────────────────────────────────────────────────────────────┤
│ Patched in    │ >=5.0.1                                                      │
├───────────────┼──────────────────────────────────────────────────────────────┤
│ Dependency of │ react-scripts                                                │
├───────────────┼──────────────────────────────────────────────────────────────┤
│ Path          │ react-scripts > optimize-css-assets-webpack-plugin > cssnano │
│               │ > cssnano-preset-default > postcss-svgo > svgo > css-select  │
│               │ > css-what                                                   │
├───────────────┼──────────────────────────────────────────────────────────────┤
│ More info     │ https://npmjs.com/advisories/1754                            │

└───────────────┴──────────────────────────────────────────────────────────────┘
```

This is just the same exact thing as above.

**Verdict: this “vulnerability” is absurd in this context.**

### Shall we keep going?

So far the boy has cried wolf five times. Two of them are duplicates. The rest are absurd non-issues in the context of how these dependencies are used.

Five false alarms wouldn’t be too bad.

**Unfortunately, there are hundreds.**

Here are a [few](https://github.com/facebook/create-react-app/issues/11053) [typical](https://github.com/facebook/create-react-app/issues/11092) threads, but there are many more [linked from here](https://github.com/facebook/create-react-app/issues/11174):

<img src="https://imgur.com/ABDK4Ky.png" alt="Screenshot of many GH threads" />

**I’ve spent several hours looking through every `npm audit` issue reported to us over the last several months, and they all appear to be false positives in the context of a build tool dependency like Create React App.**

Of course, they are possible to fix. We could relax some of the top-level dependencies to not be exact (leading to bugs in patches slipping in more often). We could make more releases just to stay ahead of this security theater.

But this is inadequate. Imagine if your tests failed 99% of the times for bogus reasons! This wastes person-decades of effort and makes everyone miserable:

* **It makes beginners miserable** because they run into this as their first programming experience in the Node.js ecosystem. As if installing Node.js/npm was not confusing enough (good luck if you added `sudo` somewhere because a tutorial told you), this is what they’re greeted with when they try examples online or even when they create a project. A beginner doesn’t know what a RegExp *is*. Of course they don’t have the know-how to be able to tell whether a RegExp DDoS or prototype pollution is something to worry about when they’re using a build tool to produce a static HTML+CSS+JS site.
* **It makes experienced app developers miserable** because they have to either waste time doing obviously unnecessary work, or fight with their security departments trying to explain how `npm audit` is a broken tool unsuitable for real security audits _by design_. Yeah, somehow it was made a default in this state.
* **It makes maintainers miserable** because instead of working on bugfixes and improvements, they have to pull in bogus vulnerability fixes that can’t possibly affect their project because otherwise their users are frustrated, scared, or both.
* **Someday, it will make our users miserable** because we have trained an entire generation of developers to either not understand the warnings due to being overwhelmed, or to simply _ignore_ them because they always show up but the experienced developers (correctly) tell them there is no real issue in each case.

It doesn’t help that `npm audit fix` (which the tool suggests using) is buggy. I ran `npm audit fix --force` today and it **downgraded** the main dependency to a three-year-old version with actual _real_ vulnerabilities. Thanks, npm, great job.

## What next?

I don’t know how to solve this. But I didn’t add this system in the first place, so I’m probably not the best person to solve it. All I know is it’s horribly broken.

There are a few possible solutions that I have seen.

* **Move dependency to `devDependencies` if it doesn’t run in production.** This offers a way to specify that some dependency isn’t used in production code paths, so there is no risk associated with it. However, this solution is flawed:
  - `npm audit` still warns for development dependencies by default. You have to _know_ to run `npm audit --production` to not see the warnings from development dependencies. People who know to do that probably already don’t trust it anyway. This also doesn’t help beginners or people working at companies whose security departments want to audit everything.
  - `npm install` still uses information from plain `npm audit`, so you will effectively still see all the false positives every time you install something.
  - As any security professional will tell you, development dependencies actually _are_ an attack vector, and perhaps one of the most dangerous ones because it’s so hard to detect and the code runs with high trust assumptions. **This is why the situation is so bad in particular: any real issue gets buried below dozens of non-issues that `npm audit` is training people and maintainers to ignore.** It’s only a matter of time until this happens.
* **Inline all dependencies during publish.** This is what I’m increasingly seeing packages similar to Create React App do. For example, both [Vite](https://unpkg.com/browse/vite@2.4.1/dist/node/) and [Next.js](https://unpkg.com/browse/next@11.0.1/dist/) simply bundle their dependencies directly in the package instead of relying on the npm `node_modules` mechanism. From a maintainer’s point of view, [the upsides are clear](https://github.com/vitejs/vite/blob/main/.github/contributing.md#notes-on-dependencies): you get faster boot time, smaller downloads, and — as a nice bonus — no bogus vulnerability reports from your users. It’s a neat way to game the system but I’m worried about the incentives npm is creating for the ecosystem. Inlining dependencies kind of goes against the whole point of npm.
* **Offer some way to counter-claim vulnerability reports.** The problem is not entirely unknown to Node.js and npm, of course. Different people have worked on different suggestions to fix it. For example, there is a [proposal](https://github.com/npm/rfcs/pull/18) for a way to manually resolve audit warnings so that they don’t display again. However, this still places the burden on app users, which don’t necessarily have context on what vulnerabilities deeper in the tree are real or bogus. I also have a [proposal](https://twitter.com/dan_abramov/status/1412380714012594178): I need a way to mark for my users that a certain vulnerability can’t possibly affect them. If you don’t trust my judgement, why are you running my code on your computer? I’d be happy to discuss other options too.

The root of the issue is that npm added a default behavior that, in many situations, leads to a 99%+ false positive rate, creates an incredibly confusing first programming experience, makes people fight with security departments, makes maintainers never want to deal with Node.js ecosystem ever again, and at some point will lead to actually bad vulnerabilities slipping in unnnoticed.

Something has to be done.

In the meantime, I am planning to close all GitHub issues from `npm audit` that I see going forward that don’t correspond to a _real_ vulnerability that can affect the project. I invite other maintainers to adopt the same policy. This will create frustration for our users, but the core of the issue is with npm. I am done with this security theater. Node.js/npm have all the power to fix the problem. I am in contact with them, and I hope to see this problem prioritized.

Today, `npm audit` is broken by design.

Beginners, experienced developers, maintainers, security departments, and, most importantly — our users — deserve better.

