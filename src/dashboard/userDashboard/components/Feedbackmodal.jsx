import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
    FaStar,
    FaTimes,
    FaCheckCircle,
    FaSpinner,
    FaThumbsUp,
    FaThumbsDown,
} from "react-icons/fa";
import useAxiosSecure from "../../../hooks/useAxiosSecure";

// ── Star Rating ───────────────────────────────────────────────────────────────
const StarRating = ({ value, onChange }) => {
    const [hovered, setHovered] = useState(0);
    const labels = ["", "Poor", "Fair", "Good", "Very Good", "Excellent"];

    return (
        <div className="flex items-center gap-1.5">
            {[1, 2, 3, 4, 5].map((star) => (
                <button
                    key={star}
                    type="button"
                    onClick={() => onChange(star)}
                    onMouseEnter={() => setHovered(star)}
                    onMouseLeave={() => setHovered(0)}
                    className="transition-transform hover:scale-110 active:scale-95"
                >
                    <FaStar
                        className={`text-3xl transition-colors ${
                            star <= (hovered || value)
                                ? "text-amber-400"
                                : "text-gray-200"
                        }`}
                    />
                </button>
            ))}
            <span className="ml-2 text-sm font-semibold text-gray-500 w-20">
                {labels[hovered || value] || ""}
            </span>
        </div>
    );
};

// ── Tag Selector ──────────────────────────────────────────────────────────────
const TagSelector = ({ options, selected, onChange, activeClass }) => (
    <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
            const active = selected.includes(opt);
            return (
                <button
                    key={opt}
                    type="button"
                    onClick={() =>
                        onChange(
                            active
                                ? selected.filter((s) => s !== opt)
                                : [...selected, opt]
                        )
                    }
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                        active
                            ? activeClass
                            : "bg-white text-gray-600 border-gray-300 hover:border-gray-400"
                    }`}
                >
                    {opt}
                </button>
            );
        })}
    </div>
);

// ── Main Modal ────────────────────────────────────────────────────────────────
const FeedbackModal = ({ appointment, onClose }) => {
    const axiosSecure = useAxiosSecure();
    const queryClient = useQueryClient();

    const [step, setStep] = useState("form"); // "form" | "success"
    const [rating, setRating] = useState(0);
    const [qualities, setQualities] = useState([]);
    const [improvements, setImprovements] = useState([]);
    const [recommend, setRecommend] = useState(null);
    const [additional, setAdditional] = useState("");

    const qualityOptions = [
        "Professional",
        "Clear communication",
        "Punctual",
        "Well prepared",
        "Knowledgeable",
        "Empathetic",
        "Detail-oriented",
        "Patient listener",
    ];

    const improvementOptions = [
        "Better punctuality",
        "Clearer explanation",
        "More follow-up",
        "Faster response",
        "Better documentation",
        "More time given",
    ];

    const submitMutation = useMutation({
        mutationFn: async () => {
            const res = await axiosSecure.post(
                `/appointments/${appointment._id}/feedback`,
                {
                    rating,
                    qualities,
                    improvements,
                    recommend,
                    additional: additional.trim() || null,
                    lawyerEmail: appointment.lawyer.email,
                    submittedAt: new Date().toISOString(),
                }
            );
            return res.data;
        },
        onSuccess: (data) => {
            if (data.success) {
                queryClient.invalidateQueries([
                    "myAppointments",
                    appointment.user?.email,
                ]);
                setStep("success");
            }
        },
    });

    const canSubmit = rating > 0 && recommend !== null;

    // ── Success Screen ────────────────────────────────────────────────────────
    if (step === "success") {
        return (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-8 text-center">
                    <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FaCheckCircle className="text-3xl text-emerald-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                        Feedback Submitted!
                    </h3>
                    <p className="text-gray-500 text-sm mb-1">
                        Thank you for sharing your experience.
                    </p>
                    <p className="text-gray-400 text-xs mb-5">
                        Your feedback helps{" "}
                        <span className="font-semibold text-gray-600">
                            {appointment.lawyer.name}
                        </span>{" "}
                        serve clients better.
                    </p>
                    <div className="flex justify-center gap-1 mb-5">
                        {[1, 2, 3, 4, 5].map((s) => (
                            <FaStar
                                key={s}
                                className={`text-xl ${
                                    s <= rating ? "text-amber-400" : "text-gray-200"
                                }`}
                            />
                        ))}
                    </div>
                    <button
                        onClick={onClose}
                        className="px-8 py-2.5 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 transition w-full"
                    >
                        Done
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[92vh] flex flex-col">

                {/* Header */}
                <div
                    className="px-6 py-5 flex items-start justify-between rounded-t-2xl flex-shrink-0"
                    style={{
                        background: "linear-gradient(135deg, #1e3a8a 0%, #3730a3 100%)",
                    }}
                >
                    <div className="flex items-center gap-3">
                        <img
                            src={appointment.lawyer.img}
                            alt={appointment.lawyer.name}
                            className="w-12 h-12 rounded-xl object-cover border-2 border-white/30 flex-shrink-0"
                        />
                        <div>
                            <p className="text-blue-200 text-xs font-medium uppercase tracking-wider">
                                Rate your session with
                            </p>
                            <h3 className="text-white text-lg font-bold leading-tight">
                                {appointment.lawyer.name}
                            </h3>
                            <p className="text-blue-300 text-xs mt-0.5">
                                {appointment.booking.caseType} ·{" "}
                                {new Date(appointment.booking.preferredDate).toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                })}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-blue-200 hover:text-white transition mt-1 flex-shrink-0"
                    >
                        <FaTimes />
                    </button>
                </div>

                {/* Scrollable Body */}
                <div className="p-6 space-y-6 overflow-y-auto flex-1">

                    {/* Overall Rating */}
                    <div>
                        <label className="block text-sm font-bold text-gray-800 mb-3">
                            Overall Rating <span className="text-red-400">*</span>
                        </label>
                        <StarRating value={rating} onChange={setRating} />
                    </div>

                    {/* What went well */}
                    <div>
                        <label className="block text-sm font-bold text-gray-800 mb-1">
                            What went well?
                        </label>
                        <p className="text-xs text-gray-400 mb-2">Select all that apply</p>
                        <TagSelector
                            options={qualityOptions}
                            selected={qualities}
                            onChange={setQualities}
                            activeClass="bg-blue-600 text-white border-blue-600"
                        />
                    </div>

                    {/* Areas to improve */}
                    <div>
                        <label className="block text-sm font-bold text-gray-800 mb-1">
                            Areas to improve?
                        </label>
                        <p className="text-xs text-gray-400 mb-2">Select all that apply</p>
                        <TagSelector
                            options={improvementOptions}
                            selected={improvements}
                            onChange={setImprovements}
                            activeClass="bg-amber-500 text-white border-amber-500"
                        />
                    </div>

                    {/* Would recommend */}
                    <div>
                        <label className="block text-sm font-bold text-gray-800 mb-3">
                            Would you recommend this lawyer?{" "}
                            <span className="text-red-400">*</span>
                        </label>
                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={() => setRecommend(true)}
                                className={`flex-1 py-3 rounded-xl font-semibold text-sm border-2 transition-all flex items-center justify-center gap-2 ${
                                    recommend === true
                                        ? "bg-emerald-600 text-white border-emerald-600 shadow-md"
                                        : "bg-white text-gray-600 border-gray-200 hover:border-emerald-300"
                                }`}
                            >
                                <FaThumbsUp /> Yes, definitely
                            </button>
                            <button
                                type="button"
                                onClick={() => setRecommend(false)}
                                className={`flex-1 py-3 rounded-xl font-semibold text-sm border-2 transition-all flex items-center justify-center gap-2 ${
                                    recommend === false
                                        ? "bg-red-500 text-white border-red-500 shadow-md"
                                        : "bg-white text-gray-600 border-gray-200 hover:border-red-300"
                                }`}
                            >
                                <FaThumbsDown /> Not really
                            </button>
                        </div>
                    </div>

                    {/* Additional comments */}
                    <div>
                        <label className="block text-sm font-bold text-gray-800 mb-1">
                            Additional Comments
                            <span className="ml-1 text-gray-400 font-normal text-xs">
                                (optional)
                            </span>
                        </label>
                        <textarea
                            value={additional}
                            onChange={(e) => setAdditional(e.target.value)}
                            rows={3}
                            maxLength={500}
                            placeholder="Share anything else about your experience..."
                            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent resize-none transition"
                        />
                        <p className="text-xs text-gray-400 text-right mt-1">
                            {additional.length}/500
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 pb-6 flex-shrink-0 space-y-3">
                    {!canSubmit && (
                        <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-center">
                            Please provide a star rating and recommendation to submit.
                        </p>
                    )}
                    {submitMutation.isError && (
                        <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-center">
                            Something went wrong. Please try again.
                        </p>
                    )}
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="flex-1 py-3 rounded-xl font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={() => submitMutation.mutate()}
                            disabled={!canSubmit || submitMutation.isPending}
                            className="flex-1 py-3 rounded-xl font-bold text-white transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 bg-blue-700 hover:bg-blue-800"
                        >
                            {submitMutation.isPending ? (
                                <>
                                    <FaSpinner className="animate-spin" />
                                    Submitting...
                                </>
                            ) : (
                                <>
                                    <FaThumbsUp /> Submit Feedback
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FeedbackModal;