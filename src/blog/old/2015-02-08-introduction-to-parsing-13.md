---
date: 2015-02-08T16:27:53Z
tags:
- c++
- parsing
title: Introduction to Parsing - 13
aliases: [/introduction-to-parsing-13]
series: ["Introduction to parsing"]
---

{% postSeries %}

In the [last part]({% ref "2015-01-31-introduction-to-parsing-12.markdown" %}) we have set up the stage for user defined functions. In this (short) part, we'll integrate them with our parser. The relevant commit for this post is [here](https://github.com/andreabergia/parsing-tutorial/commit/09975da4fc1eb92cffbe15844349e2daf5a39734).

### Adapting the grammar

At the moment our parser's grammar (excluding the expressions) looks like this:

```plaintext
program: [end-of-line]* [statement end-of-line+]*

statement: assignment | expression;

assignment: variable '=' expression;
```

The syntax we're going to allow for our functions will be:

```plaintext
def [functionName] [argumentName] = expression
```

We're using the `def` keyword to simplify the grammar: we can still parse the grammar with two lookahead tokens. If we had settled on something like `f(x) := expression` we would have had a lot more work to do, since we wouldn't have been able to distinguish easily whether `f (` was a function call or a function definition.

For example, these will all be valid functions:

```plaintext
def f x = 1 + sin(x)
def double x = x * 2
def square y = y * y
```

The new grammar will be as follows:

```plaintext
program: [end-of-line]* [statement end-of-line+]*

statement: assignment | functionDef | expression;

assignment: variable '=' expression;

functionDef: 'def' identifier identifier '=' expression;
```

### Tests

Before seeing the actual parser changes, let's add some unit tests:

```cpp
    // Programs with functions
    CASE("parsing program def f x = 1 + sin(x) EOL f(0) EOL should print 1 EOL") {
        EXPECT("1\n" == parseProgramOutput("def f x = 1 + sin(x)\nf(0)\n"));
    },
    CASE("parsing program def double x = x * 2 EOL def square y = y * y EOL square(double(1)) EOL should print 4 EOL") {
        EXPECT("4\n" == parseProgramOutput("def double x = x * 2\ndef square y = y * y\nsquare(double(1))\n"));
    }
```

In the first test we're going to define a function that calls another builtin function; in the second one we're going to define a function that calls another user defined function. The second tests also checks that argument's name don't really matter, since we exchange `x` and `y` freely.

### Changing the parser

We can finally adapt our parser. First we need to change the statement parsing to this:

```cpp
void Parser::parseProgram()
{
    while (hasNextToken()) {
        skipNewLines();

        // Assignment?
        if (hasNextTokens(2)
                && getNextToken().getTokenType() == TokenType::IDENTIFIER
                && getNextToken(1).getTokenType() == TokenType::OPERATOR
                && getNextToken(1).getContent() == "=") {
            parseAssignment();
        } else if (hasNextTokens(2)
                && getNextToken().getTokenType() == TokenType::IDENTIFIER
                && getNextToken().getContent() == "def"
                && getNextToken(1).getTokenType() == TokenType::IDENTIFIER) {
            parseFunctionDefinition();
        } else {
            parseExpression();
        }
        parseNewLine();
    }
}
```

The second and last step is to write `parseFunctionDefinition`:

```cpp
void Parser::parseFunctionDefinition()
{
    match(TokenType::IDENTIFIER, "def", "the keyword def");

    // Match function name
    if (!hasNextToken() || getNextToken().getTokenType() != TokenType::IDENTIFIER) {
        throw InvalidInputException("Found an unexpected token: " + getNextToken().getContent());
    }
    std::string functionName = getNextToken().getContent();
    advance();

    // Match parameter name
    if (!hasNextToken() || getNextToken().getTokenType() != TokenType::IDENTIFIER) {
        throw InvalidInputException("Found an unexpected token: " + getNextToken().getContent());
    }
    std::string parameterName = getNextToken().getContent();
    advance();

    match(TokenType::OPERATOR, "=", "the = operator");

    // Match function definition
    NodePtr definition = getNextExpressionNode();

    UserFunctionPtr newFunctionDefinition = UserFunctionPtr(new UserFunction {functionName, parameterName, definition});
    userDefinedFunctions_[functionName] = newFunctionDefinition;
}
```

The code should be quite simple: first we parse the various tokens such as the function name, the argument and the function's expression. Finally, we just need to create an `UserFunction` (which we discussed in the [previous part]({% ref "2015-01-31-introduction-to-parsing-12.markdown" %})) and add it to the functions map.

And that's it! All the machinery we have built in the previous parts is now correctly being used and our parser can finally allow the user to define functions!

### Conclusions

We are almost done with our parser - the only thing left to do is to add to it the ability to compute the derivative.
