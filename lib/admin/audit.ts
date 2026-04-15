import { createServiceClient } from "@/lib/supabase/service";
import type { Json } from "@/types/database";

export async function logAdminAction(params: {
  actorUserId: string;
  action: string;
  entityType: string;
  entityId?: string | null;
  metadata?: Json;
}) {
  const service = createServiceClient();
  await service.from("audit_logs").insert({
    actor_user_id: params.actorUserId,
    action: params.action,
    entity_type: params.entityType,
    entity_id: params.entityId ?? null,
    metadata: params.metadata ?? {},
  });
}
