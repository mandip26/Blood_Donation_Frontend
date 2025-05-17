import axios from 'axios';

// Base API configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // To handle cookies/sessions
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
      // Logout user or redirect to login page
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth services
export const authService = {
  login: async (email: string, password: string) => {
    try {
      const response = await api.post('/users/login', { email, password });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  register: async (userData: FormData) => {
    try {
      const response = await api.post('/users/register', userData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  logout: async () => {
    try {
      const response = await api.post('/users/logout');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getCurrentUser: async () => {
    try {
      const response = await api.get('/users/me');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  updateProfile: async (userData: FormData) => {
    try {
      const response = await api.put('/users/update', userData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
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
      const response = await api.get('/events');
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
      const response = await api.post('/events', eventData, {
        headers: {
          'Content-Type': 'multipart/form-data',
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
  gender: 'male' | 'female' | 'other';
  bloodType: string;
  weight: number;
  hemoglobinCount?: number;
  disability: 'yes' | 'no';
  healthy: 'yes' | 'no';
  phoneNo: string;
  email: string;
  idProofType: 'PAN' | 'Aadhaar' | 'VoterID';
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
      const response = await api.post('/donations/register', donorData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getUserDonations: async () => {
    try {
      const response = await api.get('/donations/user');
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  recordDonation: async (donationData: Partial<DonationRecord>) => {
    try {
      const response = await api.post('/donations/record', donationData);
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
  
  uploadDonationCertificate: async (donationId: string, certificateFile: File) => {
    try {
      const formData = new FormData();
      formData.append('certificate', certificateFile);
      
      const response = await api.post(`/donations/${donationId}/certificate`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  getDonorStatus: async () => {
    try {
      const response = await api.get('/donations/status');
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  getNextDonationDate: async () => {
    try {
      const response = await api.get('/donations/next-eligible');
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

// Blood request services
export const bloodRequestService = {
  getActiveRequests: async (filters?: { bloodType?: string, urgency?: string, location?: string }) => {
    try {
      const params = new URLSearchParams();
      if (filters) {
        if (filters.bloodType) params.append('bloodType', filters.bloodType);
        if (filters.urgency) params.append('urgency', filters.urgency);
        if (filters.location) params.append('location', filters.location);
      }
      
      const queryString = params.toString();
      const url = queryString ? `/blood-requests?${queryString}` : '/blood-requests';
      
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
    urgency: 'low' | 'medium' | 'high';
    units: number;
    contactNumber: string;
    reason: string;
  }) => {
    try {
      const response = await api.post('/blood-requests', requestData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  respondToRequest: async (requestId: string, responseData: {
    donorId: string;
    responseTime: string;
    message?: string;
    contactNumber: string;
  }) => {
    try {
      const response = await api.post(`/blood-requests/${requestId}/respond`, responseData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  getUserRequests: async () => {
    try {
      const response = await api.get('/blood-requests/user');
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
  }
};

// Report services
export const reportService = {
  uploadReport: async (reportData: FormData) => {
    try {
      const response = await api.post('/reports/upload', reportData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getUserReports: async () => {
    try {
      const response = await api.get('/reports/user');
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export default api;
