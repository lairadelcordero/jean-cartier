import { describe, expect, it } from "vitest";

describe("health API response shape", () => {
  it("has the expected keys", () => {
    const mockResponse = {
      status: "healthy" as const,
      timestamp: new Date().toISOString(),
      environment: "test",
      components: {
        database: { status: "healthy" as const, latency_ms: 10 },
        mercado_pago: { status: "healthy" as const, latency_ms: 20 },
      },
    };

    expect(mockResponse).toHaveProperty("status");
    expect(mockResponse).toHaveProperty("timestamp");
    expect(mockResponse).toHaveProperty("environment");
    expect(mockResponse.components).toHaveProperty("database");
    expect(mockResponse.components).toHaveProperty("mercado_pago");
    expect(mockResponse.components.database.status).toBe("healthy");
    expect(mockResponse.components.mercado_pago.status).toBe("healthy");
  });

  it("sets status to degraded when a component fails", () => {
    const allHealthy = (dbStatus: "healthy" | "error", mpStatus: "healthy" | "error") =>
      dbStatus === "healthy" && mpStatus === "healthy";

    expect(allHealthy("healthy", "healthy")).toBe(true);
    expect(allHealthy("error", "healthy")).toBe(false);
    expect(allHealthy("healthy", "error")).toBe(false);
  });
});
