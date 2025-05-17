import { ChevronsUpDown } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import ProfileIcon from "@/components/icons/ProfileIcon.tsx";
import { Link, useLocation } from "@tanstack/react-router";
import PasswordIcon from "@/components/icons/PasswordIcon.tsx";
import HospitalIcon from "@/components/icons/HospitalIcon.tsx";

export function NavUser({
  user,
}: {
  user: {
    name: string;
    email: string;
    avatar: string;
  };
}) {
  const { isMobile } = useSidebar();

  const options = [
    {
      name: "Edit Profile",
      icon: <ProfileIcon />,
      link: "/dashboard/edit-profile",
    },
    {
      name: "Edit Password",
      icon: <PasswordIcon />,
      link: "/dashboard/edit-password",
    },
    {
      name: "Hospital History",
      icon: <HospitalIcon />,
      link: "/dashboard/hospital-history",
    },
  ];

  const location = useLocation();
  const currentRoute = location.pathname;

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-white/15 data-[state=open]:text-white shadow-even-sm text-white bg-white/10 hover:bg-white/15 hover:text-white"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="rounded-lg text-black">
                  CN
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">{user.name}</span>
                <span className="truncate text-xs">{user.email}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg bg-primary-magenta text-white border-none shadow-even-2xl space-y-3"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="rounded-lg text-black">
                    CN
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">{user.name}</span>
                  <span className="truncate text-xs">{user.email}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="w-4/5 mx-auto" />
            <DropdownMenuGroup className="space-y-1 mt-3">
              {options.map((item, i) => (
                <DropdownMenuItem
                  key={i}
                  className={`focus:bg-white/15 focus:text-white rounded-lg h-9 ${currentRoute === item.link ? "bg-white/20" : "bg-transparent"}`}
                >
                  <Link to={item.link} className="flex gap-3 items-center px-3">
                    {item.icon}
                    {item.name}
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
