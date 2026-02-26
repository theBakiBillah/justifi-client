import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import SessionModal from "./SessionModal";

const AdminMediationDetails = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedMediation, setSelectedMediation] = useState(null);
  const [isSessionModalOpen, setIsSessionModalOpen] = useState(false);

  // Get mediation data from navigation state
  const mediation = location.state?.mediation;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusBadge = (status) => {
    const statusStyles = {
      Pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
      "In Progress": "bg-blue-100 text-blue-800 border-blue-200",
      Ongoing: "bg-blue-100 text-blue-800 border-blue-200",
      Completed: "bg-green-100 text-green-800 border-green-200",
      Cancelled: "bg-red-100 text-red-800 border-red-200",
      Rejected: "bg-red-100 text-red-800 border-red-200",
    };
    return (
      <span
        className={`px-3 py-1 rounded-full text-sm font-medium border ${
          statusStyles[status] || "bg-gray-100 text-gray-800 border-gray-200"
        }`}
      >
        {status || "Pending"}
      </span>
    );
  };

  const getPaymentBadge = (status) => {
    return status ? (
      <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 border border-green-200">
        Paid
      </span>
    ) : (
      <span className="px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800 border border-red-200">
        Unpaid
      </span>
    );
  };

  const openSessionModal = (mediation) => {
    setSelectedMediation(mediation);
    setIsSessionModalOpen(true);
  };

  const closeSessionModal = () => {
    setIsSessionModalOpen(false);
    setSelectedMediation(null);
  };

  // Helper function to convert plaintiffs/defendants object to array
  const getPartiesArray = (partiesObject) => {
    if (!partiesObject) return [];
    if (Array.isArray(partiesObject)) return partiesObject;
    // If it's an object with ids as keys, convert to array
    return Object.values(partiesObject);
  };

  // Show loading if no mediation data in state
  if (!mediation) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-400 text-6xl mb-4">⚖️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            No Case Data
          </h2>
          <p className="text-gray-600 mb-4">
            Please navigate to this page from the mediations list.
          </p>
          <button
            onClick={() => navigate("/admin/mediations-management")}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Back to Mediations
          </button>
        </div>
      </div>
    );
  }

  // Convert plaintiffs and defendants to arrays
  const plaintiffsArray = getPartiesArray(mediation.plaintiffs);
  const defendantsArray = getPartiesArray(mediation.defendants);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <button
                onClick={() => navigate("/admin/mediations-management")}
                className="flex items-center text-blue-600 hover:text-blue-800 mb-4 transition-colors"
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
                Back to Mediations
              </button>
              <h1 className="text-3xl font-bold text-gray-900">
                Mediation Case Details
              </h1>
              <p className="text-gray-600 mt-2">
                Complete information about the mediation case
              </p>
            </div>
            <div className="flex items-center space-x-4">
              {getStatusBadge(mediation.mediation_status)}
              {getPaymentBadge(mediation.payment_status)}
            </div>
          </div>
        </div>

        {/* Case Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Case Information */}
          <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Case Information
            </h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500 block mb-1">
                  Case Title
                </label>
                <p className="text-lg font-medium text-gray-800">
                  {mediation.caseTitle}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500 block mb-1">
                  Case ID
                </label>
                <p className="text-gray-800 font-mono">
                  {mediation.caseId || mediation._id}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500 block mb-1">
                  Mediation ID
                </label>
                <p className="text-gray-800 font-mono">
                  {mediation.mediationId}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500 block mb-1">
                  Category
                </label>
                <p className="text-gray-800">{mediation.caseCategory}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500 block mb-1">
                  Dispute Nature
                </label>
                <p className="text-gray-800">{mediation.disputeNature}</p>
              </div>
            </div>
          </div>

          {/* Financial Information */}
          <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Financial Information
            </h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500 block mb-1">
                  Suit Value
                </label>
                <p className="text-2xl font-bold text-gray-800">
                  ${mediation.suitValue}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500 block mb-1">
                  Processing Fee
                </label>
                <p className="text-xl font-semibold text-gray-800">
                  ${mediation.processingFee}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500 block mb-1">
                  Total Cost
                </label>
                <p className="text-lg font-medium text-gray-800">
                  ${mediation.totalCost}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500 block mb-1">
                  Submission Date
                </label>
                <p className="text-gray-800">
                  {formatDate(mediation.submissionDate)}
                </p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Quick Actions
            </h2>
            <div className="space-y-3">
              {!mediation?.sessions && (
                <button
                  onClick={() => openSessionModal(mediation)}
                  className="w-full px-4 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors font-medium"
                >
                  Schedule Session
                </button>
              )}
              {mediation?.sessions && (
                <button
                  onClick={() => openSessionModal(mediation)}
                  className="w-full px-4 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors font-medium"
                >
                  Update Session
                </button>
              )}
              {mediation.mediation_status === "pending" && (
                <button
                  onClick={() =>
                    navigate(`/admin/mediations/${mediation._id}/cancel`, {
                      state: { mediation },
                    })
                  }
                  className="w-full px-4 py-3 bg-red-700 text-white rounded-md hover:bg-red-800 transition-colors font-medium"
                >
                  Cancel Case
                </button>
              )}
              {mediation.mediation_status === "ongoing" && (
                <button
                  onClick={() =>
                    navigate(`/admin/mediation-agreement/${mediation._id}`, {
                      state: { mediation },
                    })
                  }
                  className="w-full px-4 py-3 bg-violet-600 text-white rounded-md hover:bg-violet-700 transition-colors font-medium"
                >
                  Create Agreement
                </button>
              )}
              <button
                onClick={() =>
                  navigate(`/admin/mediations/${mediation._id}/documents`, {
                    state: { mediation },
                  })
                }
                className="w-full px-4 py-3 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors font-medium"
              >
                View Documents
              </button>
            </div>
          </div>
        </div>

        {/* Arbitrators Information */}
        <div className="mb-8">
          <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800">
                Arbitrators
              </h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Presiding Arbitrator */}
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                  <h3 className="font-semibold text-blue-800 mb-2">
                    Presiding Arbitrator
                  </h3>
                  <div className="space-y-2">
                    <p className="text-gray-800 font-medium">
                      {mediation.presidingArbitrator || "Not assigned"}
                    </p>
                    {mediation.presidingArbitratorEmail && (
                      <p className="text-sm text-gray-600">
                        {mediation.presidingArbitratorEmail}
                      </p>
                    )}
                  </div>
                </div>

                {/* Arbitrator 1 */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-700 mb-2">
                    Arbitrator 1
                  </h3>
                  <div className="space-y-2">
                    <p className="text-gray-800 font-medium">
                      {mediation.arbitrator1 || "Not assigned"}
                    </p>
                    {mediation.arbitrator1Email && (
                      <p className="text-sm text-gray-600">
                        {mediation.arbitrator1Email}
                      </p>
                    )}
                  </div>
                </div>

                {/* Arbitrator 2 */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-700 mb-2">
                    Arbitrator 2
                  </h3>
                  <div className="space-y-2">
                    <p className="text-gray-800 font-medium">
                      {mediation.arbitrator2 || "Not assigned"}
                    </p>
                    {mediation.arbitrator2Email && (
                      <p className="text-sm text-gray-600">
                        {mediation.arbitrator2Email}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Justifi Information */}
        <div className="mb-8">
          <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800">
                Justifi Representative
              </h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="text-sm font-medium text-gray-500 block mb-1">
                    Name
                  </label>
                  <p className="text-gray-800 font-medium">
                    {mediation.justifiName || "Not assigned"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 block mb-1">
                    Designation
                  </label>
                  <p className="text-gray-800">
                    {mediation.justifiDesignation || "Not assigned"}
                  </p>
                </div>
                {mediation.justifiEmail && (
                  <div>
                    <label className="text-sm font-medium text-gray-500 block mb-1">
                      Email
                    </label>
                    <p className="text-gray-800">{mediation.justifiEmail}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Parties Information */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Plaintiffs */}
          <div className="bg-white rounded-lg shadow border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800">
                Plaintiff(s)
              </h2>
            </div>
            <div className="p-6">
              {plaintiffsArray.map((plaintiff, index) => (
                <div
                  key={plaintiff.id || index}
                  className="bg-gray-50 rounded-lg p-4 mb-4 last:mb-0"
                >
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">
                    {plaintiff.name}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500 block mb-1">
                        Parents Name
                      </label>
                      <p className="text-gray-800">{plaintiff.parentsName}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500 block mb-1">
                        Occupation
                      </label>
                      <p className="text-gray-800">{plaintiff.occupation}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500 block mb-1">
                        Email
                      </label>
                      <p className="text-gray-800">{plaintiff.email}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500 block mb-1">
                        Phone
                      </label>
                      <p className="text-gray-800">{plaintiff.phone}</p>
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-sm font-medium text-gray-500 block mb-1">
                        Address
                      </label>
                      <p className="text-gray-800">{plaintiff.address}</p>
                    </div>
                  </div>
                </div>
              ))}
              {plaintiffsArray.length === 0 && (
                <p className="text-gray-500 italic">
                  No plaintiff information available
                </p>
              )}
            </div>
          </div>

          {/* Defendants */}
          <div className="bg-white rounded-lg shadow border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800">
                Defendant(s)
              </h2>
            </div>
            <div className="p-6">
              {defendantsArray.map((defendant, index) => (
                <div
                  key={defendant.id || index}
                  className="bg-gray-50 rounded-lg p-4 mb-4 last:mb-0"
                >
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">
                    {defendant.name}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500 block mb-1">
                        Parents Name
                      </label>
                      <p className="text-gray-800">{defendant.parentsName}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500 block mb-1">
                        Occupation
                      </label>
                      <p className="text-gray-800">{defendant.occupation}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500 block mb-1">
                        Email
                      </label>
                      <p className="text-gray-800">{defendant.email}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500 block mb-1">
                        Phone
                      </label>
                      <p className="text-gray-800">{defendant.phone}</p>
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-sm font-medium text-gray-500 block mb-1">
                        Address
                      </label>
                      <p className="text-gray-800">{defendant.address}</p>
                    </div>
                  </div>
                </div>
              ))}
              {defendantsArray.length === 0 && (
                <p className="text-gray-500 italic">
                  No defendant information available
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div className="mt-8 bg-white rounded-lg shadow border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Additional Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <label className="text-sm font-medium text-gray-500 block mb-1">
                Agreement Date
              </label>
              <p className="text-gray-800">
                {mediation.agreementDate
                  ? formatDate(mediation.agreementDate)
                  : "Not set"}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500 block mb-1">
                Compliance Days
              </label>
              <p className="text-gray-800">
                {mediation.complianceDays || "Not specified"}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500 block mb-1">
                Sittings
              </label>
              <p className="text-gray-800">
                {mediation.sittings || "Not specified"}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500 block mb-1">
                Last Updated
              </label>
              <p className="text-gray-800">
                {formatDate(mediation.submissionDate)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Create Session Modal */}
      {isSessionModalOpen && selectedMediation && (
        <SessionModal
          mediation={selectedMediation}
          onClose={closeSessionModal}
        />
      )}
    </div>
  );
};

export default AdminMediationDetails;
