import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import {
    FaCalendarAlt,
    FaCalendarCheck,
    FaCheckCircle,
    FaClock,
    FaCommentAlt,
    FaEnvelope,
    FaEye,
    FaFileAlt,
    FaFilter,
    FaHourglassHalf,
    FaLink,
    FaPhone,
    FaSearch,
    FaStar,
    FaThumbsDown,
    FaThumbsUp,
    FaTimesCircle,
    FaUser,
} from "react-icons/fa";
import { HiOutlineClipboardCheck, HiOutlineUserGroup } from "react-icons/hi";
import { MdOutlineCancel, MdPendingActions } from "react-icons/md";
import { toast } from "react-toastify";
import Loading from "../../../common/loading/Loading";
import useAxiosSecure from "../../../hooks/useAxiosSecure";
import useUserData from "../../../hooks/useUserData";
import StatCard from "../components/StatCard";

const LawyerAppointments = () => {
    const { currentUser } = useUserData();
    const axiosSecure = useAxiosSecure();
    const [selectedStatus, setSelectedStatus] = useState("all");
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [meetingLink, setMeetingLink] = useState("");
    const [cancellationNote, setCancellationNote] = useState("");
    const [processingAction, setProcessingAction] = useState(false);

    const {
        data: myAppointments = [],
        isLoading,
        refetch,
    } = useQuery({
        queryKey: ["myAppointments", currentUser?.email],
        queryFn: async () => {
            const res = await axiosSecure.get(
                `/myAppointments?email=${currentUser?.email}`
            );
            return res.data || [];
        },
        enabled: !!currentUser?.email,
    });

    const filteredAppointments = myAppointments.filter((appointment) => {
        const matchesStatus =
            selectedStatus === "all" || appointment.status === selectedStatus;
        const matchesSearch =
            appointment.user.name
                .toLowerCase()
                .includes(searchTerm.toLowerCase()) ||
            appointment.booking.caseType
                .toLowerCase()
                .includes(searchTerm.toLowerCase());
        return matchesStatus && matchesSearch;
    });

    const openConfirmModal = (appointment) => {
        setSelectedAppointment(appointment);
        setMeetingLink("");
        setShowConfirmModal(true);
    };

    const openCancelModal = (appointment) => {
        setSelectedAppointment(appointment);
        setCancellationNote("");
        setShowCancelModal(true);
    };

    const updateAppointmentStatus = async (newStatus, additionalData = {}) => {
        if (!selectedAppointment) return;
        setProcessingAction(true);
        try {
            const updateData = {
                status: newStatus,
                updatedAt: new Date().toISOString(),
                ...additionalData,
            };
            const res = await axiosSecure.patch(
                `/appointments/${selectedAppointment._id}`,
                updateData
            );
            if (res.data.success) {
                toast.success(`Appointment ${newStatus} successfully!`);
                refetch();
                closeAllModals();
            } else {
                toast.error("Failed to update appointment status");
                console.error("Update failed:", res.data);
            }
        } catch (error) {
            toast.error("Failed to update appointment status");
            console.error("Update error:", error);
        } finally {
            setProcessingAction(false);
        }
    };

    const handleConfirmAppointment = () => {
        if (!meetingLink.trim()) {
            toast.error("Please provide a meeting link");
            return;
        }
        if (!meetingLink.startsWith("http://") && !meetingLink.startsWith("https://")) {
            toast.error("Please enter a valid meeting link starting with http:// or https://");
            return;
        }
        updateAppointmentStatus("confirmed", {
            meetingLink: meetingLink.trim(),
            booking: { ...selectedAppointment.booking, meetingLink: meetingLink.trim() },
        });
    };

    const handleCancelAppointment = () => {
        if (!cancellationNote.trim()) {
            toast.error("Please provide a cancellation reason");
            return;
        }
        updateAppointmentStatus("cancelled", {
            cancellationNote: cancellationNote.trim(),
            booking: { ...selectedAppointment.booking, cancellationNote: cancellationNote.trim() },
        });
    };

    const handleCompleteAppointment = (appointmentId) => {
        setSelectedAppointment(myAppointments.find((app) => app._id === appointmentId));
        updateAppointmentStatus("completed");
    };

    const closeAllModals = () => {
        setShowDetailsModal(false);
        setShowConfirmModal(false);
        setShowCancelModal(false);
        setSelectedAppointment(null);
        setMeetingLink("");
        setCancellationNote("");
    };

    const getStatusInfo = (status) => {
        const statusConfig = {
            confirmed: { color: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: FaCheckCircle,           gradient: "from-emerald-500 to-green-500" },
            pending:   { color: "bg-amber-50 text-amber-700 border-amber-200",       icon: FaHourglassHalf,         gradient: "from-amber-500 to-orange-500" },
            cancelled: { color: "bg-red-50 text-red-700 border-red-200",             icon: FaTimesCircle,           gradient: "from-red-500 to-pink-500" },
            completed: { color: "bg-blue-50 text-blue-700 border-blue-200",          icon: HiOutlineClipboardCheck, gradient: "from-blue-500 to-cyan-500" },
        };
        return statusConfig[status] || { color: "bg-gray-50 text-gray-700 border-gray-200", icon: MdPendingActions, gradient: "from-gray-500 to-gray-600" };
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            weekday: "long", year: "numeric", month: "long", day: "numeric",
        });
    };

    const openAppointmentDetails = (appointment) => {
        setSelectedAppointment(appointment);
        setShowDetailsModal(true);
    };

    if (isLoading) return <Loading />;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 py-8">
            <div className="max-w-7xl mx-auto px-4">
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-6 py-3 rounded-full shadow-sm mb-6">
                        <FaCalendarCheck className="w-5 h-5 text-blue-600" />
                        <span className="text-sm font-medium text-gray-600">Lawyer Dashboard</span>
                    </div>
                    <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        My Appointments
                    </h1>
                    <p className="text-gray-600 max-w-2xl mx-auto text-lg">
                        Manage your client consultations and schedule with professional efficiency
                    </p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-2 mb-12">
                    <StatCard icon={HiOutlineUserGroup}      label="Total"          value={myAppointments.length}                                               color="text-gray-900"    gradient="from-blue-500 to-purple-600" />
                    <StatCard icon={FaHourglassHalf}         label="Pending Review" value={myAppointments.filter((a) => a.status === "pending").length}         color="text-amber-600"   gradient="from-amber-500 to-orange-500" />
                    <StatCard icon={FaCheckCircle}           label="Confirmed"      value={myAppointments.filter((a) => a.status === "confirmed").length}        color="text-emerald-600" gradient="from-emerald-500 to-green-500" />
                    <StatCard icon={HiOutlineClipboardCheck} label="Completed"      value={myAppointments.filter((a) => a.status === "completed").length}        color="text-blue-600"    gradient="from-blue-500 to-cyan-500" />
                    <StatCard icon={FaTimesCircle}           label="Cancelled"      value={myAppointments.filter((a) => a.status === "cancelled").length}        color="text-red-600"     gradient="from-red-500 to-pink-500" />
                </div>

                {/* Filters */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 mb-8">
                    <div className="flex flex-col lg:flex-row gap-6 justify-between items-center">
                        <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                                    <FaFilter className="text-blue-600" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Status</label>
                                    <select
                                        value={selectedStatus}
                                        onChange={(e) => setSelectedStatus(e.target.value)}
                                        className="border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm"
                                    >
                                        <option value="all">All Appointments</option>
                                        <option value="pending">Pending Review</option>
                                        <option value="confirmed">Confirmed</option>
                                        <option value="completed">Completed</option>
                                        <option value="cancelled">Cancelled</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="w-full lg:w-auto">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Search Appointments</label>
                            <div className="relative">
                                <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search by client name or case type..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full lg:w-80 bg-white shadow-sm"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Appointments */}
                <div className="space-y-6">
                    {filteredAppointments.length === 0 ? (
                        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-16 text-center shadow-lg border border-white/20">
                            <div className="w-24 h-24 bg-gradient-to-r from-blue-100 to-purple-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
                                <FaCalendarAlt className="text-4xl text-blue-500" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-3">No Appointments Found</h3>
                            <p className="text-gray-600 text-lg max-w-md mx-auto">
                                {selectedStatus !== "all" || searchTerm
                                    ? "No appointments match your current search criteria. Try adjusting your filters."
                                    : "You're all caught up! New appointment requests will appear here."}
                            </p>
                        </div>
                    ) : (
                        filteredAppointments.map((appointment) => {
                            const statusInfo = getStatusInfo(appointment.status);
                            const StatusIcon = statusInfo.icon;
                            const feedback = appointment.feedback;

                            return (
                                <div
                                    key={appointment._id}
                                    className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 overflow-hidden hover:shadow-xl transition-all duration-300"
                                >
                                    <div className="p-8">
                                        <div className="flex flex-col xl:flex-row xl:items-start xl:justify-between gap-6">

                                            {/* ── Original left block (unchanged) ── */}
                                            <div className="flex items-start gap-6 flex-1">
                                                <div className="relative">
                                                    <img
                                                        src={appointment.user.img}
                                                        alt={appointment.user.name}
                                                        className="w-20 h-20 rounded-2xl object-cover border-4 border-white shadow-lg"
                                                    />
                                                    <div className={`absolute -top-2 -right-2 px-3 py-1 rounded-full text-xs font-semibold border ${statusInfo.color} flex items-center gap-1 shadow-sm`}>
                                                        <StatusIcon className="text-xs" />
                                                        {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                                                    </div>
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-start justify-between mb-4">
                                                        <div>
                                                            <h3 className="text-2xl font-bold text-gray-900 mb-1">
                                                                {appointment.user.name}
                                                            </h3>
                                                            <p className="text-blue-600 font-semibold">
                                                                {appointment.booking.caseType}
                                                            </p>
                                                        </div>
                                                        <button
                                                            onClick={() => openAppointmentDetails(appointment)}
                                                            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors cursor-pointer"
                                                        >
                                                            <FaEye className="text-sm" />
                                                            <span className="text-sm font-medium">View Details</span>
                                                        </button>
                                                    </div>

                                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                                                        <div className="flex items-center gap-3 text-gray-600 bg-gray-50/50 rounded-xl p-3">
                                                            <FaPhone className="text-blue-500 text-lg" />
                                                            <span className="font-medium">{appointment.user.phone}</span>
                                                        </div>
                                                        <div className="flex items-center gap-3 text-gray-600 bg-gray-50/50 rounded-xl p-3">
                                                            <FaEnvelope className="text-purple-500 text-lg" />
                                                            <span className="font-medium">{appointment.user.email}</span>
                                                        </div>
                                                        <div className="flex items-center gap-3 text-gray-600 bg-gray-50/50 rounded-xl p-3">
                                                            <FaFileAlt className="text-green-500 text-lg" />
                                                            <span className="font-medium">{appointment.booking.caseType}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* ── Original right block: date/time + feedback below ── */}
                                            <div className="xl:text-right xl:min-w-[200px]">
                                                <div className="space-y-3 mb-4">
                                                    <div className="flex xl:justify-end items-center gap-3 text-gray-700">
                                                        <FaCalendarAlt className="text-blue-500 text-lg" />
                                                        <span className="font-semibold">
                                                            {formatDate(appointment.booking.preferredDate)}
                                                        </span>
                                                    </div>
                                                    <div className="flex xl:justify-end items-center gap-3 text-gray-700">
                                                        <FaClock className="text-green-500 text-lg" />
                                                        <span className="font-semibold">
                                                            {appointment.booking.preferredTime}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Feedback panel — below date/time, same right column */}
                                                {feedback ? (
                                                    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border border-indigo-100 p-4 text-left">
                                                        <p className="text-xs font-bold text-indigo-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                                            <FaCommentAlt className="text-xs" /> Client Feedback
                                                        </p>
                                                        {/* Stars */}
                                                        <div className="flex items-center gap-0.5 mb-2">
                                                            {[1, 2, 3, 4, 5].map((s) => (
                                                                <FaStar
                                                                    key={s}
                                                                    className={`text-base ${s <= feedback.rating ? "text-amber-400" : "text-gray-200"}`}
                                                                />
                                                            ))}
                                                            <span className="ml-1 text-xs font-bold text-gray-600">{feedback.rating}/5</span>
                                                        </div>
                                                        {/* Recommend */}
                                                        <div className="mb-2">
                                                            {feedback.recommend ? (
                                                                <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-200">
                                                                    <FaThumbsUp className="text-xs" /> Recommends
                                                                </span>
                                                            ) : (
                                                                <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-600 bg-red-50 px-2 py-0.5 rounded-full border border-red-200">
                                                                    <FaThumbsDown className="text-xs" /> Doesn't recommend
                                                                </span>
                                                            )}
                                                        </div>
                                                        {/* Tags */}
                                                        {feedback.qualities?.length > 0 && (
                                                            <div className="flex flex-wrap gap-1 mb-1.5">
                                                                {feedback.qualities.map((q) => (
                                                                    <span key={q} className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full">
                                                                        {q}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        )}
                                                        {feedback.improvements?.length > 0 && (
                                                            <div className="flex flex-wrap gap-1">
                                                                {feedback.improvements.map((imp) => (
                                                                    <span key={imp} className="text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full">
                                                                        {imp}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                ) : (
                                                    appointment.status === "completed" && (
                                                        <div className="bg-gray-50 rounded-xl border border-dashed border-gray-200 p-3 text-center">
                                                            <FaStar className="text-2xl text-gray-200 mx-auto mb-1" />
                                                            <p className="text-xs text-gray-400">No feedback yet</p>
                                                        </div>
                                                    )
                                                )}
                                            </div>
                                        </div>

                                        {/* Action Buttons — original unchanged */}
                                        <div className="mt-6 flex flex-wrap gap-3">
                                            {appointment.status === "pending" && (
                                                <>
                                                    <button
                                                        onClick={() => openConfirmModal(appointment)}
                                                        className="bg-gradient-to-r from-emerald-500 to-green-600 text-white px-8 py-3 rounded-xl hover:from-emerald-600 hover:to-green-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center gap-3 cursor-pointer"
                                                    >
                                                        <FaCheckCircle className="text-lg" />
                                                        Confirm Appointment
                                                    </button>
                                                    <button
                                                        onClick={() => openCancelModal(appointment)}
                                                        className="border border-red-500 text-red-600 px-8 py-3 rounded-xl hover:bg-red-50 transition-all duration-300 font-semibold flex items-center gap-3 cursor-pointer"
                                                    >
                                                        <MdOutlineCancel className="text-lg" />
                                                        Decline
                                                    </button>
                                                </>
                                            )}
                                            {appointment.status === "confirmed" && (
                                                <button
                                                    onClick={() => handleCompleteAppointment(appointment._id)}
                                                    className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white px-8 py-3 rounded-xl hover:from-blue-600 hover:to-cyan-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center gap-3 cursor-pointer"
                                                >
                                                    <HiOutlineClipboardCheck className="text-lg" />
                                                    Mark Completed
                                                </button>
                                            )}
                                            {(appointment.status === "completed" || appointment.status === "cancelled") && (
                                                <div className="flex items-center gap-2 text-gray-500">
                                                    <StatusIcon className="text-xl" />
                                                    <span className="font-semibold">
                                                        {appointment.status === "completed" ? "Consultation Completed" : "Appointment Cancelled"}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {/* Details Modal */}
            {showDetailsModal && selectedAppointment && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
                        <div className="p-8 border-b border-gray-200">
                            <div className="flex justify-between items-center">
                                <h3 className="text-2xl font-bold text-gray-900">Appointment Details</h3>
                                <button onClick={closeAllModals} className="text-gray-400 hover:text-gray-600 text-2xl transition-colors">×</button>
                            </div>
                        </div>
                        <div className="p-8 space-y-6">
                            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6">
                                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <FaUser className="text-blue-500" /> Client Information
                                </h4>
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div><p className="text-sm text-gray-600">Full Name</p><p className="font-semibold">{selectedAppointment.user.name}</p></div>
                                    <div><p className="text-sm text-gray-600">Email</p><p className="font-semibold">{selectedAppointment.user.email}</p></div>
                                    <div><p className="text-sm text-gray-600">Phone</p><p className="font-semibold">{selectedAppointment.user.phone}</p></div>
                                    <div><p className="text-sm text-gray-600">Case Type</p><p className="font-semibold text-blue-600">{selectedAppointment.booking.caseType}</p></div>
                                </div>
                            </div>
                            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6">
                                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <FaCalendarAlt className="text-green-500" /> Appointment Schedule
                                </h4>
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div><p className="text-sm text-gray-600">Date</p><p className="font-semibold">{formatDate(selectedAppointment.booking.preferredDate)}</p></div>
                                    <div><p className="text-sm text-gray-600">Time Slot</p><p className="font-semibold">{selectedAppointment.booking.preferredTime}</p></div>
                                </div>
                            </div>
                            {selectedAppointment.meetingLink && (
                                <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-2xl p-6">
                                    <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                        <FaLink className="text-emerald-500" /> Meeting Link
                                    </h4>
                                    <a href={selectedAppointment.meetingLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 break-all font-medium underline">
                                        {selectedAppointment.meetingLink}
                                    </a>
                                </div>
                            )}
                            {selectedAppointment.cancellationNote && (
                                <div className="bg-gradient-to-r from-red-50 to-pink-50 rounded-2xl p-6">
                                    <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                        <FaTimesCircle className="text-red-500" /> Cancellation Reason
                                    </h4>
                                    <p className="text-gray-700">{selectedAppointment.cancellationNote}</p>
                                </div>
                            )}
                            <div>
                                <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                    <FaFileAlt className="text-purple-500" /> Case Details
                                </h4>
                                <div className="bg-gray-50 rounded-xl p-4">
                                    <p className="text-gray-700 leading-relaxed">{selectedAppointment.booking.problemDescription}</p>
                                </div>
                            </div>
                            <div className="text-sm text-gray-500 space-y-1">
                                <p>Created: {new Date(selectedAppointment.createdAt).toLocaleString()}</p>
                                {selectedAppointment.updatedAt !== selectedAppointment.createdAt && (
                                    <p>Last Updated: {new Date(selectedAppointment.updatedAt).toLocaleString()}</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Confirm Modal */}
            {showConfirmModal && selectedAppointment && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl">
                        <div className="p-8 border-b border-gray-200">
                            <div className="flex justify-between items-center">
                                <h3 className="text-2xl font-bold text-gray-900">Confirm Appointment</h3>
                                <button onClick={closeAllModals} className="text-gray-400 hover:text-gray-600 text-2xl transition-colors">×</button>
                            </div>
                        </div>
                        <div className="p-8 space-y-6">
                            <div className="text-center">
                                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <FaCheckCircle className="text-3xl text-emerald-600" />
                                </div>
                                <h4 className="text-lg font-semibold text-gray-900 mb-2">
                                    Confirm Appointment with {selectedAppointment.user.name}
                                </h4>
                                <p className="text-gray-600">Please provide the meeting link for the consultation.</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Meeting Link *</label>
                                <div className="relative">
                                    <FaLink className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="url"
                                        value={meetingLink}
                                        onChange={(e) => setMeetingLink(e.target.value)}
                                        placeholder="https://meet.google.com/..."
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                    />
                                </div>
                                <p className="text-xs text-gray-500 mt-1">Enter a valid meeting link (Google Meet, Zoom, etc.)</p>
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button onClick={closeAllModals} className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-semibold">Cancel</button>
                                <button
                                    onClick={handleConfirmAppointment}
                                    disabled={processingAction || !meetingLink.trim()}
                                    className="flex-1 px-6 py-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-xl hover:from-emerald-600 hover:to-green-700 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {processingAction ? "Confirming..." : "Confirm Appointment"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Cancel Modal */}
            {showCancelModal && selectedAppointment && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl">
                        <div className="p-8 border-b border-gray-200">
                            <div className="flex justify-between items-center">
                                <h3 className="text-2xl font-bold text-gray-900">Decline Appointment</h3>
                                <button onClick={closeAllModals} className="text-gray-400 hover:text-gray-600 text-2xl transition-colors">×</button>
                            </div>
                        </div>
                        <div className="p-8 space-y-6">
                            <div className="text-center">
                                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <MdOutlineCancel className="text-3xl text-red-600" />
                                </div>
                                <h4 className="text-lg font-semibold text-gray-900 mb-2">
                                    Decline Appointment with {selectedAppointment.user.name}
                                </h4>
                                <p className="text-gray-600">Please provide a reason for declining this appointment.</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Cancellation Reason *</label>
                                <textarea
                                    value={cancellationNote}
                                    onChange={(e) => setCancellationNote(e.target.value)}
                                    placeholder="Please provide a reason for declining this appointment..."
                                    rows="4"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                                />
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button onClick={closeAllModals} className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-semibold">Cancel</button>
                                <button
                                    onClick={handleCancelAppointment}
                                    disabled={processingAction || !cancellationNote.trim()}
                                    className="flex-1 px-6 py-3 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-xl hover:from-red-600 hover:to-pink-700 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {processingAction ? "Declining..." : "Decline Appointment"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LawyerAppointments;