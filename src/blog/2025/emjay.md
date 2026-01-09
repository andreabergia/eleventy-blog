---
date: 2025-02-14T16:50:00+01:00
tags:
  - rust
  - compiler
title: Emjay - a simple JIT that does math
featured: 2
---

Today I wanna show off my most recent little project, called `emjay`. It's a _very_ simple "language", with an evaluator that generates JIT code and executes it. It does not have a "normal" interpreter, only the JIT compiler. The language is _extremely_ limited, but that was intentional, since I wanted something simple that I could write end-to-end. All the code is written in Rust and it is hosted on GitHub at [https://github.com/andreabergia/emjay](https://github.com/andreabergia/emjay). It's roughly 4k lines of code including tests, so it is small enough to be presented in this post.

## Supported features

This is an example of valid syntax:

```plaintext
fn main() {
    let v = 1000;
    return v + f(3, 2, 1);
}

fn f(x, y, z) {
    return x * 100 + y * 10 + z;
}
```

The language has the following limitations and features:

- it only has one data type - `i64`;
- it supports only the basic algebraic operations;
- it has no control flow statements (i.e. no `if` or loops);
- it allows variable declaration, nested scopes, and function calls;
- it supports aarch64 as a backend (i.e. Apple silicon). There's also an x64_linux backend, but it's not complete and basically not maintained.

It's a glorified calculator, basically. ☺️ But it does it in a pretty complicated way, like a classical compiler:

- it parses the input string and generates an [AST](https://en.wikipedia.org/wiki/Abstract_syntax_tree) (abstract syntax tree);
- it processes the AST and generates and [IR](https://en.wikipedia.org/wiki/Intermediate_representation) (intermediate representation) in [SSA](https://en.wikipedia.org/wiki/Static_single-assignment_form) (static single-assignment form);
- it then performs some basic optimization on the IR;
- it then generates machine code from the IR;
- and finally it executes it and performs the computation.

I've used the [`pest`](https://pest.rs/) parser library for the parsing, but the rest was all implemented by hand - I did not rely on things like [`llvm`](https://llvm.org/) or [`cranelift`](https://cranelift.dev/). As a result, it generates pretty mediocre machine code - and I feel like I've spent way more time trying to encode aarch64 machine instructions rather than focusing on the frontend part of the compiler. But I _did_ learn a lot.

I'm gonna go into some details of the implementation, because I have found that many articles online tend to assume a lot of theoretical knowledge. Therefore, I hope my toy project and a very practical introduction can be interesting and simple enough to understand even if you are not a compiler expert.

## Parsing and AST

As I've mentioned before, parsing is done via the [`pest`](https://pest.rs/) library. I've written a simple [grammar](https://github.com/andreabergia/emjay/blob/main/src/grammar.pest) for the language. The syntax will be familiar if you have ever used any similar tool such as [antlr]({% ref "2015-02-21-a-grammar-for-json-with-antlr-v4.markdown" %}).


```plaintext
statement = _{ (letStatement | assignmentStatement | returnStatement) ~ ";" }

letStatement = { "let" ~ identifier ~ "=" ~ expression }
```

I've found `pest` to be pretty easy and nice to use, and I can definitely recommend it.

The [parser](https://github.com/andreabergia/emjay/blob/main/src/parser.rs) is a simple thing that naturally follows the grammar's output to generates [AST](https://github.com/andreabergia/emjay/blob/main/src/ast.rs) nodes. The unit of compilation is a single function. The AST looks like this:

```rust
#[derive(Debug, PartialEq)]
pub enum BlockElement<'input> {
    LetStatement {
        name: &'input str,
        expression: Expression<'input>,
    },
    AssignmentStatement {
        name: &'input str,
        expression: Expression<'input>,
    },
    ReturnStatement(Expression<'input>),
    NestedBlock(Block<'input>),
}
```

As an example, here is the parser code for mapping a block:

```rust
fn parse_block(rule: Pair<'_, Rule>) -> Block {
    rule.into_inner()
        .map(|statement| match statement.as_rule() {
            Rule::letStatement => parse_statement_let(statement),
            Rule::assignmentStatement => parse_statement_assignment(statement),
            Rule::returnStatement => parse_statement_return(statement),
            Rule::block => BlockElement::NestedBlock(parse_block(statement)),
            _ => unreachable!(),
        })
        .collect()
}
```

As you can see, it maps pretty closely the grammar's result to the AST declaration.

As a full example, the following source code:

```plaintext
fn main(x) {
    let a = 2;
    return a + 2 + x;
}
```

will generate the following AST:

```plaintext
Function {
  name: "main",
  args: ["x"],
  block: [
    LetStatement {
      name: "a",
      expression: Number(2)
    },
    ReturnStatement(
      Add(
        Add(
          Identifier("a"),
          Number(2)
        ),
        Identifier("x")
      )
    )
  ]
}
```

## Frontend

The [frontend](https://github.com/andreabergia/emjay/blob/main/src/frontend.rs) is the part of the code that will generate the [IR](https://github.com/andreabergia/emjay/blob/main/src/ir.rs) by walking the AST tree. Let's start with an example: for the code above, the IR will look like this:

```plaintext
fn main - #args: 1, #reg: 5 {
    0:  mvi  @r0, 2
    1:  mvi  @r1, 2
    2:  add  @r2, r0, r1
    3:  mva  @r3, a0
    4:  add  @r4, r2, r3
    5:  ret  r4
}
```

I've opted to use a sort of assembler-like syntax for the IR; in this case, `mvi @r0, 2` means move into the logical register `r0` the immediate (constant) value `2`; `mva @r3, a0` means move the first function argument `a0` into `r3`, and so on. I'm not sure it was a particularly good choice, and maybe something like `r4 = add(r2, r3)` would have been clearer, but I was too lazy to change it for this post. 😅

The IR is in [static single-assignment (SSA) form](https://en.wikipedia.org/wiki/Static_single-assignment_form), meaning that every value is assigned just once and always declared before being used. The SSA form was also chosen because it makes various optimizations, such as the ones discussed below, very simple to implement.

In the example above, the `LetStatement` node gets mapped to the first instruction, the `mvi @r0, 2`. Then, the inner `Add` node gets mapped to next two instructions: the right-hand side (i.e. the `2` literal) gets mapped to another IR register, `r1`, and then the `add` is performed and stored in `r2`. The outer `Add` and `Ret` nodes are similarly handled.

Note that my IR features `mvi` (move immediate) for constants and `mva` (move argument) for function arguments, which are named `a0` and so on. It also does not allow any `addi` (add immediate) or similar instructions, but rather it supports only `add` of two registers. Therefore, adding a constant to a variable requires two instructions: a `mvi` to place the constant in a register, and then the actual `add`. I have chosen this approach to keep the IR extremely simple and with as few different instructions as possible.

Generating this IR is quite simple - the frontend just walks the AST tree using Rust's pattern matching (so much nicer than a visitor!) and generates the instructions from each node. It allocates IR registers as necessary and keeps track of where each variable is stored using a simple [symbol table](https://github.com/andreabergia/emjay/blob/main/src/frontend.rs#L64). For example, this is the code that matches an `Add` AST node:

```rust
Expression::Add(left, right) => {
    let op1 = self.compile_expression(body, left, symbol_table.clone())?;
    let op2 = self.compile_expression(body, right, symbol_table)?;
    let dest = self.allocate_reg();
    body.push(IrInstruction::BinOp {
        operator: Add,
        dest,
        op1,
        op2,
    });
    Ok(dest)
}
```

Since my "language" doesn't have any sort of control flow statements, the IR generation is very simple. Each generated function will always contain exactly one [basic block](https://en.wikipedia.org/wiki/Basic_block).

## Optimizer

The next step in the pipeline is the [optimizer](https://github.com/andreabergia/emjay/blob/main/src/optimization.rs), which performs a few optimizations on the IR. In the example above, given the following IR:

```plaintext
fn main - #args: 1, #reg: 5 {
    0:  mvi  @r0, 2
    1:  mvi  @r1, 2
    2:  add  @r2, r0, r1
    3:  mva  @r3, a0
    4:  add  @r4, r2, r3
    5:  ret  r4
}
```

the optimizer will rewrite it as follows:

```plaintext
fn main - #args: 1, #reg: 3 {
    0:  mvi  @r0, 4
    1:  mva  @r1, a0
    2:  add  @r2, r0, r1
    3:  ret  r2
}
```

As you can see, the `2 + 2` has been optimized to a `4`, and registers have been renamed accordingly.

The optimizer pipeline performs the following passes on the IR:

1) [Constant propagation](https://en.wikipedia.org/wiki/Constant_folding), which is used to simplify IR registers that are known to contain constants; in the example above, it can detect that `r2` will contain a constant. Therefore, in the example above, after this optimization the `add` that fills `r2` is replaced with a `mvi`, and the IR becomes:

```plaintext
fn main - #args: 1, #reg: 5 {
    0:  mvi  @r0, 2
    1:  mvi  @r1, 2
    2:  mvi  @r2, 4
    3:  mva  @r3, a0
    4:  add  @r4, r2, r3
    5:  ret  r4
}
```

2) Constant de-duplication, a very simple form of [common subexpression elimination](https://en.wikipedia.org/wiki/Common_subexpression_elimination), which only detects that two registers contain the same _constant_. Continuing the example, this pass would remove `r1` because it contains the same value as `r0`.

```plaintext
fn main - #args: 1, #reg: 5 {
    0:  mvi  @r0, 2
    1:  mvi  @r2, 4
    2:  mva  @r3, a0
    3:  add  @r4, r2, r3
    4:  ret  r4
}
```

3) [Dead store elimination](https://en.wikipedia.org/wiki/Dead-code_elimination), which removes assignments to registers that are not read anymore. In the example above, it can remove the assignment to `r0` because, after the previous optimization pass, it is not read anymore:

```plaintext
fn main - #args: 1, #reg: 5 {
    0:  mvi  @r2, 4
    1:  mva  @r3, a0
    2:  add  @r4, r2, r3
    3:  ret  r4
}
```

4) And finally it will rename registers so that they are 0-based and dense:

```plaintext
fn main - #args: 1, #reg: 3 {
    0:  mvi  @r0, 4
    1:  mva  @r1, a0
    2:  add  @r2, r0, r1
    3:  ret  r2
}
```

The code is [quite simple](https://github.com/andreabergia/emjay/blob/main/src/optimization.rs) I think; the design of the IR definitely helps a lot here. All the optimizations are done in a single pass, and rely on very simple algorithms (union-find).

## Backend

As I mentioned above, the only complete backend implementation is for `aarch64`, i.e. Apple Silicon. The backend will receive the input IR and compile a function into machine code. I did not implement a proper separation between the assembler and machine code; it's all a bit intertwined together. I am not very happy with this, but it's simple enough design that I did not bother changing it.

The available [instructions](https://github.com/andreabergia/emjay/blob/main/src/backend_aarch64.rs#L129) are modelled by a Rust `enum`, and double-duty as the assembler as well, since there are no labels, or jumps:

```rust
enum Aarch64Instruction {
    Nop,
    Ret,
    MovRegToReg {
        source: Register,
        destination: Register,
    },
    // ...
}

#[derive(Debug, Clone, Copy, PartialEq)]
enum Register {
    X0,
    X1,
    X2,
    // ...
}

impl Aarch64Instruction {
    fn make_machine_code(&self) -> Vec<u8> {
        match self {
            Nop => vec![0xD5, 0x03, 0x20, 0x1F],
            Ret => vec![0xC0, 0x03, 0x5F, 0xD6],
            // ...
        }
    }
}
```

To map from the IR virtual registers to the physical CPU registers, I have implemented a very simple [register allocator](https://github.com/andreabergia/emjay/blob/main/src/backend_register_allocator.rs). The algorithm is something very simple that I came up with, but it's quite similar to the classical [linear scan](https://web.cs.ucla.edu/~palsberg/course/cs132/linearscan.pdf) algorithm.

The approach is to allocate IR registers to HW registers in a greedy faction, and to push the HW registers in a free list as soon as the allocated IR register is not used anymore by any subsequent instruction. Afterwards, the logical HW registers are mapped to the physical HW registers. In case the algorithm runs out of hardware registers (there are a limited number after all), it [spills over to the stack](https://github.com/andreabergia/emjay/blob/main/src/backend_register_allocator.rs#L12):

```rust
#[derive(Debug, Clone, PartialEq, Eq)]
pub enum AllocatedLocation<HardwareRegister> {
    Register { register: HardwareRegister },
    Stack { offset: usize },
}
```

The core of the backend is implemented by [`Aarch64Generator`](https://github.com/andreabergia/emjay/blob/main/src/backend_aarch64.rs#L469). There are a lot of details that hopefully are clear by looking at the code, but the high level approach is to process each IR instruction and generate one or more physical instruction for it.

This is a _very_ simple and greedy strategy, and it generates somewhat inefficient code. For example, since the IR does not have an "add immediate to register" operation but rather requires a sequence of "move immediate to register" followed by "add two registers", the same happens in the generated machine code, even if the hardware actually supports instructions such as [`ADD` with immediate](https://developer.arm.com/documentation/ddi0602/2024-12/Base-Instructions/ADD--immediate---Add-immediate-value-). This could easily be improved by performing some [peephole optimization](https://en.wikipedia.org/wiki/Peephole_optimization) after the assembly has been generated, but I did not implement it.

I have opted to use only the `x9..x15` registers, i.e. the _caller-saved_ ones in the [aarch64 calling conventions](https://medium.com/@tunacici7/aarch64-procedure-call-standard-aapcs64-abi-calling-conventions-machine-registers-a2c762540278). This means that the code is free to overwrite them and it's up to the caller (i.e. the Rust code) to save and restore them. Note that I did not implement spillover allocations out of laziness; it would be simple to add some load and store to the stack. For example, this is what happens for a `mvi` IR instruction:

```rust
for instruction in function.body.iter() {
    match instruction {
        IrInstruction::Mvi { dest, val } => {
            let AllocatedLocation::Register { register }
                = self.locations[dest.0] else {
                return Err(BackendError::NotImplemented(
                    "move immediate to stack".to_string(),
                ));
            };

            instructions.push(MovImmToReg {
                register,
                value: *val,
            })
        }

        // ...
```

(Notice also just _how nice_ Rust's [`let-else`](https://doc.rust-lang.org/rust-by-example/flow_control/let_else.html) is!)

For the example above, given the IR:

```plaintext
fn main - #args: 1, #reg: 3 {
    0:  mvi  @r0, 4
    1:  mva  @r1, a0
    2:  add  @r2, r0, r1
    3:  ret  r2
}
```

the following assembler is generated:

```nasm
stp  x29, x30, [sp, #-16]!
mov  x29, sp
movz x9, 4
mov  x10, x0
add  x11, x9, x10
mov  x0, x11
ldp  x29, x30, [sp], #16
ret
```

The function code starts with a standard prologue saving the frame pointer and link registers (`x29` and `x30`) to the stack. Then there is a `movz` to store the immediate `4` in register `x9`. Next up is moving the first argument, which is in `x0`, to `x10` - this is a waste, because the argument is _already_ in a register, but it maps the `mva` instruction of the IR. Finally it's time to do the actual `add`, which stores its result in a temporary register, `x11`. And, before returning (and popping the FP and link registers), we copy the result to `x0`, which double-duties as storage for the result of the function.

A simple peephole optimization could trivially remove the need for `x11`, for example. In any case, while this is not the most efficient machine code, it is not _terrible_, and it was pretty easy to generate it by looking at the IR code and playing around with [compiler explorer](https://godbolt.org/).

## JIT

The final step of the program is to take the generate machine code and execute it. This is done in the [`jit` module](https://github.com/andreabergia/emjay/blob/main/src/jit.rs#L35). The magic sequence to do it is:

- do an anonymous [`mmap`](https://en.wikipedia.org/wiki/Mmap) to get a writable memory buffer;
- `memcpy` the machine code bytes to the buffer;
- invoke [`mprotect`](https://man7.org/linux/man-pages/man2/mprotect.2.html) to mark that memory as executable (and read-only);
- cast the pointer to a function;
- and voilà, just invoke it!

On x64/Linux you can get by without the `mprotect`, by marking the page as both writable and executable. That is not allowed on Mac Os (yes, I know it's spelled macOS now - but I am nostalgic) by default, and I did not bother to understand how to [do it](https://stackoverflow.com/questions/74124485/mmap-rwx-page-on-macos-arm64-architecture). Since my code is very simple and I do not use techniques such as [inline caches](https://en.wikipedia.org/wiki/Inline_caching), it's fine to leave the memory as read-only once the machine code has been copied into it.

## Conclusions

There you have it - a toy JIT compiler, but one built with a clear separation between the various steps, and a pretty small amount of code. I haven't covered one of the most complex parts, which is function calls and arguments passing, but I am going to do that in a follow-up post because this one already feels too long.

I have learned _a lot_ doing this project - before writing `emjay` I had some ideas on how to implement most of this, but obviously there's a big difference between "I have read about something and I think I understand it" and "I have implemented it". 😅

I am very happy about the IR design, the frontend, and the optimizer - they all turned out to be simple and I think the code is very nice. I am a bit less satisfied about the backend - I think I should have had a clearer separation between the physical instruction generation and the machine code generation (i.e. have a real assembler). I also easily could have handled the stack spillover, but I felt like I spent way too much time encoding instructions and digging through the official ARM documentation, and that left me exhausted.

I consider this project complete and I'm not going to keep working on it. However, I do wanna work on a more complex language, with control flow instructions and more than one type, but I am considering using either [`Cranelift`](https://cranelift.dev/) or [`llvm`](https://llvm.org/) to implement the backend. Let me know if you have any opinion about either one, and thanks for reading!

_Update_: a [follow-up post]({% ref "emjay-2.md" %}) has been published.
