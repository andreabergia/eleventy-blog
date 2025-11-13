---
date: 2022-07-03T09:14:28Z
tags:
  - tools
title: Notes software - Obsidian
aliases: [/2022/07/notes-software-obsidian]
---

Taking notes is something pretty common, and for which there are _a ton_ of options. I've tried a lot of software over the years, but my current choice is [Obsidian](https://obsidian.md/).

The main reason behind my choice is that I am a programmer and I like simple text files. Obsidian is "simply" a markdown editor, so your notes are just files on the file system that you can access with any software you want. If for some reason I want to stop using Obsidian, all my notes are markdown files that I can open with any text editor, or easily import to another tool, as most offer some form of markdown import.

Furthermore, Obsidian is multi-platform, which is an important part for me - I want to use it on a Windows and a Linux pc, an Android phone, and an iPad. Very few tools run on all these platforms, unfortunately, but Obsidian does.

However, its strength does not come from the text editing part ([Vim](https://www.vim.org/) still does it better than anything else, in my opinion 😉), but from the ability to create links between the notes, and from the plugins ecosystem. Creating links between notes is trivial in Obsidian - simply type `[[` and a popup will allow you to create links. The application includes all sorts of views to display links between notes, as you can see from its [homepage](https://obsidian.md/images/screenshot.png).

The plugin ecosystem is _fantastic_ - there are a lot of different plugins, that work also on mobile, to enhance Obsidian in so many useful ways. My favorites include:

- [Outliner](https://github.com/vslinko/obsidian-outliner) - which is without a doubt my favorite plugin, since I always end up creating hierarchial todo-lists that I update multiple times per day. This plugin gives you a great outliner view, with folding and shortcuts (like tab/shift-tab) for management.
- [Kanban](https://github.com/mgmeyers/obsidian-kanban) - which shows you a Kanban view (think Trello) from a markdown file, using reasonable formatting so that your file still makes sense without the plugin. I find it to be really useful because you do not have to open an external software, and of course, you can create links from the cards to your notes.
- [Reminder](https://github.com/uphy/obsidian-reminder) to create reminders for tasks. Super simple to use, and effective.
- [Tasks](https://github.com/obsidian-tasks-group/obsidian-tasks) to have a unified list of all tasks across notes.
- [Excalidraw](https://github.com/zsviczian/obsidian-excalidraw-plugin) to create diagrams with [Excalidraw](https://excalidraw.com/) directly from Obsidian.

There are also plugins to create [simple slides](https://help.obsidian.md/Plugins/Slides), [manage a calendar](https://github.com/liamcain/obsidian-calendar-plugin), or use a [day planner](https://github.com/lynchjames/obsidian-day-planner), and more.

If you want to sync your notes across devices, the only alternative that works on all my platform is the official [sync](https://obsidian.md/sync) plugin, which costs 10$/month. It's not super cheap, but it works _really_ well in my experience, and for the moment I am happy to pay for it.

## Alternatives

I have tried many different note-taking tools in the past, but for multiple reasons, I have abandoned them all. Here's a quick list:

- [Notion](https://notion.so/) is a pretty great tool! You can write using Markdown, it has a generous free tier, and it works well from desktop _and_ mobile. I have used it for quite a while and I was pretty happy with it. I can definitely recommend it, if pure markdown files scare you or because you often need to add tables or images (for which, honestly, Obsidian and - more generally - pure markdown files are not great).
- [Simplenote](https://simplenote.com/) by the great [Automattic](https://automattic.com/) guys is a nice tool - pretty simple, as its name implies, but it works well on all platforms and it is free.
- [Onenote](https://www.microsoft.com/onenote) is ok, but it sucks for writing code. It is pretty good, especially if you have Office 365, but like Teams or Outlook it feels very much tailored to non-devs. Also, it stores notes in a proprietary format.
- [Evernote](https://evernote.com/) used to be good, but a few years back they started pushing hard for subscriptions, to sync more than two devices, and I have not used it in a long while. It also stores notes in opaque formats.
- [Google keep](https://keep.google.com/) is way too simple for my tastes. I use it for quick reminder, because it integrates well with Google Calendar, but not for any "serious" notes taking.
- Finally, there's the famous [org mode for Emacs](https://orgmode.org/), but since it is not available on mobile I have never really spent time learning it.
