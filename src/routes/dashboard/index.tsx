import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import LoadingState from "@/components/common/LoadingState";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { postService } from "@/services/apiService";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

// Define types for our data
interface DashboardStats {
  totalDonations?: number;
  upcomingEvents?: number;
  pendingRequests?: number;
}

interface User {
  _id: string;
  name: string;
  email: string;
  profile?: {
    profilePhoto?: string;
  };
}

interface Post {
  _id: string;
  user: User;
  image: string;
  query: string;
  createdAt: string;
  updatedAt: string;
  // UI state properties (not from API)
  likes?: number;
  comments?: number; 
  shares?: number;
}

export const Route = createFileRoute("/dashboard/")({
  component: DashboardIndex,
});

function DashboardIndex() {
  const { user, isLoading } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({});
  const [statsLoading, setStatsLoading] = useState(true);
  const [posts, setPosts] = useState<Post[]>([]);
  
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

    // Fetch posts from API
    const fetchPosts = async () => {
      try {
        const response = await postService.getAllPosts();
        
        if (response.success && response.posts) {
          const postsWithUI = response.posts.map((post: Post) => ({
            ...post,
            likes: Math.floor(Math.random() * 50),
            comments: Math.floor(Math.random() * 10),
            shares: Math.floor(Math.random() * 5)
          }));
          setPosts(postsWithUI);
        } else {
          // If API call successful but no posts found, set empty array
          setPosts([]);
        }
      } catch (error) {
        console.error("Error fetching posts:", error);
        toast.error("Failed to load posts");
        // Fallback to mock data if API fails
        const mockPosts = [
          {
            _id: "fallback1",
            user: {
              _id: "user1",
              name: "Dr. Neha Sharma",
              email: "neha@example.com",
              profile: {
                profilePhoto: "https://i.pravatar.cc/150?img=32"
              }
            },
            image: "https://images.unsplash.com/photo-1615461066841-6116e61058f4?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80",
            query: "Our blood donation camp last weekend was a huge success! We collected over 50 units of blood which will help save up to 150 lives. Thanks to all donors who came forward. #SaveLives #BloodDonation",
            createdAt: new Date(Date.now() - 19 * 60000).toISOString(),
            updatedAt: new Date(Date.now() - 19 * 60000).toISOString(),
            likes: 24,
            comments: 5,
            shares: 3
          },
          {
            _id: "fallback2",
            user: {
              _id: "user2",
              name: "City Hospital",
              email: "city@example.com",
              profile: {
                profilePhoto: "https://i.pravatar.cc/150?img=15"
              }
            },
            image: "https://images.unsplash.com/photo-1579154204601-01588f351e67?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80", 
            query: "URGENT: We're experiencing a critical shortage of O-negative blood type. If you are O-negative, please consider donating at our blood bank. Your single donation could save multiple lives.",
            createdAt: new Date(Date.now() - 2 * 3600000).toISOString(),
            updatedAt: new Date(Date.now() - 2 * 3600000).toISOString(),
            likes: 56,
            comments: 12,
            shares: 31
          }
        ];
        setPosts(mockPosts);
      }
    };    if (user) {
      fetchDashboardStats();
      // Call the async function
      fetchPosts();
    }
  }, [user]);

  if (isLoading || statsLoading) {
    return <LoadingState />;
  }
  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Sidebar - User Info and Stats */}
        <div className="lg:col-span-1 space-y-6">
          {/* User Welcome Card */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-4 mb-4">              <Avatar className="h-16 w-16 border-2 border-primary-magenta">
                <AvatarImage
                  src={user?.profile?.profilePhoto || "https://i.pravatar.cc/150?img=12"} 
                  alt={user?.name || "User"} 
                />
                <AvatarFallback>
                  {(user?.name || user?.hospitalName || user?.organisationName || "U").charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-xl font-bold">
                  {user?.name || user?.hospitalName || user?.organisationName || "User"}
                </h2>
                <p className="text-gray-500 text-sm">
                  {user?.role === "user" ? "Blood Donor" : 
                   user?.role === "hospital" ? "Hospital Admin" :
                   user?.role === "organisation" ? "Organization Admin" : "User"}
                </p>
              </div>
            </div>
            <p className="text-gray-600 mb-4">
              This is your blood donation management dashboard. Here you can track your donations, find events, and more.
            </p>
          </div>

          {/* Stats Cards */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="font-semibold text-lg mb-4">Your Dashboard</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Total Donations</span>
                <span className="text-lg font-bold text-primary-magenta">{stats.totalDonations || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Upcoming Events</span>
                <span className="text-lg font-bold text-primary-magenta">{stats.upcomingEvents || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Pending Requests</span>
                <span className="text-lg font-bold text-primary-magenta">{stats.pendingRequests || 0}</span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="font-semibold text-lg mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Button className="w-full bg-primary-magenta hover:bg-primary-magenta/90">Donate Blood</Button>
              <Button className="w-full" variant="outline">Find Donation Events</Button>
              <Button className="w-full" variant="outline">Request Blood</Button>
            </div>
          </div>
        </div>

        {/* Main Content - Posts Feed */}
        <div className="lg:col-span-2 space-y-6">          {/* Post Creation */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage
                  src={user?.profile?.profilePhoto || "https://i.pravatar.cc/150?img=12"} 
                  alt={user?.name || "User"} 
                />
                <AvatarFallback>
                  {(user?.name || user?.hospitalName || user?.organisationName || "U").charAt(0)}
                </AvatarFallback>
              </Avatar>
              <Link
                to="/dashboard/create"
                className="flex-1 bg-gray-100 rounded-full px-4 py-2 cursor-pointer hover:bg-gray-200 transition-colors flex items-center"
              >
                <p className="text-gray-500">Share a thought or update...</p>
              </Link>
            </div>
            <div className="flex justify-center mt-4">
              <Button 
                className="bg-primary-magenta hover:bg-primary-magenta/90"
                asChild
              >
                <Link to="/dashboard/create" className="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Create New Post
                </Link>
              </Button>
            </div>
          </div>{/* Posts Feed */}
          {posts.map((post) => (
            <div key={post._id} className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <Avatar className="h-10 w-10">
                  <AvatarImage 
                    src={post.user?.profile?.profilePhoto || "https://i.pravatar.cc/150?img=12"} 
                    alt={post.user?.name || "User"} 
                  />
                  <AvatarFallback>
                    {(post.user?.name || "U").charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h4 className="font-semibold">{post.user?.name || post.user?.email || "User"}</h4>
                  <p className="text-xs text-gray-500">
                    {post.createdAt ? formatDistanceToNow(new Date(post.createdAt), { addSuffix: true }) : ""}
                  </p>
                </div>
              </div>
              
              <div className="mb-4">
                <p className="text-gray-700 mb-4">{post.query}</p>
                {post.image && (
                  <img 
                    src={post.image} 
                    alt="Post image" 
                    className="w-full rounded-md object-cover max-h-96" 
                  />
                )}
              </div>
              
              <div className="flex items-center justify-between text-sm text-gray-500 pt-3 border-t">
                <button className="flex items-center gap-1 hover:text-primary-magenta transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  <span>{post.likes || 0}</span>
                </button>
                
                <button className="flex items-center gap-1 hover:text-primary-magenta transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <span>Comment ({post.comments || 0})</span>
                </button>
                
                <button className="flex items-center gap-1 hover:text-primary-magenta transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                  <span>Share ({post.shares || 0})</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
