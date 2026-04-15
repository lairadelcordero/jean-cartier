import { canAssignRole } from "@/lib/admin/permissions";
import { describe, expect, it } from "vitest";

describe("admin permissions", () => {
  it("allows sudo to assign any role", () => {
    expect(
      canAssignRole({
        requesterRole: "sudo",
        targetCurrentRole: "sudo",
        nextRole: "customer",
        isSelf: false,
      })
    ).toBe(true);
  });

  it("prevents admin from assigning sudo", () => {
    expect(
      canAssignRole({
        requesterRole: "admin",
        targetCurrentRole: "customer",
        nextRole: "sudo",
        isSelf: false,
      })
    ).toBe(false);
  });

  it("prevents admin from editing existing sudo", () => {
    expect(
      canAssignRole({
        requesterRole: "admin",
        targetCurrentRole: "sudo",
        nextRole: "admin",
        isSelf: false,
      })
    ).toBe(false);
  });

  it("prevents admin from self demote to customer", () => {
    expect(
      canAssignRole({
        requesterRole: "admin",
        targetCurrentRole: "admin",
        nextRole: "customer",
        isSelf: true,
      })
    ).toBe(false);
  });
});
