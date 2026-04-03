/** REQ-1 contract for GET /api/health (flat JSON, exact error strings). */

export const ERR_DB = "Database connection failed";
export const ERR_MP = "Mercado Pago API unreachable";
export const ERR_BOTH = "Multiple system failures";

export type HealthOk = {
  status: "ok";
  database: "connected";
  mercadopago: "connected";
  timestamp: string;
};

export type HealthErr = {
  status: "error";
  database: "connected" | "disconnected";
  mercadopago: "connected" | "disconnected";
  error: typeof ERR_DB | typeof ERR_MP | typeof ERR_BOTH;
  timestamp: string;
};

export function buildHealthPayload(
  dbOk: boolean,
  mpOk: boolean,
  now: Date = new Date()
): HealthOk | HealthErr {
  const timestamp = now.toISOString();
  if (dbOk && mpOk) {
    return {
      status: "ok",
      database: "connected",
      mercadopago: "connected",
      timestamp,
    };
  }
  const database = dbOk ? "connected" : "disconnected";
  const mercadopago = mpOk ? "connected" : "disconnected";
  let error: HealthErr["error"];
  if (!dbOk && !mpOk) error = ERR_BOTH;
  else if (!dbOk) error = ERR_DB;
  else error = ERR_MP;
  return { status: "error", database, mercadopago, error, timestamp };
}
