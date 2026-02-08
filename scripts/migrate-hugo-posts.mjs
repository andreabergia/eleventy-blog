import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import yaml from "js-yaml";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const hugoDir = path.resolve(__dirname, "../../hugoblog/content/post");
const eleventyBlogDir = path.resolve(__dirname, "../src/blog");

async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walk(fullPath)));
    } else if (entry.name.endsWith(".md") || entry.name.endsWith(".markdown")) {
      files.push(fullPath);
    }
  }
  return files;
}

function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) return null;

  const frontmatterStr = match[1];
  const body = match[2];

  try {
    const frontmatter = yaml.load(frontmatterStr) || {};
    return { frontmatter, body };
  } catch (error) {
    console.error("YAML parse error:", error.message);
    return null;
  }
}

function normalizeDate(dateStr) {
  // If already ISO format, return as-is
  if (typeof dateStr === 'string' && dateStr.match(/^\d{4}-\d{2}-\d{2}T/)) {
    return dateStr;
  }
  
  const dateObj = new Date(dateStr);
  if (isNaN(dateObj.getTime())) {
    return null; // Invalid date
  }
  
  return dateObj.toISOString();
}

function escapeYamlString(str) {
  // Always use single quotes to be safe (handles colons and other special chars)
  return `'${str.replace(/'/g, "''")}'`;
}

function generateEleventy11tyYaml(frontmatter) {
  const lines = [];
  lines.push("---");

  // Date
  if (frontmatter.date) {
    const normalizedDate = normalizeDate(frontmatter.date);
    if (normalizedDate) {
      lines.push(`date: ${normalizedDate}`);
    }
  }

  // Title
  if (frontmatter.title) {
    lines.push(`title: ${escapeYamlString(frontmatter.title)}`);
  }

  // Tags
  if (frontmatter.tags) {
    const tags = Array.isArray(frontmatter.tags) ? frontmatter.tags : [frontmatter.tags];
    if (tags.length > 0 && tags[0]) {
      lines.push("tags:");
      tags.forEach(tag => {
        lines.push(`  - ${tag}`);
      });
    }
  }

  // Series
  if (frontmatter.series) {
    let series = Array.isArray(frontmatter.series) ? frontmatter.series[0] : frontmatter.series;
    // Handle case where series might be a quoted string from YAML parsing
    if (typeof series === 'string') {
      series = series.trim();
      // Unescape double-quoted strings that came from Hugo YAML
      if (series.startsWith('"') && series.endsWith('"')) {
        series = series.slice(1, -1);
      }
      if (series) {
        lines.push(`series: ${escapeYamlString(series)}`);
      }
    }
  }

  // Featured
  if (frontmatter.featured) {
    lines.push(`featured: ${frontmatter.featured}`);
  }

  // Aliases
  if (frontmatter.aliases) {
    const aliases = Array.isArray(frontmatter.aliases) ? frontmatter.aliases : [frontmatter.aliases];
    if (aliases.length > 0 && aliases[0]) {
      lines.push("aliases:");
      aliases.forEach(alias => {
        lines.push(`  - ${alias}`);
      });
    }
  }

  lines.push("---");
  return lines.join("\n");
}

function convertHugoShortcodes(content) {
  // Convert Hugo shortcodes to Eleventy shortcodes
  let converted = content;
  
  // {{< post-series >}} -> {% postSeries %}
  converted = converted.replace(/\{\{<\s*post-series\s*>\}\}/g, '{% postSeries %}');
  
  // {{< ref "path" >}} -> {% ref "path" %} (keep as-is, the ref shortcode handles old formats)
  converted = converted.replace(/\{\{<\s*ref\s+"([^"]+)"\s*>\}\}/g, '{% ref "$1" %}');
  
  // {{< previewExternal "slug" >}} -> {% previewExternal "slug" %}
  converted = converted.replace(/\{\{<\s*previewExternal\s+"([^"]+)"\s*>\}\}/g, '{% previewExternal "$1" %}');
  
  // Also handle Markdown-style inline shortcodes with parentheses
  // [text]({{< ref "path" >}}) -> [text]({% ref "path" %})
  converted = converted.replace(/\(\{\{<\s*ref\s+"([^"]+)"\s*>\}\}\)/g, '({% ref "$1" %})');
  
  return converted;
}

async function migratePost(hugoPath) {
  const content = await fs.readFile(hugoPath, "utf-8");
  const parsed = parseFrontmatter(content);

  if (!parsed) {
    console.warn(`Skipped ${hugoPath} - could not parse frontmatter`);
    return;
  }

  const { frontmatter, body } = parsed;
  const convertedBody = convertHugoShortcodes(body);

  if (!frontmatter.date) {
    console.warn(`Skipped ${hugoPath} - no date in frontmatter`);
    return;
  }

  // Extract date - could be ISO string, Date object, or other format
  let dateStr = frontmatter.date;
  
  // If it's already a Date object, convert to ISO string
  if (dateStr instanceof Date) {
    dateStr = dateStr.toISOString();
  } else if (typeof dateStr !== 'string') {
    console.warn(`Skipped ${hugoPath} - date is not a string: ${typeof dateStr}`);
    return;
  }
  
  let dateObj;

  if (dateStr.includes("T")) {
    // ISO format
    dateObj = new Date(dateStr);
  } else {
    // Try to parse other formats
    dateObj = new Date(dateStr);
  }

  if (isNaN(dateObj.getTime())) {
    console.warn(`Skipped ${hugoPath} - invalid date: ${dateStr}`);
    return;
  }

  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, "0");
  const day = String(dateObj.getDate()).padStart(2, "0");

  // Extract slug from filename
  const basename = path.basename(hugoPath);
  const slugMatch = basename.match(/^\d{4}-\d{2}-\d{2}-(.+)\.(md|markdown)$/);
  if (!slugMatch) {
    console.warn(`Skipped ${hugoPath} - could not extract slug from filename`);
    return;
  }

  const slug = slugMatch[1];
  const destDir = path.join(eleventyBlogDir, String(year), month);
  const destFile = path.join(destDir, `${day}-${slug}.md`);

  // Check if already exists
  try {
    await fs.stat(destFile);
    console.log(`Already exists: ${destFile}`);
    return;
  } catch {
    // File doesn't exist, continue
  }

  // Create directory
  await fs.mkdir(destDir, { recursive: true });

  // Generate new frontmatter
  const newFrontmatter = generateEleventy11tyYaml(frontmatter);
  const newContent = `${newFrontmatter}\n${convertedBody}`;

  await fs.writeFile(destFile, newContent);
  console.log(`Migrated: ${path.relative(process.cwd(), destFile)}`);
}

async function main() {
  console.log(`Starting migration from ${hugoDir}`);
  console.log(`Target: ${eleventyBlogDir}\n`);

  const files = await walk(hugoDir);
  console.log(`Found ${files.length} post files\n`);

  let migrated = 0;
  let skipped = 0;

  for (const file of files) {
    try {
      await migratePost(file);
      migrated++;
    } catch (error) {
      console.error(`Error migrating ${file}:`, error.message);
      skipped++;
    }
  }

  console.log(`\nMigration complete: ${migrated} migrated, ${skipped} skipped`);
}

main().catch(error => {
  console.error("Migration failed:", error);
  process.exit(1);
});
