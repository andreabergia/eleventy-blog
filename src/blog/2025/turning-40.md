---
date: 2025-12-04T20:20:00+01:00
tags:
  - blog
title: Turning 40
---

Today I am turning 40 years old. Which, while not exactly _great_, is better than the alternative, so kudos to me for still being alive! 🎉

I am a pretty lucky person. I was born in one of the best, richest countries of the world. I feel safe, I have a good job, I am pretty healthy and I have a lovely family. But, for the past couple of months leading up to this milestone, I have spent a lot of time reflecting on life ~~and failing to fall asleep due to the existential dread of having already used up half of my time~~, and I've been thinking about writing this post for a while now.

So, without further ado, here's my version of the "40 things I've learnt over my 40 years" trope. It's definitely too long, and I fear it is a bit cheesy and cliché, but I've tried to be honest and I hope you'll enjoy this.

## Life

1. By far the most important one: _be decent_. This means a lot of things: be respectful, try to do the right thing, put some care and effort in your work, be kind to strangers, call your parents. But, honestly, you don't need me to explain what it means. We all know what the decent thing to do is, and we all sometimes falter by slacking off, being rude, or ignoring some problem you saw and thinking "someone else will fix it". The important thing is not to be perfect, but to be honest with yourself, recognizing when you should have done more, and trying to improve.
2. You only have one life. It might not be amazing, but it shouldn't suck. If it really does, do something to change it.
3. Don't obsess over things you can't change.
4. Social media are, at best, a waste of time. At worst, a tool of political manipulation and misinformation. Avoid them and pick up a book, a TV show, a movie, a video game, a text editor and compiler, a pet, whatever.
5. The past is the past. Learn from it, but move on.
6. Admit when you fuck up. This is something that I almost never see anyone do, sadly. When someone makes a mistake, they immediately start to explain why that happened, why the situation was complex, why it took longer than expected, etc. Just be straightforward: "I didn't think about that and I should have; sorry. That's on me". It's so _refreshing_ to hear and makes everything simpler if someone actually has the guts to admit a mistake.
7. Remember that everyone struggles and has their own problems. Be nice.
8. Though some people really are assholes. They aren't worth your time.
9. Also, no matter how nice you are, some people will just not like you, no matter what. It happens. Keep trying to be polite, and don't lose sleep on it.
10. There will always be people smarter, kinder, better, fitter, more successful than you. Don't compare yourself to others; compare yourself to your past self. (This is a difficult one.)
11. Exercise. Barring tragedies, you _will_ get old, and you'll be glad you still have strength and flexibility.
12. The world is not as bad as [you think](https://en.wikipedia.org/wiki/Factfulness) it is.
13. Whatever you write on the internet, whichever picture you post, stays on the internet forever. Err on the side of being discreet.
14. If every week you're spending half of the standup complaining about the same stuff, maybe you should search for another job. Or, at least, learn to suffer in silence. Please.
15. Treat your job like what it is: a financial relationship between you and your employer, where you do work and you get money. That's it. You might have a great relationship with your colleagues, you might be solving cool problems, your boss might love you, and you might be a superstar at your company. But your company _will_ eventually be bought, go through a hard time, or just decide it needs to remove 10% headcount because that's what everyone else is doing. At that point, HR will look at you just through the lens of an Excel spreadsheet, where employees are marked _costs_, and someone you never met will not care about how many nights you have sacrificed for the good of some projects.
16. Be loyal to _people_, not companies. Companies have one objective: maximize shareholder value. Not treat you, a customer or employee, fairly, or to give you a good product. Act accordingly.
17. The day you become a parent your priorities in life shift completely. Your kid's wellbeing and happiness is really the only important thing.
18. Nothing can prepare you for the joy and love you will feel by becoming a parent.
19. Nothing can prepare you for the frustration and exhaustion you will feel by becoming a parent. But, luckily, the love and happiness win - and it's not even close. ❤️

## Programming

I've been writing code for well over thirty years by now, and I like to think that I know one thing or two about it. So, here's some advice:

20. Real engineers ship.
21. Code without tests is useless. Automated tests aren't enough, but they are the very bare minimum.
22. This is a bit controversial, but I personally believe that tests need to be upheld to the same quality standard as the production code. The only exception is that, in tests, trading some duplication for readability is very much worth it. You want to be able to read a test method from start to end and, at the very least, understand _what_ it is testing.
23. Once upon a time, people wasted _a ton_ of time debating code styles. [Modern](https://github.com/rust-lang/rustfmt) [languages](https://go.dev/blog/gofmt) ship with an opinionated formatter, but there's at least one such tool available for every language nowadays. Adopt it and stop wasting time on things that don't matter.
24. Use a CI. It should run tests, check the linter and the formatting. You shouldn't be able to deploy anything that hasn't been built by the CI, and conversely, you should deploy the exact same artifact on all environments without modifying it. Never ship binaries built on your machine!
25. Write _simple_ code. Don't be clever, don't use the most esoteric features of your language, don't rely on a very weird and cool functional programming library that no one in your team knows. Slightly long but simple is better than short and clever. Writing simple, straightforward code is _hard_, but so worthwhile when you'll have to mantain it.
26. A good name is often better than a comment.
27. ...but comments can be very useful. A comment should explain _why_ you're doing something: _what_ you're doing should be obvious from the code, but sometimes why you are doing something in one place rather than another, or why you are doing something at all, is worth explaining. And, in that case, put it in a comment, not in the Jira ticket or PR description. It should live as close as possible to the code, to minimize the risk of drift.
28. One PR should do one thing. If, while implementing a feature, you find a bug, _please_ open a separate PR for that. Git's [interactive rebase](https://andreabergia.com/blog/2015/01/git-rebase--interactive/) is great for that. [Stacked PRs](https://www.stacking.dev/) are super useful, though the tooling isn't yet great in my experience. [Jujutsu](https://www.jj-vcs.dev/latest/) is also a very interesting tool that takes "rewriting the history" to an extreme.
29. Please oh please do write at least a minimal description of your PRs. Yes, even if the details are all in the Jira ticket. Please.
30. On non-emergency days, reviewing PRs should be treated as the highest priority task. Your colleagues are waiting on you. Don't you hate waiting for three days for a review?
31. Doing side projects is highly rewarding - one of mine literally led me to a more interesting job, that also pays me a good deal more. It takes a lot of time and effort, and most days I actually do _not_ want to write code after work. But it's worth trying to find the energy to do some project here and there - you will learn so much!
32. Limit the amount of things you want to learn from a single side project - if you want to learn, say, Rust, don't try to learn at the same time how to write a compiler or LLM agent or ray tracer. It will be much harder.
33. Practice writing - I highly [recommend](https://andreabergia.com/blog/2024/03/how-is-this-blog-built/) blogging, but you do you. In the LLM age, being able to communicate clearly and to express technical information in English has become the superstar skill, so get practicing.
34. [Take notes](https://andreabergia.com/blog/2022/07/notes-software-obsidian/) - the more, the better. They will come in handy. Consider using a dictation tool; LLM-based ones are _really_ good, even with my weird Italian accent.
35. [TextMate](https://macromates.com/), [Sublime](https://www.sublimetext.com/), [Atom](https://atom-editor.cc/), [VS Code](https://code.visualstudio.com/)... editors come and go. [Vim](https://neovim.io/) and [Emacs](https://www.gnu.org/software/emacs/) are still there. I picked up Vim 25 or so years ago, and I still use it today.
36. Learn the tools you use every day _well_. In particular, learn `git`. You should have really understood the difference between merge and rebase, know how to do an interactive rebase, what bisect is. The [Pro git book](https://git-scm.com/book/en/v2) is great and free.
37. [Choose boring technologies](https://boringtechnology.club/).

## The controversial stuff

And now, for some flames! 🔥

38. It's ok to admire and enjoy someone's work even if you dislike their personal life or opinions.
39. Java is a really good programming language.
40. Star Wars is overrated.

Thanks for reading!
