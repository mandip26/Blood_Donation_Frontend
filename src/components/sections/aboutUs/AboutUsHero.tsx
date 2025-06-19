import { Button } from "@/components/ui/button.tsx";
import { Heart, Users, Droplets } from "lucide-react";

export default function AboutUsHero() {
  return (
    <section className="relative min-h-screen bg-gradient-to-br from-primary-magenta/10 via-white to-red-50 flex items-center justify-center w-full">
      <div className="container max-w-6xl px-4 py-20 mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-center justify-center">
          {/* Left Column - Text Content */}
          <div className="space-y-8 text-center md:text-left">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-magenta/10 rounded-full text-primary-magenta font-medium">
                <Heart className="w-4 h-4" />
                About LifeShare
              </div>
              <h1 className="font-black text-4xl md:text-5xl lg:text-6xl leading-tight">
                Saving Lives,{" "}
                <span className="text-primary-magenta">One Drop</span> at a Time
              </h1>
              <p className="text-lg md:text-xl text-gray-600 leading-relaxed">
                LifeShare is more than just a blood donation platform. We're a
                community of heroes united by a simple belief: that every life
                is precious and worth saving.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                size="lg"
                className="bg-primary-magenta hover:bg-primary-magenta/90 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Droplets className="w-5 h-5 mr-2" />
                Donate Blood Now
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-primary-magenta text-primary-magenta hover:bg-primary-magenta hover:text-white transition-all duration-300"
              >
                Join Our Community
              </Button>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-6 pt-8 border-t border-gray-200">
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-primary-magenta">
                  50K+
                </div>
                <div className="text-sm text-gray-600">Lives Saved</div>
              </div>
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-primary-magenta">
                  15K+
                </div>
                <div className="text-sm text-gray-600">Active Donors</div>
              </div>
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-primary-magenta">
                  200+
                </div>
                <div className="text-sm text-gray-600">Partner Hospitals</div>
              </div>
            </div>
          </div>

          {/* Right Column - Visual Elements */}
          <div className="relative">
            <div className="relative bg-gradient-to-br from-primary-magenta/20 to-red-100 rounded-3xl p-8 h-96">
              {/* Decorative Elements */}
              <div className="absolute top-6 right-6 w-16 h-16 bg-primary-magenta/20 rounded-full flex items-center justify-center">
                <Heart className="w-8 h-8 text-primary-magenta" />
              </div>
              <div className="absolute bottom-6 left-6 w-12 h-12 bg-red-200 rounded-full flex items-center justify-center">
                <Droplets className="w-6 h-6 text-red-600" />
              </div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-white rounded-full shadow-lg flex items-center justify-center">
                <Users className="w-10 h-10 text-primary-magenta" />
              </div>

              {/* Floating Cards */}
              <div className="absolute -top-4 -left-4 bg-white rounded-xl shadow-lg p-4 transform rotate-3">
                <div className="text-sm font-medium text-gray-800">
                  Every 2 seconds
                </div>
                <div className="text-xs text-gray-600">someone needs blood</div>
              </div>
              <div className="absolute -bottom-4 -right-4 bg-white rounded-xl shadow-lg p-4 transform -rotate-3">
                <div className="text-sm font-medium text-gray-800">
                  1 donation = 3 lives
                </div>
                <div className="text-xs text-gray-600">can be saved</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
