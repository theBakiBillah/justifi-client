import {
  FaBalanceScale,
  FaEnvelope,
  FaGavel,
  FaMapMarkerAlt,
  FaPhone,
  FaUserCircle,
  FaUserShield,
  FaUserTie,
} from "react-icons/fa";

const Med_PartiesInformation = ({ mediation = {}, currentUser }) => {
  // ---------- SAFE DATA EXTRACTION ----------
  const getPartiesArray = (parties) => {
    if (!parties) return [];
    if (Array.isArray(parties)) {
      return parties.filter((p) => p && typeof p === "object");
    }
    if (typeof parties === "object") {
      return Object.values(parties).filter((p) => p && typeof p === "object");
    }
    return [];
  };

  const plaintiffs = getPartiesArray(mediation?.plaintiffs);
  const defendants = getPartiesArray(mediation?.defendants);

  // ---------- PARTY CARD ----------
  const PartyCard = ({ party, type }) => {
    const isPlaintiff = type === "plaintiff";
    return (
      <div
        className={`bg-gray-50 rounded-lg p-5 border-l-4 shadow-sm ${
          isPlaintiff ? "border-blue-600" : "border-red-500"
        }`}
      >
        <div className="flex items-start gap-4">
          <div
            className={`w-14 h-14 flex items-center justify-center rounded-lg flex-shrink-0 ${
              isPlaintiff
                ? "bg-blue-100 text-blue-600"
                : "bg-red-100 text-red-600"
            }`}
          >
            {isPlaintiff ? (
              <FaUserTie className="text-xl" />
            ) : (
              <FaUserShield className="text-xl" />
            )}
          </div>

          <div className="flex-1 space-y-1">
            <h3 className="font-bold text-gray-900 text-base">
              {party?.name || "Unknown"}
            </h3>

            {party?.parentsName && (
              <p className="text-sm text-gray-600">
                <FaUserCircle className="inline mr-2 text-gray-400" />
                {party.parentsName}
              </p>
            )}

            <p className="text-sm text-gray-600">
              <FaEnvelope className="inline mr-2 text-gray-400" />
              {party?.email || "No email"}
            </p>

            <p className="text-sm text-gray-600">
              <FaPhone className="inline mr-2 text-gray-400" />
              {party?.phone || "No phone"}
            </p>

            <p className="text-sm text-gray-600">
              <FaMapMarkerAlt className="inline mr-2 text-gray-400" />
              {party?.address || "Address not specified"}
            </p>

            {party?.occupation && (
              <p className="text-sm text-gray-700">
                <span className="font-medium">Occupation:</span>{" "}
                {party.occupation}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-100">
      <div className="flex items-center mb-6">
        <div className="w-1 h-8 bg-blue-600 rounded-full mr-3"></div>
        <h2 className="text-2xl font-bold text-gray-900">
          <FaBalanceScale className="inline mr-3 text-blue-600" />
          Parties Information
        </h2>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Plaintiffs */}
        <div className="bg-white rounded-xl p-6 shadow-md border border-blue-100">
          <h3 className="text-lg font-bold text-blue-700 mb-4">
            <FaBalanceScale className="inline mr-2" />
            Plaintiffs / Claimants ({plaintiffs.length})
          </h3>

          <div className="space-y-4">
            {plaintiffs.length > 0 ? (
              plaintiffs.map((party, index) => (
                <PartyCard
                  key={index}
                  party={party}
                  type="plaintiff"
                  index={index}
                />
              ))
            ) : (
              <p className="text-gray-500 text-sm italic">
                No plaintiffs information available.
              </p>
            )}
          </div>
        </div>

        {/* Defendants */}
        <div className="bg-white rounded-xl p-6 shadow-md border border-red-100">
          <h3 className="text-lg font-bold text-red-700 mb-4">
            <FaGavel className="inline mr-2" />
            Defendants / Respondents ({defendants.length})
          </h3>

          <div className="space-y-4">
            {defendants.length > 0 ? (
              defendants.map((party, index) => (
                <PartyCard
                  key={index}
                  party={party}
                  type="defendant"
                  index={index}
                />
              ))
            ) : (
              <p className="text-gray-500 text-sm italic">
                No defendants information available.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Med_PartiesInformation;
