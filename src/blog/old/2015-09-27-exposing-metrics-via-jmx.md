---
date: 2015-09-27T13:45:07Z
tags:
- java
title: Exposing Metrics via JMX
aliases: [/exposing-metrics-via-jmx]
---

In the [last post]({% ref "2015-09-13-metrics.markdown" %}) we have discussed a bit how to use [Dropwizard's metrics](http://metrics.dropwizard.io/3.1.0/), a great library that helps adding metrics to a Java application. In this post, we'll see a very simple example project with a couple of metrics in it, and then we'll expose those via [JMX](https://en.wikipedia.org/wiki/Java_Management_Extensions) and monitor them via [VisualVM](https://visualvm.java.net/).

## The code

The code for this post is available on GitHub at [https://github.com/andreabergia/metrics-jmx](https://github.com/andreabergia/metrics-jmx). Let's see the simple `Main` class:

```java
public class Main {
    public static void main(String[] args) throws InterruptedException {
        MetricRegistry metrics = new MetricRegistry();
        registerMemoryMetrics(metrics);
        initReporters(metrics);
        waitUntilKilled();
    }

    private static void registerMemoryMetrics(MetricRegistry metrics) {
        Gauge<Long> getFreeMemory = () -> toMb(Runtime.getRuntime().freeMemory());
        Gauge<Long> getTotalMemory = () -> toMb(Runtime.getRuntime().totalMemory());
        metrics.register(MetricRegistry.name(Main.class, "memory.free.mb"), getFreeMemory);
        metrics.register(MetricRegistry.name(Main.class, "memory.total.mb"), getTotalMemory);
    }

    private static long toMb(long bytes) {
        return bytes / 1024 / 1024;
    }

    private static void initReporters(MetricRegistry metrics) {
        initConsoleReporter(metrics);
        initJmxReporter(metrics);
    }

    private static void initConsoleReporter(MetricRegistry metrics) {
        final ConsoleReporter reporter = ConsoleReporter.forRegistry(metrics)
                .build();
        reporter.start(1, TimeUnit.SECONDS);
    }

    private static void initJmxReporter(MetricRegistry metrics) {
        final JmxReporter reporter = JmxReporter.forRegistry(metrics).build();
        reporter.start();
    }

    private static void waitUntilKilled() throws InterruptedException {
        List<String> memoryWaste = new ArrayList<>();
        char[] data = new char[1_000_000];
        while (true) {
            memoryWaste.add(String.copyValueOf(data));
            Thread.currentThread().sleep(100);
        }
    }
}
```

We start by creating a [MetricsRegistry](https://dropwizard.github.io/metrics/3.1.0/manual/core/#man-core-registries), which is the container of our metrics. Afterwards, we register a couple of metrics: the currently used memory and the free memory, obtained via the standard [Runtime](https://docs.oracle.com/javase/8/docs/api/java/lang/Runtime.html) class.

Next, we register a couple of reporters: one to the console, which will log the metrics' values to the standard output every second, and one to JMX.

Finally, we start an endless loop to waste some memory, just to see our metric's value change.

When launching the program, the output will be something like:

```

9/27/15 3:37:49 PM ==============================================

-- Gauges -------------------------------------------------------
com.andreabergia.metricsjmx.Main.memory.free.mb
             value = 191
com.andreabergia.metricsjmx.Main.memory.total.mb
             value = 240
```

## Monitoring via JMX

Since we are exposing our metrics' values to JMX, we can use a standard tool such as VisualVM to monitor their value. If we launch it and install the [VisualVM-MBeans](https://visualvm.java.net/mbeans_tab.html) plugin, we can see all the JMX-exposed beans via VisualVM, as the screenshot shows.

![](/images/2015/09/Screenshot-from-2015-09-27-15-40-17.png)

In the "MBeans" tab we can see a "metrics" node; underneath it we'll find an element for each metric we have registered. By double-clicking on the value, VisualVM will start to trace a graph of it:

![](/images/2015/09/Screenshot-from-2015-09-27-15-41-44.png)

While this kind of monitoring is perhaps simple, it can be of invaluable help when examining a running application's performances. The fact that we can simply use standard tools like VisualVM is a great thing: we don't need to install any particular software (except, of course, for the JDK) to monitor our applications.

This is, in my opinion, one of the greatest things about Java - the tooling. The JVM is a _very_ mature platform and has some really _great_ monitoring capabilities built in into it, that helps a lot when creating or managing real applications.
