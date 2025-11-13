---
date: 2016-01-24T17:01:53Z
tags:
- java
- guava
title: 'Guava tips: ComparisonChain'
aliases: [/guava-tips-comparisonchain]
---

Imagine you have a simple class with, say, three fields, and you have to make it [`Comparable`](https://docs.oracle.com/javase/8/docs/api/java/lang/Comparable.html). You will probably write a `compareTo` method similar to this:

```java
public class MyTuple implements Comparable<MyTuple> {
    private final int x;
    private final String y;
    private final boolean z;

    @Override
    public int compareTo(MyTuple o) {
        int compareX = Integer.compare(x, y);
        if (compareX != 0) {
            return compareX;
        }
        int compareY = y.compareTo(o.y);
        if (compareY != 0) {
            return compareY;
        }
        return Boolean.compare(z, o.z);
    }

    // ...
}
```

[Guava](https://github.com/google/guava) has a very useful class, [ComparisonChain](http://docs.guava-libraries.googlecode.com/git/javadoc/com/google/common/collect/ComparisonChain.html),  to help you write these boring `compareTo` methods and make them much more readable. For instance, using it you could rewrite the above method as:

```java
@Override
public int compareTo(MyTuple o) {
    return ComparisonChain.start()
            .compare(x, o.x)
            .compare(y, o.y)
            .compareFalseFirst(z, o.z)
            .result();
}
```

`ComparisonChain` is smart, in the sense that it will stop calling `compareTo` on objects as soon as it finds the first non zero comparison. It is much more readable, and less error prone. Highly recommended! :-)
