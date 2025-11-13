---
date: 2015-11-01T18:30:51Z
tags:
- java
title: Parsing dates in multiple formats in Joda-Time
aliases: [/parsing-dates-in-multiple-formats-in-joda-time]
---

[Joda-Time](http://www.joda.org/joda-time/) is without a doubt _the best_ way to work with dates and times in Java, unless you happen to be working exclusively on Java 8+, where you can use the new [java.time](https://docs.oracle.com/javase/8/docs/api/java/time/package-summary.html) library, also known as [JSR 310](http://www.threeten.org/).

With Joda you can easily parse dates, times and timestamps using [`DateTimeFormatter`](http://joda-time.sourceforge.net/apidocs/org/joda/time/format/DateTimeFormatter.html). For example you can use:

```java
DateTimeFormatter formatter = DateTimeFormat.forPattern("yyyy-MM-dd");
LocalDate date = formatter.parseLocalDate("2015-12-25");
assertEquals(2015, date.getYear());
assertEquals(12, date.getMonthOfYear());
assertEquals(25, date.getDayOfMonth());
```

However, the library doesn't have a method such as "`tryParse`": it only has various versions of `parseLocalDate`, `parseLocalTime`, `parseDateTime` which all throw `IllegalArgumentException` if the given string doesn't match the format.

So, what if you need to parse a date in one of two possible formats? You can obviously do something like this:

```java
private static final List<DateTimeFormatter> FORMATTERS =
    Arrays.asList(
        DateTimeFormat.forPattern("dd/MM/yyyy"),
        DateTimeFormat.forPattern("yyyy-MM-dd"));

public static LocalDate parseDate(String inputString)
        throws IllegalArgumentException {
    for (DateTimeFormatter formatter : FORMATTERS) {
        try {
            return formatter.parseLocalDate(inputString);
        } catch (IllegalArgumentException e) {
            // Go on to the next format
        }
    }
    throw new IllegalArgumentException("Unsupported date format: " + inputString);
}

@Test
public void testMatchedFormatsReturnTheDate() {
    assertEquals(new LocalDate(2015, 12, 25), parseDate("25/12/2015"));
    assertEquals(new LocalDate(2015, 12, 25), parseDate("2015-12-25"));
}

@Test(expected = IllegalArgumentException.class)
public void testUnmatchedFormatThrows() {
    parseDate("25.12.2015");
}
```

However, this is not very nice, not to mention not very fast since throwing an exception in Java can be quite expensive.

A better alternative exists though: you can use [`DateTimeFormatterBuilder`](http://joda-time.sourceforge.net/apidocs/org/joda/time/format/DateTimeFormatterBuilder.html) to create a `DateTimeFormatter` with multiple patterns. For example:

```java
private static final DateTimeFormatter DATE_FORMATTER =
    new DateTimeFormatterBuilder()
        .append(null, new DateTimeParser[]{
                DateTimeFormat.forPattern("dd/MM/yyyy").getParser(),
                DateTimeFormat.forPattern("yyyy-MM-dd").getParser()})
        .toFormatter();

@Test
public void testMatchedFormatsReturnTheDate() {
    assertEquals(new LocalDate(2015, 12, 25), DATE_FORMATTER.parseLocalDate("25/12/2015"));
    assertEquals(new LocalDate(2015, 12, 25), DATE_FORMATTER.parseLocalDate("2015-12-25"));
}

@Test(expected = IllegalArgumentException.class)
public void testUnmatchedFormatThrows() {
    DATE_FORMATTER.parseLocalDate("25.12.2015");
}
```

This is a simpler alternative to the previous version, not only because it's more readable (using exception as control flow is _not_ a good design), but also because the returned object simply implements the same interface as a parser for just one format, allowing you to simply not care whether it supports one or more formats. Win-win!
