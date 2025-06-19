import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  UploadCloud,
  FileText,
  AlertTriangle,
  Trash2,
  Download,
  Wifi,
  WifiOff,
} from "lucide-react";
import axios from "axios";
import { useAuth } from "@/hooks/useAuth";
import LoadingState from "@/components/common/LoadingState";

interface PatientData {
  name: string;
  age: string;
  gender: string;
  referred_by: string;
  date: string;
}

interface ReportData {
  title: string;
  result: string;
  unit: string;
  reference: string;
}

interface ExtractedData {
  patient: PatientData;
  reports: ReportData[];
  _id: string;
}

export const Route = createFileRoute(
  "/dashboard/_dashboardLayout/visualization-api"
)({
  component: VisualizationPage,
});

function VisualizationPage() {
  const { isLoading } = useAuth();

  // File upload state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadStep, setUploadStep] = useState<
    "upload" | "processing" | "results" | "error"
  >("upload");
  const [errorMessage, setErrorMessage] = useState("");
  const [backendStatus, setBackendStatus] = useState<
    "checking" | "connected" | "disconnected"
  >("checking");

  // Extracted data from API
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(
    null
  );

  // Check backend connectivity on component mount
  useEffect(() => {
    const checkBackendConnection = async () => {
      try {
        // Simple ping to backend - adjust the timeout to be shorter for quick response
        await axios.get(
          "https://medical-report-ai.onrender.com/api/v1/health",
          {
            timeout: 2000,
          }
        );
        setBackendStatus("connected");
      } catch (error) {
        console.error("Backend connection error:", error);
        setBackendStatus("disconnected");
      }
    };

    checkBackendConnection();

    // Check connection every 30 seconds
    const intervalId = setInterval(checkBackendConnection, 30000);

    // Clean up on component unmount
    return () => clearInterval(intervalId);
  }, []);

  if (isLoading) {
    return <LoadingState />;
  }

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const validFileTypes = [
        "application/pdf",
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/tiff",
      ];

      if (validFileTypes.includes(file.type)) {
        setSelectedFile(file);
        setErrorMessage("");
      } else {
        setErrorMessage(
          "Please upload a valid file (PDF, JPG, JPEG, PNG, or TIFF)."
        );
        setSelectedFile(null);
      }
    }
  };

  // Handle drag events
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      const validFileTypes = [
        "application/pdf",
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/tiff",
      ];

      if (validFileTypes.includes(file.type)) {
        setSelectedFile(file);
        setErrorMessage("");
      } else {
        setErrorMessage(
          "Please upload a valid file (PDF, JPG, JPEG, PNG, or TIFF)."
        );
        setSelectedFile(null);
      }
    }
  };
  // Handle file upload and processing
  const handleVisualize = async () => {
    if (!selectedFile) {
      setErrorMessage("Please select a file to visualize.");
      return;
    }

    // Check if backend is disconnected
    if (backendStatus === "disconnected") {
      setErrorMessage(
        "Unable to connect to the backend server. Please check your connection and try again."
      );
      return;
    }

    setUploadStep("processing");

    try {
      // Create form data to send the file
      const formData = new FormData();
      formData.append("file", selectedFile);

      // Make the API call to the backend
      const response = await axios.post(
        "https://medical-report-ai.onrender.com/api/v1/extract",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      // Store the extracted data
      console.log("Extracted data:", response.data);
      setExtractedData(response.data);
      setUploadStep("results");
    } catch (error: any) {
      console.error("Error uploading file:", error);

      // More specific error handling based on error types
      if (error.response) {
        // Server responded with an error status
        if (error.response.status === 400) {
          setErrorMessage(
            error.response.data?.detail || "Invalid file format or size."
          );
        } else if (error.response.status === 500) {
          setErrorMessage(
            "Server error processing report. Please try again later."
          );
        } else if (error.response.status === 429) {
          setErrorMessage("Too many requests. Please try again in a moment.");
        } else {
          setErrorMessage(
            error.response.data?.detail || "Server error. Please try again."
          );
        }
      } else if (error.request) {
        // Request was made but no response received
        setErrorMessage(
          "Unable to connect to server. Please check your internet connection."
        );
      } else {
        // Something happened in setting up the request
        setErrorMessage(
          error.message || "An unexpected error occurred during file processing"
        );
      }

      setUploadStep("error");
    }
  };
  // Reset the upload process
  const handleReset = () => {
    setSelectedFile(null);
    setUploadStep("upload");
    setErrorMessage("");
    setExtractedData(null);
  };

  // Download report as JSON
  const handleDownloadReport = () => {
    if (!extractedData) return;

    // Create a JSON blob
    const jsonBlob = new Blob([JSON.stringify(extractedData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(jsonBlob);

    // Create a link and trigger download
    const link = document.createElement("a");
    link.href = url;
    link.download = `medical-report-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(link);
    link.click();

    // Clean up
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Function to determine the status of a result based on reference range
  const determineStatus = (
    value: string,
    reference: string
  ): "normal" | "low" | "high" => {
    // Handle ranges with hyphens (e.g., "13.5-17.5")
    if (reference.includes("-")) {
      const [min, max] = reference.split("-").map((v) => parseFloat(v.trim()));
      const numValue = parseFloat(value);

      if (isNaN(min) || isNaN(max) || isNaN(numValue)) return "normal";

      if (numValue < min) return "low";
      if (numValue > max) return "high";
      return "normal";
    }

    return "normal"; // Default if we can't determine
  };

  // Get badge color based on status
  const getBadgeColor = (status: "normal" | "low" | "high") => {
    switch (status) {
      case "normal":
        return "bg-green-100 text-green-800";
      case "low":
        return "bg-orange-100 text-orange-800";
      case "high":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6 p-4">
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold mb-4">Medical Report Analyzer</h2>
            <p className="text-gray-600">
              Upload your medical report to extract and analyze the data.
            </p>
          </div>
          <div className="flex items-center">
            {backendStatus === "connected" && (
              <div className="flex items-center text-green-600 text-sm">
                <Wifi size={16} className="mr-1" />
                <span>Backend Connected</span>
              </div>
            )}
            {backendStatus === "disconnected" && (
              <div className="flex items-center text-red-600 text-sm">
                <WifiOff size={16} className="mr-1" />
                <span>Backend Disconnected</span>
              </div>
            )}
            {backendStatus === "checking" && (
              <div className="flex items-center text-yellow-600 text-sm">
                <div className="animate-spin rounded-full h-3 w-3 border border-current mr-1"></div>
                <span>Checking Connection</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Upload Section */}
      {uploadStep === "upload" && (
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="text-xl font-semibold mb-6">Upload Medical Report</h3>{" "}
          <div className="flex flex-col items-center">
            <div
              className={`w-full max-w-md border-2 border-dashed ${selectedFile ? "border-primary-magenta bg-primary-magenta/5" : "border-gray-300 hover:border-gray-400"} rounded-lg p-4 sm:p-8 flex flex-col items-center justify-center mb-6 transition-colors cursor-pointer`}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => document.getElementById("file-upload")?.click()}
            >
              {!selectedFile ? (
                <>
                  <div className="mb-4">
                    <UploadCloud size={48} className="text-gray-400" />
                  </div>

                  <h3 className="text-xl font-medium text-primary-magenta mb-2">
                    Drag & Drop
                  </h3>
                  <p className="text-gray-500 text-center mb-4">
                    Upload your document for analysis
                  </p>

                  <input
                    type="file"
                    className="hidden"
                    id="file-upload"
                    accept=".pdf,.jpg,.jpeg,.png,.tiff"
                    onChange={handleFileChange}
                  />
                  <span className="cursor-pointer text-sm text-gray-500 hover:text-gray-700 underline">
                    Browse files
                  </span>
                </>
              ) : (
                <div className="flex items-center">
                  <FileText size={24} className="text-primary-magenta mr-3" />
                  <div>
                    <p className="font-medium">{selectedFile.name}</p>
                    <p className="text-sm text-gray-500">
                      {(selectedFile.size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedFile(null);
                    }}
                    className="ml-4 text-gray-400 hover:text-gray-600"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              )}
            </div>

            {errorMessage && (
              <div className="flex items-center text-red-600 mb-6">
                <AlertTriangle size={16} className="mr-2" />
                <span className="text-sm">{errorMessage}</span>
              </div>
            )}

            <Button
              onClick={handleVisualize}
              disabled={!selectedFile}
              className="bg-primary-magenta text-white hover:bg-primary-magenta/90 px-6 py-2 rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Analyze Report
            </Button>

            <p className="text-gray-500 text-sm mt-4">
              Supported formats: PDF, JPG, JPEG, PNG, or TIFF. Maximum file
              size: 5MB.
            </p>
          </div>
        </div>
      )}

      {/* Processing State */}
      {uploadStep === "processing" && (
        <div className="bg-white rounded-xl p-10 shadow-sm flex justify-center">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary-magenta border-t-transparent mb-6"></div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Processing your report...
            </h3>
            <p className="text-gray-500 text-center">
              This may take a moment. We're extracting and analyzing the data
              from your document.
            </p>
          </div>
        </div>
      )}

      {/* Error State */}
      {uploadStep === "error" && (
        <div className="bg-white rounded-xl p-10 shadow-sm">
          <div className="flex flex-col items-center">
            <div className="rounded-full bg-red-100 p-4 mb-6">
              <AlertTriangle size={32} className="text-red-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Processing Error
            </h3>
            <p className="text-gray-500 text-center mb-6">
              {errorMessage ||
                "We couldn't process your document. Please try again with a different file."}
            </p>
            <Button
              onClick={handleReset}
              className="bg-primary-magenta text-white hover:bg-primary-magenta/90"
            >
              Try Again
            </Button>
          </div>
        </div>
      )}

      {/* Results View */}
      {uploadStep === "results" && extractedData && (
        <>
          {/* Patient Information */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            {" "}
            <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-4">
              <div>
                <h3 className="text-xl font-semibold">Patient Information</h3>
                {extractedData.patient?.name && (
                  <p className="text-gray-500">
                    {extractedData.patient.name}
                    {extractedData.patient.age &&
                      ` • ${extractedData.patient.age}`}
                    {extractedData.patient.gender &&
                      ` • ${extractedData.patient.gender}`}
                  </p>
                )}
              </div>
              <div className="flex flex-wrap gap-3">
                <Button
                  variant="outline"
                  className="border-gray-300 text-gray-700"
                  onClick={handleReset}
                >
                  <UploadCloud size={18} className="mr-2" />
                  <span className="hidden sm:inline">Upload New</span>
                  <span className="sm:hidden">New</span>
                </Button>{" "}
                <Button
                  className="bg-primary-magenta text-white hover:bg-primary-magenta/90"
                  onClick={handleDownloadReport}
                >
                  <Download size={18} className="mr-2" />
                  <span className="hidden sm:inline">Download Report</span>
                  <span className="sm:hidden">Download</span>
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {extractedData.patient?.name && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500">Patient Name</p>
                  <p className="font-semibold">{extractedData.patient.name}</p>
                </div>
              )}

              {extractedData.patient?.age && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500">Age</p>
                  <p className="font-semibold">{extractedData.patient.age}</p>
                </div>
              )}

              {extractedData.patient?.gender && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500">Gender</p>
                  <p className="font-semibold">
                    {extractedData.patient.gender}
                  </p>
                </div>
              )}

              {extractedData.patient?.date && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500">Date</p>
                  <p className="font-semibold">{extractedData.patient.date}</p>
                </div>
              )}

              {extractedData.patient?.referred_by && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500">Referred By</p>
                  <p className="font-semibold">
                    {extractedData.patient.referred_by}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Test Results */}
          {extractedData.reports && extractedData.reports.length > 0 && (
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-xl font-semibold mb-6">Test Results</h3>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Parameter
                      </th>
                      <th
                        scope="col"
                        className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Result
                      </th>
                      <th
                        scope="col"
                        className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell"
                      >
                        Unit
                      </th>
                      <th
                        scope="col"
                        className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell"
                      >
                        Reference Range
                      </th>
                      <th
                        scope="col"
                        className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {extractedData.reports.map((report, idx) => {
                      // Determine status by comparing result with reference range
                      const status = determineStatus(
                        report.result,
                        report.reference || ""
                      );

                      return (
                        <tr
                          key={idx}
                          className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}
                        >
                          {" "}
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {report.title}
                          </td>
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {report.result}{" "}
                            <span className="sm:hidden text-xs text-gray-400">
                              {report.unit}
                            </span>
                          </td>
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden sm:table-cell">
                            {report.unit}
                          </td>
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden md:table-cell">
                            {report.reference}
                          </td>
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                            {report.reference && (
                              <span
                                className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getBadgeColor(status)}`}
                              >
                                {status.charAt(0).toUpperCase() +
                                  status.slice(1)}
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Summary */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="text-xl font-semibold mb-4">Summary</h3>

            <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
              <p className="text-gray-700 mb-3">
                This report has been automatically analyzed. Please consult with
                a healthcare professional for accurate interpretation of your
                results.
              </p>

              <div className="flex justify-end mt-4">
                <Button className="bg-primary-magenta text-white hover:bg-primary-magenta/90">
                  Schedule a Consultation
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
