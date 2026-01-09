const Image = require("@11ty/eleventy-img");
const path = require("path");

function escapeHtml(unsafe) {
  if (!unsafe) return "";
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

async function imageShortcode(src, alt, sizes = "(max-width: 800px) 100vw, 800px") {
  // Skip external images
  if (src.startsWith("http://") || src.startsWith("https://")) {
    return `<img src="${src}" alt="${escapeHtml(alt)}" loading="lazy">`;
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
