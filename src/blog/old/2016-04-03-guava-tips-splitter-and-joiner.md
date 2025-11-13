---
date: 2016-04-03T15:25:26Z
tags:
- java
- guava
title: 'Guava Tips: Splitter and Joiner'
aliases: [/guava-tips-splitter-and-joiner]
---

Splitting strings, or building them from collections of objects, is a common task in any program. As usual, [Guava](https://github.com/google/guava) has you covered with its two classes [Splitter](http://docs.guava-libraries.googlecode.com/git/javadoc/com/google/common/base/Splitter.html) and [Joiner](http://docs.guava-libraries.googlecode.com/git/javadoc/com/google/common/base/Joiner.html).

### Splitter

The `Splitter` class can split a String according to

- a character;
- a fixed string;
- a regular expression;
- a [CharMatcher](http://docs.guava-libraries.googlecode.com/git/javadoc/com/google/common/base/CharMatcher.html)

or even in pieces of the same fixed length. Creating a `Splitter` is quite simple:

```java
Splitter onSpace = Splitter.on(' ');
Iterable<String> parts = onSpace.split("a bc def");

Splitter otherSplitter = Splitter.on(Patter.compile("\\s+))
                                 .trimResults()
                                 .omitEmptyStrings();
```

Splitters are immutable and thread-safe, which means that they can safely be stored in a `static final` variable. The default behavior is to return an `Iterable<String>`; however a method [`splitToList`](http://docs.guava-libraries.googlecode.com/git/javadoc/com/google/common/base/Splitter.html#splitToList(java.lang.CharSequence)) is provided if you want to build a `List<String>`.

### Joiner

`Joiner` does the opposite of `Splitter`: it creates a String by joining objects, using their `toString` method. For instance:

```java
String s = Joiner.on(", ").join("a", "b", "c");
assertEquals("a, b, c", s);
```

`Joiner` provides a lot of useful variants its two main methods:

- `join` can take an `Iterable`, an array, or an `Iterator`;
- [`appendTo`](http://docs.guava-libraries.googlecode.com/git/javadoc/com/google/common/base/Joiner.html) can be used to add the generated String to a `StringBuilder`, a `Writer` or other `Appendable`; again, it can take `Iterable`, `Iterator` or arrays.

Finally, there's a way (calling [`skipNulls`](http://docs.guava-libraries.googlecode.com/git/javadoc/com/google/common/base/Joiner.html#skipNulls())) to create a `Joiner` which will skip null objects in its arguments, and another (using [`useForNull`](http://docs.guava-libraries.googlecode.com/git/javadoc/com/google/common/base/Joiner.html#useForNull(java.lang.String))) to replace them with a default string.

Similarly to `Splitter`, `Joiner` instances are thread-safe and immutable.
