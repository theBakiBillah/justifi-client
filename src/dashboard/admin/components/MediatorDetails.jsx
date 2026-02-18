import React, { useState } from "react";

const MediatorDetails = ({
  mediatorDetails,
  onUpdateMediatorDetails,
  mediators = [],
}) => {
  const [showMediatorDropdown, setShowMediatorDropdown] = useState(false);
  const [mediatorSearch, setMediatorSearch] = useState("");

  const handleChange = (field, value) => {
    onUpdateMediatorDetails((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const selectMediator = (mediator) => {
    handleChange("mediatorName", mediator.name);
    handleChange("mediatorQualification", mediator.qualification);
    handleChange("mediatorEmail", mediator.email);
    setMediatorSearch(mediator.name);
    setShowMediatorDropdown(false);
  };

  const filteredMediators = mediators.filter(
    (mediator) =>
      mediator.name.toLowerCase().includes(mediatorSearch.toLowerCase()) ||
      mediator.qualification
        .toLowerCase()
        .includes(mediatorSearch.toLowerCase())
  );

  return (
    <div className="mb-6">
      <h2 className="text-xl font-semibold mb-4">Mediation Details</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Number of Sessions Agreed
          </label>
          <select
            value={mediatorDetails.sessionsAgreed}
            onChange={(e) => handleChange("sessionsAgreed", e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2"
            required
          >
            <option value="1">1 Session</option>
            <option value="2">2 Sessions</option>
            <option value="3">3 Sessions</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Total Mediation Cost (BDT)
          </label>
          <input
            type="number"
            value={mediatorDetails.totalCost}
            onChange={(e) => handleChange("totalCost", e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2"
            min="0"
            step="0.01"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Assigned Mediator
          </label>
          <div className="relative">
            <input
              type="text"
              value={mediatorSearch}
              onChange={(e) => setMediatorSearch(e.target.value)}
              onFocus={() => setShowMediatorDropdown(true)}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              placeholder="Type to search mediators..."
              required
            />
            {showMediatorDropdown && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                {filteredMediators.map((mediator) => (
                  <div
                    key={mediator._id}
                    className="p-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => selectMediator(mediator)}
                  >
                    <div className="font-medium">{mediator.name}</div>
                    <div className="text-sm text-gray-600">
                      {mediator.qualification}
                    </div>
                    {mediator.email && (
                      <div className="text-xs text-gray-500">
                        {mediator.email}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Mediator Qualification
          </label>
          <input
            type="text"
            value={mediatorDetails.mediatorQualification}
            className="w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-100"
            readOnly
          />
        </div>
      </div>
      {mediatorDetails.mediatorEmail && (
        <div className="mt-2 text-sm text-green-600">
          Mediator Email: {mediatorDetails.mediatorEmail}
        </div>
      )}
    </div>
  );
};

export default MediatorDetails;
