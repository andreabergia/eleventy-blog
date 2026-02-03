const { test } = require('node:test');
const assert = require('node:assert');

// Excerpt filter logic (standalone version for testing)
const excerpt = (content) => {
  if (!content) return "";

  // Strip all HTML tags first
  const text = content.replace(/<[^>]+>/g, "").trim();

  // Find first 2 sentences
  let count = 0;
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (char === '.' || char === '!' || char === '?') {
      count++;
      if (count === 2) {
        return text.substring(0, i + 1).trim();
      }
    }
  }

  // Found fewer than 2 sentences, return all
  return text;
};

test('excerpt returns empty string for empty input', () => {
  assert.strictEqual(excerpt(''), '');
  assert.strictEqual(excerpt(null), '');
  assert.strictEqual(excerpt(undefined), '');
});

test('excerpt returns first two sentences', () => {
  const input = 'First sentence. Second sentence. Third sentence.';
  const expected = 'First sentence. Second sentence.';
  assert.strictEqual(excerpt(input), expected);
});

test('excerpt handles exclamation marks', () => {
  const input = 'Exciting news! This is great! More content here.';
  const expected = 'Exciting news! This is great!';
  assert.strictEqual(excerpt(input), expected);
});

test('excerpt handles question marks', () => {
  const input = 'What is this? How does it work? Tell me more.';
  const expected = 'What is this? How does it work?';
  assert.strictEqual(excerpt(input), expected);
});

test('excerpt handles mixed punctuation', () => {
  const input = 'First sentence! Second sentence? Third sentence.';
  const expected = 'First sentence! Second sentence?';
  assert.strictEqual(excerpt(input), expected);
});

test('excerpt returns all content if fewer than 2 sentences', () => {
  const input = 'Only one sentence here.';
  assert.strictEqual(excerpt(input), input);

  const twoSentences = 'First. Second.';
  assert.strictEqual(excerpt(twoSentences), twoSentences);
});

test('excerpt returns all content if no sentence endings', () => {
  const input = 'No sentence endings here';
  assert.strictEqual(excerpt(input), input);
});

test('excerpt handles emoji after sentence endings', () => {
  const input = 'Today I am 40! 🎉 This is another sentence.';
  const expected = 'Today I am 40! 🎉 This is another sentence.';
  assert.strictEqual(excerpt(input), expected);
});

test('excerpt handles newlines', () => {
  const input = 'First sentence.\nSecond sentence.\nThird sentence.';
  const expected = 'First sentence.\nSecond sentence.';
  assert.strictEqual(excerpt(input), expected);
});

test('excerpt trims whitespace', () => {
  const input = '  First sentence. Second sentence.  ';
  const expected = 'First sentence. Second sentence.';
  assert.strictEqual(excerpt(input), expected);
});

test('excerpt strips HTML tags', () => {
  const input = '<p>First sentence.</p>\n<p>Second sentence.</p>\n<p>Third sentence.</p>';
  const expected = 'First sentence.\nSecond sentence.';
  assert.strictEqual(excerpt(input), expected);
});

test('excerpt handles real blog post with HTML', () => {
  const input = '<p>Today I am turning 40 years old.</p>\n<p>Which, while not exactly great, is better than the alternative!</p>\n<p>More content.</p>';
  const result = excerpt(input);

  assert.ok(result.includes('40 years old.'));
  assert.ok(result.includes('better than the alternative!'));
  assert.ok(!result.includes('More content'));
});
