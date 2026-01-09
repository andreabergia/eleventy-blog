---
date: 2015-01-17T14:57:18Z
tags:
- c++
- parsing
title: Introduction to Parsing - 10
aliases: [/introduction-to-parsing-10]
series: ["Introduction to parsing"]
---


In this part, as in the [last one]({% ref "2015-01-08-introduction-to-parsing-9.markdown" %}), we are going to work on the preliminary changes required to make our parser work with an AST.

### Variables

Let us now implement a new node type which returns a variable's value. We will use this node to implement a form of _delayed_ variable access: the node will only store the variable's name, rather than the variable's value at definition. The lookup of the value will be done only when `eval` will be called.

[Let's start](https://github.com/andreabergia/parsing-tutorial/commit/8cca785ddbfe46d07096ef767f86318251bb312a) with the tests:

```cpp
    CASE("Variable node") {
        VariableNode node("a");
        EXPECT("a" == node.toString(true));
        EXPECT("a" == node.toString(false));
        EXPECT(approx(0.8) == evalNode(node));
    },
    CASE("Unknown variable name") {
        VariableNode node("zz");
        EXPECT("zz" == node.toString(true));
        EXPECT("zz" == node.toString(false));
        EXPECT_THROWS_AS(evalNode(node), UnknownVariableName);
    }
```

We also need to change `evalNode`, in `testNode.hpp`, so that the `EvaluationContext` has some variables in it:

{% raw %}
```cpp
double evalNode(Node &node) {
    functionMap functions;
    variablesMap  variables {{"a", 0.8}, {"b", 1.2}};
    EvaluationContext ec(functions, variables);

    return node.eval(ec);
}
```
{% endraw %}

The new `VariableNode` class shouldn't offer many surprises:

```cpp
class VariableNode : public Node {
public:
    VariableNode(const std::string &varName) : varName_(varName) {}
    ~VariableNode() {};

    virtual std::string toString(bool isTopLevel) const override {
        return varName_;
    }

    virtual double eval(EvaluationContext &context) override {
        auto it = context.variables.find(varName_);
        if (it == context.variables.end()) {
            throw UnknownVariableName(varName_);
        }
        return it->second;
    }

private:
    std::string varName_;
};
```

Similarly to `NumberNode`, we'll always print (in `toString`) a variable node without parenthesis.

### Trivial refactoring break

In the last part I've promised that I would refactor the code so that `toString` would take an `enum` rather than a raw boolean. The change was implemented in [this commit](https://github.com/andreabergia/parsing-tutorial/commit/34875da013cf22229914a265f255d4fe6cb0d938).

### Function calls

The last kind of node we need to implement before we can go back to our parser is a node to map a function call. Similarly to what we have done for the variables and the binary nodes, we will store in the node two things: the function name and a node representing the arguments of the function call.

As usual, [let's see the tests](https://github.com/andreabergia/parsing-tutorial/commit/d8887e60203798897a979e14185af77540167cda) first:

```cpp
    CASE("Function node") {
        NumberNode n0(0);
        FunctionCallNode node("sin", n0);
        EXPECT("sin 0" == node.toString(ToStringType::TOP_LEVEL));
        EXPECT("(sin 0)" == node.toString(ToStringType::RECURSIVE_CALL));
        EXPECT(approx(0.) == evalNode(node));
    },
    CASE("Unknown function name") {
        NumberNode n0(0);
        FunctionCallNode node("foo", n0);
        EXPECT("foo 0" == node.toString(ToStringType::TOP_LEVEL));
        EXPECT("(foo 0)" == node.toString(ToStringType::RECURSIVE_CALL));
        EXPECT_THROWS_AS(evalNode(node), UnknownFunctionName);
    },
    CASE("Recursive function call") {
        NumberNode n0(0);
        FunctionCallNode nSin("sin", n0);
        FunctionCallNode node("exp", nSin);
        EXPECT("exp (sin 0)" == node.toString(ToStringType::TOP_LEVEL));
        EXPECT("(exp (sin 0))" == node.toString(ToStringType::RECURSIVE_CALL));
        EXPECT(approx(1.) == evalNode(node));
    }
```

Just as we did for the variables, we need to add some functions in our evaluation context:

{% raw %}
```cpp
double evalNode(Node &node) {
    functionMap functions {{"sin", std::sin}, {"cos", std::cos}, {"exp", std::exp}, {"log", std::log}};
    variablesMap  variables {{"a", 0.8}, {"b", 1.2}};
    EvaluationContext ec(functions, variables);

    return node.eval(ec);
}
```
{% endraw %}

The new class is quite similar to the variables one:

```cpp
class FunctionCallNode : public Node {
public:
    FunctionCallNode(const std::string &funcName, Node &argument)
            : funcName_(funcName), argument_(argument) {}
    ~FunctionCallNode() {};

    virtual std::string toString(ToStringType toStringType) const override {
        std::string call = funcName_ + " " + argument_.toString(ToStringType::RECURSIVE_CALL);
        return toStringType == ToStringType::TOP_LEVEL ? call : "(" + call + ")";
    }

    virtual double eval(EvaluationContext &context) override {
        double arg = argument_.eval(context);

        auto it = context.functions.find(funcName_);
        if (it == context.functions.end()) {
            throw UnknownFunctionName(funcName_);
        }
        return it->second(arg);
    }

private:
    std::string funcName_;
    Node &argument_;
};
```

### C++ strikes back

We have implemented all the node kinds that we'll need to adapt our parser, but there's a problem we've ignored. We have defined our binary and function call nodes to take a _reference_ to another node (`Node &`).

References in C++ are basically pointers that _have_ to refer to a valid object. The problem with them is that you cannot really return a reference to a temporary variable, nor can you store a reference to a temporary in an object that you will return. Since that is exactly what we will need to do in our parser, we have to do some changes.

One possible approach would be to use raw pointers, but then we'd have to face the (common in C/C++) problem of "when do we delete the allocated objects? Whose responsability is it?" A possible approach is to use the convention that "a node will destroy its children nodes": this is a solid way, used for instance [by Qt](http://qt-project.org/doc/qt-4.8/objecttrees.html). However we are going to follow a simpler (and slightly less performant) road: we are going to use [smart pointers](https://en.wikipedia.org/wiki/Smart_pointer).

Specifically, we're going to use the new C++11 [`std::shared_ptr`](http://en.cppreference.com/w/cpp/memory/shared_ptr): it's new in the sense that it was added to the standard library in C++11, but it has been available [in Boost](http://www.boost.org/doc/libs/1_57_0/libs/smart_ptr/shared_ptr.htm) long before that. This is a class that mimicks a pointer by overloading the operators `*` and `->`, but it also keeps a reference count. When the `shared_ptr` object is destroyed, the reference count is decreased; when a new `shared_ptr` is created from an existing one (by copying it for instance) the reference count is increased. When the reference count reaches `0`, the underlying pointer is destroyed.

If this sounds like a sort of a poor man's garbage collection, it's because it is actually the basis of the memory management in some languages, such [as Python](https://docs.python.org/release/2.5.2/ext/refcounts.html). The drawback is that each pointer access now needs an indirection, meaning that performances will be worse. Furthermore, it's possible to cause a memory leak by having a cycle in the object reference graph (i.e. an object A has a smart pointer referring to B, which in turn has a smart pointer referring to A). There are many ways to fix that, but luckily we should't need to do any of the sort in our code, so we won't discuss it further.

After this introduction, let's see how the code [needs to change:](https://github.com/andreabergia/parsing-tutorial/commit/449215e13974cdc2a2f2a7d273dd7cabfc13d42a)

```cpp
using NodePtr = std::shared_ptr<Node>;
```

We are going to define `NodePtr` to mean a `shared_ptr` referring to a `Node`. The changes to `BinaryOpNode` are quite simple:

```cpp
    // The constructor now takes two NodePtr, instead of two Node &
    BinaryOpNode(NodePtr left, NodePtr right, toStringFunc toString, evalFunc eval)

    // We need to use left_->eval instead of left_.eval now
    virtual double eval(EvaluationContext &context) override {
        return eval_(left_->eval(context), right_->eval(context));
    }

    // The type of left_ and right_ changes from Node & to NodePtr
    NodePtr left_;
    NodePtr right_;
```

Similar changes have been done to all the other classes and to the unit tests.

A non-obvious change is this: we cannot write

```cpp
NodePtr n1plus3 = new AdditionNode(n1, n3);
```

but we have to write one of

```cpp
NodePtr n1plus3(new AdditionNode(n1, n3));
NodePtr n1Plus3 = NodePtr(new AdditionNode(n1, n3));
```

This is an annoying quirk of working with `shared_ptr`: _semantically_ a `NodePtr` is just a pointer to a `Node`, but _syntactically_ it's a class and so it cannot be assigned from a pointer directly. It makes the code a bit less readable, but the benefits of not having to manage memory manually are generally worth it.

### Conclusions

We are done with the preliminary work: our nodes classes can be used to model all the expressions our parser can handle. In the next part, we're going to finally modify the parser to use our nodes.

If you're interested to learn more about smart pointers, the classic [Modern C++ Design](https://en.wikipedia.org/wiki/Modern_C%2B%2B_Design) by [Andrei Alexandrescu](http://erdani.com/) has a lot  of materials covering it.
