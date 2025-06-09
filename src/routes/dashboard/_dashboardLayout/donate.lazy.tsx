import { createLazyFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Check, AlertCircle, Loader2 } from "lucide-react";
import { donationService } from "@/services/apiService";
import { useAuth } from "@/hooks/useAuth";
import { useResponsive } from "@/hooks/useResponsive";

// Helper function to format dates consistently in YYYY-MM-DD format
const formatDateForInput = (date: Date | string | null | undefined): string => {
  if (!date) return "";

  try {
    const dateObj = typeof date === "string" ? new Date(date) : date;
    // Validate date is valid before formatting
    if (!(dateObj instanceof Date) || isNaN(dateObj.getTime())) return "";

    // Format as YYYY-MM-DD for HTML date input
    return dateObj.toISOString().split("T")[0];
  } catch (error) {
    console.error("Error formatting date:", error);
    return "";
  }
};

export const Route = createLazyFileRoute("/dashboard/_dashboardLayout/donate")({
  component: RouteComponent,
});

function RouteComponent() {
  // Get auth context
  const { user, isLoading: authLoading } = useAuth();
  // Get responsive design hooks
  const { isMobile: _ } = useResponsive(); // Using underscore to indicate intentionally unused variable
  // Form state
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
  const [dataPrefilledMessage, setDataPrefilledMessage] = useState<
    string | null
  >(null); // State to track if donor data is loading
  const [isDonorDataLoading, setIsDonorDataLoading] = useState(false);
  // Fetch donor form data if available & populate form with all available user data
  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return;

      setDataPrefilledMessage(null);
      let userDataPrefilled = false;

      // First populate with user account data
      setFormData((prevData) => ({
        ...prevData,
        name: user.name || prevData.name,
        email: user.email || prevData.email,
        phone: user.phone || prevData.phone,
        gender: (user.gender as "Male" | "Female" | "Other") || prevData.gender,
        bloodType: user.bloodType || prevData.bloodType,
      }));

      if (
        user.name ||
        user.email ||
        user.phone ||
        user.gender ||
        user.bloodType
      ) {
        userDataPrefilled = true;
      } // Format date of birth if available
      if (user.dob) {
        const formattedDob = formatDateForInput(user.dob);
        if (formattedDob) {
          setFormData((prevData) => ({
            ...prevData,
            dob: formattedDob,
          }));
          userDataPrefilled = true;
        }
      }

      // Then try to fetch donor form if the user has previously submitted one
      try {
        setIsDonorDataLoading(true);
        const response = await donationService.getMyDonorForm();

        if (response.success && response.donor) {
          const donorData = response.donor; // Format the date correctly for the input field (YYYY-MM-DD)
          const formattedDob = formatDateForInput(donorData.dob);

          setFormData((prevData) => ({
            ...prevData,
            name: donorData.name || prevData.name,
            dob: formattedDob || prevData.dob,
            phone: donorData.phone || prevData.phone,
            bloodType: donorData.bloodType || prevData.bloodType,
            disability: donorData.disability || prevData.disability,
            gender:
              (donorData.gender as "Male" | "Female" | "Other") ||
              prevData.gender,
            email: donorData.email || prevData.email,
            idProofType:
              (donorData.idProofType as "PAN" | "Aadhaar" | "Vote ID") ||
              prevData.idProofType,
            weight: donorData.weight?.toString() || prevData.weight,
            hemoglobinCount:
              donorData.hemoglobinCount?.toString() || prevData.hemoglobinCount,
            isHealthy: donorData.isHealthy || prevData.isHealthy,
          }));

          // Previous donor data found and loaded
          setDataPrefilledMessage(
            "Your previous donor information has been loaded. Please review and update as needed."
          );
        }
      } catch (error) {
        // If the user doesn't have a donor form yet, this error is expected and can be ignored
        console.log("No previous donor form found, using basic user data only");
        if (userDataPrefilled) {
          setDataPrefilledMessage(
            "Your account information has been pre-filled. Please complete the remaining fields."
          );
        }
      } finally {
        setIsDonorDataLoading(false);
      }
    };

    fetchUserData();
  }, [user]);
  // Handle input changes
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
    } else if (name === "dob" && value) {
      // Special handling for date of birth to ensure consistent format
      try {
        // Parse the input value and reformat it to ensure consistency
        const dateValue = new Date(value);
        if (!isNaN(dateValue.getTime())) {
          // Valid date - use it directly (browser input handles the format)
          setFormData({
            ...formData,
            [name]: value, // Use the value as-is since HTML date inputs use YYYY-MM-DD format
          });
        } else {
          // Invalid date - keep the raw input for now
          setFormData({
            ...formData,
            [name]: value,
          });
        }
      } catch (error) {
        // If date parsing fails, just use the raw value
        console.error("Error parsing date:", error);
        setFormData({
          ...formData,
          [name]: value,
        });
      }
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
    } // Age validation (must be at least 18)
    if (formData.dob) {
      try {
        const birthDate = new Date(formData.dob);

        // Verify we have a valid date
        if (!isNaN(birthDate.getTime())) {
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
        } else {
          newErrors.dob = "Please enter a valid date in YYYY-MM-DD format";
        }
      } catch (error) {
        console.error("Error validating date of birth:", error);
        newErrors.dob = "Please enter a valid date in YYYY-MM-DD format";
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

  // Form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      setIsSubmitting(true);
      setApiError(null); // Prepare donor data
      const donorData = {
        name: formData.name,
        dob: formData.dob,
        gender: formData.gender,
        bloodType: formData.bloodType,
        weight: Number(formData.weight),
        hemoglobinCount: Number(formData.hemoglobinCount),
        disability: formData.disability,
        isHealthy: formData.isHealthy,
        phone: formData.phone,
        email: formData.email,
        idProofType: formData.idProofType,
        idProofImage: formData.idProofImage,
        declarationAccepted: formData.declarationAccepted,
      };

      // Register donor
      const response = await donationService.registerDonor(donorData);
      console.log("Donation registration successful:", response);

      // Record donation details if API call is successful
      await donationService.recordDonation({
        donorId: response.donorId || user?.id,
        donationDate: new Date().toISOString().split("T")[0],
        hospitalName: "Current Hospital", // This would typically come from form data
        units: 1,
        bloodType: formData.bloodType,
        hemoglobinLevel: formData.hemoglobinCount
          ? Number(formData.hemoglobinCount)
          : undefined,
        notes: "Self-reported donation",
      });

      // Set UI state to show success message
      setIsSubmitted(true); // Reset form after submission
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
      console.error("Error registering donation:", error);
      console.error("Error details:", error.response?.data);
      console.error("Error status:", error.response?.status);

      // Set more specific error message
      let errorMessage = "Failed to register donation. Please try again.";

      if (error.response?.status === 404) {
        errorMessage =
          "Donor registration service is not available. Please contact support.";
      } else if (error.message) {
        errorMessage = error.message;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      }

      setApiError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };
  // If auth or donor data is loading, show loading state
  if (authLoading || isDonorDataLoading) {
    return (
      <div className="flex justify-center items-center p-8 h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary-magenta" />
        <span className="ml-2 text-gray-600">
          {authLoading
            ? "Authenticating..."
            : "Loading your donor information..."}
        </span>
      </div>
    );
  }

  // Show success message after submission
  if (isSubmitted) {
    return (
      <div className="max-w-3xl mx-auto p-4 md:p-6">
        <div className="bg-white rounded-xl shadow-sm p-6 md:p-8 text-center">
          <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-xl md:text-2xl font-semibold mb-2">
            Registration Successful!
          </h2>
          <p className="text-gray-700 mb-6">
            Thank you for registering your donation. Your contribution helps
            save lives!
          </p>
          <div className="flex justify-center gap-4">
            <Button variant="outline" onClick={() => setIsSubmitted(false)}>
              Register Another
            </Button>
            <Button
              onClick={() => (window.location.href = "/dashboard")}
              className="bg-primary-magenta hover:bg-primary-magenta/90"
            >
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Main form render
  return (
    <div className="mx-auto w-full">
      <div className="p-4 md:p-6 flex justify-between items-center rounded-t-xl">
        <h1 className="text-xl md:text-2xl font-semibold">
          Blood Donors Registration Form
        </h1>{" "}
      </div>

      {apiError && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
          <AlertCircle className="h-5 w-5 text-red-500 mr-3 mt-0.5" />
          <div>
            <p className="text-red-800 font-medium">Error</p>
            <p className="text-red-700">{apiError}</p>
          </div>
        </div>
      )}

      {dataPrefilledMessage && (
        <div className="p-4 mb-4 bg-blue-50 border border-blue-200 rounded-lg flex items-start">
          <Check className="h-5 w-5 text-blue-500 mr-3 mt-0.5" />
          <div>
            <p className="text-blue-800 font-medium">Information Loaded</p>
            <p className="text-blue-700">{dataPrefilledMessage}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="p-6 md:p-8 md:pt-0 pt-0">
        <div className="bg-white rounded-xl shadow-sm p-6 md:p-8 mb-6">
          {/* Donor Name */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">
              Donor's Name<span className="text-red-500">*</span>
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
              <p className="text-red-500 text-xs mt-1">{errors.name}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {" "}
            {/* Date of Birth */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Date of Birth<span className="text-red-500">*</span>
              </label>{" "}
              <input
                type="date"
                name="dob"
                value={formData.dob}
                onChange={handleChange}
                max={formatDateForInput(new Date())}
                className={`w-full px-3 py-2 border ${errors.dob ? "border-red-300" : "border-gray-300"} rounded-md focus:outline-none focus:ring-2 focus:ring-primary-magenta focus:border-transparent`}
              />
              {errors.dob && (
                <p className="text-red-500 text-xs mt-1">{errors.dob}</p>
              )}
              <p className="text-gray-500 text-xs mt-1">Format: YYYY-MM-DD</p>
            </div>
            {/* Gender */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Gender<span className="text-red-500">*</span>
              </label>
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
                <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
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
                <p className="text-red-500 text-xs mt-1">{errors.email}</p>
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
                <p className="text-red-500 text-xs mt-1">{errors.bloodType}</p>
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
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    setFormData({
                      ...formData,
                      idProofImage: file,
                    });
                  }}
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
            </div>

            {/* Weight */}
            <div>
              <label className="block text-sm font-medium mb-2">Weight</label>
              <input
                type="text"
                name="weight"
                value={formData.weight}
                onChange={handleChange}
                className={`w-full rounded-full border ${errors.weight ? "border-red-300" : "border-gray-300"} p-2.5 px-4`}
                placeholder="weight in Kg's"
              />
              {errors.weight && (
                <p className="text-red-500 text-xs mt-1">{errors.weight}</p>
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
          </div>

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
                I have read and understood all the information presented above
                and answered all the questions to the best of my knowledge, and
                hereby declare that<span className="text-red-500">*</span>
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
  );
}
