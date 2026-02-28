import React from "react";
import { useNavigate } from "react-router-dom";
import {
  FaVideo,
  FaCalendarTimes,
  FaSpinner,
  FaExclamationTriangle,
  FaCheckCircle,
  FaEye,
} from "react-icons/fa";

const LawyerArbHearing = ({
  hearings = [],
  isLoading = false,
  arbitrationId,
}) => {
  const navigate = useNavigate();

  const handleRowClick = (hearing) => {
    if (hearing.hearingId && arbitrationId) {
      navigate(
        `/dashboard/lawyer-hearing-details/${arbitrationId}/${hearing.hearingId}`,
      );
    }
  };

  // ── Loading ──────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 mb-8">
        <div className="flex items-center mb-6">
          <div className="w-1 h-8 bg-green-600 rounded-full mr-3"></div>
          <h2 className="text-2xl font-bold text-gray-900">
            Hearings & Proceedings
          </h2>
        </div>
        <div className="text-center py-12">
          <div className="flex justify-center items-center">
            <FaSpinner className="animate-spin text-4xl text-blue-600 mr-4" />
            <div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                Loading Hearings
              </h3>
              <p className="text-gray-500">
                Please wait while we fetch the hearings data...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Empty ────────────────────────────────────────────────────
  if (!hearings || hearings.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 mb-8">
        <div className="flex items-center mb-6">
          <div className="w-1 h-8 bg-green-600 rounded-full mr-3"></div>
          <h2 className="text-2xl font-bold text-gray-900">
            Hearings & Proceedings
          </h2>
        </div>
        <div className="text-center py-12">
          <div className="bg-gray-50 rounded-2xl p-8 max-w-md mx-auto">
            <FaCalendarTimes className="text-6xl text-gray-300 mb-6 mx-auto" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No Hearings Scheduled
            </h3>
            <p className="text-gray-500">
              No hearings have been scheduled for this case yet.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ── Table ────────────────────────────────────────────────────
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 mb-8">
      {/* Section Header */}
      <div className="flex items-center mb-6">
        <div className="w-1 h-8 bg-green-600 rounded-full mr-3"></div>
        <h2 className="text-2xl font-bold text-gray-900">
          Hearings & Proceedings
        </h2>
        <span className="ml-3 bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full">
          {hearings.length} hearing{hearings.length !== 1 ? "s" : ""}
        </span>
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100">
            <tr>
              {[
                "Hearing",
                "Date & Time",
                "Status",
                "Duration",
                "Agenda",
                "Meeting Link",
                "Details",
              ].map((col) => (
                <th
                  key={col}
                  className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="bg-white divide-y divide-gray-200">
            {hearings.map((hearing, index) => (
              <tr
                key={hearing.hearingId || hearing._id || index}
                className="hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={() => handleRowClick(hearing)}
              >
                {/* Hearing # */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-bold text-gray-900">
                    {hearing.hearingNumber || "N/A"}
                  </div>
                  <div className="text-xs text-gray-500">
                    {hearing.hearingId || "No ID"}
                  </div>
                </td>

                {/* Date & Time */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-semibold text-gray-900">
                    {hearing.date
                      ? new Date(hearing.date).toLocaleDateString()
                      : "Date not set"}
                  </div>
                  <div className="text-sm text-gray-500">
                    {hearing.date
                      ? new Date(hearing.date).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : ""}
                  </div>
                </td>

                {/* Status */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                      hearing.status === "completed"
                        ? "bg-green-100 text-green-800"
                        : hearing.status === "scheduled"
                          ? "bg-blue-100 text-blue-800"
                          : hearing.status === "cancelled"
                            ? "bg-red-100 text-red-800"
                            : hearing.status === "postponed"
                              ? "bg-yellow-100 text-yellow-800"
                              : hearing.status === "ongoing"
                                ? "bg-violet-100 text-violet-800"
                                : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {hearing.status
                      ? hearing.status.charAt(0).toUpperCase() +
                        hearing.status.slice(1)
                      : "Scheduled"}
                  </span>
                </td>

                {/* Duration */}
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {hearing.duration ? `${hearing.duration} min` : "—"}
                </td>

                {/* Agenda */}
                <td className="px-6 py-4 text-sm text-gray-900 max-w-xs">
                  <div className="line-clamp-2">
                    {hearing.hearingAgenda || "No agenda provided"}
                  </div>
                </td>

                {/* Meeting Link */}
                <td className="px-6 py-4 whitespace-nowrap">
                  {hearing.meetLink ? (
                    <a
                      href={hearing.meetLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium transition-colors text-sm"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <FaVideo className="mr-1" />
                      Join Meeting
                    </a>
                  ) : (
                    <span className="text-gray-500 text-sm">
                      No link provided
                    </span>
                  )}
                </td>

                {/* Details */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium transition-colors text-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRowClick(hearing);
                    }}
                    title="View hearing details"
                  >
                    <FaEye className="mr-1" />
                    View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LawyerArbHearing;
