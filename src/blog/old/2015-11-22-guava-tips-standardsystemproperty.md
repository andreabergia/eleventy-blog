---
date: 2015-11-22T10:26:16Z
tags:
- java
- guava
title: 'Guava tips: StandardSystemProperty'
aliases: [/guava-tips-standardsystemproperty]
---

The JVM will always have a value for some predefined system properties, such as `java.version` which represents the running JDK version, and so on. The complete list is available in the JavaDoc for [`System::getProperties`](https://docs.oracle.com/javase/7/docs/api/java/lang/System.html?is-external=true#getProperties()).

[Guava](https://github.com/google/guava) defines an enum called [`StandardSystemProperty`](http://docs.guava-libraries.googlecode.com/git/javadoc/com/google/common/base/StandardSystemProperty.html) which contains an entry for each of these predefined values. All these entries have a method [`value`](http://docs.guava-libraries.googlecode.com/git/javadoc/com/google/common/base/StandardSystemProperty.html#value()) which delegates to the `System` class.

For instance you can do:

```java
assertEquals("andry", StandardSystemProperty.USER_NAME.value());
```

The most widely useful values include, in my opinion:

- [`FILE_SEPARATOR`](http://docs.guava-libraries.googlecode.com/git/javadoc/com/google/common/base/StandardSystemProperty.html#FILE_SEPARATOR) which represents the separator in paths: `\` on Windows and `/` on Unixes;
- [`LINE_SEPARATOR`](http://docs.guava-libraries.googlecode.com/git/javadoc/com/google/common/base/StandardSystemProperty.html#LINE_SEPARATOR), which represents the end-of-line in text files: `\r\n` on Windows and `\n` on Unixes;
- [`OS_ARCH`](http://docs.guava-libraries.googlecode.com/git/javadoc/com/google/common/base/StandardSystemProperty.html#OS_ARCH), [`OS_NAME`](http://docs.guava-libraries.googlecode.com/git/javadoc/com/google/common/base/StandardSystemProperty.html#OS_NAME) and [`OS_VERSION`](http://docs.guava-libraries.googlecode.com/git/javadoc/com/google/common/base/StandardSystemProperty.html#OS_VERSION) which give information about the running OS;
- [`JAVA_VERSION`](http://docs.guava-libraries.googlecode.com/git/javadoc/com/google/common/base/StandardSystemProperty.html#JAVA_VERSION), which represents the JRE version;
- [`USER_HOME`](http://docs.guava-libraries.googlecode.com/git/javadoc/com/google/common/base/StandardSystemProperty.html#USER_HOME) which represents the home directory of the current user;
- [`USER_DIR`](http://docs.guava-libraries.googlecode.com/git/javadoc/com/google/common/base/StandardSystemProperty.html#USER_DIR) which represents the user's working directory.

For example:

```java
Arrays.asList(
        FILE_SEPARATOR, LINE_SEPARATOR,
        OS_ARCH, OS_NAME, OS_VERSION,
        JAVA_VERSION, USER_HOME, USER_DIR)
        .stream()
        .map(e -> String.format("%s: %s", e.name(), e.value()))
        .forEach(System.out::println);
```

will print something like:

```
FILE_SEPARATOR: /
LINE_SEPARATOR:

OS_ARCH: amd64
OS_NAME: Linux
OS_VERSION: 3.19.0-28-generic
JAVA_VERSION: 1.8.0_45-internal
USER_HOME: /home/andry
USER_DIR: /home/andry/code/blog
```
