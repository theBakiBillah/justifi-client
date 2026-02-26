import { useState } from "react";
import {
  FaCalendarCheck,
  FaVideo,
  FaEye,
  FaCalendarTimes,
  FaTimes,
} from "react-icons/fa";

const Med_HearingSection = ({ mediation }) => {
  const [selectedHearing, setSelectedHearing] = useState(null);

  // ✅ FIX: Read hearings directly from the passed mediation prop
  const hearings = Array.isArray(mediation?.hearings) ? mediation.hearings : [];

  return (
    <>
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-100">
        <div className="flex items-center mb-8">
          <div className="w-1 h-8 bg-purple-600 rounded-full mr-3"></div>
          <h2 className="text-2xl font-bold text-gray-900">
            <FaCalendarCheck className="inline mr-3 text-purple-600" />
            Hearing Information
          </h2>
        </div>

        {hearings.length === 0 ? (
          <div className="text-center py-12">
            <FaCalendarTimes className="mx-auto text-6xl text-gray-300 mb-6" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No Hearings Scheduled
            </h3>
            <p className="text-gray-500">
              Hearing dates will appear here once they are scheduled.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="w-full">
              <thead>
                <tr className="bg-purple-50">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-purple-900">
                    #
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-purple-900">
                    DATE &amp; TIME
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-purple-900">
                    DOCUMENTS REQUIRED
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-purple-900">
                    MEETING
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-purple-900">
                    OVERVIEW
                  </th>
                </tr>
              </thead>
              <tbody>
                {hearings.map((hearing, index) => (
                  <tr
                    key={index}
                    className={`border-t ${index % 2 === 0 ? "bg-white" : "bg-gray-50"}`}
                  >
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-800 font-medium">
                      {hearing.date
                        ? new Date(hearing.date).toLocaleString("en-US", {
                            dateStyle: "medium",
                            timeStyle: "short",
                          })
                        : "TBD"}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {hearing.documentsRequired || "None specified"}
                    </td>
                    <td className="px-6 py-4">
                      {hearing.meetingLink ? (
                        <a
                          href={hearing.meetingLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors"
                        >
                          <FaVideo className="mr-2" />
                          Join
                        </a>
                      ) : (
                        <span className="text-gray-400 text-sm">
                          Not available
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => setSelectedHearing(hearing)}
                        className="inline-flex items-center px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm transition-colors"
                      >
                        <FaEye className="mr-2" />
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ================= HEARING DETAIL MODAL ================= */}
      {selectedHearing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-xl font-bold text-gray-900">
                Hearing Overview
              </h3>
              <button
                onClick={() => setSelectedHearing(null)}
                className="text-gray-500 hover:text-gray-800 transition-colors"
              >
                <FaTimes className="text-xl" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Date */}
              <div className="bg-purple-50 rounded-lg p-4">
                <p className="text-sm text-purple-600 font-medium mb-1">
                  Hearing Date &amp; Time
                </p>
                <p className="text-gray-900 font-semibold">
                  {selectedHearing.date
                    ? new Date(selectedHearing.date).toLocaleString("en-US", {
                        dateStyle: "long",
                        timeStyle: "short",
                      })
                    : "Not specified"}
                </p>
              </div>

              {/* Mediator / Arbitrator Notes */}
              {(selectedHearing.overview?.arbitrator1Notes ||
                selectedHearing.overview?.mediator1Notes) && (
                <div>
                  <p className="font-semibold text-gray-800 mb-1">
                    Mediator 1 Notes:
                  </p>
                  <p className="text-gray-700 bg-gray-50 rounded p-3">
                    {selectedHearing.overview?.arbitrator1Notes ||
                      selectedHearing.overview?.mediator1Notes}
                  </p>
                </div>
              )}

              {(selectedHearing.overview?.arbitrator2Notes ||
                selectedHearing.overview?.mediator2Notes) && (
                <div>
                  <p className="font-semibold text-gray-800 mb-1">
                    Mediator 2 Notes:
                  </p>
                  <p className="text-gray-700 bg-gray-50 rounded p-3">
                    {selectedHearing.overview?.arbitrator2Notes ||
                      selectedHearing.overview?.mediator2Notes}
                  </p>
                </div>
              )}

              {(selectedHearing.overview?.arbitrator3Notes ||
                selectedHearing.overview?.mediator3Notes) && (
                <div>
                  <p className="font-semibold text-gray-800 mb-1">
                    Mediator 3 Notes:
                  </p>
                  <p className="text-gray-700 bg-gray-50 rounded p-3">
                    {selectedHearing.overview?.arbitrator3Notes ||
                      selectedHearing.overview?.mediator3Notes}
                  </p>
                </div>
              )}

              {selectedHearing.overview?.finalResult && (
                <div>
                  <p className="font-semibold text-gray-800 mb-1">
                    Result / Decision:
                  </p>
                  <p className="text-gray-700 bg-green-50 border border-green-200 rounded p-3">
                    {selectedHearing.overview.finalResult}
                  </p>
                </div>
              )}

              {selectedHearing.overview?.attendance != null && (
                <div>
                  <p className="font-semibold text-gray-800 mb-1">
                    Attendance:
                  </p>
                  <p className="text-gray-700">
                    {selectedHearing.overview.attendance}
                  </p>
                </div>
              )}

              {/* Fallback if no overview data */}
              {!selectedHearing.overview && (
                <p className="text-gray-500 italic">
                  No overview data available for this hearing.
                </p>
              )}
            </div>

            <div className="p-6 border-t text-right">
              <button
                onClick={() => setSelectedHearing(null)}
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Med_HearingSection;
