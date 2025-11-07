const { DateTime } = require("luxon");

module.exports = {
  layout: "layouts/post.njk",
  tags: ["blog"],
  eleventyComputed: {
    permalink: (data) => {
      if (!data.date) {
        return `${data.page.filePathStem}/`;
      }

      const date = DateTime.fromJSDate(data.date, { zone: "utc" });
      // Mirror Hugo's /blog/YYYY/MM/slug/ structure.
      return `/blog/${date.toFormat("yyyy/MM")}/${data.page.fileSlug}/`;
    }
  }
};
