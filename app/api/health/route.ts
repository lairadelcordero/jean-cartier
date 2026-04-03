import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

type ComponentResult = {
  status: "healthy" | "error";
  latency_ms: number;
  error?: string;
};

async function checkDatabase(): Promise<ComponentResult> {
  const start = Date.now();
  try {
    const supabase = await createClient();
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    const { error } = await supabase.rpc("health_check").abortSignal(controller.signal);

    clearTimeout(timeout);

    if (error) {
      // Fallback: try a raw auth check which doesn't require custom RPC
      const { error: authError } = await supabase.auth.getUser();
      if (authError && authError.message !== "Auth session missing!") {
        throw new Error(authError.message);
      }
    }

    return { status: "healthy", latency_ms: Date.now() - start };
  } catch (err) {
    return {
      status: "error",
      latency_ms: Date.now() - start,
      error: err instanceof Error ? err.message : "Unknown database error",
    };
  }
}

async function checkMercadoPago(): Promise<ComponentResult> {
  const start = Date.now();
  try {
    const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN;
    if (!accessToken || accessToken === "your-mp-access-token") {
      throw new Error("MERCADO_PAGO_ACCESS_TOKEN not configured");
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const res = await fetch("https://api.mercadopago.com/v1/payment_methods", {
      headers: { Authorization: `Bearer ${accessToken}` },
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }

    return { status: "healthy", latency_ms: Date.now() - start };
  } catch (err) {
    return {
      status: "error",
      latency_ms: Date.now() - start,
      error: err instanceof Error ? err.message : "Unknown Mercado Pago error",
    };
  }
}

export async function GET() {
  const [database, mercado_pago] = await Promise.all([checkDatabase(), checkMercadoPago()]);

  const allHealthy = database.status === "healthy" && mercado_pago.status === "healthy";

  const body = {
    status: allHealthy ? "healthy" : "degraded",
    timestamp: new Date().toISOString(),
    environment: process.env.NEXT_PUBLIC_APP_ENV ?? "development",
    components: { database, mercado_pago },
  };

  return NextResponse.json(body, { status: allHealthy ? 200 : 503 });
}
