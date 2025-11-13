---
date: 2025-02-14T16:50:00+01:00
tags:
  - architecture
title: Comments and documentation
---

Today I wanna write down some opinions about comments and documentation. Short version: comments are great when they explain the why, not the what; and documentation is great when it’s close to where decisions live and is easy to find.

## Comments: not the what, but the why

There’s a classic line that I love: “code tells you how; comments tell you why.” I mostly agree. Reading code is the best way to understand what a program does. But code is bad at telling you why a weird trade‑off was made, why a constraint exists, or what landmine you’ll step on if you “just simplify this.”

Good comments (examples):

- invariant/rationale: “We keep this cache 1 minute to avoid hammering service X which rate‑limits at 90 RPM.”
- non‑obvious trade‑off: “We duplicate this logic instead of sharing a util to keep startup time below 100ms.”
- external constraints: “This format matches a legacy partner API; do not rename fields without checking contract.”
- pointers: links to design docs, issues, or benchmarks that support the decision.

Bad comments (examples):

- restating the code: “i++ increments i.”
- apologizing instead of explaining: “Hacky but works.” Why is it hacky? What would break if you changed it?
- comments that drift: “TODO: remove after Q2” living happily in Q4.

My rule of thumb: if future‑me (or new‑hire‑you) would be confused by a choice after reading the code, add a short comment that explains the intent and constraints.

## Code comments vs. commit messages

Where does the “why” live? Two obvious places: in the code and in version control history.

Comments in code:

- pros: travel with the code when it’s moved, copied, or refactored; visible at the point of use; survive squashes and rebases.
- cons: can go stale; can add noise if overdone.

Commit messages (and PR descriptions):

- pros: perfect for narrative and context (alternatives considered, benchmarks, links to tickets); great for time‑bound decision history.
- cons: easy to lose during code moves; many teams squash; searchability depends on your tooling; readers rarely open blame unless they’re already confused.

What works well for me:

- put the durable, evergreen why next to the code; keep it short.
- put the story (what changed, alternatives, larger context) in the commit/PR.
- cross‑link: a comment can say “See ADR‑012” or “See PR #1234 for benchmarks.” A commit can say “Left a comment above FooParser about the legacy quirk.”

If your team squashes PRs, lobby for good PR descriptions and consider copying one paragraph of the key rationale into the code where it matters.

## Documenting decisions: ADRs, boards, and docs that rot

Architecture Decision Records (ADRs) are still the best lightweight way I know to capture decisions. One file per decision, concise template, stored in the repo (e.g. `docs/adr/0001-choose-postgres.md`). They work because they’re versioned with the code and they scale from tiny to large.

Miro boards, Google Docs, Notion pages, Confluence, etc. are useful for exploration and collaboration, but they often fail the “can I find it from the code in 30 seconds?” test. They also rot: links break, owners leave, screenshots age.

How to reduce drift:

- keep ADRs in the repository; link to them from the modules they affect.
- make docs discoverable from the code: a top‑level `README.md` per package/service with links to ADRs, runbooks, and public APIs.
- put “how to update this” in the doc itself. Future‑you will thank you.
- timebox ephemeral artifacts: snapshot the final Miro in the repo (export as PNG/PDF) and link to it from the ADR.

Two anti‑patterns I’ve seen a lot:

- decision tombs: an ADR directory that’s a graveyard. If a decision is superseded, write a new ADR that says so and link them.
- docs outside the change: big design docs that never get referenced from the actual code or PRs, so nobody reads them.

References worth skimming:

- Documenting Architecture Decisions (ADRs) by Michael Nygard
- ADR patterns and tooling: adr.github.io and joelparkerhenderson/architecture_decision_record
- Write the Docs: writethedocs.org

I also like keeping living docs close to code. I mentioned this mindset when writing about large, legacy codebases in my post on {% ref "post/2024/working-effectively-with-legacy-code.md" %} — tests, documentation, and structure reinforce each other.

## Public docs as a forcing function

If your project is public (or has external stakeholders), having public documentation is a fantastic forcing function. When you know others will rely on your API/contract, you tend to:

- specify inputs/outputs crisply (OpenAPI/JSON Schema, gRPC protos, etc.);
- document stability guarantees and deprecation paths;
- write examples that actually compile/run;
- keep docs near the code because you’ll get called out when they drift.

Even for internal services, pretending your docs are public is a helpful standard. A README that answers “what is this?”, “how do I run/test it?”, and “what contracts do we expose?” prevents so many Slack pings.

## A tiny checklist I use

- writing code that makes you frown? Leave a 1–3 line comment that states intent and constraint. Link to evidence.
- making a non‑obvious trade‑off? Add an ADR. Link to it from the code and the PR.
- touching a public or cross‑team surface? Update the public docs/spec and a short changelog. Call out breaking changes loudly.
- is the explanation only useful to this specific change? Put it in the commit/PR description.

## Closing

Comments aren’t a smell; misleading comments are. Documentation isn’t overhead; undiscoverable documentation is. Keep the why close to the code, keep the story in history, capture decisions in ADRs, and hold yourself to the “could a stranger find this in 30 seconds?” bar. Future‑you—and your teammates—will be grateful. ☺️
