---
date: 2025-05-14T23:00:00+02:00
tags:
  - c++
title: Writing C++ in 2025
---

Spoiler: this is a rant. 😂

I have tried to write a small side project in modern C++ recently. I wanted to have a proper setup with modern tooling and practices, in part because I wanted to see what the state of the art was for C++. So I settled on these tools:

- compiler: [clang](https://clang.llvm.org/);
- build system: [cmake](https://cmake.org/);
- dependencies resolution: [conan](https://conan.io/);
- unit test framework: I have adopted [catch 2](https://github.com/catchorg/Catch2), because it looked quite simple;
- [lsp](https://microsoft.github.io/language-server-protocol/): I have used [clangd](https://clangd.llvm.org/);
- linter: there seem to be multiple valid choices, but I have settled on [clang-tidy](https://clang.llvm.org/extra/clang-tidy/);
- formatter: [clang-formatter](https://clang.llvm.org/docs/ClangFormat.html).

Pretty widely used tools, so they should work well out of the box... right?

## The tooling

Well, it's not that easy. Let's start with `conan`: I have followed the [getting started](https://docs.conan.io/2/tutorial/consuming_packages/build_simple_cmake_project.html) guide, and I wanted to use the most recent C++ standard (C++20) because, I mean, why not? Also, I wanted to be able debug my code - I know, such an unusual requirement!

Well, apparently, to do so, you have to modify a global configuration file for `conan` in your home directory and create a new "profile". Why can't that be specified in the `conanfile.txt`, for a given project, I do not know. But anyway, that was a bit strange, but not too bad.

The next step was using `cmake` to define the project, and boy do I _dislike_ that tool. I have always found the syntax quite weird - and having to list manually every `.cpp` file seems such a crazy thing to do in 2025. I just want to build all the files in a given directory tree, why is that not an easy thing to do?

After having solved that hurdle and many related small things, setting up `clangd` was pretty easy. It works out of the box if you have a file named `compile_commands.json` in the correct place. Cmake produces it, but in a subfolder of `build`, but that was easily worked around with a symlink.

`clang-tidy` was instead a bit of a pain. It took me various iterations and LLM support to get the correct incantation so that it would _not_ report warnings about files in conan's libraries (such as `catch2`). Having solved that, an important step has been to configure it - since C++ is such an old and complex language, various codebases have different settings and conventions. `clang-tidy` offers therefore a ton of presets such as `llvm` or the modern [`cppcoreguidelines`](https://isocpp.github.io/CppCoreGuidelines/CppCoreGuidelines) from [Bjarne Stroustrup](https://www.stroustrup.com/) and [Herb Sutter](https://herbsutter.com/).

`clang-format` was fine. No complaints here.

If you compare all these tools with modern languages, you really see the age of C++ and the accumulated cruft caused by decades backward compatibility. I do understand why the complexity is there - in my first job, I was working on a large C++ codebase that needed to support weird systems such as HP-UX with Itanium, or AIX. But I believe that, in 2025, tools should be more opinionated and with better defaults.

In my opinion Rust is the gold standard here - `cargo` is _such_ a fantastic tool. Easy dependency management (`cargo add lib`), building and debugging works out of the box, _with_ cross-compiling support as well; the lsp ([`rust-analyzer`](https://rust-analyzer.github.io/)) works well and out of the box, [`clippy`](https://github.com/rust-lang/rust-clippy) is fantastic, and I do really enjoy having a standard formatter tool in `cargo fmt`.

As a side note, I will go even further: I believe in go's approach of having a tool like `go fmt` that is _not_ configurable. All `go` code looks the same in every project, and that is _great_. Not having to configure things like tab versus spaces for each project, or having clean git diffs because the code is always formatted consistently, is just such a time saver. I haven't really seen `cargo fmt` be heavily customized in a project, but still, I would have preferred if it offered no configurations at all.

But, while Rust might be the best, Go, Python, JavaScript, and TypeScript aren't far behind. Dependency management is not a problem in 99% of the projects, with `go`, `node`, or with fantastic modern tools such as [uv](https://github.com/astral-sh/uv). LSPs and linters are available for all languages - even though you might have actually _too many_ options for Python... 🙂

In general, getting started with a modern language is pretty simple: stuff tends to work out of the box and to be well supported by various editors and IDEs. With C++, I found that I spent a significant amount of time just getting the tooling to work properly.

## The language

Let's talk about the real stuff: writing C++ in 2025. Naturally I have tried to use the most recent standard, C++20, which has innovative new features such as formatting a string without `sprintf`, using [`std::format`](https://en.cppreference.com/w/cpp/utility/format/format). 😉

Let's start with the simplest of things - needing both a `.cpp` and `.h` file. I've heard [modules](https://en.cppreference.com/w/cpp/language/modules) were a thing, but googling a bit showed that they aren't [really working](https://news.ycombinator.com/item?id=37889631) properly yet, so I ended up not even trying them.

Having to split declaration and definitions really feels legacy. I get that, once upon a time, compilers had less memory and so could only do a single pass on a file... but it's 2025 now, and having to go back to that old pattern, after having used more modern languages for a decade, ain't great. At least I managed to avoid using the ~~good~~ ol' [include guards](https://en.wikipedia.org/wiki/Include_guard) by simply adding a `#pragma once` in each `.h` file, which seems to be [widely supported](https://en.wikipedia.org/wiki/Pragma_once) nowadays.

On to the next complaint! I wrote a simple class that needed a destructor. The linter helpfully suggested that I probably wanted to also add some constructors and assignment operators, so it ended up creating the following:

```cpp
  MyClass(const MyClass &) = default;
  MyClass &operator=(const MyClass &) = default;
  MyClass(MyClass &&) = default;
  MyClass &operator=(MyClass &&) = default;
```

I get the reasoning behind this, but damn, this is a lot of noisy code. Copy constructor; move constructor; copy assignment operator; and move assignment operator, all explicitly created just to mark them as `= default`. I don't know if it's just the linter being noisy, but it feels heavyweight.

In general, I am not a fan of how [move](https://en.cppreference.com/w/cpp/language/move_assignment) was implemented in C++. While it definitely helps avoiding a lot of useless copies, it makes the language quite a bit more complex and adds quite a bit of noise. The original sin, though, is that copying in C++ is _implicit_. I think Rust has much better defaults here, because copying requires an explicit `.clone()` call, and using implicit copying is opt-in by deriving `Copy`. Of course, it's not something C++ can change, but after understanding the (arguably more complex) semantics that Rust implemented, it's hard to go back.

The next thing that annoyed me a bit was the following: I had a simple `std::vector` of some structs, and I wanted to concatenate one of their fields. This would normally be something like `v.map(o => o.name).join(", ")` in most languages, but apparently that isn't really a thing in C++... yet. There's the whole [ranges](https://en.cppreference.com/w/cpp/ranges) library in C++20, but it feels like a lot of things are only from C++23. I ended up writing an old-school `for` loop. Does it work? Sure. Does it compare to modern iterators that are present in many languages? Not really.

One of the thing that annoyed me the most was error handling. I have blogged [about this before]({% ref "2023-05-01-error-handling-pattenrs.md" %}) and I greatly missed Rust's `Result`. There's a lot of patterns, all pretty commonly used in C++: using exceptions, returning error codes where -1 means "error", returning error codes where 0 means "error", taking a reference parameter to an error pointer, using an `std::variant`, etc. But, unfortunately, you will likely have to use more than one in C++, because even the standard library is not really coherent. I'd rather have Go's [verbose](https://herecomesthemoon.net/2025/03/multiple-return-values-in-go/) and slightly magical approach, because at least it's _coherent_. But, of course, my favourite approach is to use sum types like `Result` in Rust.

Finally, one last complaint: I have tried GitHub CoPilot with various models, and they all seemed to suck at very simple refactorings like extracting functions from the cases of a switch statement.

As a note, the standard [seems to be evolving](https://herecomesthemoon.net/2024/11/two-factions-of-cpp/) in the direction of keeping backward compatibility at all costs, even against the interest of performance and simplicity. It is a valid and sensible choice, but it seems to strengthen the role of C++ as a "legacy" language - there's a ton of important and useful C++ codebases that need maintenance, but in my opinion people should avoid starting a new project in C++ today.

## Conclusions

After a few weeks, I have ended up abandoning my project and rewriting it in Rust. 😂 I realized I was basically trying to write Rust in C++, which can actually work because C++ is a _really_ flexible language, but it's not as good as the real thing. I really missed pattern matching, iterators, `Result`, and in the end I feel a lot more productive with Rust. And that doesn't include all the nice tooling, or the safety that the borrow checker gives me.

It was interesting, though, to try and use modern tools for a language that I haven't used in a while. It is honestly hard to go back to such a legacy language where more modern alternatives have really pushed the bar on developer expectations.

Can I write decent C++? I think so. Would I do it if someone paid me to do it? Of course. But would I use C++ for a new hobby project? Well, pretty clearly, not. And I would (almost) never use it for a greenfield project at work, either.

So, there you have it: I've genuinely tried to write "modern", clean C++, and I got annoyed to the point where I went back to my beloved Rust. 🦀 Thanks for reading my rant!

<code>&lt;/rant&gt;</code>
