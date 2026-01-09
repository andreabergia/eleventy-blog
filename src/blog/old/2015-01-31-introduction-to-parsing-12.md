---
date: 2015-01-31T14:53:15Z
tags:
- c++
- parsing
title: Introduction to Parsing - 12
aliases: [/introduction-to-parsing-12]
series: ["Introduction to parsing"]
---


In the [last part]({% ref "2015-01-20-introduction-to-parsing-11.markdown" %}) we have finished adapting our parser to use our AST structure. This time, we're going to work on supporting user-defined functions. The code changes for this part [are here](https://github.com/andreabergia/parsing-tutorial/commit/8ea58fae948003aa46977e21e2997b41a924c037).

### Defining user functions

Currently our parser supports a limited sets of pre-defined functions, implemented in C++ (although actually we have only used functions from the standard library). To extend it to an user-defined function, we have to decide how to represent it. For our purposes, we have chosen to support only functions with exactly one argument.

We are going to define an user function as basically a node (which will contain the expression used to define the function), plus the name of the function and the name of the argument:

```cpp
// An user-defined function has three things: its name, its arguments and the node representing the body
struct UserFunction {
    std::string name;
    std::string argumentName;
    NodePtr bodyNode;
};
using UserFunctionPtr = std::shared_ptr<UserFunction>;

using userFunctionsMap = std::map<std::string, UserFunctionPtr>;
```

We are also renaming the old functions to `builtinFunction`:

```cpp
// A builtinFunction is a pointer to a function taking a double and returning a double
using builtinFunction = double(*)(double);
using builtinFunctionMap = std::map<std::string, builtinFunction>;
```

We need to store the name of the function's parameter because we are going to represent an access to the parameter's value as a simple variable access, to keep things simple. In this way, when we'll want to call the function, we'll create a new "scope" by copying the current one and creating (or updating) a variable named with the argument's name, and with the same value as the argument's.

We are going to move the responsability of the function's call to `EvaluationContext`, from the `FunctionCallNode`. For coherence, we're also going to move the responsability of variable's access to the `EvaluationContext`:

```cpp
class EvaluationContext {
public:

    EvaluationContext(userFunctionsMap userFunctions, variablesMap variables)
        : userFunctions_(userFunctions), variables_(variables) {}

    double getVariableValue(std::string variableName) const;
    double callFunction(std::string functionName, double argument) const;

private:
    userFunctionsMap userFunctions_;
    variablesMap variables_;

    double callUserDefinedFunction(UserFunctionPtr userFunction, double argumentValue) const;
};
```

We'll see later how we'll adapt the nodes. First we're going to dive into the implementation of the new `EvaluationContext`:

```cpp
static builtinFunctionMap builtinFunctions {
        {"exp", std::exp},
        {"log", std::log},
        {"sin", std::sin},
        {"cos", std::cos},
        {"tan", std::tan}
};

double EvaluationContext::getVariableValue(std::string variableName) const {
    auto it = variables_.find(variableName);
    if (it == variables_.end()) {
        throw UnknownVariableName(variableName);
    }
    return it->second;
}

double EvaluationContext::callFunction(std::string functionName, double argumentValue) const
{
    // Is it an user defined function? If so, call it.
    auto it = userFunctions_.find(functionName);
    if (it != userFunctions_.end()) {
        return callUserDefinedFunction(it->second, argumentValue);
    }

    // Is it a builtin function? If so, call it.
    auto bit = builtinFunctions.find(functionName);
    if (bit != builtinFunctions.end()) {
        return bit->second(argumentValue);
    }

    throw UnknownFunctionName(functionName);
}

double EvaluationContext::callUserDefinedFunction(UserFunctionPtr userFunction, double argumentValue) const
{
    // Create an inner evaluation context where the variable "argumentName" is set to "argumentValue"
    // and evaluate the function's expression node
    variablesMap innerScopeVariables = variables_;
    innerScopeVariables[userFunction->argumentName] = argumentValue;
    EvaluationContext innerScope(userFunctions_, innerScopeVariables);
    return userFunction->bodyNode->eval(innerScope);
}
```

The function `getVariableValue` shouldn't be particularly surprising, so let's focus on `callFunction`. We are going to distinguish between user functions and builtin functions, since performing the function call in the two cases is quite different:

- for builtin functions, since they are just standard C++ function pointers, we just invoke it;
- for user-defined functions we create the new "scope", create a variable to store the function's argument and evaluate the function's expression node.

Notice that we create the inner scope by copying the functions maps and the variables, and then setting a variable's value in the new scope. Another option would have been to introduce a concept of "parent" scope, and perform the lexical lookup of a variable's name first in the current scope, and then (recursively) in the parent's. This second choice is basically how Javascript prototypes work. However, since we are not designing a real programming language and we expect a scope to have very few variables, copying everything is just fine.

### Adapting the nodes

We need to change a bit the implementation of the function and variable's nodes:

```cpp
class VariableNode : public Node {
    virtual double eval(EvaluationContext &context) override {
        return context.getVariableValue(varName_);
    }
	// Rest as before
};
```

Since we have moved the responsability of accessing the variable's value to the evaluation context, all `VariableNode` now has to do is to forward the variable's value lookup. Similar changes are needed to `FunctionCallNode`:

```cpp
class FunctionCallNode : public Node {
public:
    FunctionCallNode(const std::string &funcName, NodePtr argumentExpression)
            : funcName_(funcName), argumentExpression_(argumentExpression) {}
    ~FunctionCallNode() {};

    virtual std::string toString(ToStringType toStringType) const override {
        std::string call = funcName_ + " " + argumentExpression_->toString(ToStringType::RECURSIVE_CALL);
        return toStringType == ToStringType::TOP_LEVEL ? call : "(" + call + ")";
    }

    virtual double eval(EvaluationContext &context) override {
        double arg = argumentExpression_->eval(context);
        return context.callFunction(funcName_, arg);
    }

private:
    std::string funcName_;
    NodePtr argumentExpression_;
};
```

### Tests

With some trivial changes, we can check that we haven't broken the existing nodes' tests. Furthermore, we have written some new unit tests for the user defined functions as follows:

{% raw %}
```cpp
const lest::test testEvaluation[] = {
    CASE("Calling the builtin function exp 1") {
        // Call the builtin function with value 1
        NodePtr n1(new NumberNode(1));
        NodePtr functionCallNode(new FunctionCallNode("exp", n1));

        userFunctionsMap functions;
        EvaluationContext ec(functions, variablesMap());
        EXPECT(approx(M_E) == functionCallNode->eval(ec));
    },

    CASE("Calling the user defined function c0") {
        // Define a function returning always 0
        NodePtr n0(new NumberNode(0));
        UserFunctionPtr constant0(new UserFunction{"c0", "x", n0});

        // Call it with value 0
        NodePtr functionCallNode(new FunctionCallNode("c0", n0));

        userFunctionsMap functions {{constant0->name, constant0}};
        EvaluationContext ec(functions, variablesMap());
        EXPECT(approx(0.) == functionCallNode->eval(ec));
    },

    CASE("Calling the user defined function f(x) = 1 + exp x") {
        // Define the function f(x) + 1 + exp x
        NodePtr accessX(new VariableNode("x"));
        NodePtr callExp(new FunctionCallNode("exp", accessX));
        NodePtr n1(new NumberNode(1));
        NodePtr sumNode(new AdditionNode(n1, callExp));
        UserFunctionPtr f(new UserFunction{"f", "x", sumNode});

        // Call it with value 2
        NodePtr n2(new NumberNode(2));
        NodePtr functionCallNode(new FunctionCallNode("f", n2));

        userFunctionsMap functions {{f->name, f}};
        EvaluationContext ec(functions, variablesMap());
        EXPECT(approx(1 + exp(2)) == functionCallNode->eval(ec));
    },
};
```
{% endraw %}

Notice how we have defined `f(x) = 1 + exp x`:

![](/images/2015/01/one_plus_exp_x.png)

### Conclusions

In this part we have added support to our data model for user defined functions. The next time, we're going to extend the parser to allow an user to define and call them!
