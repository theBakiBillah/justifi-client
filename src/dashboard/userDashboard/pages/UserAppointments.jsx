import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import {
    FaAward,
    FaBriefcase,
    FaCalendarAlt,
    FaCalendarCheck,
    FaChartBar,
    FaClock,
    FaEnvelope,
    FaFilter,
    FaRegClock,
    FaStar,
    FaTimesCircle,
    FaUserTie,
    FaVideo,
    FaCommentAlt,
} from "react-icons/fa";
import useAxiosSecure from "../../../hooks/useAxiosSecure";
import useUserData from "../../../hooks/useUserData";
import Loading from "../../../common/loading/Loading";
import FeedbackModal from "../components/Feedbackmodal"; // ✅ new import

const UserAppointments = () => {
    const { currentUser } = useUserData();
    const axiosSecure = useAxiosSecure();
    const [filter, setFilter] = useState("all");
    const [feedbackAppointment, setFeedbackAppointment] = useState(null); // ✅ new state

    const {
        data: myAppointments = [],
        isLoading,
        refetch,
    } = useQuery({
        queryKey: ["myAppointments", currentUser?.email],
        queryFn: async () => {
            const res = await axiosSecure.get(
                `/userAppointments?email=${currentUser?.email}`
            );
            return res.data || [];
        },
        enabled: !!currentUser?.email,
    });

    const filteredAppointments = myAppointments.filter((appointment) => {
        if (filter === "all") return true;
        return appointment.status === filter;
    });

    const StatusBadge = ({ status }) => {
        const statusConfig = {
            confirmed: {
                bg: "bg-emerald-50",
                text: "text-emerald-700",
                border: "border-emerald-200",
                icon: <FaCalendarCheck className="text-emerald-600" />,
                glow: "shadow-sm shadow-emerald-100",
            },
            cancelled: {
                bg: "bg-rose-50",
                text: "text-rose-700",
                border: "border-rose-200",
                icon: <FaTimesCircle className="text-rose-600" />,
                glow: "shadow-sm shadow-rose-100",
            },
            pending: {
                bg: "bg-amber-50",
                text: "text-amber-700",
                border: "border-amber-200",
                icon: <FaClock className="text-amber-600" />,
                glow: "shadow-sm shadow-amber-100",
            },
        };

        const config = statusConfig[status] || statusConfig.pending;

        return (
            <div
                className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold ${config.bg} ${config.text} ${config.border} ${config.glow} border transition-all duration-200`}
            >
                {config.icon}
                <span className="ml-1.5 capitalize">{status}</span>
            </div>
        );
    };

    const StatCard = ({ icon, value, label, color, trend }) => (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 group">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">{label}</p>
                    <p className={`text-2xl font-bold ${color} mb-1`}>{value}</p>
                    {trend && <p className="text-xs text-gray-500">{trend}</p>}
                </div>
                <div className="text-2xl opacity-80 group-hover:scale-110 transition-transform duration-300">
                    {icon}
                </div>
            </div>
        </div>
    );

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    const getTimeUntilAppointment = (dateString, timeString) => {
        const appointmentDate = new Date(
            `${dateString}T${timeString.split("-")[0]}`
        );
        const now = new Date();
        const diffTime = appointmentDate - now;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 0) return "Past appointment";
        if (diffDays === 0) return "Today";
        if (diffDays === 1) return "Tomorrow";
        return `In ${diffDays} days`;
    };

    // Show feedback button for confirmed/completed appointments that haven't been reviewed yet
    const canGiveFeedback = (appointment) => {
        if (!["confirmed", "completed"].includes(appointment.status)) return false;
        if (appointment.feedback) return false;
        return true;
    };

    if (isLoading) return <Loading />;

    const confirmedCount = myAppointments.filter((a) => a.status === "confirmed").length;
    const cancelledCount = myAppointments.filter((a) => a.status === "cancelled").length;
    const pendingCount   = myAppointments.filter((a) => a.status === "pending").length;

    return (
        <section className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 py-8">
            <div className="container mx-auto px-4 max-w-7xl">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-6 shadow-lg">
                        <FaCalendarAlt className="text-2xl text-white" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 bg-gradient-to-r from-gray-900 to-blue-900 bg-clip-text">
                        My Appointments
                    </h1>
                    <p className="text-gray-600 text-lg max-w-2xl mx-auto leading-relaxed">
                        Manage and track all your legal consultations with
                        comprehensive overview and insights
                    </p>
                </div>

                {/* Stats Overview */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <StatCard icon={<FaCalendarCheck className="text-blue-600" />} value={myAppointments.length} label="Total Appointments" color="text-blue-600" />
                    <StatCard icon={<FaAward className="text-emerald-600" />} value={confirmedCount} label="Confirmed" color="text-emerald-600" />
                    <StatCard icon={<FaTimesCircle className="text-rose-600" />} value={cancelledCount} label="Cancelled" color="text-rose-600" />
                    <StatCard icon={<FaRegClock className="text-amber-600" />} value={pendingCount} label="Pending" color="text-amber-600" />
                </div>

                {/* Filters */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/60 p-6 mb-8">
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                        <div className="flex items-center space-x-3">
                            <FaFilter className="text-gray-400 text-lg" />
                            <h3 className="text-lg font-semibold text-gray-900">
                                Filter Appointments
                            </h3>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {[
                                { key: "all",       label: "All Appointments", color: "gray"    },
                                { key: "confirmed", label: "Confirmed",        color: "emerald" },
                                { key: "cancelled", label: "Cancelled",        color: "rose"    },
                                { key: "pending",   label: "Pending",          color: "amber"   },
                            ].map(({ key, label, color }) => (
                                <button
                                    key={key}
                                    onClick={() => setFilter(key)}
                                    className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 transform hover:scale-105 ${
                                        filter === key
                                            ? `bg-${color}-600 text-white shadow-lg shadow-${color}-200`
                                            : "bg-white text-gray-700 border border-gray-300 hover:border-gray-400 shadow-sm hover:shadow-md"
                                    }`}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Appointments List */}
                <div className="space-y-6">
                    {filteredAppointments.length === 0 ? (
                        <div className="text-center py-16 bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/60">
                            <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <FaCalendarCheck className="text-3xl text-gray-400" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                No appointments found
                            </h3>
                            <p className="text-gray-600 max-w-md mx-auto">
                                {filter === "all"
                                    ? "You haven't scheduled any appointments yet. Start by booking your first consultation."
                                    : `No ${filter} appointments match your current filter.`}
                            </p>
                        </div>
                    ) : (
                        filteredAppointments.map((appointment) => {
                            const timeUntil = getTimeUntilAppointment(
                                appointment.booking.preferredDate,
                                appointment.booking.preferredTime
                            );
                            const eligible       = canGiveFeedback(appointment);
                            const alreadyReviewed = !!appointment.feedback;

                            return (
                                <div
                                    key={appointment._id}
                                    className="group bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/60 hover:shadow-xl hover:border-blue-200/50 transition-all duration-500 overflow-hidden"
                                >
                                    <div className="p-8">
                                        {/* Header with Status */}
                                        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
                                            <div className="flex items-center flex-wrap gap-3">
                                                <StatusBadge status={appointment.status} />
                                                <div className="flex items-center text-sm text-gray-500 bg-gray-100 px-3 py-1.5 rounded-full">
                                                    <FaRegClock className="mr-1.5" />
                                                    {timeUntil}
                                                </div>


                                            </div>

                                            <div className="text-sm text-gray-500 flex items-center space-x-4">
                                                <span>Created: {new Date(appointment.createdAt).toLocaleDateString()}</span>
                                                {appointment.updatedAt !== appointment.createdAt && (
                                                    <span>Updated: {new Date(appointment.updatedAt).toLocaleDateString()}</span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                                            {/* Lawyer Information */}
                                            <div className="space-y-5">
                                                <h3 className="font-semibold text-gray-900 text-lg flex items-center">
                                                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                                                        <FaUserTie className="text-blue-600" />
                                                    </div>
                                                    Legal Counsel
                                                </h3>
                                                <div className="flex items-start space-x-4 p-4 bg-gray-50/80 rounded-xl border border-gray-200/60">
                                                    <img
                                                        src={appointment.lawyer.img}
                                                        alt={appointment.lawyer.name}
                                                        className="w-14 h-14 rounded-xl object-cover shadow-sm"
                                                    />
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="font-bold text-gray-900 text-lg mb-1">
                                                            {appointment.lawyer.name}
                                                        </h4>
                                                        <p className="text-sm text-gray-600 flex items-center mb-2">
                                                            <FaEnvelope className="mr-2 text-gray-400" />
                                                            <span className="truncate">{appointment.lawyer.email}</span>
                                                        </p>
                                                        <div className="flex items-center space-x-4 text-sm">
                                                            <div className="flex items-center text-gray-600">
                                                                <FaAward className="mr-1.5 text-amber-500" />
                                                                <span className="font-semibold">{appointment.lawyer.experience} years</span>
                                                            </div>
                                                            <div className="flex items-center text-gray-600">
                                                                <FaStar className="mr-1.5 text-emerald-500" />
                                                                <span className="font-semibold">{appointment.lawyer.successRate}% success</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex flex-wrap gap-2">
                                                    {appointment.lawyer.specialization.map((spec, index) => (
                                                        <span key={index} className="px-3 py-1.5 bg-blue-50 text-blue-700 text-xs font-medium rounded-lg border border-blue-200">
                                                            {spec}
                                                        </span>
                                                    ))}
                                                </div>

                                                {/* Feedback button below specialization */}
                                                {eligible && (
                                                    <button
                                                        onClick={() => setFeedbackAppointment(appointment)}
                                                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-indigo-600 text-white hover:bg-indigo-700 transition shadow-sm hover:shadow-md active:scale-95 w-fit"
                                                    >
                                                        <FaCommentAlt className="text-xs" />
                                                     Feedback & Rating
                                                    </button>
                                                )}
                                                {alreadyReviewed && (
                                                    <p className="text-sm text-emerald-600 font-medium flex items-center gap-1.5">
                                                        <FaStar className="text-amber-400" />
                                                        You rated this session {appointment.feedback.rating}/5
                                                    </p>
                                                )}
                                            </div>

                                            {/* Appointment Details */}
                                            <div className="space-y-5">
                                                <h3 className="font-semibold text-gray-900 text-lg flex items-center">
                                                    <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center mr-3">
                                                        <FaCalendarCheck className="text-emerald-600" />
                                                    </div>
                                                    Appointment Details
                                                </h3>
                                                <div className="space-y-3 p-4 bg-gray-50/80 rounded-xl border border-gray-200/60">
                                                    <div className="flex items-center text-gray-700 p-2 hover:bg-white rounded-lg transition-colors">
                                                        <FaCalendarCheck className="text-gray-400 mr-4 text-lg" />
                                                        <div>
                                                            <div className="font-medium">{formatDate(appointment.booking.preferredDate)}</div>
                                                            <div className="text-sm text-gray-500">{timeUntil}</div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center text-gray-700 p-2 hover:bg-white rounded-lg transition-colors">
                                                        <FaClock className="text-gray-400 mr-4 text-lg" />
                                                        <span className="font-medium">{appointment.booking.preferredTime}</span>
                                                    </div>
                                                    <div className="flex items-center text-gray-700 p-2 hover:bg-white rounded-lg transition-colors">
                                                        <FaBriefcase className="text-gray-400 mr-4 text-lg" />
                                                        <span className="font-medium">{appointment.booking.caseType}</span>
                                                    </div>
                                                    {appointment.booking.meetingLink && (
                                                        <div className="flex items-center p-2 hover:bg-white rounded-lg transition-colors group/link">
                                                            <FaVideo className="text-blue-500 mr-4 text-lg" />
                                                            <a
                                                                href={appointment.booking.meetingLink}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="font-medium text-blue-600 hover:text-blue-700 flex items-center group-hover/link:underline"
                                                            >
                                                                Join Virtual Meeting
                                                                <span className="ml-2 text-sm">🔗</span>
                                                            </a>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Case Details */}
                                            <div className="space-y-5">
                                                <h3 className="font-semibold text-gray-900 text-lg flex items-center">
                                                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                                                        <FaChartBar className="text-purple-600" />
                                                    </div>
                                                    Case Details
                                                </h3>
                                                <div className="p-4 bg-gray-50/80 rounded-xl border border-gray-200/60 h-full">
                                                    <div className="mb-4">
                                                        <h4 className="font-medium text-gray-900 mb-2">Problem Description</h4>
                                                        <p className="text-gray-700 text-sm leading-relaxed bg-white p-4 rounded-lg border border-gray-200 min-h-[100px]">
                                                            {appointment.booking.problemDescription ||
                                                                "No detailed description provided for this case."}
                                                        </p>
                                                    </div>
                                                    {appointment.booking.cancellationNote && (
                                                        <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg">
                                                            <h4 className="font-medium text-rose-800 text-sm mb-1">Cancellation Note:</h4>
                                                            <p className="text-rose-700 text-sm">{appointment.booking.cancellationNote}</p>
                                                        </div>
                                                    )}

                                                    {/* ✅ Feedback summary if already reviewed */}
                                                    {alreadyReviewed && (
                                                        <div className="mt-3 p-3 bg-indigo-50 border border-indigo-200 rounded-lg">
                                                            <h4 className="font-medium text-indigo-800 text-sm mb-2 flex items-center gap-1.5">
                                                                <FaStar className="text-amber-400" /> Your Feedback
                                                            </h4>
                                                            <div className="flex items-center gap-1 mb-1">
                                                                {[1, 2, 3, 4, 5].map((s) => (
                                                                    <FaStar
                                                                        key={s}
                                                                        className={`text-sm ${
                                                                            s <= appointment.feedback.rating
                                                                                ? "text-amber-400"
                                                                                : "text-gray-200"
                                                                        }`}
                                                                    />
                                                                ))}
                                                                <span className="text-xs text-gray-500 ml-1">
                                                                    {appointment.feedback.rating}/5
                                                                </span>
                                                            </div>
                                                            {appointment.feedback.additional && (
                                                                <p className="text-indigo-700 text-xs mt-1 italic">
                                                                    "{appointment.feedback.additional}"
                                                                </p>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>


                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {/* ✅ Feedback Modal */}
            {feedbackAppointment && (
                <FeedbackModal
                    appointment={feedbackAppointment}
                    onClose={() => setFeedbackAppointment(null)}
                />
            )}
        </section>
    );
};

export default UserAppointments;