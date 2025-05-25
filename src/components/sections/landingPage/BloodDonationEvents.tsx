import { Clock, MapPin } from "lucide-react";
import { useEffect, useState } from "react";
import axios from "axios";

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
        if (response.data.success) {
          setEvents(response.data.events);
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

  if (loading) {
    return (
      <section className="container max-w-7xl mx-auto py-16 px-4 text-center">
        <h2 className="text-4xl font-bold mb-12">Blood Donation Events</h2>
        <p>Loading events...</p>
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
              <p className="text-gray-600 mb-2 text-sm">{event.description}</p>
              <div className="flex items-center gap-1 text-gray-500 text-sm mt-auto">
                <MapPin size={14} />
                <span>{event.venue}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
