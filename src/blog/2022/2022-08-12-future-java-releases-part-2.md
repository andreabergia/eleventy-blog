---
date: 2022-08-11T12:47:28Z
tags:
  - java
title: Future Java releases - part two
series: ["Future Java Releases"]
---

{% postSeries %}

In this second post in the [future of Java series](/series/future-java-releases), we will focus on a new feature of the JVM designed to improve performance.

# Project Loom - Virtual Threads

[Project Loom](https://wiki.openjdk.org/display/loom/Main) aims to deliver new and improved APIs and JVM enhancements for concurrency.

Concurrency has famously been a hot topic for ages, since Moore's law started to slow down a few years ago and chip makers started creating CPUs with multiple cores. Nowadays, even a [99€ tablet](https://www.amazon.it/nuovo-tablet-fire-hd-8-schermo-hd-da-8-nero-32-gb-con-offerte-speciali/dp/B07WGJLSS2/ref=lp_11138592031_1_3) sports 4 cores, so concurrent code really is everywhere.

In Java, the main abstraction has always been the `Thread` class. Since Java 5, though, you seldom want to create and manage threads manually - generally, you will use [`Executor`](https://docs.oracle.com/javase/7/docs/api/java/util/concurrent/Executor.html) abstraction to create thread pools. Java threads map to the operating system's threads - meaning that you generally do not want to create thousands of threads, since every OS thread has its own stack and structures in the kernel.

Before discussing the new features coming in Java, let's compare a bit the roads taken by other programming languages in the past decade.

## Comparison with other languages

### async/await

A pretty common approach implemented is the [`async/await` pattern](https://en.wikipedia.org/wiki/Async/await).

I believe C# was the first mainstream language to create _keywords_ for concurrent programming - it introduced the [`async/await` keywords](https://docs.microsoft.com/en-us/dotnet/csharp/programming-guide/concepts/async/), which are a great and relatively simple abstraction for many use cases. Many languages followed suit, and implemented their own version of this pattern: for example [Javascript](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function), [Python](https://docs.python.org/3/library/asyncio.html), and [Rust](https://rust-lang.github.io/async-book/).

The idea is that your `async` functions return a future (also known as a promise, or task, depending on the language), which you can then access to retrieve the result. However, the key part is that the keywords let your code read as it if was sequential, and all the future composition is handled by the language compiler or interpreter. For example:

```c#
static async Task Main(string[] args)
{
    Coffee cup = PourCoffee();
    Console.WriteLine("coffee is ready");

    Egg eggs = await FryEggsAsync(2);
    Console.WriteLine("eggs are ready");

    Bacon bacon = await FryBaconAsync(3);
    Console.WriteLine("bacon is ready");

    Toast toast = await ToastBreadAsync(2);
    ApplyButter(toast);
    ApplyJam(toast);
    Console.WriteLine("toast is ready");

    Juice oj = PourOJ();
    Console.WriteLine("oj is ready");
    Console.WriteLine("Breakfast is ready!");
}
```

The various `await` are calls to functions that are executed concurrently; only when their result is used there is a lock. This pattern is a good way to write pretty clean code, since it "reads as if it were sequential", and is often combined with asynchronous I/O to achieve great performances. However, it also leads to the well-known problem of ["function colors"](https://journal.stuffwithstuff.com/2015/02/01/what-color-is-your-function/) - meaning that you end up with _blocking_ functions and _non blocking_ functions. If you invoke a blocking function from a non-blocking one, you lose the benefits of concurrency and might lock your program. But I digress, we should talk about Java. 🙂

### Go - green threads

[Go](https://go.dev/) has followed a decidedly different approach. One of its most famous features is the support of [goroutines](https://golangbot.com/goroutines/), which are an implementation of a pattern known as [green thread, or fibers](https://en.wikipedia.org/wiki/Green_thread). The idea is to implement concurrency in userspace, handling a large number of "virtual threads" on a limited number of operating system threads. The context switching happens whenever one of the virtual threads blocks on I/O. The green thread is then suspended, a second one is scheduled on the "real" carrier thread, and the first one is resumed after the I/O operation completes.

In Go, you simply use the `go` keyword to launch a function as a goroutine, which will then be executed asynchronously. The other main abstraction is [channels](https://gobyexample.com/channels), which allow for simple communication between goroutines. It's rather common to run thousand of goroutines in a given program while using only a few OS threads.

```go
func main() {

    go hello("Martin")
    go hello("Lucia")
    go hello("Michal")
    go hello("Jozef")
    go hello("Peter")

    fmt.Scanln()
}

func hello(name string) {

    fmt.Printf("Hello %s!\n", name)
}
```

# Java - JEP 425

The main project under the Loom umbrella is [JEP 425](https://openjdk.org/jeps/425), which aims to implement _virtual threads_, thus following an approach similar to Go. The main API modified will be the `Thread` and the `Executor`. Here's some example code from the JEP:

```java
try (var executor = Executors.newVirtualThreadPerTaskExecutor()) {
    IntStream.range(0, 10_000).forEach(i -> {
        executor.submit(() -> {
            Thread.sleep(Duration.ofSeconds(1));
            return i;
        });
    });
}  // executor.close() is called implicitly, and waits
```

The executor will create one instance of a virtual thread for each task scheduled, rather than queueing the `Runnable/Callable` and waiting for a free OS thread. For workloads that are not CPU-bound, for example, when performing multiple HTTP requests to various other services, this new API will allow greater concurrency - the carrying OS threads will be able to execute other virtual threads while the I/O calls are being executed. One of my favorite things about this approach is that most applicative code does not need change - if you are already using executors, just change how you build them and you will get the benefits for free!

The first implementation will be available in preview in [Java 19](https://jdk.java.net/19/release-notes), which is scheduled for September 2022, so we are almost there! The implementation will modify not only the threads' and executors' API, but also the networking and I/O implementations to allow for switching virtual threads when blocked.

Project Loom also aims to support [continuations](https://en.wikipedia.org/wiki/Continuation), which many languages such as [C++](https://en.cppreference.com/w/cpp/language/coroutines) or [Python](https://docs.python.org/3/library/asyncio-task.html) have had for a while, but they are not coming in Java 19.

For further reading:

- I highly recommend starting with the [JEP](https://openjdk.org/jeps/425) itself - it is very clearly written and easy to understand;
- the [original proposal summary](https://cr.openjdk.java.net/~rpressler/loom/Loom-Proposal.html) is a bit outdated, but gives a lot of background about this feature;
- and, as usual, [Baeldung](https://www.baeldung.com/openjdk-project-loom) has a good summary.

# Coming up

In the next part, we will discuss more performance improvements that are coming in [Project Valhalla](https://openjdk.org/projects/valhalla/). Stay tuned, and thanks for reading!
