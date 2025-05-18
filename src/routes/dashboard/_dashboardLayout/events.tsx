import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { LoadingState } from "@/components/common/LoadingState";
import axios from "axios";

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

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://localhost:5000/api/v1/events', {
          withCredentials: true
        });
        setEvents(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching events:", err);
        setError("Failed to load events. Please try again later.");
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  if (loading) {
    return <LoadingState />;
  }

  if (error) {
    return (
      <div className="text-center p-8">
        <p className="text-red-500">{error}</p>
        <button 
          className="mt-4 px-4 py-2 bg-primary-magenta text-white rounded-md"
          onClick={() => window.location.reload()}
        >
          Try Again
        </button>
      </div>
    );
  }

  // Format date to be more readable
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6 p-4">
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h2 className="text-2xl font-bold mb-4">Blood Donation Events</h2>
        <p className="text-gray-600">Find and participate in upcoming blood donation events near you.</p>
      </div>

      {events.length === 0 ? (
        <div className="text-center p-8 bg-white rounded-xl shadow-sm">
          <p className="text-gray-500">No events found. Check back later for upcoming events.</p>
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
                />
              )}
              <h3 className="text-xl font-bold text-gray-800">{event.title}</h3>
              <p className="text-gray-600 mt-2">{event.description}</p>
              <div className="mt-4 space-y-2">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Date:</span> {formatDate(event.date)}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Time:</span> {event.time}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Venue:</span> {event.venue}
                </p>
              </div>
              <button className="mt-4 w-full py-2 bg-primary-magenta text-white rounded-md hover:bg-primary-magenta/90 transition">
                Register
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
