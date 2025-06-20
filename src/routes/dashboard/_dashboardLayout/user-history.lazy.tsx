import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { userHistoryService } from "@/services/apiService";
import { createLazyFileRoute } from "@tanstack/react-router";
import { ChevronDown, Filter, Search, X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";

export const Route = createLazyFileRoute(
  "/dashboard/_dashboardLayout/user-history"
)({
  component: HospitalHistoryComponent,
});

interface DonationRecord {
  id: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  donationDate: string;
  bloodType: string;
  units: number;
  type: string;
  certificateAvailable: boolean;
  status:
    | "completed"
    | "processing"
    | "verified"
    | "pending"
    | "accepted"
    | "declined";
  reportAvailable: boolean;
}

interface UserInteraction {
  id: string;
  type: "donation" | "blood_request" | "blood_response" | "event_registration";
  userName: string;
  userEmail: string;
  userPhone: string;
  interactionDate: string;
  bloodType: string;
  units: number;
  status: string;
  details: {
    [key: string]: any;
  };
}

function HospitalHistoryComponent() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<string | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [viewType, setViewType] = useState<"hospital" | "organization">(
    "hospital"
  );
  const [hospitalUsers, setHospitalUsers] = useState<UserInteraction[]>([]);
  const [organizationUsers, setOrganizationUsers] = useState<UserInteraction[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;

  const { user, isLoading: authLoading } = useAuth();

  // Fetch user interactions based on current user's role
  useEffect(() => {
    const fetchUserInteractions = async () => {
      // Don't fetch if user is not loaded yet or still authenticating
      if (!user || authLoading) {
        return;
      }

      try {
        setLoading(true);

        if (user.role === "hospital") {
          const hospitalResponse =
            await userHistoryService.getHospitalUserInteractions();
          if (hospitalResponse.success) {
            setHospitalUsers(hospitalResponse.data);
          }
        } else if (user.role === "organization") {
          const organizationResponse =
            await userHistoryService.getOrganizationUserInteractions();
          if (organizationResponse.success) {
            setOrganizationUsers(organizationResponse.data);
          }
        } else {
          // For regular users, fetch their own history
          const [hospitalResponse, organizationResponse] = await Promise.all([
            userHistoryService.getHospitalHistory(),
            userHistoryService.getOrganizationHistory(),
          ]);

          if (hospitalResponse.success) {
            setHospitalUsers(hospitalResponse.data);
          }

          if (organizationResponse.success) {
            setOrganizationUsers(organizationResponse.data);
          }
        }
      } catch (error: any) {
        console.error("Error fetching interactions:", error);

        // Don't show error toast for 401 errors as they might be handled by auth interceptor
        if (error?.response?.status !== 401) {
          toast.error("Failed to fetch interaction data");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserInteractions();
  }, [user, authLoading]);

  const statuses = [
    "Completed",
    "Processing",
    "Verified",
    "Pending",
    "Accepted",
    "Declined",
  ];
  const years = ["2025", "2024", "2023", "2022"];

  // Get current data based on view type and user role
  const getCurrentData = () => {
    if (user?.role === "hospital") {
      return hospitalUsers;
    } else if (user?.role === "organization") {
      return organizationUsers;
    } else {
      // For regular users, show their own interactions
      return viewType === "hospital" ? hospitalUsers : organizationUsers;
    }
  };

  const currentData = getCurrentData();

  // Convert API data to display format
  const donationRecords: DonationRecord[] = currentData.map(
    (interaction: UserInteraction) => ({
      id: interaction.id,
      userName: interaction.userName,
      userEmail: interaction.userEmail,
      userPhone: interaction.userPhone,
      donationDate: interaction.interactionDate,
      bloodType: interaction.bloodType || "N/A",
      units: interaction.units,
      type: interaction.type,
      certificateAvailable:
        interaction.type === "donation" || interaction.status === "completed",
      status: interaction.status as
        | "completed"
        | "processing"
        | "verified"
        | "pending"
        | "accepted"
        | "declined",
      reportAvailable:
        interaction.type === "donation" || interaction.status === "completed",
    })
  );

  // Format date function
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Function to format interaction type names
  const formatInteractionType = (type: string): string => {
    switch (type) {
      case "blood_response":
        return "Response to Request";
      case "donation":
        return "Blood Donation";
      case "blood_request":
        return "Blood Request";
      case "event_registration":
        return "Event Registration";
      default:
        return type.charAt(0).toUpperCase() + type.slice(1);
    }
  };

  // Function to get type badge color
  const getTypeBadgeColor = (type: string): string => {
    switch (type) {
      case "blood_response":
        return "bg-blue-100 text-blue-800";
      case "donation":
        return "bg-green-100 text-green-800";
      case "blood_request":
        return "bg-purple-100 text-purple-800";
      case "event_registration":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Filter records based on search term and filters
  const filteredRecords = donationRecords.filter((record) => {
    const matchesSearch = record.userName
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    const matchesStatus = selectedStatus
      ? record.status === selectedStatus.toLowerCase() ||
        (selectedStatus === "Completed" && record.status === "completed") ||
        (selectedStatus === "Processing" && record.status === "processing") ||
        (selectedStatus === "Verified" && record.status === "verified") ||
        (selectedStatus === "Pending" && record.status === "pending") ||
        (selectedStatus === "Accepted" && record.status === "accepted") ||
        (selectedStatus === "Declined" && record.status === "declined")
      : true;

    const matchesYear = selectedYear
      ? new Date(record.donationDate).getFullYear().toString() === selectedYear
      : true;

    return matchesSearch && matchesStatus && matchesYear;
  });

  // Sort records by date (newest first)
  filteredRecords.sort(
    (a, b) =>
      new Date(b.donationDate).getTime() - new Date(a.donationDate).getTime()
  );

  // Calculate pagination
  const totalRecords = filteredRecords.length;
  const totalPages = Math.ceil(totalRecords / recordsPerPage);

  // Get current records for the page
  const currentPageRecords = filteredRecords.slice(
    (currentPage - 1) * recordsPerPage,
    currentPage * recordsPerPage
  );

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">
            {user?.role === "hospital"
              ? "User Interactions"
              : user?.role === "organization"
                ? "User Interactions"
                : "Interaction History"}
          </h1>
          <p className="text-gray-600 mt-1">
            {user?.role === "hospital"
              ? "Users who have interacted with your hospital"
              : user?.role === "organization"
                ? "Users who have interacted with your organization"
                : "Your blood-related interactions with hospitals and organizations"}
          </p>
        </div>
      </div>

      {/* View Type Toggle - Only show for regular users */}
      {user?.role === "user" && (
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="flex gap-2">
            <Button
              variant={viewType === "hospital" ? "default" : "outline"}
              onClick={() => setViewType("hospital")}
              className={
                viewType === "hospital"
                  ? "bg-primary-magenta hover:bg-primary-magenta/90"
                  : ""
              }
            >
              Hospital Interactions ({hospitalUsers.length})
            </Button>
            <Button
              variant={viewType === "organization" ? "default" : "outline"}
              onClick={() => setViewType("organization")}
              className={
                viewType === "organization"
                  ? "bg-primary-magenta hover:bg-primary-magenta/90"
                  : ""
              }
            >
              Organization Interactions ({organizationUsers.length})
            </Button>
          </div>
        </div>
      )}

      {loading || authLoading ? (
        <div className="text-center py-8">
          <p className="text-gray-500">Loading interaction history...</p>
        </div>
      ) : (
        <>
          {" "}
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl shadow-sm p-4">
              <h3 className="text-gray-500 text-sm mb-1">
                {user?.role === "hospital" || user?.role === "organization"
                  ? "Total User Interactions"
                  : "Total Interactions"}
              </h3>
              <p className="text-2xl font-bold">{currentData.length}</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-4">
              <h3 className="text-gray-500 text-sm mb-1">Total Blood Units</h3>
              <p className="text-2xl font-bold">
                {currentData.reduce(
                  (total: number, record: UserInteraction) =>
                    total + record.units,
                  0
                )}
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-4">
              <h3 className="text-gray-500 text-sm mb-1">This Year</h3>
              <p className="text-2xl font-bold">
                {
                  currentData.filter(
                    (record: UserInteraction) =>
                      new Date(record.interactionDate).getFullYear() === 2025
                  ).length
                }
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-4">
              <h3 className="text-gray-500 text-sm mb-1">
                {user?.role === "hospital" || user?.role === "organization"
                  ? "Blood Responses"
                  : viewType === "hospital"
                    ? "Donations"
                    : "Responses"}
              </h3>
              <p className="text-2xl font-bold">
                {
                  currentData.filter((record: UserInteraction) =>
                    user?.role === "hospital" || user?.role === "organization"
                      ? record.type === "blood_response"
                      : viewType === "hospital"
                        ? record.type === "donation"
                        : record.type === "blood_response"
                  ).length
                }
              </p>
            </div>
          </div>
          {/* Search and Filter */}
          <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={18}
                />{" "}
                <input
                  type="text"
                  placeholder={`Search by user name`}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-magenta"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="flex gap-4">
                <div className="relative">
                  <Button
                    variant="outline"
                    className="border border-gray-200 px-4 py-2 flex items-center gap-2"
                    onClick={() => setIsFilterOpen(!isFilterOpen)}
                  >
                    <Filter size={18} />
                    Filter
                    <ChevronDown size={16} />
                  </Button>

                  {/* Filter dropdown */}
                  {isFilterOpen && (
                    <div className="absolute right-0 mt-2 z-10 w-72 bg-white rounded-lg shadow-lg border border-gray-200 p-4">
                      <div className="mb-4">
                        <h3 className="text-sm font-medium mb-2">Status</h3>
                        <div className="grid grid-cols-2 gap-2">
                          {statuses.map((status) => (
                            <button
                              key={status}
                              className={`py-1 px-2 text-sm rounded ${
                                selectedStatus === status
                                  ? "bg-primary-magenta text-white"
                                  : "bg-gray-100 hover:bg-gray-200"
                              }`}
                              onClick={() =>
                                setSelectedStatus(
                                  selectedStatus === status ? null : status
                                )
                              }
                            >
                              {status}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h3 className="text-sm font-medium mb-2">Year</h3>
                        <div className="grid grid-cols-2 gap-2">
                          {years.map((year) => (
                            <button
                              key={year}
                              className={`py-1 px-2 text-sm rounded ${
                                selectedYear === year
                                  ? "bg-primary-magenta text-white"
                                  : "bg-gray-100 hover:bg-gray-200"
                              }`}
                              onClick={() =>
                                setSelectedYear(
                                  selectedYear === year ? null : year
                                )
                              }
                            >
                              {year}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="mt-4 flex justify-end">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedStatus(null);
                            setSelectedYear(null);
                          }}
                          className="text-gray-600 mr-2"
                        >
                          Clear All
                        </Button>
                        <Button
                          size="sm"
                          className="bg-primary-magenta text-white hover:bg-primary-magenta/90"
                          onClick={() => setIsFilterOpen(false)}
                        >
                          Apply
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Active filters */}
            {(selectedStatus || selectedYear) && (
              <div className="flex gap-2 mt-4">
                {selectedStatus && (
                  <div className="bg-gray-100 rounded-full px-3 py-1 text-sm flex items-center gap-1">
                    Status: {selectedStatus}
                    <button
                      onClick={() => setSelectedStatus(null)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <X size={14} />
                    </button>
                  </div>
                )}
                {selectedYear && (
                  <div className="bg-gray-100 rounded-full px-3 py-1 text-sm flex items-center gap-1">
                    Year: {selectedYear}
                    <button
                      onClick={() => setSelectedYear(null)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <X size={14} />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
          {/* Records Table */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
            <table className="min-w-full divide-y divide-gray-200">
              {" "}
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Blood Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Units
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentPageRecords.length > 0 ? (
                  currentPageRecords.map((record, index) => (
                    <tr
                      key={record.id}
                      className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                    >
                      {" "}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="font-medium text-gray-900">
                            {record.userName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {record.userEmail}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeBadgeColor(record.type)}`}
                        >
                          {formatInteractionType(record.type)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {formatDate(record.donationDate)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {record.bloodType}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {record.units}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                      ${
                        record.status === "verified" ||
                        record.status === "completed"
                          ? "bg-green-100 text-green-800"
                          : record.status === "processing" ||
                              record.status === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : record.status === "accepted"
                              ? "bg-blue-100 text-blue-800"
                              : record.status === "declined"
                                ? "bg-red-100 text-red-800"
                                : "bg-gray-100 text-gray-800"
                      }
                    `}
                        >
                          {record.status.charAt(0).toUpperCase() +
                            record.status.slice(1)}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-6 py-4 text-center text-gray-500"
                    >
                      {user?.role === "hospital" ||
                      user?.role === "organization"
                        ? "No user interaction records found."
                        : `No ${viewType} interaction records found.`}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {/* Pagination */}
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-500">
              Showing{" "}
              <span className="font-medium">
                {currentPageRecords.length > 0
                  ? `${(currentPage - 1) * recordsPerPage + 1} - ${Math.min(currentPage * recordsPerPage, totalRecords)}`
                  : "0"}
              </span>{" "}
              of <span className="font-medium">{totalRecords}</span> records
            </div>

            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                className="text-gray-600"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              >
                Previous
              </Button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <Button
                    key={page}
                    variant="outline"
                    size="sm"
                    className={`${
                      currentPage === page
                        ? "bg-primary-magenta/10 border-primary-magenta text-primary-magenta"
                        : "text-gray-600"
                    }`}
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </Button>
                )
              )}
              <Button
                variant="outline"
                size="sm"
                className="text-gray-600"
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
