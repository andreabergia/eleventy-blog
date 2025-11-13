const slugify = (value = "") =>
  value
    .toString()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");

const normalizeList = (value) => {
  if (!value && value !== 0) {
    return [];
  }
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }
  return [String(value).trim()].filter(Boolean);
};

const getAliases = (data = {}) => {
  if (Array.isArray(data.aliasesNormalized)) {
    return data.aliasesNormalized;
  }
  return normalizeList(data.aliases ?? data.alias);
};

const getSeriesList = (data = {}) => {
  if (Array.isArray(data.seriesNormalized)) {
    return data.seriesNormalized;
  }
  return normalizeList(data.series);
};

const aliasToPermalink = (alias) => {
  if (!alias) return null;
  let output = alias.trim();
  if (!output.length) return null;
  if (!output.startsWith("/")) {
    output = `/${output}`;
  }
  if (output.endsWith(".html")) {
    return output;
  }
  if (output.endsWith("/")) {
    return `${output}index.html`;
  }
  return `${output}/index.html`;
};

const derivePostSlug = (data = {}) => {
  if (data.slug) {
    return slugify(data.slug);
  }
  if (data.title) {
    return slugify(data.title);
  }
  const fileSlug = data.page?.fileSlug;
  if (!fileSlug) {
    return "";
  }
  const withoutDate = fileSlug.replace(/^\d{4}-\d{2}-\d{2}-/, "");
  return slugify(withoutDate);
};

module.exports = {
  aliasToPermalink,
  derivePostSlug,
  getAliases,
  getSeriesList,
  normalizeList,
  slugify
};
