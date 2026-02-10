---
date: 2026-02-10T21:00:00+01:00
tags:
  - blog
title: "Website Redesign!"
---

[Restarting]({% ref "2022-04-10-reboot.md" %}) my blog in 2022 was one of the best decision I have ever taken. Since then, I have written almost 60 posts, a few of which have been featured on the front page of Hacker News, and one of which led me directly to my [current job](https://www.servicenow.com/), so this has been successful beyond my dreams. Besides, it put me in contact with a ton of interesting and smart people, led me to my [first conference talk]({% ref "rustlab-2025.md" %}), and was extremely useful in learning to write better. After all, there's nothing like exercise!

While the [old version]({% ref "how-is-this-blog-built.md" %}) of my website was built with [Hugo](https://gohugo.io/), I have been long thinking about building my own blog engine from scratch, especially considering how easy that would be with an LLM. However, I have ended up with something halfway - I have decided to use [11ty](https://www.11ty.dev/), which ended up offering me enough flexibility, but also enough built-in plugins to ensure that I could follow all the best practices. Migrating the content was pretty simple - my posts are all markdown files. I had various LLMs create me a scaffold, migration and validation scripts to ensure that all the links were preserved.

I have gone dark-mode only for this version, and I am very happy with the colors. I have designed the layout and look&feel myself, with the help of various LLMs. I have been collecting really cool blogs over the last few months, and I have taken little bits [here](https://corrode.dev/blog/prototyping/) and [there](https://joshcollinsworth.com/blog/copilot) from [many](https://alt-romes.github.io/posts/2023-11-10-creating-a-macos-app-with-haskell-and-swift.html) of [them](https://www.jonashietala.se/blog/2022/08/29/rewriting_my_blog_in_rust_for_fun_and_profit/), while adding my own ideas and I am pretty satisfied with where I have landed. Of course, I agonized for a silly amount of time on every single tiny detail, and I kinda gave up trying to improve many things rather than being _really_ satisfied, but hey - that's how all engineers do designing I think? 😁

I love doing photography, and I have been wanting to publish my photos on my blog - rather than on [Instagram](https://www.instagram.com/andreabergia/) - for a while, but I ended up giving up on that for the moment. This migration took me an agonizingly long while already, especially with a lot of css tweaks, and I wanted to actually be done with it and restart publishing posts. So, the photo blog will have to wait a bit longer, but I do want to get it done.

One thing I have _finally_ done though was to properly open-source this - it is now hosted on [GitHub](https://github.com/andreabergia/eleventy-blog) and it has a proper license, [CC-BY-4.0](https://creativecommons.org/licenses/by/4.0/), which - from my understanding - means that you're free to use my work as long as you give attribution, which I think it's fair for something like my blog with my personal thoughts.

So here it is, the new version of my website! I hope you like it as much as I do. 🙂

## Screenshots of the old website

Here's a small gallery of the old website, for my nostalgia moments in a couple of years.

<img src="/images/2026/old-blog/homepage.png" alt="Homepage" class="screenshot">
<img src="/images/2026/old-blog/posts.png" alt="Posts list" class="screenshot">
<img src="/images/2026/old-blog/blog-post.png" alt="A blog post" class="screenshot">
<img src="/images/2026/old-blog/series.png" alt="Series list" class="screenshot">
<img src="/images/2026/old-blog/about.png" alt="About page" class="screenshot">
