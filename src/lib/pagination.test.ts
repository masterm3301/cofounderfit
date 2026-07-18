import { describe, it, expect } from "vitest";
import { clampPage } from "./pagination";

describe("clampPage", () => {
  it("returns 1 for non-numeric input", () => {
    expect(clampPage(NaN, 5)).toBe(1);
  });

  it("returns 1 for input less than 1", () => {
    expect(clampPage(0, 5)).toBe(1);
    expect(clampPage(-3, 5)).toBe(1);
  });

  it("returns the page when within range", () => {
    expect(clampPage(3, 5)).toBe(3);
  });

  it("clamps to totalPages when page exceeds it", () => {
    expect(clampPage(99, 5)).toBe(5);
  });

  it("floors fractional page numbers", () => {
    expect(clampPage(2.7, 5)).toBe(2);
  });
});
