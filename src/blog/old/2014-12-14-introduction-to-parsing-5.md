---
date: 2014-12-14T14:44:24Z
tags:
- c++
- parsing
title: Introduction to Parsing - 5
aliases: [/introduction-to-parsing-5]
series: ["Introduction to parsing"]
---


In the [last part]({% ref "2014-12-07-introduction-to-parsing-4.markdown" %}) we have improved our parser so that it can now handle basic arithmetics and floating number. This time, we'll teach it how to call functions!

### Identifiers in the lexer

Our lexer is currently working with this grammar:

```plaintext
token : number | OPERATOR;

number : DIGIT [DIGIT]* ['.' DIGIT*];

OPERATOR: '+' | '-' | '*' | '/' | '(' | ')';

DIGIT: '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9';
```

To add support for functions, we are going to add a new rule:

```plaintext
identifier : IDENTIFIER_START IDENTIFIER_PART*;
```

where:

```plaintext
IDENTIFIER_START : 'A-Za-z';

IDENTIFIER_PART: 'A-Za-z0-9';
```

With these rules we have allowed identifiers to contain digits, but not in the first position: they must start with a letter.

Our `token` rule changes as follows:

```plaintext
token : number | identifier | OPERATOR;
```

Let's [see the code](https://github.com/andreabergia/parsing-tutorial/commit/2d7c556075cebf5d20a9033d424f1293fc5f0a6f). First we have to define a new token type:

```cpp
enum class TokenType
{
    OPERATOR,
    NUMBER,
    IDENTIFIER,			// This is the new one
    END_OF_INPUT
};
```

We can now add some simple tests:

```cpp
    CASE("lexing 'sin x'") {
        std::istringstream input{"sin x"};
        Lexer lexer(input);
        EXPECT(lexer.hasNextToken());

        EXPECT(lexer.nextToken() == Token(TokenType::IDENTIFIER, "sin"));
        EXPECT(lexer.hasNextToken());

        EXPECT(lexer.nextToken() == Token(TokenType::IDENTIFIER, "x"));
        EXPECT_NOT(lexer.hasNextToken());
    },

    CASE("lexing 'cos (3 * x ) + sin x'") {
        std::istringstream input{"cos (3 * x ) + sin x"};
        Lexer lexer(input);
        EXPECT(lexer.hasNextToken());

        EXPECT(lexer.nextToken() == Token(TokenType::IDENTIFIER, "cos"));
        EXPECT(lexer.nextToken() == Token(TokenType::OPERATOR, "("));
        EXPECT(lexer.nextToken() == Token(TokenType::NUMBER, "3"));
        EXPECT(lexer.nextToken() == Token(TokenType::OPERATOR, "*"));
        EXPECT(lexer.nextToken() == Token(TokenType::IDENTIFIER, "x"));
        EXPECT(lexer.nextToken() == Token(TokenType::OPERATOR, ")"));
        EXPECT(lexer.nextToken() == Token(TokenType::OPERATOR, "+"));
        EXPECT(lexer.nextToken() == Token(TokenType::IDENTIFIER, "sin"));
        EXPECT(lexer.nextToken() == Token(TokenType::IDENTIFIER, "x"));

        EXPECT_NOT(lexer.hasNextToken());
    },
```

Modifying the lexer so that it passes the tests is quite simple. As we can see, the rule for `identifier` is quite similar to the one for `number`. Similarly, the new function `parseIdentifier` is quite similar to the old `parseNumber`:

```cpp
Token Lexer::parseIdentifier()
{
    // Add the first character to the identifier
    std::string identifier{next_};
    advance();

    // Match more identifier parts
    while (!atEof_ && isIdentifierPart(next_)) {
        identifier += next_;
        advance();
    }

    skipSpaces();
    return Token(TokenType::IDENTIFIER, identifier);
}

bool Lexer::isIdentifierStart(char candidate) const
{
    return std::isalpha(candidate);
}

bool Lexer::isIdentifierPart(char candidate) const
{
    return isIdentifierStart(candidate) || std::isdigit(candidate);
}
```

We also have to change `nextToken` to handle the new rule:

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
    } else {
        return parseOperator();
    }
}
```

With this changes, we can pass the tests!

### Functions in the parser

Now that we have support for identifiers in our lexer, we can move to the parser. For the moment we are going to have a static catalog of functions; eventually we'll let the user extend it. For us, a "function" in our language will be a C++ function taking one `double` and returning a `double`:

```cpp
    using doubleToDoubleFunction = double(*)(double);
```

This is a relatively new syntax introduced in C++11. It means that `doubleToDoubleFunction` is a pointer to a function taking a `double` and returning a `double`. Using C and C++98's syntax, we would have written this:

```cpp
    typedef double(*doubleToDoubleFunction)(double);
```

Personally I find the new syntax quite nice and readable.
Moving on, we are going to define the catalog of functions supported as this:

```cpp
    std::map<std::string, doubleToDoubleFunction> functions_ {
        {"exp", std::exp},
        {"log", std::log},
        {"sin", std::sin},
        {"cos", std::cos},
        {"tan", std::tan}
    };
```

Here we are using two new C++11 constructs at once. By using an [initializer list](http://en.cppreference.com/w/cpp/language/list_initialization) we can immediately fill our map, which is a great improvement over the C++98 syntax. Furthermore, we are initializing a member variable directly at the member's declaration, and not in the constructor. This is only a cosmetic change, but a [very welcome one](http://www.stroustrup.com/C++11FAQ.html#member-init), especially in classes with many constructors.

Let's now focus on the grammar. How are we going to extend it to allow function calls? Let's first think about some examples: we definitely want `sin 3` to be a valid function call. But what about `sin 3 * x`? It's quite reasonable to interpret it either as `(sin 3) * x` or as `sin( 3 * x )`. We are going to settle for the first alternative, mostly because we'd like to interpret the (similar) case `sin 3 + x + y` as `(sin 3) + x + y` rather than any other alternatives. So, the new grammar is going to be as follows:

```plaintext
expression: term [ ('+'|'-') term ]*;

term : factor [ ('*'|'/') factor]*;

factor :   NUMBER
         | '(' expression ')'
         | function-call;

function-call: identifier factor;
```

We have defined `function-call` to be an `identifier`, i.e. the function name, followed by a _factor_. With this definition, we've implemented the rules we defined above. Furthermore, this syntax allows quite natural expressions such as `sin(42)`, since `(42)` is a valid factor.
If we had decided that we wanted `sin 3 * x` to mean `sin( 3 * x )`, we could have done  it quite easily by changing  the `function-call` definition to be an `identifier` followed by a _term_.

Anyway, time [for the code](https://github.com/andreabergia/parsing-tutorial/commit/b55ee5de8414f9f0903a1cb263191e5974ecd57e). The new tests are as follows:

```cpp
    CASE("parsing 'exp 1") {
        std::istringstream input{"exp 1"};
        Parser parser(input);

        EXPECT(approx(M_E) == parser.evalNextExpression());
    },

    CASE("parsing 'foo 1") {
        std::istringstream input{"foo 1"};
        Parser parser(input);

        EXPECT_THROWS_AS(parser.evalNextExpression(), UnknownFunctionName);
    },

    CASE("parsing 'sin(2 * 3.141592653)") {
        std::istringstream input{"sin(2 * 3.141592653)"};
        Parser parser(input);

        EXPECT(approx(0.) == parser.evalNextExpression());
    },

    CASE("parsing 'exp") {
        std::istringstream input{"exp"};
        Parser parser(input);

        EXPECT_THROWS_AS(parser.evalNextExpression(), InvalidInputException);
    }
```

We have also defined a trivial new exception class `UnknownFunctionName`, to be thrown when the user attempts to call an invalid function.

In the actual parser code, we first have changed `evalNextFactor` to match the updated grammar:

```cpp
double Parser::evalNextFactor()
{
    if (nextToken_.getTokenType() == TokenType::NUMBER) {
        double value = atof(nextToken_.getContent().c_str());
        advance();
        return value;
    } else if (nextToken_.getTokenType()  == TokenType::OPERATOR
        && nextToken_.getContent() == "(") {
        return evalNextParenthesisFactor();
    } else if (nextToken_.getTokenType() == TokenType::IDENTIFIER) {
        return evalNextFunctionCall();
    } else {
        throw InvalidInputException("Found an unexpected token: " + nextToken_.getContent());
    }
}
```

Then we have written the new `evalNextFunctionCall` and a simple helper function:

```cpp
double Parser::evalNextFunctionCall() {
    // Match the function name
    std::string functionName = nextToken_.getContent();
    advance();

    // Is it a valid function?
    doubleToDoubleFunction f = lookupFunctionByName(functionName);

    // Eval its argument
    double argumentValue = evalNextFactor();

    // Call the function!
    return f(argumentValue);
}

Parser::doubleToDoubleFunction Parser::lookupFunctionByName(const std::string &name)
{
    auto it = functions_.find(name);
    if (it == functions_.end()) {
        throw UnknownFunctionName(name);
    }
    return it->second;
}
```

I hope the `evalNextFunctionCall` code is clear. The code in `lookupFunctionByName` is a bit more C++-esque than usual, so it might require a bit of explanation.

Most of the C++ standard library, including the standard containers such as [`std::vector`](http://www.cplusplus.com/reference/vector/vector/) or [`std::map`](http://www.cplusplus.com/reference/map/map/), work with the concept of _iterators_. Iterators are usually specified in pairs, with the first pointing to the first item of a range and the second pointing to _one past the last item_. Most containers have two member functions, `begin`, and `end`, which return iterators to the first and the (invalid) one-past-the-last items respectively. To see an example:

```cpp
std::vector<char> v { 'a', 'b', 'c'};
f(v.begin(), v.end());       // the whole vector
f(v.begin(), v.begin() + 1); // a range containing [a]
f(v.begin(), v.begin() + 2); // a range containing [a, b]
f(v.begin(), v.begin());     // an empty range
```

To return to our code, `std:map` has a function [`find`](http://www.cplusplus.com/reference/map/map/find/), which returns an iterator to the searched item or [`map::end`](http://www.cplusplus.com/reference/map/map/end/) if the item could not be found. The last piece of the puzzle is that `it->second`: map's iterators are instances of [`std::pair`](http://www.cplusplus.com/reference/utility/pair/), which is a simple class in the C++ standard library representing a pair of object, with two members: `first` and `second`. For map's iterators, `first` points to the key and `second` to the value. I hope this clarifies `lookupFunctionByName`.

### Conclusions

Our parser has learnt how to call functions. Next time, we'll add to it the ability to handle variables!
