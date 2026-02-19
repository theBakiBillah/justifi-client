import {
  Calendar,
  CalendarDays,
  CheckCircle2,
  Save,
  Sun,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import useAxiosPublic from "../../../../hooks/useAxiosPublic";
import useUserData from "../../../../hooks/useUserData";
import { useQuery } from "@tanstack/react-query";

const LawyerTimeSlots = () => {
  const [selectedDate, setSelectedDate] = useState("");
  const [timeSlots, setTimeSlots] = useState({});
  const axiosPublic = useAxiosPublic();
  const { currentUser } = useUserData();

  const { data: availabilityData, refetch: refetchAvailability } = useQuery({
    queryKey: ["availability", currentUser?.email],
    queryFn: async () => {
      const res = await axiosPublic.get(`/availability/${currentUser?.email}`);
      return res.data;
    },
    enabled: !!currentUser?.email,
  });

  // Load availability data into state when it's fetched
  useEffect(() => {
    if (availabilityData?.availability) {
      setTimeSlots(availabilityData.availability);
    }
  }, [availabilityData]);

  // Generate next 7 days (FIXED TIMEZONE ISSUE)
  const getNext7Days = () => {
    const dates = [];
    const today = new Date();

    // Reset time part to avoid timezone issues
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);

      // Fix: Create date string manually to avoid timezone shift
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      const formattedDate = `${year}-${month}-${day}`;

      const dayName = date.toLocaleDateString("en-US", { weekday: "short" });
      const monthName = date.toLocaleDateString("en-US", { month: "short" });

      // Check if it's today or tomorrow
      let label = "";
      if (i === 0) label = "Today";
      else if (i === 1) label = "Tomorrow";

      dates.push({
        value: formattedDate,
        dayName,
        date: date.getDate(),
        month: monthName,
        label,
        fullDate: `${dayName}, ${monthName} ${date.getDate()}, ${date.getFullYear()}`,
      });
    }

    return dates;
  };

  const next7Days = getNext7Days();

  // Generate 1-hour time slots from 9:00 to 16:00
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 9; hour < 17; hour++) {
      const startTime = `${hour.toString().padStart(2, "0")}:00`;
      const endTime = `${(hour + 1).toString().padStart(2, "0")}:00`;
      slots.push({
        id: `slot-${hour}`,
        startTime,
        endTime,
        display: `${startTime} - ${endTime}`,
        hour: hour,
      });
    }
    return slots;
  };

  const fixedTimeSlots = generateTimeSlots();

  // Initialize or load saved slots for selected date
  useEffect(() => {
    if (selectedDate) {
      // Check if we already have data for this date in timeSlots state
      if (!timeSlots[selectedDate]) {
        // Initialize all slots as false (unavailable) by default
        const initialSlots = {};
        fixedTimeSlots.forEach((slot) => {
          initialSlots[slot.id] = false; // false = unavailable by default
        });
        setTimeSlots((prev) => ({
          ...prev,
          [selectedDate]: initialSlots,
        }));
      }
    }
  }, [selectedDate, timeSlots]);

  // Toggle slot availability
  const toggleSlotAvailability = (slotId) => {
    setTimeSlots((prev) => ({
      ...prev,
      [selectedDate]: {
        ...prev[selectedDate],
        [slotId]: !prev[selectedDate]?.[slotId], // Toggle between true/false
      },
    }));
  };

  // Check if a slot is available
  const isSlotAvailable = (slotId) => {
    return timeSlots[selectedDate]?.[slotId] ?? false; // Default to false (unavailable)
  };

  // Get available slots count
  const getAvailableSlotsCount = () => {
    if (!selectedDate || !timeSlots[selectedDate]) return 0;
    return Object.values(timeSlots[selectedDate]).filter(
      (value) => value === true, // Count only true values (available)
    ).length;
  };

  // Check if a date has any available slots (for visual indicator)
  const hasAvailableSlots = (dateValue) => {
    if (!timeSlots[dateValue]) return false;
    return Object.values(timeSlots[dateValue]).some(value => value === true);
  };

  // Save slots
  const handleSaveSlots = async () => {
    try {
      const availability = timeSlots;
      console.log("Saving availability:", availability);

      const response = await axiosPublic.patch(
        `/update-availability/${currentUser?.email}`,
        availability,
      );

      if (response.data.success) {
        toast.success("Time slots saved successfully!", {
          position: "top-right",
          autoClose: 5000,
        });
        // Refetch to get the latest data
        refetchAvailability();
      }
    } catch (error) {
      console.error("Error saving slots:", error);
      toast.error("Failed to save time slots. Please try again.", {
        position: "top-right",
        autoClose: 5000,
      });
    }
  };

  // Quick actions
  const markAllAvailable = () => {
    if (!selectedDate) return;

    const allAvailable = {};
    fixedTimeSlots.forEach((slot) => {
      allAvailable[slot.id] = true;
    });

    setTimeSlots((prev) => ({
      ...prev,
      [selectedDate]: allAvailable,
    }));
  };

  const markAllUnavailable = () => {
    if (!selectedDate) return;

    const allUnavailable = {};
    fixedTimeSlots.forEach((slot) => {
      allUnavailable[slot.id] = false;
    });

    setTimeSlots((prev) => ({
      ...prev,
      [selectedDate]: allUnavailable,
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-600 rounded-xl shadow-lg">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-800">
                  Time Slots Management
                </h1>
                <p className="text-sm text-slate-500">
                  Select your available time slots (9:00 AM - 4:00 PM)
                </p>
              </div>
            </div>
            {selectedDate && (
              <button
                onClick={handleSaveSlots}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all shadow-md hover:shadow-lg"
              >
                <Save className="w-4 h-4" />
                Save Changes
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Date Selection Cards */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <label className="block text-sm font-semibold text-slate-700">
              Select Date
            </label>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
            {next7Days.map((date, index) => (
              <button
                key={index}
                onClick={() => setSelectedDate(date.value)}
                className={`p-4 rounded-xl transition-all relative ${
                  selectedDate === date.value
                    ? "bg-blue-600 text-white shadow-lg scale-105 ring-2 ring-blue-300"
                    : "bg-white text-slate-700 hover:shadow-md border border-slate-200"
                }`}
              >
                <div className="text-xs font-medium mb-1">{date.dayName},</div>
                <div className="text-2xl font-bold mb-1">{date.date}</div>
                <div className="text-xs">{date.month}</div>
                {date.label && (
                  <div
                    className={`text-xs mt-2 font-medium ${
                      selectedDate === date.value
                        ? "text-blue-100"
                        : "text-blue-600"
                    }`}
                  >
                    {date.label === "Today" ? "📅" : "📆"} {date.label}
                  </div>
                )}
                {/* Availability indicator dot */}
                {hasAvailableSlots(date.value) && selectedDate !== date.value && (
                  <div className="absolute top-2 right-2 w-2 h-2 bg-green-500 rounded-full"></div>
                )}
              </button>
            ))}
          </div>
        </div>

        {selectedDate ? (
          <>
            {/* Time Slots Grid */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-6 border-b border-slate-200 bg-slate-50/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 rounded-xl">
                      <CalendarDays className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-800">
                        {
                          next7Days.find((d) => d.value === selectedDate)
                            ?.fullDate
                        }
                      </h3>
                      <p className="text-sm text-slate-500">
                        <span className="font-medium text-green-600">
                          {getAvailableSlotsCount()}
                        </span>{" "}
                        of {fixedTimeSlots.length} slots selected as available
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-sm">
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="text-slate-600">Available</span>
                      </div>
                      <div className="flex items-center gap-1 ml-3">
                        <div className="w-3 h-3 bg-red-200 rounded-full"></div>
                        <span className="text-slate-600">Unavailable</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={markAllAvailable}
                        className="text-xs px-3 py-1 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                      >
                        Mark All Available
                      </button>
                      <button
                        onClick={markAllUnavailable}
                        className="text-xs px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                      >
                        Mark All Unavailable
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Sun className="w-5 h-5 text-amber-500" />
                  <span className="text-sm font-medium text-slate-700">
                    Morning Slots (9:00 AM - 12:00 PM)
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
                  {fixedTimeSlots.slice(0, 3).map((slot) => (
                    <button
                      key={slot.id}
                      onClick={() => toggleSlotAvailability(slot.id)}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        isSlotAvailable(slot.id)
                          ? "border-green-500 bg-green-50 hover:bg-green-100"
                          : "border-red-200 bg-red-50/50 hover:bg-red-100/50"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-medium text-slate-800">
                          {slot.startTime} - {slot.endTime}
                        </span>
                        {isSlotAvailable(slot.id) ? (
                          <CheckCircle2 className="w-5 h-5 text-green-600" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-400" />
                        )}
                      </div>
                      <div
                        className={`text-xs mt-2 ${
                          isSlotAvailable(slot.id)
                            ? "text-green-700"
                            : "text-red-500"
                        }`}
                      >
                        {isSlotAvailable(slot.id)
                          ? "Click to mark unavailable"
                          : "Click to mark available"}
                      </div>
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2 mb-4">
                  <span className="text-sm font-medium text-slate-700">
                    Afternoon Slots (12:00 PM - 4:00 PM)
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {fixedTimeSlots.slice(3, 8).map((slot) => (
                    <button
                      key={slot.id}
                      onClick={() => toggleSlotAvailability(slot.id)}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        isSlotAvailable(slot.id)
                          ? "border-green-500 bg-green-50 hover:bg-green-100"
                          : "border-red-200 bg-red-50/50 hover:bg-red-100/50"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-medium text-slate-800">
                          {slot.startTime} - {slot.endTime}
                        </span>
                        {isSlotAvailable(slot.id) ? (
                          <CheckCircle2 className="w-5 h-5 text-green-600" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-400" />
                        )}
                      </div>
                      <div
                        className={`text-xs mt-2 ${
                          isSlotAvailable(slot.id)
                            ? "text-green-700"
                            : "text-red-500"
                        }`}
                      >
                        {isSlotAvailable(slot.id)
                          ? "Click to mark unavailable"
                          : "Click to mark available"}
                      </div>
                    </button>
                  ))}
                </div>

                {/* Summary */}
                <div className="mt-6 p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">Total Slots:</span>
                    <span className="font-medium text-slate-800">
                      {fixedTimeSlots.length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm mt-2">
                    <span className="text-slate-600">Selected Available:</span>
                    <span className="font-medium text-green-600">
                      {getAvailableSlotsCount()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm mt-2">
                    <span className="text-slate-600">Unavailable:</span>
                    <span className="font-medium text-red-500">
                      {fixedTimeSlots.length - getAvailableSlotsCount()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 text-center">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-50 to-purple-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-10 h-10 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-slate-800 mb-2">
              Select a Date to Begin
            </h3>
            <p className="text-slate-500 max-w-md mx-auto">
              Choose a date from the cards above to select your available 1-hour
              time slots from 9:00 AM to 4:00 PM
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LawyerTimeSlots;