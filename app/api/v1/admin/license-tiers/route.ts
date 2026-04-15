import { logAdminAction } from "@/lib/admin/audit";
import { requireAdminApi, requireEditorApi } from "@/lib/admin/auth";
import { createServiceClient } from "@/lib/supabase/service";
import { NextResponse } from "next/server";

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

export async function GET() {
  const gate = await requireEditorApi();
  if (gate instanceof NextResponse) return gate;
  const service = createServiceClient();
  const { data, error } = await service
    .from("license_tiers")
    .select("id, name, code, base_price, exclusive_price_multiplier, active")
    .order("name", { ascending: true });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data: data ?? [] });
}

export async function POST(request: Request) {
  const gate = await requireAdminApi();
  if (gate instanceof NextResponse) return gate;
  const { user } = gate;
  const body = (await request.json()) as {
    name?: string;
    code?: string;
    base_price?: number;
    exclusive_price_multiplier?: number;
  };
  const name = body.name?.trim();
  if (!name) return NextResponse.json({ error: "name is required" }, { status: 400 });
  const code = (body.code?.trim() || slugify(name)).toLowerCase();
  if (!code) return NextResponse.json({ error: "invalid code" }, { status: 400 });

  const service = createServiceClient();
  const { data, error } = await service
    .from("license_tiers")
    .insert({
      name,
      code,
      base_price: body.base_price ?? 0,
      exclusive_price_multiplier: body.exclusive_price_multiplier ?? 1.25,
    })
    .select("id, name, code, base_price, exclusive_price_multiplier, active")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await logAdminAction({
    actorUserId: user.id,
    action: "admin.license_tier.create",
    entityType: "license_tiers",
    entityId: data.id,
    metadata: { name: data.name, code: data.code },
  });
  return NextResponse.json({ data }, { status: 201 });
}
