import { evaluatePortalAccess } from "@/lib/admin/portal-access";
import { describe, expect, it } from "vitest";

describe("evaluatePortalAccess", () => {
  const now = new Date("2026-04-15T10:00:00.000Z");

  it("grants when active license exists and is not expired", () => {
    const result = evaluatePortalAccess({
      accountArchivedOrInactive: false,
      ipBlocked: false,
      activeLicenseExpirationDate: "2026-12-31",
      now,
    });
    expect(result.access_granted).toBe(true);
    expect(result.reason).toBe("license_active");
  });

  it("denies when account is inactive", () => {
    const result = evaluatePortalAccess({
      accountArchivedOrInactive: true,
      ipBlocked: false,
      activeLicenseExpirationDate: "2026-12-31",
      now,
    });
    expect(result.access_granted).toBe(false);
    expect(result.reason).toBe("account_deactivated");
  });

  it("denies when active license is missing", () => {
    const result = evaluatePortalAccess({
      accountArchivedOrInactive: false,
      ipBlocked: false,
      activeLicenseExpirationDate: null,
      now,
    });
    expect(result.access_granted).toBe(false);
    expect(result.reason).toBe("license_not_found");
  });

  it("denies when active license is expired", () => {
    const result = evaluatePortalAccess({
      accountArchivedOrInactive: false,
      ipBlocked: false,
      activeLicenseExpirationDate: "2026-01-01",
      now,
    });
    expect(result.access_granted).toBe(false);
    expect(result.reason).toBe("license_expired");
  });
});
