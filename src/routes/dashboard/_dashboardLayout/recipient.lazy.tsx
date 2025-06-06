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
  AlertCircle,
  Loader2,
  Droplets,
  Heart,
  Phone,
  Hospital,
  CheckCircle,
  Eye,
  Trash2,
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
  urgency: "low" | "medium" | "high"; // Lowercase to match API
  postedTime: string;
  units: number;
  contactNumber: string;
  reason: string;
  createdBy?: string; // Add createdBy field to identify request creator
  hasCompletedResponse?: boolean; // Add field to track if any response is completed
  isDeleted?: boolean; // Add field to track if request is deleted
}

interface BloodRequestResponse {
  _id: string;
  bloodRequest: {
    _id: string;
    patientName: string;
    bloodType: string;
    hospital: string;
    isDeleted?: boolean; // Add field to track if original request is deleted
  };
  donor: {
    _id: string;
    name: string;
    email: string;
    phone: string;
  };
  message: string;
  contactNumber: string;
  responseTime: string;
  status: "Pending" | "Accepted" | "Declined" | "Completed";
  createdAt: string;
}

function RecipientComponent() {
  // Auth context
  const { user } = useAuth();

  // Responsive design
  const { isMobile } = useResponsive();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBloodType, setSelectedBloodType] = useState<string | null>(
    null
  );
  const [selectedUrgency, setSelectedUrgency] = useState<
    "low" | "medium" | "high" | null
  >(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<BloodRequest | null>(
    null
  );
  const [isNewRequestModalOpen, setIsNewRequestModalOpen] = useState(false);
  const [responseData, setResponseData] = useState<BloodRequestResponse | null>(
    null
  );
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [sorting] = useState<{
    key: keyof BloodRequest | null;
    direction: "asc" | "desc";
  }>({
    key: null,
    direction: "desc",
  });
  // State for API data handling
  const [bloodRequests, setBloodRequests] = useState<BloodRequest[]>([]);
  const [userResponses, setUserResponses] = useState<BloodRequestResponse[]>(
    []
  );
  const [showAllResponsesModal, setShowAllResponsesModal] = useState(false);
  const [isLoadingResponses, setIsLoadingResponses] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingRequestId, setDeletingRequestId] = useState<string | null>(
    null
  );
  const [deletedRequestResponses, setDeletedRequestResponses] = useState<
    BloodRequestResponse[]
  >([]);
  const [showDeletedResponsesModal, setShowDeletedResponsesModal] =
    useState(false);
  const bloodTypes = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
  const urgencyLevels = ["high", "medium", "low"];
  // New request form state
  const [newRequestForm, setNewRequestForm] = useState({
    name: "",
    bloodType: "",
    hospital: "",
    location: "",
    urgency: "medium" as "low" | "medium" | "high", // Lowercase to match API
    units: 1,
    contactNumber: "",
    reason: "",
  });

  // Form validation state
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [loadingResponseCheck, setLoadingResponseCheck] = useState<
    string | null
  >(null);

  // New state for user's own blood requests and responses to those requests
  const [userCreatedRequests, setUserCreatedRequests] = useState<any[]>([]);
  const [userCreatedRequestsResponses, setUserCreatedRequestsResponses] =
    useState<any[]>([]);
  const [selectedCreatedRequest, setSelectedCreatedRequest] = useState<
    string | null
  >(null);
  const [showMyRequestsResponsesModal, setShowMyRequestsResponsesModal] =
    useState(false);
  const [isLoadingMyRequests, setIsLoadingMyRequests] = useState(false);
  const [isUpdatingResponseStatus, setIsUpdatingResponseStatus] =
    useState(false);
  const [updatingResponseId, setUpdatingResponseId] = useState<string | null>(
    null
  );

  // Function to check if user has already responded to a request
  const checkExistingResponse = async (requestId: string) => {
    if (!user) return false;

    try {
      setLoadingResponseCheck(requestId);
      // Get responses for this request
      const result = await bloodRequestService.getRequestResponses(requestId);

      // Check if user has already responded
      if (result && result.success && result.responses) {
        const userResponse = result.responses.find(
          (response: any) =>
            response.donor._id === user._id || response.donor.id === user._id
        );

        if (userResponse) {
          // Show existing response
          setResponseData(userResponse);
          setShowResponseModal(true);
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error("Error checking existing response:", error);
      return false;
    } finally {
      setLoadingResponseCheck(null);
    }
  };
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
      const response = await fetch(
        "http://localhost:8001/api/v1/user/blood-requests"
      );
      const data = await response.json();

      if (data.success) {
        // For each blood request, check if any response has "Completed" status        // Filter out rejected (soft deleted) requests
        const activeRequests = data.bloodRequests.filter(
          (request: any) => request.status !== "Rejected"
        );

        const formattedRequests = await Promise.all(
          activeRequests.map(async (request: any) => {
            let hasCompletedResponse = false;

            try {
              // Check responses for this request
              const responsesResult =
                await bloodRequestService.getRequestResponses(request._id);
              if (
                responsesResult &&
                responsesResult.success &&
                responsesResult.responses
              ) {
                hasCompletedResponse = responsesResult.responses.some(
                  (response: any) => response.status === "Completed"
                );
              }
            } catch (error) {
              // If we can't get responses, assume no completed responses
              console.warn(
                "Could not fetch responses for request:",
                request._id
              );
            }

            return {
              id: request._id,
              name: request.patientName,
              bloodType: request.bloodType,
              hospital: request.hospital,
              location: request.location,
              urgency: request.urgency,
              postedTime: getTimeAgo(new Date(request.createdAt)),
              units: request.unitsRequired,
              contactNumber: request.contactNumber,
              reason: request.reason,
              createdBy: request.createdBy?._id || request.createdBy,
              hasCompletedResponse,
            };
          })
        );

        // Apply filters if any
        let filteredRequests = formattedRequests;
        if (filters.bloodType) {
          filteredRequests = filteredRequests.filter(
            (req: BloodRequest) => req.bloodType === filters.bloodType
          );
        }
        if (filters.urgency) {
          filteredRequests = filteredRequests.filter(
            (req: BloodRequest) => req.urgency === filters.urgency
          );
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
  // Commented out to fix TS6133 error - unused variable
  /* const handleSort = (key: keyof BloodRequest) => {
    setSorting((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  }; */

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
        name: newRequestForm.name,
        bloodType: newRequestForm.bloodType,
        hospital: newRequestForm.hospital,
        location: newRequestForm.location,
        urgency: newRequestForm.urgency.toLowerCase() as
          | "low"
          | "medium"
          | "high", // Convert to lowercase to match API
        units: newRequestForm.units,
        contactNumber: newRequestForm.contactNumber,
        reason: newRequestForm.reason,
      }); // Reset form and close modal on success
      setNewRequestForm({
        name: "",
        bloodType: "",
        hospital: "",
        location: "",
        urgency: "medium", // Lowercase to match API
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
  }; // Respond to a blood request
  const handleRespondToRequest = async (requestId: string) => {
    if (!user) {
      // Redirect to login if not authenticated
      window.location.href = "/login?redirect=/dashboard/recipient";
      return;
    }
    try {
      // Prepare response data - only send what the backend expects
      const requestResponseData = {
        contactNumber: user.phone || "Contact via platform",
        message: `Hi, I'm ${user.name || "a donor"} and I'm available to help with your blood request. Please contact me for further details.`,
      };

      // Send response to API and get response data
      const result = await bloodRequestService.respondToRequest(
        requestId,
        requestResponseData
      );
      // Store the response data returned from the API
      if (result && result.success && result.response) {
        setResponseData(result.response);
        setShowResponseModal(true);
      }

      // Close the request selection modal
      setSelectedRequest(null);

      // Refresh the requests to show updated status
      fetchBloodRequests();
    } catch (error) {
      console.error("Error responding to request:", error);
      alert("Failed to respond to the request. Please try again.");
    }
  };
  // Fetch user responses
  const fetchUserResponses = async () => {
    if (!user || (!user._id && !user.id)) return;

    try {
      setIsLoadingResponses(true);
      setError(null);

      // Call the API endpoint to get user responses
      const result = await bloodRequestService.getUserResponses();

      if (result && result.success && result.responses) {
        setUserResponses(result.responses);
        setShowAllResponsesModal(true);
      } else {
        // If API returns success: false or no responses
        setUserResponses([]);
        setShowAllResponsesModal(true);
      }
    } catch (err) {
      console.error("Error fetching user responses:", err);
      setError("Failed to load your responses. Please try again.");
      setUserResponses([]);
    } finally {
      setIsLoadingResponses(false);
    }
  };

  // Fetch user created blood requests
  const fetchUserCreatedRequests = async () => {
    if (!user || (!user._id && !user.id)) return;

    try {
      setIsLoadingMyRequests(true);
      setError(null);

      // Call API to get requests created by the user
      const result = await bloodRequestService.getUserRequests();
      if (result && result.success && result.bloodRequests) {
        // Filter out rejected (soft deleted) requests
        const activeRequests = result.bloodRequests.filter(
          (request: any) => request.status !== "Rejected"
        );

        setUserCreatedRequests(activeRequests);

        // If there are requests, select the first one by default
        if (activeRequests.length > 0) {
          setSelectedCreatedRequest(activeRequests[0]._id);
          // Fetch responses for the first request
          fetchResponsesForRequest(activeRequests[0]._id);
        }
      } else {
        setUserCreatedRequests([]);
        setUserCreatedRequestsResponses([]);
      }
    } catch (err) {
      console.error("Error fetching user created requests:", err);
      setError("Failed to load your blood requests. Please try again.");
      setUserCreatedRequests([]);
    } finally {
      setIsLoadingMyRequests(false);
    }
  };

  // Fetch responses for a specific blood request created by the user
  const fetchResponsesForRequest = async (requestId: string) => {
    if (!requestId) return;

    try {
      setIsLoadingResponses(true);
      setError(null);

      const result = await bloodRequestService.getRequestResponses(requestId);

      if (result && result.success && result.responses) {
        setUserCreatedRequestsResponses(result.responses);
        setShowMyRequestsResponsesModal(true);
      } else {
        setUserCreatedRequestsResponses([]);
        setShowMyRequestsResponsesModal(true);
      }
    } catch (err) {
      console.error("Error fetching responses for request:", err);
      setError("Failed to load responses for this request. Please try again.");
      setUserCreatedRequestsResponses([]);
    } finally {
      setIsLoadingResponses(false);
    }
  }; // Handle updating the response status
  const handleUpdateResponseStatus = async (
    responseId: string,
    status: "Pending" | "Accepted" | "Declined" | "Completed"
  ) => {
    try {
      setIsUpdatingResponseStatus(true);
      setUpdatingResponseId(responseId);

      const result = await bloodRequestService.updateResponseStatus(
        responseId,
        status
      );

      if (result && result.success) {
        // Update the response in the list with the new status
        setUserCreatedRequestsResponses((prevResponses) =>
          prevResponses.map((response) =>
            response._id === responseId
              ? { ...response, status: status }
              : response
          )
        );
      }
    } catch (err) {
      console.error("Error updating response status:", err);
      setError("Failed to update response status. Please try again.");
    } finally {
      setIsUpdatingResponseStatus(false);
      setUpdatingResponseId(null);
    }
  };

  // Check if response modification should be disabled
  const isResponseModificationDisabled = (response: BloodRequestResponse) => {
    // Disable if the original request is deleted
    if (response.bloodRequest.isDeleted) {
      return true;
    }
    // Disable if any response is completed
    return response.status === "Completed";
  }; // Handle deleting a blood request (only for request creators)
  const handleDeleteRequest = async (requestId: string) => {
    if (!user) return;

    if (
      window.confirm(
        "Are you sure you want to delete this blood request? This action cannot be undone."
      )
    ) {
      try {
        setDeletingRequestId(requestId);

        // First, get all responses for this request before deleting
        const responsesResult =
          await bloodRequestService.getRequestResponses(requestId);
        if (
          responsesResult &&
          responsesResult.success &&
          responsesResult.responses
        ) {
          // Mark responses as from deleted request
          const responsesWithDeletedFlag = responsesResult.responses.map(
            (response: BloodRequestResponse) => ({
              ...response,
              bloodRequest: {
                ...response.bloodRequest,
                isDeleted: true,
              },
            })
          );
          setDeletedRequestResponses((prev) => [
            ...prev,
            ...responsesWithDeletedFlag,
          ]);
        }

        const result = await bloodRequestService.cancelRequest(requestId);
        if (result && result.success) {
          // Remove the deleted request from local state immediately
          setBloodRequests((prev) =>
            prev.filter((req) => req.id !== requestId)
          );
          setUserCreatedRequests((prev) =>
            prev.filter((req) => req._id !== requestId)
          );

          // If this was the selected request in the responses modal, clear it
          if (selectedCreatedRequest === requestId) {
            setSelectedCreatedRequest(null);
            setUserCreatedRequestsResponses([]);
          }

          // Refresh the blood requests list
          await fetchBloodRequests();
          // Also refresh user created requests if that modal is open
          if (showMyRequestsResponsesModal) {
            await fetchUserCreatedRequests();
          }
          alert(
            "Blood request deleted successfully. All responses have been moved to records."
          );
        } else {
          alert("Failed to delete blood request. Please try again.");
        }
      } catch (err: any) {
        console.error("Error deleting blood request:", err);

        // More specific error handling
        let errorMessage = "Failed to delete blood request. Please try again.";

        if (err.response) {
          // Server responded with error status
          if (err.response.status === 404) {
            errorMessage = "Blood request not found or already deleted.";
          } else if (err.response.status === 403) {
            errorMessage = "You don't have permission to delete this request.";
          } else if (err.response.status === 500) {
            errorMessage = "Server error. Please try again later.";
          } else if (err.response.data?.message) {
            errorMessage = err.response.data.message;
          }
        } else if (err.request) {
          // Network error
          errorMessage =
            "Network error. Please check your connection and try again.";
        }

        alert(errorMessage);
      } finally {
        setDeletingRequestId(null);
      }
    }
  };

  // Fetch initial data
  useEffect(() => {
    fetchBloodRequests();
    if (user) {
      fetchUserResponses();
      fetchUserCreatedRequests();
    }
  }, [user]);

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
      <div className="p-8 text-center text-gray-500">
        <p>Error: {error}</p>
        <button
          className="mt-4 bg-primary-magenta hover:bg-primary-magenta/90 text-white px-4 py-2 rounded-md"
          onClick={() => fetchBloodRequests()}
        >
          Retry
        </button>
      </div>
    );
  }
  // Response Data Display Component
  const ResponseDataDisplay = () => {
    if (!responseData) return null;

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800">
              Response Submitted Successfully
            </h2>
            <button
              onClick={() => {
                setResponseData(null);
                setShowResponseModal(false);
              }}
              className="text-gray-500 hover:text-gray-800"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="border rounded-md p-4 mb-4 bg-green-50">
            <div className="flex items-center mb-2">
              <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
              <span className="text-green-700 font-medium">
                Your response has been sent!
              </span>
            </div>
            <p className="text-sm text-gray-600">
              The requester will be able to contact you using the provided
              details.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-gray-500">
                Response Details
              </h3>
              <div className="mt-2 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className="font-medium">{responseData.status}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Contact Number:</span>
                  <span className="font-medium">
                    {responseData.contactNumber}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Submitted At:</span>
                  <span className="font-medium">
                    {new Date(responseData.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-500">
                Blood Request Info
              </h3>
              <div className="mt-2 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Patient:</span>
                  <span className="font-medium">
                    {responseData.bloodRequest.patientName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Blood Type:</span>
                  <span className="font-medium">
                    {responseData.bloodRequest.bloodType}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Hospital:</span>
                  <span className="font-medium">
                    {responseData.bloodRequest.hospital}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-500">
                Your Message
              </h3>
              <p className="mt-1 text-gray-600 border rounded p-2 bg-gray-50">
                {responseData.message}
              </p>
            </div>
          </div>

          <div className="mt-6">
            <Button
              onClick={() => {
                setResponseData(null);
                setShowResponseModal(false);
              }}
              className="w-full bg-primary-magenta hover:bg-primary-magenta/90 text-white py-2.5 font-medium transition-all duration-200"
            >
              Close
            </Button>
          </div>
        </div>
      </div>
    );
  };

  // Main component render
  return (
    <div className="p-4 md:p-6 bg-gray-50">
      {" "}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
            Blood Requests
          </h1>
          <p className="text-gray-600 mt-1">
            Find and respond to blood donation requests in your area
          </p>
        </div>{" "}
        <div className="flex gap-2">
          {user && (
            <Button
              onClick={fetchUserResponses}
              className={`bg-blue-500 hover:bg-blue-600 shadow-md transition-all duration-200 flex items-center gap-2 px-4 ${isLoadingResponses ? "opacity-75 cursor-not-allowed" : ""}`}
              disabled={isLoadingResponses}
            >
              {isLoadingResponses ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
              View My Responses
            </Button>
          )}
          {user?.role !== "user" && (
            <>
              <Button
                onClick={fetchUserCreatedRequests}
                className={`bg-green-500 hover:bg-green-600 shadow-md transition-all duration-200 flex items-center gap-2 px-4 ${isLoadingMyRequests ? "opacity-75 cursor-not-allowed" : ""}`}
                disabled={isLoadingMyRequests}
              >
                {isLoadingMyRequests ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
                View My Requests Responses{" "}
              </Button>
              <Button
                onClick={() => setIsNewRequestModalOpen(true)}
                className="bg-primary-magenta hover:bg-primary-magenta/90 shadow-md transition-all duration-200 flex items-center gap-2 px-5"
              >
                <Heart className="h-4 w-4" />
                Create Request
              </Button>
              {deletedRequestResponses.length > 0 && (
                <Button
                  onClick={() => setShowDeletedResponsesModal(true)}
                  className="bg-gray-500 hover:bg-gray-600 text-white font-medium py-2.5 px-6 shadow-md transition-all duration-200"
                >
                  <AlertCircle className="mr-2 h-4 w-4" />
                  Deleted Request Records ({deletedRequestResponses.length})
                </Button>
              )}
            </>
          )}
        </div>
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
                          level === selectedUrgency
                            ? null
                            : (level as "low" | "medium" | "high")
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
                  <span
                    className="inline-block px-3 py-1 rounded-full text-sm font-medium
                    ${request.urgency === 'High' ? 'bg-red-100 text-red-800' :
                    request.urgency === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'}"
                  >
                    {request.urgency}
                  </span>
                  <p className="text-gray-500 text-sm mt-1">
                    {request.postedTime}
                  </p>
                </div>
              </div>
              <div className="mt-4 flex justify-between items-center">
                {" "}
                <div>
                  <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                    {request.bloodType}
                  </span>
                  <span className="ml-2 text-gray-600">
                    {request.units} units needed
                  </span>
                </div>
                <div className="flex gap-2">
                  {" "}
                  {/* Show delete button if user is the creator of the request */}
                  {user && request.createdBy === user._id && (
                    <button
                      onClick={() => handleDeleteRequest(request.id)}
                      disabled={deletingRequestId === request.id}
                      className={`px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center justify-center gap-2 ${
                        deletingRequestId === request.id
                          ? "opacity-75 cursor-not-allowed"
                          : ""
                      }`}
                    >
                      {deletingRequestId === request.id ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Deleting...
                        </>
                      ) : (
                        <>
                          <Trash2 className="h-4 w-4" />
                          Delete Request
                        </>
                      )}
                    </button>
                  )}
                  {/* Hide View Details button if any response is completed */}
                  {!request.hasCompletedResponse && (
                    <button
                      onClick={async () => {
                        // Check if user has already responded before showing details
                        const hasExistingResponse = await checkExistingResponse(
                          request.id
                        );
                        if (!hasExistingResponse) {
                          setSelectedRequest(request);
                        }
                      }}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center"
                    >
                      {loadingResponseCheck === request.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        "View Details"
                      )}
                    </button>
                  )}
                  {/* Show message when request is completed */}
                  {request.hasCompletedResponse && (
                    <div className="px-4 py-2 bg-green-100 text-green-800 rounded-lg font-medium">
                      Request Completed
                    </div>
                  )}
                </div>
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
                      {" "}
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                          selectedRequest.urgency.toLowerCase() === "high"
                            ? "bg-red-100 text-red-700 border border-red-200"
                            : selectedRequest.urgency.toLowerCase() === "medium"
                              ? "bg-yellow-100 text-yellow-700 border border-yellow-200"
                              : "bg-green-100 text-green-700 border border-green-200"
                        }`}
                      >
                        {selectedRequest.urgency}
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
                            urgency: level as "low" | "medium" | "high",
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
      )}{" "}
      {/* Display response confirmation modal if shown */}
      {showResponseModal && responseData && <ResponseDataDisplay />}
      {/* Modal to display all user responses */}
      {showAllResponsesModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-xl border border-gray-100">
            <div className="p-5 border-b bg-gradient-to-r from-blue-50 to-white">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-gray-800">
                  My Blood Request Responses
                </h3>
                <button
                  onClick={() => setShowAllResponsesModal(false)}
                  className="text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 p-1 transition-colors duration-200"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="p-5">
              {isLoadingResponses ? (
                <div className="flex flex-col items-center justify-center p-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary-magenta mb-2" />
                  <p className="text-gray-600">Loading your responses...</p>
                </div>
              ) : error ? (
                <div className="bg-red-50 p-6 rounded-lg text-center">
                  <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
                  <p className="text-red-600 mb-2">{error}</p>
                  <Button
                    onClick={fetchUserResponses}
                    variant="outline"
                    size="sm"
                    className="mt-2"
                  >
                    Try Again
                  </Button>
                </div>
              ) : userResponses.length > 0 ? (
                <div className="space-y-4">
                  {userResponses.map((response: BloodRequestResponse) => (
                    <div
                      key={response._id}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex justify-between items-start mb-2">
                        {" "}
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium text-gray-800">
                              Request for {response.bloodRequest.patientName}
                            </h4>
                            {response.bloodRequest.isDeleted && (
                              <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
                                Request Deleted
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="inline-block px-2.5 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                              {response.bloodRequest.bloodType}
                            </span>
                            <span className="text-gray-500 text-sm">
                              {new Date(
                                response.createdAt
                              ).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-medium
                          ${
                            response.status === "Accepted"
                              ? "bg-green-100 text-green-800"
                              : response.status === "Declined"
                                ? "bg-red-100 text-red-800"
                                : response.status === "Completed"
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {response.status}
                        </span>
                      </div>

                      <div className="border-t border-gray-100 pt-2 mt-2">
                        <div className="flex flex-col sm:flex-row sm:justify-between gap-2">
                          <div>
                            <span className="text-xs text-gray-500 block">
                              Hospital
                            </span>
                            <span className="text-gray-700">
                              {response.bloodRequest.hospital}
                            </span>
                          </div>
                          <div>
                            <span className="text-xs text-gray-500 block">
                              Your Contact
                            </span>
                            <span className="text-gray-700">
                              {response.contactNumber}
                            </span>
                          </div>
                        </div>

                        <div className="mt-2">
                          <span className="text-xs text-gray-500 block">
                            Your Message
                          </span>
                          <p className="text-gray-700 bg-gray-50 p-2 rounded mt-1 text-sm">
                            {response.message}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center p-8 text-gray-500">
                  <div className="mb-3">
                    <Eye className="h-10 w-10 mx-auto text-gray-400" />
                  </div>
                  <p className="mb-1">
                    You haven't responded to any blood requests yet.
                  </p>
                  <p className="text-sm">
                    When you respond to a blood request, it will appear here.
                  </p>
                </div>
              )}

              <div className="mt-6">
                <Button
                  onClick={() => setShowAllResponsesModal(false)}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2.5 font-medium transition-all duration-200"
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Modal to display responses to user's created requests */}
      {showMyRequestsResponsesModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-xl border border-gray-100">
            <div className="p-5 border-b bg-gradient-to-r from-green-50 to-white">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-gray-800">
                  Responses to My Blood Requests
                </h3>
                <button
                  onClick={() => setShowMyRequestsResponsesModal(false)}
                  className="text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 p-1 transition-colors duration-200"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            <div className="p-5">
              {isLoadingMyRequests ? (
                <div className="flex flex-col items-center justify-center p-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary-magenta mb-2" />
                  <p className="text-gray-600">
                    Loading your blood requests...
                  </p>
                </div>
              ) : error ? (
                <div className="bg-red-50 p-6 rounded-lg text-center">
                  <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
                  <p className="text-red-600 mb-2">{error}</p>
                  <Button
                    onClick={fetchUserCreatedRequests}
                    variant="outline"
                    size="sm"
                    className="mt-2"
                  >
                    Try Again
                  </Button>
                </div>
              ) : userCreatedRequests.length === 0 ? (
                <div className="text-center p-8 text-gray-500">
                  <div className="mb-3">
                    <Hospital className="h-10 w-10 mx-auto text-gray-400" />
                  </div>
                  <p className="mb-1">
                    You haven't created any blood requests yet.
                  </p>
                  <p className="text-sm">
                    When you create a blood request, responses to it will appear
                    here.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Request selection sidebar */}
                  <div className="lg:w-72 border-r">
                    <h4 className="font-medium text-gray-700 mb-3">
                      My Requests
                    </h4>
                    <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
                      {userCreatedRequests.map((request) => (
                        <div
                          key={request._id}
                          onClick={() => {
                            setSelectedCreatedRequest(request._id);
                            fetchResponsesForRequest(request._id);
                          }}
                          className={`p-3 rounded-md cursor-pointer transition-colors ${
                            selectedCreatedRequest === request._id
                              ? "bg-green-100 border-l-4 border-green-500"
                              : "hover:bg-gray-100"
                          }`}
                        >
                          <div className="font-medium text-gray-800">
                            {request.patientName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {request.hospital}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="inline-block px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full text-xs">
                              {request.bloodType}
                            </span>
                            <span className="text-xs text-gray-500">
                              {new Date(request.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Responses panel */}
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-700 mb-3">
                      Responses
                    </h4>
                    {isLoadingResponses ? (
                      <div className="flex flex-col items-center justify-center p-8">
                        <Loader2 className="h-8 w-8 animate-spin text-green-500 mb-2" />
                        <p className="text-gray-600">Loading responses...</p>
                      </div>
                    ) : userCreatedRequestsResponses.length === 0 ? (
                      <div className="text-center p-8 border rounded-md bg-gray-50">
                        <p className="text-gray-500">
                          No responses to this request yet.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {userCreatedRequestsResponses.map((response) => (
                          <div
                            key={response._id}
                            className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <div className="flex items-center gap-2">
                                  <h4 className="font-medium text-gray-800">
                                    {response.donor.name}
                                  </h4>
                                  <span
                                    className={`px-2.5 py-1 rounded-full text-xs font-medium
                                    ${
                                      response.status === "Accepted"
                                        ? "bg-green-100 text-green-800"
                                        : response.status === "Declined"
                                          ? "bg-red-100 text-red-800"
                                          : response.status === "Completed"
                                            ? "bg-blue-100 text-blue-800"
                                            : "bg-yellow-100 text-yellow-800"
                                    }`}
                                  >
                                    {response.status}
                                  </span>
                                </div>
                                <div className="text-sm text-gray-500 mt-1">
                                  {response.donor.email} |{" "}
                                  {response.contactNumber}
                                </div>
                              </div>
                              <div className="text-sm text-gray-500">
                                {new Date(response.createdAt).toLocaleString()}
                              </div>
                            </div>

                            {response.message && (
                              <div className="mt-3 bg-gray-50 p-3 rounded-md text-gray-700 text-sm">
                                {response.message}
                              </div>
                            )}

                            <div className="mt-4 pt-3 border-t border-gray-100">
                              <div className="text-sm font-medium text-gray-700 mb-2">
                                Update Status:
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {[
                                  "Pending",
                                  "Accepted",
                                  "Declined",
                                  "Completed",
                                ].map((status) => (
                                  <Button
                                    key={status}
                                    onClick={() =>
                                      handleUpdateResponseStatus(
                                        response._id,
                                        status as
                                          | "Pending"
                                          | "Accepted"
                                          | "Declined"
                                          | "Completed"
                                      )
                                    }
                                    disabled={
                                      isResponseModificationDisabled(
                                        response
                                      ) ||
                                      (isUpdatingResponseStatus &&
                                        updatingResponseId === response._id)
                                    }
                                    className={`${
                                      status === "Pending"
                                        ? "bg-yellow-500 hover:bg-yellow-600"
                                        : status === "Accepted"
                                          ? "bg-green-500 hover:bg-green-600"
                                          : status === "Declined"
                                            ? "bg-red-500 hover:bg-red-600"
                                            : "bg-blue-500 hover:bg-blue-600"
                                    } text-white py-1 px-3 text-xs ${
                                      isResponseModificationDisabled(response)
                                        ? "opacity-50 cursor-not-allowed"
                                        : ""
                                    }`}
                                    variant={
                                      response.status === status
                                        ? "default"
                                        : "outline"
                                    }
                                  >
                                    {isUpdatingResponseStatus &&
                                    updatingResponseId === response._id ? (
                                      <Loader2 className="h-3 w-3 animate-spin mr-1" />
                                    ) : null}
                                    {status}
                                  </Button>
                                ))}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="mt-6">
                <Button
                  onClick={() => setShowMyRequestsResponsesModal(false)}
                  className="w-full bg-green-500 hover:bg-green-600 text-white py-2.5 font-medium transition-all duration-200"
                >
                  Close
                </Button>
              </div>
            </div>{" "}
          </div>
        </div>
      )}
      {/* Modal to display deleted request responses */}
      {showDeletedResponsesModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-xl border border-gray-100">
            <div className="p-5 border-b bg-gradient-to-r from-gray-50 to-white">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-gray-800">
                  Deleted Request Records
                </h3>
                <button
                  onClick={() => setShowDeletedResponsesModal(false)}
                  className="text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 p-1 transition-colors duration-200"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="p-5">
              {deletedRequestResponses.length > 0 ? (
                <div className="space-y-4">
                  <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 mb-4">
                    <div className="flex items-center">
                      <AlertCircle className="h-5 w-5 text-yellow-600 mr-2" />
                      <p className="text-yellow-800 text-sm">
                        These are records of responses to deleted blood
                        requests. They cannot be modified.
                      </p>
                    </div>
                  </div>

                  {deletedRequestResponses.map((response) => (
                    <div
                      key={response._id}
                      className="border border-gray-300 rounded-lg p-4 bg-gray-50 opacity-75"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium text-gray-800">
                              {response.donor.name}
                            </h4>
                            <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
                              Request Deleted
                            </span>
                            <span
                              className={`px-2.5 py-1 rounded-full text-xs font-medium
                              ${
                                response.status === "Accepted"
                                  ? "bg-green-100 text-green-800"
                                  : response.status === "Declined"
                                    ? "bg-red-100 text-red-800"
                                    : response.status === "Completed"
                                      ? "bg-blue-100 text-blue-800"
                                      : "bg-yellow-100 text-yellow-800"
                              }`}
                            >
                              {response.status}
                            </span>
                          </div>
                          <div className="text-sm text-gray-500 mt-1">
                            {response.donor.email} | {response.contactNumber}
                          </div>
                        </div>
                        <div className="text-sm text-gray-500">
                          {new Date(response.createdAt).toLocaleString()}
                        </div>
                      </div>

                      <div className="mt-3 space-y-2">
                        <div>
                          <span className="text-xs text-gray-500 block">
                            Original Request
                          </span>
                          <div className="text-sm text-gray-700">
                            Patient: {response.bloodRequest.patientName} | Blood
                            Type: {response.bloodRequest.bloodType} | Hospital:{" "}
                            {response.bloodRequest.hospital}
                          </div>
                        </div>

                        {response.message && (
                          <div>
                            <span className="text-xs text-gray-500 block">
                              Response Message
                            </span>
                            <div className="bg-white p-3 rounded-md text-gray-700 text-sm border">
                              {response.message}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="mt-4 pt-3 border-t border-gray-200">
                        <div className="text-sm text-gray-500 italic">
                          This record cannot be modified as the original request
                          has been deleted.
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center p-8 text-gray-500">
                  <div className="mb-3">
                    <AlertCircle className="h-10 w-10 mx-auto text-gray-400" />
                  </div>
                  <p className="mb-1">No deleted request records found.</p>
                  <p className="text-sm">
                    When you delete a blood request that has responses, those
                    responses will appear here as records.
                  </p>
                </div>
              )}

              <div className="mt-6">
                <Button
                  onClick={() => setShowDeletedResponsesModal(false)}
                  className="w-full bg-gray-500 hover:bg-gray-600 text-white py-2.5 font-medium transition-all duration-200"
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
