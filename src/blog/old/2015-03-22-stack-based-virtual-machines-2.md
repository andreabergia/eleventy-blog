---
date: 2015-03-22T17:39:55Z
tags:
- stack-based-virtual-machines
title: Stack Based Virtual Machines - 2
aliases: [/stack-based-virtual-machines-2]
series: ["Stack Based Virtual Machines"]
---


After the introduction in [the last part]({% ref "2015-03-08-stack-based-virtual-machines.markdown" %}), it's time to start writing some code and dig into stack based virtual machines.

We're going to write a very simple VM in Java (yes, that's a stack-based virtual machine - our program - running on a stack-based virtual machine - the JVM - that runs on a register-based hardware machine - your CPU. Meta!). The repository will be hosted [on github](https://github.com/andreabergia/sbvm); the tag corresponding to the code we'll discuss in this article is [here](https://github.com/andreabergia/sbvm/tree/article-2). The code will be written in Java 8 and the project managed by [gradle](http://www.gradle.org/).

### Code structure and HALT

The first thing we need to do is to model the memory stack and the program's code. To keep things simple, for the stack we're going to use a simple `Deque<Integer>`. We'll model the source code with an array of `int`: generally a stack based virtual machine tends to use bytes, to save memory; however, since this is just a learning toy, integers will be fine. Furthermore this will simplify embedding constants in the code, as we're going to see shortly.

Our virtual machine will run the program code, given as a sequence of instructions, one at a time. To do this, as we have discussed briefly last time, it will keep an _instruction pointer_, that will represent the address of the next instruction to execute. Since our program is stored as an array, this will just be an integer representing the offset.

We're going to write a `CPU` class with two main methods: `run`, that executes the whole program until completion, and `step`, that will just execute one instruction at a time. We're going to introduce an explicit `HALT` instruction in our code; the CPU will stop execution when it will find it, and it will always expect to find it in a program. So, we have our first test:

```java
    @Test
    public void testEmptyProgramDoesNothing() {
        CPU cpu = new CPU(HALT);
        cpu.step();
        assertEquals(1, cpu.getInstructionAddress());
        assertTrue(cpu.isHalted());
        assertStackIsEmpty(cpu);
    }
```

The constructor of our `CPU` class takes the program's "binary code" as a sequence of integers, as discussed. We are also going to implement a few methods in the `CPU` to help us write the unit test, such as `getInstructionAddress` and `isHalted`.

### PUSHing and ADDing numbers

If our CPU only had an `HALT` instruction it would be pretty boring, so let's add a couple more instructions.

The first one is the `PUSH` instruction. This is a bit of a special instruction: in the binary code, it will be always followed by another int representing its argument. This means that our program will contain something like:

```
int[] code = new int[]{PUSH, 42, PUSH, 43, HALT};
```

As we have discussed the last time, `PUSH` will take the following number and add it to the memory stack.

We're also going to implement another instruction: `ADD`, that will remove the two top items from the stack, add them and push the sum.

Let's see some unit tests then:

```java
    @Test
    public void testPushPushAndThenHalt() {
        CPU cpu = new CPU(PUSH, 42, PUSH, 68, HALT);
        cpu.run();
        assertEquals(5, cpu.getInstructionAddress());
        assertTrue(cpu.isHalted());
        assertStackContains(cpu, 68, 42);
    }

    @Test
    public void testAddTwoNumbers() {
        CPU cpu = new CPU(PUSH, 1, PUSH, 2, ADD, HALT);
        cpu.run();
        assertEquals(6, cpu.getInstructionAddress());
        assertTrue(cpu.isHalted());
        assertStackContains(cpu, 3);
    }
```

### The actual code

Now that we have seen how our virtual machine should work, let's see how we can implement it. This is the code as committed:

```java
public class CPU {
    private final int[] program;
    private int instructionAddress = 0;
    private final Deque<Integer> stack = new ArrayDeque<>();
    private boolean halted = false;

    public CPU(int... instructions) {
        checkArgument(instructions.length > 0, "A program should have at least an instruction");
        this.program = instructions;
    }

    public int getInstructionAddress() {
        return instructionAddress;
    }

    public Collection<Integer> getStack() {
        return stack;
    }

    public boolean isHalted() {
        return halted;
    }

    public void run() {
        while (!halted) {
            step();
        }
    }

    public void step() {
        checkState(!halted, "An halted CPU cannot execute the program");
        int nextInstruction = getNextWordFromProgram("Should have a next instruction");
        decodeInstruction(nextInstruction);
    }

    private void decodeInstruction(int instruction) {
        switch (instruction) {
            default:
                throw new InvalidProgramException("Unknown instruction: " + instruction);

            case HALT:
                this.halted = true;
                break;

            case PUSH: {
                // The word after the instruction will contain the value to push
                int value = getNextWordFromProgram("Should have the value after the PUSH instruction");
                stack.push(value);
                break;
            }

            case ADD: {
                checkState(stack.size() >= 2);
                int n1 = stack.pop();
                int n2 = stack.pop();
                stack.push(n1 + n2);
                break;
            }
        }
    }

    private int getNextWordFromProgram(String errorMessage) {
        if (instructionAddress >= program.length) {
            throw new InvalidProgramException(errorMessage);
        }
        int nextWord = program[instructionAddress];
        ++instructionAddress;
        return nextWord;
    }
}
```

The code should be simple enough to follow, I hope.

### Conclusions

Our program is starting very small: so far we have implemented very little. However, as we will in the next parts, it won't take many instructions to be able to implement complex logic, like conditions, loops and function calls. Stay tuned. :-)

**Update**: part 3 has been [published]({% ref "2015-03-29-stack-based-virtual-machines-3.markdown" %}).
