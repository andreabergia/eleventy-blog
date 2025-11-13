---
date: 2025-11-08T14:20:00+01:00
tags:
- talks
title: "RustLab 2025"
---

This week I've had the pleasure of attending and speaking at [RustLab](https://rustlab.it/), a conference dedicated to Rust in Florence, Italy.

It was only the second conference I’d ever attended, and the first I’d spoken at, so it was quite a novel experience for me. And I had a lot of fun! The conference was well organized, the venue was great, the pastries for the coffee breaks were _excellent_, I met a ton of smart people, and there were a lot of really good talks.

I really enjoyed the talks from [Tommaso Allevi](https://rustlab.it/speakers/allevi) about writing a [memory allocator profiler](https://github.com/oramasearch/rallo) - we had to do something similar (though slightly) simpler at work, and his library would have been super useful to have! [Andrea Righi](https://rustlab.it/speakers/righi) gave a really cool talk about using BPF, sched_ext, and a custom AI model to extend the Linux kernel scheduler from user space. [Luca Palmieri](https://lpalmieri.com/) gave a really interesting closing keynote talk about dependency injection in Rust with traits, discussing the downsides of the trait-based approach commonly used and how he is solving the problem in a different way for his [Pavex](https://pavex.dev/) web framework.

I also loved the experience of actually _giving_ a talk. I discussed my [JIT compiler, Emjay]({% ref "emjay.md" %}), and I think the talk went well. There were a good number of questions, and a few people told me they enjoyed the talk during coffee breaks, so I am definitely satisfied. If you're interested, the slides are [here](https://docs.google.com/presentation/d/1a2JtGpAX4eF9XbhMo7U7UjIEZmBk-xXxpe6cCJkrXXo/edit?usp=sharing), but there's nothing really new that isn't in my [blog post]({% ref "emjay.md" %}) about Emjay already. I'll add a link here to the video recording once it's available.

Not satisfied with one talk, I also ended up giving a lightning talk on the first day of the conference! During the coffee break in the morning I saw that there were still a few slots for them, and I've been planning to write a blog post about arena allocators for a while now, so I signed up, spent lunch preparing a couple of slides, and then gave my six-minute talk in the early afternoon. 😂 I think the talk went well even if it was a bit hastily prepared - the very short time was just enough to explain the idea.

Overall, it was a great experience, and I am looking forward to next year's conference! I want to thank in particular RustLab's [organizers](https://www.develer.com/) for accepting my talk proposal and for all the work preparing the conference, and anyone who attended my talks - I hope you enjoyed them and you got to learn something new!

![Me giving a talk](/images/2025/rustlab.png)
