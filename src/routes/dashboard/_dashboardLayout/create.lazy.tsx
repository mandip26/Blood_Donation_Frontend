import { createLazyFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  X,
  Trash2,
  Image,
  MapPin,
  AlertCircle,
  Loader2,
  RefreshCw,
  Heart,
  MessageCircle,
} from "lucide-react";
import { postService } from "@/services/apiService";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

export const Route = createLazyFileRoute("/dashboard/_dashboardLayout/create")({
  component: CreatePostComponent,
});

function CreatePostComponent() {
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [postText, setPostText] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [recentPosts, setRecentPosts] = useState<any[]>([]);
  const [isLoadingPosts, setIsLoadingPosts] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [showCommentInput, setShowCommentInput] = useState<string | null>(null);
  const [commentText, setCommentText] = useState("");
  const [showReplies, setShowReplies] = useState<{ [key: string]: boolean }>(
    {}
  );
  const [currentLocation, setCurrentLocation] = useState<string>("");
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentLocation("");
  };
  const handlePost = async (e?: React.MouseEvent<HTMLButtonElement>) => {
    if (e) {
      e.preventDefault();
    }
    if (!postText.trim() && selectedFiles.length === 0) {
      toast.error("Please add some text or select an image");
      return;
    }

    if (selectedFiles.length === 0) {
      toast.error("Please select an image to post");
      return;
    }

    // Check if user is authenticated
    if (!user) {
      toast.error("You must be logged in to create a post");
      return;
    }

    // Debug: Log user info to verify authentication
    console.log("Current user:", user);
    console.log("User ID:", user._id || user.id);

    try {
      setIsSubmitting(true);

      // Create FormData for the API call
      const formData = new FormData();
      formData.append("query", postText);

      // Add location if available
      if (currentLocation) {
        formData.append("location", currentLocation);
      }

      // Add the first selected image (backend expects single image)
      if (selectedFiles.length > 0) {
        formData.append("image", selectedFiles[0]);
      }

      // Debug: Log form data contents
      console.log("Sending form data:");
      for (let [key, value] of formData.entries()) {
        console.log(key, value);
      }

      // Call the API
      const response = await postService.createPost(formData);

      if (response.success) {
        toast.success("Post created successfully!");
        setPostText("");
        setSelectedFiles([]);
        setPreviewUrls([]);
        setCurrentLocation("");
        setRetryCount(0);
        closeModal();
        // Refresh the posts list
        fetchRecentPosts();
      } else {
        throw new Error("API returned success: false");
      }
    } catch (error: any) {
      console.error("Error creating post:", error);

      // More detailed error logging
      if (error.response) {
        console.error("Response status:", error.response.status);
        console.error("Response data:", error.response.data);
        console.error("Response headers:", error.response.headers);
      }

      // Check for specific error types
      if (error.response?.status === 401) {
        toast.error("Authentication failed. Please log in again.");
      } else if (error.response?.status === 500) {
        setRetryCount((prev) => prev + 1);

        if (retryCount < 2) {
          toast.error(
            `Server error occurred. Please try again. (Attempt ${retryCount + 1}/3)`,
            {
              action: {
                label: "Retry",
                onClick: () => handlePost(),
              },
            }
          );
        } else {
          toast.error(
            "Server error occurred. Please try again later or contact support.",
            {
              duration: 6000,
            }
          );
        }

        console.error(
          "Backend 500 Error - This is likely due to req.user.id vs req.user._id mismatch in post controller"
        );
      } else {
        toast.error(error.response?.data?.message || "Failed to create post");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Function to fetch recent posts (only user's own posts)
  const fetchRecentPosts = async () => {
    try {
      setIsLoadingPosts(true);
      const response = await postService.getAllPosts();

      if (response.success && response.posts) {
        // Filter posts to show only current user's posts, sort by creation date and take first 3
        const userPosts = response.posts
          .filter((post: any) => post.user && post.user._id === user?._id)
          .sort(
            (a: any, b: any) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )
          .slice(0, 3);
        setRecentPosts(userPosts);
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setIsLoadingPosts(false);
    }
  };
  // Fetch posts on component mount
  useEffect(() => {
    fetchRecentPosts();

    // Check for saved draft
    const savedDraft = localStorage.getItem("draftPost");
    if (savedDraft) {
      try {
        const draft = JSON.parse(savedDraft);
        // Only restore draft if it's less than 24 hours old
        if (Date.now() - draft.timestamp < 24 * 60 * 60 * 1000) {
          toast.info("Found a saved draft from earlier", {
            action: {
              label: "Restore",
              onClick: () => {
                setPostText(draft.text);
                setIsModalOpen(true);
                localStorage.removeItem("draftPost");
              },
            },
          });
        } else {
          localStorage.removeItem("draftPost");
        }
      } catch (e) {
        localStorage.removeItem("draftPost");
      }
    }
  }, []);
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      // Only allow image files
      const imageFiles = Array.from(files).filter((file) =>
        file.type.startsWith("image/")
      );

      if (imageFiles.length === 0) {
        toast.error("Please select only image files");
        return;
      }

      // For backend compatibility, only take the first image
      const selectedFile = imageFiles[0];
      setSelectedFiles([selectedFile]);

      // Create preview URLs
      const previewUrl = URL.createObjectURL(selectedFile);
      setPreviewUrls([previewUrl]);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));

    // Revoke URL to prevent memory leaks
    URL.revokeObjectURL(previewUrls[index]);
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
  };

  // Function to get current location
  const getCurrentLocation = () => {
    setIsGettingLocation(true);

    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by this browser");
      setIsGettingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;

          // Try multiple geocoding services for best results
          let locationData = null;

          try {
            // First try: BigDataCloud for detailed address
            const response1 = await fetch(
              `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
            );

            if (response1.ok) {
              locationData = await response1.json();
            }
          } catch (error) {
            console.log("BigDataCloud API failed, trying alternative...");
          }

          // Second try: OpenStreetMap Nominatim for detailed components
          if (!locationData || !locationData.locality) {
            try {
              const response2 = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`
              );

              if (response2.ok) {
                const osmData = await response2.json();
                if (osmData && osmData.address) {
                  // Convert OSM format to our format
                  locationData = {
                    locality:
                      osmData.address.suburb ||
                      osmData.address.neighbourhood ||
                      osmData.address.city_district,
                    city:
                      osmData.address.city ||
                      osmData.address.town ||
                      osmData.address.village,
                    principalSubdivision: osmData.address.state,
                    countryName: osmData.address.country,
                    postcode: osmData.address.postcode,
                    // Additional detailed components
                    houseNumber: osmData.address.house_number,
                    road: osmData.address.road,
                    suburb: osmData.address.suburb,
                    neighbourhood: osmData.address.neighbourhood,
                  };
                }
              }
            } catch (error) {
              console.log("OSM API also failed");
            }
          }

          if (locationData) {
            // Build detailed address with all available information
            const addressParts = [];

            // Add house number if available
            if (locationData.houseNumber) {
              addressParts.push(locationData.houseNumber);
            }

            // Add road/street name
            if (locationData.road) {
              addressParts.push(locationData.road);
            }

            // Add neighbourhood/area details
            if (
              locationData.neighbourhood &&
              locationData.neighbourhood !== locationData.locality
            ) {
              addressParts.push(locationData.neighbourhood);
            }

            // Add suburb if different from neighbourhood
            if (
              locationData.suburb &&
              locationData.suburb !== locationData.neighbourhood &&
              locationData.suburb !== locationData.locality
            ) {
              addressParts.push(locationData.suburb);
            }

            // Add locality/area
            if (locationData.locality) {
              addressParts.push(locationData.locality);
            }

            // Add city
            if (
              locationData.city &&
              locationData.city !== locationData.locality
            ) {
              addressParts.push(locationData.city);
            }

            // Add state/subdivision
            if (locationData.principalSubdivision) {
              addressParts.push(locationData.principalSubdivision);
            }

            // Add pincode/postal code if available
            if (locationData.postcode) {
              addressParts.push(locationData.postcode);
            }

            const exactLocation =
              addressParts.length > 0
                ? addressParts.join(", ")
                : "Location detected";

            setCurrentLocation(exactLocation);
            toast.success("Detailed location added successfully");
          } else {
            // Fallback to a generic message
            setCurrentLocation("Current location");
            toast.success("Location added");
          }
        } catch (error) {
          console.error("Error getting location name:", error);
          // Fallback to a generic location message
          setCurrentLocation("Current location");
          toast.success("Location added");
        } finally {
          setIsGettingLocation(false);
        }
      },
      (error) => {
        console.error("Error getting location:", error);
        let errorMessage = "Unable to get your location";

        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage =
              "Location access denied. Please enable location permissions.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Location information is unavailable.";
            break;
          case error.TIMEOUT:
            errorMessage = "Location request timed out.";
            break;
        }

        toast.error(errorMessage);
        setIsGettingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0, // Don't use cached location for exact positioning
      }
    );
  };

  // Function to handle liking a post
  const handleLikePost = async (postId: string) => {
    try {
      const response = await postService.likePost(postId);
      if (response.success) {
        // Update the post in the UI
        setRecentPosts((prevPosts) =>
          prevPosts.map((post) => {
            if (post._id === postId) {
              const isAlreadyLiked = post.isLikedByCurrentUser;
              return {
                ...post,
                likes: isAlreadyLiked
                  ? (post.likes || []).filter((id: string) => id !== user?._id)
                  : [...(post.likes || []), user?._id],
                likesCount: response.likes,
                isLikedByCurrentUser: !isAlreadyLiked,
              };
            }
            return post;
          })
        );
      }
    } catch (error) {
      console.error("Error liking post:", error);
      toast.error("Failed to like post");
    }
  };

  // Function to handle commenting on a post
  const handleCommentSubmit = async (postId: string) => {
    if (!commentText.trim()) {
      toast.error("Comment cannot be empty");
      return;
    }

    try {
      const response = await postService.commentOnPost(postId, commentText);
      if (response.success) {
        // Update the post in the UI
        setRecentPosts((prevPosts) =>
          prevPosts.map((post) => {
            if (post._id === postId) {
              return {
                ...post,
                comments: [...(post.comments || []), response.comment],
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
  const handleReplySubmit = async (postId: string, commentId: string) => {
    if (!commentText.trim()) {
      toast.error("Reply cannot be empty");
      return;
    }

    try {
      const response = await postService.replyToComment(
        postId,
        commentId,
        commentText
      );
      if (response.success) {
        // Update the post in the UI
        setRecentPosts((prevPosts) =>
          prevPosts.map((post) => {
            if (post._id === postId) {
              const updatedComments = post.comments.map((comment: any) => {
                if (comment._id === commentId) {
                  return {
                    ...comment,
                    replies: [...(comment.replies || []), response.reply],
                  };
                }
                return comment;
              });
              return {
                ...post,
                comments: updatedComments,
              };
            }
            return post;
          })
        );
        setCommentText("");
        setShowCommentInput(null);
        toast.success("Reply added successfully");
      }
    } catch (error) {
      console.error("Error adding reply:", error);
      toast.error("Failed to add reply");
    }
  };
  // Function to handle deleting a post with confirmation
  const handleDeletePost = async (postId: string) => {
    // Show confirmation dialog
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this post?"
    );

    if (!confirmDelete) {
      return; // User canceled the operation
    }

    try {
      const response = await postService.deletePost(postId);
      if (response.success) {
        // Remove the post from the UI
        setRecentPosts((prevPosts) =>
          prevPosts.filter((post) => post._id !== postId)
        );
        toast.success("Post deleted successfully");
      }
    } catch (error) {
      console.error("Error deleting post:", error);
      toast.error("Failed to delete post");
    }
  };

  const toggleReplies = (commentId: string) => {
    setShowReplies((prev) => ({
      ...prev,
      [commentId]: !prev[commentId],
    }));
  };

  // Helper function to format time in a more readable way (e.g., "5 minutes ago")
  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const past = new Date(timestamp);
    const diffMs = now.getTime() - past.getTime();
    const diffSec = Math.round(diffMs / 1000);
    const diffMin = Math.round(diffSec / 60);
    const diffHour = Math.round(diffMin / 60);
    const diffDay = Math.round(diffHour / 24);

    if (diffSec < 60) {
      return "just now";
    } else if (diffMin < 60) {
      return `${diffMin} minute${diffMin === 1 ? "" : "s"} ago`;
    } else if (diffHour < 24) {
      return `${diffHour} hour${diffHour === 1 ? "" : "s"} ago`;
    } else if (diffDay < 30) {
      return `${diffDay} day${diffDay === 1 ? "" : "s"} ago`;
    } else {
      // If more than a month, return the actual date
      return past.toLocaleDateString();
    }
  };

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-4">Create Post</h1>
        <p className="text-gray-600">
          Share updates, request blood donations, or ask questions to the
          community.
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        {" "}
        <div className="flex items-start gap-4">
          {/* User Avatar */}
          <div className="w-12 h-12 rounded-full bg-blue-100 overflow-hidden flex-shrink-0">
            <img
              src={user?.profile?.profilePhoto || "/placeholder-avatar.svg"}
              alt="User"
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = "https://placehold.co/200x200?text=User";
              }}
            />
          </div>

          {/* Post create box */}
          <div
            onClick={openModal}
            className="flex-1 bg-gray-100 rounded-xl p-4 text-gray-500 cursor-pointer hover:bg-gray-200 transition-colors"
          >
            What's on your mind?
          </div>
        </div>
        {/* Quick post actions */}
        <div className="mt-4 border-t border-gray-100 pt-4 flex justify-around">
          <Button
            onClick={openModal}
            variant="ghost"
            className="text-gray-600 gap-2 hover:bg-gray-100"
          >
            <Image size={18} />
            Photo
          </Button>
        </div>
      </div>
      {/* Recent activity section */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">My Recent Posts</h2>
          <Button
            onClick={fetchRecentPosts}
            variant="ghost"
            size="sm"
            disabled={isLoadingPosts}
            className="text-gray-600 hover:text-gray-800"
          >
            {isLoadingPosts ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
          </Button>
        </div>

        <div className="space-y-6">
          {isLoadingPosts ? (
            // Loading skeleton
            Array.from({ length: 2 }).map((_, index) => (
              <div
                key={index}
                className="border-b border-gray-100 pb-6 animate-pulse"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-200"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-20 mb-3"></div>
                    <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  </div>
                </div>
              </div>
            ))
          ) : recentPosts.length > 0 ? (
            recentPosts.map((post) => (
              <div
                key={post._id}
                className="border-b border-gray-100 pb-6 last:border-b-0"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 overflow-hidden flex-shrink-0">
                    <img
                      src={
                        post.user?.profile?.profilePhoto ||
                        user?.profile?.profilePhoto ||
                        "https://placehold.co/200x200?text=User"
                      }
                      alt={post.user?.name || "User"}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "https://placehold.co/200x200?text=User";
                      }}
                    />
                  </div>

                  <div className="flex-1">
                    {" "}
                    <div className="flex justify-between">
                      <h3 className="font-medium">
                        {post.user?.name || "Anonymous User"}
                      </h3>
                      {user && post.user && user._id === post.user._id && (
                        <Button
                          onClick={() => handleDeletePost(post._id)}
                          variant="ghost"
                          size="sm"
                          className="text-red-500 hover:text-red-700 p-1 h-auto"
                        >
                          <Trash2 size={16} />
                        </Button>
                      )}
                    </div>
                    <p className="text-xs text-gray-500">
                      Posted {formatTimeAgo(post.createdAt)}
                    </p>
                    <div className="mt-3">
                      <p className="text-gray-800">{post.query}</p>

                      {post.location && (
                        <div className="mt-2 flex items-center gap-1 text-sm text-gray-500">
                          <MapPin size={14} />
                          <span>
                            {typeof post.location === "object"
                              ? post.location.address
                              : post.location}
                          </span>
                        </div>
                      )}

                      {post.image && (
                        <div className="mt-3 rounded-lg overflow-hidden border border-gray-100">
                          <img
                            src={post.image}
                            alt="Post image"
                            className="w-full h-auto max-h-64 object-cover"
                          />
                        </div>
                      )}
                    </div>
                    <div className="mt-3 flex items-center gap-4 text-sm text-gray-500">
                      <button
                        onClick={() => handleLikePost(post._id)}
                        className={`flex items-center gap-1 hover:text-gray-700 ${
                          post.isLikedByCurrentUser
                            ? "text-primary-magenta"
                            : ""
                        }`}
                      >
                        <Heart
                          size={16}
                          fill={
                            post.isLikedByCurrentUser ? "currentColor" : "none"
                          }
                        />
                        <span>
                          {post.likesCount || post.likes?.length || 0}
                        </span>{" "}
                        Likes
                      </button>
                      <button
                        onClick={() =>
                          setShowCommentInput((prev) =>
                            prev === post._id ? null : post._id
                          )
                        }
                        className="flex items-center gap-1 hover:text-gray-700"
                      >
                        <MessageCircle size={16} />
                        <span>{post.comments?.length || 0}</span> Comments
                      </button>
                    </div>
                    {/* Comment input */}
                    {showCommentInput === post._id && (
                      <div className="mt-3 flex gap-2">
                        <input
                          type="text"
                          value={commentText}
                          onChange={(e) => setCommentText(e.target.value)}
                          placeholder="Write a comment..."
                          className="flex-1 border rounded-full px-4 py-1 text-sm"
                        />
                        <Button
                          onClick={() => handleCommentSubmit(post._id)}
                          size="sm"
                          className="bg-primary-magenta text-white rounded-full hover:bg-primary-magenta/90"
                          disabled={!commentText.trim()}
                        >
                          Post
                        </Button>
                      </div>
                    )}
                    {/* Comments list */}
                    {post.comments && post.comments.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {post.comments.map((comment: any) => (
                          <div
                            key={comment._id}
                            className="bg-gray-50 rounded-lg p-2"
                          >
                            <div className="flex items-start gap-2">
                              <div className="w-8 h-8 rounded-full bg-blue-100 overflow-hidden flex-shrink-0">
                                <img
                                  src={
                                    comment.user?.profile?.profilePhoto ||
                                    "https://placehold.co/200x200?text=User"
                                  }
                                  alt={comment.user?.name || "User"}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.src =
                                      "https://placehold.co/200x200?text=User";
                                  }}
                                />
                              </div>
                              <div className="flex-1">
                                <div className="font-medium text-sm">
                                  {comment.user?.name || "Anonymous"}
                                </div>
                                <p className="text-sm">{comment.text}</p>
                                <div className="flex gap-3 mt-1 text-xs text-gray-500">
                                  <button
                                    onClick={() =>
                                      setShowCommentInput((prev) =>
                                        prev === `reply-${comment._id}`
                                          ? null
                                          : `reply-${comment._id}`
                                      )
                                    }
                                    className="hover:text-gray-700"
                                  >
                                    Reply
                                  </button>
                                  {comment.replies &&
                                    comment.replies.length > 0 && (
                                      <button
                                        onClick={() =>
                                          toggleReplies(comment._id)
                                        }
                                        className="hover:text-gray-700"
                                      >
                                        {showReplies[comment._id]
                                          ? "Hide replies"
                                          : `Show ${comment.replies.length} replies`}
                                      </button>
                                    )}
                                </div>

                                {/* Reply input */}
                                {showCommentInput ===
                                  `reply-${comment._id}` && (
                                  <div className="mt-2 flex gap-2">
                                    <input
                                      type="text"
                                      value={commentText}
                                      onChange={(e) =>
                                        setCommentText(e.target.value)
                                      }
                                      placeholder="Write a reply..."
                                      className="flex-1 border rounded-full px-3 py-1 text-xs"
                                    />
                                    <Button
                                      onClick={() =>
                                        handleReplySubmit(post._id, comment._id)
                                      }
                                      size="sm"
                                      className="bg-primary-magenta text-white rounded-full text-xs px-3 py-1 h-auto hover:bg-primary-magenta/90"
                                      disabled={!commentText.trim()}
                                    >
                                      Reply
                                    </Button>
                                  </div>
                                )}

                                {/* Replies list */}
                                {showReplies[comment._id] &&
                                  comment.replies &&
                                  comment.replies.length > 0 && (
                                    <div className="ml-6 mt-2 space-y-2">
                                      {comment.replies.map((reply: any) => (
                                        <div
                                          key={reply._id}
                                          className="bg-gray-100 rounded-lg p-2"
                                        >
                                          <div className="flex items-start gap-2">
                                            <div className="w-6 h-6 rounded-full bg-blue-100 overflow-hidden flex-shrink-0">
                                              <img
                                                src={
                                                  reply.user?.profile
                                                    ?.profilePhoto ||
                                                  "https://placehold.co/200x200?text=User"
                                                }
                                                alt={reply.user?.name || "User"}
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                  const target =
                                                    e.target as HTMLImageElement;
                                                  target.src =
                                                    "https://placehold.co/200x200?text=User";
                                                }}
                                              />
                                            </div>
                                            <div>
                                              <div className="font-medium text-xs">
                                                {reply.user?.name ||
                                                  "Anonymous"}
                                              </div>
                                              <p className="text-xs">
                                                {reply.text}
                                              </p>
                                            </div>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            // Empty state
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="font-medium text-gray-900 mb-2">No posts yet</h3>
              <p className="text-gray-500 mb-4">
                You haven't created any posts yet. Share something with the
                community!
              </p>
              <Button
                onClick={openModal}
                className="bg-primary-magenta text-white hover:bg-primary-magenta/90"
              >
                Create Your First Post
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Post Creation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-xl relative">
            {/* Modal Header with Close Button */}
            <div className="flex justify-between items-center p-4">
              <button
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
              <button
                onClick={() => {
                  setPostText("");
                  setSelectedFiles([]);
                  setPreviewUrls([]);
                  setCurrentLocation("");
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <Trash2 size={24} />
              </button>
            </div>

            {/* Post Content Area */}
            <div className="p-4">
              {" "}
              <div className="flex items-start gap-3">
                {/* User Avatar */}
                <div className="w-12 h-12 rounded-full bg-blue-100 overflow-hidden flex-shrink-0">
                  <img
                    src={
                      user?.profile?.profilePhoto || "/placeholder-avatar.svg"
                    }
                    alt="User"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "https://placehold.co/200x200?text=User";
                    }}
                  />
                </div>

                {/* Text Input Area */}
                <div className="flex-1">
                  <textarea
                    placeholder="What's Happening?"
                    value={postText}
                    onChange={(e) => setPostText(e.target.value)}
                    className="w-full border-none outline-none resize-none text-lg min-h-[100px]"
                  />
                </div>
              </div>
              {/* Media Preview */}
              {previewUrls.length > 0 && (
                <div className="mt-4 flex gap-2 flex-wrap">
                  {previewUrls.map((url, index) => (
                    <div key={index} className="relative">
                      <img
                        src={url}
                        alt={`Preview ${index}`}
                        className="w-20 h-20 object-cover rounded-lg border border-gray-200"
                      />
                      <button
                        onClick={() => removeFile(index)}
                        className="absolute -top-1 -right-1 bg-white rounded-full p-1 shadow-md"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              {/* Current Location Display */}
              {currentLocation && (
                <div className="mt-4 flex items-center gap-2 text-sm text-gray-600 bg-gray-50 rounded-lg p-2">
                  <MapPin size={16} />
                  <span>{currentLocation}</span>
                  <button
                    onClick={() => setCurrentLocation("")}
                    className="ml-auto text-gray-400 hover:text-gray-600"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}
            </div>
            {/* Media Buttons and Post Button */}
            <div className="p-4 flex justify-between items-center border-t border-gray-100">
              <div className="flex gap-2">
                <label
                  htmlFor="image-upload"
                  className="p-2 rounded-full hover:bg-gray-100 cursor-pointer"
                >
                  <Image size={20} className="text-gray-500" />
                  <input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
                <button
                  onClick={getCurrentLocation}
                  disabled={isGettingLocation}
                  className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-50"
                >
                  {isGettingLocation ? (
                    <Loader2 size={20} className="text-gray-500 animate-spin" />
                  ) : (
                    <MapPin size={20} className="text-gray-500" />
                  )}
                </button>
              </div>

              <Button
                onClick={handlePost}
                className="bg-primary-magenta text-white hover:bg-primary-magenta/90 px-6 rounded-full"
                disabled={
                  isSubmitting ||
                  (!postText.trim() && selectedFiles.length === 0)
                }
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Posting...
                  </>
                ) : (
                  "Post"
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
