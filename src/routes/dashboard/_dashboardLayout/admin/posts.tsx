import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, FileText, Trash2, Eye, X } from "lucide-react";
import { toast } from "sonner";
import { adminApi } from "@/lib/api";

interface Post {
  _id: string;
  query: string;
  image: string;
  location?: any;
  likes: any[];
  comments: any[];
  user?: {
    _id: string;
    name?: string;
    organizationName?: string;
    hospitalName?: string;
    email: string;
    role: string;
  };
  createdAt: string;
}

export const Route = createFileRoute("/dashboard/_dashboardLayout/admin/posts")(
  {
    component: PostsManagement,
  }
);

function PostsManagement() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, [search, currentPage]);

  const fetchPosts = async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "10",
        ...(search && { search }),
      });

      const data = await adminApi.getPosts(params);

      if (data.success) {
        setPosts(data.data.posts);
        setTotalPages(data.data.pages);
        setTotal(data.data.total);
      } else {
        toast.error(data.message || "Failed to fetch posts");
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
      toast.error("Failed to fetch posts");
    } finally {
      setLoading(false);
    }
  };

  const deletePost = async (postId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this post? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      await adminApi.deletePost(postId);

      setPosts(posts.filter((post) => post._id !== postId));
      setTotal(total - 1);
      toast.success("Post deleted successfully");
    } catch (error) {
      console.error("Error deleting post:", error);
      toast.error("Failed to delete post");
    }
  };

  const viewPost = (post: Post) => {
    setSelectedPost(post);
    setIsViewModalOpen(true);
  };

  const closeViewModal = () => {
    setIsViewModalOpen(false);
    setSelectedPost(null);
  };

  const getCreatorName = (creator: Post["user"]) => {
    if (!creator) return "Unknown";
    return (
      creator.name ||
      creator.organizationName ||
      creator.hospitalName ||
      "Unknown"
    );
  };

  const getCreatorRole = (creator: Post["user"]) => {
    if (!creator || !creator.role) return "Unknown";
    return creator.role;
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  const formatLocation = (location: any) => {
    if (!location) return "";

    if (typeof location === "string") {
      return location;
    }

    // If location is an object, format it as a readable address
    if (typeof location === "object") {
      const parts: string[] = [];

      // Common location fields in order of specificity
      const fields = [
        "street",
        "area",
        "locality",
        "subLocality",
        "city",
        "district",
        "state",
        "country",
        "postalCode",
        "zipCode",
        "pinCode",
      ];

      fields.forEach((field) => {
        if (location[field] && typeof location[field] === "string") {
          parts.push(location[field]);
        }
      });

      // If no standard fields found, try to extract meaningful values
      if (parts.length === 0) {
        Object.entries(location).forEach(([key, value]) => {
          // Skip ID fields and other technical fields
          const skipFields = [
            "_id",
            "id",
            "__v",
            "createdAt",
            "updatedAt",
            "userId",
            "postId",
          ];
          const isIdField = skipFields.some((field) =>
            key.toLowerCase().includes(field.toLowerCase())
          );

          if (!isIdField && typeof value === "string" && value.trim() !== "") {
            parts.push(value);
          }
        });
      }

      return parts.join(", ") || JSON.stringify(location, null, 2);
    }

    return String(location);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">Post Management</h1>
        <p className="text-gray-600">
          Manage and monitor all posts in the system
        </p>
      </div>

      {/* Search and Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <Card className="bg-white shadow-even-md">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">
                Search Posts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by post query..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-white shadow-even-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Posts
            </CardTitle>
            <FileText className="h-4 w-4 text-primary-magenta" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{total}</div>
            <p className="text-xs text-gray-500">Community posts</p>
          </CardContent>
        </Card>
      </div>

      {/* Posts Table */}
      <Card className="bg-white shadow-even-md">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">
            Posts ({total})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-magenta"></div>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Post</TableHead>
                    <TableHead>Query</TableHead>
                    <TableHead>Author</TableHead>
                    <TableHead>Engagement</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {posts.map((post) => (
                    <TableRow key={post._id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center space-x-3">
                          {post.image && (
                            <img
                              src={post.image}
                              alt="Post"
                              className="w-10 h-10 rounded object-cover"
                            />
                          )}
                          <div className="max-w-48 truncate" title={post.query}>
                            Post Image
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div
                          className="max-w-64 text-sm text-gray-600"
                          title={post.query}
                        >
                          {truncateText(post.query, 100)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium text-sm">
                            {getCreatorName(post.user)}
                          </span>
                          <span className="text-xs text-gray-500">
                            {getCreatorRole(post.user)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col text-sm text-gray-600">
                          <span>❤️ {post.likes?.length || 0} likes</span>
                          <span>💬 {post.comments?.length || 0} comments</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {new Date(post.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => viewPost(post)}
                            className="h-8 w-8 p-0"
                            title="View Post"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => deletePost(post._id)}
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                            title="Delete Post"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-gray-600">
                    Showing {(currentPage - 1) * 10 + 1} to{" "}
                    {Math.min(currentPage * 10, total)} of {total} posts
                  </p>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <span className="text-sm text-gray-600">
                      Page {currentPage} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* View Post Modal */}
      {isViewModalOpen && selectedPost && (
        <div className="fixed inset-0 bg-transparent flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl max-h-[90vh] overflow-y-auto m-4 w-full">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-900">
                View Post Details
              </h2>
              <Button
                variant="outline"
                size="sm"
                onClick={closeViewModal}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="p-6 space-y-6">
              {/* Post Image */}
              {selectedPost.image && (
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-gray-700">
                    Post Image
                  </h3>
                  <img
                    src={selectedPost.image}
                    alt="Post"
                    className="w-full h-64 object-cover rounded-lg border"
                  />
                </div>
              )}

              {/* Post Query */}
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-gray-700">Query</h3>
                <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">
                  {selectedPost.query}
                </p>
              </div>

              {/* Author Information */}
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-gray-700">Author</h3>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="flex flex-col space-y-1">
                    <span className="font-medium">
                      {getCreatorName(selectedPost.user)}
                    </span>
                    <span className="text-sm text-gray-600">
                      Role: {getCreatorRole(selectedPost.user)}
                    </span>
                    {selectedPost.user?.email && (
                      <span className="text-sm text-gray-600">
                        Email: {selectedPost.user.email}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Location */}
              {selectedPost.location && (
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-gray-700">
                    Location
                  </h3>
                  <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">
                    {formatLocation(selectedPost.location)}
                  </p>
                </div>
              )}

              {/* Engagement Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">❤️</span>
                    <div>
                      <p className="font-medium text-gray-900">
                        {selectedPost.likes?.length || 0}
                      </p>
                      <p className="text-sm text-gray-600">Likes</p>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">💬</span>
                    <div>
                      <p className="font-medium text-gray-900">
                        {selectedPost.comments?.length || 0}
                      </p>
                      <p className="text-sm text-gray-600">Comments</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Post Metadata */}
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-gray-700">
                  Post Information
                </h3>
                <div className="bg-gray-50 p-3 rounded-lg space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Post ID:</span>
                    <span className="text-sm font-mono text-gray-900">
                      {selectedPost._id}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Created:</span>
                    <span className="text-sm text-gray-900">
                      {new Date(selectedPost.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
