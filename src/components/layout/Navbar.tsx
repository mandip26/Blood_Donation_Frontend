import { Button } from "@/components/ui/button.tsx";
import { Heart, Menu, User, HelpCircle, BookOpen, LogOut } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import gsap from "gsap";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu.tsx";
import useAuth from "@/hooks/useAuth";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const profileButtonRef = useRef<HTMLButtonElement>(null);
  const dropdownContentRef = useRef<HTMLDivElement>(null);
  const { user, isLoggedIn, logout } = useAuth();

  // Enhanced GSAP animation for mobile menu with more poppy animation
  useEffect(() => {
    if (mobileMenuRef.current) {
      // Create a timeline for better sequencing
      const tl = gsap.timeline({ paused: true });

      // Animation for the container - more poppy with a bounce effect
      tl.fromTo(
        mobileMenuRef.current,
        {
          opacity: 0,
          y: -10,
          transformOrigin: "top right", // Align the transform origin to the right
          scaleY: 0.85,
          scaleX: 0.95,
        },
        {
          opacity: 1,
          y: 0,
          scaleY: 1,
          scaleX: 1,
          duration: 0.45,
          ease: "elastic.out(1.1, 0.4)", // More bouncy elastic effect
        }
      );

      // Staggered animation for menu items with more pop
      if (isMenuOpen) {
        // Query the menu items
        const menuItems = mobileMenuRef.current.querySelectorAll("li");

        tl.fromTo(
          menuItems,
          {
            opacity: 0,
            y: -12,
            x: 15, // Start slightly offset to the right
            scale: 0.92,
          },
          {
            opacity: 1,
            y: 0,
            x: 0,
            scale: 1,
            stagger: 0.03, // Faster stagger for a snappier feel
            duration: 0.35,
            ease: "back.out(1.7)", // Add a slight overshoot
          },
          "-=0.3" // More overlap with the container animation
        );

        // Add a subtle highlight effect on items
        tl.fromTo(
          menuItems,
          { color: "inherit" },
          {
            color: "#FF6584", // Assuming this is your primary-magenta color
            stagger: 0.03,
            duration: 0.1,
            yoyo: true,
            repeat: 1,
          },
          "-=0.3"
        );

        tl.play();
      }
    }
  }, [isMenuOpen]);

  // Enhanced GSAP animation for dropdown menu with more poppy effects
  useEffect(() => {
    if (dropdownContentRef.current) {
      // Create a timeline for better sequencing
      const tl = gsap.timeline({ paused: true });

      if (isDropdownOpen) {
        // Query the dropdown items for staggered animation
        const dropdownItems =
          dropdownContentRef.current.querySelectorAll(".dropdown-item");

        // Container animation with more pronounced elastic bounce
        tl.fromTo(
          dropdownContentRef.current,
          {
            opacity: 0,
            y: -15,
            scale: 0.9,
            transformOrigin: "top right", // Ensure right alignment
          },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.5, // Slightly longer for more dramatic effect
            ease: "elastic.out(1.3, 0.4)", // More bouncy elastic effect
          }
        );

        // More dramatic staggered animation for dropdown items
        tl.fromTo(
          dropdownItems,
          {
            opacity: 0,
            x: 15, // Items come in from right to match alignment
            scale: 0.85,
            rotation: 3, // Slight rotation for more pop
          },
          {
            opacity: 1,
            x: 0,
            scale: 1,
            rotation: 0,
            stagger: 0.05, // Slightly more pronounced stagger
            duration: 0.3,
            ease: "back.out(2)", // Stronger overshoot
          },
          "-=0.35" // More overlap with the container animation
        );

        // Add a subtle highlight effect on items
        tl.fromTo(
          dropdownItems,
          { backgroundColor: "transparent" },
          {
            backgroundColor: "rgba(255, 101, 132, 0.08)", // Subtle highlight with your primary color
            stagger: 0.05,
            duration: 0.2,
            yoyo: true,
            repeat: 1,
            ease: "power1.inOut",
          },
          "-=0.3"
        );

        tl.play();
      } else {
        // Improved fade out animation for closing
        gsap.to(dropdownContentRef.current, {
          opacity: 0,
          y: -8,
          rotation: -2, // Slight rotation on close
          scale: 0.95,
          duration: 0.2,
          ease: "power3.in",
        });
      }
    }
  }, [isDropdownOpen]);

  // Enhanced GSAP animation for profile button hover with subtle pulse
  useEffect(() => {
    const profileButton = profileButtonRef.current;

    if (profileButton) {
      // Initial state
      gsap.set(profileButton, {
        scale: 1,
        transformOrigin: "center center",
      });

      // Create a timeline for the hover effect
      const hoverTimeline = gsap.timeline({ paused: true });

      // More natural hover animation with subtle bounce
      hoverTimeline
        .to(profileButton, {
          scale: 1.08,
          duration: 0.25,
          ease: "back.out(1.7)",
        })
        .to(
          profileButton.querySelector("span"),
          {
            y: -2,
            duration: 0.2,
            ease: "power2.out",
          },
          "-=0.2"
        ); // Slight overlap for more natural feel

      // More natural leave animation with different easing
      const leaveTimeline = gsap.timeline({ paused: true });
      leaveTimeline
        .to(profileButton, {
          scale: 1,
          duration: 0.2,
          ease: "power2.inOut",
        })
        .to(
          profileButton.querySelector("span"),
          {
            y: 0,
            duration: 0.15,
            ease: "power1.inOut",
          },
          "-=0.15"
        ); // Slight overlap

      // Event handlers
      const onMouseEnter = () => {
        leaveTimeline.kill();
        hoverTimeline.restart();
      };

      const onMouseLeave = () => {
        hoverTimeline.kill();
        leaveTimeline.restart();
      };

      profileButton.addEventListener("mouseenter", onMouseEnter);
      profileButton.addEventListener("mouseleave", onMouseLeave);

      return () => {
        profileButton.removeEventListener("mouseenter", onMouseEnter);
        profileButton.removeEventListener("mouseleave", onMouseLeave);
      };
    }
  }, []);

  return (
    <nav className="w-full flex justify-between rounded-full max-w-7xl mx-auto bg-white/60 backdrop-blur-md px-4 sm:px-8 py-3 items-center mt-5 z-50 relative">
      {/* Logo */}
      <div className="flex items-center gap-1">
        <Heart className="text-primary-magenta" fill="currentColor" />
        <span className="font-bold text-lg hidden sm:inline">LOGO</span>
      </div>

      {/* Mobile menu button */}
      <div className="md:hidden">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="text-gray-700"
        >
          <Menu />
        </Button>
      </div>

      {/* Desktop menu */}
      <div className="hidden md:flex gap-x-8 items-center font-light">
        <ul className="flex gap-x-4 lg:gap-x-8 items-center">
          <li className="cursor-pointer hover:text-primary-magenta transition-colors duration-200">
            Home
          </li>
          <li className="cursor-pointer hover:text-primary-magenta transition-colors duration-200">
            About Us
          </li>
          <li className="cursor-pointer hover:text-primary-magenta transition-colors duration-200">
            Events
          </li>
          <li className="cursor-pointer hover:text-primary-magenta transition-colors duration-200">
            Page
          </li>
          <li className="cursor-pointer hover:text-primary-magenta transition-colors duration-200">
            News
          </li>
        </ul>

        {/* User profile dropdown menu */}
        <DropdownMenu onOpenChange={setIsDropdownOpen}>
          <DropdownMenuTrigger asChild>
            <Button
              ref={profileButtonRef}
              className="bg-gradient-to-r from-[#FFACAC] to-primary-magenta py-1 px-3 rounded-full cursor-pointer hover:shadow-lg transition duration-300 ease-in-out"
            >
              <span className="flex items-center gap-3">
                <Menu className="w-4 h-4" />
                <User className="w-4 h-4" />
              </span>
            </Button>
          </DropdownMenuTrigger>
          <div
            ref={dropdownContentRef}
            className="absolute right-0 mt-2 z-50"
            style={{
              visibility: isDropdownOpen ? "visible" : "hidden",
              transformOrigin: "top right", // Ensure consistent transform origin
            }}
          >
            <DropdownMenuContent className="w-56 shadow-lg mr-36">
              <DropdownMenuGroup>
                {isLoggedIn ? (
                  <>
                    <DropdownMenuItem asChild className="dropdown-item">
                      <Link
                        to="/dashboard"
                        className="flex items-center cursor-pointer w-full"
                      >
                        <User className="mr-2 h-4 w-4" />
                        <span>Dashboard</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className="dropdown-item"
                      onClick={() => logout()}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Logout</span>
                    </DropdownMenuItem>
                  </>
                ) : (
                  <>
                    <DropdownMenuItem asChild className="dropdown-item">
                      <Link
                        to="/sign-up"
                        className="flex items-center cursor-pointer w-full"
                      >
                        <User className="mr-2 h-4 w-4" />
                        <span>Register</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="dropdown-item">
                      <Link
                        to="/login"
                        className="flex items-center cursor-pointer w-full"
                      >
                        <User className="mr-2 h-4 w-4" />
                        <span>Login</span>
                      </Link>
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem className="dropdown-item">
                  <HelpCircle className="mr-2 h-4 w-4" />
                  <span>Help Center</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="dropdown-item">
                  <BookOpen className="mr-2 h-4 w-4" />
                  <span>Blog</span>
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </div>
        </DropdownMenu>
      </div>

      {/* Mobile menu dropdown */}
      {isMenuOpen && (
        <div
          ref={mobileMenuRef}
          className="absolute top-16 right-4 w-[min(300px,calc(100%-2rem))] bg-white shadow-lg rounded-lg p-4 md:hidden z-50"
        >
          <ul className="flex flex-col gap-y-3">
            <li className="cursor-pointer hover:text-primary-magenta transition-colors duration-200">
              Home
            </li>
            <li className="cursor-pointer hover:text-primary-magenta transition-colors duration-200">
              About Us
            </li>
            <li className="cursor-pointer hover:text-primary-magenta transition-colors duration-200">
              Events
            </li>
            <li className="cursor-pointer hover:text-primary-magenta transition-colors duration-200">
              Page
            </li>
            <li className="cursor-pointer hover:text-primary-magenta transition-colors duration-200">
              News
            </li>
            <li className="h-px bg-gray-200 my-2"></li>
            
            {isLoggedIn ? (
              <>
                <li>
                  <Link
                    to="/dashboard"
                    className="flex items-center gap-2 hover:text-primary-magenta transition-colors duration-200 w-full"
                  >
                    <User className="w-4 h-4" />
                    Dashboard
                  </Link>
                </li>
                <li 
                  className="flex items-center gap-2 hover:text-primary-magenta transition-colors duration-200 w-full cursor-pointer"
                  onClick={() => logout()}
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </li>
              </>
            ) : (
              <>
                <li>
                  <Link
                    to="/sign-up"
                    className="flex items-center gap-2 hover:text-primary-magenta transition-colors duration-200 w-full"
                  >
                    <User className="w-4 h-4" />
                    Register
                  </Link>
                </li>
                <li>
                  <Link
                    to="/login"
                    className="flex items-center gap-2 hover:text-primary-magenta transition-colors duration-200 w-full"
                  >
                    <User className="w-4 h-4" />
                    Login
                  </Link>
                </li>
              </>
            )}
            
            <li className="h-px bg-gray-200 my-2"></li>
            <li className="flex items-center gap-2 hover:text-primary-magenta cursor-pointer transition-colors duration-200">
              <HelpCircle className="w-4 h-4" />
              Help Center
            </li>
            <li className="flex items-center gap-2 hover:text-primary-magenta cursor-pointer transition-colors duration-200">
              <BookOpen className="w-4 h-4" />
              Blog
            </li>
          </ul>
        </div>
      )}
    </nav>
  );
}
