---
date: 2015-04-07T18:21:55Z
tags:
- stack-based-virtual-machines
title: Stack Based Virtual Machines - 4
aliases: [/stack-based-virtual-machines-4]
series: ["Stack Based Virtual Machines"]
---

{% postSeries %}

In [the previous part]({% ref "2015-03-29-stack-based-virtual-machines-3.markdown" %}) we have implemented quite a few instructions for our virtual machine. In this part, we'll further extend its capabilities by adding some comparison instructions, the ability to do jumps and local variables. The relevant code for this part can be seen [on github](https://github.com/andreabergia/sbvm/tree/article-4).

### Comparison instructions

Let's add a few simple instructions to our repertoire: we're going to add some instructions to compare two numbers. In particular, we're going to add the instructions `ISEQ`, `ISGT`, `ISGE`, that implement respectively `a == b`, `a > b`, `a >= b`. Note that this last instruction is a bit redundant, since it can be implemented by `a > b OR a == b`, but it simplifies our "bytecode".

The tests and the implementation are very similar to the already existing arithmetic instructions and we aren't going to discuss them in detail. You can see the relevant commit [here](https://github.com/andreabergia/sbvm/commit/604dc935c10e90620854472cea5f6a02488d0bd2); it should be easy enough to understand.

### Jumps

Now we're going to implement two different instructions to alter the execution flow of the program, specifically `JMP` and `JIF`. The first of these new instructions, `JMP`, will unconditionally alter the instruction pointer; it's basically a `GOTO`. The second instruction, `JIF`, will alter the instruction pointer if and only if the stack contains a true value (a non-zero element as the head). Both of them will be followed by the new address.

Let's see the first test in detail:

```java
    @Test
    public void testUnconditionalJump() {
        // address:       0    1  2     3    4
        CPU cpu = new CPU(JMP, 3, HALT, JMP, 2);
        assertProgramRunsToHaltAndInstructionAddressIs(cpu, 3);
    }
```

At the begininng our CPU will have the instruction address set to 0. After the first `JMP` instruction, the address will be `3`. Next, our CPU will find another `JMP` instruction that will alter the instruction pointer to `2`. Finally, the `HALT` instruction will stop our CPU and leave the instruction pointer to `3`.

Let's see instead the test for the `JIF` instruction:

```java
    @Test
    public void testConditionalJump() {
        // address:       0     1  2    3  4    5     6  7    8  9
        CPU cpu = new CPU(PUSH, 1, JIF, 5, POP, PUSH, 0, JIF, 4, HALT);
        assertProgramRunsToHaltAndInstructionAddressIs(cpu, 10);
        // If the program hits the POP, we'd have an error
    }
```

Here we first push `1`, meaning "true". Therefore the first `JIF` instruction alters the instruction pointer to `5`, skipping over the `POP` instruction. Afterwards we find another `PUSH` instruction that adds `0`, a false value, so the next `JIF` instruction is executed but the instruction address is not changed. Therefore, we reach the address `9`, where we find an `HALT`.

### Variables

Before seeing how we can use these new instructions to implement an `if` or a `while` construct, let's discuss variables. At the moment, our program can only access the head of the stack. This is quite limiting; imagine just about any program that has to use three variables... We need to extend the capabilities of our language.

Therefore we're going to add a new concept to our CPU: a set of *local variables*. To keep things simple, we're going to allow for unlimited local variables, identified by a number. Specifically, we're going to implement two new instructions:

- `LOAD`, that will push to the stack the value of the given variable;
- `STORE`, that will pop the stack head and save it in the given variable.

Here are the tests:

```java
    @Test
    public void testLoadVariableNotInitialized() {
        CPU cpu = new CPU(LOAD, 0, HALT);
        assertProgramRunsToHaltAndInstructionAddressIs(cpu, 3);
        assertStackContains(cpu, 0);
    }

    @Test
    public void testStoreVariable() {
        CPU cpu = new CPU(PUSH, 42, STORE, 0, HALT);
        assertProgramRunsToHaltAndInstructionAddressIs(cpu, 5);
        assertStackIsEmpty(cpu);
        assertVariableValues(cpu, 42);
    }

    @Test
    public void testStoreAndLoadVariable() {
        CPU cpu = new CPU(PUSH, 42, STORE, 0, LOAD, 0, HALT);
        assertProgramRunsToHaltAndInstructionAddressIs(cpu, 7);
        assertStackContains(cpu, 42);
        assertVariableValues(cpu, 42);
    }

    @Test(expected = InvalidProgramException.class)
    public void testLoadNeedsOneArgument() {
        CPU cpu = new CPU(LOAD);
        cpu.run();
    }

    @Test(expected = InvalidProgramException.class)
    public void testStoreNeedsOneArgument() {
        CPU cpu = new CPU(STORE);
        cpu.run();
    }

    @Test(expected = InvalidProgramException.class)
    public void testStoreNeedsOneItemOnTheStack() {
        CPU cpu = new CPU(STORE, 0, HALT);
        cpu.run();
    }

    private void assertVariableValues(CPU cpu, int... expectedVariableValues) {
        Frame frame = cpu.getCurrentFrame();
        for (int varNumber = 0; varNumber < expectedVariableValues.length; varNumber++) {
            int expectedVariableValue = expectedVariableValues[varNumber];
            assertEquals("Checking variable #" + varNumber, expectedVariableValue, frame.getVariable(varNumber));
        }
    }
```

The convention is that uninitialized variables will contain the value `0`. We have created a new, trivial class called `Frame` to store the current variables:

```java
public class Frame {
    private final Map<Integer, Integer> variables = new HashMap<>();

    public int getVariable(int varNumber) {
        return variables.getOrDefault(varNumber, 0);
    }

    public void setVariable(int varNumber, int value) {
        variables.put(varNumber, value);
    }
}
```

The code to make this work is quite simple: in our `CPU` class we have added a new `Frame` variable:

```java
public class CPU {
    // rest as before
    private Frame currentFrame = new Frame();

    // in the instruction switch:
           case LOAD: {
               int varNumber = getNextWordFromProgram("Should have the variable number after the LOAD instruction");
               stack.push(currentFrame.getVariable(varNumber));
               break;
           }

           case STORE: {
               int varNumber = getNextWordFromProgram("Should have the variable number after the STORE instruction");
               checkStackHasAtLeastOneItem("STORE");
               currentFrame.setVariable(varNumber, stack.pop());
               break;
           }
```

With these changes, our tests pass.

### Conclusion

We have now enough instructions to implement `if`, `for` and `while` statement in our bytecode; however, for space reasons, the discussion about them will be left for the next post.

**Update**: [part 5]({% ref "2015-04-11-stack-based-virtual-machines-5.markdown" %}) is out now.
