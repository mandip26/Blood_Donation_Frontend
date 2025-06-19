import ProtectedRoute from "@/components/common/ProtectedRoute";
import { AppSidebar } from "@/components/layout/AppSidebar.tsx";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar.tsx";
import { Separator } from "@radix-ui/react-separator";
import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard/_dashboardLayout")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <ProtectedRoute requireAuth={true}>
      <main className={"bg-primary-magenta"}>
        <SidebarProvider style={{ background: "#c6414c" }}>
          <AppSidebar />
          <SidebarInset className={"p-4"} style={{ borderRadius: "20px" }}>
            <div className="flex items-center">
              <SidebarTrigger className="text-2xl" />
              <Separator
                orientation="vertical"
                className="mx-2 h-4 w-[1.2px] bg-gray-400"
              />
            </div>

            <Outlet />
          </SidebarInset>
        </SidebarProvider>
      </main>
    </ProtectedRoute>
  );
}
