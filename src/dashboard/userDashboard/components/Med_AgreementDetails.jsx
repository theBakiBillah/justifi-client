// dashboard/userDashboard/components/Med_AgreementDetails.jsx

import {
  FaHandshake,
  FaCalendarAlt,
  FaClock,
  FaCalendarCheck,
  FaTimes,
  FaExclamationTriangle,
  FaUserTie,
} from "react-icons/fa";

// ✅ FIX: prop renamed from `arbitration` → `mediation` to match MediationDetails
const Med_AgreementDetails = ({ mediation }) => {
  if (!mediation) return null;

  const status = mediation?.mediation_status?.toLowerCase();

  const isCaseCancelled = status === "cancelled";
  const isCasePending = status === "pending";
  const isCaseOngoing = status === "ongoing";
  const isCaseCompleted = status === "completed";

  const hasSessionData = mediation?.sessionData?.sessionDateTime;
  const hasAgreementData =
    mediation?.agreementDate || mediation?.justifiRepresentative;

  const agreementData = {
    sessionDate: mediation?.sessionData?.sessionDateTime || null,
    meetingLink: mediation?.sessionData?.meetingLink || null,
    agreementDate: mediation?.agreementDate || null,
    justifiRepresentative: mediation?.justifiRepresentative || null,
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Not defined yet";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return "Invalid date";
    }
  };

  const formatTime = (dateString) => {
    if (!dateString) return "Not defined yet";
    try {
      return new Date(dateString).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    } catch {
      return "Invalid time";
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-100">
      <div className="flex items-center mb-8">
        <div className="w-1 h-8 bg-teal-600 rounded-full mr-3"></div>
        <h2 className="text-2xl font-bold text-gray-900">
          <FaHandshake className="inline mr-3 text-teal-600" />
          Agreement Details
        </h2>
      </div>

      {/* ---------------- CANCELLED ---------------- */}
      {isCaseCancelled && (
        <div className="text-center py-8">
          <div className="bg-red-50 rounded-2xl p-6 max-w-md mx-auto">
            <FaTimes className="mx-auto text-5xl text-red-300 mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              Mediation Cancelled
            </h3>
            <p className="text-gray-500 mb-4">
              Your mediation has been cancelled. No agreement was created.
            </p>
          </div>
        </div>
      )}

      {/* ---------------- PENDING ---------------- */}
      {isCasePending && (
        <div className="space-y-6">
          <div
            className={`border-2 rounded-xl p-6 ${
              hasSessionData
                ? "bg-yellow-50 border-yellow-200"
                : "bg-gray-50 border-gray-200"
            }`}
          >
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              {hasSessionData
                ? "Upcoming Agreement Session"
                : "Awaiting Session Schedule"}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center">
                <FaCalendarAlt className="mr-3 text-xl text-yellow-600" />
                <div>
                  <p className="font-semibold text-gray-900">Session Date</p>
                  <p className="text-gray-600">
                    {formatDate(agreementData.sessionDate)}
                  </p>
                </div>
              </div>

              <div className="flex items-center">
                <FaClock className="mr-3 text-xl text-yellow-600" />
                <div>
                  <p className="font-semibold text-gray-900">Session Time</p>
                  <p className="text-gray-600">
                    {formatTime(agreementData.sessionDate)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ---------------- ONGOING / COMPLETED ---------------- */}
      {(isCaseOngoing || isCaseCompleted) && (
        <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            Agreement Executed
          </h3>

          {hasAgreementData ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white rounded-lg border border-green-100 p-4">
                <h4 className="font-semibold text-gray-900 mb-4">
                  Agreement Information
                </h4>

                <div className="flex items-center">
                  <FaCalendarCheck className="text-green-600 mr-3 text-xl" />
                  <div>
                    <p className="font-semibold text-gray-900">
                      Agreement Date
                    </p>
                    <p className="text-gray-600">
                      {formatDate(agreementData.agreementDate)}
                    </p>
                  </div>
                </div>

                {agreementData.justifiRepresentative && (
                  <div className="flex items-start mt-4">
                    <FaUserTie className="text-green-600 mr-3 text-xl mt-1" />
                    <div>
                      <p className="font-semibold text-gray-900">
                        JustiFi Representative
                      </p>
                      <p className="text-gray-600">
                        {agreementData.justifiRepresentative.name}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <FaExclamationTriangle className="mx-auto text-5xl text-yellow-300 mb-4" />
              <p className="text-gray-600">Agreement is being processed.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Med_AgreementDetails;
