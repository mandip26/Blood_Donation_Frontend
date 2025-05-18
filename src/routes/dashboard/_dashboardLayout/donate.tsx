import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast, Toaster } from "react-hot-toast";

// Define donation form type
interface DonationForm {
  bloodType: string;
  quantity: string;
  date: string;
  location: string;
  notes: string;
}

export const Route = createFileRoute("/dashboard/_dashboardLayout/donate")({
  component: DonatePage,
});

function DonatePage() {
  const { user } = useAuth();
  const [formData, setFormData] = useState<DonationForm>({
    bloodType: "",
    quantity: "",
    date: "",
    location: "",
    notes: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const bloodTypes = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

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
    
    // Since we don't have a backend endpoint for donations yet, we'll simulate a submission
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock successful submission
      toast.success("Donation record submitted successfully!");
      
      // Reset form
      setFormData({
        bloodType: "",
        quantity: "",
        date: "",
        location: "",
        notes: ""
      });
    } catch (error) {
      console.error("Error submitting donation:", error);
      toast.error("Failed to submit donation. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 p-4">
      <Toaster position="top-right" />
      
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h2 className="text-2xl font-bold mb-4">Record Blood Donation</h2>
        <p className="text-gray-600">
          Use this form to record your blood donation details. This helps keep track of your donation history.
        </p>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="bloodType">Blood Type</Label>
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
              <Label htmlFor="quantity">Quantity (ml)</Label>
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
              <Label htmlFor="date">Date of Donation</Label>
              <Input
                id="date"
                name="date"
                type="date"
                value={formData.date}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Donation Location</Label>
              <Input
                id="location"
                name="location"
                type="text"
                value={formData.location}
                onChange={handleChange}
                required
                placeholder="e.g., City Hospital Blood Bank"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes</Label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Any additional information about your donation"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-magenta h-32"
            />
          </div>

          <Button 
            type="submit"
            disabled={isSubmitting}
            className="w-full md:w-auto"
          >
            {isSubmitting ? "Submitting..." : "Record Donation"}
          </Button>
        </form>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h3 className="text-xl font-semibold mb-4">Why Donate Blood?</h3>
        <div className="space-y-4">
          <p className="text-gray-600">
            Blood donation is a lifesaving act that helps patients undergoing surgeries, 
            those with blood disorders, and individuals who have experienced traumatic injuries.
          </p>
          <p className="text-gray-600">
            A single donation can save up to three lives, and the entire process takes less than an hour.
          </p>
          <div className="bg-primary-magenta/10 p-4 rounded-lg mt-4">
            <p className="text-primary-magenta font-medium">
              Remember to stay hydrated before donating and eat a healthy meal.
              Rest after donation and avoid strenuous activities for 24 hours.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
