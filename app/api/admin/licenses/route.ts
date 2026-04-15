import { requireAdminApi } from "@/lib/admin/auth";
import { createServiceClient } from "@/lib/supabase/service";
import type { LicenseStatus } from "@/types/database";
import { NextResponse } from "next/server";

export async function GET() {
  const gate = await requireAdminApi();
  if (gate instanceof NextResponse) return gate;

  const service = createServiceClient();
  const { data: licenses, error } = await service
    .from("licenses")
    .select("id, licenciatario_id, category, status, start_date, end_date, created_at")
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const userIds = [...new Set((licenses ?? []).map((l) => l.licenciatario_id))];
  const usersById = new Map<string, string>();
  if (userIds.length > 0) {
    const { data: users } = await service.from("users").select("id, email").in("id", userIds);
    for (const user of users ?? []) usersById.set(user.id, user.email);
  }

  const data = (licenses ?? []).map((row) => ({
    ...row,
    licenciatario_email: usersById.get(row.licenciatario_id) ?? null,
  }));
  return NextResponse.json({ data });
}

export async function POST(request: Request) {
  const gate = await requireAdminApi();
  if (gate instanceof NextResponse) return gate;
  const { user: requester } = gate;

  const body = (await request.json()) as {
    licenciatario_id?: string;
    category?: string;
    status?: LicenseStatus;
    start_date?: string | null;
    end_date?: string | null;
  };

  const licenciatarioId = body.licenciatario_id?.trim();
  const category = body.category?.trim();
  const status = body.status ?? "active";
  if (!licenciatarioId || !category) {
    return NextResponse.json(
      { error: "licenciatario_id and category are required" },
      { status: 400 }
    );
  }

  const service = createServiceClient();
  const { data: target, error: targetErr } = await service
    .from("users")
    .select("id, role")
    .eq("id", licenciatarioId)
    .single();
  if (targetErr || !target) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }
  if (target.role !== "licenciatario") {
    return NextResponse.json({ error: "Target user must be licenciatario" }, { status: 400 });
  }

  const { data, error } = await service
    .from("licenses")
    .insert({
      licenciatario_id: licenciatarioId,
      category,
      status,
      start_date: body.start_date ?? null,
      end_date: body.end_date ?? null,
    })
    .select("id, licenciatario_id, category, status, start_date, end_date, created_at")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await service.from("audit_logs").insert({
    actor_user_id: requester.id,
    action: "admin.license.assign",
    entity_type: "licenses",
    entity_id: data.id,
    metadata: { licenciatario_id: licenciatarioId, category, status },
  });

  return NextResponse.json({ data }, { status: 201 });
}
