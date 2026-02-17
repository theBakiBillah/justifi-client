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
} from "react-icons/fa";
import { useQuery } from "@tanstack/react-query";
import useAxiosPublic from "../../../hooks/useAxiosPublic";

const LawyerArbClientInformation = ({ parties, currentLawyerEmail }) => {
  const axiosPublic = useAxiosPublic();

  // Fetch all users data to get real photos
  const { data: usersData = [], isLoading } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const response = await axiosPublic.get("/users");
      return response.data;
    },
  });

  // Helper function to get user photo by email
  const getUserPhoto = (email) => {
    const user = usersData.find((user) => user.email === email);
    return (
      user?.photo ||
      "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=150&h=150&fit=crop&crop=center"
    );
  };

  // Helper function to check if lawyer's case status is canceled
  const isLawyerCaseCanceled = (party, lawyerEmail) => {
    if (party.representatives && Array.isArray(party.representatives)) {
      const lawyerRep = party.representatives.find(
        (rep) => rep.email === lawyerEmail,
      );
      return lawyerRep?.case_status === "canceled";
    }
    return false;
  };

  // Collect all evidence from all parties
  const getAllEvidence = () => {
    if (!parties) return [];

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

  // Get party type color and icon
  const getPartyTypeStyles = (partyType) => {
    if (partyType === "Plaintiff") {
      return {
        bg: "bg-purple-100",
        text: "text-purple-800",
        border: "border-purple-200",
        icon: <FaUserTie className="text-purple-600" />,
        label: "Plaintiff",
      };
    } else {
      return {
        bg: "bg-emerald-100",
        text: "text-emerald-800",
        border: "border-emerald-200",
        icon: <FaGavel className="text-emerald-600" />,
        label: "Defendant",
      };
    }
  };

  // Check if any party has canceled representation
  const hasCanceledRepresentation = parties?.some((party) =>
    isLawyerCaseCanceled(party, currentLawyerEmail),
  );

  const allEvidence = getAllEvidence();
  const totalEvidence = allEvidence.length;

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-100">
        <div className="flex items-center mb-6">
          <div className="w-1 h-8 bg-blue-600 rounded-full mr-3"></div>
          <h2 className="text-2xl font-bold text-gray-900">
            <FaBalanceScale className="inline mr-3 text-blue-600" />
            Case Parties & Evidence
          </h2>
        </div>
        <div className="space-y-6">
          {[1, 2].map((item) => (
            <div
              key={item}
              className="bg-white rounded-lg p-6 shadow-sm border-l-4 border-blue-500 animate-pulse"
            >
              <div className="flex items-start mb-4">
                <div className="w-16 h-16 bg-gray-300 rounded-lg"></div>
                <div className="ml-4 flex-1">
                  <div className="h-6 bg-gray-300 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-1"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              </div>
            </div>
          ))}
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

      {/* Stats Summary */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 rounded-lg p-3 text-center border border-blue-100">
          <span className="text-sm font-medium text-blue-800">
            Total Parties
          </span>
          <p className="text-2xl font-bold text-blue-600">
            {parties?.length || 0}
          </p>
        </div>
        <div className="bg-purple-50 rounded-lg p-3 text-center border border-purple-100">
          <span className="text-sm font-medium text-purple-800">
            Plaintiffs
          </span>
          <p className="text-2xl font-bold text-purple-600">
            {parties?.filter((p) => p.partyType === "Plaintiff").length || 0}
          </p>
        </div>
        <div className="bg-emerald-50 rounded-lg p-3 text-center border border-emerald-100">
          <span className="text-sm font-medium text-emerald-800">
            Defendants
          </span>
          <p className="text-2xl font-bold text-emerald-600">
            {parties?.filter((p) => p.partyType === "Defendant").length || 0}
          </p>
        </div>
      </div>

      {/* Parties Information */}
      <div className="space-y-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center">
          <FaUserTie className="mr-2 text-blue-600" />
          Parties Involved
        </h3>

        {parties?.map((party) => {
          const partyPhoto = getUserPhoto(party.email);
          const isCanceled = isLawyerCaseCanceled(party, currentLawyerEmail);
          const partyStyles = getPartyTypeStyles(party.partyType);

          return (
            <div
              key={party.id}
              className={`bg-white rounded-lg p-6 shadow-sm border-l-4 ${
                isCanceled ? "border-gray-400 bg-gray-50" : partyStyles.border
              } hover:shadow-md transition-all duration-300`}
            >
              <div className="flex items-start">
                <div className="relative">
                  <img
                    src={partyPhoto}
                    alt={party.name}
                    className={`w-16 h-16 rounded-lg object-cover border-2 ${
                      isCanceled ? "border-gray-300" : partyStyles.border
                    } shadow-sm`}
                    onError={(e) => {
                      e.target.src =
                        "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=150&h=150&fit=crop&crop=center";
                    }}
                  />
                  <div
                    className={`absolute -top-1 -right-1 rounded-full w-6 h-6 flex items-center justify-center text-xs shadow-sm ${
                      isCanceled
                        ? "bg-gray-500 text-white"
                        : partyStyles.bg + " " + partyStyles.text
                    }`}
                  >
                    {party.partyType === "Plaintiff" ? (
                      <FaUserTie />
                    ) : (
                      <FaGavel />
                    )}
                  </div>
                </div>
                <div className="ml-4 flex-1">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h3
                      className={`font-bold text-lg ${
                        isCanceled ? "text-gray-600" : "text-gray-900"
                      }`}
                    >
                      {party.name}
                    </h3>
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${partyStyles.bg} ${partyStyles.text}`}
                    >
                      {partyStyles.icon}
                      <span className="ml-1">{party.partyType}</span>
                    </span>
                    {isCanceled && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-200 text-gray-700 gap-1">
                        <FaTimesCircle className="text-gray-500" />
                        Representation Ended
                      </span>
                    )}
                  </div>

                  <p
                    className={`text-sm mb-1 flex items-center ${
                      isCanceled ? "text-gray-500" : "text-gray-600"
                    }`}
                  >
                    <FaEnvelope
                      className={`inline mr-2 text-xs ${
                        isCanceled ? "text-gray-400" : "text-blue-500"
                      }`}
                    />
                    {party.email}
                  </p>
                  <p
                    className={`text-sm flex items-center ${
                      isCanceled ? "text-gray-500" : "text-gray-600"
                    }`}
                  >
                    <FaPhone
                      className={`inline mr-2 text-xs ${
                        isCanceled ? "text-gray-400" : "text-blue-500"
                      }`}
                    />
                    {party.phone}
                  </p>
                  <p
                    className={`text-sm flex items-start mt-2 ${
                      isCanceled ? "text-gray-500" : "text-gray-700"
                    }`}
                  >
                    <FaMapMarkerAlt
                      className={`inline mr-2 text-xs mt-1 flex-shrink-0 ${
                        isCanceled ? "text-gray-400" : "text-blue-500"
                      }`}
                    />
                    <span>{party.address}</span>
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Unified Evidence Section */}
      {!hasCanceledRepresentation ? (
        <div className="border-t pt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center">
              <FaFolderOpen className="mr-2 text-blue-600" />
              All Case Evidence ({totalEvidence} documents)
            </h3>
          </div>

          {totalEvidence > 0 ? (
            <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
              {allEvidence.map((evidence, index) => {
                const partyStyles = getPartyTypeStyles(evidence.partyType);

                return (
                  <div
                    key={index}
                    className="bg-gray-50 border border-gray-200 rounded-lg p-4 flex items-center justify-between hover:translate-x-1 hover:bg-gray-100 transition-all duration-300"
                  >
                    <div className="flex items-center flex-1">
                      <FaFilePdf className="text-red-500 text-xl mr-3" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium text-gray-800 text-sm">
                            {evidence.name}
                          </p>
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${partyStyles.bg} ${partyStyles.text}`}
                          >
                            {partyStyles.icon}
                            <span className="ml-1">{evidence.partyType}</span>
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-gray-500">
                          <span>Submitted by: {evidence.submittedBy}</span>
                          <span>•</span>
                          <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                            {evidence.type}
                          </span>
                          <span>•</span>
                          <span>
                            Date: {new Date(evidence.date).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <button className="text-blue-600 hover:text-blue-800 p-2 rounded transition-colors ml-4">
                      <FaDownload />
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
              <FaFolderOpen className="text-gray-400 text-4xl mx-auto mb-3" />
              <p className="text-gray-600 font-medium">No Evidence Submitted</p>
              <p className="text-gray-500 text-sm mt-1">
                No evidence has been submitted by any party in this case yet.
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="border-t pt-6">
          <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
            <FaTimesCircle className="text-gray-400 text-4xl mx-auto mb-3" />
            <p className="text-gray-600 font-medium">
              Evidence Access Restricted
            </p>
            <p className="text-gray-500 text-sm mt-1">
              Your representation has been canceled. Evidence access is no
              longer available.
            </p>
          </div>
        </div>
      )}

      {/* Empty State */}
      {(!parties || parties.length === 0) && (
        <div className="text-center py-8">
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
    </div>
  );
};

export default LawyerArbClientInformation;
