---
date: 2015-07-19T14:30:52Z
tags:
- java
- guava
title: Guava's Multimap
aliases: [/guavas-multimap]
---

Maps and List are the bread and butter of any Java program, but sometimes you need to creating a map that associates one key to multiple values and end up creating a `Map<K, List<V>>` or similar. If you've ever needed that sort of collection, [Guava](https://code.google.com/p/guava-libraries/) has you covered with its [Multimap](http://docs.guava-libraries.googlecode.com/git/javadoc/com/google/common/collect/Multimap.html).

Guava's Multimap is designed to represent a map where for one key there is a collection of values. There are two main variants (subinterfaces) of Multimaps: [ListMultimap](http://docs.guava-libraries.googlecode.com/git/javadoc/com/google/common/collect/ListMultimap.html), which acts as if the collection is a `List` (meaning there can be duplicates associated to the same key) and [SetMultimap](http://docs.guava-libraries.googlecode.com/git/javadoc/com/google/common/collect/SetMultimap.html), which doesn't allow duplicated pairs.

Using Multimap is much nicer than a `Map<K, List<V>>`, mostly because you don't have to handle the case "the value collection is null since there is nothing associated to the key": Multimap will always return an empty collection and never null. Futhermore, Guava will consider a key present if and only if it is associated to a value, meaning that removing a pair might remove the key from the map if it was associated only to one value. This is quite helpful in a lot of cases.

All the standard API that you would expect are available:

- [`put(K, V)`](http://docs.guava-libraries.googlecode.com/git/javadoc/com/google/common/collect/Multimap.html#put(K,%20V))
- [`remove(K, V)`](http://docs.guava-libraries.googlecode.com/git/javadoc/com/google/common/collect/Multimap.html#remove(java.lang.Object,%20java.lang.Object))
- [`get(K) -> Collection<V>` ](http://docs.guava-libraries.googlecode.com/git/javadoc/com/google/common/collect/Multimap.html#get(K))

and so on.

## Design notes

Quoting directly from the Multimap's javadoc:

> A collection that maps keys to values, similar to Map, but in which each key may be associated with multiple values. You can visualize the contents of a multimap either as a map from keys to nonempty collections of values:

> a → 1, 2

> b → 3

> ... or as a single "flattened" collection of key-value pairs:

> a → 1

> a → 2

> b → 3

> Important: although the first interpretation resembles how most multimaps are implemented, the design of the Multimap API is based on the second form. So, using the multimap shown above as an example, the `size()` is 3, not 2, and the `values()` collection is [1, 2, 3], not [[1, 2], [3]].
## Implementations

There are multiple implementations of Multimap available, the most commonly used are:

- [ArrayListMultimap](http://docs.guava-libraries.googlecode.com/git/javadoc/com/google/common/collect/ArrayListMultimap.html) which supports duplicates and remembers the insertion order of values for a given key;
- [HashMultimap](http://docs.guava-libraries.googlecode.com/git/javadoc/com/google/common/collect/HashMultimap.html), which does not support duplicates and does not remember the insertion order;
- [ImmutableListMultimap](http://docs.guava-libraries.googlecode.com/git/javadoc/com/google/common/collect/ImmutableListMultimap.html) and [ImmutableSetMultimap](http://docs.guava-libraries.googlecode.com/git/javadoc/com/google/common/collect/ImmutableSetMultimap.html), which are [immutable]({% ref "2015-07-06-guavas-immutable-collections.markdown" %}) versions of Multimap.

## Views

Multimap supports a powerful concept of views: methods that returns collections that map to the underlying multimap. For instance, you can do things like:

```java
Multimap<String, String> m = HashMultimap.create();
m.get("a").put("b");
assertTrue(m.containsEntry("a", "b"));
```

The `Collection` returned by `get` is modifiable: whenever you make a change to it, the modifications are reflected to the underlying Multimap.

Other useful methods that return a view of the multimap are:

- [asMap](http://docs.guava-libraries.googlecode.com/git/javadoc/com/google/common/collect/Multimap.html#asMap()) which returns a `Map<K, Collection<V>>`;
- [entries](http://docs.guava-libraries.googlecode.com/git/javadoc/com/google/common/collect/Multimap.html#entries()) which returns a `Collection<Map.Entry<K, V>>`;
- [keySet](http://docs.guava-libraries.googlecode.com/git/javadoc/com/google/common/collect/Multimap.html#keySet()) which returns a `Set<K>`;
- [values](http://docs.guava-libraries.googlecode.com/git-history/release/javadoc/com/google/common/collect/Multimap.html#values()) which returns a `Collection<V>`.

## Conclusions

Chances are you've written in the past a `Map<K, Collection<V>>`. In almost all cases, Multimap is a better choice and offers a much better API. Go and use it!
