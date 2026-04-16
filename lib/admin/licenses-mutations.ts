/**
 * Alta y actualización de licencias comerciales (`licenciatario_licenses`).
 *
 * Exclusividad: las filas sin titular (`licenciatario_id` NULL) compiten en el mismo
 * “bucket” que cualquier otra licencia vigente del mismo rubro: no se puede duplicar
 * exclusividad mientras exista otra activa/pendiente en ese rubro (incl. otras sin titular).
 * Con titular definido, solo se excluyen del análisis de conflicto las licencias del mismo titular.
 */
import { logAdminAction } from "@/lib/admin/audit";
import { assertDateOrder } from "@/lib/admin/validation";
import type { Database } from "@/types/database";
import type { SupabaseClient } from "@supabase/supabase-js";

export type AdminCreateLicenseBody = {
  category?: string;
  category_id?: string;
  tier_id?: string;
  exclusive?: boolean;
  exclusive_scope?: "none" | "production" | "import" | "both";
  agreed_price?: number | null;
  issue_date?: string;
  expiration_date?: string;
  terms_accepted?: boolean;
  notes?: string;
};

export function overlapsScope(
  a: "none" | "production" | "import" | "both",
  b: "none" | "production" | "import" | "both"
) {
  if (a === "none" || b === "none") return true;
  if (a === "both" || b === "both") return true;
  return a === b;
}

/** Fila de otra “parte” para el chequeo de solapes de rubro (vigencia futura). */
export function rowIsOtherParty(
  row: { licenciatario_id: string | null },
  assigneeId: string | null
): boolean {
  if (assigneeId === null) return true;
  return row.licenciatario_id !== assigneeId;
}

type OverlapRow = {
  id: string;
  licenciatario_id: string | null;
  exclusive: boolean;
  exclusive_scope: string | null;
  status: string;
  expiration_date: string;
};

export async function adminCreateLicense(
  service: SupabaseClient<Database>,
  actorUserId: string,
  args: { licenciatarioId: string | null; body: AdminCreateLicenseBody }
): Promise<
  | { ok: true; created: Database["public"]["Tables"]["licenciatario_licenses"]["Row"] }
  | { ok: false; status: number; error: string }
> {
  const { licenciatarioId, body } = args;

  if ((!body.category?.trim() && !body.category_id) || !body.issue_date || !body.expiration_date) {
    return {
      ok: false,
      status: 400,
      error: "category/category_id, issue_date and expiration_date are required",
    };
  }
  if (!assertDateOrder(body.issue_date, body.expiration_date)) {
    return { ok: false, status: 422, error: "expiration_date must be after issue_date" };
  }

  let normalizedCategory = body.category?.trim() ?? "";
  const categoryId = body.category_id ?? null;
  if (categoryId) {
    const { data: categoryRow, error: categoryErr } = await service
      .from("license_categories")
      .select("id, name")
      .eq("id", categoryId)
      .eq("active", true)
      .maybeSingle();
    if (categoryErr) return { ok: false, status: 500, error: categoryErr.message };
    if (!categoryRow) return { ok: false, status: 422, error: "category_id not found" };
    normalizedCategory = categoryRow.name;
  }

  const tierId = body.tier_id ?? null;
  if (tierId) {
    const { data: tierRow, error: tierErr } = await service
      .from("license_tiers")
      .select("id")
      .eq("id", tierId)
      .eq("active", true)
      .maybeSingle();
    if (tierErr) return { ok: false, status: 500, error: tierErr.message };
    if (!tierRow) return { ok: false, status: 422, error: "tier_id not found" };
  }

  const incomingScope: "none" | "production" | "import" | "both" = body.exclusive
    ? (body.exclusive_scope ?? "both")
    : "none";
  const validityStartDate = body.issue_date;

  let overlapQuery = service
    .from("licenciatario_licenses")
    .select("id, licenciatario_id, exclusive, exclusive_scope, status, expiration_date")
    .in("status", ["active", "pending"])
    .gte("expiration_date", validityStartDate);

  if (categoryId) {
    overlapQuery = overlapQuery.eq("category_id", categoryId);
  } else {
    overlapQuery = overlapQuery.eq("category", normalizedCategory);
  }

  const { data: overlapRows, error: overlapError } = await overlapQuery;
  if (overlapError) return { ok: false, status: 500, error: overlapError.message };

  const otherActiveLicenses = (overlapRows ?? []).filter((row) =>
    rowIsOtherParty(row as OverlapRow, licenciatarioId)
  );

  const existingExclusive = otherActiveLicenses.filter(
    (row) =>
      row.exclusive &&
      overlapsScope(
        (row.exclusive_scope as "none" | "production" | "import" | "both") ?? "both",
        incomingScope
      )
  );

  if (body.exclusive && otherActiveLicenses.length > 0) {
    return {
      ok: false,
      status: 409,
      error:
        "No se puede crear una licencia exclusiva: ya existe una licencia vigente de este rubro para otro titular o sin titular asignado",
    };
  }

  if (!body.exclusive && existingExclusive.length > 0) {
    return {
      ok: false,
      status: 409,
      error:
        "No se puede crear licencia no exclusiva: este rubro ya esta reservado en exclusividad para otro titular o sin titular asignado",
    };
  }

  const { data: created, error } = await service
    .from("licenciatario_licenses")
    .insert({
      licenciatario_id: licenciatarioId,
      category: normalizedCategory,
      category_id: categoryId,
      tier_id: tierId,
      exclusive: Boolean(body.exclusive),
      exclusive_scope: body.exclusive ? (body.exclusive_scope ?? "both") : "none",
      agreed_price: body.agreed_price ?? null,
      status: "pending",
      issue_date: body.issue_date,
      expiration_date: body.expiration_date,
      terms_accepted: Boolean(body.terms_accepted),
      notes: body.notes?.trim() || null,
      created_by: actorUserId,
      last_modified_by: actorUserId,
    })
    .select("*")
    .single();

  if (error) return { ok: false, status: 500, error: error.message };

  await logAdminAction({
    actorUserId,
    action: "admin.license.create",
    entityType: "licenciatario_licenses",
    entityId: created.id,
    metadata: {
      licenciatario_id: licenciatarioId,
      category: created.category,
      category_id: created.category_id,
      tier_id: created.tier_id,
      exclusive: created.exclusive,
      exclusive_scope: created.exclusive_scope,
    },
  });

  return { ok: true, created };
}

const ALLOWED_STATUS = new Set(["active", "inactive", "expired"] as const);
type AllowedStatus = "active" | "inactive" | "expired";

export type AdminPatchLicenseBody = {
  status?: AllowedStatus;
  notes?: string;
  licenciatario_id?: string | null;
};

export async function adminPatchLicense(
  service: SupabaseClient<Database>,
  actorUserId: string,
  args: {
    licenseId: string;
    /** Si se pasa, la licencia debe tener exactamente este titular (útil para rutas anidadas). */
    licenciatarioIdMustMatch?: string | null;
    body: AdminPatchLicenseBody;
  }
): Promise<
  | {
      ok: true;
      updated: Pick<
        Database["public"]["Tables"]["licenciatario_licenses"]["Row"],
        "id" | "status" | "updated_at" | "licenciatario_id"
      >;
    }
  | { ok: false; status: number; error: string }
> {
  const { licenseId, licenciatarioIdMustMatch, body } = args;

  const { data: existing, error: existingError } = await service
    .from("licenciatario_licenses")
    .select("*")
    .eq("id", licenseId)
    .maybeSingle();

  if (existingError) return { ok: false, status: 500, error: existingError.message };
  if (!existing) return { ok: false, status: 404, error: "License not found" };

  if (licenciatarioIdMustMatch !== undefined) {
    const a = existing.licenciatario_id ?? null;
    const b = licenciatarioIdMustMatch ?? null;
    if (a !== b) return { ok: false, status: 404, error: "License not found" };
  }

  const nextLicenciatarioId =
    body.licenciatario_id !== undefined ? body.licenciatario_id : existing.licenciatario_id;

  if (body.licenciatario_id !== undefined && body.licenciatario_id !== null) {
    const { data: licOk, error: licErr } = await service
      .from("licenciatarios")
      .select("id")
      .eq("id", body.licenciatario_id)
      .is("deleted_at", null)
      .maybeSingle();
    if (licErr) return { ok: false, status: 500, error: licErr.message };
    if (!licOk) return { ok: false, status: 422, error: "licenciatario_id not found" };
  }

  const hasStatus = body.status !== undefined;
  const hasTitular = body.licenciatario_id !== undefined;

  if (!hasStatus && !hasTitular) {
    return { ok: false, status: 400, error: "Nothing to update" };
  }

  if (hasStatus) {
    if (!ALLOWED_STATUS.has(body.status!)) {
      return { ok: false, status: 400, error: "Invalid status" };
    }
    if (existing.status === "expired" && body.status === "expired") {
      return { ok: false, status: 400, error: "Cannot expire an already expired license" };
    }
    if (body.status === "active" && new Date(existing.expiration_date).getTime() <= Date.now()) {
      return {
        ok: false,
        status: 422,
        error: "Cannot activate a license with expiration date in the past",
      };
    }
  }

  if (hasTitular && !hasStatus) {
    const { data: updated, error } = await service
      .from("licenciatario_licenses")
      .update({
        licenciatario_id: nextLicenciatarioId,
        last_modified_by: actorUserId,
      })
      .eq("id", licenseId)
      .select("id, status, updated_at, licenciatario_id")
      .single();
    if (error) return { ok: false, status: 500, error: error.message };

    await logAdminAction({
      actorUserId,
      action: "admin.license.assign",
      entityType: "licenciatario_licenses",
      entityId: licenseId,
      metadata: { licenciatario_id: nextLicenciatarioId },
    });

    return { ok: true, updated };
  }

  const newStatus = body.status!;
  const patch = {
    status: newStatus,
    notes: body.notes !== undefined ? body.notes?.trim() ?? existing.notes : existing.notes,
    last_modified_by: actorUserId,
    renewal_date:
      newStatus === "active" && existing.status !== "active"
        ? new Date().toISOString().slice(0, 10)
        : existing.renewal_date,
    ...(body.licenciatario_id !== undefined ? { licenciatario_id: nextLicenciatarioId } : {}),
  };

  const { data: updated, error } = await service
    .from("licenciatario_licenses")
    .update(patch)
    .eq("id", licenseId)
    .select("id, status, updated_at, licenciatario_id")
    .single();
  if (error) return { ok: false, status: 500, error: error.message };

  await logAdminAction({
    actorUserId,
    action: "admin.license.status.update",
    entityType: "licenciatario_licenses",
    entityId: licenseId,
    metadata: { from: existing.status, to: newStatus },
  });

  return { ok: true, updated };
}
