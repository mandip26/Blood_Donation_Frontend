import bannerImage from "@/assets/landingPage/landingHeroBanner.webp";
import { Button } from "@/components/ui/button.tsx";
import LandingPageStates from "./LandingPageStates";
import { Play } from "lucide-react";

export default function LandingPageHeroBanner() {
  return (
    <section className="relative">
      <img
        src={bannerImage}
        alt="Landing Hero Banner"
        loading="lazy"
        className="object-cover min-h-screen w-full"
      />
      <div className="absolute inset-0 size-full bg-primary-magenta/22 flex items-center justify-center">
        <div className="container max-w-4xl space-y-8 sm:space-y-12 px-4">
          <h1 className="font-black text-3xl sm:text-4xl md:text-5xl leading-[120%] text-center">
            Donate Your Blood to Us, Save More Life Together
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl text-center">
            Every 2 seconds, someone needs blood. Your single donation can save
            up to 3 lives. Join our community of heroes and make a difference in
            someone's life today.
          </p>
          <div className="flex items-center justify-center gap-x-4 sm:gap-x-8">
            <Button
              size="lg"
              className="shadow hover:shadow-md cursor-pointer shadow-black/25 bg-primary-magenta hover:bg-primary-magenta/80 text-white font-light"
            >
              Learn More
            </Button>
            <Button
              size="icon"
              variant="outline"
              className="rounded-full w-12 h-12 bg-white hover:bg-white/90 border-none shadow-md flex items-center justify-center"
            >
              <Play fill="currentColor" className="text-primary-magenta ml-1" />
            </Button>
          </div>
        </div>
      </div>
      <div className="absolute w-max bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2">
        <LandingPageStates />
      </div>
    </section>
  );
}
