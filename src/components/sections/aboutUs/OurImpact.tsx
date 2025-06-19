import { TrendingUp, Users, Heart, MapPin } from "lucide-react";

export default function OurImpact() {
  const impactStats = [
    {
      number: "150,000+",
      label: "Lives Saved",
      description: "Through our platform",
      icon: Heart,
      color: "text-red-500",
    },
    {
      number: "45,000+",
      label: "Active Donors",
      description: "In our community",
      icon: Users,
      color: "text-blue-500",
    },
    {
      number: "350+",
      label: "Partner Hospitals",
      description: "Across the network",
      icon: MapPin,
      color: "text-green-500",
    },
    {
      number: "85%",
      label: "Faster Response",
      description: "Than traditional methods",
      icon: TrendingUp,
      color: "text-purple-500",
    },
  ];

  const milestones = [
    {
      year: "2019",
      title: "LifeShare Founded",
      description: "Started with a vision to revolutionize blood donation",
    },
    {
      year: "2020",
      title: "First 1,000 Donors",
      description: "Reached our first major milestone during the pandemic",
    },
    {
      year: "2021",
      title: "50 Hospital Partners",
      description: "Expanded our network to serve more communities",
    },
    {
      year: "2022",
      title: "10,000 Lives Saved",
      description: "Celebrated this incredible achievement with our community",
    },
    {
      year: "2023",
      title: "AI Integration",
      description: "Launched smart matching system for blood compatibility",
    },
    {
      year: "2024",
      title: "100K+ Donations",
      description: "Surpassed 100,000 successful blood donations",
    },
  ];
  return (
    <section className="py-20 bg-white w-full flex justify-center">
      <div className="container max-w-6xl px-4 mx-auto">
        {/* Section Header */}
        <div className="text-center space-y-6 mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-magenta/10 rounded-full text-primary-magenta font-medium">
            <TrendingUp className="w-4 h-4" />
            Our Impact
          </div>
          <h2 className="font-black text-3xl md:text-4xl lg:text-5xl">
            Making a Real{" "}
            <span className="text-primary-magenta">Difference</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Numbers tell a story, but behind every statistic is a life saved, a
            family reunited, and hope restored.
          </p>
        </div>

        {/* Impact Statistics */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
          {impactStats.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <div
                key={index}
                className="text-center group hover:scale-105 transition-transform duration-300"
              >
                <div className="bg-gray-50 rounded-2xl p-8 hover:shadow-lg transition-all duration-300">
                  <div className="flex justify-center mb-4">
                    <div className="w-16 h-16 bg-white rounded-full shadow-md flex items-center justify-center group-hover:shadow-lg transition-shadow duration-300">
                      <IconComponent className={`w-8 h-8 ${stat.color}`} />
                    </div>
                  </div>
                  <div className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
                    {stat.number}
                  </div>
                  <div className="text-lg font-semibold text-gray-700 mb-1">
                    {stat.label}
                  </div>
                  <div className="text-sm text-gray-500">
                    {stat.description}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Timeline Section */}
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl p-8 md:p-12">
          <div className="text-center mb-12">
            <h3 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">
              Our Journey So Far
            </h3>
            <p className="text-gray-600 max-w-2xl mx-auto">
              From a simple idea to a global movement—here's how we've grown
              together with our community.
            </p>
          </div>

          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-primary-magenta/20 rounded-full hidden md:block"></div>

            <div className="space-y-8 md:space-y-12">
              {milestones.map((milestone, index) => (
                <div
                  key={index}
                  className={`flex flex-col md:flex-row items-center gap-6 ${
                    index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                  }`}
                >
                  {/* Content */}
                  <div
                    className={`flex-1 ${
                      index % 2 === 0
                        ? "md:text-right md:pr-8"
                        : "md:text-left md:pl-8"
                    }`}
                  >
                    <div className="bg-white rounded-2xl p-6 shadow-md hover:shadow-lg transition-shadow duration-300">
                      <div className="text-primary-magenta font-bold text-lg mb-2">
                        {milestone.year}
                      </div>
                      <h4 className="text-xl font-bold text-gray-800 mb-2">
                        {milestone.title}
                      </h4>
                      <p className="text-gray-600">{milestone.description}</p>
                    </div>
                  </div>

                  {/* Timeline Dot */}
                  <div className="relative z-10 hidden md:block">
                    <div className="w-4 h-4 bg-primary-magenta rounded-full border-4 border-white shadow-lg"></div>
                  </div>

                  {/* Spacer for alternating layout */}
                  <div className="flex-1 hidden md:block"></div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Future Goals */}
        <div className="mt-16 text-center">
          <div className="bg-gradient-to-r from-primary-magenta to-red-500 rounded-3xl text-white p-8 md:p-12">
            <h3 className="text-2xl md:text-3xl font-bold mb-4">
              Our Future Goals
            </h3>
            <p className="text-white/90 mb-8 max-w-2xl mx-auto">
              We're just getting started. Our vision for the future includes
              expanding globally, integrating advanced AI, and saving even more
              lives together.
            </p>
            <div className="grid sm:grid-cols-3 gap-6 text-center">
              <div>
                <div className="text-3xl font-bold mb-2">1M+</div>
                <div className="text-white/80">Lives to Save</div>
              </div>
              <div>
                <div className="text-3xl font-bold mb-2">100+</div>
                <div className="text-white/80">Countries to Reach</div>
              </div>
              <div>
                <div className="text-3xl font-bold mb-2">24/7</div>
                <div className="text-white/80">Global Availability</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
