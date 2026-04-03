/** Supabase project URL (Settings → API). */
export function getSupabaseUrl(): string {
  return process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
}

/**
 * Public client key: publishable (sb_publishable_…) or legacy anon JWT.
 * Prefer NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY when using new Supabase keys.
 */
export function getSupabasePublicKey(): string {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    ""
  );
}
