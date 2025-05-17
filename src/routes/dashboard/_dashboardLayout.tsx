import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AppSidebar } from "@/components/layout/AppSidebar.tsx";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar.tsx";
import { Separator } from "@radix-ui/react-separator";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList } from "@/components/ui/breadcrumb";

export const Route = createFileRoute("/dashboard/_dashboardLayout")({
  component: RouteComponent,
});



function RouteComponent() {
  return (
    <main className={"bg-primary-magenta"}>
      <SidebarProvider style={{ background: "#c6414c" }}>
        <AppSidebar />
        <SidebarInset className={"p-4"} style={{borderRadius: "20px"}}>
          <div className="flex items-center">
            <SidebarTrigger className="text-2xl" />
            <Separator
              orientation="vertical"
              className="mx-2 h-4 w-[1.2px] bg-gray-400"
            />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
                </BreadcrumbItem>
                {/*<BreadcrumbSeparator/>*/}
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          <Outlet />
        </SidebarInset>
      </SidebarProvider>
    </main>
  );
}
