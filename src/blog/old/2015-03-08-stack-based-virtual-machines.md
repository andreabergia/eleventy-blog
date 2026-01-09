---
date: 2015-03-08T11:27:46Z
tags:
- stack-based-virtual-machines
title: Stack Based Virtual Machines - 1
aliases: [/stack-based-virtual-machines]
series: ["Stack Based Virtual Machines"]
---


In this series we're going to delve a bit into stack based virtual machines. First we're going to see an overview, then we'll build our own toy VM. Next, we're going to see how what we'll build maps to a real CPU. Finally, we'll discuss the most famous of all: the JVM.

### Introduction

What's a _stack based virtual machine_ then? It's an abstraction of a computer, that emulates a real machine. Generally it is built as an interpreter of a special _bytecode_, that translates its in real time for execution on the CPU.

Let's start with a trivial example: suppose your program needs to add two numbers. To do that in a stack VM, the program will _push_ the first number to the stack, _push_ the second and then execute some form of the special instruction _add_, that will _pop_ the first two elements of the stack and replace them with their sum. Let's see it step by step:

![At the beginning](/images/2015/03/Stack_1.png)

The `SP` is the _stack pointer_, which refers to the head of the stack. The `IP` is the _instruction pointer_, which points to the address of the current instruction to execute. Let's now execute the first instruction:

![After the first instruction](/images/2015/03/Stack_2.png)

You can see that the stack now contains `1` and that the instruction pointer has been moved to the next instruction. Let's now simulate the second instruction:

![After the second instruction](/images/2015/03/Stack_3.png)

Finally we can execute the `add` instruction:

![After the add](/images/2015/03/Stack_4.png)

The head of the stack and the previous element have been popped and replaced with their sum.

### Centrality of the stack

As you have seen from the example, the main two data structures for a stack VM are the code listing, with the instruction pointer, and the stack data, which is accessed only via the stack pointer. While these two data structures seem trivial, they are more than enough to implement a lot of complex programs. By adding some external memory area (what is generally known as "memory on the heap"), this structure will become complex enough to form the basis of a real language such as Java or Scala.

The stack will be the central structure. From what we hve seen above you should have some idea on how to use it to implement the basic arithmetic, but it is also going to be the basis of implementing loops and conditional execution (if) and even function calls! We're going to discuss all of this while building our toy VM.

### Register based virtual machines

Closely related to stack based VM are _register based virtual machines_. They are also interpreters of bytecode, but their design is quite different, since they don't use the stack for the operands but rather a set of registers. While they tend to be more complex, they are also generally faster at runtime, since they map much more closely to the CPU (which, as we'll see later, is actually an hardware register machine) and thus they tend to generate and execute better efficient code.

However stack based virtual machines are not just a learning toy. The most successful VM ever, the [Java Virtual Machine](https://en.wikipedia.org/wiki/Java_virtual_machine), is a stack-based virtual machine (and so is the [CLR](https://en.wikipedia.org/wiki/Common_Language_Runtime), the basis of .NET). Furthermore the JVM is _extremely_ high performant, while still quite simple - although that has been achieved more by the _immense_ amount of money that has flown into its development than by some special characteristic of its architecture.

The most famous example of a register based virtual machine is probably [LUA](http://www.lua.org/), which can achieve [amazing performances](http://luajit.org/performance.html) and is used in [many videogames](https://en.wikipedia.org/wiki/Category:Lua-scripted_video_games) as a scripting language.

### Links

I hope this short introduction has stimulated your curiosity. Here are a few links in case you wish to start reading something more:

- [Wikipedia page for stack based virtual machines](https://en.wikipedia.org/wiki/Stack_machine)
- [Comparision of common VM](https://en.wikipedia.org/wiki/Comparison_of_application_virtualization_software)
- [Design document for LUA](http://www.lua.org/doc/jucs05.pdf)

About the JVM:

- [JVM bytecode introduction](https://en.wikipedia.org/wiki/Java_bytecode)
- [JVM bytecode instructions](https://en.wikipedia.org/wiki/Java_bytecode_instruction_listings)
- [Introduction to ASM, a JVM bytecode manipulation library](http://download.forge.objectweb.org/asm/asm4-guide.pdf)

**Update:** part two is [online]({% ref "2015-03-22-stack-based-virtual-machines-2.markdown" %}).
