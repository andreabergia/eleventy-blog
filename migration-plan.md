# Eleventy Migration Plan

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
- Introduce new front-matter fields as needed (e.g., `featured`, `externalLink`, `series`) to maintain behavior.
- Create a script or manual checklist to validate that every Hugo post has an Eleventy counterpart.

## 4. Collections & Taxonomies
- Define Eleventy collections for `posts`, `tags`, and `series`.
- Implement helper collections: 
  - Featured posts (sorted by `featured` value).
  - Recent posts (limit 10, newest first).
  - Series groups keyed by slugified series name.
- Add filters/shortcodes to format dates and generate tag/series URLs.

## 5. Layout System & Templates
- Choose templating language (likely Nunjucks) and scaffold shared layout (base template with head, header, footer).
- Port header/footer from Hugo partials into Eleventy includes; recreate navigation logic.
- Rebuild post template with metadata, tags, series box placeholder, Disqus/GoatCounter hooks.
- Create list templates for:
  - Homepage (featured + recent sections).
  - Blog index/pagination if required.
  - Tag archive pages.
  - Series detail pages with list ordering matching Hugo.
- Implement RSS feed (`/index.xml`) using Eleventy config or plugin.

## 6. Shortcodes & Components
- Re-implement `post-series` shortcode to render current series context using Eleventy collections.
- Recreate `preview-external` shortcode to read from `_data` JSON files; handle missing data gracefully.
- Add any additional shortcodes/filters uncovered during inventory (e.g., Markdown inside shortcodes, rel permalinks).

## 7. Data Files & External Link Previews
- Migrate all JSON files from `../hugoblog/data` into Eleventy’s `_data` directory, ensuring valid key names.
- If data-fetch automation is needed (`fetch-microlink` script), decide whether to port the script or replace with Eleventy data fetch.
- Validate that templates correctly reference the migrated data and that assets (logos) resolve.

## 8. Assets, Styling & Scripts
- Copy `static/` and relevant `assets/` content; configure passthrough for images, fonts, favicons.
- Port custom CSS (`css/andrea.css`) and JS (`js/goatcounter-count.js`) into Eleventy pipeline; wire imports in base layout.
- Decide on build tooling for CSS/JS (keep plain files, or add bundler/postcss if Hugo previously used Pipes).
- Verify theme-dependent classes still exist or adjust markup to match CSS expectations.

## 9. Integrations & Metadata
- Embed Disqus shortname in post layout with client-side toggle if desired.
- Ensure GoatCounter script loads on pages that require analytics.
- Port social meta tags, favicon links, and OpenGraph/Twitter cards from Hugo head partials.
- Recreate sitemap and robots.txt if Hugo generated them automatically.

## 10. Verification & QA
- Build both Hugo and Eleventy versions locally; compare critical URLs, metadata, and rendered HTML.
- Check markdown rendering differences (shortcodes, code fences, markdown-it vs Goldmark quirks).
- Validate pagination, tag/series pages, RSS feed, and featured/recent lists.
- Run link checker or Eleventy’s output validation to catch broken internal/external links.
- Set up automated builds/tests (npm scripts, Netlify/Vercel preview) and document run commands.

## 11. Launch & Cleanup
- Configure deployment target (Netlify/Vercel/GitHub Pages) with Eleventy build command.
- Update DNS/base URL references if needed; ensure redirects (if permalink changes) are defined.
- Archive legacy Hugo repo or mark as read-only once migration verified.
- Update project README with Eleventy usage instructions and maintenance notes.
