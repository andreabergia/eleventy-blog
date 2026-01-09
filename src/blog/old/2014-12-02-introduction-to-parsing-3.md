---
date: 2014-12-02T22:16:54Z
tags:
- c++
- parsing
title: Introduction to Parsing - 3
aliases: [/introduction-to-parsing-3]
series: ["Introduction to parsing"]
---


In the [last part]({% ref "2014-11-30-introduction-to-parsing-2.markdown" %}) we have continued working on our little parser. Specifically, we have improved the lexer and started creating the parser, so that it is now able to handle simple numbers. Let's teach it some arithmetic now!

### Grammars

A common tool when discussing parsing are [_grammars_](https://en.wikipedia.org/wiki/Parsing_expression_grammar). Grammars are a code-like representation of how the parser works. There are quite a few tools, such as the [lex/yacc](http://dinosaur.compilertools.net/) duo and [Antlr](http://www.antlr.org/), that can generate a lexer and a parser automatically from a grammar descrition, but we won't cover that now.

Anyway, let's see a simple example:

```plaintext
expression : NUMBER;
```

This roughly means that an `expression` is made of a single `NUMBER` token, which is what we have implemented last time:


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

### Additions and subtractions

Let's now improve our parser so that it can handle additions and subtractions. To do that, we'll start by rewriting the grammar, and then adapting the code. As we'll see, writing the code _after_ we have written the grammar will turn out to be quite simpler - in fact, as we have mentioned, thre are quite a few tool that automate this. So, here's the updated grammar:

```plaintext
expression: term [ ('+'|'-') term ]*;

term : NUMBER;
```

This roughly reads:

- an `expression` is made of a `term`, followed by zero or more repetitions of `+` or `-` symbols and a `term`;
- a term is a `NUMBER` token.

In [code:](https://github.com/andreabergia/parsing-tutorial/commit/a3bda21a241ca6aa2b7561c890936bef774c0442)

```cpp
int Parser::evalNextExpression()
{
    // First handle multiplication and parenthesis
    int value = evalNextTerm();

    // Next handle additions and subtractions.
    while (lexer_.hasNextToken()) {
       value = handleAdditionSubtraction(value);
    }
    return value;
}

int Parser::evalNextTerm()
{
    Token t = lexer_.nextToken();
    if (t.getTokenType() == TokenType::NUMBER) {
        return atoi(t.getContent().c_str());
    }
    throw InvalidInputException("Found an unexpected token: " + t.getContent());
}

int Parser::handleAdditionSubtraction(int currValue)
{
    Token t = lexer_.nextToken();
    if (t.getTokenType() == TokenType::OPERATOR) {
        if (t.getContent() == "+") {
            return currValue + evalNextTerm();
        } else if (t.getContent() == "-") {
            return currValue - evalNextTerm();
        } else {
            throw InvalidInputException("Found an invalid operator: " + t.getContent());
        }
    } else {
        throw InvalidInputException("Found an unexpected token: " + t.getContent());
    }
}
```

With this code, we pass the first tests about additions and subtractions! Woo!

### Multiplications and divisions

The code above is a good start. However, it has a subtle issue that will become apparent when we'll try to implement multiplications and divisions.

Let's try to design the grammar first: we have to write it in a way so that `*` has a higher precedence than `+`, since `1+2*3` means `1+(2*3)`. The way to do it looks very simple, but it's actually rather deep:

```plaintext
expression: term [ ('+'|'-') term ]*;

term : factor [ ('*'|'/') factor]*;

factor : NUMBER;
```

The change from the previous time is that the `term` is now defined as a sequence of multiplications or divisions of `factors`. This gives us implicitely the precedence: before parsing an addition we'll have parsed all the multiplications! If we try to represent the behaviour of a parser when handling `1+2*3`, we can see it has to follow roughly this sequence:

```plaintext
Stack           To parse   Parsed     Comment
expression      1+2*3                 start parsing the term
  term                                start parsing the factor
    factor                            parse a NUMBER
    factor      +2*3       1          return
  term                                we don't have a * or /: return
expression      2*3        1+         parse the + and start parsing a term
  term                                start parsing a factor
    factor                            parse a NUMBER
    factor      *3         1+2        return
  term          3          1+2*       match the * and parse a factor
    factor                            parse a NUMBER
    factor                 1+2*3      return
  term                                no more * or /: return
expression                            no more + or -: return
```

### First implementation

If we try to implement our new grammar in a similar way as before, we'll hit a problem, as we can see in [this commit:](https://github.com/andreabergia/parsing-tutorial/commit/b25aafa8ecc3075b7b5e530634e1637d1a1f817e)

```cpp
int Parser::evalNextTerm()
{
    // First handle numbers and parenthesis
    int value = evalNextFactor();

    // Next handle multiplications and divisions.
    while (lexer_.hasNextToken()) {
        value = handleMultiplicationDivision(value);
    }
    return value;
}

int Parser::evalNextFactor()
{
    Token t = lexer_.nextToken();
    if (t.getTokenType() == TokenType::NUMBER) {
        return atoi(t.getContent().c_str());
    }
    throw InvalidInputException("Found an unexpected token: " + t.getContent());
}

int Parser::handleMultiplicationDivision(int currValue)
{
    Token t = lexer_.nextToken();
    if (t.getTokenType() == TokenType::OPERATOR) {
        if (t.getContent() == "*") {
            return currValue + evalNextTerm();
        }
        else if (t.getContent() == "/") {
            return currValue - evalNextTerm();
        }
        else {
            throw InvalidInputException("Found an invalid operator: " + t.getContent());
        }
    }
    else {
        throw InvalidInputException("Found an unexpected token: " + t.getContent());
    }
}
```

The problem appears when parsing expressions like `3*2+1`: the term will have attempted to match the `+` and given us an error! What we need is for the term to handle an operator _only_ if it's of a correct type (`*` and `/`). How can we implement it?

### Lookahead token

What we need, similarly to what we did for our lexer, is to have a _lookahead token:_ a reference to the next available token. This makes sense, because actually our lexer, if we ignore whitespaces, can be thought of as a simple parser following this grammar:

```plaintext
token : number | OPERATOR;

number : DIGIT [DIGIT]*;

OPERATOR: '+' | '-' | '*' | '/' | '(' | ')';

DIGIT: '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9';
```

So, let's add a lookahead token and [fix our parser:](https://github.com/andreabergia/parsing-tutorial/commit/6dd3520febf97d8c5e1ff5ab6099e14bf856beec)

```cpp
class Parser
{
    // as before
private:
    Token nextToken_{TokenType::END_OF_INPUT, ""};
    bool hasNextToken_{false};
};
```

Again, we'll mantain the invariant "`nextToken` always refers to the next token". We'll also add a special token type, `END_OF_INPUT`, to represent "no more data available".

Armed with this, we can write our simple `advance` method:

```cpp
void Parser::advance()
{
    if (lexer_.hasNextToken()) {
        nextToken_ = lexer_.nextToken();
        hasNextToken_ = true;
    } else {
        nextToken_ = Token(TokenType::END_OF_INPUT, "");
        hasNextToken_ = false;
    }
}
```

Now we are ready to adapt the parsing of expressions and factors. The new version, which works correctly and passes our unit tests, is:

```cpp
int Parser::evalNextExpression()
{
    // First handle multiplication and parenthesis
    int value = evalNextTerm();

    // Next handle additions and subtractions. They have lower precedences, so they are handled AFTER.
    while (hasNextToken_ && nextToken_.getTokenType() == TokenType::OPERATOR) {
        if (nextToken_.getContent() == "+") {
            advance();
            value += evalNextTerm();
        } else if (nextToken_.getContent() == "-") {
            advance();
            value -= evalNextTerm();
        } else {
            // An operator, but not '+' or '-': let the caller handle it.
            break;
        }
    }

    return value;
}

int Parser::evalNextTerm()
{
    // First handle numbers and parenthesis
    int value = evalNextFactor();

    // Next handle multiplications and divisions
    while (hasNextToken_ && nextToken_.getTokenType() == TokenType::OPERATOR) {
        if (nextToken_.getContent() == "*") {
            advance();
            value *= evalNextFactor();
        } else if (nextToken_.getContent() == "/") {
            advance();
            value /= evalNextFactor();
        } else {
            // An operator, but not '*' or '/': let the caller handle it.
            break;
        }
    }

    return value;
}

int Parser::evalNextFactor()
{
    Token currToken = nextToken_;
    if (currToken.getTokenType() == TokenType::NUMBER) {
        advance();
        return atoi(currToken.getContent().c_str());
    }
    throw InvalidInputException("Found an unexpected token: " + currToken.getContent());
}
```

If you try to match the code with the grammar, you'll see they follow the exact same structure: when parsing an `expresison` we start by handling a `term`. Then, if we can, we match a `+` or `-` and another `term`, and so on. When we find something which is not a `+` or `-`, we stop parsing the expression. Parsing `terms` follows more or less the same structure.

### Next time...

In the next time, we'll extend our parser to handle parenthesis. If you wanna try to write the code for yourself, think about how you'd express in the grammar the fact that parenthesis have an higher precedence than the other operators...

### Post scriptum

The kind of parser we're writing is called a [recursive descent parser](https://en.wikipedia.org/wiki/Recursive_descent_parser). Our grammar is [`LL(1)`](https://en.wikipedia.org/wiki/LL_parser), meaning it can be parsed by _one_ lookahead token and so our parser does not require backtracking. Wikipedia has a good, if a bit complex, introduction.

[Antlr](http://www.antlr.org/) is an excellent recursive descent parser generator, used for real-world languages such as Groovy. Here's an [excellent example](https://stackoverflow.com/questions/1931307/antlr-is-there-a-simple-example) of an ANTLR grammar just slightly more powerful than ours (which can handle parenthsis too ;-)). [Here's](https://github.com/antlr/grammars-v4) a very long list of example ANTLR grammars.
