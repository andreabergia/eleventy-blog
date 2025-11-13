---
date: 2015-05-10T19:09:47Z
tags:
- parsing
- antlr
- stack-based-virtual-machines
title: Stack Based Virtual Machines - 7
aliases: [/stack-based-virtual-machines-7]
series: ["Stack Based Virtual Machines"]
---

{% postSeries %}

In [the previous part]({% ref "2015-04-26-stack-based-virtual-machines-6.markdown" %}) we have added support for functions calls to our virtual machine. This time, we're going to start working on something a bit different: we're going to write an _assembler_ for our VM!

The status of the code for this part and the next is [on GitHub](https://github.com/andreabergia/sbvm/tree/article-7).

### Assembler?

[Wikipedia](https://en.wikipedia.org/wiki/Assembly_language#Assembler) says:

> An assembler is a program which creates object code by translating combinations of mnemonics and syntax for operations and addressing modes into their numerical equivalents. This representation typically includes an operation code ("opcode") as well as other control bits.[2] The assembler also calculates constant expressions and resolves symbolic names for memory locations and other entities.[3] The use of symbolic references is a key feature of assemblers, saving tedious calculations and manual address updates after program modifications.

We're going to write a program that will translate a text file in this format:

```
// A simple program:
PUSH 1
PUSH 2
CALL addThem
HALT

// A simple function that sums the given arguments
addThem:
ADD
RET
```

Our assembler will translate this into a sequence of instructions for our virtual machine. It will also execute them, which means that our program should probably be called an "interpreter"... but let's not be picky with names! :-)

Notice that our assembler will support *labels*, which are simply identifiers followed by a colon. This can help when writing jumps or functions calls, since we can now use a symbol rather than hard-coding the address as we have done until now. We're also going to support comments.

### ANTLR and grammars

We're going to use [ANTLR v4](http://www.antlr.org/) to help us with the parsing. ANTLR is a tool that generates a lexer and a parser starting from a given grammar file. ANTLR is an open source tool, used by [*many* real-world projects:](http://www.antlr.org/about.html)

> Twitter search uses ANTLR for query parsing, with over 2 billion queries a day. The languages for Hive and Pig, the data warehouse and analysis systems for Hadoop, both use ANTLR. Lex Machina uses ANTLR for information extraction from legal texts. Oracle uses ANTLR within SQL Developer IDE and their migration tools. NetBeans IDE parses C++ with ANTLR. The HQL language in the Hibernate object-relational mapping framework is built with ANTLR.

To use ANTLR, we just need to write the grammar file; afterwards ANTLR will generate the Java code for the parser and lexer for us. This is the complete grammar for our assembler:

```
grammar Sbvm;

// A program is a sequence of lines
program: line*;

// A line is either a label, or an instruction, followed by a newline
line: (label | instruction | emptyLine) NEWLINE;

emptyLine: ;

// Labels are simply identifiers, followed by colons
label: IDENTIFIER ':';

// An instruction can be of many kinds
instruction: halt |
             push |
             add |
             sub |
             mul |
             div |
             not |
             and |
             or |
             pop |
             dup |
             iseq |
             isge |
             isgt |
             jmp |
             jif |
             load |
             store |
             call |
             ret
             ;
halt: 'HALT';
push: 'PUSH' NUMBER;
add: 'ADD';
sub: 'SUB';
mul: 'MUL';
div: 'DIV';
not: 'NOT';
and: 'AND';
or: 'OR';
pop: 'POP';
dup: 'DUP';
iseq: 'ISEQ';
isge: 'ISGE';
isgt: 'ISGT';
jmp: 'JMP' IDENTIFIER;
jif: 'JIF' IDENTIFIER;
load: 'LOAD' NUMBER;
store: 'STORE' NUMBER;
call: 'CALL' IDENTIFIER;
ret: 'RET';


IDENTIFIER: [a-zA-Z][a-zA-Z0-9_]*;
NUMBER: [0-9]+;
NEWLINE: '\r'? '\n';

// Skip all whitespaces
WHITESPACE: [ \t]+ -> skip;

// Skip comments
COMMENT: '//' ~('\r' | '\n')* -> skip;
```

As you can see, our grammar is quite simple. The `program` is given by a sequence of `line`, each of which can be of either a `label`, an `instruction`, or nothing (in case the line is empty or contains only comments).

Labels are simple: an `IDENTIFIER` followed by a colon. Ident9ifiers are given by a sequence of ascii letters, numbers and underscores (starting with a letter).

Notice that each instruction has its own parsing rule. This seems a bit a repetition: we could have easily written this:

```
instruction: 'HALT' |
             'PUSH' NUMBER |
             ...;
```

However, as we will see later, our solution will help us later on, when we'll write the Java code that will actually *use* the parser.

A few more details:

- `NEWLINE` are significant in our language, as we do not support semicolons or anything like that to conclude an instruction. In our "language", one line must contain one and only one instruction.
- the token `WHITESPACE` is followed by `-> skip`, which signals ANTLR to simply discard the matched text.
- notice how we have defined `COMMENT`: it is a sequence of `//` followed by any character that is not a newline.

### Integrating with Gradle

We are not going to go into the details of the ANTLR integration with Gradle. However, if you are interested, you can take a look at the [build.gradle]() file to see what we have done. The result is that we can place the grammar into `src/main/antlr`, and Gradle will automatically call ANTLR to generate the parser and lexer, which will then be added to the source code of our program.

### Conclusions

We have written the grammar for our assembler and integrated it in our build. In the next part, we're going to discuss the code that actually uses the generated parser.

**Update:** part 8 [is online]({% ref "2015-05-17-stack-based-virtual-machines-8.markdown" %}).
