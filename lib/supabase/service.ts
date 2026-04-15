import type { Database } from "@/types/database";
import { createClient } from "@supabase/supabase-js";
import { getSupabaseUrl } from "./env";

export function createServiceClient() {
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
  if (!serviceRole || serviceRole.includes("your-service-role")) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not configured");
  }
  return createClient<Database>(getSupabaseUrl(), serviceRole, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
