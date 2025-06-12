---
title: Suppressions of Suppressions
date: '2025-06-11'
spoiler: I heard you like linting.
---

Usually, when we think about build failures, we think about things like syntax errors. Or maybe "module not found" errors. You don't want to *forget* to check in the files that you're using. Better a build error now than a crash later.

We can also think of a broader set of cases where we *want* to fail the build--even if it technically "builds". For example, if the linting fails, you probably *don't want* to deploy that build. Even if it was merged into `main`! If a lint *rule* is wrong, you can always suppress it. So failing the CI is preferable to shipping bad code. If you're sure it's correct, you suppress it and get that suppression reviewed by a person.

Now, suppressions are actually great. Sometimes the rule *is* wrong. Sometimes the rule is unnecessarily strict, or you're moving existing code that was written before the rule was added, and so the suppression was introduced at that point in time. In other words, sometimes the code has never *not* violated the rule in the first place.

But as people get used to suppressing the rules, you might run into a problem. Some rules are really really bad to suppress! Even if you *think* you're making the right call, you might be about to bring down the site or tank the performance. I've definitely broken things in the past with the suppressions I thought were safe.

So how do you solve that case? You can't forbid all suppressions outright because they're *useful*. They let you gradually introduce and deprecate rules, and provide an escape hatch for the few real false positives and the few true special cases.

Here's one thing you could do.

You could introduce another lint rule. This new lint rule would flag attempts to suppress a configurable set of other lint rules. So if the teams that maintain the linter configuration for the parent chain of directories have opinions about which rules really should not be suppressable, trying to suppress those rules will get you *one more* rule violation--namely, of the rule that prevents those suppressions.

In other words, a lint rule that forbids you to suppress some other lint rules.

This might sound like a joke but there was a lint rule similar to this at Facebook, and it was really useful. In the open source community, [`eslint-plugin-eslint-comments/no-restricted-disable`](https://mysticatea.github.io/eslint-plugin-eslint-comments/rules/no-restricted-disable.html) seems to be very [similarly motivated.](https://github.com/eslint/eslint/issues/15631#issuecomment-1057548512)

There's one flaw in that plan though. Somebody very motivated to suppress some rule might *also* decide to suppress the rule that tells them *not* to suppress that rule. Fundamentally, at this point, it's a question of what gets through the code review. Some things can just be explained in the onboarding. "This is not cool to do." So if you really must do it, you talk to the owner of the lint config. They look at your PR.

You can also somewhat rely on automation. Post-factum, you could grep for any newly checked-in "double suppressions" and auto-assign tickets with SLA to their committers. Or you could enforce that every "double suppression" comment must link to a ticket. You can even block the code from merging--any pull request that contains a "double suppression" could require a stamp from a site-wide infra team. This helps avoid a "breaking this rule here takes down the site" kind of situation. Of course, sometimes you have to ship fast. Hopefully, the infra oncall is online!

I'd love to see more discussion of the social contracts behind the design of our tools. Social contracts are everywhere--in how we version software, in how we map the organizational structure to the file structure, in how we split the product into teams, and in how we distribute the shared responsibility for shipping new features, avoiding mistakes, and evolving the patterns throughout the codebase.

And also, you know, not taking the site down.
