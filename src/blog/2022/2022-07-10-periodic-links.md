---
date: 2022-07-10T20:14:28Z
tags:
  - links-list
title: Links list - 2022-07-10
aliases: [/2022/07/links-list-07-10]
---

Hello, and welcome to a new edition of _Links lists!_ A few longer but interesting articles this week, and a couple of short ones. I hope you enjoy them!

## Tech article

### Swapping memory at Meta

Swapping unused memory to the disk, to fit more applications in RAM, is a simple concept that all developers (I hope!) are familiar with. This article from ~~Facebook~~Meta explains how they have built an infrastructure, composed of a kernel module and a userspace agent, to more aggressively implement swapping while measuring application impact, for self-tuning.

The results seem great: 20-30% memory saving with very low applications impact, which means being able to fit more applications on servers - a significant money-saving, at their scale. Pretty in-depth article, and very interesting.

{% previewExternal "engineering.fb.com.2022.06.20.data-infrastructure.transparent-memory-offloading-more-memory-at-a-fraction-of-the-cost-and-power" %}

### The tension between standardization and exploration

In every tech company, there is a tension between standardizing tools and allowing your engineers some freedom to explore. On one hand, you cannot build each and every application from scratch with some obscure programming language or framework, because that would be a maintenance nightmare. But, you also cannot simply reuse the same things for ages without ever innovating, because the tech world moves so fast and you will fall behind - not to mention, lose great people that just get bored.

This article is an interesting point of view about this theme - I don't agree with everything within it, but it is a reasonable and well-argued point of view.

{% previewExternal "lethain.com.magnitudes-of-exploration" %}

### CORS

If you do not know what CORS is, or how it can be exploited, this is a pretty good guide in my opinion, written from a security expert point of view. Note: the link is to a PDF file.

{% previewExternal "www.bedefended.com.papers" %}
{% previewExternal "www.bedefended.com.papers.cors-security-guide" %}

### Various kinds of UUID

You probably have used UUIDs before, but did you know there are multiple families of them, and how do they work? This is a very clear and concise explanation.

{% previewExternal "www.sohamkamani.com.uuid-versions-explained" %}

### A trick of the tail

Did you know that `tail` can be used in reverse order with `-r`? I did not, pretty useful!

{% previewExternal "leancrew.com.all-this.2022.07.tail-i-lose" %}

## Non tech

### History of glass

An interesting story of glass making, with some fantastic pictures, and its importance in leading to the scientific revolution - which the article probably overstates a bit.

{% previewExternal "wordpress.lensrentals.com.blog.2015.09.a-clear-history-of-glass" %}
