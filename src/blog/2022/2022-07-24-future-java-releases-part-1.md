---
date: 2022-07-24T15:57:28Z
tags:
  - java
title: Future Java releases - part one
aliases: [/2022/07/future-java-releases-part-1]
series: ["Future Java Releases"]
---

{% postSeries %}

Java's evolution has sped up in the past few years, ever since the release cadence moved to a two-release-per-year model. Of course, most intermediate releases are little more than preview versions, since they are not [Long Term Supported](https://www.oracle.com/java/technologies/java-se-support-roadmap.html), so most people end up using either Java 8, 11, or 17.

There are a lot of articles around detailing the new features in [Java 11](https://www.baeldung.com/java-11-new-features) or [Java 17](https://www.baeldung.com/java-17-new-features), so I am not going to rehearse them. However, I wanna write a few articles about some extremely interesting features that will be included in future releases. Some of these will have a _huge_ impact on the performances of the JVM!

So, let us start with the first article of this [mini-series](/series/future-java-releases).

# Language enhancement

## Pattern matching for switch

Java is taking a note from [Kotlin](https://kotlinlang.org/) and other modern languages, and it is enhancing the `switch` syntax - which was already made a lot better in [Java 14](https://openjdk.org/jeps/361). The new feature, [JEP 406](https://openjdk.org/jeps/406), falls under the umbrella of [project Amber](https://openjdk.org/projects/amber/), a collection of JEP to enhance the syntax of the Java language, and will allow things like:

- a `null` case in `switch` statements;
- an enhanced matching possibility of `case`, which includes multiple conditions and builds on the [`instanceof` pattern-matching feature](https://openjdk.org/jeps/394) to remove casts.

Here is some sample code that this feature will enable:

```java
static void testFooBar(String s) {
    switch (s) {
        case null         -> System.out.println("Oops");
        case "Foo", "Bar" -> System.out.println("Great");
        default           -> System.out.println("Ok");
    }
}

static void testStringOrNull(Object o) {
    switch (o) {
        case null, String s -> System.out.println("String: " + s);
    }
}
```

```java
class Shape {}
class Rectangle extends Shape {}
class Triangle  extends Shape { int calculateArea() { ... } }

static void testTriangle(Shape s) {
    switch (s) {
        case Triangle t && (t.calculateArea() > 100) ->
            System.out.println("Large triangle");
        case Triangle t ->
            System.out.println("Small triangle");
        default ->
            System.out.println("Non-triangle");
    }
}
```

Not earth-shattering and not as good as [Kotlin's `when`](https://kotlinlang.org/docs/control-flow.html#when-expression), but a nice improvement. In particular, being able to match `null` is my favorite part of the feature!

## Pattern matching enhancement for records

[JEP 405](https://openjdk.org/jeps/405) will improve on the pattern matching expression to allow more complex matching. An example from the official JEP is:

```java
record Point(int x, int y) {}

void printSum(Object o) {
    if (o instanceof Point(int x, int y)) {
        System.out.println(x+y);
    }
}
```

This does not look like the most common piece of Java code to write, honestly (although it is a very common pattern in Rust). It might be more useful when combined with the above feature, but I doubt it is going to be widely used.

# Project Panama

[Project Panama](https://openjdk.org/projects/panama/) is a series of enhancements to the JVM and the standard library to simplify interactions between Java and other programming languages, with the aim to replace JNI. Its objectives are:

- to create a better, more modern API;
- to improve performances and safety;
- and to simplify interactions with languages different from C.

## Foreign functions and memory API

In particular, [JEP 412](https://openjdk.org/jeps/412) plans to create a new API to allocate and access memory, and to invoke non-Java functions. The JEP is very detailed and interesting; however, as the topic is really not trivial, I recommend you take a look at it.

## Vectorization

[JEP 414](https://openjdk.org/jeps/414) is adding new API to Java, to support [SIMD instructions](https://en.wikipedia.org/wiki/Single_instruction,_multiple_data) in CPU. The basic idea is that your CPU have a lot of hardware instructions that can operate on multiple data, and that are _much_ faster than doing a simple `for` on each element of a numeric array.

Note that the JVM already includes auto-vectorization algorithms, meaning that, when the code is simple enough to be recognized, it will automatically be transformed to use SIMD instructions at runtime. However, the scope of this JEP is to create new Java API, to allow writing of _explicit_ vector code. These will not be general-purpose API; however, if you are doing numerical computations, these new instructions might give you a _huge_ performance improvement.

# Coming up

In a future post, we will talk about [project Loom](https://wiki.openjdk.org/display/loom/Main) and [project Valhalla](https://openjdk.org/projects/valhalla/), which will _greatly_ enhance the JVM power and performance. Stay tuned!
