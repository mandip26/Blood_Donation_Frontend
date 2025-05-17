import { QuoteIcon } from "lucide-react";
import TestimonialUser from "../../../assets/landingPage/testimonial_user.jpg"

export default function Testimonials() {
  // Mock testimonial data
  const testimonials = [
    {
      id: 1,
      quote:
        "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Amet cupiditate dignissimos eaque ipsum magni minima modi. Cum saelis minimus perspiciatis possimus.",
      name: "CEO of Apple Without Code",
      highlighted: true,
    },
    {
      id: 2,
      quote: "An amazing buyer network!",
      name: "CEO of Apple Without Code",
      highlighted: false,
    },
    {
      id: 3,
      quote: "Favorite site to find tools!",
      name: "CEO of Apple Without Code",
      highlighted: false,
    },
    {
      id: 4,
      quote: "An amazing buyer network!",
      name: "CEO in July 31, 2022",
      highlighted: false,
    },
    {
      id: 5,
      quote: "An amazing buyer network!",
      name: "CEO in July 31, 2022",
      highlighted: false,
    },
  ];

  return (
    <section
      className="container max-w-7xl mx-auto py-16 px-4"
      data-scroll
      data-scroll-speed="0.1"
    >
      <h2 className="text-center text-4xl font-bold mb-12">Testimonials</h2>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Highlighted testimonial */}
        <div className="lg:col-span-2 bg-pink-50 rounded-xl p-6 relative">
          <div className="text-primary-magenta/30 absolute top-4 left-4">
            <QuoteIcon size={36} />
          </div>
          <div className="mt-8 ml-4">
            <p className="text-gray-700 mb-6">{testimonials[0].quote}</p>
            <p className="text-sm font-semibold">{testimonials[0].name}</p>
          </div>
        </div>

        {/* Other testimonials */}
        <div className="lg:col-span-3 grid grid-cols-1 gap-4">
          {testimonials.slice(1).map((testimonial) => (
            <div
              key={testimonial.id}
              className="bg-gray-50 rounded-xl p-4 flex items-center gap-4"
            >
              <img src={TestimonialUser} alt="User" className="w-10 h-10 rounded-full flex-shrink-0" />
              <div>
                <p className="text-gray-700 text-sm font-medium mb-1">
                  "{testimonial.quote}"
                </p>
                <p className="text-xs text-gray-500">{testimonial.name}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
