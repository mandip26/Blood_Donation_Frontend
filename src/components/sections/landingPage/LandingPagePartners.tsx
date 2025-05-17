import { useRef } from "react";
import apolloLogo from "../../../assets/landingPage/apollo.png";
import fortisLogo from "../../../assets/landingPage/fortis.png";
import tataLogo from "../../../assets/landingPage/tata.png";

export default function LandingPagePartners() {
  const marqueeRef = useRef<HTMLDivElement>(null);

  // Create an array with 3 logos
  const partnerLogos = [
    { id: 1, name: "Apollo", logo: apolloLogo },
    { id: 2, name: "Fortis", logo: fortisLogo },
    { id: 3, name: "Tata", logo: tataLogo },
  ];

  // Double the array to get 6 logos (3 logos repeated twice)
  const allLogos = [...partnerLogos, ...partnerLogos];

  return (
    <section
      className="container max-w-7xl mx-auto pb-16"
      data-scroll
      data-scroll-speed="0.1"
    >
      <h1 className="text-center text-4xl font-bold mb-12">Our Partners</h1>

      <div className="relative w-full overflow-hidden marquee-container">
        <div ref={marqueeRef} className="flex gap-16 items-center marquee">
          {allLogos.map((partner, index) => (
            <div
              key={`${partner.id}-${index}`}
              className="partner-logo w-32 h-32 md:w-40 md:h-40 flex items-center justify-center transform hover:scale-105 transition-transform duration-300 shrink-0"
            >
              <img
                src={partner.logo}
                alt={`${partner.name} logo`}
                className="w-full h-full object-contain"
                style={{ filter: "grayscale(0.2)" }}
              />
            </div>
          ))}

          {/* Duplicate the logos again to ensure seamless looping */}
          {allLogos.map((partner, index) => (
            <div
              key={`${partner.id}-dup-${index}`}
              className="partner-logo w-32 h-32 md:w-40 md:h-40 flex items-center justify-center transform hover:scale-105 transition-transform duration-300 shrink-0"
            >
              <img
                src={partner.logo}
                alt={`${partner.name} logo`}
                className="w-full h-full object-contain"
                style={{ filter: "grayscale(0.2)" }}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
