---
date: 2026-03-06T15:00:00+01:00
tags:
  - links-list
title: Links list - 2026-03-06
---

Hello! I was planning to finish this issue of _links list_ in February, because I have a ton of links saved, but life happened, and now it's already March. Let's get on with it! 🙂

## Build your own (LSM) database

A _fantastic_ introduction to Log-Structured Merge Tree, the core data structure behind many key-value stores. Outstanding explanation and animations. Really clear and well done.

{% previewExternal "www.nan.fyi.database" %}

## Nobody gets promoted for simplicity

An interesting, if depressingly true, post. It talks about how building a complex and over-engineered architecture can be rewarded, because the complexity is often seen as smart and important.

{% previewExternal "terriblesoftware.org.2026.03.03.nobody-gets-promoted-for-simplicity" %}

## Optimizing compilers vs cryptography

Cryptography is a complicated beast. Spectre and similar attacks showed the power of [side-channel timing attacks](https://en.wikipedia.org/wiki/Side-channel_attack), and thus a lot of cryptographical code needs to ensure that is designed to run in a "constant-time".

This article goes into a lot of interesting details about what that means, and how compiler optimizations can accidentally break the carefully crafted code.

{% previewExternal "mcyoung.xyz.2025.12.15.value-barriers" %}

## Migrating databases in production

Netflix's [tech blog](https://netflixtechblog.com/) is full of excellent articles. In their latest post, they talk about how they migrated databases in production with minimal downtime - which is a complex affair at their scale. Lots of interesting details.

{% previewExternal "netflixtechblog.com.automating-rds-postgres-to-aurora-postgres-migration-261ca045447f" %}

## We mourn our craft

> The worst fact about these tools is that they work. They can write code better than you or I can, and if you don’t believe me, wait six months.

{% previewExternal "nolanlawson.com.2026.02.07.we-mourn-our-craft" %}

## ASCII characters are not pixels

This blog post goes into _great detail_ about how to use ASCII characters for image rendering. It's a bit crazy, super detailed, and such a labour of love. I really enjoyed this.

{% previewExternal "alexharri.com.blog.ascii-rendering" %}

## No code reviews by default

Apparently at Raycast they don't do PRs - everyone commits straight to master and they can _request_ someone else to review their code. In their experience, the freedom and low friction are key to moving fast.

When I started working, in 2009, we followed exactly that approach - everyone committed directly to the `HEAD` (we were so behind the times that we still used `cvs` back then! The migration to `svn` took some years, and I think that's what they are still using for that codebase...) and there was no review process. _Sometimes_ we poked the super senior engineer for a review, and that was it.

In my experience, it was _awful_. Everything in the codebase basically had a bus factor of one, since no one else had ever seen any of the code. Not only a ton of horrible code and wrong decisions made it to production, but it also often caused unbalanced workloads.

Pull requests weren't really a thing 15 - 20 years ago. Every software company uses some form of it today for a reason. _Human_ code reviews might well go away in the near future due to Claude and friends, but the ideas of code reviews and related things such as automated tests, linters, fuzzers, etc. will live on in my opinion.

{% previewExternal "www.raycast.com.blog.no-code-reviews-by-default" %}

## All it takes is for one to work out

> There were multiple points after I submitted applications where I lost hope.
>
> But during that stretch, a friend and colleague kept repeating one line to me: “All it takes is for one to work out.”

{% previewExternal "alearningaday.blog.2025.11.28.all-it-takes-is-for-one-to-work-out-2" %}
