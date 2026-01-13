---
date: 2026-01-01T15:00:00+01:00
tags:
  - links-list
title: Links list - 2026-01-01
---

Hello, and happy new year. Here's the first issue of _links list_ for 2026, with lots of links because hopefully you're still in vacation and you have more time to read! 🙂

## What happens if we inline everything?

A very fun experiment in pushing the compiler to inline _everything_, which includes patching LLVM too. A fun read!

{% previewExternal "sbaziotis.com.compilers.what-happens-if-we-inline-everything.html" %}

## Four billion `if` statements

Another completely crazy but fun experiment in pushing compilers: can you build an `if` chain with _four billion_ cases?

{% previewExternal "andreasjhkarlsson.github.io..jekyll.update.2023.12.27.4-billion-if-statements.html" %}

## Advent of Compiler Optimisations 2025

The amazing [Matt Godbolt](https://xania.org/MattGodbolt), creator of [Compiler Explorer](https://godbolt.org/), has done a fantastic advent series about compiler optimizations. It's full of unexpected tricks and a very worthwile read, even if you aren't a C or C++ expert.

{% previewExternal "xania.org.AoCO2025-archive" %}

## Hand-written or generated parsers?

An interesting survey about whether popular language implementations use a generated parser with some tool such as lex/yacc, antlr, etc; or have an hand-written parser. Spoiler: most have an hand-written one!

{% previewExternal "notes.eatonphil.com.parser-generators-vs-handwritten-parsers-survey-2021.html" %}

## Optimizing String in Java

An in-depth article about a complex but powerful optimization done to the `String` class of Java. It's really impressive how much engineering has gone, and still goes into the JVM performance optimizations.

{% previewExternal "inside.java.2025.05.01.strings-just-got-faster" %}

## The birth of prettier

[Prettier](https://prettier.io/) wasn't the first code formatter, but it definitely helped pushed the trend that many modern languages such as [go](https://go.dev/blog/gofmt) or [rust](https://github.com/rust-lang/rustfmt) are also following: all code committed should be formatted by an automated tool, in the same way. As I have written before, I _strongly_ support this - when I was young, I thought that my personal style was obviously the best one, and that everyone else should just get used it because I would write code my own way. Luckily I outgrew that idea, and now I push for having an automated formatter on every project. It just makes life much easier, and it simplifies code review as well because you aren't dealing with spurious whitespace changes.

The following article is well written, and goes into some details of the non-trivial algorithm employed by Prettier.

{% previewExternal "blog.vjeux.com.2025.javascript.birth-of-prettier.html" %}

## Code interview: fix a bug in this repo

A couple of nice articles about an unusual, but IMHO really good style of code interview: "here's a codebase, go fix a bug/implement a small feature".

{% previewExternal "blog.jez.io.bugsquash" %}

{% previewExternal "quuxplusone.github.io.blog.2022.01.06.memcached-interview" %}

## Why large enterprises have so much bureaucracy

A _very_ well written and interesting article that really explains well why large enterprises value processes so much, even if they full well know that they cause a lot of slowdown and cruft.

{% previewExternal "www.seangoedecke.com.seeing-like-a-software-company" %}

## Comparing yourself to others

A good point of view about how a good way of comparing yourself to others.

{% previewExternal "alic.dev.blog.comparisons" %}

## 3D printing Warhammer 40,000 miniatures

A really fun read about the world of Warhammer 40,000 miniatures and 3D printing. I had a lot of good laughs reading this, because I luckily never got the urge to try it, but I know a few people who did... 😂

{% previewExternal "matduggan.com.the-year-of-the-3d-printed-miniature-and-other-lies-we-tell-ourselves" %}

## The decoy effect

Often, when buying something, you are shown three different versions: A, B, and C, where A is the cheap one, C is the expensive one, and B is a middle one that's obviously a bad deal. This is intentional, and it's exploiting a cognitive bias called the "decoy effect".

{% previewExternal "mattrickard.com.decoy-effect" %}
