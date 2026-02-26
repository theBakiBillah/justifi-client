import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaSearch,
  FaFolderOpen,
  FaCalendarAlt,
  FaUserTie,
  FaSpinner,
  FaCheckCircle,
  FaTimesCircle,
  FaRegClock,
} from "react-icons/fa";
import { useQuery } from "@tanstack/react-query";
import useAxiosPublic from "../../../hooks/useAxiosPublic";

const LawyerArbitration = () => {
  const navigate = useNavigate();
  const axiosPublic = useAxiosPublic();
  const [currentFilter, setCurrentFilter] = useState("all");
  const [currentSearch, setCurrentSearch] = useState("");

  // Current lawyer email
  const currentLawyerEmail = "lawyer@justifi.com";

  // Fetch all arbitrations from backend
  const {
    data: allArbitrationsData = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["allArbitrations"],
    queryFn: async () => {
      const response = await axiosPublic.get("/all-arbitrations");
      return response.data;
    },
  });

  // Helper function to check if lawyer is representative in arbitration
  const isLawyerRepresentative = (arbitration, lawyerEmail) => {
    // Check plaintiffs representatives
    if (arbitration.plaintiffs && Array.isArray(arbitration.plaintiffs)) {
      const isInPlaintiffs = arbitration.plaintiffs.some((plaintiff) => {
        if (
          plaintiff.representatives &&
          Array.isArray(plaintiff.representatives)
        ) {
          return plaintiff.representatives.some(
            (rep) => rep.email === lawyerEmail && rep.case_status === "running"
          );
        }
        return false;
      });
      if (isInPlaintiffs) return true;
    }

    // Check defendants representatives (if any)
    if (arbitration.defendants && Array.isArray(arbitration.defendants)) {
      const isInDefendants = arbitration.defendants.some((defendant) => {
        if (
          defendant.representatives &&
          Array.isArray(defendant.representatives)
        ) {
          return defendant.representatives.some(
            (rep) => rep.email === lawyerEmail && rep.case_status === "running"
          );
        }
        return false;
      });
      if (isInDefendants) return true;
    }

    return false;
  };

  // Helper function to get client name who added the lawyer
  const getClientName = (arbitration, lawyerEmail) => {
    // Check plaintiffs
    if (arbitration.plaintiffs && Array.isArray(arbitration.plaintiffs)) {
      for (let plaintiff of arbitration.plaintiffs) {
        if (
          plaintiff.representatives &&
          Array.isArray(plaintiff.representatives)
        ) {
          const found = plaintiff.representatives.find(
            (rep) => rep.email === lawyerEmail && rep.case_status === "running"
          );
          if (found) return plaintiff.name;
        }
      }
    }

    // Check defendants
    if (arbitration.defendants && Array.isArray(arbitration.defendants)) {
      for (let defendant of arbitration.defendants) {
        if (
          defendant.representatives &&
          Array.isArray(defendant.representatives)
        ) {
          const found = defendant.representatives.find(
            (rep) => rep.email === lawyerEmail && rep.case_status === "running"
          );
          if (found) return defendant.name;
        }
      }
    }

    return "Unknown Client";
  };

  // Convert to array if single object
  const arbitrationsArray = Array.isArray(allArbitrationsData)
    ? allArbitrationsData
    : [allArbitrationsData];

  // Filter arbitrations where lawyer is representative
  const lawyerArbitrations = arbitrationsArray.filter((arbitration) =>
    isLawyerRepresentative(arbitration, currentLawyerEmail)
  );

  // Filter arbitrations based on search and filter
  const filteredArbitrations = lawyerArbitrations
    .filter((arbitration) => {
      if (
        currentFilter !== "all" &&
        arbitration.arbitration_status !== currentFilter
      ) {
        return false;
      }

      if (currentSearch) {
        const searchTerm = currentSearch.toLowerCase();
        const matchesTitle = arbitration.caseTitle
          ?.toLowerCase()
          .includes(searchTerm);
        const matchesClient = getClientName(arbitration, currentLawyerEmail)
          ?.toLowerCase()
          .includes(searchTerm);
        return matchesTitle || matchesClient;
      }

      return true;
    })
    .sort((a, b) => new Date(b.submissionDate) - new Date(a.submissionDate));

  // Get status color and text
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "ongoing":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status) => {
    switch (status?.toLowerCase()) {
      case "ongoing":
        return "Ongoing";
      case "completed":
        return "Completed";
      case "cancelled":
        return "Cancelled";
      default:
        return "Unknown";
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case "ongoing":
        return <FaSpinner className="text-blue-600" />;
      case "completed":
        return <FaCheckCircle className="text-green-600" />;
      case "cancelled":
        return <FaTimesCircle className="text-red-600" />;
      default:
        return <FaRegClock className="text-gray-600" />;
    }
  };

  const handleCardClick = (arbitrationId) => {
    navigate(`/dashboard/lawyer-arbitrations/${arbitrationId}`);
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading your arbitrations...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <div className="text-red-600 text-6xl mb-4">⚠️</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Error loading arbitrations
          </h3>
          <p className="text-gray-500">Please try again later.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Arbitrations</h1>
        <p className="text-gray-600 mt-2">
          Manage and track all your arbitration cases as legal representative
        </p>
        <p className="text-sm text-gray-500 mt-1">
          Logged in as: {currentLawyerEmail}
        </p>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FaSearch className="text-gray-400" />
          </div>
          <input
            type="text"
            value={currentSearch}
            onChange={(e) => setCurrentSearch(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Search by client name or case title..."
          />
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex flex-wrap gap-2">
          {[
            { key: "all", label: "All Cases", color: "gray" },
            { key: "Ongoing", label: "Ongoing", color: "blue" },
            { key: "Completed", label: "Completed", color: "green" },
            { key: "Cancelled", label: "Cancelled", color: "red" },
          ].map(({ key, label, color }) => (
            <button
              key={key}
              onClick={() => setCurrentFilter(key)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                currentFilter === key
                  ? `bg-${color}-600 text-white`
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Arbitration Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredArbitrations.map((arbitration) => {
          const statusColor = getStatusColor(arbitration.arbitration_status);
          const statusText = getStatusText(arbitration.arbitration_status);
          const statusIcon = getStatusIcon(arbitration.arbitration_status);
          const clientName = getClientName(arbitration, currentLawyerEmail);

          return (
            <div
              key={arbitration._id || arbitration.arbitrationId}
              onClick={() =>
                handleCardClick(arbitration.arbitrationId || arbitration._id)
              }
              className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-300 cursor-pointer"
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${statusColor} gap-1`}
                  >
                    {statusIcon}
                    {statusText}
                  </span>
                  <span className="text-sm text-gray-500">
                    {arbitration.arbitrationId}
                  </span>
                </div>

                <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                  {arbitration.caseTitle}
                </h3>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Client:</span>
                    <span className="text-sm font-medium text-blue-600">
                      {clientName}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Suit Value:</span>
                    <span className="text-lg font-bold text-green-600">
                      BDT{" "}
                      {parseInt(arbitration.suitValue || 0).toLocaleString()}
                    </span>
                  </div>

                  {arbitration.sessionData?.sessionDateTime && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">
                        Next Hearing:
                      </span>
                      <span className="text-sm font-medium text-blue-600 flex items-center gap-1">
                        <FaCalendarAlt />
                        {new Date(
                          arbitration.sessionData.sessionDateTime
                        ).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <span className="text-sm text-gray-500">Category:</span>
                  <span className="text-sm font-medium text-gray-600">
                    {arbitration.caseCategory}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredArbitrations.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <FaFolderOpen className="text-6xl mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No arbitrations found
          </h3>
          <p className="text-gray-500">
            {arbitrationsArray.length > 0
              ? "You are not currently representing any clients in arbitration cases."
              : "No arbitration data available."}
          </p>
        </div>
      )}
    </div>
  );
};

export default LawyerArbitration;
