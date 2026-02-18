import React from "react";
import {
  FaFileAlt,
  FaCalendarAlt,
  FaMoneyBillWave,
  FaClock,
} from "react-icons/fa";

const LawyerArbitrationHeader = ({ arbitration }) => {
  const getStatusText = (status) => {
    switch (status) {
      case "ongoing":
        return "Proceedings Ongoing";
      case "completed":
        return "Case Concluded";
      default:
        return status;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Not specified";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <>
      {/* Arbitration Header */}
      <div
        className="text-white rounded-xl shadow-lg p-6 mb-8"
        style={{
          background: "linear-gradient(135deg, #1e3a8a 0%, #3730a3 100%)",
        }}
      >
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
          <div className="flex-1">
            <div className="flex items-center mb-3">
              <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold mr-4 text-gray-600 bg-white bg-opacity-20 backdrop-blur-sm">
                {getStatusText(arbitration.status)}
              </span>

              <span className="font-mono bg-black bg-opacity-20 px-3 py-1 rounded-lg">
                {arbitration.id}
              </span>
            </div>

            <h1 className="text-3xl font-bold mb-4">{arbitration.title}</h1>

            {/* Key Information Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {/* Suit Value */}
              <div className="p-4 bg-white bg-opacity-90 rounded-lg backdrop-blur-sm border border-white border-opacity-20 flex items-center">
                <FaMoneyBillWave className="text-gray-700 mr-3 text-xl flex-shrink-0" />
                <div>
                  <p className="text-gray-700 text-sm font-medium mb-1">
                    Suit Value
                  </p>
                  <p className="text-gray-900 font-semibold">
                    {arbitration.suitValue}
                  </p>
                </div>
              </div>

              {/* Completed Sessions */}
              <div className="p-4 bg-white bg-opacity-90 rounded-lg backdrop-blur-sm border border-white border-opacity-20 flex items-center">
                <FaClock className="text-gray-700 mr-3 text-xl flex-shrink-0" />
                <div>
                  <p className="text-gray-700 text-sm font-medium mb-1">
                    Completed Sessions
                  </p>
                  <p className="text-gray-900 font-semibold">
                    {arbitration.completedSessions || 0}
                  </p>
                </div>
              </div>

              {/* Remaining Sessions */}
              <div className="p-4 bg-white bg-opacity-90 rounded-lg backdrop-blur-sm border border-white border-opacity-20 flex items-center">
                <FaClock className="text-gray-700 mr-3 text-xl flex-shrink-0" />
                <div>
                  <p className="text-gray-700 text-sm font-medium mb-1">
                    Remaining Sessions
                  </p>
                  <p className="text-gray-900 font-semibold">
                    {arbitration.remainingSessions || 0}
                  </p>
                </div>
              </div>

              {/* Next Hearing (from details page) */}
              <div className="p-4 bg-white bg-opacity-90 rounded-lg backdrop-blur-sm border border-white border-opacity-20 flex items-center">
                <FaCalendarAlt className="text-gray-700 mr-3 text-xl flex-shrink-0" />
                <div>
                  <p className="text-gray-700 text-sm font-medium mb-1">
                    Next Hearing
                  </p>
                  <p className="text-gray-900 font-semibold">
                    {arbitration.nextHearing
                      ? formatDate(arbitration.nextHearing)
                      : "Not scheduled"}
                  </p>
                </div>
              </div>
            </div>

            {/* Nature of Dispute */}
            <div className="mt-6 p-4 bg-white bg-opacity-90 rounded-lg backdrop-blur-sm border border-white border-opacity-20">
              <div className="flex items-start">
                <FaFileAlt className="text-gray-700 mr-3 text-xl mt-1 flex-shrink-0" />
                <div>
                  <p className="text-gray-700 text-sm font-medium mb-2">
                    Nature of Dispute
                  </p>
                  <p className="text-gray-900 text-lg leading-relaxed">
                    {arbitration.nature}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default LawyerArbitrationHeader;
