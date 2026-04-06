import { describe, expect, it } from "vitest";
import { licenseRef, serializeLicenseListItem } from "./serializers";

describe("licenseRef", () => {
  it("uses first 8 hex chars of id without dashes", () => {
    expect(licenseRef("33333333-3333-4333-a333-333333333333")).toBe("LIC-33333333");
    expect(licenseRef("a1111111-1111-4111-a111-111111111111")).toBe("LIC-A1111111");
  });
});

describe("serializeLicenseListItem", () => {
  it("maps end_date to expiration_date", () => {
    const row = {
      id: "33333333-3333-4333-a333-333333333333",
      category: "marroquinería",
      status: "active" as const,
      created_at: "2024-01-15T10:00:00Z",
      start_date: "2024-01-15",
      end_date: "2025-01-15",
    };
    const out = serializeLicenseListItem(row, 3);
    expect(out.expiration_date).toBe("2025-01-15");
    expect(out.product_count).toBe(3);
    expect(out.category).toBe("marroquinería");
  });
});
