# Image Optimization Implementation Plan

## Goal
Add automatic WebP image optimization to all blog images using standard markdown syntax.

## Steps

### 1. Install Package
```bash
npm install --save-dev @11ty/eleventy-img
```

### 2. Create Image Helper Function
**File**: `lib/image-shortcode.js`

```javascript
const Image = require("@11ty/eleventy-img");
const path = require("path");

async function imageShortcode(src, alt, sizes = "(max-width: 800px) 100vw, 800px") {
  // Skip external images
  if (src.startsWith("http://") || src.startsWith("https://")) {
    return `<img src="${src}" alt="${alt}" loading="lazy">`;
  }

  // Extract anchor (e.g., #center)
  let anchor = "";
  if (src.includes("#")) {
    [src, anchor] = src.split("#");
    anchor = `#${anchor}`;
  }

  // Convert /images/path to ./public/images/path
  const imagePath = src.startsWith("/images/")
    ? path.join("./public", src)
    : src;

  let metadata = await Image(imagePath, {
    widths: [400, 800, 1200, 1600, null],
    formats: ["webp", null], // webp + original format
    outputDir: "./_site/images/optimized/",
    urlPath: "/images/optimized/",
    cacheOptions: {
      duration: "1w",
      directory: ".cache"
    }
  });

  let imageAttributes = {
    alt,
    sizes,
    loading: "lazy",
    decoding: "async"
  };

  return Image.generateHTML(metadata, imageAttributes);
}

module.exports = imageShortcode;
```

### 3. Configure Markdown-it Override
**File**: `.eleventy.js` (add after line 96, after plugin setup)

```javascript
const imageShortcode = require("./lib/image-shortcode");

module.exports = function (eleventyConfig) {
  eleventyConfig.addPlugin(syntaxHighlight, { showLineNumbers: false });
  eleventyConfig.addWatchTarget("src/_data/previews");

  // Add markdown-it image override
  eleventyConfig.amendLibrary("md", (mdLib) => {
    const defaultImageRenderer = mdLib.renderer.rules.image;

    mdLib.renderer.rules.image = function (tokens, idx, options, env, self) {
      const token = tokens[idx];
      const src = token.attrGet("src");
      const alt = token.content;

      // Return async placeholder - will be processed during build
      return `<eleventy-image src="${src}" alt="${alt}"></eleventy-image>`;
    };
  });

  // Add async transform to process image placeholders
  eleventyConfig.addTransform("processImages", async function (content) {
    if (!this.page.outputPath?.endsWith(".html")) {
      return content;
    }

    const imageRegex = /<eleventy-image src="([^"]+)" alt="([^"]*)"><\/eleventy-image>/g;
    const promises = [];
    const replacements = [];

    let match;
    while ((match = imageRegex.exec(content)) !== null) {
      const [fullMatch, src, alt] = match;
      const promise = imageShortcode(src, alt).then(html => {
        replacements.push({ placeholder: fullMatch, html });
      });
      promises.push(promise);
    }

    await Promise.all(promises);

    let result = content;
    for (const { placeholder, html } of replacements) {
      result = result.replace(placeholder, html);
    }

    return result;
  });

  // ... rest of existing config
```

### 4. Update .gitignore
Add caching directory:
```
.cache/
```

### 5. Build and Test
```bash
# First build (will process all 66 images)
npm run build

# Verify optimized images created
ls -la _site/images/optimized/

# Check that cache works (second build should be fast)
npm run build

# Test dev server
npm run dev
```

### 6. Verification Checklist
- [ ] `_site/images/optimized/` contains WebP and original format images
- [ ] Blog posts show `<picture>` tags in HTML
- [ ] Images load as WebP in Chrome/Firefox (check Network tab)
- [ ] Original format falls back in older browsers
- [ ] Responsive srcset includes 400w, 800w, 1200w, 1600w
- [ ] Second build is fast (<5 seconds)
- [ ] Dev server works with live reload

## Files Modified
- `.eleventy.js` - Add markdown-it override and transform
- `lib/image-shortcode.js` - New file
- `.gitignore` - Add .cache/
- `package.json` - Updated by npm install

## Output Structure
```
_site/images/optimized/
  ├── {hash}-400w.webp
  ├── {hash}-800w.webp
  ├── {hash}-1200w.webp
  ├── {hash}-1600w.webp
  └── {hash}.{original}
```
