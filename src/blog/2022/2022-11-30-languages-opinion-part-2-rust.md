---
date: 2022-11-30T20:30:00+01:00
tags:
  - languages
  - rust
title: Languages opinion - part two - Rust
series: ["Languages Opinion"]
---

{% postSeries %}

Welcome back to my mini-series about [programming languages](/series/languages-opinion). In this post, we will talk about one of the most interesting programming languages that I have seen in a long while: [Rust](https://www.rust-lang.org/). This is gonna be a rather long post, but I have tried to stay at a pretty high level, to give you an overview of the language, its strength, and its weaknesses as I see them.

Please note that I am a beginner with Rust, so this post might contain some inaccuracies. If you find any, please do enlighten me! 😊

# What is Rust

As I mentioned above, I believe Rust is one of the most interesting programming languages around. The first stable version was released in 2015, and its development was originally led by the Mozilla Foundation, as part of a research project about a new browser engine called [Servo](https://en.wikipedia.org/wiki/Servo_(software)) - which was eventually abandoned, although parts of it [live in Firefox](https://wiki.mozilla.org/Quantum). After Mozilla laid off quite a few of the core developers due to the Covid pandemic, the ownership of the project was restructured and now belongs to the [Rust foundation](https://foundation.rust-lang.org/).

So, what makes Rust _so_ interesting to me? The main idea is that Rust implements a rather complex "ownership tracking" system, called the borrow checker, which ensures that certain classes of bugs (like double free, use after free, multithreaded access without synchronization) become _compiler errors_ and thus _cannot_ happen at runtime. Furthermore, this system works without a garbage collector - ownership of values is always clear and explicit, and thus values can be cleaned up as soon as they are not required anymore.

While Rust was designed to be a [system programming language](https://en.wikipedia.org/wiki/System_programming_language), such as C or C++, it is a very expressive language with multiple paradigm support, and the code tends to look very "functional". Plus, it has a vibrant library ecosystem and it is becoming very popular, as we will discuss later.

Let's dig in!

# What's the syntax like?

Rust is a modern language in many ways, for example:
- types are generally inferred by the compilers, you seldom have to specify them;
- everything is an expression, including statements such as `if` or `match`;
- no exceptions. We will discuss error handling later.

So, here is some code:

```rust
let name = "Andrea";

let y = if 12 * 15 > 150 {
    "Bigger"
} else {
    "Smaller"
};

let message = match x {
    0 | 1  => "not many",
    2 ..= 9 => "a few",
    _      => "lots"
};

fn is_even(x: i32) -> bool {
    x % 2 == 0
}
```

Rust supports OOP via a `trait` system, but has no inheritance, like Go. It has generics, and an interesting macro system that is used by many libraries to automatically generate implementations of common traits.

# Enums and pattern matching

Rust has a **very** strong type system, and a lot of syntactic sugar to work with it. One of the most commonly used patterns is to design a type that contains multiple alternatives, and this is done via the `enum` feature. Variants can contain additional data. Let us see an example:

```rust
enum QueryResult<T> {
    NoData,
    OneRow(T),
    MultipleRows(Vec<T>)
}
```

In the example above, we are defining a type with three alternatives: `NoData` has no payload, `OneRow` has one item, and `MultipleRows` has a vector with all the various values. Notice that we are also using generics, with the classical `<T>` syntax.

When you have an alternative, you can use pattern matching:

```rust
match result {
    QueryResult::NoData => println!("No data found"),
    QueryResult::OneRow(_) => println!("Found one row"),
    QueryResult::MultipleRows(records) => println!("Found {} rows", records.len()),
}
```

There is also an interesting syntax, called `if let`:

```rust
if let QueryResult::OneRow(row) = result {
    do_something_with_one_row(row);
} else {
    println!("Found either 0 or many rows");
}
```

# Errors and Options

There are two very important `enum` types in the standard library: [Option](https://doc.rust-lang.org/std/option/enum.Option.html) and [Result](https://doc.rust-lang.org/std/result/enum.Result.html). These are pretty similar to the types you would find in any functional languages, and they are defined as follows:

```rust
pub enum Option<T> {
    None,
    Some(T),
}

pub enum Result<T, E> {
    Ok(T),
    Err(E),
}
```

The `Option` type is used to model the possible absence of a value - and replaces `null`, which Rust does _not_ have. The `Result` type is used to represent a computation that might return a valid answer or error, although it is also pretty often used in the form `Result<(), E>`, meaning either success with no additional information, or an error.

When using `Result,` it is pretty common to implement some sort of _fail-fast_ pattern:

```rust
let result = match my_fallible_function() {
    Ok(data) => data,
    Err(err) => return err,
};
```

Since this is so common, Rust added an _operator_ to the language it, which makes the code a lot simpler:

```rust
let result = my_fallible_function()?;
```

In my experience, the `?` operator is very ergonomic and simple to use - it makes the business logic a lot simpler to read.

An interesting thing is that these types are used _everywhere_ by the standard libraries, and thus are _also_ used by all the third-parties libraries - they are really the lingua franca for nullability and error handling. In general, the standard library has taken a lot of inspiration from functional languages - it is very idiomatic to iterate, map, and filter collections, for example. The pattern matching is very powerful and expressive as well.

# The (in)famous borrow checker

Let us now focus on the _killer feature_ of the Rust language: its memory management. It is very powerful - and also **very complex**. The idea is that each value has always _one_ owner, tracked by the compiler. When the owner goes out of scope, the value is destroyed. Data ownership can be _passed_ to other another function, but then the original method _cannot access the data anymore_. Let us see an example:

```rust
fn say_hello() {
    let user = User { name: "Andrea" };
    // user is owned by the method say_hello

    say_hello_to(user);
    // ownership of user has been passed to the say_hello_to method

    // cannot use user here anymore (compilation error!)
}

fn say_hello_to(user: User) {
    println!("Hello {}", user.name);
    // user is dropped here
}
```

Since this is super limiting, a _borrow_ of the value can be passed, so that ownership is retained by the original caller:

```rust
fn say_hello() {
    let user = User { name: "Andrea" };
    // user is owned by the method say_hello

    say_hello_to(&user);
    // we pass a borrow of the value, but we retain ownership

    // we can use user here!
    // user is dropped here
}

fn say_hello_to(user: &User) {
    println!("Hello {}", user.name);
}
```

One detail I have not mentioned is that values are immutable by default in Rust. If you want to mutate a variable, you will have to declare it explicitly as so:

```rust
let mut user = User { name: "Andrea" };
```

However, the borrow checker becomes stricter for mutable variables. You can have as many immutable borrows as you want, but while you have a _mutable_ borrow, you cannot create another one:

```rust
let mut user = User { name: "Andrea" };

let b1 = &mut user;

// Compilation error: cannot borrow again if there is a mutable borrow
let b2 = &mut user;

println!("User is: {:?} {:?}", b1, b2);
```

This is one of the killer features of the language - data races cannot happen, because they are _compilation errors!_

Another important part is that you can define that some data will be alive as long as _some other_ data will be - for example, an iterator into a vector. This is called _explicit lifetimes_. Since this is a bit complex, I am not going to discuss it in this post, but it is something important that you will have to understand to write some Rust code.

The borrow checker of Rust is the compiler part that handles the borrow rules. When writing Rust, you will spend a lot of time trying to "make the borrow checker happy", because you will _think_ you have understood its rules... even if you haven't really! 😅 It definitely is complicated, and is by far the biggest issue that new developers bang their head against. On the other hand, it is _the_ differentiating feature of the language:

- it allows Rust to do without a garbage collector, because values are dropped when the owner is done with them (similar to RAII in C++);
- it prevents lots of memory issues that regularly happen with languages like C and C++, such as double-free or use-after-free;
- it also prevents other bugs, such as data races.

I am not going to go into more details than this, since I just wanted to give you an idea of the feature. I hope I managed to pique your interest, though!

# Compiler, tooling, and libraries

Rust's compiler is called `rustc`, and is built as a frontend for [LLVM](https://llvm.org/). Thus, you get some of the best available machine code generation, on par with C++. Furthermore, given the strength of the type system, the compiler generally has _a lot_ of information about your code and can do some great optimizations - you write high-level, functional code, and you get out vectorized assembly for free. 🤘 You also get excellent portability and cross-compling is [rather easy](https://rust-lang.github.io/rustup/cross-compilation.html). Also, the compiler gives the _best error messages_ ever:

```
error[E0308]: mismatched types
 --> src/main.rs:8:44
  |
8 |   println!("y2k(1999) = {}", has_y2k_bug(1999));
  |                              ----------- ^^^^ expected struct `Year`, found integer
  |                              |
  |                              arguments to this function are incorrect
  |
note: function defined here
 --> src/main.rs:3:4
  |
3 | fn has_y2k_bug(year: Year) -> bool {
  |    ^^^^^^^^^^^ ----------
help: try wrapping the expression in `Year`
  |
8 |     println!("y2k(1999) = {}", has_y2k_bug(Year(1999)));
  |                                            +++++    +

For more information about this error, try `rustc --explain E0308`.
```

Rust also comes built-in with a pretty great build tool and package manager, called `cargo`. You generally only issue commands to `cargo` and forget about `rustc` - for example, `cargo build`, `cargo test`, or `cargo run`. Cargo can also download and build libraries, which are published onto [crates.io](https://crates.io/). Its developers made some smart choices in version resolutions, which you can read about [here](https://doc.rust-lang.org/cargo/reference/resolver.html).

There are also some pretty nice tools for working with Rust. The first I want to mention is [`rustfmt`](https://github.com/rust-lang/rustfmt), which ensures you get consistent formatting (similar to [gofmt](https://pkg.go.dev/cmd/gofmt) or [prettier](https://prettier.io/)). You want to run this on every file save - it's instantaneous and it does its job well. As an aside, I _really_ appreciate that there is **one** code style for a language, without any options - consistency triumphs any personal preference!

The next tool in our tour is [`clippy`](https://github.com/rust-lang/rust-clippy), which is a static analysis tool that can find both real issues and code style violations. It can also auto-correct some issues, and you definitely want to run it _at least_ in your CI.

Finally, I want to mention the [Rust language server](https://github.com/rust-lang/rls) - it works _wonderfully_ and lets you have great code completion, warning, and errors in any editor that supports the [LSP protocol](https://microsoft.github.io/language-server-protocol/) - including [Visual Studio Code](https://code.visualstudio.com/docs/languages/rust) or [VIM](https://blog.logrocket.com/configuring-vim-rust-development/). If you use JetBrains's IDEs, both [IntelliJ](https://www.jetbrains.com/idea/) and [Clion](https://www.jetbrains.com/clion/) have access to the [excellent Rust plugin](https://www.jetbrains.com/rust/).

# Miscellanea

Another very interesting thing about Rust is the support for [asynchronous I/O](https://rust-lang.github.io/async-book/01_getting_started/01_chapter.html). This has been integrated into the main language using the [async/await](https://en.wikipedia.org/wiki/Async/await) pattern, like other languages such as [JavaScript](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function), [C#](https://learn.microsoft.com/en-us/dotnet/csharp/programming-guide/concepts/async/), or [Python](https://docs.python.org/3/library/asyncio-task.html) - although of course Rust supports also [classical threads](https://doc.rust-lang.org/book/ch16-01-threads.html) and [channels](https://doc.rust-lang.org/book/ch16-02-message-passing.html), modeled upon those of like [Go](https://go.dev/tour/concurrency/2). Using `async/await`, you get code that "looks" synchronous, but underneath it is using high-performance primitives - [async io kernel calls](https://man7.org/linux/man-pages/man7/aio.7.html), using [`select`](https://man7.org/linux/man-pages/man2/select.2.html) and similar syscalls, for the best performances.

To finish up our tour of Rust, I want to mention [Web Assembly](https://webassembly.org/). Rust has some of the best support around for developing Web Assembly, alongside [C++](https://developer.mozilla.org/en-US/docs/WebAssembly/C_to_wasm) and [Go](https://golangbot.com/webassembly-using-go/). I believe WASM to be one of _the_ most promising and interesting technologies around, but this blog post is already way too long, so I will leave that discussion to another time. 😊

# Who is using Rust today

The real question is: who isn't using Rust today?! Here's a quick list of various companies that have talked about their usage:

- [AWS](https://aws.amazon.com/blogs/opensource/why-aws-loves-rust-and-how-wed-like-to-help/) was a founding member of the Rust Foundation, and is using Rust for the fantastic [Firecracker](https://firecracker-microvm.github.io/) (which powers Lambda), and I imagine for many other services;
- [Meta](https://engineering.fb.com/2022/07/27/developer-tools/programming-languages-endorsed-for-server-side-use-at-meta/) is now officially supporting Rust as a backend language, after [using it for years](https://engineering.fb.com/2021/04/29/developer-tools/rust/);
- [Google](https://arstechnica.com/gadgets/2021/04/google-is-now-writing-low-level-android-code-in-rust/) is integrating Rust in Android, and in particular the [DNS-over-HTTP/3](https://security.googleblog.com/2022/07/dns-over-http3-in-android.html) implementation that your phone might be using has been written with it;
- the Linux kernel [has started](https://lwn.net/Articles/908347/) to integrate official support for Rust [since version 6.1](https://lwn.net/SubscriberLink/914458/a6d5816bad1890e4/) - this is huge, since so far it has only supported C and assembler, and various attempts to integrate C++ have [not been particularly successful](https://www.realworldtech.com/forum/?threadid=104196&curpostid=104208);
- [Discord](https://discord.com/blog/why-discord-is-switching-from-go-to-rust) has switched from Go to Rust for various services, to avoid GC spikes;
- [One signal](https://onesignal.com/blog/rust-at-onesignal/) had some good experiences;
- and to finish up, Mark Russinovich, CTO of Azure, wrote [on Twitter](https://twitter.com/markrussinovich/status/1571995117233504257):
> Speaking of languages, it's time to halt starting any new projects in C/C++ and use Rust for those scenarios where a non-GC language is required. For the sake of security and reliability. the industry should declare those languages as deprecated.

# My personal opinion

I believe Rust is a very interesting language. The borrow checker is a truly original idea, and it is worth exploring. In general, I have found that in Rust you can write code using very high-level constructs, mostly thanks to its super strong type system, but when compiled you get efficient binaries that use the highest performance APIs available. You do pay a "compiler tax" for this though - compilation times are [rather slow](https://nnethercote.github.io/perf-book/compile-times.html).

It shines where you need performance and control - wherever one would have considered C++, I would personally go with Rust today. Both languages are complex and intimidating for unexperienced developers, but Rust avoids _by design_ many classes of bugs and problems that C++. Plus, the syntax is _a lot_ more modern and refreshing. Furthermore, the library ecosystem is growing fast - although, on the other hand, things change a bit too often, and in general the libraries' maturity is still quite low. The toolings are also miles ahead, in my opinion.

It is not all fun and games though - Rust has a _very_ high learning curve, and you **really** have to spend time understanding its complex ownership rules to write just about anything. I do not have significant experience with it, but I have the impression that it is not a great language to use when business requirements change often, because the strong type system means that, for any experiment you try, you end up spending quite a bit of time just to make the code compile.

So, would I use it _everywhere_? No. I would use it for libraries and tools where performances matter, for places where WASM would be a good fit, for writing command line or developer utilities, or for infrastructure systems. At the moment, I do not think it would be a great choice for a business-logic heavy microservice - I think languages such as [Kotlin](https://andreabergia.com/blog/2022/11/languages-opinion-part-one-jvm/), Python, or Go would be quite a bit more productive.

Finally, here are a couple more clashing opinions on the topic:

- [The daily edit](https://dailyedit.com/blog/why-rust-is-a-great-choice-for-startups/) has a post "Why Rust is a great choice for startups";
- while [Matt Welsh](https://mdwdotla.medium.com/using-rust-at-a-startup-a-cautionary-tale-42ab823d9454) has a post "Using Rust at a startup: A cautionary tale". 😊

Thanks for reading, and I would be very interested to hear what you have to say about this post! You can reach me on [Twitter](https://twitter.com/andreabergia) (while it is still running...), [LinkedIn](https://www.linkedin.com/in/andreabergia/), or of course by [email](mailto:andreabergia.com).

In the next part of this series, we will talk about JavaScript and TypeScript. 🧑‍💻
