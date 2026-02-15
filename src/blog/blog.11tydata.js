const { DateTime } = require("luxon");
const { derivePostSlug, normalizeList } = require("../../lib/content-utils");

module.exports = {
  layout: "layouts/post.njk",
  eleventyComputed: {
    tags: (data) => normalizeList(data.tags),
    permalink: (data) => {
      if (!data.date) {
        return `${data.page.filePathStem}/`;
      }

      const date = DateTime.fromJSDate(data.date, { zone: "utc" });
      const slug = derivePostSlug(data);
      return `/blog/${date.toFormat("yyyy/MM")}/${slug}/`;
    }
  }
};
