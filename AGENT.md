# Agent Handbook

## Mission
- Deliver a clean Eleventy implementation that reproduces the legacy Hugo blog found at `../hugoblog`.
- Follow `migration-plan.md` for sequencing and use this file as quick orientation when picking up the work midstream.

## Current Status Snapshot
- Eleventy scaffolding has not been created yet; the repository is empty aside from planning docs.
- Hugo content, layouts, and data live outside the workspace at `../hugoblog`; use those files as the migration source of truth.
- No Node dependencies or build scripts are installed; the first engineering task will be project bootstrap.
- URL compatibility is critical: every legacy URL must continue to work, even if other Hugo-specific behavior diverges.

## Key References
- `migration-plan.md`: authoritative checklist for the Eleventy migration.
- `../hugoblog/config.toml` and `../hugoblog/layouts/**`: canonical example of desired behavior.
- `../hugoblog/data/`: JSON payloads powering the `preview-external` shortcode.

## Operating Guidelines
1. Review the open migration phase in `migration-plan.md` before coding; update the plan when scope changes.
2. Keep parity with Hugo URLs (`/blog/{year}/{month}/{slug}`) unless requirements change.
3. Preserve data-driven features (featured posts, series navigation, external previews) by building matching Eleventy collections and shortcodes.
4. Use passthrough copy for static assets and reintroduce custom CSS/JS early to avoid regressions in later QA steps.
5. Document new npm scripts, build steps, or architectural decisions in `README.md` as they are introduced.

## Suggested Commands (once project exists)
- `npm init -y` — create base `package.json`.
- `npm install @11ty/eleventy` — add Eleventy as a dev dependency.
- `npx @11ty/eleventy --serve` — run local dev server.
- `npx @11ty/eleventy --quiet` — build production output for inspection.

## Open Questions To Track
- Will the external preview data continue to be maintained manually, or should a fetch routine be ported?
- Are there Hugo-only markdown extensions that need custom Eleventy markdown-it plugins?
- What deployment target (Netlify/Vercel/GitHub Pages) should the Eleventy build target use?
