import { logAdminAction } from "@/lib/admin/audit";
import { requireAdminApi, requireEditorApi } from "@/lib/admin/auth";
import { createServiceClient } from "@/lib/supabase/service";
import { NextResponse } from "next/server";

const ALLOWED_TYPES = new Set(["contract", "terms", "compliance", "other"]);
type DocumentType = "contract" | "terms" | "compliance" | "other";
const ALLOWED_EXTENSIONS = new Set(["pdf", "docx", "xlsx", "jpg", "jpeg", "png"]);
const MAX_SIZE = 50 * 1024 * 1024;

function toInt(value: string | null, fallback: number, min: number, max: number) {
  const parsed = Number(value ?? fallback);
  if (Number.isNaN(parsed)) return fallback;
  return Math.max(min, Math.min(max, Math.trunc(parsed)));
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ licenciatarioId: string }> }
) {
  const gate = await requireEditorApi();
  if (gate instanceof NextResponse) return gate;
  const { licenciatarioId } = await params;
  const { searchParams } = new URL(request.url);
  const page = toInt(searchParams.get("page"), 1, 1, 999999);
  const limit = toInt(searchParams.get("limit"), 50, 1, 200);
  const from = (page - 1) * limit;
  const to = from + limit - 1;
  const documentType: DocumentType[] =
    searchParams
      .get("document_type")
      ?.split(",")
      .map((value) => value.trim())
      .filter((value): value is DocumentType => ALLOWED_TYPES.has(value as DocumentType)) ?? [];
  const dateFrom = searchParams.get("date_from");
  const dateTo = searchParams.get("date_to");

  const service = createServiceClient();
  let query = service
    .from("licenciatario_documents_v2")
    .select(
      "id, file_name, document_type, file_size, created_at, uploaded_by, description, version, is_current",
      { count: "exact" }
    )
    .eq("licenciatario_id", licenciatarioId)
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .range(from, to);
  if (documentType.length > 0) query = query.in("document_type", documentType);
  if (dateFrom) query = query.gte("created_at", dateFrom);
  if (dateTo) query = query.lte("created_at", dateTo);

  const { data, error, count } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const userIds = [
    ...new Set(
      (data ?? [])
        .map((row) => row.uploaded_by)
        .filter((value): value is string => typeof value === "string" && value.length > 0)
    ),
  ];
  const users = new Map<string, string>();
  if (userIds.length > 0) {
    const { data: userRows } = await service.from("users").select("id, email").in("id", userIds);
    for (const user of userRows ?? []) users.set(user.id, user.email);
  }

  return NextResponse.json({
    data: (data ?? []).map((row) => ({
      id: row.id,
      file_name: row.file_name,
      document_type: row.document_type,
      file_size: row.file_size,
      upload_date: row.created_at,
      uploaded_by: row.uploaded_by,
      uploaded_by_name: row.uploaded_by ? users.get(row.uploaded_by) ?? row.uploaded_by : null,
      description: row.description,
      version: row.version,
      is_current: row.is_current,
    })),
    pagination: { page, limit, total: count ?? 0 },
  });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ licenciatarioId: string }> }
) {
  const gate = await requireAdminApi();
  if (gate instanceof NextResponse) return gate;
  const { user } = gate;
  const { licenciatarioId } = await params;

  const form = await request.formData();
  const file = form.get("file");
  const rawDocumentType = String(form.get("document_type") ?? "").trim();
  const description = String(form.get("description") ?? "").trim();

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "file is required" }, { status: 400 });
  }
  if (!ALLOWED_TYPES.has(rawDocumentType as DocumentType)) {
    return NextResponse.json({ error: "Invalid document_type" }, { status: 400 });
  }
  const documentType = rawDocumentType as DocumentType;
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: "File size exceeds 50 MB" }, { status: 413 });
  }
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  if (!ALLOWED_EXTENSIONS.has(ext)) {
    return NextResponse.json({ error: "Invalid file type" }, { status: 400 });
  }

  const service = createServiceClient();
  const { data: currentVersionRow } = await service
    .from("licenciatario_documents_v2")
    .select("version")
    .eq("licenciatario_id", licenciatarioId)
    .eq("file_name", file.name)
    .order("version", { ascending: false })
    .limit(1)
    .maybeSingle();
  const version = (currentVersionRow?.version ?? 0) + 1;

  await service
    .from("licenciatario_documents_v2")
    .update({ is_current: false })
    .eq("licenciatario_id", licenciatarioId)
    .eq("file_name", file.name);

  const { data: created, error } = await service
    .from("licenciatario_documents_v2")
    .insert({
      licenciatario_id: licenciatarioId,
      file_name: file.name,
      file_path: `uploaded://${licenciatarioId}/${Date.now()}-${file.name}`,
      file_size: file.size,
      file_type: file.type || "application/octet-stream",
      document_type: documentType,
      description: description || null,
      version,
      is_current: true,
      uploaded_by: user.id,
    })
    .select("id, file_name, document_type, file_size, created_at, version")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await logAdminAction({
    actorUserId: user.id,
    action: "admin.document.upload",
    entityType: "licenciatario_documents_v2",
    entityId: created.id,
    metadata: { licenciatario_id: licenciatarioId, file_name: created.file_name, version },
  });

  return NextResponse.json(
    {
      id: created.id,
      file_name: created.file_name,
      document_type: created.document_type,
      file_size: created.file_size,
      upload_date: created.created_at,
      version: created.version,
    },
    { status: 201 }
  );
}
