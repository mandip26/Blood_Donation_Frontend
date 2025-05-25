import { QuoteIcon } from "lucide-react";
import TestimonialUser from "../../../assets/landingPage/testimonial_user.jpg";
import { useEffect, useState } from "react";
import { testimonialService } from "../../../services/apiService";
import { motion } from "framer-motion";

interface Testimonial {
  _id: string;
  authorName: string;
  authorRole: string;
  avatar?: string;
  quote: string;
  detailedFeedback?: string;
  createdAt: string;
}

export default function Testimonials() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTestimonial, setSelectedTestimonial] = useState<number>(0);
  const [autoRotate, setAutoRotate] = useState<boolean>(true);

  // Fetch testimonials
  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        setLoading(true);
        const response = await testimonialService.getAllTestimonials();

        if (response.success && response.testimonials) {
          setTestimonials(response.testimonials);
        } else {
          setError("Failed to load testimonials");
        }
      } catch (err) {
        setError("Failed to load testimonials. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchTestimonials();
  }, []);

  // Auto-rotate testimonials
  useEffect(() => {
    if (!autoRotate || testimonials.length <= 1 || loading) return;

    const interval = setInterval(() => {
      setSelectedTestimonial((prev) =>
        prev === testimonials.length - 1 ? 0 : prev + 1
      );
    }, 6000); // Rotate every 6 seconds

    return () => clearInterval(interval);
  }, [autoRotate, testimonials, loading]);

  // Pause auto-rotation when user interacts
  const handleTestimonialClick = (index: number) => {
    setSelectedTestimonial(index);
    setAutoRotate(false);

    // Resume auto-rotation after 30 seconds of inactivity
    const timer = setTimeout(() => {
      setAutoRotate(true);
    }, 30000);

    return () => clearTimeout(timer);
  };

  return (
    <section
      className="container max-w-7xl mx-auto py-16 px-4"
      data-scroll
      data-scroll-speed="0.1"
    >
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold">Testimonials</h2>
        <p className="text-gray-500 mt-2">
          What our donors and recipients say about us
        </p>
      </div>{" "}
      {loading ? (
        <div className="flex flex-col justify-center items-center h-64 space-y-4">
          <div className="animate-spin rounded-full h-14 w-14 border-4 border-primary-magenta/20 border-t-primary-magenta"></div>
          <p className="text-gray-500 animate-pulse">Loading testimonials...</p>
        </div>
      ) : error ? (
        <div className="text-center py-8 px-4 bg-red-50 rounded-xl">
          <p className="text-red-500 mb-2">⚠️ {error}</p>
          <button
            onClick={() => window.location.reload()}
            className="text-sm text-primary-magenta hover:text-primary-magenta/80 underline"
          >
            Try again
          </button>
        </div>
      ) : testimonials.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl">
          <p className="text-gray-500 mb-2">No testimonials available yet</p>
          <p className="text-sm text-gray-400">Check back soon!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Featured testimonial */}
          {testimonials.length > 0 && (
            <motion.div
              className="lg:col-span-3 bg-gradient-to-br from-pink-50 to-pink-100 rounded-xl p-6 relative overflow-hidden shadow-md"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              key={testimonials[selectedTestimonial]._id}
              whileHover={{ boxShadow: "0 8px 30px rgba(0,0,0,0.12)" }}
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 0.3 }}
                transition={{ duration: 0.5 }}
                className="text-primary-magenta absolute top-4 left-4"
              >
                <QuoteIcon size={36} />
              </motion.div>
              <motion.div
                className="mt-8 ml-4"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                key={testimonials[selectedTestimonial]._id}
              >
                <p className="text-gray-700 mb-6 text-lg">
                  "{testimonials[selectedTestimonial].quote}"
                </p>
                <p className="text-sm font-semibold">
                  {testimonials[selectedTestimonial].authorName}
                </p>
                <p className="text-xs text-gray-500">
                  {testimonials[selectedTestimonial].authorRole}{" "}
                </p>
                {testimonials[selectedTestimonial].detailedFeedback && (
                  <p className="mt-4 text-sm text-gray-600 italic">
                    "{testimonials[selectedTestimonial].detailedFeedback}"
                  </p>
                )}

                {/* Auto-rotation indicator */}
                {autoRotate && testimonials.length > 1 && (
                  <div className="absolute bottom-4 right-4 flex items-center gap-2">
                    <span className="text-xs text-gray-400">Auto-rotating</span>
                    <span className="h-2 w-2 bg-primary-magenta rounded-full animate-pulse"></span>
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}
          {/* List of testimonials */}
          <div className="lg:col-span-2 grid grid-cols-1 gap-4 max-h-[500px] pr-2 scrollbar-thin scrollbar-thumb-primary-magenta/30 scrollbar-track-transparent hover:scrollbar-thumb-primary-magenta/50">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial._id}
                className={`bg-gray-50 rounded-xl p-4 flex items-center gap-4 cursor-pointer transition-all duration-300 ${
                  selectedTestimonial === index
                    ? "ring-2 ring-primary-magenta/50 shadow-md bg-pink-50"
                    : "hover:bg-gray-100"
                }`}
                whileHover={{
                  scale: 1.02,
                  boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
                  backgroundColor:
                    selectedTestimonial === index ? "#fdf2f8" : "#f9fafb",
                }}
                onClick={() => handleTestimonialClick(index)}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                {" "}
                <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-sm ring-2 ring-gray-100">
                  <img
                    src={testimonial.avatar || TestimonialUser}
                    alt={testimonial.authorName}
                    className="w-full h-full object-cover flex-shrink-0"
                    onError={(e) => {
                      // Fallback to default image if avatar fails to load
                      (e.target as HTMLImageElement).src = TestimonialUser;
                    }}
                  />
                  {selectedTestimonial === index && (
                    <div className="absolute inset-0 ring-4 ring-primary-magenta/30 rounded-full" />
                  )}
                </div>
                <div>
                  <p className="text-gray-700 text-sm font-medium mb-1 line-clamp-2">
                    "{testimonial.quote}"
                  </p>
                  <p className="text-xs font-medium">
                    {testimonial.authorName}
                  </p>
                  <p className="text-xs text-gray-500">
                    {testimonial.authorRole}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
