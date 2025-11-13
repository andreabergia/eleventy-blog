---
date: 2023-05-01T14:40:00+02:00
tags:
  - languages
title: Error handling patterns
featured: 3
---

Error handling is a fundamental aspect of programming. Unless you are writing "hello world", you will need to handle errors in your code. In this post, I will discuss a bit the most common approaches used by various programming languages.

## Return error codes

This is one of the most ancient strategies - if a function can fail, it can simply return an error code - often a negative number, or `null`. This is extremely common in C, for example:

```c
FILE* fp = fopen("file.txt" , "w");
if (!fp) {
  // some error occurred
}
```

This approach is very simple, both to implement and to understand. It is also extremely efficient to execute, as it just involves a standard function call, with a return value - no runtime support or allocations are necessary. However, it has a few drawbacks:

- it is easy for users of the functions to forget about error handling. For example, `printf` in C _can_ fail, but I have not seen many programs checking its return code!
- it is annoying to propagate errors up the call stack, especially if your code has to handle multiple different failures (opening a file, writing to it, reading from another one...)
- unless your programming language supports multiple return values, it is annoying if you have to return a valid value _or_ an error. This leads to many functions in C and C++ having to pass the storage for the "sucess" return value as a pointer that will be filled by the function, doing something like:

```c
my_struct *success_result;
int error_code = my_function(&success_result);
if (!error_code) {
  // can use success_result
}
```

[Go](https://go.dev/) has famously chosen this approach for its error handling. However, since Go allows multiple return values from a function, this pattern becomes a bit more ergonomic - and _very_ common:

```go
user, err = FindUser(username)
if err != nil {
    return err
}
```

The Go variant on the pattern is simple, effective, and gets you error propagation to the caller. On the other hand, I feel like it is quite repetitive and a bit distracting from the actual business logic. I have not written enough Go to know if that impression goes away after a while, though! 😅

## Exceptions

Exceptions are probably the most commonly used pattern of error handling. The `try/catch/finally` approach works quite well and it is pretty simple to use. Exceptions became extremely popular during the 90s and 2000s and have been adopted by many languages such as Java, C#, or Python.

Compared with error codes, exceptions have some advantages:

- they naturally lead to a separation between the "happy path" and the error-handling path
- they will automatically bubble up through the call stack
- and you _cannot_ forget to handle errors!

However, they also have some disadvantages: they require some specific runtime support and are generally quite a performance overhead. Furthermore, and much more importantly, they have a "far-reaching" effect - an exception could be thrown by some code and caught by an exception handler very far away in the call stack, hurting clarity.

Also, it is not obvious whether a function will throw any exceptions just by looking at its signature.

C++ tried to fix this with the `throws` cause, which was so little used that it ended up being [deprecated in C++17](https://en.cppreference.com/w/cpp/language/except_spec) and removed in C++20. It has since tried to introduce [`noexcept`](https://en.cppreference.com/w/cpp/language/noexcept_spec), but I haven't written enough modern C++ to know how popular it is.

Java famously tried to use ["checked exceptions"](https://www.baeldung.com/java-checked-unchecked-exceptions), i.e. exceptions that you _had_ to declare as part of the signature - but that approach was considered such a failure that modern frameworks like Spring only use "runtime exceptions", and JVM languages such as Kotlin [got rid of the concept](https://kotlinlang.org/docs/exceptions.html#the-nothing-type) altogether. In the end, there is no good way to know whether a method call will or will not throw any exception, and thus you end up with a bit of a mess.

## Error callbacks

Another approach, very common in the JavaScript land, is to use [callbacks](https://kotlinlang.org/docs/exceptions.html#the-nothing-type) that will be invoked when a function succeeds or fails. This is often combined with asynchronous programming, where I/O is done in the background without blocking the execution flow.

For example, it's quite common for Node.JS I/O functions to take a callback with two arguments `(error, result)`, e.g.:

```javascript
const fs = require('fs');
fs.readFile('some_file.txt', (err, result) => {
  if (err) {
    console.error(err);
    return;
  }

  console.log(result);
});
```

However, this approach often leads to the so-called ["callback hell"](http://callbackhell.com/) problem, since a callback might need to invoke more asynchronous I/O, which in turn needs more callbacks and so on, ending up with messy and hard-to-follow code.

Modern version of JavaScript have tried to make code more readable by introducing [_promises_](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise):

```javascript
fetch("https://example.com/profile", {
      method: "POST", // or 'PUT'
})
  .then(response => response.json())
  .then(data => data['some_key'])
  .catch(error => console.error("Error:", error));
```

The final step in the promises pattern has been the adoption by JavaScript of the `async/await` pattern, popularized [by C#](https://learn.microsoft.com/en-us/dotnet/csharp/asynchronous-programming/async-scenarios), which makes asynchronous I/O end up looking quite like synchronous code with classical exceptions:

```javascript
async function fetchData() {
  try {
    const response = await fetch("my-url");
    if (!response.ok) {
      throw new Error("Network response was not OK");
    }
    return response.json()['some_property'];
  } catch (error) {
    console.error("There has been a problem with your fetch operation:", error);
  }
}
```

Using callbacks for error handling is an important pattern to know, not only in JavaScript - people have been using it in C for ages, for example. Still, it is not very common anymore - chances are you will be using some form of `async/await`.

## Result from functional languages

The last pattern I want to discuss has its origin in functional languages, such as [Haskell](https://hackage.haskell.org/package/base-4.18.0.0/docs/Data-Either.html), but it has become a bit more mainstream given the explosion of popularity of [Rust](https://andreabergia.com/blog/2022/11/languages-opinion-part-two-rust/).

The idea is to have a type `Result` such as:

```rust
enum Result<S, E> {
  Ok(S),
  Err(E)
}
```

This is a type that has two variants - one expresses success, and the other a failure. A function that returns a result will either return the `Ok` variant, optionally with some data, or the `Err` variant with some error details. The caller of the function will then typically use pattern matching to handle both cases.

To bubble up errors in the call stack, you would typically write code like this:

```rust
let result = match my_fallible_function() {
  Err(e) => return Err(e),
  Ok(some_data) => some_data,
};
```

This pattern is so common that Rust introduced a whole _operator_ in the language (the question mark `?`) to simplify the code above:

```rust
let result = my_fallible_function()?;   // Notice the "?"
```

The advantage of this approach is that it makes error handling both explicit and type-safe, as the compiler ensures that every possible outcome is handled.

In languages that support it, `Result` is typically [a monad](https://en.wikipedia.org/wiki/Monad_(functional_programming)), which allows for composing functions that may fail without having to use try/catch blocks or nested if statements.

# Conclusions

Depending on the programming language you use and your project, you will end up using mostly or exclusively one of these patterns.

I would say that the `Result` pattern is my favourite one, though. Of course, its adoption is not limited to functional languages - for example, at my employer [lastminute.com](https://lastminute.com/) we use the [Arrow](https://arrow-kt.io/) library in Kotlin, which contains a type `Either` heavily inspired by Haskell. I do plan to write a post about it, so thanks for reading this and stay tuned 😊.