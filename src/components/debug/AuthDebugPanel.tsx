import { useState, useEffect } from "react";
import { verifyAuthToken } from "@/utils/testAuthState";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";

export function AuthDebugPanel() {
  const [authState, setAuthState] = useState<{
    isAuthenticated: boolean;
    hasToken: boolean;
    message: string;
  } | null>(null);

  const [isChecking, setIsChecking] = useState(false);
  const { user, reloadUser } = useAuth();

  const checkAuthState = async () => {
    setIsChecking(true);
    try {
      const state = await verifyAuthToken();
      setAuthState(state);
    } catch (error) {
      console.error("Error checking auth state:", error);
      setAuthState({
        isAuthenticated: false,
        hasToken: false,
        message: "Error during verification",
      });
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    checkAuthState();
  }, []);

  const refreshUserData = async () => {
    try {
      await reloadUser();
      checkAuthState();
    } catch (error) {
      console.error("Failed to reload user:", error);
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow mb-6">
      <h2 className="text-lg font-semibold mb-2">Authentication Status</h2>

      {authState ? (
        <div>
          <div className="mb-4">
            <p className="flex items-center gap-2">
              <span className="font-medium">Authenticated:</span>
              {authState.isAuthenticated ? (
                <span className="text-green-600 font-semibold">Yes</span>
              ) : (
                <span className="text-red-600 font-semibold">No</span>
              )}
            </p>
            <p className="flex items-center gap-2">
              <span className="font-medium">Has Token:</span>
              {authState.hasToken ? (
                <span className="text-green-600 font-semibold">Yes</span>
              ) : (
                <span className="text-red-600 font-semibold">No</span>
              )}
            </p>
            <p className="text-sm mt-2 text-gray-600">{authState.message}</p>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={checkAuthState}
              disabled={isChecking}
              variant="outline"
              size="sm"
            >
              {isChecking ? "Checking..." : "Check Again"}
            </Button>
            <Button onClick={refreshUserData} variant="default" size="sm">
              Refresh User Data
            </Button>
          </div>
        </div>
      ) : (
        <p>Checking authentication status...</p>
      )}
    </div>
  );
}
