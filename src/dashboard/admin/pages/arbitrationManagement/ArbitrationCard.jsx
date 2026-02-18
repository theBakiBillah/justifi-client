const ArbitrationCard = ({
    arbitration,
    onViewDetails,
    onCreateSession,
    formatDate,
}) => {
    const getStatusBadge = (status) => {
        const statusStyles = {
            Pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
            "In Progress": "bg-blue-100 text-blue-800 border-blue-200",
            Ongoing: "bg-blue-100 text-blue-800 border-blue-200",
            Completed: "bg-green-100 text-green-800 border-green-200",
            Cancelled: "bg-red-100 text-red-800 border-red-200",
            Rejected: "bg-red-100 text-red-800 border-red-200",
        };
        return (
            <span
                className={`px-3 py-1 rounded-full text-sm font-medium border ${
                    statusStyles[status] || "bg-gray-100"
                }`}
            >
                {status}
            </span>
        );
    };

    const getPaymentBadge = (status) => {
        return status ? (
            <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 border border-green-200">
                Paid
            </span>
        ) : (
            <span className="px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800 border border-red-200">
                Unpaid
            </span>
        );
    };

    return (
        <div className="bg-white rounded-lg shadow border border-gray-200 hover:shadow-md transition-shadow duration-200 flex flex-col justify-between">
            {/* Card Header */}
            <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-semibold text-gray-800 line-clamp-2">
                        {arbitration.caseTitle}
                    </h3>
                    {getStatusBadge(arbitration.arbitration_status)}
                </div>
                <div className="flex items-center text-sm text-gray-500">
                    <span className="mr-4">
                        📅 {formatDate(arbitration.submissionDate)}
                    </span>
                    {getPaymentBadge(arbitration.payment_status)}
                </div>
            </div>

            <div className="border-t border-gray-200">
                <div className="p-4">
                    <div className="space-y-3">
                        <div>
                            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                Category
                            </label>
                            <p className="text-sm font-medium text-gray-800">
                                {arbitration.caseCategory}
                            </p>
                        </div>

                        <div>
                            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                Dispute Nature
                            </label>
                            <p className="text-sm text-gray-700 line-clamp-2">
                                {arbitration.disputeNature}
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                    Suit Value
                                </label>
                                <p className="text-sm font-semibold text-gray-800">
                                    ${arbitration.suitValue}
                                </p>
                            </div>
                            <div>
                                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                    Fee
                                </label>
                                <p className="text-sm font-semibold text-gray-800">
                                    ${arbitration.processingFee}
                                </p>
                            </div>
                        </div>

                        {/* Parties Summary */}
                        <div className="pt-2 border-t border-gray-100">
                            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 block">
                                Parties
                            </label>
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">
                                        Plaintiff:
                                    </span>
                                    <span className="font-medium text-gray-800">
                                        {Object.values(
                                            arbitration.plaintiffs || {}
                                        )[0]?.name || "N/A"}
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">
                                        Defendant:
                                    </span>
                                    <span className="font-medium text-gray-800">
                                        {Object.values(
                                            arbitration.defendants || {}
                                        )[0]?.name || "N/A"}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Card Footer */}
                <div className="p-4 border-t border-gray-200 bg-gray-50 rounded-b-lg">
                    <div className="flex space-x-2">
                        <button
                            onClick={() => onViewDetails(arbitration)}
                            className="flex-1 px-3 py-2 text-sm font-medium text-blue-700 bg-blue-100 hover:bg-blue-200 rounded-md transition-colors"
                        >
                            View Details
                        </button>
                        {!arbitration.sessionData && (
                            <button
                                onClick={() => onCreateSession(arbitration)}
                                className="flex-1 px-3 py-2 text-sm font-medium text-green-700 bg-green-100 hover:bg-green-200 rounded-md transition-colors"
                            >
                                Create Session
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ArbitrationCard;
