module.exports = class {
  data() {
    return {
      pagination: {
        data: "collections.aliases",
        size: 1,
        alias: "aliasEntry"
      },
      layout: "layouts/redirect.njk",
      eleventyExcludeFromCollections: true,
      permalink: (data) => data.aliasEntry?.permalink || false,
      eleventyComputed: {
        target: (data) => data.aliasEntry?.target,
        title: (data) => data.aliasEntry?.title || "Redirecting…"
      }
    };
  }

  render() {
    return "";
  }
};
