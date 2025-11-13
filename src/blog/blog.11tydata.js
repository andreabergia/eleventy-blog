const { DateTime } = require("luxon");
const { derivePostSlug, normalizeList } = require("../../lib/content-utils");

module.exports = {
  layout: "layouts/post.njk",
  eleventyComputed: {
    tags: (data) => {
      const normalized = normalizeList(data.tags);
      const withoutBlog = normalized.filter(
        (tag) => tag.toLowerCase() !== "blog"
      );
      return ["blog", ...withoutBlog];
    },
    permalink: (data) => {
      if (!data.date) {
        return `${data.page.filePathStem}/`;
      }

      const date = DateTime.fromJSDate(data.date, { zone: "utc" });
      const slug = derivePostSlug(data);
      return `/blog/${date.toFormat("yyyy/MM")}/${slug}/`;
    },
    aliasesNormalized: (data) =>
      normalizeList(data.aliasesNormalized ?? data.aliases ?? data.alias)
  }
};
