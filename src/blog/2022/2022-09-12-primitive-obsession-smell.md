---
date: 2022-09-12T20:00:28+02:00
tags:
  - architecture
title: Design - Primitive obsession smell
---

Today we are going to talk a bit about code design. In particular, I wanna talk about a design smell often called _primitive obsession_, and a related technique that can help you improve the code quality.

# Primitive obsession

We'll use the following Java class as the basis of the discussion:

```java
class Book {
    private String isbn;
    private String title;    
    private int year;
}
```

[ISBN](https://en.wikipedia.org/wiki/ISBN) is the international standard for book identifier - basically, it is a globally unique ID assigned to the book.

Notice how we are using the `String` and `int` types for the various properties of the class. This can be a bit of a code smell. Let us discuss why.

Imagine you have this method:

```java
interface BookRepository {
    Optional<Book> findByIsbn(String isbn);
}
```

Again, notice that we are using strings for the ISBN. This means that you can write bugged code like this:

```java
bookRepository.findByIsbn(someBook.getTitle());
```

This is obviously wrong, and you probably have a test that will catch this, but we can do better. In particular, wouldn't it be great if the compiler could help? After all, we already rely on the compiler to help us avoid silly mistakes like that - if your method takes a `Book`, you cannot pass an `Author` to it. So why are we relying so much on strings and ints?

A possible improvement would be to do something like this:

```java
class Isbn { private String value; }
class Year { private int value; }

class Book {
    private Isbn isbn;
    private Title title;
    private Year year;

    class Title { private String value; }
}

interface BookRepository {
    Optional<Book> findByIsbn(Isbn isbn);
}
```

What is the benefit of this? Well, for starters, the bug we had earlier cannot happen anymore:

```java
bookRepository.findByIsbn(someBook.getTitle());     // compilation error
```

This is a big win - the compiler will do the error checking for us, and help us avoid subtle mistakes.

Notice that we made our tiny wrapper classes immutable, which is generally [a good thing](https://blogs.oracle.com/javamagazine/post/java-immutable-objects-strings-date-time-records), not last because immutable objects are always thread-safe.

Another benefit is that now we have a good place to put our validation rules: the constructor of these tiny classes. For example, the constructor of `Year` might want to check that it is a positive value, and the constructor or `Isbn` might check the format. These are checks that previously we would probably have placed in the `Book` class, but they fit better in these small classes.

Furthermore, since we now have proper classes, we can add methods to them - code that we previously might have implemented as static functions in some `Util` class, can now be moved to standard member functions:

```java
// Before
public class IsbnUtils {
    public static void checkIsbn(String isbn) { /* ... */ }
    public static String getRegistrationGroup(String isbn) { /* ... */}
}

// After
public class Isbn {
    private String value;

    public Isbn(String value) {
        checkIsbn(value);
    }

    public String getRegistrationGroup() { /* ... */ }

    /* ... */
}
```

Also note that these tiny objects are _value classes_ - objects which identity does not really matter, because they are immutable and their state cannot change. Thus, in modern version of Java you would and should create them as `record`:

```java
record Isbn(String value) { /* methods */ }
record Year(int value) {}

record Book(
    Isbn isbn,
    Title title,
    Year year)
{
    record Title(String value) {}
}
```

Take a look at the [JEP 395](https://openjdk.org/jeps/395) or at some [explanation by Brian Goetz](https://stackoverflow.com/questions/71473485/what-is-the-difference-between-a-final-class-and-a-record) if you aren't very familiar with records.

# Overhead and comparison with other languages

## Java and Kotlin

Of course, there is a bit of overhead in doing this on the JVM (each object instance has some bytes in overhead - and rather than having one instance of `Book` and two of `String`, you are adding three new objects), but more often than not the tradeoff is worth it. In general, having a cleaner design helps you with maintainability, and that is very often far more important than performances - you generally are I/O bound anyway. Furthermore, with [project Valhalla](https://openjdk.org/projects/valhalla/), value classes like these will become a lot more efficient on the JVM - I plan to cover this in a future blog post 😉.

However, if you are on the JVM but are using Kotlin (and if you aren't using it - why not?!), you can already use [value classes](https://kotlinlang.org/docs/inline-classes.html) with the annotation `@JvmInline`:

```kotlin
@JvmInline
value class Isbn(val title: String)
```

This class would actually exist _only at compile time_, but the compiled bytecode would have a `String` field in the `Book` class, and the `Isbn` class would completely disappear. So, you get all the compile time benefits, but you avoid the runtime overhead. Win-win!

The downside here is that, if you were using the `Book` class from Java, you would actually see the `String` field - therefore, the generally great interoperability between Java and Kotlin would break a bit. But, if you are using only Kotlin in your project, this is a _great_ pattern to use. It will make your code cleaner and safer!

## C++ and .NET

If you are using C++, this is a common pattern - and again, it comes without any memory overhead. The wrapper type (generally modelled as `struct`) would have the same memory layout as the wrapped data type:

```cpp
struct Isbn {
    std::string value;
}
// stored in memory in the same way as the underlying string
```

In general, you will use this with a constructor marked as `explict` to avoid any silent conversion by the compiler.

If you are on .NET, you have had [struct](https://docs.microsoft.com/en-us/dotnet/csharp/language-reference/builtin-types/struct) for ages, and at a memory level they work similarly to C++. Again, you can avoid the overhead.

## Rust

This pattern is so common in [Rust](https://www.rust-lang.org/) that it has a name: the [newtype pattern](https://doc.rust-lang.org/rust-by-example/generics/new_types.html).

```rust
struct Year(i32);
```

The memory layout of this type is the same as the underlying `i32` type, so 4 bytes. If you tried to use it incorrectly, like this:

```rust
fn has_y2k_bug(year: Year) -> bool {
    year.0 == 2000
}

fn main() {
    println!("y2k(1999) = {}", has_y2k_bug(1999));
    println!("y2k(2000) = {}", has_y2k_bug(Year(2000)));
}
```

you would get this _fantastic_ error message from the compiler:

```bash
error[E0308]: mismatched types
 --> src/main.rs:8:44
  |
8 |     println!("y2k(1999) = {}", has_y2k_bug(1999));
  |                                ----------- ^^^^ expected struct `Year`, found integer
  |                                |
  |                                arguments to this function are incorrect
  |
note: function defined here
 --> src/main.rs:3:4
  |
3 | fn has_y2k_bug(year: Year) -> bool {
  |    ^^^^^^^^^^^ ----------
help: try wrapping the expression in `Year`
  |
8 |     println!("y2k(1999) = {}", has_y2k_bug(Year(1999)));
  |                                            +++++    +

For more information about this error, try `rustc --explain E0308`.
```

It even tells you how to fix your code! How cool is that? 🚀

# Further reading

- [here](https://medium.com/the-sixt-india-blog/primitive-obsession-code-smell-that-hurt-people-the-most-5cbdd70496e9) is a good article that focuses on this smell and on value objects
- [ndepend](https://blog.ndepend.com/code-smell-primitive-obsession-and-refactoring-recipes/) has a good and long article
- [refactoring.guru](https://refactoring.guru/smells/primitive-obsession) has a very high-level explanation, but with a lot of links to related code smells and improvement techniques, so it could be good for exploration.
