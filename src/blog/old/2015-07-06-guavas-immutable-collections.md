---
date: 2015-07-06T20:11:14Z
tags:
- java
- guava
title: Guava's immutable collections
aliases: [/guavas-immutable-collections]
---

[Guava](https://code.google.com/p/guava-libraries/) is one of the most well-known Java libraries. It includes various interesting things, such as [preconditions](https://code.google.com/p/guava-libraries/wiki/PreconditionsExplained), [caches](https://code.google.com/p/guava-libraries/wiki/CachesExplained), [bloom filters](https://code.google.com/p/guava-libraries/wiki/HashingExplained) and various [collections](https://code.google.com/p/guava-libraries/wiki/NewCollectionTypesExplained).

Today, we're going to discuss the [_immutable collections_](https://code.google.com/p/guava-libraries/wiki/ImmutableCollectionsExplained) found in Guava.

## Motivation

Immutable objects are generally really good things to have in a program: being immutable means that they are automatically thread-safe (since no one can modify them, you don't need locks!). Furthermore, since they cannot be change, they can be used as constants.

But, you might say, we already have the JDK! You can write things like:

```java
List<String> letters = Collections.unmodifiableList(
                           Arrays.asList("a", "b", "c"));
```

It's true, this works, although it's a bit a mouthful to write. However, let's assume you do this:

```java
public class MyClass {
    private final List<String> letters;

    public MyClass(List<String> letters) {
        this.letters = letters;
    }

    public List<String> getLetters() {
        return Collections.unmodifableList(letters);
    }
}
```

This code has two issues: the first is that, whenever you are calling the getter, you are creating a new object. That can be fixed quite simply though:

```java
public class MyClass {
    private final List<String> letters;

    public MyClass(List<String> letters) {
        this.letters = Collections.unmodifableList(letters);
    }

    public List<String> getLetters() {
        return letters;
    }
}
```

The second problem is more sublter and much more serious. The objects returned by the various `Collections.unmodifiableXXX` methods are wrappers around the underlying collection. This means that, if the original collection changes, the supposedly _unmodifable_ objects get modified!

Guava's solution is to actually perform a _copy_ of the input collection. Furthermore, Guava provides various constructors and factory methods to help you write more readable code, such as:

```java
List<String> letters = ImmutableList.of("a", "b", "c");
List<String> letters = ImmutableList.copyOf(myStringList);
```

## Variants

Guava's immutable collections includes quite a few variants: one for each JDK collection class, and one for each Guava collection. The most commonly used are:

- [ImmutableCollection](http://docs.guava-libraries.googlecode.com/git-history/release/javadoc/com/google/common/collect/ImmutableCollection.html)
- [ImmutableList](http://docs.guava-libraries.googlecode.com/git-history/release/javadoc/com/google/common/collect/ImmutableList.html)
- [ImmutableSet](http://docs.guava-libraries.googlecode.com/git-history/release/javadoc/com/google/common/collect/ImmutableSet.html)
- [ImmutableMap](http://docs.guava-libraries.googlecode.com/git-history/release/javadoc/com/google/common/collect/ImmutableMap.html)
- [ImmutableMultiset](http://docs.guava-libraries.googlecode.com/git-history/release/javadoc/com/google/common/collect/ImmutableMultiset.html)
- [ImmutableMultimap](http://docs.guava-libraries.googlecode.com/git-history/release/javadoc/com/google/common/collect/ImmutableMultimap.html)
- [ImmutableBiMap](http://docs.guava-libraries.googlecode.com/git-history/release/javadoc/com/google/common/collect/ImmutableBiMap.html)

## Other details

Guava'simmutable collections do _not_ allow null elements (and, for maps, null values nor null keys). While this prevents a few use cases, in general it's quite useful to know that you _cannot_ have null elements in a collection.

They also preserve insertion order: an `ImmutableSet` can be iterated upon in the insertion order.

Finally, most collections have an useful `asList` method, which creates a _view_ of the data as a list, without doing any copy. This is mostly useful when working with `ImmutableSet`.

## Builders

A really nice feature of Guava's immutable collection is that they provide a `Builder` to help construct them. An example:

```java
ImmutableMap<String, String> languageExtension = ImmutableMap.<String, String>builder()
        .put("C++", ".cpp")
        .put("Java", ".java")
        .put("Python", ".py")
        .build();
```

Similar builders are provided `ImmutableList`, `ImmutableSet` and all other collections.

## Returning immutable collections

The general approach in Java is to declare fields, return methods or variables as raw interfaces, meaning you should declare your method to return a `List<String>` rather than an `ArrayList<String>`. However, there's a case to be made for returning an `ImmutableList<String>` rather than just a `List<String>`: since `ImmutableList` extends `List`, client code isn't forced to "think in Guava". On the other hand, returning an `ImmutableList` makes it very clear to the client that the result _cannot_ be modified.

In short, it can help keeping the code clear and express your intentions clearly.

## Conclusions

Guava's [immutable collections](https://code.google.com/p/guava-libraries/wiki/ImmutableCollectionsExplained) are a really useful part of an amazing library. Go and use them!
