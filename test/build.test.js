const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const DIST_DIR = path.join(__dirname, '..', 'dist');
const SRC_BLOG_DIR = path.join(__dirname, '..', 'src', 'blog');

test('markdown files are converted to HTML files', () => {
  const htmlPaths = [
    path.join(DIST_DIR, 'blog', '2025', '02', 'emjay-a-simple-jit-that-does-math', 'index.html'),
    path.join(DIST_DIR, 'blog', '2022', '04', 'reboot', 'index.html'),
    path.join(DIST_DIR, 'blog', '2023', '07', 'i-have-written-a-jvm-in-rust', 'index.html'),
    path.join(DIST_DIR, 'about', 'index.html'),
  ];

  htmlPaths.forEach(htmlPath => {
    assert.ok(fs.existsSync(htmlPath));
  });
});

test('generated page has post title', () => {
  const htmlPath = path.join(DIST_DIR, 'blog', '2025', '02', 'emjay-a-simple-jit-that-does-math', 'index.html');
  const html = fs.readFileSync(htmlPath, 'utf-8');
  assert.ok(html.includes('<title>Emjay - a simple JIT that does math</title>'));
});

test('generated homepage page exists', () => {
  const indexPath = path.join(DIST_DIR, 'index.html');
  assert.ok(fs.existsSync(indexPath));
});
