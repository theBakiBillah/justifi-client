// dashboard/userDashboard/pages/MyArbitrations.jsx
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaAward,
  FaCalendarAlt,
  FaCalendarCheck,
  FaFilter,
  FaFolderOpen,
  FaRegClock,
  FaTimesCircle,
  FaUserTie,
  FaUsers,
  FaCheckCircle,
  FaSpinner,
} from "react-icons/fa";
import useAxiosSecure from "../../../hooks/useAxiosSecure";
import useUserData from "../../../hooks/useUserData";
import Loading from "../../../common/loading/Loading";

const MyArbitrations = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState("all");
  const [currentSort, setCurrentSort] = useState("date");
  const { currentUser } = useUserData();
  const axiosSecure = useAxiosSecure();

  const {
    data: myArbitrations = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["myArbitrations", currentUser?.email],
    queryFn: async () => {
      const response = await axiosSecure.get(
        `/myArbitrations?email=${currentUser?.email}`
      );
      return response.data;
    },
    enabled: !!currentUser?.email,
  });

  // Helper function to check if user is involved in arbitration (plaintiff or defendant)
  const isUserInvolved = (arbitration, userEmail) => {
    // Check plaintiffs (handles both object and array formats)
    if (arbitration.plaintiffs) {
      if (Array.isArray(arbitration.plaintiffs)) {
        const isPlaintiff = arbitration.plaintiffs.some(
          (plaintiff) => plaintiff.email === userEmail
        );
        if (isPlaintiff) return true;
      } else {
        const plaintiffEntries = Object.values(arbitration.plaintiffs);
        const isPlaintiff = plaintiffEntries.some(
          (plaintiff) => plaintiff && plaintiff.email === userEmail
        );
        if (isPlaintiff) return true;
      }
    }

    // Check defendants (handles both object and array formats)
    if (arbitration.defendants) {
      if (Array.isArray(arbitration.defendants)) {
        const isDefendant = arbitration.defendants.some(
          (defendant) => defendant.email === userEmail
        );
        if (isDefendant) return true;
      } else {
        const defendantEntries = Object.values(arbitration.defendants);
        const isDefendant = defendantEntries.some(
          (defendant) => defendant && defendant.email === userEmail
        );
        if (isDefendant) return true;
      }
    }

    return false;
  };

  // Filter arbitrations where user is involved
  const userArbitrations = myArbitrations.filter((arbitration) =>
    isUserInvolved(arbitration, currentUser?.email)
  );

  // Filter and sort arbitrations
  const filteredArbitrations = userArbitrations
    .filter((arbitration) => {
      if (filter === "all") return true;
      return arbitration.arbitration_status === filter;
    })
    .sort((a, b) => {
      switch (currentSort) {
        case "date":
          return new Date(b.submissionDate) - new Date(a.submissionDate);
        case "value":
          return (
            parseFloat(b.suitValue?.replace(/[^\d.]/g, "") || 0) -
            parseFloat(a.suitValue?.replace(/[^\d.]/g, "") || 0)
          );
        case "title":
          return a.caseTitle?.localeCompare(b.caseTitle);
        case "status":
          return a.arbitration_status?.localeCompare(b.arbitration_status);
        default:
          return 0;
      }
    });

  // Get status color and text based on arbitration_status
  const getStatusColor = (arbitration_status) => {
    switch (arbitration_status?.toLowerCase()) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
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

  const getStatusText = (arbitration_status) => {
    switch (arbitration_status?.toLowerCase()) {
      case "pending":
        return "Pending";
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

  const getStatusIcon = (arbitration_status) => {
    switch (arbitration_status?.toLowerCase()) {
      case "pending":
        return <FaRegClock className="text-yellow-600" />;
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

  // Helper function to count parties
  const countParties = (arbitration) => {
    let plaintiffCount = 0;
    let defendantCount = 0;

    if (arbitration.plaintiffs) {
      if (Array.isArray(arbitration.plaintiffs)) {
        plaintiffCount = arbitration.plaintiffs.length;
      } else {
        plaintiffCount = Object.keys(arbitration.plaintiffs).length;
      }
    }

    if (arbitration.defendants) {
      if (Array.isArray(arbitration.defendants)) {
        defendantCount = arbitration.defendants.length;
      } else {
        defendantCount = Object.keys(arbitration.defendants).length;
      }
    }

    return { plaintiffCount, defendantCount };
  };

  // Helper function to get user's role in the arbitration
  const getUserRole = (arbitration, userEmail) => {
    // Check if user is plaintiff
    if (arbitration.plaintiffs) {
      if (Array.isArray(arbitration.plaintiffs)) {
        const isPlaintiff = arbitration.plaintiffs.some(
          (plaintiff) => plaintiff.email === userEmail
        );
        if (isPlaintiff) return "Plaintiff";
      } else {
        const plaintiffEntries = Object.values(arbitration.plaintiffs);
        const isPlaintiff = plaintiffEntries.some(
          (plaintiff) => plaintiff && plaintiff.email === userEmail
        );
        if (isPlaintiff) return "Plaintiff";
      }
    }

    // Check if user is defendant
    if (arbitration.defendants) {
      if (Array.isArray(arbitration.defendants)) {
        const isDefendant = arbitration.defendants.some(
          (defendant) => defendant.email === userEmail
        );
        if (isDefendant) return "Defendant";
      } else {
        const defendantEntries = Object.values(arbitration.defendants);
        const isDefendant = defendantEntries.some(
          (defendant) => defendant && defendant.email === userEmail
        );
        if (isDefendant) return "Defendant";
      }
    }

    return "Unknown";
  };

  // Stats cards component
  const StatCard = ({ icon, value, label, color, trend }) => (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 group">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{label}</p>
          <p className={`text-2xl font-bold ${color} mb-1`}>{value}</p>
          {trend && <p className="text-xs text-gray-500">{trend}</p>}
        </div>
        <div className="text-2xl opacity-80 group-hover:scale-110 transition-transform duration-300">
          {icon}
        </div>
      </div>
    </div>
  );

  const handleCardClick = (arbitrationId) => {
    navigate(`/dashboard/my-arbitrations/${arbitrationId}`);
  };

  if (isLoading) {
    return <Loading />;
  }

  if (error || !myArbitrations || !Array.isArray(myArbitrations)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-20 h-20 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <FaFolderOpen className="text-3xl text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Arbitrations Not Found
          </h2>
          <p className="text-gray-600 mb-6">
            Unable to load arbitration cases information.
          </p>
          <button
            onClick={() => refetch()}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200 font-medium"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Calculate stats based on arbitration_status
  const ongoingCount = userArbitrations.filter(
    (a) => a.arbitration_status === "Ongoing"
  ).length;
  const plaintiffCount = userArbitrations.filter(
    (arbitration) =>
      getUserRole(arbitration, currentUser?.email) === "Plaintiff"
  ).length;
  const defendantCount = userArbitrations.filter(
    (arbitration) =>
      getUserRole(arbitration, currentUser?.email) === "Defendant"
  ).length;

  return (
    <section className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-6 shadow-lg">
            <FaCalendarAlt className="text-2xl text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 bg-gradient-to-r from-gray-900 to-blue-900 bg-clip-text">
            My Arbitrations
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto leading-relaxed">
            Manage and track all your arbitration cases with comprehensive
            overview and insights
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={<FaCalendarCheck className="text-blue-600" />}
            value={userArbitrations.length}
            label="Total Cases"
            color="text-blue-600"
          />
          <StatCard
            icon={<FaSpinner className="text-blue-600" />}
            value={ongoingCount}
            label="Ongoing Cases"
            color="text-blue-600"
          />
          <StatCard
            icon={<FaUsers className="text-purple-600" />}
            value={plaintiffCount}
            label="As Plaintiff"
            color="text-purple-600"
          />
          <StatCard
            icon={<FaUserTie className="text-emerald-600" />}
            value={defendantCount}
            label="As Defendant"
            color="text-emerald-600"
          />
        </div>

        {/* Filters Card */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/60 p-6 mb-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div className="flex items-center space-x-3">
              <FaFilter className="text-gray-400 text-lg" />
              <h3 className="text-lg font-semibold text-gray-900">
                Filter Cases
              </h3>
            </div>

            <div className="flex flex-wrap gap-2">
              {[
                {
                  key: "all",
                  label: "All Cases",
                  color: "gray",
                  icon: <FaCalendarCheck />,
                },
                {
                  key: "Pending",
                  label: "Pending",
                  color: "yellow",
                  icon: <FaRegClock />,
                },
                {
                  key: "Ongoing",
                  label: "Ongoing",
                  color: "blue",
                  icon: <FaSpinner />,
                },
                {
                  key: "Completed",
                  label: "Completed",
                  color: "green",
                  icon: <FaCheckCircle />,
                },
                {
                  key: "Cancelled",
                  label: "Cancelled",
                  color: "red",
                  icon: <FaTimesCircle />,
                },
              ].map(({ key, label, color, icon }) => (
                <button
                  key={key}
                  onClick={() => setFilter(key)}
                  className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 transform hover:scale-105 flex items-center gap-2 ${
                    filter === key
                      ? `bg-${color}-600 text-white shadow-lg shadow-${color}-200`
                      : "bg-white text-gray-700 border border-gray-300 hover:border-gray-400 shadow-sm hover:shadow-md"
                  }`}
                >
                  {icon}
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Sorting Options */}
          <div className="mt-6 pt-6 border-t border-gray-200/60">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center space-x-3">
                <span className="text-sm font-medium text-gray-700">
                  Sort by:
                </span>
                <div className="flex flex-wrap gap-2">
                  {["date", "value", "title", "status"].map((sortType) => (
                    <button
                      key={sortType}
                      onClick={() => setCurrentSort(sortType)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                        currentSort === sortType
                          ? "bg-blue-100 text-blue-700 border border-blue-200"
                          : "bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200"
                      }`}
                    >
                      {sortType.charAt(0).toUpperCase() + sortType.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              <div className="text-sm text-gray-500">
                Showing {filteredArbitrations.length} of{" "}
                {userArbitrations.length} cases
              </div>
            </div>
          </div>
        </div>

        {/* Arbitration Cards Grid */}
        {filteredArbitrations.length === 0 ? (
          <div className="text-center py-16 bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/60">
            <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <FaFolderOpen className="text-3xl text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No arbitration cases found
            </h3>
            <p className="text-gray-600 max-w-md mx-auto">
              {filter === "all"
                ? "You don't have any arbitration cases yet. Start by filing your first case."
                : `No ${filter.toLowerCase()} arbitration cases match your current filter.`}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredArbitrations.map((arbitration) => {
              const statusColor = getStatusColor(
                arbitration.arbitration_status
              );
              const statusText = getStatusText(arbitration.arbitration_status);
              const statusIcon = getStatusIcon(arbitration.arbitration_status);
              const { plaintiffCount, defendantCount } =
                countParties(arbitration);
              const userRole = getUserRole(arbitration, currentUser?.email);

              return (
                <div
                  key={arbitration._id}
                  onClick={() => handleCardClick(arbitration._id)}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-all duration-300 cursor-pointer group"
                >
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${statusColor} gap-1`}
                      >
                        {statusIcon}
                        {statusText}
                      </span>
                      <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        {arbitration.caseCategory}
                      </span>
                    </div>

                    <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                      {arbitration.caseTitle}
                    </h3>

                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {arbitration.disputeNature}
                    </p>

                    <div className="space-y-3 mb-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">
                          Suit Value:
                        </span>
                        <span className="text-lg font-bold text-green-600">
                          BDT {parseInt(arbitration.suitValue).toLocaleString()}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">Fee:</span>
                        <span className="text-sm font-medium text-blue-600">
                          BDT {arbitration.processingFee}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">
                          Your Role:
                        </span>
                        <span
                          className={`text-sm font-medium ${
                            userRole === "Plaintiff"
                              ? "text-purple-600"
                              : "text-emerald-600"
                          }`}
                        >
                          {userRole}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>Plaintiffs: {plaintiffCount}</span>
                        <span>Defendants: {defendantCount}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <span className="text-sm text-gray-500">Filed:</span>
                      <span className="text-sm font-medium text-gray-600">
                        {new Date(
                          arbitration.submissionDate
                        ).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

export default MyArbitrations;
