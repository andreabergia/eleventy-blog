---
date: 2023-01-22T18:30:00+01:00
tags:
  - languages
  - javascript
title: Languages opinion - part three - Javascript and Typescript
series: ["Languages Opinion"]
---


Welcome back to my mini-series about [programming languages](/series/languages-opinion). In this post, we will talk about what is probably the world's most used programming language: JavaScript. We will also discuss TypeScript, given its relevance and usage today.

# JavaScript history

JavaScript was famously invented [in 1995 in 10 days](https://en.wikipedia.org/wiki/JavaScript), for inclusion in Netscape. Over the decades, it has been adopted by every browser and used by (more or less) every website. Eventually, with the creation of [node.js](https://en.wikipedia.org/wiki/Node.js), it found a place server-side as well. JavaScript interpreters, such as [Spider Monkey](https://spidermonkey.dev/) from Mozilla, or [v8](https://v8.dev/) from Google, were also embedded in various applications. I worked in the early 2010s in a large C++ project, where we embedded Spider Monkey to implement some customizations for our customers, and it was a very interesting project!

Nowadays JavaScript is everywhere - from desktop applications built with [Electron](https://www.electronjs.org/) to [smart tvs](https://promwad.com/news/how-develop-publish-tizen-apps-smart-tv-our-guide-javascript-engineers) - and of course [smartphones](https://reactnative.dev/). It is probably the most used programming language in the world, and it was key in inventing [JSON](https://www.json.org/json-en.html), which is even more ubiquitous.

In the 2010s, it went through an explosive growth phase, but it also reached maturity and a lot of new interesting features with the release of [ECMAScript 6](https://en.wikipedia.org/wiki/ECMAScript), often called "ES6". This new version of JavaScript gave the language a very modern feeling, and fixed some of its pain points. There are a lot of lists of "what's new in ES6" around, so I won't bother repeating everything, but as a quick summary we've got:

- `let` and `const`
- arrow functions
- spread operators
- `Map` and `Set`
- classes
- promises

It was a huge release of the language, and writing modern JS is _much_ better than it was a decade ago. It is actually a fun language now! 😊

## Tooling and frameworks

Since web developers had to live for years with Internet Explorer - whose development stopped ages ago -, for a long time people used "transpilers" like [babel](https://babeljs.io/) to write modern JS as input and get the old syntax as output. In this way, your output code could work even in older browsers. Luckily, IE is finally gone 🎉, and since the [vast majority of browsers](https://caniuse.com/?search=es6) now support modern JavaScript natively, this is a lot less necessary than it used to be!

Furthermore, the huge increase in the amount of JavaScript written in a typical website led to the rise of [minifiers](https://www.cloudflare.com/learning/performance/why-minify-javascript-code/) and [bundlers](https://medium.com/@gimenete/how-javascript-bundlers-work-1fc0d0caf2da), such as [webpack](https://webpack.js.org/). This has been a complication for beginners, as you used to write an html page by hand and some `<script src>` tags, where now you have to use a complex build pipeline. Luckily, there was a rise of many amazing frameworks, that included all that setup for you.

Speaking of web frameworks, there have been a ton. [JQuery](https://jquery.com/) was immensely popular, but it wasn't really a framework - more of a library. [Backbone](https://backbonejs.org/) was one of the most used early frameworks, but I have a special place in my heart for [AngularJS](https://angularjs.org/), which I believe helped popularize the concept of "components as custom tags" and unit testing on the frontend.

Then, of course, came [React](https://reactjs.org/) - today's de-facto standard, and one which relies a lot on modern tooling and syntax. There are of course a ton of valid alternatives, like [Angular](https://angular.io/) - which is pretty good in my opinion, and widely used in the enterprise -, and [Vue](https://vuejs.org/). However, React is so popular that there are frameworks built _on top_ of it - for example, [NextJS](https://nextjs.org/).

If I think back on how we wrote web applications in 2010, and how we write them today... well, it has surely changed a lot (for the better)! 😅

# TypeScript

Speaking of tools, [TypeScript](https://www.typescriptlang.org/) is surely one of the most popular. It is a new open-source language, built as a superset of JavaScript (meaning that _most_ JavaScript is also valid TypeScript). The main feature it adds is _typing_ - you can specify the type of variables, functions, and so on and TS will check for you that you have used them coherently. Given that JS is a weakly-typed language, with many automated conversions, a mistake with types in JS often causes _silent_ erroneous behaviors and bugs, which you have to investigate at runtime. Adding static typing helps a lot with these errors - and can help your editor give you much better suggestions!

I find the type system of TypeScript _very_ interesting, since it is quite powerful: it has [nullability](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#null-and-undefined), supports [union and intersection types](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#union-types), [narrowing](https://www.typescriptlang.org/docs/handbook/2/narrowing.html), and even has types such as [`Partial` or `Pick`](https://www.typescriptlang.org/docs/handbook/utility-types.html).

It was built by Microsoft and was [released initially](https://en.wikipedia.org/wiki/TypeScript) in 2012. Today, it is extremely popular - by [some surveys](https://www.infoworld.com/article/3650513/typescript-usage-growing-by-leaps-and-bounds-report.html), more than JavaScript itself! Many people have found the static types to be particularly helpful, and would not go back to writing "classic" JavaScript.

Since TS is built as a superset of JS, it means that it adopts all its modern features, such as classes or arrow functions. It also can be used very easily with other JS libraries. It includes a transpiler, that takes in input `.ts` and produces `.js` files, stripping the types' annotations while checking for types coherence.

Here is a quick example of the type annotations in play:

```typescript
// Parameter type annotation
function greet(name: string) {
  console.log("Hello, " + name.toUpperCase());
}

// In JS, this would be a runtime error if executed!
greet(42);
// TypeScript however gives us an error at compile time:
// Argument of type 'number' is not assignable to parameter of type 'string'.
```

# My personal opinion

If I had to start a new project today, I would use React as a web framework for the frontend part. Using Node on the backend is also pretty popular and a valid possibility, even if I feel its popularity has waned a bit in the past 3-5 years.

I also find TypeScript to be a _great_ language. It makes web programmers a lot more productive, both by preventing bugs and by giving you fantastic suggestions and refactoring tools in your editor or IDE, up to the standard of Java. Not only I wouldn't write raw JavaScript in a new project today, but I would even recommend starting to convert old code to TypeScript, if you still aren't using it. It is pretty easy to introduce in an existing project, in my experience, and the benefits are great.
