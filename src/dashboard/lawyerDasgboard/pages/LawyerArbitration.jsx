import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaSearch, FaFolderOpen } from "react-icons/fa";

const LawyerArbitration = () => {
  const navigate = useNavigate();
  const [currentFilter, setCurrentFilter] = useState("all");
  const [currentSort, setCurrentSort] = useState("date");
  const [currentSearch, setCurrentSearch] = useState("");
  const [arbitrations] = useState([
    {
      id: "ARB-001",
      title: "Commercial Contract Dispute",
      status: "ongoing",
      nextHearing: "2024-12-15",
      suitValue: "BDT 50,00,000",
      clientName: "ABC Corporation Ltd.",
      arbitrators: [
        "arbitrator1@email.com",
        "arbitrator2@email.com",
        "arbitrator3@email.com",
      ],
      createdAt: "2024-11-01",
    },
    {
      id: "ARB-002",
      title: "Property Ownership Conflict",
      status: "ongoing",
      nextHearing: "2024-12-20",
      suitValue: "BDT 1,20,00,000",
      clientName: "Green Valley Properties",
      arbitrators: [
        "arbitrator1@email.com",
        "arbitrator4@email.com",
        "arbitrator5@email.com",
      ],
      createdAt: "2024-11-05",
    },
    {
      id: "ARB-003",
      title: "Business Partnership Dissolution",
      status: "completed",
      nextHearing: null,
      suitValue: "BDT 75,00,000",
      clientName: "Tech Solutions BD",
      arbitrators: [
        "arbitrator2@email.com",
        "arbitrator3@email.com",
        "arbitrator6@email.com",
      ],
      createdAt: "2024-10-15",
    },
    {
      id: "ARB-004",
      title: "Employment Termination Dispute",
      status: "ongoing",
      nextHearing: "2024-12-18",
      suitValue: "BDT 25,00,000",
      clientName: "Mr. Rahman Ahmed",
      arbitrators: [
        "arbitrator1@email.com",
        "arbitrator7@email.com",
        "arbitrator8@email.com",
      ],
      createdAt: "2024-11-10",
    },
    {
      id: "ARB-005",
      title: "Intellectual Property Rights",
      status: "ongoing",
      nextHearing: "2024-12-25",
      suitValue: "BDT 2,50,00,000",
      clientName: "Innovate Bangladesh Ltd.",
      arbitrators: [
        "arbitrator3@email.com",
        "arbitrator9@email.com",
        "arbitrator10@email.com",
      ],
      createdAt: "2024-11-12",
    },
    {
      id: "ARB-006",
      title: "Construction Contract Breach",
      status: "completed",
      nextHearing: null,
      suitValue: "BDT 95,00,000",
      clientName: "BuildRight Construction",
      arbitrators: [
        "arbitrator4@email.com",
        "arbitrator5@email.com",
        "arbitrator11@email.com",
      ],
      createdAt: "2024-09-20",
    },
  ]);

  const [filteredArbitrations, setFilteredArbitrations] = useState([]);

  useEffect(() => {
    filterAndSortArbitrations();
  }, [currentFilter, currentSort, currentSearch, arbitrations]);

  const filterAndSortArbitrations = () => {
    let filtered = arbitrations.filter((arb) => {
      if (currentFilter !== "all" && arb.status !== currentFilter) {
        return false;
      }

      if (currentSearch) {
        const searchTerm = currentSearch.toLowerCase();
        const matchesTitle = arb.title.toLowerCase().includes(searchTerm);
        const matchesClient = arb.clientName.toLowerCase().includes(searchTerm);
        return matchesTitle || matchesClient;
      }

      return true;
    });

    filtered.sort((a, b) => {
      switch (currentSort) {
        case "date":
          return new Date(b.createdAt) - new Date(a.createdAt);
        case "value":
          return (
            parseFloat(b.suitValue.replace(/[^\d.]/g, "")) -
            parseFloat(a.suitValue.replace(/[^\d.]/g, ""))
          );
        case "title":
          return a.title.localeCompare(b.title);
        case "client":
          return a.clientName.localeCompare(b.clientName);
        default:
          return 0;
      }
    });

    setFilteredArbitrations(filtered);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "ongoing":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "ongoing":
        return "Ongoing";
      case "completed":
        return "Completed";
      default:
        return status;
    }
  };

  const handleCardClick = (arbitrationId) => {
    navigate(`/dashboard/lawyer-arbitrations/${arbitrationId}`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Arbitrations</h1>
        <p className="text-gray-600 mt-2">
          Manage and track all your arbitration cases
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
            placeholder="Search by client name or title..."
          />
        </div>
      </div>

      {/* Filters and Sorting */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setCurrentFilter("all")}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                currentFilter === "all"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              All Cases
            </button>
            <button
              onClick={() => setCurrentFilter("ongoing")}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                currentFilter === "ongoing"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              Ongoing
            </button>
            <button
              onClick={() => setCurrentFilter("completed")}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                currentFilter === "completed"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              Completed
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">
              Sort by:
            </label>
            <select
              value={currentSort}
              onChange={(e) => setCurrentSort(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="date">Date</option>
              <option value="value">Suit Value</option>
              <option value="title">Title</option>
              <option value="client">Client Name</option>
            </select>
          </div>
        </div>
      </div>

      {/* Arbitration Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredArbitrations.map((arbitration) => (
          <div
            key={arbitration.id}
            onClick={() => handleCardClick(arbitration.id)}
            className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-300 cursor-pointer"
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                    arbitration.status
                  )}`}
                >
                  {getStatusText(arbitration.status)}
                </span>
                <span className="text-sm text-gray-500">{arbitration.id}</span>
              </div>

              <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                {arbitration.title}
              </h3>

              <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                {arbitration.clientName}
              </p>

              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-gray-500">Suit Value:</span>
                <span className="text-lg font-bold text-green-600">
                  {arbitration.suitValue}
                </span>
              </div>

              {arbitration.nextHearing ? (
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <span className="text-sm text-gray-500">Next Hearing:</span>
                  <span className="text-sm font-medium text-blue-600">
                    {new Date(arbitration.nextHearing).toLocaleDateString()}
                  </span>
                </div>
              ) : arbitration.status === "completed" ? (
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <span className="text-sm text-gray-500">Status:</span>
                  <span className="text-sm font-medium text-green-600">
                    Case Closed
                  </span>
                </div>
              ) : null}
            </div>
          </div>
        ))}
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
            No arbitration cases match your current filters.
          </p>
        </div>
      )}
    </div>
  );
};

export default LawyerArbitration;
