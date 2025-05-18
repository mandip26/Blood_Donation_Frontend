import { createFileRoute } from "@tanstack/react-router";
import backgroundImage from "@/assets/authBackground.png";
import AuthLayout from "@/components/layout/AuthLayout.tsx";
import ProtectedRoute from "@/components/common/ProtectedRoute";

export const Route = createFileRoute("/(auth)/login")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <ProtectedRoute requireAuth={false}>
      <main className="relative min-h-screen">
        <img
          src={backgroundImage}
          alt=""
          className="h-screen w-full object-cover"
        />
        <div className="absolute mx-auto container max-w-7xl inset-0 size-full">
          <div className="flex items-center size-full justify-center p-8">
            <AuthLayout isLogin={true} />
          </div>
        </div>
      </main>
    </ProtectedRoute>
  );
}
