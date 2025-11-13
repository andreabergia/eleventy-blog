---
date: 2016-05-16T18:54:12Z
tags:
- java
- guava
title: 'Guava Tips: Primitives'
aliases: [/guava-tips-primitives]
---

[Guava](https://github.com/google/guava) contains a lot of useful methods and classes to work with primitives and do math with them; in this post we'll briefly discuss some of them.

## Primitive arrays

To help you work with primitives arrays, Guava includes quite a few classes: [Longs](https://google.github.io/guava/releases/snapshot/api/docs/com/google/common/primitives/Longs.html), [Ints](https://google.github.io/guava/releases/snapshot/api/docs/com/google/common/primitives/Ints.html), [Floats](https://google.github.io/guava/releases/snapshot/api/docs/com/google/common/primitives/Floats.html), [Doubles](https://google.github.io/guava/releases/snapshot/api/docs/com/google/common/primitives/Doubles.html), [Booleans](https://google.github.io/guava/releases/snapshot/api/docs/com/google/common/primitives/Booleans.html), and others.

Most of these classes contain variants of the following methods, which work on primitive types and thus avoid any [autoboxing](https://docs.oracle.com/javase/tutorial/java/data/autoboxing.html) issues:

- [`List<Long> asList(longs... backingArray)`](https://google.github.io/guava/releases/snapshot/api/docs/com/google/common/primitives/Longs.html#asList(long...)), which returns a new `List` backed by the given array, thus avoiding the boxing of the primitives until some methods which require it are called on the given `List`;
- [`hashcode(long a)`](https://google.github.io/guava/releases/snapshot/api/docs/com/google/common/primitives/Longs.html#hashCode(long)), which returns a suitable hash code for the given primitive. Fun fact: the hash code implemented for `int x` is... `x`. If you think about it, this is the best hash function you can invent: it's uniformly distributed and injective!
- [`max(long... array)`](https://google.github.io/guava/releases/snapshot/api/docs/com/google/common/primitives/Longs.html#max(long...)) and [`min(long... array)`](https://google.github.io/guava/releases/snapshot/api/docs/com/google/common/primitives/Longs.html#min(long...));
- [`tryParse(String string)`](https://google.github.io/guava/releases/snapshot/api/docs/com/google/common/primitives/Longs.html#tryParse(java.lang.String)), which is similar to the standard JDK method `parseLong`, but rather than returning an exception it will return `null`, which makes it nicer to use in some cases;
- various methods to work with arrays, such as [`concat(long[]... arrays)`](https://google.github.io/guava/releases/snapshot/api/docs/com/google/common/primitives/Longs.html#concat(long[]...)), [`contains(long[] array, long target)`](https://google.github.io/guava/releases/snapshot/api/docs/com/google/common/primitives/Longs.html#contains(long[],%20long)), [`indexOf(long[] array, long target)`](https://google.github.io/guava/releases/snapshot/api/docs/com/google/common/primitives/Longs.html#indexOf(long[],%20long)), all of which do what you would expect them to.

### Unsigned support

Java [does not support](https://stackoverflow.com/questions/9854166/declaring-an-unsigned-int-in-java) unsigned integers (although some partial support [was added in JDK 8](https://blogs.oracle.com/darcy/entry/unsigned_api)). However, Guava contains some utilities to help you. There are two sets of api:

- the first version is based upon a wrapper, similarly to BigInteger and BigDecimal. The two classes [`UnsignedInteger`](https://google.github.io/guava/releases/snapshot/api/docs/com/google/common/primitives/UnsignedInteger.html) and [`UnsignedLong`](https://google.github.io/guava/releases/snapshot/api/docs/com/google/common/primitives/UnsignedLong.html) wrap respectively a 32-bit integer and a 64-bit long in an object, which can do proper unsigned math.
- if you are willing to sacrifice speed for readability, you can skip the wrappers and use a raw `int` or `long` as if it were an unsigned, using the methods of [`UnsignedInts`](https://google.github.io/guava/releases/snapshot/api/docs/com/google/common/primitives/UnsignedInts.html) and [`UnsignedLongs`](https://google.github.io/guava/releases/snapshot/api/docs/com/google/common/primitives/UnsignedLongs.html) to work with them. However, this can quite easily lead to subtle mistakes, since there is no compiler errors or warning to help you, so try to isolate as much as possible the use of these classes.

## Math

Guava also contains some classes to help you perform mathematics and handle correctly, and portably, overflows, underflows, and other arithmetic errors. There are, again, various classes with all similar methods, notably [`IntMath`](https://google.github.io/guava/releases/snapshot/api/docs/com/google/common/math/IntMath.html), [`LongMath`](https://google.github.io/guava/releases/snapshot/api/docs/com/google/common/math/LongMath.html) and [`DoubleMath`](https://google.github.io/guava/releases/snapshot/api/docs/com/google/common/math/DoubleMath.html), all of which include a lot of methods:

- [`factorial`](https://google.github.io/guava/releases/snapshot/api/docs/com/google/common/math/IntMath.html#factorial(int)), [`binomial`](https://google.github.io/guava/releases/snapshot/api/docs/com/google/common/math/IntMath.html#binomial(int,%20int)), [`isPrime`](https://google.github.io/guava/releases/snapshot/api/docs/com/google/common/math/IntMath.html#isPrime(int)), [`gcd`](https://google.github.io/guava/releases/snapshot/api/docs/com/google/common/math/IntMath.html#gcd(int,%20int)) and similar methods to perform standard math operations;
- variants of addition, subtraction and so on with checks for overflows: [`checkedAdd`](https://google.github.io/guava/releases/snapshot/api/docs/com/google/common/math/IntMath.html#checkedAdd(int,%20int)) and others;
- [`divide`](https://google.github.io/guava/releases/snapshot/api/docs/com/google/common/math/IntMath.html#divide(int,%20int,%20java.math.RoundingMode)), logarithms and square roots with an explicit rounding mode;
- various versions of [rounding](https://google.github.io/guava/releases/snapshot/api/docs/com/google/common/math/DoubleMath.html#roundToLong(double,%20java.math.RoundingMode)) for doubles.
