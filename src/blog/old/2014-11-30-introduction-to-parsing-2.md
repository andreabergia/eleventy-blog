---
date: 2014-11-30T13:43:46Z
tags:
- c++
- parsing
title: Introduction to Parsing - 2
aliases: [/introduction-to-parsing-2]
series: ["Introduction to parsing"]
---


In the [last post]({% ref "2014-11-24-introduction-to-parsing-1.markdown" %}) we have started working on our parser for our very simple mathematical language. Specifically, we focused on the _lexer_, the part of code that divides the input into tokens. In this part, we are going to extend our lexer a bit and start writing the parser. Let's dive in!

### Handling spaces

The lexer we wrote last time was very simple. In fact, it didn't even support spaces inside the input! So, now, let's start by extending it a bit so that it can handle spaces correctly.

Since we have designed our lexer around the invariant "we have a pointer referring to the next available character", we can handle spaces quite easily: we just change slightly the invariant so that it reads "we have a pointer referring to the next _not blank_ available character".

You can see the full code for this version of the parser [here](https://github.com/andreabergia/parsing-tutorial/tree/v2) and the diff [here](https://github.com/andreabergia/parsing-tutorial/commit/25c11935680b84a44ec7ed0bdb70024b84b5a2ef), but the changes are quite simple. Basically whenever we call `advance` we are also going to call `skipSpaces`, which is defined as follows:

```cpp
void Lexer::skipSpaces()
{
    while (!atEof_ && std::isspace(next_)) {
        advance();
    }
}
```

So, in a method like `parseOperator`, we just [add a call](https://github.com/andreabergia/parsing-tutorial/commit/25c11935680b84a44ec7ed0bdb70024b84b5a2ef#diff-c2b02d03f56ecb2b28ae01d34f47010bR61) to `skipSpaces` after the call to `advance`:

```cpp
Token Lexer::parseOperator()
{
    Token result = Token{OPERATOR, std::string{next_}};
    advance();
    skipSpaces();			// This is the new line
    return result;
}
```

Similar changes are done in `parseNumber`. Note: it might not be obvious, but we also have to call `skipSpaces` in the constructor - again, to preserve the invariant.

### Improved operator handling

Last time, we decided to keep it simple and allow any character as operator. Let's rectify that and allow only a limited subset of operators: for the moment we're going to allow `+`, `-`, `*`, `/`, `(` and `)`. So, [here's the new version](https://github.com/andreabergia/parsing-tutorial/tree/v3) and [here are the relevant changes](https://github.com/andreabergia/parsing-tutorial/commit/db0aa76f9bff9317ca197612b7b188acb3ac6ee2).

What we'll do is simply to check in `parseOperator` if the operator we found is actually a valid one, and throw an exception if it is not:

```cpp
Token Lexer::parseOperator()
{
    std::string nextAsString = std::string{next_};
    if (!validOperators.count(nextAsString)) {
        throw InvalidInputException("Invalid operator type: " + next_);
    }
    Token result = Token(TokenType::OPERATOR, nextAsString);
    advance();
    skipSpaces();
    return result;
}
```

### Let's parse stuff!

It's finally time to leave the lexer and start working on the actual _parsing_, meanining interpreting the input and doing something with it. For the moment, we're going to keep it very simple and just handle the input as it were an expression resulting in an integer. The full code for this version is [here](https://github.com/andreabergia/parsing-tutorial/tree/v4).

Let's start and check out our `Parser` class in all its "glory":

```cpp
class Parser
{
public:
    Parser(std::istream &istream);

    int evalNextExpression();

private:
    Lexer lexer_;
};
```

We are also going to add some tests to our parser, none of which will pass for the moment:

```cpp
const lest::test testParser[] = {
    CASE("parsing '13'") {
        std::istringstream input{"13"};
        Parser parser(input);
        EXPECT(13 == parser.evalNextExpression());
    },

    CASE("parsing '1 + 23'") {
        std::istringstream input{"1 + 23"};
        Parser parser(input);
        EXPECT(24 == parser.evalNextExpression());
    },

    CASE("parsing '3 * 2 + 1'") {
        std::istringstream input{ "3 * 2 + 1" };
        Parser parser(input);
        EXPECT(7 == parser.evalNextExpression());
    },

    CASE("parsing ' (1 + 23) *   4 '") {
        std::istringstream input{" (1 + 23) *   4 "};
        Parser parser(input);
        EXPECT(96 == parser.evalNextExpression());
    },

    CASE("parsing '((2 + 3) * (3 + 4))") {
        std::istringstream input{"((2 + 3) * (3 + 4))"};
        Lexer lexer(input);
        Parser parser(input);

        EXPECT(42 == parser.evalNextExpression());
    }
};
```

Let's try and make the first one pass. Since we already have our lexer, we can just ask it for the first token, check if it is a number and if it is convert it to an integer and return it. In code:

```cpp
int Parser::evalNextExpression()
{
    Token t = lexer_.nextToken();
    if (t.getTokenType() == TokenType::NUMBER) {
        return atoi(t.getContent().c_str());
    }
    throw InvalidInputException("Found an unexpected token: " + t.getContent());
}
```

If you don't know it, [`atoi`](http://www.cplusplus.com/reference/cstdlib/atoi/) is a function to convert a C string to an integer (its name means "Ascii TO Integer).

With this code, we're passing the first test case: we can handle numbers! While not very impressive yet, we've built some good foundations over which, the next time, we'll implement handling basic arithmetical expressions!
