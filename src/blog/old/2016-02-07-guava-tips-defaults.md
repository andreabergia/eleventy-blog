---
date: 2016-02-07T19:23:01Z
tags:
- java
- guava
title: 'Guava tips: Defaults and HttpHeaders'
aliases: [/guava-tips-defaults]
---

We'll cover two tiny [Guava](https://github.com/google/guava) classes today, which I'm sure will provoke a "ehm... nice to know, I guess?" from you! :-)

## Defaults

The simple [`Defaults`](http://docs.guava-libraries.googlecode.com/git/javadoc/com/google/common/base/Defaults.html) class has only one method: [`defaultValue`](http://docs.guava-libraries.googlecode.com/git/javadoc/com/google/common/base/Defaults.html#defaultValue(java.lang.Class)), which returns the "default value" given a `Class`:

- for the primitives numeric data types (`char`, `short`, `int`, `long`, `float`, `double`) it will return `0`;
- for `boolean` it will return `false`;
- for `byte` it will return `(byte)0`;
- and for objects it will return `null`.

For example:

```java
assertEquals(Long.valueOf(0L), Defaults.defaultValue(long.class));
assertEquals(false, Defaults.defaultValue(boolean.class));
assertEquals(null, Defaults.defaultValue(String.class));
```

## HttpHeaders

The tiny class [`HttpHeaders`](http://docs.guava-libraries.googlecode.com/git/javadoc/com/google/common/net/HttpHeaders.html) simply contains one constant for each of the standard HTTP headers. Nothing more, nothing less. It's better than rolling the constant in your code, I suppose.
