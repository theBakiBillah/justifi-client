import React from "react";
import {
  FaBalanceScale,
  FaUserTie,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaFolderOpen,
  FaFilePdf,
  FaDownload,
  FaTimesCircle,
  FaGavel,
  FaUserPlus,
  FaBriefcase,
  FaUsers,
} from "react-icons/fa";
import { useQuery } from "@tanstack/react-query";
import useAxiosPublic from "../../../hooks/useAxiosPublic";

const LawyerArbClientInformation = ({
  parties = [],
  currentLawyerEmail,
  appointedClient,
}) => {
  const axiosPublic = useAxiosPublic();

  // Fetch all users data (for real photos)
  const { data: usersData = [], isLoading } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const response = await axiosPublic.get("/users");
      return response.data;
    },
  });

  // Get user photo by email
  const getUserPhoto = (email) => {
    const user = usersData.find((user) => user.email === email);
    return (
      user?.photo ||
      "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=150&h=150&fit=crop&crop=center"
    );
  };

  // Check if lawyer's case status is canceled
  const isLawyerCaseCanceled = (party, lawyerEmail) => {
    if (party.representatives && Array.isArray(party.representatives)) {
      const lawyerRep = party.representatives.find(
        (rep) => rep.email === lawyerEmail,
      );
      return lawyerRep?.case_status === "cancelled";
    }
    return false;
  };

  // Collect all evidence from all parties
  const getAllEvidence = () => {
    const allEvidence = [];

    parties.forEach((party) => {
      if (party.evidence && Array.isArray(party.evidence)) {
        party.evidence.forEach((evidence) => {
          allEvidence.push({
            ...evidence,
            submittedBy: party.name,
            submittedByEmail: party.email,
            partyType: party.partyType,
          });
        });
      }
    });

    return allEvidence;
  };

  // Get party styling
  const getPartyTypeStyles = (partyType) => {
    if (partyType === "Plaintiff") {
      return {
        bg: "bg-purple-100",
        text: "text-purple-800",
        border: "border-purple-200",
        icon: <FaUserTie className="text-purple-600" />,
        lightBg: "bg-purple-50",
      };
    } else {
      return {
        bg: "bg-emerald-100",
        text: "text-emerald-800",
        border: "border-emerald-200",
        icon: <FaGavel className="text-emerald-600" />,
        lightBg: "bg-emerald-50",
      };
    }
  };

  // Split parties into plaintiffs and defendants
  const plaintiffs = parties.filter((p) => p.partyType === "Plaintiff");
  const defendants = parties.filter((p) => p.partyType === "Defendant");

  const hasCanceledRepresentation = parties.some((party) =>
    isLawyerCaseCanceled(party, currentLawyerEmail),
  );

  const allEvidence = getAllEvidence();
  const totalEvidence = allEvidence.length;

  // Render party card (simplified design with square photos)
  const renderPartyCard = (party) => {
    const partyPhoto = getUserPhoto(party.email);
    const isCanceled = isLawyerCaseCanceled(party, currentLawyerEmail);
    const isAppointedClient = party.email === appointedClient?.email;

    return (
      <div
        key={party.id}
        className={`bg-white rounded-lg p-4 border ${
          isCanceled
            ? "border-gray-300 bg-gray-50"
            : isAppointedClient
              ? "border-blue-300 bg-blue-50"
              : "border-gray-200"
        } hover:shadow-sm transition-shadow duration-200`}
      >
        <div className="flex items-start gap-3">
          {/* Square Photo - Not Rounded */}
          <img
            src={partyPhoto}
            alt={party.name}
            className="w-16 h-16 rounded-lg object-cover border-2 shadow-sm"
            onError={(e) => {
              e.target.src =
                "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=150&h=150&fit=crop&crop=center";
            }}
          />

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-bold text-gray-900">{party.name}</h3>
              <span
                className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                  party.partyType === "Plaintiff"
                    ? "bg-purple-100 text-purple-700"
                    : "bg-emerald-100 text-emerald-700"
                }`}
              >
                {party.partyType}
              </span>
              {isAppointedClient && (
                <FaUserPlus className="text-blue-600 text-xs" />
              )}
            </div>

            <p className="text-sm text-gray-600 flex items-center gap-1">
              <FaEnvelope className="text-gray-400 text-xs" />
              {party.email}
            </p>
            <p className="text-sm text-gray-600 flex items-center gap-1">
              <FaPhone className="text-gray-400 text-xs" />
              {party.phone}
            </p>
            <p className="text-sm text-gray-600 flex items-start gap-1">
              <FaMapMarkerAlt className="text-gray-400 text-xs mt-1" />
              <span>{party.address}</span>
            </p>

            {isCanceled && (
              <span className="inline-flex items-center gap-1 text-xs text-gray-500 mt-2">
                <FaTimesCircle />
                Representation ended
              </span>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-100">
        <div className="text-center py-10">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading party information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-100">
      <div className="flex items-center mb-6">
        <div className="w-1 h-8 bg-blue-600 rounded-full mr-3"></div>
        <h2 className="text-2xl font-bold text-gray-900">
          <FaBalanceScale className="inline mr-3 text-blue-600" />
          Case Parties & Evidence
        </h2>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl p-4 text-center border border-blue-200 shadow-sm">
          <FaUsers className="text-blue-600 text-xl mx-auto mb-2" />
          <span className="text-sm font-medium text-blue-800 block">
            Total Parties
          </span>
          <p className="text-3xl font-bold text-blue-600">{parties.length}</p>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-xl p-4 text-center border border-purple-200 shadow-sm">
          <FaUserTie className="text-purple-600 text-xl mx-auto mb-2" />
          <span className="text-sm font-medium text-purple-800 block">
            Plaintiffs
          </span>
          <p className="text-3xl font-bold text-purple-600">
            {plaintiffs.length}
          </p>
        </div>
        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 rounded-xl p-4 text-center border border-emerald-200 shadow-sm">
          <FaGavel className="text-emerald-600 text-xl mx-auto mb-2" />
          <span className="text-sm font-medium text-emerald-800 block">
            Defendants
          </span>
          <p className="text-3xl font-bold text-emerald-600">
            {defendants.length}
          </p>
        </div>
      </div>

      {/* Appointed Client Section with Square Photo */}
      {appointedClient && (
        <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="text-sm font-semibold text-blue-800 mb-3 flex items-center gap-2">
            <FaUserPlus className="text-blue-600" />
            Your Client
          </h3>
          <div className="flex items-start gap-3">
            {/* Square Photo - Not Rounded */}
            <img
              src={getUserPhoto(appointedClient.email)}
              alt={appointedClient.name}
              className="w-16 h-16 rounded-lg object-cover border-2 shadow-sm"
              onError={(e) => {
                e.target.src =
                  "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=150&h=150&fit=crop&crop=center";
              }}
            />
            <div>
              <p className="font-medium text-gray-900">
                {appointedClient.name}
              </p>
              <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                <FaEnvelope className="text-gray-400 text-xs" />
                {appointedClient.email}
              </p>
              <p className="text-sm text-gray-600 flex items-center gap-1">
                <FaPhone className="text-gray-400 text-xs" />
                {appointedClient.phone}
              </p>
              <p className="text-sm text-gray-600 flex items-start gap-1">
                <FaMapMarkerAlt className="text-gray-400 text-xs mt-1" />
                {appointedClient.address}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Two-Column Party Layout with Independent Scrolling */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {/* Plaintiffs Column */}
        <div>
          <h3 className="font-semibold text-purple-700 mb-3 flex items-center gap-2">
            <FaUserTie />
            Plaintiffs ({plaintiffs.length})
          </h3>
          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            {plaintiffs.length > 0 ? (
              plaintiffs.map((party) => renderPartyCard(party))
            ) : (
              <div className="text-center py-8 bg-white rounded-lg border border-purple-100">
                <FaUserTie className="text-purple-300 text-4xl mx-auto mb-2" />
                <p className="text-gray-500 text-sm">No plaintiffs</p>
              </div>
            )}
          </div>
        </div>

        {/* Defendants Column */}
        <div>
          <h3 className="font-semibold text-emerald-700 mb-3 flex items-center gap-2">
            <FaGavel />
            Defendants ({defendants.length})
          </h3>
          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            {defendants.length > 0 ? (
              defendants.map((party) => renderPartyCard(party))
            ) : (
              <div className="text-center py-8 bg-white rounded-lg border border-emerald-100">
                <FaGavel className="text-emerald-300 text-4xl mx-auto mb-2" />
                <p className="text-gray-500 text-sm">No defendants</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Evidence Section - PRESERVED ORIGINAL DESIGN */}
      {!hasCanceledRepresentation ? (
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center mb-4">
            <FaFolderOpen className="mr-2 text-blue-600" />
            All Case Evidence ({totalEvidence} documents)
          </h3>

          {totalEvidence > 0 ? (
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {allEvidence.map((evidence, index) => {
                const styles = getPartyTypeStyles(evidence.partyType);
                return (
                  <div
                    key={index}
                    className="bg-gray-50 border border-gray-200 rounded-xl p-4 flex items-center justify-between hover:shadow-md transition-all duration-300"
                  >
                    <div className="flex items-center flex-1 min-w-0">
                      <FaFilePdf className="text-red-500 text-xl mr-3 flex-shrink-0" />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <p className="font-medium text-sm text-gray-800 truncate max-w-[200px]">
                            {evidence.name}
                          </p>
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${styles.bg} ${styles.text} flex-shrink-0`}
                          >
                            {styles.icon}
                            <span className="ml-1">{evidence.partyType}</span>
                          </span>
                        </div>
                        <p className="text-xs text-gray-500">
                          Submitted by: {evidence.submittedBy} •{" "}
                          {new Date(evidence.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <button className="text-blue-600 hover:text-blue-800 p-2 rounded-lg hover:bg-blue-50 transition-colors ml-2 flex-shrink-0">
                      <FaDownload />
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 bg-gray-50 rounded-xl border border-gray-200">
              <FaFolderOpen className="text-gray-400 text-4xl mx-auto mb-3" />
              <p className="text-gray-600 font-medium">No Evidence Submitted</p>
              <p className="text-gray-500 text-sm mt-1">
                No evidence has been submitted by any party yet.
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="border-t pt-6">
          <div className="text-center py-8 bg-gray-50 rounded-xl border border-gray-200">
            <FaTimesCircle className="text-gray-400 text-4xl mx-auto mb-3" />
            <p className="text-gray-600 font-medium">
              Evidence Access Restricted
            </p>
            <p className="text-gray-500 text-sm mt-1">
              Your representation has been canceled.
            </p>
          </div>
        </div>
      )}

      {/* Empty State */}
      {parties.length === 0 && (
        <div className="text-center py-12">
          <div className="bg-gray-50 rounded-2xl p-8 max-w-md mx-auto">
            <FaUserTie className="text-6xl text-gray-300 mb-4 mx-auto" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No Party Information
            </h3>
            <p className="text-gray-500">
              Party information is not available for this case.
            </p>
          </div>
        </div>
      )}

      {/* Custom Scrollbar Styles */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e0;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </div>
  );
};

export default LawyerArbClientInformation;
