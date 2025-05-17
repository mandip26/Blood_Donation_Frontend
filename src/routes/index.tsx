import { createFileRoute } from "@tanstack/react-router";
import Navbar from "@/components/layout/Navbar.tsx";
import LandingPageHeroBanner from "@/components/sections/landingPage/LandingPageHeroBanner.tsx";
import LocomotiveScroll, { ILocomotiveScrollOptions } from "locomotive-scroll";
import { useEffect, useRef } from "react";
import FacilitiesSection from "@/components/sections/landingPage/FacilitiesSection";
import Footer from "@/components/layout/Footer.tsx";
import LandingPagePartners from "@/components/sections/landingPage/LandingPagePartners";
import BloodTestVisualization from "@/components/sections/landingPage/BloodTestVisualization";
import BloodDonationEvents from "@/components/sections/landingPage/BloodDonationEvents";
import Testimonials from "@/components/sections/landingPage/Testimonials";
import BackToTop from "@/components/common/BackToTop";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!scrollRef.current) return;

    const scroll = new LocomotiveScroll({
      target: scrollRef.current,
      smooth: true,
      lerp: 0.1,
    } as ILocomotiveScrollOptions);

    return () => {
      if (scroll) {
        scroll.destroy();
      }
    };
  }, []);
  return (
    <main className="mx-auto relative" ref={scrollRef} data-scroll-container>
      <div className="absolute w-full h-max top-5 left-1/2 -translate-x-1/2 container z-10">
        <Navbar />
      </div>
      <LandingPageHeroBanner />
      <FacilitiesSection />
      <LandingPagePartners />
      <BloodTestVisualization />
      <BloodDonationEvents />
      <Testimonials />
      <Footer />
      <BackToTop />
    </main>
  );
}
