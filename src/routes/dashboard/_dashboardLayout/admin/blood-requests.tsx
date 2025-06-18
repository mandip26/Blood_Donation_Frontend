import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, Activity, Trash2, Clock, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { adminApi } from "@/lib/api";

interface BloodRequest {
  _id: string;
  patientName: string;
  bloodType: string;
  unitsRequired: number;
  unitsNeeded: number;
  hospitalName: string;
  location: string;
  status: string;
  urgency: string;
  hasCompletedResponse?: boolean;
  requestedBy?: {
    _id: string;
    name?: string;
    organizationName?: string;
    hospitalName?: string;
    email: string;
    role: string;
  };
  createdBy?: {
    _id: string;
    name?: string;
    organizationName?: string;
    hospitalName?: string;
    email: string;
    role: string;
  };
  createdAt: string;
  requiredBy: string;
}

export const Route = createFileRoute(
  "/dashboard/_dashboardLayout/admin/blood-requests"
)({
  component: BloodRequestsManagement,
});

function BloodRequestsManagement() {
  const [bloodRequests, setBloodRequests] = useState<BloodRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [bloodTypeFilter, setBloodTypeFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchBloodRequests();
  }, [search, bloodTypeFilter, currentPage]);

  const fetchBloodRequests = async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "10",
        ...(search && { search }),
        ...(bloodTypeFilter !== "all" && { bloodType: bloodTypeFilter }),
      });

      const data = await adminApi.getBloodRequests(params);

      if (data.success) {
        setBloodRequests(data.data.bloodRequests);
        setTotalPages(data.data.pages);
        setTotal(data.data.total);
      } else {
        toast.error(data.message || "Failed to fetch blood requests");
      }
    } catch (error) {
      console.error("Error fetching blood requests:", error);
      toast.error("Failed to fetch blood requests");
    } finally {
      setLoading(false);
    }
  };

  const deleteBloodRequest = async (requestId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this blood request? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      await adminApi.deleteBloodRequest(requestId);

      setBloodRequests(
        bloodRequests.filter((request) => request._id !== requestId)
      );
      setTotal(total - 1);
      toast.success("Blood request deleted successfully");
    } catch (error) {
      console.error("Error deleting blood request:", error);
      toast.error("Failed to delete blood request");
    }
  };

  const getUrgencyIcon = (urgency: string) => {
    if (urgency === "urgent" || urgency === "high") {
      return <AlertTriangle className="h-4 w-4 text-red-500" />;
    }
    return null;
  };

  const urgentRequests = bloodRequests.filter(
    (r) =>
      (r.status === "urgent" ||
        r.urgency === "urgent" ||
        r.urgency === "high") &&
      !r.hasCompletedResponse
  );

  const bloodTypes = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">
          Blood Request Management
        </h1>
        <p className="text-gray-600">
          Manage and monitor all blood requests in the system
        </p>
      </div>

      {/* Search and Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-6 gap-6">
        <div className="lg:col-span-3">
          <Card className="bg-white shadow-even-md">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Filters</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search requests..."
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="pl-10"
                  />
                </div>
                <Select
                  value={bloodTypeFilter}
                  onValueChange={(value: string) => {
                    setBloodTypeFilter(value);
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Blood Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {bloodTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-white shadow-even-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Requests
            </CardTitle>
            <Activity className="h-4 w-4 text-primary-magenta" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{total}</div>
            <p className="text-xs text-gray-500">All requests</p>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-even-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Urgent
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {urgentRequests.length}
            </div>
            <p className="text-xs text-gray-500">Need attention</p>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-even-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Active
            </CardTitle>
            <Clock className="h-4 w-4 text-primary-magenta" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {
                bloodRequests.filter(
                  (r) => r.status === "pending" || r.status === "urgent"
                ).length
              }
            </div>
            <p className="text-xs text-gray-500">Awaiting donors</p>
          </CardContent>
        </Card>
      </div>

      {/* Urgent Requests Section */}
      {urgentRequests.length > 0 && (
        <Card className="bg-red-50 border-red-200 shadow-even-md">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-red-800 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Urgent Blood Requests ({urgentRequests.length})
            </CardTitle>
            <p className="text-red-700 text-sm">
              These requests require immediate attention
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {urgentRequests.slice(0, 5).map((request) => (
                <div
                  key={request._id}
                  className="bg-white p-4 rounded-lg border border-red-200 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                        <span className="font-semibold text-gray-900">
                          {request.patientName}
                        </span>
                      </div>
                      <Badge
                        variant="outline"
                        className="font-mono bg-red-100 text-red-800"
                      >
                        {request.bloodType}
                      </Badge>
                      <span className="text-sm text-gray-600">
                        {request.unitsNeeded || request.unitsRequired || 0}{" "}
                        units needed
                      </span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-900">
                          {request.hospitalName || "No hospital"}
                        </div>
                        <div className="text-xs text-gray-500">
                          {request.location}
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => deleteBloodRequest(request._id)}
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                        title="Delete Request"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              {urgentRequests.length > 5 && (
                <div className="text-center pt-2">
                  <p className="text-sm text-red-700">
                    +{urgentRequests.length - 5} more urgent requests in the
                    table below
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Blood Requests Table */}
      <Card className="bg-white shadow-even-md">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">
            Blood Requests ({total})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-magenta"></div>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Patient</TableHead>
                    <TableHead>Blood Type</TableHead>
                    <TableHead>Units</TableHead>
                    <TableHead>Created By</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Created At</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bloodRequests.map((request) => (
                    <TableRow
                      key={request._id}
                      className={
                        request.status === "urgent" ||
                        request.urgency === "urgent" ||
                        request.urgency === "high"
                          ? "bg-red-50 hover:bg-red-100 border-l-4 border-l-red-400"
                          : ""
                      }
                    >
                      <TableCell className="font-medium">
                        <div className="flex items-center space-x-2">
                          {getUrgencyIcon(request.urgency)}
                          <span>{request.patientName}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-mono">
                          {request.bloodType}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">
                        {request.unitsNeeded || request.unitsRequired || 0}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium text-sm">
                            {request.hospitalName || "No hospital"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div
                          className="max-w-32 truncate"
                          title={request.location}
                        >
                          {request.location}
                        </div>
                      </TableCell>
                      <TableCell>
                        {new Date(request.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => deleteBloodRequest(request._id)}
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                            title="Delete Request"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-gray-600">
                    Showing {(currentPage - 1) * 10 + 1} to{" "}
                    {Math.min(currentPage * 10, total)} of {total} requests
                  </p>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <span className="text-sm text-gray-600">
                      Page {currentPage} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
