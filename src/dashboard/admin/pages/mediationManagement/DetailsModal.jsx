const DetailsModal = ({ mediation, onClose, formatDate }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-gray-800">
                            Mediation Case Details
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
                                        {mediation.caseTitle}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-sm text-gray-500">
                                        Case ID
                                    </label>
                                    <p className="font-medium text-gray-800">
                                        {mediation.caseId || mediation._id}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-sm text-gray-500">
                                        Mediation ID
                                    </label>
                                    <p className="font-medium text-gray-800">
                                        {mediation.mediationId}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-sm text-gray-500">
                                        Category
                                    </label>
                                    <p className="font-medium text-gray-800">
                                        {mediation.caseCategory}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-sm text-gray-500">
                                        Dispute Nature
                                    </label>
                                    <p className="font-medium text-gray-800">
                                        {mediation.disputeNature}
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
                                        ${mediation.suitValue}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-sm text-gray-500">
                                        Processing Fee
                                    </label>
                                    <p className="font-medium text-gray-800">
                                        ${mediation.processingFee}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-sm text-gray-500">
                                        Total Cost
                                    </label>
                                    <p className="font-medium text-gray-800">
                                        ${mediation.totalCost}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-sm text-gray-500">
                                        Payment Status
                                    </label>
                                    <p className={`font-medium ${
                                        mediation.payment_status 
                                            ? "text-green-600" 
                                            : "text-red-600"
                                    }`}>
                                        {mediation.payment_status ? "Paid" : "Unpaid"}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Arbitrators Information */}
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold mb-3 text-gray-800">
                            Arbitrators
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Presiding Arbitrator */}
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h4 className="font-semibold text-blue-700 mb-2">
                                    Presiding Arbitrator
                                </h4>
                                <div className="space-y-2">
                                    <p className="font-medium text-gray-800">
                                        {mediation.presidingArbitrator || "Not assigned"}
                                    </p>
                                    {mediation.presidingArbitratorEmail && (
                                        <p className="text-sm text-gray-600">
                                            {mediation.presidingArbitratorEmail}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Arbitrator 1 */}
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h4 className="font-semibold text-gray-700 mb-2">
                                    Arbitrator 1
                                </h4>
                                <div className="space-y-2">
                                    <p className="font-medium text-gray-800">
                                        {mediation.arbitrator1 || "Not assigned"}
                                    </p>
                                    {mediation.arbitrator1Email && (
                                        <p className="text-sm text-gray-600">
                                            {mediation.arbitrator1Email}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Arbitrator 2 */}
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h4 className="font-semibold text-gray-700 mb-2">
                                    Arbitrator 2
                                </h4>
                                <div className="space-y-2">
                                    <p className="font-medium text-gray-800">
                                        {mediation.arbitrator2 || "Not assigned"}
                                    </p>
                                    {mediation.arbitrator2Email && (
                                        <p className="text-sm text-gray-600">
                                            {mediation.arbitrator2Email}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Justifi Information */}
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold mb-3 text-gray-800">
                            Justifi Representative
                        </h3>
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm text-gray-500">
                                        Name
                                    </label>
                                    <p className="font-medium text-gray-800">
                                        {mediation.justifiName || "Not assigned"}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-sm text-gray-500">
                                        Designation
                                    </label>
                                    <p className="font-medium text-gray-800">
                                        {mediation.justifiDesignation || "Not assigned"}
                                    </p>
                                </div>
                                {mediation.justifiEmail && (
                                    <div className="md:col-span-2">
                                        <label className="text-sm text-gray-500">
                                            Email
                                        </label>
                                        <p className="font-medium text-gray-800">
                                            {mediation.justifiEmail}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Parties Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        {/* Plaintiffs */}
                        <div>
                            <h3 className="text-lg font-semibold mb-3 text-gray-800">
                                Plaintiff(s)
                            </h3>
                            {mediation.plaintiffs?.map((plaintiff, index) => (
                                <div
                                    key={plaintiff.id || index}
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
                            {(!mediation.plaintiffs || mediation.plaintiffs.length === 0) && (
                                <p className="text-gray-500 italic">No plaintiff information available</p>
                            )}
                        </div>

                        {/* Defendants */}
                        <div>
                            <h3 className="text-lg font-semibold mb-3 text-gray-800">
                                Defendant(s)
                            </h3>
                            {mediation.defendants?.map((defendant, index) => (
                                <div
                                    key={defendant.id || index}
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
                            {(!mediation.defendants || mediation.defendants.length === 0) && (
                                <p className="text-gray-500 italic">No defendant information available</p>
                            )}
                        </div>
                    </div>

                    {/* Additional Information */}
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold mb-3 text-gray-800">
                            Additional Information
                        </h3>
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="text-sm text-gray-500">
                                        Agreement Date
                                    </label>
                                    <p className="font-medium text-gray-800">
                                        {mediation.agreementDate ? formatDate(mediation.agreementDate) : "Not set"}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-sm text-gray-500">
                                        Compliance Days
                                    </label>
                                    <p className="font-medium text-gray-800">
                                        {mediation.complianceDays || "Not specified"}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-sm text-gray-500">
                                        Sittings
                                    </label>
                                    <p className="font-medium text-gray-800">
                                        {mediation.sittings || "Not specified"}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-sm text-gray-500">
                                        Status
                                    </label>
                                    <p className={`font-medium ${
                                        mediation.mediation_status === "completed" 
                                            ? "text-green-600" 
                                            : mediation.mediation_status === "pending"
                                            ? "text-yellow-600"
                                            : "text-blue-600"
                                    }`}>
                                        {mediation.mediation_status || "pending"}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-sm text-gray-500">
                                        Submission Date
                                    </label>
                                    <p className="font-medium text-gray-800">
                                        {formatDate(mediation.submissionDate)}
                                    </p>
                                </div>
                            </div>
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