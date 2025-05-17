import { createFileRoute } from "@tanstack/react-router";
import backgroundImage from "@/assets/authBackground.png";
import AuthLayout from "@/components/layout/AuthLayout.tsx";

export const Route = createFileRoute("/(auth)/login")({
  component: RouteComponent,
});

function RouteComponent() {  return (
    <main className="relative min-h-screen">
      <img
        src={backgroundImage}
        alt=""
        className="h-screen w-full object-cover"
      />
      <div className="absolute mx-auto container max-w-7xl inset-0 size-full">
        <div className="flex items-center size-full justify-center p-4 md:p-8">
          <div className="w-full max-w-lg">
            <AuthLayout isLogin={true} />
          </div>
        </div>
      </div>
    </main>
  );
}
