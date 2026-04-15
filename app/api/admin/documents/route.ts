import { requireEditorApi } from "@/lib/admin/auth";
import { createServiceClient } from "@/lib/supabase/service";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const gate = await requireEditorApi();
  if (gate instanceof NextResponse) return gate;

  const { searchParams } = new URL(request.url);
  const licenciatarioId = searchParams.get("licenciatario_id");

  const service = createServiceClient();
  let query = service
    .from("licenciatario_documents")
    .select(
      "id, licenciatario_id, title, doc_type, url, status, notes, created_by, updated_by, created_at, updated_at"
    )
    .order("updated_at", { ascending: false })
    .limit(500);

  if (licenciatarioId) {
    query = query.eq("licenciatario_id", licenciatarioId);
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data: data ?? [] });
}

export async function POST(request: Request) {
  const gate = await requireEditorApi();
  if (gate instanceof NextResponse) return gate;
  const { user: requester } = gate;

  const body = (await request.json()) as {
    licenciatario_id?: string;
    title?: string;
    doc_type?: string;
    url?: string;
    status?: "draft" | "published" | "archived";
    notes?: string | null;
  };

  const licenciatarioId = body.licenciatario_id?.trim();
  const title = body.title?.trim();
  const url = body.url?.trim();
  if (!licenciatarioId || !title || !url) {
    return NextResponse.json(
      { error: "licenciatario_id, title and url are required" },
      { status: 400 }
    );
  }
  const payload = {
    licenciatario_id: licenciatarioId,
    title,
    doc_type: body.doc_type?.trim() || "general",
    url,
    status: body.status ?? "draft",
    notes: body.notes ?? null,
    created_by: requester.id,
    updated_by: requester.id,
  };

  const service = createServiceClient();
  const { data, error } = await service
    .from("licenciatario_documents")
    .insert(payload)
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await service.from("audit_logs").insert({
    actor_user_id: requester.id,
    action: "admin.document.create",
    entity_type: "licenciatario_documents",
    entity_id: data.id,
    metadata: payload,
  });

  return NextResponse.json({ data }, { status: 201 });
}
