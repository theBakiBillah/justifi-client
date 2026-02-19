import React from "react";
const MediationHeader = ({ mediation, currentUser }) => {
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "bg-yellow-500 text-white";
      case "ongoing":
        return "bg-blue-500 text-white";
      case "completed":
        return "bg-green-500 text-white";
      case "cancelled":
        return "bg-red-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const getStatusText = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "Pending Review";
      case "ongoing":
        return "Proceedings Ongoing";
      case "completed":
        return "Case Concluded";
      case "cancelled":
        return "Case Cancelled";
      default:
        return status || "Unknown";
    }
  };

  const getUserRole = (mediation, userEmail) => {
    if (!mediation || !userEmail) return "Unknown";

    if (mediation.plaintiffs) {
      const plaintiffs = Array.isArray(mediation.plaintiffs)
        ? mediation.plaintiffs
        : Object.values(mediation.plaintiffs);
      const isPlaintiff = plaintiffs.some(
        (plaintiff) => plaintiff && plaintiff.email === userEmail,
      );
      if (isPlaintiff) return "Plaintiff";
    }

    if (mediation.defendants) {
      const defendants = Array.isArray(mediation.defendants)
        ? mediation.defendants
        : Object.values(mediation.defendants);
      const isDefendant = defendants.some(
        (defendant) => defendant && defendant.email === userEmail,
      );
      if (isDefendant) return "Defendant";
    }

    return "Unknown";
  };

  const userRole = getUserRole(mediation, currentUser?.email);

  return (
    <div
      className="legal-header text-white rounded-xl shadow-lg p-6 mb-8"
      style={{
        background: "linear-gradient(135deg, #1e3a8a 0%, #3730a3 100%)",
      }}
    >
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
        <div className="flex-1">
          <div className="flex items-center mb-3 flex-wrap gap-2">
            <span
              className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-gray bg-opacity-20 backdrop-blur-sm ${getStatusColor(mediation.mediation_status)}`}
            >
              {getStatusText(mediation.mediation_status)}
            </span>
            <span className="font-mono bg-black bg-opacity-20 px-3 py-1 rounded-lg text-sm">
              Case ID: {mediation._id?.slice(-8).toUpperCase() || "N/A"}
            </span>
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                userRole === "Plaintiff"
                  ? "bg-purple-500 text-white"
                  : userRole === "Defendant"
                    ? "bg-emerald-500 text-white"
                    : "bg-gray-500 text-white"
              }`}
            >
              Your Role: {userRole}
            </span>
          </div>
          <h1 className="text-3xl font-bold mb-4">
            {mediation.caseTitle || "Untitled Case"}
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-white bg-opacity-10 p-4 rounded-lg backdrop-blur-sm">
              <p className="text-gray-600 text-xl font-bold mb-1">Suit Value</p>
              <p className="text-xl font-bold text-blue-600">
                BDT{" "}
                {mediation.suitValue
                  ? parseInt(mediation.suitValue).toLocaleString()
                  : "0"}
              </p>
            </div>
            <div className="bg-white bg-opacity-10 p-4 rounded-lg backdrop-blur-sm">
              <p className="text-gray-600 text-xl font-bold mb-1">
                Case Category
              </p>
              <p className="text-xl font-bold text-blue-600">
                {mediation.caseCategory || "General"}
              </p>
            </div>
            <div className="bg-white bg-opacity-10 p-4 rounded-lg backdrop-blur-sm">
              <p className="text-gray-600 text-xl font-bold mb-1">
                Processing Fee
              </p>
              <p className="text-xl font-bold text-blue-600">
                BDT {mediation.processingFee || "0"}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-blue-200 text-sm font-medium">
                Payment Status
              </p>
              <p className="text-2xl font-bold text-green-300">
                {mediation.payment_status ? "Paid" : "Pending"}
              </p>
            </div>
            <div className="text-center">
              <p className="text-orange-300 text-sm font-medium">Filed Date</p>
              <p className="text-2xl font-bold text-orange-300">
                {mediation.submissionDate
                  ? new Date(mediation.submissionDate).toLocaleDateString()
                  : "Not specified"}
              </p>
            </div>
            <div className="text-center">
              <p className="text-purple-300 text-sm font-medium">
                Last Updated
              </p>
              <p className="text-2xl font-bold text-purple-300">
                {mediation.updatedAt
                  ? new Date(mediation.updatedAt).toLocaleDateString()
                  : "Not specified"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MediationHeader;
