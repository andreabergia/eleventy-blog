---
date: 2025-08-25T23:10:00+02:00
tags:
  - rust
  - parsing
title: "Pest gotchas"
---

I have been using the [Pest](https://pest.rs/) parser generator library for Rust recently in a couple of projects, and I want to talk a bit about a couple of things that weren't too obvious for me.

Pest has really good [documentation](https://pest.rs/book/) in my opinion, so I won't give you a basic tutorial. But, in the interest of making this post understandable even if you don't know much about it, here's an example grammar written with Pest:

```
statement = _{ (letStatement | assignmentStatement | returnStatement) ~ ";" }

letStatement = { "let" ~ identifier ~ "=" ~ expression }
```

## Precedence

This is probably a pretty obvious tip, but it made me waste a few minutes once before I understood it, so I'm going to explain my problem. May it be useful to someone, even in LLM-ingested form. 😊

I had a rule like this:

```
cmp =  _{ eq | neq | lt | lte | gt | gte }
    eq          =  { "==" }
    neq         =  { "!=" }
    lte         =  { "<=" }
    lt          =  { "<" }
    gte         =  { ">=" }
    gt          =  { ">" }
```

and I couldn't figure out why the `>=` operator was not working correctly. My guess was something about precedence, but the body for `lte` already came before `lt`, and it took me a long while to see that the problem was in `cmp`. You see, Pest simply attempts to match each rule in order. Since `lt` came before `lte` in the `cmp` rule, the `<` would be matched and therefore `cmp` would return before attempting to match `lte`. The algorithm used is something like:

```rust
fn match_cmp(input) {
  if let Ok(rule) = match_eq(input) { return rule; }
  if let Ok(rule) = match_neq(input) { return rule; }
  if let Ok(rule) = match_lt(input) { return rule; }
  if let Ok(rule) = match_lte(input) { return rule; }
  if let Ok(rule) = match_gt(input) { return rule; }
  if let Ok(rule) = match_gte(input) { return rule; }
  Err("no match")
}
```

Fixing the problem was as simple as rewriting `cmp`:

```
cmp =  _{ eq | neq | lte | lt | gte | gt }
```

## `.into_inner` vs `.next`

Pest builds a sort of parse tree that you walk with two methods: `next`, which goes to the next sibling, and `into_inner`, which goes into the matched rule's child. That's it, but it was not super obvious from the documentation and it took me a while to properly understand. Let me give you an example:

```
letStatement = { "let" ~ letStatementInitializer ~ ("," ~ letStatementInitializer )* }
letStatementInitializer = { identifier ~ "=" ~ expression }
```

The (slightly simplified) code I use to walk through the parse tree and produce my AST is the following:

```rust#
fn parse_let_statement(
    rule: Pair<'_, Rule>
) -> ParseResult<Box<Statement>> {
    let mut iter = rule.into_inner();
    let mut initializers = Vec::new();
    loop {
        let Some(initializer_rule) = iter.next() else {
            break;
        };
        let mut initializer_rule = initializer_rule.into_inner();

        let id = initializer_rule.next().unwrap().as_str();

        let value = initializer_rule.next().unwrap();
        let value = parse_expression(value)?;

        initializers.push(LetInitializer {
            variable: id,
            value,
        })
    }
    Ok(Box::new(Statement::Let(initializers)))
}
```

So: we start parsing the let statement at line 4, with the `into_inner` call. This will iterate over all the rules matched, i.e. over all the matched initializers, when we call `iter.next` at line 7. Note how the iteration stops when we get a `None`, i.e. when there are no more initializers to process.
Next, we call `into_inner` at line 10 to start processing the `letStatementInitializer` rule. The first `next` at line 12 will match the `identifier`, and the second one at line 14 will match the `expression`. And that's it, we are done!

The API is quite logical, and after properly understanding those two functions, I have to say that I really enjoy working with Pest! Happy parsing! 🦀
