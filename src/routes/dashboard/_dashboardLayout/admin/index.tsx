import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users,
  Building,
  Building2,
  Calendar,
  Heart,
  FileText,
  Activity,
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

export const Route = createFileRoute("/dashboard/_dashboardLayout/admin/")({
  component: AdminDashboard,
});

function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
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

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-white shadow-even-md hover:shadow-even-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Users
            </CardTitle>
            <Users className="h-4 w-4 text-primary-magenta" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {stats?.totalUsers || 0}
            </div>
            <p className="text-xs text-gray-500">
              +{stats?.recentUsers || 0} in last 30 days
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-even-md hover:shadow-even-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Hospitals
            </CardTitle>
            <Building className="h-4 w-4 text-primary-magenta" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {stats?.totalHospitals || 0}
            </div>
            <p className="text-xs text-gray-500">Registered hospitals</p>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-even-md hover:shadow-even-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Organizations
            </CardTitle>
            <Building2 className="h-4 w-4 text-primary-magenta" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {stats?.totalOrganizations || 0}
            </div>
            <p className="text-xs text-gray-500">Active organizations</p>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-even-md hover:shadow-even-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Blood Donors
            </CardTitle>
            <Heart className="h-4 w-4 text-primary-magenta" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {stats?.totalDonors || 0}
            </div>
            <p className="text-xs text-gray-500">Registered donors</p>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-even-md hover:shadow-even-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Events
            </CardTitle>
            <Calendar className="h-4 w-4 text-primary-magenta" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {stats?.totalEvents || 0}
            </div>
            <p className="text-xs text-gray-500">Total events created</p>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-even-md hover:shadow-even-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Blood Requests
            </CardTitle>
            <Activity className="h-4 w-4 text-primary-magenta" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {stats?.totalBloodRequests || 0}
            </div>
            <p className="text-xs text-gray-500">
              {stats?.activeBloodRequests || 0} active requests
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-even-md hover:shadow-even-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Posts
            </CardTitle>
            <FileText className="h-4 w-4 text-primary-magenta" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {stats?.totalPosts || 0}
            </div>
            <p className="text-xs text-gray-500">Community posts</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-white shadow-even-md">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900">
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <button className="w-full text-left p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
              <div className="font-medium text-gray-900">Manage Users</div>
              <div className="text-sm text-gray-600">
                View and manage user accounts
              </div>
            </button>
            <button className="w-full text-left p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
              <div className="font-medium text-gray-900">Review Events</div>
              <div className="text-sm text-gray-600">
                Approve or reject events
              </div>
            </button>
            <button className="w-full text-left p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
              <div className="font-medium text-gray-900">Monitor Requests</div>
              <div className="text-sm text-gray-600">
                Track blood requests status
              </div>
            </button>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-even-md">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900">
              System Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">System Health</span>
              <span className="flex items-center text-green-600">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                Online
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Active Sessions</span>
              <span className="text-gray-900 font-medium">
                {stats?.recentUsers || 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Urgent Requests</span>
              <span className="text-red-600 font-medium">
                {stats?.activeBloodRequests || 0}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
