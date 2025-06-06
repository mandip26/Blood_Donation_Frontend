import { createLazyFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Search,
  Filter,
  Calendar,
  MapPin,
  Clock,
  ChevronDown,
  X,
  Check,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { donationService } from "@/services/apiService";
import { useAuth } from "@/hooks/useAuth";
import { useResponsive } from "@/hooks/useResponsive";

export const Route = createLazyFileRoute("/dashboard/_dashboardLayout/events")({
  component: EventsComponent,
});

interface BloodDonationEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  venue: string;
  organizer: string;
  description: string;
  image: string;
  registeredCount: number;
  capacity: number;
}

function EventsComponent() {
  // Get auth context
  const { user } = useAuth();
  // Get responsive design hooks
  const { isMobile: _ } = useResponsive(); // Using underscore to indicate intentionally unused variable

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<BloodDonationEvent | null>(
    null
  );
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showDonateForm, setShowDonateForm] = useState(false);

  // Form state for donate form
  const [formData, setFormData] = useState({
    fullName: "",
    dateOfBirth: "",
    phoneNo: "",
    bloodType: "",
    disability: "no",
    gender: "male",
    email: "",
    idProofType: "PAN",
    idProofNumber: "",
    weight: "",
    hemoglobinCount: "",
    healthy: "yes",
    declaration: false,
  });

  // Validation state
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const cities = [
    "Delhi",
    "Mumbai",
    "Bangalore",
    "Chennai",
    "Hyderabad",
    "Kolkata",
  ];
  const dates = ["Today", "Tomorrow", "This Week", "This Month"];

  // Populate form with user data if available
  useEffect(() => {
    if (user) {
      setFormData((prevData) => ({
        ...prevData,
        fullName: user.name || prevData.fullName,
        email: user.email || prevData.email,
        phoneNo: user.phone || prevData.phoneNo,
      }));
    }
  }, [user]);

  // Handle input changes for donate form
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type } = e.target;

    if (type === "checkbox") {
      const checkboxInput = e.target as HTMLInputElement;
      setFormData({
        ...formData,
        [name]: checkboxInput.checked,
      });
    } else if (type === "radio") {
      setFormData({
        ...formData,
        [name]: value,
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }

    // Clear error for this field when user makes changes
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: "",
      });
    }
  };

  // Form validation
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Required fields
    if (!formData.fullName.trim()) newErrors.fullName = "Name is required";
    if (!formData.dateOfBirth.trim())
      newErrors.dateOfBirth = "Date of birth is required";
    if (!formData.phoneNo.trim())
      newErrors.phoneNo = "Phone number is required";
    if (!formData.bloodType) newErrors.bloodType = "Blood type is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    if (!formData.idProofNumber?.trim())
      newErrors.idProofNumber = "ID proof number is required";

    // Phone validation
    if (
      formData.phoneNo &&
      !/^\d{10}$/.test(formData.phoneNo.replace(/\s/g, ""))
    ) {
      newErrors.phoneNo = "Please enter a valid 10-digit phone number";
    }

    // Email validation
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Age validation (must be at least 18)
    if (formData.dateOfBirth) {
      const birthDate = new Date(formData.dateOfBirth);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();

      if (
        monthDiff < 0 ||
        (monthDiff === 0 && today.getDate() < birthDate.getDate())
      ) {
        age--;
      }

      if (age < 18) {
        newErrors.dateOfBirth =
          "You must be at least 18 years old to donate blood";
      }
    }

    // Weight validation (if provided)
    if (
      formData.weight &&
      (isNaN(Number(formData.weight)) ||
        Number(formData.weight) < 30 ||
        Number(formData.weight) > 200)
    ) {
      newErrors.weight = "Please enter a valid weight between 30-200 kg";
    }

    // Hemoglobin validation (if provided)
    if (
      formData.hemoglobinCount &&
      (isNaN(Number(formData.hemoglobinCount)) ||
        Number(formData.hemoglobinCount) < 5 ||
        Number(formData.hemoglobinCount) > 20)
    ) {
      newErrors.hemoglobinCount =
        "Please enter a valid hemoglobin count between 5-20 g/dL";
    }

    // Declaration required
    if (!formData.declaration) {
      newErrors.declaration = "You must agree to the declaration";
    }

    return newErrors;
  };

  const events: BloodDonationEvent[] = [
    {
      id: "1",
      title: "Community Blood Drive",
      date: "2025-05-25",
      time: "10:00 AM - 4:00 PM",
      venue: "City Community Center, Delhi",
      organizer: "Delhi Blood Bank",
      description:
        "Join our community blood drive to help save lives. We need all blood types, especially O- and AB+. Refreshments will be provided to all donors.",
      image: "https://placehold.co/600x400?text=Blood+Drive",
      registeredCount: 45,
      capacity: 100,
    },
    {
      id: "2",
      title: "Apollo Hospital Blood Donation Camp",
      date: "2025-06-05",
      time: "9:00 AM - 2:00 PM",
      venue: "Apollo Hospital, Mumbai",
      organizer: "Apollo Hospital",
      description:
        "Apollo Hospital is organizing a blood donation camp to replenish its blood bank supplies. All donors will receive a free basic health checkup.",
      image: "https://placehold.co/600x400?text=Apollo+Hospital",
      registeredCount: 32,
      capacity: 80,
    },
    {
      id: "3",
      title: "University Blood Donation Drive",
      date: "2025-06-12",
      time: "11:00 AM - 5:00 PM",
      venue: "University Campus, Bangalore",
      organizer: "Medical Students Association",
      description:
        "The Medical Students Association is organizing a blood donation drive at the university campus. Come support this student-led initiative!",
      image: "https://placehold.co/600x400?text=University+Drive",
      registeredCount: 28,
      capacity: 120,
    },
    {
      id: "4",
      title: "Corporate Blood Donation Event",
      date: "2025-06-15",
      time: "10:00 AM - 3:00 PM",
      venue: "Tech Park, Chennai",
      organizer: "TechCorp Inc.",
      description:
        "TechCorp is hosting a blood donation event as part of its CSR initiative. Open to all employees and the general public.",
      image: "https://placehold.co/600x400?text=Corporate+Event",
      registeredCount: 15,
      capacity: 60,
    },
    {
      id: "5",
      title: "Summer Blood Donation Festival",
      date: "2025-06-20",
      time: "9:00 AM - 6:00 PM",
      venue: "Central Park, Hyderabad",
      organizer: "Hyderabad Blood Bank Association",
      description:
        "A full-day event with entertainment, food stalls, and blood donation facilities. Bring your family and make it a day of giving back!",
      image: "https://placehold.co/600x400?text=Summer+Festival",
      registeredCount: 67,
      capacity: 200,
    },
  ];

  // Format date function
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Filter events based on search term and filters
  const filteredEvents = events.filter((event) => {
    const matchesSearch =
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.organizer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.venue.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCity = selectedCity
      ? event.venue.includes(selectedCity)
      : true;

    let matchesDate = true;
    if (selectedDate) {
      const eventDate = new Date(event.date);
      const today = new Date();

      if (selectedDate === "Today") {
        matchesDate = eventDate.toDateString() === today.toDateString();
      } else if (selectedDate === "Tomorrow") {
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);
        matchesDate = eventDate.toDateString() === tomorrow.toDateString();
      } else if (selectedDate === "This Week") {
        const nextWeek = new Date(today);
        nextWeek.setDate(today.getDate() + 7);
        matchesDate = eventDate >= today && eventDate <= nextWeek;
      } else if (selectedDate === "This Month") {
        matchesDate =
          eventDate.getMonth() === today.getMonth() &&
          eventDate.getFullYear() === today.getFullYear();
      }
    }

    return matchesSearch && matchesCity && matchesDate;
  });
  // Handle event click to view details
  const handleEventClick = (event: BloodDonationEvent) => {
    setSelectedEvent(event);
  };

  // Handle registration confirmation
  const handleConfirmRegistration = () => {
    setShowConfirmModal(false);
    setShowDonateForm(true);
  };

  // Form submission for donate form
  const handleDonateFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      setIsSubmitting(true);
      setApiError(null);

      // Prepare donor data
      const donorData = {
        fullName: formData.fullName,
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender as "male" | "female" | "other",
        bloodType: formData.bloodType,
        weight: formData.weight ? Number(formData.weight) : 0,
        hemoglobinCount: formData.hemoglobinCount
          ? Number(formData.hemoglobinCount)
          : undefined,
        disability: formData.disability as "yes" | "no",
        healthy: formData.healthy as "yes" | "no",
        phoneNo: formData.phoneNo,
        email: formData.email,
        idProofType: formData.idProofType as "PAN" | "Aadhaar" | "VoterID",
        idProofNumber: formData.idProofNumber,
      };

      // Register donor
      const response = await donationService.registerDonor(donorData);
      console.log("Donation registration successful:", response);

      // Record donation details if API call is successful
      await donationService.recordDonation({
        donorId: response.donorId || user?.id,
        donationDate: new Date().toISOString().split("T")[0],
        hospitalName: selectedEvent?.organizer || "Event Organizer",
        units: 1,
        bloodType: formData.bloodType,
        hemoglobinLevel: formData.hemoglobinCount
          ? Number(formData.hemoglobinCount)
          : undefined,
        notes: `Registered for event: ${selectedEvent?.title}`,
      });

      // Set UI state to show success message
      setIsSubmitted(true);

      // Reset form after submission
      setFormData({
        fullName: "",
        dateOfBirth: "",
        phoneNo: "",
        bloodType: "",
        disability: "no",
        gender: "male",
        email: "",
        idProofType: "PAN",
        idProofNumber: "",
        weight: "",
        hemoglobinCount: "",
        healthy: "yes",
        declaration: false,
      });
    } catch (error) {
      console.error("Error registering donation:", error);
      setApiError("Failed to register donation. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle registration form submission (original form)
  const handleRegistration = (event: React.FormEvent) => {
    event.preventDefault();
    setSelectedEvent(null);
    setShowConfirmModal(true);
  };

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Blood Donation Events</h1>
        <Button className="bg-primary-magenta text-white hover:bg-primary-magenta/90">
          Create Event
        </Button>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Search events by name, organizer, or location"
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-magenta"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex gap-4">
            <div className="relative">
              <Button
                variant="outline"
                className="border border-gray-200 px-4 py-2 flex items-center gap-2"
                onClick={() => setIsFilterOpen(!isFilterOpen)}
              >
                <Filter size={18} />
                Filter
                <ChevronDown size={16} />
              </Button>

              {/* Filter dropdown */}
              {isFilterOpen && (
                <div className="absolute right-0 mt-2 z-10 w-72 bg-white rounded-lg shadow-lg border border-gray-200 p-4">
                  <div className="mb-4">
                    <h3 className="text-sm font-medium mb-2">City</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {cities.map((city) => (
                        <button
                          key={city}
                          className={`py-1 px-2 text-sm rounded ${
                            selectedCity === city
                              ? "bg-primary-magenta text-white"
                              : "bg-gray-100 hover:bg-gray-200"
                          }`}
                          onClick={() =>
                            setSelectedCity(selectedCity === city ? null : city)
                          }
                        >
                          {city}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium mb-2">Date</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {dates.map((date) => (
                        <button
                          key={date}
                          className={`py-1 px-2 text-sm rounded ${
                            selectedDate === date
                              ? "bg-primary-magenta text-white"
                              : "bg-gray-100 hover:bg-gray-200"
                          }`}
                          onClick={() =>
                            setSelectedDate(selectedDate === date ? null : date)
                          }
                        >
                          {date}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4 flex justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedCity(null);
                        setSelectedDate(null);
                      }}
                      className="text-gray-600 mr-2"
                    >
                      Clear All
                    </Button>
                    <Button
                      size="sm"
                      className="bg-primary-magenta text-white hover:bg-primary-magenta/90"
                      onClick={() => setIsFilterOpen(false)}
                    >
                      Apply
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Active filters */}
        {(selectedCity || selectedDate) && (
          <div className="flex gap-2 mt-4">
            {selectedCity && (
              <div className="bg-gray-100 rounded-full px-3 py-1 text-sm flex items-center gap-1">
                City: {selectedCity}
                <button
                  onClick={() => setSelectedCity(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={14} />
                </button>
              </div>
            )}
            {selectedDate && (
              <div className="bg-gray-100 rounded-full px-3 py-1 text-sm flex items-center gap-1">
                Date: {selectedDate}
                <button
                  onClick={() => setSelectedDate(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={14} />
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Event Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEvents.length > 0 ? (
          filteredEvents.map((event) => (
            <div
              key={event.id}
              className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => handleEventClick(event)}
            >
              <div className="h-40 overflow-hidden relative">
                <img
                  src={event.image}
                  alt={event.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-0 left-0 bg-primary-magenta/80 text-white px-3 py-1 rounded-tr-lg">
                  <Calendar size={14} className="inline mr-1" />
                  {formatDate(event.date)}
                </div>
              </div>

              <div className="p-4">
                <h3 className="font-medium text-lg mb-2">{event.title}</h3>
                <p className="text-gray-600 text-sm mb-3">{event.organizer}</p>

                <div className="flex items-center text-gray-500 text-sm mb-2">
                  <MapPin size={14} className="mr-1" />
                  {event.venue}
                </div>

                <div className="flex items-center text-gray-500 text-sm">
                  <Clock size={14} className="mr-1" />
                  {event.time}
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="flex justify-between mb-2">
                    <span className="text-sm">Registration</span>
                    <span className="text-sm font-medium">
                      {event.registeredCount}/{event.capacity}
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary-magenta rounded-full"
                      style={{
                        width: `${(event.registeredCount / event.capacity) * 100}%`,
                      }}
                    ></div>
                  </div>
                </div>
              </div>

              <div className="p-4 pt-0">
                <Button
                  className="w-full bg-primary-magenta text-white hover:bg-primary-magenta/90"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEventClick(event);
                  }}
                >
                  Register Now
                </Button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-10">
            <p className="text-gray-500">No matching events found.</p>
          </div>
        )}
      </div>

      {/* Event Details Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-3xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedEvent(null)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 z-10 bg-white rounded-full p-1"
            >
              <X size={24} />
            </button>
            <div className="h-60 overflow-hidden">
              <img
                src={selectedEvent.image}
                alt={selectedEvent.title}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-6">
              <div className="flex items-start gap-4 mb-6">
                <div className="bg-primary-magenta/10 p-3 rounded-lg flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-primary-magenta" />
                </div>

                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h2 className="text-2xl font-semibold">
                      {selectedEvent.title}
                    </h2>
                  </div>
                  <p className="text-gray-600">{selectedEvent.organizer}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="text-sm text-gray-500 mb-1">Date</h3>
                  <p className="font-medium">
                    {formatDate(selectedEvent.date)}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm text-gray-500 mb-1">Time</h3>
                  <p className="font-medium">{selectedEvent.time}</p>
                </div>
                <div className="col-span-full">
                  <h3 className="text-sm text-gray-500 mb-1">Venue</h3>
                  <p className="font-medium">{selectedEvent.venue}</p>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-sm text-gray-500 mb-2">About This Event</h3>
                <p className="text-gray-800">{selectedEvent.description}</p>
              </div>

              <div className="mb-6">
                <h3 className="text-sm text-gray-500 mb-2">
                  Registration Status
                </h3>
                <div className="flex justify-between mb-2">
                  <span>{selectedEvent.registeredCount} registered</span>
                  <span>
                    {selectedEvent.capacity - selectedEvent.registeredCount}{" "}
                    spots left
                  </span>
                </div>
                <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary-magenta rounded-full"
                    style={{
                      width: `${(selectedEvent.registeredCount / selectedEvent.capacity) * 100}%`,
                    }}
                  ></div>
                </div>
              </div>
              <form onSubmit={handleRegistration}>
                <h3 className="text-lg font-semibold mb-4">
                  Register for this Event
                </h3>

                <div className="text-center py-6">
                  <p className="text-gray-600 mb-6">
                    Ready to make a difference? Click confirm to proceed with
                    your blood donation registration.
                  </p>
                </div>

                <div className="flex justify-end gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setSelectedEvent(null)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="bg-primary-magenta text-white hover:bg-primary-magenta/90"
                  >
                    Confirm Registration
                  </Button>
                </div>
              </form>
            </div>{" "}
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md relative">
            <button
              onClick={() => setShowConfirmModal(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 z-10 bg-white rounded-full p-1"
            >
              <X size={24} />
            </button>

            <div className="p-6 text-center">
              <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-xl font-semibold mb-2">
                Registration Confirmed!
              </h2>
              <p className="text-gray-600 mb-6">
                Great! Now let's complete your donor registration form to
                finalize the process.
              </p>
              <div className="flex justify-center gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowConfirmModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleConfirmRegistration}
                  className="bg-primary-magenta text-white hover:bg-primary-magenta/90"
                >
                  Complete Registration
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Donate Form Modal */}
      {showDonateForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-4xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => {
                setShowDonateForm(false);
                setIsSubmitted(false);
                setApiError(null);
                setErrors({});
              }}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 z-10 bg-white rounded-full p-1"
            >
              <X size={24} />
            </button>

            {isSubmitted ? (
              <div className="p-6 md:p-8 text-center">
                <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="h-8 w-8 text-green-600" />
                </div>
                <h2 className="text-xl md:text-2xl font-semibold mb-2">
                  Donation Registration Complete!
                </h2>
                <p className="text-gray-700 mb-6">
                  Thank you for registering for the blood donation event. Your
                  contribution helps save lives!
                </p>
                <div className="flex justify-center gap-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsSubmitted(false);
                      setShowDonateForm(false);
                    }}
                  >
                    Close
                  </Button>
                  <Button
                    onClick={() => {
                      setIsSubmitted(false);
                      setShowDonateForm(false);
                    }}
                    className="bg-primary-magenta hover:bg-primary-magenta/90"
                  >
                    Done
                  </Button>
                </div>
              </div>
            ) : (
              <div>
                <div className="p-4 md:p-6 flex justify-between items-center border-b">
                  <h1 className="text-xl md:text-2xl font-semibold">
                    Blood Donor Registration Form
                  </h1>
                </div>

                {apiError && (
                  <div className="p-4 m-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
                    <AlertCircle className="h-5 w-5 text-red-500 mr-3 mt-0.5" />
                    <div>
                      <p className="text-red-800 font-medium">Error</p>
                      <p className="text-red-700">{apiError}</p>
                    </div>
                  </div>
                )}

                <form
                  onSubmit={handleDonateFormSubmit}
                  className="p-6 md:p-8 md:pt-0 pt-0"
                >
                  <div className="bg-white rounded-xl shadow-sm p-6 md:p-8 mb-6">
                    {/* Donor Name */}
                    <div className="mb-6">
                      <label className="block text-sm font-medium mb-2">
                        Donor's Name<span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        className={`w-full rounded-full border ${errors.fullName ? "border-red-300" : "border-gray-300"} p-2.5 px-4`}
                        placeholder="Enter Full Name"
                      />
                      {errors.fullName && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.fullName}
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      {/* Date of Birth */}
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Date of Birth<span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="dateOfBirth"
                          value={formData.dateOfBirth}
                          onChange={handleChange}
                          onFocus={(e) => (e.target.type = "date")}
                          max={new Date().toISOString().split("T")[0]}
                          className={`w-full rounded-full border ${errors.dateOfBirth ? "border-red-300" : "border-gray-300"} p-2.5 px-4`}
                          placeholder="DD/MM/YYYY"
                        />
                        {errors.dateOfBirth && (
                          <p className="text-red-500 text-xs mt-1">
                            {errors.dateOfBirth}
                          </p>
                        )}
                      </div>

                      {/* Gender */}
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Gender<span className="text-red-500">*</span>
                        </label>
                        <div className="flex flex-wrap gap-4">
                          <label className="flex items-center">
                            <div
                              className={`w-5 h-5 rounded-full border ${formData.gender === "male" ? "bg-[#c14351] border-[#c14351]" : "border-gray-300"} flex items-center justify-center mr-2`}
                            >
                              {formData.gender === "male" && (
                                <div className="w-2 h-2 bg-white rounded-full"></div>
                              )}
                            </div>
                            <input
                              type="radio"
                              name="gender"
                              value="male"
                              checked={formData.gender === "male"}
                              onChange={handleChange}
                              className="sr-only"
                            />
                            Male
                          </label>
                          <label className="flex items-center">
                            <div
                              className={`w-5 h-5 rounded-full border ${formData.gender === "female" ? "bg-[#c14351] border-[#c14351]" : "border-gray-300"} flex items-center justify-center mr-2`}
                            >
                              {formData.gender === "female" && (
                                <div className="w-2 h-2 bg-white rounded-full"></div>
                              )}
                            </div>
                            <input
                              type="radio"
                              name="gender"
                              value="female"
                              checked={formData.gender === "female"}
                              onChange={handleChange}
                              className="sr-only"
                            />
                            Female
                          </label>
                          <label className="flex items-center">
                            <div
                              className={`w-5 h-5 rounded-full border ${formData.gender === "other" ? "bg-[#c14351] border-[#c14351]" : "border-gray-300"} flex items-center justify-center mr-2`}
                            >
                              {formData.gender === "other" && (
                                <div className="w-2 h-2 bg-white rounded-full"></div>
                              )}
                            </div>
                            <input
                              type="radio"
                              name="gender"
                              value="other"
                              checked={formData.gender === "other"}
                              onChange={handleChange}
                              className="sr-only"
                            />
                            Other
                          </label>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      {/* Phone Number */}
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Phone No<span className="text-red-500">*</span>
                        </label>
                        <input
                          type="tel"
                          name="phoneNo"
                          value={formData.phoneNo}
                          onChange={handleChange}
                          className={`w-full rounded-full border ${errors.phoneNo ? "border-red-300" : "border-gray-300"} p-2.5 px-4`}
                          placeholder="00000 00000"
                        />
                        {errors.phoneNo && (
                          <p className="text-red-500 text-xs mt-1">
                            {errors.phoneNo}
                          </p>
                        )}
                      </div>

                      {/* Email */}
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Email<span className="text-red-500">*</span>
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          className={`w-full rounded-full border ${errors.email ? "border-red-300" : "border-gray-300"} p-2.5 px-4`}
                          placeholder="Enter your email"
                        />
                        {errors.email && (
                          <p className="text-red-500 text-xs mt-1">
                            {errors.email}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      {/* Blood Type */}
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Blood Type<span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <select
                            name="bloodType"
                            value={formData.bloodType}
                            onChange={handleChange}
                            className={`w-full rounded-full border ${errors.bloodType ? "border-red-300" : "border-gray-300"} p-2.5 px-4 appearance-none`}
                          >
                            <option value="">-select-</option>
                            <option value="A+">A+</option>
                            <option value="A-">A-</option>
                            <option value="B+">B+</option>
                            <option value="B-">B-</option>
                            <option value="AB+">AB+</option>
                            <option value="AB-">AB-</option>
                            <option value="O+">O+</option>
                            <option value="O-">O-</option>
                          </select>
                          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                            <svg
                              width="16"
                              height="16"
                              viewBox="0 0 16 16"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <circle cx="8" cy="8" r="8" fill="#E6E6E6" />
                              <path
                                d="M11 7L8 10L5 7"
                                stroke="#666"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </div>
                        </div>
                        {errors.bloodType && (
                          <p className="text-red-500 text-xs mt-1">
                            {errors.bloodType}
                          </p>
                        )}
                      </div>

                      {/* ID Proof */}
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          ID Proof<span className="text-red-500">*</span>
                        </label>
                        <div className="flex flex-wrap gap-4">
                          <label className="flex items-center">
                            <div
                              className={`w-5 h-5 rounded-full border ${formData.idProofType === "PAN" ? "bg-[#c14351] border-[#c14351]" : "border-gray-300"} flex items-center justify-center mr-2`}
                            >
                              {formData.idProofType === "PAN" && (
                                <div className="w-2 h-2 bg-white rounded-full"></div>
                              )}
                            </div>
                            <input
                              type="radio"
                              name="idProofType"
                              value="PAN"
                              checked={formData.idProofType === "PAN"}
                              onChange={handleChange}
                              className="sr-only"
                            />
                            PAN
                          </label>
                          <label className="flex items-center">
                            <div
                              className={`w-5 h-5 rounded-full border ${formData.idProofType === "Aadhaar" ? "bg-[#c14351] border-[#c14351]" : "border-gray-300"} flex items-center justify-center mr-2`}
                            >
                              {formData.idProofType === "Aadhaar" && (
                                <div className="w-2 h-2 bg-white rounded-full"></div>
                              )}
                            </div>
                            <input
                              type="radio"
                              name="idProofType"
                              value="Aadhaar"
                              checked={formData.idProofType === "Aadhaar"}
                              onChange={handleChange}
                              className="sr-only"
                            />
                            Aadhaar
                          </label>
                          <label className="flex items-center">
                            <div
                              className={`w-5 h-5 rounded-full border ${formData.idProofType === "VoterID" ? "bg-[#c14351] border-[#c14351]" : "border-gray-300"} flex items-center justify-center mr-2`}
                            >
                              {formData.idProofType === "VoterID" && (
                                <div className="w-2 h-2 bg-white rounded-full"></div>
                              )}
                            </div>
                            <input
                              type="radio"
                              name="idProofType"
                              value="VoterID"
                              checked={formData.idProofType === "VoterID"}
                              onChange={handleChange}
                              className="sr-only"
                            />
                            Vote ID
                          </label>
                        </div>
                        <div className="mt-2">
                          <input
                            type="text"
                            name="idProofNumber"
                            value={formData.idProofNumber}
                            onChange={handleChange}
                            className={`w-full rounded-full border ${errors.idProofNumber ? "border-red-300" : "border-gray-300"} p-2.5 px-4`}
                            placeholder="Enter ID Number"
                          />
                          {errors.idProofNumber && (
                            <p className="text-red-500 text-xs mt-1">
                              {errors.idProofNumber}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      {/* Any Disability */}
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Any Disability<span className="text-red-500">*</span>
                        </label>
                        <div className="flex flex-wrap gap-4">
                          <label className="flex items-center">
                            <div
                              className={`w-5 h-5 rounded-full border ${formData.disability === "no" ? "bg-[#c14351] border-[#c14351]" : "border-gray-300"} flex items-center justify-center mr-2`}
                            >
                              {formData.disability === "no" && (
                                <div className="w-2 h-2 bg-white rounded-full"></div>
                              )}
                            </div>
                            <input
                              type="radio"
                              name="disability"
                              value="no"
                              checked={formData.disability === "no"}
                              onChange={handleChange}
                              className="sr-only"
                            />
                            No
                          </label>
                          <label className="flex items-center">
                            <div
                              className={`w-5 h-5 rounded-full border ${formData.disability === "yes" ? "bg-[#c14351] border-[#c14351]" : "border-gray-300"} flex items-center justify-center mr-2`}
                            >
                              {formData.disability === "yes" && (
                                <div className="w-2 h-2 bg-white rounded-full"></div>
                              )}
                            </div>
                            <input
                              type="radio"
                              name="disability"
                              value="yes"
                              checked={formData.disability === "yes"}
                              onChange={handleChange}
                              className="sr-only"
                            />
                            Yes
                          </label>
                        </div>
                      </div>

                      {/* Weight */}
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Weight
                        </label>
                        <input
                          type="text"
                          name="weight"
                          value={formData.weight}
                          onChange={handleChange}
                          className={`w-full rounded-full border ${errors.weight ? "border-red-300" : "border-gray-300"} p-2.5 px-4`}
                          placeholder="weight in Kg's"
                        />
                        {errors.weight && (
                          <p className="text-red-500 text-xs mt-1">
                            {errors.weight}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      {/* Hemoglobin Count */}
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Hemoglobin Count
                        </label>
                        <input
                          type="text"
                          name="hemoglobinCount"
                          value={formData.hemoglobinCount}
                          onChange={handleChange}
                          className={`w-full rounded-full border ${errors.hemoglobinCount ? "border-red-300" : "border-gray-300"} p-2.5 px-4`}
                          placeholder="Enter your count"
                        />
                        {errors.hemoglobinCount && (
                          <p className="text-red-500 text-xs mt-1">
                            {errors.hemoglobinCount}
                          </p>
                        )}
                      </div>

                      {/* Are you Healthy */}
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Are you Healthy
                        </label>
                        <div className="flex flex-wrap gap-4">
                          <label className="flex items-center">
                            <div
                              className={`w-5 h-5 rounded-full border ${formData.healthy === "no" ? "bg-[#c14351] border-[#c14351]" : "border-gray-300"} flex items-center justify-center mr-2`}
                            >
                              {formData.healthy === "no" && (
                                <div className="w-2 h-2 bg-white rounded-full"></div>
                              )}
                            </div>
                            <input
                              type="radio"
                              name="healthy"
                              value="no"
                              checked={formData.healthy === "no"}
                              onChange={handleChange}
                              className="sr-only"
                            />
                            No
                          </label>
                          <label className="flex items-center">
                            <div
                              className={`w-5 h-5 rounded-full border ${formData.healthy === "yes" ? "bg-[#c14351] border-[#c14351]" : "border-gray-300"} flex items-center justify-center mr-2`}
                            >
                              {formData.healthy === "yes" && (
                                <div className="w-2 h-2 bg-white rounded-full"></div>
                              )}
                            </div>
                            <input
                              type="radio"
                              name="healthy"
                              value="yes"
                              checked={formData.healthy === "yes"}
                              onChange={handleChange}
                              className="sr-only"
                            />
                            Yes
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Declaration */}
                    <div className="mb-6">
                      <label className="flex items-start">
                        <div
                          className={`w-5 h-5 border rounded flex items-center justify-center mt-0.5 ${errors.declaration ? "border-red-300" : formData.declaration ? "bg-[#c14351] border-[#c14351]" : "border-gray-300"}`}
                        >
                          {formData.declaration && (
                            <Check className="h-3 w-3 text-white" />
                          )}
                        </div>
                        <input
                          type="checkbox"
                          name="declaration"
                          checked={formData.declaration}
                          onChange={handleChange}
                          className="sr-only"
                        />
                        <span className="ml-3 text-sm">
                          I have read and understood all the information
                          presented above and answered all the questions to the
                          best of my knowledge, and hereby declare that
                          <span className="text-red-500">*</span>
                        </span>
                      </label>
                      {errors.declaration && (
                        <p className="text-red-500 text-xs mt-1 ml-8">
                          {errors.declaration}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-center">
                    <button
                      type="submit"
                      className={`rounded-full bg-[#c14351] text-white py-2.5 px-6 ${isSubmitting ? "opacity-75" : "hover:bg-[#a23543]"}`}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 inline animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        "Save & Continue"
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
