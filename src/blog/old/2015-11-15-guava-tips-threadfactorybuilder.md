---
date: 2015-11-15T11:30:18Z
tags:
- java
- guava
title: 'Guava tips: ThreadFactoryBuilder'
aliases: [/guava-tips-threadfactorybuilder]
---

[Guava](https://github.com/google/guava) contains the simple and very useful class [`ThreadFactoryBuilder`](https://google.github.io/guava/releases/snapshot/api/docs/com/google/common/util/concurrent/ThreadFactoryBuilder.html), which is most commonly used to set the [thread names](https://docs.oracle.com/javase/7/docs/api/java/lang/Thread.html#getName()) when using an [`Executor`](https://docs.oracle.com/javase/7/docs/api/java/util/concurrent/Executor.html). This should _always_ be done: thread names pop up in stack trace, when monitoring a running application with [VisualVM](https://visualvm.java.net/), when printing [deadlocks]({% ref "2015-05-03-java-detecting-deadlocks.markdown" %}) and so on. Doing this with `ThreadFactoryBuilder` is very simple:

```java
Executors.newCachedThreadPool(
    new ThreadFactoryBuilder().setNameFormat("my-name-%d").build());
```

The threads in the pool will be named `my-name-1`, `my-name-2` and so on.

You can also have all the threads created as daemons by using [`setDaemon`](https://google.github.io/guava/releases/snapshot/api/docs/com/google/common/util/concurrent/ThreadFactoryBuilder.html#setDaemon(boolean)). Finally, you can set an [uncaught exception handler](https://docs.oracle.com/javase/7/docs/api/java/lang/Thread.UncaughtExceptionHandler.html?is-external=true) to handle in some way exceptions that the thread hasn't caught, by using simply [`setUncaughtExceptionHandler`](https://google.github.io/guava/releases/snapshot/api/docs/com/google/common/util/concurrent/ThreadFactoryBuilder.html#setUncaughtExceptionHandler(java.lang.Thread.UncaughtExceptionHandler)).

Let me stress it once more: _please_ always set a name for your threads. It will make your life easier, and - with the help of `ThreadFactoryBuilder` - it only takes one line of code.
