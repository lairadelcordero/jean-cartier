import { logAdminAction } from "@/lib/admin/audit";
import { requireAdminApi, requireEditorApi } from "@/lib/admin/auth";
import {
  isMissingEntityTypesTableError,
  staticEntityTypesAsRows,
} from "@/lib/admin/entity-types-fallback";
import { slugifyEntityType } from "@/lib/admin/entity-types";
import { createServiceClient } from "@/lib/supabase/service";
import { NextResponse } from "next/server";

export async function GET() {
  const gate = await requireEditorApi();
  if (gate instanceof NextResponse) return gate;
  const service = createServiceClient();
  const { data, error } = await service
    .from("entity_types")
    .select("id, name, slug, active, sort_order")
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });
  if (error && isMissingEntityTypesTableError(error)) {
    return NextResponse.json({
      data: staticEntityTypesAsRows(),
      meta: { source: "fallback" as const },
    });
  }
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data: data ?? [], meta: { source: "database" as const } });
}

export async function POST(request: Request) {
  const gate = await requireAdminApi();
  if (gate instanceof NextResponse) return gate;
  const { user } = gate;
  const body = (await request.json()) as { name?: string; sort_order?: number };
  const name = body.name?.trim();
  if (!name) return NextResponse.json({ error: "name is required" }, { status: 400 });
  const slug = slugifyEntityType(name);
  if (!slug) return NextResponse.json({ error: "invalid entity type name" }, { status: 400 });

  const service = createServiceClient();
  const { data, error } = await service
    .from("entity_types")
    .insert({ name, slug, sort_order: body.sort_order ?? 999 })
    .select("id, name, slug, active, sort_order")
    .single();
  if (error && isMissingEntityTypesTableError(error)) {
    return NextResponse.json(
      {
        error:
          "La tabla entity_types no existe en Supabase. Ejecutá la migración 20260416120000_entity_types_fx_license_enrich.sql (por ejemplo: supabase db push o SQL Editor).",
      },
      { status: 503 }
    );
  }
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await logAdminAction({
    actorUserId: user.id,
    action: "admin.entity_type.create",
    entityType: "entity_types",
    entityId: data.id,
    metadata: { name: data.name, slug: data.slug },
  });
  return NextResponse.json({ data }, { status: 201 });
}
