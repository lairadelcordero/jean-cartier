import { logAdminAction } from "@/lib/admin/audit";
import { requireAdminApi, requireEditorApi } from "@/lib/admin/auth";
import { createServiceClient } from "@/lib/supabase/service";
import { NextResponse } from "next/server";

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function GET() {
  const gate = await requireEditorApi();
  if (gate instanceof NextResponse) return gate;
  const service = createServiceClient();
  const { data, error } = await service
    .from("license_categories")
    .select("id, name, slug, active, sort_order")
    .order("sort_order", { ascending: true });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data: data ?? [] });
}

export async function POST(request: Request) {
  const gate = await requireAdminApi();
  if (gate instanceof NextResponse) return gate;
  const { user } = gate;
  const body = (await request.json()) as { name?: string; sort_order?: number };
  const name = body.name?.trim();
  if (!name) return NextResponse.json({ error: "name is required" }, { status: 400 });
  const slug = slugify(name);
  if (!slug) return NextResponse.json({ error: "invalid category name" }, { status: 400 });

  const service = createServiceClient();
  const { data, error } = await service
    .from("license_categories")
    .insert({ name, slug, sort_order: body.sort_order ?? 999 })
    .select("id, name, slug, active, sort_order")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await logAdminAction({
    actorUserId: user.id,
    action: "admin.license_category.create",
    entityType: "license_categories",
    entityId: data.id,
    metadata: { name: data.name, slug: data.slug },
  });
  return NextResponse.json({ data }, { status: 201 });
}
