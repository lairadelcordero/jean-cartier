import { requireEditorApi } from "@/lib/admin/auth";
import { createServiceClient } from "@/lib/supabase/service";
import { NextResponse } from "next/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ licenciatarioId: string; documentId: string }> }
) {
  const gate = await requireEditorApi();
  if (gate instanceof NextResponse) return gate;
  const { licenciatarioId, documentId } = await params;

  const service = createServiceClient();
  const { data, error } = await service
    .from("licenciatario_documents_v2")
    .select("id, file_name, file_type, file_path")
    .eq("id", documentId)
    .eq("licenciatario_id", licenciatarioId)
    .is("deleted_at", null)
    .maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ error: "Document not found" }, { status: 404 });

  return new NextResponse(`Stub download for ${data.file_name}\nStored path: ${data.file_path}\n`, {
    headers: {
      "Content-Type": data.file_type,
      "Content-Disposition": `attachment; filename="${data.file_name}"`,
    },
  });
}
