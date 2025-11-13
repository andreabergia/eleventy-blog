---
date: 2015-12-13T16:02:40Z
tags:
- java
- guava
title: 'Guava tips: Charsets'
aliases: [/guava-tips-charsets]
---

[Guava](https://github.com/google/guava) contains the tiny, yet very useful class [`Charsets`](http://docs.guava-libraries.googlecode.com/git/javadoc/com/google/common/base/Charsets.html), which has constants for all the charsets that any JVM implementation _must_ support:

- UTF-8
- UTF-16 in big-endian and little-endian byte orders or with the [BOM (byte order mark)](https://en.wikipedia.org/wiki/Byte_order_mark)
- ASCII
- ISO-8859-1, also known as Latin-1.

These are available as constants such as [`Charsets.UTF_8`](http://docs.guava-libraries.googlecode.com/git/javadoc/com/google/common/base/Charsets.html#UTF_8). This can help you avoid having to write silly code such as:

```java
try {
    myString.getBytes(Charset.forName("UTF-8"));
} catch (UnsupportedCharsetException e) {
    // How can this happen?!
}
```

With `Charsets`, you can simply write:

```java
myString.getBytes(Charsets.UTF_8);
```

## Note about Java >= 7

Note that `Charsets` should be used only when working with Java 6 - which might sounds strange in 2015, but believe me, it's not that uncommon in the enterprise world... Anyway, with Java 7 and above, you can use the built-in class [StandardCharsets](https://docs.oracle.com/javase/7/docs/api/java/nio/charset/StandardCharsets.html), which has exactly the same API and behavior.
