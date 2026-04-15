import {
  assertDateOrder,
  isValidEmail,
  isValidPhone,
  isValidRutCuit,
  normalizeRutCuit,
} from "@/lib/admin/validation";
import { describe, expect, it } from "vitest";

describe("admin validation helpers", () => {
  it("validates only argentinian CUIT", () => {
    expect(isValidRutCuit("20-12345678-9")).toBe(true);
    expect(isValidRutCuit("12.345.678-5")).toBe(false);
    expect(isValidRutCuit("ABC-INVALID")).toBe(false);
  });

  it("normalizes tax id input", () => {
    expect(normalizeRutCuit(" 20-12345678-9 ")).toBe("20-12345678-9");
  });

  it("validates contact formats", () => {
    expect(isValidEmail("admin@jeancartier.com")).toBe(true);
    expect(isValidEmail("invalid-email")).toBe(false);
    expect(isValidPhone("+54 11 1234 5678")).toBe(true);
    expect(isValidPhone("X")).toBe(false);
  });

  it("validates chronological date order", () => {
    expect(assertDateOrder("2026-01-01", "2026-02-01")).toBe(true);
    expect(assertDateOrder("2026-02-01", "2026-01-01")).toBe(false);
  });
});
