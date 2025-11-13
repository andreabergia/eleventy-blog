---
date: 2024-11-20T21:50:00+01:00
tags:
  - debugging
series: ["Crazy debugging stories"]
title: Crazy debugging stories - Macros
---

Welcome to the second post of my new miniseries about some of the craziest bugs I've had to investigate and debug throughout my career.

# Macros

This is [another story]( {% ref "crazy-debugging-stories-1-recursion.md" %} ) that happened to me when working on a massive C++ code base, around a decade ago.

The investigation started when one of our largest customer complained about crashes of our monolith. This was our biggest installation, and for some strange reason, it was running on Windows. So, the story started when we received a fantastic `.dmp` file and a lot of urgent emails.

To tackle the issue, I turned to [WinDbg](https://learn.microsoft.com/en-gb/windows-hardware/drivers/debugger/). If you have never used it, count yourself lucky. It’s powerful, sure, but I could not determine any logic behind the cryptic syntax of its commands. For example, you use `k` for a stack trace and `~` for a thread dump. If you wanna see more examples, take a look at an [official tutorial from Microsoft](https://github.com/MicrosoftDocs/windows-driver-docs/blob/staging/windows-driver-docs-pr/debugger/getting-started-with-windbg.md).

With the help of some Google-fu, I determined the issue: a stack overflow. A thread was exhausting its 4 MB stack. But here’s where it got weird—the stack overflow wasn’t caused by infinite recursion. Instead, I noticed massive jumps in the stack pointer between function calls. Some calls were allocating 700 KB of stack space in one go!

Initially, I assumed large data structures or arrays were being allocated on the stack, so I asked my colleagues to look for the biggest offenders. A few hours later, they came back empty-handed. The function in question looked innocent enough:

```c++
void my_function(Transaction &tx, User *user, long table_id, long rec_id) {
    ASSERT(user != null);
    ASSERT(IS_VALID_TABLE_ID(table_id));
    
    long stuff = find_stuff(tx, user, table_id);
    ASSERT(stuff > 0);
    
    // Hundreds more of lines like this
}
```

Nothing really seemed to be the problem; no big structs or arrays were being allocated on the stack. After staring at the code for a while, I was left with no clues. So I ended up looking at the disassembly in the debugger... which made me realize something crazy - apparently, each `ASSERT` macro invocation was bumping the stack pointer by about 3.5kb! Here is the macro definition:

```c++
#define ASSERT(cond) do { if (!(cond)) THROW(UNEXPECTED_ERROR); } while (0)
```

By the way, I have never really understood why there was that `do` instead of just a block. Probably, once upon a time there were some reasons related to the _very_ old C++ compilers we used to support twenty years ago. That product also ran on unusual architecture such as HP-UX on Itanium... but who knows.

Anyway, the interesting part was actually in the _other_ macro:

```c++
#define THROW(message_id) throw ProjectException(message_id)
```

Which meant that the function actually looked like this:

```c++
void my_function(Transaction &tx, User *user, long table_id, long rec_id) {
    do { if (!(user != null)) { throw ProjectException(UNEXPECTED_ERROR); } } while (0);
    do { if (!(IS_VALID_TABLE_ID(table_id))) { throw ProjectException(UNEXPECTED_ERROR); } } while (0);

    long stuff = find_stuff(tx, user, table_id);
    do { if (!(stuff > 0)) { throw ProjectException(UNEXPECTED_ERROR); } } while (0);
    // etc ...
}
```

A common practice in this code base was to use _a ton_ of assertions everywhere in the code - probably because the senior architect was an old-school C guru, and didn't really believe in [using types properly]( {% ref "2022-09-12-primitive-obsession-smell.markdown" %} ). Since the compiler needed space to construct the temporary to throw, each of these assertion was therefore allocating a `ProjectException` on the stack.

The last piece of the puzzle involved looking at the class, which was something like the following:

```c++
class ProjectException {
public:
    ProjectException(message_id) {
        for (int lang = 0; lang < NUM_LANGUAGES; ++lang) {
            strcpy(message_translated[lang], get_message_in_lang(lang, message_id));
        }
    }
    
private:
    const char message_translated[NUM_LANGUAGES][MAX_MESSAGE_LEN];
};
```

This class was used to store exceptions that ended up displayed in the UI, in the customer's language. For some reason, the implementation would store the message in _all_ supported languages - even though only the user's current language (or the default language `0`, which was English) would really be used in a given transaction.

For this particular customer, and only for them, we had overridden the default `NUM_LANGUAGES` from two to _seven_. They were a very large multinational, and they wanted the various local branches to have as much as possible of the product in their language, so in our architecture that meant having every "multi-language" buffer multiplied by seven. And, `MAX_MESSAGE_LEN` was `512` bytes.

So, the sum of all these questionable decisions and bad practices meant that each `ASSERT` in the code was allocating an object of about 3.5kb on the stack. This function was quite long, and filled with assertions alongside the business logic... which meant that it really ended up using 700 kb in the stack when invoked!

The fix was super simple - I just replaced the `THROW` macro definition with a normal function:

```c++
void THROW(int message_id) {
    throw ProjectException(message_id);
}
```

Therefore, now the caller functions would just look like this:

```c++
void my_function(Transaction &tx, User *user, long table_id, long rec_id) {
    do { if (!(user != null)) { THROW(UNEXPECTED_ERROR); } } while (0);
    do { if (!(IS_VALID_TABLE_ID(table_id))) { THROW(UNEXPECTED_ERROR); } } while (0);
    // etc ...
}
```

With this change, the stack space for the `ProjectException` would only be allocated when we actually needed to throw it.

The lesson here is simple: don't use macros. However, in this case, the macro misuse was just the tip of the iceberg - the codebase was filled with old-school C++ practices and... just bad practices (I remember a function with some 60 arguments!). 😊

I hope you've enjoyed this, and thanks for reading!
