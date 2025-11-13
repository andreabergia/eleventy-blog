---
date: 2015-08-24T18:49:45Z
tags:
- java
- guava
title: Guava's Caches
aliases: [/guavas-caches]
---

[Guava](https://code.google.com/p/guava-libraries/), among its [many]({% ref "2015-07-19-guavas-multimap.markdown" %}) [useful]({% ref "2015-07-06-guavas-immutable-collections.markdown" %}) [things]({% ref "2015-05-27-optional-in-java.markdown" %}), contains a great implementation of a cache.

A cache, as you know, is an object that manages an association between keys and values, like an hash map, used when the values are generally very "heavy" to calculate and you want to avoid doing that repeatedly. The main difference between a cache and a generic map is that the cache generally has some kind of "eviction" policy, i.e. it only retains a number of the items stored in it, while a map will retain _all_ the values.

From the [Guava's website](https://code.google.com/p/guava-libraries/wiki/CachesExplained):

> Generally, the Guava caching utilities are applicable whenever:
>
> - You are willing to spend some memory to improve speed.
> - You expect that keys will sometimes get queried more than once.
> - Your cache will not need to store more data than what would fit in RAM. (Guava caches are local to a single run of your application. They do not store data in files, or on outside servers. If this does not fit your needs, consider a tool like Memcached.)

## Usage

Guava's [`Cache`](http://docs.guava-libraries.googlecode.com/git/javadoc/com/google/common/cache/Cache.html) is quite simple to use:

```java
Value v = myCache.get(key, new Callable<Value>() {
    @Override
    public Value call() throws AnyException {
        return loadTheValueSlowly(key);
    }
});
```

When asking the cache for a value, you need to pass a `Callable` that will perform the actual loading of the value whenever it is not found in the cache (which will happen on the first `get` request, and also for further ones if the value has been evicted).

You can also manually [`put`](http://docs.guava-libraries.googlecode.com/git/javadoc/com/google/common/cache/Cache.html#put(K,%20V)) a value, [`getIfPresent`](http://docs.guava-libraries.googlecode.com/git/javadoc/com/google/common/cache/Cache.html#getIfPresent(java.lang.Object)) to request it only if it's already present, [`invalidateAll`](http://docs.guava-libraries.googlecode.com/git/javadoc/com/google/common/cache/Cache.html#invalidateAll()) the entries or [`invalidate`](http://docs.guava-libraries.googlecode.com/git/javadoc/com/google/common/cache/Cache.html#invalidate(java.lang.Object)) a specific key.

## Eviction policies

Guava's caches, as we have mentioned, will remove already existing entries in some situations, to save memory; this is called the *eviction policy* of the cache. Commonly used policies are:

- keep the cache size under a certain value: done with [`CacheBuilder::maximumSize`](http://docs.guava-libraries.googlecode.com/git-history/release/javadoc/com/google/common/cache/CacheBuilder.html#maximumSize(long))
- expire entries when a certain duration has passed after the last access: done via [`CacheBuilder::expireAfterAccess`](http://docs.guava-libraries.googlecode.com/git-history/release/javadoc/com/google/common/cache/CacheBuilder.html#expireAfterAccess(long, java.util.concurrent.TimeUnit))
- expire entries when a certain duration has passed after the entry has been inserted: done with [`CacheBuilder::expireAfterWrite`](http://docs.guava-libraries.googlecode.com/git-history/release/javadoc/com/google/common/cache/CacheBuilder.html#expireAfterWrite(long, java.util.concurrent.TimeUnit))
- assign a "weight" to each item and expire the cache after a certain maximum weight has been reached: done via [`CacheBuilder::weigher`](http://docs.guava-libraries.googlecode.com/git-history/release/javadoc/com/google/common/cache/CacheBuilder.html#weigher(com.google.common.cache.Weigher)) and [`CacheBuilder::maximumWeight`](http://docs.guava-libraries.googlecode.com/git-history/release/javadoc/com/google/common/cache/CacheBuilder.html#maximumWeight(long)).

Let's see an example of the last one:

```java
    Cache<String, String> cache = CacheBuilder.newBuilder()
       .maximumWeight(100000)
       .weigher(new Weigher<String, String>() {
          public int weigh(String k, String w) {
            return w.length();
          }
        })
       .build();
```

## Loading caches

Often it is not that simple, or readable, to use the version of [`get`](http://docs.guava-libraries.googlecode.com/git-history/release/javadoc/com/google/common/cache/Cache.html#get(K, java.util.concurrent.Callable)) which requires a `Callable` to load the value, but you'd rather pass a `Callable` at the cache construction time. This can be done with the version of [`CacheBuilder::build`](http://docs.guava-libraries.googlecode.com/git-history/release/javadoc/com/google/common/cache/CacheBuilder.html#build(com.google.common.cache.CacheLoader)) that receives a [`CacheLoader`](http://docs.guava-libraries.googlecode.com/git/javadoc/com/google/common/cache/CacheLoader.html), which is used more or less in the same way:

```java
    LoadingCache<Key, Item> itemsCache = CacheBuilder.newBuilder()
       .maximumSize(1000)
       .build(
           new CacheLoader<Key, Item>() {
             public Item load(Key key) throws AnyException {
               return loadExpensiveItem(key);
             }
           });
```

## Other details

Guava's Caches are thread-safe: if a value needs to be loaded for a given key, it will be loaded only once, even if another request for it arrives while it still is loading.

Furthermore, caches can be viewed as a map with the method [`asMap`](http://docs.guava-libraries.googlecode.com/git/javadoc/com/google/common/cache/Cache.html#asMap()).

Finally, if necessary, you can ask the `CacheLoader` to create a cache that will record usages statistics, and then retrieve them with the [`stats`](http://docs.guava-libraries.googlecode.com/git/javadoc/com/google/common/cache/Cache.html#stats()) method. This can be quite useful, not only during development, to check the actual efficiency of your caches.
