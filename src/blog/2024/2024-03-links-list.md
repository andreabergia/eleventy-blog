---
date: 2024-03-30T14:00:00+01:00
tags:
  - links-list
title: Links list - 2024-03-30
---

Hello, and welcome to a new post of _Links lists!_ I hope you will find today's links interesting.

## How large is your website?

Unsurprisingly, it turns out that _many_ websites are stupidly bloated and large. This is thanks to the ridiculous amount of advertisement, tracking, and all other bullshit that we need to endure in exchange for having tons of content for free. If only the content _you pay for_ didn't have these sorts of things...

Terrifying example: opening LinkedIn makes you download **_31 MB_** of stuff!

{% previewExternal "tonsky.me.blog.js-bloat" %}

## Java GC at Netflix scale

Interesting article from the fantastic [Netflix tech blog](https://netflixtechblog.com/) about the modern Java GCs from Java 21 and their effects on pauses, efficiency, and latency.

{% previewExternal "netflixtechblog.com.bending-pause-times-to-your-will-with-generational-zgc-256629c9386b" %}

## Sharding Figma's database

[Figma](https://www.figma.com/) is another company with a great [tech blog](https://figma.com/blog). In one of the latest posts, they talk about how they implemented horizontal sharding of databases. Interesting approach, and well written article.

{% previewExternal "www.figma.com.blog.how-figmas-databases-team-lived-to-tell-the-scale" %}

## Trying to polyfill `globalThis` in JavaScript

Some things in JavaScript are a bit crazy. `globalThis` is one of those - nowadays it is natively supported more or less everywhere, but trying to polyfill it is not trivial. This is a fun article with a lot of details.

{% previewExternal "mathiasbynens.be.notes.globalthis" %}

## Avoiding primitive obsession in Go

A nice article from the super smart [Matteo Vaccari](https://matteo.vaccari.name/) about something I [blogged about before]({% ref "2022-09-12-primitive-obsession-smell.markdown" %}): the many benefits of wrapping primitives in their own tiny wrapper types.

{% previewExternal "matteo.vaccari.name.posts.avoid-primitive-obsession-in-go" %}

## Another crazy interview

Yet another super fun satire about a technical interview. This time it is about solving fizz-buzz with [Tensorflow](https://www.tensorflow.org). Enjoy! 😂

{% previewExternal "joelgrus.com.2016.05.23.fizz-buzz-in-tensorflow" %}
