import { createClient } from "@/lib/supabase/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(),
}));

const mockedCreateClient = vi.mocked(createClient);

describe("GET /api/health", () => {
  it("exports route handler", async () => {
    const { GET } = await import("./route");
    expect(typeof GET).toBe("function");
  });

  it("returns 503 when health_check RPC fails even without auth session", async () => {
    vi.resetModules();
    mockedCreateClient.mockResolvedValue({
      rpc: vi.fn().mockReturnValue({
        abortSignal: () =>
          Promise.resolve({
            data: null,
            error: { message: "Database error", code: "PGRST301", details: "", hint: "" },
          }),
      }),
    } as never);

    const { GET } = await import("./route");
    const res = await GET();
    expect(res.status).toBe(503);
    const body = (await res.json()) as { status: string; database: string };
    expect(body.status).toBe("error");
    expect(body.database).toBe("disconnected");
  });
});
