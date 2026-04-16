/** Catálogo Argentina (mismo contenido que el seed SQL). Sirve si la tabla `entity_types` aún no existe en el proyecto remoto. */

export type StaticEntityType = {
  name: string;
  slug: string;
  sort_order: number;
};

export const STATIC_ENTITY_TYPES: StaticEntityType[] = [
  { name: "Pendiente de definir", slug: "pendiente", sort_order: 0 },
  { name: "Persona humana", slug: "persona_humana", sort_order: 10 },
  { name: "Monotributista", slug: "monotributista", sort_order: 20 },
  { name: "Responsable inscripto", slug: "responsable_inscripto", sort_order: 30 },
  { name: "Sociedad anónima (SA)", slug: "sociedad_anonima", sort_order: 40 },
  {
    name: "Sociedad de responsabilidad limitada (SRL)",
    slug: "sociedad_responsabilidad_limitada",
    sort_order: 50,
  },
  {
    name: "Sociedad por acciones simplificada (SAS)",
    slug: "sociedad_acciones_simplificada",
    sort_order: 60,
  },
  { name: "Cooperativa", slug: "cooperativa", sort_order: 70 },
  {
    name: "Fundación / asociación civil",
    slug: "fundacion_asociacion_civil",
    sort_order: 80,
  },
  { name: "Organismo público", slug: "organismo_publico", sort_order: 90 },
  { name: "Otro", slug: "otro", sort_order: 100 },
];

/** IDs estables para el cliente (no son UUID de DB). */
export function staticEntityTypesAsRows(): Array<{
  id: string;
  name: string;
  slug: string;
  active: boolean;
  sort_order: number;
}> {
  return STATIC_ENTITY_TYPES.map((row, i) => ({
    id: `fallback-${row.slug}-${i}`,
    name: row.name,
    slug: row.slug,
    active: true,
    sort_order: row.sort_order,
  }));
}

export function isMissingEntityTypesTableError(err: { message?: string } | null): boolean {
  const m = err?.message ?? "";
  if (!m.includes("entity_types")) return false;
  return (
    m.includes("schema cache") ||
    m.includes("does not exist") ||
    m.includes("Could not find") ||
    m.includes("relation") ||
    m.includes("undefined table")
  );
}
