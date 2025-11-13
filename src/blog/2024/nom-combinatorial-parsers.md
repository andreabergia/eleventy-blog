---
date: 2024-01-30T21:00:00+01:00
tags:
  - parsing
  - rust
  - compiler
title: Playing with Nom and parser combinators
---

I usually write parsers by starting from a grammar and either coding a lexer/parser by hand or relying on tools such as the fantastic [Antlr](https://www.antlr.org/). However, a friend recently introduced me to [parser combinators](https://en.wikipedia.org/wiki/Parser_combinator), which I found to be very interesting and useful.
It's not a recent idea, but it was new to me, and I have found it to be very interesting and useful.

I have played a bit with a great Rust library called [nom](https://github.com/rust-bakery/nom), and I had a lot of fun with it. In this post, I will try to explain the core ideas of parser combinators and the `nom` library by building a tiny JSON parser.

# Introduction to nom

## Basic parsing functions

The idea behind parser combinators is to start by building small functions that will either recognize a basic elements or return an error. Then, you combine them with higher-level functions and voilà, you have parsed the whole input. `nom` comes with a lot of small functions and general-purpose combinators already built.

Let's start with an example. We want to recognize the string `"null"`:

```rust
fn tag_sample(json: &str) -> IResult<&str, &str> {
    tag("null")(json)
}
```

The `tag` function in `nom` is a higher-level function - it takes a string as argument, and will return a parser function that can recognize that string as input. Then, we apply the resulting function to the input string.

The result of a parser in `nom` is an [`IResult`](https://docs.rs/nom/latest/nom/type.IResult.html), which is simply a `Result<(T1, T2), Err>`. If the parser fails, `nom`'s built-in parsers will return an error with information about the input location and the problem.

If the parser succeeds, it will return a tuple, where the first element will be the "remainder" of the input, i.e. the new position in the input string. The remainder will be used to invoke the following parser, until everything has been consumed. The second element of the tuple will be the parsed value. We will see later how to use this to generate your model or AST.

Let's write a simple test for the function above to clarify:

```rust
#[cfg(test)]
#[test]
fn test_tag_sample() {
    assert_eq!(Ok(("", "null")), tag_sample("null"));
    assert_eq!(Ok((" rest", "null")), tag_sample("null rest"));
    assert!(tag_sample("not null").is_err());
}
```

In the first case, the parser matches the whole input, so the remainder returned is simply the empty string. In the second case, we have some remainder. The last case tests what happens when recognition fails.

## Combining parsers

So far, so good. But, the real power comes from _combining_ parsers. A typical example is to parse two or more things in a sequence: this can be done via the [`tuple`](https://docs.rs/nom/latest/nom/sequence/fn.tuple.html) combinator (or [`pair`](https://docs.rs/nom/latest/nom/sequence/fn.pair.html) if you have exactly two elements):

```rust
// Note: not idiomatic code, we'll improve it later
fn parse_hello_world(json: &str) -> IResult<&str, ()> {
    let hello = tag("hello");
    let space = tag(" ");
    let world = tag("world");
    let mut hello_world = tuple((hello, space, world));

    let value = hello_world(json)?;
    Ok((value.0, ()))
}
```

Here we first build three different parsers using `tag`, and then build a new one, called `hello_world`, by combining them. The combined parser will succeed only if all the three basic ones succeed in a row, i.e. if we can recognize the sequence `hello world`. Otherwise, it will fail. Notice that we need to pass a _tuple_ to `tuple`, which is why we have the double set of parentheses.

Obviously, this is not very interesting, because we could have just used a `tag("hello world")` parser. So, let's see a more intriguing combinator:

```rust
fn recognize_boolean(json: &str) -> IResult<&str, &str> {
    alt((
        tag("true"),
        tag("false"),
    ))(json)
}
```

[`alt`](https://docs.rs/nom/latest/nom/branch/fn.alt.html) is a very useful parser - it will attempt to execute all the given parsers in order and stop whenever one succeeds. Therefore, this parser is capable of recognizing _either_ the string `true` or `false`.

Another useful combinator is `delimited`, which can be used like this:

```rust
delimited(char('('), take(2), char(')'))
```

This will parse a string that starts with `(`, then has two characters, and ends with `)`. The result of the parser will be the two characters in the middle, so for `(ab)cd` it will return `Ok(("cd", "ab"))` (i.e. the resulting value will _not_ contain the delimiters).

There are _a lot_ of basic parser functions and combinators built-in in `nom`; you can check out a very helpful cheat sheet [here](https://github.com/rust-bakery/nom/blob/main/doc/choosing_a_combinator.md).

## Mapping values

There are a couple of very useful functions that I haven't discussed yet. The first one is [`map`](https://docs.rs/nom/latest/nom/combinator/fn.map.html). This function takes a parser and a function and will apply the function to the result of the parser, i.e. the second value of the tuple if the underlying parser returned `Ok`. For example:

```rust
fn parse_boolean(json: &str) -> IResult<&str, bool> {
    alt((
      map(tag("true"), |_| true), 
      map(tag("false"), |_| false))
    )(json)
}

#[cfg(test)]
#[test]
fn can_parse_boolean() {
    assert_eq!(Ok(("", true)), parse_boolean("true"));
    assert_eq!(Ok(("", false)), parse_boolean("false"));
    assert!(parse_boolean("not a bool").is_err());
}
```

Since we are not really using the value returned by the underlying parser here, rather than using `map` and the `_` placeholder we can also use the [`value`](https://docs.rs/nom/latest/nom/combinator/fn.value.html) combinator (which for some reason the argument swapped with respect to `map`):

```rust
fn parse_boolean(json: &str) -> IResult<&str, bool> {
    alt((
      value(true, tag("true")), 
      value(false, tag("false")))
    )(json)
}
```

# Parsing JSON with nom

Let us now apply this basic knowledge of the `nom` library and try to write a JSON parser. Let's start with the model:

```rust
/// Representation of a node in the json tree
#[derive(Debug, PartialEq, Clone)]
enum JsonNode<'a> {
    Object(Box<IndexMap<&'a str, JsonNode<'a>>>),
    Array(Vec<JsonNode<'a>>),
    String(&'a str),
    Number(f64),
    Boolean(bool),
    Null,
}
```

I'm using [`IndexMap`](https://docs.rs/indexmap/latest/indexmap/) here because we want to preserve the order of the keys in the object. I'm also using an `'a` explicit lifetime to inform the borrow checker that we are not doing allocations or string copies, but just relying on slices of the original input.

Parsing JSON is quite simply done via the `alt` combinator:

```rust
fn parse_json(json: &str) -> IResult<&str, JsonNode> {
    alt((
        parse_object,
        parse_array,
        parse_number,
        parse_string,
        parse_boolean,
        parse_null,
    ))(json)
}
```

Let's start with the simple ones:

```rust
fn parse_null(json: &str) -> IResult<&str, JsonNode> {
    // Simplest case: a literal value
    value(JsonNode::Null, tag("null"))(json)
}


fn parse_boolean(json: &str) -> IResult<&str, JsonNode> {
    // A boolean is the literal true or false
    alt((
        value(JsonNode::Boolean(true), tag("true")),
        value(JsonNode::Boolean(false), tag("false")),
    ))(json)
}


/// Parses a string and wraps it into a JsonNode
fn parse_string(json: &str) -> IResult<&str, JsonNode> {
    map(parse_string_inner, JsonNode::String)(json)
}

/// Parses a string and returns it "raw", without building a JsonNode
fn parse_string_inner(json: &str) -> IResult<&str, &str> {
    // A string is delimited by quote marks. Here we do
    // not handle Unicode or escape characters, but 
    // take a look at https://github.com/rust-bakery/nom/blob/main/examples/string.rs
    delimited(tag("\""), take_until("\""), tag("\""))(json)
}
```

Hopefully, [`take_until`](https://docs.rs/nom/latest/nom/bytes/complete/fn.take_until.html) is self-explanatory. Now, let's focus on arrays:

```rust
fn parse_array(json: &str) -> IResult<&str, JsonNode> {
    map(
        // An array is delimited by []
        delimited(
            tag("["),
            // and contains a list of entries separated
            // by comma (','), optionally empty
            separated_list0(
              delimited(multispace0, tag(","), multispace0),
              parse_json),
            tag("]"),
        ),
        JsonNode::Array,
    )(json)
}
```

Here we are using [`separated_list0`](https://docs.rs/nom/latest/nom/multi/fn.separated_list0.html) and [`multispace0`](https://docs.rs/nom/latest/nom/character/complete/fn.multispace0.html) - these and quite other functions exist in two variants, where `0` generally means "zero or more times", whereas `1` requires at least one occurrence.

Finally, we can take a look at parsing objects:

```rust
fn parse_object(json: &str) -> IResult<&str, JsonNode> {
    map(
        // An object is delimited by {}
        delimited(
            tag("{"),
            // and contains a list of entries separated
            // by comma (','), optionally empty
            separated_list0(
                tag(","),
                // each entry is made of two parts:
                // key and value, separated by colon (':')
                separated_pair(
                    delimited(multispace0, parse_string_inner, multispace0),
                    tag(":"),
                    delimited(multispace0, parse_json, multispace0),
                ),
            ),
            tag("}"),
        ),
        |v| JsonNode::Object(Box::new(v.into_iter().collect())),
    )(json)
}
```

Here we are using the super powerful Rust standard function [`collect`](https://doc.rust-lang.org/std/iter/trait.Iterator.html#method.collect) to transform the result of the parsing, which will be a `Vec` of tuples where the first entry will be the key and the second the value, into an `IndexMap`.

You can see the complete code [here](https://github.com/andreabergia/nom-json).

# Conclusions

`nom` is a very interesting library. It can be used to parse not only strings, as we have done, but also binary formats by simply using things like `&[u8]` instead of `&str`. The idea takes a bit to get used to (unless you are an expert in functional programming I guess), but it is very powerful - and fun! Its documentation is also very good, and there are a lot of examples in the repository.

As usual, thanks for reading this post. 🙏
