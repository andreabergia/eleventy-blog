const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const DIST_DIR = path.join(__dirname, '..', 'dist');
const FEED_PATH = path.join(DIST_DIR, 'feed.xml');

test('feed.xml file exists', () => {
  assert.ok(fs.existsSync(FEED_PATH), 'feed.xml should exist in dist directory');
});

test('feed.xml is valid XML', () => {
  const feedContent = fs.readFileSync(FEED_PATH, 'utf-8');

  // Should start with XML declaration
  assert.ok(feedContent.startsWith('<?xml version="1.0" encoding="utf-8"?>'),
    'Feed should start with XML declaration');

  // Should have opening and closing feed tags
  assert.ok(feedContent.includes('<feed xmlns="http://www.w3.org/2005/Atom">'),
    'Feed should have Atom namespace');
  assert.ok(feedContent.endsWith('</feed>\n') || feedContent.endsWith('</feed>'),
    'Feed should end with closing feed tag');
});

test('feed has required metadata', () => {
  const feedContent = fs.readFileSync(FEED_PATH, 'utf-8');

  // Required Atom feed elements
  assert.ok(feedContent.includes('<title>'), 'Feed should have a title');
  assert.ok(feedContent.includes('<subtitle>'), 'Feed should have a subtitle');
  assert.ok(feedContent.includes('<link href="https://andreabergia.com/feed.xml" rel="self"'),
    'Feed should have self link');
  assert.ok(feedContent.includes('<link href="https://andreabergia.com/" rel="alternate"'),
    'Feed should have alternate link');
  assert.ok(feedContent.includes('<updated>'), 'Feed should have updated timestamp');
  assert.ok(feedContent.includes('<id>https://andreabergia.com/</id>'),
    'Feed should have feed id');
  assert.ok(feedContent.includes('<author>'), 'Feed should have author');
  assert.ok(feedContent.includes('<name>Andrea Bergia</name>'),
    'Feed should have author name');
  assert.ok(feedContent.includes('<email>andreabergia@gmail.com</email>'),
    'Feed should have author email');
});

test('feed contains exactly 25 entries', () => {
  const feedContent = fs.readFileSync(FEED_PATH, 'utf-8');

  const entryMatches = feedContent.match(/<entry>/g);
  assert.ok(entryMatches, 'Feed should contain entry elements');
  assert.strictEqual(entryMatches.length, 25,
    'Feed should contain exactly 25 entries');
});

test('feed entries have required elements', () => {
  const feedContent = fs.readFileSync(FEED_PATH, 'utf-8');

  // Extract first entry for detailed checking
  const firstEntryMatch = feedContent.match(/<entry>[\s\S]*?<\/entry>/);
  assert.ok(firstEntryMatch, 'Should be able to extract an entry');

  const entry = firstEntryMatch[0];

  // Check required entry elements
  assert.ok(entry.includes('<title>'), 'Entry should have title');
  assert.ok(entry.includes('<link href="https://andreabergia.com/blog/'),
    'Entry should have link to blog post');
  assert.ok(entry.includes('rel="alternate"'), 'Entry link should have alternate rel');
  assert.ok(entry.includes('<id>https://andreabergia.com/blog/'),
    'Entry should have id');
  assert.ok(entry.includes('<updated>'), 'Entry should have updated timestamp');
  assert.ok(entry.includes('<published>'), 'Entry should have published timestamp');
  assert.ok(entry.includes('<author>'), 'Entry should have author');
  assert.ok(entry.includes('<content type="html"><![CDATA['),
    'Entry should have CDATA-wrapped HTML content');
});

test('feed entries include categories for tags', () => {
  const feedContent = fs.readFileSync(FEED_PATH, 'utf-8');

  // Check that at least some entries have categories
  const categoryMatches = feedContent.match(/<category term="/g);
  assert.ok(categoryMatches && categoryMatches.length > 0,
    'Feed should contain category elements for tags');

  // Check category format
  const categoryElementMatch = feedContent.match(/<category term="[^"]+" label="[^"]+"/);
  assert.ok(categoryElementMatch,
    'Categories should have both term and label attributes');
});

test('feed content does not contain unprocessed image placeholders', () => {
  const feedContent = fs.readFileSync(FEED_PATH, 'utf-8');

  // Should not contain eleventy-image placeholders
  assert.ok(!feedContent.includes('<eleventy-image'),
    'Feed should not contain unprocessed eleventy-image placeholders');
});

test('feed entries are in reverse chronological order', () => {
  const feedContent = fs.readFileSync(FEED_PATH, 'utf-8');

  // Extract all entry blocks
  const entryMatches = [...feedContent.matchAll(/<entry>([\s\S]*?)<\/entry>/g)];
  assert.ok(entryMatches.length >= 2, 'Should have at least 2 entries to compare');

  // Extract published dates from first two entries
  const firstDate = entryMatches[0][1].match(/<published>(.*?)<\/published>/)[1];
  const secondDate = entryMatches[1][1].match(/<published>(.*?)<\/published>/)[1];

  // First entry should have a more recent or equal date than second entry
  assert.ok(new Date(firstDate) >= new Date(secondDate),
    'Entries should be in reverse chronological order (newest first)');
});

test('feed updated timestamp matches latest post', () => {
  const feedContent = fs.readFileSync(FEED_PATH, 'utf-8');

  // Extract feed updated timestamp
  const feedUpdatedMatch = feedContent.match(/<feed[^>]*>[\s\S]*?<updated>(.*?)<\/updated>/);
  assert.ok(feedUpdatedMatch, 'Feed should have updated timestamp');
  const feedUpdated = feedUpdatedMatch[1];

  // Extract first entry's published date (should be most recent)
  const firstEntryMatch = feedContent.match(/<entry>[\s\S]*?<published>(.*?)<\/published>/);
  assert.ok(firstEntryMatch, 'First entry should have published date');
  const firstEntryPublished = firstEntryMatch[1];

  // Feed updated should match the latest post
  assert.strictEqual(feedUpdated, firstEntryPublished,
    'Feed updated timestamp should match the latest post published date');
});
