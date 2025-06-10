import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Heart,
  MessageCircle,
  Share2,
  Trash2,
  AlertCircle,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { postService } from "@/services/apiService";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

interface MyPostsProps {
  userId?: string;
  limit?: number;
  showViewMore?: boolean;
}

export const MyPosts: React.FC<MyPostsProps> = ({
  userId,
  limit = 5,
  showViewMore = true,
}) => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [showCommentInput, setShowCommentInput] = useState<string | null>(null);
  const [commentText, setCommentText] = useState("");
  const [showReplies, setShowReplies] = useState<{ [key: string]: boolean }>(
    {}
  );

  const fetchUserPosts = async (reset = false) => {
    try {
      setIsLoading(true);
      const currentPage = reset ? 1 : page;
      const targetUserId = userId || (user && user._id);

      if (!targetUserId) {
        toast.error("User ID is required");
        return;
      }

      const response = await postService.getPaginatedPosts(
        currentPage,
        limit,
        "createdAt",
        "desc",
        targetUserId
      );

      if (response.success) {
        // If reset, replace posts, otherwise append
        setPosts((prev) =>
          reset ? response.posts : [...prev, ...response.posts]
        );
        setHasMore(response.pagination.hasNextPage);

        if (!reset) {
          setPage(currentPage + 1);
        } else {
          setPage(2); // Reset to page 2 (since we loaded page 1)
        }
      }
    } catch (error) {
      console.error("Error fetching user posts:", error);
      toast.error("Failed to load posts");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUserPosts(true); // Reset when user changes
  }, [userId, user]);

  // Format time in a more readable way (e.g., "5 minutes ago")
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

  // Function to handle liking a post
  const handleLikePost = async (postId: string) => {
    try {
      const response = await postService.likePost(postId);
      if (response.success) {
        // Update the post in the UI
        setPosts((prevPosts) =>
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
        setPosts((prevPosts) =>
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
        setPosts((prevPosts) =>
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

  // Function to handle sharing a post
  const handleSharePost = async (postId: string) => {
    try {
      const response = await postService.sharePost(postId);
      if (response.success) {
        // Update the post in the UI
        setPosts((prevPosts) =>
          prevPosts.map((post) => {
            if (post._id === postId) {
              return {
                ...post,
                shares: response.shares,
              };
            }
            return post;
          })
        );
        toast.success("Post shared successfully");
      }
    } catch (error) {
      console.error("Error sharing post:", error);
      toast.error("Failed to share post");
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
        setPosts((prevPosts) =>
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

  if (posts.length === 0 && !isLoading) {
    return (
      <Card className="mb-6">
        <CardContent className="p-6 text-center">
          <AlertCircle className="w-12 h-12 mx-auto mb-3 text-gray-400" />
          <h3 className="text-lg font-medium mb-2">No Posts Yet</h3>
          <p className="text-gray-500 mb-4">
            {userId && userId !== user?._id
              ? "This user hasn't made any posts yet."
              : "You haven't created any posts yet. Share something with the community!"}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {isLoading && posts.length === 0 ? (
        // Initial loading state
        <Card className="p-6">
          <div className="flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary-magenta" />
          </div>
        </Card>
      ) : (
        <>
          {/* Posts list */}
          {posts.map((post) => (
            <Card key={post._id} className="mb-6">
              <CardContent className="p-6">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 overflow-hidden flex-shrink-0">
                    <img
                      src={
                        post.user?.profile?.profilePhoto ||
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
                    <div className="flex justify-between">
                      <h3 className="font-medium">
                        {post.user?.name || "Anonymous User"}
                      </h3>
                      {post.isOwner && (
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
                      <button
                        onClick={() => handleSharePost(post._id)}
                        className="flex items-center gap-1 hover:text-gray-700"
                      >
                        <Share2 size={16} />
                        <span>{post.shares || 0}</span> Shares
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

                    {/* Comments list - limited to first 2 comments initially */}
                    {post.comments && post.comments.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {post.comments.slice(0, 2).map((comment: any) => (
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

                        {/* Show more comments link if there are more than 2 comments */}
                        {post.comments.length > 2 && (
                          <Button
                            variant="link"
                            className="text-primary-magenta p-0 h-auto text-sm"
                            onClick={() => {
                              // Navigate to single post view for all comments
                              window.location.href = `/post/${post._id}`;
                            }}
                          >
                            View all {post.comments.length} comments
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Load more button if there are more posts */}
          {showViewMore && hasMore && (
            <div className="flex justify-center">
              <Button
                onClick={() => fetchUserPosts()}
                disabled={isLoading}
                variant="outline"
                className="w-full max-w-xs"
              >
                {isLoading ? (
                  <>
                    <Loader2 size={16} className="mr-2 animate-spin" />{" "}
                    Loading...
                  </>
                ) : (
                  <>Load More Posts</>
                )}
              </Button>
            </div>
          )}

          {/* Refresh button */}
          <div className="flex justify-center mt-4">
            <Button
              onClick={() => fetchUserPosts(true)}
              disabled={isLoading}
              variant="ghost"
              size="sm"
              className="text-gray-500"
            >
              <RefreshCw
                size={16}
                className={`mr-2 ${isLoading ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default MyPosts;
