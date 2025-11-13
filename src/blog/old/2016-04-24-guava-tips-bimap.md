---
date: 2016-04-24T21:03:37Z
tags:
- java
- guava
title: 'Guava Tips: Bimap'
aliases: [/guava-tips-bimap]
---

A rather common task is to model some relationship between two kinds of objects. Often you only need to go from a key to its value, and you will use a standard `Map`, but sometimes you will have to go back from the "value" to the "key". In cases like this, the common solution is to build two maps:

```java
Map<A, B> a2b = new HashMap<>();
Map<B, A> b2a = new HashMap<>();

a2b.put(myA, myB);
b2a.put(myB, myA);
```

However, this is quite cluttered and you can end up with subtle bug in case you forget to keep the two maps in sync, or fail to do so in case of concurrency.

[Guava](https://github.com/google/guava) contains the very useful [`BiMap`](http://docs.guava-libraries.googlecode.com/git/javadoc/com/google/common/collect/BiMap.html) interface and some common implementation to solve the problem. A `BiMap` is a `Map` that can be inverted, meaning that is able to give you an _inverse_ map that goes from the values to the keys. This means that you cannot insert duplicated _values_, as well as duplicated _keys_, since otherwise the map would not be invertible.

The precise definition, taken from the javadoc, is:

> A bimap (or "bidirectional map") is a map that preserves the uniqueness of its values as well as that of its keys. This constraint enables bimaps to support an "inverse view", which is another bimap containing the same entries as this bimap but with reversed keys and values.

A `BiMap`'s inverse is a _view_: similarly to other Guava's collections (such as [`Multimap`]({% ref "2015-07-19-guavas-multimap.markdown" %})), this means that the result of [`inverse`](http://docs.guava-libraries.googlecode.com/git/javadoc/com/google/common/collect/BiMap.html#inverse()) is not a new map but rather an object that implements the correct interface, but uses the same underlying storage of the actual `BiMap`: any change done to the inverse view will reflect in the `BiMap` and viceversa.

Guava provides a few implementation of `BiMap`:

- [`HashBiMap`](https://google.github.io/guava/releases/snapshot/api/docs/com/google/common/collect/HashBiMap.html) is the most commonly used one, and works just as a regular `HashMap`.
- [`EnumHashBiMap`](https://google.github.io/guava/releases/snapshot/api/docs/com/google/common/collect/EnumHashBiMap.html) is a special `BiMap` that can be useful when your keys are enums; just as [`EnumSet`]({% ref "2015-03-17-enums-in-java.markdown" %}), it can be faster than a regular `HashBiMap`.
- [`EnumBiMap`](https://google.github.io/guava/releases/snapshot/api/docs/com/google/common/collect/EnumBiMap.html) is a special version of the above, useful when both your key _and_ value are enums.
- [`ImmutableBiMap`](https://google.github.io/guava/releases/snapshot/api/docs/com/google/common/collect/ImmutableBiMap.html) is part of [Guava's immutable collections]({% ref "2015-07-06-guavas-immutable-collections.markdown" %}): it's a `BiMap` that cannot be modified once it has been created. A [`Builder`](https://google.github.io/guava/releases/snapshot/api/docs/com/google/common/collect/ImmutableBiMap.Builder.html) class is provided, similarly to the other immutable collections.

A quick example:

```java
BiMap<A, B> bimap = HashBiMap.create();
bimap.put(myA, myB);
assertEquals(bimap.inverse().get(myB), myA);
```
