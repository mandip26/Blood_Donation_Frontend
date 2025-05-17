import facilitiesImage from "@/assets/landingPage/facilitiesBackground.webp";
import facilityOne from "@/assets/landingPage/facilityOne.jpg";
import facilityTwo from "@/assets/landingPage/facilityTow.jpg";
import facilityThree from "@/assets/landingPage/facilityThree.jpg";
import { useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

export default function FacilitiesSection() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const data = [
    { title: "Expert Staff", image: facilityOne },
    {
      title: "Expert Staff",
      image: facilityTwo,
    },
    { title: "Expert Staff", image: facilityThree },
  ];

  return (
    <section
      data-scroll
      data-scroll-speed="0.2"
      className="mx-auto max-w-7xl relative justify-between"
    >
      <img
        src={facilitiesImage}
        alt="Facilities"
        loading="lazy"
        className="mx-auto"
      />
      <div className="absolute inset-0 size-full gap-8 flex justify-between items-center">
        <div className="space-y-8">
          <h4 className="font-bold text-4xl">Facilities Offered</h4>
          <p className="w-4/5 max-w-xl opacity-80">
            Lorem ipsum dolor sit amet, consectetur adipisicing elit. Amet
            aperiam dolorem eaque,
          </p>
        </div>

        <div className="flex gap-4">
          {data.map((item, index) => {
            return (
              <AnimatedCard
                title={item.title}
                image={item.image}
                index={index}
                currentIndex={currentIndex}
                setCurrentIndex={setCurrentIndex}
                key={index}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}

type CardProps = {
  title: string;
  image: string;
  index: number;
  currentIndex: number;
  setCurrentIndex: (index: number) => void;
};

const AnimatedCard = ({
  currentIndex,
  setCurrentIndex,
  index,
  title,
  image,
}: CardProps) => {
  // Animate title appearance when active
  const activeIndex = currentIndex === index;
  const containerRef = useRef(null);
  const imgRef = useRef(null);
  const largeTextRef = useRef(null);
  const smallTextRef = useRef(null);

  useGSAP(() => {
    const tl = gsap.timeline({
      defaults: { duration: 0.7, ease: "power2.inOut" },
    });

    // Container width animation
    tl.to(
      containerRef.current,
      {
        width: activeIndex ? 384 : 120,
        duration: 0.4,
        ease: "none",
      },
      0,
    ); // Start at time 0

    // Image scale animation
    tl.to(
      imgRef.current,
      {
        scale: activeIndex ? 1 : 1.25,
        duration: 0.4,
        ease: "none",
      },
      "<",
    ); // Start at time 0 too, so they animate together

    // Conditional animations for text
    if (currentIndex === index) {
      tl.fromTo(
        largeTextRef.current,
        { x: 300, opacity: 0, autoAlpha: 0, display: "none" },
        {
          x: 0,
          opacity: 1,
          autoAlpha: 1,
          display: "block",
          duration: 0.7,
          ease: "power1.out",
          immediateRender: false,
        },
        0, // starts after previous animations
      );
      tl.to(
        smallTextRef.current,
        {
          y: 150,
          opacity: 0,
          autoAlpha: 0,
          display: "none",
          duration: 0.2,
          ease: "power1.out",
        },
        0,
      ); // starts at same time as large text animation
    } else {
      tl.fromTo(
        smallTextRef.current,
        { y: 150, opacity: 0, autoAlpha: 0, display: "none" },
        {
          y: 0,
          opacity: 1,
          autoAlpha: 1,
          display: "block",
          duration: 0.4,
          ease: "power1.out",
          immediateRender: false,
        },
        "0",
      );
      tl.to(
        largeTextRef.current,
        {
          x: 300,
          opacity: 0,
          display: "none",
          autoAlpha: 0,
          duration: 0.3,
          ease: "power1.out",
        },
        0,
      );
    }
  }, [activeIndex, currentIndex, index]);

  return (
    <div
      key={index}
      ref={containerRef}
      className={`relative rounded-3xl overflow-hidden shadow-2xl h-96`}
      onMouseEnter={() => setCurrentIndex(index)}
    >
      <img
        ref={imgRef}
        src={image}
        alt={title}
        className="object-cover object-center h-full w-full"
        style={{ scale: activeIndex ? 1 : 1.25 }}
      />
      <div className="absolute bottom-0 right-0 text-white text-xl font-light">
        <div
          ref={largeTextRef}
          className="w-96"
          // style={{ display: currentIndex === index ? "block" : "none" }}
        >
          <p className="rounded-tl-3xl px-4 py-5 bg-primary-magenta">{title}</p>
        </div>
        <div
          ref={smallTextRef}
          className="absolute transform -rotate-90 origin-bottom-left -bottom-1/2 whitespace-nowrap bg-primary-magenta px-4 py-5 rounded-tr-3xl"
          // style={{ display: currentIndex === index ? "none" : "block" }}
        >
          <p className="truncate">{title}</p>
        </div>
      </div>
    </div>
  );
};
