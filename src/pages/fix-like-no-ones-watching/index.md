---
title: 'Fix Like No One’s Watching'
date: '2019-02-15'
spoiler: The other kind of technical debt.
---

Some technical debt is in plain sight.

An inadequate data structure might lead to convoluted code. When the requirements keep changing, the code might contain traces of previous approaches. Sometimes the code is written in a hurry or is just sloppy.

This kind of technical debt is easy to discuss because it’s highly visible. It manifests as bugs, performance problems, and difficulties adding features.

There is another, more insidious kind of technical debt.

Maybe the test suite is a *little bit* slow. Not slow to a crawl — but just enough that you don’t bother looking at a bug and add it to the backlog instead. Maybe you don’t trust the deployment script so you skip that extra release. Perhaps the abstraction layers make it too hard to locate a performance regression so you leave a TODO in the code. Sometimes the unit tests are too rigid so you postpone trying an intriguing new idea until after you’ve shipped the planned features.

None of these things are dealbreakers. If anything, they might seem like distractions. It feels vain to complain about them. After all, if they *really* mattered, you would have done those things despite the friction, wouldn’t you?

And so these things never get done. They don’t seem important enough by themselves. **The friction killed them.** Some of these explorations could be of no consequence. Some of them could redefine your project.

You never know. This is why you must actively reduce friction. Like your project’s fate depends on it. Because it does.

Fix like no one’s watching.