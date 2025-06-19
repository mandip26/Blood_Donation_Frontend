import { Target, Eye, HandHeart, Globe } from "lucide-react";

export default function OurMission() {
  return (
    <section className="py-20 bg-white w-full flex justify-center">
      <div className="container max-w-6xl px-4 mx-auto">
        {/* Section Header */}
        <div className="text-center space-y-6 mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-magenta/10 rounded-full text-primary-magenta font-medium">
            <Target className="w-4 h-4" />
            Our Purpose
          </div>
          <h2 className="font-black text-3xl md:text-4xl lg:text-5xl">
            Mission, Vision &{" "}
            <span className="text-primary-magenta">Values</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            At LifeShare, we're driven by a simple yet powerful purpose: to
            bridge the gap between those who can give and those who need.
          </p>
        </div>

        {/* Mission, Vision, Values Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Mission */}
          <div className="bg-gradient-to-br from-primary-magenta/5 to-primary-magenta/10 rounded-2xl p-8 hover:shadow-lg transition-all duration-300 group">
            <div className="w-16 h-16 bg-primary-magenta/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <Target className="w-8 h-8 text-primary-magenta" />
            </div>
            <h3 className="text-2xl font-bold mb-4 text-gray-800">
              Our Mission
            </h3>
            <p className="text-gray-600 leading-relaxed">
              To create a seamless, efficient, and accessible blood donation
              ecosystem that connects willing donors with those in critical
              need, ensuring no life is lost due to blood shortage.
            </p>
          </div>

          {/* Vision */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-8 hover:shadow-lg transition-all duration-300 group">
            <div className="w-16 h-16 bg-blue-200 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <Eye className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-2xl font-bold mb-4 text-gray-800">
              Our Vision
            </h3>
            <p className="text-gray-600 leading-relaxed">
              A world where blood shortages are a thing of the past, where every
              person has access to safe blood when they need it, and where
              giving blood is as common as lending a helping hand.
            </p>
          </div>

          {/* Values */}
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-8 hover:shadow-lg transition-all duration-300 group md:col-span-2 lg:col-span-1">
            <div className="w-16 h-16 bg-green-200 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <HandHeart className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold mb-4 text-gray-800">
              Our Values
            </h3>
            <p className="text-gray-600 leading-relaxed mb-4">
              We believe in compassion, transparency, and community. Every
              action we take is guided by these core principles:
            </p>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                Compassion in every interaction
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                Transparency in our processes
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                Excellence in healthcare standards
              </li>
            </ul>
          </div>
        </div>

        {/* Global Impact Section */}
        <div className="mt-16 bg-gradient-to-r from-primary-magenta to-red-500 rounded-3xl text-white p-8 md:p-12">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Globe className="w-6 h-6" />
                <span className="font-medium">Global Impact</span>
              </div>
              <h3 className="text-3xl md:text-4xl font-bold mb-4">
                Making a Difference Worldwide
              </h3>
              <p className="text-white/90 leading-relaxed mb-6">
                Our platform has revolutionized blood donation across multiple
                countries, creating a ripple effect of positive change in
                healthcare systems worldwide.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-2xl font-bold">118</div>
                  <div className="text-white/80 text-sm">Countries Reached</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">2.5M+</div>
                  <div className="text-white/80 text-sm">Global Donors</div>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 h-48 flex items-center justify-center">
                <div className="text-center">
                  <Globe className="w-16 h-16 mx-auto mb-4 text-white/80" />
                  <p className="text-white/90">
                    "Every drop counts, every donor matters, every life saved is
                    a victory for humanity."
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
