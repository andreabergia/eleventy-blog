---
date: 2022-11-12T14:50:00+02:00
tags:
  - languages
  - java
title: Languages opinion - part one - JVM
series: ["Languages Opinion"]
---


In this short series of articles, I want to talk about programming languages. I love learning them, and I always try to read up a bit whenever any new language gains significant traction. In these posts, I want to focus on which programming languages I believe have had the most impact in the past decade. Note that this will be a highly opinionated piece, based on my experiences - you might have a lot of different opinions, and that's fine! Feel free to hit me up [on Twitter](https://twitter.com/andreabergia) or [Linkedin](linkedin.com/in/andreabergia/) if you wanna discuss it!

<!-- The discussion will be split into a series of articles:

- Java and Kotlin (this post)
- Rust
- Go, JavaScript, and Typescript
- "catch-all": C++, Python, Swift, Ruby, Nim, Zig, Haskell, .NET, Scala, Clojure
-->

This piece will focus on the JVM and the two most used languages on it: Java and Kotlin.

# Java

After a long stagnation period, Java finally started evolving again in the 2010s. The first major evolution has been Java 8 in 2014, which was a huge update to the language, thanks mostly to the introduction of lambdas. I would argue that the changes to the garbage collectors (removal of the [PermGen](https://www.baeldung.com/java-permgen-metaspace), string deduplication, and introduction of [G1](https://en.wikipedia.org/wiki/Garbage-first_collector)) were also very important, since they greatly improved performances, especially for applications with large heaps.

After Java 8, the [new release model of Java](https://blogs.oracle.com/javamagazine/post/java-long-term-support-lts) was adopted - we now get one version every six months, with a LTS (long-term support) version every three years. Since then, we have had two LTS versions: Java 11 and 17.

[Java 11](https://www.baeldung.com/java-11-new-features) includes the [modules feature](https://www.oracle.com/corporate/features/understanding-java-9-modules.html), which (in my opinion) turned out to not have any real impact - I have seen no project where it is used. Perhaps it might be useful to libraries authors, but most popular libraries I've seen still rely on Java 8, so they do not use modules. Additionally, Java 11 introduced the `var` keyword (finally), added quite a few new APIs, and improved the garbage collection performances - by double digits percentages in some workloads.

[Java 17](https://www.baeldung.com/java-17-new-features) added a lot more things - multiline text blocks help a lot for SQL queries and inline JSON in tests in my experience, the greatly improved `switch` is very nice, [records](https://www.baeldung.com/java-record-keyword) remove a lot of clutter and the need for things like [Lombok](https://projectlombok.org/) in many cases, sealed classes can improve your code design, and again there were a lot of improvements to the GC performances.

In short, Java has had a great decade - it is still one of the most widely used languages out there, the runtime is _very fast_ and reliable, and it is super productive with frameworks such as [Spring boot](https://spring.io/projects/spring-boot) and [Quarkus](https://quarkus.io/). One of the things I appreciate the most is that you have great, production-level libraries for just about everything. However, Java still has some longstanding issues - the JVM adds a lot of overhead, and the language - while greatly improved - feels a bit stale (why are we still relying on one-class-per-file?) and not very expressive by modern standards. It also has a reputation to be pretty verbose.

Java is used as the backbone of _many_ companies - not only tech companies, but it is also _everywhere_ in the financial, telco, and other industries. It is not going anywhere, and I am very happy about the new pace of releases. It is a safe bet for many projects, it is easy to hire for, and you can absolutely write solid, well-architectured applications with it.

# Kotlin

Kotlin is an _extremely_ interesting language, based on the JVM, that achieved wide popularity in a very short time. Version 1.0 was released in February 2016, and by 2019 it was officially named the preferred language for Android development by Google. It has since achieved huge adoption in the industry - for example, [Google](https://www.youtube.com/watch?v=o14wGByBRAQ) is now recommending it for server-side JVM projects, [Meta](https://engineering.fb.com/2022/10/24/android/android-java-kotlin-migration/) recently blogged about moving their Android apps to Kotlin, and so did [Uber and many others](https://www.pinterest.com/pin/why-uber-and-13-other-famous-apps-switched-from-java-to-kotlin--810718370402625139/). And, of course, [I'm writing a lot of Kotlin](https://technology.lastminute.com/frontend-backend-languages-frameworks/) for my employer, [lastminute.com](https://www.lastminute.com/).

So, why is Kotlin so popular? There are multiple reasons, in my opinion.

The first is that Kotlin runs on the JVM and has great interoperability with Java, meaning you can use just about any Java library. You can also mix and match Java and Kotlin in the same project, which makes gradual adoption in a project very easy. This is a big difference from other JVM languages such as Scala, which reinvented even the basic containers (for good reasons, though). Finally, Kotlin generates the same bytecode that the equivalent Java would have, so you don't get particular performance surprises.

Another big reason for its popularity is that Kotlin is _fun_ to write. The syntax is great, there are _a ton_ of tiny helper methods in the standard libraries for the most common things, and you end up with far more compact and expressive code, with much less boilerplate than in Java.

Finally, the thing that for me is _the_ killer feature is the [null safety](https://kotlinlang.org/docs/null-safety.html) - types that allow `null` are _different_ from types that do not, and if you incorrectly use a nullable type you get a compiler error. This feature alone will reduce _by a lot_ the amount of `NullPointerException` you get, and safer code is always better!

Kotlin was developed by [JetBrains](https://www.jetbrains.com/), and as you can imagine, their IDE [IntelliJ Idea](https://www.jetbrains.com/idea/) has fantastic support for it. Compilation speed is quite a bit slower than for Java, but the [incremental compiler](https://blog.jetbrains.com/kotlin/2022/07/a-new-approach-to-incremental-compilation-in-kotlin/) can mitigate it. Also, Kotlin projects do build pretty fast on an [M1 MacBook Pro](https://www.apple.com/macbook-pro-13/)! 😅

## Kotlin code samples

Let us see some code, to get a feeling of Kotlin's syntax. First up, constructors have a shorter syntax for defining and initializing properties at the same time:

```kotlin
class Money(val amount: BigDecimal, val currency: Currency)
```

This gets you a standard class, with getters `getAmount` and `getCurrency`. No setters, since we have defined the properties to be `val` - if we want them, we can use `var`. However, in Kotlin you don't generally use getters/setters - properties are accessed with a simpler syntax, that also works for any standard Java class:

```kotlin
x.amount = y.amount * 2
```

This is equivalent (meaning that it gets compiled to the same bytecode) to the Java code `x.setAmount(y.getAmount() * 2)`, but it is quite a bit simpler to read.

You can also define [data classes](https://kotlinlang.org/docs/data-classes.html), similarly to Java 17's `records` - and you get `equals`, `hashCode` and `toString` for free. Of course, you should use data classes _not_ to avoid writing these methods, but when the class you are designing is used only to hold data.

```kotlin
data class Airport(
    val name: String,
    val city: String,
    val timezone: ZoneId,
)
```

Another cool feature is that, like in many modern languages, everything is an expression. This means you can write code like this:

```kotlin
val canWeDoIt = if (weAreCool()) "Yes!" else "Maybe?"

val prime = when {      // When is switch on steroids
    number == 0 || number == 1 -> false
    number == 2 -> true
    number % 2 == 0 -> false
    else -> checkPrimeWithRealCriteria(number)
}
```

Kotlin supports extension methods (like many other languages, such as [C#](https://learn.microsoft.com/en-us/dotnet/csharp/programming-guide/classes-and-structs/extension-methods)), meaning you can add your own methods to existing classes. At the JVM level (and if you invoke it from Java), these are just standard static methods that take the object as the first parameter, but when invoking them from Kotlin they are very nice:

```kotlin
fun Int.plusOne() = this + 1
val n = 42.plusOne()
```

Finally, there are _a lot_ of nice utility methods in the standard library that help you write compact and clear code, thanks to the great syntax for lambdas:

```kotlin
class CityAndTemperature(val city: String, val temperature: Double)

val cityAndTemperatures: List<CityAndTemperature>
val coldCities: Map<String, Double> = cityAndTemperatures
    .filter { it.temperature < 0 }
    .sortedBy { it.city }
    .associateBy { it.city to it.temperature }
```

This looks a lot like Java's streams, but there is one big difference - most of these methods are `inline` extension methods, meaning that you get the exact same code as if you had written a `for` loop by hand. So, you get performances _and_ clarity!

Let us briefly introduce the null safety feature before wrapping up. As mentioned earlier, in Kotlin the types `String` and `String?` are distinct. The first type _cannot_ be null, the second can. You _need_ to check whether a nullable variable has a valid value or not, before accessing it:

```kotlin
// Compile-time error - x cannot be null
val x: String = null

// Compile-time error - y can be null!
val y: String? = null
y.length()

// Ok, y has type String inside the "if" branch
val len = if (y != null) y.length() else 0

// Shorter syntax
val len = y?.length() ?: 0
```

At the JVM level, these variables are both of the `String` type. The Kotlin compiler handles the types differently, but when interacting with Java there are some limits. Generally, there is no information about whether a Java function returns null or not; however, the Kotlin compiler can use the `@Nullable` and `@NotNull` annotations. If these are missing though, the Kotlin compiler will assume the return type is nullable, unless explicitly told that it isn't (for example, by declaring a variable to be of a non-nullable type). In my experience, I would say that the Kotlin compiler does the correct thing and the limitations aren't a big problem.

# Conclusions

The JVM is a _huge_ platform, running a significant part of the world's economy and infrastructure - and of course, it runs [over 70% of all smartphones worldwide](https://gs.statcounter.com/os-market-share/mobile/worldwide). The pace of progress has increased in the past decade, and we have gotten much better performances from the JVM itself, and a lot of improvements in the Java language.

Kotlin has taken the world by storm and is hugely popular. Personally, I like it so much that I would **not consider using Java for any new project**. Kotlin is a much better language, and - in particular - the null safety feature alone would make me choose to use Kotlin every time - the number of bugs it avoids _really_ is significant.

In the [next part]({% ref "2022-11-30-languages-opinion-part-2-rust" %}), I am going to discuss one of the most interesting languages ever - Rust! Stay tuned, and thanks for reading.
