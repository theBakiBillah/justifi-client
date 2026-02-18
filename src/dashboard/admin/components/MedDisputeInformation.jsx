import React from "react";

const MedDisputeInformation = ({ disputeInfo, onUpdateDisputeInfo }) => {
  const handleChange = (field, value) => {
    onUpdateDisputeInfo((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <div className="mb-6">
      <h2 className="text-xl font-semibold mb-4">Dispute Information</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Case Category
          </label>
          <input
            type="text"
            value={disputeInfo.category}
            onChange={(e) => handleChange("category", e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Suit Value
          </label>
          <input
            type="text"
            value={disputeInfo.suitValue}
            onChange={(e) => handleChange("suitValue", e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2"
            required
          />
        </div>
      </div>
      <div className="mt-4">
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

export default MedDisputeInformation;