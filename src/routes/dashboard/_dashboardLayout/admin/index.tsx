import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Users,
  Building,
  Building2,
  Calendar,
  Heart,
  FileText,
  Activity,
  TrendingUp,
  BarChart3,
  PieChart,
  Droplet,
} from "lucide-react";
import { adminApi } from "@/lib/api";
import { toast } from "sonner";

interface DashboardStats {
  totalUsers: number;
  totalHospitals: number;
  totalOrganizations: number;
  totalDonors: number;
  totalEvents: number;
  totalBloodRequests: number;
  activeBloodRequests: number;
  totalPosts: number;
  recentUsers: number;
}

interface BloodInventoryStats {
  totalStats: {
    aPositive: number;
    aNegative: number;
    bPositive: number;
    bNegative: number;
    abPositive: number;
    abNegative: number;
    oPositive: number;
    oNegative: number;
    totalUnits: number;
    totalHospitals: number;
  };
  hospitalInventories: Array<{
    id: string;
    displayName: string;
    role: string;
    aPositive: number;
    aNegative: number;
    bPositive: number;
    bNegative: number;
    abPositive: number;
    abNegative: number;
    oPositive: number;
    oNegative: number;
    lastUpdated: string;
  }>;
}

export const Route = createFileRoute("/dashboard/_dashboardLayout/admin/")({
  component: AdminDashboard,
});

function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [bloodInventory, setBloodInventory] =
    useState<BloodInventoryStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedHospital, setSelectedHospital] = useState<
    BloodInventoryStats["hospitalInventories"][0] | null
  >(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardStats();
    fetchBloodInventoryStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const data = await adminApi.getDashboardStats();
      if (data.success) {
        setStats(data.data);
      } else {
        toast.error("Failed to fetch dashboard statistics");
      }
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      toast.error("Failed to fetch dashboard statistics");
    } finally {
      setLoading(false);
    }
  };

  const fetchBloodInventoryStats = async () => {
    try {
      const data = await adminApi.getBloodInventoryStats();
      if (data.success) {
        setBloodInventory(data.data);
      } else {
        toast.error("Failed to fetch blood inventory statistics");
      }
    } catch (error) {
      console.error("Error fetching blood inventory stats:", error);
      toast.error("Failed to fetch blood inventory statistics");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-magenta"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600">
          Welcome to the blood donation system admin panel
        </p>
      </div>

      {/* Analytics & Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Growth Chart */}
        <Card className="bg-white shadow-even-md hover:shadow-even-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary-magenta" />
              User Activity Overview
            </CardTitle>
            <Badge variant="outline" className="text-xs">
              Live Data
            </Badge>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-blue-500" />
                  <span className="text-sm font-medium text-gray-700">
                    Total Users
                  </span>
                </div>
                <span className="text-sm font-bold text-gray-900">
                  {stats?.totalUsers || 0}
                </span>
              </div>
              <Progress
                value={Math.min(((stats?.totalUsers || 0) / 50) * 100, 100)}
                className="h-2"
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Heart className="h-4 w-4 text-red-500" />
                  <span className="text-sm font-medium text-gray-700">
                    Blood Donors
                  </span>
                </div>
                <span className="text-sm font-bold text-gray-900">
                  {stats?.totalDonors || 0}
                </span>
              </div>
              <Progress
                value={Math.min(((stats?.totalDonors || 0) / 30) * 100, 100)}
                className="h-2"
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Building className="h-4 w-4 text-green-500" />
                  <span className="text-sm font-medium text-gray-700">
                    Hospitals
                  </span>
                </div>
                <span className="text-sm font-bold text-gray-900">
                  {stats?.totalHospitals || 0}
                </span>
              </div>
              <Progress
                value={Math.min(((stats?.totalHospitals || 0) / 20) * 100, 100)}
                className="h-2"
              />
            </div>
          </CardContent>
        </Card>

        {/* Blood Requests Analytics */}
        <Card className="bg-white shadow-even-md hover:shadow-even-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <PieChart className="h-5 w-5 text-primary-magenta" />
              Blood Request Analytics
            </CardTitle>
            <Badge variant="outline" className="text-xs">
              Real-time
            </Badge>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() =>
                  navigate({ to: "/dashboard/admin/blood-requests" })
                }
                className="text-center p-4 bg-red-50 rounded-lg border border-red-100 hover:bg-red-100 transition-colors cursor-pointer"
              >
                <div className="text-2xl font-bold text-red-600">
                  {stats?.activeBloodRequests || 0}
                </div>
                <div className="text-xs text-red-700 mt-1">Active Requests</div>
                <div className="flex items-center justify-center mt-2">
                  <TrendingUp className="h-3 w-3 text-red-500 mr-1" />
                  <span className="text-xs text-red-600">Urgent</span>
                </div>
              </button>

              <button
                onClick={() =>
                  navigate({ to: "/dashboard/admin/blood-requests" })
                }
                className="text-center p-4 bg-blue-50 rounded-lg border border-blue-100 hover:bg-blue-100 transition-colors cursor-pointer"
              >
                <div className="text-2xl font-bold text-blue-600">
                  {stats?.totalBloodRequests || 0}
                </div>
                <div className="text-xs text-blue-700 mt-1">Total Requests</div>
                <div className="flex items-center justify-center mt-2">
                  <Activity className="h-3 w-3 text-blue-500 mr-1" />
                  <span className="text-xs text-blue-600">All Time</span>
                </div>
              </button>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">
                  Request Fulfillment Rate
                </span>
                <span className="text-sm font-bold text-green-600">
                  {stats?.totalBloodRequests
                    ? Math.round(
                        ((stats.totalBloodRequests -
                          stats.activeBloodRequests) /
                          stats.totalBloodRequests) *
                          100
                      )
                    : 0}
                  %
                </span>
              </div>
              <Progress
                value={
                  stats?.totalBloodRequests
                    ? ((stats.totalBloodRequests - stats.activeBloodRequests) /
                        stats.totalBloodRequests) *
                      100
                    : 0
                }
                className="h-2"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Blood Availability Section */}
      <Card className="bg-white shadow-even-md hover:shadow-even-lg transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary-magenta" />
            Blood Availability
          </CardTitle>
          <Badge variant="outline" className="text-xs">
            Current Inventory
          </Badge>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Total Blood Available */}
          <div className="text-center p-6 bg-gradient-to-br from-red-50 to-red-100 rounded-lg border border-red-200">
            <Heart className="h-12 w-12 text-red-600 mx-auto mb-3" />
            <div className="text-4xl font-bold text-red-700">
              {bloodInventory?.totalStats?.totalUnits || 0}
            </div>
            <div className="text-sm text-red-600 mt-1">
              Total Blood Units Available
            </div>
            <div className="text-xs text-gray-600 mt-2">
              From {bloodInventory?.totalStats?.totalHospitals || 0}{" "}
              hospitals/organizations
            </div>
          </div>

          {/* Blood Type Breakdown */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Blood Type Breakdown
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                {
                  type: "A+",
                  value: bloodInventory?.totalStats?.aPositive || 0,
                  color: "bg-red-500",
                },
                {
                  type: "A-",
                  value: bloodInventory?.totalStats?.aNegative || 0,
                  color: "bg-red-600",
                },
                {
                  type: "B+",
                  value: bloodInventory?.totalStats?.bPositive || 0,
                  color: "bg-blue-500",
                },
                {
                  type: "B-",
                  value: bloodInventory?.totalStats?.bNegative || 0,
                  color: "bg-blue-600",
                },
                {
                  type: "AB+",
                  value: bloodInventory?.totalStats?.abPositive || 0,
                  color: "bg-purple-500",
                },
                {
                  type: "AB-",
                  value: bloodInventory?.totalStats?.abNegative || 0,
                  color: "bg-purple-600",
                },
                {
                  type: "O+",
                  value: bloodInventory?.totalStats?.oPositive || 0,
                  color: "bg-green-500",
                },
                {
                  type: "O-",
                  value: bloodInventory?.totalStats?.oNegative || 0,
                  color: "bg-green-600",
                },
              ].map((bloodType) => (
                <div
                  key={bloodType.type}
                  className="text-center p-4 bg-gray-50 rounded-lg border hover:shadow-md transition-shadow"
                >
                  <Droplet className="h-6 w-6 mx-auto mb-2 text-red-500" />
                  <div className="text-2xl font-bold text-gray-900">
                    {bloodType.type}
                  </div>
                  <div className="text-lg font-semibold text-gray-700 mt-1">
                    {bloodType.value}
                  </div>
                  <div className="text-xs text-gray-500">units</div>
                  <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${bloodType.color} transition-all duration-300`}
                      style={{
                        width: `${Math.min((bloodType.value / Math.max(bloodInventory?.totalStats?.totalUnits || 1, 1)) * 100, 100)}%`,
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Hospital/Organization Selector */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Individual Hospital/Organization Inventory
            </h3>
            <Select
              onValueChange={(value) => {
                const selected = bloodInventory?.hospitalInventories?.find(
                  (h) => h.id === value
                );
                if (selected) {
                  // Show detailed inventory for selected hospital
                  setSelectedHospital(selected);
                }
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Hospital/Organization" />
              </SelectTrigger>
              <SelectContent>
                {bloodInventory?.hospitalInventories?.map((hospital) => (
                  <SelectItem key={hospital.id} value={hospital.id}>
                    {hospital.displayName} ({hospital.role})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Selected Hospital Details */}
          {selectedHospital && (
            <div className="space-y-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between">
                <h4 className="text-md font-semibold text-blue-900">
                  {selectedHospital.displayName}
                </h4>
                <Badge variant="outline" className="text-xs">
                  {selectedHospital.role}
                </Badge>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  {
                    type: "A+",
                    value: selectedHospital.aPositive,
                    color: "text-red-600",
                  },
                  {
                    type: "A-",
                    value: selectedHospital.aNegative,
                    color: "text-red-700",
                  },
                  {
                    type: "B+",
                    value: selectedHospital.bPositive,
                    color: "text-blue-600",
                  },
                  {
                    type: "B-",
                    value: selectedHospital.bNegative,
                    color: "text-blue-700",
                  },
                  {
                    type: "AB+",
                    value: selectedHospital.abPositive,
                    color: "text-purple-600",
                  },
                  {
                    type: "AB-",
                    value: selectedHospital.abNegative,
                    color: "text-purple-700",
                  },
                  {
                    type: "O+",
                    value: selectedHospital.oPositive,
                    color: "text-green-600",
                  },
                  {
                    type: "O-",
                    value: selectedHospital.oNegative,
                    color: "text-green-700",
                  },
                ].map((bloodType) => (
                  <div
                    key={bloodType.type}
                    className="text-center p-3 bg-white rounded border"
                  >
                    <div className="text-lg font-bold text-gray-900">
                      {bloodType.type}
                    </div>
                    <div className={`text-xl font-semibold ${bloodType.color}`}>
                      {bloodType.value}
                    </div>
                    <div className="text-xs text-gray-500">units</div>
                  </div>
                ))}
              </div>
              <div className="text-xs text-gray-600 mt-2">
                Last updated:{" "}
                {new Date(selectedHospital.lastUpdated).toLocaleDateString()}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* System Health & Activity */}
      <Card className="bg-white shadow-even-md hover:shadow-even-lg transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary-magenta" />
            System Health Dashboard
          </CardTitle>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <Badge
              variant="secondary"
              className="text-xs bg-green-100 text-green-700"
            >
              All Systems Operational
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <button
              onClick={() => navigate({ to: "/dashboard/admin/events" })}
              className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200 hover:from-purple-100 hover:to-purple-200 transition-all duration-200 hover:shadow-md cursor-pointer"
            >
              <Calendar className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <div className="text-xl font-bold text-purple-800">
                {stats?.totalEvents || 0}
              </div>
              <div className="text-xs text-purple-700">Events Hosted</div>
            </button>

            <button
              onClick={() => navigate({ to: "/dashboard/admin/users" })}
              className="text-center p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg border border-orange-200 hover:from-orange-100 hover:to-orange-200 transition-all duration-200 hover:shadow-md cursor-pointer"
            >
              <Building2 className="h-8 w-8 text-orange-600 mx-auto mb-2" />
              <div className="text-xl font-bold text-orange-800">
                {stats?.totalOrganizations || 0}
              </div>
              <div className="text-xs text-orange-700">Organizations</div>
            </button>

            <button
              onClick={() => navigate({ to: "/dashboard/admin/posts" })}
              className="text-center p-4 bg-gradient-to-br from-teal-50 to-teal-100 rounded-lg border border-teal-200 hover:from-teal-100 hover:to-teal-200 transition-all duration-200 hover:shadow-md cursor-pointer"
            >
              <FileText className="h-8 w-8 text-teal-600 mx-auto mb-2" />
              <div className="text-xl font-bold text-teal-800">
                {stats?.totalPosts || 0}
              </div>
              <div className="text-xs text-teal-700">Community Posts</div>
            </button>

            <button
              onClick={() => navigate({ to: "/dashboard/admin/users" })}
              className="text-center p-4 bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg border border-indigo-200 hover:from-indigo-100 hover:to-indigo-200 transition-all duration-200 hover:shadow-md cursor-pointer"
            >
              <Users className="h-8 w-8 text-indigo-600 mx-auto mb-2" />
              <div className="text-xl font-bold text-indigo-800">
                {stats?.recentUsers || 0}
              </div>
              <div className="text-xs text-indigo-700">Recent Users</div>
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
