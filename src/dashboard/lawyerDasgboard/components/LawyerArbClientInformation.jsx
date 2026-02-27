import React, { useState, useEffect } from "react";
import {
  FaBalanceScale,
  FaUserTie,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaFolderOpen,
  FaFilePdf,
  FaDownload,
  FaEye,
  FaCalendarAlt,
  FaClock,
  FaTimesCircle,
  FaGavel,
  FaUserPlus,
  FaUsers,
} from "react-icons/fa";
import { useQuery } from "@tanstack/react-query";
import useAxiosPublic from "../../../hooks/useAxiosPublic";

// ─── Single Party File Card (PlaintifDefendantDocument style) ─────────────────
const PartyFileCard = ({ party, color, arbitrationId, axiosPublic }) => {
  const palette = {
    blue: {
      cardBorder: "border-blue-300",
      cardHeaderBg: "bg-blue-50",
      cardHeaderBorder: "border-blue-200",
      iconColor: "text-blue-600",
      avatarBorder: "border-blue-300",
      folderIcon: "text-blue-500",
      countBadge: "bg-blue-100 text-blue-700 border-blue-200",
      hoverDoc: "hover:border-blue-300 hover:bg-blue-50",
      scrollHint: "text-blue-400",
    },
    red: {
      cardBorder: "border-red-300",
      cardHeaderBg: "bg-red-50",
      cardHeaderBorder: "border-red-200",
      iconColor: "text-red-600",
      avatarBorder: "border-red-300",
      folderIcon: "text-red-500",
      countBadge: "bg-red-100 text-red-700 border-red-200",
      hoverDoc: "hover:border-red-300 hover:bg-red-50",
      scrollHint: "text-red-400",
    },
  }[color];

  const handleViewFile = async (fileName) => {
    try {
      const response = await axiosPublic.get(`/arbitrationFile/viewFile`, {
        params: { arbitrationId, email: party.email, fileName },
        responseType: "blob",
      });
      const contentType = response.headers["content-type"] || "application/pdf";
      const blob = new Blob([response.data], { type: contentType });
      const blobUrl = window.URL.createObjectURL(blob);
      window.open(blobUrl, "_blank");
      setTimeout(() => window.URL.revokeObjectURL(blobUrl), 1000);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to view file");
    }
  };

  const handleDownloadFile = async (fileName) => {
    try {
      const response = await axiosPublic.get(`/arbitrationFile/downloadFile`, {
        params: { arbitrationId, email: party.email, fileName },
        responseType: "blob",
      });
      const contentType =
        response.headers["content-type"] || "application/octet-stream";
      const blob = new Blob([response.data], { type: contentType });
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => window.URL.revokeObjectURL(blobUrl), 500);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to download file");
    }
  };

  return (
    <div
      className={`border-2 ${palette.cardBorder} rounded-xl shadow-md overflow-hidden bg-white hover:shadow-lg transition-shadow`}
    >
      {/* Party Header */}
      <div
        className={`${palette.cardHeaderBg} px-4 py-3 border-b-2 ${palette.cardHeaderBorder}`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div
              className={`w-10 h-10 bg-white rounded-full flex items-center justify-center border-2 ${palette.avatarBorder}`}
            >
              <FaUserTie className={`${palette.iconColor} text-base`} />
            </div>
            <div className="ml-3">
              <h3 className="font-bold text-gray-800">{party.name}</h3>
              <p className="text-xs text-gray-500">{party.email}</p>
            </div>
          </div>
          <span
            className={`${palette.countBadge} border text-xs font-semibold px-3 py-1 rounded-full`}
          >
            {party.files.length} doc{party.files.length !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {/* Documents */}
      <div className="p-4">
        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center">
          <FaFolderOpen className={`${palette.folderIcon} mr-2`} />
          Documents
        </h4>

        {party.files.length === 0 ? (
          <div className="text-center py-6 bg-gray-50 rounded-lg border border-dashed border-gray-200">
            <FaFolderOpen className="mx-auto text-3xl text-gray-200 mb-2" />
            <p className="text-gray-400 text-xs">No documents submitted</p>
          </div>
        ) : (
          <>
            <div
              className={`${
                party.files.length > 3 ? "max-h-52 overflow-y-auto pr-1" : ""
              } space-y-2`}
            >
              {party.files.map((doc) => (
                <div
                  key={doc.fileName}
                  className={`flex items-center justify-between bg-gray-50 p-3 rounded-lg border border-gray-200 ${palette.hoverDoc} transition-colors`}
                >
                  {/* File info */}
                  <div className="flex items-center flex-1 min-w-0">
                    <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center mr-3 flex-shrink-0">
                      <FaFilePdf className="text-red-500 text-sm" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">
                        {doc.fileTitle}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-gray-400 mt-0.5">
                        <span className="flex items-center gap-1">
                          <FaCalendarAlt />
                          {new Date(doc.uploadedAt).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <FaClock />
                          {new Date(doc.uploadedAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-1 ml-2 flex-shrink-0">
                    <button
                      onClick={() => handleViewFile(doc.fileName)}
                      className="text-blue-600 hover:text-blue-800 p-2 hover:bg-blue-100 rounded-lg transition-colors"
                      title="View"
                    >
                      <FaEye className="text-sm" />
                    </button>
                    <button
                      onClick={() => handleDownloadFile(doc.fileName)}
                      className="text-green-600 hover:text-green-800 p-2 hover:bg-green-100 rounded-lg transition-colors"
                      title="Download"
                    >
                      <FaDownload className="text-sm" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {party.files.length > 3 && (
              <p className={`text-xs ${palette.scrollHint} text-right mt-2`}>
                ↓ Scroll for more
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
};

// ─── Party File Panel (Plaintiffs / Defendants) ───────────────────────────────
const PartyFilePanel = ({
  title,
  parties,
  color,
  arbitrationId,
  axiosPublic,
}) => {
  const palette = {
    blue: {
      gradient: "from-blue-600 to-blue-700",
      badge: "bg-white text-blue-600",
    },
    red: {
      gradient: "from-red-600 to-red-700",
      badge: "bg-white text-red-600",
    },
  }[color];

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden flex-1">
      {/* Panel Header */}
      <div className={`bg-gradient-to-r ${palette.gradient} px-6 py-4`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="bg-white bg-opacity-20 p-2 rounded-lg">
              <FaUserTie className="text-white text-xl" />
            </div>
            <h2 className="text-xl font-bold text-white ml-3">{title}</h2>
          </div>
          <span
            className={`${palette.badge} text-sm font-bold px-3 py-1 rounded-full`}
          >
            {parties.length} {parties.length === 1 ? "Party" : "Parties"}
          </span>
        </div>
      </div>

      {/* Party Cards */}
      <div className="p-4 space-y-4">
        {parties.length === 0 ? (
          <div className="text-center py-12">
            <FaFolderOpen className="mx-auto text-5xl text-gray-200 mb-3" />
            <p className="text-gray-400 text-sm">
              No {title.toLowerCase()} found
            </p>
          </div>
        ) : (
          parties.map((party, idx) => (
            <PartyFileCard
              key={party.partyId || idx}
              party={party}
              color={color}
              arbitrationId={arbitrationId}
              axiosPublic={axiosPublic}
            />
          ))
        )}
      </div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const LawyerArbClientInformation = ({
  parties = [],
  currentLawyerEmail,
  appointedClient,
  arbitrationId,
}) => {
  const axiosPublic = useAxiosPublic();

  // Fetch all users data (for photos)
  const { data: usersData = [], isLoading } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const response = await axiosPublic.get("/users");
      return response.data;
    },
  });

  // Fetch uploaded documents from arbitration_files collection
  const [uploadedPlaintiffs, setUploadedPlaintiffs] = useState([]);
  const [uploadedDefendants, setUploadedDefendants] = useState([]);
  const [filesLoading, setFilesLoading] = useState(true);
  const [filesError, setFilesError] = useState(null);

  useEffect(() => {
    const fetchFiles = async () => {
      if (!arbitrationId) {
        setFilesLoading(false);
        return;
      }
      setFilesLoading(true);
      setFilesError(null);
      try {
        const res = await axiosPublic.get("/allPartyFiles", {
          params: { arbitrationId },
        });
        setUploadedPlaintiffs(res.data.plaintiffs || []);
        setUploadedDefendants(res.data.defendants || []);
      } catch (err) {
        console.error("Failed to fetch party files:", err);
        setFilesError("Failed to load documents. Please try again.");
      } finally {
        setFilesLoading(false);
      }
    };
    fetchFiles();
  }, [arbitrationId]);

  const totalDocs =
    uploadedPlaintiffs.reduce((sum, p) => sum + (p.files?.length || 0), 0) +
    uploadedDefendants.reduce((sum, d) => sum + (d.files?.length || 0), 0);

  // Get user photo by email
  const getUserPhoto = (email) => {
    const user = usersData.find((u) => u.email === email);
    return (
      user?.photo ||
      "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=150&h=150&fit=crop&crop=center"
    );
  };

  // Check if lawyer's representation is canceled
  const isLawyerCaseCanceled = (party, lawyerEmail) => {
    if (party.representatives && Array.isArray(party.representatives)) {
      const lawyerRep = party.representatives.find(
        (rep) => rep.email === lawyerEmail,
      );
      return lawyerRep?.case_status === "cancelled";
    }
    return false;
  };

  // Split parties
  const plaintiffs = parties.filter((p) => p.partyType === "Plaintiff");
  const defendants = parties.filter((p) => p.partyType === "Defendant");

  const hasCanceledRepresentation = parties.some((party) =>
    isLawyerCaseCanceled(party, currentLawyerEmail),
  );

  // Render party info card (contact info only — top section)
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
          <img
            src={partyPhoto}
            alt={party.name}
            className="w-16 h-16 rounded-lg object-cover border-2 shadow-sm"
            onError={(e) => {
              e.target.src =
                "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=150&h=150&fit=crop&crop=center";
            }}
          />
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
      {/* Section Header */}
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

      {/* Appointed Client */}
      {appointedClient && (
        <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="text-sm font-semibold text-blue-800 mb-3 flex items-center gap-2">
            <FaUserPlus className="text-blue-600" />
            Your Client
          </h3>
          <div className="flex items-start gap-3">
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

      {/* Two-Column Party Info Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div>
          <h3 className="font-semibold text-purple-700 mb-3 flex items-center gap-2">
            <FaUserTie /> Plaintiffs ({plaintiffs.length})
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
        <div>
          <h3 className="font-semibold text-emerald-700 mb-3 flex items-center gap-2">
            <FaGavel /> Defendants ({defendants.length})
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

      {/* ── All Case Evidence — PlaintifDefendantDocument style ─────────────── */}
      <div className="border-t pt-6">
        <div className="flex items-center mb-6">
          <div className="w-1 h-6 bg-indigo-600 rounded-full mr-3"></div>
          <h3 className="text-lg font-semibold text-gray-800 flex items-center">
            <FaFolderOpen className="mr-2 text-indigo-600" />
            All Case Evidence ({totalDocs} documents)
          </h3>
        </div>

        {hasCanceledRepresentation ? (
          <div className="text-center py-8 bg-gray-50 rounded-xl border border-gray-200">
            <FaTimesCircle className="text-gray-400 text-4xl mx-auto mb-3" />
            <p className="text-gray-600 font-medium">
              Evidence Access Restricted
            </p>
            <p className="text-gray-500 text-sm mt-1">
              Your representation has been canceled.
            </p>
          </div>
        ) : filesLoading ? (
          <div className="text-center py-12 text-gray-400">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            Loading documents...
          </div>
        ) : filesError ? (
          <div className="text-center py-10 text-red-500 bg-red-50 rounded-xl">
            {filesError}
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-6">
            <PartyFilePanel
              title="Plaintiffs"
              parties={uploadedPlaintiffs}
              color="blue"
              arbitrationId={arbitrationId}
              axiosPublic={axiosPublic}
            />
            <PartyFilePanel
              title="Defendants"
              parties={uploadedDefendants}
              color="red"
              arbitrationId={arbitrationId}
              axiosPublic={axiosPublic}
            />
          </div>
        )}
      </div>

      {/* Empty State */}
      {parties.length === 0 && (
        <div className="text-center py-12 mt-4">
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
