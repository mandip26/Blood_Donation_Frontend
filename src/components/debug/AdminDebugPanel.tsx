import { useState, useEffect } from "react";
import { checkAdminAccess } from "@/utils/adminAuthCheck";
import { adminApi } from "@/services/adminApi";
import { Button } from "@/components/ui/button";

export function AdminDebugPanel() {
  const [adminState, setAdminState] = useState<{
    hasAccess: boolean;
    isAdmin: boolean;
    message: string;
    userRole?: string | null;
    error?: string;
  } | null>(null);

  const [isChecking, setIsChecking] = useState(false);
  const [testResults, setTestResults] = useState<any>(null);

  const checkAdmin = async () => {
    setIsChecking(true);
    try {
      const state = await checkAdminAccess();
      setAdminState(state);
    } catch (error: any) {
      console.error("Error checking admin state:", error);
      setAdminState({
        hasAccess: false,
        isAdmin: false,
        message: "Error during verification",
        error: error.message,
      });
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    checkAdmin();
  }, []);

  const runEndpointTest = async () => {
    try {
      setTestResults(null);
      const result = await adminApi.testAdminAccess();
      setTestResults(result);
    } catch (error: any) {
      setTestResults({
        success: false,
        error: error.message,
      });
    }
  };

  const getUserToken = () => {
    try {
      const userData = localStorage.getItem("bloodDonationUser");
      if (!userData) return null;
      const user = JSON.parse(userData);
      return user?.token;
    } catch {
      return null;
    }
  };

  return (
    <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg shadow mb-6">
      <h2 className="text-lg font-semibold mb-2">Admin Access Diagnostics</h2>

      {adminState ? (
        <div>
          <div className="mb-4">
            <p className="flex items-center gap-2">
              <span className="font-medium">Admin Role:</span>
              {adminState.isAdmin ? (
                <span className="text-green-600 font-semibold">Yes</span>
              ) : (
                <span className="text-red-600 font-semibold">No</span>
              )}
            </p>
            <p className="flex items-center gap-2">
              <span className="font-medium">API Access:</span>
              {adminState.hasAccess ? (
                <span className="text-green-600 font-semibold">Working</span>
              ) : (
                <span className="text-red-600 font-semibold">Failed</span>
              )}
            </p>
            <p className="text-sm mt-2 text-gray-600">{adminState.message}</p>
            {adminState.error && (
              <p className="text-sm text-red-600 mt-1">{adminState.error}</p>
            )}

            <div className="mt-2 p-2 bg-gray-50 rounded border border-gray-200">
              <p className="text-xs font-medium">
                User Role: {adminState.userRole || "None"}
              </p>
              <p className="text-xs font-medium mt-1">
                Token: {getUserToken() ? "Present" : "Missing"}
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={checkAdmin}
              disabled={isChecking}
              variant="outline"
              size="sm"
            >
              {isChecking ? "Checking..." : "Check Again"}
            </Button>
            <Button onClick={runEndpointTest} variant="default" size="sm">
              Test Endpoint
            </Button>
          </div>

          {testResults && (
            <div className="mt-4 p-3 text-xs bg-gray-50 border border-gray-200 rounded overflow-auto max-h-40">
              <pre>{JSON.stringify(testResults, null, 2)}</pre>
            </div>
          )}
        </div>
      ) : (
        <p>Checking admin access...</p>
      )}
    </div>
  );
}
