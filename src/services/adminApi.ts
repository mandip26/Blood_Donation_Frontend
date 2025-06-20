const API_BASE = "/api/v1/admin";

export const adminApi = {
  // Dashboard Stats
  getDashboardStats: async () => {
    const response = await fetch(`${API_BASE}/dashboard/stats`, {
      credentials: "include",
    });
    return response.json();
  },

  // Users
  getUsers: async (params: URLSearchParams) => {
    const response = await fetch(`${API_BASE}/users?${params}`, {
      credentials: "include",
    });
    return response.json();
  },

  updateUserStatus: async (userId: string, isActive: boolean) => {
    const response = await fetch(`${API_BASE}/users/${userId}/status`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ isActive }),
    });
    return response.json();
  },

  deleteUser: async (userId: string) => {
    const response = await fetch(`${API_BASE}/users/${userId}`, {
      method: "DELETE",
      credentials: "include",
    });
    return response.json();
  },

  // Events
  getEvents: async (params: URLSearchParams) => {
    const response = await fetch(`${API_BASE}/events?${params}`, {
      credentials: "include",
    });
    return response.json();
  },

  updateEventStatus: async (eventId: string, status: string) => {
    const response = await fetch(`${API_BASE}/events/${eventId}/status`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ status }),
    });
    return response.json();
  },

  deleteEvent: async (eventId: string) => {
    const response = await fetch(`${API_BASE}/events/${eventId}`, {
      method: "DELETE",
      credentials: "include",
    });
    return response.json();
  },

  // Blood Requests
  getBloodRequests: async (params: URLSearchParams) => {
    const response = await fetch(`${API_BASE}/blood-requests?${params}`, {
      credentials: "include",
    });
    return response.json();
  },

  updateBloodRequestStatus: async (requestId: string, status: string) => {
    const response = await fetch(
      `${API_BASE}/blood-requests/${requestId}/status`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ status }),
      }
    );
    return response.json();
  },

  deleteBloodRequest: async (requestId: string) => {
    const response = await fetch(`${API_BASE}/blood-requests/${requestId}`, {
      method: "DELETE",
      credentials: "include",
    });
    return response.json();
  },

  // Posts
  getPosts: async (params: URLSearchParams) => {
    const response = await fetch(`${API_BASE}/posts?${params}`, {
      credentials: "include",
    });
    return response.json();
  },

  deletePost: async (postId: string) => {
    const response = await fetch(`${API_BASE}/posts/${postId}`, {
      method: "DELETE",
      credentials: "include",
    });
    return response.json();
  },
};
