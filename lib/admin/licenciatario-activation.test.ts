import { evaluateLicenciatarioActivation } from "@/lib/admin/licenciatario-activation";
import { describe, expect, it } from "vitest";

describe("evaluateLicenciatarioActivation", () => {
  it("passes when all fields are valid", () => {
    const r = evaluateLicenciatarioActivation({
      razon_social: "ACME SA",
      rut_cuit: "20-12345678-9",
      tipo_entidad: "sociedad_anonima",
      primary_email: "a@b.com",
      primary_phone: "+54 11 1234-5678",
      has_active_license: true,
    });
    expect(r.ready).toBe(true);
    expect(r.missing).toHaveLength(0);
  });

  it("fails when CUIT is provisional", () => {
    const r = evaluateLicenciatarioActivation({
      razon_social: "ACME SA",
      rut_cuit: "PEND-123",
      tipo_entidad: "otro",
      primary_email: "a@b.com",
      primary_phone: "+54 11 1234-5678",
      has_active_license: true,
    });
    expect(r.ready).toBe(false);
  });
});
