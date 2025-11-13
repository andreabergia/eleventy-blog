---
date: 2015-12-20T15:29:10Z
tags:
- java
- guava
title: 'Guava tips: Strings'
aliases: [/guava-tips-strings]
---

[Guava](https://github.com/google/guava) contains the simple, yet very useful class [`Strings`](http://docs.guava-libraries.googlecode.com/git/javadoc/com/google/common/base/Strings.html), with some useful methods to help you work with strings. Notable among them are:

- [`nullToEmpty`](http://docs.guava-libraries.googlecode.com/git/javadoc/com/google/common/base/Strings.html#nullToEmpty(java.lang.String)): given a String, returns it if it's not `null` and the empty string `""` otherwise. Useful to sanitize inputs when you don't know whether the caller will use empty strings or null.
- [`isNullOrEmpty`](http://docs.guava-libraries.googlecode.com/git/javadoc/com/google/common/base/Strings.html#isNullOrEmpty(java.lang.String)): given a String, returns true if it is `null` or the empty string `""`.

Some other useful methods are:

- [`padStart`](http://docs.guava-libraries.googlecode.com/git/javadoc/com/google/common/base/Strings.html#padStart(java.lang.String,%20int,%20char)) and [`padEnd`](http://docs.guava-libraries.googlecode.com/git/javadoc/com/google/common/base/Strings.html#padEnd(java.lang.String,%20int,%20char)), which can be used to ensure that a given string has a minimum length by adding characters to them.
- [`commonPrefix`](http://docs.guava-libraries.googlecode.com/git/javadoc/com/google/common/base/Strings.html#commonPrefix(java.lang.CharSequence,%20java.lang.CharSequence)) and [`commonSuffix`](http://docs.guava-libraries.googlecode.com/git/javadoc/com/google/common/base/Strings.html#commonSuffix(java.lang.CharSequence,%20java.lang.CharSequence)), which return the longest common prefix or suffix of two strings.
- [`repeat`](http://docs.guava-libraries.googlecode.com/git/javadoc/com/google/common/base/Strings.html#repeat(java.lang.String,%20int)), which simply returns n copies of the given string.

Here are some (pretty trivial) examples:

```java
assertEquals("abc", Strings.nullToEmpty("abc"));
assertEquals("", Strings.nullToEmpty(""));
assertEquals("", Strings.nullToEmpty(null));

assertFalse(Strings.isNullOrEmpty("abc"));
assertTrue(Strings.isNullOrEmpty(""));
assertTrue(Strings.isNullOrEmpty(null));

assertEquals("0014", Strings.padStart("14", 4, '0'));
assertEquals("15", Strings.padStart("15", 2, '0'));
assertEquals("AB ", Strings.padEnd("AB", 3, ' '));

assertEquals("AB", Strings.commonPrefix("ABC", "ABDEF"));
assertEquals("", Strings.commonPrefix("ABC", "DEF"));
assertEquals("DE", Strings.commonSuffix("ABCDE", "XDE"));

assertEquals("ababab", Strings.repeat("ab", 3));
assertEquals("ab", Strings.repeat("ab", 1));
assertEquals("", Strings.repeat("ab", 0));
```
