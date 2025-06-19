import { createFileRoute } from "@tanstack/react-router";
import Navbar from "@/components/layout/Navbar.tsx";
import Footer from "@/components/layout/Footer.tsx";
import BackToTop from "@/components/common/BackToTop.tsx";
import AboutUsHero from "@/components/sections/aboutUs/AboutUsHero.tsx";
import OurMission from "@/components/sections/aboutUs/OurMission.tsx";
import OurTeam from "@/components/sections/aboutUs/OurTeam.tsx";
import OurImpact from "@/components/sections/aboutUs/OurImpact.tsx";
import OurValues from "@/components/sections/aboutUs/OurValues.tsx";
import { useEffect, useRef } from "react";
import LocomotiveScroll, { ILocomotiveScrollOptions } from "locomotive-scroll";

export const Route = createFileRoute("/about")({
  component: AboutUs,
});

function AboutUs() {
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
    <main
      className="mx-auto relative flex flex-col items-center"
      ref={scrollRef}
      data-scroll-container
    >
      <div className="absolute w-full h-max top-5 left-1/2 -translate-x-1/2 container z-10">
        <Navbar />
      </div>
      <div className="w-full flex flex-col items-center">
        <AboutUsHero />
        <OurMission />
        <OurValues />
        <OurImpact />
        <OurTeam />
      </div>
      <Footer />
      <BackToTop />
    </main>
  );
}
