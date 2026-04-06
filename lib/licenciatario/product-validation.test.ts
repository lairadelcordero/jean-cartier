import { describe, expect, it } from "vitest";
import { validateProductInput } from "./product-validation";

describe("validateProductInput", () => {
  it("accepts valid payload", () => {
    const r = validateProductInput({
      name: "Cartera",
      sku: "CRT-001",
      description: "Cuero",
      price: 150,
      stock: 10,
      status: "active",
    });
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.data.name).toBe("Cartera");
      expect(r.data.sku).toBe("CRT-001");
      expect(r.data.price).toBe(150);
      expect(r.data.stock).toBe(10);
      expect(r.data.description).toBe("Cuero");
      expect(r.data.status).toBe("active");
    }
  });

  it("rejects empty name", () => {
    const r = validateProductInput({
      name: "  ",
      sku: "X",
      price: 1,
      stock: 0,
    });
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.details.some((d) => d.field === "name")).toBe(true);
    }
  });

  it("rejects invalid SKU characters", () => {
    const r = validateProductInput({
      name: "P",
      sku: "BAD_SKU",
      price: 1,
      stock: 0,
    });
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.details.some((d) => d.field === "sku")).toBe(true);
    }
  });

  it("rejects non-positive price", () => {
    const r = validateProductInput({
      name: "P",
      sku: "OK-1",
      price: 0,
      stock: 0,
    });
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.details.some((d) => d.field === "price")).toBe(true);
    }
  });

  it("rejects negative stock", () => {
    const r = validateProductInput({
      name: "P",
      sku: "OK-1",
      price: 1,
      stock: -1,
    });
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.details.some((d) => d.field === "stock")).toBe(true);
    }
  });

  it("treats blank description as null", () => {
    const r = validateProductInput({
      name: "P",
      sku: "OK-1",
      description: "   ",
      price: 1,
      stock: 0,
    });
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.data.description).toBeNull();
    }
  });
});
