---
date: 2015-03-17T18:48:28Z
tags:
- java
title: Some not well known facts about enums in Java
aliases: [/enums-in-java]
---

Today I'm going to show you a few small features about enums in Java. You should know about all of this already, but in case you don't, I hope to teach you something useful. :-)

## Member functions and variables

Enums, that have been available since Java 5, are more powerful than first appears: they can have full fledged member functions and variables. They cannot have public constructors, since no instance can be explicitly created, but they can have private constructors. For instance:

```java
public enum JoinType {
    INNER("INNER JOIN"),
    LEFT("LEFT JOIN"),
    RIGHT("RIGHT JOIN"),
    OUTER("FULL OUTER JOIN");

    private final String sql;

    private JoinType(String sql) {
        this.sql = sql;
    }

    public String getSql() {
        return sql;
    }
}
```

As you can see from the example, we have a member variable `sql` in our enum, that we have set in the private constructor. We also have a member function to retrieve it, just as if this was a standard class.

This pattern can also be expressed by creating multiple classes implementing the same interface, or extending the same abstract base class. However, sometimes it makes more sense to use an enum because the logical set of values is limited.

## Treating enum values as classes

A single value of an enum can also override a function defined in the base enum. An example should clarify what I mean:

```java
public enum Month {
    JANUARY(31),
    FEBRUARY(28) {
        @Override
        public int getNumDays(int year) {
            return isLeap(year) ? 29 : 28;
        }
    },
    MARCH(31),
    APRIL(30),
    MAY(31),
    JUNE(30),
    JULY(31),
    AUGUST(31),
    SEPTEMBER(30),
    OCTOBER(31),
    NOVEMBER(30),
    DECEMBER(31);

    private final int numDays;

    private Month(int numDays) {
        this.numDays = numDays;
    }

    public int getNumDays(int year) {
        return numDays;
    }
}
```

Similarly to the previous example, we have defined a member function and field in our enum. However we can treat value `FEBRUARY` as an anonymous class and override the function in the base class (the enum) to specialize the behaviour.

This technique can quickly read to messy code, since often it is better to just create normal classes and use inheritance in the common way, but - as before - there are times when the range of values will not change, and thus it can make sense to treat it as an enum. Just think hard about whether you'd be better off with the "classical" inheritance.

## Enums can implement interface

An enum can implement an interface. Just as before, you can implement the interface in the "base" enum and override the implementation in a given value. Furthermore, you can even implement the interface _only_ in the values:

```java
public interface Color {
    String getHtmlRepresentation();
}

// Interface implemented in the enum
public enum PrimaryColors implements Color {
    RED("#ff0000"),
    GREEN("#00ff00"),
    BLUE("#0000ff");

    private final String htmlRepresentation;

    private PrimaryColors(String htmlRepresentation) {
        this.htmlRepresentation = htmlRepresentation;
    }

    @Override
    public String getHtmlRepresentation() {
        return htmlRepresentation;
    }
}

// Interface implemented explicitly in each value
public enum OtherColors implements Color{
    YELLOW {
        @Override
        public String getHtmlRepresentation() {
            return "#ffff00";
        }
    },
    CYAN {
        @Override
        public String getHtmlRepresentation() {
            return "#00ffff";
        }
    },
    PURPLE {
        @Override
        public String getHtmlRepresentation() {
            return "#ff00ff";
        }
    }
}
```

Please don't take the example as "good design", because it isn't. :-) I personally think that this is quite an abuse of the language, but very occasionally it can be the correct approach.

## Set of enums

Finally, in case you need to have a `Set` of a given enum, consider using [`EnumSet`](http://docs.oracle.com/javase/7/docs/api/java/util/EnumSet.html) as the implementation rather than your standard `HashSet`. `EnumSet` has a far more efficient [implementation](http://grepcode.com/file/repository.grepcode.com/java/root/jdk/openjdk/6-b14/java/util/RegularEnumSet.java) (assuming your enum has less up to 64 values), backed by a single long treated as a bit array. Furthermore it has some very nice factory methods such as:

```java
EnumSet.of(JANUARY, FEBRARY);

EnumSet.noneOf(Month.class);

EnumSet.allOf(Month.class);
```

There's also an [`EnumMap`](http://docs.oracle.com/javase/7/docs/api/java/util/EnumMap.html) available, for maps where the key is an enum, which can be very efficient and compact as well.
