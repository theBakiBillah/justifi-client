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
} from "react-icons/fa";

const LawyerArbClientInformation = ({ plaintiffs }) => {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-100">
      <div className="flex items-center mb-6">
        <div className="w-1 h-8 bg-blue-600 rounded-full mr-3"></div>
        <h2 className="text-2xl font-bold text-gray-900">
          <FaBalanceScale className="inline mr-3 text-blue-600" />
          Client Information
        </h2>
      </div>
      <div className="space-y-6">
        {plaintiffs.map((party) => (
          <div
            key={party.id}
            className="bg-white rounded-lg p-6 shadow-sm border-l-4 border-blue-500"
          >
            <div className="flex items-start mb-4">
              <div className="relative">
                <img
                  src={party.picture}
                  alt={party.name}
                  className="w-16 h-16 rounded-lg object-cover border-2 border-blue-200"
                />
                <div className="absolute -top-1 -right-1 bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">
                  <FaUserTie />
                </div>
              </div>
              <div className="ml-4 flex-1">
                <h3 className="font-bold text-gray-900 text-lg">
                  {party.name}
                </h3>
                <p className="text-gray-600 text-sm mb-1">
                  <FaUserTie className="inline mr-2 text-blue-500" />
                  {party.representative}
                </p>
                <p className="text-gray-600 text-sm mb-1">
                  <FaEnvelope className="inline mr-2 text-blue-500" />
                  {party.email}
                </p>
                <p className="text-gray-600 text-sm">
                  <FaPhone className="inline mr-2 text-blue-500" />
                  {party.contact}
                </p>
              </div>
            </div>
            <div className="mb-3">
              <p className="text-gray-700 text-sm">
                <FaMapMarkerAlt className="inline mr-2 text-blue-500" />
                {party.address}
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                <FaFolderOpen className="mr-2 text-blue-600" />
                Evidence Submitted ({party.evidence.length} documents)
              </h4>
              <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                {party.evidence.map((evidence) => (
                  <div
                    key={evidence.id}
                    className="bg-gray-50 border border-gray-200 rounded-lg p-3 flex items-center justify-between hover:translate-x-1 hover:bg-gray-100 transition-all duration-300"
                  >
                    <div className="flex items-center">
                      <FaFilePdf className="text-red-500 text-lg mr-3" />
                      <div>
                        <p className="font-medium text-gray-800 text-sm">
                          {evidence.name}
                        </p>
                        <p className="text-gray-500 text-xs">
                          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full mr-2">
                            {evidence.type}
                          </span>
                          Submitted:{" "}
                          {new Date(evidence.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <button className="text-blue-600 hover:text-blue-800 p-1 rounded">
                      <FaDownload />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LawyerArbClientInformation;
