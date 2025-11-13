---
date: 2015-05-27T20:09:22Z
tags:
- java
- guava
title: Optional in Java
aliases: [/optional-in-java]
---

`Optional<T>` is a new class introduced in [Java 8](https://docs.oracle.com/javase/8/docs/api/java/util/Optional.html). However, a very similar class has been available in [Guava](https://code.google.com/p/guava-libraries/wiki/UsingAndAvoidingNullExplained) for quite some time.

`Optional` is a generic class which should be used to represent the concept that a value might be missing. Very often methods that might return a valid object only under some conditions end up returning `null` in case no valid object could be built. For instance, `Map::get` returns `null` in case the key could not be found in the map. This tends to lead to errors such as `NullPointerException`; also, quite often, when you end up with a `null` reference it's hard to track down where it came from.

### What's Optional good for?

An `Optional` is designed to avoid `NullPointerException`: calling a method that returns some kind of object can always hide the fact that the method returns `null`. However, if the method returns `Optional`, the caller _cannot_ ignore this fact and _has_ to perform some explicit check to detect the case where the `Optional` is not available. This is good also from an API design point of view: the return value of the object already describes the fact that the result might not be present. So, `Optional` makes both the intent of the author clearer and helps avoid bugs. A win-win!

### How can you create an Optional?

Let's first take a look at how `Optional` is created. For Java 8's version, we can create it using one of these three methods:

```java
Optional.of(what);              // Requires that what is not null
Optional.empty();               // Means a missing optional
Optional.ofNullable(what);      // what can be null or not null
```

For Guava's version, we can use:

```java
Optional.of(what);              // Requires that what is not null
Optional.absent();              // Means a missing optional
Optional.fromNullable(what);    // what can be null or not null
```

Generally we'd want to use `of` or `empty`/`absent`; however sometimes it's useful to use `ofNullable`/`fromNullable` to wrap a non-optional-aware method such as `Map::get`.

### How is an Optional used?

You can use an `Optional` like this:

```java
Optional<String> myOptional = getAStringMaybe();
if (myOptional.isPresent()) {
    doSomethingWith(myOptional.get());
} else {
    handleCaseMyOptionalIsNull();
}
```

With Java 8, you can also do things such as:

```java
Optional<T> myOptional = getMyOptional();
myOptional.ifPresent(t -> doSometingWith(t));
Optional<V> otherOptional = myOptional.map(t -> convertToV(t));
```

Note that calling `get` with a missing optional raises a `NoSuchElementException` for Java 8's version, and `IllegalStateException` for Guava.

Both API have methods `orElse`/`or` to return a "default value" in case the optional is absent.
