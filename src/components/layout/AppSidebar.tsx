import * as React from "react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { NavUser } from "@/components/layout/NavUser.tsx";
import HomeIcon from "@/components/icons/HomeIcon.tsx";
import DonateIcon from "@/components/icons/DonateIcon.tsx";
import { Link, useLocation } from "@tanstack/react-router";
import RecipeIcon from "@/components/icons/RecipeIcon.tsx";
import CalendarIcon from "@/components/icons/CalendarIcon.tsx";
import VisualizationIcon from "@/components/icons/VisualizationIcon.tsx";
import { CirclePlus, Users, Building, Building2 } from "lucide-react";
import useAuth from "@/hooks/useAuth";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const location = useLocation();
  const currentRoute = location.pathname;
  const { user: loggedInUser } = useAuth();
  const userRole = loggedInUser?.role || "user";

  // Default user navigation
  const userNavData = [
    {
      name: "Home",
      icon: <HomeIcon />,
      link: "/dashboard",
    },
    {
      name: "Donate",
      icon: <DonateIcon />,
      link: "/dashboard/donate",
    },
    {
      name: "Recipient",
      icon: <RecipeIcon />,
      link: "/dashboard/recipient",
    },
    {
      name: "Events",
      icon: <CalendarIcon />,
      link: "/dashboard/events",
    },
    {
      name: "Visualization",
      icon: <VisualizationIcon />,
      link: "/dashboard/visualization",
    },
    {
      name: "Create",
      icon: <CirclePlus />,
      link: "/dashboard/create",
    },
  ];
  // Hospital navigation
  const hospitalNavData = [
    {
      name: "Home",
      icon: <HomeIcon />,
      link: "/dashboard",
    },
    {
      name: "Donate",
      icon: <DonateIcon />,
      link: "/dashboard/donate",
    },
    {
      name: "Recipient",
      icon: <RecipeIcon />,
      link: "/dashboard/recipient",
    },
    {
      name: "Events",
      icon: <CalendarIcon />,
      link: "/dashboard/events",
    },
    {
      name: "Visualization",
      icon: <VisualizationIcon />,
      link: "/dashboard/visualization",
    },
    {
      name: "Create",
      icon: <CirclePlus />,
      link: "/dashboard/create",
    },
  ];
  // Organization navigation
  const organizationNavData = [
    {
      name: "Home",
      icon: <HomeIcon />,
      link: "/dashboard",
    },
    {
      name: "Donate",
      icon: <DonateIcon />,
      link: "/dashboard/donate",
    },
    {
      name: "Recipient",
      icon: <RecipeIcon />,
      link: "/dashboard/recipient",
    },
    {
      name: "Events",
      icon: <CalendarIcon />,
      link: "/dashboard/events",
    },
    {
      name: "Visualization",
      icon: <VisualizationIcon />,
      link: "/dashboard/visualization",
    },
    {
      name: "Create",
      icon: <CirclePlus />,
      link: "/dashboard/create",
    },
  ];
  // Admin navigation
  const adminNavData = [
    {
      name: "Home",
      icon: <HomeIcon />,
      link: "/dashboard/admin",
    },
    {
      name: "Users",
      icon: <Users />,
      link: "/dashboard/admin/users",
    },
    {
      name: "Hospitals",
      icon: <Building />,
      link: "/dashboard/donate",
    },
    {
      name: "Events",
      icon: <CalendarIcon />,
      link: "/dashboard/admin/events",
    },
    {
      name: "Organizations",
      icon: <Building2 />,
      link: "/dashboard/events",
    },
    {
      name: "Analytics",
      icon: <VisualizationIcon />,
      link: "/dashboard/admin/analytics",
    },
    {
      name: "System",
      icon: <Users />,
      link: "/dashboard/admin/profile",
    },
  ];

  // Select navigation based on user role
  let sideNavData = userNavData;
  if (userRole === "hospital") {
    sideNavData = hospitalNavData;
  } else if (userRole === "organization") {
    sideNavData = organizationNavData;
  } else if (userRole === "admin") {
    sideNavData = adminNavData;
  }

  return (
    <Sidebar variant="inset" {...props} className={"bg-primary-magenta"}>
      <SidebarHeader className="py-8 bg-primary-magenta">
        <div className="bg-white size-32 mx-auto rounded-full"></div>
      </SidebarHeader>
      <SidebarContent className={"bg-primary-magenta"}>
        <SidebarMenu className={"space-y-2 my-4"}>
          {sideNavData.map((item, i) => {
            return (
              <SidebarMenuItem key={i}>
                <SidebarMenuButton
                  className={`cursor-pointer rounded-xl h-12 text-white hover:bg-white/20 hover:text-white active:bg-white/15 active:text-white font-semibold ${currentRoute === item.link ? "bg-white/30 shadow-even-md" : "bg-transparent"}`}
                  asChild={true}
                >
                  <Link
                    to={item.link}
                    className={"flex gap-3 items-center px-8 text-lg"}
                  >
                    {item.icon}
                    {item.name}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className={"bg-primary-magenta"}>
        <NavUser
          user={{
            name:
              loggedInUser?.name ||
              loggedInUser?.hospitalName ||
              loggedInUser?.organizationName ||
              "User",
            avatar: "",
            email: loggedInUser ? loggedInUser.email : "user@example.com",
          }}
        />
      </SidebarFooter>
    </Sidebar>
  );
}
