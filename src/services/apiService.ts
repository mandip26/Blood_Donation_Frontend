import axios from "axios";

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
    // Handle unauthorized errors (401)
    if (error.response && error.response.status === 401) {
      // Clear localStorage on 401
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

      const response = await api.put(
        `/users/${userId}`,
        userData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      // Update the cached user data
      if (response.data.user) {
        localStorage.setItem("bloodDonationUser", JSON.stringify(response.data.user));
      }

      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

// Event services
export const eventService = {
  getAllEvents: async () => {
    try {
      const response = await api.get("/events");
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getEventById: async (id: string) => {
    try {
      const response = await api.get(`/events/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  createEvent: async (eventData: FormData) => {
    try {
      const response = await api.post("/events", eventData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

// Donation services
export interface DonorRegistrationData {
  fullName: string;
  dateOfBirth: string;
  gender: "male" | "female" | "other";
  bloodType: string;
  weight: number;
  hemoglobinCount?: number;
  disability: "yes" | "no";
  healthy: "yes" | "no";
  phoneNo: string;
  email: string;
  idProofType: "PAN" | "Aadhaar" | "VoterID";
  idProofNumber: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
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
      const response = await api.post("/donations/register", donorData);
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
      const response = await api.post("/blood-requests", requestData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  respondToRequest: async (
    requestId: string,
    responseData: {
      donorId: string;
      responseTime: string;
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

  getUserRequests: async () => {
    try {
      const response = await api.get("/blood-requests/user");
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  cancelRequest: async (requestId: string) => {
    try {
      const response = await api.delete(`/blood-requests/${requestId}`);
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

export default api;
