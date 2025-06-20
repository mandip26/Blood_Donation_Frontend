import axios from "axios";

// Define API base URL with fallbacks
const API_BASE_URL =
  import.meta.env.VITE_ADMIN_API_URL ||
  "https://blood-donation-backend-buge.onrender.com/api/v1/admin";

// Create axios instance for admin API
const adminApiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Add request interceptor for token handling with logging
adminApiClient.interceptors.request.use(
  (config) => {
    // Get user data from localStorage
    const userData = localStorage.getItem("bloodDonationUser");
    let token = null;
    let userRole = null;

    if (userData) {
      try {
        const user = JSON.parse(userData);
        userRole = user.role;
        // If token exists in user data, add it to Authorization header
        if (user.token) {
          token = user.token;
          config.headers.Authorization = `Bearer ${user.token}`;

          // Make sure Content-Type is set correctly
          if (
            !config.headers["Content-Type"] &&
            !config.headers.get("Content-Type")
          ) {
            config.headers["Content-Type"] = "application/json";
          }
        }
      } catch (e) {
        console.error("Error parsing user data from localStorage:", e);
      }
    }

    // Log request details for debugging
    console.log("Admin API Request:", {
      url: config.url,
      method: config.method,
      hasToken: !!token,
      userRole,
      headers: config.headers,
    });

    return config;
  },
  (error) => {
    console.error("Admin API request error:", error);
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling with detailed logging
adminApiClient.interceptors.response.use(
  (response) => {
    console.log("Admin API success response:", {
      url: response.config.url,
      method: response.config.method,
      status: response.status,
      data: response.data,
    });
    return response;
  },
  (error) => {
    console.error("Admin API error:", {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      headers: error.config?.headers,
    });

    if (
      error.response &&
      (error.response.status === 401 || error.response.status === 403)
    ) {
      localStorage.removeItem("bloodDonationUser");
      if (!window.location.href.includes("/login")) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export const adminApi = {
  // Test admin access (useful for debugging)
  testAdminAccess: async () => {
    try {
      console.log("Testing admin access...");
      const token = JSON.parse(
        localStorage.getItem("bloodDonationUser") || "{}"
      )?.token;
      console.log(
        "Using token:",
        token ? `${token.substring(0, 15)}...` : "No token found"
      );

      // First test with Axios instance
      const axiosResponse = await adminApiClient.get("/test-basic");
      console.log("Axios instance test response:", axiosResponse.data);

      // Then test with direct fetch for comparison
      const fetchResponse = await fetch(`${API_BASE_URL}/test-basic`, {
        credentials: "include",
        headers: {
          Authorization: `Bearer ${token || ""}`,
          "Content-Type": "application/json",
        },
      });

      const fetchData = await fetchResponse.json();
      console.log("Fetch test response:", fetchData);

      return {
        success: true,
        axiosTest: axiosResponse.data,
        fetchTest: fetchData,
      };
    } catch (error: any) {
      console.error("Admin access test failed:", error);
      return {
        success: false,
        error: error.message,
        details: error.response?.data || {},
      };
    }
  },
  // Dashboard Stats
  getDashboardStats: async () => {
    try {
      console.log("Fetching dashboard stats...");
      const response = await adminApiClient.get("/dashboard/stats");
      console.log("Dashboard stats response:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("Error fetching dashboard stats:", error);
      // Add fallback for development/testing
      if (process.env.NODE_ENV !== "production") {
        console.warn("Using mock data for dashboard stats due to API error");
        return {
          success: true,
          stats: {
            totalUsers: 0,
            totalHospitals: 0,
            totalOrganizations: 0,
            totalDonors: 0,
            totalEvents: 0,
            totalBloodRequests: 0,
            totalPosts: 0,
            activeBloodRequests: 0,
            recentRegistrations: 0,
            recentEvents: 0,
            recentBloodRequests: 0,
            userRegistrationStats: [],
            eventStats: [],
            bloodRequestStats: [],
          },
          error: error.message,
        };
      }
      throw error;
    }
  },

  // Users
  getUsers: async (params: URLSearchParams) => {
    const response = await adminApiClient.get(`/users?${params}`);
    return response.data;
  },

  updateUserStatus: async (userId: string, isActive: boolean) => {
    const response = await adminApiClient.put(`/users/${userId}/status`, {
      isActive,
    });
    return response.data;
  },

  deleteUser: async (userId: string) => {
    const response = await adminApiClient.delete(`/users/${userId}`);
    return response.data;
  },

  // Events
  getEvents: async (params: URLSearchParams) => {
    const response = await adminApiClient.get(`/events?${params}`);
    return response.data;
  },

  updateEventStatus: async (eventId: string, status: string) => {
    const response = await adminApiClient.put(`/events/${eventId}/status`, {
      status,
    });
    return response.data;
  },

  deleteEvent: async (eventId: string) => {
    const response = await adminApiClient.delete(`/events/${eventId}`);
    return response.data;
  },

  // Blood Requests
  getBloodRequests: async (params: URLSearchParams) => {
    const response = await adminApiClient.get(`/blood-requests?${params}`);
    return response.data;
  },

  updateBloodRequestStatus: async (requestId: string, status: string) => {
    const response = await adminApiClient.put(
      `/blood-requests/${requestId}/status`,
      { status }
    );
    return response.data;
  },

  deleteBloodRequest: async (requestId: string) => {
    const response = await adminApiClient.delete(
      `/blood-requests/${requestId}`
    );
    return response.data;
  },

  // Posts
  getPosts: async (params: URLSearchParams) => {
    const response = await adminApiClient.get(`/posts?${params}`);
    return response.data;
  },

  deletePost: async (postId: string) => {
    const response = await adminApiClient.delete(`/posts/${postId}`);
    return response.data;
  },
};
