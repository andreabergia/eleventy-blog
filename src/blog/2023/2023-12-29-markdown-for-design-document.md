---
date: 2023-12-29T16:30:00+01:00
tags:
  - architecture
title: Markdown and Git for design documents
featured: 5
---

Something that I find very important to do before undertaking big cross-team developments is to write down a design document. Unfortunately, I have seldom seen teams do that, yet they are **very** useful in my experience!

Having design documents can really help have a good discussion about a solution, within and across teams, _before_ you start implementing something. Furthermore, _time passes_. People forget the reason why a decision was taken, people leave and join teams, and having written down something that can give context about a decision that has been taken is super useful.

A design document should include at the very least:

- some background on the topic;
- the objective you want to achieve;
- a high-level overview of the solution you are proposing;
- alternatives considered and why you opted for your solution.

There are a lot of details that should go into the document, like interactions with other systems, security, scalability, etc. of your solution. I will put some resources at the bottom, but this post is not about that.

What I want to discuss here is the _tooling_ to use for design documents. I've seen teams use mostly Word or Google Docs for them, but I recently joined a team that was not used to writing them. What I wanted to do to show the benefits of the practice ([show, don't tell](https://blog.codinghorror.com/show-dont-tell/)) was to just write one. So, I simply created a new git repo, started typing in a markdown file, and opened a PR.

The benefits I can see with respect to using something like Word or Google Docs are:

- we're developers! We write markdown all the time, in PRs and issues;
- Markdown has enough structure to make the document readable, but it allows you to avoid worrying about the formatting and lets you focus on the content;
- you get history, logs, and all the other usual VCS benefits;
- we can get a discussion on a draft, with comments and mail notifications, simply by creating a PR;
- when the PR is merged, the document is considered final.

Using familiar tools like markdown and a simple PR on GitHub means that the barrier for entry is super low, and this encourages participation from everyone - especially more junior developers, who may not be used to the practice of "actually _thinking_ and writing something down before blasting away code". 🙂 Plus, having a single repo makes it easy to find all the documents, along with their history, and do things like retrace the original authors for questions.

That's it - my big discovery. Very simple, and I imagine many people already do so, but I thought it was a good idea, worth sharing. 🙂

## References

- [A good summary at StackOverflow's blog](https://stackoverflow.blog/2020/04/06/a-practical-guide-to-writing-technical-specs/)
- [Design docs at Google](https://www.industrialempathy.com/posts/design-docs-at-google/)
- [The anatomy of an Amazon 6-pager](https://writingcooperative.com/the-anatomy-of-an-amazon-6-pager-fc79f31a41c9)
- the _fantastic_ book [The Staff Engineer's Path](https://www.oreilly.com/library/view/the-staff-engineers/9781098118723/) by Tanya Reilly, who has some great examples and best practices.
