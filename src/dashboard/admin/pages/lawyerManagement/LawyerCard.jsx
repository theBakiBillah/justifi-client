import {
    FaAward,
    FaEdit,
    FaLanguage,
    FaMapMarkerAlt,
    FaStar,
    FaTrash,
} from "react-icons/fa";

const LawyerCard = ({ lawyer, onEdit, onDelete, searchTerm = "" }) => {
    const highlightText = (text, highlight) => {
        if (!highlight.trim() || !text) return text;

        const regex = new RegExp(`(${highlight})`, "gi");
        const parts = String(text).split(regex);

        return (
            <span>
                {parts.map((part, index) =>
                    regex.test(part) ? (
                        <mark
                            key={index}
                            className="bg-amber-100 text-amber-800 px-1 rounded font-medium"
                        >
                            {part}
                        </mark>
                    ) : (
                        part
                    )
                )}
            </span>
        );
    };

    const getExperienceLevel = (exp) => {
        if (exp >= 15)
            return {
                color: "bg-purple-100 text-purple-800 border-purple-200",
                badgeColor: "bg-purple-600",
                text: "Senior Partner",
            };
        if (exp >= 10)
            return {
                color: "bg-blue-100 text-blue-800 border-blue-200",
                badgeColor: "bg-blue-600",
                text: "Expert Counsel",
            };
        if (exp >= 5)
            return {
                color: "bg-emerald-100 text-emerald-800 border-emerald-200",
                badgeColor: "bg-emerald-600",
                text: "Senior Associate",
            };
        return {
            color: "bg-gray-100 text-gray-800 border-gray-200",
            badgeColor: "bg-gray-600",
            text: "Associate",
        };
    };

    const experienceLevel = getExperienceLevel(lawyer.experience);

    return (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group">
            {/* Header Section */}
            <div className="bg-white p-6 border-b border-gray-100">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-4">
                        {/* Professional Avatar */}
                        <div className="relative">
                            <div className="w-16 h-16 rounded-lg bg-gray-100 border border-gray-300 overflow-hidden">
                                <img
                                    src={lawyer.image}
                                    alt={lawyer.name}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        e.target.style.display = "none";
                                        e.target.nextSibling.style.display =
                                            "flex";
                                    }}
                                />
                                <div className="w-full h-full bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center">
                                    <span className="text-white font-semibold text-sm">
                                        {lawyer.name
                                            .split(" ")
                                            .map((n) => n[0])
                                            .join("")}
                                    </span>
                                </div>
                            </div>
                            {/* Experience Badge */}
                            <div
                                className={`absolute -bottom-1 -right-1 ${experienceLevel.badgeColor} text-white text-xs font-medium px-2 py-1 rounded border border-white`}
                            >
                                {lawyer.experience}y
                            </div>
                        </div>

                        {/* Name and Basic Info */}
                        <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-semibold text-gray-900 truncate mb-1">
                                {searchTerm
                                    ? highlightText(lawyer.name, searchTerm)
                                    : lawyer.name}
                            </h3>
                            <p className="text-sm text-gray-600 font-medium mb-2">
                                {lawyer.bar_id}
                            </p>
                            <div className="flex items-center text-sm text-gray-500">
                                <FaMapMarkerAlt className="w-3 h-3 mr-1 flex-shrink-0" />
                                <span className="truncate">
                                    {searchTerm
                                        ? highlightText(
                                              lawyer.court,
                                              searchTerm
                                          )
                                        : lawyer.court}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Premium Indicator */}
                    {lawyer.rating >= 4.5 && (
                        <div className="flex-shrink-0">
                            <FaAward className="w-5 h-5 text-amber-500" />
                        </div>
                    )}
                </div>

                {/* Experience Level Tag */}
                <div
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${experienceLevel.color}`}
                >
                    {experienceLevel.text}
                </div>
            </div>

            {/* Key Metrics */}
            <div className="p-6 border-b border-gray-100">
                <div className="grid grid-cols-3 gap-4 mb-4">
                    {/* Success Rate */}
                    <div className="text-center">
                        <div className="text-2xl font-bold text-gray-900 mb-1">
                            {lawyer.successRate}%
                        </div>
                        <div className="text-xs text-gray-500 font-medium uppercase tracking-wide">
                            Success Rate
                        </div>
                    </div>

                    {/* Cases Handled */}
                    <div className="text-center">
                        <div className="text-2xl font-bold text-gray-900 mb-1">
                            {lawyer.casesHandled}
                        </div>
                        <div className="text-xs text-gray-500 font-medium uppercase tracking-wide">
                            Cases
                        </div>
                    </div>

                    {/* Consultation Fee */}
                    <div className="text-center">
                        <div className="text-xl font-bold text-gray-900 mb-1">
                            ${lawyer.fee}
                        </div>
                        <div className="text-xs text-gray-500 font-medium uppercase tracking-wide">
                            Fee
                        </div>
                    </div>
                </div>

                {/* Success Rate Progress */}
                <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                        <span className="font-medium text-gray-700">
                            Case Success
                        </span>
                        <span className="font-semibold text-gray-900">
                            {lawyer.successRate}%
                        </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                            className={`h-2 rounded-full ${
                                lawyer.successRate >= 90
                                    ? "bg-emerald-600"
                                    : lawyer.successRate >= 80
                                    ? "bg-green-500"
                                    : lawyer.successRate >= 70
                                    ? "bg-amber-500"
                                    : "bg-red-500"
                            }`}
                            style={{ width: `${lawyer.successRate}%` }}
                        ></div>
                    </div>
                </div>
            </div>

            {/* Specializations */}
            <div className="p-6 border-b border-gray-100">
                <h4 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wide">
                    Areas of Expertise
                </h4>
                <div className="flex flex-wrap gap-2">
                    {lawyer.specialization.slice(0, 4).map((spec, index) => (
                        <span
                            key={index}
                            className="inline-flex items-center px-3 py-1.5 rounded-md bg-blue-50 text-blue-700 text-sm font-medium border border-blue-200 hover:bg-blue-100 transition-colors duration-150"
                        >
                            {searchTerm
                                ? highlightText(spec, searchTerm)
                                : spec}
                        </span>
                    ))}
                    {lawyer.specialization.length > 4 && (
                        <span className="inline-flex items-center px-3 py-1.5 rounded-md bg-gray-100 text-gray-600 text-sm font-medium border border-gray-300">
                            +{lawyer.specialization.length - 4}
                        </span>
                    )}
                </div>
            </div>

            {/* Rating and Languages */}
            <div className="p-6">
                <div className="flex items-center justify-between">
                    {/* Rating */}
                    <div className="flex items-center space-x-2">
                        <div className="flex items-center space-x-1">
                            <FaStar className="w-4 h-4 text-amber-500" />
                            <span className="text-lg font-semibold text-gray-900">
                                {lawyer.rating}
                            </span>
                        </div>
                        <span className="text-sm text-gray-500">Rating</span>
                    </div>

                    {/* Languages */}
                    <div className="flex items-center space-x-2">
                        <FaLanguage className="w-4 h-4 text-gray-400" />
                        <span className="text-sm font-medium text-gray-700">
                            {lawyer.languages.length} languages
                        </span>
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
                <div className="flex space-x-3">
                    <button
                        onClick={() => onEdit(lawyer)}
                        className="flex-1 flex items-center justify-center space-x-2 bg-white text-gray-700 px-4 py-2.5 rounded-lg border border-gray-300 hover:bg-gray-50 hover:border-gray-400 hover:text-gray-900 transition-all duration-200 font-medium text-sm"
                    >
                        <FaEdit className="w-4 h-4" />
                        <span>Edit</span>
                    </button>
                    <button
                        onClick={() => onDelete(lawyer.email)}
                        className="flex-1 flex items-center justify-center space-x-2 bg-white text-gray-700 px-4 py-2.5 rounded-lg border border-gray-300 hover:bg-red-50 hover:text-red-700 hover:border-red-300 transition-all duration-200 font-medium text-sm"
                    >
                        <FaTrash className="w-4 h-4" />
                        <span>Remove</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LawyerCard;
