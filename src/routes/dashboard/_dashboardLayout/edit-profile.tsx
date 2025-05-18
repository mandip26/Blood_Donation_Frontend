import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from "@/hooks/useAuth";
import { LoadingState } from "@/components/common/LoadingState";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast, Toaster } from "react-hot-toast";
import { useNavigate, Link } from "@tanstack/react-router";
import axios from "axios";

interface ProfileForm {
  name?: string;
  organisationName?: string;
  hospitalName?: string;
  email: string;
  phone: string;
  addhar?: string;
  organisationId?: string;
  hospitalId?: string;
  bio?: string;
  skills?: string[];
  profilePhoto?: File | null;
}

export const Route = createFileRoute("/dashboard/_dashboardLayout/edit-profile")({
  component: EditProfilePage,
});

function EditProfilePage() {
  const { user, isLoading, reloadUser } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState<ProfileForm>({
    name: "",
    organisationName: "",
    hospitalName: "",
    email: "",
    phone: "",
    addhar: "",
    organisationId: "",
    hospitalId: "",
    bio: "",
    skills: [],
    profilePhoto: null
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        organisationName: user.organisationName || "",
        hospitalName: user.hospitalName || "",
        email: user.email || "",
        phone: user.phone || "",
        addhar: user.addhar || "",
        organisationId: user.organisationId || "",
        hospitalId: user.hospitalId || "",
        bio: user.profile?.bio || "",
        skills: user.profile?.skills || [],
        profilePhoto: null
      });
      
      if (user.profile?.profilePhoto) {
        setPhotoPreview(user.profile.profilePhoto);
      }
    }
  }, [user]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSkillsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const skills = e.target.value
      .split(',')
      .map(skill => skill.trim())
      .filter(Boolean);
    setFormData(prev => ({
      ...prev,
      skills
    }));
  };
  
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Check file size (limit to 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image file is too large. Please select an image smaller than 5MB.");
      return;
    }
    
    // Check file type
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      toast.error("Please select a valid image file (JPEG, PNG, or WebP).");
      return;
    }
    
    // Create preview URL
    const reader = new FileReader();
    reader.onload = (e) => {
      setPhotoPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
    
    setFormData(prev => ({
      ...prev,
      profilePhoto: file
    }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Create FormData for file upload
      const formDataToSend = new FormData();
      
      // Add text fields based on user role
      if (user?.role === "user" || user?.role === "admin") {
        if (formData.name) formDataToSend.append('name', formData.name);
      }
      if (user?.role === "organisation") {
        if (formData.organisationName) formDataToSend.append('organisationName', formData.organisationName);
      }
      if (user?.role === "hospital") {
        if (formData.hospitalName) formDataToSend.append('hospitalName', formData.hospitalName);
      }
      
      // Common fields
      formDataToSend.append('email', formData.email);
      formDataToSend.append('phone', formData.phone);
      
      // Role-specific fields
      if (user?.role === "user" && formData.addhar) {
        formDataToSend.append('addhar', formData.addhar);
      }
      if (user?.role === "organisation" && formData.organisationId) {
        formDataToSend.append('organisationId', formData.organisationId);
      }
      if (user?.role === "hospital" && formData.hospitalId) {
        formDataToSend.append('hospitalId', formData.hospitalId);
      }
      
      // Profile fields
      if (formData.bio) formDataToSend.append('bio', formData.bio);
      if (formData.skills?.length) formDataToSend.append('skills', JSON.stringify(formData.skills));
      
      // Add profile photo if changed
      if (formData.profilePhoto) {
        formDataToSend.append('profilePhoto', formData.profilePhoto);
      }
      
      // Simulate API call - in a real app, this would be a call to your backend API
      // const response = await axios.put('http://localhost:5000/api/v1/user/profile/update', formDataToSend, {
      //   withCredentials: true,
      //   headers: {
      //     'Content-Type': 'multipart/form-data'
      //   }
      // });
      
      // Simulate delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast.success("Profile updated successfully!");
      
      // Reload user data to reflect changes
      await reloadUser();
      
      // Navigate back to profile page
      setTimeout(() => {
        navigate({ to: "/dashboard/_dashboardLayout/profile" });
      }, 1000);
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile. Please try again.");
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
        <p className="text-red-500">You need to be logged in to edit your profile.</p>
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
        <h2 className="text-2xl font-bold mb-4">Edit Profile</h2>
        <p className="text-gray-600">
          Update your personal information and profile settings.
        </p>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            <div className="w-full md:w-32">
              <div className="aspect-square rounded-full overflow-hidden bg-gray-100 border border-gray-200">
                {photoPreview ? (
                  <img
                    src={photoPreview}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-50 text-gray-400">
                    No Image
                  </div>
                )}
              </div>
              <input
                type="file"
                id="profilePhoto"
                name="profilePhoto"
                onChange={handlePhotoChange}
                className="hidden"
                accept="image/jpeg,image/png,image/webp"
              />
              <Label
                htmlFor="profilePhoto"
                className="block mt-4 text-center py-2 px-4 border border-gray-300 rounded-md hover:bg-gray-50 cursor-pointer"
              >
                Upload Photo
              </Label>
              <p className="text-xs text-center text-gray-500 mt-2">
                JPEG, PNG or WebP, max 5MB
              </p>
            </div>
            
            <div className="flex-1 w-full">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Role-specific name field */}
                {(user.role === "user" || user.role === "admin") && (
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Your full name"
                    />
                  </div>
                )}
                
                {user.role === "organisation" && (
                  <div className="space-y-2">
                    <Label htmlFor="organisationName">Organization Name</Label>
                    <Input
                      id="organisationName"
                      name="organisationName"
                      type="text"
                      value={formData.organisationName}
                      onChange={handleChange}
                      placeholder="Organization name"
                    />
                  </div>
                )}
                
                {user.role === "hospital" && (
                  <div className="space-y-2">
                    <Label htmlFor="hospitalName">Hospital Name</Label>
                    <Input
                      id="hospitalName"
                      name="hospitalName"
                      type="text"
                      value={formData.hospitalName}
                      onChange={handleChange}
                      placeholder="Hospital name"
                    />
                  </div>
                )}
                
                {/* Common fields */}
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Your email address"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="text"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Your phone number"
                  />
                </div>
                
                {/* Role-specific ID fields */}
                {user.role === "user" && (
                  <div className="space-y-2">
                    <Label htmlFor="addhar">Aadhaar Number</Label>
                    <Input
                      id="addhar"
                      name="addhar"
                      type="text"
                      value={formData.addhar}
                      onChange={handleChange}
                      placeholder="Your Aadhaar number"
                      maxLength={12}
                    />
                  </div>
                )}
                
                {user.role === "organisation" && (
                  <div className="space-y-2">
                    <Label htmlFor="organisationId">Organization ID</Label>
                    <Input
                      id="organisationId"
                      name="organisationId"
                      type="text"
                      value={formData.organisationId}
                      onChange={handleChange}
                      placeholder="Organization ID"
                    />
                  </div>
                )}
                
                {user.role === "hospital" && (
                  <div className="space-y-2">
                    <Label htmlFor="hospitalId">Hospital ID</Label>
                    <Input
                      id="hospitalId"
                      name="hospitalId"
                      type="text"
                      value={formData.hospitalId}
                      onChange={handleChange}
                      placeholder="Hospital ID"
                    />
                  </div>
                )}
              </div>
              
              <div className="mt-6 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <textarea
                    id="bio"
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    placeholder="Tell us about yourself or your organization"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-magenta h-32"
                  />
                </div>
                
                {(user.role === "hospital" || user.role === "organisation") && (
                  <div className="space-y-2">
                    <Label htmlFor="skills">
                      {user.role === "hospital" ? "Services Offered" : "Areas of Expertise"}
                    </Label>
                    <Input
                      id="skills"
                      type="text"
                      value={formData.skills?.join(", ") || ""}
                      onChange={handleSkillsChange}
                      placeholder="Enter comma-separated values"
                    />
                    <p className="text-xs text-gray-500">
                      Enter values separated by commas, e.g., Blood Testing, Donation, Awareness Programs
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex gap-4 justify-end mt-8">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate({ to: "/dashboard/_dashboardLayout/profile" })}
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              className="bg-primary-magenta hover:bg-primary-magenta/90"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
