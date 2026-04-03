import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(),
}));

describe("GET /api/health", () => {
  it("exports route handler", async () => {
    const { GET } = await import("./route");
    expect(typeof GET).toBe("function");
  });
});
