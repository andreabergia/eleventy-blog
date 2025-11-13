---
date: 2014-12-21T22:28:57Z
tags:
- c++
- parsing
title: Introduction to Parsing - 6
aliases: [/introduction-to-parsing-6]
series: ["Introduction to parsing"]
---

{% postSeries %}

In the [last part]({% ref "2014-12-14-introduction-to-parsing-5.markdown" %}) we have taught our parser how to handle function calls. For this time variables were promised... but it turns out we have some details to handle before we can get to them. Onwards!

### Programs

There are two issues that we need to iron out before we can successfully parse variables: one conceptually simple but long to implement, which will be the subject of this post, and one shorter but more complex that we'll leave for next time.

The first problem is that, at the moment, our parser is only able to handle one-line expressions. If we are going to implement variables, we need to extend it to be able to handle _more_ lines: otherwise, how are we going to refer to the created variables? So, the first preliminary thing we need to do is to teach it how to handle newlines.

Again, we are going to start our work in the lexer. The current grammar is this:

```plaintext
token : number | identifier | OPERATOR;

number : DIGIT [DIGIT]* ['.' DIGIT*];

identifier : IDENTIFIER_START IDENTIFIER_PART*;

OPERATOR: '+' | '-' | '*' | '/' | '(' | ')';

DIGIT: '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9';

IDENTIFIER_START : 'A-Za-z';

IDENTIFIER_PART: 'A-Za-z0-9';
```

Now we are going to add a new rule:

```plaintext
end-of-line: '\n';
```

and we are going to change `token` to:

```plaintext
token : number | identifier | end-of-line | OPERATOR;
```

The changes [to the code](https://github.com/andreabergia/parsing-tutorial/commit/2669d9499002397ebd9412ba1b9260522467c52e) shouldn't yield many suprises by now: we start by adding a new token type:

```cpp
enum class TokenType
{
    OPERATOR,
    NUMBER,
    IDENTIFIER,
    END_OF_LINE,		// This is the new one
    END_OF_INPUT
};
```

We also add a simple test:

```cpp
CASE("lexing 'a\n3'") {
        std::istringstream input{"a\n3"};
        Lexer lexer(input);
        EXPECT(lexer.hasNextToken());

        EXPECT(lexer.nextToken() == Token(TokenType::IDENTIFIER, "a"));
        EXPECT(lexer.nextToken() == Token(TokenType::END_OF_LINE, ""));
        EXPECT(lexer.nextToken() == Token(TokenType::NUMBER, "3"));

        EXPECT_NOT(lexer.hasNextToken());
    }
```

And finally we modify the lexer code: we start by creating some new methods:

```cpp
bool Lexer::isEol(char candidate) const
{
    return candidate == '\n';
}

Token Lexer::parseNewLine()
{
    advance();
    skipSpaces();
    return Token(TokenType::END_OF_LINE, "");
}
```

Then we can add the new case to the `nextToken` method:

```cpp
Token Lexer::nextToken()
{
    if (atEof_) {
        return Token(TokenType::END_OF_INPUT, "");
    }

    if (std::isdigit(next_)) {
        return parseNumber();
    } else if (isIdentifierStart(next_)) {
        return parseIdentifier();
    } else if (isEol(next_)) {
        return parseNewLine();
    } else {
        return parseOperator();
    }
}
```

Finally, we notice that we have to modify `skipSpaces` so that it doesn't skip newlines:

```cpp
void Lexer::skipSpaces()
{
    while (!atEof_ && !isEol(next_) && std::isspace(next_)) {
        advance();
    }
}
```

With these simple changes, we are done.

### Windows-style newlines

Since we would like for our code to work correctly on Windows, it would be nice if it was able to handle windows-style end of lines. We are going to do this by changing the grammar to this:

```plaintext
token : number | identifier | end-of-line | OPERATOR;

number : DIGIT [DIGIT]* ['.' DIGIT*];

identifier : IDENTIFIER_START IDENTIFIER_PART*;

OPERATOR: '+' | '-' | '*' | '/' | '(' | ')';

DIGIT: '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9';

IDENTIFIER_START : 'A-Za-z';

IDENTIFIER_PART: 'A-Za-z0-9';

end-of-line: '\r'? '\n';
```

(where we have used `?` to denote "optionally"). This gives us a somewhat strange behaviour: it means that our lexer will handle mixed-style lines (e.g. a line ending with `\n` and the following with `\r\n`). This might be a desiderable feature or a bug, depending on the case. Since it is simple to implement, we'll take it. :-) The [code changes](https://github.com/andreabergia/parsing-tutorial/commit/33b466e290e294b7bfb10ddaf156bc675b7b9195) are few:

```cpp
bool Lexer::isEol(char candidate) const
{
    return candidate == '\n' || candidate == '\r';
}

Token Lexer::parseNewLine()
{
    if (next_ == '\r') {
        advance();
        if (next_ != '\n') {
            throw InvalidInputException("Expected a \n after a \r");
        }
    }
    advance();
    skipSpaces();
    return Token(TokenType::END_OF_LINE, "");
}
```

We also need to add a couple trivial tests that you can check out [on github](https://github.com/andreabergia/parsing-tutorial/commit/33b466e290e294b7bfb10ddaf156bc675b7b9195).

### Programs

It is time to teach our parser to handle multiple-lines programs. We are going to add these new rule to our parser's grammar:

```plaintext
program: [end-of-line]* [expression end-of-line+]*
```

Meaning: a `program` can start with as many `end-of-line` as the user wants. Then it must contain a sequence of one `expression`, followed by at least one `end-of-line`.

We will modify our parser so that, for each expression parsed, it will print out its value. Since we want to be able to check what the program printed in the unit tests, [we'll make](https://github.com/andreabergia/parsing-tutorial/commit/a2a5cf66fdefe7b900e692d2571e7595e0bc87ce) the parser take a generic `std::ostream` object in the constructor:

```cpp
class Parser
{
public:
    Parser(std::istream& istream, std::ostream &ostream = std::cout);

    void parseProgram();
    double evalNextExpression();            // Unchanged
private:
    std::ostream &ostream_;

    // Rest unchanged
};
```

Next thing up, as usual, are the tests:

```cpp
std::string parseProgramOutput(std::string program)
{
    std::ostringstream output;
    std::istringstream input{program};
    Parser parser(input, output);
    parser.parseProgram();

    // Normalize EOL to unix style
    return replaceAll(output.str(), "\r\n", "\n");
}

const lest::test testParser[] = {
    // as before

    CASE("parsing program 1 should print 1 EOL") {
        EXPECT("1\n" == parseProgramOutput("1"));
    },

    CASE("parsing program 1 + 2 EOL 1 + 3 should print 3 EOL 4 EOL") {
        EXPECT("3\n4\n" == parseProgramOutput("1 + 2\n1 + 3\n"));
    },

    CASE("parsing program EOL 3 EOL EOL 4 should print 3 EOL 4 EOL") {
        EXPECT("3\n4\n" == parseProgramOutput("\n3\n\n4"));
    }
};
```

In the various tests we are calling the parser with some simple programs, making the parser write to a [`std::ostringstream`](http://www.cplusplus.com/reference/sstream/ostringstream/) object instead that on the standard output, and checking that the printed output is what we expected. If you check out the committed code, you will see that we also did some refactoring to the older parser tests.

The modifications to the parser shouldn't be too surprising now, given how we have written the grammar. The core method is the new `parseProgram`:

```cpp
void Parser::parseProgram()
{
    while (hasNextToken_) {
        skipNewLines();
        double value = evalNextExpression();
        ostream_ << value << std::endl;
        parseNewLine();
    }
}
```

Parsing a program means skipping over new lines, parsing an expression and then a new line. Just as the grammar said. :-)

we have created also a simple helper method:

```cpp
void Parser::parseNewLine()
{
    if (!hasNextToken_) {
        // We consider an end of file to be OK.
        return;
    }
    if (nextToken_.getTokenType() != TokenType::END_OF_LINE) {
        throw InvalidInputException("Expected a newline");
    }
    advance();
}
```

It shouldn't come as a surprise that, as usual, the new `parseNewLine` method maintains the class invariant by calling `advance` at the end.

### What about `main`?

It's time to modify a bit our `main` function. [This is the new version:](https://github.com/andreabergia/parsing-tutorial/commit/3966a908d093b0bf0cfccb6d0e87718b0868e733)

```cpp
int main(int argc, char *argv[])
{
    Parser parser(std::cin, std::cout);
    parser.parseProgram();
    return 0;
}
```

With this changes, we have a beginning of a [REPL](https://en.wikipedia.org/wiki/Read%E2%80%93eval%E2%80%93print_loop) in our program! Sadly, it's quite disappointing: given how we handle the lookahead character and token, when the user enters something like `42<ENTER>` the program waits for _another_ expression (or an `<ENTER>`) before printing the expression's value. Basically, the program is always one line late with respect to the input. This is rather annoying, but we aren't going to focus too much on this since fixing it would require changing quite a bit how our parser and lexer work, and a REPL isn't the focus of this series.

### Conclusions

Our parser is now able to handle simple "programs", meaning lists of arithmetic expressions. It may not look like much, but it was a required step towards our objectives. Next time: variables. I promise. :-)
