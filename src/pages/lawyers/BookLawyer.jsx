import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import {
  FaBriefcase,
  FaCalendarAlt,
  FaCheckCircle,
  FaClock,
  FaFileAlt,
  FaLock,
  FaMoneyBillWave,
  FaPhone,
  FaStar,
  FaUser,
} from "react-icons/fa";
import {
  HiOutlineCalendar,
  HiOutlineClock,
  HiOutlineDocumentText,
  HiShieldCheck,
} from "react-icons/hi";
import { IoAlertCircle, IoChevronForward } from "react-icons/io5";
import { MdAccessTime, MdEmail, MdWork } from "react-icons/md";
import { useLocation, useNavigate } from "react-router";
import { toast } from "react-toastify";
import useAxiosPublic from "../../hooks/useAxiosPublic";
import useUserData from "../../hooks/useUserData";

// Define time slots
const TIME_SLOTS = [
  "09:00-10:00",
  "10:00-11:00",
  "11:00-12:00",
  "12:00-13:00",
  "13:00-14:00",
  "14:00-15:00",
  "15:00-16:00",
  "16:00-17:00",
];

// Map slot IDs to time strings
const slotIdToTime = {
  "slot-9": "09:00-10:00",
  "slot-10": "10:00-11:00",
  "slot-11": "11:00-12:00",
  "slot-12": "12:00-13:00",
  "slot-13": "13:00-14:00",
  "slot-14": "14:00-15:00",
  "slot-15": "15:00-16:00",
  "slot-16": "16:00-17:00",
};

// Map time strings to slot IDs
const timeToSlotId = {
  "09:00-10:00": "slot-9",
  "10:00-11:00": "slot-10",
  "11:00-12:00": "slot-11",
  "12:00-13:00": "slot-12",
  "13:00-14:00": "slot-13",
  "14:00-15:00": "slot-14",
  "15:00-16:00": "slot-15",
  "16:00-17:00": "slot-16",
};

const BookLawyer = () => {
  const axiosPublic = useAxiosPublic();
  const { currentUser } = useUserData();
  const location = useLocation();
  const navigate = useNavigate();
  const lawyer = location.state?.lawyer;

  const [selectedDate, setSelectedDate] = useState("");
  const [selectedSlot, setSelectedSlot] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeStep, setActiveStep] = useState(1);
  const [availableDates, setAvailableDates] = useState([]);
  const [availableSlotsForDate, setAvailableSlotsForDate] = useState({});

  const { data: availabilityData, isLoading: availabilityLoading } = useQuery({
    queryKey: ["availabilityData", lawyer?.email],
    queryFn: async () => {
      if (!lawyer?.email) return null;
      const res = await axiosPublic.get(`/availability/${lawyer.email}`);
      return res.data;
    },
    enabled: !!lawyer?.email,
  });

  console.log("Availability Data:", availabilityData);

  // Process availability data when it's loaded
  useEffect(() => {
    if (availabilityData?.availability) {
      // Get all dates that have at least one available slot
      const dates = Object.keys(availabilityData.availability).filter(
        (date) => {
          const slots = availabilityData.availability[date];
          return Object.values(slots).some((value) => value === true);
        },
      );
      setAvailableDates(dates);

      // Create a map of date -> available time slots
      const slotsMap = {};
      Object.entries(availabilityData.availability).forEach(([date, slots]) => {
        // Get all slots where value is true (available)
        const availableSlotIds = Object.entries(slots)
          .filter(([_, isAvailable]) => isAvailable === true)
          .map(([slotId, _]) => slotIdToTime[slotId]);
        slotsMap[date] = availableSlotIds;
      });
      setAvailableSlotsForDate(slotsMap);
      console.log("Processed Available Slots:", slotsMap);
    }
  }, [availabilityData]);

  const STEPS = [
    { number: 1, label: "Select Date & Time", icon: FaCalendarAlt },
    { number: 2, label: "Your Information", icon: FaUser },
    { number: 3, label: "Case Details", icon: FaFileAlt },
  ];

  const generateDates = () => {
    const dates = [];
    const today = new Date();

    for (let i = 0; i < 8; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);

      const dateString = date.toISOString().split("T")[0];

      dates.push({
        dateString: dateString,
        displayDate: date.toLocaleDateString("en-US", {
          weekday: "short",
          month: "short",
          day: "numeric",
        }),
        fullDate: date.toLocaleDateString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
        isToday: i === 0,
        isTomorrow: i === 1,
        hasAvailability: availableDates.includes(dateString),
      });
    }
    return dates;
  };

  const dates = generateDates();

  const { data: bookingData = [], refetch } = useQuery({
    queryKey: ["bookingData"],
    queryFn: async () => {
      const res = await axiosPublic.get("/bookings");
      return res.data;
    },
  });

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm();

  const getBookedSlots = (date) => {
    if (!lawyer) return [];

    return bookingData
      .filter(
        (booking) =>
          booking.lawyer?.email === lawyer.email &&
          booking.booking?.preferredDate === date &&
          booking.status !== "cancelled",
      )
      .map((booking) => booking.booking?.preferredTime)
      .filter(Boolean);
  };

  const isSlotAvailable = (date, slot) => {
    if (!lawyer) return false;

    // Check if the lawyer has marked this slot as available in their availability
    const lawyerAvailableSlots = availableSlotsForDate[date] || [];
    if (!lawyerAvailableSlots.includes(slot)) {
      return false;
    }

    // Check if it's already booked
    const bookedSlots = getBookedSlots(date);
    return !bookedSlots.includes(slot);
  };

  const getAvailableSlotsCount = (date) => {
    if (!availableSlotsForDate[date]) return 0;
    const bookedSlots = getBookedSlots(date);
    return availableSlotsForDate[date].filter(
      (slot) => !bookedSlots.includes(slot),
    ).length;
  };

  const onSubmit = async (data) => {
    if (!selectedDate || !selectedSlot || !lawyer) {
      toast.error("Please select date and time slot");
      return;
    }

    setIsSubmitting(true);

    const bookingInfo = {
      user: {
        name: currentUser?.name || "User",
        email: currentUser?.email,
        phone: data.phone,
        img:
          currentUser?.photo ||
          "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&crop=face",
      },
      booking: {
        problemDescription: data.problemDescription,
        preferredDate: selectedDate,
        preferredTime: selectedSlot,
        caseType: data.caseType || "General Consultation",
      },
      lawyer: {
        name: lawyer.name,
        email: lawyer.email,
        specialization: lawyer.specialization,
        img: lawyer.image,
        experience: lawyer.experience,
        successRate: lawyer.successRate,
      },
      status: "pending",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      const res = await axiosPublic.post("/bookings", bookingInfo);
      console.log(bookingInfo);
      console.log(res.data.url);
      if (res.data.url) {
        window.location.replace(res.data.url);
      } else {
        toast.error("Failed to initiate payment session");
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error("Payment initialization error:", error);
      toast.error("Payment initialization failed");
      setIsSubmitting(false);
    }
  };

  const StepIndicator = ({ step, isActive, isCompleted }) => (
    <div
      className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-300 ${
        isActive || isCompleted ? "bg-blue-50 text-blue-600" : "text-gray-400"
      }`}
    >
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
          isCompleted
            ? "border-green-500 bg-green-500 text-white"
            : isActive
              ? "border-blue-600 bg-blue-600 text-white"
              : "border-gray-300"
        }`}
      >
        {isCompleted ? (
          <FaCheckCircle className="w-4 h-4" />
        ) : (
          <step.icon className="w-4 h-4" />
        )}
      </div>
      <span className="font-medium text-sm hidden sm:block">{step.label}</span>
    </div>
  );

  const DateButton = ({ dateObj }) => {
    const isSelected = selectedDate === dateObj.dateString;
    const availableCount = getAvailableSlotsCount(dateObj.dateString);
    const hasAvailability = availableCount > 0;

    return (
      <button
        type="button"
        onClick={() => {
          if (hasAvailability) {
            setSelectedDate(dateObj.dateString);
            setSelectedSlot("");
            setActiveStep(2);
          }
        }}
        disabled={!hasAvailability || availabilityLoading}
        className={`p-4 rounded-xl border-2 text-center transition-all duration-300 group relative ${
          isSelected
            ? "border-blue-500 bg-blue-50 shadow-md scale-105"
            : hasAvailability
              ? "border-gray-200 hover:border-blue-300 hover:bg-blue-25 hover:shadow-sm cursor-pointer"
              : "border-gray-200 bg-gray-50 cursor-not-allowed opacity-60"
        } ${dateObj.isToday ? "ring-2 ring-blue-200" : ""}`}
      >
        <div
          className={`text-sm font-medium mb-1 ${
            isSelected ? "text-blue-600" : "text-gray-600"
          }`}
        >
          {dateObj.displayDate.split(" ")[0]}
        </div>
        <div
          className={`text-lg font-semibold ${
            isSelected ? "text-blue-700" : "text-gray-900"
          }`}
        >
          {dateObj.displayDate.split(" ").slice(1).join(" ")}
        </div>

        {hasAvailability ? (
          <div className="text-xs text-green-600 mt-2 font-medium flex items-center justify-center gap-1">
            <FaCheckCircle className="text-xs" />
            {availableCount} slot{availableCount > 1 ? "s" : ""} available
          </div>
        ) : (
          <div className="text-xs text-gray-400 mt-2 font-medium">
            No slots available
          </div>
        )}

        {dateObj.isToday && (
          <div className="text-xs text-blue-500 mt-1 font-medium flex items-center justify-center gap-1">
            <FaCheckCircle className="text-xs" />
            Today
          </div>
        )}
        {dateObj.isTomorrow && (
          <div className="text-xs text-purple-500 mt-1 font-medium flex items-center justify-center gap-1">
            <IoChevronForward className="text-xs" />
            Tomorrow
          </div>
        )}

        {hasAvailability && !isSelected && (
          <div className="absolute top-2 right-2 w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
        )}
      </button>
    );
  };

  const TimeSlotButton = ({ slot, date }) => {
    const isAvailable = isSlotAvailable(date, slot);
    const isSelected = selectedSlot === slot;

    return (
      <button
        type="button"
        onClick={() => {
          if (isAvailable) {
            setSelectedSlot(slot);
            setActiveStep(3);
          }
        }}
        disabled={!isAvailable}
        className={`p-3 rounded-xl border-2 text-center transition-all duration-300 group ${
          isSelected
            ? "border-green-500 bg-green-50 shadow-md scale-105"
            : isAvailable
              ? "border-gray-200 hover:border-green-300 hover:bg-green-25 hover:shadow-sm cursor-pointer"
              : "border-red-200 bg-red-50 cursor-not-allowed"
        }`}
      >
        <div
          className={`font-semibold text-sm ${
            isSelected
              ? "text-green-600"
              : isAvailable
                ? "text-gray-900"
                : "text-gray-400"
          }`}
        >
          {slot}
        </div>
        <div
          className={`text-xs mt-1 flex items-center justify-center gap-1 ${
            isSelected
              ? "text-green-500"
              : isAvailable
                ? "text-gray-500"
                : "text-red-500"
          }`}
        >
          {isAvailable ? (
            <>
              <FaCheckCircle className="text-xs" />
              Available
            </>
          ) : (
            <>
              <IoAlertCircle className="text-xs" />
              {availableSlotsForDate[date]?.includes(slot)
                ? "Booked"
                : "Not Available"}
            </>
          )}
        </div>
      </button>
    );
  };

  // Show loading state
  if (availabilityLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading availability...</p>
        </div>
      </div>
    );
  }

  return (
    <section className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-6 py-3 rounded-full shadow-sm mb-6">
            <HiShieldCheck className="w-5 h-5 text-green-600" />
            <span className="text-sm font-medium text-gray-600">
              Secure Booking
            </span>
          </div>
          <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Book Your Consultation
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Schedule an appointment with{" "}
            <span className="font-bold text-green-700">{lawyer?.name}</span>,
            specializing in{" "}
            <span className="font-bold text-blue-800">
              {Array.isArray(lawyer?.specialization)
                ? lawyer?.specialization.join(", ")
                : lawyer?.specialization}
            </span>
          </p>
        </div>

        <div className="flex justify-center mb-12">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-2 shadow-sm border border-white/20">
            <div className="flex items-center gap-4">
              {STEPS.map((step, index) => (
                <div key={step.number} className="flex items-center gap-4">
                  <StepIndicator
                    step={step}
                    isActive={activeStep === step.number}
                    isCompleted={activeStep > step.number}
                  />
                  {index < STEPS.length - 1 && (
                    <div
                      className={`w-12 h-0.5 rounded-full transition-all duration-300 ${
                        activeStep > step.number ? "bg-blue-600" : "bg-gray-200"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-6">
              <div className="bg-white rounded-2xl shadow-xl border border-white/20 overflow-hidden">
                <div className="relative h-32 bg-gradient-to-r from-blue-600 to-purple-600">
                  <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2">
                    <img
                      src={lawyer?.image}
                      alt={lawyer?.name}
                      className="w-24 h-24 rounded-2xl object-cover border-4 border-white shadow-xl"
                    />
                  </div>
                </div>
                <div className="pt-16 pb-6 px-6 text-center">
                  <h2 className="text-2xl font-bold text-gray-900 mb-1">
                    {lawyer?.name}
                  </h2>
                  <p className="text-blue-600 font-semibold mb-4">
                    {Array.isArray(lawyer?.specialization)
                      ? lawyer?.specialization.join(", ")
                      : lawyer?.specialization}
                  </p>

                  <div className="flex items-center justify-center gap-1 mb-4">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <FaStar
                        key={star}
                        className={`text-sm ${
                          star <= Math.floor(lawyer?.rating || 0)
                            ? "text-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                    <span className="text-sm text-gray-600 ml-2">
                      {lawyer?.rating || "5.0"}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {lawyer?.experience || "5"}+
                      </div>
                      <div className="text-xs text-gray-600 flex items-center justify-center gap-1">
                        <MdAccessTime className="text-xs" />
                        Years Exp.
                      </div>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {lawyer?.successRate || "95"}%
                      </div>
                      <div className="text-xs text-gray-600">Success Rate</div>
                    </div>
                  </div>

                  <div className="space-y-3 text-sm text-gray-600">
                    <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                      <span className="flex items-center gap-2">
                        <FaMoneyBillWave />
                        Consultation Fee:
                      </span>
                      <span className="font-semibold text-gray-900">
                        ৳{lawyer?.fee || "4500"}/hour
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                      <span className="flex items-center gap-2">
                        <MdWork />
                        Cases Handled:
                      </span>
                      <span className="font-semibold text-gray-900">
                        {lawyer?.casesHandled || "100"}+
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-4 border border-green-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <FaLock className="text-green-600 text-lg" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-green-900">
                      Secure & Confidential
                    </h4>
                    <p className="text-green-700 text-sm">
                      Your information is protected by attorney-client privilege
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-xl border border-white/20 overflow-hidden">
              <div className="p-8">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                  <div>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <FaCalendarAlt className="text-lg text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900">
                          Select Date & Time
                        </h3>
                        <p className="text-gray-600">
                          Choose your preferred consultation slot
                        </p>
                      </div>
                    </div>

                    <div className="mb-8">
                      <h4 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
                        <HiOutlineCalendar className="text-lg" />
                        Select Date
                      </h4>
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                        {dates.map((dateObj) => (
                          <DateButton
                            key={dateObj.dateString}
                            dateObj={dateObj}
                          />
                        ))}
                      </div>
                    </div>

                    {selectedDate && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
                          <HiOutlineClock className="text-lg" />
                          Available Time Slots for{" "}
                          {
                            dates.find((d) => d.dateString === selectedDate)
                              ?.fullDate
                          }
                        </h4>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                          {TIME_SLOTS.map((slot) => (
                            <TimeSlotButton
                              key={slot}
                              slot={slot}
                              date={selectedDate}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {selectedDate && selectedSlot && (
                    <div className="space-y-8">
                      <div>
                        <div className="flex items-center gap-3 mb-6">
                          <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                            <FaUser className="text-lg text-purple-600" />
                          </div>
                          <div>
                            <h3 className="text-xl font-semibold text-gray-900">
                              Your Information
                            </h3>
                            <p className="text-gray-600">
                              We'll use this to contact you
                            </p>
                          </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                          <div>
                            <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                              <FaUser className="text-gray-400" />
                              Full Name
                            </label>
                            <div className="relative">
                              <input
                                type="text"
                                value={currentUser?.name || "User"}
                                disabled
                                className="w-full px-4 py-3 pl-11 border border-gray-200 rounded-xl bg-gray-50 text-gray-600 focus:outline-none"
                              />
                              <FaUser className="text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                            </div>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                              <MdEmail className="text-gray-400" />
                              Email Address
                            </label>
                            <div className="relative">
                              <input
                                type="email"
                                value={currentUser?.email || "Not logged in"}
                                disabled
                                className="w-full px-4 py-3 pl-11 border border-gray-200 rounded-xl bg-gray-50 text-gray-600 focus:outline-none"
                              />
                              <MdEmail className="text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                            </div>
                          </div>
                        </div>

                        <div className="mt-6">
                          <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                            <FaPhone className="text-gray-400" />
                            Phone Number *
                          </label>
                          <div className="relative">
                            <input
                              type="tel"
                              {...register("phone", {
                                required: "Phone number is required",
                                pattern: {
                                  value: /^[0-9+\-\s()]{10,}$/,
                                  message: "Please enter a valid phone number",
                                },
                              })}
                              className="w-full px-4 py-3 pl-11 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="Enter your phone number"
                            />
                            <FaPhone className="text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                          </div>
                          {errors.phone && (
                            <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                              <IoAlertCircle />
                              {errors.phone.message}
                            </p>
                          )}
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center gap-3 mb-6">
                          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                            <FaFileAlt className="text-lg text-green-600" />
                          </div>
                          <div>
                            <h3 className="text-xl font-semibold text-gray-900">
                              Case Details
                            </h3>
                            <p className="text-gray-600">
                              Tell us about your legal matter
                            </p>
                          </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                          <div>
                            <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                              <FaBriefcase className="text-gray-400" />
                              Case Type
                            </label>
                            <select
                              {...register("caseType")}
                              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                              <option value="" selected disabled>
                                Select Case Type
                              </option>
                              {(Array.isArray(lawyer?.specialization)
                                ? lawyer?.specialization
                                : [lawyer?.specialization]
                              ).map((specialization) => (
                                <option
                                  key={specialization}
                                  value={specialization}
                                >
                                  {specialization}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div className="flex items-end">
                            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 w-full">
                              <div className="flex items-center gap-2 text-blue-800 font-medium mb-1">
                                <FaLock className="text-lg" />
                                Confidential
                              </div>
                              <div className="text-xs text-blue-600">
                                Your information is protected by attorney-client
                                privilege
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="mt-6">
                          <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                            <HiOutlineDocumentText className="text-lg" />
                            Problem Description *
                          </label>
                          <textarea
                            {...register("problemDescription", {
                              required: "Problem description is required",
                              minLength: {
                                value: 20,
                                message:
                                  "Description must be at least 20 characters",
                              },
                              maxLength: {
                                value: 1000,
                                message:
                                  "Description must be less than 1000 characters",
                              },
                            })}
                            rows={6}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Please describe your legal issue in detail. Include relevant dates, parties involved, and what you hope to achieve from this consultation..."
                          />
                          {errors.problemDescription && (
                            <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                              <IoAlertCircle />
                              {errors.problemDescription.message}
                            </p>
                          )}
                          <div className="text-xs text-gray-500 mt-2 flex justify-between">
                            <span>
                              {watch("problemDescription")?.length || 0}
                              /1000 characters
                            </span>
                            <span className="flex items-center gap-1">
                              <FaLock className="text-xs" />
                              Encrypted and secure
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-200">
                        <h4 className="font-semibold text-gray-900 mb-4 text-lg flex items-center gap-2">
                          <FaCheckCircle className="text-green-600" />
                          Appointment Summary
                        </h4>
                        <div className="grid md:grid-cols-3 gap-4 text-sm">
                          <div className="bg-white rounded-lg p-4 shadow-sm">
                            <div className="text-gray-600 flex items-center gap-2 mb-1">
                              <FaCalendarAlt className="text-blue-500" />
                              Date
                            </div>
                            <div className="font-semibold text-gray-900">
                              {
                                dates.find((d) => d.dateString === selectedDate)
                                  ?.fullDate
                              }
                            </div>
                          </div>
                          <div className="bg-white rounded-lg p-4 shadow-sm">
                            <div className="text-gray-600 flex items-center gap-2 mb-1">
                              <FaClock className="text-green-500" />
                              Time
                            </div>
                            <div className="font-semibold text-gray-900">
                              {selectedSlot}
                            </div>
                          </div>
                          <div className="bg-white rounded-lg p-4 shadow-sm">
                            <div className="text-gray-600 flex items-center gap-2 mb-1">
                              <FaUser className="text-purple-500" />
                              Lawyer
                            </div>
                            <div className="font-semibold text-gray-900">
                              {lawyer?.name}
                            </div>
                          </div>
                        </div>
                        <div className="mt-4 pt-4 border-t border-blue-200">
                          <div className="flex items-center justify-between text-lg font-bold text-gray-900">
                            <span>Total Fee</span>
                            <span className="flex items-center gap-2">
                              <FaMoneyBillWave className="text-green-600" />৳
                              {lawyer?.fee || "4500"}
                            </span>
                          </div>
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-6 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                      >
                        {isSubmitting ? (
                          <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                            Processing Payment...
                          </>
                        ) : (
                          <>
                            <FaCheckCircle className="text-lg" />
                            Confirm Booking - ৳{lawyer?.fee || "4500"}
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BookLawyer;
