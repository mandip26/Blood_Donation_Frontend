import axios from "axios";

// Define API base URL with better fallbacks
const getApiBaseUrl = () => {
  // Get the base URL and properly construct admin URL
  let baseUrl = import.meta.env.VITE_BASE_API_URL;

  if (!baseUrl) {
    baseUrl = "https://blood-donation-backend-buge.onrender.com/api/v1/user";
  }

  // Replace /user with /admin in the base URL
  const adminUrl = baseUrl.replace("/user", "/admin");

  console.log("Admin API URL construction:", {
    originalBaseUrl: baseUrl,
    adminUrl: adminUrl,
    envAdminUrl: import.meta.env.VITE_ADMIN_API_URL,
  });

  // Fallback options in order of preference
  const possibleUrls = [
    import.meta.env.VITE_ADMIN_API_URL,
    adminUrl,
    "https://blood-donation-backend-buge.onrender.com/api/v1/admin",
  ];

  const finalUrl =
    possibleUrls.find((url) => url && url.trim() !== "") || possibleUrls[2];
  console.log("Final admin API URL:", finalUrl);

  return finalUrl;
};

const API_BASE_URL = getApiBaseUrl();

console.log("Admin API Base URL:", API_BASE_URL);

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
      contentType: response.headers["content-type"],
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
      contentType: error.response?.headers["content-type"],
      data: error.response?.data,
      headers: error.config?.headers,
    });

    // Check if the response is HTML instead of JSON
    const contentType = error.response?.headers["content-type"];
    if (contentType && contentType.includes("text/html")) {
      console.error(
        "Server returned HTML instead of JSON. This usually means:"
      );
      console.error("1. The API endpoint does not exist");
      console.error("2. There is a server error");
      console.error("3. The route is not properly configured");
      console.error("4. Authentication failed and server returned login page");
      console.error("5. CORS issue or server configuration problem");

      // Create a more meaningful error message
      const newError = new Error(
        `Server returned HTML instead of JSON for ${error.config?.url}. ` +
          `Status: ${error.response?.status}. ` +
          `This usually indicates the API endpoint is not working correctly.`
      );
      newError.name = "InvalidResponseTypeError";
      return Promise.reject(newError);
    }

    if (
      error.response &&
      (error.response.status === 401 || error.response.status === 403)
    ) {
      console.error(
        "Authentication/Authorization error. User might not have admin privileges."
      );
      localStorage.removeItem("bloodDonationUser");
      if (!window.location.href.includes("/login")) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export const adminApi = {
  // Basic connectivity test to check if admin API is reachable
  testConnectivity: async () => {
    try {
      console.log("Testing admin API connectivity...");

      // Test multiple potential URLs
      const testUrls = [
        `${API_BASE_URL}/test-basic`,
        `https://blood-donation-backend-buge.onrender.com/api/v1/admin/test-basic`,
        `https://blood-donation-backend-buge.onrender.com/api/v1/user/test`, // fallback to user endpoint
      ];

      const results = [];

      for (const url of testUrls) {
        try {
          console.log(`Testing URL: ${url}`);
          const response = await fetch(url, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            credentials: "include",
          });

          const contentType = response.headers.get("content-type");
          let responseData;

          if (contentType && contentType.includes("application/json")) {
            responseData = await response.json();
          } else {
            responseData = await response.text();
          }

          results.push({
            url,
            status: response.status,
            statusText: response.statusText,
            contentType,
            data: responseData,
            success: response.ok,
          });

          // If we get a successful JSON response, break
          if (
            response.ok &&
            contentType &&
            contentType.includes("application/json")
          ) {
            break;
          }
        } catch (error: any) {
          results.push({
            url,
            error: error.message,
            success: false,
          });
        }
      }

      return {
        success: results.some((r) => r.success),
        results,
        recommendedUrl: results.find((r) => r.success)?.url || testUrls[0],
      };
    } catch (error: any) {
      console.error("Connectivity test failed:", error);
      return {
        success: false,
        error: error.message,
        results: [],
      };
    }
  },

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
  }, // Dashboard Stats
  getDashboardStats: async () => {
    try {
      console.log("Fetching dashboard stats...");
      console.log("Request URL:", `${API_BASE_URL}/dashboard/stats`);

      const response = await adminApiClient.get("/dashboard/stats");
      console.log("Dashboard stats response:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("Error fetching dashboard stats:", error);
      console.error("Error details:", {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        responseData: error.response?.data,
        url: error.config?.url,
        headers: error.config?.headers,
      });

      // Check if it's a JSON parsing error
      if (
        error.message.includes("Unexpected token") ||
        error.name === "SyntaxError"
      ) {
        console.error(
          "Server returned invalid JSON. This usually means the API endpoint returned HTML instead of JSON."
        );
        throw new Error(
          "API returned invalid response format. Please check server configuration."
        );
      }

      // Add fallback for development/testing
      if (process.env.NODE_ENV !== "production") {
        console.warn("Using mock data for dashboard stats due to API error");
        return {
          success: true,
          data: {
            totalUsers: 0,
            totalHospitals: 0,
            totalOrganizations: 0,
            totalDonors: 0,
            totalEvents: 0,
            totalBloodRequests: 0,
            totalPosts: 0,
            activeBloodRequests: 0,
            recentUsers: 0,
          },
          error: error.message,
        };
      }
      throw error;
    }
  }, // Users
  getUsers: async (params: URLSearchParams) => {
    try {
      console.log("Fetching users with params:", params.toString());
      console.log("Request URL:", `${API_BASE_URL}/users?${params}`);

      const response = await adminApiClient.get(`/users?${params}`);
      return response.data;
    } catch (error: any) {
      console.error("Error fetching users:", error);
      console.error("Error details:", {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        responseData: error.response?.data,
        url: error.config?.url,
      });

      if (
        error.message.includes("Unexpected token") ||
        error.name === "SyntaxError"
      ) {
        throw new Error(
          "API returned invalid response format for users endpoint"
        );
      }
      throw error;
    }
  },

  updateUserStatus: async (userId: string, isActive: boolean) => {
    try {
      const response = await adminApiClient.put(`/users/${userId}/status`, {
        isActive,
      });
      return response.data;
    } catch (error: any) {
      if (
        error.message.includes("Unexpected token") ||
        error.name === "SyntaxError"
      ) {
        throw new Error(
          "API returned invalid response format for user status update"
        );
      }
      throw error;
    }
  },

  deleteUser: async (userId: string) => {
    try {
      const response = await adminApiClient.delete(`/users/${userId}`);
      return response.data;
    } catch (error: any) {
      if (
        error.message.includes("Unexpected token") ||
        error.name === "SyntaxError"
      ) {
        throw new Error(
          "API returned invalid response format for user deletion"
        );
      }
      throw error;
    }
  }, // Events
  getEvents: async (params: URLSearchParams) => {
    try {
      console.log("Fetching events with params:", params.toString());
      console.log("Request URL:", `${API_BASE_URL}/events?${params}`);

      const response = await adminApiClient.get(`/events?${params}`);
      return response.data;
    } catch (error: any) {
      console.error("Error fetching events:", error);
      console.error("Error details:", {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        responseData: error.response?.data,
        url: error.config?.url,
      });

      if (
        error.message.includes("Unexpected token") ||
        error.name === "SyntaxError"
      ) {
        throw new Error(
          "API returned invalid response format for events endpoint"
        );
      }
      throw error;
    }
  },

  updateEventStatus: async (eventId: string, status: string) => {
    try {
      const response = await adminApiClient.put(`/events/${eventId}/status`, {
        status,
      });
      return response.data;
    } catch (error: any) {
      if (
        error.message.includes("Unexpected token") ||
        error.name === "SyntaxError"
      ) {
        throw new Error(
          "API returned invalid response format for event status update"
        );
      }
      throw error;
    }
  },

  deleteEvent: async (eventId: string) => {
    try {
      const response = await adminApiClient.delete(`/events/${eventId}`);
      return response.data;
    } catch (error: any) {
      if (
        error.message.includes("Unexpected token") ||
        error.name === "SyntaxError"
      ) {
        throw new Error(
          "API returned invalid response format for event deletion"
        );
      }
      throw error;
    }
  },
  // Blood Requests
  getBloodRequests: async (params: URLSearchParams) => {
    try {
      console.log("Fetching blood requests with params:", params.toString());
      console.log("Request URL:", `${API_BASE_URL}/blood-requests?${params}`);

      const response = await adminApiClient.get(`/blood-requests?${params}`);
      return response.data;
    } catch (error: any) {
      console.error("Error fetching blood requests:", error);
      console.error("Error details:", {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        responseData: error.response?.data,
        url: error.config?.url,
      });

      if (
        error.message.includes("Unexpected token") ||
        error.name === "SyntaxError"
      ) {
        throw new Error(
          "API returned invalid response format for blood requests endpoint"
        );
      }
      throw error;
    }
  },

  updateBloodRequestStatus: async (requestId: string, status: string) => {
    try {
      const response = await adminApiClient.put(
        `/blood-requests/${requestId}/status`,
        { status }
      );
      return response.data;
    } catch (error: any) {
      if (
        error.message.includes("Unexpected token") ||
        error.name === "SyntaxError"
      ) {
        throw new Error(
          "API returned invalid response format for blood request status update"
        );
      }
      throw error;
    }
  },

  deleteBloodRequest: async (requestId: string) => {
    try {
      const response = await adminApiClient.delete(
        `/blood-requests/${requestId}`
      );
      return response.data;
    } catch (error: any) {
      if (
        error.message.includes("Unexpected token") ||
        error.name === "SyntaxError"
      ) {
        throw new Error(
          "API returned invalid response format for blood request deletion"
        );
      }
      throw error;
    }
  },
  // Posts
  getPosts: async (params: URLSearchParams) => {
    try {
      console.log("Fetching posts with params:", params.toString());
      console.log("Request URL:", `${API_BASE_URL}/posts?${params}`);

      const response = await adminApiClient.get(`/posts?${params}`);
      return response.data;
    } catch (error: any) {
      console.error("Error fetching posts:", error);
      console.error("Error details:", {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        responseData: error.response?.data,
        url: error.config?.url,
      });

      if (
        error.message.includes("Unexpected token") ||
        error.name === "SyntaxError"
      ) {
        throw new Error(
          "API returned invalid response format for posts endpoint"
        );
      }
      throw error;
    }
  },

  deletePost: async (postId: string) => {
    try {
      const response = await adminApiClient.delete(`/posts/${postId}`);
      return response.data;
    } catch (error: any) {
      if (
        error.message.includes("Unexpected token") ||
        error.name === "SyntaxError"
      ) {
        throw new Error(
          "API returned invalid response format for post deletion"
        );
      }
      throw error;
    }
  },

  // Blood Inventory Stats
  getBloodInventoryStats: async () => {
    try {
      console.log("Fetching blood inventory stats...");
      const response = await adminApiClient.get("/blood-inventory/stats");
      console.log("Blood inventory stats response:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("Error fetching blood inventory stats:", error);

      // Check if it's a JSON parsing error
      if (
        error.message.includes("Unexpected token") ||
        error.name === "SyntaxError"
      ) {
        console.error(
          "Server returned invalid JSON. This usually means the API endpoint returned HTML instead of JSON."
        );
        throw new Error(
          "API returned invalid response format. Please check server configuration."
        );
      }

      // Add fallback for development/testing
      if (process.env.NODE_ENV !== "production") {
        console.warn(
          "Using mock data for blood inventory stats due to API error"
        );
        return {
          success: true,
          data: {
            hospitalInventories: [],
            totalUnits: 0,
            lowStockAlerts: 0,
            expiryAlerts: 0,
          },
          error: error.message,
        };
      }
      throw error;
    }
  },
};
