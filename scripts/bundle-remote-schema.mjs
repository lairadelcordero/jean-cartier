/**
 * Regenera supabase/remote_schema_once.sql a partir de supabase/migrations/.
 * Correr tras editar migraciones: pnpm db:bundle-remote-schema
 */
import { readFileSync, readdirSync, writeFileSync } from "node:fs";
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

const FILES = readdirSync(migrationsDir)
  .filter((name) => name.endsWith(".sql"))
  .sort();

let out = `${HEADER}\n`;
for (const name of FILES) {
  out += readFileSync(resolve(migrationsDir, name), "utf8").trimEnd();
  out += "\n\n";
}
writeFileSync(outPath, `${out.trimEnd()}\n`);
console.log("Wrote", outPath);
