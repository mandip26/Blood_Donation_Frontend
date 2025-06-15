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
import { Search, FileText, Trash2, Eye } from "lucide-react";
import { toast } from "sonner";
import { adminApi } from "@/lib/api";

interface Post {
  _id: string;
  query: string;
  image: string;
  location?: any;
  likes: any[];
  comments: any[];
  shares: number;
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
                          <span>🔄 {post.shares || 0} shares</span>
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
                            onClick={() => {
                              // Open post in new tab or modal for viewing
                              window.open(
                                `/dashboard/posts/${post._id}`,
                                "_blank"
                              );
                            }}
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
    </div>
  );
}
