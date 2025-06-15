import axios from "axios";
import { bloodInventoryService } from "./bloodInventoryService";

// Base API configuration
const API_BASE_URL =
  import.meta.env.VITE_BASE_API_URL || "http://localhost:8001/api/v1/user";

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Critical for handling cookies/sessions
});

// Donor API configuration
const donorApi = axios.create({
  baseURL: `${"http://localhost:8001/api/v1"}/donor`,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Add response interceptor to donorApi
donorApi.interceptors.response.use(
  (response) => response,
  (error) => {
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

// Request interceptor - useful for adding auth tokens to requests
api.interceptors.request.use(
  (config) => {
    // Add any request interceptor logic here
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - useful for handling errors globally
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle unauthorized errors (401) and blocked account errors (403)
    if (
      error.response &&
      (error.response.status === 401 || error.response.status === 403)
    ) {
      // Clear localStorage on 401/403
      localStorage.removeItem("bloodDonationUser");

      // Only redirect if not already on login page to prevent redirect loops
      if (!window.location.href.includes("/login")) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

// Auth services
export const authService = {
  login: async (email: string, password: string) => {
    try {
      // Direct axios call with explicit withCredentials to ensure cookies are handled
      const response = await axios.post(
        `${API_BASE_URL}/login`,
        { email, password },
        {
          withCredentials: true,
          headers: { "Content-Type": "application/json" },
        }
      );

      // Debug cookie reception
      console.log("Login response headers:", response.headers);
      console.log("Login response data:", response.data);

      if (response.data && response.data.user) {
        // Store user data in localStorage for quick access
        localStorage.setItem(
          "bloodDonationUser",
          JSON.stringify(response.data.user)
        );
      } else {
        console.error("Missing user data in login response");
      }

      return response.data;
    } catch (error) {
      console.error("Login error details:", error);
      throw error;
    }
  },
  register: async (userData: FormData) => {
    try {
      const response = await api.post("/register", userData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  logout: async () => {
    try {
      // Direct axios call with explicit withCredentials to ensure cookies are handled
      const response = await axios.post(
        `${API_BASE_URL}/logout`,
        {},
        {
          withCredentials: true,
        }
      );

      console.log("Logout response:", response.data);

      // Always remove from localStorage regardless of API response
      localStorage.removeItem("bloodDonationUser");

      return response.data;
    } catch (error) {
      console.error("Logout error:", error);
      // Even on error, remove from localStorage
      localStorage.removeItem("bloodDonationUser");
      // Don't throw error as we want logout to succeed locally even if API fails
      return { success: true, message: "Logged out locally" };
    }
  },
  getCurrentUser: async () => {
    try {
      // Try to get user from localStorage first for speed
      const cachedUser = localStorage.getItem("bloodDonationUser");
      if (cachedUser) {
        return JSON.parse(cachedUser);
      }

      // Fallback - try API call with a short timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1500);

      try {
        const response = await api.get("/users/me", {
          signal: controller.signal,
        });
        clearTimeout(timeoutId);
        return response.data;
      } catch (err) {
        clearTimeout(timeoutId);
        // If we can't reach the endpoint, consider user not authenticated
        return null;
      }
    } catch (error) {
      return null;
    }
  },
  updateProfile: async (userData: FormData) => {
    try {
      // Get user data from localStorage
      const userDataString = localStorage.getItem("bloodDonationUser");
      if (!userDataString) {
        throw new Error("User not found in local storage");
      }

      const userData_local = JSON.parse(userDataString);
      const userId = userData_local._id; // Get the _id from the stored user data

      if (!userId) {
        throw new Error("User ID not found");
      }

      const response = await api.put(`/users/${userId}`, userData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      // Update the cached user data
      if (response.data.user) {
        localStorage.setItem(
          "bloodDonationUser",
          JSON.stringify(response.data.user)
        );
      }

      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get fresh user data from server
  getUserProfile: async (userId: string) => {
    try {
      const response = await api.get(`/users/${userId}`);

      if (response.data.user) {
        // Update the cached user data with fresh data including donation status
        localStorage.setItem(
          "bloodDonationUser",
          JSON.stringify(response.data.user)
        );
        return response.data.user;
      }

      return null;
    } catch (error) {
      console.error("Error fetching user profile:", error);
      throw error;
    }
  },
};

// Event services - using correct base URL for events
const EVENT_API_BASE_URL =
  import.meta.env.VITE_BASE_API_URL?.replace("/user", "/events") ||
  "http://localhost:8001/api/v1/events";

const eventApi = axios.create({
  baseURL: EVENT_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Add response interceptor to eventApi
eventApi.interceptors.response.use(
  (response) => response,
  (error) => {
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

export const eventService = {
  getAllEvents: async () => {
    try {
      const response = await eventApi.get("/");
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getEventById: async (id: string) => {
    try {
      const response = await eventApi.get(`/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  createEvent: async (eventData: FormData) => {
    try {
      const response = await eventApi.post("/create", eventData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getMyEvents: async () => {
    try {
      const response = await eventApi.get("/my-events");
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  updateEvent: async (id: string, eventData: FormData) => {
    try {
      const response = await eventApi.put(`/${id}`, eventData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  deleteEvent: async (id: string) => {
    try {
      const response = await eventApi.delete(`/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

// Donation services
export interface DonorRegistrationData {
  name: string;
  dob: string;
  gender: "Male" | "Female" | "Other";
  phone: string;
  email: string;
  bloodType: string;
  idProofType: "PAN" | "Aadhaar" | "Vote ID";
  idProofImage?: File | null;
  disability: boolean;
  weight: number;
  hemoglobinCount: number;
  isHealthy: boolean;
  declarationAccepted: boolean;
}

export interface DonationRecord {
  id: string;
  donorId: string;
  donationDate: string;
  hospitalName: string;
  units: number;
  bloodType: string;
  hemoglobinLevel?: number;
  notes?: string;
  certificateUrl?: string;
  nextEligibleDate: string;
  createdAt: string;
  updatedAt: string;
}

export const donationService = {
  registerDonor: async (donorData: DonorRegistrationData) => {
    try {
      const formData = new FormData();
      formData.append("name", donorData.name);
      formData.append("dob", donorData.dob);
      formData.append("gender", donorData.gender);
      formData.append("phone", donorData.phone);
      formData.append("email", donorData.email);
      formData.append("bloodType", donorData.bloodType);
      formData.append("idProofType", donorData.idProofType);
      formData.append("disability", donorData.disability.toString());
      formData.append("weight", donorData.weight.toString());
      formData.append("hemoglobinCount", donorData.hemoglobinCount.toString());
      formData.append("isHealthy", donorData.isHealthy.toString());
      formData.append(
        "declarationAccepted",
        donorData.declarationAccepted.toString()
      );

      if (donorData.idProofImage) {
        formData.append("idProofImage", donorData.idProofImage);
      }
      const response = await donorApi.post("/register", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error: any) {
      console.error("Donor registration API error:", error);
      console.error("Response data:", error.response?.data);
      console.error("Response status:", error.response?.status);
      console.error("Response headers:", error.response?.headers);

      // Check if it's a 404 error (route not found)
      if (error.response?.status === 404) {
        throw new Error(
          "Donor registration endpoint not found. Please check if the donor routes are properly configured in the backend."
        );
      }

      throw error;
    }
  },

  getMyDonorForm: async () => {
    try {
      const response = await donorApi.get("/me");
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getAllDonors: async () => {
    try {
      const response = await donorApi.get("/all");
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getDonorById: async (id: string) => {
    try {
      const response = await donorApi.get(`/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getUserDonations: async () => {
    try {
      const response = await api.get("/donations/user");
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  recordDonation: async (donationData: Partial<DonationRecord>) => {
    try {
      const response = await api.post("/donations/record", donationData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getDonationById: async (donationId: string) => {
    try {
      const response = await api.get(`/donations/${donationId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  uploadDonationCertificate: async (
    donationId: string,
    certificateFile: File
  ) => {
    try {
      const formData = new FormData();
      formData.append("certificate", certificateFile);

      const response = await api.post(
        `/donations/${donationId}/certificate`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getDonorStatus: async () => {
    try {
      const response = await api.get("/donations/status");
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getNextDonationDate: async () => {
    try {
      const response = await api.get("/donations/next-eligible");
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

// Event registration API base URL
const EVENT_REGISTRATION_API_BASE_URL =
  import.meta.env.VITE_BASE_API_URL?.replace("/user", "/event-registrations") ||
  "http://localhost:8001/api/v1/event-registrations";

const eventRegistrationApi = axios.create({
  baseURL: EVENT_REGISTRATION_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Add response interceptor to eventRegistrationApi
eventRegistrationApi.interceptors.response.use(
  (response) => response,
  (error) => {
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

export const eventRegistrationService = {
  // Register for an event
  registerForEvent: async (eventId: string) => {
    try {
      const response = await eventRegistrationApi.post(`/${eventId}/register`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Check if user is registered for an event
  checkEventRegistration: async (eventId: string) => {
    try {
      const response = await eventRegistrationApi.get(
        `/${eventId}/check-registration`
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get all registrations for an event (only for event creator)
  getEventRegistrations: async (eventId: string) => {
    try {
      const response = await eventRegistrationApi.get(
        `/${eventId}/registrations`
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get all events a user has registered for
  getUserEventRegistrations: async () => {
    try {
      const response = await eventRegistrationApi.get("/user-registrations");
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update registration status (accept/reject)
  updateRegistrationStatus: async (registrationId: string, status: string) => {
    try {
      const response = await eventRegistrationApi.patch(
        `/${registrationId}/status`,
        { status }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

// Blood request services
export const bloodRequestService = {
  getActiveRequests: async (filters?: {
    bloodType?: string;
    urgency?: string;
    location?: string;
  }) => {
    try {
      const params = new URLSearchParams();
      if (filters) {
        if (filters.bloodType) params.append("bloodType", filters.bloodType);
        if (filters.urgency) params.append("urgency", filters.urgency);
        if (filters.location) params.append("location", filters.location);
      }

      const queryString = params.toString();
      const url = queryString
        ? `/blood-requests?${queryString}`
        : "/blood-requests";

      const response = await api.get(url);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getRequestById: async (id: string) => {
    try {
      const response = await api.get(`/blood-requests/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  createRequest: async (requestData: {
    name: string;
    bloodType: string;
    hospital: string;
    location: string;
    urgency: "low" | "medium" | "high";
    units: number;
    contactNumber: string;
    reason: string;
  }) => {
    try {
      // Map frontend field names to backend field names
      const backendData = {
        patientName: requestData.name,
        bloodType: requestData.bloodType,
        hospital: requestData.hospital,
        location: requestData.location,
        urgency: requestData.urgency,
        unitsRequired: requestData.units,
        contactNumber: requestData.contactNumber,
        reason: requestData.reason,
      };
      const response = await api.post("/blood-requests", backendData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  respondToRequest: async (
    requestId: string,
    responseData: {
      message?: string;
      contactNumber: string;
    }
  ) => {
    try {
      const response = await api.post(
        `/blood-requests/${requestId}/respond`,
        responseData
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getRequestResponses: async (requestId: string) => {
    try {
      const response = await api.get(`/blood-requests/${requestId}/responses`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getUserRequests: async () => {
    try {
      const response = await api.get("/blood-requests/my-requests");
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  getUserDeletedRequests: async () => {
    try {
      const response = await api.get("/blood-requests/my-deleted-requests");
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  getUserResponses: async () => {
    try {
      const response = await api.get("/blood-requests/my-responses");
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  updateRequestStatus: async (
    requestId: string,
    status: "Pending" | "Approved" | "Rejected" | "Fulfilled"
  ) => {
    try {
      const response = await api.put(`/blood-requests/${requestId}/status`, {
        status,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  cancelRequest: async (requestId: string) => {
    try {
      // Use the proper DELETE endpoint for soft deletion
      const response = await api.delete(`/blood-requests/${requestId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  updateResponseStatus: async (
    responseId: string,
    status: "Pending" | "Accepted" | "Declined" | "Completed"
  ) => {
    try {
      const response = await api.put(
        `/blood-requests/responses/${responseId}/status`,
        { status }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

// Report services
export const reportService = {
  uploadReport: async (reportData: FormData) => {
    try {
      const response = await api.post("/reports/upload", reportData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getUserReports: async () => {
    try {
      const response = await api.get("/reports/user");
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

// Post services
export const postService = {
  getAllPosts: async () => {
    try {
      const response = await api.get("/post/all");
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getPaginatedPosts: async (
    page = 1,
    limit = 10,
    sortBy = "createdAt",
    order = "desc",
    userId?: string
  ) => {
    try {
      let query = `/post/paginated?page=${page}&limit=${limit}&sortBy=${sortBy}&order=${order}`;
      if (userId) {
        query += `&userId=${userId}`;
      }
      const response = await api.get(query);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getPostById: async (id: string) => {
    try {
      const response = await api.get(`/post/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  createPost: async (postData: FormData) => {
    try {
      const response = await api.post("/post/create", postData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  updatePost: async (id: string, postData: FormData) => {
    try {
      const response = await api.put(`/post/${id}`, postData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  likePost: async (id: string) => {
    try {
      const response = await api.post(`/post/${id}/like`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  commentOnPost: async (id: string, text: string) => {
    try {
      const response = await api.post(`/post/${id}/comment`, { text });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  replyToComment: async (postId: string, commentId: string, text: string) => {
    try {
      const response = await api.post(
        `/post/${postId}/comment/${commentId}/reply`,
        { text }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  sharePost: async (id: string) => {
    try {
      const response = await api.post(`/post/${id}/share`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  deletePost: async (id: string) => {
    try {
      const response = await api.delete(`/post/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

// Testimonial services
export const testimonialService = {
  getAllTestimonials: async () => {
    try {
      // Using direct axios call to ensure we're using the correct endpoint
      const response = await axios.get(
        "http://localhost:8001/api/v1/testimonials/"
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching testimonials:", error);
      throw error;
    }
  },

  createTestimonial: async (testimonialData: {
    authorName: string;
    authorRole: string;
    avatar?: string;
    quote: string;
    detailedFeedback?: string;
  }) => {
    try {
      const response = await axios.post(
        "http://localhost:8001/api/v1/testimonials/create",
        testimonialData
      );
      return response.data;
    } catch (error) {
      console.error("Error creating testimonial:", error);
      throw error;
    }
  },
};

// Re-export bloodInventoryService
export { bloodInventoryService };

// User history services
export const userHistoryService = {
  getHospitalHistory: async () => {
    try {
      const response = await api.get("/hospital-history");
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getOrganizationHistory: async () => {
    try {
      const response = await api.get("/organization-history");
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getHospitalUserInteractions: async () => {
    try {
      const response = await api.get("/hospital-user-interactions");
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getOrganizationUserInteractions: async () => {
    try {
      const response = await api.get("/organization-user-interactions");
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export default api;
