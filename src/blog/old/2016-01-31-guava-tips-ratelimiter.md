---
date: 2016-01-31T20:40:20Z
tags:
- java
- guava
title: 'Guava tips: RateLimiter'
aliases: [/guava-tips-ratelimiter]
---

[Guava](https://github.com/google/guava) contains the very powerful [RateLimiter](http://docs.guava-libraries.googlecode.com/git/javadoc/com/google/common/util/concurrent/RateLimiter.html) class: you're not going to need it often, but it's a truly useful and beautiful piece of code. This class helps you limit the rate of acquisition of a resource with respect to time, so that no more than a certain number of permits can be issued in a second. For instance you can use it to limit the number of operations done in a second, or to limit the rate of some I/O.

Imagine you want to limit executions of some tasks to 2 per seconds:

```java
final RateLimiter rateLimiter = RateLimiter.create(2.0);
void submitTasks(Runnable task) {
    rateLimiter.acquire();
    executor.execute(task);
}
```

Before [`acquire`](http://docs.guava-libraries.googlecode.com/git/javadoc/com/google/common/util/concurrent/RateLimiter.html#acquire()) returns, it might wait, if too many tasks have already been submitted in the last second.

Imagine now you want to limit the I/O rate to some output stream to, say, 5kb per second. In this case, we might use "one byte" as the permit size, and do something like:

```java
RateLimiter rateLimiter = RateLimiter.create(5000);
byte[] buffer = new byte[BUFFER_SIZE];
while (true) {
    int len = in.read(buffer);
    if (len <= 0) {
        break;
    }
    rateLimiter.acquire(len); // Acquire enough permits to send "len" bytes
    os.write(buffer, 0, len);
}
```

To summarize: `RateLimiter` is a class that you will rarely use. However, for the times when you do need something like it, you will be glad it has already been written.
