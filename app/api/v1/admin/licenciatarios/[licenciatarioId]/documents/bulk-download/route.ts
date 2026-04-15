import { requireEditorApi } from "@/lib/admin/auth";
import { createServiceClient } from "@/lib/supabase/service";
import { NextResponse } from "next/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ licenciatarioId: string }> }
) {
  const gate = await requireEditorApi();
  if (gate instanceof NextResponse) return gate;
  const { licenciatarioId } = await params;
  const service = createServiceClient();

  const { data, error } = await service
    .from("licenciatario_documents_v2")
    .select("file_name, file_path")
    .eq("licenciatario_id", licenciatarioId)
    .is("deleted_at", null)
    .order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const content = (data ?? [])
    .map((row) => `${row.file_name} -> ${row.file_path}`)
    .join("\n");
  return new NextResponse(content, {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="documents-${licenciatarioId}.zip"`,
    },
  });
}
