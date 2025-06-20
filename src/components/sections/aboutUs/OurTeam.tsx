import { Linkedin, Twitter, Mail, Users } from "lucide-react";

export default function OurTeam() {
  const teamMembers = [
    {
      name: "Mr. Mandip Chowdhury",
      role: "AI/ML Developer",
      bio: "A dedicated AI/ML developer with a passion for healthcare innovation. Mandip is committed to leveraging technology to improve blood donation processes and enhance patient outcomes.",
      image: "assests/images/team/mandip-chowdhury.png",
      social: {
        linkedin: "https://www.linkedin.com/in/mandip-chowdhury",
        twitter: "https://x.com/Mandip2002",
        email: "mandipchowdhury717@gmail.com",
      },
    },
    {
      name: "Ms. Ritika Halder",
      role: "JAVA Full Stack Developer",
      bio: "A passionate full stack developer specializing in Java technologies. Ritika is dedicated to building robust applications that streamline blood donation logistics and enhance user experience.",
      image:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face",
      social: {
        linkedin: "https://www.linkedin.com/in/ritikah15",
        twitter: "#",
        email: "ritikahalder2018@gmail.com",
      },
    },
    {
      name: "Sankhajit Das",
      role: "MERN Full Stack Developer",
      bio: "A skilled MERN stack developer with a focus on creating dynamic web applications. Sankhajit is passionate about using technology to connect donors and recipients effectively.",
      image:
        "https://images.unsplash.com/photo-1494790108755-2616b9ade5db?w=400&h=400&fit=crop&crop=face",
      social: {
        linkedin: "#",
        twitter: "#",
        email: "sankhajitdas3@gmail.com",
      },
    },
    {
      name: "Bal Krishan Choudhary",
      role: "Frontend Developer",
      bio: "A creative frontend developer with a keen eye for design and user experience. Bal Krishan is dedicated to building intuitive interfaces that make blood donation easy and accessible.",
      image:
        "https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=400&h=400&fit=crop&crop=face",
      social: {
        linkedin: "#",
        twitter: "#",
        email: "bikkuchoudhary111@gmail.com",
      },
    },
  ];
  return (
    <section className="py-20 bg-gray-50 w-full flex justify-center">
      <div className="container max-w-6xl px-4 mx-auto">
        {/* Section Header */}
        <div className="text-center space-y-6 mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-magenta/10 rounded-full text-primary-magenta font-medium">
            <Users className="w-4 h-4" />
            Meet Our Team
          </div>
          <h2 className="font-black text-3xl md:text-4xl lg:text-5xl">
            The People Behind{" "}
            <span className="text-primary-magenta">LifeShare</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Our diverse team of medical professionals, technologists, and
            community builders work together to make blood donation accessible
            for everyone.
          </p>
        </div>

        {/* Team Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {teamMembers.map((member, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl p-6 hover:shadow-xl transition-all duration-300 group border border-gray-100"
            >
              {/* Profile Image */}
              <div className="relative mb-6">
                <div className="w-24 h-24 mx-auto rounded-full overflow-hidden border-4 border-primary-magenta/20 group-hover:border-primary-magenta/40 transition-colors duration-300">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
              </div>

              {/* Member Info */}
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-gray-800 mb-1 group-hover:text-primary-magenta transition-colors duration-300">
                  {member.name}
                </h3>
                <p className="text-primary-magenta font-medium mb-3">
                  {member.role}
                </p>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {member.bio}
                </p>
              </div>

              {/* Social Links */}
              <div className="flex justify-center gap-3">
                <a
                  href={member.social.linkedin}
                  className="w-10 h-10 bg-gray-100 hover:bg-blue-500 hover:text-white rounded-full flex items-center justify-center transition-all duration-300 group"
                >
                  <Linkedin className="w-4 h-4" />
                </a>
                <a
                  href={member.social.twitter}
                  className="w-10 h-10 bg-gray-100 hover:bg-blue-400 hover:text-white rounded-full flex items-center justify-center transition-all duration-300 group"
                >
                  <Twitter className="w-4 h-4" />
                </a>
                <a
                  href={`mailto:${member.social.email}`}
                  className="w-10 h-10 bg-gray-100 hover:bg-primary-magenta hover:text-white rounded-full flex items-center justify-center transition-all duration-300 group"
                >
                  <Mail className="w-4 h-4" />
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* Join Our Team Section */}
        <div className="bg-gradient-to-r from-primary-magenta to-red-500 rounded-3xl text-white p-8 md:p-12 text-center">
          <h3 className="text-2xl md:text-3xl font-bold mb-4">
            Want to Join Our Mission?
          </h3>
          <p className="text-white/90 mb-8 max-w-2xl mx-auto">
            We're always looking for passionate individuals who want to make a
            difference in healthcare. Join us in saving lives and building a
            better future.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-8 py-4 bg-white text-primary-magenta hover:bg-gray-100 font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
              View Open Positions
            </button>
            <button className="px-8 py-4 border-2 border-white text-white hover:bg-white hover:text-primary-magenta font-medium rounded-xl transition-all duration-300">
              Send Us Your Resume
            </button>
          </div>
        </div>

        {/* Advisory Board */}
        <div className="mt-16">
          <div className="text-center mb-12">
            <h3 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">
              Advisory Board
            </h3>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Guided by industry leaders and medical experts who share our
              vision of revolutionizing blood donation.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              "Dr. Patricia Williams - Hematology Expert",
              "Robert Thompson - Healthcare Innovation",
              "Dr. Maria Garcia - Public Health Policy",
              "Andrew Lee - Healthcare Technology",
            ].map((advisor, index) => (
              <div
                key={index}
                className="bg-white rounded-xl p-6 text-center hover:shadow-md transition-shadow duration-300"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-primary-magenta/20 to-primary-magenta/30 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <Users className="w-8 h-8 text-primary-magenta" />
                </div>
                <p className="text-sm font-medium text-gray-800">{advisor}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
