---
date: 2026-05-10T22:00:00+02:00
tags:
  - links-list
title: Links list - 2026-05-10
---

Hello! After a house-moving-related hiatus, here I am back with a _links list_ issue.

## Bugs Rust won't catch

You probably have seen this one recently as it made the rounds, but if you haven't read it, this is a _very_ interesting article. It describes various vulnerabilities in `uutils`, the Rust reimplementation of `coreutils` (`cat`, `ls`, and friends - i.e. the core Unix tools). The interesting thing is that the various bugs were often a case of "the system call is tricky to use correctly", but none were the classical memory-related issues (buffer overflows, use-after-free, double-free, etc).

{% previewExternal "corrode.dev.blog.bugs-rust-wont-catch" %}

## How do you build an AI sandbox?

A really in-depth overview of modern sandboxing technologies. I have learnt a lot from this one, highly recommended.

{% previewExternal "read.engineerscodex.com.p.every-dev-should-know-about-ai-sandboxes" %}

## A history of SMTP and X.400

A really fun article from the great [ButtonDown blog](https://buttondown.com/blog/) about the history of email protocols.

{% previewExternal "buttondown.com.blog.x400-vs-smtp-email" %}

## Avoiding the spotlight as Staff Engineer

A really interesting point of view about doing important work by just slow, steady, continuous improvements on key infrastructure pieces. I can really relate. 🙂

{% previewExternal "lalitm.com.software-engineering-outside-the-spotlight" %}

## Chasing the spotlight as Staff Engineer

This is really the opposite of the previous article, and it argues that "if you wanna get promoted - _do_ chase the spotlight". Which, again, is very much true in my experience.

{% previewExternal "www.seangoedecke.com.the-spotlight" %}

## How do we grow junior scientists?

A really interesting essay on the usage of AI by junior scientists, and how that can hinder learning and experience. Definitely relatable for junior software engineers.

{% previewExternal "ergosphere.blog.posts.the-machines-are-fine" %}

## Wide-events in logs

This is kind of an ad, but I think it has some valid and interesting ideas about how publishing "wide" events in logs, i.e. events with a lot of fields and information, can really help you when debugging production systems.

{% previewExternal "loggingsucks.com" %}

## Even Linus Torvalds vibe-codes

Well, apparently even Linus Torvalds creates applications for fun vibe-coding. Go ahead, you're allowed.

{% previewExternal "github.com.torvalds.AudioNoise.blob.71b256a7fcb0aa1250625f79838ab71b2b77b9ff.README.md" %}
