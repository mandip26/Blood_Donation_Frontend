import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from "@/hooks/useAuth";
import LoadingState from "@/components/common/LoadingState";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

// Mock data for visualization
const BLOOD_GROUP_DATA = [
  { type: "A+", donations: 35, requests: 38, color: "#ef4444" },
  { type: "A-", donations: 12, requests: 14, color: "#f97316" },
  { type: "B+", donations: 28, requests: 32, color: "#3b82f6" },
  { type: "B-", donations: 8, requests: 10, color: "#06b6d4" },
  { type: "AB+", donations: 7, requests: 5, color: "#8b5cf6" },
  { type: "AB-", donations: 4, requests: 2, color: "#d946ef" },
  { type: "O+", donations: 42, requests: 45, color: "#10b981" },
  { type: "O-", donations: 14, requests: 18, color: "#14b8a6" },
];

export const Route = createFileRoute("/dashboard/_dashboardLayout/visualization")({
  component: VisualizationPage,
});

function VisualizationPage() {
  const { user, isLoading } = useAuth();
  const [data, setData] = useState(BLOOD_GROUP_DATA);
  const [loading, setLoading] = useState(true);
  const [timeFrame, setTimeFrame] = useState("monthly");

  useEffect(() => {
    // Simulate loading data based on time frame
    const fetchData = async () => {
      setLoading(true);
      // In a real app, we would fetch data from the API based on timeFrame
      // For now, just add some randomness
      
      await new Promise(resolve => setTimeout(resolve, 800)); // Simulate API delay
      
      const newData = BLOOD_GROUP_DATA.map(group => ({
        ...group,
        donations: group.donations * (timeFrame === "yearly" ? 12 : timeFrame === "weekly" ? 0.25 : 1) * (0.9 + Math.random() * 0.2),
        requests: group.requests * (timeFrame === "yearly" ? 12 : timeFrame === "weekly" ? 0.25 : 1) * (0.9 + Math.random() * 0.2),
      }));
      
      setData(newData);
      setLoading(false);
    };
    
    fetchData();
  }, [timeFrame]);

  if (isLoading) {
    return <LoadingState />;
  }

  // Calculate the highest value for scaling the bars
  const maxValue = Math.max(...data.flatMap(item => [item.donations, item.requests]));

  return (
    <div className="space-y-6 p-4">
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h2 className="text-2xl font-bold mb-4">Blood Donation Analytics</h2>
        <p className="text-gray-600">
          Visualize blood donation trends and demands across different blood groups.
        </p>
        
        <div className="mt-6 flex justify-end space-x-2">
          <Button 
            variant={timeFrame === "weekly" ? "default" : "outline"}
            onClick={() => setTimeFrame("weekly")}
            className={timeFrame === "weekly" ? "bg-primary-magenta" : ""}
          >
            Weekly
          </Button>
          <Button 
            variant={timeFrame === "monthly" ? "default" : "outline"}
            onClick={() => setTimeFrame("monthly")}
            className={timeFrame === "monthly" ? "bg-primary-magenta" : ""}
          >
            Monthly
          </Button>
          <Button 
            variant={timeFrame === "yearly" ? "default" : "outline"}
            onClick={() => setTimeFrame("yearly")}
            className={timeFrame === "yearly" ? "bg-primary-magenta" : ""}
          >
            Yearly
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-xl p-10 shadow-sm flex justify-center">
          <LoadingState />
        </div>
      ) : (
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="text-xl font-semibold mb-6">Blood Type Distribution</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            {/* Bar Chart */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-700">Donations vs Requests</h4>
              <div className="h-72 flex items-end justify-between gap-2">
                {data.map((group) => (
                  <div key={group.type} className="flex-1 flex flex-col items-center gap-2">
                    <div className="w-full flex flex-col items-center gap-1">
                      <div 
                        className="w-full bg-primary-magenta/20" 
                        style={{ 
                          height: `${(group.requests / maxValue) * 100}%`,
                          backgroundColor: `${group.color}40`
                        }}
                      ></div>
                      <div 
                        className="w-full" 
                        style={{ 
                          height: `${(group.donations / maxValue) * 100}%`,
                          backgroundColor: group.color
                        }}
                      ></div>
                    </div>
                    <span className="text-xs font-medium">{group.type}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-center gap-8 mt-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-primary-magenta"></div>
                  <span className="text-xs">Donations</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-primary-magenta/20"></div>
                  <span className="text-xs">Requests</span>
                </div>
              </div>
            </div>
            
            {/* Statistics */}
            <div>
              <h4 className="font-medium text-gray-700 mb-4">Blood Group Statistics</h4>
              <div className="space-y-3">
                {data.map((group) => {
                  const ratio = group.donations / (group.requests || 1);
                  let statusColor = "text-yellow-500";
                  let status = "Balanced";
                  
                  if (ratio < 0.7) {
                    statusColor = "text-red-500";
                    status = "Critical Shortage";
                  } else if (ratio < 0.9) {
                    statusColor = "text-orange-500";
                    status = "Shortage";
                  } else if (ratio > 1.2) {
                    statusColor = "text-green-500";
                    status = "Surplus";
                  }
                  
                  return (
                    <div key={group.type} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: group.color }}
                        ></div>
                        <span>{group.type}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-500">
                          {Math.round(group.donations)} / {Math.round(group.requests)}
                        </span>
                        <span className={`text-sm font-medium ${statusColor}`}>
                          {status}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-700 mb-2">Summary</h4>
                <p className="text-sm text-gray-600">
                  For the {timeFrame} period, there {timeFrame === "monthly" ? "is" : "are"} a total of {" "}
                  <span className="font-medium">{Math.round(data.reduce((sum, item) => sum + item.donations, 0))}</span> donations and {" "}
                  <span className="font-medium">{Math.round(data.reduce((sum, item) => sum + item.requests, 0))}</span> requests.
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  {(() => {
                    const totalDonations = data.reduce((sum, item) => sum + item.donations, 0);
                    const totalRequests = data.reduce((sum, item) => sum + item.requests, 0);
                    const ratio = totalDonations / totalRequests;
                    
                    if (ratio < 0.8) {
                      return "There is a significant blood shortage. More donations are urgently needed.";
                    } else if (ratio < 1) {
                      return "There is a slight blood shortage. More donations would be beneficial.";
                    } else if (ratio < 1.2) {
                      return "Blood supply is currently balanced.";
                    } else {
                      return "There is a healthy surplus of blood supply.";
                    }
                  })()}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="text-xl font-semibold mb-4">Donation Trends</h3>
          <p className="text-gray-600">
            Blood donation trends have been {timeFrame === "yearly" ? "increasing steadily" : 
            timeFrame === "monthly" ? "fluctuating seasonally" : "varying weekly"} with the 
            highest demand for O+ and A+ blood types.
          </p>
          <div className="mt-4">
            <Button className="bg-primary-magenta">View Detailed Report</Button>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="text-xl font-semibold mb-4">Blood Bank Status</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Critical Types</span>
              <span className="font-medium">O-, AB-</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Well-Stocked Types</span>
              <span className="font-medium">A+, O+</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Last Updated</span>
              <span className="font-medium">{new Date().toLocaleDateString()}</span>
            </div>
          </div>
          <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
            <p className="text-yellow-800 text-sm">
              <strong>Note:</strong> Blood types O- and AB- are particularly important as O- is a universal donor 
              and AB- is a rare blood type.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
