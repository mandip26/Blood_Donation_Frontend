import { Clock, MapPin, Calendar } from "lucide-react";
import { useEffect, useState } from "react";
import axios from "axios";
import { format, parseISO, isValid } from "date-fns";

// Define the event interface based on API response
interface Event {
  _id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  venue: string;
  image: string;
}

export default function BloodDonationEvents() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          "http://localhost:8001/api/v1/events/"
        );
        if (response.data.success && Array.isArray(response.data.events)) {
          setEvents(response.data.events);
        } else if (response.data.success && Array.isArray(response.data)) {
          // Fallback in case the events are returned directly as an array
          setEvents(response.data);
        } else {
          setError("Failed to fetch events");
        }
      } catch (err) {
        console.error("Error fetching events:", err);
        setError("An error occurred while fetching events");
      } finally {
        setLoading(false);
      }
    };

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

  if (loading) {
    return (
      <section className="container max-w-7xl mx-auto py-16 px-4 text-center">
        <h2 className="text-4xl font-bold mb-12">Blood Donation Events</h2>
        <div className="flex justify-center items-center">
          <div className="w-12 h-12 border-4 border-primary-magenta border-t-transparent rounded-full animate-spin"></div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="container max-w-7xl mx-auto py-16 px-4 text-center">
        <h2 className="text-4xl font-bold mb-12">Blood Donation Events</h2>
        <p className="text-red-500">{error}</p>
      </section>
    );
  }
  return (
    <section
      id="blood-donation-events"
      className="container max-w-7xl mx-auto py-16 px-4"
      data-scroll
      data-scroll-speed="0.1"
    >
      <h2 className="text-center text-4xl font-bold mb-12">
        Blood Donation Events
      </h2>

      {events.length === 0 ? (
        <p className="text-center">No upcoming events at the moment.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {events.slice(0, 3).map((event) => (
            <div key={event._id} className="flex flex-col">
              <div className="relative mb-3">
                <img
                  src={
                    event.image || "https://placehold.co/400x300/e3e3e3/707070"
                  }
                  alt={event.title}
                  className="w-full h-56 object-cover rounded-lg"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      "https://placehold.co/400x300/e3e3e3/707070";
                  }}
                />
                <div className="absolute bottom-0 left-0 bg-primary-magenta/80 text-white px-3 py-1 rounded-tr-lg flex items-center gap-1">
                  <Clock size={16} />
                  <span className="text-sm">{event.time}</span>
                </div>
              </div>
              <h3 className="font-bold text-lg mb-2">{event.title}</h3>
              <p className="text-gray-600 mb-2 text-sm line-clamp-2">
                {event.description}
              </p>
              <div className="flex items-center gap-1 text-gray-500 text-sm">
                <Calendar size={14} />
                <span>{formatDate(event.date)}</span>
              </div>
              <div className="flex items-center gap-1 text-gray-500 text-sm mt-1">
                <MapPin size={14} />
                <span>{event.venue}</span>
              </div>
              <button className="mt-3 w-full py-2 text-sm bg-primary-magenta text-white rounded-md hover:bg-primary-magenta/90 transition">
                View Details
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
