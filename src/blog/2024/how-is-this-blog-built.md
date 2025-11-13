---
date: 2024-03-08T16:00:00+01:00
tags:
  - blog
title: How is this blog built?
---

In this post, I want to explain the technologies I use for building this blog. There are never enough technical blogs around, so hopefully it will inspire you to start on your own. ☺️

# The website

The first decision I made, a long time ago, was that I wanted to write Markdown and not raw HTML (or any sort of non plain-text format). Markdown is fast to write and edit, has enough formatting tools for my purposes, and makes it easy to compare revisions of files.

I initially started writing this blog using [Ghost](https://ghost.org/), which is a node application. I hosted it on the tiniest VM available on [Digital Ocean](https://www.digitalocean.com/) - it used to cost me about 5€ / month. It was pretty good, but I had a couple of annoyances with it:

- upgrading the version of Ghost was a bit annoying, and sometimes tiny things broke;
- my blog was served by a `node` backend, on a VM exposed to the Internet, and it was _terrifying_ to look at the machine's logs and see the amount of probing and hacking attempts it received.

In the end, I decided to switch technology and I jumped to the tool I'm currently using - [Hugo](https://gohugo.io/). What I love about it is that it generates the website at "compile time", i.e. its build process produces a directory of static `.html` files. Serving only static files is great - they are small, meaning they make the website load pretty much instantaneously, and they are (almost) free on the backend.

Hugo is written in go - I have installed it with [homebrew](https://brew.sh/), which keeps it updated automatically. I have been using it since 2017, and updating has never broken anything for me.

Hugo is also _incredibly_ fast to generate the pages - my website, with 170 pages, builds in 167ms. When writing a new post locally, it features hot reload which is instantaneous. For comparison, I wrote some posts on the [technical blog](https://technology.lastminute.com/) of my [previous employer](https://www.lastminute.com/), which used [Gatsby](https://www.gatsbyjs.com/) and it took various tens of seconds to build. While I liked many things about Gatsby, speed was not one of them.

Another thing that I love about Hugo is that I didn't have to become an expert in it to be effective. I eventually made some customization to my template of choice, but getting started was super easy. It also supports useful things out of the box, such as [RSS](https://en.wikipedia.org/wiki/RSS) - which, luckily, has _not_ died with [Google Reader](https://en.wikipedia.org/wiki/Google_Reader): it's alive and well, and I still use it every day to keep up with (literally) hundreds of blogs collected over the years and a very limited number of news website.

I store all the files, plus the Hugo metadata, in a private repo on [GitLab](https://gitlab.com). I have considered making it public, but I don't think anyone would be interested in looking at it, and I am not sure I want my draft posts to be readable by anyone. 🙂

Hugo works by means of a [theme](https://themes.gohugo.io/), which is used as the template system that your markdown content fills in. I am using the theme [Coder](https://github.com/luizdepra/hugo-coder), which I have slightly customized - for example, I added the list of recent blog posts on the home page. I like that theme because it is very clean, and it works well in both light and dark mode.

A good reference, other than [the official site](https://gohugo.io/), is [Justin James' series about Hugo](https://digitaldrummerj.me/series/blogging-with-hugo/).

# Hosting and DNS

Since my website is a small folder of html, css, and images, I am hosting my website on [Netlify](https://www.netlify.com/), which offers a generous free tier - enough to survive [hitting the front page](/images/2024/03/hn.png) of [Hacker News](https://news.ycombinator.com/) for a few hours. They also include a simple CI pipeline that supports Hugo out of the box - I just had to point it at my git repo and everything was automated. Zero effort, HTTPS included, free. Pretty great deal.

For the domain, I have been using [Namecheap](https://www.namecheap.com/) for almost a decade. They came highly recommended and I have nothing to complain about - the control panel is quite simple to use, and I have never had any problem. The domain is less than $15 per year, which is the only recurring cost of my website now.

I am also very happy with my actual choice of domain - while there are a lot of fantastic tech blogs with creative names, my nickname on just about every website is `andreabergia`, and I am glad to own [andreabergia.com](https://andreabergia.com). Yes, I am _that_ unoriginal. I have never bothered to set up emails, though - addresses such as `me@andreabergia.com` or `info@andreabergia.com` never sounded super appealing. But, considering how shitty [Google](https://en.wikipedia.org/wiki/Don%27t_be_evil) is becoming, I should probably stop using GMail anyway…

# Other tools

For drawing diagrams, I have recently started to use [Excalidraw](https://excalidraw.com/). I like its "fuzzy" style - makes me less worried about having everything perfectly aligned. Plus, it's open source, which doesn't hurt.

Basic spellchecking is integrated into [my text editor](https://github.com/doomemacs/doomemacs), but I also use [Grammarly](https://grammarly.com/) when I am done with the last draft of the post - it has helped me _many_ times to find silly mistakes.

I do _not_ use ChatGPT or other AI tools to write my posts. Sure, they might help and probably come up with better grammar than I do, but I prefer my posts to reflect _my_ ideas, not those of an LLM. I have, however, been using [GitHub Copilot](https://github.com/features/copilot) in the past year or so for writing some code. It is surprisingly useful and probably worth a post of its own.

# TL;DR

Here is my stack:

- markdown sources hosted on [GitLab](https://gitlab.com);
- [Hugo](https://gohugo.io/) with the [Coder](https://github.com/luizdepra/hugo-coder) theme for generating static HTML files from the `.md` files;
- [Netlify](https://www.netlify.com/) for hosting;
- [Namecheap](https://www.namecheap.com/) for DNS.

Now, go and write your own blog! 🙂
