---
date: 2015-05-17T09:30:10Z
tags:
- parsing
- antlr
- stack-based-virtual-machines
title: Stack Based Virtual Machines - 8
aliases: [/stack-based-virtual-machines-8]
series: ["Stack Based Virtual Machines"]
---


In [the previous part]({% ref "2015-05-10-stack-based-virtual-machines-7.markdown" %}) we have written the ANTLR grammar for an assembler for our virtual machine. In this part, we'll write the code connected to the ANTLR-generated parser to actually make our assembler work!

The code for this part is [on GitHub](https://github.com/andreabergia/sbvm/tree/article-7).

## `Main`

Let's start - for once! - with the `main` function and not with an unit test. (Gasp!)

Here's our very simple `AssemblerMain` class:

```java
public class AssemblerMain {
    public static void main(String[] args) throws IOException {
        if (args.length != 1) {
            System.err.println("Please give the file to parse as the only argument!");
            System.exit(-1);
        }

        runProgram(args[0]);
    }

    private static void runProgram(String fileName) throws IOException {
        int[] generatedProgram = ProgramVisitor.generateProgram(new ANTLRFileStream(fileName));
        CPU cpu = new CPU(generatedProgram);
        cpu.run();

        System.out.println("After running, the cpu stack contains: " + cpu.getStack());
        System.out.println("After running, the cpu local frame contains: " + cpu.getCurrentFrame().getVariables());
    }
}
```

As you can see, we call a new class `ProgramVisitor`, passing it an `ANTLRFileStream`. This class is responsible for translating the source code given to our assembler into instructions for our vm. The rest of the code simply delegates to the existing `CPU` class.

## Integrating ANTLR

As we have discussed in the previous part, we have added some rules to our Gradle project to invoke ANTLR and have it automatically generate the parser and lexer from our grammar at compile time. This will give us a few classes:

- `SbvmLexer`, `SbvmParser`, which implement respectively the lexer and the parser;
- the interface `SbvmListener` and the empty implementation `SbvmBaseListener`;
- the interface `SbvmVisitor` and the empty implementation `SbvmBaseVisitor`.

Listeners and visitor are a great addition of ANTLR v4, and provide a clean way to write code that responds to parsing "events". For instance, the class `SmbvListener` has methods such has:

```java
    	void enterProgram(SbvmParser.ProgramContext ctx);
    	void exitProgram(SbvmParser.ProgramContext ctx);
    	void enterInstruction(SbvmParser.InstructionContext ctx);
    	void exitInstruction(SbvmParser.InstructionContext ctx);
```

By implementing those methods and registering our `Listener` with the `Parser`, we can be invoked whenever an instruction is found in the input and add our specific code.

Visitors fulfill a similar purposes, but are more general. Since ANTLR builds internally an [abstract syntax tree](https://en.wikipedia.org/wiki/Abstract_syntax_tree) of the input, we can use a visitor to walk the tree and perform actions when specific node types are encountered, similarly to the listeners. Furthermore, we can also take control of the visiting order, for instance to skip a node's children. In our code, we will use a `Visitor`, although it's simple enough that we could have used a `Listener`.

## `ProgramVisitor`

Let's start to take a look at our new class `ProgramVisitor`. Here are two simple static methods:

```java
  /**
     * Generates a program from a given parser, or throws an exception if the program is invalid.
     */
    public static int[] generateProgram(SbvmParser parser) throws InvalidProgramException {
        ProgramVisitor programVisitor = new ProgramVisitor();
        programVisitor.visit(parser.program());
        return programVisitor.generateProgram();
    }

    /**
     * Generates a program from a given ANTLR input, or throws an exception if the program is invalid.
     */
    public static int[] generateProgram(CharStream input) throws InvalidProgramException {
        SbvmLexer lexer = new SbvmLexer(input);
        CommonTokenStream tokenStream = new CommonTokenStream(lexer);
        SbvmParser parser = new SbvmParser(tokenStream);
        return generateProgram(parser);
    }
```

To parse something with ANTLR, we need to create a few objects:

- a `CharStream`, which is generally an `ANTLRANTLRFileStream` or an `ANTLRInputStream`, which provides the input characters;
- the `Lexer`, in our case `SbvmLexer`;
- a `TokenStream`, which is generally a `CommonTokenStream`;
- the `Parser, in our case `SbvmParser`.

Afterwards, we create our visitor and visit the `program` node of the parsed syntax tree.

### Simple instructions

Let's start to see the "simple" rules. In our `ProgramVisitor` we have modeled the sequence of instructions as:

```java
    private final List<Integer> program = new ArrayList<>();
```

All the simple instructions (those without an argument) follow this pattern:

```java
    @Override
    public Void visitAdd(SbvmParser.AddContext ctx) {
        program.add(Instructions.ADD);
        return null;
    }
```

### Instructions with one argument

Let's now take a look at an instruction with some arguments, for instance PUSH. Here's the code:

```java
    @Override
    public Void visitPush(SbvmParser.PushContext ctx) {
        visitOneArgumentInstruction(ctx.NUMBER(), Instructions.PUSH);
        return null;
    }

    private void visitOneArgumentInstruction(TerminalNode numer, int instruction) {
        int value = Integer.valueOf(numer.getText());
        program.add(instruction);
        program.add(value);
    }
```

We have extracted the common code in the helper method visitOneArgumentInstruction, but everything should be clear. Notice how ANTLR maps the grammar rule:

```
push: 'PUSH' NUMBER;
```

to the generated classes. We have a PushContext class, which represents a matched push rule. We also have a method NUMBER to obtain the token NUMBER, on which we can simply call getText() to obtain the input text.

### Labels and jumps

The last hurdle we have to face is handling labels. If you recall, we have decided to allow the user to write things as:

```
CALL addThem

addThem:
```

This means we have to do two things:

- when we find a label, we need to save the current program address
- when we find a jump instruction, we need to find the label's address. However, since it's possible that the label _follows_ the jump, we will delay this and do it at the end of the code generation.

Here's the relevant code to implement the above:

```java
    private static final class UnresolvedAddress {
        private final int position;
        private final String label;

        public UnresolvedAddress(String label, int position) {
            this.label = label;
            this.position = position;
        }
    }

    private static final int UNRESOLVED_JUMP_ADDRESS = -1;
    private final List<UnresolvedAddress> labelsToResolve = new ArrayList<>();
    private final Map<String, Integer> labelsAddresses = new HashMap<>();

    private int getCurrentAddress() {return program.size();}

    @Override
    public Void visitLabel(SbvmParser.LabelContext ctx) {
        // When a label is found, saves the current address for later
        String labelText = ctx.IDENTIFIER().getText();
        labelsAddresses.put(labelText, getCurrentAddress());
        return null;
    }

    @Override
    public Void visitJmp(SbvmParser.JmpContext ctx) {
        visitUnresolvedJump(ctx.IDENTIFIER(), Instructions.JMP);
        return null;
    }
    // Similar code for all the other jumps

    private void visitUnresolvedJump(TerminalNode identifier, int instruction) {
        // Add the given instruction, save the unresolved label and add a placeholder for the jump address
        program.add(instruction);
        String labelText = identifier.getText();
        labelsToResolve.add(new UnresolvedAddress(labelText, getCurrentAddress()));
        program.add(UNRESOLVED_JUMP_ADDRESS);
    }

    /**
     * Transforms all the unresolved labels into correct addresses.
     */
    private void resolveLabels() {
        for (UnresolvedAddress unresolvedAddress : labelsToResolve) {
            // Map the jump to its real address, by checking the label's address
            @Nullable Integer destination = labelsAddresses.get(unresolvedAddress.label);
            if (destination == null) {
                throw new InvalidProgramException("Unresolved label " + unresolvedAddress.label);
            }

            // Replace the placeholder with the jump address
            assert program.get(unresolvedAddress.position) == UNRESOLVED_JUMP_ADDRESS;
            program.set(unresolvedAddress.position, destination);
        }

        // Clean up
        labelsToResolve.clear();
    }
```

As we have discussed above, when we encounter a label we save the label's name and the current address to a Map.

When we find a jump instruction, we add it and a placeholder to the sequence of instructions in the program. The placeholder is useful because we can simply replace it with the referred label's address at the end. Adding it during the parsing means that getCurrentAddress is always correct, even if we haven't yet resolved the labels. We also save an entry containing the placeholder address and the referred label in a List.

Finally, at the end, we can iterate over all the unresolved labels and use Map to translate them to the correct address.

## Conclusions

I hope you have enjoyed this mini-series about our stack based virtual machine. The VM we have built is _very_ simple, but it is already enough to write basic arithmetic, loops and functions. Its main limitations are the fact that it lacks arrays (without which, no real data structure can be built) and that it is limited to integers.
