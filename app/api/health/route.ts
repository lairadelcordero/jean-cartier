import { type HealthErr, type HealthOk, buildHealthPayload } from "@/lib/health/req-health";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

async function checkDatabase(): Promise<{ ok: boolean; latency_ms: number }> {
  const start = Date.now();
  try {
    const supabase = await createClient();
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    const { error } = await supabase.rpc("health_check").abortSignal(controller.signal);

    clearTimeout(timeout);

    if (error) {
      return { ok: false, latency_ms: Date.now() - start };
    }

    return { ok: true, latency_ms: Date.now() - start };
  } catch {
    return { ok: false, latency_ms: Date.now() - start };
  }
}

async function checkMercadoPago(): Promise<{ ok: boolean; latency_ms: number }> {
  const start = Date.now();
  try {
    const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN;
    if (!accessToken || accessToken === "your-mp-access-token") {
      throw new Error("not configured");
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const res = await fetch("https://api.mercadopago.com/v1/payment_methods", {
      headers: { Authorization: `Bearer ${accessToken}` },
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    return { ok: true, latency_ms: Date.now() - start };
  } catch {
    return { ok: false, latency_ms: Date.now() - start };
  }
}

export async function GET(): Promise<NextResponse<HealthOk | HealthErr>> {
  const [db, mp] = await Promise.all([checkDatabase(), checkMercadoPago()]);
  const body = buildHealthPayload(db.ok, mp.ok);
  const status = db.ok && mp.ok ? 200 : 503;
  return NextResponse.json(body, { status });
}
