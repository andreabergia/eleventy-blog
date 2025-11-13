---
date: 2015-04-26T10:13:54Z
tags:
- stack-based-virtual-machines
title: Stack Based Virtual Machines - 6
aliases: [/stack-based-virtual-machines-6]
series: ["Stack Based Virtual Machines"]
---

{% postSeries %}

In [the previous part]({% ref "2015-04-11-stack-based-virtual-machines-5.markdown" %}) we have implemented an "if" and a "while" statement. In this part, we'll extend our virtual machine and add support for function calls!

The status of the code at the time of this article can be seen [on GitHub](https://github.com/andreabergia/sbvm/tree/article-6).

### Calling a function

A function is generally nothing more than a particular address that the code jumps to. However, in some virtual machines such as the JVM, a function has some associated metadata (such as the number of arguments, or the maximum size the stack will contain during the function's execution). To keep things simple, we aren't going to implement something like that and we'll stick with the simplest implementation that works.

Calling a function is, generally, similar to doing a jump. The main difference is that, when a function is called, the _return address_ is saved someplace and used to _return_ to the caller. The general procedure is:

- functions arguments are saved "somewhere"
- the function call happens: the current address is saved "somewhere" and then the CPU jumps to the function's start address
- when a special return instruction is found, the previous saved address is "found" and a jump happens.

Since our CPU does not support randomized stack access (meaning it can only access to the stack's head), we need to implement some special support for saving the current address, just as we have done for local variables. This is the same thing that the JVM does. A real x86 CPU, however, can access any position on the stack, so the return address is simply pushed and popped from the stack.

Anyway, let's start by seeing some tests:

```java
    @Test
    public void testFunctionCallNoArgumentsNoReturn() {
        // addresses      0     1  2     3
        CPU cpu = new CPU(CALL, 3, HALT, RET);
        assertProgramRunsToHaltAndInstructionAddressIs(cpu, 3);
        assertStackIsEmpty(cpu);
    }

    @Test
    public void testFunctionCallNoArgumentsReturnsInt() {
        // addresses      0     1  2     3     4  5
        CPU cpu = new CPU(CALL, 3, HALT, PUSH, 7, RET);
        assertProgramRunsToHaltAndInstructionAddressIs(cpu, 3);
        assertStackContains(cpu, 7);
    }

    @Test
    public void testFunctionDoublesGivenArgument() {
        // addresses      0     1  2      3  4    5     6  7     8  9    10
        CPU cpu = new CPU(PUSH, 3, CALL, 5, HALT, PUSH, 2, MUL, RET);
        assertProgramRunsToHaltAndInstructionAddressIs(cpu, 5);
        assertStackContains(cpu, 6);
    }
```

The first test implements the most trivial of functions. We have introduced two new instructions in our VM: a `CALL` instruction that saves the current address and jumpts to the function's starting address, and a `RET` function to return.

These instructions don't alter the stack, so a function can return a value (or even more than one) by simply pushing them to the stack, as it is done in the second test. Similarly, we can pass arguments to a function by just pushing them to the stack, as it is done in the third test.

### Implementation

The implementation is quite simple. If you recall, our CPU has the concept of "current frame of execution", implemented by a `Frame` class. Let's start by extending it so that it can contain also the return address

```java
public class Frame {
    private final Map<Integer, Integer> variables = new HashMap<>();
    private final int returnAddress;

    public Frame(int returnAddress) {
        this.returnAddress = returnAddress;
    }

    public int getVariable(int varNumber) {
        return variables.getOrDefault(varNumber, 0);
    }

    public void setVariable(int varNumber, int value) {
        variables.put(varNumber, value);
    }

    public int getReturnAddress() {
        return returnAddress;
    }
}
```

Now we can modify our `CPU` class to have a _stack_ of frames:

```java
-    private Frame currentFrame = new Frame();
+    private Stack<Frame> frames = new Stack<>();

     public CPU(int... instructions) {
         checkArgument(instructions.length > 0, "A program should have at least an instruction");
         this.program = instructions;
+        this.frames.push(new Frame(0)); // Prepare the initial frame
     }
```

A new `Frame` will be pushed for each function call, and popped when the function returns. This allows us to implement local variables, even for recursive function calls: each function on the call stack has its own, private `Frame` and thus variables.

Finally, we can add support for the new instructions in our famous "instruction switch":

```java
    case CALL: {
        // The word after the instruction will contain the function address
        int address = getNextWordFromProgram("Should have the address after the CALL instruction");
        checkJumpAddress(address);
        this.frames.push(new Frame(this.instructionAddress)); // Push a new stack frame
        this.instructionAddress = address;                    // and jump!
        break;
    }

    case RET: {
        // Pop the stack frame and return to the previous address
        checkThereIsAReturnAddress();
        int returnAddress = getCurrentFrame().getReturnAddress();
        this.frames.pop();
        this.instructionAddress = returnAddress;
        break;
    }
```

When we call a function, we add a new `Frame` to the call stack that contains the return address and then behave similarly to a `JMP` instruction.

To return from a function, we simply pop the current `Frame` and jump back to the return address.

### Writing a max function

Let's now write a more complete example and implement a `max` function in our language. Here's to code:

```java
@Test
public void testMaxAB() throws Exception {
    /**
     * We're going to create a function that returns the maximum of its two arguments.
     *
     * The algorithm is obviously:
     *
     * int max(int a, int b) {
     *     if (a > b) {
     *         return a;
     *     } else {
     *         return b;
     *     }
     * }
     */
    CPU cpu = new CPU(
            PUSH, 6,        // Push the first argument
            PUSH, 4,        // Push the second argument
            CALL, 7,        // Call "max"
            HALT,
            // Here is address 7, the start of "max" function
            STORE, 1,       // Store b in local variable 1; the stack now contains [a]
            STORE, 0,       // Store a in local variable 0; the stack is now empty
            LOAD, 0,        // The stack now contains [a]
            LOAD, 1,        // The stack now contains [a, b]
            ISGE,           // The stack now contains [a > b]
            JIF, 21,        // If the top of the stack is true (a > b), jump to the "if" path
            LOAD, 1,        // "else" path: load b on the stack
            RET,
            // Here is address 23
            LOAD, 0,        // "if" path: load a on the stack
            RET
    );
    assertProgramRunsToHaltAndInstructionAddressIs(cpu, 7);
    assertStackContains(cpu, 6);
}
```

We start by pushing the arguments and then calling the `max` function (which is implemented at address 7). Just as in our previous examples, we have no way to do I/O, so we hard code the function's arguments.

The `max` function receives the two arguments in the stack. The first thing it does is to save the values of the arguments on two local variables. This is necessary because it has to call the `ISGE` instruction, which will remove them from the stack; therefore a copy has to be created. After saving the arguments in the local variables, they are popped back again to the stack and then `ISGE` is called, which with the following `JIF` instruction implements our `if` statement. In the two `if` branches, we either push to the stack the first or second local variable, meaning the first or second `max` argument respectively. Finally the function returns: at this point, the stack will contain the greatest between the two arguments.

### Conclusions

I hope you have enjoyed this mini series. Our virtual machine is quite simple, but it still has all the basic components to implement a very simple programming language.

**Update**: [part 7]({% ref "2015-05-10-stack-based-virtual-machines-7.markdown" %}) is online.
