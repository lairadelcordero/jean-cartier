import {
  STATIC_ENTITY_TYPES,
  isMissingEntityTypesTableError,
} from "@/lib/admin/entity-types-fallback";
import type { SupabaseClient } from "@supabase/supabase-js";

export function slugifyEntityType(value: string) {
  return value
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Coincidencia contra el catálogo embebido (mismo seed que la migración). */
function tryResolveStaticCatalog(trimmed: string): { slug: string } | null {
  const asSlug = slugifyEntityType(trimmed);
  const bySlug = STATIC_ENTITY_TYPES.find((row) => row.slug === asSlug);
  if (bySlug) return { slug: bySlug.slug };
  const low = trimmed.toLowerCase();
  const byName = STATIC_ENTITY_TYPES.find(
    (row) =>
      row.name.toLowerCase() === low ||
      row.name.toLowerCase().includes(low) ||
      low.includes(row.slug.replace(/-/g, " "))
  );
  if (byName) return { slug: byName.slug };
  return null;
}

/** Resolve user input (name or slug) to canonical slug stored in `licenciatarios.tipo_entidad`. */
export async function resolveTipoEntidadToSlug(
  service: SupabaseClient,
  input: string | undefined | null,
  options: { defaultSlug?: string } = {}
): Promise<{ slug: string } | { error: string }> {
  const trimmed = input?.trim();
  if (!trimmed) {
    return { slug: options.defaultSlug ?? "pendiente" };
  }

  const asSlug = slugifyEntityType(trimmed);

  const { data: bySlug, error: errSlug } = await service
    .from("entity_types")
    .select("slug")
    .eq("active", true)
    .eq("slug", asSlug)
    .maybeSingle();

  if (errSlug && isMissingEntityTypesTableError(errSlug)) {
    const hit = tryResolveStaticCatalog(trimmed);
    return hit ?? { error: "Tipo de entidad no reconocido." };
  }
  if (errSlug) return { error: errSlug.message };
  if (bySlug) return { slug: bySlug.slug };

  const { data: byName, error: errName } = await service
    .from("entity_types")
    .select("slug")
    .eq("active", true)
    .ilike("name", `%${trimmed}%`)
    .limit(1)
    .maybeSingle();

  if (errName && isMissingEntityTypesTableError(errName)) {
    const hit = tryResolveStaticCatalog(trimmed);
    return hit ?? { error: "Tipo de entidad no reconocido." };
  }
  if (errName) return { error: errName.message };
  if (byName) return { slug: byName.slug };

  const staticHit = tryResolveStaticCatalog(trimmed);
  if (staticHit) return staticHit;

  return { error: "Tipo de entidad no reconocido. Elegí uno del catálogo o creá uno nuevo." };
}
