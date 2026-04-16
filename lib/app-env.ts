/** REQ-1 / docs: prefer `NEXT_PUBLIC_ENVIRONMENT`; fallback to legacy `NEXT_PUBLIC_APP_ENV`. */
export function getPublicEnvironment(): string {
  return (
    process.env.NEXT_PUBLIC_ENVIRONMENT?.trim() ||
    process.env.NEXT_PUBLIC_APP_ENV?.trim() ||
    "development"
  );
}

/** Best-effort deploy timestamp from Vercel/CI env vars. */
export function getDeployTimestamp(): string | null {
  return (
    process.env.VERCEL_GIT_COMMIT_TIMESTAMP?.trim() ||
    process.env.VERCEL_DEPLOYMENT_CREATED_AT?.trim() ||
    process.env.NEXT_PUBLIC_DEPLOYED_AT?.trim() ||
    null
  );
}
