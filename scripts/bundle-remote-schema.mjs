/**
 * Regenera supabase/remote_schema_once.sql a partir de supabase/migrations/.
 * Correr tras editar migraciones: pnpm db:bundle-remote-schema
 */
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const root = resolve(__dirname, "..");
const migrationsDir = resolve(root, "supabase/migrations");
const outPath = resolve(root, "supabase/remote_schema_once.sql");

const HEADER = `-- =============================================================================
-- Jean Cartier: esquema completo para Supabase en la NUBE (un solo pegado)
-- =============================================================================
-- Dónde: Supabase Dashboard → SQL Editor → New query → pegar todo → Run
-- Cuándo: tu proyecto NO tiene public.users (error "schema cache" / promote falla)
-- Después: Table Editor → comprobar tablas → pnpm promote:licenciatario tu@email.com
-- No re-ejecutar tal cual en proyecto que ya tiene políticas/tablas (usar migraciones).
-- Generado desde migraciones con: pnpm db:bundle-remote-schema
-- =============================================================================
`;

const FILES = [
  "20240101000000_initial_schema.sql",
  "20260203120000_req1_health_rls_schema.sql",
  "20260403120000_req2_licenciatario_portal.sql",
  "20260406120000_fix_users_rls_recursion.sql",
];

let out = `${HEADER}\n`;
for (const name of FILES) {
  out += readFileSync(resolve(migrationsDir, name), "utf8").trimEnd();
  out += "\n\n";
}
writeFileSync(outPath, `${out.trimEnd()}\n`);
console.log("Wrote", outPath);
