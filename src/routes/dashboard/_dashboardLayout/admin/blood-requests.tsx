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
  const [statusFilter, setStatusFilter] = useState("all");
  const [bloodTypeFilter, setBloodTypeFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchBloodRequests();
  }, [search, statusFilter, bloodTypeFilter, currentPage]);

  const fetchBloodRequests = async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "10",
        ...(search && { search }),
        ...(statusFilter !== "all" && { status: statusFilter }),
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

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "fulfilled":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "urgent":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };
  const getUrgencyIcon = (urgency: string) => {
    if (urgency === "urgent") {
      return <AlertTriangle className="h-4 w-4 text-red-500" />;
    }
    return null;
  };

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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                  value={statusFilter}
                  onValueChange={(value: string) => {
                    setStatusFilter(value);
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                    <SelectItem value="fulfilled">Fulfilled</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
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
              {
                bloodRequests.filter(
                  (r) => r.status === "urgent" || r.urgency === "urgent"
                ).length
              }
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
                    <TableHead>Status</TableHead>
                    <TableHead>Created At</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bloodRequests.map((request) => (
                    <TableRow key={request._id}>
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
                        <Badge className={getStatusBadgeColor(request.status)}>
                          {request.status}
                        </Badge>
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
