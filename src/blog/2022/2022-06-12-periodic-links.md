---
date: 2022-06-12T09:50:28Z
tags:
  - links-list
title: Links list - 2022-06-12
aliases: [/links-list-2022-06-12]
---

Hello, and welcome to a new edition of _Links lists!_ A bit more low-level stuff this week!

## Coding

### Blurring backgrounds in video chats

Interesting article from [Slack](https://slack.com/) about how they have implemented blurring the video call background in [clips](https://slack.com/help/articles/4406235165587-Record-audio-and-video-clips-in-Slack).

{% previewExternal "slack.engineering.building-background-effects-for-clips" %}

### Postgres data types

Did you know that PostgreSQL has _a lot_ more data types supported than your standard database, like IP addresses, geometric data, or JSON? Here's a quick introduction, but of course you can check out the great [official documentation](https://www.postgresql.org/docs/current/datatype.html) for all the details.

{% previewExternal "www.compose.com.articles.what-postgresql-has-over-other-open-source-sql-databases" %}

## Coding - Low level

### Vectorization in Java

An interesting, and rather complex article about implementing sorting with the new [vectorization instructions](https://it.wikipedia.org/wiki/SIMD) that are currently incubating in the JVM, in [project Panama](https://openjdk.java.net/projects/panama/). The author is able to achieve a roughly 3x speedup over `Arrays.sort`, which is pretty impressive!

{% previewExternal "jbaker.io.2022.06.09.vectors-in-java" %}

### Reading files - the hard way

A very fun series about how files works. Start with the classical C API, go deeper into assembler, syscalls, and the kernel, and end up reading raw bytes from ext4 and talking about how inodes work! Very cool!

{% previewExternal "fasterthanli.me.series.reading-files-the-hard-way" %}

### Strace

Speaking of syscalls and the kernel, [strace](https://strace.io/) is a _fantastic_ tool to know. It helps you trace all the interactions between your process and the kernel, and can be super valuable to understand what is going on. Here's one of the best introductions I know of.

{% previewExternal "nanxiao.gitbooks.io.strace-little-book.content" %}

## Non tech

### Caffeine

Interesting article from the often amazing [Guardian](https://www.theguardian.com/international) about the history and the addictive effects of caffeine.

A few years ago I tried giving it up for a few months, due to stomach issues, but I ended up going back, on a limited amount per day. In addition to the "wake up" effect, I really do _love_ my morning cup of espresso - it tastes great and it is an important part of the morning routing for me!

{% previewExternal "www.theguardian.com.food.2021.jul.06.caffeine-coffee-tea-invisible-addiction-is-it-time-to-give-up" %}
