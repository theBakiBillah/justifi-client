import React, { useEffect, useRef, useState } from "react";
import { FaEye, FaRocket, FaChevronLeft, FaChevronRight } from "react-icons/fa";

const AboutUs = () => {
  const [currentTestimonialIndex, setCurrentTestimonialIndex] = useState(0);
  const testimonialTrackRef = useRef(null);

  const testimonials = [
    {
      id: 1,
      content:
        "Proesent sapien massa, convellis a pelientesque nec, egesties non nisi. Vestibulum or diam sit amet quem. Excellent service and professional team!",
      name: "Shafin Ahmed",
      location: "Dhaka, Bangladesh",
      image: "src/assets/images/image1.png",
    },
    {
      id: 2,
      content:
        "The legal team provided exceptional guidance throughout our corporate restructuring. Their expertise and attention to detail were impressive.",
      name: "Tahmid Pronoy",
      location: "Dhaka, Bangladesh",
      image: "src/assets/images/image1.png",
    },
    {
      id: 3,
      content:
        "Outstanding litigation support! They handled our complex case with professionalism and achieved excellent results for our company.",
      name: "Arpon Kar",
      location: "Barisal, Bangladesh",
      image: "src/assets/images/image1.png",
    },
    {
      id: 4,
      content:
        "Their intellectual property team protected our patents effectively. Quick response time and thorough understanding of technology law.",
      name: "Maskawat Anid",
      location: "Dhaka, Bangladesh",
      image: "src/assets/images/image1.png",
    },
    {
      id: 5,
      content:
        "Family law matters handled with compassion and expertise. They made a difficult process much easier with their supportive approach.",
      name: "Hridoy Ahmed",
      location: "Noakhali, Bangladesh",
      image: "src/assets/images/image1.png",
    },
  ];

  const teamMembers = [
    {
      id: 1,
      name: "Md. Nahidur Rahman",
      position: "Managing Director",
      description:
        "15+ years specializing in corporate law and international business transactions.",
      image: "src/assets/images/palash.png",
      animationDelay: "0.1s",
    },
    {
      id: 2,
      name: "Md. Naimur Rahman",
      position: "Chief Executive Officer",
      description:
        "Expert in M&A and corporate governance with extensive international experience.",
      image: "src/assets/images/piash.png",
      animationDelay: "0.2s",
    },
    {
      id: 3,
      name: "Mehedi Hasan",
      position: "Chief Operating Officer",
      description:
        "Renowned trial lawyer with exceptional track record in complex commercial litigation.",
      image: "src/assets/images/Mehedi.png",
      animationDelay: "0.3s",
    },
    {
      id: 4,
      name: "Nishat Farjana Arpy",
      position: "Chief Financial Officer",
      description:
        "Leading IP attorney with expertise in patent law and technology licensing.",
      image: "src/assets/images/arpy.png",
      animationDelay: "0.4s",
    },
    {
      id: 5,
      name: "Molla Baki Billah",
      position: "Chief Technology Officer",
      description:
        "Compassionate family law specialist focused on achieving optimal outcomes for families.",
      image: "src/assets/images/baki.png",
      animationDelay: "0.5s",
    },
    {
      id: 6,
      name: "Asif Ahmed Tushar",
      position: "Chief Marketing Officer",
      description:
        "Expert in commercial real estate transactions and property development law.",
      image: "src/assets/images/asif.png",
      animationDelay: "0.6s",
    },
  ];

  const logos = [
    "src/assets/images/logo1.png",
    "src/assets/images/logo2.png",
    "src/assets/images/logo3.png",
    "src/assets/images/logo4.png",
    "src/assets/images/logo5.png",
    "src/assets/images/logo6.png",
  ];

  const getVisibleTestimonialsCount = () => {
    return window.innerWidth < 768 ? 1 : 3;
  };

  const nextTestimonial = () => {
    setCurrentTestimonialIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentTestimonialIndex(
      (prev) => (prev - 1 + testimonials.length) % testimonials.length
    );
  };

  const getCurrentTestimonials = () => {
    const visibleCount = getVisibleTestimonialsCount();
    const currentTestimonials = [];

    for (let i = 0; i < visibleCount; i++) {
      const index = (currentTestimonialIndex + i) % testimonials.length;
      currentTestimonials.push(testimonials[index]);
    }

    return currentTestimonials;
  };

  useEffect(() => {
    // Add scroll-triggered animations
    const observerOptions = {
      threshold: 0.1,
      rootMargin: "0px 0px -50px 0px",
    };

    const observer = new IntersectionObserver(function (entries) {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("animate-fade-in-up");
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    const elementsToAnimate = document.querySelectorAll(".animate-on-scroll");
    elementsToAnimate.forEach((el) => {
      observer.observe(el);
    });

    return () => {
      elementsToAnimate.forEach((el) => observer.unobserve(el));
    };
  }, []);

  return (
    <div className="bg-[#f8f9fa] font-sans text-gray-700">
      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Page Header */}
        <div className="text-center mb-16 animate-fade-in-up">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-[#1e2a45] mb-6">
            About Us
          </h1>

          <p className="text-lg max-w-3xl mx-auto leading-relaxed">
            We created JustiFi making legal help simple and reachable for
            everyone. Through this platform, people can find lawyers, book
            consultations, and get advice online without wasting time or facing
            confusion. Our goal is to make the legal process easier, faster,
            affordable and more trustworthy for all.
          </p>
        </div>

        {/* Vision & Mission Section */}
        <div className="grid md:grid-cols-2 gap-12 mb-20">
          {/* Vision */}
          <div className="bg-white p-8 rounded-lg shadow-sm animate-fade-in-left">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-[#c8a97e] rounded-full flex items-center justify-center mr-4">
                <FaEye className="h-6 w-6 text-white" />
              </div>
              <h2 className="text-2xl font-serif font-bold text-[#1e2a45]">
                Our Vision
              </h2>
            </div>
            <p className="text-gray-600 leading-relaxed">
              To build a trusted digital space where people can get fast and
              fair legal support anytime, anywhere.
            </p>
          </div>

          {/* Mission */}
          <div className="bg-white p-8 rounded-lg shadow-sm animate-fade-in-right">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-[#c8a97e] rounded-full flex items-center justify-center mr-4">
                <FaRocket className="h-6 w-6 text-white" />
              </div>
              <h2 className="text-2xl font-serif font-bold text-[#1e2a45]">
                Our Mission
              </h2>
            </div>
            <p className="text-gray-600 leading-relaxed">
              To make legal help easy, affordable, and quick for everyone in
              Bangladesh through a simple and safe online platform.
            </p>
          </div>
        </div>

        {/* Core Values */}
        <div className="mb-20 animate-fade-in-up">
          <h2 className="text-3xl font-serif font-bold text-[#1e2a45] text-center mb-4">
            What We Believe In
          </h2>
          <div className="w-24 h-1 bg-[#c8a97e] mx-auto mb-8 animate-glow-pulse"></div>
          <div className="bg-white p-8 rounded-lg shadow-sm max-w-4xl mx-auto">
            <p className="text-gray-600 text-lg leading-relaxed text-center">
              Guided by honesty, fairness, and care, we aim to make legal help
              simple, safe, and affordable for everyone. We work to save time
              and cost while building trust and ensuring clear, secure
              communication in every case.
            </p>
          </div>
        </div>

        {/* Our Clients */}
        <div className="mb-20">
          <h2 className="text-3xl font-serif font-bold text-[#1e2a45] text-center mb-4 animate-fade-in-up">
            Our Clients
          </h2>
          <div className="w-24 h-1 bg-[#c8a97e] mx-auto mb-6 animate-glow-pulse"></div>
          <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto animate-fade-in-up">
            We are proud to be associated with leading organizations and
            institutions.
          </p>

          <div className="relative overflow-hidden">
            <div className="flex animate-slide-left-right">
              <div className="flex space-x-8 md:space-x-12">
                {logos.concat(logos).map((logo, index) => (
                  <img
                    key={index}
                    src={logo}
                    alt={`Logo ${index + 1}`}
                    className="w-32 h-16 md:w-40 md:h-20 object-contain"
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Legal Team Section with Better Animations */}
        <div className="mb-20">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-serif font-bold text-[#1e2a45] mb-4 animate-zoom-in-rotate">
              Our Team Mebers
            </h2>
            <div className="w-24 h-1 bg-[#c8a97e] mx-auto mb-6 animate-glow-pulse"></div>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg animate-slide-in-blurred">
              Meet our experienced team members dedicated to providing
              exceptional service and expertise
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {teamMembers.map((member) => (
              <div
                key={member.id}
                className="group relative bg-white rounded-2xl shadow-lg overflow-hidden transition-all duration-700 hover:shadow-2xl hover:translate-y-[-12px] animate-flip-in"
                style={{ animationDelay: member.animationDelay }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-[#1e2a45]/10 to-[#c8a97e]/10 opacity-0 group-hover:opacity-100 transition-all duration-700"></div>
                <div className="absolute -inset-1 bg-gradient-to-r from-[#c8a97e] to-[#1e2a45] rounded-2xl opacity-0 group-hover:opacity-20 blur transition-all duration-1000 group-hover:duration-200"></div>
                <div className="p-8 text-center relative z-10">
                  <div className="relative inline-block mb-6">
                    <div
                      className="w-32 h-32 rounded-full mx-auto flex items-center justify-center shadow-2xl transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 animate-bounce-in overflow-hidden"
                      style={{ animationDelay: member.animationDelay }}
                    >
                      <img
                        src={member.image}
                        alt={member.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                  <h3 className="text-2xl font-serif font-bold text-[#1e2a45] mb-2 group-hover:text-[#c8a97e] transition-all duration-500 transform group-hover:scale-105">
                    {member.name}
                  </h3>
                  <p className="text-[#c8a97e] font-semibold mb-3 transform group-hover:translate-y-1 transition-all duration-500">
                    {member.position}
                  </p>
                  <div className="border-t border-gray-100 pt-4">
                    <p className="text-gray-600 text-sm leading-relaxed transform group-hover:translate-y-1 transition-all duration-500">
                      {member.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Call to Action */}
          <div
            className="text-center mt-16 animate-slide-in-blurred"
            style={{ animationDelay: "1.2s" }}
          >
            <div className="bg-gradient-to-r from-[#1e2a45] to-[#c8a97e] rounded-2xl shadow-2xl p-8 max-w-4xl mx-auto border-0 transform hover:scale-105 transition-transform duration-500">
              <h3 className="text-2xl font-serif font-bold text-white mb-4">
                Ready to Book Our Quick Consultation?
              </h3>
              <p className="text-white/90 mb-6 max-w-2xl mx-auto">
                Contact us today to schedule a consultation with one of our
                experienced legal professionals.
              </p>
              <button className="bg-white hover:bg-[#f8f9fa] text-[#1e2a45] font-bold py-4 px-12 rounded-lg transition-all duration-300 transform hover:scale-110 shadow-2xl hover:shadow-3xl animate-glow-pulse">
                Schedule Consultation
              </button>
            </div>
          </div>
        </div>

        {/* Testimonials */}
        <div>
          <h2 className="text-3xl font-serif font-bold text-[#1e2a45] text-center mb-4 animate-fade-in-up">
            What Our Clients Say
          </h2>
          <div className="w-24 h-1 bg-[#c8a97e] mx-auto mb-6 animate-glow-pulse"></div>
          <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto animate-fade-in-up">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut elit
            tellus, luctus nec ullamcorper mattis, pulvinar dapibus leo.
          </p>

          <div className="relative">
            {/* Testimonial Container */}
            <div className="overflow-hidden">
              <div
                ref={testimonialTrackRef}
                className="transition-transform duration-500 ease-in-out"
              >
                <div className="w-full flex-shrink-0 px-4">
                  <div
                    className={`grid grid-cols-1 ${
                      getVisibleTestimonialsCount() === 3
                        ? "md:grid-cols-3"
                        : "grid-cols-1"
                    } gap-8`}
                  >
                    {getCurrentTestimonials().map((testimonial) => (
                      <div
                        key={testimonial.id}
                        className="bg-white p-6 rounded-lg shadow-sm transition-all duration-300 hover:translate-y-[-3px] hover:shadow-xl h-full"
                      >
                        <p className="text-gray-600 mb-6 leading-relaxed">
                          {testimonial.content}
                        </p>
                        <div className="flex items-center">
                          <div className="w-12 h-12 rounded-full flex items-center justify-center mr-4 overflow-hidden">
                            <img
                              src={testimonial.image}
                              alt={testimonial.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <h4 className="font-bold text-[#1e2a45]">
                              {testimonial.name}
                            </h4>
                            <p className="text-gray-500 text-sm">
                              {testimonial.location}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation Arrows */}
            <button
              onClick={prevTestimonial}
              className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-4 bg-white rounded-full p-3 shadow-lg hover:bg-[#c8a97e] hover:text-white transition-all duration-300"
            >
              <FaChevronLeft className="h-6 w-6" />
            </button>
            <button
              onClick={nextTestimonial}
              className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-4 bg-white rounded-full p-3 shadow-lg hover:bg-[#c8a97e] hover:text-white transition-all duration-300"
            >
              <FaChevronRight className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @import url("https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=Inter:wght@300;400;500;600&display=swap");

        /* Combined Animation Keyframes */
        @keyframes fadeInUp {
          0% {
            opacity: 0;
            transform: translateY(60px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fadeInLeft {
          0% {
            opacity: 0;
            transform: translateX(-60px);
          }
          100% {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes fadeInRight {
          0% {
            opacity: 0;
            transform: translateX(60px);
          }
          100% {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes slideLeftRight {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        @keyframes bounceIn {
          0% {
            opacity: 0;
            transform: scale(0.3);
          }
          50% {
            opacity: 1;
            transform: scale(1.05);
          }
          70% {
            transform: scale(0.9);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }
        @keyframes flipIn {
          0% {
            opacity: 0;
            transform: rotateY(90deg) scale(0.8);
          }
          100% {
            opacity: 1;
            transform: rotateY(0) scale(1);
          }
        }
        @keyframes glowPulse {
          0%,
          100% {
            box-shadow: 0 0 20px rgba(200, 169, 126, 0.3);
          }
          50% {
            box-shadow: 0 0 40px rgba(200, 169, 126, 0.6);
          }
        }
        @keyframes slideInBlurred {
          0% {
            opacity: 0;
            transform: translateY(100px) scale(0.9);
            filter: blur(10px);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
            filter: blur(0);
          }
        }
        @keyframes zoomInRotate {
          0% {
            opacity: 0;
            transform: scale(0.5) rotate(-15deg);
          }
          100% {
            opacity: 1;
            transform: scale(1) rotate(0);
          }
        }

        /* Animation Classes */
        .animate-fade-in-up {
          animation: fadeInUp 0.8s ease-out;
        }
        .animate-fade-in-left {
          animation: fadeInLeft 0.8s ease-out;
        }
        .animate-fade-in-right {
          animation: fadeInRight 0.8s ease-out;
        }
        .animate-slide-left-right {
          animation: slideLeftRight 20s linear infinite;
        }
        .animate-bounce-in {
          animation: bounceIn 1s ease-out;
        }
        .animate-flip-in {
          animation: flipIn 1s ease-out;
        }
        .animate-glow-pulse {
          animation: glowPulse 2s ease-in-out infinite;
        }
        .animate-slide-in-blurred {
          animation: slideInBlurred 1s ease-out;
        }
        .animate-zoom-in-rotate {
          animation: zoomInRotate 1.2s ease-out;
        }
      `}</style>
    </div>
  );
};

export default AboutUs;
