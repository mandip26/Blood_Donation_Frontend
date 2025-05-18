import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from "@/hooks/useAuth";
import { LoadingState } from "@/components/common/LoadingState";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/dashboard/_dashboardLayout/profile")({
  component: ProfilePage,
});

// Helper function to get initials from name
const getInitials = (name: string) => {
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
};

function ProfilePage() {
  const { user, isLoading } = useAuth();
  const [donationCount, setDonationCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching user's donation count
    const fetchDonationCount = async () => {
      try {
        // This would be an actual API call in production
        // For now, using a timeout to simulate loading
        await new Promise(resolve => setTimeout(resolve, 1000));
        setDonationCount(Math.floor(Math.random() * 10)); // Random number for demo
        setLoading(false);
      } catch (error) {
        console.error("Error fetching donation count:", error);
        setLoading(false);
      }
    };

    if (user) {
      fetchDonationCount();
    }
  }, [user]);

  if (isLoading || loading) {
    return <LoadingState />;
  }

  if (!user) {
    return (
      <div className="text-center p-8">
        <p className="text-gray-600">User not found. Please log in.</p>
        <Button className="mt-4" asChild>
          <Link to="/login">Go to Login</Link>
        </Button>
      </div>
    );
  }

  // Determine the display name based on user role
  const displayName = user.name || user.hospitalName || user.organisationName || "User";
  
  // Determine role-specific information
  const getRoleInfo = () => {
    switch (user.role) {
      case "user":
        return {
          roleLabel: "Blood Donor",
          idType: "Aadhaar ID",
          idValue: user.addhar || "Not provided"
        };
      case "hospital":
        return {
          roleLabel: "Hospital",
          idType: "Hospital ID",
          idValue: user.hospitalId || "Not provided"
        };
      case "organisation":
        return {
          roleLabel: "Organization",
          idType: "Organization ID",
          idValue: user.organisationId || "Not provided"
        };
      case "admin":
        return {
          roleLabel: "Administrator",
          idType: "Admin ID",
          idValue: "ADMIN-" + (user.id?.substring(0, 6).toUpperCase() || "")
        };
      default:
        return {
          roleLabel: "Member",
          idType: "ID",
          idValue: "Not available"
        };
    }
  };

  const roleInfo = getRoleInfo();

  return (
    <div className="space-y-6 p-4">
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <Avatar className="w-24 h-24">
            <AvatarImage src={user.profile?.profilePhoto || ""} alt={displayName} />
            <AvatarFallback className="text-xl bg-primary-magenta text-white">
              {getInitials(displayName)}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 text-center sm:text-left">
            <h2 className="text-2xl font-bold text-gray-800">{displayName}</h2>
            <p className="text-gray-500 mt-1">{roleInfo.roleLabel}</p>
            
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium">{user.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Phone</p>
                <p className="font-medium">{user.phone || "Not provided"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">{roleInfo.idType}</p>
                <p className="font-medium">{roleInfo.idValue}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Member Since</p>
                <p className="font-medium">
                  {user.createdAt 
                    ? new Date(user.createdAt).toLocaleDateString() 
                    : "Unknown"}
                </p>
              </div>
            </div>
            
            <div className="mt-6 flex flex-wrap gap-3 justify-center sm:justify-start">
              <Button asChild className="bg-primary-magenta hover:bg-primary-magenta/90">
                <Link to="/dashboard/_dashboardLayout/edit-profile">Edit Profile</Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/dashboard/_dashboardLayout/edit-password">Change Password</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {user.role === "user" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="text-xl font-semibold mb-4">Donation Stats</h3>
            <div className="flex items-center gap-4">
              <div className="bg-primary-magenta/10 p-4 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary-magenta" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2L8 6H6a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V8a2 2 0 00-2-2h-2l-4-4z" />
                  <line x1="12" y1="11" x2="12" y2="17" />
                  <line x1="9" y1="14" x2="15" y2="14" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Donations</p>
                <p className="text-2xl font-bold">{donationCount}</p>
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t">
              <h4 className="font-medium mb-2">Next Eligible Donation Date</h4>
              <p className="text-primary-magenta">
                {new Date(Date.now() + 86400000 * 90).toLocaleDateString()}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                You can donate whole blood every 90 days
              </p>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="text-xl font-semibold mb-4">My Badges</h3>
            {donationCount > 0 ? (
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-amber-50 p-4 rounded-lg flex flex-col items-center">
                  <div className="text-amber-500 text-2xl mb-2">🌟</div>
                  <p className="font-medium text-center">First Donation</p>
                </div>
                {donationCount >= 3 && (
                  <div className="bg-sky-50 p-4 rounded-lg flex flex-col items-center">
                    <div className="text-sky-500 text-2xl mb-2">🌊</div>
                    <p className="font-medium text-center">Regular Donor</p>
                  </div>
                )}
                {donationCount >= 5 && (
                  <div className="bg-emerald-50 p-4 rounded-lg flex flex-col items-center">
                    <div className="text-emerald-500 text-2xl mb-2">🌱</div>
                    <p className="font-medium text-center">Life Saver</p>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-gray-500">Make your first donation to earn badges!</p>
            )}
          </div>
        </div>
      )}
      
      {(user.role === "hospital" || user.role === "organisation") && (
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="text-xl font-semibold mb-4">Organization Details</h3>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500">Bio</p>
              <p>{user.profile?.bio || "No bio information available."}</p>
            </div>
            {user.role === "hospital" && (
              <div>
                <p className="text-sm text-gray-500">Services</p>
                <p>{user.profile?.skills?.join(', ') || "No services information available."}</p>
              </div>
            )}
            <Button className="mt-2" asChild>
              <Link to="/dashboard/_dashboardLayout/edit-profile">Update Details</Link>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
