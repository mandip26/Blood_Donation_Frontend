import { Shield, Users, Award, Clock, Heart, Zap } from "lucide-react";

export default function OurValues() {
  const values = [
    {
      icon: Shield,
      title: "Safety First",
      description:
        "We maintain the highest medical standards and safety protocols to ensure every donation is safe for both donors and recipients.",
      color: "from-blue-500 to-blue-600",
    },
    {
      icon: Users,
      title: "Community Driven",
      description:
        "Our strength lies in our community. We foster connections and build lasting relationships between donors, recipients, and healthcare providers.",
      color: "from-green-500 to-green-600",
    },
    {
      icon: Award,
      title: "Excellence",
      description:
        "We strive for excellence in everything we do, from user experience to medical protocols, ensuring the best outcomes for everyone involved.",
      color: "from-purple-500 to-purple-600",
    },
    {
      icon: Clock,
      title: "Reliability",
      description:
        "When lives are on the line, timing matters. We ensure our platform is available 24/7 with rapid response times for critical situations.",
      color: "from-orange-500 to-orange-600",
    },
    {
      icon: Heart,
      title: "Compassion",
      description:
        "Every interaction is guided by empathy and understanding. We recognize that behind every request is a human story that matters.",
      color: "from-primary-magenta to-red-500",
    },
    {
      icon: Zap,
      title: "Innovation",
      description:
        "We leverage cutting-edge technology to make blood donation more accessible, efficient, and impactful than ever before.",
      color: "from-yellow-500 to-yellow-600",
    },
  ];
  return (
    <section className="py-20 bg-gray-50 w-full flex justify-center">
      <div className="container max-w-6xl px-4 mx-auto">
        {/* Section Header */}
        <div className="text-center space-y-6 mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-magenta/10 rounded-full text-primary-magenta font-medium">
            <Heart className="w-4 h-4" />
            What Drives Us
          </div>
          <h2 className="font-black text-3xl md:text-4xl lg:text-5xl">
            Our Core <span className="text-primary-magenta">Values</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            These values aren't just words on a page—they're the foundation of
            every decision we make and every feature we build.
          </p>
        </div>

        {/* Values Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {values.map((value, index) => {
            const IconComponent = value.icon;
            return (
              <div
                key={index}
                className="bg-white rounded-2xl p-8 hover:shadow-xl transition-all duration-300 group border border-gray-100 hover:border-primary-magenta/20"
              >
                <div
                  className={`w-16 h-16 bg-gradient-to-r ${value.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}
                >
                  <IconComponent className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-4 text-gray-800 group-hover:text-primary-magenta transition-colors duration-300">
                  {value.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {value.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Call to Action */}
        <div className="mt-16 text-center">
          <div className="bg-white rounded-3xl p-8 md:p-12 shadow-lg border border-gray-100">
            <h3 className="text-2xl md:text-3xl font-bold mb-4 text-gray-800">
              Ready to Make a Difference?
            </h3>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              Join thousands of heroes who have already made the choice to save
              lives. Your journey as a lifesaver starts with a single click.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="px-8 py-4 bg-primary-magenta hover:bg-primary-magenta/90 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
                Start Donating Today
              </button>
              <button className="px-8 py-4 border-2 border-primary-magenta text-primary-magenta hover:bg-primary-magenta hover:text-white font-medium rounded-xl transition-all duration-300">
                Learn More About Process
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
