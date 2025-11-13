# Eleventy Migration Plan

## Status Overview
- ✅ **0–4** (Discovery through Collections): inventory complete, Eleventy project bootstrapped, site data + content migrated, and custom collections/shortcodes are functioning.
- ⚠️ **5–8** (Layouts, Shortcodes refinements, Assets): base layouts exist but we still need to design and implement a brand-new look & feel (fonts, layout grid, navigation, hero/footer).
- ⛔ **9–11** (Integrations, QA, Launch): SEO metadata, RSS, sitemap, GoatCounter/Disqus, and deployment docs are still outstanding.
- 🎯 **Current focus**: land the new layout (homepage, blog index, header/footer), wire up RSS + metadata, then tackle analytics/discussion embeds before QA.

### Upcoming Focus
1. Implement the new visual system (head/nav/hero/footer, typography, icons, color-scheme toggle) directly in Eleventy templates and CSS.
2. Layer in SEO + social metadata plus GoatCounter and Disqus wiring on post pages.
3. Produce `/index.xml`, `/sitemap.xml`, and `/robots.txt` via Eleventy so downstream consumers and crawlers keep working.

## 0. Discovery & Inventory
- Document current Hugo features, layouts, and integrations (partials, shortcodes, params in `../hugoblog/config.toml`).
- Snapshot permalink expectations (`/blog/{year}/{month}/{slug}`), taxonomy pages, series handling, and RSS endpoints.
- List all Hugo shortcodes and partials (`layouts/partials`, `layouts/shortcodes`) and note required data inputs.
- Audit front matter quirks and content edge cases (e.g., mixed indentation, external links, featured ordering).
- Catalogue static assets, custom CSS/JS, and third-party services (Disqus, GoatCounter, RSS).

## 1. Eleventy Project Bootstrap
- Initialize Eleventy project in this repo with `package.json`, `.eleventy.js`, and basic directory structure (`src/` vs `_site/` output).
- Configure Eleventy to read Markdown/front matter from a `content/` (or `src/blog/`) directory and output to `_site/`.
- Enable passthrough file copy for static files and assets directory equivalents.

## 2. Global Configuration & Data Cascade
- Recreate site metadata (title, base URL, author info, social links) as global data files (`src/_data/site.js` or `.json`).
- Implement permalink defaults to mirror Hugo’s `[Permalinks]` rules.
- Set date formatting helper equivalent to Hugo’s `Site.Params.dateFormat`.
- Port navigation and footer data (if any) into `_data` or dedicated includes.

## 3. Content Migration
- Copy Markdown posts from `../hugoblog/content/post/**` into Eleventy’s content directory, preserving year/month subfolders.
- Normalize front matter (YAML/TOML) to Eleventy-friendly YAML; fix indentation or key mismatches.
- Automate front-matter conversion (small Node script or Eleventy data transform) so each new batch of posts migrates consistently.
- Introduce new front-matter fields as needed (e.g., `featured`, `externalLink`, `series`) to maintain behavior.
- Track migration progress in a table or checklist (Hugo slug → Eleventy path) to guarantee full coverage.
- Create a script or manual checklist to validate that every Hugo post has an Eleventy counterpart.

## 4. Collections & Taxonomies
- Define Eleventy collections for `posts`, `tags`, and `series`.
- Lock in final tag/series URL patterns (`/blog/tags/{tag}`, etc.) before generating archive pages to avoid post-migration redirects.
- Implement helper collections: 
  - Featured posts (sorted by `featured` value).
  - Recent posts (limit 10, newest first).
  - Series groups keyed by slugified series name.
- Add filters/shortcodes to format dates and generate tag/series URLs.

## 5. Layout System & Templates
_Status: skeletal base/page/post layouts exist, but we still need to implement the brand-new site design (fonts, nav/footer, hero, overall grid)._
- Choose templating language (likely Nunjucks) and scaffold shared layout (base template with head, header, footer).
- Design and implement the new header/footer/navigation, hero, and supporting layout partials (no need to mimic Hugo).
- Rebuild post template with metadata, tags, series box placeholder, Disqus/GoatCounter hooks.
- Create list templates for:
  - Homepage (featured + recent sections).
  - Blog index/pagination if required.
  - Tag archive pages.
  - Series detail pages with list ordering matching Hugo.
- Implement RSS feed (`/index.xml`) using Eleventy config or plugin.

## 6. Shortcodes & Components
_Status: `preview-external` and series shortcode ported; need styling parity + any remaining Hugo shortcodes._
- Re-implement `post-series` shortcode to render current series context using Eleventy collections.
- Recreate `preview-external` shortcode to read from `_data` JSON files; handle missing data gracefully.
- Add any additional shortcodes/filters uncovered during inventory (e.g., Markdown inside shortcodes, rel permalinks).

## 7. Data Files & External Link Previews
_Status: Hugo JSON payloads copied into `src/_data/previews`; confirm ongoing update workflow._
- Migrate all JSON files from `../hugoblog/data` into Eleventy’s `_data` directory, ensuring valid key names.
- If data-fetch automation is needed (`fetch-microlink` script), decide whether to port the script or replace with Eleventy data fetch.
- Validate that templates correctly reference the migrated data and that assets (logos) resolve.

## 8. Assets, Styling & Scripts
_Status: placeholder `site.css` exists, but the bespoke `css/andrea.css`, fonts, icons, and JS toggles/goatcounter scripts still need to be ported._
- Copy `static/` and relevant `assets/` content; configure passthrough for images, fonts, favicons.
- Port custom CSS (`css/andrea.css`) and JS (`js/goatcounter-count.js`) into Eleventy pipeline; wire imports in base layout.
- Decide on build tooling for CSS/JS (keep plain files, or add bundler/postcss if Hugo previously used Pipes).
- Verify theme-dependent classes still exist or adjust markup to match CSS expectations.

## 9. Integrations & Metadata
_Status: Not started — need SEO meta tags, favicons, analytics scripts, Disqus, etc._
- Embed Disqus shortname in post layout with client-side toggle if desired.
- Ensure GoatCounter script loads on pages that require analytics.
- Port social meta tags, favicon links, and OpenGraph/Twitter cards from Hugo head partials.
- Recreate sitemap and robots.txt if Hugo generated them automatically.

## 10. Verification & QA
_Status: Not started._
- Build both Hugo and Eleventy versions locally; compare critical URLs, metadata, and rendered HTML.
- Check markdown rendering differences (shortcodes, code fences, markdown-it vs Goldmark quirks).
- Validate pagination, tag/series pages, RSS feed, and featured/recent lists.
- Run link checker or Eleventy’s output validation to catch broken internal/external links.
- Add a quick regression command (e.g., `npm run build && linkinator _site`) to spot template or taxonomy breakages before commits.
- Set up automated builds/tests (npm scripts, Netlify/Vercel preview) and document run commands.

## 11. Launch & Cleanup
_Status: Not started._
- Configure deployment target (Netlify/Vercel/GitHub Pages) with Eleventy build command.
- Update DNS/base URL references if needed; ensure redirects (if permalink changes) are defined.
- Archive legacy Hugo repo or mark as read-only once migration verified.
- Update project README with Eleventy usage instructions and maintenance notes.
