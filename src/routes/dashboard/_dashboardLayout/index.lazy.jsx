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
import {
  postService,
  eventService,
  bloodRequestService,
  bloodInventoryService,
} from "@/services/apiService";
import { Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import {
  BarChart,
  Calendar,
  Activity,
  MapPin,
  Clock,
  Loader2,
  Heart,
  X,
  Check,
} from "lucide-react";
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
 * @property {string} [hospitalName]
 * @property {string} [organizationName]
 * @property {string} [role]
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
 * @property {string|Object} [location]
 */

export const Route = createLazyFileRoute("/dashboard/_dashboardLayout/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({});
  const [statsLoading, setStatsLoading] = useState(true);
  const [posts, setPosts] = useState([]);
  const [events, setEvents] = useState([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [eventsError, setEventsError] = useState(null);
  const [bloodRequests, setBloodRequests] = useState([]);
  const [bloodRequestsLoading, setBloodRequestsLoading] = useState(true);
  const [bloodRequestsError, setBloodRequestsError] = useState(null);
  const [completedDonations, setCompletedDonations] = useState([]);
  const [donationsLoading, setDonationsLoading] = useState(true);
  const [donationsError, setDonationsError] = useState(null);
  // Added state for hospital/organization selection and blood inventory
  const [hospitals, setHospitals] = useState([]);
  const [selectedHospital, setSelectedHospital] = useState("");
  const [bloodInventory, setBloodInventory] = useState({});
  const [loadingInventory, setLoadingInventory] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [showCommentInput, setShowCommentInput] = useState(null);
  const [showReplies, setShowReplies] = useState({});
  const [replyText, setReplyText] = useState("");
  const [replyingTo, setReplyingTo] = useState({
    postId: null,
    commentId: null,
  });
  const [showReplyInput, setShowReplyInput] = useState({
    postId: null,
    commentId: null,
  });
  // State for active donors section
  const [activeDonors, setActiveDonors] = useState([]);
  const [activeDonorsLoading, setActiveDonorsLoading] = useState(true);
  const [selectedDonor, setSelectedDonor] = useState(null);
  const [showDonorDetails, setShowDonorDetails] = useState(false);

  useEffect(() => {
    // Function to fetch dashboard stats
    const fetchDashboardStats = async () => {
      try {
        setStatsLoading(true);
        // This would be replaced with actual API calls
        // For now using mock data
        setTimeout(() => {
          setStats({
            totalDonations: 0, // Will be updated with completed donations count
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
          });
          setStatsLoading(false);
        }, 800);
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
        setStatsLoading(false);
      }
    }; // Function to fetch all hospitals and organizations
    const fetchHospitalsAndOrgs = async () => {
      try {
        const response = await fetch(
          "http://localhost:8001/api/v1/user/users",
          {
            method: "GET",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        const data = await response.json();
        console.log("All users data:", data);

        if (data.success && data.users) {
          // Filter users to only hospitals and organizations
          const hospsAndOrgs = data.users.filter(
            (user) => user.role === "hospital" || user.role === "organization"
          );
          console.log("Filtered hospitals and organizations:", hospsAndOrgs);

          setHospitals(hospsAndOrgs);

          // Set default selected hospital if available
          if (hospsAndOrgs.length > 0) {
            setSelectedHospital(hospsAndOrgs[0]._id);
            console.log("Default selected hospital ID:", hospsAndOrgs[0]._id);
            fetchBloodInventoryForUser(hospsAndOrgs[0]._id);
          }
        }
      } catch (error) {
        console.error("Error fetching hospitals and organizations:", error);
      }
    }; // Function to fetch blood inventory for a specific hospital/org
    const fetchBloodInventoryForUser = async (userId) => {
      if (!userId) return;

      try {
        setLoadingInventory(true);
        // Here we would fetch the blood inventory from the backend
        const inventories = await bloodInventoryService.getAllInventories();

        // Debug inventories
        console.log("All inventories:", inventories);

        // MongoDB ObjectId comparison requires string comparison
        const inventory = inventories.find((inv) => {
          // Debug each inventory userId
          console.log(
            `Comparing: inv.userId._id=${inv.userId?._id} with userId=${userId}`
          );
          // Convert both to strings to ensure proper comparison
          return (
            String(inv.userId?._id) === String(userId) ||
            String(inv.userId) === String(userId)
          );
        });

        // If inventory found, use it; otherwise use default values
        const inventoryData = inventory || {
          aPositive: 0,
          aNegative: 0,
          bPositive: 0,
          bNegative: 0,
          abPositive: 0,
          abNegative: 0,
          oPositive: 0,
          oNegative: 0,
        };

        console.log("Selected inventory:", inventoryData);
        setBloodInventory(inventoryData);
      } catch (error) {
        console.error("Error fetching blood inventory for user:", error);
      } finally {
        setLoadingInventory(false);
      }
    };

    // Fetch events from API
    const fetchEvents = async () => {
      try {
        setEventsLoading(true);
        setEventsError(null);
        const response = await eventService.getAllEvents();

        if (response.success && response.events) {
          // Get the 3 most recent events
          const recentEvents = response.events
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 3);
          setEvents(recentEvents);
          // Update stats with actual event count
          setStats((prev) => ({
            ...prev,
            upcomingEvents: response.events.length,
          }));
        } else {
          setEventsError("Failed to load events");
        }
      } catch (error) {
        console.error("Error fetching events:", error);
        setEventsError("Error loading events");
        // Fallback to empty array if API fails
        setEvents([]);
      } finally {
        setEventsLoading(false);
      }
    }; // Function to check if a blood request has completed responses
    const checkForCompletedResponses = async (requestId) => {
      try {
        // Check if requestId is valid before making API call
        if (!requestId) {
          console.warn(
            "Invalid requestId provided to checkForCompletedResponses:",
            requestId
          );
          return false;
        }

        const responseData =
          await bloodRequestService.getRequestResponses(requestId);
        if (responseData.success && responseData.responses) {
          return responseData.responses.some(
            (response) => response.status === "Completed"
          );
        }
        return false;
      } catch (error) {
        console.error(
          `Error checking responses for request ${requestId}:`,
          error
        );
        return false;
      }
    }; // Fetch blood requests from API
    const fetchBloodRequests = async () => {
      try {
        setBloodRequestsLoading(true);
        setBloodRequestsError(null);
        const response = await bloodRequestService.getActiveRequests();

        if (response.success && response.bloodRequests) {
          // First filter out requests with fulfilled status, deleted requests, and ensure valid requests
          const validRequests = response.bloodRequests.filter(
            (request) =>
              request &&
              request.status !== "fulfilled" &&
              request.status !== "Fulfilled" &&
              !request.isDeleted
          );

          // Process each request to check if it has any completed responses
          const requestsWithCompletionStatus = await Promise.all(
            validRequests.map(async (request) => {
              try {
                // Ensure request has valid ID
                if (!request || !request.id) {
                  console.warn(
                    "Invalid request object or missing ID:",
                    request
                  );
                  return null;
                }

                // Check for completed responses using the request ID
                const hasCompletedResponse =
                  request.hasCompletedResponse ||
                  (await checkForCompletedResponses(request.id));

                return {
                  ...request,
                  _id: request.id, // Ensure _id is set for compatibility with UI
                  hasCompletedResponse,
                };
              } catch (error) {
                console.error("Error processing request:", request, error);
                return null;
              }
            })
          );

          // Filter out null entries and requests with completed responses
          const activeRequests = requestsWithCompletionStatus.filter(
            (request) => request && !request.hasCompletedResponse
          );

          // Get the 3 most recent active blood requests
          const recentRequests = activeRequests
            .sort(
              (a, b) =>
                new Date(b.postedTime || b.createdAt) -
                new Date(a.postedTime || a.createdAt)
            )
            .slice(0, 3);

          setBloodRequests(recentRequests);
          console.log("Active blood requests loaded:", recentRequests.length);
        } else {
          setBloodRequestsError("Failed to load blood requests");
          // Ensure we set an empty array instead of null/undefined
          setBloodRequests([]);
        }
      } catch (error) {
        console.error("Error fetching blood requests:", error);
        setBloodRequestsError("Error loading blood requests");
        // Ensure we set an empty array instead of null/undefined
        setBloodRequests([]);
      } finally {
        setBloodRequestsLoading(false);
      }
    };
    const fetchPosts = async () => {
      try {
        const response = await postService.getAllPosts();

        if (response.success && response.posts) {
          const postsWithUI = response.posts.map((post) => ({
            ...post,
            // Use actual counts from the API response
            likes: post.likesCount || 0,
            comments: post.comments ? post.comments.length : 0,
            // Store the comments list for displaying
            commentsList: post.comments || [],
            // Track if current user has liked the post
            isLikedByCurrentUser: post.likedBy?.includes(user?._id),
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
    // Fetch user's completed blood donations
    const fetchCompletedDonations = async () => {
      try {
        setDonationsLoading(true);
        setDonationsError(null);

        // Get all user's responses
        const response = await bloodRequestService.getUserResponses();

        if (response.success && response.responses) {
          // Filter to get only completed responses
          const completedResponses = response.responses.filter(
            (resp) => resp.status === "Completed"
          );

          // Map responses to the donation format
          const mappedDonations = completedResponses.map((resp) => ({
            date: resp.createdAt,
            units: resp.bloodRequest?.unitsRequired || 1,
            hospital: resp.bloodRequest?.hospital || "General Hospital",
            bloodType: resp.bloodRequest?.bloodType || "Unknown",
            isCompleted: true,
            id: resp._id,
          }));
          setCompletedDonations(mappedDonations);

          // Update total donations count in stats with only completed responses
          setStats((prev) => ({
            ...prev,
            totalDonations: completedResponses.length,
          }));
        } else {
          setDonationsError("Failed to load donation history");
          setCompletedDonations([]);
        }
      } catch (error) {
        console.error("Error fetching completed donations:", error);
        setDonationsError("Error loading donation history");
        setCompletedDonations([]);
      } finally {
        setDonationsLoading(false);
      }
    };
    if (user) {
      fetchDashboardStats();

      // Make sure fetchPosts exists and is defined before calling it
      if (typeof fetchPosts === "function") {
        fetchPosts();
      } else {
        console.error("fetchPosts function is not defined in useEffect");
      }

      fetchEvents();
      fetchBloodRequests();
      fetchHospitalsAndOrgs(); // This will also trigger fetchBloodInventoryForUser

      // Only fetch donation history for users with the "user" role
      if (user.role === "user") {
        fetchCompletedDonations();
      }

      // Fetch active donors for all users
      fetchActiveDonors();
    }
  }, [user]);

  // Handle register button click - navigate to events page and focus on specific event
  const handleRegisterClick = (eventId) => {
    navigate({
      to: "/dashboard/events",
      search: { focusEvent: eventId },
    });
  };

  // Handle navigation to events page from Quick Actions
  const navigateToEvents = () => {
    navigate({
      to: "/dashboard/events",
    });
  };

  // Handle navigation to recipient page from Quick Actions
  const navigateToRecipient = () => {
    navigate({
      to: "/dashboard/recipient",
    });
  }; // Handle respond to blood request - navigate to recipient page with specific request
  const handleRespondToRequest = (requestId) => {
    // Check if requestId is valid before navigating
    if (!requestId) {
      console.warn(
        "Invalid requestId provided to handleRespondToRequest:",
        requestId
      );
      toast.error("Unable to respond to this request. Invalid request ID.");
      return;
    }

    // Log the navigation event
    console.log("Navigating to recipient page with request ID:", requestId);

    navigate({
      to: "/dashboard/recipient",
      search: { focusRequest: requestId },
    });
  };

  // Handle hospital/organization selection change
  const handleHospitalChange = (e) => {
    const hospitalId = e.target.value;
    setSelectedHospital(hospitalId);

    // Fetch blood inventory for selected hospital/organization
    const fetchInventory = async () => {
      try {
        setLoadingInventory(true);
        const inventories = await bloodInventoryService.getAllInventories();
        console.log("All inventories:", inventories);

        // Compare as strings to handle MongoDB ObjectId comparisons
        const inventory = inventories.find(
          (inv) =>
            String(inv.userId?._id) === String(hospitalId) ||
            String(inv.userId) === String(hospitalId)
        ) || {
          aPositive: 0,
          aNegative: 0,
          bPositive: 0,
          bNegative: 0,
          abPositive: 0,
          abNegative: 0,
          oPositive: 0,
          oNegative: 0,
        };

        console.log("Selected inventory for hospital:", hospitalId, inventory);
        setBloodInventory(inventory);
      } catch (error) {
        console.error("Error fetching blood inventory for user:", error);
        toast.error("Failed to load inventory data");
      } finally {
        setLoadingInventory(false);
      }
    };

    // Call the function immediately
    fetchInventory();
  };

  // Format date function
  const formatDate = (dateString) => {
    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Helper function to get urgency color
  const getUrgencyColor = (urgency) => {
    switch (urgency?.toLowerCase()) {
      case "high":
        return "bg-red-50 border-red-500 text-red-800";
      case "medium":
        return "bg-yellow-50 border-yellow-500 text-yellow-800";
      case "low":
        return "bg-green-50 border-green-500 text-green-800";
      default:
        return "bg-blue-50 border-blue-500 text-blue-800";
    }
  };
  // Handle liking a post
  const handleLikePost = async (postId) => {
    try {
      const response = await postService.likePost(postId);
      if (response.success) {
        // Update the post in the UI
        setPosts((prevPosts) =>
          prevPosts.map((post) => {
            if (post._id === postId) {
              // If the user already liked the post, this is an unlike action
              const newLikesCount = post.isLikedByCurrentUser
                ? Math.max(0, post.likes - 1)
                : post.likes + 1;

              return {
                ...post,
                likes: newLikesCount,
                isLikedByCurrentUser: !post.isLikedByCurrentUser,
              };
            }
            return post;
          })
        );
        toast.success(response.message || "Post liked!");
      }
    } catch (error) {
      console.error("Error liking post:", error);
      toast.error("Failed to like post");
    }
  };
  // Function to handle commenting on a post
  const handleCommentSubmit = async (postId) => {
    if (!commentText.trim()) {
      toast.error("Comment cannot be empty");
      return;
    }

    try {
      const response = await postService.commentOnPost(postId, commentText);
      if (response.success) {
        // Update the post in the UI with the new comment
        setPosts((prevPosts) =>
          prevPosts.map((post) => {
            if (post._id === postId) {
              const newComment = {
                _id: response.comment?._id || `temp-${Date.now()}`,
                text: commentText,
                user: user,
                createdAt: new Date().toISOString(),
                replies: [],
              };

              return {
                ...post,
                comments: (post.comments || 0) + 1,
                commentsList: [...(post.commentsList || []), newComment],
              };
            }
            return post;
          })
        );
        setCommentText("");
        setShowCommentInput(null);
        toast.success("Comment added successfully");
      }
    } catch (error) {
      console.error("Error adding comment:", error);
      toast.error("Failed to add comment");
    }
  };

  // Function to handle replying to a comment
  const handleReplySubmit = async (postId, commentId) => {
    if (!replyText.trim()) {
      toast.error("Reply cannot be empty");
      return;
    }

    try {
      const response = await postService.replyToComment(
        postId,
        commentId,
        replyText
      );
      if (response.success) {
        // Update the post and its comments in the UI
        setPosts((prevPosts) =>
          prevPosts.map((post) => {
            if (post._id === postId) {
              // Find and update the comment with the new reply
              const updatedCommentsList = post.commentsList.map((comment) => {
                if (comment._id === commentId) {
                  return {
                    ...comment,
                    replies: [
                      ...(comment.replies || []),
                      {
                        _id: response.reply._id || `temp-${Date.now()}`,
                        text: replyText,
                        user: user,
                        createdAt: new Date().toISOString(),
                      },
                    ],
                  };
                }
                return comment;
              });

              return {
                ...post,
                commentsList: updatedCommentsList,
              };
            }
            return post;
          })
        );

        // Reset state
        setReplyText("");
        setShowReplyInput({ postId: null, commentId: null });
        toast.success("Reply added successfully");
      }
    } catch (error) {
      console.error("Error adding reply:", error);
      toast.error("Failed to add reply");
    }
  };

  // Toggle reply input for a comment
  const toggleReplyInput = (postId, commentId) => {
    if (
      showReplyInput.postId === postId &&
      showReplyInput.commentId === commentId
    ) {
      setShowReplyInput({ postId: null, commentId: null });
    } else {
      setShowReplyInput({ postId, commentId });
    }
    setReplyText("");
  };

  // Toggle comment input for a post
  const toggleCommentInput = (postId) => {
    setShowCommentInput(showCommentInput === postId ? null : postId);
    setCommentText("");
  };

  // Toggle replies visibility for a comment
  const toggleReplies = (commentId) => {
    setShowReplies((prev) => ({
      ...prev,
      [commentId]: !prev[commentId],
    }));
  };

  // Handle clicking on a donor to show details
  const handleDonorClick = (donor) => {
    setSelectedDonor(donor);
    setShowDonorDetails(true);
  };

  // Close donor details modal
  const closeDonorDetails = () => {
    setShowDonorDetails(false);
    setSelectedDonor(null);
  };
  // Helper function to format time ago
  const getTimeAgo = (date) => {
    try {
      if (!date) return "Unknown time";

      const now = new Date();
      const inputDate = new Date(date);

      // Check if the date is valid
      if (isNaN(inputDate.getTime())) {
        return "Unknown time";
      }

      const diffMs = now.getTime() - inputDate.getTime();
      const diffSec = Math.round(diffMs / 1000);
      const diffMin = Math.round(diffSec / 60);
      const diffHour = Math.round(diffMin / 60);
      const diffDay = Math.round(diffHour / 24);

      if (diffSec < 60) return `${diffSec} seconds ago`;
      if (diffMin < 60) return `${diffMin} minutes ago`;
      if (diffHour < 24) return `${diffHour} hours ago`;
      if (diffDay === 1) return "Yesterday";
      if (diffDay < 30) return `${diffDay} days ago`;
      return inputDate.toLocaleDateString();
    } catch (error) {
      console.warn("Error formatting time ago:", error);
      return "Unknown time";
    }
  };

  // Function to refresh posts
  const refreshPosts = () => {
    if (typeof fetchPosts === "function") {
      fetchPosts();
      toast.info("Refreshing posts...");
    } else {
      console.error("fetchPosts function is not defined");
      toast.error("Could not refresh posts");
    }
  };

  // Function to fetch active donors
  const fetchActiveDonors = async () => {
    try {
      setActiveDonorsLoading(true);
      const response = await fetch("http://localhost:8001/api/v1/user/users", {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (data.success && data.users) {
        // Filter users to only active donors (role = "user" and donationStatus = "active")
        const activeUserDonors = data.users.filter(
          (user) => user.role === "user" && user.donationStatus === "active"
        );
        setActiveDonors(activeUserDonors);
      }
    } catch (error) {
      console.error("Error fetching active donors:", error);
      setActiveDonors([]);
    } finally {
      setActiveDonorsLoading(false);
    }
  };

  // Helper function to get display name based on user role
  const getDisplayName = (user) => {
    if (!user) return "User";

    if (user.role === "hospital" && user.hospitalName) {
      return user.hospitalName;
    } else if (user.role === "organization" && user.organizationName) {
      return user.organizationName;
    } else {
      return user.name || user.email || "User";
    }
  };

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
          {user?.role === "user" && (
            <TabsTrigger value="donations" className="px-4">
              My Donations
            </TabsTrigger>
          )}
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
                        alt={
                          user?.role === "hospital"
                            ? user?.hospitalName || user?.name || "User"
                            : user?.role === "organization"
                              ? user?.organizationName || user?.name || "User"
                              : user?.name || "User"
                        }
                      />
                      <AvatarFallback>
                        {(user?.role === "hospital"
                          ? user?.hospitalName || user?.name || "U"
                          : user?.role === "organization"
                            ? user?.organizationName || user?.name || "U"
                            : user?.name || "U"
                        ).charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle>
                        {user?.role === "hospital"
                          ? user?.hospitalName || user?.name || "User"
                          : user?.role === "organization"
                            ? user?.organizationName || user?.name || "User"
                            : user?.name || "User"}
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
              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {user?.role === "user" && (
                    <Button
                      className="w-full bg-primary-magenta hover:bg-primary-magenta/90"
                      onClick={navigateToRecipient}
                    >
                      Donate Blood
                    </Button>
                  )}
                  <Button
                    className="w-full"
                    variant="outline"
                    onClick={navigateToEvents}
                  >
                    Find Donation Events
                  </Button>{" "}
                  {(user?.role === "hospital" ||
                    user?.role === "organization") && (
                    <Button
                      className="w-full bg-primary-magenta hover:bg-primary-magenta/90"
                      onClick={navigateToRecipient}
                    >
                      Create Blood Request
                    </Button>
                  )}
                </CardContent>
              </Card>

              {/* Active Donors Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <Heart className="w-5 h-5 mr-2 text-red-500" />
                    Active Donors
                  </CardTitle>
                  <CardDescription>
                    Available donors ready to help
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {activeDonorsLoading ? (
                    <div className="flex justify-center items-center py-4">
                      <Loader2 className="h-6 w-6 animate-spin text-primary-magenta" />
                      <span className="ml-2 text-gray-600">
                        Loading donors...
                      </span>
                    </div>
                  ) : activeDonors.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">
                      No active donors available at the moment.
                    </p>
                  ) : (
                    <div className="space-y-3 max-h-80 overflow-y-auto">
                      {activeDonors.slice(0, 5).map((donor) => (
                        <div
                          key={donor._id}
                          className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                          onClick={() => handleDonorClick(donor)}
                        >
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-10 w-10">
                              <AvatarImage
                                src={
                                  donor.profile?.profilePhoto ||
                                  "/placeholder-avatar.svg"
                                }
                                alt={donor.name}
                              />
                              <AvatarFallback>
                                {donor.name?.charAt(0)?.toUpperCase() || "?"}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-sm">
                                {donor.name}
                              </p>
                              <p className="text-xs text-gray-500">
                                {donor.bloodType || "Unknown"} •{" "}
                                {donor.gender || "Not specified"}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-700">
                              Active
                            </span>
                          </div>
                        </div>
                      ))}
                      {activeDonors.length > 5 && (
                        <p className="text-xs text-gray-500 text-center pt-2">
                          Showing 5 of {activeDonors.length} active donors
                        </p>
                      )}
                    </div>
                  )}
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
                  {/* Add hospital/organization selector */}
                  <div className="mb-4">
                    <label
                      htmlFor="hospital-selector"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Select Hospital/Organization
                    </label>
                    <select
                      id="hospital-selector"
                      value={selectedHospital}
                      onChange={handleHospitalChange}
                      disabled={loadingInventory}
                      className="w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-primary-magenta focus:outline-none focus:ring-primary-magenta"
                    >
                      {hospitals.length === 0 && (
                        <option value="">No hospitals available</option>
                      )}
                      {hospitals.map((hospital) => (
                        <option key={hospital._id} value={hospital._id}>
                          {hospital.hospitalName ||
                            hospital.organizationName ||
                            hospital.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Display loading indicator if inventory is loading */}
                  {loadingInventory && (
                    <div className="flex justify-center items-center py-4">
                      <Loader2 className="h-6 w-6 animate-spin text-primary-magenta" />
                      <span className="ml-2 text-gray-600">
                        Loading inventory...
                      </span>
                    </div>
                  )}

                  {/* Display blood inventory grid */}
                  {!loadingInventory && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="flex flex-col items-center justify-center p-3 rounded-lg border border-gray-100">
                        <span className="text-2xl font-bold text-primary-magenta">
                          A+
                        </span>
                        <span className="text-sm text-gray-500">
                          {bloodInventory.aPositive || 0} units
                        </span>
                      </div>
                      <div className="flex flex-col items-center justify-center p-3 rounded-lg border border-gray-100">
                        <span className="text-2xl font-bold text-primary-magenta">
                          A-
                        </span>
                        <span className="text-sm text-gray-500">
                          {bloodInventory.aNegative || 0} units
                        </span>
                      </div>
                      <div className="flex flex-col items-center justify-center p-3 rounded-lg border border-gray-100">
                        <span className="text-2xl font-bold text-primary-magenta">
                          B+
                        </span>
                        <span className="text-sm text-gray-500">
                          {bloodInventory.bPositive || 0} units
                        </span>
                      </div>
                      <div className="flex flex-col items-center justify-center p-3 rounded-lg border border-gray-100">
                        <span className="text-2xl font-bold text-primary-magenta">
                          B-
                        </span>
                        <span className="text-sm text-gray-500">
                          {bloodInventory.bNegative || 0} units
                        </span>
                      </div>
                      <div className="flex flex-col items-center justify-center p-3 rounded-lg border border-gray-100">
                        <span className="text-2xl font-bold text-primary-magenta">
                          AB+
                        </span>
                        <span className="text-sm text-gray-500">
                          {bloodInventory.abPositive || 0} units
                        </span>
                      </div>
                      <div className="flex flex-col items-center justify-center p-3 rounded-lg border border-gray-100">
                        <span className="text-2xl font-bold text-primary-magenta">
                          AB-
                        </span>
                        <span className="text-sm text-gray-500">
                          {bloodInventory.abNegative || 0} units
                        </span>
                      </div>
                      <div className="flex flex-col items-center justify-center p-3 rounded-lg border border-gray-100">
                        <span className="text-2xl font-bold text-primary-magenta">
                          O+
                        </span>
                        <span className="text-sm text-gray-500">
                          {bloodInventory.oPositive || 0} units
                        </span>
                      </div>
                      <div className="flex flex-col items-center justify-center p-3 rounded-lg border border-gray-100">
                        <span className="text-2xl font-bold text-primary-magenta">
                          O-
                        </span>
                        <span className="text-sm text-gray-500">
                          {bloodInventory.oNegative || 0} units
                        </span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
              {/* Latest Activity and Post Creation */}{" "}
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle className="flex items-center">
                        <Activity className="w-5 h-5 mr-2" />
                        Community Activity
                      </CardTitle>
                      <CardDescription>
                        Share updates and connect with the community
                      </CardDescription>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-primary-magenta"
                      onClick={refreshPosts}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 mr-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                        />
                      </svg>
                      Refresh
                    </Button>
                  </div>
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
                          alt={
                            user?.role === "hospital"
                              ? user?.hospitalName || user?.name || "User"
                              : user?.role === "organization"
                                ? user?.organizationName || user?.name || "User"
                                : user?.name || "User"
                          }
                        />
                        <AvatarFallback>
                          {(user?.role === "hospital"
                            ? user?.hospitalName || user?.name || "U"
                            : user?.role === "organization"
                              ? user?.organizationName || user?.name || "U"
                              : user?.name || "U"
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
                            alt={getDisplayName(post.user)}
                          />
                          <AvatarFallback>
                            {getDisplayName(post.user).charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="font-semibold">
                            {getDisplayName(post.user)}
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
                      {" "}
                      <div className="mb-4">
                        <p className="text-gray-700 mb-4">{post.query}</p>
                        {post.location && (
                          <div className="flex items-center gap-1 text-sm text-gray-500 mb-3">
                            <MapPin size={14} className="flex-shrink-0" />
                            <span>
                              {typeof post.location === "object"
                                ? post.location.address
                                : post.location}
                            </span>
                          </div>
                        )}
                        {post.image && (
                          <img
                            src={post.image}
                            alt="Post image"
                            className="w-full rounded-md object-cover max-h-96"
                          />
                        )}
                      </div>
                      <div className="flex items-center justify-between text-sm text-gray-500 pt-3 border-t">
                        <button
                          className={`flex items-center gap-1 hover:text-primary-magenta transition-colors ${post.isLikedByCurrentUser ? "text-primary-magenta" : ""}`}
                          onClick={() => handleLikePost(post._id)}
                        >
                          <Heart
                            className={`h-5 w-5 ${post.isLikedByCurrentUser ? "fill-primary-magenta" : ""}`}
                            strokeWidth={post.isLikedByCurrentUser ? 0 : 2}
                          />
                          <span>{post.likes || 0}</span>
                        </button>{" "}
                        <button
                          className="flex items-center gap-1 hover:text-primary-magenta transition-colors"
                          onClick={() => toggleCommentInput(post._id)}
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
                              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                            />
                          </svg>
                          <span>Comment ({post.comments || 0})</span>
                        </button>
                      </div>
                      {/* Comment input section */}
                      {showCommentInput === post._id && (
                        <div className="mt-4 pt-3 border-t">
                          <div className="flex gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage
                                src={
                                  user?.profile?.profilePhoto ||
                                  "https://i.pravatar.cc/150?img=12"
                                }
                                alt={
                                  user?.role === "hospital"
                                    ? user?.hospitalName || user?.name || "User"
                                    : user?.role === "organization"
                                      ? user?.organizationName ||
                                        user?.name ||
                                        "User"
                                      : user?.name || "User"
                                }
                              />
                              <AvatarFallback>
                                {(user?.role === "hospital"
                                  ? user?.hospitalName || user?.name || "U"
                                  : user?.role === "organization"
                                    ? user?.organizationName ||
                                      user?.name ||
                                      "U"
                                    : user?.name || "U"
                                ).charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <textarea
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-magenta text-sm"
                                placeholder="Write a comment..."
                                rows={2}
                                value={commentText}
                                onChange={(e) => setCommentText(e.target.value)}
                              />
                              <div className="flex justify-end mt-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="mr-2"
                                  onClick={() => setShowCommentInput(null)}
                                >
                                  Cancel
                                </Button>
                                <Button
                                  size="sm"
                                  className="bg-primary-magenta hover:bg-primary-magenta/90"
                                  onClick={() => handleCommentSubmit(post._id)}
                                  disabled={!commentText.trim()}
                                >
                                  Comment
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}{" "}
                      {/* Display comments if post has any */}
                      {post.commentsList && post.commentsList.length > 0 && (
                        <div className="mt-4 pt-3 border-t space-y-3">
                          {post.commentsList.map((comment) => (
                            <div key={comment._id} className="flex gap-2">
                              <Avatar className="h-6 w-6">
                                <AvatarImage
                                  src={
                                    comment.user?.profile?.profilePhoto ||
                                    "https://i.pravatar.cc/150?img=12"
                                  }
                                  alt={getDisplayName(comment.user)}
                                />
                                <AvatarFallback>
                                  {getDisplayName(comment.user)
                                    .charAt(0)
                                    .toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <div className="bg-gray-100 rounded-lg px-3 py-2">
                                  {" "}
                                  <p className="text-xs font-semibold">
                                    {getDisplayName(comment.user)}
                                  </p>
                                  <p className="text-sm">{comment.text}</p>
                                </div>
                                <div className="flex gap-4 text-xs text-gray-500 mt-1 ml-1">
                                  <button>Like</button>
                                  <button
                                    onClick={() =>
                                      toggleReplyInput(post._id, comment._id)
                                    }
                                  >
                                    Reply
                                  </button>
                                  <span>
                                    {formatDistanceToNow(
                                      new Date(comment.createdAt),
                                      {
                                        addSuffix: true,
                                      }
                                    )}
                                  </span>
                                </div>

                                {/* Show reply input when toggled */}
                                {showReplyInput.postId === post._id &&
                                  showReplyInput.commentId === comment._id && (
                                    <div className="mt-2 ml-6">
                                      {" "}
                                      <div className="flex gap-2">
                                        <Avatar className="h-5 w-5">
                                          <AvatarImage
                                            src={
                                              user?.profile?.profilePhoto ||
                                              "https://i.pravatar.cc/150?img=12"
                                            }
                                            alt={
                                              user?.role === "hospital"
                                                ? user?.hospitalName ||
                                                  user?.name ||
                                                  "User"
                                                : user?.role === "organization"
                                                  ? user?.organizationName ||
                                                    user?.name ||
                                                    "User"
                                                  : user?.name || "User"
                                            }
                                          />
                                          <AvatarFallback>
                                            {(user?.role === "hospital"
                                              ? user?.hospitalName ||
                                                user?.name ||
                                                "U"
                                              : user?.role === "organization"
                                                ? user?.organizationName ||
                                                  user?.name ||
                                                  "U"
                                                : user?.name || "U"
                                            ).charAt(0)}
                                          </AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1">
                                          <textarea
                                            className="w-full px-2 py-1 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-magenta"
                                            placeholder="Write a reply..."
                                            rows={1}
                                            value={replyText}
                                            onChange={(e) =>
                                              setReplyText(e.target.value)
                                            }
                                          />
                                          <div className="flex justify-end mt-1">
                                            <Button
                                              size="sm"
                                              variant="ghost"
                                              className="h-6 text-xs mr-1"
                                              onClick={() =>
                                                setShowReplyInput({
                                                  postId: null,
                                                  commentId: null,
                                                })
                                              }
                                            >
                                              Cancel
                                            </Button>
                                            <Button
                                              size="sm"
                                              className="bg-primary-magenta hover:bg-primary-magenta/90 h-6 text-xs"
                                              onClick={() =>
                                                handleReplySubmit(
                                                  post._id,
                                                  comment._id
                                                )
                                              }
                                              disabled={!replyText.trim()}
                                            >
                                              Reply
                                            </Button>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  )}

                                {/* Show replies toggle if comment has replies */}
                                {comment.replies &&
                                  comment.replies.length > 0 && (
                                    <div className="mt-2 ml-1">
                                      <button
                                        className="text-xs text-primary-magenta font-medium flex items-center gap-1"
                                        onClick={() =>
                                          toggleReplies(comment._id)
                                        }
                                      >
                                        {showReplies[comment._id] ? (
                                          <>Hide replies</>
                                        ) : (
                                          <>
                                            Show {comment.replies.length}{" "}
                                            {comment.replies.length === 1
                                              ? "reply"
                                              : "replies"}
                                          </>
                                        )}
                                      </button>

                                      {/* Display replies */}
                                      {showReplies[comment._id] && (
                                        <div className="mt-2 space-y-2 ml-4">
                                          {comment.replies.map((reply) => (
                                            <div
                                              key={reply._id}
                                              className="flex gap-2"
                                            >
                                              <Avatar className="h-5 w-5">
                                                <AvatarImage
                                                  src={
                                                    reply.user?.profile
                                                      ?.profilePhoto ||
                                                    "https://i.pravatar.cc/150?img=12"
                                                  }
                                                  alt={getDisplayName(
                                                    reply.user
                                                  )}
                                                />
                                                <AvatarFallback>
                                                  {getDisplayName(reply.user)
                                                    .charAt(0)
                                                    .toUpperCase()}
                                                </AvatarFallback>
                                              </Avatar>
                                              <div className="flex-1">
                                                <div className="bg-gray-100 rounded-lg px-3 py-2">
                                                  {" "}
                                                  <p className="text-xs font-semibold">
                                                    {getDisplayName(reply.user)}
                                                  </p>
                                                  <p className="text-sm">
                                                    {reply.text}
                                                  </p>
                                                </div>
                                                <div className="flex gap-4 text-xs text-gray-500 mt-1 ml-1">
                                                  <button>Like</button>
                                                  <span>
                                                    {formatDistanceToNow(
                                                      new Date(reply.createdAt),
                                                      {
                                                        addSuffix: true,
                                                      }
                                                    )}
                                                  </span>
                                                </div>
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>{" "}
        </TabsContent>
        {/* My Donations Tab - Only shown for users with role "user" */}
        {user?.role === "user" && (
          <TabsContent value="donations">
            <div className="space-y-6 w-full">
              <Card>
                <CardHeader>
                  <CardTitle>My Donation History</CardTitle>
                  <CardDescription>
                    Track your blood donation journey
                  </CardDescription>
                </CardHeader>{" "}
                <CardContent>
                  {" "}
                  {donationsLoading ? (
                    <div className="flex justify-center items-center py-10">
                      <Loader2 className="animate-spin mr-2" size={20} />
                      <span className="text-gray-600">
                        Loading donation history...
                      </span>
                    </div>
                  ) : donationsError ? (
                    <div className="text-center py-10 text-red-600">
                      <p>{donationsError}</p>
                      <Button
                        onClick={() => fetchCompletedDonations()}
                        className="mt-4 bg-primary-magenta text-white hover:bg-primary-magenta/90"
                        size="sm"
                      >
                        Try Again
                      </Button>
                    </div>
                  ) : completedDonations.length > 0 ? (
                    <div className="space-y-4">
                      {/* Show completed blood request responses */}
                      {completedDonations.map((donation, index) => (
                        <div
                          key={`completed-${donation.id}-${index}`}
                          className="flex justify-between items-center p-3 border-b"
                        >
                          <div>
                            <p className="font-medium">
                              {new Date(donation.date).toLocaleDateString()}
                            </p>
                            <p className="text-gray-500 text-sm">
                              {donation.hospital}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-primary-magenta font-bold">
                              {donation.units} unit
                              {donation.units > 1 ? "s" : ""}
                            </p>
                            <p className="text-gray-500 text-sm">
                              Blood Donation ({donation.bloodType || "Unknown"})
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
              </Card>
            </div>
          </TabsContent>
        )}{" "}
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
                {bloodRequestsLoading ? (
                  <div className="flex justify-center items-center py-10">
                    <Loader2 className="animate-spin mr-2" size={20} />
                    <span className="text-gray-600">
                      Loading blood requests...
                    </span>
                  </div>
                ) : bloodRequestsError ? (
                  <div className="text-center py-10 text-red-600">
                    <p>{bloodRequestsError}</p>
                    <Button
                      onClick={() => window.location.reload()}
                      className="mt-4 bg-primary-magenta text-white hover:bg-primary-magenta/90"
                      size="sm"
                    >
                      Try Again
                    </Button>
                  </div>
                ) : !Array.isArray(bloodRequests) ||
                  bloodRequests.length === 0 ? (
                  <div className="text-center py-10 text-gray-500">
                    <Heart className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                    <p>No blood requests available at the moment</p>
                    <p className="text-sm">Check back later for new requests</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {" "}
                    {bloodRequests
                      .filter(
                        (request) =>
                          request &&
                          (request._id || request.id) &&
                          !request.isDeleted
                      )
                      .map((request) => (
                        <div
                          key={request._id || request.id}
                          className={`border-l-4 p-4 rounded-r-md ${getUrgencyColor(request.urgency)}`}
                        >
                          <div className="flex justify-between mb-2">
                            {" "}
                            <h4 className="font-semibold">
                              {request.urgency?.toUpperCase() === "HIGH"
                                ? "URGENT: "
                                : ""}
                              {request?.bloodType || "Unknown"} blood needed
                            </h4>
                            <span
                              className={`text-xs px-2 py-1 rounded-full ${
                                request.urgency?.toLowerCase() === "high"
                                  ? "bg-red-200 text-red-800"
                                  : request.urgency?.toLowerCase() === "medium"
                                    ? "bg-yellow-200 text-yellow-800"
                                    : "bg-green-200 text-green-800"
                              }`}
                            >
                              {request.urgency || "Medium"}
                            </span>
                          </div>{" "}
                          <p className="text-sm text-gray-600 mb-2">
                            {request?.hospital ||
                              request?.hospitalName ||
                              "Unknown Hospital"}{" "}
                            requires {request?.bloodType || "Unknown"} blood for{" "}
                            {request?.name ||
                              request?.patientName ||
                              "Unknown Patient"}
                            .{" "}
                            {request?.units ||
                              request?.unitsRequired ||
                              request?.unitsNeeded ||
                              1}{" "}
                            unit
                            {(request?.units ||
                              request?.unitsRequired ||
                              request?.unitsNeeded ||
                              1) > 1
                              ? "s"
                              : ""}{" "}
                            needed.
                          </p>{" "}
                          <div className="flex items-center text-gray-600 text-sm mb-2">
                            <MapPin size={14} className="mr-1" />
                            {request?.location || "Location not specified"}
                          </div>
                          <div className="flex justify-between items-center">
                            <div className="text-xs text-gray-500">
                              {request?.postedTime || request?.createdAt
                                ? getTimeAgo(
                                    new Date(
                                      request.postedTime || request.createdAt
                                    )
                                  )
                                : "Unknown time"}
                            </div>
                            <Button
                              size="sm"
                              className="bg-primary-magenta hover:bg-primary-magenta/90 h-8"
                              onClick={() =>
                                handleRespondToRequest(
                                  request?._id || request?.id
                                )
                              }
                              disabled={!request?._id && !request?.id}
                            >
                              Respond
                            </Button>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </CardContent>
              <CardFooter className="border-t pt-4">
                <Button variant="outline" className="w-full" asChild>
                  <Link to="/dashboard/recipient">View All Requests</Link>
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>{" "}
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
                {eventsLoading ? (
                  <div className="flex justify-center items-center py-10">
                    <Loader2 className="animate-spin mr-2" size={20} />
                    <span className="text-gray-600">Loading events...</span>
                  </div>
                ) : eventsError ? (
                  <div className="text-center py-10 text-red-600">
                    <p>{eventsError}</p>
                    <Button
                      onClick={() => window.location.reload()}
                      className="mt-4 bg-primary-magenta text-white hover:bg-primary-magenta/90"
                      size="sm"
                    >
                      Try Again
                    </Button>
                  </div>
                ) : events.length === 0 ? (
                  <div className="text-center py-10 text-gray-500">
                    <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                    <p>No events available at the moment</p>
                    <p className="text-sm">
                      Check back later for upcoming events
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {events.map((event) => (
                      <div
                        key={event._id}
                        className="border rounded-lg overflow-hidden"
                      >
                        <div className="aspect-video bg-gray-100 relative">
                          <img
                            src={
                              event.image ||
                              "https://images.unsplash.com/photo-1615461066841-6116e61058f4?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80"
                            }
                            alt={event.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.src =
                                "https://images.unsplash.com/photo-1615461066841-6116e61058f4?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80";
                            }}
                          />
                          <div className="absolute top-3 right-3 bg-white text-primary-magenta font-semibold rounded-full px-3 py-1 text-sm">
                            {formatDate(event.date)}
                          </div>
                        </div>
                        <div className="p-4">
                          <h4 className="font-bold text-lg mb-2">
                            {event.title}
                          </h4>
                          <p className="text-gray-600 text-sm mb-1">
                            By {event.createdBy?.name || "Unknown Organizer"}
                          </p>
                          <div className="flex items-center text-gray-600 text-sm mb-2">
                            <MapPin size={14} className="mr-1" />
                            {event.venue}
                          </div>
                          <div className="flex items-center text-gray-600 text-sm mb-3">
                            <Clock size={14} className="mr-1" />
                            {event.time}
                          </div>
                          {event.description && (
                            <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                              {event.description}
                            </p>
                          )}
                          {event.registrationLimit && (
                            <div className="text-sm text-blue-600 mb-3">
                              {event.registeredCount || 0} /{" "}
                              {event.registrationLimit} registered
                            </div>
                          )}
                          <div className="mt-4 flex justify-between items-center">
                            <span className="text-gray-500 text-sm">
                              Created{" "}
                              {formatDistanceToNow(new Date(event.createdAt), {
                                addSuffix: true,
                              })}
                            </span>
                            <Button
                              className="bg-primary-magenta hover:bg-primary-magenta/90"
                              onClick={() => handleRegisterClick(event._id)}
                            >
                              Register
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
              <CardFooter className="border-t pt-4">
                <Button variant="outline" className="w-full" asChild>
                  <Link to="/dashboard/events">View All Events</Link>
                </Button>
              </CardFooter>
            </Card>
          </div>{" "}
        </TabsContent>
      </Tabs>{" "}
      {/* Donor Details Modal */}
      {showDonorDetails && selectedDonor && (
        <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-md w-full mx-4 p-6 shadow-2xl border">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Donor Details</h3>
              <button
                onClick={closeDonorDetails}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage
                    src={
                      selectedDonor.profile?.profilePhoto ||
                      "/placeholder-avatar.svg"
                    }
                    alt={selectedDonor.name}
                  />
                  <AvatarFallback className="text-lg">
                    {selectedDonor.name?.charAt(0)?.toUpperCase() || "?"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h4 className="font-semibold text-lg">
                    {selectedDonor.name}
                  </h4>
                  <p className="text-gray-600">
                    {selectedDonor.bloodType || "Unknown"} •{" "}
                    {selectedDonor.gender || "Not specified"}
                  </p>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-700">
                    <Check size={12} className="mr-1" />
                    Active Donor
                  </span>
                </div>
              </div>

              <div className="border-t pt-4 space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Phone Number
                  </label>
                  <p className="text-gray-900">
                    {selectedDonor.phone || "Not provided"}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Email
                  </label>
                  <p className="text-gray-900">
                    {selectedDonor.email || "Not provided"}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Address
                  </label>
                  <p className="text-gray-900">
                    {selectedDonor.address || "Not provided"}
                  </p>
                </div>

                {selectedDonor.lastDonationDate && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Last Donation
                    </label>
                    <p className="text-gray-900">
                      {formatDate(selectedDonor.lastDonationDate)}
                    </p>
                  </div>
                )}

                {selectedDonor.nextEligibleDate && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Next Eligible Date
                    </label>
                    <p className="text-gray-900">
                      {formatDate(selectedDonor.nextEligibleDate)}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <Button variant="outline" onClick={closeDonorDetails}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
