const DetailsModal = ({ arbitration, onClose, formatDate }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-gray-800">
                            Arbitration Case Details
                        </h2>
                        <button
                            onClick={onClose}
                            className="text-gray-500 hover:text-gray-700 text-2xl"
                        >
                            ✕
                        </button>
                    </div>

                    {/* Case Overview */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <h3 className="text-lg font-semibold mb-3 text-gray-800">
                                Case Information
                            </h3>
                            <div className="space-y-3">
                                <div>
                                    <label className="text-sm text-gray-500">
                                        Case Title
                                    </label>
                                    <p className="font-medium text-gray-800">
                                        {arbitration.caseTitle}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-sm text-gray-500">
                                        Category
                                    </label>
                                    <p className="font-medium text-gray-800">
                                        {arbitration.caseCategory}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-sm text-gray-500">
                                        Dispute Nature
                                    </label>
                                    <p className="font-medium text-gray-800">
                                        {arbitration.disputeNature}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <h3 className="text-lg font-semibold mb-3 text-gray-800">
                                Financial Information
                            </h3>
                            <div className="space-y-3">
                                <div>
                                    <label className="text-sm text-gray-500">
                                        Suit Value
                                    </label>
                                    <p className="font-medium text-gray-800">
                                        ${arbitration.suitValue}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-sm text-gray-500">
                                        Processing Fee
                                    </label>
                                    <p className="font-medium text-gray-800">
                                        ${arbitration.processingFee}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-sm text-gray-500">
                                        Submission Date
                                    </label>
                                    <p className="font-medium text-gray-800">
                                        {formatDate(arbitration.submissionDate)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Parties Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Plaintiffs */}
                        <div>
                            <h3 className="text-lg font-semibold mb-3 text-gray-800">
                                Plaintiff(s)
                            </h3>
                            {Object.values(arbitration.plaintiffs || {}).map((plaintiff, index) => (
                                <div
                                    key={index}
                                    className="bg-gray-50 p-4 rounded-lg mb-3"
                                >
                                    <div className="space-y-3">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-sm text-gray-500">
                                                    Name
                                                </label>
                                                <p className="font-medium text-gray-800">
                                                    {plaintiff.name}
                                                </p>
                                            </div>
                                            <div>
                                                <label className="text-sm text-gray-500">
                                                    Parents Name
                                                </label>
                                                <p className="font-medium text-gray-800">
                                                    {plaintiff.parentsName}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-sm text-gray-500">
                                                    Email
                                                </label>
                                                <p className="font-medium text-gray-800">
                                                    {plaintiff.email}
                                                </p>
                                            </div>
                                            <div>
                                                <label className="text-sm text-gray-500">
                                                    Phone
                                                </label>
                                                <p className="font-medium text-gray-800">
                                                    {plaintiff.phone}
                                                </p>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-sm text-gray-500">
                                                Address
                                            </label>
                                            <p className="font-medium text-gray-800">
                                                {plaintiff.address}
                                            </p>
                                        </div>
                                        <div>
                                            <label className="text-sm text-gray-500">
                                                Occupation
                                            </label>
                                            <p className="font-medium text-gray-800">
                                                {plaintiff.occupation}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Defendants */}
                        <div>
                            <h3 className="text-lg font-semibold mb-3 text-gray-800">
                                Defendant(s)
                            </h3>
                            {Object.values(arbitration.defendants || {}).map((defendant, index) => (
                                <div
                                    key={index}
                                    className="bg-gray-50 p-4 rounded-lg mb-3"
                                >
                                    <div className="space-y-3">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-sm text-gray-500">
                                                    Name
                                                </label>
                                                <p className="font-medium text-gray-800">
                                                    {defendant.name}
                                                </p>
                                            </div>
                                            <div>
                                                <label className="text-sm text-gray-500">
                                                    Parents Name
                                                </label>
                                                <p className="font-medium text-gray-800">
                                                    {defendant.parentsName}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-sm text-gray-500">
                                                    Email
                                                </label>
                                                <p className="font-medium text-gray-800">
                                                    {defendant.email}
                                                </p>
                                            </div>
                                            <div>
                                                <label className="text-sm text-gray-500">
                                                    Phone
                                                </label>
                                                <p className="font-medium text-gray-800">
                                                    {defendant.phone}
                                                </p>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-sm text-gray-500">
                                                Address
                                            </label>
                                            <p className="font-medium text-gray-800">
                                                {defendant.address}
                                            </p>
                                        </div>
                                        <div>
                                            <label className="text-sm text-gray-500">
                                                Occupation
                                            </label>
                                            <p className="font-medium text-gray-800">
                                                {defendant.occupation}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex justify-end mt-6">
                        <button
                            onClick={onClose}
                            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DetailsModal;