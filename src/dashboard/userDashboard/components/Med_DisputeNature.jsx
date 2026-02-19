import { FaGavel, FaDollarSign } from "react-icons/fa";

const Med_DisputeNature = ({ mediation }) => {
  if (!mediation) return null;

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-100">
      <div className="flex items-center mb-6">
        <div className="w-1 h-8 bg-indigo-600 rounded-full mr-3"></div>
        <h2 className="text-2xl font-bold text-gray-900">
          <FaGavel className="inline mr-3 text-indigo-600" />
          Nature of Dispute &amp; Suit Details
        </h2>
      </div>

      {/* Nature of Dispute */}
      <div className="bg-indigo-50 border-2 border-indigo-100 rounded-xl p-6 mb-6">
        <h3 className="text-lg font-semibold text-indigo-800 mb-3">
          Dispute Description
        </h3>
        <p className="text-lg text-gray-800 leading-relaxed">
          {/* ✅ FIX: `disputeNature` is the correct field from DB (not `natureOfDispute`) */}
          {mediation?.disputeNature ||
            "No dispute nature description provided."}
        </p>
      </div>

      {/* Suit Value */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-green-50 border border-green-200 rounded-xl p-5">
          <div className="flex items-center mb-2">
            <FaDollarSign className="text-green-600 mr-2 text-xl" />
            <h4 className="font-semibold text-gray-900">Suit Value</h4>
          </div>
          <p className="text-2xl font-bold text-green-700">
            {mediation?.suitValue
              ? `BDT ${parseInt(mediation.suitValue).toLocaleString()}`
              : "Not specified"}
          </p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
          <div className="flex items-center mb-2">
            <FaDollarSign className="text-blue-600 mr-2 text-xl" />
            <h4 className="font-semibold text-gray-900">Processing Fee</h4>
          </div>
          <p className="text-2xl font-bold text-blue-700">
            {mediation?.processingFee
              ? `BDT ${parseInt(mediation.processingFee).toLocaleString()}`
              : "Not specified"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Med_DisputeNature;
