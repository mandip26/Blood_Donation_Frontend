export default function LandingPageStates() {
  const data = [
    {
      stat: "24+",
      detail: "Year Experience",
    },
    {
      stat: "98+",
      detail: "Expert Staff",
    },
    {
      stat: "50+",
      detail: "Blood Per Month",
    },
    {
      stat: "33+",
      detail: "Cooperation",
    },
  ];
  return (
    <div className="bg-primary-magenta w-full max-w-6xl rounded-xl shadow-2xl">
      <div className="grid grid-cols-2 md:grid-cols-4 place-content-center gap-4 md:gap-6 lg:gap-8 px-4 md:px-8 py-6 md:py-8 lg:py-12 text-white">
        {data.map((item, id) => {
          return (
            <div key={id} className="space-y-1 md:space-y-2 text-center">
              <div className="text-2xl md:text-3xl lg:text-4xl font-bold">
                {item.stat}
              </div>
              <div className="text-xs md:text-sm lg:text-base">
                {item.detail}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
