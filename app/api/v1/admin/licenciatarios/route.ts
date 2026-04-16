import { logAdminAction } from "@/lib/admin/audit";
import { requireAdminApi, requireEditorApi } from "@/lib/admin/auth";
import { resolveTipoEntidadToSlug } from "@/lib/admin/entity-types";
import {
  isValidEmail,
  isValidPhone,
  isValidRutCuit,
  normalizeRutCuit,
} from "@/lib/admin/validation";
import { createServiceClient } from "@/lib/supabase/service";
import { NextResponse } from "next/server";

const ALLOWED_SORT_BY = new Set(["name", "rut", "status", "expiration_date", "modified_date"]);
const ALLOWED_SORT_ORDER = new Set(["asc", "desc"]);
const LICENCIATARIO_STATUSES = new Set(["active", "inactive", "pending"] as const);
type LicenciatarioStatus = "active" | "inactive" | "pending";

function intParam(value: string | null, fallback: number, min: number, max: number) {
  const parsed = Number(value ?? fallback);
  if (Number.isNaN(parsed)) return fallback;
  return Math.max(min, Math.min(max, Math.trunc(parsed)));
}

export async function GET(request: Request) {
  const gate = await requireEditorApi();
  if (gate instanceof NextResponse) return gate;

  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search")?.trim() ?? "";
  const status: LicenciatarioStatus[] =
    searchParams
      .get("status")
      ?.split(",")
      .map((value) => value.trim())
      .filter((value): value is LicenciatarioStatus =>
        LICENCIATARIO_STATUSES.has(value as LicenciatarioStatus)
      ) ?? [];
  const category =
    searchParams
      .get("category")
      ?.split(",")
      .map((value) => value.trim())
      .filter(Boolean) ?? [];
  const expirationStatus = searchParams.get("expiration_status")?.trim() ?? "";
  const page = intParam(searchParams.get("page"), 1, 1, 999999);
  const limit = intParam(searchParams.get("limit"), 50, 1, 200);
  const sortBy = searchParams.get("sort_by") ?? "modified_date";
  const sortOrder = searchParams.get("sort_order") ?? "desc";
  const exportMode = searchParams.get("export");
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const service = createServiceClient();
  let query = service
    .from("licenciatarios")
    .select(
      "id, razon_social, rut_cuit, status, actividad_principal, updated_at, last_modified_by, deleted_at",
      { count: "exact" }
    )
    .is("deleted_at", null);

  if (status.length > 0) query = query.in("status", status);
  if (search) query = query.or(`razon_social.ilike.%${search}%,rut_cuit.ilike.%${search}%`);

  const orderColumn =
    sortBy === "name"
      ? "razon_social"
      : sortBy === "rut"
        ? "rut_cuit"
        : sortBy === "status"
          ? "status"
          : "updated_at";
  query = query.order(orderColumn, {
    ascending:
      ALLOWED_SORT_BY.has(sortBy) && ALLOWED_SORT_ORDER.has(sortOrder)
        ? sortOrder === "asc"
        : false,
  });
  query = query.range(from, to);

  const { data: licRows, error, count } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const licenciatarioIds = (licRows ?? []).map((row) => row.id);
  const [licenseRes, paymentRes] = await Promise.all([
    licenciatarioIds.length > 0
      ? service
          .from("licenciatario_licenses")
          .select("licenciatario_id, category, status, expiration_date")
          .in("licenciatario_id", licenciatarioIds)
      : Promise.resolve({ data: [], error: null }),
    licenciatarioIds.length > 0
      ? service
          .from("licenciatario_payments")
          .select("licenciatario_id, status")
          .in("licenciatario_id", licenciatarioIds)
      : Promise.resolve({ data: [], error: null }),
  ]);

  if (licenseRes.error)
    return NextResponse.json({ error: licenseRes.error.message }, { status: 500 });
  if (paymentRes.error)
    return NextResponse.json({ error: paymentRes.error.message }, { status: 500 });

  const licensesByLic = new Map<
    string,
    Array<{ category: string; status: string; expiration_date: string }>
  >();
  for (const row of licenseRes.data ?? []) {
    if (row.licenciatario_id == null) continue;
    const list = licensesByLic.get(row.licenciatario_id) ?? [];
    list.push({
      category: row.category,
      status: row.status,
      expiration_date: row.expiration_date,
    });
    licensesByLic.set(row.licenciatario_id, list);
  }

  const paymentsByLic = new Map<string, Array<{ status: string }>>();
  for (const row of paymentRes.data ?? []) {
    const list = paymentsByLic.get(row.licenciatario_id) ?? [];
    list.push({ status: row.status });
    paymentsByLic.set(row.licenciatario_id, list);
  }

  const now = new Date();
  const within30 = new Date(now);
  within30.setDate(within30.getDate() + 30);
  const within90 = new Date(now);
  within90.setDate(within90.getDate() + 90);

  let rows = (licRows ?? []).map((row) => {
    const licenses = licensesByLic.get(row.id) ?? [];
    const activeLicenses = licenses.filter((license) => license.status === "active");
    const nearestExpiration = activeLicenses
      .map((license) => license.expiration_date)
      .sort((a, b) => new Date(a).getTime() - new Date(b).getTime())[0];
    const payments = paymentsByLic.get(row.id) ?? [];
    const hasOverdue = payments.some((payment) => payment.status === "overdue");
    const primaryCategory =
      (licenses.find((license) => license.status === "active") ?? licenses[0])?.category ?? null;

    return {
      id: row.id,
      razon_social: row.razon_social,
      rut_cuit: row.rut_cuit,
      status: row.status,
      primary_category: primaryCategory,
      license_expiration_date: nearestExpiration ?? null,
      payment_status: hasOverdue ? "overdue" : "current",
      last_modified_date: row.updated_at,
      last_modified_by: row.last_modified_by,
      _license_dates: licenses.map((license) => license.expiration_date),
    };
  });

  if (category.length > 0) {
    rows = rows.filter((row) => category.includes(row.primary_category ?? ""));
  }

  if (expirationStatus) {
    rows = rows.filter((row) => {
      const expiration = row.license_expiration_date;
      if (!expiration) return expirationStatus === "no_expiration";
      const date = new Date(expiration);
      if (expirationStatus === "expired") return date < now;
      if (expirationStatus === "within_30_days") return date >= now && date <= within30;
      if (expirationStatus === "within_90_days") return date >= now && date <= within90;
      return true;
    });
  }

  const total = count ?? rows.length;
  const outputRows = rows.map(({ _license_dates: _ignored, ...row }) => row);
  if (exportMode === "csv") {
    const header = [
      "name",
      "rut_cuit",
      "status",
      "category",
      "expiration_date",
      "payment_status",
      "last_modified_date",
    ];
    const csv = [
      header.join(","),
      ...outputRows.map((row) =>
        [
          row.razon_social,
          row.rut_cuit,
          row.status,
          row.primary_category ?? "",
          row.license_expiration_date ?? "",
          row.payment_status,
          row.last_modified_date,
        ]
          .map((value) => `"${String(value).replaceAll('"', '""')}"`)
          .join(",")
      ),
    ].join("\n");
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="licenciatarios.csv"',
      },
    });
  }

  return NextResponse.json({
    data: outputRows,
    pagination: { page, limit, total, total_pages: Math.max(1, Math.ceil(total / limit)) },
  });
}

export async function POST(request: Request) {
  const gate = await requireAdminApi();
  if (gate instanceof NextResponse) return gate;
  const { user } = gate;

  const body = (await request.json()) as {
    razon_social?: string;
    rut_cuit?: string;
    domicilio?: string;
    tipo_entidad?: string;
    regimen_tributario?: string;
    numero_inscripcion?: string;
    actividad_principal?: string;
    primary_contact?: { name?: string; email?: string; phone?: string };
    secondary_contact?: { name?: string; email?: string; phone?: string };
  };

  const hasRut = Boolean(body.rut_cuit?.trim());
  if (hasRut && !isValidRutCuit(body.rut_cuit ?? "")) {
    return NextResponse.json({ error: "Formato de CUIT invalido" }, { status: 400 });
  }

  const primary = body.primary_contact;
  if (primary?.email?.trim() && !isValidEmail(primary.email)) {
    return NextResponse.json({ error: "Invalid primary contact email" }, { status: 400 });
  }
  if (primary?.phone?.trim() && !isValidPhone(primary.phone)) {
    return NextResponse.json({ error: "Invalid primary contact phone" }, { status: 400 });
  }
  if (body.secondary_contact?.email && !isValidEmail(body.secondary_contact.email)) {
    return NextResponse.json({ error: "Invalid secondary contact email" }, { status: 400 });
  }
  if (body.secondary_contact?.phone && !isValidPhone(body.secondary_contact.phone)) {
    return NextResponse.json({ error: "Invalid secondary contact phone" }, { status: 400 });
  }

  const generatedRut = `PEND-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
  const rut = hasRut ? normalizeRutCuit(body.rut_cuit ?? "") : generatedRut;
  const service = createServiceClient();

  const tipoResolved = await resolveTipoEntidadToSlug(service, body.tipo_entidad, {
    defaultSlug: "pendiente",
  });
  if ("error" in tipoResolved) {
    return NextResponse.json({ error: tipoResolved.error }, { status: 400 });
  }

  if (hasRut) {
    const { data: duplicate } = await service
      .from("licenciatarios")
      .select("id")
      .eq("rut_cuit", rut)
      .is("deleted_at", null)
      .maybeSingle();
    if (duplicate) {
      return NextResponse.json({ error: "El CUIT ya existe" }, { status: 422 });
    }
  }

  const { data: created, error } = await service
    .from("licenciatarios")
    .insert({
      razon_social: body.razon_social?.trim() || "Pendiente de completar",
      rut_cuit: rut,
      domicilio: body.domicilio?.trim() || "Pendiente",
      tipo_entidad: tipoResolved.slug,
      regimen_tributario: body.regimen_tributario?.trim() || "pendiente",
      numero_inscripcion: body.numero_inscripcion?.trim() || null,
      actividad_principal: body.actividad_principal?.trim() || "Pendiente",
      status: "pending",
      created_by: user.id,
      last_modified_by: user.id,
    })
    .select("id, razon_social, rut_cuit, status, created_at")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const contactsPayload: Array<{
    licenciatario_id: string;
    contact_type: "primary" | "secondary";
    name: string;
    email: string;
    phone: string;
  }> = [
    {
      licenciatario_id: created.id,
      contact_type: "primary",
      name: primary?.name?.trim() || "Pendiente",
      email: (primary?.email?.trim() || `pendiente+${created.id}@jc.local`).toLowerCase(),
      phone: primary?.phone?.trim() || "0000000000",
    },
  ];
  if (
    body.secondary_contact?.name &&
    body.secondary_contact?.email &&
    body.secondary_contact?.phone
  ) {
    contactsPayload.push({
      licenciatario_id: created.id,
      contact_type: "secondary",
      name: body.secondary_contact.name.trim(),
      email: body.secondary_contact.email.trim().toLowerCase(),
      phone: body.secondary_contact.phone.trim(),
    });
  }
  await service.from("licenciatario_contacts").insert(contactsPayload);
  await service.from("licenciatario_change_history").insert([
    {
      licenciatario_id: created.id,
      admin_user_id: user.id,
      field_name: "licenciatario",
      old_value: null,
      new_value: JSON.stringify(created),
      change_type: "create",
    },
  ]);

  await logAdminAction({
    actorUserId: user.id,
    action: "admin.licenciatario.create",
    entityType: "licenciatarios",
    entityId: created.id,
    metadata: { rut_cuit: created.rut_cuit, razon_social: created.razon_social },
  });

  return NextResponse.json(
    {
      id: created.id,
      razon_social: created.razon_social,
      rut_cuit: created.rut_cuit,
      status: created.status,
      created_date: created.created_at,
    },
    { status: 201 }
  );
}
