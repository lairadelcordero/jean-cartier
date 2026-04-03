import { describe, expect, it } from "vitest";
import { ERR_BOTH, ERR_DB, ERR_MP, buildHealthPayload } from "./req-health";

describe("buildHealthPayload", () => {
  it("returns ok when both systems are up", () => {
    const p = buildHealthPayload(true, true, new Date("2024-01-01T00:00:00.000Z"));
    expect(p).toEqual({
      status: "ok",
      database: "connected",
      mercadopago: "connected",
      timestamp: "2024-01-01T00:00:00.000Z",
    });
  });

  it("returns 503-shaped error when database fails", () => {
    const p = buildHealthPayload(false, true, new Date("2024-01-01T00:00:00.000Z"));
    expect(p.status).toBe("error");
    expect(p).toMatchObject({
      status: "error",
      database: "disconnected",
      mercadopago: "connected",
      error: ERR_DB,
    });
  });

  it("returns 503-shaped error when Mercado Pago fails", () => {
    const p = buildHealthPayload(true, false, new Date("2024-01-01T00:00:00.000Z"));
    expect(p).toMatchObject({
      status: "error",
      database: "connected",
      mercadopago: "disconnected",
      error: ERR_MP,
    });
  });

  it("returns multiple system failures when both fail", () => {
    const p = buildHealthPayload(false, false, new Date("2024-01-01T00:00:00.000Z"));
    expect(p).toMatchObject({
      status: "error",
      database: "disconnected",
      mercadopago: "disconnected",
      error: ERR_BOTH,
    });
  });
});
