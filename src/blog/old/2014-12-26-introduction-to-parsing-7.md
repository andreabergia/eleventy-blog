---
date: 2014-12-26T16:03:28Z
tags:
- c++
- parsing
title: Introduction to Parsing - 7
aliases: [/introduction-to-parsing-7]
series: ["Introduction to parsing"]
---

{% postSeries %}

In the [last part]({% ref "2014-12-21-introduction-to-parsing-6.markdown" %}) we have worked on some preliminary changes to our parser to handle variables. In this part, we will actually make our parser understand variables!

### Grammar changes and more lookahead tokens

After a [couple](https://github.com/andreabergia/parsing-tutorial/commit/d7d3226ed9b8d059b5ce6ba191fd8f841e83fad6) of [clean-up](https://github.com/andreabergia/parsing-tutorial/commit/0153b9adb52890f11173a3ac0e57d7d42876cccf) commits, we are ready to start extending our parser. The grammar is currently this:

```plaintext
program: [end-of-line]* [expression end-of-line+]*

expression: term [ ('+'|'-') term ]*;

term : factor [ ('*'|'/') factor]*;

factor :   NUMBER
         | '(' expression ')'
         | function-call;

function-call: identifier factor;
```

Let us now think about how we want to use variables. These should all be valid expressions:

```plaintext
z + 3 * (4 + 7)
a + b
sin 42
```

Unfortunately, the last expression is going to give us some problems: where we'd see an identifier, we'd have to decide whether it is a variable or a function name and, in the second case, parse it as a function call. This is not impossible, but it's a bit harder than the alternative we'll use.

To simplify the problem, we are going to refuse expressions such as `sin 42` and _require_ parenthesis after a function name, for function calls. This means on one hand that now the user would have to write `sin(42)`; on the other, that we can distinguish more easily between a variable reference and a function call.

Thus, our grammar will become:

```plaintext
program: [end-of-line]* [expression end-of-line+]*

expression: term [ ('+'|'-') term ]*;

term : factor [ ('*'|'/') factor]*;

factor :   NUMBER
         | variable
         | '(' expression ')'
         | function-call;

variable: identifier;

function-call: identifier '(' factor ')';
```

This is still not a trivial grammar to parse. The problem is now that, to distinguish between a variable and a function call, we have to parse the next *two* tokens: the first will tell us whether we have an identifier and the second to check for the opening parenthesis.

So, [our first commit](https://github.com/andreabergia/parsing-tutorial/commit/2babdf9f886dad0b39dcafcd621bf1c8c0463d4b) won't change the semantics of the grammar yet, but will do the groundwork to allow us two lookahead tokens:

```cpp
class Parser {
	// as before

    static const int NUM_LOOK_AEAHD_TOKENS = 2;

    Token nextTokens_[NUM_LOOK_AEAHD_TOKENS];

    inline const Token &getNextToken() const { return nextTokens_[0]; }
    inline bool hasNextToken() const { return getNextToken().getTokenType() != TokenType::END_OF_INPUT; }

    // as before
};
```

We are simply going to use an array of available tokens. We have also defined a new `Token` constructor that sets up a token as `END_OF_INPUT`, using the new C++11 feature that allows a constructor to call another constructor (as in Java):

```cpp
class Token {
public:
    Token() : Token(TokenType::END_OF_INPUT, "") {}

    // as before
};
```

In the `Parser` constructor, we are going to prefill as many tokens as the lexer allows up, until we fill up the `nextTokens_` array:

```cpp
Parser::Parser(std::istream& istream, std::ostream &ostream)
    :lexer_(istream), ostream_(ostream)
{
    for (int i = 0; i < NUM_LOOK_AEAHD_TOKENS; ++i) {
        if (lexer_.hasNextToken()) {
            nextTokens_[i] = lexer_.nextToken();
        }
    }
}
```

Finally, in advance we shift the array to the left (so that `nextTokens_[0]` will contain what previously was in `nextTokens_[1]` and so on) and attempt to fill the last position from the lexer:

```cpp
void Parser::advance()
{
    // Shift tokens one position back
    for (int i = 0; i < NUM_LOOK_AEAHD_TOKENS - 1; ++i) {
        nextTokens_[i] = nextTokens_[i + 1];
    }

    // Set last available token
    nextTokens_[NUM_LOOK_AEAHD_TOKENS - 1] =
            lexer_.hasNextToken()
                ? lexer_.nextToken()
                : Token{TokenType::END_OF_INPUT, ""};
}
```

Running the tests allows us to check that we haven't broken anything.

### Referencing variables

It's finally time [to reference variables](https://github.com/andreabergia/parsing-tutorial/commit/a5851b00f3e944e190e3b4dd87c4f47ef4986a08). Let's start with the tests. We are going to have two predefined variables, `e` and `pi`. Other than adding some tests to check references of these variables, we also have to change the existing tests that called functions to ensure that the function call now has parenthesis:

```cpp
    CASE("parsing 'exp (1)") {
        EXPECT(approx(M_E) == parseExpression("exp (1)"));
    },

    CASE("parsing 'foo(1)") {
        EXPECT_THROWS_AS(parseExpression("foo(1)"), UnknownFunctionName);
    },

    CASE("parsing 'e + 1'") {
        EXPECT(approx(M_E + 1) == parseExpression("e + 1"));
    },

    CASE("parsing 'sin(pi)'") {
        EXPECT(approx(0) == parseExpression("sin(pi)"));
    },

    CASE("parsing 'zz'") {
        EXPECT_THROWS_AS(parseExpression("zz"), UnknownVariableName);
    },
```

As you might have guessed, we have added a trivial new `UnknownVariableName` exception:

```cpp
class UnknownVariableName : public std::runtime_error
{
public:
    UnknownVariableName(const std::string name) : runtime_error("Unknown variable: " + name) {
    }
};
```

Similarly to functions, we'll store a simple map between variable names and their values in the parser:

```cpp
class Parser {
    // as before
    std::map<std::string, double> variables_ {
        {"e", M_E},
        {"pi", M_PI}
    };
};
```

To simplify the code a bit, we are going to introduce a `match` function. It is going to check that the next token is what was expected (or throw an exception otherwise) and call `advance` at the end:

```cpp
void Parser::match(TokenType tokenType, std::string content, std::string expected) {
    if (!hasNextToken()
            || getNextToken().getTokenType() != tokenType
            || getNextToken().getContent() != content) {
        throw InvalidInputException("Expected " + expected + " but found token: " + getNextToken().getContent());
    }
    advance();
}
```

With it, we can rewrite `evalNextFunctionCall`:

```cpp
double Parser::evalNextFunctionCall() {
    // Match the function name and the open parenthesis
    std::string functionName = getNextToken().getContent();
    advance();
    match(TokenType::OPERATOR, "(", "an open parenthesis");

    // Is it a valid function?
    doubleToDoubleFunction f = lookupFunctionByName(functionName);

    // Eval its argument and match the closed parenthesis
    double argumentValue = evalNextExpression();
    match(TokenType::OPERATOR, ")", "a closed parenthesis");

    // Call the function!
    return f(argumentValue);
}
```

Notice that we had to change the call to `evalNextFactor` to `evalNextExpression`, otherwise the user wouldn't have been able to write `sin(1 + 3)`! Luckily we had an unit test designed to catch this. :-)

Finally, we can start matching variables. We need to first add the handling in `parseFactor` and then define a new function:

```cpp
double Parser::evalNextFactor()
{
    if (getNextToken().getTokenType() == TokenType::NUMBER) {
        double value = atof(getNextToken().getContent().c_str());
        advance();
        return value;
    } else if (getNextToken().getTokenType()  == TokenType::OPERATOR
        && getNextToken().getContent() == "(") {
        return evalNextParenthesisFactor();
    } else if (getNextToken().getTokenType() == TokenType::IDENTIFIER
            && nextTokens_[1].getTokenType() == TokenType::OPERATOR
            && nextTokens_[1].getContent() == "(") {
        return evalNextFunctionCall();
    } else if (getNextToken().getTokenType() == TokenType::IDENTIFIER) {
        return evalNextVariable();
    } else {
        throw InvalidInputException("Found an unexpected token: " + getNextToken().getContent());
    }
}

double Parser::evalNextVariable() {
    // Match the variable name
    std::string variableName = getNextToken().getContent();
    advance();

    // Lookup its value
    auto it = variables_.find(variableName);
    if (it == variables_.end()) {
        throw UnknownVariableName(variableName);
    }
    return it->second;
}
```

With these changes, the tests are passed!

### Defining new variables

It's time to allow the user to define variables. The changes to the grammar are:

```plaintext
program: [end-of-line]* [statement end-of-line+]*

statement: assignment | expression;

assignment: variable '=' expression;
```

[The tests](https://github.com/andreabergia/parsing-tutorial/commit/df235bf08fed2d051bf9d63633e8661e243e1427) are as follows:

```cpp

    CASE("parsing program a = 3 EOL a * 7 should print 21 EOL") {
        EXPECT("21\n" == parseProgramOutput("a = 3\na * 7\n"));
    },

    CASE("parsing program a = 3 EOL b = a * 7 EOL a = b + 1 EOL a should print 22 EOL") {
        EXPECT("22\n" == parseProgramOutput("a = 3\nb = a * 7\na = b + 1\na"));
    }
```

The changes required to the code are few: while matching a program, if we find an identifier followed by a `=` we match a statement, otherwise an expression. In code:

```cpp

void Parser::parseProgram()
{
    while (hasNextToken()) {
        skipNewLines();

        // Assignment?
        if (hasNextToken()
                && getNextToken().getTokenType() == TokenType::IDENTIFIER
                && nextTokens_[1].getTokenType() == TokenType::OPERATOR
                && nextTokens_[1].getContent() == "=") {
            parseAssignment();
        } else {
            parseExpression();
        }
        parseNewLine();
    }
}
```

The new `parseAssignment` and `parseExpression` functions don't offer many surprises:

```cpp
void Parser::parseAssignment()
{
    // Match variable name
    if (!hasNextToken() || getNextToken().getTokenType() != TokenType::IDENTIFIER){
        throw InvalidInputException("Found an unexpected token: " + getNextToken().getContent());
    }
    std::string variableName = getNextToken().getContent();
    advance();

    // Match =
    match(TokenType::OPERATOR, "=", "the assigment operator =");

    // Get expression value
    double value = evalNextExpression();

    // Save the variable value
    variables_[variableName] = value;
}

void Parser::parseExpression()
{
    double value = evalNextExpression();
    ostream_ << value << std::endl;
}
```

With this changes, we finally have variables in our parser!

### Conclusions

After adding the ability to our parser to call functions and multiple-lines programs, we now gave it the ability to handle variables. Our toy language can finally handle basic mathematics.

The next time we're going to start the groundwork to handle function definitions.
