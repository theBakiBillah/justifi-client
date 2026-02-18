import { FaAward, FaFilePdf, FaDownload, FaEye, FaCheckCircle, FaFileAlt } from "react-icons/fa";

const Arb_FinalVerdictSection = ({ arbitration }) => {
    const isCaseCompleted = arbitration.arbitration_status?.toLowerCase() === 'completed';

    // Sample final verdict data
    const finalVerdictData = {
        summary: "After careful consideration of all evidence and arguments presented by both parties, the arbitration panel has reached a unanimous decision. The defendant is ordered to pay the plaintiff the amount of BDT 1,250,000 as compensation for breach of contract, along with legal costs of BDT 75,000. The payment must be made within 30 days from the date of this award.",
        pdfUrl: "/documents/final-award.pdf",
        date: "2024-12-15T14:00:00",
        status: "completed"
    };

    const getStatusText = (status) => {
        switch (status?.toLowerCase()) {
            case 'pending': return 'Pending Review';
            case 'ongoing': return 'Proceedings Ongoing';
            case 'completed': return 'Case Concluded';
            case 'cancelled': return 'Case Cancelled';
            default: return status || 'Unknown';
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center mb-8">
                <div className="w-1 h-8 bg-gold-600 rounded-full mr-3"></div>
                <h2 className="text-2xl font-bold text-gray-900">
                    <FaAward className="inline mr-3 text-yellow-600" />
                    Final Verdict / Final Reward
                </h2>
            </div>

            {isCaseCompleted ? (
                <div className="space-y-6">
                    {/* Final Reward Summary */}
                    <div className="bg-gradient-to-r from-yellow-50 to-amber-50 border-2 border-yellow-200 rounded-xl p-6">
                        <h3 className="text-xl font-semibold text-gray-900 mb-4">Final Award Summary</h3>
                        <p className="text-gray-700 leading-relaxed">
                            {finalVerdictData.summary}
                        </p>
                    </div>

                    {/* Final Reward Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-gray-50 rounded-lg p-6">
                            <h4 className="font-semibold text-gray-900 mb-4">Award Details</h4>
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Award Date & Time:</span>
                                    <span className="font-semibold text-gray-900">
                                        {new Date(finalVerdictData.date).toLocaleDateString()} at {new Date(finalVerdictData.date).toLocaleTimeString()}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Case Status:</span>
                                    <span className="font-semibold text-green-600">Completed</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Award Type:</span>
                                    <span className="font-semibold text-gray-900">Final Binding Award</span>
                                </div>
                            </div>
                        </div>

                        {/* Final Reward PDF */}
                        <div className="bg-blue-50 rounded-lg p-6">
                            <h4 className="font-semibold text-gray-900 mb-4">Final Award Document</h4>
                            <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-blue-200">
                                <div className="flex items-center">
                                    <FaFilePdf className="text-red-500 text-2xl mr-3" />
                                    <div>
                                        <p className="font-semibold text-gray-900">Final_Award_Document.pdf</p>
                                        <p className="text-sm text-gray-600">Official arbitration award</p>
                                    </div>
                                </div>
                                <div className="flex space-x-2">
                                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center">
                                        <FaEye className="mr-2" />
                                        View
                                    </button>
                                    <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center">
                                        <FaDownload className="mr-2" />
                                        Download
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Important Notice */}
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-center">
                            <FaCheckCircle className="text-green-600 mr-3 text-xl" />
                            <div>
                                <p className="font-semibold text-green-800">Case Successfully Concluded</p>
                                <p className="text-green-700 text-sm mt-1">
                                    This arbitration case has been successfully completed. The final award is binding and enforceable.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="text-center py-12">
                    <div className="bg-gray-50 rounded-2xl p-8 max-w-md mx-auto">
                        <FaFileAlt className="mx-auto text-6xl text-gray-300 mb-6" />
                        <h3 className="text-xl font-semibold text-gray-700 mb-2">Final Award Pending</h3>
                        <p className="text-gray-500 mb-6">
                            The final verdict and reward will be provided when the arbitration process is successfully completed.
                        </p>
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <p className="text-blue-700 text-sm">
                                <strong>Current Status:</strong> {getStatusText(arbitration.arbitration_status)}
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Arb_FinalVerdictSection;