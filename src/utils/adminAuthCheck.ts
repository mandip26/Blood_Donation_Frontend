import { adminApi } from "../services/adminApi";

/**
 * Checks if the current user has admin access
 * @returns A promise that resolves to an object with admin access information
 */
export async function checkAdminAccess(): Promise<{
  hasAccess: boolean;
  isAdmin: boolean;
  message: string;
  userRole?: string | null;
  error?: string;
}> {
  try {
    // Get user data from localStorage
    const userData = localStorage.getItem("bloodDonationUser");
    if (!userData) {
      return {
        hasAccess: false,
        isAdmin: false,
        message: "No user data found in localStorage",
        userRole: null,
      };
    }

    // Parse user data to check role
    const user = JSON.parse(userData);
    const isAdmin = user?.role === "admin";

    if (!isAdmin) {
      return {
        hasAccess: false,
        isAdmin: false,
        message: "User does not have admin role",
        userRole: user?.role || null,
      };
    }

    // Verify admin access with API
    try {
      const response = await adminApi.testAdminAccess();
      if (response.success) {
        return {
          hasAccess: true,
          isAdmin: true,
          message: "Admin access confirmed via API",
          userRole: user.role,
        };
      } else {
        return {
          hasAccess: false,
          isAdmin: true,
          message: "User has admin role but API access failed",
          userRole: user.role,
          error: response.error,
        };
      }
    } catch (error: any) {
      return {
        hasAccess: false,
        isAdmin: true,
        message: "API verification failed",
        userRole: user.role,
        error: error.message,
      };
    }
  } catch (error: any) {
    return {
      hasAccess: false,
      isAdmin: false,
      message: "Error checking admin access",
      error: error.message,
    };
  }
}
