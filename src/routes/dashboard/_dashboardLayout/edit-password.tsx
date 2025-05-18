import { createFileRoute, Link } from "@tanstack/react-router";
import { useAuth } from "@/hooks/useAuth";
import { LoadingState } from "@/components/common/LoadingState";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast, Toaster } from "react-hot-toast";
import { useNavigate } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard/_dashboardLayout/edit-password")({
  component: EditPasswordPage,
});

function EditPasswordPage() {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{
    currentPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
  }>({});
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear errors when field is modified
    setErrors(prev => ({
      ...prev,
      [name]: undefined
    }));
  };
  
  const validateForm = () => {
    const newErrors: typeof errors = {};
    
    if (!formData.currentPassword) {
      newErrors.currentPassword = "Current password is required";
    }
    
    if (!formData.newPassword) {
      newErrors.newPassword = "New password is required";
    } else if (formData.newPassword.length < 6) {
      newErrors.newPassword = "Password must be at least 6 characters long";
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your new password";
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords don't match";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    // Simulate password update API call
    try {
      // In a real application, this would be a call to your backend API
      // const response = await axios.post('http://localhost:5000/api/v1/user/change-password', {
      //   currentPassword: formData.currentPassword,
      //   newPassword: formData.newPassword
      // }, { withCredentials: true });
      
      // Simulate delay for API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast.success("Password updated successfully!");
      
      // Clear form
      setFormData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      });
      
      // Navigate back to profile page after delay
      setTimeout(() => {
        navigate({ to: "/dashboard/_dashboardLayout/profile" });
      }, 1500);
    } catch (error) {
      console.error("Error updating password:", error);
      toast.error("Failed to update password. Please check your current password and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (isLoading) {
    return <LoadingState />;
  }
  
  if (!user) {
    return (
      <div className="text-center p-8">
        <p className="text-red-500">You need to be logged in to change your password.</p>
        <Button className="mt-4" asChild>
          <Link to="/login">Go to Login</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4">
      <Toaster position="top-right" />
      
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h2 className="text-2xl font-bold mb-4">Change Password</h2>
        <p className="text-gray-600">
          Update your account password to maintain security.
        </p>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm">
        <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input
                id="currentPassword"
                name="currentPassword"
                type="password"
                value={formData.currentPassword}
                onChange={handleChange}
                placeholder="Enter your current password"
                className={errors.currentPassword ? "border-red-500" : ""}
              />
              {errors.currentPassword && (
                <p className="text-red-500 text-xs mt-1">{errors.currentPassword}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                name="newPassword"
                type="password"
                value={formData.newPassword}
                onChange={handleChange}
                placeholder="Enter your new password"
                className={errors.newPassword ? "border-red-500" : ""}
              />
              {errors.newPassword ? (
                <p className="text-red-500 text-xs mt-1">{errors.newPassword}</p>
              ) : (
                <p className="text-xs text-gray-500 mt-1">
                  Password must be at least 6 characters long
                </p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm your new password"
                className={errors.confirmPassword ? "border-red-500" : ""}
              />
              {errors.confirmPassword && (
                <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>
              )}
            </div>
          </div>
          
          <div className="pt-4">
            <Button 
              type="submit"
              className="w-full bg-primary-magenta hover:bg-primary-magenta/90"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Updating..." : "Update Password"}
            </Button>
          </div>
          
          <div className="text-center">
            <Button 
              variant="link" 
              className="text-gray-500 text-sm"
              onClick={() => navigate({ to: "/dashboard/_dashboardLayout/profile" })}
            >
              Cancel and return to profile
            </Button>
          </div>
        </form>
      </div>
      
      <div className="bg-amber-50 rounded-xl p-6 shadow-sm">
        <div className="flex gap-4 items-start">
          <div className="text-amber-500 text-lg">⚠️</div>
          <div>
            <h3 className="font-semibold text-amber-800">Password Security Tips</h3>
            <ul className="mt-2 space-y-1 text-sm text-amber-700">
              <li>• Use at least 8 characters with a mix of letters, numbers, and symbols</li>
              <li>• Avoid using personal information or common words</li>
              <li>• Don't reuse passwords from other websites</li>
              <li>• Change your password periodically for increased security</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
