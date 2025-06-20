// This file provides a utility for testing and monitoring authentication state


/**
 * Checks if the user has a valid auth token in localStorage
 * and attempts to refresh it if not
 */
export async function verifyAuthToken(): Promise<{
  isAuthenticated: boolean;
  hasToken: boolean;
  message: string;
}> {
  try {
    // Check if user data exists in localStorage
    const userData = localStorage.getItem("bloodDonationUser");
    if (!userData) {
      return {
        isAuthenticated: false,
        hasToken: false,
        message: "No user data found in localStorage",
      };
    }

    // Parse user data
    const user = JSON.parse(userData);

    // Check if token exists
    if (!user.token) {
      // Try to refresh user data to get token
      if (user._id || user.id) {
        try {

          // Check if token was retrieved
          const updatedUserData = localStorage.getItem("bloodDonationUser");
          const updatedUser = updatedUserData
            ? JSON.parse(updatedUserData)
            : null;

          if (updatedUser && updatedUser.token) {
            return {
              isAuthenticated: true,
              hasToken: true,
              message: "Token refreshed successfully",
            };
          } else {
            return {
              isAuthenticated: false,
              hasToken: false,
              message: "Failed to refresh token",
            };
          }
        } catch (error) {
          return {
            isAuthenticated: false,
            hasToken: false,
            message: "Error refreshing token",
          };
        }
      } else {
        return {
          isAuthenticated: false,
          hasToken: false,
          message: "No user ID available to refresh token",
        };
      }
    }

    return {
      isAuthenticated: true,
      hasToken: true,
      message: "User is authenticated and has a token",
    };
  } catch (error) {
    return {
      isAuthenticated: false,
      hasToken: false,
      message: "Error checking authentication state",
    };
  }
}
