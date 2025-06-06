import { createLazyFileRoute } from "@tanstack/react-router";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import LoadingState from "@/components/common/LoadingState";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { postService } from "@/services/apiService";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { BarChart, Calendar, Activity } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Define types for our data
/**
 * @typedef {Object} DashboardStats
 * @property {number} [totalDonations]
 * @property {number} [upcomingEvents]
 * @property {number} [pendingRequests]
 * @property {Object.<string, number>} [availableBloodTypes]
 * @property {Array<{date: string, units: number}>} [recentDonations]
 */

/**
 * @typedef {Object} User
 * @property {string} _id
 * @property {string} name
 * @property {string} email
 * @property {Object} [profile]
 * @property {string} [profile.profilePhoto]
 */

/**
 * @typedef {Object} Post
 * @property {string} _id
 * @property {User} user
 * @property {string} image
 * @property {string} query
 * @property {string} createdAt
 * @property {string} updatedAt
 * @property {number} [likes]
 * @property {number} [comments]
 * @property {number} [shares]
 */

export const Route = createLazyFileRoute("/dashboard/_dashboardLayout/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { user, isLoading } = useAuth();
  const [stats, setStats] = useState({});
  const [statsLoading, setStatsLoading] = useState(true);
  const [posts, setPosts] = useState([]);

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
            pendingRequests: 1,
            availableBloodTypes: {
              "A+": 25,
              "A-": 10,
              "B+": 18,
              "B-": 8,
              "AB+": 12,
              "AB-": 5,
              "O+": 30,
              "O-": 15,
            },
            recentDonations: [
              { date: "2023-01-15", units: 2 },
              { date: "2023-02-22", units: 1 },
              { date: "2023-04-05", units: 1 },
              { date: "2023-05-18", units: 3 },
              { date: "2023-06-30", units: 2 },
            ],
          });
          setStatsLoading(false);
        }, 800);
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
          const postsWithUI = response.posts.map((post) => ({
            ...post,
            likes: Math.floor(Math.random() * 50),
            comments: Math.floor(Math.random() * 10),
            shares: Math.floor(Math.random() * 5),
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
                profilePhoto: "https://i.pravatar.cc/150?img=32",
              },
            },
            image:
              "https://images.unsplash.com/photo-1615461066841-6116e61058f4?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80",
            query:
              "Our blood donation camp last weekend was a huge success! We collected over 50 units of blood which will help save up to 150 lives. Thanks to all donors who came forward. #SaveLives #BloodDonation",
            createdAt: new Date(Date.now() - 19 * 60000).toISOString(),
            updatedAt: new Date(Date.now() - 19 * 60000).toISOString(),
            likes: 24,
            comments: 5,
            shares: 3,
          },
          {
            _id: "fallback2",
            user: {
              _id: "user2",
              name: "City Hospital",
              email: "city@example.com",
              profile: {
                profilePhoto: "https://i.pravatar.cc/150?img=15",
              },
            },
            image:
              "https://images.unsplash.com/photo-1579154204601-01588f351e67?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80",
            query:
              "URGENT: We're experiencing a critical shortage of O-negative blood type. If you are O-negative, please consider donating at our blood bank. Your single donation could save multiple lives.",
            createdAt: new Date(Date.now() - 2 * 3600000).toISOString(),
            updatedAt: new Date(Date.now() - 2 * 3600000).toISOString(),
            likes: 56,
            comments: 12,
            shares: 31,
          },
        ];
        setPosts(mockPosts);
      }
    };

    if (user) {
      fetchDashboardStats();
      fetchPosts();
    }
  }, [user]);

  if (isLoading || statsLoading) {
    return <LoadingState />;
  }

  return (
    <main className="p-4 md:p-6 max-w-7xl mx-auto w-5xl">
      <Tabs defaultValue="overview" className="mb-6">
        <TabsList className="mb-4">
          <TabsTrigger value="overview" className="px-4">
            Overview
          </TabsTrigger>
          <TabsTrigger value="donations" className="px-4">
            My Donations
          </TabsTrigger>
          <TabsTrigger value="requests" className="px-4">
            Blood Requests
          </TabsTrigger>
          <TabsTrigger value="events" className="px-4">
            Upcoming Events
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
            {/* Left Sidebar - User Info and Stats */}
            <div className="lg:col-span-1 space-y-6">
              {/* User Welcome Card */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-4 mb-2">
                    <Avatar className="h-16 w-16 border-2 border-primary-magenta">
                      <AvatarImage
                        src={
                          user?.profile?.profilePhoto ||
                          "https://i.pravatar.cc/150?img=12"
                        }
                        alt={user?.name || "User"}
                      />
                      <AvatarFallback>
                        {(
                          user?.name ||
                          user?.hospitalName ||
                          user?.organizationName ||
                          "U"
                        ).charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle>
                        {user?.name ||
                          user?.hospitalName ||
                          user?.organizationName ||
                          "User"}
                      </CardTitle>
                      <CardDescription>
                        {user?.role === "user"
                          ? "Blood Donor"
                          : user?.role === "hospital"
                            ? "Hospital Admin"
                            : user?.role === "organization"
                              ? "Organization Admin"
                              : "User"}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Welcome to your blood donation management dashboard. Here
                    you can track your donations, find events, and help save
                    lives.
                  </p>
                </CardContent>
              </Card>

              {/* Stats Cards */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Your Dashboard</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Total Donations</span>
                    <span className="text-lg font-bold text-primary-magenta">
                      {stats.totalDonations || 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Upcoming Events</span>
                    <span className="text-lg font-bold text-primary-magenta">
                      {stats.upcomingEvents || 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Pending Requests</span>
                    <span className="text-lg font-bold text-primary-magenta">
                      {stats.pendingRequests || 0}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full bg-primary-magenta hover:bg-primary-magenta/90">
                    Donate Blood
                  </Button>
                  <Button className="w-full" variant="outline">
                    Find Donation Events
                  </Button>
                  <Button className="w-full" variant="outline">
                    Request Blood
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Main Content - Dashboard and Stats */}
            <div className="lg:col-span-2 space-y-6">
              {/* Blood Availability Stats */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart className="w-5 h-5 mr-2" />
                    Blood Availability
                  </CardTitle>
                  <CardDescription>
                    Current blood inventory statistics
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {stats.availableBloodTypes &&
                      Object.entries(stats.availableBloodTypes).map(
                        ([type, units]) => (
                          <div
                            key={type}
                            className="flex flex-col items-center justify-center p-3 rounded-lg border border-gray-100"
                          >
                            <span className="text-2xl font-bold text-primary-magenta">
                              {type}
                            </span>
                            <span className="text-sm text-gray-500">
                              {units} units
                            </span>
                          </div>
                        )
                      )}
                  </div>
                </CardContent>
              </Card>

              {/* Latest Activity and Post Creation */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Activity className="w-5 h-5 mr-2" />
                    Community Activity
                  </CardTitle>
                  <CardDescription>
                    Share updates and connect with the community
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-6">
                    <div className="flex gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage
                          src={
                            user?.profile?.profilePhoto ||
                            "https://i.pravatar.cc/150?img=12"
                          }
                          alt={user?.name || "User"}
                        />
                        <AvatarFallback>
                          {(
                            user?.name ||
                            user?.hospitalName ||
                            user?.organizationName ||
                            "U"
                          ).charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <Link
                        to="/dashboard/create"
                        className="flex-1 bg-gray-100 rounded-full px-4 py-2 cursor-pointer hover:bg-gray-200 transition-colors flex items-center"
                      >
                        <p className="text-gray-500">
                          Share a thought or update...
                        </p>
                      </Link>
                    </div>
                    <div className="flex justify-center mt-4">
                      <Button
                        className="bg-primary-magenta hover:bg-primary-magenta/90"
                        asChild
                      >
                        <Link
                          to="/dashboard/create"
                          className="flex items-center gap-2"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                            />
                          </svg>
                          Create New Post
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Posts Feed */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">
                  Recent Community Posts
                </h3>
                {posts.map((post) => (
                  <Card key={post._id}>
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage
                            src={
                              post.user?.profile?.profilePhoto ||
                              "https://i.pravatar.cc/150?img=12"
                            }
                            alt={post.user?.name || "User"}
                          />
                          <AvatarFallback>
                            {(post.user?.name || "U").charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="font-semibold">
                            {post.user?.name || post.user?.email || "User"}
                          </h4>
                          <p className="text-xs text-gray-500">
                            {post.createdAt
                              ? formatDistanceToNow(new Date(post.createdAt), {
                                  addSuffix: true,
                                })
                              : ""}
                          </p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
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
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                            />
                          </svg>
                          <span>{post.likes || 0}</span>
                        </button>

                        <button className="flex items-center gap-1 hover:text-primary-magenta transition-colors">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                            />
                          </svg>
                          <span>Comment ({post.comments || 0})</span>
                        </button>

                        <button className="flex items-center gap-1 hover:text-primary-magenta transition-colors">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                            />
                          </svg>
                          <span>Share ({post.shares || 0})</span>
                        </button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>

        {/* My Donations Tab */}
        <TabsContent value="donations">
          <div className="space-y-6 w-full">
            <Card>
              <CardHeader>
                <CardTitle>My Donation History</CardTitle>
                <CardDescription>
                  Track your blood donation journey
                </CardDescription>
              </CardHeader>
              <CardContent>
                {stats.recentDonations && stats.recentDonations.length > 0 ? (
                  <div className="space-y-4">
                    {stats.recentDonations.map((donation, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-center p-3 border-b"
                      >
                        <div>
                          <p className="font-medium">
                            {new Date(donation.date).toLocaleDateString()}
                          </p>
                          <p className="text-gray-500 text-sm">
                            General Hospital
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-primary-magenta font-bold">
                            {donation.units} unit{donation.units > 1 ? "s" : ""}
                          </p>
                          <p className="text-gray-500 text-sm">
                            Blood Donation
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10">
                    <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                    <h3 className="text-lg font-medium text-gray-900">
                      No donations yet
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Start your donation journey today!
                    </p>
                    <div className="mt-6">
                      <Button className="bg-primary-magenta hover:bg-primary-magenta/90">
                        Schedule Donation
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
              <CardFooter className="border-t pt-4">
                <Button variant="outline" className="ml-auto">
                  View All Donations
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Your Impact</CardTitle>
                <CardDescription>
                  See how your donations have made a difference
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <div className="text-4xl font-bold text-primary-magenta mb-2">
                    {stats.totalDonations || 0}
                  </div>
                  <p className="text-gray-700 mb-6">Total Donations</p>
                  <div className="text-4xl font-bold text-primary-magenta mb-2">
                    {(stats.totalDonations || 0) * 3}
                  </div>
                  <p className="text-gray-700">Lives Potentially Saved</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Blood Requests Tab */}
        <TabsContent value="requests">
          <div className="space-y-6 w-full">
            <Card>
              <CardHeader>
                <CardTitle>Current Blood Requests</CardTitle>
                <CardDescription>
                  Blood donation requests in your area
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-md">
                    <div className="flex justify-between mb-2">
                      <h4 className="font-semibold text-amber-800">
                        URGENT: O-negative needed
                      </h4>
                      <span className="bg-amber-200 text-amber-800 text-xs px-2 py-1 rounded-full">
                        Critical
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      City Hospital requires O-negative blood urgently for
                      accident victims. 3 units needed.
                    </p>
                    <div className="flex justify-between items-center">
                      <div className="text-xs text-gray-500">
                        2 hours ago • 3.2 km away
                      </div>
                      <Button
                        size="sm"
                        className="bg-primary-magenta hover:bg-primary-magenta/90 h-8"
                      >
                        Respond
                      </Button>
                    </div>
                  </div>

                  <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-md">
                    <div className="flex justify-between mb-2">
                      <h4 className="font-semibold text-blue-800">
                        A-positive needed
                      </h4>
                      <span className="bg-blue-200 text-blue-800 text-xs px-2 py-1 rounded-full">
                        Regular
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      Memorial Hospital needs A-positive blood for scheduled
                      surgeries. 2 units requested.
                    </p>
                    <div className="flex justify-between items-center">
                      <div className="text-xs text-gray-500">
                        1 day ago • 5.7 km away
                      </div>
                      <Button
                        size="sm"
                        className="bg-primary-magenta hover:bg-primary-magenta/90 h-8"
                      >
                        Respond
                      </Button>
                    </div>
                  </div>

                  <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-r-md">
                    <div className="flex justify-between mb-2">
                      <h4 className="font-semibold text-green-800">
                        B-positive needed
                      </h4>
                      <span className="bg-green-200 text-green-800 text-xs px-2 py-1 rounded-full">
                        Regular
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      General Hospital requires B-positive blood for regular
                      supply. 1 unit requested.
                    </p>
                    <div className="flex justify-between items-center">
                      <div className="text-xs text-gray-500">
                        2 days ago • 4.3 km away
                      </div>
                      <Button
                        size="sm"
                        className="bg-primary-magenta hover:bg-primary-magenta/90 h-8"
                      >
                        Respond
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="border-t pt-4">
                <Button variant="outline" className="w-full">
                  Create New Request
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>

        {/* Upcoming Events Tab */}
        <TabsContent value="events">
          <div className="space-y-6 w-full">
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Donation Events</CardTitle>
                <CardDescription>
                  Find blood donation camps and events near you
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border rounded-lg overflow-hidden">
                    <div className="aspect-video bg-gray-100 relative">
                      <img
                        src="https://images.unsplash.com/photo-1615461066841-6116e61058f4?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80"
                        alt="Blood Donation Camp"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-3 right-3 bg-white text-primary-magenta font-semibold rounded-full px-3 py-1 text-sm">
                        June 15
                      </div>
                    </div>
                    <div className="p-4">
                      <h4 className="font-bold text-lg">
                        World Blood Donor Day Camp
                      </h4>
                      <p className="text-gray-600 text-sm mt-1">
                        City Hospital, Downtown • 9:00 AM - 5:00 PM
                      </p>
                      <div className="mt-4 flex justify-between items-center">
                        <span className="text-gray-500 text-sm">
                          3.2 km away
                        </span>
                        <Button className="bg-primary-magenta hover:bg-primary-magenta/90">
                          Register
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="border rounded-lg overflow-hidden">
                    <div className="aspect-video bg-gray-100 relative">
                      <img
                        src="https://images.unsplash.com/photo-1579154204601-01588f351e67?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80"
                        alt="Blood Donation Drive"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-3 right-3 bg-white text-primary-magenta font-semibold rounded-full px-3 py-1 text-sm">
                        June 22
                      </div>
                    </div>
                    <div className="p-4">
                      <h4 className="font-bold text-lg">
                        University Blood Drive
                      </h4>
                      <p className="text-gray-600 text-sm mt-1">
                        Central University Campus • 10:00 AM - 4:00 PM
                      </p>
                      <div className="mt-4 flex justify-between items-center">
                        <span className="text-gray-500 text-sm">
                          5.7 km away
                        </span>
                        <Button className="bg-primary-magenta hover:bg-primary-magenta/90">
                          Register
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="border-t pt-4">
                <Button variant="outline" className="w-full">
                  View All Events
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </main>
  );
}
