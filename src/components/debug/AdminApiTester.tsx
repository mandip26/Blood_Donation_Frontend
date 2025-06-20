import { useState } from "react";
import { adminApi } from "@/services/adminApi";
import { Button } from "@/components/ui/button";

export function AdminApiTester() {
  const [testResults, setTestResults] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const runConnectivityTest = async () => {
    setIsLoading(true);
    try {
      const result = await adminApi.testConnectivity();
      setTestResults(result);
      console.log("Connectivity test results:", result);
    } catch (error: any) {
      setTestResults({ error: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const testDashboardStats = async () => {
    setIsLoading(true);
    try {
      const result = await adminApi.getDashboardStats();
      setTestResults({ dashboardStats: result });
      console.log("Dashboard stats test:", result);
    } catch (error: any) {
      setTestResults({ error: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 border border-gray-300 rounded-lg bg-gray-50 mb-4">
      <h3 className="text-lg font-semibold mb-3">Admin API Tester</h3>

      <div className="flex gap-2 mb-4">
        <Button
          onClick={runConnectivityTest}
          disabled={isLoading}
          variant="outline"
          size="sm"
        >
          {isLoading ? "Testing..." : "Test Connectivity"}
        </Button>

        <Button
          onClick={testDashboardStats}
          disabled={isLoading}
          variant="default"
          size="sm"
        >
          {isLoading ? "Testing..." : "Test Dashboard Stats"}
        </Button>
      </div>

      {testResults && (
        <div className="mt-4">
          <h4 className="font-medium mb-2">Test Results:</h4>
          <pre className="bg-white p-3 border rounded text-xs overflow-auto max-h-60">
            {JSON.stringify(testResults, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
