export type VerifyDenyReason =
  | "license_expired"
  | "license_inactive"
  | "license_not_found"
  | "account_deactivated"
  | "ip_blocked";

export type VerifyDecision =
  | { access_granted: true; reason: "license_active"; license_expiration_date: string; cache_until: string }
  | { access_granted: false; reason: VerifyDenyReason; message: string };

export function evaluatePortalAccess(args: {
  accountArchivedOrInactive: boolean;
  ipBlocked: boolean;
  activeLicenseExpirationDate: string | null;
  now: Date;
}) {
  if (args.accountArchivedOrInactive) {
    return {
      access_granted: false,
      reason: "account_deactivated",
      message: "Licenciatario account is archived or inactive",
    } as VerifyDecision;
  }
  if (args.ipBlocked) {
    return {
      access_granted: false,
      reason: "ip_blocked",
      message: "IP blocked by administrator",
    } as VerifyDecision;
  }
  if (!args.activeLicenseExpirationDate) {
    return {
      access_granted: false,
      reason: "license_not_found",
      message: "No active license found",
    } as VerifyDecision;
  }

  const expiration = new Date(args.activeLicenseExpirationDate);
  if (expiration.getTime() <= args.now.getTime()) {
    return {
      access_granted: false,
      reason: "license_expired",
      message: `License expired on ${args.activeLicenseExpirationDate}`,
    } as VerifyDecision;
  }

  return {
    access_granted: true,
    reason: "license_active",
    license_expiration_date: args.activeLicenseExpirationDate,
    cache_until: new Date(args.now.getTime() + 5 * 60 * 1000).toISOString(),
  } as VerifyDecision;
}
