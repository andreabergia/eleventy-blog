---
date: 2026-02-25T08:30:00+01:00
tags:
  - ai
  - rust
title: "PyChat.ai"
excerpt: "I have built a Python REPL that embeds an LLM agent that can inspect and modify Python runtime state."
image: /images/2026/pychat.ai/pychatai.png
---

I have built something that I believe is pretty interesting: it's a Python REPL that embeds an LLM agentic loop, which has access to the Python environment and can query a value or run code. Here's a screenshot of a simple interaction:

![Screenshot of PyChat.ai terminal UI showing Python + AI interaction](/images/2026/pychat.ai/pychatai.png)

I want to stress that this is just a prototype! It supports only one LLM provider (Gemini), the UI is buggy and not particularly pretty, and it is _incredibly_ insecure. The model can run arbitrary Python code, so it can read your file system or use the network, which makes it susceptible to the [lethal trifecta](https://simonwillison.net/2025/Jun/16/the-lethal-trifecta/). Please don't use this outside of a container or virtual machine!

Here's the source code: [https://github.com/andreabergia/pychat.ai](https://github.com/andreabergia/pychat.ai), with the instructions for how to run it.

## How does this work

PyChat.ai is a Rust program that, via [PyO3](https://pyo3.rs/) embeds the Python interpreter. It has a full screen terminal UI where the user can enter Python code, that is executed in the embedded interpreter. However, if the user presses `<tab>`, the input switches to AI mode, where it is sent to an LLM (Google Gemini). The model has access to three tools:

- `list_globals`
- `inspect(expr)`
- `eval_expr(expr)`

Therefore the model can query the state of the Python interpreter and edit it. This allows it to be a helpful assistant that, rather than dealing with source code like Claude Code or Codex, can deal with data structures _at runtime_, while the program is running. Perhaps Python is not the most suitable language for this - I guess it would have been more idiomatic to do this for something like Clojure, but I am not familiar enough with that.

I can imagine that this tool could be useful as a learning tool, for debugging, or for data exploration - although all of that would definitely require a lot of polishing. It definitely isn't a product, at least now.

But I think that the idea - while simple - can be extended in multiple directions. For example, a harness could be built that connects a model to a live process using something like the DAP protocol, to create an agent-powered debugger. It's kind of the inverse idea of an MCP server in a way - here, the harness is running the agent loop and determining which tools to expose to it.

## How have I built this

I have to thank my super smart teammate [Jimmy Miller](https://jimmyhmiller.com/) for the seed of the idea - he likes to build programming languages and REPLs, and he's fascinated with modifying and evolving programs at runtime. We were chatting about the possibilities of integrating tools like Claude with that sort of environment, and from there I came up with my prototype.

Python was a simple choice - the only alternative I considered was JavaScript, but I felt like Python was more natural for this sort of project. Also, Python was one of my first programming languages, and I remember fondly using the IDLE REPL as I was learning it.

I have decided to integrate only Gemini because Google offers a decent free tier, and in this way I could make sure that anyone interested could play with this without needing to buy API credits.

Building this in Rust was an easy decision for me. In my experience, the type system and strong tooling really help the agent write good and well-tested code. Libraries like [clap](https://docs.rs/clap/latest/clap/), [ratatui](https://ratatui.rs/), [reqwest](https://docs.rs/reqwest/latest/reqwest/), and especially [PyO3](https://pyo3.rs/) were instrumental in creating a working prototype in a few days. Plus, as I have [written in the past]({% ref "2022-11-30-languages-opinion-part-2-rust.md" %}), I love Rust.

Something interesting is that I have built all of the project without writing any code manually - only prompting and directing the model. I have used Codex with [GPT‑5.3‑Codex](https://openai.com/index/introducing-gpt-5-3-codex/) for this, and I have been really impressed by it.

I have also been trying to "let go" more than usual and trust the model, by letting it work on larger features autonomously. While I do still keep an eye on the generated code to have some idea of the architecture and be able to steer it, I have not reviewed the code closely. It's been a fun - and slightly terrifying experience. When in early 2025 people were saying "LLMs will write 80% of the code by the end of the year" it sounded totally laughable to me... and yet, here we are.

## Conclusions

Well, this was a fun project to build, and - I think - a pretty interesting idea. I hope someone builds something else interesting based on this!
