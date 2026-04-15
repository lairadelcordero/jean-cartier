/**
 * One-shot: promueve un usuario (por email) a sudo en public.users.
 *
 * Requiere en .env.local:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *
 * Uso:
 *   pnpm promote:sudo tu@email.com
 */
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const root = resolve(__dirname, "..");

function loadEnvLocal() {
  const p = resolve(root, ".env.local");
  if (!existsSync(p)) return;
  const text = readFileSync(p, "utf8");
  for (const line of text.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (process.env[key] === undefined) process.env[key] = val;
  }
}

loadEnvLocal();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
const emailArg = process.argv[2]?.trim().toLowerCase();

if (!emailArg) {
  console.error("Uso: pnpm promote:sudo <email>");
  process.exit(1);
}
if (!url || !serviceKey || serviceKey.includes("your-service-role")) {
  console.error("Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY real.");
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const { data: usersData, error: listErr } = await supabase.auth.admin.listUsers({
  page: 1,
  perPage: 200,
});
if (listErr) {
  console.error("Error listando usuarios Auth:", listErr.message);
  process.exit(1);
}

const authUser = usersData?.users?.find((u) => u.email?.toLowerCase() === emailArg);
if (!authUser) {
  console.error(`No hay usuario en Auth con email: ${emailArg}`);
  process.exit(1);
}

const { error } = await supabase
  .from("users")
  .upsert(
    { id: authUser.id, email: authUser.email ?? emailArg, role: "sudo" },
    { onConflict: "id" }
  );

if (error) {
  console.error("Error actualizando users:", error.message);
  process.exit(1);
}

console.log(`Listo. ${emailArg} ahora es sudo (${authUser.id}).`);
