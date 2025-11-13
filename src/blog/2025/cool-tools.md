---
date: 2025-10-12T17:30:00+02:00
tags:
  - tools
title: Useful tools and apps
---

Today I wanna share with you a list of very useful tools and apps that I use regularly. I'm not going to include very popular things such as [neovim](https://neovim.io/), [VS Code](https://code.visualstudio.com/), [Claude Code](https://www.claude.com/product/claude-code), or [Obsidian](https://obsidian.md/), but I'll try to link you to some slightly less known things, hoping you get to discover some useful thing you didn't know!

## Shell tools

### eza

Let's start simple with [eza](https://eza.rocks/), a drop-in replacement for `ls`. Quoting from its website:

> eza is a modern, maintained replacement for the venerable file-listing command-line program ls that ships with Unix and Linux operating systems, giving it more features and better defaults. It uses colours to distinguish file types and metadata. It knows about symlinks, extended attributes, and Git. And it’s small, fast, and just one single binary.

I've used it (and previously its predecessor `exa`) as an alias for `ls` for some years, and I have zero complaints.

![Eza screenshot](/images/2025/tools/eza.png)

### bat

Yet another replacement, this time for the venerable `cat` - which I've aliased to [bat](https://github.com/sharkdp/bat). The main benefits for me are syntax highlight and git integration (i.e. the gutter will show you the git status of the file). I love it!

![Bat screenshot](/images/2025/tools/bat.png)

### fd

[fd](https://github.com/sharkdp/fd) is a fantastic tool which has replaced `find` for me - though it is not a drop-in replacement, as the options are quite different. But,  compared to `find`, `fd` has _sane_ default and I can actually remember how to use it without checking its man page. 😁 It's also very fast and supports fuzzy name finding, meaning you can type only some letters of the file and it will find it:

```sh
> fd netfl
Software/python/imdb-ratings/netflix-details.py
```

An alternative tool that I've used for a while is [fzf](https://github.com/junegunn/fzf), which is pretty nice, but I just prefer `fd`.

### rg

[RipGrep](https://github.com/BurntSushi/ripgrep) or `rg` for short is the latest in the "fast grep" tools family. It is _incredibly_ fast and its super easy to use: `rg pattern`.  Highly recommended.

### delta

[delta](https://github.com/dandavison/delta) is an enhancement for `git diff`. Installing it is very simple and it really improves the default difference view, by adding syntax highlight, a header that shows class/function name with support for all the most common languages, and even side-by-side view if you want!

![Delta diff view](/images/2025/tools/delta.png)
![Delta side-by-side view](/images/2025/tools/delta-side-by-side.png)

### duf

[duf](https://github.com/muesli/duf) is a simple replacement for `df -h`. It has a really nice-looking and useful output without any need for configuration.

![duf screenshot](/images/2025/tools/duf.png)

### zoxide

[zoxide](https://github.com/ajeetdsouza/zoxide), aliased to `z`, is a fuzzy directory finder. It remembers all the times you do `cd` and sorts the locations, so that you can jump quickly to one of your most used places with a few keystrokes:

```
z pr sr
# will cd you to ~/project/src
```

### Atuin

[Atuin](https://atuin.sh/) is a _great_ replacement for your shell's `ctrl-r`. My favourite feature is that I have configured it to search first in the history for the current directory only, which makes it a lot more accurate. And if I actually want something from another directory, a second `ctrl-r` stroke switches it to "global" search.

It's super useful, but I am really not a fan of all the added "sync stuff" or "desktop" features that they're trying to pile on it.

![Atuin screenshot](/images/2025/tools/atuin.png)

### git plugin for omzsh

I still use [Oh My Zsh](https://github.com/ohmyzsh/ohmyzsh/tree/master), though I haven't relied on many of its features for a while now. The last one I really use a lot is the [git](https://github.com/ohmyzsh/ohmyzsh/tree/master/plugins/git) plugin, which comes with _many_ aliases that I am super used to.

```sh
# a few basic ones
alias gl="git pull"
alias gp="git push"
alias gb="git branch"
alias gc="git commit"
alias gd="git diff"
# and a few more specialized ones
alias gcp="git cherry-pick"
alias gcpc='git cherry-pick --continue'
alias gcpa='git cherry-pick --abort'
# and _many_ more!
```

Obviously these could be replicated by normal shell aliases, and I will eventually get around disabling omz completely. But, for the moment, I use these tons of times per day, and they are really well thought out.

### just

I've used [just](https://github.com/casey/just) in quite a [few](https://github.com/andreabergia/rjvm) [projects](https://github.com/andreabergia/emjay) and I really like it. It is a very simple command runner, inspired by make. Its simplicity is what I really love about it: it's little more than a shell file, and it is great for running project-dependent commands, such as a linter or for running all tests.

![just screenshot](/images/2025/tools/just.png)

## Mac applications

### Rectangle

[Rectangle](https://rectangleapp.com/) is the program that made me stop screaming in rage against macOS's window management. It creates a few global shortcuts that I can use for moving a window in the left half, or right third, or similar layouts very fast. I have set its keybinding to things like ctrl-alt-left, and I can just use these shortcuts in every window. It is one of my most loved applications, and it also has a [pro](https://rectangleapp.com/pro) version if the basics aren't enough.

![Rectangle settings screenshot](/images/2025/tools/rectangle.jpg)

### Ghostty

[Ghostty](https://ghostty.org/) has become my terminal of choice as soon as I have discovered it. It looks great, it's fast, it has very sane default shortcuts on macOS for things like tab splitting, and I have had zero problems with it. Highly recommended!

## SuperWhisper

I've only recently started using [SuperWhisper](https://superwhisper.com/) - it's basically an universal dictation app powered by LLMs. It registers a global keybinding that you can just use to record yourself. When you release the keybinding, SuperWhisper will transcribe your voice and enter the text for whatever you just said into your focused app. It works everywhere, and so far I have found it to be really useful, but it's hard to say if I will stick with it.

![SuperWhisper screenshot](/images/2025/tools/superwhisper.png)
