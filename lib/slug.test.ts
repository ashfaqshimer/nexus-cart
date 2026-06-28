import { describe, expect, it } from "vitest";

import { isUniqueViolation, slugify, slugWithSuffix } from "@/lib/slug";

describe("slugify", () => {
  it("lowercases and joins words with dashes", () => {
    expect(slugify("Red Balloon Pack")).toBe("red-balloon-pack");
  });

  it("strips punctuation and symbols", () => {
    expect(slugify("Party! Supplies & More?")).toBe("party-supplies-more");
  });

  it("collapses runs of separators into a single dash", () => {
    expect(slugify("foo   ---  bar")).toBe("foo-bar");
  });

  it("trims leading and trailing dashes", () => {
    expect(slugify("  -Hello World-  ")).toBe("hello-world");
  });

  it("strips diacritics to ASCII", () => {
    expect(slugify("Piñata Crème Brûlée")).toBe("pinata-creme-brulee");
  });

  it("returns an empty string when nothing slug-able remains", () => {
    expect(slugify("!!!")).toBe("");
  });
});

describe("slugWithSuffix", () => {
  it("returns the base unchanged on the first attempt", () => {
    expect(slugWithSuffix("balloon", 1)).toBe("balloon");
  });

  it("appends the attempt number on collisions", () => {
    expect(slugWithSuffix("balloon", 2)).toBe("balloon-2");
    expect(slugWithSuffix("balloon", 3)).toBe("balloon-3");
  });
});

describe("isUniqueViolation", () => {
  it("is true for a Postgres 23505 error", () => {
    expect(isUniqueViolation({ code: "23505" })).toBe(true);
  });

  it("is false for other errors and non-objects", () => {
    expect(isUniqueViolation({ code: "23503" })).toBe(false);
    expect(isUniqueViolation(new Error("boom"))).toBe(false);
    expect(isUniqueViolation(null)).toBe(false);
    expect(isUniqueViolation("23505")).toBe(false);
  });
});
