import { createLazyFileRoute } from "@tanstack/react-router";
import {
  MapPin,
  Calendar,
  Phone,
  Mail,
  Edit3,
  Camera,
  Droplets,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import useAuth from "@/hooks/useAuth";
import { authService } from "@/services/apiService";
import { toast } from "sonner";
import bloodInventoryService, {
  BloodInventory,
} from "@/services/bloodInventoryService";

export const Route = createLazyFileRoute(
  "/dashboard/_dashboardLayout/edit-profile"
)({
  component: EditProfileComponent,
});

interface MedicalDetail {
  key: string;
  value: string;
  lastUpdated: string;
}

// Extending the User interface to add health-related properties needed in this component
interface ExtendedUser {
  name?: string;
  email?: string;
  phone?: string;
  bloodType?: string;
  dateOfBirth?: string;
  gender?: string;
  address?: string;
  weight?: number;
  height?: number;
  bloodPressure?: string;
  allergies?: string[];
  chronicConditions?: string[];
  medications?: string[];
  emergencyContact?: string;
  profile?: {
    profilePhoto?: string;
  };
  role?: "admin" | "organization" | "user" | "hospital";
}

function EditProfileComponent() {
  const [editingPersonal, setEditingPersonal] = useState(false);
  const [editingMedical, setEditingMedical] = useState(false);
  const [editingInventory, setEditingInventory] = useState(false);
  const { user } = useAuth();
  // Cast user to ExtendedUser to access health-related properties
  const loggedInUser = user as unknown as ExtendedUser;

  // Determine if user is hospital or organization
  const isHospitalOrOrg =
    loggedInUser?.role === "hospital" || loggedInUser?.role === "organization";
  // Blood inventory state
  const [inventory, setInventory] = useState<BloodInventory>({
    aPositive: 0,
    aNegative: 0,
    bPositive: 0,
    bNegative: 0,
    abPositive: 0,
    abNegative: 0,
    oPositive: 0,
    oNegative: 0,
  });

  // Loading state for inventory
  const [isLoadingInventory, setIsLoadingInventory] = useState(false);

  const [personalInfo, setPersonalInfo] = useState({
    name: loggedInUser?.name || "",
    phone: loggedInUser?.phone || "",
    email: loggedInUser?.email || "",
    bloodType: !isHospitalOrOrg ? loggedInUser?.bloodType || "" : "",
    dob: !isHospitalOrOrg ? loggedInUser?.dateOfBirth || "" : "", // Changed from dob to dateOfBirth to match backend
    gender: !isHospitalOrOrg ? loggedInUser?.gender || "" : "",
    address: loggedInUser?.address || "",
    emergencyContact: loggedInUser?.emergencyContact || "",
  });
  // Replace the medicalDetails state initialization with this corrected version:

  const [medicalDetails, setMedicalDetails] = useState<MedicalDetail[]>([
    {
      key: "Weight",
      value: loggedInUser?.weight ? `${loggedInUser.weight} kg` : "75 kg",
      lastUpdated: new Date().toISOString().split("T")[0],
    },
    {
      key: "Height",
      value: loggedInUser?.height ? `${loggedInUser.height} cm` : "178 cm",
      lastUpdated: new Date().toISOString().split("T")[0],
    },
    {
      key: "Blood Pressure",
      value: loggedInUser?.bloodPressure || "120/80 mmHg",
      lastUpdated: new Date().toISOString().split("T")[0],
    },
    {
      key: "Allergies",
      value: (() => {
        try {
          if (
            Array.isArray(loggedInUser?.allergies) &&
            loggedInUser.allergies.length > 0
          ) {
            const parsedAllergies = JSON.parse(loggedInUser.allergies[0]);
            return Array.isArray(parsedAllergies) && parsedAllergies.length > 0
              ? parsedAllergies.join(", ")
              : "None";
          }
          return "None";
        } catch {
          return loggedInUser?.allergies?.[0] || "None";
        }
      })(),
      lastUpdated: new Date().toISOString().split("T")[0],
    },
    {
      key: "Chronic Conditions",
      value: (() => {
        try {
          if (
            Array.isArray(loggedInUser?.chronicConditions) &&
            loggedInUser.chronicConditions.length > 0
          ) {
            const parsedConditions = JSON.parse(
              loggedInUser.chronicConditions[0]
            );
            return Array.isArray(parsedConditions) &&
              parsedConditions.length > 0
              ? parsedConditions.join(", ")
              : "None";
          }
          return "None";
        } catch {
          return loggedInUser?.chronicConditions?.[0] || "None";
        }
      })(),
      lastUpdated: new Date().toISOString().split("T")[0],
    },
    {
      key: "Medications",
      value: (() => {
        try {
          if (
            Array.isArray(loggedInUser?.medications) &&
            loggedInUser.medications.length > 0
          ) {
            const parsedMedications = JSON.parse(loggedInUser.medications[0]);
            return Array.isArray(parsedMedications) &&
              parsedMedications.length > 0
              ? parsedMedications.join(", ")
              : "None";
          }
          return "None";
        } catch {
          return loggedInUser?.medications?.[0] || "None";
        }
      })(),
      lastUpdated: new Date().toISOString().split("T")[0],
    },
  ]);

  // Fetch blood inventory data for hospital/organization users
  useEffect(() => {
    if (isHospitalOrOrg) {
      const fetchInventory = async () => {
        try {
          setIsLoadingInventory(true);
          const data = await bloodInventoryService.getInventory();
          setInventory(data);
        } catch (error: any) {
          toast.error(error.message || "Failed to load inventory data");
          console.error("Error fetching inventory:", error);
        } finally {
          setIsLoadingInventory(false);
        }
      };

      fetchInventory();
    }
  }, [isHospitalOrOrg]);

  // Format date function
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  const handlePersonalFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const formData = new FormData();

      // Map the form fields to match the backend schema
      const fieldMapping: { [key: string]: string } = {
        name: "name",
        phone: "phone",
        email: "email",
        bloodType: "bloodType",
        dob: "dateOfBirth", // Changed to match backend field name
        gender: "gender",
        address: "address",
        emergencyContact: "emergencyContact",
      };

      // Filter which fields to include based on user role
      const fieldsToInclude = isHospitalOrOrg
        ? ["name", "phone", "email", "address", "emergencyContact"]
        : Object.keys(fieldMapping);

      Object.entries(personalInfo).forEach(([key, value]) => {
        if (value && fieldsToInclude.includes(key)) {
          const backendField = fieldMapping[key] || key;
          formData.append(backendField, value.toString());
        }
      });

      await authService.updateProfile(formData);
      setEditingPersonal(false);
      toast.success("Personal information updated successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to update personal information");
    }
  };
  const handleMedicalFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const formData = new FormData();

      // Extract values and handle formatting
      const weightValue =
        medicalDetails.find((d) => d.key === "Weight")?.value.split(" ")[0] ||
        "";
      const heightValue =
        medicalDetails.find((d) => d.key === "Height")?.value.split(" ")[0] ||
        "";
      const bloodPressure =
        medicalDetails.find((d) => d.key === "Blood Pressure")?.value || "";
      const allergies = medicalDetails.find(
        (d) => d.key === "Allergies"
      )?.value;
      const chronicConditions = medicalDetails.find(
        (d) => d.key === "Chronic Conditions"
      )?.value;
      const medications = medicalDetails.find(
        (d) => d.key === "Medications"
      )?.value;

      // Append medical details to match backend schema
      formData.append("weight", weightValue);
      formData.append("height", heightValue);
      formData.append("bloodPressure", bloodPressure);
      formData.append(
        "allergies",
        allergies === "None" ? "[]" : JSON.stringify([allergies])
      );
      formData.append(
        "chronicConditions",
        chronicConditions === "None"
          ? "[]"
          : JSON.stringify([chronicConditions])
      );
      formData.append(
        "medications",
        medications === "None" ? "[]" : JSON.stringify([medications])
      );

      await authService.updateProfile(formData);
      setEditingMedical(false);
      toast.success("Medical details updated successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to update medical details");
    }
  };

  // Handle blood inventory form submission
  const handleInventoryFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await bloodInventoryService.updateInventory(inventory);
      setEditingInventory(false);
      toast.success("Blood inventory updated successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to update blood inventory");
    }
  };

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Profile</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          {/* Profile Photo Section */}
          <div className="bg-white rounded-xl shadow-sm p-6 flex flex-col items-center">
            <div className="relative mb-4 group">
              <div className="w-32 h-32 rounded-full bg-blue-100 overflow-hidden border-4 border-white shadow-md">
                <img
                  src="/placeholder-avatar.svg"
                  alt="Profile"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src =
                      "https://placehold.co/200x200?text=Avatar";
                  }}
                />
              </div>
              <div className="absolute inset-0 bg-black/30 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                <Camera className="text-white" size={24} />
              </div>
            </div>
            <h2 className="text-xl font-semibold mb-1">{personalInfo.name}</h2>

            <div className="w-full">
              <div className="flex items-center gap-2 text-gray-600 mb-2">
                <MapPin size={16} />
                <span className="text-sm">{personalInfo.address}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600 mb-2">
                <Mail size={16} />
                <span className="text-sm">{personalInfo.email}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Phone size={16} />
                <span className="text-sm">{personalInfo.phone}</span>
              </div>
            </div>
          </div>{" "}
          {/* Next Eligible Donation - Only for regular users */}
          {!isHospitalOrOrg && (
            <div className="bg-white rounded-xl shadow-sm p-6 mt-6">
              <h3 className="font-medium mb-4">Next Eligible Donation</h3>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-primary-magenta/10 p-3 rounded-lg">
                    <Calendar className="h-6 w-6 text-primary-magenta" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">
                      You can donate again on
                    </p>
                    <p className="font-medium">July 15, 2025</p>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-xs">
                  In 60 days
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-2">
          {/* Personal Info Section */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Personal Information</h2>
              {!editingPersonal ? (
                <Button
                  variant="outline"
                  size="sm"
                  className="border-primary-magenta text-primary-magenta hover:bg-primary-magenta/10"
                  onClick={() => setEditingPersonal(true)}
                >
                  <Edit3 size={16} className="mr-1" /> Edit
                </Button>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-500"
                  onClick={() => setEditingPersonal(false)}
                >
                  Cancel
                </Button>
              )}
            </div>

            {!editingPersonal ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-10">
                <div>
                  <h3 className="text-sm text-gray-500 mb-1">Full Name</h3>
                  <p className="font-medium">{personalInfo.name}</p>
                </div>
                {!isHospitalOrOrg && (
                  <div>
                    <h3 className="text-sm text-gray-500 mb-1">Blood Type</h3>
                    <p className="font-medium">{personalInfo.bloodType}</p>
                  </div>
                )}
                {!isHospitalOrOrg && (
                  <div>
                    <h3 className="text-sm text-gray-500 mb-1">
                      Date of Birth
                    </h3>
                    <p className="font-medium">
                      {personalInfo.dob ? formatDate(personalInfo.dob) : ""}
                    </p>
                  </div>
                )}
                {!isHospitalOrOrg && (
                  <div>
                    <h3 className="text-sm text-gray-500 mb-1">Gender</h3>
                    <p className="font-medium">{personalInfo.gender}</p>
                  </div>
                )}
                <div>
                  <h3 className="text-sm text-gray-500 mb-1">Email</h3>
                  <p className="font-medium">{personalInfo.email}</p>
                </div>
                <div>
                  <h3 className="text-sm text-gray-500 mb-1">Phone</h3>
                  <p className="font-medium">{personalInfo.phone}</p>
                </div>
                <div className="md:col-span-2">
                  <h3 className="text-sm text-gray-500 mb-1">Address</h3>
                  <p className="font-medium">{personalInfo.address}</p>
                </div>
                <div className="md:col-span-2">
                  <h3 className="text-sm text-gray-500 mb-1">
                    Emergency Contact
                  </h3>
                  <p className="font-medium">{personalInfo.emergencyContact}</p>
                </div>
              </div>
            ) : (
              <form onSubmit={handlePersonalFormSubmit}>
                {" "}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={personalInfo.name}
                      onChange={(e) =>
                        setPersonalInfo({
                          ...personalInfo,
                          name: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-magenta focus:border-transparent"
                    />
                  </div>

                  {!isHospitalOrOrg && (
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">
                        Blood Type
                      </label>
                      <select
                        value={personalInfo.bloodType}
                        onChange={(e) =>
                          setPersonalInfo({
                            ...personalInfo,
                            bloodType: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-magenta focus:border-transparent"
                      >
                        <option value="A+">A+</option>
                        <option value="A-">A-</option>
                        <option value="B+">B+</option>
                        <option value="B-">B-</option>
                        <option value="AB+">AB+</option>
                        <option value="AB-">AB-</option>
                        <option value="O+">O+</option>
                        <option value="O-">O-</option>
                      </select>
                    </div>
                  )}

                  {!isHospitalOrOrg && (
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">
                        Date of Birth
                      </label>
                      <input
                        type="date"
                        value={personalInfo.dob}
                        onChange={(e) =>
                          setPersonalInfo({
                            ...personalInfo,
                            dob: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-magenta focus:border-transparent"
                      />
                    </div>
                  )}

                  {!isHospitalOrOrg && (
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">
                        Gender
                      </label>
                      <select
                        value={personalInfo.gender}
                        onChange={(e) =>
                          setPersonalInfo({
                            ...personalInfo,
                            gender: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-magenta focus:border-transparent"
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                        <option value="Prefer not to say">
                          Prefer not to say
                        </option>
                      </select>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={personalInfo.email}
                      onChange={(e) =>
                        setPersonalInfo({
                          ...personalInfo,
                          email: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-magenta focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={personalInfo.phone}
                      onChange={(e) =>
                        setPersonalInfo({
                          ...personalInfo,
                          phone: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-magenta focus:border-transparent"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm text-gray-700 mb-1">
                      Address
                    </label>
                    <input
                      type="text"
                      value={personalInfo.address}
                      onChange={(e) =>
                        setPersonalInfo({
                          ...personalInfo,
                          address: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-magenta focus:border-transparent"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm text-gray-700 mb-1">
                      Emergency Contact
                    </label>
                    <input
                      type="tel"
                      value={personalInfo.emergencyContact}
                      onChange={(e) =>
                        setPersonalInfo({
                          ...personalInfo,
                          emergencyContact: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-magenta focus:border-transparent"
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button
                    type="submit"
                    className="bg-primary-magenta text-white hover:bg-primary-magenta/90"
                  >
                    Save Changes
                  </Button>
                </div>
              </form>
            )}
          </div>{" "}
          {/* Medical Details Section - Only for regular users */}
          {!isHospitalOrOrg && (
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Medical Details</h2>
                {!editingMedical ? (
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-primary-magenta text-primary-magenta hover:bg-primary-magenta/10"
                    onClick={() => setEditingMedical(true)}
                  >
                    <Edit3 size={16} className="mr-1" /> Edit
                  </Button>
                ) : (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-gray-500"
                    onClick={() => setEditingMedical(false)}
                  >
                    Cancel
                  </Button>
                )}
              </div>

              {!editingMedical ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {medicalDetails.map((detail, index) => (
                    <div key={index}>
                      <h3 className="text-sm text-gray-500 mb-1">
                        {detail.key}
                      </h3>
                      <p className="font-medium">{detail.value}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        Updated: {formatDate(detail.lastUpdated)}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <form onSubmit={handleMedicalFormSubmit}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    {medicalDetails.map((detail, index) => (
                      <div key={index}>
                        <label className="block text-sm text-gray-700 mb-1">
                          {detail.key}
                        </label>
                        <input
                          type="text"
                          value={detail.value}
                          onChange={(e) => {
                            const updatedDetails = [...medicalDetails];
                            updatedDetails[index].value = e.target.value;
                            updatedDetails[index].lastUpdated = new Date()
                              .toISOString()
                              .split("T")[0];
                            setMedicalDetails(updatedDetails);
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-magenta focus:border-transparent"
                        />
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      className="bg-primary-magenta text-white hover:bg-primary-magenta/90"
                    >
                      Save Changes
                    </Button>
                  </div>
                </form>
              )}
            </div>
          )}
          {/* Blood Inventory Section - Only for hospital/organization users */}
          {isHospitalOrOrg && (
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-semibold">Blood Inventory</h2>
                  {isLoadingInventory && (
                    <div className="animate-spin h-4 w-4 border-2 border-primary-magenta border-t-transparent rounded-full ml-2"></div>
                  )}
                </div>
                {!editingInventory ? (
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-primary-magenta text-primary-magenta hover:bg-primary-magenta/10"
                    onClick={() => setEditingInventory(true)}
                  >
                    <Edit3 size={16} className="mr-1" /> Edit
                  </Button>
                ) : (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-gray-500"
                    onClick={() => setEditingInventory(false)}
                  >
                    Cancel
                  </Button>
                )}
              </div>

              {!editingInventory ? (
                <div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="bg-red-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Droplets className="h-5 w-5 text-red-600 mr-2" />
                          <span className="font-medium">A+</span>
                        </div>
                        <span className="text-lg font-semibold">
                          {inventory.aPositive}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        units available
                      </p>
                    </div>
                    <div className="bg-red-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Droplets className="h-5 w-5 text-red-600 mr-2" />
                          <span className="font-medium">A-</span>
                        </div>
                        <span className="text-lg font-semibold">
                          {inventory.aNegative}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        units available
                      </p>
                    </div>
                    <div className="bg-red-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Droplets className="h-5 w-5 text-red-600 mr-2" />
                          <span className="font-medium">B+</span>
                        </div>
                        <span className="text-lg font-semibold">
                          {inventory.bPositive}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        units available
                      </p>
                    </div>
                    <div className="bg-red-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Droplets className="h-5 w-5 text-red-600 mr-2" />
                          <span className="font-medium">B-</span>
                        </div>
                        <span className="text-lg font-semibold">
                          {inventory.bNegative}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        units available
                      </p>
                    </div>
                    <div className="bg-red-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Droplets className="h-5 w-5 text-red-600 mr-2" />
                          <span className="font-medium">AB+</span>
                        </div>
                        <span className="text-lg font-semibold">
                          {inventory.abPositive}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        units available
                      </p>
                    </div>
                    <div className="bg-red-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Droplets className="h-5 w-5 text-red-600 mr-2" />
                          <span className="font-medium">AB-</span>
                        </div>
                        <span className="text-lg font-semibold">
                          {inventory.abNegative}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        units available
                      </p>
                    </div>
                    <div className="bg-red-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Droplets className="h-5 w-5 text-red-600 mr-2" />
                          <span className="font-medium">O+</span>
                        </div>
                        <span className="text-lg font-semibold">
                          {inventory.oPositive}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        units available
                      </p>
                    </div>
                    <div className="bg-red-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Droplets className="h-5 w-5 text-red-600 mr-2" />
                          <span className="font-medium">O-</span>
                        </div>
                        <span className="text-lg font-semibold">
                          {inventory.oNegative}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        units available
                      </p>
                    </div>
                  </div>
                  {inventory.lastUpdated && (
                    <p className="text-xs text-gray-400 mt-4">
                      Last updated:{" "}
                      {formatDate(
                        new Date(inventory.lastUpdated).toISOString()
                      )}
                    </p>
                  )}
                </div>
              ) : (
                <form onSubmit={handleInventoryFormSubmit}>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">
                        A+ Units
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={inventory.aPositive}
                        onChange={(e) =>
                          setInventory({
                            ...inventory,
                            aPositive: parseInt(e.target.value) || 0,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-magenta focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">
                        A- Units
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={inventory.aNegative}
                        onChange={(e) =>
                          setInventory({
                            ...inventory,
                            aNegative: parseInt(e.target.value) || 0,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-magenta focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">
                        B+ Units
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={inventory.bPositive}
                        onChange={(e) =>
                          setInventory({
                            ...inventory,
                            bPositive: parseInt(e.target.value) || 0,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-magenta focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">
                        B- Units
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={inventory.bNegative}
                        onChange={(e) =>
                          setInventory({
                            ...inventory,
                            bNegative: parseInt(e.target.value) || 0,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-magenta focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">
                        AB+ Units
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={inventory.abPositive}
                        onChange={(e) =>
                          setInventory({
                            ...inventory,
                            abPositive: parseInt(e.target.value) || 0,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-magenta focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">
                        AB- Units
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={inventory.abNegative}
                        onChange={(e) =>
                          setInventory({
                            ...inventory,
                            abNegative: parseInt(e.target.value) || 0,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-magenta focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">
                        O+ Units
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={inventory.oPositive}
                        onChange={(e) =>
                          setInventory({
                            ...inventory,
                            oPositive: parseInt(e.target.value) || 0,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-magenta focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">
                        O- Units
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={inventory.oNegative}
                        onChange={(e) =>
                          setInventory({
                            ...inventory,
                            oNegative: parseInt(e.target.value) || 0,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-magenta focus:border-transparent"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      className="bg-primary-magenta text-white hover:bg-primary-magenta/90"
                    >
                      Update Inventory
                    </Button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
