---
date: 2024-01-21T18:10:00+01:00
tags:
  - architecture
  - books
title: Working effectively with legacy code
---

Recently, I have started working on a [large code base](https://www.servicenow.com/). It can reasonably considered "legacy" in many parts, given that some of the core files that I'm touching are around 20 years old. Also, there aren't anywhere near enough unit tests - even if there are a good numbers of integration tests.

This has led me to think back to one of the best programming books I have ever read, [Working effectively with legacy code](https://www.oreilly.com/library/view/working-effectively-with/0131177052/) by [Michael Feathers](https://twitter.com/mfeathers?lang=en). I have read it around ten years ago, so my recollection might not be 100% accurate, but I remember the book's thesis to be quite simple:

> legacy code is code **without tests**!

This is a deep and very useful point of view. It means that code without tests is hard to change, because you are afraid of touching it and breaking stuff. Therefore, you are scared at doing big refactoring, and adding new features is complicated.

Furthermore, in my experience code without unit tests tends to be messier - dependencies between components (class, functions, modules, whatever you have in your language) are often not really well defined, [coupling](https://en.wikipedia.org/wiki/Coupling_(computer_programming)) is very high and [cohesion](https://en.wikipedia.org/wiki/Cohesion_(computer_science)) is all over the place. There is a reason why many people say that [TDD](https://en.wikipedia.org/wiki/Test-driven_development) is a [design tool](https://philborlin.medium.com/tdd-is-about-design-not-testing-e42af0b28475)!

---

The process that the book suggests to fix this is simple:

- define a scope - you can't change a whole codebase at once, so decide where to focus;
- write tests, to validate the current behavior;
- and then refactor, trusting that your tests will catch any breaking change!

It is basically the opposite process of TDD: when working with legacy code, you have some code but no tests, so you start by adding them. In TDD, you write the tests _first_. In any case, the refactoring step is fundamental.

The book covers _a lot_ of techniques for actually adding the tests and doing the refactoring, and it is very useful, if maybe a bit dated by now... but this core idea _really_ stuck with me. I have applied it many times, and it has been very effective.

I am using it once more now, and I am sure I will find it again to be effective. 🙂 Also, I highly recommend reading the book if you haven't yet!
