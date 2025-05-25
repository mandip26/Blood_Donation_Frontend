import { createLazyFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  UploadCloud,
  FileText,
  AlertTriangle,
  Trash2,
  Download,
  BarChart3,
  LineChart,
  PieChart,
  TrendingUp,
  Clock,
  Calendar,
  Info,
} from "lucide-react";
import useAuth from "@/hooks/useAuth";

export const Route = createLazyFileRoute(
  "/dashboard/_dashboardLayout/visualization"
)({
  component: VisualizationComponent,
});

interface BloodParameter {
  name: string;
  value: number;
  unit: string;
  normalRange: string;
  status: "normal" | "low" | "high";
  trend?: "up" | "down" | "stable";
}

interface ReportHistory {
  id: string;
  date: string;
  source: string;
  parameters: BloodParameter[];
}

// Backend response interfaces
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
  unit: string | null;
  reference: string;
}

interface ExtractedData {
  patient: PatientData;
  reports: ReportData[];
}

function VisualizationComponent() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadStep, setUploadStep] = useState<
    "upload" | "processing" | "results" | "error"
  >("upload");
  const [errorMessage, setErrorMessage] = useState("");
  const [activeTab, setActiveTab] = useState<
    "overview" | "parameters" | "history" | "trends"
  >("overview");
  const { user } = useAuth();
  // State for extracted data from backend
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(
    null
  );
  const [bloodParameters, setBloodParameters] = useState<BloodParameter[]>([]);

  // Function to determine the status of a result based on reference range
  const determineStatus = (
    value: string,
    reference: string
  ): "normal" | "low" | "high" => {
    // Remove commas from value for numerical parsing
    const numericValue = parseFloat(value.replace(/,/g, ""));

    if (isNaN(numericValue)) return "normal";

    // Handle ranges with hyphens (e.g., "13.5-17.5")
    if (reference.includes("-")) {
      const rangePart = reference.split("\n")[0]; // Take first line if multi-line
      const rangeMatch = rangePart.match(/(\d+\.?\d*)\s*-\s*(\d+\.?\d*)/);

      if (rangeMatch) {
        const min = parseFloat(rangeMatch[1]);
        const max = parseFloat(rangeMatch[2]);

        if (numericValue < min) return "low";
        if (numericValue > max) return "high";
        return "normal";
      }
    }

    // Handle single upper limit (e.g., "< 41")
    if (reference.includes("<")) {
      const upperMatch = reference.match(/<\s*(\d+\.?\d*)/);
      if (upperMatch) {
        const max = parseFloat(upperMatch[1]);
        if (numericValue >= max) return "high";
        return "normal";
      }
    }

    return "normal";
  };

  // Convert backend data to BloodParameter format
  const convertToBloodParameters = (
    reports: ReportData[]
  ): BloodParameter[] => {
    return reports.map((report) => ({
      name: report.title,
      value: parseFloat(report.result.replace(/,/g, "")) || 0,
      unit: report.unit || "",
      normalRange: report.reference,
      status: determineStatus(report.result, report.reference),
      trend: "stable" as const,
    }));
  };

  // Create report history from current data
  const reportHistory: ReportHistory[] = extractedData
    ? [
        {
          id: "1",
          date: extractedData.patient.date,
          source: `Referred by ${extractedData.patient.referred_by}`,
          parameters: bloodParameters,
        },
      ]
    : [];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (file.type === "application/pdf") {
        setSelectedFile(file);
        setErrorMessage("");
      } else {
        setErrorMessage("Please upload a valid PDF file.");
        setSelectedFile(null);
      }
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.type === "application/pdf") {
        setSelectedFile(file);
        setErrorMessage("");
      } else {
        setErrorMessage("Please upload a valid PDF file.");
        setSelectedFile(null);
      }
    }
  };
  const handleVisualize = async () => {
    if (!selectedFile) {
      setErrorMessage("Please select a file to visualize.");
      return;
    }

    setUploadStep("processing");

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const response = await fetch(
        "http://localhost:5000/api/v1/extract?user_id=" + user?._id,
        {
          method: "POST",
          body: formData,
          redirect: "follow",
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.text();

      try {
        const parsedData: ExtractedData = JSON.parse(result);
        setExtractedData(parsedData);

        // Convert reports to BloodParameter format
        const convertedParameters = convertToBloodParameters(
          parsedData.reports
        );
        setBloodParameters(convertedParameters);

        setUploadStep("results");
      } catch (parseError) {
        console.error("Error parsing JSON:", parseError);
        setErrorMessage("Failed to parse server response. Please try again.");
        setUploadStep("error");
      }
    } catch (error: any) {
      console.error("Upload error:", error);
      setErrorMessage(
        error.message || "Failed to process file. Please try again."
      );
      setUploadStep("error");
    }
  };
  const handleReset = () => {
    setSelectedFile(null);
    setUploadStep("upload");
    setErrorMessage("");
    setExtractedData(null);
    setBloodParameters([]);
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

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

  const getTrendIcon = (trend?: "up" | "down" | "stable") => {
    switch (trend) {
      case "up":
        return <TrendingUp size={14} className="text-red-500" />;
      case "down":
        return (
          <TrendingUp
            size={14}
            className="text-orange-500 transform rotate-180"
          />
        );
      case "stable":
        return (
          <TrendingUp
            size={14}
            className="text-green-500 transform rotate-90"
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto py-6 px-4">
      <h1 className="text-2xl font-bold mb-6">Visualize Blood Reports</h1>
      {uploadStep === "upload" && (
        <div className="bg-gradient-to-b from-white to-pink-50/80 rounded-xl shadow-md p-8 border border-gray-100 mb-8">
          <div className="flex flex-col items-center justify-center">
            <h2 className="text-2xl font-semibold text-primary-magenta mb-8">
              Upload Your Blood Test Report
            </h2>

            <div
              className={`w-full max-w-md border-2 border-dashed ${selectedFile ? "border-primary-magenta bg-primary-magenta/5" : "border-gray-300 hover:border-gray-400"} rounded-lg p-8 flex flex-col items-center justify-center mb-6 transition-colors cursor-pointer`}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => document.getElementById("pdf-upload")?.click()}
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
                    Upload your PDF for visualization
                  </p>

                  <input
                    type="file"
                    className="hidden"
                    id="pdf-upload"
                    accept=".pdf"
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
              className="bg-primary-magenta text-white hover:bg-primary-magenta/90 px-12 py-6 text-lg rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Visualize Report
            </Button>

            <p className="text-gray-500 text-sm mt-4">
              Supported formats: PDF only. Maximum file size: 5MB.
            </p>
          </div>
        </div>
      )}
      {uploadStep === "processing" && (
        <div className="bg-white rounded-xl shadow-md p-12 border border-gray-100 mb-8">
          <div className="flex flex-col items-center justify-center">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary-magenta border-t-transparent mb-6"></div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              Processing your report...
            </h2>
            <p className="text-gray-500 text-center">
              This may take a moment. We're extracting and analyzing the data
              from your document.
            </p>
          </div>
        </div>
      )}{" "}
      {uploadStep === "results" && extractedData && (
        <>
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-semibold">Report Results</h2>
                <p className="text-gray-500">
                  Report for {extractedData.patient.name} •{" "}
                  {extractedData.patient.date}
                </p>
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="border-gray-300 text-gray-700"
                  onClick={handleReset}
                >
                  <UploadCloud size={18} className="mr-2" />
                  Upload New
                </Button>
                <Button className="bg-primary-magenta text-white hover:bg-primary-magenta/90">
                  <Download size={18} className="mr-2" />
                  Download Report
                </Button>
              </div>
            </div>
            {/* Patient Information Section */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h3 className="text-lg font-medium mb-3">Patient Information</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Name</p>
                  <p className="font-semibold">{extractedData.patient.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Age</p>
                  <p className="font-semibold">{extractedData.patient.age}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Gender</p>
                  <p className="font-semibold">
                    {extractedData.patient.gender === "M" ? "Male" : "Female"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Referred By</p>
                  <p className="font-semibold">
                    {extractedData.patient.referred_by}
                  </p>
                </div>
              </div>
            </div>
            {/* Report Navigation Tabs */}
            <div className="border-b border-gray-200 mb-6">
              <nav className="flex space-x-8">
                <button
                  onClick={() => setActiveTab("overview")}
                  className={`pb-4 px-1 ${
                    activeTab === "overview"
                      ? "border-b-2 border-primary-magenta text-primary-magenta font-medium"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  Overview
                </button>
                <button
                  onClick={() => setActiveTab("parameters")}
                  className={`pb-4 px-1 ${
                    activeTab === "parameters"
                      ? "border-b-2 border-primary-magenta text-primary-magenta font-medium"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  Blood Parameters
                </button>
                <button
                  onClick={() => setActiveTab("trends")}
                  className={`pb-4 px-1 ${
                    activeTab === "trends"
                      ? "border-b-2 border-primary-magenta text-primary-magenta font-medium"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  Trends
                </button>
                <button
                  onClick={() => setActiveTab("history")}
                  className={`pb-4 px-1 ${
                    activeTab === "history"
                      ? "border-b-2 border-primary-magenta text-primary-magenta font-medium"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  Report History
                </button>
              </nav>
            </div>{" "}
            {/* Overview Tab */}
            {activeTab === "overview" && (
              <div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border border-green-200 flex flex-col items-center text-center">
                    <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-4">
                      <BarChart3 size={24} className="text-green-500" />
                    </div>
                    <h3 className="text-lg font-medium text-green-800">
                      Normal Parameters
                    </h3>
                    <p className="text-3xl font-bold text-green-900 mt-2">
                      {
                        bloodParameters.filter((p) => p.status === "normal")
                          .length
                      }
                    </p>
                    <p className="text-sm text-green-600 mt-1">
                      {Math.round(
                        (bloodParameters.filter((p) => p.status === "normal")
                          .length /
                          bloodParameters.length) *
                          100
                      ) || 0}
                      % of parameters
                    </p>
                  </div>

                  <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-xl border border-orange-200 flex flex-col items-center text-center">
                    <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center mb-4">
                      <AlertTriangle size={24} className="text-orange-500" />
                    </div>
                    <h3 className="text-lg font-medium text-orange-800">
                      Low Parameters
                    </h3>
                    <p className="text-3xl font-bold text-orange-900 mt-2">
                      {bloodParameters.filter((p) => p.status === "low").length}
                    </p>
                    <p className="text-sm text-orange-600 mt-1">
                      {Math.round(
                        (bloodParameters.filter((p) => p.status === "low")
                          .length /
                          bloodParameters.length) *
                          100
                      ) || 0}
                      % of parameters
                    </p>
                  </div>

                  <div className="bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-xl border border-red-200 flex flex-col items-center text-center">
                    <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
                      <AlertTriangle size={24} className="text-red-500" />
                    </div>
                    <h3 className="text-lg font-medium text-red-800">
                      High Parameters
                    </h3>
                    <p className="text-3xl font-bold text-red-900 mt-2">
                      {
                        bloodParameters.filter((p) => p.status === "high")
                          .length
                      }
                    </p>
                    <p className="text-sm text-red-600 mt-1">
                      {Math.round(
                        (bloodParameters.filter((p) => p.status === "high")
                          .length /
                          bloodParameters.length) *
                          100
                      ) || 0}
                      % of parameters
                    </p>
                  </div>
                </div>{" "}
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 mb-8">
                  <h3 className="text-lg font-medium text-gray-800 mb-4">
                    Summary
                  </h3>
                  <p className="text-gray-700 mb-4">
                    Your blood test results show that{" "}
                    {
                      bloodParameters.filter((p) => p.status === "normal")
                        .length
                    }{" "}
                    out of {bloodParameters.length} parameters are within normal
                    range.{" "}
                    {bloodParameters.filter(
                      (p) => p.status === "high" || p.status === "low"
                    ).length > 0
                      ? "However, there are a few areas that require attention:"
                      : "All parameters look good!"}
                  </p>
                  {bloodParameters.filter(
                    (p) => p.status === "high" || p.status === "low"
                  ).length > 0 && (
                    <ul className="space-y-3">
                      {bloodParameters
                        .filter((p) => p.status === "high")
                        .map((param, idx) => (
                          <li key={idx} className="flex items-start">
                            <AlertTriangle
                              size={16}
                              className="text-red-500 mt-1 mr-2 flex-shrink-0"
                            />
                            <span className="text-gray-700">
                              <strong className="font-medium">
                                {param.name} is high
                              </strong>{" "}
                              ({param.value} {param.unit}) - Above normal range
                              ({param.normalRange}).
                            </span>
                          </li>
                        ))}
                      {bloodParameters
                        .filter((p) => p.status === "low")
                        .map((param, idx) => (
                          <li key={idx} className="flex items-start">
                            <AlertTriangle
                              size={16}
                              className="text-orange-500 mt-1 mr-2 flex-shrink-0"
                            />
                            <span className="text-gray-700">
                              <strong className="font-medium">
                                {param.name} is low
                              </strong>{" "}
                              ({param.value} {param.unit}) - Below normal range
                              ({param.normalRange}).
                            </span>
                          </li>
                        ))}
                    </ul>
                  )}
                  {bloodParameters.filter(
                    (p) => p.status === "high" || p.status === "low"
                  ).length > 0 && (
                    <div className="mt-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                      <div className="flex items-center">
                        <Info size={18} className="text-yellow-700 mr-2" />
                        <p className="text-yellow-700 font-medium">
                          Recommendation
                        </p>
                      </div>
                      <p className="text-yellow-700 text-sm mt-1">
                        Please consult with your healthcare provider to discuss
                        these results, particularly any parameters outside the
                        normal range.
                      </p>
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {" "}
                  <div className="bg-white border border-gray-200 rounded-xl p-6">
                    <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
                      <PieChart
                        size={20}
                        className="text-primary-magenta mr-2"
                      />{" "}
                      Parameter Status
                    </h3>
                    <div className="h-60 flex items-center justify-center">
                      <div className="relative w-40 h-40">
                        {" "}
                        {(() => {
                          const normalCount = bloodParameters.filter(
                            (p) => p.status === "normal"
                          ).length;
                          const lowCount = bloodParameters.filter(
                            (p) => p.status === "low"
                          ).length;
                          const highCount = bloodParameters.filter(
                            (p) => p.status === "high"
                          ).length;
                          const total = bloodParameters.length;

                          if (total === 0) {
                            return (
                              <div className="absolute inset-0 flex items-center justify-center">
                                <p className="text-gray-500">No data</p>
                              </div>
                            );
                          }

                          const normalPercentage = (normalCount / total) * 100;
                          const lowPercentage = (lowCount / total) * 100;

                          const normalEnd = normalPercentage;
                          const lowEnd = normalEnd + lowPercentage;

                          return (
                            <>
                              {normalCount > 0 && (
                                <div
                                  className="absolute inset-0 rounded-full border-8 border-green-500"
                                  style={{
                                    clipPath: `polygon(0 0, ${normalEnd}% 0, ${normalEnd}% 100%, 0 100%)`,
                                  }}
                                ></div>
                              )}
                              {lowCount > 0 && (
                                <div
                                  className="absolute inset-0 rounded-full border-8 border-orange-500"
                                  style={{
                                    clipPath: `polygon(${normalEnd}% 0, ${lowEnd}% 0, ${lowEnd}% 100%, ${normalEnd}% 100%)`,
                                  }}
                                ></div>
                              )}
                              {highCount > 0 && (
                                <div
                                  className="absolute inset-0 rounded-full border-8 border-red-500"
                                  style={{
                                    clipPath: `polygon(${lowEnd}% 0, 100% 0, 100% 100%, ${lowEnd}% 100%)`,
                                  }}
                                ></div>
                              )}
                              <div className="absolute inset-0 flex items-center justify-center">
                                <p className="text-xl font-bold">{total}</p>
                              </div>
                            </>
                          );
                        })()}
                      </div>
                    </div>
                    <div className="flex justify-around mt-4">
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                        <span className="text-sm">
                          Normal (
                          {
                            bloodParameters.filter((p) => p.status === "normal")
                              .length
                          }
                          )
                        </span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-orange-500 rounded-full mr-2"></div>
                        <span className="text-sm">
                          Low (
                          {
                            bloodParameters.filter((p) => p.status === "low")
                              .length
                          }
                          )
                        </span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                        <span className="text-sm">
                          High (
                          {
                            bloodParameters.filter((p) => p.status === "high")
                              .length
                          }
                          )
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white border border-gray-200 rounded-xl p-6">
                    <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
                      <Calendar
                        size={20}
                        className="text-primary-magenta mr-2"
                      />{" "}
                      Recent Reports
                    </h3>
                    <div className="space-y-4">
                      {reportHistory.map((report) => (
                        <div
                          key={report.id}
                          className="flex items-center justify-between"
                        >
                          <div className="flex items-center">
                            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                              <FileText size={18} className="text-gray-600" />
                            </div>
                            <div className="ml-3">
                              <p className="font-medium">{report.source}</p>
                              <p className="text-xs text-gray-500">
                                {formatDate(report.date)}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
            {/* Blood Parameters Tab */}
            {activeTab === "parameters" && (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Parameter
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Value
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Normal Range
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Status
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Trend
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {bloodParameters.map((param, idx) => (
                      <tr
                        key={idx}
                        className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {param.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {param.value} {param.unit}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {param.normalRange} {param.unit}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getBadgeColor(param.status)}`}
                          >
                            {param.status.charAt(0).toUpperCase() +
                              param.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {getTrendIcon(param.trend)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {/* Trends Tab */}
            {activeTab === "trends" && (
              <div>
                <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
                  <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
                    <LineChart
                      size={20}
                      className="text-primary-magenta mr-2"
                    />{" "}
                    Parameter Trends Over Time
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* These would be real charts in a production app */}
                    <div className="border border-gray-200 rounded-lg p-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">
                        Hemoglobin Trend
                      </h4>
                      <div className="h-60 flex items-center justify-center">
                        <p className="text-gray-500">Chart would appear here</p>
                      </div>
                    </div>

                    <div className="border border-gray-200 rounded-lg p-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">
                        White Blood Cell Count Trend
                      </h4>
                      <div className="h-60 flex items-center justify-center">
                        <p className="text-gray-500">Chart would appear here</p>
                      </div>
                    </div>

                    <div className="border border-gray-200 rounded-lg p-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">
                        Platelets Trend
                      </h4>
                      <div className="h-60 flex items-center justify-center">
                        <p className="text-gray-500">Chart would appear here</p>
                      </div>
                    </div>

                    <div className="border border-gray-200 rounded-lg p-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">
                        Neutrophils Trend
                      </h4>
                      <div className="h-60 flex items-center justify-center">
                        <p className="text-gray-500">Chart would appear here</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <h3 className="text-lg font-medium text-gray-800 mb-4">
                    Analysis & Insights
                  </h3>

                  <div className="space-y-4">
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <h4 className="font-medium text-blue-800 flex items-center">
                        <TrendingUp size={18} className="mr-2" /> Trend Analysis
                      </h4>
                      <p className="text-blue-700 text-sm mt-1">
                        Your White Blood Cell count has been steadily increasing
                        over the past 3 reports, which might indicate a
                        developing infection or inflammatory condition.
                      </p>
                    </div>

                    <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                      <h4 className="font-medium text-green-800 flex items-center">
                        <Clock size={18} className="mr-2" /> Long-term Patterns
                      </h4>
                      <p className="text-green-700 text-sm mt-1">
                        Your Hemoglobin levels have remained stable within the
                        normal range across all your reports, indicating good
                        red blood cell health and oxygen-carrying capacity.
                      </p>
                    </div>

                    <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                      <h4 className="font-medium text-yellow-800 flex items-center">
                        <Info size={18} className="mr-2" /> Recommendations
                      </h4>
                      <p className="text-yellow-700 text-sm mt-1">
                        Based on your trends, we recommend monitoring your White
                        Blood Cell count and Platelets more frequently. Consider
                        scheduling a follow-up test in 1 month rather than the
                        usual 3 months.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {/* Report History Tab */}
            {activeTab === "history" && (
              <div>
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-gray-800 mb-4">
                    Previous Reports
                  </h3>

                  <div className="space-y-4">
                    {reportHistory.map((report) => (
                      <div
                        key={report.id}
                        className="bg-white border border-gray-200 rounded-xl p-4 flex items-center justify-between"
                      >
                        <div className="flex items-center">
                          <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                            <FileText size={24} className="text-gray-600" />
                          </div>
                          <div className="ml-4">
                            <p className="font-medium text-gray-900">
                              {report.source}
                            </p>
                            <p className="text-sm text-gray-500">
                              {formatDate(report.date)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                  <h3 className="text-lg font-medium text-blue-800 mb-2">
                    Report History Insights
                  </h3>
                  <p className="text-blue-700 mb-4">
                    Comparing your current report with previous ones shows
                    several notable trends:
                  </p>
                  <ul className="space-y-3 text-blue-700">
                    <li className="flex items-start">
                      <div className="mt-1 mr-2">•</div>
                      <span>
                        Your White Blood Cell count has increased by 15% since
                        your last report
                      </span>
                    </li>
                    <li className="flex items-start">
                      <div className="mt-1 mr-2">•</div>
                      <span>
                        Your Platelet count has decreased by 12% over the past 8
                        months
                      </span>
                    </li>
                    <li className="flex items-start">
                      <div className="mt-1 mr-2">•</div>
                      <span>
                        Your Hemoglobin levels have remained stable within 5%
                        variation
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </>
      )}{" "}
    </div>
  );
}
