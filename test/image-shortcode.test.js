const { test, mock } = require('node:test');
const assert = require('node:assert');
const path = require('node:path');

test('imageShortcode handles external HTTP images', async () => {
  const imageShortcode = require('../lib/image-shortcode');

  const result = await imageShortcode('http://example.com/image.jpg', 'Test image');

  assert.ok(result.includes('<img'), 'Should return an img tag');
  assert.ok(result.includes('src="http://example.com/image.jpg"'), 'Should preserve external URL');
  assert.ok(result.includes('alt="Test image"'), 'Should include alt text');
  assert.ok(result.includes('loading="lazy"'), 'Should include lazy loading');
});

test('imageShortcode handles external HTTPS images', async () => {
  const imageShortcode = require('../lib/image-shortcode');

  const result = await imageShortcode('https://example.com/image.jpg', 'Test image');

  assert.ok(result.includes('<img'), 'Should return an img tag');
  assert.ok(result.includes('src="https://example.com/image.jpg"'), 'Should preserve external URL');
  assert.ok(result.includes('alt="Test image"'), 'Should include alt text');
  assert.ok(result.includes('loading="lazy"'), 'Should include lazy loading');
});

test('imageShortcode escapes HTML in alt text', async () => {
  const imageShortcode = require('../lib/image-shortcode');

  const result = await imageShortcode('http://example.com/image.jpg', '<script>alert("xss")</script>');

  assert.ok(result.includes('alt="&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;"'), 'Should escape HTML entities');
  assert.ok(!result.includes('<script>'), 'Should not include unescaped script tags');
});

test('imageShortcode handles empty alt text', async () => {
  const imageShortcode = require('../lib/image-shortcode');

  const result = await imageShortcode('http://example.com/image.jpg', '');

  assert.ok(result.includes('alt=""'), 'Should include empty alt attribute');
});

test('imageShortcode handles special characters in alt text', async () => {
  const imageShortcode = require('../lib/image-shortcode');

  const result = await imageShortcode('http://example.com/image.jpg', 'Test & "quotes" <tags>');

  assert.ok(result.includes('&amp;'), 'Should escape ampersands');
  assert.ok(result.includes('&quot;'), 'Should escape quotes');
  assert.ok(result.includes('&lt;'), 'Should escape less-than');
  assert.ok(result.includes('&gt;'), 'Should escape greater-than');
});

test('imageShortcode handles apostrophes in alt text', async () => {
  const imageShortcode = require('../lib/image-shortcode');

  const result = await imageShortcode('http://example.com/image.jpg', "It's a test");

  assert.ok(result.includes('&#039;'), 'Should escape apostrophes');
});

test('imageShortcode accepts custom sizes parameter', async () => {
  const imageShortcode = require('../lib/image-shortcode');

  const result = await imageShortcode('http://example.com/image.jpg', 'Test', '(max-width: 600px) 100vw, 600px');

  assert.ok(result.includes('<img'), 'Should return an img tag');
  assert.ok(result.includes('alt="Test"'), 'Should include alt text');
});

test('imageShortcode uses default sizes when not specified', async () => {
  const imageShortcode = require('../lib/image-shortcode');

  const result = await imageShortcode('http://example.com/image.jpg', 'Test');

  assert.ok(result.includes('<img'), 'Should return an img tag');
  assert.ok(result.includes('alt="Test"'), 'Should include alt text');
});

test('imageShortcode processes local images with optimization', async () => {
  const imageShortcode = require('../lib/image-shortcode');

  const result = await imageShortcode('/images/favicon-16x16.png', 'Favicon');

  assert.ok(result.includes('<picture'), 'Should generate picture element');
  assert.ok(result.includes('webp'), 'Should include webp format');
  assert.ok(result.includes('alt="Favicon"'), 'Should include alt text');
  assert.ok(result.includes('loading="lazy"'), 'Should include lazy loading');
  assert.ok(result.includes('decoding="async"'), 'Should include async decoding');
  assert.ok(result.includes('/images/optimized/'), 'Should output to optimized directory');
});

test('imageShortcode handles anchor fragments in image paths', async () => {
  const imageShortcode = require('../lib/image-shortcode');

  const result = await imageShortcode('/images/favicon-16x16.png#center', 'Favicon centered');

  assert.ok(result.includes('<picture'), 'Should generate picture element');
  assert.ok(result.includes('alt="Favicon centered"'), 'Should include alt text');
  // Note: anchor is stripped during processing but doesn't affect the output HTML
});
