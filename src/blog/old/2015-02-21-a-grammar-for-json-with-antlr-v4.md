---
date: 2015-02-21T16:19:07Z
tags:
- parsing
- antlr
title: A grammar for JSON with ANTLR v4
aliases: [/a-grammar-for-json-with-antlr-v4]
---

Now that we've completed our [introduction to parsing]({% ref "2014-11-24-introduction-to-parsing-1.markdown" %}), let's start to see how a real grammar looks like. In this post we're going to write a grammar for about the simplest "language" I could think of: [JSON](http://json.org/).

I'm going to use [ANTLR v4](http://www.antlr.org/)'s syntax. ANTLR is a great tool for generating parsers from grammars, used in a lot of real world projects. From the [ANTLR about page](http://www.antlr.org/about.html):

> ANTLR is a powerful parser generator that you can use to read, process, execute, or translate structured text or binary files. It’s widely used in academia and industry to build all sorts of languages, tools, and frameworks. Twitter search uses ANTLR for query parsing, with over 2 billion queries a day. The languages for Hive and Pig, the data warehouse and analysis systems for Hadoop, both use ANTLR. Lex Machina uses ANTLR for information extraction from legal texts. Oracle uses ANTLR within SQL Developer IDE and their migration tools. NetBeans IDE parses C++ with ANTLR. The HQL language in the Hibernate object-relational mapping framework is built with ANTLR.

So, let's get started. A JSON document can either represent an object or an array, so:

```
grammar JSON;

json: object | array;
```

An `object` starts with a `{` and ends with a `}`, and can contain an arbitrary number of pairs of key and values, separated by `,`. So:

```
object: '{' pair (',' pair)* '}
      | '{' '}'
      ;
```

To avoid allowing a trailing comma (meaning: `{a:1,}` should be invalid), we have handled the empty object as a special case.

A `pair` is given by the key (a string) and a value, so:

```
pair: STRING ':' value;
```

A `value` can be any valid JSON data type: objects, arrays, numbers, strings, booleans and null. So:

```
value: STRING
     | NUMBER
     | object
     | array
     | 'true'
     | 'false'
     | 'null'

```

An `array` starts with a `[`, ends with a `]` and contains a list of values separated by commas. So:

```
array: '[' value (',' value)* ']'
     | '[' ']'
     ;
```

Just as with `object`, we have handled the empty array as a special case.

The only two rules we are now missing are `NUMBER` and `STRING`. Let's start with numbers: in JSON binary, octal, hexadecimal formats are not allowed, meaning that `0123` is not valid. Numbers can be given in scientific form, that is, with an exponent, so `1.23e4` and `-2e-4` are both valid numbers. So:

```
number: '-'? INT '.' [0-9]+ EXP?
      | '-'? INT EXP?
      ;

fragment INT: '0' | [1-9] [0-9]*;
fragment EXP: [Ee] [+\-]? INT;
```

This is a bit more complicated, so let's go through it slowly. The first line says that a number can optionally start with a minus sign. Afterwards comes an `INT`, followed by a dot, a sequence of digits and optionally an `EXP`. The second line is very similar, except that it doesn't include the decimal part.

In ANTLR, [fragments](https://stackoverflow.com/questions/6487593/what-does-fragment-means-in-antlr) are just a shortcut. They don't create a new token type, as the top-level rules do, but are simply a way to give a name to a short, reusable part of a rule. Here we are defining two framgments: the first, `INT`, allow for either zero or a sequence of digits not starting with zero. The second, `EXP`, allows for a lower or uppercase 'e', followed optionally by either a `+` or `-` (which has to be escaped, since it is inside a pair of `[]` and finally for an `INT`.

The last thing we need are `STRINGS`. Strings are contained between a pair of `"`, can contain any character except `"`, but they can contain an escape sequence. Valid escape sequences are `\b`, `\f`, `\n`, `\r`, `\t`, `\\`, '\"` or `\uXXXX`, where `XXXX` are hexadecimal digits. So:

```
STRING: '"' (ESC | ~["\\])* '"';
fragment ESC: '\\' (["\\/bfnrt] | UNICODE);
fragment UNICODE : 'u' HEX HEX HEX HEX;
fragment HEX : [0-9a-fA-F];
```

So: a `STRING` is given by a `"`, followed by any number of characters that aren't `"` or `\\`, or by an escape sequence, followed by a `"`. The rest should be clear.

Finally, we need to be able to handle whitespace. This can be done in ANTLR via the special syntax `-> skip`, which instructs ANTLR's lexer to ignore the input:

```
WS: [ \t\n\r]+ -> skip;
```

Putting everything together, we obtain [the complete grammar](https://github.com/antlr/grammars-v4/blob/master/json/JSON.g4).
