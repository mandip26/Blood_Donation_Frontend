// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || "/api/v1";

export const apiConfig = {
  baseURL: API_BASE_URL,
  timeout: 10000,
  withCredentials: true,
};

// Generic API call function with better error handling
export const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;

  const defaultOptions: RequestInit = {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  };
  try {
    const response = await fetch(url, defaultOptions);

    // Handle 401 (unauthorized) and 403 (forbidden/blocked) responses
    if (response.status === 401 || response.status === 403) {
      // Clear localStorage
      localStorage.removeItem("bloodDonationUser");

      // Only redirect if not already on login page to prevent redirect loops
      if (!window.location.href.includes("/login")) {
        window.location.href = "/login";
      }
    }

    if (!response.ok) {
      const errorData = await response.text();
      console.error(`API Error Response:`, errorData);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`API call failed for ${endpoint}:`, error);
    throw error;
  }
};

// Admin API functions
export const adminApi = {
  // Dashboard Stats
  getDashboardStats: () => apiCall("/admin/dashboard/stats"),
  getBloodInventoryStats: () => apiCall("/admin/blood-inventory/stats"),

  // Users
  getUsers: (params: URLSearchParams) => apiCall(`/admin/users?${params}`),
  updateUserStatus: (userId: string, isActive: boolean) =>
    apiCall(`/admin/users/${userId}/status`, {
      method: "PUT",
      body: JSON.stringify({ isActive }),
    }),
  deleteUser: (userId: string) =>
    apiCall(`/admin/users/${userId}`, { method: "DELETE" }),

  // Events
  getEvents: (params: URLSearchParams) => apiCall(`/admin/events?${params}`),
  updateEventStatus: (eventId: string, status: string) =>
    apiCall(`/admin/events/${eventId}/status`, {
      method: "PUT",
      body: JSON.stringify({ status }),
    }),
  deleteEvent: (eventId: string) =>
    apiCall(`/admin/events/${eventId}`, { method: "DELETE" }),

  // Blood Requests
  getBloodRequests: (params: URLSearchParams) =>
    apiCall(`/admin/blood-requests?${params}`),
  updateBloodRequestStatus: (requestId: string, status: string) =>
    apiCall(`/admin/blood-requests/${requestId}/status`, {
      method: "PUT",
      body: JSON.stringify({ status }),
    }),
  deleteBloodRequest: (requestId: string) =>
    apiCall(`/admin/blood-requests/${requestId}`, { method: "DELETE" }),

  // Posts
  getPosts: (params: URLSearchParams) => apiCall(`/admin/posts?${params}`),
  deletePost: (postId: string) =>
    apiCall(`/admin/posts/${postId}`, { method: "DELETE" }),
};
