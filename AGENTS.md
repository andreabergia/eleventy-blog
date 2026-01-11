This is the personal website of Andrea Bergia, a software engineer based in Italy. 

It is implemented an Eleventy (11ty) static site generator blog, built with Nunjucks templates and Markdown content. It is a migration of an older Hugo version, contained at ../hugoblog.

## Development Commands

```bash
# Start development server with live reload
npm run dev

# Build for production
npm run build

# Run unit tests
npm test
```

The built site is output to `dist/` directory.

Assume the dev server is always up and running on port 8080.

### Unit Tests

Tests are located in the `test/` directory and run using Node's built-in test runner. The test suite includes basic smoke tests - not full coverage, which is out of scope. Tests expect the site to be built (run `npm run build` before `npm test`).

### Core Configuration

- **Main config**: `.eleventy.js` (348 lines) - Defines collections, filters, shortcodes, and build settings
- **Content utilities**: `lib/content-utils.js` - Shared functions for slugification, alias handling, and data normalization
- **Site data**: `src/_data/site.json` - Global site metadata (title, author, navigation, social links)

### Directory Structure

```
src/
├── _data/              # Global data files
│   ├── site.json       # Site metadata
│   └── previews/       # External link preview cache (~150 JSON files)
├── _includes/          # Reusable templates
│   └── layouts/        # Base, post, page, redirect layouts
├── blog/               # Blog posts organized by year (2022-2025, 110+ posts)
├── assets/             # CSS/JS resources
├── post/               # Blog listing page
├── series/             # Series listing pages
├── tags/               # Tag listing pages
└── aliases/            # URL redirect pages
```

### Content Organization

**Blog Posts** (`src/blog/YYYY/*.md`):
- Date-prefixed filenames: `YYYY-MM-DD-title.md`
- Required frontmatter: `date`, `title`, `tags`
- Optional frontmatter: `series`, `featured`, `aliases`, `draft`
- Layout: `layouts/post.njk`
- URL format: `/blog/YYYY/MM/slug/`

**Frontmatter Example**:
```yaml
---
date: 2025-01-06T10:00:00+02:00
title: "Post Title"
tags:
  - rust
  - parsing
series: "Series Name"
featured: 1
aliases:
  - /old-url/path
draft: false
---
```

### Collections (`.eleventy.js`)

The build creates several collections for organizing content:

1. **`posts`** - All non-draft blog posts, sorted chronologically
2. **`tagsList`** - Unique tags with associated posts
3. **`series`** - Posts grouped by series
4. **`seriesMap`** - Object lookup for series data
5. **`featuredPosts`** - Posts with `featured` frontmatter value
6. **`recentPosts`** - Last 10 posts
7. **`aliases`** - URL redirects from old to new URLs

### Custom Filters (`.eleventy.js:89-100`)

- **`readableDate`** - Formats dates using Luxon (format from `site.json`)
- **`dateIso`** - Converts to ISO 8601 format
- **`slugify`** - Normalizes strings to URL-safe slugs

### Custom Shortcodes (`.eleventy.js:199-332`)

1. **`{% previewExternal "slug" %}`** - Renders external link preview card
   - Loads data from `src/_data/previews/{slug}.json`
   - Displays title, description, author, publisher, favicon
   - Graceful fallback for missing data

2. **`{% postSeries %}`** - Renders series navigation box in header

3. **`{% ref "path/to/post" %}`** - Resolves internal post references
   - Accepts multiple formats: filename, relative path, full path
   - Returns post URL
   - Warns on missing references

### URL Patterns

- **Blog posts**: `/blog/YYYY/MM/post-slug/`
- **Tags**: `/tags/tag-slug/` (paginated)
- **Series**: `/series/series-slug/` (paginated)
- **Blog listing**: `/post/`
- **Aliases**: Generate redirect pages at old URLs

### Template Inheritance

```
base.njk (root)
├── post.njk (blog posts)
├── page.njk (static pages)
└── redirect.njk (alias redirects)
```

### Styling

Main stylesheet: `src/assets/css/site.css`
- Dark theme with CSS variables
- Typography: Bebas Neue (headings), Inter (body), JetBrains Mono (code)
- Responsive design patterns

### URL Migration

Use the `aliases` frontmatter field to redirect old URLs:

```yaml
aliases:
  - /old-path/to/post
  - /another-old-path
```

This generates redirect pages at the old URLs using meta refresh.

### Internal References

Use the `{% ref %}` shortcode to link between posts:

```markdown
See my [previous post]({% ref "2024-12-01-previous-post.md" %})
```

Accepts multiple path formats:
- Filename: `post.md`
- Relative: `./2024/post.md`
- Path from blog: `2024/12-01-post.md`

## Rules

- Do not use CSS transitions
- In CSS, strive to reuse existing variable if they have the same semantics
- CSS class name should _not_ have a double dash (no `link--active`)
- **Always** validate the generated html by building the website and inspecting the generated file
- Always run a build and unit tests before saying "done"

