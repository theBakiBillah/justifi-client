import React from "react";
import { FaGavel, FaEnvelope } from "react-icons/fa";

const LawyerArbitratorsPanel = ({ arbitrators }) => {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-100">
      <div className="flex items-center mb-6">
        <div className="w-1 h-8 bg-blue-600 rounded-full mr-3"></div>
        <h2 className="text-2xl font-bold text-gray-900">Arbitrators Panel</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {arbitrators.map((arbitrator) => (
          <div
            key={arbitrator.id}
            className="bg-white border border-gray-200 rounded-xl p-6 text-center shadow-md hover:-translate-y-1 hover:shadow-lg transition-all duration-300"
          >
            <div className="relative mb-4">
              <img
                src={arbitrator.picture}
                alt={arbitrator.name}
                className="w-24 h-24 rounded-full mx-auto object-cover border-4 border-blue-100 shadow-md"
              />
              <div className="absolute bottom-0 right-6 bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center border-2 border-white">
                <FaGavel className="text-xs" />
              </div>
            </div>
            <h3 className="font-bold text-gray-900 text-lg mb-1">
              {arbitrator.name}
            </h3>
            <p className="text-blue-600 font-semibold text-sm mb-1">
              {arbitrator.designation}
            </p>
            <p className="text-gray-700 text-sm mb-2">
              {arbitrator.specialization}
            </p>
            <p className="text-gray-500 text-xs mb-3">
              {arbitrator.experience} Experience
            </p>
            <p className="text-gray-600 text-sm truncate bg-gray-50 p-2 rounded-lg">
              <FaEnvelope className="inline mr-2 text-gray-400" />
              {arbitrator.email}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LawyerArbitratorsPanel;
