import { requireEditorApi } from "@/lib/admin/auth";
import { createServiceClient } from "@/lib/supabase/service";
import { NextResponse } from "next/server";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ documentId: string }> }
) {
  const gate = await requireEditorApi();
  if (gate instanceof NextResponse) return gate;
  const { user: requester } = gate;
  const { documentId } = await params;
  const body = (await request.json()) as {
    title?: string;
    doc_type?: string;
    url?: string;
    status?: "draft" | "published" | "archived";
    notes?: string | null;
  };

  const patch = {
    ...(body.title !== undefined ? { title: body.title.trim() } : {}),
    ...(body.doc_type !== undefined ? { doc_type: body.doc_type.trim() } : {}),
    ...(body.url !== undefined ? { url: body.url.trim() } : {}),
    ...(body.status !== undefined ? { status: body.status } : {}),
    ...(body.notes !== undefined ? { notes: body.notes } : {}),
    updated_by: requester.id,
    updated_at: new Date().toISOString(),
  };

  const service = createServiceClient();
  const { data, error } = await service
    .from("licenciatario_documents")
    .update(patch)
    .eq("id", documentId)
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await service.from("audit_logs").insert({
    actor_user_id: requester.id,
    action: "admin.document.update",
    entity_type: "licenciatario_documents",
    entity_id: documentId,
    metadata: patch,
  });

  return NextResponse.json({ data });
}
