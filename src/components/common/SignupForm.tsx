import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import { Input } from "@/components/ui/input.tsx";
import axios from "axios";
import { useEffect, useState } from "react";
import { Toaster, toast } from "react-hot-toast";
import { Link, useNavigate } from "@tanstack/react-router";
import useAuth from "@/hooks/useAuth";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

// Common file validation schema
const fileSchema = z
  .instanceof(File)
  .refine((file) => file.size <= MAX_FILE_SIZE, {
    message: "Image must be smaller than 5MB",
  })
  .refine((file) => ACCEPTED_IMAGE_TYPES.includes(file.type), {
    message: "Only .jpeg, .png, and .webp formats are supported",
  });

// Base schema with common fields for all user types
const baseSchema = {
  email: z.string().email("Please enter a valid email address"),
  phone: z
    .string()
    .min(10, "Phone number must be at least 10 digits")
    .max(10, "Phone number cannot exceed 10 digits")
    .regex(/^[0-9]+$/, "Phone number can only contain digits"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
  confirmPassword: z.string(),
};

// User-specific schema
const userSchema = z
  .object({
    ...baseSchema,
    name: z
      .string()
      .min(2, "Name must be at least 2 characters long")
      .max(50, "Name cannot exceed 50 characters")
      .regex(/^[A-Za-z\s]+$/, "Name can only contain letters and spaces"),
    addhar: z
      .string()
      .length(12, "Aadhar number must be exactly 12 digits")
      .regex(/^[0-9]+$/, "Aadhar number can only contain digits"),
    addharImage: fileSchema,
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

// Organization-specific schema
const organizationSchema = z
  .object({
    ...baseSchema,
    organisationName: z
      .string()
      .min(2, "Organization name must be at least 2 characters long")
      .max(100, "Organization name cannot exceed 100 characters"),
    organisationIdImage: fileSchema,
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

// Hospital-specific schema
const hospitalSchema = z
  .object({
    ...baseSchema,
    hospitalName: z
      .string()
      .min(2, "Hospital name must be at least 2 characters long")
      .max(100, "Hospital name cannot exceed 100 characters"),
    hospitalIdImage: fileSchema,
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

// Admin-specific schema
const adminSchema = z
  .object({
    ...baseSchema,
    name: z
      .string()
      .min(2, "Name must be at least 2 characters long")
      .max(50, "Name cannot exceed 50 characters")
      .regex(/^[A-Za-z\s]+$/, "Name can only contain letters and spaces"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

// Login schema
const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
});

type props = {
  userType: string;
  isLogin?: boolean;
};

export default function SignupForm({ userType, isLogin = false }: props) {
  const [apiError, setApiError] = useState<string | null>(null);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [idName, setIdName] = useState<
    "addharImage" | "organisationIdImage" | "hospitalIdImage"
  >("addharImage");
  const [nameBasedOnUser, setNameBasedOnUser] = useState<string>("name");
  const [idBasedOnUser, setIdBasedOnUser] = useState<string>("addhar");

  useEffect(() => {
    if (userType === "user") {
      setIdName("addharImage");
      setNameBasedOnUser("Full Name");
      setIdBasedOnUser("Aadhar ID");
    } else if (userType === "organization") {
      setIdName("organisationIdImage");
      setNameBasedOnUser("Organization Name");
      setIdBasedOnUser("Organization ID");
    } else if (userType === "hospital") {
      setIdName("hospitalIdImage");
      setNameBasedOnUser("Hospital Name");
      setIdBasedOnUser("Hospital ID");
    } else if (userType === "admin") {
      setIdName("addharImage");
      setNameBasedOnUser("Full Name");
      setIdBasedOnUser("Aadhar ID");
    }
  }, [userType]);

  // Helper function to format and display error messages properly
  const ErrorMessage = ({ errors }: { errors: any[] }) => {
    if (!errors || errors.length === 0) return null;

    const formattedErrors = errors
      .map((err) =>
        typeof err === "string" ? err : err.message || "Invalid input"
      )
      .join(", ");

    return (
      <div className="text-red-400 text-xs ml-2 mt-1">{formattedErrors}</div>
    );
  };

  // Get the appropriate schema based on user type
  const getValidationSchema = () => {
    if (isLogin) return loginSchema;

    switch (userType) {
      case "user":
        return userSchema;
      case "organisation":
        return organizationSchema;
      case "hospital":
        return hospitalSchema;
      case "admin":
        return adminSchema;
      default:
        return userSchema;
    }
  };

  // Get default values based on user type
  const getDefaultValues = () => {
    if (isLogin) {
      return {
        email: "",
        password: "",
      };
    }

    const baseValues = {
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
    };

    switch (userType) {
      case "user":
        return {
          ...baseValues,
          name: "",
          addhar: "",
          addharImage: undefined as File | undefined,
        };
      case "organisation":
        return {
          ...baseValues,
          organisationName: "",
          organisationIdImage: undefined as File | undefined,
        };
      case "hospital":
        return {
          ...baseValues,
          hospitalName: "",
          hospitalIdImage: undefined as File | undefined,
        };
      case "admin":
        return {
          ...baseValues,
          name: "",
        };
      default:
        return {
          ...baseValues,
          name: "",
          addhar: "",
          addharImage: undefined as File | undefined,
        };
    }
  };

  const form = useForm({
    defaultValues: getDefaultValues(),
    validators: {
      onBlur: getValidationSchema(),
    },
    onSubmit: async ({ value }: { value: any }) => {
      try {
        setFormSubmitting(true);
        setApiError(null);

        if (!isLogin) {
          // For registration
          const formData = new FormData();

          // Add common fields
          formData.append("role", userType);
          formData.append("email", value.email);
          formData.append("password", value.password);
          formData.append("confirmPassword", value.confirmPassword);
          formData.append("phone", value.phone);

          // Add role-specific fields
          if (userType === "user") {
            if (value.name) formData.append("name", value.name);
            if (value.addhar) formData.append("addhar", value.addhar);
            else formData.append("addhar", value.phone); // Fallback to phone

            if (value.addharImage) {
              formData.append("addharImage", value.addharImage);
            }
          } else if (userType === "organisation") {
            if (value.organisationName) {
              formData.append("organisationName", value.organisationName);
            } else if (value.name) {
              formData.append("organisationName", value.name);
            }

            if (value.organisationIdImage) {
              formData.append("organisationIdImage", value.organisationIdImage);
            }
          } else if (userType === "hospital") {
            if (value.hospitalName) {
              formData.append("hospitalName", value.hospitalName);
            } else if (value.name) {
              formData.append("hospitalName", value.name);
            }

            if (value.hospitalIdImage) {
              formData.append("hospitalIdImage", value.hospitalIdImage);
            }
          } else if (userType === "admin") {
            if (value.name) formData.append("name", value.name);
          }

          const response = await axios.post(
            import.meta.env.VITE_BASE_API_URL + "/register",
            formData,
            {
              headers: {
                "Content-Type": "multipart/form-data",
              },
            }
          );

          if (response.data) {
            toast.success("Registration successful!");
            // You can handle successful registration here (e.g., redirect)
          }
        } else {
          // For login functionality
          const response = await axios.post(
            import.meta.env.VITE_BASE_API_URL + "/login",
            {
              email: value.email,
              password: value.password,
            },
            {
              headers: {
                "Content-Type": "application/json",
              },
            }
          );

          if (response.data) {
            toast.success("Login successful!");
            // Handle login success (e.g. save token, redirect)
          }
        }

        console.log("Form submitted", value);
      } catch (error: any) {
        console.error("Form submission error:", error);

        let errorMessage = "Network error. Please try again later.";

        if (axios.isAxiosError(error)) {
          if (error.response) {
            // Server responded with an error status code
            const responseData = error.response.data;

            if (typeof responseData === "string") {
              errorMessage = responseData;
            } else if (responseData.message) {
              errorMessage = responseData.message;
            } else if (responseData.error) {
              errorMessage =
                typeof responseData.error === "string"
                  ? responseData.error
                  : responseData.error.message ||
                    JSON.stringify(responseData.error);
            } else if (
              responseData.errors &&
              Array.isArray(responseData.errors)
            ) {
              // Handle validation errors array
              errorMessage = responseData.errors
                .map((e: any) =>
                  typeof e === "string" ? e : e.message || JSON.stringify(e)
                )
                .join(", ");
            }
          } else if (error.request) {
            // Request was made but no response received
            console.log("Request error:", error.request);
            errorMessage =
              "No response received from server. Please check your connection.";
          } else {
            // Something happened in setting up request
            errorMessage = `Request configuration error: ${error.message}`;
          }
        }

        setApiError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setFormSubmitting(false);
      }
    },
  });

  return (
    <div className="my-4 w-fit">
      <Toaster position="top-center" />
      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          void form.handleSubmit();
        }}
        className="space-y-5"
      >
        {apiError && (
          <div
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
            role="alert"
          >
            <span className="block sm:inline">{apiError}</span>
          </div>
        )}

        {!isLogin && (
          <>
            <form.Field
              name="name"
              children={(field) => {
                return (
                  <div className="flex flex-col gap-y-2">
                    {/* <label className="text-white text-sm font-light ml-2">
                      {nameBasedOnUser}
                    </label> */}
                    <Input
                      type="text"
                      placeholder={nameBasedOnUser}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      className="bg-white h-10 shadow-even-xl border-0 outline-none focus:outline-none focus:border-0 focus:ring-0 focus-visible:ring-0 focus-visible:ring-transparent focus-visible:border-0 focus-visible:outline-none ring-0 mx-0"
                    />
                    {field.state.meta.errors &&
                      field.state.meta.errors.length > 0 && (
                        <ErrorMessage errors={field.state.meta.errors} />
                      )}
                  </div>
                );
              }}
            />

            <div className="flex gap-5 justify-between">
              <form.Field
                name="email"
                children={(field) => {
                  return (
                    <div className="flex flex-col gap-y-2 w-full">
                      {/* <label className="text-white text-sm font-light ml-2">
                        Email
                      </label> */}
                      <Input
                        type="email"
                        placeholder="Email"
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        className="bg-white h-10 shadow-even-xl border-0 outline-none focus:outline-none focus:border-0 focus:ring-0 focus-visible:ring-0 focus-visible:ring-transparent focus-visible:border-0 focus-visible:outline-none ring-0 mx-0"
                      />
                      {field.state.meta.errors &&
                        field.state.meta.errors.length > 0 && (
                          <ErrorMessage errors={field.state.meta.errors} />
                        )}
                    </div>
                  );
                }}
              />
              <form.Field
                name="phone"
                children={(field) => {
                  return (
                    <div className="flex flex-col gap-y-2 w-full">
                      {/* <label className="text-white text-sm font-light ml-2">
                        Phone
                      </label> */}
                      <Input
                        type="text"
                        placeholder="Phone"
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        className="bg-white h-10 shadow-even-xl border-0 outline-none focus:outline-none focus:border-0 focus:ring-0 focus-visible:ring-0 focus-visible:ring-transparent focus-visible:border-0 focus-visible:outline-none ring-0 mx-0"
                        maxLength={10}
                        pattern="[0-9]*"
                        inputMode="numeric"
                      />
                      {field.state.meta.errors &&
                        field.state.meta.errors.length > 0 && (
                          <ErrorMessage errors={field.state.meta.errors} />
                        )}
                    </div>
                  );
                }}
              />
            </div>
            {userType === "organisation" && (
              <form.Field
                name="organisationIdImage"
                children={(field) => {
                  return (
                    <div className="flex flex-col gap-y-2">
                      {/* <label className="text-white text-sm font-light ml-2">
                        Upload Organisation ID
                      </label> */}
                      <Input
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        placeholder="Upload Organisation ID"
                        name={field.name}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          field.handleChange(file || undefined);
                        }}
                        onBlur={field.handleBlur}
                        className="bg-white h-10 shadow-even-xl border-0 outline-none focus:outline-none focus:border-0 focus:ring-0 focus-visible:ring-0 focus-visible:ring-transparent focus-visible:border-0 focus-visible:outline-none ring-0 mx-0"
                      />
                      {field.state.meta.errors &&
                        field.state.meta.errors.length > 0 && (
                          <ErrorMessage errors={field.state.meta.errors} />
                        )}
                      <p className="text-xs text-white/60 ml-2">
                        Upload organisation ID image (JPG, PNG or WEBP, max 5MB)
                      </p>
                    </div>
                  );
                }}
              />
            )}

            <div className="flex gap-5 justify-between">
              {/* <form.Field
                name="hospitalIdImage"
                children={(field) => {
                  return (
                    <div className="flex flex-col gap-y-2">
                      <label className="text-white text-sm font-light ml-2">
                        Upload Hospital ID
                      </label>
                      <Input
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        placeholder="Upload Hospital ID"
                        name={field.name}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          field.handleChange(file || undefined);
                        }}
                        onBlur={field.handleBlur}
                        className="bg-white h-10 shadow-even-xl border-0 outline-none focus:outline-none focus:border-0 focus:ring-0 focus-visible:ring-0 focus-visible:ring-transparent focus-visible:border-0 focus-visible:outline-none ring-0 mx-0"
                      />
                      {field.state.meta.errors &&
                        field.state.meta.errors.length > 0 && (
                          <ErrorMessage errors={field.state.meta.errors} />
                        )}
                      <p className="text-xs text-white/60 ml-2">
                        Upload hospital ID image (JPG, PNG or WEBP, max 5MB)
                      </p>
                    </div>
                  );
                }}
              /> */}

              <form.Field
                name={idName}
                children={(field) => {
                  return (
                    <div className="flex flex-col gap-y-2">
                      {/* <label className="text-white text-sm font-light ml-2">
                        Upload Aadhar Card
                      </label> */}
                      <Input
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        placeholder="Upload Aadhar Card"
                        name={field.name}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          field.handleChange(file || undefined);
                        }}
                        onBlur={field.handleBlur}
                        className="bg-white h-10 shadow-even-xl border-0 outline-none focus:outline-none focus:border-0 focus:ring-0 focus-visible:ring-0 focus-visible:ring-transparent focus-visible:border-0 focus-visible:outline-none ring-0 mx-0"
                      />
                      {field.state.meta.errors &&
                        field.state.meta.errors.length > 0 && (
                          <ErrorMessage errors={field.state.meta.errors} />
                        )}
                      <p className="text-xs text-white/60 ml-2">
                        Upload {idBasedOnUser ?? "Aadhar card"} image (JPG, PNG or WEBP, max 5MB)
                      </p>
                    </div>
                  );
                }}
              />

{/* AADHAR NUMBER */}
              <form.Field
                name="addhar"
                children={(field) => {
                  return (
                    <div className="flex flex-col gap-y-2 w-full">
                      {/* <label className="text-white text-sm font-light ml-2">
                        Aadhar Number
                      </label> */}
                      <Input
                        type="text"
                        placeholder={idBasedOnUser ?? "12-digit Aadhar Number"}
                        name={field.name}
                        value={field.state.value || ""}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        className="bg-white h-10 shadow-even-xl border-0 outline-none focus:outline-none focus:border-0 focus:ring-0 focus-visible:ring-0 focus-visible:ring-transparent focus-visible:border-0 focus-visible:outline-none ring-0 mx-0"
                        maxLength={12}
                        pattern="[0-9]*"
                        inputMode="numeric"
                      />
                      {field.state.meta.errors &&
                        field.state.meta.errors.length > 0 && (
                          <ErrorMessage errors={field.state.meta.errors} />
                        )}
                      <p className="text-xs text-white/60 ml-2">
                        Enter your {idBasedOnUser}
                      </p>
                    </div>
                  );
                }}
              />
            </div>

            <div className="flex gap-5 justify-between">
              <form.Field
                name="password"
                children={(field) => (
                  <div className="flex flex-col gap-y-2 w-full">
                    {/* <label className="text-white text-sm font-light ml-2">
                      Password
                    </label> */}
                    <Input
                      type="password"
                      placeholder="Password"
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      className="bg-white h-10 shadow-even-xl border-0 outline-none focus:outline-none focus:border-0 focus:ring-0 focus-visible:ring-0 focus-visible:ring-transparent focus-visible:border-0 focus-visible:outline-none ring-0 mx-0"
                    />
                    {field.state.meta.errors &&
                      field.state.meta.errors.length > 0 && (
                        <ErrorMessage errors={field.state.meta.errors} />
                      )}
                  </div>
                )}
              />
              <form.Field
                name="confirmPassword"
                children={(field) => (
                  <div className="flex flex-col gap-y-2 w-full">
                    {/* <label className="text-white text-sm font-light ml-2">
                      Re-enter Password
                    </label> */}
                    <Input
                      type="password"
                      placeholder="Re-enter Password"
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      className="bg-white h-10 shadow-even-xl border-0 outline-none focus:outline-none focus:border-0 focus:ring-0 focus-visible:ring-0 focus-visible:ring-transparent focus-visible:border-0 focus-visible:outline-none ring-0 mx-0"
                    />
                    {field.state.meta.errors &&
                      field.state.meta.errors.length > 0 && (
                        <ErrorMessage errors={field.state.meta.errors} />
                      )}
                  </div>
                )}
              />
            </div>
          </>
        )}

        {isLogin && (
          <>
            <form.Field
              name="email"
              children={(field) => {
                return (
                  <div className="flex flex-col gap-y-2">
                    {/* <label className="text-white text-sm font-light ml-2">
                      Email
                    </label> */}
                    <Input
                      type="email"
                      placeholder="Email"
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      className="bg-white h-10 shadow-even-xl border-0 outline-none focus:outline-none focus:border-0 focus:ring-0 focus-visible:ring-0 focus-visible:ring-transparent focus-visible:border-0 focus-visible:outline-none ring-0 mx-0"
                    />
                    {field.state.meta.errors &&
                      field.state.meta.errors.length > 0 && (
                        <ErrorMessage errors={field.state.meta.errors} />
                      )}
                  </div>
                );
              }}
            />
            <form.Field
              name="password"
              children={(field) => (
                <div className="flex flex-col gap-y-2">
                  {/* <label className="text-white text-sm font-light ml-2">
                    Password
                  </label> */}
                  <Input
                    type="password"
                    placeholder="Password"
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    className="bg-white h-10 shadow-even-xl border-0 outline-none focus:outline-none focus:border-0 focus:ring-0 focus-visible:ring-0 focus-visible:ring-transparent focus-visible:border-0 focus-visible:outline-none ring-0 mx-0"
                  />
                  {field.state.meta.errors &&
                    field.state.meta.errors.length > 0 && (
                      <ErrorMessage errors={field.state.meta.errors} />
                    )}
                </div>
              )}
            />
          </>
        )}

        <form.Subscribe
          selector={(state) => [state.canSubmit, state.isSubmitting]}
          children={([canSubmit, isSubmitting]) => (
            <button
              type="submit"
              disabled={!canSubmit || isSubmitting || formSubmitting}
              className="w-full mt-6 bg-primary-magenta hover:bg-primary-magenta/80 text-white font-medium py-2 px-4 rounded-md transition duration-150 ease-in-out disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting || formSubmitting ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Processing...
                </span>
              ) : isLogin ? (
                "Sign In"
              ) : (
                "Sign Up"
              )}
            </button>
          )}
        />

         <div className="text-center mt-4">
                  <p className="text-sm text-gray-600">
                    Already have an account?{" "}
                    <Link
                      to="/login"
                      className="text-primary-magenta hover:underline font-medium"
                    >
                      Login
                    </Link>
                  </p>
                </div>
      </form>
    </div>
  );
}
