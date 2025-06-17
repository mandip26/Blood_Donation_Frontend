import * as React from "react";

import logo from "@/assets/logo.jpg";
import CalendarIcon from "@/components/icons/CalendarIcon.tsx";
import HomeIcon from "@/components/icons/HomeIcon.tsx";
import RecipeIcon from "@/components/icons/RecipeIcon.tsx";
import VisualizationIcon from "@/components/icons/VisualizationIcon.tsx";
import { NavUser } from "@/components/layout/NavUser.tsx";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import useAuth from "@/hooks/useAuth";
import { Link, useLocation } from "@tanstack/react-router";
import { CirclePlus, Users } from "lucide-react";

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
  ]; // Admin navigation
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
      name: "Events",
      icon: <CalendarIcon />,
      link: "/dashboard/admin/events",
    },
    {
      name: "Blood Requests",
      icon: <RecipeIcon />,
      link: "/dashboard/admin/blood-requests",
    },
    {
      name: "Posts",
      icon: <VisualizationIcon />,
      link: "/dashboard/admin/posts",
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
        <img
          src={logo}
          alt="Blood Donation Logo"
          className="size-32 mx-auto rounded-full object-cover"
        />
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
        {" "}
        <NavUser
          user={{
            name: loggedInUser?.name,
            organizationName: loggedInUser?.organizationName,
            hospitalName: loggedInUser?.hospitalName,
            role: loggedInUser?.role,
            avatar: "",
            email: loggedInUser ? loggedInUser.email : "user@example.com",
          }}
        />
      </SidebarFooter>
    </Sidebar>
  );
}
