---
date: 2015-05-03T09:06:01Z
tags:
- java
title: Detecting deadlocks programmatically in Java
aliases: [/java-detecting-deadlocks]
---

It's possible to detect [deadlocks](https://en.wikipedia.org/wiki/Deadlock) *programmatically* in Java. This can be done via the class [`ThreadMXBean`](https://docs.oracle.com/javase/8/docs/api/java/lang/management/ThreadMXBean.html), by using its method `findDeadlockedThreads`:

```java
    ThreadMXBean bean = ManagementFactory.getThreadMXBean();
    long[] threadIds = bean.findDeadlockedThreads(); // Returns null if no threads are deadlocked
```

At this point we can iterate on the `threadIds` and print some information about each deadalocked thread:

```java
    if (threadIds != null) {
        logger.error("Threads in deadlocks: {}", Arrays.toString(threadIds));

        ThreadInfo[] info = bean.getThreadInfo(threadIds);
        for (ThreadInfo threadInfo : info) {
            logger.error("Thread {} is waiting on lock {} taken by thread {}",
                    threadInfo.getThreadName(), threadInfo.getLockInfo(), threadInfo.getLockOwnerName());
        }
    }
```

And voilà: we can log some basic information about the deadlock. Notice that some application servers - such as WebLogic - do this automatically, but it's nice to know *how* they do it. :-)

### Complete example

Here's a complete example. You can also check out the very simple code from [GitHub](https://github.com/andreabergia/Java-Deadlocks-Detection-Sample):

```java
public class Deadlocks {
    private static Logger logger = LoggerFactory.getLogger(Deadlocks.class);

    public static void main(String[] args) {
        final Object lock1 = new Object();
        final Object lock2 = new Object();

        // First thread: acquires lock1 then lock2
        new Thread(() -> {
            while (true) {
                synchronized (lock1) {
                    synchronized (lock2) {
                        logger.info("Thread 1 got both locks");
                    }
                }
            }
        }, "first-thread").start();

        // Second thread: acquires lock2 then lock1
        new Thread(() -> {
            while (true) {
                synchronized (lock2) {
                    synchronized (lock1) {
                        logger.info("Thread 2 got both locks");
                    }
                }
            }
        }, "second-thread").start();

        // Third thread: monitors for deadlocks
        new Thread(Deadlocks::monitorDeadlocks, "monitor-deadlocks").start();
    }

    public static void monitorDeadlocks() {
        while (true) {
            ThreadMXBean bean = ManagementFactory.getThreadMXBean();
            long[] threadIds = bean.findDeadlockedThreads(); // Returns null if no threads are deadlocked
            if (threadIds != null) {
                logDeadlockAndQuit(bean, threadIds);
            }
            waitUninterruptedlyForMs(500);
        }
    }

    private static void logDeadlockAndQuit(ThreadMXBean bean, long[] threadIds) {
        logger.error("Threads in deadlocks: {}", Arrays.toString(threadIds));

        ThreadInfo[] info = bean.getThreadInfo(threadIds);
        for (ThreadInfo threadInfo : info) {
            logger.error("Thread \"{}\" is waiting on lock \"{}\" taken by thread \"{}\"",
                    threadInfo.getThreadName(), threadInfo.getLockInfo(), threadInfo.getLockOwnerName());

            // Attempt to log the stack trace, when available
            for (StackTraceElement stackTraceElement : threadInfo.getStackTrace()) {
                logger.error("{}::{} @ {}:{}",
                        stackTraceElement.getClassName(), stackTraceElement.getMethodName(),
                        stackTraceElement.getFileName(), stackTraceElement.getLineNumber());
            }
        }

        System.exit(0);
    }

    private static void waitUninterruptedlyForMs(int ms) {
        try {
            Thread.sleep(ms);
        } catch (InterruptedException e) {
            // Ignore it
        }
    }
}
```

The program is quite simple: we create two threads that run forever, synchronizing on two objects in different orders, the "classical" deadlock example. We also create a third "monitor" thread that simply checks whether there has been a deadlock. In this case, it logs some information abbout the locked threads and quits (as this is a silly example).

Here's the output of a sample run:

```
[first-thread] INFO com.andreabergia.Deadlocks - Thread 1 got both locks]
[...]
[first-thread] INFO com.andreabergia.Deadlocks - Thread 1 got both locks
[monitor-deadlocks] ERROR com.andreabergia.Deadlocks - Threads in deadlocks: [14, 13]
[monitor-deadlocks] ERROR com.andreabergia.Deadlocks - Thread "second-thread" is waiting on lock "java.lang.Object@721e2a3d" taken by thread "first-thread"
[monitor-deadlocks] ERROR com.andreabergia.Deadlocks - Thread "first-thread" is waiting on lock "java.lang.Object@2efe7708" taken by thread "second-thread"
```

And we can see that the deadlocks has been detected and logged.
