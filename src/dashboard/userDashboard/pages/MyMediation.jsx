// dashboard/userDashboard/pages/MyMediation.jsx

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaHandshake,
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

const MyMediation = () => {
  const navigate = useNavigate();
  const axiosSecure = useAxiosSecure();
  const { currentUser } = useUserData();

  const [filterStatus, setFilterStatus] = useState("All Cases");
  const [sortBy, setSortBy] = useState("Date");

  // ================= FETCH DATA =================
  const {
    data: mediations = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["all-mediations"],
    queryFn: async () => {
      const res = await axiosSecure.get("/all-mediations");
      return Array.isArray(res.data) ? res.data : [res.data];
    },
  });

  if (isLoading) return <Loading />;

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-20 h-20 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <FaFolderOpen className="text-3xl text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Mediations Not Found
          </h2>
          <p className="text-gray-600 mb-6">
            Unable to load mediation cases information.
          </p>
          <button
            onClick={refetch}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200 font-medium"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // ================= HELPERS =================
  const isUserInGroup = (group) =>
    group &&
    Object.values(group).some((person) => person?.email === currentUser?.email);

  const getRole = (mediation) =>
    isUserInGroup(mediation.plaintiffs) ? "Plaintiff" : "Defendant";

  const getStatus = (mediation) => mediation.mediation_status || "Pending";

  const getStatusColor = (status) => {
    const map = {
      pending: "bg-yellow-100 text-yellow-800",
      ongoing: "bg-blue-100 text-blue-800",
      completed: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
    };
    return map[status?.toLowerCase()] || "bg-gray-100 text-gray-800";
  };

  const getStatusIcon = (status) => {
    const map = {
      pending: <FaRegClock className="text-yellow-600" />,
      ongoing: <FaSpinner className="text-blue-600" />,
      completed: <FaCheckCircle className="text-green-600" />,
      cancelled: <FaTimesCircle className="text-red-600" />,
    };
    return (
      map[status?.toLowerCase()] || <FaRegClock className="text-gray-600" />
    );
  };

  // ================= USER CASES =================
  const userMediations = mediations.filter(
    (m) => isUserInGroup(m.plaintiffs) || isUserInGroup(m.defendants),
  );

  const filtered =
    filterStatus === "All Cases"
      ? userMediations
      : userMediations.filter((m) => getStatus(m) === filterStatus);

  const sorted = [...filtered].sort((a, b) => {
    switch (sortBy) {
      case "Date":
        return new Date(b.submissionDate) - new Date(a.submissionDate);
      case "Value":
        return (b.suitValue || 0) - (a.suitValue || 0);
      case "Title":
        return (a.caseTitle || "").localeCompare(b.caseTitle || "");
      case "Status":
        return getStatus(a).localeCompare(getStatus(b));
      default:
        return 0;
    }
  });

  // ================= STATS =================
  const totalCases = userMediations.length;
  const ongoingCases = userMediations.filter(
    (m) => getStatus(m) === "Ongoing",
  ).length;
  const asPlaintiff = userMediations.filter(
    (m) => getRole(m) === "Plaintiff",
  ).length;
  const asDefendant = userMediations.filter(
    (m) => getRole(m) === "Defendant",
  ).length;

  const StatCard = ({ icon, value, label, color }) => (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 group">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{label}</p>
          <p className={`text-2xl font-bold ${color}`}>{value}</p>
        </div>
        <div className="text-2xl opacity-80 group-hover:scale-110 transition-transform duration-300">
          {icon}
        </div>
      </div>
    </div>
  );

  const handleCardClick = (id) => navigate(`/dashboard/my-mediations/${id}`);

  return (
    <section className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* HEADER */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-6 shadow-lg">
            <FaHandshake className="text-2xl text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            My Mediations
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Manage and track all your mediation cases with comprehensive
            overview and insights
          </p>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={<FaCalendarCheck className="text-blue-600" />}
            value={totalCases}
            label="Total Cases"
            color="text-blue-600"
          />
          <StatCard
            icon={<FaSpinner className="text-blue-600" />}
            value={ongoingCases}
            label="Ongoing Cases"
            color="text-blue-600"
          />
          <StatCard
            icon={<FaUsers className="text-purple-600" />}
            value={asPlaintiff}
            label="As Plaintiff"
            color="text-purple-600"
          />
          <StatCard
            icon={<FaUserTie className="text-emerald-600" />}
            value={asDefendant}
            label="As Defendant"
            color="text-emerald-600"
          />
        </div>

        {/* FILTER + SORT */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/60 p-6 mb-8">
          <div className="flex flex-col lg:flex-row justify-between gap-4">
            <div className="flex items-center gap-3">
              <FaFilter className="text-gray-400 text-lg" />
              <h3 className="text-lg font-semibold text-gray-900">
                Filter Cases
              </h3>
            </div>

            <div className="flex flex-wrap gap-2">
              {[
                { key: "All Cases", icon: <FaCalendarCheck /> },
                { key: "Pending", icon: <FaRegClock /> },
                { key: "Ongoing", icon: <FaSpinner /> },
                { key: "Completed", icon: <FaCheckCircle /> },
                { key: "Cancelled", icon: <FaTimesCircle /> },
              ].map(({ key, icon }) => (
                <button
                  key={key}
                  onClick={() => setFilterStatus(key)}
                  className={`px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all duration-300 ${
                    filterStatus === key
                      ? "bg-gray-700 text-white shadow-lg"
                      : "bg-white text-gray-700 border border-gray-300"
                  }`}
                >
                  {icon}
                  {key}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200/60 flex justify-between items-center flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">
                Sort by:
              </span>
              {["Date", "Value", "Title", "Status"].map((type) => (
                <button
                  key={type}
                  onClick={() => setSortBy(type)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium ${
                    sortBy === type
                      ? "bg-blue-100 text-blue-700 border border-blue-200"
                      : "bg-gray-100 text-gray-700 border border-gray-200"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>

            <div className="text-sm text-gray-500">
              Showing {sorted.length} of {totalCases} cases
            </div>
          </div>
        </div>

        {/* CARDS */}
        {sorted.length === 0 ? (
          <div className="text-center py-16 bg-white/80 rounded-2xl shadow-sm border">
            <FaFolderOpen className="text-3xl text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No mediation cases found
            </h3>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sorted.map((m) => {
              const status = getStatus(m);
              return (
                <div
                  key={m._id}
                  onClick={() => handleCardClick(m._id)}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-all duration-300 cursor-pointer group"
                >
                  <div className="p-6">
                    <div className="flex justify-between mb-4">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          status,
                        )} gap-1`}
                      >
                        {getStatusIcon(status)}
                        {status}
                      </span>
                      <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        {m.caseCategory}
                      </span>
                    </div>

                    <h3 className="text-lg font-semibold mb-2">
                      {m.caseTitle}
                    </h3>

                    <p className="text-gray-600 text-sm mb-4">
                      {m.disputeNature}
                    </p>

                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Suit Value:</span>
                        <span className="text-green-600 font-bold">
                          BDT {(m.suitValue || 0).toLocaleString()}
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span>Fee:</span>
                        <span className="text-blue-600">
                          BDT {m.processingFee}
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span>Your Role:</span>
                        <span className="font-medium">{getRole(m)}</span>
                      </div>

                      <div className="flex justify-between text-xs text-gray-500">
                        <span>
                          Plaintiffs: {Object.keys(m.plaintiffs || {}).length}
                        </span>
                        <span>
                          Defendants: {Object.keys(m.defendants || {}).length}
                        </span>
                      </div>
                    </div>

                    <div className="flex justify-between pt-4 mt-4 border-t text-xs text-gray-500">
                      <span>Filed:</span>
                      <span>
                        {new Date(m.submissionDate).toLocaleDateString()}
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

export default MyMediation;
