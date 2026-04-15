import { logAdminAction } from "@/lib/admin/audit";
import { requireAdminApi, requireEditorApi } from "@/lib/admin/auth";
import { createServiceClient } from "@/lib/supabase/service";
import { isValidEmail, isValidPhone, isValidRutCuit, normalizeRutCuit } from "@/lib/admin/validation";
import { NextResponse } from "next/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ licenciatarioId: string }> }
) {
  const gate = await requireEditorApi();
  if (gate instanceof NextResponse) return gate;

  const { licenciatarioId } = await params;
  const service = createServiceClient();

  const [{ data: lic, error: licError }, { data: contacts, error: contactsError }] = await Promise.all([
    service
      .from("licenciatarios")
      .select("*")
      .eq("id", licenciatarioId)
      .is("deleted_at", null)
      .maybeSingle(),
    service.from("licenciatario_contacts").select("*").eq("licenciatario_id", licenciatarioId),
  ]);

  if (licError) return NextResponse.json({ error: licError.message }, { status: 500 });
  if (contactsError) return NextResponse.json({ error: contactsError.message }, { status: 500 });
  if (!lic) return NextResponse.json({ error: "Licenciatario not found" }, { status: 404 });

  const primary = contacts?.find((contact) => contact.contact_type === "primary") ?? null;
  const secondary = contacts?.find((contact) => contact.contact_type === "secondary") ?? null;

  return NextResponse.json({
    id: lic.id,
    legal_data: {
      razon_social: lic.razon_social,
      rut_cuit: lic.rut_cuit,
      domicilio: lic.domicilio,
      tipo_entidad: lic.tipo_entidad,
    },
    fiscal_data: {
      regimen_tributario: lic.regimen_tributario,
      numero_inscripcion: lic.numero_inscripcion,
      actividad_principal: lic.actividad_principal,
    },
    contact_data: {
      primary_contact: primary
        ? { name: primary.name, email: primary.email, phone: primary.phone }
        : { name: "", email: "", phone: "" },
      secondary_contact: secondary
        ? { name: secondary.name, email: secondary.email, phone: secondary.phone }
        : null,
    },
    status: lic.status,
    created_date: lic.created_at,
    created_by: lic.created_by,
    last_modified_date: lic.updated_at,
    last_modified_by: lic.last_modified_by,
  });
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ licenciatarioId: string }> }
) {
  const gate = await requireAdminApi();
  if (gate instanceof NextResponse) return gate;
  const { user } = gate;
  const { licenciatarioId } = await params;

  const body = (await request.json()) as {
    razon_social?: string;
    rut_cuit?: string;
    domicilio?: string;
    tipo_entidad?: string;
    regimen_tributario?: string;
    numero_inscripcion?: string | null;
    actividad_principal?: string;
    status?: "active" | "inactive" | "pending";
    primary_contact?: { name?: string; email?: string; phone?: string };
    secondary_contact?: { name?: string; email?: string; phone?: string };
  };

  if (body.rut_cuit && !isValidRutCuit(body.rut_cuit)) {
    return NextResponse.json({ error: "Invalid RUT/CUIT format" }, { status: 400 });
  }
  if (body.primary_contact?.email && !isValidEmail(body.primary_contact.email)) {
    return NextResponse.json({ error: "Invalid primary email" }, { status: 400 });
  }
  if (body.primary_contact?.phone && !isValidPhone(body.primary_contact.phone)) {
    return NextResponse.json({ error: "Invalid primary phone" }, { status: 400 });
  }
  if (body.secondary_contact?.email && !isValidEmail(body.secondary_contact.email)) {
    return NextResponse.json({ error: "Invalid secondary email" }, { status: 400 });
  }
  if (body.secondary_contact?.phone && !isValidPhone(body.secondary_contact.phone)) {
    return NextResponse.json({ error: "Invalid secondary phone" }, { status: 400 });
  }

  const service = createServiceClient();
  const { data: current, error: currentError } = await service
    .from("licenciatarios")
    .select("*")
    .eq("id", licenciatarioId)
    .is("deleted_at", null)
    .maybeSingle();
  if (currentError) return NextResponse.json({ error: currentError.message }, { status: 500 });
  if (!current) return NextResponse.json({ error: "Licenciatario not found" }, { status: 404 });

  const patch = {
    ...(body.razon_social !== undefined ? { razon_social: body.razon_social.trim() } : {}),
    ...(body.rut_cuit !== undefined ? { rut_cuit: normalizeRutCuit(body.rut_cuit) } : {}),
    ...(body.domicilio !== undefined ? { domicilio: body.domicilio.trim() } : {}),
    ...(body.tipo_entidad !== undefined ? { tipo_entidad: body.tipo_entidad.trim() } : {}),
    ...(body.regimen_tributario !== undefined ? { regimen_tributario: body.regimen_tributario.trim() } : {}),
    ...(body.numero_inscripcion !== undefined ? { numero_inscripcion: body.numero_inscripcion?.trim() || null } : {}),
    ...(body.actividad_principal !== undefined
      ? { actividad_principal: body.actividad_principal.trim() }
      : {}),
    ...(body.status !== undefined ? { status: body.status } : {}),
    last_modified_by: user.id,
  };

  const { data: updated, error } = await service
    .from("licenciatarios")
    .update(patch)
    .eq("id", licenciatarioId)
    .select("*")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  if (body.primary_contact) {
    await service.from("licenciatario_contacts").upsert(
      {
        licenciatario_id: licenciatarioId,
        contact_type: "primary",
        name: body.primary_contact.name?.trim() ?? "",
        email: body.primary_contact.email?.trim().toLowerCase() ?? "",
        phone: body.primary_contact.phone?.trim() ?? "",
      },
      { onConflict: "licenciatario_id,contact_type" }
    );
  }
  if (body.secondary_contact?.name && body.secondary_contact?.email && body.secondary_contact?.phone) {
    await service.from("licenciatario_contacts").upsert(
      {
        licenciatario_id: licenciatarioId,
        contact_type: "secondary",
        name: body.secondary_contact.name.trim(),
        email: body.secondary_contact.email.trim().toLowerCase(),
        phone: body.secondary_contact.phone.trim(),
      },
      { onConflict: "licenciatario_id,contact_type" }
    );
  }

  const changes = Object.entries(patch)
    .filter(([key]) => key !== "last_modified_by")
    .filter(([key, value]) => String((current as Record<string, unknown>)[key] ?? "") !== String(value ?? ""))
    .map(([key, value]) => ({
      licenciatario_id: licenciatarioId,
      admin_user_id: user.id,
      field_name: key,
      old_value: String((current as Record<string, unknown>)[key] ?? ""),
      new_value: String(value ?? ""),
      change_type: "update" as const,
    }));
  if (changes.length > 0) {
    await service.from("licenciatario_change_history").insert(changes);
  }

  await logAdminAction({
    actorUserId: user.id,
    action: "admin.licenciatario.update",
    entityType: "licenciatarios",
    entityId: licenciatarioId,
    metadata: patch,
  });

  return NextResponse.json({
    id: updated.id,
    razon_social: updated.razon_social,
    domicilio: updated.domicilio,
    last_modified_date: updated.updated_at,
    last_modified_by: updated.last_modified_by,
  });
}
