---
date: 2015-02-15T14:45:21Z
tags:
- c++
- parsing
title: Introduction to Parsing - 14
aliases: [/introduction-to-parsing-14]
series: ["Introduction to parsing"]
---


In this part we'll complete our initial goal, adding the ability to our parser to calculate the symbolic derivative of an user-defined functions. We'll also take a couple of shortcuts to keep the code focused on the parsing, and leave the improvements as "an exercise". :-)

The GitHub commits for this part are [here](https://github.com/andreabergia/parsing-tutorial/commit/0a697453b9d6d34dd50127887e5fcc8a9da378cf) and [here](https://github.com/andreabergia/parsing-tutorial/commit/44903e8fb03af5f344d4f02b37224f63a8189254).

### Calculating the derivative of a Node

Before modifying our parser, we need to be able to calculate the derivative of a function. So, let's start:

```cpp
struct UserFunction {
    std::string name;
    std::string argumentName;
    NodePtr bodyNode;

    NodePtr derivative() const;
};

NodePtr UserFunction::derivative() const
{
    return bodyNode->derivative(argumentName);
}
```

We're going to define the derivative of an user-defined function as the derivative of its body with respect to its argument. So, if we had (for instance) a function `f(x) = sin(x + 2)`, we'd calculate its derivative as the derivative of `sin(x + 2)` with respect to x.

Notice that we have implicitely said that we now require a function named `derivative` implemented in the node, that returns a new `NodePtr` representing the derivative of that node. In code:

```cpp
class Node {
public:
    virtual NodePtr derivative(const std::string &argument) const = 0;

    // Rest as before
};
```

We now only have to implement it for all the various subclasses. This is quite simple, as long as you remember the math. :-) First the tests:

```cpp
    // Derivative
    CASE("Derivative NumberNode") {
        NodePtr node(new NumberNode(0.5));
        EXPECT("0" == node->derivative("x")->toString(ToStringType::TOP_LEVEL));
    },
    CASE("Derivative Variable node") {
        NodePtr node(new VariableNode("x"));
        EXPECT("1" == node->derivative("x")->toString(ToStringType::TOP_LEVEL));
        EXPECT("0" == node->derivative("y")->toString(ToStringType::TOP_LEVEL));
    },
    CASE("Derivative AdditionNode") {
        NodePtr n1(new NumberNode(1));
        NodePtr x(new VariableNode("x"));
        NodePtr node(new AdditionNode(n1, x));
        EXPECT("1 + x" == node->toString(ToStringType::TOP_LEVEL));
        EXPECT("0 + 1" == node->derivative("x")->toString(ToStringType::TOP_LEVEL));
    },
    CASE("Derivative SubtractioNode") {
        NodePtr x(new VariableNode("x"));
        NodePtr n2(new NumberNode(2));
        NodePtr node(new SubtractionNode(x, n2));
        EXPECT("x - 2" == node->toString(ToStringType::TOP_LEVEL));
        EXPECT("1 - 0" == node->derivative("x")->toString(ToStringType::TOP_LEVEL));
    },
    CASE("Derivative MultiplicationNode") {
        NodePtr x(new VariableNode("x"));
        NodePtr y(new VariableNode("y"));
        NodePtr node(new MultiplicationNode(x, y));
        EXPECT("x * y" == node->toString(ToStringType::TOP_LEVEL));
        EXPECT("(1 * y) + (x * 0)" == node->derivative("x")->toString(ToStringType::TOP_LEVEL));
    },
    CASE("Derivative DivisionNode") {
        NodePtr x(new VariableNode("x"));
        NodePtr y(new VariableNode("y"));
        NodePtr node(new DivisionNode(x, y));
        EXPECT("x / y" == node->toString(ToStringType::TOP_LEVEL));
        EXPECT("((1 * y) - (x * 0)) / (y * y)" == node->derivative("x")->toString(ToStringType::TOP_LEVEL));
    },

    CASE("Derivative FunctionCallNode 1") {
        NodePtr x(new VariableNode("x"));
        NodePtr node(new FunctionCallNode("sin", x));
        EXPECT("sin x" == node->toString(ToStringType::TOP_LEVEL));
        EXPECT("(sin' x) * 1" == node->derivative("x")->toString(ToStringType::TOP_LEVEL));
    },
    CASE("Derivative FunctionCallNode 2") {
        NodePtr x(new VariableNode("x"));
        NodePtr n2(new NumberNode(2));
        NodePtr x2(new MultiplicationNode(x, n2));
        NodePtr node(new FunctionCallNode("sin", x2));
        EXPECT("sin (x * 2)" == node->toString(ToStringType::TOP_LEVEL));
        EXPECT("(sin' (x * 2)) * ((1 * 2) + (x * 0))" == node->derivative("x")->toString(ToStringType::TOP_LEVEL));
    }
```

Notice that we are being very "raw" in our derivatives: we're just literally applying the rules without any kind of simplifications. So, for instance, we compute the derivative of `2 * x` as `2 * 1 + 0 * x`. Simplifying this would be pretty much required for any serious mathematical program, but also rather complex since we'd need to introduce a way to understand that a given subnode can be pruned or replaced with something simpler, which is definitely not trivial. Since our focus is on the parsing, we won't implement this.

Furthermore, notice we haven't introduced a way to compute the correct derivative of a function call; we're just using the notation `sin'` to express "call the derivative of `sin`. We aren't going to implement this in our `EvaluationContext`, which means that we won't be able to actually evaluate this kind of nodes (we'd get an error `UnknownFunctionName`). Again, since we want to focus on the parsing and this series is already 14 posts long, we have left this part out. :-)

Now for the implementation. We're going to show only the implementation of `derivative` for each class; the rest is left as it was before:

```cpp
class NumberNode : public Node {
    virtual NodePtr derivative(const std::string &argument) const override {
        return NodePtr(new NumberNode(0));
    }
};

class AdditionNode : public BinaryOpNode {
    virtual NodePtr derivative(const std::string &argument) const override {
        return NodePtr(new AdditionNode(
                left_->derivative(argument), right_->derivative(argument)));
    }
};

class SubtractionNode : public BinaryOpNode {
    virtual NodePtr derivative(const std::string &argument) const override {
        return NodePtr(new SubtractionNode(
                left_->derivative(argument), right_->derivative(argument)));
    }
};

class MultiplicationNode : public BinaryOpNode {
    virtual NodePtr derivative(const std::string &argument) const override {
        // (f g)' = f' g + f g'
        NodePtr f_g = NodePtr(new MultiplicationNode(left_->derivative(argument), right_));
        NodePtr fg_ = NodePtr(new MultiplicationNode(left_, right_->derivative(argument)));
        return NodePtr(new AdditionNode(f_g, fg_));
    }
};

class DivisionNode : public BinaryOpNode {
    virtual NodePtr derivative(const std::string &argument) const override {
        // (f / g)' = (f'g - fg') / g^2
        NodePtr f_g = NodePtr(new MultiplicationNode(left_->derivative(argument), right_));
        NodePtr fg_ = NodePtr(new MultiplicationNode(left_, right_->derivative(argument)));
        NodePtr g2 = NodePtr(new MultiplicationNode(right_, right_));
        NodePtr num = NodePtr(new SubtractionNode(f_g, fg_));
        return NodePtr(new DivisionNode(num, g2));
    }
};

class VariableNode : public Node {
    virtual NodePtr derivative(const std::string &argument) const override {
        if (varName_ == argument) {
            return NodePtr(new NumberNode(1));
        } else {
            return NodePtr(new NumberNode(0));
        }
    }
};

class FunctionCallNode : public Node {
    virtual NodePtr derivative(const std::string &argument) const override {
        // f(g)' = f'(g) g'
        NodePtr f_g = NodePtr(new FunctionCallNode(funcName_ + "'", argumentExpression_));
        NodePtr g_ = argumentExpression_->derivative(argument);
        return NodePtr(new MultiplicationNode(f_g, g_));
    }
};
```

With this change, our new tests pass.

### Extending the parser

To keep things simple, we're going to add only one new kind of statement to our grammar:

```plaintext
derivative: 'der' identifier;
```

We're going to allow the user to write `der f`, and we'll respond by printing out the derivative of the user-defined function `f` with respect to its argument. We could have rather easily allowed the user to calculate the derivative of any expression towards any variable, given that our nodes support it; feel free to implement it as an exercise if you'd like. :-)

The new test is very simple, if a bit complex to read:

```cpp
    // Program with derivatives
    CASE("parsing program def f x = 2 * x - sin(x) EOL der f EOL should print ((0 * x) + (2 * 1)) - ((sin' x) * 1)") {
        EXPECT("((0 * x) + (2 * 1)) - ((sin' x) * 1)\n" == parseProgramOutput("def f x = 2 * x - sin(x)\nder f\n"));
    }
```

The changes necessary to allow this test to pass are as follows: we need to add support for this new statement kind in `parseProgram`:

```cpp
void Parser::parseProgram()
{
    while (hasNextToken()) {
        skipNewLines();

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
        } else if (hasNextTokens(2)
                && getNextToken().getTokenType() == TokenType::IDENTIFIER
                && getNextToken().getContent() == "der"
                && getNextToken(1).getTokenType() == TokenType::IDENTIFIER) {
            parseDerivative();
        } else {
            parseExpression();
        }
        parseNewLine();
    }
}
```

and write the new `parseDerivative` function:

```cpp
void Parser::parseDerivative()
{
    match(TokenType::IDENTIFIER, "der", "the keyword der");

    // Match function name
    if (!hasNextToken() || getNextToken().getTokenType() != TokenType::IDENTIFIER) {
        throw InvalidInputException("Found an unexpected token: " + getNextToken().getContent());
    }
    std::string functionName = getNextToken().getContent();
    advance();

    // Find the function
    auto it = userDefinedFunctions_.find(functionName);
    if (it == userDefinedFunctions_.end()) {
        throw UnknownFunctionName(functionName);
    }
    UserFunctionPtr func = it->second;

    // Derive and print it
    NodePtr derivative = func->derivative();
    ostream_ << derivative->toString(ToStringType::TOP_LEVEL) << std::endl;
}
```

That's it!

### Conclusions

We have finally reached the end of our series: we have written a relatively short program that is able to evaluate simple arithmetical expressions and compute their symbolic derivatives.

A lot could be done to "finish" the program, like at least improving the REPL, implementing the derivatives of built-in function calls and perhaps even implementing the simplification of nodes (to print `x` instead of things like `1 * x + 0 * 1`), but we're going to conclude the series here. Thanks for reading it!
