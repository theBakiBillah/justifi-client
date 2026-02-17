import React, { useState } from "react";
import {
  FaVideo,
  FaCheckCircle,
  FaCalendarTimes,
  FaRegWindowClose,
} from "react-icons/fa";

const LawyerArbHearing = ({ hearings }) => {
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState({
    type: "",
    content: "",
    hearingDate: "",
  });

  const openModal = (type, content, hearingDate) => {
    setModalContent({ type, content, hearingDate });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setModalContent({ type: "", content: "", hearingDate: "" });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
  };

  // Modal Component
  const DetailModal = () => {
    if (!showModal) return null;

    return (
      <div
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        onClick={closeModal}
      >
        <div
          className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 flex justify-between items-center">
            <h3 className="text-xl font-bold text-white">
              {modalContent.type === "notes"
                ? "Arbitrator Notes"
                : "Documents Required"}
            </h3>
            <button
              onClick={closeModal}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <FaRegWindowClose className="text-xl" />
            </button>
          </div>

          <div className="p-6 overflow-y-auto max-h-[calc(80vh-80px)]">
            {modalContent.hearingDate && (
              <div className="mb-4 pb-3 border-b border-gray-200">
                <p className="text-sm text-gray-600">
                  Hearing Date:{" "}
                  <span className="font-semibold text-gray-800">
                    {modalContent.hearingDate}
                  </span>
                </p>
              </div>
            )}

            <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
              <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                {modalContent.content}
              </p>
            </div>
          </div>

          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-end">
            <button
              onClick={closeModal}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
      <DetailModal />

      <div className="flex items-center mb-6">
        <div className="w-1 h-8 bg-green-600 rounded-full mr-3"></div>
        <h2 className="text-2xl font-bold text-gray-900">
          Arbitration Proceedings
        </h2>
      </div>

      {hearings.length > 0 ? (
        <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider bg-gray-100">
                  Hearing Date
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider bg-gray-100">
                  Arbitrator 1 Notes
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider bg-gray-100">
                  Arbitrator 2 Notes
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider bg-gray-100">
                  Arbitrator 3 Notes
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider bg-gray-100">
                  Result
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider bg-gray-100">
                  Documents Required
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider bg-gray-100">
                  Meeting Link
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider bg-gray-100">
                  Attendance
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {hearings.map((hearing) => {
                const { date, time } = formatDate(hearing.date);
                const hearingDateTime = `${date} ${time}`;

                return (
                  <tr key={hearing.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900">
                        {date}
                      </div>
                      <div className="text-sm text-gray-500">{time}</div>
                    </td>

                    {/* Arbitrator 1 Notes */}
                    <td className="px-6 py-4 text-sm text-gray-900 max-w-xs">
                      <div
                        className="bg-blue-50 p-3 rounded-lg border border-blue-100 cursor-pointer hover:bg-blue-100 transition-colors group"
                        onClick={() =>
                          openModal(
                            "notes",
                            hearing.arbitrator1Notes,
                            hearingDateTime,
                          )
                        }
                      >
                        <p className="text-gray-700 line-clamp-3 text-sm">
                          {hearing.arbitrator1Notes}
                        </p>
                        {hearing.arbitrator1Notes.length > 100 && (
                          <span className="text-xs text-blue-600 mt-1 inline-block font-medium">
                            Click to expand
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Arbitrator 2 Notes */}
                    <td className="px-6 py-4 text-sm text-gray-900 max-w-xs">
                      <div
                        className="bg-green-50 p-3 rounded-lg border border-green-100 cursor-pointer hover:bg-green-100 transition-colors group"
                        onClick={() =>
                          openModal(
                            "notes",
                            hearing.arbitrator2Notes,
                            hearingDateTime,
                          )
                        }
                      >
                        <p className="text-gray-700 line-clamp-3 text-sm">
                          {hearing.arbitrator2Notes}
                        </p>
                        {hearing.arbitrator2Notes.length > 100 && (
                          <span className="text-xs text-green-600 mt-1 inline-block font-medium">
                            Click to expand
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Arbitrator 3 Notes */}
                    <td className="px-6 py-4 text-sm text-gray-900 max-w-xs">
                      <div
                        className="bg-purple-50 p-3 rounded-lg border border-purple-100 cursor-pointer hover:bg-purple-100 transition-colors group"
                        onClick={() =>
                          openModal(
                            "notes",
                            hearing.arbitrator3Notes,
                            hearingDateTime,
                          )
                        }
                      >
                        <p className="text-gray-700 line-clamp-3 text-sm">
                          {hearing.arbitrator3Notes}
                        </p>
                        {hearing.arbitrator3Notes.length > 100 && (
                          <span className="text-xs text-purple-600 mt-1 inline-block font-medium">
                            Click to expand
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        {hearing.result}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-sm text-gray-900 max-w-xs">
                      <div
                        className="bg-gray-50 p-3 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors group"
                        onClick={() =>
                          openModal(
                            "documents",
                            hearing.documentsRequired,
                            hearingDateTime,
                          )
                        }
                      >
                        <p className="text-gray-700 line-clamp-3 text-sm">
                          {hearing.documentsRequired}
                        </p>
                        {hearing.documentsRequired.length > 100 && (
                          <span className="text-xs text-gray-600 mt-1 inline-block font-medium">
                            Click to expand
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <a
                        href={hearing.meetLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium bg-blue-50 px-3 py-2 rounded-lg hover:bg-blue-100 transition-colors"
                      >
                        <FaVideo className="mr-2" />
                        Join Meeting
                      </a>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <FaCheckCircle className="mr-1" />
                        {hearing.attendance}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="bg-gray-50 rounded-2xl p-8 max-w-md mx-auto">
            <FaCalendarTimes className="text-6xl text-gray-300 mb-6 mx-auto" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No Hearings Scheduled
            </h3>
            <p className="text-gray-500 mb-6">
              No hearings have been scheduled for this case yet.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default LawyerArbHearing;
