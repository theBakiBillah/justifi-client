import { FaGavel } from "react-icons/fa";

const Arb_DisputeNature = ({ arbitration }) => {
    return (
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-100">
            <div className="flex items-center mb-6">
                <div className="w-1 h-8 bg-indigo-600 rounded-full mr-3"></div>
                <h2 className="text-2xl font-bold text-gray-900">
                    <FaGavel className="inline mr-3 text-indigo-600" />
                    Nature of Dispute
                </h2>
            </div>
            <div className="bg-indigo-50 border-2 border-indigo-100 rounded-xl p-6">
                <p className="text-lg text-gray-800 leading-relaxed">
                    {arbitration.disputeNature || 'No dispute nature description provided.'}
                </p>
            </div>
        </div>
    );
};

export default Arb_DisputeNature;