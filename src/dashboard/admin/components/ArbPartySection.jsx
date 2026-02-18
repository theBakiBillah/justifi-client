import React from "react";
import { FaTrash } from "react-icons/fa";

const ArbPartySection = ({ title, parties, colorClass }) => {
  return (
    <div className="mb-6">
      <h3 className={`text-lg font-medium mb-3 ${colorClass}`}>{title}</h3>
      <div>
        {parties.map((party) => (
          <div
            key={party.id}
            className="party-card border border-gray-200 rounded-lg p-4 mb-4 bg-gray-50"
          >
            <div className="party-info bg-gray-100 p-2 rounded mb-3">
              <p>
                <strong>Name:</strong> {party.name}
              </p>
              <p>
                <strong>Parent:</strong> {party.parentsName}
              </p>
              <p>
                <strong>Email:</strong> {party.email}
              </p>
              <p>
                <strong>Phone:</strong> {party.phone}
              </p>
              <p>
                <strong>Address:</strong> {party.address}
              </p>
              <p>
                <strong>Occupation:</strong> {party.occupation}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ArbPartySection;