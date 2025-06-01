import { createLazyFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Search,
  Filter,
  MapPin,
  Clock,
  ChevronDown,
  X,
  ArrowUpDown,
  AlertCircle,
  Loader2,
  RefreshCw,
  Droplets,
  Heart,
  Phone,
  Hospital,
} from "lucide-react";
import { bloodRequestService } from "@/services/apiService";
import { useAuth } from "@/hooks/useAuth";
import { useResponsive } from "@/hooks/useResponsive";

export const Route = createLazyFileRoute(
  "/dashboard/_dashboardLayout/recipient"
)({
  component: RecipientComponent,
});

interface BloodRequest {
  id: string;
  name: string;
  bloodType: string;
  hospital: string;
  location: string;
  distance?: string;
  urgency: "Low" | "Medium" | "High";  // Updated to match backend enum
  postedTime: string;
  units: number;
  contactNumber: string;
  reason: string;
}

function RecipientComponent() {
  // Auth context
  const { user } = useAuth();

  // Responsive design
  const { isMobile } = useResponsive();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBloodType, setSelectedBloodType] = useState<string | null>(null);
  const [selectedUrgency, setSelectedUrgency] = useState<string | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<BloodRequest | null>(null);
  const [isNewRequestModalOpen, setIsNewRequestModalOpen] = useState(false);
  const [sorting, setSorting] = useState<{
    key: keyof BloodRequest | null;
    direction: "asc" | "desc";
  }>({
    key: null,
    direction: "desc",
  });

  // State for API data handling
  const [bloodRequests, setBloodRequests] = useState<BloodRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const bloodTypes = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
  const urgencyLevels = ["High", "Medium", "Low"];

  // New request form state
  const [newRequestForm, setNewRequestForm] = useState({
    name: "",
    bloodType: "",
    hospital: "",
    location: "",
    urgency: "Medium" as "Low" | "Medium" | "High",
    units: 1,
    contactNumber: "",
    reason: "",
  });

  // Form validation state
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Fetch blood requests from API
  useEffect(() => {
    fetchBloodRequests();
  }, [selectedBloodType, selectedUrgency]);

  // Fetch blood requests function (for refreshing data)
  const fetchBloodRequests = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Prepare filters
      const filters: {
        bloodType?: string;
        urgency?: string;
      } = {};

      if (selectedBloodType) {
        filters.bloodType = selectedBloodType;
      }

      if (selectedUrgency) {
        filters.urgency = selectedUrgency;
      }

      // Call the API endpoint to get blood requests
      const response = await fetch('http://localhost:8001/api/v1/user/blood-requests');
      const data = await response.json();
      
      if (data.success) {
        const formattedRequests = data.bloodRequests.map(request => ({
          id: request._id,
          name: request.patientName,
          bloodType: request.bloodType,
          hospital: request.hospital,
          location: request.location,
          urgency: request.urgency,
          postedTime: getTimeAgo(new Date(request.createdAt)),
          units: request.unitsRequired,
          contactNumber: request.contactNumber,
          reason: request.reason
        }));
        
        // Apply filters if any
        let filteredRequests = formattedRequests;
        if (filters.bloodType) {
          filteredRequests = filteredRequests.filter(req => req.bloodType === filters.bloodType);
        }
        if (filters.urgency) {
          filteredRequests = filteredRequests.filter(req => req.urgency === filters.urgency);
        }
        
        setBloodRequests(filteredRequests);
      } else {
        setError("Failed to load blood requests");
        setBloodRequests([]);
      }
    } catch (err) {
      console.error("Error fetching blood requests:", err);
      setError("Failed to load blood requests. Please try again.");
      setBloodRequests([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to format time ago
  const getTimeAgo = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.round(diffMs / 1000);
    const diffMin = Math.round(diffSec / 60);
    const diffHour = Math.round(diffMin / 60);
    const diffDay = Math.round(diffHour / 24);

    if (diffSec < 60) return `${diffSec} seconds ago`;
    if (diffMin < 60) return `${diffMin} minutes ago`;
    if (diffHour < 24) return `${diffHour} hours ago`;
    if (diffDay === 1) return "Yesterday";
    if (diffDay < 30) return `${diffDay} days ago`;

    return date.toLocaleDateString();
  };

  // Search functionality
  const filteredRequests = bloodRequests.filter((request) => {
    // No search term, show all requests
    if (!searchTerm) return true;

    // Search in relevant fields
    const searchLower = searchTerm.toLowerCase();
    return (
      request.name.toLowerCase().includes(searchLower) ||
      request.hospital.toLowerCase().includes(searchLower) ||
      request.location.toLowerCase().includes(searchLower) ||
      request.bloodType.toLowerCase().includes(searchLower)
    );
  });

  // Sort functionality
  const sortedRequests = [...filteredRequests].sort((a, b) => {
    // If no sorting selected or sorting by a non-existent key
    if (!sorting.key || !(sorting.key in a)) return 0;

    // Handle different types of values
    const aValue = a[sorting.key];
    const bValue = b[sorting.key];

    // Sort based on value type
    if (typeof aValue === "string" && typeof bValue === "string") {
      return sorting.direction === "asc"
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }

    // For numeric values
    if (typeof aValue === "number" && typeof bValue === "number") {
      return sorting.direction === "asc" ? aValue - bValue : bValue - aValue;
    }

    return 0;
  });

  // Handle sorting change
  const handleSort = (key: keyof BloodRequest) => {
    setSorting((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  // Form submission for new blood request
  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();

    // Form validation
    const errors: Record<string, string> = {};
    if (!newRequestForm.name.trim()) errors.name = "Name is required";
    if (!newRequestForm.bloodType) errors.bloodType = "Blood type is required";
    if (!newRequestForm.hospital.trim())
      errors.hospital = "Hospital name is required";
    if (!newRequestForm.location.trim())
      errors.location = "Location is required";
    if (!newRequestForm.contactNumber.trim())
      errors.contactNumber = "Contact number is required";
    if (!newRequestForm.reason.trim()) errors.reason = "Reason is required";

    // Validate phone number format
    if (
      newRequestForm.contactNumber &&
      !/^\+?[0-9]{10,15}$/.test(newRequestForm.contactNumber.replace(/\s/g, ""))
    ) {
      errors.contactNumber = "Please enter a valid phone number";
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      setIsSubmitting(true);
      setSubmitError(null);
      if (!user || (!user._id && !user.id)) {
        throw new Error("User not authenticated");
      }

      // Submit request to API
      await bloodRequestService.createRequest({
        patientName: newRequestForm.name,
        bloodType: newRequestForm.bloodType,
        hospital: newRequestForm.hospital,
        location: newRequestForm.location,
        urgency: newRequestForm.urgency, // Keep the original case
        unitsRequired: newRequestForm.units,
        contactNumber: newRequestForm.contactNumber,
        reason: newRequestForm.reason,
        createdBy: user._id || user.id, // Use either _id or id
      });

      // Reset form and close modal on success
      setNewRequestForm({
        name: "",
        bloodType: "",
        hospital: "",
        location: "",
        urgency: "Medium",
        units: 1,
        contactNumber: "",
        reason: "",
      });

      setFormErrors({});
      setIsNewRequestModalOpen(false);

      // Refresh blood requests
      fetchBloodRequests();
    } catch (error) {
      console.error("Error creating blood request:", error);
      setSubmitError("Failed to create blood request. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Respond to a blood request
  const handleRespondToRequest = async (requestId: string) => {
    if (!user) {
      // Redirect to login if not authenticated
      window.location.href = "/login?redirect=/dashboard/recipient";
      return;
    }
    try {
      // Prepare response data
      const responseData = {
        donorId: user.id || "",
        responseTime: new Date().toISOString(),
        contactNumber: user.phone || "",
        message: `I'm responding to your blood request. Please contact me for further details.`,
      };

      // Send response to API
      await bloodRequestService.respondToRequest(requestId, responseData);

      // Show confirmation and update UI
      alert("Your response has been sent successfully!");

      // Optionally mark the request as responded in the UI
      setBloodRequests((prev) =>
        prev.map((request) =>
          request.id === requestId ? { ...request, responded: true } : request
        )
      );
    } catch (error) {
      console.error("Error responding to request:", error);
      alert("Failed to respond to the request. Please try again.");
    }
  };

  // Render loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={() => fetchBloodRequests()}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Main component render
  return (
    <div className="p-4 md:p-6 bg-gray-50">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
            Blood Requests
          </h1>
          <p className="text-gray-600 mt-1">
            Find and respond to blood donation requests in your area
          </p>
        </div>
        <Button
          onClick={() => setIsNewRequestModalOpen(true)}
          className="bg-primary-magenta hover:bg-primary-magenta/90 shadow-md transition-all duration-200 flex items-center gap-2 px-5"
        >
          <Heart className="h-4 w-4" />
          Create Request
        </Button>
      </div>
      {/* Search and filter bar */}
      <div className={`flex ${isMobile ? "flex-col" : "flex-row"} gap-4 mb-6`}>
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />{" "}
          <input
            type="text"
            className="w-full rounded-lg border border-gray-200 pl-10 py-2.5 focus:ring-2 focus:ring-primary-magenta/30 focus:border-primary-magenta transition-all duration-200 shadow-sm"
            placeholder="Search by name, hospital, location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="relative">
          {" "}
          <Button
            variant="outline"
            className="border border-gray-200 flex items-center shadow-sm hover:bg-gray-50 transition-all duration-200"
            onClick={() => setIsFilterOpen(!isFilterOpen)}
          >
            <Filter className="h-4 w-4 mr-2 text-primary-magenta" />
            Filters
            <ChevronDown
              className={`h-4 w-4 ml-2 transition-transform duration-200 ${isFilterOpen ? "rotate-180" : ""}`}
            />
          </Button>
          {isFilterOpen && (
            <div className="absolute right-0 top-full mt-2 bg-white rounded-lg shadow-lg p-4 border border-gray-100 z-10 w-72 animate-in fade-in slide-in-from-top-5 duration-200">
              <div className="flex justify-between items-center mb-4">
                <span className="font-medium text-gray-800">Filters</span>
                <button
                  onClick={() => {
                    setSelectedBloodType(null);
                    setSelectedUrgency(null);
                  }}
                  className="text-xs text-primary-magenta hover:underline flex items-center"
                >
                  <X className="h-3 w-3 mr-1" /> Clear all
                </button>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-1.5">
                  Blood Type
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {bloodTypes.map((type) => (
                    <button
                      key={type}
                      onClick={() =>
                        setSelectedBloodType(
                          type === selectedBloodType ? null : type
                        )
                      }
                      className={`rounded-md py-1 px-2 text-sm ${
                        selectedBloodType === type
                          ? "bg-primary-magenta text-white"
                          : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">
                  Urgency
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {urgencyLevels.map((level) => (
                    <button
                      key={level}
                      onClick={() =>
                        setSelectedUrgency(
                          level === selectedUrgency ? null : level
                        )
                      }
                      className={`rounded-md py-1 px-2 text-sm ${
                        selectedUrgency === level
                          ? "bg-primary-magenta text-white"
                          : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      {/* Active filters */}
      {(selectedBloodType || selectedUrgency) && (
        <div className="flex flex-wrap gap-2 mb-5">
          {selectedBloodType && (
            <div className="bg-primary-magenta/10 border border-primary-magenta/20 rounded-full py-1.5 px-3.5 text-sm flex items-center shadow-sm animate-in fade-in slide-in-from-left-5 duration-300">
              <Droplets className="h-3.5 w-3.5 text-primary-magenta mr-1.5" />
              Blood: {selectedBloodType}
              <button
                onClick={() => setSelectedBloodType(null)}
                className="ml-2 text-gray-500 hover:text-gray-700 hover:bg-primary-magenta/10 rounded-full p-0.5 transition-colors duration-200"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          {selectedUrgency && (
            <div className="bg-primary-magenta/10 border border-primary-magenta/20 rounded-full py-1.5 px-3.5 text-sm flex items-center shadow-sm animate-in fade-in slide-in-from-left-5 duration-300">
              <AlertCircle className="h-3.5 w-3.5 text-primary-magenta mr-1.5" />
              Urgency: {selectedUrgency}
              <button
                onClick={() => setSelectedUrgency(null)}
                className="ml-2 text-gray-500 hover:text-gray-700 hover:bg-primary-magenta/10 rounded-full p-0.5 transition-colors duration-200"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>
      )}
      {/* Blood requests list */}
      {sortedRequests.length > 0 ? (
        <div className="space-y-4">
          {sortedRequests.map((request) => (
            <div
              key={request.id}
              className="bg-white rounded-xl shadow-md border border-gray-100 p-4 hover:shadow-lg transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold">{request.name}</h3>
                  <p className="text-gray-600">{request.hospital}</p>
                  <p className="text-gray-500 text-sm">{request.location}</p>
                </div>
                <div className="text-right">
                  <span className="inline-block px-3 py-1 rounded-full text-sm font-medium
                    ${request.urgency === 'High' ? 'bg-red-100 text-red-800' :
                    request.urgency === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'}"
                  >
                    {request.urgency}
                  </span>
                  <p className="text-gray-500 text-sm mt-1">{request.postedTime}</p>
                </div>
              </div>
              <div className="mt-4 flex justify-between items-center">
                <div>
                  <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                    {request.bloodType}
                  </span>
                  <span className="ml-2 text-gray-600">{request.units} units needed</span>
                </div>
                <button
                  onClick={() => setSelectedRequest(request)}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-12 text-center">
          <p className="text-gray-500">No blood requests found</p>
        </div>
      )}
      
      {/* Selected request modal */}{" "}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-xl border border-gray-100">
            <div className="p-5 border-b bg-gradient-to-r from-primary-magenta/5 to-white">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-gray-800">
                  Blood Request Details
                </h3>
                <button
                  onClick={() => setSelectedRequest(null)}
                  className="text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 p-1 transition-colors duration-200"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="flex items-center mb-5">
                <div
                  className={`h-16 w-16 rounded-full flex items-center justify-center text-white font-bold text-xl mr-4 shadow-md
                  ${
                    selectedRequest.bloodType.includes("A")
                      ? "bg-gradient-to-br from-green-400 to-green-600"
                      : selectedRequest.bloodType.includes("B")
                        ? "bg-gradient-to-br from-blue-400 to-blue-600"
                        : selectedRequest.bloodType.includes("O")
                          ? "bg-gradient-to-br from-red-400 to-red-600"
                          : "bg-gradient-to-br from-purple-400 to-purple-600"
                  }`}
                >
                  {selectedRequest.bloodType}
                </div>
                <div>
                  <h3 className="font-semibold text-xl text-gray-800">
                    {selectedRequest.name}
                  </h3>
                  <div className="flex items-center text-gray-500 mt-1">
                    <Clock className="h-3.5 w-3.5 mr-1.5" />
                    <p>{selectedRequest.postedTime}</p>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-5 rounded-lg bg-gray-50 mb-6 border border-gray-100">
                <div className="flex items-start">
                  <Hospital className="h-5 w-5 text-primary-magenta mr-2.5 mt-0.5" />
                  <div>
                    <span className="text-xs text-gray-500 block">
                      Hospital
                    </span>
                    <span className="font-medium text-gray-800">
                      {selectedRequest.hospital}
                    </span>
                  </div>
                </div>
                <div className="flex items-start">
                  <MapPin className="h-5 w-5 text-primary-magenta mr-2.5 mt-0.5" />
                  <div>
                    <span className="text-xs text-gray-500 block">
                      Location
                    </span>
                    <span className="font-medium text-gray-800">
                      {selectedRequest.location}
                    </span>
                  </div>
                </div>
                <div className="flex items-start">
                  <Droplets className="h-5 w-5 text-primary-magenta mr-2.5 mt-0.5" />
                  <div>
                    <span className="text-xs text-gray-500 block">
                      Units Needed
                    </span>
                    <span className="font-medium text-gray-800">
                      {selectedRequest.units}
                    </span>
                  </div>
                </div>
                <div className="flex items-start">
                  <AlertCircle className="h-5 w-5 text-primary-magenta mr-2.5 mt-0.5" />
                  <div>
                    <span className="text-xs text-gray-500 block">Urgency</span>
                    <span className="flex-1">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                          selectedRequest.urgency === "high"
                            ? "bg-red-100 text-red-700 border border-red-200"
                            : selectedRequest.urgency === "medium"
                              ? "bg-yellow-100 text-yellow-700 border border-yellow-200"
                              : "bg-green-100 text-green-700 border border-green-200"
                        }`}
                      >
                        {selectedRequest.urgency.charAt(0).toUpperCase() +
                          selectedRequest.urgency.slice(1)}
                      </span>
                    </span>
                  </div>
                </div>
                <div className="flex items-start">
                  <Phone className="h-5 w-5 text-primary-magenta mr-2.5 mt-0.5" />
                  <div>
                    <span className="text-xs text-gray-500 block">Contact</span>
                    <span className="font-medium text-gray-800">
                      {selectedRequest.contactNumber}
                    </span>
                  </div>
                </div>
              </div>
              <div className="mb-6">
                <span className="font-medium block mb-2 text-gray-800">
                  Reason for Request:
                </span>
                <p className="text-gray-700 bg-gray-50 p-4 rounded-lg border border-gray-100 leading-relaxed">
                  {selectedRequest.reason}
                </p>
              </div>
              <div className="flex gap-4 mt-4">
                <Button
                  variant="outline"
                  className="flex-1 border-gray-200 hover:bg-gray-50 transition-all duration-200"
                  onClick={() => setSelectedRequest(null)}
                >
                  Close
                </Button>
                <Button
                  className="flex-1 bg-primary-magenta hover:bg-primary-magenta/90 shadow-md transition-all duration-200"
                  onClick={() => handleRespondToRequest(selectedRequest.id)}
                >
                  <Heart className="mr-2 h-4 w-4" />
                  Respond to Request
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* New request modal */}{" "}
      {isNewRequestModalOpen && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-xl border border-gray-100">
            <div className="p-5 border-b bg-gradient-to-r from-primary-magenta/5 to-white">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-gray-800">
                  Create Blood Request
                </h3>
                <button
                  onClick={() => setIsNewRequestModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 p-1 transition-colors duration-200"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmitRequest} className="p-5">
              {submitError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-md text-red-700 text-sm">
                  {submitError}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5">
                    Patient/Recipient Name*
                  </label>{" "}
                  <input
                    type="text"
                    value={newRequestForm.name}
                    onChange={(e) =>
                      setNewRequestForm({
                        ...newRequestForm,
                        name: e.target.value,
                      })
                    }
                    className={`w-full rounded-md border ${formErrors.name ? "border-red-300 ring-1 ring-red-300" : "border-gray-300"} p-2.5 focus:ring-2 focus:ring-primary-magenta/30 focus:border-primary-magenta transition-all duration-200 shadow-sm`}
                    placeholder="Enter name"
                  />
                  {formErrors.name && (
                    <p className="text-red-600 text-xs mt-1">
                      {formErrors.name}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5">
                    Blood Type*
                  </label>{" "}
                  <select
                    value={newRequestForm.bloodType}
                    onChange={(e) =>
                      setNewRequestForm({
                        ...newRequestForm,
                        bloodType: e.target.value,
                      })
                    }
                    className={`w-full rounded-md border ${formErrors.bloodType ? "border-red-300 ring-1 ring-red-300" : "border-gray-300"} p-2.5 focus:ring-2 focus:ring-primary-magenta/30 focus:border-primary-magenta transition-all duration-200 shadow-sm`}
                  >
                    <option value="">Select blood type</option>
                    {bloodTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                  {formErrors.bloodType && (
                    <p className="text-red-600 text-xs mt-1">
                      {formErrors.bloodType}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5">
                    Hospital*
                  </label>
                  <input
                    type="text"
                    value={newRequestForm.hospital}
                    onChange={(e) =>
                      setNewRequestForm({
                        ...newRequestForm,
                        hospital: e.target.value,
                      })
                    }
                    className={`w-full rounded-md border ${formErrors.hospital ? "border-red-300" : "border-gray-300"} p-2.5`}
                    placeholder="Hospital name"
                  />
                  {formErrors.hospital && (
                    <p className="text-red-600 text-xs mt-1">
                      {formErrors.hospital}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5">
                    Location*
                  </label>
                  <input
                    type="text"
                    value={newRequestForm.location}
                    onChange={(e) =>
                      setNewRequestForm({
                        ...newRequestForm,
                        location: e.target.value,
                      })
                    }
                    className={`w-full rounded-md border ${formErrors.location ? "border-red-300" : "border-gray-300"} p-2.5`}
                    placeholder="City, State"
                  />
                  {formErrors.location && (
                    <p className="text-red-600 text-xs mt-1">
                      {formErrors.location}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5">
                    Urgency
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {["low", "medium", "high"].map((level) => (
                      <button
                        type="button"
                        key={level}
                        onClick={() =>
                          setNewRequestForm({
                            ...newRequestForm,
                            urgency: level as any,
                          })
                        }
                        className={`py-2 px-4 rounded-md text-center text-sm ${
                          newRequestForm.urgency === level
                            ? "bg-primary-magenta text-white"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        {level.charAt(0).toUpperCase() + level.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5">
                    Units Required
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={newRequestForm.units}
                    onChange={(e) =>
                      setNewRequestForm({
                        ...newRequestForm,
                        units: parseInt(e.target.value) || 1,
                      })
                    }
                    className="w-full rounded-md border border-gray-300 p-2.5"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5">
                    Contact Number*
                  </label>
                  <input
                    type="text"
                    value={newRequestForm.contactNumber}
                    onChange={(e) =>
                      setNewRequestForm({
                        ...newRequestForm,
                        contactNumber: e.target.value,
                      })
                    }
                    className={`w-full rounded-md border ${formErrors.contactNumber ? "border-red-300" : "border-gray-300"} p-2.5`}
                    placeholder="Phone number"
                  />
                  {formErrors.contactNumber && (
                    <p className="text-red-600 text-xs mt-1">
                      {formErrors.contactNumber}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5">
                    Reason*
                  </label>{" "}
                  <textarea
                    value={newRequestForm.reason}
                    onChange={(e) =>
                      setNewRequestForm({
                        ...newRequestForm,
                        reason: e.target.value,
                      })
                    }
                    className={`w-full rounded-md border ${formErrors.reason ? "border-red-300 ring-1 ring-red-300" : "border-gray-300"} p-2.5 focus:ring-2 focus:ring-primary-magenta/30 focus:border-primary-magenta transition-all duration-200 shadow-sm`}
                    placeholder="Provide details about why blood is needed"
                    rows={4}
                  ></textarea>
                  {formErrors.reason && (
                    <p className="text-red-600 text-xs mt-1">
                      {formErrors.reason}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex gap-4 mt-8">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 border-gray-200 hover:bg-gray-50 transition-all duration-200"
                  onClick={() => setIsNewRequestModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-primary-magenta hover:bg-primary-magenta/90 shadow-md transition-all duration-200 py-2.5"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Droplets className="mr-2 h-4 w-4" />
                      Create Request
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
