---
date: 2025-11-28T22:00:00+01:00
tags:
  - links-list
title: Links list - 2025-11-28
---

Hello, and welcome to a new issue of _Links list!_ Lots of articles this time; hopefully some will be interesting to you!

## Usage of Rust in Android

Two related articles: the first, from Google's Security Blog, is a bit more high-level. The second is a paper, and thus more in-depth, with concrete suggestions on "how to adopt Rust in your codebase". The benefits that the Android team saw are fantastic and don't really need much commentary:

> We adopted Rust for its security and are seeing a 1000x reduction in memory safety vulnerability density compared to Android's C and C++ code

> With Rust changes having a 4x lower rollback rate and spending 25% less time in code review, the safer path is now also the faster one.

{% previewExternal "security.googleblog.com.2025.11.rust-in-android-move-fast-fix-things.html" %}

{% previewExternal "queue.acm.org.detail.cfm?id=3773096" %}

## eBPF to monitor billions of kernel events per minute

The _fantastic_ [technical blog](https://www.datadoghq.com/blog/engineering) of Datadog has a new, very interesting article, which goes into details on how they implemented a file integrity monitoring tool, using `eBPF` for performance. `eBPF` really has become the tool of choice for so many observability and security tools - it is a really interesting technology.

{% previewExternal "www.datadoghq.com.blog.engineering.workload-protection-ebpf-fim" %}

## You should write an agent

A couple of really nice tutorials on what really is involved in building an agent. Building one is actually really simple; I've built a couple of toys, and it really is impressive how effective a modern (!) model can be with some basic tools. But the devil is in the detail; for example, for me, using [Claude Code](https://www.claude.com/product/claude-code) or [OpenAI's Codex](https://openai.com/codex/) is _so_ much nicer than alternatives like [Cursor](https://cursor.com/) or [Windsurf](https://windsurf.com/), even if the underlying models are the same.

{% previewExternal "fly.io.blog.everyone-write-an-agent" %}

{% previewExternal "ampcode.com.how-to-build-an-agent" %}

## Microwaves are the future!

If you're _exhausted_ by all the AI news, here's a fun read to remind you that it's worth taking what AI-selling executives say with at least a couple of pinches of salt.

{% previewExternal "www.colincornaby.me.2025.08.in-the-future-all-food-will-be-cooked-in-a-microwave-and-if-you-cant-deal-with-that-then-you-need-to-get-out-of-the-kitchen" %}

## Porting Doom to Atari

A really fun adventure in porting Doom to a very old platform like the Atari ST (a 1985 computer), in assembly.

{% previewExternal "medium.com.@jonas.eschenburg.how-i-stopped-worrying-and-started-loving-the-assembly-4fd00e786c60" %}

## Go's new garbage collector

A really interesting approach from Go's newest garbage collector. Given how impactful having a cache vs a main memory access is with a modern CPU, the idea of Green Tea is just to work _per-page_, rather than per-object. This is a lot more cache-friendly, and the team also implemented parts of the algorithm with AVX-512 for performance, resulting in a 10% to 40% reduction in GC costs. It's a very interesting blog, full of details but very clear to read. Highly recommended!

{% previewExternal "go.dev.blog.greenteagc" %}

## The `<output>` tag

I didn't know about this one, but I can see it being useful for accessibility purposes. And, it makes your intent clearer, which is always a good thing. Finally, imagine having an `<output>` tag and an `.output` CSS selector, compared to stuff like `<div class="llm-chat-box-output-widget current">` (or, you know, any Tailwind class soup).

{% previewExternal "denodell.com.blog.html-best-kept-secret-output-tag" %}

## Typst

[Typst](https://typst.app/) is a modern reimagination of `LaTeX`. I've tried to use it recently for a couple documents and it's been a really good experience.

{% previewExternal "fransskarman.com.phd_thesis_in_typst.html" %}

## On the importance of being mildly annoyed

A really entertaining and smart piece about how most people are actually pretty mildly _annoyed_ all the time, and why that is important:

> When we say, "I love my job," we really mean, "My job pisses me off, but in an enchanting way."

{% previewExternal "www.experimental-history.com.p.thank-you-for-being-annoying" %}
