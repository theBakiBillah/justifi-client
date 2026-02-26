import React from "react";
import {
  FaGavel,
  FaUserTie,
  FaGraduationCap,
  FaBriefcase,
  FaQuoteLeft,
} from "react-icons/fa";
import { useQuery } from "@tanstack/react-query";
import useAxiosPublic from "../../../hooks/useAxiosPublic";

const LawyerArbitratorsPanel = ({ arbitrators }) => {
  const axiosPublic = useAxiosPublic();

  // Fetch arbitrators data from backend
  const { data: arbitratorsData = [], isLoading } = useQuery({
    queryKey: ["arbitrators"],
    queryFn: async () => {
      const response = await axiosPublic.get("/arbitrators");
      return response.data;
    },
  });

  // Enrich arbitrators with real data from the database
  const enrichedArbitrators = arbitrators.map((arbitrator) => {
    // Find matching arbitrator in the database
    const dbArbitrator = arbitratorsData.find(
      (dbArb) =>
        dbArb.email === arbitrator.email || dbArb.name === arbitrator.name
    );

    return {
      ...arbitrator,
      // Use database data if available, otherwise use defaults
      picture:
        dbArbitrator?.image ||
        arbitrator.picture ||
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
      experience: dbArbitrator?.experience
        ? `${dbArbitrator.experience}+ years`
        : arbitrator.experience || "10+ years",
      qualification: dbArbitrator?.qualification || "Legal Professional",
      description:
        dbArbitrator?.description ||
        "Experienced legal professional specializing in dispute resolution",
    };
  });

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-100">
        <div className="flex items-center mb-6">
          <div className="w-1 h-8 bg-blue-600 rounded-full mr-3"></div>
          <h2 className="text-2xl font-bold text-gray-900">
            Arbitrators Panel
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="bg-white border border-gray-200 rounded-xl p-6 text-center animate-pulse"
            >
              <div className="relative mb-4">
                <div className="w-24 h-24 rounded-full mx-auto bg-gray-300"></div>
              </div>
              <div className="h-4 bg-gray-300 rounded mb-2 mx-auto w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded mb-1 mx-auto w-1/2"></div>
              <div className="h-3 bg-gray-200 rounded mb-1 mx-auto w-2/3"></div>
              <div className="h-3 bg-gray-200 rounded mb-3 mx-auto w-3/4"></div>
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
        <h2 className="text-2xl font-bold text-gray-900">Arbitrators Panel</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {enrichedArbitrators.map((arbitrator) => (
          <div
            key={arbitrator.id}
            className="bg-white border border-gray-200 rounded-xl p-6 text-center shadow-md hover:-translate-y-1 hover:shadow-lg transition-all duration-300 group"
          >
            {/* Profile Image & Badge */}
            <div className="relative mb-4">
              <div className="relative mx-auto w-28 h-28">
                <img
                  src={arbitrator.picture}
                  alt={arbitrator.name}
                  className="w-full h-full rounded-full object-cover border-4 border-white shadow-lg group-hover:border-blue-50 transition-all duration-300"
                  onError={(e) => {
                    e.target.src =
                      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face";
                  }}
                />
                <div className="absolute -bottom-2 -right-2 bg-blue-600 text-white rounded-full w-10 h-10 flex items-center justify-center border-2 border-white shadow-lg">
                  <FaGavel className="text-sm" />
                </div>
              </div>
            </div>

            {/* Name and Designation */}
            <div className="mb-4">
              <h3 className="font-bold text-gray-900 text-lg mb-1 group-hover:text-blue-900 transition-colors">
                {arbitrator.name}
              </h3>
              <p className="text-blue-600 font-semibold text-sm flex items-center justify-center gap-2">
                <FaUserTie className="text-xs" />
                {arbitrator.designation}
              </p>
            </div>

            {/* Qualification Section */}
            <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-100">
              <div className="flex items-center justify-center gap-2 mb-2">
                <FaGraduationCap className="text-gray-600 text-sm" />
                <span className="text-xs font-semibold text-gray-600  uppercase tracking-wide">
                  Qualification
                </span>
              </div>
              <p className="text-gray-700 text-sm font-medium leading-tight">
                {arbitrator.qualification}
              </p>
            </div>

            {/* Experience Section */}
            <div className="mb-4 p-2 bg-gray-50 rounded-lg border border-gray-100">
              <div className="flex items-center justify-center gap-1 mb-2">
                <FaBriefcase className="text-gray-600 text-sm" />
                <span className="text-xs font-semibold text-gray-600  uppercase tracking-wide">
                  Professional Experience
                </span>
              </div>
              <p className="text-gray-700 text-sm font-medium leading-tight">
                {arbitrator.experience}
              </p>
            </div>

            {/* Description Section */}
            <div className="bg-gradient-to-br from-gray-50 to-white rounded-lg p-4 border border-gray-200 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <FaQuoteLeft className="text-gray-400 text-xs" />
                <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                  Professional Profile
                </span>
              </div>
              <p className="text-gray-600 text-xs leading-relaxed text-left line-clamp-4">
                {arbitrator.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {enrichedArbitrators.length === 0 && (
        <div className="text-center py-8">
          <div className="bg-gray-50 rounded-2xl p-8 max-w-md mx-auto">
            <FaUserTie className="text-6xl text-gray-300 mb-4 mx-auto" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No Arbitrators Assigned
            </h3>
            <p className="text-gray-500">
              Arbitrators have not been assigned to this case yet.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default LawyerArbitratorsPanel;
