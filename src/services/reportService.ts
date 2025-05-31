import api from "./apiService";

// Types for blood test report data
export interface BloodTestParameter {
  name: string;
  value: number;
  unit: string;
  normalRange?: string;
  status?: "normal" | "high" | "low";
}

export interface BloodTestReport {
  id: string;
  userId: string;
  reportDate: string;
  hospitalName: string;
  doctorName?: string;
  reportType: string;
  fileName: string;
  fileUrl: string;
  parameters?: BloodTestParameter[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Common blood parameters with reference ranges
export const commonBloodParameters = {
  red: [
    { name: "Hemoglobin", unit: "g/dL", normalRange: "13.5-17.5" },
    { name: "RBC", unit: "million/μL", normalRange: "4.5-5.9" },
    { name: "Hematocrit", unit: "%", normalRange: "38.8-50" },
    { name: "MCV", unit: "fL", normalRange: "80-100" },
    { name: "MCH", unit: "pg", normalRange: "27-33" },
    { name: "MCHC", unit: "g/dL", normalRange: "33-36" },
    { name: "RDW", unit: "%", normalRange: "11.5-14.5" },
  ],
  white: [
    { name: "WBC", unit: "/μL", normalRange: "4500-11000" },
    { name: "Neutrophils", unit: "%", normalRange: "40-60" },
    { name: "Lymphocytes", unit: "%", normalRange: "20-40" },
    { name: "Monocytes", unit: "%", normalRange: "2-8" },
    { name: "Eosinophils", unit: "%", normalRange: "1-4" },
    { name: "Basophils", unit: "%", normalRange: "0.5-1" },
  ],
  platelets: [
    { name: "Platelets", unit: "/μL", normalRange: "150000-450000" },
    { name: "MPV", unit: "fL", normalRange: "7.5-11.5" },
  ],
  biochemistry: [
    { name: "Glucose", unit: "mg/dL", normalRange: "70-100" },
    { name: "BUN", unit: "mg/dL", normalRange: "7-20" },
    { name: "Creatinine", unit: "mg/dL", normalRange: "0.6-1.2" },
    { name: "Sodium", unit: "mmol/L", normalRange: "135-145" },
    { name: "Potassium", unit: "mmol/L", normalRange: "3.5-5.0" },
    { name: "Chloride", unit: "mmol/L", normalRange: "98-106" },
    { name: "Total Protein", unit: "g/dL", normalRange: "6.0-8.3" },
    { name: "Albumin", unit: "g/dL", normalRange: "3.5-5.0" },
    { name: "Bilirubin", unit: "mg/dL", normalRange: "0.1-1.2" },
  ],
};

// Report processing and analysis
export const reportProcessingService = {
  // Extract data from report file (this would use a backend service in production)
  extractDataFromReport: (): BloodTestParameter[] => {
    // Mock implementation - in real app this would call the backend for processing
    return [
      {
        name: "Hemoglobin",
        value: 14.2,
        unit: "g/dL",
        normalRange: "13.5-17.5",
        status: "normal",
      },
      {
        name: "RBC",
        value: 4.9,
        unit: "million/μL",
        normalRange: "4.5-5.9",
        status: "normal",
      },
      {
        name: "WBC",
        value: 7500,
        unit: "/μL",
        normalRange: "4500-11000",
        status: "normal",
      },
      {
        name: "Platelets",
        value: 250000,
        unit: "/μL",
        normalRange: "150000-450000",
        status: "normal",
      },
      {
        name: "Hematocrit",
        value: 42,
        unit: "%",
        normalRange: "38.8-50",
        status: "normal",
      },
      {
        name: "MCV",
        value: 88,
        unit: "fL",
        normalRange: "80-100",
        status: "normal",
      },
      {
        name: "MCH",
        value: 29,
        unit: "pg",
        normalRange: "27-33",
        status: "normal",
      },
      {
        name: "MCHC",
        value: 33,
        unit: "g/dL",
        normalRange: "33-36",
        status: "normal",
      },
      {
        name: "RDW",
        value: 13.4,
        unit: "%",
        normalRange: "11.5-14.5",
        status: "normal",
      },
    ];
  },

  // Analyze if parameter values are within normal range
  analyzeParameter: (param: BloodTestParameter): BloodTestParameter => {
    if (!param.normalRange) return param;

    const rangeParts = param.normalRange.split("-");
    if (rangeParts.length !== 2) return param;

    const low = parseFloat(rangeParts[0]);
    const high = parseFloat(rangeParts[1]);

    let status: "normal" | "high" | "low" = "normal";
    if (param.value < low) status = "low";
    if (param.value > high) status = "high";

    return { ...param, status };
  },

  // Group parameters by category
  categorizeParameters: (parameters: BloodTestParameter[]) => {
    const result = {
      red: parameters.filter((p) =>
        commonBloodParameters.red.some((cp) => cp.name === p.name)
      ),
      white: parameters.filter((p) =>
        commonBloodParameters.white.some((cp) => cp.name === p.name)
      ),
      platelets: parameters.filter((p) =>
        commonBloodParameters.platelets.some((cp) => cp.name === p.name)
      ),
      biochemistry: parameters.filter((p) =>
        commonBloodParameters.biochemistry.some((cp) => cp.name === p.name)
      ),
      other: parameters.filter(
        (p) =>
          !commonBloodParameters.red.some((cp) => cp.name === p.name) &&
          !commonBloodParameters.white.some((cp) => cp.name === p.name) &&
          !commonBloodParameters.platelets.some((cp) => cp.name === p.name) &&
          !commonBloodParameters.biochemistry.some((cp) => cp.name === p.name)
      ),
    };

    return result;
  },

  // Check eligibility for blood donation based on report
  checkDonationEligibility: (
    report: BloodTestReport
  ): { eligible: boolean; reasons: string[] } => {
    const reasons: string[] = [];
    let eligible = true;

    // Check if parameters exist
    if (!report.parameters || report.parameters.length === 0) {
      return {
        eligible: false,
        reasons: ["Report does not contain any blood parameters"],
      };
    }

    // Check specific parameters
    const hemoglobin = report.parameters.find((p) => p.name === "Hemoglobin");
    if (hemoglobin) {
      // Hemoglobin level for male donors should be at least 13.0 g/dL
      if (hemoglobin.value < 13.0) {
        eligible = false;
        reasons.push(
          `Hemoglobin level (${hemoglobin.value} ${hemoglobin.unit}) is below the minimum requirement for donation (13.0 ${hemoglobin.unit})`
        );
      }
    } else {
      reasons.push("Hemoglobin level not found in report");
    }

    const wbc = report.parameters.find((p) => p.name === "WBC");
    if (wbc) {
      // Check for abnormal WBC count
      if (wbc.value < 4500 || wbc.value > 11000) {
        eligible = false;
        reasons.push(
          `WBC count (${wbc.value} ${wbc.unit}) is outside the normal range`
        );
      }
    }

    const platelets = report.parameters.find((p) => p.name === "Platelets");
    if (platelets) {
      // Check for abnormal platelet count
      if (platelets.value < 150000) {
        eligible = false;
        reasons.push(
          `Platelet count (${platelets.value} ${platelets.unit}) is below the minimum requirement`
        );
      }
    }

    return { eligible, reasons };
  },
};

// Report API services
const reportService = {
  // Upload a new report
  uploadReport: async (
    reportFile: File,
    reportData: Partial<BloodTestReport>
  ) => {
    try {
      const formData = new FormData();
      formData.append("reportFile", reportFile);
      formData.append("reportData", JSON.stringify(reportData));

      const response = await api.post("/reports/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get all reports for a user
  getUserReports: async () => {
    try {
      const response = await api.get("/reports/user");
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get a specific report by ID
  getReportById: async (reportId: string) => {
    try {
      const response = await api.get(`/reports/${reportId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Delete a report
  deleteReport: async (reportId: string) => {
    try {
      const response = await api.delete(`/reports/${reportId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Generate a report analysis
  analyzeReport: async (reportId: string) => {
    try {
      const response = await api.get(`/reports/${reportId}/analyze`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Compare multiple reports
  compareReports: async (reportIds: string[]) => {
    try {
      const response = await api.post("/reports/compare", { reportIds });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get eligibility for donation based on latest report
  getDonationEligibility: async () => {
    try {
      const response = await api.get("/reports/donation-eligibility");
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get parameter trend over time
  getParameterTrend: async (parameterName: string) => {
    try {
      const response = await api.get(`/reports/trends/${parameterName}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export default reportService;
