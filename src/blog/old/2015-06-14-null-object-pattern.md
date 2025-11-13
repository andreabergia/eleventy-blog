---
date: 2015-06-14T17:13:48Z
tags:
- architecture
title: Null object pattern
aliases: [/null-object-pattern/]
---

[Last time]({% ref "2015-05-27-optional-in-java.markdown" %}) we talked about Optional in Java as a way to express the concept of "no valid value". However, sometimes there is a better choice: we can use the [Null Object Pattern](https://en.wikipedia.org/wiki/Null_Object_pattern).

The idea behind it is simple: rather than returning `null` (or a missing `Optional`) sometimes it is possible to return an object with an "empty" implementation. This object will generally do nothing when its methods are invoked.

For example, if you are designing a video game and you have an interface representing the sound system:

```java
interface SoundSystem {
    void play(Sound sound, Volume volume);
}
```

you might implement a "null sound system" that simply does nothing when asked to play a sound. This object can then be used during testing, or - simply - as a placeholder before the actual implementation is done.

Another example is a null logger: you can implement a simple logger that does nothing:

```java
interface Logger {
    void log(String message);
}

class NullLogger implements Logger {
    void log(String message) {
        // Do nothing
    }
}
```

Yet another example: Guava's [Multimap](http://docs.guava-libraries.googlecode.com/git/javadoc/com/google/common/collect/Multimap.html) class, when asked for a missing key, returns an empty collection of values rather than null. In this case, the empty collection can be though of as the "null object", since it can be used in place of a "valid" result (a filled collection). While this analogy is a bit forced, it shows the usefulness of the pattern: returning a valid, yet "empty" object is much better than not returning anything, since the client can treat both kind of results in the same way.

When it does make sense, null objects can be a better idea than a real `null` pointer, since they are transparent to the caller.

### Further readings

- [https://sourcemaking.com/design_patterns/null\_object](https://sourcemaking.com/design_patterns/null_object)
- [https://en.wikipedia.org/wiki/Null\_Object\_pattern](https://en.wikipedia.org/wiki/Null_Object_pattern)
- [http://gameprogrammingpatterns.com/service-locator.html](http://gameprogrammingpatterns.com/service-locator.html)
