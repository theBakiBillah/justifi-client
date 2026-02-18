import React from "react";

const ArbFinancialInformation = ({ financialInfo, onUpdateFinancialInfo }) => {
  const handleChange = (field, value) => {
    onUpdateFinancialInfo((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <div className="mb-6">
      <h2 className="text-xl font-semibold mb-4">Financial Information</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Suit Value (BDT)
          </label>
          <input
            type="number"
            value={financialInfo.suitValue}
            onChange={(e) => handleChange("suitValue", e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2"
            min="0"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Number of Sittings
          </label>
          <input
            type="number"
            value={financialInfo.sittings}
            onChange={(e) => handleChange("sittings", e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2"
            min="1"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Total Arbitration Cost (BDT)
          </label>
          <input
            type="number"
            value={financialInfo.totalCost}
            onChange={(e) => handleChange("totalCost", e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2"
            min="0"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Award Compliance Days
          </label>
          <input
            type="number"
            value={financialInfo.complianceDays}
            onChange={(e) => handleChange("complianceDays", e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2"
            min="1"
            required
          />
        </div>
      </div>
    </div>
  );
};

export default ArbFinancialInformation;