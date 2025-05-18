import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import { LoadingState } from "@/components/common/LoadingState";

// Define types for our data
interface DashboardStats {
  totalDonations?: number;
  upcomingEvents?: number;
  pendingRequests?: number;
}

export const Route = createFileRoute("/dashboard/")({
  component: DashboardIndex,
});

function DashboardIndex() {
  const { user, isLoading } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({});
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    // Function to fetch dashboard stats
    const fetchDashboardStats = async () => {
      try {
        setStatsLoading(true);
        // This would be replaced with actual API calls
        // For now using mock data
        setTimeout(() => {
          setStats({
            totalDonations: 5,
            upcomingEvents: 2,
            pendingRequests: 1
          });
          setStatsLoading(false);
        }, 1000);
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
        setStatsLoading(false);
      }
    };

    if (user) {
      fetchDashboardStats();
    }
  }, [user]);

  if (isLoading || statsLoading) {
    return <LoadingState />;
  }

  return (
    <div className="space-y-6 p-4">
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h2 className="text-2xl font-bold mb-4">Welcome, {user?.name || user?.hospitalName || user?.organisationName || "User"}</h2>
        <p className="text-gray-600">
          This is your blood donation management dashboard. Here you can track your donations, find events, and more.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h3 className="text-lg font-medium text-gray-700">Total Donations</h3>
          <p className="text-3xl font-bold text-primary-magenta mt-2">{stats.totalDonations || 0}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h3 className="text-lg font-medium text-gray-700">Upcoming Events</h3>
          <p className="text-3xl font-bold text-primary-magenta mt-2">{stats.upcomingEvents || 0}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h3 className="text-lg font-medium text-gray-700">Pending Requests</h3>
          <p className="text-3xl font-bold text-primary-magenta mt-2">{stats.pendingRequests || 0}</p>
        </div>
      </div>
    </div>
  );
}
