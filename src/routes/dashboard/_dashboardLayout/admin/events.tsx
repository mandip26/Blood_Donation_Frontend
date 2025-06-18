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
import { Search, Calendar, Trash2, Clock } from "lucide-react";
import { toast } from "sonner";
import { adminApi } from "@/lib/api";

interface Event {
  _id: string;
  title: string;
  description: string;
  venue: string;
  location?: string;
  date: string;
  status: string;
  createdBy?: {
    _id: string;
    name?: string;
    organizationName?: string;
    hospitalName?: string;
    email: string;
    role: string;
  };
  createdAt: string;
}

export const Route = createFileRoute(
  "/dashboard/_dashboardLayout/admin/events"
)({
  component: EventsManagement,
});

function EventsManagement() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchEvents();
  }, [search, currentPage]);

  const fetchEvents = async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "10",
        ...(search && { search }),
      });

      const data = await adminApi.getEvents(params);

      if (data.success) {
        setEvents(data.data.events);
        setTotalPages(data.data.pages);
        setTotal(data.data.total);
      } else {
        toast.error(data.message || "Failed to fetch events");
      }
    } catch (error) {
      console.error("Error fetching events:", error);
      toast.error("Failed to fetch events");
    } finally {
      setLoading(false);
    }
  };

  const deleteEvent = async (eventId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this event? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      await adminApi.deleteEvent(eventId);

      setEvents(events.filter((event) => event._id !== eventId));
      setTotal(total - 1);
      toast.success("Event deleted successfully");
    } catch (error) {
      console.error("Error deleting event:", error);
      toast.error("Failed to delete event");
    }
  };

  const getCreatorName = (creator: Event["createdBy"]) => {
    if (!creator) return "Unknown";
    return (
      creator.name ||
      creator.organizationName ||
      creator.hospitalName ||
      "Unknown"
    );
  };

  const getCreatorRole = (creator: Event["createdBy"]) => {
    if (!creator || !creator.role) return "Unknown";
    return creator.role;
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">Event Management</h1>
        <p className="text-gray-600">
          Manage and monitor all events in the system
        </p>
      </div>

      {/* Search and Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-2">
          <Card className="bg-white shadow-even-md">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Filters</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by title, venue..."
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
              Total Events
            </CardTitle>
            <Calendar className="h-4 w-4 text-primary-magenta" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{total}</div>
            <p className="text-xs text-gray-500">All events</p>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-even-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Pending Approval
            </CardTitle>
            <Clock className="h-4 w-4 text-primary-magenta" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {events.filter((e) => e.status === "pending").length}
            </div>
            <p className="text-xs text-gray-500">Awaiting review</p>
          </CardContent>
        </Card>
      </div>

      {/* Events Table */}
      <Card className="bg-white shadow-even-md">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">
            Events ({total})
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
                    <TableHead>Title</TableHead>
                    <TableHead>Venue</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Creator</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {events.map((event) => (
                    <TableRow key={event._id}>
                      <TableCell className="font-medium">
                        <div className="max-w-48 truncate" title={event.title}>
                          {event.title}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div
                          className="max-w-32 truncate"
                          title={event.venue || "No venue"}
                        >
                          {event.venue || "No venue"}
                        </div>
                      </TableCell>
                      <TableCell>
                        {new Date(event.date).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium text-sm">
                            {getCreatorName(event.createdBy)}
                          </span>
                          <span className="text-xs text-gray-500">
                            {getCreatorRole(event.createdBy)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {new Date(event.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => deleteEvent(event._id)}
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                            title="Delete Event"
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
                    {Math.min(currentPage * 10, total)} of {total} events
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
