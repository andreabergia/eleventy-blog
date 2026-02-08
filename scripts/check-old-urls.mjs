import { promises as fs } from "node:fs";
import path from "node:path";

const args = process.argv.slice(2);
const hugoDir = path.resolve(args[0] || "../hugoblog/public");
const eleventyDir = path.resolve(args[1] || "dist");
const reportDir = path.resolve(args[2] || "reports");
const reportPath = path.join(reportDir, "url-compat-report.json");

async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walk(fullPath)));
    } else {
      files.push(fullPath);
    }
  }
  return files;
}

function toUrlPath(filePath, rootDir) {
  const rel = path.relative(rootDir, filePath).split(path.sep).join("/");
  if (!rel.endsWith(".html")) return null;
  if (rel === "index.html") return "/";
  if (rel.endsWith("/index.html")) {
    const dir = rel.slice(0, -"/index.html".length);
    return `/${dir}/`;
  }
  return `/${rel}`;
}

function normalizeUrl(url) {
  let normalized = url.replace(/\/+/g, "/");
  if (!normalized.startsWith("/")) normalized = `/${normalized}`;
  if (normalized.length > 1 && normalized.endsWith("/")) {
    normalized = normalized.slice(0, -1);
  }
  return normalized;
}

function addUrl(map, url, filePath) {
  const key = normalizeUrl(url);
  if (!map.has(key)) map.set(key, []);
  map.get(key).push({ url, filePath });
}

function findAltMatch(key, newKeys) {
  if (key === "/") return null;
  if (key.endsWith(".html")) {
    const alt = key.slice(0, -".html".length) || "/";
    const altKey = alt === "/" ? "/" : alt;
    if (newKeys.has(altKey)) return altKey;
    const altSlash = alt.endsWith("/") ? alt.slice(0, -1) : `${alt}/`;
    const altSlashKey = normalizeUrl(altSlash);
    if (newKeys.has(altSlashKey)) return altSlashKey;
    return null;
  }
  const altHtml = `${key}.html`;
  if (newKeys.has(altHtml)) return altHtml;
  return null;
}

async function collectUrls(rootDir) {
  const files = await walk(rootDir);
  const urls = new Map();
  for (const filePath of files) {
    const url = toUrlPath(filePath, rootDir);
    if (!url) continue;
    addUrl(urls, url, filePath);
  }
  return urls;
}

async function main() {
  await fs.mkdir(reportDir, { recursive: true });

  const [hugoUrls, eleventyUrls] = await Promise.all([
    collectUrls(hugoDir),
    collectUrls(eleventyDir),
  ]);

  const hugoKeys = new Set(hugoUrls.keys());
  const eleventyKeys = new Set(eleventyUrls.keys());

  const missing = [];
  for (const key of hugoKeys) {
    if (!eleventyKeys.has(key)) {
      missing.push({
        url: key,
        altMatch: findAltMatch(key, eleventyKeys),
        sources: hugoUrls.get(key) || [],
      });
    }
  }

  const duplicates = {
    hugo: Array.from(hugoUrls.entries())
      .filter(([, entries]) => entries.length > 1)
      .map(([key, entries]) => ({ url: key, sources: entries })),
    eleventy: Array.from(eleventyUrls.entries())
      .filter(([, entries]) => entries.length > 1)
      .map(([key, entries]) => ({ url: key, sources: entries })),
  };

  const report = {
    generatedAt: new Date().toISOString(),
    hugoDir,
    eleventyDir,
    totals: {
      hugoUrls: hugoKeys.size,
      eleventyUrls: eleventyKeys.size,
      missingFromEleventy: missing.length,
      hugoDuplicates: duplicates.hugo.length,
      eleventyDuplicates: duplicates.eleventy.length,
    },
    missing,
    duplicates,
  };

  await fs.writeFile(reportPath, JSON.stringify(report, null, 2));

  const summaryLines = [
    "URL compatibility report",
    `Hugo URLs: ${report.totals.hugoUrls}`,
    `Eleventy URLs: ${report.totals.eleventyUrls}`,
    `Missing from Eleventy: ${report.totals.missingFromEleventy}`,
    `Duplicates in Hugo: ${report.totals.hugoDuplicates}`,
    `Duplicates in Eleventy: ${report.totals.eleventyDuplicates}`,
    `Report: ${reportPath}`,
  ];

  console.log(summaryLines.join("\n"));

  if (missing.length > 0) {
    console.log("\nFirst 20 missing URLs:");
    missing.slice(0, 20).forEach((item) => {
      const alt = item.altMatch ? ` (alt match: ${item.altMatch})` : "";
      console.log(`- ${item.url}${alt}`);
    });
  }
}

main().catch((error) => {
  console.error("Failed to generate report:", error);
  process.exit(1);
});
