const test = require("node:test");
const assert = require("node:assert/strict");
const { slugify } = require("../lib/content-utils");

test("slugify removes apostrophes without adding extra hyphens", () => {
  const result = slugify("Guava's immutable collections");
  assert.equal(result, "guavas-immutable-collections");
});

test("slugify handles multiple apostrophes", () => {
  const result = slugify("It's Mary's book");
  assert.equal(result, "its-marys-book");
});

test("slugify converts to lowercase", () => {
  const result = slugify("Hello World");
  assert.equal(result, "hello-world");
});

test("slugify removes leading and trailing hyphens", () => {
  const result = slugify("---hello---");
  assert.equal(result, "hello");
});

test("slugify collapses multiple hyphens", () => {
  const result = slugify("hello  world");
  assert.equal(result, "hello-world");
});

test("slugify handles special characters", () => {
  const result = slugify("hello@world#test");
  assert.equal(result, "hello-world-test");
});

test("slugify preserves numbers", () => {
  const result = slugify("Java 8 Features");
  assert.equal(result, "java-8-features");
});
