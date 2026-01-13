---
date: 2026-01-07T23:10:00+02:00
tags:
  - rust
title: "Arena allocators"
draft: true
---

Today, I wanna talk about arena allocators - an useful, but not super well known technique.

TODO:
1. Definition and basic concepts - What exactly is an arena allocator? How does it differ from traditional allocators?
2. Trade-offs and limitations - When NOT to use arena allocators (lack of individual deallocation, memory waste potential)
- discuss why, mentioning cpu cache lines
- mention usage in
  - games
  - compilers
  - dom manipulation
  - event systems
- discuss how you implement it abstractly
- discuss rust libraries
  - bumpalo
  - one of the crates which uses indexes (slotmap, generational-index, typed-arena, id-arena, slotmap. google for more)
- link some sample code
