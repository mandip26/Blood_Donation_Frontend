import {
  Facebook,
  Instagram,
  Linkedin,
  Mail,
  MapPin,
  Phone,
  Twitter,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Footer() {
  return (
    <footer className="bg-primary-magenta text-white">
      <div className="container mx-auto max-w-7xl py-12 px-4">
        {/* Newsletter */}
        <div className="bg-white rounded-xl justify-around lg:flex items-center gap-8 p-8 space-y-8 lg:space-y-0 mb-12 text-gray-800">
          <div className="text-lg">
            <p className="font-semibold text-xl">Join To Get Our Newsletter</p>
            <p className="text-gray-500">
              Lorem ipsum dolor sit amet, consectetur adipisicing elit.
            </p>
          </div>
          <div className="relative w-full lg:w-auto lg:flex-1 max-w-2xl">
            <input
              type="text"
              placeholder="Your Email Address"
              className="focus:outline-none py-6 px-6 w-full shadow-xl shadow-primary-magenta/40 placeholder:text-zinc-500 rounded-md"
            />
            <Button className="absolute top-1/2 -translate-y-1/2 right-2 py-2 px-4 mr-4 bg-primary-magenta text-white rounded cursor-pointer">
              Subscribe
            </Button>
          </div>
        </div>

        {/* Main footer content */}
        <div className="flex flex-col md:flex-row gap-10 mb-10">
          {/* Logo and info */}
          <div className="md:w-1/3">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 rounded-full bg-white"></div>
              <span className="font-bold text-xl">LOGO</span>
            </div>
            <p className="text-white/80 mb-6">
              Lorem ipsum dolor sit amet consectetur adipiscing elit augue duis
              vitae pulvinar sem.
            </p>
            <div className="flex gap-4">
              <a
                href="#"
                className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30"
              >
                <Facebook size={16} />
              </a>
              <a
                href="#"
                className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30"
              >
                <Twitter size={16} />
              </a>
              <a
                href="#"
                className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30"
              >
                <Instagram size={16} />
              </a>
              <a
                href="#"
                className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30"
              >
                <Linkedin size={16} />
              </a>
            </div>
          </div>

          {/* Quick links */}
          <div className="md:w-2/3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            <div>
              <h3 className="font-bold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="hover:underline">
                    About Us
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:underline">
                    Donors
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:underline">
                    FAQ
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:underline">
                    Terms & Condition
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold mb-4">Contact Us</h3>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <MapPin size={16} className="flex-shrink-0" />
                  <span>J.P.Rd, Sultanpur, Delhi, India</span>
                </li>
                <li className="flex items-center gap-2">
                  <Phone size={16} className="flex-shrink-0" />
                  <span>+1(234) 567 8910</span>
                </li>
                <li className="flex items-center gap-2">
                  <Mail size={16} className="flex-shrink-0" />
                  <span>hello@email.com</span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold mb-4">Work Hours</h3>
              <p className="mb-2">Mon - Fri: 09:00 AM - 18:00 PM</p>
              <Button className="bg-white text-primary-magenta hover:bg-white/90">
                Call Us
              </Button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
