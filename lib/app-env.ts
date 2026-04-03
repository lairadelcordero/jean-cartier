/** REQ-1 / docs: prefer `NEXT_PUBLIC_ENVIRONMENT`; fallback to legacy `NEXT_PUBLIC_APP_ENV`. */
export function getPublicEnvironment(): string {
  return (
    process.env.NEXT_PUBLIC_ENVIRONMENT?.trim() ||
    process.env.NEXT_PUBLIC_APP_ENV?.trim() ||
    "development"
  );
}
