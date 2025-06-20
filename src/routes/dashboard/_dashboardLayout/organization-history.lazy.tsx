import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { createLazyFileRoute } from "@tanstack/react-router";
import { ChevronDown, Filter, Search, X } from "lucide-react";
import { useEffect, useState } from "react";

export const Route = createLazyFileRoute(
  "/dashboard/_dashboardLayout/organization-history"
)({
  component: OrganizationHistoryComponent,
});

interface OrganizationInteraction {
  id: string;
  type: "blood_response" | "event_registration";
  organizationName: string;
  interactionDate: string;
  bloodType: string;
  units: number;
  status:
    | "completed"
    | "processing"
    | "verified"
    | "pending"
    | "approved"
    | "rejected";
  details: {
    patientName?: string;
    urgency?: string;
    responseMessage?: string;
    contactNumber?: string;
    eventTitle?: string;
    eventDate?: string;
    eventVenue?: string;
  };
}

function OrganizationHistoryComponent() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<string | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [interactions, setInteractions] = useState<OrganizationInteraction[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;

  const statuses = [
    "Completed",
    "Processing",
    "Verified",
    "Pending",
    "Approved",
    "Rejected",
  ];
  const years = ["2025", "2024", "2023", "2022"];

  // Fetch organization interactions
  useEffect(() => {
    const fetchOrganizationHistory = async () => {
      if (!user) return;

      try {
        setIsLoading(true);
        setError(null);

        // Use cookies for authentication - no need to manually send token
        const response = await fetch(
          "http://localhost:8001/api/v1/user/organization-history",
          {
            method: "GET",
            credentials: "include", // This ensures cookies are sent with the request
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        const data = await response.json();

        if (data.success) {
          setInteractions(data.data || []);
        } else {
          setError(data.message || "Failed to fetch organization history");
        }
      } catch (err) {
        console.error("Error fetching organization history:", err);
        setError("Failed to load organization history. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrganizationHistory();
  }, [user]);

  // Format date function
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Get interaction type display text
  const getInteractionTypeText = (type: string) => {
    switch (type) {
      case "blood_response":
        return "Response to Request";
      case "event_registration":
        return "Event Registration";
      default:
        return "Unknown";
    }
  };

  // Filter records based on search term and filters
  const filteredRecords = interactions.filter((record) => {
    const matchesSearch = record.organizationName
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    const matchesStatus = selectedStatus
      ? record.status === selectedStatus.toLowerCase()
      : true;

    const matchesYear = selectedYear
      ? new Date(record.interactionDate).getFullYear().toString() ===
        selectedYear
      : true;

    return matchesSearch && matchesStatus && matchesYear;
  });

  // Sort records by date (newest first)
  filteredRecords.sort(
    (a, b) =>
      new Date(b.interactionDate).getTime() -
      new Date(a.interactionDate).getTime()
  );
  // Calculate pagination
  const totalRecords = filteredRecords.length;
  const totalPages = Math.ceil(totalRecords / recordsPerPage);

  // Get current records for the page
  const currentRecords = filteredRecords.slice(
    (currentPage - 1) * recordsPerPage,
    currentPage * recordsPerPage
  );

  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto py-6 px-4">
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">Loading organization history...</div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="container mx-auto py-6 px-4">
        <div className="flex justify-center items-center h-64">
          <div className="text-lg text-red-600">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Organization Interaction History</h1>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm p-4">
          <h3 className="text-gray-500 text-sm mb-1">Total Interactions</h3>
          <p className="text-2xl font-bold">{interactions.length}</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4">
          <h3 className="text-gray-500 text-sm mb-1">Total Units</h3>
          <p className="text-2xl font-bold">
            {interactions.reduce(
              (total: number, record) => total + record.units,
              0
            )}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4">
          <h3 className="text-gray-500 text-sm mb-1">This Year</h3>
          <p className="text-2xl font-bold">
            {
              interactions.filter(
                (record) =>
                  new Date(record.interactionDate).getFullYear() === 2025
              ).length
            }
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4">
          <h3 className="text-gray-500 text-sm mb-1">Blood Responses</h3>
          <p className="text-2xl font-bold">
            {
              interactions.filter((record) => record.type === "blood_response")
                .length
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
            />
            <input
              type="text"
              placeholder="Search by organization name"
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
                            setSelectedYear(selectedYear === year ? null : year)
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
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Organization
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
            {currentRecords.length > 0 ? (
              currentRecords.map((record, index) => (
                <tr
                  key={record.id}
                  className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">
                      {record.organizationName}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {getInteractionTypeText(record.type)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {formatDate(record.interactionDate)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {record.bloodType}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{record.units}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                      ${
                        record.status === "completed" ||
                        record.status === "verified"
                          ? "bg-green-100 text-green-800"
                          : record.status === "processing" ||
                              record.status === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : record.status === "approved"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-red-100 text-red-800"
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
                <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                  No donation records found.
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
            {(currentPage - 1) * recordsPerPage + 1} -{" "}
            {Math.min(currentPage * recordsPerPage, filteredRecords.length)}
          </span>{" "}
          of <span className="font-medium">{filteredRecords.length}</span>{" "}
          records
        </div>

        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            className="text-gray-600"
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>

          {/* Page number buttons */}
          {[...Array(totalPages)].map((_, pageIndex) => (
            <Button
              key={pageIndex}
              variant="outline"
              size="sm"
              className={`${
                currentPage === pageIndex + 1
                  ? "bg-primary-magenta text-white"
                  : "text-gray-600"
              }`}
              onClick={() => setCurrentPage(pageIndex + 1)}
            >
              {pageIndex + 1}
            </Button>
          ))}

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
    </div>
  );
}
