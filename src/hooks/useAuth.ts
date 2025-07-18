import { useState, useEffect, useCallback } from "react";
import { authService } from "@/services/apiService";

export interface User {
  addhar: string;
  hospitalId: string;
  organizationId: string;
  emergencyContact: any;
  address: any;
  gender: any;
  dob: any;
  bloodType: any;
  id?: string;
  _id?: string; // MongoDB often uses _id
  name?: string;
  hospitalName?: string;
  organizationName?: string;
  email: string;
  role: "admin" | "organization" | "user" | "hospital";
  phone?: string;
  profile?: {
    bio?: string;
    skills?: string[];
    profilePhoto?: string;
  };
  // Admin profile properties
  department?: string;
  bio?: string;
  // Hospital profile properties
  regNumber?: string;
  totalBeds?: string;
  specializations?: string;
  description?: string;
  // Organization profile properties
  type?: string;
  foundedYear?: string;
  website?: string;
  mission?: string;
  createdAt?: string;
  updatedAt?: string;
  // Donation status properties
  donationStatus?: "active" | "inactive";
  lastDonationDate?: string;
  nextEligibleDate?: string;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>(() => {
    // Try to get cached user data from localStorage for immediate UI display
    const cachedUser = localStorage.getItem("bloodDonationUser");
    const authFlag = localStorage.getItem("bloodDonationAuth");
    return {
      user: cachedUser && authFlag ? JSON.parse(cachedUser) : null,
      isLoading: false, // Start with false since we've checked localStorage
      error: null,
    };
  }); // Define checkUserSession function outside of useEffect for reuse
  const checkUserSession = useCallback(async () => {
    try {
      // We'll use the localStorage data and consider it valid
      const cachedUser = localStorage.getItem("bloodDonationUser");
      const authFlag = localStorage.getItem("bloodDonationAuth");

      if (cachedUser && authFlag) {
        const userData = JSON.parse(cachedUser);
        setAuthState({
          user: userData,
          isLoading: false,
          error: null,
        });
        return userData;
      } else {
        setAuthState({
          user: null,
          isLoading: false,
          error: null,
        });
        return null;
      }
    } catch (error) {
      setAuthState({
        user: null,
        isLoading: false,
        error: null,
      });
      return null;
    }
  }, []);

  // Fetch fresh user data from server
  const fetchFreshUserData = useCallback(async () => {
    try {
      const cachedUser = localStorage.getItem("bloodDonationUser");
      if (!cachedUser) return null;

      const userData = JSON.parse(cachedUser);
      if (!userData.id && !userData._id) return null;

      const userId = userData.id || userData._id;
      const freshUserData = await authService.getUserProfile(userId);

      if (freshUserData) {
        // Update localStorage with fresh data
        localStorage.setItem(
          "bloodDonationUser",
          JSON.stringify(freshUserData)
        );
        setAuthState({
          user: freshUserData,
          isLoading: false,
          error: null,
        });
        return freshUserData;
      }
      return userData;
    } catch (error) {
      console.error("Error fetching fresh user data:", error);
      // Fall back to cached data if API fails
      return await checkUserSession();
    }
  }, [checkUserSession]);

  // Check user session on mount - this is very fast now
  useEffect(() => {
    checkUserSession();
  }, [checkUserSession]);

  // Login function
  const login = useCallback(async (email: string, password: string) => {
    try {
      setAuthState((prev) => ({ ...prev, isLoading: true, error: null }));
      const response = await authService.login(email, password);

      console.log("Login response:", response);
      if (response && response.user) {
        // Auth success - store user data and update state
        localStorage.setItem("bloodDonationAuth", "true");
        setAuthState({
          user: response.user,
          isLoading: false,
          error: null,
        });
        return response.user;
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (error: any) {
      console.error("Login error in hook:", error);

      let errorMessage = "Login failed. Please try again.";
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      setAuthState((prev) => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      throw error;
    }
  }, []);
  // Register function
  const register = useCallback(async (userData: FormData) => {
    try {
      setAuthState((prev) => ({ ...prev, isLoading: true, error: null }));
      const newUser = await authService.register(userData);
      setAuthState({
        user: newUser,
        isLoading: false,
        error: null,
      });
      return newUser;
    } catch (error: any) {
      let errorMessage = "Registration failed. Please try again.";
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        errorMessage = error.response.data.message;
      }

      setAuthState((prev) => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      throw error;
    }
  }, []); // Logout function
  const logout = useCallback(async () => {
    try {
      setAuthState((prev) => ({ ...prev, isLoading: true }));
      const response = await authService.logout();

      console.log("Logout response in hook:", response); // Remove user data from localStorage on logout
      localStorage.removeItem("bloodDonationUser");
      localStorage.removeItem("bloodDonationAuth");

      setAuthState({
        user: null,
        isLoading: false,
        error: null,
      });

      return response;
    } catch (error: any) {
      console.error("Logout error in hook:", error); // Even if the API call fails, clear local storage and state
      localStorage.removeItem("bloodDonationUser");
      localStorage.removeItem("bloodDonationAuth");

      setAuthState({
        user: null,
        isLoading: false,
        error: null,
      });

      // Return success even on API failure since we've logged out locally
      return { success: true, message: "Logged out locally" };
    }
  }, []);

  // Update user function
  const updateUser = useCallback(async (userData: FormData) => {
    try {
      setAuthState((prev) => ({ ...prev, isLoading: true, error: null }));
      const updatedUser = await authService.updateProfile(userData);
      setAuthState((prev) => ({
        ...prev,
        user: updatedUser,
        isLoading: false,
      }));
      return updatedUser;
    } catch (error: any) {
      let errorMessage = "Failed to update profile. Please try again.";
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        errorMessage = error.response.data.message;
      }

      setAuthState((prev) => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      throw error;
    }
  }, []);
  // Clear authentication errors
  const clearError = useCallback(() => {
    setAuthState((prev) => ({ ...prev, error: null }));
  }, []); // Reload user data
  const reloadUser = useCallback(async () => {
    return await fetchFreshUserData();
  }, [fetchFreshUserData]);

  return {
    user: authState.user,
    isLoading: authState.isLoading,
    isLoggedIn: !!authState.user,
    error: authState.error,
    login,
    register,
    logout,
    updateUser,
    clearError,
    reloadUser,
  };
}

export default useAuth;
