import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import LoadingState from "@/components/common/LoadingState";
import axios from "axios";
import { format, parseISO, isValid } from "date-fns";

// Define types
interface Event {
  _id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  venue: string;
  image?: string;
}

export const Route = createFileRoute("/dashboard/_dashboardLayout/events")({
  component: EventsPage,
});

function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get("http://localhost:8001/api/v1/events/", {
        withCredentials: true,
      });

      if (response.data.success && Array.isArray(response.data.events)) {
        setEvents(response.data.events);
      } else if (response.data.success && Array.isArray(response.data)) {
        // Fallback in case the events are returned directly as an array
        setEvents(response.data);
      } else {
        setError(
          "Failed to load events: " + (response.data.message || "Unknown error")
        );
      }
      setLastRefreshed(new Date());
    } catch (err) {
      console.error("Error fetching events:", err);
      setError("Failed to load events. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  // Format date to be more readable
  const formatDate = (dateString: string) => {
    try {
      const parsedDate = parseISO(dateString);
      if (isValid(parsedDate)) {
        return format(parsedDate, "MMMM d, yyyy");
      }
      // Fallback to simple formatting if date-fns can't parse
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return dateString; // Return the original string if all parsing fails
    }
  };

  // Display loading overlay only when refreshing data but already have events loaded
  const showLoadingOverlay = loading && events.length > 0;

  // Show dedicated loading state when initially loading with no data
  if (loading && events.length === 0) {
    return <LoadingState />;
  }

  if (error && events.length === 0) {
    return (
      <div className="text-center p-8">
        <p className="text-red-500">{error}</p>
        <button
          className="mt-4 px-4 py-2 bg-primary-magenta text-white rounded-md"
          onClick={() => fetchEvents()}
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 relative">
      {showLoadingOverlay && (
        <div className="absolute inset-0 bg-white/70 z-10 flex items-center justify-center">
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 border-4 border-primary-magenta border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-2 text-primary-magenta">Updating events...</p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl p-6 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Blood Donation Events</h2>
          <button
            onClick={() => fetchEvents()}
            className="px-4 py-1 bg-primary-magenta text-white text-sm rounded-md hover:bg-primary-magenta/90 transition disabled:opacity-50"
            disabled={loading}
          >
            {loading ? "Refreshing..." : "Refresh"}
          </button>
        </div>
        <p className="text-gray-600">
          Find and participate in upcoming blood donation events near you.
        </p>
        {lastRefreshed && (
          <p className="text-xs text-gray-400 mt-2">
            Last updated: {lastRefreshed.toLocaleTimeString()}
          </p>
        )}
        {error && <p className="text-xs text-red-500 mt-2">{error}</p>}
      </div>

      {events.length === 0 ? (
        <div className="text-center p-8 bg-white rounded-xl shadow-sm">
          <p className="text-gray-500">
            No events found. Check back later for upcoming events.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {events.map((event) => (
            <div key={event._id} className="bg-white p-6 rounded-xl shadow-sm">
              {event.image && (
                <img
                  src={event.image}
                  alt={event.title}
                  className="w-full h-40 object-cover rounded-lg mb-4"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      "https://placehold.co/400x300/e3e3e3/707070";
                  }}
                />
              )}
              {!event.image && (
                <div className="w-full h-40 bg-gray-200 rounded-lg mb-4 flex items-center justify-center">
                  <span className="text-gray-400">No image available</span>
                </div>
              )}
              <h3 className="text-xl font-bold text-gray-800">{event.title}</h3>
              <p className="text-gray-600 mt-2 line-clamp-2">
                {event.description}
              </p>
              <div className="mt-4 space-y-2">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Date:</span>{" "}
                  {formatDate(event.date)}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Time:</span> {event.time}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Venue:</span> {event.venue}
                </p>
              </div>
              <button className="mt-4 w-full py-2 bg-primary-magenta text-white rounded-md hover:bg-primary-magenta/90 transition">
                Register for Event
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
