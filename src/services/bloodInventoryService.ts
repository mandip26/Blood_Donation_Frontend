import axios from "axios";

const INVENTORY_API_URL =
  "https://blood-donation-backend-buge.onrender.com/api/v1/blood-inventory";

// Create axios instance with default config
const bloodInventoryApi = axios.create({
  baseURL: INVENTORY_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Critical for handling cookies/sessions
});

// Add request interceptor to bloodInventoryApi for token handling
bloodInventoryApi.interceptors.request.use(
  (config) => {
    // Get user data from localStorage
    const userData = localStorage.getItem("bloodDonationUser");
    if (userData) {
      const user = JSON.parse(userData);
      // If token exists in user data, add it to Authorization header
      if (user.token) {
        config.headers.Authorization = `Bearer ${user.token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to bloodInventoryApi
bloodInventoryApi.interceptors.response.use(
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

export interface BloodInventory {
  userId?: string;
  aPositive: number;
  aNegative: number;
  bPositive: number;
  bNegative: number;
  abPositive: number;
  abNegative: number;
  oPositive: number;
  oNegative: number;
  lastUpdated?: Date;
}

export const bloodInventoryService = {
  // Get blood inventory for current user
  getInventory: async (): Promise<BloodInventory> => {
    try {
      const response = await bloodInventoryApi.get(`/`);
      return response.data.inventory;
    } catch (error) {
      console.error("Error fetching blood inventory:", error);
      throw error;
    }
  },

  // Update blood inventory
  updateInventory: async (
    inventoryData: BloodInventory
  ): Promise<BloodInventory> => {
    try {
      const response = await bloodInventoryApi.post(`/update`, inventoryData);
      return response.data.inventory;
    } catch (error) {
      console.error("Error updating blood inventory:", error);
      throw error;
    }
  },

  // Get all inventories (admin only)
  getAllInventories: async () => {
    try {
      const response = await bloodInventoryApi.get(`/all`);
      return response.data.inventories;
    } catch (error) {
      console.error("Error fetching all blood inventories:", error);
      throw error;
    }
  },
};

export default bloodInventoryService;
