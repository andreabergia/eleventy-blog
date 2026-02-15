---
date: 2026-02-14T16:00:00+01:00
tags:
  - blog
title: "Website Redesign!"
---

[Restarting]({% ref "2022-04-10-reboot.md" %}) my blog in 2022 was one of the best decisions I have ever made. Since then, I have written almost 60 posts, a few of which have been featured on the front page of Hacker News, and [one of which]({% ref "2023-07-12-rjvm-1.md" %}) led me directly to my [current job](https://www.servicenow.com/), so this has been successful beyond my dreams. Besides that, it put me in contact with a ton of interesting and smart people, led me to my [first conference talk]({% ref "rustlab-2025.md" %}), and was extremely useful in learning to write better. After all, there's nothing like exercise!

While the [old version]({% ref "how-is-this-blog-built.md" %}) of my website was built with [Hugo](https://gohugo.io/), I have been thinking for a long time about building my own blog engine from scratch, especially considering how easy that would be with an LLM. In the end, I managed to resist the urge and I have decided to use [11ty](https://www.11ty.dev/), which offers me enough flexibility, but also enough built-in plugins to ensure that I could follow all the modern best practices.

I used various LLMs to scaffold an 11ty project, then I migrated the content. That was pretty easy, as all my posts are written as markdown files. Switching system required some changes in the post frontmatter, but LLMs wrote simple migration scripts. I also had agents build some validation scripts, to ensure that all the links were preserved. The experience was smooth and pretty nice, and even though `npm run build` takes 5s vs the 0.5s of `hugo build`, the live refresh works and that's all I really use. If the deploy takes 5s more, who cares, we're still talking less than one minute from my "git push" to the live website being updated.

I switched to dark mode only for this version, and I am very happy with the colors. I have been collecting really cool blogs over the last few months, and I have taken little bits [here](https://corrode.dev/blog/prototyping/) and [there](https://joshcollinsworth.com/blog/copilot) from [many](https://alt-romes.github.io/posts/2023-11-10-creating-a-macos-app-with-haskell-and-swift.html) of [them](https://www.jonashietala.se/blog/2022/08/29/rewriting_my_blog_in_rust_for_fun_and_profit/), while adding my own ideas, and I ended up with a design that feels original to me, and I’m pretty happy with it. Of course, I agonized for a _silly_ amount of time on every single tiny detail, and I kinda gave up trying to improve many things rather than being _really_ satisfied, but hey - that's how engineers design, no? 😁

One thing I have _finally_ done though was to properly open-source this website. It is now hosted on [GitHub](https://github.com/andreabergia/eleventy-blog). I have chosen the [CC-BY-4.0](https://creativecommons.org/licenses/by/4.0/) license, which - from my understanding - means that you're free to use my work as long as you give attribution. I think this is a fair balance for something like a blog with my personal thoughts.

I ended up postponing various things that I _do_ want to do with my website, because the redesign alone took me an embarrassing amount of time, but at least now I have a solid base in place that I can iterate on. For example, I love doing photography, and I have been wanting to publish my photos on my blog - rather than on [Instagram](https://www.instagram.com/andreabergia/) - for a while now, but I ended up giving up on that for the moment.

So here it is, the new version of my website! I hope you like it as much as I do. 🙂

---

## Screenshots of the old website

Here's a small gallery of the old website, for the nostalgia moments I will surely have in a couple of ~~months~~ years.

![Homepage{.screenshot}](/images/2026/old-blog/homepage.png)
![Posts list{.screenshot}](/images/2026/old-blog/posts.png)
![A blog post{.screenshot}](/images/2026/old-blog/blog-post.png)
![A links list post{.screenshot}](/images/2026/old-blog/links-list.png)
![About page{.screenshot}](/images/2026/old-blog/about.png)
![Series list{.screenshot}](/images/2026/old-blog/series.png)
