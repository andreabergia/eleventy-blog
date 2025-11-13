---
date: 2015-11-08T10:50:46Z
tags:
- java
- guava
title: 'Guava tips: Throwables'
aliases: [/guava-tips-throwables]
---

[Guava](https://github.com/google/guava) contains the very useful class [`Throwables`](http://docs.guava-libraries.googlecode.com/git/javadoc/com/google/common/base/Throwables.html), which has the very useful method [`getRootCause`](http://docs.guava-libraries.googlecode.com/git/javadoc/com/google/common/base/Throwables.html#getRootCause(java.lang.Throwable)). Given an exception, this method will return the original cause by following the cause hierarchy until it finds the first exception which has no underlying cause. For example:

```java
try {
  throw new IOException(new IllegalArgumentException(new NumberFormatException("Foo")));
} catch (Exception e) {
  assertTrue(Throwables.getRootCause(e) instanceof NumberFormatException);
}
```

If the given exception has no cause, the exception itself is returned:

```java
try {
  throw new NumberFormatException("Foo");
} catch (Exception e) {
  assertTrue(Throwables.getRootCause(e) instanceof NumberFormatException);
}
```

Another method that can sometimes be useful is [`getStackTraceAsString`](http://docs.guava-libraries.googlecode.com/git/javadoc/com/google/common/base/Throwables.html#getStackTraceAsString(java.lang.Throwable)), which will return all the stack trace of the given `Throwable` as a string, suitable for storing it into a log.

Finally, similarly to `getRootCause`, there's a [`getCausalChain`](http://docs.guava-libraries.googlecode.com/git/javadoc/com/google/common/base/Throwables.html#getCausalChain(java.lang.Throwable)) method which will return the cause hierarchy as a `List<Throwable>`.
