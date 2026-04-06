/**
 * One-shot: promueve un usuario (por email) a licenciatario en public.users
 * y crea una licencia de ejemplo si no tiene ninguna.
 *
 * Requiere en .env.local:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY (la clave secret del dashboard, NO la anon)
 *
 * Uso:
 *   pnpm promote:licenciatario tu@email.com
 */
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const root = resolve(__dirname, "..");

function loadEnvLocal() {
  const p = resolve(root, ".env.local");
  if (!existsSync(p)) {
    return;
  }
  const text = readFileSync(p, "utf8");
  for (const line of text.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }
    const eq = trimmed.indexOf("=");
    if (eq <= 0) {
      continue;
    }
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (process.env[key] === undefined) {
      process.env[key] = val;
    }
  }
}

loadEnvLocal();

function isSchemaMissingTableError(message) {
  return /could not find the table|schema cache/i.test(message);
}

function printSchemaHelp() {
  console.error(`
El proyecto de Supabase de tu URL no tiene tablas del repo (p. ej. public.users) o la API no las expone.
  • Revisá que NEXT_PUBLIC_SUPABASE_URL y las keys sean del MISMO proyecto (Settings → API).
  • Lo más rápido sin CLI: Supabase Dashboard → SQL Editor → pegar TODO el archivo:
    supabase/remote_schema_once.sql  →  Run (una sola vez en proyecto vacío / sin este esquema).
  • Alternativa: supabase db push, o los 3 archivos en supabase/migrations/ en orden.
  • Guía: docs/guia-licenciatario-supabase.md (sección «Esquema en la nube»).`);
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

const emailArg = process.argv[2]?.trim().toLowerCase();

if (!emailArg) {
  console.error("Uso: pnpm promote:licenciatario <email>");
  process.exit(1);
}

if (!url || !serviceKey || serviceKey.includes("your-service-role")) {
  console.error(
    "Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY real en .env.local\n" +
      "(Dashboard → Project Settings → API → service_role → Reveal y pegá la clave)."
  );
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const { data: listData, error: listErr } = await supabase.auth.admin.listUsers({
  page: 1,
  perPage: 200,
});

if (listErr) {
  console.error("Error listando usuarios Auth:", listErr.message);
  process.exit(1);
}

const authUser = listData?.users?.find((u) => u.email?.toLowerCase() === emailArg);

if (!authUser) {
  console.error(`No hay usuario en Auth con email: ${emailArg}`);
  console.error("Creá la cuenta primero (Crear cuenta en localhost:777) y volvé a ejecutar.");
  process.exit(1);
}

const { error: upsertErr } = await supabase.from("users").upsert(
  {
    id: authUser.id,
    email: authUser.email ?? emailArg,
    role: "licenciatario",
  },
  { onConflict: "id" }
);

if (upsertErr) {
  console.error("Error actualizando public.users:", upsertErr.message);
  if (isSchemaMissingTableError(upsertErr.message)) {
    printSchemaHelp();
  }
  process.exit(1);
}

const { data: existingLicenses, error: licCountErr } = await supabase
  .from("licenses")
  .select("id")
  .eq("licenciatario_id", authUser.id)
  .limit(1);

if (licCountErr) {
  console.error("Error consultando licenses:", licCountErr.message);
  if (isSchemaMissingTableError(licCountErr.message)) {
    printSchemaHelp();
  }
  process.exit(1);
}

if (!existingLicenses?.length) {
  const { error: insLicErr } = await supabase.from("licenses").insert({
    licenciatario_id: authUser.id,
    category: "marroquinería",
    status: "active",
  });

  if (insLicErr) {
    console.error("Error insertando licencia:", insLicErr.message);
    if (isSchemaMissingTableError(insLicErr.message)) {
      printSchemaHelp();
    }
    process.exit(1);
  }
  console.log("Licencia de ejemplo creada (marroquinería, active).");
} else {
  console.log("Ya tenía al menos una licencia; no se insertó otra.");
}

console.log("Listo.");
console.log(`Usuario ${emailArg} → role licenciatario (id ${authUser.id}).`);
console.log("Volvé a http://localhost:777 , Iniciar sesión, y abrí Portal licenciatarios.");
