---
date: 2015-04-11T16:12:16Z
tags:
- stack-based-virtual-machines
title: Stack Based Virtual Machines - 5
aliases: [/stack-based-virtual-machines-5]
series: ["Stack Based Virtual Machines"]
---


In [the previous part]({% ref "2015-04-07-stack-based-virtual-machines-4.markdown" %}) we have added many instructions to our virtual machine, such as jumps and local variables. It's now time to discuss how we can use these instructions to implement an "if" statement, or a "while" loop.

The complete unit tests implementing the code samples below can be [on github](https://github.com/andreabergia/sbvm/blob/article-5/src/test/java/com/andreabergia/sbvm/CompleteProgramsTest.java).

### Implementing an IF

Let start by implementing an `if` statement in our bytecode. We want to implement this snippet:

```java
if (a > b) {
    c = a;
} else {
    c = b;
}
```

We're going to use the local variables `0` for `a`, `1` for `b` and `2` for `c`. Since our language doesn't yet do I/O, nor does it have function calls, we'll hard code the values for `a` and `b`, which means that our program won't exactly be the most useful ever written, but that's ok for the moment.

So, our program will be as follows:

```
CPU cpu = new CPU(
    // Init a with "6"
    PUSH, 6,
    STORE, 0,

    // Init b with "4"
    PUSH, 4,
    STORE, 1,

    // Load a and b into the stack
    LOAD, 0,            // Stack contains a
    LOAD, 1,            // Stack contains a, b
    ISGT,               // Stack contains a > b
    JIF, 21,

    // This is the "else" path
    LOAD, 1,            // Stack contains b
    STORE, 2,           // Set c to the stack head, meaning c = b
    JMP, 25,

    // This is the "if" path, and this is the address 21
    LOAD, 0,            // Stack contains a
    STORE, 2,           // Set c to the stack head, meaning c = a

    // Done; this is address 25
    HALT
);
```

Let's look at it slowly. In the first part, we are simply initializing the values of `a` and `b` with some hard-coded values. To do this, we have to first `PUSH` the value to the stack and then use the `STORE` instruction to pop the value and save it in the local variable.

Next, we push the variable's values back to the stack using two `LOAD` instructions. Afterwards, by using the `ISGT` instruction, we pop both from the stack and replace them with a boolean representing whether `a > b`: this is the boolean condition that we want to test in our `if`.

It's now time to implement the `if`. Since our bytecode doesn't have the concept of blocks, we have to simulate it somehow. We're doing it by writing both paths of the if (in this case first the `else` path and then the `if` path, given how our `JIF` instruction works) in a row and use some jumps instructions. The code follows this structure:

```
load the boolean value to test to the stack
JIF after the else code path
[[ else code path ]]
JMP after the if code path
[[ if code path ]]
```

So, depending on the value of the boolean value, we will execute only one of the two code paths - which is exactly what we want.

In our program, both paths are similar: they load to the stack either `a` or `b`, and then save the value to the local variable `2`, meaning `c`.

The last instruction is the required `HALT`, to shutdown cleanly our program.

### Intermezzo: some x64 assembler

While this looks quite complex, it is actually the standard way to write an `if` statement in bytecode and/or assembler - as they generally don't have blocks but only jump instructions.

To demonstrate it, let's write the example above in C, compile it and then look at the generated code. This is our `test.c`:

```c
int main()
{
  int a = 4, b = 6, c;
  if (a > b) {
    c = a;
  } else {
    c = b;
  }
  return 0;
}
```

When compiled (with a `gcc test.c`) and then disassembled (`objdump -d a.out`) on my machine, it produces this output:

```nasm
; skipped code
  400508:	8b 45 f4             	mov    -0xc(%rbp),%eax
  40050b:	3b 45 f8             	cmp    -0x8(%rbp),%eax
  40050e:	7e 08                	jle    400518 <main+0x22>
  400510:	8b 45 f4             	mov    -0xc(%rbp),%eax
  400513:	89 45 fc             	mov    %eax,-0x4(%rbp)
  400516:	eb 06                	jmp    40051e <main+0x28>
  400518:	8b 45 f8             	mov    -0x8(%rbp),%eax
  40051b:	89 45 fc             	mov    %eax,-0x4(%rbp)
; here is the return 0 part
  40051e:	b8 00 00 00 00       	mov    $0x0,%eax
  400523:	5d                   	pop    %rbp
  400524:	c3                   	retq
  400525:	66 2e 0f 1f 84 00 00 	nopw   %cs:0x0(%rax,%rax,1)
  40052c:	00 00 00
  40052f:	90                   	nop
```

While *definitely* more complicated to understand, the structure of the code is actually quite similar: there is a `cmp` instruction, followed by a `jle` (jump if less or equals; basically does the job of a sequence of our `ISGT`, `NOT`, `JIF` in one instruction), then the "if" body, then a `jmp`, and then the "else" body.

If you haven't really understood this part, no worries; this after all is not a series about x64 assembler. Just trust that the way we have designed our virtual machine is actually not that far from from how a *real* CPU works. :-)

### Implementing a WHILE

Let's now implement a simple while loop. We're going to multiply two numbers without using the `MUL` instruction, which is quite strange, but makes for a simple example - I hope. :-)

Since, as you *obviously* know, `a * b = a + a + a... (b times)`, it should be clear that this loop computes `a * b`, assuming that `b` is non negative:

```java
	int total = 0;
    while (b >= 1) {
    	total += a;
        --b;
	}
```

Similarly to what we have done before, we're going to use the variables `0` for `a`, `1` for `b` and `2` for `total`. The code is:

```java
CPU cpu = new CPU(
    // Init a with "6"
    PUSH, 6,
    STORE, 0,

    // Init b with "4"
    PUSH, 4,
    STORE, 1,

    // Init total to 0
    PUSH, 0,
    STORE, 2,

    // While part
    // Here is address 12
    LOAD, 1,            // Stack contains b
    PUSH, 1,            // Stack contains b, 1
    ISGE,               // Stack contains b >= 1
    NOT,                // Stack contains b < 1
    JIF, 36,            // 36 is the address of the HALT label

    // Inner loop part
    LOAD, 0,            // Stack contains a
    LOAD, 2,            // Stack contains a, total
    ADD,                // Stack contains a + total
    STORE, 2,           // Save in total, meaning total = a + total

    LOAD, 1,            // Stack contains b
    PUSH, 1,            // Stack contains b, 1
    SUB,                // Stack contains b - 1
    STORE, 1,           // Save in b, meaning b = b - 1

    JMP, 12,            // Go back to the start of the loop

    HALT
);
```

The beginning of the code is the same as before: we simply initialize the three local variables. We could have relied on the fact that an uninitialized variable is automatically set to 0 and avoided the initialization of `total`, but being explicit should be a bit clearer.

Afterwards comes the while statement. First we compose on the stack the boolean expression `b < 1` using a short sequence of instructions, and then we jump to the end of the program if the condition is true; this is equivalent to saying that we go on in case `b < 1` is false, or rather `b >= 1` as we have written in the code above.

Next, in the inner part of the loop we increment `total` by `a` and decrement `b` by `1`. Finally we go back to the beginning of the loop and test the value of `b` again.

### Conclusions

I hope you found this enjoyable; personally I've always found quite impressive how an `if` statement can be mapped in bytecode/assembler with just some jumps instructions.

In the next part, we'll start talking about function calls.

**Update**: [part 6]({% ref "2015-04-26-stack-based-virtual-machines-6.markdown" %}) is online.
