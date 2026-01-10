const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const { DateTime } = require("luxon");
const syntaxHighlight = require("@pborenstein/eleventy-md-syntax-highlight");
const site = require("./src/_data/site.json");
const {
  aliasToPermalink,
  getAliases,
  getSeriesList,
  slugify
} = require("./lib/content-utils");
const imageShortcode = require("./lib/image-shortcode");

const POST_GLOB = "./src/blog/**/*.{md,markdown}";
const PREVIEW_DATA_DIR = path.join(__dirname, "src/_data/previews");
const previewCache = new Map();
let refLookup = new Map();

const escapeHtml = (value = "") =>
  String(value ?? "").replace(/[&<>"']/g, (char) => {
    switch (char) {
      case "&":
        return "&amp;";
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case '"':
        return "&quot;";
      case "'":
        return "&#39;";
      default:
        return char;
    }
  });

const countWords = (content) => {
  if (!content) return 0;
  const text = content.replace(/<[^>]*>/g, "");
  const words = text.trim().split(/\s+/);
  return words.length;
};

const collectPosts = (collectionApi) =>
  collectionApi
    .getFilteredByGlob(POST_GLOB)
    .filter((item) => !item.data.draft)
    .sort((a, b) => (a.date || 0) - (b.date || 0));

const buildSeriesGroups = (posts) => {
  const groups = new Map();

  posts.forEach((post) => {
    const seriesItems = getSeriesList(post.data);
    if (!seriesItems.length) return;

    seriesItems.forEach((seriesName) => {
      const slug = slugify(seriesName);
      if (!groups.has(slug)) {
        groups.set(slug, {
          name: seriesName,
          slug,
          posts: []
        });
      }
      groups.get(slug).posts.push(post);
    });
  });

  return Array.from(groups.values())
    .map((group) => ({
      ...group,
      posts: group.posts.sort((a, b) => (a.date || 0) - (b.date || 0))
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
};

const loadPreviewPayload = (src) => {
  if (!src) return null;
  const filename = path.join(PREVIEW_DATA_DIR, `${src}.json`);
  if (previewCache.has(filename)) {
    return previewCache.get(filename);
  }

  try {
    const raw = fs.readFileSync(filename, "utf8");
    const parsed = JSON.parse(raw);
    previewCache.set(filename, parsed);
    return parsed;
  } catch (error) {
    return null;
  }
};

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

      const srcEncoded = Buffer.from(src).toString("base64");
      const altEncoded = Buffer.from(alt).toString("base64");

      // Return async placeholder - will be processed during build
      return `<eleventy-image src="${srcEncoded}" alt="${altEncoded}"></eleventy-image>`;
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
      const [fullMatch, srcEncoded, altEncoded] = match;
      const src = Buffer.from(srcEncoded, "base64").toString("utf8");
      const alt = Buffer.from(altEncoded, "base64").toString("utf8");

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

  eleventyConfig.addFilter("readableDate", (dateObj) => {
    if (!dateObj) return "";
    const format = site.dateFormat || "LLLL d, yyyy";
    return DateTime.fromJSDate(dateObj, { zone: "utc" }).toFormat(format);
  });

  eleventyConfig.addFilter("dateIso", (dateObj) => {
    if (!dateObj) return "";
    return DateTime.fromJSDate(dateObj, { zone: "utc" }).toISO();
  });

  eleventyConfig.addFilter("slugify", slugify);

  eleventyConfig.addFilter("gravatar", (email, size = 80) => {
    if (!email) return "";
    const hash = crypto.createHash("md5").update(email.toLowerCase().trim()).digest("hex");
    return `https://www.gravatar.com/avatar/${hash}?s=${size}`;
  });

  eleventyConfig.addFilter("wordCount", countWords);

  eleventyConfig.addFilter("readingTime", (content) => {
    const words = countWords(content);
    const wordsPerMinute = 200;
    return Math.ceil(words / wordsPerMinute);
  });

  eleventyConfig.addCollection("posts", (collectionApi) => {
    const posts = collectPosts(collectionApi);
    const lookup = new Map();

    posts.forEach((post) => {
      if (!post.inputPath || !post.url) return;
      const normalizedPath = post.inputPath.replace(/^[./]+/, "");
      const relativeFromBlog = normalizedPath.replace(/^src\/blog\//, "");
      const posixRelative = relativeFromBlog.replace(/\\/g, "/");
      const fileName = path.basename(posixRelative);
      const stem = path.basename(fileName, path.extname(fileName));

      lookup.set(fileName, post.url);
      lookup.set(`${stem}.md`, post.url);
      lookup.set(`${stem}.markdown`, post.url);

      if (posixRelative) {
        lookup.set(posixRelative, post.url);
        lookup.set(`post/${posixRelative}`, post.url);
      }
    });

    refLookup = lookup;
    return posts;
  });

  eleventyConfig.addCollection("tagsList", (collectionApi) => {
    const map = new Map();

    collectPosts(collectionApi).forEach((post) => {
      const tags = (post.data.tags || []).filter(
        (tag) => tag && tag.toLowerCase() !== "blog"
      );

      tags.forEach((tag) => {
        if (!map.has(tag)) {
          map.set(tag, { name: tag, slug: slugify(tag), posts: [] });
        }
        map.get(tag).posts.push(post);
      });
    });

    const entries = Array.from(map.values()).map((entry) => ({
      ...entry,
      posts: entry.posts.sort((a, b) => (b.date || 0) - (a.date || 0))
    }));

    return entries.sort((a, b) => a.name.localeCompare(b.name));
  });

  eleventyConfig.addCollection("series", (collectionApi) =>
    buildSeriesGroups(collectPosts(collectionApi))
  );

  eleventyConfig.addCollection("seriesMap", (collectionApi) => {
    const groups = buildSeriesGroups(collectPosts(collectionApi));
    return Object.fromEntries(groups.map((group) => [group.slug, group]));
  });

  eleventyConfig.addCollection("featuredPosts", (collectionApi) =>
    collectPosts(collectionApi)
      .filter(
        (post) =>
          typeof post.data.featured === "number" && post.data.featured > 0
      )
      .sort((a, b) => (a.data.featured || 0) - (b.data.featured || 0))
  );

  eleventyConfig.addCollection("recentPosts", (collectionApi) => {
    const posts = collectPosts(collectionApi);
    return posts.slice(-10).reverse();
  });

  eleventyConfig.addCollection("aliases", (collectionApi) => {
    const seen = new Set();
    const entries = [];

    collectionApi.getAll().forEach((page) => {
      if (!page.url) return;
      const aliases = getAliases(page.data);
      if (!aliases.length) return;

      aliases.forEach((alias) => {
        const permalink = aliasToPermalink(alias);
        if (!permalink || seen.has(permalink)) return;
        seen.add(permalink);
        entries.push({
          permalink,
          target: page.url,
          title: page.data.title || `Redirect to ${page.url}`
        });
      });
    });

    return entries;
  });

  eleventyConfig.addNunjucksShortcode("previewExternal", function (src) {
    const preview = loadPreviewPayload(src);
    if (!preview) {
      return `<div class="card card--missing">Preview unavailable for ${escapeHtml(
        src || ""
      )}</div>`;
    }

    const payload = preview.data || preview;
    const url = payload.url || "#";
    const title = payload.title || src;
    const description = payload.description || "";
    const author = payload.author || "";
    const publisher = payload.publisher || "";
    const logoUrl = payload.logo?.url;

    const attributionPieces = [];
    if (author) attributionPieces.push(escapeHtml(author));
    if (publisher) {
      attributionPieces.push(`<cite>${escapeHtml(publisher)}</cite>`);
    }

    return `
<div class="card">
  <div class="card-body">
    <div class="media">
      ${
        logoUrl
          ? `<img src="${escapeHtml(
              logoUrl
            )}" alt="" class="yx-favicon" loading="lazy">`
          : ""
      }
      <div class="media-body">
        <h6>
          <a href="${escapeHtml(
            url
          )}" target="_blank" rel="noopener noreferrer">
            ${escapeHtml(title)} <span aria-hidden="true">↗</span>
          </a>
        </h6>
        ${
          description
            ? `<p>${escapeHtml(description)}</p>`
            : "<p>External link</p>"
        }
      </div>
    </div>
  </div>
  <div class="card-footer">
    <div class="yx-attribution">${attributionPieces.join(", ")}</div>
  </div>
</div>`.trim();
  });

  eleventyConfig.addNunjucksShortcode("postSeries", function () {
    const data = this.ctx || {};
    const seriesList = getSeriesList(data);
    if (!seriesList.length) {
      return "";
    }

    const displayName = seriesList[0];
    const slug = slugify(displayName);
    const seriesMap = data.collections?.seriesMap || {};
    const group =
      seriesMap[slug] ||
      (Array.isArray(seriesMap)
        ? seriesMap.find((item) => item.slug === slug)
        : null);

    if (!group) {
      throw new Error(`This post claims to be part of the ${displayName} series, but the series metadata has not been generated`);
    }

    const currentUrl = data.page?.url;
    const currentIndex = group.posts.findIndex((post) => post.url === currentUrl);
    const totalPosts = group.posts.length;
    const partNumber = currentIndex + 1;

    // Get previous and next posts for navigation
    const prevPost = currentIndex > 0 ? group.posts[currentIndex - 1] : null;
    const nextPost = currentIndex < totalPosts - 1 ? group.posts[currentIndex + 1] : null;

    const prevLink = prevPost
      ? `<a href="${prevPost.url}" class="series-nav-link series-nav-prev" title="${escapeHtml(prevPost.data.title || 'Previous post')}">← Previous</a>`
      : '<span class="series-nav-link series-nav-disabled">← Previous</span>';

    const nextLink = nextPost
      ? `<a href="${nextPost.url}" class="series-nav-link series-nav-next" title="${escapeHtml(nextPost.data.title || 'Next post')}">Next →</a>`
      : '<span class="series-nav-link series-nav-disabled">Next →</span>';

    return `
<nav class="series-indicator" aria-label="Series navigation">
  <div class="series-info">
    Part ${partNumber} of ${totalPosts} in series
    <a href="/series/${slug}/" class="series-link">${escapeHtml(displayName)}</a>
  </div>
  <div class="series-nav">
    ${prevLink}
    ${nextLink}
  </div>
</nav>`.trim();
  });

  eleventyConfig.addNunjucksShortcode("ref", function (target) {
    if (!target) return "";
    const key = target.trim();
    const withoutDot = key.replace(/^\.\//, "");
    const posix = withoutDot.replace(/\\/g, "/");
    const fileName = path.basename(posix || key);
    const candidates = [
      key,
      withoutDot,
      posix,
      fileName,
      `${fileName}.md`,
      `${fileName}.markdown`
    ];
    const resolved = candidates
      .filter(Boolean)
      .map((candidate) => refLookup.get(candidate))
      .find(Boolean);

    if (!resolved) {
      console.warn(
        `[11ty] Missing ref target for "${key}" (lookup entries: ${refLookup.size})`
      );
      return key;
    }

    return resolved;
  });

  eleventyConfig.addPassthroughCopy("src/assets");
  eleventyConfig.addPassthroughCopy({ public: "/" });

  return {
    dir: {
      input: "src",
      includes: "_includes",
      data: "_data",
      output: "dist"
    },
    templateFormats: ["md", "markdown", "njk", "html"],
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk"
  };
};
