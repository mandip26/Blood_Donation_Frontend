import { createLazyFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  X,
  Trash2,
  Image,
  MapPin,
  Tag,
  AlertCircle,
  Loader2,
  RefreshCw,
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

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);
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

  // Function to fetch recent posts
  const fetchRecentPosts = async () => {
    try {
      setIsLoadingPosts(true);
      const response = await postService.getAllPosts();

      if (response.success && response.posts) {
        // Sort posts by creation date (most recent first) and take first 3
        const sortedPosts = response.posts
          .sort(
            (a: any, b: any) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )
          .slice(0, 3);
        setRecentPosts(sortedPosts);
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
          <Button
            onClick={openModal}
            variant="ghost"
            className="text-gray-600 gap-2 hover:bg-gray-100"
          >
            <AlertCircle size={18} />
            Blood Request
          </Button>
        </div>
      </div>
      {/* Recent activity section */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Recent Activity</h2>
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
                    <h3 className="font-medium">
                      {post.user?.name || "Anonymous User"}
                    </h3>
                    <p className="text-xs text-gray-500">
                      Posted {new Date(post.createdAt).toLocaleDateString()} at{" "}
                      {new Date(post.createdAt).toLocaleTimeString()}
                    </p>

                    <div className="mt-3">
                      <p className="text-gray-800">{post.query}</p>

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
                      <button className="flex items-center gap-1 hover:text-gray-700">
                        <span>0</span> Likes
                      </button>
                      <button className="flex items-center gap-1 hover:text-gray-700">
                        <span>0</span> Comments
                      </button>
                      <button className="flex items-center gap-1 hover:text-gray-700">
                        Share
                      </button>
                    </div>
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
                Be the first to share something with the community!
              </p>
              <div className="text-xs text-gray-400 mb-4">
                Note: If you're experiencing issues creating posts, there may be
                a temporary server issue. Please try again later or contact
                support.
              </div>
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
                <button className="p-2 rounded-full hover:bg-gray-100">
                  <MapPin size={20} className="text-gray-500" />
                </button>
                <button className="p-2 rounded-full hover:bg-gray-100">
                  <Tag size={20} className="text-gray-500" />
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
