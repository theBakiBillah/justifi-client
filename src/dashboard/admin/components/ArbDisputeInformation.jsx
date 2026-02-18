import React from "react";

const ArbDisputeInformation = ({ disputeInfo, onUpdateDisputeInfo }) => {
  const handleChange = (field, value) => {
    onUpdateDisputeInfo((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <div className="mb-6">
      <h2 className="text-xl font-semibold mb-4">Dispute Information</h2>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Nature of Dispute
        </label>
        <textarea
          value={disputeInfo.nature}
          onChange={(e) => handleChange("nature", e.target.value)}
          className="w-full border border-gray-300 rounded-md px-3 py-2"
          rows="3"
          required
        />
      </div>
    </div>
  );
};

export default ArbDisputeInformation;