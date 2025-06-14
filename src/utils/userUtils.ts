/**
 * Utility functions for handling user data
 */

export interface UserWithRoles {
  name?: string;
  organizationName?: string;
  hospitalName?: string;
  role?: string;
  [key: string]: any;
}

/**
 * Gets the appropriate display name based on user role
 * @param user - User object with potential role-based name fields
 * @returns The appropriate name to display
 */
export function getUserDisplayName(user?: UserWithRoles | null): string {
  if (!user) return "User";

  switch (user.role) {
    case "hospital":
      return user.hospitalName || user.name || "Hospital User";
    case "organization":
      return user.organizationName || user.name || "Organization User";
    case "user":
    case "admin":
    default:
      return user.name || user.hospitalName || user.organizationName || "User";
  }
}

/**
 * Gets the first letter of the display name for avatars
 * @param user - User object with potential role-based name fields
 * @returns The first letter of the appropriate name
 */
export function getUserInitial(user?: UserWithRoles | null): string {
  const displayName = getUserDisplayName(user);
  return displayName.charAt(0).toUpperCase();
}
