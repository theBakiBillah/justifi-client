import React, { useState, useMemo } from "react";

const ArbitratorsInformation = ({
  arbitrators,
  onUpdateArbitrators,
  arbitratorsList,
}) => {
  const [showDropdown1, setShowDropdown1] = useState(false);
  const [showDropdown2, setShowDropdown2] = useState(false);
  const [showDropdownPresiding, setShowDropdownPresiding] = useState(false);
  const [search1, setSearch1] = useState("");
  const [search2, setSearch2] = useState("");
  const [searchPresiding, setSearchPresiding] = useState("");

  // Calculate available arbitrators for each field
  const availableArbitrators = useMemo(() => {
    const selected1 = arbitrators.arbitrator1;
    const selected2 = arbitrators.arbitrator2;
    const selectedPresiding = arbitrators.presidingArbitrator;

    // For Arbitrator 1: All arbitrators except those selected in other fields
    const availableFor1 = arbitratorsList.filter(
      (arbitrator) =>
        arbitrator.name !== selected2 && arbitrator.name !== selectedPresiding
    );

    // For Arbitrator 2: All arbitrators except selected1 and selectedPresiding
    const availableFor2 = arbitratorsList.filter(
      (arbitrator) =>
        arbitrator.name !== selected1 && arbitrator.name !== selectedPresiding
    );

    // For Presiding Arbitrator: All arbitrators except selected1 and selected2
    const availableForPresiding = arbitratorsList.filter(
      (arbitrator) =>
        arbitrator.name !== selected1 && arbitrator.name !== selected2
    );

    return {
      arbitrator1: availableFor1,
      arbitrator2: availableFor2,
      presidingArbitrator: availableForPresiding,
    };
  }, [
    arbitratorsList,
    arbitrators.arbitrator1,
    arbitrators.arbitrator2,
    arbitrators.presidingArbitrator,
  ]);

  const handleChange = (field, value) => {
    onUpdateArbitrators((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear dependent fields when a field is changed
    if (field === "arbitrator1") {
      onUpdateArbitrators((prev) => ({
        ...prev,
        arbitrator2: prev.arbitrator2 === value ? "" : prev.arbitrator2,
        presidingArbitrator:
          prev.presidingArbitrator === value ? "" : prev.presidingArbitrator,
      }));
      setSearch2("");
      setSearchPresiding("");
    } else if (field === "arbitrator2") {
      onUpdateArbitrators((prev) => ({
        ...prev,
        presidingArbitrator:
          prev.presidingArbitrator === value ? "" : prev.presidingArbitrator,
      }));
      setSearchPresiding("");
    }
  };

  const selectArbitrator = (
    field,
    arbitrator,
    searchSetter,
    dropdownSetter
  ) => {
    handleChange(field, arbitrator.name);
    searchSetter(arbitrator.name);
    dropdownSetter(false);
  };

  const filteredArbitrators1 = availableArbitrators.arbitrator1.filter(
    (arbitrator) =>
      arbitrator.name.toLowerCase().includes(search1.toLowerCase()) ||
      arbitrator.specialization?.some((spec) =>
        spec.toLowerCase().includes(search1.toLowerCase())
      )
  );

  const filteredArbitrators2 = availableArbitrators.arbitrator2.filter(
    (arbitrator) =>
      arbitrator.name.toLowerCase().includes(search2.toLowerCase()) ||
      arbitrator.specialization?.some((spec) =>
        spec.toLowerCase().includes(search2.toLowerCase())
      )
  );

  const filteredArbitratorsPresiding =
    availableArbitrators.presidingArbitrator.filter(
      (arbitrator) =>
        arbitrator.name.toLowerCase().includes(searchPresiding.toLowerCase()) ||
        arbitrator.specialization?.some((spec) =>
          spec.toLowerCase().includes(searchPresiding.toLowerCase())
        )
    );

  return (
    <div className="mb-6">
      <h2 className="text-xl font-semibold mb-4">Arbitrators Information</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Arbitrator 1 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Arbitrator 1
          </label>
          <div className="relative">
            <input
              type="text"
              value={search1}
              onChange={(e) => setSearch1(e.target.value)}
              onFocus={() => setShowDropdown1(true)}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              placeholder="Search arbitrator..."
              required
            />
            {showDropdown1 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                {filteredArbitrators1.length === 0 ? (
                  <div className="p-2 text-gray-500 text-center">
                    No available arbitrators
                  </div>
                ) : (
                  filteredArbitrators1.map((arbitrator, index) => (
                    <div
                      key={arbitrator._id || index}
                      className="p-2 hover:bg-gray-100 cursor-pointer"
                      onClick={() =>
                        selectArbitrator(
                          "arbitrator1",
                          arbitrator,
                          setSearch1,
                          setShowDropdown1
                        )
                      }
                    >
                      <div className="font-medium">{arbitrator.name}</div>
                      <div className="text-sm text-gray-600">
                        {arbitrator.email && (
                          <div>Email: {arbitrator.email}</div>
                        )}
                        {arbitrator.specialization?.length > 0 && (
                          <div>
                            Specialization:{" "}
                            {arbitrator.specialization.join(", ")}
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
          {arbitrators.arbitrator1 && (
            <div className="text-xs text-green-600 mt-1">
              Selected: {arbitrators.arbitrator1}
            </div>
          )}
        </div>

        {/* Arbitrator 2 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Arbitrator 2
          </label>
          <div className="relative">
            <input
              type="text"
              value={search2}
              onChange={(e) => setSearch2(e.target.value)}
              onFocus={() => setShowDropdown2(true)}
              className={`w-full border rounded-md px-3 py-2 ${
                !arbitrators.arbitrator1
                  ? "border-gray-300 bg-gray-100 cursor-not-allowed"
                  : "border-gray-300"
              }`}
              placeholder={
                !arbitrators.arbitrator1
                  ? "Select Arbitrator 1 first"
                  : "Search arbitrator..."
              }
              disabled={!arbitrators.arbitrator1}
              required
            />
            {showDropdown2 && arbitrators.arbitrator1 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                {filteredArbitrators2.length === 0 ? (
                  <div className="p-2 text-gray-500 text-center">
                    No available arbitrators
                  </div>
                ) : (
                  filteredArbitrators2.map((arbitrator, index) => (
                    <div
                      key={arbitrator._id || index}
                      className="p-2 hover:bg-gray-100 cursor-pointer"
                      onClick={() =>
                        selectArbitrator(
                          "arbitrator2",
                          arbitrator,
                          setSearch2,
                          setShowDropdown2
                        )
                      }
                    >
                      <div className="font-medium">{arbitrator.name}</div>
                      <div className="text-sm text-gray-600">
                        {arbitrator.email && (
                          <div>Email: {arbitrator.email}</div>
                        )}
                        {arbitrator.specialization?.length > 0 && (
                          <div>
                            Specialization:{" "}
                            {arbitrator.specialization.join(", ")}
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
          {!arbitrators.arbitrator1 && (
            <div className="text-xs text-gray-500 mt-1">
              Please select Arbitrator 1 first
            </div>
          )}
          {arbitrators.arbitrator2 && (
            <div className="text-xs text-green-600 mt-1">
              Selected: {arbitrators.arbitrator2}
            </div>
          )}
        </div>

        {/* Presiding Arbitrator */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Presiding Arbitrator
          </label>
          <div className="relative">
            <input
              type="text"
              value={searchPresiding}
              onChange={(e) => setSearchPresiding(e.target.value)}
              onFocus={() => setShowDropdownPresiding(true)}
              className={`w-full border rounded-md px-3 py-2 ${
                !arbitrators.arbitrator1 || !arbitrators.arbitrator2
                  ? "border-gray-300 bg-gray-100 cursor-not-allowed"
                  : "border-gray-300"
              }`}
              placeholder={
                !arbitrators.arbitrator1 || !arbitrators.arbitrator2
                  ? "Select both arbitrators first"
                  : "Search presiding arbitrator..."
              }
              disabled={!arbitrators.arbitrator1 || !arbitrators.arbitrator2}
              required
            />
            {showDropdownPresiding &&
              arbitrators.arbitrator1 &&
              arbitrators.arbitrator2 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                  {filteredArbitratorsPresiding.length === 0 ? (
                    <div className="p-2 text-gray-500 text-center">
                      No available arbitrators
                    </div>
                  ) : (
                    filteredArbitratorsPresiding.map((arbitrator, index) => (
                      <div
                        key={arbitrator._id || index}
                        className="p-2 hover:bg-gray-100 cursor-pointer"
                        onClick={() =>
                          selectArbitrator(
                            "presidingArbitrator",
                            arbitrator,
                            setSearchPresiding,
                            setShowDropdownPresiding
                          )
                        }
                      >
                        <div className="font-medium">{arbitrator.name}</div>
                        <div className="text-sm text-gray-600">
                          {arbitrator.email && (
                            <div>Email: {arbitrator.email}</div>
                          )}
                          {arbitrator.specialization?.length > 0 && (
                            <div>
                              Specialization:{" "}
                              {arbitrator.specialization.join(", ")}
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
          </div>
          {(!arbitrators.arbitrator1 || !arbitrators.arbitrator2) && (
            <div className="text-xs text-gray-500 mt-1">
              Please select both Arbitrator 1 and 2 first
            </div>
          )}
          {arbitrators.presidingArbitrator && (
            <div className="text-xs text-green-600 mt-1">
              Selected: {arbitrators.presidingArbitrator}
            </div>
          )}
        </div>
      </div>

      {/* Selection Summary */}
      {(arbitrators.arbitrator1 ||
        arbitrators.arbitrator2 ||
        arbitrators.presidingArbitrator) && (
        <div className="mt-4 p-3 bg-blue-50 rounded-md">
          <h4 className="font-medium text-blue-800 mb-2">
            Selected Arbitrators:
          </h4>
          <div className="text-sm text-blue-700">
            {arbitrators.arbitrator1 && (
              <div>• Arbitrator 1: {arbitrators.arbitrator1}</div>
            )}
            {arbitrators.arbitrator2 && (
              <div>• Arbitrator 2: {arbitrators.arbitrator2}</div>
            )}
            {arbitrators.presidingArbitrator && (
              <div>
                • Presiding Arbitrator: {arbitrators.presidingArbitrator}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ArbitratorsInformation;
