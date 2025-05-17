import { Clock } from "lucide-react";

export default function BloodDonationEvents() {
  // Mock event data - in a real project, this would come from an API or database
  const events = [
    {
      id: 1,
      title: "Blood Donation for Independence Day",
      time: "10 am - 1 pm",
      description: "Lorem ipsum dolor sit amet, consectetur adipisicing elit.",
      image: "https://placehold.co/400x300/e3e3e3/707070",
    },
    {
      id: 2,
      title: "Blood Donation for Independence Day",
      time: "10 am - 1 pm",
      description: "Lorem ipsum dolor sit amet, consectetur adipisicing elit.",
      image: "https://placehold.co/400x300/e3e3e3/707070",
    },
    {
      id: 3,
      title: "Blood Donation for Independence Day",
      time: "10 am - 1 pm",
      description: "Lorem ipsum dolor sit amet, consectetur adipisicing elit.",
      image: "https://placehold.co/400x300/e3e3e3/707070",
    },
  ];

  return (
    <section
      className="container max-w-7xl mx-auto py-16 px-4"
      data-scroll
      data-scroll-speed="0.1"
    >
      <h2 className="text-center text-4xl font-bold mb-12">
        Blood Donation Event
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {events.map((event) => (
          <div key={event.id} className="flex flex-col">
            <div className="relative mb-3">
              <img
                src={event.image}
                alt={event.title}
                className="w-full h-56 object-cover rounded-lg"
              />
              <div className="absolute bottom-0 left-0 bg-primary-magenta/80 text-white px-3 py-1 rounded-tr-lg flex items-center gap-1">
                <Clock size={16} />
                <span className="text-sm">{event.time}</span>
              </div>
            </div>
            <h3 className="font-bold text-lg mb-2">{event.title}</h3>
            <p className="text-gray-600 text-sm">{event.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
