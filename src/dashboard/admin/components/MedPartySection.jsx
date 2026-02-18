import React from "react";
import { FaTrash } from "react-icons/fa";

const MedPartySection = ({ title, parties, colorClass }) => {
  return (
    <div className="mb-6">
      <h3 className={`text-lg font-medium mb-3 ${colorClass}`}>{title}</h3>
      <div>
        {parties.map((party) => (
          <div
            key={party.id}
            className="border border-gray-300 rounded-lg p-4 mb-4 bg-gray-50"
          >
            <div className="mb-4">
              <p className="font-medium">Name: {party.name}</p>
              <p className="text-sm text-gray-600">Parents: {party.parents}</p>
              <p className="text-sm text-gray-600">Email: {party.email}</p>
              <p className="text-sm text-gray-600">Phone: {party.phone}</p>
              <p className="text-sm text-gray-600">Address: {party.address}</p>
              <p className="text-sm text-gray-600">
                Occupation: {party.occupation}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MedPartySection;