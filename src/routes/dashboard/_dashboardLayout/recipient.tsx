import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from "@/hooks/useAuth";
import { LoadingState } from "@/components/common/LoadingState";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast, Toaster } from "react-hot-toast";

interface BloodRequestForm {
  bloodType: string;
  quantity: string;
  urgency: string;
  patientName: string;
  patientAge: string;
  hospital: string;
  contactName: string;
  contactPhone: string;
  reason: string;
}

export const Route = createFileRoute("/dashboard/_dashboardLayout/recipient")({
  component: RecipientPage,
});

function RecipientPage() {
  const { user, isLoading } = useAuth();
  const [formData, setFormData] = useState<BloodRequestForm>({
    bloodType: "",
    quantity: "",
    urgency: "normal",
    patientName: "",
    patientAge: "",
    hospital: user?.role === "hospital" ? (user?.hospitalName || "") : "",
    contactName: user?.name || "",
    contactPhone: user?.phone || "",
    reason: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Mock data for recent requests
  const [recentRequests, setRecentRequests] = useState([
    {
      id: "REQ001",
      bloodType: "O+",
      quantity: "500ml",
      date: "2025-05-14",
      status: "fulfilled"
    },
    {
      id: "REQ002",
      bloodType: "AB-",
      quantity: "350ml",
      date: "2025-05-16",
      status: "pending"
    },
    {
      id: "REQ003",
      bloodType: "B+",
      quantity: "450ml",
      date: "2025-05-17",
      status: "pending"
    }
  ]);

  const bloodTypes = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
  const urgencyLevels = [
    { value: "emergency", label: "Emergency (Within hours)" },
    { value: "urgent", label: "Urgent (Within 24 hours)" },
    { value: "normal", label: "Normal (Within a week)" }
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Validate form
    if (!formData.bloodType || !formData.quantity || !formData.patientName || !formData.hospital) {
      toast.error("Please fill out all required fields");
      setIsSubmitting(false);
      return;
    }
    
    // Simulate API call to submit blood request
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Add the new request to recent requests
      const newRequest = {
        id: `REQ${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
        bloodType: formData.bloodType,
        quantity: `${formData.quantity}ml`,
        date: new Date().toISOString().split('T')[0],
        status: "pending"
      };
      
      setRecentRequests(prev => [newRequest, ...prev]);
      
      toast.success("Blood request submitted successfully!");
      
      // Partially reset form
      setFormData(prev => ({
        ...prev,
        bloodType: "",
        quantity: "",
        urgency: "normal",
        patientName: "",
        patientAge: "",
        reason: ""
      }));
    } catch (error) {
      console.error("Error submitting request:", error);
      toast.error("Failed to submit request. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <LoadingState />;
  }

  return (
    <div className="space-y-6 p-4">
      <Toaster position="top-right" />
      
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h2 className="text-2xl font-bold mb-4">Blood Recipient Management</h2>
        <p className="text-gray-600">
          Request blood for patients in need. Fill out the form below to submit a new blood request.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="text-xl font-semibold mb-6">New Blood Request</h3>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="bloodType">
                    Blood Type <span className="text-red-500">*</span>
                  </Label>
                  <select
                    id="bloodType"
                    name="bloodType"
                    value={formData.bloodType}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-magenta"
                  >
                    <option value="">Select Blood Type</option>
                    {bloodTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="quantity">
                    Quantity (ml) <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="quantity"
                    name="quantity"
                    type="number"
                    value={formData.quantity}
                    onChange={handleChange}
                    required
                    min="1"
                    placeholder="e.g., 450"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="urgency">Urgency Level</Label>
                  <select
                    id="urgency"
                    name="urgency"
                    value={formData.urgency}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-magenta"
                  >
                    {urgencyLevels.map(level => (
                      <option key={level.value} value={level.value}>{level.label}</option>
                    ))}
                  </select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="patientName">
                    Patient Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="patientName"
                    name="patientName"
                    type="text"
                    value={formData.patientName}
                    onChange={handleChange}
                    required
                    placeholder="Full name of the patient"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="patientAge">Patient Age</Label>
                  <Input
                    id="patientAge"
                    name="patientAge"
                    type="number"
                    value={formData.patientAge}
                    onChange={handleChange}
                    min="0"
                    max="120"
                    placeholder="Age in years"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="hospital">
                    Hospital <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="hospital"
                    name="hospital"
                    type="text"
                    value={formData.hospital}
                    onChange={handleChange}
                    required
                    placeholder="Hospital where blood is needed"
                    readOnly={user?.role === "hospital"}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="contactName">Contact Person</Label>
                  <Input
                    id="contactName"
                    name="contactName"
                    type="text"
                    value={formData.contactName}
                    onChange={handleChange}
                    placeholder="Name of contact person"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="contactPhone">Contact Phone</Label>
                  <Input
                    id="contactPhone"
                    name="contactPhone"
                    type="tel"
                    value={formData.contactPhone}
                    onChange={handleChange}
                    placeholder="Phone number"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reason">Reason for Request</Label>
                <textarea
                  id="reason"
                  name="reason"
                  value={formData.reason}
                  onChange={handleChange}
                  placeholder="Please provide details about why the blood is needed"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-magenta h-32"
                />
              </div>

              <Button 
                type="submit"
                disabled={isSubmitting}
                className="bg-primary-magenta hover:bg-primary-magenta/90"
              >
                {isSubmitting ? "Submitting..." : "Submit Blood Request"}
              </Button>
            </form>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="text-xl font-semibold mb-6">Recent Requests</h3>
          
          {recentRequests.length === 0 ? (
            <p className="text-gray-500">No recent requests found.</p>
          ) : (
            <div className="space-y-4">
              {recentRequests.map(request => (
                <div 
                  key={request.id}
                  className="border border-gray-100 rounded-lg p-4 hover:bg-gray-50"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium">Request #{request.id}</h4>
                    <span 
                      className={`px-2 py-1 text-xs rounded-full ${
                        request.status === "fulfilled" 
                          ? "bg-green-100 text-green-800" 
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-gray-500">Blood Type</p>
                      <p className="font-medium">{request.bloodType}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Quantity</p>
                      <p className="font-medium">{request.quantity}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-gray-500">Date</p>
                      <p className="font-medium">{new Date(request.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full mt-3"
                  >
                    View Details
                  </Button>
                </div>
              ))}
            </div>
          )}
          
          <div className="mt-6 pt-4 border-t border-gray-100">
            <h4 className="font-medium text-gray-700 mb-3">Need to Know</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <div className="min-w-4 pt-0.5">•</div>
                <div>
                  Emergency requests are prioritized and processed within hours
                </div>
              </li>
              <li className="flex items-start gap-2">
                <div className="min-w-4 pt-0.5">•</div>
                <div>
                  All requests require verification by hospital staff
                </div>
              </li>
              <li className="flex items-start gap-2">
                <div className="min-w-4 pt-0.5">•</div>
                <div>
                  You'll receive notifications as your request status changes
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
