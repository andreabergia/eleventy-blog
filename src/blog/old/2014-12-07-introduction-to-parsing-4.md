---
date: 2014-12-07T17:23:26Z
tags:
- c++
- parsing
title: Introduction to Parsing - 4
aliases: [/introduction-to-parsing-4]
series: ["Introduction to parsing"]
---


In the [last part]({% ref "2014-12-02-introduction-to-parsing-3.markdown" %}) we have started making some real changes on our little parser, giving it the ability to handle basic arithmetics such as the four basic operations. In this part, we are going to teach it to handle parenthesis and floating numbers. Let's dive in!

### Parenthesis

Last time, we left our parser with this grammar.

```plaintext
expression: term [ ('+'|'-') term ]*;

term : factor [ ('*'|'/') factor]*;

factor : NUMBER;
```

Let us now think about how we are going to modify it to handle parenthesis. The first thing to notice is that we want parenthesis to have an higher priority than sums and multiplications. Therefore, we know we will have to modify something in the `factor` definition. Furthermore, we want to be able to put additions, multiplications and other parenthesis inside parenthesis. A grammar that lets us handle all that is the following:

```plaintext
expression: term [ ('+'|'-') term ]*;

term : factor [ ('*'|'/') factor]*;

factor :   NUMBER
         | '(' expression ')';
```

The change from the previous one is that, now, a `factor` can be *either* a number *or* an open parenthesis, followed by an expression, followed by a closed parenthesis. If you think about some examples, you'll see that this grammar can handle our requirements.

Implementing this change is [quite simple:](https://github.com/andreabergia/parsing-tutorial/commit/2d1e59d043a68ba92ac26eda46d6c32260160b85) specifically, we just have to change our `evalNextFactor` method to this:

```cpp
int Parser::evalNextFactor()
{
    if (nextToken_.getTokenType() == TokenType::NUMBER) {
        int value = atoi(nextToken_.getContent().c_str());
        advance();
        return value;
    } else if (nextToken_.getTokenType()== TokenType::OPERATOR
        && nextToken_.getContent() == "(") {
        // We match the '(' via advance; parse an expression; then match the ')'
        advance();

        int value = evalNextExpression();

        if (!hasNextToken_
            || nextToken_.getTokenType() != TokenType::OPERATOR
            || nextToken_.getContent() != ")") {
            throw InvalidInputException("Expected a closed parenthesis but found token: " + nextToken_.getContent());
        }
        advance();

        return value;
    }
    else {
        throw InvalidInputException("Found an unexpected token: " + nextToken_.getContent());
    }
}
```

And with this change, we can now handle correctly expressions such as `((2 + 3) * (3 + 4))`. It's a good start. ;-)

### Floating points - writing the tests

Let us now extend our parser so that it can handle floating points. First we're going [to add some tests](https://github.com/andreabergia/parsing-tutorial/commit/f66d1cb0c518527ce31686481f039e8392b0ff0f) to our parser and lexers, and to replace `int` with `double` in our parser code:

```cpp
const lest::test testLexer[] = {
    // ... as before

    CASE("lexing '3.14'") {
        std::istringstream input{"3.14"};
        Lexer lexer(input);
        EXPECT(lexer.hasNextToken());

        EXPECT(lexer.nextToken() == Token(TokenType::NUMBER, "3.14"));

        EXPECT_NOT(lexer.hasNextToken());
    },

    // ... as before

    CASE("lexing '2.3 * 1 + 4'") {
        std::istringstream input{"2.3 * 1 + 4"};
        Lexer lexer(input);
        EXPECT(lexer.hasNextToken());

        EXPECT(lexer.nextToken() == Token(TokenType::NUMBER, "2.3"));
        EXPECT(lexer.nextToken() == Token(TokenType::OPERATOR, "*"));
        EXPECT(lexer.nextToken() == Token(TokenType::NUMBER, "1"));
        EXPECT(lexer.nextToken() == Token(TokenType::OPERATOR, "+"));
        EXPECT(lexer.nextToken() == Token(TokenType::NUMBER, "4"));
        EXPECT_NOT(lexer.hasNextToken());
    },

    // ... as before
};

const lest::test testParser[] = {
    // ... as before
    CASE("parsing '3.14'") {
        std::istringstream input{"3.14"};
        Parser parser(input);
        EXPECT(approx(3.14) == parser.evalNextExpression());
    },

    // ... as before

    CASE("parsing '1.5 + 1 / 2") {
        std::istringstream input{"1.5 + 1 / 2"};
        Parser parser(input);

        EXPECT(approx(2) == parser.evalNextExpression());
    },

    // ... as before
};
```

### Floating points - passing the tests

Writing the tests was the easy part; we now have to think about how we are going to actually fix the code. The answer, however, is quite simple: if we modify our lexer so that it can handle floating points as a `NUMBER` token, just as it did with integers, the parser will almost work. We only need to do a small change: we have to [replace the call](https://github.com/andreabergia/parsing-tutorial/commit/abfdff2fe7e1282e70e15f5301cf2cf256f3e2e5) to `atoi` with one to `atof`:

```cpp
        double value = atof(nextToken_.getContent().c_str());
```

Since we have already changed the various `int` to `double` in the various function return types, that's all we have to do for the parser.

Finally, only the lexer needs to be fixed. Our lexer is currently working with this grammar:

```plaintext
token : number | OPERATOR;

number : DIGIT [DIGIT]*;

OPERATOR: '+' | '-' | '*' | '/' | '(' | ')';

DIGIT: '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9';
```

We can teach it to handle floats by changing the `number` definition:

```plaintext
number : DIGIT [DIGIT]* ['.' DIGIT*];
```

Basically we have now definied `number` to be a `DIGIT`, followed optionally by a sequence of digits, followed optionally by a dot and an (optionally empty) sequence of `DIGITs`. This means that we can handle things like `789`, `123.456`, `0.123` or `3.`. This also means that we *cannot* handle `.42` (floats where the integer part is omitted), which is rather common in many programming languages. This is left as an exercise for the reader. :-)

Let's see [the code:](https://github.com/andreabergia/parsing-tutorial/commit/d3d8cccb75aabb245c5df233cf86f666508f312f)

```cpp
Token Lexer::parseNumber()
{
    std::string num;

    // Integer part
    while (!atEof_ && isdigit(next_)) {
        num += next_;
        advance();
    }

    // Dot and floating part?
    if (!atEof_ && next_ == '.') {
        num += '.';
        advance();
        while (!atEof_ && isdigit(next_)) {
            num += next_;
            advance();
        }
    }

    skipSpaces();
    return Token(TokenType::NUMBER, num);
}
```

### Conclusions

We have now a reasonable parser, able to parse basic arithmetic expressions. The next time, we'll try to teach it how to handle function calls, such as `exp 3` or `cos(3.14)`.
