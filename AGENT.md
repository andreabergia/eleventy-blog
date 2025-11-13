# Agent Handbook

## Mission
- Deliver a clean Eleventy implementation that reproduces the legacy Hugo blog found at `../hugoblog`.
- Follow `migration-plan.md` for sequencing and use this file as quick orientation when picking up the work midstream.

## Current Status Snapshot
- Eleventy project is up and running with `@11ty/eleventy` + `luxon`; `npm run build` succeeds and outputs into `_site/`.
- All Hugo markdown (2014–2025), preview JSON payloads, and static assets have been copied over (`src/blog/**`, `src/_data/previews`, `public/**`).
- Key dynamic behaviors already exist: permalink computation, aliases → redirect pages, featured/recent collections, series metadata, and the `previewExternal` & `postSeries` shortcodes.
- Front-end is intentionally in a placeholder state; we will not copy the Hugo/Coder theme but instead design a fresh look & feel (new fonts, layout system, and visual language).
- URL parity for individual posts (`/blog/{yyyy}/{MM}/{slug}`) is in place, but we still need `/index.xml`, `/sitemap.xml`, `/robots.txt`, and production-ready head/footer markup.

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

## Immediate Focus
1. Define and implement the new visual identity (fonts, spacing scale, header/footer/navigation, color treatment) directly in Eleventy templates/CSS.
2. Add SEO + social metadata (canonical URLs, OpenGraph/Twitter cards, favicon links) and integrate GoatCounter + Disqus in the post layout.
3. Ship `/index.xml`, `/sitemap.xml`, and `/robots.txt` via Eleventy so downstream consumers keep working.
4. Backfill README/deployment notes once the above features are stable.

## Open Questions To Track
- Will the external preview data continue to be maintained manually, or should a fetch routine be ported?
- Are there Hugo-only markdown extensions that need custom Eleventy markdown-it plugins?
- What deployment target (Netlify/Vercel/GitHub Pages) should the Eleventy build target use?
