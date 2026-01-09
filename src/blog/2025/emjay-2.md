---
date: 2025-03-31T21:30:00+02:00
tags:
  - rust
  - compiler
title: Emjay - implementing function calls
---

In this post, I am following up on the explanation of my simple JIT ~~compiler~~ glorified calculator [Emjay]({% ref "emjay.md" %}) and I will show you how I implemented function calls.

## Why the complexity?

Imagine we are JIT-compiling the following program:

```plaintext
fn f() {
    return 1 + g(2);
}

fn g(x) {
    return 2 * x;
}
```

In the backend, when generating the code for `f`, we need to insert a call to `g`. But to do that, we need the _address_ of `g` which we don't know when we are generating the code, because we will do the call to `mmap` to get the address only in a further step of the pipeline:

![pipeline](/images/2025/emjay/emjay-2.png)

## How to solve it

My original idea was to do a sort of [relocation](https://en.wikipedia.org/wiki/Relocation_(computing)):

- when generating a function call, generate a bunch of `nop` instead of the jump instruction initially;
- keep track of a mapping between positions in the assembler and functions being called;
- JIT all functions and create a mapping between function and address;
- go over all the mappings and replace the `nop` with jump instructions with the actual address.

However, a colleague suggested I try to use a trampoline function, which is what I ended up implementing. The idea I have implemented is the following:

- each function gets assigned an id (simply a progressive integer);
- the assembly code generated for a function call will always invoke a certain function defined in the Rust "runtime", which has a fixed address;
- one of the parameters of the trampoline call will be the id of the function to call;
- the trampoline will rely on a map that associates function ids to their addresses, filled when the JIT compiles all the functions, but before we start executing code. I've called this `CompiledFunctionCatalog`, and the trampoline function will receive a pointer to it.

Pretty often trampolines are used to _lazily_ compile functions as necessary; for example, see how [Mono](https://github.com/mono/mono/blob/main/docs/jit-trampolines) does it. However, Emjay compiles all functions eagerly.

## An example

For the example above, the frontend will assign the id `0` to `f` and `1` to `g`. The generated IR for the function `f` will then be:

```plaintext
fn f - #args: 0, #reg: 4 {
    0:  mvi  @r0, 1
    1:  mvi  @r2, 2
    2:  call @r1, g:1(r2)
    3:  add  @r3, r0, r1
    4:  ret  r3
}
```

where the syntax `call @r1, g:1(r2)` means "call the function named `g`, which has id `1`, passing as argument `r2`, and store the result in `r1`". (I know, the syntax for my IR is a bit cryptic).

In the Apple Silicon (aarch64) architecture, the [calling conventions](https://en.wikipedia.org/wiki/Calling_convention#ARM_(A64)) say that:

- the first 8 function parameters go in registers `x0`..`x7` and the rest go on the stack;
- the return value is stored into `x0`;
- some registers (`x9`..`x15`) are caller-saved, meaning that the callee can modify them freely;
- other registers (`x19`..`x28`) are callee-saved, meaning that the callee must save and restore them if it uses them.

[Here](https://medium.com/@tunacici7/aarch64-procedure-call-standard-aapcs64-abi-calling-conventions-machine-registers-a2c762540278) is a great article about calling conventions (in general) and the specific ones for `aarch64` if you're interested.

I have not deviated from the standard function call; arguments go in `x0`..`x7`, return value is in `x0` and I have chosen to use `x19` to store the trampoline function address. It's not uncommon for a trampoline to have a special calling convention though, but having used the standard one allows me to define it very simply as a standard Rust function.

The code in the backend, when generating a function call, uses a pretty "naive" implementation where _all_ the registers that are used in the function get saved, even if they are not actually used at that moment. Continuing the example above, the generated assembler for `f` becomes:

```arm-asm
# standard function prologue
stp  x29, x30, [sp, #-64]!
mov  x29, sp

# implementation of mvi  @r0, 1
movz x9, 1

# implementation of mvi  @r2, 2
movz x10, 2

## call to g: start
# save registers on the stack
str  x0, [x29, #24]
str  x19, [x29, #32]
str  x9, [x29, #40]
str  x10, [x29, #48]
str  x11, [x29, #56]

# parameters: first the function catalog...
movz x0, 105553154965536
# ...then the called function id (g is 1)
movz x1, 1
# ...and then the actual parameter of g
mov  x2, x10

# x19 will contain the trampoline address
movz x19, 4372771476

# perform the actual call!
blr x19

# restore saved registers from the stack
ldr  x11, [x29, #56]
ldr  x10, [x29, #48]
ldr  x9, [x29, #40]
ldr  x19, [x29, #32]

# copy return result to x11
mov  x11, x0
ldr  x0, [x29, #24]
## call to g: done

# implementation of add  @r3, r0, r1
add  x10, x9, x11

# move the return value in x0
mov  x0, x10

# standard function epilogue and return
ldp  x29, x30, [sp], #64
ret
```

All the function call code basically represents:

```rust
jit_call_trampoline(function_catalog_ptr, 2)
```

Yes, assembler is more verbose than high level languages! 😁

The trampoline function is defined as follows in the Rust code:

```rust
pub fn jit_call_trampoline(
    function_catalog_ptr: *const CompiledFunctionCatalog,
    function_index: usize,
    a0: i64,
    a1: i64,
    a2: i64,
    a3: i64,
    a4: i64,
    a5: i64,
) -> i64 {
```

Notice that the signature always takes 2 + 6 = 8 arguments, because I did not implement spilling to the stack in Emjay's backend. Therefore, since we need to use two parameters for the function catalog and the callee's id, only six registers are left; thus functions in Emjay can only take up to six parameters. It is one of its many limitations 🙂.

The [actual implementation](https://github.com/andreabergia/emjay/blob/main/src/jit.rs#L165) of the trampoline is very simple, once we remove all the debug print and comments: it simply looks up the callee's address, given its id, and then invokes it:

```rust
    let function_catalog = unsafe { &*function_catalog_ptr };
    let fun = function_catalog.get_function_pointer(FunctionId(function_index));
    fun(a0, a1, a2, a3, a4, a5);
```

The `function_catalog` is a very simple struct:

```rust
#[derive(Debug)]
pub struct CompiledFunctionCatalog {
    // Indexed by FunctionId, which are dense. Thus, we can use a simple Vec
    // and avoid the extra cost of an hash map
    addresses: Vec<JitFn>,
}

pub type JitFn = fn(i64, i64, i64, i64, i64, i64) -> i64;

#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash)]
pub struct FunctionId(pub usize);
```

The catalogue is created before the JIT creates the function pointers, so it has a fixed address. When the JIT compiles all the functions, it will fill the catalogue with all the functions' addresses. When the main function's execution starts the catalogue will be fully populated. So, our trampoline will work correctly.

## Conclusions

I have chosen to use a trampoline to handle function calls in my JIT Emjay. It has been pretty simple to implement, and it is a useful technique with a lot of applications. My implementation is quite basic and limited, as is the rest of Emjay, but it was still a very useful learning exercise - and it was an elegant and simple solution to handle relocation logic. If you're interested in the complete implementation, check it out on [GitHub](https://github.com/andreabergia/emjay).

I hope you have found this post interesting! ☺️
