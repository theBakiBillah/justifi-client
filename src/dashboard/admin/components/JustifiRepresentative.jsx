import { useState } from "react";

const JustifiRepresentative = ({ justifiRep, onUpdateJustifiRep }) => {
  const [showJustifiDropdown, setShowJustifiDropdown] = useState(false);
  const [justifiSearch, setJustifiSearch] = useState("");

  const representatives = [
    {
      name: "Jennifer Martinez",
      designation: "Senior Legal Counsel",
      email: "jennifer.martinez@justifi.com",
    },
    {
      name: "David Kim",
      designation: "Head of Mediation Services",
      email: "david.kim@justifi.com",
    },
    {
      name: "Amanda Wilson",
      designation: "Legal Operations Manager",
      email: "amanda.wilson@justifi.com",
    },
    {
      name: "James Thompson",
      designation: "Director of Dispute Resolution",
      email: "james.thompson@justifi.com",
    },
  ];

  const handleChange = (field, value) => {
    onUpdateJustifiRep((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const selectRepresentative = (rep) => {
    handleChange("name", rep.name);
    handleChange("designation", rep.designation);
    handleChange("email", rep.email);
    setJustifiSearch(rep.name);
    setShowJustifiDropdown(false);
  };

  const filteredRepresentatives = representatives.filter(
    (rep) =>
      rep.name.toLowerCase().includes(justifiSearch.toLowerCase()) ||
      rep.designation.toLowerCase().includes(justifiSearch.toLowerCase())
  );

  return (
    <>
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4">JustiFi Representative</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name
            </label>
            <div className="relative">
              <input
                type="text"
                value={justifiSearch}
                onChange={(e) => setJustifiSearch(e.target.value)}
                onFocus={() => setShowJustifiDropdown(true)}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                placeholder="Type to search representatives..."
                required
              />
              {showJustifiDropdown && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                  {filteredRepresentatives.map((rep, index) => (
                    <div
                      key={index}
                      className="p-2 hover:bg-gray-100 cursor-pointer"
                      onClick={() => selectRepresentative(rep)}
                    >
                      <div className="font-medium">{rep.name}</div>
                      <div className="text-sm text-gray-600">
                        {rep.designation}
                      </div>
                      <div className="text-xs text-gray-500">{rep.email}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Designation
            </label>
            <input
              type="text"
              value={justifiRep.designation}
              className="w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-100"
              readOnly
            />
          </div>
        </div>
        {justifiRep.email && (
          <div className="mt-2 text-sm text-green-600">
            Email: {justifiRep.email}
          </div>
        )}
      </div>
    </>
  );
};

export default JustifiRepresentative;
