import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import { Input } from "@/components/ui/input.tsx";
import { useState } from "react";
import { Toaster, toast } from "react-hot-toast";
import { Link, useNavigate } from "@tanstack/react-router";
import useAuth from "@/hooks/useAuth";

// Login schema
const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
});

export default function LoginForm() {
  const [apiError, setApiError] = useState<string | null>(null);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

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
  
  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
    validators: {
      onBlur: loginSchema,
    },
    onSubmit: async ({ value }: { value: any }) => {
      try {
        setFormSubmitting(true);
        setApiError(null);
        
        console.log("Submitting login form with:", value.email); // Debug email
        
        // Call login function from auth hook
        const response = await login(value.email, value.password);
        
        console.log("Login function returned:", response); // Debug response
        
        // Token storage is handled by the useAuth hook
        
        // Show success message
        toast.success("Login successful!");
        
        // Give toast time to display before navigating
        setTimeout(() => {
          console.log("Navigating to dashboard...");
          navigate({ to: "/dashboard" });
        }, 300);
        
      } catch (error: any) {
        console.error("Login error:", error);
        
        // Extract and display error message
        let errorMessage = "An error occurred during login";
        
        if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
        } else if (error.message) {
          errorMessage = error.message;
        }
        
        setApiError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setFormSubmitting(false);
      }
    },
  });

  return (
    <div className="my-4 w-full min-w-md max-w-md">
      <Toaster position="top-center" />
      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          void form.handleSubmit();
        }}
        className="space-y-6"
      >
        {apiError && (
          <div
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
            role="alert"
          >
            <span className="block sm:inline">{apiError}</span>
          </div>
        )}

        <div className="space-y-2">
          <label
            htmlFor="email"
            className="block text-sm font-medium text-white"
          >
            Email
          </label>
          <form.Field
            name="email"
            children={(field) => (
              <div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      className="h-5 w-5 text-gray-400"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
                      />
                    </svg>
                  </div>
                  <Input
                    placeholder="Email"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    className="pl-10 py-3 w-full rounded-md bg-white/90 border-0 shadow-sm"
                  />
                </div>
                <ErrorMessage errors={field.state.meta.errors} />
              </div>
            )}
          />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-white"
            >
              Password
            </label>
            {/* <Link
              to="/"
              className="text-sm text-right text-white font-medium"
            >
              Forgot Password
            </Link> */}
          </div>
          <form.Field
            name="password"
            children={(field) => (
              <div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      className="h-5 w-5 text-gray-400"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                  </div>
                  <Input
                    type="password"
                    placeholder="Password"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    className="pl-10 py-3 w-full rounded-md bg-white/90 border-0 shadow-sm"
                  />
                </div>
                <ErrorMessage errors={field.state.meta.errors} />
              </div>
            )}
          />
        </div>

        <form.Subscribe
          selector={(state) => [state.canSubmit, state.isSubmitting]}
          children={([canSubmit, isSubmitting]) => (
            <button
              type="submit"
              disabled={!canSubmit || isSubmitting || formSubmitting}
              className="w-full bg-primary-magenta hover:bg-primary-magenta/80 text-white font-medium py-3 px-4 rounded-md transition duration-150 ease-in-out disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting || formSubmitting ? (
                <span className="flex items-center justify-center">
                  Processing...
                </span>
              ) : (
                "Login"
              )}
            </button>
          )}
        />

        <div className="text-center mt-4">
          <p className="text-sm text-gray-600">
            Don't have an account?{" "}
            <Link
              to="/sign-up"
              className="text-primary-magenta hover:underline font-medium"
            >
              Sign up
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
}