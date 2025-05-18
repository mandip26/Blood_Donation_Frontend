import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from "@/hooks/useAuth";
import { LoadingState } from "@/components/common/LoadingState";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast, Toaster } from "react-hot-toast";

// Mock data for donation history
const MOCK_DONATION_HISTORY = [
  {
    id: "DON001",
    donorName: "Rahul Sharma",
    donorId: "DON12345",
    bloodType: "O+",
    quantity: "450ml",
    date: "2025-05-01",
    status: "completed"
  },
  {
    id: "DON002",
    donorName: "Priya Singh",
    donorId: "DON12346",
    bloodType: "A-",
    quantity: "450ml",
    date: "2025-05-03",
    status: "completed"
  },
  {
    id: "DON003",
    donorName: "Mohammad Khan",
    donorId: "DON12347",
    bloodType: "B+",
    quantity: "450ml",
    date: "2025-05-05",
    status: "completed"
  },
  {
    id: "DON004",
    donorName: "Sneha Patel",
    donorId: "DON12348",
    bloodType: "AB+",
    quantity: "450ml",
    date: "2025-05-07",
    status: "processing"
  },
  {
    id: "DON005",
    donorName: "Rajesh Kumar",
    donorId: "DON12349",
    bloodType: "O-",
    quantity: "450ml",
    date: "2025-05-10",
    status: "scheduled"
  }
];

export const Route = createFileRoute("/dashboard/_dashboardLayout/hospital-history")({
  component: HospitalHistoryPage,
});

function HospitalHistoryPage() {
  const { user, isLoading } = useAuth();
  const [donationHistory, setDonationHistory] = useState(MOCK_DONATION_HISTORY);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState("all");
  
  useEffect(() => {
    // Simulate loading data
    const fetchDonationHistory = async () => {
      setLoading(true);
      // In a real app, we would fetch data from the API
      await new Promise(resolve => setTimeout(resolve, 800));
      setDonationHistory(MOCK_DONATION_HISTORY);
      setLoading(false);
    };
    
    fetchDonationHistory();
  }, []);

  // Filter and search functionality
  const filteredHistory = donationHistory.filter(donation => {
    // Apply status filter
    if (filter !== 'all' && donation.status !== filter) {
      return false;
    }
    
    // Apply search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        donation.donorName.toLowerCase().includes(query) ||
        donation.donorId.toLowerCase().includes(query) ||
        donation.bloodType.toLowerCase().includes(query) ||
        donation.id.toLowerCase().includes(query)
      );
    }
    
    return true;
  });
  
  if (isLoading || loading) {
    return <LoadingState />;
  }
  
  // Check if user is a hospital
  if (user?.role !== "hospital") {
    return (
      <div className="p-8 text-center bg-white rounded-xl shadow-sm">
        <h3 className="text-xl font-semibold mb-4">Access Restricted</h3>
        <p className="text-gray-600">
          This page is only accessible to hospital accounts. Please contact an administrator if you need access.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4">
      <Toaster position="top-right" />
      
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h2 className="text-2xl font-bold mb-4">Donation History</h2>
        <p className="text-gray-600">
          Track and manage blood donations received at your hospital.
        </p>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex-1">
            <Input
              type="text"
              placeholder="Search by donor name, ID, or blood type..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />
          </div>
          
          <div className="flex items-center gap-4">
            <Label htmlFor="filter" className="whitespace-nowrap">Filter by status:</Label>
            <select
              id="filter"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-magenta"
            >
              <option value="all">All</option>
              <option value="scheduled">Scheduled</option>
              <option value="processing">Processing</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>
        
        {filteredHistory.length === 0 ? (
          <div className="text-center p-8 bg-gray-50 rounded-lg">
            <p className="text-gray-500">No donation records found matching your criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Donation ID
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Donor
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Blood Type
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredHistory.map((donation) => (
                  <tr key={donation.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {donation.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{donation.donorName}</div>
                      <div className="text-xs text-gray-500">{donation.donorId}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span className="px-3 py-1 rounded-full text-sm font-semibold bg-blue-100 text-blue-800">
                        {donation.bloodType}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {donation.quantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(donation.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        donation.status === "completed" 
                          ? "bg-green-100 text-green-800" 
                          : donation.status === "processing"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-blue-100 text-blue-800"
                      }`}>
                        {donation.status.charAt(0).toUpperCase() + donation.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button className="text-primary-magenta hover:text-primary-magenta/80 font-medium">
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Donation Statistics</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Donations</span>
              <span className="font-medium">{donationHistory.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">This Month</span>
              <span className="font-medium">{donationHistory.filter(d => new Date(d.date).getMonth() === new Date().getMonth()).length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Pending Processing</span>
              <span className="font-medium">{donationHistory.filter(d => d.status === "processing").length}</span>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Blood Stock</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                <div className="bg-red-500 h-full rounded-full" style={{ width: '75%' }}></div>
              </div>
              <span className="text-sm whitespace-nowrap">O+ (75%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                <div className="bg-red-500 h-full rounded-full" style={{ width: '45%' }}></div>
              </div>
              <span className="text-sm whitespace-nowrap">A+ (45%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                <div className="bg-red-500 h-full rounded-full" style={{ width: '30%' }}></div>
              </div>
              <span className="text-sm whitespace-nowrap">B+ (30%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                <div className="bg-red-500 h-full rounded-full" style={{ width: '15%' }}></div>
              </div>
              <span className="text-sm whitespace-nowrap">O- (15%)</span>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <Button className="w-full bg-primary-magenta">Schedule New Donation</Button>
            <Button className="w-full" variant="outline">Generate Report</Button>
            <Button className="w-full" variant="outline">Blood Request Form</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
