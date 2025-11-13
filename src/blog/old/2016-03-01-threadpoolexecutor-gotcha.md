---
date: 2016-03-01T19:33:05Z
tags:
- java
title: ThreadPoolExecutor gotcha
aliases: [/threadpoolexecutor-gotcha]
---

I've recently discovered a "gotcha!" in the really useful standard Java class [`ThreadPoolExecutor`](https://docs.oracle.com/javase/8/docs/api/java/util/concurrent/ThreadPoolExecutor.html). I think that this deserves a post, since it's quite interesting and non obvious.

### Executors

[`Executor`](https://docs.oracle.com/javase/8/docs/api/java/util/concurrent/Executor.html) and [`ExecutorService`](https://docs.oracle.com/javase/8/docs/api/java/util/concurrent/ExecutorService.html) are really useful objects for designing multi-threaded applications in Java, and they have been introduced - alongside a lot of excellent other classes - in Java 5, as part of the [`java.util.concurrent`](https://docs.oracle.com/javase/8/docs/api/java/util/concurrent/package-summary.html) package. If you don't know about them, you should really read the excellent book [Java concurrency in practice](http://www.amazon.com/Java-Concurrency-Practice-Brian-Goetz/dp/0321349601) by Brian Goetz - it's a great book about that package, and also for concurrent programming in general.

The most common way to get an instance of `Executor` is to use [`Executors.newFixedThreadPool`](https://docs.oracle.com/javase/8/docs/api/java/util/concurrent/Executors.html#newFixedThreadPool-int-) or [`Executors.newCachedThreadPool`](https://docs.oracle.com/javase/8/docs/api/java/util/concurrent/Executors.html#newCachedThreadPool--), who return respectively an executor which always uses the given number of threads, or one executor which creates threads on demand (using a cache) and expires them after one minute of idling.

### ThreadPoolExecutor

However, sometimes you might want to have more control: for instance you might want to limit the queue size, or to have the threads expire after a different idle timeout, or to use a thread pool that has some minimum and maximum size: for instance, you might want to use anywhere between 0 and 10 threads. In cases like this, you aren't able to use `newFixedThreadPool`, since that would always allocate 10 threads; you can't use `newCachedThreadPool` either, since there is no upper bound.

In cases like these, you can create an instance of [`ThreadPoolExecutor`](https://docs.oracle.com/javase/8/docs/api/java/util/concurrent/ThreadPoolExecutor.html) explicitly, using something like:

```java
ExecutorService myExecutor = new ThreadPoolExecutor(
    0, 10,
    30, TimeUnit.SECONDS,
    new LinkedBlockingQueue<Runnable>());
```

As I have recently discovered, this _doesn't do what you expect_. Reading quickly the javadoc, you'd guess that this would create a new thread pool with anywhere between 0 and 10 threads, which expires them after 30 seconds of idle time, and with an unbounded [`LinkedBlockingQueue`](https://docs.oracle.com/javase/8/docs/api/java/util/concurrent/LinkedBlockingQueue.html) of tasks to execute. However, if you read the javadoc more carefully, you will find out that new threads are created only when _the queue is full_; since we are using an unbounded queue, this will never happen. Therefore, the thread pool will always use only one thread!

A possible "fix" is the following:

```java
ThreadPoolExecutor myExecutor = new ThreadPoolExecutor(
    10, 10,
    30, TimeUnit.SECONDS,
    new LinkedBlockingQueue<Runnable>());
myExecutor.allowCoreThreadTimeOut(true);
```

In this way, we create a thread pool which has 10 *core* threads, but we allow them to expire explicitly. Therefore, what happens is that the executor goes from 0 to 10 threads, as required, creating new threads when all the existing ones are busy and expiring them when idle.
