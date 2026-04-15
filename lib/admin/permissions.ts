import type { UserRole } from "@/types/database";

export const editableRoles: UserRole[] = ["customer", "licenciatario", "editor", "admin", "sudo"];

export function canAssignRole(args: {
  requesterRole: UserRole;
  targetCurrentRole: UserRole;
  nextRole: UserRole;
  isSelf: boolean;
}) {
  const { requesterRole, targetCurrentRole, nextRole, isSelf } = args;
  if (!editableRoles.includes(nextRole)) return false;
  if (requesterRole === "sudo") return true;
  if (requesterRole !== "admin") return false;
  if (targetCurrentRole === "sudo" || nextRole === "sudo") return false;
  if (isSelf && nextRole === "customer") return false;
  return true;
}
