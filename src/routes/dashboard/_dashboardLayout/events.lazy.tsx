import {
  createLazyFileRoute,
  useSearch,
  useNavigate,
} from "@tanstack/react-router";
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
  Upload,
  Trash2,
  Heart,
  User,
} from "lucide-react";
import {
  eventService,
  donationService,
  eventRegistrationService,
} from "@/services/apiService";
import { useAuth } from "@/hooks/useAuth";
import { useResponsive } from "@/hooks/useResponsive";

// Define search params type
interface EventsSearchParams {
  focusEvent?: string;
}

export const Route = createLazyFileRoute("/dashboard/_dashboardLayout/events")({
  component: EventsComponent,
});

interface BloodDonationEvent {
  _id: string;
  id?: string;
  title: string;
  description: string;
  date: string;
  time: string;
  venue: string;
  image?: string;
  createdBy: {
    _id: string;
    name: string;
    email: string;
  };
  registrationLimit?: number;
  registeredCount?: number;
  createdAt: string;
  updatedAt: string;
}

interface EventRegistration {
  _id: string;
  event: {
    _id: string;
    title?: string;
    description?: string;
    date?: string;
    time?: string;
    venue?: string;
  };
  user: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
  };
  status: string;
  registrationDate: string;
  createdAt: string;
  updatedAt: string;
}

function EventsComponent() {
  // Get auth context
  const { user } = useAuth();
  // Get responsive design hooks
  const { isMobile: _ } = useResponsive(); // Using underscore to indicate intentionally unused variable
  // Get navigation function
  const navigate = useNavigate();
  // Get search parameters with proper typing
  const searchParams = useSearch({
    from: "/dashboard/_dashboardLayout/events",
  }) as EventsSearchParams;
  const focusEvent = searchParams.focusEvent;

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<BloodDonationEvent | null>(
    null
  );
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showDonateForm, setShowDonateForm] = useState(false);

  // Event management states
  const [events, setEvents] = useState<BloodDonationEvent[]>([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(true);
  const [eventsError, setEventsError] = useState<string | null>(null);
  const [showCreateEventModal, setShowCreateEventModal] = useState(false);
  const [isCreatingEvent, setIsCreatingEvent] = useState(false);
  const [createEventError, setCreateEventError] = useState<string | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [alreadyRegistered, setAlreadyRegistered] = useState(false);
  const [userRegistrations, setUserRegistrations] = useState<{
    [key: string]: boolean | { status: string; registrationId: string };
  }>({});
  const [registrationEventId, setRegistrationEventId] = useState<string | null>(
    null
  );

  // Event registrations management states
  const [showRegistrationsModal, setShowRegistrationsModal] = useState(false);
  const [showEventSelectionModal, setShowEventSelectionModal] = useState(false);
  const [eventRegistrations, setEventRegistrations] = useState<
    EventRegistration[]
  >([]);
  const [isLoadingRegistrations, setIsLoadingRegistrations] = useState(false);
  const [registrationsError, setRegistrationsError] = useState<string | null>(
    null
  );
  const [selectedEventForRegistrations, setSelectedEventForRegistrations] =
    useState<BloodDonationEvent | null>(null);
  const [updatingRegistrationId, setUpdatingRegistrationId] = useState<
    string | null
  >(null);

  // User registrations count modal state
  const [showUserRegistrationsModal, setShowUserRegistrationsModal] =
    useState(false);
  const [userRegistrationsData, setUserRegistrationsData] = useState<
    EventRegistration[]
  >([]);
  const [isLoadingUserRegistrations, setIsLoadingUserRegistrations] =
    useState(false);

  // Create event form state
  const [eventForm, setEventForm] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    startTime: "",
    endTime: "",
    startAmPm: "AM" as "AM" | "PM",
    endAmPm: "PM" as "AM" | "PM",
    venue: "",
    registrationLimit: "",
    image: null as File | null,
  });
  const [eventFormErrors, setEventFormErrors] = useState<
    Record<string, string>
  >({});
  // Donation form state
  const [formData, setFormData] = useState({
    name: "",
    dob: "",
    phone: "",
    bloodType: "",
    disability: false,
    gender: "Male" as "Male" | "Female" | "Other",
    email: "",
    idProofType: "PAN" as "PAN" | "Aadhaar" | "Vote ID",
    idProofImage: null as File | null,
    weight: "",
    hemoglobinCount: "",
    isHealthy: true,
    declarationAccepted: false,
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

  // Function to handle modal closing and URL cleanup
  const handleCloseModal = () => {
    setSelectedEvent(null);
    // Remove focusEvent from URL if present
    navigate({
      to: "/dashboard/events",
      search: (prev) => ({ ...prev, focusEvent: undefined }),
      replace: true,
    });
  };

  // Populate form with user data if available
  useEffect(() => {
    if (user) {
      setFormData((prevData) => ({
        ...prevData,
        name: user.name || prevData.name,
        email: user.email || prevData.email,
        phone: user.phone || prevData.phone,
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
    } else if (type === "file") {
      const fileInput = e.target as HTMLInputElement;
      const file = fileInput.files?.[0] || null;
      setFormData({
        ...formData,
        [name]: file,
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
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.dob.trim()) newErrors.dob = "Date of birth is required";
    if (!formData.phone.trim()) newErrors.phone = "Phone number is required";
    if (!formData.bloodType) newErrors.bloodType = "Blood type is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    if (!formData.weight.trim()) newErrors.weight = "Weight is required";
    if (!formData.hemoglobinCount.trim())
      newErrors.hemoglobinCount = "Hemoglobin count is required";

    // Phone validation
    if (formData.phone && !/^\d{10}$/.test(formData.phone.replace(/\s/g, ""))) {
      newErrors.phone = "Please enter a valid 10-digit phone number";
    }

    // Email validation
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Age validation (must be at least 18)
    if (formData.dob) {
      const birthDate = new Date(formData.dob);
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
        newErrors.dob = "You must be at least 18 years old to donate blood";
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
    if (!formData.declarationAccepted) {
      newErrors.declarationAccepted = "You must agree to the declaration";
    }
    return newErrors;
  };

  // Fetch events and user registrations from API
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setIsLoadingEvents(true);
        setEventsError(null);
        const response = await eventService.getAllEvents();

        if (response.success && response.events) {
          setEvents(response.events);

          // After fetching events, check registration status for each event if user is logged in
          if (user) {
            const registrationChecks = response.events.map(
              async (event: BloodDonationEvent) => {
                try {
                  const regResponse =
                    await eventRegistrationService.checkEventRegistration(
                      event._id
                    );
                  return {
                    eventId: event._id,
                    status: regResponse.status || "pending",
                    registrationId: regResponse.registrationId || "",
                    isRegistered:
                      regResponse.isRegistered &&
                      regResponse.status?.toLowerCase() !== "rejected",
                  };
                } catch (error) {
                  console.error(
                    `Error checking registration for event ${event._id}:`,
                    error
                  );
                  return {
                    eventId: event._id,
                    isRegistered: false,
                    status: "pending",
                    registrationId: "",
                  };
                }
              }
            );

            const registrationResults = await Promise.all(registrationChecks);
            const registrationsMap = registrationResults.reduce(
              (acc, result) => {
                if (result.isRegistered) {
                  acc[result.eventId] = {
                    status: result.status,
                    registrationId: result.registrationId,
                  };
                }
                return acc;
              },
              {} as {
                [key: string]: { status: string; registrationId: string };
              }
            );

            setUserRegistrations(registrationsMap);
          }
        } else {
          setEventsError("Failed to load events");
        }
      } catch (error) {
        console.error("Error fetching events:", error);
        setEventsError("Error loading events. Please try again.");
      } finally {
        setIsLoadingEvents(false);
      }
    };

    fetchEvents();
  }, [user]);

  // Check if the user can create events
  const canCreateEvents = user && user.role && user.role !== "user";

  // Check if the user can delete an event
  const canDeleteEvent = (event: BloodDonationEvent) => {
    if (!user) return false;

    // Users can only delete events they created
    return user._id === event.createdBy?._id;
  };

  // Handle event form changes
  const handleEventFormChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;

    if (type === "file") {
      const fileInput = e.target as HTMLInputElement;
      const file = fileInput.files?.[0] || null;
      setEventForm((prev) => ({ ...prev, [name]: file }));
    } else {
      setEventForm((prev) => {
        const newForm = { ...prev, [name]: value };

        // If start or end time fields change, update the combined time field
        if (
          name === "startTime" ||
          name === "endTime" ||
          name === "startAmPm" ||
          name === "endAmPm"
        ) {
          const startTime = name === "startTime" ? value : prev.startTime;
          const endTime = name === "endTime" ? value : prev.endTime;
          const startAmPm = name === "startAmPm" ? value : prev.startAmPm;
          const endAmPm = name === "endAmPm" ? value : prev.endAmPm;

          if (startTime && endTime) {
            newForm.time = `${startTime} ${startAmPm} - ${endTime} ${endAmPm}`;
          } else if (startTime) {
            newForm.time = `${startTime} ${startAmPm}`;
          } else {
            newForm.time = "";
          }
        }

        return newForm;
      });
    }

    // Clear error for this field
    if (eventFormErrors[name]) {
      setEventFormErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };
  // Validate event form
  const validateEventForm = () => {
    const errors: Record<string, string> = {};

    if (!eventForm.title.trim()) {
      errors.title = "Event title is required";
    }
    if (!eventForm.date) {
      errors.date = "Event date is required";
    }
    if (!eventForm.startTime.trim()) {
      errors.startTime = "Start time is required";
    }
    if (!eventForm.endTime.trim()) {
      errors.endTime = "End time is required";
    }
    if (!eventForm.venue.trim()) {
      errors.venue = "Event venue is required";
    }
    if (
      eventForm.registrationLimit &&
      (isNaN(Number(eventForm.registrationLimit)) ||
        Number(eventForm.registrationLimit) <= 0)
    ) {
      errors.registrationLimit = "Registration limit must be a positive number";
    }

    // Validate time format and logic
    if (eventForm.startTime && eventForm.endTime) {
      const startHour = parseInt(eventForm.startTime.split(":")[0]);
      const startMinute = parseInt(eventForm.startTime.split(":")[1] || "0");
      const endHour = parseInt(eventForm.endTime.split(":")[0]);
      const endMinute = parseInt(eventForm.endTime.split(":")[1] || "0");

      // Convert to 24-hour format for comparison
      let start24 = startHour === 12 ? 0 : startHour;
      if (eventForm.startAmPm === "PM" && startHour !== 12) start24 += 12;
      if (eventForm.startAmPm === "AM" && startHour === 12) start24 = 0;

      let end24 = endHour === 12 ? 0 : endHour;
      if (eventForm.endAmPm === "PM" && endHour !== 12) end24 += 12;
      if (eventForm.endAmPm === "AM" && endHour === 12) end24 = 0;

      const startTotal = start24 * 60 + startMinute;
      const endTotal = end24 * 60 + endMinute;

      if (startTotal >= endTotal) {
        errors.endTime = "End time must be after start time";
      }
    }

    return errors;
  };

  // Handle create event
  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();

    const errors = validateEventForm();
    if (Object.keys(errors).length > 0) {
      setEventFormErrors(errors);
      return;
    }

    try {
      setIsCreatingEvent(true);
      setCreateEventError(null);
      const formData = new FormData();
      formData.append("title", eventForm.title);
      formData.append("description", eventForm.description);
      formData.append("date", eventForm.date);
      formData.append("time", eventForm.time);
      formData.append("venue", eventForm.venue);

      if (eventForm.registrationLimit) {
        formData.append("registrationLimit", eventForm.registrationLimit);
      }
      if (eventForm.image) {
        console.log(
          "Uploading image:",
          eventForm.image.name,
          "Type:",
          eventForm.image.type,
          "Size:",
          eventForm.image.size
        );
        formData.append("image", eventForm.image);
      } else {
        console.log("No image selected for upload");
      }

      console.log("Creating event with FormData:", {
        title: eventForm.title,
        venue: eventForm.venue,
        date: eventForm.date,
        time: eventForm.time,
        hasImage: !!eventForm.image,
      });

      const response = await eventService.createEvent(formData);
      console.log("Create event response:", response);

      if (response.success) {
        console.log("Event created successfully:", response.event);
        // Refresh events list
        const eventsResponse = await eventService.getAllEvents();
        if (eventsResponse.success && eventsResponse.events) {
          console.log(
            "Events refreshed, new count:",
            eventsResponse.events.length
          );
          setEvents(eventsResponse.events);
        } // Reset form and close modal
        setEventForm({
          title: "",
          description: "",
          date: "",
          time: "",
          startTime: "",
          endTime: "",
          startAmPm: "AM",
          endAmPm: "PM",
          venue: "",
          registrationLimit: "",
          image: null,
        });
        setEventFormErrors({});
        setShowCreateEventModal(false);
      } else {
        setCreateEventError(response.message || "Failed to create event");
      }
    } catch (error: any) {
      console.error("Error creating event:", error);
      setCreateEventError(
        error?.response?.data?.message ||
          "Error creating event. Please try again."
      );
    } finally {
      setIsCreatingEvent(false);
    }
  };

  // Handle delete event
  const handleDeleteEvent = async (eventId: string) => {
    if (!confirm("Are you sure you want to delete this event?")) {
      return;
    }

    try {
      const response = await eventService.deleteEvent(eventId);
      if (response.success) {
        // Remove event from local state
        setEvents((prev) => prev.filter((event) => event._id !== eventId));
        // Close event details modal if it's open
        if (selectedEvent && selectedEvent._id === eventId) {
          setSelectedEvent(null);
        }
      } else {
        alert(response.message || "Failed to delete event");
      }
    } catch (error: any) {
      console.error("Error deleting event:", error);
      alert(
        error?.response?.data?.message ||
          "Error deleting event. Please try again."
      );
    }
  };

  // Format date function
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  }; // Filter events based on search term and filters
  const filteredEvents = events.filter((event) => {
    const matchesSearch =
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (event.createdBy?.name || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
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
  const handleEventClick = async (event: BloodDonationEvent) => {
    setSelectedEvent(event);
    setApiError(null); // Reset any previous error messages
    setRegistrationEventId(event._id); // Always store the event ID for registration

    // Check if this is the user's own event
    const isOwnEvent =
      user && event.createdBy && user._id === event.createdBy._id;

    // First check local state (userRegistrations object) for faster UI response
    const userRegistration = user && userRegistrations[event._id];
    const isRegisteredLocally =
      !!userRegistration &&
      typeof userRegistration !== "boolean" &&
      userRegistration.status !== "Rejected" &&
      userRegistration.status !== "rejected";

    if (isRegisteredLocally) {
      setAlreadyRegistered(true);
      return;
    }

    // If not found locally, check with the server for accurate status
    if (user && !isOwnEvent) {
      try {
        const response = await eventRegistrationService.checkEventRegistration(
          event._id
        );
        setAlreadyRegistered(response.isRegistered);

        // If registered according to server but not in local state, update local state
        if (response.isRegistered && !userRegistrations[event._id]) {
          setUserRegistrations((prev) => ({
            ...prev,
            [event._id]: {
              status: response.status || "pending",
              registrationId: response.registrationId || "",
            },
          }));
        }
      } catch (error) {
        console.error("Error checking registration status:", error);
        setAlreadyRegistered(false);
      }
    } else {
      setAlreadyRegistered(false);
    }
  };

  // Handle focusing on a specific event from URL search params
  useEffect(() => {
    if (focusEvent && events.length > 0 && !selectedEvent) {
      const eventToFocus = events.find((event) => event._id === focusEvent);
      if (eventToFocus) {
        // Automatically open the event details modal
        handleEventClick(eventToFocus);
      }
    }
  }, [focusEvent, events]);

  // Handle registration confirmation (step 2)
  const handleRegistrationConfirm = () => {
    // Close confirmation modal and show donation form
    setShowConfirmModal(false);

    // Make sure we have a selected event at this point
    if (!selectedEvent && registrationEventId) {
      // If we only have the ID but not the event object, find it from the events array
      const eventToRegister = events.find((e) => e._id === registrationEventId);
      if (eventToRegister) {
        setSelectedEvent(eventToRegister);
      }
    }

    setShowDonateForm(true);
  }; // Form submission for event registration
  const handleEventRegistrationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    // Get event ID from either selectedEvent or registrationEventId
    const eventId = selectedEvent?._id || registrationEventId;

    if (!eventId) {
      setApiError("No event selected for registration");
      return;
    }

    // Find the full event object if we only have the ID
    const eventToRegister =
      selectedEvent || events.find((e) => e._id === eventId);
    if (!eventToRegister) {
      setApiError("Event information not found");
      return;
    }

    // Check if user is creator of this event
    const isOwnEvent =
      user &&
      eventToRegister.createdBy &&
      user._id === eventToRegister.createdBy._id;

    if (isOwnEvent) {
      setApiError("You cannot register for your own event");
      return;
    }

    // Check if already registered locally first (for better UX)
    if (
      userRegistrations[eventId] &&
      typeof userRegistrations[eventId] !== "boolean" &&
      userRegistrations[eventId].status !== "Rejected" &&
      userRegistrations[eventId].status !== "rejected"
    ) {
      setApiError("You have already registered for this event");
      setAlreadyRegistered(true);
      return;
    }

    try {
      setIsSubmitting(true);
      setApiError(null);
      setIsRegistering(true);

      // First register for the event
      const eventRegistrationResponse =
        await eventRegistrationService.registerForEvent(eventId);
      if (!eventRegistrationResponse.success) {
        throw new Error(
          eventRegistrationResponse.message || "Failed to register for event"
        );
      }

      // Then register as donor using the donation service
      const registrationData = {
        name: formData.name,
        dob: formData.dob,
        gender: formData.gender,
        phone: formData.phone,
        email: formData.email,
        bloodType: formData.bloodType,
        idProofType: formData.idProofType,
        idProofImage: formData.idProofImage,
        disability: formData.disability,
        weight: Number(formData.weight),
        hemoglobinCount: Number(formData.hemoglobinCount),
        isHealthy: formData.isHealthy,
        declarationAccepted: formData.declarationAccepted,
      };

      // Register donor using the donation service
      const response = await donationService.registerDonor(registrationData);
      console.log("Donor registration successful:", response);

      // Update local state to reflect successful registration
      setUserRegistrations((prev) => ({
        ...prev,
        [eventId]: {
          status: "pending",
          registrationId: eventRegistrationResponse.registration?._id || "",
        },
      }));

      // Update event registration count in the events list
      setEvents((prevEvents) =>
        prevEvents.map((event) =>
          event._id === eventId
            ? {
                ...event,
                registeredCount: (event.registeredCount || 0) + 1,
              }
            : event
        )
      );

      // If selectedEvent is set, update its registration count too
      if (selectedEvent && selectedEvent._id === eventId) {
        setSelectedEvent({
          ...selectedEvent,
          registeredCount: (selectedEvent.registeredCount || 0) + 1,
        });
      }

      // Set UI state to show success message
      setIsSubmitted(true);
      setAlreadyRegistered(true); // Update registration status

      // Reset form after submission
      setFormData({
        name: "",
        dob: "",
        phone: "",
        bloodType: "",
        disability: false,
        gender: "Male",
        email: "",
        idProofType: "PAN",
        idProofImage: null,
        weight: "",
        hemoglobinCount: "",
        isHealthy: true,
        declarationAccepted: false,
      });
    } catch (error: any) {
      console.error("Error registering:", error);

      // Set more specific error message
      let errorMessage = "Failed to register for the event. Please try again.";

      if (error.response?.data?.error === "Already registered for this event") {
        errorMessage = "You have already registered for this event.";
        setAlreadyRegistered(true);

        // Also update local state to reflect registration
        if (!userRegistrations[eventId]) {
          setUserRegistrations((prev) => ({
            ...prev,
            [eventId]: {
              status: "pending",
              registrationId: "",
            },
          }));
        }
      } else if (
        error.response?.data?.error === "Cannot register for your own event"
      ) {
        errorMessage = "You cannot register for your own event.";
      } else if (error.response?.status === 401) {
        errorMessage = "You need to be logged in to register for this event.";
      } else if (error.message) {
        errorMessage = error.message;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      setApiError(errorMessage);
    } finally {
      setIsSubmitting(false);
      setIsRegistering(false);
    }
  }; // Handle initial registration (step 1)
  const handleRegistration = (event: React.FormEvent) => {
    event.preventDefault();

    if (!user) {
      setApiError("You need to be logged in to register for an event");
      return;
    }

    // Check if this is the user's own event
    const isOwnEvent =
      user &&
      selectedEvent?.createdBy &&
      user._id === selectedEvent.createdBy._id;
    if (isOwnEvent) {
      setApiError("You cannot register for your own event");
      return;
    }

    // Check if event registration limit is reached
    const isLimitReached =
      selectedEvent?.registrationLimit !== undefined &&
      selectedEvent.registeredCount !== undefined &&
      selectedEvent.registeredCount >= selectedEvent.registrationLimit;

    if (isLimitReached) {
      setApiError("Registration limit for this event has been reached");
      return;
    }

    if (alreadyRegistered) {
      setApiError("You have already registered for this event");
      return;
    }

    // Store the event ID for registration
    if (selectedEvent) {
      setRegistrationEventId(selectedEvent._id);
    }

    setShowConfirmModal(true);
  };

  // Function to fetch event registrations
  const fetchEventRegistrations = async (eventId: string) => {
    if (!eventId) return;

    try {
      setIsLoadingRegistrations(true);
      setRegistrationsError(null);

      const result =
        await eventRegistrationService.getEventRegistrations(eventId);

      if (result && result.success && result.registrations) {
        setEventRegistrations(result.registrations);
      } else {
        setEventRegistrations([]);
      }
    } catch (error) {
      console.error("Error fetching event registrations:", error);
      setRegistrationsError("Failed to load registrations. Please try again.");
      setEventRegistrations([]);
    } finally {
      setIsLoadingRegistrations(false);
    }
  };

  // Function to fetch user registrations data
  const fetchUserRegistrationsData = async () => {
    if (!user) return;

    try {
      setIsLoadingUserRegistrations(true);
      setShowUserRegistrationsModal(true);
      setApiError(null);

      const response =
        await eventRegistrationService.getUserEventRegistrations();

      if (response.success && response.registrations) {
        setUserRegistrationsData(response.registrations);
      } else {
        setUserRegistrationsData([]);
      }
    } catch (error) {
      console.error("Error fetching user registrations:", error);
      setApiError("Failed to load your registrations. Please try again.");
      setUserRegistrationsData([]);
    } finally {
      setIsLoadingUserRegistrations(false);
    }
  };

  // Handle open registrations modal
  const handleViewRegistrations = (event: BloodDonationEvent) => {
    setSelectedEventForRegistrations(event);
    fetchEventRegistrations(event._id);
    setShowRegistrationsModal(true);
  };

  // Handle selecting event from header button
  const handleSelectEventFromHeader = (event: BloodDonationEvent) => {
    setShowEventSelectionModal(false);
    handleViewRegistrations(event);
  };

  // Function to close registrations modal
  const handleCloseRegistrations = () => {
    setShowRegistrationsModal(false);
    setSelectedEventForRegistrations(null);
    setEventRegistrations([]);
    setRegistrationsError(null);
  };

  // Function to update registration status
  const handleUpdateRegistrationStatus = async (
    registrationId: string,
    status: string
  ) => {
    if (!registrationId) return;

    try {
      setUpdatingRegistrationId(registrationId);

      const response = await eventRegistrationService.updateRegistrationStatus(
        registrationId,
        status
      );

      if (response && response.success) {
        // Update the registration in the list
        setEventRegistrations((prevRegistrations) =>
          prevRegistrations.map((reg) => {
            if (reg._id === registrationId) {
              const updatedReg = { ...reg, status };

              // Update userRegistrations state to reflect the change
              const eventId =
                typeof reg.event === "object" ? reg.event._id : reg.event;
              if (status === "Rejected" || status === "rejected") {
                // If rejected, remove from userRegistrations (vacate registration)
                setUserRegistrations((prev) => {
                  const newRegistrations = { ...prev };
                  delete newRegistrations[eventId];
                  return newRegistrations;
                });
              } else {
                // Update status in userRegistrations
                setUserRegistrations((prev) => ({
                  ...prev,
                  [eventId]: {
                    status: status,
                    registrationId: registrationId,
                  },
                }));
              }

              return updatedReg;
            }
            return reg;
          })
        );
      }
    } catch (error) {
      console.error("Error updating registration status:", error);
      alert("Failed to update registration status. Please try again.");
    } finally {
      setUpdatingRegistrationId(null);
    }
  };

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Blood Donation Events</h1>
        <div className="flex gap-2">
          {user && user.role === "user" ? (
            <Button
              onClick={fetchUserRegistrationsData}
              className={`bg-blue-500 hover:bg-blue-600 shadow-md transition-all duration-200 flex items-center gap-2 px-4 ${isLoadingUserRegistrations ? "opacity-75 cursor-not-allowed" : ""}`}
              disabled={isLoadingUserRegistrations}
            >
              {isLoadingUserRegistrations ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <User className="h-4 w-4" />
              )}
              View My Registrations
            </Button>
          ) : (
            ""
          )}
          {canCreateEvents && (
            <>
              <Button
                className="bg-blue-500 text-white hover:bg-blue-600"
                onClick={() => setShowEventSelectionModal(true)}
              >
                <Calendar className="h-4 w-4" />
                View Registrations
              </Button>
              <Button
                className="bg-primary-magenta text-white hover:bg-primary-magenta/90"
                onClick={() => setShowCreateEventModal(true)}
              >
                <Heart className="h-4 w-4" />
                Create Event
              </Button>
            </>
          )}
        </div>
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
      </div>{" "}
      {/* Event Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoadingEvents ? (
          <div className="col-span-full flex justify-center items-center py-10">
            <Loader2 className="animate-spin mr-2" size={20} />
            <span className="text-gray-600">Loading events...</span>
          </div>
        ) : eventsError ? (
          <div className="col-span-full text-center py-10">
            <AlertCircle className="mx-auto mb-2 text-red-500" size={24} />
            <p className="text-red-600">{eventsError}</p>
            <Button
              onClick={() => window.location.reload()}
              className="mt-4 bg-primary-magenta text-white hover:bg-primary-magenta/90"
            >
              Try Again
            </Button>
          </div>
        ) : filteredEvents.length > 0 ? (
          filteredEvents.map((event) => (
            <div
              key={event._id}
              className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => handleEventClick(event)}
            >
              {" "}
              <div className="h-40 overflow-hidden relative">
                <img
                  src={
                    event.image ||
                    "https://placehold.co/600x400?text=Blood+Drive"
                  }
                  alt={event.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    console.log("Image failed to load:", event.image);
                    (e.target as HTMLImageElement).src =
                      "https://placehold.co/600x400?text=Blood+Drive";
                  }}
                />
                <div className="absolute bottom-0 left-0 bg-primary-magenta/80 text-white px-3 py-1 rounded-tr-lg">
                  <Calendar size={14} className="inline mr-1" />
                  {formatDate(event.date)}
                </div>
                {canDeleteEvent(event) && (
                  <div className="absolute top-2 right-2 flex gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteEvent(event._id);
                      }}
                      className="bg-red-500 hover:bg-red-600 text-white p-1.5 rounded-full transition-colors"
                      title="Delete Event"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                )}
              </div>
              <div className="p-4">
                {" "}
                <h3 className="font-medium text-lg mb-2">{event.title}</h3>
                <p className="text-gray-600 text-sm mb-3">
                  By {event.createdBy?.name || "Unknown Organizer"}
                </p>
                <div className="flex items-center text-gray-500 text-sm mb-2">
                  <MapPin size={14} className="mr-1" />
                  {event.venue}
                </div>
                <div className="flex items-center text-gray-500 text-sm">
                  <Clock size={14} className="mr-1" />
                  {event.time}
                </div>
                {/* Registration Status Badge */}
                {user &&
                  userRegistrations[event._id] &&
                  typeof userRegistrations[event._id] !== "boolean" && (
                    <div className="mt-2">
                      {(
                        userRegistrations[event._id] as {
                          status: string;
                          registrationId: string;
                        }
                      ).status === "Approved" ||
                      (
                        userRegistrations[event._id] as {
                          status: string;
                          registrationId: string;
                        }
                      ).status === "approved" ? (
                        <div className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs inline-flex items-center">
                          <Check size={12} className="mr-1" />
                          Approved
                        </div>
                      ) : null}
                      {(
                        userRegistrations[event._id] as {
                          status: string;
                          registrationId: string;
                        }
                      ).status === "Pending" ||
                      (
                        userRegistrations[event._id] as {
                          status: string;
                          registrationId: string;
                        }
                      ).status === "pending" ? (
                        <div className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full text-xs inline-flex items-center">
                          <Clock size={12} className="mr-1" />
                          Pending Approval
                        </div>
                      ) : null}
                      {(
                        userRegistrations[event._id] as {
                          status: string;
                          registrationId: string;
                        }
                      ).status === "Rejected" ||
                      (
                        userRegistrations[event._id] as {
                          status: string;
                          registrationId: string;
                        }
                      ).status === "rejected" ? (
                        <div className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs inline-flex items-center">
                          <X size={12} className="mr-1" />
                          Registration Rejected
                        </div>
                      ) : null}
                    </div>
                  )}
                {event.registrationLimit && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="flex justify-between mb-2">
                      <span className="text-sm">Registration</span>
                      <span className="text-sm font-medium">
                        {event.registeredCount || 0}/{event.registrationLimit}
                      </span>
                    </div>
                    <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary-magenta transition-all duration-300"
                        style={{
                          width: `${Math.min(((event.registeredCount || 0) / event.registrationLimit) * 100, 100)}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
              <div className="p-4 pt-0">
                {user && user._id === event.createdBy?._id ? (
                  <Button
                    className="w-full bg-primary-magenta text-white hover:bg-primary-magenta/90"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEventClick(event);
                    }}
                  >
                    Event Details
                  </Button>
                ) : (
                  <>
                    {userRegistrations[event._id] ? (
                      <Button
                        className="w-full bg-gray-500 text-white cursor-default"
                        disabled
                      >
                        Registered
                      </Button>
                    ) : (
                      <Button
                        className="w-full bg-primary-magenta text-white hover:bg-primary-magenta/90"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEventClick(event);
                        }}
                      >
                        Register Now
                      </Button>
                    )}
                  </>
                )}
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
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={handleCloseModal}
        >
          <div
            className="bg-white rounded-xl w-full max-w-3xl relative max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleCloseModal();
              }}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 z-50 bg-white rounded-full p-2 shadow-lg border border-gray-200"
              type="button"
            >
              <X size={20} />
            </button>
            <div className="h-60 overflow-hidden">
              <img
                src={
                  selectedEvent.image ||
                  "https://placehold.co/600x400?text=Blood+Drive"
                }
                alt={selectedEvent.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  console.log(
                    "Modal image failed to load:",
                    selectedEvent.image
                  );
                  (e.target as HTMLImageElement).src =
                    "https://placehold.co/600x400?text=Blood+Drive";
                }}
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
                    </h2>{" "}
                  </div>
                  <p className="text-gray-600">
                    By {selectedEvent.createdBy?.name || "Unknown Organizer"}
                  </p>
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
              </div>{" "}
              {selectedEvent.registrationLimit && (
                <div className="mb-6">
                  <h3 className="text-sm text-gray-500 mb-2">
                    Registration Status
                  </h3>
                  <div className="flex justify-between mb-2">
                    <span>{selectedEvent.registeredCount || 0} registered</span>
                    <span>
                      {selectedEvent.registrationLimit -
                        (selectedEvent.registeredCount || 0)}{" "}
                      spots left
                    </span>
                  </div>
                  <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary-magenta rounded-full"
                      style={{
                        width: `${Math.min(((selectedEvent.registeredCount || 0) / selectedEvent.registrationLimit) * 100, 100)}%`,
                      }}
                    ></div>
                  </div>
                </div>
              )}{" "}
              {alreadyRegistered ? (
                <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-green-100 p-2 rounded-full">
                      <Check className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-green-700">
                        Already Registered
                      </h3>
                      <p className="text-green-600">
                        You're all set for this event!
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 flex justify-end">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleCloseModal}
                    >
                      Close
                    </Button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleRegistration}>
                  <h3 className="text-lg font-semibold mb-4">
                    Register for this Event
                  </h3>

                  {/* Show warning if this is user's own event */}
                  {user &&
                  selectedEvent.createdBy &&
                  user._id === selectedEvent.createdBy._id ? (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                      <p className="text-yellow-700">
                        <AlertCircle className="inline-block mr-2 h-4 w-4" />
                        You cannot register for your own event.
                      </p>
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <p className="text-gray-600 mb-6">
                        Ready to make a difference? Click register to begin your
                        event registration process.
                      </p>
                    </div>
                  )}

                  {/* Show API errors */}
                  {apiError && (
                    <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-red-600" />
                        <p className="text-red-700">{apiError}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleCloseModal}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      className="bg-primary-magenta text-white hover:bg-primary-magenta/90"
                      disabled={
                        isRegistering ||
                        (user &&
                          selectedEvent.createdBy &&
                          user._id === selectedEvent.createdBy._id) ||
                        (selectedEvent.registrationLimit !== undefined &&
                          selectedEvent.registeredCount !== undefined &&
                          selectedEvent.registeredCount >=
                            selectedEvent.registrationLimit)
                      }
                    >
                      {isRegistering ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Registering...
                        </>
                      ) : (
                        "Register Now"
                      )}
                    </Button>
                  </div>
                </form>
              )}
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
            </button>{" "}
            <div className="p-6 text-center">
              <div className="h-16 w-16 bg-primary-magenta/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="h-8 w-8 text-primary-magenta" />
              </div>
              <h2 className="text-xl font-semibold mb-2">Register for Event</h2>
              <p className="text-gray-600 mb-6">
                You're about to register for this blood donation event. Complete
                your registration by filling out the form.
              </p>
              <div className="flex justify-center gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowConfirmModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleRegistrationConfirm}
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
                </div>{" "}
                <h2 className="text-xl md:text-2xl font-semibold mb-2">
                  Event Registration Complete!
                </h2>{" "}
                <p className="text-gray-700 mb-6">
                  Thank you for registering for this event! Your registration
                  has been confirmed and we'll contact you with further details
                  soon.
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
                {" "}
                <div className="p-4 md:p-6 flex justify-between items-center border-b">
                  <h1 className="text-xl md:text-2xl font-semibold">
                    Event Registration Form
                  </h1>
                </div>
                {apiError &&
                  apiError !== "No event selected for registration" && (
                    <div className="p-4 m-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
                      <AlertCircle className="h-5 w-5 text-red-500 mr-3 mt-0.5" />
                      <div>
                        <p className="text-red-800 font-medium">Error</p>
                        <p className="text-red-700">{apiError}</p>
                      </div>
                    </div>
                  )}{" "}
                <form
                  onSubmit={handleEventRegistrationSubmit}
                  className="p-6 md:p-8 md:pt-0 pt-0"
                >
                  <div className="bg-white rounded-xl shadow-sm p-6 md:p-8 mb-6">
                    {" "}
                    {/* Donor Name */}
                    <div className="mb-6">
                      {" "}
                      <label className="block text-sm font-medium mb-2">
                        Full Name<span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className={`w-full rounded-full border ${errors.name ? "border-red-300" : "border-gray-300"} p-2.5 px-4`}
                        placeholder="Enter Full Name"
                      />
                      {errors.name && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.name}
                        </p>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      {" "}
                      {/* Date of Birth */}
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Date of Birth<span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="dob"
                          value={formData.dob}
                          onChange={handleChange}
                          onFocus={(e) => (e.target.type = "date")}
                          max={new Date().toISOString().split("T")[0]}
                          className={`w-full rounded-full border ${errors.dob ? "border-red-300" : "border-gray-300"} p-2.5 px-4`}
                          placeholder="DD/MM/YYYY"
                        />
                        {errors.dob && (
                          <p className="text-red-500 text-xs mt-1">
                            {errors.dob}
                          </p>
                        )}
                      </div>
                      {/* Gender */}
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Gender<span className="text-red-500">*</span>
                        </label>{" "}
                        <div className="flex flex-wrap gap-4">
                          <label className="flex items-center">
                            <div
                              className={`w-5 h-5 rounded-full border ${formData.gender === "Male" ? "bg-[#c14351] border-[#c14351]" : "border-gray-300"} flex items-center justify-center mr-2`}
                            >
                              {formData.gender === "Male" && (
                                <div className="w-2 h-2 bg-white rounded-full"></div>
                              )}
                            </div>
                            <input
                              type="radio"
                              name="gender"
                              value="Male"
                              checked={formData.gender === "Male"}
                              onChange={handleChange}
                              className="sr-only"
                            />
                            Male
                          </label>
                          <label className="flex items-center">
                            <div
                              className={`w-5 h-5 rounded-full border ${formData.gender === "Female" ? "bg-[#c14351] border-[#c14351]" : "border-gray-300"} flex items-center justify-center mr-2`}
                            >
                              {formData.gender === "Female" && (
                                <div className="w-2 h-2 bg-white rounded-full"></div>
                              )}
                            </div>
                            <input
                              type="radio"
                              name="gender"
                              value="Female"
                              checked={formData.gender === "Female"}
                              onChange={handleChange}
                              className="sr-only"
                            />
                            Female
                          </label>
                          <label className="flex items-center">
                            <div
                              className={`w-5 h-5 rounded-full border ${formData.gender === "Other" ? "bg-[#c14351] border-[#c14351]" : "border-gray-300"} flex items-center justify-center mr-2`}
                            >
                              {formData.gender === "Other" && (
                                <div className="w-2 h-2 bg-white rounded-full"></div>
                              )}
                            </div>
                            <input
                              type="radio"
                              name="gender"
                              value="Other"
                              checked={formData.gender === "Other"}
                              onChange={handleChange}
                              className="sr-only"
                            />
                            Other
                          </label>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      {" "}
                      {/* Phone Number */}
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Phone No<span className="text-red-500">*</span>
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          className={`w-full rounded-full border ${errors.phone ? "border-red-300" : "border-gray-300"} p-2.5 px-4`}
                          placeholder="00000 00000"
                        />
                        {errors.phone && (
                          <p className="text-red-500 text-xs mt-1">
                            {errors.phone}
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
                      </div>{" "}
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
                              className={`w-5 h-5 rounded-full border ${formData.idProofType === "Vote ID" ? "bg-[#c14351] border-[#c14351]" : "border-gray-300"} flex items-center justify-center mr-2`}
                            >
                              {formData.idProofType === "Vote ID" && (
                                <div className="w-2 h-2 bg-white rounded-full"></div>
                              )}
                            </div>
                            <input
                              type="radio"
                              name="idProofType"
                              value="Vote ID"
                              checked={formData.idProofType === "Vote ID"}
                              onChange={handleChange}
                              className="sr-only"
                            />
                            Vote ID
                          </label>
                        </div>
                        <div className="mt-2">
                          <input
                            type="file"
                            name="idProofImage"
                            onChange={handleChange}
                            accept="image/*"
                            className={`w-full rounded-full border ${errors.idProofImage ? "border-red-300" : "border-gray-300"} p-2.5 px-4`}
                          />
                          {errors.idProofImage && (
                            <p className="text-red-500 text-xs mt-1">
                              {errors.idProofImage}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      {" "}
                      {/* Any Disability */}
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Any Disability<span className="text-red-500">*</span>
                        </label>
                        <div className="flex flex-wrap gap-4">
                          <label className="flex items-center">
                            <div
                              className={`w-5 h-5 rounded-full border ${!formData.disability ? "bg-[#c14351] border-[#c14351]" : "border-gray-300"} flex items-center justify-center mr-2`}
                            >
                              {!formData.disability && (
                                <div className="w-2 h-2 bg-white rounded-full"></div>
                              )}
                            </div>
                            <input
                              type="radio"
                              name="disability"
                              value="false"
                              checked={!formData.disability}
                              onChange={() =>
                                setFormData({ ...formData, disability: false })
                              }
                              className="sr-only"
                            />
                            No
                          </label>
                          <label className="flex items-center">
                            <div
                              className={`w-5 h-5 rounded-full border ${formData.disability ? "bg-[#c14351] border-[#c14351]" : "border-gray-300"} flex items-center justify-center mr-2`}
                            >
                              {formData.disability && (
                                <div className="w-2 h-2 bg-white rounded-full"></div>
                              )}
                            </div>
                            <input
                              type="radio"
                              name="disability"
                              value="true"
                              checked={formData.disability}
                              onChange={() =>
                                setFormData({ ...formData, disability: true })
                              }
                              className="sr-only"
                            />
                            Yes
                          </label>
                        </div>
                      </div>{" "}
                      {/* Weight */}
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Weight<span className="text-red-500">*</span>
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
                      {" "}
                      {/* Hemoglobin Count */}
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Hemoglobin Count
                          <span className="text-red-500">*</span>
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
                              className={`w-5 h-5 rounded-full border ${!formData.isHealthy ? "bg-[#c14351] border-[#c14351]" : "border-gray-300"} flex items-center justify-center mr-2`}
                            >
                              {!formData.isHealthy && (
                                <div className="w-2 h-2 bg-white rounded-full"></div>
                              )}
                            </div>
                            <input
                              type="radio"
                              name="isHealthy"
                              value="false"
                              checked={!formData.isHealthy}
                              onChange={() =>
                                setFormData({ ...formData, isHealthy: false })
                              }
                              className="sr-only"
                            />
                            No
                          </label>
                          <label className="flex items-center">
                            <div
                              className={`w-5 h-5 rounded-full border ${formData.isHealthy ? "bg-[#c14351] border-[#c14351]" : "border-gray-300"} flex items-center justify-center mr-2`}
                            >
                              {formData.isHealthy && (
                                <div className="w-2 h-2 bg-white rounded-full"></div>
                              )}
                            </div>
                            <input
                              type="radio"
                              name="isHealthy"
                              value="true"
                              checked={formData.isHealthy}
                              onChange={() =>
                                setFormData({ ...formData, isHealthy: true })
                              }
                              className="sr-only"
                            />
                            Yes
                          </label>
                        </div>
                      </div>
                    </div>{" "}
                    {/* Declaration */}
                    <div className="mb-6">
                      <label className="flex items-start">
                        <div
                          className={`w-5 h-5 border rounded flex items-center justify-center mt-0.5 ${errors.declarationAccepted ? "border-red-300" : formData.declarationAccepted ? "bg-[#c14351] border-[#c14351]" : "border-gray-300"}`}
                        >
                          {formData.declarationAccepted && (
                            <Check className="h-3 w-3 text-white" />
                          )}
                        </div>
                        <input
                          type="checkbox"
                          name="declarationAccepted"
                          checked={formData.declarationAccepted}
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
                      {errors.declarationAccepted && (
                        <p className="text-red-500 text-xs mt-1 ml-8">
                          {errors.declarationAccepted}
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
                      {" "}
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 inline animate-spin" />
                          Registering...
                        </>
                      ) : (
                        "Complete Registration"
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
      {/* Create Event Modal */}
      {showCreateEventModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => {
                setShowCreateEventModal(false);
                setEventForm({
                  title: "",
                  description: "",
                  date: "",
                  time: "",
                  startTime: "",
                  endTime: "",
                  startAmPm: "AM",
                  endAmPm: "PM",
                  venue: "",
                  registrationLimit: "",
                  image: null,
                });
                setEventFormErrors({});
                setCreateEventError(null);
              }}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 z-10 bg-white rounded-full p-1"
            >
              <X size={24} />
            </button>

            <div className="p-6">
              <h2 className="text-2xl font-semibold mb-6">Create New Event</h2>

              {createEventError && (
                <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                    <span className="text-red-700">{createEventError}</span>
                  </div>
                </div>
              )}

              <form onSubmit={handleCreateEvent} className="space-y-6">
                {/* Event Title */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Event Title<span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={eventForm.title}
                    onChange={handleEventFormChange}
                    className={`w-full rounded-lg border ${eventFormErrors.title ? "border-red-300" : "border-gray-300"} p-3`}
                    placeholder="Enter event title"
                  />
                  {eventFormErrors.title && (
                    <p className="text-red-500 text-sm mt-1">
                      {eventFormErrors.title}
                    </p>
                  )}
                </div>

                {/* Event Description */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={eventForm.description}
                    onChange={handleEventFormChange}
                    rows={4}
                    className="w-full rounded-lg border border-gray-300 p-3"
                    placeholder="Enter event description"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Event Date */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Date<span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      name="date"
                      value={eventForm.date}
                      onChange={handleEventFormChange}
                      min={new Date().toISOString().split("T")[0]}
                      className={`w-full rounded-lg border ${eventFormErrors.date ? "border-red-300" : "border-gray-300"} p-3`}
                    />
                    {eventFormErrors.date && (
                      <p className="text-red-500 text-sm mt-1">
                        {eventFormErrors.date}
                      </p>
                    )}
                  </div>{" "}
                  {/* Event Time */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Time<span className="text-red-500">*</span>
                    </label>
                    <div className="space-y-3">
                      {/* Start Time */}
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">
                          Start Time
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="time"
                            name="startTime"
                            value={eventForm.startTime}
                            onChange={handleEventFormChange}
                            className={`flex-1 rounded-lg border ${eventFormErrors.startTime ? "border-red-300" : "border-gray-300"} p-3`}
                          />
                          <select
                            name="startAmPm"
                            value={eventForm.startAmPm}
                            onChange={handleEventFormChange}
                            className="rounded-lg border border-gray-300 p-3 bg-white"
                          >
                            <option value="AM">AM</option>
                            <option value="PM">PM</option>
                          </select>
                        </div>
                        {eventFormErrors.startTime && (
                          <p className="text-red-500 text-sm mt-1">
                            {eventFormErrors.startTime}
                          </p>
                        )}
                      </div>

                      {/* End Time */}
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">
                          End Time
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="time"
                            name="endTime"
                            value={eventForm.endTime}
                            onChange={handleEventFormChange}
                            className={`flex-1 rounded-lg border ${eventFormErrors.endTime ? "border-red-300" : "border-gray-300"} p-3`}
                          />
                          <select
                            name="endAmPm"
                            value={eventForm.endAmPm}
                            onChange={handleEventFormChange}
                            className="rounded-lg border border-gray-300 p-3 bg-white"
                          >
                            <option value="AM">AM</option>
                            <option value="PM">PM</option>
                          </select>
                        </div>
                        {eventFormErrors.endTime && (
                          <p className="text-red-500 text-sm mt-1">
                            {eventFormErrors.endTime}
                          </p>
                        )}
                      </div>

                      {/* Combined time preview */}
                      {eventForm.time && (
                        <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                          <span className="font-medium">Preview:</span>{" "}
                          {eventForm.time}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Event Venue */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Venue<span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="venue"
                    value={eventForm.venue}
                    onChange={handleEventFormChange}
                    className={`w-full rounded-lg border ${eventFormErrors.venue ? "border-red-300" : "border-gray-300"} p-3`}
                    placeholder="Enter event venue"
                  />
                  {eventFormErrors.venue && (
                    <p className="text-red-500 text-sm mt-1">
                      {eventFormErrors.venue}
                    </p>
                  )}
                </div>

                {/* Registration Limit */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Registration Limit (Optional)
                  </label>
                  <input
                    type="number"
                    name="registrationLimit"
                    value={eventForm.registrationLimit}
                    onChange={handleEventFormChange}
                    min="1"
                    className={`w-full rounded-lg border ${eventFormErrors.registrationLimit ? "border-red-300" : "border-gray-300"} p-3`}
                    placeholder="Maximum number of participants"
                  />
                  {eventFormErrors.registrationLimit && (
                    <p className="text-red-500 text-sm mt-1">
                      {eventFormErrors.registrationLimit}
                    </p>
                  )}
                </div>

                {/* Event Image */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Event Image (Optional)
                  </label>
                  <div className="flex items-center justify-center w-full">
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-8 h-8 mb-4 text-gray-500" />
                        <p className="mb-2 text-sm text-gray-500">
                          <span className="font-semibold">Click to upload</span>{" "}
                          or drag and drop
                        </p>
                        <p className="text-xs text-gray-500">
                          PNG, JPG, GIF up to 10MB
                        </p>
                      </div>
                      <input
                        type="file"
                        name="image"
                        onChange={handleEventFormChange}
                        accept="image/*"
                        className="hidden"
                      />
                    </label>
                  </div>
                  {eventForm.image && (
                    <p className="text-sm text-gray-600 mt-2">
                      Selected: {eventForm.image.name}
                    </p>
                  )}
                </div>

                <div className="flex justify-end gap-3 pt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowCreateEventModal(false)}
                    disabled={isCreatingEvent}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="bg-primary-magenta text-white hover:bg-primary-magenta/90"
                    disabled={isCreatingEvent}
                  >
                    {isCreatingEvent ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      "Create Event"
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      {/* Event Registrations Modal */}
      {showRegistrationsModal && selectedEventForRegistrations && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-xl border border-gray-100">
            <div className="p-5 border-b bg-gradient-to-r from-blue-50 to-white">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-gray-800">
                  Registrations for {selectedEventForRegistrations.title}
                </h3>
                <button
                  onClick={handleCloseRegistrations}
                  className="text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 p-1 transition-colors duration-200"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="p-5">
              {isLoadingRegistrations ? (
                <div className="flex flex-col items-center justify-center p-8">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-500 mb-2" />
                  <p className="text-gray-600">Loading registrations...</p>
                </div>
              ) : registrationsError ? (
                <div className="bg-red-50 p-6 rounded-lg text-center">
                  <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
                  <p className="text-red-600 mb-2">{registrationsError}</p>
                  <Button
                    onClick={() =>
                      fetchEventRegistrations(selectedEventForRegistrations._id)
                    }
                    variant="outline"
                    size="sm"
                    className="mt-2"
                  >
                    Try Again
                  </Button>
                </div>
              ) : eventRegistrations.length === 0 ? (
                <div className="text-center p-8 text-gray-500">
                  <div className="mb-3">
                    <AlertCircle className="h-10 w-10 mx-auto text-gray-400" />
                  </div>
                  <p className="mb-1">No registrations found for this event.</p>
                  <p className="text-sm">
                    When users register for this event, they will appear here.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          User
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Registration Date
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Status
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {eventRegistrations.map((registration) => (
                        <tr key={registration._id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {registration.user.name}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {registration.user.email}
                                </div>
                                {registration.user.phone && (
                                  <div className="text-sm text-gray-500">
                                    {registration.user.phone}
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(
                              registration.registrationDate ||
                                registration.createdAt
                            ).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                              ${
                                registration.status === "Approved"
                                  ? "bg-green-100 text-green-800"
                                  : registration.status === "Rejected"
                                    ? "bg-red-100 text-red-800"
                                    : "bg-yellow-100 text-yellow-800"
                              }`}
                            >
                              {registration.status || "Pending"}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex justify-end space-x-2">
                              <Button
                                onClick={() =>
                                  handleUpdateRegistrationStatus(
                                    registration._id,
                                    "Approved"
                                  )
                                }
                                disabled={
                                  updatingRegistrationId === registration._id ||
                                  registration.status === "Approved"
                                }
                                className="bg-green-500 hover:bg-green-600 text-white text-xs py-1 px-2"
                                size="sm"
                              >
                                {updatingRegistrationId === registration._id ? (
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                  "Approve"
                                )}
                              </Button>
                              <Button
                                onClick={() =>
                                  handleUpdateRegistrationStatus(
                                    registration._id,
                                    "Rejected"
                                  )
                                }
                                disabled={
                                  updatingRegistrationId === registration._id ||
                                  registration.status === "Rejected"
                                }
                                className="bg-red-500 hover:bg-red-600 text-white text-xs py-1 px-2"
                                size="sm"
                              >
                                {updatingRegistrationId === registration._id ? (
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                  "Reject"
                                )}
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <div className="mt-6">
                <Button
                  onClick={handleCloseRegistrations}
                  className="w-full bg-gray-500 hover:bg-gray-600 text-white py-2.5 font-medium transition-all duration-200"
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Event Selection Modal for Viewing Registrations */}
      {showEventSelectionModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto shadow-xl border border-gray-100">
            <div className="p-5 border-b bg-gradient-to-r from-blue-50 to-white">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-gray-800">
                  Select Event to View Registrations
                </h3>
                <button
                  onClick={() => setShowEventSelectionModal(false)}
                  className="text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 p-1 transition-colors duration-200"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="p-5">
              {events.filter(
                (event) => user && user._id === event.createdBy?._id
              ).length === 0 ? (
                <div className="text-center p-8 text-gray-500">
                  <Calendar className="h-10 w-10 mx-auto text-gray-400 mb-3" />
                  <p className="text-lg">No events created yet</p>
                  <p className="text-sm">
                    Create an event first to view registrations
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {events
                    .filter(
                      (event) => user && user._id === event.createdBy?._id
                    )
                    .map((event) => (
                      <div
                        key={event._id}
                        className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors duration-200"
                        onClick={() => handleSelectEventFromHeader(event)}
                      >
                        <h4 className="font-semibold text-gray-800 mb-2">
                          {event.title}
                        </h4>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {new Date(event.date).toLocaleDateString()}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {event.time}
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {event.venue}
                          </div>
                        </div>
                        {event.registrationLimit && (
                          <div className="mt-2 text-sm text-blue-600">
                            {event.registeredCount || 0} /{" "}
                            {event.registrationLimit} registered
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      {/* User Registrations Modal */}
      {showUserRegistrationsModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto shadow-xl border border-gray-100">
            <div className="p-5 border-b bg-gradient-to-r from-green-50 to-white">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-bold text-gray-800">
                    Your Event Registrations
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    You have registered for {userRegistrationsData.length} event
                    {userRegistrationsData.length !== 1 ? "s" : ""}
                  </p>
                </div>
                <button
                  onClick={() => setShowUserRegistrationsModal(false)}
                  className="text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 p-1 transition-colors duration-200"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="p-5">
              {isLoadingUserRegistrations ? (
                <div className="flex flex-col items-center justify-center p-8">
                  <Loader2 className="h-8 w-8 animate-spin text-green-500 mb-2" />
                  <p className="text-gray-600">Loading your registrations...</p>
                </div>
              ) : apiError ? (
                <div className="bg-red-50 p-6 rounded-lg text-center">
                  <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
                  <p className="text-red-600 mb-2">{apiError}</p>
                  <Button
                    onClick={fetchUserRegistrationsData}
                    variant="outline"
                    size="sm"
                    className="mt-2"
                  >
                    Try Again
                  </Button>
                </div>
              ) : userRegistrationsData.length === 0 ? (
                <div className="text-center p-8 text-gray-500">
                  <div className="mb-3">
                    <AlertCircle className="h-10 w-10 mx-auto text-gray-400" />
                  </div>
                  <p className="mb-1">No registrations found.</p>
                  <p className="text-sm">
                    You have not registered for any events yet.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Summary card */}
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="bg-blue-500 p-2 rounded-full">
                          <Calendar className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-blue-900">
                            Total Registrations
                          </h4>
                          <p className="text-blue-700">
                            You are registered for{" "}
                            {userRegistrationsData.length} event
                            {userRegistrationsData.length !== 1 ? "s" : ""}
                          </p>
                        </div>
                      </div>
                      <div className="text-2xl font-bold text-blue-600">
                        {userRegistrationsData.length}
                      </div>
                    </div>
                  </div>

                  {/* Events list */}
                  <div className="space-y-3">
                    {userRegistrationsData.map((registration) => (
                      <div
                        key={registration._id}
                        className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-start justify-between">
                              <div>
                                <h4 className="text-lg font-semibold text-gray-900 mb-1">
                                  {registration.event?.title ||
                                    "Event Title Not Available"}
                                </h4>
                                <div className="space-y-1 text-sm text-gray-600">
                                  <div className="flex items-center space-x-2">
                                    <MapPin className="h-4 w-4" />
                                    <span>
                                      {registration.event?.venue || "Venue TBA"}
                                    </span>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <Calendar className="h-4 w-4" />
                                    <span>
                                      {registration.event?.date
                                        ? new Date(
                                            registration.event.date
                                          ).toLocaleDateString("en-US", {
                                            weekday: "long",
                                            year: "numeric",
                                            month: "long",
                                            day: "numeric",
                                          })
                                        : "Date TBA"}
                                    </span>
                                  </div>
                                  {registration.event?.time && (
                                    <div className="flex items-center space-x-2">
                                      <Clock className="h-4 w-4" />
                                      <span>{registration.event.time}</span>
                                    </div>
                                  )}
                                  <div className="flex items-center space-x-2">
                                    <User className="h-4 w-4" />
                                    <span>
                                      Registered on:{" "}
                                      {new Date(
                                        registration.registrationDate ||
                                          registration.createdAt
                                      ).toLocaleDateString()}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div className="ml-4">
                                <span
                                  className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                                  ${
                                    registration.status === "Approved"
                                      ? "bg-green-100 text-green-800"
                                      : registration.status === "Rejected"
                                        ? "bg-red-100 text-red-800"
                                        : "bg-yellow-100 text-yellow-800"
                                  }`}
                                >
                                  {registration.status || "Pending"}
                                </span>
                              </div>
                            </div>

                            {registration.event?.description && (
                              <div className="mt-3 pt-3 border-t border-gray-100">
                                <p className="text-sm text-gray-600 line-clamp-2">
                                  {registration.event.description}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-6">
                <Button
                  onClick={() => setShowUserRegistrationsModal(false)}
                  className="w-full bg-gray-500 hover:bg-gray-600 text-white py-2.5 font-medium transition-all duration-200"
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
